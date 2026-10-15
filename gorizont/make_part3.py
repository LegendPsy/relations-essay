"""Собирает gorizont/chast-3.html из готовой второй части (chast-2.html):
текст третьей части (src/part3.html), её озвучка и разметка слов (src/part3-times.json),
свой сценарий Лены: от утреннего костра к реке, лодка, лестница-башня, одинаковые домики,
перекрытый мост, кафе, банка, корзинка, радио, скамейка, луг, дождь и привал под навесом.
Запуск: python3 make_part3.py
"""
import json, pathlib, re
ROOT = pathlib.Path(__file__).parent
s = (ROOT / "chast-2.html").read_text(encoding="utf-8")


def R(a, b, cnt=1):
    global s
    n = s.count(a)
    assert n == cnt, (n, a[:120])
    s = s.replace(a, b)


times = json.loads((ROOT / "src" / "part3-times.json").read_text(encoding="utf-8"))
DUR = times["duration"]
mmss = f"{int(DUR // 60)}:{int(DUR % 60):02d}"

# ---------- шапка, адреса, хранилище ----------
R("<title>Горизонт отношений · Часть 2</title>", "<title>Горизонт отношений · Часть 3</title>")
R('<span class="dk-time" id="listen-time">14:25</span>', f'<span class="dk-time" id="listen-time">{mmss}</span>')
R('src="audio/gorizont-chast-2.mp3"', 'src="audio/gorizont-chast-3.mp3"')
R("const PUBLIC_URL = 'https://legendpsy.github.io/relations-essay/gorizont/chast-2.html';",
  "const PUBLIC_URL = 'https://legendpsy.github.io/relations-essay/gorizont/chast-3.html';")
assert s.count("'gorizont-2-") >= 5
s = s.replace("'gorizont-2-", "'gorizont-3-")
R("au.duration || 865", f"au.duration || {round(DUR)}", 4)
R(": 865.15;", f": {DUR};")
R("привал в конце второй ч", "привал в конце третьей ч")

# ---------- текст ----------
a = s.index('<main class="col" id="col">') + len('<main class="col" id="col">')
b = s.index("</main>")
body = (ROOT / "src" / "part3.html").read_text(encoding="utf-8")
n_units = body.count('<section class="cp"')
end = (f'\n<section class="cp cp-end" id="r{n_units}" data-cp="{n_units}">\n'
       '<aside class="rest rest-part"><p class="rest-label">Привал · конец третьей части</p>'
       '<p>Дождь стихает. Лена сидит под навесом и слушает, как с крыши падают последние капли. '
       'Здесь можно остановиться: она подождёт, а место сохранится само. Когда вернётесь, путь продолжится отсюда.</p>'
       f'<button type="button" class="btn ghost js-copy" data-cp="{n_units}">Скопировать ссылку на это место</button>'
       '<a class="btn ghost" href="./">Все части статьи</a></aside>\n</section>\n')
s = s[:a] + "\n" + body + end + s[b:]
R(".col ul { margin: 0 0 1em; padding-left: 1.15em; }",
  ".col ul, .col ol { margin: 0 0 1em; padding-left: 1.15em; }\n.col ol { padding-left: 1.5em; }\n.col ol li::marker { font-family: var(--mono); font-size: .85em; }")

# ---------- озвучка ----------
s = re.sub(r"const PARA_T = \[.*?\];", lambda m: "const PARA_T = " + json.dumps(times["para"]) + ";", s, count=1)
s = re.sub(r"const WORD_T = \[\[.*?\]\];", lambda m: "const WORD_T = " + json.dumps(times["words"], separators=(",", ":")) + ";", s, count=1)

