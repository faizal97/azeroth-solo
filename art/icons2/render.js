// Verifies src/art_icons2.js and renders contact sheets into art/icons2/out/.
// Usage: node art/icons2/render.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out');
const RSVG = '/opt/homebrew/bin/rsvg-convert';
fs.mkdirSync(OUT, { recursive: true });
const BASE = fs.readFileSync(path.join(ROOT, 'src/art.js'), 'utf8');
const SRC = fs.readFileSync(path.join(ROOT, 'src/art_icons2.js'), 'utf8');

const NEW = ['hamstring', 'cleave', 'frost_nova', 'arcane_explosion', 'mind_blast', 'inner_fire', 'backstab', 'garrote',
  'blessing_might', 'lay_on_hands', 'searing_pain', 'shadow_ward', 'wing_clip', 'multi_shot', 'flame_shock', 'strength_earth'];
const OLD = ['heroic_strike', 'thunder_clap', 'fireball', 'frostbolt', 'arcane_missiles', 'sw_pain', 'sinister_strike', 'holy_light',
  'shadow_bolt', 'immolate', 'arcane_shot', 'raptor_strike', 'earth_shock', 'searing_totem', 'stoneskin_totem', 'lightning_bolt'];
const problems = [];

// ---- 1. pack alone on a fake ART ----
{
  const window = { ART: { icon: k => 'BASE_ICON:' + k, keys: { icons: ['x_icon'] } } };
  const ctx = { window }; vm.createContext(ctx); vm.runInContext(SRC, ctx);
  const A = window.ART;
  if (A.icon('elsewhere') !== 'BASE_ICON:elsewhere') problems.push('fake: fall-through broken');
  if (A.icon('toString') !== 'BASE_ICON:toString') problems.push('fake: prototype key not falling through');
  if (A.keys.icons[0] !== 'x_icon') problems.push('fake: existing keys lost');
  for (const k of NEW) if (!A.keys.icons.includes(k)) problems.push('fake: key missing ' + k);
}
// ---- 2. pack with no ART at all ----
{
  const window = {}; const ctx = { window }; vm.createContext(ctx); vm.runInContext(SRC, ctx);
  if (!/^<svg/.test(window.ART.icon('anything'))) problems.push('bare: no placeholder');
  if (!/^<svg/.test(window.ART.icon('cleave'))) problems.push('bare: cleave missing');
}
// ---- 3. real art.js then pack ----
const window = {}; vm.createContext(window); window.window = window;
vm.runInContext(BASE, window);
const before = {}; for (const k of [...OLD, 'sword', 'nope']) before[k] = window.ART.icon(k).replace(/q[0-9a-z]+_/g, 'ID_');
vm.runInContext(SRC, window);
const ART = window.ART;
for (const k of Object.keys(before)) if (ART.icon(k).replace(/q[0-9a-z]+_/g, 'ID_') !== before[k]) problems.push('existing icon changed: ' + k);
const allIds = new Set();
const out = {};
for (const k of NEW) {
  const s = ART.icon(k);
  if (!/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/.test(s)) problems.push(k + ': bad root');
  if (/NaN|undefined|Infinity/.test(s)) problems.push(k + ': NaN/undefined');
  if (/<text|<filter/.test(s)) problems.push(k + ': text/filter');
  if (s.indexOf('#5a5a62') >= 0 && s.length < 1500) problems.push(k + ': placeholder (threw?)');
  const ids = [...s.matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
  for (const id of ids) { if (!/^i2[0-9a-z]+_/.test(id)) problems.push(k + ': bad id ' + id); if (allIds.has(id)) problems.push(k + ': id reused ' + id); allIds.add(id); }
  if (!ART.keys.icons.includes(k)) problems.push('keys missing ' + k);
  out[k] = s; fs.writeFileSync(path.join(OUT, 'icon_' + k + '.svg'), s);
}
// ---- sheets ----
function sheet(name, items, cw, cols) {
  const pad = Math.max(6, cw / 8), rows = Math.ceil(items.length / cols); let body = '';
  items.forEach(([k, s], i) => {
    const x = pad + (i % cols) * (cw + pad), y = pad + Math.floor(i / cols) * (cw + pad);
    body += s.replace(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="([^"]+)" width="[^"]+" height="[^"]+">/, `<svg x="${x}" y="${y}" width="${cw}" height="${cw}" viewBox="$1">`);
  });
  const Wd = pad + cols * (cw + pad), H = pad + rows * (cw + pad);
  const p = path.join(OUT, 'sheet_' + name + '.svg');
  fs.writeFileSync(p, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Wd} ${H}" width="${Wd}" height="${H}"><rect width="${Wd}" height="${H}" fill="#1c1a20"/>${body}</svg>`);
  execFileSync(RSVG, ['-w', String(Wd), p, '-o', p.replace(/\.svg$/, '.png')]);
}
const newItems = NEW.map(k => [k, out[k]]);
const oldItems = OLD.map(k => [k, ART.icon(k)]);
sheet('new_128', newItems, 128, 8);
// row pairs: new above old at 64 and at 40 px (phone action bar size)
const mixed = []; for (let i = 0; i < 16; i += 8) { mixed.push(...newItems.slice(i, i + 8), ...oldItems.slice(i, i + 8)); }
sheet('mixed_64', mixed, 64, 8);
sheet('mixed_40', mixed, 40, 8);
console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'OK: ' + NEW.length + ' icons, no problems');
