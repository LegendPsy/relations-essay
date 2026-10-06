# Крупные сцены первой части: нити отношения, арка «Пара», качели-балансир, щит «Настоящая пара».
# Выполняется внутри make_template.py (там определены s и R).

R("const LMUL = {21: 1.2,", "const LMUL = {103: 1.8, 21: 1.2,")
R("const PF = {4: .8, 7: .7,", "const PF = {103: .9, 104: .4, 105: .42, 106: .5, 4: .8, 7: .7,")

R("function ik(ax, ay, bx, by, l1, l2, bend){", """LOOK.colleague = {kind:'boy', shirt:'#6b7480', trim:'#c9ccd0', pants:'#2f3340', skin:'#ecc9a6', hair:'#3a2a20', cap:'#3a2a20', legs:'#2f3340', boots:'#1f1f24', line:'#2a1f19'};
LOOK.stranger = {kind:'boy', shirt:'#8a5a2e', trim:'#d9c49a', pants:'#4a3a2e', skin:'#e6c09c', hair:'#2a2420', cap:'#4a4a52', legs:'#4a3a2e', boots:'#2a1f19', line:'#2a1f19'};
LOOK.ilya = {kind:'boy', shirt:'#4f6b3a', trim:'#efe2c2', pants:'#3a3550', skin:'#ecc9a6', hair:'#5a3a22', cap:'#b13f2c', legs:'#3a3550', boots:'#2a1f19', line:'#2a1f19'};
LOOK.kid = {kind:'girl', bob:true, dress:'#e0a33a', trim:'#efe2c2', trim2:'#c0452f', skin:'#f0d1b0', hair:'#6a4428', scarf:'#e0a33a', legs:'#3a2b22', boots:'#b13f2c', line:'#2a1f19'};
function ik(ax, ay, bx, by, l1, l2, bend){""")

# ---------- предметы на дороге ----------
R("  // ---- попутчик и девушка ----", """  // мимоходом: семейка ёжиков у тропинки и банка на пеньке
  x = sx(A.hedgeW); if (inView(x)){ for (let k = 0; k < 3; k++) hedgehog(x + k * 28 + Math.sin(tq * .0006 + k) * 6, Y - 16 + k * 3, k ? .85 : 1.1, tq * .012 + k); }
  x = sx(A.jarW); if (inView(x)){ stump(x, Y - 6); jarShape(x, Y - 25, .95); }
  // 104 · арка «Пара» над той же дорогой и боковая тропинка
  { const fx0 = sx(A.forkW); if (fx0 > -320 && fx0 < LWv + 120) sidePath(fx0, Y); }
  x = sx(A.arch); if (x > -300 && x < LWv + 420) archShape(x, Y - 2, i === 104 ? f : (RK(i) > RK(104) ? 1 : 0), tq);
  // 106 · щит «Настоящая пара» (когда она за щитом, щит рисуется поверх неё)
  x = sx(A.board); if (x > -220 && x < LWv + 220 && !(i === 106 && f >= .3 && f < .74)) photoBoard(x, Y - 2);
  // ---- попутчик и девушка ----""")

