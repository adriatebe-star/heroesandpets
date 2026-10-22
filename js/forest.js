'use strict';
// =====================================================================
//  Expedición 8 · El bosque élfico (conectado al río travieso): elfos oscuros y animales poseídos
// =====================================================================

// lanza larga en el arte de los elfos (al atacar, estocada hacia delante)
ORC_CFG.delfspear = {elf:true, skin:['#9a98b8','#6e6c90','#403e5a'], hair:['#eeeef6'], hood:['#2a1c3a','#443060','#160e24'], tunic:['#3a2a52','#5a4a7a','#241838'], leg:['#241838','#3a2a52'],
  weapon:'spear', armor:'vest', armW:3};
{
  const k = .98, c = ORC_CFG.delfspear;
  MON_SHAPES.elfspear = {w:Math.round(64*k), h:Math.round(56*k), ax:Math.round(24*k), ay:Math.round(54*k), canvas:f => oScaled(orcCanvas(f, c), k)};
}

// ---------- monstruos ----------
Object.assign(MONSTERS, {
  felfarcher: {name:'Elfo oscuro arquero', art:'delfarcher', ai:'archer', hp:330, dmg:56, spd:78, r:8, xp:80, reach:0, prep:.6, range:[160,250], elf:true},
  felfthief:  {name:'Elfo oscuro ladrón', art:'delfthief', ai:'archer', hp:360, dmg:34, spd:100, r:8, xp:75, reach:0, prep:.45, range:[80,150], dart:true, elf:true},
  felfspear:  {name:'Guerrero élfico con lanza', art:'elfspear', ai:'walk', hp:480, dmg:64, spd:88, r:9, xp:95, reach:30, prep:.5, elf:true},
  fwolf:      {name:'Lobo poseído', art:'wolfp', ai:'walk', hp:330, dmg:50, spd:118, r:9, xp:70, reach:10, prep:.3, eye:[11,-15]},
  fspider:    {name:'Araña poseída', art:'forestspider', ai:'walk', hp:270, dmg:44, spd:112, r:9, xp:70, reach:10, prep:.3, poisonHit:true, eye:[14,-9]},
  fpanther:   {name:'Pantera poseída', art:'panther', ai:'walk', hp:400, dmg:62, spd:132, r:10, xp:90, reach:12, prep:.3, eye:[15,-11]},
});
Object.assign(RARE_PREFIX, {elfspear:['Lanza Negra','Estocada','Aguijón de Luna','Muro de Púas'], forestspider:['Tejedora','Viuda','Veneno Lento','Telaraña'], panther:['Sombra','Zarpa Negra','Acechador','Noche']});
Object.assign(MON_COLORS, {elfspear:['#3a2a52','#8c8aa8','#e0d8ff'], forestspider:['#2a1438','#6a4488','#ff1a1a'], panther:['#14121a','#3a3644','#ff1a1a']});
Object.assign(MON_SHAPES, {
  forestspider: {w:40, h:22, ax:20, ay:21, shapes(f){
    const sp=['#14081c','#2a1438','#46285c','#6a4488'], dk='#08040c', t = [0,1.5,-1.5][f];
    const legsL = []; const base = [[16,12],[19,12],[22,12],[25,12]];
    base.forEach(([x,y], i) => { const k = (i%2 ? t : -t); legsL.push({l:[x,y,x-2+k,y-6,1.5], c:sp.slice(0,3)}, {l:[x-2+k,y-6,x-6+k*.5,20,1.4], c:sp.slice(0,3)}, {l:[x,y,x+8+k,y-5,1.5], c:sp.slice(0,3)}, {l:[x+8+k,y-5,x+14+k*.5,20,1.4], c:sp.slice(0,3)}); });
    return [ ...legsL, {e:[12,11,9,6.6], c:sp, tex:610}, {e:[26,12,6,4.6], c:sp, tex:611}, {r:[10,7,5,2], c:['#a01818','#e03030']}, {r:[11,9,3,1], c:'#a01818'},
      {poly:[[31,13],[34,18],[32,13]], c:['#e8e0d0','#ffffff']}, {poly:[[29,14],[30,19],[28,14]], c:['#e8e0d0','#ffffff']},
      {p:[[28,9,'#ff1a1a'],[29,9,'#ff1a1a'],[30,10,'#ff1a1a'],[26,9,'#ff1a1a'],[8,8,sp[3]],[14,9,sp[3]]]} ];
  }},
  panther: {w:44, h:24, ax:20, ay:23, shapes(f){
    const bk=['#08070c','#14121a','#25222e','#3a3644'], lg = f===2 ? 2 : 0;
    const L = legs(f,[11,25,13,27],14,24,bk.slice(0,3),'#08070c',3);
    return [ {l:[8,12,2,10,2.6], c:bk.slice(0,3)}, {l:[2,10,0,5,2], c:bk.slice(1)}, ...L.far, {e:[18,13,13,6], c:bk, tex:620}, ...L.near,
      {e:[31+lg,10,5,4.4], c:bk}, {poly:[[28+lg,6],[29+lg,2],[32+lg,6]], c:bk.slice(1)}, {poly:[[33+lg,6],[35+lg,2],[36+lg,7]], c:bk.slice(1)},
      {e:[35+lg,12,2.6,2.2], c:bk.slice(1)}, {p:[[32+lg,9,'#ff1a1a'],[33+lg,9,'#ff1a1a'],[36+lg,13,'#e8d8d0'],[18,8,bk[3]],[24,8,bk[3]]]} ];
  }},
});
for(const id of ['elfspear', 'forestspider', 'panther']){
  const dd = MON_SHAPES[id];
  MON_ART[id] = {fr:[0,1,2].map(f => SP(dd.canvas ? dd.canvas(f) : paintSprite(dd.w, dd.h, dd.shapes(f)), dd.ax, dd.ay))};
  MON_ART[id].flash = MON_ART[id].fr.map(s => {
    const c = document.createElement('canvas'); c.width = s.c.width; c.height = s.c.height;
    const g = c.getContext('2d'); g.drawImage(s.c,0,0); g.globalCompositeOperation='source-in'; g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height);
    return {c, ax:s.ax, ay:s.ay};
  });
}

