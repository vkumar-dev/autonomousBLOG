#!/usr/bin/env node

/**
 * Build Article Index (v2 - Optimized)
 * Scans all articles and creates a JSON index for fast loading
 * Refactored to use shared utilities
 */

const fs = require('fs');
const path = require('path');
const { findMarkdownFiles, writeFile } = require('./utils/file-system');
const { extractFrontmatter, extractExcerpt } = require('./utils/frontmatter');

const ARTICLES_DIR = path.join(__dirname, '..', 'articles');
const INDEX_FILE = path.join(__dirname, '..', 'articles-index.json');

/**
 * Build article index from all markdown files
 * @returns {Object} Index data with articles and metadata
 */
function buildArticleIndex() {
  const articles = [];

  if (!fs.existsSync(ARTICLES_DIR)) {
    console.log('Articles directory does not exist yet');
    const emptyIndex = {
      articles: [],
      total: 0,
      lastBuilt: new Date().toISOString()
    };
    writeFile(INDEX_FILE, JSON.stringify(emptyIndex, null, 2));
    return emptyIndex;
  }

  // Find all markdown files
  const mdFiles = findMarkdownFiles(ARTICLES_DIR);
  console.log(`Found ${mdFiles.length} markdown files`);

  // Process each file
  for (const file of mdFiles) {
    try {
      const content = fs.readFileSync(file.filePath, 'utf8');
      const frontmatter = extractFrontmatter(content);

      if (!frontmatter || !frontmatter.title) {
        console.warn(`Skipping ${file.relativePath}: missing title`);
        continue;
      }

      articles.push({
        title: frontmatter.title,
        date: frontmatter.date || new Date().toISOString(),
        theme: frontmatter.theme || 'default',
        topic: frontmatter.topic || '',
        contentType: frontmatter.contentType || 'article',
        excerpt: extractExcerpt(content, frontmatter),
        readingTime: frontmatter.readingTime || 5,
        wordCount: frontmatter.wordCount || 0,
        keywords: Array.isArray(frontmatter.keywords) ? frontmatter.keywords : [],
        path: file.relativePath
      });
    } catch (error) {
      console.error(`Error processing ${file.relativePath}: ${error.message}`);
    }
  }

  // Sort by date descending
  articles.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });

  const index = {
    articles,
    total: articles.length,
    lastBuilt: new Date().toISOString()
  };

  // Write index file
  if (writeFile(INDEX_FILE, JSON.stringify(index, null, 2))) {
    console.log(`✅ Article index built: ${articles.length} articles`);
  } else {
    console.error('Failed to write index file');
    process.exit(1);
  }

  return index;
}

// Run if called directly
if (require.main === module) {
  try {
    buildArticleIndex();
  } catch (error) {
    console.error('Error building article index:', error.message);
    process.exit(1);
  }
}

module.exports = { buildArticleIndex };
