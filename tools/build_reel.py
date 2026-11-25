"""Build a vertical Reel from an episode folder.

Usage:  python3 tools/build_reel.py episodes/01-bismillah

Episode folder:
  episode.json        scenes: caption, voiceover line, sound effects
  clips/scene1.mp4    (optional) AI clip or image per scene: .mp4/.mov/.png/.jpg
                      missing scenes get a placeholder card
Output: <episode>/out/reel.mp4  (1080x1920, 30fps)
"""
import json, subprocess, sys, wave
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
import sfx as SFX

W, H, FPS, SR = 1080, 1920, 30, SFX.SR
FONT = str(ROOT / "assets/fonts/Fredoka-Bold.ttf")
LOGO = ROOT / "branding/arasy-logo.png"
WMARK = ROOT / "branding/arasy-watermark-white.png"
NAVY, GOLD = (22, 34, 79), (255, 210, 110)


def run(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *map(str, args)], check=True)


def load_audio(path, filters=""):
    """Decode any audio file to float32 mono @ SR (optional ffmpeg -af filters)."""
    cmd = ["ffmpeg", "-v", "error", "-i", str(path)]
    if filters: cmd += ["-af", filters]
    cmd += ["-f", "f32le", "-ac", "1", "-ar", str(SR), "-"]
    return np.frombuffer(subprocess.run(cmd, check=True, capture_output=True).stdout, np.float32)


def tts(text, lang, path):
    if not path.exists():
        from gtts import gTTS
        gTTS(text, lang=lang).save(str(path))


def wrap(draw, text, font, maxw):
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=font) <= maxw: cur = t
        else: lines.append(cur); cur = w
    return lines + [cur]


def caption_png(text, path, highlight=False):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    size = 120 if len(text) < 14 else 92
    f = ImageFont.truetype(FONT, size)
    lines = wrap(d, text, f, W - 140)
    y = 1430 - (len(lines) - 1) * size * 0.55
    for ln in lines:
        d.text((W / 2, y), ln, font=f, anchor="mm", fill=GOLD if highlight else (255, 255, 255),
               stroke_width=12, stroke_fill=NAVY)
        y += size * 1.1
    im.save(path)


def placeholder_png(i, desc, path):
    im = Image.new("RGB", (W, H)); d = ImageDraw.Draw(im)
    top, bot = np.array((47, 79, 154)), np.array(NAVY)
    for y in range(H):
        d.line([(0, y), (W, y)], fill=tuple(int(v) for v in top + (bot - top) * y / H))
    d.text((W / 2, 620), f"ADEGAN {i}", font=ImageFont.truetype(FONT, 110), anchor="mm", fill=GOLD)
    f = ImageFont.truetype(FONT, 64); y = 780
    for ln in wrap(d, desc, f, W - 200):
        d.text((W / 2, y), ln, font=f, anchor="mm", fill=(220, 230, 255)); y += 80
    d.text((W / 2, 1000), "(klip AI akan diletak di sini)", font=ImageFont.truetype(FONT, 44),
           anchor="mm", fill=(150, 165, 210))
    im.save(path)


def find_clip(ep, i):
    for ext in ("mp4", "mov", "webm", "png", "jpg", "jpeg", "webp"):
        p = ep / "clips" / f"scene{i}.{ext}"
        if p.exists(): return p
    return None


def render_scene(src, cap, dur, out):
    is_img = src.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp")
    frames = int(dur * FPS)
    fit = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1"
    if is_img:  # gentle Ken Burns zoom on stills
        base = f"[0]{fit},scale={W*2}:{H*2},zoompan=z='1+0.06*on/{frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s={W}x{H}:fps={FPS}"
        inp = ["-loop", "1", "-framerate", FPS, "-t", dur, "-i", src]
    else:       # loop short clips to fill the scene
        base = f"[0]{fit},fps={FPS}"
        inp = ["-stream_loop", "-1", "-i", src]
    fc = (f"{base},format=rgba[v];"
          f"[1]format=rgba,fade=in:st=0.35:d=0.25:alpha=1[c];"
          f"[2]scale=170:-1,format=rgba,colorchannelmixer=aa=0.8[w];"
          f"[v][c]overlay=0:0[vc];[vc][w]overlay=W-w-40:40,format=yuv420p[o]")
    run(*inp, "-loop", 1, "-t", dur, "-i", cap, "-i", WMARK,
        "-filter_complex", fc, "-map", "[o]", "-t", dur, "-r", FPS,
        "-c:v", "libx264", "-preset", "medium", "-crf", 20, "-an", out)


