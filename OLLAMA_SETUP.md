# Ollama Setup for autonomousBLOG

This guide explains how to set up Ollama for AI-powered article generation.

## Quick Start

The workflow automatically attempts to:
1. Detect if Ollama is running
2. Install Ollama (in GitHub Actions)
3. Pull the required model
4. Generate articles with AI

## Option 1: Use Remote Ollama (Recommended for GitHub Actions)

If you have a remote Ollama instance already running, you can point the workflow to it.

### Setup Steps:

1. **Have Ollama running somewhere** (local machine, server, cloud instance)
   ```bash
   ollama serve
   ```

2. **Make it accessible** via a public URL (use ngrok, tailscale, or cloud provider)
   ```bash
   # Example with ngrok:
   ngrok http 11434
   # You'll get a URL like: https://xxxx-xx-xxx-xxx.ngrok.io
   ```

3. **Add GitHub Secrets** to your repository:
   - Go to: Settings → Secrets and variables → Actions → New repository secret
   - Add: `OLLAMA_URL` = `https://your-ollama-url.com`
   - Add: `OLLAMA_MODEL` = `mistral` (or your preferred model)

4. **The workflow will use your remote Ollama** on next run

### Supported Models:
- `mistral` (recommended, lightweight)
- `neural-chat`
- `dolphin-mixtral`
- `llama2`
- Any model available in Ollama

## Option 2: Local Ollama (Fast, No Setup)

If you have Ollama installed locally and want to test:

```bash
# 1. Install Ollama from https://ollama.ai
# 2. Start Ollama
ollama serve

# 3. In another terminal, run the generation script
node scripts/generate-article-ollama.js
```

## Option 3: GitHub Actions with Local Ollama (Slow but Free)

The workflow will attempt automatic setup in GitHub Actions:
- Downloads and installs Ollama
- Pulls the model
- Generates articles

⚠️ **Note**: This takes 5-10 minutes per run. Use Option 1 for faster generation.

## Troubleshooting

### Article shows "fallback content"
This means Ollama wasn't available during generation. Check:
1. Is Ollama running at the `OLLAMA_URL`?
2. Can GitHub Actions reach the URL? (might need to whitelist GitHub's IP ranges)
3. Is the model installed? (`ollama pull mistral`)

### CORS errors when accessing remote Ollama
Ollama doesn't have built-in CORS headers. Use a reverse proxy or ngrok.

### Want to test locally?
```bash
# Start Ollama
ollama serve

# In another terminal, test the script
node scripts/generate-article-ollama.js
```

## Model Performance

| Model | Size | Speed | Quality | Recommended |
|-------|------|-------|---------|-------------|
| mistral | 4.4GB | Fast | Good | ✅ Yes |
| neural-chat | 3.8GB | Very Fast | Good | ✅ Yes |
| dolphin-mixtral | 26GB | Slow | Excellent | For quality |
| llama2 | 3.8GB | Fast | Good | Yes |

## Setting Up a Remote Ollama Server

### On a Linux Server:

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull mistral

# Start the service (background)
nohup ollama serve > /tmp/ollama.log 2>&1 &

# Make it accessible (example with ngrok)
ngrok http 11434
```

### Using Docker:

```bash
docker run -d \
  -p 11434:11434 \
  -v ollama:/root/.ollama \
  --name ollama \
  ollama/ollama

# Pull model inside container
docker exec ollama ollama pull mistral

# Expose with ngrok
ngrok http 11434
```

## Performance Tips

- **Smaller models** (mistral, neural-chat) generate articles in 1-3 minutes
- **Larger models** (dolphin-mixtral) take 5-15 minutes but higher quality
- Use **GPU** for 2-3x faster generation (requires CUDA/Metal support)
- Run Ollama on a **dedicated machine** to avoid slowdowns

## Next Steps

1. Choose your Ollama setup option
2. Add GitHub secrets if using remote Ollama
3. Trigger the workflow: `gh workflow run autonomous-generate.yml`
4. Articles will be generated with real AI content!
