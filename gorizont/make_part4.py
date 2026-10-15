"""Собирает gorizont/chast-4.html из готовой третьей части (chast-3.html):
текст четвёртой части (src/part4.html), её озвучка и разметка слов (src/part4-times.json),
свой сценарий Лены: от навеса к аэродрому, полёт (ветра и компас, пунктир выборов, птицы клином,
бумажный самолётик «Привет, как ты?», просвет в облаках, второй самолёт), посадка, звёзды и созвездие,
деревня с окнами, рассвет и первый кирпич будущего дома.
Запуск: python3 make_part4.py
"""
import json, pathlib, re
ROOT = pathlib.Path(__file__).parent
s = (ROOT / "chast-3.html").read_text(encoding="utf-8")


def R(a, b, cnt=1):
    global s
    n = s.count(a)
    assert n == cnt, (n, a[:120])
    s = s.replace(a, b)


times = json.loads((ROOT / "src" / "part4-times.json").read_text(encoding="utf-8"))
DUR = times["duration"]
mmss = f"{int(DUR // 60)}:{int(DUR % 60):02d}"

# ---------- шапка, адреса, хранилище ----------
R("<title>Горизонт отношений · Часть 3</title>", "<title>Горизонт отношений · Часть 4</title>")
R('<span class="dk-time" id="listen-time">11:51</span>', f'<span class="dk-time" id="listen-time">{mmss}</span>')
R('src="audio/gorizont-chast-3.mp3"', 'src="audio/gorizont-chast-4.mp3"')
R("const PUBLIC_URL = 'https://legendpsy.github.io/relations-essay/gorizont/chast-3.html';",
  "const PUBLIC_URL = 'https://legendpsy.github.io/relations-essay/gorizont/chast-4.html';")
assert s.count("'gorizont-3-") >= 5
s = s.replace("'gorizont-3-", "'gorizont-4-")
R("au.duration || 711", f"au.duration || {round(DUR)}", 4)
R(": 711.216;", f": {DUR};")
s = s.replace("привал в конце третьей ч", "привал в конце четвёртой ч")

# ---------- текст ----------
a = s.index('<main class="col" id="col">') + len('<main class="col" id="col">')
b = s.index("</main>")
body = (ROOT / "src" / "part4.html").read_text(encoding="utf-8")
n_units = body.count('<section class="cp"')
end = (f'\n<section class="cp cp-end" id="r{n_units}" data-cp="{n_units}">\n'
       '<aside class="rest rest-part"><p class="rest-label">Привал · конец четвёртой части</p>'
       '<p>Утро. Лена сидит в поле рядом со своим первым кирпичом и смотрит, как поднимается солнце. '
       'Здесь можно остановиться: она подождёт, а место сохранится само. Когда вернётесь, путь продолжится отсюда.</p>'
       f'<button type="button" class="btn ghost js-copy" data-cp="{n_units}">Скопировать ссылку на это место</button>'
       '<a class="btn ghost" href="./">Все части статьи</a></aside>\n</section>\n')
s = s[:a] + "\n" + body + end + s[b:]
# сноска в конце: мелко, без рамки, в озвучку не входит
R(".col .remark li { break-inside: avoid; }",
  ".col .remark li { break-inside: avoid; }\n.col .remark.fn { margin-top: 1.4rem; padding: 0; border: 0; background: none; }\n.col .remark.fn p { font-size: 13px; color: var(--muted); }")

# ---------- озвучка ----------
s = re.sub(r"const PARA_T = \[.*?\];", lambda m: "const PARA_T = " + json.dumps(times["para"]) + ";", s, count=1)
s = re.sub(r"const WORD_T = \[\[.*?\]\];", lambda m: "const WORD_T = " + json.dumps(times["words"], separators=(",", ":")) + ";", s, count=1)

