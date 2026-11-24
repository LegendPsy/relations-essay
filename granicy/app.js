/* Живой сайт «Чьи это границы?».
   Характер: человек с ясными границами. Тёплый, замечает читателя, отвечает на касания,
   но никогда не вешает табличек для него. Если ему чего-то слишком — он сам отходит на шаг.
   Всё необязательно: статья читается и без касаний. */
(() => {
'use strict';
const D = document, R = D.documentElement, W = window;
R.classList.add('js');
const RM = W.matchMedia('(prefers-reduced-motion: reduce)').matches;
const darkMQ = W.matchMedia('(prefers-color-scheme: dark)');
const $ = (s, r = D) => r.querySelector(s);
const $$ = (s, r = D) => Array.from(r.querySelectorAll(s));
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const rand = (a, b) => a + Math.random() * (b - a);
const now = () => performance.now();
const pad2 = n => String(n).padStart(2, '0');
const hms = d => `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
const dmy = d => `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
const isDark = () => R.dataset.theme === 'dark' || (R.dataset.theme !== 'light' && darkMQ.matches);
const NS = 'http://www.w3.org/2000/svg';

/* ---------- память: только в этом браузере ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem('granicy.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('granicy.' + k, JSON.stringify(v)); } catch (e) {} }
};

/* ---------- лёгкая вибрация там, где телефон умеет ---------- */
let hapLabel = null;
function haptic(p = 10) {
  try {
    if (navigator.vibrate) { navigator.vibrate(p); return; }
    if (!hapLabel) { // iPhone: переключатель даёт короткий «тик»
      const box = D.createElement('div');
      box.setAttribute('aria-hidden', 'true');
      box.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;';
      box.innerHTML = '<input type="checkbox" switch id="hap-sw" tabindex="-1"><label for="hap-sw"></label>';
      D.body.append(box);
      const inp = box.querySelector('input');
      inp.addEventListener('focus', () => inp.blur());
      hapLabel = box.querySelector('label');
    }
    hapLabel.click();
  } catch (e) {}
}

/* ---------- шина событий и один общий кадр ---------- */
const bus = { h: {}, on(n, f) { (this.h[n] || (this.h[n] = [])).push(f); }, emit(n, a) { (this.h[n] || []).forEach(f => { try { f(a); } catch (e) { console.error(e); } }); } };
const tasks = new Set();
let raf = 0, lastT = 0;
function frame(t) {
  const dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 1 / 60;
  lastT = t;
  for (const f of Array.from(tasks)) {
    try { if (f(dt, t) === false) tasks.delete(f); } catch (e) { tasks.delete(f); console.error(e); }
  }
  if (tasks.size && !D.hidden) raf = requestAnimationFrame(frame); else { raf = 0; lastT = 0; }
}
function run(f) { tasks.add(f); if (!raf && !D.hidden) raf = requestAnimationFrame(frame); }
D.addEventListener('visibilitychange', () => { if (!D.hidden && tasks.size && !raf) { lastT = 0; raf = requestAnimationFrame(frame); } });
function onView(el, fn, opts = {}) {
  if (!('IntersectionObserver' in W)) { fn(true); return; }
  const io = new IntersectionObserver(es => es.forEach(e => fn(e.isIntersecting, e)), { rootMargin: opts.margin || '60px 0px', threshold: opts.threshold || 0 });
  io.observe(el);
  return io;
}
function tap(el, fn, delay = 110) { // касание, которое не путается с прокруткой
  let tm = 0, pid = null, x0 = 0, y0 = 0, fired = false;
  el.addEventListener('pointerdown', e => {
    if (e.button > 0) return;
    pid = e.pointerId; x0 = e.clientX; y0 = e.clientY; fired = false;
    if (e.pointerType === 'mouse') { fired = true; fn(e, true); return; }
    clearTimeout(tm);
    tm = setTimeout(() => { if (pid !== null && !fired) { fired = true; fn(e, true); } }, delay);
  });
  el.addEventListener('pointermove', e => { if (e.pointerId === pid && !fired && Math.hypot(e.clientX - x0, e.clientY - y0) > 12) { clearTimeout(tm); pid = null; } });
  el.addEventListener('pointerup', e => { if (e.pointerId !== pid) return; clearTimeout(tm); if (!fired) { fired = true; fn(e, false); } pid = null; });
  el.addEventListener('pointercancel', e => { if (e.pointerId === pid) { clearTimeout(tm); pid = null; } });
  el.addEventListener('contextmenu', e => e.preventDefault());
}
function say(el, text) { // реплика сайта: мягко гаснет и появляется заново
  if (!el || el.textContent === text) return;
  if (RM) { el.textContent = text; return; }
  el.style.opacity = '0';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.textContent = text; el.style.opacity = '1'; }, 200);
}

/* ---------- прокрутка ---------- */
const scroll = { y: W.scrollY, v: 0, lastY: W.scrollY, lastT: now() };
let scrollQueued = false;
W.addEventListener('scroll', () => {
  const t = now(), y = W.scrollY, dt = Math.max(1, t - scroll.lastT);
  scroll.v = scroll.v * 0.5 + ((y - scroll.lastY) / dt * 1000) * 0.5;
  bus.emit('scroll', { dy: y - scroll.lastY, t });
  scroll.lastY = y; scroll.lastT = t; scroll.y = y;
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(() => { scrollQueued = false; updateZone(); bus.emit('frame-scroll'); }); }
}, { passive: true });
W.addEventListener('resize', () => { bus.emit('resize'); updateZone(); bus.emit('frame-scroll'); });

/* ---------- настроение страницы по разделам ---------- */
const zMarks = $$('[data-z]');
let zone = '';
const ZB = { // период дыхания (с) и его сила
  intro: [8, 1], bill: [8, 1], smoke: [8.5, .9], kitchen: [7.5, 1], duty: [8, .85], quiet: [15, .14],
  watch: [4.2, 1], lamps: [8, 1], rose: [8, 1], dissolve: [7, 1], stream: [6.5, 1], dawn: [10, 1], clear: [8, 1], end: [13, .7]
};
const metaTheme = $$('meta[name="theme-color"]');
function updateZone() {
  const line = W.innerHeight * 0.42;
  let z = zMarks.length ? zMarks[0].dataset.z : 'intro';
  for (const el of zMarks) { if (el.getBoundingClientRect().top <= line) z = el.dataset.z; else break; }
  if (z !== zone) {
    const prev = zone; zone = z; R.dataset.zone = z;
    applyBreath();
    bus.emit('zone', { z, prev });
    requestAnimationFrame(() => {
      const bg = getComputedStyle(R).getPropertyValue('--bg').trim();
      if (bg) metaTheme.forEach(m => m.setAttribute('content', bg));
    });
  }
}

/* ---------- дыхание: свет вокруг текста ---------- */
const breathBox = $('#breath'), breathCore = $('#breath .core');
const breathAnims = [];
if (!RM && breathCore && breathCore.animate) {
  breathAnims.push(breathCore.animate([{ opacity: .32, transform: 'scale(1)' }, { opacity: 1, transform: 'scale(1.07)' }],
    { duration: 4000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }));
}
let idle = false;
function applyBreath() {
  const [p0, a0] = ZB[zone] || [8, 1];
  const p = idle ? p0 * 1.8 : p0, a = idle ? a0 * .55 : a0;
  breathAnims.forEach(an => { try { an.updatePlaybackRate ? an.updatePlaybackRate(8 / p) : (an.playbackRate = 8 / p); } catch (e) {} });
  if (breathBox) breathBox.style.opacity = String(a);
}

