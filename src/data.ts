// Timing data for the edit. All transcript times are in SOURCE seconds
// (from Whisper large-v3 word timestamps, manually corrected) and are mapped
// onto the output timeline through the jump-cut list below.

export const FPS = 30;

/** Kept ranges of the source clip [start, end] in seconds (jump cuts between them). */
export const CUTS: [number, number][] = [
  [1.85, 3.05], // "Assalamualaikum semua"  (drops the "Okey." + dead air)
  [3.55, 18.95], // "Di sini makcik ... memang besar"
  [19.55, 41.5], // "Di luar negara ... thank you"  (drops a 0.6s pause)
];

const segStarts: number[] = [];
{
  let acc = 0;
  for (const [a, b] of CUTS) {
    segStarts.push(acc);
    acc += b - a;
  }
}

export const TOTAL_SECONDS = CUTS.reduce((s, [a, b]) => s + (b - a), 0);
export const TOTAL_FRAMES = Math.round(TOTAL_SECONDS * FPS);

/** Output frame at which each segment starts (used for jump-cut zoom punches). */
export const SEGMENT_START_FRAMES = segStarts.map((s) => Math.round(s * FPS));

/** Map a source time (s) to an output frame. */
export const f = (src: number): number => {
  for (let i = CUTS.length - 1; i >= 0; i--) {
    if (src >= CUTS[i][0]) {
      return Math.round((segStarts[i] + Math.min(src, CUTS[i][1]) - CUTS[i][0]) * FPS);
    }
  }
  return 0;
};

/**
 * Safe-zone layout for 1080x1920 that satisfies both TikTok and IG Reels:
 *  - top ~220px: status bar / "Following | For You" tabs
 *  - bottom ~420px: username, caption, music ticker
 *  - right ~140px: like/comment/share rail
 * The speaker's face sits at ~35%-55% of frame height (y≈670-1060), with the
 * product tubes held at ~52%-62%. So graphics go in the SKY band above her
 * head and captions go in the CHEST band below the product.
 */
export const SAFE = {
  left: 60,
  right: 940, // 1080 - 140 (action rail)
  centerX: 500,
  skyTop: 230,
  skyBottom: 630, // never draw below this in the sky band (top of hijab ≈ 670)
  captionTop: 1230, // below the product tubes
  captionBottom: 1480, // above TikTok/IG bottom UI
};

export type Word = { w: string; s: number; e: number; k?: "cold" | "warm" | "buy" | "hot" };

