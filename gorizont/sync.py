# ---------- озвучка ⇄ текст ⇄ мультик: всё идёт синхронно по времени записи ----------
R("const speeds = [1, 1.25, 1.5, .85];", "const speeds = [1, 1.25, 1.5, 2, .85];")
R("let WS = [], WE = [], GAP = [], TM = [];", "let AUDIO_GAP = null;   // в режиме озвучки дорога между событиями длиннее — Лена идёт столько, сколько звучит пункт\nlet WS = [], WE = [], GAP = [], TM = [];")
R("    WS[i] = x + GAP[i];", "    if (AUDIO_GAP) GAP[i] = AUDIO_GAP[i];\n    WS[i] = x + GAP[i];")
R(".stage::after {", """.col .now-reading { color: var(--paper-hi); }
.col p, .col li, .col h2 { transition: color .5s; }
.col p { position: relative; }
.col p.now-reading::before { content: ''; position: absolute; left: -14px; top: .35em; bottom: .35em; width: 3px; border-radius: 2px; background: var(--accent); }
.col .w { border-radius: 3px; transition: background .25s, color .25s; }
.col .w.said { color: var(--paper-hi); }
.col .w.w-now { background: rgba(217,163,58,.30); color: var(--paper-hi); box-shadow: 0 0 0 2px rgba(217,163,58,.30); }
.tap-listen { cursor: pointer; -webkit-tap-highlight-color: transparent; border-radius: 6px; }
@media (hover: hover){ .col .w:hover { background: rgba(217,163,58,.14); } }
.tap-listen.tapped { animation: tapflash .9s ease-out; }
@keyframes tapflash { 0% { background: rgba(217,163,58,.22); } 100% { background: transparent; } }
@media (prefers-reduced-motion: reduce){ .tap-listen.tapped { animation: none; } .col .w { transition: none; } }
.stage::after {""")
R("function saveSoon(){", r"""/* ---------- озвучка ведёт текст, прокрутку и Лену ---------- */
const PARA_T = {{TIMINGS}};
const WORD_T = {{WORDTIMES}};
let audioMode = false;
(() => {
  const au = document.getElementById('listen-audio'); if (!au) return;
  const els = [...document.querySelectorAll('#col h1, #col h2, #col p, #col li')].filter(e => !e.closest('.rest'));
  if (els.length !== PARA_T.length){ console.warn('озвучка: абзацев', els.length, 'отметок', PARA_T.length); return; }
  // каждое слово — отдельный кусочек со своим временем
  const W_EL = [], W_T = [], W_P = [];
  els.forEach((e, k) => {
    const txt = e.textContent, times = WORD_T[k] || [], re = /[^\s\/—–-]+/g; let m, last = 0, n = 0, html = '';
    const esc = x => x.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const toks = []; while ((m = re.exec(txt))){ if (/[0-9A-Za-zА-Яа-яЁё]/.test(m[0])) toks.push(m); }
    if (toks.length !== times.length) return;
    toks.forEach((t, j) => { html += esc(txt.slice(last, t.index)) + '<span class="w">' + esc(t[0]) + '</span>'; last = t.index + t[0].length; });
    e.innerHTML = html + esc(txt.slice(last));
    [...e.querySelectorAll('.w')].forEach((sp, j) => { W_EL.push(sp); W_T.push(times[j]); W_P.push(k); });
  });
  const unitOf = els.map(e => +e.closest('.cp').dataset.cp);
  const US = []; els.forEach((e, k) => { if (US[unitOf[k]] === undefined) US[unitOf[k]] = PARA_T[k]; });
  const SPEECH_END = W_T.length ? W_T[W_T.length - 1] + 1.2 : 1335;
  const DUR = () => (au.duration && isFinite(au.duration)) ? au.duration : 1349.06;
  const idxAt = (arr, t) => { let lo = 0, hi = arr.length - 1, r = 0; while (lo <= hi){ const mid = (lo + hi) >> 1; if (arr[mid] <= t + .02){ r = mid; lo = mid + 1; } else hi = mid - 1; } return r; };

  // ---- мультик по времени: у каждой сцены свой отрезок записи; в конце отрезка — событие, до него — дорога ----
  let SEG = null;
  const natDur = s => 1 / (BASE_RATE * (PF[OLD[s]] || 1) / (LMUL[OLD[s]] || 1));
  const WALK_V = 88 / 1.3;
  function buildSegments(){
    SEG = []; const ends = [];
    ends[0] = US[0] + .2;                                         // сцена 0: пока звучит музыка — выходит и видит транспарант
    for (let u = 0; u < GO_OF.length; u++){ const sc = GO_OF[u]; if (sc == null) continue; ends[sc] = (u + 1 < US.length) ? US[u + 1] : SPEECH_END + 1.5; }
    let a = 0;
    for (let s = 0; s <= N; s++){ const b = ends[s] !== undefined ? ends[s] : a + 4; const D = s === 0 ? b - a : Math.min(natDur(s), (b - a) * .85);
      SEG[s] = {a, b, ev: b - D, D}; a = b; }
    AUDIO_GAP = SEG.map((g, s) => (s === 0 || !TM[s]) ? 0 : WALK_V * Math.abs(SPEED[TM[s]] || 1) * (g.ev - g.a));
  }
  function stateAt(t){
    let s = 0; while (s < N && t >= SEG[s].b) s++;
    const g = SEG[s];
    if (t < g.ev){ return {k: s, f: 0, tr: AUDIO_GAP[s] * (g.ev - t) / Math.max(.01, g.ev - g.a)}; }
    return {k: s, f: Math.min(1, (t - g.ev) / g.D), tr: 0};
  }
  function enterAudio(){
    if (audioMode) return;
    audioMode = true; buildSegments(); buildWorld(); buildAnchors();
    started = true; document.getElementById('play').hidden = true; playing = false; targetK = 0;
    const st = stateAt(au.currentTime); sceneK = st.k; sceneF = st.f; travel = st.tr; camX = worldAt(sceneK, sceneF) - travel; updateGo();
  }
  function leaveAudio(){
    if (!audioMode) return;
    audioMode = false; AUDIO_GAP = null; buildWorld(); buildAnchors(); travel = 0; camX = worldAt(sceneK, sceneF);
  }
  // кнопки «Дальше в путь»: во время озвучки — перейти к этому месту записи; без озвучки — как раньше
  const playPointOrig = playPoint;
  playPoint = function(k){
    if (audioMode && !au.paused){ const g = SEG[k]; if (g){ au.currentTime = Math.max(g.a, g.ev - 1.5); } return; }
    leaveAudio(); playPointOrig(k);
  };

  // ---- слушать с любого места ----
  const readTop = () => document.getElementById('stage').getBoundingClientRect().bottom;
  const visiblePara = () => { const y = readTop() + 40; let best = 0; els.forEach((e, k) => { if (e.getBoundingClientRect().top <= y) best = k; }); return best; };
  const paraAt = t => idxAt(PARA_T, t);
  let everPlayed = false, userT = -1e9, hinted = false;
  try { hinted = !!localStorage.getItem('gorizont-1-hint'); } catch (er) {}
  try { const sv = JSON.parse(localStorage.getItem('gorizont-1-audio') || 'null'); if (sv && sv.t > 3) au.addEventListener('loadedmetadata', () => { if (!everPlayed) au.currentTime = sv.t; }, {once: true}); } catch (e) {}
  document.getElementById('listen-btn').addEventListener('click', () => {
    if (!au.paused) return;
    const v = visiblePara(), here = paraAt(au.currentTime);
    if (Math.abs(v - here) > 1 || (!everPlayed && v > 1)) au.currentTime = PARA_T[v] + .01;
  }, true);
  ['touchstart', 'touchmove', 'wheel', 'keydown', 'mousedown'].forEach(ev => window.addEventListener(ev, e => { if (!e.target.closest || !e.target.closest('.dock, .tap-listen')) userT = performance.now(); }, {passive: true}));
  // нажали на слово или абзац — звучит с этого места
  els.forEach((e, k) => { e.classList.add('tap-listen'); e.addEventListener('click', ev => {
    if (ev.target.closest('button, a, input')) return;
    const sel = window.getSelection && window.getSelection(); if (sel && String(sel).length > 0) return;
    const w = ev.target.closest('.w'), wi = w ? W_EL.indexOf(w) : -1;
    au.currentTime = (wi >= 0 ? W_T[wi] - .15 : PARA_T[k]) + .01; everPlayed = true; userT = -1e9;
    e.classList.remove('tapped'); void e.offsetWidth; e.classList.add('tapped');
    if (au.paused) au.play().catch(() => {});
    if (!hinted){ hinted = true; try { localStorage.setItem('gorizont-1-hint', '1'); } catch (er) {} }
  }); });
  au.addEventListener('play', () => { everPlayed = true; userT = -1e9; enterAudio();
    if (!hinted){ hinted = true; try { localStorage.setItem('gorizont-1-hint', '1'); } catch (er) {} setTimeout(() => toast('Нажмите на любое слово — озвучка начнётся с него'), 900); } });
  au.addEventListener('seeking', () => { if (audioMode){ const st = stateAt(au.currentTime); if (st.k !== sceneK) camX = worldAt(st.k, st.f) - st.tr; } });
  au.addEventListener('ended', () => { try { localStorage.removeItem('gorizont-1-audio'); } catch (e) {} });

  // ---- каждый кадр: Лена, подсветка слова и прокрутка следуют за временем записи ----
  let curW = -1, curP = -1, saveT = 0;
  function tick(now){
    requestAnimationFrame(tick);
    if (!everPlayed) return;
    const t = au.currentTime;
    if (audioMode){ const st = stateAt(t); sceneK = st.k; sceneF = st.f; travel = st.tr; lastCp = sceneK; }
    // слово
    const wi = W_T.length ? idxAt(W_T, t) : -1;
    if (wi !== curW && wi >= 0){
      if (curW >= 0) W_EL[curW].classList.remove('w-now');
      if (wi > curW && curW >= 0 && wi - curW < 40) for (let q = curW; q < wi; q++) W_EL[q].classList.add('said');
      else W_EL.forEach((el, q) => el.classList.toggle('said', q < wi));
      if (t >= W_T[0] - .3) W_EL[wi].classList.add('w-now');
      curW = wi;
    }
    const pk = paraAt(t);
    if (pk !== curP){ if (curP >= 0) els[curP].classList.remove('now-reading'); els[pk].classList.add('now-reading'); curP = pk; }
    // прокрутка: читаемое слово держим чуть выше середины видимого текста
    if (!au.paused && performance.now() - userT > 4000 && wi >= 0){
      const r = W_EL[wi].getBoundingClientRect(), top = readTop(), target = top + (window.innerHeight - top) * .38;
      const dy = r.top - target;
      if (Math.abs(dy) > 2){ const step = Math.abs(dy) > window.innerHeight ? dy : dy * .06; window.scrollTo(0, window.scrollY + step); }
    }
    if (now - saveT > 2000){ saveT = now; try { localStorage.setItem('gorizont-1-audio', JSON.stringify({t})); } catch (e) {} }
  }
  requestAnimationFrame(tick);
})();
function saveSoon(){""")