/* ---------- палец и тёплый след ---------- */
const finger = { x: -1e4, y: -1e4, live: false };
const trace = makeTrace();
function makeTrace() {
  const c = $('#trace');
  const api = { down() {}, move() {}, up() {}, hover() {}, out() {}, burn() {}, enabled: true, drift: 0 };
  if (!c || RM || !c.getContext) return api;
  const x = c.getContext('2d');
  let w = 0, h = 0, s = .5;
  const size = () => { s = Math.min(2, W.devicePixelRatio || 1) * .5; w = W.innerWidth; h = W.innerHeight; c.width = Math.ceil(w * s); c.height = Math.ceil(h * s); };
  size(); W.addEventListener('resize', size);
  const sprites = {};
  const sprite = rgb => {
    const k = rgb.join(',');
    if (sprites[k]) return sprites[k];
    const o = D.createElement('canvas'); o.width = o.height = 128;
    const g = o.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, `rgba(${k},1)`); gr.addColorStop(.38, `rgba(${k},.5)`); gr.addColorStop(1, `rgba(${k},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    return (sprites[k] = o);
  };
  const spots = [], held = {};
  let hov = null;
  function add(x0, y0, o = {}) {
    const sp = { x: x0, y: y0, heat: o.heat || 0, held: !!o.held, life: o.life || 1.6, max: o.life || 1.6, rgb: o.rgb || null, r: o.r || 64, k: o.k || 1, t0: now() };
    spots.push(sp); if (spots.length > 90) spots.shift();
    run(tick);
    return sp;
  }
  const release = (sp, life) => { sp.held = false; sp.life = sp.max = life; };
  api.down = (id, x0, y0) => { if (api.enabled) held[id] = add(x0, y0, { held: true }); };
  api.move = (id, x0, y0) => {
    const sp = held[id];
    if (!sp || !api.enabled) return;
    if (Math.hypot(x0 - sp.x, y0 - sp.y) > 22) { release(sp, .9); held[id] = add(x0, y0, { held: true, heat: .5 }); }
  };
  api.up = id => { const sp = held[id]; if (sp) { release(sp, 2.2 + Math.min(1.8, (now() - sp.t0) / 1000 * .6)); delete held[id]; } };
  api.hover = (x0, y0) => {
    if (!api.enabled) return;
    if (!hov || hov.life <= 0 || !spots.includes(hov)) hov = add(x0, y0, { held: true, k: .42, r: 52 });
    hov.x = x0; hov.y = y0; hov.held = true;
    clearTimeout(hov.tm); hov.tm = setTimeout(() => hov && release(hov, 1.1), 900);
  };
  api.out = () => { if (hov) release(hov, .7); };
  api.burn = (x0, y0) => add(x0, y0, { heat: 1, life: 1.1, rgb: [255, 70, 40], r: 70, k: 1.3 });
  function tick(dt) {
    x.clearRect(0, 0, c.width, c.height);
    if (!spots.length) return false;
    const night = isDark() || zone === 'watch';
    x.globalCompositeOperation = night ? 'lighter' : 'source-over';
    const base = night ? .34 : .3, warm = zone === 'watch' ? [255, 200, 130] : [255, 158, 82];
    const dr = api.drift, tt = now() / 1000;
    for (let i = spots.length - 1; i >= 0; i--) {
      const sp = spots[i];
      sp.heat = Math.min(1, sp.heat + dt * 4); // тепло появляется не сразу
      if (!sp.held) { sp.life -= dt; if (sp.life <= 0) { spots.splice(i, 1); continue; } }
      if (dr) { sp.x += dr * dt; sp.y += Math.sin(tt * 1.3 + i) * 10 * dt * (dr / 70); }
      const fade = sp.held ? 1 : Math.pow(sp.life / sp.max, .8);
      const a = base * sp.k * sp.heat * fade;
      if (a < .004) continue;
      const r = sp.r * (.7 + .5 * sp.heat);
      x.globalAlpha = Math.min(1, a);
      x.drawImage(sprite(sp.rgb || warm), (sp.x - r) * s, (sp.y - r) * s, 2 * r * s, 2 * r * s);
    }
    x.globalAlpha = 1;
  }
  return api;
}
let mouseDown = false;
const tapStart = {};
W.addEventListener('touchstart', e => { for (const t of e.changedTouches) { trace.down('t' + t.identifier, t.clientX, t.clientY); finger.x = t.clientX; finger.y = t.clientY; tapStart[t.identifier] = { x: t.clientX, y: t.clientY, t: now(), y0: W.scrollY }; } finger.live = true; bus.emit('touch'); poke(); }, { passive: true });
W.addEventListener('touchmove', e => { for (const t of e.changedTouches) { trace.move('t' + t.identifier, t.clientX, t.clientY); finger.x = t.clientX; finger.y = t.clientY; } finger.live = true; bus.emit('finger'); }, { passive: true });
const touchEnd = e => {
  for (const t of e.changedTouches) {
    trace.up('t' + t.identifier);
    const s0 = tapStart[t.identifier]; delete tapStart[t.identifier];
    if (s0 && e.type === 'touchend' && Math.hypot(t.clientX - s0.x, t.clientY - s0.y) < 10 && Math.abs(W.scrollY - s0.y0) < 4 && now() - s0.t < 600) bus.emit('tapped');
  }
  if (!e.touches.length) { finger.live = false; bus.emit('finger'); }
};
W.addEventListener('touchend', touchEnd, { passive: true });
W.addEventListener('touchcancel', touchEnd, { passive: true });
W.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; mouseDown = true; trace.down('m', e.clientX, e.clientY); bus.emit('touch'); bus.emit('tapped'); poke(); }, { passive: true });
W.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  finger.x = e.clientX; finger.y = e.clientY; finger.live = true;
  if (mouseDown) trace.move('m', e.clientX, e.clientY); else trace.hover(e.clientX, e.clientY);
  bus.emit('finger');
}, { passive: true });
W.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') return; mouseDown = false; trace.up('m'); }, { passive: true });
D.addEventListener('mouseleave', () => { finger.live = false; trace.out(); bus.emit('finger'); });

/* ---------- если долго ничего не трогать, сайт задрёмывает ---------- */
let lastInput = now();
function poke() { lastInput = now(); if (idle) { idle = false; applyBreath(); } }
['scroll', 'keydown', 'wheel'].forEach(ev => W.addEventListener(ev, poke, { passive: true }));
setInterval(() => { if (!idle && now() - lastInput > 40000) { idle = true; applyBreath(); } }, 4000);

/* ---------- первый экран: буквы с личным пространством ---------- */
(function title() {
  const h = $('.hero h1');
  if (!h) return;
  const chars = $$('.ch', h);
  chars.forEach((el, i) => el.style.setProperty('--i', i));
  if (RM || !chars.length) return;
  const st = chars.map(el => ({ el, x: 0, y: 0, vx: 0, vy: 0, cx: 0, cy: 0, m: 1 }));
  let vis = true, ready = false;
  function measure() {
    const sy = W.scrollY;
    for (const s of st) {
      const b = s.el.getBoundingClientRect();
      s.cx = b.left + b.width / 2 - s.x; s.cy = b.top + b.height / 2 + sy - s.y;
      s.m = clamp(b.width / 26, .65, 1.6);
    }
    ready = true;
  }
  (D.fonts && D.fonts.ready ? D.fonts.ready : Promise.resolve()).then(() => setTimeout(measure, 1700));
  bus.on('resize', () => setTimeout(measure, 100));
  onView(h, v => { vis = v; if (v) run(tick); }, { margin: '40px 0px' });
  bus.on('finger', () => { if (vis && ready) run(tick); });
  bus.on('touch', () => { if (vis && ready) run(tick); });
  function tick(dt) {
    if (!ready) return;
    const live = finger.live, fx = finger.x, fy = finger.y, sy = W.scrollY;
    let moving = false;
    const damp = Math.pow(.004, dt);
    for (const s of st) {
      const px = s.cx + s.x, py = s.cy - sy + s.y;
      let ax = -s.x * 70, ay = -s.y * 70; // пружина домой
      if (live) {
        const dx = fx - px, dy = fy - py, d = Math.hypot(dx, dy) || 1;
        if (d < 210) { const att = (1 - d / 210) * 130; ax += dx / d * att; ay += dy / d * att; } // интерес: тянутся
        if (d < 68) { const q = (68 - d) / 68, f = q * q * 3400; ax -= dx / d * f; ay -= dy / d * f; } // дистанция: расступаются
      }
      s.vx = (s.vx + ax / s.m * dt) * damp;
      s.vy = (s.vy + ay / s.m * dt) * damp;
      s.x = clamp(s.x + s.vx * dt, -17, 17); s.y = clamp(s.y + s.vy * dt, -15, 15);
      if (Math.abs(s.x) > .05 || Math.abs(s.y) > .05 || Math.abs(s.vx) > .4 || Math.abs(s.vy) > .4) moving = true;
      s.el.style.transform = `translate(${s.x.toFixed(2)}px,${s.y.toFixed(2)}px) rotate(${(s.x * .55).toFixed(2)}deg)`;
    }
    if (!moving && !live) return false;
    if (!vis) return false;
  }
})();

/* ---------- заголовки разделов входят крупно ---------- */
$$('.part-h').forEach(hd => {
  if (RM) { hd.classList.add('seen'); return; }
  onView(hd, v => { if (v) hd.classList.add('seen'); }, { margin: '0px 0px -10% 0px' });
});

/* ---------- «Обозначил. Проговорил. Объяснил.» ложатся как штампы ---------- */
(function triad() {
  const p = $('.triad');
  if (!p) return;
  const ws = $$('.tw', p);
  if (RM) { ws.forEach(w => w.classList.add('on')); return; }
  let shown = 0;
  const check = () => {
    if (shown >= ws.length) return;
    const k = Math.floor((W.innerHeight * .88 - p.getBoundingClientRect().top) / 44) + 1;
    while (shown < Math.min(ws.length, k)) ws[shown++].classList.add('on');
  };
  bus.on('frame-scroll', check);
  setTimeout(check, 50);
})();

/* ---------- для внимательных: слова в тексте тоже отвечают ---------- */
(function textReflex() {
  const hot = $('.ph-hot'), knee = $('.ph-knee');
  if (hot) hot.addEventListener('click', e => { // «раскалённого чайника» — обжигает
    haptic([12, 30, 6]); trace.burn(e.clientX, e.clientY);
    if (!RM && hot.animate) hot.animate([{ transform: 'none' }, { transform: 'translate(-5px,-3px) rotate(-2deg)', offset: .14 }, { transform: 'translate(1px,0)', offset: .5 }, { transform: 'none' }], { duration: 420, easing: 'ease-out' });
  });
  if (knee) knee.addEventListener('click', () => { // «молоточком по колену» — дёргается
    haptic(8);
    if (!RM && knee.animate) knee.animate([{ transform: 'none' }, { transform: 'translateY(-6px) rotate(-3deg)', offset: .2 }, { transform: 'translateY(1px)', offset: .55 }, { transform: 'none' }], { duration: 520, easing: 'ease-out' });
  });
})();

/* ---------- печать (вступление) и печать «Граница — это я» (финал) ---------- */
function stampScene(fig, mine) {
  const sheet = $('[data-sheet]', fig), prints = $('.prints', fig), st = $('.stamp', fig), cap = $('[data-cap]', fig);
  const SW = mine ? 150 : 112, SH = mine ? 138 : 106; // печать: ширина резинки и высота
  const PW = SW / 2, PH = mine ? 32.5 : 22;            // половина оттиска: он целиком ложится на лист
  const E = { out: t => 1 - Math.pow(1 - t, 3), in: t => t * t * t, io: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) };
  let S = { x: 0, y: 0, lift: 0, sq: 0, rot: 0 }, seq = [], count = 0, held = false, did = false;
  const rest = () => ({ x: sheet.clientWidth - SW / 2 - 10, y: sheet.clientHeight - 10, lift: 0, sq: 0, rot: mine ? 0 : -4 });
  const apply = () => { // S.y — линия, где резинка касается листа
    st.style.transform = `translate(${(S.x - SW / 2).toFixed(1)}px,${(S.y - SH - S.lift).toFixed(1)}px) rotate(${S.rot.toFixed(2)}deg) scale(${(1 + .05 * S.sq).toFixed(3)},${(1 - .1 * S.sq).toFixed(3)})`;
    st.style.setProperty('--lift', S.lift.toFixed(1));
  };
  S = rest(); apply();
  bus.on('resize', () => { if (!seq.length) { S = rest(); apply(); } });
  (D.fonts && D.fonts.ready ? D.fonts.ready : Promise.resolve()).then(() => { if (!seq.length) { S = rest(); apply(); } });
  function go(steps) { seq = steps.map(s => Object.assign({ t: 0 }, s)); if (seq[0]) seq[0].from = Object.assign({}, S); run(tick); }
  function tick(dt) {
    const s = seq[0];
    if (!s) return false;
    if (s.until) { if (!s.until()) return; seq.shift(); if (seq[0]) seq[0].from = Object.assign({}, S); return; }
    if (s.wait) { s.t += dt; if (s.t < s.wait) return; seq.shift(); if (seq[0]) seq[0].from = Object.assign({}, S); return; }
    s.t += dt;
    const k = (s.ease || E.out)(clamp(s.t / s.dur, 0, 1));
    for (const key in s.to) S[key] = lerp(s.from[key], s.to[key], k);
    apply();
    if (s.t >= s.dur) { seq.shift(); if (s.end) s.end(); if (seq[0]) seq[0].from = Object.assign({}, S); }
  }
  tap(sheet, (e, down) => {
    const r = sheet.getBoundingClientRect();
    const px = clamp(e.clientX - r.left, PW + 6, r.width - PW - 6), py = clamp(e.clientY - r.top, PH + 6, r.height - PH - 6);
    held = down;
    if (mine && did) { nod(); return; }
    strike(px, py);
  });
  const up = () => { held = false; };
  W.addEventListener('pointerup', up); W.addEventListener('pointercancel', up);
  sheet.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); held = false; if (mine && did) nod(); else strike(sheet.clientWidth / 2 - 30 + rand(-40, 40), sheet.clientHeight / 2 + rand(-20, 20)); } });
  function strike(px, py) {
    const ty = py + PH; // резинка встаёт ровно на место будущего оттиска
    if (RM) { S = { x: px, y: ty, lift: 0, sq: 0, rot: 0 }; apply(); contact(px, py); go([{ wait: .5 }, { dur: .01, to: rest() }]); return; }
    const dist = Math.hypot(px - S.x, ty - S.y);
    go([
      { dur: .1 + Math.min(.22, dist / 2600), to: { x: px, y: ty, lift: 46, rot: 0, sq: 0 }, ease: E.out },
      { dur: .08, to: { lift: 62 }, ease: E.out },                                   // замах
      { dur: .075, to: { lift: 0 }, ease: E.in, end: () => contact(px, py) },          // удар
      { dur: .06, to: { sq: mine ? 1.4 : 1 }, ease: E.out },                          // резина сплющивается
      { until: () => !held },                                                         // держите — печать прижата
      { dur: .16, to: { sq: 0, lift: 40 }, ease: E.out },
      { wait: .75 },
      { dur: .45, to: rest(), ease: E.io }
    ]);
  }
  function nod() {
    const r = rest();
    go([{ dur: .12, to: { lift: 12, rot: r.rot - 3 }, ease: E.out }, { dur: .26, to: { lift: 0, rot: r.rot }, ease: E.io }]);
    cap.animate && cap.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 500 });
  }
  function contact(px, py) {
    haptic(mine ? 22 : 12);
    const el = mine ? minePrint() : printSVG(count);
    el.style.left = px + 'px'; el.style.top = py + 'px';
    prints.append(el);
    if (el.animate) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 90, easing: 'ease-out' });
    if (mine) {
      did = true;
      say(cap, 'Одного раза достаточно.');
      if (!RM && sheet.animate) sheet.animate([{ transform: 'none' }, { transform: 'translateY(2px)' }, { transform: 'none' }], { duration: 170 });
      return;
    }
    count++;
    const all = $$('.print', prints);
    if (all.length > 9) all[0].remove();
    say(cap, count === 1 ? 'Ещё раз.' : count < 4 ? 'И ещё.' : count < 7 ? 'Ещё…' : 'Чем чаще — тем бледнее.');
  }
  function printSVG(L) {
    const lv = Math.min(L, 7), n = 7;
    const op = [.95, .85, .74, .62, .5, .38, .27, .19][lv] * (L > 7 ? .75 : 1);
    const rot = Array.from({ length: n }, (_, i) => (lv ? rand(-1, 1) * lv * 2.4 + (i - 3) * lv * .5 : rand(-.6, .6)).toFixed(1)).join(' ');
    const dy = Array.from({ length: n }, (_, i) => (i ? rand(-.3, 1) * lv * .9 : 0).toFixed(1)).join(' ');
    const sk = (lv * 2.2 * (Math.random() < .5 ? -1 : 1)).toFixed(1), sc = (1 - lv * .045).toFixed(3);
    const svg = D.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'print'); svg.setAttribute('viewBox', '0 0 180 70'); svg.setAttribute('aria-hidden', 'true');
    svg.style.transform = `rotate(${(rand(-3, 3) - lv * .6).toFixed(1)}deg)`;
    svg.innerHTML = `<g filter="url(#ink${lv})" opacity="${op}"><rect x="6" y="6" width="168" height="58" rx="5" fill="none" stroke="currentColor" stroke-width="${(4 - lv * .3).toFixed(2)}"/>` +
      `<g transform="translate(90 47) scale(1 ${sc}) skewX(${sk}) translate(-90 -47)"><text x="90" y="47" text-anchor="middle" font-family="Golos Text, Segoe UI, sans-serif" font-weight="800" font-size="${(33 - lv * .5).toFixed(1)}" letter-spacing="${(2.5 + lv * .9).toFixed(1)}" rotate="${rot}" dy="${dy}" fill="currentColor">ГРАНИЦЫ</text></g></g>`;
    return svg;
  }
  function minePrint() {
    const svg = D.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'print mine'); svg.setAttribute('viewBox', '0 0 230 100'); svg.setAttribute('aria-hidden', 'true');
    svg.style.transform = `rotate(${rand(-2.5, 1.5).toFixed(1)}deg)`;
    svg.innerHTML = '<g filter="url(#inkMine)"><rect x="4" y="4" width="222" height="92" rx="9" fill="none" stroke="currentColor" stroke-width="4.5"/><rect x="12" y="12" width="206" height="76" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
      '<text x="115" y="47" text-anchor="middle" font-family="Golos Text, Segoe UI, sans-serif" font-weight="800" font-size="27" letter-spacing="3" fill="currentColor">ГРАНИЦА —</text>' +
      '<text x="115" y="80" text-anchor="middle" font-family="Golos Text, Segoe UI, sans-serif" font-weight="800" font-size="31" letter-spacing="5" fill="currentColor">ЭТО Я</text></g>';
    return svg;
  }
  sheet.tabIndex = 0;
  sheet.setAttribute('role', 'button');
  sheet.setAttribute('aria-label', mine ? 'Поставить печать «Граница — это я»' : 'Поставить печать «Границы»');
}

/* ---------- облачко с объяснениями мамы рассыпается ---------- */
function bubbleScene(fig) {
  const bub = $('[data-bubble]', fig), shell = $('.bub-shell', bub), txt = $('.bub-text', bub);
  const text = txt.textContent;
  txt.textContent = '';
  const ls = [];
  for (const word of text.split(' ')) {
    const w = D.createElement('span'); w.className = 'bw';
    for (const ch of word) { const s = D.createElement('span'); s.className = 'bl'; s.textContent = ch; w.append(s); ls.push(s); }
    txt.append(w, ' ');
  }
  let busy = false, played = false;
  async function play() {
    if (busy || RM || !bub.animate) return;
    busy = true;
    for (let i = 0; i < 2; i++) {
      await bub.animate([{ transform: 'none' }, { transform: 'translateY(-12px) scale(.97,1.04)', offset: .45 }, { transform: 'translateY(0) scale(1.05,.93)', offset: .8 }, { transform: 'none' }],
        { duration: 380 + i * 70, easing: 'ease-out' }).finished;
    }
    shell.getAnimations().forEach(a => a.cancel());
    shell.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.6)' }], { duration: 360, fill: 'forwards', easing: 'ease-in' });
    const anims = ls.map(s => {
      const dx = rand(-120, 120), upY = rand(40, 130), r = rand(-280, 280);
      return s.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${dx * .55}px,${-upY}px) rotate(${r * .5}deg)`, opacity: 1, offset: .35 },
        { transform: `translate(${dx}px,${-upY + rand(130, 210)}px) rotate(${r}deg)`, opacity: 0 }],
        { duration: rand(1300, 1900), easing: 'cubic-bezier(.25,.6,.4,1)', fill: 'forwards' });
    });
    await Promise.all(anims.map(a => a.finished));
    await new Promise(res => setTimeout(res, 700));
    shell.getAnimations().forEach(a => a.cancel());
    shell.animate([{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 500, easing: 'ease-out' });
    ls.forEach((s, i) => { s.getAnimations().forEach(a => a.cancel()); s.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: i * 10, fill: 'backwards' }); });
    setTimeout(() => { busy = false; }, 1000);
  }
  bub.addEventListener('click', play);
  onView(fig, v => { if (v && !played) { played = true; setTimeout(play, 450); } }, { margin: '0px 0px -25% 0px', threshold: .6 });
}

