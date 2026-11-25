// Render an animated HTML scene file to scene clips.
// usage: node tools/render_anim.js <scene.html> <out_dir> <numScenes> [seconds=5] [fps=30]
// The page must expose window.render(sceneNumber, timeSeconds).
const {chromium}=require('playwright');const {spawn}=require('child_process');const path=require('path');
const [html,out,n,secs='5',fps='30']=process.argv.slice(2);
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:540,height:960},deviceScaleFactor:2});
  p.on('pageerror',e=>{console.error('page error:',e.message);process.exit(1)});
  await p.goto('file://'+path.resolve(html));await p.evaluate(()=>document.fonts.ready);
  for(let s=1;s<=+n;s++){
    const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',fps,'-c:v','mjpeg','-i','-',
      '-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p',path.join(out,`scene${s}.mp4`)],{stdio:['pipe','inherit','inherit']});
    const frames=Math.round(+secs*+fps);
    for(let f=0;f<frames;f++){
      await p.evaluate(([s,t])=>render(s,t),[s,f/+fps]);
      const buf=await p.screenshot({type:'jpeg',quality:92});
      if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r));
    }
    ff.stdin.end();await new Promise(r=>ff.on('close',r));console.log(`scene ${s} done`);
  }
  await b.close();
})();
