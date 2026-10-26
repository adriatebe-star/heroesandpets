'use strict';
// =====================================================================
//  Datos del juego: objetos, botín, afijos de monstruos y mascotas
// =====================================================================
const RARITY = {
  normal:   {name:'Normal',     col:'#d8d4cc'},
  magic:    {name:'Mágica',     col:'#6aa8ff'},
  rare:     {name:'Rara',       col:'#f2d14b'},
  legendary:{name:'Legendaria', col:'#ff9a3c'},
};

// ---------- Objetos ----------
// gear: puede ser normal, mágico o raro (con afijos). slot: weapon | shield | head | chest | hands | feet
const ITEMS = {
  stone:   {name:'Piedra', icon:'stone', stack:100, slot:'weapon', kind:'throw', ammo:true, value:.5,
            desc:'Arma arrojadiza. Equípala y lánzala con clic izquierdo. Daño 6-9.'},
  stick:   {name:'Palo de madera', icon:'stick', slot:'weapon', kind:'stick', gear:true, dur:40, dmg:[12,18], value:6,
            desc:'Arma cuerpo a cuerpo. Se desgasta con cada golpe y acaba rompiéndose.'},
  sword:   {name:'Espada oxidada', icon:'sword', slot:'weapon', kind:'sword', gear:true, dur:70, dmg:[17,25], value:20,
            desc:'Arma cuerpo a cuerpo de amplio barrido. Se desgasta con cada golpe.'},
  bow:     {name:'Arco viejo', icon:'bow', slot:'weapon', kind:'bow', gear:true, dur:60, dmg:[11,17], value:18,
            desc:'Arma a distancia: dispara flechas con clic izquierdo. Necesitas flechas en la mochila. Se desgasta con cada disparo.'},
  copperlantern:{name:'Farolillo de cobre', icon:'lantern', slot:'lantern', oilMax:100, value:5,
            desc:'Tu farolillo de serie. Guarda hasta 100 de aceite. Se enciende y apaga con E.'},
  silverlantern:{name:'Farolillo de plata', icon:'silverlantern', slot:'lantern', oilMax:125, value:70,
            desc:'Guarda hasta 125 de aceite. Se enciende y apaga con E.'},
  crossbow:{name:'Ballesta', icon:'crossbow', slot:'weapon', kind:'crossbow', gear:true, dur:70, dmg:[26,38], value:34,
            desc:'Arma a distancia: más lenta que el arco pero mucho más potente. Necesita flechas (también las de fuego) en la mochila. Se desgasta con cada disparo.'},
  spear:   {name:'Lanza', icon:'spear', stack:20, slot:'weapon', kind:'spear', ammo:true, dmg:[18,26], value:6,
            desc:'Munición arrojadiza: equípala y lánzala con clic izquierdo. Atraviesa a todos los enemigos que encuentre.'},
  arrows:  {name:'Flechas', icon:'arrows', stack:100, kind:'ammo', value:.3,
            desc:'Munición para el arco. Llévalas en la mochila: cada disparo gasta una.'},
  buckler: {name:'Rodela de madera', icon:'buckler', slot:'shield', gear:true, dur:25, armor:1, value:10,
            desc:'Escudo. Mantén clic derecho para cubrirte: bloquea el 70 % del daño frontal. Se desgasta al bloquear.'},
  helmet:  {name:'Casco de cuero', icon:'helmet', slot:'head', gear:true, armor:2, value:10, desc:'Protección para la cabeza.'},
  chest:   {name:'Pechera de cuero', icon:'chestarmor', slot:'chest', gear:true, armor:4, value:16, desc:'Protección para el torso.'},
  gloves:  {name:'Guantes de cuero', icon:'gloves', slot:'hands', gear:true, armor:1, value:8, desc:'Protección para las manos. Tus puñetazos pegan un poco más.', dmgFist:2},
  boots:   {name:'Botas de cuero', icon:'boots', slot:'feet', gear:true, armor:1, value:8, desc:'Protección para los pies.'},
  potion:  {name:'Poción de vida', icon:'potion', stack:100, use:'heal', value:6, desc:'Tecla 1. Recupera 40 de vida. Enfriamiento de 10 s.'},
  oil:     {name:'Frasco de aceite', icon:'oilflask', stack:100, use:'oil', value:5, desc:'Tecla 3. Recarga 40 de aceite de la linterna.'},
  mushroom:{name:'Seta comestible', icon:'mushroom', stack:100, use:'speed', value:4, desc:'Tecla 5. +30 % de velocidad de movimiento durante 1 minuto.'},
  bandage: {name:'Vendas', icon:'bandage', stack:100, use:'bandage', value:4, desc:'Tecla 2. Regenera 6 de vida por segundo durante 5 s y cura el sangrado.'},
  cookie:  {name:'Galleta de mascota', icon:'cookie', stack:100, use:'cookie', value:5, desc:'Tecla 4. Cura 40 de vida a todas tus mascotas.'},
  superpotion:{name:'Poción de vida superior', icon:'superpotion', stack:100, use:'heal', value:16, desc:'Tecla 1 (se usa cuando no quedan pociones normales). Recupera 100 de vida. Comparte el enfriamiento de 10 s.'},
  chalice: {name:'Cáliz de plata', icon:'chalice', treasure:true, value:60, desc:'Tesoro. Trapis te lo compra.'},
  ring:    {name:'Anillo con gema', icon:'ring', treasure:true, value:90, desc:'Tesoro. Trapis te lo compra.'},
  watch:   {name:'Reloj de bolsillo', icon:'watch', treasure:true, value:75, desc:'Tesoro. Trapis te lo compra.'},
  necklace:{name:'Collar de perlas', icon:'necklace', treasure:true, value:120, desc:'Tesoro. Trapis te lo compra.'},
};
const TREASURES = ['chalice','ring','watch','necklace'];
const SLOT_NAME = {talisman:'Talismán', weapon:'Arma', shield:'Escudo', head:'Casco', chest:'Pechera', hands:'Guantes', feet:'Botas', lantern:'Farolillo'};

// ---------- afijos de objetos (mágicos 1-2, raros 3-4) ----------
const ITEM_AFFIX = {
  dmg:    {sfx:'del Verdugo',     roll:[2,6],   slots:['weapon'],                        desc:v=>`+${v} de daño`},
  aspd:   {sfx:'del Viento',      roll:[6,15],  slots:['weapon','hands'],                desc:v=>`+${v} % de velocidad de ataque`},
  crit:   {sfx:'del Halcón',      roll:[3,8],   slots:['weapon','hands','head'],         desc:v=>`+${v} % de probabilidad de crítico`},
  leech:  {sfx:'del Vampiro',     roll:[2,5],   slots:['weapon','hands'],                desc:v=>`Roba el ${v} % del daño como vida`},
  hp:     {sfx:'del Oso',         roll:[8,20],  slots:['chest','head','feet','hands','shield'], desc:v=>`+${v} de vida máxima`},
  armor:  {sfx:'de la Tortuga',   roll:[1,4],   slots:['chest','head','feet','hands','shield'], desc:v=>`+${v} de armadura`},
  stam:   {sfx:'del Buey',        roll:[8,20],  slots:['chest','feet'],                  desc:v=>`+${v} de estamina máxima`},
  sreg:   {sfx:'del Ciervo',      roll:[8,20],  slots:['chest','head','hands'],          desc:v=>`+${v} % de regeneración de estamina`},
  move:   {sfx:'de la Liebre',    roll:[5,35],  skew:4, slots:['feet'],                          desc:v=>`+${v} % de velocidad de movimiento`},
  gold:   {sfx:'del Avaro',       roll:[8,20],  slots:['head','hands','feet'],           desc:v=>`+${v} % de oro encontrado`},
  oil:    {sfx:'de la Luciérnaga',roll:[8,20],  slots:['head','chest'],                  desc:v=>`-${v} % de consumo de aceite`},
  petdmg: {sfx:'del Pastor',      roll:[8,20],  slots:['head','hands','chest'],          desc:v=>`+${v} % de daño de tus mascotas`},
  thorns: {sfx:'del Erizo',       roll:[2,5],   slots:['chest','shield'],                desc:v=>`Devuelve ${v} de daño a quien te golpea`},
  dur:    {sfx:'del Herrero',     roll:[25,60], slots:['weapon','shield'],               desc:v=>`+${v} % de durabilidad`},
  // ---- afijos de la expedición 5 en adelante (roll2 = segundo valor; kinds = solo para esas armas; chance = rareza del afijo)
  firedmg:{sfx:'de las Brasas',   roll:[4,10],  roll2:[10,30], stat:'fireDmg', stat2:'fireCh', minLvl:5, slots:['weapon'], desc:(v,w='{w}')=>`+${v} de daño de fuego (${w} % de probabilidad de quemar)`},
  litdmg: {sfx:'de la Tormenta',  roll:[4,10],  roll2:[10,25], stat:'litDmg',  stat2:'litCh',  minLvl:5, slots:['weapon'], desc:(v,w='{w}')=>`+${v} de daño de rayo (${w} % de probabilidad de debilitar)`},
  icedmg: {sfx:'de la Escarcha',  roll:[4,10],  roll2:[8,20],  stat:'iceDmg',  stat2:'iceCh',  minLvl:5, slots:['weapon'], desc:(v,w='{w}')=>`+${v} de daño de hielo (${w} % de probabilidad de congelar)`},
  bleed:  {sfx:'del Desollador',  roll:[10,30], roll2:[3,8],   stat:'bleedCh', stat2:'bleedDur', minLvl:5, slots:['weapon'], desc:(v,w='{w}')=>`${v} % de probabilidad de causar sangrado (durante ${w} s)`},
  poison: {sfx:'de la Víbora',    roll:[10,30], roll2:[3,8],   stat:'poisonCh', stat2:'poisonDur', minLvl:5, kinds:['bow','crossbow'], slots:['weapon'], desc:(v,w='{w}')=>`${v} % de probabilidad de envenenar (durante ${w} s)`},
  multi:  {sfx:'de la Ráfaga',    roll:[5,12],  stat:'multiCh',  minLvl:5, kinds:['bow','crossbow'], chance:.2, slots:['weapon'], desc:v=>`${v} % de probabilidad de disparar un proyectil adicional`},
  pierce: {sfx:'del Perforador',  roll:[10,30], stat:'pierceCh', minLvl:5, kinds:['bow','crossbow'], slots:['weapon'], desc:v=>`${v} % de probabilidad de atravesar enemigos`},
  bounce: {sfx:'del Rebote',      roll:[10,30], stat:'bounceCh', minLvl:5, kinds:['bow','crossbow'], slots:['weapon'], desc:v=>`${v} % de probabilidad de que el proyectil rebote en otro enemigo`},
  flamearea:{sfx:'del Dragón',    roll:[15,40], stat:'flameArea', minLvl:5, kinds:['flamethrower'], slots:['weapon'], desc:v=>`+${v} % de área y distancia de la llamarada`},
  flameoil: {sfx:'del Ahorro',    roll:[15,40], stat:'flameOil',  minLvl:5, kinds:['flamethrower'], slots:['weapon'], desc:v=>`-${v} % de aceite consumido por disparo`},
  // ---- afijos de armadura (casco, pechera, guantes y botas) desde la expedición 5
  eleres:   {sfx:'del Aislante',      roll:[5,15],  stat:'eleRes',   minLvl:5, slots:['chest','head','hands','feet','shield'], desc:v=>`-${v} % de daño recibido de frío, fuego y rayo`},
  armorplus:{sfx:'del Bastión',       roll:[3,6],   stat:'armor',    minLvl:5, slots:['chest','head','hands','feet','shield'], desc:v=>`+${v} de armadura adicional`},
  poisres:  {sfx:'del Antídoto',      roll:[10,30], stat:'poisRes',  minLvl:5, slots:['chest','head','hands','feet','shield'], desc:v=>`-${v} % de daño por veneno`},
  bleedres: {sfx:'del Coagulante',    roll:[10,30], stat:'bleedRes', minLvl:5, slots:['chest','head','hands','feet','shield'], desc:v=>`-${v} % de daño por sangrado`},
  hpregen:  {sfx:'de la Regeneración',roll:[1,3],   stat:'hpreg',    minLvl:5, slots:['chest','head','hands','feet','shield'], desc:v=>`+${v} de vida por segundo`},
};
const RARE_ITEM_NAMES = ['Muerdehuesos','Sombraluz','Rompenoches','Ojo de Cuervo','Lágrima Gris','Colmillo Viejo','Susurro Helado',
                         'Paso Ligero','Canto Fúnebre','Raíz Antigua','Velo de Ceniza','Hueso de Luna','Ascua Fría','Último Aliento'];
