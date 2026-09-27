// Zul'Farrak (dungeon, levels 43–47, v6): the Sandfury trolls' city in Tanaris, open to both factions (the gate is in
// contested Tanaris, reached through Gadgetzan).
(function (root) {
  const D = root.D;
  D.item('ukorz_head', { name: "Chief Ukorz Sandscalp's Head", slot: 'quest', q: 1, icon: 'head' });
  D.item('gahz_rilla_scale', { name: "Gahz'rilla Scale", slot: 'quest', q: 1, icon: 'fin' });
  D.item('zumrah_totem', { name: "Zum'rah's Voodoo Totem", slot: 'quest', q: 1, icon: 'voodoo_doll' });
  const gear = (id, name, slot, o) => D.item(id, Object.assign({ name, slot, q: 3 }, o));
  gear('antusul_staff', "Antu'sul's Staff", 'weapon', { wtype: 'staff', lvl: 44, dmg: [66, 98], speed: 3, stats: { int: 16, spi: 11 }, sp: 26, icon: 'staff', sell: 7200 });
  gear('antusul_boots', 'Basilisk Hide Boots', 'feet', { atype: 'leather', lvl: 44, armor: 110, stats: { agi: 12, sta: 10 }, icon: 'boots', sell: 6600 });
  gear('theka_robe', "Martyr's Robe", 'chest', { atype: 'cloth', lvl: 45, armor: 96, stats: { int: 16, spi: 11 }, sp: 18, icon: 'chest_cloth', sell: 7400 });
  gear('theka_bracers', 'Scarab Bracers', 'wrist', { atype: 'mail', lvl: 45, armor: 150, stats: { str: 10, sta: 9 }, icon: 'bracers', sell: 6800 });
  gear('zumrah_wand', 'Voodoo Rattle Staff', 'weapon', { wtype: 'staff', lvl: 45, dmg: [66, 98], speed: 3, stats: { int: 15, sta: 11 }, sp: 24, icon: 'staff', sell: 7300 });
  gear('zumrah_ring', "Witch Doctor's Band", 'finger', { lvl: 45, stats: { int: 11, spi: 9 }, icon: 'ring', sell: 6900 });
  gear('gahzrilla_blade', "Gahz'rilla Fang", 'weapon', { wtype: 'dagger', lvl: 46, dmg: [36, 66], speed: 1.8, stats: { agi: 12, sta: 8 }, icon: 'dagger', sell: 7600 });
  gear('gahzrilla_mail', 'Hydra Scale Hauberk', 'chest', { atype: 'mail', lvl: 46, armor: 380, stats: { str: 16, sta: 13 }, icon: 'chest_mail', sell: 7800 });
  gear('bly_rifle', "Sergeant Bly's Longbow", 'ranged', { wtype: 'bow', lvl: 46, dmg: [48, 80], speed: 2.9, stats: { agi: 11 }, icon: 'bow', sell: 7200 });
  gear('bly_cloak', 'Mercenary Cape', 'back', { lvl: 46, armor: 58, stats: { agi: 10, sta: 9 }, icon: 'cloak', sell: 7000 });
  gear('ukorz_axe', 'The Chief\'s Enforcer', 'weapon', { wtype: 'axe', lvl: 47, dmg: [60, 100], speed: 2.8, stats: { str: 16, sta: 10 }, icon: 'axe', sell: 8200 });
  gear('ukorz_legs', 'Sandscalp Leggings', 'legs', { atype: 'leather', lvl: 47, armor: 170, stats: { agi: 16, sta: 12 }, icon: 'legs', sell: 7800 });
  gear('ukorz_robe', 'Robe of the Sandscalp', 'chest', { atype: 'cloth', lvl: 47, armor: 100, stats: { int: 17, spi: 12 }, sp: 20, icon: 'chest_cloth', sell: 8000 });
  gear('ukorz_plate', 'Sandscalp War Mail', 'chest', { atype: 'mail', lvl: 47, armor: 390, stats: { str: 17, sta: 14 }, icon: 'chest_mail', sell: 8200 });

  Object.assign(D.MOBS, {
    sandfury_blood_drinker: { name: 'Sandfury Blood Drinker', lvl: [43, 44], family: 'humanoid', hpMult: 1.1, drops: [['troll_tusk', 0.45], ['linen_cloth', 0.3]], qdrops: [['sandfury_scalp', 0.5]], aggro: 'Your blood be ours!' },
    sandfury_shadowcaster: { name: 'Sandfury Shadowcaster', lvl: [43, 44], family: 'humanoid', drops: [['troll_tusk', 0.4], ['linen_cloth', 0.35]], qdrops: [['sandfury_scalp', 0.4]], aggro: 'Da sands swallow you!' },
    zul_farrak_zombie: { name: "Zul'Farrak Zombie", lvl: [44, 45], family: 'undead', drops: [['rotting_flesh', 0.4]] },
    antu_sul: { name: "Antu'sul", lvl: [44, 44], family: 'humanoid', boss: true, special: 'kelris', summon: 'sandfury_blood_drinker', specialText: "Antu'sul calls his servants!", loot: ['antusul_staff', 'antusul_boots'], aggro: "Lunch has arrived, my beautiful children!" },
    theka_the_martyr: { name: 'Theka the Martyr', lvl: [45, 45], family: 'humanoid', boss: true, special: 'cook', specialText: 'Theka shifts into a scarab shell and heals!', loot: ['theka_robe', 'theka_bracers'] },
    witch_doctor_zumrah: { name: "Witch Doctor Zum'rah", lvl: [45, 45], family: 'humanoid', boss: true, special: 'kelris', summon: 'zul_farrak_zombie', specialText: "Zum'rah raises the dead!", loot: ['zumrah_wand', 'zumrah_ring'], qdrops: [['zumrah_totem', 1]], aggro: 'Sands consume you!' },
    gahz_rilla: { name: "Gahz'rilla", lvl: [46, 46], family: 'beast', boss: true, special: 'whirl', specialText: "Gahz'rilla breathes a freezing blast!", loot: ['gahzrilla_blade', 'gahzrilla_mail'], qdrops: [['gahz_rilla_scale', 1]] },
    sergeant_bly: { name: 'Sergeant Bly', lvl: [46, 46], family: 'humanoid', boss: true, special: 'molten', specialText: 'Sergeant Bly throws a bomb!', loot: ['bly_rifle', 'bly_cloak'], aggro: 'I have a feeling this is not going to end well.' },
    chief_ukorz_sandscalp: { name: 'Chief Ukorz Sandscalp', lvl: [46, 46], family: 'humanoid', boss: true, special: 'whirl', specialText: 'Ukorz spins with his great axe!', loot: ['ukorz_axe', 'ukorz_legs', 'ukorz_robe', 'ukorz_plate'], qdrops: [['ukorz_head', 1]], aggro: 'Who dares enter the Chief\'s city?' },
  });

  Object.assign(D.QUESTS, {
    zf_ukorz: { name: 'The Sandfury Chief', lvl: 47, giver: 'noggenfogger', turnin: 'noggenfogger', dungeon: 'zul_farrak', text: 'The Sandfury raid my caravans from Zul\'Farrak. Their chief, Ukorz Sandscalp, rules from the temple. Bring me his head.',
      objs: [{ type: 'collect', item: 'ukorz_head', n: 1 }], reward: { choice: ['fam_back_rare50'] } },
    zf_gahzrilla: { name: "Gahz'rilla", lvl: 46, giver: 'fizzledowser', turnin: 'fizzledowser', dungeon: 'zul_farrak', text: "The trolls keep a hydra, Gahz'rilla, in their sacred pool. Bring me a scale. For science.",
      objs: [{ type: 'collect', item: 'gahz_rilla_scale', n: 1 }], reward: { choice: ['fam_weapon46'] } },
    zf_zumrah: { name: 'Voodoo Totem', lvl: 45, giver: 'blizrik', turnin: 'blizrik', dungeon: 'zul_farrak', text: 'Their witch doctor raises the dead with a voodoo totem. Take it from him.',
      objs: [{ type: 'collect', item: 'zumrah_totem', n: 1 }], reward: { money: 5000 } },
  });
  Object.assign(D.DUNGEONS, {
    zul_farrak: { name: "Zul'Farrak", minLvl: 43, par: 420, size: 5, trashMult: { hp: 2.2, dmg: 2.2 }, bossMult: { hp: 10, dmg: 4.8 }, pulls: [
      { scene: 'zf_courtyard', label: 'The city gate', mobs: ['sandfury_blood_drinker', 'sandfury_shadowcaster'] },
      { scene: 'zf_courtyard', label: "Antu'sul", mobs: ['antu_sul'], boss: true },
      { scene: 'zf_courtyard', label: 'The graveyard', mobs: ['zul_farrak_zombie', 'zul_farrak_zombie', 'sandfury_shadowcaster'] },
      { scene: 'zf_courtyard', label: "Witch Doctor Zum'rah", mobs: ['witch_doctor_zumrah'], boss: true },
      { scene: 'zf_temple', label: 'Theka the Martyr', mobs: ['theka_the_martyr'], boss: true },
      { scene: 'zf_temple', label: 'The sacred pool', mobs: ['sandfury_blood_drinker', 'sandfury_blood_drinker'] },
      { scene: 'zf_temple', label: "Gahz'rilla", mobs: ['gahz_rilla'], boss: true },
      { scene: 'zf_courtyard', label: 'The pyramid stairs', mobs: ['sergeant_bly'], boss: true },
      { scene: 'zf_temple', label: 'Chief Ukorz Sandscalp', mobs: ['chief_ukorz_sandscalp'], boss: true },
    ] },
  });
  Object.assign(D.ACTIVITIES, {
    zul_farrak: { name: "Zul'Farrak", dungeon: 'zul_farrak', where: 'zul_farrak_gate', size: 5, minLvl: 43, maxLvl: 47, desc: 'Dungeon in Tanaris. 5 players. Both factions.' },
  });
})(typeof window !== 'undefined' ? window : globalThis);
