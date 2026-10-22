'use strict';
// =====================================================================
//  Expedición 7 · El río travieso: objetos élficos, monstruos y mapa lineal junto al río
// =====================================================================

// ---------- objetos élficos (solo caen de los elfos oscuros o de cofres con poca probabilidad; Trapis no los vende) ----------
Object.assign(ICON_ROWS, {
  elfbow:    {pal:{B:'#7ad8a0', b:'#3a8a64', w:'#f4fff8'}, rows:ICON_ROWS.bow.rows},
  elfsword:  {pal:{w:'#f4fff8', s:'#8ad8b0', r:'#c8f0d8', g:'#e8d070', b:'#3a5a48'}, rows:ICON_ROWS.sword.rows},
  elfmail:   {pal:{L:'#6a8a7a', l:'#a8c8b8', d:'#2e4a3e', s:'#e8d070'}, rows:ICON_ROWS.chestarmor.rows},
  elfpotion: {pal:{w:'#d8e4ea', d:'#7a5636', R:'#b8ffd0', r:'#3ad88a', q:'#10724a'}, rows:ICON_ROWS.potion.rows},
});
for(const k of ['elfbow', 'elfsword', 'elfmail', 'elfpotion']){ const d = ICON_ROWS[k]; ICONS[k] = bakeRows(d.rows, Object.assign({k:OUT}, d.pal)); }
Object.assign(ITEMS, {
  elfbow:   {name:'Arco élfico', icon:'elfbow', slot:'weapon', kind:'bow', gear:true, dur:90, dmg:[22,32], crit:15, value:130,
             desc:'Arco élfico: mucho más daño y +15 % de probabilidad de crítico. Usa flechas. Solo lo llevan los elfos oscuros.'},
  elfsword: {name:'Espada élfica', icon:'elfsword', slot:'weapon', kind:'sword', gear:true, dur:110, dmg:[34,46], crit:15, value:130,
             desc:'Espada élfica: más daño y +15 % de probabilidad de crítico. Solo la llevan los elfos oscuros.'},
  elfmail:  {name:'Cota de malla élfica', icon:'elfmail', slot:'chest', gear:true, armor:12, value:120,
             desc:'Armadura ligera y resistente: mucha más protección que el cuero. Solo la llevan los elfos oscuros.'},
  elfpotion:{name:'Poción élfica', icon:'elfpotion', stack:100, use:'elf', value:60,
             desc:'Durante 1 minuto no gastas estamina (atacar, correr, saltar y cubrirte son gratis). Asígnala a una tecla de la barra de acciones.'},
});
ACTIONS.elfpotion = {name:'Beber poción élfica', trigger:true, item:['elfpotion']};
TRIGGER_ACTIONS.push('elfpotion');   // (TRIGGER_ACTIONS ya estaba calculado cuando se añadió la acción)
// armadura élfica en el héroe: misma silueta que la pechera de cuero, con malla verdosa
ARMOR_OV.elfmail = {ox:ARMOR_OV.chest.ox, oy:ARMOR_OV.chest.oy, rows:ARMOR_OV.chest.rows, img:{}};
for(const r in STUD) ARMOR_OV.elfmail.img[r] = bakeRows(ARMOR_OV.elfmail.rows, Object.assign({k:OUT, s:STUD[r], L:'#6a8a7a', l:'#a8c8b8', d:'#2e4a3e'}, r==='rare' ? {d:'#1e3a2e'} : {}));
// botín: solo en cofres (poca probabilidad) y de los elfos
for(const T of [LOOT.chestNormal, LOOT.chestRare]) T.table.push({w:T === LOOT.chestRare ? .9 : .35, id:'elfbow', lvl:7}, {w:T === LOOT.chestRare ? .9 : .35, id:'elfsword', lvl:7}, {w:T === LOOT.chestRare ? .9 : .35, id:'elfmail', lvl:7}, {w:T === LOOT.chestRare ? 2 : .8, id:'elfpotion', lvl:7});
function elfDrop(m){
  const rk = m.rarity === 'rare' ? 2 : m.rarity === 'magic' ? 1 : 0, bonus = {normal:0, magic:.5, rare:1.2}[m.rarity] || 0;
  // objetos élficos (poción, arco, espada, cota, farolillo): 5 / 11 / 22 % por muerte según la rareza (menos la parte que antes era de la llave)
  const ch = [.05, .11, .22][rk]*115/145;
  if(Math.random() < ch){
    const id = wpick([{w:36, id:'elfpotion'}, {w:21, id:'elfbow'}, {w:21, id:'elfsword'}, {w:22, id:'elfmail'}, {w:15, id:'elflantern'}]).id;
    dropItem(m.x, m.y, mkItem(id, 1, G.sc.lvl || 7, bonus)); addText(m.x, m.y-m.r*2-22, '¡Botín élfico!', '#9affc0', 7, -20);
  }
  // llave de la mina: tirada propia, triple que antes (≈ 3,1 / 6,9 / 13,6 % por muerte)
  if(Math.random() < [.031, .069, .137][rk]){ dropItem(m.x + rand(-8,8), m.y + rand(-4,4), mkItem('minekey', 1)); addText(m.x, m.y-m.r*2-34, '¡Llave de la mina!', '#ffe08a', 7, -20); }
}
// poción élfica: 1 minuto sin gastar estamina
function drinkElfPotion(){ P.elfT = 60; P.st = P.stMax; toast('¡Poción élfica! Durante 1 minuto no gastas estamina', 2.4); sfx('potion'); burst(P.x, P.y-20, 14, ['#3ad88a','#b8ffd0','#ffffff'], [30,90], [.4,.9], -60); }
// barras de tiempo de los efectos temporales (poción élfica y seta comestible), apiladas sobre el centro de la pantalla
function drawElfBuff(){
  const buffs = [];
  if(P.elfT > 0) buffs.push({t:P.elfT, name:'Poción élfica', col:'#3ad88a', bg:'#1e3a2e', fr:'#0c1a14', tx:'#e8fff0'});
  if(P.breadT > 0) buffs.push({t:P.breadT, name:'Pan élfico', col:'#e8c070', bg:'#3a2c14', fr:'#1a1408', tx:'#fff4d8'});
  if(P.weakT > 0) buffs.push({t:P.weakT, name:'Debilitado', col:'#d83a3a', bg:'#3a1414', fr:'#1a0808', tx:'#ffe0e0'});
  if(P.hallT > 0) buffs.push({t:P.hallT, name:'Seta alucinógena', col:'#b070ff', bg:'#2a1a4a', fr:'#12081e', tx:'#f0e0ff'});
  if(P.speedT > 0) buffs.push({t:P.speedT, name:'Seta comestible', col:'#ff8a3a', bg:'#3a1e0e', fr:'#1a0e06', tx:'#fff0e0'});
  buffs.forEach((bf, i) => {
    const w = 150, x = W/2 - w/2, y = H - 150 - i*24;
    ctx.globalAlpha = .9; ctx.fillStyle = bf.fr; ctx.fillRect(x-3, y-3, w+6, 20); ctx.fillStyle = bf.bg; ctx.fillRect(x, y, w, 14); ctx.fillStyle = bf.col; ctx.fillRect(x, y, w*Math.min(1, bf.t/60), 14); ctx.globalAlpha = 1;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `${5.5*S}px ${FONT}`; textO(`${bf.name} · ${Math.ceil(bf.t)} s`, W/2, y + 7, bf.tx);
  });
}

