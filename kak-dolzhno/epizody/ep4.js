/* Эпизод 4 «Первый кирпич» — к части 3 (счёт себе). 40 секунд.
   Нить: красная планка над героем. Она надрезает пальто после каждого маленького усилия,
   гасит механизм «идеального дня» на последнем диске, прибита порогом под потолком,
   а в конце сама складывается в первый кирпич дома. */
const DUR = 40, BEAT = .625;
const PX4 = 1600, X3 = 3600, HX2 = 1050;   // стена с дисками и комната с порогом
const WHIP = 18.42;            // в середине быстрой панорамы герой уже стоит на лестнице
let WORLD, HA, GH, E4 = {};

const ghost = () => makePerson({coat: '#dfe6e8', coatA: '#d5dde0', coatB: '#c9d2d6', lapel: '#b8c2c6', skin: '#e9edef', skinD: '#d9dfe2', hairC: '#aab4ba', pants: '#bcc5c9', shoe: '#a9b2b6', shirt: '#f4f6f7', browC: '#9aa4aa'});

function makeDumbbell(k = 1, c = '#4a4a52'){
  const g0 = G({sx: k, sy: k, dyn: true});
  g0.add(N(paper({shape: S.rect(-44, -5, 44, 5), color: '#9aa0a6', res: 3, amp: .6}), {lift: 5}));
  [-1, 1].forEach(s => g0.add(N(paper({shape: S.rrect(s * 30 - 9, -24, s * 30 + 9, 24, 5), color: c, res: 3, amp: 1}), {lift: 6}), N(paper({shape: S.rrect(s * 42 - 6, -17, s * 42 + 6, 17, 4), color: shade(c, .8), res: 3, amp: .8}), {lift: 6})));
  return g0;
}
// значок в окошке диска: портфель, монета, сердце, гантель, самолётик, яблоко, книга, салют
function icon(kind){
  const g0 = G({y: -50});
  const P = (shape, color, o = {}) => N(paper({shape, color, res: 3, amp: .8, ...o}), {lift: 2});
  if (kind === 0) g0.add(P(S.rrect(-24, -12, 24, 18, 4), '#a8703f'), P(S.band(S.arc(0, -12, 11, 9, Math.PI, TAU, 8), 5, 5), '#6a4028'));
  else if (kind === 1) g0.add(P(S.ell(0, 0, 22, 22, 24), '#e8b83e', {deco: g => { g.strokeStyle = 'rgba(120,70,0,.4)'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 14, 0, TAU); g.stroke(); }}));
  else if (kind === 2) g0.add(P(S.heart(0, -4, 1.45), '#e2483a'));
  else if (kind === 3) g0.add(P(S.rect(-22, -3, 22, 3), '#9aa0a6'), P(S.rrect(-25, -13, -14, 13, 3), '#cfd3d6'), P(S.rrect(14, -13, 25, 13, 3), '#cfd3d6'));
  else if (kind === 4) g0.add(P([[-24, 8], [26, -14], [-6, 16]], '#f6f1e6'), P([[-6, 16], [26, -14], [2, 4]], '#cfd8e0'));
  else if (kind === 5) g0.add(P(S.ell(0, 4, 19, 18, 22), '#d8432e'), P(S.band([[0, -12], [2, -22]], 4, 3), '#5a3d2c'), P(S.ell(9, -20, 8, 4, 10), COL.leaf));
  else if (kind === 6) g0.add(P(S.rect(-22, -16, 22, 16), COL.blue), P(S.rect(-20, 9, 22, 16), '#f6f1e6'));
  else g0.add(P(S.star(0, 0, 25, 9, 8), '#e8b83e'), P(S.ell(0, 0, 6, 6, 10), '#e2483a'));
  return g0;
}
// гармошка: зигзаг из n сгибов шириной w
function zig(w, n, h){ const top = [], bot = []; for (let i = 0; i <= n; i++){ const x = -w / 2 + i * w / n, d = i % 2 ? -9 : 9; top.push([x, -h / 2 + d]); bot.unshift([x, h / 2 + d]); } return top.concat(bot); }
function makeBrick(c = COL.terra){
  const root = G({dyn: true});
  const P = col => N(paper({shape: S.rrect(-56, -58, 56, 0, 6), color: col, res: 3, amp: 1.6, deco: g => { g.fillStyle = 'rgba(90,30,10,.2)'; [[-30, -40], [8, -22], [30, -44], [-12, -14], [36, -16]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 3, 0, TAU); g.fill(); }); g.fillStyle = 'rgba(255,230,200,.2)'; g.fillRect(-52, -56, 104, 8); }}), {lift: 6});
  const glow = N(paper({shape: S.ell(0, -30, 130, 86, 30), color: '#ffcf6e', alpha: .5, res: 1, amp: 0, edge: false, tex: 0}), {dz: 1, lift: .5, shadowA: 0, a: 0});
  const cold = P(c), warm = P('#e07a45'); warm.a = 0;
  root.add(glow, cold, warm);
  return {root, glow, cold, warm};
}
function build(){
  GRAIN = makeGrain(9);
  WORLD = G({z: 0});
  WORLD.add(N(paper({shape: S.rect(-3200, -3200, 7800, 2600), color: COL.kraft, amp: 0, res: .4, edge: false, texScale: 3}), {z: 150}));
  // три листа обоев внахлёст: спортивный угол, стена с дисками, комната с порогом
  const stripes = (c, w) => g => { g.fillStyle = c; for (let x = -1800; x < 2900; x += w) g.fillRect(x, -1600, w * .42, 1900); };
  WORLD.add(N(paper({shape: S.rect(-1800, -1500, 1000, 262), color: '#e6d3b0', res: .4, amp: 4, deco: stripes('rgba(150,100,50,.07)', 90)}), {z: 80, lift: 3}));
  WORLD.add(N(paper({shape: S.rect(700, -1500, 2600, 262), color: '#d4dbc4', res: .4, amp: 4, deco: stripes('rgba(70,100,60,.08)', 70)}), {z: 80, lift: 4}));
  WORLD.add(N(paper({shape: S.rect(2500, -1500, 5700, 262), color: '#efdcc2', res: .4, amp: 4, deco: g => { g.fillStyle = 'rgba(190,120,70,.09)'; for (let y = -1480, r = 0; y < 262; y += 60, r++) for (let x = 2520 + (r % 2) * 40; x < 5700; x += 80){ g.beginPath(); g.arc(x, y, 6, 0, TAU); g.fill(); } }}), {z: 80, lift: 5}));
  WORLD.add(N(paper({shape: S.rect(700, -1500, 2600, -1060), color: '#c9ceb8', res: .4, amp: 3}), {z: 79, lift: 3}), N(paper({shape: S.rect(700, -1074, 2600, -1046), color: '#f1e6cf', res: .5, amp: 2}), {z: 78, lift: 5}));
  WORLD.add(N(paper({shape: S.rect(2500, -1500, 5700, -700), color: '#dcc6a6', res: .4, amp: 3}), {z: 79, lift: 3}), N(paper({shape: S.rect(2500, -716, 5700, -688), color: '#f1e6cf', res: .5, amp: 2}), {z: 78, lift: 5}));
  // пол из досок и плинтус
  WORLD.add(N(paper({shape: S.rect(-1800, 250, 5700, 1700), color: '#b98a5e', res: .4, amp: 3, deco: g => { g.strokeStyle = 'rgba(70,40,20,.2)'; g.lineWidth = 4; for (let y = 330; y < 1700; y += 90){ g.beginPath(); g.moveTo(-1800, y); g.lineTo(5700, y); g.stroke(); } g.fillStyle = 'rgba(70,40,20,.2)'; for (let k = 0; k < 240; k++) g.fillRect(-1800 + (k * 467) % 7500, 250 + Math.floor(k / 16) * 90, 4, 90); }}), {z: 40, lift: 3}));
  WORLD.add(N(paper({shape: S.rect(-1800, 236, 5700, 266), color: '#f1e6cf', res: .5, amp: 2}), {z: 79, lift: 4}));

  // 4.1 окно с занавесками и фикус
  const win = G({x: -700, y: -420, z: 78});
  win.add(N(paper({shape: S.rect(-170, -260, 170, 260), color: '#a9cde3', res: .8, amp: 2, deco: g => { g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(-60, -120, 80, 40, -.4, 0, TAU); g.fill(); }}), {lift: 2}),
          N(paper({shape: S.rect(-190, -280, 190, 280), holes: [S.rect(-170, -260, -6, -4), S.rect(6, -260, 170, -4), S.rect(-170, 4, -6, 260), S.rect(6, 4, 170, 260)], color: '#f3ead8', res: .8, amp: 1.6}), {lift: 4}),
          N(paper({shape: [[-240, -300], [-130, -300], [-160, 300], [-260, 300]], color: '#c9675a', res: .8, amp: 2}), {lift: 6}),
          N(paper({shape: [[130, -300], [240, -300], [260, 300], [160, 300]], color: '#c9675a', res: .8, amp: 2}), {lift: 6}));
  WORLD.add(win);
  const plant = G({x: 560, y: 420, z: 30});
  [[-.55, 200], [-.18, 270], [.22, 250], [.62, 190]].forEach(([r, l], i) => plant.add(N(paper({shape: S.band([[0, -100], [Math.sin(r) * l * .5, -100 - l * .6], [Math.sin(r) * l, -100 - l]], 46, 8), color: i % 2 ? COL.leaf : COL.leafD, res: 1.2, amp: 1.6}), {lift: 4 + i})));
  plant.add(N(paper({shape: [[-60, -110], [60, -110], [44, 0], [-44, 0]], color: COL.terra, res: 1.4, amp: 1.4}), {lift: 6}));
  WORLD.add(plant);

  // 4.2 щит с восемью дисками, лампочки, люстра и рычаг
  WORLD.add(N(paper({shape: S.rrect(PX4 - 480, -680, PX4 + 480, 60, 26), color: '#9a6e48', res: .8, amp: 2.4, deco: g => { g.strokeStyle = 'rgba(60,30,10,.25)'; g.lineWidth = 5; for (let y = -640; y < 40; y += 70){ g.beginPath(); g.moveTo(PX4 - 470, y); g.lineTo(PX4 + 470, y + 8); g.stroke(); } }}), {z: 60, lift: 6}));
  E4.discs = Array.from({length: 8}, (_, i) => {
    const d = G({x: PX4 + [-330, -110, 110, 330][i % 4], y: [-430, -180][Math.floor(i / 4)], z: 58});
    // тень считаем на лету только у самого диска: у мелких значков она почти не видна
    d.add(N(paper({shape: S.ell(0, 0, 92, 92, 44), color: i % 2 ? '#f1e6cf' : '#efdcb8', res: 2, amp: 1.4, deco: g => { g.strokeStyle = 'rgba(120,80,40,.3)'; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, 80, 0, TAU); g.stroke(); for (let k = 0; k < 12; k++){ const a = k / 12 * TAU; g.beginPath(); g.moveTo(Math.cos(a) * 84, Math.sin(a) * 84); g.lineTo(Math.cos(a) * 91, Math.sin(a) * 91); g.stroke(); } }}), {lift: 5, dyn: true}));
    d.add(N(paper({shape: S.ell(0, -50, 34, 34, 26), color: '#3b3a4c', res: 2, amp: .8}), {lift: 1}), icon(i), N(paper({shape: S.ell(0, 0, 10, 10, 14), color: '#c9a24a', res: 3, amp: .5}), {lift: 2}));
    d.a0 = (1 + (i * 5) % 11) * TAU / 12;
    WORLD.add(d); return d;
  });
  E4.bulbs = Array.from({length: 8}, (_, i) => {
    const b = G({x: PX4 - 350 + i * 100, y: -610, z: 58});
    b.halo = N(paper({shape: S.ell(0, 0, 46, 46, 24), color: '#ffe08a', alpha: .45, res: 1, amp: 0, edge: false, tex: 0}), {dz: 1, lift: .5, shadowA: 0, a: 0});
    b.on = N(paper({shape: S.ell(0, 0, 20, 20, 20), color: '#ffd65e', res: 3, amp: .8, deco: g => { g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(-6, -6, 6, 0, TAU); g.fill(); }}), {lift: 3, a: 0});
    b.add(b.halo, N(paper({shape: S.ell(0, 0, 20, 20, 20), color: '#6e6a62', res: 3, amp: .8}), {lift: 3}), b.on);
    WORLD.add(b); return b;
  });
  E4.lamp = G({x: PX4, y: -860, z: 56});
  E4.cone = N(paper({shape: [[-60, 60], [60, 60], [470, 820], [-470, 820]], color: '#ffe7a0', alpha: .3, res: .5, amp: 0, edge: false, tex: 0}), {lift: .5, shadowA: 0, a: 0});
  E4.lampOn = N(paper({shape: S.ell(0, 58, 24, 14, 18), color: '#fff0b8', res: 2, amp: .6}), {lift: 5, a: 0});
  E4.lamp.add(N(paper({shape: S.rect(-3, -700, 3, 0), color: '#3a3430', res: 1, amp: .4}), {lift: 3}), N(paper({shape: S.ell(0, 56, 24, 14, 18), color: '#8d8578', res: 2, amp: .6}), {lift: 5}), E4.lampOn,
    N(paper({shape: [[-36, 0], [36, 0], [74, 56], [-74, 56]], color: COL.ochre, res: 2, amp: 1.2}), {lift: 6}), E4.cone);
  WORLD.add(E4.lamp);
  WORLD.add(N(paper({shape: S.rrect(PX4 + 500, -260, PX4 + 562, -140, 8), color: '#5a5a62', res: 2, amp: 1}), {z: 57, lift: 5}));
  E4.lever = G({x: PX4 + 531, y: -200, z: 56, dyn: true, r: -.7});
  E4.lever.add(N(paper({shape: S.band([[0, 0], [0, -110]], 14, 12), color: '#3a3430', res: 2, amp: .6}), {lift: 6}), N(paper({shape: S.ell(0, -112, 17, 17, 16), color: COL.verm, res: 2, amp: .8}), {lift: 7}));
  WORLD.add(E4.lever);

  // 4.3 потолок, крошечная солнечная дверца, лестница-стремянка
  E4.door = G({x: X3, y: -556, z: 76});
  E4.door.add(N(paper({shape: S.ell(0, -42, 96, 84, 30), color: '#ffe08a', alpha: .5, res: 1, amp: 0, edge: false, tex: 0}), {lift: .5, shadowA: 0}),
    N(paper({shape: [[-30, 0], [-30, -56], ...S.arc(0, -56, 30, 28, Math.PI, TAU, 10), [30, -56], [30, 0]], color: '#f2b43c', res: 3, amp: 1}), {lift: 4}),
    N(paper({shape: [[-20, -6], [-20, -54], ...S.arc(0, -54, 20, 18, Math.PI, TAU, 8), [20, -54], [20, -6]], color: '#ffd977', res: 3, amp: .8}), {lift: 2}),
    N(paper({shape: S.ell(12, -30, 4, 4, 8), color: '#8a5a1a', res: 3, amp: .3}), {lift: 2}));
  WORLD.add(E4.door);
  E4.holes = [-156, 156].map(x => N(paper({shape: S.ell(0, 0, 5, 5, 10), color: '#5a4636', res: 3, amp: .4}), {x: X3 + x, y: -444, z: 77, lift: .5, vis: false}));
  WORLD.add(...E4.holes);
  E4.ladder = G({x: X3, y: 420, z: 4});
  [-1, 1].forEach(s => E4.ladder.add(N(paper({shape: S.band([[s * 92, 0], [s * 58, -420]], 16, 14), color: '#a87a52', res: 1.5, amp: 1}), {lift: 5})));
  [-100, -200, -300, -400].forEach((y, i) => E4.ladder.add(N(paper({shape: S.rect(-84 + i * 8, y - 9, 84 - i * 8, y + 9), color: '#c0905e', res: 1.5, amp: 1}), {lift: 5.5})));
  WORLD.add(E4.ladder);

  // 4.4 калька-чертёж будущего дома (появится в конце)
  E4.house = G({x: X3 - 150, y: 420, z: 60, a: 0});
  const HW = 600;
  E4.house.add(N(paper({shape: [[-HW, 0], [-HW, -520], [0, -880], [HW, -520], [HW, 0]], color: COL.kalka, alpha: .55, res: .5, amp: 3, deco: g => { g.strokeStyle = 'rgba(70,90,110,.4)'; g.lineWidth = 7; g.beginPath(); g.moveTo(-HW + 16, -520); g.lineTo(0, -862); g.lineTo(HW - 16, -520); g.closePath(); g.stroke(); g.lineWidth = 4; g.strokeRect(-HW + 16, -516, HW * 2 - 32, 500); }}), {lift: 3}),
    N(paper({shape: S.rect(300, -800, 400, -600), color: COL.kalka, alpha: .6, res: .8, amp: 2}), {dz: 1, lift: 3}),
    N(paper({shape: [[-80, 0], [-80, -220], ...S.arc(0, -220, 80, 70, Math.PI, TAU, 12), [80, -220], [80, 0]], color: '#c9d3d8', alpha: .55, res: .8, amp: 2}), {lift: 3}));
  E4.wins = [[-360, -350], [360, -350]].map(([x, y]) => { const w = G({x, y}); w.light = N(paper({shape: S.rect(-80, -70, 80, 70), color: '#ffcf6e', res: 1, amp: 1.6, deco: g => { g.fillStyle = 'rgba(255,255,220,.45)'; g.fillRect(-70, -60, 60, 50); }}), {lift: 2, a: 0}); w.add(N(paper({shape: S.rect(-80, -70, 80, 70), color: '#c2ccd2', alpha: .6, res: 1, amp: 1.6}), {lift: 2}), w.light, N(paper({shape: S.rect(-80, -6, 80, 6), color: COL.kalka, alpha: .8, res: 1, amp: 1}), {lift: 3}), N(paper({shape: S.rect(-6, -70, 6, 70), color: COL.kalka, alpha: .8, res: 1, amp: 1}), {lift: 3})); return w; });
  E4.house.add(...E4.wins);
  WORLD.add(E4.house);

  // хорошие мелочи дня: чашка, друг на фото, папка с галочкой, плед
  E4.cup = makeCup(1.3); E4.cup.root.z = 2;
  const friend = G({z: 2});
  friend.add(N(paper({shape: [[-22, 0], [22, 0], [8, -44], [-8, -44]], color: '#8a6a4a', res: 2, amp: .8}), {lift: 4}),
    N(paper({shape: S.rect(-62, -206, 62, -40), color: '#c9a24a', res: 2, amp: 1.2}), {lift: 6}), N(paper({shape: S.rect(-50, -194, 50, -52), color: '#a9cde3', res: 2, amp: .8}), {lift: 2}),
    N(paper({shape: S.rrect(-36, -86, 36, -52, 12), color: COL.teal, res: 3, amp: .8}), {lift: 2}),
    N(paper({shape: S.ell(0, -124, 30, 32, 28), color: '#f1c8a2', res: 3, amp: .8}), {lift: 3}),
    N(paper({shape: S.arc(0, -128, 34, 34, Math.PI * 1.05, Math.PI * 1.95, 14).concat([[24, -148], [0, -142], [-24, -150]]), color: '#6b4a2e', res: 3, amp: .8}), {lift: 3}),
    ...[-11, 11].map(x => N(paper({shape: S.ell(x, -124, 3.6, 3.8, 10), color: '#2a2320', res: 4, amp: .3}), {lift: 1})));
  E4.fSmile = N(paper({shape: S.arc(0, -114, 13, 11, 0, Math.PI, 12), color: '#7d3b2f', res: 4, amp: .3}), {lift: 1});
  E4.fFlat = N(paper({shape: S.band([[-9, -106], [0, -105], [9, -106]], 3.4, 3.4), color: '#7d3b2f', res: 4, amp: .3}), {lift: 1, vis: false});
  friend.add(E4.fSmile, E4.fFlat);
  const folder = G({z: 2});
  folder.add(N(paper({shape: [[-66, -112], [-20, -112], [-10, -100], [66, -100], [66, 0], [-66, 0]], color: '#e2a23b', res: 2, amp: 1.2}), {lift: 6}), N(paper({shape: S.band([[-26, -50], [-6, -28], [30, -78]], 12, 12), color: '#4f9a5e', res: 2, amp: .8}), {lift: 3}));
  const plaid = G({z: 2});
  plaid.add(N(paper({shape: S.rrect(-82, -72, 82, 0, 18), color: '#4f8a8b', res: 2, amp: 1.4, deco: g => { g.fillStyle = 'rgba(244,230,200,.5)'; for (let x = -70; x < 82; x += 36) g.fillRect(x, -72, 8, 72); for (let y = -60; y < 0; y += 24) g.fillRect(-82, y, 164, 6); g.fillStyle = 'rgba(232,184,62,.5)'; for (let x = -54; x < 82; x += 36) g.fillRect(x, -72, 3, 72); }}), {lift: 6}),
    N(paper({shape: S.rrect(-82, -44, 82, -30, 6), color: '#3f7475', res: 2, amp: 1}), {lift: 6.5}),
    ...Array.from({length: 13}, (_, k) => N(paper({shape: S.rect(-78 + k * 13, -2, -72 + k * 13, 12), color: '#efe3c8', res: 3, amp: .4}), {lift: 4})));
  E4.items = [[E4.cup.root, -320], [friend, -110], [folder, 110], [plaid, 320]].map(([n, dx]) => { n.x = X3 + dx; n.y = 420; n.dyn = true; WORLD.add(n); return n; });

  // герой, призрак-калька и их гантели
  GH = ghost(); GH.root.x = 270; GH.root.y = 420; GH.root.z = 14; face(GH, 'proud');
  E4.ghBell = makeDumbbell(1.45, '#c3cbcf'); E4.ghBell.z = 13;
  WORLD.add(GH.root, E4.ghBell);
  HA = makePerson(); HA.root.x = 0; HA.root.y = 420;
  E4.notch = [[66, -168, 1], [-71, -100, -1], [76, -40, 1]].map(([x, y, s]) => N(paper({shape: [[0, -11], [-s * 24, 2], [0, 13]], color: '#faf6ee', res: 4, amp: .6}), {x, y, lift: 1.2, vis: false}));
  HA.hip.add(...E4.notch);
  HA.cross = G({vis: false}); HA.cross.parent = HA.hip; HA.hip.kids.unshift(HA.cross);
  HA.cross.add(N(paper({shape: S.rrect(-108, -16, 108, 46, 24), color: HA.C.pants, res: 4, amp: 1.2, deco: g => { g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-10, 4); g.quadraticCurveTo(0, 30, 12, 44); g.stroke(); }}), {lift: 4}),
    ...[-1, 1].map(s => N(paper({shape: S.ell(s * 34, 38, 22, 10, 16), color: HA.C.shoe, res: 4, amp: 1}), {lift: 5})));
  E4.bell = makeDumbbell(1, '#4a4a52'); E4.bell.z = -3;
  E4.b1 = makeBrick(); E4.b2 = makeBrick(); E4.b3 = makeBrick();
  [E4.b1, E4.b2, E4.b3].forEach(b => { b.root.z = -2; b.root.vis = false; });
  WORLD.add(E4.b2.root, E4.b3.root, HA.root, E4.bell, E4.b1.root);
  // красная планка серии и её фазы гармошки
  E4.plank = makePlank(380, 50); E4.plankG = G({dyn: true}); E4.plankG.add(E4.plank.root);
  E4.fold = [[250, 6, 56], [160, 8, 60]].map(([w, n, h], i) => N(paper({shape: zig(w, n, h), color: i ? '#c8452f' : '#cf3b27', res: 3, amp: 1.2, deco: g => { g.strokeStyle = 'rgba(90,10,0,.35)'; g.lineWidth = 3; for (let k = 1; k < n; k++){ const x = -w / 2 + k * w / n; g.beginPath(); g.moveTo(x, -h); g.lineTo(x, h); g.stroke(); } }}), {lift: 6, vis: false}));
  E4.plankG.add(...E4.fold);
  WORLD.add(E4.plankG);
  E4.flyPins = [0, 1].map(() => N(paper({shape: S.ell(0, 0, 12, 12, 14), color: '#c9a24a', res: 3, amp: .6}), {lift: 8, vis: false, dyn: true, z: -6}));
  WORLD.add(...E4.flyPins);
  E4.hammer = G({dyn: true, z: -3});
  E4.hammer.add(N(paper({shape: S.rect(-6, -116, 6, 12), color: '#a87a52', res: 3, amp: .6}), {lift: 5}), N(paper({shape: [[-36, -146], [26, -146], [34, -138], [34, -116], [-36, -116]], color: '#5a5a62', res: 3, amp: .8}), {lift: 6}));
  WORLD.add(E4.hammer);
  // оригами-птица: тело, клюв, хвост и две фазы крыла
  E4.bird = G({dyn: true, z: -8, vis: false});
  E4.wUp = N(paper({shape: [[12, -4], [-18, -6], [6, -64]], color: '#e5a92e', res: 3, amp: .6}), {lift: 7});
  E4.wDn = N(paper({shape: [[12, -4], [-18, -6], [-2, 32]], color: '#e5a92e', res: 3, amp: .6}), {lift: 7, vis: false});
  E4.bird.add(N(paper({shape: [[46, 0], [70, -20], [62, 8]], color: '#e9b83a', res: 3, amp: .6}), {lift: 6}), N(paper({shape: [[46, 2], [-30, -6], [-52, -26], [-40, 4], [-10, 16]], color: '#f2c43c', res: 3, amp: .6}), {lift: 6}),
    N(paper({shape: [[-52, -26], [-74, -20], [-54, -15]], color: COL.orange, res: 3, amp: .4}), {lift: 6.5}), N(paper({shape: S.ell(-40, -14, 3, 3, 8), color: '#2a2320', res: 4, amp: .2}), {lift: 6.5}), E4.wUp, E4.wDn);
  WORLD.add(E4.bird);
}

