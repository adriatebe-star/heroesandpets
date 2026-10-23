'use strict';
// =====================================================================
//  Expedición 12 (portal de Rolecs) · La ciudad orbital Odisea: una estación espacial perdida, simios del amanecer,
//  astronautas poseídos, drones y ARGOS-9000, la mente de la estación (con su Monolito).
// =====================================================================
HIDDEN_EXPEDITIONS.push({id:'space', lvl:12, petExp:'12c', hidden:true, name:'La ciudad orbital Odisea', boss:'argos',
  desc:'Una estación espacial que lleva siglos a la deriva. En su corazón hay un monolito negro y una máquina que ya no obedece a nadie.',
  monsters:'Simios del amanecer, astronautas poseídos, drones y robots de seguridad. Jefe: ARGOS-9000'});
iconFrom([
  ['stunbaton', 'mace', {M:'#2a8aa0', m:'#0e3a4a', s:'#9af0ff', b:'#3a3e48', B:'#6a707e'}],
  ['pressuresuit', 'chestarmor', {L:'#e8ecf4', l:'#ffffff', d:'#8a90a4', s:'#ff8a3a'}],
  ['neonlantern', 'atlantern', {b:'#3a3e48', y:'#7affea', Y:'#ffffff'}],
  ['plasmasaber', 'sword', {w:'#ffd0d0', s:'#ff3a3a', r:'#3a3e48', g:'#8a90a4', b:'#1c1e26'}],
  ['argosvisor', 'helmet', {L:'#3a3e48', l:'#6a707e', d:'#14161c', s:'#ff2a2a'}],
  ['argossuit', 'chestarmor', {L:'#5a6074', l:'#c8cee0', d:'#1c2030', s:'#ff3a3a'}],
  ['argosboots', 'boots', {L:'#5a6074', l:'#c8cee0', d:'#1c2030', s:'#ff3a3a'}],
  ['monolithsaber', 'sword', {w:'#2a2a38', s:'#8a8aff', r:'#14141c', g:'#8a8aff', b:'#0a0a12'}],
  ['astrohelm', 'helmet', {L:'#e8ecf4', l:'#ffffff', d:'#8a90a4', s:'#6ac8ff'}],
  ['circuitboard', 'blackpearl', {B:'#1c6a3a', b:'#3ac878', w:'#ffd84a'}],
  ['plasmacell', 'nacreshell', {W:'#7affea', w:'#e8fffa', p:'#1c6a60'}],
  ['starmap', 'goldanchor', {G:'#6ac8ff', g:'#1c3a7a'}],
  ['memorycore', 'tidecompass', {G:'#8a90a4', g:'#3a3e48', w:'#7affea', R:'#ff3a3a', N:'#6ac8ff'}],
  ['starcrystal', 'oceanheart', {C:'#e8d8ff', c:'#8a6ae0', W:'#ffffff', d:'#3a1c78'}],
]);
Object.assign(ITEMS, {
  stunbaton:   {name:'Porra de descarga', icon:'stunbaton', slot:'weapon', kind:'mace', gear:true, dur:150, dmg:[60, 82], stunChance:.3, value:310, desc:'Maza de seguridad con descarga eléctrica. El 30 % de los golpes aturde. Solo cae en la ciudad orbital.'},
  pressuresuit:{name:'Traje presurizado', icon:'pressuresuit', slot:'chest', gear:true, armor:16, ov:'jpressure', value:280, desc:'Un traje espacial blindado. Solo cae en la ciudad orbital.'},
  neonlantern: {name:'Farolillo de neón', icon:'neonlantern', slot:'lantern', oilMax:160, oilRegen:1, value:240, desc:'Guarda hasta 160 de aceite y regenera 1 por segundo mientras está encendido. Solo cae en la ciudad orbital.'},
  plasmasaber: {name:'Sable de plasma de ARGOS', icon:'plasmasaber', slot:'weapon', kind:'sword', gear:true, unique:true, dur:160, dmg:[62, 86], burnChance:.5, value:280, fixed:[{k:'dmg', v:6}],
                desc:'Objeto único de ARGOS-9000. El 50 % de los golpes quema al enemigo.'},
  argosvisor:  {name:'Visor de ARGOS', icon:'argosvisor', slot:'head', gear:true, unique:true, armor:6, ov:'uargosvisor', value:280, fixed:[{k:'hp', v:30}, {k:'crit', v:10}],
                desc:'Objeto único de ARGOS-9000. Un ojo rojo que lo ve todo.'},
  argossuit:   {name:'Traje de la estación', icon:'argossuit', slot:'chest', gear:true, unique:true, armor:18, ov:'uargossuit', value:280, fixed:[{k:'hp', v:40}, {k:'eleres', v:20}],
                desc:'Objeto único de ARGOS-9000. Blindaje de la propia estación.'},
  argosboots:  {name:'Botas magnéticas', icon:'argosboots', slot:'feet', gear:true, unique:true, armor:3, move:10, ov:'uargosboot', value:280, fixed:[{k:'hp', v:30}, {k:'stam', v:20}],
                desc:'Objeto único de ARGOS-9000. Se agarran al suelo y te hacen más ágil.'},
});
regOv('jpressure', 'chest', {L:'#e8ecf4', l:'#ffffff', d:'#8a90a4'});
uniqueOv('uargosvisor', 'helmet', {L:'#3a3e48', l:'#6a707e', d:'#14161c'});
uniqueOv('uargossuit', 'chest', {L:'#5a6074', l:'#c8cee0', d:'#1c2030'});
uniqueOv('uargosboot', 'boot', {L:'#5a6074', l:'#c8cee0', d:'#1c2030'});
W12_TINT.stunbaton = ['#2a8aa0', '#9af0ff']; W12_TINT.plasmasaber = ['#ff3a3a', '#ffd0d0']; W12_TINT.monolithsaber = ['#4a4a88', '#8a8aff'];
EX('monolithsaber', 'space', {name:'Sable del Monolito', slot:'weapon', kind:'sword', dur:170, dmg:[88, 116], crit:6,
  desc:'Objeto legendario de la ciudad orbital. Gravedad: cada golpe atrae hacia el enemigo golpeado a los demás enemigos cercanos.'});
