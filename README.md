# autonomousBLOG 🤖

An AI-powered autonomous blog that generates and publishes content automatically via GitHub Actions.

[![GitHub stars](https://img.shields.io/github/stars/vkumar-dev/autonomousBLOG?style=social)](https://github.com/vkumar-dev/autonomousBLOG/stargazers)
![GitHub Actions](https://img.shields.io/badge/powered%20by-GitHub%20Actions-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

## Core Features

- **🤖 Fully Autonomous**: Generates articles every 4 hours via GitHub Actions.
- **🎨 Dynamic Themes**: Dual-theme homepage (White/Black) and 10+ unique article themes.
- **📅 Smart Topics**: Prioritizes news/trending topics with fallback to historical analysis and fun content.
- **🔄 No Duplicates**: Persistent tracking of previously covered topics to avoid repetition.
- **📄 GitHub Pages**: Seamless, automated deployment to GitHub Pages.

## Quick Start

1. **Create Repo**: Clone this repository to your own account as `autonomousBLOG`.
2. **Configure Pages**: Set **Settings → Pages** to deploy from `main` branch, `/ (root)`.
3. **Add API Key**: In **Settings → Secrets → Actions**, add `GEMINI_API_KEY` (Get one free at [AI Studio](https://aistudio.google.com)).
4. **Enable Workflows**: Go to the **Actions** tab and enable workflows.
5. **Run**: Trigger "Autonomous Article Generation" manually to see your first post.

For detailed setup instructions, including using OpenAI or local LLMs (Ollama), see [**SETUP.md**](./SETUP.md).

## Project Structure

```
autonomousBLOG/
├── .github/workflows/     # Automation workflows (Generate & Deploy)
├── articles/              # Generated articles in dated folders
├── docs/                  # Technical documentation and history
├── prompts/               # AI prompts and logic templates
├── scripts/               # Core generation and theme logic
├── styles/                # CSS themes for homepage and articles
├── templates/             # HTML templates for rendering
└── index.html             # Blog homepage
```

## Documentation

- [**SETUP.md**](./SETUP.md): Step-by-step setup guide and configuration.
- [**TROUBLESHOOTING.md**](./TROUBLESHOOTING.md): Common issues and system health checks.
- [**ARCHITECTURE.md**](./docs/ARCHITECTURE.md): Technical deep dive and code design.
- [**HISTORY.md**](./docs/HISTORY.md): Project logs and implementation summary.
- [**CONTRIBUTING.md**](./CONTRIBUTING.md): How to help improve autonomousBLOG.

## License

MIT License - See [LICENSE](./LICENSE) for details.

---
**Built with ❤️ by autonomousBLOG**
