# Code and Website Generator with Text

**Code and Website Generator with Text** is a free, open-source AI-powered website and code generator built with **Node.js**, **Express**, **Monaco Editor**, **JSZip**, **Google Gemini API**, and **Ollama**.

It allows users to generate framework-free, production-ready static websites (`index.html`, `style.css`, `script.js`) using natural language prompts processed by Google Gemini or local coding LLMs.

---

## ✨ Features

1. **Multiple AI Provider Support**:
   - **Offline Specification Generator** (`offline-spec-generator`) for local, no-API-key generation.
   - **Google Gemini API** (via `GEMINI_API_KEY` in environment variables).
   - **Local Ollama Models** (via `qwen2.5-coder`, `codellama`, `llama3`, etc.).
2. **Three-File Output**: Generates cleanly structured `index.html`, `style.css`, and `script.js`.
3. **Monaco Code Editor**: Professional tabbed code editing experience powered by Monaco Editor (the editor behind VS Code).
4. **Live Responsive Preview**: Real-time sandboxed iframe preview with viewport presets (Desktop, Tablet, Mobile).
5. **Full Suite of AI Action Controls**:
   - **Generate**: Create website code from scratch.
   - **Regenerate**: Re-run generation with fresh ideas.
   - **Improve Design**: Enhance CSS styling, typography, animations, and visual UI polish.
   - **Fix Code**: Automatically diagnose and repair syntax or JavaScript runtime errors.
   - **Copy Code**: Copy active file contents directly to clipboard.
   - **Download ZIP**: Package all 3 files into `code-website-generator-project.zip` using JSZip.
   - **Clear**: Reset prompt and workspace.
6. **Live Instant Preview Sync**: Edit code in Monaco Editor and see instant live updates in the preview frame.
7. **Built-in Prompt Templates**: One-click prompt starters for Portfolio, Landing Page, Blog, E-commerce, and Dashboard.
8. **Light/Dark UI Themes**: Toggle between dark and light modes with persistent preference saving.
9. **AI Error Detection & Auto-Fix**: Automatically captures JS runtime and console errors inside the sandboxed preview and passes them to AI for automatic repair.
10. **100% Framework-Free**: Generated code relies solely on standard HTML5, modern CSS3, and Vanilla JavaScript (ES6+).
11. **Secure API Key Handling**: All API keys remain strictly on the backend (`.env`). No API keys or internal endpoints are exposed to frontend code.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Code Editor**: Monaco Editor (via CDN)
- **Zip Packaging**: JSZip
- **Backend**: Node.js, Express.js, Cors, Dotenv
- **AI Engines**: Offline Specification Generator (`offline-spec-generator`), Google Gemini REST API (`gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.0-flash`), or local [Ollama](https://ollama.com) API (`qwen2.5-coder`, etc.).

---

## ⚙️ Configuration & Environment Variables

Create or edit your `.env` file:

```env
PORT=3000

# Local Ollama Configuration (Optional)
OLLAMA_HOST=http://127.0.0.1:11434
DEFAULT_MODEL=qwen2.5-coder

# Google Gemini API Configuration (Optional)
# Obtain your free API key from https://aistudio.google.com
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

The built-in offline provider is always available and requires no configuration. To use it, select `offline-spec-generator` in the model dropdown. For AI providers, start Ollama locally with a compatible coding model or set `GEMINI_API_KEY` to use Google Gemini.

---

## 🚀 Running Code and Website Generator

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```
Or for development with auto-reload:
```bash
npm run dev
```

Open your browser at:
```
http://localhost:3000
```

---

## 💡 Using Google Gemini API

1. Get a free API key from [Google AI Studio](https://aistudio.google.com).
2. Add your key to `.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```
3. Restart the server (`npm start`).
4. Select `gemini-1.5-flash` or `gemini-1.5-pro` from the Model dropdown on `http://localhost:3000` and generate websites instantly!

---

## 📜 License

MIT License - Free for personal and commercial use.
