import { Composition } from "remotion";
import { MakcikOman } from "./MakcikOman";
import { FPS, TOTAL_FRAMES } from "./data";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MakcikOman"
    component={MakcikOman}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
