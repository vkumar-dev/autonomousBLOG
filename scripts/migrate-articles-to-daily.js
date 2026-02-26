#!/usr/bin/env node

/**
 * Migrate Articles to Daily Folder Structure
 * Moves articles from YYYY/MM/ to YYYY/MM/DD/ structure
 * Extracts date from article frontmatter and creates appropriate date folder
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'articles');

function extractDateFromFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  
  const lines = match[1].split('\n');
  for (const line of lines) {
    if (line.startsWith('date:')) {
      let dateValue = line.replace('date:', '').trim();
      dateValue = dateValue.replace(/^["']|["']$/g, '');
      return new Date(dateValue);
    }
  }
  return null;
}

function migrateArticles() {
  console.log('🔄 Migrating articles to daily folder structure (YYYY/MM/DD/)...\n');
  
  if (!fs.existsSync(ARTICLES_DIR)) {
    console.log('❌ Articles directory not found');
    return;
  }

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  function scanAndMigrate(dir, relativePath = '') {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip if already in YYYY/MM/DD structure
        if (/^\d{4}$/.test(file)) {
          // Year folder, recurse
          scanAndMigrate(filePath, file);
        } else if (/^\d{2}$/.test(file) && relativePath) {
          // Month folder, check if we need to migrate
          const monthPath = path.join(relativePath, file);
          const monthDir = path.join(ARTICLES_DIR, monthPath);
          const monthFiles = fs.readdirSync(monthDir);
          
          const hasSubfolders = monthFiles.some(f => 
            fs.statSync(path.join(monthDir, f)).isDirectory()
          );
          
          if (!hasSubfolders) {
            // This is a YYYY/MM folder with files directly in it - needs migration
            migrateMonthFolder(monthDir, monthPath);
          }
        }
      }
    }
  }

  function migrateMonthFolder(monthDir, monthPath) {
    const files = fs.readdirSync(monthDir);
    
    for (const file of files) {
      const filePath = path.join(monthDir, file);
      const stat = fs.statSync(filePath);
      
      if (!stat.isDirectory() && file.endsWith('.md')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const date = extractDateFromFrontmatter(content);
          
          if (date) {
            const day = String(date.getDate()).padStart(2, '0');
            const dayPath = path.join(monthPath, day);
            const newDayDir = path.join(ARTICLES_DIR, dayPath);
            
            // Create day folder if it doesn't exist
            if (!fs.existsSync(newDayDir)) {
              fs.mkdirSync(newDayDir, { recursive: true });
            }
            
            const newFilePath = path.join(newDayDir, file);
            
            // Move file
            fs.copyFileSync(filePath, newFilePath);
            fs.unlinkSync(filePath);
            
            console.log(`✅ Migrated: ${file}`);
            console.log(`   From: ${monthPath}/`);
            console.log(`   To:   ${dayPath}/\n`);
            migratedCount++;
          } else {
            console.log(`⚠️  Skipped: ${file} (no date found in frontmatter)`);
            skippedCount++;
          }
        } catch (error) {
          console.log(`❌ Error migrating ${file}: ${error.message}`);
          errorCount++;
        }
      }
    }
  }

  // Start migration
  scanAndMigrate(ARTICLES_DIR);
  
  // Clean up empty month folders
  function cleanEmptyFolders(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        cleanEmptyFolders(filePath);
        
        // Remove if empty
        const isEmpty = fs.readdirSync(filePath).length === 0;
        if (isEmpty) {
          fs.rmdirSync(filePath);
          console.log(`🗑️  Removed empty folder: ${file}`);
        }
      }
    }
  }
  
  cleanEmptyFolders(ARTICLES_DIR);
  
  console.log('\n' + '='.repeat(50));
  console.log('Migration Complete!');
  console.log('='.repeat(50));
  console.log(`✅ Migrated: ${migratedCount}`);
  console.log(`⚠️  Skipped: ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`\nNew structure: articles/YYYY/MM/DD/article.md`);
}

// Run migration
migrateArticles();
