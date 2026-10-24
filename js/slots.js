'use strict';
// =====================================================================
//  Tragaperras de Alexandra (aprobada por el usuario): 3 carretes de 32 posiciones, 1 línea central, tirada de 200 de oro.
//  Retorno ≈ 94,5 %: pierdes ≈ 65 %, recuperas la tirada ≈ 24 % y ganas más de lo apostado ≈ 10 %.
// =====================================================================
const SLOT_BET = 200;
const SLOT_SYM = [   // 0 cereza · 1 limón · 2 campana · 3 uvas · 4 estrella · 5 diamante · 6 siete
  {e:'🍒', w:9, n:'Cereza'}, {e:'🍋', w:8, n:'Limón'}, {e:'🔔', w:6, n:'Campana'}, {e:'🍇', w:4, n:'Uvas'}, {e:'⭐', w:3, n:'Estrella'}, {e:'💎', w:1, n:'Diamante'}, {e:'7', w:1, n:'Siete'},
];
const SLOT_TRIPLE = [8, 10, 15, 30, 60, 500, 1000];   // veces la apuesta
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
  .sltab{margin-top:10px;font-size:12px;color:#b8a888;display:grid;grid-template-columns:repeat(2,auto);gap:2px 18px;text-align:left}`;
  document.head.append(st);
  const d = document.createElement('div'); d.id = 'slots'; d.className = 'hidden';
  d.innerHTML = `<div class="slbox"><h2>La tragaperras de Alexandra</h2><div id="slGold" class="slgold"></div><canvas id="slCanvas" width="360" height="270"></canvas><div id="slResult"></div>
    <div class="slbtns"><button id="slSpin">Girar</button><button id="slClose">Salir</button></div><div class="sltab" id="slTab"></div></div>`;
  document.body.append(d);
}
UI.openSlots = function(){
  this.slotsOpen = true; G.bigMap = false; SL.msg = ''; $('slots').classList.remove('hidden'); sfx('ui'); this.renderSlots(); slDraw(); slLoop();
};
UI.closeSlots = function(){ if(SL.spinning) return; this.slotsOpen = false; $('slots').classList.add('hidden'); sfx('ui'); saveGame(); };
UI.renderSlots = function(){
  const free = G.save.freeSlot || 0;
  $('slGold').innerHTML = `${tr('Tu oro')}: <b class="gold">${G.save.wallet}</b> · ${tr('Tirada')}: <b>${free > 0 ? tr('GRATIS') + ' ×' + free : SLOT_BET + ' ' + tr('oro')}</b>`;
  $('slResult').innerHTML = SL.msg;
  $('slSpin').disabled = SL.spinning || (free <= 0 && G.save.wallet < SLOT_BET); $('slClose').disabled = SL.spinning;
  $('slSpin').textContent = tr(free > 0 ? 'Girar gratis' : 'Girar');
  $('slTab').innerHTML = [[6, 6, 6], [5, 5, 5], [4, 4, 4], [3, 3, 3], [2, 2, 2], [1, 1, 1], [0, 0, 0]].map(t => `<span>${t.map(i => SLOT_SYM[i].e).join(' ')} → <b>${SLOT_BET*SLOT_TRIPLE[t[0]]}</b>${t[0] === 6 ? ' + ' + tr('legendario') : t[0] === 5 ? ' + ' + tr('gema') : t[0] === 4 ? ' + 5 ' + tr('pociones superiores') : t[0] === 3 ? ' + 10 ' + tr('galletas') : ''}</span>`).join('') + `<span>🍒 🍒 ✗ → <b>${SLOT_BET*2}</b></span><span>🍒 ✗ ✗ / ${tr('pareja en los 2 primeros')} → <b>${SLOT_BET}</b></span>`;
};
// resultado de la línea central: veces la apuesta devueltas
function slotEval(r){
  if(r[0] === r[1] && r[1] === r[2]) return {m:SLOT_TRIPLE[r[0]], kind:'triple', s:r[0]};
  if(r[0] === 0 && r[1] === 0) return {m:2, kind:'pair'};
  if(r[0] === 0 && r[1] !== 0 && r[2] !== 0) return {m:1, kind:'push'};
  if(r[0] === r[1] && r[0] !== 0) return {m:1, kind:'push'};
  return {m:0, kind:'lose'};
}
function slSpin(){
  if(SL.spinning) return;
  const s = G.save, free = (s.freeSlot || 0) > 0;
  if(!free && s.wallet < SLOT_BET){ toast('No tienes suficiente oro', 1.4); return; }
  if(free) s.freeSlot--; else s.wallet -= SLOT_BET;
  SL.spinning = true; SL.msg = ''; saveGame(); sfx('coin');
  const target = [0, 1, 2].map(() => Math.floor(Math.random()*32)), t0 = performance.now(), stopAt = [1.1, 1.8, 2.5], from = SL.pos.slice(), fin = [], speed = 22;
  for(let i = 0; i < 3; i++){ const p = from[i] + speed*stopAt[i] - 8; let f = Math.ceil((p - target[i])/32)*32 + target[i]; if(f < p) f += 32; fin.push(f); }
  const startStop = stopAt.map((t, i) => t - 1.0);   // desde ese instante frena hasta fin[i]
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
  saveGame(); UI.renderSlots(); slDraw();
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
$('slSpin').onclick = slSpin; $('slClose').onclick = () => UI.closeSlots();
Object.assign(LANG_EN, {'La tragaperras de Alexandra':'Alexandra\'s slot machine', 'Tirada':'Spin', 'GRATIS':'FREE', 'oro':'gold', 'Girar':'Spin', 'Girar gratis':'Spin for free', 'Salir':'Leave', 'legendario':'legendary', 'gema':'gem', 'pociones superiores':'greater potions', 'galletas':'cookies',
  'pareja en los 2 primeros':'pair in the first 2', '¡Objeto legendario!':'Legendary item!', 'Has ganado':'You won', 'Recuperas la tirada.':'You get your bet back.', 'Sin premio. ¡Otra vez!':'No prize. Try again!',
  '¿A qué quieres jugar?':'What would you like to play?', 'La ruleta':'The roulette', 'Las tragaperras':'The slots', 'Nada, gracias':'Nothing, thanks'});
LANG.load(LANG_EN);
