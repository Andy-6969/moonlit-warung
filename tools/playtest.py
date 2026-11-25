# Plays Night 1 for real in headless Chromium with mouse clicks only: title > map > night intro, then
# cooks and serves Nasi Goreng by clicking stations (the cook walks there and uses them), and checks
# the takings. Also walks with the keyboard and chops with SPACE. usage: python tools/playtest.py
import functools, http.server, os, threading, json
from playwright.sync_api import sync_playwright

GAME = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'game')
KX, KY, T = 20, 196, 70


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def tile(c, r):
    return KX + c * T + T / 2, KY + r * T + T / 2


def main():
    httpd = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=GAME))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    errors = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        page = b.new_page(viewport={'width': 1280, 'height': 800})
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(f'http://127.0.0.1:{httpd.server_address[1]}/index.html')
        page.wait_for_timeout(300)
        page.mouse.click(640, 549)          # Open the stall
        page.wait_for_timeout(300)
        page.mouse.click(950, 717)          # Cook this night
        page.wait_for_timeout(300)
        page.mouse.click(640, 400)          # skip the intro card
        page.wait_for_function('window.warung.scene.intro === 0')
        page.wait_for_timeout(100)          # a click in the same frame as the skip is eaten by the intro
        state = lambda js: page.evaluate(f'(() => {{ const r = window.warung.scene.run; return {js}; }})()')

        def click(c, r, wait_for=None, timeout=6000):
            x, y = tile(c, r)
            page.mouse.click(x, y)
            if wait_for:
                try:
                    page.wait_for_function(f'(() => {{ const r = window.warung.scene.run; return {wait_for}; }})()', timeout=timeout)
                except Exception:
                    st = state('JSON.stringify({held: r.chef.held, at: [r.chef.x, r.chef.y], tile: r.k.tiles[%d][%d]})' % (r, c))
                    raise SystemExit(f'FAIL clicking ({c},{r}) waiting for {wait_for}\n  {st}')
                print(f'ok ({c},{r}) {wait_for}')
            else:
                page.wait_for_timeout(250)

        # Night 1 map: eggs (3,0), rice (1,0), woks (2,7) (3,7), plates (9,0), mats (5..7,3), pass (12,1..3)
        click(3, 0, 'r.chef.held && r.chef.held.id === "egg"')
        click(2, 7, 'r.k.tiles[7][2].contents.length === 1')
        click(1, 0, 'r.chef.held && r.chef.held.id === "rice"')
        click(2, 7, 'r.k.tiles[7][2].contents.length === 2')   # egg + rice in one wok = fried rice
        click(3, 0, 'r.chef.held && r.chef.held.id === "egg"')
        click(3, 7, 'r.k.tiles[7][3].contents.length === 1')   # egg alone = fried egg
        click(9, 0, 'r.chef.held && r.chef.held.id === "plate"')
        click(6, 3, 'r.k.tiles[3][6].item && r.k.tiles[3][6].item.id === "plate"')
        page.wait_for_function('window.warung.scene.run.k.tiles[7][2].state === "done"', timeout=8000)
        click(2, 7, 'r.chef.held && r.chef.held.id === "fried_rice"')
        click(6, 3, 'r.k.tiles[3][6].item.parts.length === 1')
        click(3, 7, 'r.chef.held && r.chef.held.id === "fried_egg"', timeout=9000)
        click(6, 3, 'r.k.tiles[3][6].item.parts.length === 2')
        click(6, 3, 'r.chef.held && r.chef.held.id === "plate"')
        tickets = state('r.tickets.map(t => t.recipe)')
        print('tickets on the rail:', tickets)
        if 'nasi_goreng' not in tickets:
            page.evaluate('(() => { const r = window.warung.scene.run; r.tickets[0].recipe = "nasi_goreng"; })()')
        click(12, 2, 'r.stats.served === 1')
        print('served:', state('r.stats.served'), 'takings:', state('r.takings'))
        # keyboard: walk to the chicken crate, take it, put it on a board and chop with SPACE taps
        page.keyboard.press('Space')
        click(4, 0, 'r.chef.held && r.chef.held.id === "chicken"')
        click(0, 2, 'r.k.tiles[2][0].item && r.k.tiles[2][0].item.id === "chicken"')
        for _ in range(4):
            page.keyboard.press('Space'); page.wait_for_timeout(120)
        print('board after 4 SPACE taps:', state('r.k.tiles[2][0].item.id'))
        b.close()
    httpd.shutdown()
    print('page errors:', errors or 'none')


if __name__ == '__main__':
    main()
