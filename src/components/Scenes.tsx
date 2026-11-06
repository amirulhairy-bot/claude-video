import React from "react";
import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SAFE, f } from "../data";
import { FONT } from "../font";
import { CheckIcon, FlameIcon, Pill, PinIcon, PlaneIcon, Slam, Stamp, Thermometer, stroke, useInOut } from "./kit";
import { SkySnow } from "./Hook";

/** Container for every mid-video graphic: confined to the sky band above the speaker's head. */
const Sky: React.FC<{ dur: number; children: React.ReactNode; row?: boolean }> = ({ dur, children, row }) => {
  const { exit } = useInOut(dur);
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        width: SAFE.right - SAFE.left,
        top: SAFE.skyTop,
        height: SAFE.skyBottom - SAFE.skyTop,
        display: "flex",
        flexDirection: row ? "row" : "column",
        alignItems: "center",
        justifyContent: "center",
        gap: row ? 28 : 16,
        opacity: 1 - exit,
        transform: `translateY(${-exit * 80}px) scale(${1 - exit * 0.15})`,
      }}
    >
      {children}
    </div>
  );
};

const NotAnAd: React.FC<{ dur: number; checkAt: number }> = ({ dur, checkAt }) => (
  <Sky dur={dur}>
    <Stamp text="Bukan Iklan!" color="#FF3B3B" size={104} />
    <Pill at={checkAt} bg="#111" size={40}>
      <CheckIcon size={44} /> Makcik guna sendiri
    </Pill>
  </Sky>
);

const Travel: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, dur], [0, 1], { extrapolateRight: "clamp" });
  const x = interpolate(p, [0, 1], [-160, 1180]);
  const y = 300 - Math.sin(p * Math.PI) * 60;
  return (
    <>
      <svg width={1080} height={700} style={{ position: "absolute", left: 0, top: 0 }}>
        <path
          d={`M -160 300 Q 510 180 ${x} ${y}`}
          stroke="#fff"
          strokeWidth={7}
          strokeDasharray="4 22"
          strokeLinecap="round"
          fill="none"
          opacity={0.9}
        />
      </svg>
      <div style={{ position: "absolute", left: x - 55, top: y - 55, transform: "rotate(90deg)" }}>
        <PlaneIcon size={110} />
      </div>
      <div style={{ position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: 400, textAlign: "center" }}>
        <Slam text="Teman travel wajib" at={6} size={72} bg="#0E7CFF" />
      </div>
    </>
  );
};

const WhyFunction: React.FC<{ dur: number; answerAt: number }> = ({ dur, answerAt }) => (
  <Sky dur={dur}>
    <Slam text="Sebab apa?" at={0} size={108} rotate={-2} />
    <Slam text="Fungsi dia BESAR!" at={answerAt} size={70} bg="#FFE14D" color="#111" rotate={2} />
  </Sky>
);

const OmanCold: React.FC<{ dur: number; slamAt: number }> = ({ dur, slamAt }) => {
  const frame = useCurrentFrame();
  const drop = interpolate(frame, [6, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <SkySnow count={22} opacity={interpolate(frame, [dur - 10, dur], [1, 0], { extrapolateLeft: "clamp" })} />
      <Sky dur={dur} row>
        <Thermometer progress={drop} from={0.75} to={0.12} color="#3BB6FF" height={330} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14 }}>
          <Pill bg="#fff" color="#111" size={44}>
            <PinIcon size={46} /> Oman
          </Pill>
          <Slam text="Gurun" at={8} size={96} />
          <Slam text="Sejuk sangat!" at={slamAt} size={80} color="#8FE3FF" />
        </div>
      </Sky>
    </>
  );
};

const ApplyTip: React.FC<{ dur: number; secondAt: number }> = ({ dur, secondAt }) => (
  <Sky dur={dur}>
    <Pill bg="#FFE14D" color="#111" size={40}>
      Tip makcik
    </Pill>
    <Slam text="Sapu dulu" at={4} size={110} />
    <Slam text="sebelum keluar!" at={secondAt} size={72} color="#FFE14D" />
  </Sky>
);

