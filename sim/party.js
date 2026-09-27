// XP/hour and deaths/hour: solo vs a world party of 3, same rules the game uses.
globalThis.localStorage={_:{},getItem(){return null},setItem(){},removeItem(){}};
require('../src/data.js');require('../src/engine.js');require('../src/bots.js');require('../src/game.js');
const {D,E,B,G}=globalThis; G.newGame({name:'Sim',cls:'warrior'});
const EXTRA_PULL = +(process.env.EXTRA||0.7), SPLIT = +(process.env.SPLIT||1.2);
function char(cls,L,role){ const b=B.makeBot(1+Math.floor(Math.random()*1e6),new Set(),{level:L}); b.cls=cls; b.role=role; b.skill=0.6; const c=G.botChar(b); c.hp=null; return c; }
function session(L, comp, minutes){
  const mobKey = L<=5 ? 'kobold_laborer' : 'murloc_forager';
  const chars = comp.map(([cls,role])=>char(cls,L,role));
  let t=0, xp=0, deaths=0, kills=0;
  while(t<minutes*60){
    const allies = chars.map(c=>{ const u=E.charUnit(c,'ally','bot',0); u.bot={skill:0.6,react:0.5}; return u; });
    let n=1; for(let i=1;i<chars.length;i++) if(Math.random()<EXTRA_PULL) n++;
    const en=[]; for(let i=0;i<n;i++) en.push(E.mobUnit(mobKey,L+(Math.random()<0.5?0:1)));
    const C=E.fight(allies,en,{puller:allies[0], soloUid: allies[0].uid});
    while(!C.over&&C.t<180) E.tick(C,0.1);
    t+=C.t;
    allies.forEach((u,i)=>{ E.writeBack(C,u,0); });
    if(C.over==='win'){ kills+=n; const per=(L*5+45); xp += n*per*(chars.length===1?1:SPLIT/chars.length); }
    else { deaths++; t+=30; chars.forEach(c=>{c.hp=null;c.res=null;}); continue; }
    // rest: whoever is lowest decides; everyone eats/drinks like a real player (18s food restores ~ a lot)
    const st=chars.map(c=>E.statsFor(c)); let rest=0;
    for(let i=0;i<chars.length;i++){ const c=chars[i]; if(c.hp==null) continue; const pct=c.hp/st[i].maxHp; const mpct = st[i].maxMana? (c.res==null?1:c.res/st[i].maxMana):1; if(pct<0.6||mpct<0.35) rest=Math.max(rest,18); }
    if(chars[0].hp!=null && chars[0].hp/st[0].maxHp<0.3) deaths+=0; 
    t+=rest+4; chars.forEach((c,i)=>{ if(rest) { c.hp=null; c.res=null; } if(c.dead){} if(c.hp===0){c.hp=Math.round(st[i].maxHp*0.5);} });
  }
  return {xph: Math.round(xp/(t/3600)), deathsPerHour: +(deaths/(t/3600)).toFixed(1), killsPerHour: Math.round(kills/(t/3600))};
}
for (const L of [5,9]) for (const cls of ['warrior','mage','priest']) {
  const solo=session(L,[[cls,'dps']],120);
  const party=session(L,[[cls,'dps'],['warrior','tank'],['priest','healer']],120);
  const party2=session(L,[[cls,'dps'],['rogue','dps'],['mage','dps']],120);
  console.log(`L${L} ${cls.padEnd(8)} solo ${String(solo.xph).padStart(6)} xp/h ${solo.deathsPerHour} d/h | party(tank+heal) ${String(party.xph).padStart(6)} (${(party.xph/solo.xph).toFixed(2)}x) ${party.deathsPerHour} d/h | party(3 dps) ${String(party2.xph).padStart(6)} (${(party2.xph/solo.xph).toFixed(2)}x) ${party2.deathsPerHour} d/h`);
}
