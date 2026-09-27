// Runs after every zone has loaded: derived fields that need the whole world.
(function (root) {
  const D = root.D;
  // Stamp "Drops from <boss>, <dungeon>" onto boss loot, using the dungeon each boss belongs to.
  for (const dk in D.DUNGEONS) for (const pl of D.DUNGEONS[dk].pulls) for (const mk of pl.mobs)
    for (const id of (D.MOBS[mk].loot || [])) if (D.ITEMS[id] && !D.ITEMS[id].source) D.ITEMS[id].source = `${D.MOBS[mk].name}, ${D.DUNGEONS[dk].name}`;
  for (const k in D.ABILITIES) D.ABILITIES[k].id = k; // engine looks up talent effects by ability id
  delete D.item; delete D.zone; // authoring helpers only
})(typeof window !== 'undefined' ? window : globalThis);
