'use strict';
// =====================================================================
//  Línea de misiones principales. Normas del usuario:
//  · quien tenga una misión para ti lleva un «!» sobre la cabeza;
//  · no se puede avanzar de expedición sin completar la misión de la expedición actual;
//  · la primera vez que hablas con un PNJ te explica todos sus servicios.
//  G.save.qs[id] = 'active' | 'done'. Una misión está disponible cuando la anterior está hecha y su PNJ está en la guarida.
// =====================================================================
const QUESTS = [
  {id:'friends', giver:'juan', exp:'village', title:'Rescata a los amigos de Juan', auto:true,
    met:() => G.save.trapis && G.save.gonzalo,
    obj:() => ['Rescata a Trapis y a Gonzalo,', 'escondidos en cabañas del pueblo', `Trapis ${G.save.trapis ? '✔' : '✘'} · Gonzalo ${G.save.gonzalo ? '✔' : '✘'}`],
    done:['¡Los has rescatado! Trapis y Gonzalo ya viven en la guarida.']},
  {id:'cousin', giver:'gonzalo', exp:'cemetery', title:'Encuentra al primo de Gonzalo',
    offer:['Gracias por sacarme de aquella cabaña. Te debo una... y tengo otro favor que pedirte.', 'Mi primo Chemma es un druida experto en mascotas. Salió al cementerio a rescatar mascotas y no volvió.', 'Si lo encuentras te regalaré 10 setas comestibles. Guárdalas bien en tu alijo y no te lleves todas a la expedición.'],
    met:() => G.save.druid, obj:() => ['Encuentra a Chemma, el druida,', 'en algún lugar del cementerio', 'y llévalo a la guarida'],
    ready:['¡Chemma está a salvo! Sabía que podías hacerlo.', 'Aquí tienes tus 10 setas comestibles. Guárdalas bien en tu alijo.'],
    reward:() => { giveQuestItem('mushroom', 10); }},
  {id:'countess', giver:'druid', exp:'crypt', title:'Mata a la Condesa',
    offer:['Gracias por sacarme de allí, de verdad. Ahora la guarida es mi hogar.', 'En la cripta, la Condesa fantasma tiene atrapadas a un montón de mascotas. Si la matas, podrás liberar a tu primera mascota brillante asegurada.', 'Tráeme su derrota y te daré 20 galletas para mascotas.'],
    met:() => G.save.bossDone && G.save.bossDone.crypt, obj:() => ['Derrota a la Condesa fantasma', 'en la cripta'],
    ready:['¿La Condesa ha caído? Las mascotas respiran por fin.', 'Aquí tienes 20 galletas para mascotas.'],
    reward:() => { giveQuestItem('cookie', 20); }},
  {id:'medkit', giver:'druid', exp:'plains', title:'Encuentra el botiquín de Chemma',
    offer:['Perdí mi botiquín en las planicies salvajes. Es un objeto de misión verde fluorescente que encontrarás en algún lugar del mapa.', 'Si mueres con él lo perderás y tendrás que volver a buscarlo por la expedición.', 'Cuando me lo traigas desbloquearé para ti «Mejorar mascotas» y te regalaré 1 uso de suero.'],
    met:() => countItem('medkit') > 0, obj:() => ['Encuentra el botiquín de Chemma', '(objeto verde fluorescente)', 'en las planicies salvajes', countItem('medkit') > 0 ? '✔ Lo tienes: llévaselo a Chemma' : '✘ Aún no lo has encontrado'],
    ready:['¡Mi botiquín! Pensé que lo había perdido para siempre.', 'Ahora puedo prepararte sueros: tendrás la pestaña «Mejorar mascotas». Y toma 1 uso de suero gratis.'],
    reward:() => { takeItem('medkit'); G.save.labUnlocked = true; G.save.freeSerum = (G.save.freeSerum || 0) + 1; }},
  {id:'uakala', giver:'juan', exp:'orccamp', title:'Encuentra a Uakala', auto:true,
    offer:['Dicen los rumores que los propios orcos tienen desertores.', 'Uno de ellos no está a favor de hacer daño a las mascotas. Encuéntralo en el campamento orco: quizá sea un gran aliado para nosotros.'],
    met:() => G.save.uakalaHome, obj:() => ['Encuentra a Uakala,', 'el orco desertor, en algún', 'lugar del campamento orco', 'e invítalo a la guarida'],
    done:['Uakala vive ahora en la guarida: ya tienes herrero.']},
  {id:'urr', giver:'uakala', exp:'castle', title:'Vence a Urr',
    offer:['Este maldito orco no tiene escrúpulos ni sentimientos.', 'Ve a su castillo y dale su merecido. Te daré una recompensa.'],
    met:() => G.save.bossDone && G.save.bossDone.castle, obj:() => ['Vence a Urr, el gran jefe orco,', 'en el castillo de Urr'],
    ready:['¿Urr ha caído? Eso es justicia.', 'Toma este tótem orco: podrás venderlo por 2000 de oro.'],
    reward:() => { giveQuestItem('orctotem', 1); }},
  {id:'aish', giver:'juan', exp:'river', title:'Encuentra a Aish', auto:true,
    offer:['Cerca del río han visto un elfo que ha logrado escapar del velo del Señor de la Noche.', 'Dicen que es un experto en piedras preciosas y que domina sus poderes. Encuéntralo en un lugar aleatorio del río travieso e invítalo a nuestra guarida.'],
    met:() => G.save.aishHome, obj:() => ['Encuentra a Aish, el elfo de luz,', 'en algún lugar del río travieso', 'e invítalo a la guarida'],
    done:['Aish vive en la guarida: te enseñará a usar las gemas.']},
  {id:'map', giver:'aish', exp:'forest', title:'Busca el mapa hacia el templo',
    offer:['Existe un mapa que muestra el camino al templo sagrado. Se perdió en el bosque élfico.', 'Es un objeto de misión verde fluorescente. Si mueres con él lo perderás.', 'Entrégamelo y te abriré el acceso al templo sagrado.'],
    met:() => countItem('templemap') > 0, obj:() => ['Encuentra el mapa del templo', '(objeto verde fluorescente)', 'en el bosque élfico', countItem('templemap') > 0 ? '✔ Lo tienes: llévaselo a Aish' : '✘ Aún no lo has encontrado'],
    ready:['¡El mapa! Sí... aquí está marcado el camino.', 'Ya puedes ir al templo sagrado.'],
    reward:() => { takeItem('templemap'); }},
  {id:'wizard', giver:'aish', exp:'temple', title:'Vence al brujo élfico',
    offer:['El brujo élfico impide el paso hacia el norte.', 'Véncelo y te recompensaré con 1 llave de la mina, un farolillo élfico y un arco élfico.'],
    met:() => G.save.bossDone && G.save.bossDone.temple, obj:() => ['Vence al brujo élfico', 'en el templo sagrado'],
    ready:['¡Has vencido al brujo! El norte vuelve a estar abierto.', 'Cumplo mi promesa: una llave de la mina, un farolillo élfico y un arco élfico.'],
    reward:() => { giveQuestItem('minekey', 1); giveQuestItem('elflantern', 1); giveQuestItem('elfbow', 1); }},
  {id:'climb', giver:'juan', exp:'icepeak', title:'Asciende la montaña',
    offer:['Asciende la montaña: cruza el ascenso gélido y vence a su guardián.', 'Dicen que más allá del norte hay un pueblo que flota encima de un lago, y allí encontrarás unas mascotas espectaculares.', 'Por el camino te encontrarás con Alexandra. Recibí una carta suya: la han expulsado de los pueblos del norte. Es una mujer muy maja, pero la pobre está enganchada a los juegos de azar.', 'Tienes que rescatar a Alexandra y matar al jefe antes de cruzar hacia la ciudad flotante. Te daré una llave del tiempo como recompensa.'],
    met:() => G.save.alexandraHome && G.save.bossDone && G.save.bossDone.icepeak, obj:() => ['Rescata a Alexandra', 'y vence al guardián de la puerta', 'del norte en el ascenso gélido', `Alexandra ${G.save.alexandraHome ? '✔' : '✘'} · Guardián ${(G.save.bossDone && G.save.bossDone.icepeak) ? '✔' : '✘'}`],
    ready:['¡Lo has conseguido! La montaña ya no es un peligro.', 'Toma esta llave del tiempo. Es un lugar misterioso que puede transportarte fuera del espacio-tiempo. Ve con cuidado.'],
    reward:() => { giveQuestItem('timekey', 1); }},
  {id:'machine', giver:'alexandra', exp:'floatcity', title:'Recupera la máquina de Alexandra',
    offer:['Por el camino perdí mi máquina tragaperras. Por favor, ve a la ciudad flotante y tráemela de vuelta: le tengo un cariño especial.', 'Allí encontrarás el objeto de misión «maquinita tragaperras» (verde fluorescente). Devuélvemela y te regalaré una tirada gratis.'],
    met:() => countItem('slotmachine') > 0, obj:() => ['Encuentra la maquinita tragaperras', '(objeto verde fluorescente)', 'en la ciudad flotante', countItem('slotmachine') > 0 ? '✔ La tienes: llévasela a Alexandra' : '✘ Aún no la has encontrado'],
    ready:['¡Mi maquinita! No sabes cuánto la echaba de menos.', 'Como prometí, una tirada gratis. Desde ahora también puedes jugar a las tragaperras conmigo.'],
    reward:() => { takeItem('slotmachine'); G.save.slotsOpen = true; G.save.freeSlot = (G.save.freeSlot || 0) + 1; }},
];
const QUEST_OF = {village:'friends', cemetery:'cousin', crypt:'countess', plains:'medkit', orccamp:'uakala', castle:'urr', river:'aish', forest:'map', temple:'wizard', icepeak:'climb', floatcity:'machine'};
const GIVER_HERE = {juan:() => true, gonzalo:() => G.save.gonzalo, druid:() => G.save.druid, uakala:() => G.save.uakalaHome, aish:() => G.save.aishHome, alexandra:() => G.save.alexandraHome};
const qsMap = () => (G.save.qs ??= {});
const qState = id => qsMap()[id];
const qDone = id => qState(id) === 'done';
const qIndex = id => QUESTS.findIndex(q => q.id === id);
const qPrevMain = q => { for(let i = qIndex(q.id) - 1; i >= 0; i--) if(!QUESTS[i].side) return QUESTS[i]; return null; };
const qAvailable = q => !qState(q.id) && (q.side ? (!q.when || q.when()) : (!qPrevMain(q) || qDone(qPrevMain(q).id))) && !!(GIVER_HERE[q.giver] && GIVER_HERE[q.giver]());
const qReady = q => qState(q.id) === 'active' && !q.auto && !!q.met();
function takeItem1(id){ return takeItem(id); }
let QUEST_REW = null;
function giveQuestItem(id, n){ const it = mkItem(id, n); if(QUEST_REW) QUEST_REW.push(it); else addToBagOrStash(it); }
// misión que bloquea la expedición e (la de la expedición anterior)
function blockQuest(e){
  const i = EXPEDITIONS.indexOf(e); if(i < 0 || e.hidden || e.hall) return null;
  const prev = e.from ? e.from : i === 0 ? null : EXPEDITIONS[i - 1].id;
  const qid = prev && QUEST_OF[prev]; if(!qid) return null;
  return qDone(qid) ? null : QUESTS.find(q => q.id === qid);
}
function questAccept(id){
  const q = QUESTS.find(x => x.id === id); if(!q || qState(id)) return;
  qsMap()[id] = 'active'; toast('Nueva misión: ' + q.title, 3.4); sfx('levelup'); saveGame();
  if(q.met() && q.auto) questComplete(q);
}
function questComplete(q){
  qsMap()[q.id] = 'done'; QUEST_REW = [];
  if(q.reward) q.reward();
  const rew = QUEST_REW; QUEST_REW = null; if(rew.length) setTimeout(() => UI.showRewards(rew, q.title), 350);
  toast('¡Misión completada: ' + q.title + '!', 4); sfx('levelup'); G.flash = {x:P.x, y:P.y-20, t:.3};
  saveGame(); UI.refresh && UI.refresh();
}
// diálogo de misión con un PNJ: entrega (si está lista) y oferta de la siguiente. Devuelve true si ha abierto un diálogo
function questTalk(npcId){
  const rdy = QUESTS.find(q => q.giver === npcId && qReady(q));
  if(rdy){ UI.say(UI_NAMES[npcId], rdy.ready, () => { questComplete(rdy); setTimeout(() => questTalk(npcId), 50); }); return true; }
  const av = QUESTS.find(q => q.giver === npcId && qAvailable(q));
  if(av && av.offer){ UI.say(UI_NAMES[npcId], av.offer, () => questAccept(av.id)); return true; }
  const act = QUESTS.find(q => q.giver === npcId && qState(q.id) === 'active' && !q.auto);
  if(act) toast('Misión en curso: ' + act.title, 2.6);
  return false;
}
const UI_NAMES = {juan:'Juan, el sabio', gonzalo:'Gonzalo el profesor', druid:'Chemma, el druida', uakala:'Uakala, el herrero orco', aish:'Aish, elfo de luz', alexandra:'Alexandra, la nórdica jugona'};
// ¿lleva un «!» ese PNJ? 'new' = misión nueva · 'ready' = misión lista para entregar
function questMark(npcId){
  if(!G.save) return null;
  for(const q of QUESTS){ if(q.giver !== npcId) continue; if(qReady(q)) return 'ready'; if(qAvailable(q) && q.offer) return 'new'; }
  return null;
}
// actualización: las misiones automáticas se completan solas y las demás avisan al estar listas
let questTimer = 0;
function updateQuests(dt){
  if(G.noIntT > 0) G.noIntT -= dt;
  questTimer -= dt; if(questTimer > 0 || !G.save || !G.sc) return; questTimer = .5;
  for(const q of QUESTS){
    if(qState(q.id) !== 'active') continue;
    if(q.auto){ if(q.met()) questComplete(q); }
    else if(q.met()){ if(!q.warned){ q.warned = true; toast('Misión lista: vuelve con ' + UI_NAMES[q.giver].split(',')[0], 3.6); sfx('alba'); } }
    else q.warned = false;
  }
}
// texto del cuadro «MISIÓN» (bajo el minimapa)
function questPanelLines(){
  let main = null;
  for(const q of QUESTS){
    if(q.side) continue;
    const st = qState(q.id);
    if(st === 'active'){ main = qReady(q) || (q.met() && !q.auto) ? ['MISIÓN', q.title, 'Vuelve con ' + UI_NAMES[q.giver].split(',')[0] + ' (!)'] : ['MISIÓN', q.title, ...q.obj()]; break; }
    if(!st && qAvailable(q) && q.offer){ main = ['MISIÓN', 'Habla con ' + UI_NAMES[q.giver].split(',')[0], '(el «!» sobre su cabeza)']; break; }
    if(!st) break;
  }
  // las misiones secundarias aceptadas salen debajo de la principal
  let out = main || [];
  for(const q of QUESTS) if(q.side && qState(q.id) === 'active')
    out = out.concat(qReady(q) || q.met() ? ['MISIÓN SECUNDARIA', q.title, 'Vuelve con ' + UI_NAMES[q.giver].split(',')[0] + ' (!)'] : ['MISIÓN SECUNDARIA', q.title, ...q.obj()]);
  return out.length ? out : null;
}
// ---------- migración de partidas antiguas: lo ya superado cuenta como misión hecha ----------
function questMigrate(s, legacy){
  s.qs = s.qs || {};
  if(!legacy) return;
  const mx = s.maxExp || 0, bd = s.bossDone || {};
  const done = {friends:mx >= 1, cousin:mx >= 2, countess:mx >= 3 || !!bd.crypt, medkit:mx >= 4, uakala:mx >= 5 || s.uakalaHome, urr:mx >= 7 || !!bd.castle && mx >= 6, aish:mx >= 8 || s.aishHome, map:mx >= 9 || !!bd.temple, wizard:!!bd.temple || mx >= 10, climb:!!bd.icepeak || mx >= 11};
  for(const q of QUESTS) if(done[q.id]) s.qs[q.id] = 'done';
  if(mx >= 1){ s.trapis = true; s.gonzalo = true; } if(mx >= 2) s.druid = true; if(mx >= 4) s.labUnlocked = true; if(s.level > 1) s.gonzalo = true;
}
// ---------- celdas alcanzables de la expedición (para colocar PNJ y objetos de misión) ----------
function reachCells(sc){
  const ST = 16, sx = sc.spawn.x, sy = sc.spawn.y, seen = new Set(['0,0']), q = [[0, 0]], cells = [];
  while(q.length){
    const [i, j] = q.pop(); cells.push([sx + i*ST, sy + j*ST]);
    for(const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const a = i + di, b = j + dj, k = a + ',' + b; if(seen.has(k)) continue; seen.add(k); if(!blocked(sc, sx + a*ST, sy + b*ST, 10)) q.push([a, b]); }
  }
  for(let n = cells.length - 1; n > 0; n--){ const m = Math.floor(Math.random()*(n + 1)); [cells[n], cells[m]] = [cells[m], cells[n]]; }
  return cells;
}
const farCell = (cells, sc, dmin, extra) => { for(const dm of [dmin, dmin*.6, 120, 0]){ const c = cells.find(([x, y]) => Math.hypot(x - sc.spawn.x, y - sc.spawn.y) >= dm && (!extra || extra(x, y))); if(c) return c; } return null; };
function addRescueNpc(sc, id, name, x, y, extra){
  const n = Object.assign({id, name, x:Math.round(x), y:Math.round(y), dir:1, rescue:true}, extra || {}); sc.npcs.push(n); n.col = addCollider(sc, {t:'c', x:n.x, y:n.y - 2, r:9});
  sc.lights.push({x:n.x, y:n.y - 16, r:70, a:.7, warm:true, flick:.1}); return n;
}
function dropNpc(sc, id){ const n = sc.npcs.find(q => q.id === id); if(n && n.col) removeCollider(sc, n.col); sc.npcs = sc.npcs.filter(q => q.id !== id); }
function moveNpc(sc, id, cell){ const n = sc.npcs.find(q => q.id === id); if(!n || !cell) return; if(n.col) removeCollider(sc, n.col); n.x = Math.round(cell[0]); n.y = Math.round(cell[1]); n.col = addCollider(sc, {t:'c', x:n.x, y:n.y - 2, r:9}); }
function dropQuestItem(sc, itemId, cell){
  if(!cell) return; const x = Math.round(cell[0]), y = Math.round(cell[1]);
  G.loot.push({x, y, z:0, vx:0, vy:0, vz:0, item:mkItem(itemId), t:1});
  sc.lights.push({x, y:y - 6, r:100, a:.9, warm:true, tint:'rgba(70,255,70,.2)', flick:.2});
}
// colocación de PNJ y objetos de misión al generar cada expedición (tras resetWorld)
function placeQuestStuff(sc, expId){
  const s = G.save; if(!s || !s.qs) return;
  const cells = reachCells(sc);
  if(expId === 'village' && qState('friends') === 'active'){
    const hs = (sc.houses || []).slice().sort(() => Math.random() - .5), inside = h => cells.filter(([x, y]) => x > h.x + 20 && x < h.x + h.w - 20 && y > h.y + 26 && y < h.y + h.h - 12);
    const want = []; if(!s.trapis) want.push(['trapis', 'Trapis']); if(!s.gonzalo) want.push(['gonzalo', 'Gonzalo']);
    for(const [id, nm] of want){
      let c = null; while(hs.length && !c){ const h = hs.shift(), cs = inside(h); if(cs.length) c = cs[Math.floor(Math.random()*cs.length)]; }
      if(!c) c = farCell(cells, sc, 350);
      if(c) addRescueNpc(sc, id, nm, c[0], c[1]);
    }
  }
  if(expId === 'cemetery' && qState('cousin') === 'active' && !s.druid){ const c = farCell(cells, sc, 500); if(c) addRescueNpc(sc, 'druid', 'Chemma', c[0], c[1]); }
  if(expId === 'plains' && qState('medkit') === 'active' && countItem('medkit') === 0) dropQuestItem(sc, 'medkit', farCell(cells, sc, 600));
  if(expId === 'orccamp'){ if(qState('uakala') === 'active' && !s.uakalaHome){ if(!sc.npcs.some(n => n.id === 'uakala')) addRescueNpc(sc, 'uakala', 'Uakala', 0, 0); moveNpc(sc, 'uakala', farCell(cells, sc, 500)); } else dropNpc(sc, 'uakala'); }
  if(expId === 'river'){ if(qState('aish') === 'active' && !s.aishHome){ if(!sc.npcs.some(n => n.id === 'aish')) addRescueNpc(sc, 'aish', 'Aish', 0, 0); moveNpc(sc, 'aish', farCell(cells, sc, 500)); } else dropNpc(sc, 'aish'); }
  if(expId === 'forest' && qState('map') === 'active' && countItem('templemap') === 0) dropQuestItem(sc, 'templemap', farCell(cells, sc, 600));
  if(expId === 'floatcity' && qState('machine') === 'active' && countItem('slotmachine') === 0) dropQuestItem(sc, 'slotmachine', farCell(cells, sc, 500));
}
// rescate de un PNJ escondido (Trapis, Gonzalo, Chemma) dentro de la expedición
function rescueNpc(id, title, lines, flag, msg){
  UI.say(title, lines, () => {
    G.save[flag] = true; dropNpc(G.sc, id); toast(msg, 4.5); sfx('levelup'); ring(P.x, P.y - 10, 50, '#7ae09a', .5); saveGame(); updateQuests(9);
  });
}

