'use strict';
// Cooperativo, fase 3: cada jugador envía su estado (~15 Hz) y los demás lo dibujan como avatar con su equipo
G.remote = [];
const COOP = {acc:0, eqKey:'', eqT:0, names:{}};
const COOP_EQ_SLOTS = ['head', 'chest', 'hands', 'feet', 'shield', 'w1', 'w2'];
const COOP_COLS = ['#58c8ff', '#ffd060', '#c690ff', '#7aff9a'];

function coopEquip(){
  const e = {}, E = G.inv.equip;
  for(const k of COOP_EQ_SLOTS) e[k] = E[k] ? {id:E[k].id, rarity:E[k].rarity} : null;
  return e;
}
// luz del farolillo para los compañeros: [radio, desplazamiento x, y, tinte] o 0 si está apagado
function coopLight(){
  if(P.dead || !P.lantern || P.hallT > 0 || !(P.oil > 0 || G.sc.kind !== 'raid')) return 0;
  const gm = lanternGem(), E = G.inv.equip;
  const r = 175*(gm.light || 1)*(legendOn('minerhelm') ? 1.3 : 1)*((E.head && ITEMS[E.head.id].lightMul) || 1)*(E.lantern && E.lantern.id === 'dawnlantern' ? 1.4 : 1);
  const dx = (P.lx ?? P.x) - P.x, dy = (P.ly ?? P.y) - P.y, ok = Math.abs(dx) < 80 && Math.abs(dy) < 80;   // lx/ly los calcula el dibujo del héroe
  return [Math.round(r), ok ? Math.round(dx) : 0, ok ? Math.round(dy) : -12, gemTint(gm)];
}
function coopSceneKey(){ return G.sc.exp ? G.sc.exp.id : G.sc.kind + ':' + (G.sc.name || ''); }
function coopState(){
  const f = ['x', 'y', 'face', 'moving', 'walk', 'punchT', 'punchDur', 'combo', 'atkKind', 'jumpZ', 'blocking', 'hp', 'maxHp', 'dead', 'sitting', 'invisT', 'frozenT', 'inv', 'dashT'];
  const s = {}; for(const k of f) s[k] = P[k];
  s.x = Math.round(P.x); s.y = Math.round(P.y); s.walk = +P.walk.toFixed(2); s.face = +P.face.toFixed(2);
  s.pt = coopPetsState(); s.lt = coopLight(); s.aw = G.activeW; s.sc = coopSceneKey();
  const eq = coopEquip(), key = JSON.stringify(eq);
  if(key !== COOP.eqKey || COOP.eqT > 2){ s.eq = eq; COOP.eqKey = key; COOP.eqT = 0; }
  return s;
}
function coopRemote(id){
  let r = G.remote.find(q => q.id === id);
  if(!r){ r = Object.assign(newPlayer(0, 0), {id, tx:null, ty:null, eq:{}, aw:0, name:COOP.names[id] || ('Jugador ' + id), col:COOP_COLS[id % 4], fresh:true, netId:id, z:0, exhaustedT:0, def:{id:'__remote', affixes:[], stealth:false}}); G.remote.push(r); }
  return r;
}
NET.on('st', (s, from) => {
  const r = coopRemote(from), eq = s.eq, pt = s.pt; delete s.eq; delete s.pt; if(pt) coopPetsApply(r, pt);
  const ox = r.x, oy = r.y, now = performance.now();   // Object.assign pisaba la posición suavizada con la del paquete: de ahí los tirones
  if(!r.fresh && r.rt && now - r.rt > 5){ const d = (now - r.rt)/1000; r.vx = clamp((s.x - r.tx)/d, -420, 420); r.vy = clamp((s.y - r.ty)/d, -420, 420); } else { r.vx = r.vy = 0; }
  r.rt = now;
  Object.assign(r, s); r.tx = s.x; r.ty = s.y; r.x = r.fresh ? s.x : ox; r.y = r.fresh ? s.y : oy; r.fresh = false;
  if(eq) r.eq = eq;
  r.seen = G.t;
});
NET.on('peerLeft', d => { G.remote = G.remote.filter(r => r.id !== d.id); });
NET.on('closed', () => { G.remote = []; });
NET.on('names', d => { Object.assign(COOP.names, d); for(const r of G.remote) if(d[r.id]) r.name = d[r.id]; });
NET.on('hello', (d, from) => { COOP.names[from] = d.name; const r = G.remote.find(q => q.id === from); if(r) r.name = d.name; });

