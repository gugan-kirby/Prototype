"""Run browser tests. Each test_*.py file defines test_* functions taking (page, base).

Usage: run.py [file-name-fragment]
A fresh browser context is used per test, so localStorage starts empty.
"""
import functools
import http.server
import importlib.util
import pathlib
import sys
import threading
import traceback

from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass

    handler = functools.partial(Quiet, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return f"http://127.0.0.1:{server.server_address[1]}"


def load(path):
    spec = importlib.util.spec_from_file_location(path.stem, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main():
    fragment = sys.argv[1] if len(sys.argv) > 1 else ""
    base = serve()
    passed, failed = 0, 0
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for path in sorted(HERE.glob("test_*.py")):
            if fragment not in path.name:
                continue
            module = load(path)
            for name in sorted(n for n in dir(module) if n.startswith("test_")):
                context = browser.new_context(viewport={"width": 426, "height": 923})
                page = context.new_page()
                errors = []
                page.on("pageerror", lambda e: errors.append(str(e)))
                page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
                try:
                    getattr(module, name)(page, base)
                    assert not errors, f"browser errors: {errors}"
                    passed += 1
                    print(f"  ok    {path.stem}.{name}")
                except Exception:
                    failed += 1
                    print(f"  FAIL  {path.stem}.{name}")
                    traceback.print_exc()
                context.close()
        browser.close()
    print(f"{passed} passed, {failed} failed")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
