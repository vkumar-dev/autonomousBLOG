# autonomousBLOG - Project Tasks & Issues

Copy these issues to your GitHub repository to track progress.

---

## Issue #1: Setup GitHub Pages Basic Template

**Label:** `enhancement`, `priority: high`

### Description
Set up the basic GitHub Pages deployment infrastructure for autonomousBLOG.

### Tasks
- [ ] Create `index.html` as the main homepage entry point
- [ ] Configure GitHub Pages to deploy from `main` branch `/root` directory
- [ ] Add basic HTML structure with placeholder for article list
- [ ] Create `.github/workflows/deploy.yml` for automatic deployment
- [ ] Test deployment workflow

### Acceptance Criteria
- GitHub Pages is enabled and accessible at `https://<username>.github.io/autonomousBLOG/`
- Basic homepage loads without errors
- Deployment happens automatically on push to main branch

---

## Issue #2: Implement Homepage with Dual Theme System

**Label:** `enhancement`, `ui`, `priority: high`

### Description
Create a futuristic homepage that randomly chooses between white and black themes on each load.

### Tasks
- [ ] Create `styles/homepage-futuristic-white.css` theme
- [ ] Create `styles/homepage-futuristic-black.css` theme
- [ ] Implement random theme selection in JavaScript
- [ ] Design article card layout with hover effects
- [ ] Add smooth transitions between theme elements
- [ ] Ensure responsive design for mobile devices

### Design Requirements
**White Theme:**
- Clean white/silver background
- Subtle gradients and shadows
- Blue/purple accent colors
- Glassmorphism effects

**Black Theme:**
- Deep black/dark gray background
- Neon accent colors (cyan, magenta)
- Glow effects on cards
- Cyberpunk aesthetic

### Acceptance Criteria
- Theme randomly selected on each page load
- Both themes are visually distinct and futuristic
- Article list displays correctly in both themes
- Smooth animations and transitions

---

## Issue #3: Create GitHub Actions Autonomous Generation Workflow

**Label:** `automation`, `github-actions`, `priority: critical`

### Description
Set up GitHub Actions workflow to run every 4 hours and generate new content autonomously.

### Tasks
- [ ] Create `.github/workflows/autonomous-generate.yml`
- [ ] Configure cron schedule for every 4 hours: `0 */4 * * *`
- [ ] Set up Node.js environment
- [ ] Install required dependencies (node-fetch, etc.)
- [ ] Create article generation script
- [ ] Implement file commit and push back to repository
- [ ] Trigger deployment workflow after generation

### Workflow Steps
1. Checkout repository
2. Set up Node.js
3. Install dependencies
4. Run topic selection logic
5. Call AI API for content generation
6. Generate dated article file
7. Commit and push new article
8. Trigger deployment

### Acceptance Criteria
- Workflow runs automatically every 4 hours
- New article file is created with proper date format
- Changes are committed and pushed successfully
- Deployment is triggered automatically

---

## Issue #4: Implement AI Prompting System with Topic Logic

**Label:** `ai`, `prompt-engineering`, `priority: critical`

### Description
Create intelligent topic selection and prompting system that avoids duplicates and adapts content based on available information.

### Tasks
- [ ] Create `prompts/topic-selection.txt` - main topic selection prompt
- [ ] Create `prompts/article-generation.txt` - article writing prompt
- [ ] Create `prompts/comparative-analysis.txt` - "this day last year" prompt
- [ ] Create `prompts/fun-content.txt` - fallback fun content prompt
- [ ] Implement `scripts/check-duplicates.js` to avoid reporting same topics
- [ ] Create `scripts/topic-selector.js` with decision logic
- [ ] Maintain `articles/topic-history.json` for tracking

### Topic Selection Logic
```
1. Check for new/sw trending topics
   └─→ If found AND not previously reported → Generate news article
   
2. If no new topics OR all topics already reported
   └─→ Check for "this day last year" historical events
       └─→ If found → Generate comparative analysis
       
3. If nothing noteworthy
   └─→ Generate fun/entertaining content
```

### Acceptance Criteria
- System never reports the same topic twice
- Fallback mechanisms work correctly
- Prompts produce varied, engaging content
- Topic history is maintained and checked

---

## Issue #5: Create Article Template Generator with Random Themes

**Label:** `ui`, `templates`, `priority: high`

### Description
Each article should have a unique, randomly generated theme and layout for variety.

### Tasks
- [ ] Create 10+ distinct article theme templates in `templates/`
- [ ] Implement random theme selection per article
- [ ] Create `styles/article-*.css` for each theme
- [ ] Design varied layouts (single column, multi-column, magazine style)
- [ ] Add unique typography combinations
- [ ] Include varied header styles and hero sections
- [ ] Implement reading progress indicator
- [ ] Add share buttons with theme-matching colors

