'use strict';
// =====================================================================
//  Utilidades: kit de reparación, dummy de pruebas (DPS) y barra de bufos y debufos junto al aceite
// =====================================================================

// ---------- kit de reparación (consumible raro desde el nivel 8; lo vende Uakala) ----------
Object.assign(ICON_ROWS, {repairkit:{pal:{B:'#a8743a', b:'#6a4220', g:'#ffd84a', s:'#c8ccd4', d:'#7a7e88', r:'#e04a3a'}, rows:[
  "............", "...kkkkkk...", "..ksddddsk..", ".kkkkkkkkkk.", "kBBBBBBBBBBk", "kBBBBggBBBBk", "kbbbbggbbbbk", "kBBBBBBBBBBk", "kBBsBBBBsBBk", "kbbbbbbbbbbk", ".kkkkkkkkkk.", "............"]}});
{ const d = ICON_ROWS.repairkit; ICONS.repairkit = bakeRows(d.rows, Object.assign({k:OUT}, d.pal)); }
ITEMS.repairkit = {name:'Kit de reparación', icon:'repairkit', stack:20, use:'repair', value:300,
  desc:'Consumible raro. Asígnalo a un hueco de la barra de acciones y pulsa su tecla: repara todo el equipo que llevas puesto. Lo vende Uakala (800 de oro).'};
ACTIONS.repairkit = {name:'Usar kit de reparación', trigger:true, item:['repairkit']};
TRIGGER_ACTIONS.push('repairkit');
for(const T of [LOOT.chestNormal, LOOT.chestRare]) T.table.push({w: T === LOOT.chestRare ? .7 : .2, id:'repairkit', lvl:8});
LOOT.monsterTable.push({w:.15, id:'repairkit', lvl:8});
function useRepairKit(){
  const E = G.inv.equip; let n = 0;
  for(const k of ['w1', 'w2', 'shield', 'head', 'chest', 'hands', 'feet']){
    const it = E[k];
    if(it && it.id !== 'pet' && it.dur !== undefined && ITEMS[it.id].dur && it.dur < maxDur(it)){ it.dur = maxDur(it); it.lowWarned = false; it.wearAcc = 0; n++; }
  }
  if(!n){ toast('No llevas nada que reparar', 1.2); return false; }
  toast(`Kit de reparación: ${n} objeto${n > 1 ? 's' : ''} reparado${n > 1 ? 's' : ''}`, 2.2); sfx('equip');
  burst(P.x, P.y-20, 14, ['#ffd84a', '#ffffff', '#c8ccd4'], [30, 90], [.4, .8], -60); refreshStats(); return true;
}

// ---------- tienda de Uakala (pestaña «Tienda» del yunque) ----------
const KIT_PRICE = 800, DUMMY_PRICE = 5000;
UI.renderSmithShop = function(body){
  const g = G.save; body.innerHTML = '';
  const row = (img, title, desc, price, btn, off, fn) => {
    const r = document.createElement('div'); r.className = 'smrow';
    r.innerHTML = `<img src="${img}" draggable="false"><div class="smi"><b>${tr(title)}</b><small>${tr(desc)}</small></div><button ${off ? 'disabled' : ''}>${tr(btn)}${price ? ' · ' + price + ' ' + tr('oro') : ''}</button>`;
    r.querySelector('button').onclick = fn; body.append(r);
  };
  row(itemIconURL({id:'repairkit'}), 'Kit de reparación', 'Repara todo tu equipo puesto al usarlo (asígnalo a un hueco de la barra de acciones).', KIT_PRICE, 'Comprar', g.wallet < KIT_PRICE, () => {
    if(g.wallet < KIT_PRICE){ toast('No tienes suficiente oro', 1.6); return; }
    const it = mkItem('repairkit', 1); if(!addToBagOrStash(it)){ toast('No tienes sitio en la mochila ni en el alijo', 2); return; }
    g.wallet -= KIT_PRICE; sfx('coin'); toast('Compras un kit de reparación', 1.8); saveGame(); UI.refresh(); this.renderSmith();
  });
  const dm = document.createElement('canvas'); dm.width = 32; dm.height = 40; { const c = dm.getContext('2d'); c.imageSmoothingEnabled = false; c.drawImage(ART.dummy.c, 0, 0); }
  row(dm.toDataURL(), 'Dummy de pruebas', g.dummy ? 'Ya tienes uno en la guarida: ataca para ver tu DPS.' : 'Un muñeco de entrenamiento para la guarida. Al atacarlo sale una ventana con tu DPS.', g.dummy ? 0 : DUMMY_PRICE, g.dummy ? 'Comprado' : 'Comprar', !!g.dummy || g.wallet < DUMMY_PRICE, () => {
    if(g.dummy) return; if(g.wallet < DUMMY_PRICE){ toast('No tienes suficiente oro', 1.6); return; }
    g.wallet -= DUMMY_PRICE; g.dummy = true; spawnDummy(); sfx('coin'); toast('El dummy de pruebas ya está en la guarida', 2.4); saveGame(); UI.refresh(); this.renderSmith();
  });
};

