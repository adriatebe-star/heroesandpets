'use strict';
// =====================================================================
//  Expedición 14 bis · El jardín laberinto (rama del pueblo del norte, misión secundaria de Chemma «El jardín secreto»).
//  Un laberinto de setos enorme: minotauros con maza, sapos con veneno ×5, lobos con sangrado ×5 y mímicos (cofres andantes).
//  Al final, la puerta del jardín secreto: una instancia grande (como la guarida) con Oluaf, el pastor, que acoge las mascotas
//  que le entregues (1 moneda de pastor por cada una; pasean libres por el jardín y Chemma las puede resucitar).
//  Dos afijos de mascota nuevos: Polinizadora (polen) y Cosechadora (cosecha).
//  Va después de petdragons.js (usa buildRectWorld, regMon, regPets, EX, iconFrom…).
// =====================================================================
EXPEDITIONS.push({id:'gardenmaze', from:'northvillage', prevLvl:13, lvl:14, name:'El jardín laberinto', mapX:.78, mapY:.2, petExp:'14b', noGate:true,
  show:() => !!(G.save.qs && G.save.qs.garden),
  desc:'Cerca del pueblo del norte dicen que se esconde un jardín secreto donde las mascotas viven felices. Para llegar hay que cruzar un laberinto de setos enorme y encontrar la puerta del final.',
  monsters:'Minotauros con maza que aturden, sapos que escupen un veneno cinco veces más fuerte, lobos cuyo sangrado es cinco veces más fuerte y mímicos (cofres andantes con botín de cofre raro y muchas posibilidades de legendario)'});
EXPEDITIONS.push({id:'garden', from:'gardenmaze', lvl:14, hall:true, name:'El jardín secreto', mapX:.86, mapY:.31, noGate:true, show:() => !!G.save.gardenFound,
  desc:'Un jardín enorme lleno de flores y arbolitos donde las mascotas viven felices. Allí te espera Oluaf, el pastor.'});

QUESTS.push({id:'garden', side:true, giver:'druid', exp:'gardenmaze', title:'El jardín secreto',
  when:() => (G.save.maxExp || 0) >= 13,
  offer:['Viajero, he oído una leyenda en el norte: cerca del pueblo del norte se esconde un jardín secreto.', 'Dicen que es un lugar maravilloso donde las mascotas vivirán felices, lejos de las jaulas y de la noche eterna.', 'Dirígete al jardín laberinto y encuentra la puerta del final. Desde ahora tendrás acceso a él desde el mapa de incursiones. ¡Ten cuidado con lo que vive entre los setos!'],
  met:() => !!G.save.gardenFound, obj:() => ['Cruza el jardín laberinto', 'y encuentra la puerta del', 'jardín secreto', G.save.gardenFound ? '✔ Lo has encontrado: vuelve con Chemma' : '✘ Aún no has llegado'],
  ready:['¡Lo has encontrado! Entonces la leyenda era cierta...', 'Toma 20 galletas para mascotas y 5 monedas de pastor. Oluaf sabrá qué hacer con ellas.'],
  reward:() => { giveQuestItem('cookie', 20); G.save.shepCoins = (G.save.shepCoins || 0) + 5; toast('+5 monedas de pastor', 3.5); }});

// ---------- afijos de mascota nuevos ----------
Object.assign(PET_AFFIX, {
  polen:   {name:'Polinizadora', desc:'Cada 10 s suelta una nube de polen: cura el 5 % de la vida al héroe y a las mascotas cercanas y ralentiza 2 s a los enemigos a menos de 160 px (hasta 3 mascotas suman)'},
  cosecha: {name:'Cosechadora',  desc:'Cada enemigo que muere cura el 2 % de la vida máxima al héroe y a las mascotas (+2 % por cada mascota con este afijo, máx. 6 %)'},
});
Object.assign(HERO_AFFIX_FX, {polen:{ic:'heart', col:'#ffb0e0'}, cosecha:{ic:'star', col:'#a8e060'}});
function gardenHeal(k, withPets){
  P.hp = Math.min(P.maxHp, P.hp + P.maxHp*k);
  if(withPets) for(const p of G.pets) if(p.hp > 0){ p.hp = Math.min(p.maxHp, p.hp + p.maxHp*k); if(p.item) p.item.hp = p.hp; }
}
{ const _km = killMonster;   // Cosechadora: cada muerte cura
  killMonster = function(m){
    const r = _km.apply(this, arguments);
    const n = petAffN('cosecha');
    if(n && m && !m.summoner && !P.dead){ gardenHeal(Math.min(3, n)*.02, true); burst(P.x, P.y - 16, 5, ['#a8e060', '#ffffff'], [20, 70], [.3, .6], -30); }
    return r;
  };
}
function updateGardenFx(dt){
  if(P.dead || !G.sc) return;
  const n = petAffN('polen');
  if(n && G.sc.kind === 'raid'){
    P.polenT = (P.polenT ?? 6) - dt;
    if(P.polenT <= 0){
      P.polenT = 10; gardenHeal(.05*Math.min(3, n), true);
      for(const m of G.mons) if(!m.dying && Math.hypot(m.x - P.x, m.y - P.y) < 160){ m.slowT = Math.max(m.slowT || 0, 2); }
      addText(P.x, P.y - 58, 'Polen', '#ffb0e0', 8); ring(P.x, P.y - 8, 110, '#ffb0e0', .6); burst(P.x, P.y - 16, 22, ['#ffb0e0', '#fff0a0', '#ffffff'], [30, 120], [.5, 1], -20); sfx('alba');
    }
  } else P.polenT = undefined;
  if(legendOn('eternalrose')){   // Rosa Eterna: cada 25 s las flores del suelo curan el 10 %
    P.roseT = (P.roseT ?? 12) - dt;
    if(P.roseT <= 0){ P.roseT = 25; gardenHeal(.1, true); addText(P.x, P.y - 58, 'Rosa Eterna', '#ff9ac8', 8); for(const r2 of [30, 70, 110]) ring(P.x, P.y - 6, r2, '#ff9ac8', .5); burst(P.x, P.y - 12, 24, ['#ff9ac8', '#ffffff', '#ffe08a'], [30, 120], [.5, 1], -30); sfx('alba'); }
  } else P.roseT = undefined;
}
{ const _uw = updateWorld12; updateWorld12 = function(dt){ _uw(dt); updateGardenFx(dt); updateGardenPets(dt); }; }

// ---------- arte ----------
const GD_FUR = ['#2a1608', '#5a3412', '#8a5a24', '#b8843c'], GD_METAL = ['#2a2a34', '#5a5a68', '#9a9aa8', '#d0d0dc'];
function gdMinotaur(f){
  const lx = f === 1 ? 1.4 : f === 2 ? -1.4 : 0, mx = f === 1 ? 36 : f === 2 ? 34 : 35, my = f === 1 ? 12 : f === 2 ? 21 : 17;
  return [
    {e:[15 + lx, 39, 3.6, 5.6], c:GD_FUR, tex:1911}, {e:[25 - lx, 39, 3.6, 5.6], c:GD_FUR, tex:1912}, {p:[[13 + lx, 44, '#1a1008'], [14 + lx, 44, '#1a1008'], [24 - lx, 44, '#1a1008'], [25 - lx, 44, '#1a1008']]},
    {e:[20, 28, 10.5, 11], c:GD_FUR, tex:1913}, {e:[20, 31, 5.5, 6], c:['#8a5a24', '#b8843c', '#d8aa68']},
    {e:[8.5, 27, 3.2, 8], c:GD_FUR, tex:1914}, {l:[31, 20, mx, my + 6, 3], c:GD_FUR},
    {l:[mx, my + 14, mx - 1, my - 6, 1.6], c:['#3a2210', '#6a4a2a', '#8a6a3a']},
    {e:[mx - 1, my - 6, 5.2, 5], c:GD_METAL, tex:1915}, {p:[[mx - 6, my - 6, '#d0d0dc'], [mx + 4, my - 6, '#d0d0dc'], [mx - 1, my - 12, '#d0d0dc'], [mx - 1, my, '#d0d0dc']]},
    {e:[20, 14, 7.6, 7.6], c:GD_FUR, tex:1916}, {e:[20, 19, 4.4, 3.2], c:['#8a6a48', '#d8b898', '#f0d0b0']}, {p:[[18, 19, '#1a1008'], [22, 19, '#1a1008']]},
    {poly:[[13, 10], [6, 7], [3, 1], [8, 4], [14, 7]], c:['#a89870', '#e8dcb8', '#fff8e0']}, {poly:[[27, 10], [34, 7], [37, 1], [32, 4], [26, 7]], c:['#a89870', '#e8dcb8', '#fff8e0']},
    {poly:[[14, 8], [11, 14], [15, 12]], c:GD_FUR}, {poly:[[26, 8], [29, 14], [25, 12]], c:GD_FUR},
    {p:[[17, 12, '#ff2a2a'], [18, 12, '#ff6a4a'], [22, 12, '#ff2a2a'], [23, 12, '#ff6a4a'], [19, 21, '#ffd84a'], [20, 21, '#ffd84a'], [21, 21, '#ffd84a']]},
  ];
}
function gdMimic(f){
  const lid = f === 0 ? 0 : f === 1 ? 5 : 9, lx = f === 1 ? 1 : f === 2 ? -1 : 0, W = ['#2a1608', '#5a3412', '#8a5a24', '#b8843c'], IR = ['#14141c', '#3a3a48', '#6a6a7a'], s = [
    {e:[10 + lx, 37, 3, 3], c:['#2a1608', '#4a2a10']}, {e:[28 - lx, 37, 3, 3], c:['#2a1608', '#4a2a10']},
    {poly:[[4, 24], [34, 24], [34, 36], [4, 36]], c:W, tex:1921}, {poly:[[4, 24], [34, 24], [34, 27], [4, 27]], c:IR}, {poly:[[4, 33], [34, 33], [34, 36], [4, 36]], c:IR},
    {p:[[18, 29, '#ffd84a'], [19, 29, '#ffd84a'], [18, 30, '#c8962e'], [19, 30, '#c8962e']]},
  ];
  if(lid > 0){
    s.push({poly:[[5, 24], [33, 24], [33, 24 - lid], [5, 24 - lid]], c:['#2a0408', '#5a0a14', '#7a1420']}, {e:[19, 24 - lid/2, 6, 2.6 + lid*.1], c:['#b8284a', '#e0506a']});
    for(let x = 8; x < 32; x += 5) s.push({poly:[[x + 2, 24], [x + 5, 24], [x + 3.5, 24 - 3]], c:['#e8e0d0', '#ffffff']});
  }
  s.push({poly:[[4, 24 - lid], [6, 14 - lid], [32, 14 - lid], [34, 24 - lid]], c:W, tex:1922}, {poly:[[4, 24 - lid], [34, 24 - lid], [34, 22 - lid], [4, 22 - lid]], c:IR}, {poly:[[17, 14 - lid], [21, 14 - lid], [21, 24 - lid], [17, 24 - lid]], c:IR});
  if(lid > 0) for(let x = 8; x < 32; x += 5) s.push({poly:[[x, 24 - lid], [x + 3, 24 - lid], [x + 1.5, 24 - lid + 3]], c:['#e8e0d0', '#ffffff']});
  s.push({p:[[11, 18 - lid, '#ffe84a'], [12, 18 - lid, '#ffe84a'], [26, 18 - lid, '#ffe84a'], [27, 18 - lid, '#ffe84a'], [11, 19 - lid, '#ff3a2a'], [27, 19 - lid, '#ff3a2a']]});
  return s;
}
regMon('gardenminotaur', {w:64, h:74, ax:32, ay:72, shapes:f => scl(gdMinotaur(f), 1.6)});
regMon('gardentoad', {w:49, h:36, ax:24, ay:33, shapes:f => scl(PET_SHAPES.croac.shapes(f), 2.2)});
regMon('gardenwolf', {w:65, h:43, ax:29, ay:41, shapes:f => scl(petQuad(f, {pal:['#14240f', '#27441c', '#4e7a34', '#a8d070'], ears:'pointy', tail:'fox', tip:'#a8d070', tex:1931, dk:'#08120a', eye:'#ff3a3a', legW:2.6}), 1.7)});
regMon('mimic', {w:50, h:52, ax:25, ay:49, shapes:f => scl(gdMimic(f), 1.3)});
Object.assign(MONSTERS, {
  gardenminotaur:{name:'Minotauro con maza', art:'gardenminotaur', ai:'walk', hp:4200, dmg:300, spd:88, r:17, xp:320, reach:34, prep:.8, stunHit:true, garden:true},
  gardentoad:    {name:'Sapo venenoso', art:'gardentoad', ai:'archer', hp:1700, dmg:70, spd:70, r:12, xp:180, reach:0, prep:.7, range:[120, 220], garden:true,
                  shot:{kind:'bolt', spd:235, r:6, life:1.3, poison:true, poisonX:5, col:['#0e5a14', '#5ae04a', '#e0ffd0']}},
  gardenwolf:    {name:'Lobo del seto', art:'gardenwolf', ai:'walk', hp:2600, dmg:110, spd:155, r:14, xp:210, reach:22, prep:.35, leaper:true, bleedHit:true, bleedX:5, garden:true},
  mimic:         {name:'Mímico', art:'mimic', ai:'walk', hp:3600, dmg:340, spd:125, r:15, xp:300, reach:22, prep:.45, mimic:true, garden:true},
});
Object.assign(RARE_PREFIX, {gardenminotaur:['Rompecráneos', 'Astado', 'Bramador', 'Guardián del Seto'], gardentoad:['Pantanoso', 'Ponzoña', 'Verruga Negra', 'Croador'], gardenwolf:['Zarza', 'Rasgador', 'Aullador Verde', 'Espina'], mimic:['Voraz', 'Dorado', 'Tragaldabas', 'Cerrojo']});
Object.assign(MON_COLORS, {gardenminotaur:['#8a5a24', '#ff2a2a', '#e8dcb8'], gardentoad:['#4aa84a', '#5ae04a', '#e0ffd0'], gardenwolf:['#27441c', '#ff3a3a', '#a8d070'], mimic:['#5a3412', '#ffe84a', '#e8e0d0']});

