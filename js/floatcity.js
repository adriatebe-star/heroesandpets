'use strict';
// =====================================================================
//  Expedición 11 · La ciudad flotante (sobre el lago): hombres pez, sirenas, objetos atlantes y tesoros del mar.
//  Y la sala del tiempo (sobre el ascenso gélido): la guarida oscura de Rolecs, señor del tiempo.
// =====================================================================

// ---------- hombres pez y sirenas (mismas capas del héroe + aletas) ----------
const FISH_SKIN = ['#7fd8c8', '#3fa898', '#1e6a62'];
ORC_CFG.fishharpoon = {human:true, skin:FISH_SKIN, hair:['#2a8a9a'], hood:['#2a8a9a', '#3fb0b8', '#16505a'], tunic:['#3a7a90', '#5ab0c8', '#1e4a60'], leg:['#1e4a60', '#3a7a90'], weapon:'spear', armor:'vest', noPaint:true, armW:4};
ORC_CFG.fishtrident = {human:true, skin:['#6fc0d8', '#3a90b0', '#1e5a78'], hair:['#1e6a9a'], hood:['#1e6a9a', '#3a9ad0', '#103a5a'], tunic:['#2a5a8a', '#4a8ac8', '#16305a'], leg:['#16305a', '#2a5a8a'], weapon:'spear', armor:'plate', noPaint:true, armW:5};
ORC_CFG.fishmage = {human:true, skin:['#8ad8d0', '#4aa8a8', '#206a70'], hair:['#7a5ad8'], hood:['#5a3aa8', '#8a6ae0', '#2a1a5a'], tunic:['#4a2a98', '#7a5ad8', '#20104a'], leg:['#20104a', '#4a2a98'], weapon:'staff', staffCol:['#8ae8ff', '#ffffff'], armor:'robe', noPaint:true, armW:3};
ORC_CFG.siren = {human:true, skin:['#f0d4e0', '#d8a8c0', '#a87890'], hair:['#3ad8c8'], hood:['#3ad8c8', '#7af0e0', '#1a8a88'], tunic:['#c84a9a', '#f07ac8', '#7a2058'], leg:['#1a8a88', '#3ad8c8'], noPaint:true, armW:3};
function fishFinish(cv, kind, f){   // aletas, ojos de pez, branquias y cola de sirena sobre el lienzo ya dibujado (sin escalar)
  const g = cv.getContext('2d'), AX = 24, AY = 54, swing = f === 2, fin = kind === 'mage' ? ['#5a3aa8', '#8a6ae0'] : kind === 'siren' ? ['#1a8a88', '#7af0e0'] : ['#1e8a9a', '#5ad8e0'];
  if(kind === 'siren'){
    oPoly(g, [[AX-8, AY-14], [AX+8, AY-14], [AX+6, AY-6], [AX+15, AY-1], [AX+3, AY-3], [AX-11, AY-1], [AX-6, AY-6]], '#121015');
    oPoly(g, [[AX-7, AY-13], [AX+7, AY-13], [AX+5, AY-6], [AX+13, AY-2], [AX+3, AY-4], [AX-9, AY-2], [AX-5, AY-6]], '#2ab8a8'); oPoly(g, [[AX-7, AY-13], [AX, AY-13], [AX-1, AY-6], [AX-9, AY-2], [AX-5, AY-6]], '#7af0e0');
    oPx(g, [[AX-3, AY-10, '#e8fffa'], [AX+3, AY-9, '#e8fffa'], [AX, AY-7, '#e8fffa']]);
    oPoly(g, [[AX-4, AY-39], [AX-9, AY-26], [AX-3, AY-30]], '#3ad8c8'); oPoly(g, [[AX+8, AY-34], [AX+11, AY-22], [AX+5, AY-28]], '#3ad8c8');   // pelo largo
    return cv;
  }
  oPoly(g, [[AX-6, AY-38], [AX-3, AY-49], [AX+1, AY-38]], fin[0]); oPoly(g, [[AX+1, AY-38], [AX+5, AY-47], [AX+9, AY-37]], fin[1]);   // aleta dorsal en la cabeza
  oPx(g, [[AX+6, AY-33, '#fffbd0'], [AX+7, AY-33, '#fffbd0'], [AX+6, AY-32, '#fffbd0'], [AX+7, AY-32, '#101010'], [AX+4, AY-29, '#1e6a62'], [AX+4, AY-27, '#1e6a62'], [AX-6, AY-22, fin[1]], [AX-6, AY-19, fin[1]]]);   // ojo grande y branquias
  const hx = swing ? AX+16 : AX+11, hy = swing ? AY-9 : AY-13;
  if(kind === 'trident'){   // tridente: tres puntas con chispas eléctricas
    if(!swing){ for(const dx of [-2, 2, 6]){ oCl(g, hx+dx, hy-31, hx+dx, hy-38, 1, '#9af0ff'); } oCl(g, hx-2, hy-32, hx+6, hy-32, 1, '#9af0ff'); oPx(g, [[hx-3, hy-40, '#ffff90'], [hx+7, hy-39, '#ffffff'], [hx+2, hy-42, '#ffff90']]); }
    else { for(const dy of [-3, 0, 3]) oCl(g, hx+13, hy+dy, hx+20, hy+dy, 1, '#9af0ff'); oPx(g, [[hx+22, hy-2, '#ffff90'], [hx+22, hy+3, '#ffffff']]); }
  } else if(kind === 'harpoon'){
    if(!swing) oPoly(g, [[hx-1, hy-34], [hx+2, hy-42], [hx+5, hy-34]], '#c8d0d8'); else oPoly(g, [[hx+14, hy-3], [hx+23, hy], [hx+14, hy+3]], '#c8d0d8');
  }
  return cv;
}
for(const [id, k, kind] of [['fishharpoon', 1.0, 'harpoon'], ['fishtrident', 1.08, 'trident'], ['fishmage', 1.0, 'mage'], ['siren', 1.0, 'siren']]){
  const c = ORC_CFG[id];
  MON_SHAPES[id] = {w:Math.round(64*k), h:Math.round(56*k), ax:Math.round(24*k), ay:Math.round(54*k), canvas:f => oScaled(fishFinish(orcCanvas(f, c), kind, f), k)};
  const dd = MON_SHAPES[id];
  MON_ART[id] = {fr:[0, 1, 2].map(f => SP(dd.canvas(f), dd.ax, dd.ay))};
  MON_ART[id].flash = MON_ART[id].fr.map(s => {
    const cv = document.createElement('canvas'); cv.width = s.c.width; cv.height = s.c.height;
    const g = cv.getContext('2d'); g.drawImage(s.c, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
    return {c:cv, ax:s.ax, ay:s.ay};
  });
}
Object.assign(MONSTERS, {
  fishharpoon:{name:'Hombre pez arponero', art:'fishharpoon', ai:'archer', hp:700, dmg:62, spd:74, r:10, xp:110, reach:0, prep:.6, range:[160, 250], harpoon:true, sea:true},
  fishtrident:{name:'Hombre pez del tridente eléctrico', art:'fishtrident', ai:'walk', hp:950, dmg:74, spd:78, r:11, xp:130, reach:16, prep:.5, electric:true, sea:true},
  siren:      {name:'Sirena hechicera', art:'siren', ai:'archer', hp:560, dmg:46, spd:66, r:9, xp:125, reach:0, prep:.8, range:[170, 260], charm:true, sea:true},
  fishmage:   {name:'Hombre pez mago', art:'fishmage', ai:'archer', hp:640, dmg:54, spd:68, r:9, xp:120, reach:0, prep:.7, range:[170, 260], bubble:true, sea:true},
});
Object.assign(RARE_PREFIX, {
  fishharpoon:['Arpón', 'Marea', 'Escama Negra', 'Anzuelo'], fishtrident:['Rayo', 'Tormenta', 'Trueno Salado', 'Abismo'],
  siren:['Canto', 'Espuma', 'Sirena Negra', 'Melodía'], fishmage:['Burbuja', 'Perla', 'Corriente', 'Hielo Marino'],
});
Object.assign(MON_COLORS, {fishharpoon:['#3fa898', '#5ab0c8', '#c8d0d8'], fishtrident:['#3a90b0', '#4a8ac8', '#9af0ff'], siren:['#d8a8c0', '#3ad8c8', '#f07ac8'], fishmage:['#4aa8a8', '#7a5ad8', '#8ae8ff']});

// ---------- objetos atlantes (también los sueltan los hombres pez) y tesoros del mar ----------
Object.assign(ICON_ROWS, {
  trident:    {pal:{W:'#9af0ff', w:'#e8ffff', B:'#7a5636'}, rows:["kk..kk..kk..", "kWk.kWk.kWk.", "kWk.kWk.kWk.", "kWkkkWkkkWk.", ".kWWWWWWWk..", "..kkkWkkk...", ".....kWk....", ".....kBk....", ".....kBk....", ".....kBk....", ".....kBk....", ".....kk....."]},
  atlcrown:   {pal:{L:'#c8962e', l:'#ffe08a', d:'#6a4a10', s:'#7affea'}, rows:ICON_ROWS.helmet.rows},
  atlantern:  {pal:{b:'#3aa8a0', y:'#7affea', Y:'#e8fffa'}, rows:LANT_ROWS},
  blackpearl: {pal:{B:'#2a2a38', b:'#5a5a78', w:'#e8e8ff'}, rows:["............", "....kkkk....", "...kBBbbk...", "..kBBbbbbk..", ".kBBbwbbbbk.", ".kBBbbbbbbk.", ".kBBBbbbbbk.", ".kBBBBbbbbk.", "..kBBBBbbk..", "...kkBBkk...", "....kkkk...."]},
  nacreshell: {pal:{W:'#f8e8f0', w:'#ffd8ec', p:'#d890b8'}, rows:["............", ".....kk.....", "...kkWWkk...", "..kWwWWwWk..", ".kWWwWWwWWk.", ".kWWwWWwWWk.", "kWWWwWWwWWWk", "kWWwwWWwwWWk", ".kkkkWWkkkk.", "....kppk....", ".....kk....."]},
  goldanchor: {pal:{G:'#ffd84a', g:'#c8962e'}, rows:["....kkkk....", "...kGGGGk...", "....kGGk....", "..kkkGGkkk..", "..kGGGGGGk..", ".....kGk....", ".....kGk....", ".k...kGk...k", ".kG..kGk..Gk", "..kGGGGGGGk.", "...kkkkkkk.."]},
  tidecompass:{pal:{G:'#ffd84a', g:'#c8962e', w:'#e8f8ff', R:'#ff5a4a', N:'#4a8aff'}, rows:["....kkkk....", "...kGGGGk...", "..kGwwRwGk..", ".kGwwwRRwGk.", ".kGwwwRRwGk.", ".kGwwNNwwGk.", ".kGwNNwwwGk.", "..kGwNwwGk..", "...kGGGGk...", "....kggk....", ".....kk....."]},
  coralcrown: {pal:{R:'#ff7a6a', r:'#c83a3a', W:'#ffd0c0'}, rows:["k..k..k..k..", "kRk.kRk.kRk.", "kRRkkRkkkRRk", ".kRRRRRRRRk.", ".kRrRRWRRrk.", ".kRrrRRRrrk.", "..kRRRRRRk..", "...kkkkkk..."]},
  oceanheart: {pal:{C:'#7ae8ff', c:'#2a8ad8', W:'#ffffff', d:'#0a3a7a'}, rows:["..kkk..kkk..", ".kCCCkkCCCk.", "kCWWCCCcccCk", "kCWCCCcccccd", ".kCCCcccccdk", "..kCCcccddk.", "...kCccddk..", "....kcddk...", ".....kdk....", "......k....."]},
});
for(const k of ['trident', 'atlcrown', 'atlantern', 'blackpearl', 'nacreshell', 'goldanchor', 'tidecompass', 'coralcrown', 'oceanheart']){ const d = ICON_ROWS[k]; ICONS[k] = bakeRows(d.rows.map(r => r.padEnd(12, '.')), Object.assign({k:OUT}, d.pal)); }
Object.assign(ITEMS, {
  trident:    {name:'Tridente', icon:'trident', slot:'weapon', kind:'trident', gear:true, dur:120, dmg:[62, 86], value:200,
               desc:'Arma cuerpo a cuerpo de gran alcance: su estocada va en línea recta y alcanza a todos los enemigos de esa línea. Mucho daño. Se desgasta con cada golpe.'},
  atlcrown:   {name:'Corona atlante', icon:'atlcrown', slot:'head', gear:true, armor:0, lightMul:1.5, dodge:12, ov:'atlcrown', value:190,
               desc:'Una corona de oro y perlas sin ninguna defensa, pero tu luz llega un 50 % más lejos y tienes un 12 % de probabilidad de esquivar los golpes.'},
  atlantlantern:{name:'Farolillo atlante', icon:'atlantern', slot:'lantern', oilMax:120, oilRegen:2, value:170,
               desc:'Guarda hasta 120 de aceite y regenera 2 de aceite por segundo mientras está encendido. Se enciende y apaga con E.'},
});
const TRz = (name, icon, value, desc) => ({name, icon, treasure:true, value, desc:'Tesoro. Trapis te lo compra. ' + desc});
Object.assign(ITEMS, {
  blackpearl: TRz('Perla negra', 'blackpearl', 380, 'Brilla con un reflejo violeta.'),
  nacreshell: TRz('Concha de nácar', 'nacreshell', 260, 'Si la acercas al oído oyes una canción lejana.'),
  goldanchor: TRz('Ancla de oro', 'goldanchor', 320, 'Demasiado pequeña para un barco... y demasiado pesada.'),
  tidecompass:TRz('Brújula de las mareas', 'tidecompass', 520, 'Muy extraña: la aguja siempre apunta al agua más profunda.'),
  coralcrown: TRz('Corona de coral', 'coralcrown', 650, 'Muy extraña: sigue creciendo un poquito cada noche.'),
  oceanheart: TRz('Corazón del océano', 'oceanheart', 1600, 'Muy extraño: late al ritmo de las olas.'),
});
TREASURE_POOL.sea = [{id:'blackpearl', w:8}, {id:'nacreshell', w:8}, {id:'goldanchor', w:6}, {id:'tidecompass', w:1.6}, {id:'coralcrown', w:.9}, {id:'oceanheart', w:.45}];
TREASURE_ZONES.floatcity = 'sea';
// a la venta en Trapis desde el tier 11 y botín de los hombres pez
for(const [id, price] of [['trident', 320], ['atlcrown', 280], ['atlantlantern', 260]]) SHOP.push({id, n:1, price, tier:11});
for(const T of [LOOT.chestNormal, LOOT.chestRare]){ const r = T === LOOT.chestRare; for(const id of ['trident', 'atlcrown', 'atlantlantern']) T.table.push({w:r ? 4 : 2, id, lvl:11}); }
for(const id of ['trident', 'atlcrown', 'atlantlantern']) LOOT.monsterTable.push({w:3, id, lvl:11});
function seaDrop(m){
  const rk = m.rarity === 'rare' ? 2 : m.rarity === 'magic' ? 1 : 0, bonus = [0, .5, 1.2][rk];
  if(Math.random() < [.025, .05, .1][rk]){ dropItem(m.x + rand(-8, 8), m.y + rand(-4, 4), mkItem('timekey', 1)); addText(m.x, m.y-m.r*2-34, '¡Llave del tiempo!', '#bfe8f4', 7, -20); }
  if(Math.random() < [.04, .09, .18][rk]){
    const id = wpick([{w:40, id:'trident'}, {w:30, id:'atlcrown'}, {w:30, id:'atlantlantern'}]).id;
    dropItem(m.x, m.y, mkItem(id, 1, G.sc.lvl || 11, bonus)); addText(m.x, m.y-m.r*2-22, '¡Botín atlante!', '#7affea', 7, -20);
  }
}
// corona atlante: aspecto en el héroe (corona de oro con perlas)
{ const b = ARMOR_OV.urrhelm, o = ARMOR_OV.atlcrown = {ox:b.ox, oy:b.oy, rows:b.rows, img:{}};
  for(const r in STUD) o.img[r] = bakeRows(b.rows, {k:OUT, s:'#7affea', L:'#c8962e', l:'#ffe08a', d:'#6a4a10'}); }
// farolillo atlante: farol turquesa
SPR.lantern.atl = bakeRows(SPR.lantern.rows, Object.assign({}, PAL, {b:'#3aa8a0', B:'#a8f0e8', d:'#1e6a6a'}));
SPR.lantern.atloff = bakeRows(SPR.lantern.rows, Object.assign({}, PAL, {b:'#3aa8a0', B:'#a8f0e8', d:'#1e6a6a', y:'#2a3a38', Y:'#3a4a48'}));

// ---------- el mapa: ciudad de madera que flota en el agua ----------
const FC_WOOD = ['#4a301a', '#5e3f22', '#6f4a2a', '#7c5632'].map(hex), FC_RIM = hex('#241608'), FC_WATER = ['#0c2238', '#12304c', '#1a4264', '#245678'].map(hex), FC_SHORE = hex('#3a7a98'), FC_FOAM = hex('#9cd4e4');
ART.cabin = SP(paintSprite(52, 58, [
  {r:[4, 26, 44, 30], c:['#3a2412', '#5a3a20', '#7a5232'], tex:171}, {poly:[[0, 28], [26, 2], [52, 28]], c:['#2a5a6a', '#3a7a8a', '#5aa0aa']}, {poly:[[0, 28], [26, 2], [26, 8], [4, 28]], c:['#1e4450', '#2a5a6a']},
  {r:[20, 38, 12, 18], c:['#2a1a0c', '#3a2412']}, {r:[8, 34, 8, 8], c:['#ffd88a', '#ffb347']}, {r:[36, 34, 8, 8], c:['#ffd88a', '#ffb347']}, {r:[2, 54, 48, 4], c:['#2a1a0c', '#3a2412']},
  {p:[[26, 14, '#e8f8ff'], [25, 14, '#e8f8ff'], [27, 14, '#e8f8ff']]},
]), 26, 57);
ART.bigcabin = SP(paintSprite(84, 70, [
  {r:[4, 28, 76, 40], c:['#3a2412', '#5a3a20', '#7a5232'], tex:172}, {poly:[[0, 32], [42, 2], [84, 32]], c:['#2a5a6a', '#3a7a8a', '#5aa0aa']}, {poly:[[0, 32], [42, 2], [42, 9], [5, 32]], c:['#1e4450', '#2a5a6a']},
  {r:[34, 44, 16, 24], c:['#2a1a0c', '#3a2412']}, {r:[10, 40, 10, 10], c:['#ffd88a', '#ffb347']}, {r:[64, 40, 10, 10], c:['#ffd88a', '#ffb347']}, {r:[24, 40, 6, 8], c:['#ffd88a', '#ffb347']}, {r:[54, 40, 6, 8], c:['#ffd88a', '#ffb347']},
  {r:[58, 4, 8, 14], c:['#4a4e56', '#6a6e78']}, {r:[2, 66, 80, 4], c:['#2a1a0c', '#3a2412']}, {p:[[42, 16, '#e8f8ff'], [41, 16, '#e8f8ff'], [43, 16, '#e8f8ff']]},
]), 42, 69);
ART.lamppost = SP(paintSprite(10, 32, [{r:[4, 10, 2, 22], c:['#2a2c34', '#4a4e5a', '#6a6e78']}, {e:[5, 7, 4, 4.4], c:['#ffb347', '#ffd88a', '#fff1b8']}, {r:[2, 2, 6, 2], c:['#2a2c34']}]), 5, 31);
function buildFloatCity(seed){
  const R = rng(seed), rr = (a, c) => a + R()*(c - a);
  const X0 = -900, X1 = 900, Y0 = -1500, Y1 = 320, CELL = 8, GW = Math.ceil((X1 - X0)/CELL), GH = Math.ceil((Y1 - Y0)/CELL);
  const sc = baseScene('floatcity', 'La ciudad flotante', X0, Y0, X1, Y1);
  sc.kind = 'raid'; sc.darkness = .9; sc.seed = seed; sc.lvl = 11;
  // plataformas en una cuadrícula irregular (4 × 4) unidas por puentes de madera
  const nodes = []; const COLS = 4, ROWS = 4;
  for(let r = 0; r < ROWS; r++) for(let c = 0; c < COLS; c++){
    const w = Math.round(rr(220, 300)/8)*8, h = Math.round(rr(170, 230)/8)*8;
    nodes.push({c, r, w, h, x:Math.round(-600 + c*400 + rr(-40, 40)), y:Math.round(100 - r*390 + rr(-30, 30)), cabins:[], items:[]});
  }
  const at = (c, r) => nodes[r*COLS + c];
  const start = at(1 + Math.floor(R()*2), 0);
  const edges = [], seen = new Set([start]), stack = [start];
  while(stack.length){   // árbol que une todas las plataformas + algunos puentes extra para dar vueltas
    const a = stack[stack.length - 1], nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dc, dr]) => [a.c + dc, a.r + dr]).filter(([c, r]) => c >= 0 && c < COLS && r >= 0 && r < ROWS && !seen.has(at(c, r)));
    if(!nb.length){ stack.pop(); continue; }
    const [c, r] = nb[Math.floor(R()*nb.length)], b = at(c, r); seen.add(b); edges.push([a, b]); stack.push(b);
  }
  for(const a of nodes) for(const [dc, dr] of [[1, 0], [0, 1]]){ const c = a.c + dc, r = a.r + dr; if(c < COLS && r < ROWS){ const b = at(c, r); if(!edges.some(([p, q]) => (p === a && q === b) || (p === b && q === a)) && R() < .35) edges.push([a, b]); } }
  const rects = [], BW = 44;   // zonas caminables: plataformas y puentes
  for(const n of nodes) rects.push({x:n.x - n.w/2, y:n.y - n.h/2, w:n.w, h:n.h});
  for(const [a, b] of edges){
    if(a.r === b.r){ const [l, r2] = a.x < b.x ? [a, b] : [b, a], y = Math.round((l.y + r2.y)/2); rects.push({x:l.x + l.w/2 - 4, y:y - BW/2, w:(r2.x - r2.w/2) - (l.x + l.w/2) + 8, h:BW}); }
    else { const [t, bt] = a.y < b.y ? [a, b] : [b, a], x = Math.round((t.x + bt.x)/2); rects.push({x:x - BW/2, y:t.y + t.h/2 - 4, w:BW, h:(bt.y - bt.h/2) - (t.y + t.h/2) + 8}); }
  }
  const grid = new Uint8Array(GW*GH);
  for(const rc of rects) for(let gy = Math.floor((rc.y - Y0)/CELL); gy <= Math.floor((rc.y + rc.h - Y0)/CELL); gy++) for(let gx = Math.floor((rc.x - X0)/CELL); gx <= Math.floor((rc.x + rc.w - X0)/CELL); gx++) if(gx >= 0 && gx < GW && gy >= 0 && gy < GH) grid[gy*GW + gx] = 1;
  const walk = (x, y) => { const gx = Math.floor((x - X0)/CELL), gy = Math.floor((y - Y0)/CELL); return gx >= 0 && gx < GW && gy >= 0 && gy < GH && grid[gy*GW + gx] === 1; };
  sc.waterAt = (x, y) => !walk(x, y);   // el agua bloquea el paso (pero no la vista: se puede disparar sobre ella)
  sc.ground = (x, y) => {
    if(walk(x, y)){
      if(!walk(x - 5, y) || !walk(x + 5, y) || !walk(x, y - 5) || !walk(x, y + 5)) return FC_RIM;
      const row = Math.floor(y/7), seam = (((y % 7) + 7) % 7) === 0, off = (row*37) % 53;
      if(seam || (((Math.floor((x + off)/22)) + row) % 5 === 0 && (((x + off) % 22) + 22) % 22 < 1)) return FC_WOOD[0];
      return FC_WOOD[1 + ((row + Math.floor((x + off)/22)) % 3 + 3) % 3];
    }
    const near = walk(x - 9, y) || walk(x + 9, y) || walk(x, y - 9) || walk(x, y + 9), v = vnoise(x/16, y/9, 901)*.7 + hash(x, y, 902)*.2;
    if(near && v > .62) return FC_FOAM; if(near) return FC_SHORE;
    return FC_WATER[tq(v + Math.sin(y/9 + vnoise(x/40, y/40, 903)*6)*.12, x, y, 4)];
  };
  sc.spawn = {x:start.x, y:start.y + start.h/2 - 40};
  sc.horse = {x:start.x - 60, y:start.y + start.h/2 - 22, dir:1};
  addCollider(sc, {t:'r', x:sc.horse.x - 24, y:sc.horse.y - 7, w:46, h:12});
  sc.houses = []; sc.wisps = [];
  const free = (x, y, r) => walk(x, y) && !blocked(sc, x, y, r + 6) && Math.hypot(x - sc.spawn.x, y - sc.spawn.y) > 110 && Math.hypot(x - sc.horse.x, y - sc.horse.y) > 50;
  // cabañas, farolas y cajas en cada plataforma
  for(const n of nodes){
    sc.lights.push({x:n.x, y:n.y - 10, r:190, a:.75, warm:true, flick:.1});
    const big = R() < .4 && n !== start;
    const side = R() < .5 ? -1 : 1, cx = n.x + side*(n.w/2 - (big ? 52 : 36)), cy = n.y - n.h/2 + (big ? 74 : 62);
    if(n !== start || R() < .5){
      if(big){ propSprite(sc, ART.bigcabin, Math.round(cx), Math.round(cy), {t:'r', x:cx - 38, y:cy - 12, w:76, h:12}, [40, 5]); sc.lights.push({x:cx, y:cy - 30, r:110, a:.6, warm:true, flick:.12}); }
      else { propSprite(sc, ART.cabin, Math.round(cx), Math.round(cy), {t:'r', x:cx - 22, y:cy - 10, w:44, h:10}, [24, 4]); sc.lights.push({x:cx, y:cy - 24, r:90, a:.55, warm:true, flick:.12}); }
      n.cabins.push({x:cx, y:cy});
    }
    for(const [dx, dy] of [[-n.w/2 + 12, n.h/2 - 14], [n.w/2 - 12, n.h/2 - 14]]) propSprite(sc, ART.lamppost, Math.round(n.x + dx), Math.round(n.y + dy), {t:'c', x:n.x + dx, y:n.y + dy - 3, r:3}, [6, 2]);
    for(let k = 0; k < 3; k++){ const x = n.x + rr(-n.w/2 + 24, n.w/2 - 24), y = n.y + rr(-n.h/2 + 40, n.h/2 - 24); if(free(x, y, 8)) propSprite(sc, R() < .5 ? ART.crate : ART.barrel, Math.round(x), Math.round(y), R() < .5 ? {t:'r', x:x - 7, y:y - 9, w:15, h:9} : {t:'c', x, y:y - 4, r:7}, [9, 3]); }
  }
  const pointOn = (n, r) => { for(let i = 0; i < 60; i++){ const x = Math.round(n.x + rr(-n.w/2 + 20, n.w/2 - 20)), y = Math.round(n.y + rr(-n.h/2 + 30, n.h/2 - 20)); if(free(x, y, r)) return {x, y}; } return null; };
  const addChest = (p, rare) => { if(!p) return; const ch = {x:p.x, y:p.y, rare, open:false}; ch.col = addCollider(sc, {t:'r', x:p.x - 9, y:p.y - 8, w:18, h:8}); sc.chests.push(ch); };
  nodes.forEach((n, i) => { if(n !== start && R() < .55) addChest(pointOn(n, 10), R() < .22); });
  for(const n of nodes.filter(q => q.r >= 2).slice(0, 3)) addChest(pointOn(n, 10), true);
  // jaulas (mascotas de la expedición 11)
  const pets = shuffle(petsOfExp(11).filter(id => R() < CAGE_CHANCE[PETS[id].rarity]), R), usedN = new Set([start]);
  for(const id of pets){
    const cand = nodes.filter(q => !usedN.has(q)), n = cand.length ? cand[Math.floor(R()*cand.length)] : nodes[Math.floor(R()*nodes.length)]; usedN.add(n);
    const p = pointOn(n, 14); if(!p) continue;
    const cage = {x:p.x, y:p.y, pet:null, open:false}; cage.col = addCollider(sc, {t:'r', x:cage.x - 12, y:cage.y - 8, w:24, h:8}); sc.cages.push(cage);
  }
  // monstruos: cada plataforma con su grupo (la de la entrada, vacía)
  const rar = far => { const roll = R(); return roll < .03 + far*.06 ? 'rare' : roll < .2 + far*.16 ? 'magic' : 'normal'; };
  const GROUPS = [['fishharpoon', 'fishharpoon', 'fishmage'], ['fishtrident', 'fishtrident', 'fishtrident'], ['siren', 'fishtrident', 'fishtrident'], ['fishmage', 'fishmage', 'fishharpoon'], ['siren', 'siren', 'fishharpoon'], ['fishtrident', 'fishharpoon', 'fishmage', 'siren']];
  for(const n of nodes){
    if(n === start) continue;
    const far = clamp((Y1 - n.y)/(Y1 - Y0), 0, 1), pack = []; let hasRare = false;
    const types = GROUPS[Math.floor(R()*GROUPS.length)], cnt = 2 + Math.floor(R()*2) + (far > .5 ? 1 : 0);
    for(let k = 0; k < cnt; k++){ let r = rar(far); if(r === 'rare' && hasRare) r = 'magic'; if(r === 'rare') hasRare = true; pack.push({type:types[Math.floor(R()*types.length)], rarity:r}); }
    sc.monsterSpawns.push({x:Math.round(n.x), y:Math.round(n.y + 20), pack});
  }
  return sc;
}