// ---------- objetos de misión (verde fluorescente; no se venden) y tótem orco ----------
iconFrom([
  ['medkit', 'blackpearl', {B:'#1ee83a', b:'#7affa0', w:'#ffffff'}], ['templemap', 'nacreshell', {W:'#d8c08a', w:'#f0e0b0', p:'#7a5a2a'}],
  ['slotmachine', 'goldanchor', {G:'#ffd84a', g:'#c83a3a'}], ['orctotem', 'goldanchor', {G:'#7a9a3a', g:'#3a4a1a'}],
]);
Object.assign(ITEMS, {
  medkit:      {name:'Botiquín de Chemma', icon:'medkit', quest:true, rar:'quest', value:0, desc:'Objeto de misión. Pertenece a Chemma, el druida: llévaselo. Si mueres con él lo perderás.'},
  templemap:   {name:'Mapa del templo', icon:'templemap', quest:true, rar:'quest', value:0, desc:'Objeto de misión. Muestra el camino al templo sagrado: llévaselo a Aish. Si mueres con él lo perderás.'},
  slotmachine: {name:'Maquinita tragaperras', icon:'slotmachine', quest:true, rar:'quest', value:0, desc:'Objeto de misión. La máquina que Alexandra perdió: devuélvesela.'},
});
ITEMS.orctotem = TR('Tótem orco', 'orctotem', 2000, 'Un tótem de guerra orco: recuerdo de la caída de Urr.');
RAR_COL.quest = '#39ff14';
// ---------- traducciones ----------
Object.assign(LANG_EN, {
  'Rescata a los amigos de Juan':'Rescue Juan\'s friends', 'Encuentra al primo de Gonzalo':'Find Gonzalo\'s cousin', 'Mata a la Condesa':'Kill the Countess', 'Encuentra el botiquín de Chemma':'Find Chemma\'s medkit',
  'Encuentra a Uakala':'Find Uakala', 'Vence a Urr':'Defeat Urr', 'Encuentra a Aish':'Find Aish', 'Busca el mapa hacia el templo':'Find the map to the temple', 'Vence al brujo élfico':'Defeat the elven sorcerer',
  'Asciende la montaña':'Climb the mountain', 'Recupera la máquina de Alexandra':'Recover Alexandra\'s machine',
  'Rescata a Trapis y a Gonzalo,':'Rescue Trapis and Gonzalo,', 'escondidos en cabañas del pueblo':'hidden in village cabins', 'Encuentra a Chemma, el druida,':'Find Chemma, the druid,', 'en algún lugar del cementerio':'somewhere in the cemetery', 'y llévalo a la guarida':'and take him to the den',
  'Derrota a la Condesa fantasma':'Defeat the ghost Countess', 'en la cripta':'in the crypt', 'Encuentra el botiquín de Chemma':'Find Chemma\'s medkit', '(objeto verde fluorescente)':'(fluorescent green item)', 'en las planicies salvajes':'in the wild plains',
  '✔ Lo tienes: llévaselo a Chemma':'✔ You have it: take it to Chemma', '✘ Aún no lo has encontrado':'✘ You have not found it yet', 'Encuentra a Uakala,':'Find Uakala,', 'el orco desertor, en algún':'the deserter orc, somewhere', 'lugar del campamento orco':'in the orc camp', 'e invítalo a la guarida':'and invite him to the den',
  'Vence a Urr, el gran jefe orco,':'Defeat Urr, the great orc chief,', 'en el castillo de Urr':'in Urr\'s castle', 'Encuentra a Aish, el elfo de luz,':'Find Aish, the light elf,', 'en algún lugar del río travieso':'somewhere along the mischievous river',
  'Encuentra el mapa del templo':'Find the temple map', 'en el bosque élfico':'in the elven forest', '✔ Lo tienes: llévaselo a Aish':'✔ You have it: take it to Aish', 'Vence al brujo élfico':'Defeat the elven sorcerer', 'en el templo sagrado':'in the sacred temple',
  'Rescata a Alexandra':'Rescue Alexandra', 'y vence al guardián de la puerta':'and defeat the guardian of the gate', 'del norte en el ascenso gélido':'of the north on the frozen ascent', 'Encuentra la maquinita tragaperras':'Find the little slot machine', 'en la ciudad flotante':'in the floating city', '✔ La tienes: llévasela a Alexandra':'✔ You have it: take it to Alexandra',
  'MISIÓN':'MISSION', '(el «!» sobre su cabeza)':'(the «!» above their head)', 'Nueva misión: {}':'New mission: {}', '¡Misión completada: {}!':'Mission complete: {}!', 'Misión en curso: {}':'Mission in progress: {}', 'Misión lista: vuelve con {}':'Mission ready: return to {}',
  'Botiquín de Chemma':'Chemma\'s medkit', 'Mapa del templo':'Temple map', 'Maquinita tragaperras':'Little slot machine', 'Tótem orco':'Orc totem',
  'Objeto de misión. Pertenece a Chemma, el druida: llévaselo. Si mueres con él lo perderás.':'Quest item. It belongs to Chemma, the druid: take it to him. If you die carrying it you will lose it.',
  'Objeto de misión. Muestra el camino al templo sagrado: llévaselo a Aish. Si mueres con él lo perderás.':'Quest item. It shows the way to the sacred temple: take it to Aish. If you die carrying it you will lose it.',
  'Objeto de misión. La máquina que Alexandra perdió: devuélvesela.':'Quest item. The machine Alexandra lost: give it back to her.',
  'Tesoro. Trapis te lo compra. Un tótem de guerra orco: recuerdo de la caída de Urr.':'Treasure. Trapis will buy it. An orc war totem: a souvenir of Urr\'s fall.',
  '[F] Hablar con Trapis':'[F] Talk to Trapis', '[F] Hablar con Gonzalo':'[F] Talk to Gonzalo', '[F] Hablar con Chemma':'[F] Talk to Chemma',
  'Completa la misión «{}» para desbloquearla':'Complete the mission «{}» to unlock it',
  'Los has rescatado':'You rescued them',
});
const QUEST_LINES = {   // diálogos
  'Gracias por sacarme de aquella cabaña. Te debo una... y tengo otro favor que pedirte.':'Thank you for getting me out of that cabin. I owe you one... and I have another favour to ask.',
  'Mi primo Chemma es un druida experto en mascotas. Salió al cementerio a rescatar mascotas y no volvió.':'My cousin Chemma is an expert druid in pets. He went to the cemetery to rescue pets and never came back.',
  'Si lo encuentras te regalaré 10 setas comestibles. Guárdalas bien en tu alijo y no te lleves todas a la expedición.':'If you find him I will give you 10 edible mushrooms. Keep them safe in your stash and do not take them all on the expedition.',
  '¡Chemma está a salvo! Sabía que podías hacerlo.':'Chemma is safe! I knew you could do it.', 'Aquí tienes tus 10 setas comestibles. Guárdalas bien en tu alijo.':'Here are your 10 edible mushrooms. Keep them safe in your stash.',
  'Gracias por sacarme de allí, de verdad. Ahora la guarida es mi hogar.':'Thank you for getting me out of there, truly. The den is my home now.',
  'En la cripta, la Condesa fantasma tiene atrapadas a un montón de mascotas. Si la matas, podrás liberar a tu primera mascota brillante asegurada.':'In the crypt, the ghost Countess holds a lot of pets captive. If you kill her you will be able to free your first guaranteed brilliant pet.',
  'Tráeme su derrota y te daré 20 galletas para mascotas.':'Bring me news of her defeat and I will give you 20 pet cookies.',
  '¿La Condesa ha caído? Las mascotas respiran por fin.':'Has the Countess fallen? The pets can finally breathe.', 'Aquí tienes 20 galletas para mascotas.':'Here are 20 pet cookies.',
  'Perdí mi botiquín en las planicies salvajes. Es un objeto de misión verde fluorescente que encontrarás en algún lugar del mapa.':'I lost my medkit in the wild plains. It is a fluorescent green quest item that you will find somewhere on the map.',
  'Si mueres con él lo perderás y tendrás que volver a buscarlo por la expedición.':'If you die carrying it you will lose it and have to search for it again in the expedition.',
  'Cuando me lo traigas desbloquearé para ti «Mejorar mascotas» y te regalaré 1 uso de suero.':'When you bring it to me I will unlock «Upgrade pets» for you and give you 1 free serum use.',
  '¡Mi botiquín! Pensé que lo había perdido para siempre.':'My medkit! I thought I had lost it forever.', 'Ahora puedo prepararte sueros: tendrás la pestaña «Mejorar mascotas». Y toma 1 uso de suero gratis.':'Now I can prepare serums for you: you get the «Upgrade pets» tab. And take 1 free serum use.',
  'Dicen los rumores que los propios orcos tienen desertores.':'Rumour has it that the orcs themselves have deserters.', 'Uno de ellos no está a favor de hacer daño a las mascotas. Encuéntralo en el campamento orco: quizá sea un gran aliado para nosotros.':'One of them is against hurting pets. Find him in the orc camp: he may be a great ally for us.',
  'Este maldito orco no tiene escrúpulos ni sentimientos.':'This cursed orc has no scruples and no feelings.', 'Ve a su castillo y dale su merecido. Te daré una recompensa.':'Go to his castle and give him what he deserves. I will give you a reward.',
  '¿Urr ha caído? Eso es justicia.':'Has Urr fallen? That is justice.', 'Toma este tótem orco: podrás venderlo por 2000 de oro.':'Take this orc totem: you can sell it for 2000 gold.',
  'Cerca del río han visto un elfo que ha logrado escapar del velo del Señor de la Noche.':'An elf who managed to escape the Night Lord\'s veil has been seen near the river.',
  'Dicen que es un experto en piedras preciosas y que domina sus poderes. Encuéntralo en un lugar aleatorio del río travieso e invítalo a nuestra guarida.':'They say he is an expert in gemstones and masters their powers. Find him somewhere along the mischievous river and invite him to our den.',
  'Existe un mapa que muestra el camino al templo sagrado. Se perdió en el bosque élfico.':'There is a map that shows the way to the sacred temple. It was lost in the elven forest.',
  'Es un objeto de misión verde fluorescente. Si mueres con él lo perderás.':'It is a fluorescent green quest item. If you die carrying it you will lose it.', 'Entrégamelo y te abriré el acceso al templo sagrado.':'Hand it to me and I will open the way to the sacred temple.',
  '¡El mapa! Sí... aquí está marcado el camino.':'The map! Yes... the path is marked here.', 'Ya puedes ir al templo sagrado.':'You can now go to the sacred temple.',
  'El brujo élfico impide el paso hacia el norte.':'The elven sorcerer blocks the way north.', 'Véncelo y te recompensaré con 1 llave de la mina, un farolillo élfico y un arco élfico.':'Defeat him and I will reward you with 1 mine key, an elven lantern and an elven bow.',
  '¡Has vencido al brujo! El norte vuelve a estar abierto.':'You have defeated the sorcerer! The north is open again.', 'Cumplo mi promesa: una llave de la mina, un farolillo élfico y un arco élfico.':'I keep my promise: a mine key, an elven lantern and an elven bow.',
  'Asciende la montaña: cruza el ascenso gélido y vence a su guardián.':'Climb the mountain: cross the frozen ascent and defeat its guardian.',
  'Dicen que más allá del norte hay un pueblo que flota encima de un lago, y allí encontrarás unas mascotas espectaculares.':'They say that beyond the north there is a village floating on a lake, and there you will find spectacular pets.',
  'Por el camino te encontrarás con Alexandra. Recibí una carta suya: la han expulsado de los pueblos del norte. Es una mujer muy maja, pero la pobre está enganchada a los juegos de azar.':'On the way you will meet Alexandra. I received a letter from her: she has been expelled from the northern villages. She is a lovely woman, but the poor thing is hooked on gambling.',
  'Tienes que rescatar a Alexandra y matar al jefe antes de cruzar hacia la ciudad flotante. Te daré una llave del tiempo como recompensa.':'You must rescue Alexandra and kill the boss before crossing to the floating city. I will give you a time key as a reward.',
  '¡Lo has conseguido! La montaña ya no es un peligro.':'You did it! The mountain is no longer a danger.', 'Toma esta llave del tiempo. Es un lugar misterioso que puede transportarte fuera del espacio-tiempo. Ve con cuidado.':'Take this time key. It is a mysterious place that can transport you outside of space-time. Be careful.',
  'Por el camino perdí mi máquina tragaperras. Por favor, ve a la ciudad flotante y tráemela de vuelta: le tengo un cariño especial.':'On the way I lost my slot machine. Please go to the floating city and bring it back to me: I am especially fond of it.',
  'Allí encontrarás el objeto de misión «maquinita tragaperras» (verde fluorescente). Devuélvemela y te regalaré una tirada gratis.':'There you will find the quest item «little slot machine» (fluorescent green). Return it to me and I will give you a free spin.',
  '¡Mi maquinita! No sabes cuánto la echaba de menos.':'My little machine! You do not know how much I missed it.', 'Como prometí, una tirada gratis. Desde ahora también puedes jugar a las tragaperras conmigo.':'As promised, a free spin. From now on you can also play the slots with me.',
  '¡Los has rescatado! Trapis y Gonzalo ya viven en la guarida.':'You rescued them! Trapis and Gonzalo now live in the den.', 'Uakala vive ahora en la guarida: ya tienes herrero.':'Uakala now lives in the den: you have a blacksmith.', 'Aish vive en la guarida: te enseñará a usar las gemas.':'Aish lives in the den: he will teach you to use gems.',
};
Object.assign(LANG_EN, QUEST_LINES);
LANG.load(LANG_EN);

