function drawTableScene(i, f, now, tq, it){
  // столик у окна в том же ресторане. 140: над Леной и её собеседником сменяются названия их отношений
  // (друг, партнёр, знакомый…), потом названия гаснут и остаются просто двое за столом.
  // 141: тишина, а на переднем плане появляется тарелка — место за этим столом для вас
  C.fillStyle = '#7a2a22'; C.fillRect(0, 0, LWv, LB);
  C.fillStyle = 'rgba(239,226,194,.10)';
  for (let yy = OFFY - 40; yy < 400; yy += 46) for (let xx = (yy / 46 % 2) * 30; xx < LWv; xx += 60){ C.beginPath(); C.moveTo(xx, yy - 8); C.quadraticCurveTo(xx + 8, yy, xx, yy + 8); C.quadraticCurveTo(xx - 8, yy, xx, yy - 8); C.fill(); }
  const cx = LWv * .5, fy = Y0;
  // окно со светом
  cut(rrP(cx - 70, OFFY + 20, 140, 170, 60), '#f6dfa0'); C.strokeStyle = '#8a5a2e'; C.lineWidth = 4; C.strokeRect(cx - 70, OFFY + 70, 140, 120); seg(cx, OFFY + 22, cx, OFFY + 190, '#8a5a2e', 3); seg(cx - 70, OFFY + 120, cx + 70, OFFY + 120, '#8a5a2e', 3);
  C.save(); C.globalCompositeOperation = 'lighter'; C.fillStyle = `rgba(255,226,160,${.12 + .04 * Math.sin(tq * .0006)})`; C.beginPath(); C.moveTo(cx - 70, OFFY + 190); C.lineTo(cx + 70, OFFY + 190); C.lineTo(cx + 190, fy + 30); C.lineTo(cx - 190, fy + 30); C.fill(); C.restore();
  // гирлянда
  for (let k = 0; k < 18; k++){ const gx = k / 17 * LWv, gy = OFFY + 16 + Math.sin(k / 17 * Math.PI) * 22; dot(gx, gy, 2.6, ['#f2c46e', '#efe2c2', '#d9603a'][k % 3]); }
  // пол
  fillP(rectP(0, fy - 4, LWv, 220), '#8a5a2e'); C.fillStyle = '#6e4420'; for (let xx = -40; xx < LWv + 40; xx += 32){ C.beginPath(); C.moveTo(xx, fy - 4); C.lineTo(xx + 16, fy - 4); C.lineTo(xx + 40, fy + 90); C.lineTo(xx + 24, fy + 90); C.closePath(); C.fill(); }
  C.save(); C.translate(cx, fy); C.scale(1.35, 1.35); C.translate(-cx, -fy);
  backpack(cx - 150, fy, 1);
  // стулья (спинки за сидящими)
  for (const [x0, d] of [[cx - 92, -1], [cx + 92, 1]]){ cutSeg(x0 + d * 18, fy, x0 + d * 18, fy - 96, '#4a2c18', 4); cutSeg(x0 - d * 14, fy, x0 - d * 14, fy - 36, '#4a2c18', 4); cut(rectP(x0 - 20, fy - 40, 40, 6), '#6e4420'); }
  // двое за столом
  const blinkA = (tq % 4200) < 160, blinkB = (tq % 3700) < 150;
  drawPerson(cx - 92, fy - 1, 1, makePose('sit', {}), LOOK.girl, Object.assign({}, it, {b: 0}), {t: tq, blink: blinkA, noShadow: true, wind: 0});
  drawPerson(cx + 92, fy - 1, -1, makePose('sit', {}), LOOK.friend, {}, {t: tq, blink: blinkB, noShadow: true, scale: .98, wind: 0});
  // стол со скатертью, тарелки, свеча
  cut(rectP(cx - 6, fy - 58, 12, 58), '#4a2c18'); cut(rectP(cx - 34, fy - 6, 68, 6), '#4a2c18');
  cut(polyP([cx - 78, fy - 66, cx + 78, fy - 66, cx + 84, fy - 40, cx - 84, fy - 40]), '#f3ecdc', .6); seg(cx - 84, fy - 44, cx + 84, fy - 44, '#c0452f', 2);
  for (const px of [cx - 44, cx + 44]){ cut(ellP(px, fy - 68, 20, 5), '#fbf6ea', .5); fillP(ellP(px, fy - 70, 11, 3.2), px < cx ? '#9fb36a' : '#d9a33a'); }
  cut(rectP(cx - 3, fy - 92, 6, 24), '#efe2c2'); const fl = 1 + .15 * Math.sin(tq * .02); C.save(); C.globalCompositeOperation = 'lighter'; fillP(circP(cx, fy - 98, 16 * fl), 'rgba(255,200,110,.25)'); C.restore(); cut(ellP(cx, fy - 98, 3.2, 6 * fl), '#f2b632', .3);
  if (i === 140){
    const names = ['друг', 'партнёр', 'знакомый', 'муж', 'любовник', 'приятель'];
    const k = Math.floor(win(f, .08, .74) * names.length), loc = (win(f, .08, .74) * names.length) % 1;
    if (f > .08 && f < .74){ const a = Math.min(1, loc * 6, (1 - loc) * 6); C.save(); C.globalAlpha = a; nameTag(cx, fy - 126, names[Math.min(k, names.length - 1)], '#5b6f8a'); C.restore(); }
    // название гаснет совсем: над ними только тёплый свет и сердечко
    const h = win(f, .8, .96); if (h > 0 && h < 1){ C.save(); C.globalAlpha = Math.sin(Math.PI * h); const hx = cx, hy = fy - 118 - h * 20, p = NP(); p.moveTo(hx, hy + 11); p.bezierCurveTo(hx - 18, hy - 4, hx - 10, hy - 18, hx, hy - 9); p.bezierCurveTo(hx + 10, hy - 18, hx + 18, hy - 4, hx, hy + 11); cut(p, '#d94a3a', .6); C.restore(); }
  }
  C.restore();
  if (i === 141 && f > .08){
    // место для вас: свет приглушается, на переднем плане появляется тарелка с приборами
    const u = easeOut(win(f, .08, .4)); const px = LWv * .5, py = LB + 60 - u * 150;
    C.fillStyle = `rgba(30,12,8,${.38 * u})`; C.fillRect(0, 0, LWv, LB);
    C.save(); C.translate(px, py); C.scale(5.2, 5.2); cut(ellP(0, 0, 13, 3.8), '#f3ecdc'); C.strokeStyle = '#c0452f'; C.lineWidth = .5; C.beginPath(); C.ellipse(0, 0, 11, 3, 0, 0, TAU); C.stroke(); C.beginPath(); C.ellipse(0, 0, 8, 2.2, 0, 0, TAU); C.stroke();
    C.fillStyle = '#c0452f'; for (let q = 0; q < 16; q++){ const a = q / 16 * TAU; C.beginPath(); C.arc(Math.cos(a) * 9.6, Math.sin(a) * 2.6, .45, 0, TAU); C.fill(); }
    C.restore();
    const fx = px - 92, kx = px + 92, cy = py + 4, mt = '#d8cfbd';
    cut(rrP(fx - 3, cy - 6, 6, 34, 3), mt); cut(rrP(fx - 7, cy - 14, 14, 9, 3), mt); for (let q = 0; q < 4; q++) cut(rrP(fx - 7 + q * 4, cy - 32, 2.4, 20, 1.2), mt, .5);
    cut(rrP(kx - 3, cy - 4, 6, 32, 3), mt); const bl = NP(); bl.moveTo(kx - 3, cy - 4); bl.lineTo(kx - 3, cy - 36); bl.quadraticCurveTo(kx + 6, cy - 30, kx + 4, cy - 4); bl.closePath(); cut(bl, '#e8e2d4', .5);
  }
}
