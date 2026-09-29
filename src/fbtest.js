/* fbtest.js — Firebase test run (friends feature spike). Only in beta builds (or FBTEST=1), never a normal release.
 * Proves three things on the web and in the Android app: (1) the Google sign-in cloud save already has can sign in
 * to Firebase, (2) the page can write a Firestore document, (3) another device sees it change live.
 * Hidden: tap "Check for updates" in Settings 7 times within 5 seconds, and a small "FB" button appears top-left
 * (remembered on this device; 7 more taps hide it again). Nothing loads or connects until Sign in is tapped. */
(function (root) {
  const CFG = { apiKey: 'AIzaSyAZ-0zSk2uUlM4HumQXzqiFKjkhcunXhI4', authDomain: 'compelling-cat-510114-p4.firebaseapp.com',
    projectId: 'compelling-cat-510114-p4', appId: '1:862031054528:web:9586a7431e9ef94e854f25' };
  const V = 'https://www.gstatic.com/firebasejs/12.19.0/';
  let fb = null, user = null, unsub = null;
  const log = (s) => { const el = document.getElementById('fbt-log'); const t = new Date().toTimeString().slice(0, 8);
    if (el) el.textContent = `${t} ${s}\n` + el.textContent; console.log('[fbtest]', s); };
  const dev = () => (root.UPD && UPD.inApp && UPD.inApp() ? 'app' : 'web');

  async function load() {
    if (fb) return fb;
    const t0 = Date.now();
    const [app, auth, fs] = await Promise.all([import(V + 'firebase-app.js'), import(V + 'firebase-auth.js'), import(V + 'firebase-firestore.js')]);
    const a = app.initializeApp(CFG);
    fb = { app, auth, fs, A: auth.initializeAuth(a, { persistence: auth.inMemoryPersistence }), D: fs.getFirestore(a) };
    log(`SDK loaded in ${Date.now() - t0} ms (origin ${root.location.origin || root.location.protocol})`);
    return fb;
  }

  // Firebase has to learn who signed in, which the Drive-only token cannot tell it: ask for 'openid' as well
  // ("who is this", no email). Web: a second GIS token client. App: the bridge's token command with the extra scope.
  let gis = null, gisPending = null;
  if (root.google && google.accounts) initGis();
  function initGis() {
    if (gis || !(root.google && google.accounts && google.accounts.oauth2)) return;
    gis = google.accounts.oauth2.initTokenClient({ client_id: CLOUD.WEB_CLIENT, scope: 'openid',
      callback: (r) => { const p = gisPending; gisPending = null; if (p) (r.access_token ? p.res(r.access_token) : p.rej(new Error(r.error || 'no token'))); },
      error_callback: (e) => { const p = gisPending; gisPending = null; if (p) p.rej(new Error(e && e.type)); } });
  }
  function idToken() {
    if (dev() === 'app') return root.AzCloud ? appCall('token', { interactive: true, scopes: ['openid'] }) : Promise.reject(new Error('no bridge'));
    initGis();
    if (!gis) return Promise.reject(new Error('Google script not loaded yet: open the panel, wait a second, tap again'));
    return new Promise((res, rej) => { gisPending = { res, rej }; gis.requestAccessToken({ prompt: '' }); });
  }
  // our own calls on the AzCloud bridge, with ids of our own; every other reply goes on to cloud.js's handler
  let seq = 900000, hooked = false; const mine = {};
  const appCall = (cmd, args) => new Promise((res, rej) => {
    if (!hooked) { hooked = true; const prev = root.AZCLOUD_REPLY;
      root.AZCLOUD_REPLY = (s) => { let r; try { r = typeof s === 'string' ? JSON.parse(s) : s; } catch (e) { return; }
        const w = mine[r.id]; if (!w) return prev && prev(s); delete mine[r.id];
        if (r.ok) w.res(r.value); else w.rej(new Error(((r.value || {}).code || '') + ' ' + ((r.value || {}).message || 'bridge error'))); }; }
    const id = ++seq; mine[id] = { res, rej }; root.AzCloud.postMessage(JSON.stringify({ id, cmd, args: args || {} }));
  });

  async function signIn() {
    try {
      const tokP = idToken(); // first, while still inside the tap
      await load();
      const tok = await tokP;
      log('got Google token from ' + dev() + ' sign-in');
      const cred = fb.auth.GoogleAuthProvider.credential(null, tok);
      const r = await fb.auth.signInWithCredential(fb.A, cred);
      user = r.user;
      log(`Firebase sign-in OK: uid ${user.uid.slice(0, 8)}…, email ${user.email ? 'present' : 'none'}`);
      watch();
    } catch (e) { log('sign-in FAILED: ' + (e.code || '') + ' ' + (e.message || e)); }
  }

  async function write() {
    if (!user) return log('sign in first');
    const msg = document.getElementById('fbt-msg').value || ('hello from ' + dev());
    try {
      const t0 = Date.now();
      await fb.fs.setDoc(fb.fs.doc(fb.D, 'spike', user.uid), { msg: msg.slice(0, 190), at: Date.now(), dev: dev() });
      log(`write OK in ${Date.now() - t0} ms`);
    } catch (e) { log('write FAILED: ' + (e.code || '') + ' ' + (e.message || e)); }
  }

  async function badWrite() { // the rules must refuse writing someone else's document
    if (!user) return log('sign in first');
    try { await fb.fs.setDoc(fb.fs.doc(fb.D, 'spike', 'someone-else'), { msg: 'x', at: Date.now(), dev: dev() }); log('RULES HOLE: wrote another player\'s doc'); }
    catch (e) { log('rules OK: other doc refused (' + (e.code || e.message) + ')'); }
  }

  function watch() {
    if (unsub) unsub();
    unsub = fb.fs.onSnapshot(fb.fs.collection(fb.D, 'spike'), (snap) => {
      const el = document.getElementById('fbt-docs');
      const rows = snap.docs.map((d) => { const v = d.data(); return `${d.id === user.uid ? 'me ' : '   '}[${v.dev}] ${v.msg}  (${Math.round((Date.now() - v.at) / 1000)}s ago)`; });
      if (el) el.textContent = rows.join('\n') || '(no documents)';
      snap.docChanges().forEach((c) => { const v = c.doc.data(); if (c.doc.id !== user.uid) log(`live ${c.type} from [${v.dev}]: ${v.msg}, ${Date.now() - v.at} ms after it was written`); });
    }, (e) => log('listen FAILED: ' + (e.code || '') + ' ' + (e.message || e)));
    log('listening to spike/*');
  }

  function panel() {
    if (document.getElementById('fbt-btn')) return;
    const b = document.createElement('button'); b.id = 'fbt-btn';
    b.textContent = 'FB'; b.style.cssText = 'position:fixed;left:4px;top:4px;z-index:9999;font:12px monospace;padding:4px 6px;opacity:.7';
    const p = document.createElement('div'); p.id = 'fbt-panel';
    p.style.cssText = 'position:fixed;left:4px;right:4px;top:34px;z-index:9999;background:#111;color:#cfc;font:12px/1.4 monospace;padding:8px;border:1px solid #4a4;display:none;max-height:70vh;overflow:auto';
    p.innerHTML = '<b>Firebase test run</b><br><button id="fbt-in">Sign in</button> <input id="fbt-msg" placeholder="message" style="width:40%"> <button id="fbt-w">Write</button> <button id="fbt-bad">Rules check</button>'
      + '<pre id="fbt-docs" style="white-space:pre-wrap;color:#fff;margin:6px 0">(not signed in)</pre><pre id="fbt-log" style="white-space:pre-wrap;margin:0"></pre>';
    b.onclick = () => { p.style.display = p.style.display === 'none' ? 'block' : 'none'; if (root.CLOUD && CLOUD.prepare) CLOUD.prepare().then(initGis); };
    document.body.appendChild(b); document.body.appendChild(p);
    document.getElementById('fbt-in').onclick = signIn; // straight from the tap, so the Google popup is allowed
    document.getElementById('fbt-w').onclick = write;
    document.getElementById('fbt-bad').onclick = badWrite;
  }
  const KEY = 'azsolo.fbtest';
  const unlocked = () => { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } };
  let taps = [];
  document.addEventListener('click', (ev) => {
    const b = ev.target && ev.target.closest && ev.target.closest('button');
    if (!b || !/^Check for updates/.test(b.textContent || '')) return;
    const now = Date.now(); taps = taps.filter((t) => now - t < 5000).concat(now);
    if (taps.length < 7) return;
    taps = []; const on = !unlocked();
    try { if (on) localStorage.setItem(KEY, '1'); else localStorage.removeItem(KEY); } catch (e) {}
    if (on) panel(); else { const x = document.getElementById('fbt-btn'); const y = document.getElementById('fbt-panel'); if (x) x.remove(); if (y) y.remove(); }
  }, true);
  const start = () => { if (unlocked()) panel(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})(typeof window !== 'undefined' ? window : globalThis);