/* ---------- табличка на одном гвозде ---------- */
function nailScene(fig) {
  const sign = $('[data-sign]', fig), nail = $('[data-nail]', fig), crumbs = $('.crumbs', fig), wall = $('.wall', fig);
  let th = 0, om = 0, loose = 0, lastLoose = 0, vis = false, grab = null, lastV = 0;
  onView(fig, v => { vis = v; if (v) run(tick); });
  bus.on('scroll', () => { if (vis) run(tick); });
  function crumb() {
    if (RM || !crumbs.animate) return;
    const nr = nail.getBoundingClientRect(), wr = wall.getBoundingClientRect();
    for (let i = 0; i < 3; i++) {
      const c = D.createElement('i');
      c.style.left = (nr.left - wr.left + nr.width / 2 + rand(-4, 4)) + 'px'; c.style.top = (nr.top - wr.top + nr.height) + 'px';
      crumbs.append(c);
      c.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${rand(-14, 14)}px,${rand(70, 140)}px) rotate(${rand(-200, 200)}deg)`, opacity: 0 }],
        { duration: rand(600, 900), easing: 'cubic-bezier(.4,0,1,1)' }).finished.then(() => c.remove());
    }
  }
  function tick(dt) {
    const sv = now() - scroll.lastT < 140 ? scroll.v : 0;
    const acc = (sv - lastV) / Math.max(dt, 1e-3); lastV = sv;
    let tau = -10 * Math.sin(th) - 1.15 * om + clamp(acc * .00009, -5, 5);
    if (grab) tau += (grab.target - th) * 46 - om * 6;
    om += tau * dt; th = clamp(th + om * dt, -1.05, 1.05);
    if (Math.abs(om) > 1.4) loose = Math.min(1, loose + (Math.abs(om) - 1.4) * dt * .25);
    loose = Math.max(0, loose - dt * .012);
    if (loose - lastLoose > .05) { crumb(); lastLoose = loose; } else if (loose < lastLoose - .1) lastLoose = loose;
    sign.style.transform = `translate(${(loose * 1.5).toFixed(2)}px,${(loose * 3.5).toFixed(2)}px) rotate(${(th * 57.3).toFixed(2)}deg)`;
    nail.style.transform = `translateY(${(loose * 3.5).toFixed(2)}px) rotate(${(loose * 18).toFixed(1)}deg)`;
    if (!grab && Math.abs(om) < .01 && Math.abs(th) < .002 && now() - scroll.lastT > 300) return false;
    if (!vis) return false;
  }
  sign.addEventListener('pointerdown', e => {
    const r = sign.getBoundingClientRect();
    grab = { x0: e.clientX, th0: th, target: th, cx: r.left + r.width / 2, moved: false, id: e.pointerId };
    try { sign.setPointerCapture(e.pointerId); } catch (_) {}
    haptic(5); run(tick);
  });
  sign.addEventListener('pointermove', e => { if (!grab || e.pointerId !== grab.id) return; const dx = e.clientX - grab.x0; if (Math.abs(dx) > 4) grab.moved = true; grab.target = clamp(grab.th0 + dx / 170, -.9, .9); });
  const drop = e => {
    if (!grab || (e && e.pointerId !== grab.id)) return;
    if (!grab.moved) om += clamp((grab.x0 - grab.cx) / 60, -1, 1) * 3.2 + (Math.random() < .5 ? -.8 : .8);
    grab = null; run(tick);
  };
  sign.addEventListener('pointerup', drop); sign.addEventListener('pointercancel', drop); sign.addEventListener('lostpointercapture', drop);
  nail.addEventListener('pointerdown', e => { e.stopPropagation(); loose = Math.min(1, loose + .1); om += rand(-1.6, 1.6); crumb(); haptic(8); run(tick); });
}

/* ---------- неоплаченный счёт ---------- */
function billScene(fig) {
  const clip = $('.bill-clip', fig), bill = $('[data-bill]', fig), paper = $('.bill-paper', fig), rows = Array.from(paper.children);
  const cap = $('[data-cap]', fig), printer = $('.printer', fig), teeth = $('.teeth', fig), tearSvg = $('.tear', fig), tearPath = $('.tear path', fig);
  $('[data-date]', fig).textContent = dmy(new Date());
  let shown = 0, target = 0, stepping = false, done = false, torn = false, tear = 0, dir = 0;
  const bottomOf = i => rows[i].offsetTop + rows[i].offsetHeight + (i === rows.length - 1 ? 22 : 7);
  function step() {
    if (shown >= target) { stepping = false; return; }
    stepping = true; shown++;
    clip.style.height = bottomOf(shown - 1) + 'px';
    if (!RM && printer.animate) printer.animate([{ transform: 'none' }, { transform: 'translateY(-1.5px)' }, { transform: 'none' }], { duration: 90 });
    if (shown === rows.length) { stepping = false; finish(); return; }
    setTimeout(step, RM ? 0 : 92);
  }
  function check() {
    if (done) return;
    const r = fig.getBoundingClientRect(), vh = W.innerHeight;
    const p = clamp((vh * .96 - r.top) / (vh * .5), 0, 1);
    const t = RM ? (p > 0 ? rows.length : 0) : Math.ceil(p * rows.length);
    if (t > target) { target = t; if (!stepping) step(); }
  }
  bus.on('frame-scroll', check);
  setTimeout(check, 80);
  bus.on('resize', () => { if (done && !torn) clip.style.height = bottomOf(rows.length - 1) + 'px'; });
  function finish() {
    done = true;
    setTimeout(() => clip.classList.add('done'), 200);
    setTimeout(() => { if (!torn) { if (!RM) bill.classList.add('hang'); say(cap, 'Его можно оторвать — потяните вбок.'); } }, 450);
  }
  let drag = null, disp = 0, vel = 0, pull = 0;
  bill.addEventListener('pointerdown', e => {
    if (torn) return;
    if (!done) { if (!RM && bill.animate) bill.animate([{ transform: 'none' }, { transform: 'rotate(1.4deg)' }, { transform: 'rotate(-.8deg)' }, { transform: 'none' }], { duration: 600 }); return; }
    drag = { id: e.pointerId, x0: e.clientX, lx: e.clientX, lt: now(), vx: 0 };
    try { bill.setPointerCapture(e.pointerId); } catch (_) {}
    bill.classList.remove('hang');
    run(tickTear);
  });
  bill.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const t = now();
    drag.vx = (e.clientX - drag.lx) / Math.max(1, t - drag.lt) * 1000; drag.lx = e.clientX; drag.lt = t;
    pull = e.clientX - drag.x0;
  });
  const endDrag = e => { if (!drag || (e && e.pointerId !== drag.id)) return; drag = null; pull = 0; };
  bill.addEventListener('pointerup', endDrag); bill.addEventListener('pointercancel', endDrag); bill.addEventListener('lostpointercapture', endDrag);
  function tickTear(dt) {
    if (torn) return false;
    const w0 = bill.offsetWidth || 260, h0 = bill.offsetHeight || 400;
    vel += ((pull * .5 - disp) * 170 - vel * 20) * dt; // бумага идёт за пальцем, но тяжело
    disp += vel * dt;
    const strain = Math.abs(disp);
    if (drag && strain > 14) {
      if (!dir) { dir = Math.sign(disp) || 1; tearSvg.style.transform = dir < 0 ? 'scaleX(-1)' : ''; }
      tear = Math.min(1, tear + (strain - 14) * dt * .016 * (280 / w0)); // рвётся только под натяжением, назад не срастается
    }
    const pivot = dir >= 0 ? tear * 100 : 100 - tear * 100;
    bill.style.transformOrigin = `${pivot.toFixed(1)}% 0`;
    bill.style.transform = `translateX(${(disp * .3).toFixed(2)}px) rotate(${(disp / h0 * .75).toFixed(4)}rad)`;
    tearPath.style.strokeDashoffset = String(1 - tear);
    if (tear >= 1) { detach(drag ? drag.vx : vel * 2); return false; }
    if (!drag && Math.abs(disp) < .3 && Math.abs(vel) < .3) { bill.style.transform = ''; if (!RM) bill.classList.add('hang'); return false; }
  }
  function detach(vx) {
    torn = true; drag = null;
    haptic(18);
    const r = bill.getBoundingClientRect();
    bill.classList.remove('hang');
    bill.style.transform = ''; bill.style.transformOrigin = '50% 30%';
    Object.assign(bill.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', right: 'auto', margin: '0' });
    $('#fly').append(bill);
    teeth.classList.add('on');
    say(cap, 'Счёт снят.');
    let x = 0, y = 0, vy = -50, vxx = clamp(vx, -900, 900) * .6 + (dir || 1) * 110, rot = 0, vr = (dir || 1) * rand(70, 150), t = 0, op = 1;
    if (RM) { bill.remove(); collapse(); return; }
    run(dt => {
      t += dt;
      vy += (950 - vy * 2.2) * dt;          // воздух держит бумагу
      vxx *= Math.pow(.25, dt);
      x += (vxx + Math.sin(t * 4.2) * 70) * dt;
      y += vy * dt;
      rot += (vr + Math.sin(t * 3.1) * 120) * dt; vr *= Math.pow(.4, dt);
      if (t > .8) op = Math.max(0, op - dt * 1.1);
      bill.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
      bill.style.opacity = op.toFixed(3);
      if (op <= 0 || r.top + y > W.innerHeight + 400) { bill.remove(); return false; }
    });
    setTimeout(collapse, 1300);
  }
  function collapse() {
    const r = clip.getBoundingClientRect(), h = clip.offsetHeight, vh = W.innerHeight;
    if (r.bottom < vh * .2) { clip.style.transition = 'none'; clip.style.height = '0px'; W.scrollBy(0, -h); return; }
    clip.style.transition = 'height .9s cubic-bezier(.4,0,.2,1)'; clip.style.height = '0px';
  }
}

/* ---------- дым ---------- */
function smoke(cv, mode) {
  const x = cv.getContext('2d');
  let w = 1, h = 1, s = 1, density = 1, cx = 0, cy = 0, cr = 0, t = 0;
  const ps = [];
  const spr = {};
  const sprite = rgb => {
    if (spr[rgb]) return spr[rgb];
    const c = D.createElement('canvas'); c.width = c.height = 96;
    const g = c.getContext('2d'), gr = g.createRadialGradient(48, 48, 0, 48, 48, 48);
    gr.addColorStop(0, `rgba(${rgb},.9)`); gr.addColorStop(.5, `rgba(${rgb},.35)`); gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 96, 96);
    return (spr[rgb] = c);
  };
  function resize() {
    const r = cv.getBoundingClientRect();
    s = Math.min(1.5, W.devicePixelRatio || 1) * .7; w = Math.max(1, r.width); h = Math.max(1, r.height);
    cv.width = Math.ceil(w * s); cv.height = Math.ceil(h * s);
  }
  function init() {
    if (mode !== 'room' || ps.length) return;
    for (let i = 0; i < 30; i++) ps.push({ x: rand(0, w), y: rand(0, h), r: rand(60, 135), vx: rand(-7, 7), vy: rand(-13, -3), a: rand(.35, .75), ph: rand(0, 6.28) });
  }
  function step(dt) {
    t += dt;
    if (mode === 'wisp') {
      if (ps.length < 90 && Math.random() < dt * 11) ps.push({ x: w * .5 + rand(-5, 5), y: h + 8, r: rand(6, 9), vx: rand(-3, 3), vy: -rand(44, 58), age: 0, life: rand(5.5, 7), ph: rand(0, 6.28), a: .6 });
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]; p.age += dt;
        if (p.age > p.life) { ps.splice(i, 1); continue; }
        p.vx += (Math.sin(p.age * 1.7 + p.ph) * 9 + rand(-4, 4)) * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.r += 9 * dt;
      }
    } else {
      for (const p of ps) {
        p.x += (p.vx + Math.sin(t * .4 + p.ph) * 8) * dt; p.y += p.vy * dt;
        if (cr > 0) {
          const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy) || 1;
          if (d < cr + p.r) { const push = (cr + p.r - d) * 2.4; p.x += dx / d * push * dt; p.y += dy / d * push * dt; }
        }
        if (p.y < -p.r) { p.y = h + p.r; p.x = rand(0, w); }
        if (p.y > h + p.r * 1.5) p.y = h + p.r;
        if (p.x < -p.r) p.x = w + p.r; else if (p.x > w + p.r) p.x = -p.r;
      }
    }
  }
  function draw() {
    x.clearRect(0, 0, cv.width, cv.height);
    const rgb = mode === 'room' ? '196,192,186' : (isDark() ? '205,205,212' : '118,114,110');
    const img = sprite(rgb);
    for (const p of ps) {
      let a;
      if (mode === 'wisp') a = sstep(0, .6, p.age) * (1 - p.age / p.life) * p.a;
      else {
        a = density * p.a;
        if (cr > 0) { const d = Math.hypot(p.x - cx, p.y - cy); a *= sstep(cr * .55, cr + p.r * .4, d); }
      }
      if (a < .01) continue;
      x.globalAlpha = Math.min(1, a);
      x.drawImage(img, (p.x - p.r) * s, (p.y - p.r) * s, p.r * 2 * s, p.r * 2 * s);
    }
    x.globalAlpha = 1;
  }
  function warm(sec) { for (let k = 0; k < sec * 30; k++) step(1 / 30); }
  return { resize, init, step, draw, warm, clear: () => x.clearRect(0, 0, cv.width, cv.height), set density(v) { density = v; }, clearAt(a, b, r) { cx = a; cy = b; cr = r; } };
}

/* ---------- табличка «Не курить» ---------- */
function nosmokeScene(fig) {
  const sign = $('[data-sign]', fig), cv = $('.ns-smoke', fig);
  const sm = smoke(cv, 'wisp');
  let th = 0, om = 0, vis = false;
  let warmed = false;
  onView(fig, v => { vis = v; if (v) { sm.resize(); if (!warmed) { warmed = true; sm.warm(5); } run(tick); } });
  bus.on('resize', () => vis && sm.resize());
  sign.addEventListener('pointerdown', e => {
    const r = sign.getBoundingClientRect();
    om += clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1) * 3.4 + (Math.random() < .5 ? -1 : 1) * 1.3;
    haptic(6); run(tick);
  });
  sign.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); om += 3; run(tick); } });
  function tick(dt) {
    om += (-14 * Math.sin(th) - 1.5 * om) * dt; th += om * dt;
    sign.style.transform = `rotate(${(th * 57.3).toFixed(2)}deg)`;
    if (RM) return false;
    sm.step(dt); sm.draw();
    if (!vis) { sm.clear(); return false; }
  }
}

/* ---------- коридор в дыму и знак «Выход» ---------- */
function exitScene(fig) {
  const room = $('.ex-room', fig), sign = $('.ex-sign', fig), cv = $('.ex-smoke', fig), cap = $('[data-cap]', fig), lean = $('.ph-lean');
  const sm = smoke(cv, 'room');
  let vis = false, holding = false, clearR = 0, cleared = false, density = 0, sp = 0;
  onView(fig, v => { vis = v; if (v) { sm.resize(); sm.init(); run(tick); } });
  bus.on('resize', () => vis && sm.resize());
  bus.on('frame-scroll', () => {
    if (!vis) return;
    const r = fig.getBoundingClientRect(), vh = W.innerHeight;
    sp = clamp((vh * .95 - r.top) / (r.height * .8 + vh * .15), 0, 1);
  });
  const down = e => { if (e) e.preventDefault(); if (holding) return; holding = true; sign.classList.add('press'); haptic(8); run(tick); };
  const up = () => { holding = false; sign.classList.remove('press'); };
  sign.addEventListener('pointerdown', e => { down(e); try { sign.setPointerCapture(e.pointerId); } catch (_) {} });
  sign.addEventListener('pointerup', up); sign.addEventListener('pointercancel', up); sign.addEventListener('lostpointercapture', up);
  sign.addEventListener('contextmenu', e => e.preventDefault());
  sign.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) down(e); });
  sign.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') up(); });
  function tick(dt) {
    const want = cleared ? 0 : RM ? .6 : sstep(.05, .7, sp);
    density += (want - density) * Math.min(1, dt * (cleared ? 1.3 : 2.2));
    const r = room.getBoundingClientRect(), sr = sign.getBoundingClientRect();
    const cx = sr.left + sr.width / 2 - r.left, cy = sr.top + sr.height / 2 - r.top;
    const maxR = Math.hypot(Math.max(cx, r.width - cx), Math.max(cy, r.height - cy)) + 40;
    if (!cleared) {
      if (holding) clearR += (150 + clearR * 1.15) * dt; // дым расходится от «Выхода», чем дольше — тем быстрее
      else clearR = Math.max(0, clearR - 110 * dt);       // отпустили рано — медленно наползает обратно
      if (clearR >= maxR) {
        cleared = true; room.classList.add('clear'); haptic(14);
        say(cap, 'Выход был здесь заранее.');
        if (lean) lean.classList.add('lit');
      }
    }
    sm.density = density;
    sm.clearAt(cx, cy, cleared ? maxR * 2 : clearR);
    if (!RM) sm.step(dt);
    sm.draw();
    if (!vis) return false;
  }
}

/* ---------- кнопка лифта ---------- */
function liftScene(fig) {
  const btn = $('.lift-btn', fig), floorEl = $('[data-floor]', fig), msg = $('[data-msg]', fig), disp = $('.lift-display', fig), doors = $('.lift-doors', fig), cap = $('[data-cap]', fig);
  let floor = 9, started = false, arrived = false, count = 0, closeT = 0;
  onView(fig, v => { if (v && !started) { started = true; setTimeout(start, 700); } }, { margin: '0px 0px -20% 0px', threshold: .6 });
  function start() { disp.classList.add('moving'); next(); }
  function next() { // лифт едет сам: этаж за 1,5 секунды, сколько ни нажимай
    setTimeout(() => {
      floor--; floorEl.textContent = String(floor);
      if (floor <= 1) arrive(); else next();
    }, 1500);
  }
  function arrive() {
    arrived = true;
    disp.classList.remove('moving'); btn.classList.remove('lit');
    if (!RM && disp.animate) disp.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(1.8)' }, { filter: 'brightness(1)' }], { duration: 500 });
    open();
    say(cap, count >= 3 ? 'Приехал с той же скоростью.' : 'Приехал.');
  }
  function open() { doors.classList.add('open'); clearTimeout(closeT); closeT = setTimeout(() => doors.classList.remove('open'), 3600); }
  function press() {
    btn.classList.add('down'); setTimeout(() => btn.classList.remove('down'), 150);
    haptic(8);
    if (arrived) { open(); return; }
    btn.classList.add('lit');
    if (btn.animate) btn.querySelector('.ring').animate([{ boxShadow: '0 0 22px rgba(255,190,90,1), inset 0 0 12px rgba(255,190,90,.9)' }, { boxShadow: '0 0 10px rgba(255,170,70,.8), inset 0 0 8px rgba(255,170,70,.6)' }], { duration: 380 });
    count++;
    if (!started) { started = true; start(); }
    if (count === 10) {
      msg.textContent = 'Быстрее не приеду :)';
      disp.classList.add('say');
      setTimeout(() => disp.classList.remove('say'), 3500);
    }
  }
  btn.addEventListener('pointerdown', e => { e.preventDefault(); press(); });
  btn.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); press(); } });
}

/* ---------- горячий чайник и прихватка ---------- */
function kettleScene(fig) {
  const stage = $('.k-stage', fig), kettle = $('[data-kettle]', fig), mitt = $('.k-mitt', fig), sticker = $('.k-sticker', fig), fx = $('.k-fx', fig), cap = $('[data-cap]', fig), plate = $('.k-plate', fig);
  let hasMitt = store.get('mitt', false), burned = store.get('burned', false), gagDone = false, lifting = false, liftAnim = null;
  if (hasMitt) { mitt.hidden = false; onHandle(false); gagDone = true; cap.textContent = 'Прихватка с прошлого раза на месте.'; }
  else if (burned) { mitt.hidden = false; gagDone = true; cap.textContent = 'Возьмите прихватку.'; }
  tap(kettle, e => { if (hasMitt) liftStart(); else burn(e); }, 70);
  W.addEventListener('pointerup', () => { if (lifting) liftEnd(); });
  W.addEventListener('pointercancel', () => { if (lifting) liftEnd(); });
  kettle.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (hasMitt) { liftStart(); setTimeout(liftEnd, 500); } else burn(null); } });
  mitt.addEventListener('click', e => { e.stopPropagation(); if (hasMitt) drop(); else take(); });
  mitt.addEventListener('pointerdown', e => e.stopPropagation());
  function burn(e) {
    const sr = stage.getBoundingClientRect(), kr = kettle.getBoundingClientRect();
    const cx = kr.left + kr.width / 2, cy = kr.top + kr.height * .62;
    const ex = e ? e.clientX : cx, ey = e ? e.clientY : cy;
    let dx = cx - ex, dy = cy - ey; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    haptic([16, 30, 8]);
    trace.burn(ex, ey);
    if (!RM && kettle.animate) {
      // рефлекс: мгновенно, без переговоров — и обратно
      kettle.animate([{ transform: 'none' }, { transform: `translate(${(dx * 16).toFixed(1)}px,${(dy * 10 - 4).toFixed(1)}px) rotate(${(dx * 4).toFixed(1)}deg)`, offset: .12 },
        { transform: `translate(${(-dx * 4).toFixed(1)}px,${(-dy * 2).toFixed(1)}px) rotate(${(-dx).toFixed(1)}deg)`, offset: .45 }, { transform: `translate(${(dx * 1.5).toFixed(1)}px,0)`, offset: .7 }, { transform: 'none' }],
        { duration: 520, easing: 'ease-out' });
      sparks(ex - sr.left, ey - sr.top);
    }
    if (!burned) { burned = true; store.set('burned', true); }
    if (!gagDone) { say(cap, 'Ай! Рука сама отдёрнулась.'); gagDone = true; setTimeout(stickerGag, 950); }
    else if (!mitt.hidden) say(cap, 'Горячий. Как и был. Возьмите прихватку.');
  }
  function sparks(px, py) {
    for (let i = 0; i < 12; i++) {
      const s = D.createElement('i'); s.className = 'spark';
      s.style.left = px + 'px'; s.style.top = py + 'px';
      fx.append(s);
      const a = rand(Math.PI * 1.05, Math.PI * 1.95), v = rand(60, 160), T = rand(.45, .75);
      const vx = Math.cos(a) * v, vy = Math.sin(a) * v;
      s.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${vx * T * .55}px,${vy * T * .55}px) scale(.85)`, opacity: 1, offset: .45 },
        { transform: `translate(${vx * T}px,${vy * T + 260 * T * T}px) scale(.3)`, opacity: 0 }], { duration: T * 1000, easing: 'cubic-bezier(.2,.7,.4,1)' }).finished.then(() => s.remove());
    }
    const o = D.createElement('i'); o.className = 'ouch'; o.style.left = px + 'px'; o.style.top = py + 'px'; fx.append(o);
    o.animate([{ transform: 'scale(.3)', opacity: .9 }, { transform: 'scale(1.8)', opacity: 0 }], { duration: 420, easing: 'ease-out' }).finished.then(() => o.remove());
  }
  function stickerGag() {
    if (RM || !sticker.animate) { showMitt(); say(cap, 'Чайнику стикер не указ. Возьмите прихватку.'); return; }
    sticker.style.opacity = '1';
    sticker.animate([{ transform: 'translate(34px,-70px) rotate(-18deg) scale(1.5)', opacity: 0 }, { transform: 'rotate(-5deg) scale(.94)', opacity: 1, offset: .72 }, { transform: 'rotate(-5deg)', opacity: 1 }],
      { duration: 300, easing: 'ease-in' }).finished.then(() => {
      haptic(6);
      say(cap, 'На чайник — стикер «Не обжигать!»');
      setTimeout(() => sticker.classList.add('curl'), 600);
      setTimeout(() => {
        const a = sticker.animate([{ transform: 'rotate(-5deg)', opacity: 1 }, { transform: 'translate(2px,5px) rotate(-1deg)', opacity: 1, offset: .25 },
          { transform: 'translate(12px,74px) rotate(24deg)', opacity: 1, offset: .8 }, { transform: 'translate(16px,100px) rotate(31deg)', opacity: 0 }],
          { duration: 1150, easing: 'cubic-bezier(.5,0,.8,.6)', fill: 'forwards' });
        a.finished.then(() => { sticker.style.opacity = '0'; sticker.classList.remove('curl'); a.cancel(); say(cap, 'Чайнику стикер не указ.'); setTimeout(showMitt, 900); });
      }, 1300);
    });
  }
  function showMitt() {
    if (!mitt.hidden || hasMitt) return;
    mitt.hidden = false;
    if (!RM && mitt.animate) mitt.animate([{ transform: 'translateX(80px) rotate(16deg)', opacity: 0 }, { transform: 'translateX(-4px) rotate(-3deg) scale(1.04,.94)', opacity: 1, offset: .72 }, { transform: 'none', opacity: 1 }], { duration: 540, easing: 'ease-out' });
    setTimeout(() => say(cap, 'Возьмите прихватку.'), 300);
  }
  function onHandle(anim) {
    const first = mitt.getBoundingClientRect();
    kettle.append(mitt); mitt.classList.add('on-handle');
    if (!anim || RM || !mitt.animate) return;
    const last = mitt.getBoundingClientRect();
    const dx = first.left - last.left, dy = first.top - last.top, sc = first.width / (last.width || 1);
    mitt.animate([{ transform: `translate(${dx}px,${dy}px) scale(${sc}) rotate(0deg)` }, { transform: `translate(${dx * .45}px,${dy * .55 - 40}px) scale(${(sc + 1) / 2}) rotate(-22deg)`, offset: .5 }, { transform: 'rotate(-6deg)' }],
      { duration: 540, easing: 'cubic-bezier(.3,.7,.3,1)' });
  }
  function take() { hasMitt = true; store.set('mitt', true); haptic(8); onHandle(true); say(cap, 'Теперь можно. Поднимите его.'); }
  function drop() { hasMitt = false; store.set('mitt', false); mitt.classList.remove('on-handle'); stage.insertBefore(mitt, plate); haptic(5); say(cap, 'Прихватку сняли. Он всё ещё горячий.'); }
  function liftStart() {
    if (lifting) return;
    lifting = true; haptic(5);
    stage.classList.add('lifting');
    if (RM || !kettle.animate) return;
    kettle.getAnimations().forEach(a => a.cancel());
    // вес: сначала чуть просесть, потом тяжело оторваться
    liftAnim = kettle.animate([{ transform: 'none' }, { transform: 'translateY(4px)', offset: .25 }, { transform: 'translateY(-20px) rotate(-3deg)' }], { duration: 520, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' });
    say(cap, 'Тяжёлый. Но не обжигает.');
  }
  function liftEnd() {
    lifting = false;
    stage.classList.remove('lifting');
    if (RM || !kettle.animate) return;
    const cur = getComputedStyle(kettle).transform;
    if (liftAnim) { liftAnim.cancel(); liftAnim = null; }
    kettle.animate([{ transform: cur && cur !== 'none' ? cur : 'none' }, { transform: 'translateY(1px) scale(1.02,.98)', offset: .7 }, { transform: 'none' }], { duration: 300, easing: 'ease-in' });
  }
}

/* ---------- молоточек и колено ---------- */
function kneeScene(fig) {
  const btn = $('.knee', fig), shin = $('.kn-shin', fig), ham = $('.kn-hammer', fig), hit = $('.kn-hit', fig), cap = $('[data-cap]', fig);
  let busy = false;
  btn.addEventListener('click', () => {
    if (busy) return;
    busy = true;
    if (RM || !shin.animate) { say(cap, 'Ничего личного.'); busy = false; return; }
    ham.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-16deg)', offset: .45 }, { transform: 'rotate(9deg)', offset: .62 }, { transform: 'rotate(0deg)' }], { duration: 560, easing: 'ease-in-out' });
    setTimeout(() => {
      haptic(10);
      hit.animate([{ transform: 'scale(.4)', opacity: .9 }, { transform: 'scale(3.2)', opacity: 0 }], { duration: 380, easing: 'ease-out' });
      shin.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-44deg)', offset: .14 }, { transform: 'rotate(10deg)', offset: .42 }, { transform: 'rotate(-5deg)', offset: .64 }, { transform: 'rotate(2deg)', offset: .82 }, { transform: 'rotate(0deg)' }],
        { duration: 900, easing: 'ease-out' });
      say(cap, 'Ничего личного.');
    }, 335);
    setTimeout(() => { busy = false; }, 1000);
  });
}

