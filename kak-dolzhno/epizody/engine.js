/* Бумажный коллаж 2.5D: вырезки с рваным краем и белой кромкой волокна, пять планов по глубине,
   мягкие тени (125°, длина зависит от высоты над нижним слоем), плавная камера и рывки вырезок
   по 12 кадров в секунду. Каждый кадр рисуется по времени t, поэтому любой кадр можно получить заново. */
const W = 1920, H = 1080, FPS = 24, F = 1000;
const TAU = Math.PI * 2;

/* ---------- случайность с зерном ---------- */
function rng(seed){ let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(a, b){ let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35); h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; return (h >>> 0) / 4294967296; }
function noise1(seed){ const r = rng(seed), v = Array.from({length: 512}, r); return x => { const i = Math.floor(x), f = x - i, a = v[((i % 512) + 512) % 512], b = v[(((i + 1) % 512) + 512) % 512], u = f * f * (3 - 2 * f); return a + (b - a) * u; }; }

/* ---------- кривые ---------- */
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const E = {
  lin: t => t,
  in: t => t * t * t,
  out: t => 1 - Math.pow(1 - t, 3),
  io: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  sine: t => .5 - .5 * Math.cos(Math.PI * t),
  back: t => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },   // лёгкий перелёт и посадка
  drop: t => { if (t < .72) return Math.pow(t / .72, 2); const u = (t - .72) / .28; return 1 - Math.sin(u * Math.PI) * .07 * (1 - u); }, // упала и чуть подпрыгнула
};
// ключи [[t, v, ease], ...]: ease — как прийти к этому ключу
function track(keys){ return t => { if (t <= keys[0][0]) return keys[0][1]; for (let k = 1; k < keys.length; k++){ const [t1, v1, e] = keys[k]; if (t <= t1){ const [t0, v0] = keys[k - 1]; const u = (E[e || 'io'])((t - t0) / (t1 - t0)); return Array.isArray(v0) ? v0.map((x, j) => lerp(x, v1[j], u)) : lerp(v0, v1, u); } } return keys[keys.length - 1][1]; }; }
// плавный путь камеры: кубический Эрмит с касательными по соседям, скорость не обнуляется на промежуточных ключах
function path(keys){ // keys: [[t, {x,y,z,roll}], ...]
  const n = keys.length, names = Object.keys(keys[0][1]);
  const tan = keys.map((k, i) => { const o = {}; names.forEach(nm => { if (k[2] && k[2].stop){ o[nm] = 0; return; } if (i === 0 || i === n - 1){ o[nm] = 0; return; } const a = keys[i - 1], b = keys[i + 1]; o[nm] = (b[1][nm] - a[1][nm]) / (b[0] - a[0]); }); return o; });
  return t => { if (t <= keys[0][0]) return {...keys[0][1]}; if (t >= keys[n - 1][0]) return {...keys[n - 1][1]};
    let i = 0; while (t > keys[i + 1][0]) i++;
    const [t0, p0] = keys[i], [t1, p1] = keys[i + 1], h = t1 - t0, u = (t - t0) / h, u2 = u * u, u3 = u2 * u;
    const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2, o = {};
    names.forEach(nm => { o[nm] = h00 * p0[nm] + h10 * h * tan[i][nm] + h01 * p1[nm] + h11 * h * tan[i + 1][nm]; });
    return o; };
}
const stepT = (t, fps = 12) => Math.floor(t * fps + 1e-6) / fps;   // время вырезок: рывками

/* ---------- фактура бумаги ---------- */
function makeGrain(seed = 7){
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), im = g.createImageData(512, 512), r = rng(seed);
  const L = 32, low = Array.from({length: L * L}, r);
  const lowAt = (x, y) => { const gx = x / 512 * L, gy = y / 512 * L, i = Math.floor(gx), j = Math.floor(gy), fx = gx - i, fy = gy - j; const q = (a, b) => low[((b % L) * L) + (a % L)]; const s = fx * fx * (3 - 2 * fx), t = fy * fy * (3 - 2 * fy); return lerp(lerp(q(i, j), q(i + 1, j), s), lerp(q(i, j + 1), q(i + 1, j + 1), s), t); };
  for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++){ const n = r() * .55 + lowAt(x, y) * .45; const v = 255 - Math.round(n * 30); const k = (y * 512 + x) * 4; im.data[k] = v; im.data[k + 1] = v - 2; im.data[k + 2] = v - 6; im.data[k + 3] = 255; }
  g.putImageData(im, 0, 0);
  // волокна: тонкие светлые и тёмные штрихи
  for (let i = 0; i < 260; i++){ const x = r() * 512, y = r() * 512, a = r() * TAU, l = 6 + r() * 22; g.strokeStyle = r() < .5 ? 'rgba(255,255,255,.35)' : 'rgba(90,70,50,.12)'; g.lineWidth = .6 + r() * .7; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + .6) * l * .5, y + Math.sin(a + .6) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  return c;
}
let GRAIN = null, GRAIN_PAT = null;

