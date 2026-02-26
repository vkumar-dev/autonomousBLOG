# Testing Guide - autonomousBLOG Article Loading

## Quick Start

### 1. Auto-Open Latest Article (Default Behavior)
When you land on the blog homepage (`/` or `index.html`), it automatically:
1. Loads all articles from `articles-index.json`
2. Detects the latest article (first in the list)
3. Auto-navigates to the article viewer
4. The article content loads from `articles-content.json` cache

**Expected Result:** You should immediately see the latest article displayed in full.

### 2. View Articles List
To see the list of all available articles instead of auto-opening the latest:

**Option A:** Click the **"Articles"** link in the footer  
**Option B:** Navigate to `/?view=list`

**Expected Result:** Shows a grid of all articles with:
- Article title
- Publication date
- Content type (news, article, etc.)
- Reading time estimate
- Latest article marked with "LATEST" badge

### 3. Read an Article
From the articles list:
1. Click any article card
2. The article viewer loads the content from `articles-content.json`
3. Navigation buttons appear:
   - **← autonomousBLOG** (top-left): Go back to homepage/articles
   - **View All Articles** (top-right): Go to articles list
   - **← Back to Articles** (bottom): Return to articles list

**Expected Result:** Article displays with formatted markdown, reading time, word count, and metadata.

---

## Troubleshooting

### Issue: "Error Loading Article - Article not found (404)"

**Common Causes:**

1. **Content cache is out of date**
   - Run: `node scripts/build-articles-content.js`
   - This regenerates `articles-content.json` with all article content

2. **Articles list is out of date**
   - Run: `node scripts/build-articles-list.js`
   - This regenerates `articles-list.json` and `articles-index.json`

3. **Missing article file**
   - Check that the article exists: `articles/2026/02/26/article-name.md`
   - Files should be in: `articles/YYYY/MM/DD/article-slug.md`

### Issue: Landing page shows articles list instead of latest article

- Homepage is auto-navigating correctly; the articles list appears briefly during loading
- If it stays on the list, check browser console for JavaScript errors
- Clear browser cache and reload

### Issue: Article content is blank or not loading

1. Check browser developer tools (F12) for console errors
2. Look for loading progress in Network tab
3. Verify `articles-content.json` exists and is valid JSON
4. Verify article path in `articles-index.json` matches a key in `articles-content.json`

---

## File Relationships

```
index.html (landing page)
    ↓
articles-index.json (metadata)
    ↓
view-article.html?article=PATH (viewer)
    ↓
articles-content.json (article content cache)
    ↓
articles/YYYY/MM/DD/article.md (source files - optional fallback)
```

### Key Files:

| File | Purpose |
|------|---------|
| `articles-index.json` | Article metadata (title, date, excerpt, reading time, etc.) |
| `articles-content.json` | Full article content (markdown) |
| `articles-list.json` | Simple list of article paths |
| `articles/*/` | Source article files (.md) |
| `scripts/build-articles-list.js` | Rebuilds index from source files |
| `scripts/build-articles-content.js` | Rebuilds content cache from source files |

---

## Generating New Articles

After generating a new article with `scripts/generate-article.js`:

1. ✅ Article is created in `articles/YYYY/MM/DD/article-slug.md`
2. ✅ `build-articles-list.js` runs automatically
3. ✅ `build-articles-content.js` runs automatically
4. ✅ Article appears in `articles-index.json` and `articles-content.json`

To manually rebuild after adding articles:
```bash
node scripts/build-articles-list.js
node scripts/build-articles-content.js
```

---

## Browser Console Testing

Open Developer Tools (F12) and check Console tab for:

**Debug logs:**
```
[Homepage] Loaded 9 articles
[Homepage] Auto-navigating to latest article: Article Title
[MarkdownViewer] Loading article: 2026/02/26/article-name.md
[MarkdownViewer] ✓ Loaded from content cache
```

**Or if there's an error:**
```
[MarkdownViewer] Article not found in cache. Available articles: [...]
[MarkdownViewer] Content cache error: ...
```

---

## GitHub Pages Deployment

When deploying to GitHub Pages, ensure these files are committed:
- ✅ `articles-index.json`
- ✅ `articles-content.json`
- ✅ `articles/YYYY/MM/DD/*.md`
- ✅ All script files

The blog will work entirely from the cache; source `.md` files are optional after caching.
