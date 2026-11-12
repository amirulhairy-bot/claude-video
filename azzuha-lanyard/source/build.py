"""Build presentation PNGs and print files. usage: python3 build.py <out_dir> <work_dir>; then node render2.js <work>/jobs.json"""
import sys, os, json, html, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lanyard import *

OUT, WORK = sys.argv[1], sys.argv[2]
for d in ("presentation", "print"):
    os.makedirs(f"{OUT}/{d}", exist_ok=True)
jobs = []
FONT = "Inter, 'DejaVu Sans', sans-serif"


def page(svg, w, h, unit="px", bg="#fff"):
    return (f'<!doctype html><html><head><meta charset="utf-8"><style>@page{{size:{w}{unit} {h}{unit};margin:0}}'
            f'html,body{{margin:0;padding:0;background:{bg}}}svg{{display:block}}'
            f'.emb path{{fill:#000}}</style></head><body>{svg}</body></html>')


def write(name, content):
    path = f"{WORK}/b_{name}.html"
    open(path, "w").write(content)
    return path


def text(x, y, s, size, weight=400, fill="#2d2d2d", anchor="start", ls=0):
    return (f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{size}" font-weight="{weight}" fill="{fill}" '
            f'text-anchor="{anchor}" letter-spacing="{ls}">{html.escape(s)}</text>')


LOGO_NOID = LOGO_PATHS.replace('id="g" ', '').replace('id="k" ', '')

FX_DEFS = f'''<defs>
<filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#2a2418" flood-opacity=".30"/></filter>
<linearGradient id="armshade" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".30"/><stop offset=".1" stop-color="#000" stop-opacity=".05"/>
 <stop offset=".45" stop-color="#fff" stop-opacity=".10"/><stop offset=".9" stop-color="#000" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient>
<pattern id="weave" width="0.55" height="0.55" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
 <rect width="0.55" height="0.26" fill="#fff" fill-opacity=".07"/></pattern>
<linearGradient id="leathG" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
<linearGradient id="gold" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fbe9ae"/><stop offset=".4" stop-color="#cfa64c"/>
 <stop offset=".7" stop-color="#f4dc8f"/><stop offset="1" stop-color="#9a782c"/></linearGradient>
<radialGradient id="bgrad" cx=".45" cy=".35" r=".85"><stop offset="0" stop-color="#f7f3ea"/><stop offset="1" stop-color="#e2dac7"/></radialGradient>
<radialGradient id="carpet" cx=".5" cy=".4" r=".9"><stop offset="0" stop-color="#8b8780"/><stop offset="1" stop-color="#5d5a55"/></radialGradient>
<filter id="noise"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .22 0"/></filter>
</defs>'''


_mk = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logo_mark.svg')).read()
_vb = [float(x) for x in re.search(r'viewBox="([^"]+)"', _mk).group(1).split()]
_mk_d = "".join(re.findall(r' d="([^"]+)"', _mk))
MARK_W = 17.0
MARK_H = MARK_W * _vb[3] / _vb[2]


def emboss_mark():
    """Azzuha mark debossed into leather: dark recess + light lower edge highlight + tone fill."""
    sc = MARK_W / _vb[2]
    g = lambda dx, dy, fill, op: (f'<path transform="translate({dx},{dy}) scale({sc:.5f}) translate({-_vb[0]},{-_vb[1]})" '
                                  f'd="{_mk_d}" fill="{fill}" fill-opacity="{op}"/>')
    return g(0, 0.22, "#f4f8e2", .35) + g(0, -0.12, "#1f2a08", .45) + g(0, 0, "#5f7424", 1)