// ---------- monstruos ----------
Object.assign(MONSTERS, {
  rivercrab:  {name:'Cangrejo del río', art:'rivercrab', ai:'walk', hp:380, dmg:43, spd:84, r:10, xp:40, reach:12, prep:.35},
  rivertroll: {name:'Trol de río', art:'rivertroll', ai:'archer', hp:1200, dmg:83, spd:50, r:15, xp:125, reach:0, prep:.95, range:[130,230], rock:true},
  delfthief:  {name:'Elfo oscuro ladrón', art:'delfthief', ai:'archer', hp:320, dmg:31, spd:98, r:8, xp:65, reach:0, prep:.45, range:[80,150], dart:true, elf:true},
  delfarcher: {name:'Elfo oscuro arquero', art:'delfarcher', ai:'archer', hp:290, dmg:54, spd:76, r:8, xp:70, reach:0, prep:.6, range:[160,250], elf:true},
  hungrybear: {name:'Oso hambriento', art:'hungrybear', ai:'walk', hp:1120, dmg:87, spd:80, r:14, xp:115, reach:18, prep:.5, bleedHit:true},
});
Object.assign(RARE_PREFIX, {
  rivercrab:['Pinzas','Tenaza','Caparazón','Marisma'], rivertroll:['Pedrusco','Cantero','Cascada','Lodazal'],
  delfthief:['Sombra','Garfio','Cuchillada','Susurro'], delfarcher:['Ojo Negro','Flechaluna','Cazasombras','Veneno Lento'],
  hungrybear:['Devorador','Zarpa','Glotón','Destripador'],
});
Object.assign(MON_COLORS, {rivercrab:['#8a2a18','#e0603a','#ffd0a0'], rivertroll:['#6a8890','#8aa8b0','#d8e8ec'], delfthief:['#4a3a6a','#8c8aa8','#e0d8ff'],
  delfarcher:['#2e4a3e','#8c8aa8','#e0d8ff'], hungrybear:['#3a2418','#6a4630','#d8c8a0']});

// elfos oscuros y trol hechos con las capas del héroe
ORC_CFG.delfthief = {elf:true, skin:['#9a98b8','#6e6c90','#403e5a'], hair:['#eeeef6'], hood:['#1c1628','#2e2444','#0e0a16'], tunic:['#2e2444','#4a3a6a','#1c1628'], leg:['#1c1628','#2e2444'],
  weapon:'dagger', armor:'vest', cloak:true, cloak2:['#1c1628','#2e2444','#4a3a6a'], armW:3};
ORC_CFG.delfarcher = {elf:true, skin:['#9a98b8','#6e6c90','#403e5a'], hair:['#eeeef6'], hood:['#2a3a30','#3e5a48','#16241c'], tunic:['#2e4a3e','#4a7a62','#1c3028'], leg:['#1c3028','#2e4a3e'],
  weapon:'bow', armor:'vest', armW:3};
