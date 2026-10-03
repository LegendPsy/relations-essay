"""Собирает index.html: статья (article.md) + шаблон (template.html).

Точки: 0 — вступление, 1–46 — разделы «## N.», 47 — «Вместо вывода», 48 — «Вопросы».
Чтобы заменить текст статьи, достаточно заменить article.md и запустить: python3 build.py
"""
import html, re, pathlib

ROOT = pathlib.Path(__file__).parent
REST = {9, 21, 28, 36, 42, 47}
TOTAL = 48


def inline(text):
    text = html.escape(text, quote=False)
    return re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)


def parse(md):
    sections = []  # (cp, title, [html blocks])
    cur = {"cp": 0, "title": None, "blocks": []}
    para = []

    def flush():
        if para:
            parts = []
            for i, line in enumerate(para):
                br = line.endswith("  ") and i < len(para) - 1
                parts.append(inline(line.strip()) + ("<br>" if br else ""))
            cur["blocks"].append("<p>" + " ".join(parts) + "</p>")
            para.clear()

    def start(cp, title):
        nonlocal cur
        flush()
        sections.append(cur)
        cur = {"cp": cp, "title": title, "blocks": []}

    for raw in md.splitlines():
        line = raw.rstrip("\n")
        s = line.strip()
        if not s:
            flush()
            continue
        if s == "---":
            flush()
            continue
        m = re.match(r"^##\s+(\d+)\.\s*(.+)$", s)
        if m:
            start(int(m.group(1)), m.group(2))
            continue
        if s.startswith("# ") and cur["cp"] == 0 and cur["title"] is None and not cur["blocks"]:
            cur["title"] = s[2:].strip()
            continue
        if s.startswith("# "):
            title = s[2:].strip()
            start(47 if "вывод" in title.lower() else 48, title)
            continue
        if s.startswith("### "):
            flush()
            cur["blocks"].append("<h3>" + inline(s[4:]) + "</h3>")
            continue
        para.append(line)
    flush()
    sections.append(cur)
    return sections


def render(sections):
    out = []
    for sec in sections:
        cp = sec["cp"]
        body = "\n".join(sec["blocks"])
        if cp == 0:
            head = f'<h1 id="essay-title">{inline(sec["title"])}</h1>'
        else:
            head = (f'<p class="eyebrow">Точка {cp} / {TOTAL}</p>\n'
                    f'<h2>{inline(sec["title"])}</h2>')
        rest = ""
        if cp in REST:
            rest = (f'<aside class="rest" data-rest="{cp}">'
                    '<p class="rest-label">Привал</p>'
                    '<p>Здесь можно остановиться. Она подождёт, а место сохранится само.</p>'
                    f'<button type="button" class="btn ghost js-copy" data-cp="{cp}">Скопировать ссылку на это место</button>'
                    '</aside>')
        out.append(f'<section class="cp" id="r{cp}" data-cp="{cp}">\n{head}\n{body}\n{rest}\n</section>')
    return "\n\n".join(out)


def main():
    sections = parse((ROOT / "article.md").read_text(encoding="utf-8"))
    cps = [s["cp"] for s in sections]
    assert cps == list(range(TOTAL + 1)), f"Ожидались точки 0–48, получилось: {cps}"
    tpl = (ROOT / "template.html").read_text(encoding="utf-8")
    (ROOT / "index.html").write_text(tpl.replace("{{ARTICLE}}", render(sections)), encoding="utf-8")
    print("OK:", len(sections), "точек")


if __name__ == "__main__":
    main()
