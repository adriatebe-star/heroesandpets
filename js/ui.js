'use strict';
// =====================================================================
//  Interfaz: avisos, diálogos, inventario con arrastrar y soltar,
//  HUD con bombonas, minimapa y mapa grande
// =====================================================================
const toasts = [];
function toast(msg, dur=2.2){ toasts.push({msg, t:dur, max:dur}); if(toasts.length > 4) toasts.shift(); }

const $ = id => document.getElementById(id);
const iconURL = {};
function itemIconURL(it){
  const key = it.id==='pet' ? 'pet:'+it.pet+(it.shiny ? ':s' : '') : ITEMS[it.id].icon;
  if(!iconURL[key]) iconURL[key] = it.id==='pet' ? (it.shiny ? shinyArt(it.pet)[0] : PET_ART[it.pet].fr[0]).c.toDataURL() : ICONS[ITEMS[it.id].icon].toDataURL();
  return iconURL[key];
}

// ---------- referencias a huecos del inventario ----------
// {area:'bag'|'stash'|'eq', key: índice | 'w1' | 'w2' | 'shield' | 'pet0'..'pet2'}
const PET_LVL = [1, 10, 20, 40];
function getRef(r){
  if(r.area==='safe') return G.save.safeBox && G.save.safeBox[r.key];
  if(r.area==='cage') return G.save.petCage && G.save.petCage[r.key];
  if(r.area==='pbag') return G.inv.equip.pbag[r.key];
  if(r.area==='eq' && String(r.key).startsWith('tal')) return G.inv.equip.tal[+r.key[3]];
  if(r.area==='bag') return G.inv.bag[r.key];
  if(r.area==='stash') return G.save.stash[r.key];
  if(r.key.startsWith('pet')) return G.inv.equip.pet[+r.key[3]];
  return G.inv.equip[r.key];
}
function setRef(r, it){
  if(r.area==='safe'){ if(G.save.safeBox) G.save.safeBox[r.key] = it; }
  else if(r.area==='cage'){ if(G.save.petCage) G.save.petCage[r.key] = it; }
  else if(r.area==='pbag') G.inv.equip.pbag[r.key] = it;
  else if(r.area==='eq' && String(r.key).startsWith('tal')) G.inv.equip.tal[+r.key[3]] = it;
  else if(r.area==='bag') G.inv.bag[r.key] = it;
  else if(r.area==='stash') G.save.stash[r.key] = it;
  else if(r.key.startsWith('pet')) G.inv.equip.pet[+r.key[3]] = it;
  else G.inv.equip[r.key] = it;
}
// devuelve null si el objeto cabe en el hueco, o el motivo si no
function refRejects(r, it, skipKey){
  if(!it) return null;
  if(r.area==='stash') return UI.stashOpen ? null : 'El alijo solo está en la guarida';
  if(r.area==='bag') return null;
  if(r.area==='safe') return it.id === 'pet' ? 'La caja fuerte no guarda mascotas' : (UI.stashOpen ? null : 'La caja fuerte solo está en la guarida');
  if(r.area==='cage') return it.id !== 'pet' ? 'La jaula grande solo guarda mascotas' : (UI.stashOpen ? null : 'La jaula grande solo está en la guarida');
  if(r.area==='pbag') return it.id === 'pet' ? null : 'La mochila mágica solo guarda mascotas';
  if(String(r.key).startsWith('tal')){
    if(it.id === 'pet' || ITEMS[it.id].slot !== 'talisman') return 'Ahí solo van talismanes';
    if(G.inv.equip.tal.some((o, k) => o && o !== it && o.id === it.id && ('tal' + k) !== r.key && ('tal' + k) !== (skipKey || ''))) return 'Ya llevas ese talismán';   // no se pueden llevar dos iguales
    return null;
  }
  if(r.key.startsWith('pet')){
    if(it.id !== 'pet') return 'En este hueco solo van mascotas';
    if(G.inv.equip.pet.some((o, k) => o && o !== it && o.pet === it.pet && ('pet' + k) !== r.key && ('pet' + k) !== (skipKey || ''))) return 'Ya llevas equipada esa mascota';   // sin mascotas repetidas
    const need = PET_LVL[+r.key[3]];
    return G.save.level >= need ? null : `Este hueco se desbloquea a nivel ${need}`;
  }
  if(it.id==='pet') return 'Las mascotas van en los huecos de mascota';
  if(QUICK_SLOTS[r.key]) return QUICK_SLOTS[r.key].includes(it.id) ? null : 'Ahí solo va: ' + QUICK_LABEL[r.key].toLowerCase();
  const d = ITEMS[it.id], want = (r.key==='w1' || r.key==='w2') ? 'weapon' : r.key;
  if(d.slot === 'talisman') return 'Los talismanes van en los huecos de talismán';
  if(d.slot !== want) return `Ahí solo va: ${SLOT_NAME[want].toLowerCase()}`;
  const twoH = o => o && o.id!=='pet' && ITEMS[o.id].twoHanded;
  if(want==='shield' && (twoH(G.inv.equip.w1) || twoH(G.inv.equip.w2))) return 'No puedes llevar escudo con un arma a dos manos';
  if(want==='weapon' && d.twoHanded && G.inv.equip.shield) return 'Un arma a dos manos no permite escudo: quítatelo antes';
  return null;
}
function moveItem(from, to){
  if(from.area===to.area && from.key===to.key) return;
  const a = getRef(from), b = getRef(to);
  if(!a) return;
  if(to.area==='stash' && !b && a.id==='pet' && G.save.petCage){   // una mascota que va al alijo pasa a la jaula grande si hay sitio
    const fi = G.save.petCage.findIndex(x => !x);
    if(fi >= 0) to = {area:'cage', key:fi};
  }
  let why = refRejects(to, a, from.area==='eq' ? from.key : null) || refRejects(from, b, to.area==='eq' ? to.key : null);
  if(why){ toast(why, 1.8); sfx('ui'); return; }
  const d = a.id!=='pet' && ITEMS[a.id];
  if(b && d && d.stack && b.id===a.id && b.n < d.stack){
    const mv = Math.min(d.stack-b.n, a.n); b.n += mv; a.n -= mv;
    if(a.n <= 0) setRef(from, null);
  } else { setRef(to, a); setRef(from, b || null); }
  afterInvChange();
  if(to.area==='eq' && to.key.startsWith('pet')) toast(PETS[a.pet].name + ' te acompaña', 1.5);
}
function afterInvChange(){
  syncPets(); refreshStats(); sfx('equip');
  if(G.sc.kind !== 'raid') saveGame();
  UI.refresh();
}
function dropRef(r){
  const it = getRef(r); if(!it) return;
  if(G.sc.kind==='raid'){ it.noDup = true; dropItem(P.x, P.y, it); setRef(r, null); toast('Has tirado ' + itemName(it), 1.4); }
  else { if(!confirm('¿Tirar ' + itemName(it) + '? Se perderá.')) return; setRef(r, null); }
  afterInvChange();
}

