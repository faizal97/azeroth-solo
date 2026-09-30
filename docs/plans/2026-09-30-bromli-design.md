# Bromli Beerhammer: design

The third Legend: a mountain dwarf warrior (damage), levels 44–55, both factions. His creator chose the story
(2026-09-30). Funny and warm.

## The story

Bromli has fought in every war and every tavern brawl in the land, and nobody has ever written a song about him. He
wants a ballad. So he goes after the most famous beasts and bullies in the south: a giant in the desert dunes, the king
of the dinosaurs in a hidden jungle crater, the champion of a fire-pit arena. The player tags along to make sure he
survives his own plans. At the end Widya writes **The Ballad of Bromli Beerhammer**, which is mostly about him falling
off things, and he has never been happier.

It is Widya's next Songbook chapter (her later chapters follow her want, one song each), so it works whether or not
the player did her questline: if they did, she knows them; if not, she is a wood elf bard Bromli found.

## Questline (7 quests)

| Lvl | Quest | Where | What |
|---|---|---|---|
| 44 | Nobody Sings About Bromli | Coppergulch | Meet him. He needs a deed and a witness: watch him fight 8 Sandbrute Brutes. |
| 46 | The Dune Giant *(story fight, 3 players, Bromli joins)* | Dawnstone Ruins, Sirocco | Old Duneback, a sand giant (new). He climbs it and falls off. |
| 49 | Dinosaur-Proof | Marshal's Refuge, Greenmaw Crater | 8 thick hides from the Thunderers, for armour a dinosaur cannot bite through. |
| 52 | King of the Crater *(story fight)* | Tooth Run | King Stomp (the existing Wanted boss), with Bromli. He rides it for a moment. |
| 53 | Entry Fee | Brokemaw Rock, the Cinderfields | The Smokebelly ogres' fire pit takes fighters who have beaten 8 of their brutes. |
| 54 | The Champion of the Pit *(story fight)* | The fire pit (new scene) | Thudd the Unbeaten (new), an ogre champion. Bromli is thrown out of the ring twice. |
| 55 | The Ballad of Bromli Beerhammer | Coppergulch | Widya sings it (a scene). He cries. |

The fights reuse the zones' own mobs for the trash. Story fights only show while you are on their quest, and Bromli
joins the group for them (the Legend rule).

## After 55

- **Cameo:** about 1 Group Finder run in 5, at most every 3 days, as a damage dealer, with his own lines (the Legend rule).
- **Abilities:** Beerhammer Charge (rushes a target and knocks it down for a moment) and Tavern Brawl (hits everything
  near him).
- **Keepsake:** the Beerhammer Cloak, a torn red cloak like his, worn on your back (a look, no stats).
- **Title:** "the Ballad-Worthy".

## Art (from his creator's two reference pictures, kept out of the public repo)

Gold-rimmed aviator sunglasses; swept-back brown hair; a big brown beard with a moustache; scaled grey-silver plate
with gold trim and rivets; a gold compass-star badge on the left shoulder; a torn red cloak and scarf; brown leather
belts with gold buckles; a two-handed greatsword with a gold cross-guard. Short and broad (a dwarf), arms crossed or the
sword on his shoulder, looking pleased with himself.

- Party/world sprite (`ART.legend('bromli')`), story actor, icon `legend_bromli`, ability icons, keepsake icon and its
  back look.
- New: `duneback` (sand giant), `thudd` (ogre champion), scene `smokebelly_pit` (the fire-pit arena).

## Rules

- Lore bible: Bromli goes in Characters; `node tools/lorekeeper.js` checks every line. No reveals are touched.
- Music: the ballad scene uses Widya's existing town music (nothing new to approve).
- Balance: each story fight is sim-checked like a Wanted target of its level.
