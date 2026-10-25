'use strict';
// =====================================================================
//  Expedición 12 (portal de Rolecs) · El castillo de Camelot: la corte del rey Arturo, corrompida por la noche eterna.
// =====================================================================
HIDDEN_EXPEDITIONS.push({id:'camelot', lvl:12, petExp:'12b', hidden:true, viaPortal:true, from:'timehall', mapX:0.23, mapY:-0.31, name:'El castillo de Camelot', boss:'arthur',
  desc:'La corte del rey Arturo, atrapada en un instante que nunca acabó. Los caballeros de la Mesa Redonda vigilan salones de piedra donde Excalibur aún brilla.',
  monsters:'Caballeros de la Mesa Redonda, arqueros reales, hechiceras de Avalón y sabuesos espectrales. Jefe: Arturo, el rey sin descanso'});
iconFrom([
  ['knightsword', 'sword', {w:'#e8f0ff', s:'#8aa0c8', r:'#5a3a22', g:'#ffd84a', b:'#3a2a1a'}],
  ['roundhelm', 'helmet', {L:'#8a8e98', l:'#d8dce8', d:'#3a3e48', s:'#ffd84a'}],
  ['grailtorch', 'atlantern', {b:'#c8a040', y:'#fff0a0', Y:'#ffffff'}],
  ['clarent', 'sword', {w:'#fff6d0', s:'#ffd84a', r:'#8a1c1c', g:'#ffd84a', b:'#3a0e0e'}],
  ['pridwen', 'aegis', {m:'#1c3a7a', M:'#ffd84a', i:'#2a5ac8', I:'#6a9aff', g:'#ffffff'}],
  ['arthurcrown', 'helmet', {L:'#c8962e', l:'#ffe08a', d:'#6a4a10', s:'#6ac8ff'}],
  ['camelotplate', 'chestarmor', {L:'#9aa6c0', l:'#e8eeff', d:'#3a4468', s:'#ffd84a'}],
  ['excalibur', 'sword', {w:'#e8faff', s:'#7ac8ff', r:'#3a5aa8', g:'#ffd84a', b:'#1c2a5a'}],
  ['grailcup', 'chalice', {W:'#ffe08a', w:'#c8962e', s:'#8a6420'}],
  ['knightmedal', 'blackpearl', {B:'#c8962e', b:'#ffe08a', w:'#ffffff'}],
  ['royalseal', 'nacreshell', {W:'#c83a3a', w:'#ff7a7a', p:'#7a1a1a'}],
  ['roundtablepiece', 'goldanchor', {G:'#b8946a', g:'#7a5a3a'}],
  ['merlinbook', 'tidecompass', {G:'#5a3aa8', g:'#2a1a5a', w:'#ffe08a', R:'#c8a0ff', N:'#7ac8ff'}],
  ['holygrail', 'oceanheart', {C:'#ffe08a', c:'#c8962e', W:'#ffffff', d:'#6a4a10'}],
]);
Object.assign(ITEMS, {
  knightsword:{name:'Espada de caballero real', icon:'knightsword', slot:'weapon', kind:'sword', gear:true, dur:150, dmg:[64, 88], value:310, desc:'Acero de Camelot, equilibrada y afilada. Solo cae en el castillo de Camelot.'},
  roundhelm:  {name:'Yelmo de la Mesa Redonda', icon:'roundhelm', slot:'head', gear:true, armor:10, ov:'jroundhelm', value:260, desc:'El yelmo de un caballero de la Mesa Redonda. Solo cae en el castillo de Camelot.'},
  grailtorch: {name:'Farolillo del Grial', icon:'grailtorch', slot:'lantern', oilMax:140, oilRegen:1.5, value:240, desc:'Guarda hasta 140 de aceite y regenera 1,5 por segundo mientras está encendido. Solo cae en el castillo de Camelot.'},
  clarent:    {name:'Clarent', icon:'clarent', slot:'weapon', kind:'sword', gear:true, unique:true, dur:160, dmg:[60, 80], weakChance:.5, value:270, fixed:[{k:'crit', v:10}],
               desc:'Objeto único de Arturo, el rey sin descanso. El 50 % de los golpes debilita al enemigo 5 s (−40 % de daño).'},
  pridwen:    {name:'Pridwen', icon:'pridwen', slot:'shield', gear:true, unique:true, dur:140, armor:8, block:.9, shieldArt:'pridwen', value:270, fixed:[{k:'thorns', v:10}, {k:'hp', v:30}],
               desc:'Objeto único de Arturo, el rey sin descanso. El escudo del rey: bloquea el 90 % del daño frontal.'},
  arthurcrown:{name:'Corona de Arturo', icon:'arthurcrown', slot:'head', gear:true, unique:true, armor:6, ov:'uarthurcrown', value:270, fixed:[{k:'hp', v:45}, {k:'crit', v:5}],
               desc:'Objeto único de Arturo, el rey sin descanso. Una corona que pesa más que un reino.'},
  camelotplate:{name:'Armadura de Camelot', icon:'camelotplate', slot:'chest', gear:true, unique:true, armor:18, ov:'ucamelot', value:270, fixed:[{k:'hp', v:40}, {k:'eleres', v:15}],
               desc:'Objeto único de Arturo, el rey sin descanso. Placas azules y doradas de la guardia real.'},
});
regOv('jroundhelm', 'helmet', {L:'#8a8e98', l:'#d8dce8', d:'#3a3e48'});
uniqueOv('uarthurcrown', 'urrhelm', {L:'#c8962e', l:'#ffe08a', d:'#6a4a10'});
uniqueOv('ucamelot', 'chest', {L:'#4a6ac8', l:'#e8eeff', d:'#1c2a68'});
ART.pridwen = SP(paintSprite(12, 13, [
  {poly:[[0, 0], [12, 0], [12, 6], [6, 13], [0, 6]], c:['#1c3a7a', '#2a5ac8', '#6a9aff']}, {poly:[[2, 2], [10, 2], [10, 6], [6, 10], [2, 6]], c:['#0e1c4a', '#1c3a7a', '#2a5ac8']},
  {l:[6, 2, 6, 10, 1.4], c:['#ffd84a', '#fff0a0']}, {l:[3, 5, 9, 5, 1.2], c:['#ffd84a', '#fff0a0']},
]), 6, 6);
W12_TINT.knightsword = ['#d8e4f8', '#ffffff']; W12_TINT.clarent = ['#ffd84a', '#fff6d0']; W12_TINT.excalibur = ['#7ac8ff', '#e8faff'];
EX('excalibur', 'camelot', {name:'Excalibur', slot:'weapon', kind:'sword', dur:170, dmg:[88, 118], crit:8,
  desc:'Objeto legendario de Camelot. Luz sagrada: cada 3.er golpe lanza una onda de luz que atraviesa en línea a todos los enemigos (70 % del daño).'});
