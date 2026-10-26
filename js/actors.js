'use strict';
// =====================================================================
//  Actores: héroe, monstruos, mascotas, proyectiles, peligros y botín
// =====================================================================
const STAM = {fist:6, fist3:10, stick:10, sword:12, mace:15, axe:13, greataxe:20, flamethrower:2, dagger:7, bow:8, crossbow:14, trident:16, spear:9, throw:5, jump:35, run:15, block:8};
const SPEED = {walk:115, run:185, dash:620, block:.5};
const WEAPON = {   // alcance, arco de golpe, duración, empuje, estela
  fist:  {reach:46, arc:.95, dur:.18, k:220},
  stick: {reach:46, arc:1.3, dur:.32, k:280, trail:'rgba(200,170,120,.35)'},
  sword: {reach:54, arc:1.45, dur:.34, k:300, trail:'rgba(220,225,235,.38)'},
  mace:  {reach:48, arc:1.2, dur:.44, k:380, trail:'rgba(200,205,215,.4)'},
  axe:   {reach:52, arc:1.4, dur:.38, k:300, trail:'rgba(230,200,200,.38)'},
  flamethrower:{reach:104, arc:.62, dur:.16, k:0},   // llamarada en cono: se mantiene pulsado y gasta aceite
  greataxe:{reach:66, arc:3.3, dur:.62, k:420, trail:'rgba(255,225,190,.42)'},   // ciclón: golpea a todos los que te rodean
  dagger:{reach:38, arc:.9, dur:.2, k:150, trail:'rgba(200,230,200,.32)'},
  trident:{reach:118, arc:.2, dur:.5, k:260, trail:'rgba(130,230,255,.42)'},   // estocada en línea recta de gran alcance
  bow:   {dur:.42},
  crossbow:{dur:.85},
  spear: {dur:.3},
  throw: {dur:.24},
};

function newPlayer(x, y){
  return {x, y, r:7, vx:0, vy:0, face:0, dx:1, dy:0, hp:100, maxHp:100, st:100, stMax:100, stDelay:0,
    punchT:0, punchDur:.2, combo:0, comboT:0, hitDone:false, atkKind:'fist', dashT:0, dashCd:0, inv:0, jump:null, jumpZ:0,
    boneT:0, gallopT:0, eclipseT:0, walk:0, moving:false, running:false, blocking:false, slowT:0, speedT:0, hallT:0, breadT:0, weakT:0, poisonT:0,
    lantern:true, oil:100, dead:false, lx:0, ly:0, noStamT:0};
}
const curWeaponKey = () => G.activeW===0 ? 'w1' : 'w2';
const curWeapon = () => G.inv.equip[curWeaponKey()];
const oilMax = () => { const l = G.inv.equip.lantern; return l ? ITEMS[l.id].oilMax + ((typeof lanternGem === 'function' ? lanternGem().oil : 0) || 0) : 0; };
const isRanged = k => k==='bow' || k==='crossbow';
const hasPetAffix = name => G.pets.some(p => p.def.affixes.includes(name));
const albaActive = () => G.pets.some(p => p.def.id==='alba');
const rollR = r => rand(r[0], r[1]);

// ---------- estadísticas que da el equipo ----------
const GEAR_SLOTS = ['w1','w2','shield','head','chest','hands','feet'];
const affixStat = k => (ITEM_AFFIX[k] && ITEM_AFFIX[k].stat) || k;   // un afijo nuevo del editor suma a una estadística existente
function gearStats(){
  const E = G.inv.equip, s = {armor:0, hp:0, stam:0, sreg:0, move:0, crit:0, aspd:0, leech:0, gold:0, oil:0, petdmg:0, thorns:0, dmg:0, fist:0};
  for(const k of GEAR_SLOTS){
    const it = E[k]; if(!it || it.id==='pet') continue;
    const d = ITEMS[it.id];
    // las armas solo cuentan si son el arma activa
    if((k==='w1' || k==='w2') && k !== curWeaponKey()) continue;
    if(d.armor) s.armor += d.armor;
    if(d.move) s.move += d.move;
    if(d.dmgFist) s.fist += d.dmgFist;
    if(d.crit) s.crit += d.crit;
    if(d.dodge) s.dodge = (s.dodge||0) + d.dodge;
    for(const a of it.affixes || []){ const st = affixStat(a.k); s[st] = (s[st]||0) + a.v; const A = ITEM_AFFIX[a.k]; if(A && A.stat2 && a.w !== undefined) s[A.stat2] = (s[A.stat2]||0) + a.w; }
  }
  for(const it of E.tal || []) if(it) for(const a of it.affixes || []){ const st = affixStat(a.k); s[st] = (s[st]||0) + a.v; }   // talismanes con bonos fijos (legendarios)
  if(typeof lanternGem === 'function'){ const gm = lanternGem(); s.move += gm.move || 0; s.dmg += gm.dmg || 0; s.sreg += gm.sreg || 0; }   // zafiro (velocidad) y obsidiana (daño y estamina)
  s.gold += (MS('exp',10) ? 10 : 0) + (MS('exp',15) ? 10 : 0) + (MS('exp',30) ? 15 : 0) + TT('or');
  s.leech = (s.leech || 0) + (MS('agr',25) ? 5 : 0);
  return s;
}
// recalcula vida y estamina máximas al cambiar de equipo o de nivel
function refreshStats(){
  const s = gearStats(), oldMax = P.maxHp;
  s.armor += Math.floor(TT('ar2'));
  P.oil = Math.min(P.oil, oilMax());
  P.maxHp = Math.round((100 + (G.save.level-1)*10 + s.hp + TT('hp'))*(MS('agu',30) ? 1.1 : 1));
  P.stMax = 100 + s.stam + TT('st') + (MS('car',25) ? 30 : 0);
  while(G.inv.bag.length < bagSize()) G.inv.bag.push(null);
  while(G.save.stash.length < stashSize()) G.save.stash.push(null);
  if(P.maxHp > oldMax) P.hp += P.maxHp - oldMax;
  P.hp = Math.min(P.hp, P.maxHp); P.st = Math.min(P.st, P.stMax);
  G.stats = s;
}
const armorReduction = a => a/(a+20);
// puntos invertidos en cada rama del árbol de Gonzalo
const TREE_CACHE = {n:{}, t:{}, notables:new Set(), key:''};
function treeCache(){
  const t = (G.save && G.save.tree) || [], key = t.join(',');
  if(key === TREE_CACHE.key) return TREE_CACHE;
  TREE_CACHE.key = key; TREE_CACHE.n = {}; TREE_CACHE.t = {}; TREE_CACHE.notables = new Set();
  for(const id of t){ const nd = TREE.byId[id]; if(!nd || !nd.b) continue; TREE_CACHE.n[nd.b] = (TREE_CACHE.n[nd.b]||0) + 1; if(nd.notable) TREE_CACHE.notables.add(nd.b + nd.notable); for(const s in nd.eff) TREE_CACHE.t[s] = (TREE_CACHE.t[s] || 0) + (+nd.eff[s] || 0); }
  return TREE_CACHE;
}
const SK = k => treeCache().n[k] || 0;                 // nodos asignados en la rama
const MS = (k, m) => treeCache().notables.has(k + m);  // ¿tiene el notable de esa rama?
const TT = s => treeCache().t[s] || 0;                  // suma de una estadística del árbol (dm, cr, hp…)
const furyMul = () => MS('agr',26) && P.hp < P.maxHp*.5 ? 1.25 : 1;   // Furia
const treeMMul = () => (1 + TT('dm')/100) * (MS('agr',30) ? 1.15 : 1) * furyMul();                                   // daño cuerpo a cuerpo del árbol
const treeRMul = () => (1 + TT('pd')/100) * (MS('agi',30) ? 1.15 : 1) * (MS('agr',30) ? 1.15 : 1) * furyMul();    // daño de proyectiles del árbol
const bagSize = () => 20 + [4,8,12,16,20,30].filter(m => MS('agu', m)).length + ((G.save && G.save.bagUp) || 0)*5;   // + mejoras de mochila de Trapis (5 huecos cada una)
// cinturón de uso rápido: huecos del equipo para consumibles y munición (se gastan antes que lo de la mochila)
const QUICK_SLOTS = {potion:['potion','superpotion'], bandage:['bandage'], oil:['oil', 'oil2'], cookie:['cookie'], mushroom:['mushroom'], elfpotion:['elfpotion'], ammo:['arrows','firearrows','explosivearrows']};
const QUICK_LABEL = {potion:'Poción de vida', bandage:'Vendas', oil:'Aceite', cookie:'Galletas', mushroom:'Setas', elfpotion:'Poción élfica', ammo:'Munición'};
function stackRefs(ids){
  const out = [], E = G.inv.equip;
  for(const k in QUICK_SLOTS){ const it = E[k]; if(it && ids.includes(it.id) && it.n > 0) out.push({arr:E, key:k, it}); }
  G.inv.bag.forEach((it, i) => { if(it && ids.includes(it.id) && it.n > 0) out.push({arr:G.inv.bag, key:i, it}); });
  return out;
}
const countItems = ids => stackRefs(ids).reduce((t, r) => t + r.it.n, 0);
function hasArrows(){ return countItems(['arrows','firearrows','explosivearrows']) > 0; }
function useArrow(){
  const take = r => { if(--r.it.n <= 0) r.arr[r.key] = null; };
  const q = G.inv.equip.ammo;   // la munición equipada en el cinturón se gasta primero
  if(q && q.n > 0){ take({arr:G.inv.equip, key:'ammo', it:q}); return q.id==='explosivearrows' ? 'explosive' : q.id==='firearrows' ? 'fire' : 'normal'; }
  let r = stackRefs(['explosivearrows'])[0];
  if(r){ take(r); return 'explosive'; }
  r = stackRefs(['firearrows'])[0];
  if(r){ take(r); return 'fire'; }
  r = stackRefs(['arrows'])[0];
  if(!r) return false;
  take(r); return 'normal';
}

function addText(x, y, text, col='#fff', size=8, vy=-40){ G.texts.push({x, y, text, col, size, vy, life:.9, max:.9}); }
function burst(x, y, n, cols, sp=[60,200], life=[.25,.5], grav=300, size=[1.5,3]){
  for(let i=0;i<n;i++){ const a=rand(0,Math.PI*2), s=rand(sp[0],sp[1]);
    G.parts.push({x, y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, life:rand(life[0],life[1]), max:life[1], size:rand(size[0],size[1]), col:pick(cols), grav}); }
}
function ring(x, y, size, col='#fff1d0', life=.18){ G.parts.push({ring:true, x, y, life, max:life, size, col}); }

// =====================================================================
//  Héroe
// =====================================================================
// filtro de objetos del suelo (menú de pausa): clase del objeto y si se muestra
// tipos del filtro y color con el que se ven en el suelo (la misión no se puede ocultar; las mascotas siempre se ven)
const LOOT_COL = {normal:'#f4f0e8', magic:'#6aa8ff', rare:'#f2d14b', legend:'#ff4a4a', cons:'#ff8ac8', quest:'#39ff14', key:'#c07aff', treasure:'#ffd040', talisman:'#7affd0', gems:'#6ae8ff', gold:'#ffe070'};
function lootClassOf(it){   // clase de un objeto concreto (o de su definición, con rareza opcional)
  const d = ITEMS[it.id];
  if(d.quest) return 'quest';
  if(it.rarity === 'legendary' || it.rarity === 'unique' || d.legend || d.unique) return 'legend';
  if(d.gem) return 'gems'; if(d.treasure) return 'treasure'; if(d.key) return 'key'; if(d.slot === 'talisman') return 'talisman';
  if(!d.gear && (!d.slot || d.ammo)) return 'cons';   // los farolillos (sin rareza) cuentan como objetos normales
  return it.rarity === 'rare' ? 'rare' : it.rarity === 'magic' ? 'magic' : 'normal';
}
function lootClass(l){
  if(l.gold) return 'gold';
  const it = l.item; if(!it || it.id === 'pet') return 'pet';
  return lootClassOf(it);
}
function lootColor(l){ const c = lootClass(l); return c === 'pet' ? itemColor(l.item) : LOOT_COL[c] || itemColor(l.item); }
function lootVisible(l){
  const c = lootClass(l); if(c === 'pet' || c === 'quest') return true;
  if(SETTINGS.lootFilter[c] === false) return false;
  return !(l.item && SETTINGS.lootItems && SETTINGS.lootItems[c + ':' + l.item.id] === false);   // objeto concreto desactivado a mano
}
// objeto del suelo bajo el cursor (por su icono o por su etiqueta)
function lootUnderMouse(){
  const mw = screenToWorld(mouse.x, mouse.y);
  let best = null, bd = 14;
  for(const l of G.loot){
    if(!l.item || l.z > 0 || !lootVisible(l)) continue;
    if(l.labelRect){ const [x,y,w,h] = l.labelRect; if(mouse.x >= x && mouse.x <= x+w && mouse.y >= y && mouse.y <= y+h) return l; }
    const d = Math.hypot(mw.x-l.x, mw.y-(l.y-6)); if(d < bd){ bd = d; best = l; }
  }
  return best;
}
function updatePlayer(dt){
  const sc = G.sc, inRaid = sc.kind==='raid';
  if(P.dead) return;
  const uiBusy = UI.blocking() || P.stunT > 0, S2 = G.stats || gearStats();
  if(P.stunT > 0 && Math.random() < dt*18) G.parts.push({x:P.x + rand(-8,8), y:P.y - 36 + rand(-3,3), vx:rand(-20,20), vy:-8, life:.4, max:.4, size:2, col:pick(['#ffe08a','#ffffff'])});   // estrellitas
  if(P.stunT > 0) P.stunT -= dt;
  const mw = screenToWorld(mouse.x, mouse.y);
  if(P.punchT<=0) P.face = Math.atan2(mw.y-(P.y-18), mw.x-P.x);

  // movimiento
  let ix=0, iy=0;
  if(!uiBusy){
    ix = (keys.KeyD||keys.ArrowRight?1:0) - (keys.KeyA||keys.ArrowLeft?1:0);
    iy = (keys.KeyS||keys.ArrowDown?1:0) - (keys.KeyW||keys.ArrowUp?1:0);
  }
  if(P.charmT > 0){   // hechizo de sirena: el héroe camina hacia ella
    P.charmT -= dt; const sr = P.charmSrc;
    if(sr && !sr.dying && !(P.rootT > 0)){ const cdx = sr.x - P.x, cdy = sr.y - P.y, cd = Math.hypot(cdx, cdy) || 1; if(cd > 24){ ix = cdx/cd; iy = cdy/cd; } else { ix = iy = 0; } } else P.charmT = 0;
    if(Math.random() < dt*12) G.parts.push({x:P.x + rand(-6,6), y:P.y - 30, vx:rand(-8,8), vy:-20, life:.5, max:.5, size:2, col:pick(['#ff9ae0','#ffffff','#c8a0ff'])});
  }
  const il = Math.hypot(ix,iy); if(il){ ix/=il; iy/=il; P.dx=ix; P.dy=iy; }
  P.moving = il>0;

  // Espacio: saltar · Shift (mantener): correr
  P.running = !uiBusy && actionHeld('run') && P.moving && P.st > 0 && !P.blocking && !P.jump;
  if(P.running){ P.st -= STAM.run*dt*stamMul()*(MS('car',5) ? .85 : 1)*(MS('car',30) ? .8 : 1)*(hasPetAffix('ligera') ? .85 : 1); P.stDelay = .5; if(P.st<=0){ P.st=0; P.noStamT=.6; } }

  // cubrirse con el escudo
  P.blocking = !uiBusy && actionHeld('block') && !!G.inv.equip.shield && P.st > 0 && !P.jump;
  if(P.blocking){ P.st -= STAM.block*dt*stamMul()*(MS('car',15) ? .75 : 1); P.stDelay = .5; if(P.st<=0){ P.st=0; P.blocking=false; P.noStamT=.6; } }

  let spd = (P.running ? SPEED.run : SPEED.walk) * (1 + S2.move/100 + TT('mv')/100 + (P.running && MS('car',30) ? .1 : 0));
  if(P.speedT > 0) spd *= 1.3;
  if(P.hallT > 0) spd *= 1.2;
  if(P.breadT > 0) spd *= 1.25;
  if(P.surge) spd *= 1.25;                  // botas de cristal tras 5 s corriendo
  if(P.gallopT > 0) spd *= 1.2;
  if(P.slowT > 0) spd *= .7;
  if(P.blocking) spd *= SPEED.block;
  if(P.rootT > 0){ P.rootT -= dt; spd = 0; if(Math.random() < dt*14) G.parts.push({x:P.x+rand(-8,8), y:P.y-rand(0,5), vx:0, vy:-10, life:.4, max:.4, size:2, col:pick(['#a060d0','#6a4a9a','#e0c0ff'])}); }
  if(P.punchT > 0) spd *= isRanged(P.atkKind) ? .3 : .45;
  let mx = ix*spd, my = iy*spd;
  if(sc.slippery && !P.jump){   // suelo helado: el héroe resbala (acelera y frena despacio)
    const k = Math.min(1, dt*(P.moving ? 3.6 : 1.3)); P.sx = (P.sx||0) + (mx - (P.sx||0))*k; P.sy = (P.sy||0) + (my - (P.sy||0))*k; mx = P.sx; my = P.sy;
    if(Math.hypot(mx, my) > 40 && Math.random() < dt*10) G.parts.push({x:P.x, y:P.y, vx:rand(-8,8), vy:rand(-6,2), life:.35, max:.35, size:1.5, col:'#e8f4ff'});
  } else { P.sx = mx; P.sy = my; }
  if(P.jump){
    // salto: avanza en el aire, esquiva a los monstruos y pasa por encima de los objetos pequeños
    const j = P.jump; j.t += dt; const t = Math.min(1, j.t/j.dur);
    P.jumpZ = Math.sin(t*Math.PI)*22;
    JUMP_IGNORE = true; moveCircle(sc, P, j.dx*j.speed*dt, j.dy*j.speed*dt); JUMP_IGNORE = false;
    if(t >= 1) endJump();
  } else { P.jumpZ = 0; moveCircle(sc, P, (mx+P.vx)*dt, (my+P.vy)*dt); }
  const fr = Math.exp(-dt*10); P.vx*=fr; P.vy*=fr;
  if(P.moving){
    const prevStep = Math.floor(P.walk/Math.PI);
    P.walk += dt*(P.running?20:14);
    if(Math.floor(P.walk/Math.PI) !== prevStep) sfx('step');
    if(P.running && Math.random() < dt*45){ const sx = -ix, sy = -iy, w0 = rand(-9,9); G.parts.push({x:P.x + sx*6 - iy*w0*.5, y:P.y - 8 - Math.abs(w0)*.35 + sy*3, vx:sx*55, vy:sy*22, life:.32, max:.32, size:1, col:pick(['#dfe8f0','#ffffff','#b8c8d8']), streak:{x:sx, y:sy*.4, len:Math.round(rand(6,13))}}); }
    if(Math.random() < dt*(P.running?14:6)) G.parts.push({x:P.x+rand(-5,5), y:P.y, vx:-ix*20, vy:-8, life:.35, max:.35, size:rand(1.5,3), col:'#4a4238'});
  }
  if(P.flameT > 0) P.flameT -= dt;
  P.dashCd -= dt; P.inv -= dt; if(P.potionCd > 0) P.potionCd -= dt;
  if(P.infernoT > 0){ P.infernoT -= dt; for(const m of G.mons) if(!m.dying && Math.hypot(m.x-P.x, m.y-P.y) < 62) m.burnT = Math.max(m.burnT, 1.2); if(Math.random() < dt*50){ const an = Math.random()*Math.PI*2; G.parts.push({x:P.x+Math.cos(an)*52, y:P.y-8+Math.sin(an)*38, vx:0, vy:-40, life:.4, max:.4, size:2.5, col:pick(['#ff5a1a','#ff8a2a','#ffc04a'])}); } } P.slowT -= dt; if(P.frozenT > 0) P.frozenT -= dt; P.speedT -= dt; P.noStamT -= dt; if(P.gallopT > 0) P.gallopT -= dt; if(P.eclipseT > 0) P.eclipseT -= dt; if(P.warT > 0) P.warT -= dt;

  if(P.bleedT > 0){ P.bleedT -= dt; P.bleedAcc = (P.bleedAcc||0) + 5*dt*(1 - Math.min(.8, (S2.bleedRes||0)/100)); if(P.bleedAcc >= 1){ const d = Math.floor(P.bleedAcc); P.bleedAcc -= d; hurtPlayer(d, '#c8202a'); } }
  if(P.regenT > 0){ P.regenT -= dt; P.hp = Math.min(P.maxHp, P.hp + 6*dt); if(Math.random() < dt*8) G.parts.push({x:P.x+rand(-6,6), y:P.y-rand(8,26), vx:0, vy:-20, life:.5, max:.5, size:1.5, col:'#7ad86a'}); }
  if(P.burnT > 0){ P.burnT -= dt; P.burnAcc = (P.burnAcc||0) + 5*dt*(1 - Math.min(.8, (S2.eleRes||0)/100)); if(P.burnAcc >= 1){ const d = Math.floor(P.burnAcc); P.burnAcc -= d; hurtPlayer(d, '#ff8a2a'); } if(Math.random() < dt*30) G.parts.push({x:P.x+rand(-5,5), y:P.y-rand(4,26), vx:0, vy:-30, life:.4, max:.4, size:2, col:pick(['#ff5a1a','#ffc04a'])}); }
  if(P.poisonT > 0){ P.poisonT -= dt; P.poisonAcc = (P.poisonAcc||0) + 7*dt*(1 - Math.min(.8, (S2.poisRes||0)/100)); if(P.poisonAcc >= 1){ const d=Math.floor(P.poisonAcc); P.poisonAcc-=d; hurtPlayer(d, '#8ad04a'); } }
  // Selene (luz de luna) cura al héroe
  if(G.pets.some(p => p.def.moonlight) && P.hp < P.maxHp) P.hp = Math.min(P.maxHp, P.hp + dt);

  // regeneración de vida (aguante)
  if(TT('hr') > 0 && P.hp < P.maxHp) P.hp = Math.min(P.maxHp, P.hp + TT('hr')*dt);
  if(G.pt.pjRegen && P.hp < P.maxHp) P.hp = Math.min(P.maxHp, P.hp + G.pt.pjRegen*dt);
  if(S2.hpreg && P.hp < P.maxHp) P.hp = Math.min(P.maxHp, P.hp + S2.hpreg*dt);
  if(P.breadT > 0 && P.hp < P.maxHp) P.hp = Math.min(P.maxHp, P.hp + 3*dt);   // pan élfico
  // estamina
  P.stDelay -= dt*(MS('car',26) ? 1.43 : 1);
  if(P.stDelay <= 0 && !P.running && !P.blocking){
    const mult = 1 + G.pets.reduce((s,p)=>s+(p.def.affixes.includes('inspiradora')?.15:0), 0) + S2.sreg/100 + TT('rg')/100 + (G.pt.pjSreg||0)/100;
    P.st = Math.min(P.stMax, P.st + 30*mult*dt);
  }

  // linterna
  if(!G.inv.equip.lantern) P.lantern = false;
  if(P.lantern && inRaid){
    P.oil -= dt * (hasPetAffix('luciernaga') ? .8 : 1) * (1 - Math.min(.6, S2.oil/100)) * (1 - TT('ac')/100);
    if(P.oil <= 0){ P.oil = 0; P.lantern = false; toast('Se ha acabado el aceite de la linterna'); sfx('lanternOut'); }
  }

  updateLanternGem(dt);
  if(!uiBusy){
    // acciones de un toque asignadas a la barra (cambiar de arma, saltar, farolillo, consumibles...)
    for(const act of TRIGGER_ACTIONS) if(actionPressed(act)) runAction(act);
    // clic izquierdo sobre un objeto del suelo: recogerlo (en vez de atacar)
    if(mouse.lp){
      const l = lootUnderMouse();
      if(l){
        mouse.l = false;
        if(Math.hypot(l.x-P.x, l.y-P.y) < 64) pickLoot(l); else toast('Está demasiado lejos', 1);
        return;
      }
    }
    if(actionHeld('attack') && P.punchT<=0 && !P.blocking && !P.jump) attack();
  }

  // ataque en curso
  if(P.punchT > 0){
    P.punchT -= dt;
    if(!P.hitDone && 1-P.punchT/P.punchDur > (isRanged(P.atkKind) ? .7 : .3)){ P.hitDone = true; resolveAttack(); }
    if(P.punchT <= 0) P.comboT = .4;
  } else P.comboT -= dt;
}
function tryJump(){
  if(P.jump || P.dead) return;
  if(P.rootT > 0){ toast('¡Estás inmovilizado!', .8); return; }
  if(P.st < STAM.jump){ P.noStamT = .6; toast('Sin estamina para saltar', 1); return; }
  P.st -= STAM.jump*stamMul()*(MS('agi',26) ? .8 : 1)*(hasPetAffix('ligera') ? .85 : 1); P.stDelay = 1;
  let dx = P.dx, dy = P.dy; if(!P.moving){ dx = Math.cos(P.face); dy = Math.sin(P.face); }
  const dur = .32, dist = 135*(MS('agi',26) ? 1.2 : 1);   // salto rápido y largo
  P.jump = {t:0, dur, dx, dy, speed:dist/dur}; P.punchT = 0; P.blocking = false;
  sfx('dash');
  burst(P.x, P.y, 8, ['#5a5248','#3e3830'], [30,90], [.2,.4], 0);
}
function endJump(){
  // si cae dentro de un obstáculo pequeño, avanza hasta un hueco libre
  let n = 0; while(blocked(G.sc, P.x, P.y, 1) && n++ < 30){ P.x += P.jump.dx*2; P.y += P.jump.dy*2; }
  P.jump = null; P.jumpZ = 0; sfx('step');
  burst(P.x, P.y, 8, ['#5a5248','#3e3830'], [30,90], [.2,.4], 0);
}
function attack(){
  const w = curWeapon();
  const kind = !w ? 'fist' : ITEMS[w.id].kind;
  if(isRanged(kind) && !hasArrows()){ toast('No tienes flechas en la mochila', 1.2); mouse.l = false; return; }
  if(kind==='flamethrower' && G.sc.kind==='raid'){ if(P.oil < 1.8){ toast('Sin aceite para el lanzallamas', 1.2); mouse.l = false; return; } P.oil -= 1.8*(1 - Math.min(.6, ((G.stats && G.stats.flameOil) || 0)/100)); }
  let cost = (STAM[kind] ?? STAM.fist) * stamMul() * (MS('car',10) ? .85 : 1);
  const combo = kind==='fist' ? (P.comboT>0 ? (P.combo%3)+1 : 1) : 1;
  if(kind==='fist' && combo===3) cost = STAM.fist3 * stamMul() * (MS('car',10) ? .85 : 1);
  if(P.st < cost){ P.noStamT = .6; return; }
  P.st -= cost; P.stDelay = .5;
  P.atkKind = kind; P.combo = combo;
  const aspd = 1 + (G.stats ? G.stats.aspd : 0)/100 + TT('av')/100 + (P.breadT > 0 ? .25 : 0);
  P.punchDur = P.punchT = (kind==='fist' ? (combo===3 ? .3 : .18) : WEAPON[kind].dur) / aspd;
  P.hitDone = false; P.comboT = 0;
  sfx(kind==='throw' || kind==='spear' || isRanged(kind) ? 'throw' : (kind==='stick' || kind==='sword' || kind==='greataxe' || combo===3) ? 'swingBig' : 'swing');
  // sin avance hacia delante al atacar
}
// desgaste: los objetos duran 3 veces más y avisan (con sonido) cuando les queda el 20 % de durabilidad
const WEAR_RATE = 1/3;
function wearDur(it){
  it.wearAcc = (it.wearAcc || 0) + WEAR_RATE; if(it.wearAcc < 1) return false;
  it.wearAcc -= 1; it.dur--;
  if(it.dur > 0 && !it.lowWarned && it.dur <= maxDur(it)*.2){ it.lowWarned = true; toast(`⚠ ¡${itemName(it)} está a punto de romperse! (le queda el 20 %)`, 4); sfx('wearWarn'); G.wearAlert = {until:G.t + 5, name:itemName(it)}; }
  return it.dur <= 0;
}
function wearWeapon(w){
  if(!w || w.dur === undefined) return;
  if(wearDur(w)){
    G.inv.equip[curWeaponKey()] = null;
    toast(`¡${itemName(w)} se ha roto!`); sfx('breakItem');
    burst(P.x+Math.cos(P.face)*14, P.y-18, 10, ['#7a5636','#9aa0aa','#96704a'], [40,140], [.3,.6]);
    refreshStats();
  }
  UI.refresh();
}
function resolveAttack(){
  const kind = P.atkKind, w = curWeapon(), S2 = G.stats || gearStats();
  if(kind==='throw'){
    if(!w) return;
    const sx = P.x + Math.cos(P.face)*10, sy = P.y - 18 + Math.sin(P.face)*6;
    G.projs.push({x:sx, y:sy, vx:Math.cos(P.face)*420, vy:Math.sin(P.face)*420, life:.65, kind:'stone', from:'player', dmg:rand(6,9)*treeRMul(), r:3, pierce:MS('agi',20) ? 1 : 0});
    w.n--; if(w.n <= 0){ G.inv.equip[curWeaponKey()] = null; toast('No te quedan piedras'); }
    UI.refresh(); return;
  }
  if(kind==='spear'){
    if(!w) return;
    const sx = P.x + Math.cos(P.face)*10, sy = P.y - 18 + Math.sin(P.face)*6;
    const dmg = (rollR(ITEMS.spear.dmg) + S2.dmg) * treeRMul(), crit = Math.random() < .12 + S2.crit/100 + TT('pc')/100 + (MS('agi',30) ? .1 : 0);
    G.projs.push({x:sx, y:sy, vx:Math.cos(P.face)*520, vy:Math.sin(P.face)*520, life:.75, kind:'spear', from:'player', dmg: crit ? dmg*2 : dmg, crit, r:4, ang:P.face, pierce:99});
    w.n--; if(w.n <= 0){ G.inv.equip[curWeaponKey()] = null; toast('No te quedan lanzas'); }
    UI.refresh(); return;
  }
  if(isRanged(kind)){
    const arrow = w && useArrow(); if(!arrow) return;
    let dmg = (rollR((w && weaponDmg(w)) || ITEMS[kind].dmg) + S2.dmg + eleFlat(S2)) * treeRMul();
    const crit = Math.random() < .12 + S2.crit/100 + TT('pc')/100 + (MS('agi',30) ? .1 : 0); if(crit) dmg *= 2;
    const sx = P.x + Math.cos(P.face)*10, sy = P.y - 18 + Math.sin(P.face)*6;
    const la = legendArrow(w);
    G.projs.push({x:sx, y:sy, vx:Math.cos(P.face)*(kind==='crossbow' ? 640 : 560), vy:Math.sin(P.face)*(kind==='crossbow' ? 640 : 560), life:.75, kind:'arrow', from:'player', dmg, crit, r:3, ang:P.face, pierce:(MS('agi',20) ? 1 : 0) + la.pierce + (Math.random()*100 < (S2.pierceCh||0) ? 3 : 0), homing:la.homing, markHit:la.mark, fire: arrow==='fire', explode: arrow==='explosive', wfx: w ? {fearChance:ITEMS[w.id].fearChance, freezeChance:ITEMS[w.id].freezeChance, bleedChance:ITEMS[w.id].bleedChance} : null, fxS:{fireCh:S2.fireCh, litCh:S2.litCh, iceCh:S2.iceCh, bleedCh:S2.bleedCh, bleedDur:S2.bleedDur, poisonCh:S2.poisonCh, poisonDur:S2.poisonDur}, bounce: Math.random()*100 < (S2.bounceCh||0) ? 1 : 0});
    if(Math.random()*100 < (S2.multiCh||0) + (MS('agi',25) ? 10 : 0)){   // proyectil adicional (sin gastar otra flecha)
      const p0 = G.projs[G.projs.length-1], an = P.face + (Math.random() < .5 ? -.13 : .13), sp = Math.hypot(p0.vx, p0.vy);
      G.projs.push({...p0, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp, ang:an, bounce:0});
    }
    wearWeapon(w); return;
  }
  if(kind==='flamethrower'){   // gran llamarada: chorro de fuego y llamas que quedan en el suelo
    const fx = Math.cos(P.face), fy = Math.sin(P.face), fa = 1 + (S2.flameArea||0)/100; P.flameT = .32;
    for(let i=0;i<14;i++){ const sp = rand(120,260)*fa, an = P.face + rand(-.28,.28); G.parts.push({x:P.x + fx*12, y:P.y - 16 + fy*6, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp*.8 - 10, life:rand(.25,.45), max:.45, size:rand(2,4), col:pick(['#ff5a1a','#ff8a2a','#ffc04a','#fff0a0'])}); }
    if(!(G.t - (P.flameAt||0) < .4)){ P.flameAt = G.t; const fxp = P.x + fx*70*fa, fyp = P.y + fy*70*fa; if(!blocked(G.sc, fxp, fyp, 4)) G.hazards.push({type:'fire', x:fxp, y:fyp, r:36, life:1.6, max:1.6}); }
  }
  const big = kind==='fist' && P.combo===3, W2 = WEAPON[kind];
  const agr = SK('agr'), reach = (big ? 58 : W2.reach) * (1 + TT('al')/100) * (kind==='flamethrower' ? 1 + (S2.flameArea||0)/100 : 1), arc = (big ? 1.2 : W2.arc) * (MS('agr',10) ? 1.15 : 1) * (1 + TT('ar')/100) * (kind==='flamethrower' ? Math.min(1.5, 1 + (S2.flameArea||0)/200) : 1);
  const critC = .12 + S2.crit/100 + TT('cr')/100 + (MS('agr',5) ? .05 : 0) + (MS('agr',15) ? .05 : 0);
  let hits = 0;
  for(const m of G.mons){
    if(m.dying) continue;
    const dx=m.x-P.x, dy=m.y-P.y, d=Math.hypot(dx,dy);
    if(d > reach + m.r) continue;
    if(Math.abs(angDiff(Math.atan2(dy,dx), P.face)) > arc && d > m.r+P.r+4) continue;
    if(!los(G.sc, P.x, P.y-4, m.x, m.y-4)) continue;          // los muros bloquean los golpes
    hits++;
    let dmg = legendDmgMult() * (kind==='fist' ? (big ? rand(12,16) : rand(4,7)) + S2.fist : rollR((w && weaponDmg(w)) || ITEMS[kind].dmg) + S2.dmg + eleFlat(S2)) * treeMMul();
    if(albaActive()) dmg *= 1.1;
    let crit = Math.random() < critC; if(crit) dmg *= 2;
    const WD = w && ITEMS[w.id] || {};
    const fx2 = {stun: WD.stunChance && Math.random() < WD.stunChance ? 1 : 0, bleed: WD.bleedChance && Math.random() < WD.bleedChance ? 4 : 0, poison: WD.poisonChance && Math.random() < WD.poisonChance ? 4 : 0,
      burn: WD.burnChance && Math.random() < WD.burnChance ? 4 : 0, freeze: WD.freezeChance && Math.random() < WD.freezeChance ? 2.5 : 0, weaken: WD.weakChance && Math.random() < WD.weakChance ? 5 : 0, fear: WD.fearChance && Math.random() < WD.fearChance ? 3 : 0};
    { const ar = affixRoll(S2); for(const k in ar) if(ar[k] > (fx2[k]||0)) fx2[k] = ar[k]; }   // afijos de fuego, rayo, hielo, sangrado y veneno
    const lg = legendMelee(w, m, crit, fx2); if(lg.addCrit){ dmg *= 2; crit = true; }
    hitMonster(m, dmg, {src:'player', nx:dx/(d||1), ny:dy/(d||1), k: (big ? 520 : W2.k)*(lg.kMul || 1), crit, melee:true, ...fx2});
    legendAfterHit(m, dmg, crit, lg);
    if(fx2.bleed) addText(m.x, m.y-m.r*2-18, 'Sangrado', '#ff5a5a', 6, -20);
    if(fx2.stun) addText(m.x, m.y-m.r*2-18, 'Aturdido', '#ffe08a', 6, -20);
    if(fx2.burn) addText(m.x, m.y-m.r*2-18, 'Quemado', '#ff9a4a', 6, -20);
    if(fx2.freeze) addText(m.x, m.y-m.r*2-18, 'Congelado', '#c8f0ff', 6, -20);
    if(fx2.weaken) addText(m.x, m.y-m.r*2-18, 'Debilitado', '#ffe85a', 6, -20);
    // Agresividad 20: los críticos cuerpo a cuerpo provocan una onda expansiva
    if(crit && MS('agr',20)){
      ring(m.x, m.y-6, 34, '#ffb070', .3);
      for(const o of G.mons) if(o!==m && !o.dying && Math.hypot(o.x-m.x, o.y-m.y) < 44) hitMonster(o, dmg*.5, {src:'player', nx:(o.x-m.x)/44, ny:(o.y-m.y)/44, k:200});
    }
  }
  if(hits){
    G.hitstop = big ? .09 : .045; G.shake = Math.max(G.shake, big ? 6 : 3);
    sfx(kind!=='fist' ? 'stickHit' : big ? 'punchBig' : 'punch');
    if(kind!=='fist') wearWeapon(w);
  }
}
function useConsumable(id){
  let ref = stackRefs([id])[0];
  if(!ref && id==='potion'){ id = 'superpotion'; ref = stackRefs([id])[0]; }
  if(!ref && id==='oil'){ id = 'oil2'; ref = stackRefs([id])[0]; }
  if(!ref){ toast({potion:'No tienes pociones de vida', superpotion:'No tienes pociones de vida', bandage:'No tienes vendas', repairkit:'No tienes kits de reparación', oil2:'No tienes frascos de aceite', cookie:'No tienes galletas', oil:'No tienes frascos de aceite', mushroom:'No tienes setas', elfpotion:'No tienes pociones élficas', petbone:'No tienes huesos para mascota', hallshroom:'No tienes setas alucinógenas', elfbread:'No tienes pan élfico'}[id]); return; }
  const it = ref.it;
  if(id==='oil' || id==='oil2'){
    if(G.sc.kind!=='raid'){ toast('En la guarida la linterna no gasta aceite', 1.5); return; }
    if(!G.inv.equip.lantern){ toast('No llevas ningún farolillo equipado', 1.4); return; }
    if(P.oil >= oilMax()){ toast('El farolillo ya está lleno', 1); return; }
    const oilAmt = id === 'oil2' ? 100 : 40; P.oil = Math.min(oilMax(), P.oil + oilAmt); P.lantern = true;
    addText(P.x, P.y-46, '+' + oilAmt + ' aceite', '#ffe070', 8); sfx('potion');
    burst(P.lx, P.ly, 10, ['#ffe070','#fff4a0'], [20,60], [.4,.8], -60);
  } else if(id==='potion' || id==='superpotion'){
    if((P.potionCd||0) > 0){ toast(`Poción en enfriamiento (${Math.ceil(P.potionCd)} s)`, 1); return; }
    if(P.hp >= P.maxHp){ toast('Ya tienes la vida al máximo', 1); return; }
    const heal = id==='superpotion' ? 100 : 40;
    P.hp = Math.min(P.maxHp, P.hp+heal); P.poisonT = 0; P.potionCd = (G.sc && G.sc.lvl >= 12) ? 15 : 10;
    addText(P.x, P.y-46, '+' + heal, '#7ad86a', 9); sfx('potion');
    burst(P.x, P.y-20, 10, ['#ff6a6a','#ffd0d0'], [20,60], [.4,.8], -60);
  } else if(id==='bandage'){
    if(P.hp >= P.maxHp && !(P.bleedT > 0)){ toast('No necesitas vendas ahora', 1); return; }
    P.regenT = 5; P.bleedT = 0;
    addText(P.x, P.y-46, 'Vendado', '#e8e0c8', 8); sfx('potion');
    burst(P.x, P.y-20, 10, ['#f0ece0','#7ad86a'], [20,60], [.4,.8], -60);
  } else if(id==='cookie'){
    const ps = G.pets.filter(p => !p.dead);
    if(!ps.length){ toast('No llevas ninguna mascota', 1.2); return; }
    if(ps.every(p => p.hp >= p.maxHp)){ toast('Tus mascotas ya están sanas', 1.2); return; }
    for(const p of ps){ p.hp = Math.min(p.maxHp, p.hp + 40); if(p.item) p.item.hp = p.hp; addText(p.x, p.y-30, '+40', '#7ad86a', 7); burst(p.x, p.y-10, 6, ['#d8a860','#7ad86a'], [20,50], [.3,.6], -40); }
    sfx('eat');
  } else if(id==='elfpotion'){
    drinkElfPotion();
  } else if(id==='hallshroom'){
    eatHallShroom();
  } else if(id==='elfbread'){
    eatElfBread();
  } else if(id==='repairkit'){
    if(!useRepairKit()) return;
  } else if(id==='petbone'){
    if(!G.pets.length){ toast('No llevas ninguna mascota', 1.4); return; }
    eatBone();
  } else {
    P.speedT = 60; toast('¡Velocidad aumentada durante 1 minuto!', 1.5); sfx('eat');
    burst(P.x, P.y-20, 10, ['#ff6060','#f5f0e0'], [20,60], [.4,.8], -60);
  }
  if(--it.n <= 0) ref.arr[ref.key] = null;
  UI.refresh();
}
// daño directo (veneno, espinas, explosiones) sin bloqueo
function hurtPlayer(dmg, col='#ff5a5a'){
  if(P.dead) return;
  if(col === '#ff8a2a' && legendOn('blackmail')) dmg = Math.max(1, Math.round(dmg*.5));
  P.hp -= dmg; addText(P.x, P.y-46, '-'+Math.round(dmg), col, 8);
  if(P.hp <= 0) killPlayer();
}
// golpe de un monstruo al héroe
// el frío congela al héroe: inmóvil y de color azul
function freezeHero(t){
  if(P.dead || legendOn('yetiheart')) return;
  P.rootT = Math.max(P.rootT || 0, t); P.frozenT = Math.max(P.frozenT || 0, t); addText(P.x, P.y-56, '¡Congelado!', '#c8f0ff', 7); ring(P.x, P.y-4, 20, '#c8f0ff', .4);
  burst(P.x, P.y-18, 12, ['#c8f0ff', '#ffffff', '#7ac8f0'], [30, 90], [.3, .6], 0); sfx('ui');
}
function damagePlayer(dmg, m, elem){
  if(P.dead || P.inv > 0 || P.dashT > 0 || P.jumpZ > 5) return false;   // en el aire no te alcanzan
  const S2 = G.stats || gearStats();
  const mc = m && m.type && MONSTERS[m.type];
  if(mc && mc.crit && Math.random() < mc.crit){ dmg *= (mc.critMul || 1.8); addText(P.x, P.y-64, '¡Crítico!', '#ffd166', 8); }   // guerreros élficos pesados
  if(legendOn('riverpearl') && Math.random() < .15){ addText(P.x, P.y-50, 'Marea', '#9ad8ff', 7); ring(P.x, P.y-10, 26, '#7ac8f0', .3); return false; }
  if(Math.random() < TT('es')/100 + (MS('agi',10) ? .05 : 0) + (P.surge ? .25 : 0) + (S2.dodge||0)/100){ addText(P.x, P.y-50, 'Esquiva', '#c8e8ff', 7); return false; }
  dmg *= 1 - ((typeof lanternGem === 'function' ? lanternGem().dr : 0) || 0);   // topacio engarzado
  if(MS('agu',25)) dmg *= .95;   // Piel de roca
  const guard = G.pets.find(p => p.def.affixes.includes('guardiana'));
  if(guard){ damagePet(guard, dmg*.1, null, true); dmg *= .9; }
  const dx = P.x-m.x, dy = P.y-m.y, d = Math.hypot(dx,dy) || 1;
  if(P.blocking && Math.abs(angDiff(Math.atan2(-dy,-dx), P.face)) < 1.75){
    const sh = G.inv.equip.shield, blockPct = (sh && ITEMS[sh.id].block) || .7;
    if(!(P.elfT > 0)) P.st -= dmg*.6*stamMul();
    P.stDelay = .6;
    const rawDmg = dmg; dmg *= 1 - blockPct;
    addText(P.x, P.y-50, 'Bloqueo', '#c8d0e0', 7); sfx('block');
    if(sh && sh.id === 'lastwall' && !m.dying) legendReflect(m, rawDmg, -dx/d, -dy/d);
    if(sh && (sh.id === 'valhallashield' || sh.id === 'glaciusshield') && !m.dying && !MONSTERS[m.type].boss && Math.random() < .35 && !(m.freezeImmT > 0)){ m.freezeT = Math.max(m.freezeT || 0, 1.5); addText(m.x, m.y - m.r*2 - 18, '¡Congelado!', '#c8f0ff', 7); }
    burst(P.x+Math.cos(P.face)*10, P.y-18, 6, ['#c8ccd4','#96704a'], [40,120], [.15,.3], 0);
    if(sh && sh.dur !== undefined && wearDur(sh)){ G.inv.equip.shield = null; P.blocking = false; toast(`¡${itemName(sh)} se ha roto!`); sfx('breakItem'); refreshStats(); }
    if(P.st <= 0){ P.st = 0; P.blocking = false; P.noStamT = .8; }
    UI.refresh();
  }
  dmg *= 1 - armorReduction(S2.armor);
  if(elem) dmg *= 1 - Math.min(.8, (S2.eleRes||0)/100);   // resistencia elemental: frío, fuego y rayo
  if(P.gelShield > 0){ const ab = Math.min(P.gelShield, dmg); P.gelShield -= ab; dmg -= ab; addText(P.x, P.y-62, 'Gelatina', '#9affb0', 6); }
  if(legendOn('ashcrown') && !m.dying){ m.weakT = Math.max(m.weakT || 0, 3); }
  if(legendOn('blizzardcloak')) iceCloak(m);
  if(P.infernoT > 0) dmg *= .8;                               // llamarada infernal de Cerbero                          // armadura
  const push = m.affixes.includes('pesado') ? 520 : 260;
  P.vx += dx/d*push; P.vy += dy/d*push;
  P.hp -= dmg;   // sin invulnerabilidad tras recibir un golpe
  G.shake = Math.max(G.shake, 5); sfx('hurt');
  addText(P.x, P.y-46, '-'+Math.round(dmg), '#ff5a5a', 8);
  if(S2.thorns && !m.dying) hitMonster(m, S2.thorns, {src:'player', nx:-dx/d, ny:-dy/d, k:60});
  // efectos de afijos y del propio monstruo al golpear
  const A = m.affixes;
  if(monFx(m, 'poison')) P.poisonT = Math.max(P.poisonT, 6);
  if(monFx(m, 'bleed')) P.bleedT = Math.max(P.bleedT||0, 7);
  if(monFx(m, 'burn')) P.burnT = Math.max(P.burnT||0, 3);
  if(monFx(m, 'slow')) P.slowT = Math.max(P.slowT||0, 2);
  if(MONSTERS[m.type].poisonHit) P.poisonT = Math.max(P.poisonT, 6);
  if(MONSTERS[m.type].bleedHit) P.bleedT = Math.max(P.bleedT||0, 7);
  if(MONSTERS[m.type].burnHit) P.burnT = Math.max(P.burnT||0, 3);
  if(MONSTERS[m.type].weakHit){ P.weakT = Math.max(P.weakT||0, 4); addText(P.x, P.y-62, '¡Debilitado!', '#c8b8ff', 7); }
  if(MONSTERS[m.type].electric){ P.weakT = Math.max(P.weakT||0, 3); if(Math.random() < .3 && !legendOn('yetiheart')){ P.rootT = Math.max(P.rootT||0, .6); addText(P.x, P.y-62, '¡Descarga!', '#ffe84a', 8); } burst(P.x, P.y-22, 8, ['#ffe84a','#ffffff','#9af0ff'], [30,100], [.2,.4], 0); }   // tridentes eléctricos
  if(MONSTERS[m.type].stunHit && !legendOn('yetiheart')){ P.stunT = Math.max(P.stunT||0, 1.1); addText(P.x, P.y-62, '¡Aturdido!', '#ffe08a', 8); burst(P.x, P.y-34, 8, ['#ffe08a','#ffffff'], [20,60], [.3,.6], -40); }   // yeti: golpe pesado
  if(A.includes('gelido') && Math.random() < .35) freezeHero(1.1);
  if(A.includes('gelido') || MONSTERS[m.type].slowHit){ P.slowT = 2; burst(P.x, P.y-20, 6, ['#a0d8ff','#ffffff'], [20,60], [.3,.5], 0); }
  if(A.includes('apagaluces') && G.sc.kind==='raid'){ P.oil = Math.max(0, P.oil-5); addText(P.x, P.y-56, '-5 aceite', '#ffb347', 7); }
  if(A.includes('agotador') && !(P.elfT > 0)){ P.st = Math.max(0, P.st-20); P.stDelay = .8; }
  monAffixHit(m);
  if(A.includes('vampirico') || MONSTERS[m.type].drain) m.hp = Math.min(m.maxHp, m.hp + dmg*.5);
  if(A.includes('ladron') && G.raidGold > 0){
    const amt = Math.min(G.raidGold, randi(5,15));
    G.raidGold -= amt; m.stolen += amt; m.fleeT = 3;
    addText(P.x, P.y-56, '-'+amt+' oro', '#ffe08a', 7);
  }
  if(P.hp <= 0) killPlayer();
  return true;
}
function killPlayer(){
  if(P.dead) return;
  if(legendVigil()) return;
  if(MS('agu',26) && !P.willUsed){ P.willUsed = true; P.hp = 1; addText(P.x, P.y-60, '¡Voluntad inquebrantable!', '#ffe08a', 8); ring(P.x, P.y-10, 40, '#ffe08a', .5); sfx('alba'); return; }   // una vez por expedición
  P.dead = true; P.hp = 0; sfx('death');
  burst(P.x, P.y-18, 30, ['#2b2b32','#5a3d26','#ff5a5a'], [60,200], [.5,1]);
  G.deathT = 1.6;
}

