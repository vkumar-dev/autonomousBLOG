# GitHub Actions Quick Start (5 minutes)

## What You Need

1. Your repository on GitHub (public)
2. One API key from: Qwen, Gemini, or OpenAI

## Step 1: Add API Key (1 min)

1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add your API key:
   - **For Qwen**: Name = `QWEN_API_KEY`, Value = your key
   - **For Gemini**: Name = `GEMINI_API_KEY`, Value = your key
   - **For OpenAI**: Name = `AI_API_KEY`, Value = your key
4. Click **Add secret**

## Step 2: Enable GitHub Pages (2 min)

1. Go to **Settings** → **Pages**
2. Under "Source", select "Deploy from a branch"
3. Branch = `main`, Folder = `/ (root)`
4. Click **Save**

## Step 3: Enable Workflows (1 min)

1. Go to **Actions** tab
2. If disabled, click **Enable workflows**
3. You should see:
   - ✅ Autonomous Article Generation
   - ✅ Deploy to GitHub Pages

## Step 4: Test It (1 min)

1. Go to **Actions** → **Autonomous Article Generation**
2. Click **Run workflow** → **Run workflow**
3. Watch it run! Takes 1-2 minutes
4. Check your site: `https://yourusername.github.io/autonomousBLOG/`

## That's It!

Your blog now generates articles every 4 hours automatically. No more local monitoring needed.

## Next Steps

- Check articles generate every 4 hours
- Customize prompts in `prompts/` directory
- Change frequency: Edit `.github/workflows/autonomous-generate.yml` cron
- View logs: **Actions** tab shows all runs

## Get API Keys

**Qwen** (Free): https://dashscope.aliyuncs.com/
**Gemini** (Free tier): https://aistudio.google.com
**OpenAI**: https://platform.openai.com/api-keys
