/**
 * Infinite Scroll & Autoscroll Module
 * Provides infinite scrolling and automatic article cycling
 */

class InfiniteScrollManager {
  constructor() {
    this.articlesPerPage = 6;
    this.currentPage = 1;
    this.allArticles = [];
    this.isLoading = false;
    this.autoScrollEnabled = false;
    this.autoScrollInterval = null;
    this.autoScrollDelay = 8000; // 8 seconds per article
    this.currentAutoScrollIndex = 0;
    
    this.setupIntersectionObserver();
    this.setupAutoScrollControls();
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
    this.currentAutoScrollIndex = 0;
    
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
   * Setup autoscroll controls
   */
  setupAutoScrollControls() {
    // Create autoscroll controls with index circle
    const controlsHTML = `
      <div id="autoscroll-controls" style="
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 1000;
        display: flex;
        gap: 10px;
        align-items: center;
      ">
        <!-- Index Circle Button -->
        <a href="articles-list.html" id="index-circle" style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border: 2px solid rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
        " title="View all articles list" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
          ≡
        </a>
        
        <!-- Controls Panel -->
        <div style="
          background: rgba(0,0,0,0.8);
          padding: 15px 20px;
          border-radius: 50px;
          backdrop-filter: blur(10px);
          display: flex;
          gap: 10px;
          align-items: center;
        ">
          <button id="autoscroll-btn" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 500;
            font-size: 13px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          ">
            ▶ Autoscroll
          </button>
          
          <div id="autoscroll-speed" style="
            color: #999;
            font-size: 12px;
            cursor: pointer;
            padding: 5px 10px;
            border-radius: 15px;
            background: rgba(255,255,255,0.1);
            transition: all 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          " title="Click to adjust speed">
            ${(this.autoScrollDelay / 1000).toFixed(1)}s
          </div>
          
          <div id="scroll-indicator" style="
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #ccc;
            transition: background 0.3s ease;
          "></div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', controlsHTML);

    // Setup button click handler
    const autoscrollBtn = document.getElementById('autoscroll-btn');
    autoscrollBtn.addEventListener('click', () => this.toggleAutoscroll());

    // Setup speed adjustment
    const speedControl = document.getElementById('autoscroll-speed');
    speedControl.addEventListener('click', () => this.cycleSpeed());
  }

  /**
   * Toggle autoscroll
   */
  toggleAutoscroll() {
    this.autoScrollEnabled = !this.autoScrollEnabled;
    const btn = document.getElementById('autoscroll-btn');
    const indicator = document.getElementById('scroll-indicator');

    if (this.autoScrollEnabled) {
      btn.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      btn.innerHTML = '⏸ Autoscroll';
      indicator.style.background = '#f5576c';
      this.startAutoscroll();
    } else {
      btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      btn.innerHTML = '▶ Autoscroll';
      indicator.style.background = '#ccc';
      this.stopAutoscroll();
    }
  }

  /**
   * Start autoscroll
   */
  startAutoscroll() {
    if (this.autoScrollInterval) clearInterval(this.autoScrollInterval);

    console.log(`[Autoscroll] Started with ${this.autoScrollDelay}ms delay`);
    
    this.autoScrollInterval = setInterval(() => {
      this.scrollToNextArticle();
    }, this.autoScrollDelay);
  }

  /**
   * Stop autoscroll
   */
  stopAutoscroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
    console.log('[Autoscroll] Stopped');
  }

  /**
   * Scroll to next article
   */
  scrollToNextArticle() {
    const cards = document.querySelectorAll('.article-card');
    
    if (cards.length === 0) return;

    if (this.currentAutoScrollIndex >= cards.length) {
      this.currentAutoScrollIndex = 0;
    }

    const card = cards[this.currentAutoScrollIndex];
    
    // Smooth scroll to card
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Highlight the card
    cards.forEach(c => c.style.opacity = '0.6');
    card.style.opacity = '1';
    card.style.transform = 'scale(1.05)';
    
    console.log(`[Autoscroll] Scrolled to article ${this.currentAutoScrollIndex + 1}/${cards.length}`);
    
    this.currentAutoScrollIndex++;
  }

  /**
   * Cycle through speed options
   */
  cycleSpeed() {
    const speeds = [3000, 5000, 8000, 12000, 15000]; // milliseconds
    const currentIndex = speeds.indexOf(this.autoScrollDelay);
    const nextIndex = (currentIndex + 1) % speeds.length;
    
    this.autoScrollDelay = speeds[nextIndex];
    
    const speedControl = document.getElementById('autoscroll-speed');
    speedControl.textContent = `${(this.autoScrollDelay / 1000).toFixed(1)}s`;
    
    if (this.autoScrollEnabled) {
      this.stopAutoscroll();
      this.startAutoscroll();
    }
    
    console.log(`[Autoscroll] Speed changed to ${this.autoScrollDelay}ms`);
  }
}

// Initialize when ready
document.addEventListener('DOMContentLoaded', () => {
  window.infiniteScroll = new InfiniteScrollManager();
});
