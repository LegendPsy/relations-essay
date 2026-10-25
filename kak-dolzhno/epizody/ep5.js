/* Эпизод 5 «Снять серую кальку» — к части 4 (близкие). 40 секунд.
   Нить: серый колпак из кальки «так и должно быть». Он опускается на хорошее дело близких,
   и герой мягко его снимает. Дом в разрезе: кухня с ужином, детская с убранными игрушками,
   в конце светятся комнаты, где хорошее заметили, а на серой земле вокруг пробиваются ростки. */
const DUR = 40, BEAT = .625;
const TX = -500, KX = 1150;   // стол на кухне и ящик с игрушками в детской
const WHIP = 19.0;
let WORLD, HA, PT, KD, E5 = {};

const partner = () => makePerson({body: 'sweater', hair: 'bob', coat: '#7fa88f', coatA: '#76a087', coatB: '#5f8a72', hairC: '#7a4a2e', skin: '#f0c4a0', pants: '#4a4560'});
const kid = () => makePerson({body: 'kid', hair: 'kid', k: .72, coat: '#e8b83e', coatA: '#e0ad35', coatB: '#c9962a', stripe: '#3c6fc4', hairC: '#5a3a22', pants: '#3c6fc4', skin: '#f3cba6'});

function makeSprout(h = 90, fc = '#f2c43c', seed = 1){
  const root = G({}), lean = (hash(seed, 3) - .5) * 30;
  const stem = k => N(paper({shape: S.band([[0, 0], [lean * .3 * k, -h * .5 * k], [lean * k, -h * k]], 9, 5), color: COL.leaf, res: 3, amp: .6}), {lift: 4, vis: false});
  root.phases = [stem(.35), stem(.7), stem(1)];
  root.leaves = [-1, 1].map(s => N(paper({shape: S.ell(s * 16, 0, 16, 7, 12), color: COL.leafD, res: 3, amp: .6}), {x: lean * .4, y: -h * .45, r: s * .5, lift: 4.5, vis: false}));
  root.flower = G({x: lean, y: -h, vis: false});
  root.flower.add(N(paper({shape: S.star(0, 0, 17, 9, 6, 0), color: fc, res: 3, amp: .6}), {lift: 5}), N(paper({shape: S.ell(0, 0, 6, 6, 10), color: '#c9772e', res: 3, amp: .3}), {lift: 5.5}));
  root.add(...root.phases, ...root.leaves, root.flower);
  return root;
}
function growSprout(s, tp, t0){ const k = tp < t0 ? 0 : Math.min(3, Math.floor((tp - t0) * 12) + 1); s.phases.forEach((p, i) => p.vis = k === i + 1); s.leaves.forEach(l => l.vis = k >= 2); s.flower.vis = tp >= t0 + .33; }

