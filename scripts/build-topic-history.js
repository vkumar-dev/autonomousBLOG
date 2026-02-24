#!/usr/bin/env node

/**
 * Build Topic History
 * Reads all articles and creates a history of covered topics
 * Used to avoid duplicate topics
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'articles');
const HISTORY_FILE = path.join(__dirname, '..', 'articles', 'topic-history.json');

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  
  const frontmatter = {};
  const lines = match[1].split('\n');
  
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      let value = valueParts.join(':').trim();
      // Remove quotes
      value = value.replace(/^["']|["']$/g, '');
      // Parse arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/["']/g, ''));
      }
      frontmatter[key.trim()] = value;
    }
  }
  
  return frontmatter;
}

function buildTopicHistory() {
  if (!fs.existsSync(ARTICLES_DIR)) {
    console.log('Articles directory does not exist yet');
    return { topics: [], lastUpdated: new Date().toISOString() };
  }
  
  const topics = [];
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.md')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const frontmatter = extractFrontmatter(content);
        
        if (frontmatter && frontmatter.topic) {
          topics.push({
            topic: frontmatter.topic,
            date: frontmatter.date,
            title: frontmatter.title,
            contentType: frontmatter.contentType || 'article'
          });
        }
      }
    }
  }
  
  scanDirectory(ARTICLES_DIR);
  
  // Sort by date descending
  topics.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const history = {
    topics,
    lastUpdated: new Date().toISOString()
  };
  
  // Write history file
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  console.log(`Topic history built: ${topics.length} topics found`);
  
  return history;
}

// Run if called directly
if (require.main === module) {
  buildTopicHistory();
}

module.exports = { buildTopicHistory };
