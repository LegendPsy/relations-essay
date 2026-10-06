# Плеер под сценой: всегда на виду, ±15 секунд. Плюс «крышка» над сценой, чтобы над ней не просвечивал текст.
R('''  <div class="backbar" id="backbar" hidden>''', '''  <div class="dock" id="listen">
    <button type="button" class="dk-skip" id="listen-back" aria-label="Назад на 15 секунд">−15</button>
    <button type="button" class="dk-play" id="listen-btn" aria-label="Слушать статью"><span class="li-ic" aria-hidden="true">▶</span></button>
    <button type="button" class="dk-skip" id="listen-fwd" aria-label="Вперёд на 15 секунд">+15</button>
    <input type="range" id="listen-seek" min="0" max="1000" value="0" step="1" aria-label="Место в записи">
    <span class="dk-time" id="listen-time">22:29</span>
    <button type="button" class="dk-speed" id="listen-speed" aria-label="Скорость">1×</button>
    <audio id="listen-audio" preload="none" src="audio/gorizont-chast-1.mp3"></audio>
  </div>
  <div class="backbar" id="backbar" hidden>''')
R(".stage::after {", """.stage::before { content: ''; position: absolute; left: 0; right: 0; bottom: 100%; height: 400px; background: var(--ink); }
.dock { position: relative; display: flex; align-items: center; gap: 6px; height: 46px; padding: 0 10px; background: var(--ink-2); border-bottom: 1px solid var(--rule); }
.dock button { flex: none; display: grid; place-items: center; background: transparent; border: 0; color: var(--paper); cursor: pointer; font-family: var(--mono); }
.dk-play { width: 34px; height: 34px; border-radius: 50%; background: var(--accent) !important; color: var(--ink) !important; font-size: 12px; }
.dk-skip { min-width: 36px; height: 30px; font-size: 11.5px; letter-spacing: .02em; border: 1px solid var(--rule) !important; border-radius: 999px; padding: 0 6px; }
.dk-time { flex: none; font-family: var(--mono); font-size: 10.5px; color: var(--muted); font-variant-numeric: tabular-nums; }
.dk-speed { min-width: 38px; height: 28px; font-size: 11px; border: 1px solid var(--rule) !important; border-radius: 999px; }
.dock button:focus-visible, #listen-seek:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
#listen-seek { flex: 1; min-width: 40px; height: 18px; margin: 0 4px; background: transparent; -webkit-appearance: none; appearance: none; --p: 0%; }
#listen-seek::-webkit-slider-runnable-track { height: 4px; border-radius: 2px; background: linear-gradient(90deg, var(--accent) var(--p), var(--rule) var(--p)); }
#listen-seek::-moz-range-track { height: 4px; border-radius: 2px; background: linear-gradient(90deg, var(--accent) var(--p), var(--rule) var(--p)); }
#listen-seek::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--paper-hi); margin-top: -5px; border: 0; }
#listen-seek::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: var(--paper-hi); border: 0; }
.stage::after {""")
R(".col { max-width: var(--col); margin: 0 auto; padding-inline: 20px; padding-block: calc(var(--stage-h) + env(safe-area-inset-top, 0px) + 36px) 45vh; }",
  ".col { max-width: var(--col); margin: 0 auto; padding-inline: 20px; padding-block: calc(var(--stage-h) + 46px + env(safe-area-inset-top, 0px) + 36px) 45vh; }")
R("  const btn = document.getElementById('listen-btn'), ic = btn.querySelector('.li-ic'),",
  "  const jump = d => { const dd = au.duration || 1349; au.currentTime = Math.max(0, Math.min(dd - .5, au.currentTime + d)); show(); };\n  document.getElementById('listen-back').addEventListener('click', () => jump(-15)); document.getElementById('listen-fwd').addEventListener('click', () => jump(15));\n  const btn = document.getElementById('listen-btn'), ic = btn.querySelector('.li-ic'),")
R("au.addEventListener('play', () => { ic.textContent = '❚❚'; btn.setAttribute('aria-label', 'Пауза'); document.getElementById('listen').classList.add('on'); });",
  "au.addEventListener('play', () => { ic.textContent = '❚❚'; btn.setAttribute('aria-label', 'Пауза'); });")
