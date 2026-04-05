# Project Architecture & Code Design

This document details the internal design, file structure, and logic of autonomousBLOG.

## Directory Structure
```
autonomousBLOG/
├── .github/workflows/     # GitHub Actions (Generation & Deploy)
├── articles/              # Generated articles in YYYY/MM/DD/ format
├── docs/                  # Technical documentation and history
├── prompts/               # AI prompts (Topic selection, generation, fallback)
├── scripts/               # JavaScript logic and automation
│   ├── utils/             # Reusable utility modules
│   ├── generate-article.js # Main generation entry point
│   └── topic-selector.js  # Decision logic for content
├── styles/                # CSS themes for homepage and articles
└── templates/             # HTML templates for article rendering
```

## Generation Logic (Dual-Path Logic)
The `topic-selector.js` script uses a prioritized decision flow:
1. **News/Trending Topics**: First, it checks for fresh/trending topics not previously covered.
2. **Year-Over-Year History**: If no news is found, it performs a comparative analysis ("this day last year").
3. **Fun/Fallback Content**: If nothing noteworthy exists, it generates entertaining/educational content.

## Utility Modules (v2 Refactor)
The codebase includes optimized `v2` scripts that leverage shared utility modules:
- `scripts/utils/constants.js`: Centralized configuration and magic numbers.
- `scripts/utils/frontmatter.js`: Unified parsing of markdown frontmatter.
- `scripts/utils/file-system.js`: Shared operations for recursive file scanning and directory management.
- `scripts/utils/fetch-helper.js`: API calls with 30-second timeouts, retry logic, and validation.

## Local Inference & Agentic Frameworks
The system supports local LLM execution via **Ollama**.
- **Model Support**: Optimally works with Mistral 7B, Llama 2, or Zephyr 7B.
- **Workflow Protection**: Uses the `[skip ci]` commit flag to prevent recursive GitHub Actions triggers.
- **Agentic Logic**: Supports reasoning loops where the AI can validate its own output before saving.

## Internet Search Capability
The system is designed to simulate/integrate real-time search by fetching from trending APIs (Hacker News, Reddit, Twitter Trends) or using AI with search-tool capabilities (if configured).

---
*For setup instructions, see [SETUP.md](../SETUP.md).*