function build(){
  GRAIN = makeGrain(5);
  WORLD = G({z: 0});
  WORLD.add(N(paper({shape: S.rect(-5000, -4200, 6000, 3000), color: COL.kraft, amp: 0, res: .3, edge: false, texScale: 3}), {z: 150}));
  // вечернее небо, луна, звёзды
  WORLD.add(N(paper({shape: S.rect(-3800, -3200, 4600, 560), color: '#cdd3e4', res: .3, amp: 6}), {z: 120, lift: 2}));
  WORLD.add(N(paper({shape: S.ell(0, 0, 120, 120, 40), holes: [S.ell(50, -30, 100, 100, 36)], color: '#f3ecd2', res: .8, amp: 2}), {x: -1900, y: -2000, z: 116, lift: 4}));
  [[-1200, -2300], [-2600, -1500], [2300, -2200], [3000, -1400], [1400, -2500], [-500, -2550]].forEach(([x, y], i) => WORLD.add(N(paper({shape: S.star(0, 0, 26, 9, 4), color: '#f6efd6', res: 2, amp: .8}), {x, y, z: 116, lift: 3, r: i * .3})));
  // серая земля вокруг дома
  WORLD.add(N(paper({shape: S.rect(-3800, 516, 4600, 2000), color: '#9c9a94', res: .4, amp: 4, grey: false, deco: g => { const r = rng(4); g.fillStyle = 'rgba(60,60,60,.16)'; for (let k = 0; k < 500; k++){ g.beginPath(); g.arc(-3800 + r() * 8400, 516 + r() * 1480, 3 + r() * 6, 0, TAU); g.fill(); } }}), {z: 30, lift: 4}));

  // дом в разрезе: стены комнат (тусклая и тёплая версии), полы, срезы перекрытий
  const room = (x0, x1, y0, y1, cool, warm, deco) => { const c = N(paper({shape: S.rect(x0, y0, x1, y1), color: cool, res: .4, amp: 2, deco}), {z: 80, lift: 2}); const w = N(paper({shape: S.rect(x0, y0, x1, y1), color: warm, res: .4, amp: 2, deco}), {z: 79.5, lift: 2, a: 0}); WORLD.add(c, w); return {cool: c, warm: w}; };
  const dots = c => g => { g.fillStyle = c; for (let y = -1200, r = 0; y < 520; y += 54, r++) for (let x = -1400 + (r % 2) * 30; x < 2000; x += 60) g.fillRect(x, y, 6, 6); };
  const lines = c => g => { g.fillStyle = c; for (let x = -1400; x < 2000; x += 64) g.fillRect(x, -1200, 22, 1720); };
  E5.kitchen = room(-1300, 300, -250, 260, '#c8c1b0', '#f2d9a6', lines('rgba(120,80,40,.07)'));
  E5.kids = room(300, 1900, -250, 260, '#bec5c6', '#f6dcb0', dots('rgba(90,120,160,.12)'));
  room(-1300, 300, -1060, -300, '#b9bcc3', '#b9bcc3', lines('rgba(60,60,80,.07)'));
  room(300, 1900, -1060, -300, '#c2bdb6', '#c2bdb6', dots('rgba(80,70,60,.08)'));
  WORLD.add(N(paper({shape: [[-1300, -1060], [300, -1640], [1900, -1060]], color: '#cdbfa6', res: .4, amp: 2}), {z: 80, lift: 2}));
  const floor = (x0, x1, y0, y1) => N(paper({shape: S.rect(x0, y0, x1, y1), color: '#a97c54', res: .5, amp: 2, deco: g => { g.strokeStyle = 'rgba(60,30,10,.22)'; g.lineWidth = 4; for (let y = y0 + 70; y < y1; y += 70){ g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); } }}), {z: 40, lift: 3});
  WORLD.add(floor(-1300, 1900, 250, 510), floor(-1300, 1900, -560, -300));
  const cut = sh => N(paper({shape: sh, color: '#6f4a3a', res: .6, amp: 2, deco: g => { g.fillStyle = 'rgba(255,230,200,.2)'; g.fillRect(-2000, -2000, 5000, 6); }}), {z: 10, lift: 6});
  WORLD.add(cut(S.rect(-1360, 500, 1960, 548)), cut(S.rect(-1360, -300, 1960, -246)), cut(S.rect(-1360, -1100, 1960, -1052)),
    cut(S.rect(-1360, -1100, -1300, 548)), cut(S.rect(1900, -1100, 1960, 548)), cut(S.rect(282, -1100, 318, -246)),
    cut(S.band([[-1440, -1040], [300, -1690], [2040, -1040]], 56, 56)), cut(S.rect(1300, -1560, 1400, -1300)));

  // кухня: окно, буфет, лампа над столом, стол со скатертью, стулья
  WORLD.add(G({x: -1060, y: -60, z: 78}).add(N(paper({shape: S.rect(-120, -140, 120, 140), color: '#5f6f9e', res: 1, amp: 1.6, deco: g => { g.fillStyle = '#f3ecd2'; g.beginPath(); g.arc(50, -60, 22, 0, TAU); g.fill(); }}), {lift: 2}), N(paper({shape: S.rect(-136, -156, 136, 156), holes: [S.rect(-120, -140, -4, 140), S.rect(4, -140, 120, 140)], color: '#f3ead8', res: 1, amp: 1.4}), {lift: 4})));
  const cup = G({x: 90, y: 420, z: 30});
  cup.add(N(paper({shape: S.rect(-150, -330, 150, 0), color: '#e9dcc0', res: 1, amp: 1.6, deco: g => { g.strokeStyle = 'rgba(80,50,20,.3)'; g.lineWidth = 4; g.strokeRect(-138, -310, 130, 290); g.strokeRect(8, -310, 130, 290); }}), {lift: 5}),
    N(paper({shape: S.rrect(-110, -400, -20, -330, 10), color: COL.teal, res: 1.4, amp: 1}), {lift: 5}), N(paper({shape: S.rrect(10, -380, 120, -330, 10), color: COL.coral, res: 1.4, amp: 1}), {lift: 5}));
  WORLD.add(cup);
  E5.lamp = G({x: TX, y: -246, z: 30});
  E5.lampGlow = N(paper({shape: S.ell(0, 180, 380, 260, 40), color: '#ffe3a0', alpha: .32, res: .5, amp: 0, edge: false, tex: 0}), {lift: .5, shadowA: 0, a: 0});
  E5.lampOn = N(paper({shape: S.ell(0, 100, 22, 12, 16), color: '#fff0b8', res: 2, amp: .6}), {lift: 4, a: 0});
  E5.lamp.add(E5.lampGlow, N(paper({shape: S.rect(-3, 0, 3, 64), color: '#3a3430', res: 1, amp: .4}), {lift: 3}), N(paper({shape: S.ell(0, 100, 22, 12, 16), color: '#8d8578', res: 2, amp: .6}), {lift: 4}), E5.lampOn,
    N(paper({shape: [[-30, 64], [30, 64], [70, 104], [-70, 104]], color: COL.coral, res: 2, amp: 1}), {lift: 5}));
  WORLD.add(E5.lamp);
  const chair = x => G({x, y: 420, z: 6}).add(N(paper({shape: S.rect(-60, -280, -44, 0), color: '#8a5a3a', res: 1.4, amp: 1}), {lift: 4}), N(paper({shape: S.rect(44, -280, 60, 0), color: '#8a5a3a', res: 1.4, amp: 1}), {lift: 4}), N(paper({shape: S.rect(-62, -280, 62, -230), color: '#a06a44', res: 1.4, amp: 1}), {lift: 4.5}), N(paper({shape: S.rect(-66, -118, 66, -98), color: '#a06a44', res: 1.4, amp: 1}), {lift: 4.5}));
  WORLD.add(chair(TX - 170), chair(TX + 170));
  const table = G({x: TX, y: 0, z: -3});
  table.add(...[-200, 200].map(x => N(paper({shape: S.rect(x - 10, 240, x + 10, 420), color: '#7a5034', res: 1.4, amp: 1}), {lift: 5})),
    N(paper({shape: S.rect(-240, 222, 240, 246), color: '#8a5a3a', res: 1.4, amp: 1.2}), {lift: 6}),
    N(paper({shape: [[-246, 228], [246, 228], [236, 306], [-236, 306]], color: '#f4ecdb', res: 1.4, amp: 1.6, deco: g => { g.fillStyle = 'rgba(216,67,46,.35)'; for (let x = -240; x < 240; x += 40) g.fillRect(x, 228, 18, 80); for (let y = 240; y < 306; y += 34) g.fillRect(-246, y, 492, 14); }}), {lift: 6.5}));
  WORLD.add(table);

  // детская: окно, кровать, полка, коврик, ящик с кубиками
  WORLD.add(G({x: 1500, y: -60, z: 78}).add(N(paper({shape: S.rect(-110, -130, 110, 130), color: '#5f6f9e', res: 1, amp: 1.6, deco: g => { g.fillStyle = '#f6efd6'; [[-40, -50], [30, 20], [60, -70]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 5, 0, TAU); g.fill(); }); }}), {lift: 2}), N(paper({shape: S.rect(-126, -146, 126, 146), holes: [S.rect(-110, -130, 110, 130)], color: '#f3ead8', res: 1, amp: 1.4}), {lift: 4})));
  WORLD.add(G({x: 1740, y: 420, z: 30}).add(N(paper({shape: S.rect(-150, -220, -134, 0), color: '#a87a52', res: 1, amp: 1}), {lift: 4}), N(paper({shape: S.rrect(-150, -130, 150, -40, 16), color: '#86a9cf', res: 1, amp: 1.6, deco: g => { g.fillStyle = 'rgba(255,255,255,.35)'; for (let x = -130; x < 150; x += 50){ g.beginPath(); g.arc(x, -90, 9, 0, TAU); g.fill(); } }}), {lift: 5}), N(paper({shape: S.rrect(-140, -170, -40, -126, 14), color: '#f6f1e6', res: 1, amp: 1}), {lift: 5.5})));
  WORLD.add(G({x: 700, y: -60, z: 70}).add(N(paper({shape: S.rect(-150, 0, 150, 16), color: '#a87a52', res: 1, amp: 1}), {lift: 5}), N(paper({shape: S.ell(-80, -36, 36, 36, 24), color: COL.coral, res: 2, amp: 1, deco: g => { g.fillStyle = '#f6f1e6'; g.fillRect(-120, -42, 80, 10); }}), {lift: 5}), N(paper({shape: S.rect(10, -60, 60, 0), color: COL.blue, res: 2, amp: 1}), {lift: 5}), N(paper({shape: S.rect(70, -46, 110, 0), color: COL.mustard, res: 2, amp: 1}), {lift: 5})));
  WORLD.add(N(paper({shape: S.ell(KX - 430, 372, 200, 40, 40), color: '#d9a2a0', res: 1, amp: 2, deco: g => { g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 5; g.beginPath(); g.ellipse(KX - 430, 372, 160, 28, 0, 0, TAU); g.stroke(); }}), {z: 38, lift: 2}));
  E5.box = G({x: KX, y: 420, z: 2});
  E5.box.add(N(paper({shape: S.rect(-110, -132, 110, 0), color: '#8a5a3a', res: 1.4, amp: 1}), {dz: 2, lift: 3}));
  E5.cubesIn = [[-70, COL.blue], [-22, COL.coral], [26, COL.mustard], [70, COL.leaf]].map(([x, c], i) => N(paper({shape: S.rect(-22, -22, 22, 22), color: c, res: 2, amp: .8}), {x, y: -126 - (i % 2) * 8, dz: 1, lift: 4}));
  E5.box.add(...E5.cubesIn, N(paper({shape: S.rect(-114, -118, 114, 0), color: '#b07a4a', res: 1.4, amp: 1.2, deco: g => { g.strokeStyle = 'rgba(60,30,10,.3)'; g.lineWidth = 4; for (let y = -88; y < 0; y += 30){ g.beginPath(); g.moveTo(-114, y); g.lineTo(114, y); g.stroke(); } }}), {lift: 6}));
  WORLD.add(E5.box);
  E5.cube = N(paper({shape: S.rect(-22, -22, 22, 22), color: COL.mustard, res: 2, amp: .8, deco: g => { g.fillStyle = '#d8432e'; g.beginPath(); g.arc(0, 0, 8, 0, TAU); g.fill(); }}), {z: -2, lift: 5, dyn: true});
  // призрак красной линейки
  E5.ruler = G({z: -4, dyn: true, a: 0});
  E5.ruler.add(N(paper({shape: S.rect(-260, -28, 260, 28), color: '#e07a66', alpha: .5, res: 2, amp: 1.4, deco: g => { g.fillStyle = 'rgba(120,20,10,.5)'; for (let x = -240; x <= 240; x += 30) g.fillRect(x, -28, 3, x % 90 === 0 ? 26 : 14); }}), {lift: 3}));
  // росток с золотым цветком из ящика
  E5.sprout = G({x: KX - 10, y: 292, z: 1.5});
  E5.stems = [0, 1, 2, 3].map(k => N(paper({shape: S.band([[0, -k * 74], [k % 2 ? 8 : -8, -k * 74 - 40], [0, -k * 74 - 78]], 14, 12), color: COL.leaf, res: 2, amp: .8}), {lift: 5, vis: false}));
  E5.leaves = [[-1, -110], [1, -190]].map(([s, y]) => N(paper({shape: S.ell(s * 34, 0, 34, 14, 16), color: COL.leafD, res: 2, amp: .8}), {x: s * 6, y, r: s * .4, lift: 5.5, vis: false}));
  E5.flower = makeRays(10, 74, '#f2c43c', '#f7d66b'); E5.flower.root.y = -300;
  E5.bud = N(paper({shape: S.ell(0, -300, 20, 26, 16), color: '#e8b83e', res: 2, amp: .8}), {lift: 6, vis: false});
  E5.fcore = N(paper({shape: S.ell(0, -300, 22, 22, 18), color: '#c9772e', res: 2, amp: .8}), {lift: 7, vis: false});
  E5.sprout.add(...E5.stems, ...E5.leaves, E5.flower.root, E5.bud, E5.fcore);
  WORLD.add(E5.sprout);

  // верхний этаж: спальня и гостиная, свет не горит
  WORLD.add(G({x: -700, y: -380, z: 30}).add(N(paper({shape: S.rrect(-260, -160, 260, -40, 20), color: '#8e93a6', res: .8, amp: 1.4}), {lift: 4}), N(paper({shape: S.rect(-270, -300, -240, 0), color: '#6d5a4a', res: .8, amp: 1}), {lift: 4}), N(paper({shape: S.rrect(-230, -200, -120, -150, 16), color: '#e4e2dc', res: .8, amp: 1}), {lift: 4.5})));
  WORLD.add(G({x: -260, y: -380, z: 30}).add(N(paper({shape: S.rect(-40, -120, 40, 0), color: '#7a6a5a', res: 1, amp: 1}), {lift: 4}), N(paper({shape: [[-30, -200], [30, -200], [50, -140], [-50, -140]], color: '#a9a39a', res: 1, amp: 1}), {lift: 4.5}), N(paper({shape: S.rect(-3, -140, 3, -120), color: '#3a3430', res: 1, amp: .4}), {lift: 4})));
  WORLD.add(G({x: 1050, y: -380, z: 30}).add(N(paper({shape: S.rrect(-260, -190, 260, 0, 30), color: '#9a8a7e', res: .8, amp: 1.6}), {lift: 4}), N(paper({shape: S.rrect(-220, -130, 220, -60, 16), color: '#b0a093', res: .8, amp: 1.2}), {lift: 4.5})));
  WORLD.add(G({x: 1050, y: -800, z: 76}).add(N(paper({shape: S.rect(-110, -80, 110, 80), color: '#a9b4a6', res: 1, amp: 1.2}), {lift: 3}), N(paper({shape: S.rect(-126, -96, 126, 96), holes: [S.rect(-110, -80, 110, 80)], color: '#a87a52', res: 1, amp: 1.2}), {lift: 4})));

  // люди: герой за столом, партнёр у буфета с тарелкой, ребёнок в детской
  HA = makePerson(); HA.root.x = TX - 170; HA.root.y = 420;
  PT = partner(); PT.root.x = 120; PT.root.y = 420;
  KD = kid(); KD.root.x = KX + 170; KD.root.y = 420;
  WORLD.add(PT.root, HA.root, KD.root, E5.cube, E5.ruler);
  // тарелка, еда (живая и плоская серая), пар, колпак из кальки
  E5.plate = G({dyn: true, z: -4});
  E5.food = N(paper({shape: [[-64, 0], ...S.arc(0, 0, 64, 44, Math.PI, TAU, 16), [64, 0]], color: '#c9773a', res: 3, amp: 1.2, deco: g => { g.strokeStyle = 'rgba(120,50,10,.35)'; g.lineWidth = 3; for (let x = -40; x <= 40; x += 20){ g.beginPath(); g.moveTo(x - 8, -20); g.lineTo(x + 8, -30); g.stroke(); } }}), {y: -8, lift: 5});
  E5.herb = [[-24, -44], [10, -50], [34, -36]].map(([x, y]) => N(paper({shape: S.ell(x, y, 9, 5, 10), color: COL.leaf, res: 3, amp: .5}), {y: -8, lift: 5.5}));
  E5.flat = N(paper({shape: [[-64, 0], ...S.arc(0, 0, 64, 16, Math.PI, TAU, 16), [64, 0]], color: '#9a9690', res: 3, amp: 1.2}), {y: -8, lift: 4, vis: false});
  E5.steam = makeSteam(3, [-22, 0, 22], -52, 14);
  E5.plate.add(N(paper({shape: S.ell(0, 0, 92, 13, 30), color: '#f6f0e4', res: 3, amp: 1, deco: g => { g.strokeStyle = 'rgba(91,134,181,.6)'; g.lineWidth = 3; g.beginPath(); g.ellipse(0, 0, 80, 9, 0, 0, TAU); g.stroke(); }}), {lift: 4}), E5.food, ...E5.herb, E5.flat, ...E5.steam);
  E5.cap = G({dyn: true, z: -6, vis: false});
  E5.capDome = N(paper({shape: [[-100, 0], ...S.arc(0, 0, 100, 128, Math.PI, TAU, 20), [100, 0]], color: '#c3c8cb', alpha: .82, res: 2, amp: 1.6}), {lift: 6});
  E5.capKnob = N(paper({shape: S.ell(0, -134, 16, 11, 14), color: '#b3b8bb', res: 2, amp: .8}), {lift: 6.5});
  E5.ball = N(paper({shape: S.ell(0, 0, 44, 38, 18), color: '#c3c8cb', res: 2, amp: 8, deco: g => { g.strokeStyle = 'rgba(80,90,100,.4)'; g.lineWidth = 3; for (let k = 0; k < 6; k++){ g.beginPath(); g.moveTo(-30 + k * 9, -30); g.lineTo(-10 + k * 7, 28); g.stroke(); } }}), {lift: 7, vis: false});
  E5.crush = N(paper({shape: [[-80, 0], [-60, -70], [-20, -100], [30, -94], [70, -60], [86, 0], [30, 14], [-30, 10]], color: '#c3c8cb', alpha: .9, res: 2, amp: 6}), {lift: 6, vis: false});
  E5.cap.add(E5.capDome, E5.capKnob, E5.crush, E5.ball);
  WORLD.add(E5.plate, E5.cap);
  // мостик из пара между ними
  const q = u => { const a = [TX - 132, -14], b = [TX, -168], c = [TX + 132, -14]; return [lerp(lerp(a[0], b[0], u), lerp(b[0], c[0], u), u), lerp(lerp(a[1], b[1], u), lerp(b[1], c[1], u), u)]; };
  E5.bridge = Array.from({length: 6}, (_, i) => { const pts = Array.from({length: 6}, (_, j) => { const u = (i + j / 5) / 6, [x, y] = q(u); return [x, y + Math.sin(u * 24) * 5]; }); return N(paper({shape: S.band(pts, 15, 15), color: '#fffaf0', alpha: .88, res: 2, amp: .8}), {z: -8, lift: 3, shadowA: .5, vis: false}); });
  WORLD.add(...E5.bridge);
  // косяк на переднем плане, проходит перед объективом
  E5.jamb = N(paper({shape: S.rect(-46, -2600, 46, 1400), color: '#6f4a3a', res: .6, amp: 2, deco: g => { g.fillStyle = 'rgba(255,230,200,.25)'; g.fillRect(-46, -2600, 10, 4000); }}), {x: 300, z: -150, lift: 6, blur: 5});
  WORLD.add(E5.jamb);
  // ростки на серой земле в финале
  E5.sprouts = [[-1950, 600], [-1600, 700], [-1150, 760], [-600, 690], [0, 770], [600, 700], [1150, 760], [1650, 690], [2150, 600], [2500, 720], [-1500, 580], [2650, 590]].map(([x, y], i) => { const s = makeSprout(110 + hash(i, 2) * 70, ['#f2c43c', '#e98a8f', '#f6f1e6', '#e8b83e'][i % 4], i + 3); s.x = x; s.y = y; s.z = 26; s.sx = s.sy = 1.7; s.t0 = 33.6 + (i * 7 % 12) * .4; WORLD.add(s); return s; });
}

