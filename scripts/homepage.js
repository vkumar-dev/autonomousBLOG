/**
 * Homepage Script
 * Loads and displays articles from the article index
 */

const ARTICLES_INDEX_URL = 'articles-index.json';

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
   * Load articles from index
   */
  async loadArticles() {
    const response = await fetch(ARTICLES_INDEX_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to load articles: ${response.status}`);
    }
    
    const data = await response.json();
    this.articles = data.articles || [];
    
    // Sort by date descending
    this.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    
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

    this.articlesGrid.innerHTML = this.articles.map(article => this.createArticleCard(article)).join('');
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

    const typeLabels = {
      'news': 'News',
      'historical': 'Analysis',
      'fun': 'Fun',
      'comparative-analysis': 'Analysis',
      'article': 'Article'
    };

    const typeLabel = typeLabels[article.contentType] || 'Article';
    const articlePath = this.getArticlePath(article);

    return `
      <a href="${articlePath}" class="article-card">
        <div class="article-card-content">
          <div class="article-meta">
            <span class="article-type">${typeLabel}</span>
            <span class="article-theme">${article.theme || 'Default'}</span>
          </div>
          <h3 class="article-title">${this.escapeHtml(article.title)}</h3>
          <p class="article-excerpt">${this.escapeHtml(article.excerpt || 'Click to read more...')}</p>
          <div class="article-footer">
            <span class="date">${formattedDate}</span>
            <span class="reading-time">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              ${article.readingTime || 5} min read
            </span>
          </div>
        </div>
      </a>
    `;
  }

  /**
   * Get article file path
   */
  getArticlePath(article) {
    if (article.path) {
      return article.path;
    }
    
    // Construct path from date and slug
    const date = new Date(article.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const slug = this.generateSlug(article.title);
    
    return `articles/${year}/${month}/${slug}.md`;
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
   * Generate slug from title
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
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
