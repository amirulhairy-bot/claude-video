import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SAFE_BOX} from '../config';
import {FONT} from './fonts';

// Tajuk atas (gaya video rujukan) — sentiasa dalam safe zone atas.
export const Headline: React.FC<{text: string; start?: number; end?: number; size?: number; y?: number}> = ({
  text,
  start = 0,
  end = 99999,
  size = 84,
  y = SAFE_BOX.y + 40,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < start || frame > end) return null;
  const words = text.split(' ');
  const out = interpolate(frame, [end - 6, end], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE_BOX.x,
        width: SAFE_BOX.w,
        top: y,
        textAlign: 'center',
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.15,
        color: 'white',
        opacity: out,
        textShadow: '0 6px 24px rgba(0,0,0,0.65), 0 2px 4px rgba(0,0,0,0.8)',
      }}
    >
      {words.map((w, i) => {
        const s = spring({frame: frame - start - i * 3, fps, config: {damping: 11, stiffness: 180}});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: '0.25em',
              transform: `translateY(${(1 - s) * 40}px) scale(${0.6 + 0.4 * s})`,
              opacity: Math.min(1, s * 1.5),
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// Pil kapsyen kecil (sub-teks) — default di bahagian bawah safe zone.
export const Chip: React.FC<{
  text: string;
  start: number;
  end: number;
  y?: number;
  bg?: string;
  color?: string;
  size?: number;
}> = ({text, start, end, y = SAFE_BOX.y + SAFE_BOX.h - 150, bg = 'white', color = '#111', size = 42}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < start || frame > end) return null;
  const s = spring({frame: frame - start, fps, config: {damping: 12, stiffness: 200}});
  const out = interpolate(frame, [end - 6, end], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE_BOX.x,
        width: SAFE_BOX.w,
        top: y,
        display: 'flex',
        justifyContent: 'center',
        opacity: out,
      }}
    >
      <div
        style={{
          background: bg,
          color,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: size,
          padding: '18px 36px',
          borderRadius: 999,
          boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
          transform: `scale(${s}) rotate(${(1 - s) * -6}deg)`,
          maxWidth: SAFE_BOX.w,
          boxSizing: 'border-box',
          textAlign: 'center',
        }}
      >
        {text}
      </div>
    </div>
  );
};
