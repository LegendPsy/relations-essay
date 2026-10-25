/* Эпизод 1 «Невидимая шкала» — к вступлению статьи. 40 секунд, 24 кадра в секунду.
   Нить: одна и та же чашка чая. Камера в комнате видит просто чашку; внутри головы она
   поднимается выше нуля и расцветает; три полосы склеиваются в красную планку, та встаёт
   высоко, и чашка гаснет под её тенью; в комнате чашка остаётся серой. */
const DUR = 40, BEAT = .625;
const COL = {
  kraft: '#b48a60', verm: '#d8432e', ochre: '#e2a23b', indigo: '#2e3f7f', indigoD: '#24326a', kalka: '#eef1f2', graphite: '#4c4a48',
  cream: '#f4ecdb', mustard: '#e8b83e', sage: '#9db59a', teal: '#2f6e6c', coral: '#de6b4f', pink: '#e98a8f', sky: '#a9cde3', wood: '#a87a52', navy: '#2b3557',
};
const CUES = [];   // события для звука: [время, тип, параметры]
const cue = (t, type, p = {}) => CUES.push({t, type, ...p});

let ROOM, INNER, H1, IN = {}, RM = {};

function build(){
  GRAIN = makeGrain(7);
  /* ================= комната ================= */
  ROOM = G({z: 0});
  const kraft = N(paper({shape: S.rect(-3200, -2200, 3200, 2200), color: COL.kraft, amp: 0, res: .5, edge: false, texScale: 3}), {z: 150});
  const wallSp = paper({shape: S.rect(-1900, -640, 1800, 330), color: COL.sage, res: .8, amp: 4, grey: true, deco: (g, b) => { for (let x = -1900; x < 1800; x += 90){ g.fillStyle = 'rgba(255,255,240,.13)'; g.fillRect(x, b.y0, 34, b.y1 - b.y0); g.fillStyle = 'rgba(70,100,70,.10)'; g.fillRect(x + 52, b.y0, 4, b.y1 - b.y0); } }});
  RM.wall = N(wallSp, {z: 80});
  RM.base = N(paper({shape: S.rect(-1900, 286, 1800, 330), color: '#e8dcc2', res: .8, amp: 2}), {z: 79, lift: 2});
  // окно: небо, солнце, холм, рама с прорезями, шторы
  const win = G({x: -560, y: -230, z: 78});
  RM.sky = N(paper({shape: S.rect(-170, -200, 170, 190), color: COL.sky, res: 1.2, amp: 1.5, grey: true}), {dz: 1.5, lift: 1});
  RM.sun = N(paper({shape: S.ell(70, -90, 44, 44), color: COL.mustard, res: 1.5, amp: 1.4, grey: true}), {dz: 1.2, lift: 2});
  RM.hill = N(paper({shape: [[-170, 190], [-170, 60], [-90, 30], [10, 70], [90, 40], [170, 80], [170, 190]], color: '#8fae7a', res: 1.2, amp: 2, grey: true}), {dz: 1, lift: 3});
  const frame = N(paper({shape: S.rect(-190, -220, 190, 210), holes: [S.rect(-168, -198, -6, -8), S.rect(6, -198, 168, -8), S.rect(-168, 8, -6, 188), S.rect(6, 8, 168, 188)], color: '#f1e6cf', res: 1.2, amp: 1.8}), {lift: 5});
  const sill = N(paper({shape: S.rect(-220, 206, 220, 236), color: '#e6d6b6', res: 1.2, amp: 1.6}), {dz: -1, lift: 4});
  RM.curL = N(paper({shape: [[-250, -250], [-150, -250], [-162, 60], [-140, 250], [-262, 250]], color: COL.coral, res: 1.2, amp: 2.2, grey: true, deco: g => { g.fillStyle = 'rgba(255,230,200,.18)'; for (let x = -250; x < -140; x += 26) g.fillRect(x, -260, 8, 520); }}), {dz: -3, lift: 7});
  RM.curR = N(paper({shape: [[150, -250], [250, -250], [262, 250], [140, 250], [162, 60]], color: COL.coral, res: 1.2, amp: 2.2, grey: true, deco: g => { g.fillStyle = 'rgba(255,230,200,.18)'; for (let x = 150; x < 262; x += 26) g.fillRect(x, -260, 8, 520); }}), {dz: -3, lift: 7});
  const rod = N(paper({shape: S.rect(-290, -268, 290, -252), color: '#6b4a35', res: 1.2, amp: 1}), {dz: -4, lift: 4});
  win.add(RM.sky, RM.sun, RM.hill, frame, sill, RM.curL, RM.curR, rod);
  // картина
  const pic = G({x: 300, y: -330, z: 78});
  RM.picIn = N(paper({shape: S.rect(-92, -66, 92, 66), color: '#f2d9a8', res: 1.4, amp: 1.2, grey: true, deco: g => { g.fillStyle = '#7f9fc4'; g.beginPath(); g.moveTo(-92, 40); g.lineTo(-30, -30); g.lineTo(20, 20); g.lineTo(60, -10); g.lineTo(92, 30); g.lineTo(92, 66); g.lineTo(-92, 66); g.fill(); g.fillStyle = '#e0703f'; g.beginPath(); g.arc(46, -34, 14, 0, TAU); g.fill(); }}), {dz: .8, lift: 1});
  pic.add(RM.picIn, N(paper({shape: S.rect(-110, -84, 110, 84), holes: [S.rect(-90, -64, 90, 64)], color: '#c98f3c', res: 1.4, amp: 1.6}), {lift: 6}));
  // дверь, чуть приоткрыта
  const door = G({x: 830, y: 0, z: 78});
  door.add(N(paper({shape: S.rect(-130, -560, 130, 300), color: '#3a2b22', res: .8, amp: 2}), {dz: .8, lift: 1}),
           N(paper({shape: [[-130, -560], [70, -540], [70, 300], [-130, 300]], color: COL.teal, res: .8, amp: 2.4, deco: g => { g.strokeStyle = 'rgba(20,50,50,.35)'; g.lineWidth = 5; g.strokeRect(-100, -500, 140, 330); g.strokeRect(-100, -120, 140, 360); }}), {lift: 9}),
           N(paper({shape: S.ell(40, -110, 12, 12), color: COL.mustard, res: 2, amp: 1}), {dz: -1, lift: 4}));
  // пол, ковёр, полоса света из окна
  RM.floor = N(paper({shape: S.rect(-1900, 296, 1800, 760), color: COL.wood, res: .8, amp: 3, deco: (g, b) => { g.strokeStyle = 'rgba(70,40,20,.28)'; g.lineWidth = 3; for (let y = 340; y < 760; y += 58){ g.beginPath(); g.moveTo(b.x0, y); g.lineTo(b.x1, y); g.stroke(); } }}), {z: 40, lift: 3});
  RM.rug = N(paper({shape: S.ell(-20, 470, 560, 86), color: '#c25b3f', res: .8, amp: 3, grey: true, deco: g => { g.strokeStyle = 'rgba(255,220,180,.4)'; g.lineWidth = 7; g.beginPath(); g.ellipse(-20, 470, 500, 62, 0, 0, TAU); g.stroke(); }}), {z: 38, lift: 3});
  RM.light = N(paper({shape: [[-720, 330], [-400, 330], [-150, 540], [-560, 540]], color: '#ffe9ad', alpha: .2, res: .8, amp: 3, edge: false, tex: .3, grey: true, greyFilter: 'grayscale(1) brightness(.7)', deco: g => { g.fillStyle = 'rgba(255,240,190,.35)'; [[-700, 340, -572, 420], [-556, 340, -420, 420], [-646, 440, -470, 530], [-452, 440, -200, 530]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, b); g.lineTo(c + 60, d); g.lineTo(a + 60, d); g.fill(); }); }}), {z: 37, lift: 0, shadowA: 0});
  // растение
  const plant = G({x: -1060, y: 390, z: 14});
  RM.leaves = [];
  [[-.5, 1], [-.15, 1.15], [.2, 1.05], [.55, .9], [-.85, .8]].forEach(([a, l], i) => { const lf = N(paper({shape: S.band([[0, 0], [18, -90 * l], [8, -190 * l]], 46, 8), color: i % 2 ? '#3f7d57' : '#57966a', res: 1.2, amp: 2, grey: true}), {y: -110, r: a, lift: 6 + i}); RM.leaves.push(lf); plant.add(lf); });
  plant.add(N(paper({shape: [[-70, -120], [70, -120], [52, 0], [-52, 0]], color: '#c4643f', res: 1.2, amp: 2}), {lift: 6}));
  // стул
  const chair = G({x: 60, y: 400, z: 12});
  RM.chairBack = N(paper({shape: S.rrect(-104, -372, 104, -108, 18), color: '#d0954a', res: 1.2, amp: 2.2, deco: g => { g.fillStyle = 'rgba(120,60,20,.18)'; for (let y = -340; y < -120; y += 48) g.fillRect(-90, y, 180, 12); }}), {dz: 3, lift: 6});
  chair.add(RM.chairBack,
    N(paper({shape: S.rect(-94, -110, -76, 0), color: '#6b4a35', res: 1.2, amp: 1.4}), {dz: 1, lift: 4}), N(paper({shape: S.rect(76, -110, 94, 0), color: '#6b4a35', res: 1.2, amp: 1.4}), {dz: 1, lift: 4}),
    N(paper({shape: S.rrect(-118, -122, 118, -94, 8), color: '#b9773b', res: 1.2, amp: 1.8}), {lift: 6}),
    N(paper({shape: S.rrect(-104, -136, 104, -112, 10), color: COL.teal, res: 1.2, amp: 1.8}), {dz: -.5, lift: 4}));
  // столик и чашка
  const table = G({x: -190, y: 400, z: -10});
  table.add(N(paper({shape: S.rect(-7, -176, 7, 0), color: '#6b4a35', res: 1.5, amp: 1.2}), {lift: 5}), N(paper({shape: S.ell(0, 0, 44, 9), color: '#5a3d2c', res: 1.5, amp: 1.2}), {lift: 3}),
            N(paper({shape: S.ell(0, -178, 82, 15), color: '#efe2c8', res: 1.5, amp: 1.6}), {dz: -1, lift: 6}));
  RM.cup = makeCup(1); RM.cup.root.x = -14; RM.cup.root.y = -184; RM.cup.root.dz = -2; table.add(RM.cup.root);
  // герой
  H1 = makeHero(); H1.root.x = 900; H1.root.y = 400; H1.root.z = 0;
  // маленькая красная планка над головой — для финала
  RM.mini = G({y: -505, vis: false, lift: 16});
  RM.mini.add(N(paper({shape: S.rect(-74, -10, 74, 12), color: '#8f2416', res: 3, amp: 1.2}), {y: 4, lift: 14}), N(paper({shape: S.rect(-74, -12, 74, 10), color: COL.verm, res: 3, amp: 1.2}), {lift: 16}));
  H1.root.add(RM.mini);
  // видеокамера на штативе — передний план, в расфокусе
  const rig = G({x: -760, y: -10, z: -100});
  rig.add(N(paper({shape: S.band([[0, 80], [-150, 900]], 18, 22), color: '#1f2433', res: .8, amp: 1.5}), {lift: 4}),
          N(paper({shape: S.band([[0, 80], [10, 900]], 18, 22), color: '#262c3d', res: .8, amp: 1.5}), {lift: 4}),
          N(paper({shape: S.band([[0, 80], [160, 900]], 18, 22), color: '#1f2433', res: .8, amp: 1.5}), {lift: 4}),
          N(paper({shape: S.rect(-60, 60, 60, 92), color: '#2a2f40', res: .8, amp: 1.5}), {lift: 5}),
          N(paper({shape: S.rrect(-150, -90, 150, 70, 16), color: COL.navy, res: .8, amp: 2.4}), {lift: 7}),
          N(paper({shape: S.rect(-100, -138, 60, -96), color: '#3b4670', res: .8, amp: 2}), {lift: 6}),
          N(paper({shape: S.ell(176, -10, 74, 74), color: '#1b1e28', res: .8, amp: 2}), {lift: 9}),
          N(paper({shape: S.ell(176, -10, 44, 44), color: '#4a5d86', res: .8, amp: 1.5, deco: g => { g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(160, -26, 14, 10, -.5, 0, TAU); g.fill(); }}), {lift: 10}));
  RM.rec = N(paper({shape: S.ell(-104, -56, 14, 14), color: '#ff3b2a', res: 1, amp: 1}), {lift: 9});
  rig.add(RM.rec);
  // ветки сверху справа — кулиса
  const twig = G({x: 1150, y: -620, z: -130});
  [[0, 0, .4], [-120, 60, .9], [-260, 30, .2], [-60, 160, 1.3], [-340, 120, .7]].forEach(([x, y, a], i) => twig.add(N(paper({shape: S.band([[0, 0], [60, -30], [130, -10]], 56, 4), color: i % 2 ? '#2f5b3f' : '#3a6b4a', res: .8, amp: 2}), {x, y, r: a + 2.4, lift: 5})));
  twig.add(N(paper({shape: S.band([[200, -80], [0, 40], [-380, 150]], 22, 10), color: '#3b2a1f', res: .8, amp: 2}), {lift: 4}));
  ROOM.add(kraft, RM.wall, RM.base, win, pic, door, RM.floor, RM.rug, RM.light, plant, chair, H1.root, table, rig, twig);

  /* ================= внутри головы ================= */
  INNER = G({z: 0});
  const bg = N(paper({shape: S.rect(-3200, -2600, 3200, 1800), color: COL.indigo, amp: 0, res: .4, edge: false, texScale: 3, deco: g => { const r = rng(5); for (let i = 0; i < 40; i++){ g.fillStyle = `rgba(${r() < .5 ? '80,100,170' : '30,40,90'},.25)`; g.beginPath(); g.ellipse(-3000 + r() * 6000, -2400 + r() * 4000, 200 + r() * 500, 120 + r() * 300, r() * 3, 0, TAU); g.fill(); } }}), {z: 150});
  INNER.add(bg);
  const r = rng(77); IN.stars = [];
  for (let i = 0; i < 70; i++){ const st = N(paper({shape: S.ell(0, 0, 3 + r() * 6, 3 + r() * 6, 12), color: r() < .3 ? COL.mustard : '#f3ead3', res: 1, amp: .6}), {x: -2200 + r() * 4400, y: -2000 + r() * 2600, z: 100 + r() * 40, lift: 2, tw: r()}); IN.stars.push(st); INNER.add(st); }
  // линейка с нулём
  IN.ruler = N(paper({shape: S.rect(-1700, -32, 1700, 32), color: '#efe4c9', res: 1, amp: 2, deco: g => { g.fillStyle = 'rgba(60,45,30,.7)'; for (let x = -1700; x <= 1700; x += 50){ const big = Math.round(x / 50) % 5 === 0; g.fillRect(x - 1.5, -32, 3, big ? 30 : 15); } }}), {y: 60, z: 30, lift: 6});
  IN.zero = G({y: 60, z: 27}); IN.zero.add(N(paper({shape: S.rect(-5, -40, 5, 30), color: COL.verm, res: 2, amp: .8}), {lift: 4}), N(paper({shape: [[-22, -74], [22, -74], [0, -42]], color: COL.verm, res: 2, amp: 1}), {lift: 6}));
  INNER.add(IN.ruler, IN.zero);
  // предметы: чашка, подарок, тарелка, сердечко
  IN.cup = makeCup(1.7, true); IN.cup.root.z = 0; INNER.add(IN.cup.root);
  IN.rays1 = makeRays(9, 138); IN.cup.root.add(IN.rays1.root);
  IN.gift = makeGift(); INNER.add(IN.gift.root);
  IN.plate = makePlate(); INNER.add(IN.plate.root);
  IN.cup2 = makeCup(2.1, true); IN.cup2.root.dyn = true; INNER.add(IN.cup2.root);
  IN.gift2 = makeGift(); IN.gift2.root.dyn = true; IN.gift2.root.sx = IN.gift2.root.sy = 1.1; INNER.add(IN.gift2.root);
  IN.heart = G({z: 0, dyn: true}); IN.heart.add(N(paper({shape: S.heart(0, 0, 4.2), color: COL.pink, res: 3, amp: 1.4, grey: true}), {lift: 8})); INNER.add(IN.heart);
  // три полосы и склейка
  const strip = (color, o = {}) => paper({shape: S.rect(-480, -42, 480, 42), color, res: 1.4, amp: 2.4, grey: true, ...o});
  IN.kalka = N(strip(COL.kalka, {alpha: .66, deco: g => { g.strokeStyle = 'rgba(80,90,100,.6)'; g.lineWidth = 5; g.beginPath(); for (let x = -470; x <= 470; x += 6) g.lineTo(x, Math.sin(x / 34) * 14); g.stroke(); }}), {z: 4, lift: 7, dyn: true});
  IN.ochre = N(strip(COL.ochre, {holes: [S.ell(150, 0, 26, 26)], deco: g => { g.fillStyle = 'rgba(255,240,200,.25)'; for (let k = 0; k < 8; k++){ const a = k / 8 * TAU; g.beginPath(); g.moveTo(150 + Math.cos(a) * 34, Math.sin(a) * 34); g.lineTo(150 + Math.cos(a + .14) * 50, Math.sin(a + .14) * 50); g.lineTo(150 + Math.cos(a - .14) * 50, Math.sin(a - .14) * 50); g.fill(); } }}), {z: 2, lift: 7, dyn: true});
  IN.red = N(strip(COL.verm, {texScale: .7, deco: g => { const q = rng(9); g.fillStyle = 'rgba(90,10,0,.25)'; for (let i = 0; i < 900; i++) g.fillRect(-480 + q() * 960, -42 + q() * 84, 2, 2); g.fillStyle = '#9aa0a6'; [-440, -400, 400, 440].forEach(x => { g.beginPath(); g.arc(x, 0, 8, 0, TAU); g.fill(); }); }}), {z: 0, lift: 7, dyn: true});
  IN.tapes = [[-430, -40, -.3], [-430, 40, .25], [430, -40, .3], [430, 40, -.25]].map(([x, y, a]) => N(paper({shape: S.rect(-42, -15, 42, 15), color: '#efe2c4', alpha: .8, res: 2, amp: 1.2}), {x, y, r: a, z: -2, lift: 3, vis: false, dyn: true}));
  IN.slab = G({z: -1, vis: false});
  IN.slab.add(N(paper({shape: S.rect(-494, -52, 494, 68), color: '#7e1f12', res: 1.4, amp: 2}), {y: 4, lift: 4}),
              N(paper({shape: S.rect(-494, -60, 494, 60), color: '#cf3b27', res: 1.4, amp: 2.2, grey: true, texScale: .7, deco: g => { const q = rng(19); g.strokeStyle = 'rgba(90,10,0,.22)'; g.lineWidth = 2; for (let i = 0; i < 40; i++){ const y = -44 + q() * 88, x = -480 + q() * 900; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 40 + q() * 80, y + (q() - .5) * 4); g.stroke(); } }}), {lift: 10}));
  IN.pins = [-460, 460].map(x => G({x, y: -6, vis: false, dyn: true}).add(N(paper({shape: S.ell(0, 0, 15, 15), color: '#c9a24a', res: 3, amp: .8, deco: g => { g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(-4, -5, 5, 3, -.6, 0, TAU); g.fill(); }}), {lift: 6})));
  IN.pins.forEach(p => IN.slab.add(p));
  IN.board = G({x: 0, y: -1000}); IN.board.add(IN.kalka, IN.ochre, IN.red, ...IN.tapes, IN.slab);
  IN.shade = N(paper({shape: [[-480, 0], [480, 0], [560, 250], [-560, 250]], color: '#30303c', alpha: .34, res: .8, amp: 3, edge: false, tex: .5}), {z: -6, lift: 0, shadowA: 0, a: 0});
  INNER.add(IN.board, IN.shade);
  // кулиса внутри: мягкие завитки по краям
  IN.front = G({z: -120});
  [[-1250, -520, .4], [1300, 420, 2.6], [-1300, 600, -1.2]].forEach(([x, y, a]) => IN.front.add(N(paper({shape: S.band(S.arc(0, 0, 260, 200, 0, 4.2, 18), 70, 20), color: '#3d54a0', res: .6, amp: 3}), {x, y, r: a, lift: 8})));
  INNER.add(IN.front);
  IN.mask = H1.mask;
}

