// Blackrock Depths (dungeon, levels 51–55, v7): the Dark Iron capital under Blackrock Mountain. Both factions run it;
// Marshal Windsor, lost since Chapter 3, is a prisoner in its detention block.
(function (root) {
  const D = root.D;
  D.item('prison_cell_key', { name: 'Prison Cell Key', slot: 'quest', q: 1, icon: 'coin' });
  D.item('windsor_notes', { name: "Windsor's Notes", slot: 'quest', q: 1, icon: 'journal' });
  D.item('thaurissan_crown', { name: "Thaurissan's Crown", slot: 'quest', q: 1, icon: 'ring' });
  D.item('argelmach_core', { name: 'Golem Core', slot: 'quest', q: 1, icon: 'dust' });
  const gear = (id, name, slot, o) => D.item(id, Object.assign({ name, slot, q: 3 }, o));
  gear('gerstahn_whip', "Interrogator's Wand", 'weapon', { wtype: 'dagger', lvl: 52, dmg: [42, 78], speed: 1.8, stats: { agi: 14, sta: 9 }, icon: 'dagger', sell: 9400 });
  gear('roccor_bracers', 'Rockfist Bracers', 'wrist', { atype: 'mail', lvl: 52, armor: 190, stats: { str: 13, sta: 11 }, icon: 'bracers', sell: 9000 });
  gear('baelgar_cloak', 'Molten Cloak', 'back', { lvl: 53, armor: 72, stats: { sta: 13, int: 11 }, icon: 'cloak', sell: 9400 });
  gear('angerforge_blade', 'Angerforge Blade', 'weapon', { wtype: 'sword', lvl: 53, dmg: [66, 110], speed: 2.6, stats: { str: 16, sta: 11 }, icon: 'sword', sell: 10200 });
  gear('angerforge_legs', 'Dark Iron Legguards', 'legs', { atype: 'mail', lvl: 53, armor: 390, stats: { str: 17, sta: 15 }, icon: 'legs', sell: 10000 });
  gear('argelmach_gloves', 'Golem Handlers', 'hands', { atype: 'leather', lvl: 54, armor: 140, stats: { agi: 16, sta: 12 }, icon: 'gloves', sell: 9800 });
  gear('magmus_boots', 'Magma-Forged Boots', 'feet', { atype: 'mail', lvl: 54, armor: 320, stats: { str: 16, sta: 13 }, icon: 'boots', sell: 9900 });
  gear('thaurissan_hammer', 'Ironfoe', 'weapon', { wtype: 'mace', lvl: 55, dmg: [70, 116], speed: 2.8, stats: { str: 18, sta: 12 }, icon: 'mace', sell: 11600 });
  gear('thaurissan_staff', 'Staff of the Emperor', 'weapon', { wtype: 'staff', lvl: 55, dmg: [80, 118], speed: 3, stats: { int: 21, spi: 15 }, sp: 34, icon: 'staff', sell: 11600 });
  gear('thaurissan_robe', "Emperor's Seal Robe", 'chest', { atype: 'cloth', lvl: 55, armor: 118, stats: { int: 20, spi: 15 }, sp: 26, icon: 'chest_cloth', sell: 11400 });
  gear('thaurissan_leather', 'Shadowforge Jerkin', 'chest', { atype: 'leather', lvl: 55, armor: 250, stats: { agi: 21, sta: 15 }, icon: 'chest_leather', sell: 11400 });
  gear('thaurissan_plate', 'Imperial Plate Hauberk', 'chest', { atype: 'mail', lvl: 55, armor: 470, stats: { str: 21, sta: 18 }, icon: 'chest_mail', sell: 11600 });

  Object.assign(D.MOBS, {
    anvilrage_warden: { name: 'Anvilrage Warden', lvl: [51, 52], family: 'humanoid', hpMult: 1.1, drops: [['thieves_coin', 0.5], ['linen_cloth', 0.3]], qdrops: [['prison_cell_key', 0.15]] },
    shadowforge_flame_keeper: { name: 'Shadowforge Flame Keeper', lvl: [51, 52], family: 'humanoid', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.35]] },
    ragereaver_golem: { name: 'Ragereaver Golem', lvl: [52, 53], family: 'mechanical', hpMult: 1.2, drops: [['linen_cloth', 0.1]] },
    high_interrogator_gerstahn: { name: 'High Interrogator Gerstahn', lvl: [52, 52], family: 'humanoid', boss: true, special: 'molten', specialText: 'Gerstahn lashes you with shadow!', loot: ['gerstahn_whip', 'roccor_bracers'], qdrops: [['prison_cell_key', 1]], aggro: 'Another spy for the cells!' },
    lord_roccor: { name: 'Lord Roccor', lvl: [52, 52], family: 'elemental', boss: true, special: 'slam', specialText: 'Lord Roccor shakes the earth!', loot: ['roccor_bracers', 'baelgar_cloak'] },
    bael_gar: { name: "Bael'Gar", lvl: [53, 53], family: 'giant', boss: true, special: 'molten', specialText: "Bael'Gar spews magma!", loot: ['baelgar_cloak', 'magmus_boots'] },
    general_angerforge: { name: 'General Angerforge', lvl: [53, 53], family: 'humanoid', boss: true, special: 'kelris', summon: 'anvilrage_warden', specialText: 'General Angerforge calls for reinforcements!', loot: ['angerforge_blade', 'angerforge_legs'], aggro: 'Dark Iron! To arms!' },
    golem_lord_argelmach: { name: 'Golem Lord Argelmach', lvl: [54, 54], family: 'humanoid', boss: true, special: 'kelris', summon: 'ragereaver_golem', specialText: 'Argelmach awakens a golem!', loot: ['argelmach_gloves', 'magmus_boots'], qdrops: [['argelmach_core', 1]] },
    magmus: { name: 'Magmus', lvl: [54, 54], family: 'giant', boss: true, special: 'whirl', specialText: 'Magmus bursts with flame!', loot: ['magmus_boots', 'angerforge_legs'] },
    emperor_dagran_thaurissan: { name: 'Emperor Dagran Thaurissan', lvl: [54, 54], family: 'humanoid', boss: true, special: 'slam', specialText: 'The Emperor brings down Ironfoe!', loot: ['thaurissan_hammer', 'thaurissan_staff', 'thaurissan_robe', 'thaurissan_leather', 'thaurissan_plate'], qdrops: [['thaurissan_crown', 1], ['windsor_notes', 1]], aggro: 'Come to aid the Throne!' },
  });

  const A = (id, q) => { q.faction = 'alliance'; D.QUESTS[id] = q; };
  const H = (id, q) => { q.faction = 'horde'; D.QUESTS[id] = q; };
  A('brd_jail_break', { name: 'Jail Break!', lvl: 54, giver: 'marshal_maxwell', turnin: 'marshal_maxwell', dungeon: 'blackrock_depths', text: 'Marshal Windsor is alive, in the detention block of Blackrock Depths. The High Interrogator keeps the keys. Take them and set him free.',
    objs: [{ type: 'collect', item: 'prison_cell_key', n: 1 }], reward: { choice: ['fam_back_rare55'] } });
  A('brd_emperor_a', { name: 'The Emperor', lvl: 55, giver: 'marshal_maxwell', turnin: 'marshal_maxwell', dungeon: 'blackrock_depths', text: "Windsor's notes were taken to the Emperor himself. Kill Dagran Thaurissan and bring them back. They name Stormwind's traitor.",
    objs: [{ type: 'collect', item: 'windsor_notes', n: 1 }], reward: { choice: ['fam_weapon55'] } });
  H('brd_emperor_h', { name: 'The Heart of the Mountain', lvl: 55, giver: 'thal_kaur', turnin: 'thal_kaur', dungeon: 'blackrock_depths', text: 'The Dark Iron Emperor, Dagran Thaurissan, rules the mountain. The Warchief wants his crown.',
    objs: [{ type: 'collect', item: 'thaurissan_crown', n: 1 }], reward: { choice: ['fam_weapon55'] } });
  H('brd_golem_core', { name: 'The Golem Lord', lvl: 54, giver: 'gorzeeki', turnin: 'gorzeeki', dungeon: 'blackrock_depths', text: "Argelmach makes the Dark Iron golems. Bring me the core he carries. I have plans for it.",
    objs: [{ type: 'collect', item: 'argelmach_core', n: 1 }], reward: { choice: ['fam_back_rare55'] } });
  Object.assign(D.DUNGEONS, {
    blackrock_depths: { name: 'Blackrock Depths', minLvl: 51, par: 540, size: 5, trashMult: { hp: 2.2, dmg: 2.2 }, bossMult: { hp: 10, dmg: 4.8 }, pulls: [
      { scene: 'brd_prison', label: 'The detention block', mobs: ['anvilrage_warden', 'anvilrage_warden'] },
      { scene: 'brd_prison', label: 'High Interrogator Gerstahn', mobs: ['high_interrogator_gerstahn'], boss: true },
      { scene: 'brd_prison', label: 'Lord Roccor', mobs: ['lord_roccor'], boss: true },
      { scene: 'brd_city', label: 'The Lyceum', mobs: ['shadowforge_flame_keeper', 'shadowforge_flame_keeper', 'anvilrage_warden'] },
      { scene: 'brd_city', label: "Bael'Gar", mobs: ['bael_gar'], boss: true },
      { scene: 'brd_city', label: 'General Angerforge', mobs: ['general_angerforge'], boss: true },
      { scene: 'brd_city', label: 'The golem workshop', mobs: ['ragereaver_golem', 'shadowforge_flame_keeper'] },
      { scene: 'brd_city', label: 'Golem Lord Argelmach', mobs: ['golem_lord_argelmach'], boss: true },
      { scene: 'brd_throne', label: 'Magmus', mobs: ['magmus'], boss: true },
      { scene: 'brd_throne', label: 'Emperor Dagran Thaurissan', mobs: ['emperor_dagran_thaurissan'], boss: true },
    ] },
  });
  Object.assign(D.ACTIVITIES, {
    blackrock_depths: { name: 'Blackrock Depths', dungeon: 'blackrock_depths', where: 'blackrock_mountain', size: 5, minLvl: 51, maxLvl: 55, desc: 'Dungeon in Blackrock Mountain. 5 players. Both factions.' },
  });
})(typeof window !== 'undefined' ? window : globalThis);
