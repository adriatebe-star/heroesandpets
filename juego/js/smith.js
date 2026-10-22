'use strict';
// =====================================================================
//  Uakala, el herrero orco: reparar el equipo y mejorarlo en el yunque
// =====================================================================
const MAX_AFFIX = 8;                                           // máximo de afijos por objeto
const FORGE_COST = 30;                                         // oro por tirada
const FORGE_SLOTS = ['weapon', 'head', 'chest', 'hands', 'feet', 'shield'];
UI.smithOpen = false; UI.smithTab = 'repair'; UI.smItem = null; UI.smMsg = null;
const _blocking4 = UI.blocking.bind(UI);
UI.blocking = function(){ return _blocking4() || this.smithOpen; };

// equipo del héroe con dónde está (para modificarlo o romperlo en su sitio)
function gearRefs(){
  const out = [], E = G.inv.equip;
  for(const k of ['w1', 'w2', 'shield', 'head', 'chest', 'hands', 'feet']) if(E[k]) out.push({ref:{area:'eq', key:k}, it:E[k], eq:true});
  G.inv.bag.forEach((it, i) => { if(it && it.id !== 'pet' && ITEMS[it.id].gear) out.push({ref:{area:'bag', key:i}, it}); });
  return out;
}
const repairCost = it => Math.max(1, Math.ceil((maxDur(it) - it.dur) * .35 * (1 + (it.affixes || []).length*.25) * (it.rarity === 'unique' ? 1.6 : 1)));
const isUnique = it => !!(ITEMS[it.id].unique || it.rarity === 'unique');
const forgeCost = it => FORGE_COST * (isUnique(it) ? 2 : 1);   // los únicos cuestan el doble
const canForge = it => { const d = ITEMS[it.id]; return !!d.gear && !d.stack && FORGE_SLOTS.includes(d.slot) && (it.affixes || []).length < MAX_AFFIX; };