// ---------- la sala del tiempo: guarida oscura de Rolecs, señor del tiempo ----------
ORC_CFG.rolecs = {human:true, skin:['#e8dcc8', '#c8b898', '#8a7a5a'], hair:['#ffffff'], hood:['#2a1a6a', '#4a3aa8', '#12083a'], tunic:['#2a1a6a', '#4a3aa8', '#12083a'], leg:['#12083a', '#2a1a6a'], weapon:'staff', staffCol:['#8ab0ff', '#ffffff'], armor:'robe', hat:'helm', gold:true, cloak:true, cloak2:['#12083a', '#2a1a6a', '#4a3aa8'], noPaint:true, armW:3};
ART.rolecs = [0, 2].map(f => SP(oCrisp(orcCanvas(f, ORC_CFG.rolecs)), 24, 54));
ART.clockring = SP(paintSprite(70, 70, [
  {e:[35, 35, 34, 34], c:['#12083a', '#2a1a6a', '#4a3aa8']}, {e:[35, 35, 27, 27], c:['#050310', '#0a0620']}, {e:[35, 35, 20, 20], c:['#12083a', '#1a1050']},
  {p:[[35, 3, '#c8b8ff'], [35, 67, '#c8b8ff'], [3, 35, '#c8b8ff'], [67, 35, '#c8b8ff'], [12, 12, '#8a7ad8'], [58, 12, '#8a7ad8'], [12, 58, '#8a7ad8'], [58, 58, '#8a7ad8']]},
]), 35, 66);
function buildTimeHall(){
  const sc = baseScene('timehall', 'La sala del tiempo', -300, -230, 300, 230);
  sc.kind = 'den'; sc.darkness = .94;
  const caveF = (x, y) => (x/270)**2 + (y/195)**2 + (vnoise(x/45, y/45, 77) - .5)*.4;
  sc.solidAt = (x, y) => caveF(x, y) > 1;
  const ROCK = ['#0a0814', '#100c1e', '#18122a', '#201a38'].map(hex), RIM = hex('#4a3a7a'), FLOOR = ['#16122a', '#1c1832', '#241e3c', '#2c2646'].map(hex), RING = hex('#6a5ad8'), TICK = hex('#a89aff');
  sc.ground = (x, y) => {
    const f = caveF(x, y);
    if(f > 1){ if(f < 1.035) return RIM; return ROCK[tq((vnoise(x/7, y/7, 81)*.6 + hash(x, y, 82)*.4 - .15)/.7, x, y, 4)]; }
    const d = Math.hypot(x, y*1.15 + 10), ang = Math.atan2(y*1.15 + 10, x);
    if(Math.abs(d - 150) < 1.6 || Math.abs(d - 100) < 1) return RING;
    if(d > 100 && d < 150){ const h = (ang/(Math.PI*2)*12 + 12) % 1; if(h < .03 || h > .97) return TICK; }
    return FLOOR[tq((vnoise(x/10, y/10, 84)*.6 + hash(x, y, 85)*.4 - .2)/.6, x, y, 4)];
  };
  sc.spawn = {x:0, y:170};
  sc.horse = {x:50, y:178, dir:-1};
  addCollider(sc, {t:'r', x:26, y:171, w:46, h:12});
  sc.lights.push({x:0, y:0, r:230, a:.8, warm:false, flick:.06, col:'portal'}, {x:0, y:-80, r:140, a:.9, warm:false, flick:.08});
  // Rolecs, su pedestal y el portal del tiempo (todavía no funciona)
  sc.npcs.push({id:'rolecs', name:'Rolecs', x:0, y:-60, dir:1}); addCollider(sc, {t:'c', x:0, y:-62, r:9});
  const portal = {x:0, y:-150, draw(){
    drawSP(ART.clockring, 0, -138);
    if(G.save.rolecsPortal){ const t = G.t, a = Math.round(35 + Math.sin(t*2)*3); b.globalAlpha = .55 + .2*Math.sin(t*3); b.fillStyle = '#8a7aff'; b.beginPath(); b.ellipse(0, -172, 22, 30, 0, 0, Math.PI*2); b.fill(); b.globalAlpha = 1; b.fillStyle = '#e8e0ff'; b.beginPath(); b.ellipse(0, -172, 12, 18, 0, 0, Math.PI*2); b.fill();
      if(Math.random() < .5) G.parts.push({x:rand(-18, 18), y:-172 + rand(-22, 22), vx:0, vy:-18, life:.6, max:.6, size:1.5, col:pick(['#c8b8ff', '#ffffff'])}); }
  }};
  addProp(sc, portal, null);
  sc.portalProp = portal;
  for(const [x, y] of [[-170, -60], [170, -60], [-120, 80], [130, 90]]){ propSprite(sc, ART.icecrystal, x, y, {t:'c', x, y:y - 2, r:6}, [10, 3]); sc.lights.push({x, y:y - 12, r:90, a:.6, warm:false, flick:.12}); }
  return sc;
}
function enterTimeHall(){
  resetWorld(buildTimeHall());
  G.save.inRaid = false; saveGame(); UI.refresh(); mmBuild(G.sc); playMusic('den');
  toast('La sala del tiempo', 2.5);
}
function countItem(id){ let n = 0; for(const it of G.inv.bag.concat(G.save.stash, Object.values(G.inv.equip).flat())) if(it && it.id === id) n += it.n || 1; return n; }
function talkRolecs(){
  const s = G.save, give = rolecsOpenPortal;
  const menu = () => UI.say('Rolecs, señor del tiempo', [{text:'¿Qué buscas en la sala del tiempo, viajero?', choice:[{label:'Entregar una llave del tiempo', fn:give}, {label:'Hablar del portal', fn:() => UI.say('Rolecs, señor del tiempo', [s.rolecsPortal ? 'El portal está abierto. No sé adónde lleva: cada llave elige un instante distinto.' : 'Esa puerta se abre con una llave del tiempo y solo lleva a un instante. Cada llave es un viaje.'])}, {label:'Nada, gracias'}]}]);
  if(!s.rolecsMet){
    UI.say('Rolecs, señor del tiempo', ['Silencio... el tiempo está escuchando.', 'Soy Rolecs, señor del tiempo. Llevo eras en esta sala oscura, más allá del ascenso gélido.', 'Los fantasmas de la montaña guardan las llaves del tiempo: fragmentos de instantes perdidos.', 'Tráeme una y abriré un portal hacia lo que aún no ha ocurrido.'], () => { s.rolecsMet = true; saveGame(); menu(); });
    return;
  }
  menu();
}