def leather_tab(v0=468, length=38):
    """leather end tab in strand frame (mm), covering the sewn 30mm end + a little."""
    return f'''<g>
 <rect x="-1" y="{v0}" width="27" height="{length}" rx="1.4" fill="{P['leather']}"/>
 <rect x="-1" y="{v0}" width="27" height="{length}" rx="1.4" fill="url(#leathG)"/>
 <rect x="0.8" y="{v0+1.8}" width="23.4" height="{length-3.6}" rx="0.8" fill="none" stroke="#e9f0cf" stroke-opacity=".55" stroke-width="0.35" stroke-dasharray="1.1 0.7"/>
 <g transform="translate({12.5-MARK_W/2:.3f},{v0+length*0.42-MARK_H/2:.3f})">{emboss_mark()}</g>
</g>'''


def arm(kind, bx, by, ang, k, v_top=30, v_end=506, rings=True):
    """strand with neck at top, its hook end at (bx,by) in px."""
    ring = (f'<g transform="translate(12.5,{v_end+1.5})"><rect x="-4" y="-1.8" width="8" height="3.2" rx="1" fill="url(#gold)"/>'
            f'<ellipse cx="0" cy="4.6" rx="3" ry="3.6" fill="none" stroke="url(#gold)" stroke-width="1.1"/></g>') if rings else ''
    return f'''<g transform="translate({bx},{by}) rotate({ang}) scale({k}) translate(-12.5,{-v_end-8})" filter="url(#sh)">
 <clipPath id="ac{kind}{bx:.0f}"><rect x="0" y="{v_top}" width="25" height="{v_end-v_top}"/></clipPath>
 <g clip-path="url(#ac{kind}{bx:.0f})"><use href="#s_{kind}"/>
   <rect x="0" y="{v_top}" width="25" height="{v_end}" fill="url(#weave)"/>
   <rect x="0" y="{v_top}" width="25" height="{v_end}" fill="url(#armshade)"/></g>
 {leather_tab()}{ring}
</g>'''


def hardware_and_card(cx, y, k):
    """lobster clip from y downwards (px) + ID card. returns svg."""
    s = k / 2.9
    clip = f'''<g transform="translate({cx},{y}) scale({s})" filter="url(#sh)">
  <circle cx="0" cy="0" r="13" fill="none" stroke="url(#gold)" stroke-width="5"/>
  <rect x="-7" y="10" width="14" height="14" rx="3" fill="url(#gold)"/>
  <path d="M-12,24 h24 l2,8 c12,10 14,34 2,52 c-8,12 -26,12 -34,0 c-12,-18 -10,-42 2,-52Z" fill="url(#gold)"/>
  <path d="M-4,40 c10,6 12,24 4,38" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>
  <path d="M10,44 v20" stroke="#8a6a25" stroke-width="3"/>
  <rect x="-5" y="82" width="10" height="20" rx="3" fill="url(#gold)"/>
</g>'''
    cyy = y + 98 * s
    cw, chh = 236 * s, 350 * s
    x0 = cx - cw / 2
    lh = 84 * s
    lg, lw = logo(0, 0, lh)
    card = f'''<g filter="url(#sh)">
 <rect x="{x0-10*s}" y="{cyy}" width="{cw+20*s}" height="{chh+26*s}" rx="{12*s}" fill="#fff" fill-opacity=".6" stroke="#fff" stroke-width="2"/>
 <rect x="{cx-26*s}" y="{cyy+9*s}" width="{52*s}" height="{9*s}" rx="{4.5*s}" fill="#d9d9d9" stroke="#bdbdbd"/>
 <rect x="{x0}" y="{cyy+24*s}" width="{cw}" height="{chh-6*s}" rx="{8*s}" fill="#fff"/>
 <rect x="{x0}" y="{cyy+24*s}" width="{cw}" height="{36*s}" fill="{P['bg']}"/><svg x="{x0}" y="{cyy+24*s}" width="{cw}" height="{36*s}" viewBox="0 0 {236/2.6:.2f} {36/2.6:.2f}" preserveAspectRatio="xMidYMid slice"><use href="#tile" transform="translate(0,25) rotate(-90)"/></svg>
 
 <rect x="{x0}" y="{cyy+58*s}" width="{cw}" height="{3*s}" fill="{P['peach']}"/>
 <g transform="translate({cx-lw/2},{cyy+76*s})">{lg}</g>
 <rect x="{cx-38*s}" y="{cyy+172*s}" width="{76*s}" height="{90*s}" rx="4" fill="#eef0e6" stroke="#cfd4bf"/>
 <circle cx="{cx}" cy="{cyy+205*s}" r="{17*s}" fill="#cfd4bf"/><path d="M{cx-30*s},{cyy+262*s} c{4*s},{-30*s} {56*s},{-30*s} {60*s},0Z" fill="#cfd4bf"/>
 {text(cx, cyy+290*s, "NAMA JEMAAH", 15*s, 700, "#3a3a3a", "middle")}
 {text(cx, cyy+310*s, "No. Pasport : A00000000", 11*s, 400, "#777", "middle")}
 {text(cx, cyy+328*s, "Kumpulan : ——", 11*s, 400, "#777", "middle")}
</g>'''
    return clip + card


