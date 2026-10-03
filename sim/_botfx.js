// Preload that sets the bots' effect-item chance (#56, G.BOT_FX.at60) once src/game.js has loaded, so a gate can be run
// with and without bot effects on the same code:   BOTFX=0 node -r ./sim/_botfx.js sim/group.js
// (combine with -r ./sim/_seed.js for a seed). Unset BOTFX: nothing changes.
const Module = require('module'), load = Module._load;
Module._load = function (req, parent, isMain) {
  const r = load.apply(this, arguments);
  if (process.env.BOTFX != null && /src[\\/]game(\.js)?$/.test(req) && globalThis.G && globalThis.G.BOT_FX) globalThis.G.BOT_FX.at60 = +process.env.BOTFX;
  return r;
};
