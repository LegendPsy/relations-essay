/* Эпизод 6 «Возвращение курьера» — к части 5 (подкрепление). 44 секунды.
   Нить: золотой огонёк благодарности. Он переходит от героя к прохожему, бежит по окнам вечерней улицы,
   а в том же дворе из второго ролика красная планка складывается в звезду для курьера. */
const DUR = 44, BEAT = .625;
const SHOPX = 1100, X6 = 5800;   // магазин на улице и двор из второго ролика
let FARW, FARGLOW, WORLD, GLOW, NC, AC, HA, PB, PBw, OL, CU, MP, BX, E6 = {}, FAC = [];

const hero6 = () => makePerson({coat: '#d6b27a', coatA: '#cda872', coatB: '#b8955f', lapel: '#c9a46e', lapelR: COL.blue});
const passer = (warm) => makePerson(warm ? {body: 'trench', hair: 'hat', coat: '#d9a24a', coatA: '#cf9840', coatB: '#b98232', hairC: '#7a4a2a', pants: '#4a4a52'} : {body: 'trench', hair: 'hat', coat: '#9a9894', coatA: '#908e8a', coatB: '#7f7d79', hairC: '#4a4a50', pants: '#4a4a52'});
// тёплый двойник повторяет позу серого вырезка в вырезку (подмена фазы, без морфинга)
function copyPose(a, b){ (function walk(x, y){ y.x = x.x; y.y = x.y; y.r = x.r; y.sx = x.sx; y.sy = x.sy; y.vis = x.vis; y.z = x.z; x.kids.forEach((k, i) => { if (y.kids[i]) walk(k, y.kids[i]); }); })(a.root, b.root); }
const lady = () => makePerson({body: 'B', hair: 'bob', k: .94, coat: '#a77f9a', coatA: '#9c7490', coatB: '#8a6680', lapel: '#7a5870', hairC: '#c9c6c0', skin: '#efc6a6', pants: '#5a5068'});
const courier = () => makePerson({body: 'jacket', hair: 'helmet', coat: '#3f8f86', coatA: '#3a857c', coatB: '#2f7068', helmet: '#f2b84e', pants: '#3b3f4f'});
const rhomb = (s = 1, c = '#f6c84a') => [[0, -24 * s], [15 * s, 0], [0, 24 * s], [-15 * s, 0]];
// свечение для слоя огней: рисуется поверх вечернего тона, поэтому остаётся ярким
const glowN = (rx, ry, c = '#ffd47a', al = .5) => G({}).add(...[[1, .32], [.66, .45], [.38, .6]].map(([k, q]) => N(paper({shape: S.ell(0, 0, rx * k, ry * k, 30), color: c, alpha: al * q, res: .6, amp: 0, edge: false, tex: 0}), {lift: .5, shadowA: 0})));

