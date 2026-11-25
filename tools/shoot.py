# Renders the game's own screenshots in headless Chromium: serves game/ on a local port, opens
# index.html?shot=<name> for each staged moment, and saves the 1280x800 canvas as JPEG under the
# 256 KiB cap. It also plays a short keyboard + mouse session and reports console errors.
# usage: python tools/shoot.py [out_dir] [shot names...]
import http.server, threading, functools, sys, os, io
from playwright.sync_api import sync_playwright

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
GAME = os.path.join(ROOT, 'game')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'screenshots')
NAMES = sys.argv[2:] or ['cook', 'map', 'results', 'book']


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def serve():
    handler = functools.partial(Quiet, directory=GAME)
    httpd = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def save_jpeg(page, path):
    png = page.locator('#warung').screenshot(type='png')
    from PIL import Image
    img = Image.open(io.BytesIO(png)).convert('RGB')
    for q in (92, 88, 84, 80, 76, 72):
        buf = io.BytesIO()
        img.save(buf, 'JPEG', quality=q, optimize=True)
        if buf.tell() <= 250 * 1024:
            break
    with open(path, 'wb') as f:
        f.write(buf.getvalue())
    return buf.tell(), q


def main():
    os.makedirs(OUT, exist_ok=True)
    httpd = serve()
    base = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.on('pageerror', lambda e: errors.append(str(e)))
        for i, name in enumerate(NAMES):
            page.goto(f'{base}?shot={name}')
            page.wait_for_function('document.title.startsWith("shot ready")', timeout=10000)
            path = os.path.join(OUT, f'{i + 1}-{name}.jpg')
            size, q = save_jpeg(page, path)
            print(f'{path}: {size} bytes (q{q})')
        # a short real play session: open the stall, walk, click a crate, chop
        page.goto(base)
        page.wait_for_timeout(400)
        page.keyboard.press('Space')
        page.wait_for_timeout(300)
        page.keyboard.press('Space')
        page.wait_for_timeout(500)
        page.keyboard.press('Space')
        page.wait_for_timeout(400)
        for key in ['ArrowUp', 'ArrowLeft', 'ArrowLeft']:
            page.keyboard.down(key); page.wait_for_timeout(350); page.keyboard.up(key)
        page.mouse.click(20 + 3.5 * 70, 196 + 0.5 * 70)
        page.wait_for_timeout(1500)
        page.keyboard.press('Space')
        page.wait_for_timeout(5000)
        save_jpeg(page, os.path.join(OUT, '..', 'playtest-last.jpg') if OUT.endswith('screenshots') else os.path.join(OUT, 'playtest.jpg'))
        browser.close()
    httpd.shutdown()
    print('console errors:', errors if errors else 'none')


if __name__ == '__main__':
    main()
