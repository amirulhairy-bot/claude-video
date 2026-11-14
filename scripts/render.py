import json, subprocess, sys, math, os
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions

S = os.path.dirname(os.path.abspath(__file__))
SRC = f"{S}/raw/IMG_3520.MOV"
W, H, FPS = 1080, 1920, 30
T0, T1 = 1.80, 45.20
PREVIEW = len(sys.argv) > 1  # optional "a,b" source-time range for quick preview
if PREVIEW:
    T0, T1 = map(float, sys.argv[1].split(","))
OUT = f"{S}/video_only.mp4" if not PREVIEW else f"{S}/preview.mp4"

F_ANTON = f"{S}/fonts/Anton.ttf"
F_PLAY = f"{S}/fonts/Playfair.ttf"
F_INTER_B = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"
F_INTER_BL = "/usr/share/fonts/opentype/inter/Inter-Black.otf"
F_INTER_SB = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
F_EMOJI = "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf"

LAV = (182, 150, 255)
LAV_D = (168, 85, 160)
LOGO = Image.open(f"{S}/logo.png")
RED = (255, 40, 80)

# ---------------------------------------------------------------- sprites
def font(p, s): return ImageFont.truetype(p, s)

def text_sprite(lines, fnt, fill=(255, 255, 255), glow=None, glow_r=18, glow_k=2,
                shadow=True, spacing=0.92, stroke=0, stroke_fill=(0, 0, 0)):
    """lines: list of (text, font, fill) or str. Returns RGBA np array (premultiplied-free)."""
    if isinstance(lines, str): lines = [lines]
    items = []
    for ln in lines:
        if isinstance(ln, str): ln = (ln, fnt, fill)
        t, f, c = ln
        bb = f.getbbox(t, stroke_width=stroke)
        items.append((t, f, c, bb))
    pad = 90
    widths = [bb[2] - bb[0] for *_, bb in items]
    heights = [int((bb[3] - bb[1])) for *_, bb in items]
    tw = max(widths) + pad * 2
    th = sum(heights) + 20 * (len(items) - 1) + pad * 2
    img = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    mask = Image.new("L", (tw, th), 0)
    col = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    y = pad
    dm, dc = ImageDraw.Draw(mask), ImageDraw.Draw(col)
    for (t, f, c, bb), h in zip(items, heights):
        x = (tw - (bb[2] - bb[0])) // 2 - bb[0]
        dm.text((x, y - bb[1]), t, font=f, fill=255, stroke_width=stroke)
        dc.text((x, y - bb[1]), t, font=f, fill=c + (255,), stroke_width=stroke, stroke_fill=stroke_fill + (255,) if stroke else None)
        y += int(h * spacing) + 20
    if shadow:
        sh = mask.filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * 0.55))
        shl = Image.new("RGBA", (tw, th), (0, 0, 0, 0)); shl.putalpha(sh)
        img = Image.alpha_composite(img, shl.transform(shl.size, Image.AFFINE, (1, 0, -4, 0, 1, -10)))
    if glow is not None:
        for r, k in ((glow_r * 2.2, 0.8), (glow_r, 1.0), (glow_r * 0.35, 1.0)):
            g = mask.filter(ImageFilter.GaussianBlur(r)).point(lambda v, k=k: min(255, int(v * k * glow_k)))
            gl = Image.new("RGBA", (tw, th), glow + (0,)); gl.putalpha(g)
            img = Image.alpha_composite(img, gl)
    img = Image.alpha_composite(img, col)
    return np.array(img)

