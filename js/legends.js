'use strict';
// =====================================================================
//  Objetos legendarios: uno por nivel de expedición (1-8), botín general con muy poca probabilidad y un efecto especial cada uno
// =====================================================================
const LEGEND_IDS = ['dawntear', 'moondagger', 'vigilmantle', 'alphahorn', 'frostfang', 'lastwall', 'shadowgloves', 'crystalboots'];

// ---------- iconos ----------
Object.assign(ICON_ROWS, {
  dawntear:     {pal:{Y:'#ffd23a', y:'#e8a020', W:'#fffbe0'}, rows:["....kkkk....", "...k....k...", "...k....k...", "....k..k....", ".....kk.....", "....kYYk....", "...kYyyYk...", "...kYyWyYk..", "...kYyyYk...", "....kYYk....", ".....kk....."]},
  moondagger:   {pal:{w:'#e8f4ff', s:'#7ab0e0', g:'#8ad8ff', b:'#2a2a48'}, rows:ICON_ROWS.dagger.rows},
  vigilmantle:  {pal:{L:'#6a6e78', l:'#a8acb8', d:'#2e3038', s:'#e0e4f0'}, rows:ICON_ROWS.chestarmor.rows},
  alphahorn:    {pal:{L:'#8a7a5a', l:'#f0e8d0', d:'#3a2e1c', s:'#ffd23a'}, rows:ICON_ROWS.helmet.rows},
  frostfang:    {pal:{w:'#e0f8ff', s:'#4aa8e8', r:'#ffa050', g:'#c8962e', b:'#3a2a18'}, rows:ICON_ROWS.sword.rows},
  lastwall:     {pal:{m:'#14161c', M:'#5ae0e8', i:'#3a3e4a', I:'#8a90a0', g:'#5ae0e8'}, rows:ICON_ROWS.aegis.rows},
  shadowgloves: {pal:{L:'#3a7a4a', d:'#14301c', s:'#c8ffd0'}, rows:ICON_ROWS.gloves.rows},
  crystalboots: {pal:{L:'#3a5a7a', l:'#7ac8f0', d:'#1a2c40', s:'#d0f4ff'}, rows:ICON_ROWS.boots.rows},
});
for(const k of LEGEND_IDS){ const d = ICON_ROWS[k]; ICONS[k] = bakeRows(d.rows, Object.assign({k:OUT}, d.pal)); }

// ---------- objetos ----------
Object.assign(ITEMS, {
  dawntear:    {name:'Lágrima del Alba', icon:'dawntear', slot:'talisman', legend:true, lvl:1, value:250,
    fixed:[{k:'gold', v:25}, {k:'hpreg', v:1}],
    desc:'Objeto legendario. Amanecer: cada 30 s emite un destello que cura 25 de vida al héroe y a las mascotas y ahuyenta 2 s a los enemigos cercanos.'},
  moondagger:  {name:'Daga Hueso de Luna', icon:'moondagger', slot:'weapon', kind:'dagger', gear:true, unique:true, legend:true, lvl:2, dur:140, dmg:[14,20], crit:10, value:260,
    desc:'Objeto legendario. Arma muy rápida de corto alcance. Sombra lunar: cada 3.er golpe es un crítico seguro que deja un sangrado de 6 s.'},
  vigilmantle: {name:'Manto del Vigía Eterno', icon:'vigilmantle', slot:'chest', gear:true, unique:true, legend:true, lvl:3, armor:14, value:260, ov:'legchest',
    fixed:[{k:'hp', v:30}],
    desc:'Objeto legendario. Vigilia: si recibes un golpe mortal te quedas con 1 de vida y eres invulnerable 2 s (una vez por expedición).'},
  alphahorn:   {name:'Cuerno del Alfa', icon:'alphahorn', slot:'head', gear:true, unique:true, legend:true, lvl:4, armor:3, value:260, ov:'legalpha',
    fixed:[{k:'hp', v:25}, {k:'move', v:10}],
    desc:'Objeto legendario. Manada: tus mascotas hacen +25 % de daño y atacan un 25 % más rápido; cuando matas a un enemigo, el siguiente golpe de cada mascota hace el doble.'},
  frostfang:   {name:'Colmillo de Hielo Ardiente', icon:'frostfang', slot:'weapon', kind:'sword', gear:true, unique:true, legend:true, lvl:5, dur:130, dmg:[40,54], value:280,
    desc:'Objeto legendario. Choque térmico: alterna golpes de fuego y de hielo; si un enemigo quemado se congela (o al revés), explota en área y aturde 1 s.'},
  lastwall:    {name:'Escudo del Último Muro', icon:'lastwall', slot:'shield', gear:true, unique:true, legend:true, lvl:6, dur:150, armor:4, block:.85, value:260,
    desc:'Objeto legendario. Bloquea el 85 % del daño frontal. Reflejo: al bloquear un golpe devuelve el 50 % del daño al atacante y empuja a los que están alrededor.'},
  shadowgloves:{name:'Guantes del Cazador de Sombras', icon:'shadowgloves', slot:'hands', gear:true, unique:true, legend:true, lvl:7, armor:2, value:260, ov:'leggloves',
    fixed:[{k:'crit', v:8}],
    desc:'Objeto legendario. Presa: cada crítico cuerpo a cuerpo marca al enemigo 6 s (recibe +25 % de daño de todos); si muere marcado, suelta un objeto extra.'},
  crystalboots:{name:'Botas del Caminante de Gemas', icon:'crystalboots', slot:'feet', gear:true, unique:true, legend:true, lvl:8, armor:1, value:260, ov:'legboots',
    fixed:[{k:'stam', v:20}, {k:'move', v:20}],
    desc:'Objeto legendario. Rastro de cristal: al correr dejas una estela que ralentiza a los enemigos; tras 5 s corriendo ganas +25 % de velocidad y un 25 % de esquivar.'},
});
ITEM_AFFIX.loot  = {sfx:'', roll:[0,0], slots:[], desc:v => `+${v} % de probabilidad de botín`};
ITEM_AFFIX.hpreg = {sfx:'', roll:[0,0], slots:[], desc:v => `+${v} de vida por segundo`};
RARITY_PRICE.legendary = 4;

