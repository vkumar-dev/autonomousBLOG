/**
 * Homepage Script
 * Loads articles from the articles-index.json
 * Allows users to browse articles or view the latest one
 */

class Homepage {
  constructor() {
    this.articles = [];
    this.articlesGrid = document.getElementById('articles-grid');
    this.isArticleView = this.checkIfArticleView();
    this.init();
  }

  /**
   * Check if we're already viewing an article
   */
  checkIfArticleView() {
    const params = new URLSearchParams(window.location.search);
    return params.has('article') || params.has('view') === false && window.location.pathname.includes('view-article');
  }

  async init() {
    try {
      await this.loadArticles();
      
      // If viewing articles list, render the grid
      if (!this.isArticleView) {
        this.renderArticles();
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
   * Render articles to grid
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
    const articlePath = this.getArticlePath(article);
    const isLatest = index === 0 ? ' is-latest' : '';

    return `
      <a href="${articlePath}" class="article-card${isLatest}" title="${this.escapeHtml(article.title)}">
        ${isLatest ? '<span class="latest-badge">LATEST</span>' : ''}
        <div class="article-card-content">
          <div class="article-meta">
            <span class="article-type">${this.escapeHtml(article.contentType)}</span>
            <span class="article-date">${formattedDate}</span>
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

  /**
   * Navigate to latest article
   */
  static openLatestArticle() {
    if (this.articles && this.articles.length > 0) {
      const latest = this.articles[0];
      const articlePath = `view-article.html?article=${encodeURIComponent(latest.path)}`;
      window.location.href = articlePath;
    }
  }
}

// Initialize homepage when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.homepage = new Homepage();
});

// Auto-open latest article on landing (only on first visit)
document.addEventListener('DOMContentLoaded', () => {
  // Check if we should auto-open the latest article
  const params = new URLSearchParams(window.location.search);
  const shouldOpenLatest = !params.has('view') && window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
  
  // Check if user preference exists (use sessionStorage to allow override)
  const userPreference = sessionStorage.getItem('blog-view-preference');
  
  if (shouldOpenLatest && userPreference !== 'articles-list') {
    // Load articles and auto-open latest
    fetch('articles-index.json')
      .then(r => r.json())
      .then(data => {
        if (data.articles && data.articles.length > 0) {
          const latest = data.articles[0];
          const articlePath = `view-article.html?article=${encodeURIComponent(latest.path)}`;
          // Only auto-navigate if not already viewing articles list
          if (document.getElementById('articles-grid')) {
            // Articles are loaded, don't auto-navigate
            return;
          }
          // Auto-navigate to latest article
          window.location.href = articlePath;
        }
      })
      .catch(err => console.log('Could not auto-open latest article:', err));
  }
});