# ---------- сценарий третьей части ----------
a = s.index("// новые сцены второй части")
b = s.index("const OLD = PART, NEWOF = {};")
s = s[:a] + """// новые сцены третьей части
S_ALL[120] = {a:'На берегу витрина: «лучшие» золотые туфли и простые резиновые сапоги. Для реки подходят сапоги', m:'boat', sp:'shoes'};
S_ALL[122] = {a:'Скамейка «Супруги»: двое садятся посвободнее, табличка та же. Потом табличка меняется на «Бывшие супруги», а тепло между ними остаётся', m:[['walk',.18],['stand',.86],['walk',1]], sp:'couple'};
S_ALL[121] = {a:'Старое радио на пеньке: Лена крутит по одной ручке — тише, громче, другая волна', m:[['walk',.24],['stand',.82],['walk',1]], sp:'radio'};
// третья часть: утро у костра (21), река и лодка (22), витрина с обувью (120), башня-лестница (23), одинаковые домики (24),
// перекрытый мост (25) и тропа поверху (26), скамейка «Супруги» (122), кафе (27), банка (28), корзинка (29), радио (121),
// ручка корзинки рвётся (31), луг как в начале (32), дождь (34), привал под навесом (36)
S_ALL[21] = Object.assign({}, S_ALL[21], {a:'Утро. Костёр догорел: Лена встаёт, берёт велосипед и едет дальше', m:[['sit',.3],['stand',.42],['walk',.55],['bike',1]], rest:0, tod:'morning', set:{h:1, f:1, b:2, pup:0}, ia:.01});
S_ALL[25] = Object.assign({}, S_ALL[25], {a:'Причаливает. Мост перекрыт: сверяется с компасом, и тропа поведёт её поверху в ту же сторону', m:[['boat',.2],['stand',.3],['walk',.42],['stand',1]]});
S_ALL[26] = Object.assign({}, S_ALL[26], {a:'Тропа уходит вверх, и она снова идёт вправо: поверху, над перекрытым мостом. Направление то же'});
S_ALL[33] = Object.assign({}, S_ALL[33], {a:'Ветер уносит цветок со шляпки. Шляпка всё та же, а на ней уже по-другому'});
S_ALL[28] = Object.assign({}, S_ALL[28], {a:'Банка с красивой этикеткой. Внутри почти пусто', rest:0});
S_ALL[29] = Object.assign({}, S_ALL[29], {a:'Заглядывает в корзинку: из чего она состоит сейчас?'});
S_ALL[31] = Object.assign({}, S_ALL[31], {a:'Ручка корзинки рвётся. Чинить уже нечего: Лена оставляет корзинку на скамейке'});
S_ALL[32] = Object.assign({}, S_ALL[32], {a:'Луг, как в самом начале. Но она уже не та, что в начале: шляпка с ней, и весь пройденный путь тоже'});
const PART = [21, 22, 120, 23, 24, 25, 26, 122, 27, 28, 29, 121, 31, 32, 34, 36];
// кнопка в конце пункта k показывает сцену GO_OF[k]; 25 (мост) проигрывается по дороге к тропе поверху,
// луг и дождь — по дороге к навесу
const GO_OF = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 15];
""" + s[b:]

# ---------- мир: якоря и новые предметы ----------
R("    qsign: WX(111, .2) + 96, tend: WX(110, .22),", "    qsign: WX(111, .2) + 96, tend: WX(110, .22), shoes: WX(120, .5) + 40, radio: WX(121, .24) + 52, couple: WX(122, .18) + 150,")
R("  // ---- попутчик и девушка ----", """  // 120 · витрина с обувью на берегу
  x = sx(A.shoes); if (x > -300 && x < LWv + 300) shoeStand(x, Y, i === 120 ? f : (RK(i) > RK(120) ? 1 : 0), tq);
  // 122 · скамейка «Супруги»
  x = sx(A.couple); if (x > -260 && x < LWv + 260) coupleBench(x, Y, i === 122 ? f : (RK(i) > RK(122) ? 1 : 0), tq);
  // 121 · радио на пеньке
  x = sx(A.radio); if (x > -200 && x < LWv + 200) radioShape(x, Y, i === 121 ? f : (RK(i) > RK(121) ? 1 : 0), tq);
  // ---- попутчик и девушка ----""")
# у утреннего костра велосипед стоит, пока она на него не сядет; светлячков утром нет
R("if (i === 21 && f >= .12) bikeParked(x - 58, Y - 4, -.12);", "if (i === 21 && f < .55) bikeParked(x - 58, Y - 4, -.12);")
R("if (night > .3 || i === 21){", "if (night > .3){")
# Лена: смотрит на витрину, крутит ручки радио
R("    if (i === 111 && f > .24 && f < .74) o.lookUp = true;", """    if (i === 111 && f > .24 && f < .74) o.lookUp = true;
    if (i === 121 && f > .28 && f < .78){ carry = null; o.hold = {x: 30, y: -58 + 3 * Math.sin(tq * .01)}; o.tilt = .14; }""")