EX('grailcup', 'camelot', {name:'Copa de Avalón', slot:'talisman', gear:false, unique:false, fixed:[{k:'hp', v:40}, {k:'hpreg', v:1}],
  desc:'Objeto legendario de Camelot. Agua de Avalón: cada 30 s cura el 30 % de la vida al héroe y a todas las mascotas.'});
EXCL_LEGENDS.camelot = ['excalibur', 'grailcup']; EXCL_IDS.push('excalibur', 'grailcup');
Object.assign(W12_TINT, {});
Object.assign(ITEMS, {
  knightmedal:   TRz('Medalla de caballero', 'knightmedal', 360, 'Lleva grabado el nombre de un caballero olvidado.'),
  royalseal:     TRz('Sello real', 'royalseal', 300, 'Lacre rojo con el dragón de Pendragón.'),
  roundtablepiece:TRz('Astilla de la Mesa Redonda', 'roundtablepiece', 520, 'Madera de roble que aún guarda la voz de los doce.'),
  merlinbook:    TRz('Libro de Merlín', 'merlinbook', 900, 'Muy extraño: las páginas se pasan solas.'),
  holygrail:     TRz('El Santo Grial', 'holygrail', 1800, 'Muy extraño: está lleno de una luz que nunca se acaba.'),
});
TREASURE_POOL.cam = [{id:'knightmedal', w:8}, {id:'royalseal', w:8}, {id:'roundtablepiece', w:5}, {id:'merlinbook', w:1}, {id:'holygrail', w:.45}];
TREASURE_ZONES.camelot = 'cam';
regLoot('camelot', ['knightsword', 'roundhelm', 'grailtorch'], 3);

