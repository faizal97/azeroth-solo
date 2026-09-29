// Cloud save rules (src/cloud.js) against a fake Google Drive shared by fake devices, each with its own storage.
// Every case from docs/plans/2026-09-29-cloud-save-design.md section 4. No Google code runs.  node sim/cloudsync.js
const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m }; };
globalThis.localStorage = mem();
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js'); require('../src/cloud.js');
const { G, CLOUD } = globalThis;
let t = 1790000000000; Date.now = () => t;

// ---- a fake Drive: the same five calls as CLOUD.driveREST, in memory; `down` makes every call fail like an expired sign-in
const drive = { files: new Map(), n: 0, down: false, calls: 0 };
const fake = {
  guard() { drive.calls++; if (drive.down) throw Object.assign(new Error('expired'), { code: 'auth' }); },
  async list() { this.guard(); return [...drive.files.values()].map((f) => ({ id: f.id, name: f.name, appProperties: Object.assign({}, f.props) })); },
  async create(name, props, text) { this.guard(); const id = 'f' + ++drive.n; drive.files.set(id, { id, name, props: Object.assign({}, props), text }); return { id }; },
  async update(id, props, text) { this.guard(); const f = drive.files.get(id); Object.assign(f.props, props); f.text = text; return { id }; },
  async download(id) { this.guard(); return drive.files.get(id).text; },
  async remove(id) { this.guard(); drive.files.delete(id); },
};
CLOUD.setDriver(fake);

// ---- devices: each has its own localStorage and says what it is
const devices = {};
const dev = (name, kind) => (devices[name] = { name, kind, ls: mem() });
const use = (d) => { if (G.S) G.logout(); globalThis.localStorage = d.ls; CLOUD.device = () => d.kind; localStorage.setItem('azsolo.cloud', JSON.stringify(Object.assign(CLOUD.state(), { on: true }))); };
const play = (secs, xp) => { t += secs * 1000; G.S.player.played = (G.S.player.played || 0) + secs; G.S.player.xp += xp; G.save(); };
const char = (id) => G.readSave(id);
const cloudOf = (id) => [...drive.files.values()].filter((f) => f.name === `char-${id}.azs`);

let pass = 0, fail = 0;
const ok = (cond, what) => { if (cond) pass++; else { fail++; console.log('FAIL', what); } };