// =====================================================================
//  Monstruos
// =====================================================================
const AFFIX_KEYS = Object.keys(MON_AFFIX);
function rollAffixes(n){ const lv = (G.sc && G.sc.lvl) || 1; return shuffle(Object.keys(MON_AFFIX).filter(k => !(MON_AFFIX[k].minLvl > lv))).slice(0, n); }   // los afijos nuevos tienen nivel mínimo (5 y 10)   // dinámico: incluye los afijos nuevos del editor
const RARE_PREFIX = {
  small:['Gelatina','Babaza','Masa','Charca','Ponzoña','Pringue'], big:['Gelatina','Babaza','Masa','Charca','Ponzoña','Pringue'],
  skeleton:['Osamenta','Calavera','Carcasa','Mandíbula'], skelarcher:['Osamenta','Calavera','Carcasa','Mandíbula'],
  skelmage:['Hechicero','Arcano','Brujo','Oráculo'], wraith:['Azote','Lamento','Presagio','Velo'], necro:['Profanador','Sepulturero','Exánime','Penumbra'],
  skelknight:['Centinela','Coloso','Verdugo','Paladín'], countess:['Condesa'],
  orc:['Machacacráneos','Rompehuesos','Sangrenegra','Colmillo Roto'], orcarcher:['Ojo de Halcón','Flechanegra','Acechador','Lluvia Roja'],
  orcshaman:['Hablacenizas','Quemalmas','Colmillo Hueco','Invocafuegos'], orcbrute:['Aplastador','Trituramundos','Gorrón','Muro Vivo'], urr:['Urr'],
  wolfp:['Colmillo','Aullador','Destripador','Acechador'], boarp:['Arrasador','Gruñón','Destrozo','Embestida'], bisonp:['Titán','Coloso','Behemot','Estampida'],
  vulturep:['Carroñero','Presagio','Garra','Sombra'], snakep:['Víbora','Colmillo','Escama','Veneno'], zombie:['Carroña','Podredumbre','Pestilencia','Carne'], ghost:['Ánima','Sombra','Aparición','Pena'],
};
function monName(type, rarity, affixes){
  const base = MONSTERS[type].name;
  if(rarity==='magic'){
    if(LANG.cur === 'en'){ const b = tr(base); return affixes.map(a => tr(MON_AFFIX[a].name)).join(' ') + ' ' + b[0].toLowerCase() + b.slice(1); }   // en inglés el adjetivo va delante
    return base + ' ' + affixes.map(a => MON_AFFIX[a].name).join(' ');
  }
  if(rarity==='rare') return pick(RARE_PREFIX[MONSTERS[type].art] || [base]) + ' ' + pick(RARE_NAMES[1]);
  return base;
}
// colores de las partículas de cada monstruo
const monCols = m => SLIME_PAL[m.art] ? SLIME_PAL[m.art].slice(1,4) : MON_COLORS[m.art];
function mkMonster(type, rarity, x, y, o={}){
  const base = MONSTERS[type], rr = MON_RARITY[rarity], small = !!o.small;
  const affixes = o.affixes ?? rollAffixes(rr.affixes);
  const castle = G.sc && G.sc.lvl >= 6 && base.orc && !base.boss;   // castillo de Urr: orcos de élite
  let hp = base.hp*rr.hp*(small?.35:1)*(castle ? 1.3 : 1); if(affixes.includes('robusto')) hp *= 1.6;
  const sc = rr.scale*(small?.7:1);
  const m = {type, rarity, art:base.art, ai:base.ai, x, y, home:{x,y}, vx:0, vy:0, r:Math.max(6, base.r*sc), scale:sc, small,
    hp, maxHp:hp, dmg:base.dmg*rr.dmg*(small?.6:1)*(base.plains?1.5:1)*(castle ? 1.25 : 1), baseSpd:base.spd*(affixes.includes('rapido')?1.4:1)*(base.plains?1.6:1), xp:Math.round(base.xp*rr.xp*(small?.4:1)),
    affixes, hop:Math.random()*6, walk:Math.random()*6, face:1, flash:0, atkCd:1, dying:0, spawnIn:o.instant?1:0, shield:affixes.includes('escudado')?hp*.3:0,
    lastHit:99, aggro:false, target:null, tauntT:0, tauntBy:null, stunT:0, slowT:0, freezeT:0, weakT:0, poisonT:0, burnT:0, dot:0, fearT:0,
    summonT:8, jumpT:rand(3,5), jump:null, poisonDrop:1.2, stolen:0, fleeT:0, revealT:0, wander:null, wanderT:0,
    name: o.name ?? monName(type, rarity, affixes)};
  for(const a of affixes){ const f = MON_AFFIX[a] && MON_AFFIX[a].fx; if(!f) continue; if(f.hp){ m.hp *= 1 + f.hp/100; m.maxHp = m.hp; } if(f.dmg) m.dmg *= 1 + f.dmg/100; if(f.spd) m.baseSpd *= 1 + f.spd/100; }   // afijos nuevos del editor
  m.shieldMax = m.shield;
  return m;
}
function monTargets(){
  const t = [];
  if(!P.dead && !(P.invisT > 0)) t.push(P);   // la coraza fantasmal te hace invisible
  // Sombra (sigilo): los enemigos la ignoran mientras no ataca
  for(const p of G.pets) if(p.exhaustedT<=0 && (p.z < 6 || PET_ART[p.def.id].fly) && !(p.def.stealth && p.state!=='engage')) t.push(p);   // las voladoras también son objetivo
  return t;
}
function updateMonster(m, dt){
  const sc = G.sc;
  if(m.dying){ m.dying += dt; return; }
  if(m.dummy){ dummyTick(m, dt); return; }
  m.spawnIn = Math.min(1, m.spawnIn + dt*2.5);
  m.flash -= dt; m.atkCd -= dt*(m.freezeT>0 ? .4 : 1); m.lastHit += dt; m.tauntT -= dt; m.exposedT -= dt; m.auraT -= dt; m.stunT -= dt; m.slowT -= dt; if(m.slowT > 0) m._slowed = true; else if(m._slowed){ m._slowed = false; m.slowImmT = 10; } m.slowImmT -= dt; m.freezeT -= dt; m.freezeImmT = (m.freezeImmT||0) - dt; m.weakT -= dt; m.revealT -= dt; m.fleeT -= dt; m.fearT -= dt; if(m.markT > 0) m.markT -= dt; if(m.confuseT > 0) m.confuseT -= dt;
  // daño en el tiempo
  if(m.poisonT > 0 || m.burnT > 0 || m.bleedT > 0){
    m.poisonT -= dt; m.burnT -= dt; m.bleedT -= dt;
    m.dot += ((m.poisonT>0?3:0) + (m.burnT>0?5:0) + (m.bleedT>0?5:0))*dt;
    if(m.bleedT > 0 && Math.random() < dt*10) G.parts.push({x:m.x+rand(-m.r,m.r)*.5, y:m.y-rand(4,m.r*1.5), vx:0, vy:30, life:.4, max:.4, size:1.5, col:'#c8202a', grav:200});
    if(m.burnT > 0 && Math.random() < dt*12) G.parts.push({x:m.x+rand(-m.r,m.r)*.6, y:m.y-rand(4,m.r*1.6), vx:0, vy:-30, life:.4, max:.4, size:1.5, col:pick(['#ff8a2a','#ffc04a'])});
    if(m.dot >= 2){ const d = Math.floor(m.dot); m.dot -= d; m.hp -= d; m.flash = .05;
      addText(m.x, m.y-m.r*2-6, ''+d, m.burnT>0 ? '#ff9a3c' : '#8ad04a', 6, -25);
      if(m.hp <= 0){ killMonster(m); return; } }
  }
  const A = m.affixes;
  if(monAffixTick(m, dt)) return;
  if(A.includes('regenerador') && m.lastHit > 3 && m.hp < m.maxHp) m.hp = Math.min(m.maxHp, m.hp + m.maxHp*.03*dt);
  { const rg = monFx(m, 'regen'); if(rg && m.lastHit > 3 && m.hp < m.maxHp) m.hp = Math.min(m.maxHp, m.hp + m.maxHp*rg/100*dt); }
  const furious = A.includes('furioso') && m.hp < m.maxHp*.5;
  let spd = m.baseSpd * (furious ? 1.3 : 1) * (m.slowT>0 ? .5 : 1) * (m.freezeT>0 ? .4 : 1);
  m.curDmg = m.dmg * (furious ? 1.5 : 1) * (m.weakT>0 ? .6 : 1) * (m.auraT > 0 ? 1.3 : 1) * monDmgMul(m);
  spd *= monSpdMul(m);
  // congelado: paralizado del todo (no se mueve, no ataca ni anima) hasta que se descongela
  if(m.freezeT > 0 && !MONSTERS[m.type].boss){
    m.prepT = 0; m.atkCd = Math.max(m.atkCd, .3); m.vx = m.vy = 0;
    if(m.freezeT - dt <= 0){ burst(m.x, m.y-m.r, 14, ['#c8f0ff','#7ac8f0','#ffffff'], [40,120], [.3,.6], 120); sfx('stoneHit'); }   // se rompe el hielo
    return;
  }
  m.hop += dt*(m.art==='big' ? 5 : 7);
  const MD = MONSTERS[m.type];
  // seguro contra jefes atascados: si algo les corta el aviso del ataque (prepT) con atkCd = 99, vuelven a atacar enseguida
  if(MD.boss && m.awake && !(m.prepT > 0) && m.atkCd > 12 && !m.charge && !m.tele && !m.dizzy && !m.leap) m.atkCd = 1;

  if(m.ai==='boss'){ updateBoss(m, dt); return; }
  if(m.ai==='urr'){ updateUrr(m, dt); return; }
  if(m.ai==='elfmage'){ updateElfMage(m, dt); return; }
  if(m.ai==='guardian'){ updateGuardian(m, dt); return; }
  if(m.ai==='brain'){ updateBrain(m, dt); return; }
  // salto en curso (afijo Saltador)
  if(m.jump){
    const j = m.jump; j.t += dt/.7;
    let t = Math.min(1, j.t);
    const jx = lerp(j.x0, j.x1, t), jy = lerp(j.y0, j.y1, t);
    if(wallAt(sc, jx, jy)) t = 1; else { m.x = jx; m.y = jy; }   // un saltador no atraviesa paredes: aterriza donde topa
    m.z = Math.sin(t*Math.PI)*30;
    if(t >= 1){
      m.jump = null; m.z = 0; G.shake = Math.max(G.shake, 4); sfx('thud');
      burst(m.x, m.y, 14, monCols(m), [60,180], [.3,.5]);
      ring(m.x, m.y-2, 26, '#d8d0c0', .25);
      for(const t2 of monTargets()) if(Math.hypot(t2.x-m.x, t2.y-m.y) < 34 + (t2.r||6)){
        if(t2===P) damagePlayer(m.curDmg*1.2, m); else damagePet(t2, m.curDmg*1.2, m);
      }
    }
    return;
  }
  if(m.stunT > 0){ moveCircle(sc, m, m.vx*dt, m.vy*dt); m.vx *= Math.exp(-dt*7); m.vy *= Math.exp(-dt*7); return; }

  // elegir objetivo
  let target = null;
  if(m.tauntT > 0 && m.tauntBy && m.tauntBy.exhaustedT<=0 && G.pets.includes(m.tauntBy)) target = m.tauntBy;
  else {
    let bd = m.aggro ? 380 : 180;
    if(!P.lantern && !m.aggro) bd = 130;
    for(const t of monTargets()){ const d = Math.hypot(t.x-m.x, t.y-m.y); if(d < bd){ bd = d; target = t; } }
  }
  if(target) m.aggro = true;
  else if(m.aggro && Math.hypot(m.x-m.home.x, m.y-m.home.y) > 500) m.aggro = false;
  if(m.confuseT > 0){
    let bo = null, bd2 = 220;
    for(const o of G.mons){ if(o===m || o.dying || o.summoner===m || m.summoner===o) continue; const dd = Math.hypot(o.x-m.x, o.y-m.y); if(dd < bd2){ bd2 = dd; bo = o; } }
    if(bo){ target = bo; m.aggro = true; }
    if(Math.random() < dt*6) G.parts.push({x:m.x+rand(-6,6), y:m.y-m.r*2-8, vx:rand(-10,10), vy:-14, life:.5, max:.5, size:2, col:pick(['#e0c0ff','#b070ff'])});
  }
  m.target = target;

  let cx = 0, cy = 0;
  // slimes: avanzan a saltos · no-muertos: paso constante
  const hopF = m.ai==='hop' ? Math.max(0, Math.sin(m.hop))*1.6 : 1;
  if(m.fleeT > 0 || m.fearT > 0){
    const dx = m.x-P.x, dy = m.y-P.y, d = Math.hypot(dx,dy) || 1;
    cx = dx/d*spd*1.6*hopF; cy = dy/d*spd*1.6*hopF;
  } else if(target && (m.ai==='caster' || m.ai==='summoner')){
    // magos y nigromantes: mantienen la distancia y lanzan proyectiles mágicos; el nigromante además alza esqueletos
    const dx = target.x-m.x, dy = target.y-m.y, d = Math.hypot(dx,dy) || 1, [rmin, rmax] = MD.range;
    const see = los(sc, m.x, m.y-14, target.x, target.y-14);
    m.face = dx > 0 ? 1 : -1;
    if(m.ai==='summoner'){
      m.raiseT = (m.raiseT ?? 2) - dt;
      const mine = G.mons.filter(o => o.summoner===m && !o.dying).length;
      if(m.raiseT <= 0 && mine < 4){
        m.raiseT = 7;
        for(let i=0;i<2;i++){
          const x = m.x + rand(-26,26), y = m.y + rand(-26,26);
          if(blocked(sc, x, y, 9)) continue;
          const sk = mkMonster('skeleton','normal', x, y, {affixes:[], name:'Esqueleto alzado'}); sk.summoner = m; sk.aggro = true; G.mons.push(sk);
          burst(x, y-6, 12, ['#4ae04a','#c8ffc8','#1a6a1a'], [30,100], [.3,.6], -40);
        }
        ring(m.x, m.y-10, 26, '#4ae04a', .4); sfx('summon');
      }
    }
    if(m.prepT > 0){
      m.prepT -= dt;
      if(m.prepT <= 0){
        m.atkCd = m.ai==='summoner' ? rand(2.6,3.4) : rand(1.8,2.4);
        if(see){
          const ax = target.x - m.x, ay = target.y - 14 - (m.y - 18), al = Math.hypot(ax,ay) || 1;
          G.projs.push({x:m.x + m.face*8, y:m.y-18, vx:ax/al*220, vy:ay/al*220, life:2.2, kind:'bolt', from:'mon', mon:m, dmg:m.curDmg, r:4,
            home:1.4, slow: m.ai==='summoner' ? 2 : 0, col: m.ai==='summoner' ? ['#1a6a1a','#4ae04a','#d8ffd8'] : ['#6a2aa8','#a860ff','#f0d8ff']});
          sfx('portal', .3);
        }
      }
    } else {
      if(d > rmax || !see){ cx = dx/d*spd; cy = dy/d*spd; }
      else if(d < rmin){ cx = -dx/d*spd*.9; cy = -dy/d*spd*.9; }
      if(d <= rmax + 20 && see && m.atkCd <= 0) m.prepT = MD.prep;
    }
  } else if(target && m.ai==='archer'){
    // arquero: mantiene la distancia, apunta (aviso) y dispara solo si tiene línea de visión
    const dx = target.x-m.x, dy = target.y-m.y, d = Math.hypot(dx,dy) || 1, [rmin, rmax] = MD.range;
    const see = los(sc, m.x, m.y-14, target.x, target.y-14);
    m.face = dx > 0 ? 1 : -1;
    if(m.prepT > 0){
      m.prepT -= dt;
      if(m.prepT <= 0){
        m.atkCd = rand(1.8, 2.6);
        if(see){
          const lead = .25, ax = target.x + (target.vx||0)*lead*.3 - m.x, ay = target.y - 14 - (m.y - 16), al = Math.hypot(ax,ay) || 1;
          if(MD.shot){ const nv = MD.shot.volley || 1; for(let vi = 0; vi < nv; vi++){ const an = Math.atan2(ay, ax) + (vi - (nv - 1)/2)*(MD.shot.spread || 0), sp = MD.shot.spd || 300; G.projs.push(Object.assign({x:m.x + m.face*8, y:m.y-18, life:1.4, kind:'bolt', from:'mon', mon:m, dmg:m.curDmg, r:4, ang:an}, MD.shot, {vx:Math.cos(an)*sp, vy:Math.sin(an)*sp, freeze: MD.shot.freezeP ? (Math.random() < MD.shot.freezeP ? (MD.shot.freezeT || 1.3) : 0) : MD.shot.freeze})); } }
          else if(MD.firearrow) G.projs.push({x:m.x + m.face*8, y:m.y-16, vx:ax/al*310, vy:ay/al*310, life:1.3, kind:'arrow', from:'mon', mon:m, dmg:m.curDmg, r:3, ang:Math.atan2(ay,ax), burn:true, fire:true});
          else if(MD.zap) G.projs.push({x:m.x + m.face*8, y:m.y-20, vx:ax/al*340, vy:ay/al*340, life:1.3, kind:'bolt', from:'mon', mon:m, dmg:m.curDmg, r:4, root: Math.random() < .25 ? .6 : 0, weak: Math.random() < .2 ? 3 : 0, col:['#a08800', '#ffe84a', '#ffffff']});
          else if(MD.flame) G.projs.push({x:m.x + m.face*8, y:m.y-12, vx:ax/al*250, vy:ay/al*250, life:1.1, kind:'flame', from:'mon', mon:m, dmg:m.curDmg, r:5, burn:true});
          else if(MD.dart) G.projs.push({x:m.x + m.face*8, y:m.y-14, vx:ax/al*330, vy:ay/al*330, life:1.2, kind:'dart', from:'mon', mon:m, dmg:m.curDmg, r:3, ang:Math.atan2(ay,ax), root: Math.random() < .3 ? 1.1 : 0, steal:true});
          else if(MD.harpoon) G.projs.push({x:m.x + m.face*8, y:m.y-18, vx:ax/al*330, vy:ay/al*330, life:1.3, kind:'harpoon', from:'mon', mon:m, dmg:m.curDmg, r:4, ang:Math.atan2(ay,ax), slow:1.5});
          else if(MD.bubble) G.projs.push({x:m.x + m.face*10, y:m.y-24, vx:ax/al*170, vy:ay/al*170, life:2.4, kind:'bubble', from:'mon', mon:m, dmg:m.curDmg, r:9, freeze:1.3, slow:2});
          else if(MD.charm){ G.hazards.push({type:'charm', x:target.x, y:target.y, r:62, life:1.05, max:1.05, mon:m, dmg:m.curDmg*.8}); sfx('alba'); }
          else if(MD.icearrow) G.projs.push({x:m.x + m.face*8, y:m.y-16, vx:ax/al*300, vy:ay/al*300, life:1.3, kind:'arrow', from:'mon', mon:m, dmg:m.curDmg, r:3, ang:Math.atan2(ay,ax), ice:true, slow:2.5, freeze: Math.random() < .7 ? 1.4 : 0});
          else if(MD.snowball) G.projs.push({x:m.x + m.face*12, y:m.y-30, vx:ax/al*205, vy:ay/al*205, life:2.1, kind:'snowball', from:'mon', mon:m, dmg:m.curDmg, r:8, slow:2.5});
          else if(MD.rock) G.projs.push({x:m.x + m.face*10, y:m.y-24, vx:ax/al*215, vy:ay/al*215, life:1.9, kind:'rock', from:'mon', mon:m, dmg:m.curDmg, r:6});
          else if(MD.spit) G.projs.push({x:m.x + m.face*8, y:m.y-10, vx:ax/al*260, vy:ay/al*260, life:1.4, kind:'bolt', from:'mon', mon:m, dmg:m.curDmg, r:4, poison:true, col:['#1a6a1a','#4ae04a','#d8ffd8']});
          else G.projs.push({x:m.x + m.face*8, y:m.y-16, vx:ax/al*300, vy:ay/al*300, life:1.3, kind:'arrow', from:'mon', mon:m, dmg:m.curDmg, r:3, ang:Math.atan2(ay,ax)});
          sfx('throw');
        }
      }
    } else {
      if(d > rmax || !see){ cx = dx/d*spd; cy = dy/d*spd; }
      else if(d < rmin){ cx = -dx/d*spd*.9; cy = -dy/d*spd*.9; }
      if(d <= rmax + 20 && see && m.atkCd <= 0) m.prepT = MD.prep;
    }
  } else if(target){
    const dx = target.x-m.x, dy = target.y-m.y, d = Math.hypot(dx,dy) || 1;
    cx = dx/d*spd*hopF; cy = dy/d*spd*hopF;
    m.face = dx > 0 ? 1 : -1;
    // Saltador
    if(A.includes('saltador') || MD.leaper){
      m.jumpT -= dt;
      if(m.jumpT <= 0 && d < 170 && d > 40 && los(sc, m.x, m.y-4, target.x, target.y-4)){
        m.jumpT = rand(4,6);
        m.jump = {t:0, x0:m.x, y0:m.y, x1:target.x, y1:target.y};
        G.hazards.push({type:'slam', x:target.x, y:target.y, r:34, life:.7, max:.7});
        return;
      }
    }
    // Invocador
    if(A.includes('invocador')){
      m.summonT -= dt;
      const mine = G.mons.filter(o => o.summoner===m && !o.dying).length;
      if(m.summonT <= 0 && mine < 4){
        m.summonT = 8;
        for(let i=0;i<2;i++){
          const s = mkMonster(m.type,'normal', m.x+rand(-20,20), m.y+rand(-20,20), {small:true, affixes:[], name:'Esbirro'});
          s.summoner = m; s.aggro = true; G.mons.push(s);
        }
        ring(m.x, m.y-6, 22, '#b9a8ff', .3); sfx('summon');
      }
    }
    // contacto: se encoge un instante (aviso) y luego golpea si sigue al alcance
    // los muros también protegen del golpe (salvo de los fantasmas, que los atraviesan)
    const reach = m.r + (target.r||6) + MD.reach;
    const see = m.ai==='float' || los(sc, m.x, m.y-4, target.x, target.y-4);
    if(m.prepT > 0){
      m.prepT -= dt; cx *= .2; cy *= .2;
      if(m.prepT <= 0){
        m.atkCd = 1.3;
        if(d < reach + 8 && see){
          if(target===P) damagePlayer(m.curDmg, m, MD.electric ? 'light' : undefined);
          else if(G.mons.includes(target)) hitMonster(target, m.curDmg, {src:'mon', nx:dx/d, ny:dy/d, k:140});
          else damagePet(target, m.curDmg, m);
        }
      }
    } else if(d < reach && m.atkCd <= 0 && see) m.prepT = MD.prep;
  } else {
    // deambular cerca de casa
    m.wanderT -= dt;
    if(m.wanderT <= 0){ m.wanderT = rand(2,5); m.wander = {x:m.home.x+rand(-60,60), y:m.home.y+rand(-60,60)}; }
    const dx = m.wander.x-m.x, dy = m.wander.y-m.y, d = Math.hypot(dx,dy);
    if(d > 6){ cx = dx/d*spd*.4*hopF; cy = dy/d*spd*.4*hopF; m.face = dx > 0 ? 1 : -1; }
  }
  // Venenoso: charcos
  if(A.includes('venenoso') && (cx||cy)){
    m.poisonDrop -= dt;
    if(m.poisonDrop <= 0){ m.poisonDrop = 1.2; G.hazards.push({type:'poison', x:m.x, y:m.y, r:13, life:4, max:4}); }
  }
  // separación entre monstruos
  for(const o of G.mons){
    if(o===m || o.dying) continue;
    const ox = m.x-o.x, oy = m.y-o.y, od = Math.hypot(ox,oy), mm = m.r+o.r;
    if(od < mm && od > 0){ cx += ox/od*(mm-od)*8; cy += oy/od*(mm-od)*8; }
  }
  if(m.ai==='float'){ m.x = clamp(m.x + (cx+m.vx)*dt, sc.x0+10, sc.x1-10); m.y = clamp(m.y + (cy+m.vy)*dt, sc.y0+10, sc.y1-10); }
  else moveSteer(sc, m, (cx+m.vx)*dt, (cy+m.vy)*dt);
  if(Math.abs(cx) + Math.abs(cy) > 8) m.walk += dt*Math.max(4, spd/8);
  const f = Math.exp(-dt*7); m.vx *= f; m.vy *= f;
}
function hitMonster(m, dmg, o){
  if(m.dying || m.downT > 0) return;
  if(m.affixes.includes('imparable')) o = Object.assign({}, o, {stun:0, slow:0, freeze:0, fear:0, k:0});
  if(o.src==='pet' && o.pet && o.pet.def.affixes.includes('valiente') && m.rarity!=='normal') dmg *= 1.4;
  if(m.markT > 0) dmg *= 1.25;
  if(m.exposedT > 0) dmg *= 1.1;   // presa fácil
  if(o.src==='player' && m.bleedT > 0 && legendOn('fenrirfang')) dmg *= 1.25;
  if(o.src==='pet' && o.pet && petHas(o.pet,'cazadora') && (m.markT > 0 || m.bleedT > 0 || m.burnT > 0)) dmg *= 1.25;
  dmg *= legendHitMod(m);
  if(o.src==='player' && P.eclipseT > 0) dmg *= 1.3;
  if(o.src==='player' && P.warT > 0) dmg *= 1.25;
  if(o.src==='player' && P.timeRingN > 0) dmg *= 1.25;
  if(o.src==='player' && P.weakT > 0) dmg *= .6;   // debilitado por los rayos del brujo élfico
  if(MONSTERS[m.type].guard && o.nx && Math.sign(-o.nx) === m.face && m.stunT <= 0){ dmg *= .4; addText(m.x, m.y-m.r*2-20, 'Bloqueo', '#c8d0e0', 6, -20); }
  if(m.affixes.includes('acorazado')) dmg *= .75;
  dmg = Math.max(1, Math.round(dmg));
  let shown = dmg;
  if(m.shield > 0){
    const ab = Math.min(m.shield, dmg); m.shield -= ab; dmg -= ab;
    if(m.shield <= 0) burst(m.x, m.y-m.r, 10, ['#a0c8ff','#ffffff'], [60,160], [.2,.4], 0);
  }
  m.hp -= dmg; m.flash = .12; m.lastHit = 0; m.aggro = true;
  if(o.src==='player' && G.stats && G.stats.leech && !P.dead) P.hp = Math.min(P.maxHp, P.hp + shown*G.stats.leech/100);
  if(!m.affixes.includes('pesado') && !MONSTERS[m.type].boss && o.k){ const k = o.k/(m.r/11); m.vx += o.nx*k; m.vy += o.ny*k; }
  if(!MONSTERS[m.type].boss) m.atkCd = Math.max(m.atkCd, .35);   // los jefes no retrasan su ataque al recibir golpes (Urr se quedaba parado si lo atacabas muy seguido)
  if(o.stun && !MONSTERS[m.type].boss) m.stunT = Math.max(m.stunT, o.stun);
  if(o.slow && !(m.slowImmT > 0)) m.slowT = Math.max(m.slowT, o.slow);   // tras un ralentizado, 10 s de inmunidad
  if(o.poison) m.poisonT = Math.max(m.poisonT, o.poison);
  if(o.burn){ if(!(m.burnT > 0)){ burst(m.x, m.y-m.r, 14, ['#ff5a1a','#ff8a2a','#ffc04a','#fff0a0'], [30,100], [.3,.6], -80); ring(m.x, m.y-4, 18, '#ff8a2a', .25); } m.burnT = Math.max(m.burnT, o.burn); }
  if(o.freeze && !(m.freezeImmT > 0)){ m.freezeImmT = o.freeze + 10; m.freezeT = Math.max(m.freezeT||0, o.freeze);   // tras descongelarse, 10 s sin poder volver a congelarse
    burst(m.x, m.y-m.r, 18, ['#c8f0ff','#7ac8f0','#ffffff'], [30,110], [.3,.7], 0); ring(m.x, m.y-4, 22, '#c8f0ff', .35); sfx('click'); }
  if(o.weaken){
    m.weakT = Math.max(m.weakT||0, o.weaken); burst(m.x, m.y-m.r, 14, ['#ffe85a','#fffbd0','#ffffff'], [40,130], [.2,.5], 0); ring(m.x, m.y-4, 20, '#ffe85a', .25);
    let bx = m.x + rand(-4,4), by = m.y - 70; for(let i=0;i<9;i++){ const nx = m.x + rand(-6,6), ny = by + (m.y - m.r - by)*(i+1)/9; for(let k=0;k<4;k++) G.parts.push({x:lerp(bx,nx,k/4), y:lerp(by,ny,k/4), vx:0, vy:0, life:.18, max:.18, size:2, col:i%2 ? '#fffbd0' : '#ffe85a'}); bx = nx; by = ny; }   // rayo que cae del cielo
  }
  if(o.mark && !(m.markT > 0)) addText(m.x, m.y-m.r*2-18, 'Marcado', '#ffd166', 6, -20);
  if(o.mark) m.markT = o.markT || 4;
  if(o.bleed) m.bleedT = Math.max(m.bleedT||0, o.bleed);
  if(o.fear && !MONSTERS[m.type].boss){ if(!(m.fearT > 0)) addText(m.x, m.y-m.r*2-18, '¡Miedo!', '#c8a0ff', 6, -20); m.fearT = Math.max(m.fearT||0, o.fear); }
  // Espinoso: devuelve parte del daño cuerpo a cuerpo
  if(m.affixes.includes('espinoso') && o.melee && o.src==='player') hurtPlayer(Math.max(1, Math.round(shown*.2)), '#e0a0ff');
  { const th = monFx(m, 'thorns'); if(th && o.melee && o.src==='player') hurtPlayer(Math.max(1, Math.round(shown*th/100)), '#e0a0ff'); }
  sfx(o.src==='pet' ? 'petHit' : ({skeleton:'stoneHit', ghost:'click'}[m.art] || 'slime'), .03);
  const col = o.src==='pet' ? '#f2c46d' : o.crit ? '#ffd166' : '#ffffff';
  addText(m.x+rand(-5,5), m.y-m.r*2-8, o.crit ? shown+'!' : ''+shown, col, o.crit ? 11 : 8);
  const hx = m.x - (o.nx||0)*m.r*.6, hy = m.y - (o.ny||0)*m.r*.6 - 8;
  ring(hx, hy, o.crit ? 20 : 13);
  burst(hx, hy, o.crit ? 12 : 7, [monCols(m)[2], '#fff7d6'], [80,240], [.2,.45]);
  if(m.hp <= 0){ if(o.src==='player' && legendOn('alphahorn')) for(const p of G.pets) p.packArmed = true; killMonster(m); }
}
function killMonster(m){
  if(m.dying) return;
  if(monAffixBeforeDeath(m)) return;
  monAffixDeath(m);
  m.dying = .001; G.kills++; sfx({skeleton:'breakItem', ghost:'lanternOut'}[m.art] || 'slimeDie');
  if(!m.summoner) addXP(m.xp);                       // los invocados no dan experiencia
  burst(m.x, m.y-m.r*.6, 18, monCols(m), [60,220], [.4,.8], m.ai==='float' ? -40 : 400, [2,4]);
  // botín
  const L = LOOT.monster[m.rarity], lvl = G.sc.lvl || 1, goldMult = (hasPetAffix('buscatesoros') ? 1.15 : 1) * (1 + (G.stats ? G.stats.gold : 0)/100) * (1 + (lvl-1)*.35);
  if(!m.small && !m.summoner && Math.random() < L.gold) dropGold(m.x, m.y, Math.round(randi(L.goldN[0], L.goldN[1])*goldMult));
  if(m.stolen) dropGold(m.x, m.y, m.stolen);
  if(m.type==='skelarcher' && !m.summoner && Math.random() < .5) dropItem(m.x, m.y, mkItem('arrows', randi(3,8)));
  if(!m.small && !m.summoner && Math.random() < L.item*(1 + TT('bo')/100)*(1 + ((G.stats && G.stats.loot) || 0)/100)*(hasPetAffix('cazarrecompensas') ? 1.1 : 1)){ const e = wpick(lootFor(LOOT.monsterTable, lvl)); dropItem(m.x, m.y, mkItem(e.id, e.n ? randi(e.n[0], e.n[1]) : 1, lvl, {normal:0, magic:.3, rare:.8}[m.rarity])); }
  if(L.treasure && !m.summoner && Math.random() < L.treasure + (hasPetAffix('buscatesoros')?.05:0)) dropItem(m.x, m.y, mkItem('treasure'));
  if(MONSTERS[m.type].elf && !m.summoner && !m.small) elfDrop(m);
  if(MONSTERS[m.type].ghost && !m.summoner && !m.small) ghostDrop(m);
  if(MONSTERS[m.type].sea && !m.summoner && !m.small) seaDrop(m);
  if(lvl >= 8 && !m.summoner && !m.small) luckDrop(m);
  if(!m.summoner && !m.small){ legendDrop(m, lvl); legendExclDrop(m); if(MONSTERS[m.type].temple){ templeDrop(m); elfDrop(m); } }
  legendKill(m);
  if(m.legendMark && m.markT > 0){ const e = wpick(lootFor(LOOT.monsterTable, lvl)); dropItem(m.x + rand(-8,8), m.y, mkItem(e.id, e.n ? randi(e.n[0], e.n[1]) : 1, lvl, 0)); addText(m.x, m.y-m.r*2-34, '¡Presa!', '#a8ffb8', 7, -20); }   // trébol de la suerte y pata de conejo
  if(MONSTERS[m.type].mine && !m.summoner && !m.small) gemDrop(m);   // gemas: solo en la mina   // los elfos oscuros llevan equipo élfico
  // Divisor y Explosivo
  if(m.affixes.includes('divisor') && !m.small)
    for(let i=0;i<2;i++){ const s = mkMonster(m.type, 'normal', m.x+rand(-10,10), m.y+rand(-10,10), {small:true, affixes:[], instant:true, name:'Fragmento'}); s.aggro = true; s.vx = rand(-150,150); s.vy = rand(-150,150); G.mons.push(s); }
  if(m.affixes.includes('explosivo')) G.hazards.push({type:'boom', x:m.x, y:m.y, r:44, life:1, max:1, dmg:18});
  if(MONSTERS[m.type].boss){
    G.bossFight = null; G.save.bossKills = (G.save.bossKills||0) + 1;
    toast(`¡Has derrotado a ${MONSTERS[m.type].name}!`, 4); G.flash = {x:m.x, y:m.y-30, t:.6}; G.shake = 10;
    for(let i=0;i<3;i++){ const e = wpick(lootFor(LOOT.monsterTable, lvl).filter(o => ITEMS[o.id].gear)); dropItem(m.x, m.y, mkItem(e.id, 1, lvl, 1.2)); }
    dropItem(m.x, m.y, mkItem('treasure'));
    {   // portal de retorno a casa junto al lugar donde cae el jefe
      const pp = freeSpotNear(m.x - 70, m.y + 60, 20);
      G.sc.portals.push({x:Math.round(pp.x), y:Math.round(pp.y), t:0, seen:true});
      G.sc.lights.push({x:Math.round(pp.x), y:Math.round(pp.y)-8, r:120, a:.9, warm:false, flick:.1, col:'portal'});
      ring(pp.x, pp.y-10, 50, '#b8a0ff', .6); burst(pp.x, pp.y-14, 24, ['#9a7aff','#e0d8ff','#ffffff'], [40,160], [.5,1], -30);
      toast('Se ha abierto un portal de retorno cerca. Quédate encima 5 s para volver a casa', 4.5);
    }
    const eid = G.sc.exp && G.sc.exp.id;
    if(eid){ (G.save.bossDone ??= {})[eid] = true; saveGame(); }   // el jefe derrotado desbloquea la siguiente expedición
    if(eid && !G.save.bossGift[eid] && petsOfExp(G.sc.petExp ?? (G.sc.lvl || 1)).length){
      G.save.bossGift[eid] = true; saveGame();
      const sp = freeSpotNear(m.x, m.y + 30, 14), cage = {x:Math.round(sp.x), y:Math.round(sp.y), pet:null, shiny:true, gift:true, open:false};
      cage.col = addCollider(G.sc, {t:'r', x:cage.x-12, y:cage.y-8, w:24, h:8}); G.sc.cages.push(cage);
      G.sc.lights.push({x:cage.x, y:cage.y-14, r:120, a:.9, warm:true, tint:'rgba(255,220,120,.2)', flick:.15});
      toast('¡El jefe ha dejado una jaula con una mascota BRILLANTE!', 5); ring(cage.x, cage.y-10, 40, '#ffe08a', .5); sfx('levelup');
      setTimeout(() => UI.showScreen('<h1 style="color:#ffe08a">¡JAULA BRILLANTE!</h1><p>Has derrotado a un jefe por primera vez: ha dejado una jaula con una mascota BRILLANTE.</p><p class="sub">Busca la jaula que brilla con un «!» cerca de donde ha caído el jefe.</p>', '¡Genial!'), 1800);
    }
    { const qd = MONSTERS[m.type].questDrop; if(qd && !(typeof qDone === 'function' && qDone(MONSTERS[m.type].questId)) && countItem(qd) === 0){ dropItem(m.x, m.y + 12, mkItem(qd)); toast('¡Ha soltado un objeto de misión!', 3.5); } }
    const ul = MONSTERS[m.type].uniques || [];
    if(ul.length && Math.random() < UNIQUE_CHANCE){ dropItem(m.x, m.y, mkItem(pick(ul))); toast(`¡${MONSTERS[m.type].name} ha dejado caer un objeto único!`, 4); }
    for(const o of G.mons) if(o.summoner===m && !o.dying) killMonster(o);
  }
}
function addXP(n){
  const s = G.save; s.xp += n;
  while(s.xp >= xpFor(s.level)){
    s.xp -= xpFor(s.level); s.level++;
    s.skillPts = (s.skillPts||0) + 1;
    refreshStats(); P.hp = Math.min(P.maxHp, P.hp + 10);
    toast('¡Nivel ' + s.level + '!', 2.5); sfx('levelup');
    if(petSlots(s.level) > petSlots(s.level-1)) toast('¡Nuevo hueco de mascota desbloqueado!', 3);
    burst(P.x, P.y-20, 24, ['#ffe08a','#fff1b8'], [40,120], [.6,1], -80);
    UI.refresh();
  }
}

