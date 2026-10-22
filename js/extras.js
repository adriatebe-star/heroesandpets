'use strict';
// =====================================================================
//  Tienda de Chemma (jaula grande, mochila mágica y trébol de la suerte) y talismanes
// =====================================================================
const allPetStores = () => G.inv.equip.pet.concat(G.inv.bag, G.inv.equip.pbag || [], G.save.stash, G.save.petCage || []);   // todos los sitios donde puede haber mascotas

Object.assign(ICON_ROWS, {
  clover:   {pal:{G:'#3ac85a', g:'#a8f0b8'}, rows:["..kkk..kkk..", ".kGGGkkGGGk.", ".kGgGGGGgGk.", ".kGGGGGGGGk.", "..kGGkkGGk..", "..kGGkkGGk..", ".kGGGGGGGGk.", ".kGgGGGGgGk.", ".kGGGkkGGGk.", "..kkk..kkk..", "......kk...."]},
  bigcage:  {pal:{b:'#b0a070'}, rows:["....kkkk....", "...kbbbbk...", "..kb.bb.bk..", ".kbbbbbbbbk.", ".kb.b..b.bk.", ".kb.b..b.bk.", ".kb.b..b.bk.", ".kbbbbbbbbk.", ".kb.b..b.bk.", ".kbbbbbbbbk.", "..kkkkkkkk.."]},
  magicbag: {pal:{p:'#7a4aa8', P:'#4a2a6a', w:'#e8c8ff'}, rows:["....kkkk....", "...kpppPk...", "..kppppPPk..", ".kppppppPPk.", ".kppwwwwpPk.", ".kppwwwwpPk.", ".kppppppPPk.", ".kppppppPPk.", ".kpppkkpPPk.", "..kppppPPk..", "...kkkkkk..."]},
});
for(const k of ['clover', 'bigcage', 'magicbag']){ const d = ICON_ROWS[k]; ICONS[k] = bakeRows(d.rows, Object.assign({k:OUT}, d.pal)); }
// sprite de la jaula grande de la guarida (junto al alijo)
ART.bigcage = SP(paintSprite(30, 38, [
  {e:[15,24,11,11], c:['#0c0608','#1a1014','#2a1a20']}, {r:[2,33,26,4], c:['#3a2c18','#6a5428','#a8842c']}, {r:[3,31,24,2], c:['#6a5428','#a8842c','#e0b84a']},
  {l:[4,14,15,4,1.6], c:['#6a5428','#a8842c','#e0b84a']}, {l:[26,14,15,4,1.6], c:['#6a5428','#a8842c','#e0b84a']}, {e:[15,3,2.5,2.5], c:['#6a5428','#e0b84a']},
  {l:[4,14,4,31,1.3], c:['#a8842c','#e0b84a']}, {l:[9.5,9,9.5,31,1.3], c:['#a8842c','#e0b84a']}, {l:[15,5,15,31,1.3], c:['#a8842c','#e0b84a']}, {l:[20.5,9,20.5,31,1.3], c:['#a8842c','#e0b84a']}, {l:[26,14,26,31,1.3], c:['#a8842c','#e0b84a']},
  {r:[3,22,24,2], c:['#6a5428','#a8842c']}, {r:[12,26,6,5], c:['#c89a30','#ffe070']}, {p:[[11,19,'#ffd870'],[12,19,'#ffd870'],[18,19,'#ffd870'],[19,19,'#ffd870']]},
]), 15, 37);
// talismán: tres huecos de equipo; el trébol duplica la probabilidad de mascota brillante y desaparece al encontrar una
ITEMS.luckclover = {name:'Trébol de la suerte', icon:'clover', slot:'talisman', value:200,
  desc:'Talismán. Mientras lo llevas equipado, la mascota de una jaula tiene el doble de probabilidades de ser brillante (10 % en vez de 5 %). Cuando encuentras una brillante, el trébol se desvanece.'};

