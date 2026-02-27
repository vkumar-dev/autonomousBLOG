#!/usr/bin/env node

/**
 * Build Articles List
 * Scans the articles folder recursively for .md files and creates a JSON list
 * This is used by the homepage to dynamically load articles
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'articles');
const LIST_FILE = path.join(__dirname, '..', 'articles-list.json');
const INDEX_FILE = path.join(__dirname, '..', 'articles-index.json');

function extractTimestampFromFilename(filename) {
  // Match yyyy-mm-dd-hh-mm-ss_ pattern at start of filename
  const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})_/);
  if (match) {
    const [, year, month, day, hours, minutes, seconds] = match;
    const dateStr = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
    return new Date(dateStr).toISOString();
  }
  return null;
}

function extractFrontmatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    
    if (!match) return null;
    
    const frontmatter = {};
    const lines = match[1].split('\n');
    
    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
        frontmatter[key.trim()] = value;
      }
    }
    
    return frontmatter;
  } catch (error) {
    return null;
  }
}

function buildArticlesList() {
  const articles = [];
  
  if (!fs.existsSync(ARTICLES_DIR)) {
    console.log('Articles directory does not exist');
    fs.writeFileSync(LIST_FILE, JSON.stringify([], null, 2));
    fs.writeFileSync(INDEX_FILE, JSON.stringify({ articles: [], total: 0, lastBuilt: new Date().toISOString() }, null, 2));
    return;
  }

  // Recursively find all .md files
  function walkDir(dir) {
    const entries = fs.readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (stat.isFile() && entry.endsWith('.md')) {
        const relativePath = path.relative(ARTICLES_DIR, fullPath);
        const frontmatter = extractFrontmatter(fullPath);
        
        // Try to extract date from filename first, then fall back to frontmatter or file mtime
        const filenameDate = extractTimestampFromFilename(entry);
        const date = filenameDate || frontmatter?.date || stat.mtime.toISOString();
        
        articles.push({
          file: entry,
          path: relativePath,
          frontmatter: frontmatter || {},
          fullPath: fullPath,
          date: date
        });
      }
    }
  }
  
  walkDir(ARTICLES_DIR);
  
  // Sort by date descending (latest first)
  articles.sort((a, b) => {
    const dateA = new Date(a.date || 0);
    const dateB = new Date(b.date || 0);
    return dateB - dateA;
  });
  
  // Build simple list for homepage (file paths)
  const fileList = articles.map(article => article.path);
  
  // Build detailed index with metadata
  const indexArticles = articles.map(article => ({
    title: article.frontmatter.title || article.file.replace('.md', ''),
    date: article.date,
    theme: article.frontmatter.theme || 'default',
    topic: article.frontmatter.topic || article.frontmatter.title || '',
    contentType: article.frontmatter.contentType || 'article',
    excerpt: article.frontmatter.excerpt || '',
    readingTime: parseInt(article.frontmatter.readingTime) || 5,
    wordCount: parseInt(article.frontmatter.wordCount) || 0,
    keywords: article.frontmatter.keywords ? 
      (typeof article.frontmatter.keywords === 'string' ? 
        article.frontmatter.keywords.split(',').map(k => k.trim()) : 
        []) : [],
    path: article.path
  }));
  
  // Write list file (for homepage.js)
  fs.writeFileSync(LIST_FILE, JSON.stringify(fileList, null, 2));
  
  // Write index file (detailed metadata)
  fs.writeFileSync(INDEX_FILE, JSON.stringify({
    articles: indexArticles,
    total: indexArticles.length,
    lastBuilt: new Date().toISOString()
  }, null, 2));
  
  console.log(`✅ Article list built: ${articles.length} articles`);
  console.log('\nArticles (latest first):');
  articles.slice(0, 10).forEach((article, i) => {
    const title = article.frontmatter.title || article.file;
    const date = new Date(article.date).toLocaleDateString();
    console.log(`  ${i + 1}. [${date}] ${title}`);
  });
  
  if (articles.length > 10) {
    console.log(`  ... and ${articles.length - 10} more`);
  }
}

if (require.main === module) {
  buildArticlesList();
}

module.exports = { buildArticlesList };
