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


# ---------- шумы для эпизодов 2–6 ----------
def door_sfx(v=0.5):
    return np.concatenate([creak(0.5, 0.32), np.zeros(int(0.02 * SR))])[: int(0.34 * SR)] * v + np.pad(pin(0.4), (int(0.3 * SR), 0))[: int(0.34 * SR)] * 0.0


def putter(dur=2.5, f0=24, f1=30, v=0.5, sweet=False):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 + (f1 - f0) * (t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    pulses = (np.sin(ph) > 0.6).astype(float)
    body = bp(pulses + noise(n) * 0.06, 90, 900) * 0.9 + bp(noise(n), 1500, 4000) * pulses * 0.12
    e = np.minimum(1, t / 0.15) * np.minimum(1, (dur - t) / 0.3)
    y = body * e
    if sweet:
        for k, m in enumerate((74, 78, 81, 86)):
            st = int(k * dur / 4 * SR); tt = np.arange(n - st) / SR
            y[st:] += np.sin(2 * np.pi * midi(m) * tt) * np.exp(-tt / 0.25) * 0.12
    return y * v


def brake(v=0.5):
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 2100 - 500 * t / 0.45
    sq = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12) * 0.25
    return (sq + thud(0.5, 80)[:n] * 0.5) * v


def pop(v=0.5):
    n = int(0.14 * SR); t = np.arange(n) / SR
    f = 900 * np.exp(-t / 0.03) + 250
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.04) + hp(noise(n), 3000) * np.exp(-t / 0.003) * 0.4) * v


def scrape(v=0.4, dur=0.35):
    n = int(dur * SR); t = np.arange(n) / SR
    am = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 34 * t))
    return bp(noise(n), 2500, 7000) * am * np.sin(np.pi * t / dur) * v * 0.6


def wclick(v=0.5):
    n = int(0.09 * SR); t = np.arange(n) / SR
    return (bp(noise(n), 800, 5000) * np.exp(-t / 0.006) + np.sin(2 * np.pi * 900 * t) * np.exp(-t / 0.02) * 0.4) * v


def snip(v=0.5):
    out = np.zeros(int(0.3 * SR))
    for k, f in ((0, 4200), (0.11, 3800)):
        n = int(0.15 * SR); t = np.arange(n) / SR; i = int(k * SR)
        out[i:i + n] += (hp(noise(n), 3000) * np.exp(-t / 0.004) * 0.6 + np.sin(2 * np.pi * f * t) * np.exp(-t / 0.05) * 0.25)
    return out * v


