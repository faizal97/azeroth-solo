// Launch screenshots at phone size (390x844 @3x) from the real build, staged through the game's own API.
// Usage: serve dist/ on :8765, then  node art/promo/shots.js <outdir>
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const OUT = process.argv[2] || path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PROFILE = fs.mkdtempSync('/tmp/azshots-');
const URL0 = 'http://localhost:8777/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9377', '--user-data-dir=' + PROFILE, '--hide-scrollbars', '--mute-audio', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
  let targets; for (let i = 0; i < 40; i++) { try { targets = await (await fetch('http://127.0.0.1:9377/json')).json(); if (targets.length) break; } catch (e) {} await sleep(250); }
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0; const wait = {};
  ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (d.id && wait[d.id]) { wait[d.id](d); delete wait[d.id]; } });
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; wait[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const js = async (expr) => { const r = await send('Runtime.evaluate', { expression: `(async()=>{${expr}})()`, awaitPromise: true, returnByValue: true }); if (r.result && r.result.exceptionDetails) console.log('JS error:', JSON.stringify(r.result.exceptionDetails).slice(0, 300)); return r.result && r.result.result && r.result.result.value; };
  const shot = async (name) => { const r = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(OUT, name), Buffer.from(r.result.data, 'base64')); console.log('saved', name); };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  const go = async () => { await send('Page.navigate', { url: URL0 }); await sleep(2500); };
  const H = `const sleep=(ms)=>new Promise(r=>setTimeout(r,ms)); const click=(re,sel='button, .row, .chip, .mcard')=>{const e=[...document.querySelectorAll(sel)].find(b=>re.test(b.textContent.trim())); if(e) e.click(); return !!e;};`;
  // stage a character, reload, enter the world
  const enter = async (setup) => {
    await go();
    await js(`${H} localStorage.clear(); ${setup} G.save(); return true;`);
    await go();
    await js(`${H} click(/Enter World/); await sleep(1800); document.querySelectorAll('.dialog .btn').forEach(b=>/Enter World|OK/i.test(b.textContent)&&b.click()); await sleep(400); return true;`);
  };
  const busyServer = `G.S.player.hp=null; G.S.player.res=null; B.advance(G.S, 40*3600000); G.S.lastSim=Date.now(); G.S.lastSeen=Date.now(); for(let i=0;i<260;i++) B.chatTick(G.S, Date.now()+i*1000); G.S.pending=[];`;



  const hero = (race, cls, lvl) => `G.newGame({name:'Aldric',cls:'${cls}',race:'${race}'}); const P=G.S.player; P.level=${lvl}; P.money=500000; P.equip=G.botChar({name:'x',cls:'${cls}',race:'${race}',level:${lvl},skill:0.6}).equip; P.talents=G.autoTalents('${cls}','dps',${lvl},0); P.visited={}; P.story={intro:true,ch1:true,ch2:true}; G.S.flags.warModeAsked=true;`;





  const seen = `try{localStorage.setItem('azsolo.story', JSON.stringify(['intro','ch1','ch2']));}catch(e){}`;
  await enter(`${hero('human','priest',22)} P.place='darkshire'; G.addItem(G.copyItem('linen_cloth'),30); for (const b of G.S.bots) b.level=Math.max(b.level,18+Math.floor(Math.random()*10)); ${busyServer} ${seen}`);
  // let the social system post a few requests quickly
  await js(`const S=G.S; const real=Date.now; let off=0; Date.now=()=>real()+off; for (let i=0;i<2400;i++){ off+=1000; SOC.tick(); } Date.now=real; for (const m of S.chat) if (m.act) { m.act.until = Date.now()+600000; } G.emitChat(); await new Promise(r=>setTimeout(r,500)); return S.chat.filter(m=>m.act&&m.act.state==='open').map(m=>m.act.kind);`).then((r)=>console.log('open', JSON.stringify(r)));
  await shot('v95c_1_strip.png');
  await js(`${H} click(/^Social$/, '.tab, button, nav button'); await sleep(600); click(/^Chat$/); await sleep(700); return true;`);
  await shot('v95c_2_chatlog.png');
  for (const kind of ['lfg','wts','where','help_kill','guild_apply']) {
    await js(`const m=G.S.chat.slice().reverse().find(x=>x.act&&x.act.kind==='${kind}'&&x.act.state==='open'); if(!m) return false; document.querySelectorAll('.dialog').forEach(d=>d.remove()); const ln=document.querySelector('.chat-full .ln[data-mid="'+m.id+'"]') || document.querySelector('.chat .ln[data-mid="'+m.id+'"]'); if (ln) ln.click(); await new Promise(r=>setTimeout(r,600)); return !!ln;`).then((r)=>console.log(kind, r));
    await shot('v95c_3_' + kind + '.png');
  }
  await js(`document.querySelectorAll('.dialog').forEach(d=>d.remove()); ${H} click(/^Guild$/); await sleep(700); return true;`);
  await shot('v95c_4_guilds.png');
  await js(`G.joinGuild(SOC.myGuilds()[0].g); G.S.player.guildRep=180; const real=Date.now; let off=0; Date.now=()=>real()+off; for (let i=0;i<1500;i++){ off+=1000; SOC.tick(); } Date.now=real; for (const m of G.S.chat) if (m.act) m.act.until=Date.now()+600000; ${H} click(/^Chat$/); await sleep(300); click(/^Guild$/); await sleep(700); return true;`);
  await shot('v95c_5_myguild.png');
  ws.close(); chrome.kill(); await sleep(1500); try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) { /* chrome still closing */ }
})();