// =====================================================================
//  Jefe: la Condesa fantasma
// =====================================================================
function inBossRoom(x, y){ const r = G.sc.bossRoom; return r && x > r.x && x < r.x+r.w && y > r.y && y < r.y+r.h; }
function updateBoss(m, dt){
  const sc = G.sc, MD = MONSTERS[m.type], R2 = sc.bossRoom;
  m.walk += dt*3;
  if(!m.awake){
    if((inBossRoom(P.x, P.y) && !P.dead) || m.hp < m.maxHp){
      m.awake = true; m.atkCd = 1.5; G.bossFight = m;
      toast('La Condesa fantasma despierta...', 3); sfx('alba'); G.shake = Math.max(G.shake, 6);
      ring(m.x, m.y-30, 60, '#ff60c0', .5);
    }
    return;
  }
  if(P.dead) return;
  if(!m.phase2 && m.hp < m.maxHp*.5){
    m.phase2 = true; toast('¡La Condesa fantasma se enfurece!', 3); G.flash = {x:m.x, y:m.y-30, t:.4};
    burst(m.x, m.y-30, 40, ['#ff60c0','#eae4ff','#bcb0dc'], [80,240], [.5,1], 0); sfx('howl');
  }
  // teletransporte (se desvanece y reaparece)
  if(m.tele){
    m.tele.t -= dt; m.fade = clamp(Math.abs(m.tele.t - .25)/.25, 0, 1);
    if(m.tele.t <= .25 && !m.tele.moved){ m.x = m.tele.x; m.y = m.tele.y; m.tele.moved = true; }
    if(m.tele.t <= 0){ m.tele = null; m.fade = 1; }
    return;
  }
  const dx = P.x-m.x, dy = P.y-m.y, d = Math.hypot(dx,dy) || 1;
  m.face = dx > 0 ? 1 : -1;
  // flota manteniendo cierta distancia, sin salir de la sala del trono
  let cx = 0, cy = 0; const spd = MD.spd * (m.phase2 ? 1.25 : 1);
  if(d > 120){ cx = dx/d*spd; cy = dy/d*spd; } else if(d < 70){ cx = -dx/d*spd*.7; cy = -dy/d*spd*.7; }
  cx += Math.cos(G.t*.9)*30; cy += Math.sin(G.t*1.3)*20;
  if(m.prepT > 0){ cx *= .2; cy *= .2; }
  m.x += (cx + m.vx)*dt; m.y += (cy + m.vy)*dt; m.vx *= .9; m.vy *= .9;
  if(R2){ m.x = clamp(m.x, R2.x+40, R2.x+R2.w-40); m.y = clamp(m.y, R2.y+70, R2.y+R2.h-30); }
  if(m.prepT > 0){
    m.prepT -= dt;
    if(m.prepT <= 0) bossCast(m);
    return;
  }
  if(m.atkCd <= 0){
    const mine = G.mons.filter(o => o.summoner===m && !o.dying).length;
    let c;
    if(d < 46) c = 'claw';
    else { const orbs = G.projs.filter(p => p.mon===m && p.kind==='orb').length, r = Math.random(); c = r < .4 && orbs < 3 ? 'lament' : r < .75 ? 'embrace' : (mine < 4 ? 'retinue' : 'embrace'); }
    m.cast = c; m.prepT = {lament:.7, embrace:.5, retinue:.8, claw:.38}[c];
    m.atkCd = 99;   // el siguiente ataque se programa cuando termina este (así no se solapan)
    const names = {lament:'Lamento', embrace:'Abrazo helado', retinue:'Séquito', claw:''};
    if(names[c]) addText(m.x, m.y-70, names[c], '#ff9ad8', 8, -20);
  }
}
function bossCast(m){
  const dmg = m.curDmg || m.dmg;
  m.atkCd = m.phase2 ? rand(2.8,3.5) : rand(3.6,4.4);
  if(m.cast==='lament'){
    // un único anillo con huecos anchos entre orbes (8 en la fase 1, 10 en la 2), girado hacia el héroe
    const n = m.phase2 ? 10 : 8, sp = 120, base = Math.atan2(P.y-14-(m.y-30), P.x-m.x) + Math.PI/n;
    for(let i=0;i<n;i++){ const a = base + i/n*Math.PI*2;
      G.projs.push({x:m.x, y:m.y-30, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, life:2.6, kind:'orb', from:'mon', mon:m, dmg:dmg*.6, r:4, ghost:true, col:['#8a2a6a','#ff60c0','#ffe0f4']}); }
    ring(m.x, m.y-30, 40, '#ff60c0', .35); sfx('alba');
  } else if(m.cast==='embrace'){
    m.tele = {t:.5, x:P.x + rand(-70,70), y:P.y - rand(50,80)};
    const spots = [[P.x, P.y]]; if(m.phase2) spots.push([P.x + rand(-80,80), P.y + rand(-60,60)], [P.x + rand(-80,80), P.y + rand(-60,60)]);
    for(const [x,y] of spots) G.hazards.push({type:'frost', x, y, r:46, life:.95, max:.95, dmg:dmg*1.2, mon:m});
    sfx('summon');
  } else if(m.cast==='retinue'){
    const n = m.phase2 ? 3 : 2;
    for(let i=0;i<n;i++){
      const t = i===2 ? 'wraith' : 'ghost', x = m.x + rand(-50,50), y = m.y + rand(-20,40);
      const g = mkMonster(t, 'normal', x, y, {affixes:[], name: t==='wraith' ? 'Espectro del séquito' : 'Fantasma del séquito'}); g.summoner = m; g.aggro = true; G.mons.push(g);
      burst(x, y-10, 14, ['#bcb0dc','#eae4ff'], [30,100], [.3,.6], -40);
    }
    sfx('summon');
  } else if(m.cast==='claw'){
    if(Math.hypot(P.x-m.x, P.y-m.y) < 64) damagePlayer(dmg*1.2, m);
    burst(m.x + m.face*20, m.y-20, 10, ['#eae4ff','#ff60c0'], [60,160], [.2,.4], 0);
  }
}

