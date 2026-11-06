import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { SAFE } from "../data";
import { FlameIcon, Pill, PinIcon, Slam, Snowflake } from "./kit";

export const HOOK_FRAMES = 104;
export const HOOK_SWITCH = 50; // question -> answer

/** Falling snow confined to the sky band (fades out before reaching the head). */
export const SkySnow: React.FC<{ count?: number; opacity?: number }> = ({ count = 26, opacity = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity }}>
      {new Array(count).fill(0).map((_, i) => {
        const x = random(`x${i}`) * 1080;
        const speed = 3 + random(`s${i}`) * 4;
        const size = 22 + random(`z${i}`) * 34;
        const y = ((random(`y${i}`) * 700 + frame * speed) % 700) - 60;
        const fade = interpolate(y, [-60, 0, SAFE.skyBottom - 120, SAFE.skyBottom], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin((frame + i * 20) / 14) * 18,
              top: y,
              opacity: fade * 0.9,
              transform: `rotate(${frame * (i % 2 ? 2 : -2)}deg)`,
              filter: "drop-shadow(0 0 6px rgba(120,200,255,0.9))",
            }}
          >
            <Snowflake size={size} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * Two-beat hook in the sky band:
 *  1) "SEJUK GILA KAT GURUN?!"  (question + snow)
 *  2) "INI SENJATA MAKCIK!"      (answer, warm flames)
 */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = interpolate(frame, [HOOK_FRAMES - 10, HOOK_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const phaseA = frame < HOOK_SWITCH;
  const shake = frame >= HOOK_SWITCH && frame < HOOK_SWITCH + 8 ? Math.sin(frame * 3.1) * 14 : 0;
  const flamePulse = 1 + Math.sin(frame / 3) * 0.08;
  const bInt = spring({ frame: frame - HOOK_SWITCH, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill>
      {phaseA ? <SkySnow /> : null}

      {/* Warm sky glow during the answer beat */}
      {!phaseA ? (
        <AbsoluteFill
          style={{
            background: "linear-gradient(180deg, rgba(255,120,30,0.45) 0%, rgba(255,120,30,0) 34%)",
            opacity: bInt * (1 - exit),
          }}
        />
      ) : null}

      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          width: SAFE.right - SAFE.left,
          top: SAFE.skyTop,
          height: SAFE.skyBottom - SAFE.skyTop,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 14,
          transform: `translate(${shake}px, ${-exit * 520}px) scale(${1 - exit * 0.3})`,
          opacity: 1 - exit,
        }}
      >
        <Pill at={2} bg="#fff" color="#111" size={38}>
          <PinIcon size={40} /> Padang Pasir, Oman
        </Pill>

        {phaseA ? (
          <>
            <Slam text="SEJUK" at={6} size={200} color="#8FE3FF" strokePx={20} rotate={-3} />
            <div style={{ display: "flex", gap: 22 }}>
              <Slam text="GILA" at={16} size={78} />
              <Slam text="KAT" at={22} size={78} />
              <Slam text="GURUN?!" at={28} size={78} color="#FFE14D" />
            </div>
          </>
        ) : (
          <>
            <Slam text="INI SENJATA" at={HOOK_SWITCH} size={84} bg="#E8202A" color="#fff" rotate={-2} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ transform: `scale(${flamePulse * bInt})` }}>
                <FlameIcon size={120} />
              </div>
              <Slam text="MAKCIK!" at={HOOK_SWITCH + 7} size={170} color="#FFE14D" strokePx={20} rotate={2} />
              <div style={{ transform: `scale(${flamePulse * bInt}) scaleX(-1)` }}>
                <FlameIcon size={120} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* white flash on each beat */}
      <AbsoluteFill
        style={{
          background: "#fff",
          opacity:
            interpolate(frame, [0, 5], [0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) +
            interpolate(frame, [HOOK_SWITCH, HOOK_SWITCH + 5], [0.6, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }) *
              (frame >= HOOK_SWITCH ? 1 : 0),
        }}
      />
    </AbsoluteFill>
  );
};
