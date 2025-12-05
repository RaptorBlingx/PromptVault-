# PromptVault

A professional, desktop-class prompt management application designed to organize, edit, and optimize your LLM prompts.

## Features

- 📂 **Organize**: Store all your prompts in one secure place with local storage persistence.
- ⚡ **Zero-Latency Search**: Instantly find prompts by title, content, or tags with highlighted results.
- ✨ **AI Optimization**: Improve your prompts using Google's Gemini API with a single click.
- 🎨 **Clean UI**: A focused, distraction-free interface built for readability.
- 🐳 **Dockerized**: Ready for self-hosting on your home lab or server with a "Zero-Touch" setup.

## Quick Start (Docker)

The easiest way to run PromptVault on your server is using Docker.

1. **Clone the repository**
2. **Set your API Key**
   Open `docker-compose.yml` and replace `${API_KEY}` with your actual Google Gemini API Key, or set it in your environment before running the command:
   ```bash
   export API_KEY="your_api_key_here"
   ```
3. **Run the container**
   ```bash
   docker compose up -d --build
   ```
4. **Access the App**
   Open [http://localhost:2528](http://localhost:2528) in your browser.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set your environment variable:
   ```bash
   export API_KEY=your_key_here
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Technologies

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons
- **AI Integration**: Google GenAI SDK (Gemini 2.5)
- **Build Tool**: Vite
- **Deployment**: Docker, Nginx (Alpine based)