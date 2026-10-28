'use strict';
// =====================================================================
//  Menú principal, menú de pausa (Esc), controles y volúmenes
// =====================================================================
const CONTROLS = [
  ['W A S D', 'Mover'], ['F', 'Interactuar: cofres, jaulas, NPCs, caballo, alijo'],
  ['Barra de acciones', 'Abajo a la derecha: clic (izquierdo o derecho) sobre un hueco para elegir qué hace'],
  ['Por defecto', 'Clic izq. atacar · clic der. cubrirse · Q cambiar arma · E farolillo · Espacio saltar · 1-5 consumibles'],
  ['Clic izquierdo', 'Además recoge los objetos del suelo'],
  ['I', 'Inventario'], ['Tab', 'Mapa grande'], ['M', 'Silenciar el sonido'], ['H', 'Mostrar / ocultar la ayuda'], ['Esc', 'Pausa · cerrar ventanas'],
];
const controlsHTML = () => '<table class="ctl">' + CONTROLS.map(([k, d]) => `<tr><td><kbd>${k}</kbd></td><td>${d}</td></tr>`).join('') + '</table>';
const SOUND_ROWS = [['master', 'General'], ['music', 'Música'], ['sfx', 'Efectos']];
const soundHTML = () => '<div class="vols">' + SOUND_ROWS.map(([k, l]) =>
  `<label class="vrow"><span>${l}</span><input type="range" min="0" max="100" value="${Math.round(VOL[k]*100)}" data-vol="${k}"><b>${Math.round(VOL[k]*100)}%</b></label>`).join('') +
  `<label class="vrow"><span>Silenciar</span><input type="checkbox" id="muteChk" ${AUDIO.muted ? 'checked' : ''}></label></div>`;
function bindSound(root){
  root.querySelectorAll('input[data-vol]').forEach(r => {
    r.oninput = () => { setVolume(r.dataset.vol, r.value/100); r.nextElementSibling.textContent = r.value + '%'; };
    r.onchange = () => sfx('ui');
  });
  const m = root.querySelector('#muteChk'); if(m) m.onchange = () => { setMuted(m.checked); sfx('ui'); };
}

// ---------- menú principal ----------
// ---------- configuración ----------
if(ITEMS.minekey) ITEMS.minekey.key = true;   // la llave de la mina cuenta como llave en el filtro de objetos
const SETTINGS = {hpHero:false, hpPets:false, mapAlpha:.97, lootFilter:{normal:true, magic:true, rare:true, legend:true, cons:true, key:true, treasure:true, talisman:true, gems:true, gold:true}, lootItems:{}, mapView:{dx:0, dy:0, z:1}};
try { const v = JSON.parse(localStorage.getItem('heroes-pets-settings')); if(v){ if(typeof v.hpHero==='boolean') SETTINGS.hpHero = v.hpHero; if(typeof v.hpPets==='boolean') SETTINGS.hpPets = v.hpPets; if(typeof v.mapAlpha==='number') SETTINGS.mapAlpha = Math.max(.15, Math.min(1, v.mapAlpha)); if(v.lootFilter) for(const k in SETTINGS.lootFilter) if(typeof v.lootFilter[k]==='boolean') SETTINGS.lootFilter[k] = v.lootFilter[k]; if(v.lootItems && typeof v.lootItems === 'object') SETTINGS.lootItems = v.lootItems; if(v.mapView) for(const k of ['dx','dy','z']) if(typeof v.mapView[k]==='number') SETTINGS.mapView[k] = v.mapView[k]; } } catch(e){}
const saveSettings = () => { try { localStorage.setItem('heroes-pets-settings', JSON.stringify(SETTINGS)); } catch(e){} };
const configHTML = () => `<div class="vols">
  <label class="vrow"><span style="width:auto;flex:1">Mostrar la vida sobre el héroe</span><input type="checkbox" id="cfgHero" ${SETTINGS.hpHero ? 'checked' : ''}></label>
  <label class="vrow"><span style="width:auto;flex:1">Mostrar la vida sobre las mascotas</span><input type="checkbox" id="cfgPets" ${SETTINGS.hpPets ? 'checked' : ''}></label>
  <label class="vrow"><span style="width:150px">Opacidad del mapa [Tab]</span><input type="range" min="15" max="100" value="${Math.round(SETTINGS.mapAlpha*100)}" id="cfgMap"><b>${Math.round(SETTINGS.mapAlpha*100)}%</b></label></div>`;