/* ================= камера ================= */
const cam = path([
  [0, {x: 300, y: -560, ls: Math.log(.45), roll: -.004}],
  [1.6, {x: 60, y: -260, ls: Math.log(.62), roll: .004}],
  [3.4, {x: -380, y: 40, ls: Math.log(.95), roll: -.006}],
  [5.0, {x: -460, y: 100, ls: Math.log(1.08), roll: .002}],
  [6.6, {x: -400, y: 110, ls: Math.log(1.14), roll: .004}],
  [8.75, {x: -480, y: 90, ls: Math.log(1.3), roll: -.002}],
  [10.0, {x: -560, y: 60, ls: Math.log(1.36), roll: .004}],
  [11.0, {x: -620, y: 40, ls: Math.log(1.22), roll: -.004}],
  [12.5, {x: -500, y: 20, ls: Math.log(1.2), roll: .002}],
  [15.0, {x: -500, y: 140, ls: Math.log(1.48), roll: -.002}],
  [16.8, {x: -480, y: 100, ls: Math.log(1.22), roll: .004}],
  [18.6, {x: -430, y: 90, ls: Math.log(1.12), roll: -.004}],
  [19.4, {x: 980, y: 90, ls: Math.log(1.08), roll: .01}],
  [20.6, {x: 1040, y: 100, ls: Math.log(1.12), roll: .002}],
  [22.5, {x: 1080, y: 60, ls: Math.log(1.16), roll: -.002}],
  [24.4, {x: 1060, y: 130, ls: Math.log(1.3), roll: .004}],
  [25.6, {x: 1100, y: 10, ls: Math.log(1.12), roll: -.002}],
  [27.5, {x: 1080, y: 60, ls: Math.log(1.18), roll: .002}],
  [30.0, {x: 1020, y: 40, ls: Math.log(1.08), roll: -.002}],
  [32.5, {x: 800, y: -150, ls: Math.log(.8), roll: .004}],
  [35.5, {x: 420, y: -380, ls: Math.log(.55), roll: -.002}],
  [40, {x: 320, y: -380, ls: Math.log(.4), roll: .002}],
]);

