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


def step_tag(frame, num, t, start=0.15):
    sp = text_sprite(num, SERIF, 120, GOLD)
    anim_line(frame, sp, 90, 1210, t, start, align="left")


# ---------- scenes ----------
VID = None
IM1 = IM2 = IM3 = None
POSTER_IMG = POSTER_BG = None
LOGO_IMG = None


def scene_hook(t, dur):
    i = min(int(t * FPS), len(VID) - 1)
    fr = Image.fromarray(VID[i]).convert("RGBA")
    fr = Image.alpha_composite(fr, GRAD_HOOK)
    # kicker
    pill(fr, "HPPKS 2026 · SHAH ALAM", W / 2, 250, t, 0.05, size=32)
    # counter
    p = ease_out((t - 0.2) / 1.8)
    val = int(round(2500 * p / 10.0)) * 10
    num = f"RM{val:,}"
    pop = 1.0
    if 2.0 < t < 2.4:
        pop = 1 + 0.08 * math.sin((t - 2.0) / 0.4 * math.pi)
    sp = text_sprite(num, SERIF, 230, CREAM)
    put(fr, sp, W / 2, 560, alpha=ease_out(t / 0.25), scale=pop)
    anim_line(fr, text_sprite("dalam 1 hari.", SERIF, 110, WHITE), W / 2, 840, t, 0.6)
    anim_line(fr, text_sprite("Dari satu booth kopi kecil.", SANS_SB, 50, WHITE), W / 2, 1480, t, 2.3)
    anim_line(fr, text_sprite("Ini rahsia kami  ↓", SANS_B, 54, GOLD), W / 2, 1560, t, 3.0)
    return fr


def scene_booth(t, dur):
    # 1932x2576 source; 9:16 crop height 2576 -> width 1449
    fr = kb_frame(IM1, t, dur, (966, 1330, 2500), (966, 1420, 2150))
    fr = Image.alpha_composite(fr, GRAD)
    brand_tag(fr)
    step_tag(fr, "01", t)
    anim_line(fr, text_sprite("Booth yang orang", SERIF, 92, CREAM), 90, 1360, t, 0.3, align="left")
    anim_line(fr, text_sprite("nampak dari jauh.", SERIF, 92, CREAM), 90, 1465, t, 0.45, align="left")
    anim_line(fr, text_sprite("Lampu hangat. Logo di setiap sudut.", SANS_M, 44, WHITE), 90, 1610, t, 1.1, align="left")
    anim_line(fr, text_sprite("Branding konsisten = orang percaya.", SANS_M, 44, WHITE), 90, 1670, t, 1.4, align="left")
    return fr


def scene_team(t, dur):
    fr = kb_frame(IM2, t, dur, (900, 1450, 2100), (820, 1350, 2500))
    fr = Image.alpha_composite(fr, GRAD)
    brand_tag(fr)
    step_tag(fr, "02", t)
    anim_line(fr, text_sprite("Team yang senyum,", SERIF, 86, CREAM), 90, 1360, t, 0.3, align="left")
    anim_line(fr, text_sprite("customer datang balik.", SERIF, 86, CREAM), 90, 1465, t, 0.45, align="left")
    anim_line(fr, text_sprite("Orang beli kopi. Tapi mereka ingat", SANS_M, 44, WHITE), 90, 1610, t, 1.1, align="left")
    anim_line(fr, text_sprite("layanan yang buat hari mereka.", SANS_M, 44, WHITE), 90, 1670, t, 1.3, align="left")
    return fr


def scene_offer(t, dur):
    # push from the whole booth into the RM8 sign on the right
    fr = kb_frame(IM3, t, dur, (1100, 1500, 2400), (1580, 1850, 1350))
    fr = Image.alpha_composite(fr, GRAD)
    brand_tag(fr)
    step_tag(fr, "03", t)
    anim_line(fr, text_sprite("Satu tawaran,", SERIF, 92, CREAM), 90, 1360, t, 0.3, align="left")
    anim_line(fr, text_sprite("jelas & berani.", SERIF, 92, CREAM), 90, 1465, t, 0.45, align="left")
    anim_line(fr, text_sprite("Americano premium. RM8 je.", SANS_B, 50, GOLD), 90, 1610, t, 1.2, align="left")
    anim_line(fr, text_sprite("Tak payah fikir panjang — terus order.", SANS_M, 42, WHITE), 90, 1680, t, 1.6, align="left")
    return fr


