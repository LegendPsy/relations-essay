/* Эпизод 3 «Три слоя вместо крепости» — к части 2 (незаметная функция возмущения). 40 секунд.
   Нить: красная планка. Пьедестал правоты растёт от каждого повода и запирает героя в туче;
   внизу она стоит стеной страха; стена расслаивается на окно-факт, солнце-желание и синий щит-границу;
   в конце синяя граница поднимается там, где человека придавили. */
const DUR = 40, BEAT = .625;
const P2X = 2000;
let WORLD, FEAR, WIPE, HA, P2, E3 = {}, FR = {};

function build(){
  GRAIN = makeGrain(7);
  WORLD = G({z: 0});
  WORLD.add(N(paper({shape: S.rect(-3600, -4200, 5200, 2400), color: COL.kraft, amp: 0, res: .4, edge: false, texScale: 3}), {z: 150}));
  WORLD.add(N(paper({shape: S.rect(-3000, -2400, 4600, 320), color: '#cfe0e6', res: .35, amp: 5}), {z: 120, lift: 2}));
  E3.clouds = [[-900, -1500, 360], [700, -1900, 420], [1900, -1300, 330], [-200, -2300, 300], [2900, -1800, 380]].map(([x, y, w], i) => { const c = makeCloud(w); c.x = x; c.y = y; c.z = 110 + i * 3; WORLD.add(c); return c; });
  const cols = ['#d9b48c', '#c9a07a', '#d7c08f', '#c79a86', '#d9b48c', '#bfa27c', '#d2b08a'];
  [-1800, -900, 0, 900, 1800, 2700, 3600].forEach((x, i) => { const f = makeFacade({x, y: 300, z: 80, h: 900, rows: [-760, -520], color: cols[i], roof: i % 2 ? '#6f4a3a' : '#8e4a3a', w: 840, cols: [-250, 0, 250]}); WORLD.add(f.root); });
  WORLD.add(N(paper({shape: S.rect(-3000, 268, 4600, 1400), color: '#b9b2a6', res: .5, amp: 3, deco: g => { g.strokeStyle = 'rgba(80,70,60,.16)'; g.lineWidth = 4; for (let x = -3000; x < 4600; x += 180){ g.beginPath(); g.moveTo(x, 268); g.lineTo(x - 40, 1400); g.stroke(); } }}), {z: 40, lift: 3}));
  WORLD.add(N(paper({shape: S.rect(-3000, 262, 4600, 290), color: '#d8d2c6', res: .5, amp: 2}), {z: 39, lift: 4}));

  // Герой А и его румянец
  HA = makePerson(); HA.root.x = -900; HA.root.y = 420;
  HA.flush = N(paper({shape: S.ell(0, 4, 56, 56, 40), color: '#e2483a', alpha: .3, res: 8, amp: 1, edge: false, tex: 0}), {lift: .3, shadowA: 0, a: 0}); HA.head.add(HA.flush);
  HA.blot = N(paper({shape: [[-30, -10], [-10, -26], [18, -20], [34, -2], [22, 18], [-6, 22], [-28, 12]], color: '#9b9d9f', alpha: .9, res: 4, amp: 3}), {x: 46, y: -4, lift: 2, vis: false}); HA.hip.add(HA.blot);
  // корона: три фазы складывания
  HA.crown = [
    N(paper({shape: S.rect(-50, -14, 50, 0), color: '#e9b83a', res: 6, amp: 1}), {lift: 4}),
    N(paper({shape: [[-50, 0], [-50, -22], [-30, -12], [0, -26], [30, -12], [50, -22], [50, 0]], color: '#e9b83a', res: 6, amp: 1}), {lift: 4}),
    N(paper({shape: [[-52, 0], [-56, -50], [-28, -22], [0, -62], [28, -22], [56, -50], [52, 0]], color: '#efc03f', res: 6, amp: 1, deco: g => { g.fillStyle = COL.verm; g.beginPath(); g.arc(0, -16, 6, 0, TAU); g.fill(); }}), {lift: 5}),
  ];
  const crownG = G({y: -60}); crownG.add(...HA.crown); HA.head.add(crownG);
  // плечи супергероя
  HA.pads = [-1, 1].map(s => N(paper({shape: [[s * 30, -224], [s * 98, -226], [s * 104, -196], [s * 40, -192]], color: '#e9b83a', res: 4, amp: 1}), {lift: 7, vis: false}));
  HA.hip.add(...HA.pads);
  // рупор
  HA.horn = G({dyn: true}); HA.horn.add(N(paper({shape: [[0, -12], [130, -48], [130, 48], [0, 12]], color: COL.verm, res: 3, amp: 1.2, deco: g => { g.fillStyle = 'rgba(80,0,0,.25)'; g.fillRect(100, -48, 30, 96); }}), {lift: 8})); HA.horn.vis = false;
  // планка-ватерпас с пузырьком
  E3.level = G({z: -4});
  E3.level.add(N(paper({shape: S.rect(-170, -20, 170, 20), color: '#cf3b27', res: 2, amp: 1.4}), {lift: 6}), N(paper({shape: S.rrect(-34, -12, 34, 12, 10), color: '#e7f3e8', alpha: .9, res: 3, amp: .8}), {lift: 7}));
  E3.vial = N(paper({shape: S.ell(0, 0, 9, 7, 12), color: '#7fd08f', res: 3, amp: .4}), {lift: 7.5}); E3.level.add(E3.vial);
  // пьедестал-гармошка и мятые ступени
  E3.tower = G({x: -150, y: 420, z: 2});
  E3.segs = Array.from({length: 5}, (_, k) => { const d = k % 2 ? 14 : -14; return N(paper({shape: [[-150 + d, 0], [150 + d, 0], [150 - d, -112], [-150 - d, -112]], color: k % 2 ? '#c9372a' : '#d8432e', res: 1.2, amp: 1.6, deco: g => { g.fillStyle = 'rgba(70,0,0,.18)'; g.fillRect(-180, -112, 360, 14); }}), {y: -k * 110, lift: 6, vis: false}); });
  E3.crump = Array.from({length: 4}, (_, k) => N(paper({shape: S.ell(0, -60, 132 - k * 18, 64, 20), color: k % 2 ? '#c63426' : '#d9442f', res: 1.2, amp: 7, deco: g => { g.strokeStyle = 'rgba(80,0,0,.28)'; g.lineWidth = 3; for (let i = 0; i < 7; i++){ g.beginPath(); g.moveTo(-100 + i * 30, -110); g.lineTo(-80 + i * 26, -10); g.stroke(); } }}), {x: [26, -30, 34, -18][k], y: -550 - k * 110, lift: 7, vis: false}));
  E3.tower.add(...E3.segs, ...E3.crump);
  WORLD.add(E3.tower, HA.root, E3.level, HA.horn);
  // карусель поводов: кривая машина, стаканчик с кривой крышкой, телевизор, ценник с лишним кружком
  E3.ring = [];
  const car = G({}); car.add(N(paper({shape: S.rrect(-90, -50, 90, 0, 14), color: '#5f8fc4', res: 2, amp: 1.2}), {lift: 6}), N(paper({shape: S.rrect(-50, -86, 40, -46, 14), holes: [S.rect(-38, -78, -8, -54), S.rect(2, -78, 30, -54)], color: '#5f8fc4', res: 2, amp: 1.2}), {lift: 6}), ...[-54, 54].map(x => N(paper({shape: S.ell(x, 0, 20, 20, 16), color: '#27242a', res: 2, amp: .8}), {lift: 7}))); car.r = .2;
  const cup = G({}); cup.add(N(paper({shape: [[-30, 0], [30, 0], [40, -96], [-40, -96]], color: '#f1ead8', res: 2, amp: 1, deco: g => { g.fillStyle = '#8a5a3a'; g.fillRect(-40, -64, 80, 26); }}), {lift: 6}), N(paper({shape: S.rrect(-46, -112, 46, -94, 6), color: '#3d3a38', res: 2, amp: .8}), {x: 10, y: -8, r: .35, lift: 7}));
  const tv = G({}); tv.add(N(paper({shape: S.rrect(-80, -120, 80, 0, 10), holes: [S.rect(-62, -104, 62, -18)], color: '#4a4a52', res: 2, amp: 1.2}), {lift: 7}), N(paper({shape: S.rect(-64, -106, 64, -16), color: '#a9cde3', res: 2, amp: .8}), {lift: 3}), N(paper({shape: S.ell(0, -74, 24, 26, 18), color: '#f1c8a2', res: 2, amp: .6}), {lift: 4}), N(paper({shape: S.rect(-34, -48, 34, -16), color: '#6b4a35', res: 2, amp: .6}), {lift: 4}), N(paper({shape: S.ell(0, -62, 9, 10, 12), color: '#7d3b2f', res: 2, amp: .4}), {lift: 5}), N(paper({shape: S.band([[-30, -126], [-56, -170]], 4, 4), color: '#4a4a52', res: 2, amp: .3}), {lift: 6}));
  const tag = G({}); tag.add(N(paper({shape: [[-50, -100], [30, -100], [62, -50], [30, 0], [-50, 0]], holes: [S.ell(34, -50, 8, 8, 10)], color: '#f3e3b8', res: 2, amp: 1}), {lift: 6}), N(paper({shape: S.ell(-14, -50, 22, 22, 18), color: '#e2483a', res: 2, amp: .8}), {lift: 7}));
  [car, cup, tv, tag].forEach((it, i) => { const g0 = G({dyn: true}); g0.add(it); g0.th = i / 4 * TAU; g0.hit = N(paper({shape: [[0, -24], [34, 0], [0, 24]], color: COL.verm, res: 3, amp: .8}), {x: -20, y: -60, lift: 9, vis: false}); g0.add(g0.hit); E3.ring.push(g0); WORLD.add(g0); });
  E3.shots = Array.from({length: 4}, () => { const n = N(paper({shape: [[0, -16], [40, 0], [0, 16]], color: '#ef5a3e', res: 3, amp: .8}), {lift: 10, vis: false, dyn: true}); WORLD.add(n); return n; });
  // туча над башней
  E3.storm = makeCloud(700, '#8d8f96'); E3.storm.z = -14; E3.storm.kids.forEach(k => k.dyn = false); WORLD.add(E3.storm);

  // красная стена-монолит: три слоя под красной склейкой
  E3.wall = G({x: 170, y: 420, z: 0});
  E3.kalka = N(paper({shape: S.rect(-170, -1100, 170, 0), holes: [S.rect(-128, -1040, 128, -300)], color: '#eef1f2', alpha: .85, res: .9, amp: 2.4, deco: g => { g.fillStyle = 'rgba(150,170,180,.25)'; g.fillRect(-170, -1100, 340, 1100); }}), {lift: 6});
  E3.kalkaGlass = N(paper({shape: S.rect(-130, -1042, 130, -298), color: '#e8f1f4', alpha: .22, res: .7, amp: 1.6, edge: false, tex: .3}), {lift: 1, shadowA: 0});
  E3.yellow = N(paper({shape: S.rect(-170, -1100, 170, 0), color: '#efb93f', res: .9, amp: 2.4}), {x: 12, y: -12, dz: -1, lift: 6});
  E3.blue = N(paper({shape: S.rect(-170, -1100, 170, 0), color: COL.blue, res: .9, amp: 2.4}), {dz: -2, lift: 6});
  E3.red = N(paper({shape: S.rect(-182, -1136, 206, 6), color: '#cf3b27', res: .9, amp: 2.6, texScale: .7, deco: g => { const q = rng(29); g.strokeStyle = 'rgba(90,10,0,.22)'; g.lineWidth = 2; for (let i = 0; i < 60; i++){ const y = -1090 + q() * 1080, x = -170 + q() * 300; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 40 + q() * 60, y + (q() - .5) * 4); g.stroke(); } }}), {dz: -3, lift: 8});
  E3.flap = G({x: 206, y: -1136, dz: -3.5, dyn: true}); E3.flap.add(N(paper({shape: [[0, 0], [0, 150], [-150, 0]], color: '#b9301f', res: 1.4, amp: 1.6}), {lift: 10}));
  E3.kalkaG = G({x: 24, y: -24}); E3.kalkaG.add(E3.kalka, E3.kalkaGlass);
  E3.wall.add(E3.kalkaG, E3.yellow, E3.blue, E3.red, E3.flap);
  WORLD.add(E3.wall);
  E3.sun = makeSun(100); E3.sun.root.vis = false; E3.sun.root.z = 90; WORLD.add(E3.sun.root);
  E3.shield = makeShield(110); E3.shield.root.vis = false; E3.shield.root.dyn = true; WORLD.add(E3.shield.root);
  E3.burrs = Array.from({length: 7}, (_, i) => { const b = makeBurr(i < 3 ? 34 : 22); b.vis = false; WORLD.add(b); return b; });
  E3.sweat = Array.from({length: 3}, () => { const d = N(paper({shape: [[0, -16], [9, 2], [0, 10], [-9, 2]], color: '#9fd3f0', res: 4, amp: .5}), {lift: 4, vis: false}); HA.head.add(d); return d; });
  // пузырь фантазии
  E3.bub = G({z: -50, vis: false}); E3.bubSkin = N(paper({shape: S.ell(0, 0, 150, 110, 40), color: '#6a4fa0', res: 2, amp: 2}), {lift: 8}); E3.bub.add(E3.bubSkin, N(paper({shape: S.ell(-120, 130, 22, 18, 16), color: '#6a4fa0', res: 2, amp: 1}), {lift: 8}), N(paper({shape: S.ell(-160, 186, 12, 10, 12), color: '#6a4fa0', res: 2, amp: .8}), {lift: 8}));
  E3.mask = N(paper({shape: S.ell(0, 0, 146, 106, 40), color: '#000', res: 2, amp: 1.6, edge: false, tex: 0, tone: false}), {vis: false}); E3.bub.add(E3.mask);
  WORLD.add(E3.bub);
  // кулиса: ветки сверху слева
  const tw = makeTwigs(7); tw.x = -700; tw.y = -720; tw.z = -120; WORLD.add(tw);
  // машина на переднем плане (в расфокусе)
  E3.car = G({x: -2400, y: 430, z: -60}); E3.car.add(N(paper({shape: S.rrect(-260, -130, 260, 0, 34), color: '#2f2c34', res: .8, amp: 2}), {lift: 8}), N(paper({shape: S.rrect(-150, -230, 120, -120, 40), holes: [S.rect(-120, -210, -20, -134), S.rect(0, -210, 96, -134)], color: '#2f2c34', res: .8, amp: 2}), {lift: 8}), ...[-160, 160].map(x => N(paper({shape: S.ell(x, 0, 56, 56, 24), color: '#141216', res: .8, amp: 1.5}), {lift: 9})));
  WORLD.add(E3.car);
  E3.splat = N(paper({shape: [[-30, -10], [-10, -26], [18, -20], [34, -2], [22, 18], [-6, 22], [-28, 12]], color: '#9b9d9f', alpha: .9, res: 3, amp: 3}), {z: -20, lift: 14, vis: false, dyn: true}); WORLD.add(E3.splat);

  /* ---------- сгорбленный человек под чёрной тенью ---------- */
  P2 = makePerson({body: 'sweater', hair: 'bob', coat: '#a7a3b8', coatA: '#9d99ae', coatB: '#8a8699', hairC: '#5a4a44', skin: '#eab896'}); P2.root.x = P2X; P2.root.y = 420; WORLD.add(P2.root);
  E3.mud = N(paper({shape: S.ell(0, 0, 330, 46, 30), color: '#6b5a44', res: .8, amp: 4, deco: g => { g.fillStyle = 'rgba(40,30,20,.3)'; g.beginPath(); g.ellipse(-60, 6, 140, 18, 0, 0, TAU); g.fill(); }}), {x: P2X + 330, y: 470, z: 8, lift: 1});
  WORLD.add(E3.mud);
  E3.bgate = G({x: P2X + 140, y: 230, z: -2, dyn: true});
  E3.bplank = makePlank(460, 96, {color: COL.blue, colorD: COL.blueD}); E3.bplank.root.x = 230; E3.bgate.add(E3.bplank.root); WORLD.add(E3.bgate);
  E3.panels = [1, 2].map(k => { const pl = makePlank(460, 96, {color: k % 2 ? '#4f82d6' : COL.blue, colorD: COL.blueD, pins: false}); pl.root.vis = false; pl.root.z = -2; pl.root.dyn = true; WORLD.add(pl.root); return pl; });
  E3.bolt = N(paper({shape: S.rect(-34, -12, 34, 12), color: '#c9a24a', res: 3, amp: .8}), {lift: 12, vis: false, dyn: true}); WORLD.add(E3.bolt);
  E3.shadow = G({x: P2X + 640, y: 420, z: -40});
  const shp = [[-120, 0], [200, 0], [260, -380], [160, -660], [0, -780], [-180, -720], [-250, -560], [-360, -320], [-330, -40], [-220, -30], [-220, -280], [-150, -420]];
  E3.shadowBody = N(paper({shape: shp, color: '#151318', alpha: .9, res: .8, amp: 3}), {lift: 10, blur: .6}); E3.shadow.add(E3.shadowBody);
  E3.bits = Array.from({length: 24}, (_, i) => { const r = rng(300 + i); const x = -300 + r() * 520, y = -740 + r() * 720; const n = N(paper({shape: [[0, -20 - r() * 30], [20 + r() * 30, 10], [-20 - r() * 20, 16]], color: '#151318', res: 1.5, amp: 1.5}), {x, y, lift: 10, vis: false, dyn: true}); n.x0 = x; n.y0 = y; E3.shadow.add(n); return n; });
  WORLD.add(E3.shadow);
  E3.light = N(paper({shape: [[-160, 0], [160, 0], [260, 140], [-260, 140]], color: '#ffe3a0', alpha: .35, res: .6, amp: 3, edge: false, tex: .3}), {x: P2X - 120, y: 400, z: 30, lift: 0, shadowA: 0, a: 0}); WORLD.add(E3.light);

  /* ---------- мир страха внутри пузыря ---------- */
  FEAR = G({z: 0});
  FEAR.add(N(paper({shape: S.rect(-2600, -2000, 2600, 2000), color: '#3b2c5c', amp: 0, res: .4, edge: false, texScale: 3, deco: g => { const r = rng(15); for (let i = 0; i < 30; i++){ g.fillStyle = `rgba(${r() < .5 ? '90,70,140' : '30,20,60'},.3)`; g.beginPath(); g.ellipse(-2400 + r() * 4800, -1800 + r() * 3600, 200 + r() * 400, 120 + r() * 260, r() * 3, 0, TAU); g.fill(); } }}), {z: 150}));
  FEAR.add(N(paper({shape: S.rect(-2400, 300, 2400, 1400), color: '#5a4a6e', res: .5, amp: 3}), {z: 40, lift: 3}));
  FR.houses = [];
  [-1150, -820, -520, 520, 830, 1150, -240, 260].forEach((x, i) => { const h0 = G({x, y: 330, z: 50 - (i % 3) * 6}); const hw = 120 + (i % 3) * 30, hh = 150 + (i % 2) * 60; h0.add(N(paper({shape: S.rect(-hw / 2, -hh, hw / 2, 0), holes: [S.rect(-20, -hh + 30, 20, -hh + 70)], color: ['#d9b48c', '#c9a07a', '#d7c08f'][i % 3], res: 1, amp: 2}), {lift: 6}), N(paper({shape: [[-hw / 2 - 16, -hh], [0, -hh - 70], [hw / 2 + 16, -hh]], color: '#8e4a3a', res: 1, amp: 2}), {lift: 7})); FR.houses.push(h0); FEAR.add(h0); });
  [-680, 680, -40].forEach((x, i) => { const tr = makeTree(240, COL.leaf); tr.x = x; tr.y = 330; tr.z = 46; FEAR.add(tr); FR.houses.push(tr); });
  FR.hero = makePerson(); FR.hero.root.x = -140; FR.hero.root.y = 470; FR.hero.root.sx = FR.hero.root.sy = .7; FR.hero.root.z = -4; FR.hero.root.r = .12; face(FR.hero, 'angry');
  FR.wall = N(paper({shape: S.rect(-120, -720, 120, 0), color: '#cf3b27', res: 1, amp: 2.4}), {x: 40, y: 480, z: -2, lift: 8});
  FR.wave = G({x: 80, y: 1500, z: 30, dyn: true});
  const wpts = [[-1400, 0], [-1400, -500], [-1000, -720], [-500, -860], [0, -980], [380, -1060], [700, -900], [820, -640], [700, -560], [560, -680], [380, -560], [500, -420], [900, -300], [1400, -260], [1400, 0]];
  FR.wave.add(N(paper({shape: wpts, color: '#141218', res: .7, amp: 4, deco: g => { g.strokeStyle = 'rgba(120,120,140,.3)'; g.lineWidth = 6; for (let i = 0; i < 9; i++){ g.beginPath(); g.moveTo(-1300 + i * 260, -200); g.quadraticCurveTo(-1200 + i * 260, -500, -1000 + i * 260, -620); g.stroke(); } }}), {lift: 12}));
  [[-380, -820], [-180, -900], [40, -980], [240, -1030], [450, -1010], [620, -880]].forEach(([x, y], i) => FR.wave.add(N(paper({shape: [[-24, 0], [24, 0], [0, 70]], color: '#f4efe4', res: 1.5, amp: 1}), {x, y: y + 10, r: .2 - i * .05, lift: 13})));
  FEAR.add(FR.wave, FR.wall, FR.hero.root);

  /* ---------- облачная шторка: туча закрывает кадр ---------- */
  WIPE = G({z: 0});
  E3.wipe = [[-700, -300, 900], [400, -380, 1000], [-200, 260, 1100], [900, 300, 800], [-1000, 320, 700], [1200, -200, 700]].map(([x, y, w], i) => { const c = makeCloud(w, i % 2 ? '#9a9ca3' : '#878990'); c.x0 = x; c.y0 = y; WIPE.add(c); return c; });
}

