// Node entry point for the game data (sims and tools use require('../src/data.js')).
// The data itself lives in src/data/: core.js, one file per zone in zones/, then finalize.js.
// The browser build (build.py) inlines the same files in the same order from src/data/files.json.
for (const f of require('./data/files.json')) require('./data/' + f);