// tirada de rareza del equipo según el nivel de la expedición y el origen del botín
function rollRarity(lvl=1, bonus=0){
  if(typeof MS === 'function' && MS('exp', 26)) bonus += .33;   // Suerte del buscador: +5 % de objetos mágicos o raros   // más mágicos y raros según el nivel de la expedición, con tope (siempre queda un 15 % de normales)
  const r = Math.random(), rare = Math.min(.22, .04 + lvl*.012 + bonus*.06), magic = Math.min(.85 - rare, .22 + lvl*.03 + bonus*.15);
  return r < rare ? 'rare' : r < rare + magic ? 'magic' : 'normal';
}
// tirada de un afijo; con `skew` los valores altos son muy raros (p. ej. 35 % de movimiento en botas ≈ 0,4 %)
function rollAffix(a){ return a.skew ? Math.round(a.roll[0] + (a.roll[1]-a.roll[0])*Math.pow(Math.random(), a.skew)) : randi(a.roll[0], a.roll[1]); }
// afijos que puede llevar aún un objeto: de su hueco y tipo de arma, de su nivel y sin repetir ninguno que ya tenga
const affixPool = (it, d, lvl) => Object.keys(ITEM_AFFIX).filter(k => { const a = ITEM_AFFIX[k]; return a.slots.includes(d.slot) && !(it.affixes || []).some(x => x.k === k) && (!a.minLvl || lvl >= a.minLvl) && (!a.kinds || a.kinds.includes(d.kind)); });
const mkAffix = k => { const a = ITEM_AFFIX[k], o = {k, v:rollAffix(a)}; if(a.roll2) o.w = randi(a.roll2[0], a.roll2[1]); return o; };
function mkGear(id, rarity='normal', lvl=1){
  const d = ITEMS[id], it = {id, rarity, affixes:[]};
  if(d.unique){ it.rarity = 'legendary';   // los únicos de jefe son legendarios (solo cambia quién los suelta)
    it.affixes = (d.fixed || []).map(a => ({...a})); }
  else if(rarity !== 'normal'){
    const n = rarity==='magic' ? randi(1,2) : randi(3,4);
    const pool = shuffle(affixPool(it, d, lvl).filter(k => Math.random() < (ITEM_AFFIX[k].chance ?? 1)));
    for(const k of pool.slice(0, n)) it.affixes.push(mkAffix(k));
    if(!it.affixes.length) it.rarity = 'normal';
    else it.name = rarity==='magic' ? `${d.name} ${ITEM_AFFIX[it.affixes[0].k].sfx}` : pick(RARE_ITEM_NAMES);
  }
  if(d.dur){
    const bonus = it.affixes.find(a => a.k==='dur');
    it.maxDur = Math.round(d.dur * (1 + (bonus ? bonus.v/100 : 0))); it.dur = it.maxDur;
  }
  return it;
}
// instancia de objeto
function mkItem(id, n=1, lvl, bonus=0){
  if(!lvl) lvl = (typeof G !== 'undefined' && G.sc && G.sc.lvl) || 1;   // sin nivel explícito, el de la expedición en curso
  if(id==='treasure') id = rollTreasure();   // los tesoros especiales de orcos y elfos salen en sus zonas (treasure.js)
  const d = ITEMS[id];
  if(d.gear) return mkGear(id, d.unique ? 'unique' : rollRarity(lvl, bonus), lvl);
  const it = {id};
  if(d.legend){ it.rarity = 'legendary'; it.affixes = (d.fixed || []).map(a => ({...a})); }   // talismán / farolillo legendario
  if(d.stack) it.n = Math.min(n, d.stack);
  if(d.dur) it.dur = it.maxDur = d.dur;
  return it;
}
const maxDur = it => it.maxDur || ITEMS[it.id].dur;
const affixVal = (it, k) => (it && it.affixes ? it.affixes.filter(a => a.k===k).reduce((s,a)=>s+a.v, 0) : 0);
// homed: la mascota ya ha llegado alguna vez a la guarida (requisito para que el druida la reviva)
// vida máxima real de una mascota: base × shiny (+10 %) × bonos del adiestrador
// multiplicador de estadísticas de una mascota: brillante (+10 %) y suero de supermascota (+20 %)
const petMult = it => (it.shiny ? 1.1 : 1) * (it.serums && it.serums.super ? 1.2 : 1);
const petDmgMult = it => petMult(it) * (it.serums && it.serums.rage ? 1.33 : 1);   // el suero de rabia sube solo el daño
const petMaxHp = it => Math.round(PETS[it.pet].hp * petMult(it) * (1 + PETS[it.pet].affixes.concat(it.xaff || []).reduce((s, a) => s + ((PET_AFFIX[a] && PET_AFFIX[a].fx && PET_AFFIX[a].fx.hp) || 0), 0)/100) * (1 + (((typeof G !== 'undefined' && G.pt) ? (G.pt.petHp||0) + (G.pt.petAll||0) : 0))/100));
function mkPetItem(petId, homed=false, shiny=false){ const it = {id:'pet', pet:petId, hp:0, homed, shiny}; it.hp = petMaxHp(it); return it; }
// daño base de un arma con el afilado (+1 por cada afilado en el yunque)
const weaponDmg = it => { const d = ITEMS[it.id] && ITEMS[it.id].dmg; if(!d) return null; const s = it.sharp || 0; return [d[0] + s, d[1] + s]; };
function itemName(it){ return it.id==='pet' ? (it.shiny ? '★ ' : '') + PETS[it.pet].name : (it.name || ITEMS[it.id].name); }
const RAR_COL = {normal:'#f4f0e8', magic:'#6aa8ff', rare:'#f2d14b', pink:'#ff8ac8'};
// consumible: todo lo que no es equipo, gema, tesoro, llave, objeto de misión, legendario ni talismán (incluye la munición)
const isConsumable = d => !!d && !d.gear && (!d.slot || d.ammo) && !d.gem && !d.treasure && !d.key && !d.quest && !d.legend && !d.unique && d.slot !== 'talisman';
function itemColor(it){
  if(it.id==='pet') return RARITY[PETS[it.pet].rarity].col;
  if(ITEMS[it.id].treasure) return '#e8c070';
  if(ITEMS[it.id].quest) return RAR_COL.quest;
  if(isConsumable(ITEMS[it.id])) return RAR_COL.pink;   // todos los consumibles son rosas (ya no hay colores por tipo)
  if(it.rarity && it.rarity!=='normal') return RARITY[it.rarity].col;
  return '#e8e2d4';
}

