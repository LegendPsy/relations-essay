/* Живые детали «Как вообще-то должно быть». Работают поверх статьи и ничего в ней не ломают:
   если какой-то фразы нет, деталь просто не появляется. */
(() => {
  const LK = 'kak-dolzhno-live-';
  const store = {
    get(k, d) { try { const v = localStorage.getItem(LK + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(LK + k, JSON.stringify(v)); } catch (e) {} }
  };
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const q = (s, r = document) => r.querySelector(s), qa = (s, r = document) => [...r.querySelectorAll(s)];
  const anim = (el, kf, o) => (RM || !el.animate) ? null : el.animate(kf, o);
  // срабатывает один раз, когда элемент поднялся до нужной высоты экрана
  const when = (el, fn, line = .7) => {
    if (!el) return;
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.disconnect(); fn(); } }),
      {rootMargin: '0px 0px -' + Math.round((1 - line) * 100) + '% 0px'});
    io.observe(el);
  };

  // на телефоне срабатывает один раз, когда элемент виден целиком: низ поднялся выше 90% экрана
  // (или верх ушёл выше 10% у высокого элемента), чтобы движение не закончилось, пока читаешь текст над ним
  const whenFull = (el, fn) => {
    if (!el) return;
    const check = () => {
      const r = el.getBoundingClientRect(), vh = innerHeight;
      // на компьютере экран большой: там как раньше (верх элемента на 70% высоты экрана)
      const phone = matchMedia('(hover: none) and (pointer: coarse)').matches || innerWidth < 700;
      if (phone ? r.height && (r.bottom <= vh * .9 || r.top <= vh * .1) : r.top <= vh * .7) { removeEventListener('scroll', check); removeEventListener('resize', check); fn(); }
    };
    addEventListener('scroll', check, {passive: true}); addEventListener('resize', check); requestAnimationFrame(check);
  };

  /* ---- 8. свет по времени суток ---- */
  const hr = new Date().getHours();
  document.documentElement.dataset.tod = hr >= 5 && hr < 11 ? 'morning' : hr < 17 ? 'day' : hr < 22 ? 'evening' : 'night';

  /* ---- 1. уведомление от доставки ---- */
  const push = q('#push'), pushMsg = q('#push-msg');
  let pushBusy = false;
  function ping(text) {
    if (!push || pushBusy) return;
    pushBusy = true; pushMsg.textContent = text; push.hidden = false; push.style.transform = '';
    const cleanup = () => { push.getAnimations().forEach(x => x.cancel()); push.hidden = true; pushBusy = false; push.style.transform = ''; };
    if (RM) { setTimeout(cleanup, 3400); return; }
    // въезжает сверху с пружиной, коротко «вибрирует», полежав, уезжает
    const a = push.animate([
      {transform: 'translateY(-140%)'}, {transform: 'translateY(7px)', offset: .62}, {transform: 'translateY(-2px)', offset: .84}, {transform: 'translateY(0)'}
    ], {duration: 560, easing: 'cubic-bezier(.2,.8,.3,1)'});
    let gone = false, timer;
    const leave = (from = 0) => {
      if (gone) return; gone = true; clearTimeout(timer);
      push.animate([{transform: `translateY(${from}px)`}, {transform: 'translateY(-150%)'}], {duration: 360, easing: 'cubic-bezier(.5,0,.9,.5)', fill: 'forwards'}).onfinish = cleanup;
    };
    a.onfinish = () => {
      if (gone) return;
      push.animate([{transform: 'translateX(0)'}, {transform: 'translateX(-2.5px)'}, {transform: 'translateX(2.5px)'}, {transform: 'translateX(-2px)'}, {transform: 'translateX(1.5px)'}, {transform: 'translateX(0)'}], {duration: 300});
      timer = setTimeout(() => leave(0), 3000);
    };
    // можно смахнуть вверх пальцем: уведомление идёт за пальцем и пружинит назад, если не дотянули
    let y0 = null, dy = 0;
    push.onpointerdown = e => { y0 = e.clientY; dy = 0; push.setPointerCapture(e.pointerId); clearTimeout(timer); a.finish(); };
    push.onpointermove = e => { if (y0 == null || gone) return; dy = Math.min(0, e.clientY - y0) + Math.max(0, e.clientY - y0) * .15; push.style.transform = `translateY(${dy}px)`; };
    push.onpointerup = push.onpointercancel = () => {
      if (y0 == null) return; y0 = null;
      if (dy < -22 || Math.abs(dy) < 3) leave(dy);
      else { push.animate([{transform: `translateY(${dy}px)`}, {transform: 'translateY(2px)', offset: .7}, {transform: 'translateY(0)'}], {duration: 300, easing: 'ease-out'}); push.style.transform = ''; timer = setTimeout(() => leave(0), 2200); }
    };
  }
  const ping1 = q('.k-ping[data-ping="1"]'), ping2 = q('.k-ping[data-ping="2"]');
  when(ping1, () => { ping('Курьер на месте'); }, .5);
  when(ping2, () => { ping('Курьер у вашего подъезда'); }, .5);

  /* ---- 2. метка курьера на карте: в первой части путается, в конце встаёт к двери ---- */
  const pin = q('#pin'), part1 = q('#part-1'), spot = q('#spot'), spotMark = q('#spot-mark');
  let px = innerWidth * .8, py = innerHeight * .35, lostOn = false, hopT = 0, homed = false;
  const placePin = (x, y) => { px = x; py = y; pin.style.transform = `translate(${x}px, ${y}px)`; };
  const onBackground = (x, y) => {
    const el = document.elementFromPoint(x, y);
    return !el || el === document.body || el === document.documentElement || el.matches('main, section.part, header.top, .part-head, .wall, .spot, .fin');
  };
  function hop() {
    if (!lostOn || homed || document.hidden) return;
    // ищем место, где видна карта; если не нашли — метка «теряется» за домами, как и положено
    let tx = 16 + Math.random() * (innerWidth - 32), ty = 70 + Math.random() * (innerHeight - 140);
    for (let k = 0; k < 18; k++) {
      const x = 8 + Math.random() * (innerWidth - 16), y = 60 + Math.random() * (innerHeight - 120);
      if (onBackground(x, y)) { tx = x; ty = y; break; }
    }
    const x0 = px, y0 = py, d = Math.hypot(tx - x0, ty - y0), lift = Math.min(70, 18 + d * .22), kf = [];
    for (let i = 0; i <= 10; i++) { const t = i / 10; kf.push({transform: `translate(${x0 + (tx - x0) * t}px, ${y0 + (ty - y0) * t - Math.sin(Math.PI * t) * lift}px)`}); }
    placePin(tx, ty);
    anim(pin, kf, {duration: 420 + Math.min(360, d * .5), easing: 'cubic-bezier(.45,.05,.55,.95)'});
    anim(q('.pin-dot', pin), [{transform: 'scale(1)'}, {transform: 'scale(1)', offset: .82}, {transform: 'scale(1.3,.75)', offset: .9}, {transform: 'scale(1)'}], {duration: 420 + Math.min(360, d * .5)});
    hopT = setTimeout(hop, 1050 + Math.random() * 900);
  }
  if (pin && part1 && !RM) {
    placePin(px, py);
    new IntersectionObserver(es => es.forEach(e => {
      if (homed) return;
      lostOn = e.isIntersecting; pin.classList.toggle('show', lostOn); pin.classList.toggle('lost', lostOn);
      clearTimeout(hopT); if (lostOn) hopT = setTimeout(hop, 600);
    }), {rootMargin: '-20% 0px -20% 0px'}).observe(part1);
    document.addEventListener('visibilitychange', () => { clearTimeout(hopT); if (!document.hidden && lostOn) hopT = setTimeout(hop, 600); });
  }
  function goHome() {
    if (!pin || !spotMark || homed) return;
    homed = true; lostOn = false; clearTimeout(hopT);
    const r = spotMark.getBoundingClientRect(), tx = r.left, ty = r.top;
    const settle = () => {
      pin.classList.remove('lost'); pin.classList.add('home', 'show'); pin.style.transform = ''; spotMark.appendChild(pin);
      const rp = document.createElement('i'); rp.className = 'ripple'; spotMark.appendChild(rp);
      anim(rp, [{transform: 'scale(1)', opacity: .9}, {transform: 'scale(4.5)', opacity: 0}], {duration: 900, easing: 'ease-out'});
      setTimeout(() => rp.remove(), 950);
    };
    if (RM) { settle(); return; }
    pin.classList.add('show'); pin.classList.remove('lost');
    // если метка ещё не появлялась, она влетает сверху экрана
    if (!pin.style.transform || py > innerHeight) placePin(tx + (Math.random() < .5 ? -1 : 1) * innerWidth * .3, -20);
    const x0 = px, y0 = py, kf = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12, e = 1 - Math.pow(1 - t, 3); kf.push({transform: `translate(${x0 + (tx - x0) * e}px, ${y0 + (ty - y0) * e - Math.sin(Math.PI * t) * 40}px)`}); }
    placePin(tx, ty);
    const a = pin.animate(kf, {duration: 1100, easing: 'linear'});
    q('.pin-dot', pin).animate([{transform: 'scale(1)'}, {transform: 'scale(1)', offset: .85}, {transform: 'scale(1.35,.7)', offset: .92}, {transform: 'scale(1)'}], {duration: 1100});
    a.onfinish = settle;
  }
  if (spot) when(spot, goHome, .92);

  /* ---- 3. красные чернила расплываются ---- */
  const ink = q('.ink');
  when(ink, () => ink.classList.add('on'), .72);

  /* ---- 4. три пункта разводят по полкам ---- */
  const shelves = q('#part-2 ul');
  if (shelves) {
    shelves.classList.add('shelves');
    const items = qa('li', shelves);
    items.forEach(li => { const s = document.createElement('span'); s.className = 'sh-txt'; while (li.firstChild) s.appendChild(li.firstChild); li.appendChild(s); });
    if (!RM) {
      shelves.classList.add('wait');
      whenFull(shelves, () => {
        shelves.classList.remove('wait');
        items.forEach((li, k) => {
          const t = q('.sh-txt', li);
          t.style.opacity = '0'; t.style.transform = 'translateY(-16px)';
          setTimeout(() => {
            t.style.opacity = ''; t.style.transform = '';
            // падает под своим весом, касается доски, доска прогибается, текст чуть отскакивает
            t.animate([
              {transform: 'translateY(-16px) rotate(-.8deg)', opacity: 0, easing: 'cubic-bezier(.55,0,1,.45)'},
              {opacity: 1, offset: .25},
              {transform: 'translateY(0) rotate(0)', offset: .62, easing: 'cubic-bezier(0,.55,.45,1)'},
              {transform: 'translateY(-3px)', offset: .8, easing: 'cubic-bezier(.55,0,1,.45)'},
              {transform: 'translateY(0)'}
            ], {duration: 560});
            setTimeout(() => { li.classList.remove('hit'); void li.offsetWidth; li.classList.add('hit'); }, 340);
          }, 120 + k * 380);
        });
      });
    }
  }

  /* ---- 5. кирпичики: каждая прочитанная часть кладёт свой кирпич ---- */
  const parts = qa('section.part');
  const read = store.get('bricks', []);
  const COLORS = ['#b5653f', '#a85a37', '#c0714a', '#ad6040', '#b86a45', '#a5563a'];
  const POS = [[0, 13], [28, 13], [56, 13], [14, 0], [42, 0], [70, 0]];
  const walls = parts.map((sec, i) => {
    const w = document.createElement('div'); w.className = 'wall'; w.setAttribute('aria-hidden', 'true');
    sec.appendChild(w);
    return w;
  });
  function drawWall(i, fresh) {
    const w = walls[i]; w.innerHTML = '';
    for (let k = 0; k <= Math.min(i, 5); k++) {
      const b = document.createElement('i'), laid = read.includes(k);
      b.className = 'brick' + (laid ? '' : ' slot'); b.style.left = POS[k][0] + 'px'; b.style.top = POS[k][1] + 'px';
      if (laid) b.style.setProperty('--b', COLORS[k]);
      if (k === fresh) b.dataset.fresh = '1';
      w.appendChild(b);
    }
  }
  walls.forEach((w, i) => drawWall(i));
  walls.forEach((w, i) => when(w, () => {
    if (read.includes(i) || i > 5) return;
    read.push(i); store.set('bricks', read);
    walls.forEach((_, j) => { if (j >= i) drawWall(j, j === i ? i : -1); });
    const b = q('[data-fresh]', w); if (!b || RM) return;
    // кирпич падает с высоты, касается кладки, от удара вылетает пыль раствора
    b.animate([
      {transform: 'translateY(-48px) rotate(-4deg)', opacity: 0, easing: 'cubic-bezier(.55,0,1,.45)'},
      {opacity: 1, offset: .2},
      {transform: 'translateY(0) rotate(0)', offset: .7, easing: 'cubic-bezier(0,.55,.45,1)'},
      {transform: 'translateY(-3px) rotate(.6deg)', offset: .84, easing: 'cubic-bezier(.55,0,1,.45)'},
      {transform: 'translateY(0)'}
    ], {duration: 640});
    setTimeout(() => {
      w.animate([{transform: 'translateY(0)'}, {transform: 'translateY(1px)'}, {transform: 'translateY(0)'}], {duration: 160});
      const bx = parseFloat(b.style.left), by = parseFloat(b.style.top) + 11;
      for (let n = 0; n < 7; n++) {
        const d = document.createElement('i'); d.className = 'dust'; d.style.left = (bx + (n % 2 ? 24 : 0)) + 'px'; d.style.top = (by - 2) + 'px'; w.appendChild(d);
        const dir = n % 2 ? 1 : -1, vx = dir * (6 + Math.random() * 12), vy = -(3 + Math.random() * 8);
        d.animate([{transform: 'translate(0,0) scale(1)', opacity: .9}, {transform: `translate(${vx}px, ${vy}px) scale(.8)`, opacity: .6, offset: .5}, {transform: `translate(${vx * 1.3}px, ${vy * .2 + 6}px) scale(.5)`, opacity: 0}], {duration: 520 + Math.random() * 200, easing: 'ease-out'}).onfinish = () => d.remove();
      }
    }, 640 * .7);
  }, .85));

  /* ---- 6. чашка с паром у четвёртой части: остывает примерно за минуту ---- */
  const tag4 = q('#part-4 .tag');
  if (tag4) {
    const cup = document.createElement('span'); cup.className = 'cup'; cup.setAttribute('aria-hidden', 'true');
    cup.innerHTML = '<svg viewBox="0 0 34 40"><g><path class="wisp" d="M12 17c-2-3 2-5 0-8s2-5 0-8"/><path class="wisp" d="M17 17c-2-3 2-5 0-8s2-5 0-8"/><path class="wisp" d="M22 17c-2-3 2-5 0-8s2-5 0-8"/></g>' +
      '<path d="M7 21h20v6a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8z" fill="var(--paper)" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<path d="M27 23.5h2.2a3 3 0 0 1 0 6H26.5" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
      '<path d="M3 37.5h28" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
    tag4.appendChild(cup);
    let warm = 0, last = 0, seen = false, raf = 0;
    const tickCup = t => {
      if (!seen || document.hidden) { last = 0; raf = 0; return; }
      if (last) warm += (t - last) / 1000; last = t;
      cup.classList.toggle('cooling', warm > 40 && warm < 62);
      if (warm >= 62) { cup.classList.remove('hot', 'cooling'); cup.classList.add('cold'); raf = 0; return; }
      raf = requestAnimationFrame(tickCup);
    };
    new IntersectionObserver(es => es.forEach(e => {
      seen = e.isIntersecting;
      if (seen && !cup.classList.contains('cold')) { cup.classList.add('hot'); if (!raf) raf = requestAnimationFrame(tickCup); }
    })).observe(q('#part-4'));
    document.addEventListener('visibilitychange', () => { if (!document.hidden && seen && !raf && !cup.classList.contains('cold')) raf = requestAnimationFrame(tickCup); });
  }

  /* ---- 7. пара добрых слов: звёздочки только для себя ---- */
  const rateP = q('.k-rate') && q('.k-rate').closest('p');
  if (rateP) {
    const box = document.createElement('div'); box.className = 'rate'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Оценка курьеру, только для себя');
    const STAR = '<svg viewBox="0 0 24 24"><path d="M12 3.2l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.5l6.1-.7z"/></svg>';
    const stars = [1, 2, 3, 4, 5].map(n => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', n + ' из 5'); b.innerHTML = STAR; box.appendChild(b); return b; });
    const cap = document.createElement('span'); cap.className = 'r-cap'; box.appendChild(cap);
    rateP.after(box);
    const CAP0 = 'пара добрых слов курьеру, только для себя', CAP1 = 'хорошее замечено';
    const show = (n, fresh) => {
      stars.forEach((b, k) => {
        const on = k < n;
        if (fresh && on && !b.classList.contains('on')) setTimeout(() => { b.classList.add('on'); anim(b, [{transform: 'scale(.82)'}, {transform: 'scale(1.18)', offset: .55}, {transform: 'scale(1)'}], {duration: 380, easing: 'ease-out'}); }, k * 70);
        else b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      cap.textContent = n ? CAP1 : CAP0;
      if (fresh) anim(cap, [{opacity: 0}, {opacity: 1}], {duration: 500});
    };
    show(store.get('stars', 0));
    stars.forEach((b, k) => {
      // звёздочка вдавливается под пальцем и теплеет, когда палец отпускает
      b.addEventListener('pointerdown', () => b.classList.add('press'));
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => b.classList.remove('press')));
      b.addEventListener('click', () => { const n = k + 1; stars.forEach(s => s.classList.remove('on')); store.set('stars', n); show(n, true); });
    });
  }

  /* ---- 9. тонкая линейка с нулём; в конце ноль стирается ластиком ---- */
  const ruler = q('#ruler'), zero = q('#r-zero'), col = q('#col'), card = q('.card');
  let erased = store.get('erased', false);
  if (erased && zero) zero.classList.add('gone');
  function erase() {
    if (erased || !zero) return;
    if (pushBusy) { setTimeout(erase, 700); return; } // ластик ждёт, пока уедет уведомление, иначе его не видно
    erased = true; store.set('erased', true);
    if (RM) { zero.classList.add('gone'); return; }
    const er = document.createElement('i'); er.className = 'r-eraser'; ruler.appendChild(er);
    const sm = document.createElement('i'); sm.className = 'r-smudge'; sm.style.opacity = '0'; ruler.appendChild(sm);
    const a = er.animate([
      {transform: 'translate(-6px,-10px)', opacity: 0}, {transform: 'translate(0,0)', opacity: 1, offset: .12},
      {transform: 'translate(30px,1px)', offset: .26}, {transform: 'translate(2px,0)', offset: .4}, {transform: 'translate(32px,1px)', offset: .54},
      {transform: 'translate(4px,0)', offset: .68}, {transform: 'translate(26px,1px)', offset: .82}, {transform: 'translate(40px,-12px)', opacity: 0}
    ], {duration: 1500, easing: 'ease-in-out'});
    setTimeout(() => { zero.classList.add('gone'); sm.animate([{opacity: 0}, {opacity: 1, offset: .3}, {opacity: .5}], {duration: 2200, fill: 'forwards'}); }, 250);
    // крошки резинки падают вниз
    for (let n = 0; n < 6; n++) setTimeout(() => {
      const c = document.createElement('i'); c.className = 'r-crumb'; c.style.left = (18 + Math.random() * 32) + 'px'; c.style.bottom = '12px'; ruler.appendChild(c);
      c.animate([{transform: 'translate(0,0)', opacity: 1}, {transform: `translate(${(Math.random() - .5) * 10}px, 14px)`, opacity: 0}], {duration: 700, easing: 'cubic-bezier(.5,0,1,1)'}).onfinish = () => c.remove();
    }, 300 + n * 160);
    a.onfinish = () => er.remove();
  }
  if (ruler && col) {
    let pend = false;
    const upd = () => {
      pend = false;
      const top = col.offsetTop, h = col.offsetHeight, y = scrollY + innerHeight * .5;
      const p = Math.max(0, Math.min(1, (y - top) / h));
      ruler.style.setProperty('--p', p.toFixed(4));
      ruler.classList.toggle('on', card ? card.getBoundingClientRect().bottom < 0 : scrollY > 300);
    };
    addEventListener('scroll', () => { if (!pend) { pend = true; requestAnimationFrame(upd); } }, {passive: true});
    addEventListener('resize', upd); upd();
    const lastP = qa('#part-5 p').pop();
    when(lastP, () => setTimeout(erase, 500), .75);
  }

  /* ---- 10. марка отклеивается уголком, если её подержать ---- */
  const stamp = q('.stamp'), flap = q('.stamp-flap');
  if (stamp && flap) {
    let peel = 0, holding = false, raf = 0, last = 0, done = false;
    const MAX = 1;
    const setPeel = v => { peel = v; stamp.style.setProperty('--peel', v.toFixed(3)); flap.style.setProperty('--peel', v.toFixed(3)); };
    const springTo = (target, after) => {
      cancelAnimationFrame(raf);
      let v = 0, x = peel; const step = () => {
        // пружина с затуханием: уголок шлёпается обратно и чуть подрагивает
        v += (target - x) * .18; v *= .72; x += v; setPeel(Math.max(0, x));
        if (Math.abs(target - x) > .002 || Math.abs(v) > .002) raf = requestAnimationFrame(step); else { setPeel(target); after && after(); }
      };
      raf = requestAnimationFrame(step);
    };
    const grow = t => {
      if (!holding) return;
      if (last) peel += (t - last) / 900 * (0.35 + peel * 1.3); // сначала клей держит, потом уголок поддаётся всё легче
      last = t;
      if (peel >= MAX) { holding = false; done = true; springTo(MAX); return; }
      setPeel(peel); raf = requestAnimationFrame(grow);
    };
    stamp.addEventListener('contextmenu', e => e.preventDefault());
    stamp.addEventListener('pointerdown', e => {
      e.preventDefault(); stamp.setPointerCapture && stamp.setPointerCapture(e.pointerId);
      if (done) { done = false; springTo(0); return; }
      if (RM) { done = true; setPeel(MAX); return; }
      holding = true; last = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(grow);
    });
    const release = () => { if (!holding) return; holding = false; if (!done) springTo(0); };
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => stamp.addEventListener(ev, release));
    stamp.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && !done && !holding) springTo(.07); });
    stamp.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !done && !holding) springTo(0); });
  }
})();