def svgdoc(w, h, body, unit=""):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}{unit}" height="{h}{unit}" viewBox="0 0 {w} {h}">{body}</svg>'


# ------------------------------------------------------------------ 01 hero mockup
def hero():
    W_, H_ = 1600, 1500
    k = 2.25
    cx, by = 540, 960
    b = [FX_DEFS, doc_defs(), f'<rect width="{W_}" height="{H_}" fill="url(#bgrad)"/>']
    b.append(arm("L", cx - 21, by, -12, k))
    b.append(arm("R", cx + 21, by, 12, k))
    b.append(hardware_and_card(cx, by + 22, k))
    px = 1020
    b.append(f'<rect x="{px-30}" y="0" width="{W_-px+30}" height="{H_}" fill="#fff" fill-opacity=".74"/>')
    lg, _ = logo(0, 0, 115)
    b.append(f'<g transform="translate({px},70)">{lg}</g>')
    y = 255
    b.append(text(px, y, "CADANGAN REKA BENTUK LANYARD", 16, 700, "#76963A", ls=2))
    b.append(text(px, y + 46, "Lanyard Jemaah Azzuha", 36, 800))
    b.append(f'<rect x="{px}" y="{y+70}" width="70" height="4" fill="{P["peach"]}"/>')
    rows = [("Corak", "Bunga klasik hijau zaitun (ikut rujukan)"),
            ("Bendera", "Jalur Gemilang di paras kolar, kedua-dua tali"),
            ("Logo", "Logo Azzuha betul-betul di bawah bendera"),
            ("Saiz", "25mm (lebar) × 1000mm (panjang)"),
            ("Cetakan", "Sublimation penuh, 2 belah"),
            ("Hujung", "Tab kulit PU hijau + cangkuk emas")]
    yy = y + 128
    for a, c in rows:
        b.append(text(px, yy, a.upper(), 12, 700, "#8a8a8a", ls=1.5))
        b.append(text(px, yy + 24, c, 19, 500, "#333"))
        yy += 64
    yy += 18
    b.append(text(px, yy, "BAHAGIAN KOLAR (ZOOM)", 12, 700, "#8a8a8a", ls=1.5))
    zk = 3.6
    for i, kind in enumerate(("L", "R")):
        x = px + i * (25 * zk + 40)
        b.append(f'<g transform="translate({x},{yy+18})" filter="url(#sh)"><svg width="{25*zk}" height="{76*zk}" viewBox="0 {FEAT_V-5} 25 76">'
                 f'<use href="#s_{kind}"/></svg></g>')
    b.append(text(px, H_ - 40, "Azzuha Group Travel & Tours  •  Lanyard Jemaah", 13, 500, "#9a9a9a"))
    jobs.append({"in": write("hero", page(svgdoc(W_, H_, "".join(b)), W_, H_)), "out": f"{OUT}/presentation/01_Mockup_Lanyard_Azzuha.png",
                 "w": W_, "h": H_, "scale": 2})


