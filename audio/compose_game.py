"""Realm of Loner — original game music and sound effects, composed in code.

Voices come from the vault's compose_example_bigbreak_v1_synth.py (the raw-synth sound he prefers):
saw plucks, square/sine lead, sine+square bass, detuned-saw pads, noise. No samples, nothing licensed.

Loops are rendered one tail longer than the loop, then the tail is folded back onto the start,
so they repeat without a seam. The game plays them with loopStart/loopEnd set to the loop length.

Usage: ~/.venvs/audio/bin/python compose_game.py   ->  wav/ (masters)  and  out/ (m4a for the game)
"""
import numpy as np, wave, os, subprocess, json

SR = 44100
HERE = os.path.dirname(os.path.abspath(__file__))
WAV = os.path.join(HERE, 'wav'); OUT = os.path.join(HERE, 'out')
os.makedirs(WAV, exist_ok=True); os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(11)


# ----------------------------------------------------------------- voices (from v1 synth)
def t_(dur):
    return np.arange(int(dur * SR)) / SR


def midi(n):
    return 440 * 2 ** ((n - 69) / 12)


def env(n, a=0.005, d=0.1, s=0.0, r=0.05):
    e = np.ones(n) * s
    A, D, Rr = int(a * SR), int(d * SR), int(r * SR)
    A = min(A, n)
    if A: e[:A] = np.linspace(0, 1, A, endpoint=False)
    D2 = min(D, n - A)
    if D2 > 0: e[A:A + D2] = np.linspace(1, s, D2, endpoint=False)
    if Rr and n > Rr: e[-Rr:] *= np.linspace(1, 0, Rr)
    return e


def lp(x, cutoff):
    """one-pole low-pass (vectorised per block for speed; cutoff may be an array)"""
    c = np.broadcast_to(np.asarray(cutoff, float), x.shape)
    a = 1 - np.exp(-2 * np.pi * c / SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc); y[i] = acc
    return y


def saw(f, t):
    return 2 * ((f * t) % 1.0) - 1


def pluck(note, dur=0.3, bright=2600, gain=0.3):
    t = t_(dur); f = midi(note)
    x = 0.6 * saw(f, t) + 0.4 * saw(f * 1.004, t)
    x = lp(x, 180 + bright * np.exp(-t * 14))
    return x * env(len(t), 0.002, dur * 0.95, 0.0, 0.03) * gain


def harp(note, dur=0.9, gain=0.22):
    # softer, longer pluck for the pastoral tracks
    t = t_(dur); f = midi(note)
    x = 0.55 * saw(f, t) + 0.45 * np.sin(2 * np.pi * f * t)
    x = lp(x, 250 + 2200 * np.exp(-t * 9))
    return x * np.exp(-t * 3.2) * env(len(t), 0.003, 0.0, 1.0, 0.05) * gain


def bassnote(note, dur, gain=0.4, square=0.35):
    t = t_(dur); f = midi(note - 12)
    x = np.sin(2 * np.pi * f * t) + square * np.sign(np.sin(2 * np.pi * f * t)) * 0.5
    x = lp(x, 700)
    return x * env(len(t), 0.006, 0.1, 0.7, 0.06) * gain


def pad(notes, dur, cut=1300, gain=0.2, a=0.5, r=0.6):
    t = t_(dur); x = np.zeros(len(t))
    for n in notes:
        for det in (0.996, 1.0, 1.004):
            x += saw(midi(n) * det, t)
    x = lp(x / (3 * len(notes)), cut)
    return x * env(len(t), a, 0.1, 1.0, r) * gain


def flute(note, dur, gain=0.15):
    # the v1 square lead, rounded off: more sine, gentle vibrato, soft attack
    t = t_(dur); f = midi(note)
    vib = 1 + 0.005 * np.sin(2 * np.pi * 5.2 * t) * np.clip(t / 0.25, 0, 1)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    x = 0.8 * np.sin(ph) + 0.2 * np.sign(np.sin(ph)) * 0.5
    x = lp(x, 2400)
    return x * env(len(t), 0.04, 0.15, 0.8, 0.12) * gain


