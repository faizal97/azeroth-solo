// The Molten Core (raid, 10 players, level 60): the molten sea beneath Blackrock Depths, where Ragnaros the Firelord sleeps.
// The Dark Iron dug for him for two hundred years; with Emperor Thaurissan dead, nothing holds him asleep. Optional for the
// story, the gear step at 60 before the Stormveil Isle. Both factions queue from the gate inside Blackrock Mountain.
// Loot sits at about 90% of the Tidecrown Citadel's, which stays the strongest raid.
(function (root) {
  const D = root.D;
  D.item('firelord_essence', { name: 'Essence of the Firelord', slot: 'quest', q: 1, icon: 'firebolt' });
  D.item('executus_rune', { name: 'Binding Rune of the Majordomo', slot: 'quest', q: 1, icon: 'dust' });
  const epic = (id, name, slot, o) => D.item(id, Object.assign({ name, slot, q: 4 }, o));
  // Magmadar
  epic('magmadar_legs', 'Legguards of the Core Hound', 'legs', { atype: 'mail', lvl: 60, armor: 470, stats: { str: 23, sta: 20 }, icon: 'legs', sell: 16200 });
  epic('magmadar_cloak', 'Cloak of the Molten Hound', 'back', { lvl: 60, armor: 86, stats: { sta: 15, agi: 13 }, icon: 'cloak', sell: 15800 });
  // Garr
  epic('garr_bracers', 'Bindings of the Firesworn', 'wrist', { atype: 'leather', lvl: 60, armor: 116, stats: { agi: 16, sta: 12 }, icon: 'bracers', sell: 15100 });
  epic('garr_ring', 'Firesworn Signet', 'finger', { lvl: 60, stats: { sta: 14, int: 13 }, sp: 14, icon: 'ring', sell: 15300 });
  // Baron Geddon
  epic('geddon_boots', 'Cinderwalkers of the Baron', 'feet', { atype: 'cloth', lvl: 60, armor: 76, stats: { int: 17, spi: 12 }, sp: 20, icon: 'boots', sell: 15300 });
  epic('geddon_gloves', 'Inferno Grips', 'hands', { atype: 'leather', lvl: 60, armor: 144, stats: { agi: 19, sta: 13 }, icon: 'gloves', sell: 15300 });
  // Golemagg the Incinerator
  epic('golemagg_belt', 'Girdle of the Incinerator', 'waist', { atype: 'mail', lvl: 60, armor: 360, stats: { str: 19, sta: 18 }, icon: 'belt', sell: 15300 });
  epic('golemagg_sword', 'Magmaheart Greatblade', 'weapon', { wtype: 'sword', lvl: 60, dmg: [94, 140], speed: 3.2, stats: { str: 24, sta: 16 }, icon: 'sword', sell: 18000 });
  // Sulfuron Harbinger
  epic('sulfuron_dagger', "Harbinger's Fang", 'weapon', { wtype: 'dagger', lvl: 60, dmg: [52, 95], speed: 1.8, stats: { agi: 19, sta: 12 }, icon: 'dagger', sell: 17600 });
  epic('sulfuron_cord', "Flamewaker Priest's Cord", 'waist', { atype: 'cloth', lvl: 60, armor: 66, stats: { int: 16, spi: 11 }, sp: 18, icon: 'belt', sell: 15000 });
  // Majordomo Executus
  epic('executus_staff', 'Staff of the Majordomo', 'weapon', { wtype: 'staff', lvl: 60, dmg: [94, 135], speed: 3, stats: { int: 27, spi: 20 }, sp: 45, icon: 'staff', sell: 18400 });
  epic('executus_mace', 'Flamewaker Scepter', 'weapon', { wtype: 'mace', lvl: 60, dmg: [79, 126], speed: 2.7, stats: { str: 20, sta: 15 }, icon: 'mace', sell: 18000 });
  // Ragnaros: a lesser hammer forged in the Firelord's fire, and the chest pieces
  epic('ragnaros_hammer', 'Emberfall, Hammer of the Firelord', 'weapon', { wtype: 'mace', lvl: 60, dmg: [96, 146], speed: 3.4, stats: { str: 25, sta: 17 }, icon: 'mace', sell: 18400 });
  epic('ragnaros_robe', 'Robe of Living Flame', 'chest', { atype: 'cloth', lvl: 60, armor: 126, stats: { int: 26, spi: 19 }, sp: 34, icon: 'chest_cloth', sell: 17600 });
  epic('ragnaros_leather', 'Firehide Tunic', 'chest', { atype: 'leather', lvl: 60, armor: 279, stats: { agi: 26, sta: 19 }, icon: 'chest_leather', sell: 17600 });
  epic('ragnaros_mail', 'Magmaforged Hauberk', 'chest', { atype: 'mail', lvl: 60, armor: 522, stats: { str: 26, sta: 22 }, icon: 'chest_mail', sell: 17800 });

  Object.assign(D.MOBS, {
    // trash
    core_hound: { name: 'Core Hound', lvl: [60, 60], family: 'beast', drops: [['gold_dust', 0.2]] },
    molten_giant: { name: 'Molten Giant', lvl: [60, 60], family: 'giant', hpMult: 1.35, drops: [['gold_dust', 0.35]] },
    firelord: { name: 'Firelord', lvl: [60, 60], family: 'elemental', hpMult: 1.15, drops: [['gold_dust', 0.3]] },
    core_surger: { name: 'Lava Surger', lvl: [60, 60], family: 'elemental', drops: [['gold_dust', 0.25]] },
    flamewaker_guard: { name: 'Flamewaker Guard', lvl: [60, 60], family: 'elemental', hpMult: 1.2, drops: [['gold_dust', 0.3]], aggro: 'The master sleeps. You will not wake him.' },
    // boss adds
    firesworn: { name: 'Firesworn', lvl: [60, 60], family: 'elemental', hpMult: 0.55, dmgMult: 0.5, drops: [] },
    core_rager: { name: 'Core Rager', lvl: [60, 60], family: 'beast', hpMult: 0.6, dmgMult: 0.45, drops: [] },
    flamewaker_priest: { name: 'Flamewaker Priest', lvl: [60, 60], family: 'elemental', hpMult: 0.8, drops: [['gold_dust', 0.2]] },
    flamewaker_elite: { name: 'Flamewaker Elite', lvl: [60, 60], family: 'elemental', hpMult: 0.8, dmgMult: 0.6, drops: [['gold_dust', 0.3]] },
    flamewaker_healer: { name: 'Flamewaker Healer', lvl: [60, 60], family: 'elemental', hpMult: 0.6, dmgMult: 0.5, special: 'cook', specialText: 'The Flamewaker Healer knits its flames back together.', drops: [['gold_dust', 0.2]] },
    son_of_flame: { name: 'Son of Flame', lvl: [60, 60], family: 'elemental', hpMult: 0.9, drops: [] },
    // bosses
    magmadar: { name: 'Magmadar', lvl: [60, 60], family: 'beast', boss: true, special: 'slam', specialText: 'Magmadar sinks both jaws into you!', loot: ['magmadar_legs', 'magmadar_cloak', 'garr_bracers'] },
    garr: { name: 'Garr', lvl: [60, 60], family: 'elemental', boss: true, dmgMult: 0.9, special: 'whirl', specialText: 'Garr sends a pulse of fire through the cavern!', loot: ['garr_bracers', 'garr_ring', 'magmadar_cloak'] },
    baron_geddon: { name: 'Baron Geddon', lvl: [60, 60], family: 'elemental', boss: true, special: 'molten', specialText: 'Baron Geddon makes you a living bomb!', loot: ['geddon_boots', 'geddon_gloves', 'garr_ring'] },
    golemagg: { name: 'Golemagg the Incinerator', lvl: [60, 60], family: 'giant', boss: true, special: 'slam', specialText: 'Golemagg brings his fists down on you!', loot: ['golemagg_belt', 'golemagg_sword', 'magmadar_legs'] },
    sulfuron_harbinger: { name: 'Sulfuron Harbinger', lvl: [60, 60], family: 'elemental', boss: true, hpMult: 0.85, special: 'kelris', summon: 'flamewaker_priest', specialText: 'Sulfuron calls another priest to the fire!', loot: ['sulfuron_dagger', 'sulfuron_cord', 'geddon_gloves'], aggro: 'The Firelord\'s herald does not kneel to thieves.' },
    majordomo_executus: { name: 'Majordomo Executus', lvl: [60, 60], family: 'elemental', boss: true, hpMult: 0.8, dmgMult: 0.85, special: 'whirl', specialText: 'Majordomo Executus looses a wave of flame!', loot: ['executus_staff', 'executus_mace', 'sulfuron_cord'], qdrops: [['executus_rune', 1]], aggro: 'You walk uninvited in the Firelord\'s house. You will leave it as ash.' },
    ragnaros: { name: 'Ragnaros', lvl: [60, 60], family: 'elemental', boss: true, hpMult: 1.25, dmgMult: 1.75, special: 'kelris', summon: 'son_of_flame', specialText: 'Ragnaros calls a Son of Flame out of the lava!', loot: ['ragnaros_hammer', 'ragnaros_robe', 'ragnaros_leather', 'ragnaros_mail'], qdrops: [['firelord_essence', 1]], aggro: 'You dug me out of my sleep for this? Then take the fire you came for.' },
  });

  // the gate: down from Blackrock Mountain into its fiery heart
  Object.assign(D.PLACES, {
    molten_core_gate: { name: 'The Molten Core', zone: 'Burning Steppes', region: D.PLACES.blackrock_mountain.region, scene: 'molten_core_gate', lvl: [60, 60], mobs: [], pool: 0, npcs: [], links: { blackrock_mountain: 20 } },
  });
  D.PLACES.blackrock_mountain.links.molten_core_gate = 20;

  const A = (id, q) => { q.faction = 'alliance'; D.QUESTS[id] = q; };
  const H = (id, q) => { q.faction = 'horde'; D.QUESTS[id] = q; };
  A('mc_executus_a', { name: 'The Firelord\'s Steward', lvl: 60, giver: 'helendis', turnin: 'helendis', dungeon: 'molten_core', text: 'Majordomo Executus keeps the house of Ragnaros. His flamewakers tend the runes that feed the fire below. Break him and bring me the rune he carries. I want to know what it binds.',
    objs: [{ type: 'collect', item: 'executus_rune', n: 1 }], reward: { choice: ['fam_ring_rare60'] } });
  H('mc_executus_h', { name: 'The Firelord\'s Steward', lvl: 60, giver: 'gorzeeki', turnin: 'gorzeeki', dungeon: 'molten_core', text: 'The Firelord has a servant who runs his house for him. Majordomo Executus. He carries a binding rune. Bring it to me. I have plans for it.',
    objs: [{ type: 'collect', item: 'executus_rune', n: 1 }], reward: { choice: ['fam_ring_rare60'] } });
  A('mc_firelord_a', { name: 'The Firelord Wakes', lvl: 60, giver: 'marshal_maxwell', turnin: 'marshal_maxwell', dungeon: 'molten_core', text: 'The Emperor is dead, and the mountain has not gone quiet. The Dark Iron dug for Ragnaros for two hundred years. With Thaurissan gone, nothing keeps their master asleep. Go down into the Molten Core and put him back in the fire. Bring me his essence.',
    objs: [{ type: 'collect', item: 'firelord_essence', n: 1 }], reward: { choice: ['fam_back_rare60'] } });
  H('mc_firelord_h', { name: 'The Firelord Wakes', lvl: 60, giver: 'thal_kaur', turnin: 'thal_kaur', dungeon: 'molten_core', text: 'The Emperor\'s fall woke something worse. Ragnaros stirs in the Molten Core, and the whole mountain shakes with him. The Warchief will not wait for him to climb out. Take nine others down there and bring back his essence.',
    objs: [{ type: 'collect', item: 'firelord_essence', n: 1 }], reward: { choice: ['fam_back_rare60'] } });

  Object.assign(D.DUNGEONS, {
    molten_core: { name: 'The Molten Core', raid: true, minLvl: 60, par: 720, size: 10, trashMult: { hp: 3.3, dmg: 2.2 }, bossMult: { hp: 17, dmg: 7.2 }, pulls: [
      { scene: 'mc_caverns', label: 'The lava caverns', mobs: ['core_hound', 'core_hound', 'core_surger'] },
      { scene: 'mc_caverns', label: 'Molten giants', mobs: ['molten_giant', 'molten_giant'] },
      { scene: 'mc_caverns', label: 'Magmadar', mobs: ['magmadar'], boss: true },
      { scene: 'mc_caverns', label: 'The firelords', mobs: ['firelord', 'core_surger'] },
      { scene: 'mc_caverns', label: 'Garr', mobs: ['garr', 'firesworn', 'firesworn'], boss: true },
      { scene: 'mc_halls', label: 'The rune-lit halls', mobs: ['flamewaker_guard', 'flamewaker_guard', 'firelord'] },
      { scene: 'mc_halls', label: 'Baron Geddon', mobs: ['baron_geddon'], boss: true },
      { scene: 'mc_halls', label: 'A core hound pack', mobs: ['core_hound', 'core_hound', 'core_hound'] },
      { scene: 'mc_halls', label: 'Golemagg the Incinerator', mobs: ['golemagg', 'core_rager', 'core_rager'], boss: true },
      { scene: 'mc_halls', label: 'Sulfuron Harbinger', mobs: ['sulfuron_harbinger', 'flamewaker_priest'], boss: true },
      { scene: 'mc_domain', label: "The Majordomo's guard", mobs: ['molten_giant', 'flamewaker_guard', 'core_surger'] },
      { scene: 'mc_domain', label: 'Majordomo Executus', mobs: ['majordomo_executus', 'flamewaker_elite', 'flamewaker_healer'], boss: true },
      { scene: 'mc_lake', label: 'Ragnaros', mobs: ['ragnaros'], boss: true },
    ] },
  });
  Object.assign(D.ACTIVITIES, {
    molten_core: { name: 'The Molten Core', dungeon: 'molten_core', where: 'molten_core_gate', size: 10, minLvl: 60, maxLvl: 60, desc: 'Raid beneath Blackrock Mountain. 10 players. Both factions.' },
  });
})(typeof window !== 'undefined' ? window : globalThis);
