# Setup Guide - autonomousBLOG

Complete step-by-step setup for autonomousBLOG.

## Prerequisites

- GitHub account
- AI API key (OpenAI, Anthropic, or compatible)
- Git installed locally

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click **+** → **New repository**
3. Repository name: `autonomousBLOG`
4. Visibility: **Public** (required for GitHub Pages)
5. **Do NOT** initialize with README, .gitignore, or license
6. Click **Create repository**

## Step 2: Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/autonomousBLOG.git
cd autonomousBLOG
```

## Step 3: Copy Project Files

Copy all files from this project to your cloned repository:

```
autonomousBLOG/
├── .github/workflows/
├── articles/
├── prompts/
├── scripts/
├── styles/
├── templates/
├── index.html
├── README.md
├── SETUP.md
└── TASKS.md
```

## Step 4: Initial Commit

```bash
git add .
git commit -m "🤖 Setup autonomousBLOG"
git push -u origin main
```

## Step 5: Configure GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Pages** in left sidebar
4. Under **Source**:
   - Select: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
5. Click **Save**
6. Wait 1-2 minutes for deployment
7. Your site will be at: `https://YOUR_USERNAME.github.io/autonomousBLOG/`

## Step 6: Configure AI API Secrets

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these secrets:

| Name | Value | Required |
|------|-------|----------|
| `AI_API_KEY` | Your API key (e.g., `sk-...`) | Yes |
| `AI_API_URL` | API endpoint URL | No |

### Getting API Keys

**OpenAI:**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign in / Create account
3. Go to **API Keys**
4. Click **Create new secret key**
5. Copy the key (starts with `sk-`)

**Alternative Providers:**
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com)
- **Ollama (local)**: No key needed, set `AI_API_URL=http://localhost:11434/v1/chat/completions`

## Step 7: Enable GitHub Actions

1. Go to **Actions** tab
2. If prompted, click **I understand my workflows, go ahead and enable them**
3. You should see two workflows:
   - **Autonomous Article Generation**
   - **Deploy to GitHub Pages**

## Step 8: Test Generation Workflow

1. Go to **Actions** → **Autonomous Article Generation**
2. Click **Run workflow** (dropdown)
3. Select **main** branch
4. Click **Run workflow**
5. Wait for workflow to complete (~1-2 minutes)
6. Check the generated article in `articles/` folder

## Step 9: Verify Deployment

1. Go to **Actions** → **Deploy to GitHub Pages**
2. Verify deployment completed successfully
3. Visit your GitHub Pages URL
4. You should see the homepage with the generated article

## Step 10: Create GitHub Issues

1. Open [TASKS.md](./TASKS.md)
2. Copy each issue template
3. Create issues in your repository:
   - Go to **Issues** tab
   - Click **New issue**
   - Paste issue content
   - Add appropriate labels

## Configuration Options

### Change Generation Frequency

Edit `.github/workflows/autonomous-generate.yml`:

```yaml
on:
  schedule:
    # Every 4 hours (default)
    - cron: '0 */4 * * *'
    
    # Other examples:
    # Every hour: - cron: '0 * * * *'
    # Twice daily: - cron: '0 0,12 * * *'
    # Daily: - cron: '0 0 * * *'
```

### Customize AI Model

Edit `.github/workflows/autonomous-generate.yml`, find the `callAI` function in `generate-article.js`:

```javascript
model: 'gpt-4o-mini'  // Change to your preferred model
```

### Modify Prompts

Edit files in `prompts/` directory:
- `topic-selection.txt` - How topics are chosen
- `article-generation.txt` - How articles are written
- `comparative-analysis.txt` - Year-over-year analysis style
- `fun-content.txt` - Fallback content style

## Troubleshooting

### Workflow Fails

1. Click on failed workflow run
2. Click on failed job
3. Expand error step to see logs
4. Common issues:
   - Invalid API key → Check `AI_API_KEY` secret
   - Rate limiting → Wait and retry
   - Permission error → Check repository permissions

### No Articles Appearing

1. Check if workflow ran successfully
2. Verify `articles/` folder has new files
3. Check if deployment workflow completed
4. Clear browser cache

### GitHub Pages 404

1. Wait 2-3 minutes after deployment
2. Verify Pages is configured correctly
3. Check deployment workflow logs
4. Ensure `index.html` exists in root

### API Costs

Monitor your API usage:
- OpenAI: [platform.openai.com/usage](https://platform.openai.com/usage)
- Each article: ~500-1000 tokens (~$0.01-0.03 with GPT-4o-mini)
- 6 articles/day = ~$0.20-0.50/day

## Next Steps

1. **Customize branding**: Edit `index.html` for logo/tagline
2. **Add analytics**: Insert tracking code in `index.html`
3. **Customize themes**: Edit CSS files in `styles/`
4. **Add social sharing**: Configure proper share URLs
5. **Monitor and adjust**: Review generated content quality

## Support

For issues or questions:
1. Check existing issues in repository
2. Review workflow logs
3. Check GitHub Actions documentation

---

**Happy autonomous blogging! 🤖**
