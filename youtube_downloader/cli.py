from __future__ import annotations

import argparse
import shutil
import sys
from collections.abc import Callable, Iterable
from dataclasses import dataclass
from pathlib import Path

DEFAULT_FORMAT = (
    "bestvideo*[height<=1080]+bestaudio/bestvideo[height<=1080]+bestaudio/"
    "best[height<=1080]"
)


ProgressHook = Callable[[dict], None]


@dataclass
class DownloadConfig:
    urls: list[str]
    output_dir: str = "downloads"
    filename_template: str = "%(title)s [%(id)s].%(ext)s"
    format_selector: str = DEFAULT_FORMAT
    playlist: bool = False
    cookies_from_browser: str | None = None
    cookies: str | None = None
    write_subs: bool = False


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Download YouTube videos up to 1080p using yt-dlp."
    )
    parser.add_argument(
        "urls",
        nargs="+",
        help="One or more video URLs to download.",
    )
    parser.add_argument(
        "--output-dir",
        default="downloads",
        help="Directory where files will be saved. Default: downloads",
    )
    parser.add_argument(
        "--filename-template",
        default="%(title)s [%(id)s].%(ext)s",
        help="yt-dlp output template. Default: %%(title)s [%%(id)s].%%(ext)s",
    )
    parser.add_argument(
        "--format",
        default=DEFAULT_FORMAT,
        help="yt-dlp format selector. Defaults to best video/audio up to 1080p.",
    )
    parser.add_argument(
        "--playlist",
        action="store_true",
        help="Allow playlist downloads. By default, only the provided video is downloaded.",
    )
    parser.add_argument(
        "--cookies-from-browser",
        metavar="BROWSER",
        help="Load cookies from a browser supported by yt-dlp, such as chrome, safari, or firefox.",
    )
    parser.add_argument(
        "--cookies",
        metavar="FILE",
        help="Path to an exported cookies.txt file, such as one created by a browser extension.",
    )
    parser.add_argument(
        "--write-subs",
        action="store_true",
        help="Download subtitles when available.",
    )
    return parser


def config_from_args(args: argparse.Namespace) -> DownloadConfig:
    return DownloadConfig(
        urls=list(args.urls),
        output_dir=args.output_dir,
        filename_template=args.filename_template,
        format_selector=args.format,
        playlist=args.playlist,
        cookies_from_browser=args.cookies_from_browser,
        cookies=args.cookies,
        write_subs=args.write_subs,
    )


def ensure_paths(output_dir: str, cookies: str | None) -> tuple[Path, Path | None]:
    output_path = Path(output_dir).expanduser()
    output_path.mkdir(parents=True, exist_ok=True)

    cookie_path: Path | None = None
    if cookies:
        cookie_path = Path(cookies).expanduser()
        if not cookie_path.is_file():
            raise FileNotFoundError(f"Cookies file not found: {cookie_path}")

    return output_path, cookie_path


def build_download_options(
    config: DownloadConfig,
    progress_hooks: Iterable[ProgressHook] | None = None,
) -> dict:
    output_dir, cookie_path = ensure_paths(config.output_dir, config.cookies)

    options = {
        "format": config.format_selector,
        "outtmpl": str(output_dir / config.filename_template),
        "merge_output_format": "mp4",
        "noplaylist": not config.playlist,
        "writesubtitles": config.write_subs,
        "subtitleslangs": ["all"],
        "restrictfilenames": False,
        "windowsfilenames": False,
    }

    node_path = shutil.which("node")
    if node_path:
        options["js_runtimes"] = {"node": {"path": node_path}}
        options["remote_components"] = ["ejs:github"]

    hooks = list(progress_hooks or [])
    if hooks:
        options["progress_hooks"] = hooks

    if config.cookies_from_browser:
        options["cookiesfrombrowser"] = (config.cookies_from_browser,)
    if cookie_path:
        options["cookiefile"] = str(cookie_path)

    return options


def run_download(
    config: DownloadConfig,
    progress_hooks: Iterable[ProgressHook] | None = None,
) -> int:
    try:
        from yt_dlp import YoutubeDL
    except ImportError:
        print(
            "yt-dlp is not installed yet. Activate your virtualenv and run `pip install yt-dlp` first.",
            file=sys.stderr,
        )
        return 1

    options = build_download_options(config, progress_hooks=progress_hooks)
    with YoutubeDL(options) as downloader:
        downloader.download(config.urls)
    return 0


def download(args: argparse.Namespace) -> int:
    try:
        return run_download(config_from_args(args))
    except FileNotFoundError as exc:
        print(str(exc), file=sys.stderr)
        return 1
    except Exception as exc:
        message = str(exc)
        if (
            "Sign in to confirm you’re not a bot" in message
            or "Use --cookies-from-browser or --cookies" in message
        ):
            print(
                "YouTube requested authentication. Export your browser cookies to a cookies.txt file "
                "and rerun with `--cookies /absolute/path/to/cookies.txt`.",
                file=sys.stderr,
            )
        raise


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return download(args)


if __name__ == "__main__":
    raise SystemExit(main())