EX('astrohelm', 'space', {name:'Casco del Viajero Estelar', slot:'head', armor:4, ov:'legastro', fixed:[{k:'hp', v:35}, {k:'stam', v:15}],
  desc:'Objeto legendario de la ciudad orbital. Oxígeno extra: regeneras estamina mucho más deprisa.'});
legendOv('legastro', 'helmet', {L:'#e8ecf4', l:'#ffffff', d:'#8a90a4'});
EXCL_LEGENDS.space = ['monolithsaber', 'astrohelm']; EXCL_IDS.push('monolithsaber', 'astrohelm');
Object.assign(ITEMS, {
  circuitboard:TRz('Placa de circuitos', 'circuitboard', 330, 'Todavía parpadea una lucecita verde.'),
  plasmacell:  TRz('Célula de plasma', 'plasmacell', 290, 'Caliente al tacto.'),
  starmap:     TRz('Mapa estelar', 'starmap', 500, 'Muestra estrellas que ya no existen.'),
  memorycore:  TRz('Núcleo de memoria', 'memorycore', 950, 'Muy extraño: susurra «Lo siento, no puedo hacer eso».'),
  starcrystal: TRz('Cristal del Niño Estelar', 'starcrystal', 1900, 'Muy extraño: dentro hay una galaxia entera.'),
});
TREASURE_POOL.spc = [{id:'circuitboard', w:8}, {id:'plasmacell', w:8}, {id:'starmap', w:5}, {id:'memorycore', w:1}, {id:'starcrystal', w:.45}];
TREASURE_ZONES.space = 'spc';
regLoot('space', ['stunbaton', 'pressuresuit', 'neonlantern'], 3);

// ---------- monstruos ----------
ORC_CFG.ape = {human:true, skin:['#b88454', '#8a5c34', '#4a3018'], hair:['#2a1a0a'], hood:['#4a3018', '#6a4a2a', '#2a1a0a'], tunic:['#6a4a2a', '#8a6a44', '#3a2a14'], leg:['#3a2a14', '#6a4a2a'], weapon:'club', armor:'strap', noPaint:true, armW:6};
ORC_CFG.astro = {human:true, skin:['#e8d0b8', '#c8a888', '#98785a'], hair:['#3a2a1a'], hood:['#e8ecf4', '#ffffff', '#8a90a4'], tunic:['#e8ecf4', '#ffffff', '#8a90a4'], leg:['#8a90a4', '#e8ecf4'], weapon:'hammer', armor:'plate', hat:'helm', noPaint:true, armW:5};
regMon('ape', {w:67, h:59, ax:25, ay:57, canvas:f => oScaled(orcCanvas(f, ORC_CFG.ape), 1.05)});
regMon('astro', {w:70, h:62, ax:26, ay:59, canvas:f => oScaled(orcCanvas(f, ORC_CFG.astro), 1.1)});
regMon('drone', {w:30, h:30, ax:15, ay:28, shapes:f => [
  {e:[15, 22, 8, 2.4], c:['#0a0a0e', '#14141c']}, {l:[6, 12, 2, 6, 1.2], c:'#6a707e'}, {l:[24, 12, 28, 6, 1.2], c:'#6a707e'},
  {e:[15, 12, 10, 8.5], c:['#2a2e3a', '#4a5060', '#8a90a0'], tex:701}, {e:[15, 12, 6, 6], c:['#14161c', '#2a2e3a']}, {e:[15, 12, 4, 4], c:f === 1 ? ['#ff2a2a', '#ffffff'] : ['#8a0a0a', '#ff2a2a', '#ff8a8a']},
  {p:[[10, 20, f === 2 ? '#7affea' : '#2ac8aa'], [20, 20, f === 1 ? '#7affea' : '#2ac8aa'], [15, 21, '#7affea']]}]});