(async () => {
  const phone = dev('phone', 'phone'), web = dev('web', 'browser'), tab = dev('tab', 'phone');

  // 1. phone → browser → phone: every switch loads the other device's progress by itself
  use(phone);
  G.newGame({ name: 'Aria', cls: 'paladin', race: 'human' }); const A = G.S.id;
  play(600, 100);
  let r = await CLOUD.sync(A);
  ok(r.what === 'pushed' && cloudOf(A).length === 1 && cloudOf(A)[0].props.rev === '1', 'first backup makes revision 1');
  use(web);
  ok(G.characters().length === 0, 'the browser starts empty');
  let list = await CLOUD.list();
  ok(list.length === 1 && list[0].name === 'Aria' && list[0].dev === 'phone' && list[0].level === 1, 'the Restore list shows Aria from the phone');
  r = await CLOUD.restore([A]);
  ok(r[0].what === 'restored' && char(A) && char(A).player.xp === 100, 'restore brings Aria in with her progress');
  G.load(A); play(900, 250);
  r = await CLOUD.sync(A);
  ok(r.what === 'pushed' && cloudOf(A)[0].props.rev === '2' && cloudOf(A)[0].props.dev === 'browser', 'the browser backs up revision 2');
  use(phone);
  r = await CLOUD.sync(A);
  ok(r.what === 'pulled' && char(A).player.xp === 350, 'the phone loads the browser\'s progress by itself');
  G.load(A); play(300, 50); r = await CLOUD.sync(A);
  ok(r.what === 'pushed' && cloudOf(A)[0].props.rev === '3', 'the phone carries on as revision 3');
  use(web); r = await CLOUD.sync(A);
  ok(r.what === 'pulled' && char(A).player.xp === 400, 'and the browser picks that up in turn');

  // 2. just opening a character (under a minute of play) does not count as playing
  G.load(A); play(30, 0); r = await CLOUD.sync(A);
  ok(r.what === 'same' && cloudOf(A)[0].props.rev === '3', 'opening Aria for 30 s uploads nothing');

  // 3. both devices played from the same revision: the game asks, and each answer does what it says
  use(phone); G.load(A); play(1200, 500); // offline on the phone: xp 900
  use(web); G.load(A); play(600, 70); await CLOUD.sync(A); // the browser uploads revision 4: xp 470
  use(phone); r = await CLOUD.sync(A);
  ok(r.what === 'conflict' && r.local.played > r.cloud.played - 99999 && char(A).player.xp === 900 && cloudOf(A)[0].props.rev === '4', 'a conflict changes nothing and shows both');
  r = await CLOUD.resolve(A, 'local');
  ok(r.what === 'pushed' && cloudOf(A)[0].props.rev === '5' && cloudOf(A)[0].props.dev === 'phone', 'Keep this device\'s: the phone\'s version becomes revision 5');
  use(web); r = await CLOUD.sync(A);
  ok(r.what === 'pulled' && char(A).player.xp === 900, 'the browser, which uploaded 4 and has not played since, loads 5 by itself');
  G.load(A); play(600, 11); // browser xp 911
  use(phone); G.load(A); play(600, 22); await CLOUD.sync(A); // phone uploads revision 6: xp 922
  use(web); r = await CLOUD.sync(A);
  ok(r.what === 'conflict', 'both played again: asked');
  r = await CLOUD.resolve(A, 'cloud');
  ok(r.what === 'pulled' && char(A).player.xp === 922, 'Keep the cloud\'s: the browser takes the phone\'s version');
  G.load(A); play(600, 11); // browser xp 933
  use(phone); G.load(A); play(600, 22); await CLOUD.sync(A); // phone uploads revision 7: xp 944
  use(web); r = await CLOUD.sync(A);
  ok(r.what === 'conflict', 'a third conflict');
  const before = G.characters().length;
  r = await CLOUD.resolve(A, 'both');
  const copy = G.characters().find((c) => c.id !== A && c.name === 'Aria');
  ok(r.what === 'both' && G.characters().length === before + 1 && copy && char(copy.id).player.xp === 944 && char(A).player.xp === 933, 'Keep both: the cloud\'s version becomes a second Aria');
  ok(cloudOf(A)[0].props.rev === '8' && cloudOf(copy.id).length === 0, 'this device\'s version goes up as revision 8; the copy is its own, unsynced character');
  await CLOUD.backupAll();
  ok(cloudOf(copy.id).length === 1 && cloudOf(copy.id)[0].props.rev === '1', 'Back up now gives the copy its own file');

  // 4. several characters, and a device that restores them all
  use(phone); G.newGame({ name: 'Borin', cls: 'warrior', race: 'dwarf' }); play(120, 5); G.newGame({ name: 'Cyl', cls: 'mage', race: 'gnome' }); play(120, 5);
  let conflicts = await CLOUD.backupAll();
  list = await CLOUD.list();
  ok(conflicts.length === 0 && list.length === 4, 'Back up now covers every character (four in the cloud)');
  use(tab); r = await CLOUD.restore(list.map((c) => c.id));
  ok(r.every((x) => x.what === 'restored') && G.characters().length === 4, 'a third device restores all four');
  ok(char(A).player.xp === 933, 'with Aria at her latest revision');

  // 5. a restore that would go over the character limit restores nothing
  const full = dev('full', 'browser'); use(full);
  for (let i = 0; i < G.MAX_CHARS - 2; i++) G.newGame({ name: 'Filler' + i, cls: 'rogue', race: 'human' });
  const had = G.characters().length;
  let threw = null; try { await CLOUD.restore(list.map((c) => c.id)); } catch (e) { threw = e; }
  ok(threw && threw.code === 'full' && G.characters().length === had, 'over the limit: a clear error and nothing restored');

  // 6. deleting a character: the cloud copy stays unless asked
  use(tab); const B = list.find((c) => c.name === 'Borin').id;
  G.deleteCharacter(B); CLOUD.forget(B);
  ok(cloudOf(B).length === 1, 'deleting Borin here keeps his cloud copy');
  await CLOUD.deleteCloud(B);
  ok(cloudOf(B).length === 0 && (await CLOUD.list()).length === 3, 'and Delete from cloud removes it');

  // 7. an expired sign-in: automatic backup fails quietly, keeps the error, and works after reconnecting
  use(phone); G.load(A); play(700, 40); drive.down = true;
  const xpNow = char(A).player.xp; t += 11 * 60 * 1000; r = await CLOUD.maybeBackup(false);
  ok(r.what === 'error' && CLOUD.state().lastError.code === 'auth' && char(A).player.xp === xpNow, 'expired: the backup waits, the save is untouched, the section can show Reconnect');
  drive.down = false; t += 11 * 60 * 1000; r = await CLOUD.maybeBackup(false);
  ok(r.what === 'pushed' && CLOUD.state().lastError === null, 'after reconnecting the backup goes through');
  const calls = drive.calls; r = await CLOUD.maybeBackup(false);
  ok(r === null && drive.calls === calls, 'and the next one waits its 10 minutes');

  // 8. automatic backup during play never loads a newer copy over the character being played
  use(web); G.load(A); play(20, 0);
  use(phone); G.load(A); play(600, 1); await CLOUD.sync(A);
  use(web); G.load(A); r = await CLOUD.maybeBackup(true);
  ok(r.what === 'newer' && G.S && G.S.id === A, 'a newer copy is only reported while playing');

  // 9. an old save from before cloud save: no records at all, still loads, and is treated as never synced
  const old = dev('old', 'browser'); use(old); localStorage.removeItem('azsolo.cloud');
  G.newGame({ name: 'Dana', cls: 'priest', race: 'human' }); const Dn = G.S.id; play(100, 1); G.logout();
  ok(G.load(Dn) !== undefined && G.S.player.name === 'Dana', 'an old save loads as before');
  ok(CLOUD.decide(char(Dn), null, null) === 'push' && CLOUD.decide(char(Dn), { rev: 3 }, null) === 'conflict', 'never synced: first backup, or ask if the cloud has one');

  // 10. what goes up comes back identical
  use(tab); const ts = await CLOUD.list(); const one = ts.find((c) => c.name === 'Cyl');
  const code = await G.encodeSave(char(one.id)); const back = await G.decodeSave(code);
  ok(back.player.name === 'Cyl' && back.player.cls === 'mage' && JSON.stringify(back.player.bags) === JSON.stringify(char(one.id).player.bags), 'a save survives the round trip');

  console.log(`cloudsync: ${pass}/${pass + fail} checks pass`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
