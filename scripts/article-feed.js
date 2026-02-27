/**
 * Article Feed - Infinite Scroll of Full Articles
 * Load and display full article pages in an expandable vertical feed
 */

class ArticleFeed {
  constructor() {
    this.articlesPerPage = 10; // Show 10 articles initially, load more on scroll
    this.currentPage = 0;
    this.allArticles = [];
    this.contentCache = {};
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
    
    const feedContainer = document.getElementById('articles-grid');
    if (feedContainer) {
      feedContainer.appendChild(sentinel);
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
   * Load content cache
   */
  async loadContentCache() {
    try {
      const response = await fetch('articles-content.json');
      if (!response.ok) throw new Error('Failed to load content cache');
      this.contentCache = await response.json();
      console.log(`[ArticleFeed] Loaded ${Object.keys(this.contentCache).length} article contents`);
    } catch (error) {
      console.error('[ArticleFeed] Failed to load content cache:', error);
    }
  }

  /**
   * Initialize feed with articles
   */
  async initializeWithArticles(articles) {
    this.allArticles = articles;
    this.currentPage = 0;
    
    await this.loadContentCache();
    
    console.log(`[ArticleFeed] Initialized with ${articles.length} articles`);
    
    // Clear loading state before loading articles
    const feedContainer = document.getElementById('articles-grid');
    if (feedContainer) {
      feedContainer.innerHTML = ''; // Remove loading spinner
    }
    
    // Load first page
    this.loadMoreArticles();
  }

  /**
   * Load more articles
   */
  async loadMoreArticles() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    console.log(`[ArticleFeed] Loading articles ${this.currentPage * this.articlesPerPage} to ${(this.currentPage + 1) * this.articlesPerPage}...`);

    const startIndex = this.currentPage * this.articlesPerPage;
    const endIndex = startIndex + this.articlesPerPage;
    const newArticles = this.allArticles.slice(startIndex, endIndex);

    if (newArticles.length === 0) {
      console.log('[ArticleFeed] No more articles to load');
      this.isLoading = false;
      return;
    }

    // Render new articles
    const feedContainer = document.getElementById('articles-grid');
    if (feedContainer) {
      // Create sentinel if it doesn't exist (for first load)
      let sentinel = feedContainer.querySelector('#scroll-sentinel');
      if (!sentinel) {
        sentinel = document.createElement('div');
        sentinel.id = 'scroll-sentinel';
        sentinel.style.height = '1px';
        feedContainer.appendChild(sentinel);
      }
      
      const newHTML = newArticles.map((article) => 
        this.createArticlePage(article)
      ).join('');
      
      // Insert before sentinel
      sentinel.insertAdjacentHTML('beforebegin', newHTML);
      
      console.log(`[ArticleFeed] Loaded ${newArticles.length} full articles`);
    }

    this.currentPage++;
    this.isLoading = false;
  }

  /**
   * Create full article page HTML
   */
  createArticlePage(article) {
    const content = this.contentCache[article.path] || '';
    
    // Extract markdown content (remove frontmatter)
    const contentOnly = content.replace(/^---[\s\S]*?---\n/, '');
    const htmlContent = this.markdownToHtml(contentOnly);

    const timeInfo = window.TimeFormatter ? window.TimeFormatter.getFullTimeInfo(article.date) : {
      dateTime: this.formatDate(article.date),
      relativeTime: 'recently',
      fullText: `Published ${this.formatDate(article.date)}`
    };

    return `
      <article class="article-page-item" style="
        min-height: 100vh;
        padding: 60px 40px;
        max-width: 900px;
        margin: 0 auto;
        border-bottom: 1px solid rgba(0,0,0,0.1);
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100%;
      ">
        <div style="margin-bottom: 40px;">
          <div style="
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            font-size: 0.9rem;
            opacity: 0.7;
            flex-wrap: wrap;
          ">
            <span>${this.escapeHtml(article.contentType)}</span>
            <span>•</span>
            <span title="${timeInfo.relativeTime}">${timeInfo.dateTime}</span>
            <span>•</span>
            <span>${article.readingTime || 5} min read</span>
          </div>
          <h1 style="margin: 0 0 20px 0; font-size: 2.5rem; line-height: 1.2;">
            ${this.escapeHtml(article.title)}
          </h1>
          <p style="
            margin: 0;
            font-size: 1.1rem;
            opacity: 0.8;
            color: #666;
          ">
            ${this.escapeHtml(article.excerpt || '')}
          </p>
        </div>

        <div class="article-content" style="
          font-size: 1.05rem;
          line-height: 1.8;
          color: #333;
        ">
          ${htmlContent}
        </div>

        <div style="
           margin-top: 60px;
           padding-top: 40px;
           border-top: 1px solid rgba(0,0,0,0.1);
           opacity: 0.6;
           font-size: 0.9rem;
         ">
           <p>Published: ${timeInfo.dateTime}</p>
           <p>(${timeInfo.relativeTime})</p>
           <p>Read: ${article.readingTime || 5} minutes</p>
         </div>
      </article>
    `;
  }

  /**
   * Convert markdown to HTML (simple)
   */
  markdownToHtml(markdown) {
    let html = markdown
      // Headers
      .replace(/^### (.*?)$/gm, '<h3 style="margin: 30px 0 15px 0; font-size: 1.5rem;">$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2 style="margin: 40px 0 20px 0; font-size: 2rem;">$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1 style="margin: 50px 0 25px 0; font-size: 2.5rem;">$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: #667eea;">$1</a>')
      // Code blocks
      .replace(/```(.*?)```/gs, '<pre style="background: #f5f5f5; padding: 20px; border-radius: 8px; overflow-x: auto; margin: 20px 0;"><code>$1</code></pre>')
      // Inline code
      .replace(/`(.*?)`/g, '<code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px;">$1</code>')
      // Lists
      .replace(/^[\*\-] (.*?)$/gm, '<li style="margin-bottom: 10px;">$1</li>')
      .replace(/(<li.*?<\/li>)/s, '<ul style="padding-left: 30px; margin: 20px 0;">$1</ul>')
      // Numbered lists
      .replace(/^\d+\. (.*?)$/gm, '<li style="margin-bottom: 10px;">$1</li>')
      // Blockquotes
      .replace(/^> (.*?)$/gm, '<blockquote style="border-left: 4px solid #667eea; padding-left: 20px; margin: 20px 0; opacity: 0.8;">$1</blockquote>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p style="margin: 20px 0;">')
      .replace(/^(?!<[hp]|<blockquote|<ul|<pre|<li)/gm, '<p style="margin: 20px 0;">')
      .replace(/$/gm, '</p>')
      // Clean up extra p tags
      .replace(/<p><\/p>/g, '');

    return html;
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
  window.articleFeed = new ArticleFeed();
});
