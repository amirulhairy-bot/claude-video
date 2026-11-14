# APR. Amsyar Pack Rental — Airwheel SE3S Video "Masalah vs Keputusan" (Remotion)

Video menegak 1080x1920, 24 saat, 30fps. Strukturnya ikut video rujukan (The problem → Vs.. → The Result → Comment):

| Masa | Babak | Teks atas skrin | SFX |
|---|---|---|---|
| 0.0–5.5s | Masalah | "Masalahnya... 😣⛔", "Lutut sakit bila jalan jauh 😩", "Airport besar, gate pula jauh 🥲" | whoosh, buzz, thud (ADUH!), pop |
| 5.5–11s | Vs | "Vs.. 🤔", "Keputusan bijak 💡" — beg SE3S + logo + 3 ciri | riser, boom, sparkle, click, ding, pop |
| 11–17s | Hasil | "Hasilnya.. 🔥", "Meluncur macam biasa 😎", "Sampai gate, lutut tak sakit ✅" | whoosh, glide motor, ding |
| 17–21s | CTA | `Komen "SE3S" kalau nak sewa 🧳` + animasi taip komen | click, notify |
| 21–24s | End card | Logo APR. + "Sewa Airwheel SE3S" + Follow @handle | whoosh, sparkle |

## Transkripsi video rujukan
Video rujukan tiada suara, cuma lagu latar + teks atas skrin. Hasil Whisper ada dalam `docs/reference-transcript.json`.

## Jalankan
```bash
npm install
npm run studio          # preview & edit
npm run render          # -> out/airwheel-se3s.mp4
npx remotion render AirwheelSE3S-SafeZone out/safezone.mp4   # versi dengan overlay safe zone
npm run sfx             # jana semula SFX + muzik (python3 + numpy)
```

## Tukar jenama / beg / logo — `src/config.ts`
- `BRAND.logoFile`: kini `apr-logo.png` (logo APR. putih lutsinar, diekstrak dari logo asal `public/apr-logo-blue.png`). Logo akan muncul di badan beg, pada label produk dan di end card.
- `bagShell`, `bagShellLight`, `bagShellDark`, `bagAccent`: warna beg.
- `handle`, `commentKeyword`: handle TikTok/IG dan kata kunci komen.

## Safe zone TikTok + IG Reels
Atas 250px, bawah 480px, kiri 80px, kanan 150px (butang like/komen). Semua teks dan subjek utama duduk dalam kotak hijau. Lihat `docs/safezone-preview.png`.

## Audio
SFX dan muzik latar dijana sendiri oleh `scripts/make_sfx.py`, jadi bebas royalti. Untuk guna lagu trending, gantikan `public/music/bg.wav` atau tambah lagu dalam app TikTok/IG masa upload.
- Reka bentuk beg ikut `docs/ref-airwheel-se3s.jpg` (beg tegak hitam, lencana kuning, batang aluminium + pemegang T, roda depan).

---

# Video 2: Umrah — Anak penat di perkarangan masjid, Makkah (`UmrahAnakSE3S`)

30 saat, 1080x1920. Render: `npx remotion render UmrahAnakSE3S out/umrah-anak-se3s.mp4`

| Masa | Babak | Isi |
|---|---|---|
| 0–2.5s | Hook | "Bawa anak kecil ke Makkah? 🕌": ibu (abaya + tudung krim) dan anak (jubah + kopiah) berjalan |
| 2.5–8.5s | Masalah | Anak penat, terduduk, menangis: "Ummi... kaki adik penat 😭" → "Dukung adik! 🥺". Ibu penat, tangan penuh beg. Latar jadi panas |
| 8.5–14s | Solusi | "Solusinya.. 💡" → "Biar adik naik Airwheel! 🧳" + beg SE3S + logo APR. |
| 14–20s | Hasil | Adik naik SE3S, ibu berjalan di sebelah dan tersenyum: "Yeay! Best naik ni! 🤩", "Alhamdulillah, lega 🥹" |
| 20–23.5s | Kenapa sewa | Kad APR.: sewa ikut tarikh trip, adik selesa, beg + skuter, pelekat "⏳ Tempah awal sebelum berangkat!" |
| 23.5–27s | CTA | `Komen "UMRAH" untuk tempah 🧳` + animasi taip komen + bunyi cha-ching |
| 27–30s | End card | Logo APR. + Sewa Airwheel SE3S + Follow |

Kod: `src/umrah/`. Watak anak: `src/components/Kid.tsx`. Latar masjid: `src/components/Courtyard.tsx`.