def scene_event(t, dur):
    fr = POSTER_BG.copy()
    brand_tag(fr)
    step_tag_y = 210
    anim_line(fr, text_sprite("04", SERIF, 110, GOLD), W / 2, step_tag_y, t, 0.1)
    anim_line(fr, text_sprite("Pilih event yang tepat.", SERIF, 84, CREAM), W / 2, 350, t, 0.25)
    # poster card
    p = ease_out((t - 0.2) / 0.6)
    s = 0.9 + 0.1 * p + 0.03 * ease_io(t / dur)
    card = POSTER_IMG
    cw, ch = int(card.width * s), int(card.height * s)
    c = card.resize((cw, ch), Image.LANCZOS)
    if p < 1:
        a = c.getchannel("A").point(lambda v: int(v * p))
        c.putalpha(a)
    fr.alpha_composite(c, (int(W / 2 - cw / 2), int(1010 - ch / 2 + (1 - p) * 60)))
    anim_line(fr, text_sprite("Hari Penjaja & Peniaga Kecil Selangor", SANS_SB, 42, WHITE), W / 2, 1560, t, 0.9)
    anim_line(fr, text_sprite("14–15 Nov · Dataran Kemerdekaan Shah Alam", SANS_M, 38, CREAM), W / 2, 1625, t, 1.15)
    anim_line(fr, text_sprite("Ribuan pengunjung. Kami ada di depan mereka.", SANS_B, 40, GOLD), W / 2, 1720, t, 1.6)
    return fr


def scene_logo(t, dur):
    fr = Image.new("RGBA", (W, H), NAVY + (255,))
    p = ease_out(t / 0.8)
    s = 0.92 + 0.08 * p + 0.03 * ease_io(t / dur)
    lw = int(980 * s)
    lg = LOGO_IMG.resize((lw, lw), Image.LANCZOS)
    if p < 1:
        lg.putalpha(lg.getchannel("A").point(lambda v: int(v * p)))
    fr.alpha_composite(lg, (int(W / 2 - lw / 2), int(760 - lw / 2)))
    anim_line(fr, text_sprite("RM2,500 sehari.", SERIF, 104, CREAM), W / 2, 1330, t, 0.7)
    anim_line(fr, text_sprite("Ini baru permulaan.", SERIF, 80, GOLD), W / 2, 1460, t, 1.0)
    anim_line(fr, text_sprite("Terima kasih Shah Alam!", SANS_SB, 44, WHITE), W / 2, 1620, t, 1.6)
    pill(fr, "FOLLOW UNTUK LOKASI SETERUSNYA", W / 2, 1720, t, 2.0, size=32)
    return fr


def main():
    global VID, IM1, IM2, IM3, POSTER_IMG, POSTER_BG, LOGO_IMG
    VID = load_video_frames()
    IM1 = Image.open(IMG1).convert("RGB")
    IM2 = Image.open(IMG2).convert("RGB")
    IM3 = Image.open(IMG3).convert("RGB")

    # poster card: crop out the social overlay, round corners, add shadow
    pst = Image.open(POSTER).convert("RGB").crop((3, 3, 406, 486))
    pw = 760
    ph = int(pst.height * pw / pst.width)
    pst = pst.resize((pw, ph), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 80, 2))
    mask = Image.new("L", (pw, ph), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, pw - 1, ph - 1), radius=36, fill=255)
    card = Image.new("RGBA", (pw + 120, ph + 120), (0, 0, 0, 0))
    shadow = Image.new("RGBA", card.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((60, 75, 60 + pw, 75 + ph), radius=36, fill=(0, 0, 0, 200))
    card = Image.alpha_composite(card, shadow.filter(ImageFilter.GaussianBlur(25)))
    pst_rgba = pst.convert("RGBA")
    pst_rgba.putalpha(mask)
    card.alpha_composite(pst_rgba, (60, 60))
    ring = Image.new("RGBA", card.size, (0, 0, 0, 0))
    ImageDraw.Draw(ring).rounded_rectangle((58, 58, 62 + pw, 62 + ph), radius=38, outline=GOLD + (255,), width=4)
    POSTER_IMG = Image.alpha_composite(card, ring)

    bg = Image.open(IMG3).convert("RGB")
    bg = bg.transform((W, H), Image.EXTENT, (240, 0, 240 + 2576 * W / H, 2576), Image.BILINEAR)
    bg = bg.filter(ImageFilter.GaussianBlur(40)).convert("RGBA")
    POSTER_BG = Image.alpha_composite(bg, Image.new("RGBA", (W, H), NAVY + (190,)))

    LOGO_IMG = Image.open(LOGO).convert("RGBA")

    hook_dur = (len(VID) - 1) / FPS
    scenes = [
        (scene_hook, hook_dur),
        (scene_booth, 4.2),
        (scene_team, 4.2),
        (scene_offer, 4.6),
        (scene_event, 4.6),
        (scene_logo, 4.8),
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
