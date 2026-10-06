# Плеер под сценой: всегда на виду, ±15 секунд. Плюс «крышка» над сценой, чтобы над ней не просвечивал текст.
R('''  <div class="backbar" id="backbar" hidden>''', '''  <div class="dock" id="listen">
    <button type="button" class="dk-skip" id="listen-back" aria-label="Назад на 15 секунд">−15</button>
    <button type="button" class="dk-play" id="listen-btn" aria-label="Слушать статью"><span class="li-ic" aria-hidden="true">▶</span></button>
    <button type="button" class="dk-skip" id="listen-fwd" aria-label="Вперёд на 15 секунд">+15</button>
    <input type="range" id="listen-seek" min="0" max="1000" value="0" step="1" aria-label="Место в записи">
    <span class="dk-time" id="listen-time">22:29</span>
    <button type="button" class="dk-speed" id="listen-speed" aria-label="Скорость">1×</button>
    <audio id="listen-audio" preload="none" src="audio/gorizont-chast-1.mp3"></audio>
  </div>
  <div class="backbar" id="backbar" hidden>''')
R(".stage::after {", """.stage::before { content: ''; position: absolute; left: 0; right: 0; bottom: 100%; height: 400px; background: var(--ink); }
.dock { position: relative; display: flex; align-items: center; gap: 6px; height: 46px; padding: 0 10px; background: var(--ink-2); border-bottom: 1px solid var(--rule); }
.dock button { flex: none; display: grid; place-items: center; background: transparent; border: 0; color: var(--paper); cursor: pointer; font-family: var(--mono); }
.dk-play { width: 34px; height: 34px; border-radius: 50%; background: var(--accent) !important; color: var(--ink) !important; font-size: 12px; }
.dk-skip { min-width: 36px; height: 30px; font-size: 11.5px; letter-spacing: .02em; border: 1px solid var(--rule) !important; border-radius: 999px; padding: 0 6px; }
.dk-time { flex: none; font-family: var(--mono); font-size: 10.5px; color: var(--muted); font-variant-numeric: tabular-nums; }
.dk-speed { min-width: 38px; height: 28px; font-size: 11px; border: 1px solid var(--rule) !important; border-radius: 999px; }
.dock button:focus-visible, #listen-seek:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
#listen-seek { flex: 1; min-width: 40px; height: 18px; margin: 0 4px; background: transparent; -webkit-appearance: none; appearance: none; --p: 0%; }
#listen-seek::-webkit-slider-runnable-track { height: 4px; border-radius: 2px; background: linear-gradient(90deg, var(--accent) var(--p), var(--rule) var(--p)); }
#listen-seek::-moz-range-track { height: 4px; border-radius: 2px; background: linear-gradient(90deg, var(--accent) var(--p), var(--rule) var(--p)); }
#listen-seek::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--paper-hi); margin-top: -5px; border: 0; }
#listen-seek::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: var(--paper-hi); border: 0; }
.stage::after {""")
R(".col { max-width: var(--col); margin: 0 auto; padding-inline: 20px; padding-block: calc(var(--stage-h) + env(safe-area-inset-top, 0px) + 36px) 45vh; }",
  ".col { max-width: var(--col); margin: 0 auto; padding-inline: 20px; padding-block: calc(var(--stage-h) + 46px + env(safe-area-inset-top, 0px) + 36px) 45vh; }")
R("  const btn = document.getElementById('listen-btn'), ic = btn.querySelector('.li-ic'),",
  "  const jump = d => { const dd = au.duration || 1349; au.currentTime = Math.max(0, Math.min(dd - .5, au.currentTime + d)); show(); };\n  document.getElementById('listen-back').addEventListener('click', () => jump(-15)); document.getElementById('listen-fwd').addEventListener('click', () => jump(15));\n  const btn = document.getElementById('listen-btn'), ic = btn.querySelector('.li-ic'),")
R("au.addEventListener('play', () => { ic.textContent = '❚❚'; btn.setAttribute('aria-label', 'Пауза'); document.getElementById('listen').classList.add('on'); });",
  "au.addEventListener('play', () => { ic.textContent = '❚❚'; btn.setAttribute('aria-label', 'Пауза'); });")

