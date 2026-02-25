# GitHub Actions Autonomous Setup (No API Keys)

## The Vision

Your blog runs **completely autonomous** on GitHub Actions with:
- ✅ Zero API keys
- ✅ Zero costs
- ✅ Zero secrets management
- ✅ Zero authentication headaches

Every 4 hours, GitHub's servers automatically:
1. Select a topic
2. Generate an article (free inference, no API)
3. Commit to your repository
4. Deploy to GitHub Pages

## Setup (2 Steps)

### Step 1: Configure GitHub Pages

1. Go to **Settings** → **Pages**
2. Under "Source", select "Deploy from a branch"
3. Select branch: `main`, folder: `/ (root)`
4. Click **Save**

That's it. GitHub Pages is now enabled and will auto-deploy whenever articles are committed.

### Step 2: Verify Workflows Are Enabled

1. Go to **Actions** tab
2. You should see two workflows:
   - ✅ Autonomous Article Generation
   - ✅ Deploy to GitHub Pages
3. If disabled, click "Enable workflows"

Done. Your blog is now autonomous.

## How It Works

```
Every 4 Hours (GitHub Actions)
    ↓
Build topic history from existing articles
    ↓
AI selects next topic (using smart prompts)
    ↓
Generate article using free inference
    ↓
Node.js formats and processes article
    ↓
Git commits article to main branch
    ↓
Deployment workflow triggered automatically
    ↓
GitHub Pages rebuilds and deploys site
    ↓
New article live at yourusername.github.io/autonomousBLOG/
```

## Testing the Workflow

### Manual Trigger

To test without waiting 4 hours:

1. Go to **Actions** tab
2. Click **Autonomous Article Generation**
3. Click **Run workflow** dropdown
4. Select branch: `main`
5. Click **Run workflow**
6. Watch it execute (takes 1-2 minutes)

### Check Results

1. Go to **Actions** → **Autonomous Article Generation**
2. Click the completed run
3. Review logs for each step:
   - ✅ Generate topic history
   - ✅ Select topic
   - ✅ Generate article content (Free Inference)
   - ✅ Commit and push article
   - ✅ Build article index
   - ✅ Trigger deployment

4. After ~30 seconds, **Deploy to GitHub Pages** workflow should start
5. Wait for deployment to complete
6. Visit your site: `https://yourusername.github.io/autonomousBLOG/`

## Customization

### Change Generation Frequency

Edit `.github/workflows/autonomous-generate.yml`, line 6:

```yaml
on:
  schedule:
    - cron: '0 */4 * * *'  # Change the 4
```

**Common patterns:**
- `'0 */2 * * *'` - Every 2 hours
- `'0 */4 * * *'` - Every 4 hours (default)
- `'0 */6 * * *'` - Every 6 hours
- `'0 0 * * *'` - Once daily (midnight UTC)
- `'0 8 * * *'` - Once daily at 8am UTC
- `'0 0 * * 0'` - Once weekly (Sundays)

### Customize Topics & Themes

**Topic selection:** Edit `scripts/topic-selector.js`
**Article style:** Edit `prompts/` directory files
**Themes:** Edit `styles/` directory

### Monitor Progress

Check **Actions** tab to see:
- Current and past workflow runs
- Success/failure status
- Execution time
- What was generated

## Understanding the Workflow Steps

### Step: Generate Topic History
Scans all existing articles to build a history of covered topics.
- Prevents duplicate articles about same topic
- Helps AI pick fresh, diverse topics
- Automatically skipped if no articles exist yet

### Step: Select Topic
Runs smart topic selection logic:
1. Tries to find trending/new topics
2. Falls back to "this day in history" comparisons
3. Falls back to fun content if nothing else applies
4. Avoids duplicate topics from history

### Step: Generate Article Content (Free Inference)
Creates article using intelligent templates and topic data:
- **No API calls needed**
- **No cost**
- Uses structured templates with topic-specific variations
- Random theme selection (10 available themes)
- Generates appropriate sections based on content type

### Step: Commit and Push
Saves the generated article to your repository:
- Commits to `main` branch
- Tags with timestamp
- Pushes to GitHub (no auth needed, uses GITHUB_TOKEN)

### Step: Build Article Index
Updates article metadata index:
- Rebuilds articles-list.json
- Rebuilds articles-index.json
- Prepares site for deployment

### Step: Trigger Deployment
Signals to deployment workflow to update GitHub Pages:
- Deployment workflow starts automatically
- Rebuilds site with new article
- Publishes to your GitHub Pages URL

## Troubleshooting

### Workflows Not Running on Schedule

**Check 1: Workflows enabled?**
- Go to **Actions** tab
- If you see "Workflows are disabled", click "Enable workflows"

**Check 2: Permissions correct?**
- Go to **Settings** → **Actions** → **General**
- Set "Actions permissions" to "Allow all actions and reusable workflows"

**Check 3: CRON schedule correct?**
- GitHub runs scheduled workflows in UTC
- Times are in UTC, not your local timezone
- Jobs must complete within GitHub limits

### Articles Not Being Generated

**Check 1: Read workflow logs**
1. Go to **Actions** → **Autonomous Article Generation**
2. Click latest run
3. Review "Generate article content" logs
4. Look for error messages

**Check 2: Topic selection failing?**
- Workflow will show error in "Select topic" step
- Check if topic-selector.js has dependencies available
- May be issue with topic source (API down, etc.)

**Check 3: Article generation failing?**
- Look for errors in "Generate article content" step
- Should see "Using completely free inference"
- No API key errors should appear

### Site Not Updating After Article Generated

**Check 1: Deployment workflow ran?**
- Go to **Actions** → **Deploy to GitHub Pages**
- Should see run triggered after article generated
- Check if it shows green checkmark (success)

**Check 2: Pages deployment correct?**
- Go to **Settings** → **Pages**
- Verify "Deploy from a branch" is selected
- Branch should be `main`, folder should be `/ (root)`

**Check 3: Browser cache?**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or open in incognito/private window

**Check 4: Wait for DNS propagation**
- First deployment can take 1-2 minutes
- GitHub Pages caches may need refresh

## Cost & Usage

**GitHub Actions:**
- 2,000 free minutes/month (public repos)
- Each workflow run: ~30-60 seconds
- Monthly runs: 360 (every 4 hours × 30 days)
- Monthly usage: ~3-6 hours (well within free limit)

**GitHub Pages:**
- Completely free
- Unlimited deployments
- Unlimited bandwidth

**Total Cost:** $0 / month

## How to Delete Old Workflows

If you have old workflow files you don't need:

1. Go to `.github/workflows/` directory
2. Delete unwanted `.yml` files
3. Commit and push changes
4. Old workflows won't appear in **Actions** tab anymore

Example: `rm .github/workflows/old-workflow.yml`

## Next Steps

1. **Wait for first run** (or manually trigger)
2. **Verify article appears** on your site
3. **Customize topics & themes** as desired
4. **Share your autonomous blog** with the world!

No more monitoring. No more manual generation. Just pure, autonomous blogging.
