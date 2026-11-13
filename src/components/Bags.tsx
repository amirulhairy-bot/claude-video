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

const Wheel: React.FC<{x: number; y: number; r: number; rot: number}> = ({x, y, r, rot}) => (
  <g transform={`rotate(${rot} ${x} ${y})`}>
    <circle cx={x} cy={y} r={r} fill="#151515" />
    <circle cx={x} cy={y} r={r * 0.62} fill="#3a3a3a" />
    {[0, 72, 144, 216, 288].map((a) => (
      <rect key={a} x={x - 2.5} y={y - r * 0.6} width={5} height={r * 0.6} fill="#8a8f95" transform={`rotate(${a} ${x} ${y})`} />
    ))}
    <circle cx={x} cy={y} r={r * 0.2} fill={BRAND.metal} />
  </g>
);

// Airwheel SE3S (ikut gambar 1): beg tegak hitam bertekstur, lencana bulat kuning,
// rangka aluminium mendatar ke batang pemegang T, roda depan + 2 roda belakang.
// Koordinat: beg x 150..390, y 220..560; batang x≈560; lantai y≈615. Menghadap kanan.
export const Se3sBody: React.FC<{wheelRot?: number; shine?: number; handle?: number}> = ({wheelRot = 0, shine = -1, handle = 1}) => {
  const poleTop = 560 - 440 * handle;
  return (
    <g>
      <defs>
        <linearGradient id="shell" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={BRAND.bagShellLight} />
          <stop offset="0.5" stopColor={BRAND.bagShell} />
          <stop offset="1" stopColor={BRAND.bagShellDark} />
        </linearGradient>
        <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8d949c" />
          <stop offset="0.45" stopColor="#eef1f4" />
          <stop offset="1" stopColor="#9aa1a9" />
        </linearGradient>
        <linearGradient id="metalH" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef1f4" />
          <stop offset="1" stopColor="#8d949c" />
        </linearGradient>
        <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.5" stopColor="white" stopOpacity="0.5" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <clipPath id="bodyClip">
          <rect x={150} y={220} width={240} height={340} rx={26} />
        </clipPath>
      </defs>
      {/* roda belakang (yang jauh) */}
      <Wheel x={205} y={590} r={24} rot={wheelRot} />
      {/* rangka mendatar ke batang */}
      <rect x={370} y={508} width={200} height={24} rx={6} fill="url(#metalH)" />
      <rect x={370} y={532} width={200} height={6} fill="#6e747b" />
      {/* garpu + roda depan */}
      <rect x={548} y={530} width={22} height={48} rx={6} fill="#2a2a2a" />
      <Wheel x={562} y={585} r={30} rot={wheelRot} />
      {/* batang pemegang (teleskopik) */}
      <rect x={551} y={poleTop} width={18} height={540 - poleTop} rx={6} fill="url(#metal)" />
      <rect x={547} y={440} width={26} height={100} rx={6} fill="url(#metal)" />
      <rect x={545} y={430} width={30} height={14} rx={4} fill="#d8dce0" stroke="#8d949c" strokeWidth={2} />
      <rect x={545} y={330 + 110 * (1 - handle)} width={30} height={12} rx={4} fill="#d8dce0" stroke="#8d949c" strokeWidth={2} opacity={handle} />
      <rect x={552} y={455} width={16} height={60} rx={3} fill="#1b1b1b" />
      {/* pemegang T */}
      <g opacity={handle}>
        <rect x={544} y={poleTop - 18} width={32} height={30} rx={8} fill="#d8dce0" />
        <rect x={500} y={poleTop - 14} width={46} height={26} rx={13} fill="#1b1b1b" />
        <rect x={574} y={poleTop - 14} width={46} height={26} rx={13} fill="#1b1b1b" />
      </g>
      {/* badan beg */}
      <rect x={150} y={220} width={240} height={340} rx={26} fill="url(#shell)" />
      <g clipPath="url(#bodyClip)">
        {Array.from({length: 40}, (_, i) => (
          <rect key={i} x={150} y={226 + i * 8.4} width={240} height={1.5} fill="rgba(255,255,255,0.05)" />
        ))}
        {/* bingkai aluminium tepi */}
        <rect x={150} y={220} width={16} height={340} fill="#3b3e44" />
        <rect x={374} y={220} width={16} height={340} fill="#3b3e44" />
        {shine >= 0 && <rect x={150 + shine * 360 - 110} y={200} width={90} height={400} fill="url(#shine)" transform="skewX(-15)" />}
      </g>
      <rect x={150} y={220} width={240} height={340} rx={26} fill="none" stroke="#0b0b0c" strokeWidth={4} />
      {/* kunci & zip */}
      <rect x={368} y={300} width={10} height={26} rx={3} fill="#9aa1a9" />
      <rect x={368} y={340} width={10} height={26} rx={3} fill="#9aa1a9" />
      {/* pemegang atas */}
      <rect x={215} y={206} width={110} height={16} rx={8} fill="#1b1b1b" />
      {/* lencana bulat kuning */}
      <circle cx={270} cy={305} r={34} fill="#1b1b1b" stroke={BRAND.bagAccent} strokeWidth={7} />
      <circle cx={270} cy={305} r={24} fill="#2c2e33" />
      <path d="M258 312 q12 -22 24 0 q-12 -8 -24 0 Z" fill={BRAND.bagAccent} opacity={0.85} />
      {/* logo APR. */}
      <rect x={176} y={395} width={188} height={70} rx={12} fill={BRAND.brand} />
      <SvgLogo x={270} y={430} w={168} h={168 / BRAND.logoAspect} />
      {/* roda belakang (dekat) */}
      <Wheel x={340} y={592} r={26} rot={wheelRot} />
      <rect x={325} y={556} width={30} height={16} rx={4} fill="#1b1b1b" />
      <rect x={192} y={556} width={26} height={14} rx={4} fill="#1b1b1b" />
    </g>
  );
};

export const SE3S_VB = {x: 120, y: 60, w: 540, h: 580};

export const Se3s: React.FC<{wheelRot?: number; shine?: number; handle?: number}> = (p) => (
  <svg viewBox={`${SE3S_VB.x} ${SE3S_VB.y} ${SE3S_VB.w} ${SE3S_VB.h}`} width="100%" height="100%" style={{overflow: 'visible'}}>
    <ellipse cx={370} cy={618} rx={230} ry={12} fill="rgba(0,0,0,0.3)" />
    <Se3sBody {...p} />
  </svg>
);
