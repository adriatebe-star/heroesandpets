'use strict';
// =====================================================================
//  Nivel 12: portales de Rolecs hacia tres expediciones ocultas (isla jurásica, castillo de Camelot, ciudad espacial).
//  Aquí vive lo compartido: portal y llaves del tiempo, el marco de los jefes, el constructor de mapas por salas y los legendarios generales.
// =====================================================================
const HIDDEN_EXPEDITIONS = [];   // expediciones que solo se alcanzan por el portal de Rolecs (no salen en el mapa de incursiones)
const RAID_BUILDERS = {};
const PORTAL_DESTS = ['jurassic', 'camelot', 'space'];
function takeItem(id){
  const dec = (arr, i) => { if(arr[i].n > 1) arr[i].n--; else arr[i] = null; };
  for(const arr of [G.inv.bag, G.save.stash]) for(let i = 0; i < arr.length; i++) if(arr[i] && arr[i].id === id){ dec(arr, i); return true; }
  const E = G.inv.equip; for(const k in E){ const it = E[k]; if(it && !Array.isArray(it) && it.id === id){ if(it.n > 1) it.n--; else E[k] = null; return true; } }
  return false;
}
// Rolecs: cada llave del tiempo abre UN portal aleatorio hacia una de las tres expediciones del nivel 12
function rolecsOpenPortal(){
  const s = G.save;
  if(s.rolecsPortal){ UI.say('Rolecs, señor del tiempo', ['Ya hay un portal abierto. Cruza esa puerta antes de pedirme otro.']); return; }
  if(!countItem('timekey')){ UI.say('Rolecs, señor del tiempo', ['Aún no tienes ninguna llave del tiempo. Los fantasmas del ascenso gélido y los hombres pez de la ciudad flotante las guardan.']); return; }
  takeItem('timekey'); s.rolecsPortal = pick(PORTAL_DESTS); saveGame(); UI.refresh();
  UI.say('Rolecs, señor del tiempo', ['Ah... una llave del tiempo. Déjame sentirla.', 'El tiempo se pliega. Hay tres instantes que aún no han ocurrido y uno de ellos acaba de abrirse ahí detrás.', 'No sé adónde llevará. Cada portal se cierra al cruzarlo, y cada uno cuesta una llave. Buena suerte, viajero.']);
  sfx('alba'); ring(0, -170, 60, '#8a7aff', .6); burst(0, -172, 30, ['#8a7aff', '#ffffff', '#c8b8ff'], [40, 160], [.5, 1], -30);
}
function useTimePortal(){
  const s = G.save;
  if(!s.rolecsPortal){ UI.say('Portal del tiempo', ['Un anillo de piedra cubierto de relojes. No reacciona a nada: le falta una llave del tiempo (Rolecs sabrá qué hacer con ella).']); return; }
  UI.say('Portal del tiempo', [{text:'El portal vibra y muestra un lugar que aún no existe. ¿Cruzarlo? (se cierra al entrar)', choice:[{label:'Cruzar el portal', fn:() => { const d = s.rolecsPortal; s.rolecsPortal = false; saveGame(); startRaid(d); }}, {label:'Todavía no'}]}]);
}

