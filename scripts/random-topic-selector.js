#!/usr/bin/env node

/**
 * Random Blog Generator
 * Selects random combinations from matrices to create unique blog topics
 * No time-dependency, no duplicate checking needed
 */

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'random-blog-generator-config.json');
const TOPIC_OUTPUT = path.join(__dirname, '..', 'selected-topic.json');

// Load configuration matrices
function loadConfig() {
  const configText = fs.readFileSync(CONFIG_FILE, 'utf8');
  return JSON.parse(configText);
}

// Pick random element from array
function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate random topic
function generateRandomTopic() {
  const config = loadConfig();
  
  const category = pickRandom(config.categories);
  const genre = pickRandom(config.genres);
  const style = pickRandom(config.writingStyles);
  const method = pickRandom(config.storytellingMethods);
  const perspective = pickRandom(config.perspectives);
  const depth = pickRandom(config.depthLevels);
  const audience = pickRandom(config.targetAudiences);
  
  // Generate topic combinations
  const topics = [
    `${category}: A ${perspective.toLowerCase()} Perspective`,
    `The Hidden Depths of ${category}`,
    `${category} Explained: ${genre}`,
    `Understanding ${category} Through ${method}`,
    `${category} and Its Impact on Modern Life`,
    `Exploring the Foundations of ${category}`,
    `${category}: Myths vs Reality`,
    `The Evolution of ${category}`,
    `${category}: Lesser-Known Facts and Stories`,
    `Bridging the Gap: ${category} for Everyone`,
    `The Philosophy Behind ${category}`,
    `${category}: A Journey Through Time`,
    `Unraveling the Complexity of ${category}`,
    `${category}: Practical Applications and Insights`
  ];
  
  const selectedTopic = pickRandom(topics);
  
  // Determine word count based on depth level
  const wordCountMap = {
    'Introduction to Basics': 600,
    'Intermediate Understanding': 900,
    'Advanced Exploration': 1200,
    'Expert Deep Dive': 1500,
    'Popular Science': 800,
    'Academic Research': 1400
  };
  
  const estimatedWords = wordCountMap[depth] || 900;
  
  // Generate keywords from components
  const keywords = [
    category.toLowerCase(),
    genre.toLowerCase().split(' ')[0],
    perspective.toLowerCase(),
    pickRandom(config.categories).toLowerCase()
  ];
  
  const topicData = {
    topic: selectedTopic,
    category: category,
    genre: genre,
    writingStyle: style,
    storytellingMethod: method,
    perspective: perspective,
    depthLevel: depth,
    targetAudience: audience,
    tone: style.includes('Academic') ? 'formal' : 
          style.includes('Casual') ? 'casual' :
          style.includes('Humorous') ? 'humorous' : 'professional',
    type: 'educational',
    angle: `A ${depth.toLowerCase()} exploration from a ${perspective.toLowerCase()} perspective`,
    keywords: keywords,
    estimatedWords: estimatedWords
  };
  
  return topicData;
}

// Main execution
try {
  const topic = generateRandomTopic();
  
  console.log('🎲 Generated Random Topic:');
  console.log(`   Topic: ${topic.topic}`);
  console.log(`   Category: ${topic.category}`);
  console.log(`   Genre: ${topic.genre}`);
  console.log(`   Style: ${topic.writingStyle}`);
  console.log(`   Method: ${topic.storytellingMethod}`);
  console.log(`   Audience: ${topic.targetAudience}`);
  console.log(`   Depth: ${topic.depthLevel}`);
  console.log(`   Words: ~${topic.estimatedWords}`);
  
  // Output as JSON for GitHub Actions
  console.log('\n' + JSON.stringify(topic));
  
  // Save to file for next step
  fs.writeFileSync(TOPIC_OUTPUT, JSON.stringify(topic, null, 2));
  
} catch (error) {
  console.error('Error generating random topic:', error.message);
  process.exit(1);
}
