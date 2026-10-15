"""Собирает gorizont/celikom.html — «Вся статья целиком»: все пять частей одной страницей, одним потоком.

Что делает:
  • текст всех частей подряд; привалы между частями заменены тихим заголовком «Часть вторая» и т. д.,
    без кнопок «Дальше» и без остановки чтения;
  • одна запись audio/gorizont-celikom.mp3: части склеены, между ними короткая музыкальная пауза
    (хвост музыки прошлой части плавно перетекает во вступление следующей);
  • Лена идёт по одному непрерывному миру: на привале в конце части она садится, пока звучит музыка,
    и встаёт, когда начинается следующая часть. Сцена, с которой начиналась каждая следующая часть,
    получает свой номер (209, 221, 236, 246), чтобы не путаться с привалом той же точки.

Берёт готовые страницы chast-1..4.html и vyvody.html (код сцен — из vyvody.html, в нём есть все рисунки).
Запуск: python3 make_celikom.py            (звук пересобирается, только если его нет)
        python3 make_celikom.py --audio    (пересобрать и звук)
"""
import json, pathlib, re, subprocess, sys
ROOT = pathlib.Path(__file__).parent
PAGES = ["chast-1.html", "chast-2.html", "chast-3.html", "chast-4.html", "vyvody.html"]
MP3 = ["gorizont-chast-1.mp3", "gorizont-chast-2.mp3", "gorizont-chast-3.mp3", "gorizont-chast-4.mp3", "gorizont-vyvody.mp3"]
PART_NAMES = ["Часть первая", "Часть вторая", "Часть третья", "Часть четвёртая", "Вместо вывода"]
RENAME_FIRST = [None, (9, 209), (21, 221), (36, 236), (46, 246)]   # сцена, которой начинается часть → новый номер
XF = 2.0          # длина перетекания музыки между частями, с
TAIL = 5.5        # сколько музыки оставить после последнего слова части, с
LEAD = 0.85       # тишина в начале каждой записи, её пропускаем

src = {p: (ROOT / p).read_text(encoding="utf-8") for p in PAGES}


def grab(s, rx):
    return json.loads(re.search(rx, s, re.S).group(1))


def dur(p):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                         capture_output=True, text=True, check=True).stdout
    return float(out)


# ---------- данные частей ----------
parts = []
for n, p in enumerate(PAGES):
    s = src[p]
    W = grab(s, r"const WORD_T = (\[\[.*?\]\]);")
    P = grab(s, r"const PARA_T = (\[.*?\]);")
    PART = grab(s, r"const PART = (\[.*?\]);")
    GO = json.loads(re.search(r"const GO_OF = (\[.*?\]);", s).group(1).replace("null", "null"))
    a = s.index('<main class="col" id="col">') + len('<main class="col" id="col">')
    b = s.index("</main>")
    body = s[a:b]
    body = body[:body.index('<section class="cp cp-end"')]           # привал с кнопками не нужен
    last = max(t for w in W for t in w)
    D = dur(ROOT / "audio" / MP3[n])
    parts.append(dict(W=W, P=P, PART=PART, GO=GO, body=body, last=last, D=D))

# ---------- склейка звука ----------
segs = []
off = 0.0
for n, q in enumerate(parts):
    s0 = 0.0 if n == 0 else LEAD
    e0 = q["D"] if n == len(parts) - 1 else min(q["D"], q["last"] + TAIL)
    q["s0"], q["e0"], q["off"] = s0, e0, off
    segs.append((s0, e0))
    off += (e0 - s0) - XF
TOTAL = parts[-1]["off"] + parts[-1]["e0"] - parts[-1]["s0"]
mp = lambda n, t: round(parts[n]["off"] + t - parts[n]["s0"], 2)