def render_endcard(dur, tmp, out):
    im = Image.new("RGB", (W, H), NAVY)
    logo = Image.open(LOGO).convert("RGBA").resize((720, 720))
    im.paste(logo, ((W - 720) // 2, 480), logo)
    d = ImageDraw.Draw(im)
    d.text((W / 2, 1330), "Cerita Islamik untuk adik-adik", font=ImageFont.truetype(FONT, 58),
           anchor="mm", fill=(220, 230, 255))
    p = tmp / "endcard.png"; im.save(p)
    run("-loop", 1, "-framerate", FPS, "-t", dur, "-i", p, "-vf",
        f"fade=in:st=0:d=0.5,fade=out:st={dur-0.4}:d=0.4,format=yuv420p",
        "-c:v", "libx264", "-crf", 20, "-r", FPS, out)


def main(ep):
    ep = Path(ep).resolve(); cfg = json.loads((ep / "episode.json").read_text())
    tmp = ep / "build"; out = ep / "out"; tmp.mkdir(exist_ok=True); out.mkdir(exist_ok=True)
    lang = cfg.get("voice_lang", "ms")

    # 1. voiceover per scene -> decide scene lengths
    vos, durs = [], []
    for i, s in enumerate(cfg["scenes"], 1):
        raw = tmp / f"vo{i}.mp3"; tts(s["vo"], lang, raw)
        # narrator: a touch faster & brighter; child line: higher pitch
        pitch = 1.32 if s.get("vo_child") else 1.06
        a = load_audio(raw, f"silenceremove=1:0:-45dB,areverse,silenceremove=1:0:-45dB,areverse,"
                            f"rubberband=pitch={pitch}:tempo=1.08")
        vos.append(a); durs.append(max(cfg["scene_seconds"], len(a) / SR + 1.0))

    # 2. video
    parts = []
    for i, (s, dur) in enumerate(zip(cfg["scenes"], durs), 1):
        src = find_clip(ep, i)
        if src is None:
            src = tmp / f"ph{i}.png"; placeholder_png(i, s["desc"], src)
        cap = tmp / f"cap{i}.png"; caption_png(s["caption"], cap, highlight=s.get("vo_child", False))
        part = tmp / f"part{i}.mp4"; render_scene(src, cap, dur, part); parts.append(part)
        print(f"scene {i}: {dur:.1f}s  {'clip ' + src.name if src.parent.name == 'clips' else 'placeholder'}")
    end = tmp / "endcard.mp4"; render_endcard(cfg["endcard_seconds"], tmp, end); parts.append(end)
    (tmp / "list.txt").write_text("".join(f"file '{p}'\n" for p in parts))
    run("-f", "concat", "-safe", 0, "-i", tmp / "list.txt", "-c", "copy", tmp / "video.mp4")

    # 3. audio mix: voice + sound effects
    total = sum(durs) + cfg["endcard_seconds"]
    mix = np.zeros(int(SR * (total + 1)), np.float32)
    def put(x, t, g=1.0):
        s = int(t * SR); mix[s:s + len(x)] += (x[:len(mix) - s] * g).astype(np.float32)
    t0 = 0.0
    for s, a, dur in zip(cfg["scenes"], vos, durs):
        put(a / (np.abs(a).max() + 1e-9), t0 + 0.4, 0.9)
        for name, off in s.get("sfx", []): put(SFX.ALL[name](), t0 + off, 0.45)
        t0 += dur
    put(SFX.whoosh(), t0 - 0.3, 0.4); put(SFX.ding(), t0 + 0.4, 0.3)
    mix = mix[: int(SR * total)]; mix /= max(1.0, np.abs(mix).max() / 0.95)
    with wave.open(str(tmp / "audio.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((mix * 32767).astype(np.int16).tobytes())

    final = out / "reel.mp4"
    run("-i", tmp / "video.mp4", "-i", tmp / "audio.wav", "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", 48000, "-c:a", "aac", "-b:a", "192k",
        "-ac", 2, "-shortest", "-movflags", "+faststart", final)
    print(f"done: {final}  ({total:.1f}s)")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "episodes/01-bismillah")