// botín del mímico: un cofre raro y bastantes posibilidades de legendario
{
  const _death = monAffixDeath;
  monAffixDeath = function(m){
    _death(m);
    if(!G.sc || !MONSTERS[m.type].mimic || m.summoner) return;
    const lvl = G.sc.lvl || 14;
    openChest({x:m.x, y:m.y, rare:true, open:false});
    if(Math.random() < .3){
      const ex = legendExclPick(), id = (Math.random() < .5 && ex) ? ex : legendPick(lvl);
      if(id){ dropItem(m.x + 8, m.y + 6, mkItem(id, 1, lvl)); addText(m.x, m.y - m.r*2 - 40, '¡Objeto legendario!', '#ff9a3c', 8, -20); sfx('levelup'); }
    }
  };
}

// ---------- legendarios exclusivos ----------
iconFrom([
  ['pruner', 'dagger', {w:'#e8f4e0', s:'#7a9a60', g:'#ff9ac8', b:'#1a2a14'}],
  ['eternalrose', 'oceanheart', {C:'#ffb0d0', c:'#e0507a', W:'#ffffff', d:'#6a1030'}],
]);
W12_TINT.pruner = ['#e8f4e0'];
EX('pruner', 'gardenmaze', {name:'Podadera del Laberinto', slot:'weapon', kind:'dagger', dur:200, dmg:[82, 108], crit:10, value:600,
  desc:'Objeto legendario del jardín laberinto. El 25 % de los golpes provoca sangrado y haces un 20 % más de daño a los enemigos que sangran.'});
EX('eternalrose', 'gardenmaze', {name:'Rosa Eterna', slot:'talisman', gear:false, unique:false, value:560, fixed:[{k:'hp', v:45}, {k:'hpreg', v:2}],
  desc:'Objeto legendario del jardín laberinto. +45 de vida y +2 de vida por segundo. Cada 25 s las flores del suelo curan el 10 % de la vida al héroe y a las mascotas.'});
EXCL_LEGENDS.gardenmaze = ['pruner', 'eternalrose']; EXCL_IDS.push('pruner', 'eternalrose'); EXCL_LOOT_EXTRA.gardenmaze = [];
{ const _m = world12Melee; world12Melee = function(w, m, crit, fx2, out){ _m(w, m, crit, fx2, out); if(w && w.id === 'pruner' && Math.random() < .25) fx2.bleed = 6; }; }

// ---------- mapa: laberinto de setos ----------
const GD_GRASS = ['#2a5a24', '#357030', '#408a3a', '#4aa044'], GD_HEDGE = ['#0c260a', '#123612', '#1a4a16', '#235c1f'], GD_FL = ['#ff8ac0', '#ffffff', '#ffe066', '#c89aff'];
ART.topiary = SP(paintSprite(26, 32, [
  {poly:[[8, 26], [18, 26], [17, 31], [9, 31]], c:['#5a3a1a', '#8a5a2a', '#b07a3a']}, {e:[13, 15, 9.5, 11], c:['#0e300c', '#1f5a1a', '#3a8a30', '#6ac058'], tex:1941}, {e:[13, 5, 4.4, 4.2], c:['#0e300c', '#1f5a1a', '#3a8a30', '#6ac058'], tex:1942},
  {p:[[9, 12, '#8ad870'], [15, 18, '#8ad870'], [12, 9, '#8ad870'], [17, 14, '#ff8ac0'], [8, 19, '#ffe066']]},
]), 13, 31);
ART.gardenlamp = SP(paintSprite(14, 36, [
  {l:[7, 12, 7, 34, 1.6], c:['#14141a', '#2a2a34']}, {poly:[[2, 4], [12, 4], [11, 12], [3, 12]], c:['#c8962e', '#ffe08a', '#fff6c8']}, {poly:[[1, 4], [7, 0], [13, 4]], c:['#14141a', '#2a2a34']}, {e:[7, 34, 3.5, 1.5], c:['#14141a']},
]), 7, 35);
ART.flowerbed = SP(paintSprite(30, 14, [
  {e:[15, 8, 14, 5], c:['#2a1608', '#4a2a10', '#6a3e1a']}, {p:[[6, 6, '#ff8ac0'], [7, 5, '#ffffff'], [12, 4, '#ffe066'], [13, 5, '#ff8ac0'], [18, 5, '#c89aff'], [19, 4, '#ffffff'], [24, 6, '#ff8ac0'], [10, 8, '#ffe066'], [21, 8, '#ff8ac0'], [16, 7, '#ffffff'], [8, 9, '#c89aff'], [4, 8, '#2a6a22'], [26, 8, '#2a6a22']]},
]), 15, 12);
ART.gardendoor = SP(paintSprite(72, 76, [
  {e:[36, 40, 30, 36], c:['#0e300c', '#1f5a1a', '#3a8a30'], tex:1951}, {e:[36, 44, 22, 28], c:['#2a0e30', '#6a2a78', '#d890ff']}, {e:[36, 46, 16, 22], c:['#d890ff', '#ffd0ff', '#ffffff']},
  {poly:[[4, 76], [4, 36], [12, 36], [12, 76]], c:['#0e300c', '#1f5a1a', '#3a8a30', '#6ac058']}, {poly:[[60, 76], [60, 36], [68, 36], [68, 76]], c:['#0e300c', '#1f5a1a', '#3a8a30', '#6ac058']},
  {p:[[10, 30, '#ff8ac0'], [20, 18, '#ffffff'], [36, 8, '#ffe066'], [52, 18, '#ff8ac0'], [62, 30, '#ffffff'], [28, 12, '#ff8ac0'], [44, 12, '#c89aff']]},
]), 36, 75);
function gardenMazeBuild(seed){
  const sc = buildRectWorld({id:'gardenmaze', name:'El jardín laberinto', lvl:14, petExp:'14b', cols:9, rows:9, nodeW:[110, 160], nodeH:[100, 150], boss:{w:440, h:380}, spacingX:300, spacingY:280, monMul:.33,
    darkness:.62, loops:.12, warm:false, lightA:.7, corridor:56, chestChance:.22,
    floor:(x, y, e) => e ? '#2a4a22' : hash(x, y, 1961) > .988 ? GD_FL[Math.floor(hash(x + 3, y + 7, 1962)*4)] : GD_GRASS[tq(vnoise(x/12, y/12, 1963)*.7 + hash(x, y, 1964)*.3, x, y, 4)],
    void:(x, y, near) => near ? '#2c6a28' : hash(x, y, 1965) > .93 ? '#3a7a30' : GD_HEDGE[tq(vnoise(x/10, y/10, 1966)*.7 + hash(x, y, 1967)*.3, x, y, 4)],
    groups:[['gardenwolf', 'gardenwolf'], ['gardentoad', 'gardentoad', 'gardenwolf'], ['gardenminotaur'], ['mimic', 'gardentoad'], ['gardentoad', 'gardentoad'], ['gardenminotaur', 'gardenwolf']],
    decor:(sc, n, H) => {
      const cnt = Math.round(n.w*n.h/9000);
      for(let i = 0; i < cnt; i++){ const p = H.pointOn(n, 12); if(!p) continue; const r = H.R();
        if(r < .4) propSprite(sc, ART.topiary, p.x, p.y, {t:'c', x:p.x, y:p.y - 2, r:7}, [10, 3]);
        else if(r < .8) propSprite(sc, ART.flowerbed, p.x, p.y, null, [12, 3]);
        else { propSprite(sc, ART.gardenlamp, p.x, p.y, {t:'c', x:p.x, y:p.y - 2, r:4}, [6, 2]); sc.lights.push({x:p.x, y:p.y - 28, r:150, a:.8, warm:true, flick:.1}); } }
    },
    bossDecor:(sc, n, H) => {
      const dx = Math.round(n.x), dy = Math.round(n.y - n.h/2 + 70);
      sc.gardenDoor = {x:dx, y:dy};
      addProp(sc, {x:dx, y:dy, draw(){ drawSP(ART.gardendoor, dx, dy); if(Math.random() < .5) G.parts.push({x:dx + rand(-14, 14), y:dy - rand(10, 50), vx:0, vy:-16, life:.7, max:.7, size:1.5, col:pick(['#ffd0ff', '#ffffff', '#ff8ac0'])}); }}, null);
      sc.lights.push({x:dx, y:dy - 30, r:260, a:.95, warm:false, flick:.1, tint:'rgba(255,150,230,.3)'});
      for(let i = 0; i < 10; i++){ const x = Math.round(n.x + rand(-n.w/2 + 50, n.w/2 - 50)), y = Math.round(n.y + rand(-n.h/2 + 130, n.h/2 - 50)); if(H.walk(x, y) && !blocked(sc, x, y, 14)) propSprite(sc, i % 2 ? ART.flowerbed : ART.topiary, x, y, i % 2 ? null : {t:'c', x, y:y - 2, r:7}, [10, 3]); }
      sc.lights.push({x:n.x, y:n.y + 40, r:300, a:.7, warm:true, flick:.1});
    }}, seed);
  sc.bossRoom = undefined; sc.bossSpawn = null; sc.noRank = true;   // sin jefe: el final del laberinto es la puerta del jardín secreto
  return sc;
}
RAID_BUILDERS.gardenmaze = gardenMazeBuild;

