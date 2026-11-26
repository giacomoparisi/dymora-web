#!/usr/bin/env python3
"""
Imports the animated device sprites and the marketing images from dymora-app.

    python3 scripts/sync-app-assets.py [--app ../dymora-app] [--check]

What it reads (dymora-app is the source of truth, nothing here is edited by hand):
  - art/<dir>/sprites.json         sheet geometry: frames, columns, frame size, offset in the scene
  - art/<dir>/bake.py              the sprite name (`name="..."`) used by the drawables
  - core/src/commonMain/composeResources/drawable/device_<name>_<sheet>_<variant>.webp
  - for a web-only scene (`"baked": "<dir>"` in the entry): art/<dir>/<baked>/sprites.json and
    art/<dir>/<baked>/drawable/, what its bake.py writes with --out instead of the app's core

What it writes (configured in scripts/app-assets.json):
  - public/assets/sprites/<name>/<sheet>_<variant>.webp
  - public/assets/sprites/<name>.json   manifest for assets/js/sprite.js
  - public/assets/<to>                  static images, resized to WebP with cwebp when `width` is set;
                                        `crop: [x, y, w, h]` cuts a box out of the source first (magick)

A `from` starting with `@pieces/` reads the brochure's cleaned pieces, which
`design/marketing/brochure/src/build` leaves in $TMPDIR/dymora-brochure-pieces
(override with BROCHURE_PIECES). Run the brochure build first if they are missing.

--check only reports missing sources and does not write.
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG = os.path.join(ROOT, "scripts", "app-assets.json")
OUT = os.path.join(ROOT, "public", "assets")
DRAWABLES = os.path.join("core", "src", "commonMain", "composeResources", "drawable")
PIECES = os.environ.get("BROCHURE_PIECES", os.path.join(tempfile.gettempdir(), "dymora-brochure-pieces"))


def sprite_name(app, art):
    with open(os.path.join(app, "art", art, "bake.py"), encoding="utf-8") as f:
        m = re.search(r'name="([^"]+)"', f.read())
    if not m:
        raise SystemExit(f"art/{art}/bake.py: no name=")
    return m.group(1)


def find_drawable(drawables, name, sheet, variant):
    """The app ships most sheets in both variants; a few only in one. Returns (path, variant)."""
    base = os.path.join(drawables, f"device_{name}_{sheet}")
    for v in (variant, "light", "dark"):
        p = f"{base}_{v}.webp"
        if os.path.exists(p):
            return p, v
    p = f"{base}.webp"
    return (p, None) if os.path.exists(p) else (None, None)


def sync_sprites(app, entries, check, problems):
    written = 0
    for entry in entries:
        art = entry["art"]
        name = sprite_name(app, art)
        baked = os.path.join(app, "art", art, entry["baked"]) if "baked" in entry else None
        drawables = os.path.join(baked, "drawable") if baked else os.path.join(app, DRAWABLES)
        with open(os.path.join(baked or os.path.join(app, "art", art), "sprites.json"), encoding="utf-8") as f:
            spec = json.load(f)
        dest = os.path.join(OUT, "sprites", name)
        manifest = {
            "name": name,
            "scene": spec["scene"],
            "fps": 24,
            "variants": {},
            "sheets": {k: {"frames": s["frames"], "columns": s["columns"], "frame": s["frame"], "offset": s["offset"]}
                       for k, s in spec["sheets"].items()},
        }
        if "anchors" in spec:
            manifest["anchors"] = spec["anchors"]
        for variant in entry["variants"]:
            files = {}
            for sheet in spec["sheets"]:
                src, got = find_drawable(drawables, name, sheet, variant)
                if not src:
                    problems.append(f"{name}: sheet '{sheet}' has no drawable")
                    continue
                if got and got != variant:
                    problems.append(f"{name}: sheet '{sheet}' has no {variant} variant, using {got}")
                file = f"{sheet}_{variant}.webp"
                files[sheet] = f"/assets/sprites/{name}/{file}"
                if not check:
                    os.makedirs(dest, exist_ok=True)
                    shutil.copyfile(src, os.path.join(dest, file))
                    written += 1
            manifest["variants"][variant] = files
        if not check:
            with open(os.path.join(OUT, "sprites", f"{name}.json"), "w", encoding="utf-8") as f:
                json.dump(manifest, f, separators=(",", ":"))
                f.write("\n")
    return written


def sync_files(app, entries, check, problems):
    written = 0
    for entry in entries:
        src = (os.path.join(PIECES, entry["from"][len("@pieces/"):]) if entry["from"].startswith("@pieces/")
               else os.path.join(app, entry["from"]))
        dst = os.path.join(OUT, entry["to"])
        if not os.path.exists(src):
            problems.append(f"missing {entry['from']}")
            continue
        if check:
            continue
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if "crop" in entry:
            x, y, w, h = entry["crop"]
            cmd = ["magick", src, "-crop", f"{w}x{h}+{x}+{y}", "+repage"]
            if "width" in entry:
                cmd += ["-resize", f"{entry['width']}x"]
            subprocess.run(cmd + ["-quality", "82", dst], check=True)
        elif "width" in entry:
            subprocess.run(["cwebp", "-quiet", "-q", "82", "-alpha_q", "90",
                            "-resize", str(entry["width"]), "0", src, "-o", dst], check=True)
        else:
            shutil.copyfile(src, dst)
        written += 1
    return written


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--app", default=os.path.join(os.path.dirname(ROOT), "dymora-app"))
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    app = os.path.abspath(args.app)
    if not os.path.isdir(os.path.join(app, "art")):
        raise SystemExit(f"{app}: not a dymora-app checkout")
    with open(CONFIG, encoding="utf-8") as f:
        config = json.load(f)

    problems = []
    n = sync_sprites(app, config["sprites"], args.check, problems)
    n += sync_files(app, config["files"], args.check, problems)
    for p in problems:
        print("warning:", p, file=sys.stderr)
    if not args.check:
        print(f"{n} files written to public/assets")
    return 0


if __name__ == "__main__":
    sys.exit(main())