// =====================================================================
//  Mascotas
// =====================================================================
// =====================================================================
//  Jefe: Urr, el gran jefe orco
// =====================================================================
function updateUrr(m, dt){
  const sc = G.sc, MD = MONSTERS[m.type];
  m.walk += dt*3;
  if(!m.awake){
    if((inBossRoom(P.x, P.y) && !P.dead) || m.hp < m.maxHp){
      m.awake = true; m.atkCd = 1.5; G.bossFight = m;
      toast('¡Urr, el gran jefe orco, ha despertado!', 3); sfx('howl'); G.shake = Math.max(G.shake, 7);
      ring(m.x, m.y-30, 60, '#ff5a3c', .5);
    }
    return;
  }
  if(P.dead) return;
  if(!m.phase2 && m.hp < m.maxHp*.5){
    m.phase2 = true; toast('¡Urr entra en furia!', 3); G.flash = {x:m.x, y:m.y-30, t:.4}; G.shake = Math.max(G.shake, 8);
    burst(m.x, m.y-30, 40, ['#ff5a3c','#ffb347','#ffffff'], [80,240], [.5,1], 0); sfx('howl');
  }
  const dx = P.x-m.x, dy = P.y-m.y, d = Math.hypot(dx,dy) || 1;
  m.face = dx > 0 ? 1 : -1;
  if(m.charge){   // embestida en línea recta
    const ch = m.charge; ch.t -= dt;
    const bx = m.x, by = m.y; moveCircle(sc, m, ch.dx*440*dt, ch.dy*440*dt);
    if(Math.hypot(m.x-bx, m.y-by) < 440*dt*.4){ ch.t = 0; G.shake = Math.max(G.shake, 6); sfx('stoneHit'); }   // se choca con un muro
    if(!ch.hit && d < m.r + P.r + 10){ ch.hit = true; damagePlayer((m.curDmg||m.dmg)*1.4, m); }
    if(Math.random() < .6) G.parts.push({x:m.x+rand(-8,8), y:m.y, vx:rand(-20,20), vy:-20, life:.4, max:.4, size:rand(2,3), col:'#8a7a68'});
    if(ch.t <= 0){ m.charge = null; m.dizzy = 1; }
    return;
  }
  if(m.dizzy > 0){ m.dizzy -= dt; return; }
  const spd = MD.spd * (m.phase2 ? 1.3 : 1);
  let cx = 0, cy = 0;
  if(d > 50){ cx = dx/d*spd; cy = dy/d*spd; }
  if(m.prepT > 0){ cx *= .1; cy *= .1; if(m.cast==='charge' && Math.random() < .8) G.parts.push({x:m.x + m.cdx*rand(20,200), y:m.y + m.cdy*rand(20,200), vx:0, vy:-10, life:.3, max:.3, size:2, col:'#ff3a2a'}); }
  moveCircle(sc, m, (cx + m.vx)*dt, (cy + m.vy)*dt); m.vx *= .9; m.vy *= .9;
  if(m.prepT > 0){ m.prepT -= dt; if(m.prepT <= 0) urrCast(m); return; }
  if(m.atkCd <= 0){
    const mine = G.mons.filter(o => o.summoner===m && !o.dying).length;
    let k;
    if(d < 64) k = 'smash';
    else if(Math.random() < (m.phase2 ? .3 : .2)) k = 'shock';
    else { const r = Math.random(); k = r < .3 ? 'charge' : r < .58 ? 'axes' : r < .78 ? (mine < 3 ? 'roar' : 'axes') : (m.phase2 ? 'quake' : 'charge'); }
    m.cast = k; m.prepT = {smash:.65, charge:.85, axes:.6, roar:1, quake:.9, shock:1.15}[k]; m.atkCd = 99;
    if(k==='charge'){ m.cdx = dx/d; m.cdy = dy/d; }
    const names = {smash:'', charge:'¡Embestida!', axes:'Lluvia de hachas', roar:'¡Guerreros, a mí!', quake:'Temblor', shock:'¡CATACLISMO! ¡SALTA!'};
    if(names[k]) addText(m.x, m.y-80, names[k], '#ffb070', 8, -20);
  }
}
function urrCast(m){
  const dmg = m.curDmg || m.dmg;
  m.atkCd = m.phase2 ? rand(2.2,3) : rand(3,4);
  if(m.cast==='smash'){
    const ddx = P.x-m.x, ddy = P.y-m.y, dd = Math.hypot(ddx,ddy) || 1, sx = m.x + ddx/dd*38, sy = m.y + ddy/dd*38;   // el golpe cae hacia el héroe
    G.hazards.push({type:'slam', x:sx, y:sy, r:56, life:.3, max:.3});
    G.shake = Math.max(G.shake, 6); sfx('boom'); burst(sx, sy-6, 16, ['#8a7a68','#c8b898'], [60,180], [.3,.6], 200);
    if(Math.hypot(P.x-sx, (P.y-sy)*1.2) < 58) damagePlayer(dmg*1.3, m);
    for(const p of G.pets) if(Math.hypot(p.x-sx, p.y-sy) < 58) damagePet(p, dmg*.8, m);
  } else if(m.cast==='charge'){
    m.charge = {dx:m.cdx, dy:m.cdy, t:.6};
  } else if(m.cast==='axes'){
    const n = m.phase2 ? 5 : 3, base = Math.atan2(P.y-14-(m.y-30), P.x-m.x);
    for(let i=0;i<n;i++){ const a = base + (i - (n-1)/2)*.26;
      G.projs.push({x:m.x + m.face*10, y:m.y-30, vx:Math.cos(a)*230, vy:Math.sin(a)*230, life:1.8, kind:'axe', from:'mon', mon:m, dmg:dmg*.7, r:5}); }
    sfx('throw');
  } else if(m.cast==='roar'){
    const kinds = m.phase2 ? ['orc','orcbrute'] : ['orc','orcarcher'];
    for(const t of kinds){
      const p = freeSpotNear(m.x + rand(-60,60), m.y + rand(20,70), 10);
      const g = mkMonster(t, 'normal', p.x, p.y, {affixes:[]}); g.summoner = m; g.aggro = true; G.mons.push(g);
      burst(p.x, p.y-10, 12, ['#56803a','#c8b898'], [30,100], [.3,.6], -40);
    }
    ring(m.x, m.y-20, 60, '#ff8a3a', .5); G.shake = Math.max(G.shake, 5); sfx('howl');
  } else if(m.cast==='shock'){   // anillos expansivos de gran daño: solo se esquivan saltando en el momento justo (o quedándose fuera)
    const n = m.phase2 ? 4 : 3;
    for(let i = 0; i < n; i++) G.hazards.push({type:'shock', x:m.x, y:m.y, delay:i*.62, rad:0, spd:250 + (m.phase2 ? 30 : 0), life:2.4 + i*.62, max:2.4 + i*.62, dmg:dmg*1.9, mon:m, hitP:false, hitPets:new Set(), started:false});
    G.shake = Math.max(G.shake, 9); sfx('boom'); burst(m.x, m.y-6, 26, ['#8a7a68','#c8b898','#ff8a3a'], [80,240], [.4,.8], 200);
  } else if(m.cast==='quake'){
    for(let i=0;i<3;i++){ const px = i===0 ? P.x : P.x + rand(-90,90), py = i===0 ? P.y : P.y + rand(-70,70);
      G.hazards.push({type:'quake', x:px, y:py, r:46, life:1, max:1, dmg:dmg*1.1, mon:m}); }
    sfx('summon');
  }
}

// =====================================================================
//  Trampas del castillo de Urr (pinchos, rejillas de fuego y dardos)
// =====================================================================
const TRAP_SRC = {affixes:[], type:'slime', x:0, y:0, dmg:0, dying:1, r:6};
function trapHit(t, dmg){
  TRAP_SRC.x = t.x; TRAP_SRC.y = t.y;
  if(damagePlayer(dmg, TRAP_SRC)) addText(P.x, P.y-56, '¡Trampa!', '#ff9a6a', 7);
  for(const p of G.pets) if(p.z < 6 && Math.hypot(p.x-t.x, p.y-t.y) < 26) damagePet(p, dmg*.6, null);
}
function updateTraps(dt){
  const sc = G.sc; if(!sc.traps || P.dead) return;
  for(const t of sc.traps){
    const near = Math.hypot(t.x-P.x, t.y-P.y) < 360;
    if(t.kind==='spikes'){
      const ph = (G.t + t.off) % 3.4; t.state = ph < 1.7 ? 0 : ph < 2.3 ? 1 : ph < 3.0 ? 2 : 3;
      if(t.state !== 2) t.hit = false;
      else if(!t.hit && Math.abs(P.x-t.x) < 28 && Math.abs(P.y-t.y) < 24){ t.hit = true; trapHit(t, 22); }
      if(t.state===1 && near && Math.random() < dt*3) sfx('click');
    } else if(t.kind==='vent'){
      const ph = (G.t + t.off) % 4.4; t.state = ph < 2.7 ? 0 : ph < 3.3 ? 1 : ph < 4.2 ? 2 : 3;
      if(t.state === 2){ t.hitT = (t.hitT ?? 0) - dt; if(t.hitT <= 0 && Math.hypot(P.x-t.x, (P.y-t.y)*1.2) < 22){ t.hitT = .45; trapHit(t, 14); } }
      else t.hitT = 0;
      if(t.state === 1 && near && Math.random() < dt*10) G.parts.push({x:t.x+rand(-5,5), y:t.y-4, vx:rand(-8,8), vy:-24, life:.5, max:.5, size:2, col:'#6a6a70'});
    } else if(t.kind==='turret'){
      t.cd -= dt;
      if(near && t.cd <= 0){
        t.cd = 2.4 + Math.random()*.6; sfx('throw');
        G.projs.push({x:t.x + t.dx*8, y:t.y + t.dy*8 - 10, vx:t.dx*260, vy:t.dy*260, life:1.2, kind:'arrow', from:'mon', mon:TRAP_SRC, dmg:16, r:3, ang:Math.atan2(t.dy, t.dx)});
      }
    }
  }
}
function drawTraps(){
  const sc = G.sc; if(!sc.traps) return;
  for(const t of sc.traps){
    if(Math.abs(t.x-G.cam.x) > 330 || Math.abs(t.y-G.cam.y) > 260) continue;
    const x = Math.round(t.x), y = Math.round(t.y);
    if(t.kind==='spikes'){
      for(const dx of [-12,0,12]) for(const dy of [-8,0,8]){
        const px = x+dx, py = y+dy;
        if(t.state===0 || t.state===3){ b.fillStyle = '#050406'; b.fillRect(px-2, py, 5, 2); b.fillStyle = '#3a3238'; b.fillRect(px-2, py+2, 5, 1); if(t.state===3){ pixLine(px, py, px, py-2, 1, '#8a8e98'); } }
        else {
          const h = t.state===1 ? 3 : 9;
          pixLine(px, py+1, px, py-h, 3, OUT); pixLine(px, py+1, px, py-h, 1, t.state===1 ? '#c86a5a' : '#e8ecf2');
        }
      }
    } else if(t.kind==='vent'){
      b.fillStyle = '#0a0809'; b.fillRect(x-8, y-4, 16, 8); b.fillStyle = '#3a3236'; for(let i=-6;i<=6;i+=4) b.fillRect(x+i, y-4, 1, 8);
      if(t.state===1){ b.globalAlpha = .5 + .4*Math.sin(G.t*20); b.fillStyle = '#ff5a1a'; b.fillRect(x-7, y-3, 14, 6); b.globalAlpha = 1; }
      if(t.state===2){ drawFlames(x, y+2, 1.6); b.globalAlpha = .35; b.fillStyle = '#ffb040'; b.fillRect(x-9, y-5, 18, 10); b.globalAlpha = 1; }
    } else if(t.kind==='turret'){
      b.fillStyle = OUT; b.fillRect(x-6, y-8, 12, 12); b.fillStyle = '#4a3a34'; b.fillRect(x-5, y-7, 10, 10);
      b.fillStyle = t.cd < .5 ? '#ff5a2a' : '#1a1210'; b.fillRect(x-1 + t.dx*3, y-4 + t.dy*3, 3, 3);
    }
  }
}

const FOLLOW_OFF = [[-34,14], [-78,-22], [-120,20]];
// primer hueco libre alrededor de un punto (para que las mascotas no aparezcan dentro del caballo o de un muro)
function freeSpotNear(x, y, r=6){
  if(!blocked(G.sc, x, y, r)) return {x, y};
  for(let ring = 12; ring <= 140; ring += 12) for(let i=0;i<12;i++){ const a = i/12*Math.PI*2, px = x + Math.cos(a)*ring, py = y + Math.sin(a)*ring; if(!blocked(G.sc, px, py, r)) return {x:px, y:py}; }
  return {x, y};
}
// definición de la mascota con los afijos extra que le hayan salido en el suero de mutación
function petDef(it){ const d = PETS[it.pet]; return it.xaff && it.xaff.length ? Object.assign({}, d, {affixes:d.affixes.concat(it.xaff)}) : d; }
function mkPet(item, slot){
  const d = petDef(item), sp = freeSpotNear(P.x-24, P.y+8);
  return {item, def:d, slot, x:sp.x, y:sp.y, z:PET_ART[d.id].fly ? 16 : 0, r:6, dir:1, walk:0, moving:false, run:false,
    hp:Math.min(item.hp, petMaxHp(item)), maxHp:petMaxHp(item), state:'follow', target:null, cd:1.5, lt:0, jx0:0, jy0:0, jx1:0, jy1:0, exhaustedT:0, flash:0,
    pending:null, barkT:4, albaT:8, hitSet:null, dashT:0, windT:0, peckN:0, regenT:0};
}
function syncPets(){
  // crea o elimina entidades según los huecos equipados
  const want = G.inv.equip.pet.map((it,i) => it ? {it,i} : null).filter(Boolean);
  G.pets = G.pets.filter(p => want.some(w => w.it===p.item));
  for(const w of want) if(!G.pets.some(p => p.item===w.it)) G.pets.push(mkPet(w.it, w.i));
  for(const p of G.pets) p.slot = G.inv.equip.pet.indexOf(p.item);
}
const petHas = (p,a) => p.def.affixes.includes(a);
// suma de un efecto genérico (afijos creados en el editor) de los afijos de la mascota
const petFx = (p, k) => { let s = 0; for(const a of p.def.affixes){ const f = PET_AFFIX[a] && PET_AFFIX[a].fx; if(f && f[k]) s += f[k]; } return s; };
const monFx = (m, k) => { let s = 0; for(const a of m.affixes){ const f = MON_AFFIX[a] && MON_AFFIX[a].fx; if(f && f[k]) s += f[k]; } return s; };
const petCd = p => p.def.cd * (petHas(p,'veloz') ? .8 : 1) * (centinelaOn(p) ? .5 : 1) * (p.item.shiny ? .91 : 1) / (p.item.serums && p.item.serums.super ? 1.2 : 1) / (legendOn('alphahorn') ? 1.25 : 1) / (1 + petFx(p, 'aspd')/100) * Math.max(.4, 1 - (G.pt.petAspd||0)/100) * rand(.9,1.1);
const centinelaOn = p => petHas(p,'centinela') && !P.dead && P.hp < P.maxHp*.3;
function petDamage(p){ return rollR(p.def.dmg) * (petHas(p,'feroz') ? 1.25 : 1) * (centinelaOn(p) ? 1.5 : 1) * (1 + (G.stats ? G.stats.petdmg : 0)/100) * petDmgMult(p.item) * (legendOn('alphahorn') ? 1.25 : 1) * (1 + petFx(p, 'dmg')/100) * (p.packArmed ? (p.packArmed = false, 2) : 1) * (1 + ((G.pt.petDmg||0) + (G.pt.petAll||0))/100); }
function petStrike(p, m, mult=1, extra={}){
  // las mascotas de tierra no golpean a través de los muros
  if(!PET_ART[p.def.id].fly && !los(G.sc, p.x, p.y-4, m.x, m.y-4)) return;
  const d = Math.hypot(m.x-p.x, m.y-p.y) || 1;
  if(petHas(p,'ejecutora') && m.hp < m.maxHp*.3) mult *= 1.5;
  const crit = p.starCrit || Math.random() < (p.def.critPounce ? .2 : .1) + (G.pt.petCrit||0) + petFx(p, 'crit')/100; if(crit) mult *= 2;
  const bleed = extra.bleed || (petHas(p,'sangrienta') || petFx(p, 'bleed') || (p.def.bleed && Math.random() < p.def.bleed) ? 4 : 0);
  const stun = extra.stun || (petHas(p,'atronadora') && Math.random() < .15 ? .8 : 0) || (petFx(p, 'stun') && Math.random() < petFx(p, 'stun')/100 ? .8 : 0);
  hitMonster(m, petDamage(p)*mult, {src:'pet', pet:p, nx:(m.x-p.x)/d, ny:(m.y-p.y)/d, k:extra.k ?? 170,
    crit, poison: (petHas(p,'venenosa') || extra.poison || petFx(p, 'poison')) ? 3 : 0, slow: (petHas(p,'helada') || petFx(p, 'slow')) ? 2 : (extra.slow||0), burn: (p.def.burn || petHas(p,'ignea') || petHas(p,'crin') || petFx(p, 'burn')) ? 3 : 0, stun, bleed, mark: extra.mark || p.def.mark});
  if(p.starCrit && crit){ p.starCrit = false; }
  if(petHas(p,'presa') && !m.dying) m.exposedT = 4;
  if(m.dying && petHas(p,'estelar')){ p.starCrit = true; addText(p.x, p.y-30, '¡Estelar!', '#e8d8ff', 7); }
  if(petHas(p,'electrica') && Math.random() < .1 && !m.dying){
    let bo = null, bd = 110; for(const o of G.mons) if(o !== m && !o.dying){ const dd = Math.hypot(o.x-m.x, o.y-m.y); if(dd < bd){ bd = dd; bo = o; } }
    if(bo){ pixLine(m.x, m.y-12, bo.x, bo.y-12, 2, '#ffe84a'); burst(bo.x, bo.y-10, 8, ['#ffe84a', '#ffffff'], [30, 100], [.2, .4], 0); hitMonster(bo, petDamage(p)*mult*.5, {src:'pet', pet:p, nx:0, ny:0, k:0}); }
  }
  if(m.dying && p.def.raise) raiseAlly(p, m);
  if(petHas(p,'temible') && Math.random() < .1 && !m.dying && !MONSTERS[m.type].boss){ m.fearT = 2; m.prepT = 0; }
  if(m.dying && petHas(p,'voraz')){ p.hp = Math.min(p.maxHp, p.hp + p.maxHp*.15); addText(p.x, p.y-24, '+'+Math.round(p.maxHp*.15), '#7ad86a', 6); }
  if(petHas(p,'vampirica') && !P.dead) P.hp = Math.min(P.maxHp, P.hp+1);
  { const lf = petFx(p, 'leech'); if(lf && !P.dead) P.hp = Math.min(P.maxHp, P.hp + lf); }
  if(p.def.steal && Math.random() < .6 && G.sc.kind==='raid'){ const gold = randi(2,5); G.raidGold += gold; addText(m.x, m.y-m.r*2-14, '+' + gold, '#ffe08a', 6); sfx('coin'); }
  G.hitstop = Math.max(G.hitstop, .02);
}
function damagePet(p, dmg, m, silent, ranged){
  const fly = PET_ART[p.def.id].fly;
  if(p.exhaustedT > 0 || (p.z > 6 && !fly) || p.stoneT > 0) return;
  if(fly && !ranged) dmg *= .5;   // las voladoras reciben la mitad del daño cuerpo a cuerpo; los proyectiles les hacen el daño completo
  if(ranged && petHas(p,'voladora')) dmg *= .8;
  if(silent && petHas(p,'resiliente')) dmg *= .7;
  if(petHas(p,'agil') && Math.random() < .2 && !silent){ addText(p.x, p.y-24, 'Esquiva', '#c8e8ff', 6); return; }
  if(petHas(p,'dura')) dmg *= .85;
  { const dg = petFx(p, 'dodge'); if(dg && Math.random() < dg/100 && !silent){ addText(p.x, p.y-24, 'Esquiva', '#c8e8ff', 6); return; } }
  dmg *= Math.max(.2, 1 - petFx(p, 'dr')/100);
  dmg *= Math.max(.4, 1 - (G.pt.petArmor||0)/100);
  if(P.boneT > 0) dmg *= .8;   // hueso para mascota: +5 de armadura
  if(legendOn('coralheart')) dmg *= .85;   // corazón de coral
  p.hp -= dmg; p.flash = .12; p.regenT = 4;
  if(p.def.stone && p.hp > 0 && dmg >= p.maxHp*.08){ p.stoneT = 2; addText(p.x, p.y-30, '¡Piedra!', '#c8ccd4', 7); burst(p.x, p.y-10, 10, ['#8a8a92','#c8ccd4','#5a5a62'], [30,100], [.3,.6], 200); sfx('breakItem'); }
  if(!silent) addText(p.x, p.y-24, '-'+Math.round(dmg), '#ff9a9a', 7);
  if(m && m.hp !== undefined && petHas(p,'espinosa')) hitMonster(m, dmg*.2, {src:'pet', pet:p, nx:0, ny:0, k:0});
  { const th = petFx(p, 'thorns'); if(th && m && m.hp !== undefined) hitMonster(m, dmg*th/100, {src:'pet', pet:p, nx:0, ny:0, k:0}); }
  if(p.hp <= 0){
    if(petHas(p,'indomable') && !p.rose){ p.rose = true; p.hp = Math.round(p.maxHp*.3); toast(p.def.name + ' se levanta de nuevo', 2); burst(p.x, p.y-8, 16, ['#ffe08a','#ffffff'], [40,120], [.4,.8], -40); sfx('levelup'); }
    else petDie(p);
  }
}
// la mascota muere: sale del equipo y solo el druida puede devolverla,
// y únicamente si ya había llegado alguna vez a la guarida
function petDie(p){
  if(p.dead) return;
  p.dead = true; p.hp = 0; p.item.hp = 0;
  const i = G.inv.equip.pet.indexOf(p.item); if(i >= 0) G.inv.equip.pet[i] = null;
  if(p.item.homed){
    G.save.fallen.push({pet:p.def.id, shiny:!!p.item.shiny});
    toast(`${p.def.name} ha caído. Chemma el druida puede devolverle la vida`, 3);
  } else toast(`${p.def.name} ha caído antes de conocer la guarida... se ha perdido para siempre`, 3.5);
  sfx('petDown');
  burst(p.x, p.y-8, 20, ['#ffffff','#c8d0e0','#8a8fa8'], [30,120], [.5,1], -60);
  ring(p.x, p.y-6, 20, '#c8d0e0', .4);
  syncPets(); UI.refresh();
}
function nearestMonster(x, y, range, filter){
  let best = null, bd = range;
  for(const m of G.mons){ if(m.dying || m.spawnIn < 1 || (filter && !filter(m))) continue; const d = Math.hypot(m.x-x, m.y-y); if(d < bd){ bd = d; best = m; } }
  return best;
}
const validMon = m => m && !m.dying && G.mons.includes(m);
const ENGAGE = 170;

