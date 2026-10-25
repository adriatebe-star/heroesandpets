'use strict';
// =====================================================================
//  Expedición 12 (portal de Rolecs) · La isla jurásica: dinosaurios, Rex el tirano alfa, ámbar y fósiles.
// =====================================================================
HIDDEN_EXPEDITIONS.push({id:'jurassic', lvl:12, petExp:'12a', hidden:true, viaPortal:true, from:'timehall', mapX:0.03, mapY:-0.2, name:'La isla jurásica', boss:'rex',
  desc:'Una isla que el tiempo olvidó: selva húmeda, ríos de lava lejana y bestias que debieron extinguirse hace millones de años. Rex, el tirano alfa, reina sobre ellas.',
  monsters:'Velocirraptores, dilofosaurios, triceratops y pteranodones. Jefe: Rex'});
iconFrom([
  ['fossilaxe', 'axe', {s:'#e8dcc0', M:'#c8b890', m:'#6a5a3a', b:'#4a3a22', B:'#6a5a3a'}],
  ['scalearmor', 'chestarmor', {L:'#4a7a3a', l:'#8ac060', d:'#1c3a14', s:'#ffd84a'}],
  ['amberlantern', 'atlantern', {b:'#a86418', y:'#ffd070', Y:'#fff0c0'}],
  ['rexfang', 'dagger', {w:'#f4ecd8', s:'#c8b890', r:'#8a5a3a', g:'#a8803a', b:'#3a2618'}],
  ['rexhide', 'chestarmor', {L:'#6a4a22', l:'#a07a3a', d:'#2a1a08', s:'#e8dcc0'}],
  ['rexskull', 'helmet', {L:'#d8ccb0', l:'#f4ecd8', d:'#6a5a3a', s:'#c0392b'}],
  ['rexclaws', 'gloves', {L:'#6a4a22', d:'#2a1a08', s:'#f4ecd8'}],
  ['primalclaw', 'dagger', {w:'#ffe8c0', s:'#ffb347', r:'#c8641a', g:'#ffd84a', b:'#4a2a10'}],
  ['amberheart', 'slimeheart', {G:'#ffb347', g:'#fff0b0'}],
  ['amberbug', 'blackpearl', {B:'#a8641a', b:'#e8a83a', w:'#fff0b0'}],
  ['fossiltooth', 'nacreshell', {W:'#e8dcc0', w:'#f4ecd8', p:'#8a7a52'}],
  ['dinoegg', 'blackpearl', {B:'#d8d0b8', b:'#f0e8d0', w:'#6a8a3a'}],
  ['goldfossil', 'nacreshell', {W:'#ffd84a', w:'#fff0a0', p:'#a87a1a'}],
  ['ambercreature', 'oceanheart', {C:'#ffd070', c:'#c8841a', W:'#ffffff', d:'#6a3a08'}],
]);
ITEMS.fossilaxe = {name:'Hacha de fósil', icon:'fossilaxe', slot:'weapon', kind:'axe', gear:true, dur:140, dmg:[62, 84], bleedChance:.35, value:300,
  desc:'Hoja de piedra tallada en el hueso de una bestia antigua. El 35 % de los golpes provoca sangrado. Solo cae en la isla jurásica.'};
ITEMS.scalearmor = {name:'Coraza de escamas', icon:'scalearmor', slot:'chest', gear:true, armor:16, ov:'jscale', value:280,
  desc:'Escamas de dinosaurio cosidas sobre cuero. Solo cae en la isla jurásica.'};
ITEMS.amberlantern = {name:'Farolillo de ámbar', icon:'amberlantern', slot:'lantern', oilMax:150, oilRegen:1, value:230,
  desc:'Guarda hasta 150 de aceite y regenera 1 por segundo mientras está encendido. Resina de millones de años. Solo cae en la isla jurásica.'};