# ---------- сценарий четвёртой части ----------
a = s.index("// новые сцены третьей части")
b = s.index("const OLD = PART, NEWOF = {};")
s = s[:a] + """// новые сцены третьей части (в этой части не показываются, но рисунки остаются)
S_ALL[120] = {a:'', m:'boat', sp:'shoes'};
S_ALL[122] = {a:'', m:'walk', sp:'couple'};
S_ALL[121] = {a:'', m:'walk', sp:'radio'};
// новые сцены четвёртой части
S_ALL[130] = {a:'Ветра тянут в разные стороны. Она сверяется с компасом и держит свой курс', m:'fly', sp:'gusts'};
S_ALL[133] = {a:'За самолётом тянется пунктир из точек выбора: в каждой она заново решает, как лететь', m:'fly', sp:'trail'};
S_ALL[131] = {a:'Она отпускает бумажный самолётик с запиской «Привет, как ты?»', m:'fly', sp:'note'};
S_ALL[132] = {a:'Поле за деревней. Лена кладёт один кирпич, и на миг проступает весь будущий дом. Она садится рядом: привал', m:[['walk',.3],['stand',.72],['sit',1]], rest:1, tod:'morning', sp:'brick'};
// четвёртая часть: выходит из-под навеса (36), взлёт (37), ветра и компас (130), пунктир выборов (133),
// птицы клином (38), бумажный самолётик (131), просвет в облаках (39), второй самолёт (40, 41), посадка (42),
// звёзды и созвездие (43), деревня зажигает окна (44, 45), рассвет (46), первый кирпич (132)
S_ALL[36] = Object.assign({}, S_ALL[36], {a:'Дождь стихает. Лена выходит из-под навеса и идёт к маленькому аэродрому', m:[['sit',.3],['stand',.42],['walk',1]], rest:0, tod:'overcast', set:{h:1, f:1, b:0, pup:0}, ia:.01});
S_ALL[37] = Object.assign({}, S_ALL[37], {a:'Маленький аэродром. Чувства какие есть, а штурвал в её руках: взлетает'});
S_ALL[38] = Object.assign({}, S_ALL[38], {a:'Птицы летят привычным клином: «мы всегда так летали». Она берёт свой курс'});
S_ALL[39] = Object.assign({}, S_ALL[39], {a:'Узкий просвет между облаками: места мало, но оно есть. Пролетает в него'});
S_ALL[40] = Object.assign({}, S_ALL[40], {a:'Из облака выныривает второй самолёт со своим курсом'});
S_ALL[41] = Object.assign({}, S_ALL[41], {a:'Покачали друг другу крыльями и разошлись: встреча двух выборов'});
S_ALL[42] = Object.assign({}, S_ALL[42], {a:'Приземляется. Отдыхает на крыле', rest:0});
S_ALL[43] = Object.assign({}, S_ALL[43], {a:'Вечер. Звёзды складываются в знакомый Ковш, но название гаснет, а звёзды остаются'});
S_ALL[44] = Object.assign({}, S_ALL[44], {a:'Деревня в сумерках: окна загораются одно за другим'});
S_ALL[45] = Object.assign({}, S_ALL[45], {a:'Ночь. Светятся окна: рядом всегда кто-то есть'});
const PART = [36, 37, 130, 133, 38, 131, 39, 40, 41, 42, 43, 44, 45, 46, 132];
// кнопка в конце пункта k показывает сцену GO_OF[k]; второй самолёт (40, 41) — после пункта 38,
// деревня (44, 45) — после 42, рассвет и кирпич — после 43
const GO_OF = [1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 14];
""" + s[b:]

# ---------- мир: якоря и новые предметы ----------
R("couple: WX(122, .18) + 150,", "couple: WX(122, .18) + 150, brick: WX(132, .3) + 44,")
R("  // ---- попутчик и девушка ----", """  // 132 · первый кирпич и контур будущего дома
  x = sx(A.brick); if (x > -260 && x < LWv + 260) brickHouse(x, Y, i === 132 ? f : (RK(i) > RK(132) ? 1 : 0), tq);
  // ---- попутчик и девушка ----""")
# Лена сидит прямо на траве у кирпича
R("if (m === 'sit' && (i === 9 || i === 21)) m = 'sitLow';", "if (m === 'sit' && (i === 9 || i === 21 || i === 132)) m = 'sitLow';")
# облачная стена (39) показывается заранее уже с бумажного самолётика, который теперь летит перед ней
R("if (i === 39 || (i === 38 && f > .6) || (i === 40 && f < .3)){ const xa", "if (i === 39 || (i === 131 && f > .6) || (i === 40 && f < .3)){ const xa")
# созвездие: звёзды запоминаем, на 43 соединяем пять соседних в «Ковш», потом название гаснет
R("cut(star5(x, y, r * tw, k), '#f3e3b4', .5); C.restore(); }\n  }",
  "cut(star5(x, y, r * tw, k), '#f3e3b4', .5); C.restore(); STP[k] = {x, y}; }\n    if (i === 43) constellation(STP, f, tq);\n  }")
R("  const starA = night > .3", "  const STP = [];\n  const starA = night > .3")
# полёт: ветра и компас, пунктир выборов, бумажный самолётик
R("    } else drawPerson(gx, gy + (m === 'boat' ? 10 : 0) + bob, face, J, LOOK.girl, it, opts);",
  "    } else { const bk = drawWorld.bank || 0; if (bk){ const py = gy - 40 * KG; C.save(); C.translate(gx, py - bk * 60); C.rotate(-bk); C.translate(-gx, -py); }\n      drawPerson(gx, gy + (m === 'boat' ? 10 : 0) + bob, face, J, LOOK.girl, it, opts); if (bk) C.restore(); }")