// las mascotas no se amontonan: se apartan unas de otras
function separatePets(dt){
  const ps = G.pets.filter(p => p.hp > 0 && p.exhaustedT <= 0 && !p.stamp && !p.gal);
  for(let i = 0; i < ps.length; i++) for(let j = i+1; j < ps.length; j++){
    const A = ps[i], B = ps[j]; let dx = B.x-A.x, dy = (B.y-A.y)*1.4, d = Math.hypot(dx, dy);
    const min = 42; if(d >= min) continue;
    if(d < .5){ dx = Math.cos(i*2.4+j); dy = Math.sin(i*2.4+j); d = 1; }
    const push = (min - d)*Math.min(1, dt*9)*.5, ux = dx/d, uy = dy/d/1.4;
    for(const [P2, sg] of [[A,-1],[B,1]]){
      if(P2.phase === 'leap' || P2.state === 'engage' && P2.phase === 'dash') continue;
      if(PET_ART[P2.def.id].fly){ P2.x += ux*push*sg; P2.y += uy*push*sg; } else moveCircle(G.sc, P2, ux*push*sg, uy*push*sg);
    }
  }
}
function updatePet(p, dt){
  const sc = G.sc, art = PET_ART[p.def.id], fly = art.fly;
  p.cd -= dt; p.flash -= dt; p.regenT -= dt;
  { const reg = (G.pt.petRegen||0) + (P.boneT > 0 ? 5 : 0) + (legendOn('coralheart') ? 3 : 0); if(reg && p.hp > 0 && p.hp < p.maxHp) p.hp = Math.min(p.maxHp, p.hp + reg*dt); }
  // rescate: si una mascota de tierra queda atrapada en un obstáculo, reaparece junto al héroe
  if(!fly && p.exhaustedT <= 0 && blocked(sc, p.x, p.y, 2)){ p.stuckT = (p.stuckT||0) + dt; if(p.stuckT > .5){ const sp = freeSpotNear(P.x-24, P.y+8); p.x = sp.x; p.y = sp.y; p.stuckT = 0; } } else p.stuckT = 0;
  p.item.hp = p.hp;
  if(p.exhaustedT > 0){
    p.exhaustedT -= dt;
    if(p.exhaustedT <= 0){ p.hp = Math.round(p.maxHp*.3); toast(p.def.name + ' se ha recuperado', 1.5); }
  } else if(p.regenT <= 0 && p.hp < p.maxHp) p.hp = Math.min(p.maxHp, p.hp + dt*1.5);
  const canFight = p.exhaustedT <= 0 && !P.dead;

  // Alba: Destello de Alba cada 20 s
  if(p.def.id==='alba' && canFight){
    p.albaT -= dt;
    if(p.albaT <= 0 && nearestMonster(p.x, p.y, 120)){
      p.albaT = 20;
      for(const m of G.mons) if(!m.dying && Math.hypot(m.x-p.x, m.y-p.y) < 120){ m.revealT = 5; petStrike(p, m, rand(1,1.15), {slow:2, k:200}); }
      if(sc.kind==='raid') P.oil = Math.min(oilMax(), P.oil+10);
      G.flash = {x:p.x, y:p.y-10, t:.5};
      ring(p.x, p.y-8, 60, '#fff1c0', .4); ring(p.x, p.y-8, 40, '#ffd88a', .3);
      burst(p.x, p.y-10, 30, ['#fff1c0','#ffd88a','#ffffff'], [80,220], [.4,.8], 0);
      addText(p.x, p.y-34, '¡Destello de Alba!', '#fff1c0', 8); sfx('alba');
    }
  }
  // Aullido: aullido que hace huir a los enemigos cercanos 2 s
  if(p.def.howl && canFight){
    p.howlT = (p.howlT ?? 4) - dt;
    if(p.howlT <= 0 && nearestMonster(p.x, p.y, 100)){
      p.howlT = 10;
      for(const m of G.mons) if(!m.dying && !MONSTERS[m.type].boss && Math.hypot(m.x-p.x, m.y-p.y) < 100){ m.fearT = 2; m.prepT = 0; }
      addText(p.x, p.y-30, '¡AUUUU!', '#d8e0ff', 8); ring(p.x, p.y-10, 40, '#c8d0e0', .4); sfx('howl');
    }
  }
  // Cerbero: llamarada infernal cada 24 s (anillo de fuego alrededor del héroe)
  if(p.def.inferno && canFight){
    p.infCd = (p.infCd ?? 8) - dt;
    if(p.infCd <= 0 && nearestMonster(p.x, p.y, 170)){
      p.infCd = 24; P.infernoT = 5; ring(P.x, P.y-8, 56, '#ff6a2a', .5); ring(P.x, P.y-8, 38, '#ffc04a', .4);
      burst(P.x, P.y-10, 26, ['#ff5a1a','#ff8a2a','#ffc04a'], [60,180], [.4,.9], -40); addText(P.x, P.y-56, '¡Llamarada infernal!', '#ffa060', 8); sfx('boom');
    }
  }
  // Halo: Floración cada 24 s (cura el 20 % de la vida al héroe y a todas las mascotas)
  if(p.def.rebirth && canFight){   // Fénix Sagrado: Renacer cada 25 s (cura el 25 % al héroe y a las mascotas y quema a los enemigos cercanos)
    p.rebirthCd = (p.rebirthCd ?? 8) - dt;
    if(p.rebirthCd <= 0 && (P.hp < P.maxHp*.9 || G.pets.some(q => q.hp > 0 && q.hp < q.maxHp*.9) || nearestMonster(p.x, p.y, 200))){
      p.rebirthCd = 25;
      const heal = Math.round(P.maxHp*.25); P.hp = Math.min(P.maxHp, P.hp + heal); addText(P.x, P.y-48, '+' + heal, '#7ad86a', 9);
      for(const q of G.pets) if(q.hp > 0){ q.hp = Math.min(q.maxHp, q.hp + q.maxHp*.25); addText(q.x, q.y-34, '+' + Math.round(q.maxHp*.25), '#7ad86a', 7); }
      for(const m of G.mons) if(!m.dying && Math.hypot(m.x-p.x, m.y-p.y) < 150){ m.burnT = Math.max(m.burnT || 0, 3); hitMonster(m, petDamage(p)*.8, {src:'pet', pet:p, nx:(m.x-p.x)/150, ny:(m.y-p.y)/150, k:160}); }
      for(const r2 of [30, 60, 100, 140]) ring(p.x, p.y-8, r2, '#ffd070', .5);
      burst(p.x, p.y-14, 30, ['#ffd070', '#ff8a30', '#ffffff'], [60, 200], [.5, 1], -60); addText(p.x, p.y-42, '¡Renacer!', '#ffd070', 9); sfx('alba'); G.flash = {x:p.x, y:p.y-10, t:.35};
    }
  }
  if(p.def.maelstrom && canFight){   // Krakenito: Remolino cada 24 s (un torbellino arrastra y daña a los enemigos cercanos)
    p.maelCd = (p.maelCd ?? 8) - dt;
    const tg = p.maelCd <= 0 ? nearestMonster(p.x, p.y, 240) : null;
    if(tg){ p.maelCd = 24; G.hazards.push({type:'whirl', x:tg.x, y:tg.y, r:84, life:4, max:4, pet:p, tick:0}); ring(tg.x, tg.y-6, 70, '#c890ff', .5); addText(p.x, p.y-42, p.def.skillName || '¡Remolino!', '#c8a0ff', 9); sfx('alba'); }
  }
  if(p.def.blizzard && canFight){   // Boreal: Ventisca cada 24 s (congela a los enemigos cercanos y les hace daño)
    p.blizCd = (p.blizCd ?? 8) - dt;
    if(p.blizCd <= 0 && nearestMonster(p.x, p.y, 220)){
      p.blizCd = 24;
      for(const m of G.mons) if(!m.dying && Math.hypot(m.x-p.x, m.y-p.y) < 200) hitMonster(m, petDamage(p)*1.2, {src:'pet', pet:p, nx:(m.x-p.x)/200, ny:(m.y-p.y)/200, k:120, slow:3, freeze: MONSTERS[m.type].boss ? 0 : 2.2});
      for(const r2 of [40, 80, 120, 170, 200]) ring(p.x, p.y-8, r2, '#aee8ff', .5);
      burst(p.x, p.y-14, 36, ['#aee8ff', '#ffffff', '#7ac8f0'], [60, 220], [.5, 1.1], -20); addText(p.x, p.y-42, '¡Ventisca!', '#aee8ff', 9); sfx('alba'); G.flash = {x:p.x, y:p.y-10, t:.3};
    }
  }
  if(p.def.bloom && canFight){
    p.bloomCd = (p.bloomCd ?? 8) - dt;
    if(p.bloomCd <= 0 && (P.hp < P.maxHp*.9 || G.pets.some(q => q.hp > 0 && q.hp < q.maxHp*.9) || nearestMonster(p.x, p.y, 200))){
      p.bloomCd = 24;
      const heal = Math.round(P.maxHp*.2); P.hp = Math.min(P.maxHp, P.hp + heal); addText(P.x, P.y-48, '+' + heal, '#7ad86a', 9);
      for(const q of G.pets) if(q.hp > 0){ q.hp = Math.min(q.maxHp, q.hp + q.maxHp*.2); addText(q.x, q.y-34, '+' + Math.round(q.maxHp*.2), '#7ad86a', 7); burst(q.x, q.y-10, 8, ['#fff0a0','#a8ffb8','#ffffff'], [20,80], [.4,.8], -50); }
      for(const r2 of [30, 55, 80]) ring(p.x, p.y-8, r2, '#fff0a0', .5);
      burst(P.x, P.y-20, 18, ['#fff0a0','#a8ffb8','#ffffff'], [40,120], [.5,1], -60); addText(p.x, p.y-42, p.def.skillName || '¡Floración!', '#fff0a0', 9); sfx('alba'); G.flash = {x:p.x, y:p.y-10, t:.3};
    }
  }
  // Fragua: Erupción cada 24 s (llamas bajo los enemigos cercanos que los aturden)
  if(p.def.eruption && canFight){
    p.eruptCd = (p.eruptCd ?? 8) - dt;
    if(p.eruptCd <= 0 && nearestMonster(p.x, p.y, 170)){
      p.eruptCd = 24;
      for(const o of G.mons){
        if(o.dying || Math.hypot(o.x-p.x, o.y-p.y) > 190) continue;
        G.hazards.push({type:'fire', x:o.x, y:o.y, r:30, life:3, max:3}); burst(o.x, o.y-6, 14, ['#ff5a1a','#ff8a2a','#ffc04a'], [40,160], [.3,.7], -40);
        petStrike(p, o, .8, {k:0, stun: MONSTERS[o.type].boss ? 0 : 1.2, burn:3});
      }
      for(const r2 of [30, 60, 90, 120]) ring(p.x, p.y-8, r2, '#ff6a2a', .5);
      G.shake = Math.max(G.shake, 6); addText(p.x, p.y-42, '¡Erupción!', '#ffb070', 9); sfx('boom'); G.flash = {x:p.x, y:p.y-10, t:.35};
    }
  }
  // Leviatán: Marea cada 24 s (ola que empuja a los enemigos y cura el 20 % de la vida al héroe)
  if(p.def.tide && canFight){
    p.tideCd = (p.tideCd ?? 8) - dt;
    if(p.tideCd <= 0 && nearestMonster(p.x, p.y, 170)){
      p.tideCd = 24;
      for(const o of G.mons){ if(o.dying || Math.hypot(o.x-p.x, o.y-p.y) > 190) continue; const dd = Math.hypot(o.x-p.x, o.y-p.y) || 1; if(!MONSTERS[o.type].boss){ o.vx += (o.x-p.x)/dd*620; o.vy += (o.y-p.y)/dd*620; } petStrike(p, o, .6, {k:0, slow:2}); }
      const heal = Math.round(P.maxHp*.2); P.hp = Math.min(P.maxHp, P.hp + heal); addText(P.x, P.y-48, '+' + heal, '#7ad86a', 9);
      for(const r2 of [30, 55, 80, 105]) ring(p.x, p.y-8, r2, '#5ac8ff', .5);
      burst(p.x, p.y-10, 30, ['#5ac8ff','#aee8ff','#ffffff'], [80,260], [.4,.9], 0); addText(p.x, p.y-42, '¡Marea!', '#aee8ff', 9); sfx('howl'); G.flash = {x:p.x, y:p.y-10, t:.35};
    }
  }
  // Sangrelobo: aullido de guerra cada 20 s (los enemigos huyen y el héroe hace +25 % de daño)
  if(p.def.warcry && canFight){
    p.warCd = (p.warCd ?? 6) - dt;
    if(p.warCd <= 0 && nearestMonster(p.x, p.y, 160)){
      p.warCd = 20;
      for(const o of G.mons) if(!o.dying && !MONSTERS[o.type].boss && Math.hypot(o.x-p.x, o.y-p.y) < 175){ o.fearT = 3; o.prepT = 0; }
      P.warT = 5; ring(p.x, p.y-10, 70, '#ff8a3a', .5); ring(p.x, p.y-10, 44, '#ffd070', .4);
      burst(p.x, p.y-10, 24, ['#ff8a3a','#ffd070','#ffffff'], [60,200], [.4,.9], 0); addText(p.x, p.y-40, p.def.skillName || '¡Aullido de guerra!', '#ffb070', 8); sfx('howl');
    }
  }
  // Selene: estampida espectral cada 18 s (atraviesa muros y enemigos y los aturde)
  if(p.def.stampede && canFight){
    if(p.stamp){
      const s2 = p.stamp; s2.t -= dt;
      p.x = clamp(p.x + s2.dx*520*dt, sc.x0+10, sc.x1-10); p.y = clamp(p.y + s2.dy*520*dt, sc.y0+10, sc.y1-10);
      p.dir = s2.dx > 0 ? 1 : -1; p.moving = true; p.run = true; p.walk += dt*26;
      if(Math.random() < .8) G.parts.push({x:p.x+rand(-6,6), y:p.y-rand(4,24), vx:-s2.dx*60, vy:-10, life:.5, max:.5, size:rand(1.5,3), col:pick(['#b8e8ff','#eef4ff','#88d8ff'])});
      for(const o of G.mons){
        if(o.dying || s2.hit.has(o) || Math.hypot(o.x-p.x, o.y-p.y) > o.r+12) continue;
        s2.hit.add(o); hitMonster(o, petDamage(p)*1.4, {src:'pet', pet:p, nx:s2.dx, ny:s2.dy, k:300, stun:1.2});
      }
      if(s2.t <= 0){ p.stamp = null; p.state = 'follow'; p.target = null; p.cd = 1; }
      return;
    }
    p.stampT = (p.stampT ?? 6) - dt;
    if(p.stampT <= 0){
      const m = nearestMonster(p.x, p.y, 170);
      if(m){
        p.stampT = 18; const dx = m.x-p.x, dy = m.y-p.y, d = Math.hypot(dx,dy) || 1;
        p.stamp = {t:.55, dx:dx/d, dy:dy/d, hit:new Set()};
        addText(p.x, p.y-40, '¡Estampida espectral!', '#b8e8ff', 8); sfx('alba'); G.flash = {x:p.x, y:p.y-12, t:.3};
      }
    }
  }
  if(p.stoneT > 0) p.stoneT -= dt;
  // Nube: cada 10 s cura 10 de vida al héroe
  if(p.def.healer && canFight){ p.nubeT = (p.nubeT ?? 6) - dt; if(p.nubeT <= 0 && P.hp < P.maxHp){ p.nubeT = 10; P.hp = Math.min(P.maxHp, P.hp + 10); addText(P.x, P.y-46, '+10', '#7ad86a', 8); ring(P.x, P.y-12, 20, '#aaffbb', .35); sfx('potion'); } }
  // Nocturna: Eclipse cada 25 s (los enemigos se atacan entre ellos y el héroe +30 % de daño)
  if(p.def.eclipse && canFight){
    p.eclT = (p.eclT ?? 8) - dt;
    if(p.eclT <= 0 && nearestMonster(p.x, p.y, 150)){
      p.eclT = 25; let n = 0;
      for(const o of G.mons) if(!o.dying && !MONSTERS[o.type].boss && Math.hypot(o.x-p.x, o.y-p.y) < 175){ o.confuseT = 4; o.prepT = 0; n++; }
      P.eclipseT = 4; G.flash = {x:p.x, y:p.y-12, t:.5}; ring(p.x, p.y-10, 70, '#b070ff', .5); ring(p.x, p.y-10, 46, '#e0c0ff', .4);
      burst(p.x, p.y-10, 26, ['#b070ff','#e0c0ff','#7a3aff'], [60,200], [.4,.9], 0); addText(p.x, p.y-40, '¡Eclipse!', '#d8b0ff', 9); sfx('alba');
    }
  }
  // Curandera: cura 1 de vida al héroe cada 4 s
  { const hf = petFx(p, 'heal'); if(hf && canFight && P.hp < P.maxHp){ p.fhealT = (p.fhealT ?? 4) - dt; if(p.fhealT <= 0){ p.fhealT = 4; P.hp = Math.min(P.maxHp, P.hp + hf); addText(P.x, P.y-46, '+' + hf, '#7ad86a', 7); } } }
  if(petHas(p,'escudera') && canFight){ p.shT = (p.shT ?? 6) - dt; if(p.shT <= 0){ p.shT = 12; P.gelShield = Math.max(P.gelShield || 0, 25); addText(P.x, P.y-62, 'Escudo', '#8ab8ff', 7); ring(P.x, P.y-10, 30, '#8ab8ff', .3); } }
  if(petHas(p,'sanadora') && canFight){ p.sanT = (p.sanT ?? 4) - dt; if(p.sanT <= 0){ p.sanT = 8; for(const o of G.pets) if(o !== p && o.hp > 0 && o.hp < o.maxHp){ o.hp = Math.min(o.maxHp, o.hp + o.maxHp*.08); if(o.item) o.item.hp = o.hp; addText(o.x, o.y-30, '+' + Math.round(o.maxHp*.08), '#7ad86a', 6); } } }
  if(petHas(p,'curandera') && canFight && P.hp < P.maxHp){ p.healT = (p.healT ?? 4) - dt; if(p.healT <= 0){ p.healT = 4; P.hp = Math.min(P.maxHp, P.hp+5); addText(P.x, P.y-46, '+5', '#7ad86a', 7); } }
  // Chiflo: cada 12 s silba y revela los cofres cercanos
  if(p.def.chestPing && canFight){
    p.pingT = (p.pingT ?? 3) - dt;
    if(p.pingT <= 0){ p.pingT = 12; let n = 0; for(const c of G.sc.chests) if(!c.open && Math.hypot(c.x-P.x, c.y-P.y) < 500){ c.pinged = 6; n++; } if(n){ addText(p.x, p.y-30, '¡Fiu!', '#ffe0a0', 7); ring(p.x, p.y-10, 24, '#ffe0a0', .3); sfx('bark'); } }
  }
  // Aurora: Galope ardiente cada 22 s (rastro de fuego y +20 % de velocidad al héroe)
  if(p.def.gallop && canFight){
    if(p.gal){
      const g2 = p.gal; g2.t -= dt;
      p.x = clamp(p.x + g2.dx*500*dt, sc.x0+10, sc.x1-10); p.y = clamp(p.y + g2.dy*500*dt, sc.y0+10, sc.y1-10);
      p.dir = g2.dx > 0 ? 1 : -1; p.moving = true; p.run = true; p.walk += dt*26;
      g2.trail -= dt; if(g2.trail <= 0){ g2.trail = .06; G.hazards.push({type:'fire', x:p.x, y:p.y, r:15, life:4, max:4}); }
      for(const o of G.mons){
        if(o.dying || g2.hit.has(o) || Math.hypot(o.x-p.x, o.y-p.y) > o.r+12) continue;
        g2.hit.add(o); petStrike(p, o, 1.3, {k:240});
      }
      if(g2.t <= 0){ p.gal = null; p.state = 'follow'; p.target = null; p.cd = 1; }
      return;
    }
    p.galT = (p.galT ?? 8) - dt;
    if(p.galT <= 0){
      const m = nearestMonster(p.x, p.y, 190);
      if(m){
        p.galT = 22; const dx = m.x-p.x, dy = m.y-p.y, d = Math.hypot(dx,dy) || 1;
        p.gal = {t:.65, dx:dx/d, dy:dy/d, hit:new Set(), trail:0}; P.gallopT = 6;
        addText(p.x, p.y-40, '¡Galope ardiente!', '#ffb040', 8); sfx('alba'); G.flash = {x:p.x, y:p.y-12, t:.3};
      }
    }
  }
  // Ceniza revela a los Sombríos cercanos
  if(p.def.reveal && canFight) for(const m of G.mons) if(Math.hypot(m.x-p.x, m.y-p.y) < 170) m.revealT = Math.max(m.revealT, .3);
  // Canela: ladrido que atrae a los enemigos
  if(p.def.beh==='taunt' && canFight){
    p.barkT -= dt;
    if(p.barkT <= 0 && nearestMonster(p.x, p.y, 110)){
      p.barkT = 8;
      for(const m of G.mons) if(!m.dying && Math.hypot(m.x-p.x, m.y-p.y) < 110){ m.tauntT = 3; m.tauntBy = p; }
      addText(p.x, p.y-26, '¡GUAU!', '#ffe0a0', 8); ring(p.x, p.y-8, 30, '#ffe0a0', .3); sfx('bark');
    }
  }
  // Roca atrae a los enemigos cercanos
  if(p.def.beh==='tank' && canFight) for(const m of G.mons) if(!m.dying && Math.hypot(m.x-p.x, m.y-p.y) < 70){ m.tauntT = .4; m.tauntBy = p; }

  // segundo mordisco pendiente (Humo)
  if(p.pending){ p.pending.t -= dt; if(p.pending.t <= 0){ if(validMon(p.pending.m) && Math.hypot(p.pending.m.x-p.x, p.pending.m.y-p.y) < p.pending.m.r+16) petStrike(p, p.pending.m, .8); p.pending = null; } }

  // buscar presa
  if(canFight && p.state==='follow' && p.cd <= 0){
    const flies = PET_ART[p.def.id].fly;
    const m = nearestMonster(P.x, P.y, p.def.beh==='tank' ? 140 : ENGAGE*(1 + (G.pt.aggro||0)/100), o => flies || los(G.sc, p.x, p.y-4, o.x, o.y-4));
    if(m){ p.state = 'engage'; p.target = m; p.phase = 'chase'; }
  }
  if(p.state==='engage' && (!validMon(p.target) || Math.hypot(p.target.x-P.x, p.target.y-P.y) > 300 || !canFight)){
    p.state = 'follow'; p.target = null; p.phase = null; p.cd = Math.max(p.cd, .6);
  }
  let tx, ty, maxSpd = 320, ignoreWalls = fly;
  // posición de seguimiento: detrás del héroe según la última dirección en la que caminó
  const side = P.dx >= 0 ? -1 : 1, off = FOLLOW_OFF[p.slot] || FOLLOW_OFF[0];
  tx = P.x + side*Math.abs(off[0]); ty = P.y + off[1];

  if(p.state==='engage'){
    const m = p.target, dx = m.x-p.x, dy = m.y-p.y, d = Math.hypot(dx,dy) || 1;
    switch(p.def.beh){
      case 'pounce': case 'taunt': {
        if(p.phase==='leap'){
          p.lt = Math.min(1, p.lt + dt/.28);
          p.x = lerp(p.jx0, p.jx1, p.lt); p.y = lerp(p.jy0, p.jy1, p.lt); p.z = Math.sin(p.lt*Math.PI)*14;
          p.moving = false; p.run = false;
          if(p.lt >= 1){
            p.z = 0;
            if(Math.hypot(m.x-p.x, m.y-p.y) < m.r+16){
              const ex = p.def.freeze ? {stun:1} : p.def.kick ? {stun:.5, k:420} : p.def.slowBite ? {slow:2.5} : {}; let mult = 1;
              if(p.def.crit3){ p.atkN = (p.atkN||0)+1; if(p.atkN % 3 === 0){ mult = 2; ex.bleed = 4; addText(m.x, m.y-m.r*2-14, '¡Crítico!', '#ffd166', 7); } }
              petStrike(p, m, mult, ex); if(p.def.bites>1) p.pending = {t:.18, m};
              if(p.def.freeze) burst(m.x, m.y-8, 12, ['#c8ecff','#ffffff','#7ad0ff'], [30,120], [.3,.6], 0);
            }
            p.state = 'follow'; p.target = null; p.cd = petCd(p);
          }
          return;
        }
        if(d < m.r+30){
          p.phase = 'leap'; p.lt = 0; p.jx0 = p.x; p.jy0 = p.y;
          p.jx1 = m.x - dx/d*(m.r+4); p.jy1 = m.y - dy/d*2; p.dir = dx > 0 ? 1 : -1;
          return;
        }
        tx = m.x; ty = m.y; maxSpd = 360; break;
      }
      case 'charge': {
        if(p.phase==='wind'){
          p.windT -= dt; p.dir = p.cdx > 0 ? 1 : -1; p.moving = false;
          if(Math.random() < dt*20) G.parts.push({x:p.x-p.dir*6, y:p.y, vx:-p.dir*40, vy:-10, life:.3, max:.3, size:2, col:'#4a4238'});
          if(p.windT <= 0){ p.phase = 'dash'; p.dashT = .45; p.hitSet = new Set(); }
          return;
        }
        if(p.phase==='dash'){
          p.dashT -= dt;
          moveCircle(sc, p, p.cdx*400*dt, p.cdy*400*dt);
          p.moving = true; p.run = true; p.walk += dt*24;
          for(const o of G.mons){
            if(o.dying || p.hitSet.has(o) || Math.hypot(o.x-p.x, o.y-p.y) > o.r+9) continue;
            p.hitSet.add(o);
            petStrike(p, o, 1, {k: p.def.knock ? 560 : p.def.pierce ? 260 : 440, stun: p.def.knock ? 1.2 : p.def.pierce ? 1 : p.def.miniStun ? .5 : .3});
            if(p.def.knock){ G.shake = Math.max(G.shake, 4); ring(o.x, o.y-6, 22, '#d8c0a0'); }
            if(p.def.shock){ ring(o.x, o.y-6, 44, '#ffe0a0', .3); for(const q of G.mons) if(q!==o && !q.dying && Math.hypot(q.x-o.x, q.y-o.y) < 46) hitMonster(q, petDamage(p)*.5, {src:'pet', pet:p, nx:(q.x-o.x)/46, ny:(q.y-o.y)/46, k:260, stun:.8}); }
            if(!p.def.pierce){ p.dashT = 0; break; }
          }
          if(p.dashT <= 0){ p.state = 'follow'; p.target = null; p.cd = petCd(p); }
          return;
        }
        if(d < 110){
          p.phase = 'wind'; p.windT = .35; p.cdx = dx/d; p.cdy = dy/d;
          addText(p.x, p.y-24, '!', '#ffffff', 9, -10);
          return;
        }
        tx = m.x; ty = m.y; maxSpd = 340; break;
      }
      case 'flyer': {
        tx = m.x; ty = m.y; maxSpd = 260; ignoreWalls = true;
        p.z = 16 + Math.sin(G.t*6)*2 - (p.peckAnim > 0 ? 9 : 0);
        p.peckAnim = (p.peckAnim||0) - dt;
        if(d < m.r+6 && p.cd <= 0){
          petStrike(p, m, 1, {k:60}); p.peckAnim = .15; p.cd = petCd(p); p.peckN = (p.peckN||0)+1;
          if(p.peckN >= 4){ p.peckN = 0; p.state = 'follow'; p.target = null; p.cd = 1.2; }
        }
        break;
      }
      case 'diver': {
        ignoreWalls = true;
        if(p.phase==='dive'){
          p.lt = Math.min(1, p.lt + dt/.22); p.z = lerp(18, 1, p.lt);
          const tx2 = p.def.pierceDive ? p.tgx : m.x, ty2 = p.def.pierceDive ? p.tgy : m.y;
          p.x = lerp(p.jx0, tx2, p.lt); p.y = lerp(p.jy0, ty2, p.lt);
          if(p.def.pierceDive) for(const o of G.mons){ if(o.dying || p.hitSet.has(o) || Math.hypot(o.x-p.x, o.y-p.y) > o.r+10) continue; p.hitSet.add(o); petStrike(p, o, 1, {k:120}); ring(o.x, o.y-6, 16, '#d8e8ff'); }
          if(p.lt >= 1){ if(!p.def.pierceDive){ petStrike(p, m, 1, {k:120, stun: p.def.diveStun ? 1 : 0}); ring(m.x, m.y-6, 16, '#d8e8ff'); } p.phase = 'rise'; p.lt = 0; }
          return;
        }
        if(p.phase==='rise'){ p.lt = Math.min(1, p.lt + dt/.3); p.z = lerp(1, 18, p.lt); if(p.lt >= 1){ p.state='follow'; p.target=null; p.cd=petCd(p); } return; }
        p.z = 18 + Math.sin(G.t*5)*2;
        if(d < 20){ p.phase = 'dive'; p.lt = 0; p.jx0 = p.x; p.jy0 = p.y; p.hitSet = new Set(); const dd = d || 1; p.tgx = m.x + (m.x-p.x)/dd*80; p.tgy = m.y + (m.y-p.y)/dd*80; return; }
        tx = m.x; ty = m.y; maxSpd = 280; break;
      }
      case 'ranged': {
        const want = d < 60 ? -1 : d > 120 ? 1 : 0;
        tx = p.x + dx/d*want*40; ty = p.y + dy/d*want*40; maxSpd = 220;
        p.dir = dx > 0 ? 1 : -1;
        if(p.cd <= 0 && d < 200){
          const lead = .15;
          const ax = m.x + m.vx*lead - p.x, ay = m.y - 6 + m.vy*lead - (p.y-8), al = Math.hypot(ax,ay) || 1;
          G.projs.push({x:p.x, y:p.y-8, vx:ax/al*300, vy:ay/al*300, life:.9, kind:p.def.proj || 'acorn', from:'pet', pet:p, r:3});
          p.cd = petCd(p); p.shots = (p.shots||0)+1;
          if(p.shots >= 4){ p.shots = 0; p.state = 'follow'; p.target = null; p.cd = 1.4; }
        }
        if(want===0){ tx = p.x; ty = p.y; }
        break;
      }
      case 'tongue': {
        // Verruga: lengüetazo a distancia que atrae al enemigo hacia él
        p.dir = dx > 0 ? 1 : -1;
        if(p.tongue){ p.tongue.t -= dt; p.tongue.x = m.x; p.tongue.y = m.y-6; if(p.tongue.t <= 0) p.tongue = null; tx = p.x; ty = p.y; break; }
        if(d < 105 && p.cd <= 0 && los(sc, p.x, p.y-4, m.x, m.y-4)){
          p.tongue = {t:.22, x:m.x, y:m.y-6};
          petStrike(p, m, 1, {k:0});
          if(!m.affixes.includes('pesado')){ m.vx += (p.x-m.x)/d*420; m.vy += (p.y-m.y)/d*420; }
          p.cd = petCd(p);
          p.shots = (p.shots||0)+1; if(p.shots >= 3){ p.shots = 0; p.state = 'follow'; p.target = null; }
          tx = p.x; ty = p.y; break;
        }
        const want = d > 90 ? 1 : d < 40 ? -1 : 0;
        tx = p.x + dx/d*want*40; ty = p.y + dy/d*want*40; maxSpd = 200;
        if(!want){ tx = p.x; ty = p.y; }
        break;
      }
      case 'duster': {
        // Lumbre: vuela sobre el enemigo y suelta polvo brillante que ralentiza en área
        tx = m.x; ty = m.y; maxSpd = 240; ignoreWalls = true;
        p.z = 18 + Math.sin(G.t*6)*2;
        if(d < m.r+10 && p.cd <= 0){
          for(const o of G.mons) if(!o.dying && Math.hypot(o.x-m.x, o.y-m.y) < 44) hitMonster(o, petDamage(p)*.7, {src:'pet', pet:p, nx:0, ny:0, k:0, slow:2.5});
          burst(m.x, m.y-14, 22, ['#fff0a0','#ffe070','#fff8d8'], [20,90], [.5,1], 60, [1,2]);
          ring(m.x, m.y-4, 40, '#fff0a0', .35);
          p.cd = petCd(p); p.peckN = (p.peckN||0)+1;
          if(p.peckN >= 3){ p.peckN = 0; p.state = 'follow'; p.target = null; p.cd = 1.4; }
        }
        break;
      }
      case 'cone': {
        // aliento en cono (Ámbar: fuego · Nocturna: fuego espectral)
        const flying = PET_ART[p.def.id].fly; if(flying){ p.z = 14 + Math.sin(G.t*5)*2; ignoreWalls = true; }
        const fc = (typeof FIRE_PAL !== 'undefined' && FIRE_PAL[p.def.fire]) || (p.def.fire === '#fff0a0' ? ['#fff0a0','#ffffff','#ffd070'] : p.def.fire === '#ff5a1a' ? ['#ff5a1a','#ffc04a','#a01808'] : p.def.fire === '#b070ff' ? ['#b070ff','#e0c0ff','#7a3aff'] : p.def.fire === '#5ac8ff' ? ['#5ac8ff','#e8faff','#2a8ab8'] : ['#ff8a2a','#ffd040','#ff5a1a']);
        if(p.phase==='breath'){
          p.breathT -= dt; p.moving = false; p.dir = p.bdx > 0 ? 1 : -1; p.tickT -= dt;
          for(let i=0;i<4;i++){ const sp = rand(-.35,.35), a = Math.atan2(p.bdy, p.bdx) + sp, v = rand(110,190);
            G.parts.push({x:p.x + p.bdx*10, y:p.y - (p.z||0) - 8, vx:Math.cos(a)*v, vy:Math.sin(a)*v*.8, life:rand(.25,.45), max:.45, size:rand(2,4), col:pick(fc)}); }
          if(p.tickT <= 0){
            p.tickT = .2; const base = Math.atan2(p.bdy, p.bdx);
            for(const o of G.mons){ if(o.dying) continue; const ox = o.x-p.x, oy = o.y-p.y, od = Math.hypot(ox,oy);
              if(od < 82 + o.r && Math.abs(angDiff(Math.atan2(oy,ox), base)) < .55) petStrike(p, o, .5, {k:p.def.gust ? 240 : 50}); }
          }
          if(p.breathT <= 0){ p.phase = null; p.state = 'follow'; p.target = null; p.cd = petCd(p); }
          return;
        }
        if(d < 74 && p.cd <= 0 && (flying || los(sc, p.x, p.y-4, m.x, m.y-4))){ p.phase = 'breath'; p.breathT = .8; p.tickT = 0; p.bdx = dx/d; p.bdy = dy/d; sfx('boom'); return; }
        tx = m.x - dx/d*58; ty = m.y - dy/d*58; maxSpd = 230; break;
      }
      case 'whirl': {
        // Corriente: remolino de agua que arrastra a los enemigos hacia el centro
        if(d < 90 && p.cd <= 0 && los(sc, p.x, p.y-4, m.x, m.y-4)){
          G.hazards.push({type:'whirl', x:m.x, y:m.y, r:70, life:2.2, max:2.2, pet:p, tick:0});
          addText(p.x, p.y-30, '¡Remolino!', '#aee8ff', 7); sfx('howl'); p.cd = petCd(p); p.state = 'follow'; p.target = null; return;
        }
        tx = m.x - dx/d*52; ty = m.y - dy/d*52; maxSpd = 240; break;
      }
      case 'flock': {
        // Lúgubre: suelta una bandada de cuervos que picotea en área
        p.z = 16 + Math.sin(G.t*5)*2; ignoreWalls = true;
        if(d < 90 && p.cd <= 0){
          G.hazards.push({type:'flock', x:m.x, y:m.y, r:44, life:1.3, max:1.3, pet:p, tick:0});
          addText(p.x, p.y-30, '¡Bandada!', '#c8c8e8', 7); sfx('bark'); p.cd = petCd(p); p.state = 'follow'; p.target = null; return;
        }
        tx = m.x - dx/d*55; ty = m.y - dy/d*55; maxSpd = 250; break;
      }
      case 'tank': {
        const hx = m.x-P.x, hy = m.y-P.y, hd = Math.hypot(hx,hy) || 1;
        // protege al héroe: si el enemigo se acerca a menos de 110, sale a su encuentro
        if(hd < 110){ tx = m.x - dx/d*(m.r+8); ty = m.y - dy/d*(m.r+8); }
        else { tx = P.x + hx/hd*24; ty = P.y + hy/hd*24; }
        maxSpd = 130;
        if(d < m.r+14 && p.cd <= 0){
          petStrike(p, m, 1, {stun:.8, k:160}); p.cd = petCd(p);
          ring(m.x, m.y-6, 18, '#c8d8a0'); G.shake = Math.max(G.shake, 2);
        }
        if(Math.hypot(m.x-P.x, m.y-P.y) > 150){ p.state = 'follow'; p.target = null; }
        break;
      }
    }
  }
  if(fly){
    if(p.state==='follow') p.z = lerp(p.z, p.exhaustedT>0 ? 0 : 16 + Math.sin(G.t*4)*2, .1);
    if(p.state==='follow' && p.exhaustedT<=0){ tx = P.x - side*-10; ty = P.y - 6; }
  }
  const dx = tx-p.x, dy = ty-p.y, d = Math.hypot(dx,dy);
  { const offScr = Math.abs(p.x-P.x)*PX > W/2 + 30 || Math.abs(p.y-P.y)*PX > H/2 + 30;   // si se separa tanto que sale de la pantalla, se teletransporta junto al héroe
    if(d > 420 || (offScr && !p.stamp)){ const sp = freeSpotNear(P.x + side*Math.abs(off[0]), P.y + off[1], 8); p.x = sp.x; p.y = sp.y; p.state = 'follow'; p.target = null; p.phase = null; burst(p.x, p.y-8, 8, ['#ffffff','#c8d0e0'], [20,70], [.2,.4], 0); return; } }
  const spd = d < 4 ? 0 : Math.min(maxSpd, d*(p.state==='engage'?8:5)) * (p.exhaustedT>0 ? .6 : 1);
  const vx = d ? dx/d*spd : 0, vy = d ? dy/d*spd : 0;
  if(ignoreWalls){   // las voladoras sobrevuelan el decorado pero no atraviesan las paredes de las mazmorras
    const nx = p.x + vx*dt, ny = p.y + vy*dt, inWall = wallAt(sc, p.x, p.y);
    if(inWall || !wallAt(sc, nx, p.y)) p.x = nx;
    if(inWall || !wallAt(sc, p.x, ny)) p.y = ny;
  } else moveCircle(sc, p, vx*dt, vy*dt);
  p.moving = spd > 20; p.run = spd > 170;
  if(Math.abs(vx) > 15) p.dir = vx > 0 ? 1 : -1;
  else if(!p.moving && p.state==='follow') p.dir = Math.cos(P.face) >= 0 ? 1 : -1;
  if(p.moving || fly) p.walk += dt*(fly ? 18 : p.run ? 22 : 15);
}

