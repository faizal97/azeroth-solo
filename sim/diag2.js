globalThis.localStorage={getItem(){return null},setItem(){},removeItem(){}};
require('../src/data.js');require('../src/engine.js');require('../src/bots.js');require('../src/game.js');
const {D,E,B,G}=globalThis; G.newGame({name:'Sim',cls:'warrior'});
const b=B.makeBot(9000,new Set(),{level:10});b.cls='warrior';b.role='tank';b.skill=0.5;const m=G.botChar(b);
const u=E.charUnit(m,'ally','bot',0);u.bot={skill:0.5,react:0.6};
const en=E.mobUnit('vancleef',null,D.DUNGEONS.deadmines.bossMult);
const C=E.fight([u],[en],{puller:u});
const c={};
for(let i=0;i<200;i++){E.tick(C,0.1);for(const e of C.events){if(e.src===en.uid&&e.type==="dmg"){c.sum=(c.sum||0)+e.amount;c.abs=(c.abs||0)+e.absorbed;} if(e.src===en.uid){c[e.type+(e.what||'')]=(c[e.type+(e.what||'')]||0)+1;}}C.events.length=0;}
console.log(c,'target',en.target,u.uid,'swingT',en.swingT,'stun',en.stunUntil,'auras',en.auras.map(a=>a.id+':'+a.slow));
