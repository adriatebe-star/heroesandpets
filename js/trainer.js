'use strict';
// =====================================================================
//  Chemma, el druida: árbol del adiestrador y colección / resurrección de mascotas
// =====================================================================

// ---------- árbol del adiestrador: 4 ramas de 10 nodos (1 punto por cada 5 mascotas liberadas) ----------
const PBRANCH = {
  find:{name:'BUSCADOR', col:'#ffd166', per:'+3 % de probabilidad de mascotas mágicas, raras y legendarias · +3 % de velocidad al abrir jaulas',
        node:{findPct:3, cageSpd:3},
        notes:{1:{name:'Ojo de cazador', fx:{findPct:12}, txt:'+12 % de probabilidad de mascotas mágicas, raras y legendarias'},
               2:{name:'Rastro legendario', fx:{findPct:12, legBonus:1}, txt:'+12 % más, y las mascotas legendarias son el doble de probables'}}},
  rage:{name:'RABIA', col:'#ff6a5a', per:'+3 % de daño · +2 % de velocidad de ataque · +3 % de alcance de agresividad de las mascotas',
        node:{petDmg:3, petAspd:2, aggro:3},
        notes:{1:{name:'Sed de sangre', fx:{petDmg:10}, txt:'+10 % de daño de las mascotas'},
               2:{name:'Frenesí', fx:{petCrit:.1, petAspd:8}, txt:'+10 % de crítico y +8 % de velocidad de ataque de las mascotas'}}},
  care:{name:'CUIDADOR', col:'#7ae09a', per:'+3 % de vida máxima · +0,15 de vida por segundo · +2 % de armadura de las mascotas',
        node:{petHp:3, petRegen:.15, petArmor:2},
        notes:{1:{name:'Pelaje denso', fx:{petHp:10}, txt:'+10 % de vida máxima de las mascotas'},
               2:{name:'Aliento de vida', fx:{petRegen:.6, petArmor:8}, txt:'+0,6 de vida por segundo y +8 % de armadura de las mascotas'}}},
  comm:{name:'COMUNIÓN', col:'#a0d8ff', per:'+2 % a todas las estadísticas de las mascotas · +0,08 de vida por segundo y +2 % de regeneración de estamina del héroe',
        node:{petAll:2, pjRegen:.08, pjSreg:2},
        notes:{1:{name:'Lazo profundo', fx:{petAll:6}, txt:'+6 % a todas las estadísticas de las mascotas'},
               2:{name:'Alma gemela', fx:{pjRegen:.4, pjSreg:10}, txt:'+0,4 de vida por segundo y +10 % de regeneración de estamina del héroe'}}},
};
const PSTAT_NAMES = {findPct:['Prob. de mascotas especiales', '%'], cageSpd:['Velocidad al abrir jaulas', '%'], petDmg:['Daño de las mascotas', '%'], petAspd:['Velocidad de ataque', '%'],
  aggro:['Alcance de agresividad', '%'], petCrit:['Crítico de las mascotas', 'crit'], petHp:['Vida máxima de las mascotas', '%'], petRegen:['Regeneración de las mascotas', '/s'],
  petArmor:['Armadura de las mascotas', '%'], petAll:['Estadísticas de las mascotas', '%'], pjRegen:['Regeneración de vida del héroe', '/s'], pjSreg:['Regeneración de estamina del héroe', '%']};
