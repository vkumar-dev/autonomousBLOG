/**
 * Article Feed - Reel style vertical snap feed for full posts
 */

class ArticleFeed {
  constructor() {
    this.articlesPerPage = 4;
    this.currentPage = 0;
    this.allArticles = [];
    this.contentCache = {};
    this.isLoading = false;
    this.observer = null;
    this.setupIndexCircle();
  }

  setupIntersectionObserver() {
    const sentinel = document.getElementById('scroll-sentinel');
    if (!sentinel) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.isLoading) {
          this.loadMoreArticles();
        }
      },
      {
        root: document.getElementById('articles-grid'),
        threshold: 0.4
      }
    );

    this.observer.observe(sentinel);
  }

  async loadContentCache() {
    if (Object.keys(this.contentCache).length > 0) {
      return;
    }

    const response = await fetch('articles-content.json');
    if (!response.ok) {
      throw new Error('Failed to load content cache');
    }

    this.contentCache = await response.json();
  }

  async initializeWithArticles(articles, initialContentCache = {}) {
    this.allArticles = articles;
    this.currentPage = 0;
    this.contentCache = initialContentCache;

    await this.loadContentCache();

    const feedContainer = document.getElementById('articles-grid');
    if (!feedContainer) return;

    feedContainer.innerHTML = '<div id="scroll-sentinel"></div>';
    this.setupIntersectionObserver();
    this.loadMoreArticles();
  }

  async loadMoreArticles() {
    if (this.isLoading) return;

    this.isLoading = true;

    const startIndex = this.currentPage * this.articlesPerPage;
    const endIndex = startIndex + this.articlesPerPage;
    const newArticles = this.allArticles.slice(startIndex, endIndex);

    if (newArticles.length === 0) {
      this.isLoading = false;
      return;
    }

    const feedContainer = document.getElementById('articles-grid');
    const sentinel = document.getElementById('scroll-sentinel');

    if (feedContainer && sentinel) {
      const newHTML = newArticles
        .map((article, index) => this.createArticlePage(article, startIndex + index === 0))
        .join('');
      sentinel.insertAdjacentHTML('beforebegin', newHTML);
    }

    this.currentPage += 1;
    this.isLoading = false;
  }

  createArticlePage(article, isLatest) {
    const markdown = this.contentCache[article.path] || '';
    const contentOnly = markdown.replace(/^---[\s\S]*?---\n?/, '');
    const htmlContent = this.markdownToHtml(contentOnly);

    const timeInfo = window.TimeFormatter
      ? window.TimeFormatter.getFullTimeInfo(article.date)
      : {
          dateTime: this.formatDate(article.date),
          relativeTime: 'recently'
        };

    return `
      <article class="reel-article ${isLatest ? 'is-latest' : ''}">
        <div class="reel-shell">
          <div class="reel-meta">
            ${isLatest ? '<span class="latest-pill">Latest</span>' : ''}
            <span>${this.escapeHtml(article.contentType || 'article')}</span>
            <span>•</span>
            <span title="${this.escapeHtml(timeInfo.relativeTime)}">${this.escapeHtml(timeInfo.dateTime)}</span>
            <span>•</span>
            <span>${article.readingTime || 5} min read</span>
          </div>

          <h2 class="reel-title">${this.escapeHtml(article.title)}</h2>
          ${article.excerpt ? `<p class="reel-excerpt">${this.escapeHtml(article.excerpt)}</p>` : ''}

          <div class="reel-content">${htmlContent}</div>
        </div>
      </article>
    `;
  }

  markdownToHtml(markdown) {
    const escaped = this.escapeHtml(markdown);

    return escaped
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/(?:\r?\n){2,}/g, '</p><p>')
      .replace(/^(.+)$/gm, '<p>$1</p>')
      .replace(/<p><\/p>/g, '');
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  setupIndexCircle() {
    const circleHTML = `
      <a href="articles-list.html" id="index-circle" title="View all article titles">☰</a>
    `;
    document.body.insertAdjacentHTML('beforeend', circleHTML);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.articleFeed = new ArticleFeed();
});
