"""Звук эпизода: музыка (калимба, маримба, мягкий пэд) и шумовые эффекты бумаги.
Все события берутся из cues.json, который пишет render.js, поэтому звук стоит на тех же
временах, что и действие в кадре. Запуск: python3 sound.py ep1 cues.json out.wav
"""
import json, sys
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt

SR = 48000
BEAT = 0.625
rng = np.random.default_rng(11)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env(n, a=0.003, d=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / a) if a > 0 else np.ones(n)
    return e


def bp(x, lo, hi, order=2):
    sos = butter(order, [lo, hi], btype='band', fs=SR, output='sos')
    return sosfilt(sos, x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype='low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype='high', fs=SR, output='sos'), x)


class Mix:
    def __init__(self, dur):
        self.n = int(dur * SR) + SR * 3
        self.music = np.zeros((self.n, 2))
        self.sfx = np.zeros((self.n, 2))
        self.dur = dur

    def add(self, bus, t, x, pan=0.0, g=1.0):
        i = int(round(t * SR))
        if i >= self.n:
            return
        x = x[: self.n - i] * g
        # каждый звук заканчивается мягко: без обрыва нет щелчка
        f = min(int(0.04 * SR), len(x) // 4)
        if f > 1:
            x = x.copy(); x[-f:] *= 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, f))
        a = min(int(0.0015 * SR), len(x) // 8)
        if a > 1:
            x[:a] *= np.linspace(0, 1, a)
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        b = self.music if bus == 'm' else self.sfx
        b[i:i + len(x), 0] += x * l
        b[i:i + len(x), 1] += x * r


# ---------- инструменты ----------
def kalimba(f, dur=2.8, vel=1.0, damp=False):
    n = int(dur * SR); t = np.arange(n) / SR
    d = 0.11 if damp else 1.15
    y = np.sin(2 * np.pi * f * t) * np.exp(-t / d)
    y += 0.22 * np.sin(2 * np.pi * 5.95 * f * t) * np.exp(-t / (0.03 if damp else 0.1))
    y += 0.12 * np.sin(2 * np.pi * 2.0 * f * t + 0.3) * np.exp(-t / (0.06 if damp else 0.35))
    click = bp(rng.standard_normal(n), 1800, 5200) * np.exp(-t / 0.004) * 0.25
    y = (y + click) * env(n, 0.002)
    if damp:
        y = lp(y, 1400)
    return y * vel


def marimba(f, dur=1.4, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    y = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.55) + 0.32 * np.sin(2 * np.pi * 3.98 * f * t) * np.exp(-t / 0.1) + 0.1 * np.sin(2 * np.pi * 9.9 * f * t) * np.exp(-t / 0.025)
    return y * env(n, 0.003) * vel


def pad(notes, dur, vel=1.0, att=1.0, rel=1.4):
    n = int((dur + rel) * SR); t = np.arange(n) / SR
    y = np.zeros(n)
    for m in notes:
        f = midi(m)
        for det in (-0.12, 0.12):
            ff = f * 2 ** (det / 12)
            for h, a in ((1, 1), (2, 0.32), (3, 0.14), (4, 0.06)):
                y += a * np.sin(2 * np.pi * ff * h * t + rng.random() * 6.28)
    e = np.minimum(1, t / att) * np.where(t > dur, np.exp(-(t - dur) / (rel / 3)), 1)
    y = lp(y * e, 1800) / (len(notes) * 2)
    return y * vel


def bass(f, dur=1.4, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)) * np.exp(-t / 0.9) * env(n, 0.01)
    return y * vel


def piano_low(notes, dur=3.0, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for m in notes:
        f = midi(m)
        for h in range(1, 9):
            fh = f * h * np.sqrt(1 + 0.0004 * h * h)
            y += (0.9 / h) * np.sin(2 * np.pi * fh * t) * np.exp(-t / (2.2 / (1 + h * 0.4)))
    hammer = lp(rng.standard_normal(n), 900) * np.exp(-t / 0.01) * 0.6
    return lp((y + hammer) * env(n, 0.004), 2500) / len(notes) * vel


# ---------- шумы бумаги ----------
def noise(n):
    return rng.standard_normal(n)


def step(v=0.5):
    n = int(0.12 * SR); t = np.arange(n) / SR
    y = lp(noise(n), 1600) * np.exp(-t / 0.018) * 0.7 + np.sin(2 * np.pi * 130 * t) * np.exp(-t / 0.03) * 0.5
    return y * v


def thud(v=0.6, f=70):
    n = int(0.5 * SR); t = np.arange(n) / SR
    fr = f * (1 + 0.6 * np.exp(-t / 0.03))
    y = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.14) + lp(noise(n), 500) * np.exp(-t / 0.04) * 0.5
    return y * v


