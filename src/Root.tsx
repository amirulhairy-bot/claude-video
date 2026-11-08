import React from 'react';
import {Composition} from 'remotion';
import {HomestayVideo, VideoProps} from './Video';
import {TOTAL_FRAMES} from './script';
import {FPS, H, W} from './theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="HomestayTikTok"
      component={HomestayVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{platform: 'tiktok', showSafeZone: false} satisfies VideoProps}
    />
    <Composition
      id="HomestayReels"
      component={HomestayVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{platform: 'reels', showSafeZone: false} satisfies VideoProps}
    />
  </>
);