// =====================================================================
//  Proyectiles, peligros y botín
// =====================================================================
function updateProjs(dt){
  for(const pr of G.projs){
    if(pr.homing && pr.life > 0) legendHome(pr, dt);
    pr.life -= dt; pr.x += pr.vx*dt; pr.y += pr.vy*dt;
    if(pr.home && !P.dead){ const a = Math.atan2(P.y-14-pr.y, P.x-pr.x), cur = Math.atan2(pr.vy, pr.vx), sp = Math.hypot(pr.vx, pr.vy); const na = cur + clamp(angDiff(a, cur), -pr.home*dt, pr.home*dt); pr.vx = Math.cos(na)*sp; pr.vy = Math.sin(na)*sp; }
    if(!pr.ghost && blocked(G.sc, pr.x, pr.y+10, 1)){ pr.life = 0; if(pr.explode) explodeAt(pr.x - pr.vx*dt, pr.y - pr.vy*dt, pr.dmg); else { sfx('stoneHit'); burst(pr.x, pr.y, 4, ['#7e7a72','#57534d'], [30,80], [.15,.3]); } continue; }
    // flechas de los monstruos: dañan al héroe y a las mascotas de tierra
    if(pr.from==='mon'){
      if(!P.dead && Math.hypot(P.x-pr.x, P.y-14-pr.y) < P.r+5){ if(damagePlayer(pr.dmg, pr.mon, (pr.burn || pr.fire) ? 'fire' : (pr.weak || pr.kind==='zap') ? 'light' : pr.elem)){ if(pr.slow) P.slowT = pr.slow; if(pr.kind === 'snowball' && Math.random() < .35) freezeHero(1.1); if(pr.weak) P.weakT = Math.max(P.weakT || 0, pr.weak); if(pr.poison) P.poisonT = Math.max(P.poisonT, 7);
        if(pr.burn) P.burnT = Math.max(P.burnT||0, 3);
        if(pr.bleed) P.bleedT = Math.max(P.bleedT||0, 7);
        if(pr.root){ P.rootT = Math.max(P.rootT||0, pr.root); addText(P.x, P.y-56, '¡Inmovilizado!', '#c8a0ff', 7); ring(P.x, P.y-4, 18, '#8a60d0', .35); }
        if(pr.freeze && !legendOn('yetiheart')){ P.rootT = Math.max(P.rootT||0, pr.freeze); P.frozenT = Math.max(P.frozenT||0, pr.freeze); addText(P.x, P.y-56, '¡Congelado!', '#c8f0ff', 7); ring(P.x, P.y-4, 20, '#c8f0ff', .4); burst(P.x, P.y-16, 12, ['#c8f0ff','#7ac8f0','#ffffff'], [30,100], [.3,.6], 0); }
        if(pr.steal && G.raidGold > 0){ const n = Math.min(G.raidGold, randi(4,12) + (G.sc.lvl||1)); G.raidGold -= n; if(pr.mon) pr.mon.stolen = (pr.mon.stolen||0) + n; addText(P.x, P.y-68, '-' + n + ' oro', '#ffd166', 7); }
        if(pr.kind==='harpoon'){ const l3 = Math.hypot(pr.vx, pr.vy) || 1; P.vx -= pr.vx/l3*340; P.vy -= pr.vy/l3*340; }   // el arpón te arrastra hacia el pescador
        if(pr.kind==='rock' || pr.kind==='snowball'){ const l2 = Math.hypot(pr.vx, pr.vy) || 1; P.vx += pr.vx/l2*160; P.vy += pr.vy/l2*160; } } pr.life = 0; continue; }
      for(const p of G.pets) if((p.z < 6 || PET_ART[p.def.id].fly) && Math.hypot(p.x-pr.x, p.y-8-(PET_ART[p.def.id].fly ? p.z : 0)-pr.y) < 8){ damagePet(p, pr.dmg, pr.mon, false, true); pr.life = 0; break; }
      continue;
    }
    pr.hit ??= new Set();
    for(const m of G.mons){
      if(m.dying || pr.hit.has(m) || Math.hypot(m.x-pr.x, m.y-8-pr.y) > m.r+pr.r+2) continue;
      const l = Math.hypot(pr.vx,pr.vy) || 1;
      if(pr.from==='player' && pr.kind==='arrow' && typeof voltusChain === 'function' && curWeapon() && curWeapon().id === 'voltusbow') voltusChain(pr, m, pr.dmg);
      if(pr.from==='player') hitMonster(m, pr.dmg, {src:'player', nx:pr.vx/l, ny:pr.vy/l, k: pr.kind==='arrow' ? 140 : 180, crit:pr.crit, ...projFx(pr), mark: pr.markHit ? 1 : 0, markT: 5});
      else petStrike(pr.pet, m, 1, {k:90, slow: (pr.kind==='web' || pr.kind==='splash') ? 2.5 : 0, poison: pr.kind==='acid'});
      pr.hit.add(m);
      if(pr.explode){ explodeAt(pr.x, pr.y, pr.dmg, m); pr.life = 0; break; }
      if(pr.pierce > 0){ pr.pierce--; continue; }     // Agilidad 20: atraviesa a un enemigo más
      if(pr.bounce > 0){   // afijo de rebote: sigue hacia otro enemigo cercano
        let tg = null, bd = 240;
        for(const o of G.mons){ if(o.dying || pr.hit.has(o)) continue; const dd = Math.hypot(o.x-pr.x, o.y-8-pr.y); if(dd < bd && los(G.sc, pr.x, pr.y, o.x, o.y-4)){ bd = dd; tg = o; } }
        if(tg){ pr.bounce--; const sp = Math.hypot(pr.vx, pr.vy) || 560, an = Math.atan2(tg.y-8-pr.y, tg.x-pr.x); pr.vx = Math.cos(an)*sp; pr.vy = Math.sin(an)*sp; pr.ang = an; pr.life = .6; pr.dmg *= .8; ring(pr.x, pr.y, 10, '#ffe08a', .2); break; }
      }
      pr.life = 0; break;
    }
  }
  G.projs = G.projs.filter(p => p.life > 0);
}
// explosión en área de la flecha explosiva (los muros bloquean la onda)
function explodeAt(x, y, dmg, skip){
  G.shake = Math.max(G.shake, 5); sfx('boom');
  burst(x, y-4, 28, ['#ff5a1a','#ffb347','#fff1b8','#3a2a1a'], [80,240], [.25,.6]); ring(x, y-4, 54, '#ffb347', .3); ring(x, y-4, 30, '#fff1b8', .2);
  for(const o of G.mons){
    if(o.dying || o===skip || Math.hypot(o.x-x, o.y-4-y) > 56 + o.r || !los(G.sc, x, y, o.x, o.y-4)) continue;
    const d = Math.hypot(o.x-x, o.y-y) || 1;
    hitMonster(o, dmg*.75, {src:'player', nx:(o.x-x)/d, ny:(o.y-y)/d, k:320, burn:2, stun:.4});
  }
}
function inside(t, h){ return Math.hypot(t.x-h.x, (t.y-h.y)*1.3) < h.r + (t.r||6)*.5; }
function updateHazards(dt){
  for(const h of G.hazards){
    h.life -= dt;
    if(h.type==='flock'){
      h.tick -= dt;
      if(h.tick <= 0){ h.tick = .3; for(const m of G.mons) if(!m.dying && Math.hypot(m.x-h.x, m.y-h.y) < h.r + m.r) hitMonster(m, petDamage(h.pet)*.26, {src:'pet', pet:h.pet, nx:0, ny:0, k:30, slow: petHas(h.pet,'helada') ? 2 : (h.pet.def.dust ? 2 : 0), mark: h.pet.def.mark}); }
    }
    if(h.type==='whirl'){
      h.tick -= dt;
      for(const m of G.mons){
        if(m.dying || Math.hypot(m.x-h.x, m.y-h.y) > h.r*1.7 || MONSTERS[m.type].boss) continue;
        const dd = Math.hypot(h.x-m.x, h.y-m.y) || 1; moveCircle(G.sc, m, (h.x-m.x)/dd*95*dt, (h.y-m.y)/dd*95*dt);
      }
      if(h.tick <= 0){ h.tick = .35; for(const m of G.mons) if(!m.dying && Math.hypot(m.x-h.x, m.y-h.y) < h.r + m.r) hitMonster(m, h.pet ? petDamage(h.pet)*.3 : h.dmg, h.pet ? {src:'pet', pet:h.pet, nx:0, ny:0, k:0, slow: 1.5} : {src:'player', nx:0, ny:0, k:0, slow: 1.5}); }
    }
    if(h.type==='fire'){ for(const m of G.mons) if(!m.dying && Math.hypot(m.x-h.x, m.y-h.y) < h.r + m.r) m.burnT = Math.max(m.burnT, 1.5); }
    if(h.type==='poison'){
      if(!P.dead && inside(P, h)) P.poisonT = Math.max(P.poisonT, 2.5);
      for(const p of G.pets) if(p.z < 6 && inside(p, h)){ p.poisonAcc = (p.poisonAcc||0) + 3*dt; if(p.poisonAcc >= 1){ p.poisonAcc -= 1; damagePet(p, 1, null, true); } }
    }
    if(h.type==='zap'){ if(h.delay > 0){ h.delay -= dt; h.life = h.max; } else if(h.life <= 0) zapStrike(h); }
    if(h.type==='quake' && h.life <= 0){   // temblor de Urr: daña en el punto marcado
      G.shake = Math.max(G.shake, 6); sfx('boom'); burst(h.x, h.y-6, 22, ['#8a7a68','#5a4a3a','#c8b898'], [60,200], [.3,.7], 200); ring(h.x, h.y-4, h.r, '#c8b898', .3);
      if(!P.dead && Math.hypot(P.x-h.x, (P.y-h.y)*1.3) < h.r) damagePlayer(h.dmg, h.mon);
      for(const p of G.pets) if(Math.hypot(p.x-h.x, p.y-h.y) < h.r) damagePet(p, h.dmg*.6, null);
    }
    if(h.type==='shock'){   // onda de choque de Urr
      if(h.delay > 0){ h.delay -= dt; continue; }
      if(!h.started){ h.started = true; ring(h.x, h.y-6, 60, '#ff8a3a', .35); sfx('stoneHit'); }
      h.rad += h.spd*dt;
      const rd = (t) => Math.hypot(t.x-h.x, (t.y-h.y)/.45);
      if(!P.dead && !h.hitP && Math.abs(rd(P) - h.rad) < 15 && !(P.jump || (P.jumpZ||0) > 6)){ h.hitP = true; damagePlayer(h.dmg, h.mon); P.vx += (P.x-h.x)/(rd(P)||1)*260; }
      for(const p of G.pets) if(!h.hitPets.has(p) && p.z < 8 && Math.abs(rd(p) - h.rad) < 15){ h.hitPets.add(p); damagePet(p, h.dmg*.7, null); }
      if(Math.random() < .5){ const an = Math.random()*Math.PI*2; G.parts.push({x:h.x + Math.cos(an)*h.rad, y:h.y + Math.sin(an)*h.rad*.45, vx:0, vy:-26, life:.35, max:.35, size:2, col:pick(['#c8b898','#ff9a4a','#8a7a68'])}); }
      if(h.rad > 400) h.life = 0;
    }
    if(h.type==='beam'){   // rayo en línea con aviso previo
      if(h.delay > 0){ h.delay -= dt; h.life = h.max; if(h.delay <= 0){ h.fired = true; G.shake = Math.max(G.shake, 6); sfx('boom'); G.flash = {x:h.x + Math.cos(h.ang)*60, y:h.y + Math.sin(h.ang)*60, t:.2};
        const hitSeg = t => { const rx = t.x - h.x, ry = (t.y - 14) - h.y, along = rx*Math.cos(h.ang) + ry*Math.sin(h.ang), perp = Math.abs(-rx*Math.sin(h.ang) + ry*Math.cos(h.ang)); return along > 0 && along < h.len && perp < h.w/2 + (t.r || 6); };
        if(!P.dead && hitSeg(P) && !(P.jump || (P.jumpZ||0) > 6) && damagePlayer(h.dmg, h.mon, h.elem)){ if(h.fx === 'burn') P.burnT = Math.max(P.burnT||0, 3); else if(h.fx === 'freeze') freezeHero(1.2); else if(h.fx === 'weak') P.weakT = Math.max(P.weakT||0, 5); else if(h.fx === 'stun') P.stunT = Math.max(P.stunT||0, .9); else if(h.fx === 'slow') P.slowT = Math.max(P.slowT||0, 3); }
        for(const p of G.pets) if(p.z < 8 && hitSeg(p)) damagePet(p, h.dmg*.7, null, false, true); } }
    }
    if(h.type==='pull'){   // succión: arrastra al héroe y a las mascotas hacia el centro
      const pl = (t, k) => { const dx = h.x - t.x, dy = h.y - t.y, d = Math.hypot(dx, dy) || 1; if(d < h.r*1.6 && d > 14) moveCircle(G.sc, t, dx/d*h.str*k*dt, dy/d*h.str*k*dt); return d; };
      if(!P.dead && !(P.jump || (P.jumpZ||0) > 6)){ const d = pl(P, 1); h.tick -= dt; if(h.tick <= 0 && d < h.r*.4){ h.tick = .5; damagePlayer(h.dmg*.35, h.mon); } }
      for(const p of G.pets) if(p.z < 8) pl(p, .8);
      if(Math.random() < .8){ const an = Math.random()*Math.PI*2, rr2 = h.r*(.7 + Math.random()*.6); G.parts.push({x:h.x + Math.cos(an)*rr2, y:h.y + Math.sin(an)*rr2*.6, vx:-Math.cos(an)*h.str*.8, vy:-Math.sin(an)*h.str*.5, life:.5, max:.5, size:2, col:pick(['#c8b8ff', '#ffffff', '#8a7aff'])}); }
    }
    if(h.type==='boom' && h.life > 0 && Math.floor(h.life*8) !== Math.floor((h.life+dt)*8)) sfx('fuse');
    if(h.type==='charm' && h.life <= 0){   // canto de sirena: si te pilla, caminas hacia ella 2 s
      ring(h.x, h.y-4, h.r, '#ff9ae0', .4); burst(h.x, h.y-8, 18, ['#ff9ae0', '#ffffff', '#c8a0ff'], [30, 110], [.4, .8], -30); sfx('alba');
      if(!P.dead && Math.hypot(P.x-h.x, (P.y-h.y)*1.2) < h.r && !(P.jump || (P.jumpZ||0) > 6) && h.mon && !h.mon.dying && damagePlayer(h.dmg, h.mon)){ P.charmT = 2; P.charmSrc = h.mon; addText(P.x, P.y-62, '¡Hechizado!', '#ff9ae0', 8); }
      for(const p of G.pets) if(p.z < 8 && Math.hypot(p.x-h.x, p.y-h.y) < h.r) damagePet(p, h.dmg*.5, null, false, true);
    }
    if(h.type==='rockfall' && h.life <= 0){
      G.shake = Math.max(G.shake, 4); sfx('stoneHit');
      burst(h.x, h.y-4, 18, ['#8a8e98','#c8ccd4','#5a5e66','#ffffff'], [50,170], [.3,.7], 160); ring(h.x, h.y-4, h.r, '#c8ccd4', .3);
      ROCK_SRC.x = h.x; ROCK_SRC.y = h.y - 30;
      if(!P.dead && Math.hypot(P.x-h.x, (P.y-h.y)*1.2) < h.r && !(P.jump || (P.jumpZ||0) > 6)) damagePlayer(h.dmg, ROCK_SRC);
      for(const p of G.pets) if(p.z < 8 && Math.hypot(p.x-h.x, (p.y-h.y)*1.2) < h.r) damagePet(p, h.dmg*.7, null);
    }
    if(h.type==='frost' && h.life <= 0){
      burst(h.x, h.y-6, 26, ['#a0d8ff','#e8f4ff','#ffffff'], [60,200], [.3,.7], 0); ring(h.x, h.y-4, h.r, '#c8ecff', .3);
      if(!P.dead && Math.hypot(P.x-h.x, P.y-h.y) < h.r){ damagePlayer(h.dmg, h.mon, 'frost'); P.slowT = 2.5; if(Math.random() < .5) freezeHero(1.3); }
      for(const p of G.pets) if(Math.hypot(p.x-h.x, p.y-h.y) < h.r) damagePet(p, h.dmg*.6, null);
    }
    if(h.type==='boom' && h.life <= 0){
      G.shake = Math.max(G.shake, 8); sfx('boom');
      burst(h.x, h.y-6, 30, ['#ff5a1a','#ffb347','#fff1b8','#3a2a1a'], [80,260], [.3,.7]);
      ring(h.x, h.y-4, h.r, '#ffb347', .3);
      G.flash = {x:h.x, y:h.y, t:.3};
      if(!P.dead && Math.hypot(P.x-h.x, P.y-h.y) < h.r){ hurtPlayer(h.dmg, '#ff9a3c'); const d = Math.hypot(P.x-h.x, P.y-h.y)||1; P.vx += (P.x-h.x)/d*300; P.vy += (P.y-h.y)/d*300; }
      for(const p of G.pets) if(Math.hypot(p.x-h.x, p.y-h.y) < h.r) damagePet(p, h.dmg, null);
    }
  }
  G.hazards = G.hazards.filter(h => h.life > 0);
}
const GOLD_RATE = .6;   // el oro sobraba: cae un 40 % menos
function dropGold(x, y, n){
  n = Math.round(n*GOLD_RATE*(1 + .3*Math.max(0, ((G.sc && G.sc.lvl) || 1) - 1)));   // más oro cuanto mayor es la incursión (+30 % por nivel)
  if(n <= 0) return;
  const k = Math.min(5, Math.ceil(n/5));
  for(let i=0;i<k;i++) G.loot.push({x, y, z:4, vx:rand(-70,70), vy:rand(-50,50), vz:rand(60,110), gold: i===k-1 ? n - Math.floor(n/k)*(k-1) : Math.floor(n/k), t:0});
}
function dropItem(x, y, item){ G.loot.push({x, y, z:4, vx:rand(-60,60), vy:rand(-40,40), vz:rand(70,120), item, t:0}); }
function updateLoot(dt){
  const magnet = hasPetAffix('avariciosa') ? 120 : 22;
  const AMMO_IDS = ['stone','arrows','firearrows','explosivearrows','spear'];
  for(const l of G.loot){
    l.t += dt;
    if(l.item && l.z === 0 && !P.dead && hasPetAffix('recolectora') && AMMO_IDS.includes(l.item.id) && Math.hypot(P.x-l.x, P.y-l.y) < 56 && !l.taken) pickLoot(l);
    if(l.vz !== 0 || l.z > 0){
      l.z += l.vz*dt; l.vz -= 400*dt;
      if(l.z <= 0){ l.z = 0; l.vz = Math.abs(l.vz) > 40 ? -l.vz*.35 : 0; l.vx *= .5; l.vy *= .5; }
      const nx = l.x + l.vx*dt, ny = l.y + l.vy*dt;
      if(!blocked(G.sc, nx, ny, 2)){ l.x = nx; l.y = ny; } else { l.vx = l.vy = 0; }
    }
    if(l.gold && !P.dead && l.t > .4){
      const d = Math.hypot(P.x-l.x, P.y-l.y);
      if(d < magnet){ l.x += (P.x-l.x)*Math.min(1, dt*8); l.y += (P.y-l.y)*Math.min(1, dt*8); }
      if(d < 10){ G.raidGold += l.gold; addText(P.x, P.y-46, '+'+l.gold+' oro', '#ffe08a', 7); l.taken = true; sfx('coin'); }
    }
  }
  G.loot = G.loot.filter(l => !l.taken);
}

