'use strict';
// =====================================================================
//  Juego: estado, guarida ↔ expedición, interacciones, luz y bucle
// =====================================================================
// el farolillo de cobre es de serie: tras morir se te devuelve uno nuevo
function emptyEquip(){ return {w1:null, w2:null, shield:null, head:null, chest:null, hands:null, feet:null, lantern:{id:'copperlantern'}, pet:[null,null,null,null], tal:[null,null,null], pbag:[null,null,null,null,null], potion:null, bandage:null, oil:null, cookie:null, mushroom:null, elfpotion:null, hallshroom:null, elfbread:null, bone:null, ammo:null}; }
const G = {
  t:0, sc:null, mons:[], pets:[], projs:[], hazards:[], loot:[], parts:[], texts:[],
  allies:[], shake:0, hitstop:0, kills:0, flash:null, deathT:0,
  inv:{equip:emptyEquip(), bag:Array(20).fill(null)},
  activeW:0, raidGold:0, rescued:0, rescuedNames:[], rescuedIds:[], save:null,
  slot:null, menu:true, paused:false, pt:{}, cam:{x:0, y:0}, ox:0, oy:0, prompt:null, channel:null, showHelp:true, frameLights:[],
};
let P = newPlayer(0, 0);

// ---------- guardado ----------
const SAVE_KEY = 'heroes-pets-save-v1';          // clave antigua (una sola partida): se migra a la ranura 1
const SLOTS = 3, slotKey = n => 'heroes-pets-save-slot' + n;
try { if(localStorage.getItem(SAVE_KEY) && !localStorage.getItem(slotKey(1))){ localStorage.setItem(slotKey(1), localStorage.getItem(SAVE_KEY)); } } catch(e){}
// resumen de una ranura para el menú (null si está vacía)
function slotInfo(n){
  try { const s = JSON.parse(localStorage.getItem(slotKey(n))); if(!s) return null;
    return {name:s.name, level:s.level||1, gold:s.wallet||0, runs:s.extracts||0, inRaid:!!s.inRaid}; } catch(e){ return null; }
}
const STASH_SIZE = 100;
function defaultSave(){
  return {petRecover:true, introDone:false, tut:0, quest:'tutorial', name:null, level:1, xp:0, wallet:0, stash:Array(STASH_SIZE).fill(null), talked:false, inRaid:false, inv:null, runs:0,
          uakalaMet:false, uakalaHome:false, aishMet:false, aishHome:false, alexandraMet:false, alexandraHome:false, trapis:false, trapisMet:false, druid:false, druidMet:false, fallen:[], qs:{}, labUnlocked:false, freeSerum:0, freeSlot:0, slotsOpen:false,
          gonzalo:false, gonzaloMet:false, skillPts:0, skills:{agr:0, agi:0, car:0, agu:0, exp:0},
          bars:Object.assign({}, DEFAULT_BARS), collection:{}, shinies:{}, bossGift:{}, petsFreed:0, petTree:['start'], maxExp:0, shopSpecials:[], tree:['start'], bossKills:0};
}
function saveGame(){
  try { G.save.inv = {equip:G.inv.equip, bag:G.inv.bag}; if(G.slot) localStorage.setItem(slotKey(G.slot), JSON.stringify(G.save)); } catch(e){}
}
// ---------- recuperación tras un cierre inesperado ----------
// En expedición se guarda cada 10 s una copia del equipo y la mochila. Si el juego se cuelga o se cierra solo (no por recargar o cerrar a propósito: eso cuenta como abandonar, norma 10), al volver a abrir la partida se restaura la copia.
const snapKey = n => 'heroes-pets-snap-slot' + n, SNAP_MAX = 15*60*1000;
function snapSave(){ try { if(G.slot && G.save.inRaid && G.sc.kind === 'raid'){ localStorage.setItem(snapKey(G.slot), JSON.stringify({inv:{equip:G.inv.equip, bag:G.inv.bag}, gold:G.raidGold || 0, t:Date.now()})); localStorage.removeItem('heroes-pets-clean'); } } catch(e){} }
function snapClear(n){ try { localStorage.removeItem(snapKey(n || G.slot)); localStorage.removeItem('heroes-pets-clean'); localStorage.removeItem('heroes-pets-crash'); } catch(e){} }
function crashNote(msg){ try { if(G.save && G.save.inRaid) localStorage.setItem('heroes-pets-crash', JSON.stringify({slot:G.slot, msg:String(msg).slice(0, 200), t:Date.now()})); } catch(e){} }
addEventListener('error', e => { if(!e.filename || e.filename.includes('/js/')) crashNote(e.message); });
addEventListener('unhandledrejection', e => crashNote((e.reason && e.reason.message) || e.reason));
addEventListener('beforeunload', () => { try { if(G.save && G.save.inRaid) localStorage.setItem('heroes-pets-clean', '1'); } catch(e){} });   // recargar o cerrar a propósito: no se recupera
function snapRead(slot){
  try {
    const sn = JSON.parse(localStorage.getItem(snapKey(slot))); if(!sn || Date.now() - sn.t > SNAP_MAX) return null;
    const cr = JSON.parse(localStorage.getItem('heroes-pets-crash') || 'null'), crashed = cr && cr.slot === slot && Date.now() - cr.t < SNAP_MAX;
    if(localStorage.getItem('heroes-pets-clean') && !crashed) return null;
    return sn;
  } catch(e){ return null; }
}
function loadGame(slot){
  let s = null;
  try { s = JSON.parse(localStorage.getItem(slotKey(slot))); } catch(e){}
  const old = s;
  s = Object.assign(defaultSave(), s || {});
  if(old && old.petRecover === undefined) s.petRecover = false;   // partidas anteriores: recuperar mascotas perdidas
  if(old && old.introDone === undefined){ s.introDone = true; s.tut = 99; s.quest = (old.extracts || old.runs) ? 'done' : old.talked ? 'horse' : 'juan'; }   // partidas anteriores: sin intro ni tutorial
  while(s.stash.length < STASH_SIZE) s.stash.push(null);
  if(s.maxExp === 0 && s.trapis) s.maxExp = 1;
  questMigrate(s, !!old && old.qs === undefined);   // partidas antiguas: lo ya superado cuenta como misión hecha
  // puntos de Gonzalo: 1 por cada nivel subido, menos los nodos ya aprendidos en el árbol.
  // Se recalculan siempre, así ninguna partida pierde puntos (p. ej. los del árbol antiguo).
  if(s.treeV !== 2){ if(s.tree && s.tree.length > 1) setTimeout(() => toast('Gonzalo ha renovado su árbol de pasivas: tus puntos te han sido devueltos', 6), 2500); s.tree = ['start']; s.treeV = 2; }   // el árbol nuevo: reinicio gratis una sola vez
  if(!Array.isArray(s.tree) || !s.tree.includes('start')) s.tree = ['start'];
  s.tree = [...new Set(s.tree.filter(id => TREE.byId[id]))];
  s.skills = {agr:0, agi:0, car:0, agu:0, exp:0};    // árbol antiguo: ya no se usa
  s.skillPts = Math.max(0, (s.level-1) - (s.tree.length-1));
  if(s.extracts === undefined) s.extracts = s.trapis ? 1 : 0;
  fixBars(s);
  s.freedSp = Object.assign({}, Object.fromEntries(Object.keys(s.collection || {}).map(k => [k, true])), s.freedSp || {});   // especies distintas liberadas (puntos del adiestrador)
  if(!s.petsFreed) s.petsFreed = Object.keys(s.collection || {}).length;      // partidas antiguas: cuenta las mascotas ya conocidas
  s.fallen = (s.fallen || []).map(e => typeof e === 'string' ? {pet:e, shiny:false} : e);
  s.shinies ??= {}; s.bossGift ??= {};
  { const fix = it => { if(it && it.rarity === 'unique') it.rarity = 'legendary'; };   // los únicos de jefe ahora son legendarios
    (s.stash || []).forEach(fix); (s.petCage || []).forEach(fix); (s.sold || []).forEach(x => fix(x && x.item));
    if(s.inv){ (s.inv.bag || []).forEach(fix); for(const k in (s.inv.equip || {})){ const v = s.inv.equip[k]; if(Array.isArray(v)) v.forEach(fix); else fix(v); } } }
  if(!Array.isArray(s.petTree) || !s.petTree.includes('start')) s.petTree = ['start'];
  s.petTree = [...new Set(s.petTree.filter(id => PTREE.byId[id]))];
  return s;
}
function clearGear(){
  G.inv.equip = emptyEquip();
  G.inv.bag = Array(20).fill(null);
  G.pets = [];
}