// lo vendido a Trapis se puede recomprar: precio un 50 % mayor (mínimo +2), se guardan los 60 últimos
function noteSold(it, v){ (G.save.sold ??= []).push({item:it, price:Math.max(v + 2, Math.round(v*1.5))}); while(G.save.sold.length > 60) G.save.sold.shift(); }
const QUICK_HINT = {potion:'poción', bandage:'venda', oil:'aceite', cookie:'galleta', mushroom:'seta', elfpotion:'élfica', ammo:'flecha'};
const UI = {
  dlg: null, invOpen: false, screen: null, drag: null,
  blocking(){ return !!this.dlg || this.invOpen || !!this.screen; },

  // ---------- diálogos ----------
  say(who, lines, onDone){
    this.dlg = {who, lines: lines.slice(), i:0, onDone, shown:0};
    $('dialog').classList.remove('hidden');
    this.renderDlg();
  },
  renderDlg(){
    const d = this.dlg; if(!d) return;
    $('dlgWho').textContent = d.who;
    $('dlgOpts').innerHTML = '';
    const line = d.lines[d.i];
    if(typeof line === 'object' && line.ask==='name'){
      $('dlgText').textContent = line.text;
      const inp = document.createElement('input'); inp.maxLength = 14; inp.placeholder = 'Tu nombre'; inp.id = 'nameInput';
      const ok = document.createElement('button'); ok.textContent = 'Aceptar';
      const submit = () => { const v = inp.value.trim(); if(!v) return; inp.blur(); line.fn(v.charAt(0).toUpperCase()+v.slice(1)); sfx('ui'); this.next(); };
      ok.onclick = submit; inp.onkeydown = e => { if(e.key==='Enter') submit(); e.stopPropagation(); };
      $('dlgOpts').append(inp, ok); setTimeout(() => inp.focus(), 30);
      d.waiting = true; return;
    }
    if(typeof line === 'object' && line.choice){
      $('dlgText').textContent = line.text;
      for(const o of line.choice){
        const bt = document.createElement('button'); bt.textContent = o.label;
        bt.onclick = () => { sfx('ui'); this.close(); o.fn && o.fn(); };
        $('dlgOpts').append(bt);
      }
      d.waiting = true; return;
    }
    d.waiting = false; d.full = tr(typeof line === 'function' ? line() : line); d.shown = 0;
    $('dlgText').textContent = '';
    const more = document.createElement('div'); more.className = 'more'; more.textContent = d.i < d.lines.length-1 ? '[F] Continuar' : '[F] Cerrar';
    $('dlgOpts').append(more);
  },
  next(){
    const d = this.dlg; if(!d) return;
    if(!d.waiting && d.shown < d.full.length){ d.shown = d.full.length; $('dlgText').textContent = d.full; return; }
    d.i++; sfx('ui');
    if(d.i >= d.lines.length){ const cb = d.onDone; this.close(); cb && cb(); }
    else this.renderDlg();
  },
  close(){ this.dlg = null; $('dialog').classList.add('hidden'); G.noIntT = .4; },
  updateDlg(dt){
    const d = this.dlg; if(!d || d.waiting) return;
    if(d.shown < d.full.length){
      const before = Math.floor(d.shown);
      d.shown = Math.min(d.full.length, d.shown + dt*55);
      if(Math.floor(d.shown) !== before && before % 2 === 0) sfx('type', .03);
      $('dlgText').textContent = d.full.slice(0, Math.floor(d.shown));
    }
    if(pressed.KeyF || pressed.Space || pressed.Enter || mouse.lp) this.next();
  },

  // ---------- inventario (modo: false | 'stash' | 'shop' | 'druid') ----------
  mode: false,
  get stashOpen(){ return this.invOpen && (this.mode==='stash' || this.mode==='shop' || this.mode==='cage'); },
  toggleInv(mode=false){
    if(this.invOpen){ this.closeInv(); return; }
    this.invOpen = true; this.mode = mode; G.bigMap = false;
    $('inv').classList.remove('hidden');
    $('stashPanel').classList.toggle('hidden', mode!=='stash' && mode!=='shop' && mode!=='cage');
    $('equipPanel').classList.remove('hidden');   // con el mercader el equipo se ve igual que con I o el alijo
    $('inv').classList.toggle('wide', mode==='stash' || mode==='cage');   // con tantos paneles, si no caben en pantalla se puede desplazar
    $('inv').classList.toggle('shopmode', mode==='shop');
    if(mode==='shop'){ this.shopTab = 'buy'; const tb = $('shopTabs'); if(tb) tb.onclick = e => { const b = e.target.closest('button'); if(!b) return; this.shopTab = b.dataset.st; sfx('ui'); this.renderShop(); }; }   // con Trapis: 3 columnas (equipo y mochila · alijo · tienda) ajustadas a la pantalla
    $('shopPanel').classList.toggle('hidden', mode!=='shop');
    $('druidPanel').classList.toggle('hidden', mode!=='druid');
    sfx('ui'); this.refresh(); this.fitInv();
  },
  // con el mercader se escalan los paneles para que todo quepa en pantalla sin desplazarse
  fitInv(){
    const ps = ['equipPanel', 'bagPanel', 'stashPanel', 'shopPanel'].map(id => $(id));
    for(const p of ps){ p.style.zoom = ''; p.style.maxHeight = ''; }
    if(this.mode !== 'shop') return;
    const [eq, bg, st, sh] = ps, totalH = eq.offsetHeight + 14 + bg.offsetHeight, totalW = Math.max(eq.offsetWidth, bg.offsetWidth) + st.offsetWidth + sh.offsetWidth + 48;
    const z = Math.max(.4, Math.min(1, (innerHeight - 24)/totalH, (innerWidth - 24)/totalW));
    if(z < 1) for(const p of ps) p.style.zoom = z.toFixed(3);
    for(const p of [st, sh]) p.style.maxHeight = Math.floor((innerHeight - 24)/z) + 'px';   // alijo y tienda ocupan la altura de la pantalla y se desplazan por dentro si hace falta
  },
  closeInv(){ if(document.activeElement && document.activeElement.blur) document.activeElement.blur(); this.invOpen = false; this.mode = false; $('inv').classList.add('hidden'); $('tip').classList.add('hidden'); this.endDrag(); sfx('ui'); },
  // ---------- tienda de Trapis ----------
  // vende más género según la expedición más alta superada, y compra cualquier objeto (salvo mascotas)
  renderShop(){
    const tier = Math.max(1, G.save.maxExp||1), box = $('shopSlots'), q = ($('shopSearch').value || '').trim().toLowerCase(); box.innerHTML = '';
    document.querySelectorAll('#shopTabs button').forEach(b => b.classList.toggle('on', b.dataset.st === (this.shopTab || 'buy')));
    const offer = (it, price, onBuy, tag) => {
      if(!nameMatch(it, q)) return;
      const d = ITEMS[it.id], el = document.createElement('div'); el.className = 'offer' + (tag ? ' special' : '');
      const can = G.save.wallet >= price;
      el.innerHTML = `<div class="slot" style="border-color:${itemColor(it)}"><img src="${itemIconURL(it)}" draggable="false">${it.n>1?`<span class="cnt">${it.n}</span>`:''}</div>
        <div class="oname" style="color:${itemColor(it)}">${itemName(it)}</div><div class="price ${can?'':'no'}">${price} oro</div>`;
      el.onmouseenter = e => this.showTip(it, e); el.onmousemove = e => this.moveTip(e); el.onmouseleave = () => $('tip').classList.add('hidden');
      el.onclick = onBuy;
      box.append(el);
    };
    if(this.shopTab === 'back'){   // recomprar lo que le has vendido a Trapis (algo más caro)
      const sold = G.save.sold || [];
      if(!sold.length){ const e0 = document.createElement('div'); e0.className = 'shophead'; e0.textContent = 'Aún no le has vendido nada a Trapis.'; box.append(e0); }
      sold.slice().reverse().forEach(s0 => offer(s0.item, s0.price, () => this.buyBack(s0)));
      $('shopNext').textContent = sold.length ? 'Trapis guarda lo que le vendes y te lo devuelve algo más caro.' : '';
      $('sellAll').style.display = 'none';
      return;
    }
    $('sellAll').style.display = '';
    if(!q && typeof renderBagUpgrades === 'function') renderBagUpgrades(box);
    const CAT_ORDER = ['Consumibles', 'Armas', 'Armaduras', 'Farolillos', 'Munición', 'Talismanes', 'Piedras preciosas', 'Llaves', 'Tesoros'];
    const rows = SHOP.filter(o => o.tier <= tier).map(o => { const it = shopItem(o); return {o, it, cat:itemCat(it)}; }).filter(r => nameMatch(r.it, q));
    rows.sort((a, b) => (CAT_ORDER.indexOf(a.cat) + 99) % 99 - (CAT_ORDER.indexOf(b.cat) + 99) % 99);
    let lastCat = null;
    for(const r of rows){
      if(r.cat !== lastCat){ lastCat = r.cat; const h = document.createElement('div'); h.className = 'shophead'; h.textContent = r.cat; box.append(h); }
      offer(r.it, r.o.price, () => this.buy(r.o));
    }
    if(!(G.save.shopSpecials||[]).length) rollShopSpecials();
    const sp = G.save.shopSpecials || [];
    if(sp.length){
      if(!q){ const h = document.createElement('div'); h.className = 'shophead'; h.textContent = 'Ofertas especiales (cambian tras cada expedición)'; box.append(h); }
      sp.forEach((s2, i) => offer(s2.item, s2.price, () => this.buySpecial(i), true));
    }
    const next = SHOP.find(o => o.tier > tier);
    $('shopNext').textContent = next ? `Supera la Expedición ${next.tier} para que Trapis traiga más género.` : '';
    const value = G.inv.bag.concat(G.save.stash).reduce((s,it) => s + (it && it.id!=='pet' && ITEMS[it.id].treasure ? ITEMS[it.id].value : 0), 0);
    const sell = $('sellAll'); sell.textContent = value ? `Vender todos los tesoros (+${value} oro)` : 'No tienes tesoros que vender';
    sell.disabled = !value; sell.onclick = () => this.sellAll();
  },
  buy(o){
    if(G.save.wallet < o.price){ toast('No tienes suficiente oro', 1.6); sfx('ui'); return; }
    const it = shopItem(o);
    if(!addToBagOrStash(it)){ toast('No tienes sitio ni en la mochila ni en el alijo', 1.8); return; }
    G.save.wallet -= o.price; sfx('coin'); toast(`Compras ${itemName(it)} por ${o.price} oro`, 1.6);
    saveGame(); this.refresh();
  },
  buyBack(s0){
    const sold = G.save.sold || [], i = sold.indexOf(s0); if(i < 0) return;
    if(G.save.wallet < s0.price){ toast('No tienes suficiente oro', 1.6); sfx('ui'); return; }
    if(!addToBagOrStash(s0.item)){ toast('No tienes sitio ni en la mochila ni en el alijo', 1.8); return; }
    G.save.wallet -= s0.price; sold.splice(i, 1);
    sfx('coin'); toast(`Recompras ${itemName(s0.item)} por ${s0.price} oro`, 1.8);
    refreshStats(); saveGame(); this.refresh();
  },
  buySpecial(i){
    const s2 = G.save.shopSpecials[i]; if(!s2) return;
    if(G.save.wallet < s2.price){ toast('No tienes suficiente oro', 1.6); sfx('ui'); return; }
    if(!addToBagOrStash(s2.item)){ toast('No tienes sitio ni en la mochila ni en el alijo', 1.8); return; }
    G.save.wallet -= s2.price; G.save.shopSpecials.splice(i, 1);
    sfx('coin'); toast(`Compras ${itemName(s2.item)} por ${s2.price} oro`, 1.8);
    saveGame(); this.refresh();
  },
  sell(ref){
    const it = getRef(ref);
    if(!it) return;
    if(ref.area==='eq'){ toast('Quítatelo antes de venderlo', 1.6); sfx('ui'); return; }
    if(it.id !== 'pet' && ITEMS[it.id] && ITEMS[it.id].quest){ toast('Los objetos de misión no se pueden vender', 1.8); sfx('ui'); return; }
    const v = sellValue(it);
    if(it.id==='pet' && (it.shiny || ['rare','legendary'].includes(PETS[it.pet].rarity)) && !confirm(`¿Vender a ${itemName(it)} por ${v} oro? Podrás recomprarla en la pestaña Recomprar.`)) return;
    G.save.wallet += v; setRef(ref, null); noteSold(it, v);
    sfx('coin'); toast(`Vendes ${itemName(it)} por ${v} oro`, 1.8);
    refreshStats(); saveGame(); this.refresh();
  },
  sellAll(){
    let total = 0;
    for(const arr of [G.inv.bag, G.save.stash]) arr.forEach((it,i) => { if(it && it.id!=='pet' && ITEMS[it.id].treasure){ total += ITEMS[it.id].value; noteSold(it, ITEMS[it.id].value); arr[i] = null; } });
    if(!total) return;
    G.save.wallet += total; sfx('coin'); toast(`Has vendido tus tesoros por ${total} oro`, 2);
    saveGame(); this.refresh();
  },
  // ---------- alijo: 100 huecos, mostrado por categorías ----------
  renderStash(){
    const st = $('stashSlots'); st.innerHTML = '';
    $('stashPanel').querySelector('h3').firstChild.textContent = this.mode==='cage' ? 'Jaula grande (mascotas) ' : 'Alijo (a salvo) ';
    const q = (this.stashQ || '').trim().toLowerCase(), div = (cls, txt) => { const d = document.createElement('div'); d.className = cls; if(txt !== undefined) d.textContent = txt; return d; };
    // mascotas agrupadas por nivel de expedición (de menor a mayor); `free` = huecos libres de la jaula
    const petGroups = (arr, area, idxs, free) => {
      const by = {};
      for(const i of idxs) (by[petTier(PETS[arr[i].pet])] ??= []).push(i);
      for(const lv of Object.keys(by).map(Number).sort((a, c) => a - c)){
        const idx = by[lv].sort((a, c) => PETS[arr[a].pet].name.localeCompare(PETS[arr[c].pet].name));
        const h = div('cathead lvl'); const b = document.createElement('span'); b.className = 'lvbadge'; b.textContent = 'Nv ' + lv; h.append(b, `(${idx.length})`); st.append(h);
        const g = div('slots grid10'); for(const i of idx) g.append(this.slotEl({area, key:i}, '', {hint:'mascota', cls:'petslot'})); st.append(g);
      }
      if(free && free.length){ st.append(div('cathead lvl', `Huecos libres (${free.length})`)); const g = div('slots grid10'); for(const i of free) g.append(this.slotEl({area, key:i}, '', {hint:'mascota', cls:'petslot'})); st.append(g); }
    };
    const cageIdx = () => { const cg = G.save.petCage || [], idx = [], free = []; cg.forEach((it, i) => { if(it){ if(nameMatch(it, q)) idx.push(i); } else free.push(i); }); return {cg, idx, free}; };
    if(this.mode==='cage'){   // la jaula grande se abre sola desde su sitio en la guarida
      const {cg, idx, free} = cageIdx(); petGroups(cg, 'cage', idx, q ? [] : free);
      if(q && !idx.length) st.append(div('empty', 'Ninguna mascota coincide con la búsqueda.'));
      $('stashCount').textContent = `${cg.filter(Boolean).length} / ${cg.length}`; return;
    }
    const groups = {};
    G.save.stash.forEach((it, i) => { if(it && nameMatch(it, q)){ const c = itemCat(it); (groups[c] ??= []).push(i); } });
    let shown = 0;
    for(const cat of ITEM_CATS){
      const idx = groups[cat]; if(!idx) continue; shown += idx.length;
      st.append(div('cathead', `${cat} (${idx.length})`));
      if(cat === 'Mascotas'){ petGroups(G.save.stash, 'stash', idx, null); continue; }
      idx.sort((a,c) => itemName(G.save.stash[a]).localeCompare(itemName(G.save.stash[c])));
      const grid = div('slots grid10');
      for(const i of idx) grid.append(this.slotEl({area:'stash', key:i}));
      st.append(grid);
    }
    if(G.save.petCage){   // jaula grande: alijo de hasta 100-200 mascotas
      const {cg, idx, free} = cageIdx();
      if(!q || idx.length){ shown += idx.length; st.append(div('cathead', `Jaula grande (${cg.filter(Boolean).length} / ${cg.length} mascotas)`)); petGroups(cg, 'cage', idx, q ? [] : free); }
    }
    if(G.save.safeBox){   // caja fuerte: 40 huecos para el mejor equipo
      const sb = G.save.safeBox, idx = []; sb.forEach((it, i) => { if(!it || nameMatch(it, q)) idx.push(i); });
      if(!q || idx.some(i => sb[i])){ st.append(div('cathead', `Caja fuerte (${sb.filter(Boolean).length} / ${sb.length})`)); const g = div('slots grid10'); for(const i of idx) if(!q || sb[i]) g.append(this.slotEl({area:'safe', key:i})); st.append(g); shown += idx.filter(i => sb[i]).length; }
    }
    const used = G.save.stash.filter(Boolean).length;
    if(!used && !q){ st.append(div('empty', 'El alijo está vacío. Arrastra aquí lo que quieras guardar.')); }
    else if(q && !shown) st.append(div('empty', 'Nada coincide con la búsqueda.'));
    $('stashCount').textContent = `${used} / ${G.save.stash.length}`;
  },
  // ---------- el druida ----------
  renderDruid(){
    const box = $('druidList'); box.innerHTML = '';
    const fallen = G.save.fallen;
    if(!fallen.length){ box.innerHTML = '<div class="empty">Ninguna mascota ha caído... de momento.<br>Solo puedo devolver la vida a las mascotas que ya conocían la guarida.</div>'; return; }
    fallen.forEach((id, i) => {
      const p = PETS[id], cost = reviveBase(id), can = G.save.wallet >= cost;
      const row = document.createElement('div'); row.className = 'fallen';
      row.innerHTML = `<div class="slot ghost"><img class="pet" src="${itemIconURL({id:'pet', pet:id})}" draggable="false"></div>
        <div class="fname"><b style="color:${RARITY[p.rarity].col}">${p.name}</b><span>${RARITY[p.rarity].name} · ${p.look}</span></div>
        <button ${can?'':'disabled'}>Revivir · ${cost} oro</button>`;
      row.querySelector('button').onclick = () => this.revive(i);
      row.onmouseenter = e => this.showTip(mkPetItem(id), e); row.onmousemove = e => this.moveTip(e); row.onmouseleave = () => $('tip').classList.add('hidden');
      box.append(row);
    });
  },
  revive(i){
    const id = G.save.fallen[i], cost = reviveBase(id);
    if(G.save.wallet < cost){ toast('No tienes suficiente oro', 1.6); return; }
    const it = mkPetItem(id, true);
    if(!addToBagOrStash(it)){ toast('No tienes sitio ni en la mochila ni en el alijo', 2); return; }
    G.save.wallet -= cost; G.save.fallen.splice(i, 1);
    sfx('cage'); toast(`¡${PETS[id].name} ha vuelto a la vida!`, 2.5);
    saveGame(); this.refresh();
  },
  slotEl(ref, label, extra={}){
    const it = getRef(ref);
    const el = document.createElement('div'); el.className = 'slot' + (extra.cls ? ' '+extra.cls : '');
    el.dataset.area = ref.area; el.dataset.key = ref.key;
    if(label){ const l = document.createElement('span'); l.className = 'lbl'; l.textContent = label; el.append(l); }
    if(extra.locked){ el.classList.add('locked'); const l = document.createElement('span'); l.className = 'lock'; l.textContent = 'Nv ' + extra.locked; el.append(l); return el; }
    if(extra.hint && !it){ const h = document.createElement('span'); h.className = 'hint'; h.textContent = extra.hint; el.append(h); }
    if(it){
      const img = document.createElement('img'); img.src = itemIconURL(it); img.draggable = false; if(it.id==='pet') img.className = 'pet';
      el.append(img);
      el.style.borderColor = itemColor(it);
      if((it.affixes || []).some(a => a.forged)) el.classList.add('forged');
      if(it.n > 1){ const n = document.createElement('span'); n.className = 'cnt'; n.textContent = it.n; el.append(n); }
      if(it.dur !== undefined){ const bar = document.createElement('i'); bar.className = 'dur'; bar.style.width = (it.dur/maxDur(it)*100)+'%'; el.append(bar); }
      if(this.mode==='shop' && (ref.area==='bag' || ref.area==='stash')){ const v = sellValue(it); if(v){ const pr = document.createElement('span'); pr.className = 'sellp'; pr.textContent = v; el.append(pr); } }
      if(it.id==='pet'){ const bar = document.createElement('i'); bar.className = 'dur hp'; bar.style.width = (it.hp/PETS[it.pet].hp*100)+'%'; el.append(bar); const lv = document.createElement('span'); lv.className = 'plv'; lv.textContent = 'Nv ' + petTier(PETS[it.pet]); el.append(lv); }
      el.onmouseenter = e => { if(!this.drag) this.showTip(it, e); };
      el.onmousemove = e => { if(!this.drag) this.moveTip(e); };
      el.onmouseleave = () => $('tip').classList.add('hidden');
      el.onmousedown = e => { if(e.button===0){ e.preventDefault(); if(e.shiftKey && it.n > 1 && ref.area !== 'eq'){ this.splitStack(ref); return; } this.drag = {ref, x0:e.clientX, y0:e.clientY, started:false}; } };
    }
    el.oncontextmenu = e => { e.preventDefault(); if(it) dropRef(ref); };
    return el;
  },
  // Mayús + clic izquierdo: divide la pila por la mitad en el primer hueco libre del mismo sitio (mochila o alijo)
  splitStack(ref){
    const it = getRef(ref); if(!it || !(it.n > 1)) return;
    const arr = ref.area==='stash' ? G.save.stash : G.inv.bag, free = arr.findIndex(x => !x);
    if(free < 0){ toast(ref.area==='stash' ? 'El alijo está lleno' : 'La mochila está llena', 1.4); return; }
    const half = Math.floor(it.n/2); it.n -= half; arr[free] = Object.assign({}, it, {n:half});
    sfx('ui'); afterInvChange();
  },
  refresh(){
    if(!this.invOpen) return;
    const E = G.inv.equip, lvl = G.save.level;
    this.renderDoll();
    // con el mercader el equipo se ve justo encima de la mochila
    $('eqRowBox').classList.add('hidden');
    if(false){
      const row = $('eqRow'); row.innerHTML = '';
      const lvl = G.save.level;
      const H = {w1:'arma 1', w2:'arma 2', shield:'escudo', head:'casco', chest:'pechera', hands:'guantes', feet:'botas', lantern:'farol'};
      for(const k in H) row.append(this.slotEl({area:'eq', key:k}, '', {hint:H[k]}));
      for(const k in QUICK_SLOTS) row.append(this.slotEl({area:'eq', key:k}, '', {hint:QUICK_HINT[k], cls:'qk'}));
      for(let i=0;i<4;i++) row.append(this.slotEl({area:'eq', key:'pet'+i}, '', lvl < PET_LVL[i] ? {locked:PET_LVL[i]} : {hint:'mascota', cls:'petslot'}));
    }
    const bag = $('bagSlots'); bag.innerHTML = '';
    G.inv.bag.forEach((it, i) => bag.append(this.slotEl({area:'bag', key:i})));
    const pbb = $('pbagBox'); pbb.innerHTML = '';
    if(G.save.magicBag){   // mochila mágica: 5 huecos solo para mascotas
      const hd = document.createElement('div'); hd.className = 'sub'; hd.textContent = 'Mochila mágica (solo mascotas)'; pbb.append(hd);
      const gr = document.createElement('div'); gr.className = 'slots grid5'; G.inv.equip.pbag.forEach((it, i) => gr.append(this.slotEl({area:'pbag', key:i}, '', {hint:'mascota', cls:'petslot'}))); pbb.append(gr);
    }
    if(this.stashOpen) this.renderStash();
    if(this.mode==='shop') this.renderShop();
    if(this.mode==='druid') this.renderDruid();
    const gold = G.sc.kind==='raid' ? `Oro en la expedición: ${G.raidGold}` : `Oro en la guarida: ${G.save.wallet}`;
    $('invGold').textContent = gold;
    for(const id of ['shopGold','druidGold']) $(id).textContent = gold;
    if(this.mode === 'shop') this.fitInv();
    $('invHint').textContent = this.mode==='shop'
      ? 'Clic en un artículo: comprar · Clic en un tesoro o arrástralo a Trapis: vender'
      : 'Arrastra los objetos para moverlos o equiparlos · Clic: equipar / usar / quitar · Clic derecho o soltar fuera: tirar';
  },
  // ---------- panel de equipo estilo Diablo: retrato del héroe y huecos alrededor ----------
  renderDoll(){
    const E = G.inv.equip, lvl = G.save.level;
    const eq = $('equipSlots'); eq.innerHTML = ''; eq.className = 'doll';
    const pc = document.createElement('canvas'); pc.className = 'portrait'; pc.width = 44; pc.height = 50;
    drawPortrait(pc); eq.append(pc);
    const put = (el, x, y) => { el.style.left = x+'px'; el.style.top = y+'px'; eq.append(el); };
    put(this.slotEl({area:'eq', key:'head'},  'Casco',   {hint:'casco'}),   118, 22);
    put(this.slotEl({area:'eq', key:'chest'}, 'Pechera', {hint:'pechera'}), 118, 112);
    put(this.slotEl({area:'eq', key:'feet'},  'Botas',   {hint:'botas'}),   118, 202);
    put(this.slotEl({area:'eq', key:'w1'}, 'Arma 1' + (G.activeW===0?' ●':''), {cls: G.activeW===0 ? 'active' : '', hint:'arma'}), 12, 70);
    put(this.slotEl({area:'eq', key:'w2'}, 'Arma 2' + (G.activeW===1?' ●':''), {cls: G.activeW===1 ? 'active' : '', hint:'arma'}), 12, 160);
    put(this.slotEl({area:'eq', key:'shield'}, 'Escudo',   {hint:'escudo'}),   224, 70);
    put(this.slotEl({area:'eq', key:'hands'},  'Guantes',  {hint:'guantes'}),  224, 160);
    put(this.slotEl({area:'eq', key:'lantern'}, 'Farolillo', {hint:'farol'}), 224, 238);
    [[12, 8], [60, 8], [248, 8]].forEach(([tx, ty], i) => put(this.slotEl({area:'eq', key:'tal'+i}, '', {hint:'talismán', cls:'qk'}), tx, ty));   // 3 huecos pequeños de talismán
    for(let i=0;i<4;i++) put(this.slotEl({area:'eq', key:'pet'+i}, 'Mascota '+(i+1), lvl < PET_LVL[i] ? {locked:PET_LVL[i]} : {hint:'mascota', cls:'petslot'}), 12 + i*74, 322);
    // cinturón de uso rápido: pociones, vendas, aceite, galletas, setas, poción élfica y munición
    const bh = document.createElement('div'); bh.className = 'qkh'; bh.textContent = 'Cinturón de uso rápido'; put(bh, 12, 392);
    Object.keys(QUICK_SLOTS).forEach((k, i) => put(this.slotEl({area:'eq', key:k}, '', {hint:QUICK_HINT[k], cls:'qk'}), 12 + (i%7)*41, 412 + Math.floor(i/7)*44));   // 7 por fila
    // hoja de personaje
    const st = G.stats || gearStats(), w = curWeapon(), wd = w && ITEMS[w.id];
    const wdm = w && weaponDmg(w), dmg = !w ? `${8+st.fist}-${13+st.fist}` : wdm ? `${wdm[0]+st.dmg}-${wdm[1]+st.dmg}` : '6-9';
    const rows = [
      ['Nivel', lvl], ['Vida', `${Math.ceil(P.hp)} / ${P.maxHp}`], ['Estamina', P.stMax],
      ['Armadura', `${st.armor} (−${Math.round(armorReduction(st.armor)*100)} % daño)`],
      ['Daño', w && w.sharp ? `<span class="sharp">${dmg}</span>` : `${dmg}${w ? '' : ' (puños)'}`], ['Crítico', `${12+st.crit} %`],
      st.aspd && ['Vel. de ataque', `+${st.aspd} %`], st.move && ['Movimiento', `+${st.move} %`],
      st.leech && ['Robo de vida', `${st.leech} %`], st.sreg && ['Reg. estamina', `+${st.sreg} %`],
      st.gold && ['Oro encontrado', `+${st.gold} %`], st.oil && ['Consumo de aceite', `−${st.oil} %`],
      st.petdmg && ['Daño de mascotas', `+${st.petdmg} %`], st.thorns && ['Espinas', st.thorns],
      st.eleRes && ['Resist. elemental', `${st.eleRes} %`], st.poisRes && ['Resist. veneno', `${st.poisRes} %`], st.bleedRes && ['Resist. sangrado', `${st.bleedRes} %`], st.hpreg && ['Reg. de vida (equipo)', `${st.hpreg}/s`],
      (TT('es') || MS('agi',10)) && ['Esquivar golpes', `${Math.round((TT('es') + (MS('agi',10) ? 5 : 0))*10)/10} %`], TT('hr') && ['Reg. de vida', `${TT('hr').toFixed(1)}/s`],
      (G.save.skillPts||0) && ['Puntos de Gonzalo', `${G.save.skillPts} sin gastar`],
    ].filter(Boolean);
    $('charStats').innerHTML = rows.map(([k,v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('');
  },
  // clic sin arrastrar
  clickRef(ref){
    const it = getRef(ref); if(!it) return;
    const E = G.inv.equip;
    if(ref.area==='eq' && QUICK_SLOTS[ref.key] && ref.key !== 'ammo' && this.mode !== 'shop' && !this.stashOpen){ useConsumable(it.id); return; }   // clic en el cinturón: usar
    if(ref.area==='eq'){ // quitar equipo a la mochila (o al alijo si está abierto)
      const dest = this.stashOpen ? G.save.stash : G.inv.bag;
      if(!addTo(dest, it)){ toast(this.stashOpen ? 'El alijo está lleno' : 'La mochila está llena'); return; }
      setRef(ref, null); afterInvChange(); return;
    }
    if(ref.area==='stash' || ref.area==='cage' || ref.area==='safe'){
      if(this.mode==='shop'){ this.sell(ref); return; }
      if(autoEquip(it)){ setRef(ref, null); afterInvChange(); toast('Equipas ' + itemName(it), 1.4); return; }
      if(!addTo(G.inv.bag, it)){ toast('La mochila está llena'); return; }
      setRef(ref, null); afterInvChange(); return;
    }
    if(this.mode==='shop'){ this.sell(ref); return; }
    if(this.stashOpen){
      if(this.mode==='cage'){ if(it.id !== 'pet'){ toast('La jaula grande solo guarda mascotas', 1.6); return; } if(!addTo(G.save.petCage || [], it)){ toast('La jaula grande está llena'); return; } setRef(ref, null); afterInvChange(); return; }
      if(it.id==='pet' && G.save.petCage && addTo(G.save.petCage, it)){ setRef(ref, null); afterInvChange(); return; }
      if(!addTo(G.save.stash, it)){ toast('El alijo está lleno'); return; }
      setRef(ref, null); afterInvChange(); return;
    }
    if(it.id==='pet'){
      const slots = petSlots(G.save.level);
      let idx = E.pet.findIndex((p,k) => !p && k < slots); if(idx < 0) idx = 0;
      moveItem(ref, {area:'eq', key:'pet'+idx}); return;
    }
    const d = ITEMS[it.id];
    if(d.slot==='weapon'){
      for(const k of ['w1','w2']) if(it.id==='stone' && E[k] && E[k].id==='stone' && E[k].n < d.stack){ moveItem(ref, {area:'eq', key:k}); return; }
      moveItem(ref, {area:'eq', key: !E.w1 ? 'w1' : !E.w2 ? 'w2' : (G.activeW===0 ? 'w1' : 'w2')});
    } else if(d.slot && d.slot!=='weapon') moveItem(ref, {area:'eq', key:d.slot});
    else if(d.kind==='ammo') moveItem(ref, {area:'eq', key:'ammo'});
    else if(d.use) useConsumable(it.id);
    else toast('Los tesoros se podrán vender más adelante', 1.6);
  },
  // arrastrar y soltar
  dragMove(e){
    const d = this.drag; if(!d) return;
    if(!d.started && Math.hypot(e.clientX-d.x0, e.clientY-d.y0) > 5){
      d.started = true; $('tip').classList.add('hidden');
      const g = d.ghost = document.createElement('img'); g.id = 'dragGhost'; g.src = itemIconURL(getRef(d.ref));
      document.body.append(g);
      const src = document.querySelector(`.slot[data-area="${d.ref.area}"][data-key="${d.ref.key}"]`); if(src) src.classList.add('dragging');
      document.body.classList.add('isDragging');
    }
    if(d.started){
      d.ghost.style.left = e.clientX+'px'; d.ghost.style.top = e.clientY+'px';
      document.querySelectorAll('.slot.over').forEach(s => s.classList.remove('over'));
      const t = this.slotAt(e.clientX, e.clientY);
      if(t){ const ok = !refRejects({area:t.dataset.area, key:t.dataset.area==='eq' ? t.dataset.key : +t.dataset.key}, getRef(d.ref)); t.classList.add('over'); t.classList.toggle('bad', !ok); }
    }
  },
  slotAt(x, y){ const el = document.elementFromPoint(x, y); return el ? el.closest('.slot[data-area]') : null; },
  dragEnd(e){
    const d = this.drag; if(!d) return;
    this.drag = null;
    if(!d.started){ this.clickRef(d.ref); this.endDrag(); return; }
    const t = this.slotAt(e.clientX, e.clientY);
    const el = document.elementFromPoint(e.clientX, e.clientY);
    this.endDrag();
    if(t) moveItem(d.ref, {area:t.dataset.area, key: t.dataset.area==='eq' ? t.dataset.key : +t.dataset.key});
    else if(el && el.closest('#shopPanel')) this.sell(d.ref);
    else if(el && el.closest('#stashPanel') && d.ref.area!=='stash'){ const it = getRef(d.ref); if(addTo(G.save.stash, it)){ setRef(d.ref, null); afterInvChange(); } else toast('El alijo está lleno'); }
    else if(el && !el.closest('.panel')) dropRef(d.ref);
  },
  endDrag(){
    const g = $('dragGhost'); if(g) g.remove();
    document.querySelectorAll('.slot.over,.slot.dragging').forEach(s => s.classList.remove('over','bad','dragging'));
    document.body.classList.remove('isDragging');
  },
  showTip(it, e){
    const t = $('tip'); let h = `<b style="color:${itemColor(it)}">${itemName(it)}</b>`;
    if(it.id==='pet'){
      const p = PETS[it.pet];
      h += `<div class="sub">Mascota ${RARITY[p.rarity].name.toLowerCase()} · ${p.look}</div><div class="sub">Nivel de la mascota: ${petTier(p)}</div>`;
      const kd = petDmgMult(it);
      if(it.shiny) h += `<div style="color:#ff9ad8">★ Brillante: +10 % de estadísticas</div>`;
      if(it.serums && it.serums.rage) h += `<div style="color:#ff8a7a">💉 Rabia: +33 % de daño</div>`;
      if(it.serums && it.serums.super) h += `<div style="color:#7affc0">💉 Supermascota: +20 % de estadísticas</div>`;
      h += `<div>Vida: ${Math.ceil(it.hp)} / ${petMaxHp(it)}</div><div>Daño: ${Math.round(p.dmg[0]*kd)}-${Math.round(p.dmg[1]*kd)}</div>`;
      h += `<div class="atk">${p.attack}</div>`;
      for(const a of p.affixes) h += `<div class="aff">◆ ${PET_AFFIX[a].name}: ${PET_AFFIX[a].desc}</div>`;
      for(const a of it.xaff || []) h += `<div class="aff lava">◆ ${PET_AFFIX[a].name}: ${PET_AFFIX[a].desc}</div>`;
      h += it.homed ? `<div class="sub">Conoce la guarida: si cae, Chemma, el druida, puede revivirla.</div>`
                    : `<div class="red">Aún no conoce la guarida: si cae antes de volver, se perderá para siempre.</div>`;
      h += `<div class="sub">Arrástrala a un hueco de mascota para que te acompañe</div>`;
    } else {
      const d = ITEMS[it.id];
      const kind = d.treasure ? 'Tesoro · valor ' + d.value + ' oro' : (d.ammo || d.kind==='ammo') ? 'Munición' : d.slot ? SLOT_NAME[d.slot] : 'Consumible';
      h += `<div class="sub">${it.rarity ? RARITY[it.rarity].name + ' · ' : ''}${kind}${it.name ? ' · ' + d.name : ''}</div>`;
      if(d.dmg){ const dm = weaponDmg(it); h += it.sharp ? `<div>Daño: <span class="sharp">${dm[0]}-${dm[1]}</span> <span class="sharp">(afilada +${it.sharp})</span></div>` : `<div>Daño: ${dm[0]}-${dm[1]}</div>`; }
      if(d.armor) h += `<div>Armadura: ${d.armor}</div>`;
      if(d.move) h += d.move > 0 ? `<div>+${d.move} % de velocidad de movimiento</div>` : `<div class="neg">-${-d.move} % de velocidad de movimiento</div>`;
      for(const a of it.affixes || []) h += `<div class="aff${a.forged ? ' lava' : ''}">◆ ${ITEM_AFFIX[a.k].desc(a.v, a.w)}</div>`;
      if(it.gem && typeof GEMS !== 'undefined' && GEMS[it.gem]) h += `<div class="aff" style="color:${GEMS[it.gem].col}">◆ ${GEMS[it.gem].name}: ${GEMS[it.gem].desc}</div>`;
      h += `<div class="desc">${d.desc}</div>`;
      if(it.dur !== undefined) h += `<div class="sub">Durabilidad: ${it.dur} / ${maxDur(it)}</div>`;
      if(it.n > 1) h += `<div class="sub">Cantidad: ${it.n}</div>`;
    }
    if(this.mode==='shop'){ const v = sellValue(it); if(v) h += `<div style="color:#ffe08a">Trapis te da: ${v} oro${it.n > 1 ? ' (todas)' : ''}</div>`; }
    t.innerHTML = h; t.classList.remove('hidden'); this.moveTip(e);
  },
  moveTip(e){ const t = $('tip'); t.style.left = Math.min(innerWidth-270, e.clientX+16)+'px'; t.style.top = Math.min(innerHeight-t.offsetHeight-10, e.clientY+12)+'px'; },

  // ---------- pantallas ----------
  showScreen(html, btn, fn){
    this.screen = true;
    const s = $('screen'); s.innerHTML = `<div class="box">${html}<button id="scrBtn">${btn}</button></div>`; s.classList.remove('hidden');
    $('scrBtn').onclick = () => { s.classList.add('hidden'); this.screen = null; sfx('ui'); fn && fn(); };
  },
};
addEventListener('mousemove', e => UI.dragMove(e));
addEventListener('mouseup', e => { if(e.button===0) UI.dragEnd(e); });

// ---------- mochila ----------
function addTo(arr, it){
  const d = it.id==='pet' ? null : ITEMS[it.id];
  if(d && d.stack){
    for(const o of arr) if(o && o.id===it.id && o.n < d.stack){ const mv = Math.min(d.stack-o.n, it.n); o.n += mv; it.n -= mv; if(it.n<=0) return true; }
  }
  const i = arr.indexOf(null); if(i < 0) return false;
  arr[i] = it; return true;
}
// autoequipa el objeto si su hueco está libre; si no, va a la mochila
function autoEquip(it){
  const E = G.inv.equip;
  if(it.id === 'pet'){
    const slots = petSlots(G.save.level), idx = E.pet.findIndex((p, k) => !p && k < slots);
    if(E.pet.some(o => o && o.pet === it.pet)) return false;   // ya llevas esa mascota
    if(idx >= 0){ E.pet[idx] = it; return true; }
    return false;
  }
  const qk = Object.keys(QUICK_SLOTS).find(k => QUICK_SLOTS[k].includes(it.id));   // consumibles y munición: al cinturón si hay hueco
  if(qk){
    const cur = E[qk], dq = ITEMS[it.id];
    if(!cur){ E[qk] = it; return true; }
    if(cur.id === it.id && cur.n < dq.stack){ const mv = Math.min(dq.stack - cur.n, it.n); cur.n += mv; it.n -= mv; return it.n <= 0; }
    return false;
  }
  const d = ITEMS[it.id]; if(!d || !d.slot || d.stack) return false;
  if(d.slot === 'talisman'){ if(E.tal.some(o => o && o.id === it.id)) return false; const k = E.tal.findIndex(x => !x); if(k >= 0){ E.tal[k] = it; return true; } return false; }
  const twoH = o => o && ITEMS[o.id].twoHanded;
  if(d.slot === 'shield' && (twoH(E.w1) || twoH(E.w2))) return false;
  if(d.twoHanded && E.shield) return false;
  if(d.slot === 'weapon'){ const k = !E.w1 ? 'w1' : !E.w2 ? 'w2' : null; if(k){ E[k] = it; return true; } return false; }
  if(!E[d.slot]){ E[d.slot] = it; return true; }
  return false;
}
// mete un objeto recogido o comprado: autoequipa si hay hueco, si no a la mochila
function addToBag(it){
  const eq = autoEquip(it), pb = !eq && it.id === 'pet' && G.save.magicBag && G.inv.equip.pbag.indexOf(null) >= 0, ok = eq || (pb ? (G.inv.equip.pbag[G.inv.equip.pbag.indexOf(null)] = it, true) : addTo(G.inv.bag, it));
  if(eq){ afterInvChange(); toast('Equipas ' + itemName(it), 1.6); } else UI.refresh();
  return ok;
}
function addToBagOrStash(it){ return addToBag(it) || addTo(G.save.stash, it); }

// =====================================================================
//  HUD
// =====================================================================
const S = 2;   // escala de los textos del HUD
function textO(t, x, y, col){
  ctx.fillStyle = '#0c0a0e';
  for(const [dx,dy] of [[-S,0],[S,0],[0,-S],[0,S]]) ctx.fillText(t, x+dx, y+dy);
  ctx.fillStyle = col || '#f4ecd8'; ctx.fillText(t, x, y);
}
function hudFrame(x, y, w, h){
  ctx.fillStyle = '#0c0a0e'; ctx.fillRect(x-S*2, y-S*2, w+S*4, h+S*4);
  ctx.fillStyle = '#5a4a36'; ctx.fillRect(x-S, y-S, w+S*2, h+S*2);
  ctx.fillStyle = '#1a1418'; ctx.fillRect(x, y, w, h);
}
// bombona de cristal con líquido ondulante, burbujas, brillo y aro de metal
const ORB = {
  hp:   ['#ff7a7a','#d02a3a','#5a0a14'],
  pet:  ['#ff7a7a','#d02a3a','#5a0a14'],          // vida de las mascotas: rojo
  st:   ['#ffc070','#f07a1a','#6a2a04'],           // estamina: naranja
  oil:  ['#fff09a','#e8b020','#6a4a08'],
  off:  ['#8a8a8a','#4a4a4a','#1a1a1a'],
};
function drawOrb(cx, cy, r, frac, pal, o={}){
  frac = clamp(frac, 0, 1);
  ctx.save();
  // aro de metal
  const rim = ctx.createLinearGradient(cx, cy-r-8, cx, cy+r+8);
  rim.addColorStop(0, '#c8a868'); rim.addColorStop(.5, '#7a5e36'); rim.addColorStop(1, '#3a2a18');
  ctx.beginPath(); ctx.arc(cx, cy, r + Math.max(4, r*.13), 0, Math.PI*2); ctx.fillStyle = '#0c0a0e'; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r + Math.max(3, r*.1), 0, Math.PI*2); ctx.fillStyle = rim; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r+1, 0, Math.PI*2); ctx.fillStyle = '#0c0a0e'; ctx.fill();
  // interior
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.clip();
  const bg = ctx.createRadialGradient(cx, cy, r*.2, cx, cy, r); bg.addColorStop(0, '#1e1a22'); bg.addColorStop(1, '#08070a');
  ctx.fillStyle = bg; ctx.fillRect(cx-r, cy-r, r*2, r*2);
  if(frac > 0){
    const lvl = cy + r - 2*r*frac, t = G.t*(o.speed||2.2), amp = Math.max(1.5, r*.06)*(frac<.98 ? 1 : .3);
    ctx.beginPath(); ctx.moveTo(cx-r, cy+r);
    for(let i=0;i<=24;i++){ const x = cx-r + i/24*2*r; ctx.lineTo(x, lvl + Math.sin(t + i*.55)*amp + Math.sin(t*1.7 + i*.9)*amp*.5); }
    ctx.lineTo(cx+r, cy+r); ctx.closePath();
    const lg = ctx.createLinearGradient(0, lvl, 0, cy+r); lg.addColorStop(0, pal[0]); lg.addColorStop(.35, pal[1]); lg.addColorStop(1, pal[2]);
    ctx.fillStyle = lg; ctx.fill();
    if(o.shield > 0){   // escudo (azul) sobre el nivel de vida
      const l2 = cy + r - 2*r*Math.min(1, frac + o.shield);
      ctx.beginPath(); ctx.moveTo(cx-r, lvl + 2);
      for(let i=0;i<=24;i++){ const x = cx-r + i/24*2*r; ctx.lineTo(x, l2 + Math.sin(t*1.3 + i*.6)*amp*.7); }
      ctx.lineTo(cx+r, lvl + 2); ctx.closePath();
      const sg = ctx.createLinearGradient(0, l2, 0, lvl); sg.addColorStop(0, 'rgba(190,225,255,.85)'); sg.addColorStop(1, 'rgba(70,130,230,.75)');
      ctx.fillStyle = sg; ctx.fill();
    }
    // superficie brillante
    ctx.beginPath();
    for(let i=0;i<=24;i++){ const x = cx-r + i/24*2*r, y = lvl + Math.sin(t + i*.55)*amp + Math.sin(t*1.7 + i*.9)*amp*.5; i ? ctx.lineTo(x,y) : ctx.moveTo(x,y); }
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = Math.max(1, r*.04); ctx.stroke();
    // burbujas
    const nb = Math.round(r/7);
    for(let i=0;i<nb;i++){
      const ph = (G.t*.35*(1+i%3*.3) + i*.37) % 1, bx = cx + Math.sin(i*7.3 + G.t*.8)*r*.55;
      const by = cy + r - ph*(2*r*frac); if(by < lvl+3) continue;
      ctx.beginPath(); ctx.arc(bx, by, Math.max(1, r*.045*(1+i%2)), 0, Math.PI*2); ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fill();
    }
  }
  // sombreado de esfera y brillos del cristal
  const sh = ctx.createRadialGradient(cx - r*.3, cy - r*.35, r*.1, cx, cy, r*1.05);
  sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(.7, 'rgba(0,0,0,.05)'); sh.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = sh; ctx.fillRect(cx-r, cy-r, r*2, r*2);
  ctx.beginPath(); ctx.ellipse(cx - r*.32, cy - r*.42, r*.36, r*.2, -.6, 0, Math.PI*2); ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fill();
  ctx.beginPath(); ctx.arc(cx - r*.5, cy - r*.5, Math.max(1.5, r*.07), 0, Math.PI*2); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fill();
  ctx.beginPath(); ctx.arc(cx + r*.45, cy + r*.45, r*.12, 0, Math.PI*2); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill();
  if(o.flash){ ctx.fillStyle = `rgba(255,60,60,${o.flash})`; ctx.fillRect(cx-r, cy-r, r*2, r*2); }
  ctx.restore();
  // textos
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if(o.value !== undefined){ ctx.font = `${Math.max(8, Math.round(r*.3))}px ${FONT}`; textO(o.value, cx, cy+1); }
  if(o.label){ ctx.font = `${Math.round(7*S*(o.hs||1))}px ${FONT}`; textO(o.label, cx, cy + r + Math.round(18*(o.hs||1)), '#c8b890'); }
  ctx.textAlign = 'left';
}
function drawHUD(){
  const raid = G.sc.kind==='raid';
  ctx.imageSmoothingEnabled = false; ctx.textBaseline = 'middle';
  // escala del HUD según el tamaño de la ventana
  const HS = clamp(Math.min(H/950, W/1150), .8, 1.5);
  // ---- bombonas (abajo a la izquierda) ----
  const base = H - Math.round(34*HS);
  const hpR = Math.round(84*HS), hpX = 30 + hpR, hpY = base - hpR - Math.round(14*HS);
  drawOrb(hpX, hpY, hpR, P.hp/P.maxHp, ORB.hp, {value:`${Math.ceil(P.hp)}/${P.maxHp}`, label:'VIDA', hs:HS, flash: P.inv>0 && !P.dashT ? P.inv*.35 : 0, shield:(P.petShield || 0)/P.maxHp});
  // mascotas
  const slots = petSlots(G.save.level), pr = Math.round(31*HS), gap = Math.round(14*HS);
  for(let i=0;i<4;i++){
    const x = hpX + hpR + Math.round(30*HS) + pr + i*(pr*2+gap), y = base - pr - Math.round(14*HS);
    const it = G.inv.equip.pet[i];
    if(i >= slots){
      drawOrb(x, y, pr, 0, ORB.off, {label:'Nv ' + PET_LVL[i], hs:HS});
      const k = pr/24;   // candado
      ctx.strokeStyle = '#8a8070'; ctx.lineWidth = 3*k; ctx.beginPath(); ctx.arc(x, y-3*k, 6*k, Math.PI, 0); ctx.stroke();
      ctx.fillStyle = '#8a8070'; ctx.fillRect(x-9*k, y-3*k, 18*k, 13*k); ctx.fillStyle = '#2a2428'; ctx.fillRect(x-1*k, y+1*k, 2*k, 5*k);
      continue;
    }
    if(!it){ drawOrb(x, y, pr, 0, ORB.pet, {label:'—', hs:HS}); continue; }
    const pet = G.pets.find(p => p.item===it), ex = pet && pet.exhaustedT > 0;
    drawOrb(x, y, pr, it.hp/PETS[it.pet].hp, ex ? ORB.off : ORB.pet, {value: ex ? Math.ceil(pet.exhaustedT)+'s' : Math.ceil(it.hp), label: PETS[it.pet].name, speed:3, hs:HS});
    const art = PET_ART[it.pet].fr[0], sc = Math.min(2.2*HS, 40*HS/art.c.width);
    ctx.drawImage(art.c, Math.round(x - art.c.width*sc/2), Math.round(y - pr - 8 - art.c.height*sc), Math.round(art.c.width*sc), Math.round(art.c.height*sc));
  }
  // estamina (verde) y aceite (amarillo)
  const sr = Math.round(52*HS), sX = hpX + hpR + Math.round(30*HS) + 4*(pr*2+gap) + Math.round(8*HS) + sr, sY = base - sr - Math.round(14*HS);
  drawOrb(sX, sY, sr, P.st/P.stMax, ORB.st, {value: Math.ceil(P.st), label:'ESTAMINA', speed:3, hs:HS, flash: P.noStamT>0 && Math.floor(G.t*10)%2 ? .4 : 0});
  const oX = sX + sr*2 + Math.round(26*HS);
  if(raid) drawOrb(oX, sY, sr, P.oil/Math.max(1, oilMax()), P.lantern ? ORB.oil : ORB.off, {value: Math.ceil(P.oil), label: P.lantern ? 'ACEITE' : 'APAGADA', speed:1.4, hs:HS});
  else drawOrb(oX, sY, sr, 1, ORB.oil, {value:oilMax(), label:'ACEITE', speed:1.4, hs:HS});
  drawPetBuffs(HS);   // columna izquierda de bufos: farolillo, talismanes y afijos de mascota que afectan al héroe
  drawStatusRow(HS, oX, sY, sr, sX);   // bufos de consumibles y debufos, junto al contador de aceite
  drawDpsPanel(HS);   // ventana de DPS del dummy de pruebas

  // ---- barra de acciones (abajo a la derecha): clic derecho sobre un hueco para elegir su acción ----
  const fs = Math.round(7*S*HS), ls = Math.round(6*S*HS), y0 = drawActionBar(HS, fs, ls);
  // ---- nivel, experiencia y oro (arriba a la izquierda) ----
  const s = G.save;
  ctx.font = `${9*S}px ${FONT}`; textO('Nv ' + s.level, 20, 26);
  hudFrame(100, 20, 180, 10);
  ctx.fillStyle = '#4a70c0'; ctx.fillRect(100, 20, Math.round(180*s.xp/xpFor(s.level)), 10);
  ctx.fillStyle = '#a0c8ff'; ctx.fillRect(100, 20, Math.round(180*s.xp/xpFor(s.level)), 4);
  ctx.font = `${6*S}px ${FONT}`; textO(`${s.xp}/${xpFor(s.level)} XP`, 104, 26);
  ctx.drawImage(ICONS.coin, 16, 44, 24, 24);
  ctx.font = `${8*S}px ${FONT}`; textO(raid ? `${G.raidGold}` : `${s.wallet}`, 46, 56, '#ffe08a');
  if(s.name){ ctx.font = `${7*S}px ${FONT}`; textO(s.name, 20, 82, '#c8b890'); }
  if(AUDIO.muted){ ctx.font = `${6*S}px ${FONT}`; textO('Sonido: no [M]', 20, 104, '#8a8070'); }
  // ---- minimapa y objetivos (arriba a la derecha) ----
  const ms = 190, mx = W - 20 - ms, my = 20;
  drawMinimap(mx, my, ms);
  ctx.textAlign = 'right';
  ctx.font = `${8*S}px ${FONT}`; textO(G.sc.name, W-20, my+ms+22, raid ? '#c8b0ff' : '#ffd8a0');
  ctx.font = `${6*S}px ${FONT}`;
  if(raid){
    textO(`Mascotas rescatadas: ${G.rescued}/${G.sc.cages.length}`, W-20, my+ms+44);
    textO('Vuelve al caballo [F] o a un portal', W-20, my+ms+62, '#a89a80');
    { const q = questLines(); if(q) q.forEach((t, i) => textO(t, W-20, my+ms+92+i*18, i === 0 ? '#c8a050' : i === 1 ? '#fff2a0' : '#e8d8b0')); }   // la misión sigue a la vista dentro de las expediciones
  } else { const q = questLines(); if(q) q.forEach((t, i) => textO(t, W-20, my+ms+44+i*18, i === 0 ? '#c8a050' : i === 1 ? '#fff2a0' : '#e8d8b0')); else textO('Habla con Juan · El caballo te lleva', W-20, my+ms+44, '#a89a80'); }
  ctx.textAlign = 'left';
  if(!raid) drawPetCounter();
  drawTutorial(); drawElfBuff();
  // ---- avisos ----
  ctx.textAlign = 'center';
  toasts.forEach((t,i) => { ctx.globalAlpha = Math.min(1, t.t*2); ctx.font = `${8*S}px ${FONT}`; textO(t.msg, W/2, 110 + i*30); });
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
  // barra de vida del jefe
  const bf = G.bossFight;
  if(bf && MONSTERS[bf.type].trio){   // los tres hermanos drakonianos: una barra por cada uno
    const tr = G.mons.filter(o => MONSTERS[o.type].trio && !o.dying), n = tr.length, tw = Math.min(260, (W*.9 - 10*(n - 1))/Math.max(1, n)), x0 = W/2 - (tw*n + 10*(n - 1))/2;
    tr.forEach((o, i) => {
      const bx = x0 + i*(tw + 10), by = 40, col = /Ignis/.test(o.name) ? ['#4a1208', '#e8501a', '#ffb070'] : /Glacius/.test(o.name) ? ['#0a2a4a', '#4a9ae0', '#bfeaff'] : ['#241a4a', '#e8c820', '#fff0a0'];
      hudFrame(bx, by, tw, 16); ctx.fillStyle = col[0]; ctx.fillRect(bx, by, tw, 16);
      ctx.fillStyle = col[1]; ctx.fillRect(bx, by, Math.round(tw*Math.max(0, o.hp/o.maxHp)), 16);
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(bx, by, Math.round(tw*Math.max(0, o.hp/o.maxHp)), 5);
      ctx.textAlign = 'center'; ctx.font = `${6*S}px ${FONT}`; textO(o.name, bx + tw/2, by - 10, col[2]); textO(`${Math.ceil(o.hp)} / ${Math.round(o.maxHp)}`, bx + tw/2, by + 9); ctx.textAlign = 'left';
    });
  } else
  if(bf && bf.awake && !bf.dying && G.mons.includes(bf)){
    const bw = Math.min(560, W*.5), bx = W/2 - bw/2, by = 40;
    hudFrame(bx, by, bw, 18);
    const urr = bf.type === 'urr';
    ctx.fillStyle = urr ? '#3a1208' : '#4a0a2a'; ctx.fillRect(bx, by, bw, 18);
    ctx.fillStyle = urr ? (bf.phase2 ? '#ff5a1a' : '#c8401a') : (bf.phase2 ? '#ff3a8a' : '#c83a8a'); ctx.fillRect(bx, by, Math.round(bw*Math.max(0,bf.hp/bf.maxHp)), 18);
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(bx, by, Math.round(bw*Math.max(0,bf.hp/bf.maxHp)), 6);
    ctx.textAlign = 'center'; ctx.font = `${8*S}px ${FONT}`; textO(bf.name + (bf.phase2 ? (urr ? ' (furioso)' : ' (enfurecida)') : ''), W/2, by - 12, urr ? '#ffb070' : '#ff9ad8');
    ctx.font = `${6*S}px ${FONT}`; textO(`${Math.ceil(bf.hp)} / ${Math.round(bf.maxHp)}`, W/2, by + 10); ctx.textAlign = 'left';
  }
  if(G.bigMap) drawBigMap();
}

// =====================================================================
//  Minimapa con niebla de exploración y mapa grande (Tab)
// =====================================================================
const MM = {sc:null, N:256, base:null, fog:null, fg:null, k:1, explored:null, cell:8};
function mmBuild(sc){
  const N = MM.N, w = sc.x1-sc.x0, h = sc.y1-sc.y0, k = N/Math.max(w,h);
  MM.sc = sc; MM.k = k;
  const c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d'), id = g.createImageData(N,N), a = id.data;
  for(let j=0;j<N;j++) for(let i=0;i<N;i++){
    const wx = sc.x0 + (i+.5)/k, wy = sc.y0 + (j+.5)/k, o = (j*N+i)*4;
    if(wx > sc.x1 || wy > sc.y1){ a[o+3] = 0; continue; }
    const col = sc.ground(Math.round(wx), Math.round(wy));
    const solid = sc.solidAt && sc.solidAt(wx, wy);
    const m = solid ? 1.1 : 2.6;
    a[o] = Math.min(255, col[0]*m); a[o+1] = Math.min(255, col[1]*m); a[o+2] = Math.min(255, col[2]*m); a[o+3] = 255;
  }
  g.putImageData(id, 0, 0);
  g.fillStyle = '#b8ac98';
  for(const wl of sc.walls) g.fillRect((wl.x-sc.x0)*k, (wl.y-sc.y0)*k, Math.max(1, wl.w*k), Math.max(1, wl.h*k));
  MM.base = c;
  MM.fog = document.createElement('canvas'); MM.fog.width = MM.fog.height = N;
  MM.fg = MM.fog.getContext('2d');
  MM.fg.fillStyle = '#050407'; MM.fg.fillRect(0, 0, N, N);
  MM.explored = new Uint8Array((N/MM.cell)**2);
  if(sc.kind !== 'raid'){ MM.fg.clearRect(0, 0, N, N); MM.explored.fill(1); }
}
function mmReveal(){
  if(!MM.sc || MM.sc !== G.sc || P.dead) return;
  const k = MM.k, x = (P.x-MM.sc.x0)*k, y = (P.y-MM.sc.y0)*k, r = (P.lantern ? 200 : 110)*k;
  const g = MM.fg;
  g.globalCompositeOperation = 'destination-out';
  const gr = g.createRadialGradient(x, y, r*.5, x, y, r);
  gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(x-r, y-r, r*2, r*2);
  g.globalCompositeOperation = 'source-over';
  const C = MM.cell, n = MM.N/C;
  for(let cy=Math.floor((y-r)/C); cy<=Math.floor((y+r)/C); cy++) for(let cx=Math.floor((x-r)/C); cx<=Math.floor((x+r)/C); cx++)
    if(cx>=0 && cy>=0 && cx<n && cy<n && Math.hypot(cx*C+C/2-x, cy*C+C/2-y) < r*.8) MM.explored[cy*n+cx] = 1;
}
function mmSeen(wx, wy){
  const k = MM.k, n = MM.N/MM.cell, cx = Math.floor((wx-MM.sc.x0)*k/MM.cell), cy = Math.floor((wy-MM.sc.y0)*k/MM.cell);
  return cx>=0 && cy>=0 && cx<n && cy<n && MM.explored[cy*n+cx] === 1;
}
// dibuja el mapa: view = {cx, cy, half} en coordenadas del mundo
function drawMapView(x, y, size, view, big, layer){
  if(!MM.base || MM.sc !== G.sc) return;
  const sc = G.sc, k = MM.k, z = size/(view.half*2);
  const toS = (wx, wy) => [x + (wx - view.cx + view.half)*z, y + (wy - view.cy + view.half)*z];
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, size, size); ctx.clip();
  if(layer !== 'icons'){
    ctx.fillStyle = '#050407'; ctx.fillRect(x, y, size, size);
    const sx = (view.cx - view.half - sc.x0)*k, sy = (view.cy - view.half - sc.y0)*k, sw = view.half*2*k;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(MM.base, sx, sy, sw, sw, x, y, size, size);
    ctx.drawImage(MM.fog, sx, sy, sw, sw, x, y, size, size);
    if(layer === 'terrain'){ ctx.restore(); return; }
  }
  const ms = big ? 1.6 : 1;
  const dot = (wx, wy, col, r, shape) => {
    const [px, py] = toS(wx, wy); if(px < x-10 || py < y-10 || px > x+size+10 || py > y+size+10) return;
    ctx.fillStyle = '#0c0a0e'; ctx.fillRect(px-r-1, py-r-1, r*2+2, r*2+2);
    ctx.fillStyle = col;
    if(shape==='diamond'){ ctx.beginPath(); ctx.moveTo(px, py-r-1); ctx.lineTo(px+r+1, py); ctx.lineTo(px, py+r+1); ctx.lineTo(px-r-1, py); ctx.fill(); }
    else ctx.fillRect(px-r, py-r, r*2, r*2);
  };
  for(const c of sc.chests) if(!c.open && mmSeen(c.x, c.y)) dot(c.x, c.y, c.legend ? '#ff9a3c' : c.rare ? '#c8a0ff' : '#e8c070', (c.legend ? 5.5 : 3.5)*ms);
  for(const c of sc.cages) if(!c.open && (mmSeen(c.x, c.y) || ((hasPetAffix('rastreador') || MS('exp',25)) && Math.hypot(c.x-P.x, c.y-P.y) < 640))) dot(c.x, c.y, '#7ae09a', 5*ms, 'diamond');
  for(const n of sc.npcs) dot(n.x, n.y, '#9ad0ff', 3*ms);
  if(sc.stash) dot(sc.stash.x, sc.stash.y, '#c8a0ff', 3*ms);
  const pulse = 1 + Math.sin(G.t*4)*.25;
  for(const p of sc.portals){ if(!p.seen && !mmSeen(p.x, p.y)) continue; const [px, py] = toS(p.x, p.y); ctx.beginPath(); ctx.arc(px, py, 4*ms*pulse, 0, Math.PI*2); ctx.fillStyle = '#9a7aff'; ctx.fill(); ctx.strokeStyle = '#e0d8ff'; ctx.lineWidth = 1.5; ctx.stroke(); }
  if(sc.horse){ dot(sc.horse.x, sc.horse.y, '#e0a060', 3.5*ms); }
  for(const p of G.pets) dot(p.x, p.y, RARITY[p.def.rarity].col, 1.5*ms);
  // héroe: flecha en la dirección en la que mira
  const [hx, hy] = toS(P.x, P.y), a = P.face, L = (big ? 8 : 7)*ms;
  if(big){ ctx.beginPath(); ctx.arc(hx, hy, L*1.5 + Math.sin(G.t*5)*1.5, 0, Math.PI*2); ctx.strokeStyle = '#0c0a0e'; ctx.lineWidth = 5; ctx.stroke(); ctx.strokeStyle = '#ffe070'; ctx.lineWidth = 2.5; ctx.stroke(); }   // anillo para distinguir bien al jugador
  ctx.beginPath(); ctx.moveTo(hx + Math.cos(a)*L, hy + Math.sin(a)*L);
  ctx.lineTo(hx + Math.cos(a+2.5)*L*.7, hy + Math.sin(a+2.5)*L*.7); ctx.lineTo(hx + Math.cos(a-2.5)*L*.7, hy + Math.sin(a-2.5)*L*.7); ctx.closePath();
  ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#0c0a0e'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}
function mapFrame(x, y, size){
  ctx.fillStyle = '#0c0a0e'; ctx.fillRect(x-8, y-8, size+16, size+16);
  ctx.fillStyle = '#7a5e36'; ctx.fillRect(x-6, y-6, size+12, size+12);
  ctx.fillStyle = '#c8a868'; ctx.fillRect(x-6, y-6, size+12, 2);
  ctx.fillStyle = '#0c0a0e'; ctx.fillRect(x-2, y-2, size+4, size+4);
}
function drawMinimap(x, y, size){
  if(!MM.sc) return;
  mapFrame(x, y, size);
  const half = G.sc.kind==='raid' ? 420 : Math.max(G.sc.x1-G.sc.x0, G.sc.y1-G.sc.y0)/2;
  const view = G.sc.kind==='raid' ? {cx:P.x, cy:P.y, half} : {cx:(G.sc.x0+G.sc.x1)/2, cy:(G.sc.y0+G.sc.y1)/2, half};
  drawMapView(x, y, size, view);
  ctx.font = `${5*S}px ${FONT}`; ctx.textAlign = 'right'; textO('[Tab] mapa', x+size-4, y+size-10, '#a89a80'); ctx.textAlign = 'left';
}
// posición y tamaño del mapa grande (se puede mover con Ctrl + arrastrar y ampliar con la rueda; se recuerda)
function bigMapRect(){
  const v = SETTINGS.mapView, size = Math.max(160, Math.round(Math.min(W*.7, H - 330)*v.z));
  let x = Math.round(W/2 - size/2 + v.dx), y = Math.round(Math.max(70, (H - 250 - size)/2 + 40) + v.dy);
  return {x:clamp(x, 60 - size, W - 60), y:clamp(y, 60 - size, H - 60), size};
}
let BMdrag = null, BMcursor = false;
function updateBigMapDrag(){
  const ctrl = keys.ControlLeft || keys.ControlRight, v = SETTINGS.mapView;
  if(!G.bigMap){ BMdrag = null; if(BMcursor){ cv.style.cursor = ''; BMcursor = false; } return; }
  if(ctrl && mouse.lp && !BMdrag) BMdrag = {mx:mouse.x, my:mouse.y, dx:v.dx, dy:v.dy};
  if(BMdrag){ v.dx = BMdrag.dx + mouse.x - BMdrag.mx; v.dy = BMdrag.dy + mouse.y - BMdrag.my; mouse.l = false; mouse.lp = false; }
  if(ctrl || BMdrag){ cv.style.cursor = BMdrag ? 'grabbing' : 'grab'; BMcursor = true; } else if(BMcursor){ cv.style.cursor = ''; BMcursor = false; }
}
addEventListener('mouseup', e => { if(e.button === 0 && BMdrag){ BMdrag = null; saveSettings(); } });
cv.addEventListener('wheel', e => { if(!G.bigMap) return; e.preventDefault(); const v = SETTINGS.mapView; v.z = clamp(v.z*(e.deltaY < 0 ? 1.1 : 1/1.1), .5, 1.7); saveSettings(); }, {passive:false});
function drawBigMap(){
  // por encima de las bombonas y por debajo de los avisos
  const {x, y, size} = bigMapRect();
  // el mapa se dibuja siempre opaco (lo no explorado sigue oculto) y la opacidad solo deja ver la partida que hay debajo
  const a = SETTINGS.mapAlpha, rx = x-8, ry = y-8, rw = size+16;
  let under = null;
  if(a < 1){ under = drawBigMap.under ??= document.createElement('canvas'); under.width = rw; under.height = rw; under.getContext('2d').drawImage(cv, rx, ry, rw, rw, 0, 0, rw, rw); }
  ctx.save(); ctx.globalAlpha = 1;
  mapFrame(x, y, size);
  const sc = G.sc, half = Math.max(sc.x1-sc.x0, sc.y1-sc.y0)/2, view = {cx:(sc.x0+sc.x1)/2, cy:(sc.y0+sc.y1)/2, half};
  drawMapView(x, y, size, view, true, 'terrain');
  if(under){ ctx.globalAlpha = 1 - a; ctx.drawImage(under, rx, ry); ctx.globalAlpha = 1; }
  drawMapView(x, y, size, view, true, 'icons');   // los iconos (jugador, cofres, portales…) nunca se vuelven transparentes
  ctx.restore();
  ctx.textAlign = 'center'; ctx.font = `${9*S}px ${FONT}`; textO(sc.name, x + size/2, y - 22, '#ffd8a0');
  // leyenda e instrucciones: panel fijo en el lado derecho de la pantalla (no se mueve con el mapa)
  const legend = sc.kind==='raid'
    ? [['#ffffff','Tú'], ['#e0a060','Caballo (salida)'], ['#9a7aff','Portal (salida)'], ['#7ae09a','Jaula'], ['#e8c070','Cofre'], ['#c8a0ff','Cofre raro'], ['#ff9a3c','Cofre legendario']]
    : [['#ffffff','Tú'], ['#9ad0ff','Personajes'], ['#e0a060','Caballo'], ['#c8a0ff','Alijo']];
  const help = ['Ctrl + arrastrar: mover', 'Rueda: acercar / alejar', '[Tab] cerrar'];
  ctx.font = `${5*S}px ${FONT}`; ctx.textAlign = 'left';
  const lh = Math.round(9*S), pw = Math.round(Math.max(...help.map(t => ctx.measureText(t).width), ...legend.map(([,t]) => ctx.measureText(t).width + 16)) + 16), ph = lh*(help.length + legend.length) + 22;
  const px = W - pw - 12, py = Math.round(Math.min(H*.46, H - ph - 150));
  ctx.fillStyle = 'rgba(12,10,14,.82)'; ctx.fillRect(px, py, pw, ph); ctx.strokeStyle = '#7a5e36'; ctx.lineWidth = 2; ctx.strokeRect(px, py, pw, ph);
  let ty = py + 10 + lh/2;
  for(const t of help){ textO(t, px + 8, ty, '#e8d8b0'); ty += lh; }
  ty += 4; ctx.fillStyle = '#4a3a24'; ctx.fillRect(px + 8, ty - lh/2, pw - 16, 1); ty += 6;
  for(const [c, t] of legend){ ctx.fillStyle = '#0c0a0e'; ctx.fillRect(px + 8, ty - 5, 11, 11); ctx.fillStyle = c; ctx.fillRect(px + 10, ty - 3, 7, 7); textO(t, px + 25, ty); ty += lh; }
  ctx.textAlign = 'left';
}

// ---------- textos y marcas sobre el mundo ----------
function toScreen(x, y){ return [(x + G.ox)*PX, (y + G.oy)*PX]; }
function screenToWorld(sx, sy){ return {x: sx/PX - G.ox, y: sy/PX - G.oy}; }
function drawHpBars(){
  if(P.dead || !(SETTINGS.hpHero || SETTINGS.hpPets)) return;
  const bar = (x, y, w, f, col) => { ctx.fillStyle = '#0c0a0e'; ctx.fillRect(x-w/2-2, y-2, w+4, 8); ctx.fillStyle = '#123a1c'; ctx.fillRect(x-w/2, y, w, 4); ctx.fillStyle = col; ctx.fillRect(x-w/2, y, Math.round(w*clamp(f,0,1)), 4); };
  if(SETTINGS.hpHero){ const [sx, sy] = toScreen(P.x, P.y-44); bar(sx, sy, 56, P.hp/P.maxHp, '#3ad86a'); }
  if(SETTINGS.hpPets) for(const p of G.pets){ if(p.hp <= 0) continue; const [sx, sy] = toScreen(p.x, p.y-(p.z||0)-24); bar(sx, sy, 38, p.hp/p.maxHp, '#3ad86a'); }
}
function drawWorldOverlay(){
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  drawHpBars();
  drawQuestArrow();

  for(const c of G.sc.chests){
    if(c.open || !(hasPetAffix('olfato') || MS('exp',5) || c.pinged > 0) || Math.hypot(c.x-P.x, c.y-P.y) > (c.pinged > 0 ? 520 : 320)) continue;
    const [sx, sy] = toScreen(c.x, c.y-22), bob = Math.sin(G.t*4)*3;
    ctx.fillStyle = c.legend ? '#ff9a3c' : c.rare ? '#c8a0ff' : '#ffe08a';
    ctx.beginPath(); ctx.moveTo(sx, sy+bob+8); ctx.lineTo(sx-6, sy+bob); ctx.lineTo(sx+6, sy+bob); ctx.fill();
  }
  if(hasPetAffix('rastreador') || MS('exp',25)) for(const c of G.sc.cages){
    if(c.open || Math.hypot(c.x-P.x, c.y-P.y) > 640) continue;
    const [sx, sy] = toScreen(c.x, c.y-30), bob = Math.sin(G.t*4)*3;
    ctx.fillStyle = '#7ae09a'; ctx.beginPath(); ctx.moveTo(sx, sy+bob+9); ctx.lineTo(sx-7, sy+bob); ctx.lineTo(sx+7, sy+bob); ctx.fill();
  }
  if(G.sc.kind !== 'raid') for(const n of G.sc.npcs){   // puntos de pasiva sin gastar: +N sobre la cabeza de Gonzalo (habilidades) y de Chemma (mascotas)
    const pts = n.id === 'gonzalo' ? (G.save.skillPts || 0) : n.id === 'druid' ? Math.max(0, petPoints()) : 0; if(!pts) continue;
    const [nx, ny] = toScreen(n.x, n.y - 74 + Math.sin(G.t*3)*1.5), pul = .75 + .25*Math.sin(G.t*5);
    ctx.textAlign = 'center'; ctx.font = `${11*S}px ${FONT}`; ctx.globalAlpha = pul; textO('+' + pts, nx, ny, '#7affb0'); ctx.globalAlpha = 1;
  }
  for(const t of G.texts){
    const [sx, sy] = toScreen(t.x, t.y), a = clamp(t.life/t.max*2, 0, 1), sc = 1 + Math.max(0, (t.life-t.max+.12))*4;
    ctx.globalAlpha = a; ctx.font = `${Math.round(t.size*S*sc)}px ${FONT}`; textO(t.text, sx, sy, t.col);
  }
  ctx.globalAlpha = 1;
  // etiquetas de los objetos del suelo (clic izquierdo para recogerlos)
  const hover = UI.blocking() ? null : lootUnderMouse();
  ctx.font = `${6*S}px ${FONT}`;
  const labs = [];
  for(const l of G.loot){
    l.labelRect = null;
    if(!l.item || l.z > 0 || !lootVisible(l) || Math.hypot(l.x-P.x, l.y-P.y) > 160) continue;
    const [sx, sy] = toScreen(l.x, l.y-16);
    const t = itemName(l.item) + (l.item.n > 1 ? ' x' + l.item.n : '');
    labs.push({l, t, sx, sy, w: ctx.measureText(t).width + 12, h:18});
  }
  // las etiquetas no se apilan unas sobre otras (como en Path of Exile): las que chocan se desplazan hacia abajo
  labs.sort((p, q) => p.sy - q.sy || p.sx - q.sx);
  const placed = [];
  for(const o of labs){
    let ty = o.sy;
    for(let k = 0; k < 40; k++){
      const hit = placed.find(q => Math.abs(q.sx - o.sx) < (q.w + o.w)/2 + 2 && Math.abs(q.ty - ty) < o.h + 2);
      if(!hit) break;
      ty = hit.ty + o.h + 3;
    }
    o.ty = ty; placed.push(o);
    o.l.labelRect = [o.sx - o.w/2, ty - o.h/2 - 2, o.w, o.h];
  }
  for(const o of labs){
    const l = o.l, [rx, ry, rw, rh] = l.labelRect;
    ctx.fillStyle = hover===l ? 'rgba(60,40,20,.9)' : 'rgba(0,0,0,.65)'; ctx.fillRect(rx, ry, rw, rh);
    const lc = lootColor(l);   // color del tipo de objeto (normal, mágico, raro, legendario, consumible, misión, llave, tesoro…)
    if(hover===l){ ctx.strokeStyle = lc; ctx.lineWidth = 2; ctx.strokeRect(rx, ry, rw, rh); }
    ctx.fillStyle = lc; ctx.fillText(o.t, o.sx, o.ty);
  }
  // vista previa del objeto bajo el cursor
  if(hover && hover.item){
    const fake = {clientX:mouse.x, clientY:mouse.y};
    if(UI.lootTipFor !== hover){ UI.lootTipFor = hover; UI.showTip(hover.item, fake); } else UI.moveTip(fake);
  } else if(UI.lootTipFor){ UI.lootTipFor = null; $('tip').classList.add('hidden'); }
  if(G.prompt && !UI.blocking()){
    const [sx, sy] = toScreen(G.prompt.x, G.prompt.y);
    ctx.font = `${7*S}px ${FONT}`; textO(G.prompt.text, sx, sy, '#ffe8b0');
  }
  if(G.channel){
    const c = G.channel, [sx, sy] = toScreen(P.x, P.y-52);
    const w = 90; ctx.fillStyle = '#0c0a0e'; ctx.fillRect(sx-w/2-4, sy-6, w+8, 14);
    ctx.fillStyle = c.col || '#e8c070'; ctx.fillRect(sx-w/2, sy-2, w*clamp(c.t/c.dur,0,1), 6);
    ctx.font = `${6*S}px ${FONT}`; textO(c.label, sx, sy-18);
  }
  ctx.textAlign = 'left';
}

// ---------- retrato del héroe con el equipo puesto (para el panel de equipo) ----------
function drawPortrait(c){
  const g = c.getContext('2d'), E = G.inv.equip, ax = 22, ay = 46;
  g.imageSmoothingEnabled = false; g.clearRect(0, 0, c.width, c.height);
  const S0 = (name, x, y) => { const s = SPR[name]; g.drawImage(s.img, ax + x + s.ox, ay + y + s.oy); };
  const OV = (name, rar, x, y) => { const o = ARMOR_OV[name]; g.drawImage(o.img[rar||'normal'] || o.img.unique || o.img.normal, ax + x + o.ox, ay + y + o.oy); };
  S0('cloak', -1, 0); S0('pack', 0, 0);
  for(const lx of [-6, -1]){ S0('leg', lx, 0); if(E.feet) OV(ovName(E.feet, E.feet.id==='urrboots' ? 'urrboot' : 'boot'), E.feet.rarity, lx, 0); }
  S0('torso', 0, 0); if(E.chest) OV(ovName(E.chest, 'chest'), E.chest.rarity, 0, 0);
  S0('hood', 0, 0);  if(E.head) OV(ovName(E.head, E.head.id==='countessveil' ? 'veil' : E.head.id==='urrhelm' ? 'urrhelm' : 'helmet'), E.head.rarity, 0, 0);
  for(const [x,y] of [[-8,-17],[9,-15]]){
    if(E.hands) OV(ovName(E.hands, 'glove'), E.hands.rarity, x, y); else { const s = SPR.glove; g.drawImage(s.img, ax + x + s.ox, ay + y + s.oy); }
  }
}

// ---------- mapa de incursiones (al hablar con el caballo) ----------
UI.mapOpen = false; UI.mapSel = null;
const _blocking = UI.blocking.bind(UI);
UI.blocking = function(){ return _blocking() || this.mapOpen; };
UI.openRaidMap = function(){
  this.mapOpen = true; this.mapSel = this.mapSel || 'village';
  $('raidMap').classList.remove('hidden'); sfx('ui');
  $('mapClose').onclick = () => this.closeRaidMap();
  this.renderRaidMap(); this.fitRaidMap();
};
UI.closeRaidMap = function(){ this.mapOpen = false; $('raidMap').classList.add('hidden'); sfx('ui'); };
// (el dibujo del mapa y su cámara están en js/worldmap.js)

// Trapis vende siempre la versión normal del equipo
function shopItem(o){ return ITEMS[o.id].gear ? mkGear(o.id, 'normal') : mkItem(o.id, o.n); }

// ---------- categorías de objetos (para ordenar el alijo) ----------
const ITEM_CATS = ['Legendarios','Armas','Armaduras','Farolillos','Munición','Consumibles','Piedras preciosas','Talismanes','Llaves','Tesoros','Mascotas'];
function itemCat(it){
  if(it.id==='pet') return 'Mascotas';
  const d = ITEMS[it.id];
  if(it.rarity === 'legendary' || it.rarity === 'unique' || d.legend || d.unique) return 'Legendarios';   // los únicos de jefe también son legendarios
  if(d.gem) return 'Piedras preciosas';
  if(d.slot==='talisman') return 'Talismanes';
  if(it.id==='minekey' || d.key) return 'Llaves';
  if(d.treasure) return 'Tesoros';
  if(d.ammo || d.kind==='ammo') return 'Munición';
  if(d.slot==='lantern') return 'Farolillos';
  if(d.slot==='weapon') return 'Armas';
  if(d.slot) return 'Armaduras';
  return 'Consumibles';
}

// ---------- Gonzalo el profesor: árbol de pasivas ----------
UI.skillOpen = false;
const _blocking2 = UI.blocking.bind(UI);
UI.blocking = function(){ return _blocking2() || this.skillOpen; };
UI.openSkills = function(){ this.skillOpen = true; $('skillPanel').classList.remove('hidden'); sfx('ui'); this.renderSkills(); };
UI.closeSkills = function(){ this.skillOpen = false; $('skillPanel').classList.add('hidden'); $('tip').classList.add('hidden'); sfx('ui'); };
UI.renderSkills = function(){
  const s = G.save, pts = s.skillPts || 0;
  $('skillPts').innerHTML = pts ? `Tienes <b>${pts}</b> punto${pts>1?'s':''} para invertir` : 'No tienes puntos: sube de nivel para conseguir más';
  const box = $('skillCols'); box.innerHTML = '';
  for(const k in SKILLS){
    const d = SKILLS[k], v = s.skills[k] || 0;
    const col = document.createElement('div'); col.className = 'skcol'; col.style.setProperty('--sk', d.col);
    let track = '';
    for(let i=SKILL_MAX;i>=1;i--){
      const mile = d.miles[i];
      track += `<div class="sknode${i<=v ? ' on' : ''}${mile ? ' mile' : ''}" data-tip="${mile ? `Nivel ${i}: ${mile}` : ''}">${mile ? '★' : ''}</div>`;
    }
    const miles = Object.entries(d.miles).map(([n,t]) => `<li class="${v>=+n?'got':''}">${n}: ${t}</li>`).join('');
    col.innerHTML = `<h3>${d.name}</h3><div class="skdesc">${d.desc}</div>
      <div class="skval">${v} / ${SKILL_MAX}</div>
      <div class="sktrack">${track}</div>
      <button ${pts && v < SKILL_MAX ? '' : 'disabled'}>+1</button>
      <div class="skper">Cada punto: ${d.per}</div>
      <ul class="skmiles">${miles}</ul>`;
    col.querySelector('button').onclick = () => {
      if(!(s.skillPts > 0) || s.skills[k] >= SKILL_MAX) return;
      s.skills[k]++; s.skillPts--;
      refreshStats(); saveGame(); sfx('levelup');
      if(d.miles[s.skills[k]]) toast(`¡${d.name} ${s.skills[k]}! ${d.miles[s.skills[k]]}`, 3);
      this.renderSkills(); this.refresh();
    };
    for(const n of col.querySelectorAll('.sknode.mile')){
      n.onmouseenter = e => { const t = $('tip'); t.innerHTML = `<b style="color:${d.col}">${d.name}</b><div>${n.dataset.tip}</div>`; t.classList.remove('hidden'); this.moveTip(e); };
      n.onmousemove = e => this.moveTip(e); n.onmouseleave = () => $('tip').classList.add('hidden');
    }
    box.append(col);
  }
  $('skillClose').onclick = () => this.closeSkills();
};

// información de una expedición: descripción y lista de mascotas con su probabilidad y si ya las rescataste
// jefe de la expedición y su botín especial con probabilidades
function bossInfoHTML(e){
  const list = MONSTERS[e.boss].uniques || [];
  if(!list.length) return `<div class="mphead bosshead"><span>☠ Jefe: ${MONSTERS[e.boss].name}</span></div><p class="sub">No suelta objetos únicos. La primera vez que lo derrotes dejará una jaula brillante con una mascota shiny.</p>`;
  const per = UNIQUE_CHANCE/list.length;
  const rows = list.map(id => {
    const d = ITEMS[id];
    return `<div class="mpet" data-item="${id}"><img src="${itemIconURL({id})}"><span class="mpname" style="color:${RARITY.unique ? RARITY.unique.col : '#ff9ad8'}">${d.name}</span><span class="mpch">${(per*100).toFixed(1).replace('.', ',')} %</span><span class="mpst"></span></div>`;
  }).join('');
  return `<div class="mphead bosshead"><span>☠ Jefe: ${MONSTERS[e.boss].name}</span><span>Prob.</span></div>
    <div class="mpets">${rows}</div><p class="sub">Soltará un objeto único con un ${Math.round(UNIQUE_CHANCE*100)} % de probabilidad (se reparte entre los 4).</p>`;
}
function legendInfoHTML(e){
  const list = (typeof EXCL_LEGENDS !== 'undefined' && EXCL_LEGENDS[e.id]) || [];
  if(!list.length) return '';
  const rows = list.map(id => { const d = ITEMS[id]; return `<div class="mpet" data-item="${id}"><img src="${itemIconURL({id})}"><span class="mpname" style="color:${RARITY.legendary.col}">${d.name}</span><span class="mpch">≈ 4 %</span></div><div class="sub" style="margin:0 0 5px 8px;font-size:11px;line-height:1.3">${d.desc.replace(/^Objeto legendario[^.]*\. /, '')}</div>`; }).join('');
  return `<div class="mphead"><span>Legendarios exclusivos</span><span>Por incursión</span></div><div class="mpets">${rows}</div>`;
}
// botín exclusivo de una expedición: lo que solo cae allí (botín con 'only', objetos de monstruos concretos y los tesoros de su zona)
const EXCL_LOOT_EXTRA = {river:['elfbow', 'elfsword', 'elfmail', 'elfpotion', 'elflantern', 'minekey'], forest:['elfbow', 'elfsword', 'elfmail', 'elfpotion', 'elflantern', 'minekey'], temple:['elfbow', 'elfsword', 'elfmail', 'elfpotion', 'elflantern', 'minekey', 'elfboots', 'elfshield', 'elfbread'],
  icepeak:['ghostsword', 'ghostbow', 'ghostmail', 'timekey'], floatcity:['atlantlantern', 'timekey']};
function exclLootIds(e){
  const ids = new Set(EXCL_LOOT_EXTRA[e.id] || []);
  for(const T of [LOOT.chestNormal, LOOT.chestRare]) for(const x of T.table) if(x.only === e.id) ids.add(x.id);
  for(const x of LOOT.monsterTable) if(x.only === e.id) ids.add(x.id);
  const z = typeof TREASURE_ZONES !== 'undefined' && TREASURE_ZONES[e.id]; if(z && TREASURE_POOL[z]) for(const x of TREASURE_POOL[z]) ids.add(x.id);
  return [...ids].filter(id => ITEMS[id]);
}
function exclLootHTML(e){
  const list = exclLootIds(e); if(!list.length) return '';
  const rows = list.map(id => { const d = ITEMS[id], col = d.treasure ? '#e8c070' : d.legend ? RARITY.legendary.col : d.quest ? '#39ff14' : '#e8e2d4';
    return `<div class="mpet" data-item="${id}"><img src="${itemIconURL({id})}"><span class="mpname" style="color:${col}">${d.name}</span><span class="mpch">${d.treasure ? 'tesoro' : ''}</span></div>`; }).join('');
  return `<div class="mphead"><span>Botín exclusivo de esta expedición</span><span></span></div><div class="mpets">${rows}</div>`;
}
// índice de los legendarios generales (debajo del mapa): todos con su nivel; los que no caen en la expedición señalada salen atenuados
function renderMapLegends(e){
  const box = $('mapLegends'); if(!box) return;
  const lvl = e && !e.locked ? e.lvl : 0;
  box.innerHTML = `<div class="lgh">Legendarios generales · índice por nivel de expedición</div><div class="lgrid">${LEGEND_IDS.map(id => `<div class="lgi${ITEMS[id].lvl <= lvl ? '' : ' off'}" data-item="${id}"><img src="${itemIconURL({id})}"><span>${ITEMS[id].name}</span><small>Nv ${ITEMS[id].lvl}</small></div>`).join('')}</div>`;
  bindTips(box);
}
UI.renderMapInfo = function(id){
  const e = ALL_EXPS().find(x => x.id === id), sel = id === this.mapSel;
  renderMapLegends(e);
  if(e.locked){ $('mapInfo').innerHTML = `<h3>???</h3><p>${e.desc}</p><button disabled>Aún no puedes ir</button>`; return; }
  const lk = expLocked(e);
  if(e.hall){   // zona especial (sin expedición): la sala del tiempo
    $('mapInfo').innerHTML = `<h3>Zona especial</h3><h2>${e.name}</h2><p>${e.desc}</p>` + (lk ? `<button disabled>Supera el nivel anterior para llegar</button>` : sel ? '<button id="mapGo">Viajar</button>' : '');
    const g2 = $('mapGo'); if(g2) g2.onclick = () => { this.closeRaidMap(); enterTimeHall(); };
    return;
  }
  const pets = petsOfExp(e.petExp ?? e.lvl).sort((a,c) => ['normal','magic','rare','legendary'].indexOf(PETS[a].rarity) - ['normal','magic','rare','legendary'].indexOf(PETS[c].rarity));
  const got = pets.filter(p => G.save.collection[p]).length;
  const rows = pets.map(p => {
    const d = PETS[p], have = !!G.save.collection[p];
    return `<div class="mpet ${have ? 'have' : ''}" data-pet="${p}"><img src="${itemIconURL({id:'pet', pet:p})}">
      <span class="mpname" style="color:${RARITY[d.rarity].col}">${d.name}</span>
      <span class="mpch">${Math.round(CAGE_CHANCE[d.rarity]*100)} %</span>
      <span class="mpst">${have ? '✓' : ''}</span></div>`;
  }).join('');
  $('mapInfo').innerHTML = `<h3>Expedición ${e.lvl}</h3><h2>${e.name}</h2><p>${e.desc}</p>
     <p class="sub">Monstruos: ${e.monsters}</p>
     <p class="sub">Botín de nivel ${e.lvl}${e.lvl > 1 ? ' (incluye el de las anteriores)' : ''}</p>
     <div class="mphead"><span>Mascotas (${got}/${pets.length} rescatadas)</span><span>Prob.</span></div>
     <div class="mpets">${rows}</div>
     ${exclLootHTML(e)}
     ${legendInfoHTML(e)}
     ${e.boss ? bossInfoHTML(e) : ''}
     ${e.hidden ? '<button disabled>Solo se puede acceder a través del portal del tiempo de Rolecs</button>' : lk ? `<button disabled>${blockQuest(e) && (G.save.maxExp||0) >= e.lvl - 1 ? 'Completa la misión «' + blockQuest(e).title + '» para desbloquearla' : blockBoss(e) && (G.save.maxExp||0) >= e.lvl - 1 ? 'Derrota a ' + MONSTERS[blockBoss(e).boss].name + ' para desbloquearla' : 'Supera la Expedición ' + (e.lvl-1) + ' para desbloquearla'}</button>` : e.needKey && !G.inv.bag.some(o => o && o.id==='minekey') ? '<button disabled>Necesitas una llave de la mina en la mochila</button>' : e.id==='dragonbridge' && !G.save.bridgeOpen && !G.inv.bag.some(o => o && o.id==='dragonkey') ? '<button disabled>Necesitas la llave mágica del puente de los dragones (solo la primera vez)</button>' : sel ? '<button id="mapGo">Viajar' + (e.needKey ? ' (gasta 1 llave de la mina)' : e.id==='dragonbridge' && !G.save.bridgeOpen ? ' (gasta la llave, abre el puente para siempre)' : '') + '</button>' : '<p class="sub">Haz clic para seleccionarla</p>'}`;
  const go = $('mapGo'); if(go) go.onclick = () => {
    if(e.needKey){ const ix = G.inv.bag.findIndex(o => o && o.id==='minekey'); if(ix < 0){ toast('Necesitas una llave de la mina'); return; } if(--G.inv.bag[ix].n <= 0) G.inv.bag[ix] = null; }
    if(e.id==='dragonbridge' && !G.save.bridgeOpen){ const ix = G.inv.bag.findIndex(o => o && o.id==='dragonkey'); if(ix < 0){ toast('Necesitas la llave mágica del puente de los dragones'); return; } G.inv.bag[ix] = null; G.save.bridgeOpen = true; toast('La llave se consume: el puente queda abierto para siempre', 4); }
    this.closeRaidMap(); startRaid(e.id);
  };
  bindMapTips();
};
// al pasar el cursor por una mascota o un objeto del mapa de incursiones sale su ficha (descripción y estadísticas)
function bindMapTips(){ bindTips($('mapInfo')); }
function bindTips(root){
  const tip = $('tip');
  root.querySelectorAll('[data-pet],[data-item]').forEach(el => {
    el.onmouseenter = ev => { let it; try { it = el.dataset.pet ? mkPetItem(el.dataset.pet) : mkItem(el.dataset.item, 1, 13); } catch(err) { return; } UI.showTip(it, ev); };
    el.onmousemove = ev => UI.moveTip(ev); el.onmouseleave = () => tip.classList.add('hidden');
  });
}

// ---------- árbol de pasivas estilo PoE: grafo de nodos que se va abriendo desde el centro ----------
UI.treeHover = null;
UI.renderSkills = function(){
  const s = G.save, box = $('skillCols');
  if(!$('treeCanvas')){
    box.innerHTML = '<canvas id="treeCanvas" width="1080" height="1080"></canvas><div id="treeInfo"></div>';
    const c = $('treeCanvas');
    const nodeAt = e => {
      const r = c.getBoundingClientRect();
      const mx = (e.clientX - r.left)*c.width / r.width, my = (e.clientY - r.top)*c.height / r.height;   // cada eje con su escala (el lienzo puede no ser cuadrado en pantalla)
      let best = null, bd = 18;
      for(const n of TREE.nodes){ const [x,y] = this.treePos(n); const d = Math.hypot(mx-x, my-y); if(d < bd){ bd = d; best = n; } }
      return best;
    };
    c.onmousemove = e => {
      const n = nodeAt(e);
      if(n !== this.treeHover){ this.treeHover = n; this.drawTree(); }
      const t = $('tip');
      if(!n){ t.classList.add('hidden'); c.style.cursor = 'default'; return; }
      let h = n.start ? '<b style="color:#ffe08a">Inicio</b><div class="sub">Tu punto de partida</div>' : treeNodeTip(n);
      const st = this.nodeState(n);
      h += `<div class="sub">${st==='on' ? 'Aprendido' : st==='open' ? (s.skillPts ? 'Haz clic para aprenderlo (1 punto)' : 'Necesitas un punto') : 'Bloqueado: aprende un nodo conectado'}</div>`;
      t.innerHTML = h; t.classList.remove('hidden'); this.moveTip(e);
      c.style.cursor = st==='open' && s.skillPts ? 'pointer' : 'default';
    };
    c.onmouseleave = () => { this.treeHover = null; $('tip').classList.add('hidden'); this.drawTree(); };
    c.onclick = e => {
      const n = nodeAt(e); if(!n || this.nodeState(n) !== 'open') return;
      if(!(s.skillPts > 0)){ toast('No tienes puntos: sube de nivel', 1.6); sfx('ui'); return; }
      s.tree.push(n.id); s.skillPts--;
      refreshStats(); saveGame(); sfx('levelup');
      if(n.notable) toast(`¡${n.name}! ${SKILLS[n.b].miles[n.notable]}`, 3);
      this.renderSkills(); this.refresh();
    };
  }
  const spent = s.tree.length - 1, cost = spent*20;
  $('skillPts').innerHTML = (s.skillPts ? `Tienes <b>${s.skillPts}</b> punto${s.skillPts>1?'s':''} para invertir` : 'No tienes puntos: sube de nivel para conseguir más')
    + ` · Nodos aprendidos: ${spent}/${TREE.nodes.length-1}`;
  const rows = Object.entries(SKILLS).map(([k,d]) => {
    const notes = Object.keys(d.miles).filter(m => MS(k, +m)).map(m => `<div class="tnote">★ ${NOTABLE_NAMES[k][m]}: ${d.miles[m]}</div>`).join('');
    return `<div class="trow"><b style="color:${d.col}">${d.name}</b> <span>${SK(k)} / ${SKILL_MAX}</span><div class="tper">${d.per}</div>${notes}</div>`;
  }).join('');
  $('treeInfo').innerHTML = rows + (spent ? `<button id="treeReset">Olvidar todo (${cost} oro)</button>` : '');
  const rb = $('treeReset');
  if(rb) rb.onclick = () => {
    if(G.save.wallet < cost){ toast('No tienes suficiente oro', 1.6); return; }
    if(!confirm(`¿Olvidar todo lo aprendido por ${cost} oro? Recuperarás tus ${spent} puntos.`)) return;
    G.save.wallet -= cost; s.skillPts += spent; s.tree = ['start']; refreshStats(); saveGame(); sfx('ui'); this.renderSkills(); this.refresh();
  };
  $('skillClose').onclick = () => this.closeSkills();
  this.drawTree();
};
UI.treePos = function(n){ return [540 + n.x*.8, 540 + n.y*.8]; };
UI.nodeState = function(n){
  const t = G.save.tree;
  if(t.includes(n.id)) return 'on';
  return TREE.adj[n.id].some(id => t.includes(id)) ? 'open' : 'locked';
};
UI.drawTree = function(){
  const c = $('treeCanvas'); if(!c) return;
  const g = c.getContext('2d'), s = G.save, tset = new Set(s.tree), C0 = 540;
  g.clearRect(0, 0, c.width, c.height);
  const bg = g.createRadialGradient(C0, C0, 40, C0, C0, C0); bg.addColorStop(0, '#221a24'); bg.addColorStop(1, '#0c0a0e');
  g.fillStyle = bg; g.beginPath(); g.arc(C0, C0, C0 - 2, 0, Math.PI*2); g.fill();
  // halo de los niveles nuevos (11 a 15)
  g.strokeStyle = 'rgba(255,216,74,.16)'; g.setLineDash([6, 8]); g.lineWidth = 1.5; g.beginPath(); g.arc(C0, C0, (62 + 10.5*38)*.8, 0, Math.PI*2); g.stroke(); g.setLineDash([]);
  // nombre de cada rama
  Object.keys(SKILLS).forEach((k, bi) => {
    const th = -Math.PI/2 + bi*2*Math.PI/5, x = C0 + Math.cos(th)*528, y = C0 + Math.sin(th)*528;
    g.font = `15px ${FONT}`; g.textAlign = 'center'; g.fillStyle = SKILLS[k].col;
    g.fillText(SKILLS[k].name, clamp(x, 80, 1000), clamp(y + 5, 22, 1065));
  });
  // conexiones
  for(const n of TREE.nodes) for(const id of TREE.adj[n.id]){
    if(id < n.id) continue;
    const o = TREE.byId[id], [x0,y0] = this.treePos(n), [x1,y1] = this.treePos(o);
    const a = tset.has(n.id), c2 = tset.has(o.id);
    g.strokeStyle = a && c2 ? (SKILLS[n.b||o.b] ? SKILLS[n.b||o.b].col : '#ffe08a') : (a || c2) ? '#8a7a5a' : '#2e2830';
    g.lineWidth = a && c2 ? 4 : 2.5;
    g.beginPath(); g.moveTo(x0,y0); g.lineTo(x1,y1); g.stroke();
  }
  // nodos: círculo (lado A), cuadrado (lado B), rombo (notable) y rombo dorado grande (nodo final)
  const pulse = (Math.sin(performance.now()/250)+1)/2;
  for(const n of TREE.nodes){
    const [x,y] = this.treePos(n), st = n.start ? 'on' : this.nodeState(n), col = n.b ? SKILLS[n.b].col : '#ffe08a';
    const r = n.start ? 14 : n.fin ? 17 : n.notable ? 12.5 : 7.5, hov = this.treeHover === n;
    if(n.fin && st !== 'locked'){ g.shadowColor = '#ffd84a'; g.shadowBlur = 16; }
    g.beginPath();
    if(n.notable){ g.moveTo(x, y-r); g.lineTo(x+r, y); g.lineTo(x, y+r); g.lineTo(x-r, y); g.closePath(); }
    else if(n.side === 'B') g.rect(x - r*.85, y - r*.85, r*1.7, r*1.7);
    else g.arc(x, y, r, 0, Math.PI*2);
    g.fillStyle = st==='on' ? col : st==='open' ? '#2a2228' : '#141016'; g.fill(); g.shadowBlur = 0;
    g.lineWidth = hov ? 3.5 : 2;
    g.strokeStyle = st==='on' ? (n.fin ? '#ffd84a' : '#fff3d0') : st==='open' ? `rgba(255,224,138,${.5+pulse*.5})` : (n.fin ? '#6a5a20' : '#3a3238');
    g.stroke();
    if(n.fin && st !== 'on'){ g.beginPath(); g.moveTo(x, y-r-5); g.lineTo(x+r+5, y); g.lineTo(x, y+r+5); g.lineTo(x-r-5, y); g.closePath(); g.strokeStyle = 'rgba(255,216,74,.45)'; g.lineWidth = 1.2; g.stroke(); }
  }
  if(this.skillOpen && s.skillPts) requestAnimationFrame(() => { if(this.skillOpen) this.drawTree(); });
};

// una expedición se desbloquea al volver con vida de la anterior
// los jefes bloquean el avance: no se puede pasar al nivel siguiente sin derrotar al jefe del anterior (las partidas que ya llegaron más lejos lo dan por hecho)
const bossDown = e => !e.boss || !!(G.save.bossDone && G.save.bossDone[e.id]) || !!(G.save.bossGift && G.save.bossGift[e.id]) || (G.save.maxExp||0) > e.lvl;
const blockBoss = e => EXPEDITIONS.find(x => x.boss && x.lvl === e.lvl - 1 && !bossDown(x));
const expLocked = e => !e.hidden && (e.locked || (G.save.maxExp||0) < (e.prevLvl ?? e.lvl - 1) || !!blockBoss(e) || !!blockQuest(e));

// ---------- cartel de enhorabuena al rescatar una mascota ----------
UI.showPetCard = function(id, shiny=false){
  const p = PETS[id], R2 = RARITY[p.rarity], kd = shiny ? 1.1 : 1;
  mouse.l = false; mouse.r = false;
  const aff = p.affixes.map(a => `<div class="pc-aff">◆ <b>${PET_AFFIX[a].name}</b>: ${PET_AFFIX[a].desc}</div>`).join('');
  const html = `<div class="petcard" style="--rc:${R2.col}">
    <div class="pc-top">${shiny ? '★ ¡BRILLANTE! ★' : '¡ENHORABUENA!'}</div>
    <img src="${itemIconURL({id:'pet', pet:id, shiny})}" alt="">
    <h1 style="color:${R2.col}">${shiny ? '★ ' : ''}${p.name}</h1>
    <div class="pc-sub">Mascota ${R2.name.toLowerCase()} · ${p.look}</div>
    <div class="pc-stats"><span>Vida <b>${petMaxHp({pet:id, shiny})}</b></span><span>Daño <b>${Math.round(p.dmg[0]*kd)}-${Math.round(p.dmg[1]*kd)}</b></span>${shiny ? '<span style="color:#ff9ad8">+10 % estadísticas</span>' : ''}</div>
    <div class="pc-atk">${p.attack}</div>
    ${aff}
    <div class="pc-note">${G.inv.equip.pet.some(x => x && x.pet===id) ? 'Se ha equipado sola y ya te acompaña.' : 'Ábrela en tu mochila [I] y arrástrala a un hueco de mascota para que te acompañe.'}</div>
  </div>`;
  this.showScreen(html, '¡Genial!');
};

// la altura del panel de información se calcula con la expedición que más contenido tiene
// (así no cambia al pasar el cursor) y, si la ventana es pequeña, el recuadro se reduce para que quepa entero
UI.fitRaidMap = function(){
  const info = $('mapInfo'), box = document.querySelector('#raidMap .mapbox'), keep = this.mapSel;
  box.style.zoom = 1; info.style.height = 'auto'; let hmax = 0;
  for(const e of ALL_EXPS()){ this.mapSel = e.id; this.renderMapInfo(e.id); hmax = Math.max(hmax, info.scrollHeight); }
  this.mapSel = keep; this.renderMapInfo(keep);
  info.style.height = Math.min(hmax, Math.max(420, innerHeight - 170)) + 'px';   // si la ficha es más alta que la pantalla, se desplaza por dentro
  const need = box.scrollHeight + 24;
  if(need > innerHeight) box.style.zoom = ((innerHeight - 24) / need).toFixed(3);
};

// ---------- ficha del monstruo bajo el cursor ----------
const MON_DEBUFFS = [['stunT', 'Aturdido', '#ffe08a'], ['freezeT', 'Congelado', '#c8f0ff'], ['weakT', 'Debilitado', '#ffe85a'], ['bleedT', 'Sangrando', '#ff6a6a'], ['poisonT', 'Envenenado', '#8ae070'], ['burnT', 'Quemado', '#ff9a4a'],
  ['slowT', 'Ralentizado', '#a0d8ff'], ['fearT', 'Asustado', '#d0a0ff'], ['confuseT', 'Confuso', '#ffb0e0'], ['markT', 'Marcado', '#ffd0a0']];
function drawMonsterTip(){
  if(UI.invOpen || UI.mapOpen || UI.skillOpen || UI.screen || UI.dlg || G.paused || G.bigMap || G.menu || P.dead) return;
  const wp = screenToWorld(mouse.x, mouse.y); let m = null, bd = 1e9;
  for(const o of G.mons){
    if(o.dying || (o.vis ?? 1) < .5) continue;
    const r = (o.r || 8) + 5, d = Math.hypot(o.x - wp.x, (o.y - (o.r || 8)) - wp.y);
    if(d < r && d < bd){ bd = d; m = o; }
  }
  if(!m) return;
  const col = RARITY[m.rarity] ? RARITY[m.rarity].col : '#f4ecd8';
  const hp = Math.max(0, Math.ceil(m.hp)), mx = Math.ceil(m.maxHp);
  // ficha compacta: nombre, barra de vida y los afijos / estados en horizontal (nombre + descripción en pequeño, saltando de línea si no caben)
  const chips = [];
  if(m.shield > 0) chips.push({n:'Escudo ' + Math.ceil(m.shield), c:'#a0d8ff'});
  for(const a of m.affixes || []) if(MON_AFFIX[a]) chips.push({n:MON_AFFIX[a].name, c:'#e8d8a0', d:MON_AFFIX[a].desc});
  for(const [k, n, cc] of MON_DEBUFFS) if(m[k] > 0) chips.push({n:n + ' ' + m[k].toFixed(1) + 's', c:cc});
  ctx.save(); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const NF = 6.5*S, DF = 4.5*S, W0 = Math.min(560, innerWidth - 24), LW = W0 - 32, GAP = 18, LH = 18;
  const meas = (t, f) => { ctx.font = f + 'px ' + FONT; return ctx.measureText(t).width; };
  const lines = [[]]; let lx = 0;
  for(const ch of chips){
    ch.nw = meas(ch.n, NF); ch.dw = ch.d ? meas(ch.d, DF) : 0; ch.w = ch.nw + (ch.d ? 8 + ch.dw : 0);
    if(lx > 0 && lx + ch.w > LW){ lines.push([]); lx = 0; }
    ch.x = lx; lines[lines.length-1].push(ch); lx += ch.w + GAP;
  }
  const nameSz = 9.5*S, BH = 16, hasChips = chips.length > 0;
  let w = Math.max(300, meas(m.name, nameSz) + 36); for(const ln of lines) for(const ch of ln) w = Math.max(w, ch.x + ch.w + 32);
  w = Math.min(W0, w);
  const h = 14 + nameSz*1.3 + 6 + BH + (hasChips ? 8 + lines.length*LH : 0) + 12;
  const x = Math.round((innerWidth - w)/2), y = 10;
  ctx.fillStyle = 'rgba(20,14,18,.95)'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#5a4a36'; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  let ty = y + 10;
  ctx.font = nameSz + 'px ' + FONT; textO(m.name, x + 16, ty + nameSz*.65, col); ty += nameSz*1.3 + 6;
  const f = Math.max(0, m.hp/m.maxHp), bx = x + 16, bw = w - 32;
  ctx.fillStyle = '#0c0a0e'; ctx.fillRect(bx, ty, bw, BH);
  ctx.fillStyle = '#8a1c1c'; ctx.fillRect(bx + 2, ty + 2, (bw - 4)*f, BH - 4);
  ctx.fillStyle = '#d84a4a'; ctx.fillRect(bx + 2, ty + 2, (bw - 4)*f, (BH - 4)/2);
  ctx.font = (6*S) + 'px ' + FONT; ctx.textAlign = 'center'; textO('Vida ' + hp + ' / ' + mx, x + w/2, ty + BH/2 + 1, '#f4ecd8'); ctx.textAlign = 'left';
  ty += BH + 8;
  for(const ln of lines){
    for(const ch of ln){
      ctx.font = NF + 'px ' + FONT; textO(ch.n, x + 16 + ch.x, ty + LH/2, ch.c);
      if(ch.d){ ctx.font = DF + 'px ' + FONT; textO(ch.d, x + 16 + ch.x + ch.nw + 8, ty + LH/2 + 1, '#a89a80'); }
    }
    ty += LH;
  }
  ctx.restore();
}

// buscador por nombre del alijo, la jaula grande y la tienda de Trapis
const nameMatch = (it, q) => !q || itemName(it).toLowerCase().includes(q) || (typeof tr === 'function' && tr(itemName(it)).toLowerCase().includes(q));
for(const [id, fn] of [['stashSearch', v => { UI.stashQ = v; UI.renderStash(); }], ['shopSearch', () => UI.renderShop()]]){
  const inp = $(id); inp.addEventListener('input', e => fn(e.target.value)); inp.addEventListener('keydown', e => { if(e.key === 'Escape') e.target.blur(); });
}

Object.assign(LANG_EN, {'Legendarios y únicos':'Legendary and unique'}); LANG.load(LANG_EN);
