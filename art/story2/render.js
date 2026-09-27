// Verifies src/art_story2.js (the second story-art pack) and renders contact sheets into art/story2/out/.
// Usage: node art/story2/render.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out');
const RSVG = '/opt/homebrew/bin/rsvg-convert';
fs.mkdirSync(OUT, { recursive: true });
const read = (f) => fs.readFileSync(path.join(ROOT, 'src', f), 'utf8');
const SRC_ART = read('art.js'), SRC_STORY = read('art_story.js'), SRC2 = read('art_story2.js');

const NEW = { scenes: ['stormveil_storm'], actors: ['windsor', 'aeldran', 'nalveshra'] };
const WEIRD = ['nope', '', 'toString', '__proto__', 'constructor', 'hasOwnProperty', 'valueOf', undefined, null, 42, {}, []];
const problems = [];
const bad = (m) => problems.push(m);

// real load: art.js, art_story.js, then (optionally) this pack
function load(withPack) {
  const win = {}; win.window = win; vm.createContext(win);
  vm.runInContext(SRC_ART, win);
  vm.runInContext(SRC_STORY, win);
  const before = { scene: win.ART.scene, mob: win.ART.mob, story: win.ART.story };
  if (withPack) vm.runInContext(SRC2, win);
  return { win, before };
}

// ---- 1. old story keys render identically before and after the pack ----
{
  const A = load(false).win.ART.story;
  const { win, before } = load(true);
  const B = win.ART.story;
  if (win.ART.scene !== before.scene || win.ART.mob !== before.mob) bad('pack touched ART.scene / ART.mob');
  if (B !== before.story) bad('pack replaced ART.story instead of extending it');
  const oldScenes = A.keys.scenes.slice(), oldActors = A.keys.actors.slice();
  if (B.keys.scenes.slice(0, oldScenes.length).join() !== oldScenes.join()) bad('old scene keys changed order or were lost');
  if (B.keys.actors.slice(0, oldActors.length).join() !== oldActors.join()) bad('old actor keys changed order or were lost');
  if (B.keys.scenes.slice(oldScenes.length).join() !== NEW.scenes.join()) bad('keys.scenes tail is ' + B.keys.scenes.slice(oldScenes.length));
  if (B.keys.actors.slice(oldActors.length).join() !== NEW.actors.join()) bad('keys.actors tail is ' + B.keys.actors.slice(oldActors.length));
  // same call order in both worlds => identical strings (art_story.js ids come from a per-load counter)
  let same = 0;
  for (const k of oldScenes) { if (A.scene(k) !== B.scene(k)) bad('old scene differs after pack: ' + k); else same++; }
  for (const k of oldActors) { if (A.actor(k) !== B.actor(k)) bad('old actor differs after pack: ' + k); else same++; }
  // unknown / prototype keys reach art_story.js's own placeholder, byte for byte
  for (const k of WEIRD) {
    if (A.scene(k) !== B.scene(k)) bad('scene fall-through differs for ' + String(k));
    if (A.actor(k) !== B.actor(k)) bad('actor fall-through differs for ' + String(k));
    same += 2;
  }
  // how ui.js routes a story key: scene iff listed in keys.scenes
  for (const k of NEW.scenes) if (!B.keys.scenes.includes(k) || B.keys.actors.includes(k)) bad('routing: ' + k + ' should be a scene only');
  for (const k of NEW.actors) if (B.keys.scenes.includes(k) || !B.keys.actors.includes(k)) bad('routing: ' + k + ' should be an actor only');
  console.log('identity check: ' + same + ' old/fall-through renders compared');
}

