import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { FONT } from "../font";
import { THEME } from "../theme";

export const stroke = (px: number, color = THEME.ink): React.CSSProperties => ({
  WebkitTextStroke: `${px}px ${color}`,
  paintOrder: "stroke fill",
});

/** Enter/exit envelope for a graphic living in [from, to) frames (local to its Sequence). */
export const useInOut = (dur: number, outLen = 8) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 12, stiffness: 180 } });
  const exit = interpolate(frame, [dur - outLen, dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  return { frame, fps, enter, exit };
};

/** Big word that slams in from 2.4x scale. */
export const Slam: React.FC<{
  text: string;
  at: number;
  size: number;
  color?: string;
  bg?: string;
  rotate?: number;
  strokePx?: number;
}> = ({ text, at, size, color = "#fff", bg, rotate = 0, strokePx = 16 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 260, mass: 0.7 } });
  if (frame < at) return null;
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        textTransform: "uppercase",
        letterSpacing: -2,
        color,
        background: bg,
        padding: bg ? "10px 26px 14px" : 0,
        borderRadius: bg ? 18 : 0,
        ...(bg ? {} : stroke(strokePx)),
        textShadow: bg ? undefined : `0 10px 0 ${THEME.inkShadow}`,
        boxShadow: bg ? `0 12px 0 ${THEME.inkShadow}` : undefined,
        transform: `scale(${interpolate(s, [0, 1], [2.4, 1])}) rotate(${rotate}deg)`,
        opacity: interpolate(s, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
        whiteSpace: "nowrap",
        display: "inline-block",
      }}
    >
      {text}
    </div>
  );
};

/** Rounded label pill that slides in from the left. */
export const Pill: React.FC<{
  children: React.ReactNode;
  at?: number;
  bg?: string;
  color?: string;
  size?: number;
}> = ({ children, at = 0, bg = THEME.white, color = THEME.primaryDark, size = 40 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 200 } });
  if (frame < at) return null;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: size,
        color,
        background: bg,
        padding: "12px 28px",
        borderRadius: 999,
        boxShadow: "0 8px 24px rgba(110,42,102,0.4)",
        transform: `translateX(${(1 - s) * -500}px)`,
        opacity: s,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

/** Rubber-stamp style badge slamming down with a rotation. */
export const Stamp: React.FC<{ text: string; color: string; at?: number; size?: number; rotate?: number }> = ({
  text,
  color,
  at = 0,
  size = 96,
  rotate = -7,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 10, stiffness: 320, mass: 0.8 } });
  if (frame < at) return null;
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        color,
        border: `10px solid ${color}`,
        borderRadius: 22,
        padding: "14px 30px 18px",
        background: "rgba(42,14,43,0.6)",
        textTransform: "uppercase",
        transform: `scale(${interpolate(s, [0, 1], [3, 1])}) rotate(${rotate}deg)`,
        opacity: interpolate(s, [0, 0.25], [0, 1], { extrapolateRight: "clamp" }),
        whiteSpace: "nowrap",
        boxShadow: `0 0 40px ${color}55`,
      }}
    >
      {text}
    </div>
  );
};

/* ---------------- Icons (inline SVG so nothing depends on emoji fonts) ---------------- */

export const PinIcon: React.FC<{ size?: number; color?: string }> = ({ size = 40, color = THEME.primary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" fill={color} />
    <circle cx="12" cy="9" r="2.6" fill="#fff" />
  </svg>
);

export const CheckIcon: React.FC<{ size?: number; color?: string }> = ({ size = 40, color = THEME.highlight }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="11" fill={color} />
    <path d="M6.5 12.5l3.5 3.5 7.5-8" stroke={THEME.ink} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export const PlaneIcon: React.FC<{ size?: number; color?: string }> = ({ size = 90, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
      fill={color}
      stroke={THEME.ink}
      strokeWidth={0.8}
    />
  </svg>
);

export const Snowflake: React.FC<{ size?: number; color?: string }> = ({ size = 40, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="-12 -12 24 24">
    {[0, 60, 120].map((r) => (
      <g key={r} transform={`rotate(${r})`} stroke={color} strokeWidth={1.8} strokeLinecap="round">
        <line x1={0} y1={-10} x2={0} y2={10} />
        <line x1={0} y1={-6} x2={-3} y2={-9} />
        <line x1={0} y1={-6} x2={3} y2={-9} />
        <line x1={0} y1={6} x2={-3} y2={9} />
        <line x1={0} y1={6} x2={3} y2={9} />
      </g>
    ))}
  </svg>
);

export const FlameIcon: React.FC<{ size?: number }> = ({ size = 60 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <defs>
      <linearGradient id="fl" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor={THEME.primary} />
        <stop offset="0.55" stopColor={THEME.pink} />
        <stop offset="1" stopColor={THEME.light} />
      </linearGradient>
    </defs>
    <path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3-1-3 0-6 1-9z" fill="url(#fl)" stroke={THEME.ink} strokeWidth={1} />
  </svg>
);

/** Vertical thermometer whose fill animates from `from` to `to` (0..1). */
export const Thermometer: React.FC<{ progress: number; from: number; to: number; color: string; height?: number }> = ({
  progress,
  from,
  to,
  color,
  height = 300,
}) => {
  const level = from + (to - from) * progress;
  const tubeH = height - 70;
  return (
    <svg width={90} height={height} viewBox={`0 0 90 ${height}`}>
      <rect x={27} y={6} width={36} height={tubeH} rx={18} fill="#fff" stroke={THEME.ink} strokeWidth={6} />
      <rect x={36} y={12 + (tubeH - 20) * (1 - level)} width={18} height={(tubeH - 20) * level + 20} rx={9} fill={color} />
      <circle cx={45} cy={height - 40} r={32} fill={color} stroke={THEME.ink} strokeWidth={6} />
      {[0.2, 0.4, 0.6, 0.8].map((p) => (
        <line key={p} x1={63} x2={76} y1={12 + tubeH * p} y2={12 + tubeH * p} stroke={THEME.ink} strokeWidth={4} />
      ))}
    </svg>
  );
};