// ---------- mapa: bosque denso y oscuro con campamentos de elfos ----------
const FR_FLOOR = ['#121c16','#18241b','#1f2f22','#273a2a'].map(hex), FR_LEAF = ['#1a1e14','#232a1a','#2e3822','#3a4630'].map(hex), FR_DIRT = ['#2a2218','#33291c','#3d3222'].map(hex);
function buildForest(seed){
  const R = rng(seed), rr = (a,c) => a + R()*(c-a);
  const S = 1300, sc = baseScene('forest', 'El bosque élfico', -S, -S, S, S);
  sc.kind = 'raid'; sc.darkness = .95; sc.seed = seed; sc.lvl = 8;
  sc.spawn = {x:0, y:S-170};
  sc.horse = {x:-34, y:S-150, dir:1};
  addCollider(sc, {t:'r', x:-58, y:S-157, w:46, h:12});
  const trails = [], trail = (x0,y0,x1,y1,w) => trails.push({x0,y0,x1,y1,w});
  trail(0, S, -60, 200, 26); trail(-60, 200, 160, -300, 24); trail(160, -300, 0, -S+100, 26); trail(-S+120, 300, 520, 360, 20); trail(560, 380, S-120, -120, 20); trail(-700, -400, 160, -300, 20);
  const trailDist = (x,y) => { let best = 1e9; for(const r of trails){ const dx=r.x1-r.x0, dy=r.y1-r.y0, t=clamp(((x-r.x0)*dx+(y-r.y0)*dy)/(dx*dx+dy*dy),0,1); best = Math.min(best, Math.hypot(x-r.x0-dx*t, y-r.y0-dy*t) - r.w/2); } return best; };
  sc.ground = (x,y) => {
    if(Math.abs(x)>S || Math.abs(y)>S) return FR_FLOOR[0];
    const td = trailDist(x,y) + (vnoise(x/25,y/25,901)-.5)*14;
    if(td < 0){ if(td > -2) return FR_DIRT[0]; return FR_DIRT[tq(vnoise(x/6,y/6,902)*.6 + hash(x,y,903)*.4 - .1, x, y, 3)]; }
    if(vnoise(x/40,y/40,904) > .58 && hash(x,y,905) > .35) return FR_LEAF[tq(vnoise(x/8,y/8,906)*.6 + hash(x,y,907)*.4, x, y, 4)];   // hojarasca
    let t = tq((vnoise(x/18,y/18,908)*.55 + vnoise(x/5,y/5,909)*.3 + hash(x,y,910)*.15 - .2)/.6, x, y, 4);
    if(hash(x,y,911) > .988) t = 3; else if(hash(x,y-1,911) > .988) t = 0;
    return FR_FLOOR[t];
  };
  const free = (x,y,r) => {
    if(Math.abs(x) > S-60 || Math.abs(y) > S-60) return false;
    if(Math.hypot(x-sc.spawn.x, y-sc.spawn.y) < 110 || Math.hypot(x-sc.horse.x, y-sc.horse.y) < 50) return false;
    return !blocked(sc, x, y, r+6);
  };
  const point = (r, minSpawn=0, trailOk=false) => {
    for(let i=0;i<200;i++){
      const x = Math.round(rr(-S+80, S-80)), y = Math.round(rr(-S+80, S-80));
      if(Math.hypot(x-sc.spawn.x, y-sc.spawn.y) < minSpawn) continue;
      if(!trailOk && trailDist(x,y) < 16) continue;
      if(free(x,y,r)) return {x, y};
    }
    return null;
  };
  // campamentos élficos: hoguera, tiendas y cajas
  const camps = [];
  for(let i=0;i<6;i++){
    const c = point(40, 420); if(!c) continue;
    camps.push(c);
    const cf = propSprite(sc, ART.campfire, c.x, c.y, {t:'c', x:c.x, y:c.y-3, r:9, low:true});
    cf.draw = function(){ drawSP(ART.campfire, c.x, c.y); drawFlames(c.x, c.y-6, .8); };
    sc.lights.push({x:c.x, y:c.y-8, r:150, a:.85, warm:true, flick:.12});
    for(const [dx,dy] of [[-34,-18],[30,-22],[4,-42]]) if(R() < .75) propSprite(sc, ART.tent, c.x+dx, c.y+dy, {t:'c', x:c.x+dx, y:c.y+dy-4, r:12}, [17,4]);
    for(let k=0;k<3;k++){ const x = c.x + rr(-44,44), y = c.y + rr(10,34); if(free(x,y,8)) propSprite(sc, R()<.5 ? ART.crate : ART.barrel, Math.round(x), Math.round(y), R()<.5 ? {t:'r', x:x-7, y:y-9, w:15, h:10, low:true} : {t:'c', x, y:y-2, r:6, low:true}, [7,2]); }
  }
  let sd = seed*13;
  for(let i=0;i<260;i++){ const p = point(12, 130); if(p) propTree(sc, p.x, p.y, ++sd, false); }       // bosque denso
  for(let i=0;i<40;i++){ const p = point(12, 130); if(p) propTree(sc, p.x, p.y, ++sd, true); }
  for(let i=0;i<50;i++){ const p = point(9, 120); if(p) propBush(sc, p.x, p.y, ++sd); }
  for(let i=0;i<24;i++){ const p = point(12, 130); if(p) propRock(sc, p.x, p.y, ++sd); }
  for(let i=0;i<60;i++){ const p = point(4, 140, true); if(p) propGlowshroom(sc, p.x, p.y); }
  sc.wisps = []; for(let i=0;i<26;i++){ const p = point(4, 200, true); if(p) sc.wisps.push({x:p.x, y:p.y, hx:p.x, hy:p.y, ph:R()*6}); }
  for(let i=0;i<30;i++){ const p = point(4, 200, true); if(p) propSprite(sc, i%3 ? ART.bones : ART.skullpile, p.x, p.y, {t:'c', x:p.x, y:p.y-2, r:5, low:true}); }
  for(let i=0;i<1500;i++){ const x = Math.round(rr(-S, S)), y = Math.round(rr(-S, S)); if(trailDist(x,y) < 4) continue; sc.decos.push({x, y, k: R()<.9 ? 'tuft' : 'flower', v: Math.floor(R()*3)}); }
  sc.houses = [];
  // jaulas (cuando existan las mascotas de esta expedición)
  const pets = shuffle(petsOfExp('8b').filter(id => R() < CAGE_CHANCE[PETS[id].rarity]), R), cagePts = [];
  for(const id of pets){
    let p = null;
    for(let i=0; !p && i<80; i++){ const q = camps.length && i%2 ? {x:camps[i%camps.length].x + rr(-40,40), y:camps[i%camps.length].y + rr(30,60)} : point(14, 380); if(q && free(q.x, q.y, 14) && cagePts.every(c => Math.hypot(c.x-q.x, c.y-q.y) > 220)) p = q; }
    if(!p) continue;
    cagePts.push(p);
    const cage = {x:Math.round(p.x), y:Math.round(p.y), pet:null, open:false};
    cage.col = addCollider(sc, {t:'r', x:cage.x-12, y:cage.y-8, w:24, h:8});
    sc.cages.push(cage);
  }
  const addChest = (p, rare) => { if(!p) return; const ch = {x:p.x, y:p.y, rare, open:false}; ch.col = addCollider(sc, {t:'r', x:p.x-9, y:p.y-8, w:18, h:8}); sc.chests.push(ch); };
  for(const c of camps) addChest({x:Math.round(c.x + rr(-20,20)), y:Math.round(c.y + rr(20,34))}, R() < .3);
  for(let i=0;i<10;i++) addChest(point(10, 300), false);
  for(let i=0;i<3;i++) addChest(point(10, 900), true);
  for(const sx of [-1, 1]){
    let p = null;
    for(let i=0;i<300 && !p;i++){ const x = Math.round(sx*rr(500, S-120)), y = Math.round(rr(-S+120, -300)); if(free(x,y,22)) p = {x, y}; }
    if(p){ sc.portals.push({x:p.x, y:p.y, t:0}); sc.lights.push({x:p.x, y:p.y-8, r:120, a:.9, warm:false, flick:.1, col:'portal'}); }
  }
  // elfos oscuros emboscados y animales poseídos del bosque
  const rar = far => { const roll = R(); return roll < .035 + far*.07 ? 'rare' : roll < .2 + far*.18 ? 'magic' : 'normal'; };
  const mkPack = (types, n, p) => {
    const far = clamp(Math.hypot(p.x-sc.spawn.x, p.y-sc.spawn.y)/2300, 0, 1), pack = []; let hasRare = false;
    for(let k=0;k<n;k++){ let r = rar(far); if(r==='rare' && hasRare) r = 'magic'; if(r==='rare') hasRare = true; pack.push({type:types[Math.floor(R()*types.length)], rarity:r}); }
    sc.monsterSpawns.push({x:p.x, y:p.y, pack});
  };
  for(let i=0;i<8;i++){ const p = point(16, 420, true); if(p) mkPack(['felfarcher','felfarcher','felfthief'], 2 + Math.floor(R()*2), p); }
  for(let i=0;i<6;i++){ const p = point(16, 420, true); if(p) mkPack(['felfthief','felfthief','felfarcher'], 2 + Math.floor(R()*2), p); }
  for(let i=0;i<8;i++){ const p = point(16, 420, true); if(p) mkPack(['felfspear','felfspear','felfarcher'], 2 + Math.floor(R()*2), p); }
  for(let i=0;i<8;i++){ const p = point(16, 420, true); if(p) mkPack(['fwolf'], 3 + Math.floor(R()*2), p); }
  for(let i=0;i<7;i++){ const p = point(14, 420, true); if(p) mkPack(['fspider'], 3 + Math.floor(R()*3), p); }
  for(let i=0;i<7;i++){ const p = point(16, 420, true); if(p) mkPack(['fpanther'], 1 + Math.floor(R()*2), p); }
  for(const c of camps) sc.monsterSpawns.push({x:Math.round(c.x), y:Math.round(c.y + 70), pack:[{type:'felfspear', rarity: R()<.3 ? 'magic' : 'normal'}, {type:'felfarcher', rarity:'normal'}, {type:'felfthief', rarity:'normal'}]});
  return sc;
}