// ---------- marco de jefes: cada jefe es una tabla de ataques (BRAINS) y las mecánicas salen de estos ayudantes ----------
const BRAINS = {};
const angTo = m => Math.atan2(P.y - m.y, P.x - m.x);
function bossSlash(m, reach, half, mul, cols, onHit){   // tajo en abanico hacia donde apuntaba
  const dmg = (m.curDmg || m.dmg)*mul, aim = m.aim ?? angTo(m);
  const inArc = t => { const ax = t.x - m.x, ay = t.y - m.y; return Math.hypot(ax, ay) < reach + (t.r || 6) && Math.abs(angDiff(Math.atan2(ay, ax), aim)) < half; };
  for(let i = -4; i <= 4; i++){ const a = aim + i*half/4; for(let r2 = 30; r2 <= reach; r2 += 22) G.parts.push({x:m.x + Math.cos(a)*r2, y:m.y - 12 + Math.sin(a)*r2*.8, vx:Math.cos(a)*40, vy:Math.sin(a)*30 - 10, life:.35, max:.35, size:2.4, col:pick(cols)}); }
  G.shake = Math.max(G.shake, 5); sfx('boom');
  for(const p of G.pets) if(p.z < 8 && inArc(p)) damagePet(p, dmg*.8, m);
  if(!P.dead && inArc(P) && !(P.jump || (P.jumpZ||0) > 6) && damagePlayer(dmg, m) && onHit) onHit();
}
function bossSlam(m, r, mul, col){   // golpe en área alrededor del jefe (se esquiva saltando)
  const dmg = (m.curDmg || m.dmg)*mul;
  G.hazards.push({type:'slam', x:m.x, y:m.y, r, life:.35, max:.35}); G.shake = Math.max(G.shake, 8); sfx('boom'); ring(m.x, m.y-4, r, col || '#ffb070', .4);
  burst(m.x, m.y-8, 26, [col || '#ffb070', '#ffffff', '#8a7a68'], [80, 220], [.3, .7], 100);
  for(const p of G.pets) if(Math.hypot(p.x - m.x, p.y - m.y) < r) damagePet(p, dmg*.8, m);
  if(!P.dead && Math.hypot(P.x - m.x, (P.y - m.y)*1.2) < r && !(P.jump || (P.jumpZ||0) > 6)){ damagePlayer(dmg, m); return true; }
  return false;
}
function bossRings(m, n, mul, speed, gap){   // anillos expansivos: solo se esquivan saltando en el momento justo
  const dmg = (m.curDmg || m.dmg)*mul;
  for(let i = 0; i < n; i++) G.hazards.push({type:'shock', x:m.x, y:m.y, delay:i*(gap || .62), rad:0, spd:speed || 250, life:2.4 + i*(gap || .62), max:2.4 + i*(gap || .62), dmg, mon:m, hitP:false, hitPets:new Set(), started:false});
  G.shake = Math.max(G.shake, 9); sfx('boom');
}
function bossFan(m, n, spread, speed, mul, mk){   // abanico de proyectiles hacia el héroe
  const base = Math.atan2(P.y - 14 - (m.y - 30), P.x - m.x), dmg = (m.curDmg || m.dmg)*mul;
  for(let i = 0; i < n; i++){ const a = base + (i - (n - 1)/2)*spread; G.projs.push(Object.assign({x:m.x + m.face*10, y:m.y - 30, vx:Math.cos(a)*speed, vy:Math.sin(a)*speed, life:2.2, from:'mon', mon:m, dmg, r:5, ang:a}, mk ? mk(a) : {kind:'axe'})); }
}
function bossSummon(m, types, n, max){   // invoca esbirros (no dan experiencia ni botín)
  const mine = G.mons.filter(o => o.summoner === m && !o.dying).length;
  for(let i = 0; i < n && mine + i < (max || 6); i++){
    const t = types[Math.floor(Math.random()*types.length)], p = freeSpotNear(m.x + rand(-90, 90), m.y + rand(30, 100), 12);
    const g = mkMonster(t, 'normal', p.x, p.y, {affixes:[]}); g.summoner = m; g.aggro = true; G.mons.push(g);
    burst(p.x, p.y-10, 12, ['#ffffff', '#c8b8ff'], [30, 100], [.3, .6], -40);
  }
  ring(m.x, m.y-20, 60, '#ffffff', .5); sfx('howl');
}
function bossRain(m, kinds, n, spread, mul){   // zonas de peligro sobre el héroe y alrededor (hielo, explosiones, rayos, veneno...)
  const dmg = (m.curDmg || m.dmg)*mul;
  for(let i = 0; i < n; i++){
    const x = i === 0 ? P.x : P.x + rand(-spread, spread), y = i === 0 ? P.y : P.y + rand(-spread*.7, spread*.7), k = kinds[i % kinds.length];
    const life = .95 + i*.16;
    if(k === 'frost') G.hazards.push({type:'frost', x, y, r:46, life, max:life, dmg:dmg*1.05, mon:m});
    else if(k === 'boom') G.hazards.push({type:'boom', x, y, r:52, life:life + .1, max:life + .1, dmg:dmg*.9});
    else if(k === 'zap') G.hazards.push({type:'zap', x, y, r:40, delay:.5 + i*.18, life:.55, max:.55, dmg:dmg*1.1, mon:m, weak:3});
    else if(k === 'poison') G.hazards.push({type:'poison', x, y, r:34, life:5, max:5});
  }
  sfx('summon');
}
function bossBeam(m, ang, delay, w, len, mul, col, fx, ox = 0, oy = 0){   // rayo en línea con aviso previo
  const h = {type:'beam', x:m.x + ox, y:m.y - 12 + oy, ang, len, w, delay, life:.4, max:.4, dmg:(m.curDmg || m.dmg)*mul, mon:m, col:col || '#ff4a4a', fx}; G.hazards.push(h); return h;
}
function bossRingBooms(m, n, radius, mul){   // corona de explosiones alrededor del jefe que estallan en espiral (hay que moverse, no saltar)
  const dmg = (m.curDmg || m.dmg)*mul;
  for(let i = 0; i < n; i++){ const a = i/n*Math.PI*2, life = .9 + i*.07; G.hazards.push({type:'boom', x:m.x + Math.cos(a)*radius, y:m.y + Math.sin(a)*radius*.8, r:44, life, max:life, dmg}); }
  for(let i = 0; i < Math.round(n/2); i++){ const a = (i + .5)/(n/2)*Math.PI*2, life = 1.3 + i*.09; G.hazards.push({type:'boom', x:m.x + Math.cos(a)*radius*1.7, y:m.y + Math.sin(a)*radius*1.7*.8, r:44, life, max:life, dmg}); }
  sfx('fuse');
}
function bossBarrage(m, rows, mul){   // muro de explosiones que avanza hacia el héroe; cada fila tiene un hueco por el que pasar
  const a = angTo(m), dmg = (m.curDmg || m.dmg)*mul, px = -Math.sin(a), py = Math.cos(a); let gap = Math.floor(Math.random()*5) - 2;
  for(let k = 0; k < rows; k++){
    gap = clamp(gap + (Math.random() < .5 ? -1 : 1), -2, 2);
    for(let j = -3; j <= 3; j++){ if(Math.abs(j - gap) <= 0) continue; const d = 70 + k*64, life = .8 + k*.3; G.hazards.push({type:'boom', x:m.x + Math.cos(a)*d + px*j*50, y:m.y + Math.sin(a)*d*.9 + py*j*50*.8, r:34, life, max:life, dmg}); }
  }
  sfx('fuse');
}
function bossGrid(m, n, spacing, mul){   // cuadrícula de descargas en damero alrededor del héroe
  const dmg = (m.curDmg || m.dmg)*mul;
  for(let gx = -n; gx <= n; gx++) for(let gy = -n; gy <= n; gy++){ if((gx + gy + 2*n) % 2) continue; G.hazards.push({type:'zap', x:P.x + gx*spacing, y:P.y + gy*spacing*.8, r:34, delay:.55 + Math.random()*.25, life:.55, max:.55, dmg:dmg*1.1, mon:m, weak:3}); }
  sfx('summon');
}
function bossPull(m, dur, r, str, mul){   // succión: arrastra al héroe y a las mascotas hacia el jefe
  G.hazards.push({type:'pull', x:m.x, y:m.y, r, life:dur, max:dur, str, dmg:(m.curDmg || m.dmg)*mul, mon:m, tick:0});
  sfx('summon'); ring(m.x, m.y-10, r*.6, '#c8b8ff', .5);
}
function bossLeap(m, tx, ty, dur){ m.leap = {t:0, dur:dur || .75, x0:m.x, y0:m.y, x1:tx, y1:ty}; }
function bossBlink(m, dist){   // se teletransporta junto al héroe
  const a = Math.random()*Math.PI*2, p = freeSpotNear(P.x + Math.cos(a)*(dist || 90), P.y + Math.sin(a)*(dist || 90)*.8, 18);
  ring(m.x, m.y-20, 50, '#c8b8ff', .4); m.x = p.x; m.y = p.y; ring(m.x, m.y-20, 50, '#c8b8ff', .4); burst(m.x, m.y-20, 24, ['#c8b8ff', '#ffffff'], [60, 200], [.3, .6], 0); sfx('alba');
}
function bossChargeStart(m){ m.charge = {dx:Math.cos(m.aim), dy:Math.sin(m.aim), t:.62}; }
function updateBrain(m, dt){
  const sc = G.sc, MD = MONSTERS[m.type], B = BRAINS[MD.brain];
  m.walk += dt*3;
  if(m.awake && !P.dead){   // enrage: pasados 3 minutos de combate hace más daño y ataca más deprisa
    m.fightT = (m.fightT || 0) + dt;
    if(m.fightT > 180 && !m.enraged){ m.enraged = true; m.dmg *= 1.5; toast('¡' + MD.name + ' se enfurece!', 3); sfx('howl'); G.shake = Math.max(G.shake, 8); ring(m.x, m.y - 30, 90, '#ff3a2a', .6); }
    if(m.enraged){ m.atkCd -= dt*.4; if(Math.random() < dt*6) G.parts.push({x:m.x + rand(-20, 20), y:m.y - rand(10, 50), vx:0, vy:-30, life:.5, max:.5, size:2, col:'#ff3a2a'}); }
  }
  if(!m.awake){
    if((inBossRoom(P.x, P.y) && !P.dead) || m.hp < m.maxHp){ m.awake = true; m.atkCd = 1.8; G.bossFight = m; toast(B.wake, 3); sfx('howl'); G.shake = Math.max(G.shake, 7); ring(m.x, m.y-30, 70, B.col || '#ffffff', .5); }
    return;
  }
  if(P.dead) return;
  if(m.later){ for(const q of m.later){ q.t -= dt; if(q.t <= 0){ q.done = true; q.fn(m); } } m.later = m.later.filter(q => !q.done); }
  if(!m.phase2 && m.hp < m.maxHp*.5){
    m.phase2 = true; toast(B.rage, 3); G.flash = {x:m.x, y:m.y-30, t:.4}; G.shake = Math.max(G.shake, 8);
    burst(m.x, m.y-30, 40, [B.col || '#ffffff', '#ffffff', '#ffb347'], [80, 240], [.5, 1], 0); sfx('howl'); if(B.onRage) B.onRage(m);
  }
  const dx = P.x - m.x, dy = P.y - m.y, d = Math.hypot(dx, dy) || 1;
  m.face = dx > 0 ? 1 : -1;
  if(m.leap){   // salto: vuela en arco y aplasta al caer
    const l = m.leap; l.t += dt; const k = Math.min(1, l.t/l.dur);
    m.x = lerp(l.x0, l.x1, k); m.y = lerp(l.y0, l.y1, k); m.z = Math.sin(k*Math.PI)*46;
    if(k >= 1){ m.leap = null; m.z = 0; if(B.land) B.land(m); }
    return;
  }
  if(m.charge){   // embestida en línea recta
    const ch = m.charge; ch.t -= dt;
    const bx = m.x, by = m.y; moveCircle(sc, m, ch.dx*(B.chargeSpd || 440)*dt, ch.dy*(B.chargeSpd || 440)*dt);
    if(Math.hypot(m.x-bx, m.y-by) < (B.chargeSpd || 440)*dt*.4){ ch.t = 0; G.shake = Math.max(G.shake, 6); sfx('stoneHit'); }
    if(!ch.hit && d < m.r + P.r + 14){ ch.hit = true; damagePlayer((m.curDmg || m.dmg)*(B.chargeMul || 1.4), m); P.vx += ch.dx*300; P.vy += ch.dy*300; }
    if(Math.random() < .6) G.parts.push({x:m.x + rand(-10, 10), y:m.y, vx:rand(-20, 20), vy:-20, life:.4, max:.4, size:rand(2, 3), col:B.dust || '#8a7a68'});
    if(ch.t <= 0){ m.charge = null; m.dizzy = B.dizzy ?? 1; }
    return;
  }
  if(m.dizzy > 0){ m.dizzy -= dt; return; }
  const spd = MD.spd*(m.phase2 ? (B.p2spd || 1.25) : 1);
  let cx = 0, cy = 0; const keep = B.keep ?? 70;
  if(B.hover){ const s = m.strafe = m.strafe || 1; if(d > keep + 60){ cx = dx/d*spd; cy = dy/d*spd; } else if(d < keep - 40){ cx = -dx/d*spd; cy = -dy/d*spd; } else { cx = -dy/d*spd*.55*s; cy = dx/d*spd*.55*s; if(Math.random() < dt*.3) m.strafe = -s; } }
  else if(d > keep){ cx = dx/d*spd; cy = dy/d*spd; }
  if(m.prepT > 0){ cx *= .1; cy *= .1; if(B.prepFx) B.prepFx(m); }
  moveCircle(sc, m, (cx + m.vx)*dt, (cy + m.vy)*dt); m.vx *= .9; m.vy *= .9;
  if(m.prepT > 0){
    m.prepT -= dt;
    if(m.prepT <= 0){ const a = B.attacks.find(q => q.id === m.cast); m.atkCd = m.phase2 ? (B.cd2 ? B.cd2() : rand(1.8, 2.6)) : (B.cd ? B.cd() : rand(2.6, 3.6)); if(a) a.cast(m); }
    return;
  }
  if(m.atkCd <= 0){
    let pool = B.attacks.filter(a => (!a.p2 || m.phase2) && d >= (a.min || 0) && d <= (a.max || 9999));
    if(!pool.length) pool = B.attacks.filter(a => !a.p2 || m.phase2);
    let tot = 0; for(const a of pool) tot += a.w || 10; let r = Math.random()*tot, pick2 = pool[0];
    for(const a of pool){ r -= a.w || 10; if(r <= 0){ pick2 = a; break; } }
    m.cast = pick2.id; m.prepT = pick2.prep*(m.phase2 ? .9 : 1); m.atkCd = 99; m.aim = angTo(m);
    if(pick2.warn) G.hazards.push({type:'slam', x:m.x, y:m.y, r:pick2.warn, life:m.prepT, max:m.prepT});
    if(pick2.name) addText(m.x, m.y - 90, pick2.name, pick2.col || '#ffb070', 8, -20);
    if(pick2.start) pick2.start(m);
  }
}

