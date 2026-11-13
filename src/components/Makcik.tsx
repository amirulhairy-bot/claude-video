// Ilustrasi makcik (pandangan sisi, menghadap kanan). viewBox 0 0 300 520, kaki di y≈505.
export type Mood = 'pain' | 'happy' | 'neutral' | 'wow';

export const C = {
  skin: '#D9A47E',
  skinShade: '#BF875F',
  hijab: '#B83B6B',
  hijabShade: '#8E2A52',
  baju: '#2F7F73',
  bajuShade: '#22625A',
  kain: '#E9B949',
  kainDot: '#B9852A',
  shoe: '#5B3A29',
  line: '#3a2418',
};

export const Face: React.FC<{mood: Mood; cx: number; cy: number}> = ({mood, cx, cy}) => {
  // cx,cy = pusat muka
  const ex = cx + 12;
  const ey = cy - 6;
  return (
    <g stroke={C.line} strokeLinecap="round" strokeLinejoin="round" fill="none">
      {mood === 'pain' && (
        <>
          <path d={`M${ex - 7} ${ey - 5} L${ex + 3} ${ey} L${ex - 7} ${ey + 4}`} strokeWidth={4} />
          <path d={`M${ex - 10} ${ey - 16} L${ex + 6} ${ey - 10}`} strokeWidth={4} />
          <path d={`M${cx + 2} ${cy + 22} q5 -6 10 0 q5 6 10 0`} strokeWidth={4} />
        </>
      )}
      {mood === 'happy' && (
        <>
          <path d={`M${ex - 7} ${ey + 2} q6 -9 12 0`} strokeWidth={4} />
          <path d={`M${ex - 10} ${ey - 15} q8 -5 15 0`} strokeWidth={3.5} />
          <path d={`M${cx + 2} ${cy + 15} q11 13 22 0 Z`} fill="#fff" strokeWidth={3.5} />
        </>
      )}
      {mood === 'wow' && (
        <>
          <circle cx={ex} cy={ey} r={5} fill={C.line} />
          <path d={`M${ex - 10} ${ey - 17} q8 -6 15 0`} strokeWidth={3.5} />
          <ellipse cx={cx + 12} cy={cy + 20} rx={6} ry={8} fill={C.line} strokeWidth={0} />
        </>
      )}
      {mood === 'neutral' && (
        <>
          <circle cx={ex} cy={ey} r={4.5} fill={C.line} />
          <path d={`M${ex - 10} ${ey - 15} q8 -4 15 0`} strokeWidth={3.5} />
          <path d={`M${cx + 4} ${cy + 18} q8 5 16 0`} strokeWidth={4} />
        </>
      )}
      {/* hidung + pipi */}
      <path d={`M${cx + 25} ${cy - 2} q6 8 -2 10`} strokeWidth={3} />
      <circle cx={cx + 6} cy={cy + 8} r={7} fill="#e98b8b" opacity={mood === 'pain' ? 0.25 : 0.5} stroke="none" />
    </g>
  );
};

export const Head: React.FC<{x: number; y: number; mood: Mood; wind?: number}> = ({x, y, mood, wind = 0}) => {
  // x,y = pusat kepala
  return (
    <g>
      {/* hujung tudung berkibar */}
      <path
        d={`M${x - 40} ${y + 30} Q${x - 70 - wind * 40} ${y + 70 + wind * 10} ${x - 55 - wind * 90} ${y + 120 - wind * 30} L${x - 10} ${y + 110} Z`}
        fill={C.hijabShade}
      />
      <circle cx={x - 5} cy={y} r={52} fill={C.hijab} />
      <ellipse cx={x + 18} cy={y + 7} rx={28} ry={34} fill={C.skin} />
      <path d={`M${x - 14} ${y - 22} Q${x + 18} ${y - 46} ${x + 50} ${y - 18} Q${x + 30} ${y - 30} ${x - 6} ${y - 4} Z`} fill={C.hijab} />
      <ellipse cx={x + 18} cy={y + 7} rx={30} ry={36} fill="none" stroke={C.hijabShade} strokeWidth={5} />
      <Face mood={mood} cx={x + 14} cy={y + 8} />
    </g>
  );
};

// Pose berjalan / berdiri
export const MakcikWalk: React.FC<{
  phase: number; // fasa langkah (radian)
  mood: Mood;
  arm?: 'pull' | 'knee' | 'wave' | 'down';
  sweat?: number; // 0..1
}> = ({phase, mood, arm = 'pull', sweat = 0}) => {
  const s = Math.sin(phase);
  const lift = (p: number) => Math.max(0, Math.cos(p)) * 8;
  const fx = 172 + 30 * s;
  const bx = 140 - 30 * s;
  const bob = Math.abs(Math.sin(phase)) * -5;
  const armRot = arm === 'pull' ? 38 : arm === 'knee' ? -18 : arm === 'wave' ? 150 : 8;
  return (
    <svg viewBox="0 0 300 520" width="100%" height="100%" style={{overflow: 'visible'}}>
      {/* bayang */}
      <ellipse cx={158} cy={508} rx={90} ry={10} fill="rgba(0,0,0,0.25)" />
      <g transform={`translate(0 ${bob})`}>
        {/* kasut */}
        <ellipse cx={bx} cy={500 - lift(phase + Math.PI)} rx={24} ry={10} fill={C.shoe} />
        <ellipse cx={fx} cy={500 - lift(phase)} rx={24} ry={10} fill={C.shoe} />
        {/* kain */}
        <path
          d={`M118 300 L202 300 Q${Math.max(fx, bx) + 20} 420 ${Math.max(fx, bx) + 14} 492 L${Math.min(fx, bx) - 16} 492 Q${Math.min(fx, bx) - 18} 420 118 300 Z`}
          fill={C.kain}
        />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={130 + (i % 3) * 25 + (i > 2 ? 12 : 0)} cy={380 + Math.floor(i / 3) * 50} r={6} fill={C.kainDot} />
        ))}
        {/* baju kurung */}
        <path d="M120 160 Q160 146 200 160 L222 345 Q160 358 100 345 Z" fill={C.baju} />
        <path d="M120 160 L100 345 Q115 349 132 351 L140 170 Z" fill={C.bajuShade} />
        {/* tudung labuh di dada */}
        <path d="M108 110 Q160 92 210 112 L226 218 Q165 240 98 214 Z" fill={C.hijab} />
        <Head x={155} y={82} mood={mood} />
        {/* lengan */}
        <g transform={`rotate(${armRot} 168 172)`}>
          <rect x={155} y={160} width={28} height={118} rx={14} fill={C.baju} />
          <circle cx={169} cy={290} r={15} fill={C.skin} />
        </g>
        {/* peluh */}
        {sweat > 0 && (
          <g opacity={sweat}>
            <path d="M222 50 q8 14 0 20 q-8 -6 0 -20 Z" fill="#7cc8ff" />
            <path d="M236 82 q6 10 0 15 q-6 -5 0 -15 Z" fill="#7cc8ff" />
          </g>
        )}
      </g>
    </svg>
  );
};
