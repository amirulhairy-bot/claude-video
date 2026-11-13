import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Airport, Burst} from '../components/Airport';
import {MakcikWalk} from '../components/Makcik';
import {OldSuitcase} from '../components/Bags';
import {Chip, Headline} from '../components/Text';
import {Sfx} from '../components/Sfx';
import {FONT} from '../components/fonts';
import {SAFE_BOX} from '../config';

const S = 1.35; // skala makcik
const MW = 300 * S;
const MH = 520 * S;
const GROUND = 1275;
const MTOP = GROUND - 505 * S;

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const walkEnd = 95;
  const walking = frame < walkEnd;
  const mx = interpolate(frame, [0, walkEnd], [-120, 330], {extrapolateRight: 'clamp'});
  // langkah perlahan & tempang selepas sakit
  const phase = Math.min(frame, walkEnd) * (frame < 45 ? 0.2 : 0.13);
  const scroll = Math.min(frame, walkEnd) * 3;

  // beg lama ditarik (condong) → berdiri tegak bila berhenti
  const stopT = spring({frame: frame - walkEnd, fps, config: {damping: 14}});
  const ang = 36 * (1 - stopT);
  const handX = mx + 130;
  const px = interpolate(stopT, [0, 1], [handX - 236, mx - 150]);

  const pain = frame >= 45;
  const pulse = pain ? 0.5 + 0.5 * Math.sin(frame * 0.5) : 0;
  const burstS = spring({frame: frame - 48, fps, config: {damping: 8, stiffness: 220}});
  const burstOut = interpolate(frame, [80, 88], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const signS = spring({frame: frame - 100, fps, config: {damping: 10}});
  const shake = frame >= 48 && frame < 58 ? Math.sin(frame * 3) * 10 : 0;
  const zoomIn = interpolate(frame, [0, 165], [1.08, 1.0]);

  return (
    <AbsoluteFill style={{transform: `translateX(${shake}px)`}}>
      <AbsoluteFill style={{filter: 'saturate(0.45) contrast(0.95)', transform: `scale(${zoomIn})`}}>
        <Airport scroll={scroll} dim={0.35} />
        {/* beg lama */}
        <div
          style={{
            position: 'absolute',
            left: px - 110,
            top: GROUND - 416,
            width: 220,
            height: 418,
            transform: `rotate(${ang}deg)`,
            transformOrigin: '50% 99%',
          }}
        >
          <OldSuitcase />
        </div>
        {/* denyut sakit lutut */}
        {pain && (
          <div
            style={{
              position: 'absolute',
              left: mx + 236 - 90,
              top: MTOP + 410 * S - 90,
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(255,40,40,${0.85 * pulse}) 0%, rgba(255,40,40,0) 70%)`,
            }}
          />
        )}
        <div style={{position: 'absolute', left: mx, top: MTOP, width: MW, height: MH}}>
          <MakcikWalk
            phase={phase}
            mood={pain ? 'pain' : 'neutral'}
            arm={walking ? 'pull' : 'knee'}
            sweat={interpolate(frame, [60, 80], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
          />
        </div>
      </AbsoluteFill>

      {/* vignette merah */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(160,0,0,0.55) 100%)',
          opacity: pain ? 0.4 + 0.4 * pulse : 0,
        }}
      />

      {frame >= 48 && (
        <div style={{position: 'absolute', left: Math.min(mx + 230, SAFE_BOX.x + SAFE_BOX.w - 380), top: 600, opacity: burstOut}}>
          <Burst text="ADUH!" scale={burstS} />
        </div>
      )}

      {/* papan tanda jarak gate */}
      {frame >= 100 && (
        <div style={{position: 'absolute', left: SAFE_BOX.x, width: SAFE_BOX.w, top: 470, display: 'flex', justifyContent: 'center'}}>
          <div
            style={{
              transform: `scale(${signS}) rotate(${(1 - signS) * 10}deg)`,
              background: '#1b2633',
              color: '#ffd23f',
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 58,
              padding: '18px 34px',
              borderRadius: 16,
              border: '5px solid #ffd23f',
              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            }}
          >
            ✈ Gate B32 ➜ 1.2 km 😵
          </div>
        </div>
      )}

      <Headline text="Masalahnya... 😣⛔" start={0} end={164} />
      <Chip text="Lutut sakit bila jalan jauh 😩" start={55} end={104} bg="#e5312b" color="white" />
      <Chip text="Airport besar, gate pula jauh 🥲" start={106} end={164} />

      <Sfx at={0} name="whoosh" volume={0.6} />
      <Sfx at={8} name="buzz" volume={0.5} />
      <Sfx at={47} name="thud" volume={1} />
      <Sfx at={49} name="pop" volume={0.6} />
      <Sfx at={100} name="pop" volume={0.7} />
      <Sfx at={104} name="buzz" volume={0.4} />
    </AbsoluteFill>
  );
};