const PTREE = {nodes:[], byId:{}, adj:{}};
(function buildPetTree(){
  const add = n => { PTREE.nodes.push(n); PTREE.byId[n.id] = n; PTREE.adj[n.id] = []; };
  const link = (a, c) => { PTREE.adj[a].push(c); PTREE.adj[c].push(a); };
  add({id:'start', b:null, x:0, y:0, start:true, name:'Inicio'});
  const keys = Object.keys(PBRANCH);
  keys.forEach((k, bi) => {
    const B = PBRANCH[k], th = -Math.PI/2 + bi*Math.PI/2;
    for(let L = 1; L <= 5; L++) for(let lane = 0; lane < 2; lane++){
      const r = 60 + L*52, ang = th + (lane ? 1 : -1)*(.34 - L*.04);
      const n = {id:k+L+'_'+lane, b:k, L, lane, x:Math.cos(ang)*r, y:Math.sin(ang)*r, fx:Object.assign({}, B.node)};
      const note = L===3 && lane===0 ? 1 : L===5 && lane===1 ? 2 : 0;
      if(note){ n.notable = note; n.name = B.notes[note].name; n.txt = B.notes[note].txt; for(const s in B.notes[note].fx) n.fx[s] = (n.fx[s]||0) + B.notes[note].fx[s]; }
      add(n);
    }
    link('start', k+'1_0'); link('start', k+'1_1');
    for(let L = 1; L <= 5; L++){
      if(L%2 === 1) link(k+L+'_0', k+L+'_1');
      if(L < 5){ link(k+L+'_0', k+(L+1)+'_0'); link(k+L+'_1', k+(L+1)+'_1'); }
    }
  });
  keys.forEach((k, bi) => link(k+'3_1', keys[(bi+1)%keys.length]+'3_0'));   // puentes entre ramas vecinas
})();
// bonos acumulados de los nodos aprendidos (G.pt)
function refreshPetBonus(){
  const t = {};
  for(const id of G.save.petTree) { const n = PTREE.byId[id]; if(n && n.fx) for(const k in n.fx) t[k] = (t[k] || 0) + n.fx[k]; }
  G.pt = t;
}
const petPoints = () => Math.floor((G.save.petsFreed || 0)/5) - (G.save.petTree.length - 1);
// al cambiar bonos de vida, las mascotas guardadas se curan al máximo nuevo (solo se aprende en la guarida)
function restorePetItems(){
  for(const it of allPetStores()) if(it && it.id === 'pet') it.hp = petMaxHp(it);
  syncPets(); for(const p of G.pets){ p.maxHp = petMaxHp(p.item); p.hp = p.maxHp; }
}

