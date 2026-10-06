# Крупные сцены первой части: нити отношения, арка «Пара», качели-балансир, щит «Настоящая пара».
# Выполняется внутри make_template.py (там определены s и R).

R("const PF = {4: .8, 7: .7,", "const PF = {103: .5, 104: .55, 105: .42, 106: .5, 4: .8, 7: .7,")

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
  x = sx(A.arch); if (x > -300 && x < LWv + 420){ sidePath(x + 150, Y); archShape(x, Y - 2, i === 104 ? f : (RK(i) > RK(104) ? 1 : 0), tq); }
  // 106 · щит «Настоящая пара» (когда она за щитом, щит рисуется поверх неё)
  x = sx(A.board); if (x > -220 && x < LWv + 220 && !(i === 106 && f >= .3 && f < .74)) photoBoard(x, Y - 2);
  // ---- попутчик и девушка ----""")

# ---------- люди и качели (до девушки) ----------
R("  // птицы клином (38)", """  // 103 · друг, коллега, прохожий — и от неё к каждому своя нить
  x = sx(A.rib); if (x > -320 && x < LWv + 420){
    const fr = x + 112, co = x + 300, nod = i === 103 && f > .42 && f < .56 ? .16 : 0;
    drawPerson(co, Y - 12, -1, makePose('stand', {w: 0, t: tq, tilt: nod}), LOOK.colleague, {}, {t: tq, scale: .93, blink: (tq % 3900) < 150});
    drawPerson(fr, Y + 4, -1, makePose('stand', {w: 0, t: tq, wave: i === 103 && f > .2 && f < .5}), LOOK.friend, {}, {t: tq, blink: (tq % 4400) < 150});
    if (i === 103){
      const sp2 = lerp(x + 520, x - 300, win(f, .04, .96));
      drawPerson(sp2, Y - 20, -1, makePose('walk', {w: 1, ph: f * 52, t: tq}), LOOK.stranger, {}, {t: tq, w: 1, scale: .86});
      const fade = 1 - win(f, .86, 1), hx = gxp + 6, hy = Y - 84;
      ribbon(hx, hy, fr - 4, Y - 80, win(f, .18, .36), 7, '#c0452f', 0, 'друг', fade, -62);
      ribbon(hx, hy, co - 4, Y - 90, win(f, .36, .54), 3.4, '#d9a33a', 0, 'коллега', fade, -64);
      ribbon(hx, hy, sp2 - 4, Y - 92, win(f, .54, .7), 1.8, '#5a5a52', 1, 'прохожий', fade, -30);
    } }
  // 104 · Илья: догоняет её на дороге, идут вместе; после арки берутся за руки, потом он уходит своей тропинкой
  if (i === 104){ const lv = win(f, .86, 1), catchUp2 = f === 0 && GAP[NI] > 0 ? clamp01(travel / GAP[NI]) : 0;
    const rel = lerp(-48, 150, ease(lv)) - 260 * catchUp2, yy = Y - 5 - 66 * ease(lv), scl = .97 - .45 * ease(lv);
    const J2 = makePose('walk', {w: Math.max(w, catchUp2 > 0 ? 1 : 0, lv > 0 ? 1 : 0), ph: (drawWorld.gph || 0) * (catchUp2 > 0 ? 1.4 : 1) + Math.PI * .9, t: tq});
    if (f > .6 && f < .86) J2.hf = {x: 25, y: -54};
    if (lv > .05 && lv < .45) J2.hf = {x: 15 + 2 * Math.sin(tq * .02), y: -127};
    drawPerson(gxp + rel, yy, 1, J2, LOOK.ilya, {}, {t: tq, w: 1, scale: scl, blink: (tq % 4100) < 150}); }
  // 105 · качели-балансир: малыш уже сидит
  x = sx(A.see); if (x > -280 && x < LWv + 280){
    const on = i === 105 && f >= .3 && f < .84, d = lerp(108, 54, ease(win(f, .44, .68)));
    let th = on ? Math.max(-.2, Math.min(.2, (2 * d - 108) / 108 * .2)) + (f > .68 ? .035 * Math.sin(tq * .006) : 0) : -.2;
    if (i === 105 && f >= .84) th = lerp(.035 * Math.sin(tq * .006), -.2, ease(win(f, .84, .92)));
    seesaw(x, Y, th);
    const kx = x + 108 * Math.cos(th), ky = Y - 36 - 108 * Math.sin(th);
    drawPerson(kx + 1.5, ky + 22, -1, makePose('sit', {}), LOOK.kid, {}, {t: tq, scale: .62, blink: (tq % 3700) < 150, noShadow: true});
    drawWorld.see = {x, th, d, on}; }
  // птицы клином (38)""")

