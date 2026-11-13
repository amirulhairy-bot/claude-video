"""Azzuha lanyard artwork generator (v2). All units in mm.

Strand frame: 25 wide (u) x 500 long (v); v=0 is the back of the neck (fold), v=500 is the hook end.
Flat strip 1000 x 25: right half = strand rotated -90 (neck at x=500), left half = strand rotated +90.
"""
import math, random, re, os

W_STRIP, H = 1000.0, 25.0
HALF = 500.0
TILE = 80.0                         # pattern repeat along the strand

P = dict(bg="#788340", bg_dark="#636E2E",
         navy="#2B3463", navy2="#4A5C8F", white="#F4EFE0", white_s="#7F98BA", yellow="#E9CB8E",
         blue="#A8C0DD", blue_s="#6F8CB5", peach="#EDB48C", peach_d="#C9835C", peach_l="#F3CFA8",
         cream="#E6DCB4", panel="#FBF7EC", leather="#7E9435")

LOGO_W, LOGO_H = 288.0, 179.0
_logo = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logo.svg')).read()
LOGO_PATHS = "".join(re.findall(r'<path[^>]*/>', _logo))

# feature placement (strand frame)
FEAT_V = 215.0      # start of flag / logo block, mm from the neck fold (chest level)


def logo(x, y, h):
    s = h / LOGO_H
    return f'<g transform="translate({x:.3f},{y:.3f}) scale({s:.5f})">{LOGO_PATHS}</g>', LOGO_W * s


def petal(l, w):
    return f'M0,0 C{-w:.2f},{-l*0.3:.2f} {-w:.2f},{-l:.2f} 0,{-l:.2f} C{w:.2f},{-l:.2f} {w:.2f},{-l*0.3:.2f} 0,0Z'


def flower(n, l, w, fill, stroke=None, sw=0.14, rot0=0):
    d = petal(l, w)
    st = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ''
    return "".join(f'<path d="{d}" transform="rotate({rot0 + 360/n*i:.1f})" fill="{fill}"{st}/>' for i in range(n))


def leaf(L, wd, fill, stroke=None, curve=0.25):
    st = f' stroke="{stroke}" stroke-width="0.12"' if stroke else ''
    return (f'<path d="M0,0 C{L*0.3:.2f},{-L*wd:.2f} {L*0.75:.2f},{-L*(wd-curve*0.5):.2f} {L:.2f},{-L*curve:.2f} '
            f'C{L*0.7:.2f},{L*(wd*0.6-curve):.2f} {L*0.3:.2f},{L*wd*0.7:.2f} 0,0Z" fill="{fill}"{st}/>')