/* ---------- герой А ---------- */
function makeHero(){
  const C = {coat: '#b9ab95', coatA: '#ae9f88', coatB: '#9e907b', lapel: '#837563', skin: '#f1c8a2', skinD: '#e0a982', hair: '#4a3426', pants: '#3d4560', shoe: '#2c221c', shirt: '#f3ead8'};
  const root = G({}), hip = G({y: -120}); root.add(hip);
  const leg = len => paper({shape: S.rrect(-12, -6, 12, len, 6), color: C.pants, res: 4, amp: 1.2});
  const shoe = () => paper({shape: S.ell(6, 0, 20, 9), color: C.shoe, res: 4, amp: 1});
  const legs = [-17, 17].map(x => G({x, y: 0}).add(N(leg(116), {lift: 4}), N(shoe(), {y: 118, lift: 3})));
  const legsSit = [-19, 19].map(x => G({x, y: 4, vis: false}).add(N(paper({shape: S.rrect(-14, -10, 14, 100, 10), color: C.pants, res: 4, amp: 1.2}), {lift: 4}), N(shoe(), {y: 103, lift: 3})));
  const armB = G({x: -50, y: -205, under: true}).add(N(paper({shape: S.band([[0, 0], [-6, 80], [-10, 150]], 30, 26), color: C.coatB, res: 4, amp: 1.4}), {lift: 3}), N(paper({shape: S.ell(-10, 160, 14, 15), color: C.skinD, res: 4, amp: 1}), {lift: 3}));
  const coat = N(paper({shape: [[-50, -218], [50, -218], [62, -206], [82, 22], [-82, 22], [-62, -206]], color: C.coat, res: 4, amp: 1.6, grey: true, greyFilter: 'grayscale(1) brightness(.62)'}), {lift: 5});
  const shirt = N(paper({shape: [[-22, -218], [22, -218], [0, -150]], color: C.shirt, res: 4, amp: 1}), {lift: 1.5});
  const lapL = N(paper({shape: [[-4, -217], [-42, -214], [-14, -128]], color: C.lapel, res: 4, amp: 1}), {lift: 2.5});
  const lapR = N(paper({shape: [[4, -217], [42, -214], [14, -128]], color: C.lapel, res: 4, amp: 1}), {lift: 2.5});
  const btn = y => N(paper({shape: S.ell(0, y, 5, 5, 10), color: '#4b3729', res: 4, amp: .5}), {lift: 1.5});
  const armF = G({x: 52, y: -205}).add(N(paper({shape: S.band([[0, 0], [6, 80], [10, 150]], 30, 26), color: C.coatA, res: 4, amp: 1.4}), {lift: 5}), N(paper({shape: S.ell(10, 160, 14, 15), color: C.skin, res: 4, amp: 1}), {lift: 4}));
  const neck = N(paper({shape: S.rect(-11, -246, 11, -210), color: C.skinD, res: 4, amp: .8}), {lift: 2});
  // голова: целое лицо и половинки (подменяются, когда лицо раскрывается)
  const head = G({y: -282});
  const R = 58, hr = 14;
  const faceFull = N(paper({shape: S.ell(0, 0, R, R, 64), color: C.skin, res: hr, amp: 1.1}), {lift: 4});
  const faceL = N(paper({shape: S.arc(0, 0, R, R, Math.PI / 2, Math.PI * 1.5, 34), color: C.skin, res: hr, amp: 1.3}), {lift: 4, vis: false});
  const faceR = N(paper({shape: S.arc(0, 0, R, R, -Math.PI / 2, Math.PI / 2, 34), color: C.skin, res: hr, amp: 1.3}), {lift: 4, vis: false});
  const hairShape = S.arc(0, -4, R + 5, R + 3, Math.PI * 1.08, Math.PI * 1.92, 30).concat([[46, -30], [26, -36], [8, -26], [-12, -38], [-34, -30], [-50, -24]]);
  const hairFull = N(paper({shape: hairShape, color: C.hair, res: hr, amp: 1.2}), {lift: 3});
  const hairL = N(paper({shape: S.arc(0, -4, R + 5, R + 3, Math.PI * 1.08, Math.PI * 1.5, 18).concat([[0, -34], [-12, -38], [-34, -30], [-50, -24]]), color: C.hair, res: hr, amp: 1.2}), {lift: 3, vis: false});
  const hairR = N(paper({shape: S.arc(0, -4, R + 5, R + 3, Math.PI * 1.5, Math.PI * 1.92, 18).concat([[46, -30], [26, -36], [8, -26], [0, -30]]), color: C.hair, res: hr, amp: 1.2}), {lift: 3, vis: false});
  const eye = x => N(paper({shape: S.ell(x, 4, 6.8, 7.4, 16), color: '#2a2320', res: hr, amp: .4, deco: g => { g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.arc(x - 2, 1, 2, 0, TAU); g.fill(); }}), {lift: 1.5});
  const brow = sgn => G({x: sgn * 21, y: -16}).add(N(paper({shape: S.band([[-11, 1], [0, -1.5], [11, 1]], 4.5, 4), color: '#3a2a1f', res: hr, amp: .4}), {lift: 1.5}));
  const cheek = x => N(paper({shape: S.ell(x, 24, 10, 6, 14), color: '#ec9f95', alpha: .55, res: hr, amp: .5, edge: false}), {lift: .5, shadowA: 0});
  const ears = [-1, 1].map(s => N(paper({shape: S.ell(s * 56, 6, 11, 15, 16), color: C.skinD, res: hr, amp: .8}), {lift: 3}));
  const eyeL = eye(-21), eyeR = eye(21), browL = brow(-1), browR = brow(1);
  const nose = N(paper({shape: S.ell(4, 18, 6, 5, 12), color: C.skinD, res: hr, amp: .5}), {lift: 1.5});
  const mouth = N(paper({shape: S.band([[-10, 0], [-2, 2], [6, 0]], 3.6, 3.6), color: '#7d3b2f', res: hr, amp: .3}), {y: 33, lift: 1});
  const gL = G({}).add(G({under: true}).add(ears[0]), faceL, eyeL, browL, cheek(-31), mouth, hairL), gR = G({}).add(G({under: true}).add(ears[1]), faceR, eyeR, browR, cheek(31), nose, hairR);
  const mask = N(paper({shape: S.ell(0, 0, R - 2, R - 2, 64), color: '#000', res: 4, amp: .9, edge: false, tex: 0, tone: false}), {vis: false});
  head.add(faceFull, gL, gR, hairFull, mask);
  hip.add(...legs, ...legsSit, armB, coat, shirt, lapL, lapR, btn(-110), btn(-66), armF, neck, head);
  return {root, hip, legs, legsSit, armB, armF, coat, head, faceFull, faceL, faceR, hairFull, hairL, hairR, gL, gR, eyeL, eyeR, browL, browR, mouth, mask};
}
function makeCup(k = 1, big = false){
  const root = G({sx: k, sy: k});
  const body = N(paper({shape: S.rrect(-26, -56, 26, 0, 9), color: '#f6f0e4', res: big ? 4 : 3, amp: 1.2, grey: true, deco: g => { g.fillStyle = '#5b86b5'; g.fillRect(-30, -34, 60, 9); }}), {lift: 6});
  const handle = N(paper({shape: S.ell(30, -30, 16, 15, 20), holes: [S.ell(30, -30, 8, 8, 14)], color: '#f0e8da', res: big ? 4 : 3, amp: 1, grey: true}), {lift: 5, under: true});
  const tea = N(paper({shape: S.ell(0, -54, 22, 6, 20), color: '#7a4a2a', res: big ? 4 : 3, amp: .8, grey: true}), {lift: 2});
  const steam = [-10, 4, 16].map((x, i) => { const pts = Array.from({length: 9}, (_, j) => [x + Math.sin(j * .9 + i) * 9, -66 - j * 11]); return G({}).add(N(paper({shape: S.band(pts, 7, 3), color: '#fffaf0', alpha: .9, res: big ? 4 : 3, amp: .8}), {lift: 3, shadowA: .5}), N(paper({shape: S.band(pts.map(([px, py], j) => [px + Math.sin(j * .9 + i + 1.6) * 6, py]), 7, 3), color: '#fffaf0', alpha: .9, res: big ? 4 : 3, amp: .8}), {lift: 3, shadowA: .5, vis: false})); });
  root.add(handle, body, tea, ...steam);
  return {root, body, handle, tea, steam};
}
function makeRays(n, len){
  const root = G({dz: 6, a: 0});
  const rays = Array.from({length: n}, (_, i) => N(paper({shape: [[16, -13], [len * .62, -15], [len * .9, -8], [len, 0], [len * .9, 8], [len * .62, 15], [16, 13]], color: i % 2 ? COL.mustard : '#f4d27a', res: 2, amp: 1.2}), {lift: 3, shadowA: .6}));
  root.add(...rays); return {root, rays};
}
function makeGift(){
  const root = G({z: 0});
  const rays = makeRays(11, 150); root.add(rays.root);
  const box = N(paper({shape: S.rect(-52, -44, 52, 44), color: '#e58a3a', res: 3, amp: 1.4, grey: true, deco: g => { g.fillStyle = COL.mustard; g.fillRect(-9, -50, 18, 100); }}), {lift: 7});
  const lid = G({x: -58, y: -44}).add(N(paper({shape: S.rect(0, -22, 116, 0), color: '#c96f2a', res: 3, amp: 1.4, grey: true, deco: g => { g.fillStyle = '#d9a12e'; g.fillRect(49, -24, 18, 26); }}), {lift: 6}),
    N(paper({shape: S.ell(42, -34, 18, 12, 18), holes: [S.ell(42, -34, 7, 4, 12)], color: COL.mustard, res: 3, amp: 1, grey: true}), {lift: 7}), N(paper({shape: S.ell(74, -34, 18, 12, 18), holes: [S.ell(74, -34, 7, 4, 12)], color: COL.mustard, res: 3, amp: 1, grey: true}), {lift: 7}));
  root.add(box, lid);
  return {root, rays, box, lid};
}
function makePlate(){
  const root = G({z: 0});
  const deco = g => { g.strokeStyle = 'rgba(150,160,170,.6)'; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, 46, 0, TAU); g.stroke(); g.strokeStyle = '#5b86b5'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 58, 0, TAU); g.stroke(); };
  const whole = N(paper({shape: S.ell(0, 0, 66, 66, 48), color: '#f7f4ee', res: 3, amp: 1.2, grey: true, deco}), {lift: 7});
  const zig = [[6, -66], [-6, -36], [10, -10], [-8, 18], [8, 42], [-2, 66]];
  const halfL = N(paper({shape: S.arc(0, 0, 66, 66, Math.PI / 2 + .03, Math.PI * 1.5 - .09, 30).concat(zig), color: '#f7f4ee', res: 3, amp: 1.2, grey: true, deco}), {lift: 7, vis: false});
  const halfR = N(paper({shape: S.arc(0, 0, 66, 66, -Math.PI / 2 + .09, Math.PI / 2 - .03, 30).concat(zig.slice().reverse()), color: '#f7f4ee', res: 3, amp: 1.2, grey: true, deco}), {lift: 7, vis: false});
  const crumbs = Array.from({length: 6}, (_, i) => N(paper({shape: [[0, -7], [8, 6], [-7, 5]], color: '#c9c6bf', res: 3, amp: .6}), {lift: 4, vis: false, x: (i - 2.5) * 9, y: 0}));
  root.add(whole, halfL, halfR, ...crumbs);
  return {root, whole, halfL, halfR, crumbs};
}