// ---------- dummy de pruebas ----------
MONSTERS.dummy = {name:'Dummy de pruebas', art:'dummy', ai:'dummy', hp:1e9, dmg:0, spd:0, r:9, xp:0, reach:0, prep:1};
RARE_PREFIX.dummy = ['Dummy'];
ART.dummy = SP(paintSprite(32, 40, [
  {r:[14, 14, 4, 24], c:['#3a2412', '#5a3a1e', '#7a5230']},                                  // poste
  {r:[4, 17, 24, 4], c:['#3a2412', '#5a3a1e', '#7a5230']},                                   // brazos
  {e:[16, 11, 7, 7], c:['#8a6a30', '#c8a458', '#e8d090']},                                    // cabeza de paja
  {e:[16, 25, 9, 9], c:['#8a6a30', '#c8a458', '#e8d090']},                                    // tronco de paja
  {e:[16, 25, 6, 6], c:['#8a1010', '#e03a3a', '#ffffff']}, {e:[16, 25, 3, 3], c:['#8a1010', '#e03a3a', '#ffe0a0']},   // diana
  {r:[10, 37, 12, 3], c:['#2a1a0e', '#4a3220']},                                              // base
  {p:[[13, 10, '#2a1a0e'], [19, 10, '#2a1a0e']]},
]), 16, 38);
const dummyAt = () => ({x:235, y:55});
function spawnDummy(){
  if(!G.save.dummy || !G.sc || G.sc.kind !== 'den' || G.mons.some(m => m.dummy)) return;
  const p = dummyAt(), m = mkMonster('dummy', 'normal', p.x, p.y, {affixes:[], instant:true, name:'Dummy de pruebas'});
  m.dummy = true; m.maxHp = m.hp = 1e9; m.aggro = false; G.mons.push(m);
}
function dpsRecord(dmg){
  const now = G.t;
  if(!G.dps || now - G.dps.last > 5) G.dps = {t0:now, last:now, total:0, hist:[], best:0};
  const D = G.dps; D.total += dmg; D.last = now; D.hist.push([now, dmg]); while(D.hist.length && now - D.hist[0][0] > 3) D.hist.shift();
  const cur = D.hist.reduce((s, h) => s + h[1], 0)/3; if(cur > D.best && now - D.t0 >= 2) D.best = cur;
}
function dummyTick(m, dt){
  m.flash -= dt; m.stunT = 0; m.slowT = 0; m.freezeT = 0; m.fearT = 0; m.tauntT = 0; m.vx = m.vy = 0; m.x = dummyAt().x; m.y = dummyAt().y;
  const lost = m.maxHp - m.hp; if(lost > .5){ dpsRecord(lost); m.hp = m.maxHp; m.hit = .18; }   // el daño se mide por la vida perdida (incluye sangrado, veneno y fuego)
  m.poisonT = m.burnT = m.bleedT = 0; if(m.hit > 0) m.hit -= dt;
}
function drawDummy(m){
  const sh = m.hit > 0 ? Math.sin(G.t*60)*2*(m.hit/.18) : 0;
  pshadow(m.x, m.y, 9, 3, .35); drawSP(ART.dummy, m.x + sh, m.y);
}
function drawDpsPanel(HS){
  const D = G.dps; if(!D || !G.sc || G.sc.kind !== 'den' || G.t - D.last > 10) return;
  const el = Math.max(1, D.last - D.t0), dps = D.total/el, cur = D.hist.reduce((s, h) => s + h[1], 0)/3;
  const w = Math.round(210*HS), h = Math.round(104*HS), x = W - w - 24, y = Math.round(H*.43);
  hudFrame(x, y, w, h);
  ctx.fillStyle = 'rgba(14,10,14,.72)'; ctx.fillRect(x, y, w, h);
  ctx.textBaseline = 'middle'; ctx.font = `${6*S*HS}px ${FONT}`; ctx.textAlign = 'left'; textO(tr('DUMMY · DPS'), x + 12, y + 14*HS, '#ffd88a');
  ctx.font = `${12*S*HS}px ${FONT}`; textO(String(Math.round(dps)), x + 12, y + 40*HS, '#7aff9a');
  ctx.font = `${5.2*S*HS}px ${FONT}`; ctx.textAlign = 'right'; textO(tr('medio'), x + w - 12, y + 42*HS, '#9a8e78'); ctx.textAlign = 'left';
  const line = (i, a, b, col) => { ctx.font = `${5.2*S*HS}px ${FONT}`; ctx.textAlign = 'left'; textO(a, x + 12, y + (62 + i*14)*HS, '#b8a888'); ctx.textAlign = 'right'; textO(b, x + w - 12, y + (62 + i*14)*HS, col || '#ffffff'); ctx.textAlign = 'left'; };
  line(0, tr('Ahora (3 s)'), String(Math.round(cur)), '#ffe9a8'); line(1, tr('Máximo (3 s)'), String(Math.round(D.best)), '#ffb06a'); line(2, tr('Daño total'), Math.round(D.total) + ' · ' + el.toFixed(1) + ' s');
}