const Warm: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: "clamp" });
  const glow = interpolate(frame, [0, 12, dur - 10, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, rgba(255,110,20,0.5) 0%, rgba(255,110,20,0) 36%)",
          opacity: glow,
        }}
      />
      <Sky dur={dur} row>
        <Thermometer progress={rise} from={0.12} to={0.92} color="#FF3D1F" height={330} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
          <Slam text="Badan" at={2} size={90} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Slam text="Hangat!" at={9} size={120} color="#FF8A2A" />
            <div style={{ transform: `scale(${1 + Math.sin(frame / 3) * 0.1})` }}>
              <FlameIcon size={110} />
            </div>
          </div>
        </div>
      </Sky>
    </>
  );
};

const Mami: React.FC<{ dur: number; lupaAt: number }> = ({ dur, lupaAt }) => (
  <Sky dur={dur}>
    <Slam text="Mami-mami semua!" at={4} size={80} bg="#FF4FA3" color="#fff" rotate={-2} />
    <Slam text="Jangan lupa!" at={lupaAt} size={104} color="#FFE14D" />
  </Sky>
);

const MustBuy: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const shake = frame < 8 ? Math.sin(frame * 3) * 12 : 0;
  return (
    <Sky dur={dur}>
      <div style={{ transform: `translateX(${shake}px)` }}>
        <Stamp text="Wajib beli!" color="#3DF58A" size={124} rotate={-6} />
      </div>
    </Sky>
  );
};

const ITEMS = ["Tahan sejuk", "Hangatkan badan", "Senang bawa travel"];
const ManyUses: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Sky dur={dur}>
      <Slam text="Banyak kegunaan" at={0} size={74} bg="#0E7CFF" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
        {ITEMS.map((t, i) => {
          const at = 14 + i * 14;
          const s = spring({ frame: frame - at, fps, config: { damping: 13, stiffness: 220 } });
          return (
            <div
              key={t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: s,
                transform: `translateX(${(1 - s) * 120}px)`,
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: 56,
                color: "#fff",
                textTransform: "uppercase",
                ...stroke(12),
              }}
            >
              <CheckIcon size={58} /> {t}
            </div>
          );
        })}
      </div>
    </Sky>
  );
};

const Cta: React.FC<{ dur: number; followAt: number }> = ({ dur, followAt }) => (
  <Sky dur={dur + 10}>
    <Slam text="Cubalah!" at={4} size={150} color="#3DF58A" rotate={-3} />
    <Pill at={followAt} bg="#E8202A" size={44}>
      Follow untuk tips makcik
    </Pill>
  </Sky>
);

/* ---------------- Timeline (source-time anchored) ---------------- */

type SceneDef = { from: number; to: number; el: (dur: number) => React.ReactNode };

const rel = (anchor: number, src: number) => f(src) - f(anchor);

export const SCENES: SceneDef[] = [
  { from: 6.3, to: 9.3, el: (d) => <NotAnAd dur={d} checkAt={rel(6.3, 8.5)} /> },
  { from: 13.2, to: 15.95, el: (d) => <Travel dur={d} /> },
  { from: 16.0, to: 18.95, el: (d) => <WhyFunction dur={d} answerAt={rel(16.0, 17.12)} /> },
  { from: 19.6, to: 24.3, el: (d) => <OmanCold dur={d} slamAt={rel(19.6, 23.62)} /> },
  { from: 24.42, to: 28.0, el: (d) => <ApplyTip dur={d} secondAt={rel(24.42, 26.3)} /> },
  { from: 28.08, to: 30.12, el: (d) => <Warm dur={d} /> },
  { from: 30.9, to: 33.35, el: (d) => <Mami dur={d} lupaAt={rel(30.9, 32.68)} /> },
  { from: 33.4, to: 36.2, el: (d) => <MustBuy dur={d} /> },
  { from: 36.24, to: 38.75, el: (d) => <ManyUses dur={d} /> },
  { from: 38.8, to: 41.5, el: (d) => <Cta dur={d} followAt={rel(38.8, 40.24)} /> },
];

export const Scenes: React.FC = () => (
  <>
    {SCENES.map((s, i) => {
      const from = f(s.from);
      const dur = f(s.to) - from;
      return (
        <Sequence key={i} from={from} durationInFrames={dur} layout="none">
          <AbsoluteFill>{s.el(dur)}</AbsoluteFill>
        </Sequence>
      );
    })}
  </>
);