// ---------- aspecto en el héroe: capas recoloreadas ----------
function legendOv(name, base, pal){
  const o = ARMOR_OV[base]; ARMOR_OV[name] = {ox:o.ox, oy:o.oy, rows:o.rows, img:{}};
  ARMOR_OV[name].img.legendary = bakeRows(o.rows, Object.assign({k:OUT, s:'#ff9a3c'}, pal));
}
legendOv('legchest', 'chest', {L:'#6a6e78', l:'#a8acb8', d:'#2e3038'});
legendOv('legalpha', 'urrhelm', {L:'#8a7a5a', l:'#f0e8d0', d:'#3a2e1c'});
legendOv('leggloves', 'glove', {L:'#3a7a4a', l:'#6ac07a', d:'#14301c'});
legendOv('legglovesBig', 'bigGlove', {L:'#3a7a4a', l:'#6ac07a', d:'#14301c'});
legendOv('legboots', 'boot', {L:'#3a5a7a', l:'#7ac8f0', d:'#1a2c40'});
const ovName = (it, dflt) => (it && ITEMS[it.id] && ITEMS[it.id].ov) || dflt;
ART.lastwall = SP(paintSprite(12, 13, [
  {poly:[[0,0],[12,0],[12,6],[6,13],[0,6]], c:['#2a2c34','#4a4e5a','#8a90a0']}, {poly:[[2,2],[10,2],[10,6],[6,10],[2,6]], c:['#14161c','#22242c','#3a3e4a'], tex:98},
  {e:[6,5,1.6,1.6], c:['#2a8aa0','#5ae0e8','#d0ffff']},
]), 6, 6);

