import {C, Head, Mood} from './Makcik';
import {Se3sBody} from './Bags';

// Makcik duduk atas Airwheel SE3S. Beg diskala 0.48 supaya sepadan saiz makcik.
// Lantai y=600. Kaki atas rangka, tangan pada pemegang T.
const BS = 0.48;
const BX = 150;
const BY = 305;
export const RIDER_VB = {x: 140, y: 60, w: 300, h: 560};
export const RIDER_GROUND = 600;

export const Rider: React.FC<{mood: Mood; wheelRot: number; wind: number; bounce: number}> = ({mood, wheelRot, wind, bounce}) => {
  const gx = BX + 523 * BS; // pemegang
  const gy = BY + 108 * BS;
  return (
    <svg viewBox={`${RIDER_VB.x} ${RIDER_VB.y} ${RIDER_VB.w} ${RIDER_VB.h}`} width="100%" height="100%" style={{overflow: 'visible'}}>
      <ellipse cx={300} cy={600} rx={130} ry={8} fill="rgba(0,0,0,0.3)" />
      <g transform={`translate(${BX} ${BY}) scale(${BS})`}>
        <Se3sBody wheelRot={wheelRot} />
      </g>
      <g transform={`translate(0 ${bounce + 12})`}>
        {/* kain: peha naik ke lutut, betis turun ke rangka */}
        <path d="M228 372 Q300 352 372 338 Q398 336 400 362 L408 548 L380 552 L366 396 Q300 410 230 414 Z" fill={C.kain} />
        <circle cx={300} cy={372} r={4} fill={C.kainDot} />
        <circle cx={340} cy={362} r={4} fill={C.kainDot} />
        <circle cx={390} cy={460} r={4} fill={C.kainDot} />
        <ellipse cx={404} cy={552} rx={18} ry={7} fill={C.shoe} />
        {/* baju kurung */}
        <path d="M244 236 Q276 226 306 238 L318 400 Q272 412 228 400 Z" fill={C.baju} />
        <path d="M244 236 L228 400 Q238 404 250 405 L256 244 Z" fill={C.bajuShade} />
        <path d="M232 198 Q272 184 312 200 L322 282 Q276 298 226 280 Z" fill={C.hijab} />
        <Head x={268} y={160} mood={mood} wind={wind} />
        {/* lengan ke pemegang */}
        <line x1={290} y1={252} x2={gx} y2={gy} stroke={C.baju} strokeWidth={20} strokeLinecap="round" />
        <circle cx={gx} cy={gy} r={11} fill={C.skin} />
      </g>
    </svg>
  );
};
