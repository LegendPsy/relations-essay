/* Эпизод 2 «Линейка ожидания» — к части 1 (курьер у подъезда). 40 секунд.
   Нить: одна и та же оранжевая коробка. Под высокой красной планкой Героя А она сереет,
   над низкой мятной ниткой Героя Б расцветает. Потом конвейер «девять к одному»
   и планка-весы: девять серых удач ничего не весят, одна мятая коробка тянет вниз. */
const DUR = 40, BEAT = .625;
const X2 = 3600, AUX = 3600, AUY = -3000;   // второй двор и автомат над ним
let WORLD, A, B, CU, MP, BX1, BX2, PL, SH, MINT, AU = {}, A2, ENV = {};

const heroA = () => makePerson();
const heroB = () => makePerson({body: 'B', hair: 'B', coat: '#d8b98a', coatA: '#cfae7e', coatB: '#bf9e70', lapel: '#a8865a', hairC: '#6b4a2e', skin: '#f0c09a'});
const courier = () => makePerson({body: 'jacket', hair: 'helmet', coat: '#3f8f86', coatA: '#3a857c', coatB: '#2f7068', helmet: '#f2b84e', pants: '#3b3f4f'});

function yard(x0, seed){
  const g0 = G({x: x0});
  const fl = makeFacade({x: -700, y: 300, z: 80, color: '#d9b48c', roof: '#8e4a3a'}), fr = makeFacade({x: 700, y: 300, z: 80, color: '#d9b48c', roof: '#8e4a3a'});
  const tree = makeTree(560); tree.x = 0; tree.y = 300; tree.z = 74;
  const bush = G({x: 0, y: 300, z: 60}); [[-90, -40, 80], [0, -60, 96], [90, -36, 76]].forEach(([x, y, r], i) => bush.add(N(paper({shape: S.ell(x, y, r, r * .7, 24), color: i % 2 ? COL.leaf : COL.leafD, res: .9, amp: 2.4}), {lift: 4 + i})));
  const lampPost = G({x: 330, y: 300, z: 58}).add(N(paper({shape: S.rect(-7, -520, 7, 0), color: '#4a4a52', res: 1, amp: 1}), {lift: 4}), N(paper({shape: S.rrect(-30, -580, 30, -520, 10), color: '#ffe6a3', res: 1, amp: 1.2}), {lift: 6}), N(paper({shape: S.rect(-36, -592, 36, -578), color: '#4a4a52', res: 1, amp: 1}), {lift: 6}));
  g0.add(fl.root, fr.root, tree, bush, lampPost);
  return {g: g0, fl, fr};
}