regMon('robot', {w:44, h:52, ax:20, ay:50, shapes:f => { const sw = f === 1 ? 2 : f === 2 ? -2 : 0, st = ['#3a3e48', '#5a6074', '#8a90a4', '#c8cee0']; return [
  {r:[12, 36 + (f === 2 ? 1 : 0), 7, 13], c:st}, {r:[22, 36 + (f === 1 ? 1 : 0), 7, 13], c:st}, {r:[10, 47, 10, 3], c:st.slice(0, 2)}, {r:[21, 47, 10, 3], c:st.slice(0, 2)},
  {r:[8, 14, 26, 24], c:st, tex:711}, {r:[12, 18, 18, 8], c:['#14161c', '#2a2e3a']}, {p:[[14, 21, '#ff8a3a'], [18, 21, '#ff8a3a'], [22, 21, '#ff8a3a']]},
  {r:[0, 16, 8, 16 + sw], c:st.slice(0, 3)}, {r:[34, 16, 8, 18 - sw], c:st.slice(0, 3)}, {r:[0, 30 + sw, 8, 6], c:['#ff8a3a', '#ffd070']}, {r:[34, 32 - sw, 8, 6], c:['#ff8a3a', '#ffd070']},
  {r:[13, 2, 16, 14], c:st, tex:712}, {r:[15, 6, 12, 5], c:['#3a0a0a', '#ff2a2a', '#ff8a8a']}, {l:[21, 2, 21, -1, 1.2], c:'#8a90a4'}]; }});
regMon('argos', {w:96, h:104, ax:48, ay:100, shapes:f => { const g = f === 1 ? ['#3a0a0a', '#c01c1c', '#ff6a5a'] : ['#3a0a0a', '#a01818', '#ff3a2a']; return [
  {r:[8, 90, 80, 8], c:['#14161c', '#2a2e3a']}, {r:[12, 12, 72, 80], c:['#2a2e3a', '#3a3e48', '#5a6074'], tex:721}, {r:[16, 16, 64, 72], c:['#14161c', '#1c2030', '#2a3048']},
  {e:[48, 46, 30, 30], c:['#14161c', '#3a3e48', '#6a707e']}, {e:[48, 46, 24, 24], c:['#14161c', '#2a2e3a']}, {e:[48, 46, 20, 20], c:g}, {e:[48, 46, 11, 11], c:['#ff6a3a', '#ffd070', '#ffffff']}, {e:[44, 42, 3, 3], c:'#ffffff'},
  {p:[[20, 22, '#7affea'], [26, 22, '#ffd84a'], [32, 22, '#ff3a3a'], [70, 22, '#7affea'], [76, 22, '#ffd84a'], [64, 22, '#ff3a3a'], [20, 82, '#7affea'], [76, 82, f === 2 ? '#ff3a3a' : '#ffd84a']]},
  {l:[20, 82, 76, 82, 1.2], c:['#3a3e48', '#6a707e']}, {l:[20, 10, 20, 4, 1.4], c:'#8a90a4'}, {l:[76, 10, 76, 4, 1.4], c:'#8a90a4'}]; }});
