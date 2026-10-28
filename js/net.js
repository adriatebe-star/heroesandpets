'use strict';
// =====================================================================
//  Capa de red del multijugador cooperativo
//  Usa PeerJS (conexión directa WebRTC entre jugadores; el servicio público de PeerJS solo sirve para
//  encontrarse con un código corto de 5 letras y trae servidores de respaldo para atravesar routers).
//  API: NET.hostRoom() → Promise<código> · NET.join(código) → Promise · NET.send(tipo, datos[, aId, rel])
//       NET.on(tipo, fn(datos, deId)) · NET.close()
// =====================================================================
const NET = {
  role:null,            // 'host' | 'guest' | null
  myId:0,               // el anfitrión es siempre 0
  peers:new Map(),      // id → {id, conn, open, ping}
  nextId:1, handlers:{}, pending:new Map(),
  MAX:4, hub:null, code:null,
};
NET.PREFIX = 'hpets-';
NET.on = (t, fn) => { (NET.handlers[t] = NET.handlers[t] || []).push(fn); };
NET.emit = (t, d, from) => { for(const fn of NET.handlers[t] || []) try { fn(d, from); } catch(e){ console.error('NET', t, e); } };
NET.count = () => NET.role ? 1 + [...NET.peers.values()].filter(p => p.open).length : 0;
NET.available = () => typeof Peer !== 'undefined';

function netRaw(peer, m){ if(peer.open && peer.conn && peer.conn.open) try { peer.conn.send(m); } catch(e){} }
function netDrop(peer){
  if(!peer.open && !NET.peers.has(peer.id)) return;
  const was = peer.open; peer.open = false; NET.peers.delete(peer.id);
  try { peer.conn.close(); } catch(e){}
  if(was) NET.emit('peerLeft', {id:peer.id}, peer.id);
  if(NET.role === 'guest' && !NET.peers.size){ NET.role = null; NET.emit('closed', {}, 0); }
}
function netOnData(peer, m){
  if(!m || typeof m !== 'object') return;
  peer.lastRx = performance.now();
  if(m.t === '_ping'){ netRaw(peer, {t:'_pong', d:m.d}); return; }
  if(m.t === '_pong'){ peer.ping = Math.round(performance.now() - m.d); return; }
  if(NET.role === 'host' && m.r){   // un invitado pide que se reenvíe a los demás
    for(const p of NET.peers.values()) if(p.open && p !== peer) netRaw(p, {t:m.t, d:m.d, f:peer.id});
  }
  NET.emit(m.t, m.d, m.f != null ? m.f : peer.id);
}
const netCode = () => { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s = ''; for(let i = 0; i < 5; i++) s += A[Math.floor(Math.random()*A.length)]; return s; };

// ---------- anfitrión: crea la sala y devuelve el código ----------
NET.hostRoom = function(){
  if(NET.role === 'guest') return Promise.reject(new Error('Ya eres invitado'));
  if(!NET.available()) return Promise.reject(new Error('Hace falta conexión a internet'));
  if(NET.role === 'host' && NET.code) return Promise.resolve(NET.code);
  return new Promise((res, rej) => {
    let tries = 0;
    const open = () => {
      const code = netCode(), hub = new Peer(NET.PREFIX + code, {debug:0});
      hub.on('open', () => { NET.role = 'host'; NET.myId = 0; NET.hub = hub; NET.code = code; res(code); });
      hub.on('error', e => {
        if(e.type === 'unavailable-id' && ++tries < 6){ try { hub.destroy(); } catch(x){} open(); return; }
        if(!NET.code) rej(new Error(e.type === 'network' || e.type === 'server-error' || e.type === 'socket-error' ? 'No se pudo contactar con el servicio de salas' : 'Error: ' + e.type));
      });
      hub.on('connection', conn => {
        const peer = {id:NET.nextId++, conn, open:false, ping:0};
        conn.on('open', () => {
          if(NET.count() >= NET.MAX){ try { conn.send({t:'_full'}); } catch(e){} setTimeout(() => { try { conn.close(); } catch(e){} }, 400); return; }
          peer.open = true; peer.lastRx = performance.now(); NET.peers.set(peer.id, peer);
          conn.send({t:'_id', d:{id:peer.id}});
          NET.emit('peer', {id:peer.id, open:true}, peer.id);
        });
        conn.on('data', m => netOnData(peer, m));
        conn.on('close', () => netDrop(peer));
        conn.on('error', () => netDrop(peer));
      });
    };
    open();
  });
};

// ---------- invitado: se une con el código ----------
NET.join = function(code){
  if(NET.role) return Promise.reject(new Error('Ya estás en una sala'));
  if(!NET.available()) return Promise.reject(new Error('Hace falta conexión a internet'));
  code = String(code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if(code.length < 4) return Promise.reject(new Error('Escribe el código de la sala'));
  return new Promise((res, rej) => {
    let done = false;
    const fail = msg => { if(done) return; done = true; try { hub.destroy(); } catch(e){} NET.hub = null; if(NET.role === 'guest' && !NET.peers.size) NET.role = null; rej(new Error(msg)); };
    const hub = new Peer({debug:0}); NET.hub = hub;
    const timer = setTimeout(() => fail('No se pudo conectar (tiempo agotado)'), 20000);
    hub.on('error', e => fail(e.type === 'peer-unavailable' ? 'No existe esa sala' : 'No se pudo conectar (' + e.type + ')'));
    hub.on('open', () => {
      const conn = hub.connect(NET.PREFIX + code, {reliable:true, serialization:'json'});
      const peer = {id:0, conn, open:false, ping:0};
      conn.on('data', m => {
        if(m && m.t === '_full'){ fail('La sala está llena'); return; }
        if(m && m.t === '_id' && !peer.open){
          NET.role = 'guest'; NET.myId = m.d.id; NET.code = code; peer.open = true; peer.lastRx = performance.now(); NET.peers.set(0, peer);
          done = true; clearTimeout(timer); res(); NET.emit('peer', {id:0, open:true}, 0); return;
        }
        netOnData(peer, m);
      });
      conn.on('close', () => { if(!done) fail('Conexión cerrada'); else netDrop(peer); });
      conn.on('error', () => { if(!done) fail('No se pudo conectar'); else netDrop(peer); });
    });
  });
};

// ---------- envío ----------
// aId: id del destinatario (solo anfitrión); sin él va a todos. rel=true: el anfitrión lo reenvía al resto (invitado → todos)
NET.send = function(t, d, aId, rel){
  const m = {t, d}; if(rel) m.r = 1;
  if(NET.role === 'guest'){ const p = NET.peers.get(0); if(p) netRaw(p, m); return; }
  for(const p of NET.peers.values()) if(aId == null || aId === p.id) netRaw(p, m);
};
NET.close = function(){
  for(const p of [...NET.peers.values()]) try { p.conn.close(); } catch(e){}
  NET.peers.clear(); NET.pending.clear();
  if(NET.hub){ try { NET.hub.destroy(); } catch(e){} NET.hub = null; }
  const was = NET.role; NET.role = null; NET.myId = 0; NET.code = null; NET.nextId = 1;
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
