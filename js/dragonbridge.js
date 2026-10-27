'use strict';
// =====================================================================
//  Expedición 14 · El puente de los dragones (tras el pueblo del norte): un puente de piedra sobre el abismo, vigilado por los caballeros
//  del dragón (que se transforman en dragones a media vida), y al final la cueva de los tres hermanos drakonianos (fuego, hielo y rayo),
//  que al morir resucitan como dragones. Misión de Alexandra: «Atraviesa el puente».
//  Los objetos de escamas de dragón SOLO caen en esta expedición (no están en el botín general ni en Trapis).
// =====================================================================
EXPEDITIONS.push({id:'dragonbridge', from:'northvillage', prevLvl:13, lvl:14, name:'El puente de los dragones', mapX:.93, mapY:-.1, boss:'ignis',
  desc:'Un puente de piedra tendido sobre un abismo sin fondo. Al final del camino se abre la cueva donde los dragones guardan sus tesoros, protegida por los tres hermanos drakonianos.',
  monsters:'Caballeros del dragón (guerreros, arqueros, magos de chispas y paladines) y dragones de tierra, aire, rayo y luz. Jefes: los hermanos drakonianos Ignis, Glacius y Voltus'});
QUEST_OF.dragonbridge = 'bridge';
QUESTS.push({id:'bridge', giver:'alexandra', exp:'dragonbridge', title:'Atraviesa el puente',
  offer:['¿Tienes la llave del puente de los dragones? Entonces cruza: más allá del abismo hay una cueva donde los dragones esconden sus tesoros.', 'Atraviesa el puente y llega hasta la cueva de los dragones. Los tres hermanos drakonianos la guardan, y dicen que al morir resucitan como dragones.', 'Si lo consigues te daré 25.000 de oro.'],
  met:() => !!G.save.bridgeCave, obj:() => ['Atraviesa el puente de los dragones', 'y llega hasta la cueva donde', 'esconden los tesoros', G.save.bridgeCave ? '✔ Has llegado: vuelve con Alexandra' : '✘ Aún no has llegado a la cueva'],
  ready:['¡Lo has hecho! Has llegado a la cueva de los dragones.', 'Aquí tienes tus 25.000 de oro. Te los has ganado.'],
  reward:() => { G.save.wallet += 25000; toast('+25.000 de oro (guardados en la guarida)', 4.5); sfx('coin'); }});

// ---------- iconos y aspecto ----------
const DS = {L:'#a83a2a', l:'#ffb070', d:'#4a1410', s:'#ffd84a'};
iconFrom([
  ['dssword', 'sword', {w:'#ffd0b0', s:'#c8502a', r:'#ffb070', g:'#ffd84a', b:'#4a1410'}],
  ['dsbow', 'bow', {B:'#c8502a', b:'#4a1410', w:'#ffd8b0'}],
  ['dsshield', 'ironshield', {m:'#4a1410', M:'#ffb070', i:'#a83a2a', I:'#d86a3a', g:'#ffd84a'}],
  ['dshelm', 'helmet', DS], ['dsmail', 'chestarmor', DS], ['dsgloves', 'gloves', {L:DS.L, d:DS.d, s:DS.s}], ['dsboots', 'boots', DS],
  ['drgclaw', 'sword', {w:'#fff0c0', s:'#ff7a3a', r:'#8a1c1c', g:'#ffd84a', b:'#3a0a08'}],
  ['drgaegis', 'aegis', {m:'#4a1410', M:'#ffd84a', i:'#c83a2a', I:'#ff9a5a', g:'#ffffff'}],
  ['drgcrest', 'helmet', {L:'#c8962e', l:'#ffe08a', d:'#6a1c10', s:'#ff4a2a'}],
  ['drgboots', 'boots', {L:'#c8962e', l:'#ffe08a', d:'#6a1c10', s:'#ff4a2a'}],
  ['primalscale', 'chestarmor', {L:'#e8b84a', l:'#fff4c0', d:'#7a3a10', s:'#ff4a2a'}],
  ['dragonlance', 'trident', {W:'#ffb070', w:'#fff0d0', B:'#4a1410'}],
  ['dragonheart', 'oceanheart', {C:'#ff9a3a', c:'#c8301a', W:'#fff0a0', d:'#5a1008'}],
  ['ignisblade', 'sword', {w:'#ffe0a0', s:'#ff5a1a', r:'#c8301a', g:'#ffd84a', b:'#3a0a08'}],
  ['glaciusshield', 'aegis', {m:'#16406a', M:'#e8faff', i:'#4a90d0', I:'#9ad8ff', g:'#ffffff'}],
  ['voltusbow', 'bow', {B:'#ffe84a', b:'#5a3ac0', w:'#ffffff'}],
  ['dragonfang', 'nacreshell', {W:'#f4ecd8', w:'#ffffff', p:'#8a7a5a'}],
  ['goldscale', 'blackpearl', {B:'#c8962e', b:'#ffe08a', w:'#ffffff'}],
  ['dragonclaw', 'goldanchor', {G:'#e8b84a', g:'#7a4a10'}],
  ['fossilegg', 'tidecompass', {G:'#8a7a5a', g:'#4a3a24', w:'#ffe0a0', R:'#c8a060', N:'#ff7a3a'}],
  ['lavaheart', 'oceanheart', {C:'#ffb04a', c:'#d83a1a', W:'#fff0a0', d:'#4a0c08'}],
]);
regOv('dshelm', 'helmet', DS); regOv('dsmail', 'chest', DS); regOv('dsboot', 'boot', Object.assign({}, DS, {d:'#3a1008'})); regOv('dsglove', 'glove', DS); regOv('dsgloveBig', 'bigGlove', DS);
uniqueOv('udrgcrest', 'urrhelm', {L:'#c8962e', l:'#ffe08a', d:'#6a1c10'}); uniqueOv('udrgboot', 'boot', {L:'#c8962e', l:'#ffe08a', d:'#6a1c10'}); uniqueOv('uprimal', 'chest', {L:'#e8b84a', l:'#fff4c0', d:'#7a3a10'});
const dsArt = (a, b, c, g1) => SP(paintSprite(12, 13, [{poly:[[0, 0], [12, 0], [12, 6], [6, 13], [0, 6]], c:a}, {poly:[[2, 2], [10, 2], [10, 6], [6, 10], [2, 6]], c:b, tex:96}, {e:[6, 5, 1.6, 1.6], c:c}, {p:[[6, 8, g1]]}]), 6, 6);
ART.dsshield = dsArt(['#4a1410', '#a83a2a', '#ffb070'], ['#2a0a08', '#6a1c10', '#a83a2a'], ['#8a6420', '#ffd84a', '#ffffff'], '#ffd84a');
ART.drgaegis = dsArt(['#6a1c10', '#c8962e', '#ffe08a'], ['#3a0a08', '#8a2a1a', '#c83a2a'], ['#ff4a2a', '#ffd84a', '#ffffff'], '#ffffff');
ART.glacius = dsArt(['#16406a', '#4a90d0', '#e8faff'], ['#0a2a4a', '#2a6aa8', '#7ac8f0'], ['#7ac8ff', '#d0f4ff', '#ffffff'], '#ffffff');
Object.assign(W12_TINT, {dssword:['#e8a070', '#ffe0c0'], dsbow:['#c8502a', '#ffd8b0'], drgclaw:['#ff7a3a', '#fff0c0'], dragonlance:['#ffb070', '#fff0d0'], ignisblade:['#ff5a1a', '#ffe0a0'], voltusbow:['#ffe84a', '#ffffff']});

