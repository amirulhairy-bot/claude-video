import React from 'react';
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {COLORS, FONT_BODY, H, W} from '../theme';
import type {AmenityIcon, Scene} from '../script';
import {Caption, EnterFx, KenBurns, Scrims, Sfx, Slab, useSafe} from './Base';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const BLUE = COLORS.brand;

/* ------------------------------------------------------------------ ICONS -- */
const ICON_PATHS: Record<AmenityIcon | 'check' | 'bookmark' | 'chat' | 'pool' | 'down', string> = {
  aircond: 'M3 5h18a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zM6 10h12M7 16v3M12 16v4M17 16v3',
  toilet: 'M6 3h6v6H6zM4 9h15c0 4-3 6.5-6.5 6.5L13 21H8l.5-5.5C6 15 4 13 4 9z',
  wifi: 'M2 9a15 15 0 0120 0M5 12.5a10 10 0 0114 0M8.5 16a5 5 0 017 0M12 19.5h.01',
  tv: 'M4 5h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zM8 21h8M12 17v4M9 2l3 3 3-3',
  water: 'M12 3s6 7 6 11a6 6 0 01-12 0c0-4 6-11 6-11zM9.5 14.5a2.5 2.5 0 002.5 2.5',
  microwave: 'M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zM5 8h10v8H5zM18.5 9h.01M18.5 13h.01',
  oven: 'M5 3h14a1 1 0 011 1v16a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1zM4 8h16M7 11h10v6H7zM8 5.5h.01M12 5.5h.01M16 5.5h.01',
  playground: 'M5 21V4M9 21V4M5 8h4M5 12h4M5 16h4M9 4c5 0 6 8 12 16',
  check: 'M6.5 12.5l3.5 3.5 7.5-8',
  bookmark: 'M6 2.5h12a1 1 0 011 1V22l-7-4.5L5 22V3.5a1 1 0 011-1z',
  chat: 'M4 5h16v11H9l-5 4V5z',
  pool: 'M2 15c2 0 2-1.5 4-1.5S8 15 10 15s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M2 19.5c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M8 12V4.5a1.5 1.5 0 013 0M16 12V4.5a1.5 1.5 0 013 0M8 7h8M8 10h8',
  down: 'M5 8l7 7 7-7M5 3l7 7 7-7',
};

