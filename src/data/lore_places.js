// LORE, part 2: Lore Journal pages for dungeons and raids (open after your first clear, with a note on each boss) and
// zones (open on your first visit). Same format as lore.js; written against docs/lore/canon.md and checked by
// tools/lorekeeper.js, which reads each page at the dungeon's or zone's lowest level.
(function (root) {
  const D = root.D;
  Object.assign(D.LORE, {
    // ------------------------------------------------------------ dungeons and raids
    dg_ragefire: { title: 'The Smoke Pit', section: 'dungeon', dungeon: 'ragefire', text: [
      'The caves under Vazhrak are older than the city. When the Krugar raised its walls on the red earth, the tunnels below were left to the heat and the dark, and nobody thought much about what lived in them.',
      'The cavekin did. They came up from the deep rock, bred in the warm caves and fought anything that came down. Behind them came something worse: orcs of the Hollow Eye, cousins of the Hollow Eye that haunt the caves near the Blooding Grounds.',
      'The Hollow Eye want back what the Krugar gave up: the old pacts with demons, and the power that came with them. They meet in the lowest caves, a short climb from the Warchief\'s own streets, and call up things that should have stayed on the other side.',
      'For the orcs of Vazhrak this is a matter of shame as much as danger. The rot is not an invader. It is their own.',
    ], bosses: {
      oggleflint: 'Skagg leads the cavekin of the upper tunnels. He is a brute, not a schemer, and the cult lets his tribe hold the way in so its own work goes undisturbed.',
      taragaman: 'Bazzak is a demon the cultists called up from beyond the world and have fed ever since. The more they give him, the more he wants, and they have stopped asking why.',
      jergosh: 'Varrok the Invoker is an orc warlock who turned from the Krugar back to the old pacts. He leads the Hollow Eye\'s rites, and the demons in the chasm answer his summons.',
      bazzalan: 'Ulzan is a satyr who came to the cult with promises. The orcs believe they command him. He has been content to let them believe it.',
    } },

    dg_deadmines: { title: 'The Smugglers\' Deep', section: 'dungeon', dungeon: 'deadmines', text: [
      'The Smugglers\' Deep were once the pride of Fenwick: a deep goldmine that kept the town fed for a generation. When the seam ran thin the owners walked away, and the tunnels were left to fill with water and rot.',
      'When the Ledger foreclosed on Fenwick, it took the old mine too. Blackwell\'s Grey Hoods reopened it and dug it deeper, down to a cove on the coast that no map shows.',
      'Inside, the Grey Hoods work like the business they are. There are foremen, smiths, cooks and quartermasters, all paid in warm Ledger coin, and a pirate crew waiting for the fleet to be finished.',
      'To the people of Longfield the mine is where their harvests go to disappear. To anyone who counts the ships, it is a fleet being built within a day\'s ride of Kingsmere, and nobody can say where it will sail.',
    ], bosses: {
      rhahkzor: 'Rukko the Foreman is an ogre the Grey Hoods hired to drive the miners and guard the first gate. He cares nothing for debts or ledgers. Blackwell pays well, and he enjoys the work.',
      sneed_shredder: 'Snork is a goblin logger for hire who brought his shredder down to cut timber for the fleet. He sits inside the machine and lets it do his talking.',
      gilnid: 'Gimble is the goblin who runs the foundry, melting seized ore into fittings for the ships. He drives his workers harder than any collector ever drove a debtor.',
      mr_smite: 'Mr. Clobber is Blackwell\'s first mate, a hornfolk who went to sea long ago and never went back to the plains. He keeps the pirate crew in line.',
      cookie: 'Crumbs is a mireling who wandered in from the cove and stayed to cook for the crew. Nobody knows what goes into the pot, and nobody asks twice.',
      vancleef: 'Corvin Blackwell was the finest shipwright in Longfield until one bad season and one unpaid note. The Ledger took his yard and let him keep the debt. He collects for it now, and builds what it tells him to.',
    } },

    dg_wailing_caverns: { title: 'The Dreaming Caves', section: 'dungeon', dungeon: 'wailing_caverns', text: [
      'Water cut these caverns long before anyone gave them a name. Their springs feed the oases above, and for as long as anyone remembers, the oases have fed the plains.',
      'When the land began to dry, Elarion brought his followers down to find the cause and cure it. The work went wrong. Four of his closest disciples stayed at his side and came to believe the nightmare was the answer they had been looking for. They guard it now as if it were a gift.',
      'The caverns change whatever lives in them. Snakes grow to monstrous size, raptors hunt with too many teeth, and the water of the oases has begun to sour. The druids\' healing now spreads sickness.',
      'The Krugar goes down because the Scrublands cannot live without its oases, and the hornfolk will not watch the plains die. What they want is simple: Elarion awake, and the Fang gone.',
    ], bosses: {
      lady_anacondra: 'Sythra was the first of Elarion\'s disciples to hear the nightmare and call it a vision. She tends the caverns\' twisted gardens and truly believes she is healing them.',
      kresh: 'Old Shell is a great turtle that lived in the cavern pools long before the druids came. The poisoned dream has made him larger, and far less patient.',
      lord_cobrahn: 'Vesk swore to protect Elarion and still keeps that oath, in his own way. He will let nobody wake the dreamer, and he has taken a serpent\'s shape to see to it.',
      lord_pythas: 'Ophis holds the deep pools and the waterfall road. Of the four he is the most certain, and he preaches the nightmare to the lesser druids like scripture.',
      mutanus: 'Gulgoth may have been an ordinary mireling once, before he found the dreamer and began to feed. He grows fatter on the nightmare every day, and Elarion sinks deeper.',
    } },

    dg_stockade: { title: 'Kingsmere Gaol', section: 'dungeon', dungeon: 'stockade', text: [
      'Kingsmere Gaol was cut beneath the canals when the city was rebuilt after the war. Lately it holds as many debtors as thieves.',
      'Its cells hold the worst the kingdom has caught: orcs from the Cinderpeak raids, traitors, murderers, and more Grey Hood every month as the trouble in Longfield drags on. The wardens are few, and the city above has had other things to spend its money on.',
      'The riot was planned. The blades came in past the guards, the doors opened together, and the Grey Hood inside knew exactly where to go. Who got those blades inside is a question the wardens would very much like answered.',
      'For Kingsmere it is one more bill it cannot pay. The crown owes the Ledger, it owes its wardens, and now its own prison is a battlefield under its streets.',
    ], bosses: {
      targorr: 'Ulgrak the Butcher is a Cinderpeak orc who butchered a village in the east before the guard dragged him here. He has spent his years in the cells promising to do it again.',
      kam_deepfury: 'Kalf Brandsson is a dwarf who sold the guard\'s patrol routes to the Cinderpeak for gold. Soldiers died on those roads. He has waited years for his chance to run.',
      hamhock: 'Porkchop is an ogre the guard caught raiding farms outside the city. He is not clever, and nobody has fed him properly since the riot began.',
      bruegal_ironknuckle: 'Hugo Knuckles fought bare-knuckle in every town that would have him, until he killed a man in the ring. Now he fights anyone in reach, because he likes it.',
      dextren_ward: 'Dexter Crowe is a murderer from the city itself, locked away after the guard found what he kept from the people he killed. The riot has given him the run of the cells.',
      bazil_thredd: 'Silas Crane is a Grey Hood captain, taken in Longfield and sent here to rot. He did not rot. He planned the riot from his cell and waited for the blades to arrive.',
    } },

    dg_shadowfang: { title: 'Greyhowl Keep', section: 'dungeon', dungeon: 'shadowfang', text: [
      'Greyhowl Keep was the seat of the Ashcroft barons, who held Needlewood for the old kingdom of Wexmoor. For generations its walls watched the road through the forest.',
      'When the plague came, the barons\' soldiers held the keep as long as they could. Cairn\'s curse finished what the plague began. The garrison died on the walls, and many of them rose again to serve the new master of the tower.',
      'Now the keep is a den. Werewolf hunt its courtyards, the dead stand watch in its halls, and every night the curse reaches a little further down the hill to Ashwick Village.',
      'To the Reclaimed, Greyhowl is a knife held at the Gravenhold\'s back. The Pale Queen has sent her gravestalkers inside more than once. Not all of them came back.',
    ], bosses: {
      rethilgore: 'Rotjaw was a werewolves of the first packs, set to guard the keep\'s cells. He hates his master as much as any prisoner does, and still does his bidding.',
      razorclaw: 'Cleaver the Butcher runs the keep\'s kitchens for the werewolves packs. What he cooks there, and who, the gravestalkers who came back prefer not to say.',
      baron_silverlaine: 'Baron Ashcroft was the keep\'s last lord and died defending it. His spirit still guards what is left of his family\'s name, and treats every visitor as a thief.',
      commander_springvale: 'Commander Ashdown led the keep\'s defenders against the Hollow Host, a soldier of the Light. He fell on the walls, and Cairn raised him to command the dead garrison instead.',
      fenrus: 'Grimwolf was a hound of the keep before the curse. Cairn\'s magic made him something far larger and hungrier, and he now guards the tower stairs for his new master.',
      arugal: 'Cairn was an archmage who called the werewolves to fight the Hollow Host and could not send them back. Since then he has decided they are his children, and Needlewood his kingdom.',
    } },

    dg_blackfathom: { title: 'The Tidehollow Deeps', section: 'dungeon', dungeon: 'blackfathom', text: [
      'In its day the temple on the Elderglen coast was a place of quiet worship, where the moon priestesses tended pools that held the moon\'s light. When the sea took it, the wood elves mourned it and let it go.',
      'The ruins did not stay empty. Naga came in from the deep ocean and claimed the upper halls, and mirelings crept in behind them. Below them all, in the black water at the temple\'s roots, waited something that was never part of the wood elves\' faith.',
      'The Eclipse Cult wants no kingdom and no throne. It wants the world to end, and it will serve anything that promises to end it faster.',
      'For the Sylari, the Deeps are a holy place fouled, and Oreth makes it worse: he is one of their own. The Krugar has its own outposts on this coast, and the cult does not care whose.',
    ], bosses: {
      ghamoo_ra: 'Shellmaw is a giant turtle the cult found in the flooded halls. The acolytes feed it and call it blessed, and it has grown enormous on their offerings.',
      lady_sarevess: 'Lady Szira is a naga sorceress who commands the serpent warriors in the Deeps. She lets the cult pass through her halls for now, because for now it serves her.',
      gelihast: 'Glubb is the chief of the mirelings who crept into the ruins behind the naga. He has made himself a small kingdom in the flooded halls and defends it fiercely.',
      twilight_lord_kelris: 'Oreth was a wood elf who came to the drowned temple to learn what stirred beneath it. He listened for too long, and now he speaks for it.',
      aku_mai: 'Old Coilmaw is a great hydra that dwells in the black pool at the bottom of the temple. The cult feeds it and calls it holy. Nobody knows how old it is.',
    } },
    dg_gnomeregan: { title: 'Gearhollow', section: 'dungeon', dungeon: 'gnomeregan', text: [
      'For generations the gnomes dug down and outward beneath Kaldvik, and their capital grew into a maze of forges, lifts and workshops. Their neighbours in Keldrun admired it and never quite trusted it.',
      'When the cavekin broke through from below, the gnomes fought for weeks and lost ground every day. Chief Engineer Voltwhistle offered them a way to win, and the council took it. The survivors now say he knew what it would cost, and chose it anyway. Those who fled reached Keldrun with only what they could carry.',
      'Voltwhistle stayed. He rules the ruins as their king, served by leper gnomes who remained out of loyalty or because they had nowhere else to go. Cavekins still hold the upper halls. Lately, Slagborn agents have been seen among the wreckage, carrying off plans and parts.',
      'For the exiles in Keldrun, every group that goes down takes back a small piece of their city. They ask for records, for heirlooms, for his head. Mostly they ask for news of home.',
    ], bosses: {
      grubbis: 'A cavekin chieftain who came up with the first wave and never left. He leads his kin through the halls the gnomes built, and breaks whatever he does not understand.',
      viscous_fallout: 'The radiation did not only poison the living. In the flooded lower tunnels it gathered into something thick and moving, and it has crept through the halls ever since.',
      electrocutioner_6000: 'A security machine built to guard the city\'s workshops. Its makers fled, but its orders never changed, and it still punishes every intruder it finds, gnome or otherwise.',
      crowd_pummeler: 'Built to keep order in a crowded city, it was among the last machines finished before the fall. Voltwhistle kept it running and set it to guard his halls.',
      mekgineer_thermaplugg: 'Once the gnomes\' chief engineer, now the self-crowned lord of their ruined city. He believes his machines will outlast everyone who turned against him.',
    } },

    dg_razorfen_kraul: { title: 'The Thorn Warrens', section: 'dungeon', dungeon: 'razorfen_kraul', text: [
      'The spinehide believe the thorns of the Thorn Warrens are the living body of the Great Boar, and that every tribe sheltering inside them belongs to him. They have raided the southern Scrublands from the Warrens for as long as the hornfolk remember.',
      'For most of that time the Warrens was ruled by its war leaders and its geomancers, who speak to the earth and the thorns. That has changed. Masked cultists of the Death\'s Head now walk the tunnels, and the tribe\'s dead do not stay buried. Some spinehide welcome it. Others have been fed to it.',
      'Mother Grisla holds the tribe together, and she has chosen the cult. Nobody outside the Warrens knows what she has bargained with. Its whispers only grow louder the deeper the tunnels go.',
      'To the Krugar at Dustfort, the Warrens is a threat on their own doorstep. Caravans vanish on the southern road, and the dead walk back out wrong. Grukk sends fighters south because nobody else will.',
    ], bosses: {
      aggem_thorncurse: 'A geomancer who leads the Death\'s Head inside the Warrens. He was the first of the thorn-speakers to take up the cult, and he taught the thorns to answer it.',
      death_speaker_jargba: 'A spinehide necromancer who gives the cult its dead. He calls fallen warriors of the tribe back to guard the tunnels, whether they are willing or not.',
      overlord_ramtusk: 'The Warrens\'s war leader, loyal to Grisla above everything. He cares little for the cult, but he will kill anyone who threatens the matriarch or the thorns.',
      agathelos: 'A great boar kept in the deepest dens. The spinehide say the Great Boar\'s blood runs in him, and they feed him the prisoners they have no other use for.',
      charlga_razorflank: 'Matriarch of the Thorn Warrens, old and cunning. She turned her tribe towards the Death\'s Head and the power behind it, and she rules the Warrens from the thorn throne.',
    } },

    dg_sm_library: { title: 'The Pyre Abbey: Library', section: 'dungeon', dungeon: 'sm_library', text: [
      'Before the plague, the monastery in Pallmoor was a quiet house of study for the clergy of Wexmoor. Its library held centuries of prayer, history and learning. When the Order of the Pyre took the abbey, they kept the books and burned the people who disagreed with them.',
      'Today the library wing holds the Order\'s secrets and its prisoners. Monks guard the halls. Interrogators question anyone brought in from the roads, and few leave. Hounds wait in the yard for those who try.',
      'The Order preaches against every dark art, yet its arcanist hoards the very books it condemns. Arcanist Veyne reads them behind locked doors, and calls it vigilance.',
      'For the Reclaimed, the monastery is an enemy fortress a short march from Mossgate, and its patrols hunt them in their own fields. The Pale Queen wants what Veyne keeps. The Accord sends its own people for another reason: many of the Order\'s victims were never undead at all.',
    ], bosses: {
      interrogator_vishas: 'The Order\'s chief questioner in the library wing. He decides which prisoners are secretly undead, and he has never once decided that someone was innocent.',
      houndmaster_loksey: 'Keeper of the Order\'s hounds. His dogs are trained on the scent of the dead, and he sets them on the living just as readily.',
      arcanist_doan: 'The Order\'s scholar of the arcane. He guards the library\'s forbidden books and believes that only he is strong enough to read them without falling.',
    } },

    dg_sm_cathedral: { title: 'The Pyre Abbey: Cathedral', section: 'dungeon', dungeon: 'sm_cathedral', text: [
      'The cathedral is the heart of the monastery and of the Order of the Pyre. Its soldiers are blessed here before they ride out, and its dead are brought back here when they fall.',
      'Pyre Commander Aldric Vance leads the Order\'s army in Pallmoor. High Inquisitor Seraphine Ashe leads its faith. Between them they decide who is pure and who must burn. Their soldiers say the two are closer than a commander and a priest ought to be, and they would follow either of them into fire.',
      'Not everything in the cathedral is holy. High Inquisitor Albright died in these halls and did not stay dead. He sits in a side chamber, and nobody in the Order speaks his name.',
      'Reclaimed graveguards and Accord soldiers come here for the same reason. While Vance and Ashe stand, the Order keeps its purpose. Without them, it is only frightened people with swords.',
    ], bosses: {
      herod: 'The Order\'s champion, who drills its soldiers in the armory. He fights for the joy of it more than for the Light, and he has long wanted a worthy opponent.',
      high_inquisitor_fairbanks: 'An inquisitor of the early Order who died inside the cathedral. Something kept him from rest. He lingers there still, unburied, and his brothers pretend not to see him.',
      scarlet_commander_mograine: 'Commander of the Order\'s soldiers at the monastery. A zealot and a fine leader, he believes every mercy shown in the plague years cost a life, and he shows none.',
      high_inquisitor_whitemane: 'The Order\'s highest priest in Pallmoor. Her faith is real and so is her power, and she guards Vance as fiercely as she guards the Light itself.',
    } },

    dg_zul_farrak: { title: 'The Dune Temple', section: 'dungeon', dungeon: 'zul_farrak', text: [
      'The Dune Temple is older than Coppergulch by centuries. The Duneskin trolls have held it through drought and sandstorm, and they see every road across Sirocco as theirs to tax in blood.',
      'It is a city of priests and of the dead. Witch doctors raise the old graves to guard the walls. Scarabs and basilisks are kept as sacred beasts, and in the temple the priests feed their hydra and pray to powers they will not name to outsiders.',
      'The goblins of Coppergulch will trade with anyone except the Duneskin. Caravans hire mercenaries to cross the desert, and sooner or later some of those mercenaries decide the city itself is worth robbing. It has never gone well for them.',
      'Neither faction has a claim here. Krugar and Accord adventurers meet in Coppergulch, take contracts from the same goblins and walk into the same city. The Duneskin do not care which banner a corpse was carrying.',
    ], bosses: {
      antu_sul: 'An overseer of the Duneskin who keeps the city\'s basilisks. He raises them from the egg, loves them more than his own kin, and feeds them whoever comes over the wall.',
      witch_doctor_zumrah: 'Master of the city\'s dead. He calls the Duneskin buried in the graveyard back to their feet, and his voodoo totem keeps them loyal long after death.',
      theka_the_martyr: 'A Duneskin priest who gave his life to the tribe\'s gods and came back bound to the sacred scarabs. The trolls believe he can no longer truly die.',
      gahz_rilla: 'A great hydra kept in the sacred pool beneath the temple. The Duneskin honour it as a living god, and the priests alone decide when it is woken and fed.',
      sergeant_bly: 'Leader of the mercenary crew that came to rob the temple. The plan fell apart on the pyramid stairs, and now he trusts nobody who climbs up to join him.',
      chief_ukorz_sandscalp: 'Chief of the Duneskin, who rules from the top of the temple. He sends his raiders against every caravan and counts the whole desert as his tribute.',
    } },

    dg_maraudon: { title: 'The Gemfall Caves', section: 'dungeon', dungeon: 'maraudon', text: [
      'The centaur tribes of Mournwaste agree on little, but all of them trace their line to these caves and to the wandering god the Stone Princess loved. He has been dead for ages. The tribes tell different stories of how he died, and each one blames another.',
      'Ghesra never left him. She has kept her grief in the deepest caverns for longer than anyone can count, and over that time it has turned to poison. The water that runs out of The Gemfall Caves carries it, and the land it touches withers.',
      'Others have come to feed on the rot. Satyrs, wood elves who once served the Legion, hold the upper halls under Lord Venomlip. Vines and slimes grow fat in the dark. The druids who knew Faolan still believe his scepter can bring him back to himself.',
      'Krugar and Accord each hold a corner of Mournwaste, and both have watched it die around them. Whatever else divides them, neither wants what lives in The Gemfall Caves to spread any further.',
    ], bosses: {
      noxxion: 'A living mass of the caverns\' poison, grown in the water that seeps up from the depths. Pieces of it break away and crawl off to spread the rot.',
      razorlash: 'A thorned creature grown from the corrupted roots of the upper caves. The satyrs let it thrive, since it strangles anything that wanders in.',
      lord_vyletongue: 'A satyr lord who claimed the upper halls of The Gemfall Caves for his kind. He cares nothing for the centaur or the earth, only for the corruption and what he can make of it.',
      celebras_the_cursed: 'A keeper of the grove, twisted by the curse of the falls. What remains of him still tends the water, but he no longer knows what he is tending it for.',
      landslide: 'A great earth elemental that guards the way to the princess. It is less a servant than a piece of the mountain that woke up angry.',
      princess_theradras: 'The elemental princess of earth and, by the centaur\'s telling, their mother. Her grief for the wandering god has poisoned her caves and, through them, all of Mournwaste.',
    } },
    dg_blackrock_depths: { title: 'Cinderpeak Depths', section: 'dungeon', dungeon: 'blackrock_depths', text: [
      'The Slagborn were the proudest of the dwarven clans, and the war with their kin went badly for them. Grimmark reached for a power none of them understood. The fire he woke broke their old capital apart, and its ruins still smoulder in the Cinderfields.',
      'What was left of the clan went down into the mountain and built again. The city of Ashforge has a throne, a Lyceum, forges and prisons. It is also a temple. Everything the Slagborn make, they make for the King Below sleeping in the molten sea below.',
      'They trade with anyone who pays, and some of their gold comes from a long way off. Marshal Hale, still alive in their cells, has been writing down what he sees.',
      'The Accord comes for the marshal and his notes. The Krugar comes for the Emperor\'s crown, because a kingdom that serves Vulcarn threatens everyone above it. Both want the same thing in the end: Grimmark off his throne.',
    ], bosses: {
      high_interrogator_gerstahn: 'Keeper of the detention block and its keys. Every prisoner the Slagguard bring down passes through her hands, and she has been in no hurry to finish with the marshal.',
      lord_roccor: 'An elemental of fire and stone, bound to the mountain when Vulcarn came. The Slagborn set him to guard their lower halls, and he has never asked why.',
      bael_gar: 'A giant of living magma from the King Below\'s own court, sent up through the rock to watch over the Slagborn\'s work. The dwarves feed it and keep their distance.',
      general_angerforge: 'Commander of the Slagborn armies. He drills his soldiers in the halls of Ashforge day and night, and he means to march them onto the surface one day.',
      golem_lord_argelmach: 'Master of the golem workshop. His machines guard the Emperor\'s halls, and at the heart of each one burns a core of the mountain\'s fire.',
      magmus: 'A giant of molten stone raised to guard the doors of the Imperial Seat. It has stood before them since the Emperor took his throne, and it has let nobody pass.',
      emperor_dagran_thaurissan: 'Emperor of the Slagborn, who borrowed from the Ledger to rebuild his empire and pays it back by digging. He keeps the marshal\'s notes beside his throne and trusts nobody outside his mountain.',
    } },
    dg_scholomance: { title: 'The Blackcloister', section: 'dungeon', dungeon: 'scholomance', text: [
      'Before the plague, Castle Ardmore was a quiet island keep on a lake, and the Vargas were one of Wexmoor\'s old noble houses, deep in debt. When the necromancers of the Hollow Host offered to buy the debt, Lord Anton Varga signed the island away and took his family into their service.',
      'The crypts became a school. Its students are living men and women who want power over death. Its teachers are the dead, or soon will be. They practise on the island\'s own people, and what they learn goes out across the Rotmoor, to Elmsworth and beyond.',
      'The Vargas walk the castle still, dressed for court, certain the deal was a good one.',
      'For the Accord, this is where the plague is taught, and closing it spares the next village. The Reclaimed were raised by lessons learned in these halls. For them, the Pale Queen\'s order is personal.',
    ], bosses: {
      kirtonos_the_herald: 'A winged demon that guards the school\'s gates and answers its call. The Cult bargained for it early, and it has kept watch over the reliquary ever since.',
      jandice_barov: 'Lord Anton\'s daughter, who took to the Cult\'s arts faster than anyone in her family. She died in the school without seeming to notice. Her illusions still fill its halls.',
      rattlegore: 'A giant assembled by the students from the bones of Castle Ardmore\'s dead. It was made to guard the ossuary, and nobody has ever told it to stop.',
      ras_frostwhisper: 'A mage of Wexmoor who came to the Cult for power and paid for it with his life. He returned as a lich and teaches the cold arts to any student who survives him.',
      instructor_malicia: 'One of the school\'s living teachers. She believes the plague is a cleansing, and she teaches her acolytes to raise the dead as if it were any other trade.',
      lord_alexei_barov: 'Head of the Varga house, who sold Castle Ardmore for a promise and got exactly what he was promised. He carries the deed still, as if the island were his to keep.',
      darkmaster_gandling: 'Headmaster of the Blackcloister, answerable only to the Cult. He chooses the students, sets the lessons, and decides which of them will become the next lesson.',
    } },
    dg_stratholme: { title: 'Graymouth', section: 'dungeon', dungeon: 'stratholme', text: [
      'Graymouth was the second city of Wexmoor, a place of markets, granaries and cathedrals. The plague came in with the grain. Somewhere in the city\'s records are the names of the people who shipped it.',
      'Half the city is held by the Order of the Pyre. They came to burn the plague out and never left, and they burn anything that moves outside the Pyre Bastion. The Grand Crusader leads them from behind its walls. He is not what he seems.',
      'The other half belongs to the Hollow Host. From the ziggurats, Baron Mortvale gathers the dead and sends them out across the east.',
      'The Lantern Watch wants the city emptied of both. The Accord wants to know who shipped the grain, and the Royal Apothecary Guild wants the same pages for its own purposes. Nobody who comes here comes to rebuild.',
    ], bosses: {
      timmy_the_cruel: 'A swollen ghoul of King\'s Square, fat on the dead of the old market. Nobody knows who he was in life. The name is what the Order\'s scouts started calling him.',
      archivist_galford: 'Keeper of the city\'s records, now serving the Order. He is burning the archive page by page, and he has not said whose names he is burning.',
      balnazzar: 'The power in the Pyre Bastion. The zealots believe they serve the Light through their Grand Crusader. They obey him without question. He is not what he seems.',
      baroness_anastari: 'A noblewoman of Graymouth who died with her city and rose as a banshee. She serves Mortvale now, and her wailing carries across the ziggurats at night.',
      ramstein_the_gorger: 'An abomination stitched together in the slaughterhouse and fed on the city\'s dead. It guards the way to Mortvale\'s hall, and it is never full.',
      baron_rivendare: 'A lord of Wexmoor who gave himself to the Hollow Host before the plague came. It rewarded him with death and command of the ruined city.',
    } },
    dg_sunken_archive: { title: 'The Sunken Archive', section: 'dungeon', dungeon: 'sunken_archive', text: [
      'The Starborn of Sael\'anor wrote down everything they valued: star charts, songs, histories, the currents of every sea their ships crossed. They kept it all here. When the city sank, the library went down with its keepers still at their desks.',
      'The bargain that kept the prince\'s court alive kept the archive too. Its scholars do not age and do not leave. They copy the same pages over and over, and the ink has started to remember what it wrote.',
      'Lady Vessaria rules the archive for her prince. The soldiers in coral armour who walk out of the sea at Sael\'anor were written by her hand before they ever stood up.',
      'Admiral Vane\'s fleet has lost ships to currents nobody on the surface can chart. For the Accord, the archive holds both answers: the codex that keeps the ships afloat, and the quill that keeps the prince\'s army walking. Take both, and the Tidecrown fights blind.',
    ], bosses: {
      curator_ellaris: 'Keeper of the flooded stacks in life and in death. She still guards every shelf from careless hands, and she decided long ago that all living hands are careless.',
      the_inkbound_horror: 'Ten thousand years of spilled ink, given shape by the magic soaked into the reading hall. It has no mind of its own, only the half-read words it was made from.',
      lorekeeper_nerathil: 'The archive\'s senior scholar, who kept the Codex of Tides before the city sank and has not put it down since. He still charts the currents of a sea he cannot leave.',
      lady_vessaria: 'Aeldran\'s scribe since before the Sundering, and mistress of the archive. She writes the prince\'s will into the water, and what she writes, the drowned obey.',
    } },
    dg_shalzua_temple: { title: 'Temple of Shal\'zua', section: 'dungeon', dungeon: 'shalzua_temple', text: [
      'The Wavebreakers were a sea tribe, living off reef and tide. They gave their best catch and their dead to Shal\'zua, the loa of the deep water, and she gave them fair winds and full nets. The Kessari count them among their ancestors.',
      'When the isle sank, the tribe went down with their temple, still praying. Something in the dark heard them. It kept them, and it taught their priests new rites.',
      'The priests changed first. The Hexmother\'s bone charms bind the risen tribe to the temple, and the High Priest\'s knife keeps the altar wet. The drowned trolls in the Skullreef shallows walk because this temple tells them to.',
      'For the Krugar, these are not strangers. Hexxer Mazu came to the Skullreef to lay the Kessari\'s lost kin to rest, and to set their goddess free, if anything of her is left to free.',
    ], bosses: {
      hexmother_oyala: 'The tribe\'s eldest witch doctor, who drowned with her people and woke first. She raised the rest one by one and calls them her children. Her fetish holds them to the temple.',
      tidefang: 'A great eel kept in the tide pools as the temple\'s sacred beast. The Wavebreakers fed it for generations. It came through the sinking better than they did.',
      high_priest_zanjin: 'The last high priest of Shal\'zua, who kept her altar before the isle sank and keeps it still. He has not admitted that the goddess who answers him speaks with a different voice.',
      avatar_of_shalzua: 'The loa\'s own form, raised from the altar. It still wears Shal\'zua\'s face, and some of her memory. Whatever moves it now is not the loa of the sea.',
    } },
    dg_tidecrown_citadel: { title: 'The Tidecrown Citadel', section: 'dungeon', dungeon: 'tidecrown_citadel', text: [
      'The citadel was the heart of Sael\'anor, the seat of the Tidecrown line and the tallest thing on the isle. It sank whole. Ten thousand years of coral have grown over its halls, and the court inside never stopped holding court.',
      'Prince Aeldran believes he saved his people. He kept them alive, after a fashion, with a bargain he never fully understood. The crown he wears commands every drowned thing on the isle, but it was never his. It belongs to Nal\'veshra, the Deepmother, a spirit of the deep sea older than the Starborn. The crown is how she rules through him.',
      'She is the real power under the citadel. She kept the elves because they were useful to her. When the Wavebreakers\' prayers reached her in the dark, she ate their loa and put on her face. Everything that has walked out of the sea since Veshmira\'s storm has walked for her.',
      'The Accord came for the prince\'s crown and the Krugar for their lost goddess. Both found the same thing at the bottom of the citadel, and for one morning that was enough.',
    ], bosses: {
      commander_serathis: 'Captain of the prince\'s guard, who held the citadel gate on the day the sea came in. He is holding it still, in armour the coral grew over him.',
      tide_twin_myrel: 'Myrel and her sister Sorin, the prince\'s tidecallers, who once turned the sea around Sael\'anor for its ships. They drowned together and have never fought apart.',
      coralheart_colossus: 'A guardian of living coral that grew for ten thousand years in the gallery beneath the throne. The Deepmother\'s power runs through it like sap. Nobody made it. It grew.',
      prince_aeldran: 'The last prince of Sael\'anor, who bargained with the deep to keep his court alive. Proud and grieving, he wants the surface back, and he still does not know what he sold.',
      nalveshra: 'A spirit of the deep sea, older than the Starborn. She kept Sael\'anor alive for her own ends, swallowed the loa Shal\'zua, and ruled the isle through its prince for ten thousand years.',
    } },
    dg_molten_core: { title: 'The Magma Throne', section: 'dungeon', dungeon: 'molten_core', text: [
      'Vulcarn, the King Below, has slept in the sea of fire beneath Cinderpeak for longer than the Slagborn have lived there. After the Long War they borrowed to rebuild, and they pay it back by digging, each hall a little deeper, each one a little closer to the fire.',
      'Down here the rock runs like water. Hounds of living lava prowl the caverns, fire elementals walk the rune-lit halls, and the ashbounds, his own tall and horned servants, keep the runes that feed the fire.',
      'For all those years the Emperor held the mountain in the King Below\'s name, and the King Below slept. When Grimmark fell, the mountain began to shake.',
      'Accord and Krugar go down for the same reason. If Vulcarn climbs out of his lake, the Cinderfields will only be the first land to burn.',
    ], bosses: {
      magmadar: 'Cinderhound is the greatest of the core hounds, a two-headed beast of lava that the King Below keeps like a favourite dog. It hunts the caverns nearest the gate.',
      garr: 'Stonecore is a lord of living rock, bound to the Core when Vulcarn first came. His firesworn are pieces of his own body, and they burn when they break.',
      baron_geddon: 'Baron Ashfall is a fire lord who carries the heat of the lake inside him. He turns the living into bombs and lets them burn out among their friends.',
      golemagg: 'Magmahulk the Incinerator is a molten giant who guards the deep halls with his core ragers. He is slow, vast and patient, and nothing he strikes stays standing.',
      sulfuron_harbinger: 'Brimstone is the Harbinger, the King Below\'s herald among the ashbounds. Where he walks, his priests follow, and they keep one another burning.',
      majordomo_executus: 'Steward Cindral runs the King Below\'s house the way a steward runs a keep. He answers only to Vulcarn, and he carries the rune that can call his master up.',
      ragnaros: 'Vulcarn the King Below, a lord of elemental fire older than any kingdom. Grimmark called him to win a war. Two hundred years later, the mountain still burns for it.',
    } },
    dg_onyxias_lair: { title: "Veshmira's Lair", section: 'dungeon', dungeon: 'onyxias_lair', text: [
      'Veshmira made her nest in the black rock at the heart of the Dragonmire long ago, on a hoard no one has ever counted but her. From there she lent it out, coin by warm coin, through the Black Ledger, and waited for the debts to grow.',
      'When Marshal Hale laid her books open in Kingsmere, she came for her collateral and was beaten back. She flew home to the cave, to the warders and whelps she had been raising for years, and called up a storm over the sea behind her to guard the hoard. The storm hid the isle it had torn from the deep, and it held for as long as she did.',
      'The lair is a tunnel of cracked, glowing stone and a great cavern around a lake of fire. Her eggs lie everywhere. So do the bones of those who came before.',
      'Harborwatch and Mudwall sent their best into the dark for the same reason. While she lived, the sea stayed closed, and every kingdom that owed her would stay owned.',
    ], bosses: {
      onyxia: 'Veshmira of the Black Brood, the Ledger\'s creditor. She never needed a mask: Lady Thorne did her talking at court. In her own lair she needs only fire, gold, and whelps to fill the air.',
    } },
    // ------------------------------------------------------------ zones
    zn_northshire_valley: { title: 'Halden Vale', section: 'zone', zone: 'Halden Vale', text: [
      'Halden Abbey has trained priests and soldiers for Kingsmere for longer than anyone in the valley can remember. It is a quiet place by design, walled in by hills and vines.',
      'The quiet is wearing thin. Kobolds dig at Tinder Hollow, and Grey Hood thugs have taken the vineyards and chased the pickers out. Marshal Aldous Venn holds the abbey with a handful of guards, and he does not expect more.',
    ] },
    zn_stormwind_city: { title: 'Kingsmere', section: 'zone', zone: 'Kingsmere', text: [
      'Kingsmere was half rubble at the end of the Long War. The crown rebuilt it on credit, and the white walls still shine. The bill has not been paid.',
      'The king\'s seat stands empty. King Rhodric is dead, and Lord Regent Edmund Carrow rules until Prince Tamlin comes of age. At court he leans more each month on Lady Thorne, the Mistress of Coin. The Market Ward is busy, the Hall of Banners is swept clean, and Kingsmere Gaol is full of debtors.',
    ] },
    zn_coldridge_valley: { title: 'Rimefold Valley', section: 'zone', zone: 'Rimefold Valley', text: [
      'Rimefold Valley sits high in the snow, sheltered from the worst of the wind. Brunhall has trained the dwarves\' young fighters there for generations.',
      'This winter the ground itself is giving trouble. Gravelmaw cavekin claw up out of the earth all over the valley, and the Grimtooth trolls have dug into the cave to the west. The guards are stout and the beer is good, but both are running low.',
    ] },
    zn_ironforge: { title: 'Keldrun', section: 'zone', zone: 'Keldrun', text: [
      'Keldrun is a city carved into the heart of a mountain, and the dwarves have held it since before the human kingdoms had names. Its forges never go cold.',
      'It shelters more than dwarves now. When Gearhollow fell, its surviving gnomes came here with little more than their tools. Tinkmaster Gizzlebolt and his people work, plan and wait for the day they can go home.',
    ] },
    zn_teldrassil: { title: 'Greatbough', section: 'zone', zone: 'Greatbough', text: [
      'After the last war the Sylari planted a new great tree off the northern coast and raised their home in its branches. Greatbough is young, and its people had hoped it would be clean.',
      'It is not quite. Gloom moss grows on the thornling, the timberlings by Lake Seliwen have turned strange, and the Mossback bearkin of Rootdeep Barrow have gone wild. Something darker stirs at Gloomrock.',
      'The druids of Dewfern Glade and the Wood Elf Wardens at Ithrenne keep watch under the moonlight, and they are worried.',
    ] },
    zn_darnassus: { title: 'Nyrwen', section: 'zone', zone: 'Nyrwen', text: [
      'Nyrwen is the newest city of the Sylari and one of the oldest peoples in the world. It rests high in the crown of Greatbough, all pale stone and moonlit water.',
      'The wood elves built it slowly and carefully, as they do everything, and they keep the old moon rites in its halls. They are wary of outsiders, but the Accord is welcome here, for now.',
    ] },
    zn_durotar: { title: 'Dunescar', section: 'zone', zone: 'Dunescar', text: [
      'Dunescar is red rock and dry thorn, and the orcs chose it anyway. Grask led them here after the Long War to build a home that belonged to nobody else, and owed nothing to anyone.',
      'That home is still threatened from within and without. Hollow Eye warlocks call up demons in the Blooding Grounds. Brineholt marines have dug in at Saltwall Keep. On the Kessari Isles, the witch doctor Mokku the Hexer has turned his own Kessari people into hexed slaves.',
      'Bonewall holds the road between them all. It is a hard land, and the Krugar means to keep it.',
    ] },
    zn_orgrimmar: { title: 'Vazhrak', section: 'zone', zone: 'Vazhrak', text: [
      'Vazhrak was built in a canyon of red stone, fast and strong, by a people who had lived too long in camps. It is loud, hot and proud of both.',
      'This is where the Warchief speaks and the Krugar listens. Orcs, trolls, hornfolk and Reclaimed trade in its streets. Not everyone below them is loyal: the Hollow Eye hides in the chasm under the city.',
    ] },
    zn_mulgore: { title: 'Greensward', section: 'zone', zone: 'Greensward', text: [
      'Greensward is wide grass and gentle hills, the homeland the hornfolk fought long years to reach. They hunt the plains as they always have, and give thanks to the Grass Mother for each kill.',
      'Others want the land too. Hollowtusk spinehide raid from the ravine below Calf Hill Camp. Ashpelt gnolls poach the herds from Ashpelt Rock, and the Deepgold Company is tearing open the ground for ore.',
      'Ossa Village sits at the heart of it, where Tarro of Ossa, son of the old chief, watches over his people.',
    ] },
    zn_thunder_bluff: { title: 'Hornwind Mesa', section: 'zone', zone: 'Hornwind Mesa', text: [
      'Hornwind Mesa stands on tall mesas above the plains of Greensward. The hornfolk built it when their wandering finally ended, with bridges of rope and wood strung between the heights.',
      'It is a calm city. The wind never stops, and neither does the smell of cookfires and tanning hides. The hornfolk are slow to anger, and the Krugar is glad they stand with it.',
    ] },
    zn_tirisfal_glades: { title: 'Pallmoor', section: 'zone', zone: 'Pallmoor', text: [
      'Pallmoor was the green heart of Wexmoor, until the plague came. Its farms are graveyards now, and not all of the dead rest easy.',
      'The Reclaimed are the dead who woke from the plague with their minds their own. They broke free of the Hollow Host and made this land theirs. From Last Bell and Mossgate they put down the mindless, study the plague and hold the roads. Gnolls and spiders crawl through the ruins of Varden Mills and the old mines.',
      'The Order of the Pyre calls every one of them a monster to be burned. It holds a watch post off the road and a monastery beyond it, and it does not stop coming.',
    ] },
    zn_undercity: { title: 'Gravenhold', section: 'zone', zone: 'Gravenhold', text: [
      'Under the ruins of Wexmoor\'s capital run the crypts and sewers of its old kings. The Reclaimed have made them a city, lit green and always damp.',
      'Nobody else wanted it, and that suits them. The Royal Apothecary Guild works deep in its halls, studying the plague that made them. The Reclaimed stand with the Krugar, but they keep their own counsel down here.',
    ] },
    zn_elwynn_forest: { title: 'Ambermoor', section: 'zone', zone: 'Ambermoor', text: [
      'Ambermoor is Kingsmere\'s back garden: farms, lakes and old woods along the road to the city gates. For years it was the safest place in the kingdom.',
      'It is less safe now. Kobolds dig in Deepcut Mine, mirelings raid the shore of Stillwater Lake, and Grey Hood bandits rob the farms. At Greywood Verge, Tallgrass gnolls cross into Ambermoor and grow bolder under a brute called Old Snaggle.',
      'Marshal Brede keeps what order he can from Brackenford, with too few guards. The Lion\'s Pride is still full every night.',
    ] },
    zn_dun_morogh: { title: 'Kaldvik', section: 'zone', zone: 'Kaldvik', text: [
      'Kaldvik is the snowbound land around Keldrun, and the dwarves have farmed and hunted it for as long as they have held the mountain. Bjornstad keeps the pass warm, mostly with Maltsson ale.',
      'The cold has always been the easy part. Grimtooth trolls push closer from their hold in the west, and wendigos come down from the Rimebone Den. At Ranson Ranch, bears and leopards take the rams.',
      'Worst of all is the gate of Gearhollow. The gnomes lost their city, and what came out of it still wanders the snow.',
    ] },
    zn_westfall: { title: 'Longfield', section: 'zone', zone: 'Longfield', text: [
      'Longfield fed Kingsmere for generations. Now its fields are dry, its farmhouses are empty, and the Grey Hoods holds Fenwick and the mines around it. Their harvest watchers guard the crops against the farmers who planted them.',
      'The farmers asked the city for soldiers. None came. So Bram Oakhollow and the Farmers\' Watch made a stand at Warrick\'s Rise, and they take help from anyone.',
      'Families like the Tucks and the Wenhams stay on what is left of their land. They have nowhere else to go.',
    ] },
    zn_the_barrens: { title: 'The Scrublands', section: 'zone', zone: 'The Scrublands', text: [
      'The Scrublands is a long, hot plain of yellow grass and dry water holes. Dustfort sits in the middle of it, and the Krugar has held it with blades since the day it was built.',
      'The land fights back. Galloran centaurs raid the caravans, and the Snoutspike spinehide grow bolder near Hollow Tower. Deepgold Company goblins foul the Slick, and dwarves from Keldrun dig at the Stonegrave Dig.',
      'In the south, the thorns of the Thorn Warrens grow from the blood of the Great Boar. The spinehide call them holy.',
    ] },
    zn_redridge_mountains: { title: 'Stoneharrow Mountains', section: 'zone', zone: 'Stoneharrow Mountains', text: [
      'Stoneharrow is red hills and a long, clear lake, and Longbridge is a town built at the water\'s edge. The bridge across Lake Calder is half built, and the town badly needs it finished.',
      'The orcs never really left these hills. Cinderpeak orcs hold Watcher\'s Keep and push down out of Scorched Valley. Gnolls come from the canyons at night, and mirelings drag workers off the bridge.',
      'Marshal Corwin keeps the Stoneharrow Watch with too few soldiers, and hunters say there are black whelps in the far valleys.',
    ] },
    zn_stonetalon_mountains: { title: 'Highcrag Mountains', section: 'zone', zone: 'Highcrag Mountains', text: [
      'Highcrag is a land of high peaks and old forests, sacred to the druids and to the hornfolk. Tallstone Retreat is the Krugar\'s hold in the mountains, and the Kessari camp at Camp Vosh guards the southern path.',
      'The Deepgold Company is cutting it apart. Their loggers and walking saws strip Sawtooth Crag bare. Redclaw harpies hold the Screaming Vale, and the Sourhorn, hornfolk who turned from the Grass Mother, camp to the south.',
      'The earth here is wounded, and the shamans can hear it.',
    ] },
    zn_ashenvale: { title: 'Elderglen', section: 'zone', zone: 'Elderglen', text: [
      'Elderglen was the heart of the Sylari forests long before any human king was crowned. The Wood Elf Wardens of Ilvaris still guard it, and they count every tree that falls.',
      'The trees fall anyway. The Woodcleaver orcs at Stumpwatch cut timber for the Krugar, and neither side thinks the forest is the other\'s to keep. Their patrols meet on the roads and nowhere else.',
      'Both have worse neighbours. Naga have crawled onto the Coral Strand, satyrs hold Hornhold and Gloomfire Hill, and the Briarpelt bearkin have turned on everyone. The forest is old, and it is not at peace.',
    ] },
    zn_duskwood: { title: 'Wraithwood', section: 'zone', zone: 'Wraithwood', text: [
      'Wraithwood was a green forest once, a short ride from Kingsmere. Then a darkness settled over it, and the sun never came back. The people who stayed learned to live in the night.',
      'Lanternby holds on behind its walls. Lord Grey keeps the town, and the Lamplighters keeps what it can of the roads, because the kingdom\'s soldiers stopped coming long ago. Werewolf hunt Hollin Grove, the dead climb out of Harlow Cemetery, and Patchwork walks the road.',
      'The town keeps its lamps lit and its doors barred. Nobody in Lanternby expects help from the city any more.',
    ] },
    zn_hillsbrad_foothills: { title: 'Greymead Foothills', section: 'zone', zone: 'Greymead Foothills', text: [
      'Before the plague, Mourncross was a human town like any other in Wexmoor. The Reclaimed who hold it now were its neighbours once. Some of them were born there.',
      'The farms of Greymead Fields still feed the Accord, and the Reclaimed mean to starve them out, deed by deed and field by field. The Royal Apothecary Guild works in the town\'s cellars, and nobody asks on what.',
      'South of the fields, the Black Ledger have taken Blackhelm Keep and rob anyone on the road. It is a quiet war in green hills, and it is not a clean one.',
    ] },
    zn_silverpine_forest: { title: 'Needlewood', section: 'zone', zone: 'Needlewood', text: [
      'Needlewood lies between the Reclaimed lands of Pallmoor and the hills of Greymead. It has not been a safe road since the plague years.',
      'The curse came from Greyhowl Keep, where the sorcerer Cairn made werewolves of the forest\'s people. Ashwick Village looks quiet by day. At night its people change, and the Howlmoor werewolves hunt the road.',
      'The Reclaimed want the forest held, if only so their couriers reach Mourncross alive. For now it belongs to the wolves after dark.',
    ] },
    zn_wetlands: { title: 'Greenfen', section: 'zone', zone: 'Greenfen', text: [
      'The Greenfen are the road between Keldrun and the north, and the marsh has never made it easy. Gullhaven holds the coast, and Captain Brynjar\'s dwarves keep the road open as far as they can.',
      'The marsh has other owners. Mirelings raid from Reedgill Marsh, gnolls rob the road, and the Slagborn dig at Kaldhelm for reasons of their own. At Torvald\'s Dig the Explorers\' League tries to learn what was buried here first.',
      'East, the Wyrmchain orcs hold Drakestone Hold, and something with red wings is chained beneath it. Few people go to look.',
    ] },
    zn_stranglethorn_vale: { title: 'The Vinewild', section: 'zone', zone: 'The Vinewild', text: [
      'Vinewild was the heart of a troll empire, and its ruins still stand in the jungle: Tazzu, Umbaa, Mokkari. The Scaldback and Bonegrin tribes fight over them, and over little else.',
      'Everyone else came later. Lieutenant Garrow\'s rebels hold Rebel Camp, the Krugar keeps Camp Skarn on the coast, and the Deepgold Company strips the trees for profit. Colonel Drayke\'s men once served the same crown. Now they answer to no one.',
      'At Wexley\'s Expedition, hunters of both factions share one fire and argue about tigers. It is the one camp in the jungle where nobody asks your banner.',
    ] },
    zn_arathi_highlands: { title: 'Kinloch Highlands', section: 'zone', zone: 'Kinloch Highlands', text: [
      'The Kinloch Highlands were the cradle of the first human kingdom. Highhold Keep still stands, but ogres and the Black Ledger hold most of it. The League of Kinloch fights from Holdfast Point to win it back.',
      'The Krugar holds Chainbreak. Its orcs remember the camps where humans once kept them, and they will not share the highlands. Rotbough trolls, Rockbrow ogres and the spirits loose at the West Binding Stones trouble both.',
      'In the pines lies Silverleaf Lodge, a high elf village burned two years ago. The Black Ledger were blamed. Their camp stands in the ashes now.',
    ] },
    zn_tanaris: { title: 'Sirocco', section: 'zone', zone: 'Sirocco', text: [
      'Sirocco is sand to every horizon, and whoever holds the water holds the desert. In Coppergulch that is Baron Coinsworth, and his water works run day and night.',
      'Coppergulch serves anyone with coin, Krugar or Accord, and asks nothing about where the coin came from. Dustcloak bandits steal the water, Blackgull pirates hold Rotten Plank Cove, and the Duneskin trolls of The Dune Temple watch the dunes from behind their walls.',
      'Plenty of people come to Coppergulch to be a long way from somewhere else. Nobody asks where.',
    ] },
    zn_feralas: { title: 'Ferndeep', section: 'zone', zone: 'Ferndeep', text: [
      'Ferndeep is a country of giant trees and long rain, far from any city. The wood elves built here long ago, and their ruins are older than anything the Krugar remembers.',
      'Commander Ilara Starfeather holds Starfeather Hold off the Forgotten Coast, with the Wood Elf Wardens behind her. Inland, the hornfolk of Camp Ruga keep their own watch. The two camps rarely meet, and prefer it that way.',
      'The wilds belong to neither. Stonegut ogres hold the old roads, Mossgut gnolls raid the hills, harpies hunt the highlands and the Spitecoil naga come up from the sea.',
    ] },
    zn_desolace: { title: 'Mournwaste', section: 'zone', zone: 'Mournwaste', text: [
      'Mournwaste is a grey waste of dust and bone. The centaur say it was not always so. Their tribes came from a wandering god and Ghesra, a princess of the earth.',
      'The wandering god was killed, and Ghesra carried him down into the Gemfall Caves. Her grief has soaked into the ground ever since. The land above is poisoned, and the caves below have filled with twisted things.',
      'The Wood Elf Wardens of Starfeather and the hornfolk of Camp Ruga both send people into The Gemfall Caves. They go for the same reason. The poison is spreading.',
    ] },
    zn_un_goro_crater: { title: 'Greenmaw Crater', section: 'zone', zone: 'Greenmaw Crater', text: [
      'Greenmaw Crater is a green bowl sunk into the desert, hot and wet and far older than anything around it. Beasts walk here that have died out everywhere else, and the plants bite.',
      'Marshal\'s Refuge is an explorers\' camp under the crater wall, open to anyone who can live on its terms. Marshal Stoke keeps it standing. The explorers come for the bones, the strange stones and the questions nobody has answered.',
      'The crater answers back. Hiveborn swarm the Hive Scar, Smokeplume Ridge smokes at its heart, and the tar pits hold whatever the jungle has already killed.',
    ] },
    zn_burning_steppes: { title: 'The Cinderfields', section: 'zone', zone: 'The Cinderfields', text: [
      'The Cinderfields were green when the Slagborn built their first city here. The deeper they dug under Cinderpeak, the hotter the ground grew, until the fields burned black. The Ruins of Grimmark are what is left.',
      'Cinderpeak looms over the steppes. The Slagborn dig beneath it, the Cinderpeak orcs hold their stronghold in Lord Kethran Vale\'s name, and black dragonspawn guard the Broodwing Path.',
      'Drummond\'s Vigil and Brand Crest watch the mountain from opposite ends of the steppes. The Accord has one more reason: Marshal Hale is inside, alive and in chains.',
    ] },
    zn_western_plaguelands: { title: 'West Rotmoor', section: 'zone', zone: 'West Rotmoor', text: [
      'The West Rotmoor were the farmland of Wexmoor. The plague took them first, and the Hollow Host came after. Elmsworth was a town of granaries. Now it is a town of the dead.',
      'At Castle Ardmore the Varga family sold their keep to pay their debts, and the Blackcloister teaches necromancy in its halls. In Morrowglen the Order of the Pyre trusts no one, living or dead.',
      'The Accord holds Greyfrost Camp and the Reclaimed hold the Bulwark. Officers of the Lantern Watch stand in both, and keep one count for everyone.',
    ] },
    zn_eastern_plaguelands: { title: 'East Rotmoor', section: 'zone', zone: 'East Rotmoor', text: [
      'The East Rotmoor are where the plague did its worst. Nothing grows clean here, and the roads belong to the Hollow Host.',
      'At their heart stands Graymouth, whose lord barred the gates with the living still inside, hoping to keep the plague out. It was not enough. The Hollow Host walk its streets now, and the Order of the Pyre holds what it can of the rest, behind gates it will not open.',
      'The Lantern Watch sends people in anyway. Someone has to count what is left.',
    ] },
    zn_winterspring: { title: 'Icewold', section: 'zone', zone: 'Icewold', text: [
      'Icewold is the far north of the wood elf lands, a valley of snow and old ruins. The Starborn once kept their halls by Lake Eluvain, and their ghosts have never quite left.',
      'Coldcoin is a goblin trading town in the drifts, open to anyone who pays. Hunters, furriers and scholars pass through, and the blue dragons of Crystalhall watch from their caves.',
      'Something is wrong in the forest. The Icebrow bearkin have turned savage on a drink of their own brewing, and the snowcats are sick. The druids of the Circle want to know where the taint comes from.',
    ] },
    zn_tidewatch_coast: { title: 'Tidewatch Coast', section: 'zone', zone: 'Tidewatch Coast', text: [
      'The Tidewatch Coast was the edge of Sael\'anor before the Heartfire exploded. It is dry land again after ten thousand years. Its orchards still stand, grey and dripping, and the husks that walk between them were Starborn once.',
      'Admiral Hollin Vane\'s Brineholt ships put the Accord ashore at Brightwater Landing. Lyssa Moonquill holds the Archive Steps, the way down to the Sunken Archive, where Lady Vessaria\'s writing still raises the drowned.',
      'Past the Kelpwood, soldiers in coral armour march out of the sea. Prince Aeldran has not forgotten his city. He means to have it back.',
    ] },
    zn_skullreef_isles: { title: 'Skullreef Isles', section: 'zone', zone: 'Skullreef Isles', text: [
      'The Skullreef Isles were home to the Wavebreaker trolls, who served the sea loa Shal\'zua. When the Heartfire exploded, the isle sank and took the tribe and their goddess with it.',
      'The storm has brought them back. The Wavebreakers walk again, drowned and faithful, praying to a loa who wears Shal\'zua\'s face but no longer answers like her. Hexmother Oyala and High Priest Zan\'jin lead the prayers.',
      'Hexxer Mazu has brought Kessari and Reclaimed crews to Bloodtide Landing. The trolls want the loa put to rest. The Reclaimed want to know what raises these dead.',
    ] },
    zn_the_stormveil_reach: { title: 'The Stormveil Reach', section: 'zone', zone: 'The Stormveil Reach', text: [
      'The Stormveil Reach is the heart of the risen isle. The Drowned Causeway runs out across the shallows from both landings, and at its end stands the Tidecrown Citadel, the seat of Prince Aeldran.',
      'Tidebound soldiers hold the causeway, and drowned Wavebreakers march beside them. Whatever serves the prince serves the Deepmother too, whether he knows it or not. Nal\'veshra waits beneath the citadel.',
      'The Accord and the Krugar reach the causeway from opposite shores. For once, neither side has strength to spare for the other.',
    ] },
    zn_dustwallow_marsh: { title: 'Saltmarsh', section: 'zone', zone: 'Saltmarsh', text: [
      'Saltmarsh is a long stretch of fog and black water on the coast south of the Scrublands. Harborwatch stands on its island at the edge of the sea, a stone fort of the Accord with blue banners on its towers. The Krugar keeps Mudwall Village in the swamp to the north-west, behind a palisade of sharpened logs.',
      'Deeper in, the marsh belongs to black dragons. Whelps hatch in the Quagmire, drakeborn burn the Scorched Fen, and something far larger has made its nest in the Dragonmire. Neither side comes this far alone.',
    ] },
  });
})(typeof window !== 'undefined' ? window : globalThis);
