// Renders every ART.story key to art/story/out/*.svg + PNG and builds contact sheets.
// Usage: node art/story/render.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out');
const RSVG = '/opt/homebrew/bin/rsvg-convert';
fs.mkdirSync(OUT, { recursive: true });

// load with a fake window, exactly as the task requires (no art.js)
const window = { ART: {} };
const sandbox = { window };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/art_story.js'), 'utf8'), sandbox);
const S = window.ART.story;

const want = {
  scenes: ['stormwind_keep', 'blackrock_mountain', 'westfall', 'azeroth_dawn', 'shadow_court'],
  actors: ['lady_prestor', 'prestor_shadow', 'onyxia', 'nefarian', 'ragnaros', 'bolvar', 'vancleef_story', 'defias_crowd', 'king_varian_portrait']
};
const problems = [];
for (const k of Object.keys(want)) for (const key of want[k]) if (!S.keys[k].includes(key)) problems.push(`missing ${k}: ${key}`);

const allIds = new Set();
function check(name, s, vb) {
  if (typeof s !== 'string') { problems.push(name + ': not a string'); return; }
  if (!s.startsWith(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"`)) problems.push(name + ': bad root/viewBox');
  if (/NaN|undefined|Infinity/.test(s)) problems.push(name + ': NaN/undefined in output');
  if (/<text|<filter|<image|<foreignObject/.test(s)) problems.push(name + ': forbidden element');
  const ids = [...s.matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
  if (new Set(ids).size !== ids.length) problems.push(name + ': duplicate ids');
  for (const id of ids) { if (allIds.has(id)) problems.push(name + ': id reused across calls ' + id); allIds.add(id); }
  for (const m of s.matchAll(/url\(#([^)]+)\)/g)) if (!ids.includes(m[1])) problems.push(name + ': dangling ref ' + m[1]);
}
function write(name, s, vb) { check(name, s, vb); const p = path.join(OUT, name + '.svg'); fs.writeFileSync(p, s); return p; }
function png(p, w) { execFileSync(RSVG, ['-w', String(w), p, '-o', p.replace(/\.svg$/, '.png')]); }

const scenes = S.keys.scenes.map(k => [k, S.scene(k)]);
const actors = S.keys.actors.map(k => [k, S.actor(k)]);
scenes.forEach(([k, s]) => png(write('scene_' + k, s, '0 0 480 270'), 480));
actors.forEach(([k, s]) => png(write('actor_' + k, s, '0 0 160 160'), 320));
// robustness: unknown / garbage keys never throw
for (const bad of ['nope', undefined, null, 42, {}, '__proto__', 'constructor', 'toString']) {
  check('scene?' + String(bad), S.scene(bad), '0 0 480 270');
  check('actor?' + String(bad), S.actor(bad), '0 0 160 160');
}
png(write('scene__unknown', S.scene('nope'), '0 0 480 270'), 240);
png(write('actor__unknown', S.actor('nope'), '0 0 160 160'), 160);

const HEAD = /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="([^"]+)" width="[^"]+" height="[^"]+">/;
const nest = (s, x, y, w, h, flip) => {
  const inner = s.replace(HEAD, `<svg x="0" y="0" width="${w}" height="${h}" viewBox="$1">`);
  return flip ? `<g transform="translate(${x + w},${y}) scale(-1,1)">${inner}</g>` : `<g transform="translate(${x},${y})">${inner}</g>`;
};
function sheet(name, items, cw, ch, cols, bg, outW) {
  const pad = 8, rows = Math.ceil(items.length / cols);
  let body = '';
  items.forEach(([, s], i) => {
    const x = pad + (i % cols) * (cw + pad), y = pad + Math.floor(i / cols) * (ch + pad);
    body += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="${bg}"/>` + nest(s, x, y, cw, ch);
  });
  const Wd = pad + cols * (cw + pad), H = pad + rows * (ch + pad);
  const p = path.join(OUT, 'sheet_' + name + '.svg');
  fs.writeFileSync(p, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Wd} ${H}" width="${Wd}" height="${H}"><rect width="${Wd}" height="${H}" fill="#222"/>${body}</svg>`);
  execFileSync(RSVG, ['-w', String(outW || Wd), p, '-o', p.replace(/\.svg$/, '.png')]);
  return p.replace(/\.svg$/, '.png');
}
// phone-size checks: scenes at 400px wide, actors at 150px
const sheets = [];
sheets.push(sheet('scenes', scenes, 400, 225, 2, '#000'));
sheets.push(sheet('actors', actors, 150, 150, 5, '#6a7a8a'));
sheets.push(sheet('actors_dark', actors, 150, 150, 5, '#1a1418'));

// storyboards: scene + actors (actor boxes sized for a 480x270 frame)
const A = k => S.actor(k), SC = k => S.scene(k);
function board(name, scene, placements) {
  let body = SC(scene).replace(HEAD, '').replace(/<\/svg>$/, '');
  for (const [k, x, y, sz, flip] of placements) body += nest(A(k), x, y, sz, sz, flip);
  return [name, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 270" width="480" height="270">${body}</svg>`];
}
const boards = [
  board('prestor_keep', 'stormwind_keep', [['lady_prestor', 250, 100, 170], ['bolvar', 70, 104, 166, true]]),
  board('reveal', 'shadow_court', [['prestor_shadow', 130, 40, 230]]),
  board('blackrock_war', 'blackrock_mountain', [['ragnaros', 10, 70, 200, true], ['nefarian', 250, 50, 230]]),
  board('westfall_defias', 'westfall', [['defias_crowd', 30, 108, 170, true], ['vancleef_story', 260, 88, 190]])
];
boards.forEach(([k, s]) => png(write('board_' + k, s, '0 0 480 270'), 480));
sheets.push(sheet('storyboards', boards, 400, 225, 2, '#000'));
// the portrait hanging on the keep wall (prop check)
const prop = board('portrait_prop', 'stormwind_keep', [['king_varian_portrait', 356, 70, 56]]);
png(write('board_portrait_prop', prop[1], '0 0 480 270'), 480);

const size = fs.statSync(path.join(ROOT, 'src/art_story.js')).size;
console.log(`scenes ${scenes.length}, actors ${actors.length}; art_story.js ${size} bytes`);
console.log('sheets:\n' + sheets.join('\n'));
console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'no problems');
