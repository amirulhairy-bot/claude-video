import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Courtyard} from '../components/Courtyard';
import {MakcikWalk, MOM} from '../components/Makcik';
import {Kid} from '../components/Kid';
import {OldSuitcase} from '../components/Bags';
import {Bubble} from '../components/Bubble';
import {Chip, Headline} from '../components/Text';
import {Sfx} from '../components/Sfx';

const S = 1.35;
const MW = 300 * S;
const MH = 520 * S;
const GROUND = 1275;
const MTOP = GROUND - 505 * S;
const KS = 1.4;
const KW = 160 * KS;
const KH = 300 * KS;
const KTOP = GROUND - 290 * KS;

export const UmrahProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const stop = 115;
  const walking = frame < stop;
  const f = Math.min(frame, stop);
  const mx = interpolate(f, [0, stop], [-80, 560]);
  const kx = interpolate(f, [0, stop], [-320, 80]);
  const scroll = f * 3;
  const stopT = spring({frame: frame - stop, fps, config: {damping: 14}});
  const ang = 36 * (1 - stopT);
  const px = interpolate(stopT, [0, 1], [mx + 130 - 236, mx - 150]);
  const turned = frame >= 135;
  const turnS = turned ? interpolate(spring({frame: frame - 135, fps, config: {damping: 12}}), [0, 1], [1, -1]) : 1;
  const kidPose = walking ? 'walk' : frame < 186 ? 'sit' : 'armsUp';
  const kidMood = frame < 70 ? 'happy' : frame < stop ? 'tired' : 'cry';
  const zoom = interpolate(frame, [0, 255], [1.06, 1.0]);
  const shake = frame >= 116 && frame < 124 ? Math.sin(frame * 3) * 8 : 0;

  return (
    <AbsoluteFill style={{transform: `translateX(${shake}px)`}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <Courtyard scroll={scroll} heat={interpolate(frame, [60, 120], [0.2, 0.75], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
        <div style={{position: 'absolute', left: px - 110, top: GROUND - 416, width: 220, height: 418, transform: `rotate(${ang}deg)`, transformOrigin: '50% 99%'}}>
          <OldSuitcase />
        </div>
        <div style={{position: 'absolute', left: mx, top: MTOP, width: MW, height: MH, transform: `scaleX(${turnS})`}}>
          <MakcikWalk
            pal={MOM}
            phase={f * 0.2}
            mood={frame < 100 ? 'neutral' : 'pain'}
            arm={walking ? 'pull' : 'down'}
            sweat={interpolate(frame, [150, 170], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
          />
        </div>
        <div style={{position: 'absolute', left: kx, top: KTOP, width: KW, height: KH}}>
          <Kid pose={kidPose} phase={f * 0.32} mood={kidMood} t={frame} />
        </div>
      </AbsoluteFill>

      <Bubble text="Ummi... kaki adik penat 😭" x={kx + 150} y={KTOP + 120} start={125} end={184} />
      <Bubble text="Dukung adik! 🥺" x={kx + 150} y={KTOP + 10} start={190} end={253} w={380} />

      <Headline text="Bawa anak kecil ke Makkah? 🕌" start={0} end={72} size={78} />
      <Headline text="Masalahnya... 😣" start={75} end={254} />
      <Chip text="Jalan jauh dari hotel ke masjid 🥵" start={80} end={160} bg="#ff8a2a" color="white" />
      <Chip text="Ummi pun penat, tangan penuh 😮‍💨" start={165} end={254} />

      <Sfx at={0} name="whoosh" volume={0.6} />
      <Sfx at={75} name="pop" volume={0.6} />
      <Sfx at={80} name="buzz" volume={0.4} />
      <Sfx at={116} name="thud" volume={0.8} />
      <Sfx at={120} name="sad" volume={0.55} />
      <Sfx at={125} name="pop" volume={0.6} />
      <Sfx at={165} name="buzz" volume={0.35} />
      <Sfx at={190} name="pop" volume={0.7} />
    </AbsoluteFill>
  );
};
