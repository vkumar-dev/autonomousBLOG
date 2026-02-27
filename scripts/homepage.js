/**
 * Homepage Script - Reel Feed Bootstrap
 */

class Homepage {
  constructor() {
    this.articles = [];
    this.contentCache = {};
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

      if (window.articleFeed) {
        window.articleFeed.initializeWithArticles(this.articles, this.contentCache);
      }

      const countElement = document.getElementById('articles-count');
      if (countElement) {
        countElement.textContent = `${this.articles.length} article${this.articles.length !== 1 ? 's' : ''}`;
      }
    } catch (error) {
      console.error('Failed to initialize homepage:', error);
      this.renderError();
    }
  }

  async loadArticles() {
    const [indexResponse, contentResponse] = await Promise.all([
      fetch('articles-index.json'),
      fetch('articles-content.json')
    ]);

    if (!indexResponse.ok || !contentResponse.ok) {
      throw new Error('Failed to load article data files');
    }

    const indexData = await indexResponse.json();
    this.contentCache = await contentResponse.json();

    const fromIndex = (indexData.articles || []).map((item) => this.normalizeArticle(item));

    const indexedPaths = new Set(fromIndex.map((item) => item.path));
    const fromContent = Object.entries(this.contentCache)
      .filter(([path]) => !indexedPaths.has(path))
      .map(([path, raw]) => this.articleFromMarkdown(path, raw));

    this.articles = [...fromIndex, ...fromContent]
      .filter((item) => item.path)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log(`[Homepage] Loaded ${this.articles.length} articles (latest first)`);
  }

  normalizeArticle(article) {
    return {
      title: article.title || 'Untitled',
      date: article.date || new Date(0).toISOString(),
      contentType: article.contentType || 'article',
      excerpt: article.excerpt || '',
      readingTime: article.readingTime || 5,
      path: article.path,
      theme: article.theme || 'default'
    };
  }

  articleFromMarkdown(path, markdownContent) {
    const frontmatterMatch = markdownContent.match(/^---\n([\s\S]*?)\n---/);
    const frontmatter = frontmatterMatch ? frontmatterMatch[1] : '';

    const getField = (field) => {
      const match = frontmatter.match(new RegExp(`^${field}:\\s*(.*)$`, 'mi'));
      return match ? match[1].replace(/^"|"$/g, '').trim() : '';
    };

    const title = getField('title') || this.pathToTitle(path);
    const date = getField('date') || this.dateFromPath(path);

    const body = markdownContent.replace(/^---[\s\S]*?---\n?/, '').trim();
    const excerpt = body.split('\n').find((line) => line.trim() && !line.startsWith('#')) || '';

    return {
      title,
      date,
      contentType: 'article',
      excerpt: excerpt.slice(0, 180),
      readingTime: Math.max(1, Math.round(body.split(/\s+/).length / 200)),
      path,
      theme: 'default'
    };
  }

  pathToTitle(path) {
    return path
      .split('/')
      .pop()
      .replace(/\.md$/, '')
      .replace(/^\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}_/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  dateFromPath(path) {
    const filename = path.split('/').pop() || '';
    const match = filename.match(/(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})/);
    if (!match) return new Date(0).toISOString();

    const [, year, month, day, hour, min, sec] = match;
    return new Date(Date.UTC(+year, +month - 1, +day, +hour, +min, +sec)).toISOString();
  }

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

  renderError() {
    if (!this.articlesGrid) return;

    this.articlesGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Unable to load article reel</h3>
        <p>Please refresh the page or check back later.</p>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.homepage = new Homepage();
});