/* ================= время ================= */
const camRoomIn = path([
  [0, {x: -420, y: -40, ls: Math.log(.92), roll: -.012}],
  [3.75, {x: -250, y: -64, ls: Math.log(.96), roll: -.004}],
  [6.9, {x: -40, y: -66, ls: Math.log(1.05), roll: .004}],
  [8.3, {x: 28, y: -8, ls: Math.log(1.7), roll: .008}],
  [9.5, {x: 56, y: 9, ls: Math.log(4.2), roll: .01}],
  [10.5, {x: 60, y: 12, ls: Math.log(14), roll: .012}],
  [11.25, {x: 60, y: 12, ls: Math.log(34), roll: .012}],
]);
const camRoomOut = path([
  [33.9, {x: 60, y: 12, ls: Math.log(34), roll: -.01}],
  [34.9, {x: 58, y: 9, ls: Math.log(6), roll: -.008}],
  [36.3, {x: -10, y: -40, ls: Math.log(1.3), roll: -.004}],
  [38.4, {x: -150, y: -58, ls: Math.log(1.02), roll: .002}],
  [40, {x: -196, y: -62, ls: Math.log(.99), roll: .004}],
]);
const camInner = path([
  [8.8, {x: 0, y: 30, ls: Math.log(.3), roll: .02}],
  [11.25, {x: -280, y: 10, ls: Math.log(1.04), roll: .006}],
  [13.1, {x: -300, y: -30, ls: Math.log(1.12), roll: -.004}],
  [15.2, {x: 40, y: -30, ls: Math.log(1.14), roll: .004}],
  [17.2, {x: 400, y: 10, ls: Math.log(1.1), roll: .008}],
  [18.8, {x: 300, y: -200, ls: Math.log(1.04), roll: .004}],
  [20.5, {x: -80, y: -985, ls: Math.log(.98), roll: -.006}],
  [22.6, {x: 40, y: -1000, ls: Math.log(1.06), roll: .002}],
  [24.4, {x: 0, y: -1000, ls: Math.log(1.36), roll: -.004}],
  [25.7, {x: -10, y: -996, ls: Math.log(1.44), roll: .006}],
  [26.5, {x: 0, y: -900, ls: Math.log(1.22), roll: .002}],
  [27.7, {x: -150, y: -120, ls: Math.log(1.12), roll: -.004}],
  [29.0, {x: -170, y: -70, ls: Math.log(1.5), roll: .002}],
  [30.9, {x: 60, y: -70, ls: Math.log(1.55), roll: .005}],
  [32.6, {x: 120, y: -70, ls: Math.log(1.5), roll: .006}],
  [33.75, {x: 100, y: -60, ls: Math.log(1.36), roll: .004}],
  [35.7, {x: 0, y: 0, ls: Math.log(.28), roll: -.01}],
]);
const toCam = p => ({x: p.x, y: p.y, z: F * (1 - Math.exp(-p.ls)), roll: p.roll});
// лёгкий толчок камеры после удара плиты
const shake = t => { const u = t - 25.625; if (u < 0 || u > .7) return [0, 0]; const k = Math.exp(-u * 7); return [Math.sin(u * 34) * 5 * k, Math.cos(u * 27) * 4 * k]; };