ORC_CFG.rivertroll = {skin:['#8aa8b0','#6a8890','#3e5860'], hair:['#3a5a2e'], hood:['#3a5a2e','#56803a','#24381a'], tunic:['#6a8890','#8aa8b0','#3e5860'], leg:['#3e5860','#56747c'],
  weapon:'rock', armor:'strap', armW:6, noPaint:true, scale:1.5};
const RIVER_KIND = {delfthief:['delfthief', .96], delfarcher:['delfarcher', .96], rivertroll:['rivertroll', 1.3]};
for(const id in RIVER_KIND){
  const [cfgId, k] = RIVER_KIND[id], c = ORC_CFG[cfgId];
  MON_SHAPES[id] = {w:Math.round(64*k), h:Math.round(56*k), ax:Math.round(24*k), ay:Math.round(54*k), canvas:f => oScaled(orcCanvas(f, c), k)};
}
// cangrejo del río y oso hambriento: pixel art por formas
Object.assign(MON_SHAPES, {
  rivercrab: {w:34, h:20, ax:17, ay:19, shapes(f){
    const sh=['#4a1208','#8a2a18','#b83e24','#e0603a'], dk='#1a0604', up = f===2 ? 3 : 0, lg = [0,1,-1][f];
    const legsL = []; for(let i=0;i<3;i++){ const x = 10 + i*6; legsL.push({l:[x, 12, x-5 + (i%2?lg:-lg), 18, 1.4], c:sh.slice(0,3)}, {l:[x+2, 12, x+7 + (i%2?-lg:lg), 18, 1.4], c:sh.slice(0,3)}); }
    return [ ...legsL,
      {l:[9,9,4,6-up,2.4], c:sh.slice(0,3)}, {poly:[[1,5-up],[5,1-up],[9,3-up],[7,8-up],[3,9-up]], c:sh, tex:210}, {l:[2,3-up,6,6-up,1], c:dk},
      {l:[25,9,30,6-up,2.4], c:sh.slice(0,3)}, {poly:[[25,3-up],[29,1-up],[33,5-up],[31,9-up],[27,8-up]], c:sh, tex:211}, {l:[28,3-up,31,6-up,1], c:dk},
      {e:[17,12,9,5.6], c:sh, tex:212}, {l:[14,7,13,3,1], c:sh.slice(1)}, {l:[20,7,21,3,1], c:sh.slice(1)},
      {p:[[13,2,'#10080a'],[13,3,'#f0e8d0'],[21,2,'#10080a'],[21,3,'#f0e8d0'],[14,10,sh[3]],[18,9,sh[3]],[21,11,sh[3]]]} ];
  }},
  hungrybear: {w:50, h:34, ax:23, ay:33, shapes(f){
    const fu=['#241408','#3a2418','#5a3a26','#7a5236'], dk='#0a0604', lg = f===2 ? 3 : 0;
    const L = legs(f,[13,28,15,30],23,34,fu.slice(0,3),'#0a0604',4);
    return [ {l:[8,15,2,22,2.4], c:fu.slice(0,2)}, ...L.far, {e:[20,19,15,9.5], c:fu, tex:220}, {e:[30,13,9,8.5], c:fu, tex:221},
      ...L.near, {e:[38+lg,17,6.4,6], c:fu, tex:222}, {poly:[[34+lg,10],[35+lg,6],[38+lg,9]], c:fu.slice(1)}, {poly:[[39+lg,9],[41+lg,6],[43+lg,10]], c:fu.slice(1)},
      {e:[43+lg,20,3.4,2.8], c:['#c8a888','#e8d0b0']}, {p:[[45+lg,19,'#100808'],[46+lg,19,'#100808']]},
      ...(f===2 ? [{r:[40+lg,22,6,3], c:'#5a0a0a'}, {p:[[41+lg,22,'#f4ecd8'],[44+lg,22,'#f4ecd8'],[42+lg,25,'#f4ecd8']]}] : [{l:[40+lg,22,45+lg,22,1], c:'#0a0604'}]),
      {p:[[39+lg,15,'#ffd040'],[40+lg,15,'#ffd040'],[42+lg,15,'#ffd040'],[41+lg,15,'#1a0a00']]},
      {p:[[44+lg,24,'#d8d0b8'],[44+lg,25,'#d8d0b8']]},   // baba y colmillo
      {p:[[16,9,fu[3]],[21,8,fu[3]],[26,9,fu[3]],[30,6,fu[3]],[12,13,fu[3]]]} ];
  }},
});
for(const id of ['rivercrab','rivertroll','delfthief','delfarcher','hungrybear']){
  const dd = MON_SHAPES[id];
  MON_ART[id] = {fr:[0,1,2].map(f => SP(dd.canvas ? dd.canvas(f) : paintSprite(dd.w, dd.h, dd.shapes(f)), dd.ax, dd.ay))};
  MON_ART[id].flash = MON_ART[id].fr.map(s => {
    const c = document.createElement('canvas'); c.width = s.c.width; c.height = s.c.height;
    const g = c.getContext('2d'); g.drawImage(s.c,0,0); g.globalCompositeOperation='source-in'; g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height);
    return {c, ax:s.ax, ay:s.ay};
  });
}

