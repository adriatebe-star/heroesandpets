'use strict';
// =====================================================================
//  HUD: bufos de las mascotas que afectan al héroe (iconos a la izquierda) y efectos del farolillo y del talismán
// =====================================================================
// afijos de mascota que afectan al personaje (norma del usuario: si una mascota equipada tiene uno, se muestra su icono)
const HERO_AFFIX_FX = {
  curandera:   {ic:'heart',  col:'#7ad86a'}, vampirica:   {ic:'drop',   col:'#e0505a'}, guardiana:   {ic:'shield', col:'#8ab8ff'},
  inspiradora: {ic:'bolt',   col:'#ffb040'}, ligera:      {ic:'wing',   col:'#c8e8ff'}, luciernaga:  {ic:'sun',    col:'#ffe070'},
  alba:        {ic:'sun',    col:'#fff0b0'}, luna:        {ic:'moon',   col:'#b8c8ff'}, eclipse:     {ic:'moon',   col:'#c090ff'},
  crin:        {ic:'flame',  col:'#ff8a3a'}, buscatesoros:{ic:'coin',   col:'#ffd84a'}, avariciosa:  {ic:'coin',   col:'#ffe08a'},
  cazarrecompensas:{ic:'star', col:'#ffd070'}, recolectora:{ic:'arrow', col:'#d8c8a0'}, olfato:      {ic:'eye',    col:'#a8e8a0'},
  rastreador:  {ic:'eye',    col:'#7ae09a'},
};
const GEM_SHORT = {ruby:'+1,5 vida/s · quema a los enemigos', emerald:'+1,5 vida/s a ti y a tus mascotas', amethyst:'+50 aceite · más área de luz', topaz:'+100 aceite · −5 % de daño recibido', sapphire:'Más área de luz · +15 % de velocidad',
  aquamarine:'Más área de luz · puede congelar', opal:'+100 aceite · +0,6 aceite/s', obsidian:'Sin efecto de engarce', diamond:'+50 aceite · luz ×2 · +0,9 aceite/s'};
ITEMS.luckclover.fx = 'Doble probabilidad de mascota brillante (se gasta al encontrarla)';

// iconos vectoriales pequeños, centrados en (x,y) y de tamaño s
function fxIcon(g, kind, x, y, s, col){
  g.save(); g.translate(x, y); g.scale(s/20, s/20); g.fillStyle = col; g.strokeStyle = col; g.lineWidth = 2.4; g.lineCap = 'round'; g.lineJoin = 'round';
  if(kind === 'heart'){ g.beginPath(); g.moveTo(0, 8); g.bezierCurveTo(-12, -1, -7, -10, 0, -4); g.bezierCurveTo(7, -10, 12, -1, 0, 8); g.fill(); }
  else if(kind === 'drop'){ g.beginPath(); g.moveTo(0, -9); g.bezierCurveTo(8, 0, 8, 9, 0, 9); g.bezierCurveTo(-8, 9, -8, 0, 0, -9); g.fill(); }
  else if(kind === 'shield'){ g.beginPath(); g.moveTo(-8, -8); g.lineTo(8, -8); g.lineTo(8, 1); g.quadraticCurveTo(8, 8, 0, 10); g.quadraticCurveTo(-8, 8, -8, 1); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-1, -6, 2, 12); }
  else if(kind === 'bolt'){ g.beginPath(); g.moveTo(3, -10); g.lineTo(-6, 2); g.lineTo(-1, 2); g.lineTo(-3, 10); g.lineTo(7, -3); g.lineTo(1, -3); g.closePath(); g.fill(); }
  else if(kind === 'wing'){ g.beginPath(); g.moveTo(-9, 6); g.quadraticCurveTo(-8, -8, 8, -9); g.quadraticCurveTo(2, -3, 4, 0); g.quadraticCurveTo(-1, 0, -2, 4); g.quadraticCurveTo(-5, 4, -9, 6); g.fill(); }
  else if(kind === 'sun'){ g.beginPath(); g.arc(0, 0, 5, 0, Math.PI*2); g.fill(); for(let i=0;i<8;i++){ const a = i*Math.PI/4; g.beginPath(); g.moveTo(Math.cos(a)*7.5, Math.sin(a)*7.5); g.lineTo(Math.cos(a)*10.5, Math.sin(a)*10.5); g.stroke(); } }
  else if(kind === 'moon'){ g.beginPath(); g.arc(0, 0, 9, 0, Math.PI*2); g.fill(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(5, -3, 8, 0, Math.PI*2); g.fill(); }
  else if(kind === 'flame'){ g.beginPath(); g.moveTo(0, -10); g.bezierCurveTo(10, -1, 8, 9, 0, 9); g.bezierCurveTo(-8, 9, -9, 2, -3, -3); g.bezierCurveTo(-2, 1, 0, 1, 0, -10); g.fill(); }
  else if(kind === 'coin'){ g.beginPath(); g.arc(0, 0, 9, 0, Math.PI*2); g.fill(); g.strokeStyle = 'rgba(80,50,0,.6)'; g.lineWidth = 1.6; g.beginPath(); g.arc(0, 0, 5.5, 0, Math.PI*2); g.stroke(); }
  else if(kind === 'star'){ g.beginPath(); for(let i=0;i<10;i++){ const r = i%2 ? 4.2 : 10, a = -Math.PI/2 + i*Math.PI/5; g.lineTo(Math.cos(a)*r, Math.sin(a)*r); } g.closePath(); g.fill(); }
  else if(kind === 'arrow'){ g.beginPath(); g.moveTo(-9, 9); g.lineTo(6, -6); g.stroke(); g.beginPath(); g.moveTo(9, -9); g.lineTo(1, -8); g.lineTo(8, -1); g.closePath(); g.fill(); }
  else if(kind === 'eye'){ g.beginPath(); g.moveTo(-10, 0); g.quadraticCurveTo(0, -10, 10, 0); g.quadraticCurveTo(0, 10, -10, 0); g.fill(); g.fillStyle = '#10141a'; g.beginPath(); g.arc(0, 0, 3.6, 0, Math.PI*2); g.fill(); }
  g.restore();
}
function fxWrap(g, text, maxW){
  const words = tr(String(text)).split(' '), lines = []; let cur = '';
  for(const w of words){ const t = cur ? cur + ' ' + w : w; if(g.measureText(t).width > maxW && cur){ lines.push(cur); cur = w; } else cur = t; }
  if(cur) lines.push(cur); return lines;
}
const fxBox = (g, x, y, w, h) => { g.fillStyle = 'rgba(14,10,14,.88)'; g.fillRect(x-3, y-3, w+6, h+6); g.fillStyle = '#5a4a36'; g.fillRect(x-1, y-1, w+2, h+2); g.fillStyle = '#1a1418'; g.fillRect(x, y, w, h); };

