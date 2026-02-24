/**
 * Frontmatter Parser Utility
 * Unified frontmatter extraction and parsing
 * Used by: build-article-index.js, build-topic-history.js
 */

/**
 * Extract and parse frontmatter from markdown content
 * Handles YAML-like key:value pairs between --- delimiters
 * 
 * @param {string} content - Full markdown content
 * @returns {Object|null} Parsed frontmatter or null if not found
 */
function extractFrontmatter(content) {
  if (!content || typeof content !== 'string') {
    return null;
  }

  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return null;
  }

  const frontmatter = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1 || !line.trim()) {
      continue;
    }

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    if (!key) {
      continue;
    }

    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Parse arrays: [item1, item2] or ["item1", "item2"]
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        value = value
          .slice(1, -1)
          .split(',')
          .map(v => {
            let trimmed = v.trim();
            // Remove quotes from array items
            if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
                (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
              trimmed = trimmed.slice(1, -1);
            }
            return trimmed;
          })
          .filter(v => v);
      } catch (e) {
        // Fall through to string value
      }
    }
    // Parse numbers
    else if (/^-?\d+(\.\d+)?$/.test(value)) {
      value = value.includes('.') 
        ? parseFloat(value) 
        : parseInt(value, 10);
    }
    // Parse booleans
    else if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }

    frontmatter[key] = value;
  }

  return frontmatter;
}

/**
 * Extract excerpt from article content
 * Uses frontmatter excerpt if available, otherwise first paragraph
 * 
 * @param {string} content - Full markdown content
 * @param {Object} frontmatter - Parsed frontmatter
 * @param {number} maxLength - Maximum excerpt length (default: 150)
 * @returns {string} Excerpt text
 */
function extractExcerpt(content, frontmatter, maxLength = 150) {
  // Prefer frontmatter excerpt
  if (frontmatter && frontmatter.excerpt && typeof frontmatter.excerpt === 'string') {
    return frontmatter.excerpt;
  }

  if (!content || typeof content !== 'string') {
    return 'Click to read more...';
  }

  // Remove frontmatter
  const withoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');

  // Get first non-heading paragraph
  const lines = withoutFrontmatter.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-')) {
      // Truncate to maxLength if needed
      if (trimmed.length > maxLength) {
        return trimmed.slice(0, maxLength - 3) + '...';
      }
      return trimmed;
    }
  }

  return 'Click to read more...';
}

module.exports = {
  extractFrontmatter,
  extractExcerpt
};