// ---------- cambio de escena ----------
function resetWorld(sc){
  for(const ch of sc.chests) if(ch.col) ch.col.low = true;   // los cofres se pueden saltar con el salto
  G.sc = sc; G.mons = []; G.projs = []; G.hazards = []; G.loot = []; G.parts = []; G.texts = [];
  G.channel = null; G.prompt = null; G.flash = null; G.deathT = 0; G.bossFight = null;
  P = newPlayer(sc.spawn.x, sc.spawn.y);
  refreshStats(); P.hp = P.maxHp; P.st = P.stMax;
  G.cam.x = P.x; G.cam.y = P.y-18;
  G.pets = []; G.allies = []; syncPets();
}
function enterDen(){
  G.mp = !!NET.role; resetWorld(buildDen());
  // en la guarida las mascotas se recuperan del todo y quedan registradas como "de la guarida"
  for(const it of allPetStores()) if(it && it.id==='pet'){ it.hp = petMaxHp(it); it.homed = true; G.save.collection[it.pet] = true; if(it.shiny) G.save.shinies[it.pet] = true; }
  for(const p of G.pets){ p.hp = p.maxHp; p.exhaustedT = 0; }
  G.save.inRaid = false; saveGame();
  UI.refresh();
  mmBuild(G.sc);
  if(typeof spawnDummy === 'function') spawnDummy();   // dummy de pruebas de Uakala
  playMusic('den');
}
// 2 portales de vuelta a la guarida en sitios aleatorios y alcanzables (separados entre sí y de la entrada)
function randomReturnPortals(sc){
  sc.portals = []; sc.lights = sc.lights.filter(l => l.col !== 'portal');
  // recorrido en anchura desde la entrada con paso fino (así entra por pasillos estrechos) y distancia de camino a cada celda
  const ST = 12, sx = sc.spawn.x, sy = sc.spawn.y, seen = new Set(['0,0']), cells = [[sx, sy, 0]];
  for(let h = 0; h < cells.length; h++){
    const [cx, cy, d] = cells[h], i = Math.round((cx - sx)/ST), j = Math.round((cy - sy)/ST);
    for(const [di, dj] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const a2 = i + di, b2 = j + dj, k = a2 + ',' + b2; if(seen.has(k)) continue; seen.add(k);
      if(!blocked(sc, sx + a2*ST, sy + b2*ST, 9)) cells.push([sx + a2*ST, sy + b2*ST, d + 1]);
    }
  }
  const maxD = cells.reduce((m, c) => Math.max(m, c[2]), 1);
  // el primer portal queda lejos de la entrada (por camino); el segundo, lo más lejos posible del primero y también lejos de la entrada
  const far = f => cells.filter(c => c[2] >= maxD*f);
  let c1 = far(.6); if(!c1.length) c1 = far(.3); if(!c1.length) c1 = cells.slice(); if(c1.length < 1) return;
  const add = c => { sc.portals.push({x:Math.round(c[0]), y:Math.round(c[1]), t:0}); sc.lights.push({x:Math.round(c[0]), y:Math.round(c[1])-8, r:120, a:.9, warm:false, flick:.1, col:'portal'}); };
  const p1 = c1[Math.floor(Math.random()*c1.length)]; add(p1);
  let pool = cells.filter(c => c[2] >= maxD*.35), best = null, bd = -1;
  if(!pool.length) pool = cells;
  for(let n = 0; n < 400; n++){ const c = pool[Math.floor(Math.random()*pool.length)], dd = Math.hypot(c[0] - p1[0], c[1] - p1[1]); if(dd > bd){ bd = dd; best = c; } }
  if(best && bd > 160) add(best);
}
// cofres y jaulas despejados: se quita el decorado que los tapa o les bloquea el paso
function clearAroundInteractables(sc){
  const spots = [...sc.chests, ...sc.cages];
  sc.props = sc.props.filter(p => {
    if(p.w || p.h) return true;   // los muros no se tocan
    for(const c of spots){ const dx = Math.abs(p.x - c.x), dy = p.y - c.y; if(dx < 30 && dy > -22 && dy < 50){ if(p.col) removeCollider(sc, p.col); return false; } }
    return true;
  });
}
// zonas de jefe despejadas (los jefes se atascaban con árboles y rocas): se quitan los obstáculos pequeños del interior de la sala, dejando un margen en los bordes
function clearBossRoom(sc){
  const r = sc.bossRoom; if(!r) return; const m = 50, x0 = r.x + m, y0 = r.y + m, x1 = r.x + r.w - m, y1 = r.y + r.h - m;
  sc.props = sc.props.filter(p => {
    if(p.w || p.h || !p.col || p.x <= x0 || p.x >= x1 || p.y <= y0 || p.y >= y1) return true;
    const c = p.col; if(c.t === 'r' && c.w >= 34) return true;   // los muebles grandes (trono, librerías) se quedan
    removeCollider(sc, c); return false;
  });
}
// en cooperativo todos usan la misma semilla y un Math.random sembrado mientras se genera la incursión, para que el mapa sea idéntico
function startRaid(expId='village', mpSeed){
  const realRandom = Math.random;
  if(mpSeed != null) Math.random = rng(mpSeed ^ 0x5bd1e995);
  G.mpInit = true;
  try { startRaidInner(expId, mpSeed != null ? mpSeed : Math.floor(realRandom()*1e9)); } finally { Math.random = realRandom; G.mpInit = false; }
}
function startRaidInner(expId, seed){
  const exp = EXPEDITIONS.find(e => e.id===expId) || HIDDEN_EXPEDITIONS.find(e => e.id===expId) || EXPEDITIONS[0];
  const sc = RAID_BUILDERS[expId] ? RAID_BUILDERS[expId](seed) : expId==='floatcity' ? buildFloatCity(seed) : expId==='icepeak' ? buildIcePeak(seed) : expId==='temple' ? buildTemple(seed) : expId==='forest' ? buildForest(seed) : expId==='mine' ? buildMine(seed) : expId==='river' ? buildRiver(seed) : expId==='castle' ? buildCastle(seed) : expId==='orccamp' ? buildOrcCamp(seed) : expId==='plains' ? buildPlains(seed) : expId==='crypt' ? buildCrypt(seed) : expId==='cemetery' ? buildCemetery(seed) : buildVillage(seed);
  sc.lvl = exp.lvl; sc.exp = exp; sc.petExp = exp.petExp ?? exp.lvl;
  randomReturnPortals(sc);
  if(Math.random() < LEGEND_CHEST_CHANCE) addLegendChest(sc);   // a veces hay un cofre legendario
  clearAroundInteractables(sc); clearBossRoom(sc);
  G.raidT = 0;
  G.save.sold = []; G.save.shopBought = {};   // Trapis olvida lo recomprable y repone su género al salir a una expedición
  resetWorld(sc); G.monSeq = 0; G.monSeqL = 0;
  for(const sp of G.sc.monsterSpawns) for(const e of sp.pack){
    for(let i=0;i<10;i++){
      const x = sp.x + rand(-32,32), y = sp.y + rand(-32,32);
      if(!blocked(G.sc, x, y, 12)){ G.mons.push(mkMonster(e.type, e.rarity, x, y)); break; }
    }
  }
  if(sc.bossSpawn){ const bo = mkMonster(exp.boss || 'countess', 'boss', sc.bossSpawn.x, sc.bossSpawn.y, {affixes:[]}); bo.spawnIn = 1; G.mons.push(bo); for(const eb of (sc.extraBosses || [])){ const b2 = mkMonster(eb.type, 'boss', eb.x, eb.y, {affixes:[]}); b2.spawnIn = 1; G.mons.push(b2); } }
  placeQuestStuff(G.sc, expId);
  P.oil = oilMax(); P.lantern = !!G.inv.equip.lantern; G.raidGold = 0; G.rescued = 0; G.rescuedNames = []; G.rescuedIds = []; G.kills = 0;
  G.save.inRaid = true; snapSave(); G.save.runs++; if(G.save.quest !== 'done'){ G.save.quest = 'done'; toast('Misión cumplida: ¡la primera expedición comienza!', 3.4); } saveGame();
  mmBuild(G.sc);
  playMusic('raid'); sfx('horse');
  toast(`Expedición ${exp.lvl}: ${exp.name}`, 3);
  toast(G.sc.cages.length ? 'Rescata mascotas y vuelve con vida' : 'Explora, consigue botín y vuelve con vida', 3);
}
function extract(how){
  G.save.wallet += G.raidGold;
  G.save.inRaid = false; G.save.shopBought = {}; G.save.extracts = (G.save.extracts||0) + 1; snapClear();
  if(!G.sc.noRank) G.save.maxExp = Math.max(G.save.maxExp||0, G.sc.lvl||1);
  if((G.raidT||0) >= SPECIALS_MIN_RAID) rollShopSpecials();   // las ofertas solo cambian si pasaste al menos 2 min dentro
  const pets = G.rescuedNames.length ? G.rescuedNames.join(', ') : 'ninguna';
  const html = `<h1>¡HAS VUELTO A CASA!</h1><p class="sub">${how}</p>
    <p>Oro conseguido: <b class="gold">${G.raidGold}</b></p><p>Mascotas rescatadas: <b>${pets}</b></p><p>Monstruos derrotados: <b>${G.kills}</b></p>`;
  const carried = G.raidGold; G.raidGold = 0;
  // al volver a casa la mochila entera pasa al alijo (lo equipado se queda puesto)
  let moved = 0;
  const goHome = it => (it.id === 'pet' && G.save.petCage && addTo(G.save.petCage, it)) || addTo(G.save.stash, it);   // las mascotas van a la jaula grande si la tienes (y hay sitio); lo demás, al alijo
  G.inv.bag = G.inv.bag.map(it => { if(it && goHome(it)){ moved++; return null; } return it; });
  (G.inv.equip.pbag || []).forEach((it, i) => { if(it && goHome(it)){ moved++; G.inv.equip.pbag[i] = null; } });   // las mascotas de la mochila mágica pasan a la jaula grande (o al alijo)
  const newTrapis = false;
  sfx('extract');
  enterDen();
  UI.showScreen(html, 'Continuar');
  if(carried) toast(`+${carried} oro guardado en la guarida`, 3);
  if(moved) toast(`${moved} objetos de la mochila pasan al alijo`, 3);
  if(newTrapis) toast('Alguien nuevo ha llegado a la guarida...', 4);
}
// pérdida por morir (o por salir de una expedición): equipo, mochila y mascotas
function dropRaidLoss(){
  // las mascotas que llevabas caen contigo: el druida solo podrá revivir las que ya conocían la guarida
  for(const it of G.inv.equip.pet.concat(G.inv.bag, G.inv.equip.pbag || [])) if(it && it.id==='pet' && it.homed) G.save.fallen.push({pet:it.pet, shiny:!!it.shiny});
  clearGear(); G.raidGold = 0; G.save.inRaid = false; G.save.shopBought = {}; snapClear();
}
function loseEverything(){
  dropRaidLoss();
  enterDen();
  UI.showScreen(`<h1 class="red">HAS CAÍDO</h1><p>Has perdido todo tu equipo, tu mochila y tus mascotas.</p>
    <p class="sub">Lo que guardaste en el alijo de la guarida sigue a salvo.</p>
    ${G.save.druid && G.save.fallen.length ? '<p class="sub">Chemma, el druida, puede devolver la vida a las mascotas caídas que ya conocían la guarida.</p>' : ''}`, 'Volver a la guarida');
}

