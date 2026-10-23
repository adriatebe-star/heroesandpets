'use strict';
// =====================================================================
//  Tesoros especiales de las zonas de orcos y de elfos (solo se venden; los más raros valen mucho)
// =====================================================================
Object.assign(ICON_ROWS, {
  orcfang:    {pal:{W:'#ffe08a', w:'#c8962e'}, rows:["..kkkkk.....", ".kWWWWWk....", ".kWWWWwwk...", "..kWWWwwk...", "...kWWwk....", "....kWwk....", ".....kWk....", "......kk...."]},
  orcteeth:   {pal:{w:'#e8e0c8', R:'#f0e8d0', r:'#b0a888'}, rows:ICON_ROWS.necklace.rows},
  orcskull:   {pal:{W:'#f0ead8', w:'#b8b098', d:'#3a3428'}, rows:["............", "...kkkkkk...", "..kWWWWWWk..", ".kWWWWWWWWk.", ".kWddWWddWk.", ".kWddWWddWk.", ".kWWWddWWWk.", "..kWWWWWWk..", "..kWdWdWdk..", "..kwWWWWwk..", "...kkkkkk..."]},
  orchorn:    {pal:{W:'#e8d8b0', w:'#a08850', G:'#ffd040'}, rows:["........kkk.", ".......kWWWk", "......kWWwk.", ".....kWWwk..", "....kGGGk...", "...kWWwk....", "..kWWwk.....", ".kWWwk......", ".kWwk.......", "..kk........"]},
  dragonskull:{pal:{W:'#c85a3a', w:'#7a2a1a', d:'#1a0a08'}, rows:["..k......k..", ".kWk.kk.kWk.", ".kWWkWWkWWk.", "..kWWWWWWk..", ".kWWWWWWWWk.", ".kWddWWddWk.", ".kWddWWddWk.", "..kWWkkWWk..", "..kWkWkWkk..", "...kwwwwk...", "....kkkk...."]},
  stonehearth:{pal:{C:'#ff8a7a', c:'#c82a3a', W:'#ffe0d8', d:'#5a0a14'}, rows:["............", ".....kk.....", "....kCCk....", "...kCCWck...", "..kCCWWcck..", "..kCWWccck..", "..kCCcccdk..", "...kCcccdk..", "....kccdk...", ".....kdk....", "......k....."]},
  elfbrooch:  {pal:{B:'#9af0c0', b:'#3aa870', G:'#e8f0f8', g:'#98a8b8'}, rows:ICON_ROWS.ring.rows},
  elfflute:   {pal:{W:'#e8eef4', w:'#98a8b8', d:'#3a4858'}, rows:[".........kk.", "........kWWk", ".......kWdwk", "......kWwwk.", ".....kWdwk..", "....kWwwk...", "...kWdwk....", "..kWwwk.....", ".kWwwk......", ".kkkk......."]},
  elfgrail:   {pal:{W:'#f0fff4', w:'#a8e8c0', s:'#58a878'}, rows:ICON_ROWS.chalice.rows},
  moontear:   {pal:{C:'#e8f0ff', c:'#98b0e8', W:'#ffffff', d:'#4a5aa0'}, rows:["............", ".....kk.....", "....kCCk....", "...kCWWck...", "..kCWWCcck..", "..kCWCccck..", "..kCCcccck..", "..kcccccdk..", "...kccccdk..", "....kccdk...", ".....kkk...."]},
  stargl:     {pal:{G:'#ffd860', g:'#a87a20', w:'#c8e8ff', s:'#ffe8a0', S:'#ffffff'}, rows:[".kkkkkkkkkk.", ".kGGgggggGk.", "..kwwwwwwk..", "...kwSwwk...", "....kwwk....", ".....kk.....", "....kssk....", "...ksSssk...", "..kssSsssk..", ".kGGGggggGk.", ".kkkkkkkkkk."]},
  ancientseed:{pal:{G:'#8aff8a', g:'#2a9a3a', S:'#ffe08a', s:'#a87a20'}, rows:["....kkkk....", "...kGGGGk...", "..kgGGGGgk..", "..kkkkkkkk..", "..kSSSSSSk..", ".kSSsSSSSSk.", ".kSsSSSSsSk.", ".kSSSSSSSSk.", "..kSSsSSSk..", "...kSSSSk...", "....kkkk...."]},
});
for(const k of ['orcfang', 'orcteeth', 'orcskull', 'orchorn', 'dragonskull', 'stonehearth', 'elfbrooch', 'elfflute', 'elfgrail', 'moontear', 'stargl', 'ancientseed']){ const d = ICON_ROWS[k]; ICONS[k] = bakeRows(d.rows, Object.assign({k:OUT}, d.pal)); }
const TR = (name, icon, value, desc) => ({name, icon, treasure:true, value, desc:'Tesoro. Trapis te lo compra. ' + desc});
Object.assign(ITEMS, {
  orcfang:    TR('Colmillo de oro orco', 'orcfang', 140, 'Un colmillo de orco bañado en oro.'),
  orcteeth:   TR('Collar de dientes', 'orcteeth', 170, 'Los orcos presumen de él en las fiestas.'),
  orcskull:   TR('Cráneo de trofeo', 'orcskull', 200, 'El trofeo de algún cabecilla orco.'),
  orchorn:    TR('Cuerno de guerra grabado', 'orchorn', 260, 'Aún suena grave cuando soplas en él.'),
  dragonskull:TR('Cráneo de dragón en miniatura', 'dragonskull', 650, 'Muy extraño: ¿de dónde ha salido un dragón tan pequeño?'),
  stonehearth:TR('Corazón de piedra latiente', 'stonehearth', 950, 'Muy extraño: late despacio, como si siguiera vivo.'),
  elfbrooch:  TR('Broche élfico', 'elfbrooch', 210, 'Una joya verde de factura élfica.'),
  elfflute:   TR('Flauta de plata élfica', 'elfflute', 270, 'Tiene un sonido que pone la piel de gallina.'),
  elfgrail:   TR('Cáliz de luz', 'elfgrail', 320, 'Brilla suavemente aunque esté vacío.'),
  moontear:   TR('Lágrima de luna', 'moontear', 520, 'Una gota de cristal que parece guardar un reflejo de la luna.'),
  stargl:     TR('Reloj de arena estelar', 'stargl', 900, 'Muy extraño: la arena cae hacia arriba cuando nadie mira.'),
  ancientseed:TR('Semilla del Árbol Antiguo', 'ancientseed', 1200, 'Muy extraño: está caliente y parece susurrar.'),
});
// qué tesoros salen en cada zona (además de los 4 normales); los más raros pesan muy poco
const TREASURE_POOL = {
  orc: [{id:'orcfang', w:8}, {id:'orcteeth', w:8}, {id:'orcskull', w:6}, {id:'orchorn', w:4}, {id:'dragonskull', w:.9}, {id:'stonehearth', w:.5}],
  elf: [{id:'elfbrooch', w:8}, {id:'elfflute', w:6}, {id:'elfgrail', w:5}, {id:'moontear', w:2.5}, {id:'stargl', w:.8}, {id:'ancientseed', w:.5}],
};
const TREASURE_ZONES = {orccamp:'orc', castle:'orc', river:'elf', forest:'elf', temple:'elf'};
function rollTreasure(){
  const z = G && G.sc && TREASURE_ZONES[G.sc.id], pool = TREASURES.map(id => ({id, w:10}));
  if(z) pool.push(...TREASURE_POOL[z]);
  return wpick(pool).id;
}
