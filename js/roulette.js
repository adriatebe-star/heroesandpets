'use strict';
// =====================================================================
//  La ruleta de Alexandra (ruleta europea de 37 casillas) que se juega con el oro de la guarida
// =====================================================================
const RL_ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];   // orden real de la rueda
const RL_RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const rlColor = n => n === 0 ? 'green' : RL_RED.has(n) ? 'red' : 'black';
// apuestas externas: clave → [texto, comprobación, pago (veces lo apostado que se devuelven)]
const RL_OUTSIDE = {
  dz1:['1.ª docena', n => n >= 1 && n <= 12, 3], dz2:['2.ª docena', n => n >= 13 && n <= 24, 3], dz3:['3.ª docena', n => n >= 25, 3],
  col1:['2:1', n => n > 0 && n % 3 === 1, 3], col2:['2:1', n => n > 0 && n % 3 === 2, 3], col3:['2:1', n => n > 0 && n % 3 === 0, 3],
  low:['1-18', n => n >= 1 && n <= 18, 2], even:['Par', n => n > 0 && n % 2 === 0, 2], red:['Rojo', n => RL_RED.has(n), 2], black:['Negro', n => n > 0 && !RL_RED.has(n), 2], odd:['Impar', n => n % 2 === 1, 2], high:['19-36', n => n >= 19, 2],
};
const RL_CHIPS = [10, 50, 100, 500, 1000, 5000];
const RL = {bets:{}, last:{}, chip:10, spinning:false, hist:[], angle:0, ballA:0, ballR:1, res:null, msg:''};
UI.rouletteOpen = false; UI.rouletteSpinning = false;
const _blockingR = UI.blocking.bind(UI);
UI.blocking = function(){ return _blockingR() || this.rouletteOpen; };
const rlTotal = () => Object.values(RL.bets).reduce((s, v) => s + v, 0);

UI.openRoulette = function(){
  this.rouletteOpen = true; G.bigMap = false; RL.msg = ''; RL.res = null;
  $('roulette').classList.remove('hidden'); sfx('ui');
  this.renderRoulette(); rlDrawWheel();
};
UI.closeRoulette = function(){
  if(RL.spinning) return;
  this.rouletteOpen = false; $('roulette').classList.add('hidden'); sfx('ui'); saveGame();
};
UI.renderRoulette = function(){
  const num = n => `<div class="rln ${rlColor(n)}" data-b="n${n}">${n}${RL.bets['n' + n] ? `<i>${RL.bets['n' + n]}</i>` : ''}</div>`;
  const out = k => `<div class="rlo ${k === 'red' ? 'red' : k === 'black' ? 'black' : ''}" data-b="${k}">${tr(RL_OUTSIDE[k][0])}${RL.bets[k] ? `<i>${RL.bets[k]}</i>` : ''}</div>`;
  let h = '<div class="rltbl"><div class="rlzero rln green" data-b="n0">0' + (RL.bets.n0 ? `<i>${RL.bets.n0}</i>` : '') + '</div><div class="rlgrid">';
  for(const row of [3, 2, 1]){ for(let c = 0; c < 12; c++) h += num(c*3 + row); h += out('col' + (row === 3 ? 3 : row === 2 ? 2 : 1)); }
  h += '</div><div class="rlrow3">' + ['dz1', 'dz2', 'dz3'].map(out).join('') + '</div><div class="rlrow6">' + ['low', 'even', 'red', 'black', 'odd', 'high'].map(out).join('') + '</div></div>';
  $('rlTable').innerHTML = h;
  $('rlChips').innerHTML = RL_CHIPS.map(v => `<button class="rlchip${RL.chip === v ? ' on' : ''}" data-chip="${v}">${v}</button>`).join('');
  $('rlGold').innerHTML = `${tr('Tu oro')}: <b class="gold">${G.save.wallet}</b> · ${tr('Apuesta total')}: <b>${rlTotal()}</b>`;
  $('rlHist').innerHTML = RL.hist.slice(-14).map(n => `<span class="rlh ${rlColor(n)}">${n}</span>`).join('');
  $('rlResult').innerHTML = RL.msg;
  const dis = RL.spinning;
  $('rlSpin').disabled = dis || !rlTotal(); $('rlClear').disabled = dis || !rlTotal(); $('rlRepeat').disabled = dis || !Object.keys(RL.last).length; $('rlClose').disabled = dis;
};
function rlAddBet(key, amt){
  if(RL.spinning) return;
  if(amt > 0){ if(G.save.wallet - rlTotal() < amt){ toast('No tienes suficiente oro', 1.2); sfx('ui'); return; } RL.bets[key] = (RL.bets[key] || 0) + amt; sfx('coin'); }
  else if(RL.bets[key]){ RL.bets[key] = Math.max(0, RL.bets[key] + amt); if(!RL.bets[key]) delete RL.bets[key]; sfx('ui'); }
  UI.renderRoulette();
}
$('rlTable').addEventListener('click', e => { const c = e.target.closest('[data-b]'); if(c) rlAddBet(c.dataset.b, RL.chip); });
$('rlTable').addEventListener('contextmenu', e => { e.preventDefault(); const c = e.target.closest('[data-b]'); if(c) rlAddBet(c.dataset.b, -RL.chip); });
$('rlChips').addEventListener('click', e => { const b = e.target.closest('[data-chip]'); if(b){ RL.chip = +b.dataset.chip; sfx('ui'); UI.renderRoulette(); } });
$('rlClear').onclick = () => { if(!RL.spinning){ RL.bets = {}; sfx('ui'); UI.renderRoulette(); } };
$('rlRepeat').onclick = () => { if(RL.spinning) return; const tot = Object.values(RL.last).reduce((s, v) => s + v, 0); if(tot > G.save.wallet){ toast('No tienes suficiente oro', 1.2); return; } RL.bets = Object.assign({}, RL.last); sfx('coin'); UI.renderRoulette(); };
$('rlClose').onclick = () => UI.closeRoulette();
$('rlSpin').onclick = () => rlSpin();