regOv('jscale', 'chest', {L:'#4a7a3a', l:'#8ac060', d:'#1c3a14'});
// únicos de Rex
Object.assign(ITEMS, {
  rexfang:  {name:'Colmillo de Rex', icon:'rexfang', slot:'weapon', kind:'dagger', gear:true, unique:true, dur:160, dmg:[48, 66], bleedChance:.6, value:260, fixed:[{k:'crit', v:12}],
             desc:'Objeto único de Rex, el tirano alfa. 60 % de probabilidad de provocar sangrado.'},
  rexhide:  {name:'Piel del tirano', icon:'rexhide', slot:'chest', gear:true, unique:true, armor:16, ov:'urexhide', value:260, fixed:[{k:'hp', v:50}, {k:'thorns', v:5}],
             desc:'Objeto único de Rex, el tirano alfa. Cuero grueso que devuelve parte del daño.'},
  rexskull: {name:'Cráneo del tirano', icon:'rexskull', slot:'head', gear:true, unique:true, armor:8, ov:'urexskull', value:260, fixed:[{k:'hp', v:35}, {k:'dmg', v:8}],
             desc:'Objeto único de Rex, el tirano alfa. Una calavera descomunal convertida en yelmo.'},
  rexclaws: {name:'Garras de Rex', icon:'rexclaws', slot:'hands', gear:true, unique:true, armor:4, ov:'urexclaws', value:260, fixed:[{k:'crit', v:10}, {k:'dmg', v:6}],
             desc:'Objeto único de Rex, el tirano alfa. Guantes rematados con zarpas.'},
});
uniqueOv('urexhide', 'chest', {L:'#6a4a22', l:'#a07a3a', d:'#2a1a08'});
uniqueOv('urexskull', 'helmet', {L:'#d8ccb0', l:'#f4ecd8', d:'#6a5a3a'});
uniqueOv('urexclaws', 'glove', {L:'#6a4a22', l:'#a07a3a', d:'#2a1a08'}); uniqueOv('urexclawsBig', 'bigGlove', {L:'#6a4a22', l:'#a07a3a', d:'#2a1a08'});
W12_TINT.rexfang = ['#f4ecd8']; W12_TINT.primalclaw = ['#ffb347'];
// legendarios exclusivos
EX('primalclaw', 'jurassic', {name:'Garra Primigenia', slot:'weapon', kind:'dagger', dur:150, dmg:[56, 74],
  desc:'Objeto legendario de la isla jurásica. Instinto: cada 4.º golpe es crítico seguro y provoca sangrado 8 s.'});
EX('amberheart', 'jurassic', {name:'Corazón de Ámbar', slot:'talisman', gear:false, unique:false, fixed:[{k:'hp', v:50}, {k:'hpreg', v:1}],
  desc:'Objeto legendario de la isla jurásica. Ámbar eterno: si tu vida baja del 30 %, te envuelve un escudo de 120 (cada 40 s).'});
EXCL_LEGENDS.jurassic = ['primalclaw', 'amberheart']; EXCL_IDS.push('primalclaw', 'amberheart');
// tesoros
Object.assign(ITEMS, {
  amberbug:     TRz('Insecto en ámbar', 'amberbug', 340, 'Un mosquito perfecto, atrapado desde hace eras.'),
  fossiltooth:  TRz('Diente fósil', 'fossiltooth', 280, 'Más largo que tu mano.'),
  dinoegg:      TRz('Huevo de dinosaurio', 'dinoegg', 480, 'Está tibio. Mejor no pensar en ello.'),
  goldfossil:   TRz('Fósil dorado', 'goldfossil', 760, 'Muy extraño: un esqueleto entero convertido en oro.'),
  ambercreature:TRz('Ámbar con criatura', 'ambercreature', 1500, 'Muy extraño: dentro algo se mueve muy despacio.'),
});
TREASURE_POOL.jur = [{id:'amberbug', w:8}, {id:'fossiltooth', w:8}, {id:'dinoegg', w:5}, {id:'goldfossil', w:1.1}, {id:'ambercreature', w:.5}];
TREASURE_ZONES.jurassic = 'jur';
regLoot('jurassic', ['fossilaxe', 'scalearmor', 'amberlantern'], 3);

