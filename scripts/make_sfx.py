"""Synthesize royalty-free SFX + background music (numpy only) into public/."""
import numpy as np, wave, os

SR = 44100
ROOT = os.path.join(os.path.dirname(__file__), "..", "public")
rng = np.random.default_rng(7)

def save(name, x, folder="sfx"):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    peak = np.max(np.abs(x)) or 1
    x = x / peak * 0.89
    path = os.path.join(ROOT, folder, name)
    with wave.open(path, "w") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
    print("wrote", path)

def t(d): return np.arange(int(SR * d)) / SR
def env(n, a=0.005, r=None):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    if r: nr = min(n, int(r * SR)); e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e
def lp(x, a):  # one-pole lowpass, a in (0,1) – smaller = darker
    y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s += a * (v - s); y[i] = s
    return y
def sweep_lp(x, a0, a1):
    a = np.linspace(a0, a1, len(x)); y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s += a[i] * (v - s); y[i] = s
    return y

# whoosh: band-ish noise sweeping up then down
n = rng.standard_normal(int(SR * 0.6))
w = sweep_lp(n, 0.02, 0.35) - sweep_lp(n, 0.005, 0.08)
w *= np.sin(np.linspace(0, np.pi, len(w))) ** 2
save("whoosh.wav", w)

# pop: short pitched blip
tt = t(0.12); f = 900 * np.exp(-tt * 30) + 300
save("pop.wav", np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 40))

# ding: bell with partials
tt = t(1.4)
d = sum(a * np.sin(2 * np.pi * fr * tt) * np.exp(-tt * k) for fr, a, k in
        [(1318, 1, 3), (2637, .4, 5), (3950, .2, 8), (1976, .3, 4)])
save("ding.wav", d * env(len(tt)))

# error buzz (problem)
tt = t(0.45)
b = np.sign(np.sin(2 * np.pi * 140 * tt)) * 0.6 + np.sin(2 * np.pi * 147 * tt)
b *= ((tt < 0.18) | (tt > 0.24)) * env(len(tt), r=0.05)
save("buzz.wav", lp(b, 0.25))

# thud / ouch impact
tt = t(0.5); f = 120 * np.exp(-tt * 12) + 45
th = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)
th += lp(rng.standard_normal(len(tt)), 0.2) * np.exp(-tt * 40) * 0.6
save("thud.wav", th)

# riser: rising noise + tone
tt = t(1.6); f = 200 + 1400 * (tt / tt[-1]) ** 2
r = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + sweep_lp(rng.standard_normal(len(tt)), 0.01, 0.6) * 0.8
save("riser.wav", r * (tt / tt[-1]) ** 1.5 * env(len(tt), r=0.03))

# boom impact
tt = t(1.5); f = 70 * np.exp(-tt * 4) + 32
bm = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 3)
bm += lp(rng.standard_normal(len(tt)), 0.08) * np.exp(-tt * 6) * 1.2
save("boom.wav", bm)

# sparkle: random high bells
sp = np.zeros(int(SR * 1.0))
for i in range(14):
    st = int(rng.uniform(0, 0.6) * SR); fr = rng.uniform(2500, 6000); tt = t(0.35)
    seg = np.sin(2 * np.pi * fr * tt) * np.exp(-tt * 14) * rng.uniform(.3, 1)
    sp[st:st + len(seg)] += seg[:len(sp) - st]
save("sparkle.wav", sp)

# click / tick
tt = t(0.05); save("click.wav", rng.standard_normal(len(tt)) * np.exp(-tt * 180))

# glide: electric motor hum + wind, 3s
tt = t(3.0); f = 180 + 60 * np.sin(2 * np.pi * 0.4 * tt)
g = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 + np.sin(2 * np.pi * np.cumsum(f * 2) / SR) * 0.1
g += sweep_lp(rng.standard_normal(len(tt)), 0.03, 0.06) * 0.6
save("glide.wav", g * env(len(tt), a=0.3, r=0.6))

# notification (CTA): two-tone
tt = t(0.5)
nt = np.sin(2 * np.pi * 880 * tt) * (tt < .15) + np.sin(2 * np.pi * 1320 * tt) * (tt >= .15)
save("notify.wav", nt * np.exp(-((tt % .15) * 12)) * env(len(tt), r=.1))

