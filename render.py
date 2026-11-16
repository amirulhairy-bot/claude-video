"""Velto Coffee @ HPPKS 2026 — vertical promo video renderer.

Renders 1080x1920 frames with PIL and pipes them to ffmpeg.
Usage: python3 render.py <uploads_dir> <out.mp4>
"""
import math
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

UP = sys.argv[1]
OUT = sys.argv[2]
W, H, FPS = 1080, 1920, 30

SRC_VIDEO = os.path.join(UP, "1cc5abb0-IMG_8991.mov")
IMG1 = os.path.join(UP, "a6133739-image.jpg")   # team chatting
IMG2 = os.path.join(UP, "3346fbce-image.jpg")   # team posing
IMG3 = os.path.join(UP, "b7e24ab1-image.jpg")   # RM8 sign
POSTER = os.path.join(UP, "4ca251de-image.jpg")
LOGO = os.path.join(UP, "f52d71b9-image.png")

NAVY = (13, 37, 67)
CREAM = (243, 227, 204)
GOLD = (214, 176, 112)
WHITE = (255, 255, 255)

SERIF = "/usr/share/fonts/truetype/crosextra/Caladea-Bold.ttf"
SANS_B = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
SANS_SB = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
SANS_M = "/usr/share/fonts/opentype/inter/Inter-Medium.otf"

_fonts = {}


def font(path, size):
    k = (path, size)
    if k not in _fonts:
        _fonts[k] = ImageFont.truetype(path, size)
    return _fonts[k]


