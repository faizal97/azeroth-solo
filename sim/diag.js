globalThis.localStorage={getItem(){return null},setItem(){},removeItem(){}};
require('../src/data.js');require('../src/engine.js');require('../src/bots.js');require('../src/game.js');
const {D,E,B,G}=globalThis; G.newGame({name:'Sim',cls:'warrior'});
const roles=['tank','healer','dps','dps','dps'];
const mem=roles.map((r,i)=>{const b=B.makeBot(9000+i,new Set(),{level:10});b.cls=r==='tank'?'warrior':r==='healer'?'priest':(['mage','rogue','mage'][i%3]);b.role=r;b.skill=0.5;return G.botChar(b);});
const allies=mem.map(m=>{const u=E.charUnit(m,'ally','bot',0);u.bot={skill:0.5,react:0.6};return u;});
const DM=D.DUNGEONS.deadmines;
const key=process.argv[2]||'vancleef';
const en=[E.mobUnit(key,null,D.MOBS[key].boss?DM.bossMult:DM.trashMult)];
const C=E.fight(allies,en,{puller:allies[0],dungeonMult:DM.trashMult});
const dmgTaken={},dmgDone={},heal={};
while(!C.over&&C.t<240){E.tick(C,0.1);for(const e of C.events){if(e.type==='dmg'){const s=C.units[e.src],t=C.units[e.tgt];if(t.side==='ally')dmgTaken[t.name]=(dmgTaken[t.name]||0)+e.amount;else dmgDone[s.name]=(dmgDone[s.name]||0)+e.amount;}if(e.type==='heal')heal[C.units[e.src].name]=(heal[C.units[e.src].name]||0)+e.amount;}C.events.length=0;}
console.log(key,'result',C.over,'t',C.t.toFixed(1),'boss hp',en[0].maxHp,'dmg',en[0].dmg.map(x=>x.toFixed(1)));
for(const u of allies)console.log(u.role.padEnd(6),u.cls.padEnd(8),'maxHp',u.maxHp,'hp',Math.round(u.hp),'res',Math.round(u.res),'/',u.maxRes,'armor',u.st.armor,'taken',dmgTaken[u.name]||0,'done',dmgDone[u.name]||0,'heal',heal[u.name]||0);
