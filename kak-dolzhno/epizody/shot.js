// node shot.js page.html out.png — снимок тестовой страницы
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1920, height: 1080}}); p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => console.log('console', m.text()));
  await p.goto('file://' + path.resolve(__dirname, process.argv[2])); await p.waitForFunction(() => window.out, null, {timeout: 60000}); const d = await p.evaluate(() => window.out); fs.writeFileSync(process.argv[3], Buffer.from(d.split(',')[1], 'base64')); await b.close(); })();
