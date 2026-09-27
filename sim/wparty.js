globalThis.localStorage={_:{},getItem(k){return k in this._?this._[k]:null},setItem(k,v){this._[k]=String(v)},removeItem(k){delete this._[k]}};
let T=Date.now(); Date.now=()=>T;
require('../src/data.js');require('../src/engine.js');require('../src/bots.js');require('../src/game.js');
const {D,E,B,G}=globalThis; const out=[]; const step=(s)=>{for(let i=0;i<s*10;i++){T+=100;G.update(0.1);}};
try{
 G.newGame({name:'Tester',race:'human',cls:'mage'}); const P=G.S.player; P.level=6; P.place='fargodeep'; G.S.world={};
 const invites=[]; G.on('partyInvite', d=>invites.push({t:T, bot:d.bot.name}));
 // 2 hours idle-ish in a hunting zone, declining everything
 for(let m=0;m<120;m++){ step(60); if(G.S.flags.pendingInvite) G.declinePartyInvite(G.S.flags.pendingInvite); }
 const gaps=invites.slice(1).map((x,i)=>Math.round((x.t-invites[i].t)/60000));
 out.push(`declining: ${invites.length} invites in 2h, gaps (min): ${gaps.join(',')}, repeat inviters: ${invites.length-new Set(invites.map(i=>i.bot)).size}`);
 // accept one and fight
 G.S.flags.nextInvite=0; G.S.flags.declined=[]; invites.length=0; for(let m=0;m<20&&!invites.length;m++) step(60);
 if(invites.length){ G.acceptPartyInvite(G.S.flags.pendingInvite); step(4); }
 out.push('party: '+(G.S.wparty? G.S.wparty.members.map(m=>m.name+'('+m.cls+','+m.role+')').join(' '):'none'));
 const xp0=P.xp, k0=P.kills; let fights=0, enemies=0;
 for(let i=0;i<8;i++){ const m=G.placeMobs().find(x=>x.state==='alive'); if(!m){step(5);continue;} G.engage(m.id); if(G.fight){ fights++; enemies+=G.fight.enemies.length; } let g=0; while(G.fight&&g<400){ G.useAbility('fireball'); step(0.5); g++; } step(10); }
 out.push(`party fights ${fights}, enemies per pull ${(enemies/Math.max(1,fights)).toFixed(1)}, kills ${P.kills-k0}, xp gained ${P.xp-xp0}, deaths ${P.deaths}`);
 G.travelTo('goldshire'); step(20); out.push('after leaving area: party '+(G.S.wparty?'still there':'disbanded')+' | last sys: '+G.S.chat.filter(m=>m.ch==='system').slice(-2).map(m=>m.text).join(' / '));
 G.setInvites(false); G.S.flags.nextInvite=0; invites.length=0; P.place='fargodeep'; for(let m=0;m<60;m++) step(60); out.push('with invites off, invites in 1h: '+invites.length);
}catch(e){out.push('ERR '+e.stack.split('\n').slice(0,4).join(' | '));}
console.log(out.join('\n'));
