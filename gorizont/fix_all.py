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
