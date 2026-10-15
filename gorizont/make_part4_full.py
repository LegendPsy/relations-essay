"""Собирает gorizont/chast-4.html — четвёртую часть вместе с «Вместо вывода», одной страницей и одной записью.

Отдельной пятой части больше нет: после последнего абзаца четвёртой части идёт раздел «Вместо вывода».
  • звук: audio/gorizont-chast-4-full.mp3. Из записи четвёртой части убрана музыкальная концовка,
    из записи «Вместо вывода» — музыкальное вступление; между ними короткая пауза, речь идёт дальше.
    В самом конце остаётся концовка «Вместо вывода». Сами записи не меняются;
  • сцены: привала у лавочки больше нет (132 без rest). Лена надевает рюкзак и идёт дальше (246),
    ресторан (47), шведский стол (48), последняя сцена — столик у окна (140);
  • в конце рамка «Конец статьи» с прощанием и кнопкой «Все части статьи».

Берёт src/chast-4-solo.html (make_part4.py) и src/vyvody-solo.html (make_vyvody.py); код сцен — из второй.
Запуск: python3 make_part4_full.py            (звук пересобирается, только если его нет)
        python3 make_part4_full.py --audio    (пересобрать и звук)
После него, как всегда, python3 fix_all.py.
"""
import json, pathlib, re, subprocess, sys
ROOT = pathlib.Path(__file__).parent
PAGES = ["src/chast-4-solo.html", "src/vyvody-solo.html"]
MP3 = ["gorizont-chast-4.mp3", "gorizont-vyvody.mp3"]
CUT4 = 938.30     # здесь в записи четвёртой части кончается речь и начинается музыка концовки
CUT5 = 6.61       # здесь в записи «Вместо вывода» кончается музыка вступления и начинается речь
GAP = 1.2         # пауза между ними, как между абзацами

src = {p: (ROOT / p).read_text(encoding="utf-8") for p in PAGES}


def grab(s, rx):
    return json.loads(re.search(rx, s, re.S).group(1))


def dur(p):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                         capture_output=True, text=True, check=True).stdout
    return float(out)


parts = []
for n, p in enumerate(PAGES):
    s = src[p]
    W = grab(s, r"const WORD_T = (\[\[.*?\]\]);")
    P = grab(s, r"const PARA_T = (\[.*?\]);")
    PART = grab(s, r"const PART = (\[.*?\]);")
    GO = json.loads(re.search(r"const GO_OF = (\[.*?\]);", s).group(1))
    a = s.index('<main class="col" id="col">') + len('<main class="col" id="col">')
    body = s[a:s.index("</main>")]
    body = body[:body.index('<section class="cp cp-end"')]
    parts.append(dict(W=W, P=P, PART=PART, GO=GO, body=body, last=max(t for w in W for t in w), D=dur(ROOT / "audio" / MP3[n])))

assert parts[0]["last"] < CUT4 < parts[0]["last"] + 1.2, parts[0]["last"]
assert CUT5 < parts[1]["P"][0] < CUT5 + .2, parts[1]["P"][0]
OFF = [0.0, CUT4 + GAP - CUT5]
TOTAL = OFF[1] + parts[1]["D"]
mp = lambda n, t: round(OFF[n] + t, 2)

# ---------- звук ----------
out_mp3 = ROOT / "audio" / "gorizont-chast-4-full.mp3"
if "--audio" in sys.argv or not out_mp3.exists():
    fl = (f"[0:a]atrim=0:{CUT4},asetpts=PTS-STARTPTS,afade=t=out:st={CUT4 - .06:.2f}:d=0.06,aresample=48000,aformat=channel_layouts=stereo[a];"
          f"anullsrc=r=48000:cl=stereo,atrim=0:{GAP}[g];"
          f"[1:a]atrim={CUT5},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,aresample=48000,aformat=channel_layouts=stereo[b];"
          "[a][g][b]concat=n=3:v=0:a=1[o]")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(ROOT / "audio" / MP3[0]), "-i", str(ROOT / "audio" / MP3[1]),
                    "-filter_complex", fl, "-map", "[o]", "-ar", "48000", "-ac", "2", "-c:a", "libmp3lame", "-b:a", "128k", str(out_mp3)], check=True)