// ---------- efectos ----------
// ¿lleva equipado ese objeto? (las armas solo cuentan si son el arma activa)
function legendOn(id){
  const E = G.inv.equip, cw = E[curWeaponKey()];
  return (cw && cw.id === id) || [E.shield, E.head, E.chest, E.hands, E.feet].some(i => i && i.id === id) || (E.tal || []).some(i => i && i.id === id);
}
function dawnFlash(){
  P.hp = Math.min(P.maxHp, P.hp + 25); addText(P.x, P.y-56, '¡Amanecer!', '#ffe08a', 9); sfx('alba');
  for(const p of G.pets) if(!p.dead){ p.hp = Math.min(p.maxHp, p.hp + 25); if(p.item) p.item.hp = p.hp; addText(p.x, p.y-30, '+25', '#7ad86a', 7); }
  for(const m of G.mons) if(!m.dying && Math.hypot(m.x-P.x, m.y-P.y) < 170 && !MONSTERS[m.type].boss) m.fearT = Math.max(m.fearT || 0, 2);
  ring(P.x, P.y-10, 120, '#ffe08a', .6); burst(P.x, P.y-18, 24, ['#fff0a0', '#ffd23a', '#ffffff'], [60, 200], [.4, .9], -30);
  G.flash = {x:P.x, y:P.y-14, t:.4};
}
function updateLegends(dt){
  if(P.breadT > 0) P.breadT -= dt;
  if(P.weakT > 0) P.weakT -= dt;
  if(P.dead) return;
  P.dawnT = legendOn('dawntear') ? (P.dawnT ?? 30) - dt : undefined;
  if(P.dawnT !== undefined && P.dawnT <= 0){ P.dawnT = 30; dawnFlash(); }
  // botas de cristal: estela que ralentiza y, tras 5 s corriendo, impulso
  const boots = legendOn('crystalboots');
  if(G.trailSc !== G.sc){ G.trail = []; G.trailSc = G.sc; }
  if(boots && P.running){ P.runT = (P.runT || 0) + dt; P.trailAcc = (P.trailAcc || 0) + dt; if(P.trailAcc > .1){ P.trailAcc = 0; G.trail.push({x:P.x, y:P.y, t:3}); } }
  else P.runT = 0;
  P.surge = boots && P.runT > 5;
  if(P.surge && Math.random() < dt*20) G.parts.push({x:P.x + rand(-6,6), y:P.y - rand(4,24), vx:0, vy:-18, life:.4, max:.4, size:1.5, col:'#c8f0ff'});
  for(const tp of G.trail){
    tp.t -= dt;
    if(Math.random() < dt*(tp.r > 20 ? 6 : 3)) G.parts.push({x:tp.x + rand(-(tp.r||18)*.5, (tp.r||18)*.5), y:tp.y - rand(0,4), vx:0, vy:-8, life:.5, max:.5, size:1.5, col:pick(tp.r > 20 ? ['#4ad85a', '#b8ffb8', '#2a9a3a'] : ['#7ac8f0', '#c8f0ff', '#ffffff'])});
    for(const m of G.mons) if(!m.dying && Math.hypot(m.x-tp.x, m.y-tp.y) < (tp.r || 18)) m.slowT = Math.max(m.slowT, tp.slow || .6);
  }
  G.trail = G.trail.filter(tp => tp.t > 0);
}
// golpe cuerpo a cuerpo del héroe: devuelve qué cambia (crítico seguro) y modifica los efectos del golpe
function legendMelee(w, m, crit, fx2){
  const id = w && w.id, out = {};
  legendMelee2(w, m, fx2, out);
  if(id === 'moondagger'){ P.moonN = (P.moonN || 0) + 1; if(P.moonN % 3 === 0){ if(!crit) out.addCrit = true; fx2.bleed = 6; } }
  if(id === 'frostfang'){
    P.fangN = (P.fangN || 0) + 1;
    if(P.fangN % 2){ fx2.burn = 4; out.boom = m.freezeT > 0; } else { fx2.freeze = 2.5; out.boom = m.burnT > 0 && !(m.freezeImmT > 0); }
  }
  return out;
}
function legendAfterHit(m, dmg, crit, out){
  legendAfterHit2(m, dmg, out);
  if(out.boom){
    ring(m.x, m.y-6, 56, '#ffb070', .4); burst(m.x, m.y-10, 22, ['#ff8a2a', '#c8f0ff', '#ffffff'], [60, 220], [.3, .7], 0); sfx('boom'); G.shake = Math.max(G.shake, 5);
    addText(m.x, m.y-m.r*2-30, '¡Choque térmico!', '#ffd0a0', 8, -20);
    for(const o of G.mons) if(o !== m && !o.dying && Math.hypot(o.x-m.x, o.y-m.y) < 60) hitMonster(o, Math.round(dmg*.8), {src:'player', nx:(o.x-m.x)/60, ny:(o.y-m.y)/60, k:240, stun:1});
    if(!m.dying) m.stunT = Math.max(m.stunT, 1);
  }
  if(crit && legendOn('shadowgloves') && !m.dying){ m.markT = 6; m.legendMark = true; addText(m.x, m.y-m.r*2-18, 'Presa', '#a8ffb8', 6, -20); }
}
// golpe mortal al héroe: Vigilia lo deja con 1 de vida (una vez por expedición)
function legendVigil(){
  if(!legendOn('vigilmantle') || P.vigilUsed) return false;
  P.vigilUsed = true; P.hp = 1; P.inv = 2; P.dead = false;
  toast('¡Vigilia! El manto te mantiene con vida', 3); addText(P.x, P.y-56, '¡Vigilia!', '#e0e4f0', 9); sfx('alba');
  ring(P.x, P.y-10, 90, '#e0e4f0', .6); burst(P.x, P.y-18, 22, ['#e0e4f0', '#ffffff', '#a8acb8'], [60, 180], [.4, .8], -20);
  return true;
}
// Reflejo del escudo: devuelve la mitad del daño y empuja a los de alrededor
function legendReflect(m, raw, nx, ny){
  hitMonster(m, Math.round(raw*.5), {src:'player', nx, ny, k:200});
  ring(P.x, P.y-10, 56, '#5ae0e8', .35);
  for(const o of G.mons) if(!o.dying && Math.hypot(o.x-P.x, o.y-P.y) < 60){ const d = Math.hypot(o.x-P.x, o.y-P.y) || 1; if(!MONSTERS[o.type].boss){ o.vx += (o.x-P.x)/d*360; o.vy += (o.y-P.y)/d*360; } }
}
// botín: monstruos y cofres de cualquier mapa, con muy poca probabilidad (≈ 1 legendario cada 5-6 incursiones)
function legendPick(lvl){ const pool = LEGEND_IDS.filter(id => ITEMS[id].lvl <= lvl); return pool.length ? pick(pool) : null; }
function legendDrop(m, lvl){
  const ch = {normal:.0005, magic:.002, rare:.006}[m.rarity] || 0, id = Math.random() < ch ? legendPick(lvl) : null;
  if(id){ dropItem(m.x, m.y, mkItem(id, 1, lvl)); addText(m.x, m.y-m.r*2-40, '¡Objeto legendario!', '#ff9a3c', 8, -20); sfx('levelup'); }
}
function legendChest(c, lvl){
  const id = Math.random() < (c.rare ? .01 : .002) ? legendPick(lvl) : null;
  if(id){ dropItem(c.x, c.y+4, mkItem(id, 1, lvl)); addText(c.x, c.y-30, '¡Objeto legendario!', '#ff9a3c', 8, -20); sfx('levelup'); }
}