function build(){
  GRAIN = makeGrain(13);
  FARW = G({z: 0}); FARGLOW = G({z: 0}); WORLD = G({z: 0}); GLOW = G({z: 0});
  FARW.add(N(paper({shape: S.rect(-6000, -6000, 12000, 3000), color: COL.kraft, amp: 0, res: .25, edge: false, texScale: 3}), {z: 150}));
  FARW.add(N(paper({shape: S.rect(-5000, -4200, 11000, 320), color: '#cfe0e6', res: .25, amp: 6}), {z: 125, lift: 2}));
  E6.dusk = N(paper({shape: S.rect(-5000, -4200, 11000, 320), color: '#3c4677', res: .25, amp: 6}), {z: 124, lift: 2, a: 0});
  FARW.add(E6.dusk);
  E6.moon = N(paper({shape: S.ell(0, 0, 130, 130, 40), holes: [S.ell(54, -34, 110, 110, 36)], color: '#f3ecd2', res: .8, amp: 2}), {x: 1200, y: -2600, z: 122, lift: 4, a: 0});
  E6.stars = Array.from({length: 26}, (_, i) => N(paper({shape: S.star(0, 0, 24, 8, 4), color: '#f6efd6', res: 2, amp: .8}), {x: -2600 + (i * 977) % 9600, y: -3600 + (i * 613) % 2200, z: 122, lift: 3, r: i * .4, a: 0}));
  FARW.add(E6.moon, ...E6.stars);
  [[-1200, -2200, 420], [2200, -2600, 520], [4600, -2100, 400], [7000, -2500, 460]].forEach(([x, y, w]) => { const c = makeCloud(w); c.x = x; c.y = y; c.z = 118; FARW.add(c); });
  // дальний город: два ряда силуэтов с окошками (огни зажигаются вечером)
  E6.farLights = [];
  [[112, '#b9b8c8', 1400, 1900, 7], [100, '#a9a8bd', 900, 1400, 11]].forEach(([z, c, h0, h1, seed]) => {
    const r = rng(seed); let x = -3200;
    while (x < 9400){ const w = 260 + r() * 320, h = h0 + r() * (h1 - h0), x0 = x;
      FARW.add(N(paper({shape: [[x0, 300], [x0, -h + 300], [x0 + w * .3, -h + 300 - (r() < .3 ? 120 : 0)], [x0 + w, -h + 300], [x0 + w, 300]], color: c, res: .3, amp: 3}), {z, lift: 3}));
      const lit = N(paper({shape: S.rect(x0, -h + 300, x0 + w, 300), color: '#ffd47a', alpha: 0, res: .3, amp: 0, edge: false, tex: 0, deco: g => { const q = rng(seed + Math.floor(x0)); g.globalAlpha = 1; for (let y = -h + 360; y < 200; y += 90) for (let xx = x0 + 30; xx < x0 + w - 40; xx += 70) if (q() < .45){ g.fillStyle = '#ffd47a'; g.fillRect(xx, y, 26, 34); } }}), {z: z - 1, lift: 0, shadowA: 0, a: 0});
      FARGLOW.add(lit); E6.farLights.push(lit);
      x += w + 20 + r() * 60; }
  });

  // ряд фасадов от улицы с магазином до двора
  const row = [[-1500, '#c9a07a', '#6f4a3a'], [-600, '#d9b48c', '#8e4a3a'], [SHOPX, '#c98f6a', '#5f3a30'], [2100, '#d7c08f', '#7a4a3a'], [3000, '#c79a86', '#6f4a3a'], [3900, '#d2b08a', '#8e4a3a'], [X6 - 700, '#d9b48c', '#8e4a3a'], [X6 + 700, '#d9b48c', '#8e4a3a'], [X6 + 1600, '#c9a07a', '#6f4a3a']];
  row.forEach(([x, c, roof], i) => { const f = makeFacade({x, y: 300, z: 80, color: c, roof, w: i === 2 ? 1000 : 880, cols: [-280, 0, 280]}); WORLD.add(f.root); f.x = x; FAC.push(f); });
  // улица: дерево и фонарь в просвете, тротуар
  [[250, 560], [X6, 600], [X6 + 1150, 520]].forEach(([x, h]) => { const tr = makeTree(h, '#6aa36f'); tr.x = x; tr.y = 300; tr.z = 72; WORLD.add(tr); });
  const bush = G({x: X6, y: 300, z: 60}); [[-90, -40, 80], [0, -60, 96], [90, -36, 76]].forEach(([x, y, r], i) => bush.add(N(paper({shape: S.ell(x, y, r, r * .7, 24), color: i % 2 ? COL.leaf : COL.leafD, res: .9, amp: 2.4}), {lift: 4 + i}))); WORLD.add(bush);
  [[520], [X6 + 330]].forEach(([x]) => WORLD.add(G({x, y: 300, z: 58}).add(N(paper({shape: S.rect(-7, -520, 7, 0), color: '#4a4a52', res: 1, amp: 1}), {lift: 4}), N(paper({shape: S.rrect(-30, -580, 30, -520, 10), color: '#ffe6a3', res: 1, amp: 1.2}), {lift: 6}))));
  WORLD.add(N(paper({shape: S.rect(-4000, 268, 9600, 1600), color: '#b9b2a6', res: .4, amp: 3, deco: g => { g.strokeStyle = 'rgba(80,70,60,.16)'; g.lineWidth = 4; for (let x = -4000; x < 9600; x += 180){ g.beginPath(); g.moveTo(x, 268); g.lineTo(x - 40, 1600); g.stroke(); } }}), {z: 40, lift: 3}));
  WORLD.add(N(paper({shape: S.rect(-4000, 262, 9600, 290), color: '#d8d2c6', res: .4, amp: 2}), {z: 39, lift: 4}));
  // магазин: витрина, полосатый навес, вывеска с булкой, дверь (закрытая и открытая)
  const shop = G({x: SHOPX, y: 300, z: 79});
  shop.add(N(paper({shape: S.rect(-420, -330, -140, -70), color: '#3b3a4c', res: 1, amp: 1.4, deco: g => { g.fillStyle = 'rgba(255,214,140,.55)'; g.fillRect(-410, -320, 260, 240); g.fillStyle = '#c9773a'; [[-360, -150], [-290, -150], [-220, -150]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, 28, 18, 0, 0, TAU); g.fill(); }); g.fillStyle = '#a87a52'; g.fillRect(-410, -124, 260, 10); }}), {lift: 3}),
    N(paper({shape: S.rect(-436, -346, -124, -54), holes: [S.rect(-420, -330, -140, -70)], color: '#f1e6cf', res: 1, amp: 1.2}), {lift: 4}),
    N(paper({shape: [[-450, -420], [-110, -420], [-90, -360], [-470, -360]], color: '#e2483a', res: 1, amp: 1.4, deco: g => { g.fillStyle = '#f6f1e6'; for (let x = -470; x < -90; x += 48) g.fillRect(x, -420, 24, 60); }}), {lift: 7}),
    N(paper({shape: S.rrect(-110, -470, 110, -390, 12), color: '#5a3e2e', res: 1.4, amp: 1.2}), {lift: 6}),
    N(paper({shape: S.ell(0, -430, 52, 26, 24), color: '#d99a4e', res: 2, amp: 1, deco: g => { g.strokeStyle = 'rgba(120,60,10,.5)'; g.lineWidth = 4; [-20, 0, 20].forEach(x => { g.beginPath(); g.moveTo(x - 6, -446); g.lineTo(x + 6, -414); g.stroke(); }); }}), {lift: 7}));
  WORLD.add(shop);
  E6.inside = N(paper({shape: [[-90, 0], [-90, -220], ...S.arc(0, -220, 90, 80, Math.PI, TAU, 14), [90, -220], [90, 0]], color: '#e9b866', res: 1, amp: 1, deco: g => { g.fillStyle = 'rgba(120,70,20,.35)'; g.fillRect(-90, -180, 180, 10); g.fillRect(-90, -90, 180, 10); }}), {x: SHOPX, y: 300, z: 81.5, lift: 1, a: 0});
  E6.doorC = N(paper({shape: [[-90, 0], [-90, -220], ...S.arc(0, -220, 90, 80, Math.PI, TAU, 14), [90, -220], [90, 0]], color: '#5a3e2e', res: 1, amp: 1.4, deco: g => { g.fillStyle = 'rgba(255,220,160,.5)'; g.fillRect(-60, -230, 120, 90); g.fillStyle = '#c9a24a'; g.beginPath(); g.arc(60, -110, 8, 0, TAU); g.fill(); }}), {x: SHOPX, y: 300, z: 78.5, lift: 4});
  E6.doorO = N(paper({shape: [[90, 0], [90, -300], [168, -336], [168, 34]], color: '#6b4a38', res: 1, amp: 1.4, deco: g => { g.fillStyle = 'rgba(255,220,160,.4)'; g.beginPath(); g.moveTo(104, -250); g.lineTo(150, -268); g.lineTo(150, -170); g.lineTo(104, -160); g.fill(); }}), {x: SHOPX, y: 300, z: 60, lift: 7, vis: false});
  WORLD.add(E6.inside, E6.doorC, E6.doorO);

  // люди улицы
  HA = hero6(); HA.root.x = -500; HA.root.y = 420;
  PB = passer(); PB.root.x = SHOPX; PB.root.y = 300; PB.root.z = 81;
  // тёплый двойник прохожего: проявляется поверх серого рывками
  PBw = passer(true);
  E6.spot = glowN(44, 44, '#ffd77a', .5); E6.spot.a = 0; GLOW.add(E6.spot);
  E6.spotAnchor = G({x: 18, y: -150}); PB.hip.add(E6.spotAnchor);
  OL = lady(); OL.root.x = -300; OL.root.y = 420;
  WORLD.add(PB.root, PBw.root, OL.root, HA.root);
  E6.umb = makeShield(110); E6.umb.root.dyn = true; E6.umb.root.z = -3; WORLD.add(E6.umb.root);
  E6.burr = makeBurr(30); E6.burr.z = -5; WORLD.add(E6.burr);
  E6.rh = G({dyn: true, z: -6, vis: false}); E6.rh.add(N(paper({shape: rhomb(1), color: '#f6c84a', res: 3, amp: .6, deco: g => { g.fillStyle = 'rgba(255,255,230,.6)'; g.beginPath(); g.moveTo(0, -18); g.lineTo(6, -2); g.lineTo(0, 2); g.fill(); }}), {lift: 7}));
  E6.rhGlow = glowN(54, 54, '#ffe08a', .55); E6.rhGlow.z = -5; E6.rhGlow.a = 0; GLOW.add(E6.rhGlow);
  WORLD.add(E6.rh);

  // огни по окнам: цепочка окон и нитки между ними
  const win = (fi, wi) => { const f = FAC[fi], cols = [-280, 0, 280], rows = [-1000, -760, -520]; return [f.x + cols[wi % 3], 300 + rows[Math.floor(wi / 3)] + 75]; };
  E6.chain = [[2, 7], [2, 4], [1, 5], [1, 1], [0, 3], [0, 7], [1, 6], [2, 0], [3, 3], [3, 8], [4, 1], [4, 5], [5, 3], [5, 7], [6, 1], [6, 5]];
  E6.chainT = E6.chain.map((_, k) => 12.0 + k * .375);
  E6.winGlow = FAC.map(f => f.lights.map(() => { const n = G({z: 79, a: 0}); n.add(glowN(96, 112, '#ffd47a', .28), N(paper({shape: S.rect(-55, -75, 55, 75), color: '#ffd47a', res: .8, amp: 1, edge: false, tex: .4, deco: g => { g.fillStyle = 'rgba(255,255,230,.6)'; g.fillRect(-45, -65, 26, 130); g.fillStyle = 'rgba(150,90,30,.35)'; g.fillRect(-55, -4, 110, 8); g.fillRect(-4, -75, 8, 150); }}), {lift: 1, shadowA: 0})); GLOW.add(n); return n; }));
  FAC.forEach((f, fi) => f.lights.forEach((l, wi) => { const [x, y] = win(fi, wi); E6.winGlow[fi][wi].x = x; E6.winGlow[fi][wi].y = y; l.t0 = 99; }));
  E6.chain.forEach(([fi, wi], k) => { FAC[fi].lights[wi].t0 = E6.chainT[k]; });
  // остальные окна загораются в финале
  FAC.forEach((f, fi) => f.lights.forEach((l, wi) => { if (l.t0 === 99 && hash(fi * 9 + wi, 4) < .8) l.t0 = 34.5 + hash(fi, wi) * 6.5; }));
  FAC[6].lights.forEach((l, wi) => { if (l.t0 === 99) l.t0 = 18.0 + wi * .1; });
  FAC[7].lights.forEach((l, wi) => { if (hash(wi, 7) < .6) l.t0 = Math.min(l.t0, 18.2 + wi * .12); });
  E6.threads = E6.chain.slice(0, -1).map((a, k) => { const [x0, y0] = win(...a), [x1, y1] = win(...E6.chain[k + 1]); const pts = Array.from({length: 9}, (_, j) => { const u = j / 8; return [lerp(x0, x1, u), lerp(y0, y1, u) + Math.sin(u * Math.PI) * 60]; }); const half = pts.slice(0, 5);
    const full = N(paper({shape: S.band(pts, 7, 7), color: '#ffd166', res: 1.4, amp: .6}), {z: 77, lift: 3, vis: false}), part = N(paper({shape: S.band(half, 7, 7), color: '#ffd166', res: 1.4, amp: .6}), {z: 77, lift: 3, vis: false});
    GLOW.add(part, full); return {part, full}; });

  // двор из второго ролика: курьер, мопед, коробка, мятная нитка у героя
  MP = makeMoped('#7fb2d6', -1, 1.3); MP.root.x = X6 + 1600; MP.root.y = 420; MP.root.z = 4;
  CU = courier(); sitPose(CU, true); CU.root.x = MP.seatX; CU.root.y = MP.seatY - 22 + 108; CU.root.under = true; MP.root.add(CU.root); CU.y0 = CU.root.y;
  MP.bag = N(paper({shape: S.rrect(30, -230, 130, -130, 10), color: '#e9b14a', res: 3, amp: 1.2}), {lift: 6, under: true}); CU.hip.add(MP.bag);
  WORLD.add(MP.root);
  E6.mlight = glowN(70, 50, '#fff0b8', .55); E6.mlight.a = 0; GLOW.add(E6.mlight);
  BX = makeBox(104, 88); BX.root.vis = false; BX.rays = makeRays(11, 150); BX.rays.root.y = -44; BX.rays.root.dz = 3; BX.rays.root.dyn = true; BX.root.add(BX.rays.root); BX.root.kids.unshift(BX.root.kids.pop()); BX.root.z = -2; WORLD.add(BX.root);
  E6.mint = G({x: X6 - 700, y: 236, z: -6, vis: false});
  E6.mint.add(N(paper({shape: S.band(Array.from({length: 23}, (_, i) => [-170 + i * 15.5, Math.sin(i * .9) * 7]), 9, 9), color: COL.mint, res: 2, amp: .8}), {lift: 5}));
  [-172, 172].forEach(x => E6.mint.add(N(paper({shape: S.ell(x, 0, 9, 9, 12), color: '#c9a24a', res: 3, amp: .6}), {lift: 7})));
  WORLD.add(E6.mint);
  // красная полоска и шесть сгибов до звезды (подмена фаз)
  const F = [S.rect(-150, -22, 150, 22), S.rect(-75, -22, 75, 22), [[-75, -22], [40, -22], [75, 22], [-40, 22]], [[-50, -40], [30, -44], [62, 0], [28, 40], [-46, 34], [-62, -2]],
    S.star(0, 0, 46, 30, 5), S.star(0, 0, 50, 24, 5), S.star(0, 0, 54, 22, 5)];
  E6.fold = G({dyn: true, z: -6, vis: false});
  E6.folds = F.map((sh, i) => N(paper({shape: sh, color: i < 6 ? (i % 2 ? '#c8452f' : '#cf3b27') : '#e0483a', res: 3, amp: 1, deco: g => { g.strokeStyle = 'rgba(90,10,0,.35)'; g.lineWidth = 3; if (i >= 4){ for (let k = 0; k < 5; k++){ const a = -Math.PI / 2 + k * TAU / 5; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 40, Math.sin(a) * 40); g.stroke(); } } else if (i > 0){ g.beginPath(); g.moveTo(0, -30); g.lineTo(0, 30); g.stroke(); } }}), {lift: 6, vis: false}));
  E6.fold.add(...E6.folds); WORLD.add(E6.fold);
  E6.starGlow = glowN(80, 80, '#ffd47a', .5); E6.starGlow.z = -5; E6.starGlow.a = 0; GLOW.add(E6.starGlow);
}

