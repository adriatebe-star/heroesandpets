'use strict';
// =====================================================================
//  Árbol de pasivas de Gonzalo (rework): 5 ramas × 15 niveles × 2 lados = 150 nodos.
//  Todo sale de TREE_DEF (el editor lo modifica desde «Árbol de pasivas»); rebuildTree() reconstruye el grafo.
//  · Cada lado (A y B) de una rama tiene 2 tipos de nodo pequeño que se alternan por nivel (A1/A2 y B1/B2).
//  · Los nodos grandes (notables) llevan un código (m5, m10…, m25, m26, m30) que usa el código del juego: MS('agr', 25)…
//  · Las estadísticas se suman en actors.js (treeCache → TT('dm')…).
// =====================================================================
const TREE_STATS = ['dm', 'cr', 'al', 'av', 'ar', 'pd', 'pc', 'mv', 'es', 'st', 'rg', 'ga', 'ar2', 'hp', 'hr', 'bo', 'or', 'ra', 'ac'];
const TREE_STAT_TXT = {dm:' % de daño cuerpo a cuerpo', cr:' % de crítico', al:' % de alcance de los golpes', av:' % de velocidad de ataque', ar:' % de arco de los golpes',
  pd:' % de daño de proyectiles', pc:' % de crítico a distancia', mv:' % de velocidad de movimiento', es:' % de esquivar', st:' de estamina máxima', rg:' % de regeneración de estamina', ga:' % menos de gasto de estamina',
  ar2:' de armadura', hp:' de vida máxima', hr:' de vida por segundo', bo:' % de botín', or:' % de oro', ra:' % de rapidez al abrir cofres y jaulas', ac:' % menos de consumo de aceite'};