out_mp3 = ROOT / "audio" / "gorizont-celikom.mp3"
if "--audio" in sys.argv or not out_mp3.exists():
    inp, fl = [], []
    for n, (a, b) in enumerate(segs):
        inp += ["-i", str(ROOT / "audio" / MP3[n])]
        fl.append(f"[{n}:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS[s{n}]")
    cur = "s0"
    for n in range(1, len(segs)):
        fl.append(f"[{cur}][s{n}]acrossfade=d={XF}:c1=qsin:c2=qsin[x{n}]")
        cur = f"x{n}"
    subprocess.run(["ffmpeg", "-y", "-v", "error", *inp, "-filter_complex", ";".join(fl), "-map", f"[{cur}]",
                    "-ar", "48000", "-ac", "2", "-c:a", "libmp3lame", "-b:a", "128k", str(out_mp3)], check=True)
real = dur(out_mp3)
assert abs(real - TOTAL) < 0.3, (real, TOTAL)

# ---------- текст ----------
TOK = re.compile(r"[^\s/—–-]+")
ntok = lambda txt: sum(1 for m in TOK.finditer(txt) if re.search(r"[0-9A-Za-zА-Яа-яЁё]", m.group(0)))
sections, PARA_T, WORD_T, PART, GO_OF, SEG_END = [], [], [], [], [], []
REN = {}
for n, q in enumerate(parts):
    body = q["body"]
    # заголовок части: у первой — название статьи, у остальных — тихий разделитель
    h1 = re.search(r'<h1 id="essay-title">(.*?)</h1>', body).group(0)
    new = (f'<h1 id="essay-title" data-part="{PART_NAMES[0]}">Горизонт отношений</h1>' if n == 0
           else f'<h1 class="part-h">{PART_NAMES[n]}</h1>')
    body = body.replace(h1, new, 1)
    # абзацы с озвучкой идут в том же порядке, что и в части; первый из них — заголовок
    P = [mp(n, t) for t in q["P"]]
    W = [[mp(n, t) for t in w] for w in q["W"]]
    W[0] = [P[0]] * ntok(re.sub(r"<[^>]+>", " ", new))
    # сцены: первая сцена части получает свой номер
    part = list(q["PART"])
    if RENAME_FIRST[n]:
        old, nw = RENAME_FIRST[n]
        assert part[0] == old, (n, part[0])
        part[0] = nw
    s_off, u_off = len(PART), len(sections)
    if n > 0:
        # привал прошлой части заканчивается, когда стихает голос; Лена встаёт к началу следующей части
        SEG_END.append([s_off - 1, round(mp(n - 1, parts[n - 1]["last"]) + 2.7, 2)])
        SEG_END.append([s_off, round(P[0] + .2, 2)])
    PART += part
    GO_OF += [None if g is None else g + s_off for g in q["GO"]]
    secs = re.findall(r'<section class="cp"[^>]*>.*?</section>', body, re.S)
    for sec in secs:
        k = len(sections)
        sec = re.sub(r'<section class="cp" id="r\d+" data-cp="\d+">', f'<section class="cp" id="r{k}" data-cp="{k}">', sec, count=1)
        sections.append(sec)
    PARA_T += P
    WORD_T += W

n_units = len(sections)
END_SPEECH = mp(len(parts) - 1, parts[-1]["last"])
end = (f'\n<section class="cp cp-end" id="r{n_units}" data-cp="{n_units}">\n'
       '<aside class="rest rest-part"><p class="rest-label">Конец статьи</p>'
       '<p>Спасибо за время, проведённое здесь со мной, и за проявленный интерес. '
       'Желаю уютно провести время наедине с собой. До будущих встреч.</p>'
       f'<button type="button" class="btn ghost js-copy" data-cp="{n_units}">Скопировать ссылку на это место</button>'
       '<a class="btn ghost" href="./">На заглавную</a></aside>\n</section>\n')

# ---------- страница: берём «Вместо вывода» и заменяем всё, что относится к одной части ----------
s = src["vyvody.html"]


def R(a, b, cnt=1):
    global s
    c = s.count(a)
    assert c == cnt, (c, a[:120])
    s = s.replace(a, b)


fmt = lambda v: f"{int(v // 60)}:{int(v % 60):02d}"
R("<title>Горизонт отношений · Вместо вывода</title>",
  '<title>Горизонт отношений · Вся статья</title>\n<meta name="description" content="Вся статья целиком: текст, авторская озвучка и путь Лены одним потоком.">')