/* ================= камера ================= */
const cam = path([
  [0, {x: -380, y: 40, ls: Math.log(1.0), roll: -.004}],
  [2.6, {x: 150, y: 0, ls: Math.log(1.1), roll: .006}],
  [4.4, {x: 700, y: -20, ls: Math.log(1.0), roll: -.002}],
  [6.2, {x: SHOPX + 40, y: 40, ls: Math.log(1.25), roll: .002}],
  [7.6, {x: SHOPX + 60, y: 80, ls: Math.log(1.45), roll: -.004}],
  [8.8, {x: SHOPX + 80, y: 40, ls: Math.log(1.3), roll: .004}],
  [10.2, {x: SHOPX + 60, y: 0, ls: Math.log(1.06), roll: -.002}],
  [11.6, {x: SHOPX + 100, y: -220, ls: Math.log(.8), roll: .004}],
  [13.6, {x: 900, y: -560, ls: Math.log(.56), roll: -.004}],
  [16.6, {x: 1500, y: -620, ls: Math.log(.52), roll: .004}],
  [17.7, {x: 2600, y: -700, ls: Math.log(.56), roll: -.008}],
  [19.2, {x: X6 - 260, y: -40, ls: Math.log(.96), roll: .006}],
  [21.6, {x: X6 - 430, y: 40, ls: Math.log(1.12), roll: -.002}],
  [23.0, {x: X6 - 560, y: 70, ls: Math.log(1.3), roll: .004}],
  [24.6, {x: X6 - 600, y: 10, ls: Math.log(1.24), roll: -.002}],
  [26.6, {x: X6 - 640, y: 60, ls: Math.log(1.3), roll: .002}],
  [27.8, {x: X6 - 690, y: 150, ls: Math.log(1.7), roll: -.004}],
  [31.25, {x: X6 - 670, y: 150, ls: Math.log(1.84), roll: .004}],
  [32.6, {x: X6 - 560, y: 80, ls: Math.log(1.3), roll: -.002}],
  [34.2, {x: X6 - 760, y: 0, ls: Math.log(1.0), roll: .004}],
  [36.8, {x: X6 - 1600, y: -560, ls: Math.log(.6), roll: -.006}],
  [40.0, {x: X6 - 2400, y: -800, ls: Math.log(.45), roll: .004}],
  [44, {x: X6 - 2900, y: -900, ls: Math.log(.38), roll: .002}],
]);