/* ================= камера ================= */
const camA = path([
  [0, {x: -620, y: -30, ls: Math.log(1.0), roll: -.006}],
  [3.1, {x: -320, y: 10, ls: Math.log(1.05), roll: .002}],
  [4.6, {x: -200, y: 60, ls: Math.log(.95), roll: .02}],
  [6.25, {x: -150, y: -300, ls: Math.log(1.02), roll: .03}],
  [7.6, {x: -360, y: -420, ls: Math.log(1.08), roll: .012}],
  [9.0, {x: 40, y: -560, ls: Math.log(1.1), roll: -.02}],
  [10.6, {x: -200, y: -760, ls: Math.log(1.0), roll: -.01}],
  [11.7, {x: -120, y: -720, ls: Math.log(.66), roll: .004}],
  [12.5, {x: -140, y: -1000, ls: Math.log(1.5), roll: .01}],
]);
const camB = path([
  [12.5, {x: -60, y: 40, ls: Math.log(1.3), roll: .004}],
  [15.0, {x: -60, y: 10, ls: Math.log(1.24), roll: -.004}],
  [16.3, {x: -120, y: -520, ls: Math.log(1.7), roll: .01}],
  [18.8, {x: -120, y: -520, ls: Math.log(1.7), roll: .01}],
  [20.0, {x: -40, y: 20, ls: Math.log(1.2), roll: .002}],
  [22.0, {x: 120, y: -60, ls: Math.log(1.0), roll: -.015}],
  [24.2, {x: 380, y: -260, ls: Math.log(.84), roll: .016}],
  [26.6, {x: 360, y: -160, ls: Math.log(.9), roll: .006}],
  [28.3, {x: 60, y: -10, ls: Math.log(1.12), roll: -.004}],
  [29.4, {x: 40, y: -20, ls: Math.log(1.14), roll: -.002}],
  [30.0, {x: 120, y: -40, ls: Math.log(1.1), roll: -.006}],
  [31.3, {x: P2X + 40, y: -40, ls: Math.log(1.0), roll: .004}],
  [34.0, {x: P2X + 110, y: -60, ls: Math.log(1.08), roll: .002}],
  [37.0, {x: P2X + 60, y: -90, ls: Math.log(1.16), roll: -.004}],
  [40, {x: P2X + 20, y: -100, ls: Math.log(1.1), roll: .002}],
]);
const camF = t => ({x: 0, y: -120 - (t - 16) * 10, ls: Math.log(1.05 + (t - 16) * .03), roll: .006});
function camAt(t){ return t < 12.5 ? camA(t) : camB(t); }
const NZ3 = noise1(3), NZ8 = noise1(8);
const wig = t => (t > 13.0 && t < 16.0) || (t > 18.75 && t < 20.4) ? [(NZ3(t * 6) - .5) * 14, (NZ8(t * 6) - .5) * 10] : [0, 0];

