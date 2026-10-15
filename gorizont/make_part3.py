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
S_ALL[121] = {a:'Старое радио на пеньке: Лена крутит по одной ручке — тише, громче, другая волна', m:[['walk',.24],['stand',.82],['walk',1]], sp:'radio'};
// третья часть: утро у костра (21), река и лодка (22), витрина с обувью (120), башня-лестница (23), одинаковые домики (24),
// перекрытый мост (25) и тропа поверху (26), ветер уносит цветок (33), кафе (27), банка (28), корзинка (29), радио (121),
// ручка корзинки рвётся (31), луг как в начале (32), дождь (34), привал под навесом (36)
S_ALL[21] = Object.assign({}, S_ALL[21], {a:'Утро. Костёр догорел: Лена встаёт, берёт велосипед и едет дальше', m:[['sit',.3],['stand',.42],['walk',.55],['bike',1]], rest:0, tod:'morning', set:{h:1, f:1, b:2, pup:0}, ia:.01});
S_ALL[25] = Object.assign({}, S_ALL[25], {a:'Причаливает. Мост перекрыт: сверяется с компасом и ищет другую дорогу в ту же сторону'});
S_ALL[26] = Object.assign({}, S_ALL[26], {a:'Тропа уходит вверх, и она снова идёт вправо: поверху, над перекрытым мостом. Направление то же'});
S_ALL[33] = Object.assign({}, S_ALL[33], {a:'Ветер уносит цветок со шляпки. Шляпка всё та же, а на ней уже по-другому'});
S_ALL[28] = Object.assign({}, S_ALL[28], {a:'Банка с красивой этикеткой. Внутри почти пусто', rest:0});
S_ALL[29] = Object.assign({}, S_ALL[29], {a:'Заглядывает в корзинку: из чего она состоит сейчас?'});
S_ALL[31] = Object.assign({}, S_ALL[31], {a:'Ручка корзинки рвётся. Чинить уже нечего: Лена оставляет корзинку на скамейке'});
S_ALL[32] = Object.assign({}, S_ALL[32], {a:'Луг, как в самом начале. Но она уже не та, что в начале: шляпка с ней, и весь пройденный путь тоже'});
const PART = [21, 22, 120, 23, 24, 25, 26, 33, 27, 28, 29, 121, 31, 32, 34, 36];
// кнопка в конце пункта k показывает сцену GO_OF[k]; 25 (мост) проигрывается по дороге к тропе поверху,
// луг и дождь — по дороге к навесу
const GO_OF = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 15];
""" + s[b:]

# ---------- мир: якоря и новые предметы ----------
R("    qsign: WX(111, .2) + 96, tend: WX(110, .22),", "    qsign: WX(111, .2) + 96, tend: WX(110, .22), shoes: WX(120, .5), radio: WX(121, .24) + 52,")
R("  // ---- попутчик и девушка ----", """  // 120 · витрина с обувью на берегу
  x = sx(A.shoes); if (x > -240 && x < LWv + 240) shoeStand(x, Y, i === 120 ? f : (RK(i) > RK(120) ? 1 : 0), tq);
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
  // мосток-витрина у берега: на верхней полке «лучшие» золотые туфли, ниже простые резиновые сапоги
  for (const px of [x - 46, x + 46]) cutSeg(px, y + 26, px, y - 112, '#6e4420', 4);
  cut(rrP(x - 62, y - 122, 124, 12, 3), '#8a5a2e'); cut(rrP(x - 58, y - 52, 116, 10, 3), '#8a5a2e');
  // табличка
  C.save(); C.translate(x, y - 150); C.rotate(Math.sin(t * .0013) * .02);
  cutSeg(-30, 0, -30, 26, '#6e4420', 1.6); cutSeg(30, 0, 30, 26, '#6e4420', 1.6);
  cut(rrP(-52, -16, 104, 26, 5), '#f7ecd2'); C.strokeStyle = '#c0452f'; C.lineWidth = 1.4; C.strokeRect(-48, -12, 96, 18);
  C.textAlign = 'center'; C.fillStyle = '#2a1f19'; C.font = 'italic 12.5px Literata, Georgia, serif'; C.fillText('Лучшие туфли', 0, 1.5);
  C.restore();
  // золотые туфли на бархатной подушке, с блеском
  cut(rrP(x - 34, y - 136, 68, 14, 6), '#7a2a3a');
  for (const dx of [-14, 12]){ const sx0 = x + dx; cut(polyP([sx0 - 13, y - 134, sx0 + 8, y - 134, sx0 + 13, y - 146, sx0 + 5, y - 144, sx0 - 4, y - 138]), '#d9a33a', .6); cutSeg(sx0 + 9, y - 134, sx0 + 10, y - 127, '#b8862a', 1.6); }
  const sp = .5 + .5 * Math.sin(t * .006); C.save(); C.globalAlpha = sp; C.fillStyle = '#fff6d6'; for (const [dx, dy] of [[-22, -150], [18, -152], [2, -146]]){ const p = NP(); p.moveTo(x + dx, y + dy - 4); p.lineTo(x + dx + 1.2, y + dy - 1.2); p.lineTo(x + dx + 4, y + dy); p.lineTo(x + dx + 1.2, y + dy + 1.2); p.lineTo(x + dx, y + dy + 4); p.lineTo(x + dx - 1.2, y + dy + 1.2); p.lineTo(x + dx - 4, y + dy); p.lineTo(x + dx - 1.2, y + dy - 1.2); p.closePath(); C.fill(p); } C.restore();
  // резиновые сапоги
  for (const dx of [-18, 10]){ const bx = x + dx; cut(polyP([bx - 7, y - 98, bx + 6, y - 98, bx + 6, y - 66, bx + 16, y - 62, bx + 16, y - 54, bx - 7, y - 54]), '#3f6e73', .6); fillP(rectP(bx - 7, y - 98, 13, 4), '#2f5559'); }
  // маленький ярлычок «для реки»: появляется, когда она проплывает мимо
  const v = easeOut(win(u, .35, .55)); if (v > 0){ C.save(); C.globalAlpha = v; nameTag(x - 4, y - 106 - 6 * v, 'для реки', '#4f6b3a'); C.restore(); }
  // отражение столбиков в воде
  C.save(); C.globalAlpha = .25; for (const px of [x - 46, x + 46]) seg(px, y + 26, px + Math.sin(t * .004) * 2, y + 44, '#2a1f19', 3); C.restore();
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
