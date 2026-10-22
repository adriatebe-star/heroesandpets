'use strict';
// =====================================================================
//  Expedición 9 · El templo sagrado (al norte del bosque élfico): elfos de fuego, de rayos y pesados, y el brujo élfico
// =====================================================================

// ---------- arte de los elfos del templo (mismas capas del héroe) ----------
const ELF_SKIN = ['#b8b0d0', '#8a82b0', '#524a78'];
ORC_CFG.tfirearcher = {elf:true, skin:ELF_SKIN, hair:['#fff0d8'], hood:['#5a1a10', '#8a3a1a', '#2a0c08'], tunic:['#7a2a14', '#c8581e', '#3a140a'], leg:['#3a140a', '#5a2412'], weapon:'bow', armor:'vest', armW:3};
ORC_CFG.tmage = {elf:true, skin:ELF_SKIN, hair:['#fff0d8'], hood:['#2a2a6a', '#4a4ac0', '#14143a'], tunic:['#2a2a8a', '#5a6af0', '#141450'], leg:['#141450', '#2a2a8a'], weapon:'staff', staffCol:['#ffe84a', '#fffbd0'], armor:'robe', armW:3};
ORC_CFG.tknight = {elf:true, skin:ELF_SKIN, hair:['#fff0d8'], hood:['#8a90a0', '#c8ccd8', '#4a4e5a'], tunic:['#9aa0b0', '#d0d4e0', '#5a5e6a'], leg:['#5a5e6a', '#8a90a0'], weapon:'greatsword', armor:'plate', hat:'helm', armW:5};
ORC_CFG.elfmage = {elf:true, gold:true, skin:ELF_SKIN, hair:['#ffffff'], hood:['#e8e4d0', '#fffbe8', '#a8a080'], tunic:['#e8e4d0', '#fffbe8', '#a8a080'], leg:['#a8a080', '#e8e4d0'], weapon:'staff', staffCol:['#ffe84a', '#ffffff'], armor:'robe', hat:'helm', cloak:true, cloak2:['#a8a080', '#e8e4d0', '#fffbe8'], armW:3};
for(const [id, k] of [['tfirearcher', .98], ['tmage', .98], ['tknight', 1.12], ['elfmage', 1.4]]){
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

// ---------- objetos del jefe (únicos) y objetos élficos del templo ----------
Object.assign(ICON_ROWS, {
  elfboots:   {pal:{L:'#6a8a7a', l:'#a8c8b8', d:'#2e4a3e', s:'#e8d070'}, rows:ICON_ROWS.boots.rows},
  elfshield:  {pal:{m:'#2e4a3e', M:'#e8d070', i:'#4a7a62', I:'#8ac8a8', g:'#e8d070'}, rows:ICON_ROWS.aegis.rows},
  elfbread:   {pal:{Y:'#e8c070', y:'#c8903a', w:'#fff0c0'}, rows:["............", "....kkkk....", "..kkYYYYkk..", ".kYYyyyyYYk.", "kYyyYYYYyyYk", "kYyYYwwYYyYk", "kYyyYYYYyyYk", ".kYyyyyyyYk.", "..kkkkkkkk.."]},
  elfcrown:   {pal:{L:'#d8c070', l:'#fff0a0', d:'#7a5a1a', s:'#fff8d8'}, rows:ICON_ROWS.helmet.rows},
  stormstaff: {pal:{B:'#ffe84a', b:'#c8a820', d:'#5a4a10'}, rows:ICON_ROWS.stick.rows},
  lightrobe:  {pal:{L:'#e8e4d8', l:'#fffbe8', d:'#a89a70', s:'#ffd23a'}, rows:ICON_ROWS.chestarmor.rows},
  holyaegis:  {pal:{m:'#a89a70', M:'#ffd23a', i:'#e8e4d8', I:'#fffbe8', g:'#ffd23a'}, rows:ICON_ROWS.aegis.rows},
});
for(const k of ['elfboots', 'elfshield', 'elfbread', 'elfcrown', 'stormstaff', 'lightrobe', 'holyaegis']){ const d = ICON_ROWS[k]; ICONS[k] = bakeRows(d.rows, Object.assign({k:OUT}, d.pal)); }
Object.assign(ITEMS, {
  elfboots:  {name:'Botas élficas', icon:'elfboots', slot:'feet', gear:true, armor:4, move:12, value:130, ov:'elfboot',
              desc:'Botas ligeras y silenciosas: +12 % de velocidad de movimiento. Solo las llevan los elfos del templo sagrado.'},
  elfshield: {name:'Escudo élfico', icon:'elfshield', slot:'shield', gear:true, dur:120, armor:5, block:.8, value:140,
              desc:'Escudo ligero de madera blanca y plata. Mantén clic derecho para cubrirte: bloquea el 80 % del daño frontal. Solo lo llevan los elfos del templo sagrado.'},
  elfbread:  {name:'Pan élfico', icon:'elfbread', stack:100, use:'bread', value:90,
              desc:'Tiene su propio hueco en el cinturón. Durante 1 minuto: +25 % de velocidad de movimiento, regeneras 3 de vida por segundo y atacas un 25 % más rápido.'},
  // únicos del brujo élfico
  elfcrown:  {name:'Corona del brujo élfico', icon:'elfcrown', slot:'head', gear:true, unique:true, armor:3, value:170, ov:'uelfcrown',
              fixed:[{k:'hp', v:35}, {k:'crit', v:7}, {k:'sreg', v:12}], desc:'Objeto único del brujo élfico.'},
  stormstaff:{name:'Cetro de la tormenta', icon:'stormstaff', slot:'weapon', kind:'stick', gear:true, unique:true, dur:140, dmg:[30, 42], weakChance:.4, stunChance:.15, value:190,
              fixed:[{k:'aspd', v:10}, {k:'dmg', v:5}], desc:'Objeto único del brujo élfico. 40 % de probabilidad de debilitar al enemigo 5 s y 15 % de aturdirlo.'},
  lightrobe: {name:'Túnica de luz sagrada', icon:'lightrobe', slot:'chest', gear:true, unique:true, armor:12, value:180, ov:'ulightrobe',
              fixed:[{k:'hp', v:40}, {k:'stam', v:20}, {k:'armor', v:3}], desc:'Objeto único del brujo élfico.'},
  holyaegis: {name:'Égida del templo', icon:'holyaegis', slot:'shield', gear:true, unique:true, dur:140, armor:6, block:.9, value:180,
              fixed:[{k:'thorns', v:8}, {k:'hp', v:25}], desc:'Objeto único del brujo élfico. Bloquea el 90 % del daño frontal.'},
});
// pan élfico: consumible con su propio hueco del cinturón y acción de la barra
QUICK_SLOTS.elfbread = ['elfbread']; QUICK_LABEL.elfbread = 'Pan élfico'; QUICK_HINT.elfbread = 'pan';
ACTIONS.elfbread = {name:'Comer pan élfico', trigger:true, item:['elfbread']};
TRIGGER_ACTIONS.push('elfbread');
function eatElfBread(){
  P.breadT = 60; toast('¡Pan élfico! +25 % de velocidad, regeneración y +25 % de velocidad de ataque durante 1 minuto', 2.8); sfx('eat');
  burst(P.x, P.y-20, 14, ['#e8c070', '#fff0c0', '#9affb0'], [30, 90], [.4, .9], -60);
}
// capas del héroe: botas élficas (todas las rarezas) y capas de los únicos
ARMOR_OV.elfboot = {ox:ARMOR_OV.boot.ox, oy:ARMOR_OV.boot.oy, rows:ARMOR_OV.boot.rows, img:{}};
for(const r in STUD) ARMOR_OV.elfboot.img[r] = bakeRows(ARMOR_OV.boot.rows, Object.assign({k:OUT, s:STUD[r], L:'#6a8a7a', l:'#a8c8b8', d:'#2e4a3e'}, r==='rare' ? {d:'#1e3a2e'} : {}));
function uniqueOv(name, base, pal){ const o = ARMOR_OV[base]; ARMOR_OV[name] = {ox:o.ox, oy:o.oy, rows:o.rows, img:{unique:bakeRows(o.rows, Object.assign({k:OUT, s:STUD.unique}, pal))}}; }
uniqueOv('uelfcrown', 'urrhelm', {L:'#d8c070', l:'#fff0a0', d:'#7a5a1a'});
uniqueOv('ulightrobe', 'chest', {L:'#e8e4d8', l:'#fffbe8', d:'#a89a70'});
ART.elfshield = SP(paintSprite(12, 13, [
  {poly:[[0,0],[12,0],[12,6],[6,13],[0,6]], c:['#4a7a62', '#8ac8a8', '#e8d070']}, {poly:[[2,2],[10,2],[10,6],[6,10],[2,6]], c:['#1c3028', '#2e4a3e', '#4a7a62'], tex:99},
  {e:[6,5,1.6,1.6], c:['#c8962e', '#ffe08a', '#ffffff']},
]), 6, 6);
ART.holyaegis = SP(paintSprite(12, 13, [
  {poly:[[0,0],[12,0],[12,6],[6,13],[0,6]], c:['#a89a70', '#e8c050', '#ffe888']}, {poly:[[2,2],[10,2],[10,6],[6,10],[2,6]], c:['#c8c4b0', '#e8e4d8', '#fffbe8'], tex:100},
  {e:[6,5,1.8,1.8], c:['#ffd23a', '#fff070', '#ffffff']},
]), 6, 6);
// botín: cofres con poca probabilidad y los elfos del templo (Trapis no los vende, como el resto del botín élfico)
for(const T of [LOOT.chestNormal, LOOT.chestRare]){ const r = T === LOOT.chestRare; T.table.push({w:r ? 1.4 : .5, id:'elfboots', lvl:9}, {w:r ? 1.4 : .5, id:'elfshield', lvl:9}, {w:r ? 3 : 1.2, id:'elfbread', n:[1, 2], lvl:9}); }
function templeDrop(m){
  const rk = m.rarity === 'rare' ? 2 : m.rarity === 'magic' ? 1 : 0, bonus = {normal:0, magic:.5, rare:1.2}[m.rarity] || 0;
  if(Math.random() < [.06, .13, .26][rk]){
    const id = wpick([{w:40, id:'elfbread'}, {w:30, id:'elfboots'}, {w:30, id:'elfshield'}]).id;
    dropItem(m.x, m.y, mkItem(id, id === 'elfbread' ? randi(1, 2) : 1, 9, bonus)); addText(m.x, m.y-m.r*2-22, '¡Botín élfico!', '#9affc0', 7, -20);
  }
}

// ---------- monstruos ----------
Object.assign(MONSTERS, {
  tfirearcher: {name:'Arquero élfico de fuego', art:'tfirearcher', ai:'archer', hp:430, dmg:66, spd:80, r:8, xp:110, reach:0, prep:.55, range:[170, 270], firearrow:true, temple:true},
  tmage:       {name:'Mago élfico eléctrico', art:'tmage', ai:'archer', hp:380, dmg:60, spd:72, r:8, xp:120, reach:0, prep:.7, range:[150, 250], zap:true, temple:true},
  tknight:     {name:'Guerrero élfico pesado', art:'tknight', ai:'walk', hp:950, dmg:98, spd:68, r:11, xp:160, reach:32, prep:.65, crit:.3, temple:true},
  elfmage:     {name:'El brujo élfico', art:'elfmage', ai:'elfmage', hp:6800, dmg:64, spd:74, r:15, xp:900, reach:0, prep:.6, boss:true, uniques:['elfcrown', 'stormstaff', 'lightrobe', 'holyaegis']},
});
Object.assign(RARE_PREFIX, {tfirearcher:['Flecha Ardiente', 'Ojo de Brasa', 'Saeta Roja', 'Ceniza Viva'], tmage:['Tormenta', 'Chispa Viva', 'Trueno', 'Relámpago'],
  tknight:['Muro de Acero', 'Filo Sagrado', 'Centinela Áureo', 'Ejecutor'], elfmage:['Brujo']});
Object.assign(MON_COLORS, {tfirearcher:['#7a2a14', '#c8581e', '#ffd040'], tmage:['#2a2a8a', '#5a6af0', '#ffe84a'], tknight:['#5a5e6a', '#c8ccd8', '#ffffff'], elfmage:['#a8a080', '#fffbe8', '#ffe84a']});

// ---------- el brujo élfico: rayos que debilitan y descargas rápidas en el suelo ----------
function updateElfMage(m, dt){
  const sc = G.sc, MD = MONSTERS[m.type];
  m.walk += dt*3;
  if(!m.awake){
    if((inBossRoom(P.x, P.y) && !P.dead) || m.hp < m.maxHp){
      m.awake = true; m.atkCd = 1.6; G.bossFight = m;
      toast('¡El brujo élfico ha despertado!', 3); sfx('howl'); G.shake = Math.max(G.shake, 7); ring(m.x, m.y-30, 60, '#ffe84a', .5);
    }
    return;
  }
  if(P.dead) return;
  if(!m.phase2 && m.hp < m.maxHp*.5){
    m.phase2 = true; toast('¡El brujo élfico se desata!', 3); G.flash = {x:m.x, y:m.y-30, t:.4}; G.shake = Math.max(G.shake, 8);
    burst(m.x, m.y-30, 40, ['#ffe84a', '#ffffff', '#a8c8ff'], [80, 240], [.5, 1], 0); sfx('howl');
  }
  const dx = P.x-m.x, dy = P.y-m.y, d = Math.hypot(dx, dy) || 1;
  m.face = dx > 0 ? 1 : -1;
  const spd = MD.spd * (m.phase2 ? 1.3 : 1);
  let cx = 0, cy = 0;
  if(d > 300){ cx = dx/d*spd; cy = dy/d*spd; }          // mantiene la distancia: se acerca si está lejos, se aleja si está cerca y, en medio, da vueltas
  else if(d < 170){ cx = -dx/d*spd; cy = -dy/d*spd; }
  else { const s = m.strafe = m.strafe || 1; cx = -dy/d*spd*.5*s; cy = dx/d*spd*.5*s; if(Math.random() < dt*.3) m.strafe = -s; }
  if(m.prepT > 0){ cx *= .1; cy *= .1; if(Math.random() < .8) G.parts.push({x:m.x + rand(-14, 14), y:m.y - rand(10, 44), vx:0, vy:-26, life:.3, max:.3, size:2, col:pick(['#ffe84a', '#ffffff'])}); }
  moveCircle(sc, m, (cx + m.vx)*dt, (cy + m.vy)*dt); m.vx *= .9; m.vy *= .9;
  if(m.prepT > 0){ m.prepT -= dt; if(m.prepT <= 0) elfCast(m); return; }
  if(m.atkCd <= 0){
    const r = Math.random(), k = m.phase2 && Math.random() < .25 ? 'blink' : r < .35 ? 'bolt' : r < .7 ? 'storm' : 'nova';
    m.cast = k; m.prepT = {bolt:.55, storm:.5, nova:.75, blink:.4}[k]; m.atkCd = 99;
    addText(m.x, m.y-90, {bolt:'Relámpago', storm:'Tormenta', nova:'Descarga', blink:'Salto de rayo'}[k], '#fff070', 8, -20);
  }
}
function elfBolts(m, dmg){
  const n = m.phase2 ? 5 : 3, base = Math.atan2(P.y-14-(m.y-34), P.x-m.x);
  for(let i = 0; i < n; i++){ const a = base + (i - (n-1)/2)*.2;
    G.projs.push({x:m.x + m.face*12, y:m.y-34, vx:Math.cos(a)*400, vy:Math.sin(a)*400, life:1.3, kind:'bolt', from:'mon', mon:m, dmg:dmg*.9, r:5, weak:6, col:['#a08800', '#ffe84a', '#ffffff']}); }
  sfx('boom');
}
function elfCast(m){
  const dmg = m.curDmg || m.dmg;
  m.atkCd = m.phase2 ? rand(1.3, 1.9) : rand(2, 2.8);
  if(m.cast === 'blink'){   // se teletransporta cerca del héroe y dispara
    ring(m.x, m.y-20, 40, '#fff070', .3);
    const a = Math.random()*Math.PI*2, p = freeSpotNear(P.x + Math.cos(a)*150, P.y + Math.sin(a)*150, 14); m.x = p.x; m.y = p.y;
    ring(m.x, m.y-20, 40, '#fff070', .3); burst(m.x, m.y-30, 18, ['#ffe84a', '#ffffff'], [40, 160], [.3, .6], 0);
    m.cast = 'bolt';
  }
  if(m.cast === 'bolt') elfBolts(m, dmg);
  else if(m.cast === 'storm'){   // descargas sobre la posición del héroe, una tras otra y muy rápidas
    const n = m.phase2 ? 8 : 5;
    for(let i = 0; i < n; i++){
      const jx = i ? rand(-80, 80) : 0, jy = i ? rand(-60, 60) : 0;
      G.hazards.push({type:'zap', x:P.x + (P.vx||0)*.15*i + jx, y:P.y + (P.vy||0)*.15*i + jy, r:44, delay:i*.2, life:.55, max:.55, dmg:dmg*1.3, mon:m, weak:5});
    }
  } else if(m.cast === 'nova'){   // dos anillos de descargas alrededor del brujo (se esquivan entre ellos o pegado al brujo)
    const rings = m.phase2 ? [80, 170, 270] : [90, 200];
    rings.forEach((rad, j) => { const n = Math.round(rad/20); for(let i = 0; i < n; i++){ const a = i/n*Math.PI*2 + j*.4;
      G.hazards.push({type:'zap', x:m.x + Math.cos(a)*rad, y:m.y + Math.sin(a)*rad*.8, r:34, delay:.1 + j*.45, life:.6, max:.6, dmg:dmg*1.1, mon:m, weak:0}); } });
  }
}
function zapStrike(h){
  G.shake = Math.max(G.shake, 5); sfx('boom');
  for(let i = 0; i < 10; i++) G.parts.push({x:h.x + rand(-3, 3), y:h.y - i*14, vx:0, vy:0, life:.18, max:.18, size:3, col:i % 2 ? '#ffffff' : '#ffe84a'});
  burst(h.x, h.y-6, 22, ['#ffe84a', '#ffffff', '#a8c8ff'], [60, 220], [.25, .6], 0); ring(h.x, h.y-4, h.r, '#ffe84a', .3);
  if(!P.dead && Math.hypot(P.x-h.x, (P.y-h.y)*1.2) < h.r && damagePlayer(h.dmg, h.mon) && h.weak) P.weakT = Math.max(P.weakT || 0, h.weak);
  for(const p of G.pets) if(Math.hypot(p.x-h.x, p.y-h.y) < h.r) damagePet(p, h.dmg*.6, null, false, true);
}
function drawZap(h){
  if(h.delay > 0){ if(Math.floor(G.t*8) % 2) pixRing(h.x, h.y, h.r*.5, h.r*.5*.45, '#a08800', 14); return; }
  const t = 1 - h.life/h.max;
  pixRing(h.x, h.y, h.r, h.r*.45, Math.floor(G.t*14) % 2 ? '#ffe84a' : '#ffffff', 28);
  pixRing(h.x, h.y, h.r*t, h.r*.45*t, '#fff8b0', 20);
}

// ---------- mapa: avenida de columnas hasta la plaza sagrada del brujo ----------
const TP_GRASS = ['#14241a', '#1a2d20', '#223a28', '#2c4832'].map(hex), TP_MARBLE = ['#7a766a', '#9a968a', '#b4b0a2', '#cfcbbb'].map(hex), TP_GROUT = hex('#5a574e');
function buildTemple(seed){
  const R = rng(seed), rr = (a, c) => a + R()*(c-a);
  const S = 1300, sc = baseScene('temple', 'El templo sagrado', -S, -S, S, S);
  sc.kind = 'raid'; sc.darkness = .92; sc.seed = seed; sc.lvl = 9;
  sc.spawn = {x:0, y:S-170};
  sc.horse = {x:-34, y:S-150, dir:1};
  addCollider(sc, {t:'r', x:-58, y:S-157, w:46, h:12});
  const AX = 0, AY = -860, AR = 250, PLAZAS = [700, 280, -120];
  sc.bossRoom = {x:AX-AR, y:AY-AR, w:AR*2, h:AR*2 + 30};
  sc.bossSpawn = {x:AX, y:AY - 60};
  const avenueD = (x, y) => y > AY + AR - 20 ? Math.abs(x) - 60 : 1e9;
  const plazaD = (x, y) => Math.min(...PLAZAS.map(py => Math.hypot(x, y - py) - 150));
  const arenaD = (x, y) => Math.hypot(x - AX, y - AY) - (AR + 40);
  const sacredD = (x, y) => Math.min(avenueD(x, y), plazaD(x, y), arenaD(x, y));
  sc.ground = (x, y) => {
    if(Math.abs(x) > S || Math.abs(y) > S) return TP_GRASS[0];
    const sd = sacredD(x, y) + (vnoise(x/30, y/30, 1201) - .5)*8;
    if(sd < 0){   // mármol en losas con juntas
      if(((x % 24) + 24) % 24 < 1 || ((y % 24) + 24) % 24 < 1) return TP_GROUT;
      const tile = (Math.floor(x/24) + Math.floor(y/24)) & 1;
      return TP_MARBLE[tq(vnoise(x/9, y/9, 1202)*.45 + hash(x, y, 1203)*.2 + tile*.25, x, y, 4)];
    }
    let t = tq((vnoise(x/18, y/18, 1204)*.55 + vnoise(x/5, y/5, 1205)*.3 + hash(x, y, 1206)*.15 - .2)/.6, x, y, 4);
    if(hash(x, y, 1207) > .988) t = 3; else if(hash(x, y-1, 1207) > .988) t = 0;
    return TP_GRASS[t];
  };
  const free = (x, y, r) => {
    if(Math.abs(x) > S-60 || Math.abs(y) > S-60) return false;
    if(Math.hypot(x-sc.spawn.x, y-sc.spawn.y) < 110 || Math.hypot(x-sc.horse.x, y-sc.horse.y) < 50) return false;
    return !blocked(sc, x, y, r+6);
  };
  const point = (r, minSpawn = 0, sacredOk = false) => {
    for(let i = 0; i < 200; i++){
      const x = Math.round(rr(-S+80, S-80)), y = Math.round(rr(-S+80, S-80));
      if(Math.hypot(x-sc.spawn.x, y-sc.spawn.y) < minSpawn) continue;
      if(!sacredOk && sacredD(x, y) < 24) continue;
      if(sacredOk && Math.hypot(x-AX, y-AY) < AR + 20) continue;   // nunca dentro de la plaza del jefe
      if(free(x, y, r)) return {x, y};
    }
    return null;
  };
  const brazier = (x, y) => { const b2 = propSprite(sc, ART.brazier, x, y, {t:'c', x, y:y-3, r:6}); b2.draw = function(){ drawSP(ART.brazier, x, y); drawFlames(x, y-11, .5); }; sc.lights.push({x, y:y-14, r:130, a:.8, warm:true, flick:.12}); };
  // columnas a los lados de la avenida (con huecos en las plazas) y braseros
  for(let y = S-300, i = 0; y > AY + AR + 10; y -= 70, i++){
    if(PLAZAS.some(py => Math.abs(y - py) < 160)) continue;
    for(const sx of [-1, 1]){ const x = sx*78; if(i % 3 === 1) brazier(x, y); else propSprite(sc, ART.pillar, x, y, {t:'c', x, y:y-4, r:8}, [9, 3]); }
  }
  // estatuas en las plazas
  for(const py of PLAZAS) for(const sx of [-1, 1]) propSprite(sc, ART.statue, sx*118, py - 40, {t:'c', x:sx*118, y:py - 44, r:9}, [10, 3]);
  // plaza del brujo: anillo de columnas con una puerta al sur
  const nP = Math.round(2*Math.PI*AR/22);
  for(let i = 0; i < nP; i++){
    const a = i/nP*Math.PI*2, px = Math.round(AX + Math.cos(a)*AR), py = Math.round(AY + Math.sin(a)*AR*.9);
    if(py > AY + AR*.6 && Math.abs(px - AX) < 52) continue;   // puerta
    if(i % 9 === 4) brazier(px, py); else propSprite(sc, ART.pillar, px, py, {t:'c', x:px, y:py-4, r:8}, [9, 3]);
  }
  sc.lights.push({x:AX, y:AY, r:260, a:.55, warm:false, flick:.06});
  // bosque sagrado alrededor y ruinas
  let sd = seed*17;
  for(let i = 0; i < 230; i++){ const p = point(12, 130); if(p) propTree(sc, p.x, p.y, ++sd, false); }
  for(let i = 0; i < 40; i++){ const p = point(12, 130); if(p) propTree(sc, p.x, p.y, ++sd, true); }
  for(let i = 0; i < 50; i++){ const p = point(9, 120); if(p) propBush(sc, p.x, p.y, ++sd); }
  for(let i = 0; i < 18; i++){ const p = point(12, 130); if(p) propRock(sc, p.x, p.y, ++sd); }
  for(let i = 0; i < 14; i++){ const p = point(12, 200); if(p) propSprite(sc, ART.pillar, p.x, p.y, {t:'c', x:p.x, y:p.y-4, r:8}, [9, 3]); }   // columnas caídas del templo antiguo
  for(let i = 0; i < 8; i++){ const p = point(12, 250); if(p) propSprite(sc, ART.statue, p.x, p.y, {t:'c', x:p.x, y:p.y-4, r:9}, [10, 3]); }
  for(let i = 0; i < 60; i++){ const p = point(4, 140); if(p) propGlowshroom(sc, p.x, p.y); }
  sc.wisps = []; for(let i = 0; i < 20; i++){ const p = point(4, 200); if(p) sc.wisps.push({x:p.x, y:p.y, hx:p.x, hy:p.y, ph:R()*6}); }
  for(let i = 0; i < 1300; i++){ const x = Math.round(rr(-S, S)), y = Math.round(rr(-S, S)); if(sacredD(x, y) < 4) continue; sc.decos.push({x, y, k:R() < .85 ? 'tuft' : 'flower', v:Math.floor(R()*3)}); }
  sc.houses = [];
  // jaulas (cuando existan las mascotas de esta expedición)
  const pets = shuffle(petsOfExp(9).filter(id => R() < CAGE_CHANCE[PETS[id].rarity]), R), cagePts = [];
  for(const id of pets){
    let p = null;
    for(let i = 0; !p && i < 80; i++){ const q = point(14, 380, true); if(q && cagePts.every(c => Math.hypot(c.x-q.x, c.y-q.y) > 220)) p = q; }
    if(!p) continue;
    cagePts.push(p);
    const cage = {x:Math.round(p.x), y:Math.round(p.y), pet:null, open:false};
    cage.col = addCollider(sc, {t:'r', x:cage.x-12, y:cage.y-8, w:24, h:8});
    sc.cages.push(cage);
  }
  const addChest = (p, rare) => { if(!p) return; const ch = {x:p.x, y:p.y, rare, open:false}; ch.col = addCollider(sc, {t:'r', x:p.x-9, y:p.y-8, w:18, h:8}); sc.chests.push(ch); };
  for(const py of PLAZAS) addChest({x:Math.round(rr(-60, 60)), y:py + 60}, R() < .3);
  for(let i = 0; i < 10; i++) addChest(point(10, 300, true), false);
  for(let i = 0; i < 4; i++) addChest(point(10, 900, true), true);
  addChest({x:AX - 150, y:AY + 40}, true); addChest({x:AX + 150, y:AY + 40}, true);
  // guardia del templo: arqueros de fuego, magos eléctricos y guerreros pesados
  const rar = far => { const roll = R(); return roll < .035 + far*.07 ? 'rare' : roll < .2 + far*.18 ? 'magic' : 'normal'; };
  const mkPack = (types, n, p) => {
    const far = clamp(Math.hypot(p.x-sc.spawn.x, p.y-sc.spawn.y)/2300, 0, 1), pack = []; let hasRare = false;
    for(let k = 0; k < n; k++){ let r = rar(far); if(r === 'rare' && hasRare) r = 'magic'; if(r === 'rare') hasRare = true; pack.push({type:types[Math.floor(R()*types.length)], rarity:r}); }
    sc.monsterSpawns.push({x:p.x, y:p.y, pack});
  };
  for(let i = 0; i < 10; i++){ const p = point(16, 420, true); if(p) mkPack(['tfirearcher', 'tfirearcher', 'tmage'], 2 + Math.floor(R()*2), p); }
  for(let i = 0; i < 8; i++){ const p = point(16, 420, true); if(p) mkPack(['tmage', 'tmage', 'tknight'], 2 + Math.floor(R()*2), p); }
  for(let i = 0; i < 10; i++){ const p = point(16, 420, true); if(p) mkPack(['tknight', 'tknight', 'tfirearcher'], 2 + Math.floor(R()*2), p); }
  for(const py of PLAZAS) sc.monsterSpawns.push({x:Math.round(rr(-70, 70)), y:py, pack:[{type:'tknight', rarity:R() < .35 ? 'magic' : 'normal'}, {type:'tfirearcher', rarity:'normal'}, {type:'tmage', rarity:'normal'}]});
  return sc;
}

// =====================================================================
//  Mascotas del templo sagrado (arte por formas; los datos están en PETS, data.js)
// =====================================================================
function petQuad(f, o){
  const c = o.pal, dk = o.dk || '#1a1410', lg = f === 2 ? 2 : 0, L = legs(f, [8, 19, 11, 21], 15, 23, c.slice(0, 3), dk, o.legW || 2.2), s = [];
  if(o.tail === 'fox') s.push({e:[4, 13, 5, 3.4], c, tex:o.tex + 1}, {e:[1.5, 13, 2.2, 2], c:o.tip || '#ffffff'});
  else if(o.tail === 'lion') s.push({l:[6, 13, 1, 9, 1.6], c:c.slice(0, 3)}, {e:[1, 8, 2.2, 2.6], c:o.mane || c});
  else s.push({l:[6, 13, 2, 10, 2], c:c.slice(0, 3)});
  s.push(...L.far, {e:[15, 14, 10.5, 6], c, tex:o.tex}, ...L.near);
  if(o.wool) for(const [x, y] of [[9, 10], [14, 9], [19, 10], [11, 14], [17, 14], [22, 13], [13, 12]]) s.push({e:[x, y, 3.4, 3.2], c:o.wool});
  if(o.spots) s.push({p:o.spots.map(([x, y]) => [x, y, o.spotCol])});
  if(o.mane) s.push({e:[24, 11, 6.4, 6.6], c:o.mane, tex:o.tex + 2});
  s.push({e:[27 + lg, 10, 4.6, 4.2], c:o.face || c}, {e:[31 + lg, 12, 2.6, 2], c:o.snout || c.slice(1)});
  if(o.ears === 'pointy') s.push({poly:[[24 + lg, 7], [25 + lg, 2], [28 + lg, 6]], c:c.slice(1)}, {poly:[[28 + lg, 6], [30 + lg, 2], [31 + lg, 7]], c:c.slice(1)});
  else if(o.ears === 'round') s.push({e:[25 + lg, 6, 2, 2], c}, {e:[30 + lg, 6, 2, 2], c});
  else if(o.ears === 'horns') s.push({l:[25 + lg, 6, 21 + lg, 3, 2], c:o.horn}, {l:[21 + lg, 3, 23 + lg, 8, 1.6], c:o.horn}, {l:[29 + lg, 6, 31 + lg, 2, 1.6], c:o.horn});
  else if(o.ears === 'antlers') s.push({l:[26 + lg, 6, 24 + lg, 1, 1.2], c:o.horn}, {l:[24 + lg, 3, 21 + lg, 2, 1], c:o.horn}, {l:[28 + lg, 6, 30 + lg, 0, 1.2], c:o.horn}, {l:[30 + lg, 3, 33 + lg, 2, 1], c:o.horn}, {p:[[24 + lg, 1, '#ffffff'], [30 + lg, 0, '#ffffff'], [21 + lg, 2, '#ffffff'], [33 + lg, 2, '#ffffff']]});
  if(o.collar) s.push({r:[24 + lg, 13, 5, 1], c:o.collar});
  if(o.extra) s.push(...o.extra(lg));
  s.push({p:[[29 + lg, 9, o.eye || '#201010'], [33 + lg, 11, '#100808']]});
  return s;
}
function petBird(f, o){
  const c = o.pal, wy = f === 1 ? 1 : f === 2 ? 14 : 7, s = [];
  s.push({poly:[[11, 11], [8, wy], [17, wy + 1], [15, 11]], c:c.slice(0, 3)});                     // ala lejana
  if(o.long){   // grulla: cuello largo
    s.push({poly:[[6, 12], [0, 15], [3, 11]], c:c.slice(0, 3)}, {e:[12, 12, 6, 3.6], c, tex:o.tex}, {l:[16, 11, 20, 5, 2], c:c.slice(1)}, {e:[21, 4.5, 2.6, 2.2], c}, {l:[23, 4.5, 29, 5.6, 1.1], c:'#e8c070'},
      {l:[11, 14, 10, 20, 1], c:'#6a6a70'}, {l:[14, 14, 15, 20, 1], c:'#6a6a70'}, {p:[[21, 3, '#e03030'], [22, 3, '#e03030'], [22, 4, '#101010']]});
  } else {
    s.push({poly:[[8, 12], [1, 15], [2, 10], [5, 9]], c:c.slice(0, 3)}, {e:[13, 12, 6.4, 4.4], c, tex:o.tex}, {e:[19, 8, 3.4, 3.2], c}, {poly:[[21, 7], [25, 9], [21, 10]], c:o.beak || '#ffb060'},
      {p:[[20, 7, '#101010'], [12, 15, c[2]]]});
  }
  s.push({poly:[[12, 11], [9, wy + 3], [18, wy + 4], [16, 11]], c});                                // ala cercana
  return s;
}
function petMoth(f, o){
  const c = o.pal, up = f === 1 ? -2 : f === 2 ? 3 : 0;
  return [ {poly:[[10, 9], [3, 2 + up], [1, 8 + up], [9, 11]], c:c.slice(0, 3)}, {poly:[[10, 11], [3, 15 - up], [5, 17 - up], [10, 13]], c:c.slice(0, 3)},
    {poly:[[12, 9], [19, 2 + up], [21, 8 + up], [13, 11]], c}, {poly:[[12, 11], [19, 15 - up], [17, 17 - up], [12, 13]], c},
    {e:[11, 10.5, 1.6, 4], c:['#3a2a10', '#6a4a20', '#a07a3a']}, {l:[11, 6, 9, 2, .8], c:'#6a4a20'}, {l:[11, 6, 13, 2, .8], c:'#6a4a20'},
    {p:[[5, 6 + up, '#ffffff'], [17, 6 + up, '#ffffff'], [7, 14 - up, o.glow], [16, 14 - up, o.glow]]} ];
}
function petScarab(f, o){
  const c = o.pal, wy = f === 1 ? 1 : f === 2 ? 7 : 4;
  return [ {poly:[[8, 7], [3, wy], [11, wy + 1], [11, 8]], c:['#e8f0ff', '#ffffff']}, {e:[10, 9, 5.4, 4], c, tex:o.tex}, {l:[10, 5.5, 10, 12.5, .8], c:c.slice(0, 2)}, {e:[16, 8, 2.6, 2.2], c:c.slice(1)},
    {l:[7, 12, 5, 14, .8], c:'#3a2a10'}, {l:[10, 12, 10, 14, .8], c:'#3a2a10'}, {l:[13, 12, 15, 14, .8], c:'#3a2a10'}, {poly:[[17, 6], [19, 3], [18, 7]], c:'#6a4a10'}, {p:[[16, 7, '#101010'], [9, 6, '#fff8c0']]} ];
}
function petPhoenix(f, o){
  const wy = f === 1 ? 0 : f === 2 ? 17 : 8, fl = ['#a02010', '#e0501a', '#ff9a30', '#ffe070'];
  return [ {poly:[[12, 13], [4, 17], [-1, 22], [6, 19], [2, 25], [10, 20], [14, 15]], c:fl.slice(0, 3)}, {poly:[[10, 14], [3, 21], [9, 18]], c:fl.slice(1)},
    {poly:[[14, 11], [8, wy], [22, wy + 1], [20, 11]], c:fl.slice(0, 3)}, {poly:[[14, 12], [10, wy + 4], [21, wy + 5], [19, 12]], c:fl},
    {e:[17, 14, 7, 4.8], c:fl, tex:o.tex}, {e:[24, 10, 3.8, 3.4], c:fl.slice(1)}, {poly:[[27, 9], [32, 11], [27, 12]], c:['#ffd060', '#ffffff']},
    {poly:[[21, 6], [22, 1], [25, 5]], c:fl.slice(1)}, {poly:[[24, 6], [27, 2], [28, 7]], c:fl.slice(2)}, {l:[18, 18, 17, 22, 1], c:'#6a4a10'}, {l:[21, 18, 22, 22, 1], c:'#6a4a10'},
    {p:[[25, 9, '#ffffff'], [26, 9, '#101010'], [16, 12, '#fff8c0'], [19, 14, '#fff8c0']]},
    {poly:[[14, 11], [11, wy + 2], [16, wy + 3]], c:fl.slice(2)} ];
}
Object.assign(PET_SHAPES, {
  paloma:    {w:28, h:20, ax:13, ay:19, fly:true, shapes:f => petBird(f, {pal:['#8a8a96', '#b8b8c6', '#e0e0ee', '#ffffff'], tex:901})},
  cordero:   {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#6a4a1c', '#a07a28', '#d0a440', '#f0c860'], wool:['#a07a28', '#d0a440', '#f0c860', '#fff0a0'], face:['#5a3a14', '#8a6420', '#b08a38'], snout:['#8a6420', '#b08a38'], ears:'round', tail:'short', tex:911, dk:'#3a2408'})},
  gatotemplo:{w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#b8b4a8', '#e0dcd0', '#f4f0e8', '#ffffff'], ears:'pointy', collar:['#c8962e', '#ffd23a'], tail:'long', tex:921, dk:'#6a665c', eye:'#3aa05a'})},
  grulla:    {w:30, h:22, ax:14, ay:21, fly:true, shapes:f => petBird(f, {pal:['#9aa0b0', '#c8ccd8', '#e8ecf4', '#ffffff'], long:true, tex:931})},
  cervatillo:{w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#c8c0b0', '#e8e0d0', '#f8f4ea', '#ffffff'], ears:'pointy', spots:[[10, 11], [15, 10], [20, 11], [13, 14], [18, 13]], spotCol:'#ffffff', tail:'short', tex:941, dk:'#8a8478', legW:1.8})},
  incienso:  {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#8a5a8a', '#b080b0', '#d8b0d8', '#f4e0f4'], ears:'pointy', tail:'fox', tip:'#ffffff', tex:951, dk:'#3a243a',
              extra:lg => [{p:[[29 + lg, 4, '#e8dcf0'], [31 + lg, 2, '#d0c0e0'], [30 + lg, 0, '#e8dcf0'], [33 + lg, 3, '#d0c0e0']]}]})},
  luminica:  {w:22, h:18, ax:11, ay:17, fly:true, glow:'#9ad8ff', shapes:f => petMoth(f, {pal:['#2a78b8', '#5ab0e8', '#a8e0ff', '#e8faff'], glow:'#ffe070'})},
  escarasagrado:{w:22, h:15, ax:11, ay:14, fly:true, shapes:f => petScarab(f, {pal:['#8a6a10', '#c8a020', '#ffd23a', '#fff0a0'], tex:961})},
  leon:      {w:40, h:26, ax:18, ay:25, shapes:f => petQuad(f, {pal:['#8a8a84', '#b4b4ae', '#d8d8d2', '#f0f0ea'], mane:['#9a9a94', '#c0c0ba', '#e0e0da', '#f8f8f4'], ears:'round', tail:'lion', tex:971, dk:'#4a4a46', legW:2.8, eye:'#e0a020',
              extra:lg => [{l:[10, 9, 13, 12, .6], c:'#6a6a64'}, {l:[19, 11, 17, 15, .6], c:'#6a6a64'}]})},
  ciervoalba:{w:38, h:27, ax:17, ay:26, glow:'#fff0a0', shapes:f => petQuad(f, {pal:['#a07a30', '#d0a850', '#f0d890', '#fff4c8'], ears:'antlers', horn:['#d8c070', '#fff8c0'], tail:'short', tex:981, dk:'#6a4a18', legW:1.8})},
  fenix:     {w:34, h:26, ax:15, ay:21, fly:true, glow:'#ffd070', shapes:f => petPhoenix(f, {tex:991})},
});
for(const id of ['paloma', 'cordero', 'gatotemplo', 'grulla', 'cervatillo', 'incienso', 'luminica', 'escarasagrado', 'leon', 'ciervoalba', 'fenix']){
  const dd = PET_SHAPES[id];
  PET_ART[id] = {fly:!!dd.fly, glow:dd.glow, fr:[0, 1, 2].map(f => SP(paintSprite(dd.w, dd.h, dd.shapes(f)), dd.ax, dd.ay))};
  PET_ART[id].flash = PET_ART[id].fr.map(s => {
    const c = document.createElement('canvas'); c.width = s.c.width; c.height = s.c.height;
    const g = c.getContext('2d'); g.drawImage(s.c, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    return {c, ax:s.ax, ay:s.ay};
  });
}