// columna de bufos a la izquierda: gema del farolillo, talismanes equipados y afijos de mascota que afectan al héroe; al pasar el cursor sale su descripción
// icono de alerta que parpadea 5 s en el centro cuando un arma o escudo está a punto de romperse
function drawWearAlert(){
  const a = G.wearAlert; if(!a) return;
  if(G.t > a.until){ G.wearAlert = null; return; }
  if(Math.floor((a.until - G.t)*4) % 2) return;
  const cx = W/2, cy = H/2 - 60, s = Math.round(40*S/3);
  ctx.save(); ctx.translate(cx, cy);
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.moveTo(0, -s*1.15); ctx.lineTo(s*1.2, s*.9); ctx.lineTo(-s*1.2, s*.9); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd23a'; ctx.strokeStyle = '#7a1414'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s*1.05, s*.8); ctx.lineTo(-s*1.05, s*.8); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#7a1414'; ctx.fillRect(-s*.09, -s*.4, s*.18, s*.6); ctx.fillRect(-s*.09, s*.3, s*.18, s*.18);
  ctx.restore();
  ctx.font = `${6.5*S}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textO(`¡${a.name} está a punto de romperse!`, cx, cy + s*1.5, '#ffd23a'); ctx.textAlign = 'left';
}
function drawPetBuffs(HS){
  drawWearAlert();
  const list = [];
  const lt = G.inv.equip.lantern;
  if(lt && lt.gem && GEMS[lt.gem]) list.push({img:ICONS['gem_' + lt.gem], name:GEMS[lt.gem].name, col:GEMS[lt.gem].col, desc:GEMS[lt.gem].desc, from:'Gema del farolillo'});
  for(const t of (G.inv.equip.tal || [])) if(t){ const d = ITEMS[t.id]; list.push({img:ICONS[d.icon], name:d.name, col:'#b8f0a0', desc:d.fx || d.desc, from:'Talismán equipado'}); }
  const fx = {};
  for(const p of G.pets){ if(!p.def || p.hp <= 0) continue; for(const a of p.def.affixes) if(HERO_AFFIX_FX[a] && PET_AFFIX[a]){ (fx[a] ??= {names:[]}).names.push(p.def.name); } }
  for(const k in fx) list.push({ic:HERO_AFFIX_FX[k].ic, name:PET_AFFIX[k].name, col:HERO_AFFIX_FX[k].col, desc:PET_AFFIX[k].desc, from:'De: ' + fx[k].names.join(', '), n:fx[k].names.length});
  if(!list.length) return;
  const sz = Math.round(46*HS), gap = Math.round(8*HS), x0 = 18, y0 = Math.round(112*HS) + (AUDIO.muted ? 24 : 0);
  let hover = null;
  list.forEach((e, i) => {
    const col = Math.floor(i/6), row = i%6, x = x0 + col*(sz + gap), y = y0 + row*(sz + gap);
    hudFrame(x, y, sz, sz); ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(x, y, sz, sz);
    if(e.img){ ctx.imageSmoothingEnabled = false; ctx.drawImage(e.img, x + sz*.15, y + sz*.15, sz*.7, sz*.7); } else fxIcon(ctx, e.ic, x + sz/2, y + sz/2, sz*.6, e.col);
    if(e.n > 1){ ctx.font = `${5*S}px ${FONT}`; ctx.textAlign = 'right'; textO('×' + e.n, x + sz - 3, y + sz - 8); ctx.textAlign = 'left'; }
    if(mouse.x >= x && mouse.x <= x + sz && mouse.y >= y && mouse.y <= y + sz) hover = {e, x, y, sz};
  });
  if(hover){
    const e = hover.e; ctx.font = `${5.5*S}px ${FONT}`;
    const w = Math.round(300*HS), body = fxWrap(ctx, e.desc, w - 24);
    const h = Math.round(24*HS + body.length*14*HS + 22*HS), bx = hover.x + hover.sz + 12, by = hover.y;
    fxBox(ctx, bx, by, w, h); ctx.textAlign = 'left';
    ctx.font = `${7*S}px ${FONT}`; textO(e.name, bx + 12, by + 14*HS, e.col);
    ctx.font = `${5.5*S}px ${FONT}`; body.forEach((l, i) => textO(l, bx + 12, by + 14*HS + 20*HS + i*14*HS, '#e8dcc0'));
    ctx.font = `${5*S}px ${FONT}`; textO(e.from, bx + 12, by + h - 12*HS, '#a89a80');
  }
}