// =====================================================================
//  Legendarios exclusivos: 2 por expedición, solo caen en su mapa (se ven al pasar el cursor sobre la expedición)
// =====================================================================
const EXCL_LEGENDS = {
  village:['slimemace', 'slimeheart'], cemetery:['gravespade', 'funerallamp'], crypt:['whisperbow', 'ashcrown'],
  plains:['trackercrossbow', 'bisonhide'], orccamp:['skullaxe', 'trophybelt'], castle:['chiefhammer', 'blackmail'],
  river:['currentsword', 'riverpearl'], forest:['moonbow', 'rootgloves'], mine:['kingpick', 'minerhelm'],
};
const EXCL_IDS = Object.values(EXCL_LEGENDS).flat();
Object.assign(ICON_ROWS, {
  slimemace:   {pal:{M:'#4ad85a', m:'#1a7a2a', s:'#b8ffb8', b:'#5a3d26', B:'#7a5636'}, rows:ICON_ROWS.mace.rows},
  slimeheart:  {pal:{G:'#3ad85a', g:'#d0ffd8'}, rows:[".kkk....kkk.", "kGGGk..kGGGk", "kGgGGkkGGGGk", "kGgGGGGGGGGk", "kGGGGGGGGGGk", ".kGGGGGGGGk.", "..kGGGGGGk..", "...kGGGGk...", "....kGGk....", ".....kk....."]},
  gravespade:  {pal:{M:'#7a6a50', m:'#3a3020', s:'#c8b894', b:'#3a2a1a', B:'#5a4a30'}, rows:ICON_ROWS.mace.rows},
  funerallamp: {pal:{b:'#8a9ac8', y:'#9ad0ff', Y:'#e8f8ff'}, rows:ICON_ROWS.silverlantern.rows},
  whisperbow:  {pal:{B:'#b0a0d0', b:'#6a5a90', w:'#e8e0ff'}, rows:ICON_ROWS.bow.rows},
  ashcrown:    {pal:{L:'#5a5a62', l:'#9a9aa6', d:'#2a2a30', s:'#e0e0e8'}, rows:ICON_ROWS.helmet.rows},
  trackercrossbow:{pal:{b:'#5a3a1a', B:'#c8883a', w:'#e8e0c8', s:'#ffd84a'}, rows:ICON_ROWS.crossbow.rows},
  bisonhide:   {pal:{L:'#6a4a2a', l:'#a07a4a', d:'#2a1a0a', s:'#e8d8b0'}, rows:ICON_ROWS.chestarmor.rows},
  skullaxe:    {pal:{s:'#f0e8d8', M:'#c8c0b0', m:'#6a1a1a', b:'#3a1a1a', B:'#7a1a1a'}, rows:ICON_ROWS.greataxe.rows},
  trophybelt:  {pal:{B:'#7a4a2a', Y:'#ffd23a', W:'#fff0a0'}, rows:["............", "............", "kkkkkkkkkkkk", "kBBBBBBBBBBk", "kBBkYYYYkBBk", "kBBkYWWYkBBk", "kBBkYYYYkBBk", "kBBBBBBBBBBk", "kkkkkkkkkkkk"]},
  chiefhammer: {pal:{M:'#7a1c1c', m:'#3a0e0e', s:'#ffd040', b:'#3a2618', B:'#5a3d26'}, rows:ICON_ROWS.mace.rows},
  blackmail:   {pal:{L:'#2a2c34', l:'#5a5e6a', d:'#101216', s:'#c02828'}, rows:ICON_ROWS.chestarmor.rows},
  currentsword:{pal:{w:'#e8f8ff', s:'#4aa8d8', r:'#7ac8f0', g:'#c8962e', b:'#2a3a5a'}, rows:ICON_ROWS.sword.rows},
  riverpearl:  {pal:{W:'#f4f8ff', w:'#ffffff', B:'#8ab0d8'}, rows:["....kkkk....", "...kWWWWk...", "..kWwwWWWk..", ".kWwWWWWWWk.", ".kWWWWWwWWk.", ".kWWWWWWWBk.", "..kWWWWBBk..", "...kBBBBk...", "....kkkk...."]},
  moonbow:     {pal:{B:'#a8e8c8', b:'#3a7a5a', w:'#f0fff0'}, rows:ICON_ROWS.bow.rows},
  rootgloves:  {pal:{L:'#4a6a2a', d:'#1c2a10', s:'#a8d870'}, rows:ICON_ROWS.gloves.rows},
  kingpick:    {pal:{s:'#ffe08a', M:'#c8962e', m:'#6a4a10', b:'#3a2618', B:'#7a5636'}, rows:ICON_ROWS.axe.rows},
  minerhelm:   {pal:{L:'#c8962e', l:'#ffd84a', d:'#6a4a10', s:'#fffbd0'}, rows:ICON_ROWS.helmet.rows},
});
for(const k of EXCL_IDS){ const d = ICON_ROWS[k]; ICONS[k] = bakeRows(d.rows, Object.assign({k:OUT}, d.pal)); }
const EX = (id, map, o) => { ITEMS[id] = Object.assign({icon:id, legend:true, legendExcl:true, only:map, value:260, gear:true, unique:true}, o); };
EX('slimemace', 'village', {name:'Maza de Gelatina Viva', slot:'weapon', kind:'mace', dur:130, dmg:[22,30],
  desc:'Objeto legendario del pueblo abandonado. Pegajosa: sus golpes ralentizan 2 s y el 25 % deja un charco de baba que ralentiza a los enemigos.'});
