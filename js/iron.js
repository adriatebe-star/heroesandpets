'use strict';
// =====================================================================
//  Equipo de hierro (expedición 5 en adelante) y color de los consumibles
// =====================================================================

// ---------- equipo de hierro: mucha protección, pero te hace más lento ----------
const IRON_PAL = {L:'#8e929a', l:'#c4c8d0', d:'#4a4e56', s:'#e8d070'};
Object.assign(ICON_ROWS, {
  ironhelm:   {pal:IRON_PAL, rows:ICON_ROWS.helmet.rows},
  ironmail:   {pal:IRON_PAL, rows:ICON_ROWS.chestarmor.rows},
  irongloves: {pal:{L:IRON_PAL.L, d:IRON_PAL.d, s:IRON_PAL.s}, rows:ICON_ROWS.gloves.rows},
  ironboots:  {pal:Object.assign({}, IRON_PAL, {d:'#3e424a'}), rows:ICON_ROWS.boots.rows},
});
for(const k of ['ironhelm', 'ironmail', 'irongloves', 'ironboots']){ const d = ICON_ROWS[k]; ICONS[k] = bakeRows(d.rows, Object.assign({k:OUT}, d.pal)); }
Object.assign(ITEMS, {
  ironhelm:   {name:'Casco de hierro', icon:'ironhelm', slot:'head', gear:true, armor:4, move:-4, ov:'ironhelm', value:60,
               desc:'Casco pesado de hierro: mucha más protección que el cuero, pero te hace un 4 % más lento.'},
  ironmail:   {name:'Armadura de hierro', icon:'ironmail', slot:'chest', gear:true, armor:9, move:-8, ov:'ironmail', value:110,
               desc:'Armadura pesada de hierro: reduce mucho el daño que recibes, pero te hace un 8 % más lento.'},
  irongloves: {name:'Guantes de hierro', icon:'irongloves', slot:'hands', gear:true, armor:3, move:-3, ov:'ironglove', value:50, dmgFist:3,
               desc:'Guantes de hierro: más protección y puñetazos más fuertes, pero te hacen un 3 % más lento.'},
  ironboots:  {name:'Botas de hierro', icon:'ironboots', slot:'feet', gear:true, armor:3, move:-5, ov:'ironboot', value:50,
               desc:'Botas de hierro: más protección, pero te hacen un 5 % más lento.'},
});
// aspecto en el héroe: la misma silueta que el cuero, con hierro
const mkIronOv = (key, base) => {
  const b = ARMOR_OV[base], o = ARMOR_OV[key] = {ox:b.ox, oy:b.oy, rows:b.rows, img:{}};
  for(const r in STUD) o.img[r] = bakeRows(b.rows, Object.assign({k:OUT, s:STUD[r], L:IRON_PAL.L, l:IRON_PAL.l, d:IRON_PAL.d}, r === 'rare' ? {d:'#34383e'} : {}));
};
mkIronOv('ironhelm', 'helmet'); mkIronOv('ironmail', 'chest'); mkIronOv('ironboot', 'boot'); mkIronOv('ironglove', 'glove'); mkIronOv('irongloveBig', 'bigGlove');
// Trapis las vende desde el tier 5 y caen desde la expedición 5
for(const [id, price] of [['ironhelm', 110], ['ironmail', 190], ['irongloves', 85], ['ironboots', 85]]) SHOP.push({id, n:1, price, tier:5});
for(const T of [LOOT.chestNormal, LOOT.chestRare]){ const r = T === LOOT.chestRare; for(const id of ['ironhelm', 'ironmail', 'irongloves', 'ironboots']) T.table.push({w:r ? 6 : 3.5, id, lvl:5}); }
for(const id of ['ironhelm', 'ironmail', 'irongloves', 'ironboots']) LOOT.monsterTable.push({w:3.5, id, lvl:5});

// ---------- consumibles y munición por color de rareza ----------
// blanco = normal, azul = mágico, amarillo = raro, rosa = consumibles de uso corriente (aceite, setas, galletas, vendas)
for(const [id, r] of Object.entries({arrows:'normal', spear:'normal', stone:'normal', potion:'normal', superpotion:'magic', firearrows:'magic', explosivearrows:'rare', oil:'pink', mushroom:'pink', cookie:'pink', bandage:'pink'})) ITEMS[id].rar = r;
