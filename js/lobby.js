'use strict';
// Sala del modo cooperativo: crear/unirse con códigos (WebRTC manual) y arrancar la expedición con la misma semilla
const LOBBY = {el:null, expId:null, offers:[], names:{}};

LOBBY.myName = () => G.save.name || 'Viajero';
LOBBY.exp = () => LOBBY.expId ? (typeof ALL_EXPS === 'function' ? ALL_EXPS() : EXPEDITIONS).find(e => e.id === LOBBY.expId) : null;

LOBBY.open = function(expId){
  LOBBY.expId = expId; if(!NET.role){ LOBBY.names = {}; LOBBY.offers = []; }
  if(LOBBY.el) LOBBY.el.remove();
  const el = LOBBY.el = document.createElement('div');
  el.id = 'lobby'; el.className = 'panel';
  el.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:40;width:min(560px,calc(100vw - 24px));max-height:92vh;overflow:auto;padding:18px 22px';
  document.body.append(el); LOBBY.render();
};
// sala de la guarida compartida (desde el menú Cooperativa o la pausa)
LOBBY.openDen = function(){ LOBBY.open(null); };
LOBBY.close = function(leave){
  if(LOBBY.el){ LOBBY.el.remove(); LOBBY.el = null; }
  if(leave) NET.close();
};
LOBBY.players = function(){
  const l = [{id:NET.myId, name:LOBBY.myName() + ' (tú)'}];
  for(const p of NET.peers.values()) if(p.open) l.push({id:p.id, name:LOBBY.names[p.id] || ('Jugador ' + p.id)});
  if(NET.role === 'guest' && !l.some(x => x.id === 0)) l.push({id:0, name:LOBBY.names[0] || 'Anfitrión'});
  return l;
};
LOBBY.render = function(){
  const el = LOBBY.el; if(!el) return;
  const e = LOBBY.exp(), role = NET.role;
  let h = `<h2 style="margin:0 0 6px">Cooperativo · ${e ? e.name : tr('Guarida compartida')}</h2>`;
  if(!role){
    h += `<p class="sub">Juega con hasta 4 amigos. Sin servidor: os pasáis un código.</p>
      <button id="lbHost">Crear sala</button> <button id="lbJoinB">Unirme a una sala</button>
      <div id="lbJoinBox" style="display:none;margin-top:10px"><p class="sub">Pega el código del anfitrión:</p>
      <textarea id="lbOffer" rows="3" style="width:100%"></textarea><br><button id="lbConn">Conectar</button></div>`;
  }else{
    h += `<div style="margin:8px 0"><b>Jugadores (${NET.count()}/${NET.MAX}):</b><br>${LOBBY.players().map(p => '· ' + p.name).join('<br>')}</div>`;
    if(role === 'host'){
      h += `<div id="lbOffers"></div><button id="lbInvite">Invitar a otro jugador</button> <p class="sub">Compartís la guarida: cada uno con su alijo. Para salir de expedición juntos, el anfitrión habla con el caballo.</p>`;
    }else{
      h += `<p class="sub">${LOBBY.answer ? 'Envía este código de respuesta al anfitrión:' : 'Conectando…'}</p>${LOBBY.answer ? `<textarea id="lbAns" rows="3" style="width:100%" readonly>${LOBBY.answer}</textarea><br><button id="lbCopy">Copiar</button>` : ''}
        <p class="sub">Compartís la guarida (cada uno con su alijo). Cuando el anfitrión salga de expedición, entrarás automáticamente.</p>`;
    }
  }
  h += `<div style="margin-top:12px">${role ? '<button id="lbHide">Seguir en la guarida</button> ' : ''}<button id="lbClose">${role ? 'Salir de la sala' : 'Cerrar'}</button></div>`;
  el.innerHTML = h;
  const $q = id => el.querySelector('#' + id);
  if($q('lbClose')) $q('lbClose').onclick = () => LOBBY.close(true);
  if($q('lbHide')) $q('lbHide').onclick = () => LOBBY.close(false);
  if($q('lbHost')) $q('lbHost').onclick = async () => { try { await NET.hostOffer().then(o => { LOBBY.offers.push(o); }); } catch(err){ toast(err.message, 2.5); } LOBBY.render(); LOBBY.renderOffers(); };
  if($q('lbJoinB')) $q('lbJoinB').onclick = () => { $q('lbJoinBox').style.display = 'block'; };
  if($q('lbConn')) $q('lbConn').onclick = async () => {
    try { LOBBY.answer = await NET.join($q('lbOffer').value); } catch(err){ toast('Código no válido', 2.5); NET.close(); return; }
    LOBBY.render();
  };
  if($q('lbCopy')) $q('lbCopy').onclick = () => { $q('lbAns').select(); try { document.execCommand('copy'); toast('Copiado', 1.2); } catch(err){} };
  if($q('lbInvite')) $q('lbInvite').onclick = async () => { try { LOBBY.offers.push(await NET.hostOffer()); } catch(err){ toast(err.message, 2.5); } LOBBY.renderOffers(); };
  if(role === 'host') LOBBY.renderOffers();
};
LOBBY.renderOffers = function(){
  const box = LOBBY.el && LOBBY.el.querySelector('#lbOffers'); if(!box) return;
  box.innerHTML = '';
  for(const o of LOBBY.offers){
    if(!NET.pending.has(o.id)) continue;
    const d = document.createElement('div'); d.style.margin = '8px 0';
    d.innerHTML = `<p class="sub">Invitación ${o.id}: envía este código al amigo y pega aquí su respuesta.</p>
      <textarea rows="2" style="width:100%" readonly>${o.code}</textarea><textarea rows="2" style="width:100%" placeholder="Código de respuesta"></textarea><br><button>Aceptar</button>`;
    d.querySelector('button').onclick = async () => {
      try { await NET.hostAccept(o.id, d.querySelectorAll('textarea')[1].value); } catch(err){ toast('Respuesta no válida', 2.5); }
    };
    box.append(d);
  }
};
LOBBY.start = function(){
  if(NET.role !== 'host' || NET.count() < 2) return;
  const seed = Math.floor(Math.random()*1e9);
  NET.send('start', {expId:LOBBY.expId, seed, names:LOBBY.names, host:LOBBY.myName()});
  LOBBY.go(LOBBY.expId, seed);
};
LOBBY.go = function(expId, seed){
  LOBBY.close(false); UI.closeRaidMap && UI.closeRaidMap();
  if(UI.invOpen) UI.closeInv(); if(UI.skillOpen) UI.closeSkills(); if(UI.trainerOpen) UI.closeTrainer(); if(UI.smithOpen) UI.closeSmith(); if(UI.aishOpen) UI.closeAish(); if(UI.oluafOpen) UI.closeOluaf(); if(typeof closePause === 'function') closePause();
  G.mp = true; startRaid(expId, seed); if(NET.role === 'host') coopScaleBosses();
};

