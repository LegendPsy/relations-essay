"""Делает gorizont/template.html из основного template.html: новый сценарий первой части,
кнопки в конце пунктов, аудиоплеер, надпись «Это Лена» и новые сцены."""
import re, pathlib
ROOT = pathlib.Path(__file__).parent
s = (ROOT.parent / "template.html").read_text(encoding="utf-8")

def R(a, b, cnt=1):
    global s
    n = s.count(a)
    assert n == cnt, (n, a[:100])
    s = s.replace(a, b)

# ---------- шапка и адреса ----------
R("<title>Отношения нельзя завести</title>", "<title>Горизонт отношений</title>")
R("const PUBLIC_URL = 'https://legendpsy.github.io/relations-essay/';", "const PUBLIC_URL = 'https://legendpsy.github.io/relations-essay/gorizont/';")
R("const STORE = 'relations-essay-v1';", "const STORE = 'gorizont-1-v1';")
R('aria-label="Путешествие девушки: меняется по мере чтения"', 'aria-label="Путешествие Лены: она идёт дальше, когда вы нажимаете «Дальше в путь»"')

# ---------- сценарий первой части: события берём из общей библиотеки сцен ----------
R("const S = [", "const S_ALL = [")
a = s.index("const S_ALL = [")
b = s.index("];", a) + 2
s = s[:b] + """
// новые сцены первой части
S_ALL[100] = {a:'Кафе, где «Цезарь» бывает только одним', m:[['walk',.3],['stand',.72],['walk',1]], sp:'menu'};
S_ALL[101] = {a:'Банка с красивой этикеткой. Внутри почти пусто', m:[['walk',.28],['stand',.8],['walk',1]], sp:'jar2'};
S_ALL[102] = {a:'Мимо проезжает другой путник, машет и едет своей дорогой', m:'walk', sp:'passer'};
S_ALL[103] = {a:'Друг, коллега, прохожий: с другом она обнимается, мимо остальных просто проходит', m:[['walk',.26],['stand',.52],['walk',1]], sp:'people'};
S_ALL[104] = {a:'Они уже идут вместе. Арка «Пара» — только табличка над той же дорогой. На развилке он уходит своей тропинкой, и табличка рвётся', m:[['walk',.7],['stand',.92],['walk',1]], sp:'arch'};
S_ALL[105] = {a:'Качели-балансир с малышом: ровно — не значит одинаково. А когда малыш подпрыгивает, Лену подбрасывает обратно на дорогу', m:[['walk',.2],['stand',1]], sp:'seesaw'};
S_ALL[106] = {a:'Щит «Настоящая пара»: прорезь не по её росту', m:[['walk',.22],['stand',.8],['walk',1]], sp:'board'};
S_ALL[1] = Object.assign({}, S_ALL[1], {set: {h: 1, f: 1}});
// порядок сцен = порядок пунктов текста; кнопка в конце пункта k показывает сцену k+1
const PART = [0, 1, 103, 2, 104, 4, 5, 6, 105, 100, 106, 8, 11, 102, 9];
// какая сцена у кнопки в конце каждого пункта текста (null — без кнопки: «Всегда можно заказать просто Цезарь»)
const GO_OF = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, null, 14];
const OLD = PART, NEWOF = {}; PART.forEach((k, n) => NEWOF[k] = n);
const S = PART.map(k => Object.assign({}, S_ALL[k]));
const RK = k => (NEWOF[k] === undefined ? 1e9 : NEWOF[k]);   // место сцены в этой части
let NI = 0;                                                  // номер текущего пункта
""" + s[b:]

# ---------- мир ----------
R("function WX(k, f){ return worldAt(k, f) * WSC; }", "function WX(k, f){ return NEWOF[k] === undefined ? 1e9 : worldAt(NEWOF[k], f) * WSC; }")
R("const LP = i => LPT * (LMUL[i] || 1);", "const LP = i => LPT * (LMUL[OLD[i]] || 1);")
R("GAP[i] = (i > 0 && TM[i] && i !== 26 && s.sp !== 'buffet') ? (view + (EXTRA[i] || 0)) / 1.3 : 0;",
  "GAP[i] = (i > 0 && TM[i] && OLD[i] !== 26 && s.sp !== 'buffet') ? (view + (EXTRA[OLD[i]] || 0)) / 1.3 : 0;")