/* ---------- формы ---------- */
const S = {
  rect: (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]],
  ell: (cx, cy, rx, ry, n) => { n = n || Math.max(18, Math.round((rx + ry) / 3)); return Array.from({length: n}, (_, k) => { const a = k / n * TAU; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; }); },
  arc: (cx, cy, rx, ry, a0, a1, n = 24) => Array.from({length: n + 1}, (_, k) => { const a = a0 + (a1 - a0) * k / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; }),
  rrect: (x0, y0, x1, y1, rad, n = 5) => { const p = []; const c = [[x1 - rad, y0 + rad, -Math.PI / 2], [x1 - rad, y1 - rad, 0], [x0 + rad, y1 - rad, Math.PI / 2], [x0 + rad, y0 + rad, Math.PI]]; c.forEach(([cx, cy, a]) => { for (let k = 0; k <= n; k++){ const b = a + k / n * Math.PI / 2; p.push([cx + Math.cos(b) * rad, cy + Math.sin(b) * rad]); } }); return p; },
  heart: (cx, cy, s, n = 40) => Array.from({length: n}, (_, k) => { const t = k / n * TAU; return [cx + 16 * Math.pow(Math.sin(t), 3) * s, cy - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * s]; }),
  star: (cx, cy, r0, r1, n = 5, rot = -Math.PI / 2) => Array.from({length: n * 2}, (_, k) => { const a = rot + k * Math.PI / n, r = k % 2 ? r1 : r0; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; }),
  // толстая линия по точкам (для пара, веток, ножек штатива)
  band: (pts, w0, w1 = w0) => { const L = [], R = []; pts.forEach((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = lerp(w0, w1, i / (pts.length - 1)) / 2; L.push([p[0] - dy / l * w, p[1] + dx / l * w]); R.push([p[0] + dy / l * w, p[1] - dx / l * w]); }); return L.concat(R.reverse()); },
  move: (pts, dx, dy) => pts.map(p => [p[0] + dx, p[1] + dy]),
  mirror: pts => pts.map(p => [-p[0], p[1]]).reverse(),
};
// рваный край: делим контур на кусочки и сдвигаем точки по нормали
function tear(pts, amp, seed, step = 3){
  const n1 = noise1(seed), r = rng(seed + 11), out = []; let u = 0;
  let area = 0; for (let k = 0; k < pts.length; k++){ const a = pts[k], b = pts[(k + 1) % pts.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const sgn = area > 0 ? 1 : -1;
  for (let k = 0; k < pts.length; k++){
    const a = pts[k], b = pts[(k + 1) % pts.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]); const m = Math.max(1, Math.round(len / step));
    const nx = sgn * (b[1] - a[1]) / (len || 1), ny = -sgn * (b[0] - a[0]) / (len || 1);
    for (let q = 0; q < m; q++){ const f = q / m; u += len / m;
      const d = amp * ((n1(u / 7) - .5) * 1.3 + (r() - .5) * .9 + (r() < .04 ? -1.2 : 0));
      out.push([a[0] + (b[0] - a[0]) * f + nx * d, a[1] + (b[1] - a[1]) * f + ny * d]); }
  }
  return out;
}
function tracePath(g, pts){ g.moveTo(pts[0][0], pts[0][1]); for (let k = 1; k < pts.length; k++) g.lineTo(pts[k][0], pts[k][1]); g.closePath(); }

/* ---------- вырезка → картинка ----------
   def: {shape, holes, color, res, amp, seed, alpha, tex, deco(g), edge, grey, tone} */
let SEED = 1;
function paper(def){
  const res = def.res || 2, amp = def.amp === undefined ? 2.2 : def.amp, seed = def.seed || (SEED += 101);
  const outer = amp > 0 ? tear(def.shape, amp, seed) : def.shape;
  const holes = (def.holes || []).map((h, i) => amp > 0 ? tear(h, amp * .8, seed + 50 + i) : h);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; outer.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
  const pad = 4; x0 -= pad; y0 -= pad; x1 += pad; y1 += pad;
  const c = document.createElement('canvas'); c.width = Math.ceil((x1 - x0) * res); c.height = Math.ceil((y1 - y0) * res);
  const g = c.getContext('2d'); g.scale(res, res); g.translate(-x0, -y0);
  const P = () => { g.beginPath(); tracePath(g, outer); holes.forEach(h => tracePath(g, h)); };
  // белая сердцевина бумаги на месте надрыва: на 1.5 шире и на 1 ближе к свету
  if (def.edge !== false){ g.save(); g.translate(-.6, -.8); P(); g.fillStyle = def.edgeColor || '#faf8f5'; g.lineJoin = 'round'; g.lineWidth = 3; g.strokeStyle = def.edgeColor || '#faf8f5'; g.fill('evenodd'); g.stroke(); g.restore(); }
  g.save(); P(); g.clip('evenodd');
  g.globalAlpha = def.alpha === undefined ? 1 : def.alpha;
  g.fillStyle = def.color || '#f3ead8'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  g.globalAlpha = 1;
  if (def.deco) { g.save(); def.deco(g, {x0, y0, x1, y1}); g.restore(); }
  // свет сверху-слева, чуть темнее книзу-вправо
  if (def.tone !== false){ const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, 'rgba(255,248,230,.14)'); gr.addColorStop(1, 'rgba(40,20,0,.12)'); g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, y1 - y0); }
  if (def.tex !== 0){ g.globalCompositeOperation = 'multiply'; g.globalAlpha = def.tex === undefined ? 1 : def.tex; const pat = g.createPattern(GRAIN, 'repeat'); const r = rng(seed); pat.setTransform(new DOMMatrix().translate(r() * 512, r() * 512).scale(1 / res * (def.texScale || 1.4))); g.fillStyle = pat; g.fillRect(x0, y0, x1 - x0, y1 - y0); }
  g.restore();
  const sp = {c, x0, y0, res, w: x1 - x0, h: y1 - y0, outer};
  if (def.grey){ const gc = document.createElement('canvas'); gc.width = c.width; gc.height = c.height; const gg = gc.getContext('2d'); gg.filter = def.greyFilter || 'grayscale(1) brightness(.78) contrast(.85)'; gg.drawImage(c, 0, 0); sp.grey = gc; }
  return sp;
}
// маска-силуэт вырезки (для «окна» внутрь головы)
function silhouette(sp){ const c = document.createElement('canvas'); c.width = sp.c.width; c.height = sp.c.height; const g = c.getContext('2d'); g.scale(sp.res, sp.res); g.translate(-sp.x0, -sp.y0); g.beginPath(); tracePath(g, sp.outer); g.fillStyle = '#000'; g.fill(); return {...sp, c}; }