R("function qualitySign(x, y, u, t){", r"""function shoeStand(x, y, u, t){
  // мосток-витрина у берега: наверху крупно «лучшие» золотые туфли, ниже простые резиновые сапоги
  for (const px of [x - 84, x + 84]) cutSeg(px, y + 26, px, y - 140, '#6e4420', 6);
  cut(rrP(x - 104, y - 132, 208, 16, 4), '#8a5a2e'); cut(rrP(x - 96, y - 52, 192, 14, 4), '#8a5a2e');
  // вывеска
  C.save(); C.translate(x, y - 222); C.rotate(Math.sin(t * .0013) * .02);
  cutSeg(-84, 8, -84, 92, '#6e4420', 3); cutSeg(84, 8, 84, 92, '#6e4420', 3);
  cut(rrP(-104, -28, 208, 46, 8), '#f7ecd2'); C.strokeStyle = '#c0452f'; C.lineWidth = 2.2; C.strokeRect(-97, -21, 194, 32);
  C.textAlign = 'center'; C.fillStyle = '#2a1f19'; C.font = '23px Prata, Georgia, serif'; C.fillText('Лучшие туфли', 0, 3);
  C.restore();
  // бархатная подушка и пара золотых туфель на шпильке
  cut(rrP(x - 92, y - 150, 184, 22, 11), '#7a2a3a'); fillP(rrP(x - 86, y - 148, 172, 6, 3), 'rgba(255,255,255,.12)');
  for (const [dx, sc] of [[-40, 1], [36, 1]]){ C.save(); C.translate(x + dx, y - 148); C.scale(sc * 1.2, 1.2);
    cutSeg(-25, -28, -23, 0, '#9a6e1e', 3.2);
    const p = NP(); p.moveTo(-27, -32); p.lineTo(-24, -34); p.quadraticCurveTo(-12, -22, 2, -17); p.lineTo(20, -15); p.quadraticCurveTo(31, -12, 30, -4); p.quadraticCurveTo(28, 0, 20, 0); p.lineTo(2, 0); p.quadraticCurveTo(-14, -6, -22, -24); p.closePath();
    cut(p, '#e2b33f', .8); fillP(ellP(-12, -24, 9, 3.4, .5), '#7a4e12'); seg(4, -12, 24, -10, 'rgba(255,246,214,.7)', 1.4);
    C.restore(); }
  const sp = .5 + .5 * Math.sin(t * .006); C.save(); C.globalAlpha = sp; C.fillStyle = '#fff6d6';
  for (const [dx, dy, r] of [[-70, -186, 7], [62, -182, 6], [4, -168, 5]]){ const cx = x + dx, cy = y + dy, p = NP(); p.moveTo(cx, cy - r); p.lineTo(cx + r * .3, cy - r * .3); p.lineTo(cx + r, cy); p.lineTo(cx + r * .3, cy + r * .3); p.lineTo(cx, cy + r); p.lineTo(cx - r * .3, cy + r * .3); p.lineTo(cx - r, cy); p.lineTo(cx - r * .3, cy - r * .3); p.closePath(); C.fill(p); } C.restore();
  // резиновые сапоги
  for (const dx of [-30, 12]){ const bx = x + dx; C.save(); C.translate(bx, y - 52); C.scale(1.25, 1.25);
    cut(polyP([-8, -40, 7, -40, 7, -10, 19, -6, 19, 0, -8, 0]), '#3f6e73', .6); fillP(rectP(-8, -40, 15, 5), '#2f5559'); C.restore(); }
  // ярлычок «для реки» у сапог: появляется, когда она проплывает мимо
  const v = easeOut(win(u, .35, .55)); if (v > 0){ C.save(); C.globalAlpha = v; nameTag(x + 132, y - 92 - 6 * v, 'для реки', '#4f6b3a'); C.restore(); }
  C.save(); C.globalAlpha = .25; for (const px of [x - 84, x + 84]) seg(px, y + 26, px + Math.sin(t * .004) * 2, y + 46, '#2a1f19', 4); C.restore();
}
function coupleBench(x, y, u, t){
  // длинная скамейка с табличкой. Сначала двое сидят вплотную, потом садятся свободнее — табличка та же.
  // Потом табличка переворачивается на «Бывшие супруги», а они так же улыбаются друг другу.
  const apart = ease(win(u, .22, .42)), flip = win(u, .56, .68);
  const pp = NP(); for (const sx0 of [-70, 70]){ cutSeg(x + sx0, y - 30, x + sx0, y, '#2a1f19', 2.6); }
  cut(rectP(x - 84, y - 36, 168, 6), '#8a5a2e'); cut(rectP(x - 84, y - 58, 168, 5), '#8a5a2e'); cut(rectP(x - 84, y - 48, 168, 5), '#8a5a2e');
  const d = lerp(16, 52, apart), J1 = makePose('sit', {}), J2 = makePose('sit', {});
  if (apart < .5){ J1.hf = {x: 22, y: -62}; J2.hf = {x: 22, y: -62}; }      // держатся за руки, пока сидят вплотную
  drawPerson(x - d, y - 1, 1, J1, LOOK.ilya, {}, {t, scale: .86, blink: (t % 4100) < 150, noShadow: true});
  drawPerson(x + d, y - 1, -1, J2, LOOK.friend, {}, {t, scale: .86, blink: (t % 3700) < 150, noShadow: true});
  // сердечко между ними: и когда сели свободнее, и когда сменилась табличка
  for (const [a, b] of [[.44, .56], [.7, .84]]){ const hu = win(u, a, b); if (hu <= 0 || hu >= 1) continue;
    C.save(); C.globalAlpha = Math.sin(Math.PI * hu); const hx = x, hy = y - 150 - hu * 26, p = NP(); p.moveTo(hx, hy + 9); p.bezierCurveTo(hx - 15, hy - 3, hx - 8, hy - 15, hx, hy - 7); p.bezierCurveTo(hx + 8, hy - 15, hx + 15, hy - 3, hx, hy + 9); cut(p, '#d94a3a', .6); C.restore(); }
  // табличка на столбике над скамейкой; переворачивается вокруг вертикальной оси
  cutSeg(x + 96, y, x + 96, y - 92, '#6e4420', 3);
  const sc = Math.abs(Math.cos(Math.PI * flip)), label = flip < .5 ? 'Супруги' : 'Бывшие супруги';
  C.save(); C.translate(x + 96, y - 112); C.scale(Math.max(.04, sc), 1);
  C.font = '19px Prata, Georgia, serif'; const tw = C.measureText(label).width + 30;
  cut(rrP(-tw / 2, -18, tw, 34, 7), '#f7ecd2', .6); C.strokeStyle = '#b13f2c'; C.lineWidth = 1.8; C.strokeRect(-tw / 2 + 5, -13, tw - 10, 24);
  C.textAlign = 'center'; C.fillStyle = '#2a1f19'; C.fillText(label, 0, 6); C.restore();
}
function radioShape(x, y, u, t){
  // пенёк и старое радио на нём; когда Лена крутит ручки, стрелка бежит по шкале, а из динамика летят ноты
  cut(polyP([x - 22, y + 2, x - 18, y - 30, x + 18, y - 30, x + 22, y + 2]), '#7a5534'); cut(ellP(x, y - 30, 18, 5), '#b98b5a'); C.strokeStyle = 'rgba(90,58,30,.6)'; C.lineWidth = .8; C.beginPath(); C.ellipse(x, y - 30, 10, 2.6, 0, 0, TAU); C.stroke();
  const bx = x - 28, by = y - 72;
  cut(rrP(bx, by, 56, 40, 7), '#b13f2c'); fillP(rrP(bx + 4, by + 4, 30, 32, 4), '#5a3a22');
  C.fillStyle = 'rgba(239,226,194,.55)'; for (let k = 0; k < 5; k++) C.fillRect(bx + 7, by + 9 + k * 5.6, 24, 1.6);
  fillP(rrP(bx + 37, by + 5, 15, 9, 2), '#efe2c2'); seg(bx + 39, by + 9.5, bx + 50, by + 9.5, 'rgba(42,31,25,.35)', .6);
  const turn = win(u, .3, .76), needle = bx + 39 + 11 * (.2 + .8 * (Math.sin(turn * 7.3) * .5 + .5) * turn);
  seg(needle, by + 6, needle, by + 13, '#c0452f', 1.1);
  for (const [k, ky] of [[0, by + 22], [1, by + 32]]){ const kx = bx + 44.5; dot(kx, ky, 4.4, '#2a1f19'); const ang = turn * (k ? -5 : 7) + k; seg(kx, ky, kx + 3.4 * Math.cos(ang), ky + 3.4 * Math.sin(ang), '#efe2c2', 1.1); }
  cutSeg(bx + 10, by, bx + 2, by - 22, '#2a1f19', 1.2); dot(bx + 2, by - 22, 1.6, '#d9a33a');
  // ноты: сначала шипение, потом чистая волна
  if (u > .28 && u < 1){ const clean = win(u, .55, .7);
    for (let k = 0; k < 4; k++){ const ph = ((t * .0006 + k * .25) % 1), nx = bx + 20 - ph * 30 + Math.sin(ph * 9 + k) * 6, ny = by - 6 - ph * 60;
      C.save(); C.globalAlpha = (1 - ph) * (u < .98 ? 1 : 0);
      if (clean > .5){ dot(nx, ny, 3, '#2a1f19'); seg(nx + 2.6, ny, nx + 2.6, ny - 12, '#2a1f19', 1.2); seg(nx + 2.6, ny - 12, nx + 7, ny - 9, '#2a1f19', 1.2); }
      else { C.strokeStyle = 'rgba(42,31,25,.7)'; C.lineWidth = 1.1; C.beginPath(); for (let q = 0; q < 6; q++) C.lineTo(nx + q * 2.4, ny + (q % 2 ? -3 : 3)); C.stroke(); }
      C.restore(); } }
}
function qualitySign(x, y, u, t){""")

(ROOT / "chast-3.html").write_text(s, encoding="utf-8")
print("OK: chast-3.html,", n_units, "пунктов + привал,", mmss)
