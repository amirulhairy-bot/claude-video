import sys, os, json, html
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lanyard import *

OUT = sys.argv[1]
WORK = os.path.dirname(os.path.abspath(__file__))
os.makedirs(f"{OUT}/presentation", exist_ok=True)
for o in "AB":
    os.makedirs(f"{OUT}/print/Pilihan_{o}", exist_ok=True)
jobs = []

FONT = "Inter, 'DejaVu Sans', sans-serif"


def page(svg, w, h, unit="px", bg="#fff"):
    return (f'<!doctype html><html><head><meta charset="utf-8"><style>@page{{size:{w}{unit} {h}{unit};margin:0}}'
            f'html,body{{margin:0;padding:0;background:{bg}}}svg{{display:block}}</style></head><body>{svg}</body></html>')


def write(name, content):
    path = f"{WORK}/build_{name}.html"
    open(path, "w").write(content)
    return path


def all_defs(uids=("A", "B")):
    out = []
    for u in uids:
        p = PALETTES[u]
        out.append(shared_defs(p, u))
        out.append(strip(p, "front", u))   # registers half groups (rendered offscreen; we hide via wrapper)
    return out


def defs_only(u):
    """defs of palette u + half groups without drawing anything visible."""
    p = PALETTES[u]
    return shared_defs(p, u) + f'<g transform="translate(-99999,-99999)">{strip(p, "front", u)}{strip(p, "back", u)}</g>'


# ---------------------------------------------------------------- mockup
def mockup(u, cx, by, k, ang=8.0, sep=34):
    p = PALETTES[u]
    v_top, v_end = 40, 472
    arms = []
    for sx, a in ((-1, -ang), (1, ang)):
        arms.append(f'''<g transform="translate({cx + sx*sep},{by}) rotate({a}) scale({k}) translate(-12.5,{-v_end})" filter="url(#sh)">
  <g clip-path="url(#armclip)">{strand_vertical(u)}</g>
  <rect x="0" y="{v_top}" width="25" height="{v_end-v_top+4}" fill="url(#armshade)"/>
</g>''')
    # crimp / hardware
    cw = 2 * sep + 25 * k + 16
    hw = f'''
<g filter="url(#sh)">
 <rect x="{cx-cw/2}" y="{by-6}" width="{cw}" height="{18*k*0.9}" rx="6" fill="{p['bg']}"/>
 <rect x="{cx-cw/2}" y="{by-6}" width="{cw}" height="{18*k*0.9}" rx="6" fill="url(#leather)"/>
 <rect x="{cx-cw/2+5}" y="{by-1}" width="{cw-10}" height="{18*k*0.9-10}" rx="4" fill="none" stroke="#ffffff" stroke-opacity=".35" stroke-width="1.4" stroke-dasharray="4 3"/>
 <g transform="translate({cx},{by+18*k*0.9-6})">
   <rect x="-22" y="-4" width="44" height="14" rx="4" fill="url(#gold)"/>
   <ellipse cx="0" cy="26" rx="15" ry="17" fill="none" stroke="url(#gold)" stroke-width="5"/>
   <path d="M-10,42 h20 v10 c10,6 14,22 6,40 c-6,14 -26,14 -32,0 c-8,-18 -4,-34 6,-40Z" fill="url(#gold)"/>
   <path d="M-2,58 c10,4 12,18 6,30" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.5"/>
   <rect x="-4" y="88" width="8" height="18" rx="3" fill="url(#gold)"/>
 </g>
</g>'''
    # ID card
    cy = by + 18 * k * 0.9 - 6 + 104
    cwid, chei = 236, 352
    x0 = cx - cwid / 2
    lg, lw = logo(0, 0, 1)
    lh = 88
    lgs, lgw = logo(0, 0, lh)
    card = f'''
<g filter="url(#sh)">
 <rect x="{x0-10}" y="{cy}" width="{cwid+20}" height="{chei+26}" rx="12" fill="#ffffff" fill-opacity=".55" stroke="#ffffff" stroke-opacity=".9" stroke-width="2"/>
 <rect x="{cx-26}" y="{cy+9}" width="52" height="9" rx="4.5" fill="#d9d9d9" stroke="#bdbdbd"/>
 <rect x="{x0}" y="{cy+24}" width="{cwid}" height="{chei-6}" rx="8" fill="#ffffff"/>
 <clipPath id="cardclip{u}"><rect x="{x0}" y="{cy+24}" width="{cwid}" height="{chei-6}" rx="8"/></clipPath>
 <g clip-path="url(#cardclip{u})">
  <g transform="translate({x0},{cy+24}) scale(2.4)"><use href="#halffront{u}" transform="translate(-5,-6)"/></g>
  <rect x="{x0}" y="{cy+24+36}" width="{cwid}" height="{chei}" fill="#ffffff"/>
  <rect x="{x0}" y="{cy+24+33}" width="{cwid}" height="3" fill="{p['trim']}"/>
 </g>
 <g transform="translate({cx-lgw/2},{cy+72})">{lgs}</g>
 <rect x="{cx-38}" y="{cy+172}" width="76" height="90" rx="4" fill="#eef0e6" stroke="#cfd4bf"/>
 <circle cx="{cx}" cy="{cy+205}" r="17" fill="#cfd4bf"/><path d="M{cx-30},{cy+262} c4,-30 56,-30 60,0Z" fill="#cfd4bf"/>
 <text x="{cx}" y="{cy+290}" text-anchor="middle" font-family="{FONT}" font-size="15" font-weight="700" fill="#3a3a3a">NAMA JEMAAH</text>
 <text x="{cx}" y="{cy+310}" text-anchor="middle" font-family="{FONT}" font-size="11" fill="#777">No. Pasport : A00000000</text>
 <text x="{cx}" y="{cy+328}" text-anchor="middle" font-family="{FONT}" font-size="11" fill="#777">Kumpulan : ——</text>
 <g transform="translate({x0+cwid-46},{cy+352})">{flag(0,0,30)}</g>
</g>'''
    return "".join(arms) + hw + card