// ---------- el jardín secreto y Oluaf, el pastor ----------
ORC_CFG.oluaf = {human:true, skin:['#f0d4b0', '#d8b088', '#a88460'], hair:['#d8d8d8'], hood:['#5a7a3a', '#7a9a50', '#3a5224'], tunic:['#7a5a30', '#a8844a', '#4a3418'], leg:['#4a3a22', '#6a5030'], weapon:'staff', staffCol:['#a07a40', '#e8d098'], armor:'vest', noPaint:true, cloak:true, cloak2:['#3a5224', '#5a7a3a', '#7a9a50'], armW:3};
ART.oluaf = [0, 2].map(f => SP(oCrisp(orcCanvas(f, ORC_CFG.oluaf)), 24, 54));
function gardenPetWalker(sc, g){
  const w = {pet:g.pet, shiny:!!g.shiny, x:rand(-700, 700), y:rand(-420, 380), r:5, ph:rand(0, 6), wait:rand(0, 4), dir:rand(0, 1) < .5 ? -1 : 1, mv:false, tx:0, ty:0};
  if(F_GARDEN(w.x, w.y) > .8 || blocked(sc, w.x, w.y, 8)){ w.x = rand(-60, 60); w.y = rand(150, 300); }
  w.tx = w.x; w.ty = w.y;
  w.draw = function(){
    const a = PET_ART[w.pet]; if(!a) return;
    const fly = a.fly, fr = a.fr[w.mv ? Math.floor(G.t*6 + w.ph) % a.fr.length : 0], yo = fly ? -14 - Math.sin(G.t*3 + w.ph)*3 : 0;
    pshadow(w.x, w.y, fly ? 6 : 9, 3); drawSP(fr, w.x, w.y + yo, w.dir < 0);
    if(w.shiny && Math.sin(G.t*5 + w.ph) > .3){ b.fillStyle = '#ffe066'; b.fillRect(Math.round(w.x) + 6, Math.round(w.y + yo) - 20, 2, 2); }
  };
  sc.gardenPets.push(w); sc.props.push(w); return w;
}
const F_GARDEN = (x, y) => (x/880)**2 + (y/580)**2 + (vnoise(x/60, y/60, 1821) - .5)*.25;
function updateGardenPets(dt){
  const sc = G.sc; if(!sc || sc.id !== 'garden') return;
  const sit = P.sitting;
  sc.gardenPets.forEach((w, i) => {
    if(sit){   // con el héroe sentado, las mascotas del jardín van hacia el banco y se reparten en espiral a su alrededor
      const r = 34 + 13*Math.sqrt(i), an = i*2.4;
      w.tx = P.x + Math.cos(an)*r; w.ty = P.y + 12 + Math.sin(an)*r*.7; w.wait = 0;
      const dx = w.tx - w.x, dy = w.ty - w.y, d = Math.hypot(dx, dy);
      if(d < 3){ w.mv = false; return; }
      const px0 = w.x, py0 = w.y, st = Math.min(d, 70*dt); moveCircle(sc, w, dx/d*st, dy/d*st);
      if(Math.hypot(w.x - px0, w.y - py0) < st*.3) moveCircle(sc, w, -dy/d*st*(i % 2 ? 1 : -1), dx/d*st*(i % 2 ? 1 : -1));   // si un obstáculo le corta el paso, lo rodea
      w.mv = true; if(Math.abs(dx) > 2) w.dir = dx > 0 ? 1 : -1;
      return;
    }
    if(w.wait > 0){ w.wait -= dt; w.mv = false; return; }
    const dx = w.tx - w.x, dy = w.ty - w.y, d = Math.hypot(dx, dy);
    if(d < 4){ w.wait = rand(1, 5); w.mv = false; for(let i = 0; i < 6; i++){ const nx = w.x + rand(-170, 170), ny = w.y + rand(-120, 120); if(F_GARDEN(nx, ny) < .8 && !blocked(sc, nx, ny, 8)){ w.tx = nx; w.ty = ny; break; } } return; }
    const px = w.x, py = w.y; moveCircle(sc, w, dx/d*24*dt, dy/d*24*dt); w.mv = true; if(Math.abs(dx) > 2) w.dir = dx > 0 ? 1 : -1;
    if(Math.hypot(w.x - px, w.y - py) < 6*dt){ w.tx = w.x; w.ty = w.y; }
  });
}
function buildGarden(){
  const sc = baseScene('garden', 'El jardín secreto', -900, -600, 900, 600);
  sc.kind = 'den'; sc.darkness = .3;
  sc.solidAt = (x, y) => F_GARDEN(x, y) > 1;
  const pathX = y => Math.sin(y/90)*60, HEDGE = GD_HEDGE.map(hex), RIM = hex('#3a7a30'), GR = GD_GRASS.map(hex), SAND = ['#b89a68', '#c8aa78', '#d8bc8c'].map(hex), FL = GD_FL.map(hex);
  sc.ground = (x, y) => {
    const f = F_GARDEN(x, y);
    if(f > 1){ if(f < 1.03) return RIM; return HEDGE[tq(vnoise(x/8, y/8, 1822)*.7 + hash(x, y, 1823)*.3, x, y, 4)]; }
    if(y > -170 && Math.abs(x - pathX(y)) < 16 + hash(x, y, 1824)*3) return SAND[tq(vnoise(x/6, y/6, 1825), x, y, 3)];
    const cl = vnoise(x/34, y/34, 1826), fh = hash(x, y, 1827);
    if(fh > (cl > .62 ? .93 : .992)) return FL[Math.floor(hash(x + 5, y + 1, 1828)*4)];
    return GR[tq(vnoise(x/12, y/12, 1829)*.7 + hash(x, y, 1830)*.3, x, y, 4)];
  };
  sc.spawn = {x:0, y:430}; sc.horse = {x:76, y:446, dir:-1}; addCollider(sc, {t:'r', x:52, y:439, w:46, h:12});
  sc.npcs.push({id:'oluaf', name:'Oluaf, el pastor', x:-58, y:-120, dir:1}); addCollider(sc, {t:'c', x:-58, y:-122, r:9});
  sc.lights.push({x:-58, y:-130, r:200, a:.8, warm:true, flick:.06}, {x:0, y:300, r:260, a:.6, warm:true, flick:.06});
  const R = rng(7771); let n = 0;
  for(let i = 0; i < 400 && n < 70; i++){
    const x = Math.round((R()*2 - 1)*820), y = Math.round((R()*2 - 1)*540);
    if(F_GARDEN(x, y) > .86 || (y > -200 && Math.abs(x - pathX(y)) < 44) || (x > -250 && x < 70 && y > -230 && y < 10) || Math.hypot(x - 60, y - 440) < 90) continue;
    propTree(sc, x, y, 3000 + n); n++;
  }
  for(let i = 0, m = 0; i < 300 && m < 34; i++){
    const x = Math.round((R()*2 - 1)*780), y = Math.round((R()*2 - 1)*500);
    if(F_GARDEN(x, y) > .82 || (y > -200 && Math.abs(x - pathX(y)) < 30) || Math.hypot(x + 58, y + 120) < 60 || blocked(sc, x, y, 12)) continue;
    if(m % 3 === 0) propSprite(sc, ART.topiary, x, y, {t:'c', x, y:y - 2, r:7}, [10, 3]); else propSprite(sc, ART.flowerbed, x, y, null, [12, 3]); m++;
  }
  for(let y = 400; y > -140; y -= 120){ const x = Math.round(pathX(y)) + (y % 240 ? 30 : -30); propSprite(sc, ART.gardenlamp, x, y, {t:'c', x, y:y - 2, r:4}, [6, 2]); sc.lights.push({x, y:y - 28, r:150, a:.8, warm:true, flick:.1}); }
  sc.gardenPets = [];
  for(const g of (G.save.garden || []).slice(0, 250)) gardenPetWalker(sc, g);
  return sc;
}
function enterGarden(){
  resetWorld(buildGarden());
  G.save.inRaid = false; saveGame(); UI.refresh(); mmBuild(G.sc); playMusic('den');
  toast('El jardín secreto', 3);
}
function gardenEnter(){   // la puerta del final del laberinto: cuenta como volver con vida y lleva al jardín
  G.save.gardenFound = true; G._toGarden = true;
  extract('Has cruzado la puerta del jardín secreto.');
}
addEventListener('load', () => { const _ex = extract; extract = function(how){ const go = G._toGarden; G._toGarden = false; _ex.apply(this, arguments); if(go) enterGarden(); }; });