/* ---------- своя карточка «Если…, я…» ---------- */
const claudeDownloads = (W.claude && typeof W.claude.use === 'function') ? W.claude.use('downloads').catch(() => null) : Promise.resolve(null);
function cardScene(fig) {
  const card = $('[data-card]', fig), fIf = $('[data-f="if"]', fig), fDo = $('[data-f="do"]', fig), gw = $('[data-gw]', fig), hints = $('.wc-hints', fig), save = $('.wc-save', fig), msg = $('.wc-msg', fig);
  const date = dmy(new Date());
  $$('[data-date]', fig).forEach(el => { el.textContent = date; });
  const HINTS = [
    ['на меня кричат', 'выхожу из комнаты'],
    ['разговор переходит на оскорбления', 'вешаю трубку'],
    ['подойти ко мне сзади и резко схватить за руку', 'почти наверняка отмахнусь'],
    ['меня предают', 'исчезаю из жизни человека'],
    ['на меня давят', 'ставлю разговор на паузу']
  ];
  const saved = store.get('card', null);
  let g = (saved && saved.g) || 'm';
  const grow = ta => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; };
  function setG(v) { g = v; gw.textContent = v === 'f' ? 'устроена' : 'устроен'; $$('.wc-g button', fig).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.g === v))); persist(); }
  function persist() { store.set('card', { if: fIf.value, do: fDo.value, g }); }
  if (saved) { fIf.value = saved.if || ''; fDo.value = saved.do || ''; }
  setG(g);
  [fIf, fDo].forEach(ta => { ta.addEventListener('input', () => { grow(ta); persist(); }); setTimeout(() => grow(ta), 0); });
  bus.on('resize', () => { grow(fIf); grow(fDo); });
  $$('.wc-g button', fig).forEach(b => b.addEventListener('click', () => setG(b.dataset.g)));
  HINTS.forEach(([a, b]) => {
    const bt = D.createElement('button'); bt.type = 'button'; bt.textContent = `${a} → ${b}`;
    bt.addEventListener('click', () => { write(fIf, a); setTimeout(() => write(fDo, b), RM ? 0 : a.length * 16 + 120); haptic(5); });
    hints.append(bt);
  });
  function write(ta, text) { // будто пишут от руки
    clearInterval(ta._w);
    if (RM) { ta.value = text; grow(ta); persist(); return; }
    ta.value = ''; let i = 0;
    ta._w = setInterval(() => { ta.value = text.slice(0, ++i); grow(ta); if (i >= text.length) { clearInterval(ta._w); persist(); } }, 16);
  }
  // картон под пальцем чуть прогибается
  const inner = $('.wcard-in', fig);
  card.addEventListener('pointerdown', e => {
    if (RM || e.target.closest('textarea')) return;
    const r = card.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
    inner.style.transition = 'transform .12s ease-out';
    inner.style.transform = `rotateX(${(-ny * 7).toFixed(2)}deg) rotateY(${(nx * 7).toFixed(2)}deg) scale(.99)`;
  });
  const release = () => { if (card.classList.contains('flip')) return; inner.style.transition = 'transform .5s cubic-bezier(.3,1.6,.5,1)'; inner.style.transform = ''; };
  W.addEventListener('pointerup', release); W.addEventListener('pointercancel', release);
  save.addEventListener('click', async () => {
    const a = fIf.value.trim(), b = fDo.value.trim();
    if (!a || !b) { say(msg, 'Сначала допишите обе половинки.'); (a ? fDo : fIf).focus(); return; }
    let blob = null;
    try { blob = await drawCard(a, b, g, date); } catch (e) { blob = null; }
    if (!blob) { say(msg, 'Не получилось сохранить, можно сделать снимок экрана.'); return; }
    flip();
    const ok = await deliver(blob, 'moyo-preduprezhdenie.png', 'Моё предупреждение');
    say(msg, ok === 'saved' ? 'Картинка сохранена.' : ok === 'shared' ? '' : ok === 'declined' ? '' : 'Не получилось сохранить, можно сделать снимок экрана.');
  });
  function flip() {
    if (RM) return;
    inner.style.transition = ''; inner.style.transform = '';
    card.classList.add('flip');
    setTimeout(() => card.classList.remove('flip'), 1700);
  }
}
async function deliver(blob, filename, title) {
  const viewerSave = await claudeDownloads;
  if (viewerSave) {
    try { await viewerSave.save({ filename, data: blob }); return 'saved'; }
    catch (e) { return e && e.code === 'declined' ? 'declined' : 'fail'; }
  }
  try {
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title }); return 'shared'; }
  } catch (e) { if (e && e.name === 'AbortError') return 'declined'; }
  try {
    const url = URL.createObjectURL(blob);
    const a = D.createElement('a'); a.href = url; a.download = filename;
    D.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return 'saved';
  } catch (e) { return 'fail'; }
}
async function drawCard(a, b, g, date) {
  try { await D.fonts.ready; } catch (e) {}
  const c = D.createElement('canvas'); c.width = 1080; c.height = 1350;
  const x = c.getContext('2d');
  // облик открыток каталога: стол цвета старой бумаги, горизонтали карты, светлая открытка со штемпелем
  x.fillStyle = '#efe4d0'; x.fillRect(0, 0, 1080, 1350);
  const gl = x.createRadialGradient(540, 620, 40, 540, 620, 720);
  gl.addColorStop(0, 'rgba(236,180,100,.3)'); gl.addColorStop(1, 'rgba(236,180,100,0)');
  x.fillStyle = gl; x.fillRect(0, 0, 1080, 1350);
  x.save(); x.strokeStyle = 'rgba(184,160,124,.5)'; x.lineWidth = 2;
  for (const [y0, a] of [[96, 1], [146, .8], [1170, 1], [1222, .7]]) {
    x.globalAlpha = a; x.beginPath(); x.moveTo(-20, y0);
    x.bezierCurveTo(260, y0 - 60, 520, y0 + 70, 760, y0 + 16); x.bezierCurveTo(900, y0 - 16, 1000, y0 - 30, 1100, y0); x.stroke();
  }
  x.restore();
  const rr = (X, Y, Wd, H, r) => { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + Wd, Y, X + Wd, Y + H, r); x.arcTo(X + Wd, Y + H, X, Y + H, r); x.arcTo(X, Y + H, X, Y, r); x.arcTo(X, Y, X + Wd, Y, r); x.closePath(); };
  const wrap = (text, maxW) => { const words = text.split(/\s+/), lines = []; let line = ''; for (const wd of words) { const t = line ? line + ' ' + wd : wd; if (x.measureText(t).width > maxW && line) { lines.push(line); line = wd; } else line = t; } if (line) lines.push(line); return lines; };
  x.save(); x.shadowColor = 'rgba(40,25,10,.24)'; x.shadowBlur = 44; x.shadowOffsetY = 16;
  rr(110, 230, 860, 820, 20); x.fillStyle = '#fbf6ec'; x.fill(); x.restore();
  x.save(); rr(110, 230, 860, 820, 20); x.clip(); x.strokeStyle = 'rgba(120,90,50,.032)'; x.lineWidth = 3;
  for (let X = -440; X < 980; X += 10) { x.beginPath(); x.moveTo(X, 1050); x.lineTo(X + 532, 230); x.stroke(); }
  x.restore();
  x.strokeStyle = '#e4d5bb'; x.lineWidth = 2; rr(110, 230, 860, 820, 20); x.stroke();
  x.save(); x.translate(862, 330); x.rotate(-.24); x.strokeStyle = 'rgba(43,33,25,.42)'; x.lineWidth = 3;
  x.beginPath(); x.arc(0, 0, 58, 0, Math.PI * 2); x.stroke();
  x.fillStyle = 'rgba(43,33,25,.5)'; x.textAlign = 'center'; x.font = '600 19px "Golos Text", "Segoe UI", sans-serif';
  x.fillText('ГРАНИЦЫ', 0, -2); x.fillText(String(new Date().getFullYear()), 0, 22);
  x.setLineDash([12, 6]); x.lineWidth = 3; x.strokeStyle = 'rgba(43,33,25,.36)';
  x.beginPath(); x.moveTo(-120, -10); x.lineTo(-62, -10); x.moveTo(-120, 10); x.lineTo(-62, 10); x.stroke();
  x.restore();
  x.fillStyle = '#8a7764'; x.textAlign = 'center'; x.font = '600 30px "Golos Text", "Segoe UI", sans-serif';
  x.fillText('МОЁ ПРЕДУПРЕЖДЕНИЕ', 540, 320);
  x.textAlign = 'left';
  let y = 420;
  const block = (label, text) => {
    x.fillStyle = '#2b2119'; x.font = '600 50px Lora, Georgia, serif'; x.fillText(label, 180, y);
    x.fillStyle = '#a2462a'; x.font = 'italic 500 58px Lora, Georgia, serif';
    const lines = wrap(text, 700).slice(0, 3);
    lines.forEach((ln, i) => x.fillText(ln, 180, y + 80 + i * 72));
    y += 80 + lines.length * 72 + 34;
  };
  block('Если', a + ',');
  block('я', b + '.');
  x.fillStyle = '#5a4a3c'; x.font = 'italic 400 38px Lora, Georgia, serif';
  wrap(`Ничего личного — просто я так ${g === 'f' ? 'устроена' : 'устроен'}.`, 720).forEach((ln, i) => x.fillText(ln, 180, Math.max(y + 10, 820) + i * 50));
  x.font = '500 28px "Golos Text", "Segoe UI", sans-serif'; x.fillStyle = '#8a7764';
  x.fillText(`сказано заранее, в спокойный час · ${date}`, 180, 990);
  x.textAlign = 'center'; x.font = '400 28px "Golos Text", "Segoe UI", sans-serif'; x.fillStyle = '#8a7764';
  x.fillText('Из статьи «Чьи это границы?»', 540, 1250);
  return await new Promise(res => c.toBlob(res, 'image/png'));
}

