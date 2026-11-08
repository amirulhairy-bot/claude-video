# claude-video — Homestay Private Pool (Reel & TikTok)

A Remotion project that turns the homestay photos in `public/images/` into a 9:16, 31.5 s video with motion graphics, sound effects and a 120 BPM music bed.

- `SKRIP.md`: the script/transcript, scene by scene (captions, motion, SFX, safe zones, and a suggested post caption).
- `src/script.ts`: the scene list, durations and caption text. Edit the text here and the video follows.
- `out/homestay-tiktok.mp4` and `out/homestay-reels.mp4`: the rendered videos (-14 LUFS, yuv420p).

## Commands

```bash
npm install
npm run studio          # preview; toggle the `showSafeZone` prop to see the safe zones
npm run sfx             # regenerate the sound effects + music (python3 + numpy)
npm run build           # SFX -> render TikTok + Reels -> loudness master
```
