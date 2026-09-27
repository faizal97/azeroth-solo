// AI pack plumbing with a fake Android bridge: bank fills, guards hold, fallbacks work.
const mem={}; globalThis.localStorage={getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=String(v)},removeItem:k=>{delete mem[k]}};
globalThis.document={visibilityState:'visible'};
let dev={ramMB:11400,availMB:5000,lowMemory:false,battery:80,charging:false,powerSave:false,thermal:0,model:'OPPO CPH2525',sdk:34};
let model=null, calls=[];
const OUT={general:"1. lf group for hogger\n- anyone seen the kobolds?\n\"wts linen cloth pst\"\nHere are some lines:\nwhere do i train lol\nvisit www.gold.com cheap",lfg:"LF1M healer Wanted: Hogger\ntank lfg hogger pst",party:"hi all\nlets go\no/",npc:"Welcome, traveller. The Light guides you.\nWell met, friend.",bio:"Vex never names a pet the same twice. Idles by the Goldshire fountain."};
globalThis.AzAI={postMessage(s){const r=JSON.parse(s); calls.push(r.cmd); let v=null, ok=true;
  if(r.cmd==='device') v=dev; else if(r.cmd==='model') v=model; else if(r.cmd==='importModel'){ model={path:'/x',bytes:560e6,loaded:false}; v=model; }
  else if(r.cmd==='load'||r.cmd==='unload') v=true;
  else if(r.cmd==='generate'){ const p=r.args.prompt; const k=/General chat/.test(p)?'general':/looking for group/.test(p)?'lfg':/party chat/.test(p)?'party':/character card/.test(p)?'bio':/town crier/.test(p)?'crier':'npc';
    v={text: k==='crier'?'Hear ye! Brave Vex reached level 10 today.':OUT[k]||'ok', ms:900}; }
  setTimeout(()=>globalThis.AZAI_REPLY(JSON.stringify({id:r.id,ok,value:v})),5);}};
require('../src/data.js');require('../src/engine.js');require('../src/bots.js');require('../src/game.js');require('../src/ai.js');
const {G,B,AI}=globalThis; G.newGame({name:'Sim',cls:'warrior'});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m); if(!c) process.exitCode=1;};
(async()=>{
  console.log('clean:', JSON.stringify(AI.clean(OUT.general)));
  ok(!AI.clean(OUT.general).some(l=>/www|Here are/.test(l)),'sanitiser drops links and preambles');
  await wait(1700); ok(AI.state==='no_model','no model -> no_model ('+AI.state+')'); ok(AI.tier().id==='1b','12 GB phone -> 1B');
  ok(AI.take('general','Northshire Valley')===null,'empty bank -> null, template used');
  await AI.importModel(); ok(AI.state==='off','import validates then stays off ('+AI.state+')');
  AI.setOn(true); await wait(5200*4);
  const ln=AI.bankSize(); ok(ln>0,'bank filled in quiet moments: '+ln+' lines');
  const zone=AI.zoneKey(); const l=AI.take('general',zone); ok(!!l,'take general for '+zone+': '+l);
  // guards
  dev={...dev,battery:20}; AI.device.battery=20; const gens=calls.filter(c=>c==='generate').length; await wait(5200*2);
  ok(calls.filter(c=>c==='generate').length===gens,'under 30% -> no generation ('+AI.pauseReason+')');
  dev={...dev,charging:true}; AI.device.charging=true; await wait(5200*2); ok(calls.filter(c=>c==='generate').length>gens,'charging -> refills again');
  G.fight={}; const g2=calls.filter(c=>c==='generate').length; await wait(5200*2); ok(calls.filter(c=>c==='generate').length===g2,'in a fight -> waits ('+AI.pauseReason+')'); G.fight=null;
  const bot=G.S.bots[0]; const bio=await AI.requestBio(bot); ok(!!bio,'bio: '+bio); ok(!!B.bio(bot),'template bio: '+B.bio(bot));
  const st=await AI.awayStory({news:[{text:'Vex reached level 10.'}]}); ok(!!st,'away story: '+st);
  // browser fallback: partyLine still works with an empty party bank
  for (let i=0;i<20;i++) B.partyLine(bot,'pull'); ok(true,'partyLine ok');
  AI.setOn(false); ok(calls.includes('unload'),'turning off unloads the model');
  process.exit();
})();
