#!/usr/bin/env node

/**
 * Generate Article with Ollama
 * Uses local Ollama instance for keyless, offline inference
 */

const fs = require('fs');
const path = require('path');
const OllamaInference = require('./ollama-inference');

const TOPIC_FILE = path.join(__dirname, '..', 'selected-topic.json');
const ARTICLES_DIR = path.join(__dirname, '..', 'articles');
const PROMPT_FILE = path.join(__dirname, '..', 'prompts', 'article-generation.txt');
const COMPARATIVE_PROMPT = path.join(__dirname, '..', 'prompts', 'comparative-analysis.txt');
const FUN_PROMPT = path.join(__dirname, '..', 'prompts', 'fun-content.txt');

const ARTICLE_THEMES = [
  'minimalist-clean', 'neon-nights', 'paper-ink', 'ocean-breeze', 'forest-calm',
  'sunset-vibes', 'matrix-code', 'cotton-candy', 'industrial', 'aurora'
];

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral';

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function generateDatePath() {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return path.join(year, month, day);
}

function calculateReadingTime(wordCount) {
  return Math.ceil(wordCount / 200);
}

function getPromptForType(type) {
  switch (type) {
    case 'historical':
      return COMPARATIVE_PROMPT;
    case 'fun':
      return FUN_PROMPT;
    default:
      return PROMPT_FILE;
  }
}

/**
 * Call Ollama API for content generation
 */
async function callOllama(prompt, topicData) {
  const inference = new OllamaInference(OLLAMA_URL, OLLAMA_MODEL);
  
  const result = await inference.generate(prompt, {
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    numPredict: 2048,
    verbose: true
  });

  if (!result.success) {
    throw new Error(result.error || 'Failed to generate content with Ollama');
  }

  return result.content;
}

/**
 * Generate fallback content
 */
function generateFallbackContent(topicData) {
  const { topic, type, tone, estimatedWords } = topicData;
  const theme = ARTICLE_THEMES[Math.floor(Math.random() * ARTICLE_THEMES.length)];
  const now = new Date();

  const typeLabels = {
    'news': 'News Article',
    'historical': 'Comparative Analysis',
    'fun': 'Fun Content',
    'article': 'Article'
  };

  const intros = {
    'news': `In today's rapidly evolving landscape of ${topicData.keywords?.[0] || 'technology'}, ${topic} has emerged as a significant development.`,
    'historical': `Looking back at ${topic}, we can see how much has changed over time.`,
    'fun': `Let's dive into something interesting: ${topic}. Trust us, it's more fascinating than it sounds!`
  };

  const sections = {
    'news': [
      '## Background\n\nTo understand why this matters, we need to look at the broader context. The field has been evolving rapidly, with multiple developments leading to this point.',
      '## Key Developments\n\nSeveral key factors have contributed to this development:\n\n1. **Technical Innovation**: New approaches and methodologies have emerged\n2. **Industry Adoption**: Organizations are increasingly recognizing the potential\n3. **Community Interest**: Growing engagement from developers and researchers',
      '## Implications\n\nThis development has several important implications:\n\n- **Short-term**: Immediate impacts on current workflows and practices\n- **Medium-term**: Changes in how teams approach related challenges\n- **Long-term**: Potential shifts in the broader landscape',
      '## What to Watch\n\nAs this space continues to evolve, keep an eye on:\n\n- Further announcements and updates\n- Community feedback and adoption\n- Integration with existing tools and platforms'
    ],
    'historical': [
      '## The Past\n\nLooking back, we can see how things used to be. The landscape was different, with its own set of challenges and opportunities.',
      '## The Transition\n\nOver time, several key changes occurred:\n\n1. Initial developments laid the groundwork\n2. Major milestones marked significant progress\n3. Recent advances have accelerated the pace',
      '## The Present\n\nToday, we stand in a very different position. The changes have been substantial, affecting multiple aspects of the field.',
      '## Lessons Learned\n\nWhat can we take away from this evolution?\n\n- **Persistence matters**: Long-term progress often requires patience\n- **Incremental gains add up**: Small improvements compound over time\n- **Context is key**: Understanding the journey helps appreciate the destination'
    ],
    'fun': [
      '## Why This Is Interesting\n\nAt first glance, this might seem like just another topic. But dig a little deeper, and you\'ll find some fascinating aspects.',
      '## Surprising Facts\n\nHere are some things that might surprise you:\n\n1. **Did you know?**: There\'s more complexity here than meets the eye\n2. **Fun fact**: The history behind this is more interesting than you\'d expect\n3. **Bonus trivia**: There are connections to other areas you might not expect',
      '## The Bigger Picture\n\nWhat makes this truly interesting is how it connects to broader themes:\n\n- It reflects larger trends in technology and culture\n- It shows how innovation often comes from unexpected places\n- It demonstrates the creative potential of human ingenuity',
      '## Food for Thought\n\nNext time you encounter this topic, remember:\n\n- There\'s always more to learn\n- Curiosity leads to discovery\n- Even "boring" topics can be fascinating with the right perspective'
    ]
  };

  const selectedSections = sections[type] || sections.news;
  const intro = intros[type] || intros.news;

  return `---
title: "${topic}"
date: "${now.toISOString()}"
theme: "${theme}"
topic: "${topic}"
wordCount: ${estimatedWords}
readingTime: ${calculateReadingTime(estimatedWords)}
excerpt: "An autonomously generated ${typeLabels[type] || 'article'} about ${topic}"
contentType: "${type}"
generated: "fallback"
---

# ${topic}

*This article was autonomously generated by autonomousBLOG.*

${intro}

${selectedSections.join('\n\n')}

## Conclusion

${type === 'news' ? 'As this story continues to develop, we\'ll keep you updated with the latest information.' : type === 'historical' ? 'The journey from past to present shows us not just where we\'ve been, but hints at where we\'re going.' : 'Sometimes the most interesting discoveries come from exploring the unexpected.'}

---

*Generated by autonomousBLOG on ${now.toUTCString()}*

> **Note**: This is fallback content. Ensure Ollama is running and accessible for AI-generated articles.
`;
}

