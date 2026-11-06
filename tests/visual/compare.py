"""Compare app screens with their reference images.

Usage: compare.py [screen-id ...]
Writes a side-by-side image and a heat map to tests/visual/output/ and prints the
share of pixels that differ visibly from the reference.
"""
import functools
import http.server
import pathlib
import sys
import threading

from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
REFS = ROOT / "Image "
OUT = pathlib.Path(__file__).parent / "output"
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from screens import SCREENS  # noqa: E402

THRESHOLD = 40


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass

    class Server(http.server.ThreadingHTTPServer):
        request_queue_size = 128

    handler = functools.partial(Quiet, directory=str(ROOT))
    server = Server(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server.server_address[1]


def compare(page, base, screen):
    width, height = screen.get("size", (426, 923))
    page.set_viewport_size({"width": width, "height": height})
    page.goto(f"{base}/index.html#/")
    page.evaluate("localStorage.clear()")
    for key, value in screen.get("session", {}).items():
        page.evaluate("([k, v]) => localStorage.setItem(k, v)", [key, value])
    if screen.get("before"):
        page.evaluate("d => sessionStorage.setItem('jobwork.enquiryDraft', JSON.stringify(d))", screen["before"])
    page.goto(f"{base}/index.html#{screen['route']}")
    page.reload()
    page.wait_for_selector(screen.get("ready", "#screen > *:not(.state)"))
    page.wait_for_timeout(350)
    if screen.get("act"):
        screen["act"](page)
        page.wait_for_timeout(300)
    shot = OUT / f"{screen['id']}.app.png"
    page.screenshot(path=str(shot))

    reference = Image.open(REFS / screen["ref"]).convert("RGB")
    actual = Image.open(shot).convert("RGB").resize(reference.size)
    diff = ImageChops.difference(reference, actual).convert("L")
    visible = diff.point(lambda v: 255 if v > THRESHOLD else 0)
    score = visible.histogram()[255] / (reference.width * reference.height)

    sheet = Image.new("RGB", (reference.width * 3 + 40, reference.height), "white")
    sheet.paste(reference, (0, 0))
    sheet.paste(actual, (reference.width + 20, 0))
    sheet.paste(visible.convert("RGB"), (reference.width * 2 + 40, 0))
    sheet.save(OUT / f"{screen['id']}.compare.png")
    return score


def main():
    OUT.mkdir(exist_ok=True)
    wanted = sys.argv[1:]
    chosen = [s for s in SCREENS if not wanted or s["id"] in wanted]
    port = serve()
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(device_scale_factor=2)
        for screen in chosen:
            print(f"{screen['id']:<14} {compare(page, f'http://127.0.0.1:{port}', screen) * 100:5.2f}% differs")
        browser.close()


if __name__ == "__main__":
    main()
