'use strict';
// Intercambio de objetos entre jugadores del cooperativo (solo fuera de expediciones: guarida, jardín...).
// Clic derecho sobre un compañero → petición → los dos eligen objetos (mochila, alijo o jaula grande) y oro → los dos pulsan «Listo».
// Mensajes 'trd' con {to, op}: req, acc, no, off (oferta), rdy (listo, con una huella de las dos ofertas), cnl.
const TRADE = {open:false, with:null, mine:[], theirs:[], myGold:0, theirGold:0, myReady:false, theirReady:null, el:null, askEl:null, msg:'', hoverR:null, max:8};

const tradeName = id => { const r = G.remote.find(q => q.id === id); return (r && r.name) || COOP.names[id] || ('Jugador ' + id); };
const tradeHash = s => { let h = 5381; for(let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h; };
function tradeSend(op, d){ NET.send('trd', Object.assign({to:TRADE.with, op}, d || {}), undefined, true); }
function tradeSendTo(to, op, d){ NET.send('trd', Object.assign({to, op}, d || {}), undefined, true); }
const tradeMineJson = () => TRADE.mine.map(o => JSON.stringify(o.it));
// huella común: las dos ofertas en el mismo orden en los dos PC (primero la del jugador con menor id)
function tradeSig(){
  const own = JSON.stringify([tradeMineJson(), TRADE.myGold]), oth = JSON.stringify([TRADE.theirs, TRADE.theirGold]);
  return tradeHash(NET.myId < TRADE.with ? own + '|' + oth : oth + '|' + own);
}
const tradeOfferable = it => it && !(it.id !== 'pet' && ITEMS[it.id] && ITEMS[it.id].quest) && !it.quest;

function tradeAsk(from){
  if(TRADE.open || TRADE.askEl){ tradeSendTo(from, 'busy'); return; }
  const el = TRADE.askEl = document.createElement('div');
  el.className = 'panel'; el.style.cssText = 'position:fixed;left:50%;top:30%;transform:translate(-50%,-50%);z-index:60;width:min(420px,calc(100vw - 24px));padding:18px 22px;text-align:center';
  el.innerHTML = `<h2 style="margin:0 0 8px">${tr('Intercambio')}</h2><p><b>${tradeName(from)}</b> ${tr('quiere intercambiar objetos contigo.')}</p><button id="trY">${tr('Aceptar')}</button> <button id="trN">${tr('Rechazar')}</button>`;
  document.body.append(el);
  const done = () => { el.remove(); if(TRADE.askEl === el) TRADE.askEl = null; };
  el.querySelector('#trY').onclick = () => { done(); if(G.sc.kind === 'raid' || TRADE.open) return; tradeSendTo(from, 'acc'); tradeBegin(from); };
  el.querySelector('#trN').onclick = () => { done(); tradeSendTo(from, 'no'); };
  setTimeout(() => { if(TRADE.askEl === el){ done(); tradeSendTo(from, 'no'); } }, 20000);
}
function tradeBegin(id){
  Object.assign(TRADE, {open:true, with:id, mine:[], theirs:[], myGold:0, theirGold:0, myReady:false, theirReady:null, msg:''});
  if(UI.invOpen) UI.closeInv();
  const el = TRADE.el = document.createElement('div');
  el.id = 'trade'; el.className = 'panel';
  el.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:45;width:min(640px,calc(100vw - 20px));max-height:94vh;overflow:auto;padding:14px 18px';
  document.body.append(el); G.bigMap = false; sfx('ui'); tradeRender();
}
function tradeClose(msg, notify){
  if(notify && TRADE.open) tradeSend('cnl');
  const was = TRADE.open;
  TRADE.open = false; TRADE.with = null; TRADE.mine = []; TRADE.theirs = [];
  if(TRADE.el){ TRADE.el.remove(); TRADE.el = null; }
  const tip = document.getElementById('tip'); if(tip) tip.classList.add('hidden');
  if(was && msg) toast(msg, 3);
}
// huecos libres que necesito para recibir lo que me ofrecen (suponiendo que primero entrego lo mío)
function tradeRoomOk(){
  const incoming = TRADE.theirs.length; if(!incoming) return true;
  const free = G.inv.bag.filter(x => !x).length + G.save.stash.filter(x => !x).length + TRADE.mine.length;
  return free >= incoming;
}
function tradeOffer(){
  TRADE.myReady = false; TRADE.theirReady = null;
  tradeSend('off', {items:tradeMineJson(), gold:TRADE.myGold});
  tradeRender();
}
function tradeToggle(ref){
  const it = getRef(ref); if(!it) return;
  const i = TRADE.mine.findIndex(o => o.it === it);
  if(i >= 0) TRADE.mine.splice(i, 1);
  else {
    if(!tradeOfferable(it)){ TRADE.msg = tr('Los objetos de misión no se pueden intercambiar.'); tradeRender(); return; }
    if(TRADE.mine.length >= TRADE.max){ TRADE.msg = tr('Máximo {} objetos por intercambio.').replace('{}', TRADE.max); tradeRender(); return; }
    TRADE.mine.push({ref, it});
  }
  TRADE.msg = ''; sfx('ui'); tradeOffer();
}
function tradeSlot(it, extra){
  const d = document.createElement('div'); d.className = 'smslot' + (extra ? ' ' + extra : '');
  d.innerHTML = `<img src="${itemIconURL(it)}" draggable="false">${it.n > 1 ? `<span class="tag">${it.n}</span>` : ''}`;
  d.onmouseenter = e => UI.showTip(it, e); d.onmousemove = e => UI.moveTip(e); d.onmouseleave = () => document.getElementById('tip').classList.add('hidden');
  return d;
}
function tradeRender(){
  const el = TRADE.el; if(!el) return;
  const sc = el.querySelector('#trInv') ? el.querySelector('#trInv').scrollTop : 0;
  el.innerHTML = `<h3 style="margin:0 0 8px">${tr('Intercambio con')} <b>${tradeName(TRADE.with)}</b></h3>
    <div style="display:flex;gap:14px;flex-wrap:wrap">
      <div style="flex:1;min-width:230px"><div class="olhead">${tr('Tu oferta')}${TRADE.myReady ? ' ✔' : ''}</div><div id="trMine" style="display:flex;flex-wrap:wrap;gap:4px;min-height:60px;padding:4px;background:#0c0908"></div>
        <div style="margin-top:6px">${tr('Oro')}: <input id="trGold" type="number" min="0" max="${G.save.wallet}" value="${TRADE.myGold}" style="width:7em"> <small>/ ${G.save.wallet}</small></div></div>
      <div style="flex:1;min-width:230px"><div class="olhead">${tr('Oferta de')} ${tradeName(TRADE.with)}${TRADE.theirReady != null ? ' ✔' : ''}</div><div id="trTheirs" style="display:flex;flex-wrap:wrap;gap:4px;min-height:60px;padding:4px;background:#0c0908"></div>
        <div style="margin-top:6px">${tr('Oro')}: <b>${TRADE.theirGold}</b></div></div>
    </div>
    <div class="olhead" style="margin-top:10px">${tr('Tus objetos (clic para ofrecer o quitar)')}</div>
    <div id="trInv" style="display:flex;flex-wrap:wrap;gap:4px;max-height:200px;overflow:auto;padding:4px;background:#0c0908"></div>
    <div class="olmsg" style="min-height:18px">${TRADE.msg}</div>
    <div style="margin-top:6px"><button id="trOk">${TRADE.myReady ? tr('Quitar «Listo»') : tr('Listo')}</button> <button id="trCancel">${tr('Cancelar')}</button></div>`;
  const mine = el.querySelector('#trMine'), theirs = el.querySelector('#trTheirs'), inv = el.querySelector('#trInv');
  for(const o of TRADE.mine){ const s = tradeSlot(o.it, 'sel'); s.onclick = () => tradeToggle(o.ref); mine.append(s); }
  for(const j of TRADE.theirs){ try { theirs.append(tradeSlot(JSON.parse(j))); } catch(e){} }
  const lists = [[G.inv.bag, 'bag'], [G.save.stash, 'stash'], [G.save.petCage || [], 'cage']];
  for(const [arr, area] of lists) arr.forEach((it, key) => {
    if(!it || TRADE.mine.some(o => o.it === it)) return;
    const s = tradeSlot(it); s.onclick = () => tradeToggle({area, key}); inv.append(s);
  });
  inv.scrollTop = sc;
  const gi = el.querySelector('#trGold');
  gi.onchange = () => { TRADE.myGold = clamp(Math.floor(+gi.value || 0), 0, G.save.wallet); tradeOffer(); };
  gi.onkeydown = e => e.stopPropagation();
  el.querySelector('#trCancel').onclick = () => tradeClose('Intercambio cancelado', true);
  el.querySelector('#trOk').onclick = () => {
    if(!TRADE.myReady && !tradeRoomOk()){ TRADE.msg = tr('No tienes huecos libres para recibir todo.'); tradeRender(); return; }
    TRADE.myReady = !TRADE.myReady; sfx('ui');
    tradeSend('rdy', {h:TRADE.myReady ? tradeSig() : null}); tradeRender(); tradeCheck();
  };
}
// cuando los dos están listos y ven las mismas ofertas, cada PC aplica el cambio
function tradeCheck(){
  if(!TRADE.open || !TRADE.myReady || TRADE.theirReady == null) return;
  if(TRADE.theirReady !== tradeSig()) return;
  tradeCommit();
}
function tradeCommit(){
  const ok = TRADE.mine.every(o => getRef(o.ref) === o.it) && TRADE.myGold <= G.save.wallet;
  if(!ok){ tradeSend('cnl'); tradeClose('El intercambio falló: tus objetos han cambiado', false); return; }
  for(const o of TRADE.mine) setRef(o.ref, null);
  G.save.wallet += TRADE.theirGold - TRADE.myGold;
  let n = 0;
  for(const j of TRADE.theirs){
    let it; try { it = JSON.parse(j); } catch(e){ continue; }
    delete it.lid; it.noDup = true;
    const goHome = it.id === 'pet' && G.save.petCage && addTo(G.save.petCage, it);
    if(!goHome && !addTo(G.inv.bag, it) && !addTo(G.save.stash, it)) G.save.stash.push(it);
    if(it.id === 'pet'){ it.homed = true; G.save.collection[it.pet] = true; if(it.shiny) G.save.shinies[it.pet] = true; }
    n++;
  }
  sfx('coin'); refreshStats(); saveGame(); if(UI.refresh) UI.refresh();
  tradeClose(tr('Intercambio completado') + (n ? ' (' + n + ')' : ''), false);
}

NET.on('trd', (d, from) => {
  if(!G.mp || d.to !== NET.myId) return;
  if(d.op === 'req'){ if(G.sc.kind !== 'raid') tradeAsk(from); else tradeSendTo(from, 'busy'); return; }
  if(d.op === 'acc'){ if(TRADE.pendingTo === from && !TRADE.open){ TRADE.pendingTo = null; tradeBegin(from); } return; }
  if(d.op === 'no' || d.op === 'busy'){ if(TRADE.pendingTo === from){ TRADE.pendingTo = null; toast(tradeName(from) + (d.op === 'no' ? ' ha rechazado el intercambio' : ' está ocupado'), 3); } return; }
  if(!TRADE.open || TRADE.with !== from) return;
  if(d.op === 'cnl'){ tradeClose(tradeName(from) + ' ha cancelado el intercambio', false); return; }
  if(d.op === 'off'){ TRADE.theirs = d.items || []; TRADE.theirGold = Math.max(0, Math.floor(+d.gold || 0)); TRADE.theirReady = null; TRADE.myReady = false; TRADE.msg = ''; tradeRender(); return; }
  if(d.op === 'rdy'){ TRADE.theirReady = d.h == null ? null : d.h; tradeRender(); tradeCheck(); }
});
NET.on('peerLeft', d => { if(TRADE.open && TRADE.with === d.id) tradeClose('Tu compañero se ha desconectado', false); });
NET.on('closed', () => { if(TRADE.open) tradeClose('Se ha cerrado la sala', false); });

// clic derecho sobre un compañero (misma escena, fuera de expediciones)
function tradeUpdate(){
  TRADE.hoverR = null;
  if(TRADE.open && (G.sc.kind === 'raid' || G.menu)){ tradeClose('Intercambio cancelado', true); return; }
  if(TRADE.open && pressed.Escape){ pressed.Escape = false; tradeClose('Intercambio cancelado', true); return; }
  if(!NET.role || !G.mp || G.sc.kind === 'raid' || G.menu || G.paused || TRADE.open || TRADE.pendingTo != null || UI.blocking()) return;
  const mw = screenToWorld(mouse.x, mouse.y);
  for(const r of G.remote){
    if(r.dead || r.hidden) continue;
    if(Math.abs(mw.x - r.x) < 18 && mw.y > r.y - 50 && mw.y < r.y + 8){ TRADE.hoverR = r; break; }
  }
  if(TRADE.hoverR && mouse.rp){
    const r = TRADE.hoverR;
    if(Math.hypot(r.x - P.x, r.y - P.y) > 240){ toast('Acércate más a ' + r.name, 2); return; }
    TRADE.pendingTo = r.id; setTimeout(() => { if(TRADE.pendingTo === r.id){ TRADE.pendingTo = null; if(!TRADE.open) toast('No ha respondido al intercambio', 2.5); } }, 20000);
    tradeSendTo(r.id, 'req'); toast('Petición de intercambio enviada a ' + r.name, 2.5); sfx('ui');
  }
}
{ const _b = UI.blocking.bind(UI); UI.blocking = function(){ return _b() || TRADE.open; }; }
