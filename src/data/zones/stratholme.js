// Stratholme (dungeon, levels 58–60, v8): the burned city where Arthas culled Lordaeron's people. The Scarlet Crusade
// holds the living side, the Scourge the dead side under Baron Rivendare. Reached through Hearthglen, open to both factions.
(function (root) {
  const D = root.D;
  D.item('balnazzar_sigil', { name: "Balnazzar's Sigil", slot: 'quest', q: 1, icon: 'coin' });
  D.item('rivendare_seal', { name: "Rivendare's Seal", slot: 'quest', q: 1, icon: 'ring' });
  D.item('stratholme_ledger', { name: 'Stratholme Archive Ledger', slot: 'quest', q: 1, icon: 'journal' });
  const gear = (id, name, slot, o) => D.item(id, Object.assign({ name, slot, q: 3 }, o));
  gear('timmy_gloves', 'Grimgore Gauntlets', 'hands', { atype: 'mail', lvl: 58, armor: 310, stats: { str: 16, sta: 13 }, icon: 'gloves', sell: 11400 });
  gear('galford_boots', 'Archivist Slippers', 'feet', { atype: 'cloth', lvl: 58, armor: 70, stats: { int: 14, spi: 12 }, sp: 16, icon: 'boots', sell: 11200 });
  gear('balnazzar_blade', 'Dreadlord Edge', 'weapon', { wtype: 'sword', lvl: 59, dmg: [72, 120], speed: 2.6, stats: { agi: 18, str: 12 }, icon: 'sword', sell: 12600 });
  gear('balnazzar_mantle', 'Crimson Felt Cloak', 'back', { lvl: 59, armor: 80, stats: { sta: 14, int: 12 }, icon: 'cloak', sell: 12000 });
  gear('anastari_bracers', "Banshee's Bracers", 'wrist', { atype: 'leather', lvl: 59, armor: 110, stats: { agi: 14, sta: 11 }, icon: 'bracers', sell: 11600 });
  gear('ramstein_belt', 'Gorger Girdle', 'waist', { atype: 'mail', lvl: 59, armor: 320, stats: { str: 17, sta: 16 }, icon: 'belt', sell: 11800 });
  gear('rivendare_runeblade', 'Runeblade of Baron Rivendare', 'weapon', { wtype: 'sword', lvl: 60, dmg: [92, 140], speed: 3.2, stats: { str: 22, sta: 16 }, icon: 'sword', sell: 14000 });
  gear('rivendare_staff', 'Deathcharger Staff', 'weapon', { wtype: 'staff', lvl: 60, dmg: [90, 134], speed: 3, stats: { int: 23, spi: 18 }, sp: 40, icon: 'staff', sell: 13800 });
  gear('rivendare_robe', 'Robe of the Baron', 'chest', { atype: 'cloth', lvl: 60, armor: 126, stats: { int: 24, spi: 17 }, sp: 30, icon: 'chest_cloth', sell: 13600 });
  gear('rivendare_leather', 'Death Knight Jerkin', 'chest', { atype: 'leather', lvl: 60, armor: 284, stats: { agi: 24, sta: 18 }, icon: 'chest_leather', sell: 13600 });
  gear('rivendare_plate', "Baron's Deathplate", 'chest', { atype: 'mail', lvl: 60, armor: 526, stats: { str: 24, sta: 21 }, icon: 'chest_mail', sell: 13800 });

  Object.assign(D.MOBS, {
    crimson_guardsman: { name: 'Crimson Guardsman', lvl: [58, 59], family: 'humanoid', hpMult: 1.1, drops: [['thieves_coin', 0.55], ['linen_cloth', 0.35]], aggro: 'Burn the plague out of this city!' },
    crimson_conjuror: { name: 'Crimson Conjuror', lvl: [58, 59], family: 'humanoid', drops: [['thieves_coin', 0.55], ['linen_cloth', 0.4]] },
    skeletal_guardian: { name: 'Skeletal Guardian', lvl: [58, 59], family: 'undead', drops: [['thieves_coin', 0.4]] },
    bile_spewer: { name: 'Bile Spewer', lvl: [59, 60], family: 'undead', hpMult: 1.3, drops: [['rotting_flesh', 0.6]] },
    timmy_the_cruel: { name: 'Timmy the Cruel', lvl: [58, 58], family: 'undead', boss: true, special: 'whirl', specialText: 'Timmy the Cruel ravages everyone nearby!', loot: ['timmy_gloves', 'galford_boots'], aggro: 'TIMMY!' },
    archivist_galford: { name: 'Archivist Galford', lvl: [58, 58], family: 'humanoid', boss: true, special: 'molten', specialText: 'Galford sets the archive ablaze!', loot: ['galford_boots', 'timmy_gloves'], qdrops: [['stratholme_ledger', 1]], aggro: 'Burn it! Burn it all!' },
    balnazzar: { name: 'Balnazzar', lvl: [59, 59], family: 'demon', boss: true, special: 'kelris', summon: 'crimson_guardsman', specialText: 'Balnazzar raises the dead Crusaders!', loot: ['balnazzar_blade', 'balnazzar_mantle'], qdrops: [['balnazzar_sigil', 1]], aggro: 'Fools! The Crusade has served its purpose.' },
    baroness_anastari: { name: 'Baroness Anastari', lvl: [59, 59], family: 'undead', boss: true, special: 'molten', specialText: 'Baroness Anastari wails!', loot: ['anastari_bracers', 'balnazzar_mantle'] },
    ramstein_the_gorger: { name: 'Ramstein the Gorger', lvl: [59, 59], family: 'undead', boss: true, special: 'slam', specialText: 'Ramstein tramples the ground!', loot: ['ramstein_belt', 'anastari_bracers'] },
    baron_rivendare: { name: 'Baron Rivendare', lvl: [60, 60], family: 'undead', boss: true, special: 'kelris', summon: 'skeletal_guardian', specialText: 'Baron Rivendare raises a skeleton from the dead!', loot: ['rivendare_runeblade', 'rivendare_staff', 'rivendare_robe', 'rivendare_leather', 'rivendare_plate'], qdrops: [['rivendare_seal', 1]], aggro: 'Intruders! More pawns for my master.' },
  });

  const A = (id, q) => { q.faction = 'alliance'; D.QUESTS[id] = q; };
  const H = (id, q) => { q.faction = 'horde'; D.QUESTS[id] = q; };
  A('st_baron_a', { name: "Dead Man's Plea", lvl: 60, giver: 'argent_officer_a', turnin: 'argent_officer_a', dungeon: 'stratholme', text: 'Baron Rivendare rules the dead side of Stratholme for the Lich King. End him and bring me his seal.',
    objs: [{ type: 'collect', item: 'rivendare_seal', n: 1 }], reward: { choice: ['fam_weapon60'] } });
  H('st_baron_h', { name: "Dead Man's Plea", lvl: 60, giver: 'argent_officer_h', turnin: 'argent_officer_h', dungeon: 'stratholme', text: 'Baron Rivendare commands the Scourge in Stratholme. The Argent Dawn wants him gone.',
    objs: [{ type: 'collect', item: 'rivendare_seal', n: 1 }], reward: { choice: ['fam_weapon60'] } });
  A('st_balnazzar_a', { name: 'The True Masters', lvl: 59, giver: 'commander_ashlam', turnin: 'commander_ashlam', dungeon: 'stratholme', text: "The Crusade's Grand Crusader in Stratholme is not what he seems. Find out what leads them, and bring me proof.",
    objs: [{ type: 'collect', item: 'balnazzar_sigil', n: 1 }], reward: { choice: ['fam_back60'] } });
  H('st_balnazzar_h', { name: 'The True Masters', lvl: 59, giver: 'high_executor_derrington', turnin: 'high_executor_derrington', dungeon: 'stratholme', text: 'Our spies say a dreadlord leads the Scarlet Crusade in Stratholme. Bring me proof.',
    objs: [{ type: 'collect', item: 'balnazzar_sigil', n: 1 }], reward: { choice: ['fam_back60'] } });
  A('st_ledger_a', { name: 'The Archive', lvl: 58, giver: 'alchemist_arbington', turnin: 'alchemist_arbington', dungeon: 'stratholme', text: "Stratholme's archivist kept records of the grain shipments that carried the plague. Find his ledger.",
    objs: [{ type: 'collect', item: 'stratholme_ledger', n: 1 }], reward: { choice: ['fam_ring_rare60'] } });
  H('st_ledger_h', { name: 'The Archive', lvl: 58, giver: 'apothecary_dithers', turnin: 'apothecary_dithers', dungeon: 'stratholme', text: "The archivist's ledger names who shipped the plagued grain. The Society wants it.",
    objs: [{ type: 'collect', item: 'stratholme_ledger', n: 1 }], reward: { choice: ['fam_ring_rare60'] } });
  Object.assign(D.DUNGEONS, {
    stratholme: { name: 'Stratholme', minLvl: 58, par: 570, size: 5, trashMult: { hp: 2.2, dmg: 2.2 }, bossMult: { hp: 10, dmg: 4.3 }, pulls: [
      { scene: 'strat_city', label: 'King\'s Square', mobs: ['crimson_guardsman', 'crimson_conjuror'] },
      { scene: 'strat_city', label: 'Timmy the Cruel', mobs: ['timmy_the_cruel'], boss: true },
      { scene: 'strat_city', label: 'Archivist Galford', mobs: ['archivist_galford'], boss: true },
      { scene: 'strat_bastion', label: 'The Scarlet Bastion', mobs: ['crimson_guardsman', 'crimson_guardsman', 'crimson_conjuror'] },
      { scene: 'strat_bastion', label: 'Balnazzar', mobs: ['balnazzar'], boss: true },
      { scene: 'strat_ziggurat', label: 'The ziggurats', mobs: ['skeletal_guardian', 'bile_spewer'] },
      { scene: 'strat_ziggurat', label: 'Baroness Anastari', mobs: ['baroness_anastari'], boss: true },
      { scene: 'strat_ziggurat', label: 'Ramstein the Gorger', mobs: ['ramstein_the_gorger'], boss: true },
      { scene: 'strat_ziggurat', label: 'Baron Rivendare', mobs: ['baron_rivendare'], boss: true },
    ] },
  });
  Object.assign(D.ACTIVITIES, {
    stratholme: { name: 'Stratholme', dungeon: 'stratholme', where: 'stratholme_gate', size: 5, minLvl: 58, maxLvl: 60, desc: 'Dungeon in the Eastern Plaguelands. 5 players. Both factions.' },
  });
})(typeof window !== 'undefined' ? window : globalThis);
