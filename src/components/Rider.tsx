import {C, Head, Mood} from './Makcik';
import {Se3sBody} from './Bags';

// Makcik duduk atas Airwheel SE3S. viewBox 80 40 560 580.
export const Rider: React.FC<{mood: Mood; wheelRot: number; wind: number; bounce: number}> = ({mood, wheelRot, wind, bounce}) => (
  <svg viewBox="80 40 560 580" width="100%" height="100%" style={{overflow: 'visible'}}>
    <ellipse cx={330} cy={608} rx={250} ry={14} fill="rgba(0,0,0,0.3)" />
    <Se3sBody wheelRot={wheelRot} />
    <g transform={`translate(0 ${bounce})`}>
      {/* kain: peha + betis ke pijak kaki */}
      <path d="M220 300 L410 302 Q446 306 448 342 L500 512 L452 518 L404 368 L220 366 Z" fill={C.kain} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={270 + i * 50} cy={334} r={6} fill={C.kainDot} />
      ))}
      <circle cx={470} cy={470} r={6} fill={C.kainDot} />
      <ellipse cx={492} cy={514} rx={26} ry={10} fill={C.shoe} />
      {/* baju kurung */}
      <path d="M232 168 Q275 154 318 170 L332 352 Q270 368 214 352 Z" fill={C.baju} />
      <path d="M232 168 L214 352 Q228 357 244 358 L252 178 Z" fill={C.bajuShade} />
      <path d="M220 118 Q272 100 322 120 L336 226 Q276 248 210 222 Z" fill={C.hijab} />
      <Head x={268} y={92} mood={mood} wind={wind} />
      {/* lengan ke stereng */}
      <line x1={282} y1={190} x2={432} y2={238} stroke={C.baju} strokeWidth={28} strokeLinecap="round" />
      <circle cx={438} cy={240} r={15} fill={C.skin} />
    </g>
  </svg>
);
