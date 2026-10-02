// Preload that seeds an unseeded sim, so a candidate can be compared with the baseline on the same dice (#4):
//   SEED=n node -r ./sim/_seed.js sim/group.js
// The same generator as sim/lvpace.js and sim/tactics.js; no SEED is seed 0. A sim that seeds itself overrides this.
{ let s = (0x5eed1e55 ^ Math.imul(+(process.env.SEED || 0), 0x9E3779B1)) >>> 0; Math.random = () => { s = (s + 0x6D2B79F5) >>> 0; let x = s; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