// ---------- diálogos de la guarida ----------
function talkJuan(){
  const s = G.save, n = () => s.name;
  if(!s.talked){
    UI.say('Juan, el sabio', [
      '¡Por fin despiertas! Te encontré tirado a la entrada de la cueva.',
      'Soy Juan. Esta cueva es nuestra guarida, el último rincón cálido que queda.',
      {ask:'name', text:'¿Cómo te llamas, forastero?', fn: v => { s.name = v; saveGame(); }},
      () => `${n()}... un nombre con fuerza. Escúchame bien, ${n()}.`,
      'Ya has visto lo que hizo el Señor de la Noche: encerró a todas las mascotas del mundo y apagó la luz.',
      () => `Para devolver la luz y la alegría a este mundo tienes que rescatar a las mascotas y vencer al Señor de la Noche, ${n()}.`,
      'Antes de nada, necesito pedirte un favor. Mis amigos Trapis y Gonzalo se escondieron de los monstruos en las cabañas del pueblo abandonado.',
      'Si los rescatas vendrán a vivir a la guarida: Trapis te comprará y venderá de todo y Gonzalo te enseñará a hacerte más fuerte. Esa es tu misión.',
      'No podrás avanzar a otra expedición hasta completar la misión de la que estés. Quien tenga una misión para ti llevará un «!» sobre la cabeza.',
      'Mi caballo te llevará a la primera expedición: el pueblo abandonado. Allí hay mascotas enjauladas esperando.',
      'Ten cuidado: si caes allí fuera lo perderás todo, mascotas incluidas. Vuelve con el caballo o usa uno de los dos portales.',
      'Lo que guardes en el alijo, el cofre de la guarida, estará siempre a salvo. Suerte.',
    ], () => { s.talked = true; if(s.quest !== 'tutorial') s.quest = 'horse'; saveGame(); questAccept('friends'); });
    return;
  }
  if(questTalk('juan')) return;
  const tips = [
    () => `¿Qué tal, ${n()}? Si ves una jaula, pulsa [F] cerca de ella para liberar a la mascota.`,
    () => `${n()}, la linterna gasta aceite. Apágala con Shift si necesitas ahorrar, pero cuidado con lo que acecha en la oscuridad.`,
    () => `Los slimes con nombre azul son mágicos y los dorados, raros. Son más duros, pero sueltan mejor botín.`,
    () => `Correr, esquivar, golpear y cubrirse cansan, ${n()}. Vigila tu estamina.`,
    () => `Los tesoros que encuentres... guárdalos. Algún día alguien te los comprará.`,
    () => `Cuando seas más fuerte podrás llevar más de una mascota contigo, ${n()}. A nivel 10 y a nivel 20.`,
    () => `Cuida de tus mascotas, ${n()}. Si su vida llega a cero, mueren. Solo Chemma, el druida, puede devolverlas, y solo si ya conocían la guarida.`,
    () => `Hay sombras que solo se ven bajo la luz. Ni se te ocurra quedarte sin aceite.`,
  ];
  UI.say('Juan, el sabio', [pick(tips)]);
}
function talkTrapis(){
  const s = G.save;
  if(G.sc.kind === 'raid'){
    rescueNpc('trapis', 'Trapis', ['¡Chist! No grites, que nos oirán... Menos mal que eres tú, y no uno de esos monstruos.', 'Soy Trapis, el mercader. Llevo días escondido en esta cabaña desde que cayó la noche. Juan me habló de ti.', 'Si me llevas a la guarida abriré mi puesto: te venderé género y te compraré todo lo que encuentres. ¡Nos vemos allí!'], 'trapis', 'Trapis se muda a la guarida: ya tienes mercader');
    return;
  }
  if(!s.trapisMet){
    UI.say('Trapis', [
      () => `¡Vaya, vaya! Así que tú eres ${s.name}, quien ha vuelto con vida del pueblo abandonado. Juan no para de hablar de ti.`,
      'Me llamo Trapis y soy mercader. Bueno... era mercader, hasta que la noche se lo tragó todo.',
      'Traigo pociones, aceite para tu linterna, setas, piedras, palos y rodelas. Todo a buen precio, palabra de Trapis.',
      'Y si encuentras tesoros ahí fuera, cálices, anillos, relojes... tráemelos. Te los compro por buen oro.',
      'En la tienda tienes dos pestañas: «Comprar» y «Recomprar» (lo que me vendes puedes recuperarlo algo más caro mientras estés en la guarida). También vendo ampliaciones de mochila y de alijo.',
    ], () => { s.trapisMet = true; saveGame(); if(!questTalk('trapis')) UI.toggleInv('shop'); });
    return;
  }
  toast(pick(['Trapis: ¿Qué te pongo hoy?', 'Trapis: ¡Género fresco, recién rescatado de la oscuridad!', `Trapis: Para ti, ${s.name}, precio de amigo.`]), 2);
  UI.toggleInv('shop');
}
function talkDruid(){
  const s = G.save;
  if(G.sc.kind === 'raid'){
    rescueNpc('druid', 'Chemma, el druida', ['¡Por fin alguien! Llevo días atrapado entre estas tumbas, sin poder volver...', 'Soy Chemma, druida experto en mascotas. Mi primo Gonzalo te habrá hablado de mí. Sácame de aquí y viviré en tu guarida: cuidaré de tus mascotas.'], 'druid', 'Chemma se muda a la guarida: ya tienes druida');
    return;
  }
  if(!s.druidMet){
    UI.say('Chemma, el druida', [
      () => `Gracias por sacarme de aquel cementerio, ${s.name}. Ya estoy en casa.`,
      'Soy un druida. Durante años cuidé de las mascotas, antes de que el Señor de la Noche las encerrara.',
      'Esto es lo que puedo hacer por ti: en «Adiestrador» aprendes habilidades para tus mascotas con los puntos que ganas al liberarlas (1 por cada 5); en «Colección / Resucitar» ves todas las mascotas y devuelvo la vida a las caídas por oro; y en «Tienda» vendo jaula grande, mochila mágica y talismanes.',
      'Y cuando me traigas mi botiquín (te lo pediré pronto) abriré «Mejorar mascotas»: sueros que fortalecen a tus mascotas, aunque con algo de riesgo.',
      'Escúchame: ahí fuera las mascotas pueden morir. Si caen en combate, o si caes tú, no volverán por sí solas.',
      'Pero el espíritu de una mascota que ya conoce esta guarida queda ligado a ella. Tráeme oro para las ofrendas y la devolveré a la vida.',
      'Las que mueran antes de pisar la guarida... esas se pierden para siempre. Tráelas a casa cuanto antes.',
    ], () => { s.druidMet = true; saveGame(); if(!questTalk('druid')) UI.openTrainer(); });
    return;
  }
  if(questTalk('druid')) return;
  UI.openTrainer();
}
function talkGonzalo(){
  const s = G.save;
  if(G.sc.kind === 'raid'){
    rescueNpc('gonzalo', 'Gonzalo el profesor', ['¡Un superviviente! Creía que los monstruos me habían encontrado...', 'Soy Gonzalo, profesor de la academia. Me escondí en esta cabaña cuando se apagó la luz. Juan me ha hablado de ti.', 'Llévame a la guarida y te enseñaré a hacerte más fuerte con los puntos que ganes al subir de nivel.'], 'gonzalo', 'Gonzalo se muda a la guarida: ya tienes profesor');
    return;
  }
  if(!s.gonzaloMet){
    UI.say('Gonzalo el profesor', [
      () => `Ajá... tú debes de ser ${s.name}. Juan me ha contado que empiezas a hacerte fuerte ahí fuera.`,
      'Me llamo Gonzalo. Fui profesor en la academia, antes de que la noche apagara las aulas.',
      'Cada vez que aprendes algo en tus expediciones, cada vez que subes de nivel, ganas un punto de entrenamiento.',
      'Conmigo puedes invertirlos en cinco disciplinas: Agresividad, Agilidad, Cardio, Aguante y Explorador. Veinte lecciones en cada una.',
      'Elige con cabeza. Un buen alumno sabe en qué es fuerte.',
    ], () => { s.gonzaloMet = true; saveGame(); if(!questTalk('gonzalo')) UI.openSkills(); });
    return;
  }
  if(questTalk('gonzalo')) return;
  UI.openSkills();
}
// ofertas especiales de Trapis: 8 objetos de equipo mágicos o raros (a veces legendarios) que cambian tras cada expedición
const SPECIALS_MIN_RAID = 120;
function rollShopSpecials(){
  const tier = Math.max(1, G.save.maxExp||1), pool = SHOP.filter(o => o.tier <= tier && ITEMS[o.id].gear);
  const legs = LEGEND_IDS.filter(id => ITEMS[id] && (ITEMS[id].lvl || 1) <= tier);
  G.save.shopSpecials = [];
  let nLeg = 0;
  for(let i=0;i<8 && pool.length;i++){
    if(legs.length && nLeg < 2 && Math.random() < .03){
      const id = legs.splice(randi(0, legs.length-1), 1)[0]; nLeg++;
      G.save.shopSpecials.push({item:mkItem(id, 1, tier), price:Math.round((ITEMS[id].value || 300) * 10)});
      continue;
    }
    const o = pick(pool), rar = Math.random() < .4 ? 'rare' : 'magic', it = mkGear(o.id, rar, tier);
    G.save.shopSpecials.push({item:it, price:Math.round(o.price * (it.rarity==='rare' ? 4 : 2.2) * (1 + it.affixes.length*.1))});
  }
}
// Uakala, el herrero orco desterrado: pide vivir en la guarida y, una vez allí, repara y mejora el equipo
function talkUakala(){
  const s = G.save;
  if(G.sc.kind === 'raid'){
    if(s.uakalaHome) return;
    UI.say('Uakala, el herrero orco', [
      'Eh... tranquilo, forastero. No vengo a pelear. Me llaman Uakala.',
      'Soy herrero. Mis hermanos me han desterrado del campamento porque me negué a hacer daño a las mascotas que encadenan aquí.',
      'Ahora vago sin rumbo, buscando un sitio en el que vivir y trabajar el metal. Sé reparar el equipo... y a veces, mejorarlo.',
      {text:'¿Me dejarías vivir en vuestra guarida?', choice:[{label:'Aceptar: ven a la guarida', fn:() => {
        s.uakalaHome = true; saveGame();
        const un = G.sc.npcs.find(q => q.id === 'uakala'); if(un && un.col) removeCollider(G.sc, un.col);
        G.sc.npcs = G.sc.npcs.filter(q => q.id !== 'uakala');
        toast('Uakala se muda a la guarida: ahora tendrás herrero', 4);
      }}]}]);
    return;
  }
  if(!s.uakalaMet){
    UI.say('Uakala, el herrero orco', ['Gracias por acogerme. Mi yunque y mi fragua son tuyos.', 'Puedo reparar tu equipo por unas monedas (pestaña «Reparar»). Y si te atreves, probar a mejorarlo en el yunque (pestaña «Mejorar»): forjar afijos nuevos o afilar el daño de las armas... aunque el metal es caprichoso y a veces se rompe.'], () => { s.uakalaMet = true; saveGame(); if(!questTalk('uakala')) UI.openSmith(); });
    return;
  }
  if(questTalk('uakala')) return;
  UI.openSmith();
}
// Aish, el elfo de luz: pide cobijo en la guarida y engarza gemas en el farolillo
function talkAish(){
  const s = G.save;
  if(G.sc.kind === 'raid'){
    if(s.aishHome) return;
    UI.say('Aish, elfo de luz', [
      'Quieto, viajero. No me ataques: todavía soy yo mismo.',
      'Me llamo Aish, elfo de luz. Mi raza ha sido poseída por el Señor de la Noche: sus ojos arden ahora en la oscuridad y persiguen a todo lo que vive.',
      'Soy el único que sobrevivió, gracias a este farol mágico que heredé de mis ancestros. Su luz pura los mantiene lejos.',
      'Los elfos poseídos llevan piezas de equipo muy poderosas que podrían ayudarte. Y también las llaves de la mina de los enanos.',
      'En esa mina hay grandes tesoros ocultos: gemas. Tráemelos y te enseñaré a usarlos en tus farolillos.',
      {text:'¿Me darías cobijo en vuestra guarida? Allí podré mejorar tus farolillos.', choice:[{label:'Aceptar: ven a la guarida', fn:() => {
        s.aishHome = true; saveGame();
        const an = G.sc.npcs.find(q => q.id === 'aish'); if(an && an.col) removeCollider(G.sc, an.col);
        G.sc.npcs = G.sc.npcs.filter(q => q.id !== 'aish');
        toast('Aish se muda a la guarida: ahora podrás engarzar gemas', 4);
      }}]}]);
    return;
  }
  if(!s.aishMet){
    UI.say('Aish, elfo de luz', ['Gracias por el cobijo. Aquí la oscuridad no me alcanza.', 'Trae gemas de la mina de los enanos y las engarzaré en tu farolillo: cada una le da un poder distinto.', 'La mina de los enanos solo se abre con una llave de la mina (se gasta una por viaje): los elfos poseídos las llevan.'], () => { s.aishMet = true; saveGame(); if(!questTalk('aish')) UI.openAish(); });
    return;
  }
  if(questTalk('aish')) return;
  UI.openAish();
}
function talkHorse(){
  if(G.sc.id === 'garden'){ UI.say('Caballo', [{text:'¿Qué quieres hacer?', choice:[{label:'Volver a la guarida', fn:() => enterDen()}, {label:'Ir al mapa de incursiones', fn:() => { if((G.save.extracts||0) >= 1) UI.openRaidMap(); }}, {label:'Todavía no'}]}]); return; }
  if(G.sc.id === 'timehall'){ UI.say('Caballo', [{text:'¿Volver a la guarida?', choice:[{label:'Sí, volver', fn:() => enterDen()}, {label:'Todavía no'}]}]); return; }
  // tras volver con vida al menos una vez, el caballo muestra el mapa de incursiones
  if((G.save.extracts||0) >= 1){ UI.openRaidMap(); return; }
  if(!G.save.talked){ UI.say('Caballo', ['El caballo resopla y te mira con desconfianza. Quizá deberías hablar primero con Juan.']); return; }
  UI.say('Caballo', [{text:'El caballo de Juan está ensillado. ¿Viajar a la Expedición 1: El pueblo abandonado?',
    choice:[{label:'Sí, en marcha', fn:() => startRaid('village')}, {label:'Todavía no'}]}]);
}