/* ---------- узлы сцены ---------- */
let NID = 0;
class Node {
  constructor(o = {}){ Object.assign(this, {x: 0, y: 0, r: 0, sx: 1, sy: 1, a: 1, z: null, dz: 0, lift: 5, kids: [], sp: null, boil: 0, grey: 0, soak: 0, vis: true, under: false, blur: null, id: ++NID}, o); }
  add(...k){ k.forEach(c => { c.parent = this; this.kids.push(c); }); return this; }
}
const N = (sp, o) => new Node({sp, ...o});
const G = (o, ...kids) => new Node(o).add(...kids);

function mul(a, b){ return [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]]; }
function local(n, step){
  let x = n.x, y = n.y, r = n.r;
  if (n.boil){ const b = n.boil; x += (hash(n.id, step) - .5) * 2 * b; y += (hash(n.id + 7, step) - .5) * 2 * b; r += (hash(n.id + 13, step) - .5) * .012 * b; }
  const c = Math.cos(r), s = Math.sin(r); return [c * n.sx, s * n.sx, -s * n.sy, c * n.sy, x, y];
}
// мировая матрица, глубина и прозрачность родителя узла (чтобы рисовать часть дерева отдельно)
function base(n, step){ const chain = []; for (let p = n.parent; p; p = p.parent) chain.unshift(p); let M = [1, 0, 0, 1, 0, 0], z = 0, a = 1; chain.forEach(p => { M = mul(M, local(p, step)); z = p.z !== null ? p.z : z + p.dz; a *= p.a; }); return {M, z, a}; }
function flatten(root, step){
  const out = [], b = base(root, step);
  (function walk(n, M, z, a, dy){ if (!n.vis) return; const m = mul(M, local(n, step)), zz = n.z !== null ? n.z : z + n.dz, aa = a * n.a, dd = dy || !!n.dyn;
    const under = n.kids.filter(k => k.under), over = n.kids.filter(k => !k.under);
    under.forEach(k => walk(k, m, zz, aa, dd)); if (n.sp) out.push({n, m, z: zz, a: aa, dyn: dd}); over.forEach(k => walk(k, m, zz, aa, dd)); })(root, b.M, b.z, b.a, false);
  return out.map((o, i) => ({...o, i})).sort((p, q) => (q.z - p.z) || (p.i - q.i));
}