UI.openSmith = function(tab){
  this.smithOpen = true; if(tab) this.smithTab = tab; this.smMsg = null; G.bigMap = false;
  $('smith').classList.remove('hidden'); sfx('ui');
  $('smClose').onclick = () => this.closeSmith();
  $('smTabs').onclick = e => { const b = e.target.closest('button'); if(!b) return; this.smithTab = b.dataset.tab; this.smMsg = null; sfx('ui'); this.renderSmith(); };
  this.renderSmith();
};
UI.closeSmith = function(){ this.smithOpen = false; $('smith').classList.add('hidden'); $('tip').classList.add('hidden'); sfx('ui'); };
UI.renderSmith = function(){
  document.querySelectorAll('#smTabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === this.smithTab));
  $('smGold').textContent = `Oro en la guarida: ${G.save.wallet}`; $('tip').classList.add('hidden');
  if(this.smithTab === 'repair') this.renderRepair($('smBody')); else this.renderForge($('smBody'));
};
const tipOn = (el, it) => { el.onmouseenter = e => UI.showTip(it, e); el.onmousemove = e => UI.moveTip(e); el.onmouseleave = () => $('tip').classList.add('hidden'); };

// --- reparar ---
UI.renderRepair = function(body){
  const list = gearRefs().filter(r => r.it.dur !== undefined && r.it.dur < maxDur(r.it)), total = list.reduce((s, r) => s + repairCost(r.it), 0);
  body.innerHTML = '';
  if(!list.length){ body.innerHTML = '<div class="smempty">Todo tu equipo está en perfecto estado.<br>Vuelve cuando se haya desgastado.</div>'; return; }
  const head = document.createElement('div'); head.className = 'smrow smhead';
  head.innerHTML = `<span class="smi">Reparar todo el equipo (${list.length} objetos)</span><button ${total && G.save.wallet >= total ? '' : 'disabled'}>Reparar todo · ${total} oro</button>`;
  head.querySelector('button').onclick = () => this.doRepair(list);
  body.append(head);
  for(const r of list){
    const it = r.it, cost = repairCost(it), row = document.createElement('div'); row.className = 'smrow';
    row.innerHTML = `<img src="${itemIconURL(it)}" draggable="false" style="border-color:${itemColor(it)}"><div class="smi"><b style="color:${itemColor(it)}">${itemName(it)}${r.eq ? ' (equipado)' : ''}</b><small>Durabilidad ${it.dur} / ${maxDur(it)}</small></div><button ${G.save.wallet >= cost ? '' : 'disabled'}>Reparar · ${cost} oro</button>`;
    row.querySelector('button').onclick = () => this.doRepair([r]);
    tipOn(row, it); body.append(row);
  }
};
UI.doRepair = function(list){
  const total = list.reduce((s, r) => s + repairCost(r.it), 0);
  if(G.save.wallet < total){ toast('No tienes suficiente oro', 1.6); return; }
  G.save.wallet -= total; for(const r of list){ r.it.dur = maxDur(r.it); r.it.lowWarned = false; r.it.wearAcc = 0; }
  sfx('coin'); sfx('equip'); toast(`Uakala repara tu equipo por ${total} oro`, 2);
  saveGame(); refreshStats(); UI.refresh(); this.renderSmith();
};

// --- mejorar en el yunque: 25 % se rompe, 25 % no pasa nada, 50 % se mejora (+2 afijos forjados) ---
function forgeUpgrade(it){
  const d = ITEMS[it.id]; it.affixes ??= [];
  const all = Object.keys(ITEM_AFFIX).filter(k => ITEM_AFFIX[k].slots.includes(d.slot)), added = [];
  // primero afijos que aún no tiene; si se agotan (cada hueco tiene solo 4-8), se repiten y suman sus valores
  const fresh = shuffle(all.filter(k => !it.affixes.some(a => a.k === k))), want = Math.min(2, MAX_AFFIX - it.affixes.length), picks = fresh.slice(0, want);
  while(picks.length < want) picks.push(pick(all));
  for(const k of picks){
    const v = rollAffix(ITEM_AFFIX[k]); it.affixes.push({k, v, forged:true}); added.push(k);
    if(k === 'dur' && it.maxDur){ const nm = Math.round(it.maxDur*(1 + v/100)); it.dur += nm - it.maxDur; it.maxDur = nm; }
  }
  it.forged = (it.forged || 0) + 1;
  const n = it.affixes.length, old = it.rarity || 'normal', rar = n >= 3 ? 'rare' : n >= 1 ? 'magic' : 'normal';
  if(rar !== old && !isUnique(it)){
    it.rarity = rar;
    it.name = rar === 'magic' ? `${d.name} ${ITEM_AFFIX[it.affixes[0].k].sfx}` : (old === 'rare' && it.name ? it.name : pick(RARE_ITEM_NAMES));
  }
  return added;
}
UI.renderForge = function(body){
  const refs = gearRefs().filter(r => canForge(r.it)), sel = refs.find(r => r.it === this.smItem) || null;
  if(!sel) this.smItem = null;
  const msg = this.smMsg, cost = sel ? forgeCost(sel.it) : FORGE_COST;
  body.innerHTML = `<div class="smforge"><div><div class="smodds">Elige un arma o una armadura de tu equipo (los objetos con 8 afijos no se pueden mejorar; los únicos cuestan el doble):</div><div class="smgrid" id="smGrid"></div></div>
    <div class="smanvil"><img class="anvilimg" id="anvilImg" src="${ICONS.anvil.toDataURL()}">
      <div class="smitem ${sel ? 'has' : ''}" id="smItemBox">${sel ? '' : 'Haz clic en un objeto de la izquierda para ponerlo sobre el yunque'}</div>
      <div class="smodds">Cada tirada cuesta <b style="color:#ffe08a">${cost} de oro</b>:<br>25 % se rompe · 25 % no pasa nada · 50 % se mejora (+2 afijos)</div>
      <div class="smmsg ${msg ? msg.t : ''}" id="smMsg">${msg ? msg.text : ''}</div>
      <button id="smForge" ${sel && G.save.wallet >= cost ? '' : 'disabled'}>Forjar · ${cost} oro</button></div></div>`;
  const grid = $('smGrid');
  if(!refs.length) grid.outerHTML = '<div class="smempty">No llevas armas ni armaduras que se puedan mejorar.</div>';
  else for(const r of refs){
    const el = document.createElement('div'); el.className = 'smslot' + (r.it === this.smItem ? ' sel' : ''); el.style.borderColor = r.it === this.smItem ? '' : itemColor(r.it);
    el.innerHTML = `<img src="${itemIconURL(r.it)}" draggable="false">${r.eq ? '<span class="tag">E</span>' : ''}`;
    el.onclick = () => { this.smItem = r.it === this.smItem ? null : r.it; this.smMsg = null; sfx('ui'); this.renderSmith(); };
    tipOn(el, r.it); grid.append(el);
  }
  if(sel){
    const it = sel.it, box = $('smItemBox'); box.innerHTML = `<img src="${itemIconURL(it)}" style="width:44px;height:44px;image-rendering:pixelated;vertical-align:middle"> <b style="color:${itemColor(it)};font-weight:normal">${itemName(it)}</b>` +
      (it.affixes || []).map(a => `<div class="aff${a.forged ? ' lava' : ''}">◆ ${ITEM_AFFIX[a.k].desc(a.v)}</div>`).join('');
  }
  $('smForge').onclick = () => this.doForge();
  if(this.smHit){ this.smHit = false; const im = $('anvilImg'); im.classList.add('hit'); }
};
UI.doForge = function(){
  const sel = gearRefs().find(r => r.it === this.smItem); if(!sel) return;
  const cost = forgeCost(sel.it);
  if(G.save.wallet < cost){ toast('No tienes suficiente oro', 1.6); return; }
  G.save.wallet -= cost; this.smHit = true; sfx('stoneHit');
  const roll = Math.random(), it = sel.it, name = itemName(it);
  if(roll < .25){
    setRef(sel.ref, null); this.smItem = null; sfx('breakItem'); G.shake = Math.max(G.shake, 4);
    this.smMsg = {t:'bad', text:`¡${name} se ha roto en el yunque!`};
  } else if(roll < .5){
    this.smMsg = {t:'none', text:'El metal no ha cambiado... no ha pasado nada.'};
  } else {
    const added = forgeUpgrade(it); sfx('levelup'); burst(P.x, P.y-20, 14, ['#ff5a1a','#ffb040','#fff0a0'], [30,100], [.4,.8], -60);
    this.smMsg = {t:'good', text:`¡${itemName(it)} ha sido mejorado! (+${added.length} afijo${added.length > 1 ? 's' : ''})`};
  }
  saveGame(); refreshStats(); UI.refresh(); this.renderSmith();
};