// Each inner array is one caption "page" (shown together, highlighted word by word).
export const PAGES: Word[][] = [
  [{ w: "Assalamualaikum", s: 1.98, e: 2.66 }, { w: "semua", s: 2.66, e: 3.0 }],
  [{ w: "Di", s: 3.6, e: 3.9 }, { w: "sini", s: 4.28, e: 4.62 }, { w: "makcik", s: 4.62, e: 5.7 }],
  [{ w: "bukan", s: 5.7, e: 6.0 }, { w: "nak", s: 6.0, e: 6.28 }, { w: "untuk", s: 6.28, e: 6.54 }, { w: "promosi", s: 6.54, e: 7.02, k: "hot" }],
  [{ w: "ke", s: 7.02, e: 7.14 }, { w: "apa,", s: 7.14, e: 7.28 }, { w: "tapi", s: 7.28, e: 7.56 }, { w: "memang", s: 7.56, e: 8.04 }],
  [{ w: "makcik", s: 8.04, e: 8.5 }, { w: "menggunakannya", s: 8.5, e: 9.2, k: "buy" }],
  [{ w: "Daripada", s: 9.36, e: 10.04 }, { w: "dulu", s: 10.04, e: 10.38 }, { w: "memang", s: 10.38, e: 11.0 }],
  [{ w: "dah", s: 11.0, e: 12.08 }, { w: "terbiasa", s: 12.08, e: 12.66 }, { w: "menggunakan", s: 12.66, e: 13.08 }],
  [{ w: "dan", s: 13.08, e: 13.3 }, { w: "bawa", s: 13.3, e: 13.82, k: "hot" }, { w: "di", s: 13.82, e: 14.04 }, { w: "mana-mana", s: 14.04, e: 14.58 }],
  [{ w: "juga", s: 14.58, e: 14.74 }, { w: "makcik", s: 14.74, e: 15.18 }, { w: "travel,", s: 15.18, e: 15.44, k: "hot" }, { w: "okey?", s: 15.62, e: 15.88 }],
  [{ w: "Sebab", s: 16.04, e: 16.56 }, { w: "apa?", s: 16.56, e: 16.72, k: "hot" }],
  [{ w: "Ini", s: 16.8, e: 17.12 }, { w: "function", s: 17.12, e: 18.08, k: "hot" }, { w: "dia", s: 18.08, e: 18.4 }],
  [{ w: "memang", s: 18.4, e: 18.66 }, { w: "besar!", s: 18.66, e: 18.95, k: "hot" }],
  [{ w: "Di", s: 19.62, e: 20.14 }, { w: "luar", s: 20.14, e: 20.54 }, { w: "negara", s: 20.54, e: 20.92 }, { w: "macam", s: 20.92, e: 21.1 }, { w: "ni,", s: 21.1, e: 21.32 }],
  [{ w: "di", s: 21.36, e: 21.56 }, { w: "Oman", s: 21.56, e: 21.86, k: "hot" }, { w: "ni", s: 21.86, e: 22.04 }, { w: "sejuk", s: 22.04, e: 22.42, k: "cold" }],
  [{ w: "Dekat", s: 22.52, e: 22.94 }, { w: "desert", s: 22.94, e: 23.16, k: "hot" }, { w: "ni", s: 23.16, e: 23.38 }],
  [{ w: "memang", s: 23.38, e: 23.62 }, { w: "sejuk", s: 23.62, e: 23.96, k: "cold" }, { w: "sangat", s: 23.96, e: 24.16, k: "cold" }],
  [{ w: "Bila", s: 24.42, e: 24.8 }, { w: "keluar", s: 24.8, e: 25.12 }, { w: "sejuk,", s: 25.12, e: 25.56, k: "cold" }],
  [{ w: "kita", s: 25.56, e: 25.72 }, { w: "sapukan", s: 25.72, e: 26.3, k: "warm" }, { w: "sebelum", s: 26.3, e: 26.94 }],
  [{ w: "kita", s: 26.94, e: 27.12 }, { w: "berada", s: 27.12, e: 27.46 }, { w: "di", s: 27.46, e: 27.62 }, { w: "luar", s: 27.62, e: 27.9 }],
  [{ w: "Sapu,", s: 28.08, e: 28.4, k: "warm" }, { w: "dia", s: 28.4, e: 28.66 }, { w: "akan", s: 28.66, e: 28.94 }],
  [{ w: "menghangatkan", s: 28.94, e: 29.52, k: "warm" }, { w: "badan", s: 29.52, e: 29.86 }, { w: "kita", s: 29.86, e: 30.04 }],
  [{ w: "So", s: 30.18, e: 30.64 }, { w: "you", s: 30.64, e: 30.94 }, { w: "mami-mami", s: 30.94, e: 31.96, k: "hot" }],
  [{ w: "semua", s: 31.96, e: 32.18 }, { w: "di", s: 32.18, e: 32.4 }, { w: "luar", s: 32.4, e: 32.68 }],
  [{ w: "jangan", s: 32.68, e: 32.86 }, { w: "lupalah!", s: 32.86, e: 33.3, k: "hot" }],
  [{ w: "Jangan", s: 33.4, e: 34.0 }, { w: "tak", s: 34.0, e: 34.32 }, { w: "beli!", s: 34.32, e: 34.62, k: "buy" }],
  [{ w: "Memang", s: 34.62, e: 34.98 }, { w: "kena", s: 34.98, e: 35.2 }, { w: "beli", s: 35.2, e: 35.58, k: "buy" }],
  [{ w: "supaya", s: 35.58, e: 36.24 }, { w: "benda", s: 36.24, e: 37.04 }, { w: "ni", s: 37.04, e: 37.22 }],
  [{ w: "banyak", s: 37.22, e: 37.86, k: "hot" }, { w: "kegunaannya", s: 37.86, e: 38.66, k: "hot" }],
  [{ w: "InsyaAllah", s: 38.8, e: 39.4 }, { w: "cubalah!", s: 39.4, e: 40.04, k: "buy" }],
  [{ w: "Okay,", s: 40.24, e: 40.8 }, { w: "thank", s: 40.8, e: 41.08 }, { w: "you!", s: 41.08, e: 41.45 }],
];
