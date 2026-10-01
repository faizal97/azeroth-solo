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
}
STAB = {4: [1, 3], 3: [1, 2], 6: [1, 2, 4, 5]}
LEAD_RANGE = {'flute': (64, 84), 'fiddle': (62, 81), 'horn': (55, 76), 'pluck': (57, 79), 'bell': (69, 88), 'harp': (60, 81)}


def arrange(style, b, lead, mel, gain):
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
        'drumcamp': [{'type': 'pad', 'drone': True, 'oct': 0, 'cut': 800, 'gain': 0.12}, {'type': 'bass', 'pat': BASS[b], 'gain': 0.2, 'square': 0.1}, {'type': 'arp', 'voice': 'pluck', 'oct': 0, 'pat': arp[::2], 'step': astep * 2, 'gain': 0.07, 'bright': 1600}] + drums('heart', 0.8, low=70),
    }[style]
    return S + [L]


FX = {'wind': fx_wind(2, 250, 1100, 0.05), 'waves': fx_wind(4, 200, 800, 0.05), 'drips': fx_hits(lambda: drip(0.08), [0.11, 0.29, 0.46, 0.63, 0.82]),
      'storm': fx_wind(2, 150, 1500, 0.08), 'ember': fx_wind(2, 120, 600, 0.04)}


def Z(bpm, beats, tonic, mode, prog, style, lead, fx=(), feel='calm', motif=None, gain=0.14, room=0.35, rng=None):
    return {'bpm': bpm, 'beats': beats, 'tonic': tonic, 'mode': mode, 'prog': prog, 'style': style, 'lead': lead, 'fx': list(fx),
            'feel': feel, 'motif': motif, 'gain': gain, 'room': room, 'range': rng}


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


def spec_of(name, z, motif=None):
    seed = zlib.crc32(name.encode()) & 0xffffffff
    lo, hi = z['range'] or LEAD_RANGE[z['lead']]
    mel = gen(z['prog'], z['tonic'], z['mode'], z['beats'], seed, lo, hi, z['feel'], motif)
    return {'bpm': z['bpm'], 'beats': z['beats'], 'meter': '6/8' if z['beats'] == 6 else None, 'key': f"{z['tonic']} {z['mode']}", 'prog': z['prog'],
            'layers': arrange(z['style'], z['beats'], z['lead'], mel, z['gain']), 'fx': [FX[f] for f in z['fx']], 'room': z['room']}


def all_specs():
    out = {}
    for zone, (o, t) in ZONES.items():
        oseed = zlib.crc32(zone.encode()) & 0xffffffff
        if o: out[zone] = spec_of(zone, o)
        if t: out[zone + '_town'] = spec_of(zone + '_town', t, motif=oseed)   # the town shares the zone's opening motif
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