/* ================= действие ================= */
function update(t){
  const tp = stepT(t), sp = Math.floor(t * 12 + 1e-6), ph = Math.floor(tp / .3125);
  [HA, PB, OL].forEach(p => { p.root.r = 0; p.hip.r = 0; p.head.r = 0; p.head.y = -282; sitPose(p, false); walkPose(p, false, 0); armPose(p, 0, 0, 0, 0); });
  const dusk = steps(tp, 9.6, 8, .375);
  E6.dusk.a = dusk; E6.moon.a = dusk; E6.stars.forEach((s, i) => s.a = tp >= 12.5 + i * .12 ? 1 : 0);
  E6.farLights.forEach((l, i) => l.a = tp >= 17.4 + (i * 7 % 13) * .16 ? dusk : 0);
  FAC.forEach((f, fi) => f.lights.forEach((l, wi) => { const on = tp >= l.t0 ? 1 : 0; l.a = on; E6.winGlow[fi][wi].a = on * (.8 + (hash(fi * 11 + wi, Math.floor(sp / 6)) < .1 ? .15 : 0)); }));
  E6.threads.forEach((th, k) => { const t0 = E6.chainT[k] + .12; th.part.vis = tp >= t0 && tp < t0 + .125; th.full.vis = tp >= t0 + .125 && tp < 33; });

  /* --- 6.1 колючка и придержанная дверь --- */
  const w1 = at(tp, 0, 2.2), w2 = at(tp, 3.5, 2.1), w3 = at(tp, 9.0, 2.25);
  HA.root.x = tp < 3.5 ? lerp(-500, 250, w1) : tp < 9.0 ? lerp(250, SHOPX - 60, w2) : lerp(SHOPX - 60, 3700, at(tp, 9.0, 7.9));
  walkPose(HA, (tp < 2.2) || (tp >= 3.5 && tp < 5.6) || tp >= 9.0, ph);
  face(HA, tp < 2.3 ? 'calm' : tp < 3.0 ? 'annoyed' : tp < 6.0 ? 'calm' : tp < 6.6 ? 'wow' : 'smile');
  // зонтик: в руке сложен, раскрывается навстречу колючке
  const open = tp >= 2.45 && tp < 3.4;
  if (tp < 11.4){
    if (open) armPose(HA, 0, 0, -2.2, -.4);
    const [ux, uy] = worldOf(HA.armF.grip, sp);
    E6.umb.root.vis = true; E6.umb.open.vis = open; E6.umb.closed.vis = !open;
    E6.umb.root.x = ux + 6; E6.umb.root.y = uy - (open ? 100 : 108); E6.umb.root.r = open ? .5 : .08;
    if (tp >= 6.2){ const [bx, by] = worldOf(HA.armB.grip, sp); E6.umb.root.x = bx + 4; E6.umb.root.y = by - 108; E6.umb.root.r = -.06; }
  } else E6.umb.root.vis = false;
  // колючка летит справа, отскакивает от зонта вверх и прочь
  const bu = at(tp, 2.2, .6), bb = at(tp, 2.8, .7);
  E6.burr.vis = tp >= 2.2 && tp < 3.5;
  if (tp < 2.8){ E6.burr.x = lerp(1250, 400, bu); E6.burr.y = lerp(-260, -140, bu); }
  else { E6.burr.x = lerp(400, 1100, bb); E6.burr.y = lerp(-140, -900, bb) + bb * bb * 300; }
  E6.burr.r = sp * .6;
  // прохожий выходит из магазина и придерживает дверь
  const opened = tp >= 4.4 && tp < 11.0;
  E6.doorC.vis = !opened; E6.doorO.vis = opened; E6.inside.a = opened ? 1 : 0;
  if (tp < 5.0){ PB.root.x = SHOPX; PB.root.y = 300; PB.root.z = 81; }
  else { const k = steps(tp, 5.0, 2, .3125); PB.root.x = lerp(SHOPX, SHOPX + 190, k); PB.root.y = lerp(300, 420, k); PB.root.z = 1; walkPose(PB, tp < 5.6, ph); }
  if (tp >= 11.25){ PB.root.x = lerp(SHOPX + 190, -800, at(tp, 11.25, 5.5)); walkPose(PB, tp < 16.75, ph); }
  const straight = steps(tp, 8.4, 3, .125);
  if (tp < 11.25){ PB.hip.r = lerp(.1, 0, straight); PB.head.y = -282 + lerp(14, 0, straight); PB.head.r = lerp(.2, 0, straight); }
  face(PB, tp < 6.6 ? 'calm' : tp < 8.0 ? 'wow' : 'smile');
  if (tp >= 5.3 && tp < 11.0) ik(PB, PB.armB, SHOPX + 160, 190, sp, -1);
  const warm = steps(tp, 7.95, 3, .125);
  copyPose(PB, PBw); PBw.root.z = PB.root.z - .05; PBw.root.a = warm;
  { const [sx, sy] = worldOf(E6.spotAnchor, sp); E6.spot.x = sx; E6.spot.y = sy; E6.spot.a = tp >= 7.9 && tp < 8.75 ? 1 : 0; E6.spot.sx = E6.spot.sy = 1 + steps(tp, 7.9, 5, .125) * 1.4; }
  // огонёк: герой достаёт его у груди и протягивает
  E6.rh.vis = tp >= 6.5 && tp < 8.0;
  if (tp >= 6.4 && tp < 8.0){
    const k = steps(tp, 7.0, 3, .125);
    ik(HA, HA.armF, lerp(HA.root.x + 20, SHOPX + 70, k), lerp(180, 160, k), sp, 1);
    const [gx, gy] = worldOf(HA.armF.grip, sp), f = at(tp, 7.55, .35);
    E6.rh.x = lerp(gx + 8, SHOPX + 208, f); E6.rh.y = lerp(gy - 18, 270, f); E6.rh.r = Math.sin(sp * .8) * .15;
  }
  E6.rhGlow.x = E6.rh.x; E6.rhGlow.y = E6.rh.y; E6.rhGlow.a = E6.rh.vis ? .9 : 0;
  // следующая — пожилая соседка: прохожий держит дверь и ей
  if (tp >= 8.0){
    const k = at(tp, 8.0, 2.3);
    OL.root.x = lerp(-300, SHOPX - 30, E.sine(k)); OL.root.y = 420; OL.root.z = 0.5; walkPose(OL, tp < 10.3, ph);
    // шаг на порог (ещё перед стеной), потом — за дверь, видна только в арке
    if (tp >= 10.3){ const q = steps(tp, 10.3, 2, .1875); OL.root.y = lerp(420, 300, q); OL.root.x = SHOPX - 30 + q * 30; walkPose(OL, true, ph); if (tp >= 10.68) OL.root.z = 81; }
    face(OL, tp < 9.6 ? 'calm' : 'smile');
  } else { OL.root.x = -300; OL.root.y = 420; OL.root.z = 0.5; }
  OL.root.vis = tp >= 8.0 && tp < 10.9;

  /* --- 6.3 двор: курьер вовремя --- */
  const yard = tp >= 17.0;
  if (yard){ HA.root.x = lerp(X6 - 1300, X6 - 700, at(tp, 17.0, 2.4)); HA.root.y = 420; walkPose(HA, tp < 19.4, ph); face(HA, tp < 21.6 ? 'calm' : tp < 24.4 ? 'smile' : 'grin'); }
  E6.mint.vis = tp >= 22.5 && tp < 34;
  E6.mint.kids[0].boil = .6;
  let mx;
  if (tp < 33.75){ const u = at(tp, 19.4, 2.2); mx = lerp(X6 + 1600, X6 - 470, 1 - Math.pow(1 - u, 2.4)); }
  else { const u = at(tp, 33.75, 6.5); mx = lerp(X6 - 470, X6 - 4600, E.in(u) * .4 + u * .6); }
  MP.root.x = mx;
  const moving = (tp > 19.4 && tp < 21.6) || tp > 33.75;
  [MP.wB, MP.wF].forEach(w => w.r = -mx / 44);
  MP.root.y = 420 + (moving ? (sp % 2) * -2 : (sp % 4 === 0 ? -1.5 : 0));
  MP.light.a = 1;
  E6.mlight.x = mx - 124 * 1.3; E6.mlight.y = MP.root.y - 150 * 1.3; E6.mlight.a = yard && (tp < 21.7 || tp >= 33.75) ? dusk : 0;   // стоит — фара приглушена, чтобы не светить сквозь героя
  face(CU, tp < 21.6 ? 'calm' : tp < 25.0 ? 'smile' : tp < 33.1 ? 'proud' : 'grin');
  armPose(CU, 1.05, -.55, -.2, .1);
  const proud = steps(tp, 25.0, 3, .125); CU.root.y = CU.y0 - proud * 14;
  // коробка: курьер протягивает, герой поднимает её над ниткой, она расцветает
  BX.root.vis = tp >= 21.9 && tp < 27.4;
  if (tp >= 21.9 && tp < 27.4){
    const reach = steps(tp, 21.9, 3, .125), take = tp >= 23.0;
    if (!take){ ik(CU, CU.armB, lerp(X6 - 380, X6 - 560, reach), lerp(200, 180, reach), sp, -1); const [hx, hy] = worldOf(CU.armB.grip, sp); BX.root.x = hx - 30; BX.root.y = hy + 30; }
    if (tp >= 22.6){
      const up = steps(tp, 23.75, 4, .1875);
      const bx = lerp(X6 - 600, X6 - 680, take ? 1 : 0), by = take ? lerp(210, 150, up) : 210;
      if (tp < 26.6){ ik(HA, HA.armF, bx + 52, by - 30, sp, 1); ik(HA, HA.armB, bx - 52, by - 30, sp, -1); }
      if (take){ BX.root.x = bx; BX.root.y = by; }
    }
    fan(BX.rays, tp, 24.4, .2);
    BX.lid.r = tp >= 24.4 ? -steps(tp, 24.4, 3, .125) * 1.15 : 0; BX.lid.x = -52 - 5 - (tp >= 24.4 ? 12 : 0);
    if (tp >= 26.6){ const d = steps(tp, 26.6, 4, .125); BX.root.x = lerp(X6 - 680, X6 - 860, d); BX.root.y = lerp(150, 420, d);
      if (d < 1){ ik(HA, HA.armB, BX.root.x - 52, BX.root.y - 30, sp, -1); ik(HA, HA.armF, BX.root.x + 52, BX.root.y - 30, sp, 1); } }
  }
  if (tp >= 27.4 && tp < 34){ BX.root.vis = true; BX.root.x = X6 - 860; BX.root.y = 420; BX.rays.root.a = 1; }

  /* --- 6.4 шесть сгибов, звезда для курьера --- */
  const FT = [28.1, 28.75, 29.4, 30.0, 30.6, 31.25];
  const stage = tp < 27.6 ? -1 : FT.filter(x => tp >= x).length;
  E6.fold.vis = stage >= 0 && tp < 34.5;
  E6.folds.forEach((n, i) => n.vis = i === Math.max(0, stage));
  if (stage >= 0 && tp < 31.9){
    const hw = [150, 75, 75, 62, 50, 50, 54][Math.max(0, stage)];
    const cx = X6 - 690, cy = 120 + (FT.some(x => tp >= x && tp < x + .1) ? -6 : 0);
    ik(HA, HA.armB, cx - hw - 6, cy + 4, sp, -1); ik(HA, HA.armF, cx + hw + 6, cy + 4, sp, 1);
    E6.fold.x = cx; E6.fold.y = cy; E6.fold.r = stage >= 4 ? Math.sin(sp * .3) * .04 : 0;
    HA.head.r = .1; HA.head.y = -278;
  }
  if (tp >= 31.9){
    // отдаёт звезду, она прилипает к сумке курьера и светится
    const k = steps(tp, 31.9, 4, .125);
    if (tp < 32.6) ik(HA, HA.armF, lerp(X6 - 640, X6 - 520, k), lerp(124, 120, k), sp, 1);
    const [bx, by] = worldOf(MP.bag, sp);
    const [gx, gy] = worldOf(HA.armF.grip, sp);
    const on = tp >= 32.5;
    E6.fold.x = on ? bx + 80 : gx + 30; E6.fold.y = on ? by - 180 : gy - 6; E6.fold.r = on ? .2 : 0;
    E6.fold.sx = E6.fold.sy = on ? .8 : 1;
  } else E6.fold.sx = E6.fold.sy = 1;
  E6.fold.vis = E6.fold.vis || (tp >= 31.9);
  E6.starGlow.x = E6.fold.x; E6.starGlow.y = E6.fold.y; E6.starGlow.a = stage === 6 || tp >= 31.25 ? (.8 + (sp % 6 === 0 ? .15 : 0)) : 0;
  if (tp >= 33.1 && tp < 34.4) armPose(CU, 2.6, .4, -.2, .1);

}

