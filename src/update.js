// In-app updater (v9.3). Asks GitHub for the latest release of this game, compares it with the version this build was
// made from (window.AZ_VERSION, set by build.py from app/pubspec.yaml), and on Android downloads the release APK and
// opens the system installer through the AzUpd bridge (lib/main.dart -> MainActivity.kt). In a plain browser it just
// links to the release page. UI lives in ui.js (updateDialog); this file has no DOM code.
(function (root) {
  const UPD = root.UPD = {};
  const REPO = 'faizal97/azeroth-solo';
  const API = `https://api.github.com/repos/${REPO}/releases/latest`;
  const KEY = 'azsolo.update';
  const EVERY = 30 * 60 * 1000; // automatic checks reuse the last answer for 30 min (GitHub allows 60 an hour)
  UPD.current = () => String(root.AZ_VERSION || '0.0.0');
  UPD.inApp = () => !!(root.AzUpd && root.AzUpd.postMessage);

  const store = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } };
  const save = (o) => { try { localStorage.setItem(KEY, JSON.stringify(Object.assign(store(), o))); } catch (e) { } };
  UPD.skip = (tag) => save({ skip: tag });

  // "v9.10.0" > "v9.2.0"
  UPD.newer = function (a, b) {
    const p = (v) => String(v).replace(/^v/i, '').split(/[.+-]/).map((x) => parseInt(x, 10) || 0);
    const x = p(a), y = p(b);
    for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); }
    return false;
  };

  // Resolves { latest, name, notes, url, apk, size, newer, skipped } or null when offline / GitHub unreachable.
  UPD.check = async function (force) {
    const st = store();
    if (!force && st.at && Date.now() - st.at < EVERY) {
      if (!st.rel) return null;
      return Object.assign({}, st.rel, { newer: UPD.newer(st.rel.latest, UPD.current()), skipped: st.skip === st.rel.latest });
    }
    let r;
    try {
      const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const t = ctl ? setTimeout(() => ctl.abort(), 8000) : null;
      const res = await fetch(API, { headers: { Accept: 'application/vnd.github+json' }, signal: ctl ? ctl.signal : undefined });
      if (t) clearTimeout(t);
      if (!res.ok) return null;
      r = await res.json();
    } catch (e) { return null; }
    const apk = (r.assets || []).find((a) => /\.apk$/i.test(a.name));
    const rel = { latest: r.tag_name, name: r.name || r.tag_name, notes: r.body || '', url: r.html_url, apk: apk ? apk.browser_download_url : null, size: apk ? apk.size : 0 };
    save({ at: Date.now(), rel });
    return Object.assign({}, rel, { newer: UPD.newer(rel.latest, UPD.current()), skipped: st.skip === rel.latest });
  };

  // ---------- bridge to Android (same shape as the AI pack's)
  let seq = 0; const waiting = {};
  root.AZUPD_REPLY = function (s) {
    let r; try { r = typeof s === 'string' ? JSON.parse(s) : s; } catch (e) { return; }
    const w = waiting[r.id]; if (!w) return;
    delete waiting[r.id];
    if (r.ok) w.res(r.value); else w.rej(r.value || { code: 'error' });
  };
  UPD.call = function (cmd, args) {
    if (!UPD.inApp()) return Promise.reject({ code: 'unsupported' });
    return new Promise((res, rej) => { const id = ++seq; waiting[id] = { res, rej }; root.AzUpd.postMessage(JSON.stringify({ id, cmd, args: args || {} })); });
  };

  // Download, reporting progress (0..1) as it goes, then hand the file to the installer.
  // Resolves 'installing', or 'need_permission' when Android first has to allow this app to install updates.
  UPD.download = async function (rel, onProgress) {
    await UPD.call('download', { url: rel.apk });
    for (;;) {
      await new Promise((r) => setTimeout(r, 400));
      const p = await UPD.call('progress');
      if (onProgress) onProgress(p.total > 0 ? p.done / p.total : 0, p);
      if (p.state === 'done') break;
      if (p.state === 'error') throw { code: 'download', message: p.error };
    }
    return UPD.install();
  };
  UPD.install = async function () {
    if (!(await UPD.call('canInstall'))) return 'need_permission';
    await UPD.call('install');
    return 'installing';
  };
  UPD.askPermission = () => UPD.call('askInstallPermission');
  UPD.open = (url) => (UPD.inApp() ? UPD.call('openUrl', { url }) : (root.open && root.open(url, '_blank')));

  // Release notes are GitHub markdown; show the simple parts (headings, bold, bullets) as safe HTML.
  UPD.notesHtml = function (md) {
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/`([^`]+)`/g, '$1');
    const out = []; let list = 0;
    const close = (to) => { while (list > to) { out.push('</ul>'); list--; } };
    for (const raw of String(md).replace(/\r/g, '').split('\n')) {
      const m = raw.match(/^(\s*)[-*] (.*)$/);
      if (m) { const lvl = Math.floor(m[1].length / 2) + 1; while (list < lvl) { out.push('<ul>'); list++; } close(lvl); out.push(`<li>${inline(m[2])}</li>`); continue; }
      close(0);
      const hd = raw.match(/^#{1,4}\s+(.*)$/);
      if (hd) out.push(`<p><b>${inline(hd[1])}</b></p>`);
      else if (raw.trim()) out.push(`<p>${inline(raw)}</p>`);
    }
    close(0);
    return out.join('');
  };
})(typeof window !== 'undefined' ? window : globalThis);