function build(){
  GRAIN = makeGrain(7);
  WORLD = G({z: 0});
  const kraft = N(paper({shape: S.rect(-3400, -5200, 8000, 2400), color: COL.kraft, amp: 0, res: .4, edge: false, texScale: 3}), {z: 150});
  WORLD.add(kraft);
  // облака по пути крана вверх
  ENV.clouds = [[900, -1500, 380], [3000, -1700, 460], [4300, -2100, 340], [2500, -2300, 300], [-400, -1300, 300], [5200, -1450, 320]].map(([x, y, w], i) => { const c = makeCloud(w); c.x = x; c.y = y; c.z = 112 + i * 4; WORLD.add(c); return c; });
  // небо над дворами тянется вверх до листа с автоматом: кран поднимается сквозь облака
  WORLD.add(N(paper({shape: S.rect(-2600, -2450, 6800, 320), color: '#cfe0e6', res: .4, amp: 5, edge: true}), {z: 120, lift: 2}));
  ENV.y1 = yard(0, 1); ENV.y2 = yard(X2, 2); WORLD.add(ENV.y1.g, ENV.y2.g);
  const mid = makeFacade({x: 1800, y: 300, z: 82, color: '#c9a07a', roof: '#6f4a3a', w: 760, cols: [-220, 0, 220]}); WORLD.add(mid.root);
  [[1250, 520], [2380, 600]].forEach(([x, h]) => { const tr = makeTree(h, '#6aa36f'); tr.x = x; tr.y = 300; tr.z = 72; WORLD.add(tr); });
  // тротуар и бордюр одной полосой через оба двора
  WORLD.add(N(paper({shape: S.rect(-2600, 268, 6800, 1400), color: '#b9b2a6', res: .5, amp: 3, deco: g => { g.strokeStyle = 'rgba(80,70,60,.16)'; g.lineWidth = 4; for (let x = -2600; x < 6800; x += 180){ g.beginPath(); g.moveTo(x, 268); g.lineTo(x - 40, 1400); g.stroke(); } }}), {z: 40, lift: 3}));
  WORLD.add(N(paper({shape: S.rect(-2600, 262, 6800, 290), color: '#d8d2c6', res: .5, amp: 2}), {z: 39, lift: 4}));
  // зелёная метка у первого подъезда
  ENV.pin = G({x: -700, y: 470, z: -2}).add(N(paper({shape: [...S.arc(0, -50, 26, 26, Math.PI * .8, Math.PI * 2.2, 18), [0, 0]], holes: [S.ell(0, -50, 9, 9, 12)], color: '#4fae74', res: 3, amp: 1}), {lift: 5}), N(paper({shape: S.ell(0, 4, 22, 6, 16), color: '#6a645b', alpha: .35, res: 3, amp: .6, edge: false}), {lift: 0, shadowA: 0}));
  WORLD.add(ENV.pin);

  // Герой А с маленькой планкой над головой (как в конце первого ролика)
  A = heroA(); A.root.x = -700; A.root.y = 420;
  A.mini = G({y: -505}); A.mini.add(N(paper({shape: S.rect(-74, -10, 74, 12), color: '#8f2416', res: 3, amp: 1.2}), {y: 4, lift: 14}), N(paper({shape: S.rect(-74, -12, 74, 10), color: COL.verm, res: 3, amp: 1.2}), {lift: 16}));
  A.root.add(A.mini); WORLD.add(A.root);
  // длинная планка: три части выдвигаются из маленькой
  PL = G({x: -230, y: -150, z: -15, vis: false});
  PL.segs = [-1, 0, 1].map(k => { const s = makePlank(330, 64, {pins: k !== 0 ? undefined : false}); s.root.x = 0; return s; });
  PL.add(PL.segs[0].root, PL.segs[2].root, PL.segs[1].root);
  WORLD.add(PL);
  SH = N(paper({shape: [[-120, 0], [120, 0], [170, 560], [-170, 560]], color: '#2a2a36', alpha: .38, res: .7, amp: 3, edge: false, tex: .5}), {x: -150, y: -118, z: 6, lift: 0, shadowA: 0, a: 0});
  WORLD.add(SH);

  // курьер на мопеде (смотрит влево)
  MP = makeMoped('#7fb2d6', -1, 1.3); MP.root.x = 1600; MP.root.y = 420; MP.root.z = 4;
  CU = courier(); sitPose(CU, true); CU.root.x = MP.seatX; CU.root.y = MP.seatY - 22 + 108; CU.root.under = true; MP.root.add(CU.root); CU.y0 = CU.root.y;
  MP.bag = N(paper({shape: S.rrect(30, -230, 130, -130, 10), color: '#e9b14a', res: 3, amp: 1.2}), {lift: 6, under: true}); CU.hip.add(MP.bag);
  MP.bubble = makeBubble(120, 84); MP.bubble.y = -560; MP.bubble.x = 160; MP.bubble.vis = false;
  MP.map = G({y: -10, r: Math.PI, dyn: true}).add(N(paper({shape: S.rect(-62, -40, 62, 40), color: '#f3ead3', res: 2.5, amp: 1.2, deco: g => { g.fillStyle = '#9fc5a0'; g.beginPath(); g.ellipse(-26, -10, 30, 18, .3, 0, TAU); g.fill(); g.fillStyle = '#8fb7d8'; g.fillRect(-62, 14, 124, 10); g.strokeStyle = '#c9a56a'; g.lineWidth = 5; g.beginPath(); g.moveTo(-50, 30); g.lineTo(0, 0); g.lineTo(46, -28); g.stroke(); g.fillStyle = COL.verm; g.beginPath(); g.arc(30, -18, 8, 0, TAU); g.fill(); }}), {lift: 9}));
  MP.bubble.add(MP.map); MP.root.add(MP.bubble);
  WORLD.add(MP.root);
  BX1 = makeBox(104, 88); BX1.root.vis = false; WORLD.add(BX1.root); BX1.root.z = -2;
  BX2 = makeBox(104, 88); BX2.root.vis = false; BX2.rays = makeRays(11, 150); BX2.rays.root.y = -44; BX2.rays.root.dz = 3; BX2.rays.root.dyn = true; BX2.root.add(BX2.rays.root); BX2.root.kids.unshift(BX2.root.kids.pop()); WORLD.add(BX2.root); BX2.root.z = -2;

  // Герой Б и мятная нитка на уровне пояса
  B = heroB(); B.root.x = X2 - 640; B.root.y = 420; WORLD.add(B.root);
  MINT = G({x: X2 - 470, y: 236, z: -6});
  MINT.add(N(paper({shape: S.band(Array.from({length: 31}, (_, i) => [-230 + i * 15.3, Math.sin(i * .9) * 7]), 9, 9), color: COL.mint, res: 2, amp: .8}), {lift: 5}));
  [-232, 232].forEach(x => MINT.add(N(paper({shape: S.ell(x, 0, 9, 9, 12), color: '#c9a24a', res: 3, amp: .6}), {lift: 7})));
  WORLD.add(MINT);

  /* ---------- бумажный автомат «девять к одному» ---------- */
  const au = G({x: AUX, y: AUY}); AU.g = au;
  const PX = 200;   // середина планки и штампа
  au.add(N(paper({shape: S.rrect(-900, -560, 1180, 640, 30), color: '#efe3c8', res: .5, amp: 3, deco: g => { g.fillStyle = 'rgba(150,110,60,.18)'; for (let x = -860; x <= 1140; x += 80){ g.beginPath(); g.arc(x, -520, 8, 0, TAU); g.fill(); g.beginPath(); g.arc(x, 600, 8, 0, TAU); g.fill(); } g.strokeStyle = 'rgba(150,110,60,.25)'; g.lineWidth = 6; g.strokeRect(-840, -500, 1960, 1080); g.fillStyle = 'rgba(150,110,60,.16)'; [[-60, 380, 90], [120, 330, 60], [420, 400, 110], [640, 320, 50]].forEach(([x, y, r]) => { g.beginPath(); for (let k = 0; k < 24; k++){ const a = k / 24 * TAU, rr = k % 2 ? r : r * .82; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); }); g.strokeStyle = 'rgba(150,110,60,.3)'; g.lineWidth = 5; g.beginPath(); g.arc(-200, -300, 90, Math.PI, TAU); g.stroke(); }}), {z: 70, lift: 6}));
  // окошко, из которого выезжают коробочки
  au.add(N(paper({shape: [[-560, 120], [-560, -40], ...S.arc(-470, -40, 90, 70, Math.PI, TAU, 12), [-380, 120]], color: '#3b3a4c', res: 1, amp: 1.6}), {z: 40, lift: 2}));
  // лента конвейера
  au.add(N(paper({shape: S.rect(-560, 120, 780, 170), color: '#5d5a5e', res: .8, amp: 1.6}), {z: 36, lift: 4}));
  AU.ticks = G({z: 35.5}); for (let k = 0; k < 25; k++) AU.ticks.add(N(paper({shape: S.rect(-4, 128, 4, 162), color: '#8d8a8e', res: 1, amp: .5}), {x: -540 + k * 56, lift: 1}));
  au.add(AU.ticks);
  [-560, 780].forEach(x => au.add(N(paper({shape: S.ell(x, 145, 34, 34, 24), holes: [S.ell(x, 145, 10, 10, 12)], color: '#3e3b40', res: 1, amp: 1}), {z: 34, lift: 5})));
  au.add(N(paper({shape: S.rect(-540, 170, -520, 640), color: '#7a6a58', res: .8, amp: 1}), {z: 37, lift: 3}), N(paper({shape: S.rect(740, 170, 760, 640), color: '#7a6a58', res: .8, amp: 1}), {z: 37, lift: 3}));
  // стойки и красная планка над лентой
  AU.posts = [PX - 330, PX + 330].map(x => N(paper({shape: S.rect(x - 10, -560, x + 10, -30), color: '#7a6a58', res: .8, amp: 1}), {z: 24, lift: 3}));
  au.add(...AU.posts);
  AU.plank = makePlank(700, 70); AU.plank.root.x = PX; AU.plank.root.y = -6; AU.plank.root.z = 20; AU.plank.root.dyn = true; au.add(AU.plank.root);
  // штамп под серединой планки
  AU.stamp = G({x: PX, y: 29, z: 21}); AU.stamp.add(N(paper({shape: S.rect(-26, 0, 26, 8), color: '#5a4636', res: 2, amp: .8}), {lift: 4}), N(paper({shape: S.rect(-40, 8, 40, 20), color: '#6e6e72', res: 2, amp: .8}), {lift: 5}));
  au.add(AU.stamp);
  // опора весов (появится в конце)
  AU.fulcrum = N(paper({shape: [[PX - 80, 120], [PX + 80, 120], [PX, 29]], color: '#7a6a58', res: 1.2, amp: 1.4}), {z: 21, lift: 6, a: 0});
  au.add(AU.fulcrum);
  // гонг слева над героем
  AU.gong = G({x: -470, y: -150, z: 40, sx: .78, sy: .78});
  AU.gong.add(N(paper({shape: S.rect(-180, -200, -162, 240), color: '#6b4a35', res: 1, amp: 1}), {lift: 4}), N(paper({shape: S.rect(162, -200, 180, 240), color: '#6b4a35', res: 1, amp: 1}), {lift: 4}), N(paper({shape: S.rect(-200, -220, 200, -194), color: '#6b4a35', res: 1, amp: 1}), {lift: 5}));
  AU.disc = G({y: -194}); AU.disc.add(N(paper({shape: S.rect(-3, 0, 3, 50), color: '#3a2a20', res: 2, amp: .5}), {lift: 3}), N(paper({shape: S.ell(0, 180, 128, 128, 48), color: '#d04a32', res: 1.4, amp: 2, deco: g => { g.strokeStyle = 'rgba(255,210,170,.35)'; g.lineWidth = 8; g.beginPath(); g.arc(0, 180, 88, 0, TAU); g.stroke(); g.fillStyle = 'rgba(120,20,0,.35)'; g.beginPath(); g.arc(0, 180, 30, 0, TAU); g.fill(); }}), {lift: 8}));
  AU.gong.add(AU.disc);
  AU.mallet = G({x: 140, y: 230, dyn: true}); AU.mallet.add(N(paper({shape: S.rect(-6, -230, 6, 0), color: '#8a6a4a', res: 2, amp: .6}), {lift: 6}), N(paper({shape: S.ell(0, -240, 26, 30, 20), color: '#f1e6cf', res: 2, amp: 1}), {lift: 8}));
  AU.gong.add(AU.mallet);
  AU.zig = Array.from({length: 9}, (_, i) => N(paper({shape: S.band([[0, 0], [40, -18], [70, 16], [110, -10], [150, 20]], 20, 12), color: i % 2 ? COL.verm : '#ef6a4a', res: 2, amp: 1}), {lift: 10, vis: false, dyn: true}));
  AU.gong.add(...AU.zig);
  au.add(AU.gong);
  // коробочки: девять золотых и одна мятая
  const dentShape = [[-48, 0], [48, 0], [50, -40], [36, -62], [44, -104], [-6, -96], [-50, -108], [-42, -56]];
  AU.boxes = Array.from({length: 10}, (_, i) => { const dent = i === 9; const b = makeBox(96, dent ? 104 : 70, '#efb93f', '#e2702e', dent ? {shape: dentShape, lidC: '#d9a237'} : {}); b.root.z = 30; b.root.vis = false; b.dent = dent; if (dent){ b.lid.r = -.22; b.lid.y = -100; b.box.kids = []; } au.add(b.root); return b; });
  // серая корзина с прорезью (поверх упавших коробок)
  AU.basket = G({x: 880, y: 470, z: 30});
  AU.bBack = N(paper({shape: S.rect(-130, -180, 130, 0), color: '#77757a', res: 1.2, amp: 1.6}), {dz: 1, lift: 3});
  AU.bFront = N(paper({shape: [[-136, -130], [136, -130], [120, 0], [-120, 0]], color: '#8e8c90', res: 1.2, amp: 1.8, deco: g => { g.fillStyle = 'rgba(40,40,40,.25)'; g.fillRect(-60, -112, 120, 12); for (let x = -100; x <= 100; x += 40) g.fillRect(x, -82, 6, 70); }}), {dz: -1, lift: 6});
  AU.basket.add(AU.bBack, AU.bFront);
  au.add(AU.basket);
  // Герой А у автомата
  A2 = heroA(); A2.root.x = -380; A2.root.y = 540; A2.root.z = -12; au.add(A2.root);
  WORLD.add(au);
  // кулисы: ветки сверху у первого двора, куст снизу у второго, шестерёнки у автомата
  const tw = makeTwigs(3); tw.x = 500; tw.y = -720; tw.z = -120; WORLD.add(tw);
  const tw2 = makeTwigs(5); tw2.x = X2 + 1250; tw2.y = -640; tw2.z = -120; WORLD.add(tw2);
  const fb = G({x: X2 - 1150, y: 760, z: -100}); [[-120, 0, 160], [80, -40, 190], [260, 10, 150]].forEach(([x, y, r], i) => fb.add(N(paper({shape: S.ell(x, y, r, r * .62, 26), color: i % 2 ? '#3f7d57' : '#2f6447', res: .5, amp: 3}), {lift: 6}))); WORLD.add(fb);
  AU.gears = [[-1350, -400, 170], [1400, 520, 210], [1300, -620, 130]].map(([x, y, r], i) => { const gg = G({x: AUX + x, y: AUY + y, z: -110, dyn: true}); gg.add(N(paper({shape: S.star(0, 0, r, r * .8, 12, 0), holes: [S.ell(0, 0, r * .3, r * .3, 18)], color: i % 2 ? '#c98f3c' : '#b07a33', res: .5, amp: 2}), {lift: 6})); WORLD.add(gg); return gg; });
}