R("const g = gaitAt(sceneK, sceneF),", "const g = gaitAt(OLD[sceneK], sceneF),")
R("sceneF += dt * BASE_RATE * (PF[sceneK] || 1) * gf * catchUp / (LMUL[sceneK] || 1);",
  "sceneF += dt * BASE_RATE * (PF[OLD[sceneK]] || 1) * gf * catchUp / (LMUL[OLD[sceneK]] || 1);")
R("const shiftT = (i === 27 || i === 28) ? -LWv * .16 : i === 47 ? LWv * .14 : 0;",
  "const oi = OLD[i]; NI = i;\n  const shiftT = (oi === 27 || oi === 28) ? -LWv * .16 : oi === 47 ? LWv * .14 : 0;")
R("else drawWorld(i, f, st, mode, it, camL, camC, now, tq, wind, vel);", "else drawWorld(oi, f, st, mode, it, camL, camC, now, tq, wind, vel);")

# внутри drawWorld номер сцены — «старый»; сравнения «раньше/позже» переводим в порядок этой части
a = s.index("function drawWorld(")
b = s.index("\nfunction cloudBank(", a)
body = s[a:b]
body = re.sub(r"\bi ([<>]=?) (\d+)", r"RK(i) \1 RK(\2)", body)
body = body.replace("TOD[i]", "TOD[NI]").replace("S[k].ia", "S_ALL[k].ia")
s = s[:a] + body + s[b:]
s = s.replace("buildAnchors(){\n  A = {", "buildAnchors(){\n  A = {\n    menu: WX(100, .3), jar2: WX(101, .28), passer: WX(102, 0), rib: WX(103, .26), colW: WX(103, .76), strW: WX(103, .92), arch: WX(104, .34) + 10, forkW: WX(104, .7) - 52, see: WX(105, .2) + 118, board: WX(106, .22) + 55, hedgeW: WX(2, 0) - 330, jarW: WX(104, 0) - 300,", 1)

# ---------- новые сцены ----------
R("  // ---- попутчик и девушка ----", """  // 100 · кафе с одним меню
  x = sx(A.menu); if (x > -560 && x < LWv + 260){ C.save(); C.translate(x + 250, Y - 4); C.scale(2.1, 2.1); cafeShape(0, 0, tq); C.restore(); C.save(); C.translate(x + 56, Y - 2); C.scale(1.45, 1.45); menuBoard(0, 0, tq); C.restore(); }
  // 101 · банка с красивой этикеткой
  x = sx(A.jar2); if (inView(x)){ benchShape(x + 40, Y - 4); if (!(i === 101 && f >= .3 && f < .8)) jarShape(x + 40, Y - 39, 1.15); }
  // ---- попутчик и девушка ----""")
R("  // птицы клином (38)", """  // 102 · другой путник обгоняет её на велосипеде, машет и уезжает
  if (i === 102){ const rel = lerp(-420, 680, f), wv = rel > -40 && rel < 230; drawPerson(gxp + rel, Y - 4, 1, makePose(wv ? 'bikeStop' : 'bike', {ph: bikeQ * .45 + 1.3, wave: wv, t: tq}), LOOK.boy, {}, {wheel: bikeQ * 1.6, t: tq, wind: wind + .8, scale: .95}); }
  // птицы клином (38)""")
R("    if (i === 29 && f < .4){ o.lookIn = true; }", """    if (i === 29 && f < .4){ o.lookIn = true; }
    if (i === 100 && f > .32 && f < .7) o.tilt = .1;
    if (i === 101 && f >= .3 && f < .8){ o.hold = {x: 17, y: -76}; carry = 'jar'; o.lookIn = f > .4 && f < .7; }
    if (i === 102){ const rel = lerp(-420, 680, f); if (rel > 30 && rel < 260) o.wave = true; }""")
R("  if (o.lookUp) J.tilt = -.28;", "  if (o.lookUp) J.tilt = -.28;\n  if (o.tilt) J.tilt = o.tilt;")
# пикник: на пледе появляется то, что она выбрала сама
R("    if (RK(i) > RK(9) || (i === 9 && f >= .75)) tomato(x + 60, Y + 6, 1.1);",
  """    if (RK(i) > RK(9) || (i === 9 && f >= .75)) tomato(x + 60, Y + 6, 1.1);
    const pk = [['lettuce', -22, .42], ['bread', 22, .52], ['cheese', 86, .62]];
    pk.forEach(([k2, dx, u]) => { if (RK(i) > RK(9) || (i === 9 && f >= u)){ C.save(); C.translate(x + dx, Y + 15); C.scale(.75, .75); FOOD[k2](0, 0); C.restore(); } });""")
