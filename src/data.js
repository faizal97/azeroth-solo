// Azeroth Solo — static game data. Plain globals so the engine can run headless in Node for sims.
(function (root) {
  const D = {};

  D.REALM = 'Starlight';
  D.LEVEL_CAP = 10;
  // Classic 1-10 XP curve (xp needed to go from level i to i+1).
  D.XP_TO_LEVEL = [0, 400, 900, 1400, 2100, 2800, 3600, 4500, 5400, 6500, 8000, 9600];

  D.QUALITY = [
    { name: 'Poor', color: '#9d9d9d' },
    { name: 'Common', color: '#ffffff' },
    { name: 'Uncommon', color: '#1eff00' },
    { name: 'Rare', color: '#0070dd' },
    { name: 'Epic', color: '#a335ee' },
  ];

  D.CHANNELS = {
    say: { label: 'Say', color: '#ffffff' },
    yell: { label: 'Yell', color: '#ff4040' },
    general: { label: '1. General', color: '#ffc0c0' },
    defense: { label: '2. LocalDefense', color: '#ffc0c0' },
    lfg: { label: '4. LookingForGroup', color: '#ffc0c0' },
    whisper: { label: 'Whisper', color: '#ff80ff' },
    party: { label: 'Party', color: '#aaaaff' },
    guild: { label: 'Guild', color: '#40ff40' },
    system: { label: '', color: '#ffff00' },
    loot: { label: '', color: '#00aa00' },
    monster: { label: '', color: '#fffc9e' },
    combat: { label: '', color: '#d8d0c0' },
  };

  // ---------------------------------------------------------------- classes
  // base stats at level 1, gain per level. hp = baseHp + sta*10 + (lvl-1)*hpPerLvl
  D.CLASSES = {
    warrior: {
      name: 'Warrior', color: '#C79C6E', role: 'tank', resource: 'rage', armorType: 'mail',
      weapons: ['sword', 'axe', 'mace'],
      base: { str: 23, agi: 20, sta: 22, int: 20, spi: 21 }, gain: { str: 2, agi: 1.2, sta: 2, int: 0.3, spi: 0.6 },
      baseHp: -140, hpPerLvl: 12, baseMana: 0, manaPerLvl: 0, baseArmor: 60,
      startWeapon: 'worn_shortsword', startChest: 'recruits_vest',
      abilities: ['heroic_strike', 'battle_shout', 'charge', 'rend', 'thunder_clap', 'taunt'],
    },
    mage: {
      name: 'Mage', color: '#69CCF0', role: 'dps', resource: 'mana', armorType: 'cloth',
      weapons: ['staff', 'dagger'],
      base: { str: 20, agi: 20, sta: 20, int: 24, spi: 23 }, gain: { str: 0.3, agi: 0.3, sta: 1, int: 2, spi: 1.8 },
      baseHp: -150, hpPerLvl: 9, baseMana: -250, manaPerLvl: 18, baseArmor: 10,
      startWeapon: 'bent_staff', startChest: 'apprentice_robe',
      abilities: ['fireball', 'frost_armor', 'frostbolt', 'fire_blast', 'arcane_missiles'],
    },
    priest: {
      name: 'Priest', color: '#FFFFFF', role: 'healer', resource: 'mana', armorType: 'cloth',
      weapons: ['mace', 'staff'],
      base: { str: 20, agi: 20, sta: 20, int: 22, spi: 25 }, gain: { str: 0.3, agi: 0.3, sta: 1, int: 1.8, spi: 2 },
      baseHp: -150, hpPerLvl: 9, baseMana: -220, manaPerLvl: 18, baseArmor: 10,
      startWeapon: 'battered_mallet', startChest: 'neophyte_robe',
      abilities: ['smite', 'lesser_heal', 'pw_fortitude', 'sw_pain', 'pw_shield', 'renew'],
    },
    rogue: {
      name: 'Rogue', color: '#FFF569', role: 'dps', resource: 'energy', armorType: 'leather',
      weapons: ['dagger', 'sword'],
      base: { str: 21, agi: 23, sta: 21, int: 20, spi: 20 }, gain: { str: 1, agi: 2, sta: 1.4, int: 0.3, spi: 0.5 },
      baseHp: -145, hpPerLvl: 11, baseMana: 0, manaPerLvl: 0, baseArmor: 30,
      startWeapon: 'worn_dagger', startChest: 'footpad_shirt',
      abilities: ['sinister_strike', 'eviscerate', 'gouge', 'evasion', 'slice_and_dice'],
    },
  };

  D.CLASSES.paladin = {
    name: 'Paladin', color: '#F58CBA', role: 'healer', roles: ['healer', 'tank'], resource: 'mana', armorType: 'mail',
    weapons: ['mace', 'sword', 'axe'],
    base: { str: 22, agi: 20, sta: 22, int: 20, spi: 21 }, gain: { str: 1.8, agi: 0.8, sta: 1.8, int: 1, spi: 1 },
    baseHp: -140, hpPerLvl: 11, baseMana: -220, manaPerLvl: 14, baseArmor: 60,
    startWeapon: 'battered_mallet', startChest: 'recruits_vest',
    abilities: ['seal_righteousness', 'holy_light', 'devotion_aura', 'judgement', 'divine_protection', 'hammer_justice'],
  };
  D.CLASSES.warlock = {
    name: 'Warlock', color: '#9482C9', role: 'dps', resource: 'mana', armorType: 'cloth',
    weapons: ['staff', 'dagger', 'sword'],
    base: { str: 20, agi: 20, sta: 21, int: 23, spi: 23 }, gain: { str: 0.3, agi: 0.3, sta: 1.2, int: 1.9, spi: 1.8 },
    baseHp: -150, hpPerLvl: 9, baseMana: -250, manaPerLvl: 17, baseArmor: 10,
    startWeapon: 'worn_dagger', startChest: 'apprentice_robe', pets: ['imp', 'voidwalker'],
    abilities: ['shadow_bolt', 'immolate', 'demon_skin', 'corruption', 'life_tap', 'curse_of_agony'],
  };
  D.CLASSES.hunter = {
    name: 'Hunter', color: '#ABD473', role: 'dps', resource: 'mana', armorType: 'leather', ranged: true,
    weapons: ['axe', 'sword', 'dagger'],
    base: { str: 21, agi: 23, sta: 21, int: 21, spi: 22 }, gain: { str: 0.9, agi: 2, sta: 1.4, int: 0.8, spi: 0.9 },
    baseHp: -145, hpPerLvl: 11, baseMana: -230, manaPerLvl: 12, baseArmor: 30,
    startWeapon: 'worn_axe', startChest: 'footpad_shirt', startRanged: 'worn_shortbow', pets: ['beast'],
    abilities: ['raptor_strike', 'serpent_sting', 'aspect_monkey', 'arcane_shot', 'hunters_mark', 'concussive_shot'],
  };
  D.CLASSES.druid = {
    name: 'Druid', color: '#FF7D0A', role: 'healer', roles: ['healer', 'tank', 'dps'], resource: 'mana', armorType: 'leather',
    weapons: ['staff', 'mace', 'dagger'],
    base: { str: 21, agi: 20, sta: 20, int: 22, spi: 24 }, gain: { str: 1, agi: 0.7, sta: 1.2, int: 1.6, spi: 1.8 },
    baseHp: -150, hpPerLvl: 10, baseMana: -230, manaPerLvl: 16, baseArmor: 20,
    startWeapon: 'bent_staff', startChest: 'neophyte_robe',
    abilities: ['wrath', 'healing_touch', 'mark_wild', 'moonfire', 'rejuvenation', 'bear_form'],
    forms: { bear: ['bear_form', 'maul', 'growl'] },
  };
  D.CLASSES.shaman = {
    name: 'Shaman', color: '#0070DE', role: 'dps', roles: ['dps', 'healer'], resource: 'mana', armorType: 'leather',
    weapons: ['mace', 'axe', 'staff', 'dagger'],
    base: { str: 22, agi: 20, sta: 22, int: 21, spi: 22 }, gain: { str: 1.4, agi: 0.8, sta: 1.5, int: 1.2, spi: 1.1 },
    baseHp: -145, hpPerLvl: 11, baseMana: -230, manaPerLvl: 14, baseArmor: 30,
    startWeapon: 'battered_mallet', startChest: 'footpad_shirt',
    abilities: ['lightning_bolt', 'rockbiter_weapon', 'healing_wave', 'earth_shock', 'stoneskin_totem', 'lightning_shield', 'searing_totem'],
  };
  // Any race can play any class (house rule, 2026-09-27).
  const ALL_CLASSES = ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid'];
  // Racial traits: one active (combat button, long cooldown) and two passives, small on purpose.
  D.RACIALS = {
    human: { active: 'every_man', passives: { spiPct: 5, questMoneyPct: 10 }, text: ['+5% Spirit', 'Diplomacy: +10% gold from quests'] },
    dwarf: { active: 'stoneform', passives: { resist: { frost: 10 }, lootMoneyPct: 10 }, text: ['Frost damage taken −10%', 'Find Treasure: +10% gold from loot'] },
    gnome: { active: 'escape_artist', passives: { intPct: 5, resist: { arcane: 10 } }, text: ['+5% Intellect', 'Arcane damage taken −10%'] },
    nightelf: { active: 'shadowmeld', passives: { dodge: 1, resist: { nature: 10 } }, text: ['+1% dodge', 'Nature damage taken −10%'] },
    orc: { active: 'blood_fury', passives: { stunPct: 25, petDmgPct: 5 }, text: ['Hardiness: stuns 25% shorter', 'Command: pets deal +5% damage'] },
    troll: { active: 'berserking', passives: { regen: true, beastPct: 5 }, text: ['Regeneration: faster health regen, even in combat', 'Beast Slaying: +5% damage to beasts'] },
    tauren: { active: 'war_stomp', passives: { hpPct: 5, resist: { nature: 10 } }, text: ['Endurance: +5% health', 'Nature damage taken −10%'] },
    undead: { active: 'will_forsaken', passives: { resist: { shadow: 10 }, cannibalize: true }, text: ['Shadow damage taken −10%', 'Cannibalize: heal 15% after killing a humanoid or undead'] },
  };
  D.FACTIONS = { alliance: { name: 'Alliance', color: '#3f7fff' }, horde: { name: 'Horde', color: '#d23a2a' } };
  D.RACES = {
    human: { name: 'Human', faction: 'alliance', classes: ALL_CLASSES, start: 'northshire_abbey', startZone: 'Northshire Valley' },
    dwarf: { name: 'Dwarf', faction: 'alliance', classes: ALL_CLASSES, start: 'anvilmar', startZone: 'Coldridge Valley' },
    gnome: { name: 'Gnome', faction: 'alliance', classes: ALL_CLASSES, start: 'anvilmar', startZone: 'Coldridge Valley' },
    nightelf: { name: 'Night Elf', faction: 'alliance', classes: ALL_CLASSES, start: 'shadowglen', startZone: 'Shadowglen' },
    orc: { name: 'Orc', faction: 'horde', classes: ALL_CLASSES, start: 'valley_of_trials', startZone: 'Valley of Trials' },
    troll: { name: 'Troll', faction: 'horde', classes: ALL_CLASSES, start: 'valley_of_trials', startZone: 'Valley of Trials' },
    tauren: { name: 'Tauren', faction: 'horde', classes: ALL_CLASSES, start: 'camp_narache', startZone: 'Camp Narache' },
    undead: { name: 'Undead', faction: 'horde', classes: ALL_CLASSES, start: 'deathknell', startZone: 'Deathknell' },
  };

  // Warlock demons. Level follows the warlock. hp/dmg scale off the mob tables.
  D.PETS = {
    imp: { name: 'Imp', lvl: 1, hpMult: 0.55, armorMult: 0.6, noMelee: true, cost: 0.25, threatMult: 0.35,
      spell: { name: 'Firebolt', icon: 'firebolt', every: 2.2, dmg: [5, 8], perLvl: 1.7, school: 'fire' },
      names: ['Zillnoz', 'Jubnar', 'Rakzik', 'Grubnik', 'Flikkit', 'Yazzik', 'Kizzle', 'Nozzrik'] },
    voidwalker: { name: 'Voidwalker', lvl: 10, hpMult: 1.5, armorMult: 3, dmgMult: 0.55, threatMult: 3, cost: 0.4,
      torment: { every: 5 },
      names: ['Sarkoth', 'Jaznar', 'Galvuul', 'Morthul', 'Vazgul', 'Ozrath'] },
    // a hunter's tamed beast keeps the look and name of the creature it was
    beast: { name: 'Beast', lvl: 10, hpMult: 1.1, armorMult: 1.6, dmgMult: 0.7, threatMult: 1.3, cost: 0.3, torment: { every: 6 }, tamed: true },
  };

  // ---------------------------------------------------------------- abilities
  // dmg/heal: base [min,max] + perLvl*[level]; coef scales with spell power (sp) or attack power (ap)
  D.ABILITIES = {
    attack: { name: 'Attack', icon: 'attack', desc: 'Toggle auto-attack.', auto: true },
    eat: { name: 'Eat', icon: 'bread', desc: 'Eat food out of combat.', consumable: 'food' },
    drink: { name: 'Drink', icon: 'water', desc: 'Drink water out of combat.', consumable: 'drink' },

    heroic_strike: { name: 'Heroic Strike', cls: 'warrior', lvl: 1, cost: 15, cd: 0, target: 'enemy',
      dmg: { weapon: true, bonus: [11, 11], perLvl: 1.6 }, threat: 1.5, desc: 'A strong attack that adds {b} damage to a weapon hit.' },
    battle_shout: { name: 'Battle Shout', cls: 'warrior', lvl: 1, cost: 10, cd: 0, target: 'party',
      buff: { id: 'battle_shout', dur: 120, stats: { ap: 20 }, perLvl: { ap: 2 } }, threat: 5, desc: 'Raises the attack power of your party by {ap}.' },
    charge: { name: 'Charge', cls: 'warrior', lvl: 4, cost: 0, cd: 15, target: 'enemy', opener: true, gcd: false,
      rage: 12, stun: 1, desc: 'Charge an enemy you are not fighting yet. Generates 12 rage and stuns for 1 sec.' },
    rend: { name: 'Rend', cls: 'warrior', lvl: 4, cost: 10, cd: 0, target: 'enemy',
      dot: { id: 'rend', ticks: 3, every: 3, dmg: 5, perLvl: 1.1, school: 'physical' }, desc: 'Wounds the target for {d} damage over 9 sec.' },
    thunder_clap: { name: 'Thunder Clap', cls: 'warrior', lvl: 6, cost: 20, cd: 6, target: 'aoe',
      dmg: { base: [10, 10], perLvl: 1.2, school: 'physical' }, slow: { pct: 10, dur: 10 }, threat: 2.5, desc: 'Hits all nearby enemies for {b} and slows their attacks.' },
    seal_righteousness: { name: 'Seal of Righteousness', cls: 'paladin', lvl: 1, cost: 20, costPerLvl: 3, cd: 0, target: 'self', combatOnly: true,
      buff: { id: 'seal', dur: 30, seal: { base: 3, perLvl: 1.1 } }, desc: 'Each melee hit deals extra Holy damage for 30 sec. Judgement releases it.' },
    holy_light: { name: 'Holy Light', cls: 'paladin', lvl: 1, cost: 35, costPerLvl: 5, cd: 0, cast: 2.5, target: 'ally',
      heal: { base: [42, 51], perLvl: 8, coef: 0.71 }, desc: 'Heals a friendly target for {h}.' },
    devotion_aura: { name: 'Devotion Aura', cls: 'paladin', lvl: 1, cost: 0, cd: 0, target: 'party',
      buff: { id: 'devotion_aura', dur: 1800, stats: { armor: 35 }, perLvl: { armor: 8 } }, desc: 'Raises the armor of your party by {armor}.' },
    judgement: { name: 'Judgement', cls: 'paladin', lvl: 4, cost: 25, costPerLvl: 2, cd: 10, target: 'enemy', needSeal: true,
      dmg: { base: [15, 18], perLvl: 3.4, coef: 0.45, school: 'holy' }, threat: 1.5, desc: 'Unleashes your seal on the enemy for {b} Holy damage.' },
    divine_protection: { name: 'Divine Protection', cls: 'paladin', lvl: 6, cost: 15, costPerLvl: 2, cd: 300, target: 'self', gcd: false, combatOnly: true,
      buff: { id: 'divine_protection', dur: 6, immune: true }, desc: 'You are immune to all damage for 6 sec. 5 min cooldown.' },
    hammer_justice: { name: 'Hammer of Justice', cls: 'paladin', lvl: 8, cost: 30, costPerLvl: 2, cd: 60, target: 'enemy',
      stun: 3, desc: 'Stuns the target for 3 sec.' },

    shadow_bolt: { name: 'Shadow Bolt', cls: 'warlock', lvl: 1, cost: 25, costPerLvl: 4, cd: 0, cast: 2.0, target: 'enemy',
      dmg: { base: [13, 18], perLvl: 3.3, coef: 0.86, school: 'shadow' }, desc: 'Sends a bolt of shadow for {b} Shadow damage.' },
    immolate: { name: 'Immolate', cls: 'warlock', lvl: 1, cost: 25, costPerLvl: 4, cd: 0, cast: 1.5, target: 'enemy',
      dmg: { base: [10, 12], perLvl: 1.6, coef: 0.2, school: 'fire' }, dot: { id: 'immolate', ticks: 5, every: 3, dmg: 2, perLvl: 0.8, coef: 0.1, school: 'fire' },
      desc: 'Burns the enemy for {b} Fire damage and {d} more over 15 sec.' },
    demon_skin: { name: 'Demon Skin', cls: 'warlock', lvl: 1, cost: 30, costPerLvl: 2, cd: 0, target: 'self',
      buff: { id: 'demon_skin', dur: 1800, stats: { armor: 30 }, perLvl: { armor: 5 } }, desc: 'Raises your armor by {armor}.' },
    corruption: { name: 'Corruption', cls: 'warlock', lvl: 4, cost: 25, costPerLvl: 3, cd: 0, cast: 1.5, target: 'enemy',
      dot: { id: 'corruption', ticks: 6, every: 3, dmg: 4, perLvl: 1.2, coef: 0.15, school: 'shadow' }, desc: 'Corrupts the target for {d} Shadow damage over 18 sec.' },
    life_tap: { name: 'Life Tap', cls: 'warlock', lvl: 6, cost: 0, cd: 0, target: 'self', lifetap: { base: 20, perLvl: 3 },
      desc: 'Converts {lt} health into {lt} mana.' },
    curse_of_agony: { name: 'Curse of Agony', cls: 'warlock', lvl: 8, cost: 25, costPerLvl: 2, cd: 0, target: 'enemy',
      dot: { id: 'curse_of_agony', ticks: 8, every: 3, dmg: 3, perLvl: 0.9, coef: 0.1, school: 'shadow' }, desc: 'Curses the target with agony: {d} Shadow damage over 24 sec.' },
    raptor_strike: { name: 'Raptor Strike', cls: 'hunter', lvl: 1, cost: 15, costPerLvl: 2, cd: 6, target: 'enemy',
      dmg: { weapon: true, bonus: [5, 5], perLvl: 1 }, desc: 'A strong melee attack that adds {b} damage.' },
    serpent_sting: { name: 'Serpent Sting', cls: 'hunter', lvl: 4, cost: 15, costPerLvl: 2, cd: 0, target: 'enemy',
      dot: { id: 'serpent_sting', ticks: 5, every: 3, dmg: 4, perLvl: 1.2, school: 'nature' }, desc: 'Stings the target for {d} Nature damage over 15 sec.' },
    aspect_monkey: { name: 'Aspect of the Monkey', cls: 'hunter', lvl: 4, cost: 20, cd: 0, target: 'self',
      buff: { id: 'aspect_monkey', dur: 1800, stats: { dodge: 8 } }, desc: 'Raises your chance to dodge by 8%.' },
    arcane_shot: { name: 'Arcane Shot', cls: 'hunter', lvl: 6, cost: 25, costPerLvl: 3, cd: 6, target: 'enemy',
      dmg: { base: [13, 13], perLvl: 2.4, rapCoef: 0.15, school: 'arcane' }, desc: 'An instant shot for {b} Arcane damage.' },
    hunters_mark: { name: "Hunter's Mark", cls: 'hunter', lvl: 6, cost: 15, costPerLvl: 1, cd: 0, target: 'enemy',
      debuff: { id: 'hunters_mark', dur: 120 }, desc: 'Marks the target. You and your pet deal 10% more damage to it.' },
    concussive_shot: { name: 'Concussive Shot', cls: 'hunter', lvl: 8, cost: 15, costPerLvl: 2, cd: 12, target: 'enemy',
      slow: { pct: 50, dur: 4 }, desc: 'Dazes the target, slowing its attacks by 50% for 4 sec.' },

    wrath: { name: 'Wrath', cls: 'druid', lvl: 1, cost: 20, costPerLvl: 3, cd: 0, cast: 2.0, target: 'enemy',
      dmg: { base: [13, 16], perLvl: 2.9, coef: 0.57, school: 'nature' }, desc: 'Hurls a bolt of nature for {b} Nature damage.' },
    healing_touch: { name: 'Healing Touch', cls: 'druid', lvl: 1, cost: 25, costPerLvl: 5, cd: 0, cast: 2.5, target: 'ally',
      heal: { base: [40, 55], perLvl: 8, coef: 0.8 }, desc: 'Heals a friendly target for {h}.' },
    mark_wild: { name: 'Mark of the Wild', cls: 'druid', lvl: 1, cost: 20, costPerLvl: 3, cd: 0, target: 'party',
      buff: { id: 'mark_wild', dur: 1800, stats: { armor: 25, str: 1, agi: 1, sta: 1, int: 1, spi: 1 }, perLvl: { armor: 5, str: 0.2, agi: 0.2, sta: 0.2, int: 0.2, spi: 0.2 } },
      desc: 'Raises armor by {armor} and all attributes for your party.' },
    moonfire: { name: 'Moonfire', cls: 'druid', lvl: 4, cost: 25, costPerLvl: 3, cd: 0, target: 'enemy',
      dmg: { base: [9, 12], perLvl: 1.6, coef: 0.15, school: 'arcane' }, dot: { id: 'moonfire', ticks: 3, every: 3, dmg: 3, perLvl: 0.8, school: 'arcane' },
      desc: 'Burns the enemy for {b} Arcane damage and {d} more over 9 sec.' },
    rejuvenation: { name: 'Rejuvenation', cls: 'druid', lvl: 4, cost: 25, costPerLvl: 3, cd: 0, target: 'ally',
      hot: { id: 'rejuvenation', ticks: 4, every: 3, heal: 8, perLvl: 1.8, coef: 0.2 }, desc: 'Heals the target for {hh} over 12 sec.' },
    bear_form: { name: 'Bear Form', cls: 'druid', lvl: 10, cost: 55, cd: 0, target: 'self', shapeshift: 'bear', combatOnly: true,
      desc: 'Shapeshift into a bear: much more armor and health, attacks use rage. Cast again to change back.' },
    maul: { name: 'Maul', cls: 'druid', lvl: 10, cost: 15, cd: 0, target: 'enemy', form: 'bear',
      dmg: { weapon: true, bonus: [18, 18], perLvl: 1.5 }, threat: 1.75, desc: 'A heavy swipe that adds {b} damage and extra threat.' },
    growl: { name: 'Growl', cls: 'druid', lvl: 10, cost: 0, cd: 10, target: 'enemy', gcd: false, taunt: true, form: 'bear',
      desc: 'Forces the enemy to attack you.' },
    // ---- shaman
    lightning_bolt: { name: 'Lightning Bolt', cls: 'shaman', lvl: 1, cost: 15, costPerLvl: 3, cd: 0, cast: 2.0, target: 'enemy',
      dmg: { base: [13, 16], perLvl: 3, coef: 0.79, school: 'nature' }, desc: 'Casts a bolt of lightning for {b} Nature damage.' },
    rockbiter_weapon: { name: 'Rockbiter Weapon', cls: 'shaman', lvl: 1, cost: 20, costPerLvl: 2, cd: 0, target: 'self',
      buff: { id: 'rockbiter', dur: 300, seal: { base: 2, perLvl: 1, school: 'physical' } }, desc: 'Imbues your weapon with earth for 5 min: each hit deals extra damage.' },
    healing_wave: { name: 'Healing Wave', cls: 'shaman', lvl: 1, cost: 25, costPerLvl: 5, cd: 0, cast: 2.5, target: 'ally',
      heal: { base: [36, 47], perLvl: 8, coef: 0.86 }, desc: 'Heals a friendly target for {h}.' },
    earth_shock: { name: 'Earth Shock', cls: 'shaman', lvl: 4, cost: 25, costPerLvl: 3, cd: 6, target: 'enemy',
      dmg: { base: [19, 22], perLvl: 2.5, coef: 0.39, school: 'nature' }, threat: 2, desc: 'Instantly shocks the target for {b} Nature damage.' },
    stoneskin_totem: { name: 'Stoneskin Totem', cls: 'shaman', lvl: 4, cost: 25, costPerLvl: 2, cd: 0, target: 'party',
      buff: { id: 'stoneskin', dur: 120, stats: { armor: 25 }, perLvl: { armor: 6 } }, desc: 'Drops a totem that raises your party\'s armor by {armor}.' },
    lightning_shield: { name: 'Lightning Shield', cls: 'shaman', lvl: 8, cost: 30, costPerLvl: 2, cd: 0, target: 'self',
      buff: { id: 'lightning_shield', dur: 600, thorns: { base: 13, perLvl: 2.5, charges: 3 } }, desc: 'Three orbs of lightning strike enemies that hit you in melee.' },
    searing_totem: { name: 'Searing Totem', cls: 'shaman', lvl: 10, cost: 25, costPerLvl: 2, cd: 0, target: 'enemy',
      dot: { id: 'searing_totem', ticks: 12, every: 2.5, dmg: 5, perLvl: 1.2, coef: 0.08, school: 'fire' }, desc: 'Drops a totem that burns the enemy for {d} Fire damage over 30 sec.' },
    // ---- racial actives (combat only, off the global cooldown)
    every_man: { name: 'Every Man for Himself', racial: true, lvl: 1, cost: 0, cd: 120, target: 'self', gcd: false, combatOnly: true, freeOf: 'stun',
      desc: 'Breaks free of stuns and slows. 2 min cooldown.' },
    stoneform: { name: 'Stoneform', racial: true, lvl: 1, cost: 0, cd: 120, target: 'self', gcd: false, combatOnly: true, cleanse: true,
      buff: { id: 'stoneform', dur: 8, stats: { armor: 10 }, perLvl: { armor: 6 } }, desc: 'Turns your skin to stone: more armor, and bleeds and poisons are removed. 8 sec.' },
    escape_artist: { name: 'Escape Artist', racial: true, lvl: 1, cost: 0, cd: 60, target: 'self', gcd: false, combatOnly: true, freeOf: 'stun',
      desc: 'Escapes stuns and slows. 1 min cooldown.' },
    shadowmeld: { name: 'Shadowmeld', racial: true, lvl: 1, cost: 0, cd: 120, target: 'self', gcd: false, combatOnly: true, dropThreat: true,
      desc: 'Fade into the shadows: enemies lose track of you and all your threat is wiped. 2 min cooldown.' },
    blood_fury: { name: 'Blood Fury', racial: true, lvl: 1, cost: 0, cd: 120, target: 'self', gcd: false, combatOnly: true, bloodFury: true,
      desc: 'Attack power +25% for 15 sec. 2 min cooldown.' },
    berserking: { name: 'Berserking', racial: true, lvl: 1, cost: 0, cd: 180, target: 'self', gcd: false, combatOnly: true, berserk: true,
      desc: 'Attack and casting speed +10% to +30%, more when you are hurt. 10 sec. 3 min cooldown.' },
    war_stomp: { name: 'War Stomp', racial: true, lvl: 1, cost: 0, cd: 120, target: 'self', gcd: false, combatOnly: true, stompAll: 2,
      desc: 'Stomps the ground, stunning nearby enemies for 2 sec. 2 min cooldown.' },
    will_forsaken: { name: 'Will of the Forsaken', racial: true, lvl: 1, cost: 0, cd: 120, target: 'self', gcd: false, combatOnly: true, freeOf: 'stun', stunImmune: 5,
      desc: 'Breaks free of stuns and slows, and ignores new stuns for 5 sec. 2 min cooldown.' },
    taunt: { name: 'Taunt', cls: 'warrior', lvl: 10, cost: 0, cd: 10, target: 'enemy', gcd: false, taunt: true,
      desc: 'Forces the enemy to attack you and matches the highest threat on it.' },

    fireball: { name: 'Fireball', cls: 'mage', lvl: 1, cost: 30, costPerLvl: 4, cd: 0, cast: 2.0, target: 'enemy',
      dmg: { base: [14, 22], perLvl: 3.2, coef: 0.8, school: 'fire' }, dot: { id: 'fireball_burn', ticks: 2, every: 2, dmg: 2, perLvl: 0.3, school: 'fire' }, desc: 'Hurls a fiery ball for {b} Fire damage.' },
    frost_armor: { name: 'Frost Armor', cls: 'mage', lvl: 1, cost: 60, cd: 0, target: 'self', gcd: true,
      buff: { id: 'frost_armor', dur: 600, stats: { armor: 30 }, perLvl: { armor: 6 }, chillAttackers: true }, desc: 'Increases armor by {armor}. Melee attackers are slowed.' },
    frostbolt: { name: 'Frostbolt', cls: 'mage', lvl: 4, cost: 30, costPerLvl: 4, cd: 0, cast: 1.8, target: 'enemy',
      dmg: { base: [16, 20], perLvl: 2.6, coef: 0.8, school: 'frost' }, slow: { pct: 40, dur: 5 }, desc: 'Launches a bolt of frost for {b} Frost damage and slows the target.' },
    fire_blast: { name: 'Fire Blast', cls: 'mage', lvl: 6, cost: 40, costPerLvl: 3, cd: 8, target: 'enemy',
      dmg: { base: [24, 30], perLvl: 2.4, coef: 0.43, school: 'fire' }, desc: 'Blasts the enemy for {b} Fire damage. Instant.' },
    arcane_missiles: { name: 'Arcane Missiles', cls: 'mage', lvl: 8, cost: 85, costPerLvl: 5, cd: 0, cast: 3, channel: 3, target: 'enemy',
      dmg: { base: [12, 12], perLvl: 1.5, coef: 0.24, school: 'arcane' }, desc: 'Fires 3 missiles over 3 sec, {b} Arcane damage each.' },

    smite: { name: 'Smite', cls: 'priest', lvl: 1, cost: 20, costPerLvl: 3, cd: 0, cast: 2.0, target: 'enemy',
      dmg: { base: [15, 20], perLvl: 2.8, coef: 0.71, school: 'holy' }, desc: 'Smite an enemy for {b} Holy damage.' },
    lesser_heal: { name: 'Lesser Heal', cls: 'priest', lvl: 1, cost: 30, costPerLvl: 4, cd: 0, cast: 2.0, target: 'ally',
      heal: { base: [46, 56], perLvl: 7, coef: 0.85 }, desc: 'Heal a friendly target for {h}.' },
    pw_fortitude: { name: 'Power Word: Fortitude', cls: 'priest', lvl: 1, cost: 60, cd: 0, target: 'party',
      buff: { id: 'pw_fortitude', dur: 1800, stats: { sta: 3 }, perLvl: { sta: 0.8 } }, desc: 'Power infuses your party, raising Stamina by {sta}.' },
    sw_pain: { name: 'Shadow Word: Pain', cls: 'priest', lvl: 4, cost: 25, costPerLvl: 3, cd: 0, target: 'enemy',
      dot: { id: 'sw_pain', ticks: 6, every: 3, dmg: 5, perLvl: 1.1, coef: 0.1, school: 'shadow' }, desc: 'A word of darkness that deals {d} Shadow damage over 18 sec.' },
    pw_shield: { name: 'Power Word: Shield', cls: 'priest', lvl: 6, cost: 45, costPerLvl: 4, cd: 4, target: 'ally',
      shield: { base: 44, perLvl: 6, coef: 0.1, dur: 30 }, weakened: 15, desc: 'Absorbs {s} damage for 30 sec. The target cannot be shielded again for 15 sec.' },
    renew: { name: 'Renew', cls: 'priest', lvl: 8, cost: 40, costPerLvl: 4, cd: 0, target: 'ally',
      hot: { id: 'renew', ticks: 5, every: 3, heal: 9, perLvl: 1.6, coef: 0.2 }, desc: 'Heals the target for {hh} over 15 sec.' },

    sinister_strike: { name: 'Sinister Strike', cls: 'rogue', lvl: 1, cost: 45, cd: 0, target: 'enemy', gcdLen: 1.0,
      dmg: { weapon: true, bonus: [3, 3], perLvl: 0.9 }, cp: 1, desc: 'An instant strike that deals weapon damage plus {b}. Awards 1 combo point.' },
    eviscerate: { name: 'Eviscerate', cls: 'rogue', lvl: 1, cost: 35, cd: 0, target: 'enemy', gcdLen: 1.0, finisher: true,
      dmg: { perCp: [8, 14], perLvl: 1.4, apCoef: 0.03, school: 'physical' }, desc: 'Finishing move. Damage rises with each combo point.' },
    gouge: { name: 'Gouge', cls: 'rogue', lvl: 6, cost: 45, cd: 10, target: 'enemy', gcdLen: 1.0,
      dmg: { base: [8, 8], perLvl: 0.7, school: 'physical' }, stun: 4, cp: 1, desc: 'Incapacitates the target for 4 sec. Awards 1 combo point.' },
    evasion: { name: 'Evasion', cls: 'rogue', lvl: 8, cost: 0, cd: 120, target: 'self', gcd: false,
      buff: { id: 'evasion', dur: 15, stats: { dodge: 50 } }, desc: 'Dodge chance raised by 50% for 15 sec.' },
    slice_and_dice: { name: 'Slice and Dice', cls: 'rogue', lvl: 10, cost: 25, cd: 0, target: 'self', gcdLen: 1.0, finisher: true,
      buff: { id: 'slice_and_dice', dur: 6, perCpDur: 3, stats: { haste: 20 } }, desc: 'Finishing move. Attack speed +20%. Lasts longer per combo point.' },
  };

  // ---------------------------------------------------------------- items
  // slot: weapon chest legs feet hands wrist waist back finger | junk | quest | food | drink
  const I = {};
  function item(id, o) { I[id] = Object.assign({ id }, o); }
  // starter
  item('worn_shortsword', { name: 'Worn Shortsword', slot: 'weapon', wtype: 'sword', q: 1, lvl: 1, dmg: [2, 5], speed: 1.9, icon: 'sword', sell: 7 });
  item('bent_staff', { name: 'Bent Staff', slot: 'weapon', wtype: 'staff', q: 1, lvl: 1, dmg: [3, 5], speed: 2.9, icon: 'staff', sell: 9 });
  item('battered_mallet', { name: 'Battered Mallet', slot: 'weapon', wtype: 'mace', q: 1, lvl: 1, dmg: [2, 5], speed: 2.0, icon: 'mace', sell: 7 });
  item('worn_dagger', { name: 'Worn Dagger', slot: 'weapon', wtype: 'dagger', q: 1, lvl: 1, dmg: [1, 3], speed: 1.6, icon: 'dagger', sell: 7 });
  item('worn_axe', { name: 'Worn Axe', slot: 'weapon', wtype: 'axe', q: 1, lvl: 1, dmg: [2, 5], speed: 2.1, icon: 'axe', sell: 7 });
  item('worn_shortbow', { name: 'Worn Shortbow', slot: 'ranged', wtype: 'bow', q: 1, lvl: 1, dmg: [2, 5], speed: 2.3, icon: 'bow', sell: 7 });
  item('militia_longbow', { name: 'Militia Longbow', slot: 'ranged', wtype: 'bow', q: 2, lvl: 9, dmg: [10, 19], speed: 2.8, stats: { agi: 3 }, icon: 'bow', sell: 180 });
  item('recruits_vest', { name: "Recruit's Vest", slot: 'chest', atype: 'mail', q: 1, lvl: 1, armor: 22, icon: 'chest_mail', sell: 1 });
  item('apprentice_robe', { name: "Apprentice's Robe", slot: 'chest', atype: 'cloth', q: 1, lvl: 1, armor: 5, icon: 'chest_cloth', sell: 1 });
  item('neophyte_robe', { name: "Neophyte's Robe", slot: 'chest', atype: 'cloth', q: 1, lvl: 1, armor: 5, icon: 'chest_cloth', sell: 1 });
  item('footpad_shirt', { name: "Footpad's Vest", slot: 'chest', atype: 'leather', q: 1, lvl: 1, armor: 12, icon: 'chest_leather', sell: 1 });
  item('hearthstone', { name: 'Hearthstone', slot: 'special', q: 1, lvl: 1, icon: 'hearthstone', noSell: true, desc: 'Returns you to Lion\'s Pride Inn. 15 min cooldown.' });
  // consumables
  item('tough_bread', { name: 'Tough Hunk of Bread', slot: 'food', q: 1, lvl: 1, restore: 61, icon: 'bread', sell: 1, cost: 5 });
  item('fresh_bread', { name: 'Freshly Baked Bread', slot: 'food', q: 1, lvl: 5, restore: 243, icon: 'bread', sell: 6, cost: 25 });
  item('spring_water', { name: 'Refreshing Spring Water', slot: 'drink', q: 1, lvl: 1, restore: 151, icon: 'water', sell: 1, cost: 5 });
  item('ice_milk', { name: 'Ice Cold Milk', slot: 'drink', q: 1, lvl: 5, restore: 436, icon: 'water', sell: 6, cost: 25 });
  // junk (vendor trash)
  item('ruined_pelt', { name: 'Ruined Pelt', slot: 'junk', q: 0, icon: 'pelt', sell: 4 });
  item('wolf_fang', { name: 'Chipped Fang', slot: 'junk', q: 0, icon: 'claw', sell: 3 });
  item('kobold_rag', { name: 'Dirty Kobold Rag', slot: 'junk', q: 0, icon: 'bandana', sell: 3 });
  item('broken_candle', { name: 'Melted Candle Stub', slot: 'junk', q: 0, icon: 'candle', sell: 5 });
  item('thieves_coin', { name: 'Tarnished Coin', slot: 'junk', q: 0, icon: 'coin', sell: 9 });
  item('murloc_eye', { name: 'Slimy Murloc Scale', slot: 'junk', q: 0, icon: 'fin', sell: 12 });
  item('bear_hide', { name: 'Thick Bear Fur', slot: 'junk', q: 0, icon: 'pelt', sell: 15 });
  item('gnoll_mane', { name: 'Matted Gnoll Mane', slot: 'junk', q: 0, icon: 'pelt', sell: 18 });
  item('linen_cloth', { name: 'Linen Cloth', slot: 'junk', q: 1, icon: 'bandana', sell: 5 });
  item('pumpkin', { name: 'Stolen Pumpkin', slot: 'junk', q: 0, icon: 'grapes', sell: 20 });
  // quest items
  item('wolf_meat', { name: 'Tough Wolf Meat', slot: 'quest', q: 1, icon: 'meat' });
  item('red_bandana', { name: 'Red Burlap Bandana', slot: 'quest', q: 1, icon: 'bandana' });
  item('grape_crate', { name: 'Crate of Grapes', slot: 'quest', q: 1, icon: 'grapes' });
  item('garrick_head', { name: "Garrick's Head", slot: 'quest', q: 1, icon: 'head' });
  item('large_candle', { name: 'Large Candle', slot: 'quest', q: 1, icon: 'candle' });
  item('gold_dust', { name: 'Gold Dust', slot: 'quest', q: 1, icon: 'dust' });
  item('murloc_fin', { name: 'Torn Murloc Fin', slot: 'quest', q: 1, icon: 'fin' });
  item('red_linen', { name: 'Red Linen Bandana', slot: 'quest', q: 1, icon: 'bandana' });
  item('brass_collar', { name: 'Brass Collar', slot: 'quest', q: 1, icon: 'ring' });
  item('gnoll_armband', { name: 'Painted Gnoll Armband', slot: 'quest', q: 1, icon: 'armband' });
  item('gnoll_claw', { name: 'Huge Gnoll Claw', slot: 'quest', q: 1, icon: 'claw' });
  item('vancleef_head', { name: "Head of VanCleef", slot: 'quest', q: 1, icon: 'head' });

  // quest rewards (one per armor/weapon family, picked by class)
  item('militia_shortsword', { name: 'Militia Shortsword', slot: 'weapon', wtype: 'sword', q: 2, lvl: 9, dmg: [8, 16], speed: 2.1, stats: { str: 2, sta: 1 }, icon: 'sword', sell: 180 });
  item('militia_dagger', { name: 'Militia Dagger', slot: 'weapon', wtype: 'dagger', q: 2, lvl: 9, dmg: [6, 11], speed: 1.6, stats: { agi: 3 }, icon: 'dagger', sell: 170 });
  item('militia_staff', { name: 'Militia Quarterstaff', slot: 'weapon', wtype: 'staff', q: 2, lvl: 9, dmg: [13, 20], speed: 3.0, stats: { int: 4, spi: 3 }, sp: 6, icon: 'staff', sell: 190 });
  item('militia_hammer', { name: 'Militia Warhammer', slot: 'weapon', wtype: 'mace', q: 2, lvl: 9, dmg: [8, 15], speed: 2.3, stats: { int: 2, spi: 2 }, sp: 4, icon: 'mace', sell: 180 });
  // Deadmines loot (scaled to 10)
  item('cruel_barb', { name: 'Cruel Barb', slot: 'weapon', wtype: 'sword', q: 3, lvl: 10, dmg: [13, 23], speed: 2.4, stats: { str: 5 }, icon: 'sword', sell: 900 });
  item('cape_brotherhood', { name: 'Cape of the Brotherhood', slot: 'back', q: 3, lvl: 10, armor: 18, stats: { agi: 4, sta: 2 }, icon: 'cloak', sell: 600 });
  item('smites_hammer', { name: "Smite's Mighty Hammer", slot: 'weapon', wtype: 'mace', q: 3, lvl: 10, dmg: [14, 24], speed: 2.8, stats: { str: 6, sta: 3 }, icon: 'mace', sell: 1000 });
  item('thiefs_blade', { name: "Thief's Blade", slot: 'weapon', wtype: 'sword', q: 3, lvl: 10, dmg: [10, 18], speed: 1.9, stats: { agi: 5 }, icon: 'sword', sell: 850 });
  item('cookies_rod', { name: "Cookie's Stirring Rod", slot: 'weapon', wtype: 'staff', q: 3, lvl: 10, dmg: [15, 23], speed: 3.0, stats: { int: 6, spi: 4 }, sp: 10, icon: 'staff', sell: 900 });
  item('cookies_tenderizer', { name: "Cookie's Tenderizer", slot: 'weapon', wtype: 'mace', q: 3, lvl: 10, dmg: [11, 20], speed: 2.5, stats: { sta: 3, spi: 3 }, sp: 7, icon: 'mace', sell: 900 });
  item('smelting_pants', { name: 'Smelting Pants', slot: 'legs', atype: 'mail', q: 3, lvl: 10, armor: 110, stats: { str: 4, sta: 4 }, icon: 'legs', sell: 700 });
  item('buzzer_blade', { name: 'Buzzer Blade', slot: 'weapon', wtype: 'dagger', q: 3, lvl: 10, dmg: [8, 15], speed: 1.7, stats: { agi: 3, sta: 2 }, icon: 'dagger', sell: 800 });
  item('gold_gloves', { name: 'Gold-flecked Gloves', slot: 'hands', atype: 'cloth', q: 3, lvl: 10, armor: 12, stats: { int: 4, spi: 3 }, sp: 4, icon: 'gloves', sell: 500 });
  item('lavish_ring', { name: 'Lavishly Jeweled Ring', slot: 'finger', q: 3, lvl: 10, stats: { int: 3, spi: 3, sta: 2 }, icon: 'ring', sell: 700 });
  item('foreman_belt', { name: "Foreman's Girdle", slot: 'waist', atype: 'mail', q: 3, lvl: 10, armor: 60, stats: { sta: 5 }, icon: 'belt', sell: 500 });
  item('emberstone_staff', { name: 'Emberstone Staff', slot: 'weapon', wtype: 'staff', q: 3, lvl: 10, dmg: [17, 26], speed: 3.1, stats: { int: 5, sta: 3 }, sp: 12, icon: 'staff', sell: 1000 });
  item('corsair_shirt', { name: "Corsair's Overshirt", slot: 'chest', atype: 'cloth', q: 3, lvl: 10, armor: 28, stats: { int: 5, spi: 4 }, sp: 5, icon: 'chest_cloth', sell: 700 });
  item('defias_armor', { name: 'Blackened Defias Armor', slot: 'chest', atype: 'leather', q: 3, lvl: 10, armor: 62, stats: { agi: 5, sta: 3 }, icon: 'chest_leather', sell: 700 });
  item('defias_leggings', { name: 'Blackened Defias Leggings', slot: 'legs', atype: 'leather', q: 3, lvl: 10, armor: 55, stats: { agi: 4, sta: 3 }, icon: 'legs', sell: 700 });
  item('defias_boots', { name: 'Blackened Defias Boots', slot: 'feet', atype: 'leather', q: 3, lvl: 10, armor: 40, stats: { agi: 3, sta: 3 }, icon: 'boots', sell: 600 });
  item('defias_belt', { name: 'Blackened Defias Belt', slot: 'waist', atype: 'leather', q: 3, lvl: 10, armor: 30, stats: { agi: 3, sta: 2 }, icon: 'belt', sell: 500 });
  item('miners_bracers', { name: "Miner's Revenge Bracers", slot: 'wrist', atype: 'mail', q: 3, lvl: 10, armor: 50, stats: { str: 3, sta: 3 }, icon: 'bracers', sell: 500 });
  // Dun Morogh
  item('felix_journal', { name: "Felix's Journal", slot: 'quest', q: 1, icon: 'journal' });
  item('crag_boar_rib', { name: 'Crag Boar Rib', slot: 'quest', q: 1, icon: 'rib' });
  item('wendigo_mane', { name: 'Wendigo Mane', slot: 'quest', q: 1, icon: 'pelt' });
  item('restab_cog', { name: 'Restabilization Cog', slot: 'quest', q: 1, icon: 'coin' });
  item('vagash_fang', { name: 'Fang of Vagash', slot: 'quest', q: 1, icon: 'claw' });
  item('troll_tusk', { name: 'Frostmane Tusk', slot: 'junk', q: 0, icon: 'claw', sell: 11 });
  item('trogg_stone', { name: 'Rockjaw Pebble', slot: 'junk', q: 0, icon: 'dust', sell: 3 });
  item('thunder_ale', { name: 'Thunder Ale', slot: 'drink', q: 1, lvl: 5, restore: 436, icon: 'keg', sell: 6, cost: 25 });
  item('griknir_staff', { name: "Grik'nir's Frozen Staff", slot: 'weapon', wtype: 'staff', q: 3, lvl: 5, dmg: [7, 12], speed: 3.0, stats: { int: 3, spi: 2 }, sp: 3, icon: 'staff', sell: 150, source: "Grik'nir the Cold, Coldridge Valley", look: ['weapon', 'griknir_staff'] });
  item('icebeard_cloak', { name: "Icebeard's Shaggy Cloak", slot: 'back', q: 3, lvl: 9, armor: 18, stats: { sta: 3, str: 1, spi: 1 }, icon: 'cloak', sell: 380, source: 'Old Icebeard, the Grizzled Den', look: ['back', 'icebeard_cloak'] });
  item('vagash_claw', { name: 'Claw of Vagash', slot: 'weapon', wtype: 'dagger', q: 3, lvl: 10, dmg: [8, 15], speed: 1.7, stats: { agi: 3, sta: 2 }, icon: 'dagger', sell: 700, source: 'Vagash, Amberstill Ranch', look: ['weapon', 'vagash_claw'] });

  // Teldrassil
  item('fel_moss', { name: 'Fel Moss', slot: 'quest', q: 1, icon: 'moss' });
  item('venom_sac', { name: 'Webwood Venom Sac', slot: 'quest', q: 1, icon: 'venom' });
  item('nightsaber_pelt', { name: 'Nightsaber Pelt', slot: 'quest', q: 1, icon: 'pelt' });
  item('owl_feather', { name: 'Strigid Owl Feather', slot: 'quest', q: 1, icon: 'feather' });
  item('timberling_seed', { name: 'Timberling Seed', slot: 'quest', q: 1, icon: 'seed' });
  item('melenas_head', { name: "Melenas' Head", slot: 'quest', q: 1, icon: 'head' });
  item('grell_earring', { name: 'Grell Earring', slot: 'junk', q: 0, icon: 'ring', sell: 6 });
  item('furbolg_charm', { name: 'Gnarlpine Charm', slot: 'junk', q: 0, icon: 'claw', sell: 14 });
  item('moonberry_juice', { name: 'Moonberry Juice', slot: 'drink', q: 1, lvl: 5, restore: 436, icon: 'water', sell: 6, cost: 25 });
  item('githyiss_shroud', { name: "Githyiss's Silken Shroud", slot: 'back', q: 3, lvl: 5, armor: 9, stats: { agi: 1, int: 2 }, icon: 'cloak', sell: 130, source: 'Githyiss the Vile, Shadowthread Cave', look: ['back', 'githyiss_shroud'] });
  item('oakenscowl_staff', { name: "Oakenscowl's Totem Staff", slot: 'weapon', wtype: 'staff', q: 3, lvl: 10, dmg: [15, 23], speed: 3.0, stats: { sta: 3, int: 3, spi: 3 }, sp: 8, icon: 'staff', sell: 800, source: "Oakenscowl, Ban'ethil Barrow Den", look: ['weapon', 'oakenscowl_staff'] });
  item('melenas_blade', { name: "Melenas' Wicked Blade", slot: 'weapon', wtype: 'sword', q: 3, lvl: 10, dmg: [11, 20], speed: 2.2, stats: { agi: 3, str: 2 }, icon: 'sword', sell: 800, source: 'Lord Melenas, Fel Rock', look: ['weapon', 'melenas_blade'] });

  // Durotar
  item('cactus_apple', { name: 'Cactus Apple', slot: 'quest', q: 1, icon: 'cactus_apple' });
  item('scorpid_stinger', { name: 'Scorpid Worker Tail', slot: 'quest', q: 1, icon: 'scorpid_stinger' });
  item('burning_medallion', { name: 'Burning Blade Medallion', slot: 'quest', q: 1, icon: 'ring' });
  item('lizard_horn', { name: 'Thunder Lizard Horn', slot: 'quest', q: 1, icon: 'lizard_horn' });
  item('voodoo_charm', { name: 'Voodoo Charm', slot: 'quest', q: 1, icon: 'voodoo_doll' });
  item('kultiras_insignia', { name: 'Kul Tiras Insignia', slot: 'quest', q: 1, icon: 'coin' });
  item('zalazane_head', { name: "Zalazane's Head", slot: 'quest', q: 1, icon: 'head' });
  item('taragaman_heart', { name: "Taragaman the Hungerer's Heart", slot: 'quest', q: 1, icon: 'venom' });
  item('boar_tusk', { name: 'Mottled Tusk', slot: 'junk', q: 0, icon: 'tusk', sell: 4 });
  item('troll_trinket', { name: 'Hexed Trinket', slot: 'junk', q: 0, icon: 'voodoo_doll', sell: 12 });
  item('horde_bread', { name: 'Haunch of Meat', slot: 'food', q: 1, lvl: 5, restore: 243, icon: 'meat', sell: 6, cost: 25 });
  item('burning_blade_cloak', { name: 'Burning Blade Cloak', slot: 'back', q: 3, lvl: 5, armor: 9, stats: { int: 2, sta: 1 }, icon: 'cloak', sell: 130, source: 'Yarrog Baneshadow, Burning Blade Coven', look: ['back', 'burning_blade_cloak'] });
  item('zalazane_staff', { name: "Zalazane's Voodoo Staff", slot: 'weapon', wtype: 'staff', q: 3, lvl: 10, dmg: [16, 24], speed: 3.0, stats: { int: 4, spi: 3 }, sp: 9, icon: 'staff', sell: 800, source: 'Zalazane, Echo Isles', look: ['weapon', 'zalazane_staff'] });
  item('benedict_cutlass', { name: "Benedict's Cutlass", slot: 'weapon', wtype: 'sword', q: 3, lvl: 10, dmg: [11, 20], speed: 2.1, stats: { str: 3, sta: 2 }, icon: 'sword', sell: 800, source: 'Lieutenant Benedict, Tiragarde Keep', look: ['weapon', 'benedict_cutlass'] });
  item('cursed_felblade', { name: 'Cursed Felblade', slot: 'weapon', wtype: 'sword', q: 3, lvl: 10, dmg: [13, 23], speed: 2.4, stats: { str: 4, agi: 2 }, icon: 'sword', sell: 900, look: ['weapon', 'cursed_felblade'] });
  item('subterranean_cape', { name: 'Subterranean Cape', slot: 'back', q: 3, lvl: 10, armor: 18, stats: { sta: 3, spi: 2 }, icon: 'cloak', sell: 600, look: ['back', 'subterranean_cape'] });
  item('robe_evocation', { name: 'Robe of Evocation', slot: 'chest', atype: 'cloth', q: 3, lvl: 10, armor: 28, stats: { int: 6, spi: 3 }, sp: 4, icon: 'chest_cloth', sell: 700 });
  item('chanting_blade', { name: 'Chanting Blade', slot: 'weapon', wtype: 'dagger', q: 3, lvl: 10, dmg: [8, 15], speed: 1.6, stats: { int: 3, agi: 2 }, sp: 4, icon: 'dagger', sell: 800 });
  item('oggleflint_mace', { name: "Oggleflint's Inspirer", slot: 'weapon', wtype: 'mace', q: 3, lvl: 10, dmg: [12, 22], speed: 2.5, stats: { str: 4, sta: 2 }, icon: 'mace', sell: 800 });
  item('bazzalan_belt', { name: "Bazzalan's Cord", slot: 'waist', atype: 'leather', q: 3, lvl: 10, armor: 30, stats: { agi: 3, sta: 2 }, icon: 'belt', sell: 500 });

  // Mulgore
  item('plainstrider_beak', { name: 'Plainstrider Beak', slot: 'quest', q: 1, icon: 'plainstrider_beak' });
  item('battleboar_flank', { name: 'Battleboar Flank', slot: 'quest', q: 1, icon: 'meat' });
  item('swoop_quill', { name: 'Trophy Swoop Quill', slot: 'quest', q: 1, icon: 'feather' });
  item('arrachea_horn', { name: "Horn of Arra'chea", slot: 'quest', q: 1, icon: 'claw' });
  item('quilboar_tusk', { name: 'Quilboar Tusk', slot: 'junk', q: 0, icon: 'quilboar_tusk', sell: 8 });
  item('mulgore_bread', { name: 'Mulgore Spice Bread', slot: 'food', q: 1, lvl: 5, restore: 243, icon: 'bread', sell: 6, cost: 25 });
  item('snagglespear_pike', { name: "Snagglespear's War Pike", slot: 'weapon', wtype: 'staff', q: 3, lvl: 9, dmg: [15, 23], speed: 3.0, stats: { str: 4, sta: 3 }, icon: 'staff', sell: 700, source: 'Snagglespear, the Golden Plains', look: ['weapon', 'snagglespear_pike'] });
  item('mazzranache_cloak', { name: 'Mazzranache Pelt Cloak', slot: 'back', q: 3, lvl: 9, armor: 18, stats: { agi: 3, sta: 2 }, icon: 'cloak', sell: 380, source: 'Mazzranache, the Golden Plains', look: ['back', 'mazzranache_cloak'] });
  item('arrachea_totem', { name: "Arra'chea Bone Totem", slot: 'weapon', wtype: 'mace', q: 3, lvl: 10, dmg: [13, 23], speed: 2.6, stats: { str: 3, sta: 3, spi: 2 }, icon: 'mace', sell: 800, source: "Arra'chea, the Golden Plains", look: ['weapon', 'arrachea_totem'] });
  // Tirisfal
  item('bat_wing', { name: 'Duskbat Wing', slot: 'quest', q: 1, icon: 'bat_wing' });
  item('rot_hide_ichor', { name: 'Rot Hide Ichor', slot: 'quest', q: 1, icon: 'venom' });
  item('scarlet_armband', { name: 'Scarlet Armband', slot: 'quest', q: 1, icon: 'scarlet_armband' });
  item('maggot_eye_paw', { name: "Maggot Eye's Paw", slot: 'quest', q: 1, icon: 'claw' });
  item('rotting_flesh', { name: 'Rotting Flesh', slot: 'junk', q: 0, icon: 'zombie_brain', sell: 5 });
  item('tirisfal_pumpkin', { name: 'Tirisfal Pumpkin', slot: 'food', q: 1, lvl: 5, restore: 243, icon: 'grapes', sell: 6, cost: 25 });
  item('maggot_eye_axe', { name: "Maggot Eye's Cleaver", slot: 'weapon', wtype: 'axe', q: 3, lvl: 10, dmg: [13, 24], speed: 2.5, stats: { str: 4, sta: 2 }, icon: 'axe', sell: 800, source: "Maggot Eye, Garren's Haunt", look: ['weapon', 'maggot_eye_axe'] });
  item('perrine_cape', { name: "Perrine's Crusader Cape", slot: 'back', q: 3, lvl: 10, armor: 20, stats: { str: 2, sta: 2, int: 2 }, icon: 'cloak', sell: 450, source: 'Captain Perrine, Scarlet Watch Post', look: ['back', 'perrine_cape'] });

  // rare-boss trophies (house additions)
  item('garrick_cloak', { name: "Garrick's Bandit Cloak", slot: 'back', q: 3, lvl: 5, armor: 9, stats: { agi: 2, sta: 1 }, icon: 'cloak', sell: 120, source: 'Garrick Padfoot, Northshire Vineyards' });
  item('pumpkin_trousers', { name: 'Pumpkin Patch Trousers', slot: 'legs', atype: 'cloth', q: 3, lvl: 9, armor: 16, stats: { sta: 3, spi: 2 }, icon: 'legs', sell: 300, source: 'Princess, Brackwell Pumpkin Patch' });
  item('gnollhide_cloak', { name: 'Gnollhide Cloak', slot: 'back', q: 3, lvl: 10, armor: 20, stats: { str: 2, agi: 2, sta: 3 }, icon: 'cloak', sell: 450, source: "Hogger, Forest's Edge" });

  // Named gear that shows on the character. look: [part, key]; set pieces count toward the Defias mask.
  const LOOKS = {
    cruel_barb: ['weapon', 'cruel_barb'], smites_hammer: ['weapon', 'smites_hammer'], thiefs_blade: ['weapon', 'thiefs_blade'],
    buzzer_blade: ['weapon', 'buzzer_blade'], emberstone_staff: ['weapon', 'emberstone_staff'], cookies_rod: ['weapon', 'cookies_rod'],
    cookies_tenderizer: ['weapon', 'cookies_tenderizer'], militia_shortsword: ['weapon', 'militia_sword'], militia_dagger: ['weapon', 'militia_dagger'],
    militia_hammer: ['weapon', 'militia_hammer'], militia_staff: ['weapon', 'militia_staff'], militia_longbow: ['ranged', 'militia_longbow'],
    cape_brotherhood: ['back', 'cape_brotherhood'], garrick_cloak: ['back', 'garrick_cloak'], gnollhide_cloak: ['back', 'gnollhide_cloak'],
    defias_armor: ['chest', 'defias_armor'], corsair_shirt: ['chest', 'corsair_shirt'],
    smelting_pants: ['legs', 'smelting_pants'], defias_leggings: ['legs', 'defias_leggings'], pumpkin_trousers: ['legs', 'pumpkin_trousers'],
  };
  for (const id in LOOKS) I[id].look = LOOKS[id];
  for (const id of ['defias_armor', 'defias_leggings', 'defias_boots', 'defias_belt']) I[id].set = 'defias';
  for (const id of ['militia_shortsword', 'militia_dagger', 'militia_hammer', 'militia_staff', 'militia_longbow']) I[id].source = 'Quest: Wanted: Hogger';
  D.SETS = { defias: { name: 'Blackened Defias', pieces: 4, mask: 3 } };
  D.ITEMS = I;

  // Random green / white / grey gear generation (Classic "of the Bear" style).
  D.AFFIXES = [
    { name: 'of the Bear', stats: { str: 1, sta: 1 } }, { name: 'of the Tiger', stats: { str: 1, agi: 1 } },
    { name: 'of the Monkey', stats: { agi: 1, sta: 1 } }, { name: 'of the Eagle', stats: { sta: 1, int: 1 } },
    { name: 'of the Owl', stats: { int: 1, spi: 1 } }, { name: 'of the Whale', stats: { sta: 1, spi: 1 } },
    { name: 'of the Falcon', stats: { agi: 1, int: 1 } }, { name: 'of Strength', stats: { str: 2 } },
    { name: 'of Agility', stats: { agi: 2 } }, { name: 'of Intellect', stats: { int: 2 } },
    { name: 'of Stamina', stats: { sta: 2 } }, { name: 'of Spirit', stats: { spi: 2 } },
  ];
  D.GEAR_BASES = {
    cloth: { mats: ['Linen', 'Soft', 'Woolen'], grey: ['Frayed', 'Tattered'], arm: 0.25 },
    leather: { mats: ['Handstitched', 'Rawhide', 'Rough Leather'], grey: ['Worn', 'Cracked'], arm: 0.55 },
    mail: { mats: ['Chainmail', 'Ringed', 'Rusted'], grey: ['Dented', 'Battered'], arm: 1.0 },
  };
  D.SLOT_NAMES = { chest: ['Tunic', 'Vest', 'Robe'], legs: ['Pants', 'Leggings'], feet: ['Boots', 'Shoes'],
    hands: ['Gloves', 'Handwraps'], wrist: ['Bracers', 'Cuffs'], waist: ['Belt', 'Sash'], back: ['Cloak', 'Cape'], finger: ['Band', 'Ring'] };
  D.SLOT_ARMOR = { chest: 8, legs: 7, feet: 5, hands: 4, wrist: 3, waist: 4, back: 3, finger: 0 };
  D.WEAPON_BASES = {
    sword: { names: ['Shortsword', 'Broadsword', 'Blade'], speed: 2.2, icon: 'sword' },
    axe: { names: ['Hatchet', 'Handaxe'], speed: 2.4, icon: 'axe' },
    mace: { names: ['Mallet', 'Cudgel', 'Hammer'], speed: 2.3, icon: 'mace' },
    dagger: { names: ['Dirk', 'Knife', 'Stiletto'], speed: 1.6, icon: 'dagger' },
    staff: { names: ['Staff', 'Quarterstaff', 'Walking Stick'], speed: 3.0, icon: 'staff' },
    bow: { names: ['Shortbow', 'Longbow', 'Recurve Bow'], speed: 2.6, icon: 'bow' },
  };
  D.GEAR_SLOTS = ['weapon', 'ranged', 'chest', 'legs', 'feet', 'hands', 'wrist', 'waist', 'back', 'finger'];
  D.SLOT_LABEL = { weapon: 'Main Hand', ranged: 'Ranged', chest: 'Chest', legs: 'Legs', feet: 'Feet', hands: 'Hands', wrist: 'Wrist', waist: 'Waist', back: 'Back', finger: 'Finger' };
  D.SLOT_ICON = { chest: null, legs: 'legs', feet: 'boots', hands: 'gloves', wrist: 'bracers', waist: 'belt', back: 'cloak', finger: 'ring' };

  // ---------------------------------------------------------------- mobs
  // hp/dmg come from level via engine; mult tweaks. drops: [itemId, chance] ; quest drops only while quest is active.
  D.MOBS = {
    young_wolf: { name: 'Young Wolf', lvl: [1, 2], family: 'beast', drops: [['ruined_pelt', 0.35], ['wolf_fang', 0.25]], qdrops: [['wolf_meat', 0.75]] },
    kobold_vermin: { name: 'Kobold Vermin', lvl: [1, 2], family: 'humanoid', drops: [['kobold_rag', 0.4], ['linen_cloth', 0.2]], aggro: 'You no take candle!' },
    kobold_worker: { name: 'Kobold Worker', lvl: [3, 4], family: 'humanoid', drops: [['broken_candle', 0.35], ['linen_cloth', 0.25]], aggro: 'You no take candle!' },
    defias_thug: { name: 'Defias Thug', lvl: [3, 5], family: 'humanoid', drops: [['thieves_coin', 0.35], ['linen_cloth', 0.3]], qdrops: [['red_bandana', 0.7]], aggro: 'The Brotherhood will not tolerate your actions!' },
    garrick_padfoot: { name: 'Garrick Padfoot', lvl: [5, 5], family: 'humanoid', named: true, hpMult: 1.6, dmgMult: 1.2, drops: [['thieves_coin', 1], ['garrick_cloak', 0.35]], qdrops: [['garrick_head', 1]], aggro: 'I\'ll gut you like a fish!' },
    mangy_wolf: { name: 'Mangy Wolf', lvl: [5, 6], family: 'beast', drops: [['ruined_pelt', 0.4], ['wolf_fang', 0.3]] },
    kobold_laborer: { name: 'Kobold Laborer', lvl: [5, 6], family: 'humanoid', drops: [['broken_candle', 0.4], ['linen_cloth', 0.3]], qdrops: [['large_candle', 0.6], ['gold_dust', 0.5]], aggro: 'You no take candle!' },
    kobold_tunneler: { name: 'Kobold Tunneler', lvl: [6, 7], family: 'humanoid', drops: [['broken_candle', 0.4], ['linen_cloth', 0.3]], qdrops: [['large_candle', 0.6], ['gold_dust', 0.5]], aggro: 'Yiiieeee! Me run!' },
    young_forest_bear: { name: 'Young Forest Bear', lvl: [7, 8], family: 'beast', hpMult: 1.15, drops: [['bear_hide', 0.4]] },
    prowler: { name: 'Prowler', lvl: [7, 8], family: 'beast', drops: [['ruined_pelt', 0.4], ['wolf_fang', 0.3]] },
    murloc_streamrunner: { name: 'Murloc Streamrunner', lvl: [7, 8], family: 'murloc', drops: [['murloc_eye', 0.45]], qdrops: [['murloc_fin', 0.6]], aggro: 'Mrrrggllll!' },
    murloc_forager: { name: 'Murloc Forager', lvl: [8, 9], family: 'murloc', drops: [['murloc_eye', 0.45]], qdrops: [['murloc_fin', 0.6]], aggro: 'Aaaaaughibbrgubugbugrguburgle!' },
    defias_bandit: { name: 'Defias Bandit', lvl: [8, 10], family: 'humanoid', drops: [['thieves_coin', 0.4], ['linen_cloth', 0.35], ['pumpkin', 0.2]], qdrops: [['red_linen', 0.65]], aggro: 'Your bones will break under my boot!' },
    princess: { name: 'Princess', lvl: [9, 9], family: 'beast', named: true, hpMult: 1.8, dmgMult: 1.2, drops: [['bear_hide', 1], ['pumpkin_trousers', 0.35]], qdrops: [['brass_collar', 1]] },
    riverpaw_gnoll: { name: 'Riverpaw Gnoll', lvl: [9, 10], family: 'humanoid', drops: [['gnoll_mane', 0.45], ['linen_cloth', 0.3]], qdrops: [['gnoll_armband', 0.6]], aggro: 'Grrr... fresh meat!' },
    hogger: { name: 'Hogger', lvl: [11, 11], family: 'humanoid', elite: true, named: true, hpMult: 5.5, dmgMult: 2.6, drops: [['gnoll_mane', 1]], qdrops: [['gnoll_claw', 1]], aggro: 'More bones to gnaw on...', special: 'hogger', loot: ['gnollhide_cloak'] },
    // Deadmines (dungeon mults applied by the dungeon definition)
    defias_miner: { name: 'Defias Miner', lvl: [10, 11], family: 'humanoid', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.4]] },
    defias_pirate: { name: 'Defias Pirate', lvl: [11, 11], family: 'humanoid', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.4]] },
    goblin_engineer: { name: 'Goblin Engineer', lvl: [10, 11], family: 'humanoid', drops: [['thieves_coin', 0.5]] },
    rhahkzor: { name: "Rhahk'Zor", lvl: [11, 11], family: 'giant', boss: true, special: 'slam', aggro: 'VanCleef pay big for your heads!', loot: ['foreman_belt', 'miners_bracers', 'defias_belt'] },
    sneed_shredder: { name: "Sneed's Shredder", lvl: [11, 11], family: 'mechanical', boss: true, special: 'whirl', loot: ['buzzer_blade', 'gold_gloves', 'defias_boots'] },
    gilnid: { name: 'Gilnid', lvl: [11, 11], family: 'humanoid', boss: true, special: 'molten', aggro: 'Anyone want to take a break? Well too bad! Get to work you oafs!', loot: ['smelting_pants', 'lavish_ring', 'defias_leggings'] },
    mr_smite: { name: 'Mr. Smite', lvl: [12, 12], family: 'humanoid', boss: true, special: 'smite', aggro: 'We\'re under attack! Avast, ye swabs! Repel the invaders!', loot: ['smites_hammer', 'thiefs_blade', 'emberstone_staff'] },
    cookie: { name: 'Cookie', lvl: [12, 12], family: 'murloc', boss: true, special: 'cook', aggro: 'Mrrglrrgl... blub!', loot: ['cookies_rod', 'cookies_tenderizer', 'corsair_shirt'] },
    vancleef: { name: 'Edwin VanCleef', lvl: [12, 12], family: 'humanoid', boss: true, special: 'vancleef', aggro: 'None may challenge the Brotherhood!', loot: ['cruel_barb', 'cape_brotherhood', 'defias_armor'], qdrops: [['vancleef_head', 1]] },
    // Dun Morogh
    rockjaw_trogg: { name: 'Rockjaw Trogg', lvl: [1, 2], family: 'humanoid', drops: [['trogg_stone', 0.4], ['linen_cloth', 0.2]], aggro: 'Grrrr... mine!' },
    burly_rockjaw_trogg: { name: 'Burly Rockjaw Trogg', lvl: [3, 4], family: 'humanoid', drops: [['trogg_stone', 0.4], ['linen_cloth', 0.25]] },
    ragged_young_wolf: { name: 'Ragged Young Wolf', lvl: [1, 2], family: 'beast', drops: [['ruined_pelt', 0.35], ['wolf_fang', 0.25]], qdrops: [['wolf_meat', 0.75]] },
    small_crag_boar: { name: 'Small Crag Boar', lvl: [2, 3], family: 'beast', drops: [['ruined_pelt', 0.3]], qdrops: [['crag_boar_rib', 0.5]] },
    frostmane_troll_whelp: { name: 'Frostmane Troll Whelp', lvl: [3, 4], family: 'humanoid', drops: [['troll_tusk', 0.35], ['linen_cloth', 0.25]], aggro: 'You be dead soon!' },
    grik_nir: { name: "Grik'nir the Cold", lvl: [5, 5], family: 'humanoid', named: true, hpMult: 1.7, dmgMult: 1.2, drops: [['troll_tusk', 1], ['griknir_staff', 0.35]], qdrops: [['felix_journal', 1]], aggro: 'Da ice will take ya!' },
    crag_boar: { name: 'Crag Boar', lvl: [5, 6], family: 'beast', drops: [['ruined_pelt', 0.4]], qdrops: [['crag_boar_rib', 0.55]] },
    young_wendigo: { name: 'Young Wendigo', lvl: [5, 6], family: 'yeti', drops: [['bear_hide', 0.3]], qdrops: [['wendigo_mane', 0.6]] },
    wendigo: { name: 'Wendigo', lvl: [7, 8], family: 'yeti', hpMult: 1.1, drops: [['bear_hide', 0.4]], qdrops: [['wendigo_mane', 0.65]] },
    old_icebeard: { name: 'Old Icebeard', lvl: [9, 9], family: 'yeti', named: true, hpMult: 1.9, dmgMult: 1.25, drops: [['bear_hide', 1], ['icebeard_cloak', 0.35]] },
    frostmane_troll: { name: 'Frostmane Troll', lvl: [6, 7], family: 'humanoid', drops: [['troll_tusk', 0.4], ['linen_cloth', 0.3]], aggro: 'You be dead soon!' },
    frostmane_headhunter: { name: 'Frostmane Headhunter', lvl: [8, 9], family: 'humanoid', drops: [['troll_tusk', 0.45], ['linen_cloth', 0.3]], aggro: 'Your head be mine!' },
    frostmane_seer: { name: 'Frostmane Seer', lvl: [8, 9], family: 'humanoid', drops: [['troll_tusk', 0.4], ['linen_cloth', 0.35]] },
    elder_crag_boar: { name: 'Elder Crag Boar', lvl: [8, 9], family: 'beast', hpMult: 1.1, drops: [['ruined_pelt', 0.4]], qdrops: [['crag_boar_rib', 0.6]] },
    ice_claw_bear: { name: 'Ice Claw Bear', lvl: [8, 9], family: 'beast', hpMult: 1.15, drops: [['bear_hide', 0.4]] },
    snow_leopard: { name: 'Snow Leopard', lvl: [8, 9], family: 'beast', drops: [['ruined_pelt', 0.4]] },
    leper_gnome: { name: 'Leper Gnome', lvl: [8, 10], family: 'humanoid', drops: [['linen_cloth', 0.4], ['thieves_coin', 0.3]], qdrops: [['restab_cog', 0.6]], aggro: 'Gnomeregan will be ours again!' },
    vagash: { name: 'Vagash', lvl: [11, 11], family: 'beast', elite: true, named: true, hpMult: 5.2, dmgMult: 2.5, drops: [['bear_hide', 1]], qdrops: [['vagash_fang', 1]], special: 'hogger', loot: ['vagash_claw'] },
    // Teldrassil
    young_nightsaber: { name: 'Young Nightsaber', lvl: [1, 2], family: 'beast', drops: [['ruined_pelt', 0.35]] },
    young_thistle_boar: { name: 'Young Thistle Boar', lvl: [1, 2], family: 'beast', drops: [['ruined_pelt', 0.3]] },
    mangy_nightsaber: { name: 'Mangy Nightsaber', lvl: [2, 3], family: 'beast', drops: [['ruined_pelt', 0.35]] },
    thistle_boar: { name: 'Thistle Boar', lvl: [3, 4], family: 'beast', drops: [['ruined_pelt', 0.35]] },
    grell: { name: 'Grell', lvl: [2, 3], family: 'demon', drops: [['grell_earring', 0.35]], qdrops: [['fel_moss', 0.65]], aggro: 'Kill the tree-hugger!' },
    webwood_spider: { name: 'Webwood Spider', lvl: [3, 4], family: 'beast', drops: [['ruined_pelt', 0.2]], qdrops: [['venom_sac', 0.6]] },
    githyiss: { name: 'Githyiss the Vile', lvl: [5, 5], family: 'beast', named: true, hpMult: 1.7, dmgMult: 1.2, drops: [['venom_sac', 1], ['githyiss_shroud', 0.35]] },
    nightsaber: { name: 'Nightsaber', lvl: [5, 6], family: 'beast', drops: [['ruined_pelt', 0.4]], qdrops: [['nightsaber_pelt', 0.55]] },
    strigid_owl: { name: 'Strigid Owl', lvl: [5, 6], family: 'beast', drops: [['wolf_fang', 0.2]], qdrops: [['owl_feather', 0.55]] },
    timberling: { name: 'Timberling', lvl: [6, 7], family: 'elemental', drops: [['linen_cloth', 0.15]], qdrops: [['timberling_seed', 0.6]] },
    gnarlpine_ursa: { name: 'Gnarlpine Ursa', lvl: [6, 7], family: 'humanoid', drops: [['furbolg_charm', 0.35], ['linen_cloth', 0.3]], aggro: 'You not welcome here!' },
    gnarlpine_warrior: { name: 'Gnarlpine Warrior', lvl: [8, 9], family: 'humanoid', drops: [['furbolg_charm', 0.4], ['linen_cloth', 0.3]], aggro: 'You not welcome here!' },
    gnarlpine_shaman: { name: 'Gnarlpine Shaman', lvl: [8, 9], family: 'humanoid', drops: [['furbolg_charm', 0.4], ['linen_cloth', 0.35]] },
    oakenscowl: { name: 'Oakenscowl', lvl: [10, 10], family: 'humanoid', named: true, hpMult: 1.9, dmgMult: 1.25, drops: [['furbolg_charm', 1], ['oakenscowl_staff', 0.35]], aggro: 'The forest is ours!' },
    shadow_sprite: { name: 'Shadow Sprite', lvl: [7, 8], family: 'demon', drops: [['grell_earring', 0.35]] },
    vicious_grell: { name: 'Vicious Grell', lvl: [8, 9], family: 'demon', drops: [['grell_earring', 0.4]] },
    lord_melenas: { name: 'Lord Melenas', lvl: [10, 10], family: 'demon', named: true, hpMult: 1.9, dmgMult: 1.25, drops: [['grell_earring', 1], ['melenas_blade', 0.35]], qdrops: [['melenas_head', 1]], aggro: 'Your blood will feed the fel!' },
    // Durotar
    mottled_boar: { name: 'Mottled Boar', lvl: [1, 2], family: 'beast', drops: [['boar_tusk', 0.4], ['ruined_pelt', 0.2]] },
    scorpid_worker: { name: 'Scorpid Worker', lvl: [3, 3], family: 'beast', drops: [['ruined_pelt', 0.2]], qdrops: [['scorpid_stinger', 0.65]] },
    vile_familiar: { name: 'Vile Familiar', lvl: [2, 3], family: 'demon', drops: [['grell_earring', 0.3]] },
    felstalker: { name: 'Felstalker', lvl: [4, 5], family: 'demon', drops: [['grell_earring', 0.35]] },
    yarrog: { name: 'Yarrog Baneshadow', lvl: [5, 5], family: 'humanoid', named: true, hpMult: 1.7, dmgMult: 1.2, drops: [['linen_cloth', 1], ['burning_blade_cloak', 0.35]], qdrops: [['burning_medallion', 1]], aggro: 'The Burning Blade will consume you!' },
    dire_mottled_boar: { name: 'Dire Mottled Boar', lvl: [6, 7], family: 'beast', drops: [['boar_tusk', 0.45]] },
    scorpid_reaver: { name: 'Scorpid Reaver', lvl: [7, 8], family: 'beast', drops: [['ruined_pelt', 0.3]] },
    thunder_lizard: { name: 'Thunder Lizard', lvl: [6, 8], family: 'beast', drops: [['ruined_pelt', 0.3]], qdrops: [['lizard_horn', 0.6]] },
    durotar_tiger: { name: 'Durotar Tiger', lvl: [7, 8], family: 'beast', drops: [['ruined_pelt', 0.4]] },
    hexed_troll: { name: 'Hexed Troll', lvl: [8, 9], family: 'humanoid', drops: [['troll_trinket', 0.4], ['linen_cloth', 0.3]], qdrops: [['voodoo_charm', 0.6]], aggro: 'Zalazane will have your soul!' },
    voodoo_troll: { name: 'Voodoo Troll', lvl: [8, 9], family: 'humanoid', drops: [['troll_trinket', 0.4], ['linen_cloth', 0.35]], qdrops: [['voodoo_charm', 0.6]] },
    zalazane: { name: 'Zalazane', lvl: [11, 11], family: 'humanoid', elite: true, named: true, hpMult: 5.2, dmgMult: 2.5, drops: [['troll_trinket', 1]], qdrops: [['zalazane_head', 1]], special: 'hogger', loot: ['zalazane_staff'], aggro: 'You come to die on da Echo Isles!' },
    kul_tiras_sailor: { name: 'Kul Tiras Sailor', lvl: [8, 9], family: 'humanoid', drops: [['thieves_coin', 0.4], ['linen_cloth', 0.35]], qdrops: [['kultiras_insignia', 0.55]], aggro: 'For Kul Tiras!' },
    kul_tiras_marine: { name: 'Kul Tiras Marine', lvl: [9, 10], family: 'humanoid', drops: [['thieves_coin', 0.45], ['linen_cloth', 0.35]], qdrops: [['kultiras_insignia', 0.6]], aggro: 'Hold the line!' },
    lieutenant_benedict: { name: 'Lieutenant Benedict', lvl: [10, 10], family: 'humanoid', named: true, hpMult: 1.9, dmgMult: 1.25, drops: [['thieves_coin', 1], ['benedict_cutlass', 0.35]], aggro: 'You filthy orcs will never take this keep!' },
    // Mulgore
    plainstrider: { name: 'Plainstrider', lvl: [1, 2], family: 'beast', drops: [['ruined_pelt', 0.2]], qdrops: [['plainstrider_beak', 0.7]] },
    prairie_wolf: { name: 'Prairie Wolf', lvl: [2, 3], family: 'beast', drops: [['ruined_pelt', 0.35], ['wolf_fang', 0.25]] },
    battleboar: { name: 'Battleboar', lvl: [3, 4], family: 'beast', drops: [['boar_tusk', 0.4]], qdrops: [['battleboar_flank', 0.6]] },
    bristleback_quilboar: { name: 'Bristleback Quilboar', lvl: [3, 5], family: 'humanoid', drops: [['quilboar_tusk', 0.4], ['linen_cloth', 0.25]], aggro: 'Squeal! Intruder!' },
    bristleback_shaman: { name: 'Bristleback Shaman', lvl: [4, 5], family: 'humanoid', drops: [['quilboar_tusk', 0.4], ['linen_cloth', 0.3]] },
    chief_sharptusk: { name: 'Chief Sharptusk Thornmantle', lvl: [6, 6], family: 'humanoid', named: true, hpMult: 1.7, dmgMult: 1.2, drops: [['quilboar_tusk', 1]], aggro: 'The thorns will drink your blood!' },
    adult_plainstrider: { name: 'Adult Plainstrider', lvl: [6, 7], family: 'beast', drops: [['ruined_pelt', 0.3]] },
    swoop: { name: 'Swoop', lvl: [6, 7], family: 'beast', drops: [['wolf_fang', 0.2]], qdrops: [['swoop_quill', 0.6]] },
    prairie_stalker: { name: 'Prairie Stalker', lvl: [7, 8], family: 'beast', drops: [['ruined_pelt', 0.4], ['wolf_fang', 0.3]] },
    palemane_tanner: { name: 'Palemane Tanner', lvl: [7, 8], family: 'humanoid', drops: [['gnoll_mane', 0.4], ['linen_cloth', 0.3]] },
    palemane_poacher: { name: 'Palemane Poacher', lvl: [8, 9], family: 'humanoid', drops: [['gnoll_mane', 0.45], ['linen_cloth', 0.3]], aggro: 'Fresh meat!' },
    venture_worker: { name: 'Venture Co. Worker', lvl: [7, 8], family: 'humanoid', drops: [['thieves_coin', 0.4], ['linen_cloth', 0.3]], aggro: 'Time is money!' },
    venture_supervisor: { name: 'Venture Co. Supervisor', lvl: [8, 9], family: 'humanoid', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.3]], aggro: 'Get back to work!' },
    snagglespear: { name: 'Snagglespear', lvl: [9, 9], family: 'humanoid', named: true, hpMult: 1.9, dmgMult: 1.25, drops: [['quilboar_tusk', 1], ['snagglespear_pike', 0.35]] },
    mazzranache: { name: 'Mazzranache', lvl: [9, 9], family: 'beast', named: true, hpMult: 1.9, dmgMult: 1.25, drops: [['ruined_pelt', 1], ['mazzranache_cloak', 0.35]] },
    arrachea: { name: "Arra'chea", lvl: [11, 11], family: 'beast', elite: true, named: true, hpMult: 5.4, dmgMult: 2.5, drops: [['ruined_pelt', 1]], qdrops: [['arrachea_horn', 1]], special: 'hogger', loot: ['arrachea_totem'] },
    // Tirisfal
    mindless_zombie: { name: 'Mindless Zombie', lvl: [1, 2], family: 'undead', drops: [['rotting_flesh', 0.4], ['linen_cloth', 0.2]] },
    wretched_zombie: { name: 'Wretched Zombie', lvl: [2, 3], family: 'undead', drops: [['rotting_flesh', 0.4], ['linen_cloth', 0.25]] },
    duskbat: { name: 'Duskbat', lvl: [1, 3], family: 'beast', drops: [['wolf_fang', 0.2]], qdrops: [['bat_wing', 0.6]] },
    rattlecage_skeleton: { name: 'Rattlecage Skeleton', lvl: [3, 4], family: 'undead', drops: [['rotting_flesh', 0.3], ['linen_cloth', 0.25]] },
    samuel_fipps: { name: 'Samuel Fipps', lvl: [4, 4], family: 'undead', named: true, hpMult: 1.7, dmgMult: 1.2, drops: [['rotting_flesh', 1]], aggro: 'Braaains...' },
    young_night_web_spider: { name: 'Young Night Web Spider', lvl: [3, 4], family: 'beast', drops: [['ruined_pelt', 0.2]] },
    night_web_spider: { name: 'Night Web Spider', lvl: [4, 5], family: 'beast', drops: [['ruined_pelt', 0.25]] },
    darkhound: { name: 'Darkhound', lvl: [6, 7], family: 'beast', drops: [['ruined_pelt', 0.4], ['wolf_fang', 0.3]] },
    greater_duskbat: { name: 'Greater Duskbat', lvl: [6, 7], family: 'beast', drops: [['wolf_fang', 0.25]], qdrops: [['bat_wing', 0.6]] },
    rot_hide_gnoll: { name: 'Rot Hide Gnoll', lvl: [7, 8], family: 'humanoid', drops: [['gnoll_mane', 0.4], ['linen_cloth', 0.3]], qdrops: [['rot_hide_ichor', 0.6]] },
    rot_hide_mongrel: { name: 'Rot Hide Mongrel', lvl: [8, 9], family: 'humanoid', drops: [['gnoll_mane', 0.45], ['linen_cloth', 0.3]], qdrops: [['rot_hide_ichor', 0.6]] },
    maggot_eye: { name: 'Maggot Eye', lvl: [11, 11], family: 'humanoid', elite: true, named: true, hpMult: 5.4, dmgMult: 2.5, drops: [['gnoll_mane', 1]], qdrops: [['maggot_eye_paw', 1]], special: 'hogger', loot: ['maggot_eye_axe'], aggro: 'Maggot Eye hungry!' },
    scarlet_convert: { name: 'Scarlet Convert', lvl: [8, 9], family: 'humanoid', drops: [['thieves_coin', 0.4], ['linen_cloth', 0.35]], qdrops: [['scarlet_armband', 0.6]], aggro: 'The Light condemns all who harbor evil!' },
    scarlet_warrior: { name: 'Scarlet Warrior', lvl: [9, 10], family: 'humanoid', drops: [['thieves_coin', 0.45], ['linen_cloth', 0.35]], qdrops: [['scarlet_armband', 0.6]], aggro: 'Die, undead scum!' },
    captain_perrine: { name: 'Captain Perrine', lvl: [10, 10], family: 'humanoid', named: true, hpMult: 1.9, dmgMult: 1.25, drops: [['thieves_coin', 1], ['perrine_cape', 0.35]], aggro: 'For the Crusade!' },
    // Ragefire Chasm
    ragefire_trogg: { name: 'Ragefire Trogg', lvl: [10, 11], family: 'humanoid', drops: [['trogg_stone', 0.5], ['linen_cloth', 0.4]] },
    searing_blade_cultist: { name: 'Searing Blade Cultist', lvl: [10, 11], family: 'humanoid', drops: [['linen_cloth', 0.5], ['thieves_coin', 0.3]] },
    earthborer: { name: 'Earthborer', lvl: [10, 11], family: 'beast', drops: [['ruined_pelt', 0.3]] },
    oggleflint: { name: 'Oggleflint', lvl: [11, 11], family: 'humanoid', boss: true, special: 'slam', aggro: 'Grrrr! Oggleflint smash!', loot: ['oggleflint_mace', 'bazzalan_belt'] },
    taragaman: { name: 'Taragaman the Hungerer', lvl: [12, 12], family: 'demon', boss: true, special: 'whirl', aggro: 'They call me the Hungerer. Soon you will see why!', loot: ['cursed_felblade', 'subterranean_cape'], qdrops: [['taragaman_heart', 1]] },
    jergosh: { name: 'Jergosh the Invoker', lvl: [12, 12], family: 'humanoid', boss: true, special: 'molten', aggro: 'The Searing Blade will burn you!', loot: ['robe_evocation', 'chanting_blade'] },
    bazzalan: { name: 'Bazzalan', lvl: [12, 12], family: 'demon', boss: true, special: 'cook', aggro: 'You dare trespass here?', loot: ['bazzalan_belt', 'chanting_blade', 'cursed_felblade'] },
    blackguard: { name: 'Blackguard', lvl: [11, 11], family: 'humanoid', sprite: 'defias_pirate', drops: [] },
  };


  // ---------------------------------------------------------------- world
  D.PLACES = {
    anvilmar: { name: 'Anvilmar', zone: 'Coldridge Valley', region: 'dunmorogh', scene: 'coldridge_valley', lvl: [1, 3],
      mobs: [['rockjaw_trogg', 5], ['ragged_young_wolf', 5], ['small_crag_boar', 2], ['burly_rockjaw_trogg', 2]], pool: 10, npcs: ['sten', 'balir', 'talin', 'adlin'], vendor: 'adlin',
      links: { coldridge_cave: 12, kharanos: 30 } },
    coldridge_cave: { name: 'Frostmane Cave', zone: 'Coldridge Valley', region: 'dunmorogh', scene: 'coldridge_cave', lvl: [3, 5],
      mobs: [['frostmane_troll_whelp', 8], ['burly_rockjaw_trogg', 2]], named: { grik_nir: 90 }, pool: 9, npcs: [],
      links: { anvilmar: 12 } },
    kharanos: { name: 'Kharanos', zone: 'Dun Morogh', region: 'dunmorogh', scene: 'kharanos', lvl: [5, 10], safe: true, inn: true,
      mobs: [], pool: 0, npcs: ['ragnar', 'belm', 'stonegear', 'senir', 'grawn'], vendor: 'belm', gearVendor: 'grawn',
      links: { anvilmar: 30, grizzled_den: 14, frostmane_hold: 16, amberstill_ranch: 18, ironforge: 20 } },
    grizzled_den: { name: 'The Grizzled Den', zone: 'Dun Morogh', region: 'dunmorogh', scene: 'grizzled_den', lvl: [5, 8],
      mobs: [['young_wendigo', 6], ['wendigo', 4], ['crag_boar', 3]], named: { old_icebeard: 150 }, pool: 10, npcs: [],
      links: { kharanos: 14 } },
    frostmane_hold: { name: 'Frostmane Hold', zone: 'Dun Morogh', region: 'dunmorogh', scene: 'frostmane_hold', lvl: [7, 10],
      mobs: [['frostmane_troll', 5], ['frostmane_headhunter', 4], ['frostmane_seer', 3]], pool: 10, npcs: [],
      links: { kharanos: 16 } },
    amberstill_ranch: { name: 'Amberstill Ranch', zone: 'Dun Morogh', region: 'dunmorogh', scene: 'amberstill_ranch', lvl: [8, 11],
      mobs: [['elder_crag_boar', 5], ['ice_claw_bear', 4], ['snow_leopard', 4], ['leper_gnome', 3]], named: { vagash: 180 }, pool: 11, npcs: ['rudra'],
      links: { kharanos: 18 } },
    shadowglen: { name: 'Shadowglen', zone: 'Teldrassil', region: 'teldrassil', scene: 'shadowglen', lvl: [1, 3],
      mobs: [['young_nightsaber', 4], ['young_thistle_boar', 4], ['mangy_nightsaber', 2], ['thistle_boar', 2], ['grell', 3]], pool: 11, npcs: ['ilthalaine', 'gilshalan', 'dirania', 'nyoma'], vendor: 'nyoma',
      links: { shadowthread_cave: 12, dolanaar: 30 } },
    shadowthread_cave: { name: 'Shadowthread Cave', zone: 'Teldrassil', region: 'teldrassil', scene: 'shadowthread_cave', lvl: [3, 5],
      mobs: [['webwood_spider', 9]], named: { githyiss: 90 }, pool: 9, npcs: [],
      links: { shadowglen: 12 } },
    dolanaar: { name: 'Dolanaar', zone: 'Teldrassil', region: 'teldrassil', scene: 'dolanaar', lvl: [5, 10], safe: true, inn: true,
      mobs: [], pool: 0, npcs: ['tallonkai', 'zenn', 'keldamyr', 'kyra', 'ilyenia'], vendor: 'keldamyr', gearVendor: 'ilyenia',
      links: { shadowglen: 30, lake_alameth: 14, banethil_barrow: 16, fel_rock: 18, darnassus: 25 } },
    lake_alameth: { name: "Lake Al'Ameth", zone: 'Teldrassil', region: 'teldrassil', scene: 'lake_alameth', lvl: [5, 8],
      mobs: [['nightsaber', 4], ['strigid_owl', 4], ['timberling', 4]], pool: 10, npcs: ['denalan'],
      links: { dolanaar: 14 } },
    banethil_barrow: { name: "Ban'ethil Barrow Den", zone: 'Teldrassil', region: 'teldrassil', scene: 'banethil_barrow', lvl: [6, 10],
      mobs: [['gnarlpine_ursa', 4], ['gnarlpine_warrior', 4], ['gnarlpine_shaman', 3]], named: { oakenscowl: 150 }, pool: 10, npcs: [],
      links: { dolanaar: 16 } },
    fel_rock: { name: 'Fel Rock', zone: 'Teldrassil', region: 'teldrassil', scene: 'fel_rock', lvl: [7, 10],
      mobs: [['shadow_sprite', 5], ['vicious_grell', 5]], named: { lord_melenas: 150 }, pool: 9, npcs: [],
      links: { dolanaar: 18 } },
    darnassus: { name: 'Darnassus', zone: 'Darnassus', region: 'teldrassil', scene: 'darnassus', lvl: [1, 60], safe: true, inn: true, city: true,
      mobs: [], pool: 0, npcs: ['saelienne', 'mydrannul'], vendor: 'saelienne', gearVendor: 'mydrannul',
      links: { dolanaar: 25, goldshire: 60 }, via: { goldshire: "Boat from Rut'theran" } },
    valley_of_trials: { name: 'Valley of Trials', zone: 'Durotar', region: 'durotar', scene: 'valley_of_trials', lvl: [1, 3],
      mobs: [['mottled_boar', 5], ['scorpid_worker', 4], ['vile_familiar', 3]], pool: 11, npcs: ['gornek', 'kaltunk', 'galgar', 'zureetha', 'duokna'], vendor: 'duokna',
      gather: { item: 'cactus_apple', label: 'Cactus Apple', quest: 'cactus_apples' },
      links: { burning_blade_coven: 12, razor_hill: 30 } },
    burning_blade_coven: { name: 'Burning Blade Coven', zone: 'Durotar', region: 'durotar', scene: 'burning_blade_coven', lvl: [3, 5],
      mobs: [['vile_familiar', 5], ['felstalker', 4]], named: { yarrog: 90 }, pool: 9, npcs: [],
      links: { valley_of_trials: 12 } },
    razor_hill: { name: 'Razor Hill', zone: 'Durotar', region: 'durotar', scene: 'razor_hill', lvl: [5, 10], safe: true, inn: true,
      mobs: [], pool: 0, npcs: ['garthok', 'grosk', 'orgnil', 'kaplak', 'vikar'], vendor: 'grosk', gearVendor: 'kaplak',
      links: { valley_of_trials: 30, thunder_ridge: 16, echo_isles: 18, tiragarde_keep: 16, orgrimmar: 22 } },
    thunder_ridge: { name: 'Thunder Ridge', zone: 'Durotar', region: 'durotar', scene: 'thunder_ridge', lvl: [6, 8],
      mobs: [['thunder_lizard', 5], ['dire_mottled_boar', 4], ['scorpid_reaver', 3]], pool: 10, npcs: [],
      links: { razor_hill: 16 } },
    echo_isles: { name: 'Echo Isles', zone: 'Durotar', region: 'durotar', scene: 'echo_isles', lvl: [8, 11],
      mobs: [['hexed_troll', 5], ['voodoo_troll', 4], ['durotar_tiger', 2]], named: { zalazane: 180 }, pool: 10, npcs: ['vanira'],
      links: { razor_hill: 18 } },
    tiragarde_keep: { name: 'Tiragarde Keep', zone: 'Durotar', region: 'durotar', scene: 'tiragarde_keep', lvl: [8, 10],
      mobs: [['kul_tiras_sailor', 5], ['kul_tiras_marine', 5]], named: { lieutenant_benedict: 150 }, pool: 10, npcs: [],
      links: { razor_hill: 16 } },
    orgrimmar: { name: 'Orgrimmar', zone: 'Orgrimmar', region: 'durotar', scene: 'orgrimmar', lvl: [1, 60], safe: true, inn: true, city: true,
      mobs: [], pool: 0, npcs: ['gryshka', 'rahauro', 'thrall_herald'], vendor: 'gryshka', gearVendor: 'rahauro',
      links: { razor_hill: 22, thunder_bluff: 60, undercity: 60 }, via: { thunder_bluff: 'Wind Rider', undercity: 'Zeppelin' } },
    camp_narache: { name: 'Camp Narache', zone: 'Mulgore', region: 'mulgore', scene: 'camp_narache', lvl: [1, 3],
      mobs: [['plainstrider', 5], ['prairie_wolf', 3], ['battleboar', 3]], pool: 11, npcs: ['grull', 'hawkwind', 'raincaller', 'moodan'], vendor: 'moodan',
      links: { brambleblade_ravine: 12, bloodhoof_village: 30 } },
    brambleblade_ravine: { name: 'Brambleblade Ravine', zone: 'Mulgore', region: 'mulgore', scene: 'brambleblade_ravine', lvl: [3, 5],
      mobs: [['bristleback_quilboar', 6], ['bristleback_shaman', 3]], named: { chief_sharptusk: 90 }, pool: 9, npcs: [],
      links: { camp_narache: 12 } },
    bloodhoof_village: { name: 'Bloodhoof Village', zone: 'Mulgore', region: 'mulgore', scene: 'bloodhoof_village', lvl: [5, 10], safe: true, inn: true,
      mobs: [], pool: 0, npcs: ['baine', 'kauth', 'harken', 'mahnott', 'morin'], vendor: 'kauth', gearVendor: 'mahnott',
      links: { camp_narache: 30, palemane_rock: 14, venture_mine: 16, golden_plains: 14, thunder_bluff: 22 } },
    palemane_rock: { name: 'Palemane Rock', zone: 'Mulgore', region: 'mulgore', scene: 'palemane_rock', lvl: [6, 9],
      mobs: [['palemane_tanner', 5], ['palemane_poacher', 4], ['prairie_stalker', 2]], pool: 10, npcs: [],
      links: { bloodhoof_village: 14 } },
    venture_mine: { name: 'The Venture Co. Mine', zone: 'Mulgore', region: 'mulgore', scene: 'venture_mine', lvl: [7, 9],
      mobs: [['venture_worker', 6], ['venture_supervisor', 4]], pool: 10, npcs: [],
      links: { bloodhoof_village: 16 } },
    golden_plains: { name: 'The Golden Plains', zone: 'Mulgore', region: 'mulgore', scene: 'golden_plains', lvl: [6, 11],
      mobs: [['adult_plainstrider', 4], ['swoop', 4], ['prairie_stalker', 3]], named: { snagglespear: 150, mazzranache: 150, arrachea: 180 }, pool: 11, npcs: [],
      links: { bloodhoof_village: 14 } },
    thunder_bluff: { name: 'Thunder Bluff', zone: 'Thunder Bluff', region: 'mulgore', scene: 'thunder_bluff', lvl: [1, 60], safe: true, inn: true, city: true,
      mobs: [], pool: 0, npcs: ['pala', 'etu'], vendor: 'pala', gearVendor: 'etu',
      links: { bloodhoof_village: 22, orgrimmar: 60 }, via: { orgrimmar: 'Wind Rider' } },
    deathknell: { name: 'Deathknell', zone: 'Tirisfal Glades', region: 'tirisfal', scene: 'deathknell', lvl: [1, 4],
      mobs: [['mindless_zombie', 4], ['wretched_zombie', 3], ['duskbat', 3], ['rattlecage_skeleton', 3]], named: { samuel_fipps: 90 }, pool: 12, npcs: ['sarvis', 'arren', 'saltain', 'kien'], vendor: 'kien',
      links: { night_web_hollow: 12, brill: 30 } },
    night_web_hollow: { name: "Night Web's Hollow", zone: 'Tirisfal Glades', region: 'tirisfal', scene: 'night_web_hollow', lvl: [3, 5],
      mobs: [['young_night_web_spider', 5], ['night_web_spider', 5]], pool: 9, npcs: [],
      links: { deathknell: 12 } },
    brill: { name: 'Brill', zone: 'Tirisfal Glades', region: 'tirisfal', scene: 'brill', lvl: [5, 10], safe: true, inn: true,
      mobs: [], pool: 0, npcs: ['sevren', 'renee', 'dillinger', 'johaan', 'gerard'], vendor: 'renee', gearVendor: 'gerard',
      links: { deathknell: 30, agamand_mills: 14, garrens_haunt: 16, scarlet_watch_post: 18, undercity: 20 } },
    agamand_mills: { name: 'Agamand Mills', zone: 'Tirisfal Glades', region: 'tirisfal', scene: 'agamand_mills', lvl: [6, 8],
      mobs: [['darkhound', 5], ['greater_duskbat', 4], ['rattlecage_skeleton', 2]], pool: 10, npcs: [],
      links: { brill: 14 } },
    garrens_haunt: { name: "Garren's Haunt", zone: 'Tirisfal Glades', region: 'tirisfal', scene: 'garrens_haunt', lvl: [7, 11],
      mobs: [['rot_hide_gnoll', 5], ['rot_hide_mongrel', 4]], named: { maggot_eye: 180 }, pool: 9, npcs: [],
      links: { brill: 16 } },
    scarlet_watch_post: { name: 'Scarlet Watch Post', zone: 'Tirisfal Glades', region: 'tirisfal', scene: 'scarlet_watch_post', lvl: [8, 10],
      mobs: [['scarlet_convert', 5], ['scarlet_warrior', 5]], named: { captain_perrine: 150 }, pool: 10, npcs: [],
      links: { brill: 18 } },
    undercity: { name: 'Undercity', zone: 'Undercity', region: 'tirisfal', scene: 'undercity', lvl: [1, 60], safe: true, inn: true, city: true,
      mobs: [], pool: 0, npcs: ['norman', 'abigail'], vendor: 'norman', gearVendor: 'abigail',
      links: { brill: 20, orgrimmar: 60 }, via: { orgrimmar: 'Zeppelin' } },
    ironforge: { name: 'Ironforge', zone: 'Ironforge', region: 'dunmorogh', scene: 'ironforge', lvl: [1, 60], safe: true, inn: true, city: true,
      mobs: [], pool: 0, npcs: ['firebrew', 'overspark', 'bruuk'], vendor: 'firebrew', gearVendor: 'bruuk',
      links: { kharanos: 20, goldshire: 45 }, via: { goldshire: 'Deeprun Tram' } },
    northshire_abbey: { name: 'Northshire Abbey', zone: 'Northshire Valley', scene: 'northshire_abbey', lvl: [1, 2],
      mobs: [['young_wolf', 5], ['kobold_vermin', 5]], pool: 9, npcs: ['mcbride', 'willem', 'eagan', 'danil'], vendor: 'danil',
      links: { echo_ridge: 10, northshire_vineyards: 12, goldshire: 30 } },
    echo_ridge: { name: 'Echo Ridge Mine', zone: 'Northshire Valley', scene: 'echo_ridge', lvl: [3, 4],
      mobs: [['kobold_worker', 8], ['kobold_vermin', 2]], pool: 8, npcs: [],
      links: { northshire_abbey: 10, northshire_vineyards: 14 } },
    northshire_vineyards: { name: 'Northshire Vineyards', zone: 'Northshire Valley', scene: 'vineyards', lvl: [3, 5],
      mobs: [['defias_thug', 10]], named: { garrick_padfoot: 90 }, pool: 8, npcs: ['milly'], gather: { item: 'grape_crate', label: 'Crate of Grapes', quest: 'millys_harvest' },
      links: { northshire_abbey: 12, echo_ridge: 14 } },
    goldshire: { name: 'Goldshire', zone: 'Elwynn Forest', scene: 'goldshire', lvl: [5, 10], safe: true, inn: true,
      mobs: [], pool: 0, npcs: ['dughan', 'remy', 'pestle', 'farley', 'corina'], vendor: 'farley', gearVendor: 'corina',
      links: { northshire_abbey: 30, fargodeep: 16, crystal_lake: 18, brackwell: 20, forests_edge: 24, ironforge: 45, darnassus: 60 }, via: { ironforge: 'Deeprun Tram', darnassus: "Boat to Rut'theran" } },
    fargodeep: { name: 'Fargodeep Mine', zone: 'Elwynn Forest', scene: 'fargodeep', lvl: [5, 7],
      mobs: [['kobold_laborer', 6], ['kobold_tunneler', 4], ['mangy_wolf', 3]], pool: 9, npcs: [],
      links: { goldshire: 16, brackwell: 14 } },
    crystal_lake: { name: 'Crystal Lake', zone: 'Elwynn Forest', scene: 'crystal_lake', lvl: [7, 9],
      mobs: [['murloc_streamrunner', 5], ['murloc_forager', 3], ['young_forest_bear', 3], ['prowler', 3]], pool: 10, npcs: ['thomas'],
      links: { goldshire: 18, forests_edge: 16 } },
    brackwell: { name: 'Brackwell Pumpkin Patch', zone: 'Elwynn Forest', scene: 'brackwell', lvl: [8, 10],
      mobs: [['defias_bandit', 8], ['prowler', 2]], named: { princess: 120 }, pool: 9, npcs: ['ma_stonefield'],
      links: { goldshire: 20, fargodeep: 14 } },
    forests_edge: { name: "Forest's Edge", zone: 'Elwynn Forest', scene: 'forests_edge', lvl: [9, 11],
      mobs: [['riverpaw_gnoll', 10]], named: { hogger: 150 }, pool: 9, npcs: [],
      links: { goldshire: 24, crystal_lake: 16 } },
  };

  for (const k in D.PLACES) if (!D.PLACES[k].region) D.PLACES[k].region = 'elwynn';
  D.REGIONS = { elwynn: { name: 'Elwynn Forest', faction: 'alliance' }, dunmorogh: { name: 'Dun Morogh', faction: 'alliance' }, teldrassil: { name: 'Teldrassil', faction: 'alliance' }, durotar: { name: 'Durotar', faction: 'horde' }, mulgore: { name: 'Mulgore', faction: 'horde' }, tirisfal: { name: 'Tirisfal Glades', faction: 'horde' } };

  D.NPCS = {
    grull: { name: 'Grull Hawkwind', title: 'Hunter' }, hawkwind: { name: 'Chief Hawkwind', title: 'Camp Narache' }, raincaller: { name: 'Maur Raincaller', title: 'Shaman' },
    moodan: { name: 'Moodan Sungrain', title: 'Baker' }, baine: { name: 'Baine Bloodhoof', title: 'Son of Cairne' }, kauth: { name: 'Innkeeper Kauth', title: 'Innkeeper' },
    harken: { name: 'Harken Windtotem', title: 'Hunter' }, mahnott: { name: 'Mahnott Roughwound', title: 'Weaponsmith' }, morin: { name: 'Morin Cloudstalker', title: 'Brave' },
    pala: { name: 'Innkeeper Pala', title: 'Innkeeper' }, etu: { name: 'Etu Ragetotem', title: 'Weaponsmith' },
    sarvis: { name: 'Shadow Priest Sarvis', title: 'Deathknell' }, arren: { name: 'Executor Arren', title: 'Deathguard' }, saltain: { name: 'Deathguard Saltain', title: 'Deathguard' },
    kien: { name: 'Joshua Kien', title: 'Food & Drink' }, sevren: { name: 'Magistrate Sevren', title: 'Brill' }, renee: { name: 'Innkeeper Renee', title: 'Innkeeper' },
    dillinger: { name: 'Deathguard Dillinger', title: 'Deathguard' }, johaan: { name: 'Apothecary Johaan', title: 'Royal Apothecary' }, gerard: { name: 'Gerard Abernathy', title: 'Weaponsmith' },
    norman: { name: 'Innkeeper Norman', title: 'Innkeeper' }, abigail: { name: 'Abigail Sawyer', title: 'Weaponsmith' },
    gornek: { name: 'Gornek', title: 'Valley of Trials' }, kaltunk: { name: 'Kaltunk', title: 'Grunt' },
    galgar: { name: 'Galgar', title: 'Cook' }, zureetha: { name: 'Zureetha Fargaze', title: 'Warlock' }, duokna: { name: 'Duokna', title: 'Food & Drink' },
    garthok: { name: "Gar'Thok", title: 'Razor Hill' }, grosk: { name: 'Innkeeper Grosk', title: 'Innkeeper' },
    orgnil: { name: 'Orgnil Soulscar', title: 'Shaman' }, kaplak: { name: 'Kaplak', title: 'Weaponsmith' }, vikar: { name: 'Vikar', title: 'Scout' },
    vanira: { name: "Vanira", title: "Darkspear Witch Doctor" }, gryshka: { name: 'Innkeeper Gryshka', title: 'Innkeeper' },
    rahauro: { name: 'Rahauro', title: 'Weaponsmith' }, thrall_herald: { name: 'Herald of Thrall', title: 'Warchief\'s Voice' },
    ilthalaine: { name: 'Conservator Ilthalaine', title: 'Shadowglen' }, gilshalan: { name: 'Gilshalan Windwalker', title: 'Druid' },
    dirania: { name: 'Dirania Silvershine', title: 'Sentinel' }, nyoma: { name: 'Nyoma', title: 'Food & Drink' },
    tallonkai: { name: 'Tallonkai Swiftroot', title: 'Druid of the Claw' }, zenn: { name: 'Zenn Foulhoof', title: 'Satyr, supposedly harmless' },
    keldamyr: { name: 'Innkeeper Keldamyr', title: 'Innkeeper' }, kyra: { name: 'Sentinel Kyra Starsong', title: 'Sentinel' },
    ilyenia: { name: 'Ilyenia Moonfire', title: 'Weaponsmith' }, denalan: { name: 'Denalan', title: 'Botanist' },
    saelienne: { name: 'Innkeeper Saelienne', title: 'Innkeeper' }, mydrannul: { name: 'Mydrannul', title: 'Weaponsmith' },
    sten: { name: 'Sten Stoutarm', title: 'Coldridge Guard' }, balir: { name: 'Balir Frosthammer', title: 'Mountaineer' },
    talin: { name: 'Talin Keeneye', title: 'Hunter' }, adlin: { name: 'Adlin Pridedrift', title: 'Food & Drink' },
    ragnar: { name: 'Ragnar Thunderbrew', title: 'Brewmaster' }, belm: { name: 'Innkeeper Belm', title: 'Innkeeper' },
    stonegear: { name: 'Pilot Stonegear', title: 'Gnomish Pilot' }, senir: { name: 'Senir Whitebeard', title: 'Mountaineer' },
    grawn: { name: 'Grawn Thromwyn', title: 'Weaponsmith' }, rudra: { name: 'Rudra Amberstill', title: 'Rancher' },
    firebrew: { name: 'Innkeeper Firebrew', title: 'Innkeeper' }, overspark: { name: 'Tinkmaster Overspark', title: 'Master Tinker' },
    bruuk: { name: 'Bruuk Barleybeard', title: 'Weaponsmith' },
    mcbride: { name: 'Marshal McBride', title: 'Northshire Marshal' },
    willem: { name: 'Deputy Willem', title: 'Northshire Guard' },
    eagan: { name: 'Eagan Peltskinner', title: 'Hunter' },
    danil: { name: 'Brother Danil', title: 'Food & Drink' },
    milly: { name: 'Milly Osworth', title: 'Vineyard Hand' },
    dughan: { name: 'Marshal Dughan', title: 'Goldshire Marshal' },
    remy: { name: 'Remy "Two Times"', title: 'Trader' },
    pestle: { name: 'William Pestle', title: 'Herbalist' },
    farley: { name: 'Innkeeper Farley', title: 'Innkeeper' },
    corina: { name: 'Corina Steele', title: 'Weaponsmith' },
    thomas: { name: 'Guard Thomas', title: 'Stormwind Guard' },
    ma_stonefield: { name: 'Ma Stonefield', title: 'Farmer' },
  };

  // ---------------------------------------------------------------- quests
  // obj types: kill {mob, n} | collect {item, n} (from qdrops or gather) | visit {place}
  D.QUESTS = {
    hunt_begins: { name: 'The Hunt Begins', lvl: 2, giver: 'grull', turnin: 'grull', text: 'Every tauren hunter starts with the plainstriders. Bring me 8 of their beaks.',
      objs: [{ type: 'collect', item: 'plainstrider_beak', n: 8 }], reward: { choice: ['fam_chest'] } },
    battleboars: { name: 'The Battleboars', lvl: 3, giver: 'hawkwind', turnin: 'hawkwind', text: 'The battleboars grow fat and bold. Bring back 8 flanks for the camp.',
      objs: [{ type: 'collect', item: 'battleboar_flank', n: 8 }], reward: { choice: ['fam_legs'] } },
    rite_strength: { name: 'Rite of Strength', lvl: 4, giver: 'raincaller', turnin: 'raincaller', text: 'The Bristleback quilboar raid our lands from the ravine. Defeat 12 of them.',
      objs: [{ type: 'kill', mob: 'bristleback_quilboar', n: 12 }], reward: { choice: ['fam_feet'] } },
    break_sharptusk: { name: 'Break Sharptusk!', lvl: 6, giver: 'hawkwind', turnin: 'hawkwind', pre: ['rite_strength'], text: 'Their chief, Sharptusk Thornmantle, must fall.',
      objs: [{ type: 'kill', mob: 'chief_sharptusk', n: 1 }], reward: { choice: ['fam_weapon5'] } },
    report_bloodhoof: { name: 'Journey to Bloodhoof', lvl: 5, giver: 'hawkwind', turnin: 'baine', pre: ['battleboars'], text: 'Go down the mountain to Bloodhoof Village and speak with Baine Bloodhoof.',
      objs: [{ type: 'visit', place: 'bloodhoof_village' }], reward: {} },
    swoop_hunting: { name: 'Swoop Hunting', lvl: 7, giver: 'harken', turnin: 'harken', text: 'The swoops of the plains make fine trophies. Bring me 8 quills.',
      objs: [{ type: 'collect', item: 'swoop_quill', n: 8 }], reward: { choice: ['fam_hands'] } },
    poachers: { name: 'Poison Water', lvl: 8, giver: 'baine', turnin: 'baine', pre: ['report_bloodhoof'], text: 'Palemane gnolls poach our herds at Palemane Rock. Drive them off: 8 poachers.',
      objs: [{ type: 'kill', mob: 'palemane_poacher', n: 8 }], reward: { choice: ['fam_wrist'] } },
    venture_co: { name: 'Dangers of the Venture Co.', lvl: 8, giver: 'morin', turnin: 'morin', text: 'Goblins are stripping our land at their mine. Kill 8 workers and 4 supervisors.',
      objs: [{ type: 'kill', mob: 'venture_worker', n: 8 }, { type: 'kill', mob: 'venture_supervisor', n: 4 }], reward: { choice: ['fam_back'] } },
    mazzranache_q: { name: 'Mazzranache', lvl: 9, giver: 'morin', turnin: 'morin', text: 'A great cat called Mazzranache hunts the Golden Plains. End its hunt.',
      objs: [{ type: 'kill', mob: 'mazzranache', n: 1 }], reward: { choice: ['fam_chest9'] } },
    snagglespear_q: { name: 'Snagglespear', lvl: 9, giver: 'baine', turnin: 'baine', text: 'A quilboar brute named Snagglespear leads raids on the plains. Stop him.',
      objs: [{ type: 'kill', mob: 'snagglespear', n: 1 }], reward: { choice: ['fam_waist'] } },
    arrachea_q: { name: "Arra'chea", lvl: 11, giver: 'baine', turnin: 'baine', group: 3, text: "The great kodo Arra'chea tramples the plains. Bring me its horn. Take braves with you.",
      objs: [{ type: 'collect', item: 'arrachea_horn', n: 1 }], reward: { choice: ['militia'] } },
    mindless_ones: { name: 'The Mindless Ones', lvl: 2, giver: 'sarvis', turnin: 'sarvis', text: 'Not all who rise keep their minds. Put down 8 Mindless and 6 Wretched Zombies.',
      objs: [{ type: 'kill', mob: 'mindless_zombie', n: 8 }, { type: 'kill', mob: 'wretched_zombie', n: 6 }], reward: { choice: ['fam_chest'] } },
    rattling_cages: { name: 'Rattling the Rattlecages', lvl: 3, giver: 'arren', turnin: 'arren', text: 'Skeletons roam the graveyard. Shatter 10 Rattlecage Skeletons.',
      objs: [{ type: 'kill', mob: 'rattlecage_skeleton', n: 10 }], reward: { choice: ['fam_legs'] } },
    bat_wings: { name: 'Night Web and Wing', lvl: 3, giver: 'saltain', turnin: 'saltain', text: 'The apothecaries want duskbat wings. Bring me 8.',
      objs: [{ type: 'collect', item: 'bat_wing', n: 8 }], reward: { choice: ['fam_feet'] } },
    night_web: { name: "Night Web's Hollow", lvl: 4, giver: 'arren', turnin: 'arren', pre: ['rattling_cages'], text: 'Spiders infest the old mine. Kill 8 young and 6 grown Night Web spiders.',
      objs: [{ type: 'kill', mob: 'young_night_web_spider', n: 8 }, { type: 'kill', mob: 'night_web_spider', n: 6 }], reward: { choice: ['fam_hands'] } },
    samuel_fipps_q: { name: 'Samuel Fipps', lvl: 5, giver: 'sarvis', turnin: 'sarvis', pre: ['mindless_ones'], text: 'Samuel Fipps rose without his mind and stalks the graveyard. Lay him to rest.',
      objs: [{ type: 'kill', mob: 'samuel_fipps', n: 1 }], reward: { choice: ['fam_weapon5'] } },
    report_brill: { name: 'The Road to Brill', lvl: 5, giver: 'sarvis', turnin: 'sevren', pre: ['mindless_ones'], text: 'Take the road east to Brill and report to Magistrate Sevren.',
      objs: [{ type: 'visit', place: 'brill' }], reward: {} },
    agamand_q: { name: 'The Agamand Family', lvl: 7, giver: 'sevren', turnin: 'sevren', pre: ['report_brill'], text: 'Agamand Mills is overrun with darkhounds. Kill 10.',
      objs: [{ type: 'kill', mob: 'darkhound', n: 10 }], reward: { choice: ['fam_wrist'] } },
    rot_hide_q: { name: 'Rot Hide Ichor', lvl: 8, giver: 'johaan', turnin: 'johaan', text: "The gnolls at Garren's Haunt carry a plague I must study. Bring me 8 samples of ichor.",
      objs: [{ type: 'collect', item: 'rot_hide_ichor', n: 8 }], reward: { choice: ['fam_back'] } },
    scarlet_q: { name: 'The Scarlet Crusade', lvl: 9, giver: 'dillinger', turnin: 'dillinger', text: 'The Scarlet Crusade has built a watch post in our lands. Bring me 8 of their armbands.',
      objs: [{ type: 'collect', item: 'scarlet_armband', n: 8 }], reward: { choice: ['fam_chest9'] } },
    perrine_q: { name: 'Captain Perrine', lvl: 10, giver: 'dillinger', turnin: 'dillinger', pre: ['scarlet_q'], text: 'Their captain, Perrine, leads the watch. Remove him.',
      objs: [{ type: 'kill', mob: 'captain_perrine', n: 1 }], reward: { choice: ['fam_waist'] } },
    maggot_eye_q: { name: 'Maggot Eye', lvl: 11, giver: 'sevren', turnin: 'sevren', group: 3, text: "The gnoll chieftain Maggot Eye rules Garren's Haunt. Bring me his paw. Go with others.",
      objs: [{ type: 'collect', item: 'maggot_eye_paw', n: 1 }], reward: { choice: ['militia'] } },
    cutting_teeth: { name: 'Cutting Teeth', lvl: 2, giver: 'gornek', turnin: 'gornek',
      text: 'Every orc proves their strength in the Valley of Trials. Start with the boars: slay 10 Mottled Boars.',
      objs: [{ type: 'kill', mob: 'mottled_boar', n: 10 }], reward: { choice: ['fam_chest'] } },
    sting_scorpid: { name: 'Sting of the Scorpid', lvl: 3, giver: 'kaltunk', turnin: 'kaltunk',
      text: 'The scorpids nest along the valley walls. Bring me 8 of their tails.',
      objs: [{ type: 'collect', item: 'scorpid_stinger', n: 8 }], reward: { choice: ['fam_legs'] } },
    cactus_apples: { name: 'Galgar\'s Cactus Apple Surprise', lvl: 3, giver: 'galgar', turnin: 'galgar',
      text: 'Pick me 10 cactus apples from around the valley and I will make you something special.',
      objs: [{ type: 'collect', item: 'cactus_apple', n: 10 }], reward: {} },
    vile_familiars: { name: 'Vile Familiars', lvl: 3, giver: 'zureetha', turnin: 'zureetha',
      text: 'Burning Blade warlocks summon vile familiars in the caves. Destroy 12 of them.',
      objs: [{ type: 'kill', mob: 'vile_familiar', n: 12 }], reward: { choice: ['fam_feet'] } },
    burning_medallion_q: { name: 'Burning Blade Medallion', lvl: 5, giver: 'zureetha', turnin: 'zureetha', pre: ['vile_familiars'],
      text: 'Their leader, Yarrog Baneshadow, hides in the coven. Bring me his medallion.',
      objs: [{ type: 'collect', item: 'burning_medallion', n: 1 }], reward: { choice: ['fam_weapon5'] } },
    report_razor_hill: { name: 'Report to Razor Hill', lvl: 5, giver: 'gornek', turnin: 'garthok', pre: ['cutting_teeth'],
      text: 'You have proven yourself. Go east to Razor Hill and report to Gar\'Thok.',
      objs: [{ type: 'visit', place: 'razor_hill' }], reward: {} },
    thunder_lizard_q: { name: 'Lizard Horns', lvl: 7, giver: 'orgnil', turnin: 'orgnil',
      text: 'The thunder lizards of Thunder Ridge carry storm-charged horns. Bring me 8.',
      objs: [{ type: 'collect', item: 'lizard_horn', n: 8 }], reward: { choice: ['fam_hands'] } },
    kultiras_q: { name: 'Dark Storms', lvl: 9, giver: 'garthok', turnin: 'garthok', pre: ['report_razor_hill'],
      text: 'Humans from Kul Tiras have dug in at Tiragarde Keep. Bring me 8 of their insignias.',
      objs: [{ type: 'collect', item: 'kultiras_insignia', n: 8 }], reward: { choice: ['fam_wrist'] } },
    benedict_q: { name: 'Lieutenant Benedict', lvl: 10, giver: 'garthok', turnin: 'garthok', pre: ['kultiras_q'],
      text: 'Their commander, Lieutenant Benedict, must fall.',
      objs: [{ type: 'kill', mob: 'lieutenant_benedict', n: 1 }], reward: { choice: ['fam_back'] } },
    voodoo_q: { name: 'Hexed Charms', lvl: 9, giver: 'vanira', turnin: 'vanira',
      text: 'Zalazane has hexed my people on the Echo Isles. Bring me 8 of their voodoo charms so I can break the curse.',
      objs: [{ type: 'collect', item: 'voodoo_charm', n: 8 }], reward: { choice: ['fam_chest9'] } },
    zalazane_q: { name: 'Zalazane', lvl: 11, giver: 'vanira', turnin: 'vanira', group: 3,
      text: 'Zalazane himself must die. Bring me his head. He is too strong to face alone.',
      objs: [{ type: 'collect', item: 'zalazane_head', n: 1 }], reward: { choice: ['militia'] } },
    hidden_enemies: { name: 'Hidden Enemies', lvl: 12, giver: 'thrall_herald', turnin: 'thrall_herald', dungeon: 'ragefire',
      text: 'Cultists of the Searing Blade hide in Ragefire Chasm beneath Orgrimmar. Slay Taragaman the Hungerer and bring his heart.',
      objs: [{ type: 'collect', item: 'taragaman_heart', n: 1 }], reward: { choice: ['fam_back_rare'] } },
    enter_orgrimmar: { name: 'Welcome to Orgrimmar', lvl: 8, giver: 'garthok', turnin: 'gryshka', pre: ['report_razor_hill'],
      text: 'Go north to Orgrimmar, the capital of the Horde, and see the Warchief\'s city.',
      objs: [{ type: 'visit', place: 'orgrimmar' }], reward: {} },
    balance_nature: { name: 'The Balance of Nature', lvl: 2, giver: 'ilthalaine', turnin: 'ilthalaine',
      text: 'Too many young nightsabers and thistle boars roam the glade. Restore the balance: 7 nightsabers and 4 boars.',
      objs: [{ type: 'kill', mob: 'young_nightsaber', n: 7 }, { type: 'kill', mob: 'young_thistle_boar', n: 4 }], reward: { choice: ['fam_chest'] } },
    balance_nature_2: { name: 'The Balance of Nature', lvl: 3, giver: 'ilthalaine', turnin: 'ilthalaine', pre: ['balance_nature'],
      text: 'The older beasts must be thinned too. 7 Mangy Nightsabers and 7 Thistle Boars.',
      objs: [{ type: 'kill', mob: 'mangy_nightsaber', n: 7 }, { type: 'kill', mob: 'thistle_boar', n: 7 }], reward: { choice: ['fam_legs'] } },
    fel_moss_q: { name: 'Fel Moss', lvl: 3, giver: 'gilshalan', turnin: 'gilshalan',
      text: 'The grell carry fel moss, a sign of corruption. Bring me 8 clumps so I can study it.',
      objs: [{ type: 'collect', item: 'fel_moss', n: 8 }], reward: { choice: ['fam_feet'] } },
    webwood_venom: { name: 'Webwood Venom', lvl: 4, giver: 'dirania', turnin: 'dirania',
      text: 'The spiders of Shadowthread Cave have grown vicious. Bring me 10 Webwood Venom Sacs.',
      objs: [{ type: 'collect', item: 'venom_sac', n: 10 }], reward: { choice: ['fam_hands'] } },
    githyiss_q: { name: 'Githyiss the Vile', lvl: 5, giver: 'dirania', turnin: 'dirania', pre: ['webwood_venom'],
      text: 'Their queen, Githyiss the Vile, nests at the back of the cave. End her.',
      objs: [{ type: 'kill', mob: 'githyiss', n: 1 }], reward: { choice: ['fam_weapon5'] } },
    road_dolanaar: { name: 'The Road to Dolanaar', lvl: 5, giver: 'ilthalaine', turnin: 'tallonkai', pre: ['balance_nature_2'],
      text: 'You have done well. Go down the road to Dolanaar and speak with Tallonkai Swiftroot.',
      objs: [{ type: 'visit', place: 'dolanaar' }], reward: {} },
    zenns_bidding: { name: "Zenn's Bidding", lvl: 6, giver: 'zenn', turnin: 'zenn',
      text: 'Heh. Bring old Zenn 3 Nightsaber Pelts and 3 Strigid Owl Feathers, and ask no questions.',
      objs: [{ type: 'collect', item: 'nightsaber_pelt', n: 3 }, { type: 'collect', item: 'owl_feather', n: 3 }], reward: { money: 120 } },
    timberling_seeds: { name: 'Timberling Seeds', lvl: 7, giver: 'denalan', turnin: 'denalan',
      text: 'The timberlings by the lake have gone strange. Bring me 8 of their seeds.',
      objs: [{ type: 'collect', item: 'timberling_seed', n: 8 }], reward: { choice: ['fam_wrist'] } },
    gnarlpine_corruption: { name: 'Gnarlpine Corruption', lvl: 8, giver: 'tallonkai', turnin: 'tallonkai', pre: ['road_dolanaar'],
      text: "The Gnarlpine furbolgs have turned on us. Drive them back at Ban'ethil: 6 warriors and 6 shamans.",
      objs: [{ type: 'kill', mob: 'gnarlpine_warrior', n: 6 }, { type: 'kill', mob: 'gnarlpine_shaman', n: 6 }], reward: { choice: ['fam_back'] } },
    oakenscowl_q: { name: 'The Elder Furbolg', lvl: 10, giver: 'tallonkai', turnin: 'tallonkai', pre: ['gnarlpine_corruption'],
      text: 'Their elder, Oakenscowl, leads the corruption from deep in the barrow. Defeat him.',
      objs: [{ type: 'kill', mob: 'oakenscowl', n: 1 }], reward: { choice: ['fam_chest9'] } },
    melenas_q: { name: "Melenas' Head", lvl: 10, giver: 'kyra', turnin: 'kyra',
      text: 'A satyr named Lord Melenas hides in Fel Rock, poisoning the land. Bring me his head.',
      objs: [{ type: 'collect', item: 'melenas_head', n: 1 }], reward: { choice: ['fam_waist'] } },
    crown_earth: { name: 'Crown of the Earth', lvl: 8, giver: 'tallonkai', turnin: 'saelienne', pre: ['road_dolanaar'],
      text: 'Travel west to Darnassus, city of the Kaldorei, and see the heart of Teldrassil.',
      objs: [{ type: 'visit', place: 'darnassus' }], reward: {} },
    dwarven_outfitters: { name: 'Dwarven Outfitters', lvl: 2, giver: 'talin', turnin: 'talin',
      text: 'The young wolves are fat on our supplies. Bring me 8 Tough Wolf Meat and I can make you some proper gear.',
      objs: [{ type: 'collect', item: 'wolf_meat', n: 8 }], reward: { choice: ['fam_chest'] } },
    a_new_threat: { name: 'A New Threat', lvl: 2, giver: 'balir', turnin: 'balir',
      text: 'Rockjaw troggs are crawling up out of the earth all over the valley. Kill 10 of them before they reach Anvilmar.',
      objs: [{ type: 'kill', mob: 'rockjaw_trogg', n: 10 }], reward: { choice: ['fam_legs'] } },
    the_troll_cave: { name: 'The Troll Cave', lvl: 4, giver: 'sten', turnin: 'sten', pre: ['a_new_threat'],
      text: 'Frostmane trolls have holed up in the cave to the west. Thin out 12 of their whelps.',
      objs: [{ type: 'kill', mob: 'frostmane_troll_whelp', n: 12 }], reward: { choice: ['fam_feet'] } },
    stolen_journal: { name: 'The Stolen Journal', lvl: 5, giver: 'sten', turnin: 'sten', pre: ['the_troll_cave'],
      text: "Their chief, Grik'nir the Cold, stole Felix's journal. Get it back from the back of the cave.",
      objs: [{ type: 'collect', item: 'felix_journal', n: 1 }], reward: { choice: ['fam_weapon5'] } },
    report_kharanos: { name: "Senir's Observations", lvl: 5, giver: 'sten', turnin: 'senir', pre: ['the_troll_cave'],
      text: 'Take word of the trolls east through the pass to Senir Whitebeard in Kharanos.',
      objs: [{ type: 'visit', place: 'kharanos' }], reward: {} },
    beer_basted_ribs: { name: 'Beer Basted Boar Ribs', lvl: 6, giver: 'ragnar', turnin: 'ragnar',
      text: 'Nothing goes with Thunderbrew like crag boar ribs. Bring me 6 and I will pour you a round.',
      objs: [{ type: 'collect', item: 'crag_boar_rib', n: 6 }], reward: { choice: ['fam_hands'] } },
    grizzled_den_q: { name: 'The Grizzled Den', lvl: 7, giver: 'stonegear', turnin: 'stonegear',
      text: 'Wendigo manes make the best engine insulation. Get me 8 from the Grizzled Den.',
      objs: [{ type: 'collect', item: 'wendigo_mane', n: 8 }], reward: { choice: ['fam_wrist'] } },
    frostmane_hold_q: { name: 'Frostmane Hold', lvl: 8, giver: 'senir', turnin: 'senir', pre: ['report_kharanos'],
      text: 'Scout Frostmane Hold to the west and take down 5 of their headhunters.',
      objs: [{ type: 'visit', place: 'frostmane_hold' }, { type: 'kill', mob: 'frostmane_headhunter', n: 5 }], reward: { choice: ['fam_back'] } },
    recombobulation: { name: 'Operation Recombobulation', lvl: 8, giver: 'overspark', turnin: 'overspark',
      text: 'The poor leper gnomes carry parts we need to take Gnomeregan back. Recover 8 Restabilization Cogs.',
      objs: [{ type: 'collect', item: 'restab_cog', n: 8 }], reward: { choice: ['fam_waist'] } },
    mountaineers_hunt: { name: 'Hunting the Ranch', lvl: 9, giver: 'rudra', turnin: 'rudra',
      text: 'Bears and leopards are taking my rams. Kill 6 Ice Claw Bears and 6 Snow Leopards.',
      objs: [{ type: 'kill', mob: 'ice_claw_bear', n: 6 }, { type: 'kill', mob: 'snow_leopard', n: 6 }], reward: { choice: ['fam_chest9'] } },
    protecting_herd: { name: 'Protecting the Herd', lvl: 11, giver: 'rudra', turnin: 'rudra', group: 3,
      text: 'A huge mountain lion called Vagash has killed half my herd. Bring me his fang. Bring friends.',
      objs: [{ type: 'collect', item: 'vagash_fang', n: 1 }], reward: { choice: ['militia'] } },
    wolves_border: { name: 'Wolves Across the Border', lvl: 2, giver: 'eagan', turnin: 'eagan',
      text: 'Wolves from the woods keep raiding our stores. Bring me 8 Tough Wolf Meat and I\'ll make it worth your while.',
      objs: [{ type: 'collect', item: 'wolf_meat', n: 8 }], reward: { choice: ['fam_chest'] } },
    kobold_cleanup: { name: 'Kobold Camp Cleanup', lvl: 2, giver: 'mcbride', turnin: 'mcbride',
      text: 'Kobolds have been spotted around the abbey. Kill 10 Kobold Vermin.',
      objs: [{ type: 'kill', mob: 'kobold_vermin', n: 10 }], reward: { choice: ['fam_legs'] } },
    investigate_echo: { name: 'Investigate Echo Ridge', lvl: 3, giver: 'mcbride', turnin: 'mcbride', pre: ['kobold_cleanup'],
      text: 'More kobolds are digging at Echo Ridge Mine. Thin out 10 Kobold Workers.',
      objs: [{ type: 'kill', mob: 'kobold_worker', n: 10 }], reward: { choice: ['fam_feet'] } },
    brotherhood_thieves: { name: 'Brotherhood of Thieves', lvl: 4, giver: 'willem', turnin: 'willem',
      text: 'The Defias Brotherhood has moved into the vineyards. Bring me 12 of their Red Burlap Bandanas.',
      objs: [{ type: 'collect', item: 'red_bandana', n: 12 }], reward: { choice: ['fam_hands'] } },
    millys_harvest: { name: "Milly's Harvest", lvl: 4, giver: 'milly', turnin: 'milly',
      text: 'The thugs chased us off before we finished the harvest. Could you bring back 8 Crates of Grapes?',
      objs: [{ type: 'collect', item: 'grape_crate', n: 8 }], reward: {} },
    bounty_garrick: { name: 'Bounty on Garrick Padfoot', lvl: 5, giver: 'willem', turnin: 'willem', pre: ['brotherhood_thieves'],
      text: 'Their leader Garrick Padfoot hides in the vineyards. Bring me his head.',
      objs: [{ type: 'collect', item: 'garrick_head', n: 1 }], reward: { choice: ['fam_weapon5'] } },
    report_goldshire: { name: 'Report to Goldshire', lvl: 5, giver: 'mcbride', turnin: 'dughan', pre: ['investigate_echo'],
      text: 'You\'ve done well. Head south to Goldshire and report to Marshal Dughan.',
      objs: [{ type: 'visit', place: 'goldshire' }], reward: {} },
    fargodeep_mine: { name: 'The Fargodeep Mine', lvl: 6, giver: 'dughan', turnin: 'dughan',
      text: 'Scout Fargodeep Mine to the south and see what the kobolds are up to.',
      objs: [{ type: 'visit', place: 'fargodeep' }], reward: {} },
    kobold_candles: { name: 'Kobold Candles', lvl: 6, giver: 'pestle', turnin: 'pestle',
      text: 'The kobolds in Fargodeep carry fine candles. I need 8 Large Candles for my work.',
      objs: [{ type: 'collect', item: 'large_candle', n: 8 }], reward: { choice: ['fam_wrist'] } },
    gold_dust: { name: 'Gold Dust Exchange', lvl: 6, giver: 'remy', turnin: 'remy',
      text: 'Kobolds hoard gold dust from the mines. Get me 10 and I\'ll pay you twice. Heh. Two times.',
      objs: [{ type: 'collect', item: 'gold_dust', n: 10 }], reward: { money: 150 } },
    protect_frontier: { name: 'Protect the Frontier', lvl: 8, giver: 'thomas', turnin: 'thomas',
      text: 'Wildlife near Crystal Lake has turned vicious. Kill 8 Prowlers and 5 Young Forest Bears.',
      objs: [{ type: 'kill', mob: 'prowler', n: 8 }, { type: 'kill', mob: 'young_forest_bear', n: 5 }], reward: { choice: ['fam_back'] } },
    bounty_murlocs: { name: 'Bounty on Murlocs', lvl: 8, giver: 'thomas', turnin: 'thomas',
      text: 'Murlocs are raiding the lake shore. Bring me 8 Torn Murloc Fins.',
      objs: [{ type: 'collect', item: 'murloc_fin', n: 8 }], reward: { choice: ['fam_waist'] } },
    red_linen: { name: 'Red Linen Goods', lvl: 9, giver: 'ma_stonefield', turnin: 'ma_stonefield',
      text: 'Those Defias bandits stole my linen. Get back 6 Red Linen Bandanas from them.',
      objs: [{ type: 'collect', item: 'red_linen', n: 6 }], reward: { choice: ['fam_chest9'] } },
    princess_must_die: { name: 'Princess Must Die!', lvl: 9, giver: 'ma_stonefield', turnin: 'ma_stonefield',
      text: 'That fat sow Princess ate my prize pumpkins. Bring me her brass collar.',
      objs: [{ type: 'collect', item: 'brass_collar', n: 1 }], reward: { choice: ['fam_legs9'] } },
    gnoll_bounty: { name: 'Riverpaw Gnoll Bounty', lvl: 10, giver: 'dughan', turnin: 'dughan',
      text: 'Riverpaw gnolls are crossing into Elwynn at Forest\'s Edge. Bring me 8 Painted Gnoll Armbands.',
      objs: [{ type: 'collect', item: 'gnoll_armband', n: 8 }], reward: { choice: ['fam_hands9'] } },
    wanted_hogger: { name: 'Wanted: Hogger', lvl: 11, giver: 'dughan', turnin: 'dughan', group: 3,
      text: 'A huge gnoll called Hogger leads the Riverpaw. Bring me his claw. Take friends — he is no ordinary gnoll.',
      objs: [{ type: 'collect', item: 'gnoll_claw', n: 1 }], reward: { choice: ['militia'] } },
    defias_brotherhood: { name: 'The Defias Brotherhood', lvl: 12, giver: 'dughan', turnin: 'dughan', dungeon: 'deadmines',
      text: 'Edwin VanCleef leads the Defias from a hidden cove under Moonbrook. End him, and bring back proof.',
      objs: [{ type: 'collect', item: 'vancleef_head', n: 1 }], reward: { choice: ['fam_back_rare'] } },
  };
  // Reward "families" become a class-appropriate item at turn-in time (engine.makeReward).

  // ---------------------------------------------------------------- v1.9.1: levels 5-10 fill
  // Every second hub gets five more quests in the 5-9 band, on mobs already in its zone.
  item('kobold_pick', { name: 'Kobold Mining Pick', slot: 'quest', q: 1, icon: 'axe' });
  item('crystal_clam', { name: 'Crystal Lake Clam', slot: 'quest', q: 1, icon: 'meat' });
  item('prowler_claw', { name: 'Prowler Claw', slot: 'quest', q: 1, icon: 'claw' });
  item('frostmane_tusk', { name: 'Frostmane Tusk', slot: 'quest', q: 1, icon: 'tusk' });
  item('ice_bear_pelt', { name: 'Ice Claw Pelt', slot: 'quest', q: 1, icon: 'pelt' });
  item('gnarlpine_totem', { name: 'Gnarlpine Totem', slot: 'quest', q: 1, icon: 'voodoo_doll' });
  item('grell_fang', { name: 'Grell Fang', slot: 'quest', q: 1, icon: 'claw' });
  item('dire_boar_meat', { name: 'Dire Boar Meat', slot: 'quest', q: 1, icon: 'meat' });
  item('reaver_stinger', { name: 'Reaver Stinger', slot: 'quest', q: 1, icon: 'scorpid_stinger' });
  item('kultiras_rum', { name: 'Kul Tiras Rum', slot: 'quest', q: 1, icon: 'keg' });
  item('strider_meat', { name: 'Stringy Strider Meat', slot: 'quest', q: 1, icon: 'meat' });
  item('stalker_hide', { name: 'Prairie Stalker Hide', slot: 'quest', q: 1, icon: 'pelt' });
  item('venture_tools', { name: 'Venture Co. Tools', slot: 'quest', q: 1, icon: 'axe' });
  item('darkhound_blood', { name: 'Darkhound Blood', slot: 'quest', q: 1, icon: 'venom' });
  item('duskbat_pelt', { name: 'Duskbat Pelt', slot: 'quest', q: 1, icon: 'pelt' });
  [['kobold_tunneler', 'kobold_pick', 0.55], ['murloc_streamrunner', 'crystal_clam', 0.5], ['murloc_forager', 'crystal_clam', 0.5], ['prowler', 'prowler_claw', 0.55],
    ['frostmane_troll', 'frostmane_tusk', 0.55], ['ice_claw_bear', 'ice_bear_pelt', 0.55], ['gnarlpine_ursa', 'gnarlpine_totem', 0.55], ['vicious_grell', 'grell_fang', 0.55],
    ['dire_mottled_boar', 'dire_boar_meat', 0.6], ['scorpid_reaver', 'reaver_stinger', 0.55], ['kul_tiras_sailor', 'kultiras_rum', 0.5], ['kul_tiras_marine', 'kultiras_rum', 0.5],
    ['adult_plainstrider', 'strider_meat', 0.6], ['prairie_stalker', 'stalker_hide', 0.55], ['venture_worker', 'venture_tools', 0.55], ['venture_supervisor', 'venture_tools', 0.55],
    ['darkhound', 'darkhound_blood', 0.55], ['greater_duskbat', 'duskbat_pelt', 0.55],
  ].forEach(([m, it, pr]) => { const M = D.MOBS[m]; (M.qdrops || (M.qdrops = [])).push([it, pr]); });
  Object.assign(D.QUESTS, {
    // Elwynn: Goldshire
    inn_wolves: { name: 'Wolves at the Door', lvl: 5, giver: 'farley', turnin: 'farley', text: 'Mangy wolves from the Fargodeep hills keep coming for my chickens. Thin them out: 8 will do.',
      objs: [{ type: 'kill', mob: 'mangy_wolf', n: 8 }], reward: { money: 90 } },
    kobold_picks: { name: 'Kobold Picks', lvl: 6, giver: 'corina', turnin: 'corina', text: 'Kobold picks are poor tools but good iron. Bring me 6 from the tunnelers in Fargodeep and I will forge you something.',
      objs: [{ type: 'collect', item: 'kobold_pick', n: 6 }], reward: { choice: ['fam_weapon5'] } },
    lake_clams: { name: 'Crystal Lake Clams', lvl: 7, giver: 'farley', turnin: 'farley', text: 'Clam chowder sells well, but the murlocs have taken the lake. They hoard clams. Bring me 6.',
      objs: [{ type: 'collect', item: 'crystal_clam', n: 6 }], reward: { money: 140 } },
    prowler_claws: { name: 'Prowler Claws', lvl: 7, giver: 'pestle', turnin: 'pestle', text: 'Ground prowler claw is the base of a strong tonic. The prowlers near Crystal Lake will do. I need 6.',
      objs: [{ type: 'collect', item: 'prowler_claw', n: 6 }], reward: { choice: ['fam_wrist'] } },
    brackwell_bandits: { name: 'Bandits at Brackwell', lvl: 8, giver: 'dughan', turnin: 'dughan', pre: ['fargodeep_mine'], text: 'Defias bandits have set up at the Brackwell Pumpkin Patch. Drive them out: 8 bandits.',
      objs: [{ type: 'kill', mob: 'defias_bandit', n: 8 }], reward: { choice: ['fam_waist'] } },
    // Dun Morogh: Kharanos
    wendigo_cull: { name: 'The Wendigo Problem', lvl: 5, giver: 'belm', turnin: 'belm', text: 'Young wendigos come down from the Grizzled Den and scare off my regulars. Put down 8 of them.',
      objs: [{ type: 'kill', mob: 'young_wendigo', n: 8 }], reward: { money: 90 } },
    frostmane_tusks: { name: 'Frostmane Tusks', lvl: 6, giver: 'grawn', turnin: 'grawn', text: 'Troll tusk makes a fine grip for an axe. Bring me 6 from the Frostmane trolls and I will make you a weapon.',
      objs: [{ type: 'collect', item: 'frostmane_tusk', n: 6 }], reward: { choice: ['fam_weapon5'] } },
    troll_scouting: { name: 'Troll Trouble', lvl: 6, giver: 'senir', turnin: 'senir', pre: ['report_kharanos'], text: 'The Frostmane push closer to Kharanos every day. Show them we bite back. Kill 8 Frostmane Trolls.',
      objs: [{ type: 'kill', mob: 'frostmane_troll', n: 8 }], reward: { choice: ['fam_hands'] } },
    boar_hunt: { name: 'Boar Season', lvl: 6, giver: 'ragnar', turnin: 'ragnar', text: 'The crag boars are trampling my barley. Hunt 8 of them. The ribs are yours to keep.',
      objs: [{ type: 'kill', mob: 'crag_boar', n: 8 }], reward: { money: 110 } },
    ice_claw_pelts: { name: 'Ice Claw Pelts', lvl: 8, giver: 'stonegear', turnin: 'stonegear', text: 'Ice Claw pelts keep the cold out of the engine house. The bears roam near Amberstill Ranch. Bring me 6.',
      objs: [{ type: 'collect', item: 'ice_bear_pelt', n: 6 }], reward: { choice: ['fam_waist'] } },
    // Teldrassil: Dolanaar
    nightsaber_hunt: { name: 'The Nightsaber Hunt', lvl: 5, giver: 'keldamyr', turnin: 'keldamyr', text: 'The nightsabers by the lake have grown bold and stalk our travellers. Hunt 8 of them.',
      objs: [{ type: 'kill', mob: 'nightsaber', n: 8 }], reward: { money: 90 } },
    gnarlpine_totems: { name: 'Gnarlpine Totems', lvl: 6, giver: 'ilyenia', turnin: 'ilyenia', text: 'The Gnarlpine carve totems that reek of corruption. Take 6 from the ursa at the Barrow Den and I will arm you.',
      objs: [{ type: 'collect', item: 'gnarlpine_totem', n: 6 }], reward: { choice: ['fam_weapon5'] } },
    ursa_threat: { name: 'The Ursa Threat', lvl: 6, giver: 'kyra', turnin: 'kyra', pre: ['road_dolanaar'], text: 'Gnarlpine ursa guard the Barrow Den and attack anyone who comes near. Kill 8.',
      objs: [{ type: 'kill', mob: 'gnarlpine_ursa', n: 8 }], reward: { choice: ['fam_hands'] } },
    fel_sprites: { name: 'Shadows at Fel Rock', lvl: 7, giver: 'kyra', turnin: 'kyra', text: 'Shadow sprites pour out of Fel Rock at night. Cut 8 of them down before they reach Dolanaar.',
      objs: [{ type: 'kill', mob: 'shadow_sprite', n: 8 }], reward: { choice: ['fam_wrist'] } },
    grell_fangs: { name: 'Grell Fangs', lvl: 8, giver: 'keldamyr', turnin: 'keldamyr', text: 'Proof that Fel Rock is being cleared would calm the village. Bring me 6 fangs from the vicious grell.',
      objs: [{ type: 'collect', item: 'grell_fang', n: 6 }], reward: { choice: ['fam_waist'] } },
    // Durotar: Razor Hill
    dire_boar_meat_q: { name: 'Meat for the Barracks', lvl: 5, giver: 'grosk', turnin: 'grosk', text: 'The grunts eat more than they fight. Bring me 6 cuts of dire boar meat from Thunder Ridge.',
      objs: [{ type: 'collect', item: 'dire_boar_meat', n: 6 }], reward: { money: 90 } },
    reaver_stingers: { name: 'Reaver Stingers', lvl: 6, giver: 'kaplak', turnin: 'kaplak', text: 'A reaver stinger makes a nasty barb. Bring me 6 and I will fit you with a proper weapon.',
      objs: [{ type: 'collect', item: 'reaver_stinger', n: 6 }], reward: { choice: ['fam_weapon5'] } },
    lizard_cull: { name: 'Thunder on the Ridge', lvl: 6, giver: 'garthok', turnin: 'garthok', pre: ['report_razor_hill'], text: 'The thunder lizards are breeding out of control on the ridge. Kill 10 before they reach the road.',
      objs: [{ type: 'kill', mob: 'thunder_lizard', n: 10 }], reward: { choice: ['fam_hands'] } },
    tiger_hunt: { name: 'Tiger Hunt', lvl: 7, giver: 'vikar', turnin: 'vikar', text: 'Tigers from the coast have been taking our scouts. Hunt 6 Durotar Tigers near the Echo Isles.',
      objs: [{ type: 'kill', mob: 'durotar_tiger', n: 6 }], reward: { choice: ['fam_wrist'] } },
    kultiras_rum_q: { name: 'Spoils of Tiragarde', lvl: 8, giver: 'grosk', turnin: 'grosk', text: 'The humans at Tiragarde Keep drink well. Take 6 bottles of their rum. For the Horde. And for me.',
      objs: [{ type: 'collect', item: 'kultiras_rum', n: 6 }], reward: { choice: ['fam_waist'] } },
    // Mulgore: Bloodhoof Village
    strider_meat_q: { name: 'Plainstrider Stew', lvl: 5, giver: 'kauth', turnin: 'kauth', text: 'A good stew needs strider meat. The adult plainstriders on the Golden Plains are best. Bring me 6.',
      objs: [{ type: 'collect', item: 'strider_meat', n: 6 }], reward: { money: 90 } },
    stalker_hides: { name: 'Stalker Hides', lvl: 6, giver: 'mahnott', turnin: 'mahnott', text: 'Prairie stalker hide wraps a handle like nothing else. Bring me 6 and I will make you a weapon.',
      objs: [{ type: 'collect', item: 'stalker_hide', n: 6 }], reward: { choice: ['fam_weapon5'] } },
    plains_patrol: { name: 'Thinning the Herd', lvl: 6, giver: 'morin', turnin: 'morin', text: 'Too many plainstriders strip the grass our kodos need. Hunt 8 adults on the Golden Plains.',
      objs: [{ type: 'kill', mob: 'adult_plainstrider', n: 8 }], reward: { choice: ['fam_hands'] } },
    palemane_tanners: { name: 'The Palemane Tanners', lvl: 7, giver: 'harken', turnin: 'harken', pre: ['report_bloodhoof'], text: 'The Palemane skin our animals at Palemane Rock. Stop 8 of their tanners.',
      objs: [{ type: 'kill', mob: 'palemane_tanner', n: 8 }], reward: { choice: ['fam_wrist'] } },
    venture_tools_q: { name: 'Broken Tools', lvl: 8, giver: 'kauth', turnin: 'kauth', text: 'Every tool the Venture Co. loses is an hour they are not digging up our land. Take 6 from their mine.',
      objs: [{ type: 'collect', item: 'venture_tools', n: 6 }], reward: { choice: ['fam_waist'] } },
    // Tirisfal: Brill
    duskbat_cull: { name: 'Bats Over Brill', lvl: 5, giver: 'renee', turnin: 'renee', text: 'Greater duskbats nest in the Agamand barns and swarm the inn at dusk. Kill 8.',
      objs: [{ type: 'kill', mob: 'greater_duskbat', n: 8 }], reward: { money: 90 } },
    darkhound_blood_q: { name: 'Darkhound Blood', lvl: 6, giver: 'gerard', turnin: 'gerard', text: 'Darkhound blood tempers steel for the Forsaken. Bring me 6 vials from Agamand Mills and I will arm you.',
      objs: [{ type: 'collect', item: 'darkhound_blood', n: 6 }], reward: { choice: ['fam_weapon5'] } },
    duskbat_pelts: { name: 'Duskbat Pelts', lvl: 6, giver: 'johaan', turnin: 'johaan', text: 'I need leather for my... experiments. Duskbat pelts, 6 of them. Do not ask why.',
      objs: [{ type: 'collect', item: 'duskbat_pelt', n: 6 }], reward: { choice: ['fam_hands'] } },
    rot_hide_patrol: { name: 'The Rot Hide Gnolls', lvl: 7, giver: 'dillinger', turnin: 'dillinger', pre: ['report_brill'], text: "The Rot Hide gnolls at Garren's Haunt carry plague toward Brill. Kill 8.",
      objs: [{ type: 'kill', mob: 'rot_hide_gnoll', n: 8 }], reward: { choice: ['fam_wrist'] } },
    mongrel_cull: { name: 'Mongrels of the Haunt', lvl: 8, giver: 'sevren', turnin: 'sevren', text: "The Rot Hide mongrels are the worst of the pack. Put down 8 at Garren's Haunt.",
      objs: [{ type: 'kill', mob: 'rot_hide_mongrel', n: 8 }], reward: { choice: ['fam_waist'] } },
    // levels 9-10, so the last stretch before the next zone is quests, not grinding
    frostmane_seers: { name: 'Seers of the Frostmane', lvl: 9, giver: 'senir', turnin: 'senir', pre: ['troll_scouting'], text: 'Their seers keep the Frostmane fighting. Without them the rest will scatter. Kill 6.',
      objs: [{ type: 'kill', mob: 'frostmane_seer', n: 6 }], reward: { choice: ['fam_legs9'] } },
    elder_boars: { name: 'The Elder Boars', lvl: 9, giver: 'belm', turnin: 'belm', text: 'The old crag boars near Amberstill are too tough for my hunters. Bring down 8 elders.',
      objs: [{ type: 'kill', mob: 'elder_crag_boar', n: 8 }], reward: { money: 220 } },
    leper_gnomes: { name: 'A Sad Duty', lvl: 10, giver: 'grawn', turnin: 'grawn', text: 'Leper gnomes from Gnomeregan wander the ranch roads, and they are not who they were. End it for 8 of them.',
      objs: [{ type: 'kill', mob: 'leper_gnome', n: 8 }], reward: { choice: ['fam_hands9'] } },
    grell_cull: { name: 'Vicious Grell', lvl: 9, giver: 'kyra', turnin: 'kyra', pre: ['fel_sprites'], text: 'The grell deeper in Fel Rock are worse than the sprites. Kill 8.',
      objs: [{ type: 'kill', mob: 'vicious_grell', n: 8 }], reward: { choice: ['fam_legs9'] } },
    gnarlpine_shamans: { name: 'Shamans of the Gnarlpine', lvl: 10, giver: 'tallonkai', turnin: 'tallonkai', pre: ['gnarlpine_corruption'], text: 'The shamans spread the corruption through their tribe. Stop 8 of them.',
      objs: [{ type: 'kill', mob: 'gnarlpine_shaman', n: 8 }], reward: { choice: ['fam_hands9'] } },
    marines_q: { name: 'The Keep Marines', lvl: 9, giver: 'vikar', turnin: 'vikar', pre: ['tiger_hunt'], text: 'Tiragarde marines patrol farther from the keep each day. Kill 8 and push them back.',
      objs: [{ type: 'kill', mob: 'kul_tiras_marine', n: 8 }], reward: { choice: ['fam_legs9'] } },
    voodoo_trolls: { name: 'Voodoo on the Isles', lvl: 10, giver: 'kaplak', turnin: 'kaplak', text: 'The voodoo trolls on the Echo Isles serve Zalazane now. Kill 8 of them.',
      objs: [{ type: 'kill', mob: 'voodoo_troll', n: 8 }], reward: { choice: ['fam_hands9'] } },
    prairie_stalkers: { name: 'Stalkers on the Plains', lvl: 9, giver: 'harken', turnin: 'harken', text: 'Prairie stalkers follow the kodo herds and pick off the young. Hunt 8.',
      objs: [{ type: 'kill', mob: 'prairie_stalker', n: 8 }], reward: { money: 220 } },
    supervisors_q: { name: 'Time Is Money', lvl: 9, giver: 'mahnott', turnin: 'mahnott', text: 'Without their supervisors the Venture Co. workers stop digging. Remove 6.',
      objs: [{ type: 'kill', mob: 'venture_supervisor', n: 6 }], reward: { choice: ['fam_legs9'] } },
    last_poachers: { name: "The Poachers' Last Stand", lvl: 10, giver: 'morin', turnin: 'morin', pre: ['poachers'], text: 'The last Palemane poachers dug in at the rock. Finish it: 10 poachers.',
      objs: [{ type: 'kill', mob: 'palemane_poacher', n: 10 }], reward: { choice: ['fam_hands9'] } },
    scarlet_warriors: { name: 'Scarlet Warriors', lvl: 9, giver: 'dillinger', turnin: 'dillinger', text: 'Scarlet warriors guard the watch post. Cut down 8 and they will think twice about Brill.',
      objs: [{ type: 'kill', mob: 'scarlet_warrior', n: 8 }], reward: { choice: ['fam_legs9'] } },
    scarlet_converts: { name: 'Converts No More', lvl: 10, giver: 'renee', turnin: 'renee', text: 'The Scarlet Crusade recruits the living to hunt us. Stop 8 converts before they are trained.',
      objs: [{ type: 'kill', mob: 'scarlet_convert', n: 8 }], reward: { choice: ['fam_hands9'] } },
  });
  // The step to the second hub never waits on another quest, so nobody is stranded at 5.
  ['report_goldshire', 'report_kharanos', 'road_dolanaar', 'report_razor_hill', 'report_bloodhoof', 'report_brill'].forEach((q) => { delete D.QUESTS[q].pre; });


  // ================================================================ v2.0: Westfall + the Barrens (10-15)
  D.LEVEL_CAP = 15;
  D.XP_TO_LEVEL.push(11200, 12900, 14600, 16400);
  Object.assign(D.REGIONS, { westfall: { name: 'Westfall', faction: 'alliance' }, barrens: { name: 'The Barrens', faction: 'horde' } });

  // ---- new class abilities at 12 and 14 (built only from mechanics the engine already has)
  Object.assign(D.ABILITIES, {
    hamstring: { name: 'Hamstring', cls: 'warrior', lvl: 12, cost: 10, cd: 0, target: 'enemy',
      dmg: { base: [5, 5], perLvl: 0.6, school: 'physical' }, slow: { pct: 50, dur: 15 }, desc: 'Maims the enemy for {b} damage and slows its attacks by 50% for 15 sec.' },
    cleave: { name: 'Cleave', cls: 'warrior', lvl: 14, cost: 20, cd: 6, target: 'aoe',
      dmg: { base: [12, 12], perLvl: 1.5, school: 'physical' }, threat: 1.2, desc: 'A sweeping strike that hits every enemy in front of you for {b}.' },
    frost_nova: { name: 'Frost Nova', cls: 'mage', lvl: 12, cost: 55, costPerLvl: 3, cd: 25, target: 'aoe',
      dmg: { base: [8, 10], perLvl: 1, coef: 0.1, school: 'frost' }, slow: { pct: 60, dur: 8 }, desc: 'Blasts nearby enemies for {b} Frost damage and slows them for 8 sec.' },
    arcane_explosion: { name: 'Arcane Explosion', cls: 'mage', lvl: 14, cost: 75, costPerLvl: 4, cd: 0, target: 'aoe',
      dmg: { base: [14, 16], perLvl: 1.6, coef: 0.14, school: 'arcane' }, desc: 'A wave of arcane energy hits all nearby enemies for {b} Arcane damage.' },
    mind_blast: { name: 'Mind Blast', cls: 'priest', lvl: 12, cost: 50, costPerLvl: 4, cd: 8, cast: 1.5, target: 'enemy',
      dmg: { base: [36, 40], perLvl: 3, coef: 0.43, school: 'shadow' }, threat: 1.5, desc: 'Blasts the target\'s mind for {b} Shadow damage.' },
    inner_fire: { name: 'Inner Fire', cls: 'priest', lvl: 14, cost: 60, costPerLvl: 2, cd: 0, target: 'self',
      buff: { id: 'inner_fire', dur: 600, stats: { armor: 150, ap: 10 }, perLvl: { armor: 10, ap: 1 } }, desc: 'Raises your armor by {armor} and your attack power for 10 min.' },
    backstab: { name: 'Backstab', cls: 'rogue', lvl: 12, cost: 60, cd: 0, target: 'enemy', gcdLen: 1.0,
      dmg: { weapon: true, bonus: [15, 15], perLvl: 1.5 }, cp: 1, desc: 'A vicious stab for weapon damage plus {b}. Awards 1 combo point.' },
    garrote: { name: 'Garrote', cls: 'rogue', lvl: 14, cost: 50, cd: 0, target: 'enemy', opener: true, gcdLen: 1.0,
      dot: { id: 'garrote', ticks: 6, every: 3, dmg: 5, perLvl: 1.2, school: 'physical' }, cp: 1, desc: 'Opener. Garrotes an enemy you are not fighting yet for {d} damage over 18 sec. Awards 1 combo point.' },
    blessing_might: { name: 'Blessing of Might', cls: 'paladin', lvl: 12, cost: 30, costPerLvl: 2, cd: 0, target: 'party',
      buff: { id: 'blessing_might', dur: 300, stats: { ap: 20 }, perLvl: { ap: 3 } }, desc: 'Raises the attack power of your party by {ap} for 5 min.' },
    lay_on_hands: { name: 'Lay on Hands', cls: 'paladin', lvl: 14, cost: 0, cd: 600, target: 'ally',
      heal: { base: [400, 400], perLvl: 30 }, desc: 'Heals a friendly target for {h}. 10 min cooldown.' },
    searing_pain: { name: 'Searing Pain', cls: 'warlock', lvl: 12, cost: 30, costPerLvl: 3, cd: 0, cast: 1.5, target: 'enemy',
      dmg: { base: [18, 22], perLvl: 2.2, coef: 0.43, school: 'fire' }, threat: 2, desc: 'Sears the target for {b} Fire damage. Causes a lot of threat.' },
    shadow_ward: { name: 'Shadow Ward', cls: 'warlock', lvl: 14, cost: 40, costPerLvl: 3, cd: 30, target: 'self', gcd: false,
      shield: { base: 60, perLvl: 8, coef: 0.1, dur: 30 }, weakened: 0.1, desc: 'A dark barrier absorbs {s} damage for 30 sec.' },
    wing_clip: { name: 'Wing Clip', cls: 'hunter', lvl: 12, cost: 30, costPerLvl: 2, cd: 0, target: 'enemy',
      dmg: { base: [6, 6], perLvl: 0.8, school: 'physical' }, slow: { pct: 50, dur: 10 }, desc: 'Clips the enemy for {b} damage and slows its attacks by 50% for 10 sec.' },
    multi_shot: { name: 'Multi-Shot', cls: 'hunter', lvl: 14, cost: 60, costPerLvl: 4, cd: 10, target: 'aoe',
      dmg: { base: [14, 14], perLvl: 1.6, rapCoef: 0.2, school: 'physical' }, desc: 'Fires a volley at every nearby enemy for {b} damage.' },
    entangling_roots: { name: 'Entangling Roots', cls: 'druid', lvl: 12, cost: 50, costPerLvl: 3, cd: 0, cast: 1.5, target: 'enemy',
      dot: { id: 'entangling_roots', ticks: 4, every: 3, dmg: 4, perLvl: 0.9, school: 'nature' }, slow: { pct: 75, dur: 12 }, desc: 'Roots bind the enemy: it slows by 75% and takes {d} Nature damage over 12 sec.' },
    thorns: { name: 'Thorns', cls: 'druid', lvl: 14, cost: 35, costPerLvl: 2, cd: 0, target: 'self',
      buff: { id: 'thorns', dur: 600, thorns: { base: 3, perLvl: 0.6, charges: 20 } }, desc: 'Thorns sprout from you: enemies that hit you in melee take Nature damage.' },
    flame_shock: { name: 'Flame Shock', cls: 'shaman', lvl: 12, cost: 55, costPerLvl: 3, cd: 6, target: 'enemy',
      dmg: { base: [25, 25], perLvl: 1.8, coef: 0.15, school: 'fire' }, dot: { id: 'flame_shock', ticks: 4, every: 3, dmg: 6, perLvl: 1, coef: 0.1, school: 'fire' },
      desc: 'Burns the enemy for {b} Fire damage and {d} more over 12 sec.' },
    strength_earth: { name: 'Strength of Earth Totem', cls: 'shaman', lvl: 14, cost: 30, costPerLvl: 2, cd: 0, target: 'party',
      buff: { id: 'strength_earth', dur: 120, stats: { str: 10 }, perLvl: { str: 0.8 } }, desc: 'Drops a totem that raises your party\'s Strength by {str}.' },
  });
  Object.entries({ warrior: ['hamstring', 'cleave'], mage: ['frost_nova', 'arcane_explosion'], priest: ['mind_blast', 'inner_fire'], rogue: ['backstab', 'garrote'],
    paladin: ['blessing_might', 'lay_on_hands'], warlock: ['searing_pain', 'shadow_ward'], hunter: ['wing_clip', 'multi_shot'], druid: ['entangling_roots', 'thorns'],
    shaman: ['flame_shock', 'strength_earth'] }).forEach(([cls, ids]) => ids.forEach((id) => { if (!D.CLASSES[cls].abilities.includes(id)) D.CLASSES[cls].abilities.push(id); }));

  // ---- items
  item('moist_cornbread', { name: 'Moist Cornbread', slot: 'food', q: 1, lvl: 10, restore: 552, icon: 'bread', sell: 12, cost: 50 });
  item('melon_juice', { name: 'Melon Juice', slot: 'drink', q: 1, lvl: 10, restore: 835, icon: 'water', sell: 12, cost: 50 });
  [['handful_oats', 'Handful of Oats', 'seed'], ['goretusk_liver', 'Goretusk Liver', 'meat'], ['vulture_meat', 'Stringy Vulture Meat', 'meat'], ['goretusk_snout', 'Goretusk Snout', 'meat'],
    ['defias_bandana_wf', 'Red Leather Bandana', 'bandana'], ['fleshripper_talon', 'Fleshripper Talon', 'claw'], ['foe_reaper_core', 'Foe Reaper Power Core', 'coin'], ['defias_orders', 'Defias Orders', 'journal'],
    ['zhevra_hoof', 'Zhevra Hoof', 'claw'], ['lashtail_claw', 'Lashtail Raptor Claw', 'claw'], ['razormane_tusk', 'Razormane Tusk', 'quilboar_tusk'], ['snapjaw_shell', 'Snapjaw Shell Fragment', 'chest_box'],
    ['swiftmane_hoof', "Swiftmane's Hoof", 'claw'], ['kolkar_whip', 'Kolkar Whip', 'belt'], ['pool_water', 'Forgotten Pool Water', 'water'],
  ].forEach(([id, name, icon]) => item(id, { name, slot: 'quest', q: 1, icon }));
  item('reaper_scythe', { name: "Foe Reaper's Scythe", slot: 'weapon', wtype: 'staff', q: 3, lvl: 15, dmg: [26, 39], speed: 3.2, stats: { str: 6, sta: 4 }, icon: 'staff', sell: 1400, source: 'Foe Reaper 4000, Molsen Farm' });
  item('swiftmane_boots', { name: 'Swiftmane Striders', slot: 'feet', q: 3, lvl: 14, armor: 42, stats: { agi: 5, sta: 3 }, icon: 'boots', sell: 900, source: 'Swiftmane, the Forgotten Pools' });
  item('kodobane_axe', { name: "Kodobane's Axe", slot: 'weapon', wtype: 'axe', q: 3, lvl: 15, dmg: [19, 30], speed: 2.5, stats: { str: 5, agi: 3 }, icon: 'axe', sell: 1300, source: 'Barak Kodobane, the Stagnant Oasis' });

  // ---- mobs
  Object.assign(D.MOBS, {
    young_goretusk: { name: 'Young Goretusk', lvl: [10, 11], family: 'beast', drops: [['boar_tusk', 0.4], ['ruined_pelt', 0.3]], qdrops: [['goretusk_liver', 0.55]] },
    goretusk: { name: 'Goretusk', lvl: [12, 13], family: 'beast', hpMult: 1.1, drops: [['boar_tusk', 0.45], ['ruined_pelt', 0.35]], qdrops: [['goretusk_liver', 0.55], ['goretusk_snout', 0.55]] },
    fleshripper: { name: 'Fleshripper', lvl: [10, 11], family: 'beast', drops: [['wolf_fang', 0.3]], qdrops: [['vulture_meat', 0.6], ['fleshripper_talon', 0.5]] },
    harvest_watcher: { name: 'Harvest Watcher', lvl: [11, 12], family: 'mechanical', hpMult: 1.1, drops: [['linen_cloth', 0.2]], qdrops: [['handful_oats', 0.6]], aggro: 'Intruder detected.' },
    defias_trapper: { name: 'Defias Trapper', lvl: [11, 12], family: 'humanoid', drops: [['thieves_coin', 0.4], ['linen_cloth', 0.35]], qdrops: [['defias_bandana_wf', 0.45]], aggro: 'The Brotherhood sees all.' },
    defias_smuggler: { name: 'Defias Smuggler', lvl: [12, 13], family: 'humanoid', drops: [['thieves_coin', 0.45], ['linen_cloth', 0.35]], qdrops: [['defias_bandana_wf', 0.45]], aggro: 'Nobody takes our goods!' },
    defias_pathstalker: { name: 'Defias Pathstalker', lvl: [13, 14], family: 'humanoid', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.35]], qdrops: [['defias_bandana_wf', 0.45], ['defias_orders', 0.2]], aggro: 'For VanCleef!' },
    murloc_coastrunner: { name: 'Murloc Coastrunner', lvl: [11, 12], family: 'murloc', drops: [['murloc_eye', 0.45]], aggro: 'Mrrglglgl!' },
    murloc_tidehunter: { name: 'Murloc Tidehunter', lvl: [13, 14], family: 'murloc', hpMult: 1.1, drops: [['murloc_eye', 0.5]], aggro: 'Aaaaughibbrgubugbugrguburgle!' },
    foe_reaper: { name: 'Foe Reaper 4000', lvl: [15, 15], family: 'mechanical', named: true, hpMult: 2.2, dmgMult: 1.35, drops: [['reaper_scythe', 0.35]], qdrops: [['foe_reaper_core', 1]], aggro: 'Harvest protocol engaged.' },
    kolkar_drudge: { name: 'Kolkar Drudge', lvl: [10, 11], family: 'humanoid', drops: [['linen_cloth', 0.35], ['ruined_pelt', 0.25]], aggro: 'The Kolkar will crush you!' },
    kolkar_wrangler: { name: 'Kolkar Wrangler', lvl: [12, 13], family: 'humanoid', drops: [['linen_cloth', 0.35], ['thieves_coin', 0.35]], qdrops: [['kolkar_whip', 0.5]], aggro: 'Another beast for the herd!' },
    barak_kodobane: { name: 'Barak Kodobane', lvl: [15, 15], family: 'humanoid', named: true, hpMult: 2, dmgMult: 1.3, drops: [['kodobane_axe', 0.35], ['thieves_coin', 1]], aggro: 'The plains belong to the Kolkar!' },
    zhevra_runner: { name: 'Zhevra Runner', lvl: [10, 11], family: 'beast', drops: [['ruined_pelt', 0.4]], qdrops: [['zhevra_hoof', 0.55]] },
    swiftmane: { name: 'Swiftmane', lvl: [14, 14], family: 'beast', named: true, hpMult: 1.9, dmgMult: 1.25, drops: [['swiftmane_boots', 0.35], ['ruined_pelt', 1]], qdrops: [['swiftmane_hoof', 1]] },
    savannah_prowler: { name: 'Savannah Prowler', lvl: [12, 13], family: 'beast', drops: [['ruined_pelt', 0.4], ['wolf_fang', 0.3]] },
    sunscale_lashtail: { name: 'Sunscale Lashtail', lvl: [11, 12], family: 'beast', drops: [['ruined_pelt', 0.35]], qdrops: [['lashtail_claw', 0.55]] },
    oasis_snapjaw: { name: 'Oasis Snapjaw', lvl: [13, 14], family: 'beast', hpMult: 1.2, drops: [['ruined_pelt', 0.3]], qdrops: [['snapjaw_shell', 0.55]] },
    razormane_quilboar: { name: 'Razormane Quilboar', lvl: [11, 12], family: 'humanoid', drops: [['quilboar_tusk', 0.35], ['linen_cloth', 0.3]], qdrops: [['razormane_tusk', 0.5]], aggro: 'Razormane! Kill!' },
    razormane_thornweaver: { name: 'Razormane Thornweaver', lvl: [13, 14], family: 'humanoid', drops: [['quilboar_tusk', 0.35], ['linen_cloth', 0.35]], qdrops: [['razormane_tusk', 0.5]], aggro: 'The thorns hunger!' },
  });

  // ---- places
  Object.assign(D.PLACES, {
    furlbrow_farm: { name: "Furlbrow's Pumpkin Farm", zone: 'Westfall', region: 'westfall', scene: 'furlbrow_farm', lvl: [10, 11],
      mobs: [['young_goretusk', 5], ['fleshripper', 4]], pool: 9, npcs: ['furlbrow', 'verna'], links: { goldshire: 30, saldean_farm: 14, sentinel_hill: 20 } },
    saldean_farm: { name: "Saldean's Farm", zone: 'Westfall', region: 'westfall', scene: 'saldean_farm', lvl: [10, 12],
      mobs: [['harvest_watcher', 5], ['young_goretusk', 3], ['defias_trapper', 3]], pool: 10, npcs: ['saldean', 'salma'], links: { furlbrow_farm: 14, sentinel_hill: 16 } },
    sentinel_hill: { name: 'Sentinel Hill', zone: 'Westfall', region: 'westfall', scene: 'sentinel_hill', lvl: [10, 15], safe: true, inn: true,
      mobs: [], pool: 0, npcs: ['gryan', 'danuvin', 'galiaan', 'heather', 'lewis'], vendor: 'heather', gearVendor: 'lewis',
      links: { furlbrow_farm: 20, saldean_farm: 16, jangolode_mine: 16, molsen_farm: 18, the_longshore: 18 } },
    jangolode_mine: { name: 'Jangolode Mine', zone: 'Westfall', region: 'westfall', scene: 'jangolode_mine', lvl: [11, 13],
      mobs: [['defias_smuggler', 5], ['defias_trapper', 4]], pool: 10, npcs: [], links: { sentinel_hill: 16 } },
    molsen_farm: { name: 'Molsen Farm', zone: 'Westfall', region: 'westfall', scene: 'molsen_farm', lvl: [12, 14],
      mobs: [['harvest_watcher', 3], ['goretusk', 4], ['defias_pathstalker', 4]], named: { foe_reaper: 300 }, pool: 10, npcs: [], links: { sentinel_hill: 18 } },
    the_longshore: { name: 'The Longshore', zone: 'Westfall', region: 'westfall', scene: 'the_longshore', lvl: [11, 15],
      mobs: [['murloc_coastrunner', 5], ['murloc_tidehunter', 4], ['fleshripper', 2]], pool: 10, npcs: [], links: { sentinel_hill: 18 } },

    far_watch: { name: 'Far Watch Post', zone: 'The Barrens', region: 'barrens', scene: 'far_watch', lvl: [10, 12],
      mobs: [['kolkar_drudge', 4], ['zhevra_runner', 4], ['razormane_quilboar', 3]], pool: 10, npcs: ['kargal'], links: { razor_hill: 25, crossroads: 20, razormane_grounds: 16 } },
    crossroads: { name: 'The Crossroads', zone: 'The Barrens', region: 'barrens', scene: 'crossroads', lvl: [10, 15], safe: true, inn: true,
      mobs: [], pool: 0, npcs: ['thork', 'sergra', 'helbrim', 'zargh', 'boorand', 'nargal'], vendor: 'boorand', gearVendor: 'nargal',
      links: { far_watch: 20, forgotten_pools: 16, stagnant_oasis: 20, razormane_grounds: 18, bloodhoof_village: 35, orgrimmar: 40, thunder_bluff: 40 },
      via: { orgrimmar: 'Wind rider', thunder_bluff: 'Wind rider' } },
    forgotten_pools: { name: 'The Forgotten Pools', zone: 'The Barrens', region: 'barrens', scene: 'forgotten_pools', lvl: [11, 13],
      mobs: [['sunscale_lashtail', 5], ['zhevra_runner', 3], ['savannah_prowler', 3]], named: { swiftmane: 300 }, pool: 10, npcs: [], links: { crossroads: 16 } },
    stagnant_oasis: { name: 'The Stagnant Oasis', zone: 'The Barrens', region: 'barrens', scene: 'stagnant_oasis', lvl: [12, 15],
      mobs: [['kolkar_wrangler', 5], ['oasis_snapjaw', 4], ['kolkar_drudge', 2]], named: { barak_kodobane: 240 }, pool: 10, npcs: [], links: { crossroads: 20 } },
    razormane_grounds: { name: 'Razormane Grounds', zone: 'The Barrens', region: 'barrens', scene: 'razormane_grounds', lvl: [11, 14],
      mobs: [['razormane_quilboar', 5], ['razormane_thornweaver', 4]], pool: 10, npcs: [], links: { crossroads: 18, far_watch: 16 } },
  });
  D.PLACES.goldshire.links.furlbrow_farm = 30;
  D.PLACES.razor_hill.links.far_watch = 25;
  D.PLACES.bloodhoof_village.links.crossroads = 35;
  D.PLACES.orgrimmar.links.crossroads = 40; (D.PLACES.orgrimmar.via = D.PLACES.orgrimmar.via || {}).crossroads = 'Wind rider';
  D.PLACES.thunder_bluff.links.crossroads = 40; (D.PLACES.thunder_bluff.via = D.PLACES.thunder_bluff.via || {}).crossroads = 'Wind rider';

  // ---- people
  Object.assign(D.NPCS, {
    gryan: { name: 'Gryan Stoutmantle', title: "The People's Militia" }, danuvin: { name: 'Captain Danuvin', title: 'Sentinel Hill' }, galiaan: { name: 'Scout Galiaan', title: 'Scout' },
    heather: { name: 'Innkeeper Heather', title: 'Innkeeper' }, lewis: { name: 'Quartermaster Lewis', title: 'Weaponsmith' },
    furlbrow: { name: 'Farmer Furlbrow', title: 'Farmer' }, verna: { name: 'Verna Furlbrow', title: 'Farmer' }, saldean: { name: 'Farmer Saldean', title: 'Farmer' }, salma: { name: 'Salma Saldean', title: 'Cook' },
    thork: { name: 'Thork', title: 'The Crossroads' }, sergra: { name: 'Sergra Darkthorn', title: 'Hunter' }, helbrim: { name: 'Apothecary Helbrim', title: 'Apothecary' },
    zargh: { name: 'Zargh', title: 'Cook' }, boorand: { name: 'Innkeeper Boorand Plainswind', title: 'Innkeeper' }, nargal: { name: 'Nargal Deatheye', title: 'Weaponsmith' },
    kargal: { name: 'Kargal Battlescar', title: 'Far Watch Post' },
  });

  // ---- quests
  Object.assign(D.QUESTS, {
    // Westfall
    report_gryan: { name: 'Report to Gryan Stoutmantle', lvl: 10, giver: 'dughan', turnin: 'gryan', text: 'The farmers of Westfall rose up against the Defias. Their leader, Gryan Stoutmantle, holds Sentinel Hill. Go west and offer your sword.',
      objs: [{ type: 'visit', place: 'sentinel_hill' }], reward: {} },
    westfall_dunmorogh: { name: 'Westfall Needs You', lvl: 10, giver: 'senir', turnin: 'gryan', text: 'Stormwind asks for help in Westfall. Take the Deeprun Tram from Ironforge, walk west from Goldshire, and report to Gryan Stoutmantle at Sentinel Hill.',
      objs: [{ type: 'visit', place: 'sentinel_hill' }], reward: {} },
    westfall_teldrassil: { name: 'Across the Sea', lvl: 10, giver: 'tallonkai', turnin: 'gryan', text: 'Our allies in Westfall fight the Defias. Take the boat from Darnassus to Goldshire, head west, and report to Gryan Stoutmantle at Sentinel Hill.',
      objs: [{ type: 'visit', place: 'sentinel_hill' }], reward: {} },
    poor_blanchy: { name: 'Poor Old Blanchy', lvl: 10, giver: 'verna', turnin: 'verna', text: 'Our old horse Blanchy is starving. The harvest watchers guard what oats are left in the fields. Bring me 8 handfuls.',
      objs: [{ type: 'collect', item: 'handful_oats', n: 8 }], reward: { money: 250 } },
    westfall_stew: { name: 'Westfall Stew', lvl: 10, giver: 'furlbrow', turnin: 'furlbrow', text: 'We lost everything but our stew pot. Fleshripper meat is stringy, but it fills a belly. Bring me 6.',
      objs: [{ type: 'collect', item: 'vulture_meat', n: 6 }], reward: { choice: ['fam_feet12'] } },
    goretusk_pie: { name: 'Goretusk Liver Pie', lvl: 10, giver: 'salma', turnin: 'salma', text: 'My liver pie keeps the militia on its feet. I need 8 goretusk livers.',
      objs: [{ type: 'collect', item: 'goretusk_liver', n: 8 }], reward: { money: 260 } },
    harvest_watchers: { name: 'The Harvest Watchers', lvl: 11, giver: 'saldean', turnin: 'saldean', text: 'The Defias built those harvest watchers to guard our own fields against us. Smash 8.',
      objs: [{ type: 'kill', mob: 'harvest_watcher', n: 8 }], reward: { choice: ['fam_wrist12'] } },
    peoples_militia: { name: "The People's Militia", lvl: 11, giver: 'gryan', turnin: 'gryan', pre: ['report_gryan'], text: 'Defias trappers watch the roads for travellers to rob. Show them the militia still stands: 10 trappers.',
      objs: [{ type: 'kill', mob: 'defias_trapper', n: 10 }], reward: { choice: ['fam_chest13'] } },
    fleshripper_talons: { name: 'Fleshripper Talons', lvl: 11, giver: 'lewis', turnin: 'lewis', text: 'Fleshripper talons make good arrowheads. Bring me 6 and I will find you a better weapon.',
      objs: [{ type: 'collect', item: 'fleshripper_talon', n: 6 }], reward: { choice: ['fam_weapon12'] } },
    jangolode: { name: 'The Jangolode Mine', lvl: 12, giver: 'danuvin', turnin: 'danuvin', text: 'The Defias smuggle stolen ore out of the Jangolode Mine. Kill 10 smugglers.',
      objs: [{ type: 'kill', mob: 'defias_smuggler', n: 10 }], reward: { choice: ['fam_legs13'] } },
    red_bandanas: { name: 'Red Leather Bandanas', lvl: 12, giver: 'danuvin', turnin: 'danuvin', text: 'Every Defias wears a red bandana. My scouts need disguises. Bring me 12.',
      objs: [{ type: 'collect', item: 'defias_bandana_wf', n: 12 }], reward: { money: 380 } },
    coast_murlocs: { name: "The Coast Isn't Clear", lvl: 12, giver: 'galiaan', turnin: 'galiaan', text: 'Murlocs from the Longshore raid the farms at night. Kill 10 coastrunners.',
      objs: [{ type: 'kill', mob: 'murloc_coastrunner', n: 10 }], reward: { choice: ['fam_hands14'] } },
    goretusk_snouts: { name: 'Goretusk Snouts', lvl: 13, giver: 'heather', turnin: 'heather', text: 'Snout soup is the militia\'s favourite. The big goretusks on Molsen Farm have the best. Bring me 8.',
      objs: [{ type: 'collect', item: 'goretusk_snout', n: 8 }], reward: { money: 400 } },
    peoples_militia2: { name: "The People's Militia (2)", lvl: 13, giver: 'gryan', turnin: 'gryan', pre: ['peoples_militia'], text: 'The pathstalkers are the Brotherhood\'s eyes. Blind them: 10 pathstalkers on Molsen Farm.',
      objs: [{ type: 'kill', mob: 'defias_pathstalker', n: 10 }], reward: { choice: ['fam_back14'] } },
    molsen_watchers: { name: 'Clearing Molsen Farm', lvl: 13, giver: 'saldean', turnin: 'saldean', pre: ['harvest_watchers'], text: 'More watchers walk the Molsen fields, and bigger goretusks follow them. Kill 8 goretusks there.',
      objs: [{ type: 'kill', mob: 'goretusk', n: 8 }], reward: { choice: ['fam_waist14'] } },
    tidehunters: { name: 'Tidehunters', lvl: 14, giver: 'galiaan', turnin: 'galiaan', pre: ['coast_murlocs'], text: 'The tidehunters lead the murloc raids. Kill 8 and the rest will scatter.',
      objs: [{ type: 'kill', mob: 'murloc_tidehunter', n: 8 }], reward: { choice: ['fam_legs13'] } },
    defias_orders: { name: 'The Defias Orders', lvl: 14, giver: 'gryan', turnin: 'gryan', pre: ['peoples_militia2'], text: 'The pathstalkers carry written orders from their master. Bring me one and we will learn where the Brotherhood hides.',
      objs: [{ type: 'collect', item: 'defias_orders', n: 1 }], reward: { choice: ['fam_weapon15'] } },
    foe_reaper_q: { name: 'The Foe Reaper', lvl: 15, giver: 'gryan', turnin: 'gryan', text: 'A monstrous harvest golem, the Foe Reaper 4000, stalks Molsen Farm. It is rarely seen. Destroy it and bring me its power core.',
      objs: [{ type: 'collect', item: 'foe_reaper_core', n: 1 }], reward: { choice: ['fam_ring_rare'] } },
    // The Barrens
    crossroads_durotar: { name: 'Report to the Crossroads', lvl: 10, giver: 'garthok', turnin: 'thork', text: 'The Crossroads guards the heart of the Barrens. Thork needs fighters. Go west through Far Watch.',
      objs: [{ type: 'visit', place: 'crossroads' }], reward: {} },
    crossroads_mulgore: { name: 'Journey to the Crossroads', lvl: 10, giver: 'baine', turnin: 'thork', text: 'North of Mulgore lie the Barrens. Our allies at the Crossroads need help. Report to Thork.',
      objs: [{ type: 'visit', place: 'crossroads' }], reward: {} },
    crossroads_tirisfal: { name: 'Service to the Horde', lvl: 10, giver: 'sevren', turnin: 'thork', text: 'The Dark Lady supports the Warchief. Take the zeppelin to Orgrimmar and report to Thork at the Crossroads.',
      objs: [{ type: 'visit', place: 'crossroads' }], reward: {} },
    disrupt_attacks: { name: 'Disrupt the Attacks', lvl: 10, giver: 'thork', turnin: 'thork', text: 'Kolkar centaurs raid our supply lines from the north. Kill 8 drudges.',
      objs: [{ type: 'kill', mob: 'kolkar_drudge', n: 8 }], reward: { choice: ['fam_feet12'] } },
    zhevra_runners: { name: 'Zhevra Runners', lvl: 10, giver: 'boorand', turnin: 'boorand', text: 'The zhevra trample our tents at night. Hunt 8.',
      objs: [{ type: 'kill', mob: 'zhevra_runner', n: 8 }], reward: { money: 250 } },
    zhevra_hooves: { name: 'Zhevra Hooves', lvl: 10, giver: 'zargh', turnin: 'zargh', text: 'Zhevra hoof jelly. Nobody likes it, everybody eats it. Bring me 6 hooves.',
      objs: [{ type: 'collect', item: 'zhevra_hoof', n: 6 }], reward: { money: 260 } },
    raptor_thieves: { name: 'Raptor Thieves', lvl: 11, giver: 'sergra', turnin: 'sergra', text: 'Sunscale raptors steal from our caravans. Kill 10 lashtails at the Forgotten Pools.',
      objs: [{ type: 'kill', mob: 'sunscale_lashtail', n: 10 }], reward: { choice: ['fam_wrist12'] } },
    razormane_raid: { name: 'The Razormane', lvl: 11, giver: 'kargal', turnin: 'kargal', text: 'The Razormane quilboar grow bolder near Far Watch. Kill 10.',
      objs: [{ type: 'kill', mob: 'razormane_quilboar', n: 10 }], reward: { choice: ['fam_chest13'] } },
    lashtail_claws: { name: 'Lashtail Claws', lvl: 12, giver: 'helbrim', turnin: 'helbrim', text: 'Raptor claw is useful to an apothecary. Bring me 6 lashtail claws.',
      objs: [{ type: 'collect', item: 'lashtail_claw', n: 6 }], reward: { choice: ['fam_hands14'] } },
    razormane_tusks: { name: 'Razormane Tusks', lvl: 12, giver: 'nargal', turnin: 'nargal', text: 'Quilboar tusk makes a fine hilt. Bring me 8 from the Razormane and I will make you a weapon.',
      objs: [{ type: 'collect', item: 'razormane_tusk', n: 8 }], reward: { choice: ['fam_weapon12'] } },
    savannah_prowlers: { name: 'Savannah Prowlers', lvl: 12, giver: 'kargal', turnin: 'kargal', text: 'Prowlers stalk the road to Far Watch. Kill 8.',
      objs: [{ type: 'kill', mob: 'savannah_prowler', n: 8 }], reward: { choice: ['fam_legs13'] } },
    forgotten_pools_q: { name: 'The Forgotten Pools', lvl: 12, giver: 'helbrim', turnin: 'helbrim', text: 'Something fouls the water in the Barrens. Bring me a sample from the Forgotten Pools.',
      objs: [{ type: 'visit', place: 'forgotten_pools' }], reward: { money: 300 } },
    kolkar_wranglers: { name: 'Kolkar Wranglers', lvl: 13, giver: 'thork', turnin: 'thork', pre: ['disrupt_attacks'], text: 'The wranglers break beasts for the centaur war bands. Kill 10 at the Stagnant Oasis.',
      objs: [{ type: 'kill', mob: 'kolkar_wrangler', n: 10 }], reward: { choice: ['fam_back14'] } },
    kolkar_whips: { name: 'Wrangler Whips', lvl: 13, giver: 'sergra', turnin: 'sergra', text: 'Take the wranglers\' whips and they cannot drive their beasts. Bring me 6.',
      objs: [{ type: 'collect', item: 'kolkar_whip', n: 6 }], reward: { money: 400 } },
    thornweavers: { name: 'Thornweavers', lvl: 13, giver: 'kargal', turnin: 'kargal', pre: ['razormane_raid'], text: 'The thornweavers work the Razormane\'s dark magic. Kill 8.',
      objs: [{ type: 'kill', mob: 'razormane_thornweaver', n: 8 }], reward: { choice: ['fam_waist14'] } },
    snapjaw_shells: { name: 'Snapjaw Shells', lvl: 14, giver: 'zargh', turnin: 'zargh', text: 'Turtle soup! The snapjaws at the Stagnant Oasis bite back, so be careful. Bring me 6 shell pieces.',
      objs: [{ type: 'collect', item: 'snapjaw_shell', n: 6 }], reward: { choice: ['fam_legs13'] } },
    swiftmane_q: { name: 'Swiftmane', lvl: 14, giver: 'sergra', turnin: 'sergra', text: 'A great zhevra called Swiftmane is seen at the Forgotten Pools, but rarely. Bring me its hoof.',
      objs: [{ type: 'collect', item: 'swiftmane_hoof', n: 1 }], reward: { choice: ['fam_ring_rare'] } },
    kolkar_leaders: { name: 'Kolkar Leaders', lvl: 15, giver: 'thork', turnin: 'thork', pre: ['kolkar_wranglers'], text: 'Barak Kodobane leads the centaur at the Stagnant Oasis. Kill him.',
      objs: [{ type: 'kill', mob: 'barak_kodobane', n: 1 }], reward: { choice: ['fam_weapon15'] } },
  });

  // ---- v2.0 third tier (14-16): the Dagger Hills and Thorn Hill
  [['riverpaw_paw', 'Riverpaw Paw', 'claw'], ['swirling_sand', 'Swirling Sand', 'dust'], ['tidehunter_scale', 'Tidehunter Scale', 'fin'],
    ['storm_charm', 'Kolkar Storm Charm', 'voodoo_doll'], ['stormsnout_hide', 'Stormsnout Hide', 'pelt'], ['lizard_steak', 'Thunder Lizard Steak', 'meat'],
  ].forEach(([id, name, icon]) => item(id, { name, slot: 'quest', q: 1, icon }));
  D.MOBS.murloc_tidehunter.qdrops = [['tidehunter_scale', 0.55]];
  Object.assign(D.MOBS, {
    riverpaw_brute: { name: 'Riverpaw Brute', lvl: [14, 15], family: 'humanoid', hpMult: 1.15, drops: [['gnoll_mane', 0.45], ['linen_cloth', 0.35]], qdrops: [['riverpaw_paw', 0.55]], aggro: 'Grrr... fresh meat!' },
    dust_devil: { name: 'Dust Devil', lvl: [14, 15], family: 'elemental', drops: [['linen_cloth', 0.1]], qdrops: [['swirling_sand', 0.6]] },
    kolkar_stormer: { name: 'Kolkar Stormer', lvl: [14, 15], family: 'humanoid', drops: [['linen_cloth', 0.4], ['thieves_coin', 0.35]], qdrops: [['storm_charm', 0.55]], aggro: 'The storm answers the Kolkar!' },
    stormsnout: { name: 'Stormsnout', lvl: [14, 15], family: 'beast', hpMult: 1.2, drops: [['ruined_pelt', 0.4]], qdrops: [['stormsnout_hide', 0.5], ['lizard_steak', 0.55]] },
  });
  Object.assign(D.PLACES, {
    dagger_hills: { name: 'The Dagger Hills', zone: 'Westfall', region: 'westfall', scene: 'dagger_hills', lvl: [14, 16],
      mobs: [['riverpaw_brute', 5], ['dust_devil', 4]], pool: 10, npcs: [], links: { sentinel_hill: 20, the_longshore: 16 } },
    thorn_hill: { name: 'Thorn Hill', zone: 'The Barrens', region: 'barrens', scene: 'thorn_hill', lvl: [14, 16],
      mobs: [['kolkar_stormer', 5], ['stormsnout', 4]], pool: 10, npcs: [], links: { crossroads: 22, stagnant_oasis: 16 } },
  });
  D.PLACES.sentinel_hill.links.dagger_hills = 20; D.PLACES.the_longshore.links.dagger_hills = 16;
  D.PLACES.crossroads.links.thorn_hill = 22; D.PLACES.stagnant_oasis.links.thorn_hill = 16;
  Object.assign(D.QUESTS, {
    hills_scout: { name: 'The Dagger Hills', lvl: 13, giver: 'galiaan', turnin: 'galiaan', text: 'Gnolls gather in the Dagger Hills to the south. Scout the hills and come back alive.',
      objs: [{ type: 'visit', place: 'dagger_hills' }], reward: { money: 350 } },
    riverpaw_brutes: { name: 'The Riverpaw Brutes', lvl: 14, giver: 'danuvin', turnin: 'danuvin', text: 'Riverpaw brutes raid the southern farms. Kill 10 in the Dagger Hills.',
      objs: [{ type: 'kill', mob: 'riverpaw_brute', n: 10 }], reward: { choice: ['fam_chest13'] } },
    dust_devils: { name: 'Dust Devils', lvl: 14, giver: 'saldean', turnin: 'saldean', text: 'Dust devils rip up what crops we have left. Break 6 of them apart.',
      objs: [{ type: 'kill', mob: 'dust_devil', n: 6 }], reward: { money: 420 } },
    tidehunter_scales: { name: 'Tidehunter Scales', lvl: 14, giver: 'lewis', turnin: 'lewis', text: 'Tidehunter scales make good armour plates. Bring me 8.',
      objs: [{ type: 'collect', item: 'tidehunter_scale', n: 8 }], reward: { choice: ['fam_wrist12'] } },
    swirling_sand: { name: 'Swirling Sand', lvl: 15, giver: 'heather', turnin: 'heather', text: 'The sand inside a dust devil never stops moving. A mage in Stormwind pays well for it. Bring me 6 handfuls.',
      objs: [{ type: 'collect', item: 'swirling_sand', n: 6 }], reward: { money: 480 } },
    gnoll_paws: { name: 'Gnoll Paws', lvl: 15, giver: 'salma', turnin: 'salma', text: 'Proof of every gnoll you kill earns a bounty from the militia. Bring me 8 paws.',
      objs: [{ type: 'collect', item: 'riverpaw_paw', n: 8 }], reward: { choice: ['fam_hands14'] } },
    hills_patrol: { name: 'Patrolling the Hills', lvl: 15, giver: 'gryan', turnin: 'gryan', pre: ['hills_scout'], text: 'Keep the Dagger Hills clear: 6 brutes and 4 dust devils.',
      objs: [{ type: 'kill', mob: 'riverpaw_brute', n: 6 }, { type: 'kill', mob: 'dust_devil', n: 4 }], reward: { choice: ['fam_waist14'] } },
    riverpaw_camp: { name: 'The Riverpaw Camp', lvl: 16, giver: 'danuvin', turnin: 'danuvin', pre: ['riverpaw_brutes'], text: 'Their main camp is in the hills. Break it: 12 brutes.',
      objs: [{ type: 'kill', mob: 'riverpaw_brute', n: 12 }], reward: { choice: ['fam_back14'] } },
    thorn_hill_scout: { name: 'Thorn Hill', lvl: 13, giver: 'kargal', turnin: 'kargal', text: 'The Kolkar gather storm shamans at Thorn Hill. Scout it for me.',
      objs: [{ type: 'visit', place: 'thorn_hill' }], reward: { money: 350 } },
    kolkar_stormers: { name: 'Kolkar Stormers', lvl: 14, giver: 'thork', turnin: 'thork', text: 'The stormers call lightning down on our caravans. Kill 10.',
      objs: [{ type: 'kill', mob: 'kolkar_stormer', n: 10 }], reward: { choice: ['fam_chest13'] } },
    stormsnouts: { name: 'Stormsnouts', lvl: 14, giver: 'sergra', turnin: 'sergra', text: 'The stormsnouts of Thorn Hill are the toughest lizards in the Barrens. Hunt 8.',
      objs: [{ type: 'kill', mob: 'stormsnout', n: 8 }], reward: { money: 420 } },
    storm_charms: { name: 'Storm Charms', lvl: 15, giver: 'helbrim', turnin: 'helbrim', text: "The stormers' charms hold real power. Bring me 8 to study.",
      objs: [{ type: 'collect', item: 'storm_charm', n: 8 }], reward: { choice: ['fam_wrist12'] } },
    stormsnout_hides: { name: 'Stormsnout Hides', lvl: 15, giver: 'nargal', turnin: 'nargal', text: 'Stormsnout hide turns a blade. Bring me 6.',
      objs: [{ type: 'collect', item: 'stormsnout_hide', n: 6 }], reward: { choice: ['fam_hands14'] } },
    lizard_steaks: { name: 'Thunder Lizard Steaks', lvl: 15, giver: 'zargh', turnin: 'zargh', text: 'Thunder lizard steak, crackling hot. Bring me 6.',
      objs: [{ type: 'collect', item: 'lizard_steak', n: 6 }], reward: { money: 480 } },
    thorn_hill_patrol: { name: 'Storm over Thorn Hill', lvl: 15, giver: 'kargal', turnin: 'kargal', pre: ['thorn_hill_scout'], text: 'Push the Kolkar off Thorn Hill: 6 stormers and 4 stormsnouts.',
      objs: [{ type: 'kill', mob: 'kolkar_stormer', n: 6 }, { type: 'kill', mob: 'stormsnout', n: 4 }], reward: { choice: ['fam_waist14'] } },
    centaur_camp: { name: 'The Centaur War Camp', lvl: 16, giver: 'thork', turnin: 'thork', pre: ['kolkar_stormers'], text: 'Break the war camp on Thorn Hill: 12 stormers.',
      objs: [{ type: 'kill', mob: 'kolkar_stormer', n: 12 }], reward: { choice: ['fam_back14'] } },
  });

  D.REWARD_FAMILIES = {
    fam_chest: { slot: 'chest', lvl: 2, q: 1 }, fam_legs: { slot: 'legs', lvl: 2, q: 1 }, fam_feet: { slot: 'feet', lvl: 3, q: 1 },
    fam_hands: { slot: 'hands', lvl: 4, q: 2 }, fam_weapon5: { slot: 'weapon', lvl: 5, q: 2 }, fam_wrist: { slot: 'wrist', lvl: 6, q: 2 },
    fam_back: { slot: 'back', lvl: 8, q: 2 }, fam_waist: { slot: 'waist', lvl: 8, q: 2 }, fam_chest9: { slot: 'chest', lvl: 9, q: 2 },
    fam_legs9: { slot: 'legs', lvl: 9, q: 2 }, fam_hands9: { slot: 'hands', lvl: 10, q: 2 }, fam_back_rare: { slot: 'back', lvl: 10, q: 3 },
    militia: { fixed: { warrior: 'militia_shortsword', rogue: 'militia_dagger', mage: 'militia_staff', priest: 'militia_hammer', paladin: 'militia_hammer', warlock: 'militia_staff', hunter: 'militia_longbow', druid: 'militia_staff', shaman: 'militia_hammer' } },
  };

  Object.assign(D.REWARD_FAMILIES, {
    fam_feet12: { slot: 'feet', lvl: 11, q: 2 }, fam_wrist12: { slot: 'wrist', lvl: 12, q: 2 }, fam_weapon12: { slot: 'weapon', lvl: 12, q: 2 },
    fam_chest13: { slot: 'chest', lvl: 13, q: 2 }, fam_legs13: { slot: 'legs', lvl: 13, q: 2 }, fam_back14: { slot: 'back', lvl: 14, q: 2 },
    fam_waist14: { slot: 'waist', lvl: 14, q: 2 }, fam_hands14: { slot: 'hands', lvl: 14, q: 2 }, fam_weapon15: { slot: 'weapon', lvl: 15, q: 2 },
    fam_ring_rare: { slot: 'finger', lvl: 15, q: 3 },
  });

  // ---------------------------------------------------------------- dungeon
  D.DUNGEONS = {
    deadmines: { name: 'The Deadmines', minLvl: 8, size: 5, trashMult: { hp: 2.2, dmg: 1.55 }, bossMult: { hp: 10, dmg: 3.2 },
      pulls: [
        { scene: 'deadmines_mine', label: 'Mine tunnel', mobs: ['defias_miner', 'defias_miner'] },
        { scene: 'deadmines_mine', label: 'Mine tunnel', mobs: ['defias_miner', 'goblin_engineer'] },
        { scene: 'deadmines_mine', label: "Rhahk'Zor", mobs: ['rhahkzor'], boss: true },
        { scene: 'deadmines_mine', label: 'Lumber mill', mobs: ['goblin_engineer', 'goblin_engineer', 'defias_miner'] },
        { scene: 'deadmines_mine', label: "Sneed's Shredder", mobs: ['sneed_shredder'], boss: true },
        { scene: 'deadmines_mine', label: 'Foundry', mobs: ['goblin_engineer', 'defias_miner'] },
        { scene: 'deadmines_mine', label: 'Gilnid', mobs: ['gilnid'], boss: true },
        { scene: 'deadmines_ship', label: 'The cove', mobs: ['defias_pirate', 'defias_pirate'] },
        { scene: 'deadmines_ship', label: 'The cove', mobs: ['defias_pirate', 'defias_pirate', 'defias_pirate'] },
        { scene: 'deadmines_ship', label: 'Mr. Smite', mobs: ['mr_smite'], boss: true },
        { scene: 'deadmines_ship', label: 'Cookie', mobs: ['cookie'], boss: true },
        { scene: 'deadmines_ship', label: 'Edwin VanCleef', mobs: ['vancleef'], boss: true },
      ] },
  };

  D.DUNGEONS.ragefire = { name: 'Ragefire Chasm', minLvl: 8, size: 5, trashMult: { hp: 2.2, dmg: 1.55 }, bossMult: { hp: 10, dmg: 3.2 },
    pulls: [
      { scene: 'ragefire_chasm', label: 'Trogg tunnels', mobs: ['ragefire_trogg', 'ragefire_trogg'] },
      { scene: 'ragefire_chasm', label: 'Trogg tunnels', mobs: ['ragefire_trogg', 'earthborer'] },
      { scene: 'ragefire_chasm', label: 'Oggleflint', mobs: ['oggleflint'], boss: true },
      { scene: 'ragefire_chasm', label: 'The lava lake', mobs: ['searing_blade_cultist', 'searing_blade_cultist'] },
      { scene: 'ragefire_chasm', label: 'Taragaman the Hungerer', mobs: ['taragaman'], boss: true },
      { scene: 'ragefire_chasm', label: 'Cultist den', mobs: ['searing_blade_cultist', 'searing_blade_cultist', 'earthborer'] },
      { scene: 'ragefire_chasm', label: 'Jergosh the Invoker', mobs: ['jergosh'], boss: true },
      { scene: 'ragefire_chasm', label: 'Bazzalan', mobs: ['bazzalan'], boss: true },
    ] };
  // Group finder activities.
  D.ACTIVITIES = {
    hogger: { name: 'Wanted: Hogger', where: 'forests_edge', size: 3, minLvl: 8, desc: 'Open-world elite in Elwynn. 3 players.', boss: 'hogger',
      pulls: [
        { scene: 'forests_edge', label: 'Riverpaw camp', mobs: ['riverpaw_gnoll', 'riverpaw_gnoll'] },
        { scene: 'forests_edge', label: 'Riverpaw camp', mobs: ['riverpaw_gnoll', 'riverpaw_gnoll'] },
        { scene: 'forests_edge', label: 'Hogger', mobs: ['hogger'], boss: true }] },
    vagash: { name: 'Protecting the Herd: Vagash', where: 'amberstill_ranch', size: 3, minLvl: 8, desc: 'Open-world elite in Dun Morogh. 3 players.', boss: 'vagash',
      pulls: [
        { scene: 'amberstill_ranch', label: 'The ranch', mobs: ['snow_leopard', 'snow_leopard'] },
        { scene: 'amberstill_ranch', label: 'The ranch', mobs: ['ice_claw_bear', 'elder_crag_boar'] },
        { scene: 'amberstill_ranch', label: 'Vagash', mobs: ['vagash'], boss: true }] },
    zalazane: { name: 'Zalazane', where: 'echo_isles', size: 3, minLvl: 8, desc: 'Open-world elite on the Echo Isles. 3 players.', boss: 'zalazane',
      pulls: [
        { scene: 'echo_isles', label: 'Hexed village', mobs: ['hexed_troll', 'voodoo_troll'] },
        { scene: 'echo_isles', label: 'Hexed village', mobs: ['hexed_troll', 'hexed_troll'] },
        { scene: 'echo_isles', label: 'Zalazane', mobs: ['zalazane'], boss: true }] },
    arrachea: { name: "Arra'chea", where: 'golden_plains', size: 3, minLvl: 8, desc: 'Open-world elite in Mulgore. 3 players.', boss: 'arrachea',
      pulls: [
        { scene: 'golden_plains', label: 'The plains', mobs: ['prairie_stalker', 'prairie_stalker'] },
        { scene: 'golden_plains', label: 'The plains', mobs: ['adult_plainstrider', 'swoop'] },
        { scene: 'golden_plains', label: "Arra'chea", mobs: ['arrachea'], boss: true }] },
    maggot_eye: { name: 'Maggot Eye', where: 'garrens_haunt', size: 3, minLvl: 8, desc: "Open-world elite in Tirisfal. 3 players.", boss: 'maggot_eye',
      pulls: [
        { scene: 'garrens_haunt', label: "Garren's Haunt", mobs: ['rot_hide_gnoll', 'rot_hide_mongrel'] },
        { scene: 'garrens_haunt', label: "Garren's Haunt", mobs: ['rot_hide_mongrel', 'rot_hide_mongrel'] },
        { scene: 'garrens_haunt', label: 'Maggot Eye', mobs: ['maggot_eye'], boss: true }] },
    ragefire: { name: 'Ragefire Chasm', dungeon: 'ragefire', size: 5, minLvl: 8, desc: 'Dungeon under Orgrimmar. 5 players. Scaled for level 10.', boss: 'taragaman' },
    deadmines: { name: 'The Deadmines', dungeon: 'deadmines', size: 5, minLvl: 8, desc: 'Dungeon. 5 players. Scaled for level 10.' },
  };

  // Stamp "Drops from <boss>, <where>" onto boss loot, using the dungeon (or elite activity) each boss belongs to.
  for (const dk in D.DUNGEONS) for (const pl of D.DUNGEONS[dk].pulls) for (const mk of pl.mobs)
    for (const id of (D.MOBS[mk].loot || [])) if (I[id] && !I[id].source) I[id].source = `${D.MOBS[mk].name}, ${D.DUNGEONS[dk].name}`;
  root.D = D;
})(typeof window !== 'undefined' ? window : globalThis);