def fiddle(note, dur, gain=0.14):
    t = t_(dur); f = midi(note)
    vib = 1 + 0.004 * np.sin(2 * np.pi * 6 * t)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    x = np.sign(np.sin(ph)) * 0.5 + 0.5 * saw(f * vib, t)
    x = lp(x, 2800)
    return x * env(len(t), 0.01, 0.08, 0.6, 0.05) * gain


def kick(gain=1.0):
    t = t_(0.3); f = 45 + 110 * np.exp(-t * 30)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 9) * gain


def tamb(gain=0.2):
    t = t_(0.09); n = rng.standard_normal(len(t))
    return (n - lp(n, 6000)) * np.exp(-t * 45) * gain


def noise(dur):
    return rng.standard_normal(int(dur * SR))


# ----------------------------------------------------------------- track canvas
class Track:
    def __init__(self, loop_s, tail_s=3.0):
        self.loop = loop_s
        self.N = int(SR * (loop_s + tail_s))
        self.L = np.zeros(self.N); self.R = np.zeros(self.N)

    def put(self, sig, start, pan=0.0, gain=1.0):
        i = int(start * SR); j = min(self.N, i + len(sig))
        if j <= i: return
        s = sig[: j - i] * gain
        self.L[i:j] += s * np.sqrt(0.5 * (1 - pan)); self.R[i:j] += s * np.sqrt(0.5 * (1 + pan))

    def finish(self, room_mix=0.3):
        mix = np.stack([room(self.L, room_mix), room(self.R, room_mix, 0.007)], 1)
        n = int(self.loop * SR)
        out = mix[:n].copy()
        tail = mix[n:]
        out[: len(tail)] += tail           # fold the tail over the start: seamless loop
        return out


def room(x, g=0.3, off=0.0):
    y = x.copy()
    for d, k in ((0.031, 0.5), (0.047, 0.42), (0.067, 0.35), (0.089, 0.28), (0.131, 0.2)):
        s = int((d + off) * SR); z = np.zeros_like(x); z[s:] = x[:-s] * k * g; y += z
    return y


# ----------------------------------------------------------------- 1. Elwynn (outdoors, day)
def elwynn():
    BPM = 88; BEAT = 60 / BPM; BAR = 4 * BEAT; BARS = 16
    T = Track(BARS * BAR)
    D, Bm, G, A, Em = [50, 54, 57], [47, 50, 54], [43, 47, 50], [45, 49, 52], [40, 43, 47]
    prog = [D, Bm, G, A, D, Bm, Em, A, G, D, Em, Bm, G, A, D, D]
    # melody: (bar, beat, note, beats)
    mel = [
        (1, 0, 74, 1), (1, 1, 73, .5), (1, 1.5, 71, .5), (1, 2, 69, 2),
        (2, 0, 71, 1), (2, 1, 69, .5), (2, 1.5, 66, .5), (2, 2, 62, 2),
        (3, 0, 67, 1.5), (3, 1.5, 69, .5), (3, 2, 71, 1), (3, 3, 74, 1),
        (4, 0, 73, 3),
        (5, 0, 78, 1), (5, 1, 76, .5), (5, 1.5, 74, .5), (5, 2, 73, 2),
        (6, 0, 74, 1), (6, 1, 71, 1), (6, 2, 66, 2),
        (7, 0, 67, 1), (7, 1, 71, 1), (7, 2, 76, 1), (7, 3, 74, .5), (7, 3.5, 73, .5),
        (8, 0, 69, 4),
        (9, 0, 71, 1), (9, 1, 74, 1), (9, 2, 79, 2),
        (10, 0, 78, 1.5), (10, 1.5, 76, .5), (10, 2, 74, 2),
        (11, 0, 76, 1), (11, 1, 74, .5), (11, 1.5, 73, .5), (11, 2, 71, 2),
        (12, 0, 73, 1), (12, 1, 74, 1), (12, 2, 71, 2),
        (13, 0, 67, 1), (13, 1, 71, 1), (13, 2, 74, 1), (13, 3, 79, 1),
        (14, 0, 78, 2), (14, 2, 76, 2),
        (15, 0, 74, 3), (15, 3, 73, .5), (15, 3.5, 71, .5),
        (16, 0, 69, 2), (16, 2, 73, 2),
    ]
    for b, ch in enumerate(prog):
        t0 = b * BAR
        T.put(pad([n + 12 for n in ch], BAR + 0.4, cut=1100, gain=0.13, a=0.6, r=0.8), t0)
        T.put(bassnote(ch[0], BEAT * 1.9, gain=0.3, square=0.15), t0)
        T.put(bassnote(ch[0] + (7 if b % 2 else 0), BEAT * 1.9, gain=0.24, square=0.15), t0 + 2 * BEAT)
        arp = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[0] + 24, ch[2] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 24]
        for k, n in enumerate(arp):
            T.put(harp(n, 1.1, gain=0.16 if k % 2 else 0.2), t0 + k * BEAT / 2, pan=(-0.35 if k % 2 else 0.35))
    for b, beat, n, beats in mel:
        T.put(flute(n, beats * BEAT * 0.98), (b - 1) * BAR + beat * BEAT, pan=0.05)
    return T.finish(0.38), {'bpm': BPM, 'bars': BARS, 'key': 'D major'}


