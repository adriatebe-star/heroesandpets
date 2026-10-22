'use strict';
// =====================================================================
//  Objetos del nivel 8: seta alucinógena, trébol de la suerte (botín) y pata de conejo
// =====================================================================
Object.assign(ICON_ROWS, {
  hallshroom: {pal:{R:'#b070ff', r:'#7a3ad0', q:'#3a1a78', w:'#f5f0e0', c:'#e8dcc0', C:'#b8a888'}, rows:ICON_ROWS.mushroom.rows},
  rabbitfoot: {pal:{F:'#f4efe6', f:'#c8bfae', p:'#e8a0b0', m:'#8a7a60'}, rows:["....kkkk....", "...kFFFFk...", "..kFFFFFFk..", "..kFFfFFFk..", "..kFFFFFfk..", "..kFFFFFFk..", "...kFFFfk...", "...kpFpFk...", "...kpppPk...", "....kmmk....", "....kmmk...."]},
});
for(const k of ['hallshroom', 'rabbitfoot']){ const d = ICON_ROWS[k]; ICONS[k] = bakeRows(d.rows, Object.assign({k:OUT}, d.pal)); }
Object.assign(ITEMS, {
  hallshroom: {name:'Seta alucinógena', icon:'hallshroom', stack:100, use:'hall', value:45,
    desc:'Durante 1 minuto el mundo se vuelve oscuro y el farolillo deja de iluminar, pero los monstruos brillan y unas hadas de colores te guían hasta las jaulas. +20 % de velocidad de movimiento. Tiene su propio hueco en el cinturón.'},
  rabbitfoot: {name:'Pata de conejo', icon:'rabbitfoot', slot:'talisman', value:260,
    desc:'Talismán. Mientras lo llevas equipado, las mascotas mágicas, raras y legendarias tienen el doble de probabilidad de salir de una jaula. Cuando encuentras una legendaria, la pata se desvanece.'},
});
ITEMS.rabbitfoot.fx = 'Doble probabilidad de mascotas mágicas, raras y legendarias (se gasta al encontrar una legendaria)';
ACTIONS.hallshroom = {name:'Comer seta alucinógena', trigger:true, item:['hallshroom']};
TRIGGER_ACTIONS.push('hallshroom');
QUICK_SLOTS.hallshroom = ['hallshroom']; QUICK_LABEL.hallshroom = 'Setas alucinógenas'; QUICK_HINT.hallshroom = 'alucinógena';
// botín a partir del nivel 8 (cofres y monstruos con muy poca probabilidad)
for(const T of [LOOT.chestNormal, LOOT.chestRare]){ const r = T === LOOT.chestRare; T.table.push({w:r ? 5 : 2.5, id:'hallshroom', lvl:8}, {w:r ? .5 : .12, id:'luckclover', lvl:8}, {w:r ? .5 : .12, id:'rabbitfoot', lvl:8}); }
LOOT.monsterTable.push({w:3, id:'hallshroom', lvl:8});
function luckDrop(m){   // trébol y pata de conejo: ≈ 0,15 / 0,4 / 1 % por muerte según rareza
  const rk = m.rarity === 'rare' ? 2 : m.rarity === 'magic' ? 1 : 0;
  if(Math.random() < [.0015, .004, .01][rk]){ const id = Math.random() < .5 ? 'luckclover' : 'rabbitfoot'; dropItem(m.x + rand(-8,8), m.y + rand(-4,4), mkItem(id)); addText(m.x, m.y-m.r*2-30, '¡' + ITEMS[id].name + '!', '#b8f0a0', 7, -20); }
}
SHOP.push({id:'hallshroom', n:1, price:60, tier:8});

// ---------- efecto de la seta alucinógena ----------
function eatHallShroom(){
  P.hallT = 60; toast('¡Seta alucinógena! Sigue a las hadas hasta las jaulas', 2.8); sfx('eat');
  burst(P.x, P.y-20, 16, ['#b070ff','#ff70d0','#70e0ff','#ffe070'], [30,100], [.4,.9], -60);
}
const hallHue = (t, o) => `hsl(${Math.round((t*90 + o) % 360)},95%,65%)`;
function updateFairies(dt){
  if(!(P.hallT > 0) || P.dead){ if(G.fairies && G.fairies.length) G.fairies = []; return; }
  P.hallT -= dt;
  const F = G.fairies || (G.fairies = []);
  while(F.length < 4) F.push({x:P.x + rand(-40,40), y:P.y + rand(-40,40), ph:Math.random()*6, n:F.length});
  let cage = null, cd = 1e9;
  for(const c of G.sc.cages || []) if(!c.open){ const d = Math.hypot(c.x-P.x, c.y-P.y); if(d < cd){ cd = d; cage = c; } }
  for(const f of F){
    f.ph += dt*2.4;
    let tx, ty;
    if(cage){
      const a = Math.atan2(cage.y-P.y, cage.x-P.x) + (f.n-1.5)*.18, d = Math.min(cd, 70 + f.n*16);
      tx = P.x + Math.cos(a)*d; ty = P.y + Math.sin(a)*d;
      if(cd < 90){ tx = cage.x + Math.cos(f.ph*.7 + f.n*1.6)*26; ty = cage.y - 16 + Math.sin(f.ph*.7 + f.n*1.6)*14; }
    } else { tx = P.x + Math.cos(f.ph*.5 + f.n*1.6)*60; ty = P.y - 14 + Math.sin(f.ph*.5 + f.n*1.6)*34; }
    tx += Math.sin(f.ph)*8; ty += Math.cos(f.ph*1.3)*6;
    const k = Math.min(1, dt*3.2); f.x += (tx-f.x)*k; f.y += (ty-f.y)*k;
  }
}
function fairyLights(L){
  if(!(P.hallT > 0)) return;
  for(const f of G.fairies || []) L.push({x:f.x, y:f.y-10, r:58, a:.8, warm:true, tint:`hsla(${Math.round((G.t*90 + f.n*90) % 360)},95%,60%,.22)`});
  for(const m of G.mons) if(!m.dying && Math.hypot(m.x-P.x, m.y-P.y) < 520) L.push({x:m.x, y:m.y-m.r, r:46 + m.r, a:.85, warm:true, tint:`hsla(${Math.round((G.t*60 + m.x*.3) % 360)},95%,60%,.2)`});
}
function drawFairy(f){
  const x = Math.round(f.x), y = Math.round(f.y - 10 + Math.sin(G.t*3 + f.ph)*2), col = hallHue(G.t, f.n*90);
  b.globalAlpha = .3; b.fillStyle = col; b.fillRect(x-3, y-3, 7, 7); b.globalAlpha = 1;
  b.fillStyle = col; b.fillRect(x-1, y-1, 3, 3); b.fillStyle = '#ffffff'; b.fillRect(x, y, 1, 1);
  const w = Math.sin(G.t*30 + f.n) > 0 ? 3 : 2;   // alas
  b.globalAlpha = .7; b.fillStyle = '#ffffff'; b.fillRect(x-1-w, y-2, w, 2); b.fillRect(x+2, y-2, w, 2); b.globalAlpha = 1;
  if(Math.random() < .5) G.parts.push({x:x+rand(-2,2), y:y+2, vx:rand(-8,8), vy:rand(6,16), life:.7, max:.7, size:1, col});
}