def crumble_sfx(v=0.5, dur=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    rate = 120 * np.sin(np.pi * t / dur) + 10
    imp = (rng.random(n) < rate / SR).astype(float) * (0.3 + rng.random(n))
    g = fftconvolve(imp, np.exp(-np.arange(int(0.004 * SR)) / (0.001 * SR)) * noise(int(0.004 * SR)), mode='full')[:n]
    return bp(g, 1500, 8000) * v


def tissue(v=0.3, dur=1.2):
    n = int(dur * SR); t = np.arange(n) / SR
    am = 0.6 + 0.4 * np.sin(2 * np.pi * 3 * t + 2 * np.sin(2 * np.pi * 7 * t))
    return bp(noise(n), 2500, 9000) * am * np.sin(np.pi * t / dur) ** 1.2 * v * 0.35


def stamp(v=0.5):
    n = int(0.3 * SR); t = np.arange(n) / SR
    return (thud(0.7, 95)[:n] + lp(noise(n), 1200) * np.exp(-t / 0.02) * 0.5) * v


def gong(v=1.0, f0=98, dur=4.5):
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for r, a, d in ((1, 1, 3.2), (1.49, .6, 2.4), (2.02, .5, 2.0), (2.57, .38, 1.6), (3.13, .3, 1.2), (4.21, .2, .8), (5.4, .12, .5)):
        f = f0 * r * (1 + 0.01 * np.exp(-t / 0.3))
        y += a * np.sin(2 * np.pi * np.cumsum(f) / SR + rng.random() * 6) * np.exp(-t / d)
    y *= (1 + 0.15 * np.sin(2 * np.pi * 4.5 * t))
    hit = lp(noise(n), 2500) * np.exp(-t / 0.02) * 0.8
    return (y * 0.5 + hit) * env(n, 0.002) * v


def zap(v=0.4):
    n = int(0.35 * SR); t = np.arange(n) / SR
    f = 1600 * np.exp(-t / 0.12) + 200
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    return lp(saw, 4000) * np.exp(-t / 0.12) * v * 0.4


def gasp(v=0.4):
    n = int(0.32 * SR); t = np.arange(n) / SR
    return bp(noise(n), 700, 2600) * np.sin(np.pi * np.minimum(1, t / 0.28)) ** 2 * v * 0.6


def beam(v=0.5):
    a = creak(v, 0.9) * 0.8; b = np.pad(creak(v * 0.6, 0.5), (int(0.35 * SR), 0))
    n = max(len(a), len(b)); return np.pad(a, (0, n - len(a))) + np.pad(b, (0, n - len(b)))


def hop(v=0.5):
    return flop(0.5)[: int(0.3 * SR)] * v + slide(0.25, 0.3) * v


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


# ---------- музыка эпизода 2 ----------
def ostinato(mx, b0, b1, pat, vel=(0.4, 0.26), pan=0.15, fade=None):
    for beat in range(b0, b1):
        for half in range(2):
            m = pat[((beat - b0) // 2) % len(pat)][(beat % 2) * 2 + half]
            k = 1 if fade is None else max(0.0, 1 - (beat - b0) / fade)
            mx.add('m', beat * BEAT + half * BEAT / 2, kalimba(midi(m), vel=vel[half] * k), pan=-pan + 2 * pan * half)


def score_ep2(mx):
    b = lambda k: k * BEAT
    # А. двор: тема серии, ре мажор
    pat = [[74, 69, 78, 69], [76, 69, 78, 69], [74, 69, 81, 78], [76, 71, 78, 69]]
    ostinato(mx, 0, 8, pat)
    mx.add('m', b(0), pad([50, 54, 57], 4.8, vel=0.5)); mx.add('m', b(0), bass(midi(38), 2.4, 0.5)); mx.add('m', b(4), bass(midi(43), 2.4, 0.5))
    # раздражение: тема съезжает в минор, бас на полтона
    patm = [[74, 69, 77, 69], [75, 69, 77, 70]]
    ostinato(mx, 8, 14, patm, vel=(0.34, 0.2))
    mx.add('m', b(8), pad([50, 53, 56], 3.6, vel=0.45)); mx.add('m', b(8), bass(midi(37), 2.4, 0.5)); mx.add('m', b(12), bass(midi(38), 1.2, 0.45))
    # Б. планка: гул и редкая глухая маримба вниз
    mx.add('m', b(14), pad([38, 45, 50], 12.0 * BEAT, vel=0.42, att=1.2, rel=0.8))
    for k, m in enumerate([62, 61, 58, 57, 55, 53]):
        mx.add('m', b(15 + k * 2), marimba(midi(m), dur=1.0, vel=0.28))
    for k, m in enumerate([74, 72, 69, 65]):
        mx.add('m', b(20) + k * BEAT / 2, kalimba(midi(m), dur=0.6, vel=0.3, damp=True), pan=-0.2)
    # В. второй двор: соль мажор, светлее и шире
    patg = [[79, 74, 83, 74], [81, 74, 83, 76], [79, 74, 86, 83], [81, 76, 83, 74]]
    ostinato(mx, 28, 40, patg, vel=(0.38, 0.24))
    for i, ch in enumerate(([43, 47, 50, 55], [40, 47, 52, 55], [36, 43, 48, 52])):
        mx.add('m', b(28 + i * 4), pad(ch, 2.5, vel=0.5)); mx.add('m', b(28 + i * 4), bass(midi(ch[0]), 2.3, 0.48))
    mx.add('m', b(33), pad([55, 59, 62, 67], 3.0, vel=0.35, att=0.3))
    # Г. автомат: механический пульс маримбы восьмыми
    seq = [62, 69, 62, 69, 62, 69, 64, 69]
    for k in range(2 * (52 - 40)):
        tt = b(40) + k * BEAT / 2
        mx.add('m', tt, marimba(midi(seq[k % 8]), dur=0.5, vel=0.22 if k % 2 else 0.3), pan=0.3 if k % 2 else -0.1)
    for i in range(3):
        mx.add('m', b(40 + i * 4), bass(midi(38), 1.0, 0.42)); mx.add('m', b(42 + i * 4), bass(midi(45), 1.0, 0.38))
    mx.add('m', b(40), pad([50, 57], 7.5, vel=0.3, att=0.8, rel=0.3))
    # удар гонга — музыка обрывается, остаётся низкий гул
    mx.add('m', b(52), pad([26, 38], 4.0, vel=0.35, att=0.4, rel=1.0))
    # Д. весы: медленные низкие ноты вниз и последняя ре
    for k, m in enumerate([50, 48, 46, 45]):
        mx.add('m', b(56 + k * 2), piano_low([m - 12, m], 2.4, 0.55))
    mx.add('m', b(56), pad([38, 45, 50], 5.0, vel=0.35, att=1.0))
    mx.add('m', b(63), kalimba(midi(62), dur=2.6, vel=0.3, damp=False))


# ---------- шумы эпизода 3 ----------
def car(v=0.5, dur=1.3):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 95 * (1.12 - 0.24 / (1 + np.exp(-(t - dur * .45) / 0.08)))
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    e = np.exp(-((t - dur * .45) / (dur * .26)) ** 2)
    return (lp(saw, 700) * 0.6 + bp(noise(n), 300, 2500) * 0.5) * e * v


def splat(v=0.6):
    n = int(0.4 * SR); t = np.arange(n) / SR
    return (lp(noise(n), 900) * np.exp(-t / 0.05) * 1.2 + thud(0.4, 60)[:n] * 0.6 + bp(noise(n), 1200, 4000) * np.exp(-t / 0.015) * 0.4) * v


def twang(v=0.4, dur=1.2):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 150 * (1 + 0.06 * np.sin(2 * np.pi * 11 * t) * np.exp(-t / 0.5))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.4 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return y * np.exp(-t / 0.35) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 11 * t))) * v * 0.5


def fanfare(v=0.4):
    out = np.zeros(int(1.5 * SR))
    for k, (m, d) in enumerate(((67, .14), (72, .14), (76, .14), (79, .7))):
        n = int(d * SR) + int(0.1 * SR); t = np.arange(n) / SR
        f = midi(m) * (1 + 0.012 * np.sin(2 * np.pi * 6 * t))
        saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
        y = lp(saw, 1800) * np.minimum(1, t / 0.02) * np.minimum(1, (n / SR - t) / 0.08)
        i = int(k * 0.16 * SR); out[i:i + n] += y[: len(out) - i]
    return out * v * 0.35


