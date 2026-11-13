import {continueRender, delayRender, staticFile} from 'remotion';
import {FONT_EMOJI} from '../config';

// Fon Poppins disimpan dalam public/fonts (tak perlu internet semasa render).
const handle = delayRender('Loading Poppins');
Promise.all(
  (['600', '800'] as const).map((w) => {
    const f = new FontFace('Poppins', `url(${staticFile(`fonts/Poppins-${w}.woff2`)}) format('woff2')`, {weight: w});
    (document.fonts as unknown as {add: (f: FontFace) => void}).add(f);
    return f.load();
  }),
)
  .then(() => continueRender(handle))
  .catch((e) => {
    console.error(e);
    continueRender(handle);
  });

export const FONT = `Poppins, ${FONT_EMOJI}, sans-serif`;