// =====================================================================
//  Dibujo de actores
// =====================================================================
function drawArm(a){
  pixLine(a.sx, a.sy, a.x, a.y, 5, OUT);
  pixLine(a.sx, a.sy, a.x, a.y, 3, a.sd<0 ? PAL.u : PAL.t);
  const gl = G.inv.equip.hands;
  if(a.shield){ const sid = G.inv.equip.shield && G.inv.equip.shield.id; drawSP(sid && ITEMS[sid] && ITEMS[sid].shieldArt ? ART[ITEMS[sid].shieldArt] : sid==='ironshield' ? ART.ironshield : sid==='nightaegis' ? ART.nightaegis : sid==='urrwall' ? ART.urrwall : sid==='lastwall' ? ART.lastwall : sid==='elfshield' ? ART.elfshield : sid==='holyaegis' ? ART.holyaegis : ART.buckler, a.x, a.y); }
  else if(gl) armorOv(ITEMS[gl.id].ov ? (a.big ? ITEMS[gl.id].ov + 'Big' : ITEMS[gl.id].ov) : (a.big ? 'bigGlove' : 'glove'), gl.rarity, a.x, a.y);
  else spr(a.big ? 'bigGlove' : 'glove', a.x, a.y, a.active ? 'hit' : null);
  if(a.weapon==='stick'){
    const ex = a.x + Math.cos(a.ang)*17, ey = a.y + Math.sin(a.ang)*17;
    pixLine(a.x, a.y, ex, ey, 4, OUT); pixLine(a.x, a.y, ex, ey, 2, (a.wid==='stormstaff' || a.wid==='lightstaff') ? '#ffe84a' : '#7a5636');
    b.fillStyle = (a.wid==='stormstaff' || a.wid==='lightstaff') ? '#fffbd0' : '#96704a'; b.fillRect(Math.round(ex)-1, Math.round(ey)-1, 2, 2);
  }
  if(a.weapon==='mace' || a.weapon==='axe'){
    const c = Math.cos(a.ang), s2 = Math.sin(a.ang), ex = a.x + c*16, ey = a.y + s2*16;
    pixLine(a.x - c*2, a.y - s2*2, ex, ey, 4, OUT); pixLine(a.x - c*2, a.y - s2*2, ex, ey, 2, '#5a3d26');
    if(a.weapon==='mace'){ const mc = {slimemace:['#2a9a3a','#b8ffb8'], gravespade:['#5a4a30','#c8b894'], chiefhammer:['#7a1c1c','#ffd040']}[a.wid] || W12_TINT[a.wid] || ['#6c7079','#c8ccd4']; b.fillStyle = OUT; b.fillRect(Math.round(ex)-3, Math.round(ey)-3, 7, 7); b.fillStyle = mc[0]; b.fillRect(Math.round(ex)-2, Math.round(ey)-2, 5, 5); b.fillStyle = mc[1]; b.fillRect(Math.round(ex)-1, Math.round(ey)-2, 2, 2);
      for(const [px,py] of [[-3,0],[3,0],[0,-3],[0,3]]){ b.fillStyle = '#9aa0aa'; b.fillRect(Math.round(ex)+px, Math.round(ey)+py, 1, 1); } }
    else { const hx = ex - c*3, hy = ey - s2*3; pixLine(hx + s2*1, hy - c*1, hx - s2*6, hy + c*6, 4, OUT); pixLine(hx + s2*1, hy - c*1, hx - s2*5, hy + c*5, 2, (a.wid==='urraxe' || a.wid==='kingpick') ? '#c8962e' : ((W12_TINT[a.wid] || [])[0] || '#9aa0aa')); b.fillStyle = (a.wid==='urraxe' || a.wid==='kingpick') ? '#ffd040' : ((W12_TINT[a.wid] || [])[1] || '#d8dce4'); b.fillRect(Math.round(hx - s2*5), Math.round(hy + c*5), 1, 1); }
  }
  if(a.weapon==='dagger'){
    const c = Math.cos(a.ang), s2 = Math.sin(a.ang), ex = a.x + c*11, ey = a.y + s2*11, uq = G.inv.equip[curWeaponKey()] && ({countesslament:'#c8a0ff', moondagger:'#9ad8ff'})[G.inv.equip[curWeaponKey()].id] || (W12_TINT[G.inv.equip[curWeaponKey()].id] || [])[0];
    pixLine(a.x - c*2, a.y - s2*2, a.x + c*2, a.y + s2*2, 3, '#3a2618');
    pixLine(a.x + c*2, a.y + s2*2, ex, ey, 3, OUT); pixLine(a.x + c*2, a.y + s2*2, ex, ey, 1, uq || '#c8ccd4');
  }
  if(a.weapon==='flamethrower'){
    const c = Math.cos(P.face), s2 = Math.sin(P.face);
    pixLine(a.x - c*9, a.y - s2*9, a.x + c*11, a.y + s2*11, 4, OUT); pixLine(a.x - c*9, a.y - s2*9, a.x + c*11, a.y + s2*11, 2, '#6c7079');
    b.fillStyle = OUT; b.fillRect(Math.round(a.x - c*8 - 3), Math.round(a.y - s2*8 - 5), 7, 9); b.fillStyle = '#c8483a'; b.fillRect(Math.round(a.x - c*8 - 2), Math.round(a.y - s2*8 - 4), 5, 7);   // depósito de aceite
    b.fillStyle = P.punchT > 0 ? '#ffd040' : '#ff6a1a'; b.fillRect(Math.round(a.x + c*11), Math.round(a.y + s2*11), 2, 2);                                                                      // piloto
  }
  if(a.weapon==='greataxe'){
    const c = Math.cos(a.ang), s2 = Math.sin(a.ang), ex = a.x + c*22, ey = a.y + s2*22;
    pixLine(a.x - c*4, a.y - s2*4, ex, ey, 4, OUT); pixLine(a.x - c*4, a.y - s2*4, ex, ey, 2, '#5a3d26');
    for(const sd2 of [-1, 1]){
      const bx = ex - c*3 - s2*sd2*7, by = ey - s2*3 + c*sd2*7;
      pixLine(ex - c*3, ey - s2*3, bx, by, 5, OUT); pixLine(ex - c*3, ey - s2*3, bx, by, 3, (W12_TINT[a.wid] || [])[0] || '#9aa0aa');
      b.fillStyle = (W12_TINT[a.wid] || [])[1] || '#e8ecf2'; b.fillRect(Math.round(bx), Math.round(by), 1, 1);
    }
  }
  if(a.weapon==='sword'){
    const c = Math.cos(a.ang), s = Math.sin(a.ang);
    const hx = a.x - c*3, hy = a.y - s*3, gx = a.x + c*2, gy = a.y + s*2, ex = a.x + c*21, ey = a.y + s*21;
    pixLine(hx, hy, gx, gy, 3, '#3a2618');                                         // empuñadura
    const SW = {firesword:['#ff9a30','#ffe08a'], icesword:['#7ac8f0','#f0fcff'], lightningsword:['#e8c020','#fffbd0'], elfsword:['#8ad8b0','#f4fff8'], frostfang:['#7ac8f0','#ffb060'], currentsword:['#4aa8d8','#e8f8ff'], guardianice:['#7ac8f0','#f0fcff'], guardianfire:['#ff9a30','#ffe08a']}[a.wid] || W12_TINT[a.wid];
    pixLine(ex, ey, gx, gy, 4, OUT); pixLine(ex, ey, gx, gy, 2, SW ? SW[0] : '#a8acb4');        // hoja
    b.fillStyle = SW ? SW[1] : '#d8dce4'; b.fillRect(Math.round(lerp(gx,ex,.4)), Math.round(lerp(gy,ey,.4)), 1, 1);
    if(!SW){ b.fillStyle = '#8a5a3a'; b.fillRect(Math.round(lerp(gx,ex,.65)), Math.round(lerp(gy,ey,.65)), 1, 1); }   // óxido
    else if(Math.random() < .3) G.parts.push({x:lerp(gx,ex,Math.random()), y:lerp(gy,ey,Math.random()), vx:rand(-10,10), vy:a.wid==='firesword' ? -25 : rand(-10,10), life:.3, max:.3, size:1, col:SW[1]});
    b.fillStyle = '#8a6420'; pixLine(gx - s*3, gy + c*3, gx + s*3, gy - c*3, 2, '#8a6420');                // guarda
  }
  if(a.weapon==='trident'){
    const c = Math.cos(P.face), s2 = Math.sin(P.face), th = a.thr || 0, tx = a.x + c*(16 + th*30), ty = a.y + s2*(16 + th*30)*.9, col = a.wid==='deeptrident' ? ['#7ac8ff','#ffffff'] : ['#9af0ff','#e8ffff'];
    pixLine(a.x - c*10, a.y - s2*10, tx, ty, 3, OUT); pixLine(a.x - c*10, a.y - s2*10, tx, ty, 1, '#7a5636');
    for(const sd2 of [-1, 0, 1]){ const qx = -s2*sd2*3, qy = c*sd2*3; pixLine(tx + qx, ty + qy, tx + qx + c*7, ty + qy + s2*7, 2, OUT); pixLine(tx + qx, ty + qy, tx + qx + c*7, ty + qy + s2*7, 1, col[0]); }
    pixLine(tx - s2*3, ty + c*3, tx + s2*3, ty - c*3, 1, col[1]);
    if(th > .3 && Math.random() < .6) G.parts.push({x:tx + c*7, y:ty + s2*7, vx:rand(-30,30), vy:rand(-30,30), life:.2, max:.2, size:1.5, col:pick(['#9af0ff','#ffffff','#ffff90'])});
  }
  if(a.weapon==='bow'){
    // arco curvado perpendicular a la dirección de tiro; la cuerda se tensa al disparar
    const f = P.face, draw = a.draw || 0;
    const tips = [-1,1].map(sd => [a.x + Math.cos(f+sd*1.4)*9 + Math.cos(f)*2, a.y + Math.sin(f+sd*1.4)*9 + Math.sin(f)*2]);
    const n = 9;
    for(let i=0;i<=n;i++){
      const t = -1.25 + 2.5*i/n, px = a.x + Math.cos(f+t)*9 + Math.cos(f)*2, py = a.y + Math.sin(f+t)*9 + Math.sin(f)*2;
      b.fillStyle = OUT; b.fillRect(Math.round(px)-1, Math.round(py)-1, 3, 3);
    }
    for(let i=0;i<=n;i++){
      const t = -1.25 + 2.5*i/n, px = a.x + Math.cos(f+t)*9 + Math.cos(f)*2, py = a.y + Math.sin(f+t)*9 + Math.sin(f)*2;
      b.fillStyle = a.wid==='elfbow' ? (i%3 ? '#3a8a64' : '#7ad8a0') : W12_TINT[a.wid] ? W12_TINT[a.wid][i%3 ? 0 : 1] : (i%3 ? '#7a5636' : '#96704a'); b.fillRect(Math.round(px), Math.round(py), 1, 1);
    }
    const mx = a.x - Math.cos(f)*draw*6, my = a.y - Math.sin(f)*draw*6;
    pixLine(tips[0][0], tips[0][1], mx, my, 1, '#e8e0c8'); pixLine(tips[1][0], tips[1][1], mx, my, 1, '#e8e0c8');
    if(draw > .1){ const ax = mx + Math.cos(f)*16, ay = my + Math.sin(f)*16; pixLine(mx, my, ax, ay, 1, '#c8a878'); b.fillStyle = '#c8ccd4'; b.fillRect(Math.round(ax), Math.round(ay), 2, 2); }
  }
  if(a.stone){ drawSP(ART.stoneHand, a.x + Math.cos(P.face)*2, a.y - 1); }
  if(a.spearHeld){
    const c = Math.cos(P.face), s2 = Math.sin(P.face), tx = a.x + c*15, ty = a.y + s2*15;
    pixLine(a.x - c*7, a.y - s2*7, tx, ty, 3, OUT); pixLine(a.x - c*7, a.y - s2*7, tx, ty, 1, '#7a5636');
    pixLine(tx, ty, tx + c*4, ty + s2*4, 3, OUT); pixLine(tx, ty, tx + c*4, ty + s2*4, 1, '#d8dce4');
  }
  if(a.weapon==='crossbow'){
    const f = P.face, c = Math.cos(f), s2 = Math.sin(f), draw = a.draw || 0;
    const bx = a.x + c*5, by = a.y + s2*5;
    pixLine(a.x - c*6, a.y - s2*6, a.x + c*8, a.y + s2*8, 4, OUT); pixLine(a.x - c*6, a.y - s2*6, a.x + c*8, a.y + s2*8, 2, '#7a5636');
    const lx0 = bx - s2*8, ly0 = by + c*8, lx1 = bx + s2*8, ly1 = by - c*8, mx2 = a.x - c*(1+draw*4), my2 = a.y - s2*(1+draw*4);
    pixLine(lx0, ly0, lx1, ly1, 3, OUT); pixLine(lx0, ly0, lx1, ly1, 1, (W12_TINT[a.wid] || [])[0] || '#9aa0aa');
    pixLine(lx0, ly0, mx2, my2, 1, '#e8e0c8'); pixLine(lx1, ly1, mx2, my2, 1, '#e8e0c8');
    if(draw < .95){ const ax = a.x + c*10, ay = a.y + s2*10; pixLine(a.x, a.y, ax, ay, 1, '#c8a878'); b.fillStyle = '#d8dce4'; b.fillRect(Math.round(ax), Math.round(ay), 2, 2); }
  }
}
// chorro de la llamarada del lanzallamas: cono de fuego animado que sale de la boquilla (blanco → amarillo → naranja → rojo → humo)
function drawFlameJet(){
  const fa = clamp(P.flameT/.3, 0, 1); if(fa <= 0) return;
  const fx = Math.cos(P.face), fy = Math.sin(P.face), nx = -fy, ny = fx, ox = P.x + fx*14, oy = P.y - 15 + fy*7;
  const cols = ['#fffbd0','#ffe070','#ffb030','#ff7a1a','#e03a10','#7a2410','#3a2a28'];
  for(let k = 0; k < 90; k++){
    const t = (k*.0911 + G.t*3.3) % 1, dist = 6 + t*100, spread = (.04 + t*.5)*30*Math.sin(k*12.9 + G.t*10 + t*5);
    const x = ox + fx*dist + nx*spread, y = oy + fy*dist*.8 + ny*spread*.8 - t*9;
    const sz = Math.max(2, Math.round((3 + t*7)*(1 - Math.max(0, t - .72)*2.4)));
    const ci = Math.min(6, Math.floor(t*6.2 + (k%3)*.45));
    b.globalAlpha = fa*(t > .8 ? (1 - t)*5 : 1)*(ci >= 5 ? .55 : .95);
    b.fillStyle = cols[ci]; b.fillRect(Math.round(x - sz/2), Math.round(y - sz/2), sz, sz);
  }
  b.globalAlpha = fa; b.fillStyle = '#fffbd0'; b.fillRect(Math.round(ox) - 2, Math.round(oy) - 2, 5, 5); b.fillStyle = '#ffd060'; b.fillRect(Math.round(ox + fx*4) - 3, Math.round(oy + fy*3) - 3, 6, 6);
  b.globalAlpha = 1;
  if(Math.random() < .7) G.parts.push({x:ox + fx*rand(20,100), y:oy + fy*rand(10,60) - 2, vx:fx*30 + rand(-20,20), vy:rand(-40,-10), life:.5, max:.5, size:1.5, col:pick(['#ffc04a','#ff8a2a','#fff0a0'])});
}
function drawHero(){
  if(P.dead) return;
  b.imageSmoothingEnabled = false;
  const x=Math.round(P.x), y=Math.round(P.y), fx=Math.cos(P.face), fy=Math.sin(P.face), px=-fy, py=fx;
  const dir = fx<0 ? -1 : 1;
  const step = P.moving ? Math.sin(P.walk) : 0;
  const bob = P.moving ? -Math.round(Math.abs(Math.sin(P.walk))*1.5) : (Math.sin(G.t*2.5)>.6 ? -1 : 0);
  const alpha = ((P.inv>0 && !P.dashT && Math.floor(P.inv*20)%2) ? .45 : 1) * (P.invisT > 0 ? .35 : 1);
  b.globalAlpha = alpha;
  const jz = Math.round(P.jumpZ || 0);
  pshadow(x, y, 12 - (jz>>2), 4 - (jz>>4));
  b.save(); b.translate(0, -jz);
  const kind = P.atkKind;
  const prog = P.punchT>0 ? 1-P.punchT/P.punchDur : 0;
  const ext = P.punchT>0 ? (prog<.3 ? prog/.3 : 1-(prog-.3)/.7) : 0;
  const big = kind==='fist' && P.combo===3, reach = big ? 30 : 22;
  const bodyY = y-17+bob;
  const E = G.inv.equip, w = curWeapon(), wk = w ? ITEMS[w.id].kind : 'fist', sh = E.shield;
  // estela del golpe
  if(P.punchT>0 && prog>.2 && prog<.7 && (kind==='fist' || WEAPON[kind].trail)){
    const r0 = kind==='greataxe' ? 44 : kind==='sword' ? 34 : kind==='stick' ? 30 : big ? 32 : 24, sp = kind==='greataxe' ? 3.1 : kind==='sword' ? 1.35 : kind==='stick' ? 1.2 : big ? .9 : .6;
    b.beginPath(); b.arc(x,bodyY,r0+10,P.face-sp,P.face+sp); b.arc(x,bodyY,r0-3,P.face+sp,P.face-sp,true); b.closePath();
    b.fillStyle = kind!=='fist' ? WEAPON[kind].trail : big ? 'rgba(255,190,90,.45)' : 'rgba(230,220,200,.3)'; b.fill();
  }
  const arms = [-1,1].map(sd => {
    const punching = P.punchT>0 && kind==='fist' && ((P.combo===1&&sd===-1)||(P.combo>=2&&sd===1));
    const e = punching ? ext : 0;
    const guard = Math.sin(G.t*5+sd) > .5 ? 1 : 0;
    const a = {sd, active:punching, big:punching && big,
      sx: x + dir + px*sd*4, sy: y-22+bob + py*sd*1.5,
      x: x + px*sd*8*(1-e*.6) + fx*(5+e*reach), y: bodyY + py*sd*4*(1-e*.6) + fy*(5+e*reach)*.8 + guard};
    if(sd===1 && ['stick','sword','mace','axe','dagger','greataxe'].includes(wk)){
      const swinging = P.punchT>0 && kind===wk;
      const t = swinging ? 1-(1-prog)*(1-prog) : 0;
      a.weapon = wk; a.wid = w && w.id; a.ang = -Math.PI/2 + dir*.6;        // en reposo: apuntando hacia arriba y adelante
      if(swinging){ a.ang = P.face - 1.3 + 2.6*t; a.x = x + Math.cos(a.ang)*9; a.y = bodyY + Math.sin(a.ang)*7; }
      if(swinging && wk==='greataxe'){ a.ang = P.face + prog*Math.PI*2; a.x = x + Math.cos(a.ang)*11; a.y = bodyY + Math.sin(a.ang)*8; }   // giro completo
    }
    if(sd===1 && wk==='trident'){
      const th = P.punchT>0 && kind===wk ? Math.sin(Math.min(1, prog)*Math.PI) : 0;
      a.weapon = 'trident'; a.wid = w && w.id; a.thr = th; a.x = x + fx*(8 + th*10); a.y = bodyY + fy*(5 + th*6);
    }
    if(sd===1 && (isRanged(wk) || wk==='flamethrower')){
      a.weapon = wk; a.x = x + fx*9; a.y = bodyY + fy*6 - 1;
      a.draw = P.punchT>0 && kind===wk ? Math.min(1, prog/.7) : 0;
    }
    if(sd===-1 && wk==='bow' && P.punchT>0 && kind==='bow'){ const d2 = Math.min(1, prog/.7); a.x = x + fx*(9-d2*6); a.y = bodyY + fy*(6-d2*4) - 1; }
    if(sd===1 && (wk==='throw' || wk==='spear')){
      const thrown = P.punchT>0 && kind===wk && prog > .3;
      if(wk==='throw') a.stone = !thrown; else a.spearHeld = !thrown;
      if(P.punchT>0 && kind===wk){ const t = prog<.3 ? -prog/.3 : (prog-.3)/.7; a.x = x + fx*(4+t*16); a.y = bodyY - 4 + fy*(t*10); }
    }
    if(sd===-1 && sh){
      a.shield = true;
      if(P.blocking){ a.x = x + fx*10; a.y = bodyY + fy*6 - 1; }
    }
    return a;
  });
  const isFront = a => (a.shield && P.blocking) || a.weapon==='bow' || a.weapon==='crossbow' || a.weapon==='flamethrower' || a.y >= bodyY;
  for(const a of arms) if(!isFront(a)) drawArm(a);
  b.save(); b.translate(x, y); b.scale(dir,1);
  const sway = P.moving ? (Math.sin(P.walk*.5)>0 ? -1 : -2) : (Math.sin(G.t*1.7)>0 ? 0 : -1);
  spr('cloak', sway, bob); spr('pack', 0, bob);
  const la = Math.round(step*2.5);
  const legs = [[-6-la, Math.min(0,-Math.round(Math.max(0,-step)*2))], [-1+la, Math.min(0,-Math.round(Math.max(0,step)*2))]];
  for(const [lx, ly] of legs){ spr('leg', lx, ly); if(E.feet) armorOv(ovName(E.feet, E.feet.id==='urrboots' ? 'urrboot' : 'boot'), E.feet.rarity, lx, ly); }
  spr('torso', 0, bob); if(E.chest) armorOv(ovName(E.chest, E.chest.id==='elfmail' ? 'elfmail' : 'chest'), E.chest.rarity, 0, bob);
  spr('hood', 0, bob);  if(E.head) armorOv(ovName(E.head, E.head.id==='countessveil' ? 'veil' : E.head.id==='urrhelm' ? 'urrhelm' : 'helmet'), E.head.rarity, 0, bob);
  b.restore();
  // farol
  const LT = G.inv.equip.lantern, lit = !!LT && P.lantern && (P.oil > 0 || G.sc.kind!=='raid'), silver = LT && LT.id==='silverlantern', lv = !LT ? null : silver ? 'silver' : LT.id==='elflantern' ? 'elf' : LT.id==='atlantlantern' ? 'atl' : null, gm = lanternGem();
  const lsw = Math.round(Math.sin(G.t*3 + P.walk*.5)*1.2);
  P.lx = x + dir*7 + lsw; P.ly = y-10+bob;
  b.fillStyle = OUT; b.fillRect(Math.round(x+dir*6), y-16+bob, 1, 2);
  if(LT) spr('lantern', P.lx, P.ly, lv ? (lit ? lv : lv+'off') : (lit ? null : 'off'));
  if(lit){
    const glow = .8+Math.sin(G.t*13)*.1+Math.random()*.1;
    b.globalAlpha = alpha*.22; ell(P.lx,P.ly-1,8*glow,8*glow); b.fillStyle = gm.tint === 'rainbow' ? 'hsl(' + (Math.floor(G.t*70)%360) + ',95%,62%)' : (gm.col || '#ffc66b'); b.fill(); b.globalAlpha = alpha;
    if(Math.random()<.04) G.parts.push({x:P.lx+rand(-2,2), y:P.ly, vx:rand(-10,10), vy:rand(-30,-10), life:.6, max:.6, size:1.2, col:'#ffd28a'});
  }
  for(const a of arms) if(isFront(a)) drawArm(a);
  b.restore();
  b.globalAlpha = 1;
}
function drawGhost(g){
  b.globalAlpha = g.life/g.max*.35;
  ell(g.x, g.y-16, 9, 11); b.fillStyle = '#8a8fa8'; b.fill(); ell(g.x, g.y-31, 9, 8); b.fill();
  b.globalAlpha = 1;
}
const RAR_RING = {magic:'#5a8cff', rare:'#f2c14b'};
function monVisible(m){
  if(!m.affixes.includes('sombrio') || m.revealT > 0) return 1;
  if(G.inv.equip.head && ITEMS[G.inv.equip.head.id].reveal && Math.hypot(m.x-P.x, m.y-P.y) < 170) return 1;
  let v = 0;
  for(const L of G.frameLights){ if(L.ambient) continue; const d = Math.hypot(m.x-L.x, m.y-L.y); v = Math.max(v, clamp((L.r*.75 - d)/40, 0, 1)); }
  return v;
}
// no-muertos: sprites con andar, golpe preparado y (fantasmas) flotación translúcida
function drawUndead(m, vis){
  const dying = m.dying ? 1-m.dying/.25 : 1, k = m.spawnIn*dying;
  if(k <= 0) return;
  const A = MON_ART[m.art], MD = MONSTERS[m.type];
  const fi = m.prepT>0 ? 2 : (Math.sin(m.walk)>0 ? 0 : 1);
  const fr = (m.flash>0 ? A.flash : A.fr)[fi];
  const float = m.ai==='float' ? 6 + Math.sin(G.t*3 + m.home.x)*3 : m.ai==='boss' ? 10 + Math.sin(G.t*2)*4 : 0;
  const sc = k*m.scale, sw = (fr.c.width-2)*m.scale;
  const shade = m.affixes.includes('sombrio') && m.revealT<=0 ? .85 : 1;
  b.globalAlpha = vis*shade;
  pshadow(m.x, m.y, Math.max(4,Math.round(sw*.32)), 3, m.ai==='float' ? .16 : .3);
  if(RAR_RING[m.rarity] && !m.dying){ const pulse = (Math.sin(G.t*4)+1)/2; pixRing(m.x, m.y, sw*.45+pulse, sw*.16+pulse*.5, RAR_RING[m.rarity], 20); }
  b.globalAlpha = vis*shade*(MD.ghostly ? .72 : m.ai==='float' ? .78 : m.ai==='boss' ? .9*(m.fade ?? 1) : 1);
  const w = Math.round(fr.c.width*sc), h = Math.round(fr.c.height*sc), ax = Math.round(fr.ax*sc), ay = Math.round(fr.ay*sc);
  b.save(); b.translate(Math.round(m.x), Math.round(m.y - float)); if(m.face < 0) b.scale(-1,1);
  b.drawImage(fr.c, -ax, -ay, w, h); statusFx(m, fr.c, -ax, -ay, w, h, vis*shade); b.restore();
  b.globalAlpha = vis*shade;
  const y0 = Math.round(m.y - float - ay);
  if(m.ai==='boss' && Math.random() < .5) G.parts.push({x:m.x+rand(-14,14), y:m.y-float-rand(0,20), vx:rand(-10,10), vy:-14, life:.7, max:.7, size:rand(1.5,2.5), col:pick(['#bcb0dc','#ff9ad8','#eae4ff'])});
  if(m.ai==='float' && Math.random() < .2) G.parts.push({x:m.x+rand(-5,5), y:m.y-float-rand(2,10), vx:-m.face*10, vy:-6, life:.5, max:.5, size:1.5, col:'#bccae4'});
  if(MD.eye && !m.dying){ const ex = Math.round(m.x + m.face*MD.eye[0]*m.scale), ey = Math.round(m.y - float + MD.eye[1]*m.scale); b.globalAlpha = vis*.3; b.fillStyle = '#ff1a1a'; b.fillRect(ex-3, ey-3, 7, 6); b.globalAlpha = vis*shade; }
  if(m.prepT > 0 && Math.floor(G.t*16)%2){ b.fillStyle = '#ff5a3c'; b.fillRect(Math.round(m.x)-1, y0-6, 2, 4); }
  if(m.shield > 0) pixRing(m.x, y0 + h/2, w*.5, h*.5, '#a0c8ff', 22);
  if(m.stunT > 0) for(let i=0;i<3;i++){ const a = G.t*5 + i*2.1; b.fillStyle = '#ffe08a'; b.fillRect(Math.round(m.x+Math.cos(a)*7), Math.round(y0-4+Math.sin(a)*2), 2, 2); }
  if(m.freezeT > 0 && Math.random() < .2) G.parts.push({x:m.x+rand(-m.r,m.r), y:m.y-rand(2,m.r*3), vx:0, vy:-10, life:.5, max:.5, size:1.5, col:'#c8f0ff'});
  if(m.weakT > 0 && Math.random() < .12) G.parts.push({x:m.x+rand(-m.r,m.r), y:m.y-rand(2,m.r*3), vx:0, vy:12, life:.5, max:.5, size:1, col:'#ffe85a'});
  if(m.slowT > 0 && Math.random() < .1) G.parts.push({x:m.x+rand(-m.r,m.r), y:m.y-rand(2,m.r*3), vx:0, vy:-15, life:.4, max:.4, size:1, col:'#a0d8ff'});
  if(m.affixes.includes('venenoso') && Math.random() < .05) G.parts.push({x:m.x+rand(-m.r,m.r)*.6, y:m.y-2, vx:0, vy:10, life:.4, max:.4, size:1, col:'#8ad04a'});
  if(m.hp < m.maxHp && !m.dying && m.ai!=='boss' && m.ai!=='urr'){
    const w2 = Math.round(sw*.8)+2, x = Math.round(m.x-w2/2), y = y0-6;
    b.fillStyle = OUT; b.fillRect(x-1, y-1, w2+2, 4);
    b.fillStyle = '#4a1418'; b.fillRect(x, y, w2, 2);
    b.fillStyle = '#e63946';   // la barra de los enemigos es siempre roja, sea cual sea su rareza
    b.fillRect(x, y, Math.round(w2*Math.max(0, m.hp/m.maxHp)), 2);
  }
  m.labelY = y0 - 8;
  b.globalAlpha = 1;
}
// color plano de un sprite (para teñir al enemigo según su estado), con caché
const TINT_CACHE = new Map();
function tinted(src, col){
  let by = TINT_CACHE.get(src); if(!by){ by = {}; TINT_CACHE.set(src, by); }
  return by[col] ??= (() => { const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const g = c.getContext('2d'); g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height); return c; })();
}
// estados visibles: congelado (azulado y paralizado con cristales de hielo), quemado (naranja con llamas) y debilitado (parpadeo eléctrico amarillo)
function statusFx(m, src, x, y, w, h, vis){
  const t = G.t;
  if(m.freezeT > 0){
    b.globalAlpha = vis*.62; b.drawImage(tinted(src, '#58b0ff'), x, y, w, h);
    b.globalAlpha = vis*.35; b.drawImage(tinted(src, '#e8fbff'), x, y - 1, w, h);
    b.globalAlpha = vis; b.fillStyle = 'rgba(210,245,255,.9)';
    for(let i=0;i<6;i++){ const ang = i/6*Math.PI*2 + m.home.x, px = Math.round(x + w/2 + Math.cos(ang)*w*.5), py = Math.round(y + h*.55 + Math.sin(ang)*h*.45);
      b.fillRect(px, py-2, 1, 5); b.fillRect(px-2, py, 5, 1); }   // cristales
    b.fillStyle = '#ffffff'; b.fillRect(Math.round(x + w*.3), Math.round(y + h*.25), 2, Math.max(2, Math.round(h*.3)));   // brillo del hielo
  }
  if(m.burnT > 0){
    b.globalAlpha = vis*(.28 + .18*Math.sin(t*14)); b.drawImage(tinted(src, '#ff6a1a'), x, y, w, h);
    b.globalAlpha = vis; drawFlames(x + w/2, y + h*.8, Math.max(.4, w/36));
  }
  if(m.weakT > 0){
    if(Math.floor(t*14) % 2 === 0){ b.globalAlpha = vis*.7; b.drawImage(tinted(src, '#fff060'), x, y, w, h); b.globalAlpha = vis; }
    else { b.globalAlpha = vis*.25; b.drawImage(tinted(src, '#7a6a10'), x, y, w, h); b.globalAlpha = vis; }
    for(let k=0;k<7;k++){   // arcos eléctricos que recorren todo el cuerpo
      let px = x + Math.random()*w, py = y + Math.random()*h;
      for(let s2=0;s2<4;s2++){ const nx = px + (Math.random()-.5)*14, ny = py + (Math.random()-.5)*14; pixLine(px, py, nx, ny, 1, k%2 ? '#ffffff' : '#ffe040'); px = nx; py = ny; }
    }
    if(Math.random() < .5) G.parts.push({x:m.x+rand(-m.r,m.r), y:m.y-rand(2,m.r*3), vx:rand(-30,30), vy:rand(-40,-10), life:.25, max:.25, size:1.5, col:'#fff7a0'});
  }
  b.globalAlpha = vis;
}
function drawMonster(m){
  const vis = monVisible(m); m.vis = vis;
  if(vis <= .02) return;
  if(m.dummy) return drawDummy(m);
  if(m.ai !== 'hop') return drawUndead(m, vis);
  const dying = m.dying ? 1-m.dying/.25 : 1, k = m.spawnIn*dying;
  if(k <= 0) return;
  const s = Math.sin(m.hop), air = Math.round(Math.max(0,s)*(m.art==='big'?8:11)*(m.target||m.fleeT>0||m.wander?1:.3)) + Math.round(m.z||0);
  const fi = m.prepT>0 ? 0 : m.stunT>0 ? 2 : s<-.6?0 : s<-.2?1 : s<.3?2 : s<.7?3 : 4;
  const fr = slimeFrame(m.art, fi, m.flash>0);
  const sw = (fr.width-2)*m.scale;
  b.globalAlpha = vis * (m.affixes.includes('sombrio') && m.revealT<=0 ? .85 : 1);
  pshadow(m.x, m.y, Math.max(3,Math.round(sw*.45*(1-air/40))), Math.max(2,Math.round(sw*.13)));
  if(RAR_RING[m.rarity] && !m.dying){
    const pulse = (Math.sin(G.t*4)+1)/2;
    pixRing(m.x, m.y, sw*.55+pulse, sw*.2+pulse*.5, RAR_RING[m.rarity], 20);
  }
  const w = Math.max(2,Math.round(fr.width*k*m.scale)), h = Math.max(2,Math.round(fr.height*k*m.scale));
  const x0 = Math.round(m.x - w/2), y0 = Math.round(m.y - h - air + 1);
  b.drawImage(fr, x0, y0, w, h); statusFx(m, fr, x0, y0, w, h, vis);
  if(m.affixes.includes('explosivo') && m.hp < m.maxHp*.4 && Math.floor(G.t*8)%2){ b.globalAlpha = vis*.4; b.drawImage(slimeFrame(m.art, fi, true), x0, y0, w, h); b.globalAlpha = vis; }
  if(m.flash<=0 && k>.9){
    const t = m.target || P, dx=t.x-m.x, dy=t.y-m.y, d=Math.hypot(dx,dy)||1;
    const ox=Math.round(dx/d*1.5), oy=Math.round(dy/d), sep=Math.max(2,Math.round(sw*.2));
    const ey = y0 + Math.round(h*.42) + oy, eh = m.art==='big' ? 3 : 2;
    const eyeCol = m.rarity==='rare' ? '#ffd040' : m.rarity==='magic' ? '#7ab0ff' : '#ff5a3c';
    for(const sd of [-1,1]){
      const ex = Math.round(m.x) + sd*sep + ox - 1;
      b.fillStyle = eyeCol; b.fillRect(ex, ey, 2, eh);
      b.globalAlpha = vis*.35; b.fillRect(ex-1, ey-1, 4, eh+2); b.globalAlpha = vis;
    }
  }
  if(m.shield > 0) pixRing(m.x, y0 + h/2, w*.62, h*.62, '#a0c8ff', 22);
  if(m.stunT > 0) for(let i=0;i<3;i++){ const a = G.t*5 + i*2.1; b.fillStyle = '#ffe08a'; b.fillRect(Math.round(m.x+Math.cos(a)*7), Math.round(y0-4+Math.sin(a)*2), 2, 2); }
  if(m.slowT > 0 && Math.random() < .1) G.parts.push({x:m.x+rand(-m.r,m.r), y:m.y-rand(2,m.r*2), vx:0, vy:-15, life:.4, max:.4, size:1, col:'#a0d8ff'});
  if(m.affixes.includes('gelido') && Math.random() < .04) G.parts.push({x:m.x+rand(-m.r,m.r), y:m.y-rand(2,m.r*2), vx:0, vy:-10, life:.5, max:.5, size:1, col:'#c8ecff'});
  if(m.affixes.includes('venenoso') && Math.random() < .05) G.parts.push({x:m.x+rand(-m.r,m.r)*.6, y:m.y-2, vx:0, vy:10, life:.4, max:.4, size:1, col:'#8ad04a'});
  if(m.hp < m.maxHp && !m.dying){
    const w2 = Math.round(sw)+2, x = Math.round(m.x-w2/2), y = y0-6;
    b.fillStyle = OUT; b.fillRect(x-1, y-1, w2+2, 4);
    b.fillStyle = '#4a1418'; b.fillRect(x, y, w2, 2);
    b.fillStyle = '#e63946';   // la barra de los enemigos es siempre roja, sea cual sea su rareza
    b.fillRect(x, y, Math.round(w2*Math.max(0, m.hp/m.maxHp)), 2);
  }
  m.labelY = y0 - 8;
  b.globalAlpha = 1;
}
function drawPet(p){
  const art = PET_ART[p.def.id];
  const x = Math.round(p.x), y = Math.round(p.y), z = Math.round(p.z||0);
  const ex = p.exhaustedT > 0;
  const fi = art.fly ? (ex ? 0 : [1,0,2,0][Math.floor(p.walk*.6)%4]) : (p.moving ? (Math.sin(p.walk)>0 ? 1 : 2) : 0);
  const bob = (!art.fly && p.moving) ? -(Math.abs(Math.sin(p.walk))>.5 ? 1 : 0) : 0;
  pshadow(x, y, Math.max(5, 10-(z>>1)), 3);
  b.globalAlpha = ex ? .55 : 1;
  if(p.tongue){ const mx = x + p.dir*8, my = y - 6; pixLine(mx, my, p.tongue.x, p.tongue.y, 3, OUT); pixLine(mx, my, p.tongue.x, p.tongue.y, 1, '#e07080'); }
  if(p.def.stampede) b.globalAlpha = .88;
  if(p.def.stealth && p.state!=='engage') b.globalAlpha = .7;
  const s = (p.flash>0 ? art.flash : (p.item.shiny ? shinyArt(p.def.id) : art.fr))[fi];
  drawSP(s, x, y - z + bob, p.dir < 0);
  if(p.item.shiny && Math.random() < .12) G.parts.push({x:p.x+rand(-8,8), y:p.y-z-rand(2,14), vx:rand(-6,6), vy:-14, life:.5, max:.5, size:1.5, col:'hsl(' + Math.floor(rand(0,360)) + ',90%,72%)'});
  if(p.stoneT > 0){
    art.stone ??= art.fr.map(sp => { const c = document.createElement('canvas'); c.width = sp.c.width; c.height = sp.c.height; const g = c.getContext('2d'); g.drawImage(sp.c,0,0); g.globalCompositeOperation='source-in'; g.fillStyle='#9a9aa4'; g.fillRect(0,0,c.width,c.height); return {c, ax:sp.ax, ay:sp.ay}; });
    b.globalAlpha = .8; drawSP(art.stone[fi], x, y - z + bob, p.dir < 0);
  }
  b.globalAlpha = 1;
  if(ex && Math.floor(G.t*2)%2) { b.fillStyle = '#c8d0e0'; b.fillRect(x-1, y-z-28, 1, 1); b.fillRect(x+2, y-z-30, 1, 1); b.fillRect(x+5, y-z-32, 2, 1); }
  if(art.glow && !ex && Math.random() < .08) G.parts.push({x:x+rand(-8,8), y:y-z-rand(4,14), vx:rand(-8,8), vy:-20, life:.5, max:.5, size:1, col:art.glow});
}
function drawLoot(l){
  if(!lootVisible(l)) return;
  const y = Math.round(l.y - l.z - (l.z===0 ? Math.round(Math.sin(l.t*3+l.x)*1) : 0));
  pshadow(l.x, l.y, 4, 1, .35);
  if(l.gold){ b.drawImage(ICONS.coin, Math.round(l.x)-6, y-10); return; }
  const icon = l.item.id==='pet' ? null : ICONS[ITEMS[l.item.id].icon];
  if(icon) b.drawImage(icon, Math.round(l.x)-6, y-11);
  else drawSP(PET_ART[l.item.pet].fr[0], l.x, l.y);
  if(ITEMS[l.item.id]?.quest){   // objeto de misión: halo verde fluorescente y chispas
    const pul = .5 + .5*Math.sin(G.t*4); b.globalAlpha = .25 + .2*pul; b.fillStyle = '#39ff14'; b.fillRect(Math.round(l.x) - 9, y - 14, 18, 18); b.globalAlpha = 1;
    if(Math.random() < .3) G.parts.push({x:l.x + rand(-6, 6), y:y - rand(4, 14), vx:0, vy:-26, life:.7, max:.7, size:1.5, col:'#7affa0'});
  }
  if(ITEMS[l.item.id]?.treasure && Math.random() < .05) G.parts.push({x:l.x+rand(-5,5), y:y-rand(3,10), vx:0, vy:-12, life:.5, max:.5, size:1, col:'#ffe08a'});
}
function drawProj(pr){
  if(pr.kind==='stone'){ drawSP(ART.stoneHand, pr.x, pr.y); }
  else if(pr.kind==='bolt' || pr.kind==='orb'){
    const x = Math.round(pr.x), y = Math.round(pr.y), cl = pr.col || ['#6a2aa8','#a860ff','#f0d8ff'];
    b.globalAlpha = .4; b.fillStyle = cl[1]; b.fillRect(x-3, y-3, 7, 7); b.globalAlpha = 1;
    b.fillStyle = cl[1]; b.fillRect(x-2, y-2, 5, 5); b.fillStyle = cl[2]; b.fillRect(x-1, y-1, 2, 2);
    if(Math.random() < .5) G.parts.push({x:pr.x, y:pr.y, vx:rand(-10,10), vy:rand(-10,10), life:.3, max:.3, size:1.5, col:cl[1]});
  }
  else if(pr.kind==='spear'){
    const c = Math.cos(pr.ang), s2 = Math.sin(pr.ang);
    pixLine(pr.x - c*13, pr.y - s2*13, pr.x, pr.y, 3, OUT); pixLine(pr.x - c*13, pr.y - s2*13, pr.x, pr.y, 1, '#8a6040');
    pixLine(pr.x, pr.y, pr.x + c*4, pr.y + s2*4, 3, OUT); pixLine(pr.x, pr.y, pr.x + c*4, pr.y + s2*4, 1, '#e8ecf2');
  }
  else if(pr.kind==='arrow'){
    if(pr.explode && Math.random() < .5) G.parts.push({x:pr.x, y:pr.y, vx:-pr.vx*.05, vy:-15, life:.25, max:.25, size:1.5, col:pick(['#ff3a2a','#ffd040'])});
    if(pr.fire && Math.random() < .6) G.parts.push({x:pr.x, y:pr.y, vx:-pr.vx*.05, vy:-20, life:.3, max:.3, size:1.5, col:pick(['#ff8a2a','#ffd040'])});
    const c = Math.cos(pr.ang), s = Math.sin(pr.ang);
    pixLine(pr.x - c*9, pr.y - s*9, pr.x, pr.y, 3, OUT); pixLine(pr.x - c*9, pr.y - s*9, pr.x, pr.y, 1, pr.ice ? '#a8e0ff' : '#c8a878');
    if(pr.ice && Math.random() < .6) G.parts.push({x:pr.x, y:pr.y, vx:-pr.vx*.05, vy:rand(-10,10), life:.3, max:.3, size:1.5, col:pick(['#c8f0ff','#ffffff'])});
    b.fillStyle = pr.explode ? '#ff3a2a' : pr.ice ? '#e8faff' : '#d8dce4'; b.fillRect(Math.round(pr.x), Math.round(pr.y), 2, 2);
    if(pr.explode){ b.fillStyle = '#ffd040'; b.fillRect(Math.round(pr.x - c*3), Math.round(pr.y - s*3), 2, 2); }
    b.fillStyle = '#e8e0c8'; b.fillRect(Math.round(pr.x - c*9 - s*1.5), Math.round(pr.y - s*9 + c*1.5), 1, 1); b.fillRect(Math.round(pr.x - c*9 + s*1.5), Math.round(pr.y - s*9 - c*1.5), 1, 1);
  }
  else if(pr.kind==='flame'){
    const x = Math.round(pr.x), y = Math.round(pr.y);
    b.globalAlpha = .5; b.fillStyle = '#ff5a1a'; b.fillRect(x-4, y-4, 9, 9); b.globalAlpha = 1; b.fillStyle = '#ff8a2a'; b.fillRect(x-3, y-3, 6, 6); b.fillStyle = '#ffe070'; b.fillRect(x-1, y-1, 3, 3);
    if(Math.random() < .8) G.parts.push({x:pr.x, y:pr.y, vx:rand(-14,14), vy:rand(-30,-5), life:.35, max:.35, size:2, col:pick(['#ff5a1a','#ff8a2a','#ffc04a'])});
  }
  else if(pr.kind==='splash'){
    const x = Math.round(pr.x), y = Math.round(pr.y);
    b.fillStyle = OUT; b.fillRect(x-3, y-3, 6, 6); b.fillStyle = '#5ac8ff'; b.fillRect(x-2, y-2, 4, 4); b.fillStyle = '#e8faff'; b.fillRect(x-2, y-2, 2, 2);
    if(Math.random() < .6) G.parts.push({x:pr.x, y:pr.y, vx:rand(-14,14), vy:rand(-6,18), life:.3, max:.3, size:1.5, col:pick(['#5ac8ff','#aee8ff'])});
  }
  else if(pr.kind==='harpoon'){
    const c = Math.cos(pr.ang), s = Math.sin(pr.ang);
    pixLine(pr.x - c*14, pr.y - s*14, pr.x, pr.y, 3, OUT); pixLine(pr.x - c*14, pr.y - s*14, pr.x, pr.y, 1, '#a8b0b8');
    b.fillStyle = '#e8f0f8'; b.fillRect(Math.round(pr.x + c*2) - 1, Math.round(pr.y + s*2) - 1, 3, 3); b.fillStyle = '#7a8a98'; b.fillRect(Math.round(pr.x - c*3 - s*2), Math.round(pr.y - s*3 + c*2), 1, 1); b.fillRect(Math.round(pr.x - c*3 + s*2), Math.round(pr.y - s*3 - c*2), 1, 1);
  }
  else if(pr.kind==='bubble'){
    const x = Math.round(pr.x), y = Math.round(pr.y + Math.sin(G.t*8 + pr.x)*1.5);
    b.globalAlpha = .5; b.fillStyle = '#9ae8ff'; b.beginPath(); b.arc(x, y, 8, 0, Math.PI*2); b.fill(); b.globalAlpha = 1; b.strokeStyle = '#e8ffff'; b.lineWidth = 1; b.beginPath(); b.arc(x, y, 8, 0, Math.PI*2); b.stroke(); b.fillStyle = '#ffffff'; b.fillRect(x-4, y-4, 3, 2);
    if(Math.random() < .3) G.parts.push({x:pr.x, y:pr.y, vx:rand(-8,8), vy:rand(-14,-4), life:.4, max:.4, size:1.5, col:'#c8f4ff'});
  }
  else if(pr.kind==='snowball'){
    const x = Math.round(pr.x), y = Math.round(pr.y);
    b.fillStyle = OUT; b.fillRect(x-6, y-6, 12, 12); b.fillRect(x-7, y-5, 14, 10); b.fillStyle = '#dce8f4'; b.fillRect(x-5, y-5, 10, 10); b.fillStyle = '#ffffff'; b.fillRect(x-5, y-5, 6, 4); b.fillStyle = '#a8bcd4'; b.fillRect(x+1, y+1, 4, 4);
    if(Math.random() < .7) G.parts.push({x:pr.x, y:pr.y, vx:rand(-12,12), vy:rand(-8,10), life:.35, max:.35, size:1.5, col:pick(['#ffffff','#c8dcf0'])});
  }
  else if(pr.kind==='rock'){
    const x = Math.round(pr.x), y = Math.round(pr.y), sp = Math.floor(G.t*12)%2;
    b.fillStyle = OUT; b.fillRect(x-5, y-5, 10, 10); b.fillStyle = '#5a5e66'; b.fillRect(x-4, y-4, 8, 8); b.fillStyle = '#8a8e98'; b.fillRect(x-4, y-4, 5, 3); b.fillStyle = '#3a3d44'; b.fillRect(x+1, y+sp, 3, 3);
    if(Math.random() < .5) G.parts.push({x:pr.x, y:pr.y, vx:rand(-10,10), vy:rand(-10,10), life:.3, max:.3, size:1.5, col:'#8a8e98'});
  }
  else if(pr.kind==='dart'){
    const c = Math.cos(pr.ang), s = Math.sin(pr.ang);
    pixLine(pr.x - c*8, pr.y - s*8, pr.x, pr.y, 3, OUT); pixLine(pr.x - c*8, pr.y - s*8, pr.x, pr.y, 1, '#a060d0');
    b.fillStyle = '#f0d8ff'; b.fillRect(Math.round(pr.x), Math.round(pr.y), 2, 2);
  }
  else { const pc = {acorn:['#9a7030','#6a4a20'], dirt:['#6a4e36','#3a2a1a'], acid:['#6ae06a','#1a6a1a'], web:['#e8e8f0','#8a8a90'], axe:['#c8ccd4','#5a3d26'], glow:['#d8ff8a','#8ad04a'], ember:['#ff8a2a','#ffd040'], feather:['#b89868','#5e4630']}[pr.kind] || ['#9a7030','#6a4a20'];
    b.fillStyle = OUT; b.fillRect(Math.round(pr.x)-2, Math.round(pr.y)-2, 4, 4); b.fillStyle = pc[0]; b.fillRect(Math.round(pr.x)-1, Math.round(pr.y)-1, 2, 2); b.fillStyle = pc[1]; b.fillRect(Math.round(pr.x)-1, Math.round(pr.y)-2, 2, 1); }
}
function drawHazard(h){
  if(h.type==='zap'){ drawZap(h); return; }
  if(h.type==='poison'){
    const a = Math.min(1, h.life) * .55;
    b.globalAlpha = a; pshadow(h.x, h.y, h.r, Math.round(h.r*.45), 1);
    b.globalAlpha = a; b.fillStyle = '#3a6a1a';
    for(let dy=-Math.round(h.r*.4); dy<=Math.round(h.r*.4); dy++){
      const hw = Math.round(h.r*.9*Math.sqrt(Math.max(0,1-(dy/(h.r*.45))**2)));
      b.fillRect(Math.round(h.x)-hw, Math.round(h.y)+dy, hw*2, 1);
    }
    if(Math.random() < .1) G.parts.push({x:h.x+rand(-h.r,h.r)*.7, y:h.y, vx:0, vy:-12, life:.5, max:.5, size:1, col:'#8ad04a'});
    b.globalAlpha = 1;
  } else if(h.type==='flock'){
    for(let i=0;i<8;i++){
      const an = G.t*6 + i*.8, rr2 = h.r*(.5 + .5*Math.sin(G.t*3 + i)), cx = Math.round(h.x + Math.cos(an)*rr2), cy = Math.round(h.y - 14 + Math.sin(an)*rr2*.55);
      b.fillStyle = OUT; b.fillRect(cx-3, cy-1, 7, 3); b.fillStyle = '#16161e'; b.fillRect(cx-2, cy, 5, 1); b.fillRect(cx-3, cy + (Math.floor(G.t*14 + i)%2 ? -1 : 1), 1, 1); b.fillRect(cx+3, cy + (Math.floor(G.t*14 + i)%2 ? -1 : 1), 1, 1);
    }
  } else if(h.type==='whirl'){
    const al = Math.min(1, h.life*1.5); b.globalAlpha = al;
    for(let k=0;k<3;k++){ const r = h.r*(1 - k*.27), an0 = (k%2 ? -1 : 1)*G.t*(4 + k), n = 16 - k*3;
      for(let i=0;i<n;i++){ const an = an0 + i*Math.PI*2/n; b.fillStyle = ['#aee8ff','#5ac8ff','#2a8ab8'][(i+k)%3]; b.fillRect(Math.round(h.x + Math.cos(an)*r), Math.round(h.y - 2 + Math.sin(an)*r*.45), 3, 1); } }
    b.globalAlpha = 1;
  } else if(h.type==='fire'){
    const a = Math.min(1, h.life); b.globalAlpha = a; drawFlames(h.x + Math.sin(h.x*3)*3, h.y, .4); b.globalAlpha = 1;
  } else if(h.type==='charm'){
    const t = 1 - h.life/h.max;
    pixRing(h.x, h.y, h.r, h.r*.45, Math.floor(G.t*10)%2 ? '#ff9ae0' : '#c8a0ff', 30); pixRing(h.x, h.y, h.r*t, h.r*.45*t, '#ffe0f8', 22);
    if(Math.random() < .5) G.parts.push({x:h.x + rand(-h.r*.7, h.r*.7), y:h.y - rand(0, 10), vx:0, vy:-24, life:.6, max:.6, size:2, col:pick(['#ff9ae0','#ffffff'])});
  } else if(h.type==='rockfall'){
    const t = 1 - h.life/h.max, fall = Math.pow(Math.max(0, 1 - t), 2)*150;   // la roca cae desde arriba; la sombra crece
    b.globalAlpha = .25 + t*.4; pixRing(h.x, h.y, h.r*(.4 + t*.6), h.r*(.4 + t*.6)*.45, '#0a0c12', 24); b.globalAlpha = 1;
    if(Math.floor(G.t*10)%2) pixRing(h.x, h.y, h.r, h.r*.45, '#ff8a3a', 26);
    const ry = Math.round(h.y - fall - 6), rx = Math.round(h.x);
    b.fillStyle = OUT; b.fillRect(rx-9, ry-9, 18, 17); b.fillStyle = '#6a6e78'; b.fillRect(rx-8, ry-8, 16, 15); b.fillStyle = '#9aa0aa'; b.fillRect(rx-8, ry-8, 9, 6); b.fillStyle = '#3e4148'; b.fillRect(rx+2, ry+1, 6, 6);
  } else if(h.type==='frost'){
    const t = 1 - h.life/h.max;
    pixRing(h.x, h.y, h.r, h.r*.45, Math.floor(G.t*12)%2 ? '#a0d8ff' : '#e8f4ff', 30);
    pixRing(h.x, h.y, h.r*t, h.r*.45*t, '#c8ecff', 24);
  } else if(h.type==='shock'){
    if(h.delay > 0){ if(Math.floor(G.t*10)%2) pixRing(h.x, h.y, 40 + (1 - h.delay/(h.max))*0, 18, '#ff3a2a', 24); return; }
    const al = Math.max(.35, 1 - h.rad/430); b.globalAlpha = al;
    pixRing(h.x, h.y, h.rad, h.rad*.45, '#ff4a1a', Math.round(30 + h.rad/6), 3);
    pixRing(h.x, h.y, h.rad - 4, (h.rad - 4)*.45, '#ffb347', Math.round(30 + h.rad/6), 2);
    pixRing(h.x, h.y, h.rad - 8, (h.rad - 8)*.45, '#fff1b8', Math.round(30 + h.rad/6), 1); b.globalAlpha = 1;
  } else if(h.type==='slam' || h.type==='quake'){
    const t = 1 - h.life/h.max;
    pixRing(h.x, h.y, h.r, h.r*.45, '#ff5a3c', 28);
    pixRing(h.x, h.y, h.r*t, h.r*.45*t, '#ffb347', 20);
  } else if(h.type==='beam'){
    if(h.delay > 0){ const blink = Math.floor(G.t*14)%2, nx = -Math.sin(h.ang)*h.w/2, ny = Math.cos(h.ang)*h.w/2*.8; b.fillStyle = h.col; b.globalAlpha = blink ? .75 : .4; for(let r2 = 10; r2 < h.len; r2 += 8){ const px = h.x + Math.cos(h.ang)*r2, py = h.y + Math.sin(h.ang)*r2*.8; b.fillRect(Math.round(px + nx), Math.round(py + ny), 2, 2); b.fillRect(Math.round(px - nx), Math.round(py - ny), 2, 2); if(r2 % 24 < 8) b.fillRect(Math.round(px), Math.round(py), 2, 2); } b.globalAlpha = 1; }
    else { const k = Math.max(0, h.life/h.max); b.globalAlpha = k; for(let r2 = 0; r2 < h.len; r2 += 6){ const px = Math.round(h.x + Math.cos(h.ang)*r2), py = Math.round(h.y + Math.sin(h.ang)*r2*.8), ww = Math.round(h.w*.5*k) + 2; b.fillStyle = h.col; b.fillRect(px - ww/2, py - ww/2, ww, ww); b.fillStyle = '#ffffff'; b.fillRect(px - 1, py - 1, 3, 3); } b.globalAlpha = 1; }
  } else if(h.type==='pull'){
    pixRing(h.x, h.y, h.r*(.6 + .4*((G.t*2)%1)), h.r*.45, '#8a7aff', 30); pixRing(h.x, h.y, h.r*.4, h.r*.18, '#0a0820', 20);
  } else if(h.type==='boom'){
    const t = 1 - h.life/h.max;
    if(Math.floor(G.t*(6+t*14))%2) pixRing(h.x, h.y, h.r, h.r*.45, '#ff3a1a', 30);
    pixRing(h.x, h.y, h.r*t, h.r*.45*t, '#ffb347', 22);
  }
}
function drawChest(c){
  if(c.legend && !c.open){   // el cofre legendario brilla: halo pulsante y columna de luz
    const x = Math.round(c.x), y = Math.round(c.y), pul = .5 + .5*Math.sin(G.t*3);
    b.save(); b.fillStyle = '#ff9a3a'; b.globalAlpha = .13 + .09*pul; b.beginPath(); b.ellipse(x, y-8, 44, 24, 0, 0, Math.PI*2); b.fill();
    b.globalAlpha = .17 + .1*pul; b.beginPath(); b.ellipse(x, y-8, 30, 17, 0, 0, Math.PI*2); b.fill();
    b.fillStyle = '#ffe08a'; b.globalAlpha = .1 + .06*pul; b.fillRect(x-7, y-84, 14, 76); b.globalAlpha = .08 + .05*pul; b.fillRect(x-14, y-70, 28, 62); b.restore();
  }
  drawSP(ART.chest[c.legend ? 'legend' : c.rare ? 'rare' : 'normal'][c.open ? 1 : 0], c.x, c.y);
  if(c.rare && !c.open && Math.random() < (c.legend ? .5 : .06)) G.parts.push({x:c.x+rand(c.legend ? -16 : -8, c.legend ? 16 : 8), y:c.y-rand(4,c.legend ? 26 : 14), vx:rand(-6,6), vy:c.legend ? -26 : -15, life:c.legend ? .9 : .6, max:c.legend ? .9 : .6, size:c.legend ? 1.6 : 1, col:c.legend ? pick(['#ff9a3a','#ffe08a','#ffffff']) : '#ffe08a'});
}
function drawCage(c){
  if(c.gift && !c.open){   // jaula de regalo del jefe: halo arcoíris pulsante y un «!» sobre ella
    const pul = .5 + .5*Math.sin(G.t*4), hue = Math.floor((G.t*120)%360);
    b.globalAlpha = .2 + .15*pul; b.fillStyle = 'hsl(' + hue + ',90%,65%)'; b.beginPath(); b.ellipse(Math.round(c.x), Math.round(c.y) - 8, 30, 20, 0, 0, Math.PI*2); b.fill(); b.globalAlpha = 1;
    if(Math.random() < .25) G.parts.push({x:c.x + rand(-12, 12), y:c.y - rand(0, 24), vx:0, vy:-24, life:.7, max:.7, size:1.5, col:'hsl(' + ((hue + rand(0, 90))%360) + ',90%,75%)'});
  }
  drawSP(ART.cageBack, c.x, c.y);
  if(!c.open){
    // el contenido es un misterio hasta abrirla: solo se ven dos ojos que brillan en la sombra
    const blink = Math.sin(G.t*1.3 + c.x) > .93 ? 0 : 1;
    b.fillStyle = 'rgba(8,6,10,.75)'; b.fillRect(c.x-8, c.y-16, 16, 12);
    if(blink){ b.fillStyle = c.shiny ? 'hsl(' + Math.floor((G.t*140)%360) + ',90%,65%)' : '#ffe08a'; b.fillRect(c.x-4, c.y-12, 2, 2); b.fillRect(c.x+2, c.y-12, 2, 2); }
  }
  drawSP(ART.cageFront[c.open ? 1 : 0], c.x, c.y-2);
  if(!c.open) drawSP(ART.lock, c.x, c.y-6);
  if(c.gift && !c.open){ const x = Math.round(c.x), y = Math.round(c.y - 52 + Math.sin(G.t*3)*1.5), hh = 'hsl(' + Math.floor((G.t*120)%360) + ',90%,65%)'; b.fillStyle = '#121015'; b.fillRect(x-3, y-1, 6, 12); b.fillRect(x-3, y+12, 6, 5); b.fillStyle = hh; b.fillRect(x-2, y, 4, 9); b.fillRect(x-2, y+13, 4, 3); b.fillStyle = '#ffffff'; b.fillRect(x-2, y, 1, 9); }
}
function drawPortal(p){
  const x = Math.round(p.x), y = Math.round(p.y), t = G.t;
  pshadow(x, y, 32, 10, .4);
  for(let i=0;i<64;i++){
    const a = i/64*Math.PI*2 + t*1.5, r = 28 + Math.sin(t*3 + i)*2.5;
    b.fillStyle = i%3===0 ? '#e0d8ff' : i%3===1 ? '#9a7aff' : '#4ad6ff';
    b.fillRect(Math.round(x + Math.cos(a)*r), Math.round(y - 26 + Math.sin(a)*r*1.1), 3, 3);
  }
  for(let i=0;i<30;i++){
    const a = -t*3 + i*.7, r = (i/30)*22;
    b.fillStyle = i%2 ? '#6a4aff' : '#b9a8ff';
    b.fillRect(Math.round(x + Math.cos(a)*r), Math.round(y - 26 + Math.sin(a)*r*1.1), 2, 2);
  }
  b.globalAlpha = .18; b.fillStyle = '#7a5aff'; b.beginPath(); b.ellipse(x, y - 26, 26, 29, 0, 0, Math.PI*2); b.fill(); b.globalAlpha = 1;
  if(Math.random() < .5) G.parts.push({x:x+rand(-26,26), y:y-rand(0,52), vx:0, vy:-24, life:.7, max:.7, size:1.5, col:pick(['#b9a8ff','#4ad6ff'])});
}