# ---------- люди и качели (до девушки) ----------
R("  // птицы клином (38)", """  // 103 · друг, коллега, прохожий: над каждым табличка; с другом она обнимается, остальных просто проходит
  { const fx = sx(A.rib) + 27, cx2 = sx(A.colW) + 30;
    if (cx2 > -120 && cx2 < LWv + 160){ drawPerson(cx2, Y - 14, -1, makePose('stand', {w: 0, t: tq}), LOOK.colleague, {}, {t: tq, scale: .92, blink: (tq % 3900) < 150}); nameTag(cx2 - 4, Y - 14 - 152 * .92, 'коллега', '#d9a33a'); }
    if (fx > -120 && fx < LWv + 160){
      const hug = i === 103 && f >= .28 && f < .52, Jf = makePose('stand', {w: 0, t: tq, wave: i === 103 && f > .08 && f < .26});
      if (hug){ Jf.hf = {x: 20, y: -78}; Jf.hb = {x: 18, y: -80}; Jf.tilt = .12; }
      drawPerson(fx, Y + 2, -1, Jf, LOOK.friend, {}, {t: tq, blink: (tq % 4400) < 150});
      nameTag(fx - 4, Y + 2 - 152, 'друг', '#c0452f');
      if (hug){ const hu = win(f, .3, .5); C.save(); C.globalAlpha = Math.sin(Math.PI * hu); const hx = fx - 14, hy = Y - 178 - hu * 26, p = NP(); p.moveTo(hx, hy + 9); p.bezierCurveTo(hx - 15, hy - 3, hx - 8, hy - 15, hx, hy - 7); p.bezierCurveTo(hx + 8, hy - 15, hx + 15, hy - 3, hx, hy + 9); cut(p, '#d94a3a', .6); C.restore(); } }
    if (i === 103){ const sp2 = lerp(sx(A.strW) + 480, sx(A.strW) - 120, win(f, .6, 1));
      drawPerson(sp2, Y - 26, -1, makePose('walk', {w: 1, ph: f * 64, t: tq}), LOOK.stranger, {}, {t: tq, w: 1, scale: .84});
      C.save(); C.globalAlpha = 1 - win(f, .8, .92); nameTag(sp2 - 4, Y - 26 - 152 * .84, 'прохожий', '#6e6a5e'); C.restore(); } }
  // 104 · Илья: догоняет её, идут вместе, держась за руки; на развилке машут друг другу, и он уходит своей тропинкой на холм
  if (i === 104){ const catchUp2 = f === 0 && GAP[NI] > 0 ? clamp01(travel / GAP[NI]) : 0, sp = clamp01((f - .76) / .24) * .78;
    let px = gxp - 48 - 260 * catchUp2, py = Y - 5, scl = .97, walking = Math.max(w, catchUp2 > 0 ? 1 : 0), ph = (drawWorld.gph || 0) * (catchUp2 > 0 ? 1.4 : 1) + Math.PI * .9;
    if (f >= .76){ const q = sidePt(sx(A.forkW), Y, sp); px = q.x; py = q.y - 4; scl = .97 * (1 - .5 * sp); walking = 1; ph = sp * 260 * TAU / (56 * KG) + Math.PI * .9; }
    const J2 = makePose('walk', {w: walking, ph, t: tq});
    if (f > .44 && f < .72) J2.hf = {x: 25, y: -54};
    if (f > .72 && f < .8) J2.hf = {x: 15 + 2 * Math.sin(tq * .02), y: -127};
    if (f > .84 && f < .92){ J2.hb = {x: -12, y: -122}; }
    drawPerson(px, py, f >= .76 ? 1 : 1, J2, LOOK.ilya, {}, {t: tq, w: 1, scale: scl, blink: (tq % 4100) < 150}); }
  // 105 · качели-балансир: малыш уже сидит
  x = sx(A.see); if (x > -280 && x < LWv + 280){
    const on = i === 105 && f >= .3 && f < .89, d = lerp(108, 54, ease(win(f, .44, .68)));
    let th = on ? Math.max(-.2, Math.min(.2, (2 * d - 108) / 108 * .2)) + (f > .68 ? .035 * Math.sin(tq * .006) * (1 - win(f, .8, .86)) : 0) : -.2;
    // малыш подпрыгивает и с размаху плюхается вниз — её конец взлетает
    const jump = i === 105 ? bump(f, .83, .89) : 0;
    if (i === 105 && f >= .88) th = lerp(0, -.2, easeOut(win(f, .88, .905)));
    seesaw(x, Y, th);
    const kx = x + 108 * Math.cos(th), ky = Y - 36 - 108 * Math.sin(th);
    const Jk = makePose('sit', {}); if (jump > 0){ Jk.hf = {x: 6, y: -118}; Jk.hb = {x: -6, y: -116}; }
    drawPerson(kx + 1.5, ky + 22 - 34 * jump, -1, Jk, LOOK.kid, {}, {t: tq, scale: .62, blink: (tq % 3700) < 150, noShadow: true});
    drawWorld.see = {x, th, d, on}; }
  // птицы клином (38)""")

