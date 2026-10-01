// World bosses (v10.7): huge level-60 enemies out in the world, one a week (G.worldBoss: from the date and each one's
// `since`, like the featured raid). Travel there (world content stays in the world) and fight with 10 players; the loot
// drops once a week. Their mechanics use the same system as Hard raids (`extra`), marked hard: false so the boss card
// does not tag them Hard. Tuned like a Normal raid boss (a level-60 group with the bots the game makes: 12/12 won,
// most with no wipe, about 80 sec a boss).
(function (root) {
  const D = root.D;
  const epic = (id, name, slot, o) => D.item(id, Object.assign({ name, slot, q: 4, lvl: 60 }, o));
  epic('ashwing_fang', "Ashwing's Fang", 'weapon', { wtype: 'dagger', dmg: [53, 96], speed: 1.8, stats: { agi: 19, sta: 13 }, icon: 'dagger', sell: 17600 });
  epic('ashwing_scale', 'Broodwarden Scale', 'chest', { atype: 'mail', armor: 520, stats: { str: 24, sta: 21 }, icon: 'chest_mail', sell: 17400 });
  epic('ashwing_band', 'Ember-Gold Band', 'finger', { stats: { int: 14, sta: 13 }, sp: 15, icon: 'ring', sell: 15400 });
  epic('colossus_cleaver', 'Cleaver of the Hollow', 'weapon', { wtype: 'axe', dmg: [96, 142], speed: 3.2, stats: { str: 25, sta: 16 }, icon: 'axe', sell: 18000 });
  epic('colossus_shroud', 'Shroud of the Stitched Dead', 'back', { armor: 88, stats: { sta: 16, int: 12 }, sp: 12, icon: 'cloak', sell: 15800 });
  epic('colossus_bindings', 'Lanternbound Wraps', 'wrist', { atype: 'cloth', armor: 52, stats: { int: 13, spi: 10 }, sp: 14, icon: 'bracers', sell: 15000 });
  epic('rimefather_club', "Rimefather's Icebound Club", 'weapon', { wtype: 'mace', dmg: [95, 141], speed: 3.2, stats: { str: 24, sta: 17 }, icon: 'mace', sell: 18000 });
  epic('rimefather_legs', 'Snowfur Leggings', 'legs', { atype: 'leather', armor: 196, stats: { agi: 23, sta: 18 }, icon: 'legs', sell: 16200 });
  epic('rimefather_band', 'Ring of the Long Winter', 'finger', { stats: { str: 14, sta: 15 }, icon: 'ring', sell: 15400 });

  Object.assign(D.MOBS, {
    ashwing: { name: 'Ashwing, Broodwarden of the Fen', lvl: [60, 60], family: 'dragonkin', boss: true, elite: true, named: true, hpMult: 32, dmgMult: 9.2, special: 'whirl', specialText: 'Ashwing breathes fire over the whole group!', loot: ['ashwing_fang', 'ashwing_scale', 'ashwing_band'], aggro: 'The brood keeps this fen. You do not.' },
    hollow_colossus: { name: 'The Hollow Colossus', lvl: [60, 60], family: 'undead', boss: true, elite: true, named: true, hpMult: 34, dmgMult: 9, special: 'slam', specialText: 'The Hollow Colossus brings its cleaver down!', loot: ['colossus_cleaver', 'colossus_shroud', 'colossus_bindings'], aggro: 'More. The Host wants more.' },
    rimefather: { name: 'Old Rimefather', lvl: [60, 60], family: 'giant', boss: true, elite: true, named: true, hpMult: 36, dmgMult: 7, special: 'slam', specialText: 'Old Rimefather swings his club of ice!', loot: ['rimefather_club', 'rimefather_legs', 'rimefather_band'], aggro: 'Little warm things. Winter takes you all.' },
  });

  const WB = (k, o) => { D.ACTIVITIES[k] = Object.assign({ size: 10, minLvl: 60, maxLvl: 60, worldBoss: true, since: '2026-10-05' }, o); };
  WB('wb_ashwing', { name: 'World boss: Ashwing', where: 'scorched_fen', desc: 'World boss in Saltmarsh. 10 players. Both factions.', boss: 'ashwing',
    extra: { ashwing: [{ kind: 'adds', at: 0.5, mob: 'brood_whelp', n: 3, lvl: 0, hard: false, text: 'Ashwing roars, and whelps pour out of the reeds!' }, { kind: 'enrage', at: 0.2, mult: 1.3, hard: false, text: 'Ashwing burns hotter as it weakens!' }] },
    pulls: [{ scene: 'scorched_fen', label: 'The broodguard', mobs: ['brood_drakonid', 'brood_drakonid', 'brood_whelp'] }, { scene: 'scorched_fen', label: 'Ashwing', mobs: ['ashwing'], boss: true }] });
  WB('wb_colossus', { name: 'World boss: The Hollow Colossus', where: 'andorhal', desc: 'World boss in West Rotmoor. 10 players. Both factions.', boss: 'hollow_colossus',
    extra: { hollow_colossus: [{ kind: 'hit', every: 10, mult: 1, who: 'random', school: 'shadow', hard: false, text: 'A chain of dead flesh lashes out from the Colossus!' }, { kind: 'adds', at: 0.66, mob: 'skeletal_executioner', n: 2, lvl: 0, hard: false, text: 'The dead climb out of the Colossus!' }, { kind: 'adds', at: 0.33, mob: 'skeletal_executioner', n: 2, lvl: 0, hard: false, text: 'More of the dead tear free!' }] },
    pulls: [{ scene: 'andorhal', label: 'The ruins', mobs: ['skeletal_executioner', 'skeletal_executioner'] }, { scene: 'andorhal', label: 'The Hollow Colossus', mobs: ['hollow_colossus'], boss: true }] });
  WB('wb_rimefather', { name: 'World boss: Old Rimefather', where: 'frostwhisper_gorge', desc: 'World boss in Icewold. 10 players. Both factions.', boss: 'rimefather',
    extra: { rimefather: [{ kind: 'hit', every: 12, mult: 0.4, who: 'all', school: 'frost', hard: false, text: 'Old Rimefather breathes a blizzard over you!' }, { kind: 'enrage', at: 0.25, mult: 1.3, hard: false, text: 'Old Rimefather howls like the winter wind!' }] },
    pulls: [{ scene: 'frostwhisper_gorge', label: 'The gorge', mobs: ['chillwind_chimaera', 'chillwind_chimaera'] }, { scene: 'frostwhisper_gorge', label: 'Old Rimefather', mobs: ['rimefather'], boss: true }] });
})(typeof window !== 'undefined' ? window : globalThis);
