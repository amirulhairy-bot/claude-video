import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SAFE_BOX} from '../config';
import {FONT} from './fonts';

// Belon dialog. (x,y) = hujung ekor (dekat mulut watak). Dikekalkan dalam safe zone.
export const Bubble: React.FC<{text: string; x: number; y: number; start: number; end: number; w?: number}> = ({text, x, y, start, end, w = 460}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < start || frame > end) return null;
  const s = spring({frame: frame - start, fps, config: {damping: 10, stiffness: 220}});
  const out = interpolate(frame, [end - 5, end], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const left = Math.max(SAFE_BOX.x, Math.min(x - 60, SAFE_BOX.x + SAFE_BOX.w - w));
  const wob = Math.sin(frame * 0.3) * 1.5;
  return (
    <div style={{position: 'absolute', left, top: y - 30, width: w, transform: `translateY(-100%) scale(${s}) rotate(${wob}deg)`, transformOrigin: `${x - left}px 100%`, opacity: out}}>
      <div
        style={{
          background: 'white',
          borderRadius: 30,
          padding: '20px 28px',
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 42,
          color: '#1a1a1a',
          textAlign: 'center',
          border: '5px solid #1a1a1a',
          boxShadow: '0 10px 0 rgba(0,0,0,0.25)',
        }}
      >
        {text}
      </div>
      <svg width={50} height={36} style={{position: 'absolute', left: x - left - 20, bottom: -31}}>
        <path d="M2 0 L22 34 L44 0" fill="white" stroke="#1a1a1a" strokeWidth={5} strokeLinejoin="round" />
        <rect x={6} y={0} width={34} height={6} fill="white" />
      </svg>
    </div>
  );
};
