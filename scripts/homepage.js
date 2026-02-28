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

      // Render and load latest article content
      await this.renderLatestArticle(this.articles[0]);

      if (window.articleFeed) {
        window.articleFeed.initializeWithArticles(this.articles.slice(1), this.contentCache);
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
    // Add cache-busting parameter to avoid stale content
    const bustParam = `?t=${window.CACHE_BUST || Date.now()}`;
    
    try {
      const [indexResponse, contentResponse] = await Promise.all([
        fetch('articles-index.json' + bustParam),
        fetch('articles-content.json' + bustParam)
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
      console.log(`[Homepage] Latest article: ${this.articles[0]?.title}`);
      console.log(`[Homepage] Content cache keys: ${Object.keys(this.contentCache).length}`);
    } catch (error) {
      console.error('[Homepage] Error loading articles:', error);
      throw error;
    }
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
    // Handle markdown code fences (with leading spaces)
    let cleaned = markdownContent.replace(/^\s*```markdown\s*\n/i, '').replace(/^\s*```\s*\n/i, '');
    
    const frontmatterMatch = cleaned.match(/^---\n([\s\S]*?)\n---/);
    const frontmatter = frontmatterMatch ? frontmatterMatch[1] : '';

    const getField = (field) => {
      const match = frontmatter.match(new RegExp(`^${field}:\\s*(.*)$`, 'mi'));
      return match ? match[1].replace(/^"|"$/g, '').trim() : '';
    };

    const title = getField('title') || this.pathToTitle(path);
    const date = getField('date') || this.dateFromPath(path);

    const body = cleaned.replace(/^---[\s\S]*?---\n?/, '').trim();
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

  async renderLatestArticle(article) {
    if (!this.articlesGrid) return;

    console.log(`[Homepage] Rendering latest article: ${article.title}`);
    console.log(`[Homepage] Article path: ${article.path}`);
    
    // Load article content
    const content = this.contentCache[article.path];
    if (!content) {
      console.warn('Article content not found:', article.path);
      console.log('[Homepage] Available keys:', Object.keys(this.contentCache));
      this.renderFeaturedArticle(article);
      return;
    }

    console.log(`[Homepage] Content length: ${content.length} chars`);

    // Parse the article - handle markdown code fences (with leading spaces)
    let cleaned = content.replace(/^\s*```markdown\s*\n/i, '').replace(/^\s*```\s*\n/i, '');
    const match = cleaned.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    if (!match) {
      console.warn('Invalid article format:', article.path);
      console.log('[Homepage] Content preview:', content.substring(0, 200));
      this.renderFeaturedArticle(article);
      return;
    }

    const body = match[2];
    console.log(`[Homepage] Article body length: ${body.length} chars`);
    
    const html = this.markdownToHtml(body);
    const now = new Date(article.date);

    const formattedDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const latestHtml = `
      <article class="featured-article-full">
        <div class="article-header-featured">
          <div class="badges">
            <span class="badge-new">Latest</span>
            <span class="badge-theme">${article.theme || 'default'}</span>
          </div>
          <h1 class="article-title-featured">${article.title}</h1>
          <div class="article-meta-featured">
            <span>📖 ${article.readingTime} min read</span>
            <span>🤖 AI Generated</span>
            <span>📅 ${formattedDate}</span>
          </div>
        </div>

        <div class="article-content-featured">
          ${html}
        </div>

        <div class="articles-separator">
          <span>More Articles</span>
        </div>
      </article>
    `;

    this.articlesGrid.innerHTML = latestHtml;
    console.log('[Homepage] Article rendered successfully');
    
    // Add reel-feed class if there are more articles to load
    if (this.articles.length > 1) {
      this.articlesGrid.classList.add('has-reel-feed');
    }
  }

  renderFeaturedArticle(article) {
    if (!this.articlesGrid) return;

    const featuredHtml = `
      <div class="featured-article">
        <div class="featured-header">
          <span class="badge-new">Latest</span>
          <span class="badge-theme">${article.theme || 'default'}</span>
        </div>
        <h2 class="featured-title">${article.title}</h2>
        <p class="featured-excerpt">${article.excerpt}</p>
        <div class="featured-meta">
          <span class="meta-item">📖 ${article.readingTime} min read</span>
          <span class="meta-item">🤖 AI Generated</span>
          <span class="meta-item">📅 ${new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <a href="view-article.html?article=${encodeURIComponent(article.path)}" class="btn-read-featured">
          Read Full Article →
        </a>
      </div>
      <div class="articles-separator">
        <span>More Articles</span>
      </div>
    `;

    this.articlesGrid.innerHTML = featuredHtml;
  }

  markdownToHtml(markdown) {
    // First, strip any remaining frontmatter that wasn't removed
    let cleanMarkdown = markdown.replace(/^---\n[\s\S]*?\n---\n?/, '');
    
    // Strip markdown code fence markers
    cleanMarkdown = cleanMarkdown.replace(/^\s*```\s*\n?/gm, '').replace(/^\s*```\s*$/gm, '');
    
    let html = cleanMarkdown
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^[\*\-] (.*?)$/gm, '<li>$1</li>')
      .replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n\n+/g, '</p><p>')
      .replace(/^(?!<[hpul])/gm, '<p>')
      .replace(/$/gm, '</p>')
      .replace(/<p><\/p>/g, '');

    return html;
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