// ---------- interacciones (E) ----------
function interactables(){
  const sc = G.sc, list = [];
  const add = (x, y, r, text, fn, py) => { const d = Math.hypot(P.x-x, P.y-y); if(d < r) list.push({d, x, y:py ?? y-40, text, fn}); };
  const talk = {juan:talkJuan, trapis:talkTrapis, druid:talkDruid, gonzalo:talkGonzalo, uakala:talkUakala, aish:talkAish, alexandra:talkAlexandra, rolecs:talkRolecs, oluaf:talkOluaf};
  for(const n of sc.npcs) add(n.x, n.y, 34, n.rescue ? '[F] Hablar con ' + n.name : n.id==='oluaf' ? '[F] Oluaf, el pastor' : n.id==='rolecs' ? '[F] Rolecs, señor del tiempo' : n.id==='alexandra' ? (sc.kind==='raid' ? '[F] Hablar con Alexandra' : '[F] Alexandra, la nórdica jugona') : n.id==='aish' ? (sc.kind==='raid' ? '[F] Hablar con Aish' : '[F] Aish, elfo de luz') : n.id==='uakala' ? (sc.kind==='raid' ? '[F] Hablar con Uakala' : '[F] Herrero Uakala') : n.id==='trapis' ? '[F] Comerciar con Trapis' : n.id==='druid' ? '[F] Hablar con Chemma' : n.id==='gonzalo' ? '[F] Hablar con Gonzalo' : '[F] Hablar con Juan, el sabio', talk[n.id], n.y-52);
  if(sc.horse){
    if(sc.kind==='den') add(sc.horse.x, sc.horse.y, 46, '[F] Caballo', () => { sfx('horse'); talkHorse(); }, sc.horse.y-42);
    else add(sc.horse.x, sc.horse.y, 46, '[F] Volver a casa', () => { sfx('horse'); startChannel(3, 'Volviendo a casa...', () => extract('Has vuelto a lomos del caballo de Juan.'), '#c8a070'); }, sc.horse.y-42);
  }
  if(sc.gardenDoor) add(sc.gardenDoor.x, sc.gardenDoor.y + 6, 54, '[F] Cruzar la puerta del jardín secreto', () => startChannel(2, 'Abriendo la puerta...', gardenEnter, '#ffb0e0'), sc.gardenDoor.y - 70);
  if(sc.bench) add(sc.bench.x, sc.bench.y, 36, P.sitting ? '[F] Levantarse' : '[F] Sentarse en el banco', () => toggleSit(sc), sc.bench.y - 34);
  if(sc.bigCage) add(sc.bigCage.x, sc.bigCage.y, 32, '[F] Jaula grande (mascotas)', () => UI.toggleInv('cage'), sc.bigCage.y-44);
  if(sc.safeProp) add(sc.safeProp.x, sc.safeProp.y, 32, '[F] Caja fuerte', () => UI.toggleInv('safe'), sc.safeProp.y-44);
  if(sc.slotProp) add(sc.slotProp.x, sc.slotProp.y, 34, '[F] Tragaperras', () => UI.openSlots(), sc.slotProp.y - 52);
  if(sc.stash) add(sc.stash.x, sc.stash.y, 30, '[F] Alijo', () => UI.toggleInv('stash'), sc.stash.y-26);
  if(sc.portalProp) add(0, -150, 60, '[F] Portal del tiempo', useTimePortal, -190);
  for(const c of sc.chests) if(!c.open) add(c.x, c.y, 26, c.legend ? '[F] Abrir cofre legendario' : c.rare ? '[F] Abrir cofre raro' : '[F] Abrir cofre', () => startChannel((c.legend ? 1.8 : c.rare ? 1.2 : .7)*(1 - TT('ra')/100), 'Abriendo...', () => openChest(c)), c.y-24);
  for(const c of sc.cages) if(!c.open) add(c.x, c.y, 28, c.gift ? '[F] Abrir la jaula brillante' : '[F] Abrir jaula', () => startChannel(1.5*(1 - TT('ra')/100)*Math.max(.3, 1 - (G.pt.cageSpd||0)/100), 'Forzando la jaula...', () => openCage(c), '#7ae09a'), c.y-36);
  for(const l of G.loot) if(l.item && l.z===0 && lootVisible(l)) add(l.x, l.y, 20, '[F] Coger ' + itemName(l.item), () => pickLoot(l), l.y-18);
  list.sort((a,c) => a.d-c.d);
  return list[0] || null;
}
function startChannel(dur, label, fn, col){ G.channel = {t:0, dur, label, fn, col, x:P.x, y:P.y, hp:P.hp}; }
function updateChannel(dt){
  const c = G.channel; if(!c) return;
  if(Math.hypot(P.x-c.x, P.y-c.y) > 6 || P.hp < c.hp || P.punchT > 0 || P.dead){ G.channel = null; toast('Interrumpido', 1); return; }
  c.t += dt;
  if(c.t >= c.dur){ G.channel = null; c.fn(); }
}
function openChest(c){
  if(c.open) return;
  c.open = true; sfx('chest'); coopOpened('chest', c);
  if(c.legend){ openLegendChest(c); return; }
  const T = c.rare ? LOOT.chestRare : LOOT.chestNormal, n = randi(T.rolls[0], T.rolls[1]), lvl = G.sc.lvl || 1;
  const table = lootFor(T.table, lvl), bonus = c.rare ? .5 : 0;
  const goldMult = (hasPetAffix('buscatesoros') ? 1.15 : 1) * (1 + (G.stats ? G.stats.gold : 0)/100) * (1 + (lvl-1)*.35);
  const give = e => {
    if(e.id==='gold') dropGold(c.x, c.y+4, Math.round(randi(e.n[0], e.n[1])*goldMult));
    else dropItem(c.x, c.y+4, mkItem(e.id, e.n ? randi(e.n[0], e.n[1]) : 1, lvl, bonus));
  };
  if(T.always) give({id:T.always});
  if(c.rare && MS('exp',20)) give(wpick(table));                  // Explorador 20
  if(Math.random() < TT('bo')/100) give(wpick(table));               // botín extra según el árbol
  if(!c.rare && MS('exp',30) && Math.random() < .2) give(wpick(table));   // Cazador de tesoros
  for(let i=0;i<n;i++) give(wpick(table));
  if(hasPetAffix('buscatesoros') && Math.random() < .05) give({id:'treasure'});
  legendChest(c, lvl); legendExclChest(c);
  burst(c.x, c.y-8, c.rare ? 20 : 10, c.rare ? ['#ffe08a','#c8a0ff'] : ['#96704a','#ffe08a'], [40,140], [.3,.6]);
}
// mascota que hay dentro de una jaula: cada una pesa según su probabilidad de rareza y no se repiten las de esta incursión
const hasTal = id => (G.inv.equip.tal || []).some(t => t && t.id === id);
function rollCagePet(lvl){
  let pool = petsOfExp(lvl).filter(id => !G.rescuedIds.includes(id)); if(!pool.length) pool = petsOfExp(lvl);
  // el adiestrador (rama Buscador) hace más probables las mascotas mágicas, raras y legendarias
  const wt = id => { const q = PETS[id].rarity; return CAGE_CHANCE[q] * (q==='normal' ? 1 : 1 + (G.pt.findPct||0)/100) * (q==='legendary' && G.pt.legBonus ? 2 : 1) * (q!=='normal' && hasTal('rabbitfoot') ? 2 : 1) * shepMul(q); };
  let r = Math.random()*pool.reduce((s, id) => s + wt(id), 0);
  for(const id of pool){ r -= wt(id); if(r <= 0) return id; }
  return pool[pool.length-1];
}
function openCage(c){
  c.pet = rollCagePet(G.sc.petExp ?? (G.sc.lvl || 1));   // la tirada se hace ahora, no al entrar en el mapa
  const clover = (G.inv.equip.tal || []).findIndex(t => t && t.id === 'luckclover');   // el trébol de la suerte duplica la probabilidad de mascota brillante
  let shiny = !!c.shiny;
  if(!shiny && Math.random() < .05*(clover >= 0 ? 2 : 1) + shepPct('shiny')/100){ shiny = true; if(clover >= 0){ G.inv.equip.tal[clover] = null; toast('El trébol de la suerte se ha desvanecido...', 3); refreshStats(); } }   // 5 % de que sea brillante (las jaulas de regalo siempre lo son); el trébol desaparece al encontrarla
  { const rf = (G.inv.equip.tal || []).findIndex(t => t && t.id === 'rabbitfoot'); if(rf >= 0 && PETS[c.pet].rarity === 'legendary'){ G.inv.equip.tal[rf] = null; toast('La pata de conejo se ha desvanecido...', 3); refreshStats(); } }
  const isNew = !(G.save.freedSp && G.save.freedSp[c.pet]);   // el cartel de enhorabuena solo sale con especies nuevas
  G.save.petsFreed = (G.save.petsFreed || 0) + 1; (G.save.freedSp ??= {})[c.pet] = true;   // los puntos del adiestrador cuentan especies distintas
  c.open = true; coopOpened('cage', c); G.rescued++; G.rescuedNames.push(PETS[c.pet].name); G.rescuedIds.push(c.pet); sfx('cage');
  const it = mkPetItem(c.pet, false, shiny), p = PETS[c.pet];
  toast(shiny ? `¡${p.name} es BRILLANTE! (${RARITY[p.rarity].name})` : `¡Has rescatado a ${p.name}! (${RARITY[p.rarity].name})`, 3);
  showPetPick(it, c, isNew);   // ventanita con la mascota: clic o F para cogerla; sin sitio, cae al suelo
  burst(c.x, c.y-14, 24, ['#fff1c0','#7ae09a', RARITY[p.rarity].col], [40,160], [.5,1], -40);
  G.flash = {x:c.x, y:c.y-12, t:.4};
}
// ventanita al abrir una jaula: la mascota se coge con clic o con F; si la mochila está llena cae al suelo
const PET_COL = {normal:'#ffffff', magic:'#6aa8ff', rare:'#f2d14b', legendary:'#ff4a4a'};   // color de la mascota (ventanita y suelo)
let PET_PICK = null;
function showPetPick(it, c, isNew){
  const p = PETS[it.pet], col = PET_COL[p.rarity], kd = petDmgMult(it);
  const take = () => {
    if(!PET_PICK) return; PET_PICK = null;
    const s = $('screen'); s.classList.add('hidden'); UI.screen = null; sfx('ui');
    if(!addToBag(it)){ dropItem(c.x, c.y+6, it); toast('Mochila llena: la mascota cae al suelo', 2.5); }
    if(isNew) UI.showPetCard(it.pet, !!it.shiny);
  };
  PET_PICK = {take};
  UI.showScreen('<div class="petpick"><div class="pp-top">' + (it.shiny ? '★ ¡BRILLANTE! ★' : '¡Jaula abierta!') + '</div><img id="ppIcon" src="' + itemIconURL(it) + '" draggable="false"><h2 style="color:' + col + '">' + itemName(it) + '</h2><div class="pp-sub" style="color:' + col + '">Mascota ' + RARITY[p.rarity].name.toLowerCase() + '</div><div class="pp-st">Vida <b>' + petMaxHp(it) + '</b> · Daño <b>' + Math.round(p.dmg[0]*kd) + '-' + Math.round(p.dmg[1]*kd) + '</b></div></div>', 'Coger [F]', take);
  $('ppIcon').onclick = take;
}
addEventListener('keydown', e => { if(PET_PICK && (e.code === 'KeyF' || e.code === 'Enter' || e.code === 'Space')){ e.preventDefault(); e.stopImmediatePropagation(); if(!e.repeat) PET_PICK.take(); } }, true);
function pickLoot(l){
  if(!addToBag(l.item)){ toast('La mochila está llena'); return; }
  l.taken = true; G.loot = G.loot.filter(o => !o.taken);
  if(l.lid != null && NET.role && G.mp) NET.send('lp', {lid:l.lid}, undefined, true);   // cooperativo: desaparece también para los compañeros
  addText(P.x, P.y-46, itemName(l.item), itemColor(l.item), 7); sfx('pickup');
}
function updatePortals(dt){
  for(const p of G.sc.portals){
    if(Math.hypot(P.x-p.x, P.y-p.y) < 34 && !P.dead){
      if(p.t === 0 || Math.floor(p.t/1.2) !== Math.floor((p.t+dt)/1.2)) sfx('portal', .5);
      p.t += dt;
      G.channel = {t:p.t, dur:5, label:'El portal te envuelve...', col:'#9a7aff', fn(){}, x:P.x, y:P.y, hp:P.hp, portal:true};
      if(p.t >= 5){ G.channel = null; extract('Has cruzado uno de los portales.'); return; }
    } else if(p.t > 0){ p.t = 0; if(G.channel && G.channel.portal) G.channel = null; }
  }
}