R("  // девушка\n  if (true){", """  { const gy0 = Y - altS, gx0 = GXL + (camL - camC);
    // 130: компас появляется, самолёт качнётся вверх-вниз (стрелка следом), потом курс ровный;
    // компас держится и на дороге к следующему пункту до её середины
    drawWorld.bank = 0;
    { const tw = ease(win(f, .2, .72)), h = i === 130 ? .2 * Math.sin(TAU * tw) * (1 - .3 * tw) : 0;
      const gap = GAP[RK(133)] || 0, road = i === 133 && f === 0 && gap > 0 ? travel / gap : -1;
      const cv = i === 130 ? easeOut(win(f, .04, .16)) : road >= 0 ? 1 - clamp01((road - .4) / .15) : 0;
      const gu = i === 130 ? f : i === 37 && f > .85 ? 0 : -1;
      if (i === 130) drawWorld.bank = h;
      if (gu >= 0 || cv > 0) gustsAndCompass(gx0, gy0 - h * 60, gu, cv, h, tq); }
    if (i === 133 || (i === 130 && f > .7) || (i === 38 && f < .35)) choiceTrail(gx0, gy0, i === 133 ? f : 1, i === 133 ? 1 : 1 - win(f, 0, .35), tq, sx);
    if (i === 131 || (i === 39 && f < .25)) paperNote(gx0, gy0, i === 131 ? f : 1, tq); }
  // девушка
  if (true){""")
