import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FamilyRide} from './Result';
import {Logo} from '../components/Logo';
import {Headline} from '../components/Text';
import {Sfx} from '../components/Sfx';
import {FONT} from '../components/fonts';
import {BRAND, SAFE_BOX} from '../config';

const ITEMS = [
  {at: 14, text: '✅ Tak perlu beli, sewa ikut tarikh trip'},
  {at: 28, text: '✅ Adik selesa, Ummi tak penat dukung'},
  {at: 42, text: '✅ Beg + skuter dalam satu'},
];
const URGENT_AT = 60;

export const UmrahWhy: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const card = spring({frame: frame - 2, fps, config: {damping: 13}});
  const urg = spring({frame: frame - URGENT_AT, fps, config: {damping: 8, stiffness: 200}});
  const pulse = frame > URGENT_AT ? 1 + Math.sin((frame - URGENT_AT) * 0.35) * 0.04 : 1;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: 'blur(8px) brightness(0.6)', transform: 'scale(1.06)'}}>
        <FamilyRide frame={180 + frame} enter={false} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: SAFE_BOX.x + 10, width: SAFE_BOX.w - 20, top: 540, transform: `scale(${card})`, opacity: card}}>
        <div style={{background: 'white', borderRadius: 34, overflow: 'hidden', boxShadow: '0 24px 70px rgba(0,0,0,0.5)'}}>
          <div style={{background: BRAND.brand, padding: '22px 30px', display: 'flex', justifyContent: 'center'}}>
            <Logo height={62} />
          </div>
          <div style={{padding: '26px 30px', display: 'flex', flexDirection: 'column', gap: 20}}>
            {ITEMS.map((it, i) => {
              const s = spring({frame: frame - it.at, fps, config: {damping: 12, stiffness: 200}});
              return (
                <div key={i} style={{fontFamily: FONT, fontWeight: 800, fontSize: 36, color: '#1a1a1a', opacity: s, transform: `translateX(${(1 - s) * -80}px)`}}>
                  {it.text}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: SAFE_BOX.x, width: SAFE_BOX.w, top: 1110, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            transform: `scale(${urg * pulse}) rotate(${(1 - urg) * -8 - 2}deg)`,
            background: '#ffd23f',
            color: '#1a1a1a',
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 42,
            whiteSpace: 'nowrap',
            padding: '20px 32px',
            borderRadius: 20,
            border: '5px solid #1a1a1a',
            boxShadow: '0 10px 0 rgba(0,0,0,0.3)',
          }}
        >
          ⏳ Tempah awal sebelum berangkat!
        </div>
      </div>
      <Headline text="Kenapa kena sewa? 🤔" start={0} end={104} />
      <Sfx at={0} name="whoosh" volume={0.6} />
      {ITEMS.map((it) => (
        <Sfx key={it.at} at={it.at} name="pop" volume={0.7} />
      ))}
      <Sfx at={URGENT_AT} name="boom" volume={0.6} />
      <Sfx at={URGENT_AT + 2} name="notify" volume={0.6} />
    </AbsoluteFill>
  );
};