/* ---------- дежурство: прожектор и журнал про читателя ---------- */
(function duty() {
  const beam = $('#beam'), log = $('#log');
  if (!beam || !log) return;
  let active = false, ended = false, entries = 0, lastSay = 0, lastScrollT = now(), pauseFrom = 0, silent = false, upAcc = 0, lastBack = 0, lastFast = 0, lastTouch = 0, cur = null;
  function put(text, final) { // одна запись за раз, как уведомление
    const t = now();
    if (!final && (t - lastSay < 2600 || entries >= 11)) return false;
    lastSay = t; if (!final) entries++;
    if (cur) { const old = cur; old.classList.remove('on'); setTimeout(() => old.remove(), 380); }
    const e = D.createElement('div'); e.className = 'log-e' + (final ? ' final' : '');
    e.innerHTML = `<span class="log-h">журнал дежурства · ${hms(new Date())}</span><span class="log-t"></span>`;
    e.querySelector('.log-t').textContent = text;
    log.append(e); cur = e;
    requestAnimationFrame(() => requestAnimationFrame(() => e.classList.add('on')));
    setTimeout(() => { e.classList.remove('on'); setTimeout(() => e.remove(), 400); if (cur === e) cur = null; }, final ? 4200 : 3300);
    return true;
  }
  bus.on('zone', ({ z, prev }) => {
    if (z === 'watch' && !ended) {
      beam.classList.add('on');
      if (!active) { active = true; lastScrollT = now(); if (!entries) put('Наблюдение начато.'); run(tick); }
    } else if (prev === 'watch') {
      beam.classList.remove('on');
      if (z === 'lamps' && active && !ended) {
        ended = true; active = false;
        beam.classList.add('off');
        put('Дежурство окончено.', true);
        const tr = $('.ph-trust'); if (tr) setTimeout(() => tr.classList.add('lit'), 500);
      } else active = false;
    }
  });
  bus.on('scroll', ({ dy, t }) => {
    if (!active) return;
    if (silent || t - lastScrollT > 3500) {
      const sec = Math.round((t - (pauseFrom || lastScrollT)) / 1000);
      if (sec >= 3) put(`Остановились на ${sec} с. Почему?`);
      silent = false;
    }
    lastScrollT = t; pauseFrom = 0;
    if (dy < 0) { upAcc -= dy; if (upAcc > 140 && t - lastBack > 6000 && put('Вернулись назад. Что-то не так?')) { lastBack = t; upAcc = 0; } }
    else if (dy > 0) upAcc = 0;
    if (Math.abs(scroll.v) > 2200 && t - lastFast > 6000 && put('Листаете быстрее. Торопитесь?')) lastFast = t;
  });
  bus.on('tapped', () => { if (!active) return; const t = now(); if (t - lastTouch > 8000 && put('Касание. Это что-то значит?')) lastTouch = t; });
  function tick() {
    if (!active) return false;
    const t = now();
    if (!silent && t - lastScrollT > 3500) { silent = true; pauseFrom = lastScrollT; }
    if (silent && t - lastScrollT > 9500 && !tick.quiet) { tick.quiet = true; put('Тишина. Подозрительно.'); }
    if (t - lastScrollT < 1000) tick.quiet = false;
  }
})();

