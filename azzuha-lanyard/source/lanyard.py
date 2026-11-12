"""Azzuha lanyard artwork generator. All units in mm unless noted."""
import math, random, re

W_STRIP, H = 1000.0, 25.0          # finished size
HALF = W_STRIP / 2
TILE = 50.0                         # pattern repeat along strip

PALETTES = {
    "A": dict(name="Hijau Zaitun Floral", bg="#6F7C34", bg2="#66732F", vine="#E4D9B0", vine2="#2E3A66",
              f_white="#F6F0DE", f_white_s="#A9BCD3", f_navy="#2C3866", f_blue="#9DB7D8",
              center_peach="#EDB98F", leaf_peach="#E9B68D", leaf_blue="#86A3CB", panel="#FFFDF5",
              trim="#D9C489"),
    "B": dict(name="Hijau Zamrud Floral", bg="#2F4A2E", bg2="#2A4329", vine="#E4D9B0", vine2="#9DB7D8",
              f_white="#F6F0DE", f_white_s="#A9BCD3", f_navy="#E9B68D", f_blue="#9DB7D8",
              center_peach="#2C3866", leaf_peach="#8DB04F", leaf_blue="#86A3CB", panel="#FFFDF5",
              trim="#D9C489"),
}

LOGO_W, LOGO_H = 288.0, 179.0
_logo = open(__file__.rsplit('/', 1)[0] + '/logo.svg').read()
LOGO_PATHS = "".join(re.findall(r'<path[^>]*/>', _logo))


def logo(x, y, h):
    """Azzuha logo, top-left at (x,y), height h mm. Returns (svg, width)."""
    s = h / LOGO_H
    return f'<g transform="translate({x:.3f},{y:.3f}) scale({s:.5f})">{LOGO_PATHS}</g>', LOGO_W * s


def petal_flower(n, r, fill, stroke, center, cdot=None, pr=0.55):
    out = []
    for i in range(n):
        a = 360 / n * i
        out.append(f'<ellipse cx="0" cy="{-r*0.55:.3f}" rx="{r*pr*0.62:.3f}" ry="{r*0.55:.3f}" '
                   f'transform="rotate({a:.1f})" fill="{fill}"'
                   + (f' stroke="{stroke}" stroke-width="0.12"' if stroke else '') + '/>')
    out.append(f'<circle r="{r*0.26:.3f}" fill="{center}"/>')
    if cdot:
        out.append(f'<circle r="{r*0.11:.3f}" fill="{cdot}"/>')
    return "".join(out)


def leaf(L, fill):
    return (f'<path d="M0,0 C{L*0.35:.2f},{-L*0.32:.2f} {L*0.8:.2f},{-L*0.22:.2f} {L:.2f},0 '
            f'C{L*0.8:.2f},{L*0.22:.2f} {L*0.35:.2f},{L*0.32:.2f} 0,0Z" fill="{fill}"/>')


def defs(p):
    return f'''
<g id="fW">{petal_flower(5, 2.1, p["f_white"], p["f_white_s"], p["f_navy"], p["center_peach"])}</g>
<g id="fN">{petal_flower(6, 1.9, p["f_navy"], None, p["center_peach"])}</g>
<g id="fB">{petal_flower(5, 1.5, p["f_blue"], None, p["f_white"])}</g>
<g id="fS">{petal_flower(5, 0.9, p["f_white"], None, p["center_peach"])}</g>
<g id="lP">{leaf(2.6, p["leaf_peach"])}</g>
<g id="lB">{leaf(2.0, p["leaf_blue"])}</g>
<g id="lW">{leaf(1.6, p["f_white"])}</g>
<g id="lN">{leaf(1.8, p["f_navy"])}</g>
<g id="dot"><circle r="0.45" fill="{p["center_peach"]}"/><circle cx="0.9" cy="0.5" r="0.3" fill="{p["f_white"]}"/><circle cx="-0.6" cy="0.8" r="0.3" fill="{p["f_white"]}"/></g>
'''