// ---------- objetos de escamas (solo caen aquí), únicos de los hermanos y legendarios ----------
Object.assign(ITEMS, {
  dssword:  {name:'Espada de escamas', icon:'dssword', slot:'weapon', kind:'sword', gear:true, dur:180, dmg:[100, 132], value:520, desc:'Hoja forjada con escamas de dragón. Solo cae en las zonas de dragones.'},
  dsbow:    {name:'Arco de escamas', icon:'dsbow', slot:'weapon', kind:'bow', gear:true, dur:150, dmg:[92, 122], crit:8, value:500, desc:'Arco reforzado con escamas de dragón: +8 % de crítico. Usa flechas. Solo cae en las zonas de dragones.'},
  dsshield: {name:'Escudo de escamas', icon:'dsshield', slot:'shield', gear:true, dur:150, armor:12, block:.88, shieldArt:'dsshield', value:480, desc:'Escudo de escamas de dragón: bloquea el 88 % del daño frontal. Solo cae en las zonas de dragones.'},
  dshelm:   {name:'Yelmo de escamas', icon:'dshelm', slot:'head', gear:true, armor:14, move:-3, ov:'dshelm', value:440, desc:'Yelmo de escamas de dragón. Solo cae en las zonas de dragones.'},
  dsmail:   {name:'Coraza de escamas', icon:'dsmail', slot:'chest', gear:true, armor:26, move:-6, ov:'dsmail', value:620, desc:'Coraza de escamas de dragón: protección enorme, −6 % de velocidad. Solo cae en las zonas de dragones.'},
  dsgloves: {name:'Guanteletes de escamas', icon:'dsgloves', slot:'hands', gear:true, armor:8, move:-2, ov:'dsglove', dmgFist:6, value:400, desc:'Guanteletes de escamas de dragón. Solo caen en las zonas de dragones.'},
  dsboots:  {name:'Botas de escamas', icon:'dsboots', slot:'feet', gear:true, armor:8, move:-2, ov:'dsboot', value:400, desc:'Botas de escamas de dragón. Solo caen en las zonas de dragones.'},
  drgclaw:  {name:'Garra del Rey Dragón', icon:'drgclaw', slot:'weapon', kind:'sword', gear:true, unique:true, dur:200, dmg:[118, 152], burnChance:.5, value:560, fixed:[{k:'dmg', v:10}, {k:'crit', v:10}], desc:'Objeto legendario de los hermanos drakonianos. El 50 % de los golpes quema al enemigo.'},
  drgaegis: {name:'Égida de escamas ancestrales', icon:'drgaegis', slot:'shield', gear:true, unique:true, dur:200, armor:14, block:.92, shieldArt:'drgaegis', value:560, fixed:[{k:'hp', v:50}, {k:'eleres', v:20}], desc:'Objeto legendario de los hermanos drakonianos. Bloquea el 92 % del daño frontal.'},
  drgcrest: {name:'Cresta del Rey Dragón', icon:'drgcrest', slot:'head', gear:true, unique:true, armor:18, ov:'udrgcrest', value:560, fixed:[{k:'hp', v:60}, {k:'crit', v:8}], desc:'Objeto legendario de los hermanos drakonianos. Una cresta de dragón de oro y brasas.'},
  drgboots: {name:'Botas de escamas ancestrales', icon:'drgboots', slot:'feet', gear:true, unique:true, armor:10, move:12, ov:'udrgboot', value:560, fixed:[{k:'hp', v:45}, {k:'stam', v:30}], desc:'Objeto legendario de los hermanos drakonianos. Cada paso levanta ceniza caliente.'},
  dragonheart:{name:'Corazón de Dragón', icon:'dragonheart', slot:'talisman', legend:true, lvl:14, value:600, fixed:[{k:'hp', v:60}, {k:'hpreg', v:2}],
               desc:'Objeto legendario. Rugido: cada 30 s aturde 1,5 s a los enemigos cercanos y haces +25 % de daño durante 6 s.'},
});
EX('primalscale', 'dragonbridge', {name:'Escama del Dragón Primigenio', slot:'chest', armor:22, ov:'uprimal', value:560, fixed:[{k:'hp', v:50}, {k:'eleres', v:20}],
  desc:'Objeto legendario del puente de los dragones. Reduce un 20 % el daño de fuego, hielo y rayo.'});
EX('dragonlance', 'dragonbridge', {name:'Lanza Dracónica', slot:'weapon', kind:'trident', dur:200, dmg:[96, 128], value:560,
  desc:'Objeto legendario del puente de los dragones. Aliento: cada 4.º golpe lanza un aliento elemental en cono que alterna fuego, hielo y rayo.'});
EX('ignisblade', 'dragonbridge', {name:'Hoja de Ignis', slot:'weapon', kind:'sword', dur:200, dmg:[112, 148], value:560,
  desc:'Objeto legendario de Ignis, el dragón de fuego. El 50 % de los golpes quema y el 25 % deja un charco de fuego bajo el enemigo.'});
EX('glaciusshield', 'dragonbridge', {name:'Escudo de Glacius', slot:'shield', dur:220, armor:14, block:.9, shieldArt:'glacius', fixed:[{k:'hp', v:50}], value:560,
  desc:'Objeto legendario de Glacius, el dragón de hielo. Bloquea el 90 % del daño frontal y el 35 % de los golpes bloqueados congela al atacante 1,5 s.'});
EX('voltusbow', 'dragonbridge', {name:'Arco de Voltus', slot:'weapon', kind:'bow', dur:170, dmg:[100, 134], crit:10, value:560,
  desc:'Objeto legendario de Voltus, el dragón de rayo. Cada flecha encadena un rayo a hasta 2 enemigos más (50 % del daño). Usa flechas.'});
EXCL_LEGENDS.dragonbridge = ['primalscale', 'dragonlance']; EXCL_IDS.push('primalscale', 'dragonlance', 'ignisblade', 'glaciusshield', 'voltusbow');
EXCL_LOOT_EXTRA.dragonbridge = ['ignisblade', 'glaciusshield', 'voltusbow'];
LEGEND_IDS.push('dragonheart');
Object.assign(ITEMS, {
  dragonfang: TRz('Colmillo de dragón', 'dragonfang', 420, 'Todavía está caliente.'),
  goldscale:  TRz('Escama dorada de dragón', 'goldscale', 340, 'Pesa como un lingote.'),
  dragonclaw: TRz('Garra de oro', 'dragonclaw', 520, 'Una garra de dragón recubierta de oro.'),
  fossilegg:  TRz('Huevo fosilizado', 'fossilegg', 1100, 'Muy extraño: algo se mueve dentro.'),
  lavaheart:  TRz('Corazón de lava', 'lavaheart', 2400, 'Muy extraño: late y quema al tocarlo.'),
});
TREASURE_POOL.drg = [{id:'dragonfang', w:8}, {id:'goldscale', w:8}, {id:'dragonclaw', w:5}, {id:'fossilegg', w:1}, {id:'lavaheart', w:.45}];
TREASURE_ZONES.dragonbridge = 'drg';
regLoot('dragonbridge', ['dssword', 'dsbow', 'dsshield', 'dshelm', 'dsmail', 'dsgloves', 'dsboots'], 2.2);

