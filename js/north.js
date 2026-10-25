'use strict';
// =====================================================================
//  Expedición 13 · El pueblo del norte (conectada a la ciudad flotante): nieve vikinga, guerreras, lobos de guerra,
//  arqueros de escarcha, cuervos de Odín y el gigante de hielo Jötunn. Misión de Alexandra: «Tráeme su cabeza».
// =====================================================================
EXPEDITIONS.push({id:'northvillage', from:'floatcity', prevLvl:11, lvl:13, name:'El pueblo del norte', mapX:.76, mapY:.02, boss:'jotunn',
  desc:'Un pueblo vikingo enterrado en nieve eterna, a orillas de un fiordo helado. Un gigante de hielo, Jötunn, ha invadido sus casas largas y sus guerreros caídos siguen vigilando las calles.',
  monsters:'Guerreras vikingas, lobos de guerra, arqueros de escarcha y cuervos de Odín. Jefe: Jötunn, gigante de hielo'});
QUEST_OF.northvillage = 'jotunn';
QUESTS.push({id:'jotunn', giver:'alexandra', exp:'northvillage', title:'Tráeme su cabeza',
  offer:['Un jotunn gigante ha invadido mi pueblo, en el norte. Mi familia sigue allí, escondida bajo la nieve.', 'Si me traes su cabeza te daré 15.000 de oro y la llave mágica que abre el puente hacia la tierra de los dragones.', 'La cabeza es un objeto de misión verde fluorescente. Si mueres con ella la perderás.'],
  met:() => countItem('jotunnhead') > 0, obj:() => ['Derrota al gigante Jötunn', 'en el pueblo del norte', 'y trae su cabeza (objeto verde)', countItem('jotunnhead') > 0 ? '✔ La tienes: llévasela a Alexandra' : '✘ Aún no la has conseguido'],
  ready:['¡La cabeza del jotunn! Mi pueblo puede respirar por fin.', 'Aquí tienes tus 15.000 de oro y la llave mágica del puente de los dragones.'],
  reward:() => { takeItem('jotunnhead'); G.save.wallet += 15000; giveQuestItem('dragonkey', 1); toast('+15.000 de oro (guardados en la guarida)', 4.5); sfx('coin'); }});
GIVER_HERE.alexandra = () => G.save.alexandraHome;