/* ================= звук ================= */
function cues(){
  CUES.length = 0;
  for (let k = 0; k < 7; k++) cue(.1 + k * .3125, 'step', {pan: -.5 + k * .08, v: .42});
  cue(2.2, 'whoosh', {v: .35}); cue(2.45, 'fan', {pan: .1, v: .5}); cue(2.8, 'boing', {pan: .3}); cue(3.4, 'fold', {pan: .1});
  for (let k = 0; k < 7; k++) cue(3.55 + k * .3125, 'step', {pan: -.1 + k * .05, v: .42});
  cue(4.4, 'hinge'); cue(5.0, 'step', {pan: .3, v: .35}); cue(5.3, 'step', {pan: .3, v: .35});
  cue(6.5, 'chime'); cue(7.9, 'chime', {hi: true}); cue(7.95, 'unfurl');
  for (let k = 0; k < 7; k++) cue(8.05 + k * .3125, 'step', {pan: -.6 + k * .1, v: .3});
  for (let k = 0; k < 7; k++) cue(9.05 + k * .3125, 'step', {pan: .1 + k * .08, v: .38});
  cue(11.0, 'hinge', {close: true});
  E6.chainT.forEach((t, k) => cue(t, 'light', {pan: -.6 + (k % 8) * .17, note: [69, 71, 74, 76, 78, 81, 83, 81, 78, 81, 83, 86, 83, 86, 88, 90][k]}));
  cue(17.1, 'whoosh', {v: .55, dir: 'up'});
  cue(19.4, 'moped', {dur: 2.2, pan: .4, sweet: true}); cue(21.6, 'brake', {pan: -.1}); cue(21.7, 'idle', {dur: 12.0, pan: -.1, soft: true});
  cue(22.5, 'tissue', {pan: -.2}); cue(23.0, 'click', {pan: -.1}); cue(24.4, 'bloom'); cue(24.45, 'tissue', {pan: 0}); cue(25.0, 'soft', {pan: .2});
  cue(27.6, 'tear', {v: .3});
  [28.1, 28.75, 29.4, 30.0, 30.6, 31.25].forEach((t, i) => cue(t, 'crease', {pan: (i % 2 ? .1 : -.1), v: .5 + i * .05}));
  cue(31.25, 'chord', {notes: [62, 66, 69, 74, 78]}); cue(32.5, 'chime', {hi: true}); cue(33.75, 'moped', {dur: 4.5, pan: -.5, sweet: true});
}

