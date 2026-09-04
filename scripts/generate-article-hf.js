#!/usr/bin/env node

/**
 * Generate Article with local Hugging Face GGUF inference
 * Uses llama.cpp via scripts/hf_inference.py - no API key, no Ollama.
 * Model is discovered fresh from Hugging Face Hub by scripts/model_resolver.py,
 * so the blog keeps up with current-generation open models.
 * NO FALLBACK - Only real AI content or failure as blog post
 */

const fs = require('fs');
const path = require('path');
const HfInference = require('./hf-inference');

const TOPIC_FILE = path.join(__dirname, '..', 'selected-topic.json');
const ARTICLES_DIR = path.join(__dirname, '..', 'articles');

const ARTICLE_THEMES = [
  'minimalist-clean', 'neon-nights', 'paper-ink', 'ocean-breeze', 'forest-calm',
  'sunset-vibes', 'matrix-code', 'cotton-candy', 'industrial', 'aurora'
];

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function generateDatePath() {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return path.join(year, month, day);
}

function generateTimestamp() {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}

function calculateReadingTime(wordCount) {
  return Math.ceil(wordCount / 200);
}

/**
 * Generate content with the local llama.cpp GGUF model
 */
async function generateWithHf(prompt) {
  const inference = new HfInference();

  const result = inference.generate(prompt, {
    temperature: 0.85,
    maxTokens: parseInt(process.env.LLAMA_MAX_TOKENS || '5200', 10),
    system: process.env.HF_SYSTEM ||
      'You are a world-class long-form blog writer. Follow the prompt exactly. ' +
      'Output ONLY the requested article HTML content, with no preamble, no commentary and no closing notes.'
  });

  if (!result.success) {
    throw new Error(result.error || 'Failed to generate content with GGUF model');
  }

  return result.content;
}

async function generateArticle() {
  // Load selected topic
  if (!fs.existsSync(TOPIC_FILE)) {
    throw new Error('No selected topic found. Run topic-selector.js first.');
  }

  const topicData = JSON.parse(fs.readFileSync(TOPIC_FILE, 'utf8'));
  console.log('📰 Generating article for topic:', topicData.topic);

  // Load and prepare prompt
  const PROMPT_FILE = path.join(__dirname, '..', 'prompts', 'article-generation.txt');
  let prompt = fs.existsSync(PROMPT_FILE)
    ? fs.readFileSync(PROMPT_FILE, 'utf8')
    : 'Write an article about {{TOPIC}}';

  // Replace placeholders
  const theme = ARTICLE_THEMES[Math.floor(Math.random() * ARTICLE_THEMES.length)];
  const now = new Date();

  prompt = prompt
    .replace('{{TOPIC}}', topicData.topic)
    .replace('{{ANGLE}}', topicData.angle || 'General exploration')
    .replace('{{TONE}}', topicData.tone || 'casual')
    .replace('{{GENRE}}', topicData.genre || 'Educational Essay')
    .replace('{{STYLE}}', topicData.writingStyle || 'Conversational')
    .replace('{{METHOD}}', topicData.storytellingMethod || 'Thematic Exploration')
    .replace('{{DEPTH}}', topicData.depthLevel || 'Intermediate')
    .replace('{{AUDIENCE}}', topicData.targetAudience || 'General Readers')
    .replace('{{WORD_COUNT}}', String(topicData.estimatedWords || 800))
    .replace('{{KEYWORDS}}', Array.isArray(topicData.keywords)
      ? topicData.keywords.join(', ')
      : topicData.keywords || 'technology')
    .replace('{{CONTENT_TYPE}}', topicData.type || 'article')
    .replace('{{THEME}}', theme);

  // Generate with the local GGUF model (NO FALLBACK)
  console.log('🤖 Generating with local HF GGUF model...');
  let content = await generateWithHf(prompt);

  // Clean up content - remove code fences if present
  content = content.replace(/^\s*```html\s*\n/i, '').replace(/^\s*```\s*\n/i, '').replace(/\n\s*```\s*$/i, '');

  // Ensure content has frontmatter (wrapped in HTML comments for .html files)
  const finalContent = !content.includes('---')
    ? `<!--
---
title: "${topicData.topic}"
date: "${now.toISOString()}"
theme: "${theme}"
topic: "${topicData.topic}"
wordCount: ${topicData.estimatedWords || 800}
readingTime: ${calculateReadingTime(topicData.estimatedWords || 800)}
excerpt: "AI-generated article about ${topicData.topic}"
contentType: "${topicData.type}"
generated: "hf-gguf"
---
-->

${content}`
    : content;

  // Create article file
  const datePath = generateDatePath();
  const timestamp = generateTimestamp();
  const slug = generateSlug(topicData.topic);
  const articleDir = path.join(ARTICLES_DIR, datePath);
  const articleFile = path.join(articleDir, `${timestamp}_${slug}.html`);

  // Ensure directory exists
  fs.mkdirSync(articleDir, { recursive: true });

  // Write article
  fs.writeFileSync(articleFile, finalContent);
  console.log('✅ Article created:', articleFile);

  // Clean up topic file
  if (fs.existsSync(TOPIC_FILE)) {
    fs.unlinkSync(TOPIC_FILE);
  }

  return { file: articleFile, theme };
}

// Main execution
async function main() {
  try {
    const result = await generateArticle();
    console.log('✅ Article generation complete:', result.file);
  } catch (error) {
    console.error('❌ Error generating article:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateArticle };
