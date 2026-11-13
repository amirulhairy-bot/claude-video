import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Problem} from './scenes/Problem';
import {Versus} from './scenes/Versus';
import {Result} from './scenes/Result';
import {Cta} from './scenes/Cta';
import {EndCard} from './scenes/EndCard';
import {SafeZone} from './components/SafeZone';
import {SCENES, TOTAL} from './config';

// Kilat putih pendek antara babak (transisi gaya whip)
const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const cuts = [SCENES.vs.from, SCENES.result.from, SCENES.cta.from, SCENES.end.from];
  const o = Math.max(
    ...cuts.map((c) => interpolate(frame, [c - 2, c, c + 7], [0, 0.85, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})),
  );
  return <AbsoluteFill style={{background: 'white', opacity: o, pointerEvents: 'none'}} />;
};

export const Video: React.FC<{showSafeZone: boolean}> = ({showSafeZone}) => (
  <AbsoluteFill style={{background: 'black'}}>
    <Sequence from={SCENES.problem.from} durationInFrames={SCENES.problem.dur}>
      <Problem />
    </Sequence>
    <Sequence from={SCENES.vs.from} durationInFrames={SCENES.vs.dur}>
      <Versus />
    </Sequence>
    <Sequence from={SCENES.result.from} durationInFrames={SCENES.result.dur}>
      <Result />
    </Sequence>
    <Sequence from={SCENES.cta.from} durationInFrames={SCENES.cta.dur}>
      <Cta />
    </Sequence>
    <Sequence from={SCENES.end.from} durationInFrames={SCENES.end.dur}>
      <EndCard />
    </Sequence>
    <Flash />
    <Audio
      src={staticFile('music/bg.wav')}
      volume={(f) => interpolate(f, [0, 10, TOTAL - 30, TOTAL], [0, 0.32, 0.32, 0], {extrapolateRight: 'clamp'})}
    />
    {showSafeZone && <SafeZone />}
  </AbsoluteFill>
);
