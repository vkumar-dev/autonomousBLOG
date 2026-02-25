#!/usr/bin/env node

/**
 * Add Back Button to HTML Articles
 * Injects a back/home navigation button at the top of HTML articles
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'articles');

const BACK_BUTTON_HTML = `
<div style="padding: 1rem; background: rgba(0,0,0,0.02); border-bottom: 1px solid rgba(0,0,0,0.1); margin-bottom: 1rem;">
  <a href="../index.html" style="display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; color: inherit; font-weight: 500; transition: opacity 0.2s;">
    <span style="font-size: 1.2rem;">←</span>
    <span>Back to Blog</span>
  </a>
</div>
`;

function addBackButton(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if back button already exists
  if (content.includes('Back to Blog')) {
    console.log(`⊘ Skip: ${path.basename(filePath)} (already has back button)`);
    return false;
  }
  
  // Find the opening body tag or the main content area
  let updated = false;
  
  // Try to insert after opening body tag
  if (content.includes('<body')) {
    content = content.replace(/(<body[^>]*>)/i, `$1${BACK_BUTTON_HTML}`);
    updated = true;
  }
  // Try to insert before main/article tag
  else if (content.includes('<main') || content.includes('<article')) {
    content = content.replace(/(<(?:main|article)[^>]*>)/i, `${BACK_BUTTON_HTML}$1`);
    updated = true;
  }
  // Try to insert at the beginning of container
  else if (content.includes('<div class="container"')) {
    content = content.replace(/(<div class="container"[^>]*>)/i, `$1${BACK_BUTTON_HTML}`);
    updated = true;
  }
  // Fallback: insert before the first header
  else if (content.includes('<header') || content.includes('<h1')) {
    const headerRegex = /(<(?:header|h1)[^>]*>)/i;
    content = content.replace(headerRegex, `${BACK_BUTTON_HTML}$1`);
    updated = true;
  }
  
  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${path.basename(filePath)}`);
    return true;
  } else {
    console.log(`⚠️  Could not find injection point: ${path.basename(filePath)}`);
    return false;
  }
}

function main() {
  if (!fs.existsSync(ARTICLES_DIR)) {
    console.log('Articles directory does not exist');
    return;
  }
  
  const files = fs.readdirSync(ARTICLES_DIR);
  let updated = 0;
  
  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile() && file.endsWith('.html')) {
      if (addBackButton(filePath)) {
        updated++;
      }
    }
  }
  
  console.log(`\n✅ Completed: ${updated} articles updated with back button`);
}

if (require.main === module) {
  main();
}

module.exports = { addBackButton };
