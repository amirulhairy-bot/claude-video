import {AbsoluteFill} from 'remotion';
import {HEIGHT, WIDTH} from '../config';

const FLOOR_Y = 1150;
const mod = (a: number, n: number) => ((a % n) + n) % n;

const Minaret: React.FC<{x: number; base: number; h: number}> = ({x, base, h}) => (
  <svg style={{position: 'absolute', left: x - 40, top: base - h - 60}} width={80} height={h + 60} viewBox={`0 0 80 ${h + 60}`}>
    <path d="M40 0 l4 12 a10 10 0 1 1 -8 0 Z" fill="#d4a62a" />
    <path d="M26 60 Q40 20 54 60 Z" fill="#cfc3a8" />
    <rect x={26} y={58} width={28} height={h} fill="#efe7d6" />
    <rect x={20} y={110} width={40} height={12} rx={3} fill="#d9cdb4" />
    <rect x={18} y={Math.round(h * 0.45)} width={44} height={14} rx={3} fill="#d9cdb4" />
    <rect x={34} y={70} width={12} height={30} rx={6} fill="#9c8a6c" />
    <rect x={26} y={58} width={6} height={h} fill="#ffffff" opacity={0.5} />
  </svg>
);

// Perkarangan masjid (marmar putih, menara, gerbang, menara jam di kejauhan).
export const Courtyard: React.FC<{scroll: number; heat?: number}> = ({scroll, heat = 0}) => {
  const archGap = 150;
  const arches = Array.from({length: 10}, (_, i) => i * archGap - mod(scroll * 0.5, archGap) - 40);
  const minarets = [0, 1, 2].map((i) => i * 520 - mod(scroll * 0.3, 1560) + 160);
  const tiles = Array.from({length: 10}, (_, i) => i * 150 - mod(scroll, 150));
  const crowd = Array.from({length: 16}, (_, i) => i * 90 - mod(scroll * 0.6, 90 * 16) + ((i * 37) % 40));
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#f4ede0'}}>
      {/* langit */}
      <div style={{position: 'absolute', inset: 0, height: FLOOR_Y, background: 'linear-gradient(#6fb0e8 0%, #a9d2f2 45%, #f6e9cf 100%)'}} />
      {/* matahari */}
      <div style={{position: 'absolute', left: 820, top: 380, width: 150, height: 150, borderRadius: '50%', background: '#fff6c9', boxShadow: `0 0 ${80 + heat * 80}px ${30 + heat * 40}px rgba(255,220,120,${0.6 + heat * 0.3})`}} />
      {/* menara jam di kejauhan */}
      <svg style={{position: 'absolute', left: 430 - mod(scroll * 0.05, 2000), top: 250}} width={260} height={700} viewBox="0 0 260 700">
        <rect x={20} y={430} width={220} height={270} fill="#c9bfae" />
        <rect x={70} y={150} width={120} height={550} fill="#d6ccb9" />
        <rect x={80} y={160} width={100} height={110} fill="#c2b6a0" />
        <circle cx={130} cy={215} r={42} fill="#fbfaf5" stroke="#2e7a4f" strokeWidth={8} />
        <line x1={130} y1={215} x2={130} y2={188} stroke="#333" strokeWidth={5} />
        <line x1={130} y1={215} x2={150} y2={222} stroke="#333" strokeWidth={4} />
        <path d="M95 150 L130 60 L165 150 Z" fill="#e7dcc6" />
        <rect x={126} y={0} width={8} height={70} fill="#d4a62a" />
        <path d="M118 10 a14 14 0 1 0 22 0 a10 10 0 1 1 -22 0 Z" fill="#d4a62a" />
      </svg>
      {minarets.map((x, i) => (
        <Minaret key={i} x={x} base={900} h={520 + (i % 2) * 60} />
      ))}
      {/* bangunan bergerbang */}
      <div style={{position: 'absolute', left: 0, top: 880, width: WIDTH, height: FLOOR_Y - 880, background: 'linear-gradient(#f1e9d9,#e2d6bf)'}} />
      <div style={{position: 'absolute', left: 0, top: 868, width: WIDTH, height: 20, background: '#d9cdb4'}} />
      {arches.map((x, i) => (
        <div key={i} style={{position: 'absolute', left: x, top: 930, width: 92, height: 200, borderRadius: '46px 46px 0 0', background: 'linear-gradient(#8a7558,#5e4e3a)', border: '6px solid #cbbd9f'}} />
      ))}
      {/* jemaah di kejauhan */}
      {crowd.map((x, i) => (
        <div key={i} style={{position: 'absolute', left: x, top: FLOOR_Y - 70 + (i % 3) * 6, width: 24, height: 70, borderRadius: '12px 12px 4px 4px', background: i % 3 === 0 ? '#2a2a30' : '#fafafa', boxShadow: '0 0 0 2px rgba(0,0,0,0.08)'}} />
      ))}
      {/* lantai marmar */}
      <div style={{position: 'absolute', left: 0, top: FLOOR_Y, width: WIDTH, height: HEIGHT - FLOOR_Y, background: 'linear-gradient(#fbfaf7,#e4e0d8)'}} />
      {tiles.map((x, i) => (
        <div key={i} style={{position: 'absolute', left: x, top: FLOOR_Y, width: 3, height: HEIGHT - FLOOR_Y, background: 'rgba(150,140,125,0.35)', transform: `skewX(${(x - 540) / 25}deg)`, transformOrigin: 'top'}} />
      ))}
      {[90, 230, 420].map((y) => (
        <div key={y} style={{position: 'absolute', left: 0, top: FLOOR_Y + y, width: WIDTH, height: 3, background: 'rgba(150,140,125,0.3)'}} />
      ))}
      <div style={{position: 'absolute', left: 0, top: 0, width: WIDTH, height: 700, background: 'linear-gradient(rgba(10,20,40,0.45), rgba(10,20,40,0))'}} />
      {heat > 0 && <AbsoluteFill style={{background: `rgba(255,150,40,${heat * 0.22})`, mixBlendMode: 'multiply'}} />}
    </AbsoluteFill>
  );
};