# ---------- девушка ----------
R("    const gx = gxp; let gy = Y", "    let gx = gxp; let gy = Y")
R("    if (i === 100 && f > .32 && f < .7) o.tilt = .1;", """    if (i === 100 && f > .32 && f < .7) o.tilt = .1;
    if (i === 105 && f >= .3 && f < .89) m = 'sit';
    if (i === 106 && f >= .3 && f < .74){ const k = win(f, .36, .7) * 3, hop = Math.abs(Math.sin(Math.PI * k)); gy -= 34 * hop * (k > 0 && k < 3 ? 1 : 0); }""")
R("    const J = makePose(m, o);\n", """    const J = makePose(m, o);
    if (i === 104 && f > .44 && f < .72) J.hb = {x: -20, y: -52};
    if (i === 104 && f > .73 && f < .9) o.wave = true;
    if (i === 103 && f >= .28 && f < .52){ J.hf = {x: 24, y: -80}; J.hb = {x: 22, y: -82}; J.tilt = .12; }
    if (i === 105 && drawWorld.see && drawWorld.see.on){ const sv = drawWorld.see; gx = sv.x - sv.d * Math.cos(sv.th) + 2.2; gy = Y - 36 + sv.d * Math.sin(sv.th) + 37.4 - 3; }
    if (i === 105 && f >= .89 && f < .975 && drawWorld.see){ const sv = drawWorld.see, u = win(f, .89, .975), sxs = sv.x - 54 + 2.2, sys = Y - 1.6;
      gx = lerp(sxs, gxp, u); gy = lerp(sys, Y, u) - 120 * Math.sin(Math.PI * u);
      J.hf = {x: 12, y: -126}; J.hb = {x: -10, y: -122}; J.fa = {x: 9, y: -10 * Math.sin(Math.PI * u)}; J.fb = {x: -6, y: -4}; J.tilt = -.18 * Math.sin(Math.PI * u); }
    if (i === 105 && f >= .975){ const u = win(f, .975, 1); J.hip.y += 6 * Math.sin(Math.PI * u); }
""")
R("    // щенок рядом с ней\n", """    if (i === 106 && f >= .3 && f < .74) photoBoard(sx(A.board), Y - 2);
    // щенок рядом с ней
""")