/* ================= камера ================= */
const cam = path([
  [0, {x: -470, y: -40, ls: Math.log(.98), roll: -.008}],
  [3.75, {x: -330, y: -50, ls: Math.log(1.0), roll: -.002}],
  [7.6, {x: -220, y: -30, ls: Math.log(1.06), roll: .004}],
  [9.4, {x: -230, y: 20, ls: Math.log(1.5), roll: .008}],
  [12.5, {x: -215, y: 24, ls: Math.log(1.62), roll: .004}],
  [15.6, {x: -240, y: 28, ls: Math.log(1.7), roll: -.004}],
  [16.25, {x: -150, y: 20, ls: Math.log(1.55), roll: -.01}],
  [17.25, {x: 3060, y: -10, ls: Math.log(1.15), roll: .012}],
  [19.4, {x: 3080, y: 0, ls: Math.log(1.25), roll: .004}],
  [21.6, {x: 3010, y: 26, ls: Math.log(1.55), roll: -.004}],
  [24.4, {x: 3040, y: 10, ls: Math.log(1.45), roll: .002}],
  [26.5, {x: AUX + 120, y: AUY + 140, ls: Math.log(1.1), roll: -.006}, {stop: true}],
  [29.0, {x: AUX + 170, y: AUY + 150, ls: Math.log(1.14), roll: .002}],
  [31.6, {x: AUX + 200, y: AUY + 140, ls: Math.log(1.19), roll: .006}],
  [32.6, {x: AUX - 230, y: AUY + 70, ls: Math.log(1.55), roll: -.01}],
  [34.2, {x: AUX - 220, y: AUY + 80, ls: Math.log(1.58), roll: -.004}],
  [36.0, {x: AUX + 190, y: AUY + 70, ls: Math.log(1.26), roll: .004}],
  [40, {x: AUX + 200, y: AUY + 70, ls: Math.log(1.34), roll: .002}],
]);
const shake = t => { const u = t - 32.5; if (u < 0 || u > .8) return [0, 0]; const k = Math.exp(-u * 6); return [Math.sin(u * 40) * 9 * k, Math.cos(u * 31) * 7 * k]; };

