#!/usr/bin/env node

/**
 * Reorganize Articles
 * Moves all articles to a flat structure with datetime timestamp naming
 * Format: YYYYMMDD-HHMMSS-article-title.md
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'articles');

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  
  const frontmatter = {};
  const lines = match[1].split('\n');
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
    
    frontmatter[key] = value;
  }
  
  return frontmatter;
}

function dateToTimestamp(dateString) {
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const ext = path.extname(filePath);
  
  let frontmatter = null;
  let title = '';
  let date = new Date().toISOString();
  
  if (ext === '.md') {
    frontmatter = extractFrontmatter(content);
    if (frontmatter) {
      title = frontmatter.title || 'untitled';
      date = frontmatter.date || date;
    }
  } else if (ext === '.html') {
    // Extract from HTML
    const titleMatch = content.match(/<title>(.*?)<\/title>/);
    const dateMatch = content.match(/meta name="date" content="(.*?)"/);
    
    title = titleMatch?.[1] || 'untitled';
    date = dateMatch?.[1] || date;
  }
  
  const timestamp = dateToTimestamp(date);
  const slug = slugify(title);
  const newFileName = `${timestamp}-${slug}${ext}`;
  const newFilePath = path.join(ARTICLES_DIR, newFileName);
  
  // Copy file to new location
  fs.copyFileSync(filePath, newFilePath);
  
  return { oldPath: filePath, newPath: newFilePath, newName: newFileName, date };
}

function main() {
  if (!fs.existsSync(ARTICLES_DIR)) {
    console.error('Articles directory does not exist');
    return;
  }
  
  const moved = [];
  
  // Find all .md and .html files in subdirectories
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDir(filePath);
      } else if ((file.endsWith('.md') || file.endsWith('.html')) && 
                 file !== 'topic-history.json') {
        try {
          const result = processFile(filePath);
          moved.push(result);
          console.log(`✅ Moved: ${path.basename(result.oldPath)} -> ${result.newName}`);
        } catch (error) {
          console.error(`❌ Error processing ${file}:`, error.message);
        }
      }
    }
  }
  
  scanDir(ARTICLES_DIR);
  
  // Sort by date descending
  moved.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  console.log(`\n✅ Reorganization complete: ${moved.length} articles moved to flat structure`);
  console.log('\nArticles in order (latest first):');
  moved.forEach((item, i) => {
    console.log(`  ${i + 1}. ${item.newName}`);
  });
}

if (require.main === module) {
  main();
}

module.exports = { processFile };