# ---------- рисунки ----------
R("function lenaBanner(cx, cy, t){", r"""function ribbon(x1, y1, x2, y2, u, w, col, dashed, label, alpha, ly){
  if (u <= 0 || alpha <= 0) return;
  const mx = (x1 + x2) / 2, my = Math.max(y1, y2) + 24 + Math.abs(x2 - x1) * .05;
  const P = t => ({x: (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2, y: (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2});
  C.save(); C.globalAlpha = alpha; C.lineCap = 'round';
  const line = (dx, dy, c) => { C.strokeStyle = c; C.lineWidth = w; if (dashed) C.setLineDash([6, 7]); C.beginPath(); for (let k = 0; k <= 48; k++){ const q = P(k / 48 * u); k ? C.lineTo(q.x + dx, q.y + dy) : C.moveTo(q.x + dx, q.y + dy); } C.stroke(); C.setLineDash([]); };
  line(1.1, 1.7, SHADOW); line(0, 0, col);
  const e = P(u); dot(e.x, e.y, w * .7 + 1, col);
  if (u > .98 && label){ const q0 = P(1), q = {x: q0.x, y: q0.y + (ly || -40)}; seg(q0.x, q0.y, q.x, q.y + 10, col, 1); C.font = 'italic 19px Literata, Georgia, serif'; const tw = C.measureText(label).width;
    cut(rrP(q.x - tw / 2 - 9, q.y - 15, tw + 18, 26, 7), '#f7ecd2', .5); C.strokeStyle = col; C.lineWidth = 1.2; C.stroke(rrP(q.x - tw / 2 - 9, q.y - 15, tw + 18, 26, 7));
    C.fillStyle = '#2a1f19'; C.textAlign = 'center'; C.textBaseline = 'alphabetic'; C.fillText(label, q.x, q.y + 4); }
  C.restore();
}
function nameTag(x, y, label, col){
  C.save(); C.font = 'italic 19px Literata, Georgia, serif'; const tw = C.measureText(label).width;
  cutSeg(x, y + 2, x, y + 16, '#8a6a4a', 1.2);
  cut(rrP(x - tw / 2 - 10, y - 24, tw + 20, 28, 8), '#f7ecd2', .6); C.strokeStyle = col; C.lineWidth = 1.6; C.stroke(rrP(x - tw / 2 - 10, y - 24, tw + 20, 28, 8));
  C.fillStyle = '#2a1f19'; C.textAlign = 'center'; C.textBaseline = 'alphabetic'; C.fillText(label, x, y - 4); C.restore();
}
function sidePt(x0, y, t){ const P0 = [x0, y - 1], P1 = [x0 + 170, y - 2], P2 = [x0 + 270, y - 64], u = 1 - t; return {x: u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0], y: u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1]}; }
function sidePath(x0, y){
  // тропинка сворачивает с дороги, сужается и поднимается на холм, к домику Ильи
  const L = [], Rr = []; for (let k = 0; k <= 30; k++){ const t = k / 30, q = sidePt(x0, y, t), w2 = 22 * (1 - t) + 3.5 * t; L.push([q.x, q.y - w2 * .45]); Rr.push([q.x, q.y + w2 * .45]); }
  const p = NP(); p.moveTo(L[0][0] - 22, L[0][1]); L.forEach(q => p.lineTo(q[0], q[1])); Rr.reverse().forEach(q => p.lineTo(q[0], q[1])); p.lineTo(Rr[Rr.length - 1][0] - 26, Rr[Rr.length - 1][1]); p.closePath(); fillP(p, pc('path'));
  const e = sidePt(x0, y, 1); C.save(); C.translate(e.x + 12, e.y + 2); C.scale(.62, .62); rowHouse(0, 0, '#c99a6a', '#4f6b3a'); C.restore();
  folkTree(e.x - 26, e.y + 2, 34, 77, 1, pc('tree0'), pc('tree1'));
  // указатель на развилке
  cutSeg(x0 + 30, y - 6, x0 + 30, y - 46, '#7a5534', 2.4); C.save(); C.translate(x0 + 30, y - 42); C.rotate(-.32); cut(polyP([0, -5, 30, -5, 36, 0, 30, 5, 0, 5]), '#c9b08a', .6); C.restore();
}
function archShape(x, y, prog, t){
  const R0 = 84, H0 = 170;
  for (const sd of [-1, 1]) cut(rrP(x + sd * R0 - 6, y - H0, 12, H0, 3), '#8a5a2e');
  const arc = NP(); arc.arc(x, y - H0, R0 + 6, Math.PI, 0); arc.arc(x, y - H0, R0 - 6, 0, Math.PI, true); arc.closePath(); cut(arc, '#8a5a2e');
  // гирлянда цветов по арке
  for (let k = 0; k <= 16; k++){ const a = Math.PI + k / 16 * Math.PI, fx = x + Math.cos(a) * R0, fy = y - H0 + Math.sin(a) * R0;
    cut(ellP(fx, fy, 6, 4, a), '#5f8f3e', .4); dot(fx + Math.cos(a) * 2, fy + Math.sin(a) * 2, 3.4, k % 3 === 0 ? '#efe2c2' : k % 3 === 1 ? '#d94a3a' : '#e9a6b8'); }
  for (const sd of [-1, 1]) for (let k = 0; k < 6; k++){ const fy = y - H0 + 18 + k * 26; cut(ellP(x + sd * R0, fy, 5, 3.4, .6 * sd), '#5f8f3e', .4); dot(x + sd * (R0 + 4), fy - 4, 3, k % 2 ? '#d94a3a' : '#efe2c2'); }
  // табличка «Пара» появляется в тот момент, когда они проходят под аркой
  const u = win(prog, .32, .42); if (u > 0){
    const sc = u < 1 ? .4 + .6 * easeOut(u) + Math.sin(u * Math.PI) * .12 : 1, sy = y - H0 - R0 + 22, tear = win(prog, .82, .9);
    const sign = () => { cut(rrP(-64, 0, 128, 44, 8), '#f7ecd2'); C.strokeStyle = '#c0452f'; C.lineWidth = 2; C.stroke(rrP(-58, 5, 116, 34, 6));
      C.fillStyle = '#b13f2c'; C.font = '26px Prata, Georgia, serif'; C.textAlign = 'center'; C.textBaseline = 'alphabetic'; C.fillText('Пара', 0, 31);
      for (const sd of [-1, 1]){ const hx = sd * 46, hy = 20; const p = NP(); p.moveTo(hx, hy + 5); p.bezierCurveTo(hx - 9, hy - 2, hx - 5, hy - 9, hx, hy - 4); p.bezierCurveTo(hx + 5, hy - 9, hx + 9, hy - 2, hx, hy + 5); fillP(p, '#d94a3a'); } };
    const zig = [[0, -2], [5, 6], [-4, 13], [4, 21], [-5, 29], [3, 37], [-2, 46]];
    C.save(); C.translate(x, sy); C.scale(sc, sc);
    if (tear <= 0){ seg(-34, -18, -24, 2, '#6e4420', 1.2); seg(34, -18, 24, 2, '#6e4420', 1.2); sign(); }
    else {
      // рвётся посередине: каждая половинка повисает на своей верёвочке
      const ang = easeOut(tear) * .95 + (tear >= 1 ? Math.sin(t * .003) * .03 : Math.sin(tear * 18) * .06 * (1 - tear));
      for (const sd of [-1, 1]){
        seg(sd * 34, -18, sd * 24, 2, '#6e4420', 1.2);
        C.save(); C.translate(sd * 24, 2); C.rotate(-sd * ang); C.translate(-sd * 24, -2);
        const cl = NP(); cl.moveTo(sd * 80, -4); zig.forEach(([zx, zy]) => cl.lineTo(zx + sd * 1.5 * tear, zy)); cl.lineTo(sd * 80, 50); cl.closePath();
        C.save(); C.clip(cl); sign(); C.restore(); C.restore();
      }
    }
    C.restore();
  }
  // конфетти
  const cu = win(prog, .38, .78); if (cu > 0 && cu < 1){ const cols = ['#c0452f', '#d9a33a', '#3f6e73', '#efe2c2', '#e9a6b8'];
    for (let k = 0; k < 34; k++){ const a = -Math.PI / 2 + (hash(k) - .5) * 2.4, v = 90 + hash(k + 7) * 120, tt = cu * 2.2;
      const px = x + Math.cos(a) * v * tt * .6, py = y - H0 - R0 + 30 + Math.sin(a) * v * tt * .6 + 60 * tt * tt;
      C.save(); C.globalAlpha = 1 - cu; C.translate(px, py); C.rotate(tt * 6 + k); fillP(rectP(-3, -1.6, 6, 3.2), cols[k % 5]); C.restore(); } }
}
function seesaw(x, y, th){
  cut(polyP([x - 26, y, x, y - 36, x + 26, y]), '#6e4420'); dot(x, y - 36, 3, '#d9a33a');
  C.save(); C.translate(x, y - 36); C.rotate(-th);
  const pl = rrP(-136, -5, 272, 10, 4); cut(pl, '#b13f2c'); C.save(); C.clip(pl); fillP(rectP(-140, -1.5, 280, 3), '#efe2c2'); C.restore();
  for (const sd of [-1, 1]){ cutSeg(sd * 92, -5, sd * 92, -20, '#6e4420', 3); cutSeg(sd * 92 - 6, -20, sd * 92 + 6, -20, '#2a1f19', 3.4); }
  C.restore();
}
function photoBoard(x, y){
  // щит для фото «Настоящая пара»: нарисованные жених и невеста, вместо лиц — прорези
  const L0 = x - 120, T0 = y - 214, Wd = 240, Hd = 200, hl = [x - 48, y - 152], hr = [x + 48, y - 152], hrR = 15;
  cutSeg(x - 70, y, x - 70, y - 30, '#6e4420', 5); cutSeg(x + 70, y, x + 70, y - 30, '#6e4420', 5);
  const p = new Path2D(); p.addPath(rrP(L0, T0, Wd, Hd, 8)); p.moveTo(hl[0] + hrR, hl[1]); p.arc(hl[0], hl[1], hrR, 0, TAU); p.moveTo(hr[0] + hrR, hr[1]); p.arc(hr[0], hr[1], hrR, 0, TAU);
  C.save(); C.translate(1.1, 1.7); C.fillStyle = SHADOW; C.fill(p, 'evenodd'); C.restore();
  C.fillStyle = '#8a5a2e'; C.fill(p, 'evenodd');
  const inner = new Path2D(); inner.addPath(rrP(L0 + 8, T0 + 8, Wd - 16, Hd - 16, 5)); inner.moveTo(hl[0] + hrR, hl[1]); inner.arc(hl[0], hl[1], hrR, 0, TAU); inner.moveTo(hr[0] + hrR, hr[1]); inner.arc(hr[0], hr[1], hrR, 0, TAU);
  C.fillStyle = '#f3e6c8'; C.fill(inner, 'evenodd');
  C.save(); C.clip(inner, 'evenodd');
  // домик позади пары — «живут вместе»
  fillP(rectP(x - 92, y - 128, 184, 90), '#e6cfa0'); fillP(polyP([x - 104, y - 126, x, y - 176, x + 104, y - 126]), '#d9a080');
  // невеста
  fillP(polyP([hl[0] - 14, y - 134, hl[0] + 14, y - 134, hl[0] + 34, y - 24, hl[0] - 34, y - 24]), '#fbf7ee'); fillP(ellP(hl[0], y - 166, 22, 10), 'rgba(255,255,255,.75)');
  fillP(circP(hl[0] + 10, y - 98, 7), '#d94a3a'); fillP(circP(hl[0] + 4, y - 94, 5), '#e9a6b8');
  // жених
  fillP(polyP([hr[0] - 18, y - 134, hr[0] + 18, y - 134, hr[0] + 20, y - 24, hr[0] - 20, y - 24]), '#2f3340'); fillP(polyP([hr[0] - 5, y - 134, hr[0] + 5, y - 134, hr[0], y - 112]), '#fbf7ee'); fillP(polyP([hr[0] - 5, y - 130, hr[0] + 5, y - 130, hr[0], y - 124]), '#c0452f');
  C.restore();
  C.strokeStyle = '#c99a6a'; C.lineWidth = 2; C.beginPath(); C.arc(hl[0], hl[1], hrR + 1, 0, TAU); C.stroke(); C.beginPath(); C.arc(hr[0], hr[1], hrR + 1, 0, TAU); C.stroke();
  // надпись
  C.textAlign = 'center'; C.textBaseline = 'alphabetic'; let fs = 22; C.font = fs + 'px Prata, Georgia, serif'; const tw = C.measureText('НАСТОЯЩАЯ ПАРА').width; if (tw > Wd - 40){ fs *= (Wd - 40) / tw; C.font = fs + 'px Prata, Georgia, serif'; }
  C.fillStyle = '#b13f2c'; C.fillText('НАСТОЯЩАЯ ПАРА', x, T0 + 30);
}
function lenaBanner(cx, cy, t){""")
