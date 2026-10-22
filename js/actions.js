'use strict';
// =====================================================================
//  Barra de acciones: 13 huecos (clic izq., clic der., Q, E, R, T, 1-6 y la barra espaciadora).
//  Clic derecho sobre un hueco: menú con todas las acciones que se le pueden asignar.
// =====================================================================
const ACTIONS = {
  none:    {name:'Vacío'},
  attack:  {name:'Atacar con el arma activa'},
  run:     {name:'Correr (mantener)'},
  block:   {name:'Cubrirse con el escudo'},
  swap:    {name:'Cambiar de arma', trigger:true},
  jump:    {name:'Saltar', trigger:true},
  lantern: {name:'Farolillo: encender / apagar', trigger:true},
  potion:  {name:'Beber poción de vida', trigger:true, item:['potion', 'superpotion']},
  bandage: {name:'Usar vendas', trigger:true, item:['bandage']},
  oil:     {name:'Usar frasco de aceite', trigger:true, item:['oil']},
  cookie:  {name:'Dar una galleta a las mascotas', trigger:true, item:['cookie']},
  mushroom:{name:'Comer una seta', trigger:true, item:['mushroom']},
};
const BAR_SLOTS = [['lmb', 'Izq'], ['rmb', 'Der'], ['KeyQ', 'Q'], ['KeyE', 'E'], ['KeyR', 'R'], ['KeyT', 'T'],
                   ['Digit1', '1'], ['Digit2', '2'], ['Digit3', '3'], ['Digit4', '4'], ['Digit5', '5'], ['Digit6', '6'], ['Shift', 'Shift'], ['Space', 'Espacio']];
const SLOT_TITLE = {lmb:'Clic izquierdo', rmb:'Clic derecho', KeyQ:'Tecla Q', KeyE:'Tecla E', KeyR:'Tecla R', KeyT:'Tecla T',
                    Digit1:'Tecla 1', Digit2:'Tecla 2', Digit3:'Tecla 3', Digit4:'Tecla 4', Digit5:'Tecla 5', Digit6:'Tecla 6', Shift:'Tecla Shift', Space:'Barra espaciadora'};
const DEFAULT_BARS = {lmb:'attack', rmb:'block', KeyQ:'swap', KeyE:'lantern', KeyR:'none', KeyT:'none',
                      Digit1:'potion', Digit2:'bandage', Digit3:'oil', Digit4:'cookie', Digit5:'mushroom', Digit6:'none', Shift:'run', Space:'jump'};