// ---------- bufos y debufos junto al contador de aceite ----------
function drawStatusRow(HS, oX, sY, sr, sX){
  const buffs = timedBuffs().filter(b => b.name !== 'Debilitado').map(b => Object.assign({good:true}, b)), deb = [];
  const d = (t, name, desc, ic, col) => { if(t > 0) deb.push({t, name, desc, ic, col, good:false}); };
  d(P.bleedT, 'Sangrando', 'Pierdes vida cada segundo. Las vendas lo curan.', 'drop', '#e0303a');
  d(P.poisonT, 'Envenenado', 'Pierdes vida cada segundo. Una poción de vida lo cura.', 'drop', '#7ad04a');
  d(P.burnT, 'Ardiendo', 'Las llamas te queman cada segundo.', 'flame', '#ff8a2a');
  d(P.slowT, 'Ralentizado', 'Te mueves más despacio.', 'slow', '#7ac8ff');
  d(P.frozenT, 'Congelado', 'Estás casi inmóvil.', 'snow', '#c8f0ff');
  d(P.stunT, 'Aturdido', 'No puedes actuar.', 'star', '#ffe08a');
  d(P.rootT, 'Inmovilizado', 'No puedes moverte.', 'chain', '#c8b8a0');
  d(P.charmT, 'Hechizado', 'Caminas hacia quien te ha hechizado.', 'heart', '#ff7ac8');
  d(P.weakT, 'Debilitado', 'Haces un 40 % menos de daño.', 'bolt', '#d8c83a');
  const list = buffs.concat(deb); if(!list.length) return;
  const sz = Math.round(38*HS), gap = Math.round(6*HS), xr = oX + sr + Math.round(18*HS), xLimit = W - 24 - 6*(Math.round(54*HS) + Math.round(8*HS)) - 14, side = Math.floor((xLimit - xr + gap)/(sz + gap));
  // junto al aceite si cabe; si no, en filas justo encima de las bombonas de estamina y aceite
  const above = side < 3, x0 = above ? sX - sr : xr, yb = above ? sY - sr - sz - Math.round(12*HS) : sY + sr - sz, cols = above ? 8 : Math.min(5, side);
  let hover = null;
  list.forEach((e, i) => {
    const col = i % cols, row = Math.floor(i/cols), x = x0 + col*(sz + gap), y = yb - row*(sz + gap);
    hudFrame(x, y, sz, sz); ctx.fillStyle = e.good ? 'rgba(40,120,60,.28)' : 'rgba(150,30,30,.34)'; ctx.fillRect(x, y, sz, sz);
    ctx.strokeStyle = e.good ? '#4ac86a' : '#e0504a'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, sz - 2, sz - 2);
    if(e.img){ ctx.imageSmoothingEnabled = false; ctx.drawImage(e.img, x + sz*.15, y + sz*.1, sz*.7, sz*.7); } else fxIcon(ctx, e.ic, x + sz/2, y + sz*.45, sz*.56, e.col);
    ctx.font = `${5.6*S*HS}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textO(String(Math.ceil(e.t)) + 's', x + sz/2, y + sz - 6*HS, '#ffffff'); ctx.textAlign = 'left';
    if(mouse.x >= x && mouse.x <= x + sz && mouse.y >= y && mouse.y <= y + sz) hover = {e, x, y, sz};
  });
  if(hover){
    const e = hover.e; ctx.font = `${5.5*S}px ${FONT}`;
    const w = Math.round(250*HS), body = fxWrap(ctx, e.desc, w - 24), h = Math.round(24*HS + body.length*14*HS + 12*HS), bx = Math.min(W - w - 8, hover.x), by = hover.y - h - 10;
    fxBox(ctx, bx, by, w, h);
    ctx.font = `${6*S}px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; textO(tr(e.name), bx + 12, by + 8, e.good ? '#9affb0' : '#ff9a9a');
    ctx.font = `${5.5*S}px ${FONT}`; body.forEach((ln, i) => textO(ln, bx + 12, by + 8 + 16*HS + i*14*HS, '#d8d0c0')); ctx.textBaseline = 'middle';
  }
}

