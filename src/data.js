// Node entry point for the game data (sims and tools use require('../src/data.js')).
// The data itself lives in src/data/: core.js, one file per zone in zones/, then finalize.js.
// The browser build (build.py) inlines the same files in the same order from src/data/files.json.
for (const f of require('./data/files.json')) require('./data/' + f);

// Levelling-tool candidates (#4): visible changes to an ability's numbers (its tooltip shows them), for the sims to
// measure before the game designer picks one. They exist only here, in the sims' entry point: the game never has
// them. Turn on with TOOLS=priest_pain,druid_wrath node sim/....js
{
  const D = globalThis.D, A = D.ABILITIES;
  D.TOOLS = {
    // Priest: Word of Pain ticks about 60% harder (5 + 1.1 a level -> 8 + 1.8 a level, 6 ticks over 18 sec)
    priest_pain: () => { Object.assign(A.sw_pain.dot, { dmg: 8, perLvl: 1.8 }); },
    // Priest: Mind Blast every 5 sec instead of 8, and a quarter cheaper (50 + 4 a level -> 38 + 3 a level)
    priest_blast: () => { Object.assign(A.mind_blast, { cd: 5, cost: 38, costPerLvl: 3 }); },
    // Druid: Wrath casts in 1.5 sec instead of 2 (the same damage)
    druid_wrath: () => { A.wrath.cast = 1.5; },
    // Druid: Moonbeam's burn lasts 12 sec instead of 9 and ticks 50% harder (3 + 0.8 a level -> 4.5 + 1.2, 4 ticks)
    druid_moon: () => { Object.assign(A.moonfire.dot, { ticks: 4, dmg: 4.5, perLvl: 1.2 }); A.moonfire.desc = A.moonfire.desc.replace('over 9 sec', 'over 12 sec'); },
  };
  const on = (process.env.TOOLS || '').split(',').filter(Boolean);
  for (const k of on) { if (!D.TOOLS[k]) throw new Error(`unknown TOOLS entry '${k}' (have: ${Object.keys(D.TOOLS).join(', ')})`); D.TOOLS[k](); }
  D.TOOLS_ON = on;
}