# надпись «Это Лена» в небе
R("  layer('mid', .45, .6);", """  layer('mid', .45, .6);
  // «Это Лена…» — бумажный транспарант в небе; появляется при первом запуске, она проходит мимо
  if (started && (NI > 0 || sceneF > .02)){ const drop = i === 0 ? 1 - easeOut(win(f, .04, .6)) : 0; const bxc = LWv * .655 - (camC - (GX0 + 70)) * .42;
    if (bxc > -320 && bxc < LWv + 320) lenaBanner(bxc, 196 - drop * 300 + camY * .3, tq); }""")
R("function cloudBank(x0, x1, edge, dir, t){", r"""function lenaBanner(cx, cy, t){
  const w = 400, h = 194, sw = Math.sin(t * .0011) * .012, top = cy - h / 2;
  C.save(); C.translate(cx, cy); C.rotate(sw); C.translate(-cx, -cy);
  // нитки уходят вверх, за край кадра: транспарант держат воздушные змеи
  for (const sd of [-1, 1]){ C.strokeStyle = 'rgba(80,50,25,.75)'; C.lineWidth = 1.3; C.beginPath(); C.moveTo(cx + sd * (w / 2 - 26), top + 4); C.quadraticCurveTo(cx + sd * (w / 2 + 10), top - 60, cx + sd * (w / 2 - 4), top - 140); C.stroke(); }
  // хвосты ленты
  cut(polyP([cx - w / 2 + 14, cy - 34, cx - w / 2 - 44, cy - 26, cx - w / 2 - 28, cy + 2, cx - w / 2 - 44, cy + 30, cx - w / 2 + 14, cy + 38]), '#a83a29');
  cut(polyP([cx + w / 2 - 14, cy - 34, cx + w / 2 + 44, cy - 26, cx + w / 2 + 28, cy + 2, cx + w / 2 + 44, cy + 30, cx + w / 2 - 14, cy + 38]), '#a83a29');
  // полотно
  const pnl = rrP(cx - w / 2, top, w, h, 12); cut(pnl, '#f7ecd2');
  C.save(); C.clip(pnl);
  fillP(rectP(cx - w / 2, top, w, 12), '#c0452f'); fillP(rectP(cx - w / 2, top + h - 12, w, 12), '#c0452f');
  C.fillStyle = '#d9a33a'; for (let x = cx - w / 2; x < cx + w / 2; x += 14){ C.beginPath(); C.moveTo(x, top + 12); C.lineTo(x + 7, top + 20); C.lineTo(x + 14, top + 12); C.closePath(); C.fill(); C.beginPath(); C.moveTo(x, top + h - 12); C.lineTo(x + 7, top + h - 20); C.lineTo(x + 14, top + h - 12); C.closePath(); C.fill(); }
  C.restore();
  C.setLineDash([5, 5]); C.strokeStyle = 'rgba(192,69,47,.45)'; C.lineWidth = 1.2; C.strokeRect(cx - w / 2 + 12, top + 26, w - 24, h - 52); C.setLineDash([]);
  // текст: каждую строку подгоняем по ширине, чтобы она не вылезала за рамку при любом шрифте
  const inner = w - 76, fit = (txt, size, fam) => { C.font = size + 'px ' + fam; const tw = C.measureText(txt).width; if (tw > inner){ size = size * inner / tw; C.font = size + 'px ' + fam; } return size; };
  C.textBaseline = 'alphabetic';
  fit('Это Лена', 44, 'Prata, Georgia, serif'); const a1 = 'Это ', a2 = 'Лена'; const w1 = C.measureText(a1).width, w2 = C.measureText(a2).width, x0 = cx - (w1 + w2) / 2;
  C.textAlign = 'left'; C.fillStyle = '#2a1f19'; C.fillText(a1, x0, top + 72); C.fillStyle = '#b13f2c'; C.fillText(a2, x0 + w1, top + 72);
  C.textAlign = 'center'; C.fillStyle = '#2a1f19'; fit('Ей предстоит долгий путь', 22, 'Prata, Georgia, serif'); C.fillText('Ей предстоит долгий путь', cx, top + 104);
  C.fillStyle = '#5a3a1e'; const l3 = 'Хотите узнать, куда она идёт?', l4 = 'Дочитайте статью до конца';
  const s3 = Math.min(fit(l3, 19, 'Literata, Georgia, serif'), fit(l4, 19, 'Literata, Georgia, serif'));
  C.font = 'italic ' + s3 + 'px Literata, Georgia, serif'; C.fillText(l3, cx, top + 132); C.fillText(l4, cx, top + 156);
  // цветочки по углам
  for (const sd of [-1, 1]){ flowerPlant(cx + sd * (w / 2 - 34), top + 66, .7, sd < 0 ? '#d94a3a' : '#efe2c2'); }
  C.restore();
  // птички присели на транспарант
  for (const [dx, k] of [[-120, 0], [-96, 1], [140, 2]]){ const bx = cx + dx, by = top - 2 + (k === 1 ? -1 : 0), bob = Math.sin(t * .006 + k * 2) > .85 ? -2 : 0;
    cut(ellP(bx, by - 6 + bob, 7, 5), '#3f6e73', .5); cut(circP(bx + 6, by - 11 + bob, 3.6), '#3f6e73', .5); cut(polyP([bx + 9, by - 12 + bob, bx + 13, by - 11 + bob, bx + 9, by - 10 + bob]), '#d9a33a', .3); dot(bx + 7, by - 12 + bob, .8, '#2a1f19'); cut(polyP([bx - 6, by - 7 + bob, bx - 13, by - 10 + bob, bx - 12, by - 4 + bob]), '#2f5558', .3); }
}
function menuBoard(x, y, t){
  cutSeg(x - 20, y, x - 6, y - 78, '#6e4420', 3); cutSeg(x + 20, y, x + 6, y - 78, '#6e4420', 3);
  const b = rrP(x - 30, y - 92, 60, 64, 4); cut(b, '#6e4420'); fillP(rrP(x - 26, y - 88, 52, 56, 3), '#2f3b35');
  C.textAlign = 'center'; C.fillStyle = '#efe8d8'; C.font = '10px Prata, Georgia, serif'; C.fillText('МЕНЮ', x, y - 74);
  C.font = 'italic 11px Literata, Georgia, serif'; C.fillText('Цезарь', x, y - 58); C.font = '7.5px Literata, Georgia, serif'; C.fillStyle = 'rgba(239,232,216,.75)'; C.fillText('только так', x, y - 47); C.fillText('и не иначе', x, y - 38);
  seg(x - 14, y - 66, x + 14, y - 66, 'rgba(239,232,216,.5)', .7);
}
function cloudBank(x0, x1, edge, dir, t){""")