/* ---------- отрисовка ----------
   cam: {x, y, z, roll}; focus: глубина резкости; t: время */
// тень и расфокус «запекаются» в картинку один раз: в мировых единицах они постоянны,
// а с камерой масштабируются вместе с вырезкой. Узлы dyn (меняют высоту или сильно крутятся) считаются на лету.
function dofK(z, opt){ const f = opt.focus || 0; return Math.abs(z - f) * (z < f ? (opt.dofFront === undefined ? .08 : opt.dofFront) : (opt.dofBack === undefined ? .018 : opt.dofBack)); }
function bake(n, sp, bw){
  const sa = n.shadowA === undefined ? 1 : n.shadowA, key = n.lift.toFixed(1) + '|' + bw.toFixed(1) + '|' + sa;
  sp._bk = sp._bk || {}; if (sp._bk[key]) return sp._bk[key];
  const r = sp.res, d = 1.5 + n.lift * .55, pad = Math.ceil(d * 2.4 + 2 + bw * 2.5);
  const mk = (src, sh) => { const c = document.createElement('canvas'); c.width = sp.c.width + 2 * pad * r; c.height = sp.c.height + 2 * pad * r; const g = c.getContext('2d');
    if (bw * r > .4) g.filter = `blur(${(bw * r).toFixed(1)}px)`;
    if (sh && sa > 0){ g.shadowColor = `rgba(38,22,8,${(.30 * sa).toFixed(3)})`; g.shadowOffsetX = d * .82 * r; g.shadowOffsetY = d * .57 * r; g.shadowBlur = (d * 1.25 + 1) * r; }
    g.drawImage(src, pad * r, pad * r); return c; };
  const bk = {c: mk(sp.c, true), gc: sp.grey ? mk(sp.grey, false) : null, x0: sp.x0 - pad, y0: sp.y0 - pad, res: r};
  sp._bk[key] = bk; return bk;
}
function drawWorld(g, root, cam, t, opt = {}){
  const step = Math.floor(t * 12 + 1e-6), list = flatten(root, step);
  for (const it of list){
    const {n, m, z} = it; const dist = F + z - cam.z; if (dist < 30) continue;
    const a = it.a; if (a <= .003) continue;
    const M = mul(viewM(cam, z), m), sp = n.sp, bw = n.blur !== null ? n.blur : dofK(z, opt);
    if (offscreen(M, sp, 40 + bw * 3)) continue;
    if (!it.dyn){
      const bk = bake(n, sp, bw), k = 1 / bk.res;
      g.setTransform(M[0] * k, M[1] * k, M[2] * k, M[3] * k, M[0] * bk.x0 + M[2] * bk.y0 + M[4], M[1] * bk.x0 + M[3] * bk.y0 + M[5]);
      g.globalAlpha = a; g.drawImage(bk.c, 0, 0);
      if (n.grey > 0 && bk.gc){ g.globalAlpha = a * clamp(n.grey); g.drawImage(bk.gc, 0, 0); }
      if (n.soak > 0 && bk.gc){ g.save(); g.beginPath(); const hh = bk.c.height; g.rect(0, hh * (1 - n.soak), bk.c.width, hh * n.soak + 2); g.clip(); g.globalAlpha = a; g.drawImage(bk.gc, 0, 0); g.restore(); }
      continue;
    }
    const k = 1 / sp.res;
    g.setTransform(M[0] * k, M[1] * k, M[2] * k, M[3] * k, M[0] * sp.x0 + M[2] * sp.y0 + M[4], M[1] * sp.x0 + M[3] * sp.y0 + M[5]);
    const sc = Math.hypot(M[0], M[1]), d = (1.5 + n.lift * .55) * sc;
    g.shadowColor = `rgba(38,22,8,${(.30 * (n.shadowA === undefined ? 1 : n.shadowA)).toFixed(3)})`; g.shadowOffsetX = d * .82; g.shadowOffsetY = d * .57; g.shadowBlur = d * 1.25 + 1;
    const bs = bw * sc; g.filter = bs > .6 ? `blur(${bs.toFixed(1)}px)` : 'none';
    g.globalAlpha = a; g.drawImage(sp.c, 0, 0);
    g.shadowColor = 'transparent';
    if (n.grey > 0 && sp.grey){ g.globalAlpha = a * clamp(n.grey); g.drawImage(sp.grey, 0, 0); }
    if (n.soak > 0 && sp.grey){ g.save(); g.beginPath(); const hh = sp.c.height; g.rect(0, hh * (1 - n.soak), sp.c.width, hh * n.soak + 2); g.clip(); g.globalAlpha = a; g.drawImage(sp.grey, 0, 0); g.restore(); }
    g.filter = 'none';
  }
  g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'none'; g.shadowColor = 'transparent'; g.globalAlpha = 1;
}
// вырезка целиком за краем кадра — не рисуем
function offscreen(M, sp, pad){ let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; [[sp.x0, sp.y0], [sp.x0 + sp.w, sp.y0], [sp.x0, sp.y0 + sp.h], [sp.x0 + sp.w, sp.y0 + sp.h]].forEach(([x, y]) => { const X = M[0] * x + M[2] * y + M[4], Y = M[1] * x + M[3] * y + M[5]; x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); }); const sc = Math.hypot(M[0], M[1]) * pad; return x1 < -sc || y1 < -sc || x0 > W + sc || y0 > H + sc; }
// экранная матрица картинки узла (для масок)
function viewM(cam, z){ const s = F / (F + z - cam.z), cr = Math.cos(cam.roll || 0), sr = Math.sin(cam.roll || 0); return [cr * s, sr * s, -sr * s, cr * s, W / 2 + (-cam.x * cr + cam.y * sr) * s, H / 2 + (-cam.x * sr - cam.y * cr) * s]; }
function spriteM(node, cam, t){ const step = Math.floor(t * 12 + 1e-6), b = base(node, step), m = mul(b.M, local(node, step)), z = node.z !== null ? node.z : b.z + node.dz, M = mul(viewM(cam, z), m), sp = node.sp, k = 1 / sp.res; return [M[0] * k, M[1] * k, M[2] * k, M[3] * k, M[0] * sp.x0 + M[2] * sp.y0 + M[4], M[1] * sp.x0 + M[3] * sp.y0 + M[5]]; }
// экранная проекция точки плана z (для масок и проверок)
function project(cam, x, y, z){ const s = F / (F + z - cam.z), cr = Math.cos(cam.roll || 0), sr = Math.sin(cam.roll || 0), dx = (x - cam.x) * s, dy = (y - cam.y) * s; return [W / 2 + dx * cr - dy * sr, H / 2 + dx * sr + dy * cr, s]; }