EX('slimeheart', 'village', {name:'Corazón de Slime', slot:'talisman', gear:false, unique:false, fixed:[{k:'hp', v:30}],
  desc:'Objeto legendario del pueblo abandonado. Gelatina: cada 20 s te cubre con un escudo que absorbe 30 de daño.'});
EX('gravespade', 'cemetery', {name:'Pala del Sepulturero', slot:'weapon', kind:'mace', dur:130, dmg:[28,38],
  desc:'Objeto legendario del cementerio. Exhumar: al matar a un enemigo, 15 % de alzar un esqueleto aliado durante 10 s.'});
EX('funerallamp', 'cemetery', {name:'Farolillo de la Vigilia Funeraria', slot:'lantern', gear:false, unique:false, oilMax:160,
  desc:'Objeto legendario del cementerio. Guarda hasta 160 de aceite. Luz sagrada: los no-muertos dentro de la luz reciben +25 % de daño.'});
EX('whisperbow', 'crypt', {name:'Arco del Susurro', slot:'weapon', kind:'bow', dur:110, dmg:[20,28],
  desc:'Objeto legendario de la cripta. Usa flechas. Susurro: las flechas atraviesan a un enemigo y el 20 % atraviesa a todos.'});
EX('ashcrown', 'crypt', {name:'Corona de Ceniza', slot:'head', armor:2, ov:'legcrown', fixed:[{k:'hp', v:25}],
  desc:'Objeto legendario de la cripta. Maldición: quien te golpea queda debilitado 3 s (hace un 40 % menos de daño).'});
EX('trackercrossbow', 'plains', {name:'Ballesta del Rastreador', slot:'weapon', kind:'crossbow', dur:110, dmg:[38,52],
  desc:'Objeto legendario de las planicies. Usa flechas. Presa marcada: cada disparo marca al enemigo 5 s (recibe +25 % de daño de todos).'});
EX('bisonhide', 'plains', {name:'Piel de Bisonte', slot:'chest', armor:20, ov:'legbison', fixed:[{k:'hp', v:20}],
  desc:'Objeto legendario de las planicies. Embestida: tras correr 3 s, tu siguiente golpe empuja con fuerza y aturde.'});
EX('skullaxe', 'orccamp', {name:'Hacha Partecráneos', slot:'weapon', kind:'greataxe', twoHanded:true, dur:140, dmg:[44,60],
  desc:'Objeto legendario del campamento orco. A dos manos: no permite llevar escudo. Furia: con menos del 50 % de vida hace +30 % de daño.'});
EX('trophybelt', 'orccamp', {name:'Cinturón de Trofeos', slot:'talisman', gear:false, unique:false, fixed:[{k:'hp', v:15}],
  desc:'Objeto legendario del campamento orco. Trofeos: cada enemigo muerto da +1 % de daño, hasta +20 % por incursión.'});
EX('chiefhammer', 'castle', {name:'Martillo del Gran Jefe', slot:'weapon', kind:'mace', dur:150, dmg:[42,56],
  desc:'Objeto legendario del castillo de Urr. Cataclismo: cada 5 golpes lanza una onda de choque que daña y aturde a los enemigos cercanos.'});
EX('blackmail', 'castle', {name:'Cota de Hierro Negro', slot:'chest', armor:18, ov:'legblack', fixed:[{k:'thorns', v:6}],
  desc:'Objeto legendario del castillo de Urr. Espinas de hierro: devuelve 6 de daño a quien te golpea y las quemaduras te hacen la mitad de daño.'});