// ---- 2. fake and empty ART ----
{
  const fake = () => ({ ART: { story: { scene: (k) => 'BASE_SCENE:' + k, actor: (k) => 'BASE_ACTOR:' + k, keys: { scenes: ['x_scene'], actors: ['x_actor'] } } } });
  const run = (window) => { const ctx = { window }; vm.createContext(ctx); vm.runInContext(SRC2, ctx); return window; };
  const w = run(fake()), S = w.ART.story;
  for (const k of ['elsewhere', 'toString', '__proto__', 'constructor', 'hasOwnProperty', 'stormwind_keep', 'bolvar']) {
    if (S.scene(k) !== 'BASE_SCENE:' + k) bad('fake: scene did not fall through for ' + k);
    if (S.actor(k) !== 'BASE_ACTOR:' + k) bad('fake: actor did not fall through for ' + k);
  }
  // a new scene key asked for as an actor (and vice versa) is not ours: fall through
  if (S.actor('stormveil_storm') !== 'BASE_ACTOR:stormveil_storm') bad('fake: scene key answered as actor');
  if (S.scene('windsor') !== 'BASE_SCENE:windsor') bad('fake: actor key answered as scene');
  if (S.keys.scenes.join() !== ['x_scene'].concat(NEW.scenes).join()) bad('fake: keys.scenes = ' + S.keys.scenes);
  if (S.keys.actors.join() !== ['x_actor'].concat(NEW.actors).join()) bad('fake: keys.actors = ' + S.keys.actors);
  for (const k of NEW.scenes) if (!/^<svg /.test(S.scene(k))) bad('fake: own scene broken ' + k);
  for (const k of NEW.actors) if (!/^<svg /.test(S.actor(k))) bad('fake: own actor broken ' + k);
  // a base that throws is caught
  const wt = run({ ART: { story: { scene() { throw new Error('x'); }, actor() { throw new Error('x'); }, keys: { scenes: [], actors: [] } } } });
  try { if (!/^<svg /.test(wt.ART.story.scene('a')) || !/^<svg /.test(wt.ART.story.actor('a'))) bad('throwing base: no placeholder'); } catch (e) { bad('throwing base: threw'); }
  // loading twice does not duplicate keys
  const w2 = fake(); run(w2); run(w2);
  if (w2.ART.story.keys.actors.length !== 1 + NEW.actors.length) bad('double load duplicated keys');
  // frozen story object: a fresh one is published
  const fz = fake(); Object.freeze(fz.ART.story); Object.freeze(fz.ART.story.keys);
  try { run(fz); if (!/^<svg /.test(fz.ART.story.actor('windsor')) || fz.ART.story.scene('q') !== 'BASE_SCENE:q' || !fz.ART.story.keys.scenes.includes('stormveil_storm')) bad('frozen story: pack not installed'); } catch (e) { bad('frozen story: threw ' + e.message); }
  // empty / garbage worlds
  const worlds = [{}, { ART: {} }, { ART: { story: {} } }, { ART: { story: { keys: null, scene: 'no', actor: 7 } } }, { ART: { story: { keys: { scenes: 'x', actors: {} } } } }, { ART: null }, { ART: 5 }];
  worlds.forEach((wd, i) => {
    try {
      run(wd);
      const T = wd.ART.story;
      if (!T || typeof T.scene !== 'function' || typeof T.actor !== 'function') { bad('world ' + i + ': no story api'); return; }
      for (const k of WEIRD) { if (!/^<svg /.test(T.scene(k))) bad('world ' + i + ': scene placeholder ' + String(k)); if (!/^<svg /.test(T.actor(k))) bad('world ' + i + ': actor placeholder ' + String(k)); }
      if (!/^<svg /.test(T.actor('nalveshra')) || !/^<svg /.test(T.scene('stormveil_storm'))) bad('world ' + i + ': own keys broken');
      if (T.keys.scenes.join() !== NEW.scenes.join() || T.keys.actors.join() !== NEW.actors.join()) bad('world ' + i + ': keys ' + JSON.stringify(T.keys));
    } catch (e) { bad('world ' + i + ': threw ' + e.message); }
  });
  console.log('fake/empty ART checks run: ' + (worlds.length + 4) + ' worlds');
}