// ---------- Botín (acumulativo: cada expedición incluye el botín de las anteriores) ----------
// lvl: expedición mínima en la que aparece esa entrada
const LOOT = {
  chestNormal: {rolls:[2,3], table:[
    {w:28, id:'stone', n:[3,6]}, {w:12, id:'stick'}, {w:9, id:'buckler'}, {w:18, id:'potion', n:[1,2]},
    {w:14, id:'oil'}, {w:12, id:'mushroom'}, {w:30, id:'gold', n:[5,20]}, {w:7, id:'treasure'},
    {w:7, id:'sword', lvl:2}, {w:6, id:'bow', lvl:2}, {w:6, id:'helmet', lvl:2}, {w:5, id:'chest', lvl:2},
    {w:6, id:'gloves', lvl:2}, {w:6, id:'boots', lvl:2}, {w:8, id:'gold', n:[10,30], lvl:2}, {w:12, id:'arrows', n:[10,25], lvl:2},
    {w:2, id:'silverlantern', lvl:3}, {w:5, id:'crossbow', lvl:4}, {w:18, id:'spear', n:[3,6], lvl:4},
    {w:5, id:'ironshield', lvl:3}, {w:10, id:'firearrows', n:[8,20], lvl:3}, {w:5, id:'mace', lvl:3}, {w:5, id:'axe', lvl:3}, {w:6, id:'dagger', lvl:3}, {w:8, id:'gold', n:[20,50], lvl:3},
    {w:14, id:'bandage', n:[1,3]}, {w:10, id:'cookie', n:[1,2]},
    {w:3, id:'flamethrower', lvl:6}, {w:10, id:'explosivearrows', n:[6,15], lvl:6}, {w:10, id:'gold', n:[60,120], lvl:6},
    {w:4, id:'greataxe', lvl:5}, {w:.4, id:'firesword', lvl:5}, {w:.4, id:'icesword', lvl:5}, {w:.4, id:'lightningsword', lvl:5}, {w:8, id:'superpotion', lvl:5}, {w:10, id:'gold', n:[40,90], lvl:5},
  ]},
  chestRare: {rolls:[3,4], always:'treasure', table:[
    {w:18, id:'stone', n:[5,10]}, {w:14, id:'stick'}, {w:14, id:'buckler'}, {w:20, id:'potion', n:[1,3]},
    {w:16, id:'oil', n:[1,2]}, {w:12, id:'mushroom', n:[1,2]}, {w:30, id:'gold', n:[20,60]}, {w:20, id:'treasure'},
    {w:12, id:'sword', lvl:2}, {w:10, id:'bow', lvl:2}, {w:10, id:'helmet', lvl:2}, {w:9, id:'chest', lvl:2},
    {w:10, id:'gloves', lvl:2}, {w:10, id:'boots', lvl:2}, {w:10, id:'gold', n:[30,80], lvl:2}, {w:14, id:'arrows', n:[20,40], lvl:2},
    {w:5, id:'silverlantern', lvl:3}, {w:9, id:'crossbow', lvl:4}, {w:30, id:'spear', n:[5,10], lvl:4},
    {w:9, id:'ironshield', lvl:3}, {w:14, id:'firearrows', n:[15,35], lvl:3}, {w:9, id:'mace', lvl:3}, {w:9, id:'axe', lvl:3}, {w:10, id:'dagger', lvl:3}, {w:10, id:'gold', n:[50,120], lvl:3},
    {w:18, id:'bandage', n:[2,4]}, {w:14, id:'cookie', n:[1,3]},
    {w:6, id:'flamethrower', lvl:6}, {w:14, id:'explosivearrows', n:[12,30], lvl:6}, {w:10, id:'gold', n:[100,220], lvl:6},
    {w:8, id:'greataxe', lvl:5}, {w:.8, id:'firesword', lvl:5}, {w:.8, id:'icesword', lvl:5}, {w:.8, id:'lightningsword', lvl:5}, {w:12, id:'superpotion', n:[1,2], lvl:5}, {w:10, id:'gold', n:[80,180], lvl:5},
  ]},
  monster: {
    normal:{item:.07, gold:.45, goldN:[1,4]},
    magic: {item:.30, gold:.8,  goldN:[4,12]},
    rare:  {item:1,   gold:1,   goldN:[12,30], treasure:.35},
    boss:  {item:1,   gold:1,   goldN:[180,300], treasure:1},
  },
  monsterTable: [
    {w:30, id:'stone', n:[2,4]}, {w:10, id:'stick'}, {w:6, id:'buckler'}, {w:30, id:'potion'}, {w:18, id:'oil'}, {w:16, id:'mushroom'},
    {w:6, id:'sword', lvl:2}, {w:5, id:'bow', lvl:2}, {w:5, id:'helmet', lvl:2}, {w:4, id:'chest', lvl:2}, {w:5, id:'gloves', lvl:2}, {w:5, id:'boots', lvl:2},
    {w:14, id:'arrows', n:[6,15], lvl:2},
    {w:1.5, id:'silverlantern', lvl:3}, {w:4, id:'crossbow', lvl:4}, {w:18, id:'spear', n:[2,4], lvl:4},
    {w:4, id:'ironshield', lvl:3}, {w:10, id:'firearrows', n:[5,12], lvl:3}, {w:4, id:'mace', lvl:3}, {w:4, id:'axe', lvl:3}, {w:5, id:'dagger', lvl:3},
    {w:16, id:'bandage'}, {w:10, id:'cookie'},
    {w:2, id:'flamethrower', lvl:6}, {w:6, id:'explosivearrows', n:[3,8], lvl:6},
    {w:3, id:'greataxe', lvl:5}, {w:.25, id:'firesword', lvl:5}, {w:.25, id:'icesword', lvl:5}, {w:.25, id:'lightningsword', lvl:5}, {w:5, id:'superpotion', lvl:5},
  ],
};
const lootFor = (table, lvl) => table.filter(e => (e.lvl||1) <= lvl && (!e.only || (typeof G !== 'undefined' && G.sc && G.sc.id === e.only)));   // only: botín exclusivo de un mapa

// ---------- Trapis, el mercader (compra tesoros y vende objetos) ----------
// tier: expedición que tienes que haber superado (volver con vida) para que Trapis lo venda
const SHOP = [
  {id:'potion',   n:1,  price:20, tier:1},
  {id:'oil',      n:1,  price:18, tier:1},
  {id:'mushroom', n:1,  price:15, tier:1},
  {id:'bandage',  n:1,  price:12, tier:1},
  {id:'cookie',   n:1,  price:15, tier:1},
  {id:'superpotion', n:1, price:55, tier:5},
  {id:'flamethrower', n:1, price:220, tier:6},
  {id:'explosivearrows', n:20, price:70, tier:6},
  {id:'greataxe', n:1,  price:160, tier:5},
  {id:'firesword', n:1, price:150, tier:5},
  {id:'icesword', n:1,  price:150, tier:5},
  {id:'lightningsword', n:1, price:150, tier:5},
  {id:'stone',    n:10, price:10, tier:1},
  {id:'arrows',   n:20, price:12, tier:1},
  {id:'stick',    n:1,  price:25, tier:1},
  {id:'buckler',  n:1,  price:40, tier:1},
  {id:'sword',    n:1,  price:80, tier:2},
  {id:'bow',      n:1,  price:70, tier:2},
  {id:'helmet',   n:1,  price:45, tier:2},
  {id:'chest',    n:1,  price:70, tier:2},
  {id:'gloves',   n:1,  price:35, tier:2},
  {id:'boots',    n:1,  price:35, tier:2},
  {id:'firearrows', n:20, price:28, tier:3},
  {id:'dagger',   n:1,  price:70, tier:3},
  {id:'axe',      n:1,  price:100, tier:3},
  {id:'mace',     n:1,  price:110, tier:3},
  {id:'ironshield', n:1, price:95, tier:3},
  {id:'silverlantern', n:1, price:150, tier:3},
  {id:'crossbow', n:1, price:130, tier:4},
  {id:'spear',    n:5, price:40, tier:4},
];
const RARITY_PRICE = {normal:1, magic:2.6, rare:6, unique:4};
// valor de venta de un objeto (Trapis lo compra todo, mascotas incluidas)
const PET_SELL = {normal:30, magic:80, rare:180, legendary:450};
function sellValue(it){
  if(!it) return 0;
  if(it.id==='pet') return Math.round(PET_SELL[PETS[it.pet].rarity] * (it.shiny ? 3 : 1));
  const d = ITEMS[it.id];
  if(d.quest) return 0;   // los objetos de misión no se pueden vender
  if(d.treasure) return d.value;
  let v = (d.value || 1) * (it.n || 1);
  if(d.gear) v *= RARITY_PRICE[it.rarity || 'normal'] * (1 + (it.affixes||[]).length*.15);
  if(it.dur !== undefined && d.dur) v *= .1 + .9*Math.max(0, it.dur)/(it.maxDur || d.dur);   // cuanto más gastado, menos paga Trapis
  return Math.max(1, Math.round(v));
}
// ---------- Chemma el druida (revive mascotas caídas) ----------
const REVIVE_COST = {normal:50, magic:120, rare:250, legendary:500};

// ---------- Monstruos ----------
// ai: hop (slimes saltarines) · walk (andan y golpean con aviso) · float (flotan y atraviesan muros)
const MONSTERS = {
  slime:    {name:'Slime',        art:'small',    ai:'hop',   hp:30, dmg:7,  spd:75, r:11, xp:5,  reach:4,  prep:.32},
  bigslime: {name:'Slime grande', art:'big',      ai:'hop',   hp:70, dmg:13,  spd:52, r:16, xp:10, reach:4,  prep:.32},
  skeleton: {name:'Esqueleto',    art:'skeleton', ai:'walk',  hp:48, dmg:13,  spd:68, r:8,  xp:9,  reach:14, prep:.45},
  zombie:   {name:'Zombi',        art:'zombie',   ai:'walk',  hp:95, dmg:15, spd:36, r:9,  xp:12, reach:10, prep:.55, slowHit:true},
  ghost:    {name:'Fantasma',     art:'ghost',    ai:'float', hp:36, dmg:10, spd:80, r:8,  xp:10, reach:6,  prep:.35},
  wolfp:    {name:'Lobo poseído', art:'wolfp', ai:'walk', plains:true, hp:62, dmg:17, spd:98, r:9, xp:20, reach:10, prep:.3, eye:[11,-15]},
  boarp:    {name:'Jabalí poseído', art:'boarp', ai:'walk', plains:true, hp:100, dmg:21, spd:72, r:10, xp:24, reach:10, prep:.4, eye:[10,-9]},
  bisonp:   {name:'Bisonte poseído', art:'bisonp', ai:'walk', plains:true, hp:230, dmg:30, spd:42, r:14, xp:44, reach:14, prep:.6, eye:[15,-13]},
  vulturep: {name:'Buitre poseído', art:'vulturep', ai:'float', plains:true, hp:46, dmg:15, spd:105, r:9, xp:20, reach:6, prep:.3, eye:[7,-15]},
  snakep:   {name:'Serpiente poseída', art:'snakep', ai:'walk', plains:true, hp:34, dmg:12, spd:88, r:7, xp:18, reach:8, prep:.3, poisonHit:true, eye:[13,-7]},
  spitp:    {name:'Víbora escupidora', art:'snakep', ai:'archer', plains:true, hp:30, dmg:14, spd:72, r:7, xp:26, reach:0, prep:.5, range:[110,180], spit:true, eye:[13,-7]},
  venomwolf:{name:'Lobo ponzoñoso', art:'wolfp', ai:'walk', plains:true, hp:70, dmg:18, spd:104, r:9, xp:28, reach:10, prep:.3, poisonHit:true, eye:[11,-15]},
  orc:      {name:'Orco', art:'orc', ai:'walk', hp:130, dmg:24, spd:66, r:10, xp:34, reach:16, prep:.45, bleedHit:true},
  orcarcher:{name:'Orco arquero', art:'orcarcher', ai:'archer', hp:80, dmg:20, spd:62, r:9, xp:30, reach:0, prep:.55, range:[120,200]},
  orcshaman:{name:'Chamán orco', art:'orcshaman', ai:'caster', hp:90, dmg:22, spd:52, r:9, xp:40, reach:0, prep:.7, range:[140,220]},
  orcbrute: {name:'Bruto orco', art:'orcbrute', ai:'walk', hp:340, dmg:40, spd:44, r:14, xp:75, reach:22, prep:.65, bleedHit:true},
  urr:      {name:'Urr, el gran jefe orco', art:'urr', ai:'urr', hp:4160, dmg:72, spd:58, r:20, xp:600, reach:20, prep:.6, boss:true, uniques:['urrhelm','urraxe','urrwall','urrboots']},
  skelmage:  {name:'Mago esqueleto', art:'skelmage', ai:'caster', hp:42, dmg:15, spd:55, r:8, xp:18, reach:0, prep:.7, range:[140,210]},
  wraith:    {name:'Espectro', art:'wraith', ai:'float', hp:58, dmg:14, spd:118, r:9, xp:18, reach:6, prep:.28, drain:true},
  necro:     {name:'Nigromante', art:'necro', ai:'summoner', hp:64, dmg:12, spd:50, r:8, xp:24, reach:0, prep:.8, range:[150,230]},
  skelknight:{name:'Caballero esqueleto', art:'skelknight', ai:'walk', hp:135, dmg:21, spd:44, r:10, xp:26, reach:16, prep:.6, guard:true},
  countess:  {name:'La Condesa fantasma', art:'countess', ai:'boss', hp:1500, dmg:22, spd:70, r:18, xp:500, reach:10, prep:.4, boss:true, uniques:['countessveil','spectralclaw','nightaegis','countesslament']},
  skelarcher:{name:'Esqueleto arquero', art:'skelarcher', ai:'archer', hp:34, dmg:11, spd:60, r:8, xp:12, reach:0, prep:.6, range:[110,190]},
};
for(const t of ['orc','orcarcher','orcshaman','orcbrute']) MONSTERS[t].orc = true;   // en el castillo de Urr los orcos son más duros
const MON_RARITY = {
  normal:{affixes:1, hp:1,   dmg:1,   xp:1,   scale:1},
  magic: {affixes:2, hp:1.8, dmg:1.25,xp:2.5, scale:1.08},
  rare:  {affixes:4, hp:3,   dmg:1.45,xp:6,   scale:1.25},
  boss:  {affixes:0, hp:1,   dmg:1,   xp:1,   scale:1},
};

