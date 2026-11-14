import {Se3sBody} from './Bags';

// Budak lelaki kecil berjubah putih & kopiah (pandangan sisi, menghadap kanan).
// viewBox 0 0 160 300, kaki di y≈290.
export type KidMood = 'cry' | 'happy' | 'tired' | 'wow';

export const K = {
  skin: '#E6B58F',
  jubah: '#f7f7f3',
  jubahShade: '#d9d9d1',
  kopiah: '#ffffff',
  shoe: '#6b4a35',
  line: '#3a2418',
};

export const KidHead: React.FC<{x: number; y: number; mood: KidMood; t: number}> = ({x, y, mood, t}) => {
  const ex = x + 17;
  const ey = y - 2;
  const tear = (t * 3) % 30;
  return (
    <g>
      <circle cx={x} cy={y} r={40} fill={K.skin} />
      <circle cx={x - 10} cy={y + 4} r={9} fill="#d9a07c" />
      {/* kopiah */}
      <path d={`M${x - 39} ${y - 10} Q${x} ${y - 62} ${x + 39} ${y - 10} Z`} fill={K.kopiah} stroke="#d0d0c8" strokeWidth={2} />
      <rect x={x - 39} y={y - 16} width={78} height={9} rx={4} fill="#ecece6" />
      <g stroke={K.line} strokeLinecap="round" fill="none">
        {mood === 'cry' && (
          <>
            <path d={`M${ex - 7} ${ey} q7 5 14 0`} strokeWidth={3.5} />
            <path d={`M${ex - 8} ${ey - 12} l12 -4`} strokeWidth={3} />
            <ellipse cx={x + 20} cy={y + 22} rx={9} ry={10} fill="#7a2a2a" strokeWidth={2.5} />
            <path d={`M${ex} ${ey + 4} Q${ex - 2} ${ey + 20} ${ex - 4} ${ey + 34}`} stroke="#6fc3ff" strokeWidth={5} />
            <circle cx={ex - 4} cy={ey + 30 + tear} r={4.5} fill="#6fc3ff" stroke="none" opacity={1 - tear / 30} />
          </>
        )}
        {mood === 'tired' && (
          <>
            <path d={`M${ex - 7} ${ey} h13`} strokeWidth={3.5} />
            <path d={`M${ex - 8} ${ey - 11} l12 -3`} strokeWidth={3} />
            <path d={`M${x + 12} ${y + 22} q8 -5 15 0`} strokeWidth={3.5} />
          </>
        )}
        {mood === 'happy' && (
          <>
            <path d={`M${ex - 7} ${ey + 2} q7 -9 14 0`} strokeWidth={3.5} />
            <path d={`M${x + 8} ${y + 14} q13 16 26 0 Z`} fill="#fff" strokeWidth={3} />
          </>
        )}
        {mood === 'wow' && (
          <>
            <circle cx={ex} cy={ey} r={4.5} fill={K.line} stroke="none" />
            <ellipse cx={x + 20} cy={y + 20} rx={6} ry={7} fill={K.line} />
          </>
        )}
        <path d={`M${x + 36} ${y + 2} q5 6 -2 8`} strokeWidth={2.5} />
      </g>
      <circle cx={x + 10} cy={y + 12} r={7} fill="#f08f8f" opacity={0.5} />
    </g>
  );
};

const Arm: React.FC<{rot: number; sx?: number; sy?: number}> = ({rot, sx = 82, sy = 118}) => (
  <g transform={`rotate(${rot} ${sx} ${sy})`}>
    <rect x={sx - 8} y={sy - 6} width={16} height={68} rx={8} fill={K.jubah} stroke={K.jubahShade} strokeWidth={2} />
    <circle cx={sx} cy={sy + 66} r={9} fill={K.skin} />
  </g>
);

