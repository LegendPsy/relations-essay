/* Общий набор для эпизодов 2–6: палитра, бумажные человечки, предметы серии.
   Эпизод 1 написан раньше и живёт сам по себе (ep1.js), здесь те же формы, но обобщённые. */
const COL = {
  kraft: '#b48a60', verm: '#d8432e', vermD: '#7e1f12', ochre: '#e2a23b', indigo: '#2e3f7f', indigoD: '#24326a', kalka: '#eef1f2', graphite: '#4c4a48',
  cream: '#f4ecdb', mustard: '#e8b83e', sage: '#9db59a', teal: '#2f6e6c', coral: '#de6b4f', pink: '#e98a8f', sky: '#a9cde3', wood: '#a87a52', navy: '#2b3557',
  mint: '#8fd6b8', blue: '#3c6fc4', blueD: '#24488c', terra: '#c4643f', leaf: '#57966a', leafD: '#3f7d57', orange: '#e58a3a', dusk: '#3b3f6b',
};
const CUES = [];   // события для звука: {t, type, ...}
const cue = (t, type, p = {}) => CUES.push({t, type, ...p});
const toCam = p => ({x: p.x, y: p.y, z: F * (1 - Math.exp(-p.ls)), roll: p.roll || 0});
const at = (tp, t0, d) => clamp((tp - t0) / d);                       // доля пути от t0 за d секунд
const steps = (tp, t0, n, per = 1 / 12) => tp < t0 ? 0 : Math.min(n, Math.floor((tp - t0) / per + 1e-6) + 1) / n;   // n рывков
const pulse = (tp, t0, d) => { const u = (tp - t0) / d; return u < 0 || u > 1 ? 0 : Math.sin(u * Math.PI); };

/* ---------- бумажный человечек ----------
   o: {coat, coatA, coatB, lapel, skin, skinD, hair, pants, shoe, shirt, body: 'A'|'B'|'jacket'|'sweater'|'trench'|'kid', hair: 'A'|'B'|'bob'|'kid'|'helmet'|'hat', k} */