// ---------- actualización ----------
function update(dt){
  G.t += dt;
  if(G.sc.kind === 'raid' && (G.snapT = (G.snapT || 0) + dt) > 10){ G.snapT = 0; snapSave(); }
  if(G.sc.kind==='raid' && !G.paused) G.raidT = (G.raidT||0) + dt;   // cronómetro de la expedición
  if(NET.role) coopUpdate(dt);
  for(const t of toasts) t.t -= dt;
  while(toasts.length && toasts[0].t <= 0) toasts.shift();
  if(UI.introOpen){ pressed.KeyI = pressed.Tab = pressed.Escape = false; }
  if(UI.dlg) UI.updateDlg(dt);
  updateTutorial(dt);
  if(!UI.dlg && !UI.screen && !G.paused && pressed.KeyI) UI.toggleInv(UI.invOpen ? UI.mode : false);
  if(!UI.dlg && !UI.screen && !G.paused && pressed.Tab){ G.bigMap = !G.bigMap; sfx('ui'); }
  if(typeof tradeUpdate === 'function') tradeUpdate();
  if(pressed.Escape && UI.oluafOpen){ UI.closeOluaf(); pressed.Escape = false; }
  if(pressed.Escape && UI.slotsOpen){ if(!SL.spinning) UI.closeSlots(); pressed.Escape = false; }
  if(pressed.Escape && UI.rouletteOpen){ if(!UI.rouletteSpinning) UI.closeRoulette(); pressed.Escape = false; }
  if(pressed.Escape){
    if(G.paused) closePause();
    else if(UI.invOpen || UI.mapOpen || UI.skillOpen || UI.trainerOpen || UI.smithOpen || UI.aishOpen || G.bigMap){ if(UI.smithOpen) UI.closeSmith(); if(UI.aishOpen) UI.closeAish(); if(UI.trainerOpen) UI.closeTrainer(); if(UI.invOpen) UI.closeInv(); if(UI.mapOpen) UI.closeRaidMap(); if(UI.skillOpen) UI.closeSkills(); G.bigMap = false; }
    else if(!UI.dlg && !UI.screen && !P.dead) openPause();
  }
  if(G.paused && !(G.mp && NET.role)) return;   // en cooperativo el menú de pausa no detiene el mundo
  updateBigMapDrag();
  if(pressed.KeyH) G.showHelp = !G.showHelp;
  if(pressed.KeyM) toggleMute();
  // intensidad de la música de combate
  const alert = G.mons.some(m => m.aggro && !m.dying && Math.hypot(m.x-P.x, m.y-P.y) < 260);
  AUDIO.combat = lerp(AUDIO.combat, alert ? 1 : 0, Math.min(1, dt*(alert ? 2 : .5)));
  if(!UI.screen) mmReveal();
  if(UI.screen) return;
  if(G.hitstop > 0){ G.hitstop -= dt; return; }
  G.shake *= Math.exp(-dt*12);

  if(!G.paused){ const st0 = P.st; updatePlayer(dt); if(P.elfT > 0){ P.elfT -= dt; if(P.st < st0) P.st = st0; } }   // poción élfica: nada gasta estamina
  for(const p of G.pets) updatePet(p, dt);
  separatePets(dt);
  updateAllies(dt);
  if(NET.role === 'guest' && G.mp && G.sc.kind === 'raid') coopMirrorMons(dt); else for(const m of G.mons) updateMonster(m, dt);   // el invitado solo refleja lo que simula el anfitrión
  G.mons = G.mons.filter(m => !(m.dying > .25));
  updateProjs(dt); updateHazards(dt); updateTraps(dt); updateLoot(dt);
  for(const p of G.parts){ p.life -= dt; if(p.vx !== undefined){ p.x += p.vx*dt; p.y += p.vy*dt; p.vx *= .93; p.vy = p.vy*.93 + (p.grav||0)*dt; } }
  G.parts = G.parts.filter(p => p.life > 0);
  if(G.parts.length > 2500) G.parts.splice(0, G.parts.length - 2500);   // tope: en combates enormes las partículas podían colgar el juego
  for(const t of G.texts){ t.life -= dt; t.y += t.vy*dt; t.vy *= .94; }
  G.texts = G.texts.filter(t => t.life > 0);
  if(G.flash){ G.flash.t -= dt; if(G.flash.t <= 0) G.flash = null; }
  updateFairies(dt); updateLegends(dt); updateLegends2(dt); updateLegends3(dt); updateIcePeak(dt); updateWorld12(dt); updateQuests(dt);
  for(const c of G.sc.chests) if(c.pinged > 0) c.pinged -= dt;
  for(const p of G.sc.portals) if(!p.seen && Math.hypot(p.x-P.x, p.y-P.y) < 260) p.seen = true;   // los portales se marcan en el mapa al descubrirlos
  // fuegos fatuos: deambulan despacio alrededor de su sitio
  for(const w of G.sc.wisps || []){ w.ph += dt; w.x = w.hx + Math.sin(w.ph*.5)*34; w.y = w.hy + Math.cos(w.ph*.37)*22; }

  // interacciones
  if(!P.dead && !G.paused){
    if(G.sc.kind==='raid') updatePortals(dt);
    if(G.channel && !G.channel.portal) updateChannel(dt);
    G.prompt = UI.blocking() || G.channel || G.noIntT > 0 ? null : interactables();
    if(G.prompt && pressed.KeyF && !UI.blocking()) G.prompt.fn();
  }
  // muerte
  if(P.dead){ G.deathT -= dt; if(G.deathT <= 0 && !UI.screen) loseEverything(); }
}