s, c = re.subn(r'<span class="dk-time" id="listen-time">[\d:]+</span>', f'<span class="dk-time" id="listen-time">{fmt(TOTAL)}</span>', s); assert c == 1
R('src="audio/gorizont-vyvody.mp3"', 'src="audio/gorizont-celikom.mp3"')
R("const PUBLIC_URL = 'https://legendpsy.github.io/relations-essay/gorizont/vyvody.html';",
  "const PUBLIC_URL = 'https://legendpsy.github.io/relations-essay/gorizont/celikom.html';")
s = s.replace("'gorizont-5-", "'gorizont-all-")
s, c = re.subn(r"au\.duration \|\| \d+", f"au.duration || {round(TOTAL)}", s); assert c == 4
s, c = re.subn(r"\? au\.duration : [\d.]+;", f"? au.duration : {round(TOTAL, 3)};", s); assert c == 1
s, c = re.subn(r"if \(au\.currentTime > \d+\) au\.currentTime = 0;", f"if (au.currentTime > {round(END_SPEECH + 3)}) au.currentTime = 0;", s); assert c == 1
R("const hm = /^#r(\\d{1,2})$/.exec(location.hash);", "const hm = /^#r(\\d{1,3})$/.exec(location.hash);")

a = s.index('<main class="col" id="col">') + len('<main class="col" id="col">')
b = s.index("</main>")
s = s[:a] + "\n" + "\n".join(sections) + end + s[b:]
R(".cp-end { margin-top: 2rem; }", """.cp-end { margin-top: 2rem; }
/* «Вся статья целиком»: заголовки частей — тихие разделители, чтение не прерывается */
#essay-title[data-part]::after { content: attr(data-part); display: block; margin-top: .9rem; font-family: var(--mono); font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: var(--accent); }
.col h1.part-h { margin: 1.2rem 0 1.6rem; text-align: center; font-size: 1.5rem; color: var(--head); }
.col h1.part-h::before { content: '· · ·'; display: block; margin-bottom: 1.1rem; font-size: 1rem; letter-spacing: .5em; color: var(--muted); }
.col h1.part-h.now-reading, .col h1.part-h .w.said { color: var(--head); }""")

s = re.sub(r"const PARA_T = \[.*?\];", lambda m: "const PARA_T = " + json.dumps(PARA_T) + ";", s, count=1)
s = re.sub(r"const WORD_T = \[\[.*?\]\];", lambda m: "const WORD_T = " + json.dumps(WORD_T, separators=(",", ":")) + ";", s, count=1)

# ---------- сценарий ----------
def region(p, start):
    t = src[p]
    return t[t.index(start):t.index("const PART = [")]


p2 = region("chast-2.html", "// новые сцены второй части")
p2 = p2.replace("S_ALL[9] = Object.assign({}, S_ALL[9],", "S_ALL[209] = Object.assign({}, S_ALL[9],")
p3 = region("chast-3.html", "// новые сцены третьей части")
p3 = p3.replace("S_ALL[21] = Object.assign({}, S_ALL[21],", "S_ALL[221] = Object.assign({}, S_ALL[21],")
p4 = region("chast-4.html", "// новые сцены четвёртой части")
p4 = p4.replace("S_ALL[36] = Object.assign({}, S_ALL[36],", "S_ALL[236] = Object.assign({}, S_ALL[36],")
p5 = region("vyvody.html", "// «Вместо вывода»")
p5 = p5.replace("S_ALL[46] = Object.assign({}, S_ALL[46], {a:'Рассвет. Лена с рюкзаком идёт через деревню', m:'walk', tod:'dawn',",
                "S_ALL[246] = Object.assign({}, S_ALL[46], {a:'Утро. Лена с рюкзаком и кирпичом идёт дальше', m:'walk', tod:'morning',")
for t, k in ((p2, "S_ALL[209]"), (p3, "S_ALL[221]"), (p4, "S_ALL[236]"), (p5, "S_ALL[246]")):
    assert k in t, k