# ----------------------------------------------------------------- 2. Goldshire (town / inn, 3/4 dance)
def town():
    BPM = 150; BEAT = 60 / BPM; BAR = 3 * BEAT; BARS = 32
    T = Track(BARS * BAR)
    Gc, C, Dc, Em, A = [43, 47, 50], [48, 52, 55], [50, 54, 57], [40, 43, 47], [45, 49, 52]
    phrase_a = [Gc, Gc, C, Dc, Gc, Em, A, Dc]
    phrase_b = [C, Gc, Dc, Gc, C, Gc, Dc, Dc]
    prog = phrase_a + phrase_a + phrase_b + phrase_a
    # hand-written 8-bar tune (eighths per bar = 6), reused with small changes
    tune_a = [[71, 74, 79, 78, 76, 74], [71, 67, 71, 74, 71, 67], [72, 76, 79, 76, 72, 76], [74, 78, 81, 78, 74, 72],
              [71, 74, 79, 81, 79, 78], [76, 71, 67, 71, 76, 79], [76, 73, 69, 73, 76, 78], [74, None, 74, 72, 71, 69]]
    tune_b = [[76, 79, 84, 79, 76, 72], [74, 71, 67, 71, 74, 79], [78, 74, 69, 74, 78, 81], [79, 74, 71, 67, None, 71],
              [72, 76, 79, 81, 79, 76], [74, 79, 83, 79, 74, 71], [72, 74, 76, 78, 76, 74], [74, None, 78, 76, 74, 72]]
    tune = tune_a + [r[:] for r in tune_a] + tune_b + tune_a
    tune[15] = [79, None, 79, 78, 76, 74]      # end of 2nd A goes up, into B
    tune[31] = [67, None, 71, 74, 72, 74]      # last bar leads back to the top
    for b, ch in enumerate(prog):
        t0 = b * BAR
        T.put(bassnote(ch[0], BEAT * 0.9, gain=0.14, square=0.12), t0)
        for k in (1, 2):
            for n in ch:
                T.put(pluck(n + 12, 0.18, bright=2400, gain=0.12), t0 + k * BEAT, pan=0.25)
        T.put(kick(0.28), t0)
        for k in (1, 2):
            T.put(tamb(0.13), t0 + k * BEAT, pan=-0.3)
        if b % 4 == 3:
            T.put(tamb(0.1), t0 + 2.5 * BEAT, pan=-0.3)
        for k, n in enumerate(tune[b]):
            if n is not None:
                hold = 2 if (k + 1 < 6 and tune[b][k + 1] is None) else 1
                T.put(fiddle(n, BEAT / 2 * hold * 0.92), t0 + k * BEAT / 2, pan=-0.05)
    return T.finish(0.28), {'bpm': BPM, 'bars': BARS, 'key': 'G major', 'meter': '3/4'}


# ----------------------------------------------------------------- 3. Deadmines (dungeon)
def drip(gain=0.12):
    t = t_(0.25); f = 1400 * np.exp(-t * 9) + 700
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 22) * gain


def clank(gain=0.18):
    t = t_(1.2)
    x = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) * a for f, d, a in ((523, 5, .5), (1187, 7, .35), (1873, 9, .25), (2711, 12, .15)))
    n = noise(0.04); x[: len(n)] += (n - lp(n, 3000)) * np.exp(-np.arange(len(n)) / SR * 80) * 0.6
    return lp(x, 3500) * gain


