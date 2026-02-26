#!/usr/bin/env node

/**
 * Topic Selector
 * Selects the next topic for article generation based on:
 * 1. New/trending topics (if not previously covered)
 * 2. Historical events (for comparative analysis)
 * 3. Fun content (fallback)
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const HISTORY_FILE = path.join(__dirname, '..', 'articles', 'topic-history.json');
const PROMPT_FILE = path.join(__dirname, '..', 'prompts', 'topic-selection.txt');

// Get covered topics from history
function getCoveredTopics() {
  if (!fs.existsSync(HISTORY_FILE)) {
    return [];
  }
  
  const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  return history.topics.map(t => t.topic.toLowerCase());
}

// Get trending topics (simulated - in production, fetch from API)
async function getTrendingTopics() {
  // In production, you could fetch from:
  // - Reddit API (r/technology, r/science)
  // - Hacker News API
  // - Twitter trends
  // - RSS feeds
  
  // Expanded list of trending topics to avoid duplicates
  const topicPool = [
    { title: 'AI Breakthrough in Reasoning', category: 'technology' },
    { title: 'New Space Mission Announced', category: 'space' },
    { title: 'Quantum Computing Milestone', category: 'technology' },
    { title: 'Sustainable Tech Innovation', category: 'science' },
    { title: 'Digital Privacy Updates', category: 'tech-policy' },
    { title: 'Open Source Software Trends', category: 'technology' },
    { title: 'Blockchain Security Advances', category: 'technology' },
    { title: 'Machine Learning Applications', category: 'technology' },
    { title: 'Cloud Computing Evolution', category: 'technology' },
    { title: 'Cybersecurity Threats Analysis', category: 'security' },
    { title: 'Neural Network Breakthroughs', category: 'ai' },
    { title: 'Renewable Energy Solutions', category: 'science' },
    { title: 'Internet of Things Expansion', category: 'technology' },
    { title: 'Virtual Reality Innovations', category: 'technology' },
    { title: 'Data Privacy Regulations', category: 'policy' }
  ];
  
  // Shuffle and return first 5 for variety
  const shuffled = topicPool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
}

// Get historical events for this day
function getHistoricalEvents() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  
  // In production, fetch from historical events API
  const historicalEvents = [
    { year: 2024, event: 'Major AI model released', category: 'technology' },
    { year: 2023, event: 'Historic Space Discovery', category: 'space' },
    { year: 2022, event: 'Quantum Computing Breakthrough', category: 'technology' },
    { year: 2021, event: 'Green Energy Milestone', category: 'science' },
    { year: 2020, event: 'Open Source Project Success', category: 'technology' }
  ];
  
  return historicalEvents;
}

// Check if topic was already covered
function isTopicCovered(topic) {
  const covered = getCoveredTopics();
  return covered.some(coveredTopic => 
    topic.toLowerCase().includes(coveredTopic) || 
    coveredTopic.includes(topic.toLowerCase())
  );
}

// Select topic using AI
async function selectTopicWithAI() {
  const coveredTopics = getCoveredTopics();
  const trendingTopics = await getTrendingTopics();
  const historicalEvents = getHistoricalEvents();
  
  // Filter out already covered topics
  const newTopics = trendingTopics.filter(t => !isTopicCovered(t.title));
  
  let prompt;
  if (fs.existsSync(PROMPT_FILE)) {
    prompt = fs.readFileSync(PROMPT_FILE, 'utf8');
  } else {
    prompt = `Select a topic following the priority rules.`;
  }
  
  // Replace placeholders
  prompt = prompt
    .replace('{{CURRENT_DATE}}', new Date().toISOString())
    .replace('{{PREVIOUS_TOPICS}}', JSON.stringify(coveredTopics.slice(0, 10)));
  
  // If we have new topics, request news article
  if (newTopics.length > 0) {
    return {
      type: 'news',
      topic: newTopics[0].title,
      angle: 'Latest developments and implications',
      reasoning: 'New topic not previously covered',
      keywords: [newTopics[0].category, 'news', 'update'],
      tone: ['formal', 'casual', 'technical'][Math.floor(Math.random() * 3)],
      estimatedWords: 800 + Math.floor(Math.random() * 400)
    };
  }
  
  // If no new topics, check for historical analysis
  if (historicalEvents.length > 0) {
    const event = historicalEvents[Math.floor(Math.random() * historicalEvents.length)];
    return {
      type: 'historical',
      topic: `${event.event} - One Year Later`,
      angle: 'Comparative analysis of progress',
      reasoning: 'No new topics, doing historical comparison',
      keywords: [event.category, 'analysis', 'year-over-year'],
      tone: ['formal', 'casual'][Math.floor(Math.random() * 2)],
      estimatedWords: 900 + Math.floor(Math.random() * 300)
    };
  }
  
  // Fallback to fun content
  const funTopics = [
    'Tech Trivia That Will Surprise You',
    'What If Computers Could Dream?',
    'A Day in the Life of an AI',
    'Unpopular Tech Opinions',
    'Letter to Future Developers',
    'The Hidden Side of Technology',
    'Why Programmers Love Coffee',
    'Greatest Tech Fails and What We Learned',
    'The Future of Work in Tech',
    'Memes That Defined Developer Culture',
    'Stories from the Code Trenches',
    'Tech Predictions That Came True',
    'The Psychology of User Interface',
    'How Algorithms Shape Our World',
    'Tales from the Data Center'
  ];
  
  const selectedFun = funTopics[Math.floor(Math.random() * funTopics.length)];
  
  return {
    type: 'fun',
    topic: selectedFun,
    angle: 'Lighthearted exploration',
    reasoning: 'No noteworthy news, generating fun content',
    keywords: ['fun', 'entertainment', 'technology'],
    tone: 'humorous',
    estimatedWords: 600 + Math.floor(Math.random() * 300)
  };
}

// Main execution
async function main() {
  try {
    const topic = await selectTopicWithAI();
    
    // Output as JSON for GitHub Actions
    console.log(JSON.stringify(topic));
    
    // Also write to file for debugging
    fs.writeFileSync(
      path.join(__dirname, '..', 'selected-topic.json'),
      JSON.stringify(topic, null, 2)
    );
    
  } catch (error) {
    console.error('Error selecting topic:', error.message);
    
    // Fallback topic
    const fallback = {
      type: 'fun',
      topic: 'Interesting Tech Thoughts',
      angle: 'Casual exploration',
      reasoning: 'Error in topic selection, using fallback',
      keywords: ['technology', 'thoughts'],
      tone: 'casual',
      estimatedWords: 700
    };
    
    console.log(JSON.stringify(fallback));
  }
}

if (require.main === module) {
  main();
}

module.exports = { selectTopicWithAI, getCoveredTopics, isTopicCovered };
