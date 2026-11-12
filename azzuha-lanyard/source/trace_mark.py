"""Vectorise the Azzuha mark (no tagline) from a black-background image -> logo_mark.svg"""
import sys, numpy as np, potrace
from PIL import Image, ImageFilter
im = Image.open(sys.argv[1]).convert('RGB')
S = 2
big = im.resize((im.width*S, im.height*S), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.5))
a = np.array(big).astype(float); r, g, b = a[..., 0], a[..., 1], a[..., 2]
sat = a.max(2) - a.min(2); lum = a.mean(2)
green = (sat > 40) & (g > r) & (lum > 50)
grey = (sat <= 40) & (lum > 70)
def trace(mask):
    p = potrace.Bitmap(~mask).trace(turdsize=30, alphamax=1.0, opticurve=True, opttolerance=0.2)
    d = []
    for c in p:
        s = c.start_point; d.append(f"M{s.x/S:.1f},{s.y/S:.1f}")
        for seg in c.segments:
            if seg.is_corner: d.append(f"L{seg.c.x/S:.1f},{seg.c.y/S:.1f}L{seg.end_point.x/S:.1f},{seg.end_point.y/S:.1f}")
            else: d.append(f"C{seg.c1.x/S:.1f},{seg.c1.y/S:.1f} {seg.c2.x/S:.1f},{seg.c2.y/S:.1f} {seg.end_point.x/S:.1f},{seg.end_point.y/S:.1f}")
        d.append("Z")
    return "".join(d)
ys, xs = np.where(green | grey); x0, y0, x1, y1 = xs.min()/S, ys.min()/S, xs.max()/S, ys.max()/S
W, H = x1-x0+2, y1-y0+2
open(sys.argv[2], 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0-1:.1f} {y0-1:.1f} {W:.1f} {H:.1f}" width="{W:.0f}" height="{H:.0f}">'
    f'<path id="g" fill="#6E9A33" d="{trace(green)}"/><path id="k" fill="#6D6E71" d="{trace(grey)}"/></svg>')
print(W, H)
