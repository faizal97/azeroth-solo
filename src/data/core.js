// Shared game data: classes, races, abilities, gear rules and the items every zone uses.
// Zone content lives in src/data/zones/<zone>.js; load order is in src/data/files.json.
(function (root) {
  const D = {};
  root.D = D;

  D.REALM = 'Starlight';
  D.LEVEL_CAP = 20;
  D.XP_TO_LEVEL = [0, 400, 900, 1400, 2100, 2800, 3600, 4500, 5400, 6500, 8000, 9600, 11200, 12900, 14600, 16400, 17000, 18000, 19000, 20000, 21400];

  D.QUALITY = [{ name: 'Poor', color: '#9d9d9d' }, { name: 'Common', color: '#ffffff' }, { name: 'Uncommon', color: '#1eff00' }, { name: 'Rare', color: '#0070dd' }, { name: 'Epic', color: '#a335ee' }];

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

  // ---- classes, races, pets
  D.CLASSES = {
    warrior: { name: 'Warrior', color: '#C79C6E', role: 'tank', resource: 'rage', armorType: 'mail', weapons: ['sword', 'axe', 'mace'], base: { str: 23, agi: 20, sta: 22, int: 20, spi: 21 }, gain: { str: 2, agi: 1.2, sta: 2, int: 0.3, spi: 0.6 }, baseHp: -140, hpPerLvl: 12, baseMana: 0, manaPerLvl: 0, baseArmor: 60, startWeapon: 'worn_shortsword', startChest: 'recruits_vest', abilities: ['heroic_strike', 'battle_shout', 'charge', 'rend', 'thunder_clap', 'taunt', 'hamstring', 'cleave', 'bloodrage', 'retaliation'] },
    mage: { name: 'Mage', color: '#69CCF0', role: 'dps', resource: 'mana', armorType: 'cloth', weapons: ['staff', 'dagger'], base: { str: 20, agi: 20, sta: 20, int: 24, spi: 23 }, gain: { str: 0.3, agi: 0.3, sta: 1, int: 2, spi: 1.8 }, baseHp: -150, hpPerLvl: 9, baseMana: -250, manaPerLvl: 18, baseArmor: 10, startWeapon: 'bent_staff', startChest: 'apprentice_robe', abilities: ['fireball', 'frost_armor', 'frostbolt', 'fire_blast', 'arcane_missiles', 'frost_nova', 'arcane_explosion', 'flamestrike', 'mana_shield'] },
    priest: { name: 'Priest', color: '#FFFFFF', role: 'healer', resource: 'mana', armorType: 'cloth', weapons: ['mace', 'staff'], base: { str: 20, agi: 20, sta: 20, int: 22, spi: 25 }, gain: { str: 0.3, agi: 0.3, sta: 1, int: 1.8, spi: 2 }, baseHp: -150, hpPerLvl: 9, baseMana: -220, manaPerLvl: 18, baseArmor: 10, startWeapon: 'battered_mallet', startChest: 'neophyte_robe', abilities: ['smite', 'lesser_heal', 'pw_fortitude', 'sw_pain', 'pw_shield', 'renew', 'mind_blast', 'inner_fire', 'heal', 'psychic_scream'] },
    rogue: { name: 'Rogue', color: '#FFF569', role: 'dps', resource: 'energy', armorType: 'leather', weapons: ['dagger', 'sword'], base: { str: 21, agi: 23, sta: 21, int: 20, spi: 20 }, gain: { str: 1, agi: 2, sta: 1.4, int: 0.3, spi: 0.5 }, baseHp: -145, hpPerLvl: 11, baseMana: 0, manaPerLvl: 0, baseArmor: 30, startWeapon: 'worn_dagger', startChest: 'footpad_shirt', abilities: ['sinister_strike', 'eviscerate', 'gouge', 'evasion', 'slice_and_dice', 'backstab', 'garrote', 'rupture', 'kidney_shot'] },
    paladin: { name: 'Paladin', color: '#F58CBA', role: 'healer', roles: ['healer', 'tank'], resource: 'mana', armorType: 'mail', weapons: ['mace', 'sword', 'axe'], base: { str: 22, agi: 20, sta: 22, int: 20, spi: 21 }, gain: { str: 1.8, agi: 0.8, sta: 1.8, int: 1, spi: 1 }, baseHp: -140, hpPerLvl: 11, baseMana: -220, manaPerLvl: 14, baseArmor: 60, startWeapon: 'battered_mallet', startChest: 'recruits_vest', abilities: ['seal_righteousness', 'holy_light', 'devotion_aura', 'judgement', 'divine_protection', 'hammer_justice', 'blessing_might', 'lay_on_hands', 'exorcism', 'retribution_aura'] },
    warlock: { name: 'Warlock', color: '#9482C9', role: 'dps', resource: 'mana', armorType: 'cloth', weapons: ['staff', 'dagger', 'sword'], base: { str: 20, agi: 20, sta: 21, int: 23, spi: 23 }, gain: { str: 0.3, agi: 0.3, sta: 1.2, int: 1.9, spi: 1.8 }, baseHp: -150, hpPerLvl: 9, baseMana: -250, manaPerLvl: 17, baseArmor: 10, startWeapon: 'worn_dagger', startChest: 'apprentice_robe', pets: ['imp', 'voidwalker'], abilities: ['shadow_bolt', 'immolate', 'demon_skin', 'corruption', 'life_tap', 'curse_of_agony', 'searing_pain', 'shadow_ward', 'rain_of_fire', 'demon_armor'] },
    hunter: { name: 'Hunter', color: '#ABD473', role: 'dps', resource: 'mana', armorType: 'leather', ranged: true, weapons: ['axe', 'sword', 'dagger'], base: { str: 21, agi: 23, sta: 21, int: 21, spi: 22 }, gain: { str: 0.9, agi: 2, sta: 1.4, int: 0.8, spi: 0.9 }, baseHp: -145, hpPerLvl: 11, baseMana: -230, manaPerLvl: 12, baseArmor: 30, startWeapon: 'worn_axe', startChest: 'footpad_shirt', startRanged: 'worn_shortbow', pets: ['beast'], abilities: ['raptor_strike', 'serpent_sting', 'aspect_monkey', 'arcane_shot', 'hunters_mark', 'concussive_shot', 'wing_clip', 'multi_shot', 'rapid_fire', 'immolation_trap'] },
    druid: { name: 'Druid', color: '#FF7D0A', role: 'healer', roles: ['healer', 'tank', 'dps'], resource: 'mana', armorType: 'leather', weapons: ['staff', 'mace', 'dagger'], base: { str: 21, agi: 20, sta: 20, int: 22, spi: 24 }, gain: { str: 1, agi: 0.7, sta: 1.2, int: 1.6, spi: 1.8 }, baseHp: -150, hpPerLvl: 10, baseMana: -230, manaPerLvl: 16, baseArmor: 20, startWeapon: 'bent_staff', startChest: 'neophyte_robe', abilities: ['wrath', 'healing_touch', 'mark_wild', 'moonfire', 'rejuvenation', 'bear_form', 'entangling_roots', 'thorns', 'regrowth'], forms: { bear: ['bear_form', 'maul', 'growl', 'swipe'] } },
    shaman: { name: 'Shaman', color: '#0070DE', role: 'dps', roles: ['dps', 'healer'], resource: 'mana', armorType: 'leather', weapons: ['mace', 'axe', 'staff', 'dagger'], base: { str: 22, agi: 20, sta: 22, int: 21, spi: 22 }, gain: { str: 1.4, agi: 0.8, sta: 1.5, int: 1.2, spi: 1.1 }, baseHp: -145, hpPerLvl: 11, baseMana: -230, manaPerLvl: 14, baseArmor: 30, startWeapon: 'battered_mallet', startChest: 'footpad_shirt', abilities: ['lightning_bolt', 'rockbiter_weapon', 'healing_wave', 'earth_shock', 'stoneskin_totem', 'lightning_shield', 'searing_totem', 'flame_shock', 'strength_earth', 'frost_shock', 'flametongue_weapon'] },
  };

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
    human: { name: 'Human', faction: 'alliance', classes: ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid'], start: 'northshire_abbey', startZone: 'Northshire Valley' },
    dwarf: { name: 'Dwarf', faction: 'alliance', classes: ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid'], start: 'anvilmar', startZone: 'Coldridge Valley' },
    gnome: { name: 'Gnome', faction: 'alliance', classes: ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid'], start: 'anvilmar', startZone: 'Coldridge Valley' },
    nightelf: { name: 'Night Elf', faction: 'alliance', classes: ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid'], start: 'shadowglen', startZone: 'Shadowglen' },
    orc: { name: 'Orc', faction: 'horde', classes: ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid'], start: 'valley_of_trials', startZone: 'Valley of Trials' },
    troll: { name: 'Troll', faction: 'horde', classes: ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid'], start: 'valley_of_trials', startZone: 'Valley of Trials' },
    tauren: { name: 'Tauren', faction: 'horde', classes: ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid'], start: 'camp_narache', startZone: 'Camp Narache' },
    undead: { name: 'Undead', faction: 'horde', classes: ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid'], start: 'deathknell', startZone: 'Deathknell' },
  };

  D.PETS = {
    imp: { name: 'Imp', lvl: 1, hpMult: 0.55, armorMult: 0.6, noMelee: true, cost: 0.25, threatMult: 0.35, spell: { name: 'Firebolt', icon: 'firebolt', every: 2.2, dmg: [5, 8], perLvl: 1.7, school: 'fire' }, names: ['Zillnoz', 'Jubnar', 'Rakzik', 'Grubnik', 'Flikkit', 'Yazzik', 'Kizzle', 'Nozzrik'] },
    voidwalker: { name: 'Voidwalker', lvl: 10, hpMult: 1.5, armorMult: 3, dmgMult: 0.55, threatMult: 3, cost: 0.4, torment: { every: 5 }, names: ['Sarkoth', 'Jaznar', 'Galvuul', 'Morthul', 'Vazgul', 'Ozrath'] },
    beast: { name: 'Beast', lvl: 10, hpMult: 1.1, armorMult: 1.6, dmgMult: 0.7, threatMult: 1.3, cost: 0.3, torment: { every: 6 }, tamed: true },
  };

  // ---- abilities
  D.ABILITIES = {
    // shared
    attack: { name: 'Attack', icon: 'attack', desc: 'Toggle auto-attack.', auto: true },
    eat: { name: 'Eat', icon: 'bread', desc: 'Eat food out of combat.', consumable: 'food' },
    drink: { name: 'Drink', icon: 'water', desc: 'Drink water out of combat.', consumable: 'drink' },
    // warrior
    heroic_strike: { name: 'Heroic Strike', cls: 'warrior', lvl: 1, cost: 15, cd: 0, target: 'enemy', dmg: { weapon: true, bonus: [11, 11], perLvl: 1.6 }, threat: 1.5, desc: 'A strong attack that adds {b} damage to a weapon hit.' },
    battle_shout: { name: 'Battle Shout', cls: 'warrior', lvl: 1, cost: 10, cd: 0, target: 'party', buff: { id: 'battle_shout', dur: 120, stats: { ap: 20 }, perLvl: { ap: 2 } }, threat: 5, desc: 'Raises the attack power of your party by {ap}.' },
    charge: { name: 'Charge', cls: 'warrior', lvl: 4, cost: 0, cd: 15, target: 'enemy', opener: true, gcd: false, rage: 12, stun: 1, desc: 'Charge an enemy you are not fighting yet. Generates 12 rage and stuns for 1 sec.' },
    rend: { name: 'Rend', cls: 'warrior', lvl: 4, cost: 10, cd: 0, target: 'enemy', dot: { id: 'rend', ticks: 3, every: 3, dmg: 5, perLvl: 1.1, school: 'physical' }, desc: 'Wounds the target for {d} damage over 9 sec.' },
    thunder_clap: { name: 'Thunder Clap', cls: 'warrior', lvl: 6, cost: 20, cd: 6, target: 'aoe', dmg: { base: [10, 10], perLvl: 1.2, school: 'physical' }, slow: { pct: 10, dur: 10 }, threat: 2.5, desc: 'Hits all nearby enemies for {b} and slows their attacks.' },
    taunt: { name: 'Taunt', cls: 'warrior', lvl: 10, cost: 0, cd: 10, target: 'enemy', gcd: false, taunt: true, desc: 'Forces the enemy to attack you and matches the highest threat on it.' },
    hamstring: { name: 'Hamstring', cls: 'warrior', lvl: 12, cost: 10, cd: 0, target: 'enemy', dmg: { base: [5, 5], perLvl: 0.6, school: 'physical' }, slow: { pct: 50, dur: 15 }, desc: 'Maims the enemy for {b} damage and slows its attacks by 50% for 15 sec.' },
    cleave: { name: 'Cleave', cls: 'warrior', lvl: 14, cost: 20, cd: 6, target: 'aoe', dmg: { base: [12, 12], perLvl: 1.5, school: 'physical' }, threat: 1.2, desc: 'A sweeping strike that hits every enemy in front of you for {b}.' },
    // paladin
    seal_righteousness: { name: 'Seal of Righteousness', cls: 'paladin', lvl: 1, cost: 20, costPerLvl: 3, cd: 0, target: 'self', combatOnly: true, buff: { id: 'seal', dur: 30, seal: { base: 3, perLvl: 1.1 } }, desc: 'Each melee hit deals extra Holy damage for 30 sec. Judgement releases it.' },
    holy_light: { name: 'Holy Light', cls: 'paladin', lvl: 1, cost: 35, costPerLvl: 5, cd: 0, cast: 2.5, target: 'ally', heal: { base: [42, 51], perLvl: 8, coef: 0.71 }, desc: 'Heals a friendly target for {h}.' },
    devotion_aura: { name: 'Devotion Aura', cls: 'paladin', lvl: 1, cost: 0, cd: 0, target: 'party', buff: { id: 'devotion_aura', dur: 1800, stats: { armor: 35 }, perLvl: { armor: 8 } }, desc: 'Raises the armor of your party by {armor}.' },
    judgement: { name: 'Judgement', cls: 'paladin', lvl: 4, cost: 25, costPerLvl: 2, cd: 10, target: 'enemy', needSeal: true, dmg: { base: [15, 18], perLvl: 3.4, coef: 0.45, school: 'holy' }, threat: 1.5, desc: 'Unleashes your seal on the enemy for {b} Holy damage.' },
    divine_protection: { name: 'Divine Protection', cls: 'paladin', lvl: 6, cost: 15, costPerLvl: 2, cd: 300, target: 'self', gcd: false, combatOnly: true, buff: { id: 'divine_protection', dur: 6, immune: true }, desc: 'You are immune to all damage for 6 sec. 5 min cooldown.' },
    hammer_justice: { name: 'Hammer of Justice', cls: 'paladin', lvl: 8, cost: 30, costPerLvl: 2, cd: 60, target: 'enemy', stun: 3, desc: 'Stuns the target for 3 sec.' },
    blessing_might: { name: 'Blessing of Might', cls: 'paladin', lvl: 12, cost: 30, costPerLvl: 2, cd: 0, target: 'party', buff: { id: 'blessing_might', dur: 300, stats: { ap: 20 }, perLvl: { ap: 3 } }, desc: 'Raises the attack power of your party by {ap} for 5 min.' },
    lay_on_hands: { name: 'Lay on Hands', cls: 'paladin', lvl: 14, cost: 0, cd: 600, target: 'ally', heal: { base: [400, 400], perLvl: 30 }, desc: 'Heals a friendly target for {h}. 10 min cooldown.' },
    // hunter
    raptor_strike: { name: 'Raptor Strike', cls: 'hunter', lvl: 1, cost: 15, costPerLvl: 2, cd: 6, target: 'enemy', dmg: { weapon: true, bonus: [5, 5], perLvl: 1 }, desc: 'A strong melee attack that adds {b} damage.' },
    serpent_sting: { name: 'Serpent Sting', cls: 'hunter', lvl: 4, cost: 15, costPerLvl: 2, cd: 0, target: 'enemy', dot: { id: 'serpent_sting', ticks: 5, every: 3, dmg: 4, perLvl: 1.2, school: 'nature' }, desc: 'Stings the target for {d} Nature damage over 15 sec.' },
    aspect_monkey: { name: 'Aspect of the Monkey', cls: 'hunter', lvl: 4, cost: 20, cd: 0, target: 'self', buff: { id: 'aspect_monkey', dur: 1800, stats: { dodge: 8 } }, desc: 'Raises your chance to dodge by 8%.' },
    arcane_shot: { name: 'Arcane Shot', cls: 'hunter', lvl: 6, cost: 25, costPerLvl: 3, cd: 6, target: 'enemy', dmg: { base: [13, 13], perLvl: 2.4, rapCoef: 0.15, school: 'arcane' }, desc: 'An instant shot for {b} Arcane damage.' },
    hunters_mark: { name: "Hunter's Mark", cls: 'hunter', lvl: 6, cost: 15, costPerLvl: 1, cd: 0, target: 'enemy', debuff: { id: 'hunters_mark', dur: 120 }, desc: 'Marks the target. You and your pet deal 10% more damage to it.' },
    concussive_shot: { name: 'Concussive Shot', cls: 'hunter', lvl: 8, cost: 15, costPerLvl: 2, cd: 12, target: 'enemy', slow: { pct: 50, dur: 4 }, desc: 'Dazes the target, slowing its attacks by 50% for 4 sec.' },
    wing_clip: { name: 'Wing Clip', cls: 'hunter', lvl: 12, cost: 30, costPerLvl: 2, cd: 0, target: 'enemy', dmg: { base: [6, 6], perLvl: 0.8, school: 'physical' }, slow: { pct: 50, dur: 10 }, desc: 'Clips the enemy for {b} damage and slows its attacks by 50% for 10 sec.' },
    multi_shot: { name: 'Multi-Shot', cls: 'hunter', lvl: 14, cost: 60, costPerLvl: 4, cd: 10, target: 'aoe', dmg: { base: [14, 14], perLvl: 1.6, rapCoef: 0.2, school: 'physical' }, desc: 'Fires a volley at every nearby enemy for {b} damage.' },
    // rogue
    sinister_strike: { name: 'Sinister Strike', cls: 'rogue', lvl: 1, cost: 45, cd: 0, target: 'enemy', gcdLen: 1, dmg: { weapon: true, bonus: [3, 3], perLvl: 0.9 }, cp: 1, desc: 'An instant strike that deals weapon damage plus {b}. Awards 1 combo point.' },
    eviscerate: { name: 'Eviscerate', cls: 'rogue', lvl: 1, cost: 35, cd: 0, target: 'enemy', gcdLen: 1, finisher: true, dmg: { perCp: [8, 14], perLvl: 1.4, apCoef: 0.03, school: 'physical' }, desc: 'Finishing move. Damage rises with each combo point.' },
    gouge: { name: 'Gouge', cls: 'rogue', lvl: 6, cost: 45, cd: 10, target: 'enemy', gcdLen: 1, dmg: { base: [8, 8], perLvl: 0.7, school: 'physical' }, stun: 4, cp: 1, desc: 'Incapacitates the target for 4 sec. Awards 1 combo point.' },
    evasion: { name: 'Evasion', cls: 'rogue', lvl: 8, cost: 0, cd: 120, target: 'self', gcd: false, buff: { id: 'evasion', dur: 15, stats: { dodge: 50 } }, desc: 'Dodge chance raised by 50% for 15 sec.' },
    slice_and_dice: { name: 'Slice and Dice', cls: 'rogue', lvl: 10, cost: 25, cd: 0, target: 'self', gcdLen: 1, finisher: true, buff: { id: 'slice_and_dice', dur: 6, perCpDur: 3, stats: { haste: 20 } }, desc: 'Finishing move. Attack speed +20%. Lasts longer per combo point.' },
    backstab: { name: 'Backstab', cls: 'rogue', lvl: 12, cost: 60, cd: 0, target: 'enemy', gcdLen: 1, dmg: { weapon: true, bonus: [15, 15], perLvl: 1.5 }, cp: 1, desc: 'A vicious stab for weapon damage plus {b}. Awards 1 combo point.' },
    garrote: { name: 'Garrote', cls: 'rogue', lvl: 14, cost: 50, cd: 0, target: 'enemy', opener: true, gcdLen: 1, dot: { id: 'garrote', ticks: 6, every: 3, dmg: 5, perLvl: 1.2, school: 'physical' }, cp: 1, desc: 'Opener. Garrotes an enemy you are not fighting yet for {d} damage over 18 sec. Awards 1 combo point.' },
    // priest
    smite: { name: 'Smite', cls: 'priest', lvl: 1, cost: 20, costPerLvl: 3, cd: 0, cast: 2, target: 'enemy', dmg: { base: [15, 20], perLvl: 2.8, coef: 0.71, school: 'holy' }, desc: 'Smite an enemy for {b} Holy damage.' },
    lesser_heal: { name: 'Lesser Heal', cls: 'priest', lvl: 1, cost: 30, costPerLvl: 4, cd: 0, cast: 2, target: 'ally', heal: { base: [46, 56], perLvl: 7, coef: 0.85 }, desc: 'Heal a friendly target for {h}.' },
    pw_fortitude: { name: 'Power Word: Fortitude', cls: 'priest', lvl: 1, cost: 60, cd: 0, target: 'party', buff: { id: 'pw_fortitude', dur: 1800, stats: { sta: 3 }, perLvl: { sta: 0.8 } }, desc: 'Power infuses your party, raising Stamina by {sta}.' },
    sw_pain: { name: 'Shadow Word: Pain', cls: 'priest', lvl: 4, cost: 25, costPerLvl: 3, cd: 0, target: 'enemy', dot: { id: 'sw_pain', ticks: 6, every: 3, dmg: 5, perLvl: 1.1, coef: 0.1, school: 'shadow' }, desc: 'A word of darkness that deals {d} Shadow damage over 18 sec.' },
    pw_shield: { name: 'Power Word: Shield', cls: 'priest', lvl: 6, cost: 45, costPerLvl: 4, cd: 4, target: 'ally', shield: { base: 44, perLvl: 6, coef: 0.1, dur: 30 }, weakened: 15, desc: 'Absorbs {s} damage for 30 sec. The target cannot be shielded again for 15 sec.' },
    renew: { name: 'Renew', cls: 'priest', lvl: 8, cost: 40, costPerLvl: 4, cd: 0, target: 'ally', hot: { id: 'renew', ticks: 5, every: 3, heal: 9, perLvl: 1.6, coef: 0.2 }, desc: 'Heals the target for {hh} over 15 sec.' },
    mind_blast: { name: 'Mind Blast', cls: 'priest', lvl: 12, cost: 50, costPerLvl: 4, cd: 8, cast: 1.5, target: 'enemy', dmg: { base: [36, 40], perLvl: 3, coef: 0.43, school: 'shadow' }, threat: 1.5, desc: "Blasts the target's mind for {b} Shadow damage." },
    inner_fire: { name: 'Inner Fire', cls: 'priest', lvl: 14, cost: 60, costPerLvl: 2, cd: 0, target: 'self', buff: { id: 'inner_fire', dur: 600, stats: { armor: 150, ap: 10 }, perLvl: { armor: 10, ap: 1 } }, desc: 'Raises your armor by {armor} and your attack power for 10 min.' },
    // shaman
    lightning_bolt: { name: 'Lightning Bolt', cls: 'shaman', lvl: 1, cost: 15, costPerLvl: 3, cd: 0, cast: 2, target: 'enemy', dmg: { base: [13, 16], perLvl: 3, coef: 0.79, school: 'nature' }, desc: 'Casts a bolt of lightning for {b} Nature damage.' },
    rockbiter_weapon: { name: 'Rockbiter Weapon', cls: 'shaman', lvl: 1, cost: 20, costPerLvl: 2, cd: 0, target: 'self', buff: { id: 'rockbiter', dur: 300, seal: { base: 2, perLvl: 1, school: 'physical' } }, desc: 'Imbues your weapon with earth for 5 min: each hit deals extra damage.' },
    healing_wave: { name: 'Healing Wave', cls: 'shaman', lvl: 1, cost: 25, costPerLvl: 5, cd: 0, cast: 2.5, target: 'ally', heal: { base: [36, 47], perLvl: 8, coef: 0.86 }, desc: 'Heals a friendly target for {h}.' },
    earth_shock: { name: 'Earth Shock', cls: 'shaman', lvl: 4, cost: 25, costPerLvl: 3, cd: 6, target: 'enemy', dmg: { base: [19, 22], perLvl: 2.5, coef: 0.39, school: 'nature' }, threat: 2, desc: 'Instantly shocks the target for {b} Nature damage.' },
    stoneskin_totem: { name: 'Stoneskin Totem', cls: 'shaman', lvl: 4, cost: 25, costPerLvl: 2, cd: 0, target: 'party', buff: { id: 'stoneskin', dur: 120, stats: { armor: 25 }, perLvl: { armor: 6 } }, desc: "Drops a totem that raises your party's armor by {armor}." },
    lightning_shield: { name: 'Lightning Shield', cls: 'shaman', lvl: 8, cost: 30, costPerLvl: 2, cd: 0, target: 'self', buff: { id: 'lightning_shield', dur: 600, thorns: { base: 13, perLvl: 2.5, charges: 3 } }, desc: 'Three orbs of lightning strike enemies that hit you in melee.' },
    searing_totem: { name: 'Searing Totem', cls: 'shaman', lvl: 10, cost: 25, costPerLvl: 2, cd: 0, target: 'enemy', dot: { id: 'searing_totem', ticks: 12, every: 2.5, dmg: 5, perLvl: 1.2, coef: 0.08, school: 'fire' }, desc: 'Drops a totem that burns the enemy for {d} Fire damage over 30 sec.' },
    flame_shock: { name: 'Flame Shock', cls: 'shaman', lvl: 12, cost: 55, costPerLvl: 3, cd: 6, target: 'enemy', dmg: { base: [25, 25], perLvl: 1.8, coef: 0.15, school: 'fire' }, dot: { id: 'flame_shock', ticks: 4, every: 3, dmg: 6, perLvl: 1, coef: 0.1, school: 'fire' }, desc: 'Burns the enemy for {b} Fire damage and {d} more over 12 sec.' },
    strength_earth: { name: 'Strength of Earth Totem', cls: 'shaman', lvl: 14, cost: 30, costPerLvl: 2, cd: 0, target: 'party', buff: { id: 'strength_earth', dur: 120, stats: { str: 10 }, perLvl: { str: 0.8 } }, desc: "Drops a totem that raises your party's Strength by {str}." },
    // mage
    fireball: { name: 'Fireball', cls: 'mage', lvl: 1, cost: 30, costPerLvl: 4, cd: 0, cast: 2, target: 'enemy', dmg: { base: [14, 22], perLvl: 3.2, coef: 0.8, school: 'fire' }, dot: { id: 'fireball_burn', ticks: 2, every: 2, dmg: 2, perLvl: 0.3, school: 'fire' }, desc: 'Hurls a fiery ball for {b} Fire damage.' },
    frost_armor: { name: 'Frost Armor', cls: 'mage', lvl: 1, cost: 60, cd: 0, target: 'self', gcd: true, buff: { id: 'frost_armor', dur: 600, stats: { armor: 30 }, perLvl: { armor: 6 }, chillAttackers: true }, desc: 'Increases armor by {armor}. Melee attackers are slowed.' },
    frostbolt: { name: 'Frostbolt', cls: 'mage', lvl: 4, cost: 30, costPerLvl: 4, cd: 0, cast: 1.8, target: 'enemy', dmg: { base: [16, 20], perLvl: 2.6, coef: 0.8, school: 'frost' }, slow: { pct: 40, dur: 5 }, desc: 'Launches a bolt of frost for {b} Frost damage and slows the target.' },
    fire_blast: { name: 'Fire Blast', cls: 'mage', lvl: 6, cost: 40, costPerLvl: 3, cd: 8, target: 'enemy', dmg: { base: [24, 30], perLvl: 2.4, coef: 0.43, school: 'fire' }, desc: 'Blasts the enemy for {b} Fire damage. Instant.' },
    arcane_missiles: { name: 'Arcane Missiles', cls: 'mage', lvl: 8, cost: 85, costPerLvl: 5, cd: 0, cast: 3, channel: 3, target: 'enemy', dmg: { base: [12, 12], perLvl: 1.5, coef: 0.24, school: 'arcane' }, desc: 'Fires 3 missiles over 3 sec, {b} Arcane damage each.' },
    frost_nova: { name: 'Frost Nova', cls: 'mage', lvl: 12, cost: 55, costPerLvl: 3, cd: 25, target: 'aoe', dmg: { base: [8, 10], perLvl: 1, coef: 0.1, school: 'frost' }, slow: { pct: 60, dur: 8 }, desc: 'Blasts nearby enemies for {b} Frost damage and slows them for 8 sec.' },
    arcane_explosion: { name: 'Arcane Explosion', cls: 'mage', lvl: 14, cost: 75, costPerLvl: 4, cd: 0, target: 'aoe', dmg: { base: [14, 16], perLvl: 1.6, coef: 0.14, school: 'arcane' }, desc: 'A wave of arcane energy hits all nearby enemies for {b} Arcane damage.' },
    // warlock
    shadow_bolt: { name: 'Shadow Bolt', cls: 'warlock', lvl: 1, cost: 25, costPerLvl: 4, cd: 0, cast: 2, target: 'enemy', dmg: { base: [13, 18], perLvl: 3.3, coef: 0.86, school: 'shadow' }, desc: 'Sends a bolt of shadow for {b} Shadow damage.' },
    immolate: { name: 'Immolate', cls: 'warlock', lvl: 1, cost: 25, costPerLvl: 4, cd: 0, cast: 1.5, target: 'enemy', dmg: { base: [10, 12], perLvl: 1.6, coef: 0.2, school: 'fire' }, dot: { id: 'immolate', ticks: 5, every: 3, dmg: 2, perLvl: 0.8, coef: 0.1, school: 'fire' }, desc: 'Burns the enemy for {b} Fire damage and {d} more over 15 sec.' },
    demon_skin: { name: 'Demon Skin', cls: 'warlock', lvl: 1, cost: 30, costPerLvl: 2, cd: 0, target: 'self', buff: { id: 'demon_skin', dur: 1800, stats: { armor: 30 }, perLvl: { armor: 5 } }, desc: 'Raises your armor by {armor}.' },
    corruption: { name: 'Corruption', cls: 'warlock', lvl: 4, cost: 25, costPerLvl: 3, cd: 0, cast: 1.5, target: 'enemy', dot: { id: 'corruption', ticks: 6, every: 3, dmg: 4, perLvl: 1.2, coef: 0.15, school: 'shadow' }, desc: 'Corrupts the target for {d} Shadow damage over 18 sec.' },
    life_tap: { name: 'Life Tap', cls: 'warlock', lvl: 6, cost: 0, cd: 0, target: 'self', lifetap: { base: 20, perLvl: 3 }, desc: 'Converts {lt} health into {lt} mana.' },
    curse_of_agony: { name: 'Curse of Agony', cls: 'warlock', lvl: 8, cost: 25, costPerLvl: 2, cd: 0, target: 'enemy', dot: { id: 'curse_of_agony', ticks: 8, every: 3, dmg: 3, perLvl: 0.9, coef: 0.1, school: 'shadow' }, desc: 'Curses the target with agony: {d} Shadow damage over 24 sec.' },
    searing_pain: { name: 'Searing Pain', cls: 'warlock', lvl: 12, cost: 30, costPerLvl: 3, cd: 0, cast: 1.5, target: 'enemy', dmg: { base: [18, 22], perLvl: 2.2, coef: 0.43, school: 'fire' }, threat: 2, desc: 'Sears the target for {b} Fire damage. Causes a lot of threat.' },
    shadow_ward: { name: 'Shadow Ward', cls: 'warlock', lvl: 14, cost: 40, costPerLvl: 3, cd: 30, target: 'self', gcd: false, shield: { base: 60, perLvl: 8, coef: 0.1, dur: 30 }, weakened: 0.1, desc: 'A dark barrier absorbs {s} damage for 30 sec.' },
    // druid
    wrath: { name: 'Wrath', cls: 'druid', lvl: 1, cost: 20, costPerLvl: 3, cd: 0, cast: 2, target: 'enemy', dmg: { base: [13, 16], perLvl: 2.9, coef: 0.57, school: 'nature' }, desc: 'Hurls a bolt of nature for {b} Nature damage.' },
    healing_touch: { name: 'Healing Touch', cls: 'druid', lvl: 1, cost: 25, costPerLvl: 5, cd: 0, cast: 2.5, target: 'ally', heal: { base: [40, 55], perLvl: 8, coef: 0.8 }, desc: 'Heals a friendly target for {h}.' },
    mark_wild: { name: 'Mark of the Wild', cls: 'druid', lvl: 1, cost: 20, costPerLvl: 3, cd: 0, target: 'party', buff: { id: 'mark_wild', dur: 1800, stats: { armor: 25, str: 1, agi: 1, sta: 1, int: 1, spi: 1 }, perLvl: { armor: 5, str: 0.2, agi: 0.2, sta: 0.2, int: 0.2, spi: 0.2 } }, desc: 'Raises armor by {armor} and all attributes for your party.' },
    moonfire: { name: 'Moonfire', cls: 'druid', lvl: 4, cost: 25, costPerLvl: 3, cd: 0, target: 'enemy', dmg: { base: [9, 12], perLvl: 1.6, coef: 0.15, school: 'arcane' }, dot: { id: 'moonfire', ticks: 3, every: 3, dmg: 3, perLvl: 0.8, school: 'arcane' }, desc: 'Burns the enemy for {b} Arcane damage and {d} more over 9 sec.' },
    rejuvenation: { name: 'Rejuvenation', cls: 'druid', lvl: 4, cost: 25, costPerLvl: 3, cd: 0, target: 'ally', hot: { id: 'rejuvenation', ticks: 4, every: 3, heal: 8, perLvl: 1.8, coef: 0.2 }, desc: 'Heals the target for {hh} over 12 sec.' },
    bear_form: { name: 'Bear Form', cls: 'druid', lvl: 10, cost: 55, cd: 0, target: 'self', shapeshift: 'bear', combatOnly: true, desc: 'Shapeshift into a bear: much more armor and health, attacks use rage. Cast again to change back.' },
    maul: { name: 'Maul', cls: 'druid', lvl: 10, cost: 15, cd: 0, target: 'enemy', form: 'bear', dmg: { weapon: true, bonus: [18, 18], perLvl: 1.5 }, threat: 1.75, desc: 'A heavy swipe that adds {b} damage and extra threat.' },
    growl: { name: 'Growl', cls: 'druid', lvl: 10, cost: 0, cd: 10, target: 'enemy', gcd: false, taunt: true, form: 'bear', desc: 'Forces the enemy to attack you.' },
    entangling_roots: { name: 'Entangling Roots', cls: 'druid', lvl: 12, cost: 50, costPerLvl: 3, cd: 0, cast: 1.5, target: 'enemy', dot: { id: 'entangling_roots', ticks: 4, every: 3, dmg: 4, perLvl: 0.9, school: 'nature' }, slow: { pct: 75, dur: 12 }, desc: 'Roots bind the enemy: it slows by 75% and takes {d} Nature damage over 12 sec.' },
    thorns: { name: 'Thorns', cls: 'druid', lvl: 14, cost: 35, costPerLvl: 2, cd: 0, target: 'self', buff: { id: 'thorns', dur: 600, thorns: { base: 3, perLvl: 0.6, charges: 20 } }, desc: 'Thorns sprout from you: enemies that hit you in melee take Nature damage.' },
    // ---- levels 16 and 18 (v2.1), built only from mechanics the engine already has
    bloodrage: { name: 'Bloodrage', cls: 'warrior', lvl: 16, cost: 0, cd: 60, target: 'self', gcd: false, combatOnly: true, rage: 20, desc: 'Generates 20 rage instantly. 1 min cooldown.' },
    retaliation: { name: 'Retaliation', cls: 'warrior', lvl: 18, cost: 0, cd: 300, target: 'self', gcd: false, combatOnly: true, buff: { id: 'retaliation', dur: 15, thorns: { base: 8, perLvl: 1.2, charges: 12 } }, desc: 'For 15 sec, strikes back at every enemy that hits you in melee. 5 min cooldown.' },
    flamestrike: { name: 'Flamestrike', cls: 'mage', lvl: 16, cost: 110, costPerLvl: 4, cd: 0, cast: 3, target: 'aoe', dmg: { base: [52, 60], perLvl: 2.4, coef: 0.24, school: 'fire' }, desc: 'Calls down a pillar of fire on all nearby enemies for {b} Fire damage.' },
    mana_shield: { name: 'Mana Shield', cls: 'mage', lvl: 18, cost: 60, costPerLvl: 3, cd: 20, target: 'self', gcd: false, shield: { base: 90, perLvl: 9, coef: 0.1, dur: 60 }, weakened: 0.1, desc: 'A shield of mana absorbs {s} damage for 1 min.' },
    heal: { name: 'Heal', cls: 'priest', lvl: 16, cost: 80, costPerLvl: 5, cd: 0, cast: 3, target: 'ally', heal: { base: [130, 160], perLvl: 12, coef: 0.9 }, desc: 'A strong, slow heal on a friendly target for {h}.' },
    psychic_scream: { name: 'Psychic Scream', cls: 'priest', lvl: 18, cost: 50, costPerLvl: 2, cd: 30, target: 'self', combatOnly: true, stompAll: 3, desc: 'A terrifying scream: nearby enemies are frozen in fear for 3 sec. 30 sec cooldown.' },
    rupture: { name: 'Rupture', cls: 'rogue', lvl: 16, cost: 25, cd: 0, target: 'enemy', gcdLen: 1.0, finisher: true, dot: { id: 'rupture', ticks: 5, every: 2, dmg: 9, perLvl: 1.6, school: 'physical' }, desc: 'Finishing move. The target bleeds for {d} damage over 10 sec.' },
    kidney_shot: { name: 'Kidney Shot', cls: 'rogue', lvl: 18, cost: 25, cd: 20, target: 'enemy', gcdLen: 1.0, finisher: true, stun: 3, desc: 'Finishing move. Stuns the target for 3 sec. 20 sec cooldown.' },
    exorcism: { name: 'Exorcism', cls: 'paladin', lvl: 16, cost: 50, costPerLvl: 3, cd: 15, target: 'enemy', dmg: { base: [45, 52], perLvl: 3, coef: 0.43, school: 'holy' }, desc: 'Blasts the enemy with holy light for {b} Holy damage. 15 sec cooldown.' },
    retribution_aura: { name: 'Retribution Aura', cls: 'paladin', lvl: 18, cost: 0, cd: 0, target: 'party', buff: { id: 'retribution_aura', dur: 1800, thorns: { base: 5, perLvl: 0.6, charges: 60 } }, desc: 'Your party deals Holy damage to every enemy that hits them in melee.' },
    rain_of_fire: { name: 'Rain of Fire', cls: 'warlock', lvl: 16, cost: 110, costPerLvl: 4, cd: 0, cast: 3, target: 'aoe', dmg: { base: [45, 52], perLvl: 2.2, coef: 0.25, school: 'fire' }, desc: 'Fire rains down on all nearby enemies for {b} Fire damage.' },
    demon_armor: { name: 'Demon Armor', cls: 'warlock', lvl: 18, cost: 60, costPerLvl: 3, cd: 0, target: 'self', buff: { id: 'demon_armor', dur: 1800, stats: { armor: 110, sta: 4 }, perLvl: { armor: 10, sta: 0.2 } }, desc: 'Demonic armor raises your armor by {armor} and your Stamina.' },
    rapid_fire: { name: 'Rapid Fire', cls: 'hunter', lvl: 16, cost: 40, cd: 180, target: 'self', gcd: false, combatOnly: true, buff: { id: 'rapid_fire', dur: 15, stats: { haste: 40 } }, desc: 'Shoot 40% faster for 15 sec. 3 min cooldown.' },
    immolation_trap: { name: 'Immolation Trap', cls: 'hunter', lvl: 18, cost: 50, costPerLvl: 2, cd: 15, target: 'enemy', dot: { id: 'immolation_trap', ticks: 5, every: 3, dmg: 10, perLvl: 1.6, school: 'fire' }, desc: 'A fire trap burns the enemy for {d} Fire damage over 15 sec.' },
    regrowth: { name: 'Regrowth', cls: 'druid', lvl: 16, cost: 80, costPerLvl: 4, cd: 0, cast: 2, target: 'ally', heal: { base: [80, 95], perLvl: 7, coef: 0.5 }, hot: { id: 'regrowth', ticks: 7, every: 3, heal: 6, perLvl: 1.2, coef: 0.1 }, desc: 'Heals a friendly target for {h} and {hh} more over 21 sec.' },
    swipe: { name: 'Swipe', cls: 'druid', lvl: 18, cost: 20, cd: 0, target: 'aoe', form: 'bear', dmg: { weapon: true, bonus: [10, 10], perLvl: 0.8 }, threat: 1.5, desc: 'Swipes every nearby enemy for weapon damage plus {b}.' },
    frost_shock: { name: 'Frost Shock', cls: 'shaman', lvl: 16, cost: 70, costPerLvl: 3, cd: 6, target: 'enemy', dmg: { base: [45, 50], perLvl: 2.5, coef: 0.39, school: 'frost' }, slow: { pct: 50, dur: 8 }, desc: 'Shocks the target with frost for {b} Frost damage and slows it.' },
    flametongue_weapon: { name: 'Flametongue Weapon', cls: 'shaman', lvl: 18, cost: 30, costPerLvl: 2, cd: 0, target: 'self', buff: { id: 'rockbiter', dur: 300, seal: { base: 5, perLvl: 1.3, school: 'fire' } }, desc: 'Imbues your weapon with fire for 5 min: each hit deals extra Fire damage. Replaces Rockbiter.' },
    // racial actives (combat only, off the global cooldown)
    every_man: { name: 'Every Man for Himself', racial: true, lvl: 1, cost: 0, cd: 120, target: 'self', gcd: false, combatOnly: true, freeOf: 'stun', desc: 'Breaks free of stuns and slows. 2 min cooldown.' },
    stoneform: { name: 'Stoneform', racial: true, lvl: 1, cost: 0, cd: 120, target: 'self', gcd: false, combatOnly: true, cleanse: true, buff: { id: 'stoneform', dur: 8, stats: { armor: 10 }, perLvl: { armor: 6 } }, desc: 'Turns your skin to stone: more armor, and bleeds and poisons are removed. 8 sec.' },
    escape_artist: { name: 'Escape Artist', racial: true, lvl: 1, cost: 0, cd: 60, target: 'self', gcd: false, combatOnly: true, freeOf: 'stun', desc: 'Escapes stuns and slows. 1 min cooldown.' },
    shadowmeld: { name: 'Shadowmeld', racial: true, lvl: 1, cost: 0, cd: 120, target: 'self', gcd: false, combatOnly: true, dropThreat: true, desc: 'Fade into the shadows: enemies lose track of you and all your threat is wiped. 2 min cooldown.' },
    blood_fury: { name: 'Blood Fury', racial: true, lvl: 1, cost: 0, cd: 120, target: 'self', gcd: false, combatOnly: true, bloodFury: true, desc: 'Attack power +25% for 15 sec. 2 min cooldown.' },
    berserking: { name: 'Berserking', racial: true, lvl: 1, cost: 0, cd: 180, target: 'self', gcd: false, combatOnly: true, berserk: true, desc: 'Attack and casting speed +10% to +30%, more when you are hurt. 10 sec. 3 min cooldown.' },
    war_stomp: { name: 'War Stomp', racial: true, lvl: 1, cost: 0, cd: 120, target: 'self', gcd: false, combatOnly: true, stompAll: 2, desc: 'Stomps the ground, stunning nearby enemies for 2 sec. 2 min cooldown.' },
    will_forsaken: { name: 'Will of the Forsaken', racial: true, lvl: 1, cost: 0, cd: 120, target: 'self', gcd: false, combatOnly: true, freeOf: 'stun', stunImmune: 5, desc: 'Breaks free of stuns and slows, and ignores new stuns for 5 sec. 2 min cooldown.' },
  };

  // ---- items: D.item(id, fields). Zone files add their own.
  D.ITEMS = {};
  D.item = (id, o) => { D.ITEMS[id] = Object.assign({ id }, o); };
  D.item('worn_shortsword', { name: 'Worn Shortsword', slot: 'weapon', wtype: 'sword', q: 1, lvl: 1, dmg: [2, 5], speed: 1.9, icon: 'sword', sell: 7 });
  D.item('bent_staff', { name: 'Bent Staff', slot: 'weapon', wtype: 'staff', q: 1, lvl: 1, dmg: [3, 5], speed: 2.9, icon: 'staff', sell: 9 });
  D.item('battered_mallet', { name: 'Battered Mallet', slot: 'weapon', wtype: 'mace', q: 1, lvl: 1, dmg: [2, 5], speed: 2, icon: 'mace', sell: 7 });
  D.item('worn_dagger', { name: 'Worn Dagger', slot: 'weapon', wtype: 'dagger', q: 1, lvl: 1, dmg: [1, 3], speed: 1.6, icon: 'dagger', sell: 7 });
  D.item('worn_axe', { name: 'Worn Axe', slot: 'weapon', wtype: 'axe', q: 1, lvl: 1, dmg: [2, 5], speed: 2.1, icon: 'axe', sell: 7 });
  D.item('worn_shortbow', { name: 'Worn Shortbow', slot: 'ranged', wtype: 'bow', q: 1, lvl: 1, dmg: [2, 5], speed: 2.3, icon: 'bow', sell: 7 });
  D.item('militia_longbow', { name: 'Militia Longbow', slot: 'ranged', wtype: 'bow', q: 2, lvl: 9, dmg: [10, 19], speed: 2.8, stats: { agi: 3 }, icon: 'bow', sell: 180, look: ['ranged', 'militia_longbow'], source: 'Quest: Wanted: Hogger' });
  D.item('recruits_vest', { name: "Recruit's Vest", slot: 'chest', atype: 'mail', q: 1, lvl: 1, armor: 22, icon: 'chest_mail', sell: 1 });
  D.item('apprentice_robe', { name: "Apprentice's Robe", slot: 'chest', atype: 'cloth', q: 1, lvl: 1, armor: 5, icon: 'chest_cloth', sell: 1 });
  D.item('neophyte_robe', { name: "Neophyte's Robe", slot: 'chest', atype: 'cloth', q: 1, lvl: 1, armor: 5, icon: 'chest_cloth', sell: 1 });
  D.item('footpad_shirt', { name: "Footpad's Vest", slot: 'chest', atype: 'leather', q: 1, lvl: 1, armor: 12, icon: 'chest_leather', sell: 1 });
  D.item('hearthstone', { name: 'Hearthstone', slot: 'special', q: 1, lvl: 1, icon: 'hearthstone', noSell: true, desc: "Returns you to Lion's Pride Inn. 15 min cooldown." });
  D.item('tough_bread', { name: 'Tough Hunk of Bread', slot: 'food', q: 1, lvl: 1, restore: 61, icon: 'bread', sell: 1, cost: 5 });
  D.item('fresh_bread', { name: 'Freshly Baked Bread', slot: 'food', q: 1, lvl: 5, restore: 243, icon: 'bread', sell: 6, cost: 25 });
  D.item('spring_water', { name: 'Refreshing Spring Water', slot: 'drink', q: 1, lvl: 1, restore: 151, icon: 'water', sell: 1, cost: 5 });
  D.item('ice_milk', { name: 'Ice Cold Milk', slot: 'drink', q: 1, lvl: 5, restore: 436, icon: 'water', sell: 6, cost: 25 });
  D.item('ruined_pelt', { name: 'Ruined Pelt', slot: 'junk', q: 0, icon: 'pelt', sell: 4 });
  D.item('wolf_fang', { name: 'Chipped Fang', slot: 'junk', q: 0, icon: 'claw', sell: 3 });
  D.item('kobold_rag', { name: 'Dirty Kobold Rag', slot: 'junk', q: 0, icon: 'bandana', sell: 3 });
  D.item('broken_candle', { name: 'Melted Candle Stub', slot: 'junk', q: 0, icon: 'candle', sell: 5 });
  D.item('thieves_coin', { name: 'Tarnished Coin', slot: 'junk', q: 0, icon: 'coin', sell: 9 });
  D.item('murloc_eye', { name: 'Slimy Murloc Scale', slot: 'junk', q: 0, icon: 'fin', sell: 12 });
  D.item('bear_hide', { name: 'Thick Bear Fur', slot: 'junk', q: 0, icon: 'pelt', sell: 15 });
  D.item('gnoll_mane', { name: 'Matted Gnoll Mane', slot: 'junk', q: 0, icon: 'pelt', sell: 18 });
  D.item('linen_cloth', { name: 'Linen Cloth', slot: 'junk', q: 1, icon: 'bandana', sell: 5 });
  D.item('pumpkin', { name: 'Stolen Pumpkin', slot: 'junk', q: 0, icon: 'grapes', sell: 20 });
  D.item('wolf_meat', { name: 'Tough Wolf Meat', slot: 'quest', q: 1, icon: 'meat' });
  D.item('vancleef_head', { name: 'Head of VanCleef', slot: 'quest', q: 1, icon: 'head' });
  D.item('militia_shortsword', { name: 'Militia Shortsword', slot: 'weapon', wtype: 'sword', q: 2, lvl: 9, dmg: [8, 16], speed: 2.1, stats: { str: 2, sta: 1 }, icon: 'sword', sell: 180, look: ['weapon', 'militia_sword'], source: 'Quest: Wanted: Hogger' });
  D.item('militia_dagger', { name: 'Militia Dagger', slot: 'weapon', wtype: 'dagger', q: 2, lvl: 9, dmg: [6, 11], speed: 1.6, stats: { agi: 3 }, icon: 'dagger', sell: 170, look: ['weapon', 'militia_dagger'], source: 'Quest: Wanted: Hogger' });
  D.item('militia_staff', { name: 'Militia Quarterstaff', slot: 'weapon', wtype: 'staff', q: 2, lvl: 9, dmg: [13, 20], speed: 3, stats: { int: 4, spi: 3 }, sp: 6, icon: 'staff', sell: 190, look: ['weapon', 'militia_staff'], source: 'Quest: Wanted: Hogger' });
  D.item('militia_hammer', { name: 'Militia Warhammer', slot: 'weapon', wtype: 'mace', q: 2, lvl: 9, dmg: [8, 15], speed: 2.3, stats: { int: 2, spi: 2 }, sp: 4, icon: 'mace', sell: 180, look: ['weapon', 'militia_hammer'], source: 'Quest: Wanted: Hogger' });
  D.item('defias_armor', { name: 'Blackened Defias Armor', slot: 'chest', atype: 'leather', q: 3, lvl: 10, armor: 62, stats: { agi: 5, sta: 3 }, icon: 'chest_leather', sell: 700, look: ['chest', 'defias_armor'], set: 'defias', source: 'Edwin VanCleef, The Deadmines' });
  D.item('defias_leggings', { name: 'Blackened Defias Leggings', slot: 'legs', atype: 'leather', q: 3, lvl: 10, armor: 55, stats: { agi: 4, sta: 3 }, icon: 'legs', sell: 700, look: ['legs', 'defias_leggings'], set: 'defias', source: 'Gilnid, The Deadmines' });
  D.item('defias_boots', { name: 'Blackened Defias Boots', slot: 'feet', atype: 'leather', q: 3, lvl: 10, armor: 40, stats: { agi: 3, sta: 3 }, icon: 'boots', sell: 600, set: 'defias', source: "Sneed's Shredder, The Deadmines" });
  D.item('defias_belt', { name: 'Blackened Defias Belt', slot: 'waist', atype: 'leather', q: 3, lvl: 10, armor: 30, stats: { agi: 3, sta: 2 }, icon: 'belt', sell: 500, set: 'defias', source: "Rhahk'Zor, The Deadmines" });
  D.item('troll_tusk', { name: 'Frostmane Tusk', slot: 'junk', q: 0, icon: 'claw', sell: 11 });
  D.item('trogg_stone', { name: 'Rockjaw Pebble', slot: 'junk', q: 0, icon: 'dust', sell: 3 });
  D.item('thunder_ale', { name: 'Thunder Ale', slot: 'drink', q: 1, lvl: 5, restore: 436, icon: 'keg', sell: 6, cost: 25 });
  D.item('grell_earring', { name: 'Grell Earring', slot: 'junk', q: 0, icon: 'ring', sell: 6 });
  D.item('furbolg_charm', { name: 'Gnarlpine Charm', slot: 'junk', q: 0, icon: 'claw', sell: 14 });
  D.item('moonberry_juice', { name: 'Moonberry Juice', slot: 'drink', q: 1, lvl: 5, restore: 436, icon: 'water', sell: 6, cost: 25 });
  D.item('boar_tusk', { name: 'Mottled Tusk', slot: 'junk', q: 0, icon: 'tusk', sell: 4 });
  D.item('troll_trinket', { name: 'Hexed Trinket', slot: 'junk', q: 0, icon: 'voodoo_doll', sell: 12 });
  D.item('horde_bread', { name: 'Haunch of Meat', slot: 'food', q: 1, lvl: 5, restore: 243, icon: 'meat', sell: 6, cost: 25 });
  D.item('quilboar_tusk', { name: 'Quilboar Tusk', slot: 'junk', q: 0, icon: 'quilboar_tusk', sell: 8 });
  D.item('mulgore_bread', { name: 'Mulgore Spice Bread', slot: 'food', q: 1, lvl: 5, restore: 243, icon: 'bread', sell: 6, cost: 25 });
  D.item('rotting_flesh', { name: 'Rotting Flesh', slot: 'junk', q: 0, icon: 'zombie_brain', sell: 5 });
  D.item('tirisfal_pumpkin', { name: 'Tirisfal Pumpkin', slot: 'food', q: 1, lvl: 5, restore: 243, icon: 'grapes', sell: 6, cost: 25 });
  D.item('moist_cornbread', { name: 'Moist Cornbread', slot: 'food', q: 1, lvl: 10, restore: 552, icon: 'bread', sell: 12, cost: 50 });
  D.item('mutton_chop', { name: 'Mutton Chop', slot: 'food', q: 1, lvl: 15, restore: 874, icon: 'meat', sell: 20, cost: 80 });
  D.item('sweet_nectar', { name: 'Sweet Nectar', slot: 'drink', q: 1, lvl: 15, restore: 1344, icon: 'water', sell: 20, cost: 80 });
  D.item('melon_juice', { name: 'Melon Juice', slot: 'drink', q: 1, lvl: 10, restore: 835, icon: 'water', sell: 12, cost: 50 });
  D.item('pool_water', { name: 'Forgotten Pool Water', slot: 'quest', q: 1, icon: 'water' });

  D.SETS = { defias: { name: 'Blackened Defias', pieces: 4, mask: 3 } };

  // ---- random gear
  D.AFFIXES = [{ name: 'of the Bear', stats: { str: 1, sta: 1 } }, { name: 'of the Tiger', stats: { str: 1, agi: 1 } }, { name: 'of the Monkey', stats: { agi: 1, sta: 1 } }, { name: 'of the Eagle', stats: { sta: 1, int: 1 } }, { name: 'of the Owl', stats: { int: 1, spi: 1 } }, { name: 'of the Whale', stats: { sta: 1, spi: 1 } }, { name: 'of the Falcon', stats: { agi: 1, int: 1 } }, { name: 'of Strength', stats: { str: 2 } }, { name: 'of Agility', stats: { agi: 2 } }, { name: 'of Intellect', stats: { int: 2 } }, { name: 'of Stamina', stats: { sta: 2 } }, { name: 'of Spirit', stats: { spi: 2 } }];

  D.GEAR_BASES = {
    cloth: { mats: ['Linen', 'Soft', 'Woolen'], grey: ['Frayed', 'Tattered'], arm: 0.25 },
    leather: { mats: ['Handstitched', 'Rawhide', 'Rough Leather'], grey: ['Worn', 'Cracked'], arm: 0.55 },
    mail: { mats: ['Chainmail', 'Ringed', 'Rusted'], grey: ['Dented', 'Battered'], arm: 1 },
  };

  D.SLOT_NAMES = {
    chest: ['Tunic', 'Vest', 'Robe'],
    legs: ['Pants', 'Leggings'],
    feet: ['Boots', 'Shoes'],
    hands: ['Gloves', 'Handwraps'],
    wrist: ['Bracers', 'Cuffs'],
    waist: ['Belt', 'Sash'],
    back: ['Cloak', 'Cape'],
    finger: ['Band', 'Ring'],
  };

  D.SLOT_ARMOR = { chest: 8, legs: 7, feet: 5, hands: 4, wrist: 3, waist: 4, back: 3, finger: 0 };

  D.WEAPON_BASES = {
    sword: { names: ['Shortsword', 'Broadsword', 'Blade'], speed: 2.2, icon: 'sword' },
    axe: { names: ['Hatchet', 'Handaxe'], speed: 2.4, icon: 'axe' },
    mace: { names: ['Mallet', 'Cudgel', 'Hammer'], speed: 2.3, icon: 'mace' },
    dagger: { names: ['Dirk', 'Knife', 'Stiletto'], speed: 1.6, icon: 'dagger' },
    staff: { names: ['Staff', 'Quarterstaff', 'Walking Stick'], speed: 3, icon: 'staff' },
    bow: { names: ['Shortbow', 'Longbow', 'Recurve Bow'], speed: 2.6, icon: 'bow' },
  };

  D.GEAR_SLOTS = ['weapon', 'ranged', 'chest', 'legs', 'feet', 'hands', 'wrist', 'waist', 'back', 'finger'];
  D.SLOT_LABEL = { weapon: 'Main Hand', ranged: 'Ranged', chest: 'Chest', legs: 'Legs', feet: 'Feet', hands: 'Hands', wrist: 'Wrist', waist: 'Waist', back: 'Back', finger: 'Finger' };
  D.SLOT_ICON = { chest: null, legs: 'legs', feet: 'boots', hands: 'gloves', wrist: 'bracers', waist: 'belt', back: 'cloak', finger: 'ring' };

  // ---- quest reward families
  D.REWARD_FAMILIES = {
    fam_chest: { slot: 'chest', lvl: 2, q: 1 },
    fam_legs: { slot: 'legs', lvl: 2, q: 1 },
    fam_feet: { slot: 'feet', lvl: 3, q: 1 },
    fam_hands: { slot: 'hands', lvl: 4, q: 2 },
    fam_weapon5: { slot: 'weapon', lvl: 5, q: 2 },
    fam_wrist: { slot: 'wrist', lvl: 6, q: 2 },
    fam_back: { slot: 'back', lvl: 8, q: 2 },
    fam_waist: { slot: 'waist', lvl: 8, q: 2 },
    fam_chest9: { slot: 'chest', lvl: 9, q: 2 },
    fam_legs9: { slot: 'legs', lvl: 9, q: 2 },
    fam_hands9: { slot: 'hands', lvl: 10, q: 2 },
    fam_back_rare: { slot: 'back', lvl: 10, q: 3 },
    militia: { fixed: { warrior: 'militia_shortsword', rogue: 'militia_dagger', mage: 'militia_staff', priest: 'militia_hammer', paladin: 'militia_hammer', warlock: 'militia_staff', hunter: 'militia_longbow', druid: 'militia_staff', shaman: 'militia_hammer' } },
    fam_feet12: { slot: 'feet', lvl: 11, q: 2 },
    fam_wrist12: { slot: 'wrist', lvl: 12, q: 2 },
    fam_weapon12: { slot: 'weapon', lvl: 12, q: 2 },
    fam_chest13: { slot: 'chest', lvl: 13, q: 2 },
    fam_legs13: { slot: 'legs', lvl: 13, q: 2 },
    fam_back14: { slot: 'back', lvl: 14, q: 2 },
    fam_waist14: { slot: 'waist', lvl: 14, q: 2 },
    fam_hands14: { slot: 'hands', lvl: 14, q: 2 },
    fam_weapon15: { slot: 'weapon', lvl: 15, q: 2 },
    fam_ring_rare: { slot: 'finger', lvl: 15, q: 3 },
    fam_feet17: { slot: 'feet', lvl: 16, q: 2 }, fam_wrist17: { slot: 'wrist', lvl: 17, q: 2 }, fam_weapon17: { slot: 'weapon', lvl: 17, q: 2 },
    fam_chest18: { slot: 'chest', lvl: 18, q: 2 }, fam_legs18: { slot: 'legs', lvl: 18, q: 2 }, fam_back19: { slot: 'back', lvl: 19, q: 2 },
    fam_waist19: { slot: 'waist', lvl: 19, q: 2 }, fam_hands19: { slot: 'hands', lvl: 19, q: 2 }, fam_weapon20: { slot: 'weapon', lvl: 20, q: 2 },
    fam_ring_rare20: { slot: 'finger', lvl: 20, q: 3 },
  };

  // ---- filled by the zone files
  D.MOBS = {}; D.PLACES = {}; D.REGIONS = {}; D.NPCS = {}; D.QUESTS = {}; D.DUNGEONS = {}; D.ACTIVITIES = {};
  // A zone registers itself; its places carry region: <id>.
  D.zone = (id, meta) => { D.REGIONS[id] = meta; };
})(typeof window !== 'undefined' ? window : globalThis);
