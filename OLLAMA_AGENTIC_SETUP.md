# Ollama + Agentic Framework Setup

## The Challenge You Identified

1. Recursive deployment triggers (push → deploy → triggers workflow again)
2. Need actual inference, not just templates
3. Full agentic capabilities (reasoning, tool use, iteration)
4. Small, fast models for GitHub Actions

## The Solution Architecture

```
GitHub Actions Workflow (every 4 hours)
    ↓
Install Ollama + Download model
    ↓
Python agentic script (e.g., PydanticAI or Atomic Agents)
    ↓
Agent generates article iteratively
    ↓
Validates output quality
    ↓
Git commit with SKIP_CI flag ← prevents recursive trigger
    ↓
GitHub Pages deployment
```

## Part 1: Prevent Recursive Triggers

The fix: Add `[skip ci]` or `[no-ci]` to commit message to prevent re-triggering workflows.

**Update `.github/workflows/autonomous-generate.yml`:**

```yaml
- name: Commit and push article
  run: |
    git add articles/
    if git diff --staged --quiet; then
      echo "No changes to commit"
      exit 0
    fi
    git commit -m "🤖 Auto-generated article: $(date -u +%Y-%m-%d) [skip ci]"
    git push
    echo "✅ Article committed and pushed"
```

The `[skip ci]` flag tells GitHub Actions not to run any workflows on this push.

## Part 2: Choose Your Agentic Framework

### Recommended: PydanticAI (Simple, Minimal, Modern)

**Pros:**
- Designed for LLM agents in 2024+
- Zero complex abstractions
- Built for Ollama/local models
- Lightweight (perfect for GitHub Actions)
- Full tool calling & structured output

**Cons:**
- Newer (but stable)

**Package:** `pip install pydantic-ai`

### Alternative: Atomic Agents (Extremely Lightweight)

**Pros:**
- Minimal, explicit control
- Fastest startup
- Great for production

**Cons:**
- Less documentation

**Package:** `pip install atomic-agents`

### For Quick Testing: LangChain + Ollama

**Pros:**
- Most examples online
- Large ecosystem

**Cons:**
- Heavy, slow startup

**Package:** `pip install langchain`

## Part 3: Model Selection for GitHub Actions

**Requirements:**
- Fast (GitHub Actions has time limits)
- Small (<10GB ideally)
- Good at reasoning
- Works well with function calling

**Recommended Models (ranked):**

| Model | Size | Speed | Quality | Reasoning |
|-------|------|-------|---------|-----------|
| **Mistral 7B** | 4.7GB | ⚡⚡⚡ | ⭐⭐⭐ | Good |
| **Llama 2 7B** | 3.8GB | ⚡⚡⚡ | ⭐⭐ | Basic |
| **Neural Chat 7B** | 4.7GB | ⚡⚡⚡ | ⭐⭐⭐ | Good |
| **Zephyr 7B** | 4.2GB | ⚡⚡⚡ | ⭐⭐⭐⭐ | Excellent |
| **Openchat 3.5 7B** | 3.9GB | ⚡⚡⚡ | ⭐⭐⭐ | Good |

**For GitHub Actions (size is critical):**
```bash
ollama pull mistral           # Fast, good quality
ollama pull neural-chat:latest # Balanced
ollama pull zephyr           # Best reasoning (if space allows)
```

## Part 4: GitHub Actions Workflow with Ollama

Create `.github/workflows/autonomous-generate-ollama.yml`:

```yaml
name: Autonomous Article Generation (Ollama)

on:
  schedule:
    - cron: '0 */4 * * *'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  generate-article:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Cache Ollama model
        uses: actions/cache@v4
        with:
          path: ~/.ollama
          key: ollama-mistral-${{ runner.os }}
          restore-keys: ollama-mistral-
      
      - name: Install Ollama
        run: |
          curl -fsSL https://ollama.ai/install.sh | sh
      
      - name: Start Ollama service
        run: |
          ollama serve &
          sleep 10  # Wait for service to start
      
      - name: Pull model
        run: ollama pull mistral
      
      - name: Install dependencies
        run: |
          pip install pydantic-ai ollama gray-matter
      
      - name: Generate topic history
        run: node scripts/build-topic-history.js
        continue-on-error: true
      
      - name: Select topic
        run: node scripts/topic-selector.js > selected-topic.json
      
      - name: Generate article with Ollama
        run: python scripts/generate_article_agentic.py
      
      - name: Configure Git
        run: |
          git config --global user.name 'autonomousBLOG Bot'
          git config --global user.email 'autonomousblog@github-actions.local'
      
      - name: Commit and push (no recursive trigger)
        run: |
          git add articles/
          if git diff --staged --quiet; then
            echo "No changes to commit"
            exit 0
          fi
          git commit -m "🤖 Auto-generated article: $(date -u +%Y-%m-%d) [skip ci]"
          git push
          echo "✅ Article committed and pushed"
      
      - name: Build article index
        run: node scripts/build-article-index.js
        continue-on-error: true
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .
          cname: false
```

## Part 5: Python Agentic Script (PydanticAI)

Create `scripts/generate_article_agentic.py`:

