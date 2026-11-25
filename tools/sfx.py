"""Synthesised sound effects (no samples needed). Each returns float32 mono @ SR."""
import numpy as np
SR = 44100
rng = np.random.default_rng(7)

def _t(d): return np.arange(int(SR * d)) / SR
def _env(n, a=0.005, r=None):
    e = np.ones(n); k = max(1, int(SR * a)); e[:k] = np.linspace(0, 1, k)
    if r: e *= np.exp(-np.arange(n) / (SR * r))
    return e
def _lp(x, alpha):  # one-pole low-pass
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x): acc += alpha * (v - acc); y[i] = acc
    return y

def tummy():
    t = _t(1.3)
    f = 70 + 25 * np.sin(2 * np.pi * 3.5 * t) + 15 * np.sin(2 * np.pi * 7 * t)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR)
    gurgle = _lp(rng.standard_normal(len(t)), 0.02) * 6
    am = 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 2.2 * t))
    x = (tone * 0.7 + gurgle * 0.5) * am * np.sin(np.pi * t / t[-1])
    return x * 0.9

def stop():  # cartoon "boop" slide-down
    t = _t(0.35); f = np.linspace(900, 250, len(t))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return x * _env(len(t), r=0.15) * 0.6

def ding():
    t = _t(1.6); x = np.zeros_like(t)
    for f, a in [(1568, 1), (3136, .4), (4704, .2), (2093, .3)]:
        x += a * np.sin(2 * np.pi * f * t)
    return x * _env(len(t), r=0.45) * 0.35

def sparkle():
    d = 1.6; x = np.zeros(int(SR * d))
    for _ in range(28):
        s = int(rng.uniform(0, d - 0.4) * SR); f = rng.uniform(2500, 6000); tt = _t(0.35)
        x[s:s + len(tt)] += np.sin(2 * np.pi * f * tt) * _env(len(tt), r=0.07) * rng.uniform(.3, 1)
    x += 0.5 * np.sin(2 * np.pi * np.cumsum(np.linspace(800, 2400, len(x))) / SR) * _env(len(x), r=.5)
    return x / np.abs(x).max() * 0.45

def munch():
    out = []
    for _ in range(4):
        n = rng.standard_normal(int(SR * .09)) * _env(int(SR * .09), a=.002, r=.025)
        out += [n * 0.6, np.zeros(int(SR * rng.uniform(.12, .2)))]
    return np.concatenate(out)

def pop():
    t = _t(0.12); f = np.linspace(400, 1200, len(t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * _env(len(t), a=.001, r=.03) * 0.8

def whoosh():
    n = int(SR * .8); x = rng.standard_normal(n); y = np.empty(n); acc = 0.0
    alphas = np.linspace(.02, .35, n) * np.sin(np.linspace(0, np.pi, n)) + .01
    for i in range(n): acc += alphas[i] * (x[i] - acc); y[i] = acc
    return y * np.sin(np.linspace(0, np.pi, n)) ** 2 * 1.2

ALL = dict(tummy=tummy, stop=stop, ding=ding, sparkle=sparkle, munch=munch, pop=pop, whoosh=whoosh)
