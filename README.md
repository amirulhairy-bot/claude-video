# claude-video — "Senjata Makcik di Gurun Oman" (Remotion)

Vertical 1080×1920 / 30fps edit for TikTok & Instagram Reels, built with [Remotion](https://remotion.dev).

## What's in the edit
- **Transcription**: Whisper large-v3 (Malay, word timestamps) → manually corrected (`transcript/`).
- **Hook (0–3.5s)**: two-beat motion graphic — "SEJUK GILA KAT GURUN?!" with falling snow, then flash + impact into "INI SENJATA MAKCIK!" with flames; zoom punch on the footage.
- **Jump cuts**: dead air removed ("Okey." intro and a 0.6s pause), each cut hidden by a zoom punch + swoosh.
- **Karaoke captions**: word-by-word highlight, keywords coloured (sejuk = ice blue, hangat = orange, beli = green).
- **Motion graphics**: Bukan Iklan stamp, travel plane, Sebab Apa?, Oman location + falling thermometer + snow, tip card, warm glow + rising thermometer, Mami-mami, WAJIB BELI stamp, checklist, CUBALAH + Follow CTA.
- **Sound effects**: synthesized, royalty-free (`scripts/make_sfx.py` → `public/sfx/`): impact, riser, whoosh, swoosh, pop, tick, click, ding, sparkle.
- **Branding**: Lavender Confinement Care logo watermark (top-left, safe zone), bright lavender colour grade (lifted, soft lavender edge glow), and a branded logo end card. Palette in `src/theme.ts` (logo purple #AC56A1).
- **Voice**: denoised + loudness normalised to −14 LUFS.

## Safe zones / face rule
Defined in `src/data.ts` (`SAFE`):
- Keeps clear of TikTok/IG UI: top 230px, bottom 440px, right 140px action rail.
- Speaker's face sits at ~35–55% of frame height, so **graphics live only in the sky band (y 230–630)** above her head and **captions only in the chest band (y 1230–1480)** below the product. Nothing is ever drawn over the face.

## Run it
```bash
npm install
pip install gdown && ./scripts/prepare.sh   # downloads source, makes public/main.mp4
npm run studio                              # preview
npx remotion render MakcikOman out/makcik-oman.mp4
```
In sandboxes without Remotion's Chrome download, set `REMOTION_BROWSER=/path/to/chrome-headless-shell`.
