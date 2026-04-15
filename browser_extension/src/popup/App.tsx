import { useEffect, useMemo, useState } from "react";
import { checkBridge } from "../shared/bridge";
import { DEFAULT_SETTINGS, getSettings, saveSettings } from "../shared/storage";
import type { ExtensionSettings } from "../shared/types";

type BridgeState = "idle" | "checking" | "online" | "offline";

export function App() {
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [savedMessage, setSavedMessage] = useState("");
  const [bridgeState, setBridgeState] = useState<BridgeState>("idle");
  const [bridgeMessage, setBridgeMessage] = useState("Waiting for a bridge check.");

  useEffect(() => {
    getSettings().then(setSettings).catch(() => setSettings(DEFAULT_SETTINGS));
  }, []);

  useEffect(() => {
    setBridgeState("checking");
    setBridgeMessage("Looking for the local Python bridge.");
    checkBridge(settings.bridgeUrl)
      .then(() => {
        setBridgeState("online");
        setBridgeMessage("Bridge is online and ready for YouTube downloads.");
      })
      .catch((error: Error) => {
        setBridgeState("offline");
        setBridgeMessage(error.message);
      });
  }, [settings.bridgeUrl]);

  const statusLabel = useMemo(() => {
    switch (bridgeState) {
      case "online":
        return "Bridge Online";
      case "offline":
        return "Bridge Offline";
      case "checking":
        return "Checking";
      default:
        return "Not Checked";
    }
  }, [bridgeState]);

  async function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveSettings(settings);
    setSavedMessage("Saved. The YouTube page panel will use these settings.");
    window.setTimeout(() => setSavedMessage(""), 2500);
  }

  return (
    <main className="popup-shell">
      <section className="popup-card">
        <div className="eyebrow">Pegasus Downloader</div>
        <h1>YouTube Downloads</h1>
        <p className="lede">
          A clean bridge between the page button and your Python downloader.
        </p>

        <div className={`status-pill status-${bridgeState}`}>{statusLabel}</div>
        <p className="status-copy">{bridgeMessage}</p>

        <form className="settings-form" onSubmit={onSave}>
          <label>
            <span>Bridge URL</span>
            <input
              value={settings.bridgeUrl}
              onChange={(event) =>
                setSettings((current) => ({ ...current, bridgeUrl: event.target.value }))
              }
              placeholder="http://127.0.0.1:8765"
            />
          </label>

          <label>
            <span>Cookies file</span>
            <input
              value={settings.cookiesPath}
              onChange={(event) =>
                setSettings((current) => ({ ...current, cookiesPath: event.target.value }))
              }
              placeholder="/absolute/path/to/cookies.txt"
            />
          </label>

          <label>
            <span>Output directory</span>
            <input
              value={settings.outputDir}
              onChange={(event) =>
                setSettings((current) => ({ ...current, outputDir: event.target.value }))
              }
              placeholder="/absolute/path/to/downloads"
            />
          </label>

          <button type="submit" className="primary-button">
            Save settings
          </button>
        </form>

        <div className="hint-grid">
          <div>
            <strong>1</strong>
            <span>Run the Python bridge locally.</span>
          </div>
          <div>
            <strong>2</strong>
            <span>Open any YouTube watch page.</span>
          </div>
          <div>
            <strong>3</strong>
            <span>Use the floating Pegasus panel to download.</span>
          </div>
        </div>

        {savedMessage ? <p className="saved-message">{savedMessage}</p> : null}
      </section>
    </main>
  );
}
