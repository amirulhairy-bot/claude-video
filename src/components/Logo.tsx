import {Img, staticFile} from 'remotion';
import {BRAND} from '../config';
import {FONT} from './fonts';

// Logo jenama: guna fail logo dalam public/ jika ada, jika tidak logo teks.
export const Logo: React.FC<{height: number; color?: string}> = ({height, color = 'white'}) => {
  if (BRAND.logoFile) {
    return <Img src={staticFile(BRAND.logoFile)} style={{height, width: height * BRAND.logoAspect, objectFit: 'contain', display: 'block'}} />;
  }
  return <div style={{fontFamily: FONT, fontWeight: 800, fontSize: height * 0.8, color, lineHeight: 1}}>{BRAND.logoText}</div>;
};

// Logo dalam SVG (atas badan beg).
export const SvgLogo: React.FC<{x: number; y: number; w: number; h: number}> = ({x, y, w, h}) => {
  if (BRAND.logoFile) {
    return <image href={staticFile(BRAND.logoFile)} x={x - w / 2} y={y - h / 2} width={w} height={h} preserveAspectRatio="xMidYMid meet" />;
  }
  return (
    <text x={x} y={y + h * 0.3} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={h} fill="white">
      {BRAND.logoText}
    </text>
  );
};