async function generateArticle() {
  // Load selected topic
  if (!fs.existsSync(TOPIC_FILE)) {
    throw new Error('No selected topic found. Run topic-selector.js first.');
  }

  const topicData = JSON.parse(fs.readFileSync(TOPIC_FILE, 'utf8'));
  console.log('📰 Generating article for topic:', topicData.topic);

  // Load and prepare prompt
  const promptFile = getPromptForType(topicData.type);
  let prompt = fs.existsSync(promptFile)
    ? fs.readFileSync(promptFile, 'utf8')
    : 'Write an article about {{TOPIC}}';

  // Replace placeholders
  const theme = ARTICLE_THEMES[Math.floor(Math.random() * ARTICLE_THEMES.length)];
  const now = new Date();

  prompt = prompt
    .replace('{{TOPIC}}', topicData.topic)
    .replace('{{ANGLE}}', topicData.angle || 'General exploration')
    .replace('{{TONE}}', topicData.tone || 'casual')
    .replace('{{WORD_COUNT}}', String(topicData.estimatedWords || 800))
    .replace('{{KEYWORDS}}', Array.isArray(topicData.keywords)
      ? topicData.keywords.join(', ')
      : topicData.keywords || 'technology')
    .replace('{{CONTENT_TYPE}}', topicData.type || 'article')
    .replace('{{DATE}}', now.toISOString())
    .replace('{{THEME}}', theme)
    .replace('{{HISTORICAL_DATE}}', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
    .replace('{{CURRENT_DATE}}', now.toISOString());

  // Try to generate with Ollama
  let content;
  try {
    content = await callOllama(prompt, topicData);
  } catch (error) {
    console.warn('⚠️  Ollama generation failed, using fallback content...');
    content = generateFallbackContent(topicData);
  }

  // Ensure content has frontmatter
  if (!content.includes('---')) {
    content = `---
title: "${topicData.topic}"
date: "${now.toISOString()}"
theme: "${theme}"
topic: "${topicData.topic}"
wordCount: ${topicData.estimatedWords || 800}
readingTime: ${calculateReadingTime(topicData.estimatedWords || 800)}
excerpt: "An autonomously generated article"
contentType: "${topicData.type}"
---

${content}
`;
  }

  // Create article file
  const datePath = generateDatePath();
  const slug = generateSlug(topicData.topic);
  const articleDir = path.join(ARTICLES_DIR, datePath);
  const articleFile = path.join(articleDir, `${slug}.md`);

  // Ensure directory exists
  fs.mkdirSync(articleDir, { recursive: true });

  // Write article
  fs.writeFileSync(articleFile, content);
  console.log('✅ Article created:', articleFile);

  // Clean up topic file
  if (fs.existsSync(TOPIC_FILE)) {
    fs.unlinkSync(TOPIC_FILE);
  }

  // Rebuild articles list and content cache
  const { buildArticlesList } = require('./build-articles-list');
  const { buildArticlesContent } = require('./build-articles-content');
  
  console.log('Rebuilding articles list and content cache...');
  buildArticlesList();
  buildArticlesContent();
  console.log('✅ Articles list and content cache updated');

  return { file: articleFile, theme };
}

// Main execution
async function main() {
  try {
    const result = await generateArticle();
    console.log('Article generation complete:', result.file);

    // Log which mode was used
    const articleContent = fs.readFileSync(result.file, 'utf8');
    const generatedMode = articleContent.includes('generated: "fallback"')
      ? 'FALLBACK (Ollama unavailable)'
      : 'OLLAMA-GENERATED';
    console.log(`Generation mode: ${generatedMode}`);
  } catch (error) {
    console.error('Error generating article:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateArticle };
