# Contributing to Pegasus

Thank you for taking the time to contribute! This document covers everything you need to get the project running locally and submit changes.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Project Structure](#project-structure)
- [Running the Python Bridge](#running-the-python-bridge)
- [Running the Browser Extension](#running-the-browser-extension)
- [Code Style](#code-style)
- [Submitting Changes](#submitting-changes)

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.9+ |
| Node.js | 18+ |
| ffmpeg | any recent |
| Chrome / Chromium | any recent |

Install ffmpeg via Homebrew on macOS:

```bash
brew install ffmpeg
```

---

## Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/jportiz14/pegasus.git
cd pegasus

# 2. Create Python virtual environment
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# 3. Install Python dependencies
pip install -e ".[dev]"

# 4. Install extension dependencies
cd browser_extension
npm install
cd ..
```

---

## Project Structure

```
pegasus/
├── youtube_downloader/     # Python package
│   ├── cli.py              # CLI entry point
│   └── bridge.py           # HTTP bridge server
├── browser_extension/      # Chrome extension (React + TypeScript)
│   ├── src/
│   │   ├── background.ts   # Service worker
│   │   ├── content/        # YouTube page injection
│   │   ├── popup/          # Settings popup (React)
│   │   └── shared/         # Shared types + utilities
│   └── public/
│       └── manifest.json
└── .github/
    └── workflows/ci.yml
```

---

## Running the Python Bridge

```bash
source .venv/bin/activate
python -m youtube_downloader.bridge
# Bridge listening on http://127.0.0.1:8765
```

---

## Running the Browser Extension

```bash
cd browser_extension

# Development — rebuilds on every save
npm run dev

# Production build
npm run build
```

Then load `browser_extension/dist/` as an unpacked extension in `chrome://extensions`.

---

## Code Style

**Python** — Ruff for linting (already installed via `pip install -e ".[dev]"`):

```bash
ruff check youtube_downloader/
ruff check --fix youtube_downloader/    # Auto-fix issues
ruff format youtube_downloader/
```

**TypeScript** — ESLint + Prettier:

```bash
cd browser_extension
npm run lint
npm run format
```

Please make sure both pass before opening a pull request.

---

## Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes and ensure lint passes
4. Commit with a clear message: `git commit -m "feat: add subtitle language selector"`
5. Push and open a pull request against `main`

For significant changes, please open an issue first to discuss the approach.