// mueve a un monstruo rodeando los obstáculos si se queda atascado (esquinas, muros, props)
function moveSteer(sc, m, dx, dy){
  const want = Math.hypot(dx, dy); if(want < .05) return;
  const x0 = m.x, y0 = m.y;
  if(m.steerN > 0){                       // sigue rodeando el obstáculo unos instantes
    m.steerN--; const c = Math.cos(m.steerA), s = Math.sin(m.steerA);
    moveCircle(sc, m, dx*c - dy*s, dx*s + dy*c);
    if(Math.hypot(m.x-x0, m.y-y0) >= want*.5) return;
    m.x = x0; m.y = y0; m.steerN = 0;
  }
  moveCircle(sc, m, dx, dy);
  if(Math.hypot(m.x-x0, m.y-y0) >= want*.45) return;
  const side = m.steerSide || (m.steerSide = Math.random() < .5 ? 1 : -1);
  for(const ang of [.8*side, 1.5*side, -.8*side, -1.5*side, 2.4*side]){
    m.x = x0; m.y = y0;
    const c = Math.cos(ang), s = Math.sin(ang);
    moveCircle(sc, m, dx*c - dy*s, dx*s + dy*c);
    if(Math.hypot(m.x-x0, m.y-y0) >= want*.6){ m.steerA = ang; m.steerN = 25; m.steerSide = Math.sign(ang); return; }
  }
  m.x = x0; m.y = y0;
}

// ---------- aliados: esqueletos alzados por Huesitos (duran 10 s) ----------
function raiseAlly(p, m){
  const mine = G.allies.filter(al => al.owner===p);
  if(mine.length >= 3) mine[0].life = 0;
  G.allies.push({x:m.x, y:m.y, life:10, cd:.6, face:1, walk:0, owner:p, r:8});
  burst(m.x, m.y-8, 14, ['#7af07a','#c8ffc8','#1a6a1a'], [30,110], [.4,.8], -50); ring(m.x, m.y-6, 22, '#7af07a', .35);
  addText(m.x, m.y-30, 'Esqueleto aliado', '#a8ffa8', 6); sfx('summon');
}
function updateAllies(dt){
  for(const al of G.allies){
    al.life -= dt; al.cd -= dt;
    let tgt = null, bd = 230;
    for(const m of G.mons){ if(m.dying) continue; const d = Math.hypot(m.x-al.x, m.y-al.y); if(d < bd){ bd = d; tgt = m; } }
    let dx, dy, d;
    if(tgt){ dx = tgt.x-al.x; dy = tgt.y-al.y; d = Math.hypot(dx,dy) || 1; al.face = dx > 0 ? 1 : -1; }
    else { dx = P.x-al.x; dy = P.y-al.y; d = Math.hypot(dx,dy) || 1; }
    const want = tgt ? (d > tgt.r + 14 ? 1 : 0) : (d > 50 ? 1 : 0), spd = 105;
    if(want){ moveCircle(G.sc, al, dx/d*spd*dt, dy/d*spd*dt); al.walk += dt*12; }
    if(tgt && d <= tgt.r + 16 && al.cd <= 0){
      al.cd = .9; hitMonster(tgt, rand(8,13)*(1 + (G.stats ? G.stats.petdmg : 0)/100), {src:'pet', pet:al.owner, nx:dx/d, ny:dy/d, k:130});
      burst(tgt.x, tgt.y-8, 4, ['#e8e0c8','#ffffff'], [30,90], [.15,.3], 0);
    }
  }
  G.allies = G.allies.filter(al => al.life > 0);
}
function drawAlly(al){
  const A = MON_ART.skeleton, fr = A.fr[Math.sin(al.walk) > 0 ? 0 : 1];
  pshadow(al.x, al.y, 7, 3);
  b.globalAlpha = Math.min(1, al.life/1.5) * .88;
  drawSP(fr, al.x, al.y, al.face < 0);
  b.globalAlpha = Math.min(1, al.life/1.5) * .5; pixRing(al.x, al.y, 8, 3, '#7af07a', 14); b.globalAlpha = 1;
}

// «No fumador» (Cardio 20): todas las acciones gastan un 10 % menos de estamina
function stamMul(){ return (MS('car',20) ? .9 : 1) * (1 - TT('ga')/100); }

// ---- afijos de armas (expedición 5+): daño plano elemental y efectos con probabilidad
const eleFlat = s => (s.fireDmg||0) + (s.litDmg||0) + (s.iceDmg||0);
function affixRoll(s){
  const r = c => c > 0 && Math.random()*100 < c;
  return {burn: r(s.fireCh) ? 4 : 0, weaken: r(s.litCh) ? 5 : 0, freeze: r(s.iceCh) ? 2.5 : 0, bleed: r(s.bleedCh) ? (s.bleedDur || 4) : 0, poison: r(s.poisonCh) ? (s.poisonDur || 4) : 0};
}
function projFx(pr){
  const a = pr.fxS ? affixRoll(pr.fxS) : {}; a.burn = Math.max(pr.fire ? 3 : 0, a.burn || 0);
  const wf = pr.wfx; if(wf){   // efectos propios del arma (arco fantasmal)
    if(wf.fearChance && Math.random() < wf.fearChance) a.fear = 3;
    if(wf.freezeChance && Math.random() < wf.freezeChance) a.freeze = Math.max(a.freeze || 0, 2.5);
    if(wf.bleedChance && Math.random() < wf.bleedChance) a.bleed = Math.max(a.bleed || 0, 4);
  }
  return a;
}

const ROCK_SRC = {affixes:[], type:'slime', x:0, y:0, dmg:0, dying:1, r:6};   // origen de las rocas que caen en el ascenso gélido