def defs(ns=""):
    p = P
    g = {
        "fN": flower(6, 2.4, 1.35, p["navy"]) + flower(6, 1.35, 0.7, p["navy2"], rot0=30)
              + f'<circle r="0.85" fill="{p["peach"]}"/><circle r="0.35" fill="{p["navy"]}"/>',
        "fW": flower(6, 2.2, 1.15, p["white"], p["white_s"]) + f'<circle r="0.75" fill="{p["yellow"]}"/>'
              + "".join(f'<circle cx="{0.42*math.cos(a):.2f}" cy="{0.42*math.sin(a):.2f}" r="0.12" fill="{p["navy"]}"/>'
                        for a in [i*math.pi/3 for i in range(6)]),
        "fB": flower(5, 1.55, 0.9, p["blue"], p["blue_s"], 0.1) + f'<circle r="0.45" fill="{p["white"]}"/>',
        "fP": flower(5, 1.3, 0.8, p["peach"], p["peach_d"], 0.08) + f'<circle r="0.35" fill="{p["peach_d"]}"/>',
        "st": flower(4, 1.9, 0.7, p["peach_l"], p["peach_d"], 0.1, rot0=45) + f'<circle r="0.4" fill="{p["white"]}"/>',
        # acanthus / tulip spray
        "sp": (f'<path d="M0,0 C-0.6,-1.2 -0.9,-2.6 0,-3.8 C0.9,-2.6 0.6,-1.2 0,0Z" fill="{p["peach_l"]}" stroke="{p["peach_d"]}" stroke-width="0.12"/>'
               f'<path d="M0,0 C-1.2,-0.6 -2.6,-1.2 -2.8,-2.9 C-1.4,-2.4 -0.6,-1.4 0,0Z" fill="{p["peach"]}" stroke="{p["peach_d"]}" stroke-width="0.12"/>'
               f'<path d="M0,0 C1.2,-0.6 2.6,-1.2 2.8,-2.9 C1.4,-2.4 0.6,-1.4 0,0Z" fill="{p["peach"]}" stroke="{p["peach_d"]}" stroke-width="0.12"/>'
               f'<path d="M0,0.1 L0,1.6" stroke="{p["cream"]}" stroke-width="0.25"/>'),
        # chintz-style acanthus spray: curled multi-lobed peach leaf with darker vein
        "ac": (f'<path d="M0,0 C0.6,-1.4 0.2,-3.0 -0.8,-4.2 C-0.2,-3.9 0.6,-3.6 0.9,-3.0 C1.1,-3.8 1.8,-4.4 2.6,-4.6 '
               f'C2.0,-3.8 1.9,-3.1 2.1,-2.4 C2.7,-2.9 3.5,-3.0 4.2,-2.8 C3.2,-2.0 2.2,-1.0 1.4,-0.2 C1.0,0.2 0.4,0.3 0,0Z" '
               f'fill="{p["peach"]}" stroke="{p["peach_d"]}" stroke-width="0.12"/>'
               f'<path d="M0.2,-0.2 C0.9,-1.2 1.3,-2.2 1.2,-3.2 M0.6,-0.6 C1.6,-1.2 2.4,-1.8 3.2,-2.4" fill="none" stroke="{p["peach_d"]}" stroke-width="0.14"/>'),
        # tulip bud
        "tu": (f'<path d="M0,0 C-1.1,-0.6 -1.3,-2.2 -0.6,-3.2 C-0.3,-2.5 0,-2.4 0,-3.4 C0,-2.4 0.3,-2.5 0.6,-3.2 C1.3,-2.2 1.1,-0.6 0,0Z" '
               f'fill="{p["peach_l"]}" stroke="{p["peach_d"]}" stroke-width="0.12"/>'
               f'<path d="M0,0 C-0.9,0.1 -1.6,-0.5 -1.9,-1.3 M0,0 C0.9,0.1 1.6,-0.5 1.9,-1.3" fill="none" stroke="{p["navy"]}" stroke-width="0.18"/>'),
        # 5-petal navy blossom with peach heart
        "f5": flower(5, 2.0, 1.2, p["navy"]) + f'<circle r="0.75" fill="{p["peach"]}"/><circle r="0.3" fill="{p["navy"]}"/>',
        "lN": leaf(2.6, 0.32, p["navy"]),
        "lB": leaf(2.3, 0.3, p["blue"], p["blue_s"]),
        "lP": leaf(2.4, 0.34, p["peach"], p["peach_d"]),
        "lC": leaf(1.7, 0.3, p["cream"]),
        "lD": leaf(2.6, 0.3, p["bg_dark"]),
        "dt": f'<circle r="0.4" fill="{p["peach"]}"/><circle cx="0.9" cy="0.4" r="0.28" fill="{p["white"]}"/><circle cx="-0.5" cy="0.85" r="0.28" fill="{p["blue"]}"/>',
    }
    return "".join(f'<g id="{ns}{k}">{v}</g>' for k, v in g.items())