real = dur(out_mp3)
assert abs(real - TOTAL) < 0.3, (real, TOTAL)

# ---------- текст ----------
TOK = re.compile(r"[^\s/—–-]+")
ntok = lambda txt: sum(1 for m in TOK.finditer(txt) if re.search(r"[0-9A-Za-zА-Яа-яЁё]", m.group(0)))
sections, PARA_T, WORD_T, PART, GO_OF = [], [], [], [], []
for n, q in enumerate(parts):
    body = q["body"]
    P = [mp(n, t) for t in q["P"]]
    W = [[mp(n, t) for t in w] for w in q["W"]]
    if n == 1:
        h1 = re.search(r'<h1 id="essay-title">(.*?)</h1>', body).group(0)
        new = '<h1 class="part-h sub">Вместо вывода</h1>'
        body = body.replace(h1, new, 1)
        W[0] = [P[0]] * ntok(re.sub(r"<[^>]+>", " ", new))
    s_off = len(PART)
    part = [246 if (n == 1 and k == 46) else k for k in q["PART"]]
    PART += part
    GO_OF += [None if g is None else g + s_off for g in q["GO"]]
    for sec in re.findall(r'<section class="cp"[^>]*>.*?</section>', body, re.S):
        k = len(sections)
        sections.append(re.sub(r'<section class="cp" id="r\d+" data-cp="\d+">', f'<section class="cp" id="r{k}" data-cp="{k}">', sec, count=1))
    PARA_T += P
    WORD_T += W
    if n == 0:
        FIRST5 = len(sections)        # с этого пункта начинается «Вместо вывода»

n_units = len(sections)
END_SPEECH = mp(1, parts[1]["last"])
end = (f'\n<section class="cp cp-end" id="r{n_units}" data-cp="{n_units}">\n'
       '<aside class="rest rest-part"><p class="rest-label">Конец статьи</p>'
       '<p>Спасибо за время, проведённое здесь со мной, и за проявленный интерес. '
       'До будущих встреч.</p>'
       '<a class="btn ghost" href="./">Все части статьи</a></aside>\n</section>\n')

# ---------- страница: берём «Вместо вывода» и делаем из неё четвёртую часть ----------
s = src["src/vyvody-solo.html"]


def R(a, b, cnt=1):
    global s
    c = s.count(a)
    assert c == cnt, (c, a[:120])
    s = s.replace(a, b)


fmt = lambda v: f"{int(v // 60)}:{int(v % 60):02d}"
R("<title>Горизонт отношений · Вместо вывода</title>", "<title>Горизонт отношений · Часть 4</title>")
s, c = re.subn(r'<span class="dk-time" id="listen-time">[\d:]+</span>', f'<span class="dk-time" id="listen-time">{fmt(TOTAL)}</span>', s); assert c == 1
R('src="audio/gorizont-vyvody.mp3"', 'src="audio/gorizont-chast-4-full.mp3"')
R("const PUBLIC_URL = 'https://legendpsy.github.io/relations-essay/gorizont/vyvody.html';",
  "const PUBLIC_URL = 'https://legendpsy.github.io/relations-essay/gorizont/chast-4.html';")