function coopUpdate(dt){
  if(!NET.role || !G.mp) { if(G.remote.length) G.remote = []; return; }
  COOP.eqT += dt; COOP.acc += dt; COOP.snapT = (COOP.snapT || 0) + dt;
  if(NET.role === 'host' && G.sc.kind === 'raid' && COOP.snapT >= .1){ COOP.snapT = 0; coopSnapshot(); coopScanNew(); }
  if(COOP.acc >= 1/30){
    COOP.acc = 0;
    // el anfitrión reenvía a los demás con el id de origen (relé), así todos se ven entre sí
    NET.send('st', coopState(), undefined, true);
  }
  for(const r of G.remote){
    for(const g of r.ghosts || []){ const q = Math.min(1, dt*10); g.x += (g.tx - g.x)*q; g.y += (g.ty - g.y)*q; }
    if(r.tx != null){   // se predice un poco con la velocidad del último paquete y se suaviza hacia ese punto
      const ah = Math.min(.12, (performance.now() - (r.rt || 0))/1000), k = Math.min(1, dt*16);
      r.x += (r.tx + (r.vx || 0)*ah - r.x)*k; r.y += (r.ty + (r.vy || 0)*ah - r.y)*k;
    }
    r.hidden = r.sc !== undefined && r.sc !== coopSceneKey();
  }
}

// dibuja a un compañero con el mismo código del héroe: se cambian por un momento P y el equipo
function drawRemote(r){
  if(r.dead || r.hidden) return;
  for(const g of r.ghosts || []) if(g.def && PET_ART[g.def.id]) drawPet(g);
  const sP = P, sInv = G.inv, sW = G.activeW;
  try {
    P = r; G.inv = {equip:Object.assign(emptyEquip(), r.eq || {}), bag:[]}; G.activeW = r.aw || 0;
    if(r.frozenT > 0){ b.save(); b.filter = 'sepia(1) hue-rotate(170deg) saturate(2.6) brightness(1.2)'; drawHero(); b.restore(); } else drawHero();
  } finally { P = sP; G.inv = sInv; G.activeW = sW; }
  const x = Math.round(r.x), y = Math.round(r.y) - 38 - Math.round(r.jumpZ || 0), w = 22, f = clamp(r.hp/(r.maxHp || 100), 0, 1);
  b.globalAlpha = 1; b.fillStyle = '#000'; b.fillRect(x - w/2 - 1, y - 1, w + 2, 4);
  b.fillStyle = '#2faa44'; b.fillRect(x - w/2, y, Math.round(w*f), 2);
  b.fillStyle = r.col; b.fillRect(x - 2, y - 4, 4, 2);
}
// nombres encima (en pantalla, no en el buffer pixelado)
function coopDrawNames(){
  if(NET.role && G.mp){   // indicador de sala: jugadores y ping
    const ping = Math.max(0, ...[...NET.peers.values()].map(p => p.ping || 0));
    ctx.save(); ctx.font = `${5*S}px ${FONT}`; ctx.textAlign = 'left';
    textO(tr('Cooperativo') + ' · ' + NET.count() + '/' + NET.MAX + ' · ' + ping + ' ms', 14, 78, ping > 200 ? '#ff8a6a' : ping > 100 ? '#ffd166' : '#8affb0'); ctx.restore();
  }
  if(!G.remote.length) return;
  ctx.save(); ctx.font = `${6*S}px ${FONT}`; ctx.textAlign = 'center';
  for(const r of G.remote){
    if(r.dead || r.hidden) continue;
    const sx = (r.x + G.ox)*PX, sy = (r.y - 48 - (r.jumpZ || 0) + G.oy)*PX;
    textO(r.name, sx, sy, r.col);
  }
  ctx.restore();
}