def tile(ns="", seed=11):
    """One tile in strand frame: u in [0,25], v in [0,TILE), seamless in v."""
    rnd = random.Random(seed)
    U0, U1 = -1.0, 26.0

    def vd(a, b):
        d = abs(a - b) % TILE
        return min(d, TILE - d)

    major = []
    tries = 0
    while tries < 6000:
        tries += 1
        u, v = rnd.uniform(U0, U1), rnd.uniform(0, TILE)
        if all(math.hypot(u - pu, vd(v, pv)) > 3.9 for pu, pv, _, _ in major):
            major.append((u, v, rnd.choices(["fW", "f5", "fB", "ac", "fN"], [5, 2, 3, 5, 1])[0], rnd.uniform(0.6, 0.85)))
    minor = []
    tries = 0
    while tries < 8000:
        tries += 1
        u, v = rnd.uniform(U0, U1), rnd.uniform(0, TILE)
        if all(math.hypot(u - pu, vd(v, pv)) > 2.6 for pu, pv, _, _ in major) and \
           all(math.hypot(u - pu, vd(v, pv)) > 2.0 for pu, pv, _, _, _ in minor):
            minor.append((u, v, rnd.choices(["ac", "tu", "lN", "lB", "lP", "fB", "dt", "lD", "sp"],
                                            [4, 3, 2, 3, 3, 2, 1, 1, 2])[0], rnd.uniform(0, 360), rnd.uniform(0.5, 0.75)))
    # stems
    stems = []
    for u, v, _, _ in major:
        for _ in range(2):
            a = rnd.uniform(0, 2 * math.pi); L = rnd.uniform(3.0, 5.0)
            eu, ev = u + L * math.cos(a), v + L * math.sin(a)
            cu, cv = (u + eu) / 2 + rnd.uniform(-2, 2), (v + ev) / 2 + rnd.uniform(-2, 2)
            r = rnd.uniform(0.6, 1.1)
            stems.append(f'M{u:.2f},{v:.2f} Q{cu:.2f},{cv:.2f} {eu:.2f},{ev:.2f} q{r:.2f},{-r:.2f} {r*1.6:.2f},{r*0.2:.2f}')
    stems_b = []
    for u, v, _, _ in major[::2]:
        a = rnd.uniform(0, 2 * math.pi); L = rnd.uniform(3, 5)
        stems_b.append(f'M{u:.2f},{v:.2f} q{L*math.cos(a+0.6):.2f},{L*math.sin(a+0.6):.2f} {L*math.cos(a):.2f},{L*math.sin(a):.2f}')

    def body():
        s = [f'<path d="{" ".join(stems)}" fill="none" stroke="{P["blue_s"]}" stroke-width="0.2" stroke-linecap="round"/>',
             f'<path d="{" ".join(stems_b)}" fill="none" stroke="{P["navy"]}" stroke-width="0.18" stroke-linecap="round"/>']
        s += [f'<use href="#{ns}{k}" transform="translate({u:.2f},{v:.2f}) rotate({a:.0f}) scale({sc:.2f})"/>' for u, v, k, a, sc in minor]
        s += [f'<use href="#{ns}{k}" transform="translate({u:.2f},{v:.2f}) rotate({rnd2:.0f}) scale({sc:.2f})"/>'
              for (u, v, k, sc), rnd2 in zip(major, [((i * 37) % 72) for i in range(len(major))])]
        return "".join(s)
    b = body()
    return "".join(f'<g transform="translate(0,{off})">{b}</g>' for off in (-TILE, 0, TILE))


# --- flag + logo block (style of the original Azzuha lanyard) ---
FLAG_W = 21.0                 # across the strap (flag's horizontal)
FLAG_LEN = FLAG_W / 2         # along the strap (flag height, official 1:2)
GAP = 7.0
LOGO_ACROSS = 15.0            # logo height, laid across the strap
_mk = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logo_mark.svg')).read()
_vb = [float(x) for x in re.search(r'viewBox="([^"]+)"', _mk).group(1).split()]
_mk_d = "".join(re.findall(r' d="([^"]+)"', _mk))
PANEL_LEN = LOGO_ACROSS * _vb[2] / _vb[3]   # logo length along the strap
BLOCK_LEN = FLAG_LEN + GAP + PANEL_LEN


def jalur_gemilang(x, y, w):
    """Official-proportion Jalur Gemilang (1:2), upright, top-left (x,y), width w."""
    h = w / 2; s = h / 14
    o = [f'<g transform="translate({x:.3f},{y:.3f})">',
         f'<rect x="-0.5" y="-0.5" width="{w+1:.3f}" height="{h+1:.3f}" fill="#FFFFFF"/>']
    for i in range(14):
        o.append(f'<rect y="{i*s:.4f}" width="{w:.4f}" height="{s+0.02:.4f}" fill="{"#CC0001" if i % 2 == 0 else "#FFFFFF"}"/>')
    cw, ch = w / 2, 8 * s
    o.append(f'<rect width="{cw:.4f}" height="{ch:.4f}" fill="#010066"/>')
    u = ch / 8
    cx, cy = 3.2 * u * cw / ch * 1.0 + 0.9 * u, ch / 2
    o.append(f'<circle cx="{cx:.4f}" cy="{cy:.4f}" r="{3.0*u:.4f}" fill="#FFCC00"/>')
    o.append(f'<circle cx="{cx+0.75*u:.4f}" cy="{cy:.4f}" r="{2.55*u:.4f}" fill="#010066"/>')
    sx = cx + 4.9 * u
    pts = []
    for i in range(28):
        a_ = -math.pi / 2 + i * math.pi / 14
        rr = 2.35 * u if i % 2 == 0 else 1.0 * u
        pts.append(f"{sx + rr*math.cos(a_):.4f},{cy + rr*math.sin(a_):.4f}")
    o.append(f'<polygon points="{" ".join(pts)}" fill="#FFCC00"/></g>')
    return "".join(o)


