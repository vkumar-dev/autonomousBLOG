#!/usr/bin/env node

/**
 * Build Article Index
 * Scans all articles and creates a JSON index for fast loading
 * Run this during deployment
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'articles');
const INDEX_FILE = path.join(__dirname, '..', 'articles-index.json');

/**
 * Extract frontmatter from markdown content
 */
function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  
  const frontmatter = {};
  const lines = match[1].split('\n');
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();
    
    // Remove quotes
    value = value.replace(/^["']|["']$/g, '');
    
    // Parse arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(v => v.trim().replace(/["']/g, ''));
    }
    
    // Parse numbers
    if (/^\d+$/.test(value)) {
      value = parseInt(value, 10);
    }
    
    frontmatter[key] = value;
  }
  
  return frontmatter;
}

/**
 * Extract excerpt from content (first paragraph after frontmatter)
 */
function extractExcerpt(content, frontmatter) {
  if (frontmatter && frontmatter.excerpt) {
    return frontmatter.excerpt;
  }
  
  // Remove frontmatter
  const withoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
  
  // Get first paragraph
  const lines = withoutFrontmatter.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      // Truncate to 150 characters
      if (trimmed.length > 150) {
        return trimmed.slice(0, 147) + '...';
      }
      return trimmed;
    }
  }
  
  return 'Click to read more...';
}

/**
 * Build article index
 */
function buildArticleIndex() {
  const articles = [];
  
  if (!fs.existsSync(ARTICLES_DIR)) {
    console.log('Articles directory does not exist yet');
    writeIndex({ articles, lastBuilt: new Date().toISOString() });
    return;
  }
  
  function scanDirectory(dir, relativePath = '') {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath, path.join(relativePath, file));
      } else if (file.endsWith('.md')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const frontmatter = extractFrontmatter(content);
        
        if (frontmatter && frontmatter.title) {
          const articlePath = path.join(relativePath, file).replace(/\\/g, '/');
          
          articles.push({
            title: frontmatter.title,
            date: frontmatter.date,
            theme: frontmatter.theme || 'default',
            topic: frontmatter.topic || '',
            contentType: frontmatter.contentType || 'article',
            excerpt: extractExcerpt(content, frontmatter),
            readingTime: frontmatter.readingTime || 5,
            wordCount: frontmatter.wordCount || 0,
            keywords: frontmatter.keywords || [],
            path: articlePath
          });
        }
      }
    }
  }
  
  scanDirectory(ARTICLES_DIR);
  
  // Sort by date descending
  articles.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const index = {
    articles,
    total: articles.length,
    lastBuilt: new Date().toISOString()
  };
  
  writeIndex(index);
  console.log(`Article index built: ${articles.length} articles`);
  
  return index;
}

/**
 * Write index to file
 */
function writeIndex(index) {
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
}

// Run if called directly
if (require.main === module) {
  buildArticleIndex();
}

module.exports = { buildArticleIndex };
