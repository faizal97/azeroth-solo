# The wardrobe: design

2026-09-30. Agreed with Faizal. Step 2 of docs/plans/2026-09-30-horizontal-progression-design.md.

## What a look is today

Only items with a `look` (`[place, artKey]`) change how a character looks: 37 of 801 items, 36 distinct looks, in five
places: weapon (21), back (9), chest (3), legs (3), ranged (1). Everything else shows the class outfit. `G.gearLooks(c)`
turns worn items (plus a Legend keepsake, `P.keepsake`) into the picture. The wardrobe matters most for the looks still
to come: Trial season looks, Hard raid recolours, keepsakes.

## Collecting

- A look joins the wardrobe when you loot, equip or buy an item that has one.
- **Account-wide:** a new list `looks` (entries `place:artKey`) in the account store (`azsolo.account`), next to Mentor
  Marks and heirlooms. Cloud save syncs it by adding `looks` to its union lists (`LISTS` in src/cloud.js), so two
  devices merge to the union and never lose a look.
- **First open:** it collects every look already on this device's characters (worn, bags, bank), so nobody starts
  empty.

## Showing

- Hero → Character: a **Wardrobe** button beside Equipment.
- One row per place (Weapon, Ranged, Chest, Legs, Back). Each row picks **Your gear** (the worn item's look, as now),
  any owned look the class could wear (armour type for chest and legs, weapon type for weapon and ranged, the same
  rules as `G.canUseItem`), or **Hidden** (back and ranged only).
- Saved per character as `P.wardrobe = { place: artKey | 'hidden' }`. Stats never change.
- `G.gearLooks` applies `c.wardrobe` over the worn looks, so everyone sees it: the hero, bots' views of you, and
  Friends (the Friends card gains `wardrobe`; today it sends no keepsake either).
- **Legend keepsakes move into the Back row.** A keepsake is offered once that character has finished the Legend's
  questline (as now). The Hero screen's "Wear the ..." button goes; an existing `P.keepsake` becomes
  `P.wardrobe.back` on load.

## Checks (sim/wardrobe.js, run by build.py)

- Looting, equipping and buying collect a look; the first open collects from existing characters.
- Class limits: a mage cannot show mail or a sword; Hidden only for back and ranged.
- A chosen look shows in `G.gearLooks`; Your gear falls back to the worn item.
- The Friends card carries the wardrobe.
- `CLOUD.mergeAccount` unions `looks`.
- An old save with `P.keepsake` loads with the keepsake on the back.