const treeTy = o => Object.fromEntries(TREE_STATS.map(k => [k, o[k] || 0]));
const treeNot = (L, lane, name, desc) => ({name, desc, L, lane});
const TREE_DEF = {
  agr:{name:'Agresividad', col:'#ff7a5a', desc:'Daño cuerpo a cuerpo y en área', sideA:'Verdugo', sideB:'Torbellino',
    types:{A1:treeTy({dm:3}), A2:treeTy({cr:1, dm:1}), B1:treeTy({al:2}), B2:treeTy({av:1.5, ar:1})},
    notables:{m5:treeNot(3, 0, 'Instinto asesino', '+5 % de crítico'), m10:treeNot(5, 1, 'Barrido', 'Los golpes cuerpo a cuerpo barren un 15 % más de arco'), m15:treeNot(8, 0, 'Ojo del verdugo', '+5 % de crítico'), m20:treeNot(10, 1, 'Onda sísmica', 'Los críticos cuerpo a cuerpo provocan una onda expansiva'),
      m25:treeNot(12, 0, 'Sed de sangre', '+5 % de robo de vida'), m26:treeNot(13, 1, 'Furia', '+25 % de daño con menos del 50 % de vida'), m30:treeNot(15, 0, 'Maestro de armas', '+15 % de daño con todas las armas')}},
  agi:{name:'Agilidad', col:'#7ae0a0', desc:'Movimiento, esquiva y proyectiles', sideA:'Cazador', sideB:'Sombra',
    types:{A1:treeTy({pd:3}), A2:treeTy({pc:1, pd:1.5}), B1:treeTy({mv:1.5}), B2:treeTy({es:1.5})},
    notables:{m5:treeNot(3, 1, 'Paso rápido', 'La esquiva (espacio) recarga un 20 % más rápido'), m10:treeNot(5, 0, 'Reflejos felinos', '+5 % de esquivar golpes'), m15:treeNot(8, 1, 'Viento', 'La esquiva recarga un 20 % más rápido'), m20:treeNot(10, 0, 'Disparo perforante', 'Tus flechas y piedras atraviesan a un enemigo más'),
      m25:treeNot(12, 1, 'Ráfaga', 'El 10 % de los disparos lanza un proyectil extra'), m26:treeNot(13, 0, 'Pies ligeros', 'El salto gasta un 20 % menos de estamina y llega más lejos'), m30:treeNot(15, 1, 'Cazador de élite', '+15 % de daño de proyectiles y +10 % de crítico')}},
  car:{name:'Cardio', col:'#c8f070', desc:'Estamina', sideA:'Fondo', sideB:'Recuperación',
    types:{A1:treeTy({st:5}), A2:treeTy({st:3, rg:1}), B1:treeTy({rg:3}), B2:treeTy({ga:1.5})},
    notables:{m5:treeNot(3, 0, 'Zancada larga', 'Correr gasta un 15 % menos'), m10:treeNot(5, 1, 'Ritmo de combate', 'Atacar gasta un 15 % menos'), m15:treeNot(8, 0, 'Guardia firme', 'Cubrirse gasta un 25 % menos'), m20:treeNot(10, 1, 'No fumador', 'Todas las acciones gastan un 10 % menos de estamina'),
      m25:treeNot(12, 1, 'Segunda reserva', '+30 de estamina máxima'), m26:treeNot(13, 0, 'Pulmones de acero', 'La estamina empieza a regenerarse un 30 % antes'), m30:treeNot(15, 1, 'Maratonista', '+10 % de velocidad al correr y correr gasta un 20 % menos')}},
  agu:{name:'Aguante', col:'#ff9aa8', desc:'Vida, regeneración, armadura y mochila', sideA:'Coraza', sideB:'Vitalidad',
    types:{A1:treeTy({ar2:1}), A2:treeTy({ar2:.5, hp:3}), B1:treeTy({hp:7}), B2:treeTy({hr:.2, hp:3})},
    notables:{m4:treeNot(2, 1, 'Mochila reforzada I', '+1 hueco de mochila'), m8:treeNot(4, 0, 'Mochila reforzada II', '+1 hueco de mochila'), m12:treeNot(6, 1, 'Mochila reforzada III', '+1 hueco de mochila'), m16:treeNot(8, 0, 'Mochila reforzada IV', '+1 hueco de mochila'), m20:treeNot(10, 1, 'Mochila reforzada V', '+1 hueco de mochila'),
      m25:treeNot(12, 0, 'Piel de roca', '−5 % de daño recibido'), m26:treeNot(13, 1, 'Voluntad inquebrantable', 'Una vez por expedición resistes un golpe mortal con 1 de vida'), m30:treeNot(15, 0, 'Titán', '+10 % de vida máxima y +1 hueco de mochila')}},
  exp:{name:'Explorador', col:'#ffd870', desc:'Cofres, jaulas, botín y aceite', sideA:'Saqueador', sideB:'Rastreador',
    types:{A1:treeTy({bo:3}), A2:treeTy({or:2, bo:1}), B1:treeTy({ra:4}), B2:treeTy({ac:2, ra:2})},
    notables:{m5:treeNot(3, 1, 'Ojo de buscador', 'Ves los cofres cercanos marcados'), m10:treeNot(5, 0, 'Olfato para el oro', '+10 % de oro'), m15:treeNot(8, 1, 'Codicia', '+10 % de oro'), m20:treeNot(10, 0, 'Cerrajero maestro', 'Los cofres raros dan un objeto extra'),
      m25:treeNot(12, 1, 'Ojo de águila', 'Las jaulas cercanas salen marcadas en el minimapa'), m26:treeNot(13, 0, 'Suerte del buscador', '+5 % de objetos mágicos o raros'), m30:treeNot(15, 0, 'Cazador de tesoros', '+15 % de oro y los cofres normales dan un objeto extra el 20 % de las veces')}},
};
const SKILL_MAX = 30;
const SKILLS = {}, NOTABLE_NAMES = {};
const TREE = {nodes:[], byId:{}, adj:{}};
const treeNum = v => String(Math.round(v*100)/100).replace('.', ',');
const treeEffText = o => Object.entries(o || {}).filter(([k, v]) => +v && TREE_STAT_TXT[k]).map(([k, v]) => '+' + treeNum(v) + TREE_STAT_TXT[k]).join(' · ');
// texto del nodo bajo el cursor (el panel de Gonzalo)
function treeNodeTip(n){
  const d = SKILLS[n.b], b = TREE_DEF[n.b];
  if(n.notable) return `<b style="color:${n.fin ? '#ffd84a' : d.col}">${n.name}</b>${n.fin ? ' <span style="color:#ffd84a">★</span>' : ''}<div class="sub">${n.fin ? 'Nodo final' : 'Notable'} de ${d.name} · lado ${n.side} (${n.sideName})</div><div class="aff">◆ ${d.miles[n.notable]}</div><div class="desc">Además: ${treeEffText(n.eff)}</div>`;
  return `<b style="color:${d.col}">${d.name}</b><div class="sub">Lado ${n.side} · ${n.sideName}</div><div class="desc">${treeEffText(n.eff)}</div>`;
}
function rebuildTree(){
  TREE.nodes = []; TREE.byId = {}; TREE.adj = {};
  for(const k in SKILLS) delete SKILLS[k]; for(const k in NOTABLE_NAMES) delete NOTABLE_NAMES[k];
  const add = n => { TREE.nodes.push(n); TREE.byId[n.id] = n; TREE.adj[n.id] = []; };
  const link = (a, c) => { TREE.adj[a].push(c); TREE.adj[c].push(a); };
  add({id:'start', b:null, x:0, y:0, start:true, name:'Inicio'});
  const keys = Object.keys(TREE_DEF);
  keys.forEach((k, bi) => {
    const def = TREE_DEF[k], th = -Math.PI/2 + bi*2*Math.PI/keys.length;
    SKILLS[k] = {name:def.name, col:def.col, desc:def.desc, miles:{}, sideA:def.sideA, sideB:def.sideB,
      per:`Lado A · ${def.sideA}: ${treeEffText(def.types.A1)} · ${treeEffText(def.types.A2)}<br>Lado B · ${def.sideB}: ${treeEffText(def.types.B1)} · ${treeEffText(def.types.B2)}`};
    NOTABLE_NAMES[k] = {};
    for(let L = 1; L <= 15; L++) for(let lane = 0; lane < 2; lane++){
      const r = 62 + L*38, ang = th + (lane ? 1 : -1)*(.24 - L*.009), sd = lane ? 'B' : 'A';
      add({id:k + L + '_' + lane, b:k, L, lane, x:Math.cos(ang)*r, y:Math.sin(ang)*r, side:sd, sideName:lane ? def.sideB : def.sideA, eff:def.types[sd + (L % 2 === 1 ? '1' : '2')], isNew:L > 10});
    }
    for(const [key, nd] of Object.entries(def.notables)){
      const code = +key.slice(1), n = TREE.byId[k + nd.L + '_' + nd.lane]; if(!n) continue;
      n.notable = code; n.name = nd.name; n.fin = code === 30; SKILLS[k].miles[code] = nd.desc; NOTABLE_NAMES[k][code] = nd.name;
    }
    link('start', k + '1_0'); link('start', k + '1_1');
    for(let L = 1; L <= 15; L++){
      if(L % 2 === 1) link(k + L + '_0', k + L + '_1');                 // travesaños: permiten cambiar de lado
      if(L < 15){ link(k + L + '_0', k + (L + 1) + '_0'); link(k + L + '_1', k + (L + 1) + '_1'); }
    }
  });
  // puentes entre ramas vecinas (el del nivel 12 es nuevo)
  keys.forEach((k, bi) => { const k2 = keys[(bi + 1) % keys.length]; for(const L of [4, 8, 12]) link(k + L + '_1', k2 + L + '_0'); });
}
rebuildTree();