s = s.replace("'gorizont-5-", "'gorizont-4-")       # закладки четвёртой части остаются на месте
s, c = re.subn(r"au\.duration \|\| \d+", f"au.duration || {round(TOTAL)}", s); assert c == 4
s, c = re.subn(r"\? au\.duration : [\d.]+;", f"? au.duration : {round(TOTAL, 3)};", s); assert c == 1
s, c = re.subn(r"if \(au\.currentTime > \d+\) au\.currentTime = 0;", f"if (au.currentTime > {round(END_SPEECH + 3)}) au.currentTime = 0;", s); assert c == 1
s, c = re.subn(r"const hm = /\^#r\(\\d\{1,\d\}\)\$/\.exec\(location\.hash\);", r"const hm = /^#r(\\d{1,3})$/.exec(location.hash);", s); assert c == 1

a = s.index('<main class="col" id="col">') + len('<main class="col" id="col">')
b = s.index("</main>")
s = s[:a] + "\n" + "\n".join(sections) + end + s[b:]
R(".cp-end { margin-top: 2rem; }", """.cp-end { margin-top: 2rem; }
/* «Вместо вывода» — раздел внутри четвёртой части: тихий заголовок, чтение не прерывается */
.col h1.part-h { margin: 1.2rem 0 1.6rem; text-align: center; font-size: 1.5rem; color: var(--head); }
.col h1.part-h::before { content: '· · ·'; display: block; margin-bottom: 1.1rem; font-size: 1rem; letter-spacing: .5em; color: var(--muted); }
.col h1.part-h.now-reading, .col h1.part-h .w.said { color: var(--head); }
.col h1.part-h.sub { font-size: 1.25rem; }""")

s = re.sub(r"const PARA_T = \[.*?\];", lambda m: "const PARA_T = " + json.dumps(PARA_T) + ";", s, count=1)
s = re.sub(r"const WORD_T = \[\[.*?\]\];", lambda m: "const WORD_T = " + json.dumps(WORD_T, separators=(",", ":")) + ";", s, count=1)

# ---------- сценарий ----------
a = s.index("// «Вместо вывода»: рассвет в деревне")
b = s.index("const PART = [46, 47, 48, 140];") + len("const PART = [46, 47, 48, 140];")
old = s[a:b]
assert "S_ALL[46] = Object.assign({}, S_ALL[46], {a:'Рассвет. Лена с рюкзаком идёт через деревню', m:'walk', tod:'dawn'," in old
new = (old.replace("// «Вместо вывода»: рассвет в деревне (46),",
                   "// «Вместо вывода» внутри четвёртой части: привала у лавочки нет (132), Лена с рюкзаком идёт дальше (246),")
          .replace("S_ALL[46] = Object.assign({}, S_ALL[46], {a:'Рассвет. Лена с рюкзаком идёт через деревню', m:'walk', tod:'dawn',",
                   "S_ALL[132] = Object.assign({}, S_ALL[132], {rest:0});\n"
                   "S_ALL[246] = Object.assign({}, S_ALL[46], {a:'Утро. Лена с рюкзаком и кирпичом идёт дальше', m:'walk', tod:'morning',")
          .replace("const PART = [46, 47, 48, 140];", f"const PART = {json.dumps(PART)};"))
s = s[:a] + new + s[b:]
assert len(set(PART)) == len(PART), "сцены не должны повторяться"
R("const GO_OF = [2, 3, null];", "// кнопка в конце пункта k показывает сцену GO_OF[k]\nconst GO_OF = " + json.dumps(GO_OF) + ";")
R("    if (i === 46 || (i === 47 && f < .62)) backpack(", "    if (i === 246 || (i === 47 && f < .62)) backpack(")

(ROOT / "chast-4.html").write_text(s, encoding="utf-8")
(ROOT / "src" / "part4-full-times.json").write_text(json.dumps(
    {"duration": round(TOTAL, 3), "cut4": CUT4, "cut5": CUT5, "gap": GAP, "offset5": round(OFF[1], 3), "first_unit5": FIRST5},
    ensure_ascii=False, indent=1), encoding="utf-8")
print("ok", fmt(TOTAL), "пунктов", n_units, "«Вместо вывода» с пункта", FIRST5, "сцен", len(PART), "конец речи", END_SPEECH)