// ---------- Expediciones ----------
const EXPEDITIONS = [
  {id:'village',  lvl:1, name:'El pueblo abandonado', mapX:0.24, mapY:0.73,
   desc:'Casas en ruinas, caminos de tierra y slimes por todas partes. Un buen lugar para empezar.',
   monsters:'Slimes'},
  {id:'cemetery', lvl:2, name:'El cementerio', mapX:0.4, mapY:0.6,
   desc:'Tumbas, criptas y una capilla en ruinas. Los muertos no descansan desde que llegó la noche.',
   monsters:'Esqueletos, zombis, fantasmas y slimes'},
  {id:'crypt', lvl:3, name:'La cripta de la condesa', mapX:0.62, mapY:0.7, boss:'countess',
   desc:'Bajo la vieja mansión duerme la Condesa fantasma, rodeada de su séquito de no-muertos. Su tesoro guarda objetos que no existen en ningún otro lugar.',
   monsters:'Magos esqueleto, espectros, nigromantes, caballeros esqueleto... y la Condesa fantasma'},
  {id:'plains', lvl:4, name:'Las planicies salvajes', mapX:0.61, mapY:0.3,
   desc:'Llanuras sin fin bajo la noche eterna. Los animales que las habitaban vagan poseídos, con los ojos rojos, y no perdonan a nadie.',
   monsters:'Lobos, lobos ponzoñosos, jabalíes, bisontes, buitres, serpientes y víboras escupidoras poseídos (mucho más rápidos y fuertes)'},
  {id:'orccamp', lvl:5, name:'El campamento orco', mapX:0.4, mapY:0.2,
   desc:'Una horda orca ha levantado su campamento sobre las cenizas. En el centro, tras una empalizada, guardan a las mascotas capturadas junto a sus mejores tesoros de guerra.',
   monsters:'Orcos (sus hachas provocan sangrado), arqueros orcos, chamanes orcos y brutos orcos'},
  {id:'castle', lvl:6, name:'El castillo de Urr', mapX:0.23, mapY:0.17, boss:'urr',
   desc:'La fortaleza del gran jefe orco: un laberinto de pasillos de piedra lleno de trampas (pinchos, llamas y dardos) y de la guardia de élite de Urr. Su trono está al fondo.',
   monsters:'Orcos de élite, arqueros, chamanes y brutos orcos, trampas... y Urr, el gran jefe orco'},
  {id:'river', lvl:7, name:'El río travieso', mapX:0.16, mapY:0.37,
   desc:'Una franja rocosa que sigue el curso de un río bravo, de un extremo al otro. Trols que arrojan peñascos, cangrejos en la orilla, osos hambrientos y elfos oscuros emboscados con dardos que inmovilizan. Los elfos guardan armas y armaduras que no se ven en ningún otro lugar.',
   monsters:'Trols de río (lanzan rocas), cangrejos, osos hambrientos, elfos oscuros ladrones (dardos inmovilizadores) y elfos oscuros arqueros'},
  {id:'forest', from:'river', lvl:8, petExp:'8b', name:'El bosque élfico', mapX:0.06, mapY:0.23,
   desc:'Un bosque denso y oscuro al norte del río, cuyos elfos oscuros están poseídos por el Señor de la Noche y custodian lobos, arañas y panteras también poseídos. Los elfos llevan todo el equipo élfico, incluida la llave de la mina.',
   monsters:'Elfos oscuros arqueros, ladrones y guerreros con lanza, y lobos, arañas y panteras poseídos'},
  {id:'mine', from:'river', lvl:8, name:'La mina de los enanos', mapX:0.09, mapY:0.54, needKey:true,
   desc:'Galerías abandonadas bajo la montaña: túneles estrechos con una bifurcación que se rodea por la izquierda o por la derecha y una cámara del tesoro al fondo. Solo se entra con una llave de la mina (se gasta una cada vez). Aquí se encuentran las gemas.',
   monsters:'Goblins muy rápidos (con daga o arco), diablillos de fuego que escupen llamas y hombres rata'},
  {id:'temple', from:'forest', lvl:9, name:'El templo sagrado', mapX:0.12, mapY:0.02, boss:'elfmage', petExp:9,
   desc:'Un santuario antiguo al norte del bosque élfico, ahora en manos de los elfos corrompidos. Una avenida de columnas lleva hasta la plaza sagrada, donde el brujo élfico lanza rayos que debilitan y descargas que hay que esquivar muy deprisa.',
   monsters:'Arqueros élficos de flechas de fuego, magos élficos eléctricos y guerreros élficos pesados de espadón a dos manos... y el brujo élfico'},
  {id:'icepeak', from:'temple', lvl:10, name:'El ascenso gélido', mapX:0.3, mapY:0.02, boss:'northguard',
   desc:'Una subida interminable por una montaña nevada donde el suelo helado hace resbalar. Los fantasmas guardan la llave del tiempo, una nórdica jugona busca con quién jugar y, al final del ascenso, el guardián de la puerta del norte impide el paso.',
   monsters:'Yetis que aturden, soldados fantasmales, arqueros fantasmales de flechas que congelan, trols de las nieves gigantes que lanzan bolas de nieve... y el guardián de la puerta del norte'},
  {id:'floatcity', from:'icepeak', lvl:11, name:'La ciudad flotante', mapX:0.52, mapY:0.06,
   desc:'Una ciudad de madera que flota sobre el lago del norte: casitas y cabañas grandes unidas por puentes. Los hombres pez y las sirenas defienden sus muelles.',
   monsters:'Hombres pez arponeros, hombres pez de tridentes eléctricos, sirenas hechiceras cuyo canto te atrae hacia ellas y hombres pez magos de burbujas que congelan'},
  {id:'timehall', from:'icepeak', lvl:10, hall:true, name:'La sala del tiempo', mapX:0.23, mapY:-0.16,
   desc:'Una guarida oscura más allá del ascenso gélido donde vive Rolecs, señor del tiempo. Llévale una llave del tiempo.'},
];
// afijos de monstruo (los efectos se aplican en actors.js)
const MON_AFFIX = {
  rapido:     {name:'Rápido',      desc:'+40 % de velocidad de movimiento'},
  robusto:    {name:'Robusto',     desc:'+60 % de vida'},
  furioso:    {name:'Furioso',     desc:'Por debajo del 50 % de vida: +50 % de daño y más velocidad'},
  divisor:    {name:'Divisor',     desc:'Al morir se divide en 2 versiones pequeñas'},
  explosivo:  {name:'Explosivo',   desc:'Al morir explota tras 1 segundo'},
  venenoso:   {name:'Venenoso',    desc:'Deja charcos que envenenan'},
  regenerador:{name:'Regenerador', desc:'Se cura un 3 %/s si no recibe daño en 3 s'},
  vampirico:  {name:'Vampírico',   desc:'Se cura el 50 % del daño que hace'},
  escudado:   {name:'Escudado',    desc:'Escudo que absorbe un 30 % de su vida'},
  sombrio:    {name:'Sombrío',     desc:'Invisible fuera de la luz'},
  apagaluces: {name:'Apagaluces',  desc:'Cada golpe te quita 5 de aceite'},
  gelido:     {name:'Gélido',      desc:'Sus golpes te ralentizan un 30 % durante 2 s'},
  pesado:     {name:'Pesado',      desc:'No se le puede empujar y empuja más fuerte'},
  espinoso:   {name:'Espinoso',    desc:'Devuelve el 20 % del daño cuerpo a cuerpo'},
  saltador:   {name:'Saltador',    desc:'Salta sobre ti y daña en área al caer'},
  agotador:   {name:'Agotador',    desc:'Sus golpes te quitan estamina'},
  ladron:     {name:'Ladrón',      desc:'Te roba monedas y huye; las suelta al morir'},
  invocador:  {name:'Invocador',   desc:'Invoca 2 esbirros cada 8 s'},
};
const RARE_NAMES = [['Gelatina','Babaza','Masa','Charca','Ponzoña','Pringue'],
                    ['Funesta','Hambrienta','Maldita','Nocturna','Insaciable','del Pozo','de la Ciénaga']];

// ---------- Mascotas ----------
const PET_AFFIX = {
  feroz:       {name:'Feroz',        desc:'+25 % de daño'},
  veloz:       {name:'Veloz',        desc:'+25 % de velocidad de ataque'},
  robusta:     {name:'Robusta',      desc:'+40 % de vida'},
  agil:        {name:'Ágil',         desc:'20 % de probabilidad de esquivar'},
  guardiana:   {name:'Guardiana',    desc:'Absorbe el 10 % del daño que recibe el héroe'},
  vampirica:   {name:'Vampírica',    desc:'Cada golpe cura 1 de vida al héroe'},
  venenosa:    {name:'Venenosa',     desc:'Sus golpes envenenan'},
  helada:      {name:'Helada',       desc:'Sus golpes ralentizan'},
  inspiradora: {name:'Inspiradora',  desc:'+15 % de regeneración de estamina del héroe'},
  rastreador:  {name:'Rastreador', desc:'Detecta las jaulas desde mucho más lejos (también en el mapa)'},
  olfato:      {name:'Olfato',       desc:'Marca los cofres cercanos'},
  buscatesoros:{name:'Buscatesoros', desc:'+15 % de oro y +5 % de probabilidad de tesoro'},
  avariciosa:  {name:'Avariciosa',   desc:'Recoge sola las monedas cercanas'},
  luciernaga:  {name:'Luciérnaga',   desc:'Desprende luz y la linterna gasta un 20 % menos'},
  valiente:    {name:'Valiente',     desc:'+40 % de daño contra mágicos y raros'},
  espinosa:    {name:'Espinosa',     desc:'Devuelve el 20 % del daño que recibe'},
  alba:        {name:'Luz del alba', desc:'Aura de luz propia; +10 % de daño del héroe dentro de ella'},
};
const PET_HP = {normal:156, magic:215, rare:332, legendary:429};   // +30 % de vida a todas las mascotas (petición del usuario)
   // vida duplicada y luego +50 % (petición del usuario)
