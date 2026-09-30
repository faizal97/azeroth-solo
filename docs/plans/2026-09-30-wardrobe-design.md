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

- Hero → Character: a **Wardrobe** button under Equipment. It shows one row per place (Weapon, Ranged, Chest, Legs,
  Back) with the look showing now and a count ("2 / 9").
- Tapping a place opens a **grid of every look the class could wear** there (armour type for chest and legs, weapon type
  for weapon and ranged, the same rules as `G.canUseItem`), sorted by level: a collection log. Collected looks are in
  colour, the rest greyed; tapping one tries it on the preview, and a greyed one says where it drops. **Show this**
  keeps it. **Your gear** (the worn item's look) and **Hidden** (back and ranged only) come first. (A row of buttons
  per place was built first and replaced the same day: it would not scale to many looks.)
- Keepsakes join a place's grid only once earned, so a Legend's name never shows before their story.
- Saved per character as `P.wardrobe = { place: artKey | 'hidden' }`. Stats never change.
- `G.gearLooks` applies `c.wardrobe` over the worn looks, so it shows wherever your character is drawn: the hero, your
  party sprite, the character select. (Friends only see a portrait, never gear, so their card needs no change.)
- **Legend keepsakes move into the Back row.** A keepsake is offered once that character has finished the Legend's
  questline (as now). The Legend page's "Wear the ..." button stays as a shortcut to the same Back row setting; an
  existing `P.keepsake` becomes `P.wardrobe.back` on load.

## Checks (sim/wardrobe.js, run by build.py)

- Looting, equipping and buying collect a look; the first open collects from existing characters.
- Class limits: a mage cannot show mail or a sword; Hidden only for back and ranged.
- The log lists uncollected looks, never one the class cannot wear, and keepsakes only once earned.
- A chosen look shows in `G.gearLooks`; Your gear falls back to the worn item.
- `CLOUD.mergeAccount` unions `looks` (and cloud save's account writer now keeps them; it used to keep only Marks and
  heirlooms).
- An old save with `P.keepsake` loads with the keepsake on the back.
