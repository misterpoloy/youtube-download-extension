from __future__ import annotations

import argparse
import json
import threading
import time
import uuid
from dataclasses import asdict, dataclass, field
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from youtube_downloader.cli import DownloadConfig, run_download


@dataclass
class DownloadJob:
    job_id: str
    url: str
    output_dir: str
    cookies: str | None = None
    status: str = "queued"
    progress: float = 0.0
    downloaded_bytes: int = 0
    total_bytes: int | None = None
    filename: str | None = None
    error: str | None = None
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)


class JobStore:
    def __init__(self) -> None:
        self._jobs: dict[str, DownloadJob] = {}
        self._lock = threading.Lock()

    def create(self, url: str, output_dir: str, cookies: str | None) -> DownloadJob:
        job = DownloadJob(
            job_id=uuid.uuid4().hex,
            url=url,
            output_dir=output_dir,
            cookies=cookies,
        )
        with self._lock:
            self._jobs[job.job_id] = job
        return job

    def update(self, job_id: str, **changes: object) -> DownloadJob | None:
        with self._lock:
            job = self._jobs.get(job_id)
            if not job:
                return None
            for key, value in changes.items():
                setattr(job, key, value)
            job.updated_at = time.time()
            return job

    def get(self, job_id: str) -> DownloadJob | None:
        with self._lock:
            return self._jobs.get(job_id)


JOB_STORE = JobStore()


def make_progress_hook(job_id: str):
    def hook(data: dict) -> None:
        status = data.get("status")
        if status == "downloading":
            total = data.get("total_bytes") or data.get("total_bytes_estimate")
            downloaded = data.get("downloaded_bytes") or 0
            progress = 0.0
            if total:
                progress = max(0.0, min(1.0, downloaded / total))
            JOB_STORE.update(
                job_id,
                status="downloading",
                progress=progress,
                downloaded_bytes=downloaded,
                total_bytes=total,
                filename=data.get("filename"),
            )
        elif status == "finished":
            JOB_STORE.update(
                job_id,
                status="processing",
                progress=1.0,
                filename=data.get("filename"),
            )

    return hook


def run_job(job: DownloadJob) -> None:
    JOB_STORE.update(job.job_id, status="starting")
    try:
        config = DownloadConfig(
            urls=[job.url],
            output_dir=job.output_dir,
            cookies=job.cookies,
        )
        run_download(config, progress_hooks=[make_progress_hook(job.job_id)])
        JOB_STORE.update(job.job_id, status="completed", progress=1.0)
    except Exception as exc:  # noqa: BLE001
        JOB_STORE.update(job.job_id, status="failed", error=str(exc))


class BridgeHandler(BaseHTTPRequestHandler):
    server_version = "PegasusBridge/0.1"

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            self._send_json(
                HTTPStatus.OK,
                {
                    "status": "ok",
                    "service": "youtube-downloader-bridge",
                },
            )
            return
        if parsed.path.startswith("/jobs/"):
            job_id = parsed.path.split("/")[-1]
            job = JOB_STORE.get(job_id)
            if not job:
                self._send_json(HTTPStatus.NOT_FOUND, {"error": "Job not found"})
                return
            self._send_json(HTTPStatus.OK, asdict(job))
            return

        self._send_json(HTTPStatus.NOT_FOUND, {"error": "Not found"})

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path != "/download":
            self._send_json(HTTPStatus.NOT_FOUND, {"error": "Not found"})
            return

        payload = self._read_json()
        url = payload.get("url")
        output_dir = payload.get("output_dir") or "downloads"
        cookies = payload.get("cookies")

        if not isinstance(url, str) or not url.strip():
            self._send_json(HTTPStatus.BAD_REQUEST, {"error": "A video URL is required"})
            return

        if cookies is not None and not isinstance(cookies, str):
            self._send_json(
                HTTPStatus.BAD_REQUEST,
                {"error": "Cookies must be a file path string"},
            )
            return

        job = JOB_STORE.create(url=url.strip(), output_dir=output_dir, cookies=cookies)
        worker = threading.Thread(target=run_job, args=(job,), daemon=True)
        worker.start()
        self._send_json(HTTPStatus.ACCEPTED, asdict(job))

    def log_message(self, format: str, *args) -> None:  # noqa: A003
        return

    def _read_json(self) -> dict:
        length = int(self.headers.get("Content-Length", "0"))
        if length == 0:
            return {}
        body = self.rfile.read(length).decode("utf-8")
        if not body:
            return {}
        return json.loads(body)

    def _send_json(self, status: HTTPStatus, payload: dict) -> None:
        self.send_response(status)
        self._send_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode("utf-8"))

    def _send_cors_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")


def build_bridge_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Run the local HTTP bridge for the Pegasus browser extension."
    )
    parser.add_argument("--host", default="127.0.0.1", help="Default: 127.0.0.1")
    parser.add_argument("--port", type=int, default=8765, help="Default: 8765")
    return parser


def main() -> int:
    parser = build_bridge_parser()
    args = parser.parse_args()

    server = ThreadingHTTPServer((args.host, args.port), BridgeHandler)
    print(f"Bridge listening on http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nBridge stopped.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
