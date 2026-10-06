# Лестница: Лена упирается головой в облако, а лестница уходит дальше, сквозь облако и выше.
R("    if (RK(i) >= RK(3) && RK(i) <= RK(5)){ for (let k = 0; k < 4; k++) paperCloudW(x - 60 + k * 44, Y - A.ladL - 6 + (k % 2) * 16, .9 + (k % 2) * .3, pc('cloud')); } }",
  "    if (i === 4 || i === 5 || (i === 6 && f < .2) || (RK(i) < RK(4) && RK(i) >= RK(104))){ const bmp = i === 4 ? bump(f, .9, 1) : 0; ladderCloud(x, Y - 395 - 7 * bmp, tq, bmp); } }")
R("  const camY = Math.max(0, climbH - 40) * .95 + altS * .82;", "  const camY = Math.max(0, climbH - 40) * 1.4 + altS * .82;")
R("    let gx = gxp; let gy = Y - (i === 26 ? elevAt(camL) : 0) - (i === 4 || i === 5 ? climbH : 0) - altS;",
  "    let gx = gxp; let gy = Y - (i === 26 ? elevAt(camL) : 0) - (i === 4 || i === 5 ? climbH : 0) - altS + (i === 4 ? 5 * bump(f, .9, 1) : 0);")
R("function cloudBank(x0, x1, edge, dir, t){", r"""function bump(u, a, b){ return (u > a && u < b) ? Math.sin(Math.PI * (u - a) / (b - a)) : 0; }
function ladderCloud(cx, by, t, squash){
  // плотное облако поперёк лестницы; by — его нижний край
  const p = NP(), q = NP(), col = pc('cloud'), sq = 1 - .12 * squash;
  [[-92, -16, 22], [-58, -30, 30], [-14, -40, 36], [34, -32, 31], [76, -20, 24], [104, -10, 15], [-112, -6, 13]].forEach(([dx, dy, r], k) => {
    const yy = by + dy * sq + Math.sin(t * .0012 + k) * 1.2; p.moveTo(cx + dx + r, yy); p.arc(cx + dx, yy, r, 0, TAU); q.moveTo(cx + dx + 6 + r * .6, yy + 10); q.arc(cx + dx + 6, yy + 10, r * .6, 0, TAU); });
  p.rect(cx - 112, by - 18 * sq, 216, 18 * sq);
  cut(p, col); C.save(); C.clip(p); C.fillStyle = mixH(col, pc('sky0'), .25); C.fill(q); C.restore();
  // клочки облака вокруг
  paperCloudW(cx - 150, by - 46, .55, col); paperCloudW(cx + 160, by - 30, .5, col);
}
function cloudBank(x0, x1, edge, dir, t){""")
