/**
 * Homepage Script
 * Loads articles from the articles-index.json
 * Supports: auto-open latest, infinite scroll, autoscroll
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
      
      // Check URL params to determine view mode
      const params = new URLSearchParams(window.location.search);
      const viewMode = params.get('view');
      
      // Explicit list view with infinite scroll
      if (viewMode === 'list') {
        console.log('[Homepage] Showing articles list with infinite scroll');
        this.renderArticlesWithInfiniteScroll();
        return;
      }
      
      // Explicit scroll view (infinite scroll + autoscroll)
      if (viewMode === 'scroll') {
        console.log('[Homepage] Showing scroll view with autoscroll');
        this.renderArticlesWithInfiniteScroll();
        // Auto-start autoscroll
        setTimeout(() => {
          if (window.infiniteScroll) {
            window.infiniteScroll.toggleAutoscroll();
          }
        }, 500);
        return;
      }
      
      // Explicit latest view (used by footer links)
      if (viewMode === 'latest') {
        console.log('[Homepage] Showing latest article');
        if (this.articles.length > 0) {
          this.openLatestArticle();
        } else {
          this.renderEmptyState();
        }
        return;
      }
      
      // Default: auto-redirect to latest article on first visit
      if (this.articles.length > 0) {
        console.log('[Homepage] Auto-navigating to latest article (default)');
        this.openLatestArticle();
      } else {
        this.renderEmptyState();
      }
    } catch (error) {
      console.error('Failed to initialize homepage:', error);
      this.renderError();
    }
  }

  /**
   * Load articles from index
   */
  async loadArticles() {
    const response = await fetch('articles-index.json');
    
    if (!response.ok) {
      throw new Error(`Failed to load articles: ${response.status}`);
    }
    
    const data = await response.json();
    this.articles = data.articles || [];
    
    console.log(`[Homepage] Loaded ${this.articles.length} articles`);
  }

  /**
   * Open latest article
   */
  openLatestArticle() {
    if (this.articles.length === 0) return;
    
    const latest = this.articles[0];
    console.log('[Homepage] Auto-navigating to latest article:', latest.title);
    const articlePath = `view-article.html?article=${encodeURIComponent(latest.path)}`;
    window.location.href = articlePath;
  }

  /**
   * Render articles with infinite scroll
   */
  renderArticlesWithInfiniteScroll() {
    if (!this.articlesGrid) return;

    if (this.articles.length === 0) {
      this.renderEmptyState();
      return;
    }

    // Initialize infinite scroll manager with all articles
    if (window.infiniteScroll) {
      window.infiniteScroll.initializeWithArticles(this.articles);
    }
    
    // Update article count
    const countElement = document.getElementById('articles-count');
    if (countElement) {
      countElement.textContent = `${this.articles.length} article${this.articles.length !== 1 ? 's' : ''}`;
    }
  }

  /**
   * Render articles to grid (legacy)
   */
  renderArticles() {
    if (!this.articlesGrid) return;

    if (this.articles.length === 0) {
      this.renderEmptyState();
      return;
    }

    this.articlesGrid.innerHTML = this.articles.map((article, index) => this.createArticleCard(article, index)).join('');
    
    // Update article count
    const countElement = document.getElementById('articles-count');
    if (countElement) {
      countElement.textContent = `${this.articles.length} article${this.articles.length !== 1 ? 's' : ''}`;
    }
  }

  /**
   * Create article card HTML
   */
  createArticleCard(article, index) {
    const formattedDate = this.formatDate(article.date);
    const timeInfo = TimeFormatter ? TimeFormatter.getFullTimeInfo(article.date) : {
      dateTime: formattedDate,
      relativeTime: 'recently'
    };
    const articlePath = this.getArticlePath(article);
    const isLatest = index === 0 ? ' is-latest' : '';

    return `
      <a href="${articlePath}" class="article-card${isLatest}" title="${this.escapeHtml(article.title)}">
        ${isLatest ? '<span class="latest-badge">LATEST</span>' : ''}
        <div class="article-card-content">
          <div class="article-meta">
            <span class="article-type">${this.escapeHtml(article.contentType)}</span>
            <span class="article-date" title="${timeInfo.dateTime}">${timeInfo.relativeTime}</span>
          </div>
          <h3 class="article-title">${this.escapeHtml(article.title)}</h3>
          <p class="article-excerpt">${this.escapeHtml(article.excerpt || 'Read more about ' + article.title)}</p>
          <div class="article-footer">
            <span class="reading-time">${article.readingTime || 5} min read</span>
          </div>
        </div>
      </a>
    `;
  }

  /**
   * Get article file path
   */
  getArticlePath(article) {
    // Link to view-article.html with article path parameter
    if (article.path && article.path.endsWith('.md')) {
      return `view-article.html?article=${encodeURIComponent(article.path)}`;
    }
    // Direct link to article file
    return `articles/${article.path || article.file}`;
  }

  /**
   * Format date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