/* ---------- четыре вопроса — четыре лампы ---------- */
(function lamps() {
  const ul = $('ul.lamps');
  if (!ul) return;
  const lis = $$('li', ul), saved = store.get('lamps', [0, 0, 0, 0]);
  const BULB = '<svg viewBox="0 0 24 32" aria-hidden="true"><path class="bulb-glass" d="M12 2C6.5 2 2.5 6 2.5 11.2c0 3.6 2 5.8 3.6 7.6 1 1.1 1.6 2.3 1.6 3.7v1h8.6v-1c0-1.4.6-2.6 1.6-3.7 1.6-1.8 3.6-4 3.6-7.6C21.5 6 17.5 2 12 2z"/><path class="bulb-fil" d="M8.5 15.5c1-1.6 2-1.6 3.5 0s2.5 1.6 3.5 0M12 15.6V23"/><rect class="bulb-base" x="7.6" y="24.5" width="8.8" height="5" rx="1.6"/></svg>';
  const next = ul.nextElementSibling;
  lis.forEach((li, i) => {
    const b = D.createElement('button');
    b.type = 'button'; b.className = 'lamp'; b.innerHTML = BULB;
    b.setAttribute('aria-label', 'Зажечь лампу у этого вопроса');
    b.setAttribute('aria-pressed', saved[i] ? 'true' : 'false');
    li.prepend(b);
    if (saved[i]) li.classList.add('on');
    const act = e => {
      if (e) e.preventDefault();
      ul.classList.add('touched');
      if (li.classList.contains('on')) { li.classList.remove('warming'); void li.offsetWidth; li.classList.add('warming'); return; }
      li.classList.add('on', 'warming'); haptic(6);
      saved[i] = 1; store.set('lamps', saved); b.setAttribute('aria-pressed', 'true');
      setTimeout(() => li.classList.remove('warming'), 900);
      check();
    };
    b.addEventListener('click', e => { e.stopPropagation(); act(e); });
    li.addEventListener('click', () => act());
  });
  if (saved.some(Boolean)) ul.classList.add('touched');
  function check() { if (saved.every(Boolean)) { ul.classList.add('all'); if (next) next.classList.add('warm'); const bl = $('.ph-balance'); if (bl) bl.classList.add('lit'); } }
  check();
})();