Object.assign(LANG_EN, {"Antes de nada, necesito pedirte un favor. Mis amigos Trapis y Gonzalo se escondieron de los monstruos en las cabañas del pueblo abandonado.":"Before anything else I need to ask you a favour. My friends Trapis and Gonzalo hid from the monsters in the cabins of the abandoned village.","Si los rescatas vendrán a vivir a la guarida: Trapis te comprará y venderá de todo y Gonzalo te enseñará a hacerte más fuerte. Esa es tu misión.":"If you rescue them they will come to live in the den: Trapis will buy and sell you everything and Gonzalo will teach you to become stronger. That is your mission.","No podrás avanzar a otra expedición hasta completar la misión de la que estés. Quien tenga una misión para ti llevará un «!» sobre la cabeza.":"You will not be able to advance to another expedition until you complete the mission of the current one. Anyone with a mission for you will have a «!» above their head.","¡Chist! No grites, que nos oirán... Menos mal que eres tú, y no uno de esos monstruos.":"Shh! Do not shout, they will hear us... Thank goodness it is you and not one of those monsters.","Soy Trapis, el mercader. Llevo días escondido en esta cabaña desde que cayó la noche. Juan me habló de ti.":"I am Trapis, the merchant. I have been hiding in this cabin for days since the night fell. Juan told me about you.","Si me llevas a la guarida abriré mi puesto: te venderé género y te compraré todo lo que encuentres. ¡Nos vemos allí!":"If you take me to the den I will open my stall: I will sell you goods and buy everything you find. See you there!","En la tienda tienes dos pestañas: «Comprar» y «Recomprar» (lo que me vendes puedes recuperarlo algo más caro mientras estés en la guarida). También vendo ampliaciones de mochila y de alijo.":"The shop has two tabs: «Buy» and «Buy back» (what you sell me can be recovered for a bit more while you are in the den). I also sell backpack and stash upgrades.","¡Por fin alguien! Llevo días atrapado entre estas tumbas, sin poder volver...":"At last, someone! I have been trapped among these graves for days, unable to go back...","Soy Chemma, druida experto en mascotas. Mi primo Gonzalo te habrá hablado de mí. Sácame de aquí y viviré en tu guarida: cuidaré de tus mascotas.":"I am Chemma, a druid who is an expert in pets. My cousin Gonzalo must have told you about me. Get me out of here and I will live in your den: I will look after your pets.","Esto es lo que puedo hacer por ti: en «Adiestrador» aprendes habilidades para tus mascotas con los puntos que ganas al liberarlas (1 por cada 5); en «Colección / Resucitar» ves todas las mascotas y devuelvo la vida a las caídas por oro; y en «Tienda» vendo jaula grande, mochila mágica y talismanes.":"Here is what I can do for you: in «Trainer» you learn abilities for your pets with the points you earn by freeing them (1 per 5); in «Collection / Revive» you see all pets and I bring the fallen back to life for gold; and in «Shop» I sell the big cage, the magic backpack and talismans.","Y cuando me traigas mi botiquín (te lo pediré pronto) abriré «Mejorar mascotas»: sueros que fortalecen a tus mascotas, aunque con algo de riesgo.":"And when you bring me my medkit (I will ask you soon) I will open «Upgrade pets»: serums that strengthen your pets, though with some risk.","¡Un superviviente! Creía que los monstruos me habían encontrado...":"A survivor! I thought the monsters had found me...","Soy Gonzalo, profesor de la academia. Me escondí en esta cabaña cuando se apagó la luz. Juan me ha hablado de ti.":"I am Gonzalo, a teacher at the academy. I hid in this cabin when the light went out. Juan has told me about you.","Llévame a la guarida y te enseñaré a hacerte más fuerte con los puntos que ganes al subir de nivel.":"Take me to the den and I will teach you to become stronger with the points you earn by levelling up.","La mina de los enanos solo se abre con una llave de la mina (se gasta una por viaje): los elfos poseídos las llevan.":"The dwarven mine only opens with a mine key (one is used per trip): the possessed elves carry them.","Desde el primer día tienes la ruleta a tu disposición (con el oro de la guarida). Si me traes mi máquina tragaperras, también habrá tragaperras.":"From day one the roulette is at your disposal (with the den's gold). If you bring me my slot machine, there will be slots too."});
LANG.load(LANG_EN);

