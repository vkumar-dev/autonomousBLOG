/**
 * Homepage Script
 * Loads articles directly from the articles folder
 * Articles are sorted by filename (timestamp format: YYYYMMDD-HHMMSS)
 */

class Homepage {
  constructor() {
    this.articles = [];
    this.articlesGrid = document.getElementById('articles-grid');
    this.init();
  }

  async init() {
    try {
      await this.loadArticles();
      this.renderArticles();
    } catch (error) {
      console.error('Failed to initialize homepage:', error);
      this.renderError();
    }
  }

  /**
   * Load articles from folder listing
   */
  async loadArticles() {
    // Fetch directory listing (requires server support or we use a predefined list)
    // For now, we'll use an API endpoint that lists files
    const response = await fetch('articles-list.json');
    
    if (!response.ok) {
      throw new Error(`Failed to load articles: ${response.status}`);
    }
    
    const files = await response.json();
    
    // Filter for .html files only, sort by filename descending (latest first)
    this.articles = files
      .filter(f => f.endsWith('.html'))
      .sort((a, b) => b.localeCompare(a))
      .map(filename => this.parseArticleFile(filename));
    
    console.log(`[Homepage] Loaded ${this.articles.length} articles`);
  }

  /**
   * Parse article metadata from filename and fetch content
   */
  parseArticleFile(filename) {
    // Filename format: YYYYMMDD-HHMMSS-article-slug.{md|html}
    const match = filename.match(/^(\d{8})-(\d{6})-(.+)\.(md|html)$/);
    
    if (!match) {
      return null;
    }
    
    const [, dateStr, timeStr, slug, ext] = match;
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hours = timeStr.substring(0, 2);
    const minutes = timeStr.substring(2, 4);
    const seconds = timeStr.substring(4, 6);
    
    const isoDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
    const date = new Date(isoDate);
    
    // Convert slug back to title (uppercase first letter of each word)
    const title = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return {
      filename,
      title,
      date: date.toISOString(),
      slug,
      ext,
      path: `articles/${filename}`
    };
  }

  /**
   * Render articles to grid
   */
  renderArticles() {
    if (!this.articlesGrid) return;

    // Filter out null entries
    const validArticles = this.articles.filter(a => a !== null);

    if (validArticles.length === 0) {
      this.renderEmptyState();
      return;
    }

    this.articlesGrid.innerHTML = validArticles.map(article => this.createArticleCard(article)).join('');
    
    // Update article count
    const countElement = document.getElementById('articles-count');
    if (countElement) {
      countElement.textContent = `${validArticles.length} article${validArticles.length !== 1 ? 's' : ''}`;
    }
  }

  /**
   * Create article card HTML
   */
  createArticleCard(article) {
    const date = new Date(article.date);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const articlePath = this.getArticlePath(article);

    return `
      <a href="${articlePath}" class="article-card" title="${this.escapeHtml(article.title)}">
        <div class="article-card-content">
          <div class="article-meta">
            <span class="article-type">${article.ext === 'html' ? 'HTML' : 'Article'}</span>
            <span class="article-date">${formattedDate}</span>
          </div>
          <h3 class="article-title">${this.escapeHtml(article.title)}</h3>
          <p class="article-excerpt">Read more about "${this.escapeHtml(article.title)}"...</p>
        </div>
      </a>
    `;
  }

  /**
   * Get article file path
   */
  getArticlePath(article) {
    // Direct link to HTML file
    return article.path;
  }

  /**
   * Render empty state
   */
  renderEmptyState() {
    if (!this.articlesGrid) return;

    this.articlesGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <h3>No articles yet</h3>
        <p>Our AI is working on the first article. Check back soon!</p>
      </div>
    `;
  }

  /**
   * Render error state
   */
  renderError() {
    if (!this.articlesGrid) return;

    this.articlesGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Unable to load articles</h3>
        <p>Please refresh the page or check back later.</p>
      </div>
    `;
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize homepage when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.homepage = new Homepage();
});
