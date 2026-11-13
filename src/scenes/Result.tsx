import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Airport, SpeedLines} from '../components/Airport';
import {Rider, RIDER_GROUND, RIDER_VB} from '../components/Rider';
import {Chip, Headline} from '../components/Text';
import {Sfx} from '../components/Sfx';
import {SAFE_BOX} from '../config';

export const RW = 480;
export const RH = (RW * RIDER_VB.h) / RIDER_VB.w;
export const RTOP = 1280 - ((RIDER_GROUND - RIDER_VB.y) / RIDER_VB.h) * RH;

export const RiderOnAirport: React.FC<{frame: number; enter?: boolean}> = ({frame, enter = true}) => {
  const {fps} = useVideoConfig();
  const inS = enter ? spring({frame, fps, config: {damping: 15, stiffness: 90}}) : 1;
  const x = interpolate(inS, [0, 1], [-900, SAFE_BOX.x + (SAFE_BOX.w - RW) / 2]) + Math.sin(frame * 0.07) * 18;
  return (
    <>
      <Airport scroll={300 + frame * 26} />
      <SpeedLines frame={frame} opacity={0.9} />
      <div style={{position: 'absolute', left: x, top: RTOP, width: RW, height: RH}}>
        <Rider mood="happy" wheelRot={frame * 28} wind={0.7 + 0.25 * Math.sin(frame * 0.6)} bounce={Math.sin(frame * 0.9) * 2.5} />
      </div>
    </>
  );
};

export const Result: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 180], [1.0, 1.06]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <RiderOnAirport frame={frame} />
      </AbsoluteFill>
      <Headline text="Hasilnya.. 🔥" start={0} end={179} />
      <Chip text="Meluncur macam biasa 😎" start={28} end={98} />
      <Chip text="Sampai gate, lutut tak sakit ✅" start={100} end={179} bg="#1fbf5b" color="white" />

      <Sfx at={0} name="whoosh" volume={0.8} />
      <Sfx at={6} name="glide" volume={0.55} />
      <Sfx at={90} name="glide" volume={0.55} />
      <Sfx at={28} name="pop" volume={0.6} />
      <Sfx at={100} name="ding" volume={0.7} />
      <Sfx at={102} name="sparkle" volume={0.5} />
    </AbsoluteFill>
  );
};
