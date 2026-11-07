import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PAGES, SAFE, f, type Word } from "../data";
import { FONT } from "../font";
import { THEME } from "../theme";

const KEY_COLORS: Record<NonNullable<Word["k"]>, string> = {
  cold: THEME.cold,
  warm: THEME.warm,
  buy: THEME.highlight,
  hot: THEME.highlight,
};

const ACTIVE = THEME.highlight;

/** Word-by-word karaoke captions, locked in the chest band (never over the face). */
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pageIdx = PAGES.findIndex((p, i) => {
    const start = f(p[0].s) - 2;
    const next = PAGES[i + 1];
    const end = next ? f(next[0].s) - 2 : f(p[p.length - 1].e) + 20;
    return frame >= start && frame < end;
  });
  if (pageIdx < 0) return null;
  const page = PAGES[pageIdx];
  const pageStart = f(page[0].s) - 2;
  const enter = spring({ frame: frame - pageStart, fps, config: { damping: 14, stiffness: 220 } });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          width: SAFE.right - SAFE.left,
          top: SAFE.captionTop,
          height: SAFE.captionBottom - SAFE.captionTop,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignContent: "center",
          columnGap: 17,
          rowGap: 2,
          transform: `translateY(${(1 - enter) * 20}px) scale(${0.85 + 0.15 * enter})`,
          opacity: enter,
        }}
      >
        {page.map((w, i) => {
          const ws = f(w.s);
          const we = f(w.e);
          const active = frame >= ws && frame < Math.max(we, ws + 4);
          const spoken = frame >= ws;
          const pop = spring({ frame: frame - ws, fps, config: { damping: 9, stiffness: 300 } });
          const scale = active ? 1 + 0.1 * pop : 1;
          const color = w.k ? KEY_COLORS[w.k] : active ? ACTIVE : "#FFFFFF";
          const long = w.w.length > 11;
          return (
            <span
              key={i}
              style={{
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: long ? 38 : 44,
                lineHeight: 1.12,
                textTransform: "uppercase",
                letterSpacing: -1,
                color,
                opacity: spoken ? 1 : 0.85,
                WebkitTextStroke: `7px ${THEME.ink}`,
                paintOrder: "stroke fill",
                textShadow: `0 4px 0 ${THEME.inkShadow}, 0 0 15px rgba(110,42,102,0.45)`,
                transform: `scale(${scale}) rotate(${active ? interpolate(pop, [0, 1], [-4, 0]) : 0}deg)`,
                display: "inline-block",
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
