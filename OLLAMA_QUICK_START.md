# Ollama + Agentic Generation Quick Start

## The Plan

1. **Local testing** - Run Ollama + PydanticAI locally
2. **GitHub Actions** - Deploy to actions (no recursive triggers)
3. **Fully autonomous** - AI reasoning + article generation every 4 hours

## Step 1: Test Locally (5 minutes)

### Install Ollama
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.com/download
```

### Start Ollama
```bash
ollama serve &
sleep 5
```

### Pull a model
```bash
# Option A: Fastest (recommended for testing)
ollama pull neural-chat:latest    # 4.1GB, very fast

# Option B: Best reasoning
ollama pull mistral               # 4.7GB, great balance

# Option C: Lightweight
ollama pull tinyllama             # 637MB, but lower quality

# Test it works
ollama run mistral "Say hello"
```

### Install Python dependencies
```bash
pip install pydantic-ai ollama gray-matter
```

### Generate a test article
```bash
# This will create a dummy topic
echo '{
  "topic": "The Future of AI",
  "type": "article",
  "tone": "casual",
  "angle": "Exploring possibilities",
  "keywords": ["AI", "future", "technology"],
  "estimatedWords": 800
}' > selected-topic.json

# Generate article
python scripts/generate_article_agentic.py
```

This should:
1. ✅ Start Ollama
2. ✅ Load your chosen model
3. ✅ Reason about the topic
4. ✅ Generate article with sections
5. ✅ Validate and retry if needed
6. ✅ Save to `articles/YYYY/MM/article-name.md`

## Step 2: Push to GitHub

```bash
git add -A
git commit -m "feat: add Ollama + PydanticAI agentic generation"
git push origin main
```

Files pushed:
- `.github/workflows/autonomous-generate-ollama.yml` ← New workflow
- `scripts/generate_article_agentic.py` ← New script
- `OLLAMA_AGENTIC_SETUP.md` ← Documentation

## Step 3: Trigger GitHub Actions Workflow

1. Go to **Actions** tab on GitHub
2. Click **Autonomous Article Generation (Ollama)**
3. Click **Run workflow**
4. Watch it generate your first article

This will:
1. ✅ Install Ollama on GitHub's runner
2. ✅ Pull the model
3. ✅ Generate article
4. ✅ Commit with `[skip ci]` flag (prevents re-triggering)
5. ✅ Deploy to GitHub Pages

## Step 4: Verify It Works

After workflow completes:
1. Check **Actions** → **Autonomous Article Generation (Ollama)** → Latest run
2. Check your site: `https://yourusername.github.io/autonomousBLOG/`
3. New article should appear

## Key Features

✅ **Real inference** - Not templates, actual AI reasoning
✅ **Agentic loop** - Generates, validates, retries if needed
✅ **No recursive triggers** - Uses `[skip ci]` flag
✅ **Fast models** - Mistral 7B runs in 2-4 mins
✅ **Zero costs** - GitHub Actions free tier
✅ **Self-improving** - Iterates until article is good quality

## Troubleshooting

### Ollama won't start
```bash
# Check if it's already running
pgrep ollama

# Kill existing and restart
pkill ollama
sleep 2
ollama serve &
```

### Model download is slow
- GitHub Actions is slow with downloads (1-3 mins)
- This is normal - models are large
- Once cached, subsequent runs are faster

### Article generation fails
Check logs in GitHub Actions:
1. Go to **Actions** → **workflow run**
2. Click **Generate article with Ollama**
3. Look for error message
4. Common issues:
   - Model didn't pull correctly (re-run workflow)
   - Ollama service didn't start (check port 11434)
   - Python error (check imports)

### Article quality is poor
- Use better model: `ollama pull mistral` or `ollama pull neural-chat`
- Better models = slower generation but better quality
- Adjust tone/angle in `scripts/topic-selector.js`

### Recursive trigger issue (workflow running multiple times)
Check that commit message includes `[skip ci]`:
```bash
git log --oneline | head -5
# Should see: 🤖 Auto-generated article... [skip ci]
```

If missing, edit workflow line:
```yaml
git commit -m "🤖 Auto-generated article: $(date) [skip ci]"
```

## Customization

### Change model
Edit `.github/workflows/autonomous-generate-ollama.yml`:
```yaml
- name: Pull Ollama model
  run: ollama pull neural-chat:latest
```

### Change generation frequency
Edit line 5:
```yaml
- cron: '0 */6 * * *'  # Every 6 hours instead of 4
```

### Add more validation
Edit `scripts/generate_article_agentic.py`, function `validate_article()`

### Change system prompt
Edit `scripts/generate_article_agentic.py`, variable `system_prompt`

## Model Recommendations

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| **neural-chat** | 4.1GB | ⚡⚡ | ⭐⭐⭐⭐ | Best balance |
| **mistral** | 4.7GB | ⚡ | ⭐⭐⭐⭐ | Deep reasoning |
| **zephyr** | 4.2GB | ⚡⚡ | ⭐⭐⭐⭐⭐ | Best quality (if space) |
| **openchat** | 3.9GB | ⚡⚡⚡ | ⭐⭐⭐ | Fastest |

For GitHub Actions, use **neural-chat** (best balance of speed/quality).

## What's Different from Template Generation?

### Before (Templates)
```
Topic: "AI Breakthroughs"
  ↓
Fill template with hardcoded sections
  ↓
Generic article about any topic
```

### Now (Ollama + Agentic)
```
Topic: "AI Breakthroughs"
  ↓
Agent reasons about topic using knowledge
  ↓
Generates unique sections and insights
  ↓
Validates article meets quality standards
  ↓
Retries if validation fails
  ↓
Topic-specific, thoughtful article
```

Real AI reasoning, not just templates.

## Next Steps

1. **Run locally** - Make sure it works
2. **Push to GitHub** - Files already in repo
3. **Trigger workflow** - Test once manually
4. **Monitor first run** - Watch logs for issues
5. **Set to schedule** - Workflows run automatically every 4 hours

Your autonomous blog is now powered by real AI inference. Enjoy!
