"""Azzuha lanyard artwork generator (v2). All units in mm.

Strand frame: 25 wide (u) x 500 long (v); v=0 is the back of the neck (fold), v=500 is the hook end.
Flat strip 1000 x 25: right half = strand rotated -90 (neck at x=500), left half = strand rotated +90.
"""
import math, random, re, os

W_STRIP, H = 1000.0, 25.0
HALF = 500.0
TILE = 80.0                         # pattern repeat along the strand

P = dict(bg="#74833A", bg_dark="#5F6D2C",
         navy="#2B3463", navy2="#4A5C8F", white="#F4EFE0", white_s="#7F98BA", yellow="#E9CB8E",
         blue="#A8C0DD", blue_s="#6F8CB5", peach="#EDB48C", peach_d="#C9835C", peach_l="#F3CFA8",
         cream="#E6DCB4", panel="#FBF7EC", leather="#7E9435")

LOGO_W, LOGO_H = 288.0, 179.0
_logo = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logo.svg')).read()
LOGO_PATHS = "".join(re.findall(r'<path[^>]*/>', _logo))

# feature placement (strand frame)
FEAT_V = 140.0      # start of flag / logo block, mm from the neck fold
FLAG_LEN = 41.0


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
        if all(math.hypot(u - pu, vd(v, pv)) > 4.6 for pu, pv, _, _ in major):
            major.append((u, v, rnd.choices(["fW", "fN", "fB", "fP"], [5, 2, 4, 1])[0], rnd.uniform(0.68, 0.95)))
    minor = []
    tries = 0
    while tries < 8000:
        tries += 1
        u, v = rnd.uniform(U0, U1), rnd.uniform(0, TILE)
        if all(math.hypot(u - pu, vd(v, pv)) > 3.0 for pu, pv, _, _ in major) and \
           all(math.hypot(u - pu, vd(v, pv)) > 2.4 for pu, pv, _, _, _ in minor):
            minor.append((u, v, rnd.choices(["sp", "lN", "lB", "lP", "lC", "st", "fB", "dt", "lD"],
                                            [4, 2, 3, 3, 2, 2, 2, 1, 2])[0], rnd.uniform(0, 360), rnd.uniform(0.7, 1.0)))
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
    for u, v, _, _ in major[::3]:
        a = rnd.uniform(0, 2 * math.pi); L = rnd.uniform(3, 5)
        stems_b.append(f'M{u:.2f},{v:.2f} q{L*math.cos(a+0.6):.2f},{L*math.sin(a+0.6):.2f} {L*math.cos(a):.2f},{L*math.sin(a):.2f}')

    def body():
        s = [f'<path d="{" ".join(stems)}" fill="none" stroke="{P["cream"]}" stroke-width="0.3" stroke-linecap="round"/>',
             f'<path d="{" ".join(stems_b)}" fill="none" stroke="{P["blue_s"]}" stroke-width="0.25" stroke-linecap="round"/>']
        s += [f'<use href="#{ns}{k}" transform="translate({u:.2f},{v:.2f}) rotate({a:.0f}) scale({sc:.2f})"/>' for u, v, k, a, sc in minor]
        s += [f'<use href="#{ns}{k}" transform="translate({u:.2f},{v:.2f}) rotate({rnd2:.0f}) scale({sc:.2f})"/>'
              for (u, v, k, sc), rnd2 in zip(major, [((i * 37) % 72) for i in range(len(major))])]
        return "".join(s)
    b = body()
    return "".join(f'<g transform="translate(0,{off})">{b}</g>' for off in (-TILE, 0, TILE))


SLANT_DEG = 15.0    # stripes tilted so they read level when the strap hangs at an angle (as reference photo)
PANEL_LEN = 26.0


def _band(a, b, sign, fill):
    """band between two slanted lines (offsets a<b measured along the strap centre)."""
    t = math.tan(math.radians(SLANT_DEG)) * sign
    yl = lambda off, u: off + t * (u - 12.5)
    return (f'<polygon fill="{fill}" points="-3,{yl(a,-3):.3f} 28,{yl(a,28):.3f} 28,{yl(b,28)+0.03:.3f} -3,{yl(b,-3)+0.03:.3f}"/>')


def feature_block(y0, sign):
    """Flag (blue canton with crescent & star, red/white stripes) followed directly by the Azzuha logo panel.
    sign=+1 for the strap that hangs on the wearer's right (viewer's left), -1 for the other."""
    o = []
    ch = 20.0
    o.append(_band(y0, y0 + ch, sign, "#010066"))
    stripes = ["#CC0001", "#FFFFFF"] * 3
    sh = (FLAG_LEN - ch) / len(stripes)
    for i, c in enumerate(stripes):
        o.append(_band(y0 + ch + i * sh, y0 + ch + (i + 1) * sh, sign, c))
    cx, cy = 8.0, y0 + ch / 2 + math.tan(math.radians(SLANT_DEG)) * sign * (8.0 - 12.5)
    sx = 18.6
    sy = y0 + ch / 2 + math.tan(math.radians(SLANT_DEG)) * sign * (sx - 12.5)
    o.append(f'<circle cx="{cx}" cy="{cy:.3f}" r="6.0" fill="#FFCC00"/>')
    o.append(f'<circle cx="{cx+1.45}" cy="{cy:.3f}" r="5.1" fill="#010066"/>')
    pts = []
    for i in range(28):
        a_ = -math.pi / 2 + i * math.pi / 14
        rr = 4.5 if i % 2 == 0 else 1.9
        pts.append(f"{sx + rr*math.cos(a_):.3f},{sy + rr*math.sin(a_):.3f}")
    o.append(f'<polygon points="{" ".join(pts)}" fill="#FFCC00"/>')
    # logo panel directly under the flag
    p0 = y0 + FLAG_LEN
    o.append(_band(p0, p0 + PANEL_LEN, sign, P["panel"]))
    o.append(_band(p0 + PANEL_LEN - 0.8, p0 + PANEL_LEN, sign, P["peach"]))
    lw = 21.0
    lh = lw * LOGO_H / LOGO_W
    lg, _ = logo(0, 0, lh)
    o.append(f'<g transform="translate({(25-lw)/2:.3f},{p0 + (PANEL_LEN-lh)/2:.3f})">{lg}</g>')
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