# ---------- кнопки в конце пунктов ----------
a = s.index("function updateGo(){"); b = s.index("function saveSoon(){")
s = s[:a] + """function updateGo(){
  goBtns.forEach((b, k) => {
    if (!b) return;
    const now = playing && (sceneK === k || (k === targetK && sceneK < k)), next = sceneK === k - 1 && sceneF >= 1 && !playing, again = sceneK === k && sceneF >= 1;
    b.classList.toggle('is-next', next); b.classList.toggle('is-now', now); b.disabled = now;
    b.querySelector('.go-t').textContent = now ? 'Идёт…' : again ? 'Ещё раз' : 'Дальше в путь';
    b.querySelector('.go-ic').textContent = now ? '●' : again ? '↻' : '▶';
  });
}
function buildGo(){
  // кнопка стоит в конце пункта и показывает то, что вы только что прочитали
  secs.forEach((sec, k) => {
    const sc = GO_OF[k]; if (sc == null) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'go'; b.innerHTML = '<span class="go-ic">▶</span><span class="go-t">Дальше в путь</span>';
    b.setAttribute('aria-label', 'Показать, как Лена идёт дальше');
    b.addEventListener('click', () => playPoint(sc));
    const wrap = document.createElement('div'); wrap.className = 'go-wrap'; wrap.appendChild(b); sec.appendChild(wrap); goBtns[sc] = b;
  });
  updateGo();
}
""" + s[b:]
R("document.getElementById('resume-text').textContent = `Вы остановились на точке ${saved.cur[0]} из ${N}. ${secs[saved.cur[0]].querySelector('h1,h2').textContent}`;",
  "const hh = secs[saved.cur[0]] && secs[saved.cur[0]].querySelector('h1,h2'); document.getElementById('resume-text').textContent = `Вы остановились здесь: ${hh ? hh.textContent : 'привал в конце первой части'}`;")