// tipos del filtro: [clave, nombre, ¿tiene lista de objetos?]
const LOOT_FILTER_ROWS = [['normal', 'Normales', 1], ['magic', 'Mágicos', 1], ['rare', 'Raros', 1], ['legend', 'Legendarios (incluye los únicos de jefe)', 1], ['cons', 'Consumibles (pociones, vendas, aceite, galletas, setas, munición…)', 1], ['quest', 'Misión (siempre visibles)', 0], ['key', 'Llaves', 1], ['treasure', 'Tesoros', 1], ['talisman', 'Talismanes', 1], ['gems', 'Piedras preciosas', 1], ['gold', 'Oro (monedas)', 0]];
const lootFilterHTML = () => '<div class="vols lfvols">' + LOOT_FILTER_ROWS.map(([k, t, sub]) => `<div class="lfrow"><span class="lfsw" style="background:${LOOT_COL[k]}"></span><label class="vrow"><span style="width:auto;flex:1;color:${LOOT_COL[k]}">${tr(t)}</span><input type="checkbox" data-lf="${k}" ${k === 'quest' ? 'checked disabled' : SETTINGS.lootFilter[k] !== false ? 'checked' : ''}></label>${sub ? `<button class="small" data-act="lootclass" data-c="${k}">${tr('Ver lista')} ›</button>` : '<span class="lfno"></span>'}</div>`).join('') + '</div><p class="lfnote">' + tr('Lo que desmarques no se verá en el suelo ni se podrá coger (el color de cada tipo es el que ves aquí). El oro desmarcado se sigue recogiendo solo. Las mascotas y los objetos de misión siempre se ven. Pulsa «Ver lista» para activar o desactivar objetos concretos.') + '</p>';
// expedición más baja en la que cae un objeto (botín y tienda)
let _firstLvl = null;
function lootFirstLvl(id){
  if(!_firstLvl){ _firstLvl = {}; const put = (i, l) => { if(i && l && (!_firstLvl[i] || l < _firstLvl[i])) _firstLvl[i] = l; };
    for(const k in LOOT){ const L = LOOT[k], tb = Array.isArray(L) ? L : (L && L.table) || []; for(const e of tb) put(e.id, e.lvl); }
    for(const o of SHOP) put(o.id, o.tier); }
  return _firstLvl[id] || 0;
}
// objetos que existen de cada tipo (para la subpantalla del filtro)
function lootClassIds(c){
  const out = [];
  for(const id in ITEMS){ const d = ITEMS[id]; let ok = false;
    if(c === 'cons') ok = isConsumable(d);
    else if(c === 'legend') ok = !!(d.legend || d.unique) && !d.quest;
    else if(c === 'gems') ok = !!d.gem; else if(c === 'treasure') ok = !!d.treasure; else if(c === 'key') ok = !!d.key && !d.quest;
    else if(c === 'talisman') ok = d.slot === 'talisman' && !d.legend && !d.quest;
    else if(c === 'normal') ok = (!!d.gear || d.slot === 'lantern') && !d.unique && !d.legend;
    else if(c === 'magic' || c === 'rare') ok = !!d.gear && !d.unique && !d.legend;
    if(ok) out.push(id); }
  return out.sort((a, b) => tr(ITEMS[a].name).localeCompare(tr(ITEMS[b].name)));
}
const lootClassHTML = c => {
  const ids = lootClassIds(c), on = id => SETTINGS.lootItems[c + ':' + id] !== false;
  return `<div class="lfhead"><span class="lfsw" style="background:${LOOT_COL[c]}"></span><span style="color:${LOOT_COL[c]}">${tr(LOOT_FILTER_ROWS.find(r => r[0] === c)[1])}</span></div>
    <div class="mbtns lfall"><button class="mbtn" data-act="lfall">${tr('Activar todos')}</button><button class="mbtn" data-act="lfnone">${tr('Desactivar todos')}</button></div>
    <div class="lflist">${ids.map(id => { const lv = c === 'cons' ? lootFirstLvl(id) : 0; return `<label class="lfitem"><img src="${itemIconURL({id})}"><span style="color:${LOOT_COL[c]}">${tr(ITEMS[id].name)}</span>${lv ? `<small>${tr('Desde exp.')} ${lv}</small>` : ''}<input type="checkbox" data-li="${c}:${id}" ${on(id) ? 'checked' : ''}></label>`; }).join('')}</div>`;
};
function bindConfig(root){
  root.querySelectorAll('[data-lf]').forEach(c => c.onchange = () => { SETTINGS.lootFilter[c.dataset.lf] = c.checked; saveSettings(); sfx('ui'); });
  root.querySelectorAll('[data-li]').forEach(c => c.onchange = () => { if(c.checked) delete SETTINGS.lootItems[c.dataset.li]; else SETTINGS.lootItems[c.dataset.li] = false; saveSettings(); sfx('ui'); });
  const ch = root.querySelector('#cfgHero'), cp = root.querySelector('#cfgPets'), cm = root.querySelector('#cfgMap');
  if(ch) ch.onchange = () => { SETTINGS.hpHero = ch.checked; saveSettings(); sfx('ui'); };
  if(cp) cp.onchange = () => { SETTINGS.hpPets = cp.checked; saveSettings(); sfx('ui'); };
  if(cm) cm.oninput = () => { SETTINGS.mapAlpha = cm.value/100; cm.nextElementSibling.textContent = cm.value + '%'; saveSettings(); };
}
const langHTML = () => '<div class="mbtns">' + LANG.list.map(([c, n]) => `<button class="mbtn${LANG.cur === c ? ' on' : ''}" data-act="setlang" data-l="${c}">${n}</button>`).join('') + '</div>';
const MENU = {view:'main', mode:'load', confirm:null, t:0};
function openMainMenu(){
  G.menu = true; G.paused = false; MENU.view = 'main'; MENU.confirm = null;
  $('menu').classList.remove('hidden'); $('pause').classList.add('hidden');
  renderMenu(); playMusic('raid');
}
function closeMainMenu(){ G.menu = false; $('menu').classList.add('hidden'); }
function slotRow(n){
  const i = slotInfo(n), load = MENU.mode === 'load', coop = MENU.mode === 'coop';
  if(MENU.confirm && MENU.confirm.n === n){
    const del = MENU.confirm.del;
    return `<div class="sslot"><div class="sinfo red">${del ? '¿Borrar' : '¿Sobrescribir'} la partida de la ranura ${n}?<small>Se perderá para siempre.</small></div>
      <button data-act="${del ? 'delyes' : 'newyes'}" data-n="${n}">Sí</button><button data-act="no">No</button></div>`;
  }
  if(!i) return `<div class="sslot empty"><div class="sinfo">Ranura ${n} · vacía</div>${coop ? `<button data-act="coopgo" data-n="${n}">Empezar aquí</button>` : load ? '' : `<button data-act="new" data-n="${n}">Empezar</button>`}</div>`;
  const nm = i.name || 'Aventurero sin nombre';
  return `<div class="sslot"><div class="sinfo"><b>${nm}</b><small>Ranura ${n} · Nv ${i.level} · ${i.gold} oro · ${i.runs} expediciones${i.inRaid ? ' · <span class="red">sin volver de expedición</span>' : ''}</small></div>
    ${coop ? `<button data-act="coopgo" data-n="${n}">Jugar</button>` : load ? `<button data-act="load" data-n="${n}">Jugar</button><button class="small" data-act="del" data-n="${n}">Borrar</button>` : `<button data-act="new" data-n="${n}">Sobrescribir</button>`}</div>`;
}
function renderMenu(){
  const body = $('menuBody'), v = MENU.view;
  const any = [1, 2, 3].some(n => slotInfo(n));
  let h = '';
  if(v === 'main'){
    h = `<div class="mbtns"><button class="mbtn" data-act="newgame">Nueva partida</button>
      <button class="mbtn" data-act="continue" ${any ? '' : 'disabled'}>Continuar partida</button>
      <button class="mbtn" data-act="coop">Cooperativa</button>
      <button class="mbtn" data-act="config">Configuración</button><button class="mbtn" data-act="controls">Controles</button><button class="mbtn" data-act="sound">Sonido</button><button class="mbtn" data-act="lang">Idioma</button></div>`;
  } else if(v === 'slots'){
    h = `<div class="mpanel"><h2>${MENU.mode === 'new' ? 'Nueva partida' : MENU.mode === 'coop' ? 'Cooperativa: elige tu partida' : 'Continuar partida'}</h2>${[1, 2, 3].map(slotRow).join('')}<button data-act="back">Volver</button></div>`;
  } else if(v === 'controls'){
    h = `<div class="mpanel"><h2>Controles</h2>${controlsHTML()}<button data-act="back">Volver</button></div>`;
  } else if(v === 'lang'){
    h = `<div class="mpanel"><h2>Idioma</h2>${langHTML()}<button data-act="back">Volver</button></div>`;
  } else if(v === 'config'){
    h = `<div class="mpanel"><h2>Configuración</h2>${configHTML()}<button data-act="back">Volver</button></div>`;
  } else {
    h = `<div class="mpanel"><h2>Sonido</h2>${soundHTML()}<button data-act="back">Volver</button></div>`;
  }
  body.innerHTML = h; bindSound(body); bindConfig(body);
}
$('menuBody').addEventListener('click', e => {
  const t = e.target.closest('button'); if(!t || t.disabled) return;
  const act = t.dataset.act, n = +t.dataset.n; sfx('ui');
  if(act === 'newgame'){ MENU.view = 'slots'; MENU.mode = 'new'; }
  else if(act === 'continue'){ MENU.view = 'slots'; MENU.mode = 'load'; }
  else if(act === 'coop'){ MENU.view = 'slots'; MENU.mode = 'coop'; }
  else if(act === 'coopgo'){ MENU.coopPending = true; startGame(n, !slotInfo(n)); return; }
  else if(act === 'controls') MENU.view = 'controls';
  else if(act === 'sound') MENU.view = 'sound';
  else if(act === 'config') MENU.view = 'config';
  else if(act === 'lang') MENU.view = 'lang';
  else if(act === 'setlang') LANG.set(t.dataset.l);
  else if(act === 'back'){ MENU.view = 'main'; MENU.confirm = null; }
  else if(act === 'no') MENU.confirm = null;
  else if(act === 'new'){ if(slotInfo(n)){ MENU.confirm = {n}; } else { startGame(n, true); return; } }
  else if(act === 'newyes'){ MENU.confirm = null; startGame(n, true); return; }
  else if(act === 'load'){ startGame(n, false); return; }
  else if(act === 'del') MENU.confirm = {n, del:true};
  else if(act === 'delyes'){ try { localStorage.removeItem(slotKey(n)); } catch(e){} MENU.confirm = null; }
  renderMenu();
});