# sad trombone (masalah)
sd = np.zeros(0)
for i, m in enumerate([62, 61, 60, 59]):
    d = 0.32 if i < 3 else 0.9; tt = t(d)
    f = 440 * 2 ** ((m - 69) / 12) * (1 + (0.012 * np.sin(2 * np.pi * 6 * tt) if i == 3 else 0))
    seg = sum(np.sin(2 * np.pi * np.cumsum(f * k) / SR) / k ** 1.3 for k in range(1, 6)) * env(len(tt), .02, d * .3)
    sd = np.concatenate([sd, seg])
save("sad.wav", lp(sd, 0.3))

# yay: rising happy arpeggio
y = np.zeros(int(SR * 0.9))
for i, m in enumerate([72, 76, 79, 84]):
    tt = t(0.4); seg = (np.sin(2 * np.pi * 440 * 2 ** ((m - 69) / 12) * tt) + .3 * np.sin(2 * np.pi * 880 * 2 ** ((m - 69) / 12) * tt)) * np.exp(-tt * 7)
    st = int(i * 0.09 * SR); y[st:st + len(seg)] += seg[:len(y) - st]
save("yay.wav", y)

# cha-ching (tempah)
tt = t(0.9)
cc = lp(rng.standard_normal(len(tt)), .6) * np.exp(-tt * 60) * .5
for fr, st in [(2093, 0.0), (2637, 0.08), (3136, 0.08)]:
    seg = np.sin(2 * np.pi * fr * tt) * np.exp(-tt * 5); i = int(st * SR); cc[i:] += seg[:len(cc) - i] * .6
save("chaching.wav", cc)

def make_music(name, dur):
  BPM = 112; beat = 60 / BPM; N = int(SR * dur)
  mus = np.zeros((N, 2))
  def add(sig, start, pan=0.0, gain=1.0):
      i = int(start * SR); sig = sig[:max(0, N - i)]
      mus[i:i + len(sig), 0] += sig * gain * (1 - max(0, pan))
      mus[i:i + len(sig), 1] += sig * gain * (1 + min(0, pan))
  def kick():
      tt = t(.35); f = 150 * np.exp(-tt * 25) + 45
      return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)
  def hat(o=False):
      tt = t(.25 if o else .06); return np.diff(rng.standard_normal(len(tt) + 1)) * np.exp(-tt * (15 if o else 70)) * .25
  def snare():
      tt = t(.25); return (lp(rng.standard_normal(len(tt)), .5) * .7 + np.sin(2 * np.pi * 190 * tt) * .5) * np.exp(-tt * 18)
  def note(fr, d, kind="saw"):
      tt = t(d)
      if kind == "saw":
          s = sum(np.sin(2 * np.pi * fr * k * tt) / k for k in range(1, 7))
      else:
          s = np.sin(2 * np.pi * fr * tt)
      return s * env(len(tt), .01, d * .4)
  hz = lambda m: 440 * 2 ** ((m - 69) / 12)
  # chord progression (A minor feel → uplifting): Am F C G
  prog = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [55, 60, 64]), (55, [55, 59, 62])]
  bars = int(dur / (beat * 4)) + 1
  for b in range(bars):
      t0 = b * beat * 4
      root, ch = prog[b % 4]
      intro = b < 2  # sparse intro during "problem" section
      for q in range(4):
          tq = t0 + q * beat
          if not intro or q % 2 == 0:
              add(kick(), tq, gain=.9)
          if not intro and q in (1, 3):
              add(snare(), tq, gain=.5)
          for e in range(2):
              add(hat(e == 1 and not intro), tq + e * beat / 2, pan=.3, gain=.6)
          add(lp(note(hz(root - 12), beat * .9), .15), tq, gain=.55)  # bass
      for m in ch:  # pad
          add(lp(note(hz(m), beat * 4), .05), t0, pan=(m % 3 - 1) * .4, gain=.12)
      if not intro:  # pluck arpeggio
          for i in range(8):
              m = ch[i % 3] + (12 if i % 4 == 3 else 0) + 12
              add(lp(note(hz(m), beat * .45), .2), t0 + i * beat / 2, pan=.4 * (-1) ** i, gain=.13)
  fade = int(SR * 2); mus[-fade:] *= np.linspace(1, 0, fade)[:, None]
  save(name, mus, folder="music")


make_music('bg.wav', 24.0)
make_music('bg_umrah.wav', 31.0)
