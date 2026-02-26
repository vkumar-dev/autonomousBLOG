#!/usr/bin/env node

/**
 * Ollama Setup Module
 * Installs and configures Ollama for article generation
 * Checks health, pulls model, waits for readiness
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral';
const PLATFORM = process.platform;
const IS_GITHUB_ACTIONS = process.env.GITHUB_ACTIONS === 'true';

/**
 * Check if Ollama is already running
 */
async function checkOllamaHealth() {
  try {
    const fetch = require('node-fetch');
    const response = await fetch(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Check if model is available
 */
async function checkModelAvailable() {
  try {
    const fetch = require('node-fetch');
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    const data = await response.json();
    const models = data.models || [];
    return models.some(m => m.name.includes(OLLAMA_MODEL));
  } catch (error) {
    return false;
  }
}

/**
 * Wait for Ollama to be ready
 */
async function waitForOllama(maxWaitMs = 120000) {
  const startTime = Date.now();
  const interval = 5000; // Check every 5 seconds

  console.log('⏳ Waiting for Ollama to be ready...');

  while (Date.now() - startTime < maxWaitMs) {
    const isHealthy = await checkOllamaHealth();
    if (isHealthy) {
      console.log('✅ Ollama is running and healthy');
      return true;
    }
    
    console.log(`⏳ Still waiting... (${Math.floor((Date.now() - startTime) / 1000)}s)`);
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error(`Ollama did not become ready within ${maxWaitMs / 1000} seconds`);
}

/**
 * Pull Ollama model
 */
async function pullModel() {
  try {
    const fetch = require('node-fetch');
    
    console.log(`📦 Pulling model: ${OLLAMA_MODEL}...`);
    
    const response = await fetch(`${OLLAMA_URL}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: OLLAMA_MODEL })
    });

    if (!response.ok) {
      throw new Error(`Failed to pull model: ${response.status}`);
    }

    // Read response line by line (streaming)
    const text = await response.text();
    const lines = text.trim().split('\n');
    
    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        if (json.status) {
          process.stdout.write(`\r${json.status}`);
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    console.log('\n✅ Model pulled successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to pull model:', error.message);
    throw error;
  }
}

/**
 * Setup Ollama on Linux (GitHub Actions)
 */
function setupOllamaLinux() {
  if (!IS_GITHUB_ACTIONS) {
    console.log('ℹ️  Not in GitHub Actions, skipping Linux setup');
    return;
  }

  console.log('🐧 Setting up Ollama on Linux...');

  try {
    // Install Ollama
    console.log('📥 Installing Ollama...');
    execSync('curl -fsSL https://ollama.ai/install.sh | sh', { 
      stdio: 'inherit',
      shell: '/bin/bash'
    });

    // Start Ollama in background
    console.log('🚀 Starting Ollama service...');
    execSync('ollama serve &', { 
      stdio: 'inherit',
      shell: '/bin/bash',
      detached: true
    });

    console.log('✅ Ollama installed and started');
  } catch (error) {
    console.error('❌ Failed to setup Ollama on Linux:', error.message);
    throw error;
  }
}

/**
 * Setup Ollama on macOS
 */
function setupOllamamacOS() {
  if (!IS_GITHUB_ACTIONS) {
    console.log('ℹ️  Not in GitHub Actions, skipping macOS setup');
    return;
  }

  console.log('🍎 Setting up Ollama on macOS...');

  try {
    console.log('📥 Installing Ollama via Homebrew...');
    execSync('brew install ollama', { 
      stdio: 'inherit'
    });

    console.log('🚀 Starting Ollama...');
    execSync('ollama serve &', { 
      stdio: 'inherit',
      detached: true
    });

    console.log('✅ Ollama installed and started');
  } catch (error) {
    console.error('❌ Failed to setup Ollama on macOS:', error.message);
    throw error;
  }
}

/**
 * Main setup function
 */
async function setupOllama() {
  console.log('🔧 Ollama Setup Module');
  console.log(`📍 Ollama URL: ${OLLAMA_URL}`);
  console.log(`🤖 Model: ${OLLAMA_MODEL}`);
  console.log(`🖥️  Platform: ${PLATFORM}`);
  console.log('');

  try {
    // Check if Ollama is already running
    console.log('🔍 Checking Ollama status...');
    const isRunning = await checkOllamaHealth();

    if (isRunning) {
      console.log('✅ Ollama is already running');
    } else {
      console.log('❌ Ollama is not running, attempting to start...');
      
      // Setup based on platform
      if (PLATFORM === 'linux') {
        setupOllamaLinux();
      } else if (PLATFORM === 'darwin') {
        setupOllamamacOS();
      } else {
        throw new Error(`Unsupported platform: ${PLATFORM}`);
      }
    }

    // Wait for Ollama to be ready
    await waitForOllama();

    // Check if model is available
    console.log('');
    console.log(`🔍 Checking if model ${OLLAMA_MODEL} is available...`);
    const hasModel = await checkModelAvailable();

    if (!hasModel) {
      console.log(`❌ Model ${OLLAMA_MODEL} not found, pulling...`);
      await pullModel();
    } else {
      console.log(`✅ Model ${OLLAMA_MODEL} is available`);
    }

    console.log('');
    console.log('✅ Ollama setup complete!');
    console.log('');
    
    return true;
  } catch (error) {
    console.error('');
    console.error('❌ Ollama setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if this is the main module
if (require.main === module) {
  setupOllama();
}

module.exports = { setupOllama, checkOllamaHealth, checkModelAvailable, waitForOllama, pullModel };
