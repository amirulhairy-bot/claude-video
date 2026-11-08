#!/usr/bin/env bash
# Social-ready master: -14 LUFS loudness, true-peak limited, yuv420p (TV range), faststart.
set -euo pipefail
for f in out/homestay-tiktok.mp4 out/homestay-reels.mp4; do
  tmp="${f%.mp4}.tmp.mp4"
  ffmpeg -loglevel error -y -i "$f" \
    -vf "scale=in_range=full:out_range=tv,format=yuv420p" -c:v libx264 -preset slow -crf 18 \
    -af "loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.84:level=false" -ar 48000 -c:a aac -b:a 192k \
    -movflags +faststart "$tmp"
  mv "$tmp" "$f"
  echo "finalized $f"
done