def white_logo(cx, cy, rot):
    """Azzuha mark (no tagline) in full white, laid along the strap, with a plain-olive knockout so the
    busy floral pattern does not cut into it."""
    sc = LOGO_ACROSS / _vb[3]
    tf = f'translate({cx:.3f},{cy:.3f}) rotate({rot}) scale({sc:.5f}) translate({-_vb[0]-_vb[2]/2:.2f},{-_vb[1]-_vb[3]/2:.2f})'
    L, A = PANEL_LEN + 4.0, LOGO_ACROSS + 3.0
    return (f'<rect x="{cx-A/2:.3f}" y="{cy-L/2:.3f}" width="{A:.3f}" height="{L:.3f}" rx="2.5" fill="{P["bg"]}"/>'
            f'<path transform="{tf}" d="{_mk_d}" fill="#FFFFFF"/>')


def feature_block(y0, sign):
    """Full Jalur Gemilang then the white Azzuha logo running along the strap.
    sign=+1: viewer-left strap (logo reads top->bottom), -1: viewer-right strap (reads bottom->top)."""
    o = [jalur_gemilang((25 - FLAG_W) / 2, y0, FLAG_W)]
    o.append(white_logo(12.5, y0 + FLAG_LEN + GAP + PANEL_LEN / 2, 90 if sign > 0 else -90))
    return "".join(o)


def strand(kind, ns=""):
    """kind: 'L' | 'R' | 'plain'. Strand art, u -3..28, v 0..503."""
    o = [f'<rect x="-3" y="-3" width="31" height="509" fill="{P["bg"]}"/>']
    for i in range(int(503 // TILE) + 1):
        o.append(f'<use href="#{ns}tile" y="{i*TILE}"/>')
    if kind in ("L", "R"):
        o.append(feature_block(FEAT_V, 1 if kind == "L" else -1))
    return "".join(o)


def doc_defs(ns=""):
    """Everything referenced: motifs, tile, three strand variants."""
    return (f'<defs>{defs(ns)}<g id="{ns}tile">{tile(ns)}</g>'
            f'<clipPath id="{ns}sc"><rect x="-3" y="0" width="31" height="506"/></clipPath>'
            + "".join(f'<g id="{ns}s_{k}"><g clip-path="url(#{ns}sc)">{strand(k, ns)}</g></g>' for k in ("L", "R", "plain"))
            + '</defs>')


def strip(side="front", ns="", bleed=0.0):
    """Flat 1000 x 25 strip (origin at finished top-left). front: left half = viewer-left strap, right half = viewer-right strap (both flag + logo)."""
    L, R = ("L", "R") if side == "front" else ("plain", "plain")
    cid = f"{ns}{side}clip{int(bleed*10)}"
    return (f'<defs><clipPath id="{cid}L"><rect x="{-bleed}" y="{-bleed}" width="{HALF+bleed}" height="{H+2*bleed}"/></clipPath>'
            f'<clipPath id="{cid}R"><rect x="{HALF}" y="{-bleed}" width="{HALF+bleed}" height="{H+2*bleed}"/></clipPath></defs>'
            f'<g clip-path="url(#{cid}R)"><use href="#{ns}s_{R}" transform="translate({HALF},{H}) rotate(-90)"/></g>'
            f'<g clip-path="url(#{cid}L)"><use href="#{ns}s_{L}" transform="translate({HALF},0) rotate(90)"/></g>')
