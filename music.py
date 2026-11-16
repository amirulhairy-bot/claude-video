"""Generate a simple warm lo-fi music bed (stereo WAV) for the promo.
Usage: python3 music.py <seconds> <out.wav>"""
import sys, wave
import numpy as np

dur = float(sys.argv[1]); out = sys.argv[2]
SR = 48000; bpm = 92; beat = 60 / bpm
n = int(SR * (dur + 1)); L = np.zeros(n); R = np.zeros(n)
rng = np.random.default_rng(7)

def add(sig, t, pan=0.0, g=1.0):
    i = int(t * SR); j = min(n, i + len(sig))
    if i >= n: return
    L[i:j] += sig[: j - i] * g * (1 - pan) ; R[i:j] += sig[: j - i] * g * (1 + pan)

def ep(freq, length):  # electric-piano-ish tone
    t = np.arange(int(length * SR)) / SR
    env = np.exp(-t * 1.8) * np.minimum(1, t / 0.01)
    s = np.sin(2*np.pi*freq*t) + 0.35*np.sin(2*np.pi*2*freq*t)*np.exp(-t*4) + 0.1*np.sin(2*np.pi*3*freq*t)*np.exp(-t*6)
    trem = 1 + 0.08*np.sin(2*np.pi*4.5*t)
    return s * env * trem

def kick():
    t = np.arange(int(0.35*SR))/SR
    f = 50 + 90*np.exp(-t*30)
    return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t*9)

def snap():
    t = np.arange(int(0.2*SR))/SR
    return rng.standard_normal(len(t)) * np.exp(-t*28) * 0.6

def hat():
    t = np.arange(int(0.06*SR))/SR
    x = rng.standard_normal(len(t)); x = np.diff(np.concatenate([[0], x]))
    return x * np.exp(-t*70) * 0.25

def bass(freq, length):
    t = np.arange(int(length*SR))/SR
    return np.sin(2*np.pi*freq*t) * np.minimum(1, t/0.02) * np.exp(-t*1.2)

m = lambda k: 440 * 2 ** ((k - 69) / 12)
chords = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]  # Fmaj7 Em7 Dm7 Cmaj7
roots = [41, 40, 38, 36]
bar = beat * 4
t = 0.0; ci = 0
while t < dur + 0.5:
    ch = chords[ci % 4]
    for k, note in enumerate(ch):
        add(ep(m(note), bar * 1.1), t + k * 0.012, pan=(k - 1.5) * 0.15, g=0.11)
        add(ep(m(note + 12), beat), t + beat * 2.5, pan=0.3, g=0.03)
    add(bass(m(roots[ci % 4]), bar), t, g=0.32)
    for b in range(4):
        bt = t + b * beat
        if t >= 2.0:  # drums enter after the hook counter lands
            if b in (0, 2): add(kick(), bt, g=0.55)
            if b == 2.5 or b in (1, 3): add(snap(), bt, g=0.22)
        for h in (0, 0.5):
            add(hat(), bt + h * beat + (0.02 if h else 0), pan=0.25, g=0.5 if t >= 2.0 else 0.25)
    t += bar; ci += 1

# impact when the counter lands (~2.0s)
tt = np.arange(int(1.2*SR))/SR
boom = np.sin(2*np.pi*(45 + 60*np.exp(-tt*12))*tt) * np.exp(-tt*3.5)
add(boom, 2.0, g=0.6)
# reverse-swell into it
sw = rng.standard_normal(int(1.0*SR)); swt = np.arange(len(sw))/SR
sw = np.convolve(sw, np.ones(40)/40, 'same') * (swt/1.0)**3
add(sw, 1.0, g=0.5)

mix = np.stack([L, R], 1)[: int(dur * SR)]
fade = int(1.5 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix /= np.max(np.abs(mix)) + 1e-9; mix *= 0.85
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
