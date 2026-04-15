# Changelog

All notable changes to Pegasus are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] — 2025-04-05

### Added
- Python CLI (`ytdl1080`) for downloading YouTube videos up to 1080p via yt-dlp
- Local HTTP bridge server (`pegasus-bridge`) exposing `/health`, `/download`, and `/jobs/{id}`
- Chrome extension (Manifest v3) with a floating download button injected into YouTube watch pages
- React settings popup for configuring bridge URL, cookies path, and output directory
- Real-time download progress polling via the bridge job API
- "Copy command" fallback that writes the equivalent CLI command to the clipboard
- YouTube-native UI design — matching YouTube's color palette, typography, and button shapes
- Dark mode support via `prefers-color-scheme`
- Shadow DOM isolation to prevent style conflicts with YouTube's own CSS
- Material icon SVG for the launcher button (no external icon library)
- All four Chrome extension icon sizes (16 × 16, 32 × 32, 48 × 48, 128 × 128)
- MIT license
- GitHub Actions CI (Ruff lint + extension build on every push and PR)
- ESLint + Prettier configuration for TypeScript
- Ruff configuration for Python
- CONTRIBUTING, SECURITY, and issue template documentation
