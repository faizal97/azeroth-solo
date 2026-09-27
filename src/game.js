// Azeroth Solo — game controller: world, quests, items, group finder, dungeon runs, saves.
(function (root) {
  const D = root.D, E = root.E, B = root.B;
  const G = {};
  const rnd = E.rnd, rint = E.rint, clamp = E.clamp;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const now = () => Date.now();
  const lower = (t) => String(t).toLowerCase();
  // Characters: one save per character under azsolo.char.<id>, plus an index for the select screen.
  const OLD_KEY = 'azsolo.save.v1', INDEX_KEY = 'azsolo.chars', CHAR_KEY = (id) => 'azsolo.char.' + id;
  G.MAX_CHARS = 10;
  const ls = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { } },
  };
  let listeners = {};
  G.on = (t, fn) => { (listeners[t] = listeners[t] || []).push(fn); };
  const emit = (t, d) => { for (const fn of (listeners[t] || [])) try { fn(d); } catch (e) { console.error(e); } };
  G.emit = emit;
  G.fight = null; // live combat (not saved)
  G.pUnit = null;

  // ============================================================ new game / save
  G.newGame = function (o) {
    const C = D.CLASSES[o.cls];
    const race = D.RACES[o.race] ? o.race : 'human';
    const start = D.RACES[race].start;
    const t = now();
    const S = {
      v: 1, id: 'c' + t.toString(36) + Math.floor(Math.random() * 1e4).toString(36), created: t, lastSeen: t, lastSim: t, nextBotId: 1000, server: {},
      player: {
        name: o.name, cls: o.cls, gender: o.gender || 'm', skin: o.skin || 0, hair: o.hair || 0,
        level: 1, xp: 0, rested: 0, money: 0, hp: null, res: null, place: start, bind: start,
        equip: Object.assign({ weapon: G.copyItem(C.startWeapon), chest: G.copyItem(C.startChest) }, C.startRanged ? { ranged: G.copyItem(C.startRanged) } : {}),
        bags: [{ item: G.copyItem('hearthstone'), n: 1 }, { item: G.copyItem('tough_bread'), n: 4 }].concat(C.resource === 'mana' ? [{ item: G.copyItem('spring_water'), n: 4 }] : []),
        race, pet: C.pets ? { type: 'imp', name: pick(D.PETS.imp.names), hp: null } : null,
        quests: {}, done: {}, auras: [], hearthAt: 0, guild: -1, kills: 0, deaths: 0, visited: { [start]: true }, played: 0,
      },
      world: {}, bots: B.makePopulation(260), chat: [], news: [], pending: [], group: null, queue: null, run: null, flags: {},
    };
    G.S = S;
    const u = E.charUnit(G.charOf(), 'ally', 'player', t);
    S.player.hp = u.maxHp; S.player.res = u.resType === 'rage' ? 0 : u.maxRes;
    sys(`Welcome to Azeroth Solo. Realm: ${D.REALM}.`);
    sys('Tap a creature to attack it. Talk to people with a yellow ! to get quests.');
    G.save();
    return S;
  };

  // Move a pre-1.5.1 single save into the character list once.
  function migrate() {
    const old = ls.get(OLD_KEY);
    if (!old) return;
    try {
      const S = JSON.parse(old);
      if (!S.id) S.id = 'c' + (S.created || now()).toString(36);
      ls.set(CHAR_KEY(S.id), JSON.stringify(S));
      const idx = readIndex(); if (!idx.some((c) => c.id === S.id)) idx.push(summary(S)); writeIndex(idx);
      ls.del(OLD_KEY);
    } catch (e) { /* leave the old save alone if it can't be read */ }
  }
  function readIndex() { try { return JSON.parse(ls.get(INDEX_KEY) || '[]'); } catch (e) { return []; } }
  function writeIndex(idx) { ls.set(INDEX_KEY, JSON.stringify(idx)); }
  function summary(S) {
    const P = S.player;
    return { id: S.id, name: P.name, cls: P.cls, race: P.race || 'human', gear: G.gearLooks(P), level: P.level, place: P.place, skin: P.skin, hair: P.hair, gender: P.gender, lastSeen: S.lastSeen || now(), created: S.created };
  }
  G.characters = function () { migrate(); return readIndex().sort((a, b) => b.lastSeen - a.lastSeen); };
  G.save = function () {
    if (!G.S) return;
    G.S.lastSeen = now();
    if (G.fight && G.pUnit) E.writeBack(G.fight, G.pUnit, now());
    ls.set(CHAR_KEY(G.S.id), JSON.stringify(G.S));
    const idx = readIndex().filter((c) => c.id !== G.S.id); idx.push(summary(G.S)); writeIndex(idx);
  };
  G.hasSave = function () { return G.characters().length > 0; };
  G.logout = function () { G.save(); G.S = null; G.fight = null; G.pUnit = null; };
  G.deleteCharacter = function (id) {
    ls.del(CHAR_KEY(id));
    writeIndex(readIndex().filter((c) => c.id !== id));
    if (G.S && G.S.id === id) { G.S = null; G.fight = null; G.pUnit = null; }
  };
  G.load = function (id) {
    migrate();
    if (!id) { const list = G.characters(); if (!list.length) return null; id = list[0].id; }
    const raw = ls.get(CHAR_KEY(id));
    if (!raw) return null;
    try { G.S = JSON.parse(raw); } catch (e) { return null; }
    const S = G.S;
    if (!S.id) S.id = id;
    G.fight = null; G.pUnit = null;
    S.pending = []; S.chatTimers = {};
    if (S.run && S.run.phase === 'fight') S.run.phase = 'rest', S.run.restUntil = now() + 3000;
    return G.catchUp();
  };
  G.exportSave = function () { G.save(); return btoa(unescape(encodeURIComponent(JSON.stringify(G.S)))); };
  G.importSave = function (str) {
    const S = JSON.parse(decodeURIComponent(escape(atob(str.trim()))));
    if (!S.player || !S.bots) throw new Error('That is not an Azeroth Solo save.');
    // an imported save becomes its own character
    S.id = 'c' + now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
    G.S = S; G.fight = null; G.save(); return true;
  };
  G.wipeSave = function () { if (G.S) G.deleteCharacter(G.S.id); G.S = null; };

  // Time away: rested XP, the server moving on, a news digest.
  G.catchUp = function () {
    const S = G.S;
    const t = now();
    const away = Math.max(0, t - S.lastSeen);
    const report = { away, rested: 0, news: [], dings: 0, online: 0 };
    if (away > 120000) {
      const P = S.player;
      const need = D.XP_TO_LEVEL[P.level] || 1;
      const hrs = away / 3600000;
      const inInn = D.PLACES[P.place] && D.PLACES[P.place].inn;
      const before = P.rested;
      if (P.level < D.LEVEL_CAP) P.rested = Math.min(need * 1.5, P.rested + need * (inInn ? 0.05 : 0.0125) * hrs);
      report.rested = Math.round(P.rested - before);
      const startLv = {};
      for (const b of S.bots) startLv[b.id] = b.level;
      report.news = B.advance(S, away);
      report.dings = S.bots.filter((b) => startLv[b.id] != null && b.level > startLv[b.id]).length;
      // regen fully
      P.hp = null; P.res = null; P.auras = (P.auras || []).filter((a) => a.until > t);
      S.world = {};
      if (S.queue) { S.queue = null; }
      if (S.run && away > 600000) {
        P.place = S.run.returnTo || 'goldshire'; S.run = null; S.group = null; delete P.syncLevel;
        sys('Your group disbanded while you were away.');
      }
      if (P.guild >= 0) {
        const mates = S.bots.filter((b) => b.guild === P.guild);
        if (mates.length) B.post(S, 'guild', pick(mates), pick(['wb!', 'welcome back', 'oh hey you are back', 'yo']));
      }
      S.news = report.news.concat(S.news).slice(0, 40);
    } else {
      S.lastSim = t;
    }
    S.lastSim = t;
    S.lastSeen = t;
    report.online = B.onlineCount(S, new Date(t));
    return report;
  };

  // ============================================================ items
  G.copyItem = (id) => JSON.parse(JSON.stringify(D.ITEMS[id]));
  G.stackable = (it) => ['junk', 'quest', 'food', 'drink'].includes(it.slot);
  G.canUseItem = function (it, cls) {
    cls = cls || G.S.player.cls;
    const C = D.CLASSES[cls];
    if (it.slot === 'weapon') return C.weapons.includes(it.wtype);
    if (it.slot === 'ranged') return !!C.ranged;
    if (it.atype) {
      if (it.atype === 'cloth') return true;
      if (it.atype === 'leather') return ['warrior', 'rogue', 'paladin', 'hunter', 'druid', 'shaman'].includes(cls);
      if (it.atype === 'mail') return cls === 'warrior' || cls === 'paladin';
    }
    return D.GEAR_SLOTS.includes(it.slot);
  };
  const W = {
    warrior: { str: 2.2, agi: 1, sta: 1.5, int: 0, spi: 0.2, armor: 0.08, sp: 0, dps: 4 },
    rogue: { str: 1, agi: 2.2, sta: 1.2, int: 0, spi: 0.2, armor: 0.06, sp: 0, dps: 4 },
    mage: { str: 0, agi: 0.1, sta: 1, int: 2, spi: 1, armor: 0.02, sp: 1.6, dps: 0.2 },
    priest: { str: 0, agi: 0.1, sta: 1, int: 1.6, spi: 1.8, armor: 0.02, sp: 1.5, dps: 0.2 },
    paladin: { str: 1.8, agi: 0.6, sta: 1.5, int: 1, spi: 0.6, armor: 0.07, sp: 0.8, dps: 3 },
    warlock: { str: 0, agi: 0.1, sta: 1.2, int: 2, spi: 1, armor: 0.02, sp: 1.7, dps: 0.2 },
    hunter: { str: 0.4, agi: 2.2, sta: 1.2, int: 0.6, spi: 0.3, armor: 0.05, sp: 0, dps: 1.5, rdps: 4 },
    druid: { str: 0.6, agi: 0.6, sta: 1.3, int: 1.6, spi: 1.6, armor: 0.06, sp: 1.4, dps: 0.6 },
    shaman: { str: 1.4, agi: 0.8, sta: 1.3, int: 1.2, spi: 0.8, armor: 0.05, sp: 1, dps: 2.5 },
  };
  G.itemScore = function (it, cls) {
    if (!it) return 0;
    const w = W[cls];
    let s = 0;
    for (const k in (it.stats || {})) s += (w[k] || 0) * it.stats[k];
    s += (it.armor || 0) * w.armor + (it.sp || 0) * w.sp;
    if (it.dmg) s += ((it.dmg[0] + it.dmg[1]) / 2 / it.speed) * (it.slot === 'ranged' ? (w.rdps || 0) : w.dps) + (it.slot === 'weapon' ? 1 : 0);
    return s;
  };
  // Which named-gear looks a character shows. Saved item copies may predate looks, so fall back to the base item.
  const BOT_WEAPON_LOOKS = { warrior: ['cruel_barb', 'smites_hammer'], paladin: ['smites_hammer', 'cruel_barb'], rogue: ['thiefs_blade', 'buzzer_blade'],
    hunter: ['cruel_barb'], mage: ['emberstone_staff', 'cookies_rod'], warlock: ['emberstone_staff'], priest: ['cookies_rod', 'cookies_tenderizer'], druid: ['emberstone_staff', 'cookies_rod'], shaman: ['smites_hammer', 'cookies_tenderizer'] };
  G.gearLooks = function (c) {
    if (!c) return null;
    const g = {};
    if (c.equip) {
      const sets = {};
      for (const slot in c.equip) {
        const it = c.equip[slot]; if (!it) continue;
        const base = D.ITEMS[it.id];
        const lk = it.look || (base && base.look);
        if (lk) g[lk[0]] = lk[1];
        const st = it.set || (base && base.set);
        if (st) sets[st] = (sets[st] || 0) + 1;
      }
      if ((sets.defias || 0) >= D.SETS.defias.mask) g.mask = 'defias';
    } else if (c.level >= 10 && c.id != null) {
      // players you pass in the world: some capped ones have farmed The Deadmines
      if (B.hash(c.id, 71) < 0.15) g.back = 'cape_brotherhood';
      const wl = BOT_WEAPON_LOOKS[c.cls];
      if (wl && B.hash(c.id, 72) < 0.12) g.weapon = wl[Math.floor(B.hash(c.id, 73) * wl.length)];
      if (c.cls === 'rogue' && B.hash(c.id, 74) < 0.1) { g.chest = 'defias_armor'; g.legs = 'defias_leggings'; g.mask = 'defias'; }
    }
    return Object.keys(g).length ? g : null;
  };

  G.isUpgrade = function (it) {
    const P = G.S.player;
    if (!D.GEAR_SLOTS.includes(it.slot) || !G.canUseItem(it)) return false;
    return G.itemScore(it, P.cls) > G.itemScore(P.equip[it.slot], P.cls) + 0.01;
  };

  G.genGear = function (slot, lvl, q, opts) {
    opts = opts || {};
    lvl = Math.max(1, lvl);
    const it = { id: 'g' + Math.floor(Math.random() * 1e9), slot, q, lvl: q <= 1 ? Math.max(1, lvl - 2) : lvl };
    const qm = [0.8, 1, 1.1, 1.22, 1.35][q];
    if (slot === 'weapon' || slot === 'ranged') {
      const wtype = slot === 'ranged' ? 'bow' : opts.wtype || pick(Object.keys(D.WEAPON_BASES).filter((k) => k !== 'bow'));
      const Wb = D.WEAPON_BASES[wtype];
      const dps = (1.6 + lvl * 0.45) * qm * (wtype === 'staff' ? 1.35 : 1);
      const sp = Wb.speed + rnd(-0.2, 0.2);
      it.wtype = wtype; it.speed = Math.round(sp * 10) / 10;
      it.dmg = [Math.max(1, Math.round(dps * it.speed * 0.7)), Math.max(2, Math.round(dps * it.speed * 1.3))];
      it.icon = Wb.icon;
      const pre = q === 0 ? pick(['Rusty', 'Cracked', 'Chipped']) : q === 1 ? pick(['Sturdy', 'Heavy', 'Plain']) : pick(['Keen', 'Polished', 'Guard\'s', 'Soldier\'s', 'Scout\'s']);
      it.name = `${pre} ${pick(Wb.names)}`;
    } else {
      const atype = slot === 'back' || slot === 'finger' ? null : (opts.atype || pick(['cloth', 'leather', 'mail']));
      if (atype) it.atype = atype;
      const Ab = atype ? D.GEAR_BASES[atype] : { mats: ['Simple', 'Fine'], grey: ['Frayed'], arm: 0.3 };
      const baseName = pick(D.SLOT_NAMES[slot]);
      const mat = q === 0 ? pick(Ab.grey) : pick(Ab.mats);
      it.name = slot === 'finger' ? `${pick(['Copper', 'Silver', 'Simple'])} ${baseName}` : `${mat} ${baseName}`;
      it.armor = slot === 'finger' ? 0 : Math.max(1, Math.round((D.SLOT_ARMOR[slot] || 3) * (atype ? Ab.arm : 0.3) * (lvl + 2) * 0.9 * qm));
      it.icon = slot === 'chest' ? 'chest_' + (atype || 'cloth') : D.SLOT_ICON[slot];
    }
    if (q >= 2) {
      const budget = Math.max(1, Math.round(lvl * (q === 2 ? 0.55 : 0.9) + (q === 3 ? 2 : 1)));
      const af = opts.affix || pick(D.AFFIXES);
      const keys = Object.keys(af.stats);
      it.stats = {};
      let left = budget;
      keys.forEach((k, i) => { const v = i === keys.length - 1 ? left : Math.max(1, Math.round(budget / keys.length)); it.stats[k] = v; left -= v; });
      if (it.stats[keys[keys.length - 1]] <= 0) it.stats[keys[keys.length - 1]] = 1;
      it.name += ' ' + af.name;
    }
    it.sell = Math.max(1, Math.round((lvl * lvl * 0.9 + 4) * [0.5, 1, 3, 7, 12][q]));
    return it;
  };

  G.addItem = function (it, n) {
    const P = G.S.player;
    n = n || 1;
    if (G.stackable(it)) {
      const st = P.bags.find((b) => b.item.id === it.id && b.n < 20);
      if (st) { st.n += n; return true; }
    }
    if (P.bags.length >= 16) { toast('Inventory is full.'); return false; }
    P.bags.push({ item: it, n });
    return true;
  };
  G.countItem = function (id) { let n = 0; for (const b of G.S.player.bags) if (b.item.id === id) n += b.n; return n; };
  G.removeItem = function (id, n) {
    const P = G.S.player;
    for (let i = P.bags.length - 1; i >= 0 && n > 0; i--) {
      const b = P.bags[i];
      if (b.item.id !== id) continue;
      const take = Math.min(b.n, n); b.n -= take; n -= take;
      if (b.n <= 0) P.bags.splice(i, 1);
    }
  };
  G.money = function (c) {
    c = Math.max(0, Math.round(c));
    const g = Math.floor(c / 10000), s = Math.floor((c % 10000) / 100), cp = c % 100;
    return { g, s, c: cp };
  };
  G.moneyText = function (c) {
    const m = G.money(c);
    return [m.g ? m.g + 'g' : '', m.s ? m.s + 's' : '', (m.c || (!m.g && !m.s)) ? m.c + 'c' : ''].filter(Boolean).join(' ');
  };

  G.equip = function (idx) {
    const P = G.S.player;
    const b = P.bags[idx];
    if (!b) return;
    const it = b.item;
    if (!D.GEAR_SLOTS.includes(it.slot)) return;
    if (!G.canUseItem(it)) return toast(`You can't use ${it.name}.`);
    if ((it.lvl || 1) > P.level) return toast(`Requires level ${it.lvl}.`);
    if (G.fight) return toast('You are in combat.');
    const old = P.equip[it.slot];
    P.equip[it.slot] = it;
    P.bags.splice(idx, 1);
    if (old) P.bags.push({ item: old, n: 1 });
    clampVitals();
    emit('change');
  };
  G.unequip = function (slot) {
    const P = G.S.player;
    if (G.fight) return toast('You are in combat.');
    if (!P.equip[slot]) return;
    if (P.bags.length >= 16) return toast('Inventory is full.');
    P.bags.push({ item: P.equip[slot], n: 1 }); delete P.equip[slot];
    clampVitals(); emit('change');
  };
  G.sell = function (idx) {
    const P = G.S.player;
    const b = P.bags[idx];
    if (!b || b.item.noSell || b.item.slot === 'quest') return;
    const v = (b.item.sell || 1) * b.n;
    P.money += v; P.bags.splice(idx, 1);
    sys(`Sold ${b.item.name}${b.n > 1 ? ' x' + b.n : ''} for ${G.moneyText(v)}.`);
    emit('change');
  };
  G.sellJunk = function () {
    const P = G.S.player;
    let v = 0;
    P.bags = P.bags.filter((b) => { if (b.item.q === 0 && !b.item.noSell) { v += (b.item.sell || 1) * b.n; return false; } return true; });
    if (v) { P.money += v; sys(`Sold junk for ${G.moneyText(v)}.`); }
    emit('change');
    return v;
  };
  G.vendorStock = function (npc) {
    if (npc === 'danil') return ['tough_bread', 'spring_water'].map(G.copyItem);
    if (npc === 'farley') return ['tough_bread', 'fresh_bread', 'spring_water', 'ice_milk'].map(G.copyItem);
    if (npc === 'adlin') return ['tough_bread', 'spring_water'].map(G.copyItem);
    if (npc === 'belm' || npc === 'firebrew') return ['tough_bread', 'fresh_bread', 'spring_water', 'thunder_ale'].map(G.copyItem);
    if (npc === 'nyoma' || npc === 'duokna') return ['tough_bread', 'spring_water'].map(G.copyItem);
    if (npc === 'grosk' || npc === 'gryshka') return ['tough_bread', 'horde_bread', 'spring_water', 'ice_milk'].map(G.copyItem);
    if (npc === 'moodan' || npc === 'kien') return ['tough_bread', 'spring_water'].map(G.copyItem);
    if (npc === 'kauth' || npc === 'pala') return ['tough_bread', 'mulgore_bread', 'spring_water', 'ice_milk'].map(G.copyItem);
    if (npc === 'heather' || npc === 'boorand') return ['fresh_bread', 'moist_cornbread', 'mutton_chop', 'ice_milk', 'melon_juice', 'sweet_nectar'].map(G.copyItem);
    if (npc === 'renee' || npc === 'norman') return ['tough_bread', 'tirisfal_pumpkin', 'spring_water', 'ice_milk'].map(G.copyItem);
    if (npc === 'keldamyr' || npc === 'saelienne') return ['tough_bread', 'fresh_bread', 'spring_water', 'moonberry_juice'].map(G.copyItem);
    if (npc === 'corina' || npc === 'grawn' || npc === 'bruuk' || npc === 'ilyenia' || npc === 'mydrannul' || npc === 'kaplak' || npc === 'rahauro' || npc === 'mahnott' || npc === 'etu' || npc === 'gerard' || npc === 'abigail' || npc === 'lewis' || npc === 'nargal') {
      if (!G.S.flags.corina || G.S.flags.corinaLvl !== G.S.player.level) {
        const L = G.S.player.level;
        G.S.flags.corina = Object.keys(D.WEAPON_BASES).map((w) => { const it = G.genGear('weapon', Math.max(2, L), 1, { wtype: w }); it.cost = it.sell * 5; return it; });
        G.S.flags.corinaLvl = L;
      }
      return G.S.flags.corina;
    }
    return [];
  };
  G.buy = function (it, n) {
    const P = G.S.player;
    n = n || 1;
    const cost = (it.cost || it.sell * 4) * n;
    if (P.money < cost) return toast('You don\'t have enough money.');
    const copy = JSON.parse(JSON.stringify(it));
    if (!G.addItem(copy, n)) return;
    P.money -= cost;
    sys(`Bought ${it.name}${n > 1 ? ' x' + n : ''} for ${G.moneyText(cost)}.`);
    emit('change');
  };

  // ============================================================ character
  G.charOf = function () {
    const P = G.S.player;
    return P; // the player object doubles as the engine's char
  };
  G.stats = function () { return E.statsFor(G.S.player, auraStats(G.S.player)); };
  function auraStats(P) {
    const x = {}; const t = now();
    for (const a of (P.auras || [])) if (a.until > t && a.stats) for (const k in a.stats) x[k] = (x[k] || 0) + a.stats[k];
    return x;
  }
  G.vitals = function () {
    const P = G.S.player;
    if (G.fight && G.pUnit) return { hp: G.pUnit.hp, maxHp: G.pUnit.maxHp, res: G.pUnit.res, maxRes: G.pUnit.maxRes, resType: G.pUnit.resType };
    const st = G.stats();
    const C = D.CLASSES[P.cls];
    const maxRes = C.resource === 'mana' ? st.maxMana : 100;
    if (P.hp == null) P.hp = st.maxHp;
    if (P.res == null) P.res = C.resource === 'rage' ? 0 : maxRes;
    return { hp: P.hp, maxHp: st.maxHp, res: P.res, maxRes, resType: C.resource };
  };
  function clampVitals() {
    const v = G.vitals(); const P = G.S.player;
    P.hp = clamp(P.hp, 0, v.maxHp); P.res = clamp(P.res, 0, v.maxRes);
  }
  G.racial = function () { const R = D.RACIALS[G.S.player.race || 'human']; return R ? R.active : null; };
  const racialPassive = (k) => ((D.RACIALS[G.S.player.race || 'human'] || {}).passives || {})[k] || 0;
  G.knownAbilities = function () {
    const P = G.S.player;
    const C = D.CLASSES[P.cls];
    if (G.fight && G.pUnit && G.pUnit.form && C.forms) return C.forms[G.pUnit.form].filter((a) => D.ABILITIES[a].lvl <= P.level);
    return C.abilities.filter((a) => D.ABILITIES[a].lvl <= P.level);
  };

  G.xpForKill = function (mobLvl, elite) {
    const P = G.S.player;
    if (P.level >= D.LEVEL_CAP) return 0;
    const base = mobLvl * 5 + 45;
    const diff = mobLvl - P.level;
    let xp;
    if (diff >= 0) xp = base * (1 + 0.05 * Math.min(diff, 4));
    else { const zd = 5; xp = diff <= -zd ? 0 : base * (1 + diff / zd); }
    return Math.round(xp * (elite ? 2 : 1));
  };
  G.gainXp = function (amount, fromKill) {
    const P = G.S.player;
    if (P.level >= D.LEVEL_CAP || amount <= 0) return 0;
    let bonus = 0;
    if (fromKill && P.rested > 0) { bonus = Math.min(amount, Math.round(P.rested)); P.rested -= bonus; }
    amount = Math.round(amount * G.warBonus());
    const total = amount + bonus;
    P.xp += total;
    B.post(G.S, 'combat', null, bonus ? `You gain ${total} experience. (+${bonus} exp Rested bonus)` : `You gain ${total} experience.`);
    while (P.level < D.LEVEL_CAP && P.xp >= D.XP_TO_LEVEL[P.level]) {
      P.xp -= D.XP_TO_LEVEL[P.level];
      P.level++;
      levelUp();
    }
    if (P.level >= D.LEVEL_CAP) { P.xp = 0; P.rested = 0; }
    emit('xp', { amount: total, bonus });
    return total;
  };
  function levelUp() {
    const P = G.S.player;
    P.hp = null; P.res = D.CLASSES[P.cls].resource === 'rage' ? 0 : null;
    if (G.fight && G.pUnit) { G.pUnit.level = P.level; E.recalc(G.pUnit); G.pUnit.hp = G.pUnit.maxHp; if (G.pUnit.resType === 'mana') G.pUnit.res = G.pUnit.maxRes; }
    sys(`Congratulations, you have reached level ${P.level}!`);
    const learned = D.CLASSES[P.cls].abilities.filter((a) => D.ABILITIES[a].lvl === P.level);
    for (const a of learned) sys(`You have learned a new ability: ${D.ABILITIES[a].name}.`);
    emit('levelup', { level: P.level, learned });
    // the server notices
    const S = G.S;
    const date = new Date();
    const near = B.onlineIn(S, P.place, date);
    S.pending = S.pending || [];
    const gz = () => pick(['gz', 'grats', 'gratz', 'gz!', 'nice', 'congrats']);
    if (P.guild >= 0) {
      const mates = S.bots.filter((b) => b.guild === P.guild && B.isOnline(b, date)).slice(0, 3);
      mates.forEach((b, i) => S.pending.push({ at: now() + 1500 + i * 1800 + Math.random() * 2000, bot: b.id, ch: 'guild', text: gz() }));
    }
    if (near.length && Math.random() < 0.5) S.pending.push({ at: now() + 2500, bot: pick(near).id, ch: 'say', text: gz() });
    if (P.level === 5 && P.guild < 0 && !S.flags.guildOffer) S.flags.guildOfferAt = now() + 90000;
  }

  // ============================================================ world
  function placeState(id) {
    const S = G.S;
    let W = S.world[id];
    const P = D.PLACES[id];
    if (!W) {
      W = S.world[id] = { mobs: [], named: {}, nodes: { n: 4, next: 0 } };
      // spread spawn points by weight so every creature type has at least one
      const tot = P.mobs.reduce((x, m) => x + m[1], 0);
      const plan = [];
      for (const [key, wgt] of P.mobs) for (let i = 0; i < Math.max(1, Math.round(P.pool * wgt / tot)); i++) plan.push(key);
      while (plan.length > Math.max(P.pool, P.mobs.length)) { const counts = {}; plan.forEach((k) => counts[k] = (counts[k] || 0) + 1); const big = Object.keys(counts).sort((x, y) => counts[y] - counts[x])[0]; plan.splice(plan.lastIndexOf(big), 1); }
      for (const key of plan) W.mobs.push(spawnMob(P, key));
      for (const k in (P.named || {})) W.named[k] = { state: 'alive', until: 0, id: 'n_' + k, key: k, level: D.MOBS[k].lvl[0] };
    }
    return W;
  }
  let MOBID = 1;
  // A spawn point always brings back the same creature, like Classic.
  function spawnMob(P, keep) {
    const tot = P.mobs.reduce((a, m) => a + m[1], 0);
    let r = Math.random() * tot, key = keep || P.mobs[0][0];
    if (!keep) for (const m of P.mobs) { r -= m[1]; if (r <= 0) { key = m[0]; break; } }
    const M = D.MOBS[key];
    return { id: 'm' + (MOBID++) + '_' + Math.floor(Math.random() * 1e6), key, level: rint(M.lvl[0], M.lvl[1]), state: 'alive', until: 0, by: null };
  }
  G.placeMobs = function () {
    const P = D.PLACES[G.S.player.place];
    if (!P || !P.pool && !P.named) return [];
    const W = placeState(G.S.player.place);
    const list = W.mobs.slice();
    for (const k in W.named) list.unshift(W.named[k]);
    return list;
  };

  function worldTick() {
    const S = G.S, t = now();
    const id = S.player.place;
    const P = D.PLACES[id];
    if (!P) return;
    const W = placeState(id);
    const near = B.onlineIn(S, id, new Date(t));
    const n = Math.min(5, near.length);
    const all = W.mobs.concat(Object.values(W.named));
    for (const m of all) {
      if (m.state === 'fight') continue;
      if (m.state === 'tapped' && t >= m.until) { m.state = 'dead'; m.until = t + (m.id.startsWith('n_') ? D.PLACES[id].named[m.key] * 1000 : rnd(15, 28) * 1000); }
      else if (m.state === 'dead' && t >= m.until) {
        if (m.id.startsWith('n_')) { m.state = 'alive'; m.level = D.MOBS[m.key].lvl[0]; }
        else Object.assign(m, spawnMob(P, m.key));
      } else if (m.state === 'alive' && n > 0) {
        const pTap = m.id.startsWith('n_') ? n / 400 : n / (110 * Math.max(4, P.pool));
        if (Math.random() < pTap) {
          const b = pick(near);
          m.state = 'tapped'; m.by = b.name; m.byCls = b.cls; m.until = t + rnd(6, 14) * 1000;
          if (m.id.startsWith('n_') && Math.random() < 0.6) B.post(S, 'say', b, pick([`got ${D.MOBS[m.key].name}!`, `${D.MOBS[m.key].name} is mine sry`, 'finally']));
        }
      }
    }
    // if a quest needs a creature and none are up, hurry the next one along
    for (const key of questKeys()) {
      const mine = W.mobs.filter((m) => m.key === key);
      if (!mine.length || mine.some((m) => m.state === 'alive')) continue;
      const next = mine.filter((m) => m.state === 'dead').sort((a, b) => a.until - b.until)[0];
      if (next && next.until - t > 6000) next.until = t + 6000;
    }
    // gather nodes
    if (P.gather && W.nodes.n < 4 && t >= W.nodes.next) { W.nodes.n++; W.nodes.next = t + 20000; }
    // guild offer
    if (S.flags.guildOfferAt && t >= S.flags.guildOfferAt && !S.flags.guildOffer) {
      S.flags.guildOffer = true;
      const myF = (D.RACES[S.player.race] || {}).faction || 'alliance';
      const opts = B.GUILDS.map((x, i) => i).filter((i) => B.GUILD_FACTION[i] === myF);
      const g = opts[rint(0, opts.length - 1)];
      const inviter = S.bots.find((b) => b.guild === g) || pick(S.bots);
      B.post(S, 'whisper', inviter, pick(['hey, want to join our guild? chill ppl, we run dungeons', 'we are recruiting, want an invite?']));
      emit('invite', { guild: g, guildName: B.GUILDS[g], from: inviter.name });
    }
  }
  function questKeys() {
    const P = G.S.player, out = new Set();
    for (const qid in P.quests) {
      if (G.questComplete(qid)) continue;
      for (const o of D.QUESTS[qid].objs) {
        if (o.type === 'kill') out.add(o.mob);
        if (o.type === 'collect') for (const k in D.MOBS) if ((D.MOBS[k].qdrops || []).some((d) => d[0] === o.item)) out.add(k);
      }
    }
    return out;
  }
  G.joinGuild = function (g) {
    const S = G.S;
    S.player.guild = g;
    sys(`You have joined ${B.GUILDS[g]}.`);
    const mates = S.bots.filter((b) => b.guild === g && B.isOnline(b, new Date()));
    mates.slice(0, 3).forEach((b, i) => S.pending.push({ at: now() + 1200 + i * 2200, bot: b.id, ch: 'guild', text: pick(['welcome!', 'welcome :)', 'hi!', 'o/', 'welcome to the guild']) }));
  };

  // ============================================================ travel / hearth / gather / rest
  G.travelTo = function (dest) {
    const S = G.S, P = S.player;
    if (G.fight || S.run) return toast('You can\'t travel right now.');
    if (P.ghostUntil) return;
    const from = D.PLACES[P.place];
    const secs = from.links[dest];
    if (!secs) return;
    P.travel = { to: dest, from: P.place, start: now(), end: now() + secs * 1000 };
    stopActions();
    emit('change');
  };
  G.hearth = function () {
    const P = G.S.player;
    if (G.fight || G.S.run) return toast('You can\'t do that now.');
    const left = (P.hearthAt || 0) - now();
    if (left > 0) return toast(`Hearthstone is on cooldown (${Math.ceil(left / 60000)} min).`);
    stopActions();
    P.casting = { what: 'hearth', label: 'Hearthstone', start: now(), end: now() + 10000 };
    emit('change');
  };
  G.gather = function () {
    const S = G.S, P = S.player;
    const pl = D.PLACES[P.place];
    if (!pl.gather || G.fight) return;
    const W = placeState(P.place);
    if (W.nodes.n <= 0) return toast('Nothing left to pick up. Wait for more to appear.');
    stopActions();
    P.casting = { what: 'gather', label: `Collecting ${pl.gather.label}`, start: now(), end: now() + 3000 };
    emit('change');
  };
  function stopActions() { const P = G.S.player; P.eating = null; P.drinking = null; P.casting = null; }
  G.consume = function (kind) {
    const S = G.S, P = S.player;
    if (G.fight) return toast('You can\'t do that while in combat.');
    const b = P.bags.filter((x) => x.item.slot === kind && (x.item.lvl || 1) <= P.level).sort((a, c) => c.item.restore - a.item.restore)[0];
    if (!b) return toast(kind === 'food' ? 'You have no food. Buy some from a vendor.' : 'You have nothing to drink. Buy some from a vendor.');
    const it = b.item;
    G.removeItem(it.id, 1);
    P.casting = null;
    P[kind === 'food' ? 'eating' : 'drinking'] = { until: now() + 18000, per: it.restore / 18, name: it.name };
    emit('change');
  };
  G.bindHere = function () {
    const P = G.S.player;
    P.bind = P.place;
    sys(`${D.PLACES[P.place].name} is now your home.`);
  };

  function restTick(dt) {
    const S = G.S, P = S.player, t = now();
    const v = G.vitals();
    const st = G.stats();
    // travel
    if (P.travel && t >= P.travel.end) {
      P.place = P.travel.to; P.travel = null;
      arrive();
    }
    if (P.casting && t >= P.casting.end) {
      const c = P.casting; P.casting = null;
      if (c.what === 'hearth') { P.place = P.bind; P.hearthAt = t + 15 * 60000; arrive(); }
      if (c.what === 'summon' && c.pet === 'beast') { P.pet.hp = null; sys(`${P.pet.name} is back on its feet.`); }
      else if (c.what === 'summon') { P.pet = { type: c.pet, name: pick(D.PETS[c.pet].names), hp: null }; sys(`${P.pet.name} the ${D.PETS[c.pet].name} answers your call.`); }
      if (c.what === 'tame') {
        const W = placeState(P.place); const m = W.mobs.find((x) => x.id === c.mobId);
        if (m) { m.state = 'dead'; m.until = t + rnd(15, 28) * 1000; }
        P.pet = { type: 'beast', mob: c.mob, name: D.MOBS[c.mob].name, hp: null };
        sys(`You have tamed a ${D.MOBS[c.mob].name}. It fights at your side now.`);
      }
      if (c.what === 'gather') {
        const W = placeState(P.place); const pl = D.PLACES[P.place];
        if (W.nodes.n > 0) {
          W.nodes.n--; W.nodes.next = Math.max(W.nodes.next, t + 20000);
          if (P.quests[pl.gather.quest]) { G.addItem(G.copyItem(pl.gather.item), 1); loot(`You receive item: ${B.link(D.ITEMS[pl.gather.item].name)}.`); questCheck(); }
          else sys('You don\'t need this right now.');
        }
      }
      emit('change');
    }
    if (P.ghostUntil) {
      if (t >= P.ghostUntil) { P.ghostUntil = 0; P.hp = Math.round(v.maxHp * 0.5); P.res = v.resType === 'mana' ? Math.round(v.maxRes * 0.5) : 0; sys('You return to life.'); emit('change'); }
      return;
    }
    // regen out of combat
    const hpRegen = (P.eating ? P.eating.per : 0) + (st.spi * 0.12 + P.level * 0.25) * (racialPassive('regen') ? 1.1 : 1);
    P.hp = Math.min(v.maxHp, P.hp + hpRegen * dt);
    if (v.resType === 'mana') P.res = Math.min(v.maxRes, P.res + ((P.drinking ? P.drinking.per : 0) + (13 + st.spi / 4) / 2) * dt);
    else if (v.resType === 'rage') P.res = Math.max(0, P.res - 2 * dt);
    else P.res = 100;
    if (P.pet && P.pet.hp) { const pmax = Math.round(E.mobHp(P.level) * D.PETS[P.pet.type].hpMult); P.pet.hp = Math.min(pmax, P.pet.hp + pmax * 0.04 * dt); }
    if (P.eating && (t >= P.eating.until || P.hp >= v.maxHp)) P.eating = null;
    if (P.drinking && (t >= P.drinking.until || P.res >= v.maxRes)) P.drinking = null;
    // rested accrues online in an inn
    if (D.PLACES[P.place] && D.PLACES[P.place].inn && P.level < D.LEVEL_CAP) {
      const need = D.XP_TO_LEVEL[P.level];
      P.rested = Math.min(need * 1.5, P.rested + need * 0.05 * (dt / 3600));
    }
    P.auras = (P.auras || []).filter((a) => a.until > t);
  }

  function arrive() {
    const P = G.S.player;
    const first = !P.visited[P.place];
    P.visited[P.place] = true;
    const pl = D.PLACES[P.place];
    if (first) sys(`Discovered: ${pl.name}`);
    emit('arrive', { place: P.place, first });
    questCheck();
  }

  // ============================================================ quests
  G.questState = function (qid) {
    const P = G.S.player;
    if (P.done[qid]) return 'done';
    if (P.quests[qid]) return G.questComplete(qid) ? 'complete' : 'active';
    const Q = D.QUESTS[qid];
    if ((Q.pre || []).some((p) => !P.done[p])) return 'locked';
    if (P.level < Q.lvl - 2) return 'low';
    return 'available';
  };
  G.questProgress = function (qid) {
    const P = G.S.player, Q = D.QUESTS[qid], q = P.quests[qid];
    return Q.objs.map((o, i) => {
      if (o.type === 'collect') return { o, have: Math.min(o.n, G.countItem(o.item)), n: o.n, label: D.ITEMS[o.item].name };
      if (o.type === 'kill') return { o, have: Math.min(o.n, q ? q.prog[i] || 0 : 0), n: o.n, label: D.MOBS[o.mob].name + ' slain' };
      return { o, have: q && q.prog[i] ? 1 : 0, n: 1, label: 'Go to ' + D.PLACES[o.place].name };
    });
  };
  G.questComplete = function (qid) { return G.questProgress(qid).every((p) => p.have >= p.n); };
  G.npcQuests = function (npc) {
    const out = [];
    for (const qid in D.QUESTS) {
      const Q = D.QUESTS[qid], st = G.questState(qid);
      if (Q.giver === npc && st === 'available') out.push({ qid, st });
      if (Q.turnin === npc && st === 'complete') out.push({ qid, st });
      else if (Q.giver === npc && st === 'active') out.push({ qid, st });
    }
    return out;
  };
  G.npcMarker = function (npc) {
    const qs = G.npcQuests(npc);
    if (qs.some((q) => q.st === 'complete')) return '?';
    if (qs.some((q) => q.st === 'available')) return '!';
    if (qs.some((q) => q.st === 'active')) return '…';
    return '';
  };
  G.accept = function (qid) {
    const P = G.S.player;
    if (Object.keys(P.quests).length >= 20) return toast('Your quest log is full.');
    P.quests[qid] = { prog: D.QUESTS[qid].objs.map(() => 0), at: now() };
    sys(`Quest accepted: ${D.QUESTS[qid].name}`);
    emit('questAccept', { qid });
    questCheck();
    emit('change');
  };
  G.abandon = function (qid) { delete G.S.player.quests[qid]; sys(`${D.QUESTS[qid].name} abandoned.`); emit('change'); };
  G.questXp = (L) => Math.round(L <= 5 ? 60 * L + 20 : (90 * L - 100) * 1.25); // v1.9.1: +25% from 6 so quests carry levelling, not grinding
  G.questMoney = (L) => Math.round(L * 30 + (L > 5 ? L * 25 : 0));
  G.rewardItem = function (qid) {
    const Q = D.QUESTS[qid];
    if (!Q.reward.choice) return null;
    const fam = D.REWARD_FAMILIES[Q.reward.choice[0]];
    const P = G.S.player, C = D.CLASSES[P.cls];
    if (fam.fixed) return G.copyItem(fam.fixed[P.cls]);
    // deterministic per quest so the preview matches what you get
    const key = 'rw_' + qid;
    if (!G.S.flags[key]) {
      const opts = fam.slot === 'weapon' ? { wtype: C.weapons[0] } : { atype: C.armorType };
      const aff = fam.q >= 2 ? { affix: D.AFFIXES.find((a) => a.name === ({ warrior: 'of the Bear', rogue: 'of the Monkey', mage: 'of the Owl', priest: 'of the Whale', paladin: 'of the Bear', warlock: 'of the Eagle', hunter: 'of the Monkey', druid: 'of the Owl', shaman: 'of the Tiger' })[P.cls]) } : {};
      G.S.flags[key] = G.genGear(fam.slot, fam.lvl, fam.q, Object.assign(opts, aff));
    }
    return G.S.flags[key];
  };
  G.turnIn = function (qid) {
    const P = G.S.player, Q = D.QUESTS[qid];
    if (!G.questComplete(qid)) return;
    const it = G.rewardItem(qid);
    if (it && P.bags.length >= 16) return toast('Inventory is full.');
    for (const o of Q.objs) if (o.type === 'collect') G.removeItem(o.item, o.n);
    delete P.quests[qid]; P.done[qid] = true;
    sys(`${Q.name} completed.`);
    const m = Math.round(((Q.reward.money || 0) + G.questMoney(Q.lvl)) * (1 + racialPassive('questMoneyPct') / 100) * G.warBonus());
    P.money += m;
    sys(`Received ${G.moneyText(m)}.`);
    if (it) { G.addItem(JSON.parse(JSON.stringify(it)), 1); loot(`You receive item: ${B.link(it.name, it.q)}.`); }
    G.gainXp(G.questXp(Q.lvl), false);
    emit('questDone', { qid });
    emit('change');
  };
  function questCheck() {
    const P = G.S.player;
    for (const qid in P.quests) {
      const Q = D.QUESTS[qid];
      Q.objs.forEach((o, i) => { if (o.type === 'visit' && P.place === o.place && !P.quests[qid].prog[i]) { P.quests[qid].prog[i] = 1; sys(`${D.PLACES[o.place].name} explored.`); } });
      const done = G.questComplete(qid);
      if (done && !P.quests[qid].told) { P.quests[qid].told = true; sys(`${Q.name} (Complete)`); emit('questReady', { qid }); }
    }
  }
  G.questCheck = questCheck;
  function neededQuestItem(itemId) {
    const P = G.S.player;
    for (const qid in P.quests) for (const o of D.QUESTS[qid].objs) if (o.type === 'collect' && o.item === itemId && G.countItem(itemId) < o.n) return true;
    return false;
  }
  function onKill(mobKey) {
    const P = G.S.player;
    P.kills++;
    for (const qid in P.quests) D.QUESTS[qid].objs.forEach((o, i) => {
      if (o.type === 'kill' && o.mob === mobKey && (P.quests[qid].prog[i] || 0) < o.n) {
        P.quests[qid].prog[i] = (P.quests[qid].prog[i] || 0) + 1;
        sys(`${D.MOBS[mobKey].name} slain: ${P.quests[qid].prog[i]}/${o.n}`);
      }
    });
    questCheck();
  }

  // Loot for one kill. Returns list of {item,n} and copper.
  function rollLoot(mobKey, level, share) {
    const M = D.MOBS[mobKey];
    const out = { items: [], money: 0 };
    if (M.family !== 'beast' && Math.random() < 0.75) out.money = Math.round(level * rnd(2.5, 7) * (M.named ? 4 : 1) * (share || 1));
    for (const [id, p] of (M.drops || [])) if (Math.random() < p) out.items.push(G.copyItem(id));
    for (const [id, p] of (M.qdrops || [])) if (neededQuestItem(id) && Math.random() < p) out.items.push(G.copyItem(id));
    if (!M.boss) {
      const r = Math.random();
      const q = r < 0.012 ? 3 : r < 0.05 ? 2 : r < 0.1 ? 1 : r < 0.2 ? 0 : -1;
      if (q >= 0) out.items.push(G.genGear(pick(D.GEAR_SLOTS), level, q));
    }
    return out;
  }
  function giveLoot(l) {
    const P = G.S.player;
    if (l.money) { l.money = Math.round(l.money * (1 + racialPassive('lootMoneyPct') / 100) * G.warBonus()); P.money += l.money; loot(`You loot ${G.moneyText(l.money)}.`); }
    let got = 0;
    for (const it of l.items) if (G.addItem(it, 1)) { got++; loot(`You receive loot: ${B.link(it.name, it.q)}.`); }
    if (l.money || got) emit('lootGain', { money: l.money, items: got });
    questCheck();
  }

  // ============================================================ warlock demons
  G.petUnitFor = function (pu) {
    const P = G.S.player;
    if (!P.pet || P.pet.hp === 0) return null;
    const u = E.petUnit(P.pet.type, P.level, { uid: pu.uid, petName: P.pet.name, mob: P.pet.mob });
    if (P.pet.hp != null) u.hp = clamp(P.pet.hp, 1, u.maxHp);
    return u;
  };
  function petWriteBack(C) {
    const P = G.S.player;
    const u = C && C.allies.find((a) => a.kind === 'pet');
    if (!u || !P.pet) return;
    if (u.dead) { P.pet.hp = 0; sys(`Your ${D.PETS[P.pet.type].name} has died.`); }
    else P.pet.hp = Math.round(u.hp);
  }
  G.canSummon = function (type) {
    const P = G.S.player, C = D.CLASSES[P.cls];
    if (type === 'beast') return P.cls === 'hunter' && !!P.pet && P.pet.type === 'beast';   // revive; taming is G.tame
    return !!(C.pets && C.pets.includes(type) && P.level >= D.PETS[type].lvl);
  };
  G.tamable = function (m) {
    const P = G.S.player, M = D.MOBS[m.key];
    return P.cls === 'hunter' && P.level >= D.PETS.beast.lvl && M.family === 'beast' && !M.named && !M.elite && m.level <= P.level && m.state === 'alive';
  };
  G.tame = function (mobId) {
    const P = G.S.player;
    const m = G.placeMobs().find((x) => x.id === mobId);
    if (!m || !G.tamable(m)) return toast('You can\'t tame that.');
    if (G.fight || P.travel || P.ghostUntil) return toast('You can\'t do that now.');
    stopActions();
    m.state = 'fight';
    P.casting = { what: 'tame', mob: m.key, mobId: m.id, label: 'Taming ' + D.MOBS[m.key].name, start: now(), end: now() + 6000 };
    emit('change');
  };
  G.summon = function (type) {
    const P = G.S.player;
    if (!G.canSummon(type)) return toast('You can\'t summon that yet.');
    if (G.fight || P.travel || P.ghostUntil) return toast('You can\'t do that now.');
    const v = G.vitals();
    const cost = Math.round(v.maxRes * D.PETS[type].cost);
    if (v.res < cost) return toast('Not enough mana');
    P.res -= cost;
    stopActions();
    P.casting = { what: 'summon', pet: type, label: 'Summon ' + D.PETS[type].name, start: now(), end: now() + 6000 };
    emit('change');
  };

  // ============================================================ solo combat
  G.engage = function (mobId, useAbility) {
    const S = G.S, P = S.player;
    if (G.fight || P.travel || P.ghostUntil || S.run) return;
    const list = G.placeMobs();
    const m = list.find((x) => x.id === mobId);
    if (!m) return;
    if (m.state === 'tapped') return toast(`Tapped by ${m.by}. You won't get anything from it.`);
    if (m.state !== 'alive') return;
    stopActions();
    m.state = 'fight';
    const pu = E.charUnit(P, 'ally', 'player', now());
    const mu = E.mobUnit(m.key, m.level);
    mu.inst = m;
    G.pUnit = pu;
    const pet = G.petUnitFor(pu);
    const allies = pet ? [pu, pet] : [pu];
    for (const m of ((S.wparty && S.wparty.members) || [])) { const u = E.charUnit(m, 'ally', 'bot', now()); u.bot = { skill: m.bot.skill, react: 0.9 - 0.6 * m.bot.skill }; u.memberRef = m; allies.push(u); }
    G.fight = E.fight(allies, [mu], { soloUid: pu.uid });
    G.fight.kind = 'solo';
    G.fight.addAt = null;
    // a party pulls more: each extra member usually brings another nearby creature into it
    const extra = [];
    for (let i = 1; i < G.partySize(); i++) if (Math.random() < EXTRA_PULL) { const o = G.placeMobs().find((x) => x.state === 'alive' && x !== m && !extra.includes(x) && !x.id.startsWith('n_')); if (o) extra.push(o); }
    for (const o of extra) { o.state = 'fight'; const ou = E.mobUnit(o.key, o.level); ou.inst = o; E.addEnemy(G.fight, ou); }
    // social pull: humanoids and murlocs sometimes bring a friend
    const M = D.MOBS[m.key];
    if (!M.named && (M.family === 'humanoid' || M.family === 'murloc') && Math.random() < 0.14) {
      const friend = G.placeMobs().find((x) => x.state === 'alive' && x.key === m.key && x !== m);
      if (friend) { friend.state = 'fight'; G.fight.addAt = { t: rnd(2, 5), inst: friend }; }
    }
    emit('fightStart', { fight: G.fight });
    if (useAbility) G.useAbility(useAbility);
    return G.fight;
  };

  G.useAbility = function (abId) {
    const C = G.fight;
    if (!C || !G.pUnit) return 'Not in combat';
    const ab = D.ABILITIES[abId];
    let tgt = G.pUnit.target;
    if (ab.target === 'ally') tgt = C.allyTarget != null && C.units[C.allyTarget] && !C.units[C.allyTarget].dead ? C.allyTarget : G.pUnit.uid;
    const why = E.use(C, G.pUnit, abId, tgt);
    if (why) emit('error', why);
    return why;
  };
  G.setTarget = function (uid) { if (G.fight && G.pUnit) { const u = G.fight.units[uid]; if (u && !u.dead) { if (u.side === 'enemy') G.pUnit.target = uid; else G.fight.allyTarget = uid; emit('target'); } } };
  G.toggleAuto = function () { if (G.pUnit) G.pUnit.auto = !G.pUnit.auto; };
  G.flee = function () {
    const C = G.fight;
    if (!C || (C.kind !== 'solo' && C.kind !== 'pvp')) return;
    if (Math.random() < (C.kind === 'pvp' ? 0.45 : 0.6)) {
      if (C.kind === 'pvp') { const f = G.S.flags; G.S.player.pvp = G.pvpStats(); G.S.player.pvp.escapes++; f.nextAmbush = now() + AMBUSH_GAP; }
      for (const e of C.enemies) { if (e.inst) { e.inst.state = 'alive'; } }
      E.writeBack(C, G.pUnit, now());
      petWriteBack(C);
      G.fight = null; G.pUnit = null;
      sys('You escaped.');
      emit('fightEnd', { result: 'flee' });
    } else {
      sys('You failed to escape!');
      for (const e of E.alive(C.enemies)) e.swingT = 0;
    }
  };
  // Buffs out of combat (Battle Shout, Fortitude, Frost Armor) just apply.
  G.castOutOfCombat = function (abId) {
    const P = G.S.player, ab = D.ABILITIES[abId];
    if (G.fight) return G.useAbility(abId);
    if (ab.combatOnly) return 'Use it in combat';
    if (ab.lifetap) {
      const amt = Math.round(ab.lifetap.base + ab.lifetap.perLvl * P.level);
      const v0 = G.vitals();
      if (P.hp <= amt + 1) return 'Not enough health';
      P.hp -= amt; P.res = Math.min(v0.maxRes, P.res + amt);
      emit('change');
      return null;
    }
    if (!ab.buff && !ab.heal && !ab.hot && !ab.shield) return 'Needs a target';
    const v = G.vitals();
    const cost = E.abCost(ab, P);
    if (cost > v.res) return v.resType === 'rage' ? 'Not enough rage' : 'Not enough mana';
    P.res -= cost;
    if (ab.buff) {
      const stats = {};
      for (const k in (ab.buff.stats || {})) stats[k] = Math.round((ab.buff.stats[k] + ((ab.buff.perLvl && ab.buff.perLvl[k]) || 0) * P.level) * 10) / 10;
      P.auras = (P.auras || []).filter((a) => a.id !== ab.buff.id);
      const extra = {};
      if (ab.buff.seal) { const w = (P.equip.weapon && P.equip.weapon.speed) || 2; extra.seal = (ab.buff.seal.base + ab.buff.seal.perLvl * P.level) * (w / 2.5); extra.sealSchool = ab.buff.seal.school || 'holy'; }
      if (ab.buff.thorns) extra.thorns = { dmg: Math.round(ab.buff.thorns.base + ab.buff.thorns.perLvl * P.level), charges: ab.buff.thorns.charges };
      if (ab.buff.dur >= 60) P.auras.push(Object.assign({ id: ab.buff.id, stats, until: now() + ab.buff.dur * 1000 }, extra));
      if (stats.sta) P.hp += stats.sta * 10;
    }
    if (ab.heal || ab.hot) {
      const st = G.stats();
      const amt = ab.heal ? rnd(ab.heal.base[0], ab.heal.base[1]) + ab.heal.perLvl * P.level + ab.heal.coef * st.sp : (ab.hot.heal + ab.hot.perLvl * P.level) * ab.hot.ticks;
      P.hp = Math.min(v.maxHp, P.hp + amt);
      emit('selfheal', Math.round(amt));
    }
    emit('change');
    return null;
  };

  function endSolo(C) {
    const S = G.S, P = S.player;
    const pu = G.pUnit;
    E.writeBack(C, pu, now());
    petWriteBack(C);
    for (const u of C.allies) if (u.memberRef) { E.writeBack(C, u, now()); if (u.dead) u.memberRef.hp = Math.round(u.maxHp * 0.5); }
    const size = S.wparty ? 1 + S.wparty.members.length : 1;
    const share = size > 1 ? PARTY_XP_BONUS / size : 1;
    const result = C.over;
    if (result === 'win') {
      for (const e of C.enemies) {
        if (e.inst) {
          const named = e.inst.id.startsWith('n_');
          e.inst.state = 'dead';
          e.inst.until = now() + (named ? D.PLACES[P.place].named[e.key] * 1000 : rnd(15, 28) * 1000);
        }
        onKill(e.key);
        G.gainXp(Math.round(G.xpForKill(e.level, e.elite) * share), true);
        const l = rollLoot(e.key, e.level, 1 / size);
        if (size > 1) {
          // gear goes to whoever wins the roll; everything else is yours
          const gear = l.items.filter((it) => D.GEAR_SLOTS.includes(it.slot));
          l.items = l.items.filter((it) => !D.GEAR_SLOTS.includes(it.slot));
          for (const it of gear) {
            if (Math.random() < 1 / size) l.items.push(it);
            else { const w = pick(S.wparty.members); loot(`${w.name} won: ${B.link(it.name, it.q)}`); }
          }
        }
        giveLoot(l);
        // Undead: Cannibalize after beating a humanoid or undead
        if (racialPassive('cannibalize') && ['humanoid', 'undead'].includes(D.MOBS[e.key].family)) { const v = G.vitals(); P.hp = Math.min(v.maxHp, P.hp + v.maxHp * 0.15); }
      }
    } else {
      for (const e of C.enemies) if (e.inst) { e.inst.state = 'alive'; }
      P.deaths++; P.hp = 0;
      P.ghostUntil = now() + 15000;
      sys('You have died. Your spirit runs back to your body...');
      if (Math.random() < 0.3) { const near = B.onlineIn(S, P.place, new Date()); if (near.length) B.post(S, 'say', pick(near), pick(['rip', 'oof', 'lol rip', 'u ok?'])); }
    }
    G.fight = null; G.pUnit = null;
    emit('fightEnd', { result });
    G.save();
  }


  // ============================================================ world PvP: ambushes (War Mode)
  // Enemy players sometimes attack you. Danger per place: 0 in capitals and starting valleys, very rare in
  // hub towns (guards fight for you), low in questing zones. Contested zones (later) set place.danger higher.
  // Ambushers pick fair fights: their level is set by your class so you win ~65-80% of the time (sim/pvp.js).
  const AMBUSH_MIN_LEVEL = 6, AMBUSH_GAP = 12 * 60000, AMBUSH_AFTER_DEATH = 20 * 60000, AMBUSH_PER_MIN = 1 / 30;
  G.AMBUSH_OFFSET = { warrior: 0, paladin: 0, hunter: 3, priest: -1, druid: 0, shaman: -1, mage: -2, warlock: 2, rogue: -1 };
  const WAR_MODE_BONUS = 1.1;
  G.warBonus = () => (G.S && G.S.flags.warMode ? WAR_MODE_BONUS : 1);
  G.dangerOf = function (placeId) {
    const p = D.PLACES[placeId];
    if (!p) return 0;
    if (p.danger != null) return p.danger;
    if (p.city || p.lvl[0] <= 3) return 0;
    return p.safe ? 0.08 : 1;
  };
  G.setWarMode = function (on) {
    const f = G.S.flags; f.warMode = !!on; f.warModeAsked = true;
    if (on) f.nextAmbush = Math.max(f.nextAmbush || 0, now() + 3 * 60000);
    sys(on ? 'War Mode is on. Enemy players may attack you. +10% experience and gold, and Honor for every enemy player you defeat.' : 'War Mode is off.');
    emit('change');
  };
  G.pvpStats = () => Object.assign({ kills: 0, deaths: 0, escapes: 0, honor: 0 }, G.S.player.pvp || {});
  // An enemy player first shows up nearby (in the scene and under People), like any other player.
  // Most of them attack after a while if you are still around; some are only passing through.
  // You can also attack them first, or walk away.
  function quietNow() {
    const S = G.S, P = S.player;
    return !(G.fight || S.run || S.queue || P.travel || P.ghostUntil || G.paused || (S.rolls && S.rolls.length));
  }
  function ambushTick() {
    const S = G.S, P = S.player, f = S.flags;
    if (P.level >= AMBUSH_MIN_LEVEL && !f.warModeAsked && quietNow() && G.dangerOf(P.place) > 0) { f.warModeAsked = true; emit('warModeIntro'); return; }
    const it = S.intruder;
    if (it) {
      if (!f.warMode || now() >= it.leaveAt) { S.intruder = null; emit('change'); return; }
      if (it.attackAt && now() >= it.attackAt && P.place === it.place) {
        const v = G.vitals();
        if (quietNow() && (P.hp == null || P.hp >= v.maxHp * 0.5)) startAmbush(false);
        else it.attackAt = now() + 8000; // they wait for a better moment
      }
      return;
    }
    if (!f.warMode || P.level < AMBUSH_MIN_LEVEL || !quietNow()) return;
    if (now() < (f.nextAmbush || 0)) return;
    const danger = G.dangerOf(P.place);
    if (!danger || Math.random() >= danger * AMBUSH_PER_MIN / 60) return;
    spawnIntruder();
  }
  function spawnIntruder() {
    const S = G.S, P = S.player, f = S.flags, place = D.PLACES[P.place];
    const myF = (D.RACES[P.race] || {}).faction || 'alliance';
    const theirF = myF === 'alliance' ? 'horde' : 'alliance';
    f.gankers = f.gankers || {};
    const pool = S.bots.filter((b) => B.factionOf(b) === theirF && !(f.gankers[b.id] > now()));
    if (!pool.length) return;
    const b = pick(pool);
    const level = clamp(P.level + (G.AMBUSH_OFFSET[P.cls] || 0) + rint(0, 1), 1, D.LEVEL_CAP);
    const hostile = Math.random() < (place.safe ? 0.55 : 0.7);
    S.intruder = { bot: b.id, name: b.name, race: b.race, cls: b.cls, gender: b.gender, skin: b.skin, hair: b.hair, level, place: P.place,
      attackAt: hostile ? now() + rnd(25, 60) * 1000 : null, leaveAt: now() + rnd(90, 180) * 1000 };
    f.gankers[b.id] = now() + 60 * 60000;
    f.nextAmbush = now() + AMBUSH_GAP * rnd(0.8, 1.5);
    const R = D.RACES[b.race] || {};
    sys(`An enemy player is nearby: ${b.name}, level ${level} ${R.name || ''} ${D.CLASSES[b.cls].name}.`);
    // the zone notices
    const mates = B.onlineIn(S, P.place, new Date()).filter((x) => B.factionOf(x) === myF);
    if (mates.length && (place.safe || Math.random() < 0.4)) {
      const who = theirF === 'horde' ? 'HORDE' : 'ALLIANCE';
      B.post(S, place.safe ? 'general' : 'say', pick(mates), pick(place.safe ? [`${who} IN ${place.name.toUpperCase()}!!`, `${lower(who)} in ${place.name.toLowerCase()}, careful`, `inc ${lower(who)} near the inn`] : ['watch out, pvp', `${lower(who)} here`, `a ${lower(D.CLASSES[b.cls].name)} is ganking here`]));
      emit('chat');
    }
    emit('intruder', S.intruder);
    emit('change');
  }
  G.intruderHere = () => { const S = G.S; return S && S.intruder && S.intruder.place === S.player.place ? S.intruder : null; };
  G.attackIntruder = function () {
    if (!G.intruderHere()) return toast('They are gone.');
    if (!quietNow()) return toast("You can't do that right now.");
    startAmbush(true);
  };
  function startAmbush(youStarted) {
    const S = G.S, P = S.player, place = D.PLACES[P.place], it = S.intruder;
    if (!it) return;
    S.intruder = null;
    const myF = (D.RACES[P.race] || {}).faction || 'alliance';
    const bot = S.bots.find((b) => b.id === it.bot) || { id: it.bot, name: it.name, race: it.race, cls: it.cls, gender: it.gender, skin: it.skin, hair: it.hair, skill: 0.5 };
    const skill = clamp(0.35 + Math.random() * 0.3, 0.2, 0.7);
    const ec = G.botChar(Object.assign({}, bot, { level: it.level, skill, role: 'dps' }));
    ec.role = 'dps';
    const eu = E.charUnit(ec, 'enemy', 'bot', now());
    eu.bot = { skill, react: 0.9 - 0.6 * skill }; eu.role = 'dps'; eu.threat = eu.threat || {}; eu.pvpBot = bot.id;
    stopActions();
    const pu = E.charUnit(P, 'ally', 'player', now());
    G.pUnit = pu;
    const allies = [pu];
    const pet = G.petUnitFor(pu); if (pet) allies.push(pet);
    for (const m of ((S.wparty && S.wparty.members) || [])) { const u = E.charUnit(m, 'ally', 'bot', now()); u.bot = { skill: m.bot.skill, react: 0.9 - 0.6 * m.bot.skill }; u.memberRef = m; allies.push(u); }
    const helpers = [];
    // town guards join on your side
    if (place.safe) {
      for (let i = 0; i < rint(1, 2); i++) {
        const gc = G.botChar({ id: -1 - i, name: `${place.name} ${myF === 'alliance' ? 'Guard' : 'Grunt'}`, cls: 'warrior', race: myF === 'alliance' ? 'human' : 'orc', gender: 'm', skin: rint(0, 3), hair: rint(0, 4), level: P.level + 4, skill: 0.6, role: 'tank' });
        const gu = E.charUnit(gc, 'ally', 'bot', now()); gu.bot = { skill: 0.6, react: 0.5 }; gu.role = 'tank'; gu.guard = true; allies.push(gu); helpers.push(gu.name);
      }
    }
    // sometimes a player of your faction nearby jumps in
    const near = B.onlineIn(S, P.place, new Date()).filter((b) => B.factionOf(b) === myF && b.level >= P.level - 3 && !(S.wparty && S.wparty.members.some((m) => m.bot.id === b.id)));
    if (near.length && Math.random() < (place.safe ? 0.6 : 0.3)) {
      const hb = pick(near); const hc = G.botChar(Object.assign({}, hb, { level: Math.min(hb.level, P.level + 2) }));
      const hu = E.charUnit(hc, 'ally', 'bot', now()); hu.bot = { skill: hb.skill, react: 0.9 - 0.6 * hb.skill }; hu.role = 'dps'; allies.push(hu); helpers.push(hb.name);
    }
    G.fight = E.fight(allies, [eu], { soloUid: pu.uid, puller: pu });
    G.fight.kind = 'pvp';
    G.fight.pvp = { bot: bot.id, name: bot.name, level: it.level, town: !!place.safe, helpers, youStarted };
    if (youStarted) eu.swingT = 1.2; // you swing first
    const R = D.RACES[bot.race] || {};
    sys(youStarted ? `You attack ${bot.name}!` : `${bot.name} (${R.name || ''} ${D.CLASSES[bot.cls].name}, level ${it.level}) attacks you!`);
    if (helpers.length) B.post(S, 'combat', null, `${helpers.join(' and ')} ${helpers.length > 1 ? 'join' : 'joins'} the fight!`);
    emit('fightStart', { fight: G.fight });
    emit('ambush', G.fight.pvp);
  }
  function endPvp(C) {
    const S = G.S, P = S.player, f = S.flags, info = C.pvp;
    E.writeBack(C, G.pUnit, now());
    petWriteBack(C);
    for (const u of C.allies) if (u.memberRef) { E.writeBack(C, u, now()); if (u.dead) u.memberRef.hp = Math.round(u.maxHp * 0.5); }
    P.pvp = G.pvpStats();
    const mates = B.onlineIn(S, P.place, new Date()).filter((b) => B.factionOf(b) === B.factionOf({ race: P.race }));
    if (C.over === 'win') {
      const honor = Math.round((10 + 2 * info.level) * (info.town ? 1.5 : 1));
      P.pvp.kills++; P.pvp.honor += honor;
      sys(`You defeated ${info.name}. +${honor} Honor.`);
      if (mates.length && Math.random() < 0.5) B.post(S, 'say', pick(mates), pick(['gj', 'nice', 'ez', 'get rekt lol', 'thx for the help', 'ty']));
      f.nextAmbush = now() + AMBUSH_GAP * rnd(0.8, 1.5);
    } else {
      P.pvp.deaths++; P.deaths++; P.hp = 0;
      P.ghostUntil = now() + 15000;
      sys(`${info.name} killed you. Your spirit runs back to your body...`);
      if (mates.length && Math.random() < 0.4) B.post(S, 'say', pick(mates), pick(['rip', 'gankers smh', 'we will get him', 'u ok?']));
      f.nextAmbush = now() + AMBUSH_AFTER_DEATH;
    }
    G.fight = null; G.pUnit = null;
    emit('fightEnd', { result: C.over, pvp: true });
    G.save();
  }

  // ============================================================ world party (grouping with nearby players)
  // Balance (sim/party.js): XP is split with a 1.3x group bonus and pulls get bigger, so a party averages ~1.1x solo XP/hour.
  const PARTY_MAX = 3, PARTY_XP_BONUS = 1.3, EXTRA_PULL = 0.7;
  const INVITE_GAP = 10 * 60000, DECLINE_GAP = 20 * 60000;
  const partyRole = (cls) => cls === 'warrior' ? 'tank' : cls === 'priest' ? 'healer' : (cls === 'paladin' || cls === 'druid' || cls === 'shaman') ? pick(['healer', 'dps']) : 'dps';
  G.partySize = () => 1 + ((G.S.wparty && G.S.wparty.members.length) || 0);
  function addToParty(bot) {
    const S = G.S;
    if (!S.wparty) S.wparty = { members: [], place: S.player.place, until: now() + rnd(4, 8) * 60000 };
    if (S.wparty.members.length >= PARTY_MAX - 1 || S.wparty.members.some((m) => m.bot.id === bot.id)) return;
    const b = JSON.parse(JSON.stringify(bot)); b.role = partyRole(b.cls);
    const ch = G.botChar(b);
    S.wparty.members.push(ch);
    sys(`${ch.name} joins the party.`);
    S.pending.push({ at: now() + 1500, bot: b.id, ch: 'party', text: B.partyLine(b, 'hello'), fromName: ch.name });
    emit('change');
  }
  G.leaveParty = function (quiet) {
    const S = G.S;
    if (!S.wparty) return;
    if (G.fight) return toast('Finish the fight first.');
    if (!quiet) sys('You leave the party.');
    S.wparty = null; emit('change');
  };
  function disbandParty(reason) {
    const S = G.S; if (!S.wparty) return;
    const m = S.wparty.members[0];
    if (m) partySay(m, B.partyLine(m.bot, 'bye'));
    sys(reason || 'Your party has disbanded.');
    S.wparty = null; emit('change');
  }
  // You invite someone from "Players here".
  G.invite = function (botId) {
    const S = G.S, P = S.player;
    if (S.run || S.queue) return toast('Not while in the group finder.');
    if (G.partySize() >= PARTY_MAX) return toast('Your party is full.');
    const b = S.bots.find((x) => x.id === botId); if (!b) return;
    if (S.wparty && S.wparty.members.some((m) => m.bot.id === botId)) return toast(`${b.name} is already in your party.`);
    if ((S.flags.invitedAt || {})[botId] > now() - 20000) return toast(`You already invited ${b.name}.`);
    S.flags.invitedAt = Object.assign(S.flags.invitedAt || {}, { [botId]: now() });
    const diff = Math.abs(b.level - P.level);
    const yes = Math.random() < (diff <= 3 ? 0.75 : diff <= 5 ? 0.35 : 0.05);
    sys(`You invite ${b.name} to your group.`);
    S.pending.push({ at: now() + rnd(1500, 3500), bot: b.id, ch: 'whisper', text: yes ? pick(['sure', 'ok!', 'yeah why not', 'sure, same quest']) : pick(['no ty', 'soloing sry', 'nah', 'too low lol']),
      onPost: () => { if (yes && G.S && !G.S.run) addToParty(b); } });
  };
  G.acceptPartyInvite = function (botId) {
    const S = G.S; const b = S.bots.find((x) => x.id === botId); if (!b) return;
    S.flags.pendingInvite = null;
    addToParty(b);
    if (Math.random() < 0.35) { const friend = B.onlineIn(S, S.player.place, new Date()).find((x) => x.id !== b.id && Math.abs(x.level - S.player.level) <= 3 && B.factionOf(x) === B.factionOf(b)); if (friend) setTimeout(() => G.S && G.S.wparty && addToParty(friend), 2500); }
  };
  G.declinePartyInvite = function (botId) {
    const S = G.S; S.flags.pendingInvite = null;
    S.flags.declined = (S.flags.declined || []).concat([botId]).slice(-60);
    S.flags.nextInvite = now() + DECLINE_GAP;
  };
  G.setInvites = function (on) { G.S.flags.noInvites = !on; emit('change'); };
  function partyTick() {
    const S = G.S, P = S.player, t = now();
    if (S.wparty) {
      if (P.place !== S.wparty.place) return disbandParty('You left the area, so your party went their own way.');
      if (t >= S.wparty.until && !G.fight) return disbandParty('Your party has disbanded.');
      // members recover between fights
      for (const m of S.wparty.members) if (m.hp != null) { const st = E.statsFor(m); m.hp = Math.min(st.maxHp, m.hp + st.maxHp * 0.06); if (m.hp >= st.maxHp) m.hp = null; if (m.res != null) m.res = null; }
      return;
    }
    // invites: rare, never while busy, never twice from someone you declined
    if (S.flags.noInvites || G.fight || S.run || S.queue || P.travel || P.ghostUntil || S.flags.pendingInvite) return;
    const pl = D.PLACES[P.place]; if (!pl || pl.safe) return;
    if (!S.flags.nextInvite) S.flags.nextInvite = t + rnd(3, 6) * 60000;
    if (t < S.flags.nextInvite) return;
    S.flags.nextInvite = t + INVITE_GAP;
    const declined = new Set(S.flags.declined || []);
    const myF = (D.RACES[P.race] || {}).faction || 'alliance';
    const cand = B.onlineIn(S, P.place, new Date(t)).filter((b) => Math.abs(b.level - P.level) <= 3 && !declined.has(b.id) && B.factionOf(b) === myF);
    if (!cand.length || Math.random() > 0.85) return;
    const b = pick(cand);
    S.flags.pendingInvite = b.id;
    emit('partyInvite', { bot: b, why: `also hunting in ${pl.name}` });
  }
  G.partyTick = partyTick;

  // ============================================================ group finder
  G.role = function () { const P = G.S.player; return P.role || D.CLASSES[P.cls].role; };
  G.roles = function () { const C = D.CLASSES[G.S.player.cls]; return C.roles || [C.role]; };
  G.setRole = function (r) { if (G.roles().includes(r) && !G.S.queue && !G.S.run) { G.S.player.role = r; emit('change'); } };
  // Group finder rules (2026-09-27): any faction may run any dungeon or elite, but only from its zone:
  // you have to be there. Places you have no road to yet stay hidden (the factions' roads meet in later zones).
  // Leaving a run early = deserter.
  const DESERTER = 10 * 60000;
  const reach = {};
  G.reachableRegions = function (from) {
    if (reach[from]) return reach[from];
    const seen = new Set([from]), q = [from], regions = new Set();
    while (q.length) { const k = q.shift(); regions.add(D.PLACES[k].region); for (const to in (D.PLACES[k].links || {})) if (D.PLACES[to] && !seen.has(to)) { seen.add(to); q.push(to); } }
    return (reach[from] = regions);
  };
  G.activityBlock = function (act) {
    const S = G.S, P = S.player, A = D.ACTIVITIES[act];
    const region = A.where && D.PLACES[A.where].region;
    if (region && !G.reachableRegions(P.place).has(region)) return 'hidden';
    if (P.level < A.minLvl) return `Requires level ${A.minLvl}`;
    if (region && region !== (D.PLACES[P.place] || {}).region) return `Go to ${D.REGIONS[region].name} to join`;
    if ((S.flags.deserterUntil || 0) > now()) return `Deserter: ${Math.ceil((S.flags.deserterUntil - now()) / 60000)} min`;
    return null;
  };
  G.syncLevel = (act) => Math.min(G.S.player.level, D.ACTIVITIES[act].maxLvl || D.LEVEL_CAP);
  G.queueFor = function (act) {
    const S = G.S, A = D.ACTIVITIES[act];
    const why = G.activityBlock(act);
    if (why) return toast(why === 'hidden' ? 'Only for the other faction.' : why + '.');
    if (S.wparty) disbandParty('You left your party to use the group finder.');
    if (S.run || S.group) return toast('Leave your current group first.');
    const role = G.role();
    const wait = role === 'tank' ? rnd(4, 12) : role === 'healer' ? rnd(8, 20) : rnd(25, 70);
    S.queue = { act, since: now(), popAt: now() + wait * 1000 };
    sys(`You are queued for ${A.name} as ${role === 'tank' ? 'Tank' : role === 'healer' ? 'Healer' : 'Damage'}.`);
    emit('change');
  };
  G.leaveQueue = function () { G.S.queue = null; sys('You left the queue.'); emit('change'); };
  const OTHER_REALMS = ['Stormrage', 'Silvermoon', 'Argent Dawn', 'Kirin Tor', 'Bronzebeard', 'Moonglade'];
  function recruit(role, lvl, used, usedCls) {
    const S = G.S, date = new Date();
    const want = role === 'tank' ? ['warrior', 'warrior', 'paladin'].concat(lvl >= 10 ? ['druid'] : []) : role === 'healer' ? ['priest', 'priest', 'paladin', 'druid', 'shaman'] : ['mage', 'rogue', 'rogue', 'mage', 'warrior', 'warlock', 'warlock', 'hunter', 'hunter', 'druid', 'shaman'];
    const myF = (D.RACES[S.player.race] || {}).faction || 'alliance';
    let pool = S.bots.filter((b) => B.isOnline(b, date) && B.factionOf(b) === myF && want.includes(b.cls) && b.level >= lvl - 1 && b.level <= lvl + 3 && !used.has(b.id));
    // prefer classes the group does not have yet
    if (usedCls) { const fresh = pool.filter((b) => !usedCls.has(b.cls)); if (fresh.length) pool = fresh; }
    let b;
    if (pool.length) b = JSON.parse(JSON.stringify(pick(pool)));
    else {
      const nb = B.makeBot(S.nextBotId++, new Set(S.bots.map((x) => x.name)), { level: clamp(lvl + rint(-1, 1), 8, D.LEVEL_CAP) });
      const freshCls = usedCls ? want.filter((c) => !usedCls.has(c)) : want;
      nb.cls = pick(freshCls.length ? freshCls : want); nb.realm = pick(OTHER_REALMS);
      nb.race = myF === 'horde' ? pick(['orc', 'troll', 'tauren', 'undead']) : pick(['human', 'dwarf', 'gnome', 'nightelf']);
      b = nb;
    }
    used.add(b.id); if (usedCls) usedCls.add(b.cls);
    b.role = role;
    b.level = clamp(Math.max(b.level, lvl - 1), 1, D.LEVEL_CAP);
    return b;
  }
  G.botChar = function (b) {
    const C = D.CLASSES[b.cls];
    const q = b.skill > 0.72 ? (Math.random() < 0.4 ? 3 : 2) : b.skill > 0.4 ? 2 : 1;
    const wt = b.cls === 'paladin' ? 'mace' : b.role === 'healer' || b.cls === 'mage' || b.cls === 'warlock' ? 'staff' : C.weapons[0];
    const equip = { weapon: G.genGear('weapon', b.level, q, { wtype: wt }) };
    if (C.ranged) equip.ranged = G.genGear('ranged', b.level, q);
    if (b.level >= 10 && q === 3) {
      const wl = BOT_WEAPON_LOOKS[b.cls];
      const named = wl && wl.map((k) => Object.keys(D.ITEMS).find((id) => D.ITEMS[id].look && D.ITEMS[id].look[1] === k)).filter((id) => id && G.canUseItem(D.ITEMS[id], b.cls));
      if (named && named.length && Math.random() < 0.6) equip.weapon = G.copyItem(pick(named));
      if (Math.random() < 0.35) equip.back = G.copyItem('cape_brotherhood');
    }
    for (const s of ['chest', 'legs', 'feet', 'hands']) equip[s] = G.genGear(s, b.level, s === 'chest' ? q : Math.max(1, q - 1), { atype: C.armorType });
    return { name: b.name + (b.realm ? '-' + b.realm.replace(' ', '') : ''), cls: b.cls, race: b.race || 'human', level: b.level, equip, role: b.role, hp: null, res: null, auras: [], bot: b };
  };
  function formGroup(act) {
    const S = G.S, A = D.ACTIVITIES[act];
    const roles = A.size === 3 ? ['tank', 'healer', 'dps'] : ['tank', 'healer', 'dps', 'dps', 'dps'];
    const mine = G.role();
    roles.splice(roles.indexOf(mine), 1);
    const used = new Set(), usedCls = new Set([S.player.cls]);
    const lvl = G.syncLevel(act);
    const members = roles.map((r) => G.botChar(recruit(r, lvl, used, usedCls)));
    // everyone fights at the activity's level
    const cap = A.maxLvl || D.LEVEL_CAP;
    for (const m of members) m.syncLevel = cap;
    S.player.syncLevel = cap;
    S.group = { act, members };
    return S.group;
  }
  G.acceptPop = function () {
    const S = G.S;
    if (!S.queue) return;
    const act = S.queue.act; S.queue = null;
    stopActions();
    const grp = formGroup(act);
    sys(`You have joined a group for ${D.ACTIVITIES[act].name}.`);
    grp.members.forEach((m, i) => { if (Math.random() < 0.7) S.pending.push({ at: now() + 800 + i * 1400 + Math.random() * 1500, bot: m.bot.id, ch: 'party', text: B.partyLine(m.bot, 'hello'), fromName: m.name }); });
    startRun(act);
    emit('change');
  };
  G.declinePop = function () { G.S.queue = null; sys('You declined the group.'); emit('change'); };

  // ============================================================ runs (dungeon / hogger)
  function startRun(act) {
    const S = G.S, A = D.ACTIVITIES[act];
    let pulls, mult = null, bossMult = null, name = A.name;
    if (A.dungeon) {
      const Dg = D.DUNGEONS[A.dungeon];
      pulls = Dg.pulls; mult = Dg.trashMult; bossMult = Dg.bossMult;
    } else {
      pulls = A.pulls;
    }
    S.run = { act, name, pulls, mult, bossMult, idx: 0, phase: 'rest', restUntil: now() + 6000, wipes: 0, rolls: [], returnTo: S.player.place, started: now() };
    emit('instanceEnter', { act, dungeon: A.dungeon || null });
    S.player.hp = S.player.hp == null ? null : S.player.hp;
    emit('runUpdate');
  }
  G.runPull = function () {
    const S = G.S, R = S.run;
    if (!R || R.phase !== 'rest') return;
    if (S.group.members.some((m) => m.gone)) { toast('Wait for the group to fill up.'); return; }
    const pull = R.pulls[R.idx];
    const pu = E.charUnit(S.player, 'ally', 'player', now());
    const allies = [pu];
    const petU = G.petUnitFor(pu);
    if (petU) allies.push(petU);
    for (const m of S.group.members) {
      if (m.gone) continue;
      const u = E.charUnit(m, 'ally', 'bot', now());
      u.bot = { skill: m.bot.skill, react: 0.9 - 0.6 * m.bot.skill };
      if (!m.bot.skill || m.bot.skill < 0.3) u.bot.react = 1.1;
      if (Math.random() < 0.06) u.bot.afkUntil = rnd(3, 8);
      u.memberRef = m;
      allies.push(u);
    }
    const mult = pull.boss ? (R.bossMult || { hp: 1, dmg: 1 }) : (R.mult || { hp: 1, dmg: 1 });
    const marks = (R.marks && R.marks[R.idx]) || {};
    const enemies = pull.mobs.map((k, i) => {
      const M = D.MOBS[k];
      const u = E.mobUnit(k, null, M.boss ? mult : (R.mult || { hp: 1, dmg: 1 }));
      if (marks[i]) u.mark = marks[i];
      return u;
    });
    const tank = allies.find((a) => a.role === 'tank') || pu;
    G.pUnit = pu;
    G.fight = E.fight(allies, enemies, { puller: tank, dungeonMult: R.mult });
    G.fight.kind = 'run';
    pu.target = (enemies.find((e) => e.mark === 'skull') || enemies[0]).uid;
    // Momentum: pulling again within 5 sec of the last fight stacks a group buff; resting resets it
    R.momentum = R.lastFightEnd && now() - R.lastFightEnd <= MOMENTUM_WINDOW ? Math.min(MOMENTUM_MAX, (R.momentum || 0) + 1) : 0;
    if (R.momentum) {
      const L = G.syncLevel(R.act), m = R.momentum;
      for (const a of allies) { a.auras.push({ id: 'momentum', until: 600, stats: { haste: 5 * m, ap: Math.round(0.5 * L * m), sp: Math.round(0.4 * L * m) } }); E.recalc(a); }
      if (m >= 2) sys(`Momentum x${m}: the group hits faster and harder.`);
    }
    // a careless tank sometimes pulls the next pack too
    const tb = S.group.members.find((m) => m.role === 'tank' && !m.gone);
    if (tb && !pull.boss && R.idx + 1 < R.pulls.length && !R.pulls[R.idx + 1].boss && Math.random() < ((R.pace || 'normal') === 'fast' ? 0.3 : 0.28 * (1 - tb.bot.skill) * PACE[R.pace || 'normal'].extra)) {
      G.fight.extraAt = { t: rnd(4, 8), mobs: R.pulls[R.idx + 1].mobs.slice(0, 1) };
    }
    R.phase = 'fight';
    if (tb && Math.random() < 0.5) partySay(tb, B.partyLine(tb.bot, 'pull'));
    emit('fightStart', { fight: G.fight });
    emit('runUpdate');
  };
  function partySay(m, text) {
    B.post(G.S, 'party', { name: m.name, cls: m.cls, id: m.bot.id }, text);
  }
  function memberOf(u) { return u.memberRef; }

  function endRunFight(C) {
    const S = G.S, R = S.run;
    const pull = R.pulls[R.idx];
    E.writeBack(C, G.pUnit, now());
    petWriteBack(C);
    for (const u of C.allies) if (u.memberRef) E.writeBack(C, u, now());
    const result = C.over;
    G.fight = null;
    const pu = G.pUnit; G.pUnit = null;
    if (result === 'win') {
      const size = 1 + S.group.members.filter((m) => !m.gone).length;
      for (const e of C.enemies) {
        onKill(e.key);
        G.gainXp(Math.round(G.xpForKill(e.level, true) / size * 1.4), true);
        const l = rollLoot(e.key, e.level, 1 / size);
        giveLoot({ money: l.money, items: l.items.filter((it) => it.slot === 'junk' || it.slot === 'quest') });
        const gear = l.items.filter((it) => D.GEAR_SLOTS.includes(it.slot) && it.q >= 2);
        for (const it of gear) addRoll(it);
      }
      if (pull.boss) {
        const M = D.MOBS[pull.mobs[0]];
        const table = (M.loot || []).slice().sort(() => Math.random() - 0.5);
        const drops = table.slice(0, 2).map(G.copyItem);
        for (const it of drops) addRoll(it);
        if (!D.ACTIVITIES[R.act].dungeon || Math.random() < 0.25) addRoll(G.genGear(pick(D.GEAR_SLOTS), G.syncLevel(R.act), !D.ACTIVITIES[R.act].dungeon ? 2 : 3));
        if (pull.mobs[0] === 'vancleef' && G.S.player.quests.defias_brotherhood) { G.addItem(G.copyItem('vancleef_head'), 1); loot(`You receive loot: ${B.link("Head of VanCleef")}.`); questCheck(); }
        const talker = pick(S.group.members.filter((m) => !m.gone));
        if (talker) partySay(talker, B.partyLine(talker.bot, 'win'));
      }
      R.deaths = (R.deaths || 0) + C.allies.filter((u) => u.dead && u.kind !== 'pet').length;
      R.lastFightEnd = now();
      // rez the fallen
      const healerAlive = C.allies.find((u) => u.role === 'healer' && !u.dead);
      for (const u of C.allies) if (u.dead && u.kind !== 'pet') {
        const ch = u.memberRef || S.player;
        ch.hp = Math.round(u.maxHp * (healerAlive ? 0.4 : 0.5)); ch.res = null; if (u === pu) { S.player.hp = ch.hp; }
      }
      if (healerAlive && C.allies.some((u) => u.dead && u.kind !== 'pet')) sys(`${healerAlive.name} casts Resurrection.`);
      R.idx++;
      if (R.idx >= R.pulls.length) {
        R.phase = 'done';
        sys(`${R.name} complete!`);
        runBonuses(R);
        S.group.members.filter((m) => !m.gone).forEach((m, i) => S.pending.push({ at: now() + 2000 + i * 1600, bot: m.bot.id, ch: 'party', text: B.partyLine(m.bot, 'bye'), fromName: m.name }));
      } else { R.phase = 'rest'; R.restUntil = now() + 6500 * (PACE[R.pace || 'normal'].rest); }
    } else {
      R.wipes++; R.momentum = 0;
      R.phase = 'wipe'; R.restUntil = now() + 12000;
      sys('Your party has been defeated. Running back...');
      const alive = S.group.members.filter((m) => !m.gone);
      const toxicOne = alive.slice().sort((a, b) => b.bot.toxic - a.bot.toxic)[0];
      if (toxicOne) partySay(toxicOne, B.partyLine(toxicOne.bot, 'wipe'));
      for (const m of alive) {
        const pLeave = 0.08 + m.bot.toxic * 0.25 + (R.wipes - 1) * 0.12;
        if (Math.random() < pLeave) {
          m.gone = true;
          S.pending.push({ at: now() + 2500 + Math.random() * 2000, bot: m.bot.id, ch: 'party', text: B.partyLine(m.bot, m.bot.toxic > 0.5 ? 'rage' : 'leave'), fromName: m.name,
            onPost: () => sys(`${m.name} has left the group.`) });
        }
      }
      S.player.hp = null; S.player.res = null;
      for (const m of S.group.members) { m.hp = null; m.res = null; }
    }
    emit('fightEnd', { result });
    emit('runUpdate');
    G.save();
  }

  function addRoll(it) {
    const S = G.S, R = S.run;
    const r = { item: it, until: now() + 25000, choices: {}, player: null, done: false };
    for (const m of S.group.members) {
      if (m.gone) continue;
      const usable = G.canUseItem(it, m.cls) && (!it.atype || it.atype === D.CLASSES[m.cls].armorType || it.slot === 'back') && (it.slot !== 'weapon' || D.CLASSES[m.cls].weapons.includes(it.wtype));
      let c;
      if (m.bot.ninja) c = 'need';
      else if (usable && Math.random() < 0.85) c = 'need';
      else c = Math.random() < 0.75 ? 'greed' : 'pass';
      r.choices[m.name] = { c, v: c === 'pass' ? 0 : rint(1, 100), at: now() + rnd(1500, 7000), m };
    }
    R.rolls.push(r);
    loot(`Loot: ${B.link(it.name, it.q)}. Choose Need, Greed or Pass.`);
    emit('roll', r);
  }
  G.roll = function (idx, c) {
    const R = G.S.run;
    if (!R || !R.rolls[idx] || R.rolls[idx].done) return;
    R.rolls[idx].player = { c, v: c === 'pass' ? 0 : rint(1, 100) };
    emit('runUpdate');
  };
  function rollsTick() {
    const S = G.S, R = S.run;
    if (!R) return;
    const t = now();
    for (const r of R.rolls) {
      if (r.done) continue;
      const botsIn = Object.values(r.choices).every((c) => c.at <= t);
      if (t >= r.until && !r.player) r.player = { c: 'pass', v: 0 };
      if (!(botsIn && r.player)) continue;
      r.done = true;
      const entries = Object.entries(r.choices).map(([name, c]) => ({ name, c: c.c, v: c.v, m: c.m })).concat([{ name: S.player.name, c: r.player.c, v: r.player.v, me: true }]);
      for (const e of entries) if (e.c !== 'pass') loot(`${e.c === 'need' ? 'Need' : 'Greed'} Roll - ${e.v} for ${B.link(r.item.name, r.item.q)} by ${e.name}`);
      const needs = entries.filter((e) => e.c === 'need'); const greeds = entries.filter((e) => e.c === 'greed');
      const pool = needs.length ? needs : greeds;
      if (!pool.length) { loot(`Everyone passed on ${B.link(r.item.name, r.item.q)}.`); continue; }
      const win = pool.sort((a, b) => b.v - a.v)[0];
      r.winner = win.name;
      if (win.me) { if (G.addItem(r.item, 1)) loot(`You won: ${B.link(r.item.name, r.item.q)}`); }
      else {
        loot(`${win.name} won: ${B.link(r.item.name, r.item.q)}`);
        const usable = G.canUseItem(r.item, win.m.cls);
        if (win.m.bot.ninja && !usable) {
          const other = S.group.members.find((m) => !m.gone && m !== win.m);
          if (other) S.pending.push({ at: t + 2000, bot: other.bot.id, ch: 'party', text: pick(['ninja...', 'wtf that is not even your armor', 'reported lol', 'bruh']), fromName: other.name });
          S.pending.push({ at: t + 4500, bot: win.m.bot.id, ch: 'party', text: B.partyLine(win.m.bot, 'loot'), fromName: win.m.name });
        } else if (Math.random() < 0.5) {
          const other = S.group.members.find((m) => !m.gone && m !== win.m);
          if (other) S.pending.push({ at: t + 1800, bot: other.bot.id, ch: 'party', text: B.partyLine(other.bot, 'loot'), fromName: other.name });
        }
      }
      emit('runUpdate');
    }
    R.rolls = R.rolls.filter((r) => !r.done || t - r.until < 4000);
  }
  G.paused = false;   // set by the UI while a cutscene plays
  function runTick() {
    const S = G.S, R = S.run;
    if (!R || R.phase === 'fight') return;
    const t = now();
    if (G.paused) { R.restUntil = Math.max(R.restUntil, t + 4000); return; }
    // regen during rest
    const v = G.vitals();
    const P = S.player;
    if (P.hp == null) P.hp = v.maxHp;
    if (R.phase === 'rest') {
      // resting between pulls: slow enough that the pull pace matters (careful waits, fast goes in low)
      const RR = G.REST_REGEN;
      P.hp = Math.min(v.maxHp, P.hp + v.maxHp * RR);
      if (v.resType === 'mana') P.res = Math.min(v.maxRes, P.res + v.maxRes * RR);
      for (const m of S.group.members) { if (m.hp != null) { const st = E.statsFor(m); m.hp = Math.min(st.maxHp, m.hp + st.maxHp * RR); if (m.res != null && D.CLASSES[m.cls].resource === 'mana') m.res = Math.min(st.maxMana, m.res + st.maxMana * RR); } }
      // replace leavers
      const missing = S.group.members.filter((m) => m.gone && !m.replacing);
      for (const m of missing) {
        m.replacing = t + rnd(8000, 20000);
        sys(`Looking for a new ${m.role === 'tank' ? 'tank' : m.role === 'healer' ? 'healer' : 'damage dealer'}...`);
      }
      for (const m of S.group.members.filter((x) => x.gone && x.replacing && t >= x.replacing)) {
        const used = new Set(S.group.members.map((x) => x.bot.id));
        const nb = G.botChar(recruit(m.role, G.syncLevel(R.act), used, new Set(S.group.members.filter((x) => !x.gone).map((x) => x.cls).concat([P.cls]))));
        nb.syncLevel = D.ACTIVITIES[R.act].maxLvl || D.LEVEL_CAP;
        const i = S.group.members.indexOf(m);
        S.group.members[i] = nb;
        sys(`${nb.name} has joined the group.`);
        S.pending.push({ at: t + 1500, bot: nb.bot.id, ch: 'party', text: B.partyLine(nb.bot, 'hello'), fromName: nb.name });
      }
      const waiting = S.group.members.some((m) => m.gone);
      // bot tank pulls on its own when rested; player tank pulls manually
      const pace = PACE[R.pace || 'normal'];
      const topped = !pace.hp || (P.hp >= v.maxHp * pace.hp && (v.resType !== 'mana' || P.res >= v.maxRes * pace.mana) && S.group.members.every((m) => { if (m.gone || m.hp == null) return true; const st = E.statsFor(m); return m.hp >= st.maxHp * pace.hp && (D.CLASSES[m.cls].resource !== 'mana' || m.res == null || m.res >= st.maxMana * pace.mana); }));
      if (G.role() !== 'tank' && t >= R.restUntil && (topped || t >= R.restUntil + 25000) && !waiting && !R.rolls.some((r) => !r.done && !r.player)) G.runPull();
      emit('runTick');
    } else if (R.phase === 'wipe' && t >= R.restUntil) {
      R.phase = 'rest'; R.restUntil = t + 6000;
      P.hp = Math.round(v.maxHp * 0.5); P.res = v.resType === 'mana' ? Math.round(v.maxRes * 0.5) : 0;
      emit('runUpdate');
    }
  }
  // ---------- tactics: pull pace, kill-order marks, boss plan
  // careful: rest to full, the tank never grabs an extra pack; fast: short rests, more extra packs.
  G.REST_REGEN = 0.05; // share of health/mana regained per second while resting in a dungeon (tuned in sim/tactics.js)
  const PACE = { careful: { rest: 1.6, hp: 0.95, mana: 0.9, extra: 0 }, normal: { rest: 1, hp: 0, mana: 0, extra: 1 }, fast: { rest: 0.35, hp: 0, mana: 0, extra: 2.2 } };
  G.setPace = function (p) { const R = G.S.run; if (R && PACE[p]) { R.pace = p; sys(`Pull pace: ${p}.`); emit('runUpdate'); } };
  G.setBossPlan = function (p) { const R = G.S.run; if (R) { R.bossPlan = p; sys(p === 'adds' ? 'Boss plan: kill the adds first.' : 'Boss plan: burn the boss.'); emit('runUpdate'); } };
  const NEXT_MARK = { undefined: 'skull', skull: 'cross', cross: undefined };
  // mark an enemy of the next pull (before it starts), or a live enemy in the fight
  G.cycleMark = function (i) {
    const R = G.S.run; if (!R) return;
    R.marks = R.marks || {}; const m = R.marks[R.idx] || (R.marks[R.idx] = {});
    const nx = NEXT_MARK[m[i]]; if (nx === 'skull') for (const k in m) if (m[k] === 'skull') delete m[k];
    if (nx) m[i] = nx; else delete m[i];
    emit('runUpdate');
  };
  G.cycleUnitMark = function (uid) {
    const C = G.fight; if (!C) return; const u = C.units[uid]; if (!u || u.side !== 'enemy') return;
    const nx = NEXT_MARK[u.mark]; if (nx === 'skull') for (const e of C.enemies) if (e.mark === 'skull') e.mark = undefined;
    u.mark = nx; emit('target');
  };
  function applyBossPlan(C) {
    const R = G.S.run; if (!R || !R.bossPlan) return;
    const boss = C.enemies.find((e) => !e.dead && D.MOBS[e.key] && D.MOBS[e.key].boss);
    if (!boss) return;
    const adds = C.enemies.filter((e) => !e.dead && e !== boss);
    if (R.bossPlan === 'adds' && adds.length) { for (const a of adds) if (!a.mark) a.mark = 'skull'; if (!boss.mark || boss.mark === 'skull') boss.mark = adds.some((a) => a.mark === 'skull') ? 'cross' : 'skull'; }
    else if (R.bossPlan === 'boss') { boss.mark = 'skull'; }
  }
  // ---------- dungeon bonuses: beat par time (fast pays), clear flawless (careful pays); a good group can get both
  const MOMENTUM_WINDOW = 5000, MOMENTUM_MAX = 5;
  G.runClock = function () { const R = G.S.run; return R ? ((R.finishedAt || now()) - R.started) / 1000 : 0; };
  function runBonuses(R) {
    const S = G.S, P = S.player, A = D.ACTIVITIES[R.act], Dg = A.dungeon && D.DUNGEONS[A.dungeon];
    if (!Dg) return;
    R.finishedAt = now();
    const secs = G.runClock(), L = G.syncLevel(R.act);
    const speed = Dg.par && secs <= Dg.par, flawless = !R.wipes; // flawless = the group never wiped
    const cx = (P.codex = P.codex || {})[R.act] = Object.assign({ clears: 0, flawless: 0, speed: 0, best: null }, (P.codex || {})[R.act]);
    cx.clears++; if (flawless) cx.flawless++; if (speed) cx.speed++; if (cx.best == null || secs < cx.best) cx.best = Math.round(secs);
    R.bonus = { secs: Math.round(secs), par: Dg.par, speed, flawless };
    if (speed) {
      // the speed chest: half the time a blue from this dungeon's bosses, otherwise a green
      const blues = []; for (const pl of Dg.pulls) for (const k of pl.mobs) for (const id of (D.MOBS[k].loot || [])) if (!blues.includes(id)) blues.push(id);
      const it = Math.random() < 0.5 && blues.length ? G.copyItem(pick(blues)) : G.genGear(pick(D.GEAR_SLOTS), L, 2);
      G.addItem(it, 1); P.money += L * 150;
      loot(`Speed bonus (under ${fmtClock(Dg.par)}): ${B.link(it.name, it.q)} and ${G.moneyText(L * 150)}.`);
    }
    if (flawless) {
      const it = G.genGear(pick(D.GEAR_SLOTS), L, 2);
      G.addItem(it, 1); P.money += L * 200;
      loot(`Flawless clear (no wipes): ${B.link(it.name, it.q)} and ${G.moneyText(L * 200)}.`);
    }
    if (!speed && !flawless) sys(`Cleared in ${fmtClock(secs)} (par ${fmtClock(Dg.par)}). No bonus this time.`);
    emit('lootGain', { items: 1 });
  }
  const fmtClock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  G.fmtClock = fmtClock;
  G.runReady = function () { const R = G.S.run; if (R && R.phase === 'rest') { if (G.role() === 'tank') G.runPull(); else R.restUntil = Math.min(R.restUntil, now()); } };
  G.leaveGroup = function () {
    const S = G.S;
    if (G.fight && G.fight.kind === 'run') return toast('Finish the fight first.');
    if (S.run) {
      if (S.run.phase !== 'done' && S.group) {
        const m = S.group.members.find((x) => !x.gone);
        if (m) partySay(m, pick(['wait what', 'bye then', 'k', 'rip']));
        S.flags.deserterUntil = now() + DESERTER;
        sys('You left before the end: Deserter for 10 minutes.');
      }
      S.player.place = S.run.returnTo || 'goldshire';
    }
    S.run = null; S.group = null; delete S.player.syncLevel;
    sys('You left the group.');
    S.player.hp = S.player.hp == null ? null : S.player.hp;
    emit('change'); emit('runUpdate');
  };

  // ============================================================ chat
  G.say = function (ch, text) {
    const S = G.S;
    text = String(text).slice(0, 180);
    if (!text.trim()) return;
    if (ch === 'guild' && S.player.guild < 0) return toast('You are not in a guild.');
    if (ch === 'party' && !S.group) return toast('You are not in a party.');
    S.chat.push({ t: now(), ch, from: S.player.name, cls: S.player.cls, me: true, text });
    B.respond(S, ch, text);
    emit('chat');
  };
  function sys(text) { if (G.S) { B.post(G.S, 'system', null, text); emit('chat'); } }
  function loot(text) { B.post(G.S, 'loot', null, text); emit('chat'); }
  function toast(text) { emit('toast', text); return text; }
  G.sys = sys; G.toast = toast;

  // ============================================================ main loop
  let acc = 0, worldAcc = 0, saveAcc = 0;
  G.update = function (dt) {
    const S = G.S;
    if (!S) return;
    acc += dt;
    S.player.played = (S.player.played || 0) + dt;
    // combat at fixed 0.1s steps
    while (acc >= 0.1) {
      acc -= 0.1;
      const C = G.fight;
      if (C) {
        E.tick(C, 0.1);
        if (C.kind === 'run') applyBossPlan(C);
        if (C.addAt && C.t >= C.addAt.t) {
          const mu = E.mobUnit(C.addAt.inst.key, C.addAt.inst.level); mu.inst = C.addAt.inst;
          E.addEnemy(C, mu); C.addAt = null;
          B.post(S, 'combat', null, `${mu.name} joins the fight!`);
        }
        if (C.extraAt && C.t >= C.extraAt.t) {
          for (const k of C.extraAt.mobs) E.addEnemy(C, E.mobUnit(k, null, S.run.mult));
          C.extraAt = null;
          const tb = S.group.members.find((m) => m.role === 'tank');
          sys('Another pack joins the fight!');
          if (tb) partySay(tb, pick(['oops', 'my bad', 'extra pack sry', 'uh oh']));
          else B.post(S, 'party', null, 'extra pack!');
        }
        if (C.events.length) { emit('combat', C.events); C.events.length = 0; }
        if (C.over) { if (C.kind === 'solo') endSolo(C); else if (C.kind === 'pvp') endPvp(C); else endRunFight(C); }
      }
    }
    worldAcc += dt;
    if (worldAcc >= 1) {
      const step = worldAcc; worldAcc = 0;
      if (!G.fight) restTick(step);
      else if (S.player.travel) S.player.travel = null;
      worldTick();
      partyTick();
      ambushTick();
      runTick();
      rollsTick();
      const before = S.chat.length;
      B.chatTick(S, now());
      if (S.chat.length !== before) emit('chat');
      if (S.queue && now() >= S.queue.popAt && !S.queue.popped) { S.queue.popped = true; emit('pop', S.queue); }
      // bots keep levelling while you play
      if (now() - S.lastSim > 60000) { const news = B.advance(S, now() - S.lastSim); for (const n of news) if (n.big) sys(n.text); }
    }
    saveAcc += dt;
    if (saveAcc >= 10) { saveAcc = 0; G.save(); }
  };

  root.G = G;
})(typeof window !== 'undefined' ? window : globalThis);