// ---------- fondo del menú: negro total con la jaula; cada 3 s los ojos de la mascota brillan un poco ----------
const MENU_IMG = new Image(); MENU_IMG.src = 'img/jaula-menu.png';
function drawMenu(dt){
  MENU.t += dt; const t = MENU.t, c = $('menuBg'), w = innerWidth, h = innerHeight;
  if(c.width !== w || c.height !== h){ c.width = w; c.height = h; }
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
  if(!MENU_IMG.complete || !MENU_IMG.naturalWidth) return;
  // la imagen (1024 px, jaula en el centro) se escala para que la jaula quede a la derecha del menú
  const sz = Math.round(Math.max(h*1.7, 900)), ix = Math.round(w*(w > 900 ? .79 : .5) - sz/2), iy = Math.round(h*.5 - sz/2 + h*.02);
  g.globalCompositeOperation = 'lighten'; g.drawImage(MENU_IMG, ix, iy, sz, sz); g.globalCompositeOperation = 'source-over';
  // brillo de los ojos: dura ~1 s de cada 3
  const ph = t % 3, u = ph < 1.1 ? Math.sin(ph/1.1*Math.PI) : 0;
  if(u > 0){
    const k = sz/1024;
    for(const ex of [490, 517]){
      const x = ix + ex*k, y = iy + 549*k, r = 15*k + u*5*k, gl = g.createRadialGradient(x, y, 0, x, y, r);
      gl.addColorStop(0, `rgba(255,226,140,${.75*u})`); gl.addColorStop(.45, `rgba(255,170,60,${.28*u})`); gl.addColorStop(1, 'rgba(255,150,40,0)');
      g.fillStyle = gl; g.fillRect(x - r, y - r, r*2, r*2);
      g.fillStyle = `rgba(255,246,200,${.9*u})`; g.fillRect(Math.round(x - 2*k), Math.round(y - 2*k), Math.max(2, Math.round(4*k)), Math.max(2, Math.round(4*k)));
    }
  }
}

