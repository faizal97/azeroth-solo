globalThis.localStorage={_:{},getItem(k){return k in this._?this._[k]:null},setItem(k,v){this._[k]=String(v)},removeItem(k){delete this._[k]}};
let T=Date.now(); Date.now=()=>T;
require('../src/data.js');require('../src/engine.js');require('../src/bots.js');require('../src/game.js');
const {D,E,B,G}=globalThis; const out=[]; const step=(s)=>{for(let i=0;i<s*10;i++){T+=100;G.update(0.1);}};
try{
 G.newGame({name:'Lyra',race:'nightelf',cls:'druid'}); const P=G.S.player; out.push('start '+P.place+' race '+P.race);
 for(const npc of D.PLACES.shadowglen.npcs) for(const q of G.npcQuests(npc)) if(q.st==='available') G.accept(q.qid);
 let k=0; for(let i=0;i<120&&k<30;i++){ const al=G.placeMobs().filter(x=>x.state==='alive'); const m=al[Math.floor(Math.random()*al.length)]; if(!m){step(5);continue;} G.engage(m.id); let g=0; while(G.fight&&g<300){ G.useAbility('moonfire'); G.useAbility('wrath'); step(0.5); g++; } k++; if(P.ghostUntil) step(16); if(P.hp<P.level*20){ G.consume('food'); step(18);} if(P.res<30){G.consume('drink'); step(18);} }
 out.push(`kills ${k} lvl ${P.level} deaths ${P.deaths} `+Object.keys(P.quests).map(q=>q+':'+G.questState(q)+JSON.stringify(G.questProgress(q).map(p=>p.have+'/'+p.n))).join(' '));
 for(const q of Object.keys(P.quests)) if(G.questState(q)==='complete') G.turnIn(q);
 out.push('done '+Object.keys(P.done).join(','));
 G.travelTo('dolanaar'); step(31); G.travelTo('darnassus'); step(26); out.push('at '+P.place); G.travelTo('goldshire'); step(61); out.push('boat to '+P.place);
 const dated=new Date(T); out.push('bots in shadowglen '+B.onlineIn(G.S,'shadowglen',dated).length+' dolanaar '+B.onlineIn(G.S,'dolanaar',dated).length);
}catch(e){out.push('ERR '+e.stack.split('\n').slice(0,4).join(' | '));}
console.log(out.join('\n'));
