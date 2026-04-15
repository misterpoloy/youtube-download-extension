import { contentStyles } from "./contentStyles";

type ExtensionSettings = {
  bridgeUrl: string;
  outputDir: string;
  cookiesPath: string;
};

type DownloadJob = {
  job_id: string;
  status: string;
  progress: number;
  filename?: string | null;
  error?: string | null;
};

const ROOT_ID = "pegasus-extension-root";
const SETTINGS_KEY = "pegasusSettings";
const DEFAULT_SETTINGS: ExtensionSettings = {
  bridgeUrl: "http://127.0.0.1:8765",
  outputDir: "",
  cookiesPath: ""
};

let currentJobId: string | null = null;
let pollTimer: number | null = null;

function isWatchPage(url: string) {
  return url.includes("youtube.com/watch");
}

async function getSettings(): Promise<ExtensionSettings> {
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  return {
    ...DEFAULT_SETTINGS,
    ...(result[SETTINGS_KEY] ?? {})
  };
}

async function saveSettings(settings: ExtensionSettings) {
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}

function currentTitle() {
  const heading = document.querySelector("h1.ytd-watch-metadata yt-formatted-string");
  return heading?.textContent?.trim() || document.title.replace(" - YouTube", "");
}

function currentUrl() {
  return window.location.href;
}

function buildCommand(url: string, settings: ExtensionSettings) {
  const cmd = [`python -m youtube_downloader.cli "${url}"`];
  if (settings.cookiesPath) cmd.push(`--cookies "${settings.cookiesPath}"`);
  if (settings.outputDir) cmd.push(`--output-dir "${settings.outputDir}"`);
  return ["source .venv/bin/activate", cmd.join(" ")].join(" && ");
}

function runtimeMessage<T>(message: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      const runtimeError = chrome.runtime.lastError;
      if (runtimeError) {
        reject(new Error(runtimeError.message));
        return;
      }
      if (!response) {
        reject(new Error("No response from extension background worker."));
        return;
      }
      if (!response.ok) {
        reject(new Error(response.error ?? "Bridge request failed."));
        return;
      }
      resolve(response.data as T);
    });
  });
}

async function checkBridge(bridgeUrl: string) {
  return await runtimeMessage<{ status: string }>({
    type: "bridge:health",
    bridgeUrl
  });
}

async function startDownload(settings: ExtensionSettings) {
  return await runtimeMessage<DownloadJob>({
    type: "bridge:start-download",
    bridgeUrl: settings.bridgeUrl,
    url: currentUrl(),
    outputDir: settings.outputDir,
    cookiesPath: settings.cookiesPath
  });
}

async function getJob(bridgeUrl: string, jobId: string) {
  return await runtimeMessage<DownloadJob>({
    type: "bridge:get-job",
    bridgeUrl,
    jobId
  });
}

function removeExistingRoot() {
  document.getElementById(ROOT_ID)?.remove();
}

function setStatus(element: HTMLElement, text: string, kind: "online" | "offline" | "working") {
  element.className = `pegasus-status ${kind}`;
  element.textContent = text;
}