// =====================================================================
//  Fase 4: el anfitrión simula los monstruos; los invitados los reflejan
// =====================================================================
const COOP_SKIP = {id:1, hop:1, walk:1, dying:1, home:1};
const coopRound = (k, v) => (k === 'x' || k === 'y') ? Math.round(v*10)/10 : Math.round(v*100)/100;
function coopMonDelta(m, full){
  if(full || !m._sent) m._sent = {};
  const sent = m._sent, d = {i:m.id};
  for(const k in m){
    if(COOP_SKIP[k] || k[0] === '_') continue;
    const v = m[k], t = typeof v; let r;
    if(t === 'number') r = coopRound(k, v); else if(t === 'boolean' || t === 'string') r = v;
    else if(k === 'affixes' && Array.isArray(v)) r = v.join(',');
    else continue;
    if(sent[k] !== r){ sent[k] = r; d[k] = k === 'affixes' ? v : r; }
  }
  if(m.dying && !sent.dy){ sent.dy = 1; d.dy = 1; }
  return Object.keys(d).length > 1 ? d : null;
}
function coopSnapshot(){
  if(G.sc.kind !== 'raid') return;
  const near = [P].concat(G.remote.filter(r => !r.hidden)), full = (COOP.snapN = (COOP.snapN || 0) + 1) % 10 === 0;
  const ids = [], mons = [];
  for(const m of G.mons){
    if(m.id <= 0) continue; ids.push(m.id);
    if(!near.some(p => Math.hypot(p.x - m.x, p.y - m.y) < 1100)){ m._sent = null; continue; }
    const d = coopMonDelta(m, full); if(d) mons.push(d);
  }
  NET.send('ms', {ids, mons:mons.slice(0, 20)});
  for(let i = 20; i < mons.length; i += 20) NET.send('ms', {mons:mons.slice(i, i + 20)});
}
function coopStubMon(type){ return {x:P.x + 20, y:P.y, affixes:[], dying:1, type:MONSTERS[type] ? type : 'small', rarity:'normal', r:8}; }
function coopClone(o){
  return JSON.parse(JSON.stringify(o, (k, v) => {
    if(v instanceof Set) return {__set:1};
    if(v && typeof v === 'object' && v !== o){ if(v.affixes && v.art) return {__mon:v.id}; if(v.def || v === P) return undefined; }
    return v;
  }));
}
function coopRevive(o){
  for(const k in o){ const v = o[k]; if(v && typeof v === 'object'){ if(v.__set) o[k] = new Set(); else if(v.__mon !== undefined) o[k] = G.mons.find(m => m.id === v.__mon) || coopStubMon(); else coopRevive(v); } }
  return o;
}
// proyectiles y peligros nuevos de los monstruos: se envían al crearse y cada cliente los simula contra su propio héroe
function coopScanNew(){
  const pr = [], hz = [];
  for(const p of G.projs) if(p.from === 'mon' && !p._nid){ p._nid = 1; try { pr.push(coopClone(p)); } catch(e){} }
  for(const h of G.hazards) if(!h._nid && !h.pet && h.type !== 'flock' && h.type !== 'whirl'){ h._nid = 1; try { hz.push(coopClone(h)); } catch(e){} }
  if(pr.length) NET.send('pr', pr);
  if(hz.length) NET.send('hz', hz);
}
NET.on('pr', list => { if(NET.role === 'guest' && G.mp && G.sc.kind === 'raid') for(const p of list){ coopRevive(p); p._nid = 1; if(!p.mon) p.mon = coopStubMon(); G.projs.push(p); } });
NET.on('hz', list => { if(NET.role === 'guest' && G.mp && G.sc.kind === 'raid') for(const h of list){ coopRevive(h); h._nid = 1; G.hazards.push(h); } });

