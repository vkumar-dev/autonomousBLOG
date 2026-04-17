#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class GhInference {
  constructor(model = 'openai/gpt-4o-mini') {
    this.model = model;
    this.timeout = 600000;
  }

  async isAvailable() {
    try {
      const result = spawnSync('gh', ['--version'], { stdio: 'ignore' });
      if (result.status !== 0) return false;
      const authResult = spawnSync('gh', ['auth', 'status'], { stdio: 'ignore' });
      return authResult.status === 0;
    } catch (error) {
      return false;
    }
  }

  setupGitIdentity() {
    try {
      spawnSync('git', ['config', '--local', 'user.name', `${this.model} (Autonomous Agent)`]);
      spawnSync('git', ['config', '--local', 'user.email', 'agent@github.com']);
      console.log(`👤 Git identity set to: ${this.model} (Autonomous Agent)`);
    } catch (error) {
      console.warn('⚠️  Could not set local git identity:', error.message);
    }
  }

  async generate(prompt, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 4096,
      systemPrompt = "You are a creative assistant.",
      verbose = true
    } = options;

    try {
      if (verbose) {
        console.log(`📡 Connecting to GitHub Models via gh cli...`);
        console.log(`🤖 Model: ${this.model}`);
      }

      const args = [
        'models', 'run', this.model,
        '--system-prompt', systemPrompt,
        '--temperature', temperature.toString(),
        '--max-tokens', maxTokens.toString()
      ];

      const result = spawnSync('gh', args, { 
        input: prompt, 
        encoding: 'utf8',
        timeout: this.timeout
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.status !== 0) {
        throw new Error(`gh cli exited with code ${result.status}: ${result.stderr}`);
      }

      if (verbose) {
        console.log('✅ Content generated successfully via GitHub Models');
      }

      return {
        success: true,
        content: result.stdout.trim(),
        model: this.model
      };
    } catch (error) {
      if (verbose) {
        console.error('❌ GitHub Models generation failed:', error.message);
      }

      return {
        success: false,
        error: error.message,
        content: null
      };
    }
  }

  async listModels() {
    try {
      const result = spawnSync('gh', ['models', 'list'], { encoding: 'utf8' });
      if (result.status !== 0) return [];
      const lines = result.stdout.trim().split('\n');
      return lines.slice(1).map(line => {
        const [id, ...displayNameParts] = line.trim().split(/\s{2,}/);
        return { id, name: displayNameParts.join(' ') };
      });
    } catch (error) {
      console.error('Error listing models:', error.message);
      return [];
    }
  }
}

module.exports = GhInference;
