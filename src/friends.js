// Friends (v10.2): real players add each other by friend code and see each other's shared characters, gear and
// online status, live. Optional and off until the player turns it on; nothing leaves the device before that.
// Design: docs/plans/2026-09-30-friends-design.md. DOM-free like cloud.js: Firebase plugs in as a backend
// (FRIENDS.setBackend; the real one is FRIENDS.firebase() at the end), so sim/friends.js can swap in a fake one.
//   Firestore: codes/{code} → uid · profiles/{uid} · requests/{to}/in/{from} · friends/{uid}/list/{other}
//   Realtime Database: status/{uid}/{conn} (one entry per open game) · see/{uid}/{other} (who may read my status)
(function (root) {
  const FRIENDS = root.FRIENDS = {};
  const KEY = 'azsolo.friends'; // { on, code, sent: { <uid>: { code, at } }, wrote: { <charId>: hash }, playing: hash, seenAt }
  const V = 1; // profile format
  const EVERY = 60 * 1000; // profile writes at most this often while playing
  const SEEN_EVERY = 10 * 60 * 1000; // "last played" moves at least this often
  const ALPHA = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // no 0/O, 1/I/L
  const CODE_RE = /^[2-9A-HJKMNP-Z]{8}$/;

  const read = () => { let st = null; try { st = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { st = null; } st = st || {}; st.sent = st.sent || {}; st.wrote = st.wrote || {}; return st; };
  const write = (st) => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } };
  const patch = (o) => { const st = read(); Object.assign(st, o); write(st); return st; };
  const err = (code, message) => Object.assign(new Error(message), { code });
  FRIENDS.state = read;
  FRIENDS.on = () => !!read().on;

  let be = null;
  FRIENDS.setBackend = (b) => { be = b; };
  FRIENDS.available = () => !!be;
  const back = () => { if (!be) throw err('unavailable', 'Friends is not available here.'); return be; };

  // ---- friend codes: 8 characters, shown as K7QM-P2XD
  FRIENDS.newCode = function (rand) { rand = rand || Math.random; let s = ''; for (let i = 0; i < 8; i++) s += ALPHA[Math.floor(rand() * ALPHA.length)]; return s; };
  FRIENDS.showCode = (c) => (c ? c.slice(0, 4) + '-' + c.slice(4) : '');
  // what a player types or pastes: the code in any case, with or without the dash, or a whole share link
  FRIENDS.cleanCode = function (text) {
    const t = String(text || '').toUpperCase(), m = t.match(/FRIEND=([0-9A-Z-]+)/);
    const raw = (m ? m[1] : t).replace(/[^0-9A-Z]/g, '');
    return CODE_RE.test(raw) ? raw : null;
  };
  FRIENDS.link = (code) => `${(root.UPD && UPD.WEB) || 'https://faizal97.github.io/realm-of-loner/'}#friend=${FRIENDS.showCode(code)}`;

  // ---- what friends see of one character, straight from its save. null when the player hides it.
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  // an item that is exactly the game's own goes as its id; a rolled one (random stats) goes whole
  const gearOf = function (eq) {
    const out = {};
    for (const slot in eq || {}) { const it = eq[slot]; if (!it) continue; const base = root.D && D.ITEMS[it.id]; out[slot] = base && same(base, it) ? { id: it.id } : it; }
    return out;
  };
  const rankName = function (rep) { const R = root.SOC && SOC.RANKS; if (!R) return null; let r = 0; R.forEach((k, i) => { if ((rep || 0) >= k.at) r = i; }); return R[r].name; };
  FRIENDS.charCard = function (S) {
    if (!S || !S.player || S.player.friendsHidden) return null;
    const P = S.player, C = (root.D && D.CLASSES[P.cls]) || {};
    const profs = {}; for (const k in (P.prof || {})) profs[k] = P.prof[k].skill || 0;
    const guild = P.guild >= 0 && root.B && B.GUILDS && B.GUILDS[P.guild] ? { name: B.GUILDS[P.guild], rank: rankName(P.guildRep) } : null;
    return { name: P.name, race: P.race || 'human', cls: P.cls, look: [P.gender || 'm', +P.skin || 0, +P.hair || 0], level: P.level,
      role: P.role || C.role || null, talents: Object.assign({}, P.talents || {}), profs, guild, title: P.title || null,
      mounts: (P.mounts || []).length, gear: gearOf(P.equip), at: S.lastSeen || Date.now() };
  };
  // where the character being played is; null when it is hidden (friends then only see "Online")
  FRIENDS.playing = function (S) {
    if (!S || !S.player || S.player.friendsHidden) return null;
    const pl = root.D && D.PLACES[S.player.place];
    return { char: S.id, zone: (pl && pl.zone) || null, place: (pl && pl.name) || null, run: (S.run && S.run.name) || null };
  };
  const hash = function (o) {
    if (o == null) return null;
    const s = JSON.stringify(o); let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return h.toString(36) + '.' + s.length.toString(36);
  };
  const cardHash = (c) => (c ? hash(Object.assign({}, c, { at: 0 })) : null); // the time alone is no reason to write

  // ---- the profile writer: gathers changes and writes only what friends would notice, at most once a minute.
  // A device only ever writes the characters it has (chars.<id>), so a browser with fewer characters never removes
  // the phone's. A hidden or deleted character becomes a delete of its field.
  const dirty = new Set();
  let lastFlush = 0, flushing = null;
  FRIENDS.touch = (id) => { if (id) dirty.add(id); };
  FRIENDS.resetLocal = () => { dirty.clear(); lastFlush = 0; }; // a different player on this page (the sim's devices)
  FRIENDS.forgetChar = (id) => { if (id) { dirty.add(id); if (FRIENDS.on()) FRIENDS.flush(true); } };
  const readChar = (id) => (root.G && G.S && G.S.id === id ? G.S : root.G && G.readSave(id));
  FRIENDS.flush = function (force) {
    if (!FRIENDS.on() || !be) return Promise.resolve(null);
    if (flushing) return flushing;
    const now = Date.now();
    if (!force && now - lastFlush < EVERY) return Promise.resolve(null);
    const cur = root.G && G.S, st = read(), chars = {}, hashes = {};
    if (cur) dirty.add(cur.id);
    const ids = [...dirty];
    for (const id of ids) {
      const card = FRIENDS.charCard(readChar(id)), h = cardHash(card);
      if (h === (st.wrote[id] || null)) continue;
      chars[id] = card; hashes[id] = h;
    }
    const playing = cur ? FRIENDS.playing(cur) : null, ph = hash(playing);
    const fields = {};
    if (Object.keys(chars).length) fields.chars = chars;
    if (ph !== (st.playing === undefined ? null : st.playing)) fields.playing = playing;
    const seen = !!cur && (force || now - (st.seenAt || 0) >= SEEN_EVERY);
    lastFlush = now;
    if (!Object.keys(fields).length && !seen) { dirty.clear(); return Promise.resolve({ wrote: 0 }); }
    Object.assign(fields, { v: V, code: st.code, updatedAt: now }, cur ? { lastSeen: now } : {});
    flushing = be.updateProfile(fields).then(() => {
      const s2 = read();
      for (const id in hashes) { if (hashes[id]) s2.wrote[id] = hashes[id]; else delete s2.wrote[id]; }
      s2.playing = ph; if (cur) s2.seenAt = now; write(s2);
      for (const id of ids) dirty.delete(id);
      return { wrote: Object.keys(chars).length, fields };
    }).catch((e) => ({ error: e })).finally(() => { flushing = null; });
    return flushing;
  };

  // ---- turning Friends on and off
  FRIENDS.turnOn = async function () {
    const b = back();
    await b.signIn(true);
    const me = b.uid();
    let code = read().code || null;
    if (!code) { const mine = await b.getProfile(me).catch(() => null); if (mine && mine.code) code = mine.code; } // made on another device
    if (code && (await b.getCode(code)) !== me) code = null;
    for (let i = 0; !code && i < 6; i++) { const c = FRIENDS.newCode(); if (await b.createCode(c)) code = c; }
    if (!code) throw err('code', 'Could not make a friend code. Try again in a moment.');
    patch({ on: true, code, wrote: {}, playing: undefined, seenAt: 0 });
    if (root.G) for (const ch of G.characters()) dirty.add(ch.id);
    const r = await FRIENDS.flush(true);
    if (r && r.error) throw r.error;
    await FRIENDS.repairSee();
    return code;
  };
  // everything about you goes; the friendships (two ids and a date) and your code stay, so on again restores them
  FRIENDS.turnOff = async function () {
    const b = back();
    await b.signIn(true);
    const me = b.uid(), st = read();
    await b.presence(null).catch(() => {});
    await b.deleteProfile();
    await b.clearSee();
    for (const to in st.sent) await b.deleteRequest(to, me).catch(() => {});
    patch({ on: false, sent: {}, wrote: {}, playing: undefined, seenAt: 0 });
    dirty.clear();
  };
  // ... and this removes the rest: every friendship on both sides, the requests waiting for you, and the code
  FRIENDS.deleteAll = async function () {
    const b = back();
    await b.signIn(true);
    const me = b.uid(), code = read().code;
    await FRIENDS.turnOff();
    for (const other of await b.listFriends()) await b.removeFriend(other);
    for (const r of await b.listRequests()) await b.deleteRequest(me, r.from).catch(() => {});
    if (code) await b.deleteCode(code).catch(() => {});
    patch({ code: null });
    if (b.signOut) await b.signOut().catch(() => {});
  };

  // ---- adding and removing friends
  const whoAmI = function () {
    const S = (root.G && G.S) || (root.G && G.characters()[0] && G.readSave(G.characters()[0].id));
    const P = S && S.player;
    return { name: String((P && P.name) || 'Adventurer').slice(0, 24), cls: (P && P.cls) || 'warrior', level: (P && P.level) || 1, at: Date.now() };
  };
  FRIENDS.add = async function (text) {
    const code = FRIENDS.cleanCode(text);
    if (!code) throw err('bad', 'That is not a friend code. Codes look like K7QM-P2XD.');
    const b = back(), st = read();
    if (code === st.code) throw err('self', 'That is your own code. Send it to a friend instead.');
    const uid = await b.getCode(code);
    if (!uid) throw err('unknown', 'No player has that code. Check it and try again.');
    if ((await b.listFriends()).includes(uid)) throw err('already', 'You are already friends.');
    if ((await b.listRequests()).some((r) => r.from === uid)) { await FRIENDS.accept(uid); return { what: 'accepted', uid }; } // they asked first
    await b.sendRequest(uid, whoAmI());
    const s2 = read(); s2.sent[uid] = { code, at: Date.now() }; write(s2);
    return { what: 'sent', uid };
  };
  FRIENDS.accept = async function (from) { const b = back(); await b.accept(from); await b.setSee(from, true); };
  FRIENDS.decline = async function (from) { const b = back(); await b.deleteRequest(b.uid(), from); };
  FRIENDS.cancel = async function (to) { const b = back(); await b.deleteRequest(to, b.uid()); const st = read(); delete st.sent[to]; write(st); };
  FRIENDS.remove = async function (other) { const b = back(); await b.removeFriend(other); await b.setSee(other, null); };
  // Realtime Database rules cannot look into Firestore, so each player keeps their own "who may see my status" list.
  // Keep it equal to the friend list every start (and whenever the list changes), so an interrupted step heals.
  FRIENDS.repairSee = async function () {
    const b = back(), friends = await b.listFriends(), see = await b.listSee();
    for (const f of friends) if (!see.includes(f)) await b.setSee(f, true);
    for (const s of see) if (!friends.includes(s)) await b.setSee(s, null);
    const st = read(); let changed = false;
    for (const to in st.sent) if (friends.includes(to)) { delete st.sent[to]; changed = true; } // they accepted
    if (changed) write(st);
    return friends;
  };

  // ---- sharing one character or not (saved in the character, so cloud save carries it to other devices)
  FRIENDS.shared = (S) => !!(S && S.player && !S.player.friendsHidden);
  FRIENDS.setShared = function (id, on) {
    const cur = root.G && G.S && G.S.id === id, S = readChar(id);
    if (!S) return Promise.resolve(null);
    if (on) delete S.player.friendsHidden; else S.player.friendsHidden = true;
    if (cur) G.save(); else G.writeSave(S);
    dirty.add(id);
    if (cur && be) be.presence(FRIENDS.on() ? { char: on ? id : null } : null).catch(() => {});
    return FRIENDS.flush(true);
  };

  // ---- online status: one entry per open game while it is visible
  FRIENDS.online = function (on) {
    if (!FRIENDS.on() || !be) return Promise.resolve();
    const S = root.G && G.S;
    return be.presence(on ? { char: FRIENDS.shared(S) ? S.id : null } : null).catch(() => {});
  };

  // ---- the live view for the Friends tab and the Social dot: calls cb({ friends, requests, sent }) on every change.
  // friends: [{ uid, profile (null while it loads or when Friends is off for them), online, char, lastSeen }]
  FRIENDS.watch = function (cb) {
    const b = back();
    const subs = {}, view = { friends: {}, requests: [], ready: false };
    const emit = () => {
      const st = read();
      const friends = Object.values(view.friends).map((f) => Object.assign({}, f)).sort((a, b2) => (b2.online - a.online) || ((b2.profile && b2.profile.lastSeen) || 0) - ((a.profile && a.profile.lastSeen) || 0));
      cb({ friends, requests: view.requests.slice(), sent: Object.keys(st.sent).map((uid) => Object.assign({ uid }, st.sent[uid])), ready: view.ready });
    };
    const onList = (uids) => {
      for (const u of Object.keys(view.friends)) if (!uids.includes(u)) { (subs[u] || []).forEach((f) => f()); delete subs[u]; delete view.friends[u]; }
      for (const u of uids) if (!view.friends[u]) {
        view.friends[u] = { uid: u, profile: null, online: false, char: null, lastSeen: 0 };
        subs[u] = [
          b.watchProfile(u, (p) => { if (!view.friends[u]) return; view.friends[u].profile = p; view.friends[u].lastSeen = (p && p.lastSeen) || 0; emit(); }),
          b.watchStatus(u, (conns) => { if (!view.friends[u]) return; const list = Object.values(conns || {}).sort((x, y) => (y.at || 0) - (x.at || 0)); view.friends[u].online = list.length > 0; view.friends[u].char = list.length ? list[0].char || null : null; emit(); }),
        ];
      }
      view.ready = true; emit();
      FRIENDS.repairSee().catch(() => {});
    };
    const offList = b.watchFriends(onList);
    const offReq = b.watchRequests((reqs) => { view.requests = reqs; emit(); });
    return () => { offList(); offReq(); for (const u in subs) subs[u].forEach((f) => f()); };
  };

  // how a friend's item is shown: the game's own item for an id, the stored one for a rolled item, or null when
  // this version of the game does not know it (the tab then asks to update)
  FRIENDS.item = (g) => (!g ? null : g.id && !g.name ? (root.D && D.ITEMS[g.id]) || null : g);
})(typeof window !== 'undefined' ? window : globalThis);