def creak(v=0.5, dur=0.42):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 320 + 140 * np.sin(2 * np.pi * 2.2 * t) + 60 * t / dur
    tone = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3
    am = 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 23 * t + 3 * np.sin(2 * np.pi * 5 * t)))
    y = bp(tone * am + noise(n) * 0.15, 250, 2400) * np.sin(np.pi * t / dur) ** 0.6
    return y * v


def tear(v=0.7, dur=0.62, rev=False):
    n = int(dur * SR); t = np.arange(n) / SR
    rate = 40 + 260 * (t / dur)
    imp = (rng.random(n) < rate / SR).astype(float) * (0.4 + rng.random(n))
    grains = fftconvolve(imp, np.exp(-np.arange(int(0.006 * SR)) / (0.0015 * SR)) * noise(int(0.006 * SR)), mode='full')[:n]
    y = bp(grains + noise(n) * 0.08, 1200, 7000) * np.sin(np.pi * t / dur) ** 0.4
    if rev:
        y = y[::-1]
    return y * v


def slide(v=0.5, dur=0.42):
    n = int(dur * SR); t = np.arange(n) / SR
    e = np.sin(np.pi * np.minimum(1, t / (dur * 0.85))) ** 1.2
    y = bp(noise(n), 700, 3800) * e * 0.5
    tap = np.zeros(n); k = int(dur * 0.82 * SR); tap[k:k + int(0.05 * SR)] = step(0.6)[:min(int(0.05 * SR), n - k)]
    return (y + tap) * v


def whoosh(v=0.5, dur=0.9, up=True):
    n = int(dur * SR); t = np.arange(n) / SR
    x = noise(n); out = np.zeros(n); seg = int(0.03 * SR)
    for i in range(0, n, seg):
        u = i / n; u = u if up else 1 - u
        fc = 300 + 2600 * u
        out[i:i + seg] = bp(x[max(0, i - 2000):i + seg], fc * 0.6, fc * 1.6)[-len(out[i:i + seg]):]
    return out * np.sin(np.pi * t / dur) ** 1.5 * v


def tape(v=0.7):
    n = int(0.34 * SR); t = np.arange(n) / SR
    am = (np.sin(2 * np.pi * 70 * t) > 0.2).astype(float) * 0.7 + 0.3
    y = bp(noise(n), 900, 6500) * am * np.exp(-t / 0.12) * 0.7
    slap = np.zeros(n); k = int(0.2 * SR); s = thud(0.5, 110)[: n - k]; slap[k:] += s
    s2 = lp(noise(n - k), 3000) * np.exp(-np.arange(n - k) / SR / 0.02) * 0.5; slap[k:] += s2
    return (y + slap) * v


def crack(v=0.8):
    n = int(0.6 * SR); t = np.arange(n) / SR
    click = lp(hp(noise(n), 2000), 8000) * np.exp(-t / 0.006)
    ring = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, a, d in ((2130, .4, .18), (3410, .3, .12), (5230, .2, .07)))
    return (click * 0.8 + ring * 0.5) * v


def pin(v=0.7):
    n = int(0.3 * SR); t = np.arange(n) / SR
    y = lp(hp(noise(n), 2500), 7000) * np.exp(-t / 0.004) * 0.6 + np.sin(2 * np.pi * 3600 * t) * np.exp(-t / 0.05) * 0.2 + thud(0.25, 160)[:n] * 0.6
    return y * v * 0.7


def flop(v=0.5):
    n = int(0.3 * SR); t = np.arange(n) / SR
    return (lp(noise(n), 1200) * np.exp(-t / 0.05) * 0.6 + thud(0.4, 90)[:n] * 0.6) * v


def rec_click(v=0.5):
    n = int(0.12 * SR); t = np.arange(n) / SR
    return (lp(hp(noise(n), 1500), 7000) * np.exp(-t / 0.004) + np.sin(2 * np.pi * 1900 * t) * np.exp(-t / 0.02) * 0.3) * v