// ---------- mascotas de la ciudad flotante (arte por formas) ----------
function petJelly(f, o){
  const w = f === 1 ? 2 : f === 2 ? -2 : 0, c = o.pal;
  return [ {l:[8, 11, 8 + w, 20, 1], c:c.slice(1)}, {l:[11, 12, 11 - w, 22, 1], c:c.slice(1)}, {l:[14, 12, 14 + w, 21, 1], c:c.slice(1)}, {l:[17, 11, 17 - w, 19, 1], c:c.slice(1)},
    {e:[12.5, 8, 9.5, 7], c, tex:o.tex}, {e:[10, 5, 3.4, 2.2], c:['#ffffff', '#ffffff']}, {p:[[9, 8, '#2a1a4a'], [15, 8, '#2a1a4a']]} ];
}
function petOctopus(f, o){
  const w = f === 1 ? 2 : f === 2 ? -2 : 0, c = o.pal, s = [];
  for(let i = 0; i < 6; i++){ const x = 6 + i*3.4; s.push({l:[x, 14, x + (i % 2 ? w : -w) - 2 + i*.6, 22, 1.4], c:c.slice(0, 3)}); }
  s.push({e:[14, 9, 9.5, 8], c, tex:o.tex}, {e:[11, 6, 3.4, 2.2], c:['#ffffff', '#ffffff']}, {p:[[11, 10, '#101010'], [17, 10, '#101010'], [10, 10, '#ffffff'], [16, 10, '#ffffff']]});
  return s;
}
function petStar(f, o){
  const c = o.pal, k = f === 1 ? 1 : f === 2 ? -1 : 0, pts = [[12, 1], [15, 8], [23, 9], [17, 14], [19, 22 + k], [12, 17], [5, 22 - k], [7, 14], [1, 9], [9, 8]];
  return [ {poly:pts, c, tex:o.tex}, {p:[[12, 6, '#fff0c0'], [12, 11, '#fff0c0'], [8, 11, '#fff0c0'], [16, 11, '#fff0c0'], [12, 15, '#fff0c0'], [10, 13, '#101010'], [14, 13, '#101010']]} ];
}
Object.assign(PET_SHAPES, {
  globito:   {w:30, h:24, ax:14, ay:23, shapes:f => [ {poly:[[4, 12], [0, 7], [0, 17]], c:['#c8a040', '#e8c860']}, {e:[14, 12, 10, 9], c:['#c8a040', '#e8c860', '#f8e898', '#fff8c8'], tex:1101}, {e:[14, 16, 7, 5], c:['#fff8e0', '#ffffff']},
              {poly:[[12, 14], [8, 18 + (f === 1 ? 2 : 0)], [14, 17]], c:['#e8c860']}, {p:[[8, 6, '#a07a20'], [12, 3, '#a07a20'], [17, 3, '#a07a20'], [21, 6, '#a07a20'], [6, 11, '#a07a20'], [22, 12, '#a07a20']]},
              {e:[20, 9, 2.6, 2.6], c:'#ffffff'}, {p:[[21, 9, '#101010'], [25, 14, '#a02020']]} ]},
  hipo:      {w:22, h:30, ax:10, ay:29, shapes:f => [ {l:[14, 24, 17, 17, 3.4], c:['#d89a30', '#f0b848', '#ffd878']}, {l:[17, 17, 11, 11, 4.4], c:['#d89a30', '#f0b848', '#ffd878']}, {l:[11, 11, 11, 6, 4], c:['#d89a30', '#f0b848', '#ffd878'], tex:1102},
              {e:[11, 5, 3.6, 3.2], c:['#f0b848', '#ffd878']}, {l:[13, 5, 19, 6, 1.3], c:['#d89a30', '#f0b848']}, {poly:[[7, 3], [5, f === 1 ? -1 : 1], [9, 2]], c:['#d89a30', '#f0b848']}, {l:[14, 24, 12 + (f === 1 ? 2 : 0), 28, 2], c:['#d89a30']},
              {p:[[10, 4, '#101010'], [18, 10, '#ffd878'], [16, 14, '#ffd878']]} ]},
  tortuguita:{w:38, h:25, ax:17, ay:24, shapes:f => [ {poly:[[6, 18], [2, 22 + (f === 1 ? 1 : 0)], [10, 21]], c:['#3a8a4a', '#5aaa68']}, {poly:[[26, 18], [31, 22 + (f === 2 ? 1 : 0)], [23, 21]], c:['#3a8a4a', '#5aaa68']},
              {e:[16, 14, 11, 7.5], c:['#2a6a3a', '#3a9a52', '#5aca72', '#8af0a0'], tex:1103}, {p:[[10, 11, '#1a4a2a'], [16, 9, '#1a4a2a'], [22, 11, '#1a4a2a'], [13, 15, '#1a4a2a'], [19, 15, '#1a4a2a']]},
              {e:[28, 14, 3.8, 3.2], c:['#7ac060', '#a0e080']}, {p:[[29, 13, '#101010'], [31, 15, '#3a6a20']]}, {poly:[[5, 15], [0, 14], [4, 18]], c:['#5aaa68']} ]},
  estrellita:{w:24, h:24, ax:12, ay:22, shapes:f => petStar(f, {pal:['#c8501a', '#e87a2a', '#ffa850', '#ffd090'], tex:1104})},
  gaviotin:  {w:28, h:20, ax:13, ay:19, fly:true, shapes:f => petBird(f, {pal:['#8a909c', '#b8bec8', '#e4e8ee', '#ffffff'], tex:1105, beak:'#ffb030'})},
  medusin:   {w:26, h:24, ax:13, ay:23, fly:true, glow:'#c8a0ff', shapes:f => petJelly(f, {pal:['#a078e0', '#c8a0ff', '#e8d0ff', '#ffffff'], tex:1106})},
  pulpito:   {w:30, h:25, ax:14, ay:24, shapes:f => petOctopus(f, {pal:['#7a3aa0', '#a050d0', '#c88af0', '#e8c8ff'], tex:1107})},
  voltio:    {w:42, h:24, ax:20, ay:23, glow:'#ffe84a', shapes:f => [ {l:[4, 16, 12, 12, 4.6], c:['#2a4a50', '#3a6a70', '#5a9aa0'], tex:1108}, {l:[12, 12, 22, 14, 5], c:['#2a4a50', '#3a6a70', '#5a9aa0']}, {l:[22, 14, 32, 11, 4.6], c:['#2a4a50', '#3a6a70', '#5a9aa0']},
              {e:[35, 10, 4.6, 3.8], c:['#3a6a70', '#5a9aa0']}, {l:[8, 18, 28, 19, 2], c:['#e8d878', '#fff8a0']}, {p:[[36, 9, '#101010'], [37, 12, '#e86a6a'], [10, 8 + (f === 1 ? 2 : 0), '#ffe84a'], [20, 6, '#ffffff'], [27, 7 + (f === 2 ? 2 : 0), '#ffe84a'], [3, 12, '#ffe84a']]} ]},
  dientes:   {w:44, h:26, ax:20, ay:25, shapes:f => [ {poly:[[6, 14], [-1, 6 + (f === 1 ? 2 : 0)], [-1, 22 - (f === 1 ? 2 : 0)]], c:['#4a5a6a', '#6a7a8a']}, {e:[22, 15, 17, 8], c:['#4a5a6a', '#6a7a8a', '#90a0b0', '#b8c4d0'], tex:1109}, {e:[24, 19, 12, 4], c:['#e8f0f8', '#ffffff']},
              {poly:[[20, 8], [26, -1 + 2], [30, 9]], c:['#4a5a6a', '#6a7a8a']}, {poly:[[18, 21], [14, 25], [22, 22]], c:['#4a5a6a']}, {e:[34, 13, 2, 2], c:'#ffffff'}, {p:[[35, 13, '#101010'], [38, 18, '#ffffff'], [40, 19, '#ffffff'], [36, 19, '#ffffff'], [31, 17, '#101010']]} ]},
  beluga:    {w:44, h:26, ax:20, ay:25, shapes:f => [ {poly:[[6, 14], [0, 8 + (f === 1 ? 2 : 0)], [0, 22 - (f === 1 ? 2 : 0)]], c:['#c8d0dc', '#e8eef6']}, {e:[24, 15, 18, 9], c:['#c8d0dc', '#e8eef6', '#f8fbff', '#ffffff'], tex:1110}, {e:[38, 12, 6.4, 6], c:['#e8eef6', '#ffffff']},
              {poly:[[22, 22], [18, 26], [26, 23]], c:['#c8d0dc']}, {p:[[40, 11, '#101010'], [43, 16, '#8a98a8'], [24, 6, '#a8b8c8']]} ]},
  krakenito: {w:42, h:34, ax:20, ay:33, glow:'#c890ff', shapes:f => { const w = f === 1 ? 3 : f === 2 ? -3 : 0, s = [], c = ['#4a2a88', '#7a4ac8', '#a878f0', '#d8b8ff'];
              for(let i = 0; i < 8; i++){ const x = 6 + i*4.2; s.push({l:[x, 20, x + (i % 2 ? w : -w) + (i - 3.5)*1.8, 32, 1.8], c:c.slice(0, 3)}); }
              s.push({e:[21, 13, 15, 12], c, tex:1111}, {e:[15, 8, 5, 3], c:['#ffffff', '#ffffff']}, {e:[16, 15, 3, 3.4], c:'#ffe86a'}, {e:[26, 15, 3, 3.4], c:'#ffe86a'}, {p:[[16, 15, '#101010'], [26, 15, '#101010'], [21, 20, '#2a1a4a'], [20, 20, '#2a1a4a'], [22, 20, '#2a1a4a']]}); return s; }},
});
Object.assign(PETS, {
  globito:   {exp:11, name:'Globito', rarity:'normal', look:'Pez globo', beh:'ranged', proj:'splash', dmg:[7, 10], cd:1.6, affixes:['espinosa'], attack:'Escupe burbujas a distancia'},
  hipo:      {exp:11, name:'Hipo', rarity:'normal', look:'Caballito de mar', beh:'ranged', proj:'splash', dmg:[7, 10], cd:1.7, affixes:['luciernaga'], attack:'Lanza burbujas que ralentizan al enemigo'},
  tortuguita:{exp:11, name:'Tortuguita', rarity:'normal', look:'Tortuga marina', beh:'charge', dmg:[7, 10], cd:2.4, miniStun:true, affixes:['dura'], attack:'Embestida con el caparazón que aturde 0,5 s'},
  estrellita:{exp:11, name:'Estrellita', rarity:'normal', look:'Estrella de mar', beh:'pounce', dmg:[6, 9], cd:1.4, bites:2, affixes:['curandera'], attack:'Doble zarpazo rápido'},
  gaviotin:  {exp:11, name:'Gaviotín', rarity:'normal', look:'Gaviota', beh:'flyer', dmg:[6, 9], cd:.9, affixes:['voladora'], attack:'Picotazos desde el aire'},
  medusin:   {exp:11, name:'Medusín', rarity:'magic', look:'Medusa luminosa', beh:'flock', dmg:[11, 15], cd:2.6, dust:true, affixes:['luciernaga', 'helada'], attack:'Polvo brillante que ralentiza a los enemigos en área'},
  pulpito:   {exp:11, name:'Pulpito', rarity:'magic', look:'Pulpo violeta', beh:'pounce', dmg:[11, 15], cd:1.7, bites:2, affixes:['feroz', 'agil'], attack:'Doble golpe de tentáculo'},
  voltio:    {exp:11, name:'Voltio', rarity:'magic', look:'Anguila eléctrica', beh:'cone', dmg:[11, 15], cd:2.4, fire:'#ffe84a', affixes:['atronadora', 'electrica'], attack:'Descarga eléctrica en cono (triple golpe) que a veces aturde'},
  dientes:   {exp:11, name:'Dientes', rarity:'rare', look:'Tiburón blanco', beh:'pounce', dmg:[20, 28], cd:1.8, bites:2, bleed:1, affixes:['feroz', 'sangrienta', 'veloz', 'vampirica'], attack:'Doble mordisco con sangrado'},
  beluga:    {exp:11, name:'Beluga', rarity:'rare', look:'Ballena beluga', beh:'charge', dmg:[20, 28], cd:3, knock:true, shock:true, affixes:['robusta', 'escudera', 'curandera', 'valiente'], attack:'Coletazo con onda de choque que aturde'},
  krakenito: {exp:11, name:'Krakenito', rarity:'legendary', look:'Kraken bebé', beh:'cone', dmg:[20, 26], cd:2.2, fire:'#9a6ae8', legendary:true, maelstrom:true, affixes:['helada', 'dura', 'inspiradora', 'indomable'],
              attack:'Latigazo de tentáculos en cono (triple golpe). Remolino cada 24 s: un torbellino arrastra y daña a los enemigos cercanos'},
});
for(const id of ['globito', 'hipo', 'tortuguita', 'estrellita', 'gaviotin', 'medusin', 'pulpito', 'voltio', 'dientes', 'beluga', 'krakenito']){
  const dd = PET_SHAPES[id], p = PETS[id]; p.id = id;
  p.hp = petBaseHp(p); const dm = 1 + PET_TIER_DMG*(petTier(p) - 1); p.dmg = p.dmg.map(v => Math.max(1, Math.round(v*dm)));
  PET_ART[id] = {fly:!!dd.fly, glow:dd.glow, fr:[0, 1, 2].map(f => SP(paintSprite(dd.w, dd.h, dd.shapes(f)), dd.ax, dd.ay))};
  PET_ART[id].flash = PET_ART[id].fr.map(s => {
    const c = document.createElement('canvas'); c.width = s.c.width; c.height = s.c.height;
    const g = c.getContext('2d'); g.drawImage(s.c, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    return {c, ax:s.ax, ay:s.ay};
  });
}
PET_IDS.length = 0; PET_IDS.push(...Object.keys(PETS));

// ---------- legendarios de la ciudad flotante: 2 exclusivos y el general de nivel 11 ----------
Object.assign(ICON_ROWS, {
  deeptrident:{pal:{W:'#7ac8ff', w:'#ffffff', B:'#ffd84a'}, rows:ICON_ROWS.trident.rows},
  coralheart: {pal:{R:'#ff7a6a', r:'#c83a3a', W:'#ffd0c0'}, rows:ICON_ROWS.coralcrown.rows},
  abyssgloves:{pal:{L:'#2a4a8a', d:'#0a1a3a', s:'#7affea'}, rows:ICON_ROWS.gloves.rows},
});
for(const k of ['deeptrident', 'coralheart', 'abyssgloves']){ const d = ICON_ROWS[k]; ICONS[k] = bakeRows(d.rows.map(r => r.padEnd(12, '.')), Object.assign({k:OUT}, d.pal)); }
EX('deeptrident', 'floatcity', {name:'Tridente de las Profundidades', slot:'weapon', kind:'trident', dur:150, dmg:[78, 104],
  desc:'Objeto legendario de la ciudad flotante. Tormenta abisal: sus golpes debilitan un 25 % de las veces y la descarga salta a otro enemigo cercano con la mitad del daño.'});
EX('coralheart', 'floatcity', {name:'Corazón de Coral', slot:'talisman', gear:false, unique:false, fixed:[{k:'hp', v:45}, {k:'hpreg', v:1.5}],
  desc:'Objeto legendario de la ciudad flotante. Arrecife: tus mascotas regeneran 3 de vida por segundo y reciben un 15 % menos de daño.'});
ITEMS.abyssgloves = {name:'Guantes del Pescador Abisal', icon:'abyssgloves', slot:'hands', gear:true, unique:true, legend:true, lvl:11, armor:3, value:300, ov:'legabyss',
  fixed:[{k:'crit', v:10}, {k:'stam', v:20}],
  desc:'Objeto legendario. Arpón abisal: tus críticos cuerpo a cuerpo arrastran al enemigo hacia ti y lo ralentizan 2 s.'};
LEGEND_IDS.push('abyssgloves');
EXCL_LEGENDS.floatcity = ['deeptrident', 'coralheart']; EXCL_IDS.push('deeptrident', 'coralheart');
legendOv('legabyss', 'glove', {L:'#2a4a8a', l:'#4a7ac8', d:'#0a1a3a'}); legendOv('legabyssBig', 'bigGlove', {L:'#2a4a8a', l:'#4a7ac8', d:'#0a1a3a'});
function seaLegendMelee(w, m, fx2){ if(w && w.id === 'deeptrident' && Math.random() < .25) fx2.weaken = 4; }
function seaLegendAfter(m, dmg, crit){
  const w = curWeapon();
  if(w && w.id === 'deeptrident'){   // la descarga salta a otro enemigo cercano
    let best = null, bd = 110; for(const o of G.mons) if(o !== m && !o.dying){ const d = Math.hypot(o.x-m.x, o.y-m.y); if(d < bd){ bd = d; best = o; } }
    if(best){ pixLine(m.x, m.y-14, best.x, best.y-14, 2, '#9af0ff'); burst(best.x, best.y-10, 8, ['#9af0ff', '#ffffff'], [30, 100], [.2, .4], 0); hitMonster(best, Math.round(dmg*.5), {src:'player', nx:0, ny:0, k:60}); }
  }
  if(crit && legendOn('abyssgloves') && !m.dying && !MONSTERS[m.type].boss){   // arpón abisal: tira del enemigo hacia el héroe
    const dx = P.x - m.x, dy = P.y - m.y, d = Math.hypot(dx, dy) || 1; m.vx += dx/d*320; m.vy += dy/d*320; m.slowT = Math.max(m.slowT || 0, 2); addText(m.x, m.y-m.r*2-18, 'Arpón', '#7affea', 6, -20);
  }
}
