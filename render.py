"""Render APR (Amsyar Pack Rental) promo: captions, logo, motion graphics, CTA end card.

Output 1080x1920 @24fps. All overlays stay inside the IG Reels / TikTok safe zone:
  top 220px, bottom 480px, left 60px, right 140px (platform UI lives outside these).
Usage: python3 render.py SRC_VIDEO LOGO_PNG FONT_DIR OUT_MP4 CONFIG_JSON
"""
import math
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

import json

SRC, LOGO, FONTDIR, OUT, CFG_PATH = sys.argv[1:6]
CFG = json.load(open(CFG_PATH))
W, H, FPS = 1080, 1920, 24
VID_DUR = 10.0
END_DUR = 3.6
TOTAL = VID_DUR + END_DUR
NFRAMES = int(round(TOTAL * FPS))

SAFE_L, SAFE_R, SAFE_T, SAFE_B = 60, W - 140, 220, H - 480
SAFE_CX = (SAFE_L + SAFE_R) // 2  # centre of the usable column

BLUE = (67, 115, 176)
BLUE_DK = (30, 58, 98)
WHITE = (255, 255, 255)
INK = (12, 22, 40)


def font(size, weight=900, italic=True):
    f = ImageFont.truetype(f"{FONTDIR}/{'monti' if italic else 'mont'}.ttf", size)
    f.set_variation_by_axes([weight])
    return f


# ---------- easing ----------
def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def ease_out(t):
    t = clamp(t)
    return 1 - (1 - t) ** 3


def ease_in_out(t):
    t = clamp(t)
    return 3 * t * t - 2 * t * t * t


def back_out(t, s=1.9):
    t = clamp(t) - 1
    return t * t * ((s + 1) * t + s) + 1


def prog(t, start, dur):
    return clamp((t - start) / dur)


# ---------- captions (word timings from transcription; brand name corrected) ----------
WORDS = [tuple(w) for w in CFG["words"]]
CHUNKS = CFG["chunks"]
KEYWORDS = set(CFG["keywords"])
CAP_FONT = font(80)
CAP_Y = CFG["cap_y"]  # caption centre line — above the bottom UI band


def chunk_span(ci):
    idx = CHUNKS[ci]
    start = WORDS[idx[0]][0]
    end = WORDS[CHUNKS[ci + 1][0]][0] if ci + 1 < len(CHUNKS) else VID_DUR
    return start, end


def render_caption(ci, t):
    """Return an RGBA layer for chunk ci at time t (word-by-word highlight)."""
    idx = CHUNKS[ci]
    words = [WORDS[i][2] for i in idx]
    space = 6
    PAD = 24
    widths = [CAP_FONT.getbbox(w)[2] - CAP_FONT.getbbox(w)[0] for w in words]
    asc, desc = CAP_FONT.getmetrics()
    # wrap into lines within safe width
    maxw = SAFE_R - SAFE_L - 40
    lines, cur, curw = [], [], 0
    for k, w in enumerate(widths):
        add = w + (space if cur else 0) + PAD
        if cur and curw + add > maxw:
            lines.append(cur)
            cur, curw = [], 0
            add = w + PAD
        cur.append(k)
        curw += add
    lines.append(cur)
    line_h = asc + desc + 14
    lw = max(sum(widths[k] + PAD for k in ln) + space * (len(ln) - 1) for ln in lines)
    layer = Image.new("RGBA", (lw + 60, line_h * len(lines) + 60), (0, 0, 0, 0))
    shadow = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    ds = ImageDraw.Draw(shadow)
    for li, ln in enumerate(lines):
        row_w = sum(widths[k] + PAD for k in ln) + space * (len(ln) - 1)
        x = (layer.width - row_w) // 2
        y = 30 + li * line_h
        for k in ln:
            word = words[k]
            ws, we, _ = WORDS[idx[k]]
            active = ws <= t < we
            spoken = t >= ws
            bw = widths[k] + PAD
            if active:
                p = back_out(prog(t, ws, 0.12))
                pad = int(6 * p)
                d.rounded_rectangle([x - pad, y - 4 - pad, x + bw + pad, y + asc + desc + 4 + pad],
                                    radius=16, fill=BLUE + (255,))
            col = WHITE
            alpha = 255
            if word.strip(",?") in KEYWORDS and not active and spoken:
                col = (186, 214, 250)
            tx = x + PAD // 2 - CAP_FONT.getbbox(word)[0]
            ds.text((tx + 5, y + 7), word, font=CAP_FONT, fill=(0, 0, 0, 170))
            d.text((tx, y), word, font=CAP_FONT, fill=col + (alpha,),
                   stroke_width=5, stroke_fill=INK + (alpha,))
            x += bw + space
    shadow = shadow.filter(ImageFilter.GaussianBlur(6))
    return Image.alpha_composite(shadow, layer)


