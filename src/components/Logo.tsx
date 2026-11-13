import {Img, staticFile} from 'remotion';
import {BRAND} from '../config';
import {FONT} from './fonts';

// Logo jenama: guna fail logo dalam public/ jika ada, jika tidak logo teks.
export const Logo: React.FC<{height: number; color?: string}> = ({height, color = 'white'}) => {
  if (BRAND.logoFile) {
    return <Img src={staticFile(BRAND.logoFile)} style={{height, objectFit: 'contain'}} />;
  }
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: height * 0.8,
        letterSpacing: height * 0.08,
        color,
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        gap: height * 0.2,
      }}
    >
      <svg width={height} height={height} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="44" fill="none" stroke={BRAND.bagAccent} strokeWidth="10" />
        <circle cx="50" cy="50" r="16" fill={BRAND.bagAccent} />
      </svg>
      {BRAND.logoText}
    </div>
  );
};

// Logo dalam SVG (atas badan beg).
export const SvgLogo: React.FC<{x: number; y: number; w: number; h: number}> = ({x, y, w, h}) => {
  if (BRAND.logoFile) {
    return <image href={staticFile(BRAND.logoFile)} x={x - w / 2} y={y - h / 2} width={w} height={h} preserveAspectRatio="xMidYMid meet" />;
  }
  return (
    <g>
      <circle cx={x - w * 0.36} cy={y} r={h * 0.32} fill="none" stroke={BRAND.bagAccent} strokeWidth={h * 0.1} />
      <circle cx={x - w * 0.36} cy={y} r={h * 0.11} fill={BRAND.bagAccent} />
      <text
        x={x + w * 0.08}
        y={y + h * 0.17}
        textAnchor="middle"
        fontFamily={FONT}
        fontWeight={800}
        fontSize={h * 0.5}
        letterSpacing={h * 0.04}
        fill="white"
      >
        {BRAND.logoText}
      </text>
    </g>
  );
};