// ---------- objetos: de la tienda (nivel 13), de misión, únicos del jefe y legendarios ----------
iconFrom([
  ['vikingaxe', 'axe', {s:'#e8f0ff', M:'#aeb8c8', m:'#5a6070', b:'#3a2414', B:'#6a4a2a'}],
  ['vikingshield', 'buckler', {m:'#8a5a2a', M:'#d8a850', B:'#c83a3a', b:'#7a1c1c', d:'#2a1a0e', G:'#e8e8e8', g:'#8a8e98'}],
  ['vikinghelm', 'helmet', {L:'#8a8e98', l:'#d8dce8', d:'#3a3e48', s:'#e8d8a0'}],
  ['jotunnhead', 'blackpearl', {B:'#39ff14', b:'#b8ffa0', w:'#ffffff'}],
  ['dragonkey', 'minekey', {Y:'#ffd84a', y:'#c8641a'}],
  ['jotunnaxe', 'axe', {s:'#e8faff', M:'#7ac8f0', m:'#2e6a98', b:'#102a50', B:'#2a4a78'}],
  ['jotunnmail', 'chestarmor', {L:'#5aa0d0', l:'#d8f4ff', d:'#1c3a68', s:'#ffffff'}],
  ['jotunncrown', 'helmet', {L:'#8ad0f0', l:'#f0fcff', d:'#2e6a98', s:'#ffffff'}],
  ['jotunnboots', 'boots', {L:'#5aa0d0', l:'#c8ecff', d:'#1c3a68', s:'#ffffff'}],
  ['mjolnir', 'mace', {M:'#aeb8c8', m:'#5a6070', s:'#7ac8ff', b:'#3a2a1a', B:'#6a4a2a'}],
  ['fenrirfang', 'dagger', {w:'#f0f4ff', s:'#8a90a8', g:'#7ae8ff', b:'#1a1c26'}],
  ['valhallashield', 'aegis', {m:'#1c2a5a', M:'#ffd84a', i:'#2a5ac8', I:'#7ac8ff', g:'#ffffff'}],
  ['norsehorn', 'nacreshell', {W:'#e8d8a0', w:'#fff4c8', p:'#8a6a2a'}],
  ['runestone', 'blackpearl', {B:'#5a6070', b:'#8a90a0', w:'#7ac8ff'}],
  ['vikingbracelet', 'goldanchor', {G:'#e8b84a', g:'#8a5a1a'}],
  ['thorhammer', 'tidecompass', {G:'#aeb8c8', g:'#5a6070', w:'#7ac8ff', R:'#ffd84a', N:'#c83a3a'}],
  ['draupnir', 'oceanheart', {C:'#ffe08a', c:'#c8962e', W:'#ffffff', d:'#6a4a10'}],
]);
ART.vikingshield = SP(paintSprite(14, 14, [{e:[7, 7, 6.5, 6.5], c:['#4a2e16', '#8a5a2a', '#d8a850']}, {e:[7, 7, 4.2, 4.2], c:['#7a1c1c', '#c83a3a', '#e86a5a']}, {e:[7, 7, 1.8, 1.8], c:['#8a8e98', '#e8ecf4']}, {l:[7, 1, 7, 13, .8], c:['#d8a850']}, {l:[1, 7, 13, 7, .8], c:['#d8a850']}]), 7, 7);
ART.valhalla = SP(paintSprite(14, 15, [{poly:[[0, 0], [14, 0], [14, 7], [7, 15], [0, 7]], c:['#1c2a5a', '#2a5ac8', '#7ac8ff']}, {poly:[[2, 2], [12, 2], [12, 7], [7, 12], [2, 7]], c:['#0e1634', '#1c2a5a', '#2a5ac8']}, {l:[7, 3, 7, 11, 1.2], c:['#ffd84a', '#fff0a0']}, {l:[4, 6, 10, 6, 1.2], c:['#ffd84a', '#fff0a0']}, {p:[[7, 1, '#ffffff']]}]), 7, 7);
Object.assign(ITEMS, {
  vikingaxe:    {name:'Hacha vikinga', icon:'vikingaxe', slot:'weapon', kind:'axe', gear:true, dur:170, dmg:[74, 100], bleedChance:.4, value:420, desc:'Hacha de guerra de los vikingos del norte. El 40 % de los golpes provoca sangrado.'},
  vikingshield: {name:'Escudo vikingo', icon:'vikingshield', slot:'shield', gear:true, dur:130, armor:6, block:.86, shieldArt:'vikingshield', value:400, desc:'Escudo redondo de madera y hierro. Bloquea el 86 % del daño frontal.'},
  vikinghelm:   {name:'Casco vikingo', icon:'vikinghelm', slot:'head', gear:true, armor:12, ov:'jvikinghelm', value:380, desc:'Casco de hierro con protector nasal, forjado en el norte.'},
  jotunnhead:   {name:'Cabeza del jotunn', icon:'jotunnhead', quest:true, rar:'quest', value:0, desc:'Objeto de misión. La cabeza helada de Jötunn: llévasela a Alexandra. Si mueres con ella la perderás.'},
  dragonkey:    {name:'Llave mágica del puente de los dragones', icon:'dragonkey', quest:true, key:true, stack:1, value:0, desc:'Una llave de escamas doradas. Abrirá el puente hacia la tierra de los dragones.'},
  jotunnaxe:    {name:'Hacha helada de Jötunn', icon:'jotunnaxe', slot:'weapon', kind:'axe', gear:true, unique:true, dur:190, dmg:[82, 108], freezeChance:.35, value:450, fixed:[{k:'dmg', v:8}, {k:'crit', v:8}], desc:'Objeto único de Jötunn, gigante de hielo. El 35 % de los golpes congela al enemigo.'},
  jotunnmail:   {name:'Coraza de escarcha eterna', icon:'jotunnmail', slot:'chest', gear:true, unique:true, armor:22, ov:'ujotunnmail', value:450, fixed:[{k:'hp', v:55}, {k:'eleres', v:25}], desc:'Objeto único de Jötunn, gigante de hielo. Placas de hielo que nunca se funden.'},
  jotunncrown:  {name:'Corona de hielo del gigante', icon:'jotunncrown', slot:'head', gear:true, unique:true, armor:10, ov:'ujotunncrown', value:450, fixed:[{k:'hp', v:45}, {k:'crit', v:8}], desc:'Objeto único de Jötunn, gigante de hielo.'},
  jotunnboots:  {name:'Botas del gigante', icon:'jotunnboots', slot:'feet', gear:true, unique:true, armor:5, move:10, ov:'ujotunnboot', value:450, fixed:[{k:'hp', v:35}, {k:'stam', v:25}], desc:'Objeto único de Jötunn, gigante de hielo. Cada paso deja escarcha.'},
  mjolnir:      {name:'Mjölnir', icon:'mjolnir', slot:'weapon', kind:'mace', gear:true, unique:true, legend:true, lvl:13, dur:200, dmg:[100, 134], value:480, desc:'Objeto legendario. Trueno: el 20 % de los golpes invoca un rayo que daña y aturde a los enemigos cercanos al golpeado.'},
});
regOv('jvikinghelm', 'helmet', {L:'#8a8e98', l:'#d8dce8', d:'#3a3e48'});
uniqueOv('ujotunnmail', 'chest', {L:'#5aa0d0', l:'#d8f4ff', d:'#1c3a68'}); uniqueOv('ujotunncrown', 'helmet', {L:'#8ad0f0', l:'#f0fcff', d:'#2e6a98'}); uniqueOv('ujotunnboot', 'boot', {L:'#5aa0d0', l:'#c8ecff', d:'#1c3a68'});
W12_TINT.mjolnir = ['#aeb8c8', '#7ac8ff']; W12_TINT.fenrirfang = ['#f0f4ff'];
LEGEND_IDS.push('mjolnir');
EX('fenrirfang', 'northvillage', {name:'Colmillo de Fenrir', slot:'weapon', kind:'dagger', dur:170, dmg:[70, 92], crit:10, desc:'Objeto legendario del pueblo del norte. Presa: todos los golpes provocan sangrado 6 s y haces un 25 % más de daño a los enemigos que sangran.'});
EX('valhallashield', 'northvillage', {name:'Escudo del Valhalla', slot:'shield', dur:200, armor:8, block:.9, shieldArt:'valhalla', fixed:[{k:'hp', v:40}], desc:'Objeto legendario del pueblo del norte. Bloquea el 90 % del daño frontal y el 35 % de los golpes bloqueados congela al atacante 1,5 s.'});
EXCL_LEGENDS.northvillage = ['fenrirfang', 'valhallashield']; EXCL_IDS.push('fenrirfang', 'valhallashield');
Object.assign(ITEMS, {
  norsehorn:      TRz('Cuerno de hidromiel', 'norsehorn', 380, 'Todavía huele a miel.'),
  runestone:      TRz('Piedra rúnica', 'runestone', 330, 'Las runas brillan débilmente.'),
  vikingbracelet: TRz('Brazalete vikingo', 'vikingbracelet', 560, 'Oro macizo grabado con serpientes.'),
  thorhammer:     TRz('Martillo de Thor en miniatura', 'thorhammer', 1000, 'Muy extraño: huele a tormenta.'),
  draupnir:       TRz('Anillo de Draupnir', 'draupnir', 2100, 'Muy extraño: cada nueve noches nacen de él otros ocho anillos.'),
});
TREASURE_POOL.nor = [{id:'norsehorn', w:8}, {id:'runestone', w:8}, {id:'vikingbracelet', w:5}, {id:'thorhammer', w:1}, {id:'draupnir', w:.45}];
TREASURE_ZONES.northvillage = 'nor';
for(const [id, price] of [['vikingaxe', 520], ['vikingshield', 480], ['vikinghelm', 460]]) SHOP.push({id, n:1, price, tier:13});
for(const T of [LOOT.chestNormal, LOOT.chestRare]){ const r = T === LOOT.chestRare; for(const id of ['vikingaxe', 'vikingshield', 'vikinghelm']) T.table.push({w:r ? 4 : 2, id, lvl:13}); }
for(const id of ['vikingaxe', 'vikingshield', 'vikinghelm']) LOOT.monsterTable.push({w:3, id, lvl:13});

