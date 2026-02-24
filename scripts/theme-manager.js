/**
 * Theme Manager
 * Randomly selects and applies theme on page load
 */

const THEMES = ['theme-white', 'theme-black'];
const THEME_STORAGE_KEY = 'autonomousblog-theme';

class ThemeManager {
  constructor() {
    this.currentTheme = null;
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.applyRandomTheme());
    } else {
      this.applyRandomTheme();
    }
  }

  /**
   * Get random theme
   */
  getRandomTheme() {
    const randomIndex = Math.floor(Math.random() * THEMES.length);
    return THEMES[randomIndex];
  }

  /**
   * Apply theme to document
   */
  applyTheme(themeName) {
    // Remove all theme classes
    THEMES.forEach(theme => {
      document.body.classList.remove(theme);
    });

    // Add new theme class
    document.body.classList.add(themeName);
    this.currentTheme = themeName;

    // Update theme indicator
    this.updateThemeIndicator(themeName);

    // Save preference
    localStorage.setItem(THEME_STORAGE_KEY, themeName);

    // Mark as loaded
    document.body.classList.add('theme-loaded');

    console.log(`[ThemeManager] Applied theme: ${themeName}`);
  }

  /**
   * Apply random theme
   */
  applyRandomTheme() {
    const theme = this.getRandomTheme();
    this.applyTheme(theme);
  }

  /**
   * Toggle to next theme
   */
  toggleTheme() {
    const currentIndex = THEMES.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    const nextTheme = THEMES[nextIndex];
    this.applyTheme(nextTheme);
  }

  /**
   * Update theme indicator in UI
   */
  updateThemeIndicator(themeName) {
    const indicator = document.getElementById('current-theme');
    if (indicator) {
      const displayName = themeName.replace('theme-', '').replace(/\b\w/g, l => l.toUpperCase());
      indicator.textContent = displayName;
    }
  }

  /**
   * Get current theme name
   */
  getCurrentTheme() {
    return this.currentTheme;
  }
}

// Create global instance
window.themeManager = new ThemeManager();

// Add refresh theme listener
document.addEventListener('DOMContentLoaded', () => {
  const refreshBtn = document.getElementById('refresh-theme');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.themeManager.toggleTheme();
    });
  }
});
