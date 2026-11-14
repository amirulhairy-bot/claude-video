import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {RiderOnAirport} from './Result';
import {Headline} from '../components/Text';
import {Sfx} from '../components/Sfx';
import {FONT} from '../components/fonts';
import {BRAND, SAFE_BOX} from '../config';

const TYPE_START = 22;
const CHAR_EVERY = 4;

export const Cta: React.FC<{word?: string; headline?: string; bg?: (frame: number) => React.ReactNode}> = ({word: wordProp, headline, bg}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const word = wordProp ?? BRAND.commentKeyword;
  const typed = Math.max(0, Math.min(word.length, Math.floor((frame - TYPE_START) / CHAR_EVERY) + 1));
  const sendAt = TYPE_START + word.length * CHAR_EVERY + 8;
  const sent = frame >= sendAt;
  const cardS = spring({frame: frame - 8, fps, config: {damping: 12}});
  const sendPress = sent ? spring({frame: frame - sendAt, fps, config: {damping: 8}}) : 0;
  const cursor = Math.floor(frame / 8) % 2 === 0;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: 'blur(7px) brightness(0.55)', transform: 'scale(1.06)'}}>
        {bg ? bg(frame) : <RiderOnAirport frame={180 + frame} enter={false} />}
      </AbsoluteFill>

      {/* kotak komen */}
      <div style={{position: 'absolute', left: SAFE_BOX.x + 20, width: SAFE_BOX.w - 40, top: 820, transform: `scale(${cardS})`, opacity: cardS}}>
        <div style={{background: 'white', borderRadius: 34, padding: 30, boxShadow: '0 20px 60px rgba(0,0,0,0.5)'}}>
          <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 30, color: '#888', marginBottom: 14}}>💬 Tambah komen...</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <div style={{width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(135deg,#B83B6B,#f5a623)', flexShrink: 0}} />
            <div
              style={{
                flex: 1,
                background: '#f1f2f4',
                borderRadius: 999,
                padding: '16px 28px',
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 52,
                color: '#111',
                minHeight: 62,
              }}
            >
              {word.slice(0, typed)}
              {!sent && cursor && <span style={{color: '#e5312b'}}>|</span>}
              {sent && ' 🙋‍♀️'}
            </div>
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                background: sent ? '#fe2c55' : '#ddd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 40,
                transform: `scale(${1 + 0.25 * Math.sin(sendPress * Math.PI)})`,
                flexShrink: 0,
              }}
            >
              ➤
            </div>
          </div>
        </div>
      </div>

      {/* hati terapung selepas hantar */}
      {sent &&
        Array.from({length: 7}, (_, i) => {
          const t = frame - sendAt - i * 3;
          if (t < 0) return null;
          const y = interpolate(t, [0, 45], [0, -420], {extrapolateRight: 'clamp'});
          const o = interpolate(t, [0, 10, 45], [0, 1, 0], {extrapolateRight: 'clamp'});
          return (
            <div key={i} style={{position: 'absolute', left: SAFE_BOX.x + SAFE_BOX.w - 160 + Math.sin(t * 0.2 + i) * 40 - i * 20, top: 880 + y, fontSize: 64, opacity: o}}>
              {i % 2 ? '❤️' : '🧡'}
            </div>
          );
        })}

      <Headline text={headline ?? `Komen "${word}" kalau nak sewa 🧳`} start={0} end={119} size={80} />

      <Sfx at={0} name="whoosh" volume={0.6} />
      {Array.from({length: word.length}, (_, i) => (
        <Sfx key={i} at={TYPE_START + i * CHAR_EVERY} name="click" volume={0.9} />
      ))}
      <Sfx at={sendAt} name="notify" volume={0.7} />
    </AbsoluteFill>
  );
};
