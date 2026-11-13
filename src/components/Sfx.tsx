import {Audio, Sequence, staticFile} from 'remotion';

export const Sfx: React.FC<{at: number; name: string; volume?: number; dur?: number}> = ({at, name, volume = 0.8, dur}) => (
  <Sequence from={at} durationInFrames={dur} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);
