import numpy as np, wave, librosa, pyloudnorm as pyln
SR=44100
def load(p):
    with wave.open(p) as w: return np.frombuffer(w.readframes(w.getnframes()),'<i2').reshape(-1,2)/32767
import json, sys
for name in (sys.argv[1:] or json.load(open('out/music.json'))):
    x=load(f'wav/music_{name}.wav'); m=pyln.Meter(SR)
    lufs=m.integrated_loudness(x)
    win=int(0.4*SR); mm=pyln.Meter(SR,block_size=0.4); db=[mm.integrated_loudness(x[i:i+win]) for i in range(0,len(x)-win,win)]; db=[d if np.isfinite(d) else -70 for d in db]
    med=np.median(db); spikes=[round(i*0.4,1) for i,d in enumerate(db) if d>med+4]
    # seam: loop the end into the start and look for a jump
    seam=np.abs(x[0]-x[-1]).max(); step=np.abs(np.diff(x,axis=0)).max()
    e1=np.sqrt(np.mean(x[-int(.3*SR):]**2)); e2=np.sqrt(np.mean(x[:int(.3*SR)]**2))
    mono=x.mean(1); chroma=librosa.feature.chroma_cqt(y=mono.astype(np.float32),sr=SR).mean(1)
    notes='C C# D D# E F F# G G# A A# B'.split(); top=[notes[i] for i in np.argsort(chroma)[::-1][:4]]
    print(f'{name:8s} LUFS {lufs:6.1f}  peak {20*np.log10(np.abs(x).max()):5.1f} dBFS  400ms spikes>+4dB: {spikes or "none"}  seam jump {seam:.3f} (max step in file {step:.3f})  end/start rms {20*np.log10(e1/e2):+.1f} dB  top pitch classes {top}')