const REMAP = ['KeyQ', 'KeyE', 'KeyR', 'KeyT', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6'];   // huecos cuya tecla se puede cambiar (clic derecho)
const RESERVED_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyI', 'KeyM', 'KeyH', 'Tab', 'Escape', 'Space', 'ShiftLeft', 'ShiftRight', 'Enter'];
function fixBars(s){
  s.binds = Object.assign({}, s.binds || {}); for(const k of Object.keys(s.binds)) if(!REMAP.includes(k) || typeof s.binds[k] !== 'string' || s.binds[k] === k) delete s.binds[k];
  s.bars = Object.assign({}, DEFAULT_BARS, s.bars || {});
  for(const [id] of BAR_SLOTS) if(!ACTIONS[s.bars[id]]) s.bars[id] = DEFAULT_BARS[id];
  s.bars.lmb = 'attack';   // el clic izquierdo no se puede cambiar
}
// ---------- estado de las entradas ----------
const bindOf = id => (G.save && G.save.binds && G.save.binds[id]) || id;   // tecla o botón asignado al hueco
const slotDown = id => id==='lmb' ? mouse.l : id==='rmb' ? mouse.r : id==='Shift' ? !!(keys.ShiftLeft || keys.ShiftRight) : !!keys[bindOf(id)];
const slotPressed = id => id==='lmb' ? mouse.lp : id==='rmb' ? mouse.rp : id==='Shift' ? !!(pressed.ShiftLeft || pressed.ShiftRight) : !!pressed[bindOf(id)];
// texto corto de una tecla o botón del ratón para la barra
function inputLabel(c){
  if(/^Key[A-Z]$/.test(c)) return c.slice(3);
  if(/^Digit\d$/.test(c)) return c.slice(5);
  if(c === 'Mouse1') return 'Rueda';
  if(/^Mouse\d$/.test(c)) return 'Ratón ' + (+c.slice(5) + 1);
  if(/^Numpad/.test(c)) return 'N' + c.slice(6).replace('Multiply', '*').replace('Divide', '/').replace('Subtract', '-').replace('Add', '+').replace('Decimal', '.').replace('Enter', 'Ent');
  return ({ArrowUp:'↑', ArrowDown:'↓', ArrowLeft:'←', ArrowRight:'→', Backquote:'º', Minus:'-', Equal:'=', Comma:',', Period:'.', Slash:'/', Semicolon:';', Quote:"'", BracketLeft:'[', BracketRight:']', Backslash:'\\', ControlLeft:'Ctrl', ControlRight:'Ctrl', AltLeft:'Alt', AltRight:'Alt', Backspace:'Ret', CapsLock:'Bloq', Insert:'Ins', Delete:'Supr', PageUp:'RePág', PageDown:'AvPág'})[c] || c;
}
const actionHeld = a => !!(G.save && G.save.bars) && BAR_SLOTS.some(([id]) => G.save.bars[id]===a && slotDown(id));
const actionPressed = a => !!(G.save && G.save.bars) && BAR_SLOTS.some(([id]) => G.save.bars[id]===a && slotPressed(id));
// acciones de un solo toque
function runAction(a){
  if(a==='swap'){ G.activeW = 1-G.activeW; refreshStats(); const w = curWeapon(); toast('Arma: ' + (w ? itemName(w) : 'Puños'), 1); sfx('equip'); }
  else if(a==='jump') tryJump();
  else if(a==='lantern'){
    const inRaid = G.sc.kind==='raid';
    if(!G.inv.equip.lantern) toast('No llevas ningún farolillo equipado');
    else if(!P.lantern && P.oil <= 0 && inRaid) toast('El farolillo no tiene aceite');
    else { P.lantern = !P.lantern; sfx('click'); }
  } else if(ACTIONS[a] && ACTIONS[a].item) useConsumable(a);
}
const TRIGGER_ACTIONS = Object.keys(ACTIONS).filter(a => ACTIONS[a].trigger);

// ---------- dibujo de la barra (abajo a la derecha) ----------
const HUD_SLOTS = [];
const hudSlotAt = (x, y) => HUD_SLOTS.find(s => x >= s.x && x <= s.x+s.w && y >= s.y && y <= s.y+s.h) || null;
function drawActionBar(HS, fs, ls){
  HUD_SLOTS.length = 0;
  const B = Math.round(54*HS), g = Math.round(8*HS), x0 = W - 24 - 6*(B+g) + g, wideH = Math.round(B*.5), shiftW = 2*B + g, spaceW = 4*B + 3*g;
  const yWide = H - 24 - wideH, yBot = yWide - g - B, yTop = yBot - g - B;
  const E = G.inv.equip, bars = G.save.bars;
  const count = ids => countItems(ids);
  BAR_SLOTS.forEach(([id, label], i) => {
    if(id==='Space' || id==='Shift'){   // Shift y la barra espaciadora: huecos anchos debajo de las dos filas
      const act = bars[id], a2 = ACTIONS[act], wx = id==='Shift' ? x0 : x0 + shiftW + g, ww = id==='Shift' ? shiftW : spaceW;
      HUD_SLOTS.push({id, x:wx, y:yWide, w:ww, h:wideH}); hudFrame(wx, yWide, ww, wideH);
      if((act==='run' && P.running) || (act==='jump' && P.jump)){ ctx.fillStyle = '#e8c070'; ctx.fillRect(wx, yWide + wideH, ww, S*2); }
      ctx.font = `${Math.round(ls*.85)}px ${FONT}`; ctx.textAlign = 'center';
      textO((id==='Shift' ? 'Shift' : 'Espacio') + ' · ' + (act==='none' ? 'vacío' : a2.name.replace(' (mantener)', '').replace('Atacar con el arma activa', 'Atacar')), wx + ww/2, yWide + wideH/2 + 1, '#e8dcc0'); ctx.textAlign = 'left';
      return;
    }
    const x = x0 + (i%6)*(B+g), y = i < 6 ? yTop : yBot, act = bars[id];
    HUD_SLOTS.push({id, x, y, w:B, h:B});
    hudFrame(x, y, B, B);
    let icon = null, text = null, n = null, dim = false, active = false, durIt = null, cd = 0;
    if(act==='attack'){
      const w = curWeapon(); icon = w ? ICONS[ITEMS[w.id].icon] : null; text = w ? null : 'Puños'; durIt = w; active = P.punchT > 0;
      if(w && (w.id==='bow' || w.id==='crossbow')) n = countItems(['arrows','firearrows','explosivearrows']);
      else if(w && w.n > 1) n = w.n;
    } else if(act==='block'){
      const sh = E.shield; icon = sh ? ICONS[ITEMS[sh.id].icon] : null; text = sh ? null : 'Escudo'; dim = !sh; active = P.blocking; durIt = sh;
    } else if(act==='swap'){
      const o = G.activeW===0 ? E.w2 : E.w1; icon = o ? ICONS[ITEMS[o.id].icon] : null; text = o ? null : 'Cambiar';
    } else if(act==='run'){ text = 'Correr'; active = P.running;
    } else if(act==='jump'){ text = 'Saltar'; dim = P.st < STAM.jump;
    } else if(act==='lantern'){
      const lt = E.lantern; icon = lt ? ICONS[ITEMS[lt.id].icon] : null; text = lt ? null : 'Farol'; dim = !P.lantern; active = P.lantern;
    } else if(ACTIONS[act] && ACTIONS[act].item){
      const ids = ACTIONS[act].item, it = ids.find(q => count([q]) > 0) || ids[0]; n = count(ids); icon = ICONS[ITEMS[it].icon]; dim = !n;
      if(act==='potion') cd = Math.max(0, P.potionCd || 0);
    }
    if(active){ ctx.fillStyle = '#e8c070'; ctx.fillRect(x-S*2, y-S*2, B+S*4, S*2); ctx.fillRect(x-S*2, y+B, B+S*4, S*2); }
    ctx.globalAlpha = dim ? .35 : 1;
    if(icon) ctx.drawImage(icon, x+3, y+3, B-6, B-6);
    else if(text){ ctx.font = `${Math.round(ls*.9)}px ${FONT}`; ctx.textAlign = 'center'; textO(text, x+B/2, y+B/2+2, '#c8b890'); ctx.textAlign = 'left'; }
    ctx.globalAlpha = 1;
    if(durIt && durIt.dur !== undefined){ const f = durIt.dur/maxDur(durIt); ctx.fillStyle = '#2a2020'; ctx.fillRect(x+4, y+B-6, B-8, 4); ctx.fillStyle = f > .3 ? '#7ad86a' : '#ff6a3a'; ctx.fillRect(x+4, y+B-6, Math.round((B-8)*f), 4); }
    if(n !== null && n !== undefined && (n > 1 || ACTIONS[act].item)){ ctx.font = `${fs}px ${FONT}`; ctx.textAlign = 'right'; textO(n, x+B-4, y+B-10); ctx.textAlign = 'left'; }
    if(cd > 0){
      const f = Math.min(1, cd/10); ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(x+3, y+3 + (B-6)*(1-f), B-6, (B-6)*f);
      ctx.font = `${fs}px ${FONT}`; ctx.textAlign = 'center'; textO(Math.ceil(cd), x+B/2, y+B/2-4, '#ffe08a'); ctx.textAlign = 'left';
    }
    ctx.font = `${Math.round(ls*.85)}px ${FONT}`; textO(REMAP.includes(id) ? inputLabel(bindOf(id)) : label, x+4, y+11, REMAP.includes(id) && bindOf(id) !== id ? '#9affb0' : '#ffe08a');
  });
  return yTop;
}

// ---------- menú de acciones (clic derecho sobre un hueco) ----------
function openActionMenu(slot, x, y){
  const m = $('actMenu');
  m.innerHTML = `<div class="amh">${SLOT_TITLE[slot.id]}: elige su acción</div>` +
    Object.entries(ACTIONS).map(([k, a]) => `<button data-a="${k}" class="${G.save.bars[slot.id]===k ? 'on' : ''}">${a.name}</button>`).join('');
  m.classList.remove('hidden');
  m.style.left = Math.max(8, Math.min(x, innerWidth - m.offsetWidth - 8)) + 'px';
  m.style.top = Math.max(8, y - m.offsetHeight - 8) + 'px';
  m.dataset.slot = slot.id; sfx('ui');
}
const closeActionMenu = () => $('actMenu').classList.add('hidden');
$('actMenu').addEventListener('click', e => {
  const b = e.target.closest('button'); if(!b) return;
  G.save.bars[$('actMenu').dataset.slot] = b.dataset.a; saveGame(); closeActionMenu(); sfx('ui');
});
$('actMenu').addEventListener('contextmenu', e => e.preventDefault());
addEventListener('mousedown', e => { if(!$('actMenu').classList.contains('hidden') && !$('actMenu').contains(e.target)) closeActionMenu(); }, true);
// ratón sobre la barra: clic izquierdo o derecho sobre un hueco abre el menú para elegir su acción
function hudSlotMouse(slot, e){
  if(G.menu || G.paused || UI.blocking()) return;
  if(e.button !== 0 && e.button !== 2) return;
  if(e.button === 2 && REMAP.includes(slot.id)){ startRebind(slot); return; }   // clic derecho: asignar otra tecla o botón del ratón
  if(slot.id==='lmb') toast('El clic izquierdo no se puede cambiar', 1.6);
  else openActionMenu(slot, e.clientX, e.clientY);   // clic izquierdo: elegir la acción del hueco
}
// ---------- cambiar la tecla de un hueco ----------
let REBIND = null;
function startRebind(slot){
  closeActionMenu(); REBIND = {id:slot.id}; const p = $('bindPrompt');
  p.textContent = `Pulsa una tecla o un botón del ratón para «${SLOT_TITLE[slot.id]}» (Esc: cancelar · Supr: restablecer)`; p.classList.remove('hidden'); sfx('ui');
}
function endRebind(){ REBIND = null; $('bindPrompt').classList.add('hidden'); }
function assignBind(code){
  const id = REBIND.id, binds = G.save.binds || (G.save.binds = {});
  if(code === 'Escape'){ endRebind(); return; }
  if(code === 'Delete' || code === 'Backspace'){ delete binds[id]; endRebind(); saveGame(); toast('Tecla restablecida', 1.4); sfx('ui'); return; }
  if(RESERVED_KEYS.includes(code)){ toast('Esa tecla está reservada', 1.6); return; }
  const other = REMAP.find(o => o !== id && bindOf(o) === code);   // si ya la usa otro hueco, se intercambian
  const old = bindOf(id);
  if(other){ if(old === other) delete binds[other]; else binds[other] = old; }
  if(code === id) delete binds[id]; else binds[id] = code;
  endRebind(); saveGame(); toast(`${SLOT_TITLE[id]}: ahora ${inputLabel(code)}`, 1.8); sfx('equip');
}
addEventListener('keydown', e => { if(!REBIND) return; e.preventDefault(); e.stopImmediatePropagation(); if(e.repeat) return; assignBind(e.code); }, true);
addEventListener('mousedown', e => {
  if(!REBIND) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if(e.button === 0 || e.button === 2){ toast('Los clics izquierdo y derecho no se pueden asignar', 1.8); endRebind(); return; }
  assignBind('Mouse' + e.button);
}, true);
