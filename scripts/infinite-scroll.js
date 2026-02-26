/**
 * Infinite Scroll Module
 * Loads articles as user scrolls down
 */

class InfiniteScrollManager {
  constructor() {
    this.articlesPerPage = 6;
    this.currentPage = 1;
    this.allArticles = [];
    this.isLoading = false;
    
    this.setupIntersectionObserver();
    this.setupIndexCircle();
  }

  /**
   * Setup Intersection Observer for infinite scroll
   */
  setupIntersectionObserver() {
    // Create sentinel element for infinite scroll trigger
    const sentinel = document.createElement('div');
    sentinel.id = 'scroll-sentinel';
    sentinel.style.height = '1px';
    sentinel.style.margin = '100px 0';
    
    const articlesGrid = document.getElementById('articles-grid');
    if (articlesGrid) {
      articlesGrid.parentElement.appendChild(sentinel);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.isLoading) {
          this.loadMoreArticles();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
  }

  /**
   * Load more articles (called by infinite scroll)
   */
  async loadMoreArticles() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    console.log(`[InfiniteScroll] Loading page ${this.currentPage + 1}...`);

    const startIndex = this.currentPage * this.articlesPerPage;
    const endIndex = startIndex + this.articlesPerPage;
    const newArticles = this.allArticles.slice(startIndex, endIndex);

    if (newArticles.length === 0) {
      console.log('[InfiniteScroll] No more articles to load');
      this.isLoading = false;
      return;
    }

    // Render new articles
    const articlesGrid = document.getElementById('articles-grid');
    if (articlesGrid) {
      const newHTML = newArticles.map((article, idx) => 
        this.createArticleCard(article, startIndex + idx)
      ).join('');
      
      articlesGrid.innerHTML += newHTML;
      console.log(`[InfiniteScroll] Loaded ${newArticles.length} more articles`);
    }

    this.currentPage++;
    this.isLoading = false;
  }

  /**
   * Initialize infinite scroll with articles
   */
  initializeWithArticles(articles) {
    this.allArticles = articles;
    this.currentPage = 0;
    
    console.log(`[InfiniteScroll] Initialized with ${articles.length} articles`);
    
    // Load first page
    this.loadMoreArticles();
  }

  /**
   * Create article card HTML
   */
  createArticleCard(article, index) {
    const formattedDate = this.formatDate(article.date);
    const timeInfo = window.TimeFormatter ? window.TimeFormatter.getFullTimeInfo(article.date) : {
      dateTime: formattedDate,
      relativeTime: 'recently'
    };
    const articlePath = this.getArticlePath(article);
    const isLatest = index === 0 ? ' is-latest' : '';

    return `
      <a href="${articlePath}" class="article-card${isLatest}" title="${this.escapeHtml(article.title)}" data-article-index="${index}">
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
   * Get article path
   */
  getArticlePath(article) {
    if (article.path && article.path.endsWith('.md')) {
      return `view-article.html?article=${encodeURIComponent(article.path)}`;
    }
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
   * Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Setup index circle
   */
  setupIndexCircle() {
    // Create index circle with link to list view
    const circleHTML = `
      <a href="articles-list.html" id="index-circle" style="
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 1000;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: 2px solid rgba(255,255,255,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      " title="View all articles list" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        ≡
      </a>
    `;
    
    document.body.insertAdjacentHTML('beforeend', circleHTML);
  }
}

// Initialize when ready
document.addEventListener('DOMContentLoaded', () => {
  window.infiniteScroll = new InfiniteScrollManager();
});