const PETS = {
  bigotes: {name:'Bigotes',  rarity:'normal', look:'Gato atigrado', beh:'pounce', dmg:[4,6],  cd:1.3, affixes:['agil'],
            attack:'Arañazo: salta y araña rápido'},
  trufa:   {name:'Trufa',    rarity:'normal', look:'Cerdito', beh:'charge', dmg:[6,9], cd:3, affixes:['buscatesoros'],
            attack:'Embestida que empuja al enemigo'},
  pio:     {name:'Pío',      rarity:'normal', look:'Gorrión', beh:'flyer', dmg:[3,5], cd:.9, affixes:['inspiradora'],
            attack:'Picotazo desde el aire (los enemigos no lo alcanzan)'},
  canela:  {name:'Canela',   rarity:'normal', look:'Perro salchicha', beh:'taunt', dmg:[5,8], cd:2.2, affixes:['rastreador'],
            attack:'Mordisco y ladrido que atrae a los enemigos'},
  bellota: {name:'Bellota',  rarity:'normal', look:'Ardilla', beh:'ranged', dmg:[5,8], cd:1.6, affixes:['avariciosa'],
            attack:'Lanza bellotas a distancia'},
  humo:    {name:'Humo',     rarity:'magic',  look:'Hurón gris', beh:'pounce', dmg:[5,8], cd:1.8, bites:2, affixes:['veloz','venenosa'],
            attack:'Doble mordisco rápido'},
  brasa:   {name:'Brasa',    rarity:'magic',  look:'Zorro rojo', beh:'pounce', dmg:[7,11], cd:2.2, burn:true, affixes:['rastreador','luciernaga'],
            attack:'Mordisco que quema durante 3 s'},
  ceniza:  {name:'Ceniza',   rarity:'magic',  look:'Búho', beh:'diver', dmg:[8,12], cd:2.2, reveal:true, affixes:['olfato','helada'],
            attack:'Ataque en picado; ve y revela a los Sombríos'},
  roca:    {name:'Roca',     rarity:'rare',   look:'Tortuga', beh:'tank', dmg:[8,12], cd:2.5, affixes:['robusta','guardiana','espinosa','valiente'],
            attack:'Se pone delante del héroe, atrae a los enemigos y los aturde con el caparazón'},
  tormenta:{name:'Tormenta', rarity:'rare',   look:'Cabra montés', beh:'charge', dmg:[10,15], cd:2.6, pierce:true, affixes:['feroz','veloz','valiente','inspiradora'],
            attack:'Carga con los cuernos que atraviesa y aturde'},
  alba:    {name:'Alba',     rarity:'legendary', look:'Liebre-zorro', beh:'pounce', dmg:[12,18], cd:2, legendary:true, affixes:['alba','vampirica','agil','inspiradora'],
            attack:'Salto y mordisco. Destello de Alba cada 20 s: daña y ralentiza en área, revela Sombríos y recarga 10 de aceite'},
};
// ---------- Mascotas de la Expedición 2 – El cementerio ----------
Object.assign(PETS, {
  migas:    {exp:2, name:'Migas',    rarity:'normal', look:'Ratón de campo', beh:'pounce', dmg:[3,5], cd:.85, affixes:['agil'],
             attack:'Mordisquito muy rápido'},
  pico:     {exp:2, name:'Pico',     rarity:'normal', look:'Cuervo', beh:'flyer', dmg:[4,6], cd:1, affixes:['buscatesoros'],
             attack:'Picotazo desde el aire'},
  verruga:  {exp:2, name:'Verruga',  rarity:'normal', look:'Sapo', beh:'tongue', dmg:[5,8], cd:2, affixes:['venenosa'],
             attack:'Lengüetazo a distancia que atrae al enemigo hacia él'},
  chillido: {exp:2, name:'Chillido', rarity:'normal', look:'Murciélago', beh:'flyer', dmg:[4,7], cd:1.1, affixes:['vampirica'],
             attack:'Vuela y muerde'},
  sombra:   {exp:2, name:'Sombra',   rarity:'normal', look:'Gato negro', beh:'pounce', dmg:[5,7], cd:1.4, stealth:true, affixes:['veloz'],
             attack:'Arañazo; los enemigos lo ignoran mientras no ataca'},
  puas:     {exp:2, name:'Púas',     rarity:'magic',  look:'Erizo', beh:'charge', dmg:[7,10], cd:2.4, roll:true, affixes:['espinosa','robusta'],
             attack:'Rueda hacia el enemigo y lo pincha'},
  escarcha: {exp:2, name:'Escarcha', rarity:'magic',  look:'Zorro blanco', beh:'pounce', dmg:[8,12], cd:2.2, freeze:true, affixes:['helada','rastreador'],
             attack:'Mordisco helado que congela 1 s'},
  lumbre:   {exp:2, name:'Lumbre',   rarity:'magic',  look:'Polilla luminosa', beh:'duster', dmg:[5,8], cd:1.6, affixes:['luciernaga','inspiradora'],
             attack:'Polvo brillante que ralentiza a los enemigos en área'},
  aullido:  {exp:2, name:'Aullido',  rarity:'rare',   look:'Lobo gris', beh:'pounce', dmg:[11,16], cd:2, howl:true, affixes:['feroz','veloz','valiente','rastreador'],
             attack:'Mordisco y aullido que hace huir a los enemigos 2 s'},
  colmillo: {exp:2, name:'Colmillo', rarity:'rare',   look:'Jabalí', beh:'charge', dmg:[12,17], cd:2.8, knock:true, affixes:['robusta','guardiana','espinosa','feroz'],
             attack:'Carga que derriba a los enemigos'},
  selene:   {exp:2, name:'Selene',   rarity:'legendary', look:'Ciervo espectral', beh:'pounce', dmg:[14,20], cd:2, legendary:true, moonlight:true, reveal:true, stampede:true,
             affixes:['luna','agil','valiente','inspiradora'],
             attack:'Luz de luna: revela a los Sombríos y cura 1 de vida/s al héroe. Estampida espectral cada 18 s: carga fantasmal que atraviesa a todos los enemigos y los aturde'},
});
// ---------- Mascotas de la Expedición 3 – La cripta de la condesa ----------
Object.assign(PETS, {
  tizne:      {exp:3, name:'Tizne',      rarity:'normal', look:'Rata de cripta', beh:'pounce', dmg:[4,6], cd:1.1, affixes:['venenosa'],
               attack:'Mordisco infecto'},
  escarabajo: {exp:3, name:'Escarabajo', rarity:'normal', look:'Escarabajo dorado', beh:'charge', dmg:[5,8], cd:2.4, miniStun:true, affixes:['buscatesoros'],
               attack:'Embestida que aturde 0,5 s'},
  ojillos:    {exp:3, name:'Ojillos',    rarity:'normal', look:'Lagartija de catacumba', beh:'ranged', proj:'acid', dmg:[5,8], cd:1.5, affixes:['agil'],
               attack:'Escupe ácido a distancia'},
  nube:       {exp:3, name:'Nube',       rarity:'normal', look:'Conejo blanco', beh:'pounce', dmg:[4,6], cd:1.5, healer:true, affixes:['inspiradora'],
               attack:'Salto y mordisco; cada 10 s cura 10 de vida al héroe'},
  pelusa:     {exp:3, name:'Pelusa',     rarity:'normal', look:'Araña de cripta', beh:'ranged', proj:'web', dmg:[3,5], cd:1.7, affixes:['olfato'],
               attack:'Telaraña a distancia que ralentiza'},
  medianoche: {exp:3, name:'Medianoche', rarity:'magic',  look:'Pantera negra', beh:'pounce', dmg:[9,13], cd:1.9, critPounce:true, affixes:['feroz','veloz'],
               attack:'Salto desde las sombras con doble probabilidad de crítico'},
  ambar:      {exp:3, name:'Ámbar',      rarity:'magic',  look:'Salamandra de fuego', beh:'cone', dmg:[7,10], cd:2.2, fire:'#ff8a2a', affixes:['luciernaga','valiente'],
               attack:'Escupe fuego en cono que quema'},
  pedrusco:   {exp:3, name:'Pedrusco',   rarity:'magic',  look:'Gárgola pequeña', beh:'diver', dmg:[9,13], cd:2.4, diveStun:true, stone:true, affixes:['robusta','guardiana'],
               attack:'Cae en picado y aturde; se vuelve de piedra (inmune) 2 s al recibir un golpe fuerte'},
  huesitos:   {exp:3, name:'Huesitos',   rarity:'rare',   look:'Perro esqueleto', beh:'pounce', dmg:[11,16], cd:1.9, raise:true, affixes:['feroz','valiente','vampirica','rastreador'],
               attack:'Mordisco; al matar alza un esqueleto aliado durante 10 s'},
  lugubre:    {exp:3, name:'Lúgubre',    rarity:'rare',   look:'Cuervo gigante de tres ojos', beh:'flock', dmg:[9,13], cd:2.6, affixes:['olfato','veloz','buscatesoros','helada'],
               attack:'Bandada de cuervos que picotea en área'},
  nocturna:   {exp:3, name:'Nocturna',   rarity:'legendary', look:'Dragoncito de ónice', beh:'cone', dmg:[15,21], cd:2.4, fire:'#b070ff', legendary:true, eclipse:true,
               affixes:['eclipse','feroz','valiente','luciernaga'],
               attack:'Aliento de fuego espectral en cono. Eclipse cada 25 s: los enemigos cercanos se confunden y se atacan entre ellos 4 s, y el héroe gana +30 % de daño'},
});
// ---------- afijos nuevos de mascota ----------
Object.assign(PET_AFFIX, {
  sangrienta:   {name:'Sangrienta',    desc:'Sus golpes causan sangrado (5 de daño por segundo durante 4 s)'},
  atronadora:   {name:'Atronadora',    desc:'15 % de probabilidad de aturdir 0,8 s con cada golpe'},
  ejecutora:    {name:'Ejecutora',     desc:'+50 % de daño a enemigos con menos del 30 % de vida'},
  centinela:    {name:'Centinela',     desc:'Si tu vida baja del 30 %, ataca un 50 % más fuerte y el doble de rápido'},
  curandera:    {name:'Curandera',     desc:'Cura 5 de vida al héroe cada 4 s'},
  cazarrecompensas:{name:'Cazarrecompensas', desc:'+10 % de probabilidad de que los monstruos suelten objetos'},
  ligera:       {name:'Ligera',        desc:'Correr y saltar gastan un 15 % menos de estamina'},
  indomable:    {name:'Indomable',     desc:'Una vez por expedición, al caer a 0 de vida se levanta con el 30 %'},
  voraz:        {name:'Voraz',         desc:'Al matar un enemigo recupera el 15 % de su vida máxima'},
  ignea:        {name:'Ígnea',         desc:'Sus golpes queman durante 3 s'},
  dura:         {name:'Dura',          desc:'Recibe un 15 % menos de daño'},
  temible:      {name:'Temible',       desc:'10 % de probabilidad de hacer huir al enemigo 2 s con cada golpe'},
  recolectora:  {name:'Recolectora',   desc:'Recoge sola la munición del suelo (flechas, piedras y lanzas)'},
  crin:         {name:'Crin de fuego', desc:'Desprende luz cálida y sus golpes queman durante 3 s'},
});
// ---------- Mascotas de la Expedición 4 – Las planicies salvajes ----------
Object.assign(PETS, {
  mostaza:   {exp:4, name:'Mostaza',    rarity:'normal', look:'Tejón', beh:'pounce', dmg:[5,8], cd:1.5, bleed:.3, affixes:['dura'],
              attack:'Zarpazo con 30 % de probabilidad de sangrado'},
  cardo:     {exp:4, name:'Cardo',      rarity:'normal', look:'Liebre parda', beh:'pounce', dmg:[3,5], cd:.8, affixes:['ligera'],
              attack:'Saltos muy rápidos y mordisco'},
  chiflo:    {exp:4, name:'Chiflo',     rarity:'normal', look:'Perdiz', beh:'flyer', dmg:[3,5], cd:1, chestPing:true, affixes:['olfato'],
              attack:'Silba y picotea desde el aire; cada 12 s revela los cofres cercanos unos segundos'},
  pepita:    {exp:4, name:'Pepita',     rarity:'normal', look:'Armadillo', beh:'charge', dmg:[6,9], cd:2.4, roll:true, affixes:['guardiana'],
              attack:'Se enrolla y rueda contra el enemigo, golpeándolo y empujándolo'},
  sombrerito:{exp:4, name:'Sombrerito', rarity:'normal', look:'Suricata', beh:'ranged', proj:'dirt', dmg:[4,7], cd:1.5, affixes:['recolectora'],
              attack:'Lanza terrones de tierra a distancia'},
  alazan:    {exp:4, name:'Alazán',     rarity:'magic',  look:'Potro salvaje', beh:'pounce', dmg:[9,13], cd:2.2, kick:true, affixes:['atronadora','veloz'],
              attack:'Coz que empuja y aturde 0,5 s'},
  zumo:      {exp:4, name:'Zumo',       rarity:'magic',  look:'Zorro pardo', beh:'pounce', dmg:[8,12], cd:2, mark:true, affixes:['cazarrecompensas','rastreador'],
              attack:'Mordisco que marca al enemigo: recibe +25 % de daño de todos'},
  brisa:     {exp:4, name:'Brisa',      rarity:'magic',  look:'Águila ratonera', beh:'diver', dmg:[9,13], cd:2.3, pierceDive:true, affixes:['veloz','temible'],
              attack:'Picada en vuelo que atraviesa a todos los enemigos de su trayectoria'},
  cuernolargo:{exp:4, name:'Cuernolargo', rarity:'rare', look:'Bisonte joven', beh:'charge', dmg:[14,20], cd:2.9, knock:true, shock:true, affixes:['robusta','dura','indomable','atronadora'],
              attack:'Carga aplastante que provoca una onda de choque y aturde'},
  tizon:     {exp:4, name:'Tizón',      rarity:'rare',   look:'Lince', beh:'pounce', dmg:[10,15], cd:1.7, crit3:true, affixes:['sangrienta','veloz','ejecutora','voraz'],
              attack:'Salto con crítico garantizado cada 3 ataques y sangrado'},
  aurora:    {exp:4, name:'Aurora',     rarity:'legendary', look:'Mustang espectral de crin de fuego', beh:'pounce', dmg:[15,22], cd:2, legendary:true, gallop:true, burn:true,
              affixes:['crin','ignea','centinela','valiente'],
              attack:'Coz llameante. Galope ardiente cada 22 s: recorre una línea dejando un rastro de fuego 4 s que quema a los enemigos, y el héroe gana +20 % de velocidad durante 6 s'},
  // ---- Expedición 5: el campamento orco ----
  garrita:   {exp:5, name:'Garrita',    rarity:'normal', look:'Cría de huargo pardo', beh:'pounce', dmg:[5,8], cd:1.5, bites:2, affixes:['feroz'],
              attack:'Doble mordisco rápido'},
  tuerto:    {exp:5, name:'Tuerto',     rarity:'normal', look:'Cuervo de un solo ojo', beh:'flyer', dmg:[4,7], cd:.9, mark:true, affixes:['olfato'],
              attack:'Picotazo desde el aire que marca al enemigo: recibe +25 % de daño de todos'},
  rascacio:  {exp:5, name:'Rascacio',   rarity:'normal', look:'Mapache ladrón', beh:'pounce', dmg:[5,8], cd:1.6, steal:true, affixes:['avariciosa'],
              attack:'Zarpazo que roba monedas al enemigo'},
  hollin:    {exp:5, name:'Hollín',     rarity:'normal', look:'Gato negro de hollín', beh:'ranged', proj:'ember', dmg:[5,8], cd:1.7, burn:true, affixes:['ignea'],
              attack:'Lanza bolitas de brasa que queman'},
  grunon:    {exp:5, name:'Gruñón',     rarity:'normal', look:'Jabato cebado', beh:'charge', dmg:[6,9], cd:2.8, affixes:['robusta'],
              attack:'Embestida que empuja al enemigo'},
  bramido:   {exp:5, name:'Bramido',    rarity:'magic',  look:'Carnero de guerra', beh:'pounce', dmg:[9,13], cd:2.2, kick:true, affixes:['atronadora','dura'],
              attack:'Cornada que empuja y aturde 0,5 s'},
  esquirla:  {exp:5, name:'Esquirla',   rarity:'magic',  look:'Zorro con collar de pinchos', beh:'pounce', dmg:[8,12], cd:1.9, bleed:1, affixes:['sangrienta','rastreador'],
              attack:'Mordisco que provoca sangrado'},
  colilla:   {exp:5, name:'Colilla',    rarity:'magic',  look:'Lagarto de hoguera', beh:'cone', dmg:[7,10], cd:2.2, fire:'#ff8a2a', affixes:['ignea','veloz'],
              attack:'Aliento de chispas en cono'},
  machaca:   {exp:5, name:'Machaca',    rarity:'rare',   look:'Oso encadenado', beh:'charge', dmg:[14,20], cd:3, knock:true, shock:true, affixes:['robusta','dura','temible','voraz'],
              attack:'Embate con zarpazo en área que aturde'},
  vigia:     {exp:5, name:'Vigía',      rarity:'rare',   look:'Búho de guerra de ojos naranjas', beh:'ranged', proj:'feather', dmg:[8,12], cd:1.7, affixes:['centinela','cazarrecompensas','olfato','agil'],
              attack:'Lluvia de plumas a distancia'},
  sangrelobo:{exp:5, name:'Sangrelobo', rarity:'legendary', look:'Huargo gigante con armadura orca rota', beh:'pounce', dmg:[14,20], cd:1.8, legendary:true, bites:2, bleed:1, critPounce:true, warcry:true,
              affixes:['feroz','vampirica','rastreador','crin'],
              attack:'Mordisco desgarrador (doble, con sangrado y más críticos). Aullido de guerra cada 20 s: los enemigos cercanos huyen 3 s y el héroe hace +25 % de daño 5 s'},
  // ---- Expedición 6: el castillo de Urr ----
  moho:      {exp:6, name:'Moho',      rarity:'normal', look:'Rata de mazmorra', beh:'pounce', dmg:[5,8], cd:1.5, affixes:['venenosa'],
              attack:'Mordisco que envenena'},
  penumbra:  {exp:6, name:'Penumbra',  rarity:'normal', look:'Murciélago de piedra', beh:'flyer', dmg:[4,7], cd:.8, affixes:['vampirica'],
              attack:'Picotazos rápidos desde el aire'},
  cadenita:  {exp:6, name:'Cadenita',  rarity:'normal', look:'Mastín de presidio con cadena', beh:'taunt', dmg:[5,8], cd:2.2, affixes:['guardiana'],
              attack:'Mordisco y ladrido que atrae a los enemigos'},
  pinchito:  {exp:6, name:'Pinchito',  rarity:'normal', look:'Erizo de hierro', beh:'charge', dmg:[6,9], cd:2.4, roll:true, affixes:['espinosa'],
              attack:'Se enrolla y rueda contra el enemigo, golpeándolo y empujándolo'},
  candil:    {exp:6, name:'Candil',    rarity:'normal', look:'Sapo de lámpara', beh:'ranged', proj:'glow', dmg:[5,8], cd:1.6, affixes:['luciernaga'],
              attack:'Escupe babas luminosas a distancia'},
  piedrilla: {exp:6, name:'Piedrilla', rarity:'magic',  look:'Gárgola cría', beh:'diver', dmg:[8,12], cd:2.2, diveStun:true, affixes:['atronadora','dura'],
              attack:'Picada en vuelo que aturde'},
  zarcillo:  {exp:6, name:'Zarcillo',  rarity:'magic',  look:'Araña de mazmorra', beh:'ranged', proj:'web', dmg:[5,8], cd:1.6, affixes:['helada','agil'],
              attack:'Lanza telarañas que ralentizan'},
  cerrojo:   {exp:6, name:'Cerrojo',   rarity:'magic',  look:'Lobo de guardia con collar', beh:'pounce', dmg:[8,12], cd:2, mark:true, affixes:['cazarrecompensas','rastreador'],
              attack:'Mordisco que marca al enemigo: recibe +25 % de daño de todos'},
  almena:    {exp:6, name:'Almena',    rarity:'rare',   look:'Halcón de torre', beh:'diver', dmg:[11,16], cd:2.2, pierceDive:true, affixes:['veloz','temible','ejecutora','agil'],
              attack:'Picada en vuelo que atraviesa a todos los enemigos de su trayectoria'},
  basalto:   {exp:6, name:'Basalto',   rarity:'rare',   look:'Gólem de piedra', beh:'charge', dmg:[14,20], cd:3, knock:true, shock:true, stone:true, affixes:['robusta','dura','indomable','centinela'],
              attack:'Embate con onda de choque que aturde; se vuelve de piedra e inmune 2 s tras un golpe fuerte'},
  cerbero:   {exp:6, name:'Cerbero',   rarity:'legendary', look:'Perro infernal de tres cabezas', beh:'cone', dmg:[15,21], cd:2.2, fire:'#ff8a2a', burn:true, legendary:true, inferno:true,
              affixes:['ignea','feroz','crin','rastreador'],
              attack:'Aliento de fuego en cono (triple golpe). Llamarada infernal cada 24 s: un anillo de fuego alrededor del héroe durante 5 s que quema a los enemigos y reduce un 20 % el daño que recibe'},
  // ----- Expedición 7: El río travieso -----
  chapoteo:  {exp:7, name:'Chapoteo',  rarity:'normal', look:'Nutria', beh:'ranged', proj:'splash', dmg:[5,8], cd:1.6, affixes:['helada'],
              attack:'Salpica agua a distancia: ralentiza al enemigo'},
  croac:     {exp:7, name:'Croac',     rarity:'normal', look:'Rana verde', beh:'tongue', dmg:[5,8], cd:2.4, affixes:['agil'],
              attack:'Lengüetazo que atrae al enemigo hacia ella'},
  palmeado:  {exp:7, name:'Palmeado',  rarity:'normal', look:'Patito', beh:'pounce', dmg:[4,6], cd:1.3, bites:2, affixes:['veloz'],
              attack:'Picotazos rápidos (doble golpe)'},
  guijarro:  {exp:7, name:'Guijarro',  rarity:'normal', look:'Pez saltarín', beh:'pounce', dmg:[6,9], cd:1.6, affixes:['buscatesoros'],
              attack:'Salta fuera del agua y golpea con la cola'},
  pinzas:    {exp:7, name:'Pinzas',    rarity:'normal', look:'Cangrejo pequeño', beh:'charge', dmg:[5,8], cd:2.4, miniStun:true, affixes:['dura'],
              attack:'Pellizco que aturde 0,5 s'},
  dique:     {exp:7, name:'Dique',     rarity:'magic',  look:'Castor', beh:'pounce', dmg:[9,13], cd:2.2, kick:true, affixes:['robusta','guardiana'],
              attack:'Coletazo que empuja y aturde 0,5 s'},
  zancuda:   {exp:7, name:'Zancuda',   rarity:'magic',  look:'Garza', beh:'diver', dmg:[9,13], cd:2.3, pierceDive:true, affixes:['ejecutora','veloz'],
              attack:'Picada con su pico largo que atraviesa a todos los enemigos de su trayectoria'},
  limo:      {exp:7, name:'Limo',      rarity:'magic',  look:'Salamandra de río', beh:'pounce', dmg:[8,12], cd:2, affixes:['venenosa','rastreador'],
              attack:'Mordisco que envenena'},
  corriente: {exp:7, name:'Corriente', rarity:'rare',   look:'Nutria de agua gigante', beh:'whirl', dmg:[10,15], cd:3, whirl:true, affixes:['helada','agil','voraz','espinosa'],
              attack:'Remolino en área que arrastra a los enemigos hacia el centro y los hiere'},
  martin:    {exp:7, name:'Martín',    rarity:'rare',   look:'Martín pescador', beh:'diver', dmg:[9,13], cd:2.1, mark:true, affixes:['cazarrecompensas','olfato','centinela','veloz'],
              attack:'Picada en vuelo que marca al enemigo: recibe +25 % de daño de todos'},
  leviatan:  {exp:7, name:'Leviatán',  rarity:'legendary', look:'Serpiente de río con corona de espuma', beh:'cone', dmg:[15,21], cd:2.3, fire:'#5ac8ff', legendary:true, tide:true,
              affixes:['helada','curandera','dura','inspiradora'],
              attack:'Chorro de agua en cono (triple golpe). Marea cada 24 s: una ola empuja a todos los enemigos cercanos y cura un 20 % de la vida al héroe'},
  // ----- Expedición 8: La mina de los enanos -----
  zapa:      {exp:8, name:'Zapa',      rarity:'normal', look:'Topo', beh:'pounce', dmg:[5,8], cd:1.4, bites:2, affixes:['olfato'],
              attack:'Embiste y muerde rápido (doble mordisco)'},
  murci:     {exp:8, name:'Murci',     rarity:'normal', look:'Murciélago de cueva', beh:'flyer', dmg:[4,7], cd:.8, affixes:['vampirica'],
              attack:'Picotazos rápidos desde el aire'},
  cuarzo:    {exp:8, name:'Cuarzo',    rarity:'normal', look:'Escarabajo de cristal', beh:'charge', dmg:[5,8], cd:2.4, miniStun:true, affixes:['dura'],
              attack:'Embestida que aturde 0,5 s'},
  brasita:   {exp:8, name:'Brasita',   rarity:'normal', look:'Salamandra de lava', beh:'ranged', proj:'ember', dmg:[5,8], cd:1.5, affixes:['ignea'],
              attack:'Escupe brasas a distancia que queman'},
  engranaje: {exp:8, name:'Engranaje', rarity:'normal', look:'Autómata enano pequeño', beh:'pounce', dmg:[5,8], cd:1.8, kick:true, affixes:['veloz'],
              attack:'Golpe de martillo que empuja y aturde 0,5 s'},
  canario:   {exp:8, name:'Canario',   rarity:'magic',  look:'Canario minero', beh:'ranged', proj:'feather', dmg:[7,11], cd:1.6, affixes:['luciernaga','inspiradora'],
              attack:'Lluvia de plumas a distancia'},
  geoda:     {exp:8, name:'Geoda',     rarity:'magic',  look:'Tortuga de cristal', beh:'charge', dmg:[9,13], cd:2.8, knock:true, affixes:['robusta','dura'],
              attack:'Embate que empuja y aturde'},
  taladro:   {exp:8, name:'Taladro',   rarity:'magic',  look:'Gusano taladrador', beh:'diver', dmg:[9,13], cd:2.3, pierceDive:true, affixes:['ejecutora','veloz'],
              attack:'Picada con su taladro que atraviesa a todos los enemigos de su trayectoria'},
  yunque:    {exp:8, name:'Yunque',    rarity:'rare',   look:'Tejón acorazado', beh:'charge', dmg:[14,20], cd:3, knock:true, shock:true, affixes:['robusta','dura','indomable','espinosa'],
              attack:'Embate con onda de choque que aturde'},
  eco:       {exp:8, name:'Eco',       rarity:'rare',   look:'Murciélago de cristal gigante', beh:'flock', dmg:[9,13], cd:2.6, mark:true, affixes:['cazarrecompensas','olfato','atronadora','veloz'],
              attack:'Bandada de ecos en área que marca a los enemigos: reciben +25 % de daño de todos'},
  fragua:    {exp:8, name:'Fragua',    rarity:'legendary', look:'Dragoncito de obsidiana y lava', beh:'cone', dmg:[15,21], cd:2.3, fire:'#ff5a1a', burn:true, legendary:true, eruption:true,
              affixes:['ignea','feroz','buscatesoros','dura'],
              attack:'Aliento de lava en cono (triple golpe) que quema. Erupción cada 24 s: llamas bajo los enemigos cercanos que los aturden'},
  // ----- Expedición 8 bis: El bosque élfico -----
  hojarasca: {exp:'8b', name:'Hojarasca', rarity:'normal', look:'Erizo del bosque', beh:'pounce', dmg:[5,8], cd:1.6, affixes:['espinosa'],
              attack:'Embiste y pincha'},
  lucero:    {exp:'8b', name:'Lucero',    rarity:'normal', look:'Luciérnaga gigante', beh:'ranged', proj:'glow', dmg:[5,8], cd:1.6, affixes:['luciernaga'],
              attack:'Escupe destellos de luz a distancia'},
  rocio:     {exp:'8b', name:'Rocío',     rarity:'normal', look:'Cervatillo', beh:'charge', dmg:[5,8], cd:2.4, miniStun:true, affixes:['veloz'],
              attack:'Cornada que aturde 0,5 s'},
  vuelito:   {exp:'8b', name:'Vuelito',   rarity:'normal', look:'Ardilla voladora', beh:'flyer', dmg:[4,7], cd:.9, affixes:['agil'],
              attack:'Picotazos y arañazos desde el aire'},
  setita:    {exp:'8b', name:'Setita',    rarity:'normal', look:'Hongo andante', beh:'ranged', proj:'acid', dmg:[5,8], cd:1.6, affixes:['venenosa'],
              attack:'Lanza esporas que envenenan'},
  zarzo:     {exp:'8b', name:'Zarzo',     rarity:'magic',  look:'Zorro de hojas', beh:'pounce', dmg:[8,12], cd:1.9, bleed:1, affixes:['sangrienta','agil'],
              attack:'Mordisco que provoca sangrado'},
  silva:     {exp:'8b', name:'Silva',     rarity:'magic',  look:'Lechuza de plata', beh:'ranged', moonlight:true, reveal:true, proj:'feather', dmg:[8,12], cd:1.6, affixes:['luna','inspiradora'],
              attack:'Lluvia de plumas de plata a distancia'},
  hilandera: {exp:'8b', name:'Hilandera', rarity:'magic',  look:'Araña tejedora', beh:'ranged', proj:'web', dmg:[5,8], cd:1.6, affixes:['helada','venenosa'],
              attack:'Lanza telarañas que ralentizan'},
  raiz:      {exp:'8b', name:'Raíz',      rarity:'rare',   look:'Ent joven', beh:'charge', dmg:[14,20], cd:3, knock:true, shock:true, affixes:['robusta','dura','guardiana','indomable'],
              attack:'Embate con onda de choque que aturde'},
  fatuo:     {exp:'8b', name:'Fuego fatuo', rarity:'rare', look:'Espíritu de luz', beh:'ranged', proj:'ember', dmg:[9,13], cd:1.5, affixes:['luciernaga','ignea','avariciosa','veloz'],
              attack:'Chispas desde el aire que queman'},
  halo:      {exp:'8b', name:'Halo',      rarity:'legendary', look:'Ciervo luminoso de cornamenta de luz', beh:'cone', dmg:[15,21], cd:2.3, fire:'#fff0a0', legendary:true, bloom:true,
              affixes:['curandera','inspiradora','alba','dura'],
              attack:'Rayo de luz en cono (triple golpe). Floración cada 24 s: cura un 20 % de la vida al héroe y a todas las mascotas'},
  // ---- templo sagrado (exp. 9) ----
  paloma:    {exp:9, name:'Paloma', rarity:'normal', look:'Paloma blanca', beh:'flyer', dmg:[4,7], cd:.9, affixes:['curandera'],
              attack:'Picotazos desde el aire'},
  cordero:   {exp:9, name:'Cordero Dorado', rarity:'normal', look:'Cordero de lana dorada', beh:'charge', dmg:[5,8], cd:2.4, miniStun:true, affixes:['escudera'],
              attack:'Embestida suave que aturde 0,5 s'},
  gatotemplo:{exp:9, name:'Gato del Templo', rarity:'normal', look:'Gato blanco con collar de oro', beh:'pounce', dmg:[5,8], cd:1.4, bites:2, affixes:['agil'],
              attack:'Doble arañazo rápido'},
  grulla:    {exp:9, name:'Grulla Sagrada', rarity:'normal', look:'Grulla de plumas plateadas', beh:'diver', dmg:[5,8], cd:2.2, pierceDive:true, affixes:['ligera'],
              attack:'Picada con su pico largo que atraviesa a todos los enemigos de su trayectoria'},
  cervatillo:{exp:9, name:'Cervatillo Albo', rarity:'normal', look:'Cervatillo blanco', beh:'charge', dmg:[5,8], cd:2.4, affixes:['veloz'],
              attack:'Cornada'},
  incienso:  {exp:9, name:'Zorro de Incienso', rarity:'magic', look:'Zorro con humo aromático', beh:'pounce', dmg:[8,12], cd:2, slowBite:true, affixes:['rastreador','inspiradora'],
              attack:'Mordisco que ralentiza'},
  luminica:  {exp:9, name:'Mariposa Lumínica', rarity:'magic', look:'Mariposa de luz', beh:'flock', dmg:[8,12], cd:2.6, dust:true, affixes:['luciernaga','curandera'],
              attack:'Polvo brillante que ralentiza a los enemigos en área'},
  escarasagrado:{exp:9, name:'Escarabajo Sagrado', rarity:'magic', look:'Escarabajo dorado alado', beh:'diver', dmg:[8,12], cd:2.2, diveStun:true, affixes:['dura','espinosa'],
              attack:'Picada en vuelo que aturde'},
  leon:      {exp:9, name:'León de Mármol', rarity:'rare', look:'León de piedra blanca', beh:'charge', dmg:[14,20], cd:3, knock:true, shock:true, stone:true, affixes:['feroz','dura','centinela','valiente'],
              attack:'Zarpazo con onda de choque que aturde; se vuelve de piedra e inmune 2 s tras un golpe fuerte'},
  ciervoalba:{exp:9, name:'Ciervo del Alba', rarity:'rare', look:'Ciervo majestuoso de cornamenta de luz', beh:'cone', dmg:[14,20], cd:2.4, fire:'#fff0a0', affixes:['curandera','veloz','indomable','luciernaga'],
              attack:'Rayo de luz en cono (triple golpe)'},
  fenix:     {exp:9, name:'Fénix Sagrado', rarity:'legendary', look:'Fénix de fuego blanco', beh:'cone', dmg:[16,22], cd:2.2, fire:'#ffd070', legendary:true, rebirth:true, burn:true,
              affixes:['ignea','curandera','inspiradora','indomable'],
              attack:'Llamarada en cono (triple golpe). Renacer cada 25 s: una explosión de luz cura un 25 % de la vida al héroe y a todas las mascotas y quema a los enemigos cercanos'},
});
PET_AFFIX.eclipse = {name:'Eclipse', desc:'Cada 25 s confunde a los enemigos cercanos y da +30 % de daño al héroe durante 4 s'};
PET_AFFIX.luna ={name:'Luz de luna', desc:'Aura que revela a los Sombríos y cura 1 de vida por segundo al héroe'};
Object.assign(PET_AFFIX, {
  cazadora:  {name:'Cazadora', desc:'+25 % de daño a enemigos marcados, sangrando o quemándose'},
  escudera:  {name:'Escudera', desc:'Cada 12 s da un escudo de 25 de vida al héroe'},
  estelar:   {name:'Estelar', desc:'Al matar a un enemigo, su siguiente ataque es crítico seguro'},
  resiliente:{name:'Resiliente', desc:'Pierde un 30 % menos de vida por veneno y otros efectos continuos'},
  agilc:     {name:'Ágil de combate', desc:'+12 % de esquivar golpes y +10 % de velocidad de ataque', fx:{dodge:12, aspd:10}},
  sanadora:  {name:'Sanadora de grupo', desc:'Cada 8 s cura un 8 % de vida a las demás mascotas'},
  presa:     {name:'Presa fácil', desc:'Sus golpes hacen que el enemigo reciba +10 % de daño de todos durante 4 s'},
  electrica: {name:'Eléctrica', desc:'10 % de que el golpe salte a otro enemigo cercano con la mitad del daño'},
  voladora:  {name:'Voladora', desc:'Recibe un 20 % menos de daño de proyectiles y ataques a distancia'},
});
// escalado por nivel de expedición (petición del usuario): cada nivel de la expedición da +12 % de vida y +10 % de daño a sus mascotas
const PET_TIER_HP = .12, PET_TIER_DMG = .10, PET_TIER_REVIVE = .10;
const petTier = p => Math.max(1, parseInt(p.exp) || 1);
const reviveBase = id => Math.round(REVIVE_COST[PETS[id].rarity] * (1 + PET_TIER_REVIVE*(petTier(PETS[id]) - 1)));   // el precio de resucitar sube un 10 % por nivel
const petBaseHp = p => Math.round(PET_HP[p.rarity] * (p.affixes.includes('robusta') ? 1.4 : 1) * (1 + PET_TIER_HP*(petTier(p) - 1)));
for(const id in PETS){
  const p = PETS[id]; p.id = id; p.exp ??= 1;
  p.hp = petBaseHp(p);
  const dm = 1 + PET_TIER_DMG*(petTier(p) - 1); p.dmg = p.dmg.map(v => Math.max(1, Math.round(v*dm)));
}
for(const id in PETS) PETS[id].exp ??= 1;
const PET_IDS = Object.keys(PETS);
const petsOfExp = lvl => PET_IDS.filter(id => PETS[id].exp === lvl);

