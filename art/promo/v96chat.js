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





  const seen = `try{localStorage.setItem('azsolo.story', JSON.stringify(['intro','ch1','ch2','ch3']));}catch(e){}`;
  await enter(`${hero('human','warrior',30)} P.place='darkshire'; P.prof={tailoring:{skill:120,max:150,known:[]}}; G.addItem(G.copyItem('linen_cloth'),40); G.addItem(G.copyItem('wool_cloth'),20); for (const q of Object.keys(D.QUESTS)) { const Q=D.QUESTS[q]; if ((!Q.faction||Q.faction==='alliance') && Q.lvl>=26 && Q.lvl<=30 && !Q.group && !Q.dungeon && !(Q.pre||[]).length && Q.objs.some(o=>o.type==='kill')) { P.quests[q]={prog:Q.objs.map(()=>0)}; if (Object.keys(P.quests).length>=3) break; } } for (const b of G.S.bots) b.level=Math.max(b.level,24+Math.floor(Math.random()*10)); ${busyServer} ${seen}`);
  const kinds = await js(`const S=G.S; const real=Date.now; let off=0; Date.now=()=>real()+off; const found={}; for (let i=0;i<5*3600 && Object.keys(found).length<7;i++){ off+=1000; SOC.tick(); for (const m of S.chat) if (m.act && m.act.state==='open' && ['craft_order','duel','rare','quest_team','carry','swap','chat','gift'].includes(m.act.kind) && !found[m.act.kind]) { found[m.act.kind]=m.id; m.act.until=real()+off+3600000; m.act.nudged=true; } } Date.now=real; for (const m of S.chat) if (m.act && m.act.state==='open') { m.act.until = Date.now()+3600000; } G.emitChat(); return found;`);
  console.log(JSON.stringify(kinds));
  await js(`${H} click(/^Social$/, '.tab, button, nav button'); await sleep(600); click(/^Chat$/); await sleep(500); click(/^Requests/); await sleep(700); return true;`);
  await shot('v96_0requests.png');
  for (const [kind, id] of Object.entries(kinds || {})) {
    await js(`document.querySelectorAll('.dialog').forEach(d=>d.remove()); const m=G.S.chat.find(x=>x.id===${id}); if (m) window.__md = m; const ln=document.querySelector('.chat-full .ln[data-mid="${id}"]'); if (ln) ln.click(); await new Promise(r=>setTimeout(r,600)); return !!ln;`);
    await shot('v96_' + kind + '.png');
  }
  await js(`document.querySelectorAll('.dialog').forEach(d=>d.remove()); G.joinGuild(SOC.myGuilds()[0].g); G.S.player.guildRep=320; ${H} click(/^Chat$/); await sleep(300); click(/^Guild$/); await sleep(700); return true;`);
  await shot('v96_zguild.png');
  ws.close(); chrome.kill(); await sleep(1500); try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) { /* chrome still closing */ }
})();