// pestaña «Tienda» de Chemma, el druida
UI.renderDruidShop = function(body){
  const s = G.save, gold = s.wallet;
  const offers = [
    {name:'Jaula grande para mascotas', price:10000, icon:ICONS.bigcage, owned:!!s.petCage, desc:'Un alijo para guardar hasta 100 mascotas. Aparece en la guarida, a la izquierda del alijo, y se abre con F.', buy:() => { s.petCage = Array(100).fill(null); const sc = G.sc; if(sc.kind === 'den' && !sc.bigCage){ sc.bigCage = {x:-242, y:40}; propSprite(sc, ART.bigcage, -242, 40, {t:'r', x:-256, y:33, w:28, h:8}, [16,3]); sc.lights.push({x:-242, y:20, r:70, a:.5, warm:true, flick:.08}); } return true; }},
    {name:'Mochila mágica', price:5000, icon:ICONS.magicbag, owned:!!s.magicBag, desc:'Añade 5 huecos a tu mochila que solo admiten mascotas. Al volver con vida, esas mascotas pasan a la jaula grande (o al alijo).', buy:() => { s.magicBag = true; return true; }},
    {name:'Pata de conejo', price:1500, icon:ICONS.rabbitfoot, owned:false, desc:ITEMS.rabbitfoot.desc + ' Talismán: se lleva en uno de los 3 huecos de talismán del equipo.', buy:() => addToBagOrStash(mkItem('rabbitfoot'))},
    {name:'Trébol de la suerte', price:1000, icon:ICONS.clover, owned:false, desc:ITEMS.luckclover.desc + ' Talismán: se lleva en uno de los 3 huecos de talismán del equipo.', buy:() => addToBagOrStash(mkItem('luckclover'))},
  ];
  body.innerHTML = '<div class="smhead" style="margin-bottom:10px;padding:8px 12px;color:var(--gold)">Chemma vende cosas útiles para cuidar y coleccionar mascotas. Se paga con el oro de la guarida.</div>';
  for(const o of offers){
    const row = document.createElement('div'); row.className = 'smrow';
    row.innerHTML = `<img src="${o.icon.toDataURL()}" draggable="false"><div class="smi"><b>${o.name}</b><small>${o.desc}</small></div><button ${o.owned || gold < o.price ? 'disabled' : ''}>${o.owned ? 'Comprada' : o.price + ' oro'}</button>`;
    row.querySelector('button').onclick = () => {
      if(s.wallet < o.price){ toast('No tienes suficiente oro', 1.6); return; }
      if(!o.buy()){ toast('No tienes sitio ni en la mochila ni en el alijo', 2); return; }
      s.wallet -= o.price; sfx('coin'); toast(`Compras ${o.name} por ${o.price} oro`, 2.2); saveGame(); refreshStats(); UI.refresh(); UI.renderTrainer();
    };
    body.append(row);
  }
};

