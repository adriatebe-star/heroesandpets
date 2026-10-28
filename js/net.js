'use strict';
// =====================================================================
//  Capa de red del multijugador cooperativo (WebRTC, sin servidor propio)
//  El anfitrión crea un código por invitado; el invitado devuelve un código de respuesta.
//  API: NET.hostOffer() → {id, code} · NET.hostAccept(id, answer) · NET.join(code) → Promise<answer>
//       NET.send(tipo, datos[, aId]) · NET.on(tipo, fn(datos, deId)) · NET.close()
// =====================================================================
const NET = {
  role:null,            // 'host' | 'guest' | null
  myId:0,               // el anfitrión es siempre 0
  peers:new Map(),      // id → {id, pc, ch, open, ping, name}
  nextId:1, handlers:{}, pending:new Map(),
  STUN:[{urls:'stun:stun.l.google.com:19302'}],
  MAX:4,
};
const netEnc = o => btoa(unescape(encodeURIComponent(JSON.stringify(o))));
const netDec = s => JSON.parse(decodeURIComponent(escape(atob(s.trim()))));

NET.on = (t, fn) => { (NET.handlers[t] = NET.handlers[t] || []).push(fn); };
NET.emit = (t, d, from) => { for(const fn of NET.handlers[t] || []) try { fn(d, from); } catch(e){ console.error('NET', t, e); } };
NET.count = () => NET.role ? 1 + [...NET.peers.values()].filter(p => p.open).length : 0;

function netWaitIce(pc){
  return new Promise(res => {
    if(pc.iceGatheringState === 'complete') return res();
    const f = () => { if(pc.iceGatheringState === 'complete'){ pc.removeEventListener('icegatheringstatechange', f); res(); } };
    pc.addEventListener('icegatheringstatechange', f); setTimeout(res, 4000);   // tope por si no hay más candidatos
  });
}
function netBindChannel(peer){
  const ch = peer.ch;
  ch.onopen = () => { if(peer.open) return; peer.open = true; peer.lastRx = performance.now(); NET.emit('peer', {id:peer.id, open:true}, peer.id); };
  ch.onclose = () => netDrop(peer);
  ch.onmessage = e => {
    peer.lastRx = performance.now();
    let m; try { m = JSON.parse(e.data); } catch(err){ return; }
    if(m.t === '_ping'){ netRaw(peer, {t:'_pong', d:m.d}); return; }
    if(m.t === '_pong'){ peer.ping = Math.round(performance.now() - m.d); return; }
    if(NET.role === 'host' && m.r){   // un invitado pide que se reenvíe a los demás
      for(const p of NET.peers.values()) if(p.open && p !== peer) netRaw(p, {t:m.t, d:m.d, f:peer.id});
    }
    NET.emit(m.t, m.d, m.f != null ? m.f : peer.id);
  };
}
function netDrop(peer){
  if(!peer.open && !NET.peers.has(peer.id)) return;
  const was = peer.open; peer.open = false; NET.peers.delete(peer.id);
  try { peer.pc.close(); } catch(e){}
  if(was) NET.emit('peerLeft', {id:peer.id}, peer.id);
  if(NET.role === 'guest' && !NET.peers.size){ NET.role = null; NET.emit('closed', {}, 0); }
}
function netRaw(peer, m){ if(peer.open && peer.ch.readyState === 'open') peer.ch.send(JSON.stringify(m)); }

// ---------- anfitrión ----------
NET.hostOffer = async function(){
  if(NET.role === 'guest') throw new Error('Ya eres invitado');
  if(NET.count() + NET.pending.size >= NET.MAX) throw new Error('Sala llena (máx. ' + NET.MAX + ')');
  NET.role = 'host'; NET.myId = 0;
  const id = NET.nextId++, pc = new RTCPeerConnection({iceServers:NET.STUN}), peer = {id, pc, ch:null, open:false, ping:0};
  peer.ch = pc.createDataChannel('hp', {ordered:false, maxRetransmits:0});   // snapshots: mejor perder que retrasar
  NET.pending.set(id, peer); netBindChannel(peer);
  pc.onconnectionstatechange = () => { if(['failed', 'closed', 'disconnected'].includes(pc.connectionState)) netDrop(peer); };
  await pc.setLocalDescription(await pc.createOffer()); await netWaitIce(pc);
  return {id, code:netEnc({id, sdp:pc.localDescription})};
};
NET.hostAccept = async function(id, answerCode){
  const peer = NET.pending.get(id); if(!peer) throw new Error('Invitación desconocida');
  const a = netDec(answerCode); await peer.pc.setRemoteDescription(a.sdp);
  NET.pending.delete(id); NET.peers.set(id, peer);
};
NET.cancelOffer = id => { const p = NET.pending.get(id); if(p){ try { p.pc.close(); } catch(e){} NET.pending.delete(id); } };

// ---------- invitado ----------
NET.join = async function(offerCode){
  if(NET.role) throw new Error('Ya estás en una sala');
  const o = netDec(offerCode); NET.role = 'guest'; NET.myId = o.id;
  const pc = new RTCPeerConnection({iceServers:NET.STUN}), peer = {id:0, pc, ch:null, open:false, ping:0};
  NET.peers.set(0, peer);
  pc.ondatachannel = e => { peer.ch = e.channel; netBindChannel(peer); if(peer.ch.readyState === 'open') peer.ch.onopen(); };
  pc.onconnectionstatechange = () => { if(['failed', 'closed', 'disconnected'].includes(pc.connectionState)) netDrop(peer); };
  await pc.setRemoteDescription(o.sdp); await pc.setLocalDescription(await pc.createAnswer()); await netWaitIce(pc);
  return netEnc({id:o.id, sdp:pc.localDescription});
};

// ---------- envío ----------
// aId: id del destinatario (solo anfitrión); sin él va a todos. rel=true: el anfitrión lo reenvía al resto (invitado → todos)
NET.send = function(t, d, aId, rel){
  const m = {t, d}; if(rel) m.r = 1;
  if(NET.role === 'guest'){ netRaw(NET.peers.get(0), m); return; }
  for(const p of NET.peers.values()) if(aId == null || aId === p.id) netRaw(p, m);
};
NET.close = function(){
  for(const p of [...NET.peers.values(), ...NET.pending.values()]) try { p.pc.close(); } catch(e){}
  NET.peers.clear(); NET.pending.clear(); const was = NET.role; NET.role = null; NET.myId = 0;
  if(was) NET.emit('closed', {}, 0);
};
// latido: mide el ping y detecta compañeros que se han caído sin cerrar
setInterval(() => {
  const now = performance.now();
  for(const p of [...NET.peers.values()]){
    if(!p.open) continue;
    if(now - p.lastRx > 9000){ netDrop(p); continue; }
    netRaw(p, {t:'_ping', d:now});
  }
}, 2000);