# ---------- девушка ----------
R("    const gx = gxp; let gy = Y", "    let gx = gxp; let gy = Y")
R("    if (i === 100 && f > .32 && f < .7) o.tilt = .1;", """    if (i === 100 && f > .32 && f < .7) o.tilt = .1;
    if (i === 105 && f >= .3 && f < .84) m = 'sit';
    if (i === 106 && f >= .3 && f < .74){ const k = win(f, .36, .7) * 3, hop = Math.abs(Math.sin(Math.PI * k)); gy -= 34 * hop * (k > 0 && k < 3 ? 1 : 0); }""")
R("    const J = makePose(m, o);\n", """    const J = makePose(m, o);
    if (i === 104 && f > .6 && f < .86) J.hb = {x: -20, y: -52};
    if (i === 105 && drawWorld.see && drawWorld.see.on){ const sv = drawWorld.see; gx = sv.x - sv.d * Math.cos(sv.th) + 2.2; gy = Y - 36 + sv.d * Math.sin(sv.th) + 37.4 - 3; }
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
function sidePath(x0, y){ const p = polyP([x0 - 24, y - 6, x0 + 24, y - 6, x0 + 270, y - 74, x0 + 236, y - 74]); C.save(); C.globalAlpha = .95; fillP(p, pc('path')); C.restore(); }
function archShape(x, y, prog, t){
  const R0 = 84, H0 = 170;
  for (const sd of [-1, 1]) cut(rrP(x + sd * R0 - 6, y - H0, 12, H0, 3), '#8a5a2e');
  const arc = NP(); arc.arc(x, y - H0, R0 + 6, Math.PI, 0); arc.arc(x, y - H0, R0 - 6, 0, Math.PI, true); arc.closePath(); cut(arc, '#8a5a2e');
  // гирлянда цветов по арке
  for (let k = 0; k <= 16; k++){ const a = Math.PI + k / 16 * Math.PI, fx = x + Math.cos(a) * R0, fy = y - H0 + Math.sin(a) * R0;
    cut(ellP(fx, fy, 6, 4, a), '#5f8f3e', .4); dot(fx + Math.cos(a) * 2, fy + Math.sin(a) * 2, 3.4, k % 3 === 0 ? '#efe2c2' : k % 3 === 1 ? '#d94a3a' : '#e9a6b8'); }
  for (const sd of [-1, 1]) for (let k = 0; k < 6; k++){ const fy = y - H0 + 18 + k * 26; cut(ellP(x + sd * R0, fy, 5, 3.4, .6 * sd), '#5f8f3e', .4); dot(x + sd * (R0 + 4), fy - 4, 3, k % 2 ? '#d94a3a' : '#efe2c2'); }
  // табличка «Пара» появляется в тот момент, когда они проходят под аркой
  const u = win(prog, .48, .58); if (u > 0){
    const sc = u < 1 ? .4 + .6 * easeOut(u) + Math.sin(u * Math.PI) * .12 : 1, sy = y - H0 - R0 + 22;
    C.save(); C.translate(x, sy); C.scale(sc, sc);
    seg(-34, -18, -24, 2, '#6e4420', 1.2); seg(34, -18, 24, 2, '#6e4420', 1.2);
    cut(rrP(-64, 0, 128, 44, 8), '#f7ecd2'); C.strokeStyle = '#c0452f'; C.lineWidth = 2; C.stroke(rrP(-58, 5, 116, 34, 6));
    C.fillStyle = '#b13f2c'; C.font = '26px Prata, Georgia, serif'; C.textAlign = 'center'; C.textBaseline = 'alphabetic'; C.fillText('Пара', 0, 31);
    for (const sd of [-1, 1]){ const hx = sd * 46, hy = 20; const p = NP(); p.moveTo(hx, hy + 5); p.bezierCurveTo(hx - 9, hy - 2, hx - 5, hy - 9, hx, hy - 4); p.bezierCurveTo(hx + 5, hy - 9, hx + 9, hy - 2, hx, hy + 5); fillP(p, '#d94a3a'); }
    C.restore();
  }
  // конфетти
  const cu = win(prog, .5, .9); if (cu > 0 && cu < 1){ const cols = ['#c0452f', '#d9a33a', '#3f6e73', '#efe2c2', '#e9a6b8'];
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