// ---------- menú de pausa (Esc) ----------
const PAUSE = {view:'main'};
function openPause(){ G.paused = true; PAUSE.view = 'main'; mouse.l = mouse.r = false; $('pause').classList.remove('hidden'); renderPause(); sfx('ui'); }
function closePause(){ G.paused = false; $('pause').classList.add('hidden'); }
function renderPause(){
  const box = $('pauseBox'), v = PAUSE.view, raid = G.sc && G.sc.kind === 'raid';
  let h = '';
  if(v === 'main'){
    h = `<h2>Pausa</h2><div class="mbtns">
      <button class="mbtn" data-act="resume">Continuar</button><button class="mbtn" data-act="config">Configuración</button><button class="mbtn" data-act="controls">Controles</button>
      ${!raid && typeof LOBBY !== 'undefined' ? '<button class="mbtn" data-act="cooproom">Sala cooperativa</button>' : ''}<button class="mbtn" data-act="lootfilter">Filtro de objetos</button><button class="mbtn" data-act="sound">Volumen</button><button class="mbtn" data-act="lang">Idioma</button><button class="mbtn" data-act="exit">Guardar y salir</button></div>
      ${raid ? '<p class="red small">Estás en una expedición: si sales perderás el equipo, la mochila y las mascotas como si murieras.</p>' : ''}`;
  } else if(v === 'confirm'){
    h = `<h2 class="red">¿Salir de la expedición?</h2><p>Si sales ahora perderás <b>todo lo que llevas</b> (equipo, mochila, oro de la expedición y mascotas) como si hubieras muerto. Lo que hay en el alijo está a salvo.</p>
      <div class="mbtns"><button class="mbtn danger" data-act="exityes">Salir y perderlo todo</button><button class="mbtn" data-act="back">Cancelar</button></div>`;
  } else if(v === 'lang'){
    h = `<h2>Idioma</h2>${langHTML()}<button data-act="back">Volver</button>`;
  } else if(v === 'lootfilter'){
    h = `<h2>Filtro de objetos</h2>${lootFilterHTML()}<button data-act="back">Volver</button>`;
  } else if(v === 'lootclass'){
    h = `<h2>${tr('Filtro de objetos')}</h2>${lootClassHTML(PAUSE.cls)}<button data-act="back">Volver</button>`;
  } else if(v === 'config'){
    h = `<h2>Configuración</h2>${configHTML()}<button data-act="back">Volver</button>`;
  } else if(v === 'controls'){
    h = `<h2>Controles</h2>${controlsHTML()}<button data-act="back">Volver</button>`;
  } else {
    h = `<h2>Volumen</h2>${soundHTML()}<button data-act="back">Volver</button>`;
  }
  box.innerHTML = h; bindSound(box); bindConfig(box);
}
$('pauseBox').addEventListener('click', e => {
  const t = e.target.closest('button'); if(!t) return;
  const act = t.dataset.act; sfx('ui');
  if(act === 'resume'){ closePause(); return; }
  if(act === 'cooproom'){ closePause(); LOBBY.openDen(); return; }
  if(act === 'controls') PAUSE.view = 'controls';
  else if(act === 'sound') PAUSE.view = 'sound';
  else if(act === 'config') PAUSE.view = 'config';
  else if(act === 'lootfilter') PAUSE.view = 'lootfilter';
  else if(act === 'lootclass'){ PAUSE.view = 'lootclass'; PAUSE.cls = t.dataset.c; }
  else if(act === 'lfall' || act === 'lfnone'){ for(const id of lootClassIds(PAUSE.cls)){ if(act === 'lfall') delete SETTINGS.lootItems[PAUSE.cls + ':' + id]; else SETTINGS.lootItems[PAUSE.cls + ':' + id] = false; } saveSettings(); }
  else if(act === 'lang') PAUSE.view = 'lang';
  else if(act === 'setlang') LANG.set(t.dataset.l);
  else if(act === 'back') PAUSE.view = PAUSE.view === 'lootclass' ? 'lootfilter' : 'main';
  else if(act === 'exit'){ if(G.sc.kind === 'raid') PAUSE.view = 'confirm'; else { exitToMenu(); return; } }
  else if(act === 'exityes'){ dropRaidLoss(); exitToMenu(); return; }
  renderPause();
});
function exitToMenu(){
  if(typeof LOBBY !== 'undefined'){ LOBBY.close(true); }
  G.save.inRaid = false; saveGame();
  closePause(); openMainMenu();
}