/* ================= камера ================= */
const cam = path([
  [0, {x: 50, y: 70, ls: Math.log(.98), roll: -.006}],
  [2.5, {x: 80, y: 50, ls: Math.log(1.16), roll: .002}],
  [4.4, {x: 60, y: 70, ls: Math.log(1.34), roll: .006}],
  [5.6, {x: 20, y: 170, ls: Math.log(1.6), roll: -.004}],
  [6.5, {x: 200, y: 90, ls: Math.log(1.28), roll: -.008}],
  [8.75, {x: 1500, y: -130, ls: Math.log(.97), roll: .004}],
  [11.0, {x: 1560, y: -150, ls: Math.log(1.01), roll: .002}],
  [13.75, {x: 1650, y: -330, ls: Math.log(1.2), roll: -.004}],
  [15.4, {x: 1700, y: -240, ls: Math.log(1.1), roll: .006}],
  [16.4, {x: 1560, y: -120, ls: Math.log(.98), roll: -.004}],
  [18.1, {x: 1590, y: -120, ls: Math.log(1.0), roll: .004}],
  [18.75, {x: X3 + 70, y: -320, ls: Math.log(1.18), roll: -.01}],
  [20.6, {x: X3 + 50, y: -340, ls: Math.log(1.28), roll: .004}],
  [21.9, {x: X3 + 80, y: 20, ls: Math.log(1.02), roll: -.002}],
  [23.0, {x: X3 + 60, y: 220, ls: Math.log(1.3), roll: .004}],
  [24.6, {x: X3 + 40, y: 210, ls: Math.log(1.36), roll: -.002}],
  [25.7, {x: X3 + 40, y: 110, ls: Math.log(1.1), roll: -.002}],
  [27.0, {x: X3 + 20, y: -200, ls: Math.log(.8), roll: .002}],
  [28.75, {x: X3 + 20, y: -240, ls: Math.log(1.12), roll: -.004}],
  [29.6, {x: X3, y: 60, ls: Math.log(1.12), roll: .002}],
  [30.4, {x: X3 - 60, y: 120, ls: Math.log(1.3), roll: .004}],
  [31.7, {x: X3 - 480, y: 170, ls: Math.log(1.3), roll: -.004}],
  [32.5, {x: X3 - 300, y: -330, ls: Math.log(.86), roll: .006}, {stop: true}],
  [33.6, {x: X3 - 630, y: 230, ls: Math.log(1.5), roll: -.002}],
  [35.2, {x: X3 - 620, y: 210, ls: Math.log(1.52), roll: .004}],
  [36.6, {x: X3 - 560, y: 220, ls: Math.log(1.36), roll: -.002}],
  [38.4, {x: X3 - 200, y: -120, ls: Math.log(.88), roll: .002}],
  [40, {x: X3 - 120, y: -215, ls: Math.log(.78), roll: .002}],
]);
const shake = t => { let sx = 0, sy = 0; [[15.93, 10], [19.4, 5], [20.0, 5], [20.6, 7], [29.4, 6], [31.65, 5]].forEach(([t0, a]) => { const u = t - t0; if (u < 0 || u > .5) return; const k = Math.exp(-u * 9); sx += Math.sin(u * 47) * a * k; sy += Math.cos(u * 39) * a * k; }); return [sx, sy]; };