async function mount() {
  removeExistingRoot();
  if (!isWatchPage(window.location.href)) {
    return;
  }

  const settings = await getSettings();
  const host = document.createElement("div");
  host.id = ROOT_ID;
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = contentStyles;
  shadow.appendChild(style);

  const wrapper = document.createElement("div");
  wrapper.className = "pegasus-root";
  shadow.appendChild(wrapper);

  const SVG_DOWNLOAD = `
    <span class="pegasus-launcher-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/>
      </svg>
    </span>
    <span>Download</span>
  `;
  const SVG_CLOSE = `
    <span class="pegasus-launcher-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </span>
    <span>Close</span>
  `;

  const launcher = document.createElement("button");
  launcher.className = "pegasus-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-expanded", "false");
  launcher.innerHTML = SVG_DOWNLOAD;
  wrapper.appendChild(launcher);

  const panel = document.createElement("section");
  panel.className = "pegasus-panel";
  panel.setAttribute("aria-label", "Pegasus downloader panel");
  panel.style.display = "none";
  panel.innerHTML = `
    <header class="pegasus-header">
      <div class="pegasus-eyebrow">Pegasus</div>
      <h2 class="pegasus-title">Quick local download</h2>
      <p class="pegasus-subtitle">Send this video to your Python downloader.</p>
    </header>
    <div class="pegasus-body">
      <div class="pegasus-status working">Checking bridge</div>
      <div class="pegasus-meta">
        <strong>Current video</strong>
        <p data-role="title"></p>
      </div>
      <div class="pegasus-meta">
        <strong>Bridge message</strong>
        <p data-role="message"></p>
      </div>
      <div class="pegasus-fieldset pegasus-grid">
        <label>
          <span>Cookies file</span>
          <input data-role="cookies" placeholder="/absolute/path/to/cookies.txt" />
        </label>
        <label>
          <span>Output directory</span>
          <input data-role="output" placeholder="/absolute/path/to/downloads" />
        </label>
      </div>
      <div class="pegasus-meta" data-role="progress-card" style="display:none;">
        <strong>Download progress</strong>
        <div class="pegasus-progress" aria-hidden="true">
          <span data-role="progress-bar" style="width:0%"></span>
        </div>
        <p data-role="progress-text">0%</p>
      </div>
      <div class="pegasus-actions">
        <button class="pegasus-primary" type="button" data-role="download">Download</button>
        <button class="pegasus-secondary" type="button" data-role="copy">Copy command</button>
      </div>
      <p class="pegasus-footnote">Your saved cookies path and downloads folder are reused here.</p>
      <p class="pegasus-footnote" data-role="copy-message" style="display:none;"></p>
    </div>
  `;
  wrapper.appendChild(panel);

  const titleEl = panel.querySelector<HTMLElement>('[data-role="title"]')!;
  const messageEl = panel.querySelector<HTMLElement>('[data-role="message"]')!;
  const statusEl = panel.querySelector<HTMLElement>(".pegasus-status")!;
  const cookiesInput = panel.querySelector<HTMLInputElement>('[data-role="cookies"]')!;
  const outputInput = panel.querySelector<HTMLInputElement>('[data-role="output"]')!;
  const progressCard = panel.querySelector<HTMLElement>('[data-role="progress-card"]')!;
  const progressBar = panel.querySelector<HTMLElement>('[data-role="progress-bar"]')!;
  const progressText = panel.querySelector<HTMLElement>('[data-role="progress-text"]')!;
  const copyMessage = panel.querySelector<HTMLElement>('[data-role="copy-message"]')!;
  const downloadButton = panel.querySelector<HTMLButtonElement>('[data-role="download"]')!;
  const copyButton = panel.querySelector<HTMLButtonElement>('[data-role="copy"]')!;

  titleEl.textContent = currentTitle() || "Untitled YouTube video";
  cookiesInput.value = settings.cookiesPath;
  outputInput.value = settings.outputDir;

  async function persistInputs() {
    const next = {
      ...settings,
      cookiesPath: cookiesInput.value,
      outputDir: outputInput.value
    };
    await saveSettings(next);
    settings.cookiesPath = next.cookiesPath;
    settings.outputDir = next.outputDir;
  }

  cookiesInput.addEventListener("change", () => void persistInputs());
  outputInput.addEventListener("change", () => void persistInputs());

  launcher.addEventListener("click", () => {
    const isOpen = panel.style.display !== "none";
    panel.style.display = isOpen ? "none" : "block";
    launcher.setAttribute("aria-expanded", isOpen ? "false" : "true");
    launcher.innerHTML = isOpen ? SVG_DOWNLOAD : SVG_CLOSE;
  });

  copyButton.addEventListener("click", async () => {
    await persistInputs();
    await navigator.clipboard.writeText(buildCommand(currentUrl(), settings));
    copyMessage.style.display = "block";
    copyMessage.textContent = "Command copied. You can run it manually in Terminal.";
  });

  downloadButton.addEventListener("click", async () => {
    try {
      await persistInputs();
      downloadButton.disabled = true;
      setStatus(statusEl, "Starting download", "working");
      messageEl.textContent = "Sending this video to the local bridge.";
      const job = await startDownload(settings);
      currentJobId = job.job_id;
      progressCard.style.display = "block";
      void pollJob(settings.bridgeUrl, messageEl, statusEl, progressBar, progressText, downloadButton);
    } catch (error) {
      downloadButton.disabled = false;
      setStatus(statusEl, "Bridge offline", "offline");
      messageEl.textContent = error instanceof Error ? error.message : "Failed to start download.";
    }
  });

  try {
    await checkBridge(settings.bridgeUrl);
    setStatus(statusEl, "Bridge online", "online");
    messageEl.textContent = "Local bridge connected.";
  } catch (error) {
    setStatus(statusEl, "Bridge offline", "offline");
    messageEl.textContent = error instanceof Error ? error.message : "Bridge unavailable.";
  }
}

async function pollJob(
  bridgeUrl: string,
  messageEl: HTMLElement,
  statusEl: HTMLElement,
  progressBar: HTMLElement,
  progressText: HTMLElement,
  downloadButton: HTMLButtonElement
) {
  if (pollTimer) {
    window.clearInterval(pollTimer);
  }

  pollTimer = window.setInterval(async () => {
    if (!currentJobId) {
      return;
    }

    try {
      const job = await getJob(bridgeUrl, currentJobId);
      const progress = Math.round((job.progress || 0) * 100);
      progressBar.style.width = `${progress}%`;
      progressText.textContent = `${progress}% · ${job.filename || "Preparing file"}`;

      if (job.status === "completed") {
        setStatus(statusEl, "Download complete", "online");
        messageEl.textContent = `Saved to your downloads folder${job.filename ? ` as ${job.filename}` : "."}`;
        downloadButton.disabled = false;
        window.clearInterval(pollTimer!);
      } else if (job.status === "failed") {
        setStatus(statusEl, "Download failed", "offline");
        messageEl.textContent = job.error || "The bridge reported a failed download.";
        downloadButton.disabled = false;
        window.clearInterval(pollTimer!);
      } else {
        setStatus(statusEl, `Job ${job.status}`, "working");
        messageEl.textContent = "The bridge is downloading this video.";
      }
    } catch (error) {
      setStatus(statusEl, "Bridge offline", "offline");
      messageEl.textContent = error instanceof Error ? error.message : "Unable to poll job status.";
      downloadButton.disabled = false;
      window.clearInterval(pollTimer!);
    }
  }, 1500);
}

let lastUrl = window.location.href;
void mount();

const observer = new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    void mount();
  }
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});
