// usage: node render2.js jobs.json   jobs: [{in, out, w, h, unit:'px'|'mm', scale}]
const {chromium}=require('playwright');const path=require('path');
(async()=>{const jobs=require(path.resolve(process.argv[2]));const b=await chromium.launch();
for(const j of jobs){const mm=j.unit==='mm';const pxw=mm?Math.ceil(j.w*96/25.4):j.w, pxh=mm?Math.ceil(j.h*96/25.4):j.h;
const p=await b.newPage({viewport:{width:pxw,height:pxh},deviceScaleFactor:j.scale||1});
await p.goto('file://'+path.resolve(j.in));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(200);
if(j.out.endsWith('.pdf')) await p.pdf({path:j.out,width:mm?j.w+'mm':j.w+'px',height:mm?j.h+'mm':j.h+'px',printBackground:true,pageRanges:'1',margin:{top:0,left:0,right:0,bottom:0}});
else await p.screenshot({path:j.out});
await p.close();console.log('ok',j.out);}
await b.close();})();
