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
S_ALL[133] = {a:'Рядом с самолётом летит маленькая птица. Лена протягивает ей крошки, и птица подлетает. Отвернулась — птица отстаёт. Протянула снова — вернулась', m:'fly', sp:'birdie'};
S_ALL[131] = {a:'Она запускает бумажный самолётик «Привет, как ты?». Он летит рядом, потом опускается к горам и долетает до адресата', m:'fly', sp:'note'};
S_ALL[132] = {a:'Поле за деревней. Лена кладёт один кирпич, и на миг проступает весь будущий дом. Она садится рядом: привал', m:[['walk',.3],['stand',.72],['sit',1]], rest:1, tod:'morning', sp:'brick'};
// четвёртая часть: выходит из-под навеса (36), взлёт (37), ветра и компас (130), пунктир выборов (133),
// птицы клином (38), бумажный самолётик (131), просвет в облаках (39), второй самолёт (40, 41), посадка (42),
// звёзды и созвездие (43), деревня зажигает окна (44, 45), рассвет (46), первый кирпич (132)
S_ALL[36] = Object.assign({}, S_ALL[36], {a:'Дождь стихает. Лена выходит из-под навеса и идёт к маленькому аэродрому', m:[['sit',.3],['stand',.42],['walk',1]], rest:0, tod:'overcast', set:{h:1, f:1, b:0, pup:0}, ia:.01});
S_ALL[37] = Object.assign({}, S_ALL[37], {a:'Маленький аэродром. Чувства какие есть, а штурвал в её руках: взлетает'});
S_ALL[38] = Object.assign({}, S_ALL[38], {a:'Лена летит в птичьем клину. Привычный курс ведёт в грозовую тучу: птицы летят туда, как всегда, а она делает мёртвую петлю и уходит к свету своим курсом'});
S_ALL[39] = Object.assign({}, S_ALL[39], {a:'Узкий просвет между облаками: места мало, но оно есть. Пролетает в него'});
S_ALL[40] = Object.assign({}, S_ALL[40], {a:'Из облака выныривает второй самолёт со своим курсом'});
S_ALL[41] = Object.assign({}, S_ALL[41], {a:'Покачали друг другу крыльями и разошлись: встреча двух выборов'});
S_ALL[42] = Object.assign({}, S_ALL[42], {a:'Приземляется. Отдыхает на крыле', rest:0});
S_ALL[43] = Object.assign({}, S_ALL[43], {a:'Вечер. Лена смотрит вверх: звёзды складываются то в Дельфина, то в Лисичку, то в Лиру. Названия гаснут, а звёзды остаются', m:[['walk',.1],['stand',.96],['walk',1]]});
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
  "cut(star5(x, y, r * tw, k), '#f3e3b4', .5); C.restore(); STP[k] = {x, y}; }\n    if (i === 43) constellation(STP, f, tq);\n    if (i === 44 && f === 0 && GAP[RK(44)] > 0) fallingStar(travel / GAP[RK(44)]);\n  }")
R("const n = st.sp === 'stars' && i === 43 ? Math.floor(f * 26) : 26;", "const n = st.sp === 'stars' && i === 43 ? Math.floor(Math.min(1, f * 8) * 26) : 26;")
R("36: 1.8, 37: 1.6};", "36: 1.8, 37: 1.6, 43: 2};")
R("    if (i === 111 && f > .24 && f < .74) o.lookUp = true;", "    if (i === 111 && f > .24 && f < .74) o.lookUp = true;\n    if (i === 43 && f > .1 && f < .96) o.lookUp = true;")
R("  const starA = night > .3", "  const STP = [];\n  const starA = night > .3")
# полёт: ветра и компас, пунктир выборов, бумажный самолётик
R("    } else drawPerson(gx, gy + (m === 'boat' ? 10 : 0) + bob, face, J, LOOK.girl, it, opts);",
  "    } else { const ps = drawWorld.pose; if (ps){ const py = gy - 40 * KG; C.save(); C.translate(gx + ps.dx, py + ps.dy); C.rotate(ps.a); C.translate(-gx, -py); }\n      drawPerson(gx, gy + (m === 'boat' ? 10 : 0) + bob, face, J, LOOK.girl, it, opts); if (ps) C.restore(); }\n    if (drawWorld.tags){ for (const g of drawWorld.tags){ C.save(); C.globalAlpha = g.a; nameTag(g.x, g.y, g.n, '#5b6f8a'); C.restore(); } drawWorld.tags = null; }")
