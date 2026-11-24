"""Собирает живой сайт «Чьи это границы?» (версия 2026-11-24).

Текст статьи (text.md) — слово в слово текст Aleksei, в нём нет служебных меток.
Где стоят живые сцены, какие фразы оживают и где сайт меняет «настроение»,
описано здесь, в таблицах ниже: по началу абзаца.

  text.md      — статья
  scenes.html  — живые сцены (всё нарисовано кодом: SVG и CSS)
  template.html — страница: шрифты, цвета, стили (облик открыток каталога)
  garden.py    — картинка открытки в шапке (сад с калиткой), нарисована кодом
  app.js       — поведение сайта: дыхание, тёплый след, сцены, память

Запуск: python3 build.py  →  index.html (для сайта) и preview.html (для предпросмотра в Claude)
"""
import html, pathlib, re

import garden as garden_art

ROOT = pathlib.Path(__file__).parent
NBSP = " "

# сцена ставится ПОСЛЕ абзаца, который начинается с этих слов
SCENES_AFTER = [
    ("О личных границах сейчас говорят все", "stamp"),
    ("Женщина говорит мужчине", "bubble"),
    ("Сделаем необходимую оговорку", "nail"),
    ("Вслух требование может так и не прозвучать", "bill"),
    ("В этом смысле здоровая граница", "nosmoke"),
    ("Табличка обращена наружу", "exit"),
    ("Именно здесь проходит тонкая", "lift"),
    ("Когда рука касается раскалённого чайника", "kettle"),
    ("Как же тогда говорить о границах с другими", "knee"),
    ("Сообщить о границе — значит", "card"),
    ("Внутренняя граница начинается", "pause"),
    ("Договорённость — это всегда двое", "agree"),
    ("Граница — это один", "mine"),
]

# «настроение» страницы: с какого абзаца начинается
SECTION_ZONES = ["bill", "smoke", "kitchen", "duty", "rose", "clear"]
ZONES_AT = [
    ("Представим женщину, пережившую серьёзный абьюз", "quiet"),
    ("Решив, что теперь всё будет иначе", "watch"),
    ("Гораздо надёжнее", "lamps"),
    ("Представьте ситуацию, где никто не кричит", "dissolve"),
    ("Когда такой внутренней черты нет", "rose"),
    ("Самый страшный и кристально ясный предел", "quiet"),
    ("В такой точке естественно хотеть", "rose"),
    ("Конечно, огромное счастье", "stream"),
    ("Порой самое бережное", "dawn"),
    ("Потому что если моя безопасность", "end"),
]

# фразы внутри абзацев, которые оживают (текст при этом не меняется)
PHRASES = [
    ("Каждый раз, когда она звучит", "и что дальше?", "what"),
    ("Табличка обращена наружу", "Решение уже принято — остаётся на него опереться", "lean"),
    ("Именно здесь проходит тонкая", "жмём на кнопку лифта", "lift"),
    ("Когда рука касается раскалённого чайника", "раскалённого чайника", "hot"),
    ("Как же тогда говорить о границах", "молоточком по колену", "knee"),
    ("Гораздо надёжнее", "вернуть доверие себе", "trust"),
    ("Иначе говоря", "Это совершенно иная точка равновесия", "balance"),
    ("Представьте ситуацию, где никто не кричит", "теряете очертания, растворяетесь в другом человеке", "dissolve"),
    ("Представьте ситуацию, где никто не кричит", "делаете шаг назад", "step"),
    ("Конечно, огромное счастье", "заметить, что тебя сейчас несёт", "carry"),
    ("Внутренняя граница начинается", "«Стоп. Кажется, сейчас выбираю не я»", "stop"),
]

# абзацы с особой подачей
CLASSES = [
    ("Обозначил. Проговорил. Объяснил.", "triad"),
    ("И всё равно ей страшно сближаться.", "single"),
    ("Договорённость — это всегда двое", "def"),
    ("Граница — это один", "def"),
    ("Потому что если моя безопасность", "last"),
]

# списки: по началу абзаца перед списком
LIST_CLASSES = [("Гораздо надёжнее", "lamps"), ("Внутренняя граница начинается", "qs")]


# ---------------------------------------------------------------- текст