def tile(p, seed=7):
    """One seamless (in x) tile, TILE x H, returned as svg string (may overflow edges, wraps in x)."""
    rnd = random.Random(seed)
    # poisson-ish placement of flowers
    pts = []
    tries = 0
    while len(pts) < 24 and tries < 4000:
        tries += 1
        x, y = rnd.uniform(0, TILE), rnd.uniform(1.5, H - 1.5)
        ok = True
        for (px, py, _) in pts:
            dx = min(abs(x - px), TILE - abs(x - px))
            if dx * dx + (y - py) ** 2 < 5.6 ** 2:
                ok = False; break
        if ok:
            pts.append((x, y, rnd.choice(["fW", "fW", "fN", "fB", "fB", "fW"])))
    els_vine, els_leaf, els_fl = [], [], []
    # vines: connect each flower to its nearest neighbour with a curl
    for i, (x, y, k) in enumerate(pts):
        best = None
        for j, (qx, qy, _) in enumerate(pts):
            if j == i: continue
            dx = qx - x
            if dx > TILE / 2: dx -= TILE
            if dx < -TILE / 2: dx += TILE
            d = math.hypot(dx, qy - y)
            if best is None or d < best[0]: best = (d, dx, qy - y)
        _, dx, dy = best
        bend = rnd.uniform(-0.6, 0.6)
        mx, my = x + dx / 2 - dy * bend, y + dy / 2 + dx * bend
        els_vine.append(f'M{x:.2f},{y:.2f} Q{mx:.2f},{my:.2f} {x+dx:.2f},{y+dy:.2f}')
        # small curl + leaves along the vine
        for t in (0.25, 0.5, 0.75):
            lx = (1 - t) ** 2 * x + 2 * (1 - t) * t * mx + t * t * (x + dx)
            ly = (1 - t) ** 2 * y + 2 * (1 - t) * t * my + t * t * (y + dy)
            ang = rnd.uniform(0, 360)
            els_leaf.append((lx, ly, rnd.choice(["lP", "lP", "lB", "lW", "lN"]), ang))
        cx, cy = mx + rnd.uniform(-2, 2), my + rnd.uniform(-2, 2)
        r = rnd.uniform(0.9, 1.5)
        els_vine.append(f'M{mx:.2f},{my:.2f} q{r:.2f},{-r*1.4:.2f} {r*2:.2f},0 t{-r*0.9:.2f},{r*0.8:.2f}')
    for (x, y, k) in pts:
        els_fl.append((x, y, k, rnd.uniform(0, 72)))
    # tiny filler dots / small flowers
    for _ in range(26):
        x, y = rnd.uniform(0, TILE), rnd.uniform(1, H - 1)
        els_fl.append((x, y, rnd.choice(["fS", "fS", "lW", "lP", "dot"]), rnd.uniform(0, 360)))

    def wrap(fn):
        out = []
        for off in (-TILE, 0, TILE):
            out.append(f'<g transform="translate({off},0)">{fn()}</g>')
        return "".join(out)

    vines = lambda: (f'<path d="{" ".join(els_vine)}" fill="none" stroke="{p["vine"]}" stroke-width="0.32" '
                     f'stroke-linecap="round" opacity="0.9"/>')
    leaves = lambda: "".join(f'<use href="#{k}" transform="translate({x:.2f},{y:.2f}) rotate({a:.0f})"/>'
                             for x, y, k, a in els_leaf)
    flowers = lambda: "".join(f'<use href="#{k}" transform="translate({x:.2f},{y:.2f}) rotate({a:.0f})"/>'
                              for x, y, k, a in els_fl)
    return wrap(vines) + wrap(leaves) + wrap(flowers)


def flag(x, y, w):
    """Jalur Gemilang, 1:2, top-left (x,y), width w."""
    h = w / 2
    s = h / 14.0  # stripe unit
    o = [f'<g transform="translate({x:.3f},{y:.3f})">']
    for i in range(14):
        o.append(f'<rect x="0" y="{i*s:.4f}" width="{w:.4f}" height="{s+0.02:.4f}" fill="{"#CC0001" if i%2==0 else "#FFFFFF"}"/>')
    cw, ch = w / 2, 8 * s
    o.append(f'<rect width="{cw:.4f}" height="{ch:.4f}" fill="#010066"/>')
    u = ch / 8  # canton unit (canton = 14 x 8 units horizontally scaled)
    ux = cw / 14
    # crescent
    cx, cy = 5.6 * ux, 4 * u
    R = 3.0 * u; r = 2.6 * u
    o.append(f'<mask id="cm{x:.0f}{y:.0f}"><rect width="{cw}" height="{ch}" fill="#fff"/>'
             f'<circle cx="{cx + 0.75*u:.4f}" cy="{cy:.4f}" r="{r:.4f}" fill="#000"/></mask>')
    o.append(f'<circle cx="{cx:.4f}" cy="{cy:.4f}" r="{R:.4f}" fill="#FFCC00" mask="url(#cm{x:.0f}{y:.0f})"/>')
    # 14-point star
    sx, sy = cx + 4.9 * u, cy
    Ro, Ri = 2.35 * u, 1.05 * u
    pts = []
    for i in range(28):
        a = -math.pi / 2 + i * math.pi / 14
        rr = Ro if i % 2 == 0 else Ri
        pts.append(f"{sx + rr*math.cos(a):.4f},{sy + rr*math.sin(a):.4f}")
    o.append(f'<polygon points="{" ".join(pts)}" fill="#FFCC00"/>')
    o.append('</g>')
    return "".join(o)