// ---------- caballeros, arqueros, hechiceras y sabuesos; Arturo ----------
ORC_CFG.rknight = {human:true, skin:['#f0d8c0', '#d8b898', '#a88868'], hair:['#4a3a2a'], hood:['#8a8e98', '#c8ccd8', '#4a4e58'], tunic:['#2a4a9a', '#4a6ac8', '#1c2a68'], leg:['#1c2a68', '#4a4e58'], weapon:'greatsword', armor:'plate', hat:'helm', tabard:true, pauldron:true, noPaint:true, armW:5};
ORC_CFG.rarcher = {human:true, skin:['#f0d8c0', '#d8b898', '#a88868'], hair:['#6a4a2a'], hood:['#3a6a3a', '#5a9a52', '#1c3a1c'], tunic:['#3a6a3a', '#5a9a52', '#1c3a1c'], leg:['#3a2a1a', '#5a4630'], weapon:'bow', armor:'vest', hat:'feathers', noPaint:true, armW:3};
ORC_CFG.morgana = {human:true, skin:['#f4e8f0', '#d8b8d0', '#a88098'], hair:['#1a1228'], hood:['#4a2a88', '#7a4ac8', '#2a1458'], tunic:['#4a2a88', '#7a4ac8', '#2a1458'], leg:['#2a1458', '#4a2a88'], weapon:'staff', staffCol:['#c890ff', '#ffffff'], armor:'robe', hat:'feathers', noPaint:true, armW:3};
ORC_CFG.arthur = {human:true, gold:true, skin:['#f0d8c0', '#d8b898', '#a88868'], hair:['#c8962e'], hood:['#c8962e', '#ffe08a', '#6a4a10'], tunic:['#2a4a9a', '#4a6ac8', '#1c2a68'], leg:['#1c2a68', '#c8962e'], weapon:'greatsword', armor:'plate', hat:'helm', crown:true, tabard:true, pauldron:true, noPaint:true, armW:6};
for(const [id, k] of [['rknight', 1.1], ['rarcher', 1], ['morgana', 1], ['arthur', 1.9]]){
  const c = ORC_CFG[id];
  regMon(id, {w:Math.round(64*k), h:Math.round(56*k), ax:Math.round(24*k), ay:Math.round(54*k), canvas:f => oScaled(orcCanvas(f, c), k)});
}
regMon('hound', {w:50, h:34, ax:22, ay:32, shapes:f => scl(petQuad(f, {pal:['#5a6a8a', '#8a9ac0', '#c8d4f0', '#f0f4ff'], ears:'pointy', tail:'long', tex:511, dk:'#2a3248', eye:'#60e8ff', legW:2.4,
    extra:lg => [{l:[26 + lg, 13, 29 + lg, 17, 1.4], c:['#f0f4ff', '#ffffff']}]}), 1.3)});