NET.on('ms', d => {
  if(NET.role !== 'guest' || !G.mp || G.sc.kind !== 'raid') return;
  for(const f of d.mons || []){
    let m = G.mons.find(q => q.id === f.i);
    if(!m){
      if(!f.type) continue;
      m = mkMonster(f.type, f.rarity || 'normal', f.x, f.y, {affixes:f.affixes || [], name:f.name, small:!!f.small, instant:true});
      m.id = f.i; m.tx = f.x; m.ty = f.y; G.mons.push(m);
    }
    for(const k in f){
      if(k === 'i') continue;
      if(k === 'dy'){ if(!m.dying) killMonster(m, true); continue; }
      if(k === 'x'){ m.tx = f.x; continue; } if(k === 'y'){ m.ty = f.y; continue; }
      m[k] = f[k];
    }
    if(MONSTERS[m.type] && MONSTERS[m.type].boss && m.awake && !m.dying) G.bossFight = m;
  }
  if(d.ids){
    const set = new Set(d.ids);
    for(const m of G.mons) if(m.id > 0 && !set.has(m.id) && !m.dying) killMonster(m, true);
  }
});
function coopMirrorMons(dt){
  for(const m of G.mons){
    if(m.dying){ m.dying += dt; continue; }
    if(m.tx != null){
      const dx = m.tx - m.x, dy = m.ty - m.y, dd = Math.hypot(dx, dy);
      if(dd > 300){ m.x = m.tx; m.y = m.ty; } else { const k = Math.min(1, dt*12); m.x += dx*k; m.y += dy*k; }
      if(dd > .5) m.hop += dt*(m.art === 'big' ? 5 : 7);
    }
    if(m.flash > 0) m.flash -= dt;
  }
}