Object.assign(MONSTERS, {
  ape:     {name:'Simio del amanecer', art:'ape', ai:'walk', hp:700, dmg:100, spd:122, r:12, xp:130, reach:22, prep:.4, bleedHit:true, space:true},
  astro:   {name:'Astronauta poseído', art:'astro', ai:'walk', hp:1150, dmg:104, spd:84, r:13, xp:170, reach:26, prep:.6, slowHit:true, space:true},
  drone:   {name:'Dron de seguridad', art:'drone', ai:'archer', hp:480, dmg:80, spd:96, r:9, xp:120, reach:0, prep:.5, range:[160, 270], shot:{kind:'bolt', spd:430, r:4, life:1.1, col:['#a01818', '#ff3a3a', '#ffd0d0']}, space:true},
  robot:   {name:'Robot de seguridad', art:'robot', ai:'walk', hp:2100, dmg:126, spd:66, r:16, xp:260, reach:28, prep:.8, stunHit:true, space:true},
  argos:   {name:'ARGOS-9000, la mente de la estación', art:'argos', ai:'brain', brain:'argos', hp:14000, dmg:120, spd:0, r:26, xp:2800, reach:0, prep:.6, boss:true, uniques:['plasmasaber', 'argosvisor', 'argossuit', 'argosboots']},
});
Object.assign(RARE_PREFIX, {ape:['Colmillo', 'Alfa', 'Hueso Negro', 'Amanecer'], astro:['Vacío', 'Escarcha', 'Deriva', 'Sin Retorno'], drone:['Mirilla', 'Centinela', 'Cazador', 'Ojo Rojo'], robot:['Acero', 'Titán', 'Bloqueo', 'Ejecutor'], argos:['ARGOS']});
Object.assign(MON_COLORS, {ape:['#8a5c34', '#ff8a3a', '#e8d0b8'], astro:['#e8ecf4', '#6ac8ff', '#ffffff'], drone:['#4a5060', '#ff3a3a', '#7affea'], robot:['#5a6074', '#ff8a3a', '#c8cee0'], argos:['#3a3e48', '#ff3a2a', '#ffd070']});

// ---------- ARGOS-9000: láseres que barren, esclusa que succiona, drones, pulsos y reinicio ----------
function bossWarp(m){   // se reubica en otro punto de la sala
  const r = G.sc.bossRoom, p = freeSpotNear(r.x + 60 + Math.random()*(r.w - 120), r.y + 60 + Math.random()*(r.h - 120), 20);
  ring(m.x, m.y - 40, 70, '#ff3a2a', .4); m.x = p.x; m.y = p.y; ring(m.x, m.y - 40, 70, '#ff3a2a', .4); burst(m.x, m.y - 40, 24, ['#ff3a2a', '#ffffff'], [60, 200], [.3, .6], 0); sfx('alba');
}
BRAINS.argos = {wake:'ARGOS-9000: «Lo siento. No puedo dejar que salgas de aquí».', rage:'ARGOS-9000 reinicia todos los sistemas: ¡sobrecarga!', col:'#ff3a2a', p2spd:1,
  cd:() => rand(2.2, 3), cd2:() => rand(1.5, 2.2),
  attacks:[
    {id:'laser', name:'Barrido láser', prep:.9, w:24, cast:m => { const a0 = angTo(m), n = m.phase2 ? 4 : 3; for(let i = 0; i < n; i++) bossBeam(m, a0 + (i - 1)*.38, .55 + i*.45, 30, 600, 1.35, '#ff3a3a', 'burn'); }},
    {id:'airlock', name:'¡Esclusa abierta!', prep:1, w:16, cast:m => { bossPull(m, 2.6, 380, 155, 1); (m.later = m.later || []).push({t:2.6, fn:mm => { bossSlam(mm, 130, 1.5, '#7affea'); }}); }},
    {id:'drones', name:'Enjambre de drones', prep:1, w:14, cast:m => bossSummon(m, ['drone'], 3, 6)},
    {id:'overload', name:'Sobrecarga eléctrica', prep:1.1, w:18, cast:m => bossRain(m, ['zap'], 9, 270, 1)},
    {id:'emp', name:'Pulso electromagnético', prep:1, w:16, warn:130, cast:m => { bossSlam(m, 130, 1.1, '#7affea'); bossRings(m, 3, .9, 250); }},
    {id:'cross', name:'Cruz láser', prep:1.2, w:16, p2:true, cast:m => { const a0 = angTo(m); for(let i = 0; i < 4; i++) bossBeam(m, a0 + i*Math.PI/2, .9, 34, 620, 1.3, '#ff3a3a', 'burn'); for(let i = 0; i < 4; i++) bossBeam(m, a0 + Math.PI/4 + i*Math.PI/2, 1.7, 34, 620, 1.3, '#ff3a3a', 'burn'); }},
    {id:'reboot', name:'Reinicio del sistema', prep:.8, w:14, p2:true, cast:m => { bossWarp(m); bossRain(m, ['zap', 'boom'], 8, 280, 1); bossSummon(m, ['robot'], 1, 2); }},
  ]};

