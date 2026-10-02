// Item effects (v10.10, design docs/plans/2026-10-02-item-effects-design.md): a sidegrade on an item, a twist that reacts
// to what you do in a fight. The item has the normal budget for its source and pays for the effect with part of its stats
// (EFFECT_COST), so the power ceiling does not move. One shared library: an item points to an effect by key, its numbers
// scale with the item's level, and the same effect counts once. The engine reads them in E.itemEffects (src/engine.js),
// and every lookup is guarded: an unknown key is a plain item (a save from a newer build, the #17 lesson).
// Loads after the zones (it adds the items to boss loot) and before finalize.js (which derives the loot sources).
(function (root) {
  const D = root.D;
  const n = (x) => Math.round(x);
  D.EFFECT_COST = 0.3; // the share of an item's stats an effect costs by default; an effect may set its own `cost` (sim/effects.js tunes them)
  D.effectCost = (k) => ((D.EFFECTS[k] && D.EFFECTS[k].cost) != null ? D.EFFECTS[k].cost : D.EFFECT_COST);
  D.EFFECTS = {
    // damage
    opening_cut: {
      name: 'Opening Cut', role: 'damage', icon: 'ambush', k: 2.4, c: 4, cost: 0.75, // one slot's stats are a small share of a character: it pays most of them
      bonus: (L, f) => n((D.EFFECTS.opening_cut.k * L + D.EFFECTS.opening_cut.c) * (f || 1)),
      desc: (L, f) => `Your first hit on each enemy deals ${D.EFFECTS.opening_cut.bonus(L, f)} extra damage.`,
    },
    // healing
    echoing_mend: {
      name: 'Echoing Mend', role: 'healing', icon: 'chain_heal', chance: 0.35, pct: 0.35, cost: 0.3,
      desc: (L, f) => `Your direct heals have a ${n(D.EFFECTS.echoing_mend.chance * 100)}% chance to echo: ${n(D.EFFECTS.echoing_mend.pct * (f || 1) * 100)}% of the heal also lands on the most hurt other ally.`,
    },
    // tanking
    turning_guard: {
      name: 'Turning Guard', role: 'tank', icon: 'shield_block', icd: 3, dur: 6, k: 0.7, c: 4, cost: 0.4,
      absorb: (L, f) => n((D.EFFECTS.turning_guard.k * L + D.EFFECTS.turning_guard.c) * (f || 1)),
      desc: (L, f) => `When you dodge a melee attack, a guard absorbs the next ${D.EFFECTS.turning_guard.absorb(L, f)} damage within ${D.EFFECTS.turning_guard.dur} sec. At most once every ${D.EFFECTS.turning_guard.icd} sec.`,
    },
    kindled_edge: {
      name: 'Kindled Edge', role: 'damage', icon: 'immolate', k: 0.8, c: 2, dur: 6, every: 2, cost: 0.9,
      tick: (L, f) => n((D.EFFECTS.kindled_edge.k * L + D.EFFECTS.kindled_edge.c) * (f || 1)),
      desc: (L, f) => { const F = D.EFFECTS.kindled_edge; return `Your critical hits set the target smouldering: ${F.tick(L, f) * (F.dur / F.every)} Fire damage over ${F.dur} sec. A new crit refreshes it; it doesn't stack.`; },
    },
    chase_the_next: {
      name: 'Chase the Next', role: 'damage', icon: 'sprint', haste: 22, dur: 10, cost: 0.75,
      desc: (L, f) => `Each kill gives you ${n(D.EFFECTS.chase_the_next.haste * (f || 1))}% haste for ${D.EFFECTS.chase_the_next.dur} sec.`,
    },
    steady_fuse: {
      name: 'Steady Fuse', role: 'damage', icon: 'cold_blood', every: 30, cost: 0.9,
      desc: () => `Every ${D.EFFECTS.steady_fuse.every} sec in combat, your next hit is a sure critical hit.`,
    },
    glass_heart: {
      name: 'Glass Heart', role: 'damage', icon: 'blood_fury', dmg: 0.025, taken: 0.1, cost: 0, // no stat cost: the downside is the cost
      desc: () => `You deal ${n(D.EFFECTS.glass_heart.dmg * 100)}% more damage, and take ${n(D.EFFECTS.glass_heart.taken * 100)}% more.`,
    },
    // healing
    lifeline: { // replaced Brimming Cup (#22): overhealing happens in every fight, so a shield from it won everywhere
      name: 'Lifeline', role: 'healing', icon: 'flash_heal', below: 0.35, icd: 15, cost: 0.45, // the game designer's 6 sec cooldown made a level-20 priest +20 points of survival; 15 sec is in the bars (#22)
      desc: (L, f) => { const F = D.EFFECTS.lifeline; return `A direct heal on an ally below ${n(F.below * 100)}% health is a sure critical heal. At most once every ${F.icd} sec.`; },
    },
    wellspring: {
      name: 'Wellspring', role: 'healing', icon: 'innervate', refund: 0.8, cost: 0.35,
      desc: (L, f) => `Your critical heals refund ${n(D.EFFECTS.wellspring.refund * (f || 1) * 100)}% of their mana cost.`,
    },
    // tanking
    spiteful_hide: {
      name: 'Spiteful Hide', role: 'tank', icon: 'thorns', k: 0.12, c: 1, cost: 0.4,
      dmg: (L, f) => n((D.EFFECTS.spiteful_hide.k * L + D.EFFECTS.spiteful_hide.c) * (f || 1)),
      desc: (L, f) => `Enemies that hit you in melee take ${D.EFFECTS.spiteful_hide.dmg(L, f)} Nature damage.`,
    },
    // resource
    tithe_of_battle: {
      name: 'Tithe of Battle', role: 'resource', icon: 'life_tap', mana: 0.003, rage: 1, energy: 2, cost: 0.4,
      desc: (L, f) => { const F = D.EFFECTS.tithe_of_battle, g = f || 1; return `Each tick of your damage over time restores ${(F.mana * g * 100).toFixed(1)}% of your mana, ${n(F.rage * g)} rage or ${n(F.energy * g)} energy.`; },
    },
    // survival
    stubborn_blood: {
      name: 'Stubborn Blood', role: 'survival', icon: 'frenzied_regeneration', icd: 60, below: 0.3, pct: 0.06, dur: 6, cost: 0.5,
      desc: (L, f) => { const F = D.EFFECTS.stubborn_blood; return `Falling below ${n(F.below * 100)}% health heals you for ${n(F.pct * (f || 1) * 100)}% of your health over ${F.dur} sec. At most once every ${F.icd} sec.`; },
    },
  };

  // ---- the items: new ones (existing gear never changes under its owners), at the budget of their boss's other drops
  const QM = [0.8, 1, 1.1, 1.22, 1.35];
  const sum = (it) => Object.values(it.stats || {}).reduce((a, b) => a + b, 0);
  function effectItem(id, boss, o) {
    const M = D.MOBS[boss]; if (!M || !D.EFFECTS[o.effect]) return;
    const it = Object.assign({ lvl: M.lvl[0], effect: o.effect }, o), L = it.lvl;
    it.q = it.q || 3; if (!it.atype) delete it.atype; // the fx() rows pass every key, so an unset one must not wipe a default
    // the budget of an item like it: same slot, armour or weapon type and quality, within 3 levels (gear sizes its stats
    // by family, so a wrist is paid like a wrist, not like its boss's chest); no such item: the boss's other drops
    const fam = (x) => x.slot === it.slot && (x.wtype || x.atype || '') === (it.wtype || it.atype || '') && !x.sp && x.q === it.q;
    const like = Object.values(D.ITEMS).filter((x) => x && !x.effect && !x.heirloom && !x.lookOnly && x.stats && sum(x) > 0 && fam(x) && Math.abs((x.lvl || 1) - L) <= 3);
    const sibs = like.length ? like : (M.loot || []).map((k) => D.ITEMS[k]).filter((x) => x && x.stats && sum(x) > 0);
    const full = sibs.length ? sibs.reduce((a, x) => a + sum(x), 0) / sibs.length : L * 0.55 + 2;
    const budget = Math.max(1, n(full * (1 - D.effectCost(o.effect)))), ks = it.st; it.stats = {}; let left = budget;
    ks.forEach((k, i) => { const v = i === ks.length - 1 ? Math.max(1, left) : Math.max(1, n(budget / ks.length)); it.stats[k] = v; left -= v; });
    delete it.st;
    if (it.slot === 'weapon') {
      const Wb = D.WEAPON_BASES[it.wtype], dps = (1.6 + L * 0.45) * QM[it.q] * (it.wtype === 'staff' ? 1.35 : 1);
      it.speed = it.speed || Wb.speed; it.dmg = [Math.max(1, n(dps * it.speed * 0.7)), Math.max(2, n(dps * it.speed * 1.3))]; it.icon = it.icon || Wb.icon;
    } else {
      it.armor = it.slot === 'finger' ? 0 : Math.max(1, n((D.SLOT_ARMOR[it.slot] || 3) * (it.atype ? D.GEAR_BASES[it.atype].arm : 0.3) * (L + 2) * 0.9 * QM[it.q]));
      it.icon = it.icon || (it.slot === 'chest' ? 'chest_' + (it.atype || 'cloth') : D.SLOT_ICON[it.slot]);
    }
    it.sell = Math.max(1, n((L * L * 0.9 + 4) * [0.5, 1, 3, 7, 12][it.q]));
    D.item(id, it);
    M.loot = (M.loot || []).concat([id]); // the same drop chance as its other blues
  }
  // beta 1 (§6 step 1): one effect per role, three levelling dungeon finals and two level-60 sources
  effectItem('cutpurse_gloves', 'vancleef', { name: "Cutpurse's Gloves", slot: 'hands', atype: 'leather', effect: 'opening_cut', st: ['agi', 'str'] });
  effectItem('ashen_mercy_robe', 'high_inquisitor_whitemane', { name: 'Robe of Ashen Mercy', slot: 'chest', atype: 'cloth', effect: 'echoing_mend', st: ['int', 'spi'] });
  effectItem('sandguard_girdle', 'chief_ukorz_sandscalp', { name: 'Sandguard Girdle', slot: 'waist', atype: 'mail', effect: 'turning_guard', st: ['sta', 'str'] });
  effectItem('turning_greaves', 'darkmaster_gandling', { name: 'Greaves of the Turning Hour', slot: 'legs', atype: 'mail', effect: 'turning_guard', st: ['sta', 'str'] });
  effectItem('fenheart_band', 'ashwing', { name: 'Fenheart Band', q: 4, slot: 'finger', effect: 'stubborn_blood', st: ['agi', 'str'] }); // it trades damage stats for staying alive
  // beta 2 (§6 step 2): every other source. Levelling finals spread the armour types and roles on the way to 60 (trash
  // effects early, boss effects late); raid bosses and world bosses drop epics (Hard: two upgrade steps up, the effect
  // grows with them); Brimming Cup waits for the game designer (#22), so nothing drops it yet
  const fx = (id, boss, name, slot, atype, effect, st, q) => effectItem(id, boss, { name, slot, atype, effect, st, q });
  // levelling dungeon finals (blue)
  fx('cinderwrapped_cuffs', 'bazzalan', 'Cinderwrapped Cuffs', 'wrist', 'cloth', 'stubborn_blood', ['int', 'sta']);
  fx('waking_dream_boots', 'mutanus', 'Boots of the Waking Dream', 'feet', 'leather', 'echoing_mend', ['int', 'spi']);
  fx('rioters_grips', 'bazil_thredd', "Rioter's Grips", 'hands', 'mail', 'chase_the_next', ['agi', 'str']);
  fx('tidebreak_cloak', 'aku_mai', 'Tidebreak Cloak', 'back', undefined, 'turning_guard', ['sta', 'agi']);
  fx('wolfshade_handwraps', 'arugal', 'Wolfshade Handwraps', 'hands', 'cloth', 'steady_fuse', ['int', 'sta']);
  fx('cogspun_sash', 'mekgineer_thermaplugg', 'Cogspun Sash', 'waist', 'cloth', 'tithe_of_battle', ['int', 'sta']);
  fx('thornhide_belt', 'charlga_razorflank', 'Thornhide Belt', 'waist', 'leather', 'spiteful_hide', ['sta', 'agi']);
  fx('quiet_page_bracers', 'arcanist_doan', 'Bracers of the Quiet Page', 'wrist', 'cloth', 'wellspring', ['int', 'spi']);
  fx('gamblers_last_coin', 'mintmaster_coinwhistle', "Gambler's Last Coin", 'finger', undefined, 'glass_heart', ['agi', 'str']);
  fx('rootfire_treads', 'princess_theradras', 'Rootfire Treads', 'feet', 'leather', 'kindled_edge', ['agi', 'sta']);
  fx('forgeheart_gauntlets', 'emperor_dagran_thaurissan', 'Forgeheart Gauntlets', 'hands', 'mail', 'spiteful_hide', ['sta', 'str']);
  fx('gravecutter_bracers', 'baron_rivendare', 'Gravecutter Bracers', 'wrist', 'leather', 'opening_cut', ['agi', 'str']);
  // the level-60 dungeons (blue)
  fx('archivists_tidering', 'lady_vessaria', "Archivist's Tidering", 'finger', undefined, 'wellspring', ['int', 'spi']);
  fx('sunfire_legguards', 'avatar_of_shalzua', 'Sunfire Legguards', 'legs', 'mail', 'kindled_edge', ['agi', 'str']);
  // raid bosses (epic): the Magma Throne, the Tidecrown Citadel, the Broodmother's lair
  fx('houndrunner_boots', 'magmadar', 'Houndrunner Boots', 'feet', 'leather', 'chase_the_next', ['agi', 'str'], 4);
  fx('firebound_girdle', 'garr', 'Firebound Girdle', 'waist', 'mail', 'turning_guard', ['sta', 'str'], 4);
  fx('fusewoven_gloves', 'baron_geddon', 'Fusewoven Gloves', 'hands', 'cloth', 'steady_fuse', ['int', 'sta'], 4);
  fx('cinderhide_bracers', 'golemagg', 'Cinderhide Bracers', 'wrist', 'mail', 'spiteful_hide', ['sta', 'str'], 4);
  fx('harbingers_tithe', 'sulfuron_harbinger', "Harbinger's Tithe", 'finger', undefined, 'tithe_of_battle', ['int', 'sta'], 4);
  fx('stewards_grace', 'majordomo_executus', "Cloak of the Steward's Grace", 'back', undefined, 'echoing_mend', ['int', 'spi'], 4);
  fx('molten_heart_leggings', 'ragnaros', 'Leggings of the Molten Heart', 'legs', 'leather', 'kindled_edge', ['agi', 'str'], 4);
  fx('first_wave_belt', 'commander_serathis', 'Belt of the First Wave', 'waist', 'leather', 'opening_cut', ['agi', 'str'], 4);
  fx('twinned_tide_bracers', 'tide_twin_myrel', 'Twinned Tide Bracers', 'wrist', 'cloth', 'lifeline', ['int', 'spi'], 4);
  fx('coralguard_legplates', 'coralheart_colossus', 'Coralguard Legplates', 'legs', 'mail', 'turning_guard', ['sta', 'agi'], 4);
  fx('brittle_crown_signet', 'prince_aeldran', 'Brittle Crown Signet', 'finger', undefined, 'glass_heart', ['agi', 'str'], 4);
  fx('returning_tide_gloves', 'nalveshra', 'Gloves of the Returning Tide', 'hands', 'leather', 'echoing_mend', ['int', 'spi'], 4);
  fx('broodguard_bracers', 'onyxia', 'Broodguard Bracers', 'wrist', 'leather', 'stubborn_blood', ['agi', 'sta'], 4);
  // world bosses (epic)
  fx('hollow_choir_sabatons', 'hollow_colossus', 'Sabatons of the Hollow Choir', 'feet', 'mail', 'lifeline', ['int', 'spi'], 4);
  fx('rimebound_cuffs', 'rimefather', 'Rimebound Cuffs', 'wrist', 'cloth', 'steady_fuse', ['int', 'sta'], 4);
})(typeof window !== 'undefined' ? window : globalThis);