// ---------- caballeros del dragón, dragones y hermanos drakonianos ----------
const KNIGHT_SKIN = ['#f0d8c0', '#d8b898', '#a88868'];
ORC_CFG.dknight = {human:true, skin:KNIGHT_SKIN, hair:['#2a1a10'], hood:['#7a1c1c', '#c83a3a', '#3a0a0a'], tunic:['#5a1a14', '#a83a2a', '#2a0a08'], leg:['#2a0a08', '#5a1a14'], weapon:'greatsword', armor:'plate', hat:'helm', tabard:true, pauldron:true, noPaint:true, armW:5};
ORC_CFG.dkarcher = {human:true, skin:KNIGHT_SKIN, hair:['#2a1a10'], hood:['#5a1a1a', '#9a3a2a', '#2a0a0a'], tunic:['#5a2a1a', '#9a4a2a', '#2a1208'], leg:['#2a1208', '#4a2a18'], weapon:'bow', armor:'vest', hat:'feathers', noPaint:true, armW:3};
ORC_CFG.dkmage = {human:true, skin:KNIGHT_SKIN, hair:['#1a1228'], hood:['#6a2a14', '#c8641a', '#2a1008'], tunic:['#6a2a14', '#e8a020', '#2a1008'], leg:['#2a1008', '#6a2a14'], weapon:'staff', staffCol:['#ffe84a', '#ffffff'], armor:'robe', hat:'feathers', noPaint:true, armW:3};
ORC_CFG.dkpaladin = {human:true, skin:KNIGHT_SKIN, hair:['#c8962e'], hood:['#d8d4c0', '#ffffff', '#8a8670'], tunic:['#e8c850', '#fff0a0', '#8a6a1a'], leg:['#8a6a1a', '#d8d4c0'], weapon:'hammer', armor:'plate', hat:'helm', tabard:true, pauldron:true, noPaint:true, armW:5};
ORC_CFG.ignis = {human:true, skin:['#e0643a', '#b8401a', '#7a2208'], hair:['#ffd84a'], hood:['#5a1008', '#b82a14', '#2a0804'], tunic:['#7a1c10', '#d84a22', '#3a0e08'], leg:['#3a0e08', '#7a1c10'], weapon:'greatsword', armor:'plate', hat:'helm', crown:true, pauldron:true, noPaint:true, armW:6};
ORC_CFG.glacius = {human:true, skin:['#9ad0f0', '#5a9ac8', '#2a5a88'], hair:['#ffffff'], hood:['#16406a', '#4a90d0', '#0a2040'], tunic:['#1c4a7a', '#7ac0e8', '#0e2a4a'], leg:['#0e2a4a', '#1c4a7a'], weapon:'hammer', armor:'plate', hat:'helm', crown:true, pauldron:true, noPaint:true, armW:6};
ORC_CFG.voltus = {human:true, skin:['#a898e0', '#7a68b8', '#4a3a88'], hair:['#ffe84a'], hood:['#2a1a5a', '#5a3ac0', '#140a30'], tunic:['#3a2a7a', '#e8c820', '#1a1040'], leg:['#1a1040', '#3a2a7a'], weapon:'staff', staffCol:['#ffe84a', '#ffffff'], armor:'plate', hat:'helm', crown:true, pauldron:true, noPaint:true, armW:6};
for(const [id, k] of [['dknight', 1.12], ['dkarcher', 1], ['dkmage', 1], ['dkpaladin', 1.12], ['ignis', 1.8], ['glacius', 1.8], ['voltus', 1.8]]){
  const c = ORC_CFG[id]; regMon(id, {w:Math.round(64*k), h:Math.round(56*k), ax:Math.round(24*k), ay:Math.round(54*k), canvas:f => oScaled(orcCanvas(f, c), k)});
}
const DRG_PAL = {
  earth:{fl:['#3a2a14', '#6a4a24', '#a07a44', '#d8b878'], bel:['#c8a860', '#e8d098']}, air:{fl:['#5a7a98', '#9ac0e0', '#d8f0ff', '#ffffff'], bel:['#ffffff', '#e8f8ff']},
  elec:{fl:['#6a5a10', '#c8a820', '#ffe84a', '#fffbd0'], bel:['#a860ff', '#e0c0ff']}, light:{fl:['#a89040', '#e8d070', '#fff4b0', '#ffffff'], bel:['#ffffff', '#fff8d8']},
  fire:{fl:['#5a1008', '#b82a14', '#ff5a2a', '#ffc07a'], bel:['#ffd84a', '#fff0a0']}, ice:{fl:['#1c4a7a', '#4a90d0', '#9ad8ff', '#e8faff'], bel:['#ffffff', '#c8f0ff']},
  thunder:{fl:['#2a1a5a', '#5a3ac0', '#ffe84a', '#fffbd0'], bel:['#ffe84a', '#fffbd0']},
};
for(const [id, el, k, tex] of [['dgearth', 'earth', 2.5, 701], ['dgair', 'air', 2.4, 702], ['dgelec', 'elec', 2.4, 703], ['dglight', 'light', 2.5, 704], ['ignisdr', 'fire', 3.4, 705], ['glaciusdr', 'ice', 3.4, 706], ['voltusdr', 'thunder', 3.4, 707]]){
  regMon(id, {w:Math.round(34*k), h:Math.round(26*k), ax:Math.round(15*k), ay:Math.round(21*k), shapes:f => scl(petDragonX(f, Object.assign({tex}, DRG_PAL[el])), k)});
}
const BOLT = {fire:['#a01808', '#ff7a2a', '#fff0a0'], ice:['#2a6aa8', '#9ad8ff', '#ffffff'], elec:['#8a6a00', '#ffe84a', '#ffffff'], wind:['#6a8aa8', '#d8f0ff', '#ffffff'], light:['#a89040', '#fff4b0', '#ffffff']};
Object.assign(MONSTERS, {
  dknight:   {name:'Caballero del dragón', art:'dknight', ai:'walk', hp:2600, dmg:190, spd:82, r:13, xp:240, reach:32, prep:.6, crit:.2, morph:{to:'dgearth', at:.5}, dragonzone:true},
  dkarcher:  {name:'Arquero caballero del dragón', art:'dkarcher', ai:'archer', hp:1400, dmg:150, spd:88, r:9, xp:200, reach:0, prep:.55, range:[180, 300], shot:{kind:'arrow', spd:340, r:3, life:1.3}, morph:{to:'dgair', at:.5}, dragonzone:true},
  dkmage:    {name:'Mago de chispas caballero del dragón', art:'dkmage', ai:'archer', hp:1300, dmg:160, spd:76, r:9, xp:220, reach:0, prep:.7, range:[170, 270], shot:{kind:'bolt', spd:270, r:5, life:1.6, weak:3, col:BOLT.elec}, morph:{to:'dgelec', at:.5}, dragonzone:true},
  dkpaladin: {name:'Paladín caballero del dragón', art:'dkpaladin', ai:'walk', hp:2800, dmg:175, spd:78, r:13, xp:250, reach:30, prep:.6, morph:{to:'dglight', at:.5}, dragonzone:true},
  dgearth:   {name:'Dragón de tierra', art:'dgearth', ai:'walk', hp:4600, dmg:260, spd:68, r:27, xp:520, reach:44, prep:.7, stunHit:true, dragonzone:true},
  dgair:     {name:'Dragón de aire', art:'dgair', ai:'archer', hp:3600, dmg:190, spd:86, r:24, xp:480, reach:0, prep:.6, range:[170, 300], shot:{kind:'bolt', spd:330, r:7, life:1.5, slow:2, volley:3, spread:.22, col:BOLT.wind}, dragonzone:true},
  dgelec:    {name:'Dragón eléctrico', art:'dgelec', ai:'archer', hp:3800, dmg:200, spd:80, r:25, xp:500, reach:0, prep:.6, range:[160, 280], shot:{kind:'bolt', spd:300, r:6, life:1.5, weak:3, volley:2, spread:.18, col:BOLT.elec}, dragonzone:true},
  dglight:   {name:'Dragón de luz', art:'dglight', ai:'walk', hp:4400, dmg:210, spd:72, r:27, xp:520, reach:44, prep:.7, healZones:true, dragonzone:true},
  ignis:     {name:'Ignis, hermano del fuego', art:'ignis', ai:'brain', brain:'ignis', hp:9000, dmg:250, spd:64, r:26, xp:2000, reach:0, prep:.6, boss:true, trio:true, reborn:'ignisdr', uniques:['drgclaw', 'drgaegis', 'drgcrest', 'drgboots']},
  glacius:   {name:'Glacius, hermano del hielo', art:'glacius', ai:'brain', brain:'glacius', hp:9000, dmg:250, spd:64, r:26, xp:2000, reach:0, prep:.6, boss:true, trio:true, reborn:'glaciusdr', uniques:['drgclaw', 'drgaegis', 'drgcrest', 'drgboots']},
  voltus:    {name:'Voltus, hermano del rayo', art:'voltus', ai:'brain', brain:'voltus', hp:9000, dmg:250, spd:70, r:26, xp:2000, reach:0, prep:.6, boss:true, trio:true, reborn:'voltusdr', uniques:['drgclaw', 'drgaegis', 'drgcrest', 'drgboots']},
  ignisdr:   {name:'Ignis, dragón de fuego', art:'ignisdr', ai:'brain', brain:'ignisdr', hp:13000, dmg:300, spd:70, r:44, xp:3000, reach:0, prep:.6, boss:true, trio:true, dragonDrop:'ignisblade', uniques:['drgclaw', 'drgaegis', 'drgcrest', 'drgboots']},
  glaciusdr: {name:'Glacius, dragón de hielo', art:'glaciusdr', ai:'brain', brain:'glaciusdr', hp:13000, dmg:300, spd:70, r:44, xp:3000, reach:0, prep:.6, boss:true, trio:true, dragonDrop:'glaciusshield', uniques:['drgclaw', 'drgaegis', 'drgcrest', 'drgboots']},
  voltusdr:  {name:'Voltus, dragón de rayo', art:'voltusdr', ai:'brain', brain:'voltusdr', hp:13000, dmg:300, spd:76, r:44, xp:3000, reach:0, prep:.6, boss:true, trio:true, dragonDrop:'voltusbow', uniques:['drgclaw', 'drgaegis', 'drgcrest', 'drgboots']},
});
Object.assign(RARE_PREFIX, {dknight:['Lanza Roja', 'Guardián', 'Cruzado', 'Señor'], dkarcher:['Ojo de Dragón', 'Flecha Ígnea', 'Centinela', 'Montero'], dkmage:['Chispa', 'Relámpago', 'Tormenta', 'Eléctrico'], dkpaladin:['Luz Sagrada', 'Sanador', 'Paladín', 'Alba'],
  dgearth:['Roca', 'Terremoto', 'Montaña', 'Coloso'], dgair:['Viento', 'Tempestad', 'Cielo', 'Huracán'], dgelec:['Trueno', 'Rayo', 'Tormenta', 'Chispa'], dglight:['Aurora', 'Sol', 'Halo', 'Destello'],
  ignis:['Fuego'], glacius:['Hielo'], voltus:['Rayo'], ignisdr:['Fuego'], glaciusdr:['Hielo'], voltusdr:['Rayo']});
Object.assign(MON_COLORS, {dknight:['#8a8e98', '#c83a3a', '#ffd84a'], dkarcher:['#5a3a2a', '#c8502a', '#e8e0c8'], dkmage:['#c8641a', '#ffe84a', '#fffbd0'], dkpaladin:['#e8c850', '#ffffff', '#fff0a0'],
  dgearth:['#6a4a24', '#d8b878', '#ffd84a'], dgair:['#9ac0e0', '#ffffff', '#d8f0ff'], dgelec:['#c8a820', '#ffe84a', '#a860ff'], dglight:['#e8d070', '#ffffff', '#fff4b0'],
  ignis:['#b82a14', '#ff5a2a', '#ffd84a'], glacius:['#4a90d0', '#9ad8ff', '#ffffff'], voltus:['#5a3ac0', '#ffe84a', '#ffffff'], ignisdr:['#b82a14', '#ff5a2a', '#ffd84a'], glaciusdr:['#4a90d0', '#9ad8ff', '#ffffff'], voltusdr:['#5a3ac0', '#ffe84a', '#ffffff']});