def typo(text):
    # короткие слова не остаются в конце строки, тире не уезжает в начало следующей
    text = re.sub(r"(?<![\w-])([А-Яа-яЁёA-Za-z]{1,2}) (?=\S)", r"\1" + NBSP, text)
    text = re.sub(r" (—)", NBSP + r"\1", text)
    # слова через дефис («что-то», «по-настоящему») не разрываются по дефису
    text = re.sub(r"(?<![\w-])([А-Яа-яЁё]+(?:-[А-Яа-яЁё]+)+)(?![\w-])", r'<span class="nobr">\1</span>', text)
    return text


def inline(raw, phrases=()):
    for phrase, key in phrases:
        i = raw.find(phrase)
        assert i >= 0, f"Фраза не найдена: {phrase}"
        raw = raw[:i] + "\x01" + key + "\x02" + phrase + "\x03" + raw[i + len(phrase):]
    s = html.escape(raw, quote=False)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)", r"<em>\1</em>", s)
    s = typo(s)
    s = re.sub("\x01(\\w+)\x02", lambda m: f'<span class="ph ph-{m.group(1)}" data-ph="{m.group(1)}">', s)
    return s.replace("\x03", "</span>")


def parse(md):
    title, lede, parts = "", "", [{"title": "", "blocks": []}]
    items = []

    def flush():
        if items:
            parts[-1]["blocks"].append(("ul", list(items)))
            items.clear()

    for raw in md.splitlines():
        s = raw.strip()
        if not s:
            flush(); continue
        if s.startswith("# "):
            title = s[2:]; continue
        if not lede and re.fullmatch(r"\*[^*].*[^*]\*", s) and len(parts) == 1 and not parts[0]["blocks"]:
            lede = s[1:-1]; continue
        if s.startswith("## "):
            flush(); parts.append({"title": s[3:], "blocks": []}); continue
        if s.startswith("- "):
            items.append(s[2:]); continue
        flush()
        parts[-1]["blocks"].append(("p", s))
    flush()
    return title, lede, parts


def load_scenes():
    src = (ROOT / "scenes.html").read_text(encoding="utf-8")
    found = dict(re.findall(r"<!--scene:(\w+)-->\s*(.*?)\s*<!--/scene-->", src, re.S))
    return found


def starts(s, prefix):
    return s.startswith(prefix)


def render_p(s):
    attrs = ['data-t']
    cls = [c for pre, c in CLASSES if starts(s, pre)]
    zone = [z for pre, z in ZONES_AT if starts(s, pre)]
    if cls:
        attrs.insert(0, f'class="{" ".join(cls)}"')
    if zone:
        attrs.append(f'data-z="{zone[0]}"')
    phrases = [(ph, key) for pre, ph, key in PHRASES if starts(s, pre)]
    if "triad" in cls:
        words = s.split(" ")
        body = " ".join(f'<span class="tw">{html.escape(w)}</span>' for w in words)
    else:
        body = inline(s, phrases)
    return f"<p {' '.join(attrs)}>{body}</p>"


def render(parts, scenes):
    used, out = set(), []
    for i, part in enumerate(parts):
        if i == 0:
            sec = ['<section class="intro" data-z="intro">']
        else:
            z = SECTION_ZONES[i - 1]
            sec = [f'<section class="part" id="r{i}" data-z="{z}">',
                   f'<header class="part-h"><span class="part-mark" aria-hidden="true"></span>'
                   f'<h2 data-t>{inline(part["title"])}</h2></header>']
        prev_p = ""
        for kind, val in part["blocks"]:
            if kind == "p":
                sec.append(render_p(val))
                for pre, name in SCENES_AFTER:
                    if starts(val, pre):
                        sec.append(scenes[name]); used.add(name)
                prev_p = val
            else:
                cls = [c for pre, c in LIST_CLASSES if starts(prev_p, pre)]
                c = f' class="{cls[0]}"' if cls else ""
                sec.append(f"<ul{c}>" + "".join(f"<li data-t>{inline(x)}</li>" for x in val) + "</ul>")
        sec.append("</section>")
        out.append("\n".join(sec))
    missing = [n for _, n in SCENES_AFTER if n not in used]
    assert not missing, f"Сцены не нашли своё место: {missing}"
    return "\n\n".join(out)