export const Kid: React.FC<{pose: 'walk' | 'sit' | 'armsUp'; phase?: number; mood: KidMood; t: number}> = ({pose, phase = 0, mood, t}) => {
  const s = Math.sin(phase);
  const lift = (p: number) => Math.max(0, Math.cos(p)) * 6;
  const sob = mood === 'cry' ? Math.sin(t * 0.9) * 2 : 0;
  if (pose === 'sit') {
    return (
      <svg viewBox="0 0 160 300" width="100%" height="100%" style={{overflow: 'visible'}}>
        <ellipse cx={90} cy={294} rx={70} ry={7} fill="rgba(0,0,0,0.25)" />
        {/* kaki terlunjur */}
        <path d="M45 250 L140 262 Q150 266 148 282 L45 290 Z" fill={K.jubah} stroke={K.jubahShade} strokeWidth={2} />
        <ellipse cx={152} cy={278} rx={9} ry={13} fill={K.shoe} />
        <g transform={`translate(0 ${80 + sob})`}>
          <path d="M58 108 Q82 100 106 108 L114 205 Q80 212 44 205 Z" fill={K.jubah} stroke={K.jubahShade} strokeWidth={2} />
          <Arm rot={-150 + Math.sin(t * 0.5) * 12} />
          <KidHead x={84} y={66} mood={mood} t={t} />
          <Arm rot={-165 + Math.sin(t * 0.5 + 1) * 12} sx={88} />
        </g>
      </svg>
    );
  }
  const fx = 92 + 16 * s;
  const bx = 70 - 16 * s;
  const bob = Math.abs(Math.sin(phase)) * -4 + sob;
  const armsUp = pose === 'armsUp';
  return (
    <svg viewBox="0 0 160 300" width="100%" height="100%" style={{overflow: 'visible'}}>
      <ellipse cx={82} cy={294} rx={50} ry={7} fill="rgba(0,0,0,0.25)" />
      <g transform={`translate(0 ${bob})`}>
        <ellipse cx={bx} cy={286 - lift(phase + Math.PI)} rx={14} ry={7} fill={K.shoe} />
        <ellipse cx={fx} cy={286 - lift(phase)} rx={14} ry={7} fill={K.shoe} />
        {!armsUp && <Arm rot={-25 * s} sx={78} />}
        <path d="M58 108 Q82 100 106 108 L122 272 Q80 280 40 272 Z" fill={K.jubah} stroke={K.jubahShade} strokeWidth={2} />
        <path d="M58 108 L40 272 Q48 275 58 276 L66 112 Z" fill={K.jubahShade} opacity={0.6} />
        <KidHead x={84} y={66} mood={mood} t={t} />
        {armsUp ? (
          <>
            <Arm rot={-128 + Math.sin(t * 0.6) * 10} sx={98} sy={120} />
            <Arm rot={-142 + Math.sin(t * 0.6 + 1.5) * 10} sx={104} sy={124} />
          </>
        ) : (
          <Arm rot={25 * s} sx={86} />
        )}
      </g>
    </svg>
  );
};

// Budak duduk atas Airwheel SE3S. Lantai y=600.
const BS = 0.39;
const BX = 100;
const BY = 360;
export const KIDRIDER_VB = {x: 60, y: 200, w: 320, h: 420};
export const KIDRIDER_GROUND = 600;

export const KidRider: React.FC<{mood: KidMood; wheelRot: number; t: number; bounce: number}> = ({mood, wheelRot, t, bounce}) => {
  const gx = BX + 523 * BS;
  const gy = BY + 108 * BS;
  const swing = Math.sin(t * 0.25) * 8;
  return (
    <svg viewBox={`${KIDRIDER_VB.x} ${KIDRIDER_VB.y} ${KIDRIDER_VB.w} ${KIDRIDER_VB.h}`} width="100%" height="100%" style={{overflow: 'visible'}}>
      <ellipse cx={230} cy={600} rx={110} ry={7} fill="rgba(0,0,0,0.3)" />
      <g transform={`translate(${BX} ${BY}) scale(${BS})`}>
        <Se3sBody wheelRot={wheelRot} />
      </g>
      <g transform={`translate(0 ${bounce})`}>
        {/* kaki berjuntai & berayun */}
        <g transform={`rotate(${swing} 258 438)`}>
          <path d="M248 428 L268 432 L276 500 L258 502 Z" fill={K.jubah} stroke={K.jubahShade} strokeWidth={2} />
          <ellipse cx={272} cy={503} rx={12} ry={6} fill={K.shoe} />
        </g>
        <path d="M172 414 L248 418 Q266 422 266 440 L176 450 Z" fill={K.jubah} stroke={K.jubahShade} strokeWidth={2} />
        <path d="M184 340 Q208 330 232 340 L238 446 Q205 454 172 446 Z" fill={K.jubah} stroke={K.jubahShade} strokeWidth={2} />
        <KidHead x={212} y={298} mood={mood} t={t} />
        <line x1={214} y1={352} x2={gx} y2={gy} stroke={K.jubah} strokeWidth={15} strokeLinecap="round" />
        <line x1={214} y1={352} x2={gx} y2={gy} stroke={K.jubahShade} strokeWidth={2} strokeLinecap="round" opacity={0.6} />
        <circle cx={gx} cy={gy} r={8} fill={K.skin} />
      </g>
    </svg>
  );
};
