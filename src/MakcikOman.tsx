import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CUTS, FPS, SEGMENT_START_FRAMES, f } from "./data";
import { Captions } from "./components/Captions";
import { Hook, HOOK_FRAMES, HOOK_SWITCH } from "./components/Hook";
import { Scenes } from "./components/Scenes";

type Sfx = { at: number; src: string; vol: number };

const s = (name: string) => staticFile(`sfx/${name}.wav`);

const SFX: Sfx[] = [
  // ---- Hook ----
  { at: 0, src: s("impact"), vol: 0.75 },
  { at: 2, src: s("swoosh"), vol: 0.45 },
  { at: 6, src: s("pop"), vol: 0.6 },
  { at: 16, src: s("tick"), vol: 0.5 },
  { at: 22, src: s("tick"), vol: 0.5 },
  { at: 28, src: s("pop"), vol: 0.5 },
  { at: HOOK_SWITCH - 30, src: s("riser"), vol: 0.3 },
  { at: HOOK_SWITCH, src: s("impact"), vol: 0.7 },
  { at: HOOK_SWITCH + 7, src: s("pop"), vol: 0.6 },
  { at: HOOK_FRAMES - 10, src: s("whoosh"), vol: 0.45 },
  // ---- jump cuts ----
  ...SEGMENT_START_FRAMES.slice(1).map((at) => ({ at: at - 3, src: s("swoosh"), vol: 0.3 })),
  // ---- mid-video graphics ----
  { at: f(6.3), src: s("impact"), vol: 0.45 },
  { at: f(8.5), src: s("ding"), vol: 0.35 },
  { at: f(13.2), src: s("whoosh"), vol: 0.5 },
  { at: f(13.2) + 6, src: s("pop"), vol: 0.45 },
  { at: f(16.0), src: s("pop"), vol: 0.5 },
  { at: f(17.12), src: s("pop"), vol: 0.5 },
  { at: f(19.6), src: s("swoosh"), vol: 0.4 },
  { at: f(19.6) + 4, src: s("sparkle"), vol: 0.45 },
  { at: f(23.62), src: s("pop"), vol: 0.5 },
  { at: f(24.42), src: s("click"), vol: 0.5 },
  { at: f(24.42) + 4, src: s("pop"), vol: 0.5 },
  { at: f(26.3), src: s("pop"), vol: 0.45 },
  { at: f(28.08), src: s("swoosh"), vol: 0.35 },
  { at: f(28.08) + 9, src: s("sparkle"), vol: 0.45 },
  { at: f(30.9) + 4, src: s("pop"), vol: 0.5 },
  { at: f(32.68), src: s("pop"), vol: 0.55 },
  { at: f(33.4), src: s("impact"), vol: 0.6 },
  { at: f(36.24), src: s("swoosh"), vol: 0.4 },
  ...[0, 1, 2].map((i) => ({ at: f(36.24) + 14 + i * 14, src: s("ding"), vol: 0.22 })),
  { at: f(38.8) + 4, src: s("pop"), vol: 0.6 },
  { at: f(38.8) + 6, src: s("sparkle"), vol: 0.4 },
  { at: f(40.24), src: s("swoosh"), vol: 0.4 },
];

/** Frames where the footage gets a zoom "punch" for energy. */
const PUNCHES = [0, HOOK_SWITCH, ...SEGMENT_START_FRAMES.slice(1), f(6.3), f(19.6), f(33.4), f(38.8)];

const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let punch = 0;
  for (const p of PUNCHES) {
    if (frame >= p && frame < p + 20) {
      const k = spring({ frame: frame - p, fps, config: { damping: 15, stiffness: 160 } });
      punch = Math.max(punch, (1 - k) * (p === 0 ? 0.22 : 0.09));
    }
  }
  // slow push-in across the whole edit
  const drift = interpolate(frame, [0, f(41.5)], [1.0, 1.06]);
  return (
    <AbsoluteFill style={{ transform: `scale(${drift + punch})`, transformOrigin: "50% 45%" }}>
      {CUTS.map(([a, b], i) => (
        <Sequence key={i} from={SEGMENT_START_FRAMES[i]} durationInFrames={Math.round((b - a) * FPS)}>
          <OffthreadVideo src={staticFile("main.mp4")} startFrom={Math.round(a * FPS)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const MakcikOman: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Footage />
    <Scenes />
    <Sequence durationInFrames={HOOK_FRAMES} layout="none">
      <Hook />
    </Sequence>
    <Captions />
    {SFX.map((x, i) => (
      <Sequence key={i} from={x.at} layout="none">
        <Audio src={x.src} volume={x.vol} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
