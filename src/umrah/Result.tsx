import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Courtyard} from '../components/Courtyard';
import {KidRider, KIDRIDER_GROUND, KIDRIDER_VB} from '../components/Kid';
import {MakcikWalk, MOM} from '../components/Makcik';
import {Bubble} from '../components/Bubble';
import {Chip, Headline} from '../components/Text';
import {Sfx} from '../components/Sfx';

const GROUND = 1275;
const RW = 440;
const RH = (RW * KIDRIDER_VB.h) / KIDRIDER_VB.w;
const RTOP = GROUND - ((KIDRIDER_GROUND - KIDRIDER_VB.y) / KIDRIDER_VB.h) * RH;
const S = 1.35;
const MTOP = GROUND - 505 * S;

// Latar + watak (dipakai juga untuk babak seterusnya secara kabur)
export const FamilyRide: React.FC<{frame: number; enter?: boolean}> = ({frame, enter = true}) => {
  const {fps} = useVideoConfig();
  const inS = enter ? spring({frame, fps, config: {damping: 15, stiffness: 80}}) : 1;
  const kx = interpolate(inS, [0, 1], [-700, 470]) + Math.sin(frame * 0.06) * 12;
  const mx = interpolate(inS, [0, 1], [-900, 70]);
  return (
    <>
      <Courtyard scroll={300 + frame * 9} />
      <div style={{position: 'absolute', left: mx, top: MTOP, width: 300 * S, height: 520 * S}}>
        <MakcikWalk pal={MOM} phase={frame * 0.22} mood="happy" arm="down" />
      </div>
      <div style={{position: 'absolute', left: kx, top: RTOP, width: RW, height: RH}}>
        <KidRider mood="happy" wheelRot={frame * 14} t={frame} bounce={Math.sin(frame * 0.8) * 1.5} />
      </div>
    </>
  );
};
export const KID_HEAD_Y = RTOP + ((298 - 40 - KIDRIDER_VB.y) / KIDRIDER_VB.h) * RH;

export const UmrahResult: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 180], [1.0, 1.05]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <FamilyRide frame={frame} />
      </AbsoluteFill>
      <Bubble text="Yeay! Best naik ni! 🤩" x={700} y={KID_HEAD_Y - 10} start={28} end={95} w={430} />
      <Bubble text="Alhamdulillah, lega 🥹" x={300} y={MTOP + 20} start={100} end={175} w={430} />
      <Headline text="Hasilnya.. 🥹" start={0} end={179} />
      <Chip text="Adik tak meragam lagi 😄" start={30} end={98} />
      <Chip text="Ummi boleh fokus ibadah 🤲" start={100} end={179} bg="#1fbf5b" color="white" />

      <Sfx at={0} name="whoosh" volume={0.7} />
      <Sfx at={8} name="glide" volume={0.35} />
      <Sfx at={90} name="glide" volume={0.35} />
      <Sfx at={28} name="yay" volume={0.7} />
      <Sfx at={100} name="ding" volume={0.6} />
      <Sfx at={102} name="sparkle" volume={0.5} />
    </AbsoluteFill>
  );
};
