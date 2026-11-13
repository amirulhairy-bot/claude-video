import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Se3s, SE3S_VB} from '../components/Bags';
import {Logo} from '../components/Logo';
import {Sfx} from '../components/Sfx';
import {FONT} from '../components/fonts';
import {BRAND, SAFE_BOX} from '../config';

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame, fps, config: {damping: 12}});
  const b = spring({frame: frame - 10, fps, config: {damping: 12}});
  const c = spring({frame: frame - 20, fps, config: {damping: 12}});
  const out = interpolate(frame, [78, 90], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const bagW = 400;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #5285c4, ${BRAND.brand} 45%, #2b4f80 100%)`, opacity: out}}>
      <div style={{position: 'absolute', left: SAFE_BOX.x, width: SAFE_BOX.w, top: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        <div style={{transform: `scale(${a})`}}>
          <Logo height={130} />
        </div>
        <div style={{transform: `scale(${b})`, fontFamily: FONT, fontWeight: 800, fontSize: 60, color: 'white'}}>Sewa {BRAND.productName}</div>
        <div style={{width: bagW, height: (bagW * SE3S_VB.h) / SE3S_VB.w, transform: `translateY(${(1 - c) * 200}px) rotate(${(1 - c) * 10}deg)`, opacity: c}}>
          <Se3s shine={interpolate(frame, [25, 55], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} wheelRot={0} />
        </div>
        <div
          style={{
            transform: `scale(${c})`,
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 44,
            color: BRAND.brand,
            background: 'white',
            padding: '14px 36px',
            borderRadius: 999,
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          }}
        >
          Follow {BRAND.handle} 🔔
        </div>
      </div>
      <Sfx at={0} name="whoosh" volume={0.6} />
      <Sfx at={20} name="sparkle" volume={0.6} />
    </AbsoluteFill>
  );
};
