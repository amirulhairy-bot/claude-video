#!/usr/bin/env bash
# Download the raw clip from Google Drive and make an upright 1080x1920 30fps copy
# with loudness-normalised voice (-14 LUFS, social-media standard) in public/main.mp4.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p raw public
[ -f raw/source.mp4 ] || gdown 1ERDTqt4kVL2GC_i4TRrVJM9guw1hXsVb -O raw/source.mp4
ffmpeg -v error -y -i raw/source.mp4 \
  -vf "scale=1080:1920,fps=30" -c:v libx264 -preset fast -crf 16 -pix_fmt yuv420p \
  -af "highpass=f=80,afftdn=nf=-30,loudnorm=I=-14:TP=-1.5:LRA=9" -ar 48000 -c:a aac -b:a 192k \
  -movflags +faststart public/main.mp4
echo "public/main.mp4 ready"