def reverb(x, secs=1.1, mix=0.18):
    n = int(secs * SR); t = np.arange(n) / SR
    ir = np.stack([lp(noise(n), 6000) * np.exp(-t / (secs / 5)), lp(noise(n), 6000) * np.exp(-t / (secs / 5))], 1)
    ir[:, 0] /= np.sqrt((ir[:, 0] ** 2).sum()); ir[:, 1] /= np.sqrt((ir[:, 1] ** 2).sum())
    wet = np.stack([fftconvolve(x[:, 0], ir[:, 0])[: len(x)], fftconvolve(x[:, 1], ir[:, 1])[: len(x)]], 1)
    return x * (1 - mix) + wet * mix * 2.2


# ---------- музыка эпизода 1 ----------
def score_ep1(mx):
    b = lambda k: k * BEAT
    # А. комната: остинато калимбы восьмыми, тёплый пэд
    pat = [[74, 69, 78, 69], [76, 69, 78, 69], [74, 69, 81, 78], [76, 71, 78, 69]]
    for beat in range(12):
        for half in range(2):
            m = pat[(beat // 2) % 4][(beat % 2) * 2 + half]
            v = 0.42 if half == 0 else 0.28
            mx.add('m', b(beat) + half * BEAT / 2, kalimba(midi(m), vel=v), pan=-0.15 + 0.3 * half)
    chords = [[50, 54, 57], [47, 50, 54], [43, 47, 50]]
    for i, ch in enumerate(chords):
        mx.add('m', b(i * 4), pad(ch, 2.5, vel=0.55))
        mx.add('m', b(i * 4), bass(midi(ch[0] - 12), 2.2, 0.55))
    # Б. наезд на голову: арпеджио шестнадцатыми вверх, пэд нарастает
    arp = [62, 66, 69, 74, 78, 81, 86, 90]
    for k in range(24):
        m = arp[k % 8] + (0 if k < 8 else 0)
        mx.add('m', b(12) + k * BEAT / 4, kalimba(midi(m), dur=1.0, vel=0.18 + 0.22 * k / 24), pan=np.sin(k) * 0.4)
    mx.add('m', b(12), pad([45, 52, 57, 61], 3.75, vel=0.5, att=2.5))
    mx.add('m', b(12), bass(midi(33), 3.6, 0.5))
    # прибытие внутрь: колокольный аккорд
    for m, p in ((86, -0.3), (81, 0.0), (90, 0.3), (74, 0)):
        mx.add('m', b(18), kalimba(midi(m), dur=2.6, vel=0.32), pan=p)
    # В. шкала: редкая маримба, пэд меняется на си минор после трещины
    for i, (m, ch) in enumerate(((38, [50, 54, 57]), (43, [43, 47, 50]), (35, [47, 50, 54]))):
        mx.add('m', b(18 + i * 4), marimba(midi(m + 12), vel=0.5))
        mx.add('m', b(18 + i * 4), pad(ch, 2.5, vel=0.4))
    for k, m in enumerate([81, 78, 76, 74, 76, 71]):
        mx.add('m', b(19 + k * 2), kalimba(midi(m), vel=0.22), pan=0.2 - 0.08 * k)
    # Г. три полосы: пульс маримбы и бас восьмыми, напряжение растёт; удар плиты — низкий кластер и тишина
    seq = [38, 38, 45, 38, 43, 43, 47, 43, 40, 40, 47, 40, 42, 42, 49, 42, 38, 38, 45, 38, 43, 45]
    for k in range(22):
        tt = b(30) + k * BEAT / 2
        if tt >= b(41) - 0.01:
            break
        mx.add('m', tt, bass(midi(seq[k]), 0.9, 0.42))
    for k in range(30, 41):
        mx.add('m', b(k), marimba(midi(86), dur=0.6, vel=0.12 + 0.01 * (k - 30)), pan=0.35)
    for i, ch in enumerate(([47, 50, 54], [43, 47, 50], [40, 43, 47])):
        mx.add('m', b(30 + i * 4), pad(ch, 2.5 if i < 2 else 1.9, vel=0.42 + 0.06 * i))
    mx.add('m', b(41), piano_low([26, 33, 38, 41], 3.4, 1.0))
    # Д. планка: низкий гул, почти без музыки
    mx.add('m', b(42), pad([38, 45], 7.2, vel=0.4, att=1.5, rel=1.0))
    # Е. обратно в комнату: остинато в миноре, тише; последняя нота
    patm = [[74, 69, 77, 69], [76, 69, 77, 69], [74, 69, 81, 77], [72, 69, 76, 69]]
    for beat in range(54, 62):
        for half in range(2):
            m = patm[((beat - 54) // 2) % 4][(beat % 2) * 2 + half]
            mx.add('m', b(beat) + half * BEAT / 2, kalimba(midi(m), vel=(0.3 if half == 0 else 0.2) * (1 - (beat - 54) / 14)), pan=-0.1 + 0.2 * half)
    mx.add('m', b(54), pad([50, 53, 57], 5.0, vel=0.42, att=1.2))
    mx.add('m', b(54), bass(midi(38), 2.5, 0.45)); mx.add('m', b(58), bass(midi(34), 2.5, 0.4))
    mx.add('m', b(62), kalimba(midi(62), dur=2.8, vel=0.3))


def render_cues(mx, cues):
    for c in cues:
        t, ty, p = c['t'], c['type'], c.get('pan', 0.0)
        v = c.get('v', None)
        if ty == 'step': mx.add('s', t, step(v or 0.5), p, 0.55)
        elif ty == 'creak': mx.add('s', t, creak(v or 0.45), p)
        elif ty == 'thud': mx.add('s', t, thud(v or 0.5), p)
        elif ty == 'tear': mx.add('s', t, tear(v or 0.7, rev=c.get('rev', False)), p, 0.8)
        elif ty == 'ping':
            for k, m in enumerate(c['chord']):
                mx.add('m', t + k * 0.03, kalimba(midi(m), dur=2.2, vel=0.42), p + (k - 1) * 0.2)
        elif ty == 'crack': mx.add('s', t, crack(0.7), p)
        elif ty == 'whoosh': mx.add('s', t - 0.3, whoosh(v or 0.5, up=c.get('dir') == 'up'), p, 0.7)
        elif ty == 'slide': mx.add('s', t - 0.34, slide(0.6), p)
        elif ty == 'rustle':
            for k in range(3): mx.add('s', t + k * 0.12, slide(0.35, 0.3), (k - 1) * 0.4)
        elif ty == 'tape': mx.add('s', t - 0.2, tape(0.7), p)
        elif ty == 'slam': mx.add('s', t, thud(1.0, 55), 0); mx.add('s', t, lp(noise(int(0.3 * SR)), 1800) * np.exp(-np.arange(int(0.3 * SR)) / SR / 0.05) * 0.6, 0)
        elif ty == 'pin': mx.add('s', t, pin(v or 0.6), p)
        elif ty == 'mute': mx.add('m', t, kalimba(midi(74), dur=0.6, vel=0.45, damp=True), p)
        elif ty == 'flop': mx.add('s', t, flop(0.55), p)
        elif ty == 'rec': mx.add('s', t, rec_click(0.45), -0.5)


def main():
    ep, cues_path, out = sys.argv[1:4]
    cues = json.load(open(cues_path))
    dur = float(sys.argv[4]) if len(sys.argv) > 4 else 40.0
    mx = Mix(dur)
    {'ep1': score_ep1}[ep](mx)
    render_cues(mx, cues)
    music = reverb(mx.music, 1.6, 0.25) * 0.5
    sfx = reverb(mx.sfx, 0.7, 0.12) * 0.9
    y = music + sfx
    n = int(dur * SR)
    y = y[:n]
    # мягкий хвост в конце и защита от перегруза
    fade = int(0.6 * SR); y[-fade:] *= np.linspace(1, 0, fade)[:, None]
    # громкость по среднему уровню (около −19 dBFS), пики мягко прижимаются ниже −1 dBFS
    y = y / np.sqrt((y ** 2).mean()) * 10 ** (-19 / 20)
    y = np.where(np.abs(y) > 0.6, np.sign(y) * (0.6 + 0.3 * np.tanh((np.abs(y) - 0.6) / 0.3)), y)
    import wave
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((y * 32767).astype('<i2').tobytes())
    rms = np.sqrt((y ** 2).mean())
    print('ok', out, 'peak', round(float(np.abs(y).max()), 3), 'rms dBFS', round(20 * np.log10(rms), 1))


if __name__ == '__main__':
    main()