COMMON_DEFS = f'''<defs>
<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#3b3020" flood-opacity=".28"/></filter>
<clipPath id="armclip"><rect x="0" y="40" width="25" height="436"/></clipPath>
<linearGradient id="armshade" x1="0" x2="1" y1="0" y2="0">
 <stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset=".12" stop-color="#000" stop-opacity=".06"/>
 <stop offset=".45" stop-color="#fff" stop-opacity=".08"/><stop offset=".88" stop-color="#000" stop-opacity=".06"/>
 <stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
<linearGradient id="leather" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>
<linearGradient id="gold" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#f7e3a1"/><stop offset=".45" stop-color="#c9a24a"/><stop offset=".7" stop-color="#f2d98a"/><stop offset="1" stop-color="#9c7a2e"/></linearGradient>
<radialGradient id="bgrad" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#f7f3ea"/><stop offset="1" stop-color="#e3dccb"/></radialGradient>
</defs>'''


def text(x, y, s, size, weight=400, fill="#2d2d2d", anchor="start", ls=0):
    return (f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{size}" font-weight="{weight}" fill="{fill}" '
            f'text-anchor="{anchor}" letter-spacing="{ls}">{html.escape(s)}</text>')


# ---------------------------------------------------------------- Image 1: hero mockup option A
def hero(u, fname, title_opt):
    p = PALETTES[u]
    W_, H_ = 1600, 1500
    k = 2.9
    body = [COMMON_DEFS, defs_only(u), f'<rect width="{W_}" height="{H_}" fill="url(#bgrad)"/>']
    body.append(mockup(u, 560, 900, k))
    # info panel
    px = 1030
    body.append(f'<rect x="{px-30}" y="0" width="{W_-px+30}" height="{H_}" fill="#ffffff" fill-opacity=".72"/>')
    lg, lw = logo(0, 0, 120)
    body.append(f'<g transform="translate({px},70)">{lg}</g>')
    y = 260
    body.append(text(px, y, "CADANGAN REKA BENTUK LANYARD", 16, 700, "#76963A", ls=2))
    body.append(text(px, y + 46, title_opt, 34, 800, "#2d2d2d"))
    body.append(f'<rect x="{px}" y="{y+70}" width="70" height="4" fill="{p["trim"]}"/>')
    bullets = [
        ("Saiz", "25mm (lebar) × 1000mm (panjang)"),
        ("Cetakan", "Sublimation penuh, 2 belah"),
        ("Depan", "Corak bunga + Bendera Malaysia + logo Azzuha"),
        ("Belakang", "Corak bunga penuh"),
        ("Kedudukan", "Bendera & logo di paras dada, kedua-dua belah"),
        ("Aksesori", "Cangkuk besi warna emas + pemegang kad"),
    ]
    yy = y + 130
    for a, b in bullets:
        body.append(text(px, yy, a.upper(), 12, 700, "#8a8a8a", ls=1.5))
        body.append(text(px, yy + 24, b, 19, 500, "#333"))
        yy += 66
    # close-up
    yy += 20
    body.append(text(px, yy, "BAHAGIAN DADA (ZOOM)", 12, 700, "#8a8a8a", ls=1.5))
    zk = 3.2
    body.append(f'''<g transform="translate({px},{yy+16})" filter="url(#sh)"><svg width="{130*zk}" height="{25*zk}" viewBox="165 0 130 25">
      <use href="#halffront{u}"/></svg></g>''')
    body.append(text(px, yy + 16 + 25 * zk + 34, "Warna: " + "  ".join([p["bg"], p["trim"], "#76963A"]), 13, 500, "#777"))
    body.append(text(px, H_ - 40, "Azzuha Group Travel & Tours  •  Lanyard Jemaah", 13, 500, "#9a9a9a"))
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{W_}" height="{H_}" viewBox="0 0 {W_} {H_}">{"".join(body)}</svg>'
    jobs.append(dict(**{"in": write(fname, page(svg, W_, H_)), "out": f"{OUT}/presentation/{fname}.png", "w": W_, "h": H_, "scale": 2}))