Object.assign(LANG_EN, {'Normales':'Normal', 'Mágicos':'Magic', 'Raros':'Rare', 'Legendarios (incluye los únicos de jefe)':'Legendary (includes boss uniques)', 'Consumibles (pociones, vendas, aceite, galletas, setas, munición…)':'Consumables (potions, bandages, oil, cookies, mushrooms, ammo…)', 'Misión (siempre visibles)':'Quest (always visible)', 'Llaves':'Keys', 'Tesoros':'Treasures', 'Talismanes':'Talismans', 'Piedras preciosas':'Gems', 'Oro (monedas)':'Gold (coins)',
  'Ver lista':'View list', 'Activar todos':'Enable all', 'Desactivar todos':'Disable all', 'Desde exp.':'From exp.',
  'Lo que desmarques no se verá en el suelo ni se podrá coger (el color de cada tipo es el que ves aquí). El oro desmarcado se sigue recogiendo solo. Las mascotas y los objetos de misión siempre se ven. Pulsa «Ver lista» para activar o desactivar objetos concretos.':'What you untick will not be shown on the ground nor can be picked up (each type shows here the color it has). Unticked gold is still picked up automatically. Pets and quest items are always visible. Press "View list" to enable or disable specific items.'});
LANG.load(LANG_EN);
