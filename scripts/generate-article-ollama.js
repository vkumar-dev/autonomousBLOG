#!/usr/bin/env node

/**
 * Generate Article with Ollama
 * Uses local Ollama instance for keyless, offline inference
 * NO FALLBACK - Only real AI content or failure as blog post
 */

const fs = require('fs');
const path = require('path');
const OllamaInference = require('./ollama-inference');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral';
const TOPIC_FILE = path.join(__dirname, '..', 'selected-topic.json');
const ARTICLES_DIR = path.join(__dirname, '..', 'articles');
const PROMPT_FILE = path.join(__dirname, '..', 'prompts', 'article-generation.txt');

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
 * Call Ollama API for content generation
 */
async function callOllama(prompt, topicData) {
  const inference = new OllamaInference(OLLAMA_URL, OLLAMA_MODEL);
  
  const result = await inference.generate(prompt, {
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    numPredict: 1024, // Reduced from 2048 for faster generation
    verbose: true
  });

  if (!result.success) {
    throw new Error(result.error || 'Failed to generate content with Ollama');
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
    .replace('{{WORD_COUNT}}', String(topicData.estimatedWords || 800))
    .replace('{{KEYWORDS}}', Array.isArray(topicData.keywords)
      ? topicData.keywords.join(', ')
      : topicData.keywords || 'technology')
    .replace('{{CONTENT_TYPE}}', topicData.type || 'article')
    .replace('{{DATE}}', now.toISOString())
    .replace('{{THEME}}', theme);

  // Generate with Ollama (NO FALLBACK)
  console.log('🤖 Generating with Ollama...');
  const content = await callOllama(prompt, topicData);

  // Ensure content has frontmatter
  const finalContent = !content.includes('---') 
    ? `---
title: "${topicData.topic}"
date: "${now.toISOString()}"
theme: "${theme}"
topic: "${topicData.topic}"
wordCount: ${topicData.estimatedWords || 800}
readingTime: ${calculateReadingTime(topicData.estimatedWords || 800)}
excerpt: "AI-generated article about ${topicData.topic}"
contentType: "${topicData.type}"
generated: "ollama"
---

${content}`
    : content;

  // Create article file
  const datePath = generateDatePath();
  const timestamp = generateTimestamp();
  const slug = generateSlug(topicData.topic);
  const articleDir = path.join(ARTICLES_DIR, datePath);
  const articleFile = path.join(articleDir, `${timestamp}_${slug}.md`);

  // Ensure directory exists
  fs.mkdirSync(articleDir, { recursive: true });

  // Write article
  fs.writeFileSync(articleFile, finalContent);
  console.log('✅ Article created:', articleFile);

  // Clean up topic file
  if (fs.existsSync(TOPIC_FILE)) {
    fs.unlinkSync(TOPIC_FILE);
  }

  // Rebuild articles list and content cache
  const { buildArticlesList } = require('./build-articles-list');
  const { buildArticlesContent } = require('./build-articles-content');
  
  console.log('Rebuilding articles list and content cache...');
  buildArticlesList();
  buildArticlesContent();
  console.log('✅ Articles list and content cache updated');

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