// ---------- los hermanos: cada uno con su elemento; al morir resucitan como dragón (más ataques de aliento) ----------
const wide = (m, n, spread, w, len, mul, col, fx, delay) => { const a0 = angTo(m); for(let i = 0; i < n; i++) bossBeam(m, a0 + (i - (n - 1)/2)*spread, delay || .9, w, len, mul, col, fx); };
const projFan = (m, n, spread, spd, mul, mk) => bossFan(m, n, spread, spd, mul, mk);
BRAINS.ignis = {wake:'¡Ignis, el hermano del fuego, se alza!', rage:'¡Ignis arde con furia!', col:'#ff7a2a', chargeSpd:400, keep:70, dust:'#ff9a4a', p2spd:1.25,
  attacks:[
    {id:'slash', name:'Tajo ígneo', prep:.7, w:26, max:150, warn:130, cast:m => bossSlash(m, 128, .9, 1.3, ['#ff5a1a', '#ffd84a', '#ffffff'], () => { P.burnT = Math.max(P.burnT || 0, 3); })},
    {id:'balls', name:'Bolas de fuego', prep:.9, w:20, min:110, cast:m => projFan(m, 5, .24, 250, .9, () => ({kind:'bolt', r:8, burn:true, col:BOLT.fire}))},
    {id:'rain', name:'Lluvia de fuego', prep:1.1, w:18, cast:m => bossRain(m, ['boom'], 8, 250, 1)},
    {id:'lava', name:'Rayos de lava', prep:1, w:16, cast:m => wide(m, 4, Math.PI/2, 34, 480, 1.1, '#ff6a3a', 'burn')},
    {id:'charge', name:'¡Embestida ardiente!', prep:1, w:12, min:170, cast:m => bossChargeStart(m)},
    {id:'crown', name:'Corona de fuego', prep:1.1, w:16, p2:true, cast:m => bossRingBooms(m, 12, 190, 1)},
  ]};
BRAINS.glacius = {wake:'¡Glacius, el hermano del hielo, se alza!', rage:'¡Glacius congela la cueva!', col:'#9ad8ff', chargeSpd:380, keep:80, dust:'#dce8f4', p2spd:1.25,
  attacks:[
    {id:'slash', name:'Tajo helado', prep:.75, w:24, max:150, warn:130, cast:m => bossSlash(m, 128, .9, 1.3, ['#9ad8ff', '#ffffff'], () => freezeHero(.9))},
    {id:'shards', name:'Esquirlas de hielo', prep:.9, w:20, min:110, cast:m => projFan(m, 7, .2, 260, .85, () => ({kind:'bolt', r:7, slow:2.5, freeze:.8, col:BOLT.ice}))},
    {id:'storm', name:'Granizada', prep:1.1, w:18, cast:m => bossRain(m, ['frost'], 8, 250, 1)},
    {id:'spikes', name:'Corona de escarcha', prep:1.1, w:16, cast:m => { const a0 = Math.random()*Math.PI; for(let i = 0; i < 6; i++) bossBeam(m, a0 + i*Math.PI/3, 1, 32, 460, 1.1, '#aee8ff', 'freeze'); }},
    {id:'stomp', name:'Pisotón helado', prep:1, w:14, warn:120, cast:m => { bossSlam(m, 120, 1.1, '#aee8ff'); bossRings(m, 2, 1.1, 240, .7); }},
    {id:'blizzard', name:'¡Ventisca!', prep:1.2, w:16, p2:true, cast:m => { bossPull(m, 2.6, 400, 130, .9); (m.later = m.later || []).push({t:2.6, fn:mm => bossRain(mm, ['frost', 'boom'], 8, 250, 1)}); }},
  ]};
BRAINS.voltus = {wake:'¡Voltus, el hermano del rayo, se alza!', rage:'¡Voltus desata la tormenta!', col:'#ffe84a', chargeSpd:420, keep:90, hover:true, dust:'#fff0a0', p2spd:1.3,
  attacks:[
    {id:'slash', name:'Tajo eléctrico', prep:.65, w:22, max:150, warn:120, cast:m => bossSlash(m, 124, .9, 1.25, ['#ffe84a', '#ffffff'], () => { P.weakT = Math.max(P.weakT || 0, 3); })},
    {id:'zaps', name:'Cadena de rayos', prep:.9, w:20, min:100, cast:m => projFan(m, 4, .3, 300, .9, () => ({kind:'bolt', r:6, weak:3, col:BOLT.elec}))},
    {id:'storm', name:'Tormenta', prep:1.1, w:18, cast:m => bossRain(m, ['zap'], 9, 250, 1)},
    {id:'grid', name:'Descargas en damero', prep:1.1, w:16, cast:m => bossGrid(m, 2, 72, 1)},
    {id:'beams', name:'Haces de rayo', prep:1, w:14, cast:m => wide(m, 4, Math.PI/2, 34, 480, 1.1, '#ffe84a', 'weak')},
    {id:'blink', name:'Salto de rayo', prep:.5, w:12, p2:true, cast:m => { bossBlink(m, 70); m.aim = angTo(m); bossSlash(m, 124, .9, 1.25, ['#ffe84a', '#ffffff'], () => { P.weakT = Math.max(P.weakT || 0, 3); }); }},
  ]};
// formas de dragón: mismos ataques, más fuertes, más un aliento enorme y un coletazo
const dragonBrain = (base, name, col, breathCol, fx, extra) => Object.assign({}, BRAINS[base], {wake:'¡' + name + '!', rage:'¡' + name + ' ruge con furia!', col, chargeSpd:450, p2spd:1.3, keep:60,
  attacks:BRAINS[base].attacks.filter(a => a.id !== 'blink').concat([
    {id:'breath', name:'¡Aliento de dragón!', prep:1.1, w:24, min:80, cast:m => { const a0 = angTo(m); for(let i = 0; i < 5; i++) bossBeam(m, a0 + (i - 2)*.3, .9, 120, 560, 1.4, breathCol, Math.random() < .55 ? fx : undefined); }},
    {id:'tail', name:'Coletazo', prep:.8, w:16, max:170, warn:150, cast:m => bossSlam(m, 150, 1.2, col)},
    {id:'fly', name:'¡Zarpazo en picado!', prep:.9, w:12, min:170, cast:m => bossLeap(m, P.x, P.y, .8)},
  ], extra || []), land:m => { bossSlam(m, 160, 1.3, col); bossRingBooms(m, 10, 180, 1); }});
BRAINS.ignisdr = dragonBrain('ignis', 'Ignis, el dragón de fuego, renace', '#ff7a2a', '#ff6a3a', 'burn', []);
BRAINS.glaciusdr = dragonBrain('glacius', 'Glacius, el dragón de hielo, renace', '#9ad8ff', '#9ad8ff', 'freeze', []);
BRAINS.voltusdr = dragonBrain('voltus', 'Voltus, el dragón de rayo, renace', '#ffe84a', '#ffe84a', 'weak', [{id:'blink2', name:'Salto de rayo', prep:.5, w:10, p2:true, cast:m => { bossBlink(m, 90); bossSlam(m, 120, 1.2, '#ffe84a'); }}]);