# ------------------------------------------------------------------ 03 close-up flat lay (like the reference photo)
def closeup():
    W_, H_ = 1600, 1500
    b = [FX_DEFS, doc_defs(), f'<rect width="{W_}" height="{H_}" fill="url(#carpet)"/>',
         f'<rect width="{W_}" height="{H_}" filter="url(#noise)"/>']
    def piece(kind, x, y, ang, k, v0, v1):
        return (f'<g transform="translate({x},{y}) rotate({ang}) scale({k}) translate(-12.5,{-v0})" filter="url(#sh)">'
                f'<clipPath id="pc{kind}{x}"><rect x="0" y="{v0}" width="25" height="{v1-v0}"/></clipPath>'
                f'<g clip-path="url(#pc{kind}{x})"><use href="#s_{kind}"/><rect x="0" y="{v0}" width="25" height="{v1-v0}" fill="url(#weave)"/>'
                f'<rect x="0" y="{v0}" width="25" height="{v1-v0}" fill="url(#armshade)"/></g></g>')
    b.append(piece("L", 260, -40, -12, 6.0, 100, 330))
    b.append(piece("R", 760, -40, 12, 6.0, 100, 330))
    b.append(arm("plain", 1330, 1290, 18, 4.6, v_top=330))
    b.append(f'<rect x="1040" y="40" width="520" height="150" rx="16" fill="#fff" fill-opacity=".9" filter="url(#sh)"/>')
    b.append(text(1070, 95, "BUTIRAN DEKAT", 15, 700, "#76963A", ls=2))
    b.append(text(1070, 135, "Bendera + Logo, kedua-dua tali", 22, 800))
    b.append(text(1070, 165, "Tab kulit hijau (emboss logo) + cangkuk emas", 16, 500, "#666"))
    jobs.append({"in": write("close", page(svgdoc(W_, H_, "".join(b)), W_, H_)), "out": f"{OUT}/presentation/03_Butiran_Dekat.png",
                 "w": W_, "h": H_, "scale": 2})


# ------------------------------------------------------------------ technical layout sheet (mm)
def dim_h(x1, x2, y, label, col="#3fa7c9", fs=3.2, tick=2.2):
    return (f'<g stroke="{col}" stroke-width="0.25" fill="none"><path d="M{x1},{y} H{x2} M{x1},{y-tick} V{y+tick} M{x2},{y-tick} V{y+tick}"/></g>'
            f'<path d="M{x1},{y} l1.6,-0.8 v1.6Z M{x2},{y} l-1.6,-0.8 v1.6Z" fill="{col}"/>'
            f'<text x="{(x1+x2)/2}" y="{y-1.2}" font-family="{FONT}" font-size="{fs}" fill="{col}" text-anchor="middle">{label}</text>')


def dim_v(x, y1, y2, label, col="#3fa7c9", fs=3.2):
    return (f'<g stroke="{col}" stroke-width="0.25" fill="none"><path d="M{x},{y1} V{y2} M{x-2},{y1} H{x+2} M{x-2},{y2} H{x+2}"/></g>'
            f'<text x="{x+2.5}" y="{(y1+y2)/2+1.2}" font-family="{FONT}" font-size="{fs}" fill="{col}">{label}</text>')


def T(x, y, s, fs, w=400, fill="#333", anchor="start"):
    return f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{fs}" font-weight="{w}" fill="{fill}" text-anchor="{anchor}">{html.escape(s)}</text>'


