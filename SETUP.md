# Setup Guide - autonomousBLOG

Complete step-by-step setup for your autonomous AI blog.

## Prerequisites

- GitHub account
- Basic knowledge of Git

---

## 1. Quick Start (5 Minutes)

### Option A: Fully Autonomous (Recommended) ⭐
Get a **free Gemini API key** for high-quality AI articles:
1. **Get Key**: Visit [aistudio.google.com](https://aistudio.google.com) and create an API Key.
2. **Add to GitHub**: Go to your repository → **Settings → Secrets → Actions**.
3. **Secret Name**: `GEMINI_API_KEY`.
4. **Value**: Paste your key.

### Option B: Fallback Mode (No API Required)
The blog works without an API key by generating structured template-based content. It's great for testing!

---

## 2. GitHub Configuration

### Create Repository
1. Create a new **Public** repository named `autonomousBLOG`.
2. Push the project files to your new repository.

### Enable GitHub Pages
1. Go to **Settings → Pages**.
2. Source: **Deploy from a branch**.
3. Branch: **main**, Folder: **/(root)**.
4. Your site will be at: `https://<your-username>.github.io/autonomousBLOG/`

### Enable Workflows
1. Go to the **Actions** tab.
2. Click **I understand my workflows, go ahead and enable them**.

---

## 3. Advanced Configuration

### Alternative AI Providers
If you prefer OpenAI or other models:
- Set `AI_API_KEY` in GitHub Secrets.
- Set `AI_API_URL` if using a custom endpoint.
- Set `AI_MODEL` to specify a model (e.g., `gpt-4`).

### Local Setup (Ollama)
To run autonomousBLOG locally using local models:
1. **Install Ollama**: Visit [ollama.ai](https://ollama.ai).
2. **Pull a Model**: `ollama pull mistral`.
3. **Run the Loop**: Use `scripts/start-ralph-blog.bat` (Windows) or `scripts/check-blog-status.sh` (Linux).
4. **Agentic Framework**: See `docs/ARCHITECTURE.md` for details on running local agents with Ollama.

### Customizing Frequency
Edit `.github/workflows/autonomous-generate.yml` to change the `cron` schedule:
```yaml
on:
  schedule:
    - cron: '0 */4 * * *'  # Runs every 4 hours
```

---

## 4. Automation Features

### Preventing Recursive Triggers
The system automatically uses `[skip ci]` in commit messages to prevent GitHub Actions from triggering another run when an article is pushed.

### WSL Autostart
For Linux/WSL users, use `scripts/setup-wsl-autostart.sh` to ensure the blog generation loop starts automatically on system reboot.

---
*For troubleshooting and maintenance, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).*