// ---------- transformaciones, zonas de curación del dragón de luz y botín de los dragones ----------
const FX_COL = {dgearth:'#d8b878', dgair:'#d8f0ff', dgelec:'#ffe84a', dglight:'#fff4b0', ignisdr:'#ff7a2a', glaciusdr:'#9ad8ff', voltusdr:'#ffe84a'};
function morphMonster(m, to, hpFrac){
  const b = MONSTERS[to], rr = MON_RARITY[m.rarity] || MON_RARITY.normal, col = FX_COL[to] || '#ffffff';
  burst(m.x, m.y - m.r, 36, [col, '#ffffff', '#ffb347'], [80, 260], [.5, 1], 0); ring(m.x, m.y - 8, 90, col, .6); G.flash = {x:m.x, y:m.y - 30, t:.35}; G.shake = Math.max(G.shake, 9); sfx('howl');
  m.type = to; m.art = b.art; m.ai = b.ai; m.r = Math.max(6, b.r*(m.scale || 1)); m.maxHp = b.hp*rr.hp*(hpFrac || 1); m.hp = m.maxHp; m.dmg = b.dmg*rr.dmg; m.baseSpd = b.spd; m.xp = Math.round(b.xp*rr.xp);
  m.name = m.rarity === 'boss' ? b.name : monName(to, m.rarity, m.affixes); m.prepT = 0; m.cast = null; m.atkCd = 1.5; m.stunT = 0; m.charge = null; m.leap = null; m.phase2 = false; m.dizzy = 0; m.morphed = true; m.aggro = true; m.shield = 0;
  addText(m.x, m.y - 80, '¡Se transforma en ' + b.name.toLowerCase() + '!', col, 8, -20); toast('¡' + b.name + '!', 3);
}
{
  const _tick = monAffixTick, _before = monAffixBeforeDeath, _death = monAffixDeath;
  monAffixTick = function(m, dt){
    const MD = MONSTERS[m.type];
    if(MD.morph && !m.morphed && m.hp > 0 && m.hp <= m.maxHp*MD.morph.at && !m.dying) morphMonster(m, MD.morph.to, .8);
    if(MD.healZones && m.aggro && !m.dying){ m.healT = (m.healT ?? 2) - dt; if(m.healT <= 0){ m.healT = 5; (G.healZones = G.healZones || []).push({x:m.x + rand(-60, 60), y:m.y + rand(-40, 40), r:90, t:5}); sfx('alba'); } }
    return _tick(m, dt);
  };
  monAffixBeforeDeath = function(m){
    const MD = MONSTERS[m.type];
    if(MD.reborn && !m.dying){ morphMonster(m, MD.reborn, 1); return true; }
    return _before(m);
  };
  monAffixDeath = function(m){
    _death(m);
    const MD = MONSTERS[m.type];
    if(MD.trio){
      const left = G.mons.filter(o => o !== m && !o.dying && MONSTERS[o.type].trio).length;
      if(left) toast('¡' + MD.name + ' ha caído! Quedan ' + left, 3.5);
      if(MD.dragonDrop && Math.random() < .25){ dropItem(m.x, m.y + 10, mkItem(MD.dragonDrop, 1, 14)); addText(m.x, m.y - m.r*2 - 40, '¡Objeto legendario!', '#ff9a3c', 8, -20); sfx('levelup'); }
    }
  };
}
const _killMonster = killMonster;
killMonster = function(m){   // el botín de jefe solo cae al derribar al último de los tres dragones
  if(MONSTERS[m.type].trio && MONSTERS[m.type].boss && !m.dying && G.mons.some(o => o !== m && !o.dying && MONSTERS[o.type].trio)){
    if(monAffixBeforeDeath(m)) return;
    monAffixDeath(m); m.dying = .001; G.kills++; sfx('slimeDie'); addXP(m.xp); burst(m.x, m.y - m.r*.6, 30, monCols(m), [60, 220], [.4, .8], 200, [2, 4]); G.shake = Math.max(G.shake, 8); return;
  }
  _killMonster(m);
};
function updateDragons(dt){
  if(!G.sc || G.sc.id !== 'dragonbridge'){ if(G.healZones && G.healZones.length) G.healZones = []; }
  else {
    if((!G.bossFight || G.bossFight.dying || !G.mons.includes(G.bossFight))){ const nx = G.mons.find(o => o.awake && !o.dying && MONSTERS[o.type].trio); if(nx) G.bossFight = nx; }
    if(!G.save.bridgeCave && !P.dead && inBossRoom(P.x, P.y)){ G.save.bridgeCave = true; toast('¡Has llegado a la cueva de los dragones! Vuelve con Alexandra', 4.5); sfx('levelup'); saveGame(); }
    for(let i = G.healZones ? G.healZones.length - 1 : -1; i >= 0; i--){
      const z = G.healZones[i]; z.t -= dt;
      if(Math.random() < dt*14){ const a = Math.random()*Math.PI*2; G.parts.push({x:z.x + Math.cos(a)*z.r*Math.random(), y:z.y + Math.sin(a)*z.r*.8*Math.random(), vx:0, vy:-26, life:.6, max:.6, size:2, col:pick(['#fff4b0', '#ffffff', '#a8ffb8'])}); }
      if(Math.random() < dt*3) ring(z.x, z.y, z.r, '#fff4b0', .4);
      for(const o of G.mons) if(!o.dying && o.hp < o.maxHp && Math.hypot(o.x - z.x, (o.y - z.y)*1.2) < z.r) o.hp = Math.min(o.maxHp, o.hp + o.maxHp*.05*dt);
      if(z.t <= 0) G.healZones.splice(i, 1);
    }
  }
  if(P.dead) return;
  if(legendOn('dragonheart')){   // Rugido
    P.roarT = (P.roarT ?? 15) - dt;
    if(P.roarT <= 0){
      P.roarT = 30; P.warT = Math.max(P.warT || 0, 6); addText(P.x, P.y - 56, '¡Rugido!', '#ff9a3a', 9); sfx('howl'); G.shake = Math.max(G.shake, 6);
      for(const m of G.mons) if(!m.dying && Math.hypot(m.x - P.x, m.y - P.y) < 200 && !MONSTERS[m.type].boss) m.stunT = Math.max(m.stunT, 1.5);
      for(const r2 of [40, 90, 150, 200]) ring(P.x, P.y - 8, r2, '#ff9a3a', .5); burst(P.x, P.y - 16, 26, ['#ff9a3a', '#ffd84a', '#ffffff'], [60, 200], [.4, .9], -20);
    }
  } else P.roarT = undefined;
  for(const p of G.pets) if(p.def.fury && p.hp > 0){   // Furia dragón (Drakonar): aliento en abanico que quema, congela y debilita
    p.furyCd = (p.furyCd ?? 8) - dt;
    if(p.furyCd <= 0 && nearestMonster(p.x, p.y, 230)){
      p.furyCd = 24; const tg = nearestMonster(p.x, p.y, 230), base = Math.atan2(tg.y - p.y, tg.x - p.x);
      for(let i = 0; i < 30; i++){ const a = base + rand(-.6, .6), v = rand(140, 300); G.parts.push({x:p.x, y:p.y - 12, vx:Math.cos(a)*v, vy:Math.sin(a)*v*.8, life:rand(.3, .6), max:.6, size:rand(2, 4), col:pick(['#ff7a2a', '#9ad8ff', '#ffe84a', '#ffffff'])}); }
      for(const m of G.mons) if(!m.dying){ const ox = m.x - p.x, oy = m.y - p.y, od = Math.hypot(ox, oy); if(od < 230 + m.r && Math.abs(angDiff(Math.atan2(oy, ox), base)) < .7)
        hitMonster(m, petDamage(p)*1.6, {src:'pet', pet:p, nx:ox/(od || 1), ny:oy/(od || 1), k:140, burn:4, weaken:4, freeze:MONSTERS[m.type].boss ? 0 : 1.5}); }
      addText(p.x, p.y - 42, p.def.skillName || '¡Furia dragón!', '#ffb347', 9); sfx('howl'); G.shake = Math.max(G.shake, 5);
    }
  }
}
{ const _uw = updateWorld12; updateWorld12 = function(dt){ _uw(dt); updateDragons(dt); }; }

// ---------- efectos de los legendarios del puente ----------
const FIRE_PAL = ({'#a8f0ff':['#a8f0ff', '#ffffff', '#5ac8ff'], '#e8ffe0':['#e8ffe0', '#ffffff', '#a8e0c8'], '#fff8a8':['#fff8a8', '#ffffff', '#ffe84a'], '#ff9a3a':['#ff9a3a', '#ffd84a', '#c8301a'], '#ffd8ff':['#ffd8ff', '#ffffff', '#c890ff']});
{
  const _after = world12After, _melee = world12Melee;
  world12Melee = function(w, m, crit, fx2, out){
    _melee(w, m, crit, fx2, out);
    if(!w) return;
    if(w.id === 'dragonlance'){ P.lanceN = (P.lanceN || 0) + 1; if(P.lanceN % 4 === 0) out.lance = true; }
    if(w.id === 'ignisblade' && Math.random() < .5) fx2.burn = Math.max(fx2.burn || 0, 4);
  };
  world12After = function(m, dmg, crit, out){
    _after(m, dmg, crit, out);
    const w = curWeapon(), id = w && w.id;
    if(id === 'ignisblade' && Math.random() < .25 && !blocked(G.sc, m.x, m.y, 4)) G.hazards.push({type:'fire', x:m.x, y:m.y, r:32, life:2.5, max:2.5});
    if(out && out.lance){   // aliento de la lanza: fuego → hielo → rayo
      const el = (P.lanceE = ((P.lanceE ?? -1) + 1) % 3), col = ['#ff7a2a', '#9ad8ff', '#ffe84a'][el], a = P.face;
      for(let i = 0; i < 26; i++){ const aa = a + rand(-.4, .4), v = rand(150, 300); G.parts.push({x:P.x, y:P.y - 16, vx:Math.cos(aa)*v, vy:Math.sin(aa)*v*.8, life:rand(.25, .5), max:.5, size:rand(2, 4), col:pick([col, '#ffffff'])}); }
      for(const o of G.mons) if(!o.dying){ const ox = o.x - P.x, oy = o.y - P.y, od = Math.hypot(ox, oy); if(od < 170 + o.r && od > 0 && Math.abs(angDiff(Math.atan2(oy, ox), a)) < .5)
        hitMonster(o, Math.round(dmg*.9), {src:'player', nx:ox/od, ny:oy/od, k:120, burn:el === 0 ? 4 : 0, freeze:el === 1 && !MONSTERS[o.type].boss ? 1.5 : 0, weaken:el === 2 ? 4 : 0}); }
      addText(P.x, P.y - 56, ['¡Aliento de fuego!', '¡Aliento de hielo!', '¡Aliento de rayo!'][el], col, 8); sfx('howl');
    }
  };
}
function voltusChain(pr, m, dmg){   // Arco de Voltus: el rayo salta a hasta 2 enemigos más
  let from = m; const hit = new Set([m]);
  for(let n = 0; n < 2; n++){
    let bo = null, bd = 150; for(const o of G.mons) if(!o.dying && !hit.has(o)){ const dd = Math.hypot(o.x - from.x, o.y - from.y); if(dd < bd && los(G.sc, from.x, from.y - 10, o.x, o.y - 10)){ bd = dd; bo = o; } }
    if(!bo) break; hit.add(bo); pixLine(from.x, from.y - 14, bo.x, bo.y - 14, 2, '#ffe84a'); burst(bo.x, bo.y - 10, 8, ['#ffe84a', '#ffffff'], [30, 100], [.2, .4], 0);
    hitMonster(bo, Math.round(dmg*.5), {src:'player', nx:0, ny:0, k:0}); from = bo;
  }
}

