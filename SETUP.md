# Setup Guide - autonomousBLOG

Complete step-by-step setup for autonomousBLOG.

## Prerequisites

- GitHub account
- Git installed locally

## Quick Start (5 minutes)

### Option A: Fully Autonomous (Recommended) ⭐

Get a **free Gemini API key** for high-quality AI articles:

1. **Get Free API Key** (2 minutes, no credit card):
   - Visit: https://aistudio.google.com
   - Sign in with Google account
   - Click "Get API Key" → "Create API Key"
   - Copy the key (starts with `AIza...`)

2. **Add to GitHub Secrets**:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `GEMINI_API_KEY`
   - Value: Paste your API key
   - Click "Add secret"

3. **Done!** Articles will be AI-generated with Gemini (1,500 free requests/day)

### Option B: Fallback Mode (No Setup Required)

The blog works **without any API key** - it will generate template-based content automatically.

**Quality**: Good for structure, but less creative than AI-generated

**To upgrade later**: Just add `GEMINI_API_KEY` secret

---

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

1. Go to **Settings** tab
2. Click **Pages** in left sidebar
3. Under **Source**:
   - Select: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
4. Click **Save**
5. Wait 1-2 minutes for deployment
6. Your site will be at: `https://YOUR_USERNAME.github.io/autonomousBLOG/`

## Step 6: Configure AI (Optional but Recommended)

### Get Free Gemini API Key

1. **Visit**: https://aistudio.google.com
2. **Sign in** with any Google account
3. **Click** "Get API Key" (top right)
4. **Click** "Create API Key in new project"
5. **Copy** the key (starts with `AIza...`)

### Add Secret to GitHub

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - Name: `GEMINI_API_KEY`
   - Value: Your API key from step 5
4. Click **Add secret**

### Alternative: OpenAI or Other Providers

If you prefer other AI providers:

| Secret | Value | Required |
|--------|-------|----------|
| `AI_API_KEY` | Your API key (e.g., `sk-...`) | Only if not using Gemini |
| `AI_API_URL` | API endpoint URL | Optional |
| `AI_MODEL` | Model name | Optional |

---

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

### Workflow Output

You'll see one of these messages:

```
✅ Gemini API key found - will use Gemini (free tier)
✅ Article created: articles/2026/02/your-article.md
Generation mode: AI-GENERATED
```

Or if no API key:

```
⚠️  No API key found - will use fallback content generation
💡 For better quality articles, add GEMINI_API_KEY secret
✅ Article created: articles/2026/02/your-article.md
Generation mode: FALLBACK (no API key)
```

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

---

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

### API Provider Comparison

| Provider | Free Tier | Credit Card | Quality |
|----------|-----------|-------------|---------|
| **Gemini** | 1,500/day | ❌ No | ⭐⭐⭐⭐⭐ |
| Fallback | Unlimited | ❌ No | ⭐⭐⭐ |
| OpenAI | $0 trial | ✅ Yes | ⭐⭐⭐⭐⭐ |
| Cloudflare | ~100/day | ❌ No | ⭐⭐⭐⭐ |

### Modify Prompts

Edit files in `prompts/` directory:
- `topic-selection.txt` - How topics are chosen
- `article-generation.txt` - How articles are written
- `comparative-analysis.txt` - Year-over-year analysis style
- `fun-content.txt` - Fallback content style

---

## Troubleshooting

### Workflow Fails

1. Click on failed workflow run
2. Click on failed job
3. Expand error step to see logs
4. Common issues:
   - Invalid API key → Check `GEMINI_API_KEY` secret
   - Rate limiting → Wait and retry (limits reset daily)
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

### API Key Not Working

1. Verify key starts with `AIza...`
2. Check for extra spaces in secret value
3. Test key manually:
   ```bash
   curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_KEY" \
     -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
   ```

### Rate Limit Errors

Gemini free tier limits:
- 1,500 requests/day (resets midnight Pacific)
- 15 requests/minute

If you hit limits:
- Wait for reset (daily limits reset at midnight PT)
- Space out requests (stay under 15/minute)
- Consider upgrading to paid tier for higher limits

---

## Understanding Generation Modes

### AI-Generated Mode (with API key)

**When**: `GEMINI_API_KEY` or `AI_API_KEY` secret is set

**Output**: High-quality, creative, well-researched articles

**Cost**: Free with Gemini (1,500/day)

### Fallback Mode (no API key)

**When**: No API key configured

**Output**: Template-based, structured content

**Cost**: Free, unlimited

**Use case**: 
- Getting started quickly
- Testing the system
- When you don't need high-quality content

---

## Next Steps

1. **Customize branding**: Edit `index.html` for logo/tagline
2. **Add analytics**: Insert tracking code in `index.html`
3. **Customize themes**: Edit CSS files in `styles/`
4. **Monitor and adjust**: Review generated content quality

## Support

For issues or questions:
1. Check existing issues in repository
2. Review workflow logs
3. Check GitHub Actions documentation

---

**Happy autonomous blogging! 🤖**

## Quick Reference

### Get Gemini API Key
https://aistudio.google.com → Get API Key → Create

### Add GitHub Secret
Settings → Secrets and variables → Actions → New repository secret

### Your Blog URL
`https://YOUR_USERNAME.github.io/autonomousBLOG/`

### Workflow Runs
https://github.com/YOUR_USERNAME/autonomousBLOG/actions