/* ---------- «теряете очертания» — и шаг назад ---------- */
(function dissolve() {
  const a = $('.ph-dissolve'), b = $('.ph-step'), haze = $('#haze');
  if (!a || !b || !haze || RM) return;
  let on = false;
  onView(a.closest('p'), v => { on = v; if (!v) setP(0); }, { margin: '200px 0px' });
  function setP(p) { haze.style.opacity = (p * .95).toFixed(3); haze.style.transform = `scale(${(1.25 - .25 * p).toFixed(3)})`; a.style.setProperty('--dz', p.toFixed(3)); }
  bus.on('frame-scroll', () => {
    if (!on) return;
    const vh = W.innerHeight, ta = a.getBoundingClientRect().top, tb = b.getBoundingClientRect().top;
    let p = clamp((vh * .8 - ta) / (vh * .3), 0, 1);
    if (tb < vh * .5) p = 0; // шаг назад: очертания возвращаются
    setP(p);
  });
})();

/* ---------- «меня несёт»: поток слов ---------- */
const stream = (() => {
  const layer = $('#stream');
  const api = { S: 0, stopped: false, brake() {}, recover() {} };
  if (!layer || RM) { api.stopped = true; return api; }
  const WORDS = ['напор', 'стыд', 'тревога', 'тебе же было приятно', 'а вдруг уйдёт?', 'неловко отказать', 'ну же'];
  const items = [];
  let on = false;
  api.S = 1;
  function build() {
    for (let i = 0; i < 11; i++) {
      const el = D.createElement('span'); el.className = 'sw';
      el.textContent = WORDS[i % WORDS.length];
      const size = rand(22, 54); el.style.fontSize = size.toFixed(0) + 'px';
      layer.append(el);
      items.push({ el, x: rand(-260, W.innerWidth), y: rand(.06, .9) * W.innerHeight, v: 38 + size * 1.7, ph: rand(0, 6.28), a: rand(.07, .15), w: 0 });
    }
    requestAnimationFrame(() => items.forEach(it => { it.w = it.el.offsetWidth; }));
  }
  function tick(dt, t) {
    const S = api.S, tt = t / 1000;
    for (const it of items) {
      it.x += it.v * S * dt;
      it.y += (Math.sin(tt * .6 + it.ph) * 7 * S + (1 - S) * 22) * dt; // тормозят — оседают
      if (it.x > W.innerWidth + 30) { it.x = -it.w - rand(30, 220); it.y = rand(.06, .9) * W.innerHeight; }
      it.el.style.transform = `translate3d(${it.x.toFixed(1)}px,${it.y.toFixed(1)}px,0) skewX(${(-9 * S).toFixed(1)}deg)`;
      it.el.style.opacity = (it.a * Math.pow(S, .6)).toFixed(3);
    }
    trace.drift = zone === 'stream' ? 70 * S : 0;
    if (!on && !api.stopped) return false;
    if (api.stopped && S <= 0) { trace.drift = 0; layer.classList.remove('on'); return false; }
  }
  bus.on('zone', ({ z }) => {
    const want = z === 'stream' && !api.stopped;
    if (want && !on) { on = true; if (!items.length) build(); layer.classList.add('on'); run(tick); }
    else if (!want && on) { on = false; layer.classList.remove('on'); trace.drift = 0; }
  });
  api.brake = holdT => { // сначала сопротивляется, потом поддаётся
    const k = holdT < .3 ? .12 : 1.5 * (holdT - .3 + .35);
    api.S = Math.max(0, api.S - (k * api.S + (holdT > .3 ? .1 : 0)) * (1 / 60));
    if (api.S < .02) { api.S = 0; api.stopped = true; }
  };
  api.recover = dt => { if (!api.stopped) api.S = Math.min(1, api.S + dt * .35); };
  return api;
})();

