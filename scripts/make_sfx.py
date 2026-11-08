"""Synthesize all sound effects + a 120 BPM music bed into public/sfx/.

Everything is generated from scratch (no samples), so there are no licensing
issues. Run:  python3 scripts/make_sfx.py
"""
import os
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "sfx")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


def save(name, x, stereo_width=0.0):
    x = np.asarray(x, dtype=np.float64)
    peak = np.max(np.abs(x)) or 1.0
    x = x / peak * 0.9
    if stereo_width:
        d = int(SR * 0.012)
        r = np.concatenate([np.zeros(d), x[:-d]])
        st = np.stack([x, (1 - stereo_width) * x + stereo_width * r], axis=1)
    else:
        st = np.stack([x, x], axis=1)
    pcm = (st * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("wrote", name, f"{len(x) / SR:.2f}s")


def t_axis(dur):
    return np.arange(int(SR * dur)) / SR


def onepole_lp(x, cutoff):
    """One-pole low-pass with a per-sample (array) or fixed cutoff in Hz."""
    cutoff = np.broadcast_to(cutoff, x.shape)
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.zeros_like(x)
    prev = 0.0
    for i in range(len(x)):
        prev = (1 - a[i]) * x[i] + a[i] * prev
        y[i] = prev
    return y


def env_ar(n, attack, release):
    a = int(SR * attack)
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a)
    e[a:] = np.exp(-np.arange(n - a) / (SR * release))
    return e


# ---------- whoosh: noise through a sweeping filter, swell then fade ----------
def whoosh(dur=0.55, lo=300, hi=6000):
    t = t_axis(dur)
    n = rng.standard_normal(len(t))
    p = t / dur
    sweep = lo + (hi - lo) * np.sin(np.pi * p) ** 2
    lp = onepole_lp(n, sweep)
    hp = lp - onepole_lp(lp, 200)
    env = np.sin(np.pi * np.clip(p * 1.15, 0, 1)) ** 1.5
    return hp * env


save("whoosh.wav", whoosh(), stereo_width=0.6)
save("whoosh_fast.wav", whoosh(0.32, 600, 9000), stereo_width=0.6)


# ---------- impact / boom: pitch-dropping sub + click + noise tail ----------
def impact(dur=1.2):
    t = t_axis(dur)
    f = 40 + 90 * np.exp(-t * 18)
    phase = 2 * np.pi * np.cumsum(f) / SR
    sub = np.sin(phase) * np.exp(-t * 3.2)
    click = rng.standard_normal(len(t)) * np.exp(-t * 60)
    tail = onepole_lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 6) * 0.6
    return np.tanh(2.2 * (sub + 0.35 * click + tail))


save("impact.wav", impact(), stereo_width=0.3)


# ---------- pop: short pitched blip for words appearing ----------
def pop(f0=520, f1=1100, dur=0.12):
    t = t_axis(dur)
    f = f0 + (f1 - f0) * (t / dur) ** 0.5
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return s * env_ar(len(t), 0.002, 0.03)


save("pop.wav", pop())


# ---------- ding: bright bell for checklist ticks ----------
def ding(f=1318.5, dur=0.9):
    t = t_axis(dur)
    s = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.01 * t)
         + 0.25 * np.sin(2 * np.pi * f * 3.02 * t))
    return s * env_ar(len(t), 0.003, 0.25)


save("ding.wav", ding(), stereo_width=0.4)


# ---------- riser: noise + rising tone, builds tension before the CTA ----------
def riser(dur=2.0):
    t = t_axis(dur)
    p = t / dur
    n = rng.standard_normal(len(t))
    filt = onepole_lp(n, 300 + 8000 * p ** 2)
    f = 200 + 900 * p ** 2
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.35
    return (filt + tone) * p ** 2


save("riser.wav", riser(), stereo_width=0.7)


# ---------- shutter: camera click for photo-style reveals ----------
def shutter():
    t = t_axis(0.18)
    n = rng.standard_normal(len(t))
    c1 = n * np.exp(-t * 120)
    c2 = np.roll(n * np.exp(-t * 90), int(SR * 0.06)) * 0.7
    return onepole_lp(c1 + c2, 5000)


save("shutter.wav", shutter())


# ---------- music bed: 120 BPM chill house loop, Am - F - C - G ----------
BPM = 120
beat = 60 / BPM
total = 32.0
N = int(SR * total)
mix = np.zeros(N)


def add(buf, at):
    i = int(at * SR)
    j = min(N, i + len(buf))
    if i < N:
        mix[i:j] += buf[: j - i]


def kick():
    t = t_axis(0.35)
    f = 48 + 110 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def clap():
    t = t_axis(0.25)
    n = rng.standard_normal(len(t))
    bp = onepole_lp(n, 2500) - onepole_lp(n, 800)
    return bp * np.exp(-t * 22)


def hat():
    t = t_axis(0.06)
    n = rng.standard_normal(len(t))
    return (n - onepole_lp(n, 7000)) * np.exp(-t * 80)


def note(freq, dur, kind="pad"):
    t = t_axis(dur)
    if kind == "pad":
        s = sum(np.sin(2 * np.pi * freq * d * t) for d in (0.997, 1.0, 1.004))
        s += 0.3 * np.sin(2 * np.pi * freq * 2 * t)
        e = np.minimum(1, t / 0.25) * np.minimum(1, (dur - t) / 0.3)
        return s * e
    # bass
    s = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2 * t)
    return s * env_ar(len(t), 0.005, 0.18)


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


chords = [  # (root midi for bass, chord tones)
    (45, [57, 60, 64, 67]),  # Am7
    (41, [57, 60, 65, 69]),  # Fmaj7
    (48, [55, 60, 64, 67]),  # C
    (43, [55, 59, 62, 67]),  # G
]
bar = beat * 4
nbars = int(total / bar) + 1
for b in range(nbars):
    root, tones = chords[(b // 2) % 4]
    t0 = b * bar
    for m in tones:
        add(note(hz(m), bar, "pad") * 0.05, t0)
    for k in range(8):  # offbeat-ish bassline
        if k % 2 == 1 or k == 0:
            add(note(hz(root), beat * 0.45, "bass") * 0.28, t0 + k * beat / 2)
    for k in range(4):
        add(kick() * 0.6, t0 + k * beat)
        if k in (1, 3):
            add(clap() * 0.22, t0 + k * beat)
    for k in range(8):
        add(hat() * (0.12 if k % 2 else 0.06), t0 + k * beat / 2)

# gentle fade in/out
fade = np.ones(N)
fi, fo = int(SR * 0.4), int(SR * 2.5)
fade[:fi] = np.linspace(0, 1, fi)
fade[-fo:] = np.linspace(1, 0, fo)
save("music.wav", np.tanh(1.4 * mix) * fade, stereo_width=0.35)