const Icon: React.FC<{
  name: keyof typeof ICON_PATHS;
  size: number;
  color?: string;
  stroke?: number;
  fill?: boolean;
  style?: React.CSSProperties;
}> = ({name, size, color = BLUE, stroke = 2, fill = false, style}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <path
      d={ICON_PATHS[name]}
      fill={fill ? color : 'none'}
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckBadge: React.FC<{size: number; draw?: number}> = ({size, draw = 0}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{flexShrink: 0}}>
    <circle cx="12" cy="12" r="11" fill={BLUE} />
    <path
      d={ICON_PATHS.check}
      fill="none"
      stroke="#fff"
      strokeWidth={2.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={draw}
    />
  </svg>
);

/* ------------------------------------------------------------------ LOGO -- */
const LOGO_RATIO = 6006 / 3508;
export const Logo: React.FC<{height: number; style?: React.CSSProperties}> = ({height, style}) => (
  <Img src={staticFile('images/logo.png')} style={{height, width: height * LOGO_RATIO, ...style}} />
);

/* ------------------------------------------------------------------ HOOK -- */
// Landscape photo filling the 9:16 frame, zoomed in on a focus point.
const FocusImage: React.FC<{src: string; zoom: number; fx: number; fy: number; style?: React.CSSProperties}> = ({
  src,
  zoom,
  fx,
  fy,
  style,
}) => {
  const imgH = H * zoom;
  const imgW = imgH * (16 / 9);
  const left = Math.min(0, Math.max(W - imgW, W / 2 - fx * imgW));
  const top = Math.min(0, Math.max(H - imgH, H / 2 - fy * imgH));
  return (
    <Img
      src={staticFile(src)}
      style={{position: 'absolute', left, top, width: imgW, height: imgH, objectFit: 'cover', ...style}}
    />
  );
};

export const Hook: React.FC<{img: string; dur: number}> = ({img}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const safe = useSafe();

  // punch-in on the arcade + decaying RGB-split glitch + CRT scanlines
  const punch = spring({frame, fps, config: {damping: 12, stiffness: 160}});
  const zoom = interpolate(punch, [0, 1], [1.7, 1.25]) + frame * 0.0015;
  const glitch = interpolate(frame, [0, 7], [1, 0], clamp);
  const flash = interpolate(frame, [0, 5], [0.45, 0], clamp);
  const scan = interpolate(frame, [0, 20], [0.35, 0.12], clamp);

  const shakeAmt = interpolate(frame, [8, 20], [22, 0], clamp);
  const sx = (random(`sx${frame}`) - 0.5) * shakeAmt;
  const sy = (random(`sy${frame}`) - 0.5) * shakeAmt;

  const slam = (at: number, from: number) => {
    const s = spring({frame: frame - at, fps, config: {damping: 11, stiffness: 220}});
    return {scale: interpolate(s, [0, 1], [from, 1]), opacity: frame >= at ? 1 : 0};
  };
  const l1 = slam(0, 1.8);
  const l2 = slam(8, 2.6);
  const pill = spring({frame: frame - 30, fps, config: {damping: 10, stiffness: 170}});
  const arrowY = Math.abs(Math.sin((frame - 40) / 5)) * 20;
  const fx = 0.77;
  const fy = 0.72;

  return (
    <AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px)`}}>
        <FocusImage src={img} zoom={zoom} fx={fx} fy={fy} />
        {glitch > 0 ? (
          <>
            <FocusImage
              src={img}
              zoom={zoom}
              fx={fx}
              fy={fy}
              style={{
                mixBlendMode: 'screen',
                filter: 'sepia(1) saturate(8) hue-rotate(-50deg)',
                transform: `translateX(${28 * glitch}px)`,
                opacity: 0.6 * glitch,
              }}
            />
            <FocusImage
              src={img}
              zoom={zoom}
              fx={fx}
              fy={fy}
              style={{
                mixBlendMode: 'screen',
                filter: 'sepia(1) saturate(8) hue-rotate(150deg)',
                transform: `translateX(${-28 * glitch}px)`,
                opacity: 0.6 * glitch,
              }}
            />
          </>
        ) : null}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: scan,
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0px, rgba(0,0,0,0.6) 2px, transparent 2px, transparent 6px)',
        }}
      />
      <AbsoluteFill
        style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 40%)'}}
      />

      <div
        style={{
          position: 'absolute',
          top: safe.top + 20,
          left: safe.left,
          right: safe.right,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 22,
          transform: `translate(${sx * 0.6}px, ${sy * 0.6}px)`,
        }}
      >
        <div style={{opacity: l1.opacity, transform: `scale(${l1.scale})`}}>
          <Slab size={92} rotate={2}>HOMESTAY NI ADA</Slab>
        </div>
        <div style={{opacity: l2.opacity, transform: `scale(${l2.scale})`}}>
          <Slab size={118} bg={COLORS.yellow} rotate={-3} style={{whiteSpace: 'nowrap'}}>
            MESIN ARCADE?!
          </Slab>
        </div>
        <div
          style={{
            opacity: frame >= 30 ? 1 : 0,
            transform: `scale(${interpolate(pill, [0, 1], [0.4, 1])}) rotate(-1deg)`,
            backgroundColor: COLORS.white,
            color: BLUE,
            fontFamily: FONT_BODY,
            fontWeight: 900,
            fontSize: 50,
            padding: '12px 32px 16px',
            borderRadius: 999,
            boxShadow: '0 10px 0 rgba(13,74,137,0.4)',
          }}
        >
          + private pool sendiri
        </div>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 999,
            backgroundColor: COLORS.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: interpolate(frame, [40, 46], [0, 1], clamp),
            transform: `translateY(${arrowY}px)`,
            boxShadow: '0 8px 0 rgba(13,74,137,0.4)',
          }}
        >
          <Icon name="down" size={56} stroke={3} />
        </div>
      </div>

      <AbsoluteFill style={{backgroundColor: '#fff', opacity: flash}} />

      <Sfx src="impact.wav" at={0} volume={0.9} />
      <Sfx src="whoosh_fast.wav" at={6} volume={0.6} />
      <Sfx src="impact.wav" at={8} volume={1} />
      <Sfx src="pop.wav" at={30} volume={0.8} />
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------- STICKERS -- */
const PrivatePoolSticker: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const safe = useSafe();
  const s = spring({frame: frame - 10, fps, config: {damping: 9, stiffness: 150}});
  const wobble = Math.sin(frame / 8) * 2;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: safe.top + 170,
          right: safe.right + 10,
          opacity: frame >= 10 ? 1 : 0,
          transform: `scale(${s}) rotate(${interpolate(s, [0, 1], [-40, -7]) + wobble}deg)`,
          backgroundColor: COLORS.white,
          border: `6px solid ${BLUE}`,
          borderRadius: 28,
          padding: '16px 28px 20px',
          boxShadow: '0 14px 0 rgba(13,74,137,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Icon name="pool" size={78} stroke={1.8} />
        <div style={{fontFamily: 'Anton, Impact, sans-serif', fontSize: 76, lineHeight: 0.95, color: BLUE}}>
          PRIVATE
          <br />
          POOL
        </div>
      </div>
      <Sfx src="impact.wav" at={10} volume={0.45} />
    </>
  );
};

const Sparkles: React.FC = () => {
  const frame = useCurrentFrame();
  const safe = useSafe();
  const spots = [
    [0.18, 0.36],
    [0.33, 0.33],
    [0.5, 0.31],
    [0.66, 0.3],
    [0.78, 0.27],
    [0.42, 0.42],
    [0.6, 0.39],
  ];
  return (
    <>
      {spots.map(([x, y], i) => {
        const tw = Math.max(0, Math.sin((frame + i * 7) / 4.5));
        return (
          <svg
            key={i}
            width="70"
            height="70"
            viewBox="0 0 24 24"
            style={{
              position: 'absolute',
              left: `calc(${x * 100}% - 35px)`,
              top: Math.max(safe.top + 150, y * 1920) - 35,
              transform: `scale(${0.4 + tw * 0.9}) rotate(${frame * 3}deg)`,
              opacity: frame > 6 ? tw : 0,
              filter: 'drop-shadow(0 0 10px rgba(255,220,120,0.9))',
            }}
          >
            <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" fill="#FFF3C4" />
          </svg>
        );
      })}
    </>
  );
};

/* ----------------------------------------------------------------- PHOTO -- */
export const PhotoScene: React.FC<{scene: Extract<Scene, {type: 'photo'}>}> = ({scene}) => (
  <AbsoluteFill>
    <EnterFx enter={scene.enter}>
      <KenBurns src={scene.img} dur={scene.dur} orientation={scene.orientation} pan={scene.pan} />
    </EnterFx>
    <Scrims top={0.3} bottom={0.45} />
    {scene.sticker === 'privatePool' ? <PrivatePoolSticker /> : null}
    {scene.sticker === 'sparkle' ? <Sparkles /> : null}
    <Caption text={scene.caption} />
  </AbsoluteFill>
);

/* --------------------------------------------------------------- KITCHEN -- */
const Pill: React.FC<{children: React.ReactNode; size?: number; style?: React.CSSProperties}> = ({
  children,
  size = 48,
  style,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.96)',
      color: BLUE,
      fontFamily: FONT_BODY,
      fontWeight: 800,
      fontSize: size,
      padding: '10px 28px 12px 14px',
      borderRadius: 999,
      boxShadow: '0 10px 0 rgba(13,74,137,0.35)',
      ...style,
    }}
  >
    {children}
  </div>
);

export const KitchenScene: React.FC<{scene: Extract<Scene, {type: 'kitchen'}>}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const safe = useSafe();
  const per = Math.floor(scene.dur / scene.imgs.length);
  const pans: [number, number][] = [
    [0.3, 0.55],
    [0.6, 0.35],
    [0.35, 0.65],
  ];
  return (
    <AbsoluteFill>
      {scene.imgs.map((img, i) => (
        <Sequence key={img} from={i * per} durationInFrames={per} name={`kitchen ${i + 1}`}>
          <EnterFx enter={i === 0 ? 'zoom' : 'flash'}>
            <KenBurns src={img} dur={per} orientation="landscape" pan={pans[i % pans.length]} />
          </EnterFx>
          {i > 0 ? <Sfx src="shutter.wav" volume={0.8} /> : null}
        </Sequence>
      ))}
      <Scrims top={0.35} bottom={0.45} />
      <div
        style={{
          position: 'absolute',
          top: safe.top + 170,
          left: safe.left,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {scene.chips.map((chip, i) => {
          const at = 10 + i * 10;
          const s = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 170}});
          return (
            <Pill
              key={chip}
              style={{
                opacity: frame >= at ? 1 : 0,
                transform: `translateX(${interpolate(s, [0, 1], [-480, 0])}px)`,
              }}
            >
              <CheckBadge size={46} />
              {chip}
            </Pill>
          );
        })}
      </div>
      {scene.chips.map((c, i) => (
        <Sfx key={c} src="pop.wav" at={10 + i * 10} volume={0.55} />
      ))}
      <Caption text={scene.caption} delay={6} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------- AMENITIES -- */
export const AmenitiesScene: React.FC<{scene: Extract<Scene, {type: 'amenities'}>}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const safe = useSafe();
  const t = spring({frame, fps, config: {damping: 12, stiffness: 160}});
  const gap = 20;
  const colW = (W - safe.left - safe.right - gap) / 2;
  return (
    <AbsoluteFill>
      <EnterFx enter="slide">
        <AbsoluteFill style={{filter: 'blur(12px) brightness(0.55)', transform: 'scale(1.12)'}}>
          <KenBurns src={scene.img} dur={scene.dur} orientation="landscape" pan={[0.2, 0.45]} />
        </AbsoluteFill>
      </EnterFx>
      <div
        style={{
          position: 'absolute',
          top: safe.top + 30,
          left: safe.left,
          right: safe.right,
          display: 'flex',
          justifyContent: 'center',
          transform: `scale(${interpolate(t, [0, 1], [1.8, 1])})`,
          opacity: interpolate(frame, [0, 4], [0, 1], clamp),
        }}
      >
        <Slab size={120} rotate={-2}>
          {scene.title}
        </Slab>
      </div>
      <div
        style={{
          position: 'absolute',
          top: safe.top + 250,
          left: safe.left,
          right: safe.right,
          display: 'flex',
          flexWrap: 'wrap',
          gap,
        }}
      >
        {scene.items.map((item, i) => {
          const at = 12 + i * 6;
          const s = spring({frame: frame - at, fps, config: {damping: 11, stiffness: 180}});
          return (
            <div
              key={item.label}
              style={{
                width: colW,
                height: 172,
                opacity: frame >= at ? 1 : 0,
                transform: `scale(${interpolate(s, [0, 1], [0.4, 1])}) rotate(${interpolate(
                  s,
                  [0, 1],
                  [i % 2 ? 8 : -8, 0],
                )}deg)`,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '0 18px',
                boxSizing: 'border-box',
                backgroundColor: 'rgba(255,255,255,0.96)',
                borderRadius: 26,
                boxShadow: '0 10px 0 rgba(13,74,137,0.35)',
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  flexShrink: 0,
                  borderRadius: 22,
                  backgroundColor: COLORS.brandSoft,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={item.icon} size={68} stroke={1.9} />
              </div>
              <div style={{color: BLUE, fontFamily: FONT_BODY, lineHeight: 1.05}}>
                <div style={{fontWeight: 900, fontSize: item.label.length > 8 ? 40 : 50}}>{item.label}</div>
                {item.sub ? <div style={{fontWeight: 600, fontSize: 30, marginTop: 4}}>{item.sub}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
      {scene.items.map((item, i) => (
        <Sfx key={item.label} src="pop.wav" at={12 + i * 6} volume={0.45} />
      ))}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------- CHECKLIST -- */
export const ChecklistScene: React.FC<{scene: Extract<Scene, {type: 'checklist'}>}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const safe = useSafe();
  const [l1, l2] = scene.title.split('\n');
  const t = spring({frame, fps, config: {damping: 12, stiffness: 160}});
  const step = 10;
  return (
    <AbsoluteFill>
      <EnterFx enter="zoom">
        <AbsoluteFill style={{filter: 'blur(14px) brightness(0.5) saturate(1.2)', transform: 'scale(1.15)'}}>
          <KenBurns src={scene.img} dur={scene.dur} orientation="portrait" />
        </AbsoluteFill>
      </EnterFx>
      <div
        style={{
          position: 'absolute',
          top: safe.top + 30,
          left: safe.left,
          right: safe.right,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          transform: `scale(${interpolate(t, [0, 1], [1.8, 1])})`,
          opacity: interpolate(frame, [0, 4], [0, 1], clamp),
        }}
      >
        <Slab size={88} rotate={2}>
          {l1}
        </Slab>
        <Slab size={120} bg={COLORS.yellow} rotate={-2}>
          {l2}
        </Slab>
      </div>
      <div
        style={{
          position: 'absolute',
          top: safe.top + 380,
          left: safe.left + 10,
          right: safe.right + 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {scene.items.map((item, i) => {
          const at = 16 + i * step;
          const s = spring({frame: frame - at, fps, config: {damping: 13, stiffness: 170}});
          const draw = interpolate(frame - at, [3, 12], [1, 0], clamp);
          return (
            <div
              key={item}
              style={{
                opacity: frame >= at ? 1 : 0,
                transform: `translateY(${interpolate(s, [0, 1], [60, 0])}px) scale(${interpolate(
                  s,
                  [0, 1],
                  [0.85, 1],
                )})`,
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                padding: '18px 26px',
                borderRadius: 26,
                backgroundColor: 'rgba(255,255,255,0.96)',
                boxShadow: '0 10px 0 rgba(13,74,137,0.35)',
                fontFamily: FONT_BODY,
                fontWeight: 800,
                fontSize: 48,
                color: BLUE,
              }}
            >
              <CheckBadge size={62} draw={draw} />
              {item}
            </div>
          );
        })}
      </div>
      {scene.items.map((item, i) => (
        <Sfx key={item} src="ding.wav" at={16 + i * step} volume={0.45} />
      ))}
      <Sfx src="riser.wav" at={scene.dur - 60} volume={0.6} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------- CTA -- */
export const CtaScene: React.FC<{img: string; dur: number}> = ({img, dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const safe = useSafe();
  const card = spring({frame, fps, config: {damping: 12, stiffness: 140}});
  const logo = spring({frame: frame - 4, fps, config: {damping: 14, stiffness: 120}});
  const save = spring({frame: frame - 14, fps, config: {damping: 9, stiffness: 160}});
  const btn = spring({frame: frame - 30, fps, config: {damping: 10, stiffness: 160}});
  const pulse = frame > 40 ? 1 + Math.sin((frame - 40) / 4) * 0.035 : 1;
  const wiggle = frame > 24 ? Math.sin(frame / 3) * 8 * Math.max(0, Math.sin(frame / 12)) : 0;
  const flash = interpolate(frame, [0, 8], [0.85, 0], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: 'blur(6px) brightness(0.5)'}}>
        <KenBurns src={img} dur={dur} orientation="portrait" zoom={[1.15, 1.3]} />
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: safe.top,
          bottom: safe.bottom,
          left: safe.left,
          right: safe.right,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            transform: `translateY(${interpolate(card, [0, 1], [500, 0])}px) scale(${interpolate(
              card,
              [0, 1],
              [0.8, 1],
            )})`,
            backgroundColor: COLORS.white,
            borderRadius: 44,
            padding: '56px 40px 60px',
            boxSizing: 'border-box',
            boxShadow: '0 18px 0 rgba(13,74,137,0.45), 0 30px 80px rgba(0,0,0,0.45)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            color: BLUE,
          }}
        >
          <Logo
            height={290}
            style={{
              opacity: interpolate(logo, [0, 1], [0, 1]),
              transform: `scale(${interpolate(logo, [0, 1], [0.7, 1])})`,
            }}
          />
          <div style={{width: '70%', height: 4, backgroundColor: BLUE, margin: '34px 0 28px', opacity: 0.25}} />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              transform: `scale(${interpolate(save, [0, 1], [1.8, 1])})`,
              opacity: frame >= 14 ? 1 : 0,
            }}
          >
            <Icon name="bookmark" size={120} color={BLUE} fill style={{transform: `rotate(${wiggle}deg)`}} />
            <div style={{fontFamily: 'Anton, Impact, sans-serif', fontSize: 170, lineHeight: 1}}>SAVE</div>
          </div>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontWeight: 900,
              fontSize: 50,
              lineHeight: 1.15,
              marginTop: 12,
              opacity: interpolate(frame, [20, 26], [0, 1], clamp),
              transform: `translateY(${interpolate(frame, [20, 28], [24, 0], clamp)}px)`,
            }}
          >
            video ni &amp; tag
            <br />
            geng trip korang!
          </div>
          <div
            style={{
              marginTop: 40,
              opacity: frame >= 30 ? 1 : 0,
              transform: `scale(${interpolate(btn, [0, 1], [0.3, 1]) * pulse})`,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              backgroundColor: COLORS.yellow,
              fontFamily: FONT_BODY,
              fontWeight: 900,
              fontSize: 46,
              padding: '20px 40px 22px',
              borderRadius: 999,
              boxShadow: `0 10px 0 rgba(13,74,137,0.4), 0 0 0 ${6 + (pulse - 1) * 220}px rgba(255,210,63,0.35)`,
            }}
          >
            <Icon name="chat" size={52} color={BLUE} fill />
            DM untuk tarikh kosong
          </div>
        </div>
      </div>
      <AbsoluteFill style={{backgroundColor: '#fff', opacity: flash}} />
      <Sfx src="impact.wav" volume={0.9} />
      <Sfx src="pop.wav" at={30} volume={0.8} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ LOGO BADGE -- */
export const LogoBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const safe = useSafe();
  const s = spring({frame, fps, config: {damping: 14, stiffness: 150}});
  return (
    <div
      style={{
        position: 'absolute',
        top: safe.top,
        left: safe.left,
        transform: `translateY(${interpolate(s, [0, 1], [-40, 0])}px)`,
        opacity: s,
        backgroundColor: 'rgba(255,255,255,0.96)',
        borderRadius: 22,
        padding: '10px 16px',
        boxShadow: '0 8px 0 rgba(13,74,137,0.35)',
        display: 'flex',
      }}
    >
      <Logo height={110} />
    </div>
  );
};
