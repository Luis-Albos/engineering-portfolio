#!/usr/bin/env python3
"""Generate the Study Archive manifest and first-page WebP thumbnails."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

try:
    import fitz  # PyMuPDF
    from PIL import Image
except ImportError as exc:
    raise SystemExit(
        "Missing build dependency. Run: python -m pip install -r requirements-study.txt"
    ) from exc


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-")
    return slug or "resource"


def natural_key(value: str) -> list[tuple[int, object]]:
    return [
        (1, int(part)) if part.isdigit() else (0, part.casefold())
        for part in re.split(r"(\d+)", value)
    ]


def derive_class_name(folder_name: str) -> str:
    """Turn the first spaced hyphen into the archive's editorial em dash."""
    return re.sub(r"\s+-\s+", " — ", folder_name, count=1)


def repo_path(path: Path) -> str:
    return path.resolve().relative_to(REPOSITORY_ROOT).as_posix()


def unique_slug(base: str, used: set[str]) -> str:
    candidate = base
    suffix = 2
    while candidate in used:
        candidate = f"{base}-{suffix}"
        suffix += 1
    used.add(candidate)
    return candidate


def read_class_metadata(class_dir: Path) -> dict:
    metadata_path = class_dir / "class.json"
    if not metadata_path.exists():
        return {}
    try:
        data = json.loads(metadata_path.read_text(encoding="utf-8-sig"))
        if not isinstance(data, dict):
            raise ValueError("the root value must be an object")
        return data
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"Warning: ignoring invalid {metadata_path}: {exc}", file=sys.stderr)
        return {}


def render_thumbnail(pdf_path: Path, thumbnail_path: Path) -> tuple[int | None, str | None]:
    document = None
    try:
        document = fitz.open(pdf_path)
        page_count = document.page_count
        if page_count < 1:
            raise ValueError("PDF has no pages")

        page = document.load_page(0)
        scale = min(2.2, max(1.0, 900 / max(page.rect.width, 1)))
        pixmap = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
        image = Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples)
        thumbnail_path.parent.mkdir(parents=True, exist_ok=True)
        image.save(thumbnail_path, "WEBP", quality=82, method=6)
        return page_count, None
    except Exception as exc:  # One damaged PDF should not prevent the remaining archive from building.
        return None, str(exc)
    finally:
        if document is not None:
            document.close()


def build_archive(study_dir: Path, thumbnail_dir: Path, manifest_path: Path) -> dict:
    study_dir.mkdir(parents=True, exist_ok=True)

    if thumbnail_dir.exists():
        shutil.rmtree(thumbnail_dir)
    thumbnail_dir.mkdir(parents=True, exist_ok=True)

    classes = []
    used_class_slugs: set[str] = set()

    class_directories = sorted(
        (path for path in study_dir.iterdir() if path.is_dir() and not path.name.startswith(".")),
        key=lambda path: natural_key(path.name),
    )

    for class_dir in class_directories:
        metadata = read_class_metadata(class_dir)
        class_slug = unique_slug(slugify(class_dir.name), used_class_slugs)
        display_name = str(metadata.get("displayName") or derive_class_name(class_dir.name)).strip() or derive_class_name(class_dir.name)
        description = str(metadata.get("description") or "").strip()
        semester = str(metadata.get("semester") or "").strip()
        raw_tags = metadata.get("tags") or []
        if isinstance(raw_tags, str):
            raw_tags = [raw_tags]
        tags = [str(tag).strip() for tag in raw_tags if str(tag).strip()] if isinstance(raw_tags, list) else []
        explicit_order = metadata.get("order")
        order = explicit_order if isinstance(explicit_order, (int, float)) and not isinstance(explicit_order, bool) else None

        documents = []
        used_document_slugs: set[str] = set()
        pdf_files = sorted(
            (
                path
                for path in class_dir.iterdir()
                if path.is_file() and not path.name.startswith(".") and path.suffix.casefold() == ".pdf"
            ),
            key=lambda path: natural_key(path.name),
        )

        for pdf_path in pdf_files:
            title = pdf_path.stem
            document_slug = unique_slug(slugify(title), used_document_slugs)
            document_id = f"{class_slug}--{document_slug}"
            thumbnail_path = thumbnail_dir / class_slug / f"{document_slug}.webp"
            page_count, thumbnail_error = render_thumbnail(pdf_path, thumbnail_path)

            if thumbnail_error:
                print(f"Warning: thumbnail unavailable for {pdf_path}: {thumbnail_error}", file=sys.stderr)

            documents.append(
                {
                    "id": document_id,
                    "title": title,
                    "path": repo_path(pdf_path),
                    "thumbnailPath": repo_path(thumbnail_path) if thumbnail_path.exists() else None,
                    "pageCount": page_count,
                    "fileSizeBytes": pdf_path.stat().st_size,
                }
            )

        classes.append(
            {
                "id": class_slug,
                "folderName": class_dir.name,
                "displayName": display_name,
                "description": description,
                "semester": semester,
                "tags": tags,
                "order": order,
                "resourceCount": len(documents),
                "documents": documents,
            }
        )

    classes.sort(
        key=lambda item: (
            item["order"] is None,
            item["order"] if item["order"] is not None else float("inf"),
            natural_key(item["displayName"]),
        )
    )

    manifest = {
        "version": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "classCount": len(classes),
        "resourceCount": sum(item["resourceCount"] for item in classes),
        "classes": classes,
    }
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return manifest


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--study-dir", type=Path, default=REPOSITORY_ROOT / "assets" / "study")
    parser.add_argument("--thumbnail-dir", type=Path, default=REPOSITORY_ROOT / "assets" / "study-thumbnails")
    parser.add_argument("--manifest", type=Path, default=REPOSITORY_ROOT / "assets" / "study-manifest.json")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    manifest = build_archive(args.study_dir.resolve(), args.thumbnail_dir.resolve(), args.manifest.resolve())
    print(
        f"Study Archive: {manifest['classCount']} classes, "
        f"{manifest['resourceCount']} resources -> {args.manifest}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