Object.assign(MONSTERS, {
  rknight:{name:'Caballero de la Mesa Redonda', art:'rknight', ai:'walk', hp:1500, dmg:110, spd:80, r:12, xp:190, reach:30, prep:.6, crit:.2, camelot:true},
  rarcher:{name:'Arquero real', art:'rarcher', ai:'archer', hp:560, dmg:84, spd:86, r:9, xp:130, reach:0, prep:.55, range:[170, 280], shot:{kind:'arrow', spd:340, r:3, life:1.3}, camelot:true},
  morgana:{name:'Hechicera de Avalón', art:'morgana', ai:'archer', hp:620, dmg:78, spd:74, r:9, xp:145, reach:0, prep:.75, range:[160, 260], shot:{kind:'bolt', spd:250, r:5, life:1.6, weak:3, slow:2, col:['#4a2a88', '#a860ff', '#f0d8ff']}, camelot:true},
  hound:  {name:'Sabueso espectral', art:'hound', ai:'walk', hp:600, dmg:92, spd:150, r:11, xp:130, reach:20, prep:.35, bleedHit:true, camelot:true},
  arthur: {name:'Arturo, el rey sin descanso', art:'arthur', ai:'brain', brain:'arthur', hp:13500, dmg:118, spd:72, r:30, xp:2600, reach:0, prep:.6, boss:true, uniques:['clarent', 'pridwen', 'arthurcrown', 'camelotplate']},
});
Object.assign(RARE_PREFIX, {rknight:['Lanza Azul', 'Guardián', 'Escudo Real', 'Paladín'], rarcher:['Ojo de Halcón', 'Flecha Real', 'Centinela', 'Montero'], morgana:['Niebla', 'Avalón', 'Hechizo', 'Encantadora'], hound:['Colmillo Pálido', 'Cacería', 'Aullido', 'Jauría'], arthur:['Rey']});
Object.assign(MON_COLORS, {rknight:['#8a8e98', '#4a6ac8', '#ffe08a'], rarcher:['#3a6a3a', '#a07a4a', '#e8e0c8'], morgana:['#7a4ac8', '#c890ff', '#f0d8ff'], hound:['#8a9ac0', '#60e8ff', '#f0f4ff'], arthur:['#c8962e', '#4a6ac8', '#ffe08a']});

// ---------- Arturo: Excalibur (haces de luz), Mesa Redonda, carga de caballería, juicio, espadas del cielo y aliento del dragón ----------
BRAINS.arthur = {wake:'¡Arturo, el rey sin descanso, se alza de su trono!', rage:'¡Arturo invoca al Dragón Rojo de Pendragón!', col:'#ffe08a', chargeSpd:430, keep:60, dust:'#c8c8e0', chargeMul:1.4, p2spd:1.25,
  attacks:[
    {id:'slash', name:'Tajo real', prep:.65, w:28, max:140, warn:118, cast:m => bossSlash(m, 120, .9, 1.4, ['#ffffff', '#ffe08a'])},
    {id:'excal', name:'¡Excalibur!', prep:1, w:22, cast:m => { const n = m.phase2 ? 5 : 3, a0 = angTo(m); for(let i = 0; i < n; i++) bossBeam(m, a0 + (i - (n - 1)/2)*.42, .9, 36, 560, 1.45, '#ffe08a', 'weak'); }},
    {id:'round', name:'Mesa Redonda', prep:1, w:12, warn:150, cast:m => { bossSummon(m, ['rknight', 'rarcher'], 2, 4); ring(m.x, m.y - 20, 120, '#ffe08a', .5); }},
    {id:'cavalry', name:'¡Carga de caballería!', prep:.95, w:16, min:150, cast:m => bossChargeStart(m)},
    {id:'judge', name:'Juicio del rey', prep:1, w:16, warn:120, cast:m => { bossSlam(m, 120, 1.1, '#ffe08a'); bossBarrage(m, 5, .9); }},
    {id:'blades', name:'Lluvia de espadas', prep:1.1, w:16, cast:m => bossRain(m, ['zap', 'boom'], 8, 260, 1)},
    {id:'dragon', name:'Aliento del Dragón Rojo', prep:1.2, w:18, p2:true, cast:m => { const a0 = angTo(m); for(let i = 0; i < 4; i++) bossBeam(m, a0 + i*Math.PI/2, .9, 40, 560, 1.3, '#ff6a3a', 'burn'); for(let i = 0; i < 4; i++) bossBeam(m, a0 + Math.PI/4 + i*Math.PI/2, 1.7, 40, 560, 1.3, '#ff6a3a', 'burn'); }},
    {id:'blink', name:'Paso de Avalón', prep:.5, w:12, p2:true, cast:m => { bossBlink(m, 60); m.aim = angTo(m); bossSlash(m, 120, .9, 1.4, ['#ffffff', '#c8b8ff']); }},
  ]};