// ---------- panel con pestañas ----------
UI.trainerOpen = false; UI.trainerTab = 'train'; UI.ptHover = null;
const _blocking3 = UI.blocking.bind(UI);
UI.blocking = function(){ return _blocking3() || this.trainerOpen; };
UI.openTrainer = function(tab){
  this.trainerOpen = true; if(tab) this.trainerTab = tab; G.bigMap = false;
  $('trainer').classList.remove('hidden'); sfx('ui');
  $('trClose').onclick = () => this.closeTrainer();
  $('trTabs').onclick = e => { const b = e.target.closest('button'); if(!b) return; this.trainerTab = b.dataset.tab; sfx('ui'); this.renderTrainer(); };
  this.renderTrainer();
};
UI.closeTrainer = function(){ this.hideColPop(); this.trainerOpen = false; $('trainer').classList.add('hidden'); $('tip').classList.add('hidden'); sfx('ui'); };
UI.renderTrainer = function(){
  const tab = this.trainerTab, body = $('trBody');
  document.querySelectorAll('#trTabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  $('trGold').textContent = `Oro en la guarida: ${G.save.wallet}`;
  $('tip').classList.add('hidden');
  this.hideColPop();
  if(tab === 'shop') this.renderDruidShop(body);
  else if(tab === 'lab') this.renderPetLab(body);
  else if(tab === 'train') this.renderTrain(body);
  else this.renderCollection(body);
};

// --- resucitar (se usa desde la colección) ---
const reviveCost = e => REVIVE_COST[PETS[e.pet].rarity] * (e.shiny ? 2 : 1);
UI.reviveAt = function(i){
  const e = G.save.fallen[i], cost = reviveCost(e);
  if(G.save.wallet < cost){ toast('No tienes suficiente oro', 1.6); return; }
  const it = mkPetItem(e.pet, true, e.shiny);
  if(!addToBagOrStash(it)){ toast('No tienes sitio ni en la mochila ni en el alijo', 2); return; }
  G.save.wallet -= cost; G.save.fallen.splice(i, 1);
  sfx('cage'); toast(`¡${e.shiny ? '★ ' : ''}${PETS[e.pet].name} ha vuelto a la vida!`, 2.5);
  saveGame(); this.refresh(); this.hideColPop(); this.renderTrainer();
};

// --- adiestrador ---
UI.ptPos = n => [350 + n.x*.78, 350 + n.y*.78];
UI.ptState = n => { const t = G.save.petTree; return t.includes(n.id) ? 'on' : PTREE.adj[n.id].some(id => t.includes(id)) ? 'open' : 'locked'; };
UI.renderTrain = function(body){
  const s = G.save, pts = petPoints(), spent = s.petTree.length - 1;
  body.innerHTML = `<div id="ptWrap"><canvas id="ptCanvas" width="700" height="700"></canvas><div id="ptInfo"></div></div>`;
  const c = $('ptCanvas');
  const nodeAt = e => {
    const r = c.getBoundingClientRect(), k = c.width/r.width, mx = (e.clientX - r.left)*k, my = (e.clientY - r.top)*k;
    let best = null, bd = 18;
    for(const n of PTREE.nodes){ const [x, y] = this.ptPos(n), d = Math.hypot(mx-x, my-y); if(d < bd){ bd = d; best = n; } }
    return best;
  };
  c.onmousemove = e => {
    const n = nodeAt(e);
    if(n !== this.ptHover){ this.ptHover = n; this.drawPetTree(); }
    const t = $('tip');
    if(!n){ t.classList.add('hidden'); c.style.cursor = 'default'; return; }
    const B = n.b && PBRANCH[n.b];
    let h = n.start ? '<b style="color:#ffe08a">Inicio</b><div class="sub">Tu punto de partida</div>'
      : n.notable ? `<b style="color:${B.col}">${n.name}</b><div class="sub">Notable de ${B.name}</div><div class="aff">◆ ${n.txt}</div><div class="desc">Además: ${B.per}</div>`
      : `<b style="color:${B.col}">${B.name}</b><div class="desc">${B.per}</div>`;
    const st = this.ptState(n);
    h += `<div class="sub">${st === 'on' ? 'Aprendido' : st === 'open' ? (petPoints() > 0 ? 'Haz clic para aprenderlo (1 punto)' : 'Necesitas un punto') : 'Bloqueado: aprende un nodo conectado'}</div>`;
    t.innerHTML = h; t.classList.remove('hidden'); this.moveTip(e);
    c.style.cursor = st === 'open' && petPoints() > 0 ? 'pointer' : 'default';
  };
  c.onmouseleave = () => { this.ptHover = null; $('tip').classList.add('hidden'); this.drawPetTree(); };
  c.onclick = e => {
    const n = nodeAt(e); if(!n || this.ptState(n) !== 'open') return;
    if(petPoints() <= 0){ toast('No tienes puntos: libera más mascotas', 1.6); sfx('ui'); return; }
    s.petTree.push(n.id); refreshPetBonus(); restorePetItems(); saveGame(); sfx('levelup');
    if(n.notable) toast(`¡${n.name}! ${n.txt}`, 3);
    this.renderTrainer();
  };
  const left = 5 - ((s.petsFreed || 0) % 5), cost = spent*20;
  const rows = Object.entries(PBRANCH).map(([k, B]) => {
    const got = s.petTree.filter(id => PTREE.byId[id].b === k).length;
    return `<div class="trow"><b style="color:${B.col}">${B.name}</b> <span>${got} / 10</span><div class="tper">${B.per}</div></div>`;
  }).join('');
  const tot = Object.entries(G.pt).filter(([k, v]) => v && PSTAT_NAMES[k] && PSTAT_NAMES[k][1] !== undefined).map(([k, v]) => {
    const [nm, u] = PSTAT_NAMES[k]; const val = k==='petCrit' ? Math.round(v*100) : (Math.round(v*100)/100); return `<div><span>${nm}</span><b>+${String(val).replace('.', ',')}${u==='/s' ? ' /s' : ' %'}</b></div>`;
  }).join('') || '<div class="sub">Aún no has aprendido nada.</div>';
  $('ptInfo').innerHTML = `<div class="ptpts">${pts > 0 ? `Tienes <b>${pts}</b> punto${pts>1?'s':''} para invertir` : 'No tienes puntos'}<br><span>Mascotas liberadas: ${s.petsFreed || 0} · siguiente punto en ${left}</span></div>${rows}<div class="pttot">${tot}</div>
    ${spent ? `<button id="ptReset">Olvidar todo (${cost} oro)</button>` : ''}`;
  const rb = $('ptReset');
  if(rb) rb.onclick = () => {
    if(s.wallet < cost){ toast('No tienes suficiente oro', 1.6); return; }
    if(!confirm(`¿Olvidar todo lo aprendido por ${cost} oro? Recuperarás tus ${spent} puntos.`)) return;
    s.wallet -= cost; s.petTree = ['start']; refreshPetBonus(); restorePetItems(); saveGame(); sfx('ui'); this.renderTrainer();
  };
  this.drawPetTree();
};
UI.drawPetTree = function(){
  const c = $('ptCanvas'); if(!c) return;
  const g = c.getContext('2d'), s = G.save, tset = new Set(s.petTree), pts = petPoints();
  g.clearRect(0, 0, c.width, c.height);
  const bg = g.createRadialGradient(350, 350, 30, 350, 350, 350); bg.addColorStop(0, '#221a24'); bg.addColorStop(1, '#0c0a0e');
  g.fillStyle = bg; g.beginPath(); g.arc(350, 350, 346, 0, Math.PI*2); g.fill();
  Object.keys(PBRANCH).forEach((k, bi) => {
    const th = -Math.PI/2 + bi*Math.PI/2, x = 350 + Math.cos(th)*325, y = 350 + Math.sin(th)*325;
    g.font = `13px ${FONT}`; g.textAlign = 'center'; g.fillStyle = PBRANCH[k].col; g.fillText(PBRANCH[k].name, clamp(x, 60, 640), clamp(y + 5, 18, 690));
  });
  for(const n of PTREE.nodes) for(const id of PTREE.adj[n.id]){
    if(id < n.id) continue;
    const o = PTREE.byId[id], [x0, y0] = this.ptPos(n), [x1, y1] = this.ptPos(o), a = tset.has(n.id), c2 = tset.has(o.id);
    g.strokeStyle = a && c2 ? (PBRANCH[n.b || o.b] ? PBRANCH[n.b || o.b].col : '#ffe08a') : (a || c2) ? '#8a7a5a' : '#2e2830';
    g.lineWidth = a && c2 ? 4 : 2.5; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  }
  const pulse = (Math.sin(performance.now()/250) + 1)/2;
  for(const n of PTREE.nodes){
    const [x, y] = this.ptPos(n), st = n.start ? 'on' : this.ptState(n), col = n.b ? PBRANCH[n.b].col : '#ffe08a';
    const r = n.start ? 13 : n.notable ? 11 : 7, hov = this.ptHover === n;
    g.beginPath();
    if(n.notable){ g.moveTo(x, y-r); g.lineTo(x+r, y); g.lineTo(x, y+r); g.lineTo(x-r, y); g.closePath(); } else g.arc(x, y, r, 0, Math.PI*2);
    g.fillStyle = st === 'on' ? col : st === 'open' ? '#2a2228' : '#141016'; g.fill();
    g.lineWidth = hov ? 3.5 : 2;
    g.strokeStyle = st === 'on' ? '#fff3d0' : st === 'open' ? (pts > 0 ? `rgba(255,224,138,${.5 + pulse*.5})` : '#8a7a5a') : '#3a3238'; g.stroke();
  }
  if(this.trainerOpen && this.trainerTab === 'train' && pts > 0) requestAnimationFrame(() => { if(this.trainerOpen && this.trainerTab === 'train') this.drawPetTree(); });
};

// --- colección / resucitar: al pasar el cursor sale la ficha con estadísticas y precio para resucitarla ---
UI.hideColPop = function(){ clearTimeout(this._colT); const p = $('colPop'); if(p) p.classList.add('hidden'); };
UI.renderCollection = function(body){
  const col = G.save.collection, sh = G.save.shinies, ids = Object.keys(PETS), got = ids.filter(id => col[id]).length;
  const order = {normal:0, magic:1, rare:2, legendary:3}, fallenIds = new Set(G.save.fallen.map(e => e.pet));
  let h = `<div class="colhead">Colección: <b>${got}</b> / ${ids.length} mascotas rescatadas · <b>${ids.filter(id => sh[id]).length}</b> brillantes ★ · † = caída (se puede resucitar)</div><div id="colGrid">`;
  for(const e of EXPEDITIONS.filter(x => !x.locked)){
    const list = ids.filter(id => PETS[id].exp === (e.petExp ?? e.lvl)).sort((a, b) => order[PETS[a].rarity] - order[PETS[b].rarity]);
    h += `<div class="colexp"><h4>${e.lvl}. ${e.name}</h4><div class="colrow">` + list.map(id => {
      const p = PETS[id], have = !!col[id];
      return `<div class="colpet ${have ? 'have' : ''} ${fallenIds.has(id) ? 'dead' : ''}" data-id="${id}" style="--rc:${RARITY[p.rarity].col}">${sh[id] ? '<i class="colstar">★</i>' : ''}${fallenIds.has(id) ? '<i class="coldead">†</i>' : ''}<img src="${itemIconURL({id:'pet', pet:id})}" draggable="false"><span>${have ? p.name : '???'}</span></div>`;
    }).join('') + '</div></div>';
  }
  body.innerHTML = h + '</div>';
  let pop = $('colPop'); if(!pop){ pop = document.createElement('div'); pop.id = 'colPop'; pop.className = 'hidden'; document.body.append(pop);
    pop.onmouseenter = () => clearTimeout(this._colT); pop.onmouseleave = () => this.hideColPop(); }
  body.querySelectorAll('.colpet').forEach(el => {
    const id = el.dataset.id;
    el.onmouseenter = () => { clearTimeout(this._colT); this.showColPop(el, id); };
    el.onmouseleave = () => { this._colT = setTimeout(() => this.hideColPop(), 120); };
  });
};
UI.showColPop = function(el, id){
  const pop = $('colPop'), p = PETS[id], R = RARITY[p.rarity], col = G.save.collection, sh = G.save.shinies;
  if(!col[id]){ pop.innerHTML = '<b>???</b><div class="sub">Aún no has rescatado a esta mascota</div>'; }
  else {
    const n = mkPetItem(id, true, false), b = mkPetItem(id, true, true), k = v => Math.round(v*1.1);
    const stats = (it, kd) => `Vida <b>${petMaxHp(it)}</b> · Daño <b>${Math.round(p.dmg[0]*kd)}-${Math.round(p.dmg[1]*kd)}</b>`;
    let html = `<div class="cp-name" style="color:${R.col}">${p.name}</div><div class="sub">${R.name} · ${p.look}</div>
      <div class="cp-st">${stats(n, 1)}</div>${sh[id] ? `<div class="cp-st" style="color:#ff9ad8">★ Brillante: ${stats(b, 1.1)}</div>` : ''}
      <div class="cp-aff">${p.affixes.map(a => `<div><b>${PET_AFFIX[a].name}</b> · ${PET_AFFIX[a].desc}</div>`).join('')}</div>
      <div class="cp-att">${p.attack || ''}</div>`;
    const fallen = G.save.fallen.map((e, i) => ({e, i})).filter(x => x.e.pet === id), base = REVIVE_COST[p.rarity];
    html += `<div class="cp-price">Resucitar: <b>${base}</b> oro${sh[id] ? ` · brillante ★ <b>${base*2}</b> oro` : ''}</div>`;
    if(fallen.length) html += fallen.map(x => `<button data-i="${x.i}" ${G.save.wallet >= reviveCost(x.e) ? '' : 'disabled'}>Resucitar ${x.e.shiny ? 'versión brillante ★' : sh[id] ? 'versión normal' : ''} · ${reviveCost(x.e)} oro</button>`).join('');
    else html += '<div class="sub">Esta mascota no ha caído: no necesita resucitar.</div>';
    pop.innerHTML = html;
    pop.querySelectorAll('button').forEach(bt => bt.onclick = () => this.reviveAt(+bt.dataset.i));
  }
  pop.classList.remove('hidden');
  const r = el.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight;
  let x = r.left + r.width/2 - pw/2, y = r.bottom - 2; if(y + ph > innerHeight - 6) y = r.top - ph + 2;
  pop.style.left = Math.max(6, Math.min(innerWidth - pw - 6, x)) + 'px'; pop.style.top = Math.max(6, y) + 'px';
};