// cuánto devuelve la apuesta con el número ganador (incluye lo apostado)
function rlPayout(win){
  let back = 0;
  for(const [k, v] of Object.entries(RL.bets)){
    if(k[0] === 'n' && k !== 'none'){ if(+k.slice(1) === win) back += v*36; }
    else if(RL_OUTSIDE[k] && RL_OUTSIDE[k][1](win)) back += v*RL_OUTSIDE[k][2];
  }
  return back;
}
function rlSpin(){
  const tot = rlTotal(); if(RL.spinning || !tot || tot > G.save.wallet) return;
  RL.spinning = true; UI.rouletteSpinning = true; RL.msg = ''; G.save.wallet -= tot; RL.last = Object.assign({}, RL.bets); saveGame();
  const win = RL_ORDER[Math.floor(Math.random()*RL_ORDER.length)], k = RL_ORDER.indexOf(win), step = Math.PI*2/37;
  const T = 5.6, a0 = RL.angle, ballA0 = RL.ballA, W = Math.PI*2*(2.2 + Math.random()*.6);
  const wheelEnd = a0 + W, target = wheelEnd + k*step - Math.PI/2;   // la bola acaba sobre la casilla ganadora
  let dB = (ballA0 - target) % (Math.PI*2); if(dB < 0) dB += Math.PI*2; dB += Math.PI*2*5;   // la bola gira en sentido contrario, varias vueltas
  const t0 = performance.now(); let lastTick = 0;
  UI.renderRoulette(); sfx('click');
  const ease = x => 1 - Math.pow(1 - x, 3);
  const frame = now => {
    const t = Math.min(1, (now - t0)/1000/T), e = ease(t);
    RL.angle = a0 + W*e; RL.ballA = ballA0 - dB*ease(Math.min(1, t*1.02)); RL.ballR = t < .55 ? 1 : 1 - .26*ease((t - .55)/.45);
    if(now - lastTick > 90 + t*320){ lastTick = now; sfx('click', .3); }
    rlDrawWheel();
    if(t < 1){ requestAnimationFrame(frame); return; }
    RL.angle = wheelEnd; RL.ballA = target; RL.ballR = .74; rlDrawWheel();
    // resultado
    RL.hist.push(win); const back = rlPayout(win), net = back - tot, col = tr({red:'rojo', black:'negro', green:'verde'}[rlColor(win)]);
    G.save.wallet += back; RL.bets = {}; RL.spinning = false; UI.rouletteSpinning = false;
    (G.save.rlLog ??= []).push({n:win, bet:tot, back, t:Date.now()}); if(G.save.rlLog.length > 300) G.save.rlLog.shift();
    RL.msg = `<b class="rlbig ${rlColor(win)}">${win}</b> ${col}. ` + (net > 0 ? `<span class="good">${tr('Ganas')} ${net} ${tr('oro')}</span>` : net === 0 ? tr('Recuperas lo apostado') : `<span class="bad">${tr('Pierdes')} ${-net} ${tr('oro')}</span>`);
    sfx(net > 0 ? 'levelup' : 'ui'); if(back > 0) sfx('coin');
    saveGame(); UI.renderRoulette();
  };
  requestAnimationFrame(frame);
}
// rueda: casillas, bola y adornos
function rlDrawWheel(){
  const cv = $('rlWheel'), g = cv.getContext('2d'), S = cv.width, C = S/2, R = S*.47, step = Math.PI*2/37;
  g.clearRect(0, 0, S, S);
  g.fillStyle = '#3a2412'; g.beginPath(); g.arc(C, C, R + 8, 0, Math.PI*2); g.fill(); g.fillStyle = '#7a5232'; g.beginPath(); g.arc(C, C, R + 3, 0, Math.PI*2); g.fill();
  for(let i = 0; i < 37; i++){
    const n = RL_ORDER[i], a1 = RL.angle + i*step - Math.PI/2 - step/2, a2 = a1 + step, col = {green:'#1f8a46', red:'#c02828', black:'#16161c'}[rlColor(n)];
    g.fillStyle = col; g.beginPath(); g.moveTo(C, C); g.arc(C, C, R, a1, a2); g.closePath(); g.fill();
    g.strokeStyle = '#d8c070'; g.lineWidth = 1; g.beginPath(); g.moveTo(C + Math.cos(a1)*R*.5, C + Math.sin(a1)*R*.5); g.lineTo(C + Math.cos(a1)*R, C + Math.sin(a1)*R); g.stroke();
    g.save(); g.translate(C, C); g.rotate((a1 + a2)/2); g.fillStyle = '#ffffff'; g.font = `bold ${Math.round(S*.045)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.translate(R*.86, 0); g.rotate(Math.PI/2); g.fillText(n, 0, 0); g.restore();
  }
  g.fillStyle = '#2a2a30'; g.beginPath(); g.arc(C, C, R*.52, 0, Math.PI*2); g.fill();
  g.fillStyle = '#8a6a30'; g.beginPath(); g.arc(C, C, R*.42, 0, Math.PI*2); g.fill(); g.fillStyle = '#e8c070'; g.beginPath(); g.arc(C, C, R*.12, 0, Math.PI*2); g.fill();
  for(let i = 0; i < 4; i++){ const a = RL.angle + i*Math.PI/2; g.strokeStyle = '#e8c070'; g.lineWidth = 3; g.beginPath(); g.moveTo(C + Math.cos(a)*R*.12, C + Math.sin(a)*R*.12); g.lineTo(C + Math.cos(a)*R*.4, C + Math.sin(a)*R*.4); g.stroke(); }
  const bx = C + Math.cos(RL.ballA)*R*RL.ballR*.98, by = C + Math.sin(RL.ballA)*R*RL.ballR*.98;
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(bx + 2, by + 2, S*.02, 0, Math.PI*2); g.fill(); g.fillStyle = '#f4f4f8'; g.beginPath(); g.arc(bx, by, S*.02, 0, Math.PI*2); g.fill();
}

// ---------- historial de jugadas ----------
{
  const bt = document.createElement('button'); bt.id = 'rlHistBtn'; bt.textContent = 'Historial'; document.querySelector('#roulette .rlbtns').insertBefore(bt, $('rlClose'));
  const pn = document.createElement('div'); pn.id = 'rlLog'; pn.className = 'hidden'; pn.style.cssText = 'position:absolute;inset:0;background:rgba(10,6,4,.96);z-index:3;padding:16px 20px;overflow:auto;border-radius:8px';
  document.querySelector('#roulette .rlbox').style.position = 'relative'; document.querySelector('#roulette .rlbox').append(pn);
  const show = () => {
    const log = (G.save.rlLog || []).slice().reverse(), tot = log.reduce((s, e) => s + e.back - e.bet, 0), fmt = t => new Date(t).toLocaleString();
    pn.innerHTML = `<h2 style="margin:0 0 6px;color:#ffd88a">${tr('Historial de jugadas')}</h2><div style="margin-bottom:8px">${tr('Jugadas')}: <b>${log.length}</b> · ${tr('Balance total')}: <b style="color:${tot >= 0 ? '#7aff9a' : '#ff9a9a'}">${tot >= 0 ? '+' : ''}${tot} ${tr('oro')}</b></div>
      <div style="display:grid;grid-template-columns:auto auto auto auto;gap:3px 16px;font-size:13px;align-items:center"><b>${tr('Fecha')}</b><b>${tr('Número')}</b><b>${tr('Apuesta')}</b><b>${tr('Resultado')}</b>${log.map(e => { const net = e.back - e.bet; return `<span style="color:#9a8e78">${fmt(e.t)}</span><span class="rlh ${rlColor(e.n)}">${e.n}</span><span>${e.bet}</span><b style="color:${net > 0 ? '#7aff9a' : net < 0 ? '#ff9a9a' : '#e8d8b0'}">${net > 0 ? '+' : ''}${net}</b>`; }).join('') || '<span style="grid-column:1/5">' + tr('Todavía no has jugado.') + '</span>'}</div>
      <button id="rlLogClose" style="margin-top:12px;padding:8px 18px">${tr('Volver')}</button>`;
    pn.classList.remove('hidden'); $('rlLogClose').onclick = () => { pn.classList.add('hidden'); sfx('ui'); };
  };
  bt.onclick = () => { sfx('ui'); show(); };
}
Object.assign(LANG_EN, {'Historial':'History', 'Historial de jugadas':'Play history', 'Jugadas':'Plays', 'Balance total':'Total balance', 'Fecha':'Date', 'Número':'Number', 'Apuesta':'Bet', 'Resultado':'Result', 'Todavía no has jugado.':'You have not played yet.', 'Volver':'Back', 'Legendarios':'Legendary', 'solo por el portal':'portal only', 'Solo se puede acceder a través del portal del tiempo de Rolecs':'Only reachable through Rolecs\'s time portal'});
LANG.load(LANG_EN);