// ---------- Oluaf: entregar mascotas y tienda de monedas de pastor ----------
const SHEP_SHOP = [];   // {id, name, desc, price, once, buy()}: mejoras permanentes (por definir)
const GD_OL = {tab:'give', msg:''};
UI.oluafOpen = false;
{
  const _b = UI.blocking.bind(UI); UI.blocking = function(){ return _b() || this.oluafOpen; };
  const st = document.createElement('style');
  st.textContent = '#oluaf{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.62);z-index:25;padding:12px}#oluaf.hidden{display:none}.olcols{height:min(54vh,460px);overflow:auto;padding-right:6px}.oltabs button{margin-right:6px}.oltabs button.on{background:#c89a30;color:#1a1008}.olhead{margin:8px 0 4px;color:var(--gold);font-size:13px}.olslot{position:relative;width:52px;height:52px;background:#14100e;border:3px solid #3a3028;display:inline-flex;align-items:center;justify-content:center;margin:0 6px 6px 0;cursor:pointer}.olslot img{width:40px;height:40px;image-rendering:pixelated}.olslot.none img{filter:brightness(0) opacity(.55)}.olslot.have{border-color:#6a8a4a}.olslot.in{border-color:#ff9ac8;box-shadow:0 0 6px #ff9ac8}.olslot .tag{position:absolute;right:2px;bottom:0;font-size:10px;color:#ff9ac8}.olslot:hover{border-color:var(--gold)}.olmsg{min-height:20px;margin-top:6px;color:#9ae890}';
  document.head.append(st);
  const d = document.createElement('div'); d.id = 'oluaf'; d.className = 'hidden';
  d.innerHTML = '<div class="trbox"><h2>Oluaf · El pastor</h2><div class="oltabs"><button id="olTabGive">Entregar mascotas</button><button id="olTabShop">Tienda de monedas</button></div><div id="olBody"></div><div id="olFoot"><span id="olCoins"></span><button id="olClose">Cerrar</button></div></div>';
  document.body.append(d);
}
function gardenOwned(id){   // ejemplares de esa especie que se pueden entregar: jaula grande, alijo y mochila (normales antes que brillantes)
  const out = [];
  const scan = (arr, name) => { (arr || []).forEach((it, i) => { if(it && it.id === 'pet' && it.pet === id) out.push({it, arr, i, name}); }); };
  scan(G.save.petCage, 'jaula grande'); scan(G.save.stash, 'alijo'); scan(G.inv.bag, 'mochila');
  return out.sort((a, c) => (a.it.shiny ? 1 : 0) - (c.it.shiny ? 1 : 0));
}
UI.openOluaf = function(){
  gardenFix();
  this.oluafOpen = true; G.bigMap = false; GD_OL.msg = '';
  $('oluaf').classList.remove('hidden'); sfx('ui');
  $('olClose').onclick = () => this.closeOluaf();
  $('olTabGive').onclick = () => { GD_OL.tab = 'give'; GD_OL.msg = ''; sfx('ui'); this.renderOluaf(); };
  $('olTabShop').onclick = () => { GD_OL.tab = 'shop'; GD_OL.msg = ''; sfx('ui'); this.renderOluaf(); };
  this.renderOluaf();
};
UI.closeOluaf = function(){ this.oluafOpen = false; $('oluaf').classList.add('hidden'); $('tip').classList.add('hidden'); sfx('ui'); saveGame(); };
UI.renderOluaf = function(){
  const s = G.save, garden = s.garden || (s.garden = []);
  $('olTabGive').classList.toggle('on', GD_OL.tab === 'give'); $('olTabShop').classList.toggle('on', GD_OL.tab === 'shop');
  $('olCoins').textContent = 'Monedas de pastor: ' + (s.shepCoins || 0) + ' · Mascotas en el jardín: ' + garden.length;
  let h = '';
  if(GD_OL.tab === 'give'){
    const ids = PET_IDS.slice().sort((a, c) => petTier(PETS[a]) - petTier(PETS[c])), cnt = {};
    for(const g of garden) cnt[g.pet] = (cnt[g.pet] || 0) + 1;
    h += '<div class="olhead">Todas las mascotas del juego. Haz clic en una que tengas (jaula grande, alijo o mochila) para dejarla en el jardín: recibes 1 moneda de pastor por cada especie distinta (solo una de cada; las brillantes no se pueden entregar). Rosa = ya vive en el jardín · verde = la tienes · oscura = aún no.</div><div class="olcols" id="olGrid">';
    let last = 0;
    for(const id of ids){
      const t = petTier(PETS[id]); if(t !== last){ last = t; h += `<div class="olhead">Nivel ${t}</div>`; }
      const have = gardenOwned(id).filter(q => !q.it.shiny).length, inn = cnt[id] || 0;
      h += `<div class="olslot ${inn ? 'in' : have ? 'have' : 'none'}" data-id="${id}"><img src="${itemIconURL(mkPetItem(id))}" draggable="false">${inn ? `<span class="tag">×${inn}</span>` : ''}</div>`;
    }
    h += '</div>';
  } else {
    h += '<div class="olhead">Mejoras permanentes a cambio de monedas de pastor.</div><div class="olhead">Bonos de las jaulas: mágicas +' + shepPct('magic') + ' % · raras +' + shepPct('rare') + ' % · legendarias +' + shepPct('legend') + ' % · brillantes +' + shepPct('shiny') + ' %</div><div class="olcols">';
    if(!SHEP_SHOP.length) h += '<div class="smempty">Oluaf todavía no tiene nada a la venta. Vuelve más adelante.</div>';
    for(const o of SHEP_SHOP){ const bought = o.once && (s.shepBought || {})[o.id]; h += `<div class="smitem has"><b>${o.name}</b> <small>${o.price} monedas</small><div class="smodds">${o.desc}</div><button data-buy="${o.id}" ${bought || (s.shepCoins || 0) < o.price ? 'disabled' : ''}>${bought ? 'Comprado' : 'Comprar'}</button></div>`; }
    h += '</div>';
  }
  h += `<div class="olmsg">${GD_OL.msg}</div>`;
  const body = $('olBody'), oldGrid = $('olGrid'), st0 = body.scrollTop, st1 = oldGrid ? oldGrid.scrollTop : 0;   // al volver a dibujar se conserva el desplazamiento
  body.innerHTML = h;
  body.scrollTop = st0; { const ng = $('olGrid'); if(ng) ng.scrollTop = st1; }
  const grid = $('olGrid');
  if(grid) grid.querySelectorAll('.olslot').forEach(el => {
    const id = el.dataset.id, it = mkPetItem(id, true);
    el.onmouseenter = e => this.showTip(it, e); el.onmousemove = e => this.moveTip(e); el.onmouseleave = () => $('tip').classList.add('hidden');
    el.onclick = () => {
      if(garden.some(q => q.pet === id)){ GD_OL.msg = PETS[id].name + ' ya vive en el jardín: solo se entrega una de cada especie.'; sfx('ui'); this.renderOluaf(); return; }
      const owned = gardenOwned(id), own = owned.find(q => !q.it.shiny);
      if(!own && owned.length){ GD_OL.msg = 'Las mascotas brillantes no se pueden entregar al jardín.'; sfx('ui'); this.renderOluaf(); return; }
      if(!own){ GD_OL.msg = 'No tienes a ' + PETS[id].name + ' en la jaula grande, el alijo ni la mochila.'; sfx('ui'); this.renderOluaf(); return; }
      const r = PETS[id].rarity;
      if((r === 'legendary' || own.it.shiny || r === 'rare') && !confirm(`¿Dejar a ${PETS[id].name}${own.it.shiny ? ' (brillante)' : ''} en el jardín? Saldrá de tu colección (Chemma podrá resucitarla).`)) return;
      own.arr[own.i] = null; garden.push({pet:id, shiny:!!own.it.shiny});
      s.fallen.push({pet:id, shiny:!!own.it.shiny}); s.shepCoins = (s.shepCoins || 0) + 1;
      if(G.sc && G.sc.id === 'garden') gardenPetWalker(G.sc, garden[garden.length - 1]);
      GD_OL.msg = `${PETS[id].name} ahora vive feliz en el jardín. +1 moneda de pastor.`; sfx('levelup'); saveGame(); UI.refresh && UI.refresh(); this.renderOluaf();
    };
  });
  $('olBody').querySelectorAll('[data-buy]').forEach(el => el.onclick = () => {
    const o = SHEP_SHOP.find(q => q.id === el.dataset.buy); if(!o || (s.shepCoins || 0) < o.price) return;
    s.shepCoins -= o.price; if(o.once) (s.shepBought ||= {})[o.id] = true; o.buy(); sfx('coin'); saveGame(); this.renderOluaf();
  });
};
function talkOluaf(){
  const s = G.save;
  if(!s.oluafMet){
    UI.say('Oluaf, el pastor', ['¡Bienvenido al jardín secreto, viajero!', 'Soy Oluaf, el pastor. Aquí las mascotas viven felices, libres de jaulas y de la noche eterna.', 'Si quieres dejar alguna conmigo, cuidaré de ella: pasará a formar parte del jardín y te daré una moneda de pastor por cada una.', 'Si alguna vez la echas de menos, Chemma podrá devolverla a tu lado.', 'Y con las monedas de pastor podrás comprarme mejoras permanentes.'], () => { s.oluafMet = true; saveGame(); });
    return;
  }
  UI.openOluaf();
}