Object.assign(LANG_EN, {"[F] Hablar con {}":"[F] Talk to {}"});
LANG.load(LANG_EN);

Object.assign(LANG_EN, {"¡JAULA BRILLANTE!":"BRILLIANT CAGE!", "Has derrotado a un jefe por primera vez: ha dejado una jaula con una mascota BRILLANTE.":"You defeated a boss for the first time: it has left a cage with a BRILLIANT pet.", "Busca la jaula que brilla con un «!» cerca de donde ha caído el jefe.":"Look for the cage that glows with a «!» near where the boss fell.", "¡Genial!":"Great!", "¡El jefe ha dejado una jaula con una mascota BRILLANTE!":"The boss has left a cage with a BRILLIANT pet!"});
LANG.load(LANG_EN);

// ---------- ventana de recompensa: pequeña, con los objetos para coger con un clic ----------
UI.rewardOpen = false;
const _blockingQ = UI.blocking.bind(UI);
UI.blocking = function(){ return _blockingQ() || this.rewardOpen; };
{
  const st = document.createElement('style');
  st.textContent = `#rewardWin{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:30;background:#1a120c;border:3px solid #d8a850;border-radius:10px;padding:14px 18px;color:#e8d8b0;text-align:center;min-width:260px;box-shadow:0 0 30px rgba(255,200,100,.35)}#rewardWin.hidden{display:none}
  #rewardWin h3{margin:0 0 4px;color:#ffd88a;font-size:18px}#rewardWin .sub{font-size:12px;color:#a89a80;margin-bottom:8px}#rwItems{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:8px 0 12px}
  .rwslot{width:58px;height:58px;border:2px solid #7a5e36;background:#0e0a08;border-radius:6px;position:relative;cursor:pointer;display:flex;align-items:center;justify-content:center}.rwslot:hover{border-color:#ffd88a;box-shadow:0 0 10px rgba(255,216,138,.5)}
  .rwslot img{width:44px;height:44px;image-rendering:pixelated}.rwslot i{position:absolute;right:2px;bottom:0;font-style:normal;font-size:12px;color:#fff;text-shadow:1px 1px 0 #000}`;
  document.head.append(st);
  const d = document.createElement('div'); d.id = 'rewardWin'; d.className = 'hidden'; d.innerHTML = '<h3>¡Recompensa!</h3><div class="sub" id="rwTitle"></div><div id="rwItems"></div><button id="rwAll">Coger todo</button> <button id="rwClose">Cerrar</button>'; document.body.append(d);
}
let REW_LIST = [];
UI.showRewards = function(items, title){
  REW_LIST = items.slice(); this.rewardOpen = true; $('rewardWin').classList.remove('hidden'); $('rwTitle').textContent = title; sfx('levelup'); this.renderRewards();
};
UI.renderRewards = function(){
  const box = $('rwItems'); box.innerHTML = '';
  REW_LIST.forEach((it, i) => {
    const el = document.createElement('div'); el.className = 'rwslot'; el.innerHTML = `<img src="${itemIconURL(it)}" draggable="false">${it.n > 1 ? '<i>' + it.n + '</i>' : ''}`;
    el.onmouseenter = e => this.showTip(it, e); el.onmousemove = e => this.moveTip(e); el.onmouseleave = () => $('tip').classList.add('hidden');
    el.onclick = () => { if(addToBag(it) || addTo(G.save.stash, it)){ REW_LIST.splice(i, 1); sfx('coin'); $('tip').classList.add('hidden'); this.renderRewards(); } else toast('No hay sitio', 1.4); };
    box.append(el);
  });
  if(!REW_LIST.length) this.closeRewards(true);
};
UI.closeRewards = function(done){
  if(!this.rewardOpen) return; this.rewardOpen = false; $('rewardWin').classList.add('hidden'); $('tip').classList.add('hidden'); G.noIntT = .4;
  if(REW_LIST.length){ for(const it of REW_LIST) addTo(G.save.stash, it); toast('Lo que no cogiste va al alijo', 2.6); REW_LIST = []; }
  saveGame(); UI.refresh && UI.refresh();
};
$('rwAll').onclick = () => { for(const it of REW_LIST.slice()){ if(addToBag(it) || addTo(G.save.stash, it)) REW_LIST.splice(REW_LIST.indexOf(it), 1); } sfx('coin'); UI.renderRewards(); UI.closeRewards(true); };
$('rwClose').onclick = () => UI.closeRewards();
Object.assign(LANG_EN, {'¡Recompensa!':'Reward!', 'Coger todo':'Take all', 'Cerrar':'Close', 'Lo que no cogiste va al alijo':'Whatever you did not take goes to the stash', 'No hay sitio':'No room'});
LANG.load(LANG_EN);