function hold(t, a, b){ return clamp((t - a) / (b - a)); }
// значение, которое меняется рывками: состояние вырезки берём на сетке 12 кадров в секунду
function update(t){
  const tp = stepT(t), sp = Math.floor(t * 12 + 1e-6);
  /* --- комната --- */
  const h = H1;
  // проход к стулу и посадка
  const walkEnd = 5.6, x = tp < walkEnd ? lerp(610, 60, E.sine(clamp((tp - .2) / (walkEnd - .2)))) : 60;
  h.root.x = x;
  const walking = tp > .2 && tp < walkEnd - .1, ph = Math.floor(t / .3125);   // шаг на каждую восьмую музыки
  h.legs[0].r = walking ? (ph % 2 ? .24 : -.18) : 0; h.legs[1].r = walking ? (ph % 2 ? -.18 : .24) : 0;
  h.hip.y = -120 + (walking && ph % 2 ? -5 : 0);
  h.armF.r = walking ? (ph % 2 ? -.16 : .12) : 0; h.armB.r = walking ? (ph % 2 ? .12 : -.14) : 0;
  h.root.r = walking ? -.03 : 0;
  // садится в три рывка
  const sit = clamp((tp - 5.75) / .5);
  if (tp >= 5.75){ const k = Math.min(3, Math.floor(sit * 3 + 1e-6)); h.hip.y = [-120, -116, -112, -108][k]; const sitting = k >= 2; h.legs.forEach(l => l.vis = !sitting); h.legsSit.forEach(l => l.vis = sitting); h.armF.r = sitting ? -.18 : 0; h.armB.r = sitting ? .18 : 0; }
  else { h.legs.forEach(l => l.vis = true); h.legsSit.forEach(l => l.vis = false); }
  // взгляд: на чашку после посадки
  const look = tp > 6.6 && tp < 7.9 ? -3 : 0; h.eyeL.x = h.eyeR.x = look;
  h.head.r = tp > 6.6 && tp < 7.9 ? -.06 : 0;
  // лицо раскрывается: внутрь — с 9.0, обратно смыкается к 35.6
  let o = 0; if (tp >= 9.0 && tp < 34) o = E.out(clamp((tp - 9.0) / .5)); if (tp >= 34) o = 1 - E.io(clamp((tp - 35.0) / .6));
  const split = o > 0; h.faceFull.vis = h.hairFull.vis = !split; [h.faceL, h.faceR, h.hairL, h.hairR].forEach(n => n.vis = split);
  h.gL.x = -o * 78; h.gR.x = o * 78; h.gL.r = -o * .16; h.gR.r = o * .16; h.gL.y = h.gR.y = -o * 10;
  // настроение в финале: брови сведены, рот прямой
  const sad = tp > 36.0 ? 1 : 0; h.browL.r = sad * .22; h.browR.r = -sad * .22; h.browL.y = h.browR.y = -16 + sad * 3;
  // пар над чашкой; в финале — нет пара, чашка серая
  const cupGrey = tp >= 36.25 ? Math.min(1, Math.floor((tp - 36.25) * 12 / 3 + 1) / 3) : 0;
  RM.cup.steam.forEach((s, i) => { const on = tp < 36.25; s.vis = on; const q = (sp + i * 3) % 12; s.y = -q * 1.6; s.a = q < 9 ? 1 : (12 - q) / 3; s.kids[0].vis = Math.floor((sp + i) / 3) % 2 === 0; s.kids[1].vis = !s.kids[0].vis; });
  [RM.cup.body, RM.cup.handle, RM.cup.tea].forEach(n => n.grey = cupGrey);
  // комната выцветает
  const fade = tp >= 36.25 ? Math.min(1, Math.floor((tp - 36.25) * 12 / 4 + 1) / 3) * .62 : 0;
  [RM.wall, RM.sky, RM.sun, RM.hill, RM.curL, RM.curR, RM.picIn, RM.rug, RM.light, ...RM.leaves].forEach(n => n.grey = fade);
  RM.light.a = 1 - fade * .5;
  // маленькая красная планка падает над головой
  RM.mini.vis = tp >= 36.25; RM.mini.y = -505 - (1 - E.drop(clamp((tp - 36.25) / .42))) * 160; RM.mini.r = tp >= 36.25 ? (1 - clamp((tp - 36.25) / .42)) * .25 - .02 : 0;
  // огонёк записи
  RM.rec.a = (Math.floor(t * 2) % 2 === 0) ? 1 : .18;
  // шторы чуть колышутся
  RM.curL.r = Math.sin(sp * .5) * .006; RM.curR.r = -Math.sin(sp * .5 + 1) * .006;
  RM.leaves.forEach((l, i) => l.boil = 1.2);

  /* --- внутри головы --- */
  IN.stars.forEach((s, i) => { s.a = .55 + .45 * Math.sin(sp * .7 + s.tw * 9); });
  // 1.2: чашка поднимается выше нуля и расцветает
  const cupY = tp < 11.4 ? 430 : lerp(430, -160, E.back(clamp((tp - 11.4) / 1.2)));
  IN.cup.root.x = -420; IN.cup.root.y = cupY; IN.cup.root.vis = tp < 19.5;
  const cupAbove = tp >= 12.5; const cupG = cupAbove ? Math.max(0, .6 - Math.floor((tp - 12.5) * 12) * .3) : .6;
  [IN.cup.body, IN.cup.handle, IN.cup.tea].forEach(n => n.grey = cupG);
  IN.cup.steam.forEach((s, i) => { s.vis = cupAbove; const q = (sp + i * 4) % 12; s.y = -q * 2; s.a = q < 9 ? 1 : (12 - q) / 3; s.kids[0].vis = Math.floor((sp + i) / 3) % 2 === 0; s.kids[1].vis = !s.kids[0].vis; });
  fan(IN.rays1, tp, 12.5, -.8, sp);
  // подарок
  const g1 = IN.gift; g1.root.x = 60; g1.root.y = tp < 13.6 ? 720 : lerp(720, -170, E.back(clamp((tp - 13.6) / 1.2))); g1.root.vis = tp < 19.5;
  const gOpen = tp >= 15.0; [g1.box, ...g1.lid.kids].forEach(n => n.grey = gOpen ? 0 : .55); g1.lid.r = gOpen ? -Math.min(1, Math.floor((tp - 15.0) * 12 + 1) / 3) * 1.1 : 0;
  fan(g1.rays, tp, 15.08, .3, sp);
  // тарелка опускается ниже нуля и трескается
  const pl = IN.plate; pl.root.x = 520; pl.root.vis = tp < 19.5;
  pl.root.y = tp < 15.9 ? -820 : lerp(-820, 290, E.drop(clamp((tp - 15.9) / .975)));
  const broken = tp >= 16.875; pl.whole.vis = !broken; pl.halfL.vis = pl.halfR.vis = broken;
  const bk = broken ? Math.min(1, (Math.floor((tp - 16.875) * 12) + 1) / 4) : 0;
  pl.halfL.x = -bk * 26; pl.halfR.x = bk * 26; pl.halfL.r = -bk * .35; pl.halfR.r = bk * .3; pl.halfL.y = pl.halfR.y = bk * 14;
  pl.halfL.grey = pl.halfR.grey = Math.min(1, bk * 1.2); pl.whole.grey = tp > 16.4 ? .4 : 0;
  pl.crumbs.forEach((c, i) => { c.vis = broken; c.x = (i - 2.5) * (10 + bk * 22); c.y = 50 + bk * (20 + i * 9); c.r = bk * (i - 2) * .8; });
  // 1.3: три полосы
  const kIn = clamp((tp - 20.0) / .625), oIn = clamp((tp - 21.25) / .625), rIn = clamp((tp - 22.5) / .625), join = E.io(clamp((tp - 23.75) / .625));
  IN.kalka.x = lerp(-1700, -10, E.out(kIn)); IN.kalka.y = lerp(-96, -16, join); IN.kalka.r = lerp(-.06, 0, kIn) * (1 - join) - .015 * (1 - join);
  IN.ochre.y = lerp(-760, 0, E.out(oIn)); IN.ochre.x = 0; IN.ochre.r = .02 * (1 - join);
  IN.red.x = lerp(1700, 8, E.out(rIn)); IN.red.y = lerp(96, 16, join); IN.red.r = lerp(.06, 0, rIn) * (1 - join) + .015 * (1 - join);
  IN.kalka.lift = IN.ochre.lift = IN.red.lift = lerp(14, 3, join);
  const mono = tp >= 25.625;
  [IN.kalka, IN.ochre, IN.red].forEach(n => n.vis = tp >= 19.0 && !mono);
  IN.tapes.forEach((tp_, i) => { const t0 = i < 2 ? 24.375 : 25.0; tp_.vis = tp >= t0 && !mono; const k = clamp((tp - t0) * 12 / 2); tp_.lift = lerp(30, 2, k); tp_.sx = tp_.sy = lerp(1.25, 1, k); });
  // склейка в глухую плиту и спуск планкой
  IN.slab.vis = mono;
  const down = E.io(clamp((tp - 26.25) / 1.25));
  IN.board.y = lerp(-1000, -200, down);
  const sk = mono && tp < 26.2 ? Math.exp(-(tp - 25.625) * 6) : 0; IN.slab.x = (hash(3, sp) - .5) * 14 * sk; IN.slab.r = (hash(5, sp) - .5) * .02 * sk;
  IN.pins.forEach(p => { p.vis = tp >= 27.5; const k = clamp((tp - 27.5) * 12 / 2); p.kids[0].lift = lerp(26, 6, k); p.sx = p.sy = lerp(1.3, 1, k); });
  IN.shade.a = tp >= 27.5 ? Math.min(1, Math.floor((tp - 27.5) * 12 + 1) / 4) : 0; IN.shade.y = -150; IN.shade.x = 0;
  IN.zero.a = tp >= 27.5 ? .55 : 1;
  // 1.4: чашка, подарок, сердечко не достают до планки и гаснут
  dim(IN.cup2.root, [IN.cup2.body, IN.cup2.handle, IN.cup2.tea], tp, -330, -22, 28.1, 28.75, 30.0, sp, IN.cup2.steam);
  dim(IN.gift2.root, [IN.gift2.box, ...IN.gift2.lid.kids], tp, 280, -66, 30.0, 30.625, 31.25, sp);
  dim(IN.heart, [IN.heart.kids[0]], tp, -30, -72, 31.25, 31.875, 32.5, sp);
  IN.gift2.rays.root.a = 0;
}
// веер лучей раскрывается поворотом на булавке, четыре рывка
function fan(R, tp, t0, rot, sp){
  const k = tp < t0 ? 0 : Math.min(1, (Math.floor((tp - t0) * 12) + 1) / 4); R.root.a = k > 0 ? 1 : 0;
  R.rays.forEach((r, i) => { const fin = rot + i / R.rays.length * TAU + (tp - t0 > .4 ? Math.floor((tp - t0) * 3) * .05 : 0); r.r = lerp(-Math.PI / 2, fin, k); r.sx = .4 + .6 * k; });
}
// предмет поднимается, упирается в тень планки, сереет за три рывка и ложится плашмя на линейку
function dim(root, greyNodes, tp, x, top, t0, t1, t2, sp, steam){
  root.vis = tp >= t0 - .05 && tp < 40; root.x = x;
  const up = E.out(clamp((tp - t0) / (t1 - t0)));
  let y = lerp(430, top, up), r = 0;
  const gk = tp < t1 + .1 ? 0 : Math.min(1, (Math.floor((tp - t1 - .1) * 12) + 1) / 3);
  greyNodes.forEach(n => n.grey = gk * .85);
  if (steam) steam.forEach((s, i) => { s.vis = up < .5; const q = (sp + i * 4) % 12; s.y = -q * 2; s.a = q < 9 ? 1 : (12 - q) / 3; s.kids[0].vis = Math.floor((sp + i) / 3) % 2 === 0; s.kids[1].vis = !s.kids[0].vis; });
  if (tp > t2 - .55){ const f = E.drop(clamp((tp - (t2 - .55)) / .55)); y = lerp(top, 20, f); r = lerp(0, 1.45, E.io(clamp((tp - (t2 - .55)) / .4))); }
  root.y = y; root.r = r;
}
// звук: события на тех же временах
function cues(){
  CUES.length = 0;
  for (let k = 0; k < 17; k++){ const t = .2 + k * .3125; if (t < 5.6) cue(t, 'step', {pan: lerp(.6, 0, t / 5.6), v: .5}); }
  cue(5.9, 'creak', {pan: .05}); cue(6.25, 'thud', {v: .35, pan: .05});
  cue(9.0, 'tear', {v: .8}); cue(11.25, 'arrive');
  cue(12.5, 'ping', {chord: [74, 81, 86], pan: -.3}); cue(15.0, 'ping', {chord: [76, 83, 88], pan: .05});
  cue(16.875, 'crack', {pan: .35}); cue(16.875, 'thud', {v: .7, pan: .35});
  cue(19.0, 'whoosh', {v: .5, dir: 'up'});
  cue(20.625, 'slide', {pan: -.4}); cue(21.875, 'slide', {pan: 0}); cue(23.125, 'slide', {pan: .4}); cue(23.75, 'rustle');
  cue(24.375, 'tape', {pan: -.3}); cue(25.0, 'tape', {pan: .3}); cue(25.625, 'slam'); cue(26.4, 'creak', {v: .5}); cue(27.5, 'pin', {pan: -.35}); cue(27.58, 'pin', {pan: .35});
  [[28.75, 30.0, -.25], [30.625, 31.25, .2], [31.875, 32.5, 0]].forEach(([a, b, p]) => { cue(a, 'mute', {pan: p}); cue(b, 'flop', {pan: p}); });
  cue(33.75, 'whoosh', {v: .6, dir: 'down'}); cue(35.0, 'tear', {v: .5, rev: true});
  cue(36.25, 'pin', {pan: 0, v: .8}); cue(36.66, 'thud', {v: .3});
  cue(39.3, 'rec');
}

