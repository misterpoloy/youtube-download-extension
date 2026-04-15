import type { BridgeHealth, DownloadJob, RuntimeMessage } from "./types";

function sendMessage<T>(message: RuntimeMessage): Promise<T> {
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

export function checkBridge(bridgeUrl: string): Promise<BridgeHealth> {
  return sendMessage<BridgeHealth>({
    type: "bridge:health",
    bridgeUrl
  });
}

export function startDownload(payload: {
  bridgeUrl: string;
  url: string;
  outputDir: string;
  cookiesPath?: string;
}): Promise<DownloadJob> {
  return sendMessage<DownloadJob>({
    type: "bridge:start-download",
    bridgeUrl: payload.bridgeUrl,
    url: payload.url,
    outputDir: payload.outputDir,
    cookiesPath: payload.cookiesPath
  });
}

export function getJob(bridgeUrl: string, jobId: string): Promise<DownloadJob> {
  return sendMessage<DownloadJob>({
    type: "bridge:get-job",
    bridgeUrl,
    jobId
  });
}