def layout_sheet():
    W_, H_ = 1100, 330
    ox = 50
    b = [doc_defs(), f'<rect width="{W_}" height="{H_}" fill="#fff"/>']
    b.append(T(W_/2, 22, "SUBLIMATION LANYARD — AZZUHA GROUP TRAVEL & TOURS", 11, 700, "#222", "middle"))
    b.append(T(W_/2, 31, "Saiz siap 25mm × 1000mm  •  Cetak 2 belah  •  Skala 1:1 (ukuran sebenar)", 5, 400, "#666", "middle"))
    fy = 62
    b.append(T(ox, fy - 14, "BAHAGIAN DEPAN (FRONT)", 5, 700, "#222"))
    b.append(f'<g transform="translate({ox},{fy})">{strip("front")}<rect width="1000" height="25" fill="none" stroke="#999" stroke-width="0.2"/></g>')
    b.append(dim_h(ox, ox + 1000, fy - 6, "1000mm"))
    b.append(dim_v(ox + 1004, fy, fy + 25, "25mm"))
    b.append(dim_h(ox, ox + 30, fy + 32, "30mm"))
    b.append(dim_h(ox + 970, ox + 1000, fy + 32, "30mm"))
    b.append(f'<path d="M{ox+500},{fy-3} V{fy+28}" stroke="#e05a5a" stroke-width="0.3" stroke-dasharray="1.5 1"/>')
    b.append(T(ox + 500, fy + 33, "TENGAH / LIPATAN (belakang leher)", 3.2, 400, "#e05a5a", "middle"))
    for sgn, lab in ((1, "TALI KANAN"), (-1, "TALI KIRI")):
        f1, f2 = ox + 500 + sgn * FEAT_V, ox + 500 + sgn * (FEAT_V + FLAG_LEN)
        l2 = ox + 500 + sgn * (FEAT_V + FLAG_LEN + PANEL_LEN)
        b.append(dim_h(min(f1, f2), max(f1, f2), fy + 32, f"Bendera {FLAG_LEN:.0f}mm", "#c0392b"))
        b.append(dim_h(min(f2, l2), max(f2, l2), fy + 32, f"Logo {PANEL_LEN:.0f}mm", "#c0392b"))
        b.append(dim_h(min(ox + 500, f1), max(ox + 500, f1), fy + 40, f"{FEAT_V:.0f}mm dari tengah", "#888"))
        b.append(T(ox + 500 + sgn * 250, fy + 50, lab + " — BENDERA + LOGO", 3.6, 700, "#76963A", "middle"))
    by_ = 140
    b.append(T(ox, by_ - 8, "BAHAGIAN BELAKANG (BACK) — corak bunga penuh", 5, 700, "#222"))
    b.append(f'<g transform="translate({ox},{by_})">{strip("back")}<rect width="1000" height="25" fill="none" stroke="#999" stroke-width="0.2"/></g>')
    b.append(dim_h(ox, ox + 1000, by_ + 32, "1000mm"))
    b.append(dim_v(ox + 1004, by_, by_ + 25, "25mm"))
    # zoom: both strands vertical
    zy = 190
    b.append(T(ox, zy, "BUTIRAN (ZOOM 1.3×, arah bila dipakai)", 5, 700, "#222"))
    for i, kind in enumerate(("L", "R")):
        x = ox + i * 60
        b.append(f'<g transform="translate({x},{zy+6})"><svg width="32" height="96" viewBox="0 {FEAT_V-4} 25 75"><use href="#s_{kind}"/></svg>'
                 f'<rect width="32" height="96" fill="none" stroke="#999" stroke-width="0.3"/></g>')
        b.append(T(x + 16, zy + 108, "Tali kiri" if kind == "L" else "Tali kanan", 3.6, 600, "#555", "middle"))
    sx = 230
    specs = [("Saiz siap", "25mm × 1000mm (fail artwork ada 2mm bleed setiap sisi = 1004 × 29mm)"),
             ("Kaedah", "Sublimation, cetak penuh 2 belah (depan & belakang berbeza)"),
             ("Bendera", f"Kedua-dua tali, {FEAT_V:.0f}mm dari lipatan tengah (paras kolar), jalur condong {SLANT_DEG:.0f}°"),
             ("Logo", "Terus di bawah bendera pada kedua-dua tali, atas panel krim"),
             ("Hujung", "30mm setiap hujung masuk ke tab kulit PU hijau (#7E9435) dijahit"),
             ("Aksesori", "Cangkuk lobster besi warna emas + pemegang kad PVC"),
             ("Emboss", "Logo Azzuha (tanpa tulisan bawah) di-emboss pada tab kulit, lebar ~17mm"),
             ("Kuantiti", "______ PCS")]
    yy = zy + 2
    for a, c in specs:
        b.append(T(sx, yy + 6, a.upper(), 4, 700, "#76963A"))
        b.append(T(sx + 26, yy + 6, c, 4.4, 400, "#333"))
        yy += 10
    sw = [("Latar", P["bg"]), ("Bunga putih", P["white"]), ("Biru tua", P["navy"]), ("Biru muda", P["blue"]),
          ("Pic", P["peach"]), ("Pic cerah", P["peach_l"]), ("Batang krim", P["cream"]), ("Tab kulit", P["leather"]),
          ("Logo hijau", "#76963A"), ("Logo kelabu", "#555555"), ("Merah bendera", "#CC0001"), ("Biru bendera", "#010066"),
          ("Kuning bendera", "#FFCC00")]
    swx = 900
    b.append(T(swx, zy, "WARNA (HEX)", 5, 700, "#222"))
    for i, (n, c) in enumerate(sw):
        yy = zy + 5 + i * 9
        b.append(f'<rect x="{swx}" y="{yy}" width="12" height="6.5" fill="{c}" stroke="#bbb" stroke-width="0.2"/>')
        b.append(T(swx + 15, yy + 4.8, f"{n}  {c.upper()}", 3.8))
    b.append(T(ox, H_ - 8, "Nota kepada pencetak: sila hantar proof warna sebelum produksi. Logo dalam fail adalah vektor.", 3.6, 400, "#888"))
    return svgdoc(W_, H_, "".join(b)), W_, H_


