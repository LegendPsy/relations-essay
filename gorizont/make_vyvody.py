"""Собирает gorizont/vyvody.html («Вместо вывода») из готовой четвёртой части (chast-4.html):
текст (src/vyvody.html), озвучка и разметка слов (src/vyvody-times.json), свой сценарий Лены:
с рюкзаком через деревню на рассвете к ресторану, шведский стол до неба, столик у окна, где над двумя
людьми сменяются и гаснут названия их отношений; на этом статья заканчивается.
Запуск: python3 make_vyvody.py
"""
import json, pathlib, re
ROOT = pathlib.Path(__file__).parent
s = (ROOT / "chast-4.html").read_text(encoding="utf-8")


def R(a, b, cnt=1):
    global s
    n = s.count(a)
    assert n == cnt, (n, a[:120])
    s = s.replace(a, b)


times = json.loads((ROOT / "src" / "vyvody-times.json").read_text(encoding="utf-8"))
DUR = times["duration"]
mmss = f"{int(DUR // 60)}:{int(DUR % 60):02d}"

# ---------- шапка, адреса, хранилище ----------
R("<title>Горизонт отношений · Часть 4</title>", "<title>Горизонт отношений · Вместо вывода</title>")
R('<span class="dk-time" id="listen-time">15:45</span>', f'<span class="dk-time" id="listen-time">{mmss}</span>')
R('src="audio/gorizont-chast-4.mp3"', 'src="audio/gorizont-vyvody.mp3"')
R("const PUBLIC_URL = 'https://legendpsy.github.io/relations-essay/gorizont/chast-4.html';",
  "const PUBLIC_URL = 'https://legendpsy.github.io/relations-essay/gorizont/vyvody.html';")
assert s.count("'gorizont-4-") >= 5
s = s.replace("'gorizont-4-", "'gorizont-5-")
R("au.duration || 946", f"au.duration || {round(DUR)}", 4)
R(": 945.792;", f": {DUR};")
s = s.replace("привал в конце четвёртой части", "конец статьи")

# ---------- текст ----------
a = s.index('<main class="col" id="col">') + len('<main class="col" id="col">')
b = s.index("</main>")
body = (ROOT / "src" / "vyvody.html").read_text(encoding="utf-8")
n_units = body.count('<section class="cp"')
end = (f'\n<section class="cp cp-end" id="r{n_units}" data-cp="{n_units}">\n'
       '<aside class="rest rest-part"><p class="rest-label">Конец статьи</p>'
       '<p>Спасибо за время, проведённое здесь со мной, и за проявленный интерес. '
       'Желаю уютно провести время наедине с собой. До будущих встреч.</p>'
       f'<button type="button" class="btn ghost js-copy" data-cp="{n_units}">Скопировать ссылку на это место</button>'
       '<a class="btn ghost" href="./">Все части статьи</a></aside>\n</section>\n')
s = s[:a] + "\n" + body + end + s[b:]
R(".col .remark li { break-inside: avoid; }",
  ".col .remark li { break-inside: avoid; }\n.col .remark.qs ul { columns: 1; }\n"
  ".col .remark p.q-cat { margin: 1rem 0 .3rem; font-family: var(--mono); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--accent); }\n"
  ".col .remark.you { border-style: solid; background: rgba(227,184,102,.12); }")

# ---------- озвучка ----------
s = re.sub(r"const PARA_T = \[.*?\];", lambda m: "const PARA_T = " + json.dumps(times["para"]) + ";", s, count=1)
s = re.sub(r"const WORD_T = \[\[.*?\]\];", lambda m: "const WORD_T = " + json.dumps(times["words"], separators=(",", ":")) + ";", s, count=1)

# ---------- сценарий ----------
R("const PART = [36, 37, 130, 133, 38, 131, 39, 40, 41, 42, 43, 44, 45, 46, 132];", """// «Вместо вывода»: рассвет в деревне (46), ресторан (47), шведский стол (48), столик у окна (140) — последняя сцена
S_ALL[46] = Object.assign({}, S_ALL[46], {a:'Рассвет. Лена с рюкзаком идёт через деревню', m:'walk', tod:'dawn', set:{h:1, f:1, b:0, pup:0}, ia:.01});
S_ALL[47] = Object.assign({}, S_ALL[47], {rest:0});
S_ALL[140] = {a:'Столик у окна. Над Леной и её собеседником сменяются названия: друг, партнёр, знакомый… Потом названия гаснут, и остаются просто двое за столом', m:'sit', rest:1, sp:'table'};
const PART = [46, 47, 48, 140];""")
# столик — последняя сцена статьи: после личного вопроса кнопки «Дальше в путь» нет
R("const GO_OF = [1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 14];", "const GO_OF = [2, 3, null];")
s, _n = re.subn(r"if \(au\.currentTime > \d+\) au\.currentTime = 0;", f"if (au.currentTime > {round(max(max(w) for w in times['words'] if w) + 3)}) au.currentTime = 0;", s); assert _n == 1   # «Начать путь» после конца записи — с начала
# столик рисуется отдельной сценой, как шведский стол
R("  if (st.sp === 'buffet') drawBuffetScene(f, now, tq, it, wind);", "  if (st.sp === 'buffet') drawBuffetScene(f, now, tq, it, wind);\n  else if (st.sp === 'table') drawTableScene(oi, f, now, tq, it);")
R("s.sp !== 'buffet') ? (view", "s.sp !== 'buffet' && s.sp !== 'table') ? (view")
# тарелки «для вас» у шведского стола нет
R("  if (f > .88){ const u = easeOut(win(f, .88, .96)); const px = LWv * .64, py = LB + 60 - u * 140;", "  if (false){ const u = 0; const px = 0, py = 0;")
# рюкзак за спиной по дороге к ресторану
R("    if (i === 132 && f >= .91) backpack(", "    if (i === 46 || (i === 47 && f < .62)) backpack(gx0 - 12 * KG, gy0 - 64 * KG, KG);\n    if (i === 132 && f >= .91) backpack(")
R("function drawBuffetScene(f, now, tq, it, wind){", pathlib.Path(ROOT / "src" / "table-scene.js").read_text(encoding="utf-8") + "function drawBuffetScene(f, now, tq, it, wind){")

pathlib.Path(ROOT / "vyvody.html").write_text(s, encoding="utf-8")
print("ok", mmss, n_units)
