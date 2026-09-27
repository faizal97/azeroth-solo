globalThis.localStorage={_:{},getItem(k){return k in this._?this._[k]:null},setItem(k,v){this._[k]=String(v)},removeItem(k){delete this._[k]}};
require('../src/data.js');require('../src/engine.js');require('../src/bots.js');require('../src/game.js');
const {G}=globalThis; const out=[];
// an old single save from v1.5 and earlier
G.newGame({name:'Oldie',cls:'warrior'}); G.S.player.level=7; const old=JSON.stringify(G.S); delete JSON.parse(old).id;
for (const k of Object.keys(localStorage._)) delete localStorage._[k];
const o=JSON.parse(old); delete o.id; localStorage.setItem('azsolo.save.v1', JSON.stringify(o)); G.S=null;
out.push('migrated: '+JSON.stringify(G.characters().map(c=>c.name+' L'+c.level)));
out.push('old key gone: '+(localStorage.getItem('azsolo.save.v1')===null));
G.logout(); G.newGame({name:'Testlock',cls:'warlock'}); G.save(); G.logout();
G.newGame({name:'Testbear',cls:'druid'}); G.save();
out.push('list: '+G.characters().map(c=>c.name+'/'+c.cls).join(', '));
const r=G.load(G.characters().find(c=>c.name==='Oldie').id); out.push('loaded Oldie level '+G.S.player.level+' report ok '+!!r);
G.deleteCharacter(G.characters().find(c=>c.name==='Testlock').id);
out.push('after delete: '+G.characters().map(c=>c.name).join(', ')+' | keys '+Object.keys(localStorage._).join(','));
console.log(out.join('\n'));
