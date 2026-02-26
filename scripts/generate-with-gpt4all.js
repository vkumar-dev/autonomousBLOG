#!/usr/bin/env node

/**
 * GPT4All Local Inference Generator
 * Uses local lightweight models for real AI-generated content
 * No API keys needed - runs entirely locally
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const GPTALL_URL = process.env.GPTALL_URL || 'http://localhost:4891';
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

function calculateReadingTime(wordCount) {
  return Math.ceil(wordCount / 200);
}

/**
 * Call GPT4All for local inference
 */
async function callGPT4All(prompt) {
  try {
    console.log(`📡 Connecting to GPT4All at ${GPTALL_URL}...`);

    const response = await fetch(`${GPTALL_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 2048,
        temperature: 0.7,
        top_p: 0.9,
        stream: false
      }),
      timeout: 120000 // 2 minutes
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].text) {
      throw new Error('Invalid response from GPT4All');
    }

    console.log('✅ Content generated successfully');
    return data.choices[0].text;
  } catch (error) {
    console.error('❌ GPT4All generation failed:', error.message);
    throw error;
  }
}

/**
 * Generate article using GPT4All
 */
async function generateArticle() {
  if (!fs.existsSync(TOPIC_FILE)) {
    throw new Error('No selected topic found. Run topic-selector.js first.');
  }

  const topicData = JSON.parse(fs.readFileSync(TOPIC_FILE, 'utf8'));
  console.log('📰 Generating article for topic:', topicData.topic);

  const theme = ARTICLE_THEMES[Math.floor(Math.random() * ARTICLE_THEMES.length)];
  const now = new Date();

  // Build prompt for GPT4All
  const prompt = `Write a ${topicData.estimatedWords || 800} word article about "${topicData.topic}".

Style: ${topicData.tone || 'casual'}
Type: ${topicData.type || 'article'}
Angle: ${topicData.angle || 'General exploration'}
Keywords: ${Array.isArray(topicData.keywords) ? topicData.keywords.join(', ') : topicData.keywords || 'topic'}

The article should:
1. Have a clear title
2. Include an engaging introduction
3. Have 3-5 main sections with headers
4. Include practical insights
5. End with a conclusion

Start with the title (as # Title), then the content.`;

  // Call GPT4All
  let content;
  try {
    content = await callGPT4All(prompt);
  } catch (error) {
    console.error('❌ AI generation failed:', error.message);
    throw error;
  }

  // Ensure content has frontmatter
  if (!content.includes('---')) {
    content = `---
title: "${topicData.topic}"
date: "${now.toISOString()}"
theme: "${theme}"
topic: "${topicData.topic}"
wordCount: ${topicData.estimatedWords || 800}
readingTime: ${calculateReadingTime(topicData.estimatedWords || 800)}
excerpt: "An AI-generated article about ${topicData.topic}"
contentType: "${topicData.type}"
generated: "gpt4all"
---

${content}
`;
  }

  // Create article file
  const datePath = generateDatePath();
  const slug = generateSlug(topicData.topic);
  const articleDir = path.join(ARTICLES_DIR, datePath);
  const articleFile = path.join(articleDir, `${slug}.md`);

  // Ensure directory exists
  fs.mkdirSync(articleDir, { recursive: true });

  // Write article
  fs.writeFileSync(articleFile, content);
  console.log('✅ Article created:', articleFile);

  // Clean up topic file
  if (fs.existsSync(TOPIC_FILE)) {
    fs.unlinkSync(TOPIC_FILE);
  }

  // Rebuild caches
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
