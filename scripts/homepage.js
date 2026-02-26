/**
 * Homepage Script
 * Loads articles from the articles-index.json
 * Latest article is set as the default landing article
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
      
      // Auto-open latest article if no article is currently being viewed
      if (this.articles.length > 0 && !this.isViewingArticle()) {
        this.openLatestArticle();
      }
      
      this.renderArticles();
    } catch (error) {
      console.error('Failed to initialize homepage:', error);
      this.renderError();
    }
  }

  /**
   * Check if we're already viewing an article
   */
  isViewingArticle() {
    // Check if we have article-specific query params or if we're not on the home page
    const params = new URLSearchParams(window.location.search);
    return params.has('article') || window.location.pathname !== '/';
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
   * Open the latest article
   */
  openLatestArticle() {
    if (this.articles.length === 0) return;
    
    const latestArticle = this.articles[0];
    const articlePath = this.getArticlePath(latestArticle);
    
    console.log('[Homepage] Opening latest article:', latestArticle.title);
    
    // Load article in a modal/overlay or redirect
    this.loadArticlePreview(latestArticle);
  }

  /**
   * Load and display article preview
   */
  async loadArticlePreview(article) {
    try {
      const articlePath = this.getArticlePath(article);
      const response = await fetch(articlePath);
      
      if (!response.ok) {
        console.warn('Could not load article preview');
        return;
      }
      
      const markdown = await response.text();
      
      // Create modal for article preview
      this.showArticleModal(article, markdown);
    } catch (error) {
      console.warn('Failed to load article preview:', error);
    }
  }

  /**
   * Show article in modal
   */
  showArticleModal(article, markdown) {
    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'article-modal';
    modal.innerHTML = `
      <div class="article-modal-overlay"></div>
      <div class="article-modal-content">
        <button class="article-modal-close">&times;</button>
        <div class="article-modal-header">
          <h2>${this.escapeHtml(article.title)}</h2>
          <p class="article-modal-meta">
            <span class="article-date">${this.formatDate(article.date)}</span>
            <span class="article-reading-time">${article.readingTime || 5} min read</span>
          </p>
        </div>
        <div class="article-modal-body markdown-content">
          <!-- Content will be rendered here -->
        </div>
        <div class="article-modal-footer">
          <a href="${this.getArticlePath(article)}" class="btn-read-full">Read Full Article</a>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Parse and render markdown
    const contentDiv = modal.querySelector('.article-modal-body');
    contentDiv.innerHTML = this.parseMarkdown(markdown);
    
    // Close button handler
    modal.querySelector('.article-modal-close').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.querySelector('.article-modal-overlay').addEventListener('click', () => {
      modal.remove();
    });
    
    // Add modal styles
    this.addModalStyles();
  }

  /**
   * Parse markdown to HTML (simple parser)
   */
  parseMarkdown(markdown) {
    // Remove frontmatter
    let content = markdown.replace(/^---[\s\S]*?---\n/, '');
    
    // Simple markdown parsing
    content = content
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^- (.*?)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    return `<p>${content}</p>`;
  }

  /**
   * Add modal styles if not already added
   */
  addModalStyles() {
    if (document.getElementById('article-modal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'article-modal-styles';
    style.textContent = `
      .article-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .article-modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
      }
      
      .article-modal-content {
        position: relative;
        background: white;
        border-radius: 12px;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        padding: 3rem;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }
      
      .article-modal-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 2rem;
        cursor: pointer;
        color: #666;
      }
      
      .article-modal-header {
        margin-bottom: 2rem;
      }
      
      .article-modal-header h2 {
        margin: 0 0 0.5rem 0;
        font-size: 2rem;
      }
      
      .article-modal-meta {
        color: #666;
        font-size: 0.9rem;
      }
      
      .article-modal-meta span {
        margin-right: 1rem;
      }
      
      .article-modal-body {
        margin: 2rem 0;
        line-height: 1.6;
      }
      
      .article-modal-footer {
        text-align: center;
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #eee;
      }
      
      .btn-read-full {
        display: inline-block;
        padding: 0.75rem 2rem;
        background: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        transition: background 0.3s;
      }
      
      .btn-read-full:hover {
        background: #0056b3;
      }
    `;
    document.head.appendChild(style);
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
    
    // Update article count
    const countElement = document.getElementById('articles-count');
    if (countElement) {
      countElement.textContent = `${this.articles.length} article${this.articles.length !== 1 ? 's' : ''}`;
    }
  }

  /**
   * Create article card HTML
   */
  createArticleCard(article) {
    const formattedDate = this.formatDate(article.date);
    const articlePath = this.getArticlePath(article);
    const isLatest = this.articles.indexOf(article) === 0 ? ' is-latest' : '';

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
    // For markdown files, link to view-article.html with article path parameter
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