def staple(v=0.5):
    n = int(0.18 * SR); t = np.arange(n) / SR
    return (hp(noise(n), 4000) * np.exp(-t / 0.003) + np.sin(2 * np.pi * 3100 * t) * np.exp(-t / 0.03) * 0.3 + thud(0.3, 140)[:n] * 0.4) * v


def thunder(v=0.7, dur=3.0):
    n = int(dur * SR); t = np.arange(n) / SR
    rum = lp(noise(n), 160, 4) * 3.0 * (np.minimum(1, t / 0.08) * np.exp(-t / (dur / 3)))
    cr = bp(noise(n), 400, 3000) * np.exp(-t / 0.12) * 0.5
    return (rum + cr) * (1 + 0.4 * lp(noise(n), 6)) * v


def breath(v=0.35, dur=2.5):
    n = int(dur * SR); t = np.arange(n) / SR
    am = np.abs(np.sin(np.pi * t / (dur / 3))) ** 1.5
    return bp(noise(n), 400, 1600) * am * v * 0.5


def rumble(v=0.6, dur=2.0):
    n = int(dur * SR); t = np.arange(n) / SR
    return lp(noise(n), 120, 4) * 3.5 * (t / dur) ** 1.5 * v + np.sin(2 * np.pi * 41 * t) * (t / dur) ** 2 * 0.3 * v


def boing(v=0.5):
    n = int(0.6 * SR); t = np.arange(n) / SR
    f = 260 + 180 * np.exp(-t / 0.15) * np.sin(2 * np.pi * 9 * t) + 120 * t
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.18) * v * 0.5


def latch(v=0.5):
    out = np.zeros(int(0.25 * SR)); a = wclick(v); c = staple(v * 0.6)
    out[: len(a)] += a; i = int(0.08 * SR); out[i:i + len(c)] += c[: len(out) - i]
    return out


# ---------- музыка эпизода 3 ----------
def score_ep3(mx):
    b = lambda k: k * BEAT
    pat = [[74, 69, 78, 69], [76, 69, 78, 69]]
    # А. прогулка с уровнем: тема серии
    ostinato(mx, 0, 5, pat)
    mx.add('m', b(0), pad([50, 54, 57], 3.4, vel=0.45)); mx.add('m', b(0), bass(midi(38), 2.4, 0.45))
    # брызги: тема ломается в минор; гармошка растёт — шаги вверх
    mx.add('m', b(4.5), pad([50, 53, 56], 3.0, vel=0.42, att=0.3)); mx.add('m', b(5), bass(midi(37), 2.2, 0.48))
    for k, m in enumerate([62, 64, 65, 67, 69]):
        mx.add('m', b(6) + k * BEAT / 2, marimba(midi(m), dur=0.6, vel=0.3), pan=-0.3 + k * 0.15)
    # Б. карусель: настойчивое кружение, с каждым «залпом» плотнее
    cir = [[74, 70, 77, 70], [74, 70, 79, 77], [73, 69, 76, 69], [74, 70, 77, 81]]
    ostinato(mx, 10, 20, cir, vel=(0.36, 0.24), pan=0.3)
    for i, ch in enumerate(([38, 45, 50, 53], [34, 41, 46, 50], [33, 40, 45, 49], [34, 41, 46, 50], [38, 45, 50, 53])):
        mx.add('m', b(10 + i * 2), bass(midi(ch[0]), 1.2, 0.42 + i * 0.03)); mx.add('m', b(10 + i * 2), pad(ch[1:], 1.3, vel=0.3 + i * 0.04, att=0.1, rel=0.5))
    for k in range(8):
        mx.add('m', b(14) + k * BEAT / 2, marimba(midi(50 + (k % 4) * 3), dur=0.4, vel=0.18 + k * 0.02), pan=0.2)
    # В. стена и колючки: гул, редкие глухие удары
    mx.add('m', b(20), pad([38, 44, 50], 4.0, vel=0.38, att=0.6, rel=0.6))
    for k, m in enumerate([62, 61, 60]):
        mx.add('m', b(22 + k), marimba(midi(m), dur=0.9, vel=0.26))
    # страх: низкий кластер, потом тишина
    mx.add('m', b(24), pad([26, 32, 38, 39], 4.2, vel=0.45, att=1.0, rel=0.4))
    # Г. три слоя: дыхание, ноты вверх на каждом слое, свет
    mx.add('m', b(31), pad([50, 57, 62], 8 * BEAT, vel=0.3, att=1.2, rel=0.6))
    for i, (tt, ch) in enumerate(((20.625, [62, 66]), (22.5, [66, 69]), (23.75, [69, 74]))):
        for k, m in enumerate(ch): mx.add('m', tt + k * 0.05, kalimba(midi(m), dur=2.0, vel=0.34), pan=(i - 1) * 0.3)
    # Д. щит в руке: тема в ре мажоре уверенно и шире
    patd = [[74, 69, 78, 69], [76, 69, 81, 78], [74, 69, 78, 69], [76, 71, 83, 81]]
    ostinato(mx, 39, 48, patd, vel=(0.4, 0.26))
    for i, ch in enumerate(([38, 50, 54, 57], [43, 50, 55, 59], [35, 50, 54, 59], [43, 50, 55, 57])):
        if 39 + i * 2.25 < 48:
            mx.add('m', b(39 + i * 2.25), pad(ch[1:], 1.6, vel=0.42)); mx.add('m', b(39 + i * 2.25), bass(midi(ch[0]), 1.5, 0.45))
    # Е. чужая тень: тихо и тяжело
    mx.add('m', b(48), pad([45, 48, 52], 4.8, vel=0.34, att=0.8, rel=0.6)); mx.add('m', b(48), bass(midi(33), 2.8, 0.4))
    for k, m in enumerate([64, 62, 60]):
        mx.add('m', b(49 + k * 1.5), piano_low([m - 12, m], 1.6, 0.35))
    # подъём планки: восходящие ноты
    for k, m in enumerate([57, 62, 66, 69]):
        mx.add('m', 33.1 + k * 0.3125 * 1.25, marimba(midi(m), dur=0.8, vel=0.3), pan=0.2)
    # Ж. тень рассыпалась: тепло, соль — ре
    mx.add('m', b(56), pad([55, 59, 62, 67], 2.6, vel=0.45, att=0.3)); mx.add('m', b(56), bass(midi(43), 2.4, 0.45))
    mx.add('m', b(60), pad([50, 54, 57, 62], 3.6, vel=0.45, att=0.5)); mx.add('m', b(60), bass(midi(38), 3.0, 0.45))
    ostinato(mx, 58, 63, [[74, 69, 78, 69], [76, 69, 81, 78]], vel=(0.3, 0.2), fade=6)
    mx.add('m', b(63), kalimba(midi(74), dur=2.6, vel=0.3))


