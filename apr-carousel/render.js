// Amsyar Pack Rental (APR.) — IG / TikTok carousel renderer
// Usage: node render.js            -> renders 4:5 (IG) and 9:16 (TikTok) sets into out/
//        node render.js 4x5 3      -> renders only slide 3 of the 4:5 set
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const FORMATS = {
  '4x5': { w: 1080, h: 1350, dir: 'out/instagram-1080x1350' },
  // TikTok photo posts show a 3:4 frame; the search bar covers the top ~130px and
  // the like/comment/share buttons cover the right ~150px from mid-height down.
  '3x4': { w: 1080, h: 1440, dir: 'out/tiktok-1080x1440' },
};

// ---------- slide content ----------
// area: where the text sits (top | bottom), align: left | right | center
// pos: CSS object-position for the photo (keeps faces & product in frame)
// band: how far the brand-blue fade reaches into the photo (% of height)
const slides = [
  {
    type: 'cover', show: [0.28, 1.0], photo: '14', pos: '50% 60%', pos916: '50% 60%',
    kicker: 'AMSYAR PACK RENTAL',
    headline: ['Beg yang', 'angkut <em>anda.</em>'],
    body: 'Customer kami dah sampai Osaka, Bali, Istanbul sampai ke Madinah — tanpa heret beg, tanpa kamera berat.',
    swipe: 'Swipe untuk cerita mereka',
  },
  {
    photo: '07', pos: '50% 100%', pos916: '50% 100%', area: 'top', align: 'left', band: 40,
    place: 'Osaka, Jepun', product: 'Airwheel',
    headline: ['Kapten kecil', 'di Osaka.'],
    body: 'Dua beradik "drive" Airwheel sendiri di Amerika-mura. Mak ayah? Tangan bebas, hati tenang.',
  },
  {
    photo: '05', pos: '50% 70%', pos916: '50% 70%', area: 'top', align: 'left', band: 34,
    place: 'Tokyo, Jepun', product: 'Airwheel',
    headline: ['Tokyo,', 'versi pink.'],
    body: 'Airwheel pink ikut sampai Shibuya. Beg jadi skuter — jalan seharian pun kaki tak lenguh.',
  },
  {
    photo: '02', pos: '50% 70%', pos916: '50% 70%', area: 'top', align: 'left', band: 38,
    place: 'Bali, Indonesia', product: 'DJI Osmo Pocket 3',
    headline: ['Bali dalam', 'genggaman.'],
    body: 'Sunset Uluwatu, tarian Kecak — semua dirakam tajam & stabil dengan Pocket 3. Tak goyang langsung.',
  },
  {
    photo: '03', pos: '50% 70%', pos916: '50% 70%', area: 'bottom', align: 'right', band: 34,
    place: 'Bangkok, Thailand', product: 'Airwheel',
    headline: ['Orang lain', 'jalan kaki.', 'Dia <em>meluncur.</em>'],
    body: 'Pickup di KLIA2 Pintu 3, terus meluncur ke gate. Lepas tu Bangkok — bebas.',
  },
  {
    photo: '04', pos: '50% 40%', pos916: '50% 40%', area: 'bottom', align: 'left', band: 38,
    place: 'Istanbul, Turkiye', product: 'DJI Osmo Pocket 3',
    headline: ['Pukul 2 pagi?', 'Kami tetap <em>datang.</em>'],
    body: 'Flight awal pagi ke Istanbul. Kami hantar Pocket 3 terus ke Pintu 3 KLIA2 — tepat masa.',
  },
  {
    photo: '06', pos: '50% 60%', pos916: '50% 60%', area: 'bottom', align: 'right', band: 32,
    place: 'Seoul, Korea', product: 'DJI Osmo Pocket 3',
    headline: ['Vlog pertama,', 'terus <em>jadi.</em>'],
    body: 'Tak pernah vlog sebelum ni. Pocket 3 kecil masuk poket, hasil macam kamera pro.',
  },
  {
    photo: '08', pos: '50% 55%', pos916: '50% 55%', area: 'bottom', align: 'left', band: 32,
    place: 'Hokkaido, Jepun', product: 'DJI Osmo Pocket 3',
    headline: ['Salji pertama,', 'siap <em>dirakam.</em>'],
    body: 'Flight tengah malam ke Chitose. Pocket 3 rakam salji pertama dia — stabil walau tangan menggigil.',
  },
  {
    photo: '09', pos: '50% 70%', pos916: '50% 70%', area: 'top', align: 'left', band: 34,
    place: 'London, UK', product: 'Airwheel',
    headline: ['First time', 'ke London.'],
    body: 'Kaki kecil tak penat jalan terminal. Si kecil naik Airwheel, mak ayah senyum je.',
  },
  {
    show: [0.35, 0.99], photo: '10', pos: '50% 60%', pos916: '50% 60%', area: 'top', align: 'left', band: 34,
    place: 'Taipei, Taiwan', product: 'DJI Osmo Pocket 3',
    headline: ['Cuti akhir', 'tahun, 4K.'],
    body: 'Night market Shilin, Jiufen berkabus — semua masuk dalam satu Pocket 3.',
  },
  {
    photo: '11', pos: '50% 60%', pos916: '45% 60%', area: 'bottom', align: 'right', band: 34,
    place: 'Bandung, Indonesia', product: 'Airwheel',
    headline: ['Tugas abang:', 'jaga <em>beg.</em>'],
    body: 'Rupanya dia yang paling seronok satu family. Airwheel tu tak lepas dari tangan.',
  },
  {
    show: [0.28, 0.99], photo: '12', pos: '50% 60%', pos916: '50% 60%', area: 'top', align: 'left', band: 32,
    place: 'Ho Chi Minh, Vietnam', product: 'DJI Osmo Pocket 3',
    headline: ['Business trip,', 'content jalan.'],
    body: 'Meeting siang, buat content malam. Pocket 3 muat dalam poket seluar.',
  },
  {
    show: [0.31, 0.97], photo: '13', pos: '50% 70%', pos916: '50% 70%', area: 'top', align: 'left', band: 34,
    place: 'Zurich, Switzerland', product: 'DJI Osmo Pocket 3',
    headline: ['Alps Swiss,', 'tanpa beban.'],
    body: 'Hiking ringan, kamera lagi ringan. Pemandangan Alps terus jadi sinematik.',
  },
  {
    show: [0.35, 1.0], photo: '15', pos: '50% 70%', pos916: '50% 70%', area: 'top', align: 'left', band: 34,
    place: 'Madinah, Saudi', product: 'DJI Osmo Pocket 3',
    headline: ['Kenangan', 'Tanah Suci.'],
    body: 'Umrah bersama keluarga. Pocket 3 ringan & senyap — simpan detik berharga tanpa menyusahkan.',
  },
  {
    show: [0.27, 1.0], photo: '01', pos: '50% 80%', pos916: '50% 80%', area: 'top', align: 'left', band: 32,
    place: 'Melbourne → KLIA', product: 'Return Airwheel',
    headline: ['Landed.', 'Return. <em>Balik.</em>'],
    body: 'Lepas 8 jam flight, tak payah singgah mana-mana. Return terus di airport, naik Grab, balik tidur.',
  },
  { type: 'products' },
  { type: 'service' },
  { type: 'cta' },
];

