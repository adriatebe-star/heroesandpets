'use strict';
// =====================================================================
//  Cofre legendario (cualquier expedición) y hueso para mascotas (expedición 5 en adelante)
// =====================================================================

// ---------- cofre legendario: naranja y dorado ----------
function bakeLegendChest(open){   // 1,45 veces más grande que un cofre normal
  const wd = ['#4a1808', '#7a2a0c', '#b24a14'], bd = ['#a06a14', '#e8a830', '#fff2a0'], s = v => Math.round(v*1.45);
  const R = (x, y, w, h, c, o) => Object.assign({r:[s(x), s(y), s(w), s(h)], c}, o);
  const sh = open ? [
    R(0, 0, 18, 5, wd, {L:-.25}), R(0, 5, 18, 9, wd, {tex:8}), R(1, 4, 16, 3, '#0a0806'), R(3, 0, 2, 14, bd), R(13, 0, 2, 14, bd),
  ] : [
    R(0, 5, 18, 9, wd, {tex:8}), R(0, 0, 18, 6, wd.slice(1).concat(['#ff9a3a']), {tex:9}), R(0, 5, 18, 1, wd[0]), R(3, 0, 2, 14, bd), R(13, 0, 2, 14, bd), R(8, 4, 3, 4, ['#a06a14', '#e8a830', '#fff2a0']),
  ];
  return SP(paintSprite(s(18), s(14), sh), s(9), s(13));
}
ART.chest.legend = [bakeLegendChest(false), bakeLegendChest(true)];
const LEGEND_CHEST_CHANCE = .3;   // probabilidad de que una incursión lleve un cofre legendario (menos que los cofres raros, que son varios)
// lo coloca en un punto alcanzable y lejos de la entrada
function addLegendChest(sc){
  const ST = 24, sx = sc.spawn.x, sy = sc.spawn.y, seen = new Set(['0,0']), q = [[0, 0]], cells = [];
  while(q.length){
    const [i, j] = q.pop(); cells.push([sx + i*ST, sy + j*ST]);
    for(const [di, dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const a = i + di, b = j + dj, k = a + ',' + b; if(seen.has(k)) continue; seen.add(k); if(!blocked(sc, sx + a*ST, sy + b*ST, 14)) q.push([a, b]); }
  }
  for(let n = cells.length - 1; n > 0; n--){ const m = Math.floor(Math.random()*(n+1)); [cells[n], cells[m]] = [cells[m], cells[n]]; }
  for(const dEntry of [300, 180, 90]) for(const [x, y] of cells){
    if(Math.hypot(x - sx, y - sy) < dEntry) continue;
    if(sc.portals.some(o => Math.hypot(o.x - x, o.y - y) < 90) || sc.chests.some(o => Math.hypot(o.x - x, o.y - y) < 60) || sc.cages.some(o => Math.hypot(o.x - x, o.y - y) < 60)) continue;
    const ch = {x:Math.round(x), y:Math.round(y), rare:true, legend:true, open:false};
    ch.col = addCollider(sc, {t:'r', x:ch.x - 13, y:ch.y - 11, w:26, h:11}); sc.chests.push(ch);
    sc.lights.push({x:ch.x, y:ch.y - 12, r:135, a:.95, warm:true, flick:.12});   // brilla en la oscuridad
    return ch;
  }
  return null;
}
// contenido: mucho botín raro, bastantes consumibles y más posibilidades de legendarios (sobre todo los exclusivos de la expedición)
function openLegendChest(c){
  const lvl = G.sc.lvl || 1, goldMult = (hasPetAffix('buscatesoros') ? 1.15 : 1) * (1 + (G.stats ? G.stats.gold : 0)/100) * (1 + (lvl-1)*.35);
  dropGold(c.x, c.y+4, Math.round(randi(150, 260)*goldMult));
  const gear = lootFor(LOOT.monsterTable, lvl).filter(o => ITEMS[o.id].gear);
  for(let i = 0, n = randi(3, 4); i < n; i++) dropItem(c.x, c.y+4, mkGear(wpick(gear).id, 'rare', lvl));   // objetos raros garantizados
  const tab = lootFor(LOOT.chestRare.table, lvl).filter(o => o.id !== 'gold');
  for(let i = 0; i < 2; i++){ const e = wpick(tab); dropItem(c.x, c.y+4, mkItem(e.id, e.n ? randi(e.n[0], e.n[1]) : 1, lvl, 1.2)); }
  const cons = shuffle([{id:'potion', n:[2,4]}, {id:'bandage', n:[3,5]}, {id:'oil', n:[2,4]}, {id:'cookie', n:[2,3]}, {id:'mushroom', n:[1,3]}, {id:'arrows', n:[15,30], lvl:2}, {id:'firearrows', n:[8,16], lvl:3},
    {id:'superpotion', n:[1,3], lvl:5}, {id:'petbone', n:[1,2], lvl:5}, {id:'explosivearrows', n:[6,12], lvl:6}].filter(o => (o.lvl || 1) <= lvl));
  for(const e of cons.slice(0, 7)) dropItem(c.x, c.y+4, mkItem(e.id, randi(e.n[0], e.n[1]), lvl));
  for(let i = 0, n = randi(1, 2); i < n; i++) dropItem(c.x, c.y+4, mkItem('treasure'));
  const ex = Math.random() < .35 ? legendExclPick() : null;   // legendario exclusivo de esta expedición
  if(ex){ dropItem(c.x, c.y+4, mkItem(ex, 1, lvl)); addText(c.x, c.y-30, '¡Objeto legendario!', '#ff9a3c', 8, -20); sfx('levelup'); }
  const gl = Math.random() < .12 ? legendPick(lvl) : null;    // legendario general
  if(gl){ dropItem(c.x, c.y+4, mkItem(gl, 1, lvl)); addText(c.x, c.y-44, '¡Objeto legendario!', '#ff9a3c', 8, -20); sfx('levelup'); }
  burst(c.x, c.y-8, 34, ['#ff9a3a', '#ffe08a', '#ffffff'], [50, 170], [.3, .8]); ring(c.x, c.y-8, 40, '#ffb347', .5); G.shake = Math.max(G.shake, 4);
}

// ---------- hueso para mascotas: 1 minuto de +5 de armadura y 5 de vida por segundo para tus mascotas ----------
Object.assign(ICON_ROWS, {
  petbone: {pal:{W:'#f0e8d4', w:'#ffffff', d:'#b8a888'}, rows:["............", "............", ".kk......kk.", "kWWkkkkkkWWk", "kWwWWWWWWdWk", "kWWWWWWWWddk", "kWWkkkkkkWWk", ".kk......kk.", "............", "............", "............", "............"]},
});
{ const d = ICON_ROWS.petbone; ICONS.petbone = bakeRows(d.rows, Object.assign({k:OUT}, d.pal)); }
ITEMS.petbone = {name:'Hueso para mascota', icon:'petbone', stack:100, use:'bone', value:60, rar:'pink',
  desc:'Tiene su propio hueco en el cinturón. Durante 1 minuto tus mascotas ganan +5 de armadura y regeneran 5 de vida por segundo.'};
QUICK_SLOTS.bone = ['petbone']; QUICK_LABEL.bone = 'Hueso para mascota'; QUICK_HINT.bone = 'hueso';   // (la clave del hueco no puede empezar por «pet»: getRef lo confundiría con los huecos de mascota)
ACTIONS.petbone = {name:'Dar un hueso a las mascotas', trigger:true, item:['petbone']};
TRIGGER_ACTIONS.push('petbone');
function eatBone(){
  P.boneT = 60; toast('¡Hueso para mascota! Tus mascotas ganan +5 de armadura y 5 de vida por segundo durante 1 minuto', 2.8); sfx('eat');
  for(const p of G.pets) burst(p.x, p.y-12, 10, ['#f0e8d4', '#ffffff', '#ffe08a'], [20, 70], [.4, .8], -50);
}
SHOP.push({id:'petbone', n:1, price:35, tier:5});
for(const T of [LOOT.chestNormal, LOOT.chestRare]){ const r = T === LOOT.chestRare; T.table.push({w:r ? 6 : 3, id:'petbone', n:[1,2], lvl:5}); }
LOOT.monsterTable.push({w:5, id:'petbone', lvl:5});