def paste_scaled(base, layer, cx, cy, scale=1.0, alpha=1.0):
    if alpha <= 0.001 or scale <= 0.01:
        return
    if abs(scale - 1) > 1e-3:
        layer = layer.resize((max(1, int(layer.width * scale)), max(1, int(layer.height * scale))),
                             Image.LANCZOS)
    if alpha < 0.999:
        a = layer.getchannel("A").point(lambda v: int(v * alpha))
        layer = layer.copy()
        layer.putalpha(a)
    base.alpha_composite(layer, (int(cx - layer.width / 2), int(cy - layer.height / 2)))


# ---------- assets ----------
LOGO_IMG = Image.open(LOGO).convert("RGBA")


def logo_scaled(width):
    h = int(LOGO_IMG.height * width / LOGO_IMG.width)
    return LOGO_IMG.resize((width, h), Image.LANCZOS)


def parallelogram(w, h, skew, fill):
    im = Image.new("RGBA", (w + skew, h), (0, 0, 0, 0))
    ImageDraw.Draw(im).polygon([(skew, 0), (w + skew, 0), (w, h), (0, h)], fill=fill)
    return im


# Logo badge (persistent, top-left inside safe zone)
BADGE_LOGO = logo_scaled(220)
BADGE = parallelogram(BADGE_LOGO.width + 70, BADGE_LOGO.height + 34, 18, BLUE + (235,))
BADGE.alpha_composite(BADGE_LOGO, (44, 17))
BADGE_POS = (SAFE_L + 10, SAFE_T + 40)

# Product callout tag
TAG_F1 = font(30, 800)
TAG_F2 = font(46, 900)