/* ================= действие ================= */
function update(t){
  const tp = stepT(t), sp = Math.floor(t * 12 + 1e-6);
  /* --- 3.1 клякса и пьедестал --- */
  const walkEnd = 3.1;
  const ph = Math.floor(tp / .3125), walking = tp > .1 && tp < walkEnd;
  HA.root.x = tp < walkEnd ? lerp(-900, -150, E.sine(at(tp, .1, walkEnd - .1))) : -150;
  walkPose(HA, walking, ph, .9);
  HA.root.r = 0; HA.root.y = 420;
  // руки держат планку перед собой
  armPose(HA, .45, -1.25, -.45, 1.25);
  const carT = stepT(t, 24); E3.car.x = lerp(-2200, 1500, at(carT, .9, 1.0)); E3.car.vis = tp > .8 && tp < 2.0;
  E3.splat.vis = tp >= 1.45 && tp < 1.75; if (E3.splat.vis){ const k = at(tp, 1.45, .3); E3.splat.x = lerp(-600, HA.root.x + 40, k); E3.splat.y = lerp(600, 380, k) - Math.sin(k * Math.PI) * 120; E3.splat.r = k * 6; }
  HA.blot.vis = tp >= 1.75 && tp < 12.5;
  const angry = tp >= 1.75;
  HA.flush.a = tp < 1.75 ? 0 : tp < 12.5 ? steps(tp, 1.75, 3) : 0;
  face(HA, tp < 1.75 ? 'calm' : tp < 3.75 ? 'angry' : tp < 12.5 ? 'proud' : 'angry');
  // ватерпас: в руках, потом дрожит; потом ставится вертикально под ноги
  const lev = E3.level;
  const [gx, gy] = worldOf(HA.armB.grip, sp), [hx2, hy2] = worldOf(HA.armF.grip, sp);
  if (tp < 3.1){ lev.x = (gx + hx2) / 2; lev.y = (gy + hy2) / 2 + 6; lev.r = angry ? .1 + (sp % 3 - 1) * .05 : 0; lev.vis = true; E3.vial.x = angry ? 60 : 0; }
  else if (tp < 3.75){ const k = steps(tp, 3.1, 3, .2); lev.x = lerp((gx + hx2) / 2, -150, k); lev.y = lerp(250, 420 - 60, k); lev.r = lerp(.1, Math.PI / 2, k); }
  lev.vis = tp < 3.75;
  // гармошка поднимает героя
  const nSeg = tp < 3.75 ? 0 : Math.min(5, Math.floor((tp - 3.75) / .3125) + 1);
  E3.segs.forEach((s, k) => s.vis = k < nSeg && tp < 12.5);
  // мятые ступени от каждого выстрела
  const shotT = [6.875, 8.125, 9.375, 10.625];
  const nCr = shotT.filter(s => tp >= s + .25).length;
  E3.crump.forEach((c, k) => c.vis = k < nCr && tp < 12.5);
  const lift = nSeg * 110 + nCr * 110 - (nSeg === 5 ? 0 : 0);
  if (tp >= 3.75 && tp < 12.5){ HA.root.x = -150 + (nCr > 0 ? E3.crump[nCr - 1].x : 0); HA.root.y = 420 - lift; walkPose(HA, false, 0); }
  E3.tower.vis = tp < 12.5;
  // корона складывается в три фазы, плечи
  const cr = tp < 5.0 ? 0 : Math.min(3, Math.floor((tp - 5.0) / .125) + 1);
  HA.crown.forEach((c, i) => c.vis = cr === i + 1 && tp < 12.5);
  HA.pads.forEach(p => p.vis = tp >= 5.6 && tp < 12.5);
  // поза на пьедестале: руки в боки, затем рупор
  if (tp >= 3.75 && tp < 6.25) armPose(HA, -.5, 1.9, .5, -1.9);
  HA.horn.vis = tp >= 6.25 && tp < 11.4;
  if (HA.horn.vis){
    armPose(HA, -.5, 1.9, -1.6, -.3);
    const [fx, fy] = worldOf(HA.armF.grip, sp); HA.horn.x = fx - 10; HA.horn.y = fy - 6;
  }
  // карусель поводов вокруг башни
  const cx = -150, cy = HA.root.y - 260, R0 = 560;
  E3.ring.forEach((it, i) => {
    it.vis = tp >= 6.25 && tp < 11.6;
    const th = it.th + stepT(t) * .9;
    it.x = cx + Math.cos(th) * R0; it.z = Math.sin(th) * 60; it.y = cy + Math.sin(th) * 40 + (i % 2) * 30;
    it.sx = it.sy = 1.15 + Math.sin(th) * -.12;
  });
  // выстрелы: красный треугольник летит к ближайшей мишени
  E3.shots.forEach((s, i) => {
    const t0 = shotT[i]; s.vis = tp >= t0 && tp < t0 + .25;
    const target = E3.ring[i]; const [fx, fy] = [HA.horn.x + 120, HA.horn.y];
    const k = at(tp, t0, .25); s.x = lerp(fx, target.x, k); s.y = lerp(fy, target.y - 60, k); s.r = Math.atan2(target.y - 60 - fy, target.x - fx); s.z = lerp(-2, target.z, k);
    target.hit.vis = tp >= t0 + .25; target.kids[0].r = tp >= t0 + .25 && tp < t0 + .5 ? (sp % 2 ? .1 : -.1) : 0;
  });
  if (tp >= 6.25 && tp < 11.4) HA.armF.sh.r = -1.6 + (shotT.some(s => tp >= s && tp < s + .125) ? -.15 : 0);
  // туча опускается на шпиль
  E3.storm.vis = tp >= 10.0 && tp < 12.9;
  E3.storm.x = -150; E3.storm.y = lerp(-2200, HA.root.y - 520, E.out(at(tp, 10.0, 1.4)));
  E3.storm.sx = E3.storm.sy = 1 + steps(tp, 11.6, 4, .2) * .9;

  /* --- 3.2 стена страха --- */
  const atWall = tp >= 12.5 && tp < 30.5;
  E3.wall.vis = tp >= 12.5;
  if (tp >= 12.5 && tp < 30.0){
    HA.root.x = -60 + (tp > 19.1 && tp < 20 ? 12 : 0); HA.root.y = 420; HA.root.r = tp < 20.0 ? .12 : lerp(.12, 0, steps(tp, 20.0, 3));
    HA.legs[0].r = tp < 20 ? -.3 : 0; HA.legs[1].r = tp < 20 ? -.12 : 0;
    armPose(HA, tp < 20 ? -.4 : 0, tp < 20 ? -.6 : 0, tp < 20 ? -1.7 : 0, tp < 20 ? -.9 : 0);
  }
  // колючки бьются в стену справа, стена вздрагивает
  const burrT = [13.75, 14.375, 15.0];
  const hitWall = burrT.some(b => tp >= b + .25 && tp < b + .5);
  E3.wall.x = 170 + (hitWall ? (sp % 2 ? -6 : 6) : 0); E3.wall.r = hitWall ? (sp % 2 ? -.008 : .008) : 0;
  E3.burrs.forEach(b => b.vis = false);
  burrT.forEach((b0, i) => { const bb = E3.burrs[i]; if (tp >= b0 && tp < b0 + .7){ bb.vis = true; const k = at(tp, b0, .25), back = at(tp, b0 + .25, .45); bb.x = k < 1 ? lerp(900, 360, k) : lerp(360, 520, back); bb.y = -200 - i * 140 + (k < 1 ? 0 : back * back * 300); bb.r = tp * 3; bb.z = -2; } });
  E3.sweat.forEach((d, i) => { const on = tp >= 13.75 + i * .5 && tp < 20; d.vis = on; const q = ((sp + i * 5) % 12) / 12; d.x = [-62, 60, -50][i]; d.y = -20 + q * 70; d.a = 1 - q * .6; });
  if (tp >= 12.5 && tp < 20) face(HA, tp > 16 && tp < 20 ? 'wow' : 'angry');
  // пузырь фантазии раскрывается на весь кадр
  const bubOn = tp >= 15.0 && tp < 19.1;
  E3.bub.vis = bubOn; E3.bub.x = -200; E3.bub.y = -300;
  const grow = tp < 15.6 ? .4 + .6 * steps(tp, 15.0, 3, .2) : tp < 18.75 ? 1 + Math.pow(at(t, 15.6, .7), 2.2) * 24 : Math.max(0, 25 * (1 - at(t, 18.75, .35)));
  E3.bub.sx = E3.bub.sy = grow;
  // внутри: герой опускает стену, встаёт чёрная волна и накрывает домики
  const low = steps(tp, 16.25, 3, .125);
  FR.wall.y = 480 + low * 70;
  const rise = E.out(at(tp, 16.6, .9)), crash = E.in(at(tp, 17.5, .9));
  FR.wave.y = lerp(1500, 330, rise) + crash * 500; FR.wave.x = 80 - crash * 400; FR.wave.r = -crash * .5; FR.wave.z = tp < 17.6 ? 30 : -30;
  FR.houses.forEach((h0, i) => { const hit = crash > .2 + (i % 4) * .15; h0.r = hit ? (i % 2 ? -1 : 1) * .5 : 0; h0.y = 330 + (hit ? 60 : 0); });
  face(FR.hero, tp > 17.3 ? 'wow' : 'angry'); FR.hero.root.r = tp > 17.8 ? -.5 : .12;

  /* --- 3.3 расслоение на окно, солнце и щит --- */
  E3.flap.vis = tp >= 12.5 && tp < 21.25;
  E3.flap.r = tp < 20.0 ? 0 : -steps(tp, 20.0, 4, .125) * 1.2;
  E3.red.a = tp < 20.625 ? 1 : 1 - steps(tp, 20.625, 3, .125);
  E3.red.vis = E3.red.a > 0;
  // слои расходятся, как карты: синий остаётся, жёлтый вправо, калька дальше вправо и назад — это окно
  const spY = steps(tp, 21.25, 3, .125), spK = steps(tp, 21.56, 4, .125);
  E3.kalkaG.dz = spK * 40; E3.kalkaG.x = 24 + spK * 520; E3.kalkaG.y = -24 + spK * 20;
  E3.yellow.x = 12 + spY * 260; E3.yellow.y = -12;
  // жёлтый слой подменяется солнцем и взмывает
  E3.yellow.vis = tp < 22.5; E3.sun.root.vis = tp >= 22.5;
  if (tp >= 22.5){ const k = E.out(at(tp, 22.5, 1.4)); E3.sun.root.x = lerp(440, 640, k); E3.sun.root.y = lerp(-550, -760, k); E3.sun.root.r = stepT(t) * .15; E3.sun.root.sx = E3.sun.root.sy = .6 + .4 * steps(tp, 22.5, 3, .125); }
  // синий слой складывается в щит и ложится в руку
  E3.blue.vis = tp < 23.75; E3.shield.root.vis = tp >= 23.75;
  if (tp >= 23.75){
    const k = steps(tp, 23.75, 3, .125), fly = E.out(at(tp, 24.0, .6));
    const block = tp >= 28.1 && tp < 29.4 ? steps(tp, 28.1, 2, .125) : 0;
    if (tp >= 24.0 && tp < 30) armPose(HA, 0, 0, lerp(-.5, -1.9, block), lerp(-1.3, -.5, block));
    const [fx, fy] = worldOf(HA.armF.grip, sp);
    E3.shield.root.x = lerp(170, fx + 6, fly); E3.shield.root.y = lerp(-500, fy - 100, fly);
    E3.shield.root.r = lerp(0, .25, fly) - block * .5; E3.shield.root.sx = E3.shield.root.sy = lerp(1.6, 1, k);
    E3.shield.open.vis = true; E3.shield.closed.vis = false;
    E3.shield.root.z = -6;
  }
  if (tp >= 24.0 && tp < 30) face(HA, tp < 28.75 ? 'calm' : 'smile');
  // за окном изредка пролетают маленькие серые колючки
  [3, 4, 5, 6].forEach((j, i) => { const b = E3.burrs[j]; const t0 = 24.4 + i * 1.1; if (tp >= t0 && tp < t0 + 2.4){ b.vis = true; const k = at(tp, t0, 2.4); b.x = lerp(1300, 300, k); b.y = -640 + i * 110 + Math.sin(k * 6) * 20; b.z = 60; b.r = tp * 2; } });
  // одна летит в героя и отскакивает от щита
  if (tp >= 27.5 && tp < 29.4){ const b = E3.burrs[0]; b.vis = true; const k = at(tp, 27.5, .9), back = at(tp, 28.4, 1.0); b.x = k < 1 ? lerp(900, 200, k) : lerp(200, 760, back); b.y = k < 1 ? lerp(-520, -260, k) : lerp(-260, -700, back); b.z = -4; b.r = tp * 4; }

  /* --- 3.4 поднять границу --- */
  const crush = tp < 33.75;
  // сгорбленный: голова ниже, плечи опущены; выпрямляется в три фазы
  const up = steps(tp, 36.25, 3, .125);
  P2.root.x = P2X; walkPose(P2, false, 0);
  P2.hip.r = lerp(.16, 0, up); P2.head.y = -282 + lerp(24, 0, up); P2.head.r = lerp(.3, 0, up);
  face(P2, tp < 33.0 ? 'sad' : up < 1 ? 'calm' : 'smile');
  P2.head.r -= tp >= 32.6 && tp < 33.4 ? .25 : 0;   // смотрит на героя
  // рука хватает край планки, планка поднимается вверх на шарнире
  const grab = steps(tp, 33.1, 3, .125), lift3 = steps(tp, 33.75, 4, .15625);
  armPose(P2, lerp(.1, 0, up), 0, lerp(lerp(-.1, -.75, grab), -.35, lift3), lerp(0, .2, grab));
  const [px, py] = worldOf(P2.armF.grip, sp);
  E3.bgate.x = px - 6; E3.bgate.y = py + 4; E3.bgate.r = lerp(.5, -Math.PI / 2, lift3);
  if (tp < 33.1){ E3.bgate.x = P2X + 140; E3.bgate.y = 236; }
  // ширма из ещё двух створок раскладывается вправо
  E3.panels.forEach((pl, k) => { const on = tp >= 34.375 + k * .125; pl.root.vis = on; pl.root.x = E3.bgate.x + 100 * (k + 1); pl.root.y = E3.bgate.y - 230; pl.root.r = -Math.PI / 2 + (k % 2 ? .04 : -.04); });
  E3.bolt.vis = tp >= 34.75; E3.bolt.x = E3.bgate.x + 100; E3.bolt.y = E3.bgate.y - 240 + (tp < 34.875 ? -24 : 0); E3.bolt.z = -6;
  E3.light.a = tp >= 36.25 ? steps(tp, 36.25, 4) : 0;
  // герой входит слева и кладёт руку на плечо
  if (tp >= 30.0){
    const wk = at(tp, 31.0, 1.4), phw = Math.floor(tp / .3125);
    const back = tp >= 37.2 ? Math.min(2, Math.floor((tp - 37.2) / .3125) + 1) : 0;
    HA.root.x = lerp(P2X - 800, P2X - 210, E.sine(wk)) - back * 70; HA.root.y = 420; HA.root.r = 0;
    walkPose(HA, (tp > 31.0 && tp < 32.4) || (tp >= 37.2 && tp < 37.9), phw);
    face(HA, tp < 33.75 ? 'calm' : 'smile');
    if (tp >= 32.5 && tp < 36.25){ const k = steps(tp, 32.5, 3, .125); armPose(HA, 0, 0, lerp(0, -1.25, k), lerp(0, -.25, k)); }
    // зонт-щит складывается и переходит в другую руку, первая ложится на плечо
    const held = tp >= 32.5;
    const [fx, fy] = worldOf(held ? HA.armB.grip : HA.armF.grip, sp);
    E3.shield.root.vis = true; E3.shield.root.x = fx + 6; E3.shield.root.y = fy - (held ? 108 : 100);
    E3.shield.root.r = held ? .08 : .25; E3.shield.root.sx = E3.shield.root.sy = 1;
    E3.shield.open.vis = !held; E3.shield.closed.vis = held;
  }
  // тень давит на планку; планка её отталкивает; тень рассыпается обрезками
  const push = steps(tp, 33.9, 3, .15);
  const dissolve = tp >= 35.0;
  E3.shadowBody.vis = !dissolve;
  E3.shadow.x = P2X + 640 + push * 90 + (crush ? Math.sin(sp * .7) * 6 : 0); E3.shadow.r = crush ? -.04 : push * .08;
  E3.bits.forEach((b, i) => { b.vis = dissolve && tp < 37.4; if (!b.vis) return; const k = at(tp, 35.0 + (i % 6) * .08, 1.6); b.x = b.x0 + (hash(i, 7) - .5) * 260 * k; b.y = b.y0 + k * k * (600 + hash(i, 9) * 500); b.r = k * (hash(i, 4) - .5) * 8; b.a = 1 - k * .7; });
}