EX('currentsword', 'river', {name:'Espada Corriente', slot:'weapon', kind:'sword', dur:130, dmg:[36,48],
  desc:'Objeto legendario del río travieso. Torrente: sus golpes empujan con fuerza y el 20 % crea un remolino que arrastra a los enemigos.'});
EX('riverpearl', 'river', {name:'Perla del Río', slot:'talisman', gear:false, unique:false, fixed:[{k:'hp', v:25}],
  desc:'Objeto legendario del río travieso. Marea: el 15 % de los golpes que recibes se anulan.'});
EX('moonbow', 'forest', {name:'Arco de Luna Élfica', slot:'weapon', kind:'bow', dur:110, dmg:[26,36], crit:10,
  desc:'Objeto legendario del bosque élfico. Usa flechas. Flechas buscadoras: las flechas giran hacia el enemigo más cercano.'});
EX('rootgloves', 'forest', {name:'Guantes de Raíces', slot:'hands', armor:3, ov:'legroot', fixed:[{k:'crit', v:6}],
  desc:'Objeto legendario del bosque élfico. Raíces: cada 10 s inmoviliza 2 s a los enemigos cercanos.'});
EX('kingpick', 'mine', {name:'Pico del Rey Enano', slot:'weapon', kind:'axe', dur:140, dmg:[34,46],
  desc:'Objeto legendario de la mina de los enanos. Veta rica: el 25 % de los monstruos suelta oro extra y las gemas son más probables.'});
EX('minerhelm', 'mine', {name:'Casco del Minero Luminoso', slot:'head', armor:2, ov:'legminer', fixed:[{k:'hp', v:25}],
  desc:'Objeto legendario de la mina de los enanos. Foco: el área de luz del farolillo aumenta un 30 % y los enemigos iluminados reciben +15 % de daño.'});
legendOv('legbison', 'chest', {L:'#6a4a2a', l:'#a07a4a', d:'#2a1a0a'});
legendOv('legblack', 'chest', {L:'#2a2c34', l:'#5a5e6a', d:'#101216'});
legendOv('legcrown', 'urrhelm', {L:'#5a5a62', l:'#d0d0dc', d:'#2a2a30'});
legendOv('legminer', 'helmet', {L:'#c8962e', l:'#ffd84a', d:'#6a4a10'});
legendOv('legroot', 'glove', {L:'#4a6a2a', l:'#7aa84a', d:'#1c2a10'});
legendOv('legrootBig', 'bigGlove', {L:'#4a6a2a', l:'#7aa84a', d:'#1c2a10'});