// ---- 3. per-SVG checks on the new art (real load) ----
const { win } = load(true);
const S = win.ART.story;
const allIds = new Set();
function check(name, s, vb) {
  if (typeof s !== 'string') { bad(name + ': not a string'); return; }
  if (!s.startsWith(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"`)) bad(name + ': bad root/viewBox');
  if (/NaN|undefined|Infinity/.test(s)) bad(name + ': NaN/undefined in output');
  if (/<text|<tspan|<filter|<image|<foreignObject|<script|<use\b|href|\son[a-z]+=/i.test(s)) bad(name + ': forbidden element or attribute');
  if (/filter=/.test(s)) bad(name + ': filter attribute');
  const ids = [...s.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  if (new Set(ids).size !== ids.length) bad(name + ': duplicate ids');
  for (const id of ids) {
    if (!/^s2[0-9a-z]+_[0-9a-z]+$/.test(id)) bad(name + ': id without s2 prefix ' + id);
    if (allIds.has(id)) bad(name + ': id reused across calls ' + id);
    allIds.add(id);
  }
  for (const m of s.matchAll(/url\(#([^)]+)\)/g)) if (!ids.includes(m[1])) bad(name + ': dangling ref ' + m[1]);
  if ((s.match(/<svg/g) || []).length !== 1 || !s.endsWith('</svg>')) bad(name + ': malformed svg');
}
function write(name, s, vb) { if (vb) check(name, s, vb); const p = path.join(OUT, name + '.svg'); fs.writeFileSync(p, s); return p; }
function png(p, w) { execFileSync(RSVG, ['-w', String(w), p, '-o', p.replace(/\.svg$/, '.png')]); return p.replace(/\.svg$/, '.png'); }

const scenes = NEW.scenes.map((k) => [k, S.scene(k)]);
const actors = NEW.actors.map((k) => [k, S.actor(k)]);
scenes.forEach(([k, s]) => png(write('scene_' + k, s, '0 0 480 270'), 960));
actors.forEach(([k, s]) => png(write('actor_' + k, s, '0 0 160 160'), 480));
// a second call must not reuse ids (the check above throws on reuse)
for (const k of NEW.scenes) check('again scene ' + k, S.scene(k), '0 0 480 270');
for (const k of NEW.actors) check('again actor ' + k, S.actor(k), '0 0 160 160');
for (const [k, s] of scenes.concat(actors)) console.log(`  ${k}: ${s.length} bytes`);

// actors sit mid-stage, so anything touching the left, right or top edge of the 160 box shows as a hard cut.
// Decode each actor PNG (rsvg writes 8-bit RGBA, non-interlaced) and check alpha along those edges.
function alphaOf(file) {
  const zlib = require('zlib'), b = fs.readFileSync(file);
  let o = 8, w = 0, h = 0, idat = [];
  while (o < b.length) {
    const len = b.readUInt32BE(o), type = b.toString('ascii', o + 4, o + 8), data = b.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); if (data[8] !== 8 || data[9] !== 6 || data[12] !== 0) return null; }
    if (type === 'IDAT') idat.push(data);
    o += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat)), bpp = 4, stride = w * bpp, px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), row = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[row + x - bpp] : 0, up = y ? px[row - stride + x] : 0, ul = y && x >= bpp ? px[row - stride + x - bpp] : 0;
      let v = src[x];
      if (f === 1) v += a; else if (f === 2) v += up; else if (f === 3) v += (a + up) >> 1;
      else if (f === 4) { const p0 = a + up - ul, pa = Math.abs(p0 - a), pb = Math.abs(p0 - up), pc = Math.abs(p0 - ul); v += pa <= pb && pa <= pc ? a : pb <= pc ? up : ul; }
      px[row + x] = v & 255;
    }
  }
  return { w, h, a: (x, y) => px[y * stride + x * 4 + 3] };
}
for (const k of NEW.actors) {
  const im = alphaOf(path.join(OUT, 'actor_' + k + '.png'));
  if (!im) { bad('edge check: unexpected PNG format for ' + k); continue; }
  let L0 = 0, R0 = 0, T0 = 0;
  for (let y = 0; y < im.h; y++) { L0 = Math.max(L0, im.a(0, y), im.a(1, y)); R0 = Math.max(R0, im.a(im.w - 1, y), im.a(im.w - 2, y)); }
  for (let x = 0; x < im.w; x++) T0 = Math.max(T0, im.a(x, 0), im.a(x, 1));
  if (L0 > 12 || R0 > 12 || T0 > 12) bad(`edge check: ${k} bleeds off the box (alpha left ${L0}, right ${R0}, top ${T0})`);
}

