// Friends security rules, tested against Firebase's local emulators (npm test). Players: amy, ben, cat.
// Every case says what a player may or may not do; a rule change that opens a hole makes one of them fail.
const fs = require('fs');
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc, deleteDoc, collection, getDocs, writeBatch } = require('firebase/firestore');
const { ref, get, set } = require('firebase/database');

let pass = 0, fail = 0;
async function check(name, p) {
  try { await p; pass++; console.log('  ok  ', name); } catch (e) { fail++; console.log('  FAIL', name, '-', (e && e.message || e).split('\n')[0]); }
}

(async () => {
  const env = await initializeTestEnvironment({
    projectId: 'demo-friends',
    firestore: { rules: fs.readFileSync(__dirname + '/firestore.rules', 'utf8'), host: '127.0.0.1', port: 8781 },
    database: { rules: fs.readFileSync(__dirname + '/database.rules.json', 'utf8'), host: '127.0.0.1', port: 8782 },
  });
  const fsOf = (uid) => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore();
  const dbOf = (uid) => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).database();
  const amy = fsOf('amy'), ben = fsOf('ben'), cat = fsOf('cat'), nobody = fsOf(null);
  const profile = { v: 1, code: 'AB2CD3EF', updatedAt: 1, lastSeen: 1, playing: null, chars: { c1: { name: 'Amy', level: 3 } } };

  console.log('codes');
  await check('amy creates her code', assertSucceeds(setDoc(doc(amy, 'codes/AB2CD3EF'), { uid: 'amy' })));
  await check('ben looks it up', assertSucceeds(getDoc(doc(ben, 'codes/AB2CD3EF'))));
  await check('signed out: no lookup', assertFails(getDoc(doc(nobody, 'codes/AB2CD3EF'))));
  await check('ben cannot list codes', assertFails(getDocs(collection(ben, 'codes'))));
  await check('ben cannot make a code for amy', assertFails(setDoc(doc(ben, 'codes/ZZZZZZZZ'), { uid: 'amy' })));
  await check('a badly formed code is refused', assertFails(setDoc(doc(amy, 'codes/abc'), { uid: 'amy' })));
  await check('look-alike letters are refused', assertFails(setDoc(doc(amy, 'codes/AB2CD3E0'), { uid: 'amy' })));
  await check('extra fields are refused', assertFails(setDoc(doc(amy, 'codes/QQ2CD3EF'), { uid: 'amy', x: 1 })));
  await check('ben cannot take over amy\'s code', assertFails(setDoc(doc(ben, 'codes/AB2CD3EF'), { uid: 'ben' })));
  await check('ben cannot delete amy\'s code', assertFails(deleteDoc(doc(ben, 'codes/AB2CD3EF'))));

  console.log('profiles');
  await check('amy writes her profile', assertSucceeds(setDoc(doc(amy, 'profiles/amy'), profile)));
  await check('amy reads it', assertSucceeds(getDoc(doc(amy, 'profiles/amy'))));
  await check('an unknown field is refused', assertFails(setDoc(doc(amy, 'profiles/amy'), Object.assign({ email: 'x' }, profile))));
  await check('a stranger cannot read it', assertFails(getDoc(doc(ben, 'profiles/amy'))));
  await check('a stranger cannot write it', assertFails(setDoc(doc(ben, 'profiles/amy'), profile)));

  console.log('requests');
  const req = { name: 'Ben', cls: 'warrior', level: 5, at: 1 };
  await check('ben asks amy', assertSucceeds(setDoc(doc(ben, 'requests/amy/in/ben'), req)));
  await check('ben cannot ask in cat\'s name', assertFails(setDoc(doc(ben, 'requests/amy/in/cat'), req)));
  await check('amy cannot ask herself', assertFails(setDoc(doc(amy, 'requests/amy/in/amy'), req)));
  await check('a request with extra fields is refused', assertFails(setDoc(doc(cat, 'requests/amy/in/cat'), Object.assign({ note: 'hi' }, req))));
  await check('a long name is refused', assertFails(setDoc(doc(cat, 'requests/amy/in/cat'), Object.assign({}, req, { name: 'x'.repeat(30) }))));
  await check('amy sees her requests', assertSucceeds(getDocs(collection(amy, 'requests/amy/in'))));
  await check('cat cannot see amy\'s requests', assertFails(getDoc(doc(cat, 'requests/amy/in/ben'))));

  console.log('accept and remove');
  await check('cat cannot add herself to amy\'s list', assertFails(setDoc(doc(cat, 'friends/amy/list/cat'), { since: 1 })));
  await check('cat cannot add amy to her list and read amy', (async () => { await assertSucceeds(setDoc(doc(cat, 'friends/cat/list/amy'), { since: 1 })); await assertFails(getDoc(doc(cat, 'profiles/amy'))); })());
  const b = writeBatch(amy);
  b.set(doc(amy, 'friends/amy/list/ben'), { since: 2 }); b.set(doc(amy, 'friends/ben/list/amy'), { since: 2 }); b.delete(doc(amy, 'requests/amy/in/ben'));
  await check('amy accepts ben (both lists and the request, one batch)', assertSucceeds(b.commit()));
  await check('now ben reads amy\'s profile', assertSucceeds(getDoc(doc(ben, 'profiles/amy'))));
  await check('cat still cannot', assertFails(getDoc(doc(cat, 'profiles/amy'))));
  await check('with the request gone, cat cannot use it', assertFails(setDoc(doc(cat, 'friends/ben/list/cat'), { since: 3 })));
  await check('ben lists his friends', assertSucceeds(getDocs(collection(ben, 'friends/ben/list'))));
  await check('cat cannot list ben\'s friends', assertFails(getDocs(collection(cat, 'friends/ben/list'))));
  await check('ben removes amy (her side)', assertSucceeds(deleteDoc(doc(ben, 'friends/amy/list/ben'))));
  await check('then ben no longer reads amy\'s profile', assertFails(getDoc(doc(ben, 'profiles/amy'))));
  await check('cat cannot delete someone else\'s friendship', assertFails(deleteDoc(doc(cat, 'friends/ben/list/amy'))));

  console.log('status (Realtime Database)');
  const dA = dbOf('amy'), dB = dbOf('ben'), dC = dbOf('cat');
  await check('amy writes her status', assertSucceeds(set(ref(dA, 'status/amy/c1'), { at: 1, char: 'c1' })));
  await check('a status with an extra field is refused', assertFails(set(ref(dA, 'status/amy/c2'), { at: 1, where: 'x' })));
  await check('a status without a time is refused', assertFails(set(ref(dA, 'status/amy/c3'), { char: 'c1' })));
  await check('ben cannot write amy\'s status', assertFails(set(ref(dB, 'status/amy/c4'), { at: 1 })));
  await check('ben cannot read amy\'s status yet', assertFails(get(ref(dB, 'status/amy'))));
  await check('amy lets ben see it', assertSucceeds(set(ref(dA, 'see/amy/ben'), true)));
  await check('now ben reads it', assertSucceeds(get(ref(dB, 'status/amy'))));
  await check('cat still cannot', assertFails(get(ref(dC, 'status/amy'))));
  await check('ben cannot add cat to amy\'s list', assertFails(set(ref(dB, 'see/amy/cat'), true)));
  await check('ben cannot read amy\'s list', assertFails(get(ref(dB, 'see/amy'))));
  await check('only true goes in a see list', assertFails(set(ref(dA, 'see/amy/cat'), 'yes')));

  await env.cleanup();
  console.log(`rules: ${pass}/${pass + fail} checks pass`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