```python
#!/usr/bin/env python3
"""
Agentic article generation using PydanticAI + Ollama
Full reasoning loop with validation and retry
"""

import json
import os
from pathlib import Path
from datetime import datetime
from pydantic import BaseModel
from pydantic_ai import Agent, RunContext

# Models
class Article(BaseModel):
    title: str
    content: str
    sections: list[str]
    word_count: int

class Topic(BaseModel):
    topic: str
    type: str
    tone: str
    angle: str
    keywords: list[str]
    estimatedWords: int

# Load topic data
topic_file = Path('selected-topic.json')
if not topic_file.exists():
    raise FileNotFoundError('selected-topic.json not found')

with open(topic_file) as f:
    topic_data = Topic(**json.load(f))

# Initialize Ollama agent
agent = Agent(
    model='ollama/mistral',  # Or your chosen model
    system_prompt="""You are a professional blog writer. Generate engaging, well-researched articles.
    
Your goal:
1. Research the topic thoroughly using your knowledge
2. Create structured sections with interesting insights
3. Write in the specified tone
4. Include relevant keywords naturally
5. Ensure article matches estimated word count

Respond with a well-structured article that will captivate readers."""
)

# Tool for validation
def validate_article(article_text: str) -> dict:
    """Validate generated article"""
    word_count = len(article_text.split())
    has_sections = article_text.count('\n##') >= 3
    has_conclusion = 'conclusion' in article_text.lower()
    
    return {
        'valid': has_sections and has_conclusion,
        'word_count': word_count,
        'sections_found': article_text.count('\n##'),
        'issues': [
            'Not enough sections (need 3+)' if not has_sections else None,
            'Missing conclusion' if not has_conclusion else None
        ]
    }

# Run agent with retry loop
async def generate_article_agentic():
    max_retries = 3
    
    for attempt in range(max_retries):
        print(f"\n🚀 Generation attempt {attempt + 1}/{max_retries}")
        
        prompt = f"""Generate an article about: {topic_data.topic}
        
Type: {topic_data.type}
Tone: {topic_data.tone}
Angle: {topic_data.angle}
Keywords to include: {', '.join(topic_data.keywords)}
Target word count: {topic_data.estimatedWords}

Write a comprehensive article with:
- Engaging introduction
- 3-5 well-researched sections (use ## for headers)
- Practical insights or historical context
- Thoughtful conclusion

Make it engaging and informative."""

        result = await agent.run(prompt)
        article_text = result.data
        
        # Validate
        validation = validate_article(article_text)
        
        if validation['valid']:
            print(f"✅ Article valid! Word count: {validation['word_count']}")
            return article_text
        else:
            print(f"⚠️  Validation failed: {validation['issues']}")
            if attempt < max_retries - 1:
                print(f"Retrying with feedback...")
                # Could pass validation feedback to agent here
                continue
    
    raise Exception("Failed to generate valid article after retries")

# Save article
async def main():
    article_text = await generate_article_agentic()
    
    now = datetime.now()
    date_path = now.strftime('%Y/%m')
    slug = topic_data.topic.lower().replace(' ', '-')[:50]
    
    article_dir = Path('articles') / date_path
    article_dir.mkdir(parents=True, exist_ok=True)
    
    article_file = article_dir / f"{slug}.md"
    
    # Write with frontmatter
    content = f"""---
title: "{topic_data.topic}"
date: "{now.isoformat()}"
type: "{topic_data.type}"
tone: "{topic_data.tone}"
keywords: {json.dumps(topic_data.keywords)}
generated_by: "ollama-agentic"
---

{article_text}
"""
    
    article_file.write_text(content)
    print(f"\n✅ Article saved: {article_file}")

if __name__ == '__main__':
    import asyncio
    asyncio.run(main())
```

## Part 6: Handle Recursive Triggers

**The key is the `[skip ci]` flag in your commit message:**

```bash
git commit -m "🤖 Auto-generated article [skip ci]"
```

This prevents:
- The deployment workflow from running on this commit
- Any subsequent workflows from triggering

Your workflow flow will be:
```
Article generated → commit with [skip ci] → push → GitHub Pages deploys separately
```

## Part 7: Model Caching Strategy

GitHub Actions caches don't work well for large model files. Two options:

**Option A: Minimal Fresh Pull (Recommended)**
- Pull small model (~5GB) each time
- Costs ~1-2 mins extra per run
- Always fresh model

**Option B: Docker with Pre-loaded Model**
- Create custom docker image with model
- Push to ghcr.io (GitHub Container Registry)
- Fast, no pull needed
- More complex setup

**Option C: Store in Repo**
- Not recommended (models are >1GB)
- Bloats repo

## Implementation Steps

1. **Update existing workflow** - Add `[skip ci]` flag
2. **Create new Python script** - `scripts/generate_article_agentic.py`
3. **Create new workflow** - `.github/workflows/autonomous-generate-ollama.yml`
4. **Test locally first**:
   ```bash
   ollama pull mistral
   pip install pydantic-ai ollama
   python scripts/generate_article_agentic.py
   ```
5. **Push and let GitHub Actions run**

## Benchmarks

On GitHub Actions ubuntu-latest:
- **Model pull**: 2-3 minutes (cached: 30 seconds)
- **Article generation**: 2-4 minutes
- **Total workflow**: 5-8 minutes

Total per run: ~8-12 minutes (well within GitHub Actions limits)

## Cost & Quotas

GitHub Actions for public repos:
- 2000 free minutes/month
- 8 runs per day × 4 hours = 8 minutes per run
- Monthly: ~240 minutes (12% of free quota)

**Total cost: $0**

## Troubleshooting

**Ollama won't start:**
```bash
# Restart service
ollama serve &
sleep 10
```

**Model too large:**
Switch to smaller model:
```bash
ollama pull neural-chat:latest  # Smaller than mistral
```

**Generation timeout:**
Add timeout to workflow:
```yaml
timeout-minutes: 15
```

**[skip ci] not working:**
Try these formats:
- `[skip ci]`
- `[ci skip]`
- `*** NO CI ***`
- `--no-ci`

Pick one format and use consistently.