// ---------- monstruos ----------
ORC_CFG.shieldmaiden = {human:true, skin:['#f4dcc8', '#dcb898', '#a88868'], hair:['#d8b058'], hood:['#9aa0aa', '#d8dce8', '#4a4e5a'], tunic:['#2a4a78', '#4a78b8', '#16284a'], leg:['#3a2a1a', '#6a4a2e'], weapon:'axe', armor:'vest', hat:'helm', braids:true, noPaint:true, armW:4};
ORC_CFG.icearcher = {human:true, skin:['#e8d8c8', '#c8aa90', '#98785a'], hair:['#e8e8f0'], hood:['#e8f0f8', '#ffffff', '#8aa8c8'], tunic:['#6a8ab0', '#9ac0e0', '#3a5a80'], leg:['#3a4a60', '#6a7a90'], weapon:'bow', armor:'vest', noPaint:true, armW:3};
ORC_CFG.jotunn = {human:true, skin:['#cfe8f8', '#9ac4e0', '#5a88b0'], hair:['#ffffff'], hood:['#8ac8f0', '#d0f0ff', '#3a6a98'], tunic:['#2a4a78', '#5a8ac0', '#102a50'], leg:['#102a50', '#2a4a78'], weapon:'hammer', armor:'plate', hat:'helm', crown:true, braids:true, pauldron:true, noPaint:true, armW:6};
for(const [id, k] of [['shieldmaiden', 1.1], ['icearcher', 1.05], ['jotunn', 2.5]]){
  const c = ORC_CFG[id]; regMon(id, {w:Math.round(64*k), h:Math.round(56*k), ax:Math.round(24*k), ay:Math.round(54*k), canvas:f => oScaled(orcCanvas(f, c), k)});
}
regMon('warwolf', {w:70, h:46, ax:31, ay:44, shapes:f => scl(petQuad(f, {pal:['#2e323e', '#4a5060', '#7a8298', '#c8ccd8'], ears:'pointy', tail:'fox', tip:'#c8ccd8', tex:1301, dk:'#14161c', eye:'#ff4a3a', legW:2.8}), 1.8)});
regMon('raven', {w:28, h:20, ax:13, ay:19, shapes:f => petBird(f, {pal:['#08080e', '#14141e', '#2a2a3a', '#4a4a5c'], tex:1311, beak:'#c8962e'})});
Object.assign(MONSTERS, {
  shieldmaiden:{name:'Guerrera vikinga', art:'shieldmaiden', ai:'archer', hp:1500, dmg:170, spd:92, r:11, xp:190, reach:0, prep:.6, range:[140, 230], shot:{kind:'axe', spd:290, r:5, life:1.1, bleed:true}, north:true},
  warwolf:     {name:'Lobo de guerra gigante', art:'warwolf', ai:'walk', hp:2200, dmg:190, spd:150, r:15, xp:210, reach:24, prep:.4, crit:.4, critMul:2.4, leaper:true, bleedHit:true, north:true},
  icearcher:   {name:'Arquero de escarcha', art:'icearcher', ai:'archer', hp:1300, dmg:95, spd:84, r:9, xp:170, reach:0, prep:.7, range:[170, 290], shot:{kind:'arrow', spd:300, r:3, life:1.3, ice:true, slow:2.5, volley:3, spread:.2, freezeP:.55, freezeT:1.4}, north:true},
  raven:       {name:'Cuervo de Odín', art:'raven', ai:'float', hp:260, dmg:70, spd:170, r:7, xp:30, reach:14, prep:.3, bleedHit:true, north:true},
  jotunn:      {name:'Jötunn, gigante de hielo', art:'jotunn', ai:'brain', brain:'jotunn', hp:30000, dmg:260, spd:60, r:36, xp:3200, reach:0, prep:.6, boss:true, questDrop:'jotunnhead', questId:'jotunn', uniques:['jotunnaxe', 'jotunnmail', 'jotunncrown', 'jotunnboots']},
});
Object.assign(RARE_PREFIX, {shieldmaiden:['Hacha Roja', 'Valquiria', 'Furia Nevada', 'Escudera'], warwolf:['Colmillo', 'Sombra Blanca', 'Aullador', 'Fenriano'], icearcher:['Ojo de Hielo', 'Escarcha', 'Cazador Blanco', 'Ventisca'], raven:['Huginn', 'Muninn', 'Presagio', 'Sombra'], jotunn:['Gigante']});
Object.assign(MON_COLORS, {shieldmaiden:['#4a78b8', '#c83a3a', '#e8e8f0'], warwolf:['#4a5060', '#ff4a3a', '#c8ccd8'], icearcher:['#9ac0e0', '#7ac8f0', '#ffffff'], raven:['#14141e', '#c8962e', '#4a4a5c'], jotunn:['#9ac4e0', '#aee8ff', '#ffffff']});

