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
import {COLORS, FONT_BODY, FONT_DISPLAY} from '../theme';
import type {Scene} from '../script';
import {Caption, EnterFx, KenBurns, Scrims, Sfx, useSafe} from './Base';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* ------------------------------------------------------------------ HOOK -- */
export const Hook: React.FC<{img: string; dur: number}> = ({img, dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const safe = useSafe();

  // punch-in on the photo + decaying RGB-split glitch
  const punch = spring({frame, fps, config: {damping: 12, stiffness: 160}});
  const bgScale = interpolate(punch, [0, 1], [1.45, 1.08]) + frame * 0.0012;
  const glitch = interpolate(frame, [0, 7], [1, 0], clamp);
  const flash = interpolate(frame, [0, 5], [0.45, 0], clamp);

  // screen shake right after "KE BALI" slams in
  const shakeAmt = interpolate(frame, [8, 20], [22, 0], clamp);
  const sx = (random(`sx${frame}`) - 0.5) * shakeAmt;
  const sy = (random(`sy${frame}`) - 0.5) * shakeAmt;

  const slam = (at: number, from: number) => {
    const s = spring({frame: frame - at, fps, config: {damping: 11, stiffness: 220}});
    return {
      transform: `scale(${interpolate(s, [0, 1], [from, 1])})`,
      opacity: frame >= at ? 1 : 0,
    };
  };

  const pill = spring({frame: frame - 30, fps, config: {damping: 10, stiffness: 170}});
  const arrowY = Math.abs(Math.sin((frame - 40) / 5)) * 26;

  return (
    <AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(${bgScale})`}}>
        <Img src={staticFile(img)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        {glitch > 0 ? (
          <>
            <Img
              src={staticFile(img)}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                mixBlendMode: 'screen',
                filter: 'sepia(1) saturate(8) hue-rotate(-50deg)',
                transform: `translateX(${28 * glitch}px)`,
                opacity: 0.6 * glitch,
              }}
            />
            <Img
              src={staticFile(img)}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
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
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: safe.top + 40,
          left: safe.left,
          right: safe.right,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `translate(${sx * 0.6}px, ${sy * 0.6}px)`,
        }}
      >
        <div
          style={{
            ...slam(0, 1.8),
            fontFamily: FONT_DISPLAY,
            fontSize: 150,
            lineHeight: 1,
            color: COLORS.white,
            letterSpacing: 2,
            textShadow: '0 8px 0 rgba(0,0,0,0.45)',
          }}
        >
          TAK PERLU
        </div>
        <div
          style={{
            ...slam(8, 2.6),
            fontFamily: FONT_DISPLAY,
            fontSize: 245,
            lineHeight: 1.02,
            color: COLORS.yellow,
            textShadow: '0 10px 0 rgba(0,0,0,0.5), 0 0 60px rgba(255,210,63,0.45)',
          }}
        >
          KE BALI
        </div>
        <div
          style={{
            marginTop: 26,
            opacity: frame >= 30 ? 1 : 0,
            transform: `scale(${interpolate(pill, [0, 1], [0.4, 1])}) rotate(-2deg)`,
            backgroundColor: COLORS.white,
            color: COLORS.ink,
            fontFamily: FONT_BODY,
            fontWeight: 900,
            fontSize: 58,
            padding: '14px 34px 18px',
            borderRadius: 999,
            boxShadow: '0 12px 0 rgba(0,0,0,0.35)',
          }}
        >
          untuk vibes macam ni
        </div>
        <svg
          width="110"
          height="110"
          viewBox="0 0 24 24"
          style={{
            marginTop: 26,
            opacity: interpolate(frame, [40, 46], [0, 1], clamp),
            transform: `translateY(${arrowY}px)`,
            filter: 'drop-shadow(0 6px 0 rgba(0,0,0,0.4))',
          }}
        >
          <path
            d="M5 8l7 7 7-7M5 3l7 7 7-7"
            fill="none"
            stroke={COLORS.yellow}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
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
          top: safe.top + 70,
          right: safe.right + 10,
          opacity: frame >= 10 ? 1 : 0,
          transform: `scale(${s}) rotate(${interpolate(s, [0, 1], [-40, -7]) + wobble}deg)`,
          background: `linear-gradient(135deg, ${COLORS.pool}, #0A6CFF)`,
          border: '6px solid #fff',
          borderRadius: 28,
          padding: '18px 30px 22px',
          boxShadow: '0 14px 0 rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <svg width="78" height="78" viewBox="0 0 24 24">
          <path
            d="M2 15c2 0 2-1.5 4-1.5S8 15 10 15s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M2 19.5c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M8 12V4.5a1.5 1.5 0 013 0M16 12V4.5a1.5 1.5 0 013 0M8 7h8M8 10h8"
            fill="none"
            stroke="#fff"
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </svg>
        <div style={{fontFamily: FONT_DISPLAY, fontSize: 76, lineHeight: 0.95, color: '#fff'}}>
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
              top: Math.max(safe.top, y * 1920) - 35,
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
    <Scrims />
    {scene.sticker === 'privatePool' ? <PrivatePoolSticker /> : null}
    {scene.sticker === 'sparkle' ? <Sparkles /> : null}
    <Caption text={scene.caption} />
  </AbsoluteFill>
);

/* --------------------------------------------------------------- KITCHEN -- */
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
      <Scrims top={0.55} />
      <div
        style={{
          position: 'absolute',
          top: safe.top + 100,
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
            <div
              key={chip}
              style={{
                opacity: frame >= at ? 1 : 0,
                transform: `translateX(${interpolate(s, [0, 1], [-420, 0])}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                alignSelf: 'flex-start',
                backgroundColor: 'rgba(255,255,255,0.94)',
                color: COLORS.ink,
                fontFamily: FONT_BODY,
                fontWeight: 800,
                fontSize: 50,
                padding: '12px 30px 14px 18px',
                borderRadius: 999,
                boxShadow: '0 10px 0 rgba(0,0,0,0.3)',
              }}
            >
              <svg width="46" height="46" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="12" fill={COLORS.green} />
                <path
                  d="M6.5 12.5l3.5 3.5 7.5-8"
                  fill="none"
                  stroke="#fff"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {chip}
            </div>
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

/* ------------------------------------------------------------- CHECKLIST -- */
export const ChecklistScene: React.FC<{scene: Extract<Scene, {type: 'checklist'}>}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const safe = useSafe();
  const [l1, l2] = scene.title.split('\n');
  const t = spring({frame, fps, config: {damping: 12, stiffness: 160}});
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
          top: safe.top + 70,
          left: safe.left,
          right: safe.right,
          textAlign: 'center',
          fontFamily: FONT_DISPLAY,
          lineHeight: 1,
          transform: `scale(${interpolate(t, [0, 1], [1.8, 1])})`,
          opacity: interpolate(frame, [0, 4], [0, 1], clamp),
        }}
      >
        <div style={{fontSize: 120, color: '#fff'}}>{l1}</div>
        <div style={{fontSize: 150, color: COLORS.yellow}}>{l2}</div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: safe.top + 430,
          left: safe.left + 20,
          right: safe.right + 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 26,
        }}
      >
        {scene.items.map((item, i) => {
          const at = 18 + i * 12;
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
                gap: 26,
                padding: '22px 30px',
                borderRadius: 28,
                backgroundColor: 'rgba(255,255,255,0.14)',
                border: '2px solid rgba(255,255,255,0.35)',
                fontFamily: FONT_BODY,
                fontWeight: 800,
                fontSize: 58,
                color: '#fff',
              }}
            >
              <svg width="72" height="72" viewBox="0 0 24 24" style={{flexShrink: 0}}>
                <circle cx="12" cy="12" r="11" fill={COLORS.green} />
                <path
                  d="M6.5 12.5l3.5 3.5 7.5-8"
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
              {item}
            </div>
          );
        })}
      </div>
      {scene.items.map((item, i) => (
        <Sfx key={item} src="ding.wav" at={18 + i * 12} volume={0.45} />
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
  const icon = spring({frame, fps, config: {damping: 8, stiffness: 140}});
  const wiggle = frame > 20 ? Math.sin(frame / 3) * 6 * Math.max(0, Math.sin(frame / 12)) : 0;
  const txt = spring({frame: frame - 8, fps, config: {damping: 12, stiffness: 160}});
  const btn = spring({frame: frame - 30, fps, config: {damping: 10, stiffness: 160}});
  const pulse = frame > 40 ? 1 + Math.sin((frame - 40) / 4) * 0.035 : 1;
  const flash = interpolate(frame, [0, 8], [0.85, 0], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: 'brightness(0.45)'}}>
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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <svg
          width="190"
          height="190"
          viewBox="0 0 24 24"
          style={{
            transform: `scale(${icon}) rotate(${wiggle}deg)`,
            filter: 'drop-shadow(0 10px 0 rgba(0,0,0,0.35))',
          }}
        >
          <path d="M6 2.5h12a1 1 0 011 1V22l-7-4.5L5 22V3.5a1 1 0 011-1z" fill={COLORS.yellow} />
        </svg>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 230,
            lineHeight: 1,
            color: COLORS.yellow,
            transform: `scale(${interpolate(txt, [0, 1], [2, 1])})`,
            opacity: frame >= 8 ? 1 : 0,
            textShadow: '0 10px 0 rgba(0,0,0,0.45)',
          }}
        >
          SAVE
        </div>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 900,
            fontSize: 62,
            lineHeight: 1.15,
            color: '#fff',
            marginTop: 10,
            opacity: interpolate(frame, [14, 20], [0, 1], clamp),
            transform: `translateY(${interpolate(frame, [14, 22], [30, 0], clamp)}px)`,
            textShadow: '0 5px 0 rgba(0,0,0,0.45)',
          }}
        >
          video ni &amp; tag
          <br />
          geng trip korang!
        </div>
        <div
          style={{
            marginTop: 50,
            opacity: frame >= 30 ? 1 : 0,
            transform: `scale(${interpolate(btn, [0, 1], [0.3, 1]) * pulse})`,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            backgroundColor: COLORS.white,
            color: COLORS.ink,
            fontFamily: FONT_BODY,
            fontWeight: 900,
            fontSize: 50,
            padding: '22px 42px 24px',
            borderRadius: 999,
            boxShadow: `0 12px 0 rgba(0,0,0,0.35), 0 0 0 ${8 + (pulse - 1) * 200}px rgba(255,210,63,0.35)`,
          }}
        >
          <svg width="54" height="54" viewBox="0 0 24 24">
            <path
              d="M4 5h16v11H9l-5 4V5z"
              fill={COLORS.pool}
              stroke={COLORS.pool}
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          </svg>
          DM untuk tarikh kosong
        </div>
      </div>
      <AbsoluteFill style={{backgroundColor: '#fff', opacity: flash}} />
      <Sfx src="impact.wav" volume={0.9} />
      <Sfx src="pop.wav" at={30} volume={0.8} />
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- TOP TAG -- */
export const TopTag: React.FC = () => {
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
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'rgba(11,18,32,0.6)',
        border: '2px solid rgba(255,255,255,0.35)',
        color: '#fff',
        fontFamily: FONT_BODY,
        fontWeight: 800,
        fontSize: 30,
        letterSpacing: 3,
        padding: '10px 22px 10px 14px',
        borderRadius: 999,
      }}
    >
      <svg width="34" height="34" viewBox="0 0 24 24">
        <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" fill={COLORS.yellow} />
      </svg>
      HOMESTAY TOUR
    </div>
  );
};