R("function shoeStand(x, y, u, t){", r"""function gustsAndCompass(gx, gy, u, v, h, t){
  // ветра дуют навстречу и вкось; над самолётом компас: пока она поворачивает, стрелка поворачивается вслед, потом стоит на курсе
  if (u >= 0){ const a = Math.sin(Math.PI * clamp01(u * 1.15)) * .9 + .1;
  for (let k = 0; k < 10; k++){ const sp = .35 + hash(k) * .3, L = LWv + 360, ph = ((t * sp + k * 151) % L), wx = LWv + 160 - ph;
    const dy = (k % 3 === 0 ? 1 : k % 3 === 1 ? -1 : 0) * 70, wy = gy - 150 + hash(k + 3) * 190 + dy * (ph / L - .5);
    const p = NP(); p.moveTo(wx, wy); p.quadraticCurveTo(wx + 55, wy - dy * .15 - 9, wx + 115, wy - dy * .25);
    C.save(); C.globalAlpha = a * .85 * Math.sin(Math.PI * ph / L); C.strokeStyle = '#f6eed8'; C.lineWidth = 3.6; C.lineCap = 'round'; C.stroke(p); C.restore(); } }
  if (v <= 0) return;
  const cx = gx + 200, cy = gy - 112 * KG, r = 40 * v;
  const ang = -h * 2.6 + Math.sin(t * .02) * Math.abs(h) * .5;
  C.save(); C.globalAlpha = v; cut(circP(cx, cy, r + 5), '#9a6e1e'); cut(circP(cx, cy, r), '#f3e8cc');
  C.fillStyle = '#2a1f19'; C.textAlign = 'center'; C.font = `${Math.round(16 * v)}px Prata, Georgia, serif`; C.fillText('С', cx, cy - r + 17 * v); C.fillText('Ю', cx, cy + r - 6 * v);
  C.translate(cx, cy); C.rotate(ang);
  cut(polyP([r * .82, 0, 0, -7 * v, -r * .2, 0, 0, 7 * v]), '#c0452f', .5); cut(polyP([-r * .72, 0, 0, -5.5 * v, r * .1, 0, 0, 5.5 * v]), '#5b6870', .5);
  dot(0, 0, 4.5 * v, '#9a6e1e'); C.restore();
}
function choiceTrail(gx, gy, u, a, t, sx){
  // на пути самолёта точки выбора: из каждой две пунктирные ветки. Когда она пролетает точку,
  // выбранная ветка становится яркой, а несостоявшаяся бледнеет
  const cy = gy - 34 * KG;
  C.save(); C.globalAlpha = a; C.lineCap = 'round';
  for (let j = 0; j < 9; j++){ const px = sx(WX(133, .04 + j * .12)); if (px < -160 || px > LWv + 40) continue;
    const up = hash(j + 5) < .5, passed = px < gx - 30, near = clamp01(1 - Math.abs(px - gx) / 260);
    for (const s of [-1, 1]){ const chosen = (s < 0) === up;
      C.setLineDash([9, 9]); C.lineWidth = 3.4;
      C.strokeStyle = passed ? (chosen ? 'rgba(243,214,140,1)' : 'rgba(239,226,194,.2)') : `rgba(246,238,216,${.7 + .3 * near})`;
      C.beginPath(); C.moveTo(px, cy); C.quadraticCurveTo(px + 60, cy + s * 8, px + 120, cy + s * 46); C.stroke(); }
    C.setLineDash([]);
    const pulse = 1 + .18 * near * Math.sin(t * .012); cut(circP(px, cy, 9 * pulse), passed ? '#e3b866' : '#f3e3b4', .6); dot(px, cy, 3.2, '#7a4e12'); }
  C.restore();
}
function paperNote(gx, gy, u, t){
  // бумажный самолётик с запиской улетает вперёд, покачиваясь
  const w = win(u, .25, .98); if (w <= 0) return;
  const px = gx + 40 + ease(w) * LWv * .62, py = gy - 70 * KG - Math.sin(Math.PI * w) * 46 + w * 30 + Math.sin(t * .006) * 4;
  C.save(); C.translate(px, py); C.rotate(-.08 + Math.sin(t * .005) * .08);
  cut(polyP([22, 0, -14, -9, -6, 0]), '#fbf3df', .6); cut(polyP([22, 0, -6, 0, -12, 8]), '#e6dcc2', .6); C.restore();
  const v = clamp01(w * 6) * (1 - win(w, .82, 1)); if (v > 0){ C.save(); C.globalAlpha = v; nameTag(px - 4, py - 22, 'Привет, как ты?', '#c0452f'); C.restore(); }
}
function constellation(P, f, t){
  // пять соседних звёзд соединяются линиями, появляется название «Ковш»; потом название и линии гаснут, а звёзды светят дальше
  const a = easeOut(win(f, .58, .72)) * (1 - win(f, .86, .97)); if (a <= 0 || P.length < 15) return;
  const pick = [0], left = P.slice(0, 15).map((p, k) => k).filter(k => k);
  while (pick.length < 5){ const q = P[pick[pick.length - 1]]; left.sort((m, n) => Math.hypot(P[m].x - q.x, P[m].y - q.y) - Math.hypot(P[n].x - q.x, P[n].y - q.y)); pick.push(left.shift()); }
  C.save(); C.globalAlpha = a * .7; C.strokeStyle = '#f3e3b4'; C.lineWidth = 2; C.setLineDash([5, 5]); C.beginPath();
  pick.forEach((k, n) => n ? C.lineTo(P[k].x, P[k].y) : C.moveTo(P[k].x, P[k].y)); C.stroke(); C.setLineDash([]); C.restore();
  const cx = pick.reduce((s, k) => s + P[k].x, 0) / 5;
  C.save(); C.globalAlpha = a; nameTag(cx, Math.max(...pick.map(k => P[k].y)) + 30, 'Ковш', '#5b6f8a'); C.restore();
}
function brickHouse(x, y, u, t){
  // на пустом поле лежит один кирпич; на миг над ним проступает пунктирный контур будущего дома с тёплыми окнами
  const drop = easeOut(win(u, .32, .4)); if (drop <= 0) return;
  const hx = x + 96, hw = 116;               // дом стоит правее, кирпич — в его левом нижнем углу
  const g = easeOut(win(u, .44, .6)) * (1 - .55 * win(u, .8, .95));
  if (g > 0){ C.save(); C.globalAlpha = g * .9; C.strokeStyle = '#f3e3b4'; C.lineWidth = 3; C.setLineDash([10, 8]);
    C.beginPath(); C.moveTo(hx - hw, y); C.lineTo(hx - hw, y - 160); C.lineTo(hx, y - 252); C.lineTo(hx + hw, y - 160); C.lineTo(hx + hw, y);
    C.moveTo(hx + 50, y - 200); C.lineTo(hx + 50, y - 238); C.lineTo(hx + 78, y - 238); C.lineTo(hx + 78, y - 182); C.stroke();
    C.strokeRect(hx - 24, y - 92, 48, 90); C.setLineDash([]);
    const glow = .55 + .2 * Math.sin(t * .003);
    for (const wx of [-90, 50]){ C.fillStyle = `rgba(243,201,110,${glow * .6})`; C.fillRect(hx + wx, y - 130, 40, 36); C.strokeRect(hx + wx, y - 130, 40, 36); }
    C.restore(); }
  C.save(); C.translate(x, y - 26 * (1 - drop)); C.globalAlpha = drop;
  cut(rectP(-22, -16, 44, 16), '#b5543a', .7); seg(-22, -8, 22, -8, 'rgba(255,220,190,.4)', 1.4); seg(-3, -16, -3, -8, 'rgba(255,220,190,.4)', 1.4); seg(10, -8, 10, 0, 'rgba(255,220,190,.4)', 1.4); C.restore();
}
function shoeStand(x, y, u, t){""")

pathlib.Path(ROOT / "chast-4.html").write_text(s, encoding="utf-8")
print("ok", mmss, n_units)
