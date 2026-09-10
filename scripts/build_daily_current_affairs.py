#!/usr/bin/env python3
import argparse
from pathlib import Path
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab import rl_config
import io

rl_config.useA85 = 0


def image_key(p: Path):
    name = p.name.lower()
    if name.startswith("00-cover") or "cover" in name:
        return (0, name)
    return (1, name)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", required=True)
    args = ap.parse_args()

    src = Path("current-affairs/assets") / args.date
    out = Path("current-affairs") / f"{args.date}.pdf"

    if not src.exists():
        print(f"No source folder: {src}")
        return

    images = sorted(
        [p for p in src.iterdir() if p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}],
        key=image_key,
    )
    if not images:
        print(f"No images found in {src}")
        return

    out.parent.mkdir(parents=True, exist_ok=True)
    pw, ph = 1024, 1536
    c = canvas.Canvas(str(out), pagesize=(pw, ph), pageCompression=1)

    for p in images:
        with Image.open(p) as im:
            im = im.convert("RGB")
            # Optimise each page before embedding. 820 px width keeps phone text
            # readable while keeping the daily PDF small enough for web delivery.
            if im.width > 820:
                nh = round(im.height * 820 / im.width)
                im = im.resize((820, nh), Image.Resampling.LANCZOS)

            buf = io.BytesIO()
            im.save(buf, "JPEG", quality=78, optimize=True, progressive=True)
            buf.seek(0)

            iw, ih = im.size
            scale = min(pw / iw, ph / ih)
            dw, dh = iw * scale, ih * scale
            x, y = (pw - dw) / 2, (ph - dh) / 2
            c.drawImage(ImageReader(buf), x, y, width=dw, height=dh, preserveAspectRatio=True)
            c.showPage()

    c.save()
    print(f"Created optimised PDF {out} with {len(images)} pages")


if __name__ == "__main__":
    main()