// ---------- mapa: una franja larga junto al río, en zona rocosa ----------
const RV_GRAVEL = ['#2c2e32','#35383d','#40444a','#4c5057'].map(hex), RV_MOSS = ['#1e2a22','#27362b','#314436','#3c523f'].map(hex), RV_SAND = ['#4a4640','#58534b','#665f55'].map(hex);
const RV_WATER = ['#10263c','#183654','#204868','#2a5c80'].map(hex), RV_FOAM = hex('#9cc4d8'), RV_EDGE = hex('#2a3640');
function buildRiver(seed){
  const R = rng(seed), rr = (a,c) => a + R()*(c-a);
  const X0 = -560, X1 = 560, Y0 = -1750, Y1 = 1250;
  const sc = baseScene('river', 'El río travieso', X0, Y0, X1, Y1);
  sc.kind = 'raid'; sc.darkness = .94; sc.seed = seed; sc.lvl = 7;
  sc.spawn = {x:70, y:Y1-120};
  sc.horse = {x:26, y:Y1-100, dir:1};
  addCollider(sc, {t:'r', x:2, y:Y1-107, w:46, h:12});
  if(!G.save.aishHome){ const an = {id:'aish', name:'Aish', x:112, y:Y1-96, dir:-1}; sc.npcs.push(an); an.col = addCollider(sc, {t:'c', x:112, y:Y1-98, r:9}); sc.lights.push({x:112, y:Y1-112, r:140, a:.8, warm:true, flick:.05}); }   // el elfo de luz espera junto al caballo
  // el río serpentea por el oeste del mapa; las rocas y la orilla forman el pasillo por el que se avanza
  const rx = y => -330 + 95*Math.sin(y/360) + 38*Math.sin(y/140 + 1), hw = y => 62 + 14*Math.sin(y/220);
  for(let y = Y0; y < Y1; y += 14) addCollider(sc, {t:'r', x:rx(y) - hw(y), y, w:hw(y)*2, h:16});
  sc.ground = (x,y) => {
    if(x < X0 || x > X1 || y < Y0 || y > Y1) return RV_GRAVEL[0];
    const dr = Math.abs(x - rx(y)) + (vnoise(x/14,y/14,701)-.5)*8, w = hw(y);
    if(dr < w){
      if(dr > w - 2.5) return RV_FOAM;
      const flow = vnoise(x/11, y/3.4, 702)*.7 + hash(x,y,703)*.18;
      return RV_WATER[tq(flow - (w - dr)/w*.12, x, y, 4)];
    }
    if(dr < w + 5) return RV_EDGE;
    if(dr < w + 22) return RV_SAND[tq(vnoise(x/6,y/6,704)*.7 + hash(x,y,705)*.3, x, y, 3)];   // orilla húmeda
    const moss = vnoise(x/60,y/60,706)*.7 + vnoise(x/16,y/16,707)*.3;
    if(moss > .6 && dr < w + 140) return RV_MOSS[tq(vnoise(x/7,y/7,708)*.6 + hash(x,y,709)*.4, x, y, 4)];
    let t = tq((vnoise(x/17,y/17,710)*.55 + vnoise(x/5,y/5,711)*.3 + hash(x,y,712)*.15 - .2)/.6, x, y, 4);
    if(hash(x,y,713) > .985) t = 3; else if(hash(x,y-1,713) > .985) t = 0;
    return RV_GRAVEL[t];
  };
  const free = (x,y,r) => {
    if(x < X0+70 || x > X1-50 || y < Y0+60 || y > Y1-50) return false;
    if(Math.hypot(x-sc.spawn.x, y-sc.spawn.y) < 120 || Math.hypot(x-sc.horse.x, y-sc.horse.y) < 60) return false;
    if(Math.abs(x - rx(y)) < hw(y) + 30) return false;
    return !blocked(sc, x, y, r+6);
  };
  const point = (r, minSpawn=0, y0=Y0+80, y1=Y1-120) => {
    for(let i=0;i<200;i++){
      const x = Math.round(rr(X0+80, X1-70)), y = Math.round(rr(y0, y1));
      if(Math.hypot(x-sc.spawn.x, y-sc.spawn.y) < minSpawn) continue;
      if(free(x,y,r)) return {x, y};
    }
    return null;
  };
  const bankPoint = (y0, y1) => {   // junto al agua
    for(let i=0;i<120;i++){ const y = Math.round(rr(y0, y1)), x = Math.round(rx(y) + hw(y) + rr(32, 90)); if(free(x,y,12)) return {x, y}; }
    return null;
  };
  // campamentos de elfos oscuros abandonados a lo largo del recorrido
  const camps = [];
  for(let i=0;i<5;i++){
    const c = point(40, 300, Y0+200 + i*(Y1-Y0-500)/5, Y0+200 + (i+1)*(Y1-Y0-500)/5); if(!c) continue;
    camps.push(c);
    const cf = propSprite(sc, ART.campfire, c.x, c.y, {t:'c', x:c.x, y:c.y-3, r:9, low:true});
    cf.draw = function(){ drawSP(ART.campfire, c.x, c.y); drawFlames(c.x, c.y-6, .8); };
    sc.lights.push({x:c.x, y:c.y-8, r:150, a:.8, warm:true, flick:.12});
    for(const [dx,dy] of [[-34,-18],[30,-22]]) if(R() < .8) propSprite(sc, ART.tent, c.x+dx, c.y+dy, {t:'c', x:c.x+dx, y:c.y+dy-4, r:12}, [17,4]);
    for(let k=0;k<3;k++){ const x = c.x + rr(-44,44), y = c.y + rr(10,34); if(free(x,y,8)) propSprite(sc, R()<.5 ? ART.crate : ART.barrel, Math.round(x), Math.round(y), R()<.5 ? {t:'r', x:x-7, y:y-9, w:15, h:10, low:true} : {t:'c', x, y:y-2, r:6, low:true}, [7,2]); }
  }
  let sd = seed*13;
  for(let i=0;i<150;i++){ const p = point(12, 130); if(p) propRock(sc, p.x, p.y, ++sd); }          // zona rocosa: muchas rocas
  for(let i=0;i<22;i++){ const p = point(14, 130); if(p){ propRock(sc, p.x, p.y, ++sd); propRock(sc, p.x+rr(-18,18), p.y+rr(-12,12), ++sd); propRock(sc, p.x+rr(-18,18), p.y+rr(-12,12), ++sd); } }   // peñascos
  for(let i=0;i<26;i++){ const p = point(12, 140); if(p) propTree(sc, p.x, p.y, ++sd, true); }
  for(let i=0;i<30;i++){ const p = point(9, 120); if(p) propBush(sc, p.x, p.y, ++sd); }
  for(let i=0;i<30;i++){ const p = point(4, 200); if(p) propSprite(sc, i%3 ? ART.bones : ART.skullpile, p.x, p.y, {t:'c', x:p.x, y:p.y-2, r:5, low:true}); }
  // árboles y rocas del otro lado del río (decorado inalcanzable)
  for(let y = Y0+40; y < Y1-40; y += 60) if(R() < .7){ const x = rx(y) - hw(y) - rr(40, 150); if(x > X0+10) propTree(sc, Math.round(x), y, ++sd, R()<.4); }
  for(let i=0;i<1500;i++){
    const x = Math.round(rr(X0, X1)), y = Math.round(rr(Y0, Y1));
    if(Math.abs(x - rx(y)) < hw(y) + 4) continue;
    sc.decos.push({x, y, k: R()<.93 ? 'tuft' : 'flower', v: Math.floor(R()*3)});
  }
  sc.houses = []; sc.wisps = [];
  // jaulas (cuando existan las mascotas de esta expedición)
  const pets = shuffle(petsOfExp(7).filter(id => R() < CAGE_CHANCE[PETS[id].rarity]), R), cagePts = [];
  for(const id of pets){
    let p = null;
    for(let i=0; !p && i<80; i++){ const q = camps.length && i%2 ? {x:camps[i%camps.length].x + rr(-40,40), y:camps[i%camps.length].y + rr(30,60)} : point(14, 300); if(q && free(q.x, q.y, 14) && cagePts.every(c => Math.hypot(c.x-q.x, c.y-q.y) > 200)) p = q; }
    if(!p) continue;
    cagePts.push(p);
    const cage = {x:Math.round(p.x), y:Math.round(p.y), pet:null, open:false};
    cage.col = addCollider(sc, {t:'r', x:cage.x-12, y:cage.y-8, w:24, h:8});
    sc.cages.push(cage);
  }
  const addChest = (p, rare) => { if(!p) return; const ch = {x:p.x, y:p.y, rare, open:false}; ch.col = addCollider(sc, {t:'r', x:p.x-9, y:p.y-8, w:18, h:8}); sc.chests.push(ch); };
  for(const c of camps) addChest({x:Math.round(c.x + rr(-20,20)), y:Math.round(c.y + rr(20,34))}, R() < .3);
  for(let i=0;i<9;i++) addChest(point(10, 260), false);
  for(let i=0;i<3;i++) addChest(point(10, 700), true);
  for(const px of [-1, 1]){   // dos portales de salida al norte
    let p = null;
    for(let i=0;i<300 && !p;i++){ const x = Math.round(px < 0 ? rr(-120, 80) : rr(260, X1-100)), y = Math.round(rr(Y0+90, Y0+420)); if(free(x,y,22)) p = {x, y}; }
    if(p){ sc.portals.push({x:p.x, y:p.y, t:0}); sc.lights.push({x:p.x, y:p.y-8, r:120, a:.9, warm:false, flick:.1, col:'portal'}); }
  }
  // fauna y elfos: cangrejos en la orilla, trols en las rocas, elfos oscuros emboscados y osos hambrientos
  const rar = far => { const roll = R(); return roll < .03 + far*.06 ? 'rare' : roll < .2 + far*.16 ? 'magic' : 'normal'; };
  const mkPack = (types, n, p) => {
    const far = clamp((Y1 - p.y)/(Y1 - Y0), 0, 1), pack = []; let hasRare = false;
    for(let k=0;k<n;k++){ let r = rar(far); if(r==='rare' && hasRare) r = 'magic'; if(r==='rare') hasRare = true; pack.push({type:types[Math.floor(R()*types.length)], rarity:r}); }
    sc.monsterSpawns.push({x:p.x, y:p.y, pack});
  };
  for(let i=0;i<9;i++){ const p = bankPoint(Y0+200, Y1-300); if(p) mkPack(['rivercrab'], 3 + Math.floor(R()*3), p); }
  for(let i=0;i<7;i++){ const p = point(18, 420); if(p) mkPack(['rivertroll', 'rivertroll', 'rivercrab'], 1 + Math.floor(R()*2), p); }
  for(let i=0;i<8;i++){ const p = point(16, 420); if(p) mkPack(['delfthief', 'delfthief', 'delfarcher'], 2 + Math.floor(R()*2), p); }
  for(let i=0;i<7;i++){ const p = point(16, 420); if(p) mkPack(['delfarcher', 'delfarcher', 'delfthief'], 2 + Math.floor(R()*2), p); }
  for(let i=0;i<7;i++){ const p = point(18, 420); if(p) mkPack(['hungrybear'], 1 + Math.floor(R()*2), p); }
  for(const c of camps) sc.monsterSpawns.push({x:Math.round(c.x), y:Math.round(c.y + 60), pack:[{type:'delfthief', rarity: R()<.3 ? 'magic' : 'normal'}, {type:'delfarcher', rarity:'normal'}, {type:'delfthief', rarity:'normal'}]});
  return sc;
}

