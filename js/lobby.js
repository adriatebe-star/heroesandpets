'use strict';
// Sala del modo cooperativo: crear/unirse con códigos (WebRTC manual) y arrancar la expedición con la misma semilla
const LOBBY = {el:null, expId:null, offers:[], names:{}};

LOBBY.myName = () => G.save.name || 'Viajero';
LOBBY.exp = () => LOBBY.expId ? (typeof ALL_EXPS === 'function' ? ALL_EXPS() : EXPEDITIONS).find(e => e.id === LOBBY.expId) : null;

LOBBY.open = function(expId){
  LOBBY.expId = expId; if(!NET.role){ LOBBY.names = {}; LOBBY.msg = ''; LOBBY.joining = false; }
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
    h += `<p class="sub">Juega con hasta 4 amigos. Uno crea la sala y los demás se unen con su código de 5 letras.</p>
      <button id="lbHost">Crear sala</button> <button id="lbJoinB">Unirme a una sala</button>
      <div id="lbJoinBox" style="display:${LOBBY.joining ? 'block' : 'none'};margin-top:10px"><p class="sub">Escribe el código de la sala:</p>
      <input id="lbCode" maxlength="6" autocomplete="off" style="width:9em;font-size:22px;letter-spacing:4px;text-transform:uppercase;text-align:center"> <button id="lbConn">Conectar</button></div>
      <p class="sub" id="lbMsg">${LOBBY.msg || ''}</p><button id="lbDiag">Diagnóstico de conexión</button><pre id="lbDiagOut" style="white-space:pre-wrap;font-size:12px;text-align:left;margin:8px 0 0">${LOBBY.diag || ''}</pre>`;
  }else{
    h += `<div style="margin:8px 0"><b>Jugadores (${NET.count()}/${NET.MAX}):</b><br>${LOBBY.players().map(p => '· ' + p.name).join('<br>')}</div>`;
    if(role === 'host'){
      h += `<p class="sub">Código de la sala (díselo a tus amigos):</p><div id="lbRoom" style="font-size:34px;letter-spacing:6px;margin:4px 0 8px">${NET.code || ''}</div><button id="lbCopy">Copiar código</button>
        <p class="sub">Compartís la guarida: cada uno con su alijo. Para salir de expedición juntos, el anfitrión habla con el caballo.</p>`;
    }else{
      h += `<p class="sub">Compartís la guarida (cada uno con su alijo). Cuando el anfitrión salga de expedición, entrarás automáticamente.</p>`;
    }
  }
  h += `<div style="margin-top:12px">${role ? '<button id="lbHide">Seguir en la guarida</button> ' : ''}<button id="lbClose">${role ? 'Salir de la sala' : 'Cerrar'}</button></div>`;
  el.innerHTML = h;
  const $q = id => el.querySelector('#' + id);
  if($q('lbClose')) $q('lbClose').onclick = () => LOBBY.close(true);
  if($q('lbHide')) $q('lbHide').onclick = () => LOBBY.close(false);
  if($q('lbHost')) $q('lbHost').onclick = async () => {
    LOBBY.msg = 'Creando la sala…'; LOBBY.render();
    try { await NET.hostRoom(); LOBBY.msg = ''; } catch(err){ LOBBY.msg = err.message; }
    LOBBY.render();
  };
  if($q('lbJoinB')) $q('lbJoinB').onclick = () => { LOBBY.joining = true; LOBBY.render(); const c = LOBBY.el.querySelector('#lbCode'); if(c) c.focus(); };
  const conn = async () => {
    const v = $q('lbCode').value; LOBBY.msg = 'Conectando…'; LOBBY.joining = true; LOBBY.render(); LOBBY.el.querySelector('#lbCode').value = v.toUpperCase();
    try { await NET.join(v); LOBBY.msg = ''; LOBBY.joining = false; } catch(err){ LOBBY.msg = err.message; }
    LOBBY.render();
  };
  if($q('lbConn')) $q('lbConn').onclick = conn;
  if($q('lbCode')) $q('lbCode').onkeydown = ev => { if(ev.key === 'Enter') conn(); };
  if($q('lbDiag')) $q('lbDiag').onclick = async () => { LOBBY.diag = 'Comprobando…'; $q('lbDiagOut').textContent = LOBBY.diag; LOBBY.diag = await NET.diagnose(); if(LOBBY.el) LOBBY.render(); };
  if($q('lbCopy')) $q('lbCopy').onclick = () => { try { navigator.clipboard.writeText(NET.code); toast('Código copiado', 1.4); } catch(err){} };
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
  G.mp = true; startRaid(expId, seed); if(NET.role === 'host'){ coopScaleBosses(); NET.send('mh', {exp:expId, h:coopMapHash()}); } else coopCheckMap();
};

// ---------- mensajes ----------
NET.on('peer', d => {
  if(!G.menu) G.mp = true;
  NET.send('hello', {name:LOBBY.myName(), ver:COOP_VER}, NET.role === 'host' ? d.id : undefined);
  LOBBY.render();
});
NET.on('hello', (d, from) => { if(d.ver && d.ver !== COOP_VER) toast('⚠ Versión distinta: tú ' + COOP_VER + ', ' + d.name + ' ' + d.ver + '. Actualizad el juego', 10); LOBBY.names[from] = d.name; if(NET.role === 'host') NET.send('names', LOBBY.names); LOBBY.render(); });
NET.on('names', d => { Object.assign(LOBBY.names, d); LOBBY.render(); });
NET.on('peerLeft', () => { LOBBY.render(); });
NET.on('closed', () => { LOBBY.msg = ''; if(LOBBY.askEl){ LOBBY.askEl.remove(); LOBBY.askEl = null; } if(LOBBY.el) LOBBY.render(); if(G.mp){ G.mp = false; toast('Se ha cerrado la sala', 2.5); } });
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
