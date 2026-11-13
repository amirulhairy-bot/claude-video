import {AbsoluteFill} from 'remotion';
import {HEIGHT, WIDTH} from '../config';
import {FONT} from './fonts';

const FLOOR_Y = 1180;

// Latar terminal airport dengan parallax. scroll = piksel ke kiri.
export const Airport: React.FC<{scroll: number; dim?: number; gate?: string}> = ({scroll, dim = 0, gate = 'B32'}) => {
  const mod = (a: number, n: number) => ((a % n) + n) % n;
  const winScroll = scroll * 0.35;
  const pillarGap = 700;
  const pillars = [-1, 0, 1, 2].map((i) => i * pillarGap - mod(scroll, pillarGap) + 200);
  const mullions = Array.from({length: 8}, (_, i) => i * 220 - mod(winScroll, 220));
  const tiles = Array.from({length: 10}, (_, i) => i * 160 - mod(scroll, 160));
  const lights = Array.from({length: 7}, (_, i) => i * 260 - mod(scroll * 0.8, 260));
  const signs = [0, 1].map((i) => i * 1600 - mod(scroll * 0.9, 1600) + 900);
  return (
    <AbsoluteFill style={{background: '#dfe6ee', overflow: 'hidden'}}>
      {/* siling */}
      <div style={{position: 'absolute', left: 0, top: 0, width: WIDTH, height: 330, background: 'linear-gradient(#cfd8e2,#e9eef3)'}} />
      {lights.map((x, i) => (
        <div key={i} style={{position: 'absolute', left: x, top: 280, width: 170, height: 16, borderRadius: 8, background: '#fffbe6', boxShadow: '0 0 40px 10px rgba(255,250,220,0.8)'}} />
      ))}
      {/* tingkap besar */}
      <div style={{position: 'absolute', left: 0, top: 360, width: WIDTH, height: 690, background: 'linear-gradient(#5fb2ff 0%, #a9d8ff 60%, #e7f4ff 100%)'}} />
      {/* kapal terbang */}
      <svg style={{position: 'absolute', left: 700 - mod(winScroll * 0.6, 2200) + 500, top: 700}} width={700} height={260} viewBox="0 0 700 260">
        <path d="M20 150 Q60 120 160 118 L560 112 Q660 112 690 140 Q660 166 560 168 L160 172 Q60 172 20 150 Z" fill="#f4f6f8" />
        <path d="M300 140 L420 140 L250 250 L200 250 Z" fill="#d5dbe1" />
        <path d="M80 130 L40 40 L90 40 L150 125 Z" fill={'#f5a623'} />
        {Array.from({length: 12}, (_, i) => (
          <circle key={i} cx={220 + i * 26} cy={135} r={6} fill="#5a6b7c" />
        ))}
        <rect x={0} y={190} width={700} height={70} fill="#9aa7b3" opacity={0.6} />
      </svg>
      {mullions.map((x, i) => (
        <div key={i} style={{position: 'absolute', left: x, top: 360, width: 18, height: 690, background: '#8995a3'}} />
      ))}
      <div style={{position: 'absolute', left: 0, top: 700, width: WIDTH, height: 12, background: '#8995a3'}} />
      {/* dinding bawah tingkap */}
      <div style={{position: 'absolute', left: 0, top: 1050, width: WIDTH, height: FLOOR_Y - 1050, background: 'linear-gradient(#b8c2cd,#a3aeba)'}} />
      {/* papan tanda gate */}
      {signs.map((x, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x,
            top: 410,
            padding: '14px 26px',
            background: '#1b2633',
            color: '#ffd23f',
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 44,
            borderRadius: 12,
            whiteSpace: 'nowrap',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          }}
        >
          ✈ Gate {gate} ➜
        </div>
      ))}
      {/* tiang */}
      {pillars.map((x, i) => (
        <div key={i} style={{position: 'absolute', left: x, top: 330, width: 90, height: FLOOR_Y - 330, background: 'linear-gradient(90deg,#c9d1da,#f2f5f8 40%,#aeb8c3)'}} />
      ))}
      {/* lantai */}
      <div style={{position: 'absolute', left: 0, top: FLOOR_Y, width: WIDTH, height: HEIGHT - FLOOR_Y, background: 'linear-gradient(#c7ced6,#8f9aa6)'}} />
      {tiles.map((x, i) => (
        <div key={i} style={{position: 'absolute', left: x, top: FLOOR_Y, width: 4, height: HEIGHT - FLOOR_Y, background: 'rgba(255,255,255,0.35)', transform: `skewX(${(x - 540) / 25}deg)`, transformOrigin: 'top'}} />
      ))}
      <div style={{position: 'absolute', left: 0, top: FLOOR_Y + 160, width: WIDTH, height: 4, background: 'rgba(255,255,255,0.3)'}} />
      {/* gelap / tidak ceria */}
      {dim > 0 && <AbsoluteFill style={{background: `rgba(20,25,40,${dim})`}} />}
    </AbsoluteFill>
  );
};

export const FLOOR = FLOOR_Y;

export const SpeedLines: React.FC<{frame: number; opacity?: number}> = ({frame, opacity = 1}) => (
  <AbsoluteFill style={{opacity, pointerEvents: 'none'}}>
    {Array.from({length: 14}, (_, i) => {
      const y = 500 + ((i * 137) % 900);
      const len = 120 + ((i * 53) % 220);
      const speed = 45 + (i % 4) * 12;
      const x = WIDTH + 300 - (((frame + i * 17) * speed) % (WIDTH + 700));
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: len, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.85)'}} />;
    })}
  </AbsoluteFill>
);

// Letupan komik "ADUH!"
export const Burst: React.FC<{text: string; scale: number; rot?: number}> = ({text, scale, rot = -8}) => {
  const pts = Array.from({length: 24}, (_, i) => {
    const r = i % 2 ? 95 : 150;
    const a = (i / 24) * Math.PI * 2;
    return `${160 + Math.cos(a) * r * 1.25},${160 + Math.sin(a) * r}`;
  }).join(' ');
  return (
    <div style={{width: 380, height: 320, transform: `scale(${scale}) rotate(${rot}deg)`}}>
      <svg viewBox="-30 0 380 320" width={380} height={320} style={{overflow: 'visible'}}>
        <polygon points={pts} fill="#ffe14d" stroke="#e5312b" strokeWidth={8} strokeLinejoin="round" />
        <text x={160} y={182} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={68} fill="#e5312b">
          {text}
        </text>
      </svg>
    </div>
  );
};