// ---------- mascotas del jardín laberinto (aprobadas por el usuario; arte por formas) ----------
function petButterfly(f, o){
  const up = f === 1 ? -3 : f === 2 ? 3 : 0, c = o.pal;
  return [ {poly:[[14, 10], [4, 3 + up], [3, 11 + up], [14, 12]], c, tex:o.tex}, {poly:[[14, 12], [5, 15 - up], [8, 20 - up], [14, 14]], c:c.slice(0, 3)},
    {poly:[[16, 10], [26, 3 + up], [27, 11 + up], [16, 12]], c, tex:o.tex + 1}, {poly:[[16, 12], [25, 15 - up], [22, 20 - up], [16, 14]], c:c.slice(0, 3)},
    {e:[15, 12, 1.3, 4.5], c:['#14100a', '#2a2018']}, {l:[15, 8, 12, 4, .6], c:'#14100a'}, {l:[15, 8, 18, 4, .6], c:'#14100a'}, {p:[[7, 6 + up, '#14100a'], [8, 8 + up, '#ffffff'], [23, 6 + up, '#14100a'], [22, 8 + up, '#ffffff']]} ];
}
function petSnail(f, o){
  const w = f === 1 ? 1 : f === 2 ? -1 : 0, c = o.pal;
  return [ {e:[14, 17, 11, 3.2], c:['#8a7a68', '#c8b8a0', '#e8dcc8']}, {poly:[[22, 17], [25 + w, 8], [26 + w, 8], [24, 17]], c:['#8a7a68', '#c8b8a0']}, {poly:[[24, 17], [29 + w, 10], [30 + w, 10], [26, 17]], c:['#8a7a68', '#c8b8a0']},
    {p:[[26 + w, 7, '#14100a'], [30 + w, 9, '#14100a']]}, {e:[11, 10, 8.5, 8], c, tex:o.tex}, {e:[11, 10, 5, 4.6], c:c.slice(1), tex:o.tex + 1}, {e:[11, 10, 2, 1.8], c:c.slice(2)} ];
}
function petFrogZen(f, o){
  const w = f === 1 ? 1 : f === 2 ? -1 : 0, c = o.pal;
  return [ {e:[7, 17, 3, 2.2], c:c.slice(0, 3)}, {e:[19, 17, 3, 2.2], c:c.slice(0, 3)}, {e:[13, 13, 9.5, 6.4], c, tex:o.tex}, {e:[13, 15.5, 5.5, 3.4], c:['#e8f8c8', '#ffffff']},
    {e:[8, 6 + w, 3.2, 3], c:c.slice(0, 3)}, {e:[18, 6 + w, 3.2, 3], c:c.slice(0, 3)}, {p:[[8, 6 + w, '#ffffff'], [9, 6 + w, '#101010'], [18, 6 + w, '#ffffff'], [19, 6 + w, '#101010'], [12, 10, '#1a3a1a'], [14, 10, '#1a3a1a']]},
    {p:[[13, 2, '#ff9ac8'], [12, 3, '#ff9ac8'], [14, 3, '#ff9ac8'], [13, 3, '#ffe066']]} ];
}
Object.assign(PET_SHAPES, {
  mariquita:   {w:24, h:18, ax:11, ay:16, shapes:f => petScarab(f, {pal:['#7a0a0a', '#c81818', '#ff4a3a', '#ff9a8a'], tex:2001})},
  caracolin:   {w:34, h:22, ax:15, ay:20, shapes:f => petSnail(f, {pal:['#a03a6a', '#d86a9a', '#ffa8c8'], tex:2011})},
  abejita:     {w:30, h:20, ax:14, ay:19, fly:true, shapes:f => petDragonfly(f, {pal:['#2a1a04', '#c89a14', '#ffd84a', '#fff0a0'], tip:'#2a1a04'})},
  sapitozen:   {w:26, h:20, ax:12, ay:19, shapes:f => petFrogZen(f, {pal:['#2e6a2e', '#4aa84a', '#8ae08a', '#d8ffd0'], tex:2021})},
  conejoseto:  {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#6a4a2e', '#9a7a52', '#c8a87a', '#f0dcc0'], ears:'pointy', tail:'short', tex:2031, dk:'#3a2a18', eye:'#101010', legW:1.8})},
  monarca:     {w:30, h:22, ax:14, ay:20, fly:true, shapes:f => petButterfly(f, {pal:['#d85a14', '#ff8a2a', '#ffc04a', '#14100a'], tex:2041})},
  criaminotauro:{w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#4a2a14', '#7a4a24', '#a8743c', '#d8aa68'], ears:'horns', horn:['#a89870', '#fff8e0'], tail:'short', tex:2051, dk:'#2a1608', eye:'#ff3a2a', legW:2.6})},
  lobezno:     {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#14240f', '#27441c', '#4e7a34', '#a8d070'], ears:'pointy', tail:'fox', tip:'#a8d070', tex:2061, dk:'#08120a', eye:'#ff3a3a', legW:2.2})},
  cofrecillo:  {w:22, h:23, ax:11, ay:22, shapes:f => scl(gdMimic(f), .58)},
  ciervoflorido:{w:40, h:28, ax:18, ay:27, shapes:f => petQuad(f, {pal:['#8a5a30', '#b88650', '#dcb078', '#f4e0b8'], ears:'antlers', horn:['#8a5a30', '#d8a868'], tail:'short', tex:2071, dk:'#3a2410', legW:1.8,
              extra:lg => [{p:[[26 + lg, 3, '#ff8ac0'], [29 + lg, 2, '#ffffff'], [31 + lg, 5, '#ffe066'], [24 + lg, 6, '#c89aff'], [28 + lg, 7, '#ff8ac0']]}]})},
  flora:       {w:34, h:36, ax:16, ay:34, fly:true, glow:'#ff9ad0', shapes:f => { const up = f === 1 ? -2 : f === 2 ? 2 : 0, s = [
              {poly:[[15, 18], [3, 9 + up], [2, 18 + up], [15, 22]], c:['#ffd0ec', '#fff0f8', '#ffffff']}, {poly:[[19, 18], [31, 9 + up], [32, 18 + up], [19, 22]], c:['#ffd0ec', '#fff0f8', '#ffffff']},
              {poly:[[12, 18], [22, 18], [26, 32], [8, 32]], c:['#c83a7a', '#f06aa8', '#ffa8d0', '#ffe0f0'], tex:2081}];
              for(let i = 0; i < 6; i++){ const a = i/6*Math.PI*2; s.push({e:[17 + Math.cos(a)*8, 31 + Math.sin(a)*2.6, 4.2, 2.8], c:['#c83a7a', '#f06aa8', '#ffa8d0']}); }
              s.push({poly:[[10, 12], [8, 6], [12, 5]], c:['#2a7a2a', '#4ac04a']}, {poly:[[24, 12], [26, 6], [22, 5]], c:['#2a7a2a', '#4ac04a']}, {e:[17, 11, 5, 5.2], c:['#e8b896', '#f8d8b8', '#fff0e0']}, {e:[17, 6, 5.4, 3.4], c:['#2a7a2a', '#4ac04a', '#8ae078']},
                {p:[[15, 11, '#3a1a2a'], [19, 11, '#3a1a2a'], [16, 14, '#e87a8a'], [17, 14, '#e87a8a'], [13, 4, '#ff8ac0'], [17, 3, '#ffe066'], [21, 4, '#ff8ac0'], [15, 3, '#ffffff'], [19, 3, '#ffffff']]});
              return s; }},
});
regPets(['mariquita', 'caracolin', 'abejita', 'sapitozen', 'conejoseto', 'monarca', 'criaminotauro', 'lobezno', 'cofrecillo', 'ciervoflorido', 'flora'], {
  mariquita:   {exp:'14b', name:'Mariquita', rarity:'normal', look:'Mariquita roja', beh:'pounce', dmg:[13, 17], cd:1.5, bites:1, affixes:['cosecha'], attack:'Pellizco'},
  caracolin:   {exp:'14b', name:'Caracolín', rarity:'normal', look:'Caracol de concha rosa', beh:'charge', dmg:[13, 17], cd:2.4, miniStun:true, affixes:['dura'], attack:'Embestida que aturde 0,5 s'},
  abejita:     {exp:'14b', name:'Abejita', rarity:'normal', look:'Abeja regordeta', beh:'flyer', dmg:[12, 16], cd:.9, affixes:['polen'], attack:'Aguijonazos desde el aire'},
  sapitozen:   {exp:'14b', name:'Sapito Zen', rarity:'normal', look:'Sapo verde sentado con una flor', beh:'tongue', dmg:[13, 17], cd:2.2, affixes:['luciernaga'], attack:'Lengua que atrae al enemigo'},
  conejoseto:  {exp:'14b', name:'Conejo de Seto', rarity:'normal', look:'Conejo marrón', beh:'pounce', dmg:[13, 17], cd:1.4, bites:2, affixes:['agilc'], attack:'Doble mordisco rápido'},
  monarca:     {exp:'14b', name:'Mariposa Monarca', rarity:'magic', look:'Mariposa de alas naranjas', beh:'flock', dmg:[19, 25], cd:2.6, dust:true, affixes:['curandera', 'luciernaga'], attack:'Polvo de mariposa que ralentiza a los enemigos en área'},
  criaminotauro:{exp:'14b', name:'Cría de Minotauro', rarity:'magic', look:'Ternero con cuernitos', beh:'charge', dmg:[19, 25], cd:2.6, miniStun:true, affixes:['robusta', 'feroz'], attack:'Embestida con los cuernos que aturde'},
  lobezno:     {exp:'14b', name:'Lobezno de Zarza', rarity:'magic', look:'Lobito entre zarzas', beh:'pounce', dmg:[19, 25], cd:1.7, bites:1, bleed:1, affixes:['sangrienta', 'rastreador'], attack:'Mordisco con sangrado'},
  cofrecillo:  {exp:'14b', name:'Cofrecillo', rarity:'rare', look:'Mímico en miniatura', beh:'pounce', dmg:[27, 35], cd:1.8, bites:1, affixes:['avariciosa', 'buscatesoros', 'cazarrecompensas', 'dura'], attack:'Mordisco fuerte'},
  ciervoflorido:{exp:'14b', name:'Ciervo Florido', rarity:'rare', look:'Ciervo con flores en la cornamenta', beh:'cone', dmg:[27, 35], cd:2.2, fire:'#ffb0d8', affixes:['curandera', 'veloz', 'sanadora', 'cosecha'], attack:'Pétalos en cono'},
  flora:       {exp:'14b', name:'Flora', rarity:'legendary', look:'Dríade de pétalos', beh:'cone', dmg:[36, 46], cd:2.1, fire:'#ff9ad0', legendary:true, bloom:true, skillName:'¡Primavera!', affixes:['polen', 'inspiradora', 'indomable', 'presa'],
                attack:'Rayo de pétalos en cono. Primavera cada 24 s: cura el 20 % de la vida al héroe y a todas las mascotas y ralentiza 3 s a los enemigos cercanos'},
}, PET_SHAPES);

// ---------- traducciones ----------
Object.assign(LANG_EN, {
  'El jardín laberinto':'The Garden Maze', 'El jardín secreto':'The Secret Garden',
  'Cerca del pueblo del norte dicen que se esconde un jardín secreto donde las mascotas viven felices. Para llegar hay que cruzar un laberinto de setos enorme y encontrar la puerta del final.':'Near the northern village they say a secret garden is hidden where pets live happily. To reach it you must cross a huge hedge maze and find the door at the end.',
  'Minotauros con maza que aturden, sapos que escupen un veneno cinco veces más fuerte, lobos cuyo sangrado es cinco veces más fuerte y mímicos (cofres andantes con botín de cofre raro y muchas posibilidades de legendario)':'Mace-wielding minotaurs that stun, toads that spit a venom five times stronger, wolves whose bleeding is five times stronger and mimics (walking chests with rare chest loot and a good chance of a legendary)',
  'Un jardín enorme lleno de flores y arbolitos donde las mascotas viven felices. Allí te espera Oluaf, el pastor.':'A huge garden full of flowers and little trees where pets live happily. Oluaf, the shepherd, waits for you there.',
  'Viajero, he oído una leyenda en el norte: cerca del pueblo del norte se esconde un jardín secreto.':'Traveler, I have heard a legend in the north: a secret garden is hidden near the northern village.',
  'Dicen que es un lugar maravilloso donde las mascotas vivirán felices, lejos de las jaulas y de la noche eterna.':'They say it is a wonderful place where pets will live happily, far from cages and the eternal night.',
  'Dirígete al jardín laberinto y encuentra la puerta del final. Desde ahora tendrás acceso a él desde el mapa de incursiones. ¡Ten cuidado con lo que vive entre los setos!':'Head to the garden maze and find the door at the end. From now on you can reach it from the raid map. Beware of what lives among the hedges!',
  'Cruza el jardín laberinto':'Cross the garden maze', 'y encuentra la puerta del':'and find the door to the', 'jardín secreto':'secret garden', '✔ Lo has encontrado: vuelve con Chemma':'✔ You found it: go back to Chemma', '✘ Aún no has llegado':'✘ You have not arrived yet',
  '¡Lo has encontrado! Entonces la leyenda era cierta...':'You found it! So the legend was true...', 'Toma 20 galletas para mascotas y 5 monedas de pastor. Oluaf sabrá qué hacer con ellas.':'Take 20 pet cookies and 5 shepherd coins. Oluaf will know what to do with them.', '+5 monedas de pastor':'+5 shepherd coins',
  'Polinizadora':'Pollinator', 'Cada 10 s suelta una nube de polen: cura el 5 % de la vida al héroe y a las mascotas cercanas y ralentiza 2 s a los enemigos a menos de 160 px (hasta 3 mascotas suman)':'Every 10 s releases a cloud of pollen: heals the hero and nearby pets for 5% health and slows enemies within 160 px for 2 s (up to 3 pets stack)',
  'Cosechadora':'Harvester', 'Cada enemigo que muere cura el 2 % de la vida máxima al héroe y a las mascotas (+2 % por cada mascota con este afijo, máx. 6 %)':'Every enemy that dies heals the hero and pets for 2% of max health (+2% per pet with this affix, max 6%)', 'Polen':'Pollen',
  'Minotauro con maza':'Mace Minotaur', 'Sapo venenoso':'Poisonous Toad', 'Lobo del seto':'Hedge Wolf', 'Mímico':'Mimic',
  'Rompecráneos':'Skullbreaker', 'Astado':'Horned', 'Bramador':'Bellower', 'Guardián del Seto':'Hedge Guardian', 'Pantanoso':'Swampy', 'Ponzoña':'Venom', 'Verruga Negra':'Black Wart', 'Croador':'Croaker',
  'Zarza':'Bramble', 'Rasgador':'Ripper', 'Aullador Verde':'Green Howler', 'Espina':'Thorn', 'Voraz':'Ravenous', 'Dorado':'Golden', 'Tragaldabas':'Glutton', 'Cerrojo':'Padlock',
  '¡Objeto legendario!':'Legendary item!',
  'Podadera del Laberinto':'Maze Pruner', 'Objeto legendario del jardín laberinto. El 25 % de los golpes provoca sangrado y haces un 20 % más de daño a los enemigos que sangran.':'Legendary item of the garden maze. 25% of hits cause bleeding and you deal 20% more damage to bleeding enemies.',
  'Rosa Eterna':'Eternal Rose', 'Objeto legendario del jardín laberinto. +45 de vida y +2 de vida por segundo. Cada 25 s las flores del suelo curan el 10 % de la vida al héroe y a las mascotas.':'Legendary item of the garden maze. +45 health and +2 health per second. Every 25 s the flowers on the ground heal the hero and pets for 10% health.',
  'Cruzar la puerta del jardín secreto':'Cross the secret garden door', 'Abriendo la puerta...':'Opening the door...', 'Has cruzado la puerta del jardín secreto.':'You crossed the secret garden door.',
  'Oluaf, el pastor':'Oluaf, the shepherd', 'Oluaf, el pastor ':'Oluaf, the shepherd', 'Oluaf · El pastor':'Oluaf · The shepherd', 'Entregar mascotas':'Give pets', 'Tienda de monedas':'Coin shop',
  '¡Bienvenido al jardín secreto, viajero!':'Welcome to the secret garden, traveler!', 'Soy Oluaf, el pastor. Aquí las mascotas viven felices, libres de jaulas y de la noche eterna.':'I am Oluaf, the shepherd. Here pets live happily, free from cages and the eternal night.',
  'Si quieres dejar alguna conmigo, cuidaré de ella: pasará a formar parte del jardín y te daré una moneda de pastor por cada una.':'If you want to leave one with me, I will take care of it: it will become part of the garden and I will give you a shepherd coin for each one.',
  'Si alguna vez la echas de menos, Chemma podrá devolverla a tu lado.':'If you ever miss it, Chemma will be able to bring it back to your side.', 'Y con las monedas de pastor podrás comprarme mejoras permanentes.':'And with shepherd coins you can buy permanent upgrades from me.',
  'Todas las mascotas del juego. Haz clic en una que tengas (jaula grande, alijo o mochila) para dejarla en el jardín: recibes 1 moneda de pastor por cada especie distinta (solo una de cada; las brillantes no se pueden entregar). Rosa = ya vive en el jardín · verde = la tienes · oscura = aún no.':'Every pet in the game. Click one you own (big cage, stash or backpack) to leave it in the garden: you get 1 shepherd coin per different species (only one of each; shiny pets cannot be delivered). Pink = already lives in the garden · green = you own it · dark = not yet.',
  'Mejoras permanentes a cambio de monedas de pastor.':'Permanent upgrades in exchange for shepherd coins.', 'Oluaf todavía no tiene nada a la venta. Vuelve más adelante.':'Oluaf has nothing for sale yet. Come back later.', 'Comprado':'Bought',
  'Hablar con Oluaf':'Talk to Oluaf', 'Oluaf, el pastor ':'Oluaf, the shepherd',
  'Mariquita':'Ladybug', 'Mariquita roja':'Red ladybug', 'Pellizco':'Pinch', 'Caracolín':'Little Snail', 'Caracol de concha rosa':'Pink-shelled snail', 'Embestida que aturde 0,5 s':'Charge that stuns for 0.5 s',
  'Abejita':'Little Bee', 'Abeja regordeta':'Chubby bee', 'Aguijonazos desde el aire':'Stings from the air', 'Sapito Zen':'Zen Toad', 'Sapo verde sentado con una flor':'Green toad sitting with a flower', 'Lengua que atrae al enemigo':'Tongue that pulls the enemy in',
  'Conejo de Seto':'Hedge Bunny', 'Conejo marrón':'Brown rabbit', 'Doble mordisco rápido':'Quick double bite', 'Mariposa Monarca':'Monarch Butterfly', 'Mariposa de alas naranjas':'Orange-winged butterfly', 'Polvo de mariposa que ralentiza a los enemigos en área':'Butterfly dust that slows enemies in an area',
  'Cría de Minotauro':'Minotaur Calf', 'Ternero con cuernitos':'Calf with little horns', 'Embestida con los cuernos que aturde':'Horn charge that stuns', 'Lobezno de Zarza':'Bramble Wolf Cub', 'Lobito entre zarzas':'Wolf cub among brambles', 'Mordisco con sangrado':'Bite that causes bleeding',
  'Cofrecillo':'Little Chest', 'Mímico en miniatura':'Miniature mimic', 'Mordisco fuerte':'Strong bite', 'Ciervo Florido':'Flowery Deer', 'Ciervo con flores en la cornamenta':'Deer with flowers in its antlers', 'Pétalos en cono':'Petals in a cone',
  'Flora':'Flora', 'Dríade de pétalos':'Petal dryad', '¡Primavera!':'Spring!', 'Rayo de pétalos en cono. Primavera cada 24 s: cura el 20 % de la vida al héroe y a todas las mascotas y ralentiza 3 s a los enemigos cercanos':'Cone of petals. Spring every 24 s: heals the hero and all pets for 20% health',
});
Object.assign(LANG_EN, {
  '[F] Oluaf, el pastor':'[F] Oluaf, the shepherd', '[F] Cruzar la puerta del jardín secreto':'[F] Cross the secret garden door', '¿Qué quieres hacer?':'What do you want to do?', 'Volver a la guarida':'Return to the den', 'Ir al mapa de incursiones':'Go to the raid map', 'Cerrar':'Close',
  'Monedas de pastor: {} · Mascotas en el jardín: {}':'Shepherd coins: {} · Pets in the garden: {}', 'No tienes a {} en la jaula grande, el alijo ni la mochila.':'You do not have {} in the big cage, stash or backpack.', '{} ahora vive feliz en el jardín. +1 moneda de pastor.':'{} now lives happily in the garden. +1 shepherd coin.',
});
LANG.load(LANG_EN);

// ---------- tienda de Oluaf: adornos del jardín que dan un bufo permanente a la rareza de las mascotas que encuentras ----------
// bonus: % extra de probabilidad (peso en la jaula) de mágicas / raras / legendarias y % de brillantes (suma al 5 % base)
SHEP_SHOP.push(
  {id:'tulips',   name:'Parterres de tulipanes', price:12,  once:true, bonus:{magic:10},          desc:'Parterres de flores de colores por todo el jardín. Bufo permanente: +10 % de probabilidad de encontrar mascotas mágicas.'},
  {id:'lamps',    name:'Farolillos del jardín', price:20,  once:true, bonus:{magic:10},          desc:'Farolas con luz cálida a los lados del sendero. Bufo permanente: +10 % de probabilidad de mascotas mágicas.'},
  {id:'bench',    name:'Banco de Oluaf', price:15,  once:true, bonus:{rare:5},            desc:'Un banco de madera junto a Oluaf. Bufo permanente: +5 % de probabilidad de mascotas raras.'},
  {id:'pond',     name:'Estanque con patos', price:30,  once:true, bonus:{rare:10},           desc:'Un estanque con patitos que nadan. Bufo permanente: +10 % de probabilidad de mascotas raras.'},
  {id:'arch',     name:'Arco de rosas', price:75, once:true, bonus:{shiny:1},           desc:'Un arco de rosas sobre el sendero. Bufo permanente: +1 % de probabilidad de que la mascota sea brillante.'},
  {id:'fountain', name:'Fuente de piedra', price:55,  once:true, bonus:{legend:10},         desc:'Una fuente con agua cantarina. Bufo permanente: +10 % de probabilidad de mascotas legendarias.'},
  {id:'cherry',   name:'Cerezo florido gigante', price:90, once:true, bonus:{legend:15, rare:5}, desc:'Un enorme cerezo que suelta pétalos. Bufo permanente: +15 % de mascotas legendarias y +5 % de raras.'},
  {id:'glasshouse', name:'Invernadero de cristal', price:120, once:true, bonus:{magic:10, rare:10}, desc:'Un invernadero lleno de plantas raras. Bufo permanente: +10 % de mascotas mágicas y +10 % de raras.'},
);
for(const o of SHEP_SHOP) o.buy = () => { if(G.sc && G.sc.id === 'garden') gardenDeco(G.sc); toast('¡El jardín luce más bonito!', 3); };
// % de bonus permanente de una rareza ('magic' | 'rare' | 'legend' | 'shiny') por los adornos comprados
function shepPct(kind){ let s = 0; const bt = (G.save && G.save.shepBought) || {}; for(const o of SHEP_SHOP) if(bt[o.id] && o.bonus && o.bonus[kind]) s += o.bonus[kind]; return s; }
const SHEP_KIND = {normal:null, magic:'magic', rare:'rare', legendary:'legend'};
function shepMul(rarity){ const k = SHEP_KIND[rarity]; return k ? 1 + shepPct(k)/100 : 1; }

ART.bench = SP(paintSprite(38, 22, [
  {poly:[[3, 8], [35, 8], [35, 13], [3, 13]], c:['#4a2e14', '#7a5028', '#a8743c']}, {poly:[[3, 2], [35, 2], [35, 7], [3, 7]], c:['#4a2e14', '#7a5028', '#a8743c']},
  {poly:[[5, 13], [8, 13], [8, 20], [5, 20]], c:['#2a1608', '#4a2e14']}, {poly:[[30, 13], [33, 13], [33, 20], [30, 20]], c:['#2a1608', '#4a2e14']},
]), 19, 20);
ART.rosearch = SP(paintSprite(76, 56, [
  {poly:[[6, 54], [6, 20], [11, 20], [11, 54]], c:['#3a2a18', '#6a4a28']}, {poly:[[65, 54], [65, 20], [70, 20], [70, 54]], c:['#3a2a18', '#6a4a28']},
  {e:[38, 18, 32, 14], c:['#1a4a16', '#2a6a22', '#3a8a30'], tex:2201}, {e:[38, 24, 26, 6], c:['#0a1a08']},
  {e:[8, 36, 6, 14], c:['#1a4a16', '#2a6a22']}, {e:[68, 36, 6, 14], c:['#1a4a16', '#2a6a22']},
  {p:[[10, 30, '#ff4a7a'], [8, 40, '#ff4a7a'], [67, 32, '#ff4a7a'], [69, 42, '#ff4a7a'], [20, 10, '#ff4a7a'], [32, 6, '#ffb0c8'], [44, 7, '#ff4a7a'], [56, 10, '#ffb0c8'], [26, 8, '#ffffff'], [50, 5, '#ffffff'], [14, 14, '#ffb0c8'], [62, 14, '#ff4a7a']]},
]), 38, 54);
ART.fountain = SP(paintSprite(124, 100, [
  {e:[62, 84, 60, 16], c:['#3a3a44', '#6a6a76', '#9a9aa6']}, {e:[62, 80, 56, 14], c:['#5a5a66', '#8a8a96', '#c8c8d4'], tex:2231}, {e:[62, 79, 50, 11], c:['#1e5a98', '#3a8ad0', '#6ab8f0', '#a8e0ff']},
  {p:[[30, 80, '#d8f4ff'], [36, 83, '#d8f4ff'], [88, 81, '#d8f4ff'], [96, 78, '#bfeaff'], [48, 85, '#bfeaff'], [76, 85, '#d8f4ff']]},
  {e:[30, 80, 6, 2], c:['#2a7a3a', '#4aa850']}, {e:[92, 83, 5, 2], c:['#2a7a3a', '#4aa850']}, {p:[[30, 79, '#ffb0d0'], [92, 82, '#ffffff']]},
  {e:[62, 74, 20, 6], c:['#5a5a66', '#8a8a96', '#c8c8d4']}, {poly:[[52, 74], [72, 74], [68, 46], [56, 46]], c:['#5a5a66', '#8a8a96', '#c8c8d4'], tex:2232},
  {e:[62, 48, 32, 9], c:['#5a5a66', '#8a8a96', '#c8c8d4'], tex:2233}, {e:[62, 46, 28, 7], c:['#1e5a98', '#3a8ad0', '#6ab8f0', '#a8e0ff']}, {p:[[46, 46, '#d8f4ff'], [74, 47, '#d8f4ff'], [62, 44, '#ffffff']]},
  {poly:[[58, 46], [66, 46], [64, 24], [60, 24]], c:['#5a5a66', '#8a8a96', '#c8c8d4']},
  {e:[62, 26, 14, 5], c:['#5a5a66', '#8a8a96', '#c8c8d4']}, {e:[62, 25, 11, 3], c:['#3a8ad0', '#6ab8f0', '#a8e0ff']},
  {poly:[[60, 24], [64, 24], [63, 12], [61, 12]], c:['#6a6a76', '#9a9aa6', '#c8c8d4']}, {e:[62, 10, 4, 4], c:['#a87a10', '#e0b030', '#ffe070']}, {poly:[[60, 7], [64, 7], [62, 1]], c:['#a87a10', '#e0b030', '#ffe070']},
  {e:[10, 76, 5, 8], c:['#4a4a54', '#8a8a96', '#b8b8c4']}, {e:[10, 68, 6, 3], c:['#2a7a3a', '#4aa850', '#7ad070']}, {p:[[8, 66, '#ff4a7a'], [12, 65, '#ffe066'], [10, 67, '#ff8ab0']]},
  {e:[114, 76, 5, 8], c:['#4a4a54', '#8a8a96', '#b8b8c4']}, {e:[114, 68, 6, 3], c:['#2a7a3a', '#4aa850', '#7ad070']}, {p:[[112, 66, '#c89aff'], [116, 65, '#ffe066'], [114, 67, '#ffffff']]},
  {p:[[14, 84, '#6a6a76'], [22, 90, '#8a8a96'], [104, 90, '#6a6a76'], [112, 85, '#8a8a96'], [40, 93, '#8a8a96'], [86, 94, '#6a6a76']]},
]), 62, 92);
ART.cherry = SP(paintSprite(110, 110, [
  {poly:[[50, 108], [48, 60], [56, 40], [62, 40], [64, 60], [62, 108]], c:['#2a1608', '#4a2e18', '#6a4a30'], tex:2211},
  {e:[55, 36, 46, 32], c:['#a82a5a', '#e0508a', '#ff90bc', '#ffc8dc'], tex:2212}, {e:[28, 52, 22, 18], c:['#a82a5a', '#e0508a', '#ff90bc'], tex:2213}, {e:[84, 52, 22, 18], c:['#a82a5a', '#e0508a', '#ff90bc'], tex:2214},
  {p:[[30, 40, '#ffffff'], [50, 20, '#ffffff'], [72, 30, '#ffe0ec'], [86, 46, '#ffffff'], [40, 56, '#ffe0ec'], [64, 48, '#ffffff'], [20, 58, '#ffffff']]},
]), 55, 106);
ART.glasshouse = SP(paintSprite(96, 70, [
  {poly:[[6, 68], [6, 30], [90, 30], [90, 68]], c:['#a8d8e8', '#d0f0f8', '#f0ffff']}, {poly:[[6, 30], [48, 6], [90, 30]], c:['#8ac8e0', '#c0e8f4', '#f0ffff']},
  {poly:[[14, 66], [14, 36], [82, 36], [82, 66]], c:['#1a4a2a', '#2a7a3a', '#4aa850']}, {poly:[[6, 68], [90, 68], [90, 64], [6, 64]], c:['#5a5a64', '#8a8a96']},
  {poly:[[46, 66], [50, 66], [50, 30], [46, 30]], c:['#6a6a76', '#9a9aa6']}, {poly:[[6, 48], [90, 48], [90, 50], [6, 50]], c:['#6a6a76', '#9a9aa6']},
  {p:[[22, 54, '#ff4a7a'], [34, 58, '#ffe066'], [62, 52, '#c89aff'], [72, 58, '#ff8a2a'], [28, 44, '#ffffff'], [70, 44, '#ff4a7a'], [38, 42, '#ffe066']]},
]), 48, 68);
function gardenDeco(sc){
  const bt = G.save.shepBought || {}; sc.decoDone ||= {};
  const once = (id, fn) => { if(bt[id] && !sc.decoDone[id]){ sc.decoDone[id] = true; fn(); } };
  once('tulips', () => { for(const [x, y] of [[-70, 360], [95, 330], [-120, 240], [150, 200], [-40, 90], [80, 20], [-170, 20], [180, -70], [-60, -230], [120, -200]]) propSprite(sc, ART.flowerbed, x, y, null, [12, 3]); for(let i = 0; i < 18; i++){ const x = Math.round(rand(-700, 700)), y = Math.round(rand(-420, 380)); if(F_GARDEN(x, y) < .78 && !blocked(sc, x, y, 10)) propSprite(sc, ART.flowerbed, x, y, null, [12, 3]); } });
  once('lamps', () => {
    for(let y = 380; y > -150; y -= 120){ const x = Math.round(Math.sin(y/90)*60) + (y % 240 ? -30 : 30); propSprite(sc, ART.gardenlamp, x, y - 60, {t:'c', x, y:y - 62, r:4}, [6, 2]); sc.lights.push({x, y:y - 88, r:160, a:.85, warm:true, flick:.1}); }
    for(const [x, y] of [[-200, 60], [220, 40], [-300, -120], [300, -220], [-100, -300], [140, -330]]){ propSprite(sc, ART.gardenlamp, x, y, {t:'c', x, y:y - 2, r:4}, [6, 2]); sc.lights.push({x, y:y - 28, r:170, a:.85, warm:true, flick:.1}); } });
  once('bench', () => { propSprite(sc, ART.bench, -96, -100, null, [16, 3]); sc.bench = {x:-96, y:-100}; });
  once('pond', () => {
    const cx = -260, cy = 160, ducks = [0, 1, 2].map(i => ({ph:i*2.1}));
    addProp(sc, {x:cx, y:cy - 70, draw(){
      for(let dy = -34; dy <= 34; dy++){ const w = Math.round(Math.sqrt(1 - (dy/34)**2)*74); b.fillStyle = Math.abs(dy) > 30 ? '#6a5a3a' : '#3a86c0'; b.fillRect(cx - w, cy + dy, w*2, 1); if(Math.abs(dy) <= 30 && w > 8){ b.fillStyle = (dy + Math.floor(G.t*3)) % 7 === 0 ? '#8ad0f0' : '#4a9ad0'; b.fillRect(cx - w + 6, cy + dy, w*2 - 12, 1); } }
      for(const d of ducks){ const x = Math.round(cx + Math.sin(G.t*.5 + d.ph)*46), y = Math.round(cy + Math.cos(G.t*.4 + d.ph)*18); b.fillStyle = '#ffe066'; b.fillRect(x - 3, y - 3, 6, 4); b.fillRect(x + 2, y - 6, 3, 3); b.fillStyle = '#ff8a2a'; b.fillRect(x + 5, y - 5, 2, 1); } }});
    addCollider(sc, {t:'c', x:cx, y:cy, r:42}); });
  once('arch', () => { const y = 250, x = Math.round(Math.sin(y/90)*60); propSprite(sc, ART.rosearch, x, y, null, null); });
  once('fountain', () => { const x = 0, y = -250; propSprite(sc, ART.fountain, x, y, {t:'c', x, y:y - 8, r:38}, [52, 11]); sc.lights.push({x, y:y - 40, r:200, a:.55, warm:false, flick:.08});
    addProp(sc, {x, y:y + 1, draw(){
      const cols = ['#9ad8ff', '#ffffff', '#4aa0e0'];
      if(Math.random() < .7) G.parts.push({x:x + rand(-2, 2), y:y - 88, vx:rand(-14, 14), vy:-rand(40, 70), grav:170, life:1, max:1, size:1.5, col:pick(cols)});   // chorro de arriba
      if(Math.random() < .5) for(const sx of [-1, 1]) G.parts.push({x:x + sx*30, y:y - 46, vx:sx*rand(4, 14), vy:rand(-10, 4), grav:150, life:.7, max:.7, size:1.5, col:pick(cols)});   // el agua rebosa del cuenco de en medio
      if(Math.random() < .35) G.parts.push({x:x + rand(-26, 26), y:y - 14, vx:rand(-4, 4), vy:-rand(8, 20), grav:90, life:.6, max:.6, size:1, col:'#d8f4ff'});   // salpicaduras en el estanque
    }}, null); });
  once('cherry', () => { const x = 280, y = -140; propSprite(sc, ART.cherry, x, y, {t:'c', x, y:y - 3, r:7}, [30, 8]); sc.lights.push({x, y:y - 50, r:200, a:.4, warm:true, flick:.05});
    addProp(sc, {x, y:y + 1, draw(){ if(Math.random() < .5) G.parts.push({x:x + rand(-50, 50), y:y - rand(60, 90), vx:rand(-10, 10), vy:rand(14, 28), life:2.4, max:2.4, size:1.5, col:pick(['#ffb0d0', '#ffffff', '#ff90bc'])}); }}, null); });
  once('glasshouse', () => { const x = 330, y = 110; propSprite(sc, ART.glasshouse, x, y, {t:'r', x:x - 40, y:y - 14, w:80, h:14}, [44, 6]); sc.lights.push({x, y:y - 30, r:150, a:.6, warm:false, flick:.06}); });
}
// sentarse en el banco (F): las mascotas se acercan y te rodean
function toggleSit(sc){
  if(P.sitting){ P.sitting = false; return; }
  P.x = sc.bench.x; P.y = sc.bench.y + 4; P.sitting = true; P.dx = 1; sfx('ui');
  toast('Te sientas en el banco. Muévete para levantarte', 2.4);
}
// arreglo: solo puede haber una mascota de cada especie en el jardín; las repetidas vuelven a tu mochila o alijo y se quita su moneda
function gardenFix(){
  const s = G.save; if(!s || !s.garden) return;
  const seen = new Set(), keep = []; let back = 0;
  for(const g of s.garden){
    if(seen.has(g.pet) && !g.shiny){
      const it = mkPetItem(g.pet, true, false);
      if(addToBagOrStash(it)){ const k = s.fallen.findIndex(e => e.pet === g.pet && !e.shiny); if(k >= 0) s.fallen.splice(k, 1); s.shepCoins = Math.max(0, (s.shepCoins || 0) - 1); back++; continue; }
    }
    seen.add(g.pet); keep.push(g);
  }
  if(back){ s.garden = keep; saveGame(); toast('Se ha devuelto ' + back + (back > 1 ? ' mascotas repetidas' : ' mascota repetida') + ' del jardín y se ha quitado su moneda extra', 4); }
}
// junto a Oluaf: la jaula grande de mascotas (si la tienes) y Chemma (si ya la conoces)
function gardenExtras(sc){
  if(G.save.petCage && !sc.bigCage){
    sc.bigCage = {x:-150, y:-118};
    propSprite(sc, ART.bigcage, -150, -118, {t:'r', x:-164, y:-125, w:28, h:8}, [16, 3]);
    sc.lights.push({x:-150, y:-138, r:70, a:.5, warm:true, flick:.08});
  }
  if(G.save.druid && !sc.npcs.some(n => n.id === 'druid')){ sc.npcs.push({id:'druid', name:'Chemma', x:-8, y:-122, dir:-1}); addCollider(sc, {t:'c', x:-8, y:-124, r:9}); }
}
{ const _bg = buildGarden; buildGarden = function(){ gardenFix(); const sc = _bg(); gardenDeco(sc); gardenExtras(sc); return sc; }; }

Object.assign(LANG_EN, {
  'Parterres de tulipanes':'Tulip beds', 'Parterres de flores de colores por todo el jardín. Bufo permanente: +10 % de probabilidad de encontrar mascotas mágicas.':'Colorful flower beds all over the garden. Permanent buff: +10% chance of finding magic pets.',
  'Farolillos del jardín':'Garden lamps', 'Farolas con luz cálida a los lados del sendero. Bufo permanente: +10 % de probabilidad de mascotas mágicas.':'Warm-lit lamps beside the path. Permanent buff: +10% chance of magic pets.',
  'Banco de Oluaf':"Oluaf's bench", 'Un banco de madera junto a Oluaf. Bufo permanente: +5 % de probabilidad de mascotas raras.':'A wooden bench next to Oluaf. Permanent buff: +5% chance of rare pets.',
  'Estanque con patos':'Duck pond', 'Un estanque con patitos que nadan. Bufo permanente: +10 % de probabilidad de mascotas raras.':'A pond with swimming ducklings. Permanent buff: +10% chance of rare pets.',
  'Arco de rosas':'Rose arch', 'Un arco de rosas sobre el sendero. Bufo permanente: +1 % de probabilidad de que la mascota sea brillante.':'A rose arch over the path. Permanent buff: +1% chance that the pet is shiny.',
  'Fuente de piedra':'Stone fountain', 'Una fuente con agua cantarina. Bufo permanente: +10 % de probabilidad de mascotas legendarias.':'A fountain with singing water. Permanent buff: +10% chance of legendary pets.',
  'Cerezo florido gigante':'Giant cherry blossom tree', 'Un enorme cerezo que suelta pétalos. Bufo permanente: +15 % de mascotas legendarias y +5 % de raras.':'A huge cherry tree that drops petals. Permanent buff: +15% legendary pets and +5% rare.',
  'Invernadero de cristal':'Glass greenhouse', 'Un invernadero lleno de plantas raras. Bufo permanente: +10 % de mascotas mágicas y +10 % de raras.':'A greenhouse full of rare plants. Permanent buff: +10% magic pets and +10% rare.',
  '¡El jardín luce más bonito!':'The garden looks prettier!', 'Bonos de las jaulas: mágicas +{} % · raras +{} % · legendarias +{} % · brillantes +{} %':'Cage bonuses: magic +{}% · rare +{}% · legendary +{}% · shiny +{}%',
});
LANG.load(LANG_EN);

// ---------- iconos de los bufos permanentes del jardín (columna de bufos de la izquierda) ----------
const SHEP_ICON_DEF = {
  tulips: {pal:{r:'#e03a4a', R:'#ff8090', p:'#d060c0', P:'#f8a0e8', y:'#f0c030', Y:'#fff080', g:'#3a8a3a', G:'#60b850'}, rows:["...........", ".r...p...y.", "rRr.pPp.yYy", "rRr.pPp.yYy", ".r...p...y.", ".g...g...g.", ".gG..g..Gg.", ".g..GgG..g.", "GgGGgggGGgG", "..........."]},
  lamps: {pal:{k:'#2a2a2a', y:'#e8a020', Y:'#ffd860', W:'#fff8d0', d:'#5a4a3a'}, rows:["....kkk....", "...kyYyk...", "...kYWYk...", "...kyYyk...", "....kkk....", ".....d.....", ".....d.....", ".....d.....", ".....d.....", "....ddd....", "...ddddd..."]},
  bench: {pal:{b:'#a8743c', B:'#c8964e', d:'#5a3a1c'}, rows:["...........", ".bbbbbbbbb.", ".BBBBBBBBB.", ".bbbbbbbbb.", "...........", ".bbbbbbbbb.", ".BBBBBBBBB.", "..d.....d..", "..d.....d..", "..d.....d.."]},
  pond: {pal:{w:'#3a78b8', W:'#6ab0e8', y:'#ffe040', o:'#f08a20'}, rows:["...........", "...wwwww...", ".wWWWWWWWw.", "wWWWyyWWWWw", "wWWyyyWWWWw", "wWWWooWWWWw", ".wWWWWWWWw.", "...wwwww..."]},
  arch: {pal:{g:'#3a8a3a', G:'#60b850', r:'#e03a4a', R:'#ff8090', d:'#5a4a3a'}, rows:["...ggrgg...", "..gRgGgRg..", ".gGg...gGg.", ".rg.....gr.", ".gR.....Rg.", ".gg.....gg.", ".Gr.....rG.", ".gg.....gg.", ".dd.....dd."]},
  fountain: {pal:{w:'#6ab0e8', W:'#cfeeff', s:'#8a8a98', S:'#b8b8c8'}, rows:["....w.w....", "...wWwWw...", "....wWw....", ".....s.....", "...sSSSs...", ".sSSwwwSSs.", "sSwwWWWwwSs", "sSSSSSSSSSs", ".sSSSSSSSs."]},
  cherry: {pal:{p:'#e878a8', P:'#ffb8d0', b:'#6a4a3a'}, rows:["...pppp....", "..pPpPPp...", ".pPpPPpPp..", ".pPPpPpPPp.", "..pPpPPpp..", "...ppbpp...", ".....b.....", ".....b.....", "....bbb...."]},
  glasshouse: {pal:{c:'#6aa0c0', C:'#cfeeff', G:'#3a8a3a', g:'#60b850'}, rows:[".....c.....", "....cCc....", "...cCCCc...", "..cCgCgCc..", ".cCCCCCCCc.", ".cGcCcCcGc.", ".cGcGcGcGc.", ".cGcGcGcGc.", ".ccccccccc."]},
};
const SHEP_ICONS = {};
for(const k in SHEP_ICON_DEF) SHEP_ICONS[k] = bakeRows(SHEP_ICON_DEF[k].rows, Object.assign({k:OUT}, SHEP_ICON_DEF[k].pal));
const SHEP_KIND_TXT = {magic:'de probabilidad de mascotas mágicas', rare:'de probabilidad de mascotas raras', legend:'de probabilidad de mascotas legendarias', shiny:'de probabilidad de que la mascota sea brillante'};
// bufos permanentes de los adornos comprados, para la columna de bufos
function shepBuffList(){
  const bt = (G.save && G.save.shepBought) || {}, out = [];
  for(const o of SHEP_SHOP) if(bt[o.id] && o.bonus){
    const desc = Object.keys(o.bonus).map(k => '+' + o.bonus[k] + ' % ' + SHEP_KIND_TXT[k]).join(' · ');
    out.push({img:SHEP_ICONS[o.id], name:o.name, col:'#9fe8b0', desc, from:'Adorno del jardín secreto (bufo permanente)'});
  }
  return out;
}
Object.assign(LANG_EN, {'Adorno del jardín secreto (bufo permanente)':'Secret garden decoration (permanent buff)',
  '+{} % de probabilidad de mascotas mágicas':'+{}% chance of magic pets', '+{} % de probabilidad de mascotas raras':'+{}% chance of rare pets',
  '+{} % de probabilidad de mascotas legendarias':'+{}% chance of legendary pets', '+{} % de probabilidad de que la mascota sea brillante':'+{}% chance that the pet is shiny'});
LANG.load(LANG_EN);

Object.assign(LANG_EN, {'[F] Sentarse en el banco':'[F] Sit on the bench', '[F] Levantarse':'[F] Stand up', 'Te sientas en el banco. Muévete para levantarte':'You sit on the bench. Move to stand up'});
LANG.load(LANG_EN);