R("  // девушка\n  if (true){", """  { const gy0 = Y - altS, gx0 = GXL + (camL - camC);
    // 130: компас появляется, самолёт качнётся вверх-вниз (стрелка следом), потом курс ровный;
    // компас держится и на дороге к следующему пункту до её середины
    drawWorld.pose = null;
    { const tw = ease(win(f, .2, .72)), h = i === 130 ? .2 * Math.sin(TAU * tw) * (1 - .3 * tw) : 0;
      const gap = GAP[RK(133)] || 0, road = i === 133 && f === 0 && gap > 0 ? travel / gap : -1;
      const cv = i === 130 ? easeOut(win(f, .04, .16)) : road >= 0 ? 1 - clamp01((road - .4) / .15) : 0;
      const gu = i === 130 ? f : i === 37 && f > .85 ? 0 : -1;
      if (i === 130) drawWorld.pose = {dx: 0, dy: -h * 60, a: -h};
      if (gu >= 0 || cv > 0) gustsAndCompass(gx0, gy0 - h * 60, gu, cv, h, tq); }
    if (i === 38){ const R0 = 74, w = ease(win(f, .42, .7)), th = TAU * w, dip = 46 * ease(win(f, .14, .42)), up = 64 * ease(win(f, .66, .84)) * (1 - ease(win(f, .86, 1)));
      drawWorld.pose = {dx: R0 * Math.sin(th) * .55, dy: dip * (1 - w) - R0 * (1 - Math.cos(th)) - up, a: -th + .12 * ease(win(f, .14, .3)) * (1 - w)};
      // дымный след петли: кольцо остаётся в небе и тает
      if (f > .42){ const sv = 1 - win(f, .74, 1), drift = ease(win(f, .7, 1)) * 160; C.save(); C.globalAlpha = .75 * sv; C.strokeStyle = '#fbf6ea'; C.lineWidth = 9; C.lineCap = 'round';
        C.beginPath(); const py = gy0 - 40 * KG + dip; for (let q = 0; q <= w; q += .02){ const a = TAU * q; const x = gx0 - 70 + R0 * Math.sin(a) * .55 - drift - q * 30, y = py - R0 * (1 - Math.cos(a)) + 26; q ? C.lineTo(x, y) : C.moveTo(x, y); } C.stroke(); C.restore(); } }
    // 133: птица рядом, пока Лена к ней тянется; на дороге к птичьему клину (38) она улетает вверх
    { const gap = GAP[RK(38)] || 0, road = i === 38 && f === 0 && gap > 0 ? travel / gap : -1;
      if (i === 133) birdFriend(gx0, gy0, f, -1, tq); else if (road >= 0 && road < .7) birdFriend(gx0, gy0, 1, road, tq); }
    if (i === 131 || (i === 39 && f < .25)) paperNote(gx0, gy0, i === 131 ? f : 1, tq); }
  // девушка
  if (true){""")