// ---------- mascotas del río travieso (arte) ----------
Object.assign(PET_SHAPES, {
  chapoteo: {w:28, h:18, ax:14, ay:17, shapes(f){
    const fur=['#3a2412','#5a3a20','#7a5232','#9a6e46'], belly=['#c8a888','#e8d0b0'];
    const L = legs(f,[9,16,11,18],12,18,fur.slice(0,3),belly[1]);
    return [ {l:[7,11,1,13,3.2], c:fur.slice(0,3)}, {l:[1,13,0,10,2], c:fur.slice(1)}, ...L.far, {e:[14,11,9,4.6], c:fur, tex:301}, {e:[15,13,6,1.8], c:belly}, ...L.near,
      {e:[22,5.5,1.5,1.5], c:fur}, {e:[23,8,4.8,4.2], c:fur}, {e:[27,10,2.6,1.9], c:belly},
      {p:[[24,7,EYE],[28,9,'#1a1010'],[26,12,'#5ac8ff'],[19,3,'#aee8ff'],[3,14,'#5ac8ff']]} ];
  }},
  croac: {w:22, h:16, ax:11, ay:15, shapes(f){
    const fr=['#1e4a1a','#2e7a2a','#4aa83e','#78d060'], lg = f===2 ? 2 : 0;
    return [ {poly:[[4,13],[2,10],[7,8],[9,13]], c:fr.slice(0,3)}, {e:[11,10,7.4,4.6], c:fr, tex:302}, {e:[13,12.5,4.5,1.6], c:['#d8e8b0','#f0f8d0']},
      {e:[8,3.6,2.2,2.2], c:fr}, {e:[16,3.6,2.2,2.2], c:fr}, {e:[17,8,4.6,3.8], c:fr},
      {l:[15,14,18+lg,15,1.6], c:fr.slice(0,3)}, {l:[7,14,5-lg,15,1.6], c:fr.slice(0,3)},
      {p:[[8,3,'#fff8d0'],[16,3,'#fff8d0'],[9,4,'#101010'],[17,4,'#101010'],[19,10,'#8a3a3a'],[20,10,'#8a3a3a'],[11,7,fr[3]],[13,8,fr[3]]]} ];
  }},
  palmeado: {w:18, h:16, ax:9, ay:15, shapes(f){
    const yl=['#a07818','#d8a82a','#f4cc48','#fff088'], sw = [0,1,-1][f];
    return [ {l:[7,13,6+sw,15,1.3], c:'#e87820'}, {l:[11,13,12-sw,15,1.3], c:'#e87820'}, {e:[9,9.5,6.4,5.2], c:yl, tex:303}, {e:[7,10,3.2,2.4], c:yl.slice(0,3)},
      {e:[13,4.5,3.8,3.6], c:yl}, {poly:[[16,4],[19,5],[16,6.5]], c:['#c85a10','#ff8a2a']}, {p:[[14,4,EYE],[3,10,yl[0]],[2,9,yl[0]]]} ];
  }},
  guijarro: {w:24, h:16, ax:12, ay:15, shapes(f){
    const sv=['#2a4a62','#4a7a9a','#7ab0cc','#b8e0ee'], t = [0,2,-2][f];
    return [ {poly:[[4,9],[0,4+t],[0,14+t],[5,10]], c:sv.slice(0,3)}, {poly:[[10,5],[13,1],[16,5]], c:sv.slice(0,3)}, {e:[13,9.5,9.4,4.6], c:sv, tex:304}, {e:[14,11.5,6,1.6], c:['#e8f4f8','#ffffff']},
      {poly:[[11,13],[9,16],[14,14]], c:sv.slice(0,3)}, {e:[19,8.5,3.2,2.8], c:sv}, {l:[19,10,22,10,1], c:'#1a2a3a'},
      {p:[[19,8,'#fff8d0'],[20,8,'#101010'],[9,8,sv[3]],[12,7,sv[3]],[15,7,sv[3]],[7,10,sv[3]]]} ];
  }},
  pinzas: {w:22, h:14, ax:11, ay:13, shapes(f){
    const sh=['#4a1208','#8a2a18','#b83e24','#e0603a'], up = f===2 ? 2 : 0, lg = [0,1,-1][f];
    const legsL = []; for(let i=0;i<3;i++){ const x = 8 + i*3.5; legsL.push({l:[x, 9, x-3 + (i%2?lg:-lg), 13, 1], c:sh.slice(0,3)}, {l:[x+2, 9, x+5 + (i%2?-lg:lg), 13, 1], c:sh.slice(0,3)}); }
    return [ ...legsL, {l:[6,7,3,4-up,1.6], c:sh.slice(0,3)}, {poly:[[0,4-up],[3,1-up],[6,3-up],[4,6-up],[1,6-up]], c:sh, tex:305},
      {l:[16,7,19,4-up,1.6], c:sh.slice(0,3)}, {poly:[[15,3-up],[18,1-up],[21,4-up],[19,6-up],[16,6-up]], c:sh, tex:306}, {e:[11,9,6.2,3.6], c:sh, tex:307},
      {p:[[9,4,'#10080a'],[9,5,'#f0e8d0'],[13,4,'#10080a'],[13,5,'#f0e8d0'],[11,8,sh[3]]]} ];
  }},
  dique: {w:30, h:22, ax:15, ay:21, shapes(f){
    const br=['#3a2210','#5e3a1c','#86562c','#a8743c'], lg = f===2 ? 2 : 0;
    const L = legs(f,[11,19,13,21],14,22,br.slice(0,3),'#2a1608',2.4);
    return [ {poly:[[6,14],[0,16],[1,21],[7,19]], c:['#2a1a10','#4a3220','#6a4a30']}, {p:[[2,17,'#8a6a4a'],[4,19,'#8a6a4a'],[3,15,'#8a6a4a']]}, ...L.far,
      {e:[14,13,10,6.4], c:br, tex:308}, {e:[16,16,6,2], c:['#c8a070','#e8c898']}, ...L.near,
      {e:[24+lg,9,5,4.6], c:br}, {poly:[[21+lg,5],[22+lg,2],[24+lg,5]], c:br.slice(1)}, {e:[28+lg,11,2.4,2], c:['#2a1a10','#4a3220']},
      {r:[26+lg,12,2,3], c:'#fff0c8'}, {p:[[25+lg,8,EYE],[29+lg,10,'#100808']]} ];
  }},
  zancuda: {w:30, h:26, ax:15, ay:25, fly:true, shapes(f){
    const gr=['#3a4658','#5a6a82','#8a9ab0','#c0cede'];
    const wing = f===1 ? {poly:[[13,11],[5,2],[2,6],[0,10],[11,14]], c:gr.slice(0,3)} : f===2 ? {poly:[[13,12],[5,21],[3,17],[1,14],[11,15]], c:gr.slice(0,3)} : {poly:[[13,11],[4,9],[1,13],[0,15],[11,15]], c:gr.slice(0,3)};
    return [ {poly:[[7,13],[0,15],[1,18],[8,16]], c:gr.slice(0,3)}, {e:[14,13,7,4.2], c:gr, tex:309}, {l:[18,11,20,6,2.2], c:gr}, {l:[20,6,19,3,2], c:gr},
      {e:[20,3,2.6,2.2], c:['#e8eef6','#ffffff']}, {l:[22,3,29,5,1.3], c:['#c8962e','#e8c050']}, wing,
      {l:[12,17,11,25,1], c:'#7a6a40'}, {l:[16,17,17,25,1], c:'#7a6a40'}, {p:[[21,2,'#101010'],[17,9,gr[3]],[13,10,gr[3]]]} ];
  }},
  limo: {w:30, h:14, ax:15, ay:13, shapes(f){
    const ol=['#1e2a14','#34481e','#4e6e2e','#6a9440'];
    const L = legs(f,[9,13,19,23],9,14,ol.slice(0,3),'#10180a',1.8);
    return [ {l:[7,8,1,10,3.4], c:ol.slice(0,3)}, {l:[1,10,0,12,2], c:ol.slice(1)}, ...L.far, {e:[15,8,11,3.8], c:ol, tex:310}, {e:[15,10,8,1.4], c:['#a8c868','#d0e890']}, ...L.near,
      {e:[26,7,3.8,3], c:ol}, {l:[28,8,29+(f===2?2:0),9,1], c:'#c84a4a'},
      {p:[[26,5,'#ffd040'],[27,5,'#101010'],[10,5,'#e8d040'],[15,4,'#e8d040'],[20,5,'#e8d040'],[6,7,'#e8d040'],[24,5,'#e8d040']]} ];
  }},
  corriente: {w:38, h:24, ax:19, ay:23, shapes(f){
    const fur=['#26323e','#3e5062','#5e788c','#86a4b8'], belly=['#d8e8f0','#ffffff'];
    const L = legs(f,[12,22,14,24],14,24,fur.slice(0,3),belly[0],3);
    return [ {l:[10,13,2,16,4.4], c:fur.slice(0,3)}, {l:[2,16,0,12,2.6], c:fur.slice(1)}, ...L.far, {e:[19,14,13,6.4], c:fur, tex:311}, {e:[20,17,8,2.2], c:belly}, ...L.near,
      {e:[29,6,1.8,1.8], c:fur}, {e:[30,9,5.6,4.8], c:fur}, {e:[35,11,3,2.2], c:belly},
      {p:[[31,8,EYE],[36,10,'#1a1010'],[33,13,'#5ac8ff'],[25,4,'#aee8ff'],[27,2,'#5ac8ff'],[20,8,fur[3]],[24,9,fur[3]],[15,10,fur[3]],[5,18,'#aee8ff'],[8,20,'#5ac8ff']]} ];
  }},
  martin: {w:22, h:18, ax:11, ay:17, fly:true, shapes(f){
    const bl=['#143a6a','#2a6ab0','#4aa0e0','#8ad4ff'], ox=['#c85a1a','#f08a3a'];
    const wing = f===1 ? {poly:[[10,7],[4,0],[2,4],[0,8],[9,11]], c:bl.slice(0,3)} : f===2 ? {poly:[[10,9],[4,16],[2,13],[0,10],[9,12]], c:bl.slice(0,3)} : {poly:[[10,8],[2,6],[0,10],[1,12],[9,12]], c:bl.slice(0,3)};
    return [ {poly:[[5,11],[0,13],[1,16],[6,13]], c:bl.slice(0,3)}, {e:[10,10,6.4,4], c:bl, tex:312}, {e:[11,12,4.6,2.2], c:ox}, {e:[15,6,3.6,3.4], c:bl}, {e:[15,8,2,1.4], c:['#e8f4f8','#ffffff']},
      {poly:[[17,6],[22,7],[17,8.4]], c:['#101820','#2a3038']}, wing, {p:[[16,5,'#fff8d0'],[16,6,'#101010'],[7,8,bl[3]],[10,7,bl[3]],[12,12,ox[1]],[9,13,ox[1]]]} ];
  }},
  leviatan: {w:42, h:32, ax:20, ay:31, shapes(f){
    const tl=['#0e3a4a','#1a6a7e','#2a9ab0','#5ad0e0'], pts = [];
    for(let i=0;i<14;i++){ const t = i/13, x = 4 + t*27, y = 25 - t*t*13 + Math.sin(i*.9 + f*1.3)*2, rr = 2.3 + t*2.1; pts.push({e:[x, y, rr+.6, rr], c:tl, tex:320+i}); }
    const hy = 25 - 13 + Math.sin(13*.9 + f*1.3)*2, op = f===2 ? 2 : 0;
    return [ ...pts, {e:[31,hy+4,4,1.6], c:['#c8f0f0','#f0ffff']},
      {poly:[[28,hy-3],[29,hy-9],[31,hy-4]], c:['#e8faff','#ffffff']}, {poly:[[31,hy-4],[34,hy-10],[35,hy-3]], c:['#e8faff','#ffffff']}, {poly:[[34,hy-3],[38,hy-8],[38,hy-2]], c:['#e8faff','#ffffff']},
      {e:[34,hy,5.4,3.8], c:tl, tex:340}, {e:[38+op,hy+1.5,3.6,2], c:tl.slice(1)}, {l:[36,hy+3+op,41,hy+3+op,1], c:'#f0ffff'},
      {poly:[[27,hy+2],[24,hy+7],[29,hy+5]], c:tl.slice(0,3)}, {poly:[[4,26],[0,22],[2,29]], c:tl.slice(0,3)},
      {p:[[34,hy-1,'#ffd040'],[35,hy-1,'#ffd040'],[35,hy,'#101010'],[39,hy,'#0a0a10'],[10,25,tl[3]],[16,22,tl[3]],[22,19,tl[3]],[3,24,'#5ac8ff'],[39,hy-6,'#aee8ff']]} ];
  }},
});
for(const id of ['chapoteo','croac','palmeado','guijarro','pinzas','dique','zancuda','limo','corriente','martin','leviatan']){
  const dd = PET_SHAPES[id];
  PET_ART[id] = {fly:!!dd.fly, glow:dd.glow, fr:[0,1,2].map(f => SP(paintSprite(dd.w, dd.h, dd.shapes(f)), dd.ax, dd.ay))};
  PET_ART[id].flash = PET_ART[id].fr.map(s => {
    const c = document.createElement('canvas'); c.width = s.c.width; c.height = s.c.height;
    const g = c.getContext('2d'); g.drawImage(s.c,0,0); g.globalCompositeOperation='source-in'; g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height);
    return {c, ax:s.ax, ay:s.ay};
  });
}
PET_ART.leviatan.glow = '#aee8ff';
