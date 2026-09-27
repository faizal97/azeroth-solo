// Azeroth Solo — combat engine. No DOM: runs in the page and in Node sims.
// A fight is a set of units on two sides. Solo play is a party of one.
(function (root) {
  const D = root.D;
  const E = {};
  const rnd = (a, b) => a + Math.random() * (b - a);
  const rint = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  E.rnd = rnd; E.rint = rint; E.clamp = clamp;
  let UID = 1;

  // ------------------------------------------------------------- character stats
  // char: {name, cls, level, equip:{slot:item}}; extra: additive stats from auras
  // ---------- talents: every talent is data (src/data/talents.js); merge a character's into one mods object
  const TM_CACHE = new Map();
  const EMPTY_TM = { stat: {}, pct: {}, crit: 0, spellCrit: 0, dodge: 0, haste: 0, school: {}, heal: 0, abilDmg: {}, abilHeal: {}, dot: {}, hot: {}, abilCost: {}, abilCd: {}, abilCast: {}, buff: {}, shield: {}, taken: 0, threat: 0, pet: 0 };
  E.talentMods = function (char) {
    const tl = char && char.talents;
    if (!tl || !D.TALENTS || !D.TALENTS[char.cls]) return EMPTY_TM;
    const sig = char.cls + JSON.stringify(tl);
    let m = TM_CACHE.get(sig);
    if (m) return m;
    m = JSON.parse(JSON.stringify(EMPTY_TM));
    for (const tree of D.TALENTS[char.cls]) for (const t of tree.talents) {
      const r = tl[t.id] || 0; if (!r) continue;
      for (const fx of t.fx) {
        const v = fx.v * r;
        if (fx.k === 'stat') m.stat[fx.stat] = (m.stat[fx.stat] || 0) + v;
        else if (fx.k === 'pct') m.pct[fx.stat] = (m.pct[fx.stat] || 0) + v;
        else if (fx.k === 'school') m.school[fx.school] = (m.school[fx.school] || 0) + v;
        else if (fx.ab) for (const a of fx.ab) m[fx.k][a] = (m[fx.k][a] || 0) + v;
        else m[fx.k] += v;
      }
    }
    if (TM_CACHE.size > 500) TM_CACHE.clear();
    TM_CACHE.set(sig, m);
    return m;
  };
  const tmOf = (u) => E.talentMods(u && (u.char || u));
  const abPct = (tbl, id) => (tbl[id] || 0) + (tbl['*'] || 0);
  E.abPct = abPct;
  // A synced character (group finder) fights at syncLevel; its gear stays, which is the overgear bonus.
  E.levelOf = (char) => (char.syncLevel ? Math.min(char.level, char.syncLevel) : char.level);
  E.statsFor = function (char, extra) {
    const C = D.CLASSES[char.cls];
    const L = E.levelOf(char);
    const s = { armor: C.baseArmor + L * 2, sp: 0, ap: 0, dodge: 0, haste: 0 };
    for (const k of ['str', 'agi', 'sta', 'int', 'spi']) s[k] = Math.round(C.base[k] + C.gain[k] * (L - 1));
    const add = (st) => { if (st) for (const k in st) s[k] = (s[k] || 0) + st[k]; };
    let weapon = null;
    for (const slot in (char.equip || {})) {
      const it = char.equip[slot];
      if (!it) continue;
      add(it.stats);
      if (it.armor) s.armor += it.armor;
      if (it.sp) s.sp += it.sp;
      if (slot === 'weapon') weapon = it;
    }
    const ranged = (char.equip || {}).ranged;
    add(extra);
    const TM = E.talentMods(char);
    add(TM.stat);
    for (const k of ['str', 'agi', 'sta', 'int', 'spi']) if (TM.pct[k]) s[k] = Math.round(s[k] * (1 + TM.pct[k] / 100));
    if (TM.pct.armor) s.armor = Math.round(s.armor * (1 + TM.pct.armor / 100));
    s.dodge += TM.dodge; s.haste += TM.haste;
    const RP = (D.RACIALS[char.race || (char.bot && char.bot.race) || 'human'] || {}).passives || {};
    if (RP.spiPct) s.spi = Math.round(s.spi * (1 + RP.spiPct / 100));
    if (RP.intPct) s.int = Math.round(s.int * (1 + RP.intPct / 100));
    if (RP.dodge) s.dodge += RP.dodge;
    if (s.bear) { s.sta = Math.round(s.sta * 1.25); s.armor = Math.round(s.armor * 2.8); }
    s.maxHp = Math.max(20, C.baseHp + s.sta * 10 + (L - 1) * C.hpPerLvl);
    if (RP.hpPct) s.maxHp = Math.round(s.maxHp * (1 + RP.hpPct / 100));
    if (TM.pct.hp) s.maxHp = Math.round(s.maxHp * (1 + TM.pct.hp / 100));
    s.maxMana = C.resource === 'mana' ? Math.max(50, C.baseMana + s.int * 15 + (L - 1) * C.manaPerLvl) : 0;
    if (TM.pct.mana) s.maxMana = Math.round(s.maxMana * (1 + TM.pct.mana / 100));
    let ap;
    if (char.cls === 'warrior') ap = 3 * L + 2 * s.str - 20;
    else if (char.cls === 'rogue' || char.cls === 'hunter') ap = 2 * L + s.str + s.agi - 20;
    else if (char.cls === 'paladin') ap = 3 * L + 2 * s.str - 20;
    else if (char.cls === 'shaman') ap = 2 * L + 2 * s.str - 20;
    else if (char.cls === 'druid' && s.bear) ap = 3 * L + 2 * s.str - 20;
    else ap = s.str - 10;
    s.apTotal = Math.max(0, ap + s.ap);
    s.crit = 5 + s.agi / 20 + TM.crit;
    s.spellCrit = 5 + s.int / 60 + TM.spellCrit;
    s.dodgeTotal = 5 + s.agi / 20 + s.dodge;
    let w = weapon || { dmg: [1, 2], speed: 2.0 };
    if (s.bear) { const dps = 2 + L * 0.8; w = { dmg: [dps * 2.5 * 0.8, dps * 2.5 * 1.2], speed: 2.5 }; }
    s.wMin = w.dmg[0] + (s.wdmg || 0); s.wMax = w.dmg[1] + (s.wdmg || 0); s.wSpeed = w.speed;
    s.swing = w.speed / (1 + s.haste / 100);
    if (ranged && char.cls === 'hunter') {
      s.rMin = ranged.dmg[0]; s.rMax = ranged.dmg[1]; s.rSpeed = ranged.speed;
      s.rswing = ranged.speed / (1 + s.haste / 100);
      s.rap = Math.max(0, 2 * L + 2 * s.agi - 10 + s.ap);
    }
    return s;
  };

  // ------------------------------------------------------------- mob numbers
  E.mobHp = (L) => Math.round(0.85 * (28 + 14 * L + 0.6 * L * L));
  E.mobDmg = (L) => [1 + L * 1.3, 2 + L * 1.9];

  // ------------------------------------------------------------- units
  const flat = (u) => u.kind === 'mob' || u.kind === 'pet';
  E.flat = flat;
  function baseUnit(o) {
    return Object.assign({
      uid: UID++, dead: false, swingT: rnd(0.3, 1.2), castT: 0, cast: null, gcdUntil: 0, cds: {}, auras: [],
      threat: {}, target: null, cp: 0, cpTarget: null, lastCastT: -99, stunUntil: 0, auto: true, hitCount: 0,
    }, o);
  }

  // Player or bot. char carries hp/res between fights; persistent auras use epoch ms (until).
  E.charUnit = function (char, side, kind, nowMs) {
    const C = D.CLASSES[char.cls];
    const u = baseUnit({ side, kind, char, name: char.name, cls: char.cls, level: E.levelOf(char), resType: C.resource, role: char.role || C.role, race: char.race || (char.bot && char.bot.race) || 'human' });
    for (const a of (char.auras || [])) {
      const left = (a.until - nowMs) / 1000;
      if (left > 0) u.auras.push({ id: a.id, until: left, stats: a.stats, src: null, persistent: true, seal: a.seal, sealSchool: a.sealSchool, thorns: a.thorns, name: a.name, icon: a.icon });
    }
    E.recalc(u, true);
    u.hp = char.hp == null ? u.maxHp : clamp(char.hp, 1, u.maxHp);
    u.maxRes = C.resource === 'mana' ? u.st.maxMana : 100;
    if (C.resource === 'rage') u.res = clamp(char.res || 0, 0, 100);
    else if (C.resource === 'energy') u.res = 100;
    else u.res = char.res == null ? u.maxRes : clamp(char.res, 0, u.maxRes);
    return u;
  };

  E.recalc = function (u, first) {
    if (flat(u)) return;
    const extra = {};
    for (const a of u.auras) { if (a.stats) for (const k in a.stats) extra[k] = (extra[k] || 0) + a.stats[k]; if (a.bear) extra.bear = 1; }
    const oldMax = u.maxHp;
    u.st = E.statsFor(u.char, extra);
    u.maxHp = u.st.maxHp;
    if (!first && oldMax && u.maxHp > oldMax) u.hp += u.maxHp - oldMax;
    if (u.hp > u.maxHp) u.hp = u.maxHp;
    if (u.resType === 'mana') { u.maxRes = u.st.maxMana; if (u.res > u.maxRes) u.res = u.maxRes; }
  };

  // mult: {hp, dmg} from dungeon; opts.level override
  E.mobUnit = function (key, level, mult) {
    const M = D.MOBS[key];
    const L = level || rint(M.lvl[0], M.lvl[1]);
    mult = mult || { hp: 1, dmg: 1 };
    const hp = Math.round(E.mobHp(L) * (M.hpMult || 1) * mult.hp);
    const [a, b] = E.mobDmg(L);
    const dm = (M.dmgMult || 1) * mult.dmg;
    return baseUnit({
      side: 'enemy', kind: 'mob', key, name: M.name, level: L, elite: !!(M.elite || M.boss), boss: !!M.boss,
      maxHp: hp, hp, res: 0, maxRes: 0, resType: null, dmg: [a * dm, b * dm], swingSpeed: 2.0,
      armor: L * 20, dodge: 5, crit: 5, special: M.special ? { kind: M.special, t: 6, phase: 0, text: M.specialText || null, summon: M.summon || null } : null,
      swingT: rnd(1.4, 2.2),
    });
  };

  // Warlock demons fight on the player's side with a flat stat block, like mobs.
  E.petUnit = function (type, level, owner) {
    const Pd = D.PETS[type];
    const L = level;
    const hp = Math.round(E.mobHp(L) * Pd.hpMult);
    const [a, b] = E.mobDmg(L);
    const dm = Pd.dmgMult || 0.4;
    return baseUnit({
      side: 'ally', kind: 'pet', key: type, mob: owner && owner.mob, name: (owner && owner.petName) || Pd.name, level: L, owner: owner ? owner.uid : null,
      maxHp: hp, hp, res: 0, maxRes: 0, resType: null, dmg: [a * dm, b * dm], swingSpeed: 2.0,
      armor: Math.round(L * 20 * (Pd.armorMult || 1)), dodge: 5, crit: 5, noMelee: !!Pd.noMelee, threatMult: Pd.threatMult || 1,
      role: type === 'voidwalker' ? 'pettank' : 'petdps', swingT: rnd(0.6, 1.2), petT: 0.8,
    });
  };

  function petThink(C, u) {
    const Pd = D.PETS[u.key];
    const owner = C.units[u.owner];
    const tank = alive(C.allies).find((a) => a.role === 'tank');
    // attack what the owner (or the group's tank) is attacking
    const want = (owner && C.units[owner.target] && !C.units[owner.target].dead && C.units[owner.target]) || (tank && C.units[tank.target]) || alive(C.enemies)[0];
    if (!want) return;
    u.target = want.uid;
    u.petT -= 0.1;
    if (u.petT > 0) return;
    if (Pd.spell) {
      u.petT = Pd.spell.every;
      const r = Math.random() * 100;
      if (r < 5) { ev(C, { type: 'avoid', src: u.uid, tgt: want.uid, what: 'resist', ab: 'firebolt' }); return; }
      const d = rnd(Pd.spell.dmg[0], Pd.spell.dmg[1]) + Pd.spell.perLvl * u.level;
      dealDamage(C, u, want, r < 10 ? d * 1.5 : d, { school: Pd.spell.school, crit: r < 10, ab: 'firebolt' });
    } else if (Pd.torment) {
      u.petT = Pd.torment.every;
      // Torment: pull a mob that is hitting the warlock
      const onOwner = alive(C.enemies).find((e) => owner && e.target === owner.uid);
      if (onOwner) {
        const top = Math.max(0, ...Object.values(onOwner.threat));
        onOwner.threat[u.uid] = top + 5; onOwner.target = u.uid;
        ev(C, { type: 'taunt', src: u.uid, tgt: onOwner.uid, ab: 'torment' });
      }
    }
  }

  // ------------------------------------------------------------- fight
  E.fight = function (allies, enemies, opts) {
    const C = { t: 0, allies: allies.slice(), enemies: enemies.slice(), units: {}, events: [], over: null, opts: opts || {}, allyTarget: null };
    for (const u of allies.concat(enemies)) C.units[u.uid] = u;
    for (const e of enemies) for (const a of allies) e.threat[a.uid] = 0;
    // mobs open on whoever pulled (first ally) unless told otherwise
    const puller = (opts && opts.puller) || allies[0];
    for (const e of enemies) { e.threat[puller.uid] = 1; e.target = puller.uid; }
    for (const a of allies) if (!a.target && enemies[0]) a.target = enemies[0].uid;
    for (const e of enemies) if (D.MOBS[e.key] && D.MOBS[e.key].aggro && Math.random() < 0.8) say(C, e, D.MOBS[e.key].aggro, 'monster');
    return C;
  };

  function ev(C, o) { o.t = C.t; C.events.push(o); }
  function say(C, u, text, ch) { ev(C, { type: 'say', uid: u.uid, name: u.name, text, ch: ch || 'party' }); }
  E.say = say;
  const alive = (arr) => arr.filter((u) => !u.dead);
  E.alive = alive;
  const foes = (C, u) => (u.side === 'ally' ? C.enemies : C.allies);
  const friends = (C, u) => (u.side === 'ally' ? C.allies : C.enemies);

  E.addEnemy = function (C, e) {
    C.enemies.push(e); C.units[e.uid] = e;
    for (const a of C.allies) e.threat[a.uid] = 0;
    const aa = alive(C.allies);
    const pick = aa[rint(0, aa.length - 1)];
    if (pick) { e.threat[pick.uid] = 1; e.target = pick.uid; }
  };

  function auraOf(u, id) { return u.auras.find((a) => a.id === id); }
  E.auraOf = auraOf;
  function addAura(C, u, a) {
    const old = auraOf(u, a.id);
    if (old) Object.assign(old, a); else u.auras.push(a);
    if (a.stats) E.recalc(u);
  }
  function stunned(C, u) { return u.stunUntil > C.t; }
  function slowPct(u) {
    let p = 0;
    for (const a of u.auras) if (a.slow) p = Math.max(p, a.slow);
    return p;
  }

  // ------------------------------------------------------------- damage / heal
  function levelDiff(att, tgt) { return (tgt.level || 1) - (att.level || 1); }

  function dealDamage(C, src, tgt, amount, o) {
    if (tgt.dead) return 0;
    o = o || {};
    if (tgt.auras.some((a) => a.immune)) { ev(C, { type: 'avoid', src: src.uid, tgt: tgt.uid, what: 'immune', ab: o.ab || null }); return 0; }
    if (auraOf(tgt, 'hunters_mark') && (src.cls === 'hunter' || (src.kind === 'pet' && C.units[src.owner] && C.units[src.owner].cls === 'hunter'))) amount *= 1.1;
    const tRP = tgt.race && D.RACIALS[tgt.race] && D.RACIALS[tgt.race].passives;
    if (tRP && tRP.resist && o.school && tRP.resist[o.school]) amount *= 1 - tRP.resist[o.school] / 100;
    const sRP = src.race && D.RACIALS[src.race] && D.RACIALS[src.race].passives;
    if (sRP && sRP.beastPct && tgt.kind === 'mob' && D.MOBS[tgt.key] && D.MOBS[tgt.key].family === 'beast') amount *= 1 + sRP.beastPct / 100;
    if (src.kind === 'pet' && C.units[src.owner] && C.units[src.owner].race === 'orc') amount *= 1.05;
    // talents: school and ability damage for the attacker, damage taken for the target
    if (src.char) { const sm = tmOf(src); amount *= 1 + ((sm.school[o.school || 'physical'] || 0) + (o.ab ? sm.abilDmg[o.ab] || 0 : 0)) / 100; }
    if (tgt.char) { const tt = tmOf(tgt); if (tt.taken) amount *= 1 - tt.taken / 100; }
    let dmg = Math.max(1, Math.round(amount));
    if (o.school === 'physical' || !o.school) {
      const armor = flat(tgt) ? tgt.armor : tgt.st.armor;
      const dr = clamp(armor / (armor + 400 + 85 * (src.level || 1)), 0, 0.75);
      dmg = Math.max(1, Math.round(dmg * (1 - dr)));
    }
    let absorbed = 0;
    const sh = auraOf(tgt, 'pw_shield');
    if (sh && sh.absorb > 0) {
      absorbed = Math.min(sh.absorb, dmg); sh.absorb -= absorbed; dmg -= absorbed;
      if (sh.absorb <= 0) tgt.auras = tgt.auras.filter((a) => a !== sh);
    }
    tgt.hp -= dmg;
    // threat
    if (tgt.side === 'enemy') {
      let mult = o.threat || 1;
      if (src.role === 'tank') mult *= 1.9;
      if (src.threatMult) mult *= src.threatMult;
      if (src.char) { const st = tmOf(src).threat; if (st) mult *= 1 + st / 100; }
      tgt.threat[src.uid] = (tgt.threat[src.uid] || 0) + (dmg + absorbed) * mult;
    }
    // rage
    const c = 0.0091107836 * src.level * src.level + 3.225598133 * src.level + 4.2652911;
    if (src.resType === 'rage' && o.melee) src.res = Math.min(100, src.res + (dmg * 7.5) / c);
    if (tgt.resType === 'rage') {
      const ct = 0.0091107836 * tgt.level * tgt.level + 3.225598133 * tgt.level + 4.2652911;
      tgt.res = Math.min(100, tgt.res + (dmg * 2.5) / ct);
    }
    // cast pushback
    if (tgt.cast && !tgt.cast.channel && dmg > 0 && tgt.cast.pushed < 2) { tgt.cast.end += 0.35; tgt.cast.pushed++; }
    ev(C, { type: 'dmg', src: src.uid, tgt: tgt.uid, amount: dmg, absorbed, crit: !!o.crit, school: o.school || 'physical', ab: o.ab || null });
    if (tgt.hp <= 0) kill(C, tgt, src);
    return dmg;
  }

  function heal(C, src, tgt, amount, o) {
    if (tgt.dead) return 0;
    if (src && src.char) { const hm = tmOf(src); amount *= 1 + (hm.heal + (o && o.ab ? hm.abilHeal[o.ab] || 0 : 0)) / 100; }
    const before = tgt.hp;
    tgt.hp = Math.min(tgt.maxHp, tgt.hp + Math.round(amount));
    const done = tgt.hp - before;
    // heal threat, split across enemies fighting
    const en = alive(foes(C, src));
    if (en.length && src.side === 'ally') {
      const per = (done * 0.5) / en.length;
      for (const e of en) e.threat[src.uid] = (e.threat[src.uid] || 0) + per;
    }
    ev(C, { type: 'heal', src: src.uid, tgt: tgt.uid, amount: done, over: Math.round(amount) - done, crit: !!(o && o.crit), ab: o && o.ab });
    return done;
  }

  function kill(C, u, by) {
    u.dead = true; u.hp = 0; u.cast = null; u.auras = [];
    ev(C, { type: 'die', uid: u.uid, by: by && by.uid });
    if (u.side === 'enemy') {
      for (const e of C.enemies) delete e.threat[u.uid];
    } else {
      for (const e of C.enemies) { delete e.threat[u.uid]; if (e.target === u.uid) e.target = null; }
    }
  }

  // Melee swing (auto-attack or weapon ability)
  function meleeRoll(C, src, tgt) {
    const r = Math.random() * 100;
    const miss = 5 + Math.max(0, levelDiff(src, tgt)) * 1;
    const dodge = flat(tgt) ? tgt.dodge : tgt.st.dodgeTotal;
    const crit = flat(src) ? src.crit : src.st.crit;
    if (r < miss) return 'miss';
    if (r < miss + dodge) return 'dodge';
    if (r < miss + dodge + crit) return 'crit';
    return 'hit';
  }

  function weaponDamage(u) {
    if (flat(u)) return rnd(u.dmg[0], u.dmg[1]);
    return rnd(u.st.wMin, u.st.wMax) + (u.st.apTotal / 14) * u.st.wSpeed;
  }

  function swing(C, src, tgt, o) {
    o = o || {};
    const res = meleeRoll(C, src, tgt);
    if (res === 'miss' || res === 'dodge') {
      ev(C, { type: 'avoid', src: src.uid, tgt: tgt.uid, what: res, ab: o.ab || null });
      if (tgt.side === 'enemy') tgt.threat[src.uid] = (tgt.threat[src.uid] || 0) + 1;
      return 0;
    }
    let dmg = o.ranged ? rnd(src.st.rMin, src.st.rMax) + (src.st.rap / 14) * src.st.rSpeed : weaponDamage(src) + (o.bonus || 0);
    if (src.kind === 'mob' && src.enrage) dmg *= src.enrage;
    if (res === 'crit') dmg *= 2;
    const done = dealDamage(C, src, tgt, dmg, { school: 'physical', crit: res === 'crit', ab: o.ab || (o.ranged ? 'auto_shot' : null), threat: o.threat, melee: !o.ranged });
    const seal = !flat(src) && !o.ranged && src.auras.find((a) => a.seal);
    if (seal && !tgt.dead) dealDamage(C, src, tgt, seal.seal * rnd(0.9, 1.1) + src.st.sp * 0.1, { school: seal.sealSchool || 'holy', ab: seal.id === 'seal' ? 'seal_righteousness' : 'rockbiter_weapon' });
    const th = !o.ranged && tgt.auras.find((a) => a.thorns && a.thorns.charges > 0);
    if (th && !src.dead) {
      dealDamage(C, tgt, src, th.thorns.dmg, { school: 'nature', ab: 'lightning_shield' });
      th.thorns.charges--; if (th.thorns.charges <= 0) tgt.auras = tgt.auras.filter((a) => a !== th);
    }
    // frost armor chills attackers
    if (tgt.kind !== 'mob' && auraOf(tgt, 'frost_armor') && src.kind === 'mob' && !src.boss) addAura(C, src, { id: 'chilled', until: C.t + 5, slow: 25 });
    return done;
  }

  // ------------------------------------------------------------- abilities
  function abCost(ab, u) { if (ab.shapeshift && u.form) return 0; const base = (ab.cost || 0) + (ab.costPerLvl || 0) * ((u.level || E.levelOf(u)) - 1); const off = ab.id ? Math.min(90, abPct(tmOf(u).abilCost, ab.id)) : 0; return Math.round(base * (1 - off / 100)); }
  E.abCost = abCost;

  function spellRoll(src, tgt) {
    const r = Math.random() * 100;
    const miss = 4 + Math.max(0, levelDiff(src, tgt)) * 1.5;
    if (r < miss) return 'miss';
    if (r < miss + src.st.spellCrit) return 'crit';
    return 'hit';
  }

  // Returns null if usable, else a short reason string.
  E.canUse = function (C, u, abId, tgt) {
    const ab = D.ABILITIES[abId];
    if (!ab) return 'Unknown';
    if (u.dead) return 'You are dead';
    if (stunned(C, u) && !ab.freeOf) return 'Stunned';
    if (u.cast) return 'Busy';
    if (ab.gcd !== false && u.gcdUntil > C.t) return 'Not ready';
    if ((u.cds[abId] || 0) > C.t) return 'Not ready yet';
    if (abCost(ab, u) > u.res + 0.001) return u.resType === 'rage' ? 'Not enough rage' : u.resType === 'energy' ? 'Not enough energy' : 'Not enough mana';
    if (ab.finisher && (u.cp <= 0 || (ab.target === 'enemy' && u.cpTarget !== (tgt && tgt.uid)))) return 'No combo points';
    if (ab.form && u.form !== ab.form) return 'Requires Bear Form';
    if (u.form && !ab.form && !ab.shapeshift) return 'Not while in Bear Form';
    if (ab.needSeal && !auraOf(u, 'seal')) return 'No seal active';
    if (ab.lifetap && u.hp <= ab.lifetap.base + ab.lifetap.perLvl * u.level + 1) return 'Not enough health';
    if (ab.opener && (C.t > 3 || (tgt && tgt.hitBy && tgt.hitBy[u.uid]))) return 'Already in combat';
    if (ab.target === 'enemy' && (!tgt || tgt.dead || tgt.side === u.side)) return 'No target';
    if (ab.target === 'ally' && (!tgt || tgt.dead || tgt.side !== u.side)) return 'Invalid target';
    if (abId === 'pw_shield' && tgt && auraOf(tgt, 'weakened_soul')) return 'Weakened Soul';
    return null;
  };

  E.use = function (C, u, abId, tgtUid) {
    const ab = D.ABILITIES[abId];
    let tgt = tgtUid != null ? C.units[tgtUid] : null;
    if (ab.target === 'self' || ab.target === 'party' || ab.target === 'aoe') tgt = u;
    if (ab.target === 'ally' && !tgt) tgt = u;
    const why = E.canUse(C, u, abId, ab.target === 'self' || ab.target === 'party' || ab.target === 'aoe' ? u : tgt);
    if (why) return why;
    if (ab.gcd !== false) u.gcdUntil = C.t + (ab.gcdLen || 1.5);
    if (ab.cast) {
      const castT = Math.max(0.5, ab.cast - (tmOf(u).abilCast[abId] || 0)) / (1 + ((u.st && u.st.haste) || 0) / 100);
      u.cast = { ab: abId, tgt: tgt.uid, start: C.t, end: C.t + castT, channel: ab.channel || 0, ticks: 0, pushed: 0 };
      ev(C, { type: 'castStart', src: u.uid, ab: abId, tgt: tgt.uid, dur: castT });
      return null;
    }
    resolve(C, u, abId, tgt);
    return null;
  };

  function scaled(base, perLvl, L) {
    return rnd(base[0], base[1]) + (perLvl || 0) * L;
  }

  function resolve(C, u, abId, tgt) {
    const ab = D.ABILITIES[abId];
    const L = u.level;
    u.res -= abCost(ab, u);
    if (ab.cd) u.cds[abId] = C.t + Math.max(1, ab.cd - (tmOf(u).abilCd[abId] || 0));
    if (u.resType === 'mana' && abCost(ab, u) > 0) u.lastCastT = C.t;
    ev(C, { type: 'ability', src: u.uid, ab: abId, tgt: tgt && tgt.uid });
    if (tgt && tgt.side !== u.side) { tgt.hitBy = tgt.hitBy || {}; tgt.hitBy[u.uid] = true; if (u.side === 'ally') u.target = tgt.uid; }

    if (ab.taunt) {
      const top = Math.max(0, ...Object.values(tgt.threat));
      tgt.threat[u.uid] = top + 1; tgt.target = u.uid; tgt.tauntUntil = C.t + 3;
      ev(C, { type: 'taunt', src: u.uid, tgt: tgt.uid });
    }
    if (ab.rage) u.res = Math.min(100, u.res + ab.rage);
    if (ab.stun && tgt && !tgt.boss) { tgt.stunUntil = C.t + ab.stun; ev(C, { type: 'stun', tgt: tgt.uid, dur: ab.stun }); }

    const targets = ab.target === 'aoe' ? alive(foes(C, u)) : tgt ? [tgt] : [];
    if (ab.dmg) {
      for (const t of targets) {
        if (ab.dmg.weapon) {
          swing(C, u, t, { bonus: rnd(ab.dmg.bonus[0], ab.dmg.bonus[1]) + (ab.dmg.perLvl || 0) * L, ab: abId, threat: ab.threat });
        } else if (ab.dmg.perCp) {
          const cps = u.cp;
          const d = cps * rnd(ab.dmg.perCp[0], ab.dmg.perCp[1]) + ab.dmg.perLvl * L + u.st.apTotal * ab.dmg.apCoef * cps;
          const r = meleeRoll(C, u, t);
          if (r === 'miss' || r === 'dodge') ev(C, { type: 'avoid', src: u.uid, tgt: t.uid, what: r, ab: abId });
          else dealDamage(C, u, t, r === 'crit' ? d * 2 : d, { school: 'physical', crit: r === 'crit', ab: abId, melee: true });
        } else {
          const phys = ab.dmg.school === 'physical';
          const r = phys ? meleeRoll(C, u, t) : spellRoll(u, t);
          const base = scaled(ab.dmg.base, ab.dmg.perLvl, L) + (ab.dmg.coef || 0) * u.st.sp + (ab.dmg.rapCoef || 0) * (u.st.rap || 0);
          if (r === 'miss' || r === 'dodge') { ev(C, { type: 'avoid', src: u.uid, tgt: t.uid, what: r === 'miss' && !phys ? 'resist' : r, ab: abId }); continue; }
          const crit = r === 'crit';
          dealDamage(C, u, t, crit ? base * (phys ? 2 : 1.5) : base, { school: ab.dmg.school, crit, ab: abId, threat: ab.threat, melee: phys });
          if (ab.slow && !t.dead) addAura(C, t, { id: abId + '_slow', until: C.t + ab.slow.dur, slow: ab.slow.pct });
        }
      }
    }
    if (ab.slow && !ab.dmg && tgt && !tgt.dead) addAura(C, tgt, { id: abId + '_slow', until: C.t + ab.slow.dur, slow: ab.slow.pct });
    if (ab.debuff && tgt && !tgt.dead) addAura(C, tgt, { id: ab.debuff.id, until: C.t + ab.debuff.dur });
    if (ab.shapeshift) { if (u.form) E.shiftOut(C, u); else E.shiftIn(C, u, ab.shapeshift); }
    if (ab.cp && tgt) {
      if (u.cpTarget !== tgt.uid) u.cp = 0;
      u.cpTarget = tgt.uid; u.cp = Math.min(5, u.cp + ab.cp);
    }
    if (ab.dot && tgt && !tgt.dead) {
      const per = (ab.dot.dmg + ab.dot.perLvl * L + (ab.dot.coef || 0) * u.st.sp) * (1 + (tmOf(u).dot[abId] || 0) / 100);
      addAura(C, tgt, { id: ab.dot.id, until: C.t + ab.dot.ticks * ab.dot.every, every: ab.dot.every, next: C.t + ab.dot.every, dot: per, school: ab.dot.school, src: u.uid, ab: abId });
    }
    if (ab.hot && tgt) {
      const per = (ab.hot.heal + ab.hot.perLvl * L + (ab.hot.coef || 0) * u.st.sp) * (1 + (tmOf(u).hot[abId] || 0) / 100);
      addAura(C, tgt, { id: ab.hot.id, until: C.t + ab.hot.ticks * ab.hot.every, every: ab.hot.every, next: C.t + ab.hot.every, hot: per, src: u.uid, ab: abId });
    }
    if (ab.heal && tgt) {
      const crit = Math.random() * 100 < u.st.spellCrit;
      const amt = scaled(ab.heal.base, ab.heal.perLvl, L) + (ab.heal.coef || 0) * u.st.sp;
      heal(C, u, tgt, crit ? amt * 1.5 : amt, { crit, ab: abId });
    }
    if (ab.shield && tgt) {
      const amt = Math.round((ab.shield.base + ab.shield.perLvl * L + ab.shield.coef * u.st.sp) * (1 + (tmOf(u).shield[abId] || 0) / 100));
      // every absorb lives in one 'pw_shield' aura (the damage code reads that id); it shows the name and icon of what cast it
      const own = abId !== 'pw_shield' ? { name: ab.name, icon: abId } : { name: null, icon: null };
      addAura(C, tgt, Object.assign({ id: 'pw_shield', until: C.t + ab.shield.dur, absorb: amt }, own));
      if (ab.weakened) addAura(C, tgt, { id: 'weakened_soul', until: C.t + ab.weakened });
      // shield threat counts like a heal
      for (const e of alive(foes(C, u))) e.threat[u.uid] = (e.threat[u.uid] || 0) + (amt * 0.5) / Math.max(1, alive(foes(C, u)).length);
    }
    if (ab.buff) {
      const b = ab.buff;
      const stats = {};
      const bp = 1 + (tmOf(u).buff[abId] || 0) / 100;
      for (const k in (b.stats || {})) stats[k] = Math.round((b.stats[k] + ((b.perLvl && b.perLvl[k]) || 0) * L) * bp * 10) / 10;
      let dur = b.dur;
      if (ab.finisher) dur += (b.perCpDur || 0) * u.cp;
      const who = ab.target === 'party' ? alive(friends(C, u)) : [u];
      const extra = {};
      if (b.seal) { extra.seal = (b.seal.base + b.seal.perLvl * L) * (u.st.wSpeed / 2.5) * bp; extra.sealSchool = b.seal.school || 'holy'; }
      if (b.thorns) extra.thorns = { dmg: Math.round((b.thorns.base + b.thorns.perLvl * L) * bp), charges: b.thorns.charges };
      if (b.immune) extra.immune = true;
      for (const w of who) addAura(C, w, Object.assign({ id: b.id, until: C.t + dur, stats: Object.keys(stats).length ? stats : null, persistent: dur >= 60 }, extra));
      if (ab.threat) for (const e of alive(foes(C, u))) e.threat[u.uid] = (e.threat[u.uid] || 0) + ab.threat;
    }
    if (ab.finisher) { u.cp = 0; u.cpTarget = null; }
    if (ab.needSeal) u.auras = u.auras.filter((a) => a.id !== 'seal');
    if (ab.freeOf) { u.stunUntil = 0; u.auras = u.auras.filter((a) => !a.slow); }
    if (ab.stunImmune) u.stunImmuneUntil = C.t + ab.stunImmune;
    if (ab.stompAll) { for (const e of alive(foes(C, u))) if (!e.boss) { e.stunUntil = C.t + ab.stompAll; ev(C, { type: 'stun', tgt: e.uid, dur: ab.stompAll }); } ev(C, { type: 'emote', uid: u.uid, text: `${u.name} stomps the ground!` }); }
    if (ab.cleanse) u.auras = u.auras.filter((a) => !(a.dot != null && a.src !== u.uid));
    if (ab.dropThreat) {
      const others = alive(friends(C, u)).filter((a) => a !== u);
      for (const e of alive(foes(C, u))) {
        e.threat[u.uid] = 0;
        if (e.target === u.uid) { e.target = null; if (!others.length) e.stunUntil = C.t + 2.5; }
      }
    }
    if (ab.bloodFury) addAura(C, u, { id: 'blood_fury', until: C.t + 15, stats: { ap: Math.round(u.st.apTotal * 0.25) } });
    if (ab.berserk) addAura(C, u, { id: 'berserking', until: C.t + 10, stats: { haste: Math.round(10 + 20 * (1 - u.hp / u.maxHp)) } });
    if (ab.lifetap) {
      const amt = Math.round(ab.lifetap.base + ab.lifetap.perLvl * L);
      u.hp = Math.max(1, u.hp - amt); u.res = Math.min(u.maxRes, u.res + amt);
      ev(C, { type: 'lifetap', src: u.uid, amount: amt });
    }
  }

  // ------------------------------------------------------------- druid forms
  E.shiftIn = function (C, u, form) {
    u.savedMana = u.res; u.form = form; u.resType = 'rage'; u.res = 0; u.maxRes = 100;
    const hpPct = u.hp / u.maxHp;
    addAura(C, u, { id: 'bear_form', until: C.t + 1e6, bear: true, stats: {} });
    u.hp = Math.max(u.hp, Math.round(u.maxHp * hpPct));
    ev(C, { type: 'shift', src: u.uid, form });
  };
  E.shiftOut = function (C, u) {
    const hpPct = u.hp / u.maxHp;
    u.form = null; u.auras = u.auras.filter((a) => a.id !== 'bear_form');
    u.resType = 'mana'; E.recalc(u);
    u.maxRes = u.st.maxMana; u.res = Math.min(u.savedMana || 0, u.maxRes);
    u.hp = Math.max(1, Math.round(u.maxHp * hpPct));
    ev(C, { type: 'shift', src: u.uid, form: null });
  };

  // ------------------------------------------------------------- mob specials
  function specials(C, m, dt) {
    const sp = m.special;
    if (!sp || m.dead || stunned(C, m)) return;
    sp.t -= dt;
    const tgt = C.units[m.target];
    const pct = m.hp / m.maxHp;
    const allies = alive(C.allies);
    if (sp.kind === 'smite') {
      if (sp.phase === 0 && pct < 0.66) { sp.phase = 1; stomp(C, m, 'Mr. Smite stomps the deck!'); say(C, m, 'You landlubbers are tougher than I thought! I\'ll have to improvise!', 'monster'); }
      if (sp.phase === 1 && pct < 0.5) { sp.phase = 2; m.enrage = 1.35; ev(C, { type: 'emote', uid: m.uid, text: 'Mr. Smite draws his hammer.' }); }
      if (sp.phase === 2 && pct < 0.33) { sp.phase = 3; stomp(C, m, 'Mr. Smite stomps the deck!'); say(C, m, 'D\'ah! Now you\'re making me angry!', 'monster'); }
      return;
    }
    if (sp.kind === 'arugal') {
      // calls a worgen at half health; a shadow bolt at someone every 12 sec
      if (sp.phase < 1 && pct < 0.5) {
        sp.phase++; say(C, m, 'You, too, shall serve!', 'monster');
        E.addEnemy(C, E.mobUnit('shadowfang_moonwalker', m.level - 2, (C.opts.dungeonMult || { hp: 1, dmg: 1 })));
      }
      if (sp.t <= 0) {
        sp.t = 12; const a = allies[rint(0, allies.length - 1)];
        if (a) { ev(C, { type: 'emote', uid: m.uid, text: 'Arugal hurls a bolt of shadow!' }); dealDamage(C, m, a, rnd(m.dmg[0], m.dmg[1]) * 0.9, { school: 'shadow', ab: 'shadow_bolt' }); }
      }
      return;
    }
    if (sp.kind === 'kelris') {
      // one add at half health (the boss's `summon` mob)
      if (sp.phase === 0 && pct < 0.5) {
        sp.phase = 1; if (sp.text) ev(C, { type: 'emote', uid: m.uid, text: sp.text }); else say(C, m, 'Sleep... and dream of the old gods!', 'monster');
        E.addEnemy(C, E.mobUnit(sp.summon || 'twilight_acolyte', m.level - 2, (C.opts.dungeonMult || { hp: 1, dmg: 1 })));
      }
      return;
    }
    if (sp.kind === 'thermaplugg') {
      // a leper gnome joins at 66% and at 33%
      if (sp.phase < 2 && pct < (sp.phase === 0 ? 0.66 : 0.33)) {
        sp.phase++; say(C, m, sp.phase === 1 ? 'Usurpers! Gnomeregan is mine!' : 'My machines are the future!', 'monster');
        E.addEnemy(C, E.mobUnit('gnomeregan_leper', m.level - 2, (C.opts.dungeonMult || { hp: 1, dmg: 1 })));
      }
      return;
    }
    if (sp.kind === 'thredd') {
      if (sp.phase === 0 && pct < 0.5) {
        sp.phase = 1; say(C, m, 'To me, brothers! Show them what the Stockade taught us!', 'monster');
        for (let i = 0; i < 2; i++) E.addEnemy(C, E.mobUnit('defias_insurgent', m.level - 1, (C.opts.dungeonMult || { hp: 1, dmg: 1 })));
      }
      return;
    }
    if (sp.kind === 'vancleef') {
      if (sp.phase === 0 && pct < 0.5) {
        sp.phase = 1; say(C, m, 'Lapdogs, all of you!', 'monster');
        for (let i = 0; i < 2; i++) E.addEnemy(C, E.mobUnit('blackguard', 11, (C.opts.dungeonMult || { hp: 1, dmg: 1 })));
      }
      if (sp.t <= 0 && tgt) { sp.t = 12; say(C, m, 'The Brotherhood shall prevail!', 'monster'); }
      return;
    }
    if (sp.t > 0) return;
    if (sp.kind === 'slam' || sp.kind === 'hogger') {
      sp.t = sp.kind === 'hogger' ? 9 : 8;
      if (tgt && !tgt.dead) {
        ev(C, { type: 'emote', uid: m.uid, text: sp.text || (sp.kind === 'hogger' ? `${m.name} lunges!` : `${m.name} slams the ground!`) });
        dealDamage(C, m, tgt, rnd(m.dmg[0], m.dmg[1]) * 2.1, { school: 'physical', ab: 'slam' });
      }
    } else if (sp.kind === 'whirl') {
      sp.t = 12;
      ev(C, { type: 'emote', uid: m.uid, text: sp.text || `${m.name === 'XT:9' ? 'XT:9' : 'The Shredder'} whirls its saw blades!` });
      for (const a of allies) dealDamage(C, m, a, rnd(m.dmg[0], m.dmg[1]) * 0.7, { school: 'physical', ab: 'whirl' });
    } else if (sp.kind === 'molten') {
      sp.t = 10;
      const a = allies[rint(0, allies.length - 1)];
      if (a) { ev(C, { type: 'emote', uid: m.uid, text: sp.text || `${m.name} splashes molten metal!` }); dealDamage(C, m, a, rnd(m.dmg[0], m.dmg[1]) * 1.4, { school: 'fire', ab: 'molten' }); }
    } else if (sp.kind === 'cook') {
      sp.t = 15;
      ev(C, { type: 'emote', uid: m.uid, text: sp.text || 'Cookie eats some of his cooking.' });
      heal(C, m, m, m.maxHp * 0.08, {});
    }
  }
  function stomp(C, m, text) {
    ev(C, { type: 'emote', uid: m.uid, text });
    for (const a of alive(C.allies)) { if ((a.stunImmuneUntil || 0) > C.t) continue; a.stunUntil = C.t + (a.race === 'orc' ? 1.5 : 2); a.cast = null; }
  }

  // ------------------------------------------------------------- AI
  function pickMobTarget(C, m) {
    if (m.tauntUntil && m.tauntUntil > C.t && C.units[m.target] && !C.units[m.target].dead) return;
    let best = null, bestV = -1;
    for (const uid in m.threat) {
      const u = C.units[uid];
      if (!u || u.dead) continue;
      if (m.threat[uid] > bestV) { bestV = m.threat[uid]; best = u; }
    }
    const cur = C.units[m.target];
    if (!best) { m.target = null; return; }
    if (!cur || cur.dead) { m.target = best.uid; return; }
    if (best !== cur && bestV > (m.threat[cur.uid] || 0) * 1.1) {
      m.target = best.uid;
      ev(C, { type: 'aggro', uid: m.uid, tgt: best.uid });
    }
  }

  function focusTarget(C, u) {
    // works for either side: 'u' is the unit asking (an ally by default)
    const mine = u ? friends(C, u) : C.allies, theirs = u ? foes(C, u) : C.enemies;
    // kill order marks come first: skull, then cross
    const marked = alive(theirs).filter((x) => x.mark).sort((x, y) => (x.mark === 'skull' ? 0 : 1) - (y.mark === 'skull' ? 0 : 1));
    if (marked.length) return marked[0];
    const tank = alive(mine).find((x) => x.role === 'tank');
    const t = tank && C.units[tank.target];
    if (t && !t.dead) return t;
    const en = alive(theirs);
    return en.sort((a, b) => a.hp - b.hp)[0] || null;
  }
  E.focusTarget = focusTarget;

  function botThink(C, u) {
    if (u.dead || u.cast) return;
    if (stunned(C, u)) { const rac = u.race && D.RACIALS[u.race] && D.RACIALS[u.race].active; if (rac && D.ABILITIES[rac].freeOf && Math.random() < 0.3) E.use(C, u, rac); return; }
    const b = u.bot || {};
    if (u.nextThink > C.t) return;
    u.nextThink = C.t + (b.react || 0.6);
    if (b.afkUntil && b.afkUntil > C.t) return;
    const en = alive(foes(C, u));
    if (!en.length) return;
    const try_ = (id, tgt) => E.use(C, u, id, tgt && tgt.uid) === null;
    const rac = u.race && D.RACIALS[u.race] && D.RACIALS[u.race].active;
    if (rac && Math.random() < 0.08 * (b.skill || 0.5)) {
      const rA = D.ABILITIES[rac];
      const hurt = u.hp / u.maxHp < 0.4;
      if ((rA.bloodFury || rA.berserk) || (rA.stompAll && en.length >= 2) || (hurt && (rA.cleanse || rA.dropThreat)) || (u.stunUntil > C.t && rA.freeOf)) { if (try_(rac)) return; }
    }
    const has = (id) => D.CLASSES[u.cls].abilities.includes(id) && D.ABILITIES[id].lvl <= u.level;

    if (u.role === 'healer') {
      const allies = alive(friends(C, u));
      const low = allies.slice().sort((a, b2) => a.hp / a.maxHp - b2.hp / b2.maxHp)[0];
      const thr = 0.5 + 0.3 * (b.skill || 0.5);
      const tank = allies.find((a) => a.role === 'tank') || allies[0];
      if (low && low.hp / low.maxHp < thr && has('lesser_heal') && try_('lesser_heal', low)) return;
      if (low && low.hp / low.maxHp < thr && has('holy_light') && try_('holy_light', low)) return;
      if (low && low.hp / low.maxHp < thr && has('healing_touch') && try_('healing_touch', low)) return;
      if (low && low.hp / low.maxHp < thr && has('healing_wave') && try_('healing_wave', low)) return;
      if (u.cls === 'shaman') {
        if (tank && has('stoneskin_totem') && !auraOf(tank, 'stoneskin') && try_('stoneskin_totem')) return;
        if (u.res / u.maxRes > 0.7 && Math.random() < 0.4) { const f = focusTarget(C, u); if (f) try_('lightning_bolt', f); }
        return;
      }
      if (tank && tank.hp / tank.maxHp < 0.85 && has('rejuvenation') && !auraOf(tank, 'rejuvenation') && try_('rejuvenation', tank)) return;
      if (u.cls === 'druid') {
        if (has('mark_wild') && !auraOf(u, 'mark_wild') && try_('mark_wild')) return;
        if (u.res / u.maxRes > 0.7 && Math.random() < 0.4) { const f = focusTarget(C, u); if (f && has('moonfire') && !auraOf(f, 'moonfire') && try_('moonfire', f)) return; if (f) try_('wrath', f); }
        return;
      }
      if (u.cls === 'paladin') {
        if (has('devotion_aura') && !auraOf(u, 'devotion_aura') && try_('devotion_aura')) return;
        if (!auraOf(u, 'seal') && u.res / u.maxRes > 0.6 && try_('seal_righteousness')) return;
        return;
      }
      if (tank && tank.hp / tank.maxHp < 0.9 && has('pw_shield') && !auraOf(tank, 'weakened_soul') && try_('pw_shield', tank)) return;
      if (tank && tank.hp / tank.maxHp < 0.8 && has('renew') && !auraOf(tank, 'renew') && try_('renew', tank)) return;
      if (u.res / u.maxRes > 0.7 && Math.random() < 0.5) {
        const f = focusTarget(C, u);
        if (f && has('sw_pain') && !auraOf(f, 'sw_pain') && try_('sw_pain', f)) return;
        if (f && try_('smite', f)) return;
      }
      return;
    }
    let tgt;
    if (u.role === 'tank') {
      // grab loose mobs
      const loose = en.find((e) => e.target && e.target !== u.uid && C.units[e.target] && C.units[e.target].role !== 'tank');
      if (loose && has('taunt') && Math.random() < 0.4 + 0.6 * (b.skill || 0.5) && try_('taunt', loose)) return;
      if (loose && Math.random() < 0.5) u.target = loose.uid;
      // with a kill order, the tank holds the skull so the group's damage lands where it has threat
      const skull = en.find((e) => e.mark === 'skull');
      if (skull && !loose) u.target = skull.uid;
      tgt = C.units[u.target];
      if (!tgt || tgt.dead) { tgt = skull || en[0]; u.target = tgt.uid; }
      if (u.cls === 'druid') {
        if (!u.form && has('bear_form') && try_('bear_form')) return;
        if (u.form === 'bear') {
          if (loose && try_('growl', loose)) return;
          if (u.res >= 20) try_('maul', tgt);
        } else try_('wrath', tgt);
        return;
      }
      if (u.cls === 'paladin') {
        if (has('devotion_aura') && !auraOf(u, 'devotion_aura') && try_('devotion_aura')) return;
        if (!auraOf(u, 'seal') && try_('seal_righteousness')) return;
        if (has('judgement') && try_('judgement', tgt)) return;
        if (u.hp / u.maxHp < 0.25 && has('divine_protection') && try_('divine_protection')) return;
        if (loose && has('hammer_justice') && try_('hammer_justice', loose)) return;
        return;
      }
      if (en.length >= 2 && has('thunder_clap') && try_('thunder_clap')) return;
      if (has('rend') && !auraOf(tgt, 'rend') && tgt.hp > tgt.maxHp * 0.3 && try_('rend', tgt)) return;
      if (u.res >= 20 && try_('heroic_strike', tgt)) return;
      if (has('battle_shout') && !auraOf(u, 'battle_shout') && try_('battle_shout')) return;
      return;
    }
    // dps
    tgt = focusTarget(C, u);
    if ((b.skill || 0.5) < 0.35 && Math.random() < 0.25) tgt = en[rint(0, en.length - 1)];
    if (!tgt) return;
    u.target = tgt.uid;
    // careful players ease off when they're about to pull aggro
    const tankU = alive(friends(C, u)).find((a) => a.role === 'tank');
    if (tankU && tgt.target === tankU.uid) {
      const mine = tgt.threat[u.uid] || 0, tk = tgt.threat[tankU.uid] || 0;
      if (mine > tk * 0.9 && Math.random() < (b.skill || 0.5)) { u.auto = false; return; }
    }
    u.auto = true;
    if (u.cls === 'mage') {
      if (has('fire_blast') && try_('fire_blast', tgt)) return;
      if (has('arcane_missiles') && u.res / u.maxRes > 0.6 && Math.random() < 0.3 && try_('arcane_missiles', tgt)) return;
      if (has('frostbolt') && Math.random() < 0.4 && try_('frostbolt', tgt)) return;
      try_('fireball', tgt);
    } else if (u.cls === 'rogue') {
      if (has('slice_and_dice') && u.cp >= 2 && !auraOf(u, 'slice_and_dice') && u.cpTarget === tgt.uid && try_('slice_and_dice')) return;
      if (u.cp >= (tgt.hp < tgt.maxHp * 0.25 ? 1 : 4) && u.cpTarget === tgt.uid && try_('eviscerate', tgt)) return;
      try_('sinister_strike', tgt);
    } else if (u.cls === 'shaman') {
      if (!u.auras.some((a) => a.seal) && try_('rockbiter_weapon')) return;
      if (has('lightning_shield') && !auraOf(u, 'lightning_shield') && try_('lightning_shield')) return;
      if (has('earth_shock') && try_('earth_shock', tgt)) return;
      if (has('searing_totem') && !auraOf(tgt, 'searing_totem') && tgt.hp > tgt.maxHp * 0.4 && try_('searing_totem', tgt)) return;
      try_('lightning_bolt', tgt);
    } else if (u.cls === 'hunter') {
      if (has('hunters_mark') && !auraOf(tgt, 'hunters_mark') && tgt.hp > tgt.maxHp * 0.4 && try_('hunters_mark', tgt)) return;
      if (has('serpent_sting') && !auraOf(tgt, 'serpent_sting') && tgt.hp > tgt.maxHp * 0.35 && try_('serpent_sting', tgt)) return;
      if (has('arcane_shot') && try_('arcane_shot', tgt)) return;
    } else if (u.cls === 'druid') {
      if (has('moonfire') && !auraOf(tgt, 'moonfire') && try_('moonfire', tgt)) return;
      try_('wrath', tgt);
    } else if (u.cls === 'warlock') {
      if (has('life_tap') && u.res / u.maxRes < 0.25 && u.hp / u.maxHp > 0.6 && try_('life_tap')) return;
      if (tgt.hp > tgt.maxHp * 0.35) {
        if (has('corruption') && !auraOf(tgt, 'corruption') && try_('corruption', tgt)) return;
        if (has('curse_of_agony') && !auraOf(tgt, 'curse_of_agony') && try_('curse_of_agony', tgt)) return;
        if (!auraOf(tgt, 'immolate') && try_('immolate', tgt)) return;
      }
      try_('shadow_bolt', tgt);
    } else if (u.cls === 'paladin') {
      if (!auraOf(u, 'seal') && try_('seal_righteousness')) return;
      if (has('judgement')) try_('judgement', tgt);
    } else if (u.cls === 'warrior') {
      if (has('rend') && !auraOf(tgt, 'rend') && try_('rend', tgt)) return;
      if (u.res >= 30) try_('heroic_strike', tgt);
    } else if (u.cls === 'priest') {
      if (has('sw_pain') && !auraOf(tgt, 'sw_pain') && try_('sw_pain', tgt)) return;
      try_('smite', tgt);
    }
  }

  // ------------------------------------------------------------- tick
  E.tick = function (C, dt) {
    if (C.over) return;
    C.t += dt;
    const all = C.allies.concat(C.enemies);
    for (const u of all) {
      if (u.dead) continue;
      // auras
      let changed = false;
      for (const a of u.auras.slice()) {
        if (a.dot != null && a.next <= C.t + 1e-6) {
          a.next += a.every;
          const src = C.units[a.src] || u;
          dealDamage(C, src, u, a.dot, { school: a.school, ab: a.ab });
          if (u.dead) break;
        }
        if (a.hot != null && a.next <= C.t + 1e-6) { a.next += a.every; heal(C, C.units[a.src] || u, u, a.hot, { ab: a.ab }); }
        if (a.until <= C.t) { u.auras.splice(u.auras.indexOf(a), 1); if (a.stats) changed = true; }
      }
      if (u.dead) continue;
      if (changed) E.recalc(u);
      if (u.race === 'troll' && u.side === 'ally' && u.hp < u.maxHp) u.hp = Math.min(u.maxHp, u.hp + u.maxHp * 0.002 * dt);
      // resources
      if (u.resType === 'energy') u.res = Math.min(100, u.res + 10 * dt);
      if (u.resType === 'mana' && C.t - u.lastCastT >= 5) u.res = Math.min(u.maxRes, u.res + ((13 + u.st.spi / 4) / 2) * dt);
      // casting
      if (u.cast) {
        if (stunned(C, u)) { u.cast = null; continue; }
        const cast = u.cast; const ab = D.ABILITIES[cast.ab]; const tgt = C.units[cast.tgt];
        if (!tgt || tgt.dead) { u.cast = null; ev(C, { type: 'castStop', src: u.uid }); continue; }
        if (cast.channel) {
          const due = Math.floor((C.t - cast.start) / (cast.channel / 3));
          if (due > cast.ticks) {
            if (cast.ticks === 0) { u.res -= abCost(ab, u); u.lastCastT = C.t; }
            cast.ticks++;
            const r = spellRoll(u, tgt);
            const base = scaled(ab.dmg.base, ab.dmg.perLvl, u.level) + ab.dmg.coef * u.st.sp;
            if (r === 'miss') ev(C, { type: 'avoid', src: u.uid, tgt: tgt.uid, what: 'resist', ab: cast.ab });
            else dealDamage(C, u, tgt, r === 'crit' ? base * 1.5 : base, { school: ab.dmg.school, crit: r === 'crit', ab: cast.ab });
          }
          if (C.t >= cast.end || cast.ticks >= 3) { u.cast = null; ev(C, { type: 'castStop', src: u.uid, done: true }); }
          continue;
        }
        if (C.t >= cast.end) {
          u.cast = null;
          if (abCost(ab, u) > u.res + 0.001) { ev(C, { type: 'castStop', src: u.uid }); continue; }
          ev(C, { type: 'castStop', src: u.uid, done: true });
          resolve(C, u, cast.ab, tgt);
        }
        continue;
      }
      if (stunned(C, u)) { if (u.kind === 'bot') botThink(C, u); continue; }
      // AI
      if (u.kind === 'mob') { pickMobTarget(C, u); specials(C, u, dt); }
      else if (u.kind === 'bot') botThink(C, u);
      else if (u.kind === 'pet') petThink(C, u);
      // auto attack
      const tgt = C.units[u.target];
      if (tgt && !tgt.dead && tgt.side !== u.side && (u.kind === 'mob' || u.auto)) {
        const shoot = u.cls === 'hunter' && u.st.rMin != null && !u.form;
        const sp = flat(u) ? u.swingSpeed : shoot ? u.st.rswing : u.st.swing;
        u.swingT -= dt * (1 - slowPct(u) / 100);
        if (u.swingT <= 0) {
          u.swingT += sp;
          if (u.noMelee) { /* casts instead */ } else if (shoot) swing(C, u, tgt, { ranged: true }); else if (flat(u) || u.cls === 'warrior' || u.cls === 'rogue' || u.cls === 'paladin' || C.t - u.lastCastT > 1.6) swing(C, u, tgt);
          if (u.side === 'ally') { tgt.hitBy = tgt.hitBy || {}; tgt.hitBy[u.uid] = true; }
        }
      } else if (u.side === 'ally' && (!tgt || tgt.dead)) {
        // retarget to something alive
        const f = alive(C.enemies)[0];
        if (f && u.kind !== 'player') u.target = f.uid;
        if (f && u.kind === 'player' && C.opts.autoRetarget !== false) u.target = f.uid;
      }
    }
    if (!alive(C.enemies).length) C.over = 'win';
    else if (!alive(C.allies).length) C.over = 'lose';
    else if (C.opts.soloUid && C.units[C.opts.soloUid].dead) C.over = 'lose';
  };

  // Copy a unit's state back onto its character after a fight (hp, res, long buffs).
  E.writeBack = function (C, u, nowMs) {
    if (u.form && !u.dead) E.shiftOut(C, u);
    const ch = u.char;
    ch.hp = u.dead ? 0 : Math.round(u.hp);
    ch.res = u.resType === 'energy' ? 100 : Math.round(u.res);
    ch.auras = u.auras.filter((a) => a.persistent && a.until > C.t).map((a) => ({ id: a.id, stats: a.stats, until: nowMs + (a.until - C.t) * 1000, seal: a.seal, sealSchool: a.sealSchool, thorns: a.thorns, name: a.name, icon: a.icon }));
  };

  root.E = E;
})(typeof window !== 'undefined' ? window : globalThis);
