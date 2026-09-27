// The Scarlet Monastery (v5.1): two wings of the Crusade's abbey in north-east Tirisfal, levels 33–40.
// The gate is a place in Tirisfal. The Horde walks there from Brill; the Alliance comes over the Alterac pass.
(function (root) {
  const D = root.D;
  D.item('doan_tome', { name: "Doan's Arcane Tome", slot: 'quest', q: 1, icon: 'journal' });
  D.item('scarlet_insignia', { name: 'Scarlet Crusade Insignia', slot: 'quest', q: 1, icon: 'coin' });
  D.item('whitemane_amulet', { name: "Whitemane's Amulet", slot: 'quest', q: 1, icon: 'ring' });
  D.item('herod_seal', { name: "Herod's Seal", slot: 'quest', q: 1, icon: 'coin' });
  // Library drops (35-37)
  D.item('vishas_whip', { name: "Interrogator's Lash", slot: 'weapon', wtype: 'dagger', q: 3, lvl: 34, dmg: [29, 53], speed: 1.8, stats: { agi: 10, sta: 6 }, icon: 'dagger', sell: 5200 });
  D.item('vishas_boots', { name: 'Torturer\'s Boots', slot: 'feet', atype: 'leather', q: 3, lvl: 34, armor: 96, stats: { agi: 9, sta: 8 }, icon: 'boots', sell: 4900 });
  D.item('loksey_crossbow', { name: "Houndmaster's Crossbow", slot: 'ranged', wtype: 'bow', q: 3, lvl: 35, dmg: [42, 70], speed: 2.9, stats: { agi: 9 }, icon: 'bow', sell: 5400 });
  D.item('loksey_belt', { name: 'Hound Handler Belt', slot: 'waist', atype: 'mail', q: 3, lvl: 35, armor: 160, stats: { str: 9, sta: 8 }, icon: 'belt', sell: 5100 });
  D.item('doan_robe', { name: "Robe of Doan", slot: 'chest', atype: 'cloth', q: 3, lvl: 36, armor: 80, stats: { int: 14, spi: 9 }, sp: 16, icon: 'chest_cloth', sell: 5800 });
  D.item('doan_mantle', { name: 'Mantle of Doan', slot: 'back', q: 3, lvl: 36, armor: 50, stats: { int: 10, sta: 7 }, icon: 'cloak', sell: 5400 });
  D.item('doan_staff', { name: 'Illusionary Rod', slot: 'weapon', wtype: 'staff', q: 3, lvl: 36, dmg: [60, 90], speed: 3, stats: { int: 15, spi: 10 }, sp: 24, icon: 'staff', sell: 5900 });
  // Cathedral drops (37-40)
  D.item('herod_axe', { name: "Ravager", slot: 'weapon', wtype: 'axe', q: 3, lvl: 38, dmg: [52, 86], speed: 2.8, stats: { str: 14, sta: 8 }, icon: 'axe', sell: 6300 });
  D.item('herod_plate', { name: "Herod's Shoulder Guard", slot: 'chest', atype: 'mail', q: 3, lvl: 38, armor: 330, stats: { str: 14, sta: 12 }, icon: 'chest_mail', sell: 6300 });
  D.item('fairbanks_bracers', { name: 'Inquisitor\'s Cuffs', slot: 'wrist', atype: 'leather', q: 3, lvl: 38, armor: 56, stats: { agi: 9, sta: 7 }, icon: 'bracers', sell: 5600 });
  D.item('fairbanks_ring', { name: 'Band of the Inquisition', slot: 'finger', q: 3, lvl: 38, stats: { int: 9, spi: 8 }, icon: 'ring', sell: 5600 });
  D.item('mograine_hammer', { name: "Mograine's Might", slot: 'weapon', wtype: 'mace', q: 3, lvl: 39, dmg: [52, 86], speed: 2.8, stats: { str: 14, int: 7 }, sp: 10, icon: 'mace', sell: 6600 });
  D.item('mograine_legs', { name: 'Scarlet Leggings', slot: 'legs', atype: 'mail', q: 3, lvl: 39, armor: 290, stats: { str: 13, sta: 11 }, icon: 'legs', sell: 6500 });
  D.item('whitemane_staff', { name: "Whitemane's Chapeau Staff", slot: 'weapon', wtype: 'staff', q: 3, lvl: 40, dmg: [64, 96], speed: 3, stats: { int: 16, spi: 12 }, sp: 26, icon: 'staff', sell: 7000 });
  D.item('whitemane_robe', { name: 'Triune Robe', slot: 'chest', atype: 'cloth', q: 3, lvl: 40, armor: 88, stats: { int: 16, spi: 11 }, sp: 18, icon: 'chest_cloth', sell: 7000 });
  D.item('whitemane_leather', { name: 'Scarlet Leather Vest', slot: 'chest', atype: 'leather', q: 3, lvl: 40, armor: 196, stats: { agi: 15, sta: 12 }, icon: 'chest_leather', sell: 7000 });
  D.item('whitemane_blade', { name: 'Scarlet Blade', slot: 'weapon', wtype: 'sword', q: 3, lvl: 40, dmg: [54, 88], speed: 2.6, stats: { agi: 12, str: 9 }, icon: 'sword', sell: 7100 });

  Object.assign(D.MOBS, {
    scarlet_monk: { name: 'Scarlet Monk', lvl: [33, 34], family: 'humanoid', drops: [['linen_cloth', 0.35], ['thieves_coin', 0.45]], qdrops: [['scarlet_insignia', 0.35]] },
    scarlet_chaplain: { name: 'Scarlet Chaplain', lvl: [33, 34], family: 'humanoid', drops: [['linen_cloth', 0.35], ['thieves_coin', 0.45]], qdrops: [['scarlet_insignia', 0.35]] },
    scarlet_wizard: { name: 'Scarlet Wizard', lvl: [34, 35], family: 'humanoid', drops: [['linen_cloth', 0.4], ['thieves_coin', 0.45]] },
    scarlet_myrmidon: { name: 'Scarlet Myrmidon', lvl: [36, 37], family: 'humanoid', hpMult: 1.1, drops: [['linen_cloth', 0.35], ['thieves_coin', 0.5]], qdrops: [['scarlet_insignia', 0.35]] },
    scarlet_abbot: { name: 'Scarlet Abbot', lvl: [36, 37], family: 'humanoid', drops: [['linen_cloth', 0.4], ['thieves_coin', 0.5]] },
    scarlet_champion: { name: 'Scarlet Champion', lvl: [37, 38], family: 'humanoid', hpMult: 1.15, drops: [['linen_cloth', 0.35], ['thieves_coin', 0.5]], qdrops: [['scarlet_insignia', 0.35]] },
    interrogator_vishas: { name: 'Interrogator Vishas', lvl: [34, 34], family: 'humanoid', boss: true, special: 'molten', specialText: 'Interrogator Vishas lashes out with his whip!', loot: ['vishas_whip', 'vishas_boots'], aggro: 'Tell me... tell me everything!' },
    houndmaster_loksey: { name: 'Houndmaster Loksey', lvl: [35, 35], family: 'humanoid', boss: true, special: 'kelris', summon: 'scarlet_monk', specialText: 'Houndmaster Loksey calls for help!', loot: ['loksey_crossbow', 'loksey_belt'], aggro: 'Release the hounds!' },
    arcanist_doan: { name: 'Arcanist Doan', lvl: [36, 36], family: 'humanoid', boss: true, special: 'whirl', specialText: 'Arcanist Doan releases an arcane explosion!', loot: ['doan_robe', 'doan_mantle', 'doan_staff'], qdrops: [['doan_tome', 1]], aggro: 'You will not defile these mysteries!' },
    herod: { name: 'Herod', lvl: [38, 38], family: 'humanoid', boss: true, special: 'whirl', specialText: 'Herod spins in a whirlwind of steel!', loot: ['herod_axe', 'herod_plate'], qdrops: [['herod_seal', 1]], aggro: 'Ah, I have been waiting for a real challenge!' },
    high_inquisitor_fairbanks: { name: 'High Inquisitor Fairbanks', lvl: [38, 38], family: 'undead', boss: true, special: 'cook', specialText: 'Fairbanks heals himself with dark light.', loot: ['fairbanks_bracers', 'fairbanks_ring'] },
    scarlet_commander_mograine: { name: 'Scarlet Commander Mograine', lvl: [39, 39], family: 'humanoid', boss: true, special: 'slam', specialText: 'Mograine hammers down with holy fury!', loot: ['mograine_hammer', 'mograine_legs'], aggro: 'Infidels! They must be purified!' },
    high_inquisitor_whitemane: { name: 'High Inquisitor Whitemane', lvl: [39, 39], family: 'humanoid', boss: true, special: 'cook', specialText: 'Whitemane calls down the Light to heal herself!', loot: ['whitemane_staff', 'whitemane_robe', 'whitemane_leather', 'whitemane_blade'], qdrops: [['whitemane_amulet', 1]], aggro: 'Mograine has fallen? You shall pay for this!' },
  });

  Object.assign(D.PLACES, {
    scarlet_monastery_gate: { name: 'Scarlet Monastery', zone: 'Tirisfal Glades', region: 'tirisfal', scene: 'scarlet_monastery_gate', lvl: [33, 40], mobs: [['scarlet_monk', 4], ['scarlet_chaplain', 3]], pool: 7, npcs: [], links: { brill: 30, scarlet_watch_post: 20, alterac_foothills: 45 }, via: { alterac_foothills: 'Alterac pass' } },
  });
  D.PLACES.brill.links.scarlet_monastery_gate = 30;
  D.PLACES.scarlet_watch_post.links.scarlet_monastery_gate = 20;
  D.PLACES.alterac_foothills.links.scarlet_monastery_gate = 45; D.PLACES.alterac_foothills.via.scarlet_monastery_gate = 'Alterac pass';

  Object.assign(D.QUESTS, {
    sm_doan_a: { name: 'Mythology of the Titans', lvl: 36, giver: 'thelwater', turnin: 'thelwater', faction: 'alliance', dungeon: 'sm_library', text: 'The Scarlet Crusade hoards forbidden books in their monastery\'s library. Their arcanist, Doan, keeps the worst of them. Bring me his tome.',
      objs: [{ type: 'collect', item: 'doan_tome', n: 1 }], reward: { choice: ['fam_back_rare40'] } },
    sm_doan_h: { name: 'Mythology of the Titans', lvl: 36, giver: 'dillinger', turnin: 'dillinger', faction: 'horde', dungeon: 'sm_library', text: 'The Crusade\'s arcanist, Doan, keeps his secrets in the monastery library. Take his tome. The Dark Lady wants it.',
      objs: [{ type: 'collect', item: 'doan_tome', n: 1 }], reward: { choice: ['fam_back_rare40'] } },
    sm_insignias: { name: 'Scarlet Insignias', lvl: 35, giver: 'dillinger', turnin: 'dillinger', faction: 'horde', dungeon: 'sm_library', text: 'Every Crusader wears their insignia. Bring me 10.',
      objs: [{ type: 'collect', item: 'scarlet_insignia', n: 10 }], reward: { money: 4000 } },
    sm_whitemane_a: { name: 'In the Name of the Light', lvl: 40, giver: 'thelwater', turnin: 'thelwater', faction: 'alliance', dungeon: 'sm_cathedral', text: 'The Crusade has gone mad. Its leaders, Mograine and Whitemane, burn anyone they suspect. End them and bring me Whitemane\'s amulet.',
      objs: [{ type: 'collect', item: 'whitemane_amulet', n: 1 }], reward: { choice: ['fam_weapon40'] } },
    sm_whitemane_h: { name: 'In the Name of the Light', lvl: 40, giver: 'dillinger', turnin: 'dillinger', faction: 'horde', dungeon: 'sm_cathedral', text: 'The Crusade\'s leaders hide in the cathedral: Mograine and Whitemane. End them. Bring me her amulet.',
      objs: [{ type: 'collect', item: 'whitemane_amulet', n: 1 }], reward: { choice: ['fam_weapon40'] } },
    sm_herod: { name: 'The Scarlet Champion', lvl: 38, giver: 'thelwater', turnin: 'thelwater', faction: 'alliance', dungeon: 'sm_cathedral', text: 'Herod, the Crusade\'s champion, trains their soldiers in the armory. Take his seal.',
      objs: [{ type: 'collect', item: 'herod_seal', n: 1 }], reward: { choice: ['fam_chest38'] } },
  });

  Object.assign(D.DUNGEONS, {
    sm_library: { name: 'Scarlet Monastery: Library', minLvl: 33, par: 270, size: 5, trashMult: { hp: 2.2, dmg: 2.2 }, bossMult: { hp: 10, dmg: 4.8 }, pulls: [
      { scene: 'sm_library', label: 'The entrance hall', mobs: ['scarlet_monk', 'scarlet_chaplain'] },
      { scene: 'sm_library', label: 'Interrogator Vishas', mobs: ['interrogator_vishas'], boss: true },
      { scene: 'sm_library', label: 'The reading room', mobs: ['scarlet_wizard', 'scarlet_monk', 'scarlet_chaplain'] },
      { scene: 'sm_library', label: 'Houndmaster Loksey', mobs: ['houndmaster_loksey'], boss: true },
      { scene: 'sm_library', label: 'The stacks', mobs: ['scarlet_wizard', 'scarlet_wizard'] },
      { scene: 'sm_library', label: 'Arcanist Doan', mobs: ['arcanist_doan'], boss: true },
    ] },
    sm_cathedral: { name: 'Scarlet Monastery: Cathedral', minLvl: 36, par: 390, size: 5, trashMult: { hp: 2.2, dmg: 2.2 }, bossMult: { hp: 10, dmg: 4.8 }, pulls: [
      { scene: 'sm_cathedral', label: 'The armory', mobs: ['scarlet_myrmidon', 'scarlet_champion'] },
      { scene: 'sm_cathedral', label: 'Herod', mobs: ['herod'], boss: true },
      { scene: 'sm_cathedral', label: 'The courtyard', mobs: ['scarlet_abbot', 'scarlet_myrmidon', 'scarlet_champion'] },
      { scene: 'sm_cathedral', label: 'High Inquisitor Fairbanks', mobs: ['high_inquisitor_fairbanks'], boss: true },
      { scene: 'sm_cathedral', label: 'The nave', mobs: ['scarlet_champion', 'scarlet_abbot'] },
      { scene: 'sm_cathedral', label: 'Scarlet Commander Mograine', mobs: ['scarlet_commander_mograine'], boss: true },
      { scene: 'sm_cathedral', label: 'High Inquisitor Whitemane', mobs: ['high_inquisitor_whitemane'], boss: true },
    ] },
  });
  Object.assign(D.ACTIVITIES, {
    sm_library: { name: 'Scarlet Monastery: Library', dungeon: 'sm_library', where: 'scarlet_monastery_gate', size: 5, minLvl: 33, maxLvl: 37, desc: 'Dungeon in north-east Tirisfal. 5 players. Both factions.' },
    sm_cathedral: { name: 'Scarlet Monastery: Cathedral', dungeon: 'sm_cathedral', where: 'scarlet_monastery_gate', size: 5, minLvl: 36, maxLvl: 40, desc: 'Dungeon in north-east Tirisfal. 5 players. Both factions.' },
  });
})(typeof window !== 'undefined' ? window : globalThis);