// ---------- mascotas (la tabla fue aprobada por el usuario; arte por formas) ----------
function petEgg(f, o){
  const y = f === 1 ? 1 : 0;
  return [{e:[13, 13 - y, 7, 8.5], c:o.pal, tex:o.tex}, {poly:[[8, 9 - y], [11, 5 - y], [13, 9 - y], [15, 5 - y], [18, 9 - y]], c:o.pal.slice(1)}, {e:[11, 16 - y, 2, 2.4], c:o.spot}, {e:[16, 12 - y, 2, 2.4], c:o.spot},
    {l:[10, 20 - y, 9, 25, 1.8], c:o.dk}, {l:[16, 20 - y, 17 + (f === 2 ? 2 : 0), 25, 1.8], c:o.dk}, {p:[[11, 11 - y, '#101010'], [15, 11 - y, '#101010'], [11, 10 - y, '#ffffff'], [15, 10 - y, '#ffffff']]}];
}
function petDrakonar(f, o){
  const base = petDragonX(f, o), wy = f === 1 ? 0 : f === 2 ? 3 : 1;
  return base.concat([{poly:[[18, 11], [21, 6 + wy], [24, 3 + wy], [25, 7 + wy], [21, 12]], c:['#1c4a7a', '#4a90d0', '#9ad8ff']}, {e:[25, 4 + wy, 3, 2.6], c:['#4a90d0', '#9ad8ff', '#e8faff']}, {p:[[26, 4 + wy, '#101010']]},
    {poly:[[19, 15], [23, 16 + wy], [26, 18 + wy], [26, 21 + wy], [21, 18]], c:['#8a7a10', '#ffe84a', '#fffbd0']}, {e:[26, 19 + wy, 3, 2.6], c:['#c8a820', '#ffe84a', '#fffbd0']}, {p:[[27, 19 + wy, '#101010']]}]);
}
Object.assign(PET_SHAPES, {
  brasadrago: {w:34, h:26, ax:15, ay:21, fly:true, shapes:f => petDragonX(f, {fl:DRG_PAL.fire.fl, bel:DRG_PAL.fire.bel, tex:711})},
  escamin:    {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#1c4a2a', '#2e7a44', '#5ac878', '#a8f0b8'], ears:'round', tail:'long', tex:721, dk:'#0a2414', eye:'#ffe84a', legW:1.8})},
  alita:      {w:34, h:26, ax:15, ay:21, fly:true, shapes:f => petDragonX(f, {fl:['#2a5a3a', '#4a9a5a', '#8ad89a', '#d0ffd8'], bel:['#fff0a0', '#ffffff'], tex:731})},
  huevin:     {w:28, h:28, ax:13, ay:27, shapes:f => petEgg(f, {pal:['#c8b890', '#e8d8b0', '#fff0d0', '#ffffff'], spot:['#8a6a3a', '#a88a50'], dk:'#4a3a24', tex:741})},
  chispin:    {w:34, h:26, ax:15, ay:21, fly:true, glow:'#ffe84a', shapes:f => petDragonX(f, {fl:DRG_PAL.elec.fl, bel:DRG_PAL.elec.bel, tex:751})},
  glacin:     {w:34, h:26, ax:15, ay:21, fly:true, shapes:f => petDragonX(f, {fl:DRG_PAL.ice.fl, bel:DRG_PAL.ice.bel, tex:761})},
  roquin:     {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#3a2a14', '#6a4a24', '#a07a44', '#d8b878'], ears:'horns', horn:['#6a5a3a', '#d8c898'], tail:'long', tex:771, dk:'#1c1408', legW:2.8})},
  nimbo:      {w:34, h:26, ax:15, ay:21, fly:true, glow:'#e8f8ff', shapes:f => petDragonX(f, {fl:DRG_PAL.air.fl, bel:DRG_PAL.air.bel, tex:781})},
  lumina:     {w:34, h:26, ax:15, ay:21, fly:true, glow:'#fff4b0', shapes:f => petDragonX(f, {fl:DRG_PAL.light.fl, bel:DRG_PAL.light.bel, tex:791})},
  tormentaazul:{w:34, h:26, ax:15, ay:21, fly:true, glow:'#c8b0ff', shapes:f => petDragonX(f, {fl:DRG_PAL.thunder.fl, bel:DRG_PAL.thunder.bel, tex:801})},
  drakonar:   {w:34, h:30, ax:15, ay:25, fly:true, glow:'#ff9a3a', shapes:f => petDrakonar(f, {fl:['#5a1008', '#b82a14', '#ff5a2a', '#ffc07a'], bel:['#ffd84a', '#fff0a0'], tex:811})},
});
regPets(['brasadrago', 'escamin', 'alita', 'huevin', 'chispin', 'glacin', 'roquin', 'nimbo', 'lumina', 'tormentaazul', 'drakonar'], {
  brasadrago: {exp:14, name:'Brasita Dragón', rarity:'normal', look:'Dragoncito rojo', beh:'cone', dmg:[9, 13], cd:2.4, fire:'#ff9a3a', affixes:['ignea'], attack:'Aliento de chispas en cono'},
  escamin:    {exp:14, name:'Escamín', rarity:'normal', look:'Lagarto de escamas verdes', beh:'pounce', dmg:[11, 15], cd:1.5, bites:1, affixes:['dura'], attack:'Mordisco'},
  alita:      {exp:14, name:'Alita', rarity:'normal', look:'Wyvern pequeña', beh:'flyer', dmg:[10, 14], cd:.9, affixes:['ligera'], attack:'Picotazos desde el aire'},
  huevin:     {exp:14, name:'Huevín', rarity:'normal', look:'Huevo de dragón con patas', beh:'charge', dmg:[11, 15], cd:2.4, miniStun:true, affixes:['robusta'], attack:'Embestida que aturde 0,5 s'},
  chispin:    {exp:14, name:'Chispín', rarity:'normal', look:'Dragoncito amarillo', beh:'cone', dmg:[9, 13], cd:2.4, fire:'#fff8a8', affixes:['atronadora'], attack:'Descarga corta en cono'},
  glacin:     {exp:14, name:'Glacín', rarity:'magic', look:'Dragoncito de hielo', beh:'cone', dmg:[15, 20], cd:2.4, fire:'#a8f0ff', affixes:['helada', 'veloz'], attack:'Aliento helado en cono'},
  roquin:     {exp:14, name:'Roquín', rarity:'magic', look:'Dragoncito de tierra', beh:'charge', dmg:[15, 20], cd:2.8, knock:true, shock:true, affixes:['robusta', 'dura'], attack:'Embate con onda de choque que aturde'},
  nimbo:      {exp:14, name:'Nimbo', rarity:'magic', look:'Dragoncito de aire', beh:'cone', dmg:[14, 19], cd:2.4, fire:'#e8ffe0', gust:true, affixes:['ligera', 'voladora'], attack:'Ráfaga de viento en cono que empuja'},
  lumina:     {exp:14, name:'Lumina', rarity:'rare', look:'Dragón de luz joven', beh:'cone', dmg:[26, 34], cd:2.2, fire:'#fff0a0', affixes:['curandera', 'sanadora', 'luciernaga', 'inspiradora'], attack:'Rayo de luz en cono'},
  tormentaazul:{exp:14, name:'Tormenta Azul', rarity:'rare', look:'Dragón eléctrico joven', beh:'cone', dmg:[26, 34], cd:2, fire:'#ffd8ff', affixes:['electrica', 'atronadora', 'veloz', 'feroz'], attack:'Cadena de rayos en cono (salta a otro enemigo)'},
  drakonar:   {exp:14, name:'Drakonar', rarity:'legendary', look:'Dragón de tres cabezas', beh:'cone', dmg:[34, 44], cd:2, fire:'#ff9a3a', legendary:true, fury:true, skillName:'¡Furia dragón!', affixes:['ignea', 'helada', 'indomable', 'temible'],
              attack:'Triple aliento en cono. Furia dragón cada 24 s: aliento en abanico que quema, congela y debilita a los enemigos'},
}, PET_SHAPES);

// ---------- mapa: un puente de piedra sobre el abismo ----------
const BRG_STONE = ['#2a2630', '#34303c', '#3e3a48', '#484456'], BRG_VOID = ['#0a0610', '#120a1a', '#1a1024', '#22142e'];
ART.dragongate = SP(paintSprite(120, 90, [
  {poly:[[0, 90], [6, 24], [26, 4], [94, 4], [114, 24], [120, 90]], c:['#1c1822', '#2e2a38', '#46405a'], tex:821},
  {poly:[[22, 90], [24, 36], [40, 20], [80, 20], [96, 36], [98, 90]], c:['#050308', '#0a0610', '#120a1a']}, {e:[60, 64, 24, 20], c:['#2a0a04', '#8a2a0a', '#ff6a2a']},
  {poly:[[10, 28], [14, 6], [20, 26]], c:['#e8e0d0', '#ffffff']}, {poly:[[100, 26], [106, 6], [110, 28]], c:['#e8e0d0', '#ffffff']},
]), 60, 88);
function buildDragonBridge(seed){
  const sc = buildRectWorld({id:'dragonbridge', name:'El puente de los dragones', lvl:14, petExp:14, cols:1, rows:8, nodeW:[300, 360], nodeH:[300, 360], boss:{w:760, h:560}, spacingX:440, spacingY:420,
    solid:'water', darkness:.86, loops:0, warm:true, lightA:.8, corridor:80,
    floor:(x, y, e) => e ? '#1c1822' : BRG_STONE[tq(((Math.floor(x/20) + Math.floor(y/20)) & 1)*.2 + vnoise(x/12, y/12, 561)*.45 + hash(x, y, 562)*.2, x, y, 4)],
    void:(x, y, near) => near ? '#3a1410' : BRG_VOID[tq(vnoise(x/16, y/16, 563)*.7 + hash(x, y, 564)*.3, x, y, 4)],
    groups:[['dknight', 'dkarcher'], ['dkmage', 'dkpaladin', 'dkarcher'], ['dknight', 'dkmage'], ['dkpaladin', 'dknight', 'dkarcher'], ['dkknight2', 'dkmage', 'dkpaladin']].map(g => g.map(t => t === 'dkknight2' ? 'dknight' : t)),
    decor:(sc, n, H) => {
      for(const sx of [-1, 1]) for(let i = 0; i < 2; i++){ const x = Math.round(n.x + sx*(n.w/2 - 20)), y = Math.round(n.y - n.h/2 + 60 + i*(n.h - 120)); if(H.walk(x, y) && !blocked(sc, x, y, 12)){
        if(i === 0) propSprite(sc, ART.statue, x, y, {t:'c', x, y:y - 4, r:9}, [10, 3]);
        else { const t = propSprite(sc, ART.torch, x, y, {t:'c', x, y:y - 2, r:3}); sc.lights.push({x, y:y - 14, r:110, a:.65, warm:true, flick:.25}); t.draw = function(){ drawSP(ART.torch, x, y); drawFlames(x, y - 16, .25); }; } } }
      const cnt = Math.round(n.w*n.h/26000);
      for(let i = 0; i < cnt; i++){ const p = H.pointOn(n, 12); if(!p) continue; const r = H.R();
        if(r < .4) propSprite(sc, ART.barrel, p.x, p.y, {t:'c', x:p.x, y:p.y - 2, r:6}, [6, 2]);
        else if(r < .75) propSprite(sc, ART.pillar, p.x, p.y, {t:'c', x:p.x, y:p.y - 4, r:8}, [9, 3]);
        else { const f = propSprite(sc, ART.campfire, p.x, p.y, {t:'c', x:p.x, y:p.y - 2, r:7}); f.draw = function(){ drawSP(ART.campfire, p.x, p.y); drawFlames(p.x, p.y - 8, .6); }; sc.lights.push({x:p.x, y:p.y - 10, r:130, a:.7, warm:true, flick:.12}); } }
    },
    bossDecor:(sc, n, H) => {
      for(let i = 0; i < 12; i++){ const a = i/12*Math.PI*2, x = Math.round(n.x + Math.cos(a)*(n.w/2 - 46)), y = Math.round(n.y + Math.sin(a)*(n.h/2 - 46)); if(H.walk(x, y) && !blocked(sc, x, y, 14) && Math.hypot(x - n.x, y - (n.y + n.h/2)) > 70){ propSprite(sc, ART.pillar, x, y, {t:'c', x, y:y - 4, r:8}, [9, 3]); sc.lights.push({x, y:y - 24, r:110, a:.65, warm:true, flick:.2}); } }
      propSprite(sc, ART.dragongate, n.x, n.y - n.h/2 + 14, null);
      sc.lights.push({x:n.x, y:n.y - n.h/2 + 30, r:260, a:.7, warm:true, flick:.18}, {x:n.x, y:n.y, r:320, a:.5, warm:true, flick:.1});
    }}, seed);
  // los otros dos hermanos nacen junto al primero (el primero lo crea la expedición)
  const bs = sc.bossSpawn; sc.extraBosses = [{type:'glacius', x:bs.x - 190, y:bs.y + 30}, {type:'voltus', x:bs.x + 190, y:bs.y + 30}];
  return sc;
}
RAID_BUILDERS.dragonbridge = buildDragonBridge;

Object.assign(LANG_EN, {
  'El puente de los dragones':'The Dragon Bridge', 'Un puente de piedra tendido sobre un abismo sin fondo. Al final del camino se abre la cueva donde los dragones guardan sus tesoros, protegida por los tres hermanos drakonianos.':'A stone bridge stretched over a bottomless abyss. At the end of the road opens the cave where the dragons keep their treasures, guarded by the three Drakonian brothers.',
  'Caballeros del dragón (guerreros, arqueros, magos de chispas y paladines) y dragones de tierra, aire, rayo y luz. Jefes: los hermanos drakonianos Ignis, Glacius y Voltus':'Dragon knights (warriors, archers, spark mages and paladins) and earth, air, lightning and light dragons. Bosses: the Drakonian brothers Ignis, Glacius and Voltus',
  'Atraviesa el puente':'Cross the bridge', '¿Tienes la llave del puente de los dragones? Entonces cruza: más allá del abismo hay una cueva donde los dragones esconden sus tesoros.':'Do you have the key to the dragon bridge? Then cross: beyond the abyss there is a cave where the dragons hide their treasures.',
  'Atraviesa el puente y llega hasta la cueva de los dragones. Los tres hermanos drakonianos la guardan, y dicen que al morir resucitan como dragones.':'Cross the bridge and reach the dragon cave. The three Drakonian brothers guard it, and they say that when they die they come back as dragons.',
  'Si lo consigues te daré 25.000 de oro.':'If you succeed I will give you 25,000 gold.', '¡Lo has hecho! Has llegado a la cueva de los dragones.':'You did it! You reached the dragon cave.', 'Aquí tienes tus 25.000 de oro. Te los has ganado.':'Here are your 25,000 gold. You earned them.',
  'Atraviesa el puente de los dragones':'Cross the dragon bridge', 'y llega hasta la cueva donde':'and reach the cave where', 'esconden los tesoros':'they hide the treasures', '✔ Has llegado: vuelve con Alexandra':'✔ You made it: return to Alexandra', '✘ Aún no has llegado a la cueva':'✘ You have not reached the cave yet',
  '+25.000 de oro (guardados en la guarida)':'+25,000 gold (stored in the den)', '¡Has llegado a la cueva de los dragones! Vuelve con Alexandra':'You reached the dragon cave! Return to Alexandra',
  'Espada de escamas':'Scale sword', 'Arco de escamas':'Scale bow', 'Escudo de escamas':'Scale shield', 'Yelmo de escamas':'Scale helm', 'Coraza de escamas':'Scale cuirass', 'Guanteletes de escamas':'Scale gauntlets', 'Botas de escamas':'Scale boots',
  'Hoja forjada con escamas de dragón. Solo cae en las zonas de dragones.':'Blade forged with dragon scales. Only drops in dragon zones.', 'Arco reforzado con escamas de dragón: +8 % de crítico. Usa flechas. Solo cae en las zonas de dragones.':'Bow reinforced with dragon scales: +8 % critical. Uses arrows. Only drops in dragon zones.',
  'Escudo de escamas de dragón: bloquea el 88 % del daño frontal. Solo cae en las zonas de dragones.':'Dragon scale shield: blocks 88 % of frontal damage. Only drops in dragon zones.', 'Yelmo de escamas de dragón. Solo cae en las zonas de dragones.':'Dragon scale helm. Only drops in dragon zones.',
  'Coraza de escamas de dragón: protección enorme, −6 % de velocidad. Solo cae en las zonas de dragones.':'Dragon scale cuirass: huge protection, −6 % speed. Only drops in dragon zones.', 'Guanteletes de escamas de dragón. Solo caen en las zonas de dragones.':'Dragon scale gauntlets. Only drop in dragon zones.', 'Botas de escamas de dragón. Solo caen en las zonas de dragones.':'Dragon scale boots. Only drop in dragon zones.',
  'Garra del Rey Dragón':'Dragon King\'s Claw', 'Égida de escamas ancestrales':'Aegis of Ancient Scales', 'Cresta del Rey Dragón':'Dragon King\'s Crest', 'Botas de escamas ancestrales':'Boots of Ancient Scales',
  'Objeto legendario de los hermanos drakonianos. El 50 % de los golpes quema al enemigo.':'Legendary item of the Drakonian brothers. 50 % of hits burn the enemy.', 'Objeto legendario de los hermanos drakonianos. Bloquea el 92 % del daño frontal.':'Legendary item of the Drakonian brothers. Blocks 92 % of frontal damage.',
  'Objeto legendario de los hermanos drakonianos. Una cresta de dragón de oro y brasas.':'Legendary item of the Drakonian brothers. A dragon crest of gold and embers.', 'Objeto legendario de los hermanos drakonianos. Cada paso levanta ceniza caliente.':'Legendary item of the Drakonian brothers. Every step kicks up hot ash.',
  'Corazón de Dragón':'Dragon Heart', 'Objeto legendario. Rugido: cada 30 s aturde 1,5 s a los enemigos cercanos y haces +25 % de daño durante 6 s.':'Legendary item. Roar: every 30 s it stuns nearby enemies for 1.5 s and you deal +25 % damage for 6 s.',
  'Escama del Dragón Primigenio':'Primal Dragon Scale', 'Lanza Dracónica':'Draconic Lance', 'Hoja de Ignis':'Ignis\' Blade', 'Escudo de Glacius':'Glacius\' Shield', 'Arco de Voltus':'Voltus\' Bow',
  'Objeto legendario del puente de los dragones. Reduce un 20 % el daño de fuego, hielo y rayo.':'Legendary item of the dragon bridge. Reduces fire, ice and lightning damage by 20 %.',
  'Objeto legendario del puente de los dragones. Aliento: cada 4.º golpe lanza un aliento elemental en cono que alterna fuego, hielo y rayo.':'Legendary item of the dragon bridge. Breath: every 4th hit unleashes an elemental cone breath alternating fire, ice and lightning.',
  'Objeto legendario de Ignis, el dragón de fuego. El 50 % de los golpes quema y el 25 % deja un charco de fuego bajo el enemigo.':'Legendary item of Ignis, the fire dragon. 50 % of hits burn and 25 % leave a fire puddle under the enemy.',
  'Objeto legendario de Glacius, el dragón de hielo. Bloquea el 90 % del daño frontal y el 35 % de los golpes bloqueados congela al atacante 1,5 s.':'Legendary item of Glacius, the ice dragon. Blocks 90 % of frontal damage and 35 % of blocked hits freeze the attacker for 1.5 s.',
  'Objeto legendario de Voltus, el dragón de rayo. Cada flecha encadena un rayo a hasta 2 enemigos más (50 % del daño). Usa flechas.':'Legendary item of Voltus, the lightning dragon. Each arrow chains lightning to up to 2 more enemies (50 % damage). Uses arrows.',
  '¡Rugido!':'Roar!', '¡Aliento de fuego!':'Fire breath!', '¡Aliento de hielo!':'Ice breath!', '¡Aliento de rayo!':'Lightning breath!', '¡Furia dragón!':'Dragon fury!',
  'Colmillo de dragón':'Dragon fang', 'Escama dorada de dragón':'Golden dragon scale', 'Garra de oro':'Golden claw', 'Huevo fosilizado':'Fossilized egg', 'Corazón de lava':'Lava heart',
  'Todavía está caliente.':'It is still warm.', 'Pesa como un lingote.':'It weighs like an ingot.', 'Una garra de dragón recubierta de oro.':'A dragon claw plated in gold.', 'Muy extraño: algo se mueve dentro.':'Very strange: something moves inside.', 'Muy extraño: late y quema al tocarlo.':'Very strange: it beats and burns to the touch.',
  'Caballero del dragón':'Dragon knight', 'Arquero caballero del dragón':'Dragon knight archer', 'Mago de chispas caballero del dragón':'Dragon knight spark mage', 'Paladín caballero del dragón':'Dragon knight paladin',
  'Dragón de tierra':'Earth dragon', 'Dragón de aire':'Air dragon', 'Dragón eléctrico':'Electric dragon', 'Dragón de luz':'Light dragon',
  'Ignis, hermano del fuego':'Ignis, brother of fire', 'Glacius, hermano del hielo':'Glacius, brother of ice', 'Voltus, hermano del rayo':'Voltus, brother of lightning', 'Ignis, dragón de fuego':'Ignis, fire dragon', 'Glacius, dragón de hielo':'Glacius, ice dragon', 'Voltus, dragón de rayo':'Voltus, lightning dragon',
  '¡Ignis, el hermano del fuego, se alza!':'Ignis, brother of fire, rises!', '¡Ignis arde con furia!':'Ignis burns with fury!', '¡Glacius, el hermano del hielo, se alza!':'Glacius, brother of ice, rises!', '¡Glacius congela la cueva!':'Glacius freezes the cave!', '¡Voltus, el hermano del rayo, se alza!':'Voltus, brother of lightning, rises!', '¡Voltus desata la tormenta!':'Voltus unleashes the storm!',
  '¡Ignis, el dragón de fuego, renace!':'Ignis, the fire dragon, is reborn!', '¡Ignis, el dragón de fuego, renace ruge con furia!':'Ignis, the fire dragon, roars with fury!', '¡Glacius, el dragón de hielo, renace!':'Glacius, the ice dragon, is reborn!', '¡Glacius, el dragón de hielo, renace ruge con furia!':'Glacius, the ice dragon, roars with fury!', '¡Voltus, el dragón de rayo, renace!':'Voltus, the lightning dragon, is reborn!', '¡Voltus, el dragón de rayo, renace ruge con furia!':'Voltus, the lightning dragon, roars with fury!',
  'Tajo ígneo':'Fiery slash', 'Bolas de fuego':'Fireballs', 'Lluvia de fuego':'Fire rain', 'Rayos de lava':'Lava beams', '¡Embestida ardiente!':'Burning charge!', 'Corona de fuego':'Crown of fire',
  'Tajo helado':'Icy slash', 'Esquirlas de hielo':'Ice shards', 'Granizada':'Hailstorm', 'Pisotón helado':'Icy stomp', 'Tajo eléctrico':'Electric slash', 'Cadena de rayos':'Chain lightning', 'Tormenta':'Storm', 'Descargas en damero':'Checkerboard discharges', 'Haces de rayo':'Lightning beams', 'Salto de rayo':'Lightning leap',
  '¡Aliento de dragón!':'Dragon breath!', 'Coletazo':'Tail whip', '¡Zarpazo en picado!':'Diving claw!', '¡Se transforma en':'Transforms into', 'Objeto legendario!':'Legendary item!', '¡Objeto legendario!':'Legendary item!',
  'Brasita Dragón':'Little Ember Dragon', 'Escamín':'Scalelet', 'Alita':'Wingie', 'Huevín':'Eggy', 'Chispín':'Sparky', 'Glacín':'Frosty', 'Roquín':'Rocky', 'Nimbo':'Nimbus', 'Lumina':'Lumina', 'Tormenta Azul':'Blue Storm', 'Drakonar':'Drakonar',
  'Dragoncito rojo':'Little red dragon', 'Lagarto de escamas verdes':'Green-scaled lizard', 'Wyvern pequeña':'Small wyvern', 'Huevo de dragón con patas':'Dragon egg with legs', 'Dragoncito amarillo':'Little yellow dragon', 'Dragoncito de hielo':'Little ice dragon', 'Dragoncito de tierra':'Little earth dragon', 'Dragoncito de aire':'Little air dragon', 'Dragón de luz joven':'Young light dragon', 'Dragón eléctrico joven':'Young electric dragon', 'Dragón de tres cabezas':'Three-headed dragon',
  'Aliento de chispas en cono':'Cone of sparks breath', 'Mordisco':'Bite', 'Picotazos desde el aire':'Pecks from the air', 'Embestida que aturde 0,5 s':'Charge that stuns 0.5 s', 'Descarga corta en cono':'Short cone discharge', 'Aliento helado en cono':'Icy cone breath', 'Embate con onda de choque que aturde':'Charge with a stunning shockwave',
  'Ráfaga de viento en cono que empuja':'Cone gust of wind that pushes', 'Rayo de luz en cono':'Cone ray of light', 'Cadena de rayos en cono (salta a otro enemigo)':'Cone of chain lightning (jumps to another enemy)', 'Triple aliento en cono. Furia dragón cada 24 s: aliento en abanico que quema, congela y debilita a los enemigos':'Triple cone breath. Dragon fury every 24 s: a fan of breath that burns, freezes and weakens enemies',
});
LANG.load(LANG_EN);
