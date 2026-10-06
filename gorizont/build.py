"""Собирает gorizont/index.html: текст части (part1.md) + шаблон (template.html).

Каждый раздел «## …» и подраздел «### …» — отдельный пункт. В конце каждого пункта
сайт сам ставит кнопку «Дальше в путь»: она показывает то, что было только что прочитано.
Последний пункт — привал в конце части.
"""
import html, re, pathlib

ROOT = pathlib.Path(__file__).parent


def inline(text):
    text = html.escape(text, quote=False)
    return re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)


def parse(md):
    units, cur, para, items = [], None, [], []

    def flush():
        if para:
            cur["blocks"].append("<p>" + " ".join(inline(x) for x in para) + "</p>"); para.clear()
        if items:
            cur["blocks"].append("<ul>" + "".join(f"<li>{inline(x)}</li>" for x in items) + "</ul>"); items.clear()

    for raw in md.splitlines():
        s = raw.strip()
        if not s:
            flush(); continue
        if s.startswith("# "):
            cur = {"title": s[2:], "kind": "h1", "blocks": []}; units.append(cur); continue
        if s.startswith("## ") or s.startswith("### "):
            flush(); lvl = "h2" if s.startswith("## ") else "h3"
            cur = {"title": s.split(" ", 1)[1], "kind": lvl, "blocks": []}; units.append(cur); continue
        if s.startswith("- "):
            if para: flush()
            items.append(s[2:]); continue
        if items: flush()
        para.append(s)
    flush()
    return units


def render(units, total):
    out = []
    for k, u in enumerate(units):
        body = "\n".join(u["blocks"])
        if u["kind"] == "h1":
            head = f'<h1 id="essay-title">{inline(u["title"])}</h1>'
        else:
            head = f'<h2 class="{"sub" if u["kind"] == "h3" else ""}">{inline(u["title"])}</h2>'
        out.append(f'<section class="cp" id="r{k}" data-cp="{k}">\n{head}\n{body}\n</section>')
    out.append(f'<section class="cp cp-end" id="r{len(units)}" data-cp="{len(units)}">\n'
               '<aside class="rest rest-part">'
               '<p class="rest-label">Привал · конец первой части</p>'
               '<p>Лена расстелила плед и собрала себе обед из того, что выбрала сама. Здесь можно остановиться: она подождёт, а место сохранится само. Когда вернётесь, путь продолжится отсюда.</p>'
               f'<button type="button" class="btn ghost js-copy" data-cp="{len(units)}">Скопировать ссылку на это место</button>'
               '</aside>\n</section>')
    return "\n\n".join(out)


def main():
    units = parse((ROOT / "part1.md").read_text(encoding="utf-8"))
    assert len(units) == 15, f"Ожидалось 15 пунктов текста, получилось {len(units)}"
    tpl = (ROOT / "template.html").read_text(encoding="utf-8")
    (ROOT / "index.html").write_text(tpl.replace("{{ARTICLE}}", render(units, len(units))).replace("{{TIMINGS}}", (ROOT / "timings.json").read_text()).replace("{{WORDTIMES}}", (ROOT / "wordtimes.json").read_text()), encoding="utf-8")
    print("OK:", len(units), "пунктов + привал")


if __name__ == "__main__":
    main()