Object.assign(LANG_EN, {'Kit de reparación':'Repair kit', 'Usar kit de reparación':'Use repair kit', 'No tienes kits de reparación':'You have no repair kits', 'No llevas nada que reparar':'You carry nothing that needs repair',
  'Consumible raro. Asígnalo a un hueco de la barra de acciones y pulsa su tecla: repara todo el equipo que llevas puesto. Lo vende Uakala (800 de oro).':'Rare consumable. Assign it to an action bar slot and press its key: it repairs all the equipment you are wearing. Sold by Uakala (800 gold).',
  'Tienda':'Shop', 'Comprar':'Buy', 'Comprado':'Bought', 'Compras un kit de reparación':'You buy a repair kit', 'No tienes sitio en la mochila ni en el alijo':'You have no room in your backpack or stash',
  'Repara todo tu equipo puesto al usarlo (asígnalo a un hueco de la barra de acciones).':'Repairs all your worn equipment when used (assign it to an action bar slot).',
  'Dummy de pruebas':'Training dummy', 'Ya tienes uno en la guarida: ataca para ver tu DPS.':'You already have one in the den: attack it to see your DPS.', 'Un muñeco de entrenamiento para la guarida. Al atacarlo sale una ventana con tu DPS.':'A training dummy for the den. A window with your DPS appears when you hit it.',
  'El dummy de pruebas ya está en la guarida':'The training dummy is now in the den', 'DUMMY · DPS':'DUMMY · DPS', 'medio':'avg', 'Ahora (3 s)':'Now (3 s)', 'Máximo (3 s)':'Max (3 s)', 'Daño total':'Total damage',
  'Sangrando':'Bleeding', 'Envenenado':'Poisoned', 'Ardiendo':'Burning', 'Ralentizado':'Slowed', 'Congelado':'Frozen', 'Aturdido':'Stunned', 'Inmovilizado':'Rooted', 'Hechizado':'Charmed', 'Debilitado':'Weakened',
  'Pierdes vida cada segundo. Las vendas lo curan.':'You lose health every second. Bandages cure it.', 'Pierdes vida cada segundo. Una poción de vida lo cura.':'You lose health every second. A health potion cures it.', 'Las llamas te queman cada segundo.':'Flames burn you every second.',
  'Te mueves más despacio.':'You move slower.', 'Estás casi inmóvil.':'You are almost immobile.', 'No puedes actuar.':'You cannot act.', 'No puedes moverte.':'You cannot move.', 'Caminas hacia quien te ha hechizado.':'You walk toward whoever charmed you.',
  'Los objetos de misión no se pueden vender':'Quest items cannot be sold'});
LANG.load(LANG_EN);
