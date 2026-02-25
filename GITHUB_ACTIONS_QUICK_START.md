# GitHub Actions Quick Start (1 minute)

## What You Need
- Your repository on GitHub (public)
- That's it. No API keys. No costs.

## Step 1: Enable GitHub Pages (1 min)

1. Go to **Settings** → **Pages**
2. Under "Source", select "Deploy from a branch"
3. Branch = `main`, Folder = `/ (root)`
4. Click **Save**

## Step 2: Done!

Your blog is now autonomous. Workflows run automatically every 4 hours on GitHub's servers.

- ✅ No API keys needed
- ✅ No costs
- ✅ No secrets to manage
- ✅ Completely free

## Verify It Works

1. Go to **Actions** tab
2. Check workflow status
3. Wait 4 hours for next article, or click **Run workflow** to test immediately
4. Visit your site: `https://yourusername.github.io/autonomousBLOG/`

## Change Article Frequency

Edit `.github/workflows/autonomous-generate.yml`:

```yaml
on:
  schedule:
    - cron: '0 */4 * * *'  # Change 4 to 6, 12, 24, etc.
```

Examples:
- `'0 */4 * * *'` - Every 4 hours
- `'0 0 * * *'` - Once daily
- `'0 0 * * 0'` - Once weekly

## How It Works

1. GitHub Actions runs every 4 hours
2. Topic selector picks a topic
3. Free inference generates article (no API)
4. Article commits to your repo
5. GitHub Pages auto-deploys
6. Site updates with new article

## That's It

Your autonomous blog is live and fully self-sustaining.
