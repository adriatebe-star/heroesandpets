'use strict';
// =====================================================================
//  Tragaperras de Alexandra (aprobada por el usuario): 3 carretes de 32 posiciones, 1 línea central, tirada de 200 de oro.
//  Retorno ≈ 108 %: pierdes ≈ 41 %, recuperas la tirada ≈ 44 % y ganas más de lo apostado ≈ 16 % (ver norma 160).
// =====================================================================
const SLOT_BET = 200;
ART.slotmachine = SP(paintSprite(30, 38, [
  {r:[2, 30, 22, 6], c:['#3a2a1a', '#5a4430']}, {r:[1, 8, 24, 24], c:['#6a1010', '#a82020', '#e03a3a'], tex:1501}, {r:[3, 0, 20, 9], c:['#a87a1a', '#e8b82a', '#ffe080']},
  {p:[[5, 4, '#ffffff'], [9, 4, '#ff5a5a'], [13, 4, '#ffffff'], [17, 4, '#ff5a5a'], [21, 4, '#ffffff']]}, {r:[4, 12, 18, 11], c:['#0a0606', '#1a1010']},
  {r:[5, 13, 5, 9], c:['#f4ecd8', '#ffffff']}, {r:[11, 13, 5, 9], c:['#f4ecd8', '#ffffff']}, {r:[17, 13, 4, 9], c:['#f4ecd8', '#ffffff']},
  {p:[[7, 16, '#d02020'], [8, 17, '#d02020'], [13, 16, '#20a040'], [14, 17, '#20a040'], [18, 17, '#2a5ac8'], [19, 18, '#2a5ac8']]}, {r:[8, 25, 10, 4], c:['#c8962e', '#ffe080']},
  {l:[25, 18, 29, 8, 1.6], c:['#c8ccd4', '#ffffff']}, {e:[29, 7, 2.6, 2.6], c:['#a01010', '#ff4a4a', '#ffd0d0']},
]), 15, 36);
const SLOT_SYM = [   // 0 cereza · 1 limón · 2 campana · 3 uvas · 4 estrella · 5 diamante · 6 siete
  {e:'🍒', w:9, n:'Cereza'}, {e:'🍋', w:8, n:'Limón'}, {e:'🔔', w:6, n:'Campana'}, {e:'🍇', w:4, n:'Uvas'}, {e:'⭐', w:3, n:'Estrella'}, {e:'💎', w:1, n:'Diamante'}, {e:'7', w:1, n:'Siete'},
];
const SLOT_TRIPLE = [5, 6, 10, 30, 60, 500, 1000];   // veces la apuesta
const SLOT_STRIP = (() => {   // carrete fijo de 32 casillas con los símbolos repartidos
  const a = new Array(32).fill(null), order = [0, 1, 2, 3, 4, 5, 6];
  for(const s of order){ for(let j = 0; j < SLOT_SYM[s].w; j++){ let p = Math.floor((j + .5)*32/SLOT_SYM[s].w + s*1.7) % 32; while(a[p] !== null) p = (p + 1) % 32; a[p] = s; } }
  return a;
})();
const SL = {open:false, spinning:false, pos:[0, 0, 0], msg:'', hist:[], raf:0};
UI.slotsOpen = false;
const _blockingS = UI.blocking.bind(UI);
UI.blocking = function(){ return _blockingS() || this.slotsOpen; };
{
  const st = document.createElement('style');
  st.textContent = `#slots{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.72);z-index:26;padding:10px}#slots.hidden{display:none}
  .slbox{max-width:calc(100vw - 20px);max-height:calc(100vh - 20px);overflow:auto;background:linear-gradient(#2a1410,#17090a);border:3px solid #d8a030;border-radius:12px;padding:14px 20px;color:#e8d8b0;text-align:center;box-shadow:0 0 40px rgba(255,160,40,.35)}
  .slbox h2{margin:0 0 4px;color:#ffd88a;font-size:22px}.slgold{margin-bottom:8px;font-size:15px}#slCanvas{background:#0a0606;border:4px solid #8a5a1a;border-radius:8px;image-rendering:auto}
  #slResult{min-height:48px;margin:8px 0;font-size:17px;color:#ffe9a8}.slbtns{display:flex;gap:10px;justify-content:center}.slbtns button{padding:9px 20px;font-size:15px}
  .slbox{position:relative}.slauto{margin:10px auto 0;max-width:340px;padding:10px;border:2px solid #8a5a1a;border-radius:8px;background:#1a0c0a}.slauto input[type=number]{width:120px;font-size:16px;padding:4px 6px;text-align:right;background:#0a0606;color:#ffe9a8;border:2px solid #8a5a1a}
  .slauto .pre{display:flex;gap:6px;justify-content:center;margin:8px 0;flex-wrap:wrap}.slauto button{padding:6px 12px;font-size:13px}.slauto .st{font-size:14px;color:#ffe9a8;margin-bottom:6px}
  #slSummary{position:absolute;inset:0;background:rgba(14,6,6,.97);border-radius:10px;padding:14px 18px;display:flex;flex-direction:column;z-index:3;text-align:left}#slSummary.hidden{display:none}
  #slSummary h3{margin:0 0 6px;color:#ffd88a;font-size:19px;text-align:center}.slsum{display:grid;grid-template-columns:repeat(3,auto);gap:3px 16px;justify-content:center;margin-bottom:8px;font-size:14px}.slsum b{color:#ffe9a8}
  .sllog{flex:1;min-height:0;overflow:auto;border:1px solid #5a3a14;background:#0a0606;font-size:13px}.sllog table{width:100%;border-collapse:collapse}.sllog td,.sllog th{padding:3px 8px;border-bottom:1px solid #2a1a10}.sllog th{position:sticky;top:0;background:#2a1a10;color:#ffd88a;text-align:left}
  .sltab{margin-top:10px;font-size:12px;color:#b8a888;display:grid;grid-template-columns:repeat(2,auto);gap:2px 18px;text-align:left}`;
  document.head.append(st);
  const d = document.createElement('div'); d.id = 'slots'; d.className = 'hidden';
  d.innerHTML = `<div class="slbox"><h2>La tragaperras de Alexandra</h2><div id="slGold" class="slgold"></div><canvas id="slCanvas" width="360" height="270"></canvas><div id="slResult"></div>
    <div class="slbtns"><button id="slSpin">Girar</button><button id="slAuto">Automático</button><button id="slClose">Salir</button></div>
    <div id="slAutoBox" class="hidden"></div><div id="slSummary" class="hidden"></div><div class="sltab" id="slTab"></div></div>`;
  document.body.append(d);
}
UI.openSlots = function(){
  this.slotsOpen = true; G.bigMap = false; SL.msg = ''; $('slots').classList.remove('hidden'); sfx('ui'); this.renderSlots(); slDraw(); slLoop();
};
UI.closeSlots = function(){ if(SL.spinning) return;
  if(SL.auto && SL.auto.on && !SL.auto.paused){ toast('Pausa o detén el modo automático primero', 1.6); return; }
  if(SL.auto){ SL.auto = null; $('slAutoBox').classList.add('hidden'); $('slSummary').classList.add('hidden'); } this.slotsOpen = false; $('slots').classList.add('hidden'); sfx('ui'); saveGame(); };