/* ================= действие ================= */
const LOCK = [9.4, 10.0, 10.6, 11.25, 11.9, 12.5, 13.1], ORDER = [0, 5, 2, 7, 4, 1, 6], STUB = 3;   // упрямый диск — гантель
const GLIFT = [1.25, 2.19, 3.125, 4.06], NOTCH = [2.44, 3.375, 4.31];
const JUMP = [22.5, 23.75, 25.0], JH = [110, 150, 185];
const PINS = [[X3 + 156, -444], [X3 - 156, -444], [X3 + 156, -444]], BLOW = [19.4, 20.0, 20.6];

function update(t){
  const tp = stepT(t), sp = Math.floor(t * 12 + 1e-6);
  const rep = (t0, hold) => tp < t0 ? 0 : tp < t0 + .25 + hold ? steps(tp, t0, 3) : 1 - steps(tp, t0 + .25 + hold, 3);
  const press = (p, k) => armPose(p, .08, -.1, lerp(-1.3, -2.85, k), lerp(-1.75, -.2, k));
  const ph = Math.floor(tp / .3125);
  // всё, что меняется, ставим каждый кадр
  HA.root.r = 0; HA.hip.r = 0; HA.head.r = 0; HA.head.y = -282; HA.root.y = 420; sitPose(HA, false); HA.cross.vis = false; walkPose(HA, false, 0); armPose(HA, 0, 0, 0, 0);
  E4.hammer.vis = false; E4.bird.vis = false; E4.flyPins.forEach(n => n.vis = false);
  E4.plank.root.vis = true; E4.fold.forEach(n => n.vis = false); E4.plankG.r = 0;
  E4.plank.pins.forEach(p => p.vis = true);

  /* --- 4.1 два раза в неделю --- */
  if (tp < WHIP){
    const walk = at(tp, 6.25, 2.5);
    HA.root.x = lerp(0, HX2, E.sine(walk));
    if (tp < 6.25){
      const k = Math.max(rep(1.25, .4), rep(3.0, .55));
      if (tp < 4.6) press(HA, k);
      else { const d = steps(tp, 4.6, 2, .125); armPose(HA, .08, -.1, lerp(-1.3, .06, d), lerp(-1.75, -.1, d)); }
      face(HA, tp < 3.5 ? 'calm' : tp < 4.31 ? 'smile' : 'sad');
      if (tp >= 4.6){ HA.head.r = .16; HA.head.y = -276; }
    } else {
      walkPose(HA, tp < 8.75, ph); face(HA, tp < 9.9 ? 'calm' : 'calm');
    }
    // гантель в руке, потом на полу
    if (tp < 6.0){ const [gx, gy] = worldOf(HA.armF.grip, sp); E4.bell.x = gx + 4; E4.bell.y = gy; E4.bell.r = 0; }
    else { E4.bell.x = 90; E4.bell.y = 404; E4.bell.r = 0; }
    E4.notch.forEach((n, i) => n.vis = tp >= NOTCH[i]);
    // призрак-калька делает вдвое больше
    const ga = tp < 6.25 ? steps(tp, .5, 3, .125) : 1 - steps(tp, 6.25, 3, .125);
    GH.root.a = .5 * ga; E4.ghBell.a = .5 * ga; GH.root.vis = E4.ghBell.vis = ga > 0;
    press(GH, Math.max(...GLIFT.map(t0 => rep(t0, .15))));
    const [qx, qy] = worldOf(GH.armF.grip, sp); E4.ghBell.x = qx + 6; E4.ghBell.y = qy;
    // планка над головой опускается после каждого подъёма призрака
    const low = GLIFT.reduce((s, t0) => s + steps(tp, t0 + .25, 2, .0833), 0);
    E4.plankG.x = HA.root.x; E4.plankG.y = -150 + low * 22; E4.plankG.z = -4;
  } else { GH.root.vis = E4.ghBell.vis = false; E4.bell.x = 90; E4.bell.y = 404; E4.notch.forEach(n => n.vis = true); }

  /* --- 4.2 восемь дисков идеального дня --- */
  const spinA = (d, t0) => d.a0 + Math.floor(Math.max(0, tp - t0) * 8) * TAU / 12;
  const norm = a => { const m = ((a % TAU) + TAU) % TAU; return m < .01 ? TAU : m; };
  E4.discs.forEach((d, i) => {
    const li = ORDER.indexOf(i), T = li >= 0 ? LOCK[li] : 99;
    let a = d.a0;
    if (tp >= 8.75) a = spinA(d, 8.75);
    if (i === STUB && tp >= 13.75){
      // три попытки: не хватает одного зубца, на третьей дрожит у самой цели
      const tries = [13.75, 14.4, 15.0], last = tries.filter(x => tp >= x).length - 1, u = tp - tries[last];
      a = last === 2 ? TAU - .17 + (sp % 2 ? .025 : -.025) : TAU - (u < .3 ? .32 : .58);
    }
    if (tp >= T){ const cT = norm(d.a0 + Math.floor((T - 8.75) * 8) * TAU / 12); a = lerp(cT, TAU, steps(tp, T, 3)); }
    if (tp >= 16.0){ const stop = 16.5 + i * .06; a = TAU + Math.floor((Math.min(tp, stop) - 16.0) * 8 + 1) * TAU / 12 * (i % 2 ? 1 : -1) + (i === STUB ? -.17 : 0); }
    d.r = a;
  });
  E4.bulbs.forEach((b, j) => { const on = j < 7 && tp >= LOCK[j] + .2 && tp < 16.0; b.on.a = on ? 1 : 0; b.halo.a = on ? 1 : 0; });
  const flick = tp >= 13.3 && tp < 15.93 ? (sp % 3 === 0 ? .55 : sp % 5 === 0 ? .3 : .06) : 0;
  E4.cone.a = flick; E4.lampOn.a = flick * 1.4;
  // рычаг и падение планки
  let lev = -.7;
  if (tp >= 15.93) lev = lerp(-.7, .9, steps(tp, 15.93, 2));
  E4.lever.r = lev;
  if (tp >= 8.75 && tp < WHIP){
    HA.root.x = HX2; walkPose(HA, false, 0);
    const mood = tp < 10.0 ? 'calm' : tp < 11.25 ? 'wow' : tp < 13.1 ? 'smile' : tp < 13.75 ? 'grin' : tp < 15.0 ? 'wow' : tp < 16.0 ? 'annoyed' : 'sad';
    face(HA, mood);
    if (tp >= 13.75 && tp < 15.6){ HA.root.r = .045; armPose(HA, -.32, -1.0, .32, 1.0); }
    if (tp >= 16.0){ HA.head.r = .14; HA.head.y = -277; HA.hip.r = .04; }
    if (tp < 15.6){ E4.plankG.x = HX2; E4.plankG.y = -150; E4.plankG.z = -4; }
    else {
      const tip = r => [PX4 + 531 + 110 * Math.sin(r), -200 - 110 * Math.cos(r)];
      const k = steps(tp, 15.6, 4, .0833), [tx0, ty0] = tip(-.7), [tx, ty] = tip(lev);
      if (tp < 15.93){ E4.plankG.x = lerp(HX2, tx0 - 30, k); E4.plankG.y = lerp(-150, ty0 - 34, k) - Math.sin(k * Math.PI) * 140; E4.plankG.z = lerp(-4, 54, k); E4.plankG.r = lerp(0, .5, k); }
      else { E4.plankG.x = tx - 30; E4.plankG.y = ty - 34; E4.plankG.z = 54; E4.plankG.r = .5 + (lev + .7) * .25; }
    }
  }

  /* --- 4.3 порог под потолком --- */
  const ITEMX = [-320, -110, 110, 320];
  E4.items.forEach((n, i) => { n.x = X3 + ITEMX[i]; n.y = 420; n.r = 0; });
  E4.fSmile.vis = !(tp >= 25.6 && tp < 37.8); E4.fFlat.vis = !E4.fSmile.vis;
  steamTick(E4.cup.steam, sp, !(tp >= 25.6 && tp < 37.5));
  if (tp >= WHIP && tp < 27.5){
    // на лестнице: левая рука держит планку, правая бьёт молотком
    E4.plankG.x = X3; E4.plankG.y = -440; E4.plankG.z = 76; E4.plankG.r = 0;
    E4.plank.pins[0].vis = tp >= 20.0; E4.plank.pins[1].vis = tp >= 19.4;
    const down = steps(tp, 21.25, 2, .3125);
    HA.root.x = X3 + (tp >= 21.9 ? lerp(0, 480, E.sine(at(tp, 21.9, .9))) : 0); HA.root.y = lerp(20, 420, down);
    walkPose(HA, tp >= 21.9 && tp < 22.8, ph);
    face(HA, tp < 21.25 ? 'flat' : tp < 25.6 ? 'calm' : 'sad');
    if (tp >= 25.6){ HA.head.r = -.08; HA.head.y = -286; }
    E4.hammer.vis = true;
    if (tp < 20.85){
      if (tp < 19.55) ik(HA, HA.armB, X3 - 96, -440, sp, -1);
      const bi = BLOW.findIndex((b, i) => tp < (BLOW[i + 1] || 99) - .25);
      const b = BLOW[Math.max(0, bi)], [px, py] = PINS[Math.max(0, bi)], hit = tp >= b && tp < b + .17 ? 1 : 0;
      const off = px < X3 ? [90, 110] : [40, 115];
      const hx = px + lerp(off[0] + 30, off[0], hit), hy = py + lerp(off[1] - 90, off[1], hit);
      ik(HA, HA.armF, hx, hy, sp, 1);
      const [gx, gy] = worldOf(HA.armF.grip, sp), [tx, ty] = hit ? [px, py] : [px + 50, py - 150];
      E4.hammer.x = gx; E4.hammer.y = gy; E4.hammer.r = Math.atan2(tx - gx, -(ty - gy));
    } else { const [gx, gy] = worldOf(HA.armF.grip, sp); E4.hammer.x = gx; E4.hammer.y = gy + 4; E4.hammer.r = Math.PI; }
    // мелочи дня подпрыгивают трижды и оседают
    E4.items.forEach((n, i) => {
      let h = 0; JUMP.forEach((j0, r) => { const t0 = j0 + i * .08; if (tp >= t0 && tp < t0 + .55){ const u = tp - t0; h = u < .25 ? E.out(steps(tp, t0, 3)) * JH[r] : (1 - steps(tp, t0 + .25, 3)) * JH[r]; } });
      n.y = 420 - h; n.r = h > 0 ? (i % 2 ? .06 : -.06) : (tp >= 25.6 ? (i % 2 ? -.05 : .05) : 0);
    });
  }

  /* --- 4.4 первый кирпич --- */
  E4.house.a = steps(tp, 27.6, 4, .125);
  E4.wins[0].light.a = tp >= 38.1 ? steps(tp, 38.1, 4) : 0; E4.wins[1].light.a = tp >= 38.6 ? steps(tp, 38.6, 4) * .8 : 0;
  E4.holes.forEach(h => h.vis = tp >= 29.0);
  if (tp >= 27.5){
    // молоток падает на пол
    E4.hammer.vis = true; const hk = E.drop(at(tp, 27.5, .3));
    E4.hammer.x = X3 + 560; E4.hammer.y = lerp(240, 412, hk); E4.hammer.r = lerp(Math.PI, Math.PI * 1.5, steps(tp, 27.5, 3));
    // к лестнице и наверх
    const toL = E.sine(at(tp, 27.5, .6)), climb = steps(tp, 28.25, 2, .25), hop = E.drop(at(tp, 29.2, .25));
    HA.root.x = lerp(X3 + 480, X3, toL); HA.root.y = tp < 29.2 ? lerp(420, 20, climb) : lerp(20, 420, hop);
    walkPose(HA, tp < 28.1, ph);
    face(HA, tp < 29.4 ? 'annoyed' : tp < 30.1 ? 'calm' : 'calm');
    // планка в руках: рывок, булавки вылетают, прыжок вниз, гармошка, кирпич
    let w = 190, cx = X3, cy = -440;
    if (tp >= 28.6 && tp < 29.0){ cy = -440 + (tp >= 28.8 ? 12 : 0); }
    if (tp >= 29.0){ cy = HA.root.y - 460 + lerp(0, 240, steps(tp, 29.45, 2, .125)); }
    if (tp >= 29.7) w = 133; if (tp >= 29.9) w = 88; if (tp >= 30.1) w = 64;
    const walk2 = E.sine(at(tp, 30.4, .9)); if (tp >= 30.4){ HA.root.x = lerp(X3, X3 - 560, walk2); walkPose(HA, tp < 31.3, ph); }
    cx = HA.root.x;
    const stage = tp < 29.7 ? 0 : tp < 29.9 ? 1 : tp < 30.1 ? 2 : 3;
    E4.plank.root.vis = stage === 0; E4.fold[0].vis = stage === 1; E4.fold[1].vis = stage === 2;
    if (tp >= 29.0) E4.plank.pins.forEach(p => p.vis = false);
    if (tp < 29.0){ E4.plankG.z = 76; E4.plankG.x = X3; E4.plankG.y = -440; } else { E4.plankG.z = -4; E4.plankG.x = cx; E4.plankG.y = cy; }
    if (tp >= 28.6 && tp < 31.45){ ik(HA, HA.armB, cx - w - 4, cy, sp, -1); ik(HA, HA.armF, cx + w + 4, cy, sp, 1); }
    E4.flyPins.forEach((n, i) => { const u = at(tp, 29.0, .7); n.vis = tp >= 29.0 && u < 1; n.x = X3 + (i ? 156 : -156) + (i ? 1 : -1) * u * 260; n.y = -444 - Math.sin(u * Math.PI) * 120 + u * u * 700; });
    // кирпич: родился из гармошки, отпущен, упал в основание
    const B = E4.b1.root; B.vis = stage === 3; E4.plankG.vis = stage < 3;
    if (stage === 3){
      if (tp < 31.45){ B.x = cx; B.y = cy + 29; }
      else { const dk = E.drop(at(tp, 31.45, .2)); B.x = X3 - 684; B.y = lerp(cy + 29, 420, dk); }
    }
    // смотрит на огромную крышу, садится рядом, гладит
    if (tp >= 31.7 && tp < 33.0){ face(HA, 'annoyed'); HA.head.y = -288; HA.head.r = -.05; }
    if (tp >= 32.9){
      HA.root.x = lerp(X3 - 560, X3 - 664, steps(tp, 32.9, 1)); walkPose(HA, tp < 33.2, ph);
      if (tp >= 33.25){ HA.hip.y = -70; walkPose(HA, false, 0); HA.hip.y = -70; }
      if (tp >= 33.35){ HA.legs.forEach(l => l.vis = false); HA.cross.vis = true; HA.hip.y = -24; }
      face(HA, tp < 35.2 ? 'calm' : tp < 36.0 ? 'wow' : tp < 36.9 ? 'smile' : 'grin');
      HA.head.r = tp < 35.2 ? .1 : tp < 36.0 ? -.12 : .04;
      if (tp >= 33.6 && tp < 34.7){ const pat = [33.75, 34.05, 34.35].some(x => tp >= x && tp < x + .15) ? 1 : 0; ik(HA, HA.armB, X3 - 700, 346 - (1 - pat) * 28, sp, -1); }
    }
    // кирпич теплеет, прилетает птица, ложатся второй и третий
    const warm = steps(tp, 34.7, 4, .125);
    [E4.b1, E4.b2, E4.b3].forEach((b, i) => { const w2 = i === 0 ? warm : steps(tp, [0, 36.5, 37.15][i], 3, .125); b.warm.a = w2; b.glow.a = w2 * (.85 + (sp % 4 === 0 ? .1 : 0)); });
    [[E4.b2, 36.25, -570], [E4.b3, 36.9, -456]].forEach(([b, t0, dx]) => { b.root.vis = tp >= t0; b.root.x = X3 + dx; b.root.y = lerp(80, 420, E.drop(at(tp, t0, .25))); });
    if (tp >= 35.0){
      E4.bird.vis = true; const u = E.out(at(tp, 35.0, 1.0)), fl = tp < 36.0;
      E4.bird.x = lerp(X3 + 300, X3 - 676, u); E4.bird.y = lerp(-640, 354, u) - Math.sin(u * Math.PI) * 160 + (fl ? 0 : 0);
      E4.bird.r = fl ? lerp(-.25, .1, u) : 0;
      const up = fl && Math.floor(sp / 2) % 2 === 0; E4.wUp.vis = up; E4.wDn.vis = !up;
      if (!fl){ E4.wUp.vis = false; E4.wDn.vis = true; E4.bird.y = 352 - (tp >= 36.9 && tp < 37.2 ? 14 : 0); }
    }
  }
}