/* ================= действие ================= */
const JUMPS = [26.25, 26.9, 27.5];
function update(t){
  const tp = stepT(t), sp = Math.floor(t * 12 + 1e-6), ph = Math.floor(tp / .3125);
  [HA, PT, KD].forEach(p => { p.root.r = 0; p.hip.r = 0; p.head.r = 0; p.head.y = -282; sitPose(p, false); walkPose(p, false, 0); armPose(p, 0, 0, 0, 0); });
  E5.jamb.a = tp < 30 ? 1 : 0;

  /* --- 5.2 ужин --- */
  // партнёр несёт тарелку от буфета, ставит, садится
  const walkP = at(tp, 5.0, 1.25);
  PT.root.x = lerp(120, TX + 170, E.sine(walkP)); PT.root.y = 420;
  walkPose(PT, tp >= 5.0 && tp < 6.25, ph);
  const seated = tp >= 6.9;
  if (seated){ sitPose(PT, true); }
  face(PT, tp < 7.6 ? 'smile' : tp < 11.25 ? 'calm' : tp < 16.25 ? 'smile' : 'grin');
  if (tp >= 7.9 && tp < 11.25){ PT.head.r = .1; PT.head.y = -278; }
  if (tp >= 13.1 && tp < 18.75) PT.head.r = -.1;
  if (tp < 6.6){
    ik(PT, PT.armB, PT.root.x - 120, 240 + (tp >= 6.25 ? steps(tp, 6.25, 2) * -10 : 0), sp, -1);
    const [gx, gy] = worldOf(PT.armB.grip, sp); E5.plate.x = gx - 70; E5.plate.y = gy + 4;
    if (tp >= 6.25){ const k = steps(tp, 6.25, 4); E5.plate.x = lerp(gx - 70, TX, k); E5.plate.y = lerp(gy + 4, 222, k); }
  } else { E5.plate.x = TX; E5.plate.y = 222; }
  // колпак опускается, еда сереет и становится плоской
  const capOn = steps(tp, 7.2, 3, .0833), lifted = tp >= 9.6;
  const grey = tp >= 7.45 && tp < 9.9;
  E5.food.vis = !grey; E5.herb.forEach(h => h.vis = !grey); E5.flat.vis = grey;
  steamTick(E5.steam, sp, tp < 7.4 || tp >= 10.0, tp >= 11.25 ? 4 : 2);
  E5.cap.vis = tp >= 7.2 && tp < 11.2;
  E5.crush.vis = tp >= 10.3 && tp < 10.45; E5.ball.vis = tp >= 10.45; E5.capDome.vis = E5.capKnob.vis = tp < 10.3;
  // герой: сидит, замечает, перехватывает колпак, комкает, выбрасывает
  HA.root.x = TX - 170; sitPose(HA, true);
  face(HA, tp < 8.75 ? 'flat' : tp < 9.4 ? 'wow' : tp < 11.25 ? 'calm' : tp < 13.1 ? 'smile' : 'grin');
  if (tp < 8.75){ HA.head.r = .06; HA.head.y = -279; }
  if (tp >= 13.1 && tp < 18.4) HA.head.r = .1;
  let cx = TX, cy = lerp(-330, 222, capOn);
  if (tp >= 9.1 && tp < 10.75){
    const reach = steps(tp, 9.1, 3, .0833), lift = steps(tp, 9.6, 3, .0833);
    const kx = lerp(TX, TX - 120, lift), ky = lerp(88, -70, lift);   // где ручка колпака
    const hx = tp < 9.6 ? lerp(TX - 150, kx, reach) : kx, hy = tp < 9.6 ? lerp(160, ky, reach) : ky;
    ik(HA, HA.armF, hx, hy + 4, sp, 1);
    if (tp >= 9.6){ cx = kx; cy = ky + 134; }
    if (tp >= 10.3){ const [gx, gy] = worldOf(HA.armF.grip, sp); cx = gx; cy = gy; }
  }
  if (tp >= 10.75){
    // бросок через голову влево, комок улетает за кадр
    const k = steps(tp, 10.75, 5, .0833), arm = Math.min(1, k * 1.6);
    armPose(HA, 0, 0, lerp(-2.5, -3.9, arm), lerp(-.5, -.1, arm));
    const [gx, gy] = worldOf(HA.armF.grip, sp), f = clamp((k - .4) / .6);
    cx = lerp(gx, TX - 1300, f); cy = lerp(gy, -600, f) - Math.sin(f * Math.PI) * 140;
    if (tp >= 11.2) armPose(HA, 0, 0, 0, 0);
  }
  E5.cap.x = cx; E5.cap.y = cy; E5.cap.r = tp >= 10.45 ? sp * .7 : 0;
  // пар складывается в мостик
  [[2, 3], [1, 4], [0, 5]].forEach((pair, k) => pair.forEach(i => E5.bridge[i].vis = tp >= 11.9 + k * .3125 && tp < 18.75));
  E5.bridge.forEach((b, i) => { b.y = Math.sin(sp * .5 + i) * 3; });
  // ладонь на ладонь
  if (tp >= 15.0 && tp < 18.4){
    const k = steps(tp, 15.0, 3, .125);
    ik(PT, PT.armB, lerp(TX + 120, TX + 16, k), lerp(320, 240, k), sp, -1);
    ik(HA, HA.armF, lerp(TX - 110, TX - 2, steps(tp, 15.3, 3, .125)), lerp(320, 232, steps(tp, 15.3, 3, .125)), sp, 1);
  }
  const warmK = steps(tp, 16.25, 4, .125);
  E5.kitchen.warm.a = warmK; E5.lampOn.a = warmK; E5.lampGlow.a = warmK;
  // герой встаёт и идёт в детскую
  if (tp >= 18.4){ sitPose(HA, false); HA.root.x = TX - 170; face(HA, 'smile'); HA.head.r = 0; }
  if (tp >= WHIP){
    HA.root.x = lerp(KX - 700, KX - 260, E.sine(at(tp, 19.4, 1.0))); walkPose(HA, tp >= 19.4 && tp < 20.4, ph);
    face(HA, tp < 22.1 ? 'calm' : tp < 25.6 ? 'smile' : 'grin');
  }

  /* --- 5.3 детская --- */
  KD.root.x = KX + 170; KD.root.y = 420;
  face(KD, tp < 21.25 ? 'calm' : tp < 22.1 ? 'wow' : tp < 23.75 ? 'sad' : tp < 25.0 ? 'calm' : tp < 25.6 ? 'wow' : 'grin');
  if (tp >= 21.25 && tp < 22.1) KD.head.r = -.12;
  // последний кубик в ящик
  let qx, qy;
  if (tp < 21.0){
    const k = steps(tp, 20.4, 4, .125);
    ik(KD, KD.armB, lerp(KX + 110, KX + 60, k), lerp(330, 262, k), sp, -1);
    [qx, qy] = worldOf(KD.armB.grip, sp); qy -= 16;
  } else { const k = E.drop(at(tp, 21.0, .2)); qx = KX + 56; qy = lerp(246, 290, k); }
  E5.cube.x = qx; E5.cube.y = qy; E5.cube.vis = tp < 21.25; E5.cube.z = tp < 21.0 ? -2 : 1.5;
  // призрак линейки появляется над ящиком, герой мягко отводит его рукой
  const ra = tp < 21.6 ? 0 : tp < 22.6 ? steps(tp, 21.6, 4, .125) : 1 - steps(tp, 22.9, 6, .125);
  E5.ruler.a = ra; E5.ruler.vis = ra > 0;
  const push = steps(tp, 22.6, 5, .1);
  E5.ruler.x = KX + 80 + push * 380; E5.ruler.y = lerp(20, 90, steps(tp, 21.6, 6, .125)) - push * 160; E5.ruler.r = -.12 + push * .5;
  if (tp >= 22.4 && tp < 23.4){ const [lx, ly] = [E5.ruler.x - 230 * Math.cos(E5.ruler.r), E5.ruler.y - 230 * Math.sin(E5.ruler.r)]; ik(HA, HA.armF, lx, ly + 10, sp, 1); }
  // садится на корточки и показывает на чистый коврик
  if (tp >= 23.75 && tp < 29.0){
    crouchPose(HA, steps(tp, 23.75, 3, .125));
    if (tp >= 24.2) ik(HA, HA.armB, KX - 420, 330, sp, -1);
    HA.head.r = tp < 25.0 ? -.1 : .08;
  }
  if (tp >= 24.4 && tp < 25.0) KD.head.r = -.16;
  // росток с цветком
  E5.stems.forEach((s, k) => s.vis = tp >= 25.0 + k * .0833);
  E5.leaves.forEach((l, k) => l.vis = tp >= 25.33 + k * .0833);
  E5.bud.vis = tp >= 25.4 && tp < 25.6; E5.fcore.vis = tp >= 25.6;
  fan(E5.flower, tp, 25.6, 0);
  E5.sprout.r = tp >= 25.6 ? Math.sin(sp * .5) * .02 : 0;
  // ребёнок подпрыгивает трижды
  let jump = 0; JUMPS.forEach(j0 => { if (tp >= j0 && tp < j0 + .5) jump = tp < j0 + .25 ? steps(tp, j0, 3) : 1 - steps(tp, j0 + .25, 3); });
  KD.root.y = 420 - jump * 80;
  if (tp >= 26.1 && tp < 28.3) armPose(KD, 2.4, .3, -2.4, -.3);
  if (tp >= 28.3) ik(KD, KD.armB, KX + 60, 180, sp, -1);
  const warmK2 = steps(tp, 28.1, 4, .125);
  E5.kids.warm.a = warmK2;

  /* --- 5.4 отъезд, ростки на серой земле --- */
  E5.sprouts.forEach(s => growSprout(s, tp, s.t0));
}