// ---------- luces ----------
function collectLights(){
  const L = [], t = G.t;
  for(const w of G.sc.wisps || []) L.push({x:w.x, y:w.y-12, r:48, a:.5, warm:false});
  for(const s of G.sc.lights){
    const fl = 1 + Math.sin(t*13 + s.x)*(s.flick||0)*.3 + (Math.random()-.5)*(s.flick||0)*.2;
    L.push({x:s.x, y:s.y, r:s.r*fl, a:s.a, warm:s.warm, col:s.col, tint:s.tint});
  }
  if(!P.dead){
    if(P.lantern && !(P.hallT > 0) && (P.oil > 0 || G.sc.kind!=='raid')){
      const fl = 1 + Math.sin(t*13)*.03 + Math.sin(t*7.3)*.04 + (Math.random()-.5)*.03;
      const gm = lanternGem(); L.push({x:P.lx, y:P.ly, r:175*fl*(gm.light||1)*(legendOn('minerhelm') ? 1.3 : 1)*((G.inv.equip.head && ITEMS[G.inv.equip.head.id].lightMul) || 1)*(G.inv.equip.lantern && G.inv.equip.lantern.id === 'dawnlantern' ? 1.4 : 1), a:1, warm:true, tint:gemTint(gm)});
    }
    L.push({x:P.x, y:P.y-16, r:44, a:.55, ambient:true});
  }
  for(const r of G.remote || []){   // farolillo de los compañeros
    if(r.hidden || r.dead) continue;
    L.push({x:r.x, y:r.y-16, r:44, a:.55, ambient:true});
    if(r.lt) L.push({x:r.x + r.lt[1], y:r.y + r.lt[2], r:r.lt[0]*(1 + Math.sin(t*13 + r.id)*.03 + (Math.random()-.5)*.03), a:1, warm:true, tint:r.lt[3]});
  }
  for(const p of G.pets){
    if(p.exhaustedT > 0) continue;
    if(p.def.id==='alba') L.push({x:p.x, y:p.y-12, r:85, a:.8, warm:true});
    else if(petHas(p,'luciernaga')) L.push({x:p.x, y:p.y-10, r:62, a:.7, warm:true});
    if(p.def.moonlight) L.push({x:p.x, y:p.y-16, r:95, a:.8, warm:false});
  }
  fairyLights(L);
  if(P.flameT > 0) L.push({x:P.x + Math.cos(P.face)*55, y:P.y - 14, r:175, a:.9, warm:true});
  if(G.flash) L.push({x:G.flash.x, y:G.flash.y, r:240*G.flash.t/.4, a:1, warm:true});
  return L;
}
function drawLighting(bw, bh){
  if(darkC.width !== bw || darkC.height !== bh){ darkC.width = bw; darkC.height = bh; }
  dk.globalCompositeOperation = 'source-over';
  dk.clearRect(0, 0, bw, bh);
  dk.fillStyle = `rgba(3,3,9,${P.hallT > 0 ? Math.max(G.sc.darkness, .993) : G.sc.darkness})`; dk.fillRect(0, 0, bw, bh);
  dk.globalCompositeOperation = 'destination-out';
  for(const l of G.frameLights){
    const sx = l.x + G.ox, sy = l.y + G.oy;
    if(sx < -l.r || sy < -l.r || sx > bw+l.r || sy > bh+l.r) continue;
    const g = dk.createRadialGradient(sx, sy, 0, sx, sy, l.r);
    g.addColorStop(0, `rgba(0,0,0,${l.a})`); g.addColorStop(.5, `rgba(0,0,0,${l.a*.75})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    dk.fillStyle = g; dk.fillRect(sx-l.r, sy-l.r, l.r*2, l.r*2);
  }
  dk.globalCompositeOperation = 'source-over';
  b.setTransform(1,0,0,1,0,0);
  b.drawImage(darkC, 0, 0);
  // tinte cálido / violeta de las fuentes de luz
  b.globalCompositeOperation = 'lighter';
  for(const l of G.frameLights){
    if(!l.warm && l.col!=='portal') continue;
    const sx = l.x + G.ox, sy = l.y + G.oy, r = l.r*.7;
    if(sx < -r || sy < -r || sx > bw+r || sy > bh+r) continue;
    const g = b.createRadialGradient(sx, sy, 0, sx, sy, r);
    g.addColorStop(0, l.tint || (l.col==='portal' ? 'rgba(110,80,255,.16)' : 'rgba(255,140,50,.10)')); g.addColorStop(1, 'rgba(0,0,0,0)');
    b.fillStyle = g; b.fillRect(sx-r, sy-r, r*2, r*2);
  }
  b.globalCompositeOperation = 'source-over';
}

// ---------- dibujo ----------
function draw(){
  const bw = Math.ceil(W/PX), bh = Math.ceil(H/PX);
  if(buf.width !== bw || buf.height !== bh){ buf.width = bw; buf.height = bh; }
  G.cam.x += (P.x - G.cam.x)*.12; G.cam.y += (P.y - 18 - G.cam.y)*.12;
  const sx = Math.round(G.cam.x + rand(-G.shake, G.shake)), sy = Math.round(G.cam.y + rand(-G.shake, G.shake));
  G.ox = Math.round(bw/2 - sx); G.oy = Math.round(bh/2 - sy);
  b.setTransform(1,0,0,1,0,0); b.imageSmoothingEnabled = false;
  b.fillStyle = G.sc.kind==='den' ? '#0c0b0a' : '#14160f'; b.fillRect(0, 0, bw, bh);
  b.setTransform(1,0,0,1,G.ox,G.oy);
  const vx0 = sx-bw/2-60, vx1 = sx+bw/2+60, vy0 = sy-bh/2-60, vy1 = sy+bh/2+110;
  const sc = G.sc;
  // suelo
  for(let i=Math.floor(Math.max(vx0, sc.x0)/CH); i<=Math.floor(Math.min(vx1, sc.x1-1)/CH); i++)
    for(let j=Math.floor(Math.max(vy0, sc.y0)/CH); j<=Math.floor(Math.min(vy1, sc.y1-1)/CH); j++)
      b.drawImage(groundChunk(sc, i, j), i*CH, j*CH);
  for(const d of sc.decals || []){ if(d.x<vx0-20||d.x>vx1||d.y<vy0-20||d.y>vy1) continue; if(d.flip){ b.save(); b.translate(d.x+16, d.y); b.scale(-1,1); b.drawImage(d.img, 0, 0); b.restore(); } else b.drawImage(d.img, d.x, d.y); }
  for(const d of sc.decos){ if(d.x<vx0||d.x>vx1||d.y<vy0||d.y>vy1) continue; const s = decoSprite(d.k, d.v); b.drawImage(s, d.x-(s.width>>1), d.y-s.height); }
  drawTraps();
  for(const h of G.hazards) drawHazard(h);
  // entidades ordenadas por profundidad
  G.frameLights = collectLights();
  const list = [], inView = (x,y) => x>vx0-40 && x<vx1+40 && y>vy0-20 && y<vy1+60;
  for(const p of sc.props){
    const vis = p.w ? (p.x < vx1 && p.x+p.w > vx0 && p.y > vy0 && p.y-p.h-WALL_H < vy1) : inView(p.x, p.y);
    if(vis) list.push(p);
  }
  for(const c of sc.chests) if(inView(c.x,c.y)) list.push({y:c.y, draw:() => drawChest(c)});
  for(const c of sc.cages) if(inView(c.x,c.y)) list.push({y:c.y, draw:() => drawCage(c)});
  for(const n of sc.npcs){
    n.dir = P.x < n.x ? -1 : 1;
    list.push({y:n.y, draw:() => { pshadow(n.x, n.y, 10, 3); drawSP(ART[n.id][Math.sin(G.t*1.6 + n.x)>0?0:1], n.x, n.y, n.dir<0);
      const mk = n.rescue || (sc.kind === 'raid' && ['uakala', 'aish', 'alexandra'].includes(n.id)) || (n.id === 'juan' && G.save.quest === 'juan') ? 'new' : (sc.kind === 'den' ? questMark(n.id) : null);
      if(mk && Math.sin(G.t*6) > -.2){   // «!» parpadeante: tiene una misión para ti (verde si ya puedes entregarla)
        const x = Math.round(n.x), y = Math.round(n.y - 66 + Math.sin(G.t*3)*1.5), c1 = mk === 'ready' ? '#5aff8a' : '#ffd040', c2 = mk === 'ready' ? '#d0ffe0' : '#fff4b0';
        b.fillStyle = '#121015'; b.fillRect(x-3, y-1, 6, 12); b.fillRect(x-3, y+12, 6, 5);
        b.fillStyle = c1; b.fillRect(x-2, y, 4, 9); b.fillRect(x-2, y+13, 4, 3);
        b.fillStyle = c2; b.fillRect(x-2, y, 1, 9);
      } }});
  }
  if(sc.horse) list.push({y:sc.horse.y, draw:() => { const h = sc.horse; pshadow(h.x, h.y, 22, 4); drawSP(ART.horse[Math.sin(G.t*.9)>.6?1:0], h.x, h.y, h.dir<0); }});
  if(sc.stash) list.push({y:sc.stash.y, draw:() => drawSP(ART.chest.rare[0], sc.stash.x, sc.stash.y)});
  for(const p of sc.portals) if(inView(p.x,p.y)) list.push({y:p.y, draw:() => drawPortal(p)});
  for(const w of sc.wisps || []) if(inView(w.x,w.y)) list.push({y:w.y, draw:() => {
    const x = Math.round(w.x), y = Math.round(w.y - 12 + Math.sin(G.t*2+w.ph)*2);
    b.globalAlpha = .35; b.fillStyle = '#5ae0a0'; b.fillRect(x-2, y-2, 5, 5); b.globalAlpha = 1;
    b.fillStyle = '#b8ffd8'; b.fillRect(x-1, y-1, 3, 3); b.fillStyle = '#ffffff'; b.fillRect(x, y, 1, 1);
    if(Math.random() < .2) G.parts.push({x:x+rand(-2,2), y, vx:rand(-6,6), vy:-10, life:.6, max:.6, size:1, col:'#7af0b8'});
  }});
  for(const f of G.fairies || []) list.push({y:f.y, draw:() => drawFairy(f)});
  for(const l of G.loot) list.push({y:l.y-1, draw:() => drawLoot(l)});
  for(const m of G.mons) if(inView(m.x,m.y)) list.push({y:m.y, draw:() => drawMonster(m)});
  for(const p of G.pets) list.push({y:p.y + (p.z>6 ? 30 : 0), draw:() => drawPet(p)});
  for(const al of G.allies) list.push({y:al.y, draw:() => drawAlly(al)});
  for(const g of G.parts) if(g.ghost) list.push({y:g.y-1, draw:() => drawGhost(g)});
  for(const pr of G.projs) list.push({y:pr.y+10, draw:() => drawProj(pr)});
  for(const r of G.remote || []) list.push({y:r.y, draw:() => drawRemote(r)});
  list.push({y:P.y, draw:() => { if(P.frozenT > 0 && !P.dead){ b.save(); b.filter = 'sepia(1) hue-rotate(170deg) saturate(2.6) brightness(1.2)'; drawHero(); b.restore(); if(Math.random() < .3) G.parts.push({x:P.x + rand(-7, 7), y:P.y - rand(2, 30), vx:0, vy:-10, life:.5, max:.5, size:1.5, col:'#e8faff'}); } else drawHero(); }});
  if(P.flameT > 0 && !P.dead) list.push({y:P.y + 2, draw:drawFlameJet});
  list.sort((a,c) => a.y - c.y);
  for(const o of list) o.draw();
  // partículas
  for(const p of G.parts){
    if(p.ghost) continue;
    const a = clamp(p.life/p.max, 0, 1); b.globalAlpha = a; b.fillStyle = p.col;
    if(p.ring){ pixRing(p.x, p.y, p.size*(1.4-a*.8)*.7, p.size*(1.4-a*.8)*.56, p.col, 14, 2); }
    else if(p.streak){ const n = Math.max(2, Math.round(p.streak.len*a)); for(let q = 0; q < n; q++) b.fillRect(Math.round(p.x + p.streak.x*q*1.4), Math.round(p.y + p.streak.y*q*1.4), 1, 1); }
    else { const s = Math.max(1, Math.round(p.size*(.5+a*.5))); b.fillRect(Math.round(p.x-s/2), Math.round(p.y-s/2), s, s); }
  }
  b.globalAlpha = 1;
  drawLighting(bw, bh);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(buf, 0, 0, bw*PX, bh*PX);
  drawWorldOverlay();
  coopDrawNames();
  drawHUD();
  drawMonsterTip();
}

// ---------- arranque ----------
// carga una ranura (o la vacía si es partida nueva) y entra en la guarida
function startGame(slot, fresh){
  G.slot = slot;
  if(fresh){ try { localStorage.removeItem(slotKey(slot)); } catch(e){} }
  G.save = loadGame(slot);
  refreshPetBonus();
  G.inv.equip = emptyEquip(); G.inv.bag = Array(20).fill(null);
  if(G.save.inv){ G.inv.equip = Object.assign(emptyEquip(), G.save.inv.equip); while(G.inv.equip.pet.length < 4) G.inv.equip.pet.push(null); G.inv.bag = G.save.inv.bag; while(G.inv.bag.length < 20) G.inv.bag.push(null); }
  let lostOnLoad = false;
  let recovered = false;
  if(G.save.inRaid){
    const sn = snapRead(slot);
    if(sn){   // cierre inesperado: se restaura la última copia de la expedición
      G.inv.equip = Object.assign(emptyEquip(), sn.inv.equip); while(G.inv.equip.pet.length < 4) G.inv.equip.pet.push(null);
      G.inv.bag = sn.inv.bag; while(G.inv.bag.length < 20) G.inv.bag.push(null);
      G.save.wallet += sn.gold || 0; G.save.inRaid = false; G.save.shopBought = {}; snapClear(slot); saveGame(); recovered = true;
    } else { dropRaidLoss(); lostOnLoad = true; }
  }   // abandonar o desconectarse en una expedición: se pierde todo, pero las mascotas que ya conocían la guarida quedan como caídas (Chemma las puede resucitar)
  if(!G.save.petRecover){   // una sola vez: devuelve como caídas las mascotas ya conocidas que se perdieron por desconexión
    G.save.petRecover = true;
    const have = new Set(), fl = new Set(G.save.fallen.map(e => e.pet + (e.shiny ? 's' : '')));
    for(const it of allPetStores()) if(it && it.id==='pet') have.add(it.pet + (it.shiny ? 's' : ''));
    let n = 0;
    for(const id in G.save.collection) if(G.save.collection[id] && PETS[id]){
      if(!have.has(id) && !have.has(id+'s') && !fl.has(id) && !fl.has(id+'s')){ G.save.fallen.push({pet:id, shiny:false}); n++; }
      if(G.save.shinies[id] && !have.has(id+'s') && !fl.has(id+'s')){ G.save.fallen.push({pet:id, shiny:true}); n++; }
    }
    if(n){ G.save.druid = true; setTimeout(() => toast(`Chemma puede devolver la vida a ${n} mascota${n>1?'s':''} perdida${n>1?'s':''}`, 5), 1500); }
    saveGame();
  }
  if(UI.invOpen) UI.closeInv(); if(UI.mapOpen) UI.closeRaidMap(); if(UI.skillOpen) UI.closeSkills(); if(UI.trainerOpen) UI.closeTrainer(); if(UI.smithOpen) UI.closeSmith(); if(UI.aishOpen) UI.closeAish(); if(UI.oluafOpen) UI.closeOluaf();
  G.bigMap = false; G.paused = false; G.kills = 0; G.raidGold = 0; G.rescued = 0; G.rescuedNames = [];
  closeMainMenu();
  enterDen();
  TUT.lx = null; TUT.dist = 0; TUT.runT = 0; TUT.gave = false; TUT.invSeen = false; TUT.flash = 0;
  const coopOpen = MENU.coopPending; MENU.coopPending = false; const intro = !G.save.introDone;
  if(intro){ G.save.introDone = true; saveGame(); UI.showIntro(() => { toast('Tutorial: sigue las instrucciones de la pantalla', 3.4); if(coopOpen) LOBBY.openDen(); }); }
  else if(recovered) UI.showScreen('<h1>Partida recuperada</h1><p>El juego se cerró de forma inesperada durante la expedición. Se ha restaurado tu equipo, tu mochila y tus mascotas tal y como estaban hace unos segundos.</p>', 'Continuar');
  else if(lostOnLoad) UI.showScreen('<h1 class="red">Expedición abandonada</h1><p>Abandonaste la última expedición sin volver: perdiste lo que llevabas.</p>', 'Continuar');
  else if(G.save.name) toast('Bienvenido de nuevo, ' + G.save.name, 2.6);
  if(coopOpen && !intro) setTimeout(() => LOBBY.openDen(), 50);
}
openMainMenu();
$('dialog').addEventListener('click', () => { if(UI.dlg && !UI.dlg.waiting) UI.next(); });
let last = performance.now();
function loop(now){
  const dt = Math.min(.05, (now-last)/1000); last = now;
  requestAnimationFrame(loop);
  if(innerWidth !== W || innerHeight !== H) resize();
  if(!W || !H) return;
  if(G.menu){ drawMenu(dt); endInput(); return; }
  update(dt); draw();
  endInput();
}
requestAnimationFrame(loop);

// recargar (F5 / Ctrl+R / cerrar) dentro de una expedición cuenta como abandonarla: avisar antes de perder los objetos
let RELOAD_OK = false;
addEventListener('keydown', e => {
  if(!(e.code === 'F5' || ((e.ctrlKey || e.metaKey) && e.code === 'KeyR'))) return;
  if(!(typeof G !== 'undefined' && G.save && G.save.inRaid)) return;
  e.preventDefault();
  if(confirm('¡Estás dentro de una expedición! Si recargas la página perderás todos los objetos que llevas (equipo, mochila, oro de la expedición y mascotas). Sal primero con el caballo o con un portal. ¿Recargar de todos modos?')){ RELOAD_OK = true; location.reload(); }
}, true);
addEventListener('beforeunload', e => { if(!RELOAD_OK && typeof G !== 'undefined' && G.save && G.save.inRaid){ e.preventDefault(); e.returnValue = ''; } });