# ---------- шумы эпизода 4 ----------
def clank(v=0.5):
    n = int(0.5 * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for f, a, d in ((523, 1, .18), (1187, .6, .12), (1931, .4, .08), (2797, .25, .05)):
        y += a * np.sin(2 * np.pi * f * t) * np.exp(-t / d)
    return (y * 0.3 + hp(noise(n), 2000) * np.exp(-t / 0.004) * 0.4) * v


def sigh(v=0.4, dur=0.9):
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for m in (62, 65, 69):
        f = midi(m) * (1 - 0.06 * (t / dur) ** 1.5)
        saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
        y += lp(saw, 1400)
    return y * np.sin(np.pi * np.minimum(1, t / dur)) ** 1.5 * v * 0.18


def ticks(dur=4.0, rate=8, v=0.3):
    n = int(dur * SR); y = np.zeros(n)
    for k in range(int(dur * rate)):
        i = int(k / rate * SR); c = wclick(v * (0.7 + 0.3 * rng.random()))
        y[i:i + len(c)] += c[: n - i]
    return y


def buzz(dur=2.5, v=0.3):
    n = int(dur * SR); t = np.arange(n) / SR
    hum = np.sin(2 * np.pi * 100 * t) + 0.5 * np.sin(2 * np.pi * 200 * t) + 0.3 * np.sign(np.sin(2 * np.pi * 50 * t)) * 0.3
    gate = (lp(rng.random(n), 12) > 0.5).astype(float) * 0.7 + 0.3
    return lp(hum, 900) * gate * np.minimum(1, t / 0.2) * np.minimum(1, (dur - t) / 0.2) * v * 0.25


def hammer(v=0.6):
    n = int(0.4 * SR); t = np.arange(n) / SR
    ring = np.sin(2 * np.pi * 2300 * t) * np.exp(-t / 0.03) * 0.25 + np.sin(2 * np.pi * 3400 * t) * np.exp(-t / 0.02) * 0.15
    return (thud(0.7, 140)[:n] + ring + bp(noise(n), 1000, 6000) * np.exp(-t / 0.006) * 0.5) * v


def clay(v=0.5):
    n = int(0.35 * SR); t = np.arange(n) / SR
    return (thud(0.8, 85)[:n] + bp(noise(n), 300, 2500) * np.exp(-t / 0.03) * 0.5 * (1 + 0.5 * np.sign(np.sin(2 * np.pi * 60 * t)))) * v


def pat(v=0.4):
    n = int(0.15 * SR); t = np.arange(n) / SR
    return (lp(noise(n), 1500) * np.exp(-t / 0.015) + np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.03) * 0.4) * v


def birdcall(v=0.4):
    out = np.zeros(int(0.7 * SR))
    for k, (f0, f1) in enumerate(((1700, 2500), (1900, 2900))):
        n = int(0.22 * SR); t = np.arange(n) / SR
        f = f0 + (f1 - f0) * (t / 0.22) ** 0.7 + 90 * np.sin(2 * np.pi * 28 * t)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.22) ** 1.5
        i = int(k * 0.27 * SR); out[i:i + n] += y
    return out * v * 0.35