# ---------------------------------------------------------------- Image 3: options A vs B
def compare():
    W_, H_ = 1600, 1560
    k = 2.55
    body = [COMMON_DEFS, defs_only("A"), defs_only("B"), f'<rect width="{W_}" height="{H_}" fill="url(#bgrad)"/>']
    body.append(mockup("A", 420, 900, k, ang=7))
    body.append(mockup("B", 1180, 900, k, ang=7))
    body.append(f'<rect x="590" y="40" width="420" height="270" rx="18" fill="#fff" fill-opacity=".85" filter="url(#sh)"/>')
    lg, lw = logo(0, 0, 90)
    body.append(f'<g transform="translate({800-lw/2},70)">{lg}</g>')
    body.append(text(800, 210, "PILIHAN WARNA LANYARD", 22, 800, "#2d2d2d", "middle", 1))
    body.append(text(800, 242, "Reka bentuk sama, warna latar berbeza", 15, 500, "#777", "middle"))
    body.append(text(800, 275, "25mm × 1000mm • Sublimation 2 belah", 15, 500, "#777", "middle"))
    for u, x in (("A", 420), ("B", 1180)):
        p = PALETTES[u]
        body.append(f'<rect x="{x-170}" y="{H_-100}" width="340" height="68" rx="34" fill="#fff" filter="url(#sh)"/>')
        body.append(f'<circle cx="{x-130}" cy="{H_-66}" r="18" fill="{p["bg"]}"/>')
        body.append(text(x - 100, H_ - 72, f"PILIHAN {u}", 13, 800, "#76963A", ls=1.5))
        body.append(text(x - 100, H_ - 50, p["name"], 19, 700, "#2d2d2d"))
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{W_}" height="{H_}" viewBox="0 0 {W_} {H_}">{"".join(body)}</svg>'
    jobs.append({"in": write("compare", page(svg, W_, H_)), "out": f"{OUT}/presentation/03_Pilihan_A_vs_B.png", "w": W_, "h": H_, "scale": 2})


# ---------------------------------------------------------------- technical layout (used for presentation PNG and print PDF)
def dim_h(x1, x2, y, label, col="#3fa7c9", fs=3.2, tick=2.2):
    return (f'<g stroke="{col}" stroke-width="0.25" fill="none"><path d="M{x1},{y} H{x2} M{x1},{y-tick} V{y+tick} M{x2},{y-tick} V{y+tick}"/>'
            f'<path d="M{x1},{y} l1.6,-0.8 v1.6Z M{x2},{y} l-1.6,-0.8 v1.6Z" fill="{col}"/></g>'
            f'<text x="{(x1+x2)/2}" y="{y-1.2}" font-family="{FONT}" font-size="{fs}" fill="{col}" text-anchor="middle">{label}</text>')


def dim_v(x, y1, y2, label, col="#3fa7c9", fs=3.2):
    return (f'<g stroke="{col}" stroke-width="0.25" fill="none"><path d="M{x},{y1} V{y2} M{x-2},{y1} H{x+2} M{x-2},{y2} H{x+2}"/></g>'
            f'<text x="{x+2.5}" y="{(y1+y2)/2+1.2}" font-family="{FONT}" font-size="{fs}" fill="{col}">{label}</text>')


