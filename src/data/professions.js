// Professions (v3): three gathering skills and four crafts, skill 1–150 for now (Apprentice 75, Journeyman 150).
// Loads after the zones: it adds trainers to the cities and hubs, and reads place levels to decide what grows where.
// Rules live in game.js (G.prof*); this file is only data.
(function (root) {
  const D = root.D;

  // ---- the professions. Two primary professions per character, as in the original game.
  D.PROFESSIONS = {
    mining: { name: 'Mining', icon: 'prof_mining', kind: 'gather', verb: 'Mine', desc: 'Mine ore veins in the wild, and smelt ore into bars. Blacksmiths need the bars.' },
    herbalism: { name: 'Herbalism', icon: 'prof_herbalism', kind: 'gather', verb: 'Pick', desc: 'Pick herbs in the wild. Alchemists turn them into potions and elixirs.' },
    skinning: { name: 'Skinning', icon: 'prof_skinning', kind: 'gather', verb: 'Skin', desc: 'Skin the beasts you kill for leather. It happens as you loot. Leatherworkers need it.' },
    blacksmithing: { name: 'Blacksmithing', icon: 'prof_blacksmithing', kind: 'craft', desc: 'Forge mail armour, weapons and sharpening stones from metal bars.' },
    alchemy: { name: 'Alchemy', icon: 'prof_alchemy', kind: 'craft', desc: 'Brew healing and mana potions, and elixirs that last an hour.' },
    leatherworking: { name: 'Leatherworking', icon: 'prof_leatherworking', kind: 'craft', desc: 'Stitch leather armour and armour kits that add armour to your gear for good.' },
    tailoring: { name: 'Tailoring', icon: 'prof_tailoring', kind: 'craft', desc: 'Sew cloth armour and bags from the linen and wool that humanoids drop.' },
  };
  D.PROF_MAX = 2;
  // Ranks are bought from a profession trainer. Expert (225) comes with the level-30 zones.
  D.PROF_RANKS = [
    { name: 'Apprentice', max: 75, lvl: 5, skill: 0, cost: 100 },
    { name: 'Journeyman', max: 150, lvl: 10, skill: 50, cost: 5000 },
  ];
  // Gathering: what each node needs, and the colour bands above that (orange, yellow, green, then grey).
  D.NODES = {
    copper: { name: 'Copper Vein', prof: 'mining', skill: 1, item: 'copper_ore', n: [1, 3], extra: ['rough_stone', 0.5] },
    tin: { name: 'Tin Vein', prof: 'mining', skill: 65, item: 'tin_ore', n: [1, 2], extra: ['coarse_stone', 0.5] },
    silver: { name: 'Silver Vein', prof: 'mining', skill: 75, item: 'silver_ore', n: [1, 1], extra: ['coarse_stone', 0.3] },
    peacebloom: { name: 'Peacebloom', prof: 'herbalism', skill: 1, item: 'peacebloom', n: [1, 3] },
    silverleaf: { name: 'Silverleaf', prof: 'herbalism', skill: 1, item: 'silverleaf', n: [1, 3] },
    earthroot: { name: 'Earthroot', prof: 'herbalism', skill: 15, item: 'earthroot', n: [1, 3] },
    mageroyal: { name: 'Mageroyal', prof: 'herbalism', skill: 50, item: 'mageroyal', n: [1, 3] },
    briarthorn: { name: 'Briarthorn', prof: 'herbalism', skill: 70, item: 'briarthorn', n: [1, 3] },
    bruiseweed: { name: 'Bruiseweed', prof: 'herbalism', skill: 100, item: 'bruiseweed', n: [1, 3] },
  };
  D.GATHER_BANDS = [25, 50, 100]; // skill below req+25 always gains, below +50 half the time, below +100 a quarter
  // Which nodes grow at a place, by the place's level. Weights; the game rolls one per spawn.
  D.nodeTable = function (L) {
    if (L <= 9) return { ore: [['copper', 1]], herb: [['peacebloom', 3], ['silverleaf', 3], ['earthroot', L >= 5 ? 2 : 0], ['mageroyal', L >= 8 ? 1 : 0]] };
    if (L <= 15) return { ore: [['copper', 4], ['tin', 5], ['silver', L >= 13 ? 1 : 0]], herb: [['silverleaf', 1], ['earthroot', 3], ['mageroyal', 3], ['briarthorn', L >= 12 ? 2 : 0]] };
    return { ore: [['copper', 1], ['tin', 7], ['silver', 2]], herb: [['mageroyal', 2], ['briarthorn', 4], ['bruiseweed', L >= 18 ? 4 : 1]] };
  };
  // Skinning needs skill by the beast's level, like the original game.
  D.skinSkill = (lvl) => (lvl <= 10 ? 1 : lvl <= 20 ? (lvl - 10) * 10 : lvl * 5);
  D.skinLeather = (lvl) => (lvl >= 20 ? 'medium_leather' : 'light_leather');

  // ---- materials (stack to 20; slot 'mat')
  const mat = (id, name, icon, sell, o) => D.item(id, Object.assign({ name, slot: 'mat', q: 1, icon, sell }, o));
  mat('copper_ore', 'Copper Ore', 'copper_ore', 5);
  mat('tin_ore', 'Tin Ore', 'tin_ore', 10);
  mat('silver_ore', 'Silver Ore', 'silver_ore', 75, { q: 2 });
  mat('rough_stone', 'Rough Stone', 'rough_stone', 2);
  mat('coarse_stone', 'Coarse Stone', 'coarse_stone', 6);
  mat('copper_bar', 'Copper Bar', 'copper_bar', 10);
  mat('tin_bar', 'Tin Bar', 'tin_bar', 20);
  mat('bronze_bar', 'Bronze Bar', 'bronze_bar', 25);
  mat('silver_bar', 'Silver Bar', 'silver_bar', 100, { q: 2 });
  mat('peacebloom', 'Peacebloom', 'peacebloom', 5);
  mat('silverleaf', 'Silverleaf', 'silverleaf', 5);
  mat('earthroot', 'Earthroot', 'earthroot', 10);
  mat('mageroyal', 'Mageroyal', 'mageroyal', 15);
  mat('briarthorn', 'Briarthorn', 'briarthorn', 20);
  mat('bruiseweed', 'Bruiseweed', 'bruiseweed', 25);
  mat('light_leather', 'Light Leather', 'light_leather', 10);
  mat('medium_leather', 'Medium Leather', 'medium_leather', 25);
  mat('linen_bolt', 'Bolt of Linen Cloth', 'linen_bolt', 15);
  mat('wool_cloth', 'Wool Cloth', 'wool_cloth', 10);
  mat('wool_bolt', 'Bolt of Woolen Cloth', 'wool_bolt', 35);
  mat('empty_vial', 'Empty Vial', 'vial', 1, { cost: 4 });
  mat('coarse_thread', 'Coarse Thread', 'coarse_thread', 3, { cost: 10 });
  // Linen was vendor trash before v3. It is a tailoring material now (existing stacks keep working).
  D.ITEMS.linen_cloth.slot = 'mat'; D.ITEMS.linen_cloth.icon = 'linen_bolt';

  // ---- consumables
  // potion: instant, usable in combat, shared 2 min cooldown. elixir: 1 hour, one at a time. stone: weapon damage for 30 min.
  D.item('minor_healing_potion', { name: 'Minor Healing Potion', slot: 'potion', q: 1, lvl: 1, icon: 'potion_red', heal: [70, 90], sell: 10 });
  D.item('lesser_healing_potion', { name: 'Lesser Healing Potion', slot: 'potion', q: 1, lvl: 8, icon: 'potion_red', heal: [140, 180], sell: 25 });
  D.item('healing_potion', { name: 'Healing Potion', slot: 'potion', q: 1, lvl: 16, icon: 'potion_red', heal: [280, 360], sell: 50 });
  D.item('minor_mana_potion', { name: 'Minor Mana Potion', slot: 'potion', q: 1, lvl: 5, icon: 'potion_blue', mana: [140, 180], sell: 20 });
  D.item('lesser_mana_potion', { name: 'Lesser Mana Potion', slot: 'potion', q: 1, lvl: 14, icon: 'potion_blue', mana: [280, 360], sell: 40 });
  D.item('elixir_lions_strength', { name: "Elixir of Lion's Strength", slot: 'elixir', q: 1, lvl: 1, icon: 'elixir_gold', buff: { str: 4 }, sell: 10 });
  D.item('elixir_minor_defense', { name: 'Elixir of Minor Defense', slot: 'elixir', q: 1, lvl: 1, icon: 'elixir_green', buff: { armor: 50 }, sell: 10 });
  D.item('elixir_minor_agility', { name: 'Elixir of Minor Agility', slot: 'elixir', q: 1, lvl: 2, icon: 'elixir_green', buff: { agi: 4 }, sell: 20 });
  D.item('elixir_minor_fortitude', { name: 'Elixir of Minor Fortitude', slot: 'elixir', q: 1, lvl: 2, icon: 'elixir_gold', buff: { sta: 3 }, sell: 20 });
  D.item('elixir_wisdom', { name: 'Elixir of Wisdom', slot: 'elixir', q: 1, lvl: 10, icon: 'elixir_green', buff: { int: 6 }, sell: 40 });
  D.item('elixir_fortitude', { name: 'Elixir of Fortitude', slot: 'elixir', q: 2, lvl: 18, icon: 'elixir_gold', buff: { sta: 8 }, sell: 80 });
  D.item('rough_sharpening_stone', { name: 'Rough Sharpening Stone', slot: 'stone', q: 1, lvl: 1, icon: 'sharpening_stone', wdmg: 2, sell: 3 });
  D.item('coarse_sharpening_stone', { name: 'Coarse Sharpening Stone', slot: 'stone', q: 1, lvl: 15, icon: 'weightstone', wdmg: 4, sell: 10 });
  D.item('light_armor_kit', { name: 'Light Armor Kit', slot: 'kit', q: 1, lvl: 1, icon: 'armor_kit', kit: 8, sell: 10 });
  D.item('medium_armor_kit', { name: 'Medium Armor Kit', slot: 'kit', q: 1, lvl: 15, icon: 'armor_kit', kit: 16, sell: 30 });
  // bags: equip up to four; each adds its slots to your 16-slot backpack
  D.item('small_pouch', { name: 'Small Brown Pouch', slot: 'bag', q: 1, lvl: 1, icon: 'bag_linen', bag: 4, sell: 25, cost: 2500 });
  D.item('linen_bag', { name: 'Linen Bag', slot: 'bag', q: 1, lvl: 1, icon: 'bag_linen', bag: 6, sell: 60 });
  D.item('woolen_bag', { name: 'Woolen Bag', slot: 'bag', q: 1, lvl: 1, icon: 'bag_wool', bag: 8, sell: 150 });
  D.BAG_SLOTS = 4;

  // ---- crafted gear, on the same curve as random drops (G.genGear), with fixed stats
  const QM = [0.8, 1, 1.1, 1.22, 1.35];
  function gear(id, o) {
    const it = Object.assign({ q: 2, crafted: true }, o);
    const qm = QM[it.q], L = it.lvl;
    if (it.slot === 'weapon') {
      const Wb = D.WEAPON_BASES[it.wtype];
      const dps = (1.6 + L * 0.45) * qm * (it.wtype === 'staff' ? 1.35 : 1);
      it.speed = it.speed || Wb.speed;
      it.dmg = [Math.max(1, Math.round(dps * it.speed * 0.7)), Math.max(2, Math.round(dps * it.speed * 1.3))];
      it.icon = it.icon || Wb.icon;
    } else {
      it.armor = Math.max(1, Math.round((D.SLOT_ARMOR[it.slot] || 3) * (it.atype ? D.GEAR_BASES[it.atype].arm : 0.3) * (L + 2) * 0.9 * qm));
      it.icon = it.icon || (it.slot === 'chest' ? 'chest_' + (it.atype || 'cloth') : D.SLOT_ICON[it.slot]);
    }
    if (it.q >= 2 && it.st) {
      const budget = Math.max(1, Math.round(L * (it.q === 2 ? 0.55 : 0.9) + (it.q === 3 ? 2 : 1)));
      const ks = it.st; it.stats = {}; let left = budget;
      ks.forEach((k, i) => { const v = i === ks.length - 1 ? Math.max(1, left) : Math.max(1, Math.round(budget / ks.length)); it.stats[k] = v; left -= v; });
    }
    delete it.st;
    it.sell = Math.max(1, Math.round((L * L * 0.9 + 4) * [0.5, 1, 3, 7, 12][it.q]));
    D.item(id, it);
  }
  // blacksmithing
  gear('copper_bracers', { name: 'Copper Bracers', slot: 'wrist', atype: 'mail', q: 1, lvl: 3 });
  gear('copper_mace', { name: 'Copper Mace', slot: 'weapon', wtype: 'mace', q: 1, lvl: 4 });
  gear('copper_shortsword', { name: 'Copper Shortsword', slot: 'weapon', wtype: 'sword', q: 1, lvl: 4 });
  gear('copper_chain_belt', { name: 'Copper Chain Belt', slot: 'waist', atype: 'mail', lvl: 7, st: ['str', 'sta'] });
  gear('runed_copper_gauntlets', { name: 'Runed Copper Gauntlets', slot: 'hands', atype: 'mail', lvl: 9, st: ['str', 'sta'] });
  gear('rough_bronze_boots', { name: 'Rough Bronze Boots', slot: 'feet', atype: 'mail', lvl: 17, st: ['sta', 'str'] });
  gear('bronze_mace', { name: 'Bronze Mace', slot: 'weapon', wtype: 'mace', lvl: 19, st: ['str', 'sta'] });
  gear('bronze_shortsword', { name: 'Bronze Shortsword', slot: 'weapon', wtype: 'sword', lvl: 19, st: ['str', 'agi'] });
  gear('silvered_bronze_boots', { name: 'Silvered Bronze Boots', slot: 'feet', atype: 'mail', lvl: 22, st: ['str', 'sta'] });
  gear('silvered_bronze_gauntlets', { name: 'Silvered Bronze Gauntlets', slot: 'hands', atype: 'mail', lvl: 23, st: ['str', 'sta'] });
  gear('silvered_bronze_breastplate', { name: 'Silvered Bronze Breastplate', slot: 'chest', atype: 'mail', q: 3, lvl: 25, st: ['str', 'sta'] });
  // leatherworking
  gear('handstitched_leather_boots', { name: 'Handstitched Leather Boots', slot: 'feet', atype: 'leather', q: 1, lvl: 3 });
  gear('handstitched_leather_cloak', { name: 'Handstitched Leather Cloak', slot: 'back', q: 1, lvl: 4 });
  gear('embossed_leather_vest', { name: 'Embossed Leather Vest', slot: 'chest', atype: 'leather', lvl: 9, st: ['agi', 'sta'] });
  gear('embossed_leather_gloves', { name: 'Embossed Leather Gloves', slot: 'hands', atype: 'leather', lvl: 11, st: ['agi', 'sta'] });
  gear('fine_leather_belt', { name: 'Fine Leather Belt', slot: 'waist', atype: 'leather', lvl: 14, st: ['agi', 'sta'] });
  gear('dark_leather_boots', { name: 'Dark Leather Boots', slot: 'feet', atype: 'leather', lvl: 18, st: ['agi', 'sta'] });
  gear('dark_leather_tunic', { name: 'Dark Leather Tunic', slot: 'chest', atype: 'leather', lvl: 20, st: ['agi', 'sta'] });
  gear('hillmans_leather_gloves', { name: "Hillman's Leather Gloves", slot: 'hands', atype: 'leather', lvl: 23, st: ['sta', 'agi'] });
  gear('toughened_leather_leggings', { name: 'Toughened Leather Leggings', slot: 'legs', atype: 'leather', q: 3, lvl: 25, st: ['agi', 'sta'] });
  // tailoring
  gear('linen_cloak', { name: 'Linen Cloak', slot: 'back', q: 1, lvl: 3 });
  gear('brown_linen_vest', { name: 'Brown Linen Vest', slot: 'chest', atype: 'cloth', q: 1, lvl: 5 });
  gear('heavy_linen_gloves', { name: 'Heavy Linen Gloves', slot: 'hands', atype: 'cloth', lvl: 8, st: ['int', 'sta'] });
  gear('reinforced_linen_cape', { name: 'Reinforced Linen Cape', slot: 'back', lvl: 12, st: ['sta', 'int'] });
  gear('woolen_cape', { name: 'Woolen Cape', slot: 'back', lvl: 15, st: ['int', 'spi'] });
  gear('heavy_woolen_gloves', { name: 'Heavy Woolen Gloves', slot: 'hands', atype: 'cloth', lvl: 16, st: ['int', 'sta'] });
  gear('gray_woolen_robe', { name: 'Gray Woolen Robe', slot: 'chest', atype: 'cloth', lvl: 19, st: ['int', 'spi'] });
  gear('heavy_woolen_pants', { name: 'Heavy Woolen Pants', slot: 'legs', atype: 'cloth', lvl: 21, st: ['int', 'sta'] });
  gear('sorcerers_woolen_robe', { name: "Sorcerer's Woolen Robe", slot: 'chest', atype: 'cloth', q: 3, lvl: 25, st: ['int', 'spi'], sp: 8 });

  // ---- recipes. sk = [learn, yellow, green, grey]; default [s, s+25, s+37, s+50].
  // rare: taught by a recipe item that drops in dungeons, not by the trainer.
  const R = D.RECIPES = {};
  const rec = (id, prof, s, makes, mats, o) => { R[id] = Object.assign({ id, prof, sk: [s, s + 25, s + 37, s + 50], makes, n: 1, mats }, o); };
  // mining (smelting)
  rec('smelt_copper', 'mining', 1, 'copper_bar', { copper_ore: 1 }, { sk: [1, 25, 47, 70] });
  rec('smelt_tin', 'mining', 65, 'tin_bar', { tin_ore: 1 }, { sk: [65, 65, 70, 75] });
  rec('smelt_bronze', 'mining', 65, 'bronze_bar', { copper_bar: 1, tin_bar: 1 }, { n: 2, sk: [65, 65, 90, 115] });
  rec('smelt_silver', 'mining', 75, 'silver_bar', { silver_ore: 1 }, { sk: [75, 115, 122, 130] });
  // blacksmithing
  rec('bs_rough_stone', 'blacksmithing', 1, 'rough_sharpening_stone', { rough_stone: 1 }, { sk: [1, 15, 35, 55] });
  rec('bs_copper_bracers', 'blacksmithing', 1, 'copper_bracers', { copper_bar: 2 }, { sk: [1, 20, 40, 60] });
  rec('bs_copper_mace', 'blacksmithing', 15, 'copper_mace', { copper_bar: 6, linen_cloth: 2 });
  rec('bs_copper_shortsword', 'blacksmithing', 25, 'copper_shortsword', { copper_bar: 6, linen_cloth: 2 });
  rec('bs_copper_chain_belt', 'blacksmithing', 35, 'copper_chain_belt', { copper_bar: 6 });
  rec('bs_runed_gauntlets', 'blacksmithing', 50, 'runed_copper_gauntlets', { copper_bar: 8, rough_stone: 2 });
  rec('bs_coarse_stone', 'blacksmithing', 65, 'coarse_sharpening_stone', { coarse_stone: 1 }, { sk: [65, 65, 72, 80] });
  rec('bs_bronze_boots', 'blacksmithing', 95, 'rough_bronze_boots', { bronze_bar: 6, coarse_stone: 1 });
  rec('bs_bronze_mace', 'blacksmithing', 105, 'bronze_mace', { bronze_bar: 6, light_leather: 1 });
  rec('bs_bronze_shortsword', 'blacksmithing', 110, 'bronze_shortsword', { bronze_bar: 6, light_leather: 1 });
  rec('bs_silvered_boots', 'blacksmithing', 125, 'silvered_bronze_boots', { bronze_bar: 6, silver_bar: 1 });
  rec('bs_silvered_gauntlets', 'blacksmithing', 135, 'silvered_bronze_gauntlets', { bronze_bar: 8, silver_bar: 1 });
  rec('bs_silvered_breastplate', 'blacksmithing', 140, 'silvered_bronze_breastplate', { bronze_bar: 10, silver_bar: 2 }, { rare: true });
  // alchemy
  rec('al_minor_healing', 'alchemy', 1, 'minor_healing_potion', { peacebloom: 1, silverleaf: 1, empty_vial: 1 }, { sk: [1, 55, 75, 95] });
  rec('al_lions_strength', 'alchemy', 1, 'elixir_lions_strength', { earthroot: 1, silverleaf: 1, empty_vial: 1 }, { sk: [1, 45, 65, 85] });
  rec('al_minor_defense', 'alchemy', 5, 'elixir_minor_defense', { silverleaf: 2, empty_vial: 1 });
  rec('al_minor_mana', 'alchemy', 25, 'minor_mana_potion', { mageroyal: 1, silverleaf: 1, empty_vial: 1 }, { sk: [25, 65, 85, 105] });
  rec('al_minor_agility', 'alchemy', 50, 'elixir_minor_agility', { earthroot: 1, mageroyal: 1, empty_vial: 1 });
  rec('al_minor_fortitude', 'alchemy', 50, 'elixir_minor_fortitude', { earthroot: 2, peacebloom: 1, empty_vial: 1 });
  rec('al_lesser_healing', 'alchemy', 55, 'lesser_healing_potion', { minor_healing_potion: 1, briarthorn: 1 }, { sk: [55, 85, 105, 125] });
  rec('al_wisdom', 'alchemy', 90, 'elixir_wisdom', { mageroyal: 1, briarthorn: 1, empty_vial: 1 });
  rec('al_healing', 'alchemy', 110, 'healing_potion', { bruiseweed: 1, briarthorn: 1, empty_vial: 1 }, { sk: [110, 135, 155, 175] });
  rec('al_lesser_mana', 'alchemy', 120, 'lesser_mana_potion', { mageroyal: 1, bruiseweed: 1, empty_vial: 1 }, { sk: [120, 145, 165, 185] });
  rec('al_fortitude', 'alchemy', 135, 'elixir_fortitude', { bruiseweed: 2, briarthorn: 1, empty_vial: 1 }, { rare: true });
  // leatherworking
  rec('lw_light_kit', 'leatherworking', 1, 'light_armor_kit', { light_leather: 1 }, { sk: [1, 30, 45, 60] });
  rec('lw_hs_boots', 'leatherworking', 1, 'handstitched_leather_boots', { light_leather: 2, coarse_thread: 1 }, { sk: [1, 40, 55, 70] });
  rec('lw_hs_cloak', 'leatherworking', 10, 'handstitched_leather_cloak', { light_leather: 2, coarse_thread: 1 });
  rec('lw_embossed_vest', 'leatherworking', 40, 'embossed_leather_vest', { light_leather: 8, coarse_thread: 4 });
  rec('lw_embossed_gloves', 'leatherworking', 55, 'embossed_leather_gloves', { light_leather: 3, coarse_thread: 2 });
  rec('lw_fine_belt', 'leatherworking', 80, 'fine_leather_belt', { light_leather: 6, coarse_thread: 2 });
  rec('lw_medium_kit', 'leatherworking', 100, 'medium_armor_kit', { medium_leather: 3, coarse_thread: 1 }, { sk: [100, 115, 122, 130] });
  rec('lw_dark_boots', 'leatherworking', 100, 'dark_leather_boots', { medium_leather: 4, coarse_thread: 2 });
  rec('lw_dark_tunic', 'leatherworking', 110, 'dark_leather_tunic', { medium_leather: 6, coarse_thread: 2 });
  rec('lw_hillmans_gloves', 'leatherworking', 135, 'hillmans_leather_gloves', { medium_leather: 5, coarse_thread: 2 });
  rec('lw_toughened_leggings', 'leatherworking', 140, 'toughened_leather_leggings', { medium_leather: 10, coarse_thread: 4 }, { rare: true });
  // tailoring
  rec('tl_linen_bolt', 'tailoring', 1, 'linen_bolt', { linen_cloth: 2 }, { sk: [1, 25, 37, 50] });
  rec('tl_linen_cloak', 'tailoring', 1, 'linen_cloak', { linen_bolt: 1, coarse_thread: 1 }, { sk: [1, 35, 47, 60] });
  rec('tl_brown_vest', 'tailoring', 10, 'brown_linen_vest', { linen_bolt: 1, coarse_thread: 1 });
  rec('tl_heavy_linen_gloves', 'tailoring', 35, 'heavy_linen_gloves', { linen_bolt: 2, coarse_thread: 1 });
  rec('tl_linen_bag', 'tailoring', 45, 'linen_bag', { linen_bolt: 3, coarse_thread: 3 }, { sk: [45, 70, 82, 95] });
  rec('tl_reinforced_cape', 'tailoring', 60, 'reinforced_linen_cape', { linen_bolt: 2, coarse_thread: 3 });
  rec('tl_wool_bolt', 'tailoring', 75, 'wool_bolt', { wool_cloth: 3 }, { sk: [75, 100, 112, 125] });
  rec('tl_woolen_cape', 'tailoring', 75, 'woolen_cape', { wool_bolt: 1, coarse_thread: 1 });
  rec('tl_woolen_bag', 'tailoring', 85, 'woolen_bag', { wool_bolt: 3, coarse_thread: 1 }, { sk: [85, 110, 122, 135] });
  rec('tl_heavy_woolen_gloves', 'tailoring', 95, 'heavy_woolen_gloves', { wool_bolt: 2, coarse_thread: 1 });
  rec('tl_gray_robe', 'tailoring', 105, 'gray_woolen_robe', { wool_bolt: 3, coarse_thread: 2 });
  rec('tl_heavy_woolen_pants', 'tailoring', 115, 'heavy_woolen_pants', { wool_bolt: 3, coarse_thread: 2 });
  rec('tl_sorcerers_robe', 'tailoring', 140, 'sorcerers_woolen_robe', { wool_bolt: 6, silver_bar: 1, coarse_thread: 2 }, { rare: true });
  // recipe items for the rare ones (dungeon bosses and named rares drop them)
  const rname = { blacksmithing: 'Plans', alchemy: 'Recipe', leatherworking: 'Pattern', tailoring: 'Pattern' };
  D.RARE_RECIPES = [];
  for (const id in R) if (R[id].rare) {
    const r = R[id], mk = D.ITEMS[r.makes];
    D.item('rc_' + id, { name: `${rname[r.prof]}: ${mk.name}`, slot: 'recipe', q: 2, icon: 'journal', teaches: id, sell: 250 });
    D.RARE_RECIPES.push('rc_' + id);
  }

  // ---- trainers: one artisan per city and level-10 hub, per faction
  Object.assign(D.NPCS, {
    crafts_alliance: { name: 'Artisan Hollis', title: 'Profession Trainer' },
    crafts_horde: { name: 'Artisan Grunna', title: 'Profession Trainer' },
    stable_alliance: { name: 'Stablemaster Rowan', title: 'Riding Trainer' },
    stable_horde: { name: 'Stablemaster Ogunaro', title: 'Riding Trainer' },
  });
  const TRAIN = { crafts_alliance: ['stormwind', 'ironforge', 'darnassus', 'sentinel_hill', 'lakeshire', 'darkshire', 'astranaar', 'menethil_harbor', 'rebel_camp', 'refuge_pointe', 'gadgetzan', 'feathermoon_stronghold'], crafts_horde: ['orgrimmar', 'thunder_bluff', 'undercity', 'crossroads', 'sun_rock_retreat', 'tarren_mill', 'splintertree_post', 'grom_gol', 'hammerfall', 'gadgetzan', 'camp_mojache', 'marshals_refuge', 'flame_crest', 'the_bulwark', 'everlook', 'bloodtide_landing'] };
  for (const npc in TRAIN) for (const p of TRAIN[npc]) if (D.PLACES[p] && !D.PLACES[p].npcs.includes(npc)) D.PLACES[p].npcs.push(npc);
  D.PROF_TRAINERS = TRAIN;
  // riding trainers in the capitals (v5.1)
  for (const [npc, caps] of [['stable_alliance', ['stormwind', 'ironforge', 'darnassus']], ['stable_horde', ['orgrimmar', 'thunder_bluff', 'undercity']]]) for (const p of caps) if (D.PLACES[p] && !D.PLACES[p].npcs.includes(npc)) D.PLACES[p].npcs.push(npc);
})(typeof window !== 'undefined' ? window : globalThis);
