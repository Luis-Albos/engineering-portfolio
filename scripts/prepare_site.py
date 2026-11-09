#!/usr/bin/env python3
"""Stage only the public static site and record its byte identity."""
import argparse
import hashlib
import json
import shutil
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
ROOT_FILES = (
    "index.html", "resume.html", "styles.css", "script.js", "site-config.js",
    "page-transitions.js", "resume.js", "service-worker.js", "version.json", "VERSION", "robots.txt",
)


class AssetReferences(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in {"script", "img", "iframe", "source"} and attrs.get("src"):
            self.urls.append(attrs["src"])
        if tag == "link" and attrs.get("rel") in {"stylesheet", "icon"} and attrs.get("href"):
            self.urls.append(attrs["href"])


def verify_html_assets(output: Path) -> None:
    for page in output.rglob("*.html"):
        parser = AssetReferences()
        parser.feed(page.read_text(encoding="utf-8"))
        for url in parser.urls:
            parsed = urlsplit(url)
            if parsed.scheme or parsed.netloc or not parsed.path:
                continue
            target = (page.parent / unquote(parsed.path)).resolve()
            if not target.is_relative_to(output) or not target.is_file():
                raise SystemExit(f"Missing packaged HTML asset: {page.relative_to(output)} -> {url}")


def prepare(output: Path) -> None:
    output = output.resolve()
    if output == ROOT or ROOT in output.parents and output.name in {"assets", "js", "css", "resources", "reference"}:
        raise SystemExit("Choose a separate empty artifact directory.")
    if output.exists() and any(output.iterdir()):
        raise SystemExit(f"Artifact directory must be empty: {output}")
    output.mkdir(parents=True, exist_ok=True)
    for name in ROOT_FILES:
        shutil.copy2(ROOT / name, output / name)
    for name in ("assets", "css", "js", "resources"):
        shutil.copytree(ROOT / name, output / name, ignore=shutil.ignore_patterns(".gitkeep", "__pycache__", "node_modules"))
    (output / "reference").mkdir()
    for name in ("CP1_2024.glb", "CP1_2024.glb.gz"):
        shutil.copy2(ROOT / "reference" / name, output / "reference" / name)
    verify_html_assets(output)
    files = {}
    for path in sorted(output.rglob("*")):
        if path.is_file():
            files[path.relative_to(output).as_posix()] = hashlib.sha256(path.read_bytes()).hexdigest()
    identity = {
        "build": json.loads((ROOT / "version.json").read_text(encoding="utf-8"))["build"],
        "sourceVersion": (ROOT / "VERSION").read_text(encoding="utf-8").strip(),
        "files": files,
    }
    manifest = output / "_artifact.json"
    manifest.write_text(json.dumps(identity, indent=2) + "\n", encoding="utf-8")
    print(f"Static artifact: {output}; {len(files)} files; identity SHA-256 {hashlib.sha256(manifest.read_bytes()).hexdigest()}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    prepare(parser.parse_args().output)
