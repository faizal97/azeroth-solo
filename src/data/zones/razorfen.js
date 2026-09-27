// Razorfen Kraul (Horde dungeon, levels 29–34, v5): the quilboar's thorny warren in the southern Barrens.
// The gate is a place in the Barrens; the dungeon is reached by the group finder from there.
(function (root) {
  const D = root.D;
  D.item('charlga_head', { name: "Charlga Razorflank's Head", slot: 'quest', q: 1, icon: 'head' });
  D.item('blueleaf_tuber', { name: 'Blueleaf Tuber', slot: 'quest', q: 1, icon: 'seed' });
  D.item('jargba_skull', { name: "Jargba's Skull Staff", slot: 'quest', q: 1, icon: 'staff' });
  // drops (levels 30-33)
  D.item('aggem_crown', { name: 'Thorncurse Circlet', slot: 'wrist', atype: 'leather', q: 3, lvl: 30, armor: 50, stats: { int: 7, spi: 6 }, icon: 'bracers', sell: 4000 });
  D.item('aggem_staff', { name: 'Thorn Staff', slot: 'weapon', wtype: 'staff', q: 3, lvl: 30, dmg: [52, 78], speed: 3, stats: { int: 11, spi: 8 }, sp: 16, icon: 'staff', sell: 4400 });
  D.item('jargba_robe', { name: 'Death Speaker Robes', slot: 'chest', atype: 'cloth', q: 3, lvl: 31, armor: 68, stats: { int: 12, sta: 8 }, sp: 12, icon: 'chest_cloth', sell: 4500 });
  D.item('jargba_mantle', { name: 'Death Speaker Mantle', slot: 'back', q: 3, lvl: 31, armor: 46, stats: { int: 8, spi: 7 }, icon: 'cloak', sell: 4200 });
  D.item('ramtusk_hammer', { name: "Ramtusk's Maul", slot: 'weapon', wtype: 'mace', q: 3, lvl: 32, dmg: [43, 71], speed: 2.7, stats: { str: 11, sta: 7 }, icon: 'mace', sell: 4700 });
  D.item('ramtusk_legs', { name: 'Tusked Leggings', slot: 'legs', atype: 'mail', q: 3, lvl: 32, armor: 232, stats: { str: 11, sta: 9 }, icon: 'legs', sell: 4600 });
  D.item('agathelos_hide', { name: 'Raging Hide Boots', slot: 'feet', atype: 'leather', q: 3, lvl: 32, armor: 88, stats: { agi: 9, sta: 7 }, icon: 'boots', sell: 4400 });
  D.item('agathelos_tusk', { name: 'Agathelos Tusk', slot: 'finger', q: 3, lvl: 32, stats: { agi: 8, str: 6 }, icon: 'ring', sell: 4300 });
  D.item('charlga_staff', { name: "Charlga's Thornstaff", slot: 'weapon', wtype: 'staff', q: 3, lvl: 33, dmg: [56, 84], speed: 3, stats: { int: 14, spi: 9 }, sp: 22, icon: 'staff', sell: 5000 });
  D.item('charlga_blade', { name: 'Razorflank Blade', slot: 'weapon', wtype: 'sword', q: 3, lvl: 33, dmg: [44, 72], speed: 2.6, stats: { agi: 9, str: 8 }, icon: 'sword', sell: 5000 });
  D.item('charlga_vest', { name: 'Matriarch Hide Vest', slot: 'chest', atype: 'leather', q: 3, lvl: 33, armor: 166, stats: { agi: 13, sta: 10 }, icon: 'chest_leather', sell: 5000 });
  D.item('charlga_mail', { name: 'Thornplate Hauberk', slot: 'chest', atype: 'mail', q: 3, lvl: 33, armor: 300, stats: { str: 13, sta: 11 }, icon: 'chest_mail', sell: 5200 });

  Object.assign(D.MOBS, {
    razorfen_quilguard: { name: 'Razorfen Quilguard', lvl: [29, 30], family: 'humanoid', hpMult: 1.1, drops: [['quilboar_tusk', 0.4]], qdrops: [['blueleaf_tuber', 0.3]] },
    razorfen_geomancer: { name: 'Razorfen Geomancer', lvl: [29, 30], family: 'humanoid', drops: [['quilboar_tusk', 0.4], ['linen_cloth', 0.3]], qdrops: [['blueleaf_tuber', 0.3]] },
    kraul_bat: { name: 'Kraul Bat', lvl: [30, 31], family: 'beast', drops: [['ruined_pelt', 0.3]] },
    death_head_cultist: { name: "Death's Head Cultist", lvl: [30, 31], family: 'humanoid', drops: [['quilboar_tusk', 0.3], ['linen_cloth', 0.35]] },
    aggem_thorncurse: { name: 'Aggem Thorncurse', lvl: [30, 30], family: 'humanoid', boss: true, special: 'cook', specialText: 'Aggem Thorncurse calls the thorns to mend his wounds.', loot: ['aggem_crown', 'aggem_staff'], aggro: 'The thorns will drink your blood!' },
    death_speaker_jargba: { name: 'Death Speaker Jargba', lvl: [31, 31], family: 'humanoid', boss: true, special: 'molten', specialText: 'Death Speaker Jargba hurls a bolt of death!', loot: ['jargba_robe', 'jargba_mantle'], qdrops: [['jargba_skull', 1]], aggro: 'Death comes for you!' },
    overlord_ramtusk: { name: 'Overlord Ramtusk', lvl: [31, 31], family: 'humanoid', boss: true, special: 'slam', loot: ['ramtusk_hammer', 'ramtusk_legs'], aggro: 'Razorfen never falls!' },
    agathelos: { name: 'Agathelos the Raging', lvl: [32, 32], family: 'beast', boss: true, special: 'hogger', specialText: 'Agathelos charges!', loot: ['agathelos_hide', 'agathelos_tusk'] },
    charlga_razorflank: { name: 'Charlga Razorflank', lvl: [32, 32], family: 'humanoid', boss: true, special: 'kelris', summon: 'razorfen_quilguard', specialText: 'Charlga Razorflank calls her quilguards!', loot: ['charlga_staff', 'charlga_blade', 'charlga_vest', 'charlga_mail'], qdrops: [['charlga_head', 1]], aggro: 'The thorns will be your grave!' },
  });

  Object.assign(D.PLACES, {
    razorfen_gate: { name: 'Razorfen Kraul', zone: 'The Barrens', region: 'barrens', scene: 'razorfen_gate', lvl: [29, 34], mobs: [['razorfen_quilguard', 4], ['razorfen_geomancer', 3]], pool: 7, npcs: [], links: { baeldun_digsite: 22 } },
  });
  D.PLACES.baeldun_digsite.links.razorfen_gate = 22;

  Object.assign(D.QUESTS, {
    rfk_charlga: { name: 'The Razorflank Matriarch', lvl: 33, giver: 'thork', turnin: 'thork', dungeon: 'razorfen_kraul', text: 'The quilboar of Razorfen Kraul follow Charlga Razorflank, and she follows something darker. End her and bring me her head.',
      objs: [{ type: 'collect', item: 'charlga_head', n: 1 }], reward: { choice: ['fam_back_rare35'] } },
    rfk_tubers: { name: 'Blueleaf Tubers', lvl: 30, giver: 'helbrim', turnin: 'helbrim', dungeon: 'razorfen_kraul', text: 'The quilboar grow rare blueleaf tubers deep in the Kraul. Bring me 4. I have plans for them.',
      objs: [{ type: 'collect', item: 'blueleaf_tuber', n: 4 }], reward: { money: 2500 } },
    rfk_jargba: { name: 'Mortality Wanes', lvl: 31, giver: 'thork', turnin: 'thork', dungeon: 'razorfen_kraul', text: 'A quilboar necromancer, Death Speaker Jargba, raises the dead in the Kraul. Bring me his skull staff.',
      objs: [{ type: 'collect', item: 'jargba_skull', n: 1 }], reward: { choice: ['fam_weapon32'] } },
  });

  Object.assign(D.DUNGEONS, {
    razorfen_kraul: { name: 'Razorfen Kraul', minLvl: 29, par: 420, size: 5, trashMult: { hp: 2.2, dmg: 2.2 }, bossMult: { hp: 10, dmg: 4.8 }, pulls: [
      { scene: 'razorfen_kraul', label: 'The thorn tunnels', mobs: ['razorfen_quilguard', 'razorfen_geomancer'] },
      { scene: 'razorfen_kraul', label: 'Aggem Thorncurse', mobs: ['aggem_thorncurse'], boss: true },
      { scene: 'razorfen_kraul', label: 'Bat roost', mobs: ['kraul_bat', 'kraul_bat', 'razorfen_quilguard'] },
      { scene: 'razorfen_kraul', label: 'Death Speaker Jargba', mobs: ['death_speaker_jargba'], boss: true },
      { scene: 'razorfen_kraul', label: 'Overlord Ramtusk', mobs: ['overlord_ramtusk'], boss: true },
      { scene: 'razorfen_depths', label: 'The cult shrine', mobs: ['death_head_cultist', 'death_head_cultist'] },
      { scene: 'razorfen_depths', label: 'Agathelos the Raging', mobs: ['agathelos'], boss: true },
      { scene: 'razorfen_depths', label: 'The thorn throne', mobs: ['razorfen_quilguard', 'death_head_cultist'] },
      { scene: 'razorfen_depths', label: 'Charlga Razorflank', mobs: ['charlga_razorflank'], boss: true },
    ] },
  });
  Object.assign(D.ACTIVITIES, {
    razorfen_kraul: { name: 'Razorfen Kraul', dungeon: 'razorfen_kraul', where: 'razorfen_gate', size: 5, minLvl: 29, maxLvl: 34, desc: 'Dungeon in the southern Barrens. 5 players.' },
  });
})(typeof window !== 'undefined' ? window : globalThis);
