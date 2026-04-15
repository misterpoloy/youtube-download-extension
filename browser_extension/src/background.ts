import type { RuntimeMessage } from "./shared/types";
import { DEFAULT_SETTINGS, saveSettings } from "./shared/storage";

async function fetchJson(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? `HTTP ${response.status}`);
  }
  return data;
}

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get("pegasusSettings");
  if (!existing.pegasusSettings) {
    await saveSettings(DEFAULT_SETTINGS);
  }
});

chrome.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse) => {
  const run = async () => {
    switch (message.type) {
      case "bridge:health":
        return await fetchJson(`${message.bridgeUrl}/health`);
      case "bridge:start-download":
        return await fetchJson(`${message.bridgeUrl}/download`, {
          method: "POST",
          body: JSON.stringify({
            url: message.url,
            output_dir: message.outputDir,
            cookies: message.cookiesPath || undefined
          })
        });
      case "bridge:get-job":
        return await fetchJson(`${message.bridgeUrl}/jobs/${message.jobId}`);
      default:
        throw new Error("Unknown extension message.");
    }
  };

  run()
    .then((data) => sendResponse({ ok: true, data }))
    .catch((error: Error) => sendResponse({ ok: false, error: error.message }));

  return true;
});