def dungeon():
    BPM = 66; BEAT = 60 / BPM; BAR = 4 * BEAT; BARS = 12
    T = Track(BARS * BAR, tail_s=4)
    Dm, Cc, Bb, A = [50, 53, 57], [48, 52, 55], [46, 50, 53], [45, 49, 52]
    prog = [Dm, Dm, Cc, Bb, Dm, Dm, Bb, A, Dm, Cc, Bb, A]
    for b, ch in enumerate(prog):
        t0 = b * BAR
        T.put(pad([ch[0] - 12, ch[0] - 5, ch[1]], BAR + 1.0, cut=520, gain=0.24, a=1.2, r=1.2), t0)
        for k in range(4):   # heartbeat: low sine pulse on each beat, accent on 1
            T.put(bassnote(ch[0], 0.35, gain=0.2 if k == 0 else 0.15, square=0.05), t0 + k * BEAT)
    # sparse, low lead phrases
    mel = [(1, 2, 62, 2), (2, 0, 65, 1), (2, 1, 64, 1), (2, 2, 62, 2), (4, 0, 58, 3), (5, 2, 69, 1), (5, 3, 70, 1), (6, 0, 69, 2), (6, 2, 65, 2),
           (8, 0, 64, 1.5), (8, 1.5, 61, 2.5), (9, 2, 62, 2), (10, 0, 64, 2), (10, 2, 60, 2), (11, 0, 62, 2), (11, 2, 58, 2), (12, 0, 57, 4)]
    for b, beat, n, beats in mel:
        T.put(fiddle(n, beats * BEAT * 0.95, gain=0.08), (b - 1) * BAR + beat * BEAT, pan=-0.1)
    for s in (2.1, 9.7, 17.3, 27.9, 36.2):
        T.put(clank(0.16), s, pan=rng.uniform(-0.6, 0.6))
    for s in (4.4, 12.2, 15.1, 23.8, 31.5, 38.9):
        T.put(drip(0.1), s, pan=rng.uniform(-0.7, 0.7))
    return T.finish(0.55), {'bpm': BPM, 'bars': BARS, 'key': 'D minor'}


# ----------------------------------------------------------------- sound effects
def sfx_hit():
    t = t_(0.16); n = noise(0.16)
    x = lp(n, 1100) * np.exp(-t * 30) * 1.2 + np.sin(2 * np.pi * (80 + 90 * np.exp(-t * 40)) * t) * np.exp(-t * 25)
    return x


def sfx_crit():
    t = t_(0.5)
    x = np.pad(sfx_hit() * 1.3, (0, len(t) - int(0.16 * SR)))
    x += sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) * a for f, d, a in ((880, 7, .35), (1318, 9, .25), (1975, 12, .15)))
    return x


def sfx_miss():
    t = t_(0.24); n = noise(0.24)
    c = 500 + 3000 * (t / 0.24)
    return (lp(n, c) - lp(n, c * 0.4)) * np.sin(np.pi * t / 0.24) * 1.4


def sfx_fire():
    t = t_(0.6); n = noise(0.6)
    x = lp(n, 400 + 2500 * np.exp(-t * 4)) * np.exp(-t * 4) * 1.2
    crackle = (rng.random(len(t)) > 0.9985) * rng.uniform(0.3, 1, len(t))
    x += lp(crackle, 5000) * 3 * np.exp(-t * 3)
    x += np.sin(2 * np.pi * (70 + 40 * np.exp(-t * 6)) * t) * np.exp(-t * 6) * 0.6
    return x


def sfx_frost():
    t = t_(0.6); x = np.zeros(len(t))
    for i, f in enumerate((2093, 2637, 3136, 3951, 4699)):
        s = int(i * 0.035 * SR)
        tt = t[: len(t) - s]
        x[s:] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 14) * 0.22
    n = noise(0.6); x += (n - lp(n, 5000)) * np.exp(-t * 10) * 0.35
    return x


