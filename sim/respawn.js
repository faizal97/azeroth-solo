globalThis.localStorage={getItem(){return null},setItem(){},removeItem(){}};
let T=Date.now(); const RD=Date.now; Date.now=()=>T;
require('./../src/data.js');require('./../src/engine.js');require('./../src/bots.js');require('./../src/game.js');
const {G}=globalThis; G.newGame({name:'Sim',cls:'warrior'}); G.accept('kobold_cleanup');
let upSec=0, sec=0, maxGap=0, gap=0, kills=0;
for(let i=0;i<6000;i++){ T+=100; G.update(0.1);
  if(i%10===0){ sec++; const up=G.placeMobs().filter(m=>m.key==='kobold_vermin'&&m.state==='alive');
    if(up.length){ upSec++; gap=0; if(!G.fight && sec%12===0){ G.engage(up[0].id); } } else { gap++; maxGap=Math.max(maxGap,gap); } }
  if(G.fight && G.fight.over===null && G.pUnit.res>=15) G.useAbility('heroic_strike');
}
console.log({kobold_up_pct: Math.round(upSec/sec*100), longest_wait_s: maxGap, progress: G.questProgress('kobold_cleanup')[0].have+'/10', pool: G.placeMobs().map(m=>m.key[0]).join('')});