/* ================= действие ================= */
function update(t){
  const tp = stepT(t), sp = Math.floor(t * 12 + 1e-6);
  /* --- 2.1 двор, курьер тормозит между домами --- */
  // Герой А оглядывается, потом три рывка-шага к курьеру
  const stepK = tp < 5.0 ? 0 : Math.min(3, Math.floor((tp - 5.0) / BEAT) + 1);
  const inStep = tp >= 5.0 && tp < 6.875 && ((tp - 5.0) % BEAT) < .25;
  A.root.x = -700 + stepK * 110 - (inStep ? 55 : 0) + (tp >= 8.75 ? Math.min(1, steps(tp, 8.9, 2, .125)) * 60 : 0);
  walkPose(A, inStep, stepK, 1.1);
  A.coat.soak = stepK * .2 + (tp > 13.75 ? .2 : 0);
  face(A, tp < 1.0 ? 'calm' : tp < 4.6 ? 'calm' : tp < 13.2 ? 'annoyed' : 'flat');
  A.head.r = tp < 1.2 ? 0 : tp < 2.6 ? -.06 : tp < 3.8 ? .07 : 0;
  A.eyeL.x = -21 + (tp > 1.2 && tp < 2.6 ? -3 : tp > 2.6 && tp < 6.9 ? 3 : 0); A.eyeR.x = 21 + (tp > 1.2 && tp < 2.6 ? -3 : tp > 2.6 && tp < 6.9 ? 3 : 0);
  // скрежет раздражения: планка над головой дрожит
  A.mini.r = tp > 5 && tp < 9.3 ? (hash(4, sp) - .5) * .08 : 0;
  // курьер въезжает справа и тормозит между домами с рывком
  let mx;
  if (tp < 16.6){ const u = at(tp, 1.25, 2.5); mx = lerp(1600, 0, 1 - Math.pow(1 - u, 2.2)); MP.root.r = tp > 3.75 && tp < 4.1 ? -.03 : 0; }
  else { const u = at(tp, 17.25, 2.15); mx = lerp(X2 + 1500, X2 - 320, 1 - Math.pow(1 - u, 2.6)); MP.root.r = 0; }
  MP.root.x = mx;
  const moving = (tp > 1.25 && tp < 3.75) || (tp > 17.25 && tp < 19.4);
  [MP.wB, MP.wF].forEach(w => w.r = -mx / 44);
  MP.root.y = 420 + (moving ? (sp % 2) * -2 : (tp > 3.75 && tp < 9 || tp > 19.4 && tp < 25 ? (sp % 4 === 0 ? -1.5 : 0) : 0));
  MP.light.a = (tp < 16 && tp > 3.75) ? .5 : 1;
  // облачко с перевёрнутой картой
  const bub = tp >= 3.9 && tp < 8.6; MP.bubble.vis = bub; const bk = steps(tp, 3.9, 3); MP.bubble.sx = MP.bubble.sy = bub ? .5 + .5 * bk : 0;
  MP.map.r = Math.PI + (hash(2, Math.floor(sp / 3)) - .5) * .16;
  face(CU, tp < 9 ? 'calm' : tp < 15 ? 'sad' : tp < 20.6 ? 'calm' : 'grin');
  // руки курьера на руле, пока едет
  armPose(CU, 1.05, -.55, -.2, .1);
  // курьер расправляет плечи: выше и с более мягкой длинной тенью
  const proud = tp >= 17.25 ? steps(tp, 22.5, 3, .125) : 0;
  CU.root.y = CU.y0 - proud * 14; CU.coat.lift = 5 + proud * 10; CU.root.sx = CU.root.sy = 1 + proud * .03;
  /* --- 2.2 планка выдвигается, коробка гаснет в тени --- */
  const plOn = tp >= 9.375 && tp < 16.6;
  A.mini.vis = !plOn;
  PL.vis = plOn; const ext = steps(tp, 9.375, 3, .125);
  PL.segs[0].root.x = -ext * 300; PL.segs[2].root.x = ext * 300;
  PL.x = lerp(A.root.x, -230, steps(tp, 9.375, 2, .125)); PL.y = lerp(-85, -150, steps(tp, 9.375, 2, .125));
  SH.a = tp >= 10.0 && plOn ? steps(tp, 10.0, 4) : 0;
  // курьер протягивает коробку, она пересекает тень, сереет и осыпается
  BX1.root.vis = tp >= 10.0 && tp < 16.6;
  // Герой А тянет руку и берёт серый комок
  if (tp >= 13.3 && tp < 16.6){ const k = E.out(at(tp, 13.3, .5)); A.armF.sh.r = lerp(0, -1.05, k); A.armF.el.r = lerp(0, -.5, k); }
  if (tp >= 10.0 && tp < 16.6){
    const reach = E.out(at(tp, 10.0, .625)), take = tp >= 13.75 ? E.io(at(tp, 13.75, .5)) : 0;
    armPose(CU, lerp(lerp(1.05, 1.42, reach), 1.05, take), lerp(lerp(-.55, -.05, reach), -.55, take), -.2, .1);
    const gk = steps(tp, 11.875, 3, .125);
    BX1.grey.forEach(n => n.grey = gk);
    const ck = at(tp, 12.5, 1.0);
    BX1.box.vis = BX1.lid.vis = tp < 13.1; BX1.lump.vis = tp >= 13.1;
    BX1.lid.r = tp >= 12.5 ? -steps(tp, 12.5, 3, .125) * .9 : 0;
    crumble(BX1, tp >= 12.5 ? ck : 0, 5);
    // коробка в руке курьера, потом комок у героя
    const [hx, hy] = worldOf(CU.armB.grip, sp), [ax, ay] = worldOf(A.armF.grip, sp);
    BX1.root.x = lerp(hx - 20, ax + 30, take); BX1.root.y = lerp(hy + 30, ay + 36, take);
    BX1.root.r = tp >= 13.1 ? (hash(8, Math.floor(sp / 2)) - .5) * .06 : 0;
  }
  /* --- 2.3 второй двор, Герой Б --- */
  B.root.x = X2 - 640;
  const bl = tp >= 20.625; // коробка выше нитки
  face(B, tp < 19.4 ? 'calm' : tp < 20.625 ? 'calm' : tp < 21.25 ? 'wow' : 'smile');
  if (tp >= 21.25) { const k = steps(tp, 21.25, 3, .125); armPose(B, 0, 0, lerp(0, .5, k), lerp(0, 2.05, k)); } else armPose(B, 0, 0, 0, 0);
  B.head.r = tp > 21.25 ? -.04 : 0;
  BX2.root.vis = tp >= 19.6 && tp < 25.5;
  if (tp >= 17.25){
    // курьер сразу у подъезда: поднимает коробку выше нитки
    const lift = steps(tp, 19.6, 4, .25);
    const a0 = 1.05, a1 = 2.25;
    if (tp >= 19.6) armPose(CU, lerp(a0, a1, lift), lerp(-.55, -.25, lift), -.2, .1);
    const [hx, hy] = worldOf(CU.armB.grip, sp);
    BX2.root.x = hx - 30; BX2.root.y = hy + 30;
    fan(BX2.rays, tp, 20.625, .2);
    BX2.lid.r = bl ? -steps(tp, 20.625, 3, .125) * 1.15 : 0;
    BX2.lid.x = -52 - 5 - (bl ? 12 : 0);
  }
  MINT.kids[0].boil = .6;
  /* --- 2.4 автомат --- */
  const PX = 200, v = 720, X0 = -470;
  const belt = tp < 32.5 ? tp : 32.5;
  AU.ticks.x = -((Math.floor(belt * 12) * 60) % 56);
  const startT = i => i < 9 ? 25.32 + i * BEAT : 32.12;
  const slots = [[-70, 0], [0, 4], [70, -2], [-36, -46], [36, -42], [-74, -52], [2, -90], [70, -84], [-40, -100]];
  AU.boxes.forEach((b, i) => {
    const t0 = startT(i), run = belt - t0;
    b.root.vis = tp >= t0;
    if (!b.root.vis) return;
    if (!b.dent){
      const xx = X0 + stepT(Math.max(0, run)) * v;
      b.grey.forEach(n => n.grey = xx >= PX ? 1 : 0);
      if (xx < 790){ b.root.x = xx; b.root.y = 120; b.root.r = 0; b.root.z = 30; }
      else { // падает в корзину и остаётся в куче
        const k = Math.min(1, (xx - 790) / v / .45), sl = slots[i];
        b.root.x = lerp(790, 880 + sl[0], Math.min(1, k * 1.4)); b.root.y = lerp(120, 462 + sl[1], E.drop(k)); b.root.r = lerp(0, (hash(i, 3) - .5) * .5, k); b.root.z = 30.5;
      }
    } else {
      b.root.x = Math.min(PX - 350 - 50, X0 + stepT(Math.max(0, run)) * v); b.root.y = 120; b.root.r = tp >= 32.5 ? -.06 : 0;
    }
  });
  // штамп бьёт, когда коробка под ним
  const hit = AU.boxes.some((b, i) => !b.dent && tp >= startT(i) && Math.abs(X0 + stepT(tp - startT(i)) * v - PX) < 61);
  AU.stamp.y = 29 + (hit && tp < 32.5 ? 18 : 0);
  // десятая задевает планку — гонг
  const jolt = tp >= 32.5 && tp < 33.0;
  AU.plank.root.r = jolt ? (hash(9, sp) - .5) * .05 : 0; AU.plank.root.x = PX + (jolt ? (hash(11, sp) - .5) * 14 : 0);
  AU.mallet.r = tp < 32.3 ? 0 : tp < 32.5 ? -.5 : tp < 32.7 ? .12 : 0;
  AU.disc.r = tp >= 32.5 ? Math.sin((tp - 32.5) * 9) * .08 * Math.exp(-(tp - 32.5) * 1.5) : 0;
  AU.zig.forEach((z, i) => { const k = steps(tp, 32.5, 5, .125); z.vis = tp >= 32.5 && tp < 34.4; const a = i / AU.zig.length * TAU + .3; const d = 140 + k * 220; z.x = Math.cos(a) * d; z.y = -14 + 180 + Math.sin(a) * d; z.r = a; });
  // Герой А не поворачивает головы, а на гонге хватается за голову
  const grab = tp >= 32.75 && tp < 35.2 ? steps(tp, 32.75, 3, .125) : 0;
  armPose(A2, lerp(0, 2.55, grab), lerp(0, 1.3, grab), lerp(0, -2.55, grab), lerp(0, -1.3, grab));
  face(A2, tp < 32.75 ? 'flat' : tp < 35.6 ? 'angry' : 'sad');
  A2.coat.soak = .35;
  A2.head.r = tp > 35.9 ? .08 : 0; const look = tp > 35.9 ? 4 : 0; A2.eyeL.x = -21 + look; A2.eyeR.x = 21 + look;
  /* --- 2.5 планка-весы --- */
  const pfold = steps(tp, 34.4, 3, .125);
  AU.posts.forEach(p => { p.a = 1 - pfold; });
  AU.stamp.vis = tp < 34.4;
  AU.fulcrum.a = tp >= 34.4 ? steps(tp, 34.4, 3, .125) : 0;
  const tk = at(tp, 36.25, .75), tilt = tp < 36.25 ? 0 : -.2 * steps(tp, 36.25, 4, .125) * (1 + Math.sin(tk * Math.PI) * .25 * (1 - tk));
  if (tp >= 34.4) AU.plank.root.r = tilt;
  const onPlank = (dx, dy) => [PX + dx * Math.cos(tilt) - dy * Math.sin(tilt), -6 + dx * Math.sin(tilt) + dy * Math.cos(tilt)];
  // мятая коробка запрыгивает на левый край
  const dent = AU.boxes[9];
  if (tp >= 35.0){ const hk = steps(tp, 35.0, 3, .125); const [px, py] = onPlank(-270, -35); dent.root.x = lerp(PX - 400, px, hk); dent.root.y = lerp(120, py, hk) - Math.sin(hk * Math.PI) * 60; dent.root.r = tilt - .06; dent.root.z = 19; }
  // корзина с девятью серыми — на правый край
  const bkt = AU.basket;
  if (tp >= 35.625){ const hk = steps(tp, 35.625, 4, .125); const [px, py] = onPlank(270, -35); bkt.x = lerp(880, px, hk); bkt.y = lerp(470, py, hk) - Math.sin(hk * Math.PI) * 120; bkt.r = tilt; bkt.z = lerp(30, 19, hk); }
  else { bkt.x = 880; bkt.y = 470; bkt.r = 0; bkt.z = 30; }
  if (tp >= 35.625) AU.boxes.slice(0, 9).forEach((b, i) => { const [dx, dy] = [slots[i][0], slots[i][1] - 8], c = Math.cos(bkt.r), sn = Math.sin(bkt.r); b.root.x = bkt.x + dx * c - dy * sn; b.root.y = bkt.y + dx * sn + dy * c; b.root.z = bkt.z + .5; b.root.r = bkt.r + (hash(i, 3) - .5) * .5; });
  // шестерёнки кулисы
  AU.gears.forEach((g0, i) => g0.r = (i % 2 ? -1 : 1) * Math.floor(Math.min(tp, 32.5) * 12) * .04);
}