// ---------- pestaña «Mejorar mascotas» de Chemma: se coloca una mascota en propiedad y se le inyectan sueros ----------
ICON_ROWS.serum = {pal:{w:'#d8e4ea', d:'#7a5636', R:'#a8ffd0', r:'#2ad88a', q:'#106a4a'}, rows:ICON_ROWS.potion.rows};
ICONS.serum = bakeRows(ICON_ROWS.serum.rows, Object.assign({k:OUT}, ICON_ROWS.serum.pal));
ICON_ROWS.serum2 = {pal:{w:'#d8e4ea', d:'#7a5636', R:'#e0a8ff', r:'#a82ad8', q:'#4a106a'}, rows:ICON_ROWS.potion.rows};
ICONS.serum2 = bakeRows(ICON_ROWS.serum2.rows, Object.assign({k:OUT}, ICON_ROWS.serum2.pal));
ICON_ROWS.serum3 = {pal:{w:'#d8e4ea', d:'#7a5636', R:'#ffa8a0', r:'#d82a2a', q:'#6a1010'}, rows:ICON_ROWS.potion.rows};
ICONS.serum3 = bakeRows(ICON_ROWS.serum3.rows, Object.assign({k:OUT}, ICON_ROWS.serum3.pal));
const MAX_PET_AFFIX = 8;
const petAffixCount = it => PETS[it.pet].affixes.length + (it.xaff || []).length;
// afijos que puede dar la mutación (se excluyen los atados a una mascota concreta o a su vida base)
const mutationPool = it => Object.keys(PET_AFFIX).filter(a => !['robusta', 'alba', 'luna', 'eclipse', 'crin'].includes(a) && !PETS[it.pet].affixes.includes(a) && !(it.xaff || []).includes(a));
// quita la mascota de donde esté (equipo, mochila, mochila mágica, alijo o jaula grande)
function removePetItem(it){
  for(const arr of [G.inv.equip.pet, G.inv.bag, G.inv.equip.pbag || [], G.save.stash, G.save.petCage || []]){ const i = arr.indexOf(it); if(i >= 0) arr[i] = null; }
  G.pets = G.pets.filter(p => p.item !== it);
}
const SERUM_ODDS = ' 25 % de que la mascota muera · 25 % de que no pase nada · 50 % de que funcione.';
// todos los sueros: 25 % muere, 25 % no pasa nada, 50 % funciona
function injectSerum(sr, it){
  const r = Math.random();
  if(r < .25){
    const homed = it.homed, name = itemName(it), id = it.pet, shiny = !!it.shiny; removePetItem(it);
    if(homed) G.save.fallen.push({pet:id, shiny});
    sfx('petDown'); return {msg:`¡${name} no ha sobrevivido al suero!`, dead:true};
  }
  if(r < .5) return {msg:'El suero no ha hecho efecto... no ha pasado nada.'};
  return sr.apply(it);
}
const SERUMS = [
  {id:'super', name:'Suero de supermascota', price:200, icon:'serum', desc:'Sube todas las estadísticas de la mascota un 20 % (vida, daño y velocidad de ataque). Solo se puede inyectar una vez a cada mascota.' + SERUM_ODDS,
   ok: it => !(it.serums && it.serums.super), done:'Inyectado',
   apply(it){ (it.serums ??= {}).super = 1; return {msg:`¡${itemName(it)} ha sido mejorado con suero de supermascota!`}; }},
  {id:'rage', name:'Suero de rabia', price:200, icon:'serum3', desc:'Aumenta el daño de la mascota un 33 %. Solo se puede inyectar una vez a cada mascota.' + SERUM_ODDS,
   ok: it => !(it.serums && it.serums.rage), done:'Inyectado',
   apply(it){ (it.serums ??= {}).rage = 1; return {msg:`¡${itemName(it)} ha sido mejorado con suero de rabia!`}; }},
  {id:'mut', name:'Suero de mutación', price:100, icon:'serum2', desc:'Si funciona, se le añaden 2 afijos a la mascota (máximo 8 afijos).' + SERUM_ODDS,
   ok: it => petAffixCount(it) < MAX_PET_AFFIX, done:'Máximo de afijos',
   apply(it){
     const add = shuffle(mutationPool(it)).slice(0, Math.min(2, MAX_PET_AFFIX - petAffixCount(it)));
     (it.xaff ??= []).push(...add);
     return {msg:`¡${itemName(it)} ha mutado! (+${add.length} afijo${add.length > 1 ? 's' : ''}: ${add.map(a => PET_AFFIX[a].name).join(', ')})`};
   }},
];
UI.labPet = null;
UI.renderPetLab = function(body){
  const pets = allPetStores().filter(it => it && it.id === 'pet'), sel = pets.find(p => p === this.labPet) || null;
  if(!sel) this.labPet = null;
  body.innerHTML = `<div class="lab"><div class="labtop"><div class="smitem ${sel ? 'has' : ''}" id="labSlot">${sel ? '' : 'Haz clic en una mascota de abajo para ponerla aquí'}</div><div class="smmsg" id="labMsg">${this.labMsg || ''}</div></div>
    <div class="labserums" id="labSerums"></div>
    <div class="smodds">Elige una mascota que tengas (equipada, en la mochila, en el alijo o en la jaula grande):</div><div class="smgrid labgrid" id="labGrid"></div></div>`;
  const grid = $('labGrid');
  if(!pets.length) grid.outerHTML = '<div class="smempty">No tienes ninguna mascota.</div>';
  else for(const it of pets){
    const el = document.createElement('div'); el.className = 'smslot' + (it === this.labPet ? ' sel' : ''); el.style.borderColor = it === this.labPet ? '' : (RARITY[PETS[it.pet].rarity].col);
    el.innerHTML = `<img src="${itemIconURL(it)}" draggable="false">${it.serums && (it.serums.super || it.serums.rage) ? '<span class="tag">💉</span>' : ''}`;
    el.onclick = () => { this.labPet = it === this.labPet ? null : it; this.labMsg = null; sfx('ui'); this.renderTrainer(); };
    tipOn(el, it); grid.append(el);
  }
  const p = sel && PETS[sel.pet], slot = $('labSlot');
  if(sel) slot.innerHTML = `<img src="${itemIconURL(sel)}" style="width:44px;height:44px;image-rendering:pixelated;vertical-align:middle"> <b style="color:${RARITY[p.rarity].col};font-weight:normal">${itemName(sel)}</b>
    <div>Vida: ${petMaxHp(sel)} · Daño: ${Math.round(p.dmg[0]*petDmgMult(sel))}-${Math.round(p.dmg[1]*petDmgMult(sel))}</div>` + (sel.serums && sel.serums.super ? '<div style="color:#7affc0">💉 Supermascota: +20 % de estadísticas</div>' : '') + (sel.serums && sel.serums.rage ? '<div style="color:#ff8a7a">💉 Rabia: +33 % de daño</div>' : '');
  const box = $('labSerums');
  for(const sr of SERUMS){
    const has = sel && !sr.ok(sel), card = document.createElement('div'); card.className = 'labcard';
    card.innerHTML = `<img src="${ICONS[sr.icon].toDataURL()}" draggable="false"><b>${sr.name}</b><small>${sr.desc}</small><button ${!sel || has || G.save.wallet < sr.price ? 'disabled' : ''}>${has ? sr.done : 'Inyectar · ' + sr.price + ' oro'}</button>`;
    card.querySelector('button').onclick = () => {
      if(G.save.wallet < sr.price){ toast('No tienes suficiente oro', 1.6); return; }
      G.save.wallet -= sr.price; sfx('potion'); sfx('coin');
      const res = injectSerum(sr, sel);
      if(res.dead) this.labPet = null; else { sel.hp = petMaxHp(sel); G.pets = G.pets.filter(q => q.item !== sel); }
      syncPets(); for(const q of G.pets) q.maxHp = petMaxHp(q.item);
      toast(res.msg, 3); this.labMsg = res.msg;
      saveGame(); refreshStats(); UI.refresh(); this.renderTrainer();
    };
    box.append(card);
  }
};

