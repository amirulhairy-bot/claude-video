import { AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SAFE } from "../data";
import { THEME } from "../theme";
import { Pill } from "./kit";

/** Gentle lavender colour grade + plum vignette so the footage carries the brand's vibe. */
export const LavenderGrade: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: THEME.primary, mixBlendMode: "soft-light", opacity: 0.22 }} />
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse 75% 60% at 50% 45%, rgba(0,0,0,0) 55%, rgba(110,42,102,0.55) 100%)",
      }}
    />
  </>
);

/** Small round logo bug, top-left inside the TikTok/IG safe zone (left of the sky graphics band). */
export const Watermark: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 4, fps, config: { damping: 12, stiffness: 180 } });
  const size = 104;
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        top: SAFE.skyTop + 10,
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#fff",
        boxShadow: `0 0 0 5px ${THEME.light}, 0 10px 24px rgba(110,42,102,0.45)`,
        overflow: "hidden",
        transform: `scale(${s}) rotate(${(1 - s) * -90}deg)`,
      }}
    >
      <Img src={staticFile("brand/lavender-mark.png")} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8 }} />
    </div>
  );
};

/** Branded end card: lavender circle wipe, logo reveal, sparkles and a follow CTA. */
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wipe = interpolate(frame, [0, 14], [0, 1200], { extrapolateRight: "clamp" });
  const logo = spring({ frame: frame - 8, fps, config: { damping: 13, stiffness: 140 } });
  const float = Math.sin(frame / 10) * 6;
  return (
    <AbsoluteFill style={{ clipPath: `circle(${wipe}px at 50% 45%)` }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 42%, #ffffff 0%, #ffffff 30%, ${THEME.light} 62%, #E9C4E6 100%)`,
        }}
      />
      {/* floating petals */}
      {new Array(14).fill(0).map((_, i) => {
        const x = random(`px${i}`) * 1000 + 40;
        const y = 1700 - ((frame * (3 + random(`ps${i}`) * 3) + random(`py${i}`) * 1600) % 1700);
        const sz = 18 + random(`pz${i}`) * 26;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: sz,
              height: sz * 0.55,
              borderRadius: "50% 0 50% 0",
              background: THEME.primary,
              opacity: 0.35,
              transform: `rotate(${frame * 3 + i * 40}deg)`,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 420,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 50,
        }}
      >
        <Img
          src={staticFile("brand/lavender-logo.jpg")}
          style={{
            width: 760,
            mixBlendMode: "multiply",
            transform: `scale(${interpolate(logo, [0, 1], [0.6, 1])}) translateY(${float}px)`,
            opacity: logo,
          }}
        />
        <Pill at={22} bg={THEME.primary} color="#fff" size={42}>
          Jaga diri, mommies!
        </Pill>
      </div>
    </AbsoluteFill>
  );
};