# ---------- озвучка ⇄ текст ⇄ мультик ----------
R(".stage::after {", """.col .now-reading { color: var(--paper-hi); }
.col p, .col li, .col h2 { transition: color .5s; }
.col p.now-reading, .col li.now-reading { text-shadow: 0 0 .01px currentColor; }
.col p.now-reading::before { content: ''; position: absolute; left: -14px; top: .35em; bottom: .35em; width: 3px; border-radius: 2px; background: var(--accent); }
.col p { position: relative; }
.stage::after {""")
R("function saveSoon(){", """/* ---------- озвучка ведёт текст и Лену ---------- */
const PARA_T = {{TIMINGS}};
(() => {
  const au = document.getElementById('listen-audio'); if (!au) return;
  const els = [...document.querySelectorAll('#col h1, #col h2, #col p, #col li')].filter(e => !e.closest('.rest'));
  if (els.length !== PARA_T.length){ console.warn('озвучка: абзацев', els.length, 'отметок', PARA_T.length); return; }
  const unitOf = els.map(e => +e.closest('.cp').dataset.cp);
  const firstOfUnit = {}; els.forEach((e, k) => { if (firstOfUnit[unitOf[k]] === undefined) firstOfUnit[unitOf[k]] = k; });
  const paraAt = t => { let k = 0; while (k + 1 < PARA_T.length && PARA_T[k + 1] <= t + .05) k++; return k; };
  const readLine = () => document.getElementById('stage').getBoundingClientRect().bottom + 40;
  const visiblePara = () => { const y = readLine(); let best = 0; els.forEach((e, k) => { if (e.getBoundingClientRect().top <= y) best = k; }); return best; };
  let cur = -1, everPlayed = false, userScrollT = 0, autoScrolling = false, startedAt = -1;
  try { const s = JSON.parse(localStorage.getItem('gorizont-1-audio') || 'null'); if (s && s.t > 3) { au.addEventListener('loadedmetadata', () => { if (!everPlayed) au.currentTime = s.t; }, {once: true}); } } catch (e) {}
  // «играть»: если читатель ушёл по тексту в другое место — начинаем с того абзаца, который он сейчас видит
  document.getElementById('listen-btn').addEventListener('click', () => {
    if (!au.paused) return;
    const v = visiblePara(), here = paraAt(au.currentTime);
    if (Math.abs(v - here) > 1 || (!everPlayed && v > 1)) au.currentTime = PARA_T[v] + .01;
  }, true);
  window.addEventListener('scroll', () => { if (!autoScrolling) userScrollT = performance.now(); }, {passive: true});
  const follow = k => {
    if (performance.now() - userScrollT < 5000) return;          // читатель листает сам — не мешаем
    const r = els[k].getBoundingClientRect(), y = readLine();
    if (r.top < y - 10 || r.bottom > window.innerHeight - 60){ autoScrolling = true; window.scrollTo({top: window.scrollY + r.top - y - 6, behavior: 'smooth'}); setTimeout(() => autoScrolling = false, 900); }
  };
  // мультик идёт сам: закончился пункт в озвучке — Лена делает то, что после него
  const driveScene = k => {
    if (au.paused || au.seeking) return;
    if (!started){ started = true; document.getElementById('play').hidden = true; playPoint(0); }
    const u = unitOf[k]; let target = -1;
    for (let q = 0; q < u; q++) if (GO_OF[q] != null) target = Math.max(target, GO_OF[q]);
    if (target > sceneK || (target === sceneK && sceneF === 0 && !playing)) playPoint(target);
  };
  au.addEventListener('play', () => { everPlayed = true; startedAt = au.currentTime; userScrollT = 0; });
  au.addEventListener('timeupdate', () => {
    const k = paraAt(au.currentTime);
    if (k !== cur){ if (cur >= 0) els[cur].classList.remove('now-reading'); els[k].classList.add('now-reading'); cur = k; if (!au.paused) follow(k); }
    driveScene(k);
    try { localStorage.setItem('gorizont-1-audio', JSON.stringify({t: au.currentTime})); } catch (e) {}
  });
  au.addEventListener('ended', () => { const last = GO_OF[GO_OF.length - 1]; if (last != null && last > sceneK) playPoint(last); try { localStorage.removeItem('gorizont-1-audio'); } catch (e) {} });
  au.addEventListener('pause', () => { if (cur >= 0 && au.currentTime < 1) els[cur].classList.remove('now-reading'); });
})();
function saveSoon(){""")