// ---------- arte de dinosaurios ----------
function dinoTheropod(f, o){
  const sw = f === 1 ? 3 : f === 2 ? -3 : 0, c = o.pal, bl = o.belly || c.slice(1), s = [];
  s.push({l:[22, 24, 22 - sw, 36, 3.4], c:c.slice(0, 3)}, {l:[22 - sw, 36, 26 - sw, 38, 2.2], c:c.slice(0, 3)});
  s.push({poly:[[16, 20], [2, 27 + (f === 2 ? 1 : 0)], [4, 30], [20, 26]], c:c.slice(0, 3)});
  s.push({poly:[[12, 22], [16, 12], [30, 9], [40, 13], [39, 24], [22, 29]], c, tex:o.tex});
  s.push({poly:[[22, 24], [39, 23], [36, 27], [24, 29]], c:bl});
  s.push({l:[27, 26, 27 + sw, 37, 4], c}, {l:[27 + sw, 37, 32 + sw, 39, 2.4], c});
  s.push({l:[37, 20, 41, 24, 1.6], c:c.slice(0, 3)});
  s.push({poly:[[35, 12], [40, 4], [47, 2], [56, 6], [57, 12], [48, 13], [40, 18]], c, tex:o.tex + 1});
  s.push({poly:[[47, 12], [57, 12], [55, 16], [46, 15]], c:bl});
  s.push({p:[[50, 10, o.eye || '#ffe84a'], [51, 10, '#101010'], [48, 13, '#ffffff'], [51, 13, '#ffffff'], [54, 13, '#ffffff']]});
  if(o.crest) s.push({poly:[[36, 9], [38, 1], [44, 3], [42, 8]], c:o.crest});
  if(o.sail) s.push({poly:[[14, 12], [18, 0], [24, 3], [28, -1], [34, 9], [28, 10], [20, 10]], c:o.sail});
  if(o.tube) s.push({l:[50, 5, 38, 0, 2.6], c:o.tube});
  if(o.stripes) for(const x of [18, 23, 28, 33]) s.push({l:[x, 11, x - 2, 18, 1], c:o.stripes});
  return s;
}
function dinoTrike(f, o){
  const sw = f === 1 ? 2 : f === 2 ? -2 : 0, c = o.pal, hn = ['#e8e0c8', '#fff8e0'], s = [];
  s.push({l:[16, 22, 16 - sw, 34, 4], c:c.slice(0, 3)}, {l:[34, 22, 34 + sw, 34, 4], c:c.slice(0, 3)});
  s.push({l:[6, 16, 0, 22, 2.2], c:c.slice(0, 3)});
  s.push({poly:[[6, 24], [4, 14], [14, 9], [34, 9], [42, 14], [44, 24], [36, 29], [10, 29]], c, tex:o.tex});
  s.push({l:[12, 22, 12 + sw, 35, 4.4], c}, {l:[40, 22, 40 - sw, 35, 4.4], c});
  s.push({poly:[[40, 8], [46, 2], [54, 4], [58, 14], [54, 24], [44, 24]], c:o.frill, tex:o.tex + 1});
  s.push({e:[49, 16, 7, 6], c}, {poly:[[52, 14], [64, 19], [52, 22]], c:c.slice(1)});
  s.push({poly:[[51, 10], [56, 0], [53, 11]], c:hn}, {poly:[[54, 11], [61, 5], [56, 14]], c:hn}, {poly:[[56, 17], [68, 16], [56, 19]], c:hn});
  s.push({p:[[52, 14, '#ffe84a'], [53, 14, '#101010']]});
  return s;
}
function dinoPtero(f, o){
  const wy = f === 1 ? -6 : f === 2 ? 10 : 2, c = o.pal;
  return [ {poly:[[22, 16], [10, wy + 2], [0, wy + 14], [14, 18]], c:c.slice(0, 3)}, {poly:[[24, 18], [34, 24], [24, 22], [12, 22]], c},
    {e:[26, 18, 8, 4.6], c, tex:o.tex}, {poly:[[30, 15], [36, 10], [46, 12], [58, 15], [46, 16], [36, 18]], c:c.slice(1)}, {poly:[[34, 10], [28, 2], [38, 8]], c:o.crest},
    {poly:[[26, 16], [16, wy], [6, wy + 16], [22, 22]], c}, {p:[[40, 13, '#ffe84a'], [41, 13, '#101010']]} ];
}
const RAPTOR_PAL = ['#2a4a2a', '#4a7a3a', '#8ac060', '#c8f090'], REX_PAL = ['#3a2a14', '#6a4a22', '#a07a3a', '#d8b068'];
regMon('raptor', {w:62, h:42, ax:28, ay:39, shapes:f => dinoTheropod(f, {pal:RAPTOR_PAL, belly:['#c8b060', '#e8d890'], crest:['#c0392b', '#ff7a5a'], stripes:'#1c3a14', tex:301})});
regMon('dilo', {w:62, h:42, ax:28, ay:39, shapes:f => scl(dinoTheropod(f, {pal:['#4a2a6a', '#7a4aa8', '#b080e0', '#e0c8ff'], belly:['#a88848', '#d8c070'], crest:['#ff6a3a', '#ffd23a'], sail:['#ff6a3a', '#ffd23a'], tex:311}), 1)});
regMon('trike', {w:95, h:52, ax:45, ay:47, shapes:f => scl(dinoTrike(f, {pal:['#5a5a3a', '#8a8a52', '#b8b878', '#d8d8a0'], frill:['#8a4a2a', '#c8742a', '#e8a850'], tex:321}), 1.35)});
regMon('ptero', {w:62, h:40, ax:28, ay:30, shapes:f => dinoPtero(f, {pal:['#6a3a2a', '#a8644a', '#d89a7a', '#f0c8a8'], crest:['#c0392b', '#ff7a5a'], tex:331})});
regMon('rex', {w:118, h:82, ax:54, ay:76, shapes:f => scl(dinoTheropod(f, {pal:REX_PAL, belly:['#8a7a50', '#c8b878'], stripes:'#1a1008', eye:'#ff5a2a', tex:341}), 1.9).concat([{e:[96, 21, 3, 2.4], c:'#ff5a2a'}, {p:[[104, 33, '#ffffff'], [108, 33, '#ffffff'], [112, 33, '#ffffff'], [100, 33, '#ffffff']]}])});
Object.assign(MONSTERS, {
  raptor:{name:'Velocirraptor', art:'raptor', ai:'walk', hp:640, dmg:96, spd:128, r:11, xp:130, reach:20, prep:.35, bleedHit:true},
  dilo:  {name:'Dilofosaurio', art:'dilo', ai:'archer', hp:560, dmg:78, spd:84, r:12, xp:140, reach:0, prep:.7, range:[150, 250], shot:{kind:'bolt', spd:250, r:5, life:1.5, poison:true, col:['#1a6a1a', '#4ae04a', '#d8ffd8']}},
  trike: {name:'Triceratops', art:'trike', ai:'walk', hp:2300, dmg:128, spd:74, r:18, xp:260, reach:28, prep:.8, stunHit:true},
  ptero: {name:'Pteranodon', art:'ptero', ai:'float', hp:520, dmg:86, spd:136, r:10, xp:130, reach:16, prep:.45, bleedHit:true},
  rex:   {name:'Rex, el tirano alfa', art:'rex', ai:'brain', brain:'rex', hp:12500, dmg:125, spd:64, r:34, xp:2400, reach:0, prep:.6, boss:true, uniques:['rexfang', 'rexhide', 'rexskull', 'rexclaws']},
});
Object.assign(RARE_PREFIX, {raptor:['Garra Veloz', 'Cazador', 'Sombra Verde', 'Desgarrador'], dilo:['Escupidor', 'Veneno', 'Gola Roja', 'Acechador'], trike:['Tres Cuernos', 'Coloso', 'Arrasador', 'Muro'], ptero:['Cielo Rojo', 'Rapaz', 'Alarido', 'Garra Alada'], rex:['Rey']});
Object.assign(MON_COLORS, {raptor:['#4a7a3a', '#c0392b', '#c8f090'], dilo:['#7a4aa8', '#ff6a3a', '#e0c8ff'], trike:['#8a8a52', '#c8742a', '#e8e0c8'], ptero:['#a8644a', '#c0392b', '#f0c8a8'], rex:['#6a4a22', '#ff5a2a', '#f4ecd8']});

