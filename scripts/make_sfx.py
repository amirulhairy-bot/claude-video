"""Synthesize royalty-free sound effects into public/sfx (48kHz 16-bit mono WAV)."""
import sys, os, wave
import numpy as np

SR = 48000
OUT = sys.argv[1] if len(sys.argv) > 1 else "public/sfx"
rng = np.random.default_rng(7)

def t(d):
    return np.linspace(0, d, int(SR * d), endpoint=False)

def lowpass(x, cutoff):
    """One-pole lowpass with per-sample cutoff (Hz) array or scalar."""
    c = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = 1 - np.exp(-2 * np.pi * c / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y

def bandsweep(d, f0, f1, q=6):
    n = int(SR * d)
    noise = rng.standard_normal(n)
    f = np.geomspace(f0, f1, n)
    hi = lowpass(noise, f * 1.6)
    lo = lowpass(noise, f / 1.6)
    return hi - lo

def save(name, x, gain=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * gain
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
    print("wrote", name, f"{len(x)/SR:.2f}s")

os.makedirs(OUT, exist_ok=True)

# whoosh: band-passed noise sweeping up then down, bell envelope
d = 0.55; n = int(SR * d); x = np.linspace(0, 1, n)
w = bandsweep(d, 300, 4500) * np.sin(np.pi * x) ** 2
save("whoosh.wav", w, 0.8)

# swoosh (short, fast)
d = 0.28; n = int(SR * d); x = np.linspace(0, 1, n)
save("swoosh.wav", bandsweep(d, 1200, 7000) * np.sin(np.pi * x) ** 1.5, 0.7)

# pop: pitch-dropping sine blip
tt = t(0.12); f = 900 * np.exp(-tt * 30) + 250
ph = 2 * np.pi * np.cumsum(f) / SR
save("pop.wav", np.sin(ph) * np.exp(-tt * 40), 0.8)

# impact / boom: sub drop + noise burst
tt = t(1.2); f = 120 * np.exp(-tt * 6) + 38
sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 3.2)
burst = lowpass(rng.standard_normal(len(tt)), 2500) * np.exp(-tt * 18)
save("impact.wav", np.tanh(1.8 * (sub + 0.6 * burst)), 0.95)

# riser: rising noise + rising tone, ends abruptly
d = 1.4; tt = t(d); x = tt / d
r = bandsweep(d, 200, 6000) * x ** 2.2
tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * x ** 2) / SR) * x ** 3 * 0.35
save("riser.wav", r + tone, 0.7)

# ding: bell partials
tt = t(1.3)
bell = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * k)
           for f, a, k in [(1318, 1, 3.5), (2637, 0.5, 5), (3951, 0.25, 7), (1975, 0.3, 4.5)])
save("ding.wav", bell * np.minimum(1, tt / 0.003), 0.6)

# click / tick
tt = t(0.04)
save("click.wav", lowpass(rng.standard_normal(len(tt)), 5000) * np.exp(-tt * 180), 0.6)

# sparkle: cascade of tiny high bells
d = 1.0; out = np.zeros(int(SR * d))
for k in range(9):
    st = int(SR * k * 0.06); f = 2200 + k * 260 + rng.uniform(-80, 80)
    tt = t(0.4); s = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 12) * (1 - k / 12)
    out[st:st + len(s)] += s[: len(out) - st]
save("sparkle.wav", out, 0.45)

# typewriter-ish tick for word pops (very short)
tt = t(0.03)
save("tick.wav", np.sin(2 * np.pi * 2400 * tt) * np.exp(-tt * 250), 0.35)
