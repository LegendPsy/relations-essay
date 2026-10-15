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