R("    if (i === 121 && f > .28 && f < .78){", "    if (i === 131 && f > .1 && f < .2) o.reach = {x: 40, y: -96};\n    if (i === 133 && ((f > .14 && f < .36) || (f > .55 && f < .74))) o.reach = {x: 40, y: -86};\n    if (i === 121 && f > .28 && f < .78){")
R("  if (i === 38){ const bx = LWv * 1.15 - f * LWv * 1.7, by = OFFY + 50;", "  if (i === 38) stormWedge(GXL + (camL - camC), Y - altS, f, tq);\n  if (false){ const bx = 0, by = 0;")
R("function shoeStand(x, y, u, t){", r"""function stormWedge(gx, gy, f, t){
  // 38 · «мы всегда так летали»: Лена летит внутри птичьего клина, привычный курс клина ведёт вниз, в грозовую тучу.
  // Птицы так и летят туда. Лена делает мёртвую петлю, выходит из строя и поднимается к свету своим курсом.
  const dip = 46 * ease(win(f, .14, .42)), go = ease(win(f, .44, .86)), enter = easeOut(win(f, 0, .14));
  // грозовая туча впереди: подплывает, а после петли уходит под неё назад
  const cx = LWv + 220 - ease(win(f, .06, .44)) * LWv * .5 - ease(win(f, .7, 1)) * LWv * .95, cy = gy + 40;
  for (const [dx, dy, r] of [[-120, 20, 54], [-60, -14, 70], [10, -30, 82], [86, -8, 68], [150, 22, 50], [30, 34, 70], [-50, 40, 56], [110, 46, 52]])
    cut(circP(cx + dx, cy + dy, r), '#4b5160', .7);
  for (const [dx, dy, r] of [[-70, -22, 40], [16, -46, 48], [92, -20, 38]]) fillP(circP(cx + dx, cy + dy, r), 'rgba(120,128,146,.45)');
  // молнии
  const fl = Math.floor(t / 420), on = f > .2 && f < .9 && hash(fl) > .55 && (t % 420) < 140;
  if (on){ const lx = cx - 60 + hash(fl + 7) * 160; C.save(); C.strokeStyle = '#ffe9a0'; C.lineWidth = 3.2; C.lineJoin = 'round';
    C.beginPath(); C.moveTo(lx, cy + 50); C.lineTo(lx - 12, cy + 84); C.lineTo(lx + 6, cy + 88); C.lineTo(lx - 10, cy + 130); C.stroke();
    C.globalAlpha = .12; C.fillStyle = '#fff6d0'; C.fillRect(0, 0, LWv, LB); C.restore(); }
  // клин: ведущая птица впереди самолёта, крылья клина уходят назад над ним и под ним
  const lead = {x: gx + 150 + go * LWv * .55, y: gy - 60 * KG + dip + go * 70};
  const fade = 1 - win(f, .76, .88);
  if (fade > 0){ C.save(); C.globalAlpha = fade;
    for (let k = -4; k <= 4; k++){ const o = Math.abs(k), bx = lead.x - o * 46 - (1 - enter) * LWv, by = lead.y + Math.sign(k) * o * 26 + (k < 0 ? -10 : 0);
      bird(bx, by, 2.4, t * .02 + k * .4); }
    C.restore(); }
}
function gustsAndCompass(gx, gy, u, v, h, t){
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
function birdFriend(gx, gy, f, road, t){
  // близость птицы зависит от того, что Лена делает сейчас: протянула крошки — подлетела, отвернулась — отстала
  const c = road >= 0 ? 1 : ease(win(f, .2, .34)), back = road >= 0 ? 0 : ease(win(f, .4, .54)) - ease(win(f, .6, .72));
  const enter = road >= 0 ? 1 : easeOut(win(f, 0, .14)), away = road >= 0 ? ease(win(road, .3, .65)) : 0;
  const nearX = gx + 70, nearY = gy - 108 * KG, farX = gx + 280, farY = gy - 92 * KG, backX = gx - 190, backY = gy - 140 * KG;
  let bx = lerp(lerp(farX, nearX, c), backX, back), by = lerp(lerp(farY, nearY, c), backY, back) + Math.sin(t * .006) * 6;
  bx = lerp(LWv + 60, bx, enter); bx += away * 260; by -= away * 220;
  // крошки летят из её руки к птице
  for (const [a0, a1] of [[.16, .3], [.56, .7]]){ if (road >= 0) break; const w = win(f, a0, a1); if (w <= 0 || w >= 1) continue;
    for (let k = 0; k < 4; k++){ const q = clamp01(w * 1.4 - k * .12); if (q <= 0 || q >= 1) continue;
      const hx = gx + 46, hy = gy - 92 * KG; dot(lerp(hx, bx, q), lerp(hy, by + 6, q) - Math.sin(Math.PI * q) * 30, 2.6, '#e8c77a'); } }
  // сердечко, когда она снова рядом
  for (const [a0, a1] of [[.32, .44], [.7, .82]]){ if (road >= 0) break; const hu = win(f, a0, a1); if (hu <= 0 || hu >= 1) continue;
    C.save(); C.globalAlpha = Math.sin(Math.PI * hu); const hx = (bx + gx + 46) / 2, hy = by - 26 - hu * 24, p = NP(); p.moveTo(hx, hy + 9); p.bezierCurveTo(hx - 15, hy - 3, hx - 8, hy - 15, hx, hy - 7); p.bezierCurveTo(hx + 8, hy - 15, hx + 15, hy - 3, hx, hy + 9); cut(p, '#d94a3a', .6); C.restore(); }
  // сама птица: смотрит на Лену, когда рядом, и вперёд, когда отстала или улетает
  const close = c * (1 - back), face = close > .6 && away < .2 ? -1 : 1, flap = Math.sin(t * (close > .6 ? .03 : .045));
  C.save(); C.translate(bx, by); C.scale(face * 1.8, 1.8);
  cut(polyP([-9, -1, -17, -6, -16, 2]), '#7a3a2a', .5);                              // хвост
  cut(ellP(0, 0, 11, 7.5), '#9c4a34', .6); cut(ellP(3, 2.5, 6.5, 4.5), '#e98a5a');       // тело и грудка
  cut(circP(8, -6, 5.5), '#9c4a34', .6); dot(10, -7, 1.3, '#1d1612');                    // голова и глаз
  cut(polyP([13, -6.5, 18, -5, 13, -3.5]), '#e3b866', .4);                                // клюв
  C.save(); C.translate(-1, -3); C.rotate(-.5 + flap * .7); cut(polyP([0, 0, -13, -9, -4, 1]), '#7a3a2a', .5); C.restore();   // крыло
  C.restore();
}
function paperNote(gx, gy, u, t){
  // бумажный самолётик «Привет, как ты?»: Лена запускает его, он какое-то время летит рядом с ней,
  // потом отстаёт влево, уменьшается и опускается к горам; когда долетел до адресата, вспыхивают звёздочки
  const launch = win(u, .12, .22); if (launch <= 0) return;
  const hx = gx + 46, hy = gy - 92 * KG;
  const sideX = gx + 150 + Math.sin(t * .0021) * 36, sideY = gy - 96 * KG + Math.cos(t * .0017) * 18;   // кружит рядом
  const tx = gx - 120, ty = gy + 96;                                                                       // горы внизу слева
  const go = ease(win(u, .55, .88));
  let px = lerp(hx, sideX, easeOut(launch)), py = lerp(hy, sideY, easeOut(launch)) - Math.sin(Math.PI * launch) * 24;
  const gox = ease(win(u, .62, .88)), goy = ease(win(u, .55, .74)); px = lerp(px, tx, gox); py = lerp(py, ty, goy);
  const sc = lerp(1.4, .45, go), arrive = win(u, .88, 1);
  if (arrive <= 0){ const dir = go > 0 && go < 1 ? Math.PI + .35 : 0;
    C.save(); C.translate(px, py); C.rotate(dir - .08 + Math.sin(t * .005) * .1); C.scale(sc, sc);
    cut(polyP([22, 0, -14, -9, -6, 0]), '#fbf3df', .6); cut(polyP([22, 0, -6, 0, -12, 8]), '#e6dcc2', .6); C.restore();
    const v = clamp01(launch * 3) * (1 - win(u, .5, .6)); if (v > 0){ C.save(); C.globalAlpha = v; nameTag(px - 4, py - 26, 'Привет, как ты?', '#c0452f'); C.restore(); } }
  else {
    // долетел: вспышка и разлетающиеся звёздочки
    C.save(); C.globalAlpha = 1 - arrive;
    fillP(circP(tx, ty, 10 + arrive * 40), 'rgba(255,240,190,.6)'); C.strokeStyle = '#ffe39a'; C.lineWidth = 3; C.beginPath(); C.arc(tx, ty, 14 + arrive * 70, 0, TAU); C.stroke();
    for (let k = 0; k < 9; k++){ const a = k / 9 * TAU + .3, r = 12 + arrive * 80; cut(star5(tx + Math.cos(a) * r, ty + Math.sin(a) * r * .8, 9 * (1 - arrive * .4), k), '#f2b632', .8); }
    C.restore(); }
}
function constellation(P, f, t){
  // Лена по очереди замечает три не самых известных созвездия: проступают звёзды, их соединяют линии,
  // появляется название; потом название и линии гаснут, а звёзды светят дальше
  const CS = [
    {n: 'Дельфин', x: LWv * .56, y: OFFY + 84, s: 4, p: [[0, 0], [14, -9], [27, -2], [16, 9], [36, 14]], l: [[0, 1], [1, 2], [2, 3], [3, 0], [2, 4]]},
    {n: 'Лисичка', x: LWv * .46, y: OFFY + 80, s: 4, p: [[0, 6], [18, -4], [34, 6], [52, -2], [64, 8]], l: [[0, 1], [1, 2], [2, 3], [3, 4]]},
    {n: 'Лира', x: LWv * .62, y: OFFY + 52, s: 3.6, p: [[0, 0], [8, 12], [18, 10], [12, 30], [24, 28]], l: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4]]}];
  const wins = [[.12, .4], [.4, .68], [.68, .96]]; drawWorld.tags = [];
  CS.forEach((c, n) => { const [a0, a1] = wins[n], a = easeOut(win(f, a0, a0 + .08)) * (1 - win(f, a1 - .06, a1)), sa = Math.max(a, n === 0 ? 0 : 0);
    const pts = c.p.map(([x, y]) => ({x: c.x + x * c.s, y: c.y + y * c.s}));
    // звёзды созвездия остаются и после того, как линии погасли
    const st = easeOut(win(f, a0, a0 + .05));
    C.save(); C.globalAlpha = st; pts.forEach((q, k) => cut(star5(q.x, q.y, 5.5 + (k === 0 ? 2 : 0), k), '#fff1c0', .5)); C.restore();
    if (a <= 0) return;
    C.save(); C.globalAlpha = a * .85; C.strokeStyle = '#f3e3b4'; C.lineWidth = 3; C.setLineDash([7, 6]); C.beginPath();
    for (const [u, v] of c.l){ C.moveTo(pts[u].x, pts[u].y); C.lineTo(pts[v].x, pts[v].y); } C.stroke(); C.setLineDash([]);
    for (const q of pts){ C.globalAlpha = a * (.35 + .25 * Math.sin(t * .006 + q.x)); fillP(circP(q.x, q.y, 10), '#fff3c4'); }
    C.restore();
    const cx = pts.reduce((s, q) => s + q.x, 0) / pts.length, cy = Math.max(...pts.map(q => q.y));
    drawWorld.tags.push({x: cx, y: cy + 34, n: c.n, a}); });
}
function fallingStar(u){
  // падающая звезда: яркая точка с хвостом пересекает небо и гаснет
  const w = win(u, .2, .5); if (w <= 0 || w >= 1) return;
  const x0 = LWv * .85, y0 = OFFY + 30, x = x0 - w * LWv * .55, y = y0 + w * 90;
  C.save(); C.globalAlpha = Math.sin(Math.PI * w); const g = C.createLinearGradient(x, y, x + 120, y - 20);
  g.addColorStop(0, 'rgba(255,246,214,1)'); g.addColorStop(1, 'rgba(255,246,214,0)'); C.strokeStyle = g; C.lineWidth = 3; C.lineCap = 'round';
  C.beginPath(); C.moveTo(x, y); C.lineTo(x + 120, y - 20); C.stroke(); cut(star5(x, y, 6, 0), '#fff6d6', .4); C.restore();
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