UI.renderSlots = function(){
  const free = G.save.freeSlot || 0;
  $('slGold').innerHTML = `${tr('Tu oro')}: <b class="gold">${G.save.wallet}</b> · ${tr('Tirada')}: <b>${free > 0 ? tr('GRATIS') + ' ×' + free : SLOT_BET + ' ' + tr('oro')}</b>`;
  $('slResult').innerHTML = SL.msg;
  const autoOn = !!(SL.auto && SL.auto.on);
  $('slSpin').disabled = SL.spinning || autoOn || (free <= 0 && G.save.wallet < SLOT_BET); $('slClose').disabled = SL.spinning || (autoOn && !SL.auto.paused); $('slAuto').disabled = SL.spinning || autoOn || (free <= 0 && G.save.wallet < SLOT_BET);
  $('slSpin').textContent = tr(free > 0 ? 'Girar gratis' : 'Girar');
  $('slTab').innerHTML = [[6, 6, 6], [5, 5, 5], [4, 4, 4], [3, 3, 3], [2, 2, 2], [1, 1, 1], [0, 0, 0]].map(t => `<span>${t.map(i => SLOT_SYM[i].e).join(' ')} → <b>${SLOT_BET*SLOT_TRIPLE[t[0]]}</b>${t[0] === 6 ? ' + ' + tr('legendario') : t[0] === 5 ? ' + ' + tr('gema') : t[0] === 4 ? ' + 5 ' + tr('pociones superiores') : t[0] === 3 ? ' + 10 ' + tr('galletas') : ''}</span>`).join('') + `<span>🍒 🍒 ✗ → <b>${SLOT_BET*2}</b></span><span>🍒 ✗ ✗ / ${tr('pareja en los 2 primeros')} / ⭐ ${tr('suelta')} → <b>${SLOT_BET}</b></span><span>🍒 🍋 🔔 (${tr('en cualquier orden')}) → <b>${SLOT_BET*2}</b></span>`;
};
// resultado de la línea central: veces la apuesta devueltas
function slotEval(r){
  if(r[0] === r[1] && r[1] === r[2]) return {m:SLOT_TRIPLE[r[0]], kind:'triple', s:r[0]};
  if(r[0] === 0 && r[1] === 0) return {m:2, kind:'pair'};
  if(r[0] === 0 && r[1] !== 0 && r[2] !== 0) return {m:1, kind:'push'};
  if(r[0] === r[1] && r[0] !== 0) return {m:1, kind:'push'};
  if(r.includes(4)) return {m:1, kind:'push'};                                  // una estrella en cualquier carrete: recuperas la tirada
  if(r.includes(0) && r.includes(1) && r.includes(2)) return {m:2, kind:'mix'};   // cereza + limón + campana (en cualquier orden): ×2
  return {m:0, kind:'lose'};
}
function slSpin(fast){
  if(SL.spinning) return;
  const s = G.save, free = (s.freeSlot || 0) > 0;
  if(!free && s.wallet < SLOT_BET){ toast('No tienes suficiente oro', 1.4); return; }
  if(free) s.freeSlot--; else s.wallet -= SLOT_BET;
  SL.curBet = free ? 0 : SLOT_BET;
  SL.spinning = true; SL.msg = ''; saveGame(); sfx('coin');
  const target = [0, 1, 2].map(() => Math.floor(Math.random()*32)), t0 = performance.now(), stopAt = fast === true ? [.45, .7, .95] : [1.1, 1.8, 2.5], from = SL.pos.slice(), fin = [], speed = 22;
  for(let i = 0; i < 3; i++){ const p = from[i] + speed*stopAt[i] - 8; let f = Math.ceil((p - target[i])/32)*32 + target[i]; if(f < p) f += 32; fin.push(f); }
  const startStop = stopAt.map((t, i) => t - (fast === true ? .4 : 1.0));   // desde ese instante frena hasta fin[i]
  const posAtStop = [0, 1, 2].map(i => from[i] + speed*startStop[i]);
  const stopped = [false, false, false];
  const tick = now => {
    const t = (now - t0)/1000;
    for(let i = 0; i < 3; i++){
      if(t < startStop[i]) SL.pos[i] = from[i] + speed*t;
      else if(t < stopAt[i]){ const k = (t - startStop[i])/(stopAt[i] - startStop[i]), e = 1 - Math.pow(1 - k, 3); SL.pos[i] = posAtStop[i] + (fin[i] - posAtStop[i])*e; }
      else { SL.pos[i] = fin[i]; if(!stopped[i]){ stopped[i] = true; sfx('stoneHit'); } }
    }
    slDraw();
    if(t < stopAt[2] + .05){ SL.raf = requestAnimationFrame(tick); return; }
    SL.pos = SL.pos.map(p => ((p % 32) + 32) % 32); SL.spinning = false; slResolve(target.map(i => SLOT_STRIP[i]));
  };
  UI.renderSlots(); SL.raf = requestAnimationFrame(tick);
}
function slResolve(r){
  const ev = slotEval(r), win = SLOT_BET*ev.m, s = G.save; let extra = '';
  s.wallet += win;
  if(ev.kind === 'triple'){
    if(ev.s === 6){ const id = pick(LEGEND_IDS); addToBagOrStash(mkItem(id, 1, 12)); extra = ` + ${tr('¡Objeto legendario!')} ${tr(ITEMS[id].name)}`; }
    else if(ev.s === 5){ const id = pick(Object.keys(GEMS).filter(g => ITEMS[g])); addToBagOrStash(mkItem(id)); extra = ` + ${tr(ITEMS[id].name)}`; }
    else if(ev.s === 4){ addToBagOrStash(mkItem('superpotion', 5)); extra = ' + 5 ' + tr('pociones superiores'); }
    else if(ev.s === 3){ addToBagOrStash(mkItem('cookie', 10)); extra = ' + 10 ' + tr('galletas'); }
  }
  if(win > SLOT_BET){ SL.msg = `<b style="color:#7aff9a">¡${tr('Has ganado')} ${win} ${tr('oro')}!</b>${extra}`; sfx(ev.kind === 'triple' && ev.s >= 4 ? 'levelup' : 'alba'); if(ev.kind === 'triple' && ev.s >= 5) G.flash = {x:P.x, y:P.y - 20, t:.5}; }
  else if(win === SLOT_BET) SL.msg = tr('Recuperas la tirada.');
  else SL.msg = `<span style="color:#ff9a9a">${tr('Sin premio. ¡Otra vez!')}</span>`;
  SL.curSpin = {sym:r.map(i => SLOT_SYM[i].e), bet:SL.curBet || 0, win, extra:extra.replace(/^ \+ /, ''), kind:ev.kind};
  saveGame(); UI.renderSlots(); slDraw();
  if(SL.auto && SL.auto.on) slAutoAfter();
}
function slDraw(){
  const cv = $('slCanvas'); if(!cv) return; const g = cv.getContext('2d'), W2 = cv.width, H2 = cv.height, RH = 90, RW = 104;
  g.clearRect(0, 0, W2, H2); g.fillStyle = '#0a0606'; g.fillRect(0, 0, W2, H2);
  for(let i = 0; i < 3; i++){
    const x0 = 24 + i*(RW + 4); g.save(); g.beginPath(); g.rect(x0, 0, RW, H2); g.clip(); g.fillStyle = '#f4ecd8'; g.fillRect(x0, 0, RW, H2);
    const p = SL.pos[i]; g.textAlign = 'center'; g.textBaseline = 'middle';
    for(let k = -2; k <= 3; k++){
      const idx = Math.floor(p) + k, sym = SLOT_SYM[SLOT_STRIP[((idx % 32) + 32) % 32]], y = H2/2 + (idx - p)*RH;
      if(sym.e === '7'){ g.font = 'bold 64px serif'; g.fillStyle = '#d02020'; g.strokeStyle = '#601010'; g.lineWidth = 3; g.strokeText('7', x0 + RW/2, y); g.fillText('7', x0 + RW/2, y); }
      else { g.font = '56px "Segoe UI Emoji","Apple Color Emoji",sans-serif'; g.fillStyle = '#000'; g.fillText(sym.e, x0 + RW/2, y); }
    }
    const sh = g.createLinearGradient(0, 0, 0, H2); sh.addColorStop(0, 'rgba(0,0,0,.55)'); sh.addColorStop(.3, 'rgba(0,0,0,0)'); sh.addColorStop(.7, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = sh; g.fillRect(x0, 0, RW, H2); g.restore();
  }
  g.strokeStyle = '#ff3a3a'; g.lineWidth = 3; g.beginPath(); g.moveTo(8, H2/2); g.lineTo(W2 - 8, H2/2); g.stroke();   // línea de pago
  g.fillStyle = '#ff3a3a'; g.beginPath(); g.moveTo(2, H2/2 - 8); g.lineTo(12, H2/2); g.lineTo(2, H2/2 + 8); g.fill(); g.beginPath(); g.moveTo(W2 - 2, H2/2 - 8); g.lineTo(W2 - 12, H2/2); g.lineTo(W2 - 2, H2/2 + 8); g.fill();
}
function slLoop(){ /* el dibujo se hace en cada giro; aquí solo se redibuja si se abre */ slDraw(); }
$('slSpin').onclick = () => slSpin(); $('slClose').onclick = () => UI.closeSlots();
// ---------- modo automático: eliges el máximo de oro que quieres gastar y juega solo (se puede pausar); al terminar sale el resumen completo ----------
function slAutoSetup(){
  const box = $('slAutoBox'), w = G.save.wallet, free = G.save.freeSlot || 0;
  if(w < SLOT_BET && free <= 0){ toast('No tienes suficiente oro', 1.4); return; }
  box.innerHTML = `<div class="slauto"><div class="st">${tr('¿Cuánto oro quieres gastar como máximo?')}</div>
    <input type="number" id="slAutoMax" min="${SLOT_BET}" step="${SLOT_BET}" value="${Math.min(w, SLOT_BET*10)}"> ${tr('oro')}
    <div class="pre">${[1000, 5000, 20000, 100000].filter(v => v <= w).map(v => `<button data-v="${v}">${v}</button>`).join('')}<button data-v="${w}">${tr('Todo')} (${w})</button></div>
    <div class="sub" style="font-size:12px;color:#b8a888">${tr('Cada tirada cuesta')} ${SLOT_BET}. ${tr('Se detiene al llegar al máximo o si te quedas sin oro.')}</div>
    <div class="pre"><button id="slAutoGo">${tr('Empezar')}</button><button id="slAutoCancel">${tr('Cancelar')}</button></div></div>`;
  box.classList.remove('hidden');
  box.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { $('slAutoMax').value = b.dataset.v; });
  $('slAutoCancel').onclick = () => { box.classList.add('hidden'); box.innerHTML = ''; };
  $('slAutoGo').onclick = () => {
    const max = Math.floor(+$('slAutoMax').value || 0);
    if(max < SLOT_BET && !(G.save.freeSlot > 0)){ toast('El máximo debe cubrir al menos una tirada', 1.6); return; }
    SL.auto = {on:true, paused:false, max, spent:0, won:0, log:[], items:[], reason:'', t0:Date.now()};
    sfx('coin'); slAutoBar(); UI.renderSlots(); slAutoNext();
  };
}
function slAutoBar(){
  const A = SL.auto, box = $('slAutoBox'); if(!A || !A.on){ return; }
  box.classList.remove('hidden');
  box.innerHTML = `<div class="slauto"><div class="st">⚙ ${tr('Automático')}${A.paused ? ' · <b style="color:#ffd88a">' + tr('en pausa') + '</b>' : ''}</div>
    <div>${tr('Tiradas')}: <b>${A.log.length}</b> · ${tr('Gastado')}: <b>${A.spent}</b> / ${A.max} · ${tr('Ganado')}: <b style="color:#7aff9a">${A.won}</b></div>
    <div class="pre"><button id="slAutoPause">${A.paused ? tr('Continuar') : tr('Pausar')}</button><button id="slAutoStop">${tr('Detener y ver resumen')}</button></div></div>`;
  $('slAutoPause').onclick = () => { A.paused = !A.paused; sfx('ui'); slAutoBar(); UI.renderSlots(); if(!A.paused && !SL.spinning) slAutoNext(); };
  $('slAutoStop').onclick = () => { if(SL.spinning){ A.stopAsap = true; $('slAutoStop').disabled = true; } else slAutoFinish(tr('Detenido por ti')); };
}
function slAutoNext(){
  const A = SL.auto; if(!A || !A.on || A.paused || SL.spinning) return;
  const free = (G.save.freeSlot || 0) > 0, cost = free ? 0 : SLOT_BET;
  if(A.stopAsap) return slAutoFinish(tr('Detenido por ti'));
  if(A.spent + cost > A.max) return slAutoFinish(tr('Has llegado al máximo de oro que querías gastar'));
  if(!free && G.save.wallet < SLOT_BET) return slAutoFinish(tr('Te has quedado sin oro'));
  A.spent += cost; slSpin(true); slAutoBar();
}
function slAutoAfter(){
  const A = SL.auto, sp = SL.curSpin; if(!A || !A.on) return;
  A.log.push(sp); A.won += sp.win; if(sp.extra) A.items.push(sp.extra);
  slAutoBar();
  if(A.stopAsap){ slAutoFinish(tr('Detenido por ti')); return; }
  if(!A.paused) setTimeout(slAutoNext, 420);
}
function slAutoFinish(reason){
  const A = SL.auto; if(!A) return; A.on = false; A.reason = reason;
  $('slAutoBox').classList.add('hidden'); $('slAutoBox').innerHTML = '';
  const n = A.log.length, spent = A.log.reduce((s, x) => s + x.bet, 0), won = A.log.reduce((s, x) => s + x.win, 0), net = won - spent;
  const wins = A.log.filter(x => x.win > x.bet).length, back = A.log.filter(x => x.win === x.bet && x.bet > 0).length, lose = A.log.filter(x => x.win < x.bet).length, best = A.log.reduce((m, x) => Math.max(m, x.win - x.bet), 0);
  const row = (x, i) => `<tr><td>${i + 1}</td><td style="font-size:18px">${x.sym.map(e => e === '7' ? '<b style="color:#ff5a5a">7</b>' : e).join(' ')}</td><td>${x.bet || tr('GRATIS')}</td><td><b style="color:${x.win > x.bet ? '#7aff9a' : x.win === x.bet ? '#e8d8b0' : '#ff9a9a'}">${x.win > x.bet ? '+' + (x.win - x.bet) : x.win === x.bet ? tr('Recuperas') : '−' + (x.bet - x.win)}</b></td><td>${x.extra ? tr(x.extra.split(' ').length > 1 ? x.extra : x.extra) : ''}</td></tr>`;
  const sm = $('slSummary');
  sm.innerHTML = `<h3>${tr('Resumen del modo automático')}</h3><div style="text-align:center;color:#b8a888;margin-bottom:6px">${reason}</div>
    <div class="slsum"><span>${tr('Tiradas')}: <b>${n}</b></span><span>${tr('Gastado')}: <b>${spent}</b></span><span>${tr('Ganado')}: <b style="color:#7aff9a">${won}</b></span>
      <span>${tr('Balance')}: <b style="color:${net >= 0 ? '#7aff9a' : '#ff9a9a'}">${net >= 0 ? '+' : ''}${net}</b></span><span>${tr('Premios')}: <b>${wins}</b></span><span>${tr('Recuperadas')}: <b>${back}</b></span>
      <span>${tr('Sin premio')}: <b>${lose}</b></span><span>${tr('Mejor premio')}: <b>${best > 0 ? '+' + best : '—'}</b></span><span>${tr('Objetos')}: <b>${A.items.length}</b></span></div>
    ${A.items.length ? `<div style="margin-bottom:6px;font-size:13px;color:#ffd88a">${tr('Objetos conseguidos')}: ${A.items.join(' · ')}</div>` : ''}
    <div class="sllog"><table><tr><th>#</th><th>${tr('Resultado')}</th><th>${tr('Apuesta')}</th><th>${tr('Ganancia')}</th><th>${tr('Recompensa')}</th></tr>${A.log.map(row).join('') || '<tr><td colspan="5">' + tr('Sin tiradas.') + '</td></tr>'}</table></div>
    <div style="text-align:center;margin-top:8px"><button id="slSumClose" style="padding:8px 22px;font-size:15px">${tr('Cerrar resumen')}</button></div>`;
  sm.classList.remove('hidden');
  $('slSumClose').onclick = () => { sm.classList.add('hidden'); SL.auto = null; sfx('ui'); UI.renderSlots(); };
  UI.renderSlots(); saveGame();
}
$('slAuto').onclick = () => { if(!SL.spinning && !SL.auto) slAutoSetup(); };
Object.assign(LANG_EN, {'Automático':'Auto', '¿Cuánto oro quieres gastar como máximo?':'How much gold do you want to spend at most?', 'Todo':'All', 'Cada tirada cuesta':'Each spin costs', 'Se detiene al llegar al máximo o si te quedas sin oro.':'It stops when it reaches the maximum or if you run out of gold.', 'Empezar':'Start', 'Cancelar':'Cancel', 'en pausa':'paused', 'Tiradas':'Spins', 'Gastado':'Spent', 'Ganado':'Won', 'Continuar':'Resume', 'Pausar':'Pause', 'Detener y ver resumen':'Stop and see summary', 'Detenido por ti':'Stopped by you', 'Has llegado al máximo de oro que querías gastar':'You reached the maximum gold you wanted to spend', 'Te has quedado sin oro':'You ran out of gold', 'Resumen del modo automático':'Auto mode summary', 'Balance':'Balance', 'Premios':'Prizes', 'Recuperadas':'Refunded', 'Sin premio':'No prize', 'Mejor premio':'Best prize', 'Objetos':'Items', 'Objetos conseguidos':'Items obtained', 'Resultado':'Result', 'Apuesta':'Bet', 'Ganancia':'Profit', 'Recompensa':'Reward', 'Sin tiradas.':'No spins.', 'Cerrar resumen':'Close summary', 'Pausa o detén el modo automático primero':'Pause or stop auto mode first', 'El máximo debe cubrir al menos una tirada':'The maximum must cover at least one spin', 'Recuperas':'You get it back','La tragaperras de Alexandra':'Alexandra\'s slot machine', 'Tirada':'Spin', 'GRATIS':'FREE', 'oro':'gold', 'Girar':'Spin', 'Girar gratis':'Spin for free', 'Salir':'Leave', 'legendario':'legendary', 'gema':'gem', 'pociones superiores':'greater potions', 'galletas':'cookies',
  'pareja en los 2 primeros':'pair in the first 2', 'suelta':'anywhere', 'en cualquier orden':'in any order', '¡Objeto legendario!':'Legendary item!', 'Has ganado':'You won', 'Recuperas la tirada.':'You get your bet back.', 'Sin premio. ¡Otra vez!':'No prize. Try again!',
  '¿A qué quieres jugar?':'What would you like to play?', 'La ruleta':'The roulette', 'Las tragaperras':'The slots', 'Nada, gracias':'Nothing, thanks'});
LANG.load(LANG_EN);
