globalThis.localStorage={_:{},getItem(k){return k in this._?this._[k]:null},setItem(k,v){this._[k]=String(v)},removeItem(k){delete this._[k]}};
let T=Date.now(); Date.now=()=>T;
require('../src/data.js');require('../src/engine.js');require('../src/bots.js');require('../src/game.js');
const {D,E,B,G}=globalThis; const out=[]; const step=(s)=>{for(let i=0;i<s*10;i++){T+=100;G.update(0.1);}};
try{
 G.newGame({name:'Grom',race:'tauren',cls:'druid'}); const P=G.S.player; out.push('start '+P.place+' faction '+D.RACES[P.race].faction);
 for(const npc of D.PLACES.camp_narache.npcs) for(const q of G.npcQuests(npc)) if(q.st==='available') G.accept(q.qid);
 out.push('quests '+Object.keys(P.quests).join(','));
 let k=0; for(let i=0;i<140&&k<30;i++){ const al=G.placeMobs().filter(x=>x.state==='alive'); const m=al[Math.floor(Math.random()*al.length)]; if(!m){step(5);continue;} G.engage(m.id); let g=0; while(G.fight&&g<300){ G.useAbility('moonfire'); G.useAbility('wrath'); step(0.5); g++; } k++; if(P.ghostUntil) step(16); if(P.hp<P.level*20){ G.consume('food'); step(18);} if(P.res<25){G.consume('drink'); step(18);} }
 for(let i=0;i<10;i++){ G.gather(); step(3.5); }
 out.push(`kills ${k} lvl ${P.level} deaths ${P.deaths} `+Object.keys(P.quests).map(q=>q+':'+G.questState(q)).join(' '));
 for(const q of Object.keys(P.quests)) if(G.questState(q)==='complete') G.turnIn(q);
 out.push('done '+Object.keys(P.done).join(',')+' money '+P.money);
 G.travelTo('bloodhoof_village'); step(31); G.travelTo('thunder_bluff'); step(23); out.push('at '+P.place);
 const dated=new Date(T); const inV=B.onlineIn(G.S,'camp_narache',dated); out.push('valley bots '+inV.length+' factions '+[...new Set(inV.map(b=>B.factionOf(b)))].join(',')+' | northshire bots '+B.onlineIn(G.S,'northshire_abbey',dated).length);
 P.level=10; P.hp=null; P.res=null; G.queueFor('ragefire'); G.S.queue.popAt=T; step(1.5); G.acceptPop();
 out.push('RFC group: '+G.S.group.members.map(m=>m.race+'/'+m.cls+'/'+m.role).join(' '));
 let guard=0; while(G.S.run && G.S.run.phase!=='done' && guard<3000){ if(G.fight){G.useAbility('earth_shock');G.useAbility('lightning_bolt');} (G.S.run.rolls||[]).forEach((r,i)=>{if(!r.done&&!r.player)G.roll(i,'greed')}); step(0.5); guard++; }
 step(10); out.push(`RFC: ${G.S.run&&G.S.run.phase} wipes ${G.S.run&&G.S.run.wipes} | loot: `+G.S.chat.filter(m=>m.ch==='loot'&&/won/.test(m.text)).map(m=>m.text.replace(/\[\[\d\|/,'[')).slice(-4).join(' | '));
 out.push('general chat sample: '+G.S.chat.filter(m=>m.ch==='general').map(m=>m.text).slice(-3).join(' / '));
}catch(e){out.push('ERR '+e.stack.split('\n').slice(0,4).join(' | '));}
console.log(out.join('\n'));
