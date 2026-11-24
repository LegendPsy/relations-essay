"""Картинка открытки «Сад с калиткой», нарисованная кодом (SVG), в палитре открыток каталога.

Сюжет тот же, что на открытке «Чьи это границы?» в каталоге: сад, забор, приоткрытая калитка,
тропинка, цветущая яблоня, озеро и горы, кучевые облака. Никаких картинок, только фигуры.
garden() — большая картинка для шапки, stamp_art() — крошечная для марки.
"""
import random


def _pickets(x0, x1, step, top, bottom, rnd):
    out = []
    x = x0
    while x + 10 <= x1:
        h = rnd.uniform(-1.6, 1.6)
        t = top + h
        out.append(f'<path d="M{x:.1f} {t + 7:.1f}L{x + 5:.1f} {t:.1f}L{x + 10:.1f} {t + 7:.1f}V{bottom}H{x:.1f}Z"/>')
        x += step
    return out


def _shades(x0, x1, step, top, bottom, rnd):
    out = []
    x = x0
    while x + 10 <= x1:
        out.append(f'<rect x="{x + 7:.1f}" y="{top + 6:.1f}" width="3" height="{bottom - top - 6:.1f}"/>')
        x += step
    return out


def garden():
    rnd = random.Random(7)
    pick_l = _pickets(6, 254, 17, 308, 368, rnd)
    pick_r = _pickets(348, 598, 17, 308, 368, rnd)
    shade = _shades(6, 254, 17, 308, 368, rnd) + _shades(348, 598, 17, 308, 368, rnd)
    # цветы в траве у забора и впереди
    flowers = []
    cols = ["#fffaf0", "#fffaf0", "#f2c94c", "#e898a8", "#a397d6", "#fffaf0"]
    for _ in range(70):
        x = rnd.uniform(0, 600)
        if 262 < x < 384:
            continue
        y = rnd.uniform(364, 398)
        r = rnd.uniform(1.6, 3.2) * (0.8 + (y - 360) / 70)
        c = rnd.choice(cols)
        flowers.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="{c}"/>')
    tufts = []
    for _ in range(44):
        x = rnd.uniform(0, 600)
        y = rnd.uniform(366, 400)
        h = rnd.uniform(7, 13)
        tufts.append(f'M{x:.1f} {y:.1f}l-3 -{h:.1f}M{x:.1f} {y:.1f}l1 -{h + 2:.1f}M{x:.1f} {y:.1f}l4 -{h - 1:.1f}')
    petals = []
    for _ in range(9):
        x = rnd.uniform(150, 330)
        y = rnd.uniform(200, 300)
        petals.append(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="2.4" ry="1.3" transform="rotate({rnd.uniform(-40, 40):.0f} {x:.1f} {y:.1f})"/>')
    # канопа яблони: один цвет, тень снизу, свет сверху, крапинки цветков
    bloom = []
    for cx, cy, r in [(70, 214, 26), (104, 196, 32), (142, 206, 28), (166, 226, 18), (48, 234, 16), (118, 226, 22), (84, 232, 14), (128, 178, 16), (92, 176, 14)]:
        bloom.append(f'<circle cx="{cx}" cy="{cy}" r="{r}"/>')
    shade_b = []
    for cx, cy, r in [(66, 232, 18), (110, 236, 18), (150, 232, 14), (90, 240, 10), (40, 242, 9)]:
        shade_b.append(f'<circle cx="{cx}" cy="{cy}" r="{r}"/>')
    light_b = []
    for cx, cy, r in [(96, 182, 12), (128, 178, 9), (150, 198, 8), (66, 202, 9), (112, 200, 7), (80, 194, 6)]:
        light_b.append(f'<circle cx="{cx}" cy="{cy}" r="{r}"/>')
    specks = []
    for _ in range(60):
        a = rnd.uniform(30, 176); b = rnd.uniform(168, 246)
        if (a - 104) ** 2 / 76 ** 2 + (b - 210) ** 2 / 40 ** 2 > 1:
            continue
        specks.append(f'<circle cx="{a:.1f}" cy="{b:.1f}" r="{rnd.uniform(.9, 1.8):.1f}"/>')
    return {
        "back": f'''<svg class="g-back" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
<defs>
<linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#78a9d3"/><stop offset=".45" stop-color="#afcfe4"/><stop offset=".66" stop-color="#e6e6d8"/><stop offset="1" stop-color="#f3e1bf"/></linearGradient>
<radialGradient id="gSun" cx=".18" cy=".12" r=".6"><stop offset="0" stop-color="#fff7dc" stop-opacity=".95"/><stop offset=".35" stop-color="#ffefc8" stop-opacity=".4"/><stop offset="1" stop-color="#ffefc8" stop-opacity="0"/></radialGradient>
</defs>
<rect width="600" height="400" fill="url(#gSky)"/>
<rect width="600" height="400" fill="url(#gSun)"/>
</svg>''',
        "clouds": f'''<svg class="g-clouds" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
<defs>
<linearGradient id="gPuffA" gradientUnits="userSpaceOnUse" x1="0" y1="44" x2="0" y2="150"><stop offset="0" stop-color="#fffdf8"/><stop offset=".55" stop-color="#fbf1e0"/><stop offset="1" stop-color="#dcc6ae"/></linearGradient>
<linearGradient id="gPuffB" gradientUnits="userSpaceOnUse" x1="0" y1="125" x2="0" y2="166"><stop offset="0" stop-color="#fffdf8"/><stop offset=".5" stop-color="#fbf1e0"/><stop offset="1" stop-color="#dcc6ae"/></linearGradient>
<clipPath id="cBig"><rect width="600" height="150"/></clipPath>
<clipPath id="cSmall"><rect width="600" height="166"/></clipPath>
<filter id="fSoft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.1"/></filter>
</defs>
<g filter="url(#fSoft)">
<g clip-path="url(#cBig)"><g fill="url(#gPuffA)"><circle cx="366" cy="136" r="22"/><circle cx="398" cy="118" r="32"/><circle cx="430" cy="98" r="36"/><circle cx="462" cy="86" r="42"/><circle cx="502" cy="100" r="36"/><circle cx="534" cy="120" r="28"/><circle cx="560" cy="138" r="16"/><circle cx="476" cy="128" r="30"/><circle cx="428" cy="134" r="26"/><circle cx="512" cy="136" r="20"/></g>
<g fill="#e7d4bd" opacity=".55"><ellipse cx="420" cy="146" rx="44" ry="8"/><ellipse cx="500" cy="146" rx="52" ry="9"/></g>
<g fill="#fff" opacity=".7"><circle cx="452" cy="70" r="16"/><circle cx="420" cy="88" r="10"/><circle cx="494" cy="82" r="12"/></g></g>
<g clip-path="url(#cSmall)"><g fill="url(#gPuffB)"><circle cx="94" cy="157" r="13"/><circle cx="116" cy="147" r="20"/><circle cx="142" cy="150" r="16"/><circle cx="162" cy="158" r="11"/><circle cx="128" cy="158" r="12"/></g>
<g fill="#fff" opacity=".7"><circle cx="114" cy="136" r="8"/></g></g>
<g fill="#fffaf0" opacity=".75"><ellipse cx="250" cy="68" rx="36" ry="4.5"/><ellipse cx="284" cy="76" rx="22" ry="3.2"/><ellipse cx="60" cy="92" rx="26" ry="3.4"/></g>
</g>
</svg>''',
        "land": f'''<svg class="g-land" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
<defs>
<linearGradient id="gFar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8aa6b9"/><stop offset="1" stop-color="#b3c6c8"/></linearGradient>
<linearGradient id="gFar2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d9c8e"/><stop offset="1" stop-color="#97b096"/></linearGradient>
<linearGradient id="gMid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8cab70"/><stop offset="1" stop-color="#6b8c58"/></linearGradient>
<linearGradient id="gNear" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aba6e"/><stop offset="1" stop-color="#5a8344"/></linearGradient>
<linearGradient id="gPath" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efdeb7"/><stop offset="1" stop-color="#dcbf8c"/></linearGradient>
<linearGradient id="gWarm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0c4" stop-opacity=".34"/><stop offset=".55" stop-color="#fff0c4" stop-opacity="0"/></linearGradient>
</defs>
<path d="M0 206C46 188 88 176 130 184S206 158 252 166 330 142 380 154 470 146 520 160 578 164 600 170V262H0Z" fill="url(#gFar)"/>
<path d="M0 228C60 214 120 212 176 222S290 206 340 216 470 210 600 222V262H0Z" fill="url(#gFar2)" opacity=".85"/>
<path d="M0 240C140 234 460 234 600 240V255C460 250 140 250 0 255Z" fill="#a8cddd"/>
<path d="M60 245H150M330 244H400M446 246H520" stroke="#eaf4f6" stroke-width="1.3" stroke-linecap="round" opacity=".85"/>
<path d="M0 257C70 242 150 244 220 252S352 240 420 248 540 242 600 250V308H0Z" fill="url(#gMid)"/>
<g><rect x="404" y="236" width="18" height="12" fill="#efe2c8"/><path d="M401 237L413 228L425 237Z" fill="#b8603e"/>
<rect x="430" y="240" width="22" height="11" fill="#f1e5cc"/><path d="M427 241L441 232L455 241Z" fill="#a9553a"/>
<rect x="462" y="232" width="9" height="18" fill="#e8dcc2"/><path d="M460 233L466.5 211L473 233Z" fill="#7f4a36"/>
<rect x="477" y="240" width="16" height="10" fill="#efe2c8"/><path d="M475 241L485 234L495 241Z" fill="#b8603e"/></g>
<g fill="#3d5a3a"><path d="M352 254C346 238 349 214 355 202C361 214 364 238 358 254Z"/><path d="M367 254C362 242 364 222 369 213C374 222 376 242 371 254Z"/><path d="M514 252C509 238 511 218 516 209C521 218 523 238 518 252Z"/></g>
<g><circle cx="300" cy="252" r="13" fill="#56774a"/><circle cx="315" cy="248" r="11" fill="#638655"/><circle cx="542" cy="250" r="12" fill="#56774a"/><circle cx="557" cy="252" r="9" fill="#638655"/><circle cx="214" cy="252" r="10" fill="#56774a"/></g>
<path d="M0 306C110 290 220 298 300 298S470 288 600 296V400H0Z" fill="url(#gNear)"/>
<path d="M298 299C294 314 290 330 284 346L262 400H384L350 346C340 330 322 314 308 299Z" fill="url(#gPath)"/>
<path d="M300 304C298 318 294 332 289 346M306 304C312 318 322 332 334 346" fill="none" stroke="#cdb07c" stroke-width="1.2" opacity=".6"/>
<path d="M96 342C99 304 104 270 112 236M108 264C94 250 82 242 66 238M110 252C124 238 138 230 154 228" fill="none" stroke="#6b4a32" stroke-width="7" stroke-linecap="round"/>
<g fill="#efbcc5">{"".join(bloom)}</g>
<g fill="#e3a3b0" opacity=".5">{"".join(shade_b)}</g>
<g fill="#f7d8dd" opacity=".85">{"".join(light_b)}</g>
<g fill="#fff5f6" opacity=".9">{"".join(specks)}</g>
<g fill="#f2c4ca" opacity=".9">{"".join(petals)}</g>
<path d="M0 328H260M340 328H600M0 350H260M340 350H600" stroke="#8f7c5f" stroke-width="5"/>
<g fill="#ccb790">{"".join(pick_l + pick_r)}</g>
<g fill="#a68e69">{"".join(shade)}</g>
<path d="M254 300h12v74h-12zM334 300h12v74h-12z" fill="#806a4e"/>
<path d="M252 298h16v6h-16zM332 298h16v6h-16z" fill="#6b5840"/>
<path d="M300 314L334 318V368L300 362Z" fill="#d2be98"/>
<path d="M308 316v47M317 317v48M326 318v48" stroke="#ad9671" stroke-width="2"/>
<path d="M300 314L334 318V368L300 362ZM300 324L334 327M300 352L334 357M300 352L334 327" fill="none" stroke="#806a4e" stroke-width="3" stroke-linejoin="round"/>
<path d="{"".join(tufts)}" stroke="#4d7339" stroke-width="1.6" stroke-linecap="round" fill="none"/>
<g>{"".join(flowers)}</g>
<rect width="600" height="400" fill="url(#gWarm)"/>
</svg>'''}


def stamp_art():
    return '''<svg viewBox="0 0 44 54" aria-hidden="true" focusable="false"><defs><linearGradient id="sSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb0d8"/><stop offset="1" stop-color="#efe3c6"/></linearGradient></defs>
<rect width="44" height="54" fill="url(#sSky)"/><circle cx="31" cy="14" r="7" fill="#fffaf0"/><circle cx="25" cy="16" r="5" fill="#fffaf0"/>
<path d="M0 34C12 28 24 30 44 32V54H0Z" fill="#6f9459"/><circle cx="9" cy="27" r="7" fill="#f0bec6"/><path d="M9 33V40" stroke="#6b4a32" stroke-width="2"/>
<path d="M15 36h3v12h-3zM33 36h3v12h-3z" fill="#7d6b54"/><path d="M18 39H33M18 45H33" stroke="#a6947a" stroke-width="1.6"/><path d="M24 38l7 1v9l-7-1z" fill="#c4b293" stroke="#7d6b54" stroke-width="1"/></svg>'''


if __name__ == "__main__":
    import sys
    g = garden()
    sys.stdout.write(g["back"] + g["clouds"] + g["land"])