const UNDEAD_ART = ['skeleton', 'skelarcher', 'zombie', 'ghost', 'wraith', 'skelmage', 'necro', 'skelknight', 'countess'];
// multiplicador de daño cuerpo a cuerpo del héroe
function legendDmgMult(){ let k = 1; if(legendOn('skullaxe') && P.hp < P.maxHp*.5) k *= 1.3; if(legendOn('trophybelt')) k *= 1 + Math.min(20, P.trophy || 0)/100; return k; }
// daño recibido por un monstruo según la luz del héroe (farolillo funerario y casco minero)
function legendHitMod(m){
  const lt = G.inv.equip.lantern; let k = 1;
  const lit = P.lantern && (P.oil > 0 || G.sc.kind !== 'raid');
  if(lit && lt && lt.id === 'funerallamp' && UNDEAD_ART.includes(m.art) && Math.hypot(m.x-P.lx, m.y-P.ly) < 175) k *= 1.25;
  if(lit && legendOn('minerhelm') && Math.hypot(m.x-P.lx, m.y-P.ly) < 175*1.3) k *= 1.15;
  if(lit && lt && lt.id === 'dawnlantern' && Math.hypot(m.x-P.lx, m.y-P.ly) < 175*1.4) k *= 1.2;
  return k;
}
function legendArrow(w){
  const o = {pierce:0, homing:false, mark:false};
  if(!w) return o;
  if(w.id === 'whisperbow'){ o.pierce = Math.random() < .2 ? 99 : 1; }
  if(w.id === 'moonbow') o.homing = true;
  if(w.id === 'trackercrossbow') o.mark = true;
  return o;
}
function legendHome(pr, dt){
  let best = null, bd = 200;
  for(const m of G.mons){ if(m.dying) continue; const d = Math.hypot(m.x-pr.x, m.y-8-pr.y); if(d < bd){ bd = d; best = m; } }
  if(!best) return;
  const sp = Math.hypot(pr.vx, pr.vy) || 1, ta = Math.atan2(best.y-8-pr.y, best.x-pr.x); let a = Math.atan2(pr.vy, pr.vx), da = ta - a;
  while(da > Math.PI) da -= Math.PI*2;
  while(da < -Math.PI) da += Math.PI*2;
  a += clamp(da, -dt*5, dt*5); pr.vx = Math.cos(a)*sp; pr.vy = Math.sin(a)*sp; pr.ang = a;
}
function addPuddle(x, y){ if(!G.trail) G.trail = []; G.trail.push({x, y, t:4, r:26, slow:.6}); }
// golpes cuerpo a cuerpo de los exclusivos
function legendMelee2(w, m, fx2, out){
  const id = w && w.id;
  if(id === 'slimemace'){ fx2.slow = 2; if(Math.random() < .25) addPuddle(m.x, m.y); }
  if(id === 'chiefhammer'){ P.hamN = (P.hamN || 0) + 1; if(P.hamN % 5 === 0) out.quake = true; }
  if(id === 'currentsword'){ out.kMul = 2; if(Math.random() < .2) out.whirl = true; }
  if(legendOn('bisonhide') && P.chargeReady){ P.chargeReady = false; fx2.stun = .8; out.kMul = (out.kMul || 1)*2.5; addText(m.x, m.y-m.r*2-30, '¡Embestida!', '#ffd0a0', 7, -20); }
}
function legendAfterHit2(m, dmg, out){
  if(out.quake){
    ring(P.x, P.y-6, 80, '#ffb070', .45); G.shake = Math.max(G.shake, 6); sfx('boom'); addText(P.x, P.y-56, '¡Cataclismo!', '#ffd0a0', 8);
    for(const o of G.mons) if(!o.dying && Math.hypot(o.x-P.x, o.y-P.y) < 80) hitMonster(o, Math.round(dmg*.6), {src:'player', nx:(o.x-P.x)/80, ny:(o.y-P.y)/80, k:260, stun:1});
  }
  if(out.whirl) G.hazards.push({type:'whirl', x:m.x, y:m.y, r:70, life:2.2, max:2.2, tick:0, dmg:Math.round(dmg*.3)});
}
// al morir un monstruo: trofeos, esqueleto aliado y veta rica
function legendKill(m){
  if(legendOn('lightstaff')) legendLightBurst(m);
  if(legendOn('trophybelt')) P.trophy = Math.min(20, (P.trophy || 0) + 1);
  if(legendOn('gravespade') && Math.random() < .15){
    const mine = G.allies.filter(a => a.owner === 'spade'); if(mine.length >= 3) mine[0].life = 0;
    G.allies.push({x:m.x, y:m.y, life:10, cd:.6, face:1, walk:0, owner:'spade', r:8});
    burst(m.x, m.y-8, 14, ['#7af07a', '#c8ffc8', '#1a6a1a'], [30,110], [.4,.8], -50); ring(m.x, m.y-6, 22, '#7af07a', .35); addText(m.x, m.y-30, 'Esqueleto aliado', '#a8ffa8', 6); sfx('summon');
  }
  if(legendOn('kingpick')){
    if(Math.random() < .25) dropGold(m.x, m.y, Math.round(randi(8, 24)*(1 + ((G.sc.lvl || 1)-1)*.3)));
    if(G.sc.id === 'mine' && typeof gemDrop === 'function' && Math.random() < .3) gemDrop(m);
  }
}
function updateLegends2(dt){
  if(P.dead) return;
  // embestida: correr 3 s deja el siguiente golpe cargado
  if(legendOn('bisonhide')){
    if(P.running) P.chargeAcc = (P.chargeAcc || 0) + dt;
    else { if((P.chargeAcc || 0) >= 3){ P.chargeReady = true; addText(P.x, P.y-56, '¡Embestida lista!', '#ffd0a0', 7); } P.chargeAcc = 0; }
  } else { P.chargeAcc = 0; P.chargeReady = false; }
  // gelatina: escudo de 30 cada 20 s
  if(legendOn('slimeheart')){ P.gelT = (P.gelT ?? 20) - dt; if(P.gelT <= 0){ P.gelT = 20; P.gelShield = 30; addText(P.x, P.y-56, 'Gelatina', '#9affb0', 7); ring(P.x, P.y-10, 30, '#4ad85a', .4); } }
  else { P.gelT = undefined; if(!legendOn('pilgrimmedal')) P.gelShield = 0; }
  // raíces: cada 10 s inmoviliza a los cercanos
  if(legendOn('rootgloves')){
    P.rootN = (P.rootN ?? 10) - dt;
    if(P.rootN <= 0){
      P.rootN = 10; let n = 0;
      for(const m of G.mons) if(!m.dying && Math.hypot(m.x-P.x, m.y-P.y) < 130 && !MONSTERS[m.type].boss){ m.stunT = Math.max(m.stunT, 2); n++; burst(m.x, m.y-4, 10, ['#4a6a2a', '#7aa84a', '#a8d870'], [20, 80], [.4, .8], 20); }
      if(n) addText(P.x, P.y-56, '¡Raíces!', '#a8d870', 8);
      ring(P.x, P.y-6, 130, '#7aa84a', .4);
    }
  } else P.rootN = undefined;
}
// botín exclusivo: la mitad de probabilidad que los legendarios generales
function legendExclPick(){ const l = EXCL_LEGENDS[G.sc.id]; return l ? pick(l) : null; }
function legendExclDrop(m){
  const ch = {normal:.0003, magic:.001, rare:.003}[m.rarity] || 0, id = Math.random() < ch ? legendExclPick() : null;
  if(id){ dropItem(m.x, m.y, mkItem(id, 1, G.sc.lvl || 1)); addText(m.x, m.y-m.r*2-40, '¡Objeto legendario!', '#ff9a3c', 8, -20); sfx('levelup'); }
}
function legendExclChest(c){
  const id = Math.random() < (c.rare ? .006 : .0015) ? legendExclPick() : null;
  if(id){ dropItem(c.x, c.y+4, mkItem(id, 1, G.sc.lvl || 1)); addText(c.x, c.y-30, '¡Objeto legendario!', '#ff9a3c', 8, -20); sfx('levelup'); }
}

