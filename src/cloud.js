// Cloud save (v10.1): an optional copy of every character in the player's own Google Drive, in the hidden app-data
// folder only this game can see. No server of ours; nothing is sent anywhere else. Design and sync rules:
// docs/plans/2026-09-29-cloud-save-design.md. DOM-free like update.js: sign-in (the browser popup or the Android
// bridge) plugs in with CLOUD.setAuth, and Drive is reached through a small driver, so sim/cloudsync.js can swap in a
// fake Drive. One file per character, char-<id>.azs, holding its save code; small labels (appProperties) carry the
// revision number and what the Restore list shows, so checks never download a save.
(function (root) {
  const CLOUD = root.CLOUD = {};
  const KEY = 'azsolo.cloud'; // { on, lastAuto, lastBackup, lastError, chars: { <id>: { fileId, rev, played, at } } }
  const SLACK = 60; // seconds of play before a character counts as "played since the last sync" (just opening it does not)
  const EVERY = 10 * 60 * 1000; // automatic backups at most this often while playing
  const FILE = (id) => `char-${id}.azs`;
  const FILE_RE = /^char-(.+)\.azs$/;

  const read = () => { try { const st = JSON.parse(localStorage.getItem(KEY) || '{}'); st.chars = st.chars || {}; return st; } catch (e) { return { chars: {} }; } };
  const write = (st) => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } };
  const patch = (o) => { const st = read(); Object.assign(st, o); write(st); return st; };
  const record = (id, r) => { const st = read(); if (r) st.chars[id] = r; else delete st.chars[id]; write(st); };
  CLOUD.state = read;
  CLOUD.on = () => !!read().on;
  CLOUD.device = () => (root.UPD && UPD.inApp && UPD.inApp() ? 'phone' : 'browser');
  const err = (code, message) => Object.assign(new Error(message), { code });

  // ---- sign-in and Drive plug in here
  let auth = null, driver = null;
  CLOUD.setAuth = (a) => { auth = a; driver = a ? CLOUD.driveREST(() => a.token(false)) : null; };
  CLOUD.setDriver = (d) => { driver = d; }; // the sim's fake Drive
  const drv = () => { if (!driver) throw err('auth', 'Not signed in to Google.'); return driver; };
  CLOUD.signIn = async function () { if (!auth) throw err('unavailable', 'Cloud save is not available here.'); await auth.token(true); patch({ on: true, lastError: null }); };
  CLOUD.signOut = async function () { patch({ on: false }); if (auth && auth.signOut) try { await auth.signOut(); } catch (e) { } }; // sync records stay, so signing in again carries on

  // ---- what the cloud holds
  const labels = (S, rev) => { const P = S.player; return { rev: String(rev), name: String(P.name).slice(0, 24), lvl: String(P.level), cls: P.cls, race: P.race || 'human', at: String(Date.now()), dev: CLOUD.device(), played: String(Math.floor(P.played || 0)) }; };
  const entry = (f) => { const a = f.appProperties || {}; return { fileId: f.id, id: f.name.replace(FILE_RE, '$1'), rev: +a.rev || 0, name: a.name || '?', level: +a.lvl || 0, cls: a.cls, race: a.race, at: +a.at || 0, dev: a.dev, played: +a.played || 0 }; };
  // every character in the cloud; if two devices once created the same character's file, the highest revision wins
  CLOUD.list = async function () {
    const best = {};
    for (const f of await drv().list()) {
      if (!FILE_RE.test(f.name)) continue;
      const c = entry(f), b = best[c.id];
      if (!b || c.rev > b.rev || (c.rev === b.rev && c.at > b.at)) best[c.id] = c;
    }
    return Object.values(best).sort((a, b) => b.at - a.at);
  };

  // ---- the rules (design section 2). S: this device's save or null; c: the cloud entry or null; r: this device's record
  CLOUD.decide = function (S, c, r) {
    if (!S) return c ? 'cloudOnly' : 'none';
    if (!c) return 'push';
    if (!r) return 'conflict'; // a cloud copy this device never synced with
    const clean = (S.player.played || 0) <= r.played + SLACK;
    if (c.rev === r.rev) return clean ? 'same' : 'push';
    if (c.rev > r.rev) return clean ? 'pull' : 'conflict';
    return 'conflict'; // the cloud went back (replaced from somewhere else): ask
  };

  async function push(S, c) {
    const rev = Math.max(c ? c.rev : 0, (read().chars[S.id] || {}).rev || 0) + 1;
    const code = await G.encodeSave(S), props = labels(S, rev);
    const f = c ? await drv().update(c.fileId, props, code) : await drv().create(FILE(S.id), props, code);
    record(S.id, { fileId: (f && f.id) || c.fileId, rev, played: Math.floor(S.player.played || 0), at: Date.now() });
    patch({ lastBackup: Date.now(), lastError: null });
  }
  // bring a cloud copy in; asCopy gives it a new id (Keep both), so it becomes its own character
  async function pull(c, asCopy) {
    const S = await G.decodeSave(await drv().download(c.fileId));
    S.id = asCopy ? 'c' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36) : c.id;
    G.writeSave(S);
    if (!asCopy) record(c.id, { fileId: c.fileId, rev: c.rev, played: Math.floor(S.player.played || 0), at: Date.now() });
    return S;
  }
  const local = (id) => { if (G.S && G.S.id === id) G.save(); return G.readSave(id); };
  const brief = (S) => S && { id: S.id, name: S.player.name, level: S.player.level, cls: S.player.cls, played: S.player.played || 0, at: S.lastSeen || 0 };

  // One character: does whatever is safe and reports it. A 'conflict' changes nothing; the caller asks the player and
  // calls CLOUD.resolve. what: 'same' | 'pushed' | 'pulled' | 'newer' | 'conflict' | 'none'. With noPull (backups
  // during play) a newer cloud copy is only reported ('newer'), never loaded over the character being played.
  CLOUD.sync = async function (id, list, noPull) {
    const cl = list || await CLOUD.list(), c = cl.find((x) => x.id === id) || null, S = local(id);
    const d = CLOUD.decide(S, c, read().chars[id] || null);
    if (d === 'push') { await push(S, c); return { what: 'pushed', local: brief(S), cloud: c }; }
    if (d === 'pull') { if (noPull) return { what: 'newer', local: brief(S), cloud: c }; const N = await pull(c); return { what: 'pulled', local: brief(N), cloud: c }; }
    return { what: d === 'cloudOnly' ? 'none' : d, local: brief(S), cloud: c };
  };
  // Back up now: every character on this device. Returns the conflicts (for the caller to ask about).
  CLOUD.backupAll = async function () {
    const cl = await CLOUD.list(), out = [];
    for (const ch of G.characters()) { const r = await CLOUD.sync(ch.id, cl); if (r.what === 'conflict') out.push(r); }
    return out;
  };
  // The player's answer to a conflict: 'local' (this device's wins), 'cloud' (the cloud's wins), 'both' (keep the
  // cloud's as a new character, then this device's goes up as the next revision)
  CLOUD.resolve = async function (id, choice) {
    const c = (await CLOUD.list()).find((x) => x.id === id) || null, S = local(id);
    if (choice === 'cloud' && c) return { what: 'pulled', local: brief(await pull(c)) };
    if (choice === 'both' && c) {
      if (G.characters().length >= G.MAX_CHARS) throw err('full', `You already have ${G.MAX_CHARS} characters, so there is no room for a copy. Delete one first.`);
      const copy = await pull(c, true);
      await push(S, c);
      return { what: 'both', local: brief(S), copy: brief(copy) };
    }
    await push(S, c);
    return { what: 'pushed', local: brief(S) };
  };
  // Restore: bring in the chosen cloud characters. New ones must all fit, or nothing is restored. Ones this device
  // already has follow the rules (a newer, safe copy loads; a conflict is returned for the caller to ask about).
  CLOUD.restore = async function (ids) {
    const cl = await CLOUD.list(), pick = cl.filter((c) => ids.includes(c.id));
    const fresh = pick.filter((c) => !G.readSave(c.id)), free = G.MAX_CHARS - G.characters().length;
    if (fresh.length > free) throw err('full', `That would make ${G.characters().length + fresh.length} characters, and the most is ${G.MAX_CHARS}. Delete ${fresh.length - free} first, or restore fewer.`);
    const out = [];
    for (const c of pick) out.push(fresh.includes(c) ? { what: 'restored', local: brief(await pull(c)), cloud: c } : await CLOUD.sync(c.id, cl));
    return out;
  };
  // A character deleted on this device: forget its record; the cloud copy goes only if asked
  CLOUD.forget = (id) => record(id, null);
  CLOUD.deleteCloud = async function (id) {
    for (const f of await drv().list()) if (f.name === FILE(id)) await drv().remove(f.id);
    record(id, null);
  };

  // Automatic backup of the character being played: when the game goes to the background (force) and at most every
  // 10 minutes. Never throws: a failure is kept in lastError for the Settings section ('auth' shows Reconnect).
  CLOUD.maybeBackup = async function (force) {
    if (!CLOUD.on() || !root.G || !G.S) return null;
    const st = read();
    if (!force && Date.now() - (st.lastAuto || 0) < EVERY) return null;
    patch({ lastAuto: Date.now() });
    try { const r = await CLOUD.sync(G.S.id, null, true); patch({ lastError: null }); return r; }
    catch (e) { patch({ lastError: { code: e.code || 'drive', message: e.message, at: Date.now() } }); return { what: 'error', error: e }; }
  };

  // ---- the real Drive: plain REST calls, only ever in the app-data folder
  const API = 'https://www.googleapis.com/drive/v3', UP = 'https://www.googleapis.com/upload/drive/v3';
  CLOUD.driveREST = function (getToken) {
    const call = async (url, opt) => {
      const tok = await getToken();
      let r;
      try { r = await fetch(url, Object.assign({}, opt, { headers: Object.assign({ Authorization: 'Bearer ' + tok }, (opt && opt.headers) || {}) })); }
      catch (e) { throw err('offline', 'No connection to Google Drive.'); }
      if (r.status === 401) throw err('auth', 'The Google sign-in has run out. Reconnect to carry on.');
      if (!r.ok) throw err('drive', `Google Drive answered ${r.status}. Try again in a moment.`);
      return r;
    };
    const multipart = (meta, text) => {
      const b = 'azsolo' + Math.random().toString(36).slice(2);
      return { headers: { 'Content-Type': `multipart/related; boundary=${b}` },
        body: `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${b}\r\nContent-Type: text/plain\r\n\r\n${text}\r\n--${b}--` };
    };
    return {
      async list() {
        let out = [], page = '';
        do {
          const r = await call(`${API}/files?spaces=appDataFolder&pageSize=100&fields=nextPageToken,files(id,name,appProperties)${page ? '&pageToken=' + encodeURIComponent(page) : ''}`);
          const j = await r.json(); out = out.concat(j.files || []); page = j.nextPageToken;
        } while (page);
        return out;
      },
      async create(name, props, text) { const m = multipart({ name, parents: ['appDataFolder'], mimeType: 'text/plain', appProperties: props }, text); return (await call(`${UP}/files?uploadType=multipart&fields=id`, { method: 'POST', headers: m.headers, body: m.body })).json(); },
      async update(id, props, text) { const m = multipart({ appProperties: props }, text); return (await call(`${UP}/files/${encodeURIComponent(id)}?uploadType=multipart&fields=id`, { method: 'PATCH', headers: m.headers, body: m.body })).json(); },
      async download(id) { return (await call(`${API}/files/${encodeURIComponent(id)}?alt=media`)).text(); },
      async remove(id) { await call(`${API}/files/${encodeURIComponent(id)}`, { method: 'DELETE' }); },
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
