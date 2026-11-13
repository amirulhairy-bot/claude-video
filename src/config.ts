// ===== Edit di sini: jenama, warna beg, logo, teks =====
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Safe zone TikTok + Instagram Reels (1080x1920).
// Atas: status bar/tab "Following | For You". Bawah: caption, username, music bar.
// Kanan: butang like/comment/share. Semua teks & subjek utama duduk dalam kotak ini.
export const SAFE = {top: 250, bottom: 480, left: 80, right: 150};
export const SAFE_BOX = {
  x: SAFE.left,
  y: SAFE.top,
  w: WIDTH - SAFE.left - SAFE.right,
  h: HEIGHT - SAFE.top - SAFE.bottom,
};

export const BRAND = {
  productName: 'Airwheel SE3S',
  handle: '@airwheel.my', // TODO: tukar ke handle TikTok/IG anda
  commentKeyword: 'SE3S',
  // Warna beg — laraskan ikut gambar no. 2
  bagShell: '#2b2f36',
  bagShellLight: '#4a515c',
  bagShellDark: '#16191e',
  bagAccent: '#f5a623',
  // Letak fail logo dalam folder public/ (cth: public/logo.png) dan set 'logo.png'.
  // Jika null, logo teks "AIRWHEEL" digunakan.
  logoFile: null as string | null,
  logoText: 'AIRWHEEL',
};

// Garis masa (frame @30fps)
export const SCENES = {
  problem: {from: 0, dur: 165},
  vs: {from: 165, dur: 165},
  result: {from: 330, dur: 180},
  cta: {from: 510, dur: 120},
  end: {from: 630, dur: 90},
};
export const TOTAL = 720;

export const FONT_EMOJI = '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji"';