# ---------- музыка эпизода 4 ----------
def score_ep4(mx):
    b = lambda k: k * BEAT
    pat = [[74, 69, 78, 69], [76, 69, 78, 69]]
    # А. гантель: тема серии, на надрезах съезжает вниз
    ostinato(mx, 0, 4, pat, vel=(0.36, 0.22))
    mx.add('m', b(0), pad([50, 54, 57], 3.0, vel=0.42)); mx.add('m', b(0), bass(midi(38), 2.4, 0.42))
    ostinato(mx, 4, 7, [[74, 69, 77, 69], [73, 69, 76, 68]], vel=(0.3, 0.18))
    mx.add('m', b(4), pad([50, 53, 57], 2.2, vel=0.38)); mx.add('m', b(4), bass(midi(37), 2.0, 0.4))
    mx.add('m', b(8), pad([45, 50, 53], 2.4, vel=0.32, att=0.6))
    # шаги к стене с дисками: лёгкая калимба
    ostinato(mx, 10, 14, [[69, 74, 76, 74], [71, 74, 78, 74]], vel=(0.28, 0.18), pan=0.25)
    # Б. механизм: с каждым диском аккорд на ступень выше, пульс маримбы
    for k in range(2 * (22 - 14)):
        tt = b(14) + k * BEAT / 2
        mx.add('m', tt, marimba(midi([62, 69, 66, 69][k % 4] + (k // 4)), dur=0.45, vel=0.18 + k * 0.006), pan=0.25 if k % 2 else -0.15)
    for i, ch in enumerate(([38, 50, 54, 57], [40, 52, 55, 59], [42, 54, 57, 61], [43, 55, 59, 62])):
        mx.add('m', b(14 + i * 2), pad(ch[1:], 1.4, vel=0.32 + i * 0.03, att=0.15, rel=0.5)); mx.add('m', b(14 + i * 2), bass(midi(ch[0]), 1.2, 0.38))
    # упрямый диск: подвешенный аккорд, ожидание
    for k in range(3):
        mx.add('m', b(22 + k), pad([57, 62, 64, 69], 0.9, vel=0.3, att=0.05, rel=0.4)); mx.add('m', b(22 + k), bass(midi(45), 0.8, 0.36))
    # удар планки: тишина, низкое пианино
    mx.add('m', b(26), piano_low([38, 50], 2.4, 0.4)); mx.add('m', b(28), piano_low([36, 48], 2.0, 0.32))
    # В. порог: молоток в долю, мелочи прыгают — короткая фраза вверх и ответ вниз
    mx.add('m', b(30), pad([43, 50, 55], 3.6, vel=0.3, att=0.4))
    for r, t0 in enumerate((22.5, 23.75, 25.0)):
        for k, m in enumerate([74, 78, 81 + r]):
            mx.add('m', t0 + k * 0.08, kalimba(midi(m), dur=0.9, vel=0.26), pan=-0.3 + k * 0.3)
        for k, m in enumerate([79, 76, 74 - r]):
            mx.add('m', t0 + 0.5 + k * 0.1, kalimba(midi(m), dur=0.9, vel=0.2, damp=True), pan=0.3 - k * 0.3)
    mx.add('m', b(36), pad([43, 47, 50], 2.6, vel=0.3)); mx.add('m', b(40), pad([40, 47, 52], 3.2, vel=0.3, att=0.8))
    # Г. первый кирпич: тихо, потом тёплый пульс маримбы и тема в ре мажоре
    mx.add('m', b(44), pad([38, 45, 50], 4.0, vel=0.28, att=1.0))
    mx.add('m', b(48), pad([43, 50, 55, 59], 3.0, vel=0.32, att=0.6)); mx.add('m', b(48), bass(midi(43), 2.4, 0.38))
    mx.add('m', b(52), pad([45, 50, 54, 57], 2.4, vel=0.32, att=0.4))
    for k in range(2 * (64 - 55)):
        tt = 34.7 + k * BEAT / 2
        if tt < 39.6: mx.add('m', tt, marimba(midi([50, 57, 54, 57][k % 4]), dur=0.5, vel=0.16 + min(k, 8) * 0.012), pan=-0.2 if k % 2 else 0.15)
    ostinato(mx, 57, 63, [[74, 69, 78, 69], [76, 71, 81, 78]], vel=(0.34, 0.22), fade=8)
    mx.add('m', b(56), pad([50, 54, 57, 62], 2.6, vel=0.42)); mx.add('m', b(56), bass(midi(38), 2.4, 0.42))
    mx.add('m', b(60), pad([43, 50, 55, 59], 2.4, vel=0.4)); mx.add('m', b(60), bass(midi(43), 2.2, 0.4))
    mx.add('m', b(62), pad([50, 54, 57, 62, 66], 2.6, vel=0.36, att=0.3)); mx.add('m', b(63), kalimba(midi(78), dur=2.6, vel=0.3))


# ---------- шумы эпизода 5 ----------
def clink(v=0.45):
    n = int(0.6 * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for f, a, d in ((1320, 1, .25), (2510, .5, .15), (3870, .3, .08)):
        y += a * np.sin(2 * np.pi * f * t) * np.exp(-t / d)
    th = thud(0.3, 160); th = np.pad(th, (0, max(0, n - len(th))))[:n]
    return (y * 0.25 + th * 0.5) * v


def bubble(dur=2.0, v=0.3):
    n = int(dur * SR); y = np.zeros(n)
    for k in range(int(dur * 9)):
        i = int(rng.random() * (n - 0.06 * SR)); m = int(0.05 * SR); tt = np.arange(m) / SR
        f = 300 + rng.random() * 500
        y[i:i + m] += np.sin(2 * np.pi * np.cumsum(f * (1 + tt * 12)) / SR) * np.exp(-tt / 0.012)
    return y * np.minimum(1, np.arange(n) / SR / 0.3) * v * 0.3


def blocks(v=0.5):
    out = np.zeros(int(0.45 * SR))
    for k, f in ((0, 620), (0.09, 540), (0.16, 700)):
        n = int(0.12 * SR); t = np.arange(n) / SR; i = int(k * SR)
        out[i:i + n] += (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.025) + bp(noise(n), 800, 4000) * np.exp(-t / 0.004) * 0.6) * (1 - k * 2)
    return out * v


def popper(v=0.6):
    n = int(0.9 * SR); t = np.arange(n) / SR
    y = pop(0.9)[:n] if len(pop(0.9)) >= n else np.pad(pop(0.9), (0, n - len(pop(0.9))))
    return (y + crumble_sfx(0.3, 0.9)[:n] * 0.6) * v


def bell(v=0.4, f0=1568):
    n = int(2.4 * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for r, a, d in ((1, 1, 1.2), (2.76, .4, .5), (5.4, .2, .25), (8.9, .1, .12)):
        y += a * np.sin(2 * np.pi * f0 * r * t) * np.exp(-t / d)
    return y * env(n, 0.002) * v * 0.3


# ---------- музыка эпизода 5 ----------
def score_ep5(mx):
    b = lambda k: k * BEAT
    # А. дом в разрезе: тихий пэд, редкая калимба
    mx.add('m', b(0), pad([50, 57, 62], 5.0, vel=0.32, att=1.4))
    for k, m in enumerate([74, 78, 76, 69]):
        mx.add('m', b(2 + k * 2), kalimba(midi(m), dur=2.2, vel=0.26), pan=-0.3 + k * 0.2)
    # Б. ужин: тема серии мягко, колпак — серая пауза
    ostinato(mx, 8, 11, [[74, 69, 78, 69], [76, 69, 78, 69]], vel=(0.32, 0.2))
    mx.add('m', b(8), pad([50, 54, 57], 2.0, vel=0.36)); mx.add('m', b(8), bass(midi(38), 1.8, 0.4))
    mx.add('m', b(11.5), pad([45, 48, 52], 3.4, vel=0.3, att=0.3))
    # снял кальку: тёплые аккорды «гитары» — калимба перебором
    arp = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61]]
    for i, ch in enumerate(arp + arp[:2]):
        t0 = b(17 + i * 2)
        mx.add('m', t0, bass(midi(ch[0]), 1.2, 0.38))
        for k, m in enumerate(ch[1:] + [ch[2] + 12]):
            mx.add('m', t0 + k * BEAT / 2, kalimba(midi(m + 12), dur=1.4, vel=0.26), pan=-0.3 + k * 0.2)
        mx.add('m', t0, pad([m + 12 for m in ch[1:]], 1.3, vel=0.24, att=0.2, rel=0.6))
    # В. детская: лёгкая тема выше, призрак линейки — минорная тень, росток — подъём
    ostinato(mx, 30, 34, [[81, 76, 83, 76], [79, 76, 83, 76]], vel=(0.3, 0.18), pan=0.25)
    mx.add('m', b(30), pad([55, 59, 62], 2.4, vel=0.3)); mx.add('m', b(34.5), pad([55, 58, 62], 1.8, vel=0.3)); mx.add('m', b(34.5), bass(midi(43), 1.6, 0.36))
    mx.add('m', b(37), pad([50, 55, 59], 2.0, vel=0.3, att=0.5))
    for k, m in enumerate([67, 71, 74, 79, 83]):
        mx.add('m', 25.0 + k * 0.0833, marimba(midi(m), dur=0.6, vel=0.26), pan=-0.2 + k * 0.1)
    ostinato(mx, 41, 48, [[79, 74, 83, 74], [81, 74, 86, 83]], vel=(0.34, 0.22))
    for i, ch in enumerate(([43, 55, 59, 62], [40, 55, 59, 64], [48, 55, 60, 64], [50, 57, 62, 66])):
        mx.add('m', b(41 + i * 2), pad(ch[1:], 1.6, vel=0.36)); mx.add('m', b(41 + i * 2), bass(midi(ch[0]), 1.4, 0.4))
    # Г. отъезд: калимба с пэдом и последняя нота
    mx.add('m', b(50), pad([50, 57, 62, 66], 6.0, vel=0.36, att=1.2))
    mx.add('m', b(50), bass(midi(38), 3.0, 0.38)); mx.add('m', b(56), pad([43, 50, 55, 59], 3.0, vel=0.34, att=0.6)); mx.add('m', b(56), bass(midi(43), 2.4, 0.36))
    mx.add('m', b(60), pad([50, 54, 57, 62], 3.4, vel=0.36, att=0.5)); mx.add('m', b(60), bass(midi(38), 3.0, 0.38))
    mx.add('m', b(63), kalimba(midi(74), dur=2.8, vel=0.3))


def score_ep6(mx):
    b = lambda k: k * BEAT
    # А. улица: тема серии в ре мажоре, колючка — короткая минорная тень
    pat = [[74, 69, 78, 69], [76, 69, 78, 69], [74, 69, 81, 78], [76, 71, 78, 69]]
    ostinato(mx, 0, 3, pat, vel=(0.32, 0.2))
    mx.add('m', b(0), pad([50, 54, 57], 2.0, vel=0.42)); mx.add('m', b(0), bass(midi(38), 1.8, 0.44))
    mx.add('m', b(3.5), pad([50, 53, 57], 1.2, vel=0.3, att=0.1, rel=0.6))
    ostinato(mx, 6, 12, pat, vel=(0.32, 0.2))
    mx.add('m', b(6), pad([50, 54, 57], 2.4, vel=0.4)); mx.add('m', b(6), bass(midi(38), 2.2, 0.42))
    mx.add('m', b(10), pad([47, 54, 59], 2.4, vel=0.38)); mx.add('m', b(10), bass(midi(47), 2.2, 0.4))
    # огонёк перешёл к прохожему: тёплый подъём
    ostinato(mx, 13, 18, [[79, 74, 83, 74], [81, 74, 86, 83]], vel=(0.34, 0.22))
    mx.add('m', b(13), pad([43, 50, 55, 59], 3.0, vel=0.42)); mx.add('m', b(13), bass(midi(43), 2.4, 0.42))
    mx.add('m', b(16), pad([45, 52, 57, 61], 2.0, vel=0.36)); mx.add('m', b(16), bass(midi(45), 1.8, 0.4))
    # Б. вечер: мелодию ведут сами окна, под ними тихий пэд
    for i, ch in enumerate(([50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59])):
        mx.add('m', b(18 + i * 4), pad(ch[1:], 4 * BEAT + 0.4, vel=0.3, att=0.8, rel=1.0)); mx.add('m', b(18 + i * 4), bass(midi(ch[0]), 2.2, 0.32))
    # В. двор из второго ролика: соль мажор, курьер вовремя
    patg = [[79, 74, 83, 74], [81, 74, 83, 76], [79, 74, 86, 83], [81, 76, 83, 74]]
    ostinato(mx, 30, 44, patg, vel=(0.36, 0.22))
    for i, ch in enumerate(([43, 47, 50, 55], [40, 47, 52, 55], [36, 43, 48, 52], [38, 45, 50, 54])):
        mx.add('m', b(30 + i * 3.5), pad(ch, 2.2, vel=0.42)); mx.add('m', b(30 + i * 3.5), bass(midi(ch[0]), 2.0, 0.44))
    # сгибы: музыка затихает до пэда, каждый сгиб — своя нота вверх
    mx.add('m', b(44), pad([43, 50, 55, 59], 6 * BEAT, vel=0.3, att=0.6, rel=0.8))
    for k, m in enumerate([67, 71, 74, 76, 79, 83]):
        mx.add('m', 28.1 + k * 0.63, kalimba(midi(m), dur=1.2, vel=0.28), pan=-0.2 + k * 0.08)
    # Г. звезда у курьера и облёт города: вся тема, широко, затем последняя нота
    ostinato(mx, 52, 64, pat, vel=(0.36, 0.22), fade=10)
    for i, ch in enumerate(([50, 57, 62, 66], [43, 50, 55, 59], [47, 54, 59, 62], [45, 52, 57, 61], [50, 57, 62, 66])):
        mx.add('m', b(50 + i * 3), pad(ch[1:], 2.4, vel=0.42)); mx.add('m', b(50 + i * 3), bass(midi(ch[0]), 2.2, 0.42))
    mx.add('m', b(65), pad([50, 54, 57, 62, 66], 3.6, vel=0.34, att=0.4))
    mx.add('m', b(66), kalimba(midi(78), dur=3.0, vel=0.3))


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
        elif ty == 'door': mx.add('s', t, creak(0.35, 0.3), p)
        elif ty == 'moped': mx.add('s', t, putter(c['dur'], 22, 30, 0.45, c.get('sweet', False)), p, 0.9)
        elif ty == 'idle': mx.add('s', t, putter(c['dur'], 15, 15, 0.22 if c.get('soft') else 0.28), p)
        elif ty == 'brake': mx.add('s', t, brake(0.5), p)
        elif ty == 'pop': mx.add('s', t, pop(0.45), p)
        elif ty == 'scrape': mx.add('s', t, scrape(v or 0.4), p)
        elif ty == 'click': mx.add('s', t, wclick(0.55), p)
        elif ty == 'shade': mx.add('s', t, whoosh(0.3, 1.2, up=False), 0, 0.6)
        elif ty == 'snip': mx.add('s', t, snip(0.5), p)
        elif ty == 'crumble': mx.add('s', t, crumble_sfx(0.55, 1.1), p)
        elif ty == 'whip': mx.add('s', t - 0.2, whoosh(0.8, 0.7, up=True), 0, 0.9)
        elif ty == 'bloom':
            for k, m in enumerate((79, 83, 86, 91)):
                mx.add('m', t + k * 0.04, kalimba(midi(m), dur=2.4, vel=0.4), (k - 1.5) * 0.25)
        elif ty == 'tissue': mx.add('s', t, tissue(0.6, 1.3), p)
        elif ty == 'soft': mx.add('m', t, pad([67, 71, 74], 1.2, vel=0.25, att=0.2, rel=1.0), p)
        elif ty == 'stamp': mx.add('s', t, stamp(v or 0.5), p)
        elif ty == 'drop': mx.add('s', t, flop(0.4), p, v or 0.4)
        elif ty == 'gong': mx.add('s', t, gong(1.0), -0.35)
        elif ty == 'zap':
            for k in range(5): mx.add('s', t + k * 0.07, zap(0.35), p + k * 0.15)
        elif ty == 'gasp': mx.add('s', t, gasp(0.5), p)
        elif ty == 'fold':
            for k in range(3): mx.add('s', t + k * 0.125, slide(0.35, 0.12), p)
        elif ty == 'hop': mx.add('s', t, hop(v or 0.6), p)
        elif ty == 'beam': mx.add('s', t, beam(0.5), 0)
        elif ty == 'car': mx.add('s', t - 0.4, car(0.55), 0)
        elif ty == 'splat': mx.add('s', t, splat(0.6), p)
        elif ty == 'ruler': mx.add('s', t, twang(0.45, c.get('dur', 1.2)), p)
        elif ty == 'fan': mx.add('s', t, slide(0.3, 0.14), p, v or 0.5); mx.add('s', t + 0.1, wclick(0.25), p)
        elif ty == 'fanfare': mx.add('m', t, fanfare(0.5), 0.1)
        elif ty == 'staple': mx.add('s', t, staple(0.5), p)
        elif ty == 'plane': mx.add('s', t, whoosh(0.3, 0.3, up=True), p, 0.6)
        elif ty == 'crunch': mx.add('s', t, crumble_sfx(v or 0.5, 0.4), p)
        elif ty == 'thunder': mx.add('s', t, thunder(v or 0.7), -0.1)
        elif ty == 'thudw': mx.add('s', t, thud(v or 0.5, 90), p)
        elif ty == 'breath': mx.add('s', t, breath(0.4, c.get('dur', 2.5)), -0.1)
        elif ty == 'rumble': mx.add('s', t, rumble(0.6, c.get('dur', 2.0)), 0)
        elif ty == 'peel': mx.add('s', t, tear(0.4, 0.4, rev=True), p, 0.7)
        elif ty == 'chord':
            for k, m in enumerate(c['notes']): mx.add('m', t + k * 0.05, kalimba(midi(m), dur=2.6, vel=0.38), (k - 2) * 0.2)
        elif ty == 'boing': mx.add('s', t, boing(0.5), p)
        elif ty == 'drone': pass
        elif ty == 'latch': mx.add('s', t, latch(0.55), p)
        elif ty == 'scatter': mx.add('s', t, crumble_sfx(0.55, 1.5), p); mx.add('s', t + 0.1, tissue(0.5, 1.4), p)
        elif ty == 'clank': mx.add('s', t, clank(v or 0.5), p)
        elif ty == 'sigh': mx.add('m', t, sigh(0.5), 0)
        elif ty == 'tick': mx.add('s', t, ticks(c.get('dur', 4.0), c.get('rate', 8), 0.28), p)
        elif ty == 'lock':
            mx.add('s', t, wclick(0.6), p); mx.add('m', t + 0.17, kalimba(midi(c['note'] + 12), dur=1.4, vel=0.3), p)
        elif ty == 'strain': mx.add('s', t, creak(0.3, 0.3), p)
        elif ty == 'buzz': mx.add('s', t, buzz(c.get('dur', 2.5), 0.35), 0)
        elif ty == 'hammer': mx.add('s', t, hammer(0.6), p)
        elif ty == 'clay': mx.add('s', t, clay(v or 0.5), p)
        elif ty == 'pat': mx.add('s', t, pat(0.45), p)
        elif ty == 'glow': mx.add('m', t, pad([62, 66, 69, 74], 2.2, vel=0.3, att=0.3, rel=1.2), 0)
        elif ty == 'bird': mx.add('s', t, birdcall(v or 0.4), p)
        elif ty == 'clink': mx.add('s', t, clink(0.45), p)
        elif ty == 'cap': mx.add('s', t - 0.1, whoosh(0.25, 0.5, up=False), 0, 0.6); mx.add('s', t, tissue(0.4, 0.6), 0)
        elif ty == 'bubble': mx.add('s', t, bubble(c.get('dur', 2.0), 0.35), p)
        elif ty == 'blocks': mx.add('s', t, blocks(0.5), p)
        elif ty == 'popper': mx.add('s', t, popper(0.55), p)
        elif ty == 'bell': mx.add('m', t, bell(0.5), p)
        elif ty == 'hinge':
            mx.add('s', t, creak(0.32, 0.35), p)
            if c.get('close'): mx.add('s', t + 0.3, thud(0.25, 120), p)
        elif ty == 'chime':
            for k, m in enumerate((86, 90, 93) if c.get('hi') else (81, 86)): mx.add('m', t + k * 0.06, kalimba(midi(m), dur=1.8, vel=0.3), p + k * 0.1)
        elif ty == 'unfurl': mx.add('m', t, pad([62, 66, 69, 74], 1.8, vel=0.26, att=0.2, rel=1.0), 0)
        elif ty == 'light': mx.add('m', t, kalimba(midi(c['note']), dur=1.4, vel=0.24), p)
        elif ty == 'crease': mx.add('s', t, slide(0.4, 0.1), p, v or 0.5); mx.add('s', t + 0.09, wclick(0.22), p)
        elif ty == 'sprout': mx.add('s', t, pop(0.25), p); mx.add('m', t, kalimba(midi(c['note']), dur=1.2, vel=0.16), p)


def main():
    ep, cues_path, out = sys.argv[1:4]
    cues = json.load(open(cues_path))
    dur = float(sys.argv[4]) if len(sys.argv) > 4 else 40.0
    mx = Mix(dur)
    {'ep1': score_ep1, 'ep2': score_ep2, 'ep3': score_ep3, 'ep4': score_ep4, 'ep5': score_ep5, 'ep6': score_ep6}[ep](mx)
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
