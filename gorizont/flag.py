# Поезд из Индонезии: на хвосте флаг, развевается на ветру, и табличка «Индонезия».
R("""    for (let q = 0; q < 3; q++) fillP(rectP(x0 + 4 + q * 10.5, y - 16, 7, 6), '#efe2c2'); dot(x0 + 7, y - 2, 3, '#2a1f19'); dot(x0 + 28, y - 2, 3, '#2a1f19'); seg(x0 - 6, y - 8, x0, y - 8, '#2a1f19', 1.2); });
}""", """    for (let q = 0; q < 3; q++) fillP(rectP(x0 + 4 + q * 10.5, y - 16, 7, 6), '#efe2c2'); dot(x0 + 7, y - 2, 3, '#2a1f19'); dot(x0 + 28, y - 2, 3, '#2a1f19'); seg(x0 - 6, y - 8, x0, y - 8, '#2a1f19', 1.2); });
  indoFlag(hx + 46 + 3 * 38 + 31, y - 20, t);
}
function indoFlag(px, py, t){
  // флажок на хвосте: поезд едет влево, флаг вьётся вправо
  const top = py - 64, fw = 58, fh = 36, n = 14;
  cutSeg(px, py, px, top - 4, '#6e4420', 2.4); dot(px, top - 5, 2.6, '#d9a33a');
  const wave = k => Math.sin(t * .012 - k * .55) * (2 + k * .55);
  const upper = [], mid = [], lower = [];
  for (let k = 0; k <= n; k++){ const u = k / n, x = px + u * fw, d = wave(k) + u * 3; upper.push([x, top + d]); mid.push([x, top + fh / 2 + d]); lower.push([x, top + fh + d - u * 4]); }
  const band = (a, b, col) => { const p = NP(); p.moveTo(a[0][0], a[0][1]); a.forEach(q => p.lineTo(q[0], q[1])); b.slice().reverse().forEach(q => p.lineTo(q[0], q[1])); p.closePath(); cut(p, col, .6); };
  band(upper, mid, '#d7262e'); band(mid, lower, '#fbf7ee');
  // табличка
  const lx = px + fw / 2 + 6, ly = top - 30;
  C.save(); C.font = 'italic 22px Prata, Georgia, serif'; let tw = C.measureText('Индонезия').width;
  seg(px, top - 4, lx - tw / 2 - 2, ly + 10, '#6e4420', 1);
  cut(rrP(lx - tw / 2 - 11, ly - 20, tw + 22, 30, 7), '#f7ecd2', .6); C.strokeStyle = '#d7262e'; C.lineWidth = 1.6; C.stroke(rrP(lx - tw / 2 - 11, ly - 20, tw + 22, 30, 7));
  C.fillStyle = '#2a1f19'; C.textAlign = 'center'; C.textBaseline = 'alphabetic'; C.fillText('Индонезия', lx, ly + 2); C.restore();
}""")
R("C.save(); C.beginPath(); C.rect(tL, y - 80, tR - tL, 100); C.clip(); drawTrain(hx, y - 2, t); C.restore();",
  "C.save(); C.beginPath(); C.rect(tL, y - 160, tR - tL + 260, 180); C.clip(); drawTrain(hx, y - 2, t); C.restore();")