// ---------- generador de mapas por salas unidas por pasillos (cada tema le pone suelo, vacío y decorado) ----------
function buildRectWorld(cfg, seed){
  const R = rng(seed), rr = (a, c) => a + R()*(c - a);
  const COLS = cfg.cols || 3, ROWS = cfg.rows || 4, SX = cfg.spacingX || 440, SY = cfg.spacingY || 400, CELL = 8, BW = cfg.corridor || 56;
  const X0 = -Math.round(COLS*SX/2) - 200, X1 = Math.round(COLS*SX/2) + 200, Y1 = 330, Y0 = Y1 - ROWS*SY - 260, GW = Math.ceil((X1 - X0)/CELL), GH = Math.ceil((Y1 - Y0)/CELL);
  const sc = baseScene(cfg.id, cfg.name, X0, Y0, X1, Y1);
  sc.kind = 'raid'; sc.darkness = cfg.darkness ?? .9; sc.seed = seed; sc.lvl = cfg.lvl || 12;
  const nodes = [];
  for(let r = 0; r < ROWS; r++) for(let c = 0; c < COLS; c++){
    const boss = r === ROWS - 1 && c === Math.floor(COLS/2);
    const w = boss ? cfg.boss.w : Math.round(rr(cfg.nodeW[0], cfg.nodeW[1])/8)*8, h = boss ? cfg.boss.h : Math.round(rr(cfg.nodeH[0], cfg.nodeH[1])/8)*8;
    nodes.push({c, r, w, h, boss, x:Math.round((c - (COLS - 1)/2)*SX + (boss ? 0 : rr(-30, 30))), y:Math.round(Y1 - 230 - r*SY + (boss ? 0 : rr(-30, 30))), cabins:[]});
  }
  const at = (c, r) => nodes[r*COLS + c];
  const start = at(Math.floor(COLS/2), 0), boss = nodes.find(n => n.boss);
  const edges = [], seen = new Set([start]), stack = [start];
  while(stack.length){
    const a = stack[stack.length - 1], nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dc, dr]) => [a.c + dc, a.r + dr]).filter(([c, r]) => c >= 0 && c < COLS && r >= 0 && r < ROWS && !seen.has(at(c, r)));
    if(!nb.length){ stack.pop(); continue; }
    const [c, r] = nb[Math.floor(R()*nb.length)], b = at(c, r); seen.add(b); edges.push([a, b]); stack.push(b);
  }
  for(const a of nodes) for(const [dc, dr] of [[1, 0], [0, 1]]){ const c = a.c + dc, r = a.r + dr; if(c < COLS && r < ROWS){ const b = at(c, r); if(!edges.some(([p, q]) => (p === a && q === b) || (p === b && q === a)) && R() < (cfg.loops ?? .3)) edges.push([a, b]); } }
  const rects = [], org = !!cfg.organic;
  if(!org) for(const n of nodes) rects.push({x:n.x - n.w/2, y:n.y - n.h/2, w:n.w, h:n.h});
  for(const [a, b] of edges){
    if(org){   // senderos que unen los centros de las islas con un quiebro
      const bw = Math.round(BW*.8);
      if(a.r === b.r){ const [l, r2] = a.x < b.x ? [a, b] : [b, a], mx = Math.round((l.x + r2.x)/2); rects.push({x:l.x, y:l.y - bw/2, w:mx - l.x + bw/2, h:bw}, {x:mx - bw/2, y:Math.min(l.y, r2.y) - bw/2, w:bw, h:Math.abs(l.y - r2.y) + bw}, {x:mx - bw/2, y:r2.y - bw/2, w:r2.x - mx + bw/2, h:bw}); }
      else { const [t, bt] = a.y < b.y ? [a, b] : [b, a], my = Math.round((t.y + bt.y)/2); rects.push({x:t.x - bw/2, y:t.y, w:bw, h:my - t.y + bw/2}, {x:Math.min(t.x, bt.x) - bw/2, y:my - bw/2, w:Math.abs(t.x - bt.x) + bw, h:bw}, {x:bt.x - bw/2, y:my - bw/2, w:bw, h:bt.y - my + bw/2}); }
      continue;
    }
    if(a.r === b.r){ const [l, r2] = a.x < b.x ? [a, b] : [b, a], y = Math.round((l.y + r2.y)/2); rects.push({x:l.x + l.w/2 - 4, y:y - BW/2, w:(r2.x - r2.w/2) - (l.x + l.w/2) + 8, h:BW}); }
    else { const [t, bt] = a.y < b.y ? [a, b] : [b, a], x = Math.round((t.x + bt.x)/2); rects.push({x:x - BW/2, y:t.y + t.h/2 - 4, w:BW, h:(bt.y - bt.h/2) - (t.y + t.h/2) + 8}); }
  }
  const grid = new Uint8Array(GW*GH);
  for(const rc of rects) for(let gy = Math.floor((rc.y - Y0)/CELL); gy <= Math.floor((rc.y + rc.h - Y0)/CELL); gy++) for(let gx = Math.floor((rc.x - X0)/CELL); gx <= Math.floor((rc.x + rc.w - X0)/CELL); gx++) if(gx >= 0 && gx < GW && gy >= 0 && gy < GH) grid[gy*GW + gx] = 1;
  if(org) for(const n of nodes){   // islas de contorno irregular (elipse deformada por ondas)
    const s1 = R()*6.28, s2 = R()*6.28, s3 = R()*6.28, ex = n.w/2*(n.boss ? 1.05 : 1.12), ey = n.h/2*(n.boss ? 1.05 : 1.12);
    for(let gy = Math.floor((n.y - ey*1.4 - Y0)/CELL); gy <= Math.floor((n.y + ey*1.4 - Y0)/CELL); gy++) for(let gx = Math.floor((n.x - ex*1.4 - X0)/CELL); gx <= Math.floor((n.x + ex*1.4 - X0)/CELL); gx++){
      if(gx < 0 || gx >= GW || gy < 0 || gy >= GH) continue;
      const dx = (X0 + gx*CELL - n.x)/ex, dy = (Y0 + gy*CELL - n.y)/ey, th = Math.atan2(dy, dx), r = Math.pow(Math.pow(Math.abs(dx), 2.6) + Math.pow(Math.abs(dy), 2.6), 1/2.6);
      if(r < .84 + .13*Math.sin(3*th + s1) + .09*Math.sin(5*th + s2) + .05*Math.sin(9*th + s3)) grid[gy*GW + gx] = 1;
    }
  }
  const walk = (x, y) => { const gx = Math.floor((x - X0)/CELL), gy = Math.floor((y - Y0)/CELL); return gx >= 0 && gx < GW && gy >= 0 && gy < GH && grid[gy*GW + gx] === 1; };
  if(cfg.solid === 'water') sc.waterAt = (x, y) => !walk(x, y); else sc.solidAt = (x, y) => !walk(x, y);
  sc.walk = walk;
  const HX = new Map(), hx = c => { let v = HX.get(c); if(!v){ v = hex(c); HX.set(c, v); } return v; };
  sc.ground = (x, y) => {
    if(walk(x, y)){ const e = !walk(x - 5, y) || !walk(x + 5, y) || !walk(x, y - 5) || !walk(x, y + 5); return hx(cfg.floor(x, y, e)); }
    const near = walk(x - 9, y) || walk(x + 9, y) || walk(x, y - 9) || walk(x, y + 9);
    return hx(cfg.void(x, y, near));
  };
  sc.spawn = org ? {x:start.x, y:Math.round(start.y + start.h*.22)} : {x:start.x, y:start.y + start.h/2 - 40};
  sc.horse = org ? {x:start.x - 60, y:Math.round(start.y + start.h*.2), dir:1} : {x:start.x - 60, y:start.y + start.h/2 - 22, dir:1};
  addCollider(sc, {t:'r', x:sc.horse.x - 24, y:sc.horse.y - 7, w:46, h:12});
  sc.houses = []; sc.wisps = [];
  sc.bossRoom = {x:boss.x - boss.w/2 + 20, y:boss.y - boss.h/2 + 10, w:boss.w - 40, h:boss.h - 20};
  sc.bossSpawn = {x:boss.x, y:boss.y - boss.h/4};
  const free = (x, y, r) => walk(x, y) && !blocked(sc, x, y, r + 6) && Math.hypot(x - sc.spawn.x, y - sc.spawn.y) > 110 && Math.hypot(x - sc.horse.x, y - sc.horse.y) > 50;
  const pointOn = (n, r) => { for(let i = 0; i < 60; i++){ const x = Math.round(n.x + rr(-n.w/2 + 20, n.w/2 - 20)), y = Math.round(n.y + rr(-n.h/2 + 30, n.h/2 - 20)); if(free(x, y, r)) return {x, y}; } return null; };
  const addChest = (p, rare) => { if(!p) return; const ch = {x:p.x, y:p.y, rare, open:false}; ch.col = addCollider(sc, {t:'r', x:p.x - 9, y:p.y - 8, w:18, h:8}); sc.chests.push(ch); };
  const H = {R, rr, walk, free, pointOn, addChest, nodes, start, boss, edges};
  for(const n of nodes){ sc.lights.push({x:n.x, y:n.y - 10, r:Math.max(190, n.w*.7), a:cfg.lightA ?? .75, warm:cfg.warm !== false, flick:.1}); if(!n.boss) cfg.decor(sc, n, H); }
  cfg.bossDecor && cfg.bossDecor(sc, boss, H);
  nodes.forEach(n => { if(n !== start && !n.boss && R() < (cfg.chestChance ?? .55)) addChest(pointOn(n, 10), R() < .22); });
  for(const n of nodes.filter(q => q.r >= 2 && !q.boss).slice(0, 3)) addChest(pointOn(n, 10), true);
  const pets = shuffle(petsOfExp(cfg.petExp).filter(id => R() < CAGE_CHANCE[PETS[id].rarity]), R), usedN = new Set([start, boss]);
  for(const id of pets){
    const cand = nodes.filter(q => !usedN.has(q)), n = cand.length ? cand[Math.floor(R()*cand.length)] : nodes[Math.floor(R()*nodes.length)]; usedN.add(n);
    const p = pointOn(n, 14); if(!p) continue;
    const cage = {x:p.x, y:p.y, pet:null, open:false}; cage.col = addCollider(sc, {t:'r', x:cage.x - 12, y:cage.y - 8, w:24, h:8}); sc.cages.push(cage);
  }
  const rar = far => { const roll = R(); return roll < .1 + far*.12 ? 'rare' : roll < .42 + far*.25 ? 'magic' : 'normal'; };
  for(const n of nodes){
    if(n === start || n.boss) continue;
    const far = clamp((Y1 - n.y)/(Y1 - Y0), 0, 1), pack = []; let hasRare = false;
    const types = cfg.groups[Math.floor(R()*cfg.groups.length)], cnt = Math.round((3 + Math.floor(R()*3) + (far > .5 ? 1 : 0))*1.35);
    for(let k = 0; k < cnt; k++){ let r = rar(far); if(r === 'rare' && hasRare) r = 'magic'; if(r === 'rare') hasRare = true; pack.push({type:types[Math.floor(R()*types.length)], rarity:r}); }
    sc.monsterSpawns.push({x:Math.round(n.x), y:Math.round(n.y + 20), pack});
  }
  return sc;
}
// registro de arte de monstruos: d = {w, h, ax, ay, shapes(f)} (formas) o {..., canvas(f)} (lienzo)
function regMon(id, d){
  MON_SHAPES[id] = d;
  MON_ART[id] = {fr:[0, 1, 2].map(f => SP(d.canvas ? d.canvas(f) : paintSprite(d.w, d.h, d.shapes(f)), d.ax, d.ay))};
  MON_ART[id].flash = MON_ART[id].fr.map(s => {
    const cv = document.createElement('canvas'); cv.width = s.c.width; cv.height = s.c.height;
    const g = cv.getContext('2d'); g.drawImage(s.c, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
    return {c:cv, ax:s.ax, ay:s.ay};
  });
}
// escala las formas de un sprite (coordenadas y tamaño) por m
function scl(shapes, m){
  const q = a => a.map(v => typeof v === 'number' ? v*m : v);
  return shapes.map(s => { const o = Object.assign({}, s); if(s.e) o.e = q(s.e); if(s.l){ o.l = q(s.l); } if(s.r) o.r = q(s.r).map(Math.round); if(s.poly) o.poly = s.poly.map(q); if(s.p) o.p = s.p.map(([x, y, c]) => [Math.round(x*m), Math.round(y*m), c]); return o; });
}
const W12_TINT = {};   // colores de hoja/maza/daga de las armas nuevas
function regPets(ids, defs, shapes){
  for(const id of ids){
    const dd = shapes[id], p = defs[id]; PET_SHAPES[id] = dd; PETS[id] = p; p.id = id;
    p.hp = petBaseHp(p); const dm = 1 + PET_TIER_DMG*(petTier(p) - 1); p.dmg = p.dmg.map(v => Math.max(1, Math.round(v*dm)));
    PET_ART[id] = {fly:!!dd.fly, glow:dd.glow, fr:[0, 1, 2].map(f => SP(paintSprite(dd.w, dd.h, dd.shapes(f)), dd.ax, dd.ay))};
    PET_ART[id].flash = PET_ART[id].fr.map(s => { const c = document.createElement('canvas'); c.width = s.c.width; c.height = s.c.height; const g = c.getContext('2d'); g.drawImage(s.c, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); return {c, ax:s.ax, ay:s.ay}; });
  }
  PET_IDS.length = 0; PET_IDS.push(...Object.keys(PETS));
}
// icono nuevo = filas de otro icono con otra paleta
function iconFrom(list){ for(const [id, base, pal] of list){ ICON_ROWS[id] = {pal, rows:ICON_ROWS[base].rows}; ICONS[id] = bakeRows(ICON_ROWS[id].rows.map(r => r.padEnd(12, '.')), Object.assign({k:OUT}, pal)); } }
// icono de un objeto: filas de otro icono con otra paleta
function regIcons(defs){ for(const [k, d] of Object.entries(defs)){ ICON_ROWS[k] = d; ICONS[k] = bakeRows(d.rows.map(r => r.padEnd(12, '.')), Object.assign({k:OUT}, d.pal)); } }
// aspecto de una prenda en el héroe, con la paleta del objeto
function regOv(key, base, pal){ const b = ARMOR_OV[base], o = ARMOR_OV[key] = {ox:b.ox, oy:b.oy, rows:b.rows, img:{}}; for(const r in STUD) o.img[r] = bakeRows(b.rows, Object.assign({k:OUT, s:STUD[r]}, pal, r === 'rare' && pal.dr ? {d:pal.dr} : {})); }
// botín exclusivo del mapa y tesoros de la zona
function regLoot(exp, ids, w){ for(const T of [LOOT.chestNormal, LOOT.chestRare]){ const r = T === LOOT.chestRare; for(const id of ids) T.table.push({w:(w || 3)*(r ? 1.8 : 1), id, lvl:12, only:exp}); } for(const id of ids) LOOT.monsterTable.push({w:(w || 3), id, lvl:12, only:exp}); }

// ---------- legendario general del nivel 12 y efectos de los legendarios de las tres expediciones ----------
regIcons({timering:{pal:{G:'#8a7aff', g:'#c8b8ff', W:'#ffffff'}, rows:["....kkkk....", "..kkGGGGkk..", ".kGGggggGGk.", ".kGgWWWWgGk.", "kGgWkkkkWgGk", "kGgWkGGkWgGk", "kGgWkGGkWgGk", "kGgWkkkkWgGk", ".kGgWWWWgGk.", ".kGGggggGGk.", "..kkGGGGkk..", "....kkkk...."]}});
ITEMS.timering = {name:'Anillo del Tiempo', icon:'timering', slot:'talisman', legend:true, lvl:12, value:300, fixed:[{k:'hp', v:40}, {k:'aspd', v:10}],
  desc:'Objeto legendario. Instante eterno: cada 20 s el tiempo se ralentiza 3 s para los enemigos que tengas cerca (a menos de 260 px) y tú atacas un 25 % más rápido.'};
LEGEND_IDS.push('timering');
function updateWorld12(dt){
  if(G.sc && G.sc.lvl === 12 && !P.dead){   // élites del nivel 12: los raros dan +30 % de daño a los monstruos que tienen cerca (aura roja)
    G.auraT = (G.auraT || 0) - dt;
    for(const m of G.mons) if(!m.dying && m.rarity === 'rare' && !MONSTERS[m.type].boss){
      for(const o of G.mons) if(o !== m && !o.dying && Math.hypot(o.x - m.x, o.y - m.y) < 150) o.auraT = .3;
      if(G.auraT <= 0) ring(m.x, m.y - 4, 150, '#ff5a3a', .5);
    }
    if(G.auraT <= 0) G.auraT = 1;
  }
  if(P.dead) return;
  if(P.timeRingN > 0) P.timeRingN -= dt;
  if(legendOn('timering')){
    P.timeRingT = (P.timeRingT ?? 12) - dt;
    if(P.timeRingT <= 0){ P.timeRingT = 20; P.timeRingN = 3; for(const m of G.mons) if(!m.dying && Math.hypot(m.x - P.x, m.y - P.y) < 260){ m.slowT = Math.max(m.slowT || 0, 3); } addText(P.x, P.y-56, '¡Instante eterno!', '#c8b8ff', 8); for(const r2 of [60, 130, 200, 260]) ring(P.x, P.y-8, r2, '#8a7aff', .5); sfx('alba'); }
  } else P.timeRingT = undefined;
  if(legendOn('amberheart')){   // ámbar eterno: si bajas del 30 % de vida, un escudo de ámbar te protege (cada 40 s)
    if(P.amberCd > 0) P.amberCd -= dt;
    else if(P.hp < P.maxHp*.3){ P.amberCd = 40; P.gelShield = Math.max(P.gelShield || 0, 120); addText(P.x, P.y-56, '¡Ámbar!', '#ffb347', 8); ring(P.x, P.y-10, 50, '#ffb347', .5); burst(P.x, P.y-16, 18, ['#ffb347', '#ffe08a', '#ffffff'], [30, 110], [.4, .8], -30); sfx('alba'); }
  }
  if(legendOn('grailcup')){   // copa de Avalon: cada 30 s cura el 30 % al héroe y a las mascotas
    P.grailT = (P.grailT ?? 20) - dt;
    if(P.grailT <= 0){ P.grailT = 30; const h = Math.round(P.maxHp*.3); P.hp = Math.min(P.maxHp, P.hp + h); addText(P.x, P.y-56, '+' + h, '#7ad86a', 9); for(const p of G.pets) if(p.hp > 0){ p.hp = Math.min(p.maxHp, p.hp + p.maxHp*.3); if(p.item) p.item.hp = p.hp; } ring(P.x, P.y-10, 100, '#ffe08a', .6); burst(P.x, P.y-16, 24, ['#ffe08a', '#ffffff', '#a8ffb8'], [40, 150], [.5, 1], -40); sfx('alba'); }
  }
  if(legendOn('astrohelm') && P.st < P.stMax) P.st = Math.min(P.stMax, P.st + 18*dt);   // oxígeno extra: regeneras mucha estamina
}
function world12Melee(w, m, crit, fx2, out){
  const id = w && w.id;
  if(id === 'primalclaw'){ P.clawN = (P.clawN || 0) + 1; if(P.clawN % 4 === 0){ if(!crit) out.addCrit = true; fx2.bleed = 8; } }
  if(id === 'excalibur'){ P.excN = (P.excN || 0) + 1; if(P.excN % 3 === 0) out.excWave = true; }
}
function world12After(m, dmg, crit, out){
  const w = curWeapon(), id = w && w.id;
  if(out && out.excWave){   // onda de luz de Excalibur: atraviesa en línea a todos los enemigos
    const a = P.face; for(let r2 = 20; r2 <= 210; r2 += 14) G.parts.push({x:P.x + Math.cos(a)*r2, y:P.y - 18 + Math.sin(a)*r2*.8, vx:0, vy:-10, life:.4, max:.4, size:3, col:pick(['#ffe08a', '#ffffff'])});
    for(const o of G.mons) if(!o.dying){ const ox = o.x - P.x, oy = o.y - P.y, dd = Math.hypot(ox, oy); if(dd < 220 && dd > 0 && Math.abs(angDiff(Math.atan2(oy, ox), a)) < .3 && o !== m) hitMonster(o, Math.round(dmg*.7), {src:'player', nx:ox/dd, ny:oy/dd, k:120}); }
    addText(P.x, P.y-56, '¡Luz sagrada!', '#ffe08a', 8); sfx('alba');
  }
  if(id === 'monolithsaber' && !MONSTERS[m.type].boss){   // gravedad del monolito: los enemigos cercanos caen hacia el golpeado
    for(const o of G.mons) if(o !== m && !o.dying && !MONSTERS[o.type].boss && Math.hypot(o.x - m.x, o.y - m.y) < 110){ const dd = Math.hypot(o.x - m.x, o.y - m.y) || 1; o.vx += (m.x - o.x)/dd*260; o.vy += (m.y - o.y)/dd*260; }
    ring(m.x, m.y-6, 50, '#8a8aff', .3);
  }
}