/* ================= звук ================= */
function cues(){
  CUES.length = 0;
  cue(.2, 'door', {pan: -.5});
  cue(1.25, 'moped', {dur: 2.6, pan: .6, to: 0}); cue(3.75, 'brake', {pan: .1}); cue(3.85, 'idle', {dur: 5.2, pan: .1});
  cue(3.9, 'pop', {pan: .2});
  [5.0, 5.625, 6.25].forEach((t, i) => { cue(t, 'step', {pan: -.4 + i * .1, v: .6}); cue(t + .05, 'scrape', {pan: -.3, v: .35 + i * .12}); });
  [9.375, 9.5, 9.625].forEach(t => cue(t, 'click', {pan: -.1}));
  cue(10.0, 'shade');
  cue(11.875, 'snip', {pan: -.1}); cue(12.5, 'crumble', {pan: -.15}); cue(13.75, 'flop', {pan: -.2});
  cue(16.25, 'whip'); cue(17.25, 'moped', {dur: 2.2, pan: .6, to: .1, sweet: true}); cue(19.45, 'idle', {dur: 5, pan: .1, soft: true});
  cue(20.625, 'bloom', {pan: 0}); cue(20.7, 'tissue', {pan: 0}); cue(21.25, 'soft', {pan: -.2});
  cue(24.6, 'whoosh', {v: .55, dir: 'up'});
  for (let i = 0; i < 9; i++){ const t = 26.25 + i * BEAT; cue(t, 'stamp', {pan: 0, v: .55}); cue(t + 1.1 + .33, 'drop', {pan: .6, v: .35}); }
  cue(32.5, 'gong'); cue(32.52, 'zap', {pan: -.4}); cue(32.75, 'gasp', {pan: -.5});
  cue(34.4, 'fold', {pan: 0}); cue(35.0, 'hop', {pan: -.2}); cue(35.625, 'hop', {pan: .3, v: .7});
  cue(36.25, 'beam'); cue(36.9, 'thud', {v: .5});
}

/* ================= кадр ================= */
function camAt(t){ return cam(t); }
function renderAt(g, t, to = t){
  update(to);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.fillStyle = '#1d1712'; g.fillRect(0, 0, W, H);
  const c = toCam(cam(t)); const [sx, sy] = shake(t); c.x += sx; c.y += sy;
  drawWorld(g, WORLD, c, to);
  grade(g, t > 24.6 ? .8 : 1);
}
function subFor(t){ return subForPath(cam, t); }