// ---------- Rex: mordisco, pisotón, embestida, rugido, cola; fase 2: meteoritos y salto aplastante ----------
BRAINS.rex = {wake:'¡Rex, el tirano alfa, ha despertado!', rage:'¡Rex ruge y la isla tiembla!', col:'#ffb347', chargeSpd:480, keep:60, dust:'#8a7a48', chargeMul:1.5, p2spd:1.3,
  attacks:[
    {id:'bite', name:'Mordisco', prep:.75, w:30, max:140, warn:110, cast:m => bossSlash(m, 112, .85, 1.5, ['#ffffff', '#ff5a3a'], () => { P.bleedT = Math.max(P.bleedT || 0, 5); })},
    {id:'stomp', name:'Pisotón', prep:1, w:18, warn:125, cast:m => { bossSlam(m, 125, 1.1, '#c8a050'); bossRingBooms(m, 10, 170, .9); }},
    {id:'charge', name:'¡Embestida!', prep:.95, w:16, min:150, cast:m => bossChargeStart(m)},
    {id:'roar', name:'¡Rugido!', prep:1.1, w:12, warn:300, cast:m => { bossSummon(m, ['raptor', 'raptor', 'ptero'], 3, 6); if(Math.hypot(P.x - m.x, P.y - m.y) < 320){ P.weakT = Math.max(P.weakT || 0, 5); addText(P.x, P.y - 62, '¡Debilitado!', '#c8b8ff', 8); } G.shake = Math.max(G.shake, 10); ring(m.x, m.y - 30, 160, '#ffb347', .6); }},
    {id:'tail', name:'Latigazo de cola', prep:.7, w:14, max:160, warn:155, cast:m => { bossSlam(m, 155, 1.25, '#ff9a4a'); }},
    {id:'meteor', name:'¡Meteoritos!', prep:1.1, w:16, p2:true, cast:m => bossRain(m, ['boom'], 9, 280, 1)},
    {id:'leap', name:'¡Salto aplastante!', prep:.8, w:14, p2:true, min:120, cast:m => bossLeap(m, P.x, P.y, .8)},
  ],
  land:m => { bossSlam(m, 135, 1.5, '#ff7a3a'); bossRingBooms(m, 12, 190, .9); }};