/* ---------- кадр с размазом движения: несколько подкадров за выдержку, равные веса ---------- */
function makeCanvas(w = W, h = H){ const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function frameWithBlur(out, renderAt, t, sub, shutter = .5){
  const g = out.getContext('2d');
  if (sub <= 1){ renderAt(g, t, t); return; }
  const tmp = frameWithBlur.tmp || (frameWithBlur.tmp = makeCanvas()), tg = tmp.getContext('2d');
  for (let k = 0; k < sub; k++){ const tt = t + (k / (sub - 1) - .5) * shutter / FPS; tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, W, H); renderAt(tg, tt, t); /* вырезки стоят на месте внутри кадра, размазывается только камера */ g.globalAlpha = 1 / (k + 1); g.drawImage(tmp, 0, 0); }
  g.globalAlpha = 1;
}
// свет и виньетка поверх кадра
function grade(g, warm = 1){
  g.setTransform(1, 0, 0, 1, 0, 0);
  const v = g.createRadialGradient(W * .42, H * .38, H * .2, W * .5, H * .5, H * 1.05); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(30,14,0,.34)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  if (warm){ g.globalCompositeOperation = 'soft-light'; const l = g.createLinearGradient(0, 0, W, H); l.addColorStop(0, `rgba(255,214,150,${.35 * warm})`); l.addColorStop(1, `rgba(40,30,60,${.25 * warm})`); g.fillStyle = l; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; }
}
