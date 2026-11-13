import {Composition} from 'remotion';
import {Video} from './Video';
import {FPS, HEIGHT, TOTAL, WIDTH} from './config';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="AirwheelSE3S"
      component={Video}
      durationInFrames={TOTAL}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{showSafeZone: false}}
    />
    <Composition
      id="AirwheelSE3S-SafeZone"
      component={Video}
      durationInFrames={TOTAL}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{showSafeZone: true}}
    />
  </>
);
