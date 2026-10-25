"""Собирает kak-dolzhno/index.html: текст статьи (text.md) + шаблон (template.html).

Статья делится на части по заголовкам «## …». Все части открыты сразу,
в конце статьи стоит мультфильм video/multfilm.mp4 (обложка video/multfilm.jpg).

Что можно положить рядом, и сайт подхватит это при следующей сборке:
  audio/chast-N.mp3        — озвучка части N (N = 0 … 5, 0 — вступление)
  timings/chast-N.json     — {"dur": секунды, "para": [...], "words": [[...], ...]}
                             время начала каждого абзаца и каждого слова, для подсветки
Запуск: python3 kak-dolzhno/build.py
"""
import html, json, pathlib, re

ROOT = pathlib.Path(__file__).parent


def inline(text):
    text = html.escape(text, quote=False)
    return re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)


def parse(md):
    title, lede, parts = "", "", []
    cur, items = None, []

    def flush():
        if items:
            cur["blocks"].append(("ul", list(items))); items.clear()

    for raw in md.splitlines():
        s = raw.strip()
        if not s:
            if cur: flush()
            continue
        if s.startswith("# "):
            title = s[2:]; continue
        if s.startswith("> "):
            lede = s[2:]; continue
        if s.startswith("## "):
            if cur: flush()
            h = s[3:]; m = re.match(r"(\d+)\.\s+(.*)", h)
            cur = {"num": m.group(1) if m else "", "title": m.group(2) if m else h, "blocks": []}
            parts.append(cur); continue
        if s.startswith("- "):
            items.append(s[2:]); continue
        flush(); cur["blocks"].append(("p", s))
    if cur: flush()
    return title, lede, parts


def render(parts):
    out = []
    for i, p in enumerate(parts):
        body = []
        for kind, val in p["blocks"]:
            if kind == "p":
                body.append(f'<p data-say="{i}">{inline(val)}</p>')
            else:
                body.append("<ul>" + "".join(f'<li data-say="{i}">{inline(x)}</li>' for x in val) + "</ul>")
        tag = (f'<span class="tag-t">часть</span><span class="tag-n">{p["num"]}</span>' if p["num"]
               else '<span class="tag-t big">вступление</span>')
        head = "" if not p["num"] else f'<h2 data-say="{i}">{inline(p["title"])}</h2>'
        out.append(f'''<section class="part" id="part-{i}" data-part="{i}">
<header class="part-head">
<div class="tag">{tag}</div>
{head}
</header>
<div class="sheet cut" data-c="var(--paper)" data-rough="2">
{chr(10).join(body)}
</div>
</section>''')
    return "\n\n".join(out)


def main():
    title, lede, parts = parse((ROOT / "text.md").read_text(encoding="utf-8"))
    assert len(parts) == 6, f"Ожидалось 6 частей, получилось {len(parts)}"
    data = {"parts": []}
    for i, p in enumerate(parts):
        a, t = ROOT / f"audio/chast-{i}.mp3", ROOT / f"timings/chast-{i}.json"
        d = {"num": p["num"], "title": p["title"] if p["num"] else "Вступление"}
        if a.exists():
            d["audio"] = f"audio/chast-{i}.mp3"
            if t.exists(): d.update(json.loads(t.read_text(encoding="utf-8")))
        data["parts"].append(d)
    tpl = (ROOT / "template.html").read_text(encoding="utf-8")
    # в заголовке слова через дефис не разрываются по строкам («вообще-то»)
    h1 = re.sub(r"(\w+-\w+)", r'<span class="nw">\1</span>', inline(title))
    page = (tpl.replace("{{TITLE_H1}}", h1).replace("{{TITLE}}", inline(title)).replace("{{LEDE}}", inline(lede))
               .replace("{{ARTICLE}}", render(parts))
               .replace("{{DATA}}", json.dumps(data, ensure_ascii=False)))
    (ROOT / "index.html").write_text(page, encoding="utf-8")
    words = sum(len(re.findall(r"[0-9A-Za-zА-Яа-яЁё]+", (" ".join(v if k == "p" else " ".join(v) for k, v in p["blocks"])))) for p in parts)
    print("OK:", len(parts), "частей,", words, "слов, озвучка:", sum("audio" in d for d in data["parts"]))


if __name__ == "__main__":
    main()