// ---------- Trapis: mejoras de mochila (+5 huecos cada una; la segunda exige la primera) ----------
ICON_ROWS.bigbag = {pal:{p:'#a8814a', P:'#5a3e1c', w:'#f0dcb0'}, rows:ICON_ROWS.magicbag.rows};
ICON_ROWS.hugebag = {pal:{p:'#4a7aa8', P:'#1c3a5a', w:'#d0e8ff'}, rows:ICON_ROWS.magicbag.rows};
for(const k of ['bigbag', 'hugebag']){ const d = ICON_ROWS[k]; ICONS[k] = bakeRows(d.rows, Object.assign({k:OUT}, d.pal)); }
const BAG_UPGRADES = [{name:'Mochila grande', price:2000, icon:'bigbag'}, {name:'Mochila enorme', price:5000, icon:'hugebag'}];
function renderBagUpgrades(box){
  const s = G.save, lvl = s.bagUp || 0, up = BAG_UPGRADES[lvl];
  const h = document.createElement('div'); h.className = 'shophead'; h.textContent = up ? 'Mejora de mochila' : 'Tu mochila ya es enorme'; box.append(h);
  if(!up) return;
  const el = document.createElement('div'), can = s.wallet >= up.price; el.className = 'offer special';
  el.innerHTML = `<div class="slot" style="border-color:#e8c070"><img src="${ICONS[up.icon].toDataURL()}" draggable="false"></div><div class="oname" style="color:#e8c070">${up.name}</div><div class="sub">+5 huecos de mochila</div><div class="price ${can ? '' : 'no'}">${up.price} oro</div>`;
  el.onclick = () => {
    if(s.wallet < up.price){ toast('No tienes suficiente oro', 1.6); sfx('ui'); return; }
    s.wallet -= up.price; s.bagUp = lvl + 1; refreshStats(); sfx('coin'); toast(`Compras ${up.name} por ${up.price} oro`, 2); saveGame(); UI.refresh();
  };
  box.append(el);
}
