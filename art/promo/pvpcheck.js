// Launch screenshots at phone size (390x844 @3x) from the real build, staged through the game's own API.
// Usage: serve dist/ on :8765, then  node art/promo/shots.js <outdir>
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const OUT = process.argv[2] || path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PROFILE = fs.mkdtempSync('/tmp/azshots-');
const URL0 = 'http://localhost:8765/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9333', '--user-data-dir=' + PROFILE, '--hide-scrollbars', '--mute-audio', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
  let targets; for (let i = 0; i < 40; i++) { try { targets = await (await fetch('http://127.0.0.1:9333/json')).json(); if (targets.length) break; } catch (e) {} await sleep(250); }
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


  // War Mode intro: level 6, first time in a questing zone
  await enter(`G.newGame({name:'Aldric',cls:'warrior',race:'human'}); const P=G.S.player; P.level=6; P.place='fargodeep'; P.visited={fargodeep:true}; P.story={intro:true}; ${busyServer}`);
  await js(`${H} await sleep(3500); return !!document.querySelector('.dialog');`);
  await shot('p1_warmode_intro.png');
  // an enemy player shows up near you
  await enter(`G.newGame({name:'Aldric',cls:'warrior',race:'human'}); const P=G.S.player; P.level=12; P.equip=G.botChar({name:'x',cls:'warrior',race:'human',level:12,skill:0.6}).equip; P.place='saldean_farm'; P.visited={saldean_farm:true}; P.story={intro:true}; Object.assign(G.S.flags,{warModeAsked:true,warMode:true,nextAmbush:Date.now()+3600000}); ${busyServer}`);
  await js(`${H} const b=G.S.bots.find(b=>B.factionOf(b)==='horde'); G.S.intruder={bot:b.id,name:b.name,race:b.race,cls:b.cls,gender:b.gender,skin:b.skin,hair:b.hair,level:12,place:'saldean_farm',attackAt:null,leaveAt:Date.now()+600000}; G.S.flags.nextAmbush=Date.now()+3600000; click(/^People$/); await sleep(1200); return 1;`);
  await shot('p2_enemy_nearby.png');
  await js(`${H} [...document.querySelectorAll('.chip.foe')][0].click(); await sleep(600); return !!document.querySelector('.dialog');`);
  await shot('p3_attack_prompt.png');
  await js(`${H} click(/^Attack$/); await sleep(4000); return !!G.fight;`);
  await shot('p4_pvp_fight.png');
  await js(`${H} for(let i=0;i<60 && G.fight;i++) await sleep(1000); document.querySelectorAll('.dialog .btn').forEach(b=>b.click()); click(/^Hero$/); await sleep(800); const h=[...document.querySelectorAll('.sec-h')].find(e=>/War Mode/.test(e.textContent)); h&&h.scrollIntoView(); await sleep(300); return JSON.stringify(G.pvpStats());`);
  await shot('p5_hero_warmode.png');

  ws.close(); chrome.kill(); await sleep(1500); try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) { /* chrome still closing */ }
})();
