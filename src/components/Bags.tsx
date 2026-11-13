import {BRAND} from '../config';
import {SvgLogo} from './Logo';

// Beg lama biasa (masalah) — viewBox 0 0 200 380, roda di bawah.
export const OldSuitcase: React.FC = () => (
  <svg viewBox="0 0 200 380" width="100%" height="100%" style={{overflow: 'visible'}}>
    <rect x={88} y={0} width={10} height={140} fill="#777" />
    <rect x={102} y={0} width={10} height={140} fill="#777" />
    <rect x={76} y={-12} width={48} height={20} rx={8} fill="#333" />
    <rect x={14} y={130} width={172} height={220} rx={22} fill="#7d8794" />
    {[50, 80, 110, 140].map((x) => (
      <rect key={x} x={x} y={140} width={8} height={200} rx={4} fill="#6a7380" />
    ))}
    <rect x={14} y={130} width={172} height={220} rx={22} fill="none" stroke="#5c6470" strokeWidth={5} />
    <circle cx={45} cy={362} r={16} fill="#222" />
    <circle cx={155} cy={362} r={16} fill="#222" />
  </svg>
);

// Airwheel SE3S — beg pintar boleh ditunggang (pandangan sisi, mod tunggang).
// Koordinat dalam ruang Rider: badan x 120..520, y 360..560.
export const Se3sBody: React.FC<{wheelRot?: number; shine?: number; handle?: number}> = ({wheelRot = 0, shine = -1, handle = 1}) => {
  const hx = 505;
  const top = 365;
  return (
    <g>
      <defs>
        <linearGradient id="shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BRAND.bagShellLight} />
          <stop offset="0.55" stopColor={BRAND.bagShell} />
          <stop offset="1" stopColor={BRAND.bagShellDark} />
        </linearGradient>
        <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.5" stopColor="white" stopOpacity="0.55" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <clipPath id="bodyClip">
          <rect x={120} y={360} width={400} height={200} rx={34} />
        </clipPath>
      </defs>
      {/* batang pemegang (stereng) */}
      <g opacity={handle}>
        <line x1={hx} y1={top} x2={hx - 40 * handle} y2={top - 125 * handle} stroke="#9aa3ad" strokeWidth={14} strokeLinecap="round" />
        <line x1={hx} y1={top} x2={hx - 20 * handle} y2={top - 60 * handle} stroke="#c9d0d6" strokeWidth={18} strokeLinecap="round" />
        <rect x={hx - 40 * handle - 30} y={top - 125 * handle - 12} width={60} height={24} rx={12} fill="#111" />
      </g>
      {/* pijak kaki */}
      <rect x={505} y={515} width={78} height={14} rx={7} fill="#222" />
      {/* badan beg */}
      <rect x={120} y={360} width={400} height={200} rx={34} fill="url(#shell)" />
      <g clipPath="url(#bodyClip)">
        {[400, 440, 520].map((y) => (
          <rect key={y} x={120} y={y} width={400} height={6} fill="rgba(0,0,0,0.25)" />
        ))}
        <rect x={120} y={360} width={400} height={10} fill={BRAND.bagAccent} />
        {shine >= 0 && <rect x={120 + shine * 520 - 120} y={340} width={110} height={240} fill="url(#shine)" transform="skewX(-20)" />}
      </g>
      <rect x={120} y={360} width={400} height={200} rx={34} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth={4} />
      {/* tempat duduk */}
      <rect x={170} y={346} width={230} height={22} rx={11} fill="#111" />
      {/* lampu */}
      <rect x={512} y={455} width={10} height={40} rx={5} fill="#fff7c2" />
      <rect x={118} y={455} width={8} height={40} rx={4} fill="#ff3b3b" />
      <SvgLogo x={320} y={470} w={220} h={56} />
      {/* roda */}
      {[175, 465].map((x) => (
        <g key={x} transform={`rotate(${wheelRot} ${x} 578)`}>
          <circle cx={x} cy={578} r={28} fill="#111" />
          <circle cx={x} cy={578} r={13} fill="#666" />
          <rect x={x - 3} y={552} width={6} height={52} fill="#444" />
        </g>
      ))}
    </g>
  );
};

export const Se3s: React.FC<{wheelRot?: number; shine?: number; handle?: number}> = (p) => (
  <svg viewBox="80 200 560 420" width="100%" height="100%" style={{overflow: 'visible'}}>
    <ellipse cx={330} cy={608} rx={250} ry={14} fill="rgba(0,0,0,0.3)" />
    <Se3sBody {...p} />
  </svg>
);