// ---------- Jötunn: puñetazo glacial, corona de escarcha, avalancha de bolas, rugido que llama a los cuervos, pisotón en oleadas; en fase 2 ventisca y salto ----------
BRAINS.jotunn = {wake:'¡Jötunn, el gigante de hielo, se levanta!', rage:'¡Jötunn ruge y el fiordo se congela!', col:'#aee8ff', chargeSpd:380, keep:80, dust:'#dce8f4', p2spd:1.3, dizzy:1.4,
  attacks:[
    {id:'smash', name:'Puñetazo glacial', prep:.85, w:26, max:150, warn:130, cast:m => { bossSlam(m, 130, 1.3, '#aee8ff'); bossRain(m, ['frost'], 4, 170, .9); }},
    {id:'spikes', name:'Corona de escarcha', prep:1.1, w:20, cast:m => { const a0 = Math.random()*Math.PI; for(let i = 0; i < 6; i++) bossBeam(m, a0 + i*Math.PI/3, 1, 32, 460, 1.2, '#aee8ff', 'freeze'); }},
    {id:'snowballs', name:'Avalancha de bolas', prep:.9, w:18, min:120, cast:m => bossFan(m, 7, .22, 230, .9, () => ({kind:'snowball', r:9, slow:2.5}))},
    {id:'howl', name:'Rugido gélido', prep:1.1, w:12, warn:320, cast:m => { bossSummon(m, ['raven'], 8, 16); if(Math.hypot(P.x - m.x, P.y - m.y) < 320){ P.slowT = Math.max(P.slowT || 0, 3); addText(P.x, P.y - 62, '¡Ralentizado!', '#a0d8ff', 8); } G.shake = Math.max(G.shake, 10); ring(m.x, m.y - 40, 170, '#aee8ff', .6); }},
    {id:'stomp', name:'Pisotón de gigante', prep:1, w:16, cast:m => { bossSlam(m, 110, 1.1, '#aee8ff'); bossBarrage(m, 6, .95); }},
    {id:'charge', name:'¡Embestida!', prep:1, w:12, min:170, cast:m => bossChargeStart(m)},
    {id:'blizzard', name:'¡Ventisca!', prep:1.2, w:18, p2:true, cast:m => { bossPull(m, 2.8, 430, 135, .9); (m.later = m.later || []).push({t:2.8, fn:mm => { bossRain(mm, ['frost', 'boom'], 8, 260, 1); }}); }},
    {id:'leap', name:'¡Salto del gigante!', prep:.9, w:14, p2:true, min:140, cast:m => bossLeap(m, P.x, P.y, .85)},
  ],
  land:m => { bossSlam(m, 140, 1.5, '#aee8ff'); bossRingBooms(m, 12, 200, 1); }};

// ---------- mascotas (el usuario permitió seguir sin tabla previa) ----------
function petSnake(f, o){
  const w = f === 1 ? 1.5 : f === 2 ? -1.5 : 0, c = o.pal, s = [];
  for(let i = 0; i < 6; i++){ const x = 3 + i*3.6, y = 17 + Math.sin(i*1.2 + w)*3; s.push({e:[x, y, 3.6, 3.2], c, tex:o.tex + i}); }
  s.push({e:[24, 11, 4.4, 3.8], c}, {poly:[[27, 10], [31, 12], [27, 13]], c:c.slice(1)}, {p:[[25, 9, '#ffe84a'], [26, 9, '#101010'], [30, 13, '#ff4a4a'], [31, 14, '#ff4a4a']]});
  return s;
}
Object.assign(PET_SHAPES, {
  husky:    {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#7a7e8a', '#aeb2c0', '#e0e4ee', '#ffffff'], ears:'pointy', tail:'fox', tip:'#ffffff', tex:1321, dk:'#3a3e4a', eye:'#60c8ff', collar:['#c83a3a', '#ff7a6a']})},
  ratatosk: {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#8a3a14', '#c8641a', '#f0a850', '#ffe0b0'], ears:'pointy', tail:'fox', tip:'#fff0d0', tex:1331, dk:'#4a2008', eye:'#101010', legW:1.8})},
  cabrito:  {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#b8b0a0', '#dcd4c4', '#f4eee4', '#ffffff'], ears:'horns', horn:['#6a5a3a', '#a8946a'], tail:'short', tex:1341, dk:'#6a6458', legW:2})},
  huginn:   {w:28, h:20, ax:13, ay:19, fly:true, shapes:f => petBird(f, {pal:['#0a0a12', '#1c1c2a', '#34344a', '#5a5a74'], tex:1351, beak:'#c8962e'})},
  alce:     {w:38, h:27, ax:17, ay:26, shapes:f => petQuad(f, {pal:['#4a3220', '#6a4a2e', '#8a6a44', '#b08a5a'], ears:'antlers', horn:['#d8c8a0', '#fff0c8'], tail:'short', tex:1361, dk:'#241408', legW:2})},
  fenrisito:{w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#3a3e4a', '#5a5e6e', '#8a8ea0', '#c8ccd8'], ears:'pointy', tail:'fox', tip:'#c8ccd8', tex:1371, dk:'#14161c', eye:'#ff5a3a', legW:2.4})},
  sleipnir: {w:40, h:28, ax:18, ay:27, shapes:f => petQuad(f, {pal:['#9aa0ae', '#c4c8d4', '#e4e8f0', '#ffffff'], ears:'round', tail:'long', mane:['#6a7080', '#c4c8d4'], tex:1381, dk:'#4a4e5a', legW:1.6,
              extra:lg => [{l:[10, 20, 9, 26, 1.4], c:'#6a7080'}, {l:[13, 20, 14, 26, 1.4], c:'#6a7080'}, {l:[20, 20, 19, 26, 1.4], c:'#6a7080'}, {l:[23, 20, 24, 26, 1.4], c:'#6a7080'}]})},
  jormun:   {w:34, h:26, ax:15, ay:23, shapes:f => petSnake(f, {pal:['#1c4a3a', '#2e7a58', '#5ac88a', '#a8f0c8'], tex:1391})},
  gullin:   {w:40, h:26, ax:18, ay:25, glow:'#ffd84a', shapes:f => petQuad(f, {pal:['#a07a1a', '#d0a82a', '#f0d060', '#fff0a0'], ears:'round', tail:'short', tex:1401, dk:'#5a420a', legW:3, eye:'#ff4a3a',
              extra:lg => [{poly:[[29 + lg, 14], [34 + lg, 16], [29 + lg, 17]], c:['#fff8e0', '#ffffff']}, {poly:[[27 + lg, 13], [27 + lg, 9], [30 + lg, 13]], c:['#fff8e0', '#ffffff']}]})},
  berserker:{w:42, h:28, ax:19, ay:27, shapes:f => petQuad(f, {pal:['#4a3220', '#6a4a2e', '#8a6a44', '#b08a5a'], ears:'round', tail:'short', tex:1411, dk:'#241408', legW:3.6, eye:'#ff3a2a', snout:['#b08a5a', '#d8b888'],
              extra:lg => [{p:[[26 + lg, 6, '#c83a3a'], [27 + lg, 7, '#c83a3a'], [28 + lg, 8, '#c83a3a'], [12, 9, '#c83a3a'], [13, 10, '#c83a3a']]}]})},
  fenrir:   {w:46, h:30, ax:21, ay:29, glow:'#7ae8ff', shapes:f => petQuad(f, {pal:['#14161e', '#2a2e3c', '#50566e', '#8a90a8'], ears:'pointy', tail:'fox', tip:'#8a90a8', mane:['#2a2e3c', '#50566e', '#8a90a8'], tex:1421, dk:'#0a0a10', eye:'#7ae8ff', legW:3, collar:['#8a90a8', '#c8ccd8']})},
});
regPets(['husky', 'ratatosk', 'cabrito', 'huginn', 'alce', 'fenrisito', 'sleipnir', 'jormun', 'gullin', 'berserker', 'fenrir'], {
  husky:    {exp:13, name:'Husky', rarity:'normal', look:'Perro de trineo', beh:'pounce', dmg:[12, 16], cd:1.5, bites:2, affixes:['rastreador'], attack:'Doble mordisco rápido'},
  ratatosk: {exp:13, name:'Ratatoskr', rarity:'normal', look:'Ardilla del Yggdrasil', beh:'pounce', dmg:[12, 16], cd:1.3, bites:2, affixes:['veloz'], attack:'Doble mordisco rápido'},
  cabrito:  {exp:13, name:'Cabrito de Thor', rarity:'normal', look:'Cabra del carro de Thor', beh:'charge', dmg:[12, 16], cd:2.4, miniStun:true, affixes:['robusta'], attack:'Cornada que aturde 0,5 s'},
  huginn:   {exp:13, name:'Huginn', rarity:'normal', look:'Cuervo del pensamiento', beh:'flyer', dmg:[11, 15], cd:.9, affixes:['olfato'], attack:'Picotazos desde el aire'},
  alce:     {exp:13, name:'Alce joven', rarity:'normal', look:'Cría de alce', beh:'charge', dmg:[12, 16], cd:2.4, miniStun:true, affixes:['dura'], attack:'Embestida con la cornamenta que aturde 0,5 s'},
  fenrisito:{exp:13, name:'Fenrisito', rarity:'magic', look:'Lobezno de Fenrir', beh:'pounce', dmg:[18, 24], cd:1.6, bites:2, bleed:1, affixes:['sangrienta', 'rastreador'], attack:'Doble mordisco con sangrado'},
  sleipnir: {exp:13, name:'Sleipnir', rarity:'magic', look:'Potro de ocho patas', beh:'charge', dmg:[18, 24], cd:2.6, knock:true, affixes:['veloz', 'valiente'], attack:'Coz que empuja'},
  jormun:   {exp:13, name:'Jörmun', rarity:'magic', look:'Cría de la serpiente de Midgard', beh:'pounce', dmg:[18, 24], cd:1.7, bites:1, affixes:['venenosa', 'espinosa'], attack:'Mordisco venenoso'},
  gullin:   {exp:13, name:'Gullinbursti', rarity:'rare', look:'Jabalí de cerdas de oro', beh:'charge', dmg:[30, 40], cd:3, knock:true, shock:true, affixes:['feroz', 'robusta', 'dura', 'luciernaga'], attack:'Embestida con onda de choque que aturde'},
  berserker:{exp:13, name:'Oso berserker', rarity:'rare', look:'Oso poseído por la furia', beh:'pounce', dmg:[30, 40], cd:1.8, bites:2, bleed:1, affixes:['feroz', 'sangrienta', 'vampirica', 'centinela'], attack:'Doble zarpazo con sangrado'},
  fenrir:   {exp:13, name:'Fenrir', rarity:'legendary', look:'El lobo que devorará a Odín', beh:'pounce', dmg:[34, 44], cd:1.7, bites:2, bleed:1, legendary:true, warcry:true, skillName:'¡Aullido de Ragnarök!', affixes:['feroz', 'helada', 'temible', 'indomable'],
             attack:'Doble mordisco con sangrado. Aullido de Ragnarök cada 20 s: los enemigos cercanos huyen 3 s y haces +25 % de daño 5 s'},
}, PET_SHAPES);

// ---------- mapa: aldea vikinga junto a un fiordo helado ----------
ART.longhouse = SP(paintSprite(70, 46, [
  {r:[4, 18, 62, 26], c:['#3a2414', '#5a3a22', '#8a6040'], tex:1431},
  {poly:[[0, 20], [10, 3], [60, 3], [70, 20]], c:['#9ab0c8', '#d0dcea', '#f4f8ff']}, {poly:[[4, 20], [12, 7], [58, 7], [66, 20]], c:['#7a90a8', '#aec0d4']},
  {l:[0, 20, 70, 20, 2.4], c:['#2a1a0e']}, {r:[29, 26, 12, 18], c:['#120a06', '#24160c']}, {p:[[14, 28, '#ffd070'], [15, 28, '#ffd070'], [14, 29, '#ffd070'], [54, 28, '#ffd070'], [55, 28, '#ffd070'], [54, 29, '#ffd070']]},
  {e:[10, 36, 3.6, 3.6], c:['#8a1c1c', '#c83a3a', '#e8e8e8']}, {e:[60, 36, 3.6, 3.6], c:['#1c3a8a', '#4a78c8', '#e8e8e8']},
  {l:[10, 3, 6, -2, 1.6], c:['#3a2414']}, {l:[60, 3, 64, -2, 1.6], c:['#3a2414']},
]), 35, 44);
ART.runestone = SP(paintSprite(14, 22, [{poly:[[1, 21], [3, 3], [7, 0], [12, 4], [13, 21]], c:['#3a3e4a', '#5a6070', '#8a90a0']}, {p:[[7, 6, '#7ac8ff'], [7, 7, '#7ac8ff'], [6, 9, '#7ac8ff'], [8, 9, '#7ac8ff'], [7, 11, '#7ac8ff'], [7, 12, '#7ac8ff'], [6, 14, '#7ac8ff'], [8, 14, '#7ac8ff']]}]), 7, 21);
const NOR_SNOW = ['#aebed0', '#bccadb', '#cad6e4', '#d8e2ee'], NOR_ICE = ['#16304a', '#1c3c5c', '#244a70', '#2c5a84'];
function buildNorthVillage(seed){
  const sc = buildRectWorld({id:'northvillage', name:'El pueblo del norte', lvl:13, petExp:13, cols:3, rows:4, nodeW:[340, 420], nodeH:[290, 350], boss:{w:660, h:540}, spacingX:520, spacingY:450,
    solid:'water', darkness:.84, loops:.35, warm:true, lightA:.8, corridor:64,
    floor:(x, y, e) => e ? '#7a8aa0' : NOR_SNOW[tq(vnoise(x/14, y/14, 541)*.6 + hash(x, y, 542)*.3, x, y, 4)],
    void:(x, y, near) => near ? '#c8d8e8' : NOR_ICE[tq(vnoise(x/14, y/14, 543)*.7 + hash(x, y, 544)*.3, x, y, 4)],
    groups:[['shieldmaiden', 'warwolf'], ['warwolf', 'warwolf', 'icearcher'], ['icearcher', 'shieldmaiden', 'icearcher'], ['warwolf', 'shieldmaiden', 'warwolf'], ['shieldmaiden', 'shieldmaiden', 'icearcher', 'warwolf']],
    decor:(sc, n, H) => {
      for(let i = 0; i < 2; i++){ const p = H.pointOn(n, 34); if(!p) continue; propSprite(sc, ART.longhouse, p.x, p.y, {t:'r', x:p.x - 30, y:p.y - 12, w:60, h:12}, [30, 5]); sc.lights.push({x:p.x, y:p.y - 10, r:110, a:.6, warm:true, flick:.12}); }
      const cnt = Math.round(n.w*n.h/6500);
      for(let i = 0; i < cnt; i++){
        const p = H.pointOn(n, 12); if(!p) continue; const r = H.R();
        if(r < .5) propSprite(sc, ART.snowpine, p.x, p.y, {t:'c', x:p.x, y:p.y - 2, r:6}, [14, 3]);
        else if(r < .66) propSprite(sc, ART.barrel, p.x, p.y, {t:'c', x:p.x, y:p.y - 2, r:6}, [6, 2]);
        else if(r < .8) propSprite(sc, ART.runestone, p.x, p.y, {t:'c', x:p.x, y:p.y - 3, r:5}, [8, 2]);
        else if(r < .92){ const t = propSprite(sc, ART.torch, p.x, p.y, {t:'c', x:p.x, y:p.y - 2, r:3}); sc.lights.push({x:p.x, y:p.y - 14, r:90, a:.6, warm:true, flick:.25}); t.draw = function(){ drawSP(ART.torch, p.x, p.y); drawFlames(p.x, p.y - 16, .25); }; }
        else { const f = propSprite(sc, ART.campfire, p.x, p.y, {t:'c', x:p.x, y:p.y - 2, r:7}); f.draw = function(){ drawSP(ART.campfire, p.x, p.y); drawFlames(p.x, p.y - 8, .6); }; sc.lights.push({x:p.x, y:p.y - 10, r:130, a:.7, warm:true, flick:.12}); }
      }
    },
    bossDecor:(sc, n, H) => {   // plaza del gigante despejada: solo cristales de hielo sin colisión en el borde
      for(let i = 0; i < 12; i++){ const a = i/12*Math.PI*2, x = Math.round(n.x + Math.cos(a)*(n.w/2 - 36)), y = Math.round(n.y + Math.sin(a)*(n.h/2 - 36)); if(H.walk(x, y)){ propSprite(sc, ART.snowpine, x, y, null); } }
      sc.lights.push({x:n.x, y:n.y, r:300, a:.55, warm:false, flick:.06});
    }}, seed);
  // los cuervos de Odín van en bandadas de 10 o 20
  const spots = sc.monsterSpawns.slice().sort(() => Math.random() - .5).slice(0, 6);
  for(const sp of spots){ const n = Math.random() < .5 ? 10 : 20, pack = []; for(let i = 0; i < n; i++) pack.push({type:'raven', rarity:'normal'}); sc.monsterSpawns.push({x:sp.x + 40, y:sp.y - 40, pack}); }
  return sc;
}
RAID_BUILDERS.northvillage = buildNorthVillage;

// ---------- efectos de los legendarios del norte ----------
{
  const _after = world12After, _melee = world12Melee;
  world12Melee = function(w, m, crit, fx2, out){ _melee(w, m, crit, fx2, out); if(w && w.id === 'fenrirfang') fx2.bleed = 6; };
  world12After = function(m, dmg, crit, out){
    _after(m, dmg, crit, out);
    const w = curWeapon();
    if(w && w.id === 'mjolnir' && Math.random() < .2 && !m.dying){   // trueno
      addText(m.x, m.y - m.r*2 - 30, '¡Trueno!', '#ffe84a', 8); sfx('boom'); G.shake = Math.max(G.shake, 5); pixLine(m.x, m.y - 150, m.x, m.y - 6, 3, '#ffffff'); ring(m.x, m.y - 6, 70, '#ffe84a', .35);
      for(const o of G.mons) if(!o.dying && Math.hypot(o.x - m.x, o.y - m.y) < 80){ const dd = Math.hypot(o.x - m.x, o.y - m.y) || 1; hitMonster(o, Math.round(dmg*1.2), {src:'player', nx:(o.x - m.x)/dd, ny:(o.y - m.y)/dd, k:160, stun:.6}); }
    }
  };
}
Object.assign(LANG_EN, {
  'El pueblo del norte':'The northern village', 'Un pueblo vikingo enterrado en nieve eterna, a orillas de un fiordo helado. Un gigante de hielo, Jötunn, ha invadido sus casas largas y sus guerreros caídos siguen vigilando las calles.':'A Viking village buried in eternal snow on the shore of a frozen fjord. An ice giant, Jötunn, has invaded its longhouses and its fallen warriors still watch the streets.',
  'Guerreras vikingas, lobos de guerra, arqueros de escarcha y cuervos de Odín. Jefe: Jötunn, gigante de hielo':'Viking shieldmaidens, war wolves, frost archers and Odin\'s ravens. Boss: Jötunn, ice giant',
  'Tráeme su cabeza':'Bring me its head', 'Un jotunn gigante ha invadido mi pueblo, en el norte. Mi familia sigue allí, escondida bajo la nieve.':'A giant jotunn has invaded my village in the north. My family is still there, hiding under the snow.',
  'Si me traes su cabeza te daré 15.000 de oro y la llave mágica que abre el puente hacia la tierra de los dragones.':'If you bring me its head I will give you 15,000 gold and the magic key that opens the bridge to the land of dragons.',
  'La cabeza es un objeto de misión verde fluorescente. Si mueres con ella la perderás.':'The head is a fluorescent green quest item. If you die carrying it you will lose it.',
  '¡La cabeza del jotunn! Mi pueblo puede respirar por fin.':'The jotunn\'s head! My village can finally breathe.', 'Aquí tienes tus 15.000 de oro y la llave mágica del puente de los dragones.':'Here are your 15,000 gold and the magic key to the bridge of the dragons.',
  'Derrota al gigante Jötunn':'Defeat the giant Jötunn', 'en el pueblo del norte':'in the northern village', 'y trae su cabeza (objeto verde)':'and bring its head (green item)', '✔ La tienes: llévasela a Alexandra':'✔ You have it: take it to Alexandra', '✘ Aún no la has conseguido':'✘ You have not got it yet',
  '+15.000 de oro (guardados en la guarida)':'+15,000 gold (stored in the den)',
  'Hacha vikinga':'Viking axe', 'Escudo vikingo':'Viking shield', 'Casco vikingo':'Viking helm', 'Cabeza del jotunn':'Head of the jotunn', 'Llave mágica del puente de los dragones':'Magic key of the dragon bridge',
  'Hacha de guerra de los vikingos del norte. El 40 % de los golpes provoca sangrado.':'War axe of the northern Vikings. 40 % of hits cause bleeding.', 'Escudo redondo de madera y hierro. Bloquea el 86 % del daño frontal.':'Round shield of wood and iron. Blocks 86 % of frontal damage.', 'Casco de hierro con protector nasal, forjado en el norte.':'Iron helm with a nasal guard, forged in the north.',
  'Objeto de misión. La cabeza helada de Jötunn: llévasela a Alexandra. Si mueres con ella la perderás.':'Quest item. Jötunn\'s frozen head: take it to Alexandra. If you die carrying it you will lose it.', 'Una llave de escamas doradas. Abrirá el puente hacia la tierra de los dragones.':'A key of golden scales. It will open the bridge to the land of the dragons.',
  'Hacha helada de Jötunn':'Jötunn\'s Frozen Axe', 'Coraza de escarcha eterna':'Eternal Frost Cuirass', 'Corona de hielo del gigante':'Giant\'s Ice Crown', 'Botas del gigante':'Giant\'s Boots',
  'Objeto único de Jötunn, gigante de hielo. El 35 % de los golpes congela al enemigo.':'Unique item from Jötunn, ice giant. 35 % of hits freeze the enemy.', 'Objeto único de Jötunn, gigante de hielo. Placas de hielo que nunca se funden.':'Unique item from Jötunn, ice giant. Ice plates that never melt.', 'Objeto único de Jötunn, gigante de hielo.':'Unique item from Jötunn, ice giant.', 'Objeto único de Jötunn, gigante de hielo. Cada paso deja escarcha.':'Unique item from Jötunn, ice giant. Every step leaves frost.',
  'Mjölnir':'Mjölnir', 'Objeto legendario. Trueno: el 20 % de los golpes invoca un rayo que daña y aturde a los enemigos cercanos al golpeado.':'Legendary item. Thunder: 20 % of hits call a lightning bolt that damages and stuns enemies near the one struck.',
  'Colmillo de Fenrir':'Fenrir\'s Fang', 'Escudo del Valhalla':'Valhalla Shield', 'Objeto legendario del pueblo del norte. Presa: todos los golpes provocan sangrado 6 s y haces un 25 % más de daño a los enemigos que sangran.':'Legendary item from the northern village. Prey: all hits cause bleeding for 6 s and you deal 25 % more damage to bleeding enemies.',
  'Objeto legendario del pueblo del norte. Bloquea el 90 % del daño frontal y el 35 % de los golpes bloqueados congela al atacante 1,5 s.':'Legendary item from the northern village. Blocks 90 % of frontal damage and 35 % of blocked hits freeze the attacker for 1.5 s.',
  'Cuerno de hidromiel':'Mead horn', 'Piedra rúnica':'Rune stone', 'Brazalete vikingo':'Viking bracelet', 'Martillo de Thor en miniatura':'Miniature Thor\'s hammer', 'Anillo de Draupnir':'Ring of Draupnir',
  'Todavía huele a miel.':'It still smells of honey.', 'Las runas brillan débilmente.':'The runes glow faintly.', 'Oro macizo grabado con serpientes.':'Solid gold engraved with serpents.', 'Muy extraño: huele a tormenta.':'Very strange: it smells of storm.', 'Muy extraño: cada nueve noches nacen de él otros ocho anillos.':'Very strange: every nine nights eight more rings are born from it.',
  'Guerrera vikinga':'Viking shieldmaiden', 'Lobo de guerra gigante':'Giant war wolf', 'Arquero de escarcha':'Frost archer', 'Cuervo de Odín':'Odin\'s raven', 'Jötunn, gigante de hielo':'Jötunn, ice giant',
  '¡Jötunn, el gigante de hielo, se levanta!':'Jötunn, the ice giant, rises!', '¡Jötunn ruge y el fiordo se congela!':'Jötunn roars and the fjord freezes!',
  'Puñetazo glacial':'Glacial punch', 'Corona de escarcha':'Crown of frost', 'Avalancha de bolas':'Snowball avalanche', 'Rugido gélido':'Icy roar', 'Pisotón de gigante':'Giant\'s stomp', '¡Ventisca!':'Blizzard!', '¡Salto del gigante!':'Giant\'s leap!', '¡Ralentizado!':'Slowed!',
  'Husky':'Husky', 'Ratatoskr':'Ratatoskr', 'Cabrito de Thor':'Thor\'s Kid', 'Huginn':'Huginn', 'Alce joven':'Young moose', 'Fenrisito':'Fenrisito', 'Sleipnir':'Sleipnir', 'Jörmun':'Jörmun', 'Gullinbursti':'Gullinbursti', 'Oso berserker':'Berserker bear', 'Fenrir':'Fenrir',
  'Perro de trineo':'Sled dog', 'Ardilla del Yggdrasil':'Yggdrasil squirrel', 'Cabra del carro de Thor':'Goat of Thor\'s chariot', 'Cuervo del pensamiento':'Raven of thought', 'Cría de alce':'Baby moose', 'Lobezno de Fenrir':'Fenrir\'s cub', 'Potro de ocho patas':'Eight-legged foal', 'Cría de la serpiente de Midgard':'Baby Midgard serpent', 'Jabalí de cerdas de oro':'Golden-bristled boar', 'Oso poseído por la furia':'Bear possessed by fury', 'El lobo que devorará a Odín':'The wolf that will devour Odin',
  'Embestida con la cornamenta que aturde 0,5 s':'Antler charge that stuns for 0.5 s', 'Coz que empuja':'Kick that pushes', 'Mordisco venenoso':'Venomous bite', 'Embestida con onda de choque que aturde':'Charge with a shockwave that stuns',
  '¡Aullido de Ragnarök!':'Howl of Ragnarök!', 'Doble mordisco con sangrado. Aullido de Ragnarök cada 20 s: los enemigos cercanos huyen 3 s y haces +25 % de daño 5 s':'Double bite with bleeding. Howl of Ragnarök every 20 s: nearby enemies flee for 3 s and you deal +25 % damage for 5 s',
});
LANG.load(LANG_EN);