// ---------- legendarios del templo sagrado (exp. 9): 2 exclusivos y el general de nivel 9 ----------
Object.assign(ICON_ROWS, {
  lightstaff:  {pal:{B:'#fffbd0', b:'#ffe070', d:'#a08a30'}, rows:ICON_ROWS.stick.rows},
  pilgrimmedal:{pal:{Y:'#c8e8ff', y:'#7ab0e8', W:'#ffffff'}, rows:ICON_ROWS.dawntear.rows},
  dawnlantern: {pal:{b:'#fff0c0', y:'#ffe070', Y:'#ffffff'}, rows:ICON_ROWS.silverlantern.rows},
});
for(const k of ['lightstaff', 'pilgrimmedal', 'dawnlantern']){ const d = ICON_ROWS[k]; ICONS[k] = bakeRows(d.rows, Object.assign({k:OUT}, d.pal)); }
EX('lightstaff', 'temple', {name:'Báculo de la Luz Eterna', slot:'weapon', kind:'stick', dur:140, dmg:[40, 54],
  desc:'Objeto legendario del templo sagrado. Luz eterna: al matar a un enemigo, explota en luz sagrada (60 % de daño en área) y te cura 5 de vida.'});
EX('pilgrimmedal', 'temple', {name:'Medallón del Peregrino', slot:'talisman', gear:false, unique:false, fixed:[{k:'hp', v:40}, {k:'hpreg', v:1.5}],
  desc:'Objeto legendario del templo sagrado. Bendición: cada 40 s te cubre con un escudo sagrado que absorbe 60 de daño.'});
ITEMS.dawnlantern = {name:'Farolillo del Alba Eterna', icon:'dawnlantern', slot:'lantern', legend:true, lvl:9, oilMax:200, value:250,
  desc:'Objeto legendario. Guarda hasta 200 de aceite, regenera 1 de aceite por segundo mientras está encendido y su luz es un 40 % mayor. Alba: los enemigos dentro de la luz reciben +20 % de daño.'};
LEGEND_IDS.push('dawnlantern');
EXCL_LEGENDS.temple = ['lightstaff', 'pilgrimmedal']; EXCL_IDS.push('lightstaff', 'pilgrimmedal');
let LIGHT_BUSY = false;
function updateLegends3(dt){
  if(P.dead) return;
  if(legendOn('pilgrimmedal')){ P.blessT = (P.blessT ?? 40) - dt; if(P.blessT <= 0){ P.blessT = 40; P.gelShield = Math.max(P.gelShield || 0, 60); addText(P.x, P.y-56, 'Bendición', '#c8e8ff', 8); ring(P.x, P.y-10, 34, '#c8e8ff', .4); } } else P.blessT = undefined;
  const lt = G.inv.equip.lantern;
  if(lt && lt.id === 'dawnlantern' && P.lantern && G.sc.kind === 'raid') P.oil = Math.min(oilMax(), P.oil + dt);
}
function legendLightBurst(m){
  if(LIGHT_BUSY) return; LIGHT_BUSY = true;
  const w = curWeapon(), dm = (w && weaponDmg(w)) || [40, 54], dmg = Math.round((dm[0] + dm[1])/2 * .6);
  ring(m.x, m.y-8, 70, '#fff0a0', .4); burst(m.x, m.y-10, 20, ['#fff0a0', '#ffffff', '#ffe070'], [60, 200], [.3, .7], -20); sfx('alba');
  P.hp = Math.min(P.maxHp, P.hp + 5); addText(P.x, P.y-46, '+5', '#7ad86a', 7);
  for(const o of G.mons) if(o !== m && !o.dying && Math.hypot(o.x-m.x, o.y-m.y) < 70) hitMonster(o, dmg, {src:'player', nx:(o.x-m.x)/70, ny:(o.y-m.y)/70, k:140});
  LIGHT_BUSY = false;
}