def sfx_holy():
    t = t_(1.2)
    return sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) * a for f, d, a in ((880, 2.5, .4), (1320, 3, .28), (1760, 3.5, .2), (2640, 5, .1))) * env(len(t), 0.01, 0, 1, 0.1)


def sfx_shadow():
    t = t_(0.7); f = 110 * np.exp(-t * 0.8)
    x = saw(f, t) * 0.6 + saw(f * 1.5, t) * 0.3
    return lp(x, 300 + 1200 * np.sin(np.pi * t / 0.7)) * np.sin(np.pi * t / 0.7) * 1.2


def sfx_arcane():
    t = t_(0.5); x = np.zeros(len(t))
    for i, n in enumerate((76, 81, 84, 88, 91, 96)):
        s = int(i * 0.05 * SR); tt = t[: len(t) - s]
        x[s:] += np.sin(2 * np.pi * midi(n) * tt) * np.exp(-tt * 18) * 0.3
    return x


def sfx_heal():
    t = t_(0.9); x = np.zeros(len(t))
    for i, n in enumerate((88, 95)):
        s = int(i * 0.11 * SR); tt = t[: len(t) - s]
        x[s:] += np.sin(2 * np.pi * midi(n) * tt) * np.exp(-tt * 5) * 0.35
    return x * env(len(t), 0.005, 0, 1, 0.1)


def sfx_cast():
    t = t_(0.35); n = noise(0.35)
    return (lp(n, 800 + 5000 * t / 0.35) - lp(n, 400)) * (t / 0.35) * 0.4 + np.sin(2 * np.pi * (600 + 900 * t / 0.35) * t) * 0.06 * (t / 0.35)


def sfx_levelup():
    dur = 2.2; t = t_(dur); x = np.zeros(len(t))
    for i, n in enumerate((62, 66, 69, 74, 78)):
        s = int(i * 0.09 * SR)
        v = flute(n + 12, dur - i * 0.09, gain=0.5)
        x[s:s + len(v)] += v[: len(x) - s]
    x += pad([62, 66, 69, 74], dur, cut=2200, gain=0.9, a=0.25, r=0.9)
    h = sfx_holy(); x[: len(h)] += h * 0.6
    return x


def sfx_quest_accept():
    t = t_(0.5); x = np.zeros(len(t))
    for i, n in enumerate((79, 86)):
        s = int(i * 0.1 * SR); v = harp(n, 0.4, gain=1.2); x[s:s + len(v)] += v[: len(x) - s]
    return x


def sfx_quest_done():
    dur = 1.4; t = t_(dur); x = np.zeros(len(t))
    for i, n in enumerate((72, 76, 79)):
        s = int(i * 0.12 * SR); v = fiddle(n, 0.5 if i < 2 else 0.9, gain=0.7); x[s:s + len(v)] += v[: len(x) - s]
    x += pad([60, 64, 67, 72], dur, cut=1800, gain=0.8, a=0.2, r=0.6)
    return x


def sfx_coin():
    t = t_(0.35); x = np.zeros(len(t))
    for s0, fs in ((0, (2800, 4200)), (0.07, (3300, 4950))):
        s = int(s0 * SR); tt = t[: len(t) - s]
        x[s:] += sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 28) * 0.3 for f in fs)
    return x


def sfx_loot():
    t = t_(0.3); x = np.zeros(len(t))
    for i, n in enumerate((74, 81)):
        s = int(i * 0.06 * SR); v = pluck(n, 0.22, bright=3000, gain=1.4); x[s:s + len(v)] += v[: len(x) - s]
    return x


def sfx_click():
    t = t_(0.03)
    return np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 180) * 0.6


def sfx_error():
    t = t_(0.2); x = np.zeros(len(t))
    for s0 in (0, 0.1):
        s = int(s0 * SR); tt = t_(0.08)
        x[s:s + len(tt)] += np.sign(np.sin(2 * np.pi * 160 * tt)) * 0.25 * env(len(tt), 0.003, 0, 1, 0.02)
    return lp(x, 1500)


def sfx_pop():
    dur = 1.0; t = t_(dur)
    x = fiddle(72, dur, gain=0.8) + fiddle(79, dur, gain=0.6)
    return x * np.clip(t / 0.08, 0, 1)