# ---------- аудиоплеер ----------
R("function saveSoon(){", """/* ---------- слушать статью ---------- */
(() => {
  const au = document.getElementById('listen-audio'); if (!au) return;
  const btn = document.getElementById('listen-btn'), ic = btn.querySelector('.li-ic'), seek = document.getElementById('listen-seek'), tm = document.getElementById('listen-time'), sp = document.getElementById('listen-speed');
  const fmt = v => { v = Math.max(0, Math.floor(v || 0)); return Math.floor(v / 60) + ':' + String(v % 60).padStart(2, '0'); };
  let dragging = false; const speeds = [1, 1.25, 1.5, .85]; let si = 0;
  const show = () => { const d = au.duration || 1349; if (!dragging) seek.value = Math.round(1000 * au.currentTime / d); tm.textContent = au.currentTime > 0 ? fmt(au.currentTime) + ' / ' + fmt(d) : fmt(d); seek.style.setProperty('--p', (100 * au.currentTime / d) + '%'); };
  btn.addEventListener('click', () => { if (au.paused) au.play().catch(() => {}); else au.pause(); });
  au.addEventListener('play', () => { ic.textContent = '❚❚'; btn.setAttribute('aria-label', 'Пауза'); document.getElementById('listen').classList.add('on'); });
  au.addEventListener('pause', () => { ic.textContent = '▶'; btn.setAttribute('aria-label', 'Слушать статью'); });
  au.addEventListener('timeupdate', show); au.addEventListener('loadedmetadata', show);
  seek.addEventListener('input', () => { dragging = true; const d = au.duration || 1349; tm.textContent = fmt(seek.value / 1000 * d) + ' / ' + fmt(d); seek.style.setProperty('--p', (seek.value / 10) + '%'); });
  seek.addEventListener('change', () => { const d = au.duration || 1349; au.currentTime = seek.value / 1000 * d; dragging = false; if (au.paused) au.play().catch(() => {}); });
  sp.addEventListener('click', () => { si = (si + 1) % speeds.length; au.playbackRate = speeds[si]; sp.textContent = String(speeds[si]).replace('.', ',') + '×'; });
})();
function saveSoon(){""")

# ---------- оформление ----------
R(".btn.ghost {", """.col ul { margin: 0 0 1em; padding-left: 1.15em; }
.col li { margin: .18em 0; padding-left: .15em; }
.col li::marker { color: var(--accent); }
h2.sub { font-size: 1.24rem; font-style: italic; }
.go-wrap { margin-top: 1.4rem; display: flex; }
.go { margin: 0; }
.cp-end { margin-top: 2rem; }
.listen { display: flex; align-items: center; gap: 12px; margin: -.2rem 0 1.6rem; padding: 10px 12px; border: 1px solid var(--rule); border-radius: 14px; background: var(--ink-2); }
.listen-btn { flex: none; width: 44px; height: 44px; border-radius: 50%; border: 0; background: var(--accent); color: var(--ink); font-size: 14px; cursor: pointer; display: grid; place-items: center; }
.listen-main { flex: 1; min-width: 0; display: grid; gap: 6px; }
.listen-top { display: flex; justify-content: space-between; gap: 10px; font-family: var(--mono); font-size: 11px; letter-spacing: .06em; color: var(--paper); }
.listen-title { text-transform: uppercase; color: var(--paper-hi); }
.listen-time { font-variant-numeric: tabular-nums; color: var(--muted); }
#listen-seek { width: 100%; height: 18px; margin: 0; background: transparent; -webkit-appearance: none; appearance: none; --p: 0%; }
#listen-seek::-webkit-slider-runnable-track { height: 4px; border-radius: 2px; background: linear-gradient(90deg, var(--accent) var(--p), var(--rule) var(--p)); }
#listen-seek::-moz-range-track { height: 4px; border-radius: 2px; background: linear-gradient(90deg, var(--accent) var(--p), var(--rule) var(--p)); }
#listen-seek::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--paper-hi); margin-top: -5px; border: 0; }
#listen-seek::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: var(--paper-hi); border: 0; }
.listen-speed { flex: none; font-family: var(--mono); font-size: 12px; color: var(--paper); background: transparent; border: 1px solid var(--rule); border-radius: 999px; padding: 6px 10px; cursor: pointer; min-width: 52px; }
.listen-btn:focus-visible, .listen-speed:focus-visible, #listen-seek:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.btn.ghost {""")

exec(open(ROOT / "scenes2.py", encoding="utf-8").read())
exec(open(ROOT / "dock.py", encoding="utf-8").read())
exec(open(ROOT / "flag.py", encoding="utf-8").read())
exec(open(ROOT / "cloud.py", encoding="utf-8").read())
exec(open(ROOT / "sync.py", encoding="utf-8").read())
(ROOT / "template.html").write_text(s, encoding="utf-8")
print("template ok")