/* ================= звук ================= */
function cues(){
  CUES.length = 0;
  for (let k = 0; k < 10; k++){ const t = .1 + k * .3125; if (t < 3.1) cue(t, 'step', {pan: -.5 + t / 6, v: .45}); }
  cue(.9, 'car', {pan: -.8, to: .8}); cue(1.75, 'splat', {pan: -.1}); cue(1.9, 'ruler', {dur: 1.2});
  for (let k = 0; k < 5; k++) cue(3.75 + k * .3125, 'fan', {pan: 0, v: .5 + k * .06});
  cue(5.0, 'fold', {pan: .1}); cue(5.6, 'fanfare');
  [6.875, 8.125, 9.375, 10.625].forEach((t, i) => { cue(t, 'staple', {pan: .2 - i * .1}); cue(t + .05, 'plane', {pan: .3}); cue(t + .25, 'crunch', {pan: 0, v: .5 + i * .1}); });
  cue(10.0, 'thunder', {v: .5}); cue(11.9, 'whoosh', {v: .5, dir: 'up'});
  [13.75, 14.375, 15.0].forEach((t, i) => { cue(t + .25, 'thudw', {pan: .3, v: .5}); });
  cue(13.0, 'breath', {dur: 2.5}); cue(15.0, 'pop', {pan: -.2}); cue(15.6, 'whoosh', {v: .5, dir: 'up'});
  cue(16.25, 'click', {pan: 0}); cue(16.6, 'rumble', {dur: 2.2}); cue(17.5, 'thunder', {v: .9}); cue(18.75, 'pop', {pan: 0, v: .8}); cue(19.1, 'gasp', {pan: -.1});
  cue(20.0, 'tear', {v: .4}); [20.625, 22.5, 23.75].forEach((t, i) => cue(t, 'peel', {pan: [-.2, .3, -.05][i]})); cue(24.375, 'chord', {notes: [62, 66, 69, 74, 78]});
  cue(28.4, 'boing', {pan: .3});
  for (let k = 0; k < 5; k++){ const t = 31.0 + k * .3125; if (t < 32.4) cue(t, 'step', {pan: -.2, v: .45}); }
  cue(30.0, 'drone', {dur: 5.0}); cue(33.1, 'creak', {pan: .2, v: .5}); cue(34.375, 'latch', {pan: .2});
  cue(35.0, 'scatter', {pan: .4}); cue(36.25, 'fold', {pan: 0}); cue(37.5, 'step', {pan: -.1, v: .4}); cue(37.81, 'step', {pan: -.15, v: .4});
}

