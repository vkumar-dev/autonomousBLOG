#!/usr/bin/env node

/**
 * Random Blog Generator (Matrix Edition)
 * Selects one random value from each dimension in the matrix config.
 * Relies on the high number of permutations to ensure uniqueness.
 */

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'random-blog-generator-config.json');
const TOPIC_OUTPUT = path.join(__dirname, '..', 'selected-topic.json');

// Load configuration matrix
function loadConfig() {
  const configText = fs.readFileSync(CONFIG_FILE, 'utf8');
  return JSON.parse(configText);
}

// Pick random element from array
function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate random topic based on matrix parameters
function generateRandomTopic() {
  const config = loadConfig();
  
  // Random selection from each dimension
  const category = pickRandom(config.categories);
  const genre = pickRandom(config.genres);
  const style = pickRandom(config.writingStyles);
  const method = pickRandom(config.storytellingMethods);
  const perspective = pickRandom(config.perspectives);
  const depth = pickRandom(config.depthLevels);
  const audience = pickRandom(config.targetAudiences);
  const angleSelection = pickRandom(config.angles);
  
  // Topic templates - variety of ways to phrase the title
  const templates = [
    `${category}: A ${perspective} Perspective`,
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
    `${category}: Practical Applications and Insights`,
    `${category} in the Modern Era: A ${perspective} Approach`,
    `The Intersection of ${category} and ${genre}`,
    `Why ${category} Matters for ${audience}`,
    `Rethinking ${category}: A ${perspective} Breakdown`,
    `How ${category} Shapes Our World`,
    `The Future of ${category}: ${genre}`
  ];
  
  const selectedTopic = pickRandom(templates);
  
  // Determine word count based on depth level
  const wordCountMap = {
    'Introduction to Basics': 600,
    'Intermediate Understanding': 900,
    'Advanced Exploration': 1200,
    'Expert Deep Dive': 1500,
    'Popular Science': 800,
    'Academic Research': 1400,
    'Thought Experiment': 1000
  };
  
  const estimatedWords = wordCountMap[depth] || 900;
  
  const topicData = {
    topic: selectedTopic,
    category: category,
    genre: genre,
    writingStyle: style,
    storytellingMethod: method,
    perspective: perspective,
    depthLevel: depth,
    targetAudience: audience,
    angle: angleSelection,
    tone: style.toLowerCase().includes('humorous') ? 'humorous' : 
          style.toLowerCase().includes('formal') ? 'formal' :
          style.toLowerCase().includes('casual') ? 'casual' : 'professional',
    type: genre,
    keywords: [category, perspective, genre],
    estimatedWords: estimatedWords
  };
  
  return topicData;
}

// Main execution
try {
  const topic = generateRandomTopic();
  
  console.log('🎲 Matrix Topic Selection Complete:');
  console.log(`   Topic: ${topic.topic}`);
  console.log(`   Category: ${topic.category}`);
  console.log(`   Genre: ${topic.genre}`);
  console.log(`   Perspective: ${topic.perspective}`);
  console.log(`   Audience: ${topic.targetAudience}`);
  
  // Save to file for next step
  fs.writeFileSync(TOPIC_OUTPUT, JSON.stringify(topic, null, 2));
  
} catch (error) {
  console.error('Error generating random topic:', error.message);
  process.exit(1);
}