### Theme Ideas
1. **Minimalist Clean** - Simple, typography-focused
2. **Neon Nights** - Dark with neon accents
3. **Paper & Ink** - Vintage newspaper style
4. **Ocean Breeze** - Blue gradients, wave patterns
5. **Forest Calm** - Green tones, organic shapes
6. **Sunset Vibes** - Orange/pink gradients
7. **Matrix Code** - Green on black, digital rain
8. **Cotton Candy** - Pastel colors, soft shadows
9. **Industrial** - Concrete textures, bold typography
10. **Aurora** - Northern lights gradient background

### Acceptance Criteria
- Each article has a randomly assigned theme
- Themes are visually distinct from each other
- All themes are readable and accessible
- Theme information is stored in article metadata

---

## Issue #6: Implement Dated Article Storage System

**Label:** `backend`, `file-structure`, `priority: high`

### Description
Articles should be stored in a dated format for automatic chronological listing.

### Tasks
- [ ] Define file naming convention: `articles/YYYY/MM/YYYY-MM-DD-article-slug.md`
- [ ] Create directory structure automatically
- [ ] Implement slug generation from titles
- [ ] Add frontmatter metadata to each article
- [ ] Create `scripts/generate-article-file.js`

### Article Frontmatter Format
```yaml
---
title: "Article Title"
date: "2026-02-24T12:00:00Z"
theme: "neon-nights"
topic: "AI Breakthrough"
wordCount: 850
readingTime: 4
generated: true
---
```

### Acceptance Criteria
- Articles stored in dated directory structure
- File names are URL-safe slugs
- Frontmatter contains all required metadata
- Homepage can parse and list articles chronologically

---

## Issue #7: Build Article Listing and Navigation

**Label:** `frontend`, `navigation`, `priority: medium`

### Description
Homepage should automatically load and display articles based on datetime.

### Tasks
- [ ] Create `scripts/build-article-index.js` to generate article list
- [ ] Generate `articles-index.json` for fast loading
- [ ] Implement article card component
- [ ] Add pagination or infinite scroll
- [ ] Create article detail page template
- [ ] Implement navigation between articles
- [ ] Add "Load More" functionality

### Acceptance Criteria
- Homepage displays articles in reverse chronological order
- Article cards show title, date, excerpt, reading time
- Clicking article navigates to full article page
- Navigation works smoothly

---

## Issue #8: Create Content Variation and Quality Controls

**Label:** `ai`, `quality`, `priority: medium`

### Description
Ensure generated content is varied, high-quality, and engaging.

### Tasks
- [ ] Implement tone variation (formal, casual, humorous, technical)
- [ ] Add word count targets (500-1500 words)
- [ ] Create content structure templates
- [ ] Implement fact-checking reminders in prompts
- [ ] Add readability scoring
- [ ] Create style guide for AI

### Acceptance Criteria
- Articles have varied writing styles
- Content length is appropriate
- Articles are well-structured
- No repetitive phrasing across articles

---

## Issue #9: Add Analytics and Monitoring

**Label:** `analytics`, `monitoring`, `priority: low`

### Description
Track generation success, topics covered, and system health.

### Tasks
- [ ] Create generation log system
- [ ] Track successful vs failed generations
- [ ] Monitor topic distribution
- [ ] Add workflow run badges to README
- [ ] Create simple analytics dashboard page

### Acceptance Criteria
- Generation history is logged
- Failed generations are tracked
- Basic analytics are visible

---

## Issue #10: Documentation and Setup Guide

**Label:** `documentation`, `priority: medium`

### Description
Create comprehensive documentation for setup and customization.

### Tasks
- [ ] Write detailed README.md
- [ ] Create SETUP.md with step-by-step instructions
- [ ] Document prompt customization options
- [ ] Add troubleshooting guide
- [ ] Create CONTRIBUTING.md

### Acceptance Criteria
- New users can set up in under 15 minutes
- All configuration options are documented
- Common issues have solutions

---

## Quick Start Checklist

After creating issues, follow these steps:

1. **Create Repository**
   - [ ] Create new public repository on GitHub
   - [ ] Clone locally
   - [ ] Copy all project files

2. **Initial Setup**
   - [ ] Copy TASKS.md issues to GitHub Issues
   - [ ] Enable GitHub Pages (Settings → Pages)
   - [ ] Set source to "Deploy from a branch" → main branch

3. **Configure AI**
   - [ ] Set up AI API credentials (GitHub Secrets)
   - [ ] Add `AI_API_KEY` to repository secrets
   - [ ] Add `AI_MODEL` preference if needed

4. **Test Workflow**
   - [ ] Manually trigger generation workflow
   - [ ] Verify article is created
   - [ ] Verify deployment works
   - [ ] Check GitHub Pages site

5. **Go Live**
   - [ ] Enable scheduled workflow
   - [ ] Monitor first few automated runs
   - [ ] Adjust prompts as needed

---

## Priority Order

1. **Phase 1 (Critical):** Issues #1, #3, #4
2. **Phase 2 (High):** Issues #2, #5, #6
3. **Phase 3 (Medium):** Issues #7, #8, #10
4. **Phase 4 (Low):** Issue #9

Start with Issue #1 and work through sequentially within each phase.