# --- layout of one half, neck (x=0) -> hook end (x=500), flag top edge at y=0 ---
FLAG_X, FLAG_W = 175.0, 50.0
PANEL_X, PANEL_W = 236.0, 50.0


def half_front(p, uid):
    o = [f'<rect x="0" y="-6" width="{HALF+6}" height="{H+12}" fill="{p["bg"]}"/>']
    for i in range(int(HALF // TILE) + 1):
        o.append(f'<use href="#tile{uid}" x="{i*TILE}"/>')
    # flag block with trim
    tr = p["trim"]
    o.append(f'<rect x="{FLAG_X-1.2}" y="0" width="{FLAG_W+2.4}" height="{H}" fill="{tr}"/>')
    o.append(flag(FLAG_X, 0, FLAG_W))
    # logo panel
    o.append(f'<rect x="{PANEL_X}" y="1.6" width="{PANEL_W}" height="{H-3.2}" rx="2.2" fill="{p["panel"]}" '
             f'stroke="{tr}" stroke-width="0.7"/>')
    lh = 17.5
    lg, lw = logo(0, 0, lh)
    o.append(f'<g transform="translate({PANEL_X + (PANEL_W-lw)/2:.3f},{(H-lh)/2 + 0.2:.3f})">{lg}</g>')
    return "".join(o)


def half_back(p, uid):
    o = [f'<rect x="0" y="-6" width="{HALF+6}" height="{H+12}" fill="{p["bg"]}"/>']
    for i in range(int(HALF // TILE) + 1):
        o.append(f'<use href="#tile{uid}" x="{i*TILE}"/>')
    return "".join(o)


def strip(p, side="front", uid="A", bleed=0.0):
    """Full 1000 x 25 strip group. Origin at top-left of finished size. Right half = artwork as designed,
    left half = rotated 180 so both arms read the same way when hanging."""
    hf = half_front if side == "front" else half_back
    hid = f"half{side}{uid}"
    cid = f"clip{side}{uid}"
    return f'''<defs><clipPath id="{cid}"><rect x="{-bleed}" y="{-bleed}" width="{W_STRIP+2*bleed}" height="{H+2*bleed}"/></clipPath>
<clipPath id="h{cid}"><rect x="0" y="-6" width="{HALF+6}" height="{H+12}"/></clipPath>
<g id="{hid}"><g clip-path="url(#h{cid})">{hf(p, uid)}</g></g></defs>
<g clip-path="url(#{cid})">
<rect x="{-bleed-1}" y="{-bleed-1}" width="{W_STRIP+2*bleed+2}" height="{H+2*bleed+2}" fill="{p["bg"]}"/>
<use href="#{hid}" x="{HALF}"/>
<use href="#{hid}" transform="rotate(180 {HALF/2} {H/2})"/>
</g>'''


def shared_defs(p, uid):
    """defs needed once per document per palette"""
    return f'<defs>{defs_ns(p, uid)}<g id="tile{uid}">{tile_ns(p, uid)}</g></defs>'


def defs_ns(p, uid):
    return defs(p).replace('id="', f'id="{uid}_')


def tile_ns(p, uid):
    return tile(p).replace('href="#', f'href="#{uid}_')


def strand_vertical(uid, side="front"):
    """Return svg <use> of the right half rotated so neck is at top, hook end at bottom (25 wide x 500 tall)."""
    return f'<use href="#half{side}{uid}" transform="translate(25,0) rotate(90)"/>'
