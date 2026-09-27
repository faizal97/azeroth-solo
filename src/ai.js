// Optional on-device AI chat pack (v1.10).
// A small local model (Gemma 3, run by the Android app) writes WORDS ONLY: chat lines,
// party banter, NPC greetings, bios and the welcome-back story. It never decides anything.
// Lines are written ahead of time into a bank during quiet moments, so gameplay never waits
// on the model. Without the Android bridge (browser, sims) every call falls back to templates.
(function (root) {
  const AI = {};
  const bridge = !!(root.AzAI && root.AzAI.postMessage);
  AI.available = bridge;
  const now = () => Date.now();
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  // ---------- bridge: JS -> Dart -> Kotlin, replies come back through AZAI_REPLY
  let seq = 0;
  const waiting = {};
  root.AZAI_REPLY = function (s) {
    let r; try { r = typeof s === 'string' ? JSON.parse(s) : s; } catch (e) { return; }
    const w = waiting[r.id]; if (!w) return;
    delete waiting[r.id]; if (w.t) clearTimeout(w.t);
    if (r.ok) w.res(r.value); else w.rej(r.value || { code: 'error' });
  };
  AI.call = function (cmd, args, timeoutMs) {
    if (!bridge) return Promise.reject({ code: 'unsupported' });
    return new Promise((res, rej) => {
      const id = ++seq;
      const t = timeoutMs ? setTimeout(() => { delete waiting[id]; rej({ code: 'timeout' }); }, timeoutMs) : null;
      waiting[id] = { res, rej, t };
      root.AzAI.postMessage(JSON.stringify({ id, cmd, args: args || {} }));
    });
  };

  // ---------- prefs, stats, bank (localStorage, per device not per character)
  const PREF_KEY = 'azsolo.ai', BANK_KEY = 'azsolo.aibank';
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage full or blocked */ } };
  AI.prefs = load(PREF_KEY, { on: false, stats: null });
  const bank = load(BANK_KEY, {});
  ['general', 'lfg', 'party', 'npc', 'bio'].forEach((k) => { if (!bank[k] || typeof bank[k] !== 'object') bank[k] = {}; });
  const saveBank = () => store(BANK_KEY, bank);
  const savePrefs = () => store(PREF_KEY, AI.prefs);

  // state: unsupported | checking | no_model | off | idle | loading | busy | error
  AI.state = bridge ? 'checking' : 'unsupported';
  AI.device = null;       // last device info (ram, battery, charging, powerSave, thermal)
  AI.model = null;        // {path, bytes, loaded} or null
  AI.error = null;
  AI.pauseReason = null;  // why the scheduler is holding back, shown in Hero
  AI.onChange = null;     // UI hook
  const changed = () => { if (AI.onChange) try { AI.onChange(); } catch (e) { /* ui gone */ } };

  // Model size by phone RAM. totalMem reports a little under the box number (a 6 GB phone shows ~5.5 GB).
  AI.tier = function () {
    const mb = AI.device ? AI.device.ramMB : 0;
    if (mb >= 5200) return { id: '1b', name: 'Gemma 3 1B', note: 'Best quality for this phone' };
    if (mb >= 2800) return { id: 'tiny', name: 'Gemma 3 270M', note: 'Smaller model for this phone' };
    return { id: 'off', name: 'None', note: 'This phone has too little memory for the AI pack' };
  };

  let devAt = 0;
  function refreshDevice(force) {
    if (!bridge) return Promise.resolve(null);
    if (!force && AI.device && now() - devAt < 60000) return Promise.resolve(AI.device);
    return AI.call('device', {}, 15000).then((d) => { AI.device = d; devAt = now(); return d; }, () => AI.device);
  }

  // Battery guards. Returns null when it is fine to generate, otherwise the reason.
  function guard() {
    const d = AI.device;
    if (!d) return 'Checking the phone';
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return 'App in background';
    if (d.powerSave) return 'Battery saver is on';
    if (!d.charging && d.battery >= 0 && d.battery < 30) return 'Battery under 30%';
    if (d.thermal >= 2) return 'Phone is warm, cooling down';
    if (d.lowMemory) return 'Phone is low on memory';
    return null;
  }
  // Quiet moment: not fighting, no cutscene. Chat banked now is used later in the fight.
  function quiet() {
    const G = root.G;
    if (!G || !G.S) return false;
    if (G.fight || G.paused) return false;
    if (root.CS && root.CS.playing) return false;
    return true;
  }

  // ---------- model lifecycle: loaded lazily, unloaded after a few idle minutes to free ~1 GB RAM
  let loaded = false, loading = null, lastUse = 0;
  const IDLE_UNLOAD = 3 * 60000;
  function ensureLoaded() {
    if (loaded) return Promise.resolve();
    if (loading) return loading;
    AI.state = 'loading'; changed();
    loading = AI.call('load', { maxTokens: 768 }, 120000).then(() => { loaded = true; loading = null; AI.state = 'idle'; AI.error = null; changed(); }, (e) => {
      loading = null; loaded = false; AI.state = 'error';
      AI.error = 'The model file did not load. Use the Gemma 3 .task file (int4). ' + ((e && e.message) || '').slice(0, 120);
      changed(); throw e;
    });
    return loading;
  }
  function unload() { if (!loaded) return; loaded = false; AI.call('unload', {}, 10000).catch(() => {}); if (AI.state === 'idle') changed(); }

  AI.init = function () {
    if (!bridge) return Promise.resolve();
    return refreshDevice(true).then(() => AI.call('model', {}, 15000)).then((m) => {
      AI.model = m || null;
      AI.state = !AI.model ? 'no_model' : AI.prefs.on && AI.tier().id !== 'off' ? 'idle' : 'off';
      changed();
    }, () => { AI.state = 'error'; AI.error = 'Could not reach the AI pack in the app.'; changed(); });
  };

  AI.importModel = function () {
    if (!bridge) return Promise.reject({ code: 'unsupported' });
    unload();
    return AI.call('importModel', {}).then((m) => {
      if (!m) return null;             // picker cancelled
      AI.model = m;
      if (m.bytes < 50 * 1024 * 1024) { AI.state = 'error'; AI.error = 'That file is too small to be a model.'; changed(); return m; }
      AI.state = AI.prefs.on ? 'idle' : 'off'; AI.error = null; changed();
      // prove the file loads straight away, so a wrong file is caught while he is looking at it
      return ensureLoaded().then(() => { if (!AI.prefs.on) { unload(); AI.state = 'off'; changed(); } return m; });
    });
  };
  AI.removeModel = function () {
    loaded = false;
    return AI.call('deleteModel', {}, 20000).then(() => { AI.model = null; AI.state = 'no_model'; changed(); });
  };
  AI.setOn = function (on) {
    AI.prefs.on = !!on;
    if (on) AI.prefs.stats = { since: now(), batt0: AI.device ? AI.device.battery : -1, busyMs: 0, lines: 0, jobs: 0 };
    savePrefs();
    if (!on) unload();
    AI.state = !AI.model ? 'no_model' : on ? 'idle' : 'off';
    changed();
  };
  AI.ready = () => bridge && AI.prefs.on && !!AI.model && AI.tier().id !== 'off' && AI.state !== 'error';

  // ---------- generation
  const turn = (text) => `<start_of_turn>user\n${text}<end_of_turn>\n<start_of_turn>model\n`;
  const BAD = /(https?:|www\.|\.com\b|as an ai|language model|i cannot|i can't help|sorry, but|\bfuck|\bshit|\bcunt|\bnigg|\bfag|\bretard|\brape|\bkill yourself|\bkys\b)/i;
  const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu;
  function clean(text, maxLen) {
    return String(text || '').split(/\n+/).map((l) => l.replace(EMOJI, '').replace(/^\s*(?:[-*•]|\d+[.)]|>)\s*/, '').replace(/^["'“”]+|["'“”]+$/g, '').replace(/\*\*/g, '').replace(/^\w[\w ]{0,20}:\s+/, (m) => (/^(general|lfg|party|say|player\d*)/i.test(m) ? '' : m)).trim())
      .filter((l) => l.length >= 2 && l.length <= (maxLen || 110) && !BAD.test(l) && !/^(here are|sure|okay|certainly)/i.test(l));
  }
  let busy = false;
  function gen(prompt, temperature) {
    busy = true; AI.state = 'busy'; changed();
    const t0 = now();
    return ensureLoaded().then(() => AI.call('generate', { prompt: turn(prompt), temperature: temperature || 0.9 }, 90000)).then((r) => {
      const st = AI.prefs.stats; if (st) { st.busyMs += now() - t0; st.jobs++; }
      lastUse = now(); busy = false; AI.state = 'idle'; changed();
      return (r && r.text) || '';
    }, (e) => { busy = false; lastUse = now(); if (AI.state !== 'error') AI.state = 'idle'; changed(); throw e; });
  }
  function addLines(bucket, key, lines, cap) {
    const arr = bank[bucket][key] || (bank[bucket][key] = []);
    const seen = new Set(arr.map((x) => x.toLowerCase()));
    for (const l of lines) if (!seen.has(l.toLowerCase())) { arr.push(l); seen.add(l.toLowerCase()); }
    if (arr.length > cap) arr.splice(0, arr.length - cap);
    const st = AI.prefs.stats; if (st) st.lines += lines.length;
    saveBank(); savePrefs();
  }

  // ---------- context for prompts, all taken from game data so the model has real names to use
  function here() {
    const S = root.G.S, P = S.player, D = root.D;
    const place = D.PLACES[P.place] || {};
    const race = D.RACES[P.race] || D.RACES.human;
    const mobs = (place.mobs || []).map((m) => (D.MOBS[m[0]] || {}).name).filter(Boolean);
    const region = place.region || 'elwynn';
    const zonePlaces = Object.values(D.PLACES).filter((p) => (p.region || 'elwynn') === region);
    const zoneMobs = [...new Set(zonePlaces.flatMap((p) => (p.mobs || []).map((m) => (D.MOBS[m[0]] || {}).name)).filter(Boolean))].slice(0, 8);
    const acts = Object.values(D.ACTIVITIES).filter((a) => (D.PLACES[a.where] || {}).region === region).map((a) => a.name);
    const npcs = (place.npcs || []).map((n) => D.NPCS[n] && D.NPCS[n].name).filter(Boolean);
    return { S, P, D, place, race, faction: race.faction || 'alliance', zone: place.zone || place.name, placeName: place.name, mobs: mobs.length ? mobs : zoneMobs, zoneMobs, acts, npcs };
  }

  // Each job returns a promise. Buckets: general[zone], lfg[zone], party[kind], npc[id], bio[botId].
  const PARTY_KINDS = {
    hello: 'just after joining a group, greeting the others', pull: 'right before the tank pulls a pack of monsters', win: 'right after the group killed a pack or a boss',
    wipe: 'right after the whole group died (friendly, self-deprecating)', wipe_rude: 'right after the whole group died (annoyed, blaming someone, but no swearing)',
    loot: 'when someone else won an item roll', bye: 'when the group is done and splitting up', leave: 'leaving the group early for a real-life reason', rage: 'rage-quitting a bad group (no swearing)',
  };
  function jobGeneral(c) {
    const p = `Write 8 short messages that different players type in General chat in ${c.zone} in a classic World of Warcraft style MMO. They are low-level ${c.faction === 'horde' ? 'Horde' : 'Alliance'} players. Monsters here: ${c.zoneMobs.join(', ')}.${c.acts.length ? ' Group content here: ' + c.acts.join(', ') + '.' : ''} Mix questions, jokes, small complaints, selling items, asking where a monster is. Casual gamer style, mostly lowercase, short forms like lf, pst, lol, ty, wts. Do not use player names. Do not mention places or monsters not listed. One message per line, under 70 characters, no numbering.`;
    return gen(p, 1.0).then((t) => addLines('general', c.zone, clean(t, 90), 40));
  }
  function jobLfg(c) {
    if (!c.acts.length) return Promise.resolve();
    const p = `Write 6 short "looking for group" messages that players post in an MMO's LookingForGroup channel. Only these activities exist: ${c.acts.join(', ')}. Use roles tank, healer, dps. Style: "LF1M healer ${c.acts[0]}", "tank lfg ${c.acts[0]} pst". Casual, short, no player names. One per line, under 60 characters, no numbering.`;
    return gen(p, 0.9).then((t) => addLines('lfg', c.zone, clean(t, 70), 24));
  }
  function jobParty(kind) {
    const p = `Write 8 different short things an MMO player types in party chat ${PARTY_KINDS[kind]}. Classic World of Warcraft style, casual, mostly lowercase, 1 to 8 words each. No names, no swearing. One per line, no numbering.`;
    return gen(p, 1.0).then((t) => addLines('party', kind, clean(t, 60), 24));
  }
  function jobNpc(id) {
    const D = root.D, n = D.NPCS[id]; if (!n) return Promise.resolve();
    const c = here();
    const base = root.UI_GREETING ? root.UI_GREETING(id) : '';
    const p = `You are ${n.name}${n.title ? ', ' + n.title : ''}, a character in ${c.zone} in the world of classic Warcraft. Write 4 different one-sentence greetings you say when a ${c.race.name} adventurer walks up. Stay in character and in the tone of this line: "${base}". Do not offer quests or rewards, do not mention game mechanics. Under 20 words each. One per line, no numbering, no quotes.`;
    return gen(p, 0.9).then((t) => addLines('npc', id, clean(t, 140).slice(0, 4), 8));
  }
  function jobBio(b) {
    const D = root.D;
    const race = (D.RACES[b.race] || D.RACES.human).name, cls = D.CLASSES[b.cls].name;
    const traits = [b.style === 'tryhard' ? 'plays a lot and wants to be the best' : b.style === 'regular' ? 'plays most evenings' : 'plays casually, a few hours now and then',
      b.toxic > 0.6 ? 'can be rude in groups' : b.social > 0.7 ? 'friendly and chatty' : b.social < 0.3 ? 'quiet, rarely talks' : 'polite',
      b.ninja ? 'has a reputation for taking loot they do not need' : null].filter(Boolean).join('; ');
    const p = `Write a 2-sentence character card about an MMO player called ${b.name}, a level ${b.level} ${race} ${cls}. What we know: ${traits}. Invent one small, harmless habit in how they play (for example how they name pets, where they idle, what they collect). Third person, light and a bit funny, under 45 words. Do not change the level, race or class.`;
    return gen(p, 0.95).then((t) => { const txt = clean(t, 400).join(' ').slice(0, 320); if (txt) { bank.bio[b.id] = txt; const ids = Object.keys(bank.bio); if (ids.length > 200) delete bank.bio[ids[0]]; saveBank(); } return txt; });
  }

  // Explicit requests (bio, away story) jump the queue; the bank refills behind them.
  const urgent = [];
  function nextRefill() {
    const G = root.G; if (!G || !G.S) return null;
    const c = here();
    const charging = AI.device && AI.device.charging;
    const low = (arr, lo, full) => !arr || arr.length < (charging ? full : lo);
    if (low(bank.general[c.zone], 8, 30)) return () => jobGeneral(c);
    const inGroup = G.S.run || G.S.group || G.S.wparty || c.P.level >= 6;
    if (inGroup) for (const k of ['hello', 'pull', 'win', 'wipe', 'bye', 'loot']) if (low(bank.party[k], 4, 16)) return () => jobParty(k);
    if (c.P.level >= 6 && c.acts.length && low(bank.lfg[c.zone], 4, 16)) return () => jobLfg(c);
    for (const id of (c.place.npcs || [])) if (!bank.npc[id] || !bank.npc[id].length) return () => jobNpc(id);
    if (charging) for (const k of ['wipe_rude', 'leave', 'rage']) if (low(bank.party[k], 2, 10)) return () => jobParty(k);
    return null;
  }
  let lastErrAt = 0;
  function tick() {
    // a slow cold start can miss the first device check; keep trying until it answers
    if (bridge && !AI.device) { refreshDevice(true).then((d) => { if (d) changed(); }); return; }
    if (bridge && AI.state === 'checking') { AI.init(); return; }
    if (!AI.ready() || busy || loading) return;
    if (now() - lastErrAt < 60000) return;
    refreshDevice().then(() => {
      if (!AI.ready() || busy || loading) return;
      const why = guard() || (quiet() ? null : 'Waiting for a quiet moment');
      if (why !== AI.pauseReason) { AI.pauseReason = why; changed(); }
      if (why) { if (loaded && now() - lastUse > IDLE_UNLOAD) unload(); return; }
      const job = urgent.length ? urgent.shift() : nextRefill();
      if (!job) { if (loaded && now() - lastUse > IDLE_UNLOAD) unload(); return; }
      job().catch(() => { lastErrAt = now(); });
    });
  }
  if (bridge) { setTimeout(AI.init, 1500); setInterval(tick, 5000); }

  // ---------- what the game calls (all return null or a fallback when the pack is off)
  // Take a banked line, used once. bucket general/lfg by zone, party by kind.
  AI.take = function (bucket, key) {
    const arr = bank[bucket] && bank[bucket][key];
    if (!arr || !arr.length) return null;
    const i = Math.floor(Math.random() * arr.length);
    const line = arr.splice(i, 1)[0];
    saveBank();
    return line;
  };
  AI.zoneKey = function () { try { return here().zone; } catch (e) { return null; } };
  // NPC greetings are kept and rotated rather than used up.
  AI.npcLine = function (id) {
    const arr = bank.npc[id];
    if (!arr || !arr.length) { if (AI.ready() && !urgent.some((j) => j.npc === id)) { const j = () => jobNpc(id); j.npc = id; urgent.push(j); } return null; }
    return pick(arr);
  };
  AI.bio = function (b) { return bank.bio[b.id] || null; };
  AI.requestBio = function (b) {
    if (!AI.ready()) return Promise.resolve(null);
    if (bank.bio[b.id]) return Promise.resolve(bank.bio[b.id]);
    if (guard()) return Promise.resolve(null);
    return new Promise((res) => { const j = () => jobBio(b).then(res, () => res(null)); urgent.unshift(j); tick(); });
  };
  // The welcome-back story retells the real news digest. It may not add events.
  AI.awayStory = function (rep) {
    if (!AI.ready() || !rep || !rep.news || !rep.news.length) return Promise.resolve(null);
    const facts = rep.news.slice(-8).map((n) => '- ' + n.text).join('\n');
    return refreshDevice(true).then(() => {
      if (guard()) return null;
      const c = here();
      const p = `You are the town crier of ${c.zone}. Retell ONLY these server events for a returning adventurer, in 3 to 4 short lively sentences. Keep every name and number exactly as written. Do not add events, rewards or numbers.\n${facts}`;
      return new Promise((res) => { urgent.unshift(() => gen(p, 0.7).then((t) => res(clean(t, 600).join(' ').slice(0, 600) || null), () => res(null))); tick(); });
    });
  };
  AI.test = function () {
    return gen('Write one short line an MMO player types in General chat in Elwynn Forest. Casual, lowercase, under 60 characters.', 1.0).then((t) => ({ text: clean(t, 120)[0] || t.trim() }));
  };
  AI.bankSize = function () {
    let n = 0; for (const b of ['general', 'lfg', 'party', 'npc']) for (const k in bank[b]) n += bank[b][k].length;
    return n + Object.keys(bank.bio).length;
  };
  AI.clean = clean; // for sims

  root.AI = AI;
})(typeof window !== 'undefined' ? window : globalThis);
