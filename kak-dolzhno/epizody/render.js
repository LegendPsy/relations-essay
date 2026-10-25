// node render.js ep1 stills 0,4,9.5   → кадры PNG в папку scratch
// node render.js ep1 all OUTDIR      → все кадры JPEG + cues.json
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const [ep, mode, arg, arg2] = process.argv.slice(2);
  const b = await chromium.launch({args: ['--disable-gpu-vsync', '--force-device-scale-factor=1']});
  const p = await b.newPage({viewport: {width: 1920, height: 1080}});
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => { if (m.type() !== 'log' || /warn|err/i.test(m.text())) console.log('console', m.text()); });
  await p.goto('file://' + path.resolve(__dirname, ep + '.html')); await p.waitForFunction(() => window.ready);
  if (mode === 'stills'){
    const out = arg2 || '.';
    for (const t of arg.split(',').map(Number)){ const t0 = Date.now(); const d = await p.evaluate(t => window.renderTime(t), t); fs.writeFileSync(path.join(out, `${ep}-t${t}.png`), Buffer.from(d.split(',')[1], 'base64')); console.log('t', t, Date.now() - t0, 'ms'); }
  } else {
    const out = arg; fs.mkdirSync(out, {recursive: true});
    const dur = await p.evaluate(() => window.DUR), n = Math.round(dur * 24);
    fs.writeFileSync(path.join(out, 'cues.json'), JSON.stringify(await p.evaluate(() => window.CUES)));
    const from = +(arg2 || 0), t0 = Date.now();
    for (let i = from; i < n; i++){ const d = await p.evaluate(i => window.renderFrame(i), i); fs.writeFileSync(path.join(out, String(i).padStart(5, '0') + '.jpg'), Buffer.from(d.split(',')[1], 'base64')); if (i % 48 === 0) console.log('frame', i, '/', n, ((Date.now() - t0) / (i - from + 1)).toFixed(0), 'ms/frame'); }
  }
  await b.close();
})();