/* ================= кадр ================= */
let IC = null;
function renderAt(g, t, to = t){
  update(to);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.fillStyle = '#1d1712'; g.fillRect(0, 0, W, H);
  const inRoomIn = t < 11.25, inRoomOut = t >= 33.9;
  const roomCam = toCam(inRoomIn ? camRoomIn(t) : camRoomOut(Math.max(t, 33.9))), innerCam = toCam(camInner(t));
  const [sx, sy] = shake(t); innerCam.x += sx; innerCam.y += sy;
  const split = H1.faceL.vis;
  // покрывает ли «окно» головы весь кадр
  let covers = false;
  if (split){ const M = spriteM(H1.mask, roomCam, to); const cx = M[0] * (0 - H1.mask.sp.x0) * H1.mask.sp.res + M[2] * (0 - H1.mask.sp.y0) * H1.mask.sp.res + M[4], cy = M[1] * (0 - H1.mask.sp.x0) * H1.mask.sp.res + M[3] * (0 - H1.mask.sp.y0) * H1.mask.sp.res + M[5]; const rr = 55 * Math.hypot(M[0], M[1]) * H1.mask.sp.res; covers = [[0, 0], [W, 0], [0, H], [W, H]].every(([px, py]) => Math.hypot(px - cx, py - cy) < rr); }
  const roomVisible = (inRoomIn || inRoomOut) && !covers;
  if (!roomVisible){ drawWorld(g, INNER, innerCam, to); grade(g, .7); return; }
  if (!split){ drawWorld(g, ROOM, roomCam, to); grade(g); return; }
  // комната без головы, затем внутренний мир в силуэте головы, затем раскрытые половинки лица
  H1.head.vis = false; drawWorld(g, ROOM, roomCam, to); H1.head.vis = true;
  IC = IC || makeCanvas(); const ig = IC.getContext('2d'); ig.setTransform(1, 0, 0, 1, 0, 0); ig.globalCompositeOperation = 'source-over'; ig.clearRect(0, 0, W, H);
  drawWorld(ig, INNER, innerCam, to);
  ig.globalCompositeOperation = 'destination-in'; H1.mask.vis = true; const M = spriteM(H1.mask, roomCam, to); H1.mask.vis = false; ig.setTransform(...M); ig.drawImage(H1.mask.sp.c, 0, 0); ig.setTransform(1, 0, 0, 1, 0, 0); ig.globalCompositeOperation = 'source-over';
  g.drawImage(IC, 0, 0);
  drawWorld(g, H1.head, roomCam, to);
  grade(g);
}
// сколько подкадров нужно: быстрые проезды камеры размазываются
function subFor(t){ const d = .02, a = t < 11.25 ? camRoomIn : t >= 33.9 ? camRoomOut : camInner; const p0 = a(t - d), p1 = a(t + d); const v = Math.hypot(p1.x - p0.x, p1.y - p0.y) * Math.exp(p1.ls) / (2 * d) + Math.abs(p1.ls - p0.ls) / (2 * d) * 900; return v > 900 ? 5 : v > 350 ? 3 : 1; }
