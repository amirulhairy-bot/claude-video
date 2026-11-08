import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Html5Audio, Sequence, continueRender, delayRender, staticFile} from 'remotion';
import {SCENES, sceneStarts} from './script';
import type {Platform} from './theme';
import {PlatformCtx, SafeZoneOverlay, Sfx} from './components/Base';
import {ChecklistScene, CtaScene, Hook, KitchenScene, PhotoScene, TopTag} from './components/Scenes';

export type VideoProps = {platform: Platform; showSafeZone: boolean};

const useFonts = () => {
  const [handle] = useState(() => delayRender('Loading fonts'));
  useEffect(() => {
    Promise.all([
      document.fonts.load('100px Anton'),
      document.fonts.load('600 60px Montserrat'),
      document.fonts.load('800 60px Montserrat'),
      document.fonts.load('900 60px Montserrat'),
    ]).then(() => continueRender(handle));
  }, [handle]);
};

export const HomestayVideo: React.FC<VideoProps> = ({platform, showSafeZone}) => {
  useFonts();
  const starts = sceneStarts();
  const tagFrom = SCENES[0].dur;
  const tagTo = starts[SCENES.findIndex((s) => s.type === 'checklist')];

  return (
    <PlatformCtx.Provider value={platform}>
      <AbsoluteFill style={{backgroundColor: '#000'}}>
        {SCENES.map((scene, i) => (
          <Sequence key={i} from={starts[i]} durationInFrames={scene.dur} name={`${i + 1}. ${scene.type}`}>
            {scene.type === 'hook' ? <Hook img={scene.img} dur={scene.dur} /> : null}
            {scene.type === 'photo' ? <PhotoScene scene={scene} /> : null}
            {scene.type === 'kitchen' ? <KitchenScene scene={scene} /> : null}
            {scene.type === 'checklist' ? <ChecklistScene scene={scene} /> : null}
            {scene.type === 'cta' ? <CtaScene img={scene.img} dur={scene.dur} /> : null}
          </Sequence>
        ))}

        <Sequence from={tagFrom} durationInFrames={tagTo - tagFrom} name="top tag">
          <TopTag />
        </Sequence>

        {/* whoosh peaks right on every cut (except into CTA, which gets the riser) */}
        {SCENES.map((scene, i) =>
          i > 0 && scene.type !== 'cta' ? (
            <Sfx key={`w${i}`} src={i % 2 ? 'whoosh.wav' : 'whoosh_fast.wav'} at={starts[i] - 8} volume={0.55} />
          ) : null,
        )}

        <Html5Audio src={staticFile('sfx/music.wav')} volume={0.32} />

        {showSafeZone ? <SafeZoneOverlay /> : null}
      </AbsoluteFill>
    </PlatformCtx.Provider>
  );
};