// ---------- templates ----------
const fileUrl = (p) => 'file://' + path.join(ROOT, p);
const logo = fileUrl('build/logo-white.png');
const css = fs.readFileSync(path.join(ROOT, 'fonts/fonts.css'), 'utf8').replace(/\.\.\/fonts\//g, fileUrl('fonts') + '/');

const baseCss = (W, H) => `
${css}
*{margin:0;padding:0;box-sizing:border-box}
:root{--blue:#4072AF;--deep:#22497E;--ink:#0E2240;--white:#fff}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:var(--blue)}
body{font-family:'Montserrat',sans-serif;color:#fff;position:relative;-webkit-font-smoothing:antialiased}
.photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.h{font-family:'Montserrat',sans-serif;font-weight:900;text-transform:uppercase;line-height:1.0;letter-spacing:0}
.h em{font-style:normal;color:#BFD6F5}
.chrome{position:absolute;left:56px;right:56px;display:flex;align-items:center;justify-content:space-between;z-index:5}
.chrome img{height:34px;filter:drop-shadow(0 2px 8px rgba(14,34,64,.6))}
.count{font-family:'Montserrat';font-weight:800;font-size:22px;letter-spacing:.08em;padding:9px 16px;background:rgba(14,34,64,.35);border-radius:4px}
.tag{display:inline-flex;align-items:center;gap:12px;background:#fff;color:var(--deep);font-weight:800;font-size:24px;letter-spacing:.12em;text-transform:uppercase;padding:12px 22px 12px 18px;clip-path:polygon(0 0,100% 0,calc(100% - 14px) 100%,0 100%)}
.pin{width:14px;height:14px;background:var(--blue);transform:rotate(45deg);border-radius:50% 50% 0 50%}
.prod{display:inline-block;margin-left:12px;font-weight:700;font-size:21px;letter-spacing:.14em;text-transform:uppercase;padding:12px 18px;border:2px solid rgba(255,255,255,.85)}
.cut{display:block;height:10px;width:120px;background:#fff;clip-path:polygon(0 0,100% 0,calc(100% - 10px) 100%,0 100%)}
.shadow{text-shadow:0 1px 3px rgba(14,34,64,.35)}
`;

// Photo is placed BELOW the text block so no face is ever covered: the band
// show=[y0,y1] of the photo (head-top .. feet/product) is scaled to fit the space
// under the text; leftover sides are filled with a blurred copy of the same photo.
function fitLayers(src, show) {
  return `
  <img class="photo" src="${src}" style="filter:blur(36px) brightness(.8);transform:scale(1.15)">
  <div style="position:absolute;inset:0;background:rgba(34,73,126,.55)"></div>
  <img id="fg" data-show="${show.join(',')}" src="${src}" style="position:absolute;box-shadow:0 0 60px rgba(14,34,64,.45)">
  <div id="fade" style="position:absolute;left:0;right:0;top:0"></div>`;
}

function storySlide(s, i, n, W, H, fmt) {
  const top = s.area === 'top';
  const tk = fmt === '3x4';
  const band = s.band + 6 + (tk ? 4 : 0);
  const grad = top
    ? `linear-gradient(180deg, rgba(34,73,126,.96) 0%, rgba(64,114,175,.85) ${band * 0.68}%, rgba(64,114,175,0) ${band}%)`
    : `linear-gradient(0deg, rgba(34,73,126,.96) 0%, rgba(64,114,175,.85) ${band * 0.68}%, rgba(64,114,175,0) ${band}%)`;
  const align = tk ? 'left' : s.align;
  const textAlign = align === 'right' ? 'right' : 'left';
  const pad = 56;
  const block = top
    ? `top:${tk ? 160 : 130}px;`
    : `bottom:${tk ? 60 : 70}px;`;
  const chromePos = top ? `bottom:${fmt === '9x16' ? 190 : 56}px` : `top:${fmt === '9x16' ? 150 : 56}px`;
  const src = fileUrl('photos/' + s.photo + '.jpg');
  const bg = s.show ? fitLayers(src, s.show) : `<img class="photo" src="${src}" style="object-position:${s.pos}">
  <div style="position:absolute;inset:0;background:${grad}"></div>`;
  return `
  ${bg}
  ${tk ? '' : `<div class="chrome" style="${chromePos}"><img src="${logo}"><span class="count">${String(i + 1).padStart(2, '0')}/${n}</span></div>`}
  <div id="txt" style="position:absolute;left:${pad}px;right:${tk ? 170 : pad}px;${block}text-align:${textAlign}" class="shadow">
    ${tk ? `<img src="${logo}" style="height:30px;display:block;margin-bottom:22px;filter:drop-shadow(0 2px 8px rgba(14,34,64,.6))">` : ''}
    <div style="display:flex;justify-content:${align === 'right' ? 'flex-end' : 'flex-start'};align-items:center;margin-bottom:26px">
      <span class="tag"><span class="pin"></span>${s.place}</span><span class="prod">${s.product}</span>
    </div>
    <div class="h" style="font-size:68px">${s.headline.join('<br>')}</div>
    <p style="font-weight:600;font-size:29px;line-height:1.42;margin-top:22px;max-width:760px;${align === 'right' ? 'margin-left:auto' : ''}">${s.body}</p>
  </div>`;
}

function coverSlide(s, i, n, W, H, fmt) {
  const tall = false, tk = fmt === '3x4';
  return `
  ${fitLayers(fileUrl('photos/' + s.photo + '.jpg'), s.show)}
  <div style="position:absolute;inset:0;background:linear-gradient(0deg, rgba(34,73,126,.92) 0%, rgba(34,73,126,0) 16%)"></div>
  <div id="txt" style="position:absolute;left:56px;right:56px;top:${tk ? 160 : 60}px" class="shadow">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:${tall ? 52 : 38}px">
      <img src="${logo}" style="height:48px">${tk ? '' : `<span class="count">${String(i + 1).padStart(2, '0')}/${n}</span>`}
    </div>
    <div class="h" style="font-size:96px;line-height:.98">${s.headline.join('<br>')}</div>
    <p style="font-weight:600;font-size:29px;line-height:1.42;margin-top:24px;max-width:900px">${s.body}</p>
    <div style="display:flex;align-items:center;gap:14px;margin-top:22px">
      <span style="font-family:'Montserrat';font-weight:900;font-size:22px;letter-spacing:.08em;text-transform:uppercase;color:#BFD6F5">${s.swipe}</span>
      <span style="display:inline-block;width:30px;height:30px;background:#BFD6F5;clip-path:polygon(0 0,60% 0,100% 50%,60% 100%,0 100%,40% 50%)"></span>
    </div>
  </div>
`;
}

function productsSlide(i, n, W, H, fmt) {
  const tall = false, tk = fmt === '3x4';
  const card = (num, title, line, points, photo, pos, size) => `
    <div style="display:flex;gap:30px;align-items:stretch;background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.22);padding:26px">
      <div style="width:230px;flex:none;background:url('${fileUrl('photos/' + photo + '.jpg')}') ${pos}/${size};clip-path:polygon(0 0,100% 0,calc(100% - 22px) 100%,0 100%)"></div>
      <div>
        <div style="font-family:'Montserrat';font-weight:800;font-size:20px;letter-spacing:.14em;opacity:.75">${num}</div>
        <div class="h" style="font-size:44px;margin:8px 0 10px">${title}</div>
        <div style="font-weight:700;font-size:25px;color:#BFD6F5;margin-bottom:14px">${line}</div>
        ${points.map((p) => `<div style="font-weight:600;font-size:24px;line-height:1.5;display:flex;gap:12px;align-items:baseline"><span style="width:12px;height:12px;flex:none;background:#fff;transform:skewX(-18deg)"></span>${p}</div>`).join('')}
      </div>
    </div>`;
  return `
  <div style="position:absolute;inset:0;background:radial-gradient(120% 80% at 100% 0%, #4F84C4 0%, #4072AF 45%, #2D5A93 100%)"></div>
  <div style="position:absolute;left:56px;right:${tk ? 170 : 56}px;${tk ? 'top:150px' : 'top:64px'}">
    <div style="display:flex;justify-content:space-between;align-items:center"><img src="${logo}" style="height:40px">${tk ? '' : `<span class="count">${String(i + 1).padStart(2, '0')}/${n}</span>`}</div>
    <span class="cut" style="margin:${tall ? 70 : 80}px 0 26px"></span>
    <div class="h" style="font-size:72px">Apa yang<br>kami sewa.</div>
    <p style="font-weight:600;font-size:28px;margin:18px 0 ${tall ? 54 : 38}px;opacity:.92">Dua barang yang ubah cara anda travel.</p>
    <div style="display:flex;flex-direction:column;gap:${tall ? 34 : 30}px">
      ${card('01', 'Airwheel', 'Beg kabin yang jadi skuter.', ['Duduk, tekan, meluncur di terminal', 'Saiz kabin — muat bawa naik flight', 'Sesuai dewasa & kanak-kanak'], '09', '39% 86%', '330%')}
      ${card('02', 'DJI Osmo<br>Pocket 3', 'Kamera gimbal 4K saiz poket.', ['Video stabil, tak goyang', 'Vlog & travel content tanpa kru', 'Ringan — masuk poket seluar'], '12', '50% 53%', '520%')}
    </div>
  </div>`;
}

function serviceSlide(i, n, W, H, fmt) {
  const tall = false, tk = fmt === '3x4';
  const loc = (name, sub) => `
    <div style="display:flex;align-items:center;gap:22px;padding:22px 0;border-top:2px solid rgba(255,255,255,.25)">
      <span style="width:22px;height:22px;flex:none;background:#fff;transform:rotate(45deg);border-radius:50% 50% 0 50%"></span>
      <div><div class="h" style="font-size:34px">${name}</div><div style="font-weight:600;font-size:23px;opacity:.85;margin-top:4px">${sub}</div></div>
    </div>`;
  return `
  <div style="position:absolute;inset:0;background:linear-gradient(160deg,#22497E 0%,#4072AF 70%)"></div>
  <div style="position:absolute;left:56px;right:${tk ? 170 : 56}px;${tk ? 'top:150px' : 'top:64px'}">
    <div style="display:flex;justify-content:space-between;align-items:center"><img src="${logo}" style="height:40px">${tk ? '' : `<span class="count">${String(i + 1).padStart(2, '0')}/${n}</span>`}</div>
    <div class="h" style="font-size:${tall ? 230 : 210}px;line-height:.9;margin-top:${tall ? 80 : 90}px;letter-spacing:-0.03em">24<span style="font-size:.42em;color:#BFD6F5;letter-spacing:0;margin-left:14px">JAM</span></div>
    <div class="h" style="font-size:52px;margin-top:14px">Pukul 2 pagi pun<br>kami hantar.</div>
    <p style="font-weight:600;font-size:28px;line-height:1.45;margin:20px 0 ${tall ? 60 : 34}px;max-width:900px">Flight awal pagi atau landed tengah malam — anda bagi masa, kami datang. Pickup & return di lokasi yang sesuai dengan anda:</p>
    ${loc('KLIA Terminal 1', 'Pickup sebelum check-in, return lepas landed')}
    ${loc('KLIA Terminal 2', 'Jumpa terus di pintu masuk Level 3')}
    ${loc('Mitsui Outlet Park', 'Dekat KLIA — senang singgah')}
    ${loc('Kota Warisan', 'Untuk yang tinggal sekitar Sepang')}
  </div>`;
}

function ctaSlide(i, n, W, H, fmt) {
  const tall = false, tk = fmt === '3x4';
  const step = (n2, t) => `<div style="display:flex;gap:22px;align-items:center;margin-top:20px"><span style="font-family:'Montserrat';font-weight:900;font-size:28px;width:64px;height:64px;flex:none;display:grid;place-items:center;background:#fff;color:#22497E;clip-path:polygon(0 0,100% 0,calc(100% - 10px) 100%,0 100%)">${n2}</span><span style="font-weight:700;font-size:30px">${t}</span></div>`;
  return `
  <div style="position:absolute;inset:0;background:#4072AF"></div>
  <div style="position:absolute;inset:0;background:repeating-linear-gradient(-14deg, rgba(255,255,255,0) 0 120px, rgba(255,255,255,.035) 120px 124px)"></div>
  <div style="position:absolute;left:56px;right:${tk ? 170 : 56}px;${tk ? 'top:150px' : 'top:64px'}">
    <div style="display:flex;justify-content:flex-end">${tk ? '' : `<span class="count">${String(i + 1).padStart(2, '0')}/${n}</span>`}</div>
    <div style="text-align:center;margin-top:${tall ? 120 : 80}px">
      <img src="${logo}" style="width:${tall ? 620 : 560}px">
    </div>
    <div class="h" style="font-size:64px;text-align:center;margin-top:${tall ? 90 : 60}px">Destinasi seterusnya<br><em>giliran anda.</em></div>
    <div style="margin:${tall ? 60 : 36}px auto 0;width:max-content">
      ${step('1', 'DM kami tarikh & destinasi')}
      ${step('2', 'Pilih Airwheel / Pocket 3')}
      ${step('3', 'Pickup di airport — terus fly')}
    </div>
    <div style="margin:${tall ? 80 : 46}px auto 0;width:max-content;background:#fff;color:#22497E;font-family:'Montserrat';font-weight:900;font-size:34px;letter-spacing:.04em;text-transform:uppercase;padding:26px 46px;clip-path:polygon(0 0,100% 0,calc(100% - 22px) 100%,0 100%)">DM “APR” sekarang</div>
    <div style="text-align:center;margin-top:${tall ? 40 : 30}px"><div style="font-weight:700;font-size:22px;letter-spacing:.18em;text-transform:uppercase;opacity:.85">WhatsApp / Call</div><div class="h" style="font-size:58px;margin-top:8px;letter-spacing:.01em">019-336 0313</div></div>
    <p style="text-align:center;font-weight:600;font-size:24px;margin-top:18px;opacity:.9">Slot musim cuti cepat habis — tempah awal.</p>
  </div>`;
}

function html(s, i, n, fmt) {
  const { w: W, h: H } = FORMATS[fmt];
  let body;
  if (s.type === 'cover') body = coverSlide(s, i, n, W, H, fmt);
  else if (s.type === 'products') body = productsSlide(i, n, W, H, fmt);
  else if (s.type === 'service') body = serviceSlide(i, n, W, H, fmt);
  else if (s.type === 'cta') body = ctaSlide(i, n, W, H, fmt);
  else body = storySlide(s, i, n, W, H, fmt);
  return `<!doctype html><html><head><meta charset="utf-8"><style>${baseCss(W, H)}</style></head><body>${body}</body></html>`;
}

(async () => {
  const [onlyFmt, onlySlide] = process.argv.slice(2);
  const browser = await chromium.launch();
  for (const fmt of Object.keys(FORMATS)) {
    if (onlyFmt && onlyFmt !== fmt) continue;
    const { w, h, dir } = FORMATS[fmt];
    fs.mkdirSync(path.join(ROOT, dir), { recursive: true });
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    for (let i = 0; i < slides.length; i++) {
      if (onlySlide && Number(onlySlide) !== i + 1) continue;
      const file = path.join(ROOT, 'build', `slide-${fmt}.html`);
      fs.writeFileSync(file, html(slides[i], i, slides.length, fmt));
      await page.goto('file://' + file);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForLoadState('networkidle');
      await page.evaluate(([W, H]) => {
        const img = document.getElementById('fg');
        if (!img) return;
        const [y0, y1] = img.dataset.show.split(',').map(Number);
        const T = Math.round(document.getElementById('txt').getBoundingClientRect().bottom + 36);
        const h = (H - T) / (y1 - y0), w = h * img.naturalWidth / img.naturalHeight;
        Object.assign(img.style, { width: w + 'px', height: h + 'px', left: (W - w) / 2 + 'px', top: T - y0 * h + 'px' });
        const f = document.getElementById('fade');
        f.style.height = T + 'px';
        f.style.background = 'linear-gradient(180deg, #22497E 0%, #4072AF ' + (T - 90) + 'px, rgba(64,114,175,0) ' + T + 'px)';
      }, [w, h]);
      await page.screenshot({ path: path.join(ROOT, dir, `APR-${String(i + 1).padStart(2, '0')}.png`), type: 'png' });
    }
    await page.close();
  }
  await browser.close();
  console.log('done');
})();
