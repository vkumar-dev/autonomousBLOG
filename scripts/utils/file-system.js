/**
 * File System Utilities
 * Shared directory scanning and file operations
 * Used by: build-article-index.js, build-topic-history.js
 */

const fs = require('fs');
const path = require('path');

/**
 * Recursively scan directory for markdown files
 * Returns array of file paths with relative paths
 * 
 * @param {string} startDir - Root directory to scan
 * @param {string} [relativePath=''] - Internal recursion parameter
 * @returns {Array<{filePath: string, relativePath: string}>} Array of markdown files
 */
function findMarkdownFiles(startDir, relativePath = '') {
  const files = [];

  if (!fs.existsSync(startDir)) {
    return files;
  }

  try {
    const entries = fs.readdirSync(startDir);

    for (const entry of entries) {
      const fullPath = path.join(startDir, entry);
      const relPath = path.join(relativePath, entry);

      try {
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Recurse into subdirectories
          files.push(...findMarkdownFiles(fullPath, relPath));
        } else if (entry.endsWith('.md')) {
          files.push({
            filePath: fullPath,
            relativePath: relPath.replace(/\\/g, '/') // Normalize path separators
          });
        }
      } catch (err) {
        // Skip files/directories we can't stat
        console.error(`Warning: Could not stat ${fullPath}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${startDir}: ${err.message}`);
  }

  return files;
}

/**
 * Process markdown files with content
 * Loads file content and applies processor function
 * 
 * @param {string} startDir - Root directory to scan
 * @param {Function} processor - Function(content, filePath, relativePath) => Object|null
 * @returns {Array} Array of processed results
 */
function processMarkdownFiles(startDir, processor) {
  const files = findMarkdownFiles(startDir);
  const results = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file.filePath, 'utf8');
      const result = processor(content, file.filePath, file.relativePath);
      
      if (result !== null && result !== undefined) {
        results.push(result);
      }
    } catch (err) {
      console.error(`Error processing ${file.filePath}: ${err.message}`);
    }
  }

  return results;
}

/**
 * Ensure directory exists (creates if needed)
 * 
 * @param {string} dirPath - Directory path
 * @returns {boolean} True if directory exists or was created
 */
function ensureDirectory(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return true;
  } catch (err) {
    console.error(`Failed to create directory ${dirPath}: ${err.message}`);
    return false;
  }
}

/**
 * Safe file write with error handling
 * 
 * @param {string} filePath - File path
 * @param {string} content - File content
 * @returns {boolean} True if write succeeded
 */
function writeFile(filePath, content) {
  try {
    ensureDirectory(path.dirname(filePath));
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (err) {
    console.error(`Failed to write ${filePath}: ${err.message}`);
    return false;
  }
}

/**
 * Safe file read with error handling
 * 
 * @param {string} filePath - File path
 * @returns {string|null} File content or null if read failed
 */
function readFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error(`Failed to read ${filePath}: ${err.message}`);
    return null;
  }
}

/**
 * Check if file exists
 * 
 * @param {string} filePath - File path
 * @returns {boolean} True if file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

module.exports = {
  findMarkdownFiles,
  processMarkdownFiles,
  ensureDirectory,
  writeFile,
  readFile,
  fileExists
};