// ---------- mascotas de la ciudad orbital (arte por formas) ----------
function petDrone(f, o){
  const c = o.pal, th = f === 1 ? '#7affea' : '#2ac8aa';
  return [ {e:[13, 17, 6, 1.6], c:['#0a0a0e', '#14141c']}, {l:[4, 8, 0, 4, 1], c:'#8a90a4'}, {l:[22, 8, 26, 4, 1], c:'#8a90a4'}, {e:[13, 9, 8, 6.6], c:c, tex:o.tex}, {e:[13, 9, 4.6, 4.4], c:['#14161c', '#2a2e3a']},
    {e:[13, 9, 2.6, 2.6], c:o.eye}, {p:[[9, 15, th], [17, 15, th]]}, {l:[13, 3, 13, 0, .8], c:'#c8cee0'} ];
}
function petAlien(f, o){
  const w = f === 1 ? 2 : f === 2 ? -2 : 0, c = o.pal, s = [];
  for(let i = 0; i < 5; i++){ const x = 6 + i*3.2; s.push({l:[x, 14, x + (i % 2 ? w : -w) - 1 + i*.4, 22, 1.3], c:c.slice(0, 3)}); }
  s.push({e:[13, 9, 9, 8.4], c, tex:o.tex}, {e:[8.6, 6, 3, 3.6], c:['#ffffff', '#ffffff']}, {e:[17.4, 6, 3, 3.6], c:['#ffffff', '#ffffff']}, {p:[[8, 6, '#101010'], [9, 7, '#101010'], [17, 6, '#101010'], [18, 7, '#101010']]},
    {l:[8, 1, 6, -2, .8], c:c.slice(0, 2)}, {l:[18, 1, 20, -2, .8], c:c.slice(0, 2)}, {p:[[6, -2, o.glow], [20, -2, o.glow]]});
  return s;
}
function petUfo(f, o){
  const c = o.pal, bl = f === 1 ? '#ffffff' : o.glow;
  return [ {e:[14, 10, 12, 4.2], c, tex:o.tex}, {e:[14, 7, 6, 5], c:['#7ac8ff', '#c8ecff', '#ffffff']}, {e:[14, 14, 9, 2], c:c.slice(0, 2)}, {p:[[6, 11, bl], [11, 12, bl], [17, 12, bl], [22, 11, bl]]}, {poly:[[8, 15], [14, 25], [20, 15]], c:['#7affea', '#e8fffa']} ];
}
function petStarChild(f, o){
  const p = f === 1 ? .5 : f === 2 ? -.5 : 0;
  return [ {e:[14, 14, 13 + p, 13 + p], c:['#3a1c78', '#8a6ae0', '#e8d8ff']}, {e:[14, 14, 10 + p, 10 + p], c:['#14084a', '#3a1c78', '#8a6ae0']}, {p:[[4, 6, '#ffffff'], [22, 10, '#ffffff'], [8, 22, '#ffffff'], [23, 20, '#ffffff'], [15, 3, '#ffffff']]},
    {e:[14, 13, 4.4, 5], c:['#f8e8f8', '#ffffff']}, {e:[14, 9.6, 3.2, 3], c:['#ffffff', '#ffffff']}, {p:[[12, 9, '#101010'], [16, 9, '#101010']]}, {l:[12, 16, 10, 20, 1], c:'#ffffff'}, {l:[16, 16, 18, 20, 1], c:'#ffffff'} ];
}
Object.assign(PET_SHAPES, {
  satelitin:  {w:28, h:22, ax:13, ay:20, fly:true, glow:'#7affea', shapes:f => petDrone(f, {pal:['#8a90a4', '#c8cee0', '#ffffff'], eye:['#7affea', '#ffffff'], tex:731})},
  astrogato:  {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#e8ecf4', '#ffffff', '#ffffff', '#ffffff'], ears:'pointy', collar:['#6ac8ff', '#c8ecff'], tail:'long', tex:741, dk:'#8a90a4', eye:'#6ac8ff'})},
  monoastro:  {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#8a5c34', '#b88454', '#d8aa78', '#f0d0a8'], ears:'round', collar:['#e8ecf4', '#ffffff'], tail:'long', tex:751, dk:'#3a2410', face:['#d8aa78', '#f0d0a8'], snout:['#d8aa78', '#f0d0a8']})},
  robotin:    {w:30, h:30, ax:14, ay:29, shapes:f => { const sw = f === 1 ? 1 : f === 2 ? -1 : 0, st = ['#5a6074', '#8a90a4', '#c8cee0', '#ffffff']; return [
                {r:[7, 22, 5, 6 + (f === 2 ? -1 : 0)], c:st.slice(0, 3)}, {r:[16, 22, 5, 6 + (f === 1 ? -1 : 0)], c:st.slice(0, 3)}, {r:[6, 10, 16, 13], c:st, tex:761}, {r:[8, 12, 12, 5], c:['#14161c', '#2a2e3a']}, {p:[[11, 14, '#ff8a3a'], [15, 14, '#ff8a3a']]},
                {r:[0, 11, 5, 8 + sw], c:st.slice(0, 3)}, {r:[23, 11, 5, 8 - sw], c:st.slice(0, 3)}, {r:[9, 1, 10, 9], c:st}, {r:[11, 4, 6, 3], c:['#7affea', '#e8fffa']}, {l:[14, 1, 14, -1, 1], c:'#c8cee0'}]; }},
  cometin:    {w:30, h:20, ax:14, ay:18, fly:true, glow:'#ffd070', shapes:f => [ {poly:[[16, 10], [2, 4 + (f === 1 ? 2 : 0)], [0, 10], [2, 16 - (f === 2 ? 2 : 0)]], c:['#ff6a3a', '#ffb347', '#fff0a0']}, {e:[19, 10, 7, 6.4], c:['#a8d0ff', '#e8f4ff', '#ffffff']}, {p:[[21, 9, '#101010'], [22, 9, '#101010'], [20, 12, '#ff8a8a']]} ]},
  tortugaorbit:{w:40, h:26, ax:18, ay:24, shapes:f => petQuad(f, {pal:['#3a6a5a', '#5a9a82', '#8ac8b0', '#c8f0e0'], spots:[[10, 11], [14, 9], [18, 10], [22, 11], [12, 14], [18, 13]], spotCol:'#7affea', ears:'round', tail:'short', tex:771, dk:'#1c3a30', legW:2.8})},
  pulpoalien: {w:26, h:26, ax:12, ay:24, glow:'#a8ff6a', shapes:f => petAlien(f, {pal:['#4a8a3a', '#7ac85a', '#a8f080', '#e0ffc8'], tex:781, glow:'#a8ff6a'})},
  platillin:  {w:28, h:26, ax:13, ay:14, fly:true, glow:'#7affea', shapes:f => petUfo(f, {pal:['#8a90a4', '#c8cee0', '#ffffff'], glow:'#7affea', tex:791})},
  lobolunar:  {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#8a8ea0', '#b0b4c8', '#d8dcec', '#ffffff'], ears:'pointy', tail:'fox', tip:'#ffffff', tex:801, dk:'#4a4e60', eye:'#6ac8ff', legW:2.4})},
  androide:   {w:30, h:30, ax:14, ay:29, glow:'#7affea', shapes:f => { const sw = f === 1 ? 1 : f === 2 ? -1 : 0, st = ['#2a2e3a', '#5a6074', '#c8cee0', '#ffffff']; return [
                {r:[7, 22, 5, 6], c:st.slice(0, 3)}, {r:[16, 22, 5, 6], c:st.slice(0, 3)}, {r:[6, 10, 16, 13], c:st, tex:811}, {r:[8, 12, 12, 4], c:['#14161c', '#2a2e3a']}, {p:[[10, 14, '#7affea'], [14, 14, '#7affea'], [18, 14, '#7affea']]},
                {r:[0, 11, 5, 8 + sw], c:st.slice(0, 3)}, {r:[23, 11, 5, 8 - sw], c:st.slice(0, 3)}, {r:[9, 1, 10, 9], c:st}, {r:[10, 4, 8, 3], c:['#3a0a0a', '#ff2a2a', '#ff8a8a']}]; }},
  ninoestelar:{w:28, h:28, ax:14, ay:20, fly:true, glow:'#c8b8ff', shapes:f => petStarChild(f, {})},
});
regPets(['satelitin', 'astrogato', 'monoastro', 'robotin', 'cometin', 'tortugaorbit', 'pulpoalien', 'platillin', 'lobolunar', 'androide', 'ninoestelar'], {
  satelitin:  {exp:'12c', name:'Satelitín', rarity:'normal', look:'Mini satélite', beh:'flyer', dmg:[9, 13], cd:.9, affixes:['estelar'], attack:'Disparos desde el aire'},
  astrogato:  {exp:'12c', name:'Gato Astronauta', rarity:'normal', look:'Gato con casco', beh:'pounce', dmg:[10, 14], cd:1.4, bites:2, affixes:['agilc'], attack:'Doble zarpazo rápido'},
  monoastro:  {exp:'12c', name:'Albert', rarity:'normal', look:'Mono astronauta', beh:'pounce', dmg:[10, 14], cd:1.4, bites:2, affixes:['veloz'], attack:'Doble mordisco rápido'},
  robotin:    {exp:'12c', name:'Robotín', rarity:'normal', look:'Robot de juguete', beh:'ranged', proj:'splash', dmg:[9, 13], cd:1.7, affixes:['electrica'], attack:'Escupe chorros de refrigerante a distancia'},
  cometin:    {exp:'12c', name:'Cometín', rarity:'normal', look:'Cometa viviente', beh:'flyer', dmg:[9, 13], cd:.9, affixes:['estelar'], attack:'Embestidas desde el aire'},
  tortugaorbit:{exp:'12c', name:'Tortuga Orbital', rarity:'magic', look:'Tortuga espacial', beh:'charge', dmg:[15, 20], cd:2.6, miniStun:true, knock:true, affixes:['escudera', 'espinosa'], attack:'Embestida con el caparazón que empuja y aturde'},
  pulpoalien: {exp:'12c', name:'Pulpo Alienígena', rarity:'magic', look:'Pulpo de otro mundo', beh:'pounce', dmg:[15, 20], cd:1.7, bites:2, affixes:['feroz', 'agil'], attack:'Doble golpe de tentáculo'},
  platillin:  {exp:'12c', name:'Platillín', rarity:'magic', look:'Mini platillo volante', beh:'flock', dmg:[15, 20], cd:2.6, dust:true, affixes:['luciernaga', 'estelar'], attack:'Rayo tractor que ralentiza a los enemigos en área'},
  lobolunar:  {exp:'12c', name:'Lobo Lunar', rarity:'rare', look:'Lobo de la Luna', beh:'pounce', dmg:[26, 34], cd:1.8, bites:2, bleed:1, affixes:['feroz', 'cazadora', 'vampirica', 'veloz'], attack:'Doble mordisco con sangrado'},
  androide:   {exp:'12c', name:'Androide Guardián', rarity:'rare', look:'Androide de seguridad', beh:'cone', dmg:[26, 34], cd:2.4, fire:'#7affea', affixes:['resiliente', 'robusta', 'curandera', 'electrica'], attack:'Rayo láser en cono (triple golpe)'},
  ninoestelar:{exp:'12c', name:'Niño Estelar', rarity:'legendary', look:'Feto estelar en su burbuja', beh:'cone', dmg:[28, 36], cd:2.2, fire:'#c8b8ff', legendary:true, maelstrom:true, skillName:'¡Agujero negro!', affixes:['estelar', 'luna', 'inspiradora', 'indomable'],
              attack:'Rayo estelar en cono. Agujero negro cada 24 s: un torbellino arrastra y daña a los enemigos cercanos'},
}, PET_SHAPES);

// ---------- el mapa: módulos de la estación unidos por pasillos ----------
const SPC_FLOOR = ['#3a4254', '#434c60', '#4c566c', '#566178'];
function buildSpace(seed){
  return buildRectWorld({id:'space', name:'La ciudad orbital Odisea', lvl:12, petExp:'12c', cols:3, rows:4, nodeW:[300, 380], nodeH:[250, 320], boss:{w:600, h:500}, spacingX:480, spacingY:420,
    solid:'wall', darkness:.88, loops:.35, warm:false, lightA:.9, corridor:60,
    floor:(x, y, e) => e ? '#2a303e' : ((x % 32 < 2 || y % 32 < 2) ? '#2a303e' : SPC_FLOOR[tq(vnoise(x/12, y/12, 531)*.5 + hash(x, y, 532)*.3, x, y, 4)]),
    void:(x, y, near) => near ? '#0a0b10' : (hash(x, y, 533) > .995 ? '#c8d8ff' : hash(x, y, 534) > .985 ? '#4a5a8a' : '#04040a'),
    groups:[['ape', 'ape', 'drone'], ['astro', 'drone'], ['robot', 'drone'], ['ape', 'astro', 'drone'], ['astro', 'astro', 'robot']],
    decor:(sc, n, H) => {
      const cnt = Math.round(n.w*n.h/9000);
      for(let i = 0; i < cnt; i++){
        const p = H.pointOn(n, 12); if(!p) continue; const r = H.R();
        if(r < .4) propSprite(sc, SPC_CRATE, p.x, p.y, {t:'r', x:p.x - 9, y:p.y - 6, w:18, h:6}, [10, 3]);
        else if(r < .75){ const con = propSprite(sc, SPC_CONSOLE, p.x, p.y, {t:'r', x:p.x - 12, y:p.y - 6, w:24, h:6}, [12, 3]); sc.lights.push({x:p.x, y:p.y - 14, r:70, a:.5, warm:false, flick:.12}); }
        else propSprite(sc, SPC_TANK, p.x, p.y, {t:'c', x:p.x, y:p.y - 3, r:8}, [8, 3]);
      }
    },
    bossDecor:(sc, n, H) => {
      propSprite(sc, SPC_MONOLITH, n.x, n.y - n.h/2 + 70, {t:'r', x:n.x - 9, y:n.y - n.h/2 + 62, w:18, h:8}, [12, 3]); sc.lights.push({x:n.x, y:n.y - n.h/2 + 40, r:130, a:.5, warm:false, flick:.05});
      for(let i = 0; i < 8; i++){ const a = i/8*Math.PI*2, x = Math.round(n.x + Math.cos(a)*(n.w/2 - 40)), y = Math.round(n.y + Math.sin(a)*(n.h/2 - 40)); if(H.walk(x, y) && Math.hypot(x - n.x, y - (n.y - n.h/2 + 70)) > 40 && !blocked(sc, x, y, 14)){ propSprite(sc, SPC_CONSOLE, x, y, {t:'r', x:x - 12, y:y - 6, w:24, h:6}, [12, 3]); sc.lights.push({x, y:y - 14, r:90, a:.6, warm:false, flick:.12}); } }
    }}, seed);
}
const SPC_CONSOLE = SP(paintSprite(26, 20, [
  {r:[1, 8, 24, 11], c:['#2a2e3a', '#4a5060', '#8a90a0'], tex:821}, {r:[3, 1, 20, 9], c:['#14161c', '#2a2e3a']}, {r:[5, 3, 16, 5], c:['#0a3a4a', '#1a8aa0', '#7affea']},
  {p:[[6, 13, '#ff3a3a'], [9, 13, '#ffd84a'], [12, 13, '#7affea'], [18, 14, '#7affea'], [21, 14, '#ff3a3a']]}]), 13, 18);
const SPC_CRATE = SP(paintSprite(20, 18, [
  {r:[1, 3, 18, 14], c:['#2a2e3a', '#5a6074', '#9aa2b8'], tex:822}, {r:[3, 5, 14, 10], c:['#3a4054', '#6a7288']}, {l:[1, 3, 19, 17, .8], c:'#2a2e3a'}, {l:[19, 3, 1, 17, .8], c:'#2a2e3a'},
  {r:[1, 1, 18, 3], c:['#c8cee0', '#e8ecf4']}, {p:[[3, 6, '#ffd84a'], [5, 6, '#14161c'], [7, 6, '#ffd84a'], [15, 13, '#7affea']]}]), 10, 16);
const SPC_TANK = SP(paintSprite(18, 28, [
  {r:[2, 4, 14, 20], c:['#0a3a4a', '#1a8aa0', '#7affea']}, {e:[9, 4, 7, 3], c:['#6a707e', '#c8cee0']}, {e:[9, 24, 7, 3], c:['#2a2e3a', '#5a6074']}, {l:[5, 6, 5, 22, 1], c:['#c8ecff', '#ffffff']}, {p:[[11, 12, '#e8fffa'], [8, 17, '#e8fffa'], [12, 20, '#e8fffa']]}]), 9, 26);
const SPC_MONOLITH = SP(paintSprite(18, 64, [
  {poly:[[2, 62], [4, 2], [14, 2], [16, 62]], c:['#02020a', '#0a0a14', '#1c1c2c']}, {l:[4, 3, 4, 60, 1], c:['#2a2a44', '#4a4a6a']}, {l:[14, 3, 14, 60, 1], c:['#14142a', '#2a2a44']}]), 9, 62);
RAID_BUILDERS.space = buildSpace;

// dificultad del nivel 12 (petición del usuario): los monstruos de las tres expediciones tienen el doble de vida y un 60 % más de daño
for(const id of ['raptor', 'dilo', 'trike', 'ptero', 'rknight', 'rarcher', 'morgana', 'hound', 'ape', 'astro', 'drone', 'robot']){ MONSTERS[id].hp = Math.round(MONSTERS[id].hp*2); MONSTERS[id].dmg = Math.round(MONSTERS[id].dmg*1.6); }
for(const id of ['rex', 'arthur', 'argos']){ MONSTERS[id].hp *= 2; MONSTERS[id].dmg *= 2; }   // jefes del nivel 12: ×2 de vida y de daño (petición del usuario)