/* ---------- «Стоп» → пауза → дыхание ---------- */
function pauseScene(fig) {
  const btn = $('.pz-btn', fig), label = $('.pz-label', fig), fill = $('.pz-fill', fig), cap = $('[data-cap]', fig), dots = $('.pz-dots', fig), inhaleEl = $('#inhale'), dawnEl = $('#dawn');
  const list = fig.nextElementSibling && fig.nextElementSibling.matches('ul') ? fig.nextElementSibling : null;
  const qs = list ? $$('li', list) : [];
  let mode = 'stop', holding = false, holdT = 0, inhale = 0, breaths = 0, maxIn = 0;
  const down = e => { if (e) e.preventDefault(); if (holding) return; holding = true; holdT = 0; maxIn = inhale; btn.classList.add('hold'); haptic(6); run(tick); };
  const up = () => {
    if (!holding) return;
    holding = false; btn.classList.remove('hold');
    if (mode === 'breath' && maxIn >= .6) countBreath();
  };
  btn.addEventListener('pointerdown', e => { down(e); try { btn.setPointerCapture(e.pointerId); } catch (_) {} });
  btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up); btn.addEventListener('lostpointercapture', up);
  btn.addEventListener('contextmenu', e => e.preventDefault());
  btn.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) down(e); });
  btn.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') up(); });
  fig.dataset.mode = 'stop';
  function toBreath() {
    mode = 'pause'; fig.dataset.mode = 'pause';
    const ph = $('.ph-stop'); if (ph) ph.classList.add('lit');
    haptic(14);
    label.textContent = 'Пауза';
    say(cap, 'Остановились. Теперь пауза.');
    setTimeout(() => {
      mode = 'breath'; inhale = 0; fig.dataset.mode = 'breath';
      label.textContent = 'Вдох';
      dots.classList.add('on');
      if (list) list.classList.add('breathing');
      say(cap, 'Держите — вдох. Отпустите — выдох.');
    }, 1300);
  }
  function countBreath() {
    if (breaths >= 4) return;
    const li = qs[breaths];
    breaths++;
    if (li) li.classList.add('lit');
    const d = $$('i', dots)[breaths - 1]; if (d) d.classList.add('on');
    haptic(6);
    if (breaths === 4) {
      if (dawnEl) dawnEl.classList.add('on');
      say(cap, 'Доброе утро.');
      label.textContent = 'Утро';
    }
  }
  function tick(dt) {
    if (mode === 'stop') {
      if (holding) {
        holdT += dt;
        if (stream.stopped && stream.S <= 0) { if (holdT > .5) toBreath(); }
        else stream.brake(holdT);
        fill.style.transform = `scale(${(1 - (stream.S || 0)) * .9 + .1})`;
        if (stream.S <= 0 && mode === 'stop' && holdT > .5) toBreath();
      } else {
        stream.recover(dt);
        fill.style.transform = `scale(${((1 - (stream.S || 0)) * .9 + .1).toFixed(3)})`;
        if (stream.S >= 1 || stream.stopped) return false;
      }
      return;
    }
    if (mode === 'breath') {
      if (holding) { inhale = Math.min(1, inhale + dt / 4); maxIn = Math.max(maxIn, inhale); }
      else inhale = Math.max(0, inhale - dt / 6);
      const e = 1 - Math.pow(1 - inhale, 2);
      fill.style.transform = `scale(${(.12 + .88 * e).toFixed(3)})`;
      if (inhaleEl) inhaleEl.style.opacity = (e * .9).toFixed(3);
      if (breaths < 4) label.textContent = holding ? 'Вдох…' : inhale > .02 ? 'Выдох…' : 'Вдох';
      if (!holding && inhale <= 0) { if (inhaleEl) inhaleEl.style.opacity = '0'; return false; }
      return;
    }
    if (!holding) return false;
  }
  bus.on('zone', ({ z }) => { if (dawnEl && (z === 'clear' || z === 'end')) dawnEl.classList.remove('on'); });
}

/* ---------- договорённость: нужны двое ---------- */
function agreeScene(fig) {
  const tbl = $('[data-table]', fig), a = $('.cup.a', fig), b = $('.cup.b', fig), cap = $('[data-cap]', fig), clink = $('.ag-clink', fig);
  const ptrs = new Map();
  let space = false, over = false, agreed = false, xa = 0, xb = 0, va = 0, vb = 0;
  const gap = () => Math.max(10, (tbl.clientWidth * .84 - 128) / 2 + 7);
  tbl.addEventListener('pointerdown', e => {
    ptrs.set(e.pointerId, e.clientX);
    try { tbl.setPointerCapture(e.pointerId); } catch (_) {}
    if (!agreed) setTimeout(() => { if (!agreed && ptrs.size === 1 && !space) say(cap, 'Нужен второй.'); }, 160);
    haptic(4); run(tick);
  });
  const lift = e => { ptrs.delete(e.pointerId); run(tick); };
  tbl.addEventListener('pointerup', lift); tbl.addEventListener('pointercancel', lift); tbl.addEventListener('lostpointercapture', lift);
  tbl.addEventListener('pointerenter', () => { over = true; }); tbl.addEventListener('pointerleave', () => { over = false; });
  W.addEventListener('keydown', e => { if (e.code === 'Space' && over && !/TEXTAREA|INPUT/.test((D.activeElement || {}).tagName || '')) { e.preventDefault(); space = true; run(tick); } });
  W.addEventListener('keyup', e => { if (e.code === 'Space') { space = false; run(tick); } });
  function tick(dt) {
    const n = ptrs.size + (space && ptrs.size ? 1 : 0), G = gap();
    let ta = 0, tb = 0;
    if (agreed || n >= 2) { ta = G; tb = G; }
    else if (n === 1) { const r = tbl.getBoundingClientRect(), px = Array.from(ptrs.values())[0]; if (px < r.left + r.width / 2) ta = G * .38; else tb = G * .38; }
    va += ((ta - xa) * 60 - va * 11) * dt; xa += va * dt; // чашки скользят с трением
    vb += ((tb - xb) * 60 - vb * 11) * dt; xb += vb * dt;
    if (!agreed && n >= 2 && xa > G - 1.5 && xb > G - 1.5) meet(G);
    a.style.transform = `translateX(${xa.toFixed(2)}px)`;
    b.style.transform = `translateX(${(-xb).toFixed(2)}px)`;
    if (!ptrs.size && !space && Math.abs(xa - ta) < .2 && Math.abs(xb - tb) < .2 && Math.abs(va) < .2 && Math.abs(vb) < .2) return false;
  }
  function meet(G) {
    agreed = true;
    haptic([8, 40, 8]);
    xa = G - 3; xb = G - 3; va = -40; vb = -40; // дзынь — и чуть отскакивают
    tbl.classList.add('done');
    if (clink.animate && !RM) clink.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)', offset: .3 }, { opacity: 0, transform: 'scale(1.3) translateY(-6px)' }], { duration: 700, easing: 'ease-out' });
    say(cap, 'Договорились.');
  }
}

/* ---------- запуск сцен ---------- */
const SCENES = { stamp: f => stampScene(f, false), mine: f => stampScene(f, true), bubble: bubbleScene, nail: nailScene, bill: billScene, nosmoke: nosmokeScene, exit: exitScene, lift: liftScene, kettle: kettleScene, knee: kneeScene, card: cardScene, pause: pauseScene, agree: agreeScene };
$$('[data-scene]').forEach(f => { const fn = SCENES[f.dataset.scene]; if (fn) { try { fn(f); } catch (e) { console.error('scene', f.dataset.scene, e); } } });

/* ---------- память: где остановились ---------- */
(function memory() {
  const heads = $$('.part-h h2');
  const visits = store.get('visits', 0) + 1;
  store.set('visits', visits);
  const pos0 = store.get('pos', null);
  const headAt = () => { let t = ''; const line = W.innerHeight * .4; for (const h of heads) if (h.getBoundingClientRect().top < line) t = h.textContent.replace(/\s+/g, ' ').trim(); return t; };
  let saveT = 0;
  W.addEventListener('scroll', () => {
    const t = now(); if (t - saveT < 900) return; saveT = t;
    const max = R.scrollHeight - W.innerHeight; if (max <= 0) return;
    store.set('pos', { y: W.scrollY / max, head: headAt() });
  }, { passive: true });
  const toast = $('#toast');
  setTimeout(() => {
    if (!toast || visits < 2 || !pos0 || pos0.y < .06 || pos0.y > .97 || W.scrollY > 80) return;
    const where = pos0.head ? `на разделе «${pos0.head}»` : 'во вступлении';
    toast.innerHTML = '<p></p><button type="button" class="go">Продолжить</button><button type="button" class="x" aria-label="Закрыть">×</button>';
    toast.querySelector('p').textContent = `С возвращением. Вы остановились ${where}.`;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add('on'));
    const close = () => { toast.classList.remove('on'); setTimeout(() => { toast.hidden = true; }, 400); };
    toast.querySelector('.go').addEventListener('click', () => { close(); const max = R.scrollHeight - W.innerHeight; W.scrollTo({ top: pos0.y * max, behavior: RM ? 'auto' : 'smooth' }); });
    toast.querySelector('.x').addEventListener('click', close);
    setTimeout(close, 12000);
  }, 1500);
})();

/* ---------- первый расчёт ---------- */
updateZone();
bus.emit('frame-scroll');
(D.fonts && D.fonts.ready ? D.fonts.ready : Promise.resolve()).then(() => { updateZone(); bus.emit('frame-scroll'); });
})();
