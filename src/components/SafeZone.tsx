import {AbsoluteFill} from 'remotion';
import {HEIGHT, SAFE, WIDTH} from '../config';

// Overlay panduan: kawasan merah = ditutup UI TikTok / IG Reels.
export const SafeZone: React.FC = () => {
  const red = 'rgba(255,0,60,0.28)';
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: WIDTH, height: SAFE.top, background: red}} />
      <div style={{position: 'absolute', left: 0, bottom: 0, width: WIDTH, height: SAFE.bottom, background: red}} />
      <div style={{position: 'absolute', left: 0, top: SAFE.top, width: SAFE.left, height: HEIGHT - SAFE.top - SAFE.bottom, background: red}} />
      <div style={{position: 'absolute', right: 0, top: SAFE.top, width: SAFE.right, height: HEIGHT - SAFE.top - SAFE.bottom, background: red}} />
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          top: SAFE.top,
          width: WIDTH - SAFE.left - SAFE.right,
          height: HEIGHT - SAFE.top - SAFE.bottom,
          border: '4px dashed #00ff88',
          boxSizing: 'border-box',
        }}
      />
    </AbsoluteFill>
  );
};
