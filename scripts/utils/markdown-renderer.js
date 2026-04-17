/**
 * Shared Markdown Renderer for autonomousBLOG
 * Ensures consistent rendering across homepage, feed, and viewer
 */

class MarkdownRenderer {
  constructor() {
    // No state needed for now
  }

  /**
   * Convert markdown to HTML with support for custom elements
   * @param {string} markdown - The raw markdown content
   * @returns {string} - Rendered HTML
   */
  render(markdown) {
    if (!markdown) return '';

    // Clean up markdown code fences (with leading spaces)
    let cleaned = markdown
      .replace(/^\s*```markdown\s*\n/i, '')
      .replace(/^\s*```\s*\n/i, '')
      .replace(/\n\s*```\s*$/i, '');

    // Strip frontmatter if present
    cleaned = cleaned.replace(/^---[\s\S]*?---\n?/, '');

    let html = cleaned
      // Headers
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      
      // Alert Boxes (Note/Tip)
      .replace(/^> \[!NOTE\]\n> (.*?)$/gm, (match, content) => {
        return `<div class="alert alert-note">
          <div class="alert-icon">ℹ️</div>
          <div class="alert-content">
            <span class="alert-title">Note</span>
            ${this.parseInline(content)}
          </div>
        </div>`;
      })
      .replace(/^> \[!TIP\]\n> (.*?)$/gm, (match, content) => {
        return `<div class="alert alert-tip">
          <div class="alert-icon">💡</div>
          <div class="alert-content">
            <span class="alert-title">Pro Tip</span>
            ${this.parseInline(content)}
          </div>
        </div>`;
      })

      // Code blocks (multi-line)
      .replace(/```([\s\S]*?)```/gs, '<pre><code>$1</code></pre>')

      // Inline code
      .replace(/`(.*?)`/g, '<code>$1</code>')

      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')

      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

      // Blockquotes (must be after alerts to avoid double processing)
      .replace(/^> (.*?)$/gm, (match, content) => {
        if (content.startsWith('[!')) return match; // Skip alerts
        return `<blockquote>${this.parseInline(content)}</blockquote>`;
      })

      // Lists
      .replace(/^[\*\-] (.*?)$/gm, '<li>$1</li>')
      .replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>')

      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[hpulb])/gm, '<p>') // Skip tags that are already blocks
      .replace(/$/gm, '</p>')
      .replace(/<p><\/p>/g, '');

    return html;
  }

  /**
   * Parse inline markdown (bold, italic, links, etc.)
   */
  parseInline(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  }

  /**
   * Escape HTML to prevent XSS
   */
  escape(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export to window for browser use
window.MarkdownRenderer = new MarkdownRenderer();