// ---------- traducción ----------
(function(){
  const en = {
    'Verdugo':'Executioner', 'Torbellino':'Whirlwind', 'Cazador':'Hunter', 'Sombra':'Shadow', 'Fondo':'Stamina', 'Recuperación':'Recovery', 'Coraza':'Plate', 'Vitalidad':'Vitality', 'Saqueador':'Looter', 'Rastreador':'Tracker',
    'Sed de sangre':'Bloodlust', 'Furia':'Fury', 'Maestro de armas':'Weapon master', 'Ráfaga':'Volley', 'Pies ligeros':'Light feet', 'Cazador de élite':'Elite hunter', 'Segunda reserva':'Second reserve', 'Pulmones de acero':'Iron lungs', 'Maratonista':'Marathoner',
    'Piel de roca':'Rock skin', 'Voluntad inquebrantable':'Unbreakable will', 'Titán':'Titan', 'Ojo de águila':'Eagle eye', 'Suerte del buscador':'Seeker\'s luck', 'Cazador de tesoros':'Treasure hunter',
    '+5 % de robo de vida':'+5% life steal', '+25 % de daño con menos del 50 % de vida':'+25% damage below 50% health', '+15 % de daño con todas las armas':'+15% damage with all weapons', 'El 10 % de los disparos lanza un proyectil extra':'10% of shots fire an extra projectile',
    'El salto gasta un 20 % menos de estamina y llega más lejos':'Jumping costs 20% less stamina and goes farther', '+15 % de daño de proyectiles y +10 % de crítico':'+15% projectile damage and +10% critical chance', '+30 de estamina máxima':'+30 maximum stamina',
    'La estamina empieza a regenerarse un 30 % antes':'Stamina starts regenerating 30% sooner', '+10 % de velocidad al correr y correr gasta un 20 % menos':'+10% run speed and running costs 20% less', '−5 % de daño recibido':'−5% damage taken',
    'Una vez por expedición resistes un golpe mortal con 1 de vida':'Once per expedition you survive a deadly blow with 1 health', '+10 % de vida máxima y +1 hueco de mochila':'+10% maximum health and +1 backpack slot', 'Las jaulas cercanas salen marcadas en el minimapa':'Nearby cages are marked on the minimap',
    '+5 % de objetos mágicos o raros':'+5% magic or rare items', '+15 % de oro y los cofres normales dan un objeto extra el 20 % de las veces':'+15% gold and normal chests give an extra item 20% of the time',
    'Lado':'Side', 'Nodo final':'Final node', 'Notable':'Notable', 'lado':'side',
    '+{} % de daño cuerpo a cuerpo':'+{}% melee damage', '+{} % de crítico':'+{}% critical chance', '+{} % de alcance de los golpes':'+{}% hit reach', '+{} % de velocidad de ataque':'+{}% attack speed', '+{} % de arco de los golpes':'+{}% hit arc',
    '+{} % de daño de proyectiles':'+{}% projectile damage', '+{} % de crítico a distancia':'+{}% ranged critical chance', '+{} % de velocidad de movimiento':'+{}% movement speed', '+{} % de esquivar':'+{}% dodge', '+{} de estamina máxima':'+{} maximum stamina',
    '+{} % de regeneración de estamina':'+{}% stamina regeneration', '+{} % menos de gasto de estamina':'+{}% less stamina cost', '+{} de armadura':'+{} armor', '+{} de vida máxima':'+{} maximum health', '+{} de vida por segundo':'+{} health per second',
    '+{} % de botín':'+{}% loot', '+{} % de oro':'+{}% gold', '+{} % de rapidez al abrir cofres y jaulas':'+{}% faster opening chests and cages', '+{} % menos de consumo de aceite':'+{}% less oil consumption',
  };
  Object.assign(LANG_EN, en); if(typeof LANG !== 'undefined' && LANG.load) LANG.load(LANG_EN);
})();