// ---------- mascotas de la isla jurásica (arte por formas) ----------
function petDinoShell(f, o){
  const c = o.pal, w = f === 1 ? 1 : f === 2 ? -1 : 0;
  return [ {e:[10, 12, 8, 7], c, tex:o.tex}, {e:[10, 12, 5, 4.5], c:o.ring}, {e:[10, 12, 2.4, 2], c:c.slice(0, 2)}, {l:[12, 18, 9 + w, 22, 1], c:o.body}, {l:[15, 18, 17 - w, 22, 1], c:o.body},
    {l:[8, 18, 4 + w, 21, 1], c:o.body}, {e:[19, 13, 3.4, 3.4], c:o.body}, {p:[[20, 12, '#101010']]} ];
}
function petDragonfly(f, o){
  const up = f === 1 ? -2 : f === 2 ? 3 : 0, c = o.pal;
  return [ {poly:[[14, 9], [4, 5 + up], [2, 9 + up], [14, 11]], c:['#c8f0ff', '#e8faff']}, {poly:[[14, 10], [6, 15 - up], [10, 16 - up], [14, 12]], c:['#c8f0ff', '#e8faff']},
    {poly:[[16, 9], [26, 4 + up], [28, 8 + up], [16, 11]], c:['#a8d8f0', '#d8f4ff']}, {poly:[[16, 10], [24, 15 - up], [20, 16 - up], [16, 12]], c:['#a8d8f0', '#d8f4ff']},
    {l:[16, 10.5, 4, 11.5, 2.2], c:c.slice(0, 3)}, {e:[18, 10.5, 3, 3], c}, {p:[[19, 9, '#ff3030'], [20, 9, '#101010']]}, {l:[7, 11, 4, 11.4, 1], c:o.tip} ];
}
function petStego(f, o){
  const base = petQuad(f, {pal:o.pal, ears:'round', tail:'short', tex:o.tex, dk:o.dk, legW:2.6}), plates = [];
  for(const [x, y] of [[8, 8], [12, 5], [16, 4], [20, 5], [23, 8]]) plates.push({poly:[[x - 2, y + 4], [x, y - 2], [x + 2, y + 4]], c:o.plate});
  return base.concat(plates, [{l:[3, 13, -1, 10, 1.6], c:o.pal.slice(0, 3)}, {l:[3, 13, -1, 14, 1.6], c:o.pal.slice(0, 3)}]);
}
Object.assign(PET_SHAPES, {
  compy:      {w:38, h:27, ax:17, ay:25, shapes:f => scl(dinoTheropod(f, {pal:['#2a7a5a', '#4ab07a', '#8ae0aa', '#d0ffe0'], belly:['#d8e8a0', '#f0f8c8'], crest:['#ff7a3a', '#ffd23a'], tex:351}), .6)},
  libelula:   {w:30, h:20, ax:15, ay:19, fly:true, shapes:f => petDragonfly(f, {pal:['#2a8a9a', '#4ac0c8', '#9af0f0', '#e8ffff'], tip:'#2a8a9a'})},
  amonita:    {w:26, h:24, ax:12, ay:23, shapes:f => petDinoShell(f, {pal:['#8a5a2a', '#c8884a', '#e8b878', '#fff0c8'], ring:['#a8703a', '#e8b878'], body:['#c8a888', '#e8d0b8'], tex:361})},
  estegui:    {w:38, h:25, ax:17, ay:24, shapes:f => petStego(f, {pal:['#4a6a3a', '#7a9a52', '#a8c878', '#d0e8a0'], plate:['#c8742a', '#ff9a4a'], tex:371, dk:'#1c2a14'})},
  pteri:      {w:30, h:22, ax:14, ay:21, fly:true, shapes:f => petBird(f, {pal:['#a8644a', '#d89a7a', '#f0c8a8', '#fff0e0'], long:true, tex:381})},
  anquilo:    {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#5a5a4a', '#8a8a6a', '#b8b890', '#d8d8b0'], spots:[[10, 11], [14, 9], [18, 10], [22, 11], [12, 14], [18, 13]], spotCol:'#e8e0c0', ears:'round', tail:'lion', mane:['#8a8a6a', '#c8c8a0'], tex:391, dk:'#2a2a1c', legW:2.8})},
  raptorcria: {w:40, h:28, ax:18, ay:26, shapes:f => scl(dinoTheropod(f, {pal:RAPTOR_PAL, belly:['#c8b060', '#e8d890'], crest:['#c0392b', '#ff7a5a'], stripes:'#1c3a14', tex:401}), .65)},
  tricerito:  {w:44, h:25, ax:20, ay:23, shapes:f => scl(dinoTrike(f, {pal:['#6a4a3a', '#a07a5a', '#d0a888', '#f0d0b0'], frill:['#a83a2a', '#e86a3a', '#ffa860'], tex:411}), .62)},
  espino:     {w:48, h:33, ax:22, ay:31, shapes:f => scl(dinoTheropod(f, {pal:['#2a5a6a', '#4a8aa0', '#8ac8d8', '#d0f0f8'], belly:['#d8e0c0', '#f0f4d8'], sail:['#c0392b', '#ff7a5a'], tex:421}), .78)},
  parasauro:  {w:48, h:33, ax:22, ay:31, shapes:f => scl(dinoTheropod(f, {pal:['#7a4a8a', '#a878c0', '#d0a8e8', '#f0d8ff'], belly:['#e8d8a0', '#f8f0c8'], tube:['#ffb347', '#ffe08a'], tex:431}), .78)},
  rexito:     {w:58, h:40, ax:27, ay:38, glow:'#ffb347', shapes:f => scl(dinoTheropod(f, {pal:['#6a4a1c', '#b07a2a', '#e8b050', '#fff0a0'], belly:['#d8b878', '#f4e0a8'], stripes:'#2a1a08', eye:'#ff5a2a', tex:441}), .95)},
});
regPets(['compy', 'libelula', 'amonita', 'estegui', 'pteri', 'anquilo', 'raptorcria', 'tricerito', 'espino', 'parasauro', 'rexito'], {
  compy:     {exp:'12a', name:'Compy', rarity:'normal', look:'Pequeño dinosaurio ágil', beh:'pounce', dmg:[10, 14], cd:1.3, bites:2, affixes:['agilc'], attack:'Doble mordisco rápido'},
  libelula:  {exp:'12a', name:'Libélula Gigante', rarity:'normal', look:'Libélula del Jurásico', beh:'flyer', dmg:[9, 13], cd:.9, affixes:['ligera'], attack:'Picotazos desde el aire'},
  amonita:   {exp:'12a', name:'Amonita', rarity:'normal', look:'Molusco de concha en espiral', beh:'ranged', proj:'splash', dmg:[9, 13], cd:1.7, affixes:['dura'], attack:'Escupe burbujas a distancia'},
  estegui:   {exp:'12a', name:'Estegui', rarity:'normal', look:'Cría de estegosaurio', beh:'charge', dmg:[10, 14], cd:2.4, miniStun:true, affixes:['robusta'], attack:'Embestida que aturde 0,5 s'},
  pteri:     {exp:'12a', name:'Pteri', rarity:'normal', look:'Cría de pterodáctilo', beh:'flyer', dmg:[9, 13], cd:.9, affixes:['sanadora'], attack:'Picotazos desde el aire'},
  anquilo:   {exp:'12a', name:'Anquilo', rarity:'magic', look:'Cría de anquilosaurio', beh:'charge', dmg:[15, 20], cd:2.6, miniStun:true, knock:true, affixes:['resiliente', 'espinosa'], attack:'Maza de cola que empuja y aturde'},
  raptorcria:{exp:'12a', name:'Rapi', rarity:'magic', look:'Cría de velocirraptor', beh:'pounce', dmg:[15, 20], cd:1.5, bites:2, bleed:1, affixes:['sangrienta', 'agilc'], attack:'Doble zarpazo con sangrado'},
  tricerito: {exp:'12a', name:'Tricerito', rarity:'magic', look:'Cría de triceratops', beh:'charge', dmg:[15, 20], cd:2.4, miniStun:true, affixes:['resiliente', 'valiente'], attack:'Cornada que aturde 0,5 s'},
  espino:    {exp:'12a', name:'Espino', rarity:'rare', look:'Cría de espinosaurio', beh:'pounce', dmg:[26, 34], cd:1.8, bites:2, bleed:1, affixes:['feroz', 'cazadora', 'vampirica', 'veloz'], attack:'Doble mordisco con sangrado'},
  parasauro: {exp:'12a', name:'Parasauro', rarity:'rare', look:'Parasaurolophus joven', beh:'cone', dmg:[26, 34], cd:2.6, fire:'#ffe08a', affixes:['presa', 'curandera', 'inspiradora', 'valiente'], attack:'Bramido sónico en cono que a veces aturde'},
  rexito:    {exp:'12a', name:'Rexito', rarity:'legendary', look:'T-Rex bebé', beh:'pounce', dmg:[28, 36], cd:1.8, bites:2, bleed:1, legendary:true, warcry:true, skillName:'¡Rugido primigenio!', affixes:['feroz', 'dura', 'temible', 'indomable'],
             attack:'Doble mordisco con sangrado. Rugido primigenio cada 20 s: los enemigos cercanos huyen 3 s y haces +25 % de daño 5 s'},
}, PET_SHAPES);

// ---------- el mapa: archipiélago tropical de islas irregulares unidas por senderos ----------
const JUN = ['#2a6a2a', '#318032', '#3a9238', '#46a642'], JUN_DIRT = ['#9a8450', '#aa9460', '#b8a46c'], JUN_SEA = ['#0e4a5a', '#12607a', '#1a7a96', '#2a98b0'];
// palmeras, helechos, arbustos con flores y hojas grandes
const PALM_G = ['#14502a', '#1f7a36', '#3aa84a', '#7ae070'], PALM_T = ['#4a2e14', '#7a5028', '#a87a40'];
function palmShapes(lean){
  const T = [27 + lean, 20], s = [];
  s.push({l:[22, 60, 23 + lean/2, 44, 3.6], c:PALM_T}, {l:[23 + lean/2, 44, 25 + lean, 30, 3], c:PALM_T}, {l:[25 + lean, 30, T[0], T[1], 2.6], c:PALM_T});
  for(let i = 0; i < 8; i++){ const a = Math.PI + i*Math.PI/7, mx = T[0] + Math.cos(a)*12, my = T[1] + Math.sin(a)*8 - 3, tx = T[0] + Math.cos(a)*22, ty = T[1] + Math.sin(a)*9 + 10;
    s.push({l:[T[0], T[1], mx, my, 2.8], c:PALM_G}, {l:[mx, my, tx, ty, 2.2], c:PALM_G}); }
  s.push({e:[T[0] - 2, T[1] + 2, 2.4, 2.4], c:['#5a3a14', '#8a5a24']}, {e:[T[0] + 2, T[1] + 3, 2.4, 2.4], c:['#5a3a14', '#8a5a24']});
  return s;
}
const SPR_PALM = [SP(paintSprite(54, 62, palmShapes(-3)), 25, 60), SP(paintSprite(54, 62, palmShapes(4)), 27, 60), SP(paintSprite(54, 62, palmShapes(0)), 26, 60)];
const SPR_FERN = SP(paintSprite(28, 18, (() => { const s = []; for(let i = 0; i < 8; i++){ const a = -Math.PI + .35 + i*(Math.PI - .7)/7, tx = 14 + Math.cos(a)*13, ty = 16 + Math.sin(a)*13; s.push({l:[14, 16, tx, ty, 1.8], c:['#1c5a2a', '#2f8a3a', '#5ac85a']}); } return s; })()), 14, 16);
const SPR_FLOWERS = SP(paintSprite(24, 16, [{e:[12, 10, 10, 6], c:['#1c5a2a', '#2f8a3a', '#5ac85a'], tex:611}, {p:[[6, 6, '#ff5a8a'], [7, 6, '#ff8aaa'], [12, 4, '#ffd23a'], [13, 4, '#fff08a'], [17, 7, '#ff6a3a'], [10, 8, '#ff5a8a'], [16, 10, '#ffffff'], [5, 10, '#ffd23a']]}]), 12, 14);
const SPR_LEAF = SP(paintSprite(30, 24, [{poly:[[15, 22], [3, 10], [8, 2], [15, 8]], c:['#1c6a2a', '#2f9a3a', '#5ad85a']}, {poly:[[15, 22], [27, 10], [22, 2], [15, 8]], c:['#1c6a2a', '#2f9a3a', '#5ad85a']}, {poly:[[15, 22], [7, 20], [3, 14], [12, 14]], c:['#14502a', '#1f7a36', '#3aa84a']}, {poly:[[15, 22], [23, 20], [27, 14], [18, 14]], c:['#14502a', '#1f7a36', '#3aa84a']}, {l:[15, 22, 15, 6, .8], c:'#7ae070'}]), 15, 22);
function buildJurassic(seed){
  const sc = buildRectWorld({id:'jurassic', name:'La isla jurásica', lvl:12, petExp:'12a', cols:3, rows:4, nodeW:[320, 400], nodeH:[270, 340], boss:{w:640, h:520}, spacingX:500, spacingY:440, organic:true,
    solid:'water', darkness:.88, loops:.35, warm:true, lightA:.75, corridor:60,
    floor:(x, y, e) => e ? JUN_DIRT[tq(hash(x, y, 51), x, y, 3)] : JUN[tq(vnoise(x/16, y/16, 501)*.6 + vnoise(x/5, y/5, 502)*.3 + hash(x, y, 503)*.2, x, y, 4)],
    void:(x, y, near) => near ? '#e0cf94' : JUN_SEA[tq(vnoise(x/14, y/14, 505)*.7 + hash(x, y, 506)*.3, x, y, 4)],
    groups:[['raptor', 'raptor', 'ptero'], ['dilo', 'raptor'], ['trike', 'dilo'], ['ptero', 'raptor', 'dilo'], ['trike', 'raptor']],
    decor:(sc, n, H) => {
      const cnt = Math.round(n.w*n.h/7200);
      for(let i = 0; i < cnt; i++){
        const p = H.pointOn(n, 12); if(!p) continue; const r = H.R();
        if(r < .16) propSprite(sc, SPR_PALM[Math.floor(H.R()*3)], p.x, p.y, {t:'c', x:p.x, y:p.y - 2, r:5}, [11, 3]);
        else if(r < .2) propTree(sc, p.x, p.y, Math.floor(H.R()*1e6));
        else if(r < .42) propSprite(sc, SPR_FERN, p.x, p.y, null);
        else if(r < .62) propSprite(sc, SPR_FLOWERS, p.x, p.y, null);
        else if(r < .78) propSprite(sc, SPR_LEAF, p.x, p.y, null);
        else if(r < .86) propBush(sc, p.x, p.y, Math.floor(H.R()*1e6));
        else if(r < .9) propRock(sc, p.x, p.y, Math.floor(H.R()*1e6));
        else if(r < .96) propSprite(sc, ART.bones, p.x, p.y, null);
        else propGlowshroom(sc, p.x, p.y);
      }
    },
    bossDecor:(sc, n, H) => {   // la arena de Rex va despejada: solo calaveras y plantas sin colisión
      for(let i = 0; i < 16; i++){ const a = i/16*Math.PI*2, x = Math.round(n.x + Math.cos(a)*(n.w/2 - 40)), y = Math.round(n.y + Math.sin(a)*(n.h/2 - 40)); if(H.walk(x, y)) i % 3 ? propSprite(sc, SPR_FERN, x, y, null) : propSprite(sc, ART.skullpile, x, y, null); }
    }}, seed);
  return sc;
}
RAID_BUILDERS.jurassic = buildJurassic;