// ---------- Progresión ----------
const xpFor = lvl => Math.round(60*Math.pow(lvl,1.65));
const petSlots = lvl => 1 + (lvl>=10?1:0) + (lvl>=20?1:0) + (lvl>=40?1:0);   // 4.º hueco a nivel 40

// ---------- probabilidad de que una mascota aparezca enjaulada en una expedición ----------
const CAGE_CHANCE = {normal:.8, magic:.5, rare:.25, legendary:.08};

// ---------- Gonzalo el profesor: árbol de pasivas (5 ramas × 20 puntos) ----------
// (SKILLS, SKILL_MAX y el árbol de Gonzalo están ahora en js/tree.js)

// ---------- equipo de la Expedición 3 y objetos únicos de la Condesa fantasma ----------
RARITY.unique = {name:'Única', col:'#ff8a3a'};
Object.assign(ITEMS, {
  ironshield:{name:'Escudo de hierro', icon:'ironshield', slot:'shield', gear:true, dur:50, armor:3, block:.8, value:22,
             desc:'Escudo pesado. Mantén clic derecho para cubrirte: bloquea el 80 % del daño frontal.'},
  firearrows:{name:'Flechas de fuego', icon:'firearrows', stack:100, kind:'ammo', value:.8,
             desc:'Munición para el arco: quema al enemigo 3 s. Si las llevas, el arco las usa antes que las normales.'},
  mace:      {name:'Maza de hierro', icon:'mace', slot:'weapon', kind:'mace', gear:true, dur:80, dmg:[20,30], stunChance:.3, value:26,
             desc:'Arma pesada y lenta. 30 % de probabilidad de aturdir 1 s.'},
  axe:       {name:'Hacha afilada', icon:'axe', slot:'weapon', kind:'axe', gear:true, dur:70, dmg:[18,27], bleedChance:.35, value:24,
             desc:'Golpe amplio. 35 % de probabilidad de causar sangrado (5 de daño por segundo durante 4 s).'},
  dagger:    {name:'Daga', icon:'dagger', slot:'weapon', kind:'dagger', gear:true, dur:60, dmg:[9,14], poisonChance:.4, value:18,
             desc:'Arma muy rápida de corto alcance. 40 % de probabilidad de envenenar 4 s.'},
  greataxe:  {name:'Hacha a dos manos', icon:'greataxe', slot:'weapon', kind:'greataxe', gear:true, twoHanded:true, dur:90, dmg:[34,48], value:60,
             desc:'A dos manos: no permite llevar escudo. Ataque giratorio en área, como un ciclón, que golpea a todos los que te rodean.'},
  firesword: {name:'Espada de fuego', icon:'firesword', slot:'weapon', kind:'sword', gear:true, dur:100, dmg:[26,36], burnChance:.5, value:60,
             desc:'50 % de probabilidad de quemar al enemigo durante 4 s.'},
  icesword:  {name:'Espada de hielo', icon:'icesword', slot:'weapon', kind:'sword', gear:true, dur:100, dmg:[26,36], freezeChance:.4, value:60,
             desc:'40 % de probabilidad de congelar al enemigo 2,5 s (lo deja casi inmóvil).'},
  lightningsword:{name:'Espada de rayos', icon:'lightningsword', slot:'weapon', kind:'sword', gear:true, dur:100, dmg:[26,36], weakChance:.4, value:60,
             desc:'40 % de probabilidad de debilitar al enemigo 5 s (hace un 40 % menos de daño).'},
  flamethrower:{name:'Lanzallamas de aceite', icon:'flamethrower', slot:'weapon', kind:'flamethrower', gear:true, twoHanded:true, dur:200, dmg:[11,16], burnChance:1, value:140,
             desc:'A dos manos: no permite llevar escudo. Gasta el aceite del farolillo: lanza una gran llamarada en cono, quema y deja fuego en el suelo.'},
  explosivearrows:{name:'Flechas explosivas', icon:'explosivearrows', stack:100, kind:'ammo', value:1.6,
             desc:'Munición para arco y ballesta (se gastan antes que las demás). Al impactar explotan en área.'},
  urrhelm:  {name:'Casco cornudo de Urr', icon:'urrhelm', slot:'head', gear:true, unique:true, armor:4, value:150,
             fixed:[{k:'hp',v:40},{k:'armor',v:3},{k:'petdmg',v:15}], desc:'Objeto único de Urr, el gran jefe orco.'},
  urraxe:   {name:'Hacha de guerra de Urr', icon:'urraxe', slot:'weapon', kind:'axe', gear:true, unique:true, dur:130, dmg:[34,46], bleedChance:.6, value:170,
             fixed:[{k:'dmg',v:6},{k:'aspd',v:10},{k:'leech',v:4}], desc:'Objeto único de Urr, el gran jefe orco. 60 % de probabilidad de provocar sangrado.'},
  urrwall:  {name:'Muro de Urr', icon:'urrwall', slot:'shield', gear:true, unique:true, dur:120, armor:7, block:.88, value:160,
             fixed:[{k:'thorns',v:10},{k:'armor',v:3},{k:'hp',v:25}], desc:'Objeto único de Urr, el gran jefe orco. Bloquea el 88 % del daño frontal.'},
  urrboots: {name:'Botas de guerra de Urr', icon:'urrboots', slot:'feet', gear:true, unique:true, armor:3, value:150,
             fixed:[{k:'move',v:20},{k:'stam',v:20},{k:'hp',v:20}], desc:'Objeto único de Urr, el gran jefe orco.'},
  countessveil:  {name:'Velo de la Condesa', icon:'veil', slot:'head', gear:true, unique:true, armor:3, value:120, reveal:true,
             fixed:[{k:'hp',v:30},{k:'oil',v:30},{k:'crit',v:6}], desc:'Objeto único de la Condesa fantasma. Revela a los Sombríos cercanos.'},
  spectralclaw:  {name:'Garra espectral', icon:'claw', slot:'hands', gear:true, unique:true, armor:2, value:120, dmgFist:4,
             fixed:[{k:'aspd',v:20},{k:'leech',v:6},{k:'petdmg',v:20}], desc:'Objeto único de la Condesa fantasma.'},
  nightaegis:    {name:'Égida nocturna', icon:'aegis', slot:'shield', gear:true, unique:true, dur:90, armor:6, block:.9, value:140,
             fixed:[{k:'thorns',v:8},{k:'armor',v:4},{k:'hp',v:20}], desc:'Objeto único de la Condesa fantasma. Bloquea el 90 % del daño frontal.'},
  countesslament:{name:'Lamento de la Condesa', icon:'lament', slot:'weapon', kind:'dagger', gear:true, unique:true, dur:120, dmg:[16,22], poisonChance:.6, value:150,
             fixed:[{k:'leech',v:5},{k:'aspd',v:15},{k:'crit',v:8}], desc:'Objeto único de la Condesa fantasma. 60 % de probabilidad de envenenar.'},
});
const UNIQUES = ['countessveil','spectralclaw','nightaegis','countesslament'];
const UNIQUE_CHANCE = .3;   // probabilidad de que la Condesa suelte uno de sus objetos únicos
// Trapis no vende únicos, pero sí los compra (valor fijo)


