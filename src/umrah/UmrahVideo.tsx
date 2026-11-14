import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {UmrahProblem} from './Problem';
import {FamilyRide, UmrahResult} from './Result';
import {UmrahWhy} from './Why';
import {Versus} from '../scenes/Versus';
import {Cta} from '../scenes/Cta';
import {EndCard} from '../scenes/EndCard';
import {SafeZone} from '../components/SafeZone';
import {Sfx} from '../components/Sfx';
import {U, U_KEYWORD, U_TOTAL} from './timeline';

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const cuts = [U.solution.from, U.result.from, U.why.from, U.cta.from, U.end.from];
  const o = Math.max(...cuts.map((c) => interpolate(frame, [c - 2, c, c + 7], [0, 0.85, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));
  return <AbsoluteFill style={{background: 'white', opacity: o, pointerEvents: 'none'}} />;
};

export const UmrahVideo: React.FC<{showSafeZone: boolean}> = ({showSafeZone}) => (
  <AbsoluteFill style={{background: 'black'}}>
    <Sequence from={U.problem.from} durationInFrames={U.problem.dur}>
      <UmrahProblem />
    </Sequence>
    <Sequence from={U.solution.from} durationInFrames={U.solution.dur}>
      <Versus titleA="Solusinya.. 💡" titleB="Biar adik naik Airwheel! 🧳" features={['👶 Adik duduk, tak penat', '🧳 Beg + skuter dalam satu', '🤲 Ummi fokus ibadah']} />
    </Sequence>
    <Sequence from={U.result.from} durationInFrames={U.result.dur}>
      <UmrahResult />
    </Sequence>
    <Sequence from={U.why.from} durationInFrames={U.why.dur}>
      <UmrahWhy />
    </Sequence>
    <Sequence from={U.cta.from} durationInFrames={U.cta.dur}>
      <Cta word={U_KEYWORD} headline={`Komen "${U_KEYWORD}" untuk tempah 🧳`} bg={(f) => <FamilyRide frame={285 + f} enter={false} />} />
      <Sfx at={52} name="chaching" volume={0.7} />
    </Sequence>
    <Sequence from={U.end.from} durationInFrames={U.end.dur}>
      <EndCard />
    </Sequence>
    <Flash />
    <Audio
      src={staticFile('music/bg_umrah.wav')}
      volume={(f) => interpolate(f, [0, 10, U_TOTAL - 30, U_TOTAL], [0, 0.3, 0.3, 0], {extrapolateRight: 'clamp'})}
    />
    {showSafeZone && <SafeZone />}
  </AbsoluteFill>
);
