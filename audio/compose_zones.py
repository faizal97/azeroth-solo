"""Realm of Loner: a track for every zone, outdoors and in town (v10.8). Same voices and track builder as
compose_themes.py; the melodies are written by rule, not by hand, so 46 tracks stay consistent:

- on a strong beat the melody takes a chord tone, between them it moves by scale steps along a contour;
- phrases are four bars in a form (AABA for 16 bars, ABA for 12), and each phrase ends on a long chord tone;
  the last phrase ends on the home note;
- a zone's town track reuses the zone's opening motif (its rhythm and contour) in a calmer arrangement, so the town
  sounds like part of the land around it.

A zone names its tracks in the data (music: outdoors, town: its towns and camps). Capitals keep their own themes.
Usage: ~/.venvs/audio/bin/python compose_zones.py [name ...]   (same outputs as compose_themes.py)
"""
import sys, os, json, zlib
import numpy as np
import compose_themes as th
from compose_themes import note, chord, song, fx_wind, fx_hits, drip, render, TRACKS

# ----------------------------------------------------------------- melody by rule
SCALES = {'major': [0, 2, 4, 5, 7, 9, 11], 'minor': [0, 2, 3, 5, 7, 8, 10], 'dorian': [0, 2, 3, 5, 7, 9, 10], 'mixolydian': [0, 2, 4, 5, 7, 9, 10],
          'lydian': [0, 2, 4, 6, 7, 9, 11], 'phrygian': [0, 1, 3, 5, 7, 8, 10], 'phrygdom': [0, 1, 4, 5, 7, 8, 10], 'harmonic': [0, 2, 3, 5, 7, 8, 11],
          'pent': [0, 2, 4, 7, 9], 'mpent': [0, 3, 5, 7, 10]}
RHY = {4: {'calm': [[2, 1, 1], [1, 1, 2], [1.5, .5, 2], [1, 1, 1, 1], [3, 1], [2, 2]],
           'busy': [[1, .5, .5, 1, 1], [.5, .5, 1, .5, .5, 1], [1.5, .5, 1, 1], [1, 1, .5, .5, 1], [.5, .5, .5, .5, 2], [1, .5, .5, 2]]},
       3: {'calm': [[2, 1], [1, 1, 1], [1.5, .5, 1], [1, 2]], 'busy': [[1, .5, .5, 1], [.5, .5, 1, 1], [1.5, .5, .5, .5], [1, 1, .5, .5]]},
       6: {'calm': [[3, 3], [2, 1, 3], [3, 2, 1], [2, 1, 2, 1]], 'busy': [[2, 1, 2, 1], [1, 1, 1, 2, 1], [2, 1, 1, 1, 1], [3, 1, 1, 1]]}}
END = {4: [[3, -1], [4], [2, 2], [1, 1, 2]], 3: [[3], [2, -1], [1, 2]], 6: [[6], [3, -3], [3, 3]]}
FORMS = {8: 'AA', 12: 'ABA', 16: 'AABA', 20: 'AABAA', 24: 'AABABA'}
NAMES = 'C C# D D# E F F# G G# A A# B'.split()
nm = lambda m: f'{NAMES[m % 12]}{m // 12 - 1}'


