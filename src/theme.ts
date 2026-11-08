import '@fontsource/anton/400.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';

export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const COLORS = {
  yellow: '#FFD23F',
  pool: '#1FB6FF',
  ink: '#0B1220',
  white: '#FFFFFF',
  green: '#2EE59D',
};

export const FONT_DISPLAY = 'Anton, Impact, sans-serif';
export const FONT_BODY = 'Montserrat, Arial, sans-serif';

export type Platform = 'tiktok' | 'reels';

// Pixels covered by each app's UI on a 1080x1920 frame (padded a little).
// Everything important stays inside these margins.
export const SAFE: Record<Platform, {top: number; bottom: number; left: number; right: number}> = {
  tiktok: {top: 220, bottom: 500, left: 70, right: 160},
  reels: {top: 260, bottom: 460, left: 70, right: 140},
};