/* ================= кадр ================= */
function camAt(t){ return cam(t); }
function renderAt(g, t, to = t){
  update(to);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.fillStyle = '#1d1712'; g.fillRect(0, 0, W, H);
  const c = toCam(cam(t)), dk = steps(stepT(to), 9.6, 8, .375);
  // вечер: дальний город темнеет, его окна горят поверх тона; ближний слой тонируется отдельно, чтобы огни не просвечивали сквозь дома
  const tint = (k, a, b) => `rgb(${Math.round(lerp(255, a[0], k))},${Math.round(lerp(255, a[1], k))},${Math.round(lerp(255, b, k))})`;
  drawWorld(g, FARW, c, to);
  if (dk > 0){ g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'multiply'; g.fillStyle = tint(dk, [120, 128], 200); g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; }
  drawWorld(g, FARGLOW, c, to);
  NC = NC || makeCanvas(); const ng = NC.getContext('2d');
  ng.setTransform(1, 0, 0, 1, 0, 0); ng.globalAlpha = 1; ng.globalCompositeOperation = 'source-over'; ng.clearRect(0, 0, W, H);
  drawWorld(ng, WORLD, c, to);
  if (dk > 0){
    // умножение на вечерний цвет, затем возвращаем исходную прозрачность слоя
    AC = AC || makeCanvas(); const ag = AC.getContext('2d'); ag.setTransform(1, 0, 0, 1, 0, 0); ag.globalCompositeOperation = 'copy'; ag.drawImage(NC, 0, 0);
    ng.setTransform(1, 0, 0, 1, 0, 0); ng.globalAlpha = 1; ng.globalCompositeOperation = 'multiply'; ng.fillStyle = tint(dk, [158, 166], 214); ng.fillRect(0, 0, W, H);
    ng.globalCompositeOperation = 'destination-in'; ng.drawImage(AC, 0, 0); ng.globalCompositeOperation = 'source-over'; }
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.drawImage(NC, 0, 0);
  drawWorld(g, GLOW, c, to);
  grade(g, 1 - dk * .3);
}
function subFor(t){ return subForPath(cam, t); }