/* ================= звук ================= */
function cues(){
  CUES.length = 0;
  cue(.2, 'drone', {dur: 4}); cue(2.2, 'whoosh', {v: .3, dir: 'up'});
  for (let k = 0; k < 4; k++) cue(5.05 + k * .3125, 'step', {pan: .1 - k * .05, v: .35});
  cue(6.4, 'clink'); cue(7.0, 'creak', {v: .3, pan: .1});
  cue(7.2, 'cap'); cue(7.45, 'thud', {v: .25, pan: 0});
  cue(9.4, 'click', {pan: -.1}); cue(9.6, 'tissue', {pan: -.1}); cue(10.3, 'crunch', {pan: -.2, v: .7}); cue(10.75, 'whoosh', {v: .45}); cue(11.2, 'drop', {pan: -.9, v: .25});
  cue(10.0, 'bubble', {dur: 2.2}); cue(11.9, 'chord', {notes: [62, 66, 69, 74, 76]});
  cue(15.3, 'pat', {pan: 0}); cue(16.25, 'glow');
  cue(18.6, 'whip');
  for (let k = 0; k < 3; k++) cue(19.45 + k * .3125, 'step', {pan: -.3, v: .4});
  cue(21.12, 'blocks'); cue(21.6, 'tissue', {pan: .3}); cue(22.6, 'whoosh', {v: .3});
  cue(23.8, 'creak', {v: .25, pan: -.2});
  for (let k = 0; k < 4; k++) cue(25.0 + k * .0833, 'fan', {pan: 0, v: .3});
  cue(25.6, 'popper'); cue(25.65, 'bell');
  JUMPS.forEach(t => { cue(t, 'hop', {pan: .2, v: .4}); cue(t + .45, 'drop', {pan: .2, v: .25}); });
  cue(28.1, 'glow');
  for (let i = 0; i < 12; i++){ const t = 33.6 + (i * 7 % 12) * .4; cue(t, 'sprout', {pan: -.8 + (i % 6) * .3, note: [74, 76, 78, 81, 83, 86][i % 6]}); }
}

/* ================= кадр ================= */
function camAt(t){ return cam(t); }
function renderAt(g, t, to = t){
  update(to);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.fillStyle = '#1d1712'; g.fillRect(0, 0, W, H);
  const c = toCam(cam(t));
  drawWorld(g, WORLD, c, to);
  grade(g, t < 7.2 ? 1 : t < 10 ? .85 : 1.05);
}
function subFor(t){ return subForPath(cam, t); }