// golpes del invitado: se aplican en el anfitrión (los modificadores ya vienen aplicados)
function coopSendHit(m, dmg, o){
  const q = {}; for(const k in o){ const v = o[k]; if(typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string') q[k] = v; }
  NET.send('hit', {id:m.id, dmg, o:q});
  m.hp -= dmg; m.flash = .12; m.lastHit = 0; m.aggro = true;
  if(o.src === 'player' && G.stats && G.stats.leech && !P.dead) P.hp = Math.min(P.maxHp, P.hp + dmg*G.stats.leech/100);
  sfx(o.src === 'pet' ? 'petHit' : 'slime', .03);
  addText(m.x + rand(-5, 5), m.y - m.r*2 - 8, o.crit ? dmg + '!' : '' + dmg, o.src === 'pet' ? '#f2c46d' : o.crit ? '#ffd166' : '#ffffff', o.crit ? 11 : 8);
  const hx = m.x - (o.nx || 0)*m.r*.6, hy = m.y - (o.ny || 0)*m.r*.6 - 8;
  ring(hx, hy, o.crit ? 20 : 13); burst(hx, hy, o.crit ? 12 : 7, ['#ffffff', '#fff7d6'], [80, 240], [.2, .45]);
}
NET.on('hit', (d, from) => {
  if(NET.role !== 'host' || !G.mp) return;
  const m = G.mons.find(q => q.id === d.id); if(!m || m.dying) return;
  hitMonster(m, d.dmg, Object.assign({}, d.o, {src:'net', pre:true}));
});
// daño de un monstruo del anfitrión a un compañero: lo aplica su dueño
function coopHurt(p, dmg, m, ranged){
  if(NET.role !== 'host') return;
  NET.send('hurt', {d:Math.round(dmg*(ranged ? 1 : 1)), mid:m ? m.id : 0, t:m ? m.type : ''}, p.netId);
}
NET.on('hurt', d => {
  if(!G.mp || P.dead) return;
  const m = G.mons.find(q => q.id === d.mid) || coopStubMon(d.t);
  damagePlayer(d.d, m);
});
// los jefes ganan un 60 % de vida por cada jugador extra
function coopScaleBosses(){
  const extra = NET.count() - 1; if(extra <= 0) return;
  for(const m of G.mons){ m.maxHp *= 1 + (MONSTERS[m.type].boss ? .6 : .4)*extra; m.hp = m.maxHp; }   // jefes +60 % de vida por jugador extra, el resto +40 %
}

// =====================================================================
//  Fase 5: cofres y jaulas compartidos y chat
// =====================================================================
// cofres compartidos: al abrirlo uno se abre para todos, pero cada uno tira y ve su propio botín; las jaulas son individuales
function coopOpened(kind, c){ if(kind === 'chest' && NET.role && G.mp && !COOP.remoteOpen) NET.send('opn', {x:Math.round(c.x), y:Math.round(c.y)}, undefined, true); }
NET.on('opn', d => {
  if(!G.mp || G.sc.kind !== 'raid') return;
  const c = G.sc.chests.find(q => !q.open && Math.abs(q.x - d.x) < 6 && Math.abs(q.y - d.y) < 6); if(!c) return;
  COOP.remoteOpen = true; try { openChest(c); } finally { COOP.remoteOpen = false; }
});
NET.on('chat', t => { if(G.mp) chatSay(t, '#9ad8ff'); });

// =====================================================================
//  Ataques directos de jefes sobre los compañeros + mascotas del compañero
// =====================================================================
function coopHitAv(m, dmg, test){
  if(NET.role !== 'host' || !G.mp) return;
  for(const r of G.remote) if(!r.dead && !r.hidden && !(r.jumpZ > 6) && test(r)) coopHurt(r, dmg, m);
}
{
  const slash = bossSlash, slam = bossSlam;
  bossSlash = function(m, reach, half, mul, cols, onHit){
    const aim = m.aim ?? angTo(m); slash(m, reach, half, mul, cols, onHit);
    coopHitAv(m, (m.curDmg || m.dmg)*mul, r => Math.hypot(r.x - m.x, r.y - m.y) < reach + 7 && Math.abs(angDiff(Math.atan2(r.y - m.y, r.x - m.x), aim)) < half);
  };
  bossSlam = function(m, r0, mul, col){
    const hit = slam(m, r0, mul, col);
    coopHitAv(m, (m.curDmg || m.dmg)*mul, r => Math.hypot(r.x - m.x, (r.y - m.y)*1.2) < r0);
    return hit;
  };
}
// mascotas: se envían con el estado y se dibujan como fantasmas animados junto a su dueño
function coopPetsState(){ return G.pets.map(p => [p.def.id, Math.round(p.x), Math.round(p.y), Math.round(p.z || 0), p.dir, p.moving ? 1 : 0, +(p.walk || 0).toFixed(1), p.item && p.item.shiny ? 1 : 0]); }
function coopPetsApply(r, list){
  r.ghosts ||= [];
  list.forEach((q, i) => {
    let g = r.ghosts[i];
    if(!g || g.def.id !== q[0]) g = r.ghosts[i] = {def:PETS[q[0]], item:{shiny:!!q[7]}, x:q[1], y:q[2], z:0, dir:1, walk:0, flash:0, exhaustedT:0};
    g.tx = q[1]; g.ty = q[2]; g.z = q[3]; g.dir = q[4]; g.moving = !!q[5]; g.walk = q[6]; g.item.shiny = !!q[7];
  });
  r.ghosts.length = list.length;
}

// objetos tirados al suelo: los ven y los pueden coger los compañeros (id de objeto `lid`)
function coopDropped(l){
  if(!l || !NET.role || !G.mp) return;
  l.lid = NET.myId*100000 + (COOP.lid = (COOP.lid || 0) + 1);
  NET.send('ld', {lid:l.lid, item:l.item, x:Math.round(l.x), y:Math.round(l.y), sc:coopSceneKey()}, undefined, true);
}
NET.on('ld', d => {
  if(!G.mp || G.sc.kind !== 'raid' || d.sc !== coopSceneKey()) return;
  dropItem(d.x, d.y, d.item); G.loot[G.loot.length-1].lid = d.lid;
});
NET.on('lp', d => { for(const l of G.loot) if(l.lid === d.lid) l.taken = true; G.loot = G.loot.filter(o => !o.taken); });

// comprobación de que todos generan el mismo mapa y tienen la misma versión
function coopMapHash(){
  const s = G.sc, str = JSON.stringify([s.chests.map(c => [c.x, c.y, c.rare ? 1 : 0]), s.cages.map(c => [c.x, c.y]), s.portals.map(p => [p.x, p.y]), s.props.length, s.props.slice(0, 400).map(p => [p.x|0, p.y|0]), (s.walls || []).length, s.spawn]);
  let h = 0; for(let i = 0; i < str.length; i++) h = (h*31 + str.charCodeAt(i)) | 0; return h;
}
const COOP_VER = (document.title.match(/v(d{8}w)/) || [])[1] || '?';
function coopCheckMap(){
  const m = LOBBY.hostMap; if(!m || !G.sc.exp || m.exp !== G.sc.exp.id) return;
  if(NET.role === 'guest' && m.h !== coopMapHash()) toast('⚠ Tu mapa no coincide con el del anfitrión (¿versión distinta?)', 9);
}
NET.on('mh', d => { LOBBY.hostMap = d; coopCheckMap(); });
