import React, {createContext, useContext} from 'react';
import {
  AbsoluteFill,
  Easing,
  Html5Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {COLORS, FONT_BODY, H, Platform, SAFE, W} from '../theme';
import type {Enter} from '../script';

export const PlatformCtx = createContext<Platform>('tiktok');
export const useSafe = () => SAFE[useContext(PlatformCtx)];

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** One-shot sound effect starting `at` frames into the current sequence. */
export const Sfx: React.FC<{src: string; at?: number; volume?: number}> = ({
  src,
  at = 0,
  volume = 1,
}) => (
  <Sequence from={at} layout="none" name={`sfx ${src}`}>
    <Html5Audio src={staticFile(`sfx/${src}`)} volume={volume} />
  </Sequence>
);

/** Slow push-in for portrait shots, horizontal pan for landscape shots. */
export const KenBurns: React.FC<{
  src: string;
  dur: number;
  orientation: 'portrait' | 'landscape';
  pan?: [number, number];
  zoom?: [number, number];
}> = ({src, dur, orientation, pan = [0.3, 0.6], zoom}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, dur], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  if (orientation === 'portrait') {
    const [z0, z1] = zoom ?? [1.06, 1.16];
    return (
      <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
        <Img
          src={staticFile(src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${interpolate(p, [0, 1], [z0, z1])})`,
          }}
        />
      </AbsoluteFill>
    );
  }
  // landscape 16:9 photo filling a 9:16 frame: height-fit, then pan across
  const scale = interpolate(p, [0, 1], [1.02, 1.08]);
  const imgW = H * (16 / 9) * scale;
  const travel = imgW - W;
  const x = -travel * interpolate(p, [0, 1], pan);
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
      <Img
        src={staticFile(src)}
        style={{
          position: 'absolute',
          height: H * scale,
          width: imgW,
          top: (H - H * scale) / 2,
          left: x,
          objectFit: 'cover',
        }}
      />
    </AbsoluteFill>
  );
};

/** Entrance motion applied to a whole scene during its first frames. */
export const EnterFx: React.FC<{enter: Enter; children: React.ReactNode}> = ({
  enter,
  children,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 15, stiffness: 140}});
  const blur = interpolate(frame, [0, 8], [16, 0], clamp);
  let transform = 'none';
  let flash = 0;
  if (enter === 'zoom') {
    transform = `scale(${interpolate(s, [0, 1], [1.35, 1])})`;
    flash = interpolate(frame, [0, 6], [0.35, 0], clamp);
  } else if (enter === 'slide') {
    const x = interpolate(frame, [0, 9], [W, 0], {...clamp, easing: Easing.out(Easing.cubic)});
    transform = `translateX(${x}px)`;
  } else if (enter === 'whip') {
    transform = `translateX(${interpolate(s, [0, 1], [-260, 0])}px) rotate(${interpolate(
      s,
      [0, 1],
      [-7, 0],
    )}deg) scale(${interpolate(s, [0, 1], [1.3, 1])})`;
  } else if (enter === 'flash') {
    transform = `scale(${interpolate(s, [0, 1], [1.12, 1])})`;
    flash = interpolate(frame, [0, 10], [1, 0], clamp);
  }
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <AbsoluteFill
        style={{transform, filter: enter === 'none' ? undefined : `blur(${blur}px)`}}
      >
        {children}
      </AbsoluteFill>
      {flash > 0 ? <AbsoluteFill style={{backgroundColor: '#fff', opacity: flash}} /> : null}
    </AbsoluteFill>
  );
};

/** Dark gradients top + bottom so white text stays readable on any photo. */
export const Scrims: React.FC<{top?: number; bottom?: number}> = ({top = 0.45, bottom = 0.75}) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg, rgba(0,0,0,${top}) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 52%, rgba(0,0,0,${bottom}) 100%)`,
    }}
  />
);

type Chunk = {text: string; hi: boolean};
const parse = (caption: string): Chunk[] =>
  caption
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .flatMap((part): Chunk[] =>
      part.startsWith('*')
        ? [{text: part.slice(1, -1), hi: true}]
        : part
            .split(/\s+/)
            .filter(Boolean)
            .map((w) => ({text: w, hi: false})),
    );

/** Word-by-word kinetic caption, anchored just above the bottom safe line. */
export const Caption: React.FC<{text: string; delay?: number; size?: number}> = ({
  text,
  delay = 4,
  size = 74,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const safe = useSafe();
  const chunks = parse(text);
  let hiAt = -1;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: safe.left,
          right: safe.right,
          bottom: safe.bottom + 40,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px 18px',
          fontFamily: FONT_BODY,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.12,
          color: COLORS.white,
          textAlign: 'center',
          textShadow: '0 5px 0 rgba(0,0,0,0.45), 0 0 26px rgba(0,0,0,0.7)',
        }}
      >
        {chunks.map((c, i) => {
          const start = delay + i * 3;
          if (c.hi && hiAt < 0) hiAt = start;
          const s = spring({
            frame: frame - start,
            fps,
            config: {damping: c.hi ? 9 : 14, stiffness: 180},
          });
          const style: React.CSSProperties = {
            display: 'inline-block',
            opacity: interpolate(frame - start, [0, 3], [0, 1], clamp),
            transform: `translateY(${interpolate(s, [0, 1], [34, 0])}px) scale(${interpolate(
              s,
              [0, 1],
              [c.hi ? 0.3 : 0.7, 1],
            )})${c.hi ? ' rotate(-2deg)' : ''}`,
          };
          if (c.hi) {
            Object.assign(style, {
              backgroundColor: COLORS.yellow,
              color: COLORS.ink,
              padding: '4px 20px 8px',
              borderRadius: 14,
              textShadow: 'none',
              boxShadow: '0 10px 0 rgba(0,0,0,0.35)',
            });
          }
          return (
            <span key={i} style={style}>
              {c.text}
            </span>
          );
        })}
      </div>
      {hiAt >= 0 ? <Sfx src="pop.wav" at={hiAt} volume={0.7} /> : null}
    </AbsoluteFill>
  );
};

/** Red bands showing where TikTok / Reels UI covers the frame (Studio only). */
export const SafeZoneOverlay: React.FC = () => {
  const safe = useSafe();
  const band = 'rgba(255,0,60,0.28)';
  const label: React.CSSProperties = {
    position: 'absolute',
    fontFamily: FONT_BODY,
    fontWeight: 800,
    fontSize: 28,
    color: '#fff',
  };
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: safe.top, background: band}} />
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: safe.bottom, background: band}} />
      <div
        style={{position: 'absolute', top: safe.top, bottom: safe.bottom, left: 0, width: safe.left, background: band}}
      />
      <div
        style={{position: 'absolute', top: safe.top, bottom: safe.bottom, right: 0, width: safe.right, background: band}}
      />
      <div
        style={{
          position: 'absolute',
          top: safe.top,
          bottom: safe.bottom,
          left: safe.left,
          right: safe.right,
          border: '3px dashed #ff2d55',
        }}
      />
      <div style={{...label, top: safe.top - 44, left: safe.left}}>SAFE ZONE</div>
    </AbsoluteFill>
  );
};