def layout_sheet(u):
    """Returns svg body in mm for a 1100 x 330 mm sheet."""
    p = PALETTES[u]
    W_, H_ = 1100, 330
    ox = 50
    b = [COMMON_DEFS, shared_defs(p, u), f'<rect width="{W_}" height="{H_}" fill="#fff"/>']
    b.append(f'<text x="{W_/2}" y="22" font-family="{FONT}" font-size="11" font-weight="700" fill="#222" text-anchor="middle" letter-spacing="0.5">SUBLIMATION LANYARD — AZZUHA GROUP TRAVEL &amp; TOURS</text>')
    b.append(f'<text x="{W_/2}" y="31" font-family="{FONT}" font-size="5" fill="#666" text-anchor="middle">Pilihan {u}: {p["name"]}  •  Saiz siap 25mm × 1000mm  •  Skala 1:1 (ukuran sebenar)</text>')
    # front
    fy = 62
    b.append(f'<text x="{ox}" y="{fy-14}" font-family="{FONT}" font-size="5" font-weight="700" fill="#222">BAHAGIAN DEPAN (FRONT)</text>')
    b.append(f'<g transform="translate({ox},{fy})">{strip(p, "front", u)}<rect width="1000" height="25" fill="none" stroke="#999" stroke-width="0.2"/></g>')
    b.append(dim_h(ox, ox + 1000, fy - 6, "1000mm"))
    b.append(dim_v(ox + 1004, fy, fy + 25, "25mm"))
    b.append(dim_h(ox, ox + 30, fy + 32, "30mm"))
    b.append(dim_h(ox + 970, ox + 1000, fy + 32, "30mm"))
    # centre mark
    b.append(f'<path d="M{ox+500},{fy-3} V{fy+28}" stroke="#e05a5a" stroke-width="0.3" stroke-dasharray="1.5 1"/>')
    b.append(f'<text x="{ox+500}" y="{fy+33}" font-family="{FONT}" font-size="3.2" fill="#e05a5a" text-anchor="middle">TENGAH / LIPATAN (belakang leher)</text>')
    # feature positions (right half)
    fx = ox + HALF + FLAG_X
    px_ = ox + HALF + PANEL_X
    b.append(dim_h(fx, fx + FLAG_W, fy + 32, "Bendera 50mm", "#c0392b"))
    b.append(dim_h(px_, px_ + PANEL_W, fy + 32, "Logo 50mm", "#c0392b"))
    b.append(dim_h(ox + 500, fx, fy + 40, f"{FLAG_X:.0f}mm dari tengah", "#888"))
    b.append(dim_h(px_ + PANEL_W, ox + 1000, fy + 40, f"{1000-(500+PANEL_X+PANEL_W):.0f}mm ke hujung", "#888"))
    lx = ox + HALF - FLAG_X - FLAG_W
    b.append(dim_h(lx, lx + FLAG_W, fy + 32, "Bendera 50mm", "#c0392b"))
    b.append(dim_h(ox + HALF - PANEL_X - PANEL_W, ox + HALF - PANEL_X, fy + 32, "Logo 50mm", "#c0392b"))
    b.append(dim_h(ox, ox + HALF - PANEL_X - PANEL_W, fy + 40, f"{HALF-PANEL_X-PANEL_W:.0f}mm ke hujung", "#888"))
    b.append(dim_h(lx + FLAG_W, ox + 500, fy + 40, f"{FLAG_X:.0f}mm dari tengah", "#888"))
    # back
    by_ = 140
    b.append(f'<text x="{ox}" y="{by_-8}" font-family="{FONT}" font-size="5" font-weight="700" fill="#222">BAHAGIAN BELAKANG (BACK)</text>')
    b.append(f'<g transform="translate({ox},{by_})">{strip(p, "back", u)}<rect width="1000" height="25" fill="none" stroke="#999" stroke-width="0.2"/></g>')
    b.append(dim_h(ox, ox + 1000, by_ + 32, "1000mm"))
    b.append(dim_v(ox + 1004, by_, by_ + 25, "25mm"))
    # zoom detail
    zy = 195
    b.append(f'<text x="{ox}" y="{zy}" font-family="{FONT}" font-size="5" font-weight="700" fill="#222">BUTIRAN BENDERA &amp; LOGO (ZOOM 2.5×)</text>')
    zk = 2.5
    b.append(f'<g transform="translate({ox},{zy+6})"><svg width="{130*zk}" height="{25*zk}" viewBox="165 0 130 25"><use href="#halffront{u}"/></svg>'
             f'<rect width="{130*zk}" height="{25*zk}" fill="none" stroke="#999" stroke-width="0.3"/></g>')
    # specs
    sx = 420
    specs = [
        ("Saiz siap", "25mm × 1000mm (+2mm bleed di setiap sisi dalam fail cetakan)"),
        ("Kaedah", "Sublimation, cetak penuh 2 belah (depan & belakang berbeza)"),
        ("Hujung", "30mm setiap hujung untuk jahitan / klip besi (tiada elemen penting)"),
        ("Aksesori", "Lobster hook besi warna emas + pemegang kad PVC"),
        ("Orientasi", "Separuh kiri diputar 180° — logo & bendera tegak di kedua-dua belah bila dipakai"),
        ("Kuantiti", "______ PCS"),
    ]
    yy = zy + 2
    for a, c in specs:
        b.append(f'<text x="{sx}" y="{yy+6}" font-family="{FONT}" font-size="4" font-weight="700" fill="#76963A">{a.upper()}</text>')
        b.append(f'<text x="{sx+28}" y="{yy+6}" font-family="{FONT}" font-size="4.4" fill="#333">{html.escape(c)}</text>')
        yy += 10
    # swatches
    sw = [("Latar", p["bg"]), ("Bunga putih", p["f_white"]), ("Biru tua", p["f_navy"] if u == "A" else p["center_peach"]),
          ("Biru muda", p["f_blue"]), ("Pic", p["leaf_peach"]), ("Bingkai emas", p["trim"]), ("Logo hijau", "#76963A"),
          ("Logo kelabu", "#555555"), ("Merah bendera", "#CC0001"), ("Biru bendera", "#010066"), ("Kuning bendera", "#FFCC00")]
    swx = 900
    b.append(f'<text x="{swx}" y="{zy}" font-family="{FONT}" font-size="5" font-weight="700" fill="#222">WARNA (HEX)</text>')
    for i, (n, c) in enumerate(sw):
        yy = zy + 5 + i * 10
        b.append(f'<rect x="{swx}" y="{yy}" width="12" height="7" fill="{c}" stroke="#bbb" stroke-width="0.2"/>')
        b.append(f'<text x="{swx+15}" y="{yy+5}" font-family="{FONT}" font-size="3.8" fill="#333">{n}  {c.upper()}</text>')
    b.append(f'<text x="{ox}" y="{H_-12}" font-family="{FONT}" font-size="3.6" fill="#888">Nota kepada pencetak: sila hantar sampel digital / proof warna sebelum produksi. Logo dalam fail adalah vektor. Bendera Malaysia ikut nisbah rasmi 1:2.</text>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{W_}mm" height="{H_}mm" viewBox="0 0 {W_} {H_}">{"".join(b)}</svg>', W_, H_


def artwork(u, side, bleed=2.0):
    p = PALETTES[u]
    w, h = W_STRIP + 2 * bleed, H + 2 * bleed
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}mm" height="{h}mm" viewBox="{-bleed} {-bleed} {w} {h}">'
           f'{shared_defs(p, u)}{strip(p, side, u, bleed)}</svg>')
    return svg, w, h