function makePerson(o = {}){
  const C = Object.assign({coat: '#b9ab95', coatA: '#ae9f88', coatB: '#9e907b', lapel: '#837563', skin: '#f1c8a2', skinD: '#e0a982', hairC: '#4a3426', pants: '#3d4560', shoe: '#2c221c', shirt: '#f3ead8', helmet: COL.orange}, o);
  const body = o.body || 'A', hs = o.hair || 'A', res = o.res || 4, hr = o.hr || 10;
  const root = G({sx: o.k || 1, sy: o.k || 1}), hip = G({y: -120}); root.add(hip);
  const leg = len => paper({shape: S.rrect(-12, -6, 12, len, 6), color: C.pants, res, amp: 1.2});
  const shoe = () => paper({shape: S.ell(6, 0, 20, 9), color: C.shoe, res, amp: 1});
  const legs = [-17, 17].map(x => G({x, y: 0}).add(N(leg(116), {lift: 4}), N(shoe(), {y: 118, lift: 3})));
  // сидя: бедро вперёд, голень вниз (вид сбоку условно — короче и шире)
  const legsSit = [-19, 19].map(x => G({x, y: 4, vis: false}).add(N(paper({shape: S.rrect(-14, -10, 14, 100, 10), color: C.pants, res, amp: 1.2}), {lift: 4}), N(shoe(), {y: 103, lift: 3})));
  // рука на двух булавках: плечо и локоть
  const arm = (sgn, col, hand, under) => { const sh = G({x: sgn * 50, y: -205, under}); const up = N(paper({shape: S.band([[0, 0], [sgn * 4, 78]], 30, 27), color: col, res, amp: 1.3}), {lift: under ? 3 : 5});
    const el = G({x: sgn * 4, y: 76}); const fo = N(paper({shape: S.band([[0, 0], [sgn * 3, 74]], 27, 24), color: col, res, amp: 1.3}), {lift: under ? 3 : 5}); const hd = N(paper({shape: S.ell(sgn * 3, 84, 14, 15), color: hand, res, amp: 1}), {lift: under ? 3 : 4});
    const grip = G({x: sgn * 3, y: 84}); el.add(fo, hd, grip); sh.add(up, el); return {sh, el, up, fo, hd, grip}; };
  const armB = arm(-1, C.coatB, C.skinD, true), armF = arm(1, C.coatA, C.skin, false);
  let coatShape;
  if (body === 'A') coatShape = [[-50, -218], [50, -218], [62, -206], [82, 22], [-82, 22], [-62, -206]];
  else if (body === 'B') coatShape = S.rrect(-74, -222, 74, 22, 46, 8);
  else if (body === 'jacket') coatShape = S.rrect(-66, -220, 66, -40, 20, 5);
  else if (body === 'sweater') coatShape = S.rrect(-64, -222, 64, -30, 30, 6);
  else if (body === 'trench') coatShape = [[-46, -218], [46, -218], [60, -200], [88, 40], [-88, 40], [-60, -200]];
  else coatShape = S.rrect(-58, -222, 58, -20, 26, 6);
  const coat = N(paper({shape: coatShape, color: C.coat, res, amp: 1.6, grey: true, greyFilter: o.greyFilter || 'grayscale(1) brightness(.62)', deco: o.coatDeco}), {lift: 5});
  const parts = [];
  if (body === 'A' || body === 'trench'){
    parts.push(N(paper({shape: [[-22, -218], [22, -218], [0, -150]], color: C.shirt, res, amp: 1}), {lift: 1.5}));
    parts.push(N(paper({shape: [[-4, -217], [-42, -214], [-14, -128]], color: C.lapel, res, amp: 1}), {lift: 2.5}));
    parts.push(N(paper({shape: [[4, -217], [42, -214], [14, -128]], color: o.lapelR || C.lapel, res, amp: 1}), {lift: 2.5}));
    [-110, -66].forEach(y => parts.push(N(paper({shape: S.ell(0, y, 5, 5, 10), color: '#4b3729', res, amp: .5}), {lift: 1.5})));
    if (body === 'trench') parts.push(N(paper({shape: S.rect(-70, -96, 70, -80), color: C.coatB, res, amp: 1}), {lift: 2}));
  } else if (body === 'B'){
    parts.push(N(paper({shape: S.ell(0, -214, 30, 14, 20), color: C.shirt, res, amp: 1}), {lift: 1.5}));
    [-150, -100, -50].forEach(y => parts.push(N(paper({shape: S.ell(0, y, 7, 7, 12), color: C.lapel, res, amp: .6}), {lift: 1.5})));
  } else if (body === 'jacket'){
    parts.push(N(paper({shape: S.rect(-66, -150, 66, -128), color: o.stripe || '#f6efe0', res, amp: 1}), {lift: 1.5}));
    parts.push(N(paper({shape: S.rect(-5, -218, 5, -44), color: C.coatB, res, amp: .6}), {lift: 1.5}));
  } else if (body === 'sweater'){
    parts.push(N(paper({shape: S.ell(0, -216, 26, 10, 18), color: C.coatB, res, amp: 1}), {lift: 1.5}));
    parts.push(N(paper({shape: S.rect(-64, -60, 64, -36), color: C.coatB, res, amp: 1}), {lift: 1.5}));
  } else if (body === 'kid'){
    parts.push(N(paper({shape: S.rect(-58, -150, 58, -124), color: o.stripe || '#f6efe0', res, amp: 1}), {lift: 1.5}));
  }
  const neck = N(paper({shape: S.rect(-11, -246, 11, -210), color: C.skinD, res, amp: .8}), {lift: 2});
  // голова
  const head = G({y: -282}), R = o.R || 58;
  const face = N(paper({shape: S.ell(0, 0, R, R * (o.faceY || 1), 56), color: C.skin, res: hr, amp: 1.1}), {lift: 4});
  const ears = [-1, 1].map(s => N(paper({shape: S.ell(s * (R - 2), 6, 11, 15, 16), color: C.skinD, res: hr, amp: .8}), {lift: 3}));
  const eye = x => G({x, y: 4}).add(N(paper({shape: S.ell(0, 0, 6.8, 7.4, 16), color: '#2a2320', res: hr, amp: .4, deco: g => { g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.arc(-2, -3, 2, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.18)'; [[-2, 2], [2, 2]].forEach(([a, b]) => { g.beginPath(); g.arc(a, b, 1.2, 0, TAU); g.fill(); }); }}), {lift: 1.5}));
  const eyeL = eye(-21), eyeR = eye(21);
  const brow = sgn => G({x: sgn * 21, y: -16}).add(N(paper({shape: S.band([[-11, 1], [0, -1.5], [11, 1]], 4.5, 4), color: o.browC || '#3a2a1f', res: hr, amp: .4}), {lift: 1.5}));
  const browL = brow(-1), browR = brow(1);
  const cheeks = [-31, 31].map(x => N(paper({shape: S.ell(x, 24, 10, 6, 14), color: '#ec9f95', alpha: .55, res: hr, amp: .5, edge: false}), {lift: .5, shadowA: 0}));
  const nose = N(paper({shape: S.ell(4, 18, 6, 5, 12), color: C.skinD, res: hr, amp: .5}), {lift: 1.5});
  const mc = '#7d3b2f';
  const mouths = {
    flat: N(paper({shape: S.band([[-10, 0], [-2, 2], [6, 0]], 3.6, 3.6), color: mc, res: hr, amp: .3}), {y: 33, lift: 1}),
    smile: N(paper({shape: S.band(S.arc(0, -6, 14, 10, .35, Math.PI - .35, 10), 4, 4), color: mc, res: hr, amp: .3}), {y: 33, lift: 1, vis: false}),
    grin: N(paper({shape: S.arc(0, -4, 15, 13, 0, Math.PI, 14), color: mc, res: hr, amp: .3}), {y: 33, lift: 1, vis: false}),
    frown: N(paper({shape: S.band(S.arc(0, 10, 13, 9, Math.PI + .45, TAU - .45, 10), 4, 4), color: mc, res: hr, amp: .3}), {y: 33, lift: 1, vis: false}),
    o: N(paper({shape: S.ell(0, 2, 6, 8, 14), color: mc, res: hr, amp: .3}), {y: 33, lift: 1, vis: false}),
  };
  const hairNodes = [], backHair = [];
  const H = (sp, ov) => { const n = N(sp, ov); hairNodes.push(n); return n; };
  if (hs === 'A') H(paper({shape: S.arc(0, -4, R + 5, R + 3, Math.PI * 1.08, Math.PI * 1.92, 30).concat([[46, -30], [26, -36], [8, -26], [-12, -38], [-34, -30], [-50, -24]]), color: C.hairC, res: hr, amp: 1.2}), {lift: 3});
  else if (hs === 'B'){ [[-40, -40, 22], [-14, -56, 24], [14, -58, 24], [40, -42, 22], [54, -14, 16], [-54, -16, 16]].forEach(([x, y, r]) => H(paper({shape: S.ell(x, y, r, r, 20), color: C.hairC, res: hr, amp: 1}), {lift: 3})); }
  else if (hs === 'bob'){ backHair.push(N(paper({shape: S.rrect(-R - 14, -R - 8, R + 14, R * 1.05, R * .6, 8), color: C.hairC, res: hr, amp: 1.2}), {lift: 3})); H(paper({shape: S.arc(0, -4, R + 6, R + 4, Math.PI * 1.02, Math.PI * 1.98, 26).concat([[44, -26], [10, -18], [-26, -30], [-52, -14]]), color: C.hairC, res: hr, amp: 1.2}), {lift: 3}); }
  else if (hs === 'kid'){ H(paper({shape: S.arc(0, -6, R + 4, R + 2, Math.PI * 1.05, Math.PI * 1.95, 24).concat([[40, -34], [10, -30], [-20, -38], [-46, -26]]), color: C.hairC, res: hr, amp: 1.2}), {lift: 3}); H(paper({shape: S.band([[0, -R - 2], [6, -R - 16], [16, -R - 20]], 6, 3), color: C.hairC, res: hr, amp: .6}), {lift: 3}); }
  else if (hs === 'helmet'){ H(paper({shape: S.arc(0, -8, R + 10, R + 8, Math.PI * 1.0, Math.PI * 2.0, 30).concat([[R + 14, -2], [-R - 10, -2]]), color: C.helmet, res: hr, amp: 1.2, deco: g => { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-8, -80, 16, 76); }}), {lift: 4}); H(paper({shape: S.rect(-R - 6, -12, R + 18, 0), color: '#2c2a2a', res: hr, amp: .8}), {lift: 4.5}); }
  else if (hs === 'hat'){ H(paper({shape: S.rect(-R - 22, -40, R + 22, -28), color: C.hairC, res: hr, amp: 1}), {lift: 4}); H(paper({shape: S.rrect(-R + 6, -96, R - 6, -34, 10), color: C.hairC, res: hr, amp: 1}), {lift: 4}); }
  head.add(G({under: true}).add(...backHair, ...ears), face, eyeL, eyeR, browL, browR, ...cheeks, nose, ...Object.values(mouths), ...hairNodes);
  hip.add(...legs, ...legsSit, armB.sh, coat, ...parts, neck, head, armF.sh);
  const p = {root, hip, legs, legsSit, armB, armF, coat, parts, head, face, eyeL, eyeR, browL, browR, cheeks, mouths, hairNodes, C};
  return p;
}
// выражение лица: рот подменяется вырезкой, брови поворачиваются на булавках
function face(p, mood){
  const m = {calm: 'flat', smile: 'smile', grin: 'grin', annoyed: 'frown', angry: 'frown', sad: 'frown', wow: 'o', proud: 'smile', flat: 'flat'}[mood] || 'flat';
  Object.entries(p.mouths).forEach(([k, n]) => n.vis = k === m);
  const br = {annoyed: .22, angry: .34, sad: -.22, wow: -.12, proud: .1, smile: -.06, grin: -.1}[mood] || 0;
  p.browL.r = br; p.browR.r = -br; p.browL.y = p.browR.y = -16 + (mood === 'angry' ? 3 : mood === 'wow' ? -5 : mood === 'sad' ? -2 : 0);
  const e = mood === 'wow' ? 1.3 : 1; p.eyeL.sx = p.eyeL.sy = p.eyeR.sx = p.eyeR.sy = e;
}
// шаг рывками: ноги, руки, лёгкий подскок
function walkPose(p, on, ph, amp = 1){
  p.legs[0].r = on ? (ph % 2 ? .24 : -.18) * amp : 0; p.legs[1].r = on ? (ph % 2 ? -.18 : .24) * amp : 0;
  p.hip.y = -120 + (on && ph % 2 ? -5 : 0);
  p.armF.sh.r = on ? (ph % 2 ? -.16 : .12) * amp : 0; p.armB.sh.r = on ? (ph % 2 ? .12 : -.14) * amp : 0;
  p.armF.el.r = on ? -.1 : 0; p.armB.el.r = on ? .1 : 0;
}
function sitPose(p, s){ p.legs.forEach(l => l.vis = !s); p.legsSit.forEach(l => l.vis = s); if (s) p.hip.y = -108; }
function armPose(p, bS, bE, fS, fE){ p.armB.sh.r = bS; p.armB.el.r = bE; p.armF.sh.r = fS; p.armF.el.r = fE; }

/* ---------- предметы серии ---------- */
function makeRays(n, len, c1 = COL.mustard, c2 = '#f4d27a'){
  const root = G({dz: 6, a: 0});
  const rays = Array.from({length: n}, (_, i) => N(paper({shape: [[16, -13], [len * .62, -15], [len * .9, -8], [len, 0], [len * .9, 8], [len * .62, 15], [16, 13]], color: i % 2 ? c1 : c2, res: 2, amp: 1.2}), {lift: 3, shadowA: .6}));
  root.add(...rays); return {root, rays};
}
// веер лучей раскрывается поворотом на булавке, четыре рывка
function fan(R, tp, t0, rot = 0, close = 1e9){
  const k = tp < t0 ? 0 : Math.min(1, (Math.floor((tp - t0) * 12) + 1) / 4), kc = tp < close ? 1 : 1 - Math.min(1, (Math.floor((tp - close) * 12) + 1) / 3), kk = k * kc;
  R.root.a = kk > 0 ? 1 : 0;
  R.rays.forEach((r, i) => { const fin = rot + i / R.rays.length * TAU + (tp - t0 > .4 ? Math.floor((tp - t0) * 3) * .05 : 0); r.r = lerp(-Math.PI / 2, fin, kk); r.sx = .4 + .6 * kk; });
}
function makeCup(k = 1, res = 3){
  const root = G({sx: k, sy: k});
  const body = N(paper({shape: S.rrect(-26, -56, 26, 0, 9), color: '#f6f0e4', res, amp: 1.2, grey: true, deco: g => { g.fillStyle = '#5b86b5'; g.fillRect(-30, -34, 60, 9); }}), {lift: 6});
  const handle = N(paper({shape: S.ell(30, -30, 16, 15, 20), holes: [S.ell(30, -30, 8, 8, 14)], color: '#f0e8da', res, amp: 1, grey: true}), {lift: 5, under: true});
  const tea = N(paper({shape: S.ell(0, -54, 22, 6, 20), color: '#7a4a2a', res, amp: .8, grey: true}), {lift: 2});
  const steam = makeSteam(res);
  root.add(handle, body, tea, ...steam);
  return {root, body, handle, tea, steam, grey: [body, handle, tea]};
}
function makeSteam(res = 3, xs = [-10, 4, 16], y0 = -66, h = 11){
  return xs.map((x, i) => { const pts = Array.from({length: 9}, (_, j) => [x + Math.sin(j * .9 + i) * 9, y0 - j * h]); return G({}).add(N(paper({shape: S.band(pts, 7, 3), color: '#fffaf0', alpha: .9, res, amp: .8}), {lift: 3, shadowA: .5}), N(paper({shape: S.band(pts.map(([px, py], j) => [px + Math.sin(j * .9 + i + 1.6) * 6, py]), 7, 3), color: '#fffaf0', alpha: .9, res, amp: .8}), {lift: 3, shadowA: .5, vis: false})); });
}
function steamTick(steam, sp, on, rise = 2){ steam.forEach((s, i) => { s.vis = on; const q = (sp + i * 4) % 12; s.y = -q * rise; s.a = q < 9 ? 1 : (12 - q) / 3; s.kids[0].vis = Math.floor((sp + i) / 3) % 2 === 0; s.kids[1].vis = !s.kids[0].vis; }); }
// коробка с крышкой и бантом; стружка и комок — для «осыпается серой стружкой»
function makeBox(w = 104, h = 88, color = COL.orange, rib = COL.mustard, o = {}){
  const root = G({});
  const gf = 'grayscale(1) brightness(.72) contrast(.8)';
  const box = N(paper({shape: o.shape || S.rect(-w / 2, -h, w / 2, 0), color, res: o.res || 3, amp: 1.4, grey: true, greyFilter: gf, deco: g => { g.fillStyle = rib; g.fillRect(-9, -h - 30, 18, h + 40); g.fillStyle = 'rgba(80,30,0,.12)'; g.fillRect(-w / 2 - 20, -h, w + 40, 10); }}), {lift: 7});
  const lid = G({x: -w / 2 - 5, y: -h});
  lid.add(N(paper({shape: S.rect(0, -18, w + 10, 2), color: o.lidC || shade(color), res: o.res || 3, amp: 1.2, grey: true, greyFilter: gf, deco: g => { g.fillStyle = rib; g.fillRect(w / 2 - 4, -20, 18, 24); }}), {lift: 7.5}),
          N(paper({shape: S.ell(w / 2 - 12, -26, 17, 11, 18), holes: [S.ell(w / 2 - 12, -26, 7, 4, 12)], color: rib, res: o.res || 3, amp: 1, grey: true, greyFilter: gf}), {lift: 8.5}),
          N(paper({shape: S.ell(w / 2 + 22, -26, 17, 11, 18), holes: [S.ell(w / 2 + 22, -26, 7, 4, 12)], color: rib, res: o.res || 3, amp: 1, grey: true, greyFilter: gf}), {lift: 8.5}));
  const lump = N(paper({shape: S.ell(0, -h * .4, w * .38, h * .36, 16), color: '#9c9892', res: o.res || 3, amp: 3.4, deco: g => { g.strokeStyle = 'rgba(60,60,60,.35)'; g.lineWidth = 2; for (let k = 0; k < 6; k++){ g.beginPath(); g.moveTo(-w * .3 + k * 9, -h * .7); g.lineTo(-w * .1 + k * 7, -h * .2); g.stroke(); } }}), {lift: 7, vis: false});
  const chips = Array.from({length: 10}, (_, i) => N(paper({shape: S.band([[0, 0], [8, 6], [16, 2], [24, 9]], 8, 5), color: i % 2 ? '#a7a29b' : '#8e8a84', res: 3, amp: .8}), {lift: 5, vis: false, dyn: true}));
  root.add(box, lid, lump, ...chips);
  return {root, box, lid, lump, chips, w, h, grey: [box, ...lid.kids]};
}
function shade(hex, k = .82){ const n = parseInt(hex.slice(1), 16); const f = v => Math.round(v * k).toString(16).padStart(2, '0'); return '#' + f(n >> 16) + f((n >> 8) & 255) + f(n & 255); }
// стружка осыпается: k от 0 до 1
function crumble(B, k, seed = 1){
  B.chips.forEach((c, i) => { c.vis = k > 0 && k < 1; const r = hash(seed, i), q = hash(seed + 9, i); c.x = (r - .5) * B.w * 1.1 + (r - .5) * 60 * k; c.y = -B.h * (.2 + q * .8) + k * k * (220 + q * 160); c.r = k * (r - .5) * 9; c.a = 1 - k * .6; });
}
// красная планка нормы: тёмная подкладка и наждачная красная полоса с заклёпками
function makePlank(w = 980, h = 120, o = {}){
  const root = G({});
  const under = N(paper({shape: S.rect(-w / 2 - 6, -h / 2 + 8, w / 2 + 6, h / 2 + 8), color: o.colorD || COL.vermD, res: o.res || 1.4, amp: 2}), {y: 4, lift: 4});
  const face = N(paper({shape: S.rect(-w / 2, -h / 2, w / 2, h / 2), color: o.color || '#cf3b27', res: o.res || 1.4, amp: 2.2, grey: true, texScale: .7, deco: g => { const q = rng(19); g.strokeStyle = 'rgba(90,10,0,.22)'; g.lineWidth = 2; for (let i = 0; i < w / 25; i++){ const y = -h / 2 + 8 + q() * (h - 16), x = -w / 2 + q() * (w - 60); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 30 + q() * 60, y + (q() - .5) * 4); g.stroke(); } g.fillStyle = 'rgba(90,10,0,.2)'; for (let i = 0; i < w * h / 120; i++) g.fillRect(-w / 2 + q() * w, -h / 2 + q() * h, 2, 2); }}), {lift: 10});
  const pins = (o.pins === false ? [] : [-w / 2 + 34, w / 2 - 34]).map(x => G({x, y: -4}).add(N(paper({shape: S.ell(0, 0, 13, 13), color: '#c9a24a', res: 3, amp: .8, deco: g => { g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(-4, -5, 5, 3, -.6, 0, TAU); g.fill(); }}), {lift: 6})));
  root.add(under, face, ...pins);
  return {root, under, face, pins, w, h};
}
// бумажное облачко мысли
function makeBubble(rx = 150, ry = 100, color = '#f6f1e6'){
  const root = G({});
  const pts = []; const n = 9; for (let k = 0; k < n; k++){ const a = k / n * TAU; pts.push(...S.arc(Math.cos(a) * rx * .78, Math.sin(a) * ry * .74, rx * .36, ry * .4, a - 1.3, a + 1.3, 8)); }
  root.add(N(paper({shape: pts, color, res: 2, amp: 1.4}), {lift: 8}), N(paper({shape: S.ell(-rx * .55, ry * 1.05, 18, 14, 16), color, res: 2, amp: 1}), {lift: 8}), N(paper({shape: S.ell(-rx * .8, ry * 1.4, 10, 8, 12), color, res: 2, amp: .8}), {lift: 8}));
  return root;
}
// фасад дома с аркой подъезда и окнами; окна можно зажигать
function makeFacade(o = {}){
  const w = o.w || 900, h = o.h || 1200, root = G({x: o.x || 0, y: o.y || 0, z: o.z === undefined ? 80 : o.z});
  const wins = [], lights = [];
  const holes = [], ww = 110, wh = 150;
  const cols = o.cols || [-280, 0, 280], rows = o.rows || [-1000, -760, -520];
  rows.forEach(y => cols.forEach(x => holes.push(S.rect(x - ww / 2, y, x + ww / 2, y + wh))));
  const arch = [...S.rect(-90, -300, 90, 0).slice(0, 0), [-90, 0], [-90, -220], ...S.arc(0, -220, 90, 80, Math.PI, TAU, 14), [90, -220], [90, 0]];
  const wall = N(paper({shape: S.rect(-w / 2, -h, w / 2, 0), holes: [...holes, arch], color: o.color || '#d9b48c', res: o.res || .8, amp: 3, grey: true, deco: (g, b) => { g.fillStyle = 'rgba(120,70,40,.10)'; for (let y = -h; y < 0; y += 46) g.fillRect(-w / 2, y, w, 3); }}), {lift: 6});
  // глубина окон: тёмное стекло и тёплый свет позади стены
  holes.forEach(([[x0, y0], [x1], [, y1]], i) => { const d = N(paper({shape: S.rect(x0 - 8, y0 - 8, x1 + 8, y1 + 8), color: '#3b3a4c', res: .8, amp: 1.5}), {dz: 2, lift: 1}); const l = N(paper({shape: S.rect(x0 - 8, y0 - 8, x1 + 8, y1 + 8), color: '#ffcf6e', res: .8, amp: 1.5, deco: g => { g.fillStyle = 'rgba(255,255,230,.5)'; g.fillRect(x0 + 10, y0 + 10, 26, y1 - y0 - 20); }}), {dz: 1.8, lift: 1, a: 0}); wins.push(d); lights.push(l); });
  const door = N(paper({shape: [[-90, 0], [-90, -220], ...S.arc(0, -220, 90, 80, Math.PI, TAU, 14), [90, -220], [90, 0]], color: o.door || '#4a3a30', res: .8, amp: 2}), {dz: 2, lift: 1});
  const frames = holes.map(([[x0, y0], [x1], [, y1]]) => N(paper({shape: S.rect(x0 - 14, y1, x1 + 14, y1 + 14), color: '#f1e6cf', res: .8, amp: 1.5}), {lift: 7}));
  const roof = N(paper({shape: S.rect(-w / 2 - 30, -h - 40, w / 2 + 30, -h + 10), color: o.roof || '#8e4a3a', res: .8, amp: 2.4}), {lift: 8});
  const lamp = N(paper({shape: S.ell(0, -330, 18, 12, 14), color: '#ffe3a0', res: 1, amp: 1}), {lift: 8});
  root.add(...wins, ...lights, door, wall, ...frames, roof, lamp);
  return {root, wall, wins, lights, door, frames, roof, lamp};
}
// мопед курьера: dir = 1 смотрит вправо, -1 влево; колёса крутятся рывками
function makeMoped(color = '#7fb2d6', dir = 1, k = 1){
  const M = pts => (dir < 0 ? S.mirror(pts) : pts).map(([x, y]) => [x * k, y * k]), X = x => x * dir * k;
  const root = G({});
  const wheel = x => G({x: X(x), y: -44 * k, dyn: true}).add(N(paper({shape: S.ell(0, 0, 44 * k, 44 * k, 32), holes: [S.ell(0, 0, 18 * k, 18 * k, 16)], color: '#27242a', res: 3, amp: 1.2}), {lift: 4}), N(paper({shape: S.rect(-3, -18 * k, 3, 18 * k), color: '#9aa0a6', res: 3, amp: .5}), {lift: 3}), N(paper({shape: S.rect(-18 * k, -3, 18 * k, 3), color: '#9aa0a6', res: 3, amp: .5}), {lift: 3}));
  const wB = wheel(-120), wF = wheel(130);
  const body = N(paper({shape: M([[-170, -70], [-60, -70], [-20, -120], [70, -120], [120, -70], [150, -60], [140, -40], [-170, -40]]), color, res: 3, amp: 1.6, deco: g => { g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect((dir > 0 ? -160 : 40) * k, -70 * k, 120 * k, 8 * k); }}), {lift: 6});
  const seat = N(paper({shape: M(S.rrect(-140, -96, -30, -72, 10)), color: '#2c2a2a', res: 3, amp: 1}), {lift: 7});
  const fork = N(paper({shape: M(S.band([[130, -44], [100, -180]], 14, 12)), color: '#6d6f75', res: 3, amp: .8}), {lift: 5});
  const bar = N(paper({shape: M(S.band([[90, -184], [140, -190]], 12, 10)), color: '#2c2a2a', res: 3, amp: .6}), {lift: 6});
  const light = N(paper({shape: S.ell(X(124), -150 * k, 14 * k, 12 * k, 14), color: '#ffe6a3', res: 3, amp: .8}), {lift: 7});
  const crate = N(paper({shape: M(S.rect(-214, -176, -104, -78)), color: '#e9b14a', res: 3, amp: 1.4, deco: g => { g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 3; g.strokeRect((dir > 0 ? -204 : 114) * k, -166 * k, 90 * k, 78 * k); }}), {lift: 6});
  root.add(wB, wF, crate, body, seat, fork, bar, light);
  return {root, wB, wF, body, light, crate, k, seatX: X(-85), seatY: -96 * k};
}
// ветки-кулиса
function makeTwigs(seed = 3, color = ['#2f5b3f', '#3a6b4a']){
  const g0 = G({}); const r = rng(seed);
  [[0, 0, .4], [-120, 60, .9], [-260, 30, .2], [-60, 160, 1.3], [-340, 120, .7]].forEach(([x, y, a], i) => g0.add(N(paper({shape: S.band([[0, 0], [60, -30], [130, -10]], 56, 4), color: color[i % 2], res: .6, amp: 2}), {x, y, r: a + 2.4 + (r() - .5) * .3, lift: 5})));
  g0.add(N(paper({shape: S.band([[200, -80], [0, 40], [-380, 150]], 22, 10), color: '#3b2a1f', res: .6, amp: 2}), {lift: 4}));
  return g0;
}
function makeTree(h = 520, c = COL.leaf){
  const root = G({});
  root.add(N(paper({shape: S.band([[0, 0], [6, -h * .5], [-4, -h * .8]], 34, 18), color: '#5a3d2c', res: 1, amp: 1.6}), {lift: 4}));
  [[-60, -h * .82, 120], [50, -h * .9, 130], [0, -h * 1.08, 140], [-90, -h * 1.0, 90], [90, -h * 1.02, 96]].forEach(([x, y, r], i) => root.add(N(paper({shape: S.ell(x, y, r, r * .86, 26), color: i % 2 ? c : COL.leafD, res: 1, amp: 3, grey: true}), {lift: 6 + i})));
  return root;
}
function makeCloud(w = 420, color = '#f4efe6'){
  const pts = []; [[-.6, .1, .32], [-.25, -.15, .4], [.15, -.2, .38], [.5, 0, .3], [0, .15, .45]].forEach(([x, y, r]) => pts.push(S.ell(x * w, y * w, r * w, r * w * .6, 24)));
  const root = G({}); pts.forEach((p, i) => root.add(N(paper({shape: p, color, res: .8, amp: 2.6, grey: true}), {lift: 4 + i * .4}))); return root;
}
// размытие на выдержку: сколько подкадров нужно при такой скорости камеры
function subForPath(camAt, t){ const d = .02, p0 = camAt(t - d), p1 = camAt(t + d); const v = Math.hypot(p1.x - p0.x, p1.y - p0.y) * Math.exp(p1.ls) / (2 * d) + Math.abs(p1.ls - p0.ls) / (2 * d) * 900 + Math.abs((p1.roll || 0) - (p0.roll || 0)) / (2 * d) * 1400; return v > 1400 ? 7 : v > 900 ? 5 : v > 350 ? 3 : 1; }
// круглое «окно» в другой мир: мир B рисуется внутри маски-вырезки
let MC = null;
function drawThrough(g, worldB, camB, maskNode, camA, t){
  MC = MC || makeCanvas(); const ig = MC.getContext('2d'); ig.setTransform(1, 0, 0, 1, 0, 0); ig.globalCompositeOperation = 'source-over'; ig.clearRect(0, 0, W, H);
  drawWorld(ig, worldB, camB, t);
  ig.globalCompositeOperation = 'destination-in'; const v = maskNode.vis; maskNode.vis = true; const M = spriteM(maskNode, camA, t); maskNode.vis = v; ig.setTransform(...M); ig.drawImage(maskNode.sp.c, 0, 0); ig.setTransform(1, 0, 0, 1, 0, 0); ig.globalCompositeOperation = 'source-over';
  g.drawImage(MC, 0, 0);
}
// мировые координаты узла (для передачи предметов из рук в руки)
function worldOf(node, step){ const b = base(node, step), m = mul(b.M, local(node, step)); return [m[4], m[5]]; }
// колючка-репейник: серый бумажный ёжик
function makeBurr(r = 34, color = '#8a8784'){
  const g0 = G({dyn: true}); g0.add(N(paper({shape: S.star(0, 0, r, r * .58, 11, .2), color, res: 2, amp: 1.2}), {lift: 6}), N(paper({shape: S.ell(0, 0, r * .5, r * .5, 14), color: shade(color, .85), res: 2, amp: 1}), {lift: 6.5}));
  return g0;
}
// солнце: диск и лучи-лепестки
function makeSun(r = 110){
  const root = G({}); const rays = makeRays(12, r * 1.9, COL.mustard, '#f6d77e'); rays.root.dz = 1; rays.root.a = 1;
  rays.rays.forEach((ray, i) => { ray.r = i / 12 * TAU; });
  root.add(rays.root, N(paper({shape: S.ell(0, 0, r, r, 40), color: '#f2b43c', res: 1.4, amp: 1.6, deco: g => { g.fillStyle = 'rgba(255,240,190,.35)'; g.beginPath(); g.ellipse(-r * .3, -r * .3, r * .45, r * .3, -.6, 0, TAU); g.fill(); }}), {lift: 8}));
  return {root, rays};
}
// синий щит-зонтик: купол из клиньев и ручка (сложенный и раскрытый — подмена фазы)
function makeShield(r = 120){
  const root = G({});
  const open = G({}); for (let k = 0; k < 5; k++){ const a0 = Math.PI + k / 5 * Math.PI, a1 = Math.PI + (k + 1) / 5 * Math.PI; open.add(N(paper({shape: [[0, 0], ...S.arc(0, 0, r, r * .78, a0, a1, 6)], color: k % 2 ? COL.blue : '#4f82d6', res: 2, amp: 1.2}), {lift: 7})); }
  const handle = N(paper({shape: S.band([[0, -4], [0, r * .9], [-14, r * 1.02], [-26, r * .92]], 9, 9), color: '#2f2a28', res: 2, amp: .6}), {lift: 6, under: true});
  const closed = N(paper({shape: [[0, -r * .1], [r * .16, r * .55], [-r * .16, r * .55]], color: COL.blue, res: 2, amp: 1}), {lift: 7, vis: false});
  root.add(handle, open, closed);
  return {root, open, closed, handle};
}