def ease_out(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3


def ease_io(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


# ---------- text sprites ----------
_sprites = {}


def text_sprite(text, path, size, color, shadow=True, tracking=0):
    k = (text, path, size, color, shadow, tracking)
    if k in _sprites:
        return _sprites[k]
    f = font(path, size)
    if tracking:
        widths = [f.getlength(c) for c in text]
        tw = int(sum(widths) + tracking * (len(text) - 1)) + 4
    else:
        tw = int(f.getlength(text)) + 4
    asc, desc = f.getmetrics()
    th = asc + desc
    pad = 30
    img = Image.new("RGBA", (tw + pad * 2, th + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    def draw(dr, fill, ox=0, oy=0):
        if tracking:
            x = pad + ox
            for c, w_ in zip(text, widths):
                dr.text((x, pad + oy), c, font=f, fill=fill)
                x += w_ + tracking
        else:
            dr.text((pad + ox, pad + oy), text, font=f, fill=fill)

    if shadow:
        sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
        draw(ImageDraw.Draw(sh), (0, 0, 0, 170), 0, 4)
        sh = sh.filter(ImageFilter.GaussianBlur(10))
        img = Image.alpha_composite(img, sh)
        d = ImageDraw.Draw(img)
    draw(d, color + (255,))
    _sprites[k] = (img, pad)
    return _sprites[k]


def put(frame, sprite, cx, y, alpha=1.0, align="center", dy=0, scale=1.0):
    """Paste text sprite. y is the top of the text (excluding padding)."""
    if alpha <= 0:
        return
    img, pad = sprite
    if scale != 1.0:
        img = img.resize((max(1, int(img.width * scale)), max(1, int(img.height * scale))), Image.LANCZOS)
        pad = int(pad * scale)
    if alpha < 1:
        a = img.getchannel("A").point(lambda v: int(v * alpha))
        img = img.copy()
        img.putalpha(a)
    if align == "center":
        x = int(cx - img.width / 2)
    else:
        x = int(cx - pad)
    frame.alpha_composite(img, (x, int(y - pad + dy)))


def anim_line(frame, sprite, cx, y, t, start, align="center", end=None):
    """Slide up + fade in at `start`, optional fade out at `end`."""
    p = ease_out((t - start) / 0.45)
    a = p
    if end is not None:
        a *= 1 - ease_io((t - end) / 0.3)
    put(frame, sprite, cx, y, alpha=a, align=align, dy=(1 - p) * 40)


def pill(frame, text, cx, y, t, start, fg=NAVY, bg=GOLD, size=34):
    p = ease_out((t - start) / 0.4)
    if p <= 0:
        return
    f = font(SANS_B, size)
    sp = text_sprite(text, SANS_B, size, fg, shadow=False, tracking=3)
    w_ = sp[0].width - 2 * sp[1] + 56
    h_ = size + 34
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    x0 = cx - w_ / 2
    d.rounded_rectangle((x0, y, x0 + w_, y + h_), radius=h_ // 2, fill=bg + (int(255 * p),))
    frame.alpha_composite(layer)
    put(frame, sp, cx, y + (h_ - size * 1.21) / 2, alpha=p)


# ---------- overlays ----------
def gradient(top_alpha, bottom_alpha, start, end):
    arr = np.zeros((H, W, 4), dtype=np.uint8)
    arr[..., 0:3] = (6, 14, 28)
    ys = np.arange(H)
    a = np.zeros(H)
    # top darkening
    a = np.maximum(a, top_alpha * np.clip(1 - ys / start, 0, 1) ** 1.5)
    # bottom darkening
    a = np.maximum(a, bottom_alpha * np.clip((ys - end) / (H - end), 0, 1) ** 1.2)
    arr[..., 3] = (a * 255).astype(np.uint8)[:, None]
    return Image.fromarray(arr, "RGBA")


GRAD = gradient(0.75, 0.92, 520, 980)
GRAD_HOOK = gradient(0.55, 0.85, 700, 900)
_band = np.zeros((H, W, 4), dtype=np.uint8)
_band[..., 0:3] = (6, 14, 28)
_ys = np.arange(H)
_band[..., 3] = (150 * np.exp(-((_ys - 760) / 260.0) ** 2)).astype(np.uint8)[:, None]
GRAD_HOOK = Image.alpha_composite(GRAD_HOOK, Image.fromarray(_band, "RGBA"))


def vignette_dark(img, amount):
    if amount <= 0:
        return img
    ov = Image.new("RGBA", img.size, (6, 14, 28, int(255 * amount)))
    return Image.alpha_composite(img, ov)


# ---------- sources ----------
def load_video_frames():
    cmd = [
        "ffmpeg", "-v", "error", "-i", SRC_VIDEO,
        "-vf", f"fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-",
    ]
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    n = len(raw) // (W * H * 3)
    arr = np.frombuffer(raw, dtype=np.uint8)[: n * W * H * 3].reshape(n, H, W, 3)
    return arr


def kb_frame(src, t, dur, r0, r1):
    """Ken Burns: interpolate crop rect r=(cx,cy,height) in source coords (9:16 crop)."""
    p = ease_io(t / dur)
    cx = r0[0] + (r1[0] - r0[0]) * p
    cy = r0[1] + (r1[1] - r0[1]) * p
    ch = r0[2] + (r1[2] - r0[2]) * p
    cw = ch * W / H
    box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
    return src.transform((W, H), Image.EXTENT, box, Image.BILINEAR).convert("RGBA")


def brand_tag(frame, alpha=1.0):
    sp = text_sprite("VELTO COFFEE", SANS_B, 30, CREAM, tracking=8)
    put(frame, sp, W / 2, 110, alpha=alpha)


def step_tag(frame, label, t, start=0.15):
    p = ease_out((t - start) / 0.4)
    if p <= 0:
        return
    sp = text_sprite(label, SANS_B, 30, NAVY, shadow=False, tracking=4)
    w_ = sp[0].width - 2 * sp[1] + 48
    h_ = 62
    y = 1262 + (1 - p) * 30
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(layer).rounded_rectangle((90, y, 90 + w_, y + h_), radius=h_ // 2, fill=GOLD + (int(255 * p),))
    frame.alpha_composite(layer)
    put(frame, sp, 90 + 24, y + (h_ - 30 * 1.21) / 2, alpha=p, align="left")


# ---------- scenes ----------
VID = None
IM1 = IM2 = IM3 = None
POSTER_IMG = POSTER_BG = None
POSTER_MASK = None
POSTER_OFF = (0, 0)
LOGO_IMG = None


def draw_poster(fr, t, cx, cy, base, start, dur):
    """Glass poster card with entrance, slow drift and one sheen sweep."""
    p = ease_out((t - start) / 0.6)
    if p <= 0:
        return
    s = base * (0.9 + 0.1 * p + 0.03 * ease_io(t / dur))
    card = POSTER_IMG
    sp_t = (t - start - 0.8) / 1.1
    if 0 < sp_t < 1:
        card = card.copy()
        ph_, pw_ = POSTER_MASK.shape
        yy = np.arange(ph_)[:, None]
        xx = np.arange(pw_)[None, :]
        centre = -500 + sp_t * (pw_ + ph_ * 0.5 + 1000)
        d = (xx + yy * 0.5) - centre
        band = np.exp(-(d / 70.0) ** 2) * 120 + np.exp(-((d - 130) / 22.0) ** 2) * 70
        sheen = np.zeros((ph_, pw_, 4), dtype=np.uint8)
        sheen[..., :3] = 255
        sheen[..., 3] = np.clip(band * POSTER_MASK, 0, 255).astype(np.uint8)
        card.alpha_composite(Image.fromarray(sheen, "RGBA"), POSTER_OFF)
    cw, ch = int(card.width * s), int(card.height * s)
    c = card.resize((cw, ch), Image.LANCZOS)
    if p < 1:
        c.putalpha(c.getchannel("A").point(lambda v: int(v * p)))
    fr.alpha_composite(c, (int(cx - cw / 2), int(cy - ch / 2 + (1 - p) * 60)))


# Uniform typography: one font, one colour, one size (RM2,500 slightly larger).
TXT_FONT = SANS_SB
TXT_SIZE = 50
BIG_SIZE = 66
LINE = 76
LEFT = 70


def say(fr, text, y, t, start, align="left", big=False):
    sp = text_sprite(text, TXT_FONT, BIG_SIZE if big else TXT_SIZE, WHITE)
    x = LEFT if align == "left" else W / 2
    anim_line(fr, sp, x, y, t, start, align=align)


def say_block(fr, lines, t, start=0.25, gap=0.3, bottom=1790):
    """Left-aligned block anchored to the bottom of the frame."""
    y = bottom - LINE * len(lines)
    for k, ln in enumerate(lines):
        say(fr, ln, y + k * LINE, t, start + k * gap)


def scene_hook(t, dur):
    i = min(int(t * FPS), len(VID) - 1)
    fr = Image.fromarray(VID[i]).convert("RGBA")
    fr = Image.alpha_composite(fr, GRAD_HOOK)
    say(fr, "Event pertama kami.", 250, t, 0.0, align="center")
    say(fr, "Dapat sales", 326, t, 0.15, align="center")
    p = ease_out((t - 0.2) / 1.8)
    val = int(round(2500 * p / 10.0)) * 10
    pop = 1.0
    if 2.0 < t < 2.4:
        pop = 1 + 0.08 * math.sin((t - 2.0) / 0.4 * math.pi)
    put(fr, text_sprite(f"RM{val:,}", TXT_FONT, BIG_SIZE, WHITE), W / 2, 402,
        alpha=ease_out((t - 0.2) / 0.25), scale=pop)
    say(fr, "dalam 1 hari.", 494, t, 0.6, align="center")
    draw_poster(fr, t, W / 2, 1060, 0.74, 0.9, dur)
    say(fr, "Hujan. Penat. Tapi jadi jugak.", 1560, t, 2.3, align="center")
    say(fr, "Jom kami cerita  \u2193", 1636, t, 3.0, align="center")
    return fr


def scene_booth(t, dur):
    # 1932x2576 source; 9:16 crop height 2576 -> width 1449
    fr = kb_frame(IM1, t, dur, (966, 1330, 2500), (966, 1420, 2150))
    fr = Image.alpha_composite(fr, GRAD)
    say_block(fr, [
        "Petang tu, siap setup je,",
        "hujan turun.",
        "Lantai basah, orang lari berteduh.",
        "Dalam hati: \u201cAlamak, habislah kita...\u201d",
    ], t)
    return fr


def scene_team(t, dur):
    fr = kb_frame(IM2, t, dur, (900, 1450, 2100), (820, 1350, 2500))
    fr = Image.alpha_composite(fr, GRAD)
    say_block(fr, [
        "Tapi kami tak give up.",
        "Senyum je, terus grind coffee.",
        "Penat? Memang penat.",
        "Tapi customer mula datang satu-satu.",
    ], t)
    return fr


def scene_offer(t, dur):
    # push from the whole booth into the RM8 sign on the right
    fr = kb_frame(IM3, t, dur, (1100, 1500, 2400), (1580, 1850, 1350))
    fr = Image.alpha_composite(fr, GRAD)
    say_block(fr, [
        "Malam tu, customer datang",
        "tak putus-putus.",
        "Americano RM8 laku keras.",
        "Tangan lenguh, tapi",
        "hujung-hujung berbaloi.",
    ], t, gap=0.28)
    return fr


def scene_event(t, dur):
    fr = POSTER_BG.copy()
    brand_tag(fr)
    step_tag_y = 210
    anim_line(fr, text_sprite("MULA-MULA", SANS_B, 36, GOLD, tracking=5), W / 2, step_tag_y + 40, t, 0.1)
    anim_line(fr, text_sprite("Dapat slot kat HPPKS.", SERIF, 84, CREAM), W / 2, 350, t, 0.25)
    draw_poster(fr, t, W / 2, 990, 1.0, 0.2, dur)
    anim_line(fr, text_sprite("Kali pertama kami masuk event besar.", SANS_SB, 42, WHITE), W / 2, 1560, t, 0.9)
    anim_line(fr, text_sprite("14–15 Nov · Dataran Kemerdekaan Shah Alam", SANS_M, 36, CREAM), W / 2, 1625, t, 1.15)
    anim_line(fr, text_sprite("Jujur? Berdebar gila.", SANS_B, 46, GOLD), W / 2, 1720, t, 1.6)
    return fr


def scene_logo(t, dur):
    fr = Image.new("RGBA", (W, H), NAVY + (255,))
    p = ease_out(t / 0.8)
    s = 0.92 + 0.08 * p + 0.03 * ease_io(t / dur)
    lw = int(900 * s)
    lg = LOGO_IMG.resize((lw, lw), Image.LANCZOS)
    if p < 1:
        lg.putalpha(lg.getchannel("A").point(lambda v: int(v * p)))
    fr.alpha_composite(lg, (int(W / 2 - lw / 2), int(620 - lw / 2)))
    say(fr, "Tutup kedai, kira sales...", 1110, t, 0.5, align="center")
    say(fr, "Dapat sales", 1186, t, 1.0, align="center")
    say(fr, "RM2,500 sehari.", 1262, t, 1.3, align="center", big=True)
    say(fr, "Penat. Hujan. Tapi berbaloi.", 1370, t, 1.9, align="center")
    say(fr, "Terima kasih Shah Alam!", 1446, t, 2.4, align="center")
    say(fr, "Terima kasih MP Sepang", 1522, t, 2.8, align="center")
    say(fr, "bagi kami peluang ni.", 1598, t, 3.0, align="center")
    say(fr, "Follow, jumpa di event seterusnya.", 1674, t, 3.5, align="center")
    return fr


def main():
    global VID, IM1, IM2, IM3, POSTER_IMG, POSTER_BG, LOGO_IMG
    VID = load_video_frames()
    IM1 = Image.open(IMG1).convert("RGB")
    IM2 = Image.open(IMG2).convert("RGB")
    IM3 = Image.open(IMG3).convert("RGB")

    # poster on a frosted-glass pane
    global POSTER_MASK, POSTER_OFF
    pst = Image.open(POSTER).convert("RGB").crop((3, 3, 406, 486))
    pw = 700
    ph = int(pst.height * pw / pst.width)
    pst = pst.resize((pw, ph), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 80, 2))
    pad, sh = 42, 70
    gw, gh = pw + 2 * pad, ph + 2 * pad
    card = Image.new("RGBA", (gw + 2 * sh, gh + 2 * sh), (0, 0, 0, 0))
    # soft shadow
    shadow = Image.new("RGBA", card.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((sh, sh + 20, sh + gw, sh + gh + 20), radius=56, fill=(0, 0, 0, 150))
    card = Image.alpha_composite(card, shadow.filter(ImageFilter.GaussianBlur(30)))
    # frosted pane: translucent white with vertical sheen
    pane = np.zeros((gh, gw, 4), dtype=np.float32)
    pane[..., :3] = 255
    yy = np.linspace(0, 1, gh)[:, None]
    xx = np.linspace(0, 1, gw)[None, :]
    pane[..., 3] = 34 + 40 * np.clip(1 - (yy * 0.8 + xx * 0.4), 0, 1)
    pane_img = Image.fromarray(pane.astype(np.uint8), "RGBA")
    pmask = Image.new("L", (gw, gh), 0)
    ImageDraw.Draw(pmask).rounded_rectangle((0, 0, gw - 1, gh - 1), radius=56, fill=255)
    pane_img.putalpha(Image.fromarray((np.array(pmask) / 255.0 * np.array(pane_img.getchannel("A"))).astype(np.uint8)))
    card.alpha_composite(pane_img, (sh, sh))
    # glass edge: bright top-left rim fading to subtle bottom-right
    rim = Image.new("RGBA", (gw, gh), (0, 0, 0, 0))
    ImageDraw.Draw(rim).rounded_rectangle((1, 1, gw - 2, gh - 2), radius=55, outline=(255, 255, 255, 255), width=3)
    ra = np.array(rim.getchannel("A")).astype(np.float32) * np.clip(0.85 - 0.6 * (yy * 0.6 + xx * 0.4), 0.18, 1)
    rim.putalpha(Image.fromarray(ra.astype(np.uint8)))
    card.alpha_composite(rim, (sh, sh))
    # poster inside with inner shadow
    inner = Image.new("RGBA", card.size, (0, 0, 0, 0))
    ImageDraw.Draw(inner).rounded_rectangle((sh + pad, sh + pad + 8, sh + pad + pw, sh + pad + ph + 8), radius=30, fill=(0, 0, 0, 120))
    card = Image.alpha_composite(card, inner.filter(ImageFilter.GaussianBlur(12)))
    mask = Image.new("L", (pw, ph), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, pw - 1, ph - 1), radius=30, fill=255)
    pst_rgba = pst.convert("RGBA")
    pst_rgba.putalpha(mask)
    card.alpha_composite(pst_rgba, (sh + pad, sh + pad))
    # static glass reflection over the poster (diagonal gloss)
    gloss = np.zeros((ph, pw, 4), dtype=np.float32)
    gloss[..., :3] = 255
    py = np.linspace(0, 1, ph)[:, None]
    px = np.linspace(0, 1, pw)[None, :]
    diag = px * 0.55 + py
    gloss[..., 3] = np.where(diag < 0.42, 46 * (1 - diag / 0.42) + 18, 0) * (np.array(mask) / 255.0)
    card.alpha_composite(Image.fromarray(gloss.astype(np.uint8), "RGBA"), (sh + pad, sh + pad))
    POSTER_IMG = card
    POSTER_MASK = np.array(mask, dtype=np.float32) / 255.0
    POSTER_OFF = (sh + pad, sh + pad)

    bg = Image.open(IMG3).convert("RGB")
    bg = bg.transform((W, H), Image.EXTENT, (240, 0, 240 + 2576 * W / H, 2576), Image.BILINEAR)
    bg = bg.filter(ImageFilter.GaussianBlur(40)).convert("RGBA")
    POSTER_BG = Image.alpha_composite(bg, Image.new("RGBA", (W, H), NAVY + (175,)))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((-200, 420, 520, 1140), fill=GOLD + (110,))
    gd.ellipse((600, 900, 1350, 1650), fill=(70, 120, 210, 120))
    POSTER_BG = Image.alpha_composite(POSTER_BG, glow.filter(ImageFilter.GaussianBlur(120)))

    LOGO_IMG = Image.open(LOGO).convert("RGBA")

    hook_dur = (len(VID) - 1) / FPS
    scenes = [
        (scene_hook, hook_dur),
        (scene_booth, 4.6),
        (scene_team, 4.6),
        (scene_offer, 4.6),
        (scene_logo, 6.4),
    ]
    XF = 0.3  # crossfade seconds
    starts = []
    t0 = 0.0
    for fn, d in scenes:
        starts.append(t0)
        t0 += d - XF
    total = t0 + XF
    nframes = int(total * FPS)
    print(f"total {total:.2f}s, {nframes} frames", flush=True)

    if os.environ.get("PREVIEW"):
        for T in map(float, os.environ["PREVIEW"].split(",")):
            for i, (fn, d) in enumerate(scenes):
                if 0 <= T - starts[i] < d:
                    fn(T - starts[i], d).convert("RGB").resize((540, 960)).save(f"{OUT}_{T:05.2f}.jpg")
                    break
        return
    ff = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
         "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
         OUT + ".silent.mp4"],
        stdin=subprocess.PIPE,
    )
    for n in range(nframes):
        T = n / FPS
        active = [(i, T - starts[i]) for i, (fn, d) in enumerate(scenes) if 0 <= T - starts[i] < d]
        if not active:
            active = [(len(scenes) - 1, T - starts[-1])]
        frames = []
        for i, lt in active[:2]:
            frames.append((i, lt, scenes[i][0](lt, scenes[i][1])))
        if len(frames) == 2:
            (_, _, a), (_, lt, b) = frames
            k = ease_io(lt / XF)
            img = Image.blend(a, b, k)
        else:
            img = frames[0][2]
        ff.stdin.write(img.convert("RGB").tobytes())
        if n % 60 == 0:
            print(f"frame {n}/{nframes}", flush=True)
    ff.stdin.close()
    ff.wait()
    with open(OUT + ".dur", "w") as fh:
        fh.write(f"{total:.3f}\n{hook_dur:.3f}\n")


if __name__ == "__main__":
    main()
