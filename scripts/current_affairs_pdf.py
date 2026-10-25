#!/usr/bin/env python3
"""Publish a PDF under an explicit edition date without relabelling an old issue."""

from __future__ import annotations

import argparse
import hashlib
import re
import shutil
import tempfile
from datetime import date
from pathlib import Path


CURRENT_AFFAIRS_DIR = Path(__file__).resolve().parents[1] / "current-affairs"
DATED_PDF = re.compile(r"^(\d{4}-\d{2}-\d{2})\.pdf$")


def edition_date(value: str) -> date:
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        raise ValueError("An explicit PDF edition date in YYYY-MM-DD is required.")
    try:
        return date.fromisoformat(value)
    except ValueError as error:
        raise ValueError(f"Invalid PDF edition date: {value}") from error


def pdf_digest(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        if handle.read(5) != b"%PDF-":
            raise ValueError(f"Not a PDF: {path.name}")
        handle.seek(0)
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def dated_pdfs(directory: Path):
    # ISO dates sort oldest first, preserving the original issue for duplicates.
    for path in sorted(directory.glob("*.pdf")):
        match = DATED_PDF.fullmatch(path.name)
        if match:
            yield path, edition_date(match.group(1))


def publish_pdf(source: Path, issue_date: str, directory: Path = CURRENT_AFFAIRS_DIR) -> Path:
    published = edition_date(issue_date)
    fingerprint = pdf_digest(source)
    target = directory / f"{published.isoformat()}.pdf"
    for existing, existing_date in dated_pdfs(directory):
        if existing_date != published and pdf_digest(existing) == fingerprint:
            raise ValueError(
                f"Refusing to publish {target.name}: this is the same PDF as "
                f"{existing.name}. Upload the correct edition; do not rename an old digest."
            )

    directory.mkdir(parents=True, exist_ok=True)
    # Validate before touching a published file; replace atomically after copying.
    with tempfile.NamedTemporaryFile(dir=directory, prefix=".ca-", suffix=".tmp", delete=False) as handle:
        temporary = Path(handle.name)
    try:
        shutil.copyfile(source, temporary)
        # Jekyll preserves this mode; the Pages artifact uploader runs as another user.
        temporary.chmod(0o644)
        temporary.replace(target)
    finally:
        temporary.unlink(missing_ok=True)
    return target


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", required=True, help="Edition date from the PDF, never the upload/run date")
    parser.add_argument("--source", required=True, type=Path)
    args = parser.parse_args()
    try:
        target = publish_pdf(args.source, args.date)
    except (ValueError, OSError) as error:
        raise SystemExit(str(error)) from error
    print(f"Published validated PDF: {target}")


if __name__ == "__main__":
    main()
