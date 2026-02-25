# GitHub Actions Autonomous Setup

This guide explains how to fully automate your blog with GitHub Actions, eliminating the need for local monitoring.

## Overview

The system runs on a schedule (every 4 hours by default) and:
1. Selects a topic for the new article
2. Generates content using your AI API
3. Commits and pushes the article
4. Deploys to GitHub Pages automatically

## Setup Steps

### 1. Add Repository Secrets

Go to **Settings** → **Secrets and variables** → **Actions** and add:

#### For Qwen (Recommended - Free with Alibaba Cloud)
- `QWEN_API_KEY`: Your Qwen API key from Alibaba Cloud DashScope
- `QWEN_MODEL`: (Optional) Model name, defaults to `qwen-plus`
- `QWEN_API_URL`: (Optional) API endpoint, defaults to Alibaba's compatible endpoint

#### For Gemini (Free Tier Available)
- `GEMINI_API_KEY`: Get free key at https://aistudio.google.com

#### For OpenAI or Compatible APIs
- `AI_API_KEY`: Your API key
- `AI_API_URL`: (Optional) API endpoint
- `AI_MODEL`: (Optional) Model name

### 2. Configure GitHub Pages

1. Go to **Settings** → **Pages**
2. Under **Source**, select "Deploy from a branch"
3. Select branch: `main`, folder: `/ (root)`
4. Click **Save**

### 3. Enable Workflows (if needed)

1. Go to **Actions** tab
2. If workflows are disabled, click "Enable workflows"
3. Check that both workflows are listed:
   - `Autonomous Article Generation`
   - `Deploy to GitHub Pages`

### 4. Test the Workflow

1. Go to **Actions** tab
2. Select **Autonomous Article Generation**
3. Click **Run workflow** → **Run workflow**
4. Watch the execution in real-time

Check the workflow logs:
- **Generate topic history** - Builds history of covered topics
- **Select topic** - Chooses next article topic
- **Generate article content** - Creates the article using AI
- **Commit and push article** - Saves to repository
- **Trigger deployment** - Deploys to GitHub Pages

### 5. Verify Deployment

After workflow completes:
1. Check **Actions** → **Deploy to GitHub Pages** was triggered
2. Visit your site: `https://yourusername.github.io/autonomousBLOG/`
3. Verify new article appears on homepage

## Customization

### Change Generation Frequency

Edit `.github/workflows/autonomous-generate.yml`:

```yaml
on:
  schedule:
    - cron: '0 */6 * * *'  # Change to every 6 hours
```

Common cron expressions:
- `'0 */4 * * *'` - Every 4 hours (default)
- `'0 */6 * * *'` - Every 6 hours
- `'0 0 * * *'` - Once daily at midnight (UTC)
- `'0 */2 * * *'` - Every 2 hours
- `'0 8,14,20 * * *'` - At 8am, 2pm, 8pm (UTC)

### Modify Workflow Behavior

The workflow is divided into stages:

```
1. Checkout code
2. Setup environment
3. Build topic history
4. Select topic
5. Generate article
6. Commit changes
7. Build index
8. Trigger deployment
```

Each stage can be adjusted in the YAML file.

## Troubleshooting

### Workflow Not Running

1. Check **Actions** → **Workflows** - confirm both are enabled
2. Go to **Settings** → **Actions** → **General** → "Actions Permissions"
3. Select "Allow all actions and reusable workflows"

### Articles Not Being Generated

1. Check workflow logs for errors:
   - "Check AI Configuration" should show API key found
   - "Generate article content" should show completion
   
2. If no API key is detected:
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Verify secret is set correctly (names are case-sensitive)
   - Re-run workflow

3. If topic selection fails:
   - Check "Select topic" step logs
   - May indicate an issue with topic selector script

### Deployment Not Updating

1. Verify "Deploy to GitHub Pages" workflow ran successfully
2. Check **Settings** → **Pages** configuration
3. Clear browser cache
4. Wait 1-2 minutes for GitHub Pages to update

## Monitoring Status

### View Workflow Status

1. Go to **Actions** tab
2. See run history and status
3. Click any run to see detailed logs

### Check Latest Article

1. Visit your site: `https://yourusername.github.io/autonomousBLOG/`
2. New articles appear at top of list
3. Check articles published timestamp

### Manual Triggers

To generate an article without waiting for schedule:

1. Go to **Actions** → **Autonomous Article Generation**
2. Click **Run workflow**
3. Select branch (main) and click **Run workflow**

## API Configuration Details

### Qwen (Recommended)

1. Get API key at https://dashscope.aliyuncs.com/
2. Create a new API key in the console
3. Add to repository secrets as `QWEN_API_KEY`
4. Optional: Set `QWEN_MODEL` to desired model (default: qwen-plus)

Available models:
- `qwen-plus` - Balanced performance/cost
- `qwen-turbo` - Faster, lower quality
- `qwen-max` - Highest quality, higher cost

### Gemini (Free Alternative)

1. Go to https://aistudio.google.com
2. Create new API key (free tier available)
3. Add to repository secrets as `GEMINI_API_KEY`

### OpenAI / Compatible APIs

1. Get API key from your provider
2. Set `AI_API_KEY` secret
3. Optional: Set `AI_API_URL` if using custom endpoint
4. Optional: Set `AI_MODEL` for custom model

## How It Works

```
GitHub Actions Runner (Scheduled every 4 hours)
    ↓
Checkout latest code
    ↓
Build topic history from existing articles
    ↓
AI selects next topic (new/trending or fallback)
    ↓
AI generates article (with Qwen/Gemini/OpenAI)
    ↓
Node script processes output (formats, builds index)
    ↓
Git commits article to main branch
    ↓
Deployment workflow triggered automatically
    ↓
GitHub Pages deploys updated site
    ↓
Site live at yourusername.github.io/autonomousBLOG/
```

## Important Notes

- All content is generated using AI - customize prompts in `prompts/` directory
- Repository must be public for GitHub Pages to work
- GitHub Actions are free for public repositories
- Workflows execute in isolated environment (no local machine needed)
- All changes are tracked in git history
