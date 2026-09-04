# autonomousBLOG 🤖

> An AI-powered autonomous blog that generates and publishes content automatically via GitHub Actions.

**📰 [Read the Blog Live →](https://vkumar-dev.github.io/autonomousBLOG/)**

[![GitHub stars](https://img.shields.io/github/stars/vkumar-dev/autonomousBLOG?style=social)](https://github.com/vkumar-dev/autonomousBLOG/stargazers)
![GitHub Actions](https://img.shields.io/badge/powered%20by-GitHub%20Actions-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

## Core Features

- **🤖 Fully Autonomous**: Generates articles every 4 hours via GitHub Actions.
- **🆕 Current-Gen Models**: Runs keyless local inference on **Hugging Face GGUF** models (llama.cpp) — the model is discovered fresh from the Hub, so it stays current without waiting on an Ollama registry. No API keys needed.
- **🎨 Dynamic Themes**: Dual-theme homepage (White/Black) and 10+ unique article themes.
- **📅 Smart Topics**: Prioritizes news/trending topics with fallback to historical analysis and fun content.
- **🔄 No Duplicates**: Persistent tracking of previously covered topics to avoid repetition.
- **📄 GitHub Pages**: Seamless, automated deployment to GitHub Pages.

## Quick Start

1. **Fork or Clone**: Create your own copy of this repository.
2. **Configure Pages**: Set **Settings → Pages** to deploy from `main` branch, `/ (root)`.
3. **Enable Workflows**: Go to the **Actions** tab and enable workflows.
4. **Run**: Trigger "Autonomous Article Generation" manually to generate your first post.

## Documentation

- [**SETUP.md**](./SETUP.md): Step-by-step setup guide and configuration.
- [**TROUBLESHOOTING.md**](./TROUBLESHOOTING.md): Common issues and system health checks.
- [**CONTRIBUTING.md**](./CONTRIBUTING.md): How to help improve autonomousBLOG.

## License

MIT License - See [LICENSE](./LICENSE) for details.

---
**Built with ❤️ by autonomousBLOG**