// ---------- mascotas del bosque élfico (arte) ----------
Object.assign(PET_SHAPES, {
  hojarasca: {w:24, h:16, ax:12, ay:15, shapes(f){
    const br=['#3a2a1a','#5e4428','#8a6a3e','#b0905a'], L = legs(f,[8,14,10,16],11,16,br.slice(0,3),'#3a2a1a',2.2), sp = [];
    for(let i=0;i<9;i++) sp.push({l:[5+i*1.7, 6, 3+i*1.7-1, 1+(i%2), 1], c:['#1a1208','#3a2a18']});
    return [ ...L.far, {e:[11,10,8,5.2], c:br, tex:701}, ...sp, ...L.near, {e:[19,11,3.6,3], c:['#c8a888','#e8d0b0']}, {e:[22,12,2,1.6], c:['#e8d0b0','#fff0d8']}, {p:[[19,9,EYE],[23,12,'#100808'],[10,7,br[3]]]} ];
  }},
  lucero: {w:20, h:18, ax:10, ay:17, fly:true, shapes(f){
    const wing = f===1 ? {poly:[[8,6],[3,0],[6,6],[8,9]], c:['#c8f0ff','#eafcff']} : {poly:[[8,7],[2,5],[5,9],[8,10]], c:['#c8f0ff','#eafcff']};
    return [ wing, {e:[9,11,4.4,3.4], c:['#2a2a1a','#4a4a28','#6a6a38']}, {e:[5,13,3.4,3.2], c:['#fff090','#ffe040','#ffffff']}, {e:[14,9,2.8,2.6], c:['#3a3a20','#5a5a30']},
      {l:[15,7,17,3,.8], c:'#3a3a20'}, {p:[[15,8,'#ff5a5a'],[3,13,'#ffffff'],[5,14,'#fffbd0']]} ];
  }},
  rocio: {w:28, h:22, ax:14, ay:21, shapes(f){
    const br=['#5a3a1c','#8a5a2c','#b88444','#d8a868'], L = legs(f,[9,19,11,21],13,22,br.slice(0,3),'#2a1808',2.2), lg = f===2 ? 2 : 0;
    return [ {l:[5,11,2,13,2], c:br.slice(0,3)}, ...L.far, {e:[13,13,9,5.4], c:br, tex:702}, {p:[[8,11,'#fff0d0'],[12,10,'#fff0d0'],[16,11,'#fff0d0'],[10,14,'#fff0d0'],[15,14,'#fff0d0']]}, ...L.near,
      {l:[19,9,23+lg,5,2.4], c:br}, {e:[24+lg,5,3.6,3.2], c:br}, {poly:[[22+lg,2],[23+lg,0],[25+lg,3]], c:br.slice(1)}, {l:[25+lg,2,27+lg,0,.8], c:'#e8e0c8'},
      {e:[27+lg,7,2.2,1.8], c:['#2a1808','#4a3018']}, {p:[[25+lg,5,EYE]]} ];
  }},
  vuelito: {w:24, h:16, ax:12, ay:15, fly:true, shapes(f){
    const gr=['#4a4a4e','#7a7a82','#a8a8b0','#d0d0d8'];
    const flap = f===1 ? [[0,3],[5,6]] : f===2 ? [[0,10],[5,9]] : [[0,6],[5,7]];
    return [ {poly:[[6,8],[flap[0][0],flap[0][1]],[flap[1][0],flap[1][1]+1],[8,11]], c:gr.slice(0,3)}, {poly:[[17,8],[24,flap[0][1]],[19,flap[1][1]+1],[15,11]], c:gr.slice(0,3)},
      {l:[7,11,2,13,3], c:gr.slice(1)}, {e:[12,10,5.4,3.6], c:gr, tex:703}, {e:[13,12,3.4,1.6], c:['#e8e8f0','#ffffff']}, {e:[18,8,3.2,3], c:gr}, {poly:[[17,5],[18,3],[19,5]], c:gr.slice(1)}, {poly:[[19,5],[21,3],[21,6]], c:gr.slice(1)},
      {p:[[19,8,EYE],[21,9,'#100808']]} ];
  }},
  setita: {w:20, h:20, ax:10, ay:19, shapes(f){
    const rd=['#6a1a1a','#a82a2a','#d04a4a','#f08080'], st=['#c8b890','#e8dcc0'], sw = [0,1,-1][f];
    return [ {l:[7,16,6+sw,19,1.6], c:'#a89a78'}, {l:[12,16,13-sw,19,1.6], c:'#a89a78'}, {e:[10,15,3.6,4], c:st}, {e:[10,7,9,6], c:rd, tex:704}, {p:[[6,5,'#fff0e0'],[10,3,'#fff0e0'],[14,6,'#fff0e0'],[8,8,'#fff0e0'],[12,9,'#fff0e0']]},
      {p:[[8,14,EYE],[12,14,EYE],[10,17,'#6a1a1a'],[11,17,'#6a1a1a']]} ];
  }},
  zarzo: {w:28, h:19, ax:14, ay:18, shapes(f){
    const fu=['#6a2a10','#a8501c','#d07830','#e8a050'], lf=['#3a5a1a','#5a8a2a'], L = legs(f,[9,18,11,20],12,19,fu.slice(0,3),'#3a1a08',2.4), lg = f===2 ? 2 : 0;
    return [ {l:[6,11,1,13,3.4], c:fu.slice(0,3)}, {l:[1,13,0,9,2.4], c:['#f4ecd8','#ffffff']}, ...L.far, {e:[13,11,9,4.8], c:fu, tex:705}, {p:[[8,8,lf[1]],[12,7,lf[1]],[16,8,lf[1]],[10,10,lf[0]],[15,10,lf[0]]]}, ...L.near,
      {poly:[[19+lg,5],[20+lg,0],[22+lg,4]], c:fu.slice(1)}, {poly:[[23+lg,4],[25+lg,0],[26+lg,5]], c:fu.slice(1)}, {e:[22+lg,8,4.6,4], c:fu}, {e:[26+lg,9.5,2.2,1.8], c:['#f4ecd8','#ffffff']},
      {p:[[23+lg,7,EYE],[27+lg,9,'#100808'],[25+lg,11,'#d04a4a']]} ];
  }},
  silva: {w:24, h:22, ax:12, ay:21, fly:true, shapes(f){
    const sv=['#6a6e7a','#9a9eaa','#c8ccd8','#f0f2f8'];
    const wing = f===1 ? {poly:[[11,10],[3,2],[5,8],[1,12],[10,15]], c:sv.slice(0,3)} : f===2 ? {poly:[[11,12],[3,19],[5,14],[1,13],[10,15]], c:sv.slice(0,3)} : {poly:[[11,11],[2,9],[4,14],[1,16],[10,16]], c:sv.slice(0,3)};
    return [ {poly:[[7,16],[3,21],[9,19]], c:sv.slice(0,3)}, {e:[12,14,5.6,5.6], c:sv, tex:706}, {e:[12,16,3.6,3.2], c:['#e8eaf0','#ffffff']}, {e:[13,7,5.4,5], c:sv}, {poly:[[8,3],[8,0],[11,3]], c:sv.slice(1)}, {poly:[[15,3],[18,0],[18,4]], c:sv.slice(1)},
      {e:[12,8,3.4,3], c:['#f4f4fa','#ffffff']}, {poly:[[13,9],[15,11],[13,12]], c:['#e8c050','#ffe080']}, wing, {p:[[10,7,'#ffd040'],[11,7,'#101010'],[14,7,'#ffd040'],[15,7,'#101010']]} ];
  }},
  hilandera: {w:30, h:18, ax:15, ay:17, shapes(f){
    const sp=['#2a1e0e','#4a361c','#7a5a2c','#a88040'], t = [0,1.2,-1.2][f], legsL = [];
    [[11,10],[14,10],[17,10]].forEach(([x,y], i) => { const k = (i%2 ? t : -t); legsL.push({l:[x,y,x-3+k,y-5,1.2], c:sp.slice(0,3)}, {l:[x-3+k,y-5,x-6+k,16,1.1], c:sp.slice(0,3)}, {l:[x,y,x+6+k,y-4,1.2], c:sp.slice(0,3)}, {l:[x+6+k,y-4,x+10+k,16,1.1], c:sp.slice(0,3)}); });
    return [ ...legsL, {e:[10,10,6.6,5], c:sp, tex:707}, {e:[20,11,4.2,3.6], c:sp}, {p:[[7,7,'#e8c870'],[10,6,'#e8c870'],[13,7,'#e8c870'],[22,9,'#ff9a30'],[23,9,'#ff9a30'],[21,9,'#ff9a30'],[24,12,'#f4ecd8']]} ];
  }},
  raiz: {w:34, h:30, ax:17, ay:29, shapes(f){
    const wd=['#2a1a0c','#4a301a','#6a4a2a','#8a6a3c'], lf=['#2a5a1a','#4a8a2a','#78b848'], sw = [0,2,-2][f], up = f===2 ? 5 : 0;
    return [ {l:[10,22,8+sw,29,4.4], c:wd.slice(0,3)}, {l:[22,22,24-sw,29,4.4], c:wd.slice(0,3)}, {e:[16,16,8.6,9.6], c:wd, tex:708}, {l:[8,13,3,20,3.2], c:wd.slice(0,3)}, {l:[24,13,30,18-up,3.2], c:wd.slice(0,3)},
      {e:[16,6,6.4,5.2], c:wd}, {poly:[[8,4],[12,-0+1],[13,5]], c:lf}, {poly:[[14,3],[18,0],[19,4]], c:lf}, {poly:[[20,4],[25,1],[24,6]], c:lf}, {poly:[[7,9],[2,6],[9,6]], c:lf},
      {p:[[13,6,'#ffd040'],[14,6,'#ffd040'],[18,6,'#ffd040'],[19,6,'#ffd040'],[15,10,'#1a0e06'],[16,10,'#1a0e06'],[14,17,lf[1]],[18,15,lf[1]],[12,20,lf[0]]]} ];
  }},
  fatuo: {w:20, h:22, ax:10, ay:21, fly:true, shapes(f){
    const gl=['#7a9ac8','#aac8f0','#d8ecff','#ffffff'], fl = f===1 ? 2 : f===2 ? -2 : 0;
    return [ {poly:[[10,3+fl],[16,12],[13,20],[7,20],[4,12]], c:gl, tex:709}, {poly:[[7,18],[10,22],[13,18]], c:gl.slice(0,3)}, {e:[10,11,5.6,6.4], c:['#a8d0ff','#e8f4ff','#ffffff']}, {e:[10,10,3,3.6], c:['#ffffff','#ffffff']},
      {poly:[[3,12],[0,9+fl],[4,14]], c:gl.slice(1)}, {poly:[[17,12],[20,9-fl],[16,14]], c:gl.slice(1)}, {p:[[8,10,'#4a6a98'],[12,10,'#4a6a98'],[10,13,'#6a8ab8'],[10,1+fl,'#ffffff']]} ];
  }},
  halo: {w:42, h:34, ax:20, ay:33, shapes(f){
    const wh=['#a8a8b8','#d8d8e8','#f0f0fa','#ffffff'], gd='#ffd070', lg = f===2 ? 2 : 0;
    const L = legs(f,[12,24,14,26],22,34,wh.slice(0,3),'#c8c8d8',2.6), op = f===2 ? 2 : 0;
    return [ {l:[8,20,2,24,3], c:wh.slice(0,3)}, ...L.far, {e:[17,22,11,6.6], c:wh, tex:710}, {e:[17,25,8,2.2], c:['#fff8e0','#ffffff']}, ...L.near,
      {l:[25,16,29,9,4], c:wh}, {e:[32+lg,8,5,4], c:wh, tex:711}, {e:[37+lg,10+op,3,2.2], c:wh.slice(1)},
      {l:[30+lg,3,29+lg,-1+1,1.2], c:gd}, {l:[29+lg,1,26+lg,0,1], c:gd}, {l:[29+lg,3,33+lg,0,1], c:gd}, {l:[33+lg,0,36+lg,1,1], c:gd}, {l:[32+lg,3,36+lg,5,1], c:gd}, {l:[30+lg,5,28+lg,8,1], c:gd},
      {p:[[32+lg,7,'#ffd040'],[33+lg,7,'#ffd040'],[38+lg,10,'#d8a0a0'],[13,20,gd],[19,19,gd],[24,21,gd],[28,13,gd],[10,24,gd]]} ];
  }},
});
for(const id of ['hojarasca','lucero','rocio','vuelito','setita','zarzo','silva','hilandera','raiz','fatuo','halo']){
  const dd = PET_SHAPES[id];
  PET_ART[id] = {fly:!!dd.fly, glow:dd.glow, fr:[0,1,2].map(f => SP(paintSprite(dd.w, dd.h, dd.shapes(f)), dd.ax, dd.ay))};
  PET_ART[id].flash = PET_ART[id].fr.map(s => {
    const c = document.createElement('canvas'); c.width = s.c.width; c.height = s.c.height;
    const g = c.getContext('2d'); g.drawImage(s.c,0,0); g.globalCompositeOperation='source-in'; g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height);
    return {c, ax:s.ax, ay:s.ay};
  });
}
PET_ART.halo.glow = '#fff0a0'; PET_ART.fatuo.glow = '#aee8ff'; PET_ART.lucero.glow = '#fff090';