/* ================= звук ================= */
function cues(){
  CUES.length = 0;
  [1.5, 3.25].forEach(t => cue(t, 'clank', {pan: .05, v: .5}));
  GLIFT.forEach(t => cue(t + .25, 'clank', {pan: .35, v: .3}));
  NOTCH.forEach((t, i) => cue(t, 'snip', {pan: .1 - i * .1}));
  cue(4.4, 'sigh'); cue(6.0, 'thud', {pan: .1, v: .4});
  for (let k = 0; k < 8; k++) cue(6.3 + k * .3125, 'step', {pan: -.2 + k * .06, v: .45});
  cue(8.75, 'tick', {dur: 4.4, pan: .1});
  LOCK.forEach((t, j) => cue(t, 'lock', {pan: -.35 + ORDER[j] % 4 * .22, note: [69, 71, 73, 74, 76, 78, 81][j]}));
  [13.75, 14.4, 15.0].forEach(t => cue(t, 'strain', {pan: .05}));
  cue(13.3, 'buzz', {dur: 2.6}); cue(15.6, 'whoosh', {v: .5, dir: 'up'}); cue(15.93, 'slam'); cue(16.0, 'click', {pan: .3}); cue(16.0, 'tick', {dur: .7, pan: 0}); cue(16.5, 'sigh');
  cue(18.1, 'whip');
  BLOW.forEach(t => cue(t, 'hammer', {pan: .15}));
  cue(21.25, 'creak', {pan: 0, v: .4}); cue(21.56, 'creak', {pan: 0, v: .35});
  for (let k = 0; k < 3; k++) cue(21.95 + k * .3125, 'step', {pan: .2, v: .42});
  JUMP.forEach((t, r) => { for (let i = 0; i < 4; i++){ cue(t + i * .08, 'hop', {pan: -.4 + i * .27, v: .35 + r * .08}); cue(t + i * .08 + .5, 'drop', {pan: -.4 + i * .27, v: .3}); } });
  cue(26.25, 'breath', {dur: 1.4});
  cue(27.6, 'drop', {pan: .4, v: .5}); cue(27.6, 'tissue', {pan: -.2}); cue(27.55, 'step', {pan: .2, v: .4}); cue(27.85, 'step', {pan: .1, v: .4});
  cue(28.25, 'creak', {v: .4}); cue(28.5, 'creak', {v: .35}); cue(28.8, 'creak', {v: .55});
  cue(29.0, 'pop', {pan: -.3}); cue(29.05, 'pop', {pan: .3}); cue(29.0, 'tear', {v: .5}); cue(29.42, 'thud', {v: .55});
  cue(29.7, 'fold', {pan: 0}); cue(30.1, 'clay', {v: .35});
  for (let k = 0; k < 3; k++) cue(30.45 + k * .3125, 'step', {pan: -.1 - k * .1, v: .42});
  cue(31.65, 'clay', {v: .6, pan: -.3}); cue(32.95, 'step', {pan: -.3, v: .35}); cue(33.3, 'flop', {pan: -.3});
  [33.75, 34.05, 34.35].forEach(t => cue(t, 'pat', {pan: -.3}));
  cue(34.7, 'glow'); cue(35.0, 'bird', {pan: .5}); cue(35.55, 'bird', {pan: .1}); cue(36.0, 'flop', {pan: -.3, v: .3});
  cue(36.45, 'clay', {v: .5, pan: -.25}); cue(37.1, 'clay', {v: .5, pan: -.15}); cue(36.9, 'bird', {pan: -.3, v: .3});
}

/* ================= кадр ================= */
function camAt(t){ return cam(t); }
function renderAt(g, t, to = t){
  update(to);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.fillStyle = '#1d1712'; g.fillRect(0, 0, W, H);
  const c = toCam(cam(t)); const [sx, sy] = shake(t); c.x += sx; c.y += sy;
  drawWorld(g, WORLD, c, to);
  grade(g, t > 16 && t < 18.4 ? .8 : t > 34.7 ? 1.1 : 1);
}
function subFor(t){ return subForPath(cam, t); }
