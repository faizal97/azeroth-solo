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
      name: 'Opening Cut', role: 'damage', icon: 'ambush', k: 3, c: 4, cost: 0.75, // one slot's stats are a small share of a character: it pays most of them
      bonus: (L) => n(D.EFFECTS.opening_cut.k * L + D.EFFECTS.opening_cut.c),
      desc: (L) => `Your first hit on each enemy deals ${D.EFFECTS.opening_cut.bonus(L)} extra damage.`,
    },
    // healing
    echoing_mend: {
      name: 'Echoing Mend', role: 'healing', icon: 'chain_heal', chance: 0.35, pct: 0.35, cost: 0.3,
      desc: () => `Your direct heals have a ${n(D.EFFECTS.echoing_mend.chance * 100)}% chance to echo: ${n(D.EFFECTS.echoing_mend.pct * 100)}% of the heal also lands on the most hurt other ally.`,
    },
    // tanking
    turning_guard: {
      name: 'Turning Guard', role: 'tank', icon: 'shield_block', icd: 3, dur: 6, k: 0.7, c: 4, cost: 0.4,
      absorb: (L) => n(D.EFFECTS.turning_guard.k * L + D.EFFECTS.turning_guard.c),
      desc: (L) => `When you dodge a melee attack, a guard absorbs the next ${D.EFFECTS.turning_guard.absorb(L)} damage within ${D.EFFECTS.turning_guard.dur} sec. At most once every ${D.EFFECTS.turning_guard.icd} sec.`,
    },
    // survival
    stubborn_blood: {
      name: 'Stubborn Blood', role: 'survival', icon: 'frenzied_regeneration', icd: 60, below: 0.3, pct: 0.06, dur: 6, cost: 0.5,
      desc: () => { const F = D.EFFECTS.stubborn_blood; return `Falling below ${n(F.below * 100)}% health heals you for ${n(F.pct * 100)}% of your health over ${F.dur} sec. At most once every ${F.icd} sec.`; },
    },
  };

  // ---- the items: new ones (existing gear never changes under its owners), at the budget of their boss's other drops
  const QM = [0.8, 1, 1.1, 1.22, 1.35];
  const sum = (it) => Object.values(it.stats || {}).reduce((a, b) => a + b, 0);
  function effectItem(id, boss, o) {
    const M = D.MOBS[boss]; if (!M || !D.EFFECTS[o.effect]) return;
    const it = Object.assign({ q: 3, lvl: M.lvl[0], effect: o.effect }, o), L = it.lvl;
    const sibs = (M.loot || []).map((k) => D.ITEMS[k]).filter((x) => x && x.stats && sum(x) > 0);
    const full = sibs.length ? sibs.reduce((a, x) => a + sum(x), 0) / sibs.length : L * 0.55 + 2; // what the boss's other drops carry
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
  effectItem('fenheart_band', 'ashwing', { name: 'Fenheart Band', slot: 'finger', effect: 'stubborn_blood', st: ['agi', 'str'] }); // it trades damage stats for staying alive
})(typeof window !== 'undefined' ? window : globalThis);
