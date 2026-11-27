"""Build the GitHub Pages copy of the A3 Workbench with a Content Security Policy.

GitHub Pages cannot send security headers, so the policy goes in a <meta> tag
in the page's <head>. It allows only the page's own inline script (by its
SHA-256 hash, so an injected script or onclick attribute will not run), the two
pinned PDF libraries from cdn.jsdelivr.net, and a3.json from the same site.

Usage: python3 scripts/pages_site.py _site
"""
import base64
import hashlib
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "prototype" / "a3-workbench"
# Only these files are published. Nothing else in the repository reaches Pages.
FILES = ("index.html", "a3.json")
INLINE_SCRIPT = re.compile(r"<script>(.*?)</script>", re.S)
SCRIPT_CDN = "https://cdn.jsdelivr.net"


def script_hashes(html):
    scripts = INLINE_SCRIPT.findall(html)
    if not scripts:
        raise ValueError("no inline script found")
    if html.count("<script") != len(scripts):
        raise ValueError("only plain inline <script> tags are supported")
    return ["'sha256-" + base64.b64encode(hashlib.sha256(s.encode("utf-8")).digest()).decode() + "'"
            for s in scripts]


def policy(html):
    return "; ".join([
        "default-src 'none'",
        "script-src " + " ".join(script_hashes(html) + [SCRIPT_CDN]),
        "style-src 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "base-uri 'none'",
        "form-action 'none'",
        "object-src 'none'",
    ])


def with_security_meta(html):
    if "Content-Security-Policy" in html:
        raise ValueError("page already has a Content-Security-Policy")
    head = html.find("<head>")
    if head < 0 or head > html.find("</head>"):
        raise ValueError("no <head> found")
    meta = (f'\n<meta http-equiv="Content-Security-Policy" content="{policy(html)}">'
            '\n<meta name="referrer" content="no-referrer">')
    # After the charset tag, which browsers look for in the first 1024 bytes.
    charset = html.find('<meta charset="utf-8">', head)
    at = charset + len('<meta charset="utf-8">') if 0 <= charset < html.find("</head>") else head + len("<head>")
    return html[:at] + meta + html[at:]


def build(out_dir, source=SOURCE):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    html = (source / "index.html").read_text(encoding="utf-8")
    (out / "index.html").write_text(with_security_meta(html), encoding="utf-8")
    for name in FILES[1:]:
        shutil.copyfile(source / name, out / name)
    return sorted(p.name for p in out.iterdir())


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Usage: python3 scripts/pages_site.py OUTPUT_DIR")
    print("Built:", ", ".join(build(sys.argv[1])))