// ---- 4. sheets ----
const HEAD = /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="([^"]+)"(?: width="[^"]+" height="[^"]+")?>/;
const nest = (s, x, y, w, h, flip) => {
  const inner = s.replace(HEAD, `<svg x="0" y="0" width="${w}" height="${h}" viewBox="$1" preserveAspectRatio="xMidYMid slice">`);
  return flip ? `<g transform="translate(${x + w},${y}) scale(-1,1)">${inner}</g>` : `<g transform="translate(${x},${y})">${inner}</g>`;
};
function sheet(name, items, cw, ch, cols, bg, outW) {
  const pad = 8, rows = Math.ceil(items.length / cols);
  let body = '';
  items.forEach(([, s, cellBg], i) => {
    const x = pad + (i % cols) * (cw + pad), y = pad + Math.floor(i / cols) * (ch + pad);
    body += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="${cellBg || bg}"/>` + nest(s, x, y, cw, ch);
  });
  const Wd = pad + cols * (cw + pad), H = pad + rows * (ch + pad);
  const p = path.join(OUT, 'sheet_' + name + '.svg');
  fs.writeFileSync(p, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Wd} ${H}" width="${Wd}" height="${H}"><rect width="${Wd}" height="${H}" fill="#222"/>${body}</svg>`);
  return png(p, outW || Wd);
}
const sheets = [];
// new keys: the scene at phone width, actors at phone size on light and dark cells
// the scene as the cutscene camera frames it: .cs-cam is translate(tx%, ty%) scale(s) around 50% 55%
const camView = (svg, tx, ty, sc) => {
  const ox = 240, oy = 270 * 0.55, vx = ox + (0 - ox - tx * 4.8) / sc, vy = oy + (0 - oy - ty * 2.7) / sc;
  return svg.replace(HEAD, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx.toFixed(1)} ${vy.toFixed(1)} ${(480 / sc).toFixed(1)} ${(270 / sc).toFixed(1)}">`);
};
const storm = S.scene('stormveil_storm');
sheets.push(sheet('new_keys', [['full', storm], ['ch6 cam start', camView(storm, -4, 0, 1.12)], ['ch6 cam end', camView(storm, 4, 0, 1.12)], ['x1 cam start', camView(storm, 0, 2, 1.18)]], 400, 225, 2, '#000'));
sheets.push(sheet('new_actors', actors.concat(actors.map(([k, s]) => [k, s, '#10161c'])), 150, 150, 3, '#6a7a8a'));

// composites: actor over its cutscene backdrop exactly as cutscene.js places it (x%, bottom y%, width w% of a 16:9 stage)
const TEAL_PH = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 270" width="480" height="270"><defs><linearGradient id="ph_g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a2e36"/><stop offset="1" stop-color="#03141a"/></linearGradient></defs><rect width="480" height="270" fill="url(#ph_g)"/></svg>';
let brd = null;
try { const w2 = {}; w2.window = w2; vm.createContext(w2); vm.runInContext(SRC_ART, w2); vm.runInContext(read('art_brd.js'), w2); const s = w2.ART.scene('brd_prison'); if (/^<svg/.test(s) && !/placeholder/.test(s)) brd = s; } catch (e) { brd = null; }
function board(name, bg, placements) {
  let body = nest(bg, 0, 0, 480, 270);
  for (const [s, x, y, w, flip] of placements) { const sz = w * 4.8; body += nest(s, x * 4.8, 270 - y * 2.7 - sz, sz, sz, flip); }
  return [name, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 270" width="480" height="270">${body}</svg>`];
}
const A = (k) => S.actor(k);
const boards = [
  board('ch6_windsor_bolvar', S.scene('stormwind_keep'), [[A('windsor'), 26, 2, 30], [A('bolvar'), 62, 2, 30]]),
  board('ch6_windsor_keep', S.scene('stormwind_keep'), [[A('windsor'), 40, 2, 32]]),
  board('x1_aeldran', TEAL_PH, [[A('aeldran'), 40, 2, 34]]),
  board('x1_nalveshra', TEAL_PH, [[A('nalveshra'), 40, 0, 46]])
];
if (brd) boards.splice(2, 0, board('ch6_windsor_prison', brd, [[A('windsor'), 40, 2, 32]]));
boards.forEach(([k, s]) => png(write('board_' + k, s), 960));
sheets.push(sheet('composites', boards, 400, 225, 2, '#000'));

// style match: windsor between the existing story humans
const trio = [['bolvar', A('bolvar')], ['windsor', A('windsor')], ['lady_prestor', A('lady_prestor')]];
sheets.push(sheet('style_match', trio.concat(trio.map(([k, s]) => [k, s, '#1a1418'])), 150, 150, 3, '#6a7a8a'));
sheets.push(sheet('style_match_big', trio, 300, 300, 3, '#6a7a8a'));

const size = fs.statSync(path.join(ROOT, 'src/art_story2.js')).size;
console.log(`new scenes ${scenes.length}, new actors ${actors.length}; art_story2.js ${size} bytes${brd ? '' : ' (art_brd.js brd_prison not available, prison board skipped)'}`);
console.log('sheets:\n' + sheets.join('\n'));
console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'no problems');
process.exitCode = problems.length ? 1 : 0;
