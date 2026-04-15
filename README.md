# Pegasus

<p align="center">
  <img src="icon.png" alt="Pegasus" width="120" />
</p>

**Local-first YouTube downloader.** A Python bridge + Chrome extension that lets you download any YouTube video up to 1080p directly to your machine. No cloud, no subscription.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.9+](https://img.shields.io/badge/python-3.9%2B-blue.svg)](https://www.python.org/)
[![Node 18+](https://img.shields.io/badge/node-18%2B-green.svg)](https://nodejs.org/)

---

## How It Works

```
YouTube page  →  Chrome extension  →  Local bridge (127.0.0.1:8765)  →  yt-dlp  →  your disk
```

<p align="center">
  <img src="banner.png" alt="Pegasus in action" width="800" />
</p>

The extension injects a **Download** button into every YouTube watch page. When clicked, it sends the video URL to a small Python HTTP server running on your machine. The server downloads the video using `yt-dlp` and streams progress back to the extension in real time.

---

## Features

- Download any YouTube video up to **1080p** (best video + best audio merged to MP4)
- Real-time **progress bar** in the browser
- Works with **age-restricted or member-only** videos via your browser cookies
- **Copy command** fallback - copies the equivalent CLI command to your clipboard
- YouTube-native UI - matches YouTube's own color palette, typography, and button shapes
- Full **dark mode** support
- Completely **local** - no data leaves your machine

---

## Requirements

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.9+ | [python.org](https://www.python.org/) |
| ffmpeg | any | `brew install ffmpeg` / `apt install ffmpeg` |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| Chrome / Chromium | any | [chrome.com](https://www.google.com/chrome/) |

---

## Setup

### 1 - Python bridge

```bash
# Clone the repo
git clone https://github.com/misterpoloy/youtube-download-extension.git
cd pegasus

# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install yt-dlp

# Start the bridge
python -m youtube_downloader.bridge
# → Bridge listening on http://127.0.0.1:8765
```

Keep this terminal running while you use the extension.

### 2 - Chrome extension

```bash
cd browser_extension
npm install
npm run build
```

Then in Chrome:

1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `browser_extension/dist/` folder

### 3 - Configure

Click the Pegasus toolbar icon and set:

- **Bridge URL** - `http://127.0.0.1:8765` (default)
- **Cookies file** - absolute path to your `cookies.txt` (optional, needed for restricted videos)
- **Output directory** - absolute path to your downloads folder

### 4 - Download

Open any YouTube video, click the **Download** button in the top-right corner of the page, and hit **Download** in the panel.

---

## CLI Usage

You can also use the downloader directly from the terminal without the extension.

```bash
source .venv/bin/activate

# Download a single video
python -m youtube_downloader.cli "https://www.youtube.com/watch?v=VIDEO_ID"

# Choose an output folder
python -m youtube_downloader.cli "URL" --output-dir ~/Downloads

# Pass cookies for restricted videos
python -m youtube_downloader.cli "URL" --cookies /path/to/cookies.txt

# Download multiple URLs
python -m youtube_downloader.cli "URL_1" "URL_2"
```

### Getting cookies

Export your cookies in Netscape format using a browser extension such as [Get cookies.txt LOCALLY](https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc). Save the file anywhere on your machine and pass the path to `--cookies`.

> **Never commit your cookies file.** It is listed in `.gitignore` and contains active session tokens.

---

## Architecture

```
pegasus/
├── youtube_downloader/
│   ├── cli.py          # CLI - wraps yt-dlp, handles format selection
│   └── bridge.py       # HTTP bridge - ThreadingHTTPServer, job queue
├── browser_extension/
│   ├── src/
│   │   ├── background.ts       # Service worker - proxies messages to bridge
│   │   ├── content/main.ts     # YouTube page injection - floating panel
│   │   ├── popup/App.tsx       # Settings popup (React)
│   │   └── shared/             # Types, storage, bridge client
│   └── public/manifest.json
└── .github/workflows/ci.yml
```

### Bridge API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness check |
| `POST` | `/download` | Start a download job |
| `GET` | `/jobs/{id}` | Poll job status and progress |

---

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for full setup instructions, code style, and how to submit pull requests.

**Quick lint check:**

```bash
# Python
ruff check youtube_downloader/

# TypeScript
cd browser_extension && npm run lint
```

---

## License

MIT - see [LICENSE](LICENSE).
