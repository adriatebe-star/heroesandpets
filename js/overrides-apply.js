'use strict';
// =====================================================================
//  Ajustes manuales del editor (js/overrides.js) aplicados encima de los datos originales del juego
// =====================================================================
const ORIG = {};   // copia de los datos originales (el editor la usa para «restaurar valor original»)
(function(){
  const roots = {PETS, ITEMS, MONSTERS, ITEM_AFFIX, PET_AFFIX, MON_AFFIX, EXPEDITIONS, HIDDEN_EXPEDITIONS, SHOP, LOOT, TREE_DEF};
  const clone = o => Array.isArray(o) ? o.map(clone) : (o && typeof o === 'object') ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, clone(v)])) : o;   // las funciones se copian por referencia
  for(const k in roots) ORIG[k] = clone(roots[k]);
  const O = (typeof OVERRIDES !== 'undefined' && OVERRIDES) || {}, na = O.newAffixes || {};
  const tplFn = tpl => v => String(tpl).replace('{v}', v);
  // afijos nuevos creados en el editor
  for(const [k, a] of Object.entries(na.item || {})) ITEM_AFFIX[k] = {sfx:a.sfx || '', roll:a.roll || [1, 5], slots:a.slots || [], stat:a.stat || k, descTpl:a.descTpl || '+{v}', desc:tplFn(a.descTpl || '+{v}'), custom:true};
  for(const [k, a] of Object.entries(na.pet || {})) PET_AFFIX[k] = {name:a.name || k, desc:a.desc || '', fx:a.fx || {}, custom:true};
  for(const [k, a] of Object.entries(na.mon || {})) MON_AFFIX[k] = {name:a.name || k, desc:a.desc || '', fx:a.fx || {}, custom:true};
  // valores cambiados (ruta con puntos → valor)
  for(const [path, val] of Object.entries(O.set || {})){
    const p = path.split('.'); let o = roots[p[0]]; if(!o) continue;
    for(let i = 1; i < p.length - 1 && o != null; i++) o = o[p[i]];
    if(o != null) o[p[p.length - 1]] = val;
  }
  if(typeof rebuildTree === 'function') rebuildTree();   // el árbol de Gonzalo sale de TREE_DEF (editable)
  for(const k in ITEM_AFFIX){ const a = ITEM_AFFIX[k]; if(typeof a.descTpl === 'string' && !(a.desc && a.custom)) a.desc = tplFn(a.descTpl); }
  for(const id in PETS) PETS[id].affixes = [...new Set(PETS[id].affixes)];   // los afijos no se repiten
  // la vida de las mascotas sale de su rareza salvo que se haya fijado a mano
  for(const id in PETS){ const p = PETS[id]; if(!(O.set && O.set['PETS.' + id + '.hp'] !== undefined)) p.hp = petBaseHp(p); }
  // traducciones al inglés escritas en el editor
  if(O.lang && typeof LANG_EN !== 'undefined'){ Object.assign(LANG_EN, O.lang); LANG.load(LANG_EN); }
})();