def ink_filters():
    """Чернила печати: с каждым оттиском края расплываются сильнее, краска ложится пятнами."""
    out = []
    for n in range(8):
        warp = 1.2 + n * 2.4      # «плывут» контуры
        rough = 1.4 + n * 0.6     # рваный край
        blur = 0.12 + n * 0.2     # расплывается
        thr = 0.12 + n * 0.05     # сколько краски не легло
        k = 9
        out.append(
            f'<filter id="ink{n}" x="-12%" y="-25%" width="124%" height="150%" color-interpolation-filters="sRGB">'
            f'<feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="{n + 3}" result="w"/>'
            f'<feDisplacementMap in="SourceGraphic" in2="w" scale="{warp:.2f}" xChannelSelector="R" yChannelSelector="G" result="d1"/>'
            f'<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" seed="{n + 13}" result="r"/>'
            f'<feDisplacementMap in="d1" in2="r" scale="{rough:.2f}" xChannelSelector="R" yChannelSelector="G" result="d2"/>'
            f'<feGaussianBlur in="d2" stdDeviation="{blur:.2f}" result="b"/>'
            f'<feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" seed="{n + 23}" result="g"/>'
            f'<feColorMatrix in="g" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 {k} 0 0 0 {-k * thr:.2f}" result="m"/>'
            f'<feComposite in="b" in2="m" operator="in"/></filter>')
    out.append(
        '<filter id="inkMine" x="-8%" y="-15%" width="116%" height="130%" color-interpolation-filters="sRGB">'
        '<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" seed="5" result="r"/>'
        '<feDisplacementMap in="SourceGraphic" in2="r" scale="1.1" xChannelSelector="R" yChannelSelector="G" result="d"/>'
        '<feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="9" result="g"/>'
        '<feColorMatrix in="g" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 3 0 0 0 -0.25" result="m"/>'
        '<feComposite in="d" in2="m" operator="in"/></filter>')
    return "".join(out)


def title_h1(title):
    words = title.split(" ")
    spans = []
    for w in words:
        letters = "".join(f'<span class="ch">{html.escape(ch)}</span>' for ch in w)
        spans.append(f'<span class="w">{letters}</span>')
    return " ".join(spans)


def main():
    md = (ROOT / "text.md").read_text(encoding="utf-8")
    title, lede, parts = parse(md)
    scenes = load_scenes()
    words = len(re.findall(r"[0-9A-Za-zА-Яа-яЁё]+", md))
    minutes = max(1, round(words / 190))
    tpl = (ROOT / "template.html").read_text(encoding="utf-8")
    app = (ROOT / "app.js").read_text(encoding="utf-8")
    art = garden_art.garden()
    page = (tpl.replace("{{TITLE}}", html.escape(title))
               .replace("{{TITLE_H1}}", title_h1(title))
               .replace("{{LEDE}}", inline(lede))
               .replace("{{LEDE_META}}", html.escape(lede))
               .replace("{{MINUTES}}", str(minutes))
               .replace("{{ARTICLE}}", render(parts, scenes))
               .replace("{{INK_FILTERS}}", ink_filters())
               .replace("{{GARDEN}}", art["back"] + "\n      " + art["clouds"] + "\n      " + art["land"])
               .replace("{{STAMP_ART}}", garden_art.stamp_art())
               .replace("{{APP_JS}}", app))
    assert "{{" not in page, "В шаблоне осталась незаполненная метка"
    (ROOT / "index.html").write_text(page, encoding="utf-8")

    # предпросмотр: без <!doctype>, <html>, <head>, <body>
    head = re.search(r"<head>(.*?)</head>", page, re.S).group(1)
    head = re.sub(r'<meta charset="utf-8">\s*', "", head)
    head = re.sub(r'<meta name="viewport"[^>]*>\s*', "", head)
    body = re.search(r"<body[^>]*>(.*)</body>", page, re.S).group(1)
    preview = '<meta name="claude:viewport-fit-sides" content="cover">\n' + head.strip() + "\n" + body.strip() + "\n"
    (ROOT / "preview.html").write_text(preview, encoding="utf-8")
    print("OK:", len(parts) - 1, "разделов + вступление,", words, "слов, ~", minutes, "мин,", len(page) // 1024, "КБ")


if __name__ == "__main__":
    main()
