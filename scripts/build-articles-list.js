#!/usr/bin/env node

/**
 * Build Articles List
 * Scans the articles folder and creates a JSON list of all article files
 * This is used by the homepage to dynamically load articles
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'articles');
const LIST_FILE = path.join(__dirname, '..', 'articles-list.json');

function buildArticlesList() {
  const files = [];
  
  if (!fs.existsSync(ARTICLES_DIR)) {
    console.log('Articles directory does not exist');
    fs.writeFileSync(LIST_FILE, JSON.stringify(files, null, 2));
    return;
  }

  // Read all files in articles directory (flat structure)
  const dirEntries = fs.readdirSync(ARTICLES_DIR);
  
  for (const entry of dirEntries) {
    const fullPath = path.join(ARTICLES_DIR, entry);
    const stat = fs.statSync(fullPath);
    
    // Only include .html files, skip directories and other files
    if (stat.isFile() && entry.endsWith('.html')) {
      files.push(entry);
    }
  }
  
  // Sort by filename descending (latest first due to timestamp format)
  files.sort((a, b) => b.localeCompare(a));
  
  // Write list to file
  fs.writeFileSync(LIST_FILE, JSON.stringify(files, null, 2));
  
  console.log(`Article list built: ${files.length} articles`);
  console.log('\nArticles (latest first):');
  files.forEach((file, i) => {
    console.log(`  ${i + 1}. ${file}`);
  });
}

if (require.main === module) {
  buildArticlesList();
}

module.exports = { buildArticlesList };
