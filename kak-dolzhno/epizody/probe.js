const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const [ep, list, out, sub] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1920, height: 1080}});
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + path.resolve(__dirname, ep + '.html')); await p.waitForFunction(() => window.ready);
  for (const t of list.split(',').map(Number)){ const d = await p.evaluate(([t, s]) => window.renderTime(t, s), [t, +sub || 0]); fs.writeFileSync(path.join(out, `${ep}-t${t}.png`), Buffer.from(d.split(',')[1], 'base64')); }
  console.log('sub', await p.evaluate(l => l.map(t => subFor(t)), list.split(',').map(Number)));
  await b.close();
})();
