# PromptVault Pro

<div align="center">

**State-of-the-Art Prompt Management System for LLM Power Users**

[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://github.com/RaptorBlingx/PromptVault)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📁 **Folders** | Organize prompts into collections with custom icons |
| ⚡ **Smart Variables** | Use `{{variable}}` syntax for dynamic prompts |
| 🌙 **Dark Mode** | System-aware theme with manual toggle |
| ⌨️ **Command Palette** | Quick search and actions with `Ctrl+K` |
| 🕐 **Version History** | Auto-saves last 5 versions with one-click restore |
| 📌 **Pin to Top** | Keep important prompts visible |
| ⭐ **Favorites** | Quick access to starred prompts |
| 🤖 **AI Optimize** | Improve prompts using Gemini API |
| 💾 **Import/Export** | Full JSON backup and restore |
| 🐳 **Docker Ready** | Zero-touch self-hosting |

---

## 🚀 Quick Start

### Docker (Recommended)

```bash
git clone https://github.com/RaptorBlingx/PromptVault.git
cd PromptVault
docker compose up -d --build
```

Open [http://localhost:2528](http://localhost:2528) in your browser.

### With AI Optimization (Optional)

Set your Gemini API key:

```bash
export API_KEY="your_gemini_api_key"
docker compose up -d --build
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Command Palette |
| `Ctrl+N` | New Prompt |
| `Ctrl+S` | Save (in editor) |
| `Esc` | Close modals |

---

## 🛠️ Local Development

```bash
npm install
npm run dev
```

---

## 📦 Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Custom CSS Design System (Dark/Light)
- **Icons**: Lucide React
- **AI**: Google Gemini API
- **Build**: Vite
- **Deploy**: Docker + Nginx

---

## 📄 License

MIT © [RaptorBlingx](https://github.com/RaptorBlingx)