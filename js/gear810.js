'use strict';
// =====================================================================
//  Equipo general de nivel 8 (acero enano) y de nivel 10 (mithril): armas y armaduras
//  Caen en el botín general desde esos niveles, se compran a Trapis (tier 8 y 10) y se ven en el héroe.
// =====================================================================
const STEEL = {L:'#8a98ac', l:'#d0d8e4', d:'#3a4458', s:'#e8d070'};
const MITH = {L:'#a8d8f0', l:'#e8f8ff', d:'#4a7aa0', s:'#ffffff'};

// ---------- iconos ----------
iconFrom([
  ['steelsword',  'sword',     {w:'#d8e0ec', s:'#8a98ac', r:'#b8c4d4', g:'#c8962e', b:'#4a3a2a'}],
  ['dwarfaxe',    'axe',       {s:'#e8eef6', M:'#a8b4c4', m:'#5a6678', b:'#4a2e1a', B:'#7a5636'}],
  ['dwarfmace',   'mace',      {M:'#a8b4c4', m:'#5a6678', s:'#e8eef6', b:'#4a2e1a', B:'#7a5636'}],
  ['dwarfcrossbow', 'crossbow', {b:'#5a4028', B:'#7a5a3a', w:'#e8e0c8', s:'#b8c4d4'}],
  ['steelhelm',   'helmet',    STEEL], ['steelmail', 'chestarmor', STEEL],
  ['steelgloves', 'gloves',    {L:STEEL.L, d:STEEL.d, s:STEEL.s}], ['steelboots', 'boots', Object.assign({}, STEEL, {d:'#2e384c'})],
  ['steelshield', 'ironshield', {m:'#3e4a62', M:'#b0bcd0', i:'#6a7a96', I:'#8a9ab8', g:'#e8d070'}],
  ['mithsword',   'sword',     {w:'#f0fcff', s:'#9ad8f4', r:'#c8ecff', g:'#e8f0ff', b:'#2e4a68'}],
  ['mithgreataxe', 'greataxe', {s:'#f0fcff', M:'#9ad8f4', m:'#4a7aa0', b:'#2e4a68', B:'#5a7a98'}],
  ['mithbow',     'bow',       {B:'#9ad8f4', b:'#4a7aa0', w:'#f0fcff'}],
  ['mithdagger',  'dagger',    {w:'#f0fcff', s:'#9ad8f4', g:'#e8f0ff', b:'#2e4a68'}],
  ['mithhelm',    'helmet',    MITH], ['mithmail', 'chestarmor', MITH],
  ['mithgloves',  'gloves',    {L:MITH.L, d:MITH.d, s:MITH.s}], ['mithboots', 'boots', Object.assign({}, MITH, {d:'#3a6a90'})],
  ['mithshield',  'ironshield', {m:'#4a7aa0', M:'#e8f8ff', i:'#7ac0e8', I:'#a8d8f0', g:'#ffffff'}],
]);

// ---------- aspecto en el héroe ----------
for(const [pre, pal] of [['steel', STEEL], ['mith', MITH]]){
  regOv(pre + 'helm', 'helmet', pal); regOv(pre + 'mail', 'chest', pal); regOv(pre + 'boot', 'boot', Object.assign({}, pal, {d: pre === 'steel' ? '#2e384c' : '#3a6a90'}));
  regOv(pre + 'glove', 'glove', pal); regOv(pre + 'gloveBig', 'bigGlove', pal);
}
ART.steelshield = SP(paintSprite(12, 13, [
  {poly:[[0, 0], [12, 0], [12, 6], [6, 13], [0, 6]], c:['#3e4a62', '#8a9ab8', '#b0bcd0']}, {poly:[[2, 2], [10, 2], [10, 6], [6, 10], [2, 6]], c:['#2a3448', '#4a5a78', '#6a7a96'], tex:97},
  {e:[6, 5, 1.6, 1.6], c:['#8a6420', '#c8962e', '#ffe08a']},
]), 6, 6);
ART.mithshield = SP(paintSprite(12, 13, [
  {poly:[[0, 0], [12, 0], [12, 6], [6, 13], [0, 6]], c:['#4a7aa0', '#a8d8f0', '#e8f8ff']}, {poly:[[2, 2], [10, 2], [10, 6], [6, 10], [2, 6]], c:['#2e5a80', '#4a8ac0', '#7ac0e8'], tex:98},
  {e:[6, 5, 1.6, 1.6], c:['#7ac8ff', '#d0f4ff', '#ffffff']},
]), 6, 6);
// colores de las armas en la mano
Object.assign(W12_TINT, {steelsword:['#c8d4e4', '#ffffff'], mithsword:['#9ad8f4', '#f0fcff'], dwarfaxe:['#a8b4c4', '#e8eef6'], dwarfmace:['#6a7a96', '#b0bcd0'], dwarfcrossbow:['#b8c4d4'],
  mithgreataxe:['#9ad8f4', '#f0fcff'], mithbow:['#9ad8f4', '#f0fcff'], mithdagger:['#9ad8f4']});

// ---------- objetos ----------
Object.assign(ITEMS, {
  steelsword:   {name:'Espada de acero', icon:'steelsword', slot:'weapon', kind:'sword', gear:true, dur:130, dmg:[38, 52], value:110, desc:'Espada de acero templado de las forjas de la mina.'},
  dwarfaxe:     {name:'Hacha de combate enana', icon:'dwarfaxe', slot:'weapon', kind:'axe', gear:true, dur:120, dmg:[38, 52], bleedChance:.35, value:110, desc:'Hacha enana de filo dentado. El 35 % de los golpes provoca sangrado.'},
  dwarfmace:    {name:'Maza de guerra enana', icon:'dwarfmace', slot:'weapon', kind:'mace', gear:true, dur:130, dmg:[38, 54], stunChance:.3, value:115, desc:'Maza pesada de acero. El 30 % de los golpes aturde al enemigo.'},
  dwarfcrossbow:{name:'Ballesta enana', icon:'dwarfcrossbow', slot:'weapon', kind:'crossbow', gear:true, dur:110, dmg:[48, 64], value:140, desc:'Ballesta de mecanismo enano: mucho daño, recarga lenta. Usa flechas.'},
  steelhelm:    {name:'Casco de acero', icon:'steelhelm', slot:'head', gear:true, armor:6, move:-5, ov:'steelhelm', value:100, desc:'Casco de acero: más protección que el hierro, pero te hace un 5 % más lento.'},
  steelmail:    {name:'Coraza de acero', icon:'steelmail', slot:'chest', gear:true, armor:13, move:-10, ov:'steelmail', value:170, desc:'Coraza de acero: reduce mucho el daño que recibes, pero te hace un 10 % más lento.'},
  steelgloves:  {name:'Guanteletes de acero', icon:'steelgloves', slot:'hands', gear:true, armor:4, move:-4, ov:'steelglove', value:80, dmgFist:4, desc:'Guanteletes de acero: más protección y puñetazos más fuertes, pero te hacen un 4 % más lento.'},
  steelboots:   {name:'Grebas de acero', icon:'steelboots', slot:'feet', gear:true, armor:4, move:-6, ov:'steelboot', value:80, desc:'Grebas de acero: más protección, pero te hacen un 6 % más lento.'},
  steelshield:  {name:'Escudo de acero', icon:'steelshield', slot:'shield', gear:true, dur:90, armor:7, block:.84, shieldArt:'steelshield', value:125, desc:'Escudo de acero: bloquea el 84 % del daño frontal.'},
  mithsword:    {name:'Espada de mithril', icon:'mithsword', slot:'weapon', kind:'sword', gear:true, dur:160, dmg:[50, 68], crit:8, value:200, desc:'Espada ligera de mithril: mucho daño y +8 % de probabilidad de crítico.'},
  mithgreataxe: {name:'Hacha de mithril a dos manos', icon:'mithgreataxe', slot:'weapon', kind:'greataxe', gear:true, twoHanded:true, dur:150, dmg:[62, 84], value:240, desc:'A dos manos: no permite llevar escudo. Ataque giratorio en área que golpea a todos los que te rodean.'},
  mithbow:      {name:'Arco de mithril', icon:'mithbow', slot:'weapon', kind:'bow', gear:true, dur:130, dmg:[44, 60], crit:8, value:190, desc:'Arco de mithril: mucho daño y +8 % de probabilidad de crítico. Usa flechas.'},
  mithdagger:   {name:'Daga de mithril', icon:'mithdagger', slot:'weapon', kind:'dagger', gear:true, dur:120, dmg:[28, 38], poisonChance:.4, value:170, desc:'Daga rápida de mithril. 40 % de probabilidad de envenenar.'},
  mithhelm:     {name:'Yelmo de mithril', icon:'mithhelm', slot:'head', gear:true, armor:8, move:-2, ov:'mithhelm', value:180, desc:'Yelmo de mithril: mucha protección y casi no pesa (−2 % de velocidad).'},
  mithmail:     {name:'Cota de mithril', icon:'mithmail', slot:'chest', gear:true, armor:17, move:-4, ov:'mithmail', value:290, desc:'Cota de mithril: protección excelente con poco peso (−4 % de velocidad).'},
  mithgloves:   {name:'Guantes de mithril', icon:'mithgloves', slot:'hands', gear:true, armor:5, move:-2, ov:'mithglove', value:150, dmgFist:5, desc:'Guantes de mithril: protección, puñetazos más fuertes y casi sin peso.'},
  mithboots:    {name:'Botas de mithril', icon:'mithboots', slot:'feet', gear:true, armor:5, move:-2, ov:'mithboot', value:150, desc:'Botas de mithril: protección y casi sin peso (−2 % de velocidad).'},
  mithshield:   {name:'Escudo de mithril', icon:'mithshield', slot:'shield', gear:true, dur:120, armor:9, block:.87, shieldArt:'mithshield', value:225, desc:'Escudo de mithril: bloquea el 87 % del daño frontal.'},
});

// ---------- Trapis (tier 8 y 10) y botín general (desde el nivel 8 y 10; pesos moderados porque son 9 objetos por nivel) ----------
const GEAR8 = [['steelsword', 200], ['dwarfaxe', 200], ['dwarfmace', 210], ['dwarfcrossbow', 260], ['steelhelm', 190], ['steelmail', 320], ['steelgloves', 150], ['steelboots', 150], ['steelshield', 230]];
const GEAR10 = [['mithsword', 380], ['mithgreataxe', 450], ['mithbow', 360], ['mithdagger', 320], ['mithhelm', 340], ['mithmail', 550], ['mithgloves', 280], ['mithboots', 280], ['mithshield', 420]];
for(const [list, lvl] of [[GEAR8, 8], [GEAR10, 10]]){
  for(const [id, price] of list) SHOP.push({id, n:1, price, tier:lvl});
  for(const T of [LOOT.chestNormal, LOOT.chestRare]) for(const [id] of list) T.table.push({w: T === LOOT.chestRare ? 4 : 2, id, lvl});
  for(const [id] of list) LOOT.monsterTable.push({w:2, id, lvl});
}

// ---------- traducción ----------
Object.assign(LANG_EN, {
  'Espada de acero':'Steel sword', 'Hacha de combate enana':'Dwarven battle axe', 'Maza de guerra enana':'Dwarven war mace', 'Ballesta enana':'Dwarven crossbow', 'Casco de acero':'Steel helmet', 'Coraza de acero':'Steel cuirass', 'Guanteletes de acero':'Steel gauntlets', 'Grebas de acero':'Steel greaves', 'Escudo de acero':'Steel shield',
  'Espada de mithril':'Mithril sword', 'Hacha de mithril a dos manos':'Two-handed mithril axe', 'Arco de mithril':'Mithril bow', 'Daga de mithril':'Mithril dagger', 'Yelmo de mithril':'Mithril helm', 'Cota de mithril':'Mithril mail', 'Guantes de mithril':'Mithril gloves', 'Botas de mithril':'Mithril boots', 'Escudo de mithril':'Mithril shield',
  'Espada de acero templado de las forjas de la mina.':'Tempered steel sword from the mine forges.',
  'Hacha enana de filo dentado. El 35 % de los golpes provoca sangrado.':'Dwarven axe with a serrated edge. 35% of hits cause bleeding.',
  'Maza pesada de acero. El 30 % de los golpes aturde al enemigo.':'Heavy steel mace. 30% of hits stun the enemy.',
  'Ballesta de mecanismo enano: mucho daño, recarga lenta. Usa flechas.':'Dwarven mechanism crossbow: lots of damage, slow reload. Uses arrows.',
  'Casco de acero: más protección que el hierro, pero te hace un 5 % más lento.':'Steel helmet: more protection than iron, but makes you 5% slower.',
  'Coraza de acero: reduce mucho el daño que recibes, pero te hace un 10 % más lento.':'Steel cuirass: greatly reduces the damage you take, but makes you 10% slower.',
  'Guanteletes de acero: más protección y puñetazos más fuertes, pero te hacen un 4 % más lento.':'Steel gauntlets: more protection and stronger punches, but make you 4% slower.',
  'Grebas de acero: más protección, pero te hacen un 6 % más lento.':'Steel greaves: more protection, but make you 6% slower.',
  'Escudo de acero: bloquea el 84 % del daño frontal.':'Steel shield: blocks 84% of frontal damage.',
  'Espada ligera de mithril: mucho daño y +8 % de probabilidad de crítico.':'Light mithril sword: lots of damage and +8% critical chance.',
  'A dos manos: no permite llevar escudo. Ataque giratorio en área que golpea a todos los que te rodean.':'Two-handed: no shield allowed. Area spin attack that hits everyone around you.',
  'Arco de mithril: mucho daño y +8 % de probabilidad de crítico. Usa flechas.':'Mithril bow: lots of damage and +8% critical chance. Uses arrows.',
  'Daga rápida de mithril. 40 % de probabilidad de envenenar.':'Fast mithril dagger. 40% chance to poison.',
  'Yelmo de mithril: mucha protección y casi no pesa (−2 % de velocidad).':'Mithril helm: lots of protection and nearly weightless (−2% speed).',
  'Cota de mithril: protección excelente con poco peso (−4 % de velocidad).':'Mithril mail: excellent protection with little weight (−4% speed).',
  'Guantes de mithril: protección, puñetazos más fuertes y casi sin peso.':'Mithril gloves: protection, stronger punches and almost weightless.',
  'Botas de mithril: protección y casi sin peso (−2 % de velocidad).':'Mithril boots: protection and almost weightless (−2% speed).',
  'Escudo de mithril: bloquea el 87 % del daño frontal.':'Mithril shield: blocks 87% of frontal damage.',
});
LANG.load(LANG_EN);