/* ================= кадр ================= */
function renderAt(g, t, to = t){
  update(to);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.fillStyle = '#1d1712'; g.fillRect(0, 0, W, H);
  const c = toCam(camAt(t)); const [wx, wy] = wig(t); c.x += wx; c.y += wy;
  const fearOn = E3.bub.vis && E3.bub.sx > 1.05;
  const covers = fearOn && E3.bub.sx > 14;
  if (covers){ drawWorld(g, FEAR, toCam(camF(t)), to); grade(g, .6); return; }
  drawWorld(g, WORLD, c, to);
  if (fearOn) drawThrough(g, FEAR, toCam(camF(t)), E3.mask, c, to);
  // облачная шторка на переходе с башни к стене
  const wk = t < 12.5 ? at(t, 11.9, .6) : 1 - at(t, 12.5, .7);
  if (wk > 0){ E3.wipe.forEach((cl, i) => { const side = i % 2 ? 1 : -1; cl.x = cl.x0 + side * (1 - E.out(wk)) * 1600; cl.y = cl.y0; }); drawWorld(g, WIPE, {x: 0, y: 0, z: 0, roll: 0}, to); }
  grade(g, t > 30 ? 1 : .9);
}
function subFor(t){ return t < 12.5 ? subForPath(camA, t) : subForPath(camB, t); }