// ---------- mensajes ----------
NET.on('peer', d => {
  if(!G.menu) G.mp = true;
  NET.send('hello', {name:LOBBY.myName()}, NET.role === 'host' ? d.id : undefined);
  LOBBY.render();
});
NET.on('hello', (d, from) => { LOBBY.names[from] = d.name; if(NET.role === 'host') NET.send('names', LOBBY.names); LOBBY.render(); });
NET.on('names', d => { Object.assign(LOBBY.names, d); LOBBY.render(); });
NET.on('peerLeft', () => { LOBBY.render(); });
NET.on('closed', () => { if(LOBBY.askEl){ LOBBY.askEl.remove(); LOBBY.askEl = null; } LOBBY.answer = null; if(LOBBY.el) LOBBY.render(); if(G.mp){ G.mp = false; toast('Se ha cerrado la sala', 2.5); } });
NET.on('start', d => {
  const e = (typeof ALL_EXPS === 'function' ? ALL_EXPS() : EXPEDITIONS).find(x => x.id === d.expId);
  if(G.menu || G.sc.kind === 'raid') return;   // ya estás en otra expedición
  if(!e || expLocked(e)){ toast('No tienes desbloqueada esa expedición: te quedas en la guarida', 4); return; }
  Object.assign(LOBBY.names, d.names || {}); LOBBY.names[0] = d.host;
  LOBBY.ask(e, d);
});
// el invitado decide si entra a la expedición del anfitrión o se queda en la guarida (solo el anfitrión gasta la llave)
LOBBY.ask = function(e, d){
  if(LOBBY.askEl) LOBBY.askEl.remove();
  const el = LOBBY.askEl = document.createElement('div');
  el.className = 'panel'; el.style.cssText = 'position:fixed;left:50%;top:30%;transform:translate(-50%,-50%);z-index:60;width:min(420px,calc(100vw - 24px));padding:18px 22px;text-align:center';
  el.innerHTML = `<h2 style="margin:0 0 8px">El anfitrión sale de expedición</h2><p><b>${e.name}</b></p><p class="sub">¿Quieres entrar con él?</p><button id="lbYes">Entrar</button> <button id="lbNo">Quedarme en la guarida</button>`;
  document.body.append(el);
  const done = () => { el.remove(); if(LOBBY.askEl === el) LOBBY.askEl = null; };
  el.querySelector('#lbYes').onclick = () => { done(); if(G.menu || G.sc.kind === 'raid' || !NET.role) return; LOBBY.expId = d.expId; LOBBY.go(d.expId, d.seed); };
  el.querySelector('#lbNo').onclick = done;
};
