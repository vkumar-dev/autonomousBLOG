/**
 * Markdown Viewer for Articles
 * Converts markdown articles to HTML and displays them
 * Handles .md file serving and rendering
 */

class MarkdownViewer {
  constructor() {
    this.articlePath = this.extractArticlePathFromUrl();
    this.init();
  }

  /**
   * Extract article path from URL
   * e.g., /autonomousBLOG/view-article.html?article=2026/02/26/my-article.md
   */
  extractArticlePathFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const article = params.get('article');
    
    if (!article) {
      // Try from hash
      const hash = window.location.hash.slice(1);
      if (hash) return hash;
    }
    
    return article;
  }

  /**
   * Initialize viewer
   */
  async init() {
    try {
      if (!this.articlePath) {
        this.showError('No article specified');
        return;
      }

      // Load and parse markdown
      const markdown = await this.loadMarkdown();
      const { frontmatter, content } = this.parseFrontmatter(markdown);
      
      // Render HTML
      this.renderArticle(frontmatter, content);
      
    } catch (error) {
      console.error('Error loading article:', error);
      this.showError(`Failed to load article: ${error.message}`);
    }
  }

  /**
   * Load markdown file - uses content cache first, then tries direct fetch
   */
  async loadMarkdown() {
    console.log('[MarkdownViewer] Loading article:', this.articlePath);
    
    try {
      // First, try to load from content cache
      console.log('[MarkdownViewer] Trying content cache...');
      const cacheResponse = await fetch('articles-content.json');
      if (cacheResponse.ok) {
        const contentCache = await cacheResponse.json();
        const content = contentCache[this.articlePath];
        
        if (content) {
          console.log('[MarkdownViewer] ✓ Loaded from content cache');
          return content;
        } else {
          console.warn('[MarkdownViewer] Article not found in cache. Available articles:', Object.keys(contentCache).slice(0, 3));
        }
      } else {
        console.warn('[MarkdownViewer] Content cache fetch returned', cacheResponse.status);
      }
    } catch (error) {
      console.warn('[MarkdownViewer] Content cache error:', error.message);
    }
    
    // Fallback: try direct file fetch
    console.log('[MarkdownViewer] Trying direct file fetch...');
    try {
      let response = await fetch(`articles/${this.articlePath}`);
      console.log('[MarkdownViewer] Fetch articles/... returned:', response.status);
      
      if (!response.ok) {
        // Try without prefix in case it's already in the path
        response = await fetch(this.articlePath);
        console.log('[MarkdownViewer] Fetch without prefix returned:', response.status);
      }
      
      if (response.ok) {
        const text = await response.text();
        if (text && text.trim().length > 0) {
          console.log('[MarkdownViewer] ✓ Loaded from direct fetch');
          return text;
        }
      }
    } catch (error) {
      console.warn('[MarkdownViewer] Direct fetch failed:', error.message);
    }
    
    throw new Error(`Could not load article: ${this.articlePath}. Make sure the article file exists and the articles-content.json cache is up to date.`);
  }

  /**
   * Parse YAML frontmatter and content
   */
  parseFrontmatter(markdown) {
    const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!match) {
      throw new Error('Invalid article format: missing frontmatter');
    }

    const frontmatter = this.parseFrontmatterBlock(match[1]);
    const content = match[2];

    return { frontmatter, content };
  }

  /**
   * Parse YAML-like frontmatter
   */
  parseFrontmatterBlock(block) {
    const data = {};
    const lines = block.split('\n');

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Parse arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => {
          let trimmed = v.trim();
          if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
              (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            trimmed = trimmed.slice(1, -1);
          }
          return trimmed;
        });
      }

      data[key] = value;
    }

    return data;
  }

  /**
   * Convert markdown to HTML (simple)
   */
  markdownToHtml(markdown) {
    let html = markdown
      // Headers
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
      // Code blocks
      .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Lists
      .replace(/^[\*\-] (.*?)$/gm, '<li>$1</li>')
      .replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[hp])/gm, '<p>')
      .replace(/$/gm, '</p>');

    return html;
  }

  /**
   * Render article to page
   */
  renderArticle(frontmatter, content) {
    const html = this.markdownToHtml(content);
    const now = new Date(frontmatter.date || new Date());
    
    // Get formatted date and relative time
    const formattedDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    const timeInfo = TimeFormatter ? TimeFormatter.getFullTimeInfo(now) : {
      dateTime: formattedDate,
      relativeTime: 'recently',
      fullText: 'Generated recently'
    };

    // Create article HTML
    const articleHtml = `
      <article class="article-page">
        <nav class="article-nav">
          <a href="index.html?view=list" class="nav-home">
            <span class="nav-icon">←</span>
            <span class="nav-text">autonomousBLOG</span>
          </a>
          <a href="index.html?view=list" class="nav-articles">
            <span class="nav-text">View All Articles</span>
            <span class="nav-icon">📰</span>
          </a>
        </nav>

        <header class="article-header">
          <div class="header-content">
            <div class="article-meta">
              <span class="meta-type">${this.escapeHtml(frontmatter.contentType || 'Article')}</span>
              <span class="meta-theme">${this.escapeHtml(frontmatter.theme || 'default')}</span>
              <span class="meta-date" title="${timeInfo.dateTime}">${timeInfo.relativeTime}</span>
            </div>
            <h1 class="article-title">${this.escapeHtml(frontmatter.title || 'Untitled')}</h1>
            <p class="article-excerpt">${this.escapeHtml(frontmatter.excerpt || '')}</p>
            <div class="article-stats">
              <span class="stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                ${frontmatter.readingTime || 5} min read
              </span>
              <span class="stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
                ${frontmatter.wordCount || 0} words
              </span>
            </div>
          </div>
        </header>

        <main class="article-content">
          <article id="article-body">
            ${html}
          </article>
          <footer class="article-footer">
            <p class="generated-info">
              <span class="bot-icon">🤖</span>
              This article was autonomously generated by autonomousBLOG
            </p>
            <p class="generation-date">${timeInfo.fullText} • ${timeInfo.dateTime}</p>
            <div class="article-nav-footer">
              <a href="index.html?view=list" class="btn-back">← Back to Articles</a>
            </div>
          </footer>
        </main>
      </article>
    `;

    // Set page content
    document.body.innerHTML = articleHtml;
    document.title = `${frontmatter.title || 'Article'} - autonomousBLOG`;
    
    // Apply theme
    this.applyTheme(frontmatter.theme);
  }

  /**
   * Apply theme to article
   */
  applyTheme(theme) {
    // Remove existing theme classes
    document.body.classList.remove('theme-white', 'theme-black');
    
    // Determine which theme to use
    if (!theme || theme === 'default') {
      // Random theme
      theme = Math.random() > 0.5 ? 'theme-white' : 'theme-black';
    } else {
      theme = `theme-${theme.split('-')[0]}`;
    }

    document.body.classList.add(theme, 'theme-loaded');
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Show error message
   */
  showError(message) {
    document.body.innerHTML = `
      <div style="padding: 2rem; max-width: 600px; margin: 0 auto;">
        <nav style="padding: 1.5rem 0; border-bottom: 1px solid rgba(125, 125, 125, 0.1); margin-bottom: 2rem;">
          <a href="index.html?view=list" style="text-decoration: none; color: inherit; opacity: 0.7; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
            <span>←</span>
            <span>Back to Articles</span>
          </a>
        </nav>
        <div style="
          background: #fee;
          color: #c33;
          padding: 1.5rem;
          border-radius: 8px;
          border-left: 4px solid #c33;
        ">
          <h2 style="margin: 0 0 0.5rem 0;">Error Loading Article</h2>
          <p style="margin: 0;">${this.escapeHtml(message)}</p>
          <p style="margin: 1rem 0 0 0; font-size: 0.9rem; opacity: 0.8;">
            <strong>Troubleshooting:</strong> Make sure the article file exists in the articles folder. 
            You can <a href="index.html" style="color: #c33; text-decoration: underline;">view the full articles list</a>.
          </p>
        </div>
      </div>
    `;
    document.title = 'Error - autonomousBLOG';
    document.body.classList.add('theme-white', 'theme-loaded');
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  new MarkdownViewer();
});
