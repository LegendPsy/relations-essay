"""Общие правки по отчёту проверки (15 октября) для всех страниц: chast-1..4, vyvody, celikom.
Каждая правка применяется один раз: если она уже есть, страница не меняется.
Запускать последним шагом, после любых сборщиков: python3 fix_all.py
"""
import pathlib
ROOT = pathlib.Path(__file__).parent
PAGES = ["chast-1.html", "chast-2.html", "chast-3.html", "chast-4.html", "vyvody.html", "celikom.html"]

FIXES = [
    # 1–2. События под голос длятся дольше (в полтора раза) и после них Лена ещё пару секунд остаётся на месте;
    #      дорога перед событием соответственно короче. Сцены без своей точки в тексте получают столько времени,
    #      сколько им нужно, а не 4 секунды.
    ("    for (let s = 0; s <= N; s++){ const b = ends[s] !== undefined ? ends[s] : a + 4; const D = s === 0 ? b - a : Math.min(natDur(s), (b - a) * .85);\n"
     "      SEG[s] = {a, b, ev: b - D, D}; a = b; }",
     "    const EV_SLOW = 1.5, HOLD = 2.5;   // событие в полтора раза спокойнее, потом пауза на месте\n"
     "    for (let s = 0; s <= N; s++){ const b = ends[s] !== undefined ? ends[s] : a + natDur(s) * EV_SLOW + HOLD + .6;\n"
     "      const D = s === 0 ? b - a : Math.min(natDur(s) * EV_SLOW, (b - a) * .7), hold = s === 0 ? 0 : Math.min(HOLD, Math.max(0, (b - a) * .85 - D));\n"
     "      SEG[s] = {a, b, ev: b - D - hold, D}; a = b; }"),
    # 3. Пункт 42: первые дома деревни видны уже в сумерках, и окна в них загораются одно за другим
    ("village: WX(45, 0) + 140,", "village: WX(45, 0) + 140, v44: WX(44, .5) + 120,"),
    ("    for (let k = 0; k < 8; k++){ const lx = sxp(A.village + 40 + k * 180, .92);",
     "    if (RK(i) <= RK(45)) for (let k = 0; k < 4; k++){ const hx = sxp(A.v44 + k * 96, .85); if (hx < -70 || hx > LWv + 70) continue;\n"
     "      const u = i === 44 ? win(f, .1, .9) * 1.1 : 1; villageHouse(hx, vy, k + 3, [hash(k + 31) < u ? 1 : 0, hash(k + 47) < u - .1 ? 1 : 0], tq); }\n"
     "    for (let k = 0; k < 8; k++){ const lx = sxp(A.village + 40 + k * 180, .92);"),
    # 4. Витрина с обувью стоит чуть дальше по берегу, чтобы лодка не закрывала резиновые сапоги
    ("shoes: WX(120, .5) + 40,", "shoes: WX(120, .5) + 130,"),
    # 5. На последнем абзаце прокрутка подтягивает и рамку в конце (прощание или привал), если читаемое слово остаётся видно
    ("      const dy = r.top - target;\n",
     "      let dy = r.top - target;\n"
     "      if (pk === els.length - 1){ const ce = document.querySelector('.cp-end'); if (ce){ const need = ce.getBoundingClientRect().bottom - (window.innerHeight - 16); dy = Math.max(dy, Math.min(need, r.top - top - 24)); } }\n"),
    # 6. В помещении шарф не летит по ветру, а спокойно свисает
    ("    for (let k = 0; k <= 9; k++){ const xx = n0.x - k * (4.6 + wind * 1.2), yy = n0.y + k * (1.6 - wind * .9) + Math.sin(t * .006 - k * .75) * k * (.35 + wind * .5);",
     "    for (let k = 0; k <= 9; k++){ const xx = o.calm ? n0.x - k * 1.3 + Math.sin(t * .002 - k * .6) * k * .12 : n0.x - k * (4.6 + wind * 1.2), yy = o.calm ? n0.y + k * 3.4 : n0.y + k * (1.6 - wind * .9) + Math.sin(t * .006 - k * .75) * k * (.35 + wind * .5);"),
    ("{wind: .2, t: tq, blink: (tq % 4200) < 160, carry: 'plate', plateItems: plate}",
     "{wind: .2, calm: true, t: tq, blink: (tq % 4200) < 160, carry: 'plate', plateItems: plate}"),
    ("{t: tq, blink: blinkA, noShadow: true, wind: 0}", "{t: tq, blink: blinkA, noShadow: true, wind: 0, calm: true}"),
    ("{t: tq, blink: blinkB, noShadow: true, scale: .98, wind: 0}", "{t: tq, blink: blinkB, noShadow: true, scale: .98, wind: 0, calm: true}"),
    # 6б. За столиком названия отношений сменяются спокойно, примерно по секунде с лишним на каждое
    ("132: 3.5", "132: 3.5, 140: 5"),
    # 7. Пока в начале висит транспарант «Это Лена», кнопка «Закладка» не закрывает его край
    ("  const oi = OLD[i]; NI = i;\n",
     "  const oi = OLD[i]; NI = i;\n  if (!frame.mk) frame.mk = document.getElementById('markbtn'); frame.mk.style.visibility = oi === 0 ? 'hidden' : '';\n"),
    # 8. Развилка (пункты 16–17): попутчик съезжает по изогнутой боковой дороге и выезжает на дальнюю дорогу.
    #    Дальняя дорога начинается от развилки, лежит в поле с кромкой и изгородью и в конце уходит в холмы.
    ("fork: WX(17, .25) + 40,", "fork: WX(17, .25) + 40, farEnd: WX(18, 1) + 590,"),
    ("function sidePath(x0, y){",
     "const FORK_DX = 170, FAR_Y = 300;\n"
     "function forkPt(x0, t){ const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;\n"
     "  return {x: a * x0 + b * (x0 + 80) + c * (x0 + 95) + d * (x0 + FORK_DX), y: a * 336 + b * 336 + c * FAR_Y + d * FAR_Y}; }\n"
     "const FORK_S = (() => { const r = [0]; let q = forkPt(0, 0); for (let k = 1; k <= 48; k++){ const n = forkPt(0, k / 48); r.push(r[k - 1] + Math.hypot(n.x - q.x, n.y - q.y)); q = n; } return r; })(), FORK_LEN = FORK_S[48];\n"
     "function forkAt(x0, s){ let k = 1; while (k < 48 && FORK_S[k] < s) k++; const t = (k - 1 + clamp01((s - FORK_S[k - 1]) / (FORK_S[k] - FORK_S[k - 1]))) / 48; return forkPt(x0, t); }\n"
     "function forkBranch(x0){\n"
     "  // боковая дорога: сходит с большой дороги, плавно поднимается по полю и становится дальней дорогой\n"
     "  const L = [], R = []; for (let k = 0; k <= 30; k++){ const t = k / 30, q = forkPt(x0, t), w2 = 12 * (1 - t) + 3.5 * t; L.push([q.x, q.y - w2]); R.push([q.x, q.y + w2]); }\n"
     "  const p = NP(); p.moveTo(L[0][0] - 26, L[0][1]); L.forEach(q => p.lineTo(q[0], q[1])); for (let k = R.length - 1; k >= 0; k--) p.lineTo(R[k][0], R[k][1]); p.lineTo(R[0][0] - 30, R[0][1]); p.closePath(); fillP(p, pc('path'));\n"
     "  const e = NP(); R.forEach((q, k) => k ? e.lineTo(q[0], q[1] - .6) : e.moveTo(q[0] + 14, q[1] - .6)); C.strokeStyle = mixH(pc('path'), pc('mid'), .55); C.lineWidth = 1.3; C.stroke(e);\n"
     "}\n"
     "function farRoad(jx, ex, y){\n"
     "  // дальняя дорога в поле: полотно, тёмная нижняя кромка, светлая колея и изгородь вдоль дальней обочины\n"
     "  const x1 = Math.min(ex, LWv + 40), x0 = Math.max(jx - 2, -40); const edge = mixH(pc('path'), pc('mid'), .55);\n"
     "  if (x1 > x0){ fillP(rectP(x0, y - 3.5, x1 - x0, 7), pc('path')); fillP(rectP(x0, y + 2.3, x1 - x0, 1.2), edge); fillP(rectP(Math.max(x0, jx + 30), y - .4, x1 - Math.max(x0, jx + 30), .9), mixH(pc('path'), '#fff8e8', .35)); }\n"
     "  for (let k = Math.max(0, Math.floor((-60 - jx) / 58)); ; k++){ const px = jx + 26 + k * 58; if (px > Math.min(ex - 10, LWv + 30)) break;\n"
     "    seg(px, y - 4.5, px, y - 14, '#6b4a2c', 2.2); const nx = px + 58; if (nx < ex - 10) seg(px, y - 11, nx, y - 11, '#7a5534', 1.2); }\n"
     "  // в конце дорога поворачивает и уходит в холмы\n"
     "  if (ex < LWv + 40) for (let k = 0; k < 16; k++){ const t0 = k / 16, t1 = (k + 1) / 16, P = t => { const u = 1 - t; return [u * u * ex + 2 * u * t * (ex + 90) + t * t * (ex + 170), u * u * y + 2 * u * t * y + t * t * (y - 20)]; };\n"
     "    const a = P(t0), b = P(t1), w0 = 3.5 - 2.4 * t0, w1 = 3.5 - 2.4 * t1; C.save(); C.globalAlpha = 1 - t0 * t0; fillP(polyP([a[0] - .5, a[1] - w0, b[0] + .5, b[1] - w1, b[0] + .5, b[1] + w1, a[0] - .5, a[1] + w0]), pc('path')); C.restore(); }\n"
     "}\n"
     "function sidePath(x0, y){"),
    ("  // дальняя дорога попутчика (17–18)\n"
     "  if (RK(i) >= RK(16) && RK(i) <= RK(19)){ const ry = 290 + camY * .6; C.save(); C.globalAlpha = i === 16 ? win(f, .6, 1) : i === 19 ? 1 - win(f, 0, .4) : 1; fillP(rectP(0, ry - 3, LWv, 6), pc('path')); C.restore(); }",
     "  // дальняя дорога попутчика (17–19): начинается от развилки, идёт параллельно по полю и уходит в холмы\n"
     "  if (RK(i) >= RK(16) && RK(i) <= RK(20)){ const jx = sx(A.fork + FORK_DX), ex = sx(A.farEnd); if (jx < LWv + 20 && ex > -200){ C.save(); C.translate(0, camY); farRoad(jx, ex, FAR_Y); C.restore(); } }"),
    ("  x = sx(A.fork); if (inView(x)){ const p = polyP([x - 20, Y - 6, x + 26, Y - 6, x + 150, Y - 50 + camY * 0, x + 120, Y - 50]); fillP(p, pc('path')); }",
     "  x = sx(A.fork); if (x > -FORK_DX - 40 && x < LWv + 40) forkBranch(x);"),
    ("  if (comp === 'leave'){ const u = ease(win(f, .25, .85)); drawPerson(gxp - 96 + u * 190, Y - 4 - u * 44, 1, makePose('bike', {ph: bikeQ * .45 + 1.3}), LOOK.boy, {}, {wheel: bikeQ, t: tq, scale: .95 - u * .45}); }\n"
     "  if (comp === 'far'){ const wv = f > .15 && f < .4; drawPerson(gxp + 40 + f * 40, 290 - camY * .4, 1, makePose(wv ? 'bikeStop' : 'bike', {ph: bikeQ * .45, wave: wv, t: tq}), LOOK.boy, {}, {wheel: bikeQ, t: tq, scale: .5}); }",
     "  // на развилке он обгоняет её, сворачивает на боковую дорогу и по ней выезжает на дальнюю\n"
     "  const wheelOf = d => Math.round(d / (17 * KG * .75) / (TAU / 12)) * (TAU / 12);\n"
     "  if (comp === 'leave'){ const d = camL - 96 + ease(win(f, .1, .9)) * (A.fork + FORK_LEN + 40 - (WX(17, 1) - 96)), s = d - A.fork, x0 = sx(A.fork);\n"
     "    let px, py, k; if (s <= 0){ px = x0 + s; py = Y - 4; k = 0; } else if (s <= FORK_LEN){ const q = forkAt(x0, s); px = q.x; py = q.y; k = s / FORK_LEN; } else { px = x0 + FORK_DX + s - FORK_LEN; py = FAR_Y; k = 1; }\n"
     "    const wq = wheelOf(d); drawPerson(px, py, 1, makePose(f < .9 ? 'bike' : 'bikeStop', {ph: wq * .45 + 1.3, t: tq}), LOOK.boy, {}, {wheel: wq, t: tq, scale: .95 - k * .4}); }\n"
     "  if (comp === 'far'){ const wv = f > .15 && f < .4, dd = ease(win(f, .4, 1)) * 680, wq = wheelOf(A.fork + FORK_LEN + 40 + dd);\n"
     "    drawPerson(sx(A.fork + FORK_DX + 40 + dd), FAR_Y - camY * .4, 1, makePose(f > .4 ? 'bike' : 'bikeStop', {ph: wq * .45 + 1.3, wave: wv, t: tq}), LOOK.boy, {}, {wheel: wq, t: tq, scale: .55}); }"),
    # 9. Пункт 24→25: перекрытый мост стоит там, где голос говорит о нём, и он крупный: большой мост через реку
    #    с провалом посередине, полосатый шлагбаум со знаком и табличкой «Ремонт». Лена сходит с лодки и идёт по берегу,
    #    у шлагбаума сверяется с компасом, тропа поднимается на холм, по мостику над ущельем идёт поверху и спускается.
    ("S_ALL[25] = Object.assign({}, S_ALL[25], {a:'Причаливает. Мост перекрыт: сверяется с компасом, и тропа поведёт её поверху в ту же сторону', m:[['boat',.2],['stand',.3],['walk',.42],['stand',1]]});",
     "S_ALL[25] = Object.assign({}, S_ALL[25], {a:'Причаливает и сходит на берег', m:[['boat',.2],['stand',.3],['walk',1]]});"),
    ("S_ALL[26] = Object.assign({}, S_ALL[26], {a:'Тропа уходит вверх, и она снова идёт вправо: поверху, над перекрытым мостом. Направление то же'});",
     "S_ALL[26] = Object.assign({}, S_ALL[26], {a:'Мост перекрыт на ремонт. Сверяется с компасом: тропа уходит вверх, и она идёт поверху, над перекрытым мостом. Направление то же', m:[['walk',.14],['stand',.34],['walk',1]]});"),
    ("25: 1.6, 26: 1.6,", "25: 1.6, 26: 3.9,"),
    ("bridge: WX(25, .5) + 40, ter0: WX(26, 0) + 10, ter3: WX(26, 1) - 10,",
     "bridge: WX(26, .34) + 235, ter0: WX(26, .34) + 16, ter3: WX(26, .34) + 755,"),
    ("  A.ter1 = A.ter0 + 90; A.ter2 = Math.max(A.ter1 + 40, A.ter3 - 90);",
     "  A.ter1 = A.ter0 + 175; A.bridge1 = A.bridge + 320; A.gorge0 = A.bridge + 70; A.gorge1 = A.bridge1 - 70; A.ter2 = A.bridge1 + 40; A.bar = A.bridge - 22;"),
    ("function elevAt(x){ if (x <= A.ter0 || x >= A.ter3) return 0; if (x < A.ter1) return 64 * ease((x - A.ter0) / (A.ter1 - A.ter0)); if (x > A.ter2) return 64 * (1 - ease((x - A.ter2) / (A.ter3 - A.ter2))); return 64; }",
     "const DET_H = 88;   // высота тропы поверху\n"
     "function elevAt(x){ if (x <= A.ter0 || x >= A.ter3) return 0; if (x < A.ter1) return DET_H * ease((x - A.ter0) / (A.ter1 - A.ter0)); if (x > A.ter2) return DET_H * (1 - ease((x - A.ter2) / (A.ter3 - A.ter2)));\n"
     "  if (x > A.gorge0 && x < A.gorge1) return DET_H - 7 * Math.sin(Math.PI * (x - A.gorge0) / (A.gorge1 - A.gorge0)); return DET_H; }\n"
     "function detourBack(){\n"
     "  // холм с тропой: подъём, ущелье с речкой, подвесной мостик поверху, спуск (мировые координаты)\n"
     "  const hc = mixH(pc('mid'), pc('tree0'), .22), rock = mixH(pc('mid'), '#5e4a3a', .5), top = x => 333 - elevAt(Math.max(A.ter0, Math.min(x, A.ter3)));\n"
     "  fillP(rectP(A.gorge0 - 4, 330, A.gorge1 - A.gorge0 + 8, 14), pc('water0'));\n"
     "  for (let k = 0; k < 6; k++){ const xx = A.gorge0 + 14 + k * (A.gorge1 - A.gorge0 - 28) / 5; fillP(rectP(xx, 334 + (k % 2) * 4, 12, 1.2), pc('water1')); }\n"
     "  for (const [a, b, side] of [[A.ter0 - 40, A.gorge0, 1], [A.gorge1, A.ter3 + 40, -1]]){\n"
     "    const p = NP(); p.moveTo(a, 344); for (let x = a; x < b; x += 6) p.lineTo(x, Math.min(344, top(x) - 3 + (hash(x) - .5) * 2)); p.lineTo(b, top(b) - 3); p.lineTo(b, 344); p.closePath(); cut(p, hc);\n"
     "    const cx = side > 0 ? b : a, r = NP(); r.moveTo(cx, top(cx) - 3); r.lineTo(cx - side * 16, top(cx) + 2); r.lineTo(cx - side * 10, 344); r.lineTo(cx, 344); r.closePath(); fillP(r, rock);\n"
     "    const q = NP(); const pa = Math.max(a, A.ter0), pb = Math.min(b, A.ter3); for (let x = pa; x <= pb; x += 6) q.lineTo(x, 337 - elevAt(x)); for (let x = pb; x >= pa; x -= 6) q.lineTo(x, 345 - elevAt(x)); q.closePath(); fillP(q, pc('path')); }\n"
     "  // подвесной мостик над ущельем\n"
     "  const g0 = A.gorge0 - 8, g1 = A.gorge1 + 8, dk = NP(); for (let x = g0; x <= g1; x += 6) dk.lineTo(x, 338 - elevAt(Math.min(Math.max(x, A.gorge0), A.gorge1))); for (let x = g1; x >= g0; x -= 6) dk.lineTo(x, 343 - elevAt(Math.min(Math.max(x, A.gorge0), A.gorge1))); dk.closePath(); cut(dk, '#8a5a2e');\n"
     "  for (let x = g0 + 6; x < g1; x += 9){ const yy = 338 - elevAt(Math.min(Math.max(x, A.gorge0), A.gorge1)); seg(x, yy, x, yy + 5, '#6e4420', .7); }\n"
     "  for (const px of [g0, g1]) cutSeg(px, 338 - DET_H, px, 338 - DET_H - 30, '#6e4420', 2.6);\n"
     "  C.strokeStyle = '#6e4420'; C.lineWidth = 1.4; C.beginPath(); for (let x = g0; x <= g1; x += 6){ const u = (x - g0) / (g1 - g0); C.lineTo(x, 338 - DET_H - 28 + Math.sin(Math.PI * u) * 18); } C.stroke();\n"
     "  for (let x = g0 + 14; x < g1 - 6; x += 14){ const u = (x - g0) / (g1 - g0), yr = 338 - DET_H - 28 + Math.sin(Math.PI * u) * 18; seg(x, yr, x, 338 - elevAt(Math.min(Math.max(x, A.gorge0), A.gorge1)), '#7a5534', .8); }\n"
     "  for (const tx of [A.ter1 + 46, A.ter2 - 34, A.ter2 + 60]) folkTree(tx, top(tx) - 1, 44, tx | 0, 1, pc('tree0'), pc('tree1'));\n"
     "}\n"
     "function detourFront(sx, Y, tq){\n"
     "  // река из ущелья течёт под большим мостом к нам; мост с провалом посередине; шлагбаум со знаком и табличкой\n"
     "  const b0 = sx(A.bridge), b1 = sx(A.bridge1), m = (b0 + b1) / 2, ink = '#6e4420', wood = '#8a5a2e';\n"
     "  const ch = polyP([b0 + 44, 338, b1 - 44, 338, b1 + 6, LB + 4, b0 - 6, LB + 4]); fillP(ch, pc('water0'));\n"
     "  seg(b0 + 44, 338, b0 - 6, LB + 4, pc('ground2'), 4); seg(b1 - 44, 338, b1 + 6, LB + 4, pc('ground2'), 4);\n"
     "  for (let k = 0; k < 9; k++){ const v = ((tq * .00004 + k / 9) % 1), yy = 342 + v * (LB - 342), hw = (b1 - b0 - 88) / 2 + v * 50, xx = m + Math.sin(k * 2.3) * hw * .6; fillP(rectP(xx - 6 - v * 6, yy, 12 + v * 12, 1.4), pc('water1')); }\n"
     "  for (const px of [b0 + 38, m - 76, m + 76, b1 - 38]) cut(rectP(px - 6, Y - 2, 12, 46), ink);\n"
     "  const deck = (a, b) => { cut(rectP(a, Y - 10, b - a, 10), wood); for (let x = a + 7; x < b - 2; x += 11) seg(x, Y - 10, x, Y, ink, .8); };\n"
     "  deck(b0 - 16, m - 38); deck(m + 38, b1 + 16);\n"
     "  cut(polyP([m - 38, Y - 10, m - 30, Y - 8, m - 34, Y - 4, m - 27, Y - 1, m - 38, Y]), wood); cut(polyP([m + 38, Y - 10, m + 31, Y - 7, m + 35, Y - 3, m + 28, Y, m + 38, Y]), wood);\n"
     "  for (const [px, a] of [[m - 30, .5], [m + 32, -.4]]){ C.save(); C.translate(px, Y - 4); C.rotate(a + Math.sin(tq * .002) * .05); cut(rectP(-3, 0, 6, 26), wood, .6); C.restore(); }\n"
     "  const rail = (a, b) => { for (let x = a; x <= b + 1; x += 28) cutSeg(x, Y - 10, x, Y - 42, ink, 3); cutSeg(a, Y - 42, b, Y - 42, ink, 3); cutSeg(a, Y - 26, b, Y - 26, ink, 2); };\n"
     "  rail(b0 - 12, m - 40); rail(m + 40, b1 + 12);\n"
     "  cutSeg(m - 40, Y - 42, m - 24, Y - 30, ink, 3); cutSeg(m + 40, Y - 26, m + 26, Y - 14, ink, 2);\n"
     "  const bx = sx(A.bar);\n"
     "  cut(rectP(bx - 5, Y - 58, 10, 58), '#3a2f28'); cut(rectP(bx - 24, Y - 54, 18, 13), '#3a2f28');\n"
     "  C.save(); C.translate(bx, Y - 47); for (let k = 0; k < 9; k++) cut(rectP(k * 15, -5, 15, 10), k % 2 ? '#efe2c2' : '#c0452f', .7); C.restore();\n"
     "  cutSeg(bx + 131, Y, bx + 131, Y - 44, '#3a2f28', 3);\n"
     "  cut(rrP(bx + 34, Y - 37, 68, 21, 3), '#f0c43a', .7); C.save(); C.fillStyle = '#2a1f19'; C.font = '13px Prata, Georgia, serif'; C.textAlign = 'center'; C.textBaseline = 'alphabetic'; C.fillText('Ремонт', bx + 68, Y - 22); C.restore();\n"
     "  cut(circP(bx, Y - 71, 14), '#c0452f'); fillP(rrP(bx - 9, Y - 74, 18, 6, 2), '#efe2c2'); C.strokeStyle = '#efe2c2'; C.lineWidth = 1.6; C.beginPath(); C.arc(bx, Y - 71, 11.5, 0, TAU); C.stroke();\n"
     "}"),
    ("  if (RK(i) >= RK(24) && RK(i) <= RK(28)){ const p = NP(); p.moveTo(A.ter0, 340); for (let x = A.ter0; x <= A.ter3; x += 8) p.lineTo(x, 332 - elevAt(x) + (hash(x) - .5) * 2); p.lineTo(A.ter3, 340); p.closePath(); cut(p, pc('mid'));\n"
     "    const q = NP(); for (let x = A.ter0; x <= A.ter3; x += 8) q.lineTo(x, 338 - elevAt(x)); for (let x = A.ter3; x >= A.ter0; x -= 8) q.lineTo(x, 346 - elevAt(x)); q.closePath(); fillP(q, pc('path'));\n"
     "    for (let x = A.ter1 + 20; x < A.ter2; x += 70) folkTree(x, 334 - 64, 40, x | 0, 1, pc('tree0'), pc('tree1')); }",
     "  if (A.ter3 + 120 > wx0 && A.ter0 - 120 < wx1) detourBack();"),
    ("  x = sx(A.bridge); if (inView(x)) closedBridge(x, Y - 4);",
     "  x = sx(A.bridge); if (x > -460 && x < LWv + 220) detourFront(sx, Y, tq);"),
    ("if (i === 25 && f > .5 && f < .72){ o.compass = true; carry = 'compass'; }",
     "if (i === 26 && f > .16 && f < .32){ o.compass = true; carry = 'compass'; }"),
    # 9б. Пока Лена идёт поверху, камера немного поднимается за ней, чтобы шляпка не уходила за край
    ("if (i === 4) climbH = f * 250; else if (i === 5) climbH = (1 - clamp01(f / .7)) * 250;",
     "if (i === 4) climbH = f * 250; else if (i === 5) climbH = (1 - clamp01(f / .7)) * 250; else if (i === 26) climbH = 40 + elevAt(camL) * .3;"),
]

for p in PAGES:
    f = ROOT / p
    s = f.read_text(encoding="utf-8")
    done = []
    for old, new in FIXES:
        if new in s:
            continue
        n = s.count(old)
        if n == 0:
            continue          # этой сцены на странице нет (например, столика в частях 1–4)
        assert n == 1, (p, n, old[:80])
        s = s.replace(old, new)
        done.append(old[:40].strip())
    f.write_text(s, encoding="utf-8")
    print(p, len(done), "правок")
