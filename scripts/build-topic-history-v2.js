#!/usr/bin/env node

/**
 * Build Topic History (v2 - Optimized)
 * Reads all articles and creates a history of covered topics
 * Used to avoid duplicate topics
 * Refactored to use shared utilities
 */

const path = require('path');
const { findMarkdownFiles, writeFile } = require('./utils/file-system');
const { extractFrontmatter } = require('./utils/frontmatter');

const ARTICLES_DIR = path.join(__dirname, '..', 'articles');
const HISTORY_FILE = path.join(__dirname, '..', 'articles', 'topic-history.json');

/**
 * Build topic history from all articles
 * @returns {Object} History data with topics and metadata
 */
function buildTopicHistory() {
  const topics = [];

  // Find all markdown files
  const mdFiles = findMarkdownFiles(ARTICLES_DIR);

  if (mdFiles.length === 0) {
    console.log('Articles directory does not exist yet');
    const emptyHistory = {
      topics: [],
      lastUpdated: new Date().toISOString()
    };
    writeFile(HISTORY_FILE, JSON.stringify(emptyHistory, null, 2));
    return emptyHistory;
  }

  // Process each markdown file
  for (const file of mdFiles) {
    try {
      const content = require('fs').readFileSync(file.filePath, 'utf8');
      const frontmatter = extractFrontmatter(content);

      if (!frontmatter || !frontmatter.topic) {
        continue;
      }

      topics.push({
        topic: frontmatter.topic,
        date: frontmatter.date || new Date().toISOString(),
        title: frontmatter.title || frontmatter.topic,
        contentType: frontmatter.contentType || 'article'
      });
    } catch (error) {
      console.error(`Error processing ${file.relativePath}: ${error.message}`);
    }
  }

  // Sort by date descending (most recent first)
  topics.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });

  const history = {
    topics,
    lastUpdated: new Date().toISOString()
  };

  // Write history file
  if (writeFile(HISTORY_FILE, JSON.stringify(history, null, 2))) {
    console.log(`✅ Topic history built: ${topics.length} topics found`);
  } else {
    console.error('Failed to write history file');
    process.exit(1);
  }

  return history;
}

// Run if called directly
if (require.main === module) {
  try {
    buildTopicHistory();
  } catch (error) {
    console.error('Error building topic history:', error.message);
    process.exit(1);
  }
}

module.exports = { buildTopicHistory };
