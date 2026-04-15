export const contentStyles = `
  /* ── Reset ─────────────────────────────────── */
  :host {
    all: initial;

    /* Light mode tokens */
    --yt-bg:             #ffffff;
    --yt-bg-elevated:    #f2f2f2;
    --yt-border:         rgba(0, 0, 0, 0.1);
    --yt-divider:        rgba(0, 0, 0, 0.08);
    --yt-text:           #0f0f0f;
    --yt-text-muted:     #606060;
    --yt-red:            #ff0000;
    --yt-red-hover:      #cc0000;
    --yt-chip-bg:        rgba(0, 0, 0, 0.05);
    --yt-chip-hover:     rgba(0, 0, 0, 0.1);
    --yt-chip-active:    rgba(0, 0, 0, 0.15);
    --yt-launcher-bg:    #0f0f0f;
    --yt-launcher-fg:    #ffffff;
    --yt-launcher-hover: #272727;
    --yt-input-bg:       #ffffff;
    --yt-input-border:   rgba(0, 0, 0, 0.2);
    --yt-focus:          #065fd4;
    --yt-online-bg:      rgba(15, 157, 88, 0.1);
    --yt-online-fg:      #0d8a47;
    --yt-offline-bg:     rgba(217, 48, 37, 0.1);
    --yt-offline-fg:     #d93025;
    --yt-working-bg:     rgba(0, 0, 0, 0.05);
    --yt-working-fg:     #606060;
    --yt-shadow:         0 4px 6px 3px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.3);
    --yt-progress-track: rgba(0, 0, 0, 0.1);
    --yt-hint-bg:        rgba(0, 0, 0, 0.03);
    --yt-hint-num-bg:    rgba(0, 0, 0, 0.06);
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --yt-bg:             #212121;
      --yt-bg-elevated:    #2d2d2d;
      --yt-border:         rgba(255, 255, 255, 0.1);
      --yt-divider:        rgba(255, 255, 255, 0.08);
      --yt-text:           #f1f1f1;
      --yt-text-muted:     #aaaaaa;
      --yt-chip-bg:        rgba(255, 255, 255, 0.1);
      --yt-chip-hover:     rgba(255, 255, 255, 0.15);
      --yt-chip-active:    rgba(255, 255, 255, 0.2);
      --yt-launcher-bg:    #f1f1f1;
      --yt-launcher-fg:    #0f0f0f;
      --yt-launcher-hover: #d9d9d9;
      --yt-input-bg:       #121212;
      --yt-input-border:   rgba(255, 255, 255, 0.15);
      --yt-focus:          #3ea6ff;
      --yt-online-bg:      rgba(15, 157, 88, 0.15);
      --yt-online-fg:      #2eb26a;
      --yt-offline-bg:     rgba(217, 48, 37, 0.15);
      --yt-offline-fg:     #f28b82;
      --yt-working-bg:     rgba(255, 255, 255, 0.08);
      --yt-working-fg:     #aaaaaa;
      --yt-shadow:         0 8px 24px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.4);
      --yt-progress-track: rgba(255, 255, 255, 0.12);
      --yt-hint-bg:        rgba(255, 255, 255, 0.04);
      --yt-hint-num-bg:    rgba(255, 255, 255, 0.1);
    }
  }

  /* ── Root container ─────────────────────────── */
  .pegasus-root {
    position: fixed;
    top: 80px;
    right: 16px;
    z-index: 2147483647;
    font-family: Roboto, Arial, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  /* ── Launcher button — YouTube subscribe-chip style ── */
  .pegasus-launcher {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    padding: 0 16px 0 12px;
    border-radius: 18px;
    border: none;
    background: var(--yt-launcher-bg);
    color: var(--yt-launcher-fg);
    font-family: Roboto, Arial, sans-serif;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.007em;
    cursor: pointer;
    white-space: nowrap;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    transition: background 100ms ease;
    -webkit-font-smoothing: antialiased;
  }

  .pegasus-launcher:hover  { background: var(--yt-launcher-hover); }
  .pegasus-launcher:active { opacity: 0.85; }

  .pegasus-launcher:focus-visible {
    outline: 2px solid var(--yt-focus);
    outline-offset: 2px;
  }

  .pegasus-launcher-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    width: 18px;
    height: 18px;
  }

  .pegasus-launcher-icon svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }

  /* ── Panel ──────────────────────────────────── */
  .pegasus-panel {
    width: 320px;
    margin-top: 8px;
    border-radius: 12px;
    background: var(--yt-bg);
    border: 1px solid var(--yt-border);
    box-shadow: var(--yt-shadow);
    color: var(--yt-text);
    overflow: hidden;
    animation: pegasus-in 120ms ease-out;
    -webkit-font-smoothing: antialiased;
  }

  @keyframes pegasus-in {
    from { opacity: 0; transform: translateY(-6px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }

  /* ── Panel header ───────────────────────────── */
  .pegasus-header {
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--yt-divider);
  }

  .pegasus-eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--yt-text-muted);
    margin-bottom: 2px;
  }

  .pegasus-title {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.25;
    color: var(--yt-text);
  }

  .pegasus-subtitle {
    margin: 3px 0 0;
    font-size: 12px;
    line-height: 1.4;
    color: var(--yt-text-muted);
  }

  /* ── Panel body ─────────────────────────────── */
  .pegasus-body {
    padding: 12px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* ── Status pill ─────────────────────────────── */
  .pegasus-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 18px;
    font-size: 12px;
    font-weight: 500;
    width: fit-content;
    line-height: 1;
  }

  .pegasus-status::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }

  .pegasus-status.online  { background: var(--yt-online-bg);  color: var(--yt-online-fg); }
  .pegasus-status.offline { background: var(--yt-offline-bg); color: var(--yt-offline-fg); }
  .pegasus-status.working { background: var(--yt-working-bg); color: var(--yt-working-fg); }

  /* ── Meta rows ───────────────────────────────── */
  .pegasus-meta {
    padding: 8px 10px;
    border-radius: 8px;
    background: var(--yt-bg-elevated);
  }

  .pegasus-meta strong {
    display: block;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--yt-text-muted);
    margin-bottom: 3px;
  }

  .pegasus-meta p {
    margin: 0;
    font-size: 13px;
    line-height: 1.4;
    color: var(--yt-text);
    word-break: break-word;
  }

  /* ── Field group ─────────────────────────────── */
  .pegasus-fieldset {
    padding: 0;
  }

  .pegasus-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .pegasus-fieldset label {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .pegasus-fieldset label span {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--yt-text-muted);
  }

  .pegasus-fieldset input {
    width: 100%;
    background: var(--yt-input-bg);
    border: 1px solid var(--yt-input-border);
    border-radius: 4px;
    padding: 7px 10px;
    font-size: 13px;
    font-family: Roboto, Arial, sans-serif;
    color: var(--yt-text);
    box-sizing: border-box;
    transition: border-color 100ms;
  }

  .pegasus-fieldset input:focus {
    outline: 2px solid var(--yt-focus);
    outline-offset: 0;
    border-color: transparent;
  }

  /* ── Progress ────────────────────────────────── */
  .pegasus-progress {
    height: 3px;
    width: 100%;
    border-radius: 2px;
    background: var(--yt-progress-track);
    overflow: hidden;
    margin: 6px 0 2px;
  }

  .pegasus-progress span {
    display: block;
    height: 100%;
    background: var(--yt-red);
    border-radius: 2px;
    transition: width 300ms ease;
  }

  /* ── Actions row ─────────────────────────────── */
  .pegasus-actions {
    display: flex;
    gap: 8px;
  }

  .pegasus-primary,
  .pegasus-secondary {
    flex: 1;
    height: 36px;
    border-radius: 18px;
    padding: 0 16px;
    font-size: 14px;
    font-weight: 500;
    font-family: Roboto, Arial, sans-serif;
    letter-spacing: 0.007em;
    cursor: pointer;
    white-space: nowrap;
    transition: background 100ms;
    -webkit-font-smoothing: antialiased;
  }

  .pegasus-primary {
    border: none;
    background: var(--yt-red);
    color: #ffffff;
  }

  .pegasus-primary:hover    { background: var(--yt-red-hover); }
  .pegasus-primary:disabled { opacity: 0.5; cursor: progress; }

  .pegasus-secondary {
    border: none;
    background: var(--yt-chip-bg);
    color: var(--yt-text);
  }

  .pegasus-secondary:hover  { background: var(--yt-chip-hover); }
  .pegasus-secondary:active { background: var(--yt-chip-active); }

  /* ── Footnote ────────────────────────────────── */
  .pegasus-footnote {
    margin: 0;
    font-size: 11px;
    line-height: 1.45;
    color: var(--yt-text-muted);
  }

  /* ── Responsive ──────────────────────────────── */
  @media (max-width: 960px) {
    .pegasus-root {
      top: auto;
      bottom: 16px;
      right: 12px;
    }

    .pegasus-panel {
      width: min(320px, calc(100vw - 24px));
    }
  }
`;