def gen(prog, tonic, mode, beats, seed, lo, hi, feel='calm', motif=None):
    rng = np.random.default_rng(seed); mr = np.random.default_rng(seed if motif is None else motif)
    tpc = note(tonic + '4') % 12; sc = {(tpc + i) % 12 for i in SCALES[mode]}
    chs = [chord(c) for c in prog.split()]; n = len(chs); form = FORMS[n]
    phrase = lambda r: [RHY[beats][feel][r.integers(len(RHY[beats][feel]))] for _ in range(3)] + [END[beats][r.integers(len(END[beats]))]]
    P = {'A': (phrase(mr), mr.choice([-2, -1, -1, 1, 1, 2, 0, 2, -2, 3], size=48)), 'B': (phrase(rng), rng.choice([-2, -1, 1, 1, 2, -1, 0, 3, -3], size=48))}
    prev, rep, out = None, 0, []
    for pi, kind in enumerate(form):
        rh, cont = P[kind]; ci = 0
        for bi in range(4):
            ch = chs[pi * 4 + bi]; cp = {x % 12 for x in ch}; chrom = {x for x in cp if x not in sc}
            strong = [m for m in range(lo, hi + 1) if m % 12 in cp]
            # between chord tones: the scale, minus a note a semitone from a chord tone the scale does not have
            weak = [m for m in range(lo, hi + 1) if m % 12 in cp or (m % 12 in sc and not any((m + d) % 12 in chrom for d in (1, -1)))]
            if prev is None: prev = strong[len(strong) // 2]
            if bi == 0 and kind == 'B': prev = min(hi - 3, prev + 4)
            notes = [d for d in rh[bi] if d > 0]; pos, k, toks = 0.0, 0, []
            for d in rh[bi]:
                if d < 0: toks.append(f'r:{-d:g}'); pos += -d; continue
                last = bi == 3 and k == len(notes) - 1; k += 1
                step = int(cont[ci % len(cont)]); ci += 1
                mid = (lo + hi) / 2   # pull back toward the middle of the range
                if (prev > mid + 4 and step > 0) or (prev < mid - 4 and step < 0): step = -step
                wi = min(range(len(weak)), key=lambda i: abs(weak[i] - prev)); ti = wi + step
                if not 0 <= ti < len(weak): ti = wi - step
                target = weak[max(0, min(len(weak) - 1, ti))]
                main = abs(pos - round(pos)) < 1e-9 and round(pos) in {6: (0, 3), 4: (0, 2), 3: (0,)}[beats]   # the main beats take chord tones
                pool = strong if main or last else weak
                if last:   # a phrase ends on the root or third; the last phrase on the home note when the chord has it
                    home = [m for m in strong if m % 12 == tpc] if pi == len(form) - 1 else []
                    pool = home or [m for m in strong if m % 12 in (ch[0] % 12, ch[1] % 12)] or strong
                cand = sorted(pool, key=lambda m: (abs(m - target), abs(m - prev)))
                # no repeated note unless the contour says stay (and then only once)
                cand2 = [c for c in cand if c != prev] if (step != 0 or rep >= 1) else cand
                m = (cand2 or cand)[0]
                rep = rep + 1 if m == prev else 0
                toks.append(f'{nm(m)}:{d:g}'); prev = m; pos += d
            out.append(' '.join(toks))
    return ' | '.join(out)


# ----------------------------------------------------------------- arrangements
ARP = {4: ([0, 1, 2, 1, 0, 1, 2, 1], 0.5), 3: ([0, 1, 2, 3, 2, 1], 0.5), 6: ([0, 1, 2, 3, 2, 1], 1)}
BASS = {4: [(0, 0, 2), (2, 7, 2)], 3: [(0, 0, 3)], 6: [(0, 0, 3), (3, 7, 3)]}
STEP = {4: 0.25, 3: 0.25, 6: 1}
DRUMS = {
    'tribal': {4: ['D..TD.T.D..TT.h.', 'D..TD.T.D.TTD.TT'], 3: ['D...T.D.T.h.'], 6: ['D.TD.T', 'D.TDTT']},
    'light': {4: ['k.......k...h...'], 3: ['k...h...h...'], 6: ['k..h..']},
    'march': {4: ['k...s.ssk...s...', 'k...s.ssk.s.ssss'], 3: ['k...s...s...'], 6: ['k..s..', 'k..sss']},
    'jungle': {4: ['D.hTh.D.hTD.h.T.', 'D.hTh.DDhTD.hTTT'], 3: ['D.hTh.D.hTh.'], 6: ['D.TDhT']},
    'timp': {4: ['D.......D...D.D.', 'D.......D.D.D...'], 3: ['D.......D...'], 6: ['D..D..', 'D..DDD']},
    'tavern': {4: ['k...h...k...h...'], 3: ['k...h...h...'], 6: ['k.hk.h']},
    'heart': {4: ['D.....D.D.......'], 3: ['D...D.......'], 6: ['D.D...']},
    # battle music (dungeons and raids): driving kit patterns, with a fill every other bar
    'battle': {4: ['k.h.s.hkk.h.s.h.', 'k.h.s.hkk.hss.ss']},
    'battleclank': {4: ['k.h.c.hkk.h.c.h.', 'k.h.s.hkk.hcs.ss']},
    'battletribal': {4: ['D.hTs.DkD.hTs.DT', 'D.hTs.DkD.TTsTTT']},
    'battlemarch': {4: ['k.s.s.s.k.s.s.ss', 'k.s.s.s.k.ssssss']},
}
STAB = {4: [1, 3], 3: [1, 2], 6: [1, 2, 4, 5]}
LEAD_RANGE = {'flute': (64, 84), 'fiddle': (62, 81), 'horn': (55, 76), 'pluck': (57, 79), 'bell': (69, 88), 'harp': (60, 81)}


def arrange(style, b, lead, mel, gain, kit=None):
    arp, astep = ARP[b]
    drums = lambda kind, g=0.8, **o: [{'type': 'drums', 'pat': DRUMS[kind][b], 'step': STEP[b], 'gain': g, **o}] if b in DRUMS[kind] else []
    L = {'type': 'lead', 'voice': lead, 'mel': mel, 'gain': gain}
    S = {
        'pastoral': [{'type': 'pad', 'cut': 1200, 'gain': 0.11}, {'type': 'bass', 'pat': BASS[b], 'gain': 0.22, 'square': 0.1}, {'type': 'arp', 'voice': 'harp', 'pat': arp, 'step': astep, 'gain': 0.14}],
        'tribal': [{'type': 'pad', 'drone': True, 'oct': 0, 'cut': 700, 'gain': 0.15}, {'type': 'bass', 'pat': BASS[b], 'gain': 0.24, 'square': 0.2}, {'type': 'arp', 'voice': 'pluck', 'oct': 0, 'pat': arp, 'step': astep, 'gain': 0.08, 'bright': 1800, 'spread': 0.2}] + drums('tribal', 0.85, low=80, high=200),
        'eerie': [{'type': 'pad', 'drone': True, 'oct': -12, 'cut': 480, 'gain': 0.2, 'a': 1.2, 'r': 1.2}, {'type': 'bass', 'pat': [(0, 0, b)], 'gain': 0.15, 'square': 0.05}, {'type': 'choir', 'cut': 700, 'gain': 0.08}],
        'heroic': [{'type': 'pad', 'cut': 1400, 'gain': 0.11}, {'type': 'bass', 'pat': [(i, 7 if i % 2 else 0, 1) for i in range(b)] if b != 6 else BASS[6], 'gain': 0.23, 'square': 0.2}, {'type': 'arp', 'voice': 'pluck', 'pat': arp, 'step': astep, 'gain': 0.07, 'spread': 0.3}] + drums('march', 0.8),
        'sea': [{'type': 'choir', 'cut': 950, 'gain': 0.11}, {'type': 'bass', 'pat': BASS[b], 'gain': 0.22, 'square': 0.15}, {'type': 'arp', 'voice': 'harp', 'pat': arp, 'step': astep, 'gain': 0.13}] + drums('light', 0.6),
        'dark': [{'type': 'choir', 'cut': 800, 'gain': 0.15}, {'type': 'bass', 'pat': [(i, 0, 1) for i in range(b)] if b != 6 else BASS[6], 'gain': 0.22, 'square': 0.3}] + drums('timp', 0.78, low=60),
        'jungle': [{'type': 'pad', 'cut': 1100, 'gain': 0.1}, {'type': 'bass', 'pat': BASS[b], 'gain': 0.22, 'square': 0.2}, {'type': 'arp', 'voice': 'bell', 'oct': 12, 'pat': arp, 'step': astep, 'gain': 0.05, 'len': 0.6, 'spread': 0.4}] + drums('jungle', 0.8, low=85, high=230),
        'mist': [{'type': 'pad', 'drone': True, 'oct': -12, 'cut': 520, 'gain': 0.2, 'a': 1.2, 'r': 1.2}, {'type': 'arp', 'voice': 'pluck', 'pat': arp[::2], 'step': astep * 2, 'gain': 0.06, 'bright': 1400, 'len': 0.5}],
        'frost': [{'type': 'pad', 'cut': 900, 'gain': 0.12, 'a': 1.0, 'r': 1.0}, {'type': 'bass', 'pat': [(0, 0, b)], 'gain': 0.18, 'square': 0.0}, {'type': 'arp', 'voice': 'bell', 'oct': 24, 'pat': arp, 'step': astep, 'gain': 0.05, 'len': 1.8, 'spread': 0.5}],
        'highland': [{'type': 'pad', 'drone': True, 'oct': 0, 'cut': 800, 'gain': 0.16}, {'type': 'bass', 'pat': BASS[b], 'gain': 0.2, 'square': 0.1}] + drums('light', 0.6),
        'tavern': [{'type': 'pad', 'cut': 1000, 'gain': 0.07, 'a': 0.6, 'r': 0.8}, {'type': 'bass', 'pat': [(0, 0, 1)] + ([(3, 7, 1)] if b == 6 else [(2, 7, 1)] if b == 4 else []), 'gain': 0.11, 'square': 0.08}, {'type': 'stab', 'at': STAB[b], 'gain': 0.07, 'len': 0.18, 'bright': 1800}] + drums('tavern', 0.22),
        'camp': [{'type': 'pad', 'cut': 1000, 'gain': 0.1, 'a': 0.8, 'r': 0.9}, {'type': 'bass', 'pat': BASS[b], 'gain': 0.18, 'square': 0.05}, {'type': 'arp', 'voice': 'harp', 'pat': arp[::2], 'step': astep * 2, 'gain': 0.12}] + drums('light', 0.45),
        # battle: a driving bass in eighths, a sixteenth ostinato, a kit; raids add voices and timpani
        'battle': [{'type': 'pad', 'cut': 1100, 'gain': 0.1}, {'type': 'bass', 'pat': [(i * 0.5, 0, 0.45) for i in range(8)], 'gain': 0.2, 'square': 0.45},
                   {'type': 'arp', 'voice': 'pluck', 'step': 0.25, 'pat': [0, 1, 2, 1] * 4, 'gain': 0.05, 'len': 0.12, 'spread': 0.3}] + drums(kit or 'battle', 0.85, low=80, high=200),
        'raidbattle': [{'type': 'choir', 'cut': 1000, 'gain': 0.13}, {'type': 'bass', 'pat': [(i * 0.5, 0, 0.45) for i in range(8)], 'gain': 0.21, 'square': 0.5},
                       {'type': 'arp', 'voice': 'pluck', 'oct': 0, 'step': 0.25, 'pat': [0, 0, 1, 0, 2, 0, 1, 0, 0, 0, 1, 0, 2, 0, 1, 2], 'gain': 0.07, 'len': 0.12, 'bright': 1800, 'spread': 0.2},
                       {'type': 'drums', 'pat': ['D.......D.......', 'D.......D...D.D.'], 'step': 0.25, 'gain': 0.7, 'low': 58}] + drums(kit or 'battle', 0.75),
        'drumcamp': [{'type': 'pad', 'drone': True, 'oct': 0, 'cut': 800, 'gain': 0.12}, {'type': 'bass', 'pat': BASS[b], 'gain': 0.2, 'square': 0.1}, {'type': 'arp', 'voice': 'pluck', 'oct': 0, 'pat': arp[::2], 'step': astep * 2, 'gain': 0.07, 'bright': 1600}] + drums('heart', 0.8, low=70),
    }[style]
    return S + [L]


FX = {'wind': fx_wind(2, 250, 1100, 0.05), 'waves': fx_wind(4, 200, 800, 0.05), 'drips': fx_hits(lambda: drip(0.08), [0.11, 0.29, 0.46, 0.63, 0.82]),
      'storm': fx_wind(2, 150, 1500, 0.08), 'ember': fx_wind(2, 120, 600, 0.04)}


def Z(bpm, beats, tonic, mode, prog, style, lead, fx=(), feel='calm', motif=None, gain=0.14, room=0.35, rng=None, kit=None):
    return {'bpm': bpm, 'beats': beats, 'tonic': tonic, 'mode': mode, 'prog': prog, 'style': style, 'lead': lead, 'fx': list(fx),
            'feel': feel, 'motif': motif, 'gain': gain, 'room': room, 'range': rng, 'kit': kit}


# zone -> (outdoors, town). None: the zone keeps an existing track (Ambermoor's, or a mood from compose_themes.py)
ZONES = {
    # ---- starting lands, levels 1-10
    'dunmorogh':    (Z(168, 6, 'A', 'dorian', 'Am D Am G Am D G Am F G Am Em F G D Am', 'frost', 'flute', ['wind']),
                     Z(90, 3, 'A', 'major', 'A D A E A D E E D A E A D A E A', 'tavern', 'fiddle', feel='busy')),
    'teldrassil':   (Z(66, 3, 'F#', 'dorian', 'F#m B F#m E F#m B D E D A B F#m D E F#m E', 'pastoral', 'flute', room=0.5),
                     Z(60, 3, 'F#', 'dorian', 'F#m E D E F#m B D E D E F#m F#m', 'camp', 'harp', room=0.5)),
    'durotar':      (Z(100, 4, 'E', 'phrygian', 'Em F Em Em Em F G Em Am G F Em Am F Em Em', 'tribal', 'pluck', ['wind'], feel='busy', gain=0.22),
                     Z(96, 4, 'E', 'mpent', 'Em Em D Em Em C D Em C D Em Em D Em C Em', 'drumcamp', 'pluck', gain=0.2)),
    'mulgore':      (Z(84, 4, 'D', 'pent', 'D G D A D G Bm A G D Em A G D A D', 'pastoral', 'flute', ['wind']),
                     Z(80, 4, 'D', 'pent', 'D G D A D G A D G D A D', 'drumcamp', 'flute')),
    'tirisfal':     (Z(70, 4, 'D', 'minor', 'Dm Bb Gm A Dm Bb C A Gm Dm Bb A', 'eerie', 'bell', ['drips'], gain=0.08, room=0.5),
                     Z(84, 3, 'D', 'harmonic', 'Dm A Dm Gm Dm A Bb A Gm Dm A Dm Bb Gm A A', 'tavern', 'bell', gain=0.08)),
    # ---- levels 10-30
    'westfall':     (Z(104, 4, 'G', 'major', 'G C G D G C D D Em C G D C G D G', 'pastoral', 'fiddle', feel='busy', gain=0.12),
                     Z(96, 4, 'G', 'major', 'G D Em C G D C D Em C D G', 'camp', 'fiddle', gain=0.12)),
    'barrens':      (Z(88, 4, 'A', 'mixolydian', 'A G A A D A G A D G Em A D G A A', 'tribal', 'flute', ['wind']),
                     Z(90, 4, 'A', 'dorian', 'Am G Am D Am G Em Am D G Am Am', 'drumcamp', 'pluck', gain=0.2)),
    'redridge':     (Z(100, 4, 'D', 'major', 'D A Bm G D A G A Bm G D A G A D D', 'heroic', 'horn'),
                     Z(88, 3, 'D', 'major', 'D G D A D G A A G D A D G D A D', 'tavern', 'flute', feel='busy')),
    'stonetalon':   (Z(80, 4, 'C', 'minor', 'Cm Ab Bb Cm Ab Eb Bb G Ab Bb Cm G', 'heroic', 'horn', ['wind']),
                     Z(84, 4, 'C', 'dorian', 'Cm F Cm Bb Cm F Bb Cm Ab Bb Cm Cm', 'drumcamp', 'flute')),
    'ashenvale':    (Z(72, 3, 'B', 'minor', 'Bm G D A Bm G Em F# Bm D G A Em G F# F#', 'pastoral', 'flute', room=0.5),
                     Z(66, 3, 'B', 'minor', 'Bm A G A Bm G Em F# G A Bm Bm', 'camp', 'harp', room=0.5)),
    'duskwood':     (None,
                     Z(84, 3, 'G', 'harmonic', 'Gm D Gm Cm Gm D Eb D Cm Gm D Gm Eb Cm D D', 'tavern', 'bell', gain=0.08)),
    'hillsbrad':    (Z(92, 4, 'F', 'major', 'F C Dm Bb F C Bb C Dm Bb F C Bb C F F', 'pastoral', 'flute'),
                     Z(88, 4, 'D', 'minor', 'Dm Bb F C Dm Bb C A Bb F C Dm', 'camp', 'fiddle', gain=0.12)),
    'wetlands':     (Z(72, 4, 'E', 'minor', 'Em C Am B Em C D B Am C B B', 'mist', 'fiddle', ['drips', 'wind'], gain=0.1, room=0.5),
                     Z(168, 6, 'G', 'major', 'G C G D G C D G Em C G D C G D G', 'tavern', 'fiddle', ['waves'], feel='busy', gain=0.12)),
    # ---- levels 30-60
    'stranglethorn': (Z(112, 4, 'E', 'dorian', 'Em A Em D Em A G D C D Em A C D Em Em', 'jungle', 'flute', feel='busy'),
                      Z(90, 4, 'E', 'dorian', 'Em A Em D C D Em A C D Em Em', 'camp', 'flute')),
    'arathi':       (Z(156, 6, 'A', 'minor', 'Am G Am Em Am G C G F G Am Em F G Am Am', 'highland', 'fiddle', ['wind'], feel='busy', gain=0.12),
                     Z(88, 4, 'A', 'dorian', 'Am G Am Em F G Am Am F G Em Am', 'heroic', 'fiddle', gain=0.11)),
    'tanaris':      (None,
                     Z(116, 4, 'G', 'major', 'G Em C D G Em A D G C G D C D G G', 'tavern', 'pluck', feel='busy', gain=0.2)),
    'feralas':      (Z(76, 4, 'G', 'dorian', 'Gm C Gm F Eb F Gm C Eb F D D', 'pastoral', 'flute', room=0.48),
                     Z(72, 3, 'G', 'dorian', 'Gm F Gm C Gm F Eb F Eb F Gm Gm', 'camp', 'flute', room=0.48)),
    'ungoro':       (Z(96, 4, 'F', 'lydian', 'F G F C F G Am C Bb C F G Bb C F F', 'tribal', 'horn', feel='busy', gain=0.15),
                     Z(92, 4, 'F', 'major', 'F Bb F C F G Bb C F Bb C F', 'camp', 'flute')),
    'steppes':      (Z(92, 4, 'C#', 'phrygian', 'C#m D C#m B A B C#m D A B G# G#', 'dark', 'horn', ['ember']),
                     Z(76, 4, 'C#', 'minor', 'C#m A E B C#m A B G# A E B C#m', 'camp', 'horn', gain=0.12)),
    'plaguelands':  (Z(66, 4, 'Bb', 'minor', 'Bbm Gb Ebm F Bbm Gb Db F Gb Db F F', 'dark', 'fiddle', ['wind'], gain=0.1, room=0.5),
                     Z(84, 4, 'Bb', 'minor', 'Bbm Gb Db Ab Bbm Gb Ab F Gb Db F Bbm', 'heroic', 'horn', gain=0.12)),
    'winterspring': (None,
                     Z(84, 3, 'E', 'major', 'E A E B E A B B A E B E A E B E', 'tavern', 'fiddle', ['wind'], feel='busy', gain=0.12)),
    'dustwallow':   (Z(78, 4, 'C', 'minor', 'Cm Ab Fm G Cm Ab Bb G Fm Ab G G', 'mist', 'horn', ['drips', 'wind'], gain=0.13, room=0.5),
                     Z(156, 6, 'C', 'mixolydian', 'C Bb C G C Bb F G F C G C F Bb G C', 'sea', 'fiddle', ['waves'], gain=0.12)),
    'tidewatch':    (Z(150, 6, 'D', 'dorian', 'Dm G Dm C Dm G F C Bb C Dm G Bb C Dm Dm', 'sea', 'flute', ['waves'], room=0.45),
                     Z(76, 4, 'D', 'major', 'D A Bm G D A G A Bm G A D', 'camp', 'harp')),
    'skullreef':    (Z(108, 4, 'E', 'minor', 'Em D C D Em D C B Am C D B Em D C B', 'jungle', 'pluck', ['waves'], feel='busy', gain=0.2),
                     Z(168, 6, 'E', 'minor', 'Em D Em B Em D C B Am Em D Em C Am B B', 'tavern', 'fiddle', ['waves'], feel='busy', gain=0.12)),
    'stormveil':    (Z(88, 4, 'F', 'minor', 'Fm Db Eb Fm Fm Db Bbm C Db Eb Fm C', 'dark', 'horn', ['storm'], room=0.45),
                     None),
}


# dungeon battle music (v10.8): each dungeon has its own arrangement, not one battle recipe in different keys: its own
# meter and tempo, drum groove, bass figure, ostinato, bed (voices, pad, drone or none), lead and signature sound.
# Each opens lighter (no kit for the first bars) and the kit comes in, so the loop builds and breathes.
def dng(track, bpm, beats, tonic, mode, prog, lead, kit, bass, arp=None, bed='pad', kstep=0.25, intro=4, fx=(), extra=(), gain=0.14, low=80, high=200, bassgain=0.21, kitgain=0.85):
    return (track, {'bpm': bpm, 'beats': beats, 'tonic': tonic, 'mode': mode, 'prog': prog, 'lead': lead, 'kit': kit, 'bass': bass, 'arp': arp, 'bed': bed,
                    'kstep': kstep, 'intro': intro, 'fx': list(fx), 'extra': list(extra), 'gain': gain, 'low': low, 'high': high, 'bassgain': bassgain, 'kitgain': kitgain})


BED = {'pad': {'type': 'pad', 'cut': 1100, 'gain': 0.1}, 'choir': {'type': 'choir', 'cut': 950, 'gain': 0.13}, 'lowchoir': {'type': 'choir', 'cut': 700, 'gain': 0.16},
       'drone': {'type': 'pad', 'drone': True, 'oct': 0, 'cut': 700, 'gain': 0.14}, 'organ': {'type': 'pad', 'cut': 2200, 'gain': 0.09}}
E8 = lambda *iv: [(i * 0.5, iv[i % len(iv)], 0.45) for i in range(8)]     # bass in eighths over a figure of intervals
DUNGEONS = {
    # the Smoke Pit: a fire cave, a 6/8 war dance on heavy hand drums
    'ragefire': dng('smokepit', 176, 6, 'E', 'phrygian', 'Em F Em D Em F G F Em F Em D C D Em Em', 'horn',
                    ['D..T.TD.TT.T', 'D..T.TD.TTTT'], [(0, 0, 2), (2, 7, 1), (3, 0, 2), (5, 7, 1)], {'voice': 'pluck', 'oct': 0, 'pat': [0, 2, 0, 1, 0, 2], 'step': 1, 'gain': 0.08, 'bright': 1500},
                    bed='drone', kstep=0.5, fx=['ember'], low=75, high=180),
    # the Smugglers' Deep: a pirate brawl, a 6/8 shanty with an off-beat squeeze-box and the fiddle
    'deadmines': dng('smugglers_deep', 180, 6, 'D', 'minor', 'Dm C Bb A Dm C Bb A Gm Bb C A Dm Bb A A', 'fiddle',
                     ['k.hs.hk.hs.h', 'k.hs.hk.ss.s'], [(0, 0, 1), (3, 7, 1)], None, bed='pad', kstep=0.5, fx=['drips'],
                     extra=[{'type': 'stab', 'at': [1, 2, 4, 5], 'gain': 0.055, 'len': 0.16, 'bright': 1400}], gain=0.12),
    # the Dreaming Caves: a dream, a quick 3/4 with running bells and a flute
    'wailing_caverns': dng('dreaming_caves', 132, 3, 'F#', 'dorian', 'F#m E D E F#m E D C#m D E F#m B F#m E D E F#m B D E C#m D E F#m', 'flute',
                           ['k.h.s.h.s.h.', 'k.h.s.h.sss.'], [(0, 0, 2), (2, 7, 1)], {'voice': 'bell', 'oct': 12, 'pat': [0, 1, 2, 3, 2, 1], 'step': 0.5, 'gain': 0.05, 'len': 0.9},
                           bed='choir', fx=['drips']),
    # Kingsmere Gaol: a prison riot, a snare march with chains on the fourth beat and low brass on the off-beats
    'stockade': dng('kingsmere_gaol', 140, 4, 'C', 'minor', 'Cm Ab Bb G Cm Ab Fm G Ab Bb Cm Ab Fm G Cm G', 'horn',
                    ['k.s.s.s.k.s.c.ss', 'k.s.s.s.k.ssc.ss'], [(i, 0 if i % 2 == 0 else 7, 1) for i in range(4)], None, bed='pad',
                    extra=[{'type': 'brass', 'pat': [(0.5, 0.4), (1.5, 0.4), (2.5, 0.4), (3.5, 0.4)], 'oct': 0, 'gain': 0.045}]),
    # Greyhowl Keep: a haunted keep, a gothic 3/4 with voices, bells and the wind howling
    'shadowfang': dng('greyhowl_keep', 126, 3, 'G', 'harmonic', 'Gm Eb Cm D Gm Eb F D Gm Cm D Gm Eb F Bb D Cm Gm Eb D Gm Cm D D', 'fiddle',
                      ['D...s...s...', 'D...s...s.ss'], [(0, 0, 1), (1, 7, 1), (2, 12, 1)], {'voice': 'bell', 'oct': 12, 'pat': [0, None, 2, None, 1, None], 'step': 0.5, 'gain': 0.05, 'len': 1.4},
                      bed='choir', fx=['wind'], gain=0.12, low=60),
    # the Tidehollow Deeps: under the sea, a rolling half-time 6/8 with harp and deep toms
    'blackfathom': dng('tidehollow', 132, 6, 'A', 'minor', 'Am F G E Am F Dm E F G Am F Dm E Am E', 'flute',
                       ['D.....T.....', 'D.....T..TT.'], [(0, 0, 3), (3, 7, 3)], {'voice': 'harp', 'pat': [0, 1, 2, 3, 2, 1], 'step': 1, 'gain': 0.13},
                       bed='choir', kstep=0.5, fx=['waves'], low=60),
    # Gearhollow: the machine city, a fast clockwork of staccato plucks and gears, no pad at all
    'gnomeregan': dng('gearhollow', 152, 4, 'B', 'minor', 'Bm G A F# Bm G Em F# G A Bm G Em F# Bm F#', 'pluck',
                      ['k.c.s.ckk.c.s.cc', 'k.c.s.ckk.cs.scc'], E8(0, 12), {'voice': 'pluck', 'pat': [0, 2, 1, 2, 0, 2, 1, 2, 3, 2, 1, 2, 0, 2, 1, 2], 'step': 0.25, 'gain': 0.06, 'len': 0.08, 'bright': 3200},
                      bed=None, gain=0.2),
    # the Thorn Warrens: thorns and drums, a tribal groove with wooden bells over a drone
    'razorfen_kraul': dng('thorn_warrens', 124, 4, 'E', 'dorian', 'Em A Em D Em A C D C D Em A C D Em D', 'flute',
                          ['D.hTs.D.hTD.s.T.', 'D.hTs.DDhTD.sTTT'], [(0, 0, 1.5), (1.5, 0, 0.5), (2, 7, 1), (3, 10, 1)], {'voice': 'bell', 'oct': 0, 'pat': [0, 2, 1, 2, 0, 3, 1, 2], 'step': 0.5, 'gain': 0.07, 'len': 0.4},
                          bed='drone', low=90, high=230),
    # the Pyre Abbey library: zealots among the books, a half-time chant of low voices with tolling bells
    'sm_library': dng('pyre_library', 116, 4, 'D', 'harmonic', 'Dm Bb Gm A Dm Bb Gm A Bb C Dm Bb Gm A Dm A', 'fiddle',
                      ['D.......s.......', 'D.......s...D.D.'], [(0, 0, 2), (2, 0, 2)], {'voice': 'bell', 'oct': 12, 'pat': [0, None, None, None, 2, None, None, None], 'step': 0.5, 'gain': 0.07, 'len': 2.0},
                      bed='lowchoir', gain=0.12, low=58),
    # the Pyre Abbey cathedral: the high altar, an organ and voices over timpani, the horn up front
    'sm_cathedral': dng('pyre_cathedral', 132, 4, 'D', 'minor', 'Dm Gm C F Bb Gm A A Dm Gm C F Bb Gm A Dm', 'horn',
                        ['k...s...k.k.s...', 'k...s...k.k.s.ss'], E8(0, 0, 7, 0), None, bed='organ',
                        extra=[{'type': 'choir', 'cut': 1000, 'gain': 0.11}, {'type': 'drums', 'pat': ['D.......D...D...', 'D.......D.D.DDDD'], 'step': 0.25, 'gain': 0.6, 'low': 55}]),
    # the Coinworks: the mint, presses and hammers, a stomping forge groove with brass stabs
    'coinworks': dng('coinworks', 144, 4, 'G', 'minor', 'Gm F Eb D Gm F Eb D Cm D Gm F Eb D Gm D', 'horn',
                     ['k...c..kk...c...', 'k...c..kk.k.c.cc'], E8(0, 0, 0, 7), None, bed='pad',
                     extra=[{'type': 'brass', 'pat': [(0, 0.3), (0.75, 0.3), (2.5, 0.3)], 'oct': 0, 'gain': 0.05}], kitgain=0.72),
    # the Dune Temple: fast hand drums in Phrygian dominant, an oud-like lead and desert wind
    'zul_farrak': dng('dune_temple', 132, 4, 'D', 'phrygdom', 'D Eb D C D Eb Cm D Gm Eb D C Cm Eb D D', 'pluck',
                      ['D.TTD.T.D.TTD.T.', 'D.TTD.T.D.TTTTTT'], [(0, 0, 1.5), (1.5, 0, 0.5), (2, 0, 1), (3, 1, 1)], None, bed='drone', fx=['wind'], gain=0.2, low=85, high=240),
    # the Gemfall Caves: crystal, a bright 3/4 of high bells and a flute
    'maraudon': dng('gemfall', 120, 3, 'A', 'lydian', 'A B A F#m A B E E D E A F#m D E A A B C#m D E A B E E', 'flute',
                    ['k.....h.h...', 'k.....h.hhh.'], [(0, 0, 3)], {'voice': 'bell', 'oct': 24, 'pat': [0, 1, 2, 3, 2, 1], 'step': 0.5, 'gain': 0.05, 'len': 1.2},
                    bed='pad', fx=['drips']),
    # Cinderpeak Depths: the fire-dwarves' city, deep war drums and the anvil, low voices, embers
    'blackrock_depths': dng('cinderpeak', 136, 4, 'C', 'minor', 'Cm Bb Ab G Cm Bb Ab G Fm Ab Bb G Cm Bb Ab G', 'horn',
                            ['D..cD..cD.DcD..c', 'D..cD..cD.DcDDDD'], [(0, 0, 1), (1, 0, 0.5), (1.5, 7, 0.5), (2, 0, 1), (3, 0, 0.5), (3.5, 7, 0.5)], None,
                            bed='lowchoir', fx=['ember'], low=60),
    # the Blackcloister: a school of the dead, a 6/8 music box over driving toms and voices
    'scholomance': dng('blackcloister', 168, 6, 'B', 'harmonic', 'Bm G Em F# Bm G Em F# G A Bm G Em F# Bm F#', 'bell',
                       ['D..T..D..T..', 'D..T..D.TTTT'], [(0, 0, 3), (3, 7, 3)], {'voice': 'pluck', 'oct': 0, 'pat': [0, 1, 2, 1, 0, 2], 'step': 1, 'gain': 0.07, 'len': 0.2, 'bright': 1300},
                       bed='choir', kstep=0.5, fx=['drips'], gain=0.08),
    # Graymouth: the dead city, relentless sixteenth snares, voices, the horn
    'stratholme': dng('graymouth', 148, 4, 'F', 'minor', 'Fm Db Eb C Fm Db Bbm C Db Eb Fm Db Bbm C Fm C', 'horn',
                      ['k.ssk.ssk.ssk.ss', 'k.ssk.ssk.ssssss'], E8(0), None, bed='choir', fx=['wind']),
    # the Sunken Archive: a drowned library, a half-time groove with harp and waves
    'sunken_archive': dng('sunken_archive', 116, 4, 'E', 'minor', 'Em C D B Em C Am B C D Em C Am B Em B', 'flute',
                          ['D...h...T...h...', 'D...h...T..TT.h.'], [(0, 0, 3), (3, 7, 1)], {'voice': 'harp', 'pat': [0, 1, 2, 3, 4, 3, 2, 1], 'step': 0.5, 'gain': 0.12},
                          bed='choir', fx=['waves'], low=62),
    # the Temple of Shal'zua: a jungle temple, busy drums, wooden bells, the horn
    'shalzua_temple': dng('shalzua', 136, 4, 'C#', 'minor', 'C#m A B G# C#m A F#m G# A B C#m A F#m G# C#m G#', 'horn',
                          ['D.hTh.D.hTD.h.T.', 'D.hTh.DDhTD.hTTT'], E8(0, 0, 7, 0), {'voice': 'bell', 'oct': 0, 'pat': [0, 2, 1, 3, 0, 2, 1, 2], 'step': 0.5, 'gain': 0.06, 'len': 0.35},
                          bed='pad', fx=['waves'], low=90, high=230),
}


def dspec(name, d):
    seed = zlib.crc32(name.encode()) & 0xffffffff
    lo, hi = LEAD_RANGE[d['lead']]
    mel = gen(d['prog'], d['tonic'], d['mode'], d['beats'], seed, lo, hi, 'busy')
    I = d['intro']
    L = [BED[d['bed']]] if d['bed'] else []
    L += [{'type': 'bass', 'pat': d['bass'], 'gain': d['bassgain'], 'square': 0.4, 'wrap': True}]
    if d['arp']: L += [dict({'type': 'arp', 'spread': 0.3}, **d['arp'])]
    L += [dict(x) for x in d['extra']]
    L += [{'type': 'drums', 'pat': d['kit'], 'step': d['kstep'], 'gain': d['kitgain'], 'low': d['low'], 'high': d['high'], 'from': I + 1}]
    L += [{'type': 'lead', 'voice': d['lead'], 'mel': mel, 'gain': d['gain']}]
    return {'bpm': d['bpm'], 'beats': d['beats'], 'meter': '6/8' if d['beats'] == 6 else None, 'key': f"{d['tonic']} {d['mode']}", 'prog': d['prog'],
            'layers': L, 'fx': [FX[f] for f in d['fx']], 'room': 0.32}


def spec_of(name, z, motif=None):
    seed = zlib.crc32(name.encode()) & 0xffffffff
    lo, hi = z['range'] or LEAD_RANGE[z['lead']]
    mel = gen(z['prog'], z['tonic'], z['mode'], z['beats'], seed, lo, hi, z['feel'], motif)
    return {'bpm': z['bpm'], 'beats': z['beats'], 'meter': '6/8' if z['beats'] == 6 else None, 'key': f"{z['tonic']} {z['mode']}", 'prog': z['prog'],
            'layers': arrange(z['style'], z['beats'], z['lead'], mel, z['gain'], z.get('kit')), 'fx': [FX[f] for f in z['fx']], 'room': z['room']}


# the file name of a zone's tracks: its in-game name (the zone ids in the code are older names; seeds still use the id,
# so the melodies do not change)
TRACK = {"dunmorogh": "kaldvik", "teldrassil": "greatbough", "durotar": "dunescar", "mulgore": "greensward", "tirisfal": "pallmoor", "westfall": "longfield", "barrens": "scrublands", "redridge": "stoneharrow", "stonetalon": "highcrag", "ashenvale": "elderglen", "duskwood": "wraithwood", "hillsbrad": "greymead", "wetlands": "greenfen", "stranglethorn": "vinewild", "arathi": "kinloch", "tanaris": "sirocco", "feralas": "ferndeep", "ungoro": "greenmaw", "steppes": "cinderfields", "plaguelands": "rotmoor", "winterspring": "icewold", "dustwallow": "saltmarsh", "tidewatch": "tidewatch", "skullreef": "skullreef", "stormveil": "stormveil"}


def all_specs():
    out = {}
    for zone, (o, t) in ZONES.items():
        oseed = zlib.crc32(zone.encode()) & 0xffffffff
        if o: out[TRACK[zone]] = spec_of(zone, o)
        if t: out[TRACK[zone] + '_town'] = spec_of(zone + '_town', t, motif=oseed)   # the town shares the zone's opening motif
    for dg, (track, d) in DUNGEONS.items(): out[track] = dspec(dg, d)
    return out


if __name__ == '__main__':
    specs = all_specs()
    for k, v in specs.items():
        if v['meter'] is None: v.pop('meter')
    TRACKS.update(specs)
    names = sys.argv[1:] or list(specs)
    mp = os.path.join(th.OUT, 'music.json'); meta = json.load(open(mp)) if os.path.exists(mp) else {}
    for n in names:
        meta[n] = render(n); print(n, meta[n], flush=True)
    json.dump(meta, open(mp, 'w'), indent=1)