def emoji_img(ch, size):
    f = ImageFont.truetype(F_EMOJI, 109)
    im = Image.new("RGBA", (160, 160), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((10, 10), ch, font=f, embedded_color=True)
    im = im.crop(im.getbbox())
    return im.resize((size, int(size * im.height / im.width)), Image.LANCZOS)

def card_sprite(emoji, label, sub=None, w=None):
    fl = font(F_INTER_BL, 50); fs = font(F_INTER_SB, 30)
    lw = fl.getbbox(label)[2]
    sw = fs.getbbox(sub)[2] if sub else 0
    e = emoji_img(emoji, 92)
    cw = w or max(lw, sw) + 80
    ch = 100 + e.height + 70 + (44 if sub else 0)
    pad = 60
    im = Image.new("RGBA", (cw + pad * 2, ch + pad * 2), (0, 0, 0, 0))
    # outer white glow
    gm = Image.new("L", im.size, 0)
    ImageDraw.Draw(gm).rounded_rectangle((pad, pad, pad + cw, pad + ch), 42, fill=255)
    glow = Image.new("RGBA", im.size, (255, 255, 255, 0)); glow.putalpha(gm.filter(ImageFilter.GaussianBlur(26)).point(lambda v: int(v * 0.9)))
    im = Image.alpha_composite(im, glow)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((pad, pad, pad + cw, pad + ch), 42, fill=(255, 255, 255, 238), outline=(255, 255, 255, 255), width=4)
    # lavender accent pill
    d.rounded_rectangle((pad + cw // 2 - 70, pad + ch - 30, pad + cw // 2 + 70, pad + ch - 20), 5, fill=LAV_D + (255,))
    im.alpha_composite(e, (pad + (cw - e.width) // 2, pad + 40))
    y = pad + 40 + e.height + 22
    d.text((pad + (cw - lw) // 2, y), label, font=fl, fill=(28, 22, 40, 255))
    if sub:
        d.text((pad + (cw - sw) // 2, y + 62), sub, font=fs, fill=(110, 96, 140, 255))
    return np.array(im)

def cta_sprite():
    cw, ch, pad = 900, 190, 60
    im = Image.new("RGBA", (cw + pad * 2, ch + pad * 2), (0, 0, 0, 0))
    gm = Image.new("L", im.size, 0)
    ImageDraw.Draw(gm).rounded_rectangle((pad, pad, pad + cw, pad + ch), 95, fill=255)
    glow = Image.new("RGBA", im.size, LAV + (0,)); glow.putalpha(gm.filter(ImageFilter.GaussianBlur(30)))
    im = Image.alpha_composite(im, glow)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((pad, pad, pad + cw, pad + ch), 95, fill=(255, 255, 255, 245))
    cx, cy, r = pad + 95, pad + ch // 2, 66
    ic = LOGO.crop((0, 0, LOGO.width, int(LOGO.height * 0.70))); ic.thumbnail((128, 128), Image.LANCZOS)
    im.alpha_composite(ic, (cx - ic.width // 2, cy - ic.height // 2))
    d.text((pad + 190, pad + 34), "Lavender Confinement Care", font=font(F_INTER_BL, 46), fill=(28, 22, 40, 255))
    d.text((pad + 190, pad + 108), "Jangan lupa tag kita!  ✓ Herbal Cream", font=font(F_INTER_SB, 34), fill=(110, 90, 160, 255))
    return np.array(im)

def logo_sprite(width, icon_only=False, plate=True):
    lg = LOGO
    if icon_only: lg = lg.crop((0, 0, lg.width, int(lg.height * 0.70)))
    lg = lg.resize((width, int(width * lg.height / lg.width)), Image.LANCZOS)
    pad = 70
    im = Image.new("RGBA", (lg.width + pad * 2, lg.height + pad * 2), (0, 0, 0, 0))
    if plate:
        m = Image.new("L", im.size, 0); m.paste(lg.split()[3], (pad, pad))
        m = m.filter(ImageFilter.MaxFilter(15)).filter(ImageFilter.GaussianBlur(22)).point(lambda v: min(255, int(v * 1.6)))
        g = Image.new("RGBA", im.size, (255, 255, 255, 0)); g.putalpha(m); im = Image.alpha_composite(im, g)
    im.alpha_composite(lg, (pad, pad))
    return np.array(im)

def chroma_sprite(lines, fnt):
    base = text_sprite(lines, fnt, shadow=True)
    a = base[..., 3]
    out = np.zeros_like(base)
    h, w = a.shape
    def shift(arr, dx): return np.roll(arr, dx, axis=1)
    cyan = np.zeros_like(base); cyan[..., 0] = 0; cyan[..., 1] = 230; cyan[..., 2] = 255; cyan[..., 3] = (shift(a, -10) * 0.85).astype(np.uint8)
    pink = np.zeros_like(base); pink[..., 0] = 255; pink[..., 1] = 40; pink[..., 2] = 120; pink[..., 3] = (shift(a, 10) * 0.85).astype(np.uint8)
    out = over(over(pink, cyan), base)
    return out

def over(a, b):
    """b over a, both RGBA uint8 same size."""
    af = a.astype(np.float32) / 255; bf = b.astype(np.float32) / 255
    ab = bf[..., 3:4]; aa = af[..., 3:4]
    oa = ab + aa * (1 - ab)
    oc = (bf[..., :3] * ab + af[..., :3] * aa * (1 - ab)) / np.maximum(oa, 1e-6)
    return (np.concatenate([oc, oa], -1) * 255).astype(np.uint8)

# ---------------------------------------------------------------- easing
def clamp(x, a=0, b=1): return max(a, min(b, x))
def ease_out(x): return 1 - (1 - clamp(x)) ** 3
def ease_back(x):
    x = clamp(x); c1 = 1.9; c3 = c1 + 1
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2

# ---------------------------------------------------------------- elements
class El:
    def __init__(self, sprite, t0, t1, x, y, layer="back", anim="title", scale=1.0, float_amp=0):
        self.sp, self.t0, self.t1, self.x, self.y = sprite, t0, t1, x, y
        self.layer, self.anim, self.scale, self.fa = layer, anim, scale, float_amp

    def state(self, t):
        if t < self.t0 or t > self.t1 + 0.25: return None
        a_in = t - self.t0; a_out = self.t1 - t
        alpha, sc, blur, dy = 1.0, 1.0, 0, 0
        if self.anim == "title":
            k = ease_out(a_in / 0.28)
            sc = 1.28 - 0.28 * k; alpha = clamp(a_in / 0.18); blur = int((1 - k) * 22)
            sc += 0.03 * clamp(a_in / 2.5)  # slow drift
        elif self.anim == "pop":
            sc = max(0.01, ease_back(a_in / 0.38)); alpha = clamp(a_in / 0.12)
            dy = self.fa * math.sin((t - self.t0) * 2.2)
        elif self.anim == "none":
            alpha = clamp(a_in / 0.4)
        elif self.anim == "rise":
            k = ease_out(a_in / 0.45); dy = (1 - k) * 160; alpha = clamp(a_in / 0.25)
        if a_out < 0:
            o = clamp(-a_out / 0.22); alpha *= 1 - o; sc *= 1 + 0.12 * o
            if self.anim == "pop": sc *= 1 - 0.8 * o
        return alpha, sc * self.scale, blur, dy

def blit(dst, sp, cx, cy, alpha, sc, blur):
    if alpha <= 0.01: return
    if abs(sc - 1) > 0.005:
        sp = cv2.resize(sp, None, fx=sc, fy=sc, interpolation=cv2.INTER_LINEAR)
    if blur > 1:
        k = blur * 2 + 1; sp = cv2.GaussianBlur(sp, (k, k), 0)
    h, w = sp.shape[:2]
    x0, y0 = int(cx - w / 2), int(cy - h / 2)
    xa, ya, xb, yb = max(0, x0), max(0, y0), min(W, x0 + w), min(H, y0 + h)
    if xa >= xb or ya >= yb: return
    s = sp[ya - y0:yb - y0, xa - x0:xb - x0].astype(np.float32)
    a = s[..., 3:4] / 255 * alpha
    d = dst[ya:yb, xa:xb]
    # sprite is RGB, dst float RGBA layer (premultiplied colour, alpha)
    d[..., :3] = s[..., :3][..., ::-1] * a + d[..., :3] * (1 - a)
    d[..., 3:4] = a + d[..., 3:4] * (1 - a)

# ---------------------------------------------------------------- timeline
fA = font(F_ANTON, 250)
els = []
def T(*a, **k): els.append(El(*a, **k))

T(text_sprite("Assalamualaikum", font(F_PLAY, 96), glow=LAV, glow_r=14, glow_k=1.0), 2.18, 2.95, 540, 760)
T(text_sprite(["MOMMIES", ("di luar sana", font(F_PLAY, 100), (255, 255, 255))], font(F_ANTON, 205), fill=(255, 255, 255), glow=LAV_D, glow_r=20, glow_k=1.3), 2.95, 5.6, 540, 810)
T(text_sprite("Acik nak sarankan", font(F_INTER_BL, 78), glow=None), 6.98, 8.40, 540, 560, anim="rise")
T(text_sprite("TERBAIK", font(F_ANTON, 300), fill=(246, 238, 255), glow=(170, 120, 255), glow_r=26, glow_k=2.2), 8.46, 9.55, 540, 840)
T(text_sprite([("di mana-mana", font(F_PLAY, 150), (255, 255, 255)), ("kita berada", font(F_PLAY, 96), LAV)], None), 9.58, 11.55, 540, 810)

cards = [("🧑", "Dewasa", None, 12.66, 230, 600), ("🧒", "Kanak-kanak", None, 13.58, 850, 540),
         ("🤱", "Ibu Pantang", None, 14.88, 205, 1010), ("👩", "Ibu-ibu", "biasa pun boleh", 16.02, 875, 960)]
for i, (e, l, sub, t0, x, y) in enumerate(cards):
    T(card_sprite(e, l, sub, w=330), t0, 18.9 + i * 0.06, x, y, layer="front", anim="pop", scale=0.95, float_amp=8)

T(text_sprite([("Confinement Care", font(F_INTER_SB, 64), (255, 255, 255)), ("LAVENDER", font(F_PLAY, 185), (255, 255, 255))], None, glow=LAV_D, glow_r=16, glow_k=1.0), 22.55, 24.45, 540, 770)
T(chroma_sprite(["KE", "MANA-MANA"], font(F_ANTON, 205)), 24.52, 26.80, 540, 760)
T(text_sprite([("banyak", font(F_INTER_BL, 80), (255, 255, 255)), ("BENEFIT", font(F_ANTON, 280), (255, 70, 100))], None, glow=RED, glow_r=22, glow_k=1.6), 27.75, 29.55, 540, 780)

sym = [("🤕", "Pening", 30.76, 225, 640), ("😣", "Perut Kembung", 31.20, 850, 580), ("🥵", "Panas Badan", 32.30, 215, 1020)]
for i, (e, l, t0, x, y) in enumerate(sym):
    T(card_sprite(e, l, None, w=360 if len(l) > 8 else 300), t0, 33.85 + i * 0.06, x, y, layer="front", anim="pop", scale=0.95, float_amp=8)

T(text_sprite("GUNALAH", font(F_ANTON, 290), fill=(255, 255, 255), glow=LAV_D, glow_r=22, glow_k=1.5), 34.26, 35.45, 540, 820)
T(text_sprite("CARILAH", font(F_ANTON, 290), fill=(255, 255, 255), glow=(0, 0, 0), glow_r=18, glow_k=0.8), 35.48, 36.62, 540, 820)
T(text_sprite("BELILAH", font(F_ANTON, 290), fill=(246, 238, 255), glow=(170, 120, 255), glow_r=26, glow_k=2.2), 36.66, 37.74, 540, 820)
T(text_sprite([("sentiasa", font(F_PLAY, 170), (255, 255, 255)), ("di mana-mana", font(F_PLAY, 96), LAV)], None, glow=(30, 10, 60), glow_r=16, glow_k=0.8), 37.76, 39.68, 540, 800)
T(text_sprite([("jangan lupa", font(F_INTER_BL, 80), (255, 255, 255)), ("TAG KITA", font(F_ANTON, 270), (255, 70, 100))], None, glow=RED, glow_r=22, glow_k=1.6), 40.70, 42.65, 540, 780)
T(logo_sprite(400), 42.70, T1 + 1, 540, 530)
T(logo_sprite(165, plate=True), T0, 42.6, 940, 185, layer="front", anim="none")
T(cta_sprite(), 41.75, T1 + 1, 540, 1640, layer="front", anim="rise")

# camera: (t0, t1, s0, s1, focus)
FACE, TUBES = (560, 980), (690, 1240)
CAM = [(0, 5.9, 1.00, 1.06, FACE), (5.9, 9.58, 1.18, 1.23, FACE), (9.58, 11.6, 1.02, 1.06, FACE),
       (11.6, 19.0, 1.04, 1.09, FACE), (19.0, 22.5, 1.70, 1.85, TUBES), (22.5, 26.86, 1.10, 1.15, FACE),
       (26.86, 29.58, 1.26, 1.31, FACE), (29.58, 33.92, 1.02, 1.07, FACE), (33.92, 37.76, 1.20, 1.26, FACE),
       (37.76, 40.7, 1.05, 1.10, FACE), (40.7, 42.7, 1.22, 1.27, FACE), (42.7, 99, 1.00, 1.05, FACE)]
PUNCH = [e.t0 for e in els if e.layer == "back"]

def camera(t):
    for a, b, s0, s1, f in CAM:
        if a <= t < b:
            k = (t - a) / max(0.01, min(b, T1) - a)
            s = s0 + (s1 - s0) * k
            break
    for p in PUNCH:
        if 0 <= t - p < 0.6: s *= 1 + 0.045 * math.exp(-(t - p) * 9)
    return s, f

def apply_cam(fr, s, f):
    cw, ch = W / s, H / s
    x0 = clamp(f[0] - cw / 2, 0, W - cw); y0 = clamp(f[1] - ch / 2, 0, H - ch)
    M = np.array([[s, 0, -x0 * s], [0, s, -y0 * s]], np.float32)
    return cv2.warpAffine(fr, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

# ---------------------------------------------------------------- captions
words = json.load(open(f"{S}/words_l.json"))
fix = {"kedewasa,": "dewasa,", "bersalimnya": "bersalin pun", "Labenda": "Lavender", "Kita,": "kita,"}
ws = []
for w in words:
    t = fix.get(w["w"], w["w"])
    if t.startswith("-") and ws: ws[-1]["w"] += t; ws[-1]["e"] = w["e"]; continue
    if ws and ws[-1]["w"] == "Ke" and t == "panasan": ws[-1]["w"] = "Kepanasan"; ws[-1]["e"] = w["e"]; continue
    ws.append(dict(w=t, s=w["s"], e=w["e"]))
for w in ws:
    if w["w"].lower() == "mami-mami": w["w"] = "Mommies"

chunks, cur = [], []
for i, w in enumerate(ws):
    cur.append(w)
    nxt = ws[i + 1] if i + 1 < len(ws) else None
    if len(cur) >= 3 or w["w"][-1] in ",." or not nxt or nxt["s"] - w["e"] > 0.25 or nxt["w"][0].isupper():
        chunks.append(cur); cur = []
EMPH = {"terbaiklah", "pantang", "lavender", "benefitnya", "pening,", "kembung", "kepanasan", "gunalah", "carilah,", "belilah", "sentiasa", "tag", "confinement", "care", "mana-mana"}
fc = font(F_INTER_B, 60)
cap_cache = {}
def caption_sprite(ci, k):
    key = (ci, k)
    if key in cap_cache: return cap_cache[key]
    ch = chunks[ci]
    parts = []
    for j, w in enumerate(ch[:k + 1]):
        col = LAV if w["w"].lower() in EMPH else (255, 255, 255)
        parts.append((w["w"].lower() if j else w["w"][0].upper() + w["w"][1:].lower(), col))
    full = " ".join(w["w"] for w in ch)
    tw = fc.getbbox(full)[2] + 80
    im = Image.new("RGBA", (tw, 140), (0, 0, 0, 0))
    m = Image.new("L", im.size, 0)
    x = 40 + (fc.getbbox(full)[2] - fc.getbbox(" ".join(p for p, _ in parts))[2]) // 2
    d, dm = ImageDraw.Draw(im), ImageDraw.Draw(m)
    xx = x
    for p, c in parts:
        dm.text((xx, 30), p, font=fc, fill=255, stroke_width=3)
        xx += fc.getbbox(p + " ")[2]
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); sh.putalpha(m.filter(ImageFilter.GaussianBlur(8)).point(lambda v: int(v * 0.85)))
    im = Image.alpha_composite(im, sh)
    d = ImageDraw.Draw(im); xx = x
    for p, c in parts:
        d.text((xx, 30), p, font=fc, fill=c + (255,), stroke_width=2, stroke_fill=(20, 10, 30, 255))
        xx += fc.getbbox(p + " ")[2]
    cap_cache[key] = np.array(im)
    return cap_cache[key]

def caption(t):
    for ci, ch in enumerate(chunks):
        end = min(ch[-1]["e"] + 0.25, chunks[ci + 1][0]["s"] if ci + 1 < len(chunks) else 99)
        if ch[0]["s"] <= t < end:
            k = max(j for j, w in enumerate(ch) if w["s"] <= t)
            pop = 1 + 0.12 * math.exp(-(t - ch[k]["s"]) * 14)
            return caption_sprite(ci, k), pop
    return None

# ---------------------------------------------------------------- grade
yy = np.linspace(0, 1, H)[:, None]
xx = np.linspace(-1, 1, W)[None, :]
vign = (1 - 0.10 * np.clip((xx ** 2 + ((yy - 0.5) * 2) ** 2) - 0.6, 0, 1)).astype(np.float32)
GRADE = vign[..., None]
_x = np.arange(256) / 255
_y = _x ** 0.78                                   # exposure lift (~+0.6 stop in mids)
_y = _y + 0.10 * np.sin(np.pi * _y) * (_y - 0.5)   # gentle S for punch
_y = 0.02 + 0.97 * _y                              # soft blacks, protected whites
lut = np.clip(_y * 255, 0, 255).astype(np.uint8)

def grade(fr):
    fr = cv2.LUT(fr, lut)
    hsv = cv2.cvtColor(fr, cv2.COLOR_BGR2HSV).astype(np.float32)
    sat = hsv[..., 1]; hsv[..., 1] = np.clip(sat + (255 - sat) * 0.10 * (sat < 160), 0, 255)  # vibrance
    fr = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR).astype(np.float32)
    fr[..., 0] *= 0.985; fr[..., 2] *= 1.015  # touch of warmth
    bloom = cv2.GaussianBlur(np.clip(fr - 190, 0, 255), (0, 0), 18)
    fr = fr + bloom * 0.35                     # soft highlight glow
    return np.clip(fr * GRADE, 0, 255)

# ---------------------------------------------------------------- segmentation
seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=BaseOptions(model_asset_path=f"{S}/selfie.tflite"), output_confidence_masks=True))
prev_mask = None
def person_mask(fr_bgr):
    global prev_mask
    small = cv2.resize(fr_bgr, (540, 960))
    r = seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(small[..., ::-1])))
    m = 1 - np.squeeze(r.confidence_masks[0].numpy_view())
    m = cv2.resize(m, (540, 960))
    b = (m > 0.5).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(b)
    if n > 1:
        big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])
        keep = (lab == big).astype(np.uint8)
        keep = cv2.dilate(keep, np.ones((15, 15), np.uint8))
        m = m * keep
    if prev_mask is not None: m = 0.55 * m + 0.45 * prev_mask
    prev_mask = m
    m = cv2.resize(m, (W, H), interpolation=cv2.INTER_LINEAR)
    m = cv2.GaussianBlur(np.clip((m - 0.35) / 0.3, 0, 1), (9, 9), 0)
    return m[..., None].astype(np.float32)

# ---------------------------------------------------------------- main loop
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", str(T0), "-i", SRC, "-t", str(T1 - T0),
                        "-vf", f"scale={W}:{H},fps={FPS}", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                        "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", OUT], stdin=subprocess.PIPE)
fi = 0
while True:
    raw = dec.stdout.read(W * H * 3)
    if len(raw) < W * H * 3: break
    t = T0 + fi / FPS
    fr = np.frombuffer(raw, np.uint8).reshape(H, W, 3)
    s, f = camera(t)
    fr = apply_cam(fr, s, f)
    base = grade(fr)
    back = [e for e in els if e.layer == "back" and e.state(t)]
    if back:
        mask = person_mask(fr)
        lay = np.zeros((H, W, 4), np.float32)
        for e in back:
            a, sc, bl, dy = e.state(t); blit(lay, e.sp, e.x, e.y + dy, a, sc, bl)
        a = lay[..., 3:4] * (1 - mask)
        base = lay[..., :3] * a + base * (1 - a)
    else:
        prev_mask = None
    front = [e for e in els if e.layer == "front" and e.state(t)]
    cap = caption(t)
    if front or cap:
        lay = np.zeros((H, W, 4), np.float32)
        for e in front:
            a, sc, bl, dy = e.state(t); blit(lay, e.sp, e.x, e.y + dy, a, sc, bl)
        if cap: blit(lay, cap[0], 540, 1190, 1.0, cap[1], 0)
        base = lay[..., :3] * lay[..., 3:4] + base * (1 - lay[..., 3:4])
    enc.stdin.write(np.clip(base, 0, 255).astype(np.uint8).tobytes())
    fi += 1
    if fi % 150 == 0: print(f"{t:.1f}s", flush=True)
enc.stdin.close(); enc.wait()
print("frames", fi)
