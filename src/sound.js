// Realm of Loner — music and sound effects (Web Audio). Audio data is inlined by build.py as window.AUDIO_DATA.
(function (root) {
  const SND = { ctx: null, bufs: {}, loading: {}, cur: null, curName: null, want: null, last: {} };
  const KEY = 'azsolo.sound';
  let prefs = { music: true, sfx: true };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { }
  SND.prefs = prefs;
  const savePrefs = () => { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) { } };

  // Browsers only allow audio after a tap, so start on the first one.
  function init() {
    if (SND.ctx) { if (SND.ctx.state === 'suspended') SND.ctx.resume(); return; }
    const AC = root.AudioContext || root.webkitAudioContext;
    if (!AC || !root.AUDIO_DATA) return;
    const ctx = SND.ctx = new AC();
    SND.musicGain = ctx.createGain(); SND.musicGain.gain.value = prefs.music ? 0.55 : 0; SND.musicGain.connect(ctx.destination);
    SND.sfxGain = ctx.createGain(); SND.sfxGain.gain.value = prefs.sfx ? 0.9 : 0; SND.sfxGain.connect(ctx.destination);
    if (SND.want) SND.music(SND.want, true);
  }
  root.addEventListener('pointerdown', init, { capture: true });

  function load(name) {
    if (SND.bufs[name]) return Promise.resolve(SND.bufs[name]);
    if (SND.loading[name]) return SND.loading[name];
    const src = root.AUDIO_DATA && root.AUDIO_DATA[name];
    if (!src || !SND.ctx) return Promise.resolve(null);
    const bin = atob(src.slice(src.indexOf(',') + 1));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    SND.loading[name] = new Promise((res) => SND.ctx.decodeAudioData(bytes.buffer, (b) => { SND.bufs[name] = b; res(b); }, () => res(null)));
    return SND.loading[name];
  }

  // One-shot effect. Throttled per name so a flurry of hits doesn't pile up.
  SND.play = function (name, o) {
    o = o || {};
    if (!prefs.sfx || !SND.ctx) return;
    const now = SND.ctx.currentTime;
    if (SND.last[name] && now - SND.last[name] < (o.gap || 0.06)) return;
    SND.last[name] = now;
    load('sfx_' + name).then((b) => {
      if (!b) return;
      const s = SND.ctx.createBufferSource(); s.buffer = b;
      if (o.rate) s.playbackRate.value = o.rate;
      const g = SND.ctx.createGain(); g.gain.value = o.vol == null ? 1 : o.vol;
      s.connect(g); g.connect(SND.sfxGain); s.start();
    });
  };

  // Background loop with a 1.5s crossfade. Loop points come from music.json so the seam is exact.
  SND.music = function (name, force) {
    SND.want = name;
    if (!SND.ctx || (!force && name === SND.curName)) return;
    SND.curName = name;
    const old = SND.cur;
    const t = SND.ctx.currentTime;
    if (old) { old.g.gain.setTargetAtTime(0, t, 0.5); old.s.stop(t + 3); }
    SND.cur = null;
    if (!name) return;
    load('music_' + name).then((b) => {
      if (!b || SND.curName !== name) return;
      const s = SND.ctx.createBufferSource(); s.buffer = b; s.loop = true;
      const meta = (root.AUDIO_META || {})[name];
      s.loopStart = 0; s.loopEnd = meta ? Math.min(meta.loop_s, b.duration) : b.duration;
      const g = SND.ctx.createGain(); g.gain.value = 0.0001;
      s.connect(g); g.connect(SND.musicGain);
      s.start(); g.gain.setTargetAtTime(1, SND.ctx.currentTime, 0.5);
      SND.cur = { s, g };
    });
  };

  SND.setPref = function (k, on) {
    prefs[k] = on; savePrefs();
    if (!SND.ctx) return;
    const t = SND.ctx.currentTime;
    if (k === 'music') SND.musicGain.gain.setTargetAtTime(on ? 0.55 : 0, t, 0.2);
    if (k === 'sfx') SND.sfxGain.gain.setTargetAtTime(on ? 0.9 : 0, t, 0.05);
  };
  SND.pause = function () { if (SND.ctx && SND.ctx.state === 'running') SND.ctx.suspend(); };
  SND.resume = function () { if (SND.ctx && SND.ctx.state === 'suspended') SND.ctx.resume(); };

  root.SND = SND;
})(window);
