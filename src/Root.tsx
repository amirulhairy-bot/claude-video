import {Composition} from 'remotion';
import {Video} from './Video';
import {FPS, HEIGHT, TOTAL, WIDTH} from './config';
import {UmrahVideo} from './umrah/UmrahVideo';
import {U_TOTAL} from './umrah/timeline';

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
    <Composition id="UmrahAnakSE3S" component={UmrahVideo} durationInFrames={U_TOTAL} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{showSafeZone: false}} />
    <Composition id="UmrahAnakSE3S-SafeZone" component={UmrahVideo} durationInFrames={U_TOTAL} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{showSafeZone: true}} />
  </>
);