a = s.index("// новые сцены третьей части (в этой части не показываются")
b = s.index("const OLD = PART, NEWOF = {};")
s = s[:a] + ("// «Вся статья целиком»: сцены всех частей подряд, в одном мире. Сцена, которой начиналась каждая\n"
             "// следующая часть (Лена встаёт после привала), получила свой номер: 209, 221, 236, 246\n"
             + p2 + p3 + p4 + p5 +
             f"const PART = {json.dumps(PART)};\n"
             "// кнопка в конце пункта k показывает сцену GO_OF[k]\n"
             f"const GO_OF = {json.dumps(GO_OF)};\n"
             "// где кончаются сцены на стыке частей: привал — когда стихает голос, подъём — к началу следующей части\n"
             f"const SEG_END = {json.dumps(SEG_END)};\n") + s[b:]
assert len(set(PART)) == len(PART), "сцены не должны повторяться"
R("    let a = 0;\n    for (let s = 0; s <= N; s++){", "    for (const [sc, t] of SEG_END) ends[sc] = t;\n    let a = 0;\n    for (let s = 0; s <= N; s++){")

# где сценам на стыке нужно столько же места и времени, сколько в своих частях
R("36: 1.8, 37: 1.6, 43: 2, 132: 3.5};", "36: 1.8, 37: 1.6, 43: 2, 132: 3.5, 221: 1.2, 236: 1.8};")
R("12: .6, 21: .8, 47: .55, 48: .28};", "12: .6, 21: .8, 221: .8, 47: .55, 48: .28};")

# то, что в частях 2–5 было отключено, потому что они начинались не с начала пути
R("  const camC = camL;          // в начале камера стоит, а героиня выходит из-за края",
  "  const camC = Math.max(camL, GX0 + 70);          // в начале камера стоит, а героиня выходит из-за края")
R("  if (false){ const drop = i === 0 ?", "  if (started && (NI > 0 || sceneF > .02)){ const drop = i === 0 ?")
R("    if (i === 9 && f < .4){ basketShape(x + 40, Y - 22, 2); }\n    tomato(x + 60, Y + 6, 1.1);",
  "    if (i === 9 && f >= .12){ basketShape(x + 40, Y - 22, f < .75 ? 1 : 2); }\n"
  "    if (i === 209 && f < .4){ basketShape(x + 40, Y - 22, 2); }\n"
  "    if (RK(i) > RK(9) || (i === 9 && f >= .75)) tomato(x + 60, Y + 6, 1.1);")
R("pk.forEach(([k2, dx, u]) => { if (true){", "pk.forEach(([k2, dx, u]) => { if (RK(i) > RK(9) || (i === 9 && f >= u)){")
R("    if (i === 9 && f > .3 && f < .7){ const hop", "    if ((i === 9 || i === 209) && f > .3 && f < .7){ const hop")
R("  // девушка\n  if (true){", "  // девушка\n  if (started){")
R("    if (m === 'sit' && (i === 9 || i === 21)) m = 'sitLow';\n    if (i === 9 && f < .4) carry = null;",
  "    if (m === 'sit' && (i === 9 || i === 21 || i === 209 || i === 221)) m = 'sitLow';\n"
  "    if ((i === 9 && f >= .12) || (i === 209 && f < .4)) carry = null;")
R("if (i === 21 && f < .55) bikeParked(", "if ((i === 21 && f >= .12) || (i === 221 && f < .55)) bikeParked(")
R("  if (night > .3){ C.save(); C.globalCompositeOperation = 'lighter'; flies.forEach(",
  "  if (night > .3 || i === 21){ C.save(); C.globalCompositeOperation = 'lighter'; flies.forEach(")
R("    if (i === 46 || (i === 47 && f < .62)) backpack(", "    if (i === 246 || (i === 47 && f < .62)) backpack(")

(ROOT / "celikom.html").write_text(s, encoding="utf-8")
(ROOT / "src" / "celikom-times.json").write_text(json.dumps(
    {"duration": round(TOTAL, 3), "parts": [{"offset": round(q["off"], 3), "trim": [q["s0"], q["e0"]]} for q in parts],
     "seg_end": SEG_END}, ensure_ascii=False, indent=1), encoding="utf-8")
print("ok", fmt(TOTAL), "пунктов", n_units, "сцен", len(PART), "абзацев", len(PARA_T))
