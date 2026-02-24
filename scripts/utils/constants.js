/**
 * Centralized Constants
 * All magic numbers and configuration values
 */

module.exports = {
  // Reading time calculation
  WORDS_PER_MINUTE: 200,
  
  // API Configuration
  API_DEFAULTS: {
    TIMEOUT_MS: 30000,        // 30 second timeout
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000,
  },
  
  // Gemini API
  GEMINI: {
    MAX_OUTPUT_TOKENS: 2048,
    TEMPERATURE: 0.7,
    MODEL: 'gemini-2.0-flash',
  },
  
  // OpenAI API
  OPENAI: {
    MAX_TOKENS: 2000,
    TEMPERATURE: 0.7,
    DEFAULT_MODEL: 'gpt-4o-mini',
  },
  
  // Blog Generation
  BLOG: {
    INTERVAL_SECONDS: 14400,  // 4 hours
    ARTICLE_INTERVAL_MINUTES: 240,
    EXCERPT_LENGTH: 150,
  },
  
  // File Operations
  FILES: {
    ARTICLE_EXT: '.md',
    CONFIG_EXT: '.json',
    ENCODING: 'utf8',
  },
  
  // Content Types
  CONTENT_TYPES: {
    NEWS: 'news',
    HISTORICAL: 'historical',
    FUN: 'fun',
    ARTICLE: 'article',
  },
  
  // Article Themes
  ARTICLE_THEMES: [
    'minimalist-clean',
    'neon-nights',
    'paper-ink',
    'ocean-breeze',
    'forest-calm',
    'sunset-vibes',
    'matrix-code',
    'cotton-candy',
    'industrial',
    'aurora'
  ],
};