# ------------------------------------------------ run
hero("A", "01_Mockup_Pilihan_A", "Pilihan A — Hijau Zaitun Floral")
compare()
# presentation layout sheet (A)
svg, w, h = layout_sheet("A")
jobs.append({"in": write("layoutA_png", page(svg.replace(f'width="{w}mm" height="{h}mm"', f'width="{w*3.5}" height="{h*3.5}"'), w*3.5, h*3.5)),
             "out": f"{OUT}/presentation/02_Layout_Reka_Bentuk_A.png", "w": int(w*3.5), "h": int(h*3.5), "scale": 1})
hero("B", "04_Mockup_Pilihan_B", "Pilihan B — Hijau Zamrud Floral")

for u in "AB":
    d = f"{OUT}/print/Pilihan_{u}"
    svg, w, h = layout_sheet(u)
    open(f"{d}/Azzuha_Lanyard_{u}_Layout.svg", "w").write(svg)
    jobs.append({"in": write(f"layout{u}", page(svg, w, h, "mm")), "out": f"{WORK}/p_{u}_1.pdf", "w": w, "h": h, "unit": "mm"})
    for i, side in enumerate(("front", "back")):
        svg, w, h = artwork(u, side)
        nm = "Depan" if side == "front" else "Belakang"
        open(f"{d}/Azzuha_Lanyard_{u}_{nm}_1000x25mm.svg", "w").write(svg)
        jobs.append({"in": write(f"art{u}{side}", page(svg, w, h, "mm", PALETTES[u]["bg"])), "out": f"{WORK}/p_{u}_{i+2}.pdf", "w": w, "h": h, "unit": "mm"})
        # 300 dpi PNG: 1mm = 11.811 px ; css px per mm = 3.7795 -> scale 3.125
        jobs.append({"in": write(f"art{u}{side}", page(svg, w, h, "mm")), "out": f"{d}/Azzuha_Lanyard_{u}_{nm}_300dpi.png", "w": w, "h": h, "unit": "mm", "scale": 3.125})

json.dump(jobs, open(f"{WORK}/jobs.json", "w"), indent=1)
print(len(jobs), "jobs")
