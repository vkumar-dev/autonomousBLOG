# autonomousBLOG

🤖 An AI-powered autonomous blog that generates and publishes content automatically via GitHub Actions.

[![GitHub stars](https://img.shields.io/github/stars/vkumar-dev/autonomousBLOG?style=social)](https://github.com/vkumar-dev/autonomousBLOG/stargazers)

**If you find this useful, please ⭐ star it!** It helps others discover this project.

![GitHub Actions](https://img.shields.io/badge/powered%20by-GitHub%20Actions-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- **🤖 Autonomous Generation**: Automatically generates articles every 4 hours via GitHub Actions
- **🎨 Dual Theme Homepage**: Randomly selects between futuristic white and black themes
- **🎭 10 Article Themes**: Each article gets a unique, randomly generated theme
- **📅 Smart Topic Selection**: 
  - Reports new/trending topics first
  - Falls back to "this day last year" comparative analysis
  - Generates fun content when nothing noteworthy exists
- **🔄 No Duplicates**: Tracks previously covered topics to avoid repetition
- **📄 GitHub Pages**: Deploys automatically to GitHub Pages

## Quick Start

### 1. Create Repository

```bash
# Create a new public repository on GitHub named "autonomousBLOG"
# Clone it locally
git clone https://github.com/yourusername/autonomousBLOG.git
cd autonomousBLOG
```

### 2. Copy Files

Copy all project files to your repository.

### 3. Configure GitHub Pages

1. Go to **Settings** → **Pages**
2. Under **Source**, select "Deploy from a branch"
3. Select branch: `main`, folder: `/ (root)`
4. Click **Save**

### 4. Configure AI API

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add repository secrets:
   - `AI_API_KEY`: Your AI API key (OpenAI, Anthropic, etc.)
   - `AI_API_URL` (optional): Custom API endpoint

### 5. Enable Workflows

1. Go to **Actions** tab
2. Enable workflows if prompted
3. Manually trigger "Autonomous Article Generation" to test

### 6. Push and Deploy

```bash
git add .
git commit -m "Initial autonomousBLOG setup"
git push -u origin main
```

Your site will be live at: `https://yourusername.github.io/autonomousBLOG/`

## Project Structure

```
autonomousBLOG/
├── .github/
│   └── workflows/
│       ├── autonomous-generate.yml  # Runs every 4 hours
│       └── deploy.yml               # Deploys to GitHub Pages
├── articles/                        # Generated articles (dated folders)
├── prompts/
│   ├── topic-selection.txt          # Topic selection prompt
│   ├── article-generation.txt       # Main article prompt
│   ├── comparative-analysis.txt     # Year-over-year analysis
│   └── fun-content.txt              # Fallback fun content
├── scripts/
│   ├── topic-selector.js            # Selects next topic
│   ├── generate-article.js          # Generates article content
│   ├── build-topic-history.js       # Builds topic history
│   ├── build-article-index.js       # Creates article index
│   ├── theme-manager.js             # Homepage theme management
│   ├── homepage.js                  # Homepage functionality
│   └── article.js                   # Article page functionality
├── styles/
│   ├── homepage.css                 # Base homepage styles
│   ├── theme-white.css              # Futuristic white theme
│   ├── theme-black.css              # Futuristic black theme
│   ├── article.css                  # Base article styles
│   └── article-*.css                # 10 article themes
├── templates/
│   └── article.html                 # Article HTML template
├── index.html                       # Homepage
├── TASKS.md                         # GitHub Issues to create
├── README.md                        # This file
└── SETUP.md                         # Detailed setup guide
```

## How It Works

### Content Generation Flow

```
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions (Every 4 Hours)                             │
├─────────────────────────────────────────────────────────────┤
│  1. Build topic history from existing articles              │
│  2. Select topic using priority logic:                      │
│     a. New/trending topics (not previously covered)         │
│     b. Historical events (comparative analysis)             │
│     c. Fun content (fallback)                               │
│  3. Call AI API with appropriate prompt                     │
│  4. Generate dated article file with random theme           │
│  5. Commit and push to repository                           │
│  6. Trigger deployment workflow                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Deploy Workflow                                            │
├─────────────────────────────────────────────────────────────┤
│  1. Build article index (articles-index.json)               │
│  2. Deploy to GitHub Pages                                  │
└─────────────────────────────────────────────────────────────┘
```

### Theme System

**Homepage Themes** (randomly selected on each load):
- **Futuristic White**: Clean, glassmorphism, blue/purple accents
- **Futuristic Black**: Dark, neon, cyberpunk aesthetic

**Article Themes** (randomly assigned per article):
1. Minimalist Clean
2. Neon Nights
3. Paper & Ink
4. Ocean Breeze
5. Forest Calm
6. Sunset Vibes
7. Matrix Code
8. Cotton Candy
9. Industrial
10. Aurora

## Customization

### Modify Generation Frequency

Edit `.github/workflows/autonomous-generate.yml`:

```yaml
on:
  schedule:
    - cron: '0 */4 * * *'  # Change this cron expression
```

### Add Custom Prompts

Edit files in `prompts/` directory to customize AI behavior.

### Add New Themes

1. Create CSS file: `styles/article-your-theme.css`
2. Add theme name to `scripts/generate-article.js`

### Change Topic Sources

Edit `scripts/topic-selector.js` to fetch from different APIs:
- Reddit API
- Hacker News
- Twitter Trends
- RSS Feeds

## API Integration

The system supports any OpenAI-compatible API:

```bash
# OpenAI
AI_API_URL=https://api.openai.com/v1/chat/completions

# Local LLM (e.g., Ollama)
AI_API_URL=http://localhost:11434/v1/chat/completions

# Other providers
AI_API_URL=https://api.anthropic.com/v1/messages
```

## Troubleshooting

### Articles not generating

1. Check **Actions** tab for workflow errors
2. Verify `AI_API_KEY` secret is set correctly
3. Check workflow run logs for specific errors

### GitHub Pages not updating

1. Ensure deploy workflow completed successfully
2. Clear browser cache
3. Check **Settings** → **Pages** configuration

### Theme not loading

1. Verify all CSS files are present
2. Check browser console for errors
3. Clear cache and reload

## Contributing

See [TASKS.md](./TASKS.md) for planned features and issues.

## License

MIT License - See LICENSE file for details.

---

**Built with ❤️ by autonomousBLOG**