def product_tag():
    l1, l2 = CFG["tag"]["line1"], CFG["tag"]["line2"]
    w = max(TAG_F2.getbbox(l2)[2], TAG_F1.getbbox(l1)[2]) + 60
    h = 126
    im = Image.new("RGBA", (w + 24, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.polygon([(20, 0), (w + 20, 0), (w, h), (0, h)], fill=WHITE + (255,))
    d.polygon([(20, 0), (34, 0), (14, h), (0, h)], fill=BLUE + (255,))
    d.text((44, 14), l1, font=TAG_F1, fill=BLUE + (255,))
    d.text((40, 52), l2, font=TAG_F2, fill=INK + (255,))
    return im


TAG = product_tag()

# In-video CTA chip
CTA_F = font(40, 900)


def cta_chip(text, bg=WHITE, fg=BLUE):
    tw = CTA_F.getbbox(text)[2]
    w, h = tw + 130, 92
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=h // 2, fill=bg + (255,))
    d.text((38, (h - 48) // 2), text, font=CTA_F, fill=fg + (255,))
    # arrow
    ax, ay = w - 66, h // 2
    d.ellipse([ax - 4, ay - 26, ax + 48, ay + 26], fill=fg + (255,))
    d.polygon([(ax + 12, ay - 12), (ax + 32, ay), (ax + 12, ay + 12)], fill=bg + (255,))
    return im


CHIP_TEMPAH = cta_chip(CFG["chip"]["text"])


def draw_ring(frame, t, rg):
    """Pulsing highlight ring on the product (brand white/blue)."""
    cx, cy, r = rg["x"], rg["y"], rg["r"]
    fade = clamp(prog(t, rg["start"], 0.25)) * (1 - prog(t, rg["end"] - 0.25, 0.25))
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    grow = back_out(prog(t, rg["start"], 0.4))
    rr = r * grow
    d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=WHITE + (int(255 * fade),), width=7)
    for k in range(2):
        ph = ((t - rg["start"]) / 0.8 + k * 0.5) % 1
        r2 = rr + 10 + 70 * ph
        d.ellipse([cx - r2, cy - r2, cx + r2, cy + r2],
                  outline=BLUE + (int(220 * (1 - ph) * fade),), width=6)
    frame.alpha_composite(layer)


def speed_lines(t, y, alpha=1.0):
    """Brand 'speed slash' accent echoing the APR logo cuts."""
    layer = Image.new("RGBA", (W, 60), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for i, (len_, off) in enumerate([(200, 0), (120, 40), (80, 70)]):
        x = int((t * 900 + off * 7) % (W + 300)) - 300
        d.polygon([(x + 14, i * 18), (x + len_ + 14, i * 18), (x + len_, i * 18 + 8), (x, i * 18 + 8)],
                  fill=(255, 255, 255, int(160 * alpha)))
    return layer


# ---------- end card ----------
END_LOGO = logo_scaled(640)
EC_F1 = font(44, 800)
EC_F2 = font(36, 700, italic=False)
FOLLOW_F = font(34, 900)


def follow_chip():
    text = "FOLLOW"
    tw = FOLLOW_F.getbbox(text)[2]
    w, h = tw + 110, 76
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=h // 2, outline=WHITE + (255,), width=4)
    cx, cy = 40, h // 2  # plus icon
    d.rectangle([cx - 13, cy - 3, cx + 13, cy + 3], fill=WHITE + (255,))
    d.rectangle([cx - 3, cy - 13, cx + 3, cy + 13], fill=WHITE + (255,))
    d.text((66, (h - 40) // 2), text, font=FOLLOW_F, fill=WHITE + (255,))
    return im


FOLLOW = follow_chip()


def end_card(t_local, last_frame):
    """t_local: seconds since end card start."""
    zoom = 1.06 + 0.04 * t_local / END_DUR
    bg = last_frame.resize((int(W * zoom), int(H * zoom)), Image.BILINEAR)
    bg = bg.crop(((bg.width - W) // 2, (bg.height - H) // 2, (bg.width - W) // 2 + W, (bg.height - H) // 2 + H))
    bg = bg.filter(ImageFilter.GaussianBlur(18)).convert("RGBA")
    tint = Image.new("RGBA", (W, H), BLUE + (int(225 * ease_out(prog(t_local, 0, 0.35))),))
    frame = Image.alpha_composite(bg, tint)

    # diagonal accent bands
    acc = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    da = ImageDraw.Draw(acc)
    p = ease_out(prog(t_local, 0.05, 0.5))
    for i, (yy, th, a) in enumerate([(420, 26, 60), (1480, 40, 45), (1540, 14, 70)]):
        x0 = int(-W + p * W * 1.0) + i * 60
        da.polygon([(x0, yy + 120), (x0 + W * 2, yy - 260), (x0 + W * 2, yy - 260 + th), (x0, yy + 120 + th)],
                   fill=(255, 255, 255, a))
    frame.alpha_composite(acc)

    cy = 760
    # logo: skewed slide + settle
    pl = back_out(prog(t_local, 0.15, 0.55), 1.4)
    paste_scaled(frame, END_LOGO, SAFE_CX - (1 - pl) * 400, cy, 0.9 + 0.1 * pl, clamp(pl * 1.5))
    # rule line
    pr = ease_out(prog(t_local, 0.45, 0.4))
    if pr > 0:
        d = ImageDraw.Draw(frame)
        half = int(220 * pr)
        d.rectangle([SAFE_CX - half, cy + 120, SAFE_CX + half, cy + 126], fill=WHITE + (255,))
    # taglines
    for k, (txt, f, yy) in enumerate([(CFG["end_title"], EC_F1, cy + 190),
                                      (CFG["end_sub"], EC_F2, cy + 250)]):
        pk = ease_out(prog(t_local, 0.6 + 0.12 * k, 0.4))
        if pk <= 0:
            continue
        tw = f.getbbox(txt)[2]
        lay = Image.new("RGBA", (tw + 20, 70), (0, 0, 0, 0))
        ImageDraw.Draw(lay).text((10, 6), txt, font=f, fill=WHITE + (255,))
        paste_scaled(frame, lay, SAFE_CX, yy + (1 - pk) * 30, 1, pk)
    # CTA button with pulse
    pc = back_out(prog(t_local, 1.0, 0.45))
    if pc > 0:
        pulse = 1 + 0.045 * math.sin(max(0, t_local - 1.45) * 2 * math.pi * 1.4) * (t_local > 1.45)
        chip = cta_chip("TEMPAH SEKARANG", bg=WHITE, fg=BLUE)
        # glow ring
        ring_t = (t_local - 1.45) % 0.72 if t_local > 1.45 else -1
        if ring_t >= 0:
            rp = ring_t / 0.72
            ring = Image.new("RGBA", (chip.width + 80, chip.height + 80), (0, 0, 0, 0))
            g = int(40 * rp)
            ImageDraw.Draw(ring).rounded_rectangle([40 - g, 40 - g, 40 + chip.width + g, 40 + chip.height + g],
                                                   radius=chip.height // 2 + g, outline=(255, 255, 255, int(200 * (1 - rp))),
                                                   width=5)
            frame.alpha_composite(ring, (SAFE_CX - ring.width // 2, cy + 400 - ring.height // 2))
        paste_scaled(frame, chip, SAFE_CX, cy + 400, pc * pulse)
    # follow line
    pf = ease_out(prog(t_local, 1.35, 0.4))
    if pf > 0:
        txt = "untuk lebih tips & promo"
        tw = EC_F2.getbbox(txt)[2]
        row = Image.new("RGBA", (FOLLOW.width + 20 + tw, FOLLOW.height), (0, 0, 0, 0))
        row.alpha_composite(FOLLOW, (0, 0))
        ImageDraw.Draw(row).text((FOLLOW.width + 20, 16), txt, font=EC_F2, fill=WHITE + (235,))
        paste_scaled(frame, row, SAFE_CX, cy + 530 + (1 - pf) * 30, 1, pf)
    return frame


# ---------- transition wipe (brand parallelogram sweep) ----------
def wipe(frame, t):
    """Blue slash wipe centred on VID_DUR."""
    p = (t - (VID_DUR - 0.25)) / 0.5
    if not 0 <= p <= 1:
        return
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    sk = 600
    x = int(-W - sk + ease_in_out(p) * (2 * W + 2 * sk))
    d.polygon([(x + sk, 0), (x + sk + W, 0), (x + W, H), (x, H)], fill=BLUE + (255,))
    d.polygon([(x + sk + W, 0), (x + sk + W + 50, 0), (x + W + 50, H), (x + W, H)], fill=WHITE + (255,))
    frame.alpha_composite(layer)


# ---------- main loop ----------
def main():
    dec = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", SRC, "-vf",
         f"scale={W}:{H}:flags=lanczos,fps={FPS}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        stdout=subprocess.PIPE)
    enc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
         "-i", SRC,
         "-f", "lavfi", "-t", "0.6", "-i",
         "anoisesrc=color=pink:amplitude=0.6,highpass=f=400,lowpass=f=5000,afade=t=in:d=0.25,afade=t=out:st=0.3:d=0.3",
         "-filter_complex",
         f"[1:a]atrim=0:{VID_DUR},afade=t=out:st={VID_DUR - 0.4}:d=0.4,apad=whole_dur={TOTAL}[a0];"
         f"[2:a]volume=0.25,adelay={int((VID_DUR - 0.3) * 1000)}|{int((VID_DUR - 0.3) * 1000)},apad=whole_dur={TOTAL}[w];"
         "[a0][w]amix=inputs=2:normalize=0,alimiter=limit=0.95[a]",
         "-map", "0:v", "-map", "[a]", "-t", str(TOTAL),
         "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-profile:v", "high",
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", OUT],
        stdin=subprocess.PIPE)

    fsize = W * H * 3
    last = None
    cache = {}
    for n in range(NFRAMES):
        t = n / FPS
        if t < VID_DUR:
            buf = dec.stdout.read(fsize)
            if len(buf) == fsize:
                last = Image.frombytes("RGB", (W, H), buf)
            frame = last.convert("RGBA")

            # subtle bottom gradient for caption legibility
            if "grad" not in cache:
                g = np.zeros((H, W, 4), np.uint8)
                ys = np.arange(H)
                a = np.clip((ys - 1050) / 500, 0, 1) * 150
                g[..., 3] = a[:, None].astype(np.uint8)
                cache["grad"] = Image.fromarray(g)
            frame.alpha_composite(cache["grad"])

            # logo badge: slide in from left
            pb = back_out(prog(t, 0.15, 0.5), 1.3)
            if pb > 0:
                bx = int(BADGE_POS[0] - (1 - pb) * 420)
                b = BADGE
                if pb < 1:
                    b = BADGE.copy()
                    b.putalpha(b.getchannel("A").point(lambda v: int(v * clamp(pb))))
                frame.alpha_composite(b, (bx, BADGE_POS[1]))
                # speed slashes under badge during entrance
                if t < 1.3:
                    frame.alpha_composite(speed_lines(t, 0, 1 - prog(t, 0.8, 0.5)),
                                          (0, BADGE_POS[1] + BADGE.height + 14))

            # product tag (when the product is named)
            TG = CFG["tag"]
            if TG["start"] - 0.05 <= t < TG["end"] + 0.05:
                pt = back_out(prog(t, TG["start"], 0.4))
                out = ease_in_out(prog(t, TG["end"] - 0.25, 0.25))
                tx = SAFE_R - TAG.width // 2 - 10 + (1 - pt) * 300 + out * 400
                ty = TG["y"]
                paste_scaled(frame, TAG, tx, ty, 1, clamp(pt) * (1 - out))
                # pointer line to the box
                pl = ease_out(prog(t, 6.55, 0.35)) * (1 - out)
                if pl > 0 and TG.get("pointer"):
                    d = ImageDraw.Draw(frame)
                    x1 = tx - TAG.width // 2
                    x0 = x1 - 110 * pl
                    y0 = ty + 63 + 90 * pl
                    d.line([(x1 + 10, ty + 63), (x0, y0)], fill=WHITE + (255,), width=6)
                    d.ellipse([x0 - 11, y0 - 11, x0 + 11, y0 + 11], fill=WHITE + (255,),
                              outline=BLUE + (255,), width=5)

            # in-video CTA chip (as brand name is said)
            RG = CFG.get("ring")
            if RG and RG["start"] <= t < RG["end"]:
                draw_ring(frame, t, RG)

            CH = CFG["chip"]
            if CH["start"] - 0.1 <= t < VID_DUR:
                pc = back_out(prog(t, CH["start"], 0.4))
                chip_y = CH["y"]
                paste_scaled(frame, CHIP_TEMPAH, SAFE_CX, chip_y + (1 - clamp(pc)) * 40, pc, clamp(pc * 2))

            # captions
            for ci in range(len(CHUNKS)):
                s, e = chunk_span(ci)
                if s <= t < e:
                    cap = render_caption(ci, t)
                    pin = back_out(prog(t, s, 0.16), 2.2)
                    paste_scaled(frame, cap, SAFE_CX, CAP_Y, 0.75 + 0.25 * pin, clamp(pin * 3))
            wipe(frame, t)
        else:
            frame = end_card(t - VID_DUR, last)
            wipe(frame, t)
        enc.stdin.write(frame.convert("RGB").tobytes())
        if n % 48 == 0:
            print(f"frame {n}/{NFRAMES}", flush=True)
    enc.stdin.close()
    enc.wait()
    dec.stdout.close()
    dec.wait()


if __name__ == "__main__":
    main()
