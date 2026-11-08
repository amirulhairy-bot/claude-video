// Single source of truth for the edit. Text wrapped in *stars* is highlighted.
// Durations are multiples of 15 frames (= one beat at 120 BPM / 30 fps),
// so every cut lands on the music beat.

export type Enter = 'none' | 'zoom' | 'slide' | 'flash' | 'whip';

export type Scene =
  | {
      type: 'hook';
      img: string;
      dur: number;
    }
  | {
      type: 'photo';
      img: string;
      dur: number;
      orientation: 'portrait' | 'landscape';
      // landscape pan: start/end of the visible window, 0 = left edge, 1 = right edge
      pan?: [number, number];
      enter: Enter;
      caption: string;
      sticker?: 'privatePool' | 'sparkle';
    }
  | {
      type: 'kitchen';
      imgs: string[];
      dur: number;
      caption: string;
      chips: string[];
    }
  | {
      type: 'checklist';
      img: string;
      dur: number;
      title: string;
      items: string[];
    }
  | {
      type: 'cta';
      img: string;
      dur: number;
    };

export const SCENES: Scene[] = [
  {type: 'hook', img: 'images/01.jpg', dur: 90},
  {
    type: 'photo',
    img: 'images/05.jpg',
    dur: 75,
    orientation: 'portrait',
    enter: 'zoom',
    caption: 'Homestay ni siap ada *PRIVATE POOL* sendiri',
    sticker: 'privatePool',
  },
  {
    type: 'photo',
    img: 'images/04.jpg',
    dur: 60,
    orientation: 'portrait',
    enter: 'slide',
    caption: 'Petang-petang, lepak kat *GAZEBO*',
  },
  {
    type: 'photo',
    img: 'images/02.jpg',
    dur: 60,
    orientation: 'portrait',
    enter: 'zoom',
    caption: 'Malam? Lampu *LIP-LAP* terus on',
    sticker: 'sparkle',
  },
  {
    type: 'photo',
    img: 'images/06.jpg',
    dur: 75,
    orientation: 'landscape',
    pan: [0.25, 0.6],
    enter: 'whip',
    caption: 'Rumah 2 tingkat, *MODEN & LAPANG*',
  },
  {
    type: 'photo',
    img: 'images/07.jpg',
    dur: 60,
    orientation: 'landscape',
    pan: [0.3, 0.62],
    enter: 'slide',
    caption: 'Buka pagar, terus nampak *KOLAM*',
  },
  {
    type: 'photo',
    img: 'images/08.jpg',
    dur: 60,
    orientation: 'landscape',
    pan: [0.55, 0.3],
    enter: 'flash',
    caption: 'Masuk dalam, *TERANG & BERSIH*',
  },
  {
    type: 'photo',
    img: 'images/09.jpg',
    dur: 75,
    orientation: 'landscape',
    pan: [0.15, 0.5],
    enter: 'slide',
    caption: 'Meja makan besar untuk *SATU FAMILY*',
  },
  {
    type: 'photo',
    img: 'images/12.jpg',
    dur: 60,
    orientation: 'landscape',
    pan: [0.5, 0.3],
    enter: 'zoom',
    caption: 'Makan sambil *TENGOK POOL*',
  },
  {
    type: 'photo',
    img: 'images/11.jpg',
    dur: 60,
    orientation: 'landscape',
    pan: [0.2, 0.5],
    enter: 'whip',
    caption: 'Ruang tamu *SELESA* untuk semua',
  },
  {
    type: 'kitchen',
    imgs: ['images/13.jpg', 'images/15.jpg', 'images/16.jpg'],
    dur: 90,
    caption: 'Dapur *LENGKAP* tinggal masak je',
    chips: ['Oven', 'Microwave', 'Peti sejuk', 'Penapis air'],
  },
  {
    type: 'checklist',
    img: 'images/05.jpg',
    dur: 90,
    title: 'SEMUA DALAM\nSATU RUMAH',
    items: ['Private pool', 'Gazebo & taman', 'Dapur lengkap', 'Ruang tamu luas'],
  },
  {type: 'cta', img: 'images/04.jpg', dur: 90},
];

export const TOTAL_FRAMES = SCENES.reduce((a, s) => a + s.dur, 0);

export const sceneStarts = (): number[] => {
  let acc = 0;
  return SCENES.map((s) => {
    const start = acc;
    acc += s.dur;
    return start;
  });
};
