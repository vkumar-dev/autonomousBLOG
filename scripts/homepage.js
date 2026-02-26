/**
 * Homepage Script - Infinite Scroll + Autoscroll
 * Single view: Infinite scrolling with auto-cycling through articles
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
      
      if (this.articles.length === 0) {
        this.renderEmptyState();
        return;
      }

      // Initialize infinite scroll with articles
      if (window.infiniteScroll) {
        window.infiniteScroll.initializeWithArticles(this.articles);
        
        // Auto-start autoscroll after a short delay
        setTimeout(() => {
          window.infiniteScroll.toggleAutoscroll();
        }, 500);
      }
      
      // Update article count
      const countElement = document.getElementById('articles-count');
      if (countElement) {
        countElement.textContent = `${this.articles.length} article${this.articles.length !== 1 ? 's' : ''}`;
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