def artwork(side, bleed=2.0):
    w, h = W_STRIP + 2 * bleed, H + 2 * bleed
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}mm" height="{h}mm" viewBox="{-bleed} {-bleed} {w} {h}">'
           f'{doc_defs()}{strip(side, "", bleed)}</svg>')
    return svg, w, h


hero()
closeup()
svg, w, h = layout_sheet()
S = 3.5
jobs.append({"in": write("layout_png", page(svg.replace(f'width="{w}" height="{h}"', f'width="{w*S}" height="{h*S}"', 1), w*S, h*S)),
             "out": f"{OUT}/presentation/02_Layout_Reka_Bentuk.png", "w": int(w*S), "h": int(h*S), "scale": 1})
d = f"{OUT}/print"
mm_svg = svg.replace(f'width="{w}" height="{h}"', f'width="{w}mm" height="{h}mm"', 1)
open(f"{d}/Azzuha_Lanyard_Layout.svg", "w").write(mm_svg)
jobs.append({"in": write("layout", page(mm_svg, w, h, "mm")), "out": f"{WORK}/p_1.pdf", "w": w, "h": h, "unit": "mm"})
for i, side in enumerate(("front", "back")):
    svg, w, h = artwork(side)
    nm = "Depan" if side == "front" else "Belakang"
    open(f"{d}/Azzuha_Lanyard_{nm}_1000x25mm.svg", "w").write(svg)
    pth = write(f"art{side}", page(svg, w, h, "mm", P["bg"]))
    jobs.append({"in": pth, "out": f"{WORK}/p_{i+2}.pdf", "w": w, "h": h, "unit": "mm"})
    jobs.append({"in": pth, "out": f"{d}/Azzuha_Lanyard_{nm}_300dpi.png", "w": w, "h": h, "unit": "mm", "scale": 3.125})
json.dump(jobs, open(f"{WORK}/jobs.json", "w"), indent=1)
print(len(jobs), "jobs")