// ---------- mascotas de Camelot (arte por formas) ----------
function petDragonX(f, o){
  const wy = f === 1 ? 0 : f === 2 ? 17 : 8, fl = o.fl, bl = o.bel;
  return [ {poly:[[12, 14], [4, 18], [-1, 22], [6, 20], [10, 16]], c:fl.slice(0, 3)}, {poly:[[10, 15], [2, 24], [9, 19]], c:fl.slice(1)},
    {poly:[[14, 11], [8, wy], [22, wy + 1], [20, 11]], c:fl.slice(0, 3)}, {poly:[[14, 12], [10, wy + 4], [21, wy + 5], [19, 12]], c:fl},
    {e:[17, 14, 7, 4.8], c:fl, tex:o.tex}, {e:[18, 16, 4.5, 2.4], c:bl}, {e:[24, 10, 3.8, 3.4], c:fl.slice(1)}, {poly:[[27, 9], [32, 11], [27, 12]], c:fl.slice(1)},
    {poly:[[21, 6], [22, 1], [25, 5]], c:['#fff0c0', '#ffffff']}, {poly:[[24, 6], [27, 2], [28, 7]], c:['#fff0c0', '#ffffff']}, {l:[18, 18, 17, 22, 1], c:'#3a1008'}, {l:[21, 18, 22, 22, 1], c:'#3a1008'},
    {p:[[25, 9, '#ffe84a'], [26, 9, '#101010'], [16, 12, bl[1]], [19, 14, bl[1]]]}, {poly:[[14, 11], [11, wy + 2], [16, wy + 3]], c:fl.slice(2)} ];
}
Object.assign(PET_SHAPES, {
  corcelito: {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#c8ccd8', '#e8ecf4', '#f8faff', '#ffffff'], ears:'round', tail:'long', mane:['#a8b0c8', '#e8ecf4'], tex:521, dk:'#7a8098', legW:1.8})},
  cuervoreal:{w:28, h:20, ax:13, ay:19, fly:true, shapes:f => petBird(f, {pal:['#14161e', '#2a2e3c', '#4a5068', '#6a7090'], tex:531, beak:'#6a6a78'})},
  gatomerlin:{w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#4a3a6a', '#6a5a9a', '#9a8ac8', '#c8b8f0'], ears:'pointy', collar:['#ffd84a', '#fff0a0'], tail:'long', tex:541, dk:'#1c1430', eye:'#ffe84a'})},
  halcon:    {w:28, h:20, ax:13, ay:19, fly:true, shapes:f => petBird(f, {pal:['#6a4a2a', '#a07a4a', '#d0a870', '#f0e0c0'], tex:551, beak:'#ffd84a'})},
  armadillo: {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#7a7a8a', '#a8a8bc', '#d0d0e0', '#f0f0ff'], spots:[[9, 11], [13, 9], [17, 9], [21, 10], [11, 14], [16, 13], [20, 13]], spotCol:'#5a5a68', ears:'round', tail:'short', tex:561, dk:'#3a3a48', legW:2.6})},
  lobopicto: {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#4a5a6a', '#6a8098', '#9ab4cc', '#d0e4f4'], ears:'pointy', tail:'fox', tip:'#d0e4f4', tex:571, dk:'#222c38', eye:'#60e8ff', legW:2.4})},
  unicornio: {w:38, h:27, ax:17, ay:26, glow:'#ffd0ff', shapes:f => petQuad(f, {pal:['#f0e8f8', '#f8f0ff', '#ffffff', '#ffffff'], ears:'round', tail:'long', mane:['#e090e0', '#ffc8ff'], tex:581, dk:'#a898b8', legW:1.8,
              extra:lg => [{poly:[[26 + lg, 5], [29 + lg, -2], [30 + lg, 5]], c:['#ffd84a', '#fff0a0']}]})},
  hadalago:  {w:22, h:18, ax:11, ay:17, fly:true, glow:'#9ad8ff', shapes:f => petMoth(f, {pal:['#2a8ac8', '#5ac0f0', '#a8e8ff', '#ffffff'], glow:'#ffffff'})},
  grifo:     {w:32, h:24, ax:15, ay:23, fly:true, shapes:f => petBird(f, {pal:['#a07a2a', '#d0a840', '#f0d070', '#fff0b0'], tex:591, beak:'#ffd84a'}).concat([{l:[8, 13, 2, 20, 2.4], c:['#a07a2a', '#d0a840']}, {e:[2, 21, 2, 2], c:['#a07a2a', '#d0a840']}])},
  cisne:     {w:30, h:22, ax:14, ay:21, fly:true, glow:'#e8f4ff', shapes:f => petBird(f, {pal:['#e0e8f4', '#f4f8ff', '#ffffff', '#ffffff'], long:true, tex:601})},
  pendragon: {w:34, h:26, ax:15, ay:21, fly:true, glow:'#ff7a3a', shapes:f => petDragonX(f, {fl:['#7a1c1c', '#c0392b', '#ff7a5a', '#ffd0a0'], bel:['#ffd84a', '#fff0a0'], tex:611})},
});
regPets(['corcelito', 'cuervoreal', 'gatomerlin', 'halcon', 'armadillo', 'lobopicto', 'unicornio', 'hadalago', 'grifo', 'cisne', 'pendragon'], {
  corcelito: {exp:'12b', name:'Corcelito', rarity:'normal', look:'Poni blanco de Camelot', beh:'charge', dmg:[10, 14], cd:2.4, miniStun:true, affixes:['veloz'], attack:'Embestida que aturde 0,5 s'},
  cuervoreal:{exp:'12b', name:'Cuervo Real', rarity:'normal', look:'Cuervo del estandarte', beh:'flyer', dmg:[9, 13], cd:.9, affixes:['voladora'], attack:'Picotazos desde el aire'},
  gatomerlin:{exp:'12b', name:'Gato de Merlín', rarity:'normal', look:'Gato del mago', beh:'pounce', dmg:[10, 14], cd:1.4, bites:2, affixes:['agilc'], attack:'Doble zarpazo rápido'},
  halcon:    {exp:'12b', name:'Halcón de Camelot', rarity:'normal', look:'Halcón de caza', beh:'flyer', dmg:[9, 13], cd:.9, affixes:['voladora'], attack:'Picotazos desde el aire'},
  armadillo: {exp:'12b', name:'Escudero', rarity:'normal', look:'Armadillo acorazado', beh:'charge', dmg:[10, 14], cd:2.4, miniStun:true, affixes:['escudera'], attack:'Embestida con el caparazón que aturde 0,5 s'},
  lobopicto: {exp:'12b', name:'Lobo Picto', rarity:'magic', look:'Lobo de las tierras altas', beh:'pounce', dmg:[15, 20], cd:1.6, bites:2, bleed:1, affixes:['cazadora', 'rastreador'], attack:'Doble mordisco con sangrado'},
  unicornio: {exp:'12b', name:'Unicornio de Avalón', rarity:'magic', look:'Unicornio joven', beh:'cone', dmg:[15, 20], cd:2.4, fire:'#ffd0ff', affixes:['curandera', 'sanadora'], attack:'Destello del cuerno en cono'},
  hadalago:  {exp:'12b', name:'Hada del Lago', rarity:'magic', look:'Hada luminosa', beh:'flock', dmg:[15, 20], cd:2.6, dust:true, affixes:['luciernaga', 'sanadora'], attack:'Polvo de hada que ralentiza a los enemigos en área'},
  grifo:     {exp:'12b', name:'Grifo Real', rarity:'rare', look:'Grifo dorado', beh:'flyer', dmg:[26, 34], cd:.85, bleed:1, affixes:['feroz', 'veloz', 'presa', 'valiente'], attack:'Picadas con sangrado desde el aire'},
  cisne:     {exp:'12b', name:'Cisne de Avalón', rarity:'rare', look:'Cisne blanco', beh:'flyer', dmg:[26, 34], cd:.9, affixes:['curandera', 'inspiradora', 'sanadora', 'luna'], attack:'Picotazos desde el aire'},
  pendragon: {exp:'12b', name:'Pendragón', rarity:'legendary', look:'Dragón rojo bebé', beh:'cone', dmg:[28, 36], cd:2.2, fire:'#ff7a3a', legendary:true, bloom:true, skillName:'¡Bendición de Avalón!', affixes:['ignea', 'presa', 'curandera', 'indomable'],
             attack:'Aliento de fuego en cono. Bendición de Avalón cada 24 s: cura el 20 % al héroe y a todas las mascotas'},
}, PET_SHAPES);

// ---------- el mapa: salones de piedra unidos por pasillos ----------
const CAM_STONE = ['#2a2c38', '#32343f', '#3c3e4a', '#464858'];
function buildCamelot(seed){
  return buildRectWorld({id:'camelot', name:'El castillo de Camelot', lvl:12, petExp:'12b', cols:3, rows:4, nodeW:[300, 380], nodeH:[250, 320], boss:{w:600, h:500}, spacingX:480, spacingY:420,
    solid:'wall', darkness:.93, loops:.3, warm:true, lightA:.75, corridor:60,
    floor:(x, y, e) => e ? '#1c1d26' : CAM_STONE[tq(((Math.floor(x/16) + Math.floor(y/16)) & 1)*.25 + vnoise(x/10, y/10, 521)*.4 + hash(x, y, 522)*.25, x, y, 4)],
    void:(x, y, near) => near ? '#14151c' : '#0a0a10',
    groups:[['rknight', 'rarcher'], ['hound', 'hound', 'morgana'], ['rknight', 'morgana'], ['rarcher', 'hound', 'rarcher'], ['rknight', 'rknight', 'morgana']],
    decor:(sc, n, H) => {
      for(const sx of [-1, 1]) for(let i = 0; i < 3; i++){ const x = Math.round(n.x + sx*(n.w/2 - 22)), y = Math.round(n.y - n.h/2 + 50 + i*(n.h - 90)/2); if(H.walk(x, y) && !blocked(sc, x, y, 12)){
        propSprite(sc, ART.pillar, x, y, {t:'c', x, y:y-4, r:8}, [9, 3]); if(i === 1){ sc.lights.push({x, y:y-26, r:120, a:.6, warm:true, flick:.2}); } } }
      const cnt = Math.round(n.w*n.h/20000);
      for(let i = 0; i < cnt; i++){ const p = H.pointOn(n, 14); if(!p) continue; const r = H.R();
        if(r < .4) propSprite(sc, ART.statue, p.x, p.y, {t:'c', x:p.x, y:p.y-4, r:9}, [10, 3]);
        else if(r < .75){ const cd = propSprite(sc, ART.candelabra, p.x, p.y, {t:'c', x:p.x, y:p.y-2, r:5}); cd.draw = function(){ drawSP(ART.candelabra, p.x, p.y); for(const dx of [-5, 0, 5]) drawFlames(p.x + dx, p.y - 26 + (dx ? 2 : 0), .2); }; sc.lights.push({x:p.x, y:p.y-22, r:90, a:.55, warm:true, flick:.25}); }
        else propSprite(sc, ART.bookshelf, p.x, p.y, {t:'r', x:p.x - 15, y:p.y - 8, w:30, h:8}); }
    },
    bossDecor:(sc, n, H) => {
      for(let i = 0; i < 10; i++){ const a = i/10*Math.PI*2, x = Math.round(n.x + Math.cos(a)*(n.w/2 - 42)), y = Math.round(n.y + Math.sin(a)*(n.h/2 - 42)); if(H.walk(x, y) && !blocked(sc, x, y, 14)){ propSprite(sc, ART.pillar, x, y, {t:'c', x, y:y-4, r:8}, [9, 3]); sc.lights.push({x, y:y-24, r:100, a:.6, warm:true, flick:.2}); } }
      sc.lights.push({x:n.x, y:n.y, r:280, a:.5, warm:true, flick:.1});
    }}, seed);
}
RAID_BUILDERS.camelot = buildCamelot;
