'use strict';
// =====================================================================
//  Expedición 10 · El ascenso gélido: montaña nevada y resbaladiza donde caen rocas de los costados.
//  Yetis, soldados y arqueros fantasmales y trols de las nieves. Alexandra, la nórdica jugona (ruleta en la guarida).
// =====================================================================

// ---------- monstruos (mismas capas del héroe, pelaje blanco / piel fantasmal) ----------
const GHOST_SKIN = ['#bfe8f4', '#8cc4dc', '#4a7a98'];
ORC_CFG.yeti = {skin:['#f4f8ff', '#c8dcf0', '#8aa8c8'], hair:['#ffffff'], hood:['#e8f0ff', '#ffffff', '#a8c0e0'], tunic:['#dce8f8', '#f4f8ff', '#a8c0e0'], leg:['#a8c0e0', '#dce8f8'], noPaint:true, armW:6};
ORC_CFG.ghostsoldier = {human:true, skin:GHOST_SKIN, hair:['#e8fbff'], hood:['#7a98b8', '#b8d0e8', '#3a5068'], tunic:['#7a9ab8', '#b8d4ec', '#46607a'], leg:['#3a5068', '#5a7a98'], weapon:'greatsword', armor:'plate', hat:'helm', armW:4};
ORC_CFG.ghostarcher = {human:true, skin:GHOST_SKIN, hair:['#e8fbff'], hood:['#5a7898', '#98b8d8', '#2a4058'], tunic:['#5a7898', '#98b8d8', '#2a4058'], leg:['#2a4058', '#4a6a88'], weapon:'bow', armor:'vest', armW:3};
ORC_CFG.snowtroll = {skin:['#dcecf8', '#a8c4dc', '#6a88a8'], hair:['#ffffff'], hood:['#c8dcf0', '#f0f8ff', '#7a98b8'], tunic:['#c8dcf0', '#f0f8ff', '#7a98b8'], leg:['#7a98b8', '#a8c4dc'], weapon:'rock', armor:'strap', noPaint:true, armW:6};
for(const [id, k] of [['yeti', 1.3], ['ghostsoldier', 1.0], ['ghostarcher', .98], ['snowtroll', 1.65]]){
  const c = ORC_CFG[id];
  MON_SHAPES[id] = {w:Math.round(64*k), h:Math.round(56*k), ax:Math.round(24*k), ay:Math.round(54*k), canvas:f => oScaled(orcCanvas(f, c), k)};
  const dd = MON_SHAPES[id];
  MON_ART[id] = {fr:[0, 1, 2].map(f => SP(dd.canvas(f), dd.ax, dd.ay))};
  MON_ART[id].flash = MON_ART[id].fr.map(s => {
    const cv = document.createElement('canvas'); cv.width = s.c.width; cv.height = s.c.height;
    const g = cv.getContext('2d'); g.drawImage(s.c, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
    return {c:cv, ax:s.ax, ay:s.ay};
  });
}
Object.assign(MONSTERS, {
  yeti:        {name:'Yeti', art:'yeti', ai:'walk', hp:1500, dmg:80, spd:60, r:18, xp:150, reach:22, prep:.75, stunHit:true},
  ghostsoldier:{name:'Soldado fantasmal', art:'ghostsoldier', ai:'walk', hp:620, dmg:58, spd:80, r:10, xp:95, reach:15, prep:.45, slowHit:true, ghostly:true, ghost:true},
  ghostarcher: {name:'Arquero fantasmal', art:'ghostarcher', ai:'archer', hp:460, dmg:44, spd:70, r:9, xp:100, reach:0, prep:.65, range:[170, 260], icearrow:true, ghostly:true, ghost:true},
  snowtroll:   {name:'Trol de las nieves', art:'snowtroll', ai:'archer', hp:3000, dmg:92, spd:48, r:24, xp:260, reach:0, prep:1.0, range:[150, 260], snowball:true},
});
Object.assign(RARE_PREFIX, {
  yeti:['Pelaje', 'Ventisca', 'Garra Blanca', 'Aullido'], ghostsoldier:['Centinela', 'Lamento', 'Último Aliento', 'Guardia Eterna'],
  ghostarcher:['Susurro', 'Escarcha', 'Ojo Frío', 'Flecha Muda'], snowtroll:['Alud', 'Cumbre', 'Glaciar', 'Ventisquero'],
});
Object.assign(MON_COLORS, {yeti:['#c8dcf0', '#ffffff', '#8aa8c8'], ghostsoldier:['#8cc4dc', '#b8d4ec', '#e8fbff'], ghostarcher:['#8cc4dc', '#98b8d8', '#e8fbff'], snowtroll:['#a8c4dc', '#f0f8ff', '#7a98b8']});

// ---------- objetos fantasmales y la llave del tiempo (solo caen de los fantasmas; Trapis no los vende) ----------
Object.assign(ICON_ROWS, {
  ghostsword: {pal:{w:'#e8fbff', s:'#7ac8e8', r:'#bfe8f4', g:'#9ad8f0', b:'#3a5068'}, rows:ICON_ROWS.sword.rows},
  ghostbow:   {pal:{B:'#9ad8f0', b:'#4a8aaa', w:'#e8fbff'}, rows:ICON_ROWS.bow.rows},
  ghostmail:  {pal:{L:'#7a9ab8', l:'#c8e4f8', d:'#46607a', s:'#e8fbff'}, rows:ICON_ROWS.chestarmor.rows},
  timekey:    {pal:{Y:'#9ad8f0', y:'#4a8aaa', W:'#ffffff'}, rows:["...kkkkkk...", "..kYYWWYYk..", ".kYyyyyyyYk.", ".kYy....yYk.", ".kYy.kk.yYk.", ".kYyyyyyyYk.", "..kYYYYYYk..", "....kYyk....", "....kYyk....", "....kYYkkk..", "....kYyyYYk.", "....kYYkkkk."]},
});
for(const k of ['ghostsword', 'ghostbow', 'ghostmail', 'timekey']){ const d = ICON_ROWS[k]; ICONS[k] = bakeRows(d.rows, Object.assign({k:OUT}, d.pal)); }
Object.assign(ITEMS, {
  ghostsword:{name:'Espada fantasmal', icon:'ghostsword', slot:'weapon', kind:'sword', gear:true, dur:130, dmg:[46, 62], fearChance:.25, bleedChance:.3, value:230,
    desc:'Una espada hecha de niebla helada. 25 % de probabilidad de causar miedo (el enemigo huye) y 30 % de causar sangrado. Solo la llevan los fantasmas.'},
  ghostbow:  {name:'Arco fantasmal', icon:'ghostbow', slot:'weapon', kind:'bow', gear:true, dur:110, dmg:[34, 48], fearChance:.25, freezeChance:.2, value:230,
    desc:'Un arco de hielo espectral. Usa flechas. 25 % de probabilidad de causar miedo y 20 % de congelar. Solo lo llevan los fantasmas.'},
  ghostmail: {name:'Coraza fantasmal', icon:'ghostmail', slot:'chest', gear:true, armor:10, move:10, ov:'ghostmail', value:260,
    desc:'Una coraza translúcida y ligera: +10 % de velocidad de movimiento. Cada 10 segundos te vuelves invisible durante 3 segundos (los monstruos te pierden de vista). Muy rara: solo la llevan los fantasmas.'},
  timekey:   {name:'Llave del tiempo', icon:'timekey', stack:5, value:400,
    desc:'Una llave de hielo que late como un reloj roto. Los fantasmas la guardan... pero todavía no sabes qué puerta abre. Trapis te la compra.'},
});
const mkGhostOv = (key, base, pal) => {
  const b = ARMOR_OV[base], o = ARMOR_OV[key] = {ox:b.ox, oy:b.oy, rows:b.rows, img:{}};
  for(const r in STUD){   // translúcida
    const src = bakeRows(b.rows, Object.assign({k:OUT, s:STUD[r]}, pal)), cv = document.createElement('canvas'); cv.width = src.width; cv.height = src.height;
    const g = cv.getContext('2d'); g.globalAlpha = .72; g.drawImage(src, 0, 0); o.img[r] = cv;
  }
};
mkGhostOv('ghostmail', 'chest', {L:'#7a9ab8', l:'#c8e4f8', d:'#46607a'});
// botín de los fantasmas: arma o coraza (la coraza es mucho más rara) y, aparte, la llave del tiempo
function ghostDrop(m){
  const rk = m.rarity === 'rare' ? 2 : m.rarity === 'magic' ? 1 : 0, bonus = [0, .5, 1.2][rk];
  if(Math.random() < [.04, .09, .18][rk]){
    const id = wpick([{w:44, id:'ghostsword'}, {w:44, id:'ghostbow'}, {w:12, id:'ghostmail'}]).id;
    dropItem(m.x, m.y, mkItem(id, 1, G.sc.lvl || 10, bonus)); addText(m.x, m.y-m.r*2-22, '¡Botín fantasmal!', '#9ad8f0', 7, -20);
  }
  if(Math.random() < [.03, .07, .14][rk]){ dropItem(m.x + rand(-8, 8), m.y + rand(-4, 4), mkItem('timekey', 1)); addText(m.x, m.y-m.r*2-34, '¡Llave del tiempo!', '#bfe8f4', 7, -20); }
}
// coraza fantasmal (invisible 3 s cada 10 s) y capa de la ventisca; rocas que caen en el ascenso gélido
function updateIcePeak(dt){
  if(P.dead) return;
  if(P.invisT > 0) P.invisT -= dt;
  if(P.cloakCd > 0) P.cloakCd -= dt;
  const ch = G.inv.equip.chest;
  if(ch && ch.id === 'ghostmail'){
    P.ghostT = (P.ghostT ?? 10) - dt;
    if(P.ghostT <= 0){ P.ghostT = 10; P.invisT = 3; addText(P.x, P.y-56, '¡Invisible!', '#bfe8f4', 8); ring(P.x, P.y-10, 40, '#bfe8f4', .4); burst(P.x, P.y-16, 16, ['#bfe8f4', '#ffffff', '#7ac8e8'], [30, 100], [.4, .8], -30); sfx('alba'); }
  } else P.ghostT = undefined;
  if(G.sc && G.sc.id === 'icepeak') updateIceRocks(dt);
}
function iceCloak(m){   // capa de la ventisca: congela a quien te golpea
  if((P.cloakCd || 0) > 0 || m.dying || MONSTERS[m.type] && MONSTERS[m.type].boss || Math.random() > .3 || m.freezeImmT > 0) return;
  P.cloakCd = 6; m.freezeT = Math.max(m.freezeT || 0, 1.6); m.freezeImmT = 11.6;
  burst(m.x, m.y-m.r, 16, ['#c8f0ff', '#7ac8f0', '#ffffff'], [40, 120], [.3, .7], 0); ring(P.x, P.y-10, 50, '#c8f0ff', .4); addText(P.x, P.y-56, '¡Ventisca!', '#c8f0ff', 8);
}
function iceLegendMelee(w, m, fx2){   // hacha del ventisquero: ralentiza y cada 5.º golpe congela
  if(!w || w.id !== 'glacieraxe') return;
  fx2.slow = 2.5; P.iceN = (P.iceN || 0) + 1; if(P.iceN % 5 === 0) fx2.freeze = 2;
}
function updateIceRocks(dt){
  const sc = G.sc; G.rockT = (G.rockT ?? 3) - dt;
  if(G.rockT > 0) return;
  G.rockT = rand(1.3, 2.6);
  if(P.y > sc.y1 - 280) return;   // la entrada es segura
  const side = Math.random() < .5 ? -1 : 1, onHero = Math.random() < .22;
  const y = onHero ? P.y + rand(-14, 14) : P.y + rand(-190, 100), x = onHero ? P.x + rand(-14, 14) : sc.pathX(y) + side*(sc.pathW(y) - rand(8, 90));
  G.hazards.push({type:'rockfall', x:Math.round(x), y:Math.round(y), r:30, life:1.2, max:1.2, dmg:30});
}

// ---------- el mapa: ascenso lineal por una montaña nevada (el suelo resbala) ----------
const IP_SNOW = ['#7d8fa6', '#8c9fb6', '#9db0c6', '#b0c2d6'].map(hex), IP_ICE = ['#4f86ac', '#5f98be', '#75aed0', '#8cc2e0'].map(hex), IP_CLIFF = ['#262a34', '#30353f', '#3b414c', '#484f5c'].map(hex), IP_CAP = hex('#d8e4f0');
ART.snowpine = SP(paintSprite(26, 40, [
  {r:[11, 30, 4, 10], c:['#2a1c10', '#3e2a18', '#4e3822']},
  {poly:[[13, 2], [2, 18], [24, 18]], c:['#16302c', '#245048', '#33695e']}, {poly:[[13, 10], [0, 28], [26, 28]], c:['#16302c', '#245048', '#33695e']},
  {poly:[[13, 2], [8, 9], [18, 9]], c:['#dbe8f4', '#ffffff']}, {poly:[[13, 10], [6, 19], [20, 19]], c:['#dbe8f4', '#f4faff']}, {poly:[[13, 18], [4, 27], [22, 27]], c:['#c8d8e8', '#eef6fc']},
]), 13, 39);
ART.icecrystal = SP(paintSprite(18, 24, [
  {poly:[[9, 0], [14, 8], [12, 23], [6, 23], [4, 8]], c:['#3a78a8', '#6ab0e0', '#a8e0ff', '#e8faff']}, {poly:[[3, 12], [8, 8], [8, 23], [1, 23]], c:['#2e6a98', '#5aa0d0', '#8ad0f0']},
  {poly:[[13, 14], [17, 11], [17, 23], [12, 23]], c:['#2e6a98', '#5aa0d0', '#8ad0f0']}, {p:[[9, 4, '#ffffff'], [8, 9, '#ffffff']]},
]), 9, 23);
function buildIcePeak(seed){
  const R = rng(seed), rr = (a, c) => a + R()*(c - a);
  const X0 = -470, X1 = 470, Y0 = -2900, Y1 = 700;
  const sc = baseScene('icepeak', 'El ascenso gélido', X0, Y0, X1, Y1);
  sc.kind = 'raid'; sc.darkness = .9; sc.seed = seed; sc.lvl = 10; sc.slippery = true;
  const px = y => 85*Math.sin(y/520) + 40*Math.sin(y/190 + 1.3), pw = y => 185 + 45*Math.sin(y/310 + .7);
  sc.pathX = px; sc.pathW = pw;
  sc.spawn = {x:Math.round(px(Y1-110)), y:Y1-110};
  sc.horse = {x:sc.spawn.x - 44, y:Y1-92, dir:1};
  addCollider(sc, {t:'r', x:sc.horse.x - 24, y:Y1-99, w:46, h:12});
  if(!G.save.alexandraHome){
    const an = {id:'alexandra', name:'Alexandra', x:sc.spawn.x + 66, y:Y1-96, dir:-1}; sc.npcs.push(an); an.col = addCollider(sc, {t:'c', x:an.x, y:an.y-2, r:9});
    sc.lights.push({x:an.x, y:an.y-14, r:140, a:.8, warm:true, flick:.08});
  }
  // paredes de roca a los dos lados del camino
  for(let y = Y0; y < Y1; y += 14){ const c = px(y), w = pw(y); addCollider(sc, {t:'r', x:X0, y, w:c - w - X0, h:16}); addCollider(sc, {t:'r', x:c + w, y, w:X1 - (c + w), h:16}); }
  sc.ground = (x, y) => {
    if(x < X0 || x > X1 || y < Y0 || y > Y1) return IP_CLIFF[0];
    const c = px(y), w = pw(y), dx = Math.abs(x - c) + (vnoise(x/12, y/12, 801) - .5)*14;
    if(dx > w){
      if(dx < w + 5) return IP_CAP;
      return IP_CLIFF[tq(vnoise(x/9, y/9, 802)*.6 + hash(x, y, 803)*.3 + (hash(x, y-1, 804) > .93 ? .3 : 0), x, y, 4)];
    }
    const ice = vnoise(x/38, y/38, 805)*.7 + vnoise(x/11, y/11, 806)*.3;
    if(ice > .64) return IP_ICE[tq(vnoise(x/6, y/6, 807)*.6 + hash(x, y, 808)*.4, x, y, 4)];
    return IP_SNOW[tq((vnoise(x/17, y/17, 809)*.55 + vnoise(x/5, y/5, 810)*.3 + hash(x, y, 811)*.15 - .15)/.6, x, y, 4)];
  };
  const free = (x, y, r) => {
    if(y < Y0 + 60 || y > Y1 - 50 || Math.abs(x - px(y)) > pw(y) - 28 - r) return false;
    if(Math.hypot(x - sc.spawn.x, y - sc.spawn.y) < 130) return false;
    return !blocked(sc, x, y, r + 6);
  };
  const point = (r, minSpawn = 0, y0 = Y0 + 80, y1 = Y1 - 140) => {
    for(let i = 0; i < 200; i++){ const y = Math.round(rr(y0, y1)), x = Math.round(px(y) + rr(-1, 1)*(pw(y) - 36)); if(Math.hypot(x - sc.spawn.x, y - sc.spawn.y) < minSpawn) continue; if(free(x, y, r)) return {x, y}; }
    return null;
  };
  // campamentos congelados abandonados a lo largo de la subida
  const camps = [];
  for(let i = 0; i < 4; i++){
    const c = point(40, 400, Y0 + 260 + i*(Y1 - Y0 - 800)/4, Y0 + 260 + (i + 1)*(Y1 - Y0 - 800)/4); if(!c) continue;
    camps.push(c);
    const cf = propSprite(sc, ART.campfire, c.x, c.y, {t:'c', x:c.x, y:c.y-3, r:9, low:true});
    cf.draw = function(){ drawSP(ART.campfire, c.x, c.y); drawFlames(c.x, c.y-6, .8); };
    sc.lights.push({x:c.x, y:c.y-8, r:150, a:.8, warm:true, flick:.12});
    for(const [dx, dy] of [[-34, -18], [30, -22]]) if(R() < .8) propSprite(sc, ART.tent, c.x + dx, c.y + dy, {t:'c', x:c.x + dx, y:c.y + dy - 4, r:12}, [17, 4]);
    for(let k = 0; k < 3; k++){ const x = c.x + rr(-44, 44), y = c.y + rr(10, 34); if(free(x, y, 8)) propSprite(sc, R() < .5 ? ART.crate : ART.barrel, Math.round(x), Math.round(y), R() < .5 ? {t:'r', x:x-7, y:y-9, w:15, h:9} : {t:'c', x, y:y-4, r:7}, [9, 3]); }
  }
  let sd = seed*17;
  for(let i = 0; i < 70; i++){ const p = point(9, 120); if(p) propSprite(sc, ART.snowpine, p.x, p.y, {t:'c', x:p.x, y:p.y-2, r:6}, [14, 3]); }
  for(let i = 0; i < 26; i++){ const p = point(8, 120); if(p) propSprite(sc, ART.icecrystal, p.x, p.y, {t:'c', x:p.x, y:p.y-2, r:6}, [10, 3]); }
  for(let i = 0; i < 38; i++){ const p = point(12, 130); if(p) propRock(sc, p.x, p.y, ++sd); }
  for(let i = 0; i < 18; i++){ const p = point(4, 200); if(p) propSprite(sc, i % 3 ? ART.bones : ART.skullpile, p.x, p.y, {t:'c', x:p.x, y:p.y-2, r:5, low:true}); }
  sc.houses = []; sc.wisps = [];
  // jaulas (mascotas de la expedición 10)
  const pets = shuffle(petsOfExp(10).filter(id => R() < CAGE_CHANCE[PETS[id].rarity]), R), cagePts = [];
  for(const id of pets){
    let p = null;
    for(let i = 0; !p && i < 80; i++){ const q = camps.length && i % 2 ? {x:camps[i % camps.length].x + rr(-40, 40), y:camps[i % camps.length].y + rr(30, 60)} : point(14, 300); if(q && free(q.x, q.y, 14) && cagePts.every(o => Math.hypot(o.x - q.x, o.y - q.y) > 140)) p = q; }
    if(!p) continue;
    cagePts.push(p);
    const cage = {x:Math.round(p.x), y:Math.round(p.y), pet:null, open:false};
    cage.col = addCollider(sc, {t:'r', x:cage.x - 12, y:cage.y - 8, w:24, h:8});
    sc.cages.push(cage);
  }
  const addChest = (p, rare) => { if(!p) return; const ch = {x:p.x, y:p.y, rare, open:false}; ch.col = addCollider(sc, {t:'r', x:p.x - 9, y:p.y - 8, w:18, h:8}); sc.chests.push(ch); };
  for(const c of camps) addChest({x:Math.round(c.x + rr(-20, 20)), y:Math.round(c.y + rr(20, 34))}, R() < .3);
  for(let i = 0; i < 9; i++) addChest(point(10, 260), false);
  for(let i = 0; i < 3; i++) addChest(point(10, 700), true);
  // monstruos: yetis, soldados y arqueros fantasmales (el aviso: más difíciles cuanto más arriba) y trols gigantes
  const rar = far => { const roll = R(); return roll < .03 + far*.06 ? 'rare' : roll < .2 + far*.16 ? 'magic' : 'normal'; };
  const mkPack = (types, n, p) => {
    const far = clamp((Y1 - p.y)/(Y1 - Y0), 0, 1), pack = []; let hasRare = false;
    for(let k = 0; k < n; k++){ let r = rar(far); if(r === 'rare' && hasRare) r = 'magic'; if(r === 'rare') hasRare = true; pack.push({type:types[Math.floor(R()*types.length)], rarity:r}); }
    sc.monsterSpawns.push({x:p.x, y:p.y, pack});
  };
  for(let i = 0; i < 7; i++){ const p = point(18, 420); if(p) mkPack(['yeti'], 1 + Math.floor(R()*2), p); }
  for(let i = 0; i < 8; i++){ const p = point(16, 380); if(p) mkPack(['ghostsoldier', 'ghostsoldier', 'ghostarcher'], 3 + Math.floor(R()*2), p); }
  for(let i = 0; i < 5; i++){ const p = point(16, 420); if(p) mkPack(['ghostarcher'], 2, p); }
  for(let i = 0; i < 5; i++){ const p = point(26, 500); if(p) mkPack(['snowtroll'], 1, p); }
  for(const c of camps) sc.monsterSpawns.push({x:Math.round(c.x), y:Math.round(c.y + 60), pack:[{type:'ghostsoldier', rarity:R() < .3 ? 'magic' : 'normal'}, {type:'ghostsoldier', rarity:'normal'}, {type:'ghostarcher', rarity:'normal'}]});
  return sc;
}

// ---------- Alexandra, la nórdica jugona ----------
ORC_CFG.alexandra = {human:true, skin:['#f6dcc0', '#e0b894', '#b08c6c'], hair:['#d8341c'], hood:['#b02a1a', '#d84a2a', '#701810'], tunic:['#2a4a8a', '#4a6ac0', '#16285a'], leg:['#3a2a1c', '#5a4630'], armor:'vest', noPaint:true, cloak:true, cloak2:['#b8b0a0', '#e8e0d0', '#ffffff'], armW:3};
ART.alexandra = [0, 2].map(f => SP(oCrisp(orcCanvas(f, ORC_CFG.alexandra)), 24, 54));
ART.rltable = SP(paintSprite(44, 26, [
  {r:[2, 10, 40, 14], c:['#3a2412', '#5a3a20', '#7a5232'], tex:151}, {r:[4, 8, 36, 12], c:['#1a5a34', '#237a46', '#2e9a5a']},
  {e:[30, 13, 9, 5], c:['#2a1a0c', '#6a4a28', '#9a7a48']}, {e:[30, 12, 6, 3], c:['#a02020', '#e04040']}, {e:[30, 12, 2, 1.2], c:'#ffd040'},
  {r:[8, 11, 4, 3], c:'#e8c070'}, {r:[13, 12, 4, 3], c:'#c8c8d0'}, {r:[10, 14, 4, 3], c:'#e04040'}, {r:[3, 22, 4, 4], c:['#3a2412', '#5a3a20']}, {r:[37, 22, 4, 4], c:['#3a2412', '#5a3a20']},
]), 22, 24);
function talkAlexandra(){
  const s = G.save;
  if(G.sc.kind === 'raid'){
    if(s.alexandraHome) return;
    UI.say('Alexandra, la nórdica jugona', [
      '¡Eh, tú, viajero! Por fin una cara que no es de hielo ni de fantasma.',
      'Me llamo Alexandra, la nórdica jugona. Me han expulsado de todos los pueblos del norte... por organizar partidas de ruleta en cada taberna.',
      '¡Decían que mi rueda estaba trucada! Pura envidia: la suerte no se compra, se juega.',
      'Y ahora vago por esta montaña helada con mi ruleta a cuestas, sin nadie con quien jugar.',
      {text:'¿Me dejarías instalar mi mesa en vuestra guarida? Podrás jugarte tu oro siempre que quieras.', choice:[{label:'Aceptar: ven a la guarida', fn:() => {
        s.alexandraHome = true; saveGame();
        const an = G.sc.npcs.find(q => q.id === 'alexandra'); if(an && an.col) removeCollider(G.sc, an.col);
        G.sc.npcs = G.sc.npcs.filter(q => q.id !== 'alexandra');
        toast('Alexandra se muda a la guarida: ahora podrás jugar a la ruleta con tu oro', 4);
      }}, {label:'Ahora no'}]}]);
    return;
  }
  if(!s.alexandraMet){
    UI.say('Alexandra, la nórdica jugona', ['¡Gracias por el cobijo! Ya he montado mi mesa.', 'Apuesta lo que quieras: la rueda no engaña... mucho. ¡Hagan juego!'], () => { s.alexandraMet = true; saveGame(); UI.openRoulette(); });
    return;
  }
  UI.openRoulette();
}

// ---------- mascotas del ascenso gélido (arte por formas) ----------
function petFrostDragon(f, o){
  const wy = f === 1 ? 0 : f === 2 ? 17 : 8, fl = ['#1e4a78', '#3a80b8', '#7ac8f0', '#e8faff'];
  return [ {poly:[[12, 14], [4, 18], [-1, 22], [6, 20], [10, 16]], c:fl.slice(0, 3)}, {poly:[[10, 15], [2, 24], [9, 19]], c:fl.slice(1)},
    {poly:[[14, 11], [8, wy], [22, wy + 1], [20, 11]], c:fl.slice(0, 3)}, {poly:[[14, 12], [10, wy + 4], [21, wy + 5], [19, 12]], c:fl},
    {e:[17, 14, 7, 4.8], c:fl, tex:o.tex}, {e:[18, 16, 4.5, 2.4], c:['#c8e8f8', '#f0faff']}, {e:[24, 10, 3.8, 3.4], c:fl.slice(1)}, {poly:[[27, 9], [32, 11], [27, 12]], c:['#7ac8f0', '#e8faff']},
    {poly:[[21, 6], [22, 1], [25, 5]], c:['#e8faff', '#ffffff']}, {poly:[[24, 6], [27, 2], [28, 7]], c:['#e8faff', '#ffffff']}, {l:[18, 18, 17, 22, 1], c:'#2a4a6a'}, {l:[21, 18, 22, 22, 1], c:'#2a4a6a'},
    {p:[[25, 9, '#ffffff'], [26, 9, '#101010'], [16, 12, '#e8faff'], [19, 14, '#e8faff']]},
    {poly:[[14, 11], [11, wy + 2], [16, wy + 3]], c:fl.slice(2)} ];
}
Object.assign(PET_SHAPES, {
  copo:     {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#a8b4c8', '#d0d8e6', '#eef2f8', '#ffffff'], ears:'pointy', tail:'short', tex:1001, dk:'#6a7488', legW:1.8, eye:'#d03060',
              extra:lg => [{poly:[[25 + lg, 6], [26 + lg, 1], [28 + lg, 5]], c:['#d0d8e6', '#ffffff']}]})},
  pingui:   {w:24, h:26, ax:11, ay:25, shapes:f => [
              {r:[7 + (f === 1 ? 1 : 0), 24, 5, 2], c:'#ff9a30'}, {r:[13 - (f === 1 ? 1 : 0), 24, 5, 2], c:'#ff9a30'},
              {e:[12, 16, 7, 9], c:['#10141c', '#1c2230', '#2c3548'], tex:1002}, {e:[13, 17, 4.5, 6.5], c:['#e8f0f8', '#ffffff']}, {poly:[[5, 13], [2, 19], [6, 19]], c:['#10141c', '#1c2230']},
              {e:[12, 6, 4.5, 4.2], c:['#10141c', '#1c2230', '#2c3548']}, {poly:[[15, 6], [20, 8], [15, 9]], c:['#ffb040', '#ff8a20']}, {p:[[14, 5, '#ffffff'], [15, 5, '#101010'], [16, 3, '#ffd040']]}]},
  nevisca:  {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#98a4b8', '#c8d0e0', '#e8eef6', '#ffffff'], ears:'pointy', tail:'fox', tip:'#ffffff', tex:1003, dk:'#5a6478', eye:'#3a6ad0'})},
  focacho:  {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#6a6e7a', '#8a8e9a', '#aab0bc', '#ccd2dc'], tail:'short', tex:1004, dk:'#3e424e', legW:2.8, snout:['#3a3e48', '#5a5e68'], eye:'#101010',
              extra:lg => [{l:[30 + lg, 13, 36 + lg, 12, .6], c:'#e8eef6'}, {l:[30 + lg, 14, 36 + lg, 16, .6], c:'#e8eef6'}]})},
  nivea:    {w:28, h:20, ax:13, ay:19, fly:true, shapes:f => petBird(f, {pal:['#b8c0d0', '#dce2ee', '#f4f6fc', '#ffffff'], tex:1005, beak:'#ffc040'})},
  pelucon:  {w:40, h:26, ax:17, ay:25, shapes:f => petQuad(f, {pal:['#6a4a2a', '#8a6438', '#aa8250', '#c8a070'], wool:['#6a4a2a', '#8a6438', '#aa8250'], ears:'round', tail:'short', tex:1006, dk:'#3a2412', legW:2.6,
              extra:lg => [{l:[33 + lg, 11, 37 + lg, 18, 2.2], c:['#6a4a2a', '#8a6438']}, {l:[30 + lg, 13, 35 + lg, 17, 1.1], c:'#f8f0d8'}]})},
  reno:     {w:38, h:27, ax:17, ay:26, glow:'#c8f0ff', shapes:f => petQuad(f, {pal:['#8a7a68', '#b0a08a', '#d0c4b0', '#ece4d4'], ears:'antlers', horn:['#e8f0f8', '#ffffff'], tail:'short', tex:1007, dk:'#5a4e40', legW:1.8, eye:'#3a6ad0'})},
  lince:    {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#b8b4a8', '#d8d4c8', '#eeeae0', '#ffffff'], ears:'pointy', spots:[[11, 10], [16, 9], [21, 10], [13, 13]], spotCol:'#5a5a62', tail:'short', tex:1008, dk:'#6a665c', eye:'#3aa0d0',
              extra:lg => [{l:[25 + lg, 3, 25 + lg, 0, .8], c:'#3a3a40'}, {l:[30 + lg, 3, 30 + lg, 0, .8], c:'#3a3a40'}]})},
  osopolar: {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#c8ccd6', '#e0e4ec', '#f4f6fa', '#ffffff'], ears:'round', tail:'short', tex:1009, dk:'#7a7e8a', legW:3.2, snout:['#3a3e48', '#5a5e68'], eye:'#101010'})},
  lobo:     {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#a8b0c0', '#c8d0de', '#e4eaf4', '#ffffff'], ears:'pointy', tail:'fox', tip:'#ffffff', tex:1010, dk:'#5a6478', eye:'#60c8ff', legW:2.4})},
  boreal:   {w:34, h:26, ax:15, ay:21, fly:true, glow:'#aee8ff', shapes:f => petFrostDragon(f, {tex:1011})},
});
Object.assign(PETS, {
  copo:     {exp:10, name:'Copo', rarity:'normal', look:'Liebre de las nieves', beh:'pounce', dmg:[6, 9], cd:1.4, bites:2, affixes:['agil'], attack:'Doble salto con mordisco rápido'},
  pingui:   {exp:10, name:'Pingüi', rarity:'normal', look:'Pingüino', beh:'ranged', proj:'splash', dmg:[6, 9], cd:1.6, affixes:['helada'], attack:'Lanza bolas de nieve a distancia: ralentiza al enemigo'},
  nevisca:  {exp:10, name:'Nevisca', rarity:'normal', look:'Zorro ártico', beh:'pounce', dmg:[6, 9], cd:1.8, slowBite:true, affixes:['rastreador'], attack:'Mordisco que ralentiza'},
  focacho:  {exp:10, name:'Focacho', rarity:'normal', look:'Foca regordeta', beh:'charge', dmg:[6, 9], cd:2.4, miniStun:true, affixes:['robusta'], attack:'Embestida de barriga que aturde 0,5 s'},
  nivea:    {exp:10, name:'Nívea', rarity:'normal', look:'Búho nival', beh:'flyer', dmg:[5, 8], cd:.9, affixes:['ligera'], attack:'Picotazos desde el aire'},
  pelucon:  {exp:10, name:'Pelusón', rarity:'magic', look:'Cría de mamut', beh:'charge', dmg:[10, 14], cd:2.6, miniStun:true, affixes:['robusta', 'dura'], attack:'Embestida que aturde 0,5 s'},
  reno:     {exp:10, name:'Reno Boreal', rarity:'magic', look:'Reno de cuernos de hielo', beh:'cone', dmg:[10, 14], cd:2.4, fire:'#c8f0ff', affixes:['helada', 'veloz'], attack:'Aliento helado en cono (triple golpe) que ralentiza'},
  lince:    {exp:10, name:'Lince Albino', rarity:'magic', look:'Lince de las nieves', beh:'pounce', dmg:[10, 14], cd:1.7, bites:2, slowBite:true, affixes:['feroz', 'luciernaga'], attack:'Doble zarpazo que ralentiza'},
  osopolar: {exp:10, name:'Oso Polar', rarity:'rare', look:'Oso polar', beh:'charge', dmg:[18, 26], cd:3, knock:true, shock:true, affixes:['feroz', 'dura', 'robusta', 'valiente'], attack:'Zarpazo con onda de choque que aturde'},
  lobo:     {exp:10, name:'Lobo Ártico', rarity:'rare', look:'Lobo blanco de ojos azules', beh:'pounce', dmg:[16, 22], cd:1.8, bites:2, bleed:1, affixes:['rastreador', 'feroz', 'veloz', 'sangrienta'], attack:'Doble mordisco con sangrado'},
  boreal:   {exp:10, name:'Boreal', rarity:'legendary', look:'Dragón de escarcha', beh:'cone', dmg:[18, 24], cd:2.2, fire:'#aee8ff', legendary:true, blizzard:true, affixes:['helada', 'dura', 'inspiradora', 'indomable'],
              attack:'Aliento helado en cono (triple golpe). Ventisca cada 24 s: congela 2 s a los enemigos cercanos y les hace daño'},
});
for(const id of ['copo', 'pingui', 'nevisca', 'focacho', 'nivea', 'pelucon', 'reno', 'lince', 'osopolar', 'lobo', 'boreal']){
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

// ---------- legendarios del ascenso gélido: 2 exclusivos y el general de nivel 10 ----------
Object.assign(ICON_ROWS, {
  glacieraxe:   {pal:{s:'#c8f0ff', M:'#7ac8f0', m:'#2a6a9a', b:'#3a2618', B:'#7a5636'}, rows:ICON_ROWS.axe.rows},
  yetiheart:    {pal:{G:'#7ac8f0', g:'#e8faff'}, rows:ICON_ROWS.slimeheart.rows},
  blizzardcloak:{pal:{L:'#a8d0e8', l:'#e8f8ff', d:'#4a6a88', s:'#ffffff'}, rows:ICON_ROWS.chestarmor.rows},
});
for(const k of ['glacieraxe', 'yetiheart', 'blizzardcloak']){ const d = ICON_ROWS[k]; ICONS[k] = bakeRows(d.rows, Object.assign({k:OUT}, d.pal)); }
EX('glacieraxe', 'icepeak', {name:'Hacha del Ventisquero', slot:'weapon', kind:'axe', dur:140, dmg:[48, 64],
  desc:'Objeto legendario del ascenso gélido. Ventisquero: sus golpes ralentizan 2,5 s y cada 5.º golpe congela al enemigo 2 s.'});
EX('yetiheart', 'icepeak', {name:'Corazón del Yeti', slot:'talisman', gear:false, unique:false, fixed:[{k:'hp', v:50}, {k:'hpreg', v:1}],
  desc:'Objeto legendario del ascenso gélido. Sangre fría: eres inmune al aturdimiento y a la congelación.'});
ITEMS.blizzardcloak = {name:'Capa de la Ventisca', icon:'blizzardcloak', slot:'chest', gear:true, unique:true, legend:true, lvl:10, armor:18, value:290, ov:'legcloak',
  fixed:[{k:'hp', v:35}, {k:'eleres', v:15}],
  desc:'Objeto legendario. Ventisca: cuando un enemigo te golpea, tiene un 30 % de quedar congelado 1,6 s (se recarga en 6 s). Además reduce un 15 % el daño elemental.'};
LEGEND_IDS.push('blizzardcloak');
EXCL_LEGENDS.icepeak = ['glacieraxe', 'yetiheart']; EXCL_IDS.push('glacieraxe', 'yetiheart');
legendOv('legcloak', 'chest', {L:'#a8d0e8', l:'#e8f8ff', d:'#4a6a88'});
