import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Se3s} from '../components/Bags';
import {Logo} from '../components/Logo';
import {Headline} from '../components/Text';
import {Sfx} from '../components/Sfx';
import {FONT} from '../components/fonts';
import {BRAND, SAFE_BOX, WIDTH} from '../config';

const FEATURES = [
  {at: 95, text: '🧳 Beg + skuter dalam satu'},
  {at: 113, text: '🪑 Duduk & terus meluncur'},
  {at: 131, text: '🦵 Lutut boleh rehat'},
];

export const Versus: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const drop = spring({frame: frame - 34, fps, config: {damping: 9, stiffness: 140}});
  const handle = spring({frame: frame - 58, fps, config: {damping: 14}});
  const shine = interpolate(frame, [48, 78], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const nameS = spring({frame: frame - 70, fps, config: {damping: 12}});
  const glow = interpolate(frame, [34, 44, 165], [0, 1, 0.75], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shake = frame >= 40 && frame < 48 ? Math.sin(frame * 4) * 14 : 0;
  const bagW = 760;
  const bagH = (bagW * 420) / 560;

  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #2a3550 0%, #0c0f18 70%)', transform: `translateY(${shake}px)`}}>
      {/* sinar berputar */}
      <AbsoluteFill style={{opacity: glow * 0.5, transform: `rotate(${frame * 0.6}deg) scale(2)`}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `repeating-conic-gradient(from 0deg at 50% 45%, ${BRAND.bagAccent}55 0deg 8deg, transparent 8deg 24deg)`,
          }}
        />
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: WIDTH / 2 - 420,
          top: 450,
          width: 840,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRAND.bagAccent}88 0%, transparent 65%)`,
          opacity: glow,
        }}
      />
      {/* beg SE3S jatuh masuk */}
      <div
        style={{
          position: 'absolute',
          left: SAFE_BOX.x + (SAFE_BOX.w - bagW) / 2,
          top: 470 + (1 - drop) * -1100,
          width: bagW,
          height: bagH,
          transform: `scale(${0.85 + 0.15 * drop}) rotate(${(1 - drop) * -12}deg)`,
        }}
      >
        <Se3s shine={shine} handle={handle} wheelRot={frame * 2} />
      </div>

      {/* nama produk + logo */}
      <div
        style={{
          position: 'absolute',
          left: SAFE_BOX.x,
          width: SAFE_BOX.w,
          top: 1050,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `scale(${nameS})`,
          opacity: nameS,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 22, background: 'rgba(255,255,255,0.08)', padding: '10px 26px', borderRadius: 18, border: '2px solid rgba(255,255,255,0.2)'}}>
          <Logo height={44} />
          <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 44, color: BRAND.bagAccent}}>SE3S</span>
        </div>
      </div>

      {FEATURES.map((f, i) => {
        const s = spring({frame: frame - f.at, fps, config: {damping: 12, stiffness: 200}});
        if (frame < f.at) return null;
        return (
          <div key={i} style={{position: 'absolute', left: SAFE_BOX.x, width: SAFE_BOX.w, top: 1160 + i * 88, display: 'flex', justifyContent: 'center'}}>
            <div
              style={{
                transform: `translateX(${(1 - s) * (i % 2 ? 300 : -300)}px)`,
                opacity: s,
                background: 'white',
                color: '#111',
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 40,
                padding: '12px 30px',
                borderRadius: 999,
                boxShadow: '0 10px 24px rgba(0,0,0,0.4)',
              }}
            >
              {f.text}
            </div>
          </div>
        );
      })}

      <Headline text="Vs.. 🤔" start={0} end={56} size={120} />
      <Headline text="Keputusan bijak 💡" start={58} end={164} />

      <Sfx at={0} name="whoosh" volume={0.7} />
      <Sfx at={2} name="riser" volume={0.6} />
      <Sfx at={38} name="boom" volume={1} />
      <Sfx at={42} name="sparkle" volume={0.6} />
      <Sfx at={58} name="click" volume={0.8} />
      <Sfx at={70} name="ding" volume={0.5} />
      {FEATURES.map((f) => (
        <Sfx key={f.at} at={f.at} name="pop" volume={0.7} />
      ))}
    </AbsoluteFill>
  );
};