def sfx_death():
    dur = 1.8; t = t_(dur); x = np.zeros(len(t))
    for i, n in enumerate((62, 58, 53)):
        s = int(i * 0.35 * SR); v = flute(n, 0.8, gain=0.8); x[s:s + len(v)] += v[: len(x) - s]
    n = noise(dur); x += lp(n, 180) * np.exp(-t * 1.5) * 0.8
    return x


def sfx_legend():
    # a Legend joins your group (v10.2): harp arpeggio rising (G major), a two-note flute call (G up to D), a warm pad
    dur = 2.4; x = np.zeros(int(dur * SR))
    for i, n in enumerate((55, 59, 62, 67, 71)):
        s = int(i * 0.075 * SR); v = harp(n + 12, 1.1, gain=0.9); x[s:s + len(v)] += v[: len(x) - s]
    for s0, n, d in ((0.32, 67, 0.34), (0.66, 74, 1.3)):
        s = int(s0 * SR); v = flute(n + 12, d, gain=0.55); x[s:s + len(v)] += v[: len(x) - s]
    x += pad([55, 59, 62, 67], dur, cut=1600, gain=0.7, a=0.3, r=0.9)
    return x / max(1e-9, np.max(np.abs(x))) * 0.6


SFX = {'hit': sfx_hit, 'crit': sfx_crit, 'miss': sfx_miss, 'fire': sfx_fire, 'frost': sfx_frost, 'holy': sfx_holy,
       'shadow': sfx_shadow, 'arcane': sfx_arcane, 'heal': sfx_heal, 'cast': sfx_cast, 'levelup': sfx_levelup,
       'quest_accept': sfx_quest_accept, 'quest_done': sfx_quest_done, 'coin': sfx_coin, 'loot': sfx_loot,
       'click': sfx_click, 'error': sfx_error, 'pop': sfx_pop, 'death': sfx_death, 'legend': sfx_legend}


# ----------------------------------------------------------------- output
def write_wav(path, x):
    x = np.asarray(x, float)
    if x.ndim == 1: x = np.stack([x, x], 1)
    pcm = (np.clip(x, -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


def loudnorm(x, target_lufs):
    import pyloudnorm as pyln
    m = pyln.Meter(SR)
    l = m.integrated_loudness(x)
    y = x * 10 ** ((target_lufs - l) / 20)
    peak = np.abs(y).max()
    if peak > 0.89: y *= 0.89 / peak           # keep ~-1 dBFS true-ish peak headroom
    return y, l


def enc(src, dst, kbps):
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-c:a', 'aac', '-b:a', f'{kbps}k', dst], check=True)


if __name__ == '__main__':
    meta = {}
    for name, fn in (('elwynn', elwynn), ('town', town), ('dungeon', dungeon)):
        x, info = fn()
        x, before = loudnorm(x, -18.0)          # game music sits under the sound effects
        p = os.path.join(WAV, f'music_{name}.wav'); write_wav(p, x)
        enc(p, os.path.join(OUT, f'music_{name}.m4a'), 128)
        info['loop_s'] = round(len(x) / SR, 4)
        meta[name] = info
        print(name, info)
    for name, fn in SFX.items():
        x = fn()
        x = x / (np.abs(x).max() + 1e-9) * 0.7
        fade = min(len(x) // 4, int(0.02 * SR)); x[-fade:] *= np.linspace(1, 0, fade)
        p = os.path.join(WAV, f'sfx_{name}.wav'); write_wav(p, x)
        enc(p, os.path.join(OUT, f'sfx_{name}.m4a'), 96)
    # a listening reel: every sound effect in a row, with gaps
    reel = []
    for name, fn in SFX.items():
        import wave as _w
        with _w.open(os.path.join(WAV, f'sfx_{name}.wav')) as w:
            a = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2) / 32767
        reel += [a, np.zeros((int(0.6 * SR), 2))]
    write_wav(os.path.join(WAV, 'sfx_reel.wav'), np.concatenate(reel))
    enc(os.path.join(WAV, 'sfx_reel.wav'), os.path.join(OUT, 'sfx_reel.m4a'), 128)
    json.dump(meta, open(os.path.join(OUT, 'music.json'), 'w'), indent=1)
    print('sfx', len(SFX), 'reel order:', ', '.join(SFX))
