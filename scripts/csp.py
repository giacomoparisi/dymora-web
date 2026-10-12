#!/usr/bin/env python3
"""Aggiorna (o verifica) la Content-Security-Policy <meta> di ogni pagina.

GitHub Pages non permette header HTTP personalizzati, quindi la CSP sta in un
<meta http-equiv>. Gli stili inline sono permessi solo tramite il loro hash
sha256: ogni modifica a un blocco <style> (o a uno <script> inline) cambia
l'hash, e il browser ignorerebbe il blocco. Dopo ogni modifica:

    python3 scripts/csp.py          # riscrive le CSP
    python3 scripts/csp.py --check  # esce con errore se una CSP non è aggiornata
"""
import base64
import hashlib
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SKIP_DIRS = {".git", "node_modules", "prompts", "docs", "scripts", ".claude"}

BASE = [
    "default-src 'self'",
    "script-src 'self'{scripts}",
    "style-src 'self'{styles}",
    "img-src 'self'",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
]

META_RE = re.compile(r'<meta http-equiv="Content-Security-Policy" content="[^"]*">')


def digest(text):
    return "'sha256-" + base64.b64encode(hashlib.sha256(text.encode("utf-8")).digest()).decode() + "'"


def policy(html):
    styles = [digest(m) for m in re.findall(r"<style>(.*?)</style>", html, re.S)]
    scripts = [digest(m) for m in re.findall(r"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", html, re.S)]
    fmt = lambda hs: "".join(" " + h for h in dict.fromkeys(hs))
    return "; ".join(BASE).format(scripts=fmt(scripts), styles=fmt(styles))


def pages():
    for path in sorted(ROOT.rglob("*.html")):
        if not SKIP_DIRS.intersection(path.relative_to(ROOT).parts):
            yield path


def main():
    check = "--check" in sys.argv
    stale = []
    for path in pages():
        html = path.read_text(encoding="utf-8")
        if not META_RE.search(html):
            stale.append(f"{path.relative_to(ROOT)}: manca il <meta> CSP")
            continue
        meta = f'<meta http-equiv="Content-Security-Policy" content="{policy(html)}">'
        updated = META_RE.sub(meta, html, count=1)
        if updated != html:
            if check:
                stale.append(f"{path.relative_to(ROOT)}: CSP non aggiornata")
            else:
                path.write_text(updated, encoding="utf-8")
                print(f"aggiornata {path.relative_to(ROOT)}")
    if stale:
        print("\n".join(stale), file=sys.stderr)
        sys.exit(1)
    if check:
        print("CSP aggiornate su tutte le pagine.")


if __name__ == "__main__":
    main()
