'use strict';
// =====================================================================
//  Expedición 15 · La cueva de los dragones (tras el puente de los dragones): una cueva de obsidiana, lava y cristales llena de nidos.
//  Los huevos de dragón se rompen y dan botín o sueltan de 1 a 3 dragones (los de la expedición anterior, más fuertes).
//  Jefe: el dragón de obsidiana, que guarda el cofre del tesoro del pueblo del norte (misión de Alexandra: la corona del rey del norte).
//  Gemas: las de la mina y tres nuevas (cuarzo rosa, cuarzo blanco y fósil de mosquito) que solo caen aquí.
//  Va después de dragonbridge.js y dragonsprite.js (usa sus ayudantes y el sprite del dragón).
// =====================================================================
EXPEDITIONS.push({id:'dragoncave', from:'dragonbridge', prevLvl:14, lvl:15, name:'La cueva de los dragones', mapX:.93, mapY:-.27, boss:'obsidiandr',
  desc:'Una cueva enorme de obsidiana y lava donde los dragones anidan sobre montañas de oro. En el fondo duerme el dragón de obsidiana, que guarda el tesoro del pueblo del norte.',
  monsters:'Huevos de dragón (al romperse dan botín o sueltan de 1 a 3 dragones de tierra, aire, rayo o luz). Jefe: el dragón de obsidiana'});
QUEST_OF.dragoncave = 'crown';
QUESTS.push({id:'crown', giver:'alexandra', exp:'dragoncave', title:'Encuentra el tesoro del pueblo del norte',
  offer:['Has cruzado el puente... ahora te pido algo más grande. En la cueva de los dragones vive el dragón de obsidiana, y es él quien guarda el tesoro de mi pueblo.', 'Dentro de su cofre encontrarás la corona del rey del norte (objeto de misión verde fluorescente). Devuélvemela: es un recuerdo de mi gente y me gustaría tenerla conmigo.', 'Si mueres con ella la perderás. A cambio te daré 50.000 de oro y una tirada gratis.'],
  met:() => countItem('northcrown') > 0, obj:() => ['Derrota al dragón de obsidiana', 'en la cueva de los dragones', 'y abre su cofre: la corona del rey del norte', countItem('northcrown') > 0 ? '✔ La tienes: llévasela a Alexandra' : '✘ Aún no la has conseguido'],
  ready:['¡La corona del rey del norte! Mi gente la llevó durante siglos...', 'Gracias de corazón. Aquí tienes tus 50.000 de oro y una tirada gratis.'],
  reward:() => { takeItem('northcrown'); G.save.wallet += 50000; G.save.freeSlot = (G.save.freeSlot || 0) + 1; toast('+50.000 de oro (guardados en la guarida)', 4.5); sfx('coin'); }});

// ---------- iconos, objetos de misión, gemas nuevas ----------
iconFrom([
  ['northcrown', 'helmet', {L:'#39ff14', l:'#b8ffa0', d:'#0a5a0a', s:'#ffffff'}],
  ['obsblade', 'sword', {w:'#d0c0f4', s:'#3a2a60', r:'#8a6ad0', g:'#ffd84a', b:'#0a0814'}],
  ['obsmirror', 'aegis', {m:'#0a0814', M:'#a898e0', i:'#3a3260', I:'#8a7ab0', g:'#ffffff'}],
  ['obshelm', 'helmet', {L:'#2a2438', l:'#8a7ab0', d:'#0a0814', s:'#c8b0ff'}],
  ['obsboots', 'boots', {L:'#2a2438', l:'#8a7ab0', d:'#0a0814', s:'#c8b0ff'}],
  ['wyvernbow', 'bow', {B:'#e8e0c8', b:'#6a5a3a', w:'#ffffff'}],
  ['misering', 'oceanheart', {C:'#ffe08a', c:'#c8962e', W:'#ffffff', d:'#6a4a10'}],
  ['blackscale', 'chestarmor', {L:'#2a2438', l:'#6a5a9a', d:'#0a0814', s:'#c8b0ff'}],
]);
regOv('obshelmx', 'helmet', {L:'#2a2438', l:'#8a7ab0', d:'#0a0814', s:'#c8b0ff'});
uniqueOv('uobshelm', 'urrhelm', {L:'#2a2438', l:'#8a7ab0', d:'#0a0814'}); uniqueOv('uobsboot', 'boot', {L:'#2a2438', l:'#8a7ab0', d:'#0a0814'}); uniqueOv('ublackscale', 'chest', {L:'#2a2438', l:'#6a5a9a', d:'#0a0814'});
ART.obsmirror = dsArt(['#0a0814', '#3a3260', '#a898e0'], ['#000000', '#1c1830', '#5a4e7a'], ['#a898e0', '#e8e0ff', '#ffffff'], '#ffffff');
Object.assign(W12_TINT, {obsblade:['#8a6ad0', '#d0c0f4'], wyvernbow:['#6a5a3a', '#e8e0c8']});
Object.assign(ITEMS, {
  northcrown: {name:'Corona del rey del norte', icon:'northcrown', quest:true, rar:'quest', value:0, desc:'Objeto de misión. La corona del rey del norte, tesoro del pueblo de Alexandra: llévasela. Si mueres con ella la perderás.'},
});

// gemas nuevas: solo caen en la cueva de los dragones (las de la mina también)
const GEM_ROWS_FOSSIL = GEM_ROWS.map((r, i) => i === 4 ? 'kLlWwDDlllLk' : i === 5 ? '.kLlDlDlLLk.' : r);
for(const [id, d] of Object.entries({
  pinkquartz:  {name:'Cuarzo rosa',  col:'#ff9ad0', pal:{L:'#7a2a5a', l:'#e87ab8', w:'#ffb8dc', W:'#fff0f8'}, value:260, petRegen:2, petDmg:.08, light:1.1, tint:'255,130,190',
                desc:'Tus mascotas regeneran 2 de vida por segundo y hacen un 8 % más de daño. Luz rosa.'},
  whitequartz: {name:'Cuarzo blanco', col:'#f0f4ff', pal:{L:'#7a84a0', l:'#d8e0f0', w:'#ffffff', W:'#ffffff'}, value:300, oil:60, light:1.5, sreg:15, tint:'235,240,255',
                desc:'+60 de capacidad de aceite, +50 % de área de luz y +15 % de regeneración de estamina. Luz blanca.'},
  mosqfossil:  {name:'Fósil de mosquito', col:'#ffb43a', pal:{L:'#6a3a08', l:'#d8901c', w:'#ffc850', W:'#fff0b0', D:'#2a1a08'}, value:420, oil:150, leech:4, light:1.1, tint:'255,170,40', rows:GEM_ROWS_FOSSIL,
                desc:'+150 de capacidad de aceite y 4 % de robo de vida. Un mosquito atrapado en ámbar. Luz ámbar.'},
})){
  d.only = 'dragoncave'; GEMS[id] = d;
  ICON_ROWS['gem_' + id] = {pal:d.pal, rows:d.rows || GEM_ROWS};
  ICONS['gem_' + id] = bakeRows(d.rows || GEM_ROWS, Object.assign({k:OUT}, d.pal));
  ITEMS[id] = {name:d.name, icon:'gem_' + id, stack:20, gem:true, value:d.value, desc:d.desc + ' Solo cae en la cueva de los dragones. Aish la engarza en el farolillo.'};
}
const CAVE_NEW_GEMS = ['pinkquartz', 'whitequartz', 'mosqfossil'], CAVE_GEM_W = Object.assign({}, GEM_W, {pinkquartz:10, whitequartz:10, mosqfossil:6});
for(const T of [LOOT.chestNormal, LOOT.chestRare]) for(const id in CAVE_GEM_W) T.table.push({w:CAVE_GEM_W[id]*(T === LOOT.chestRare ? .22 : .1), id, lvl:15, only:'dragoncave'});
function caveGemDrop(m, mul){
  const ch = ({normal:.09, magic:.2, rare:.45}[m.rarity] || .09)*(mul || 1);
  if(Math.random() >= ch) return;
  const id = wpick(Object.keys(CAVE_GEM_W).map(k => ({w:CAVE_GEM_W[k], id:k}))).id;
  dropItem(m.x, m.y, mkItem(id, 1));
  addText(m.x, m.y - m.r*2 - 22, '¡Gema!', '#ffe0a0', 7, -20);
}

// ---------- objetos de la cueva: únicos del dragón de obsidiana, legendarios y botín ----------
Object.assign(ITEMS, {
  obsblade: {name:'Hoja de obsidiana', icon:'obsblade', slot:'weapon', kind:'sword', gear:true, unique:true, dur:220, dmg:[136, 176], burnChance:.4, bleedChance:.3, value:620, fixed:[{k:'dmg', v:12}, {k:'crit', v:10}],
             desc:'Objeto legendario del dragón de obsidiana. El 40 % de los golpes quema y el 30 % causa sangrado.'},
  obsmirror:{name:'Escudo espejo de obsidiana', icon:'obsmirror', slot:'shield', gear:true, unique:true, dur:220, armor:14, block:.9, shieldArt:'obsmirror', value:620, fixed:[{k:'hp', v:50}, {k:'eleres', v:15}],
             desc:'Objeto legendario del dragón de obsidiana. Bloquea el 90 % del daño frontal y refleja el 50 % del golpe al atacante.'},
  obshelm:  {name:'Yelmo del dragón negro', icon:'obshelm', slot:'head', gear:true, unique:true, armor:20, ov:'uobshelm', value:620, fixed:[{k:'hp', v:60}, {k:'crit', v:8}],
             desc:'Objeto legendario del dragón de obsidiana. Un yelmo de cristal negro con cuernos.'},
  obsboots: {name:'Botas de obsidiana', icon:'obsboots', slot:'feet', gear:true, unique:true, armor:12, move:14, ov:'uobsboot', value:620, fixed:[{k:'hp', v:50}, {k:'stam', v:30}],
             desc:'Objeto legendario del dragón de obsidiana. Ligeras como el humo, duras como el cristal.'},
  blackscale:{name:'Capa de Escamas Negras', icon:'blackscale', slot:'chest', gear:true, unique:true, legend:true, lvl:15, armor:26, ov:'ublackscale', value:640, fixed:[{k:'hp', v:60}, {k:'eleres', v:15}],
             desc:'Objeto legendario. Escamas de obsidiana: cada 25 s te rodea un escudo de 80 de daño.'},
});
EX('wyvernbow', 'dragoncave', {name:'Arco de Hueso de Wyvern', slot:'weapon', kind:'bow', dur:200, dmg:[108, 142], crit:8, value:620,
  desc:'Objeto legendario de la cueva de los dragones. Cada disparo lanza 3 flechas que atraviesan a 2 enemigos (la 2.ª y la 3.ª sin gastar flecha). Usa flechas.'});
EX('misering', 'dragoncave', {name:'Anillo del Avaro', slot:'talisman', gear:false, unique:false, value:560, fixed:[{k:'gold', v:50}, {k:'hp', v:40}],
  desc:'Objeto legendario de la cueva de los dragones. +50 % de oro y el 35 % de los monstruos sueltan monedas extra.'});
EXCL_LEGENDS.dragoncave = ['wyvernbow', 'misering']; EXCL_IDS.push('wyvernbow', 'misering');
LEGEND_IDS.push('blackscale');
EXCL_LOOT_EXTRA.dragoncave = [];
regLoot('dragoncave', ['dssword', 'dsbow', 'dsshield', 'dshelm', 'dsmail', 'dsgloves', 'dsboots'], 2.2);
TREASURE_ZONES.dragoncave = 'drg';
{ const _lk = legendKill;   // Anillo del Avaro: monedas extra
  legendKill = function(m){ _lk(m); if(legendOn('misering') && !m.summoner && !m.small && Math.random() < .35) dropGold(m.x + rand(-8, 8), m.y, Math.round(randi(25, 60)*(1 + ((G.sc.lvl || 1) - 1)*.35))); };
}
{ const _la = legendArrow;   // Arco de Hueso de Wyvern: flechas que atraviesan
  legendArrow = function(w){ const o = _la(w); if(w && w.id === 'wyvernbow'){ o.pierce = Math.max(o.pierce, 2); o.volley = true; } return o; };
}

// ---------- huevos de dragón y dragones; jefe: el dragón de obsidiana ----------
const EGG_PAL = ['#5a2a10', '#a8683a', '#d8a468', '#f4dca0'];
regMon('dragonegg', {w:34, h:40, ax:17, ay:38, shapes:f => { const dx = f === 1 ? 1 : f === 2 ? -1 : 0, glow = f === 2 ? '#ffd070' : '#ff8a3a';
  return [{e:[17 + dx, 24, 12, 14.5], c:EGG_PAL, tex:1501}, {e:[13 + dx, 19, 3.6, 4.4], c:['#3a1808', '#6a3414']}, {e:[22 + dx, 28, 3, 3.8], c:['#3a1808', '#6a3414']}, {e:[20 + dx, 15, 2.4, 2.8], c:['#3a1808', '#6a3414']},
    {l:[11 + dx, 14, 15 + dx, 19, 1.2], c:'#2a1008'}, {l:[15 + dx, 19, 13 + dx, 23, 1.2], c:'#2a1008'}, {l:[13 + dx, 23, 18 + dx, 27, 1.2], c:'#2a1008'}, {p:[[14 + dx, 20, glow], [15 + dx, 21, glow], [14 + dx, 24, glow], [17 + dx, 26, glow]]}]; }});
const OBS_FL = ['#0a0814', '#1c1830', '#3a3260', '#8a7ab0'];
regMon('obsidiandr', {w:Math.round(34*3.6), h:Math.round(26*3.6), ax:Math.round(15*3.6), ay:Math.round(21*3.6), shapes:f => scl(petDragonX(f, {fl:OBS_FL, bel:['#6a5a9a', '#a898e0'], tex:1511}), 3.6)});
Object.assign(MONSTERS, {
  dragonegg:   {name:'Huevo de dragón', art:'dragonegg', ai:'walk', hp:1500, dmg:0, spd:0, r:14, xp:70, reach:0, prep:.6, egg:true, dragonzone:true},
  obsidiandr:  {name:'Dragón de obsidiana', art:'obsidiandr', ai:'brain', brain:'obsidiandr', hp:26000, dmg:330, spd:72, r:50, xp:4200, reach:0, prep:.6, boss:true, uniques:['obsblade', 'obsmirror', 'obshelm', 'obsboots']},
});
Object.assign(RARE_PREFIX, {dragonegg:['Dorado', 'Ardiente', 'Antiguo', 'Primigenio'], obsidiandr:['Obsidiana']});
Object.assign(MON_COLORS, {dragonegg:['#a8683a', '#f4dca0', '#ff8a3a'], obsidiandr:['#3a3260', '#a898e0', '#ffffff']});
Object.assign(DRAGON_TINT, {obs:{h:262, spread:.15, s:.4, l:.5, add:0, fl:['#0a0814', '#2a2438', '#5a4e7a', '#c8b8f0']}});
DRAGON_BREATH.obsidiandr = {col:DRAGON_TINT.obs.fl, spd:[260, 560], sz:[10, 26], n:18};
{
  const im = new Image();
  im.onload = () => {
    const F = dragonFrames(im, .46), pick3 = [F[3], F[8], F[0]];
    MON_ART.obsidiandr = {fr:pick3.map(f => SP(dragonTint(f.c, DRAGON_TINT.obs), f.ax, f.ay))};
    MON_ART.obsidiandr.mouth = dragonMouth(pick3[0]);
    MON_ART.obsidiandr.flash = MON_ART.obsidiandr.fr.map(s => { const cv = document.createElement('canvas'); cv.width = s.c.width; cv.height = s.c.height; const g = cv.getContext('2d'); g.drawImage(s.c, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); return {c:cv, ax:s.ax, ay:s.ay}; });
  };
  im.src = DRAGON_SHEET;
}
BRAINS.obsidiandr = {wake:'¡El dragón de obsidiana despierta!', rage:'¡El dragón de obsidiana ruge con furia!', col:'#a898e0', chargeSpd:430, keep:60, dust:'#8a7ab0', p2spd:1.3,
  attacks:[
    {id:'claw', name:'Zarpazo de obsidiana', prep:.7, w:24, max:150, warn:130, cast:m => bossSlash(m, 132, .9, 1.35, ['#a898e0', '#ffffff'], () => { P.weakT = Math.max(P.weakT || 0, 3); })},
    {id:'shards', name:'Esquirlas de obsidiana', prep:.9, w:20, min:110, cast:m => projFan(m, 7, .2, 270, .85, () => ({kind:'bolt', r:7, bleed:true, col:['#2a2438', '#8a7ab0', '#ffffff']}))},
    {id:'rain', name:'Lluvia de obsidiana', prep:1.1, w:18, cast:m => bossRain(m, ['boom'], 9, 260, 1)},
    {id:'breath', name:'¡Aliento de obsidiana!', prep:1.1, w:20, min:80, cast:m => { const a0 = angTo(m); for(let i = 0; i < 5; i++) bossBeam(m, a0 + (i - 2)*.3, .9, 120, 560, 1.4, '#b8a8f0', Math.random() < .55 ? 'weak' : undefined); }},
    {id:'tail', name:'Coletazo', prep:.8, w:14, max:170, warn:150, cast:m => bossSlam(m, 150, 1.2, '#a898e0')},
    {id:'dive', name:'¡Zarpazo en picado!', prep:.9, w:12, min:170, cast:m => bossLeap(m, P.x, P.y, .8)},
    {id:'wall', name:'Muro de cristal', prep:1.1, w:14, cast:m => bossBarrage(m, 6, .95)},
    {id:'grid', name:'Esquirlas en damero', prep:1.1, w:14, p2:true, cast:m => bossGrid(m, 2, 72, 1)},
    {id:'pull', name:'¡Vórtice de obsidiana!', prep:1.2, w:14, p2:true, cast:m => { bossPull(m, 2.6, 400, 130, .9); (m.later = m.later || []).push({t:2.6, fn:mm => bossRain(mm, ['boom'], 8, 250, 1)}); }},
    {id:'crown', name:'Corona de esquirlas', prep:1.1, w:14, p2:true, cast:m => bossRingBooms(m, 12, 190, 1)},
  ],
  land:m => { bossSlam(m, 160, 1.3, '#a898e0'); bossRingBooms(m, 10, 180, 1); }};

const EGG_DRAGONS = ['dgearth', 'dgair', 'dgelec', 'dglight'];
function breakEgg(m){
  const lvl = G.sc.lvl || 15;
  addText(m.x, m.y - 40, '¡El huevo se rompe!', '#ffd070', 8, -20); burst(m.x, m.y - 10, 22, ['#f4dca0', '#a8683a', '#ffd070'], [50, 180], [.4, .9], 100); sfx('stoneHit');
  if(Math.random() < .35){   // el huevo estaba lleno de tesoro
    for(let i = 0; i < randi(2, 3); i++){ const e = wpick(lootFor(LOOT.monsterTable, lvl)); dropItem(m.x + rand(-14, 14), m.y + rand(0, 10), mkItem(e.id, e.n ? randi(e.n[0], e.n[1]) : 1, lvl, 0)); }
    dropGold(m.x, m.y, Math.round(randi(60, 140)*(1 + (lvl - 1)*.35))); caveGemDrop(m, 3);
    addText(m.x, m.y - 56, '¡Tesoro!', '#ffe08a', 8, -20); return;
  }
  const n = randi(1, 3), kinds = shuffle(EGG_DRAGONS.slice());
  for(let i = 0; i < n; i++){
    const p = freeSpotNear(m.x + rand(-34, 34), m.y + rand(-10, 30), 20), rar = Math.random() < .3 ? 'magic' : 'normal';
    const g = mkMonster(kinds[i], rar, p.x, p.y, {}); g.maxHp *= 1.4; g.hp = g.maxHp; g.dmg *= 1.4; g.aggro = true; g.spawnIn = 1; g.name = 'Cría de ' + g.name.toLowerCase().replace(/^dragón/, 'dragón');
    G.mons.push(g); burst(p.x, p.y - 10, 14, ['#ff8a3a', '#ffd070', '#ffffff'], [40, 140], [.3, .6], -30);
  }
  addText(m.x, m.y - 56, n === 1 ? '¡Un dragón!' : '¡' + n + ' dragones!', '#ff9a3a', 9, -20); G.shake = Math.max(G.shake, 5); sfx('howl');
}
function crownChest(m){   // el dragón de obsidiana guarda el cofre del tesoro del pueblo del norte
  const sp = freeSpotNear(m.x - 10, m.y + 90, 14), ch = {x:Math.round(sp.x), y:Math.round(sp.y), rare:true, open:false, crown:true};
  ch.col = addCollider(G.sc, {t:'r', x:ch.x - 9, y:ch.y - 8, w:18, h:8}); G.sc.chests.push(ch);
  G.sc.lights.push({x:ch.x, y:ch.y - 14, r:140, a:.95, warm:true, flick:.15}); ring(ch.x, ch.y - 10, 44, '#ffe08a', .6);
  toast('¡El dragón guardaba el cofre con el tesoro del pueblo del norte!', 5);
}
{
  const _tick = monAffixTick, _death = monAffixDeath;
  monAffixTick = function(m, dt){
    if(MONSTERS[m.type].egg && !m.dying){ m.vx = m.vy = 0; m.atkCd = 9; m.prepT = 0; return true; }   // los huevos no se mueven ni atacan
    return _tick(m, dt);
  };
  monAffixDeath = function(m){
    _death(m);
    if(!G.sc || G.sc.id !== 'dragoncave') return;
    const MD = MONSTERS[m.type];
    if(MD.egg){ breakEgg(m); return; }
    if(m.type === 'obsidiandr'){ crownChest(m); return; }
    if(!m.summoner && !m.small && MD.dragonzone) caveGemDrop(m);
  };
  addEventListener('load', () => { const _open = openChest; openChest = function(c){   // main.js se carga después
    _open(c);
    if(!c.crown) return;
    dropGold(c.x, c.y + 4, Math.round(4000*(1 + .35*14)));
    if(!(typeof qDone === 'function' && qDone('crown')) && countItem('northcrown') === 0){ dropItem(c.x, c.y + 12, mkItem('northcrown')); toast('¡La corona del rey del norte! Llévasela a Alexandra', 4.5); sfx('levelup'); }
  }; });
}

// ---------- mapa: una cueva de obsidiana con lava, cristales y montañas de oro ----------
const CAVE_FLOOR = ['#1a1424', '#241c32', '#2e2440', '#3a2e50'], CAVE_WALL = ['#08060e', '#100c18', '#16101f', '#1e1630'];
ART.goldpile = SP(paintSprite(44, 24, [
  {poly:[[0, 24], [6, 12], [16, 5], [28, 4], [38, 11], [44, 24]], c:['#6a4a08', '#c8962e', '#ffd84a', '#fff0a0'], tex:1521},
  {e:[14, 14, 4, 2.4], c:['#ffd84a', '#fff0a0']}, {e:[28, 10, 3.6, 2.2], c:['#ffd84a', '#fff0a0']}, {e:[22, 18, 4.4, 2.4], c:['#c8962e', '#ffe08a']}, {p:[[10, 17, '#ffffff'], [33, 15, '#ffffff'], [20, 8, '#ffffff']]},
]), 22, 22);
const crystalArt = (c1, c2, c3) => SP(paintSprite(20, 28, [
  {poly:[[10, 0], [16, 9], [13, 27], [6, 27], [4, 9]], c:[c1, c2, c3, '#ffffff']}, {poly:[[3, 14], [8, 9], [8, 27], [1, 27]], c:[c1, c2, c3]}, {poly:[[14, 15], [19, 12], [19, 27], [13, 27]], c:[c1, c2, c3]}, {p:[[10, 5, '#ffffff'], [9, 11, '#ffffff']]},
]), 10, 27);
ART.pinkcrystal = crystalArt('#8a2a6a', '#d860a8', '#ffb0dc'); ART.whitecrystal = crystalArt('#7a84a0', '#c8d0e8', '#f4f8ff'); ART.obsspike = crystalArt('#08060e', '#1c1830', '#5a4e7a');
function buildDragonCave(seed){
  const sc = buildRectWorld({id:'dragoncave', name:'La cueva de los dragones', lvl:15, petExp:15, cols:3, rows:4, nodeW:[320, 400], nodeH:[300, 360], boss:{w:780, h:600}, spacingX:480, spacingY:440, monMul:.55,
    darkness:.88, loops:.35, warm:true, lightA:.75, corridor:84,
    floor:(x, y, e) => e ? '#120c1c' : CAVE_FLOOR[tq(vnoise(x/14, y/14, 1561)*.7 + hash(x, y, 1562)*.3, x, y, 4)],
    void:(x, y, near) => near ? '#2a1228' : CAVE_WALL[tq(vnoise(x/16, y/16, 1563)*.7 + hash(x, y, 1564)*.3, x, y, 4)],
    groups:[['dragonegg']],
    decor:(sc, n, H) => {
      const cnt = Math.round(n.w*n.h/9000);
      for(let i = 0; i < cnt; i++){ const p = H.pointOn(n, 14); if(!p) continue; const r = H.R();
        if(r < .28) propSprite(sc, ART.goldpile, p.x, p.y, {t:'c', x:p.x, y:p.y - 2, r:11}, [14, 4]);
        else if(r < .5){ propSprite(sc, ART.pinkcrystal, p.x, p.y, {t:'c', x:p.x, y:p.y - 2, r:6}, [10, 3]); sc.lights.push({x:p.x, y:p.y - 14, r:80, a:.55, warm:false, flick:.12, tint:'rgba(255,130,190,.25)'}); }
        else if(r < .68){ propSprite(sc, ART.whitecrystal, p.x, p.y, {t:'c', x:p.x, y:p.y - 2, r:6}, [10, 3]); sc.lights.push({x:p.x, y:p.y - 14, r:80, a:.5, warm:false, flick:.12}); }
        else if(r < .9) propSprite(sc, ART.obsspike, p.x, p.y, {t:'c', x:p.x, y:p.y - 2, r:6}, [10, 3]);
        else { const f = propSprite(sc, ART.campfire, p.x, p.y, {t:'c', x:p.x, y:p.y - 2, r:7}); f.draw = function(){ drawSP(ART.campfire, p.x, p.y); drawFlames(p.x, p.y - 8, .6); }; sc.lights.push({x:p.x, y:p.y - 10, r:140, a:.75, warm:true, flick:.12}); } }
    },
    bossDecor:(sc, n, H) => {
      for(let i = 0; i < 10; i++){ const a = i/10*Math.PI*2, x = Math.round(n.x + Math.cos(a)*(n.w/2 - 50)), y = Math.round(n.y + Math.sin(a)*(n.h/2 - 50)); if(H.walk(x, y) && !blocked(sc, x, y, 14) && Math.hypot(x - n.x, y - (n.y + n.h/2)) > 80){ propSprite(sc, ART.obsspike, x, y, {t:'c', x, y:y - 2, r:7}, [10, 3]); sc.lights.push({x, y:y - 24, r:110, a:.6, warm:true, flick:.2}); } }
      for(let i = 0; i < 9; i++){ const x = Math.round(n.x + rand(-n.w/2 + 70, n.w/2 - 70)), y = Math.round(n.y + rand(-n.h/2 + 90, n.h/2 - 60)); if(H.walk(x, y) && !blocked(sc, x, y, 14) && Math.hypot(x - n.x, y - n.y) > 130) propSprite(sc, ART.goldpile, x, y, {t:'c', x, y:y - 2, r:11}, [14, 4]); }
      sc.lights.push({x:n.x, y:n.y, r:340, a:.55, warm:true, flick:.1}, {x:n.x, y:n.y - n.h/2 + 40, r:240, a:.7, warm:true, flick:.18});
    }}, seed);
  for(const sp of sc.monsterSpawns) for(const e of sp.pack) if(e.type === 'dragonegg') e.rarity = 'normal';
  return sc;
}
RAID_BUILDERS.dragoncave = buildDragonCave;

// ---------- mascotas de la cueva (aprobadas por el usuario; arte por formas) ----------
function petLizardX(f, o){ return petQuad(f, o); }
const OBS_PAL = {fl:OBS_FL, bel:['#6a5a9a', '#a898e0']};
Object.assign(PET_SHAPES, {
  salamandrita:  {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#5a1008', '#b82a14', '#ff5a2a', '#ffc07a'], ears:'round', tail:'long', tex:1601, dk:'#2a0804', eye:'#ffe84a', legW:1.8})},
  mosquitoambar: {w:30, h:20, ax:15, ay:19, fly:true, shapes:f => petDragonfly(f, {pal:['#6a3a08', '#c8801c', '#ffc850', '#fff0b0'], tip:'#6a4a10'})},
  geckocristal:  {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#2a6a7a', '#4aa8b8', '#8ae0e8', '#d8ffff'], ears:'round', tail:'long', tex:1621, dk:'#0e3a44', eye:'#ff4a8a', legW:1.6})},
  murciobsidiana:{w:28, h:20, ax:13, ay:19, fly:true, glow:'#a898e0', shapes:f => petBird(f, {pal:['#08060e', '#1c1830', '#3a3260', '#6a5a9a'], tex:1631, beak:'#a898e0'})},
  escarabajomagma:{w:24, h:18, ax:11, ay:16, shapes:f => petScarab(f, {pal:['#5a1008', '#a82a14', '#ff5a2a', '#ffc07a'], tex:1641})},
  criawyvern:    {w:34, h:26, ax:15, ay:21, fly:true, shapes:f => petDragonX(f, {fl:['#4a3a20', '#8a7040', '#c8a868', '#f0e0b8'], bel:['#e8dcc0', '#ffffff'], tex:1651})},
  golemcuarzo:   {w:38, h:25, ax:17, ay:24, glow:'#ff9ad0', shapes:f => petQuad(f, {pal:['#7a2a5a', '#c8508a', '#ffa0d0', '#ffe0f0'], ears:'horns', horn:['#e8a0d0', '#ffe0f0'], tail:'short', tex:1661, dk:'#3a1030', eye:'#ffffff', legW:3})},
  lagartomagma:  {w:38, h:25, ax:17, ay:24, glow:'#ff6a2a', shapes:f => petQuad(f, {pal:['#2a0a04', '#7a2208', '#e0501a', '#ffb04a'], ears:'round', tail:'long', tex:1671, dk:'#14040a', eye:'#ffe84a', legW:2.2})},
  quimera:       {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#6a4a1c', '#a87a30', '#d8aa54', '#f4d890'], mane:['#8a3a14', '#c8641a'], ears:'horns', horn:['#6a5a3a', '#e8d8a8'], tail:'lion', tex:1681, dk:'#2a1a08', eye:'#ff4a2a', legW:2.6})},
  basilisco:     {w:38, h:25, ax:17, ay:24, shapes:f => petQuad(f, {pal:['#1c4a2a', '#2e8a44', '#6ad078', '#c8f8a8'], ears:'pointy', tail:'long', tex:1691, dk:'#0a2414', eye:'#ffe84a', legW:2, spots:[[12, 11], [17, 10], [22, 11]], spotCol:'#c8f0a0'})},
  onix:          {w:34, h:30, ax:15, ay:25, fly:true, glow:'#a898e0', shapes:f => petDragonX(f, Object.assign({tex:1701}, OBS_PAL))},
});
regPets(['salamandrita', 'mosquitoambar', 'geckocristal', 'murciobsidiana', 'escarabajomagma', 'criawyvern', 'golemcuarzo', 'lagartomagma', 'quimera', 'basilisco', 'onix'], {
  salamandrita:  {exp:15, name:'Salamandrita', rarity:'normal', look:'Lagarto de fuego', beh:'ranged', proj:'ember', dmg:[10, 14], cd:1.7, burn:true, affixes:['rastrobrasas'], attack:'Brasitas que queman'},
  mosquitoambar: {exp:15, name:'Mosquito Ámbar', rarity:'normal', look:'Mosquito dorado', beh:'flyer', dmg:[10, 14], cd:.8, affixes:['savia'], attack:'Picotazos desde el aire'},
  geckocristal:  {exp:15, name:'Gecko de Cristal', rarity:'normal', look:'Lagartija translúcida', beh:'pounce', dmg:[11, 15], cd:1.5, bites:2, affixes:['corazaviva'], attack:'Doble zarpazo'},
  murciobsidiana:{exp:15, name:'Murci Obsidiana', rarity:'normal', look:'Murciélago negro', beh:'flyer', dmg:[10, 14], cd:.9, affixes:['vientoveloz'], attack:'Picotazos desde el aire'},
  escarabajomagma:{exp:15, name:'Escarabajo Magma', rarity:'normal', look:'Escarabajo rojo de lava', beh:'charge', dmg:[11, 15], cd:2.4, miniStun:true, affixes:['resiliente'], attack:'Embestida que aturde 0,5 s'},
  criawyvern:    {exp:15, name:'Cría de Wyvern', rarity:'magic', look:'Wyvern pequeño', beh:'diver', dmg:[15, 20], cd:2.3, affixes:['rapaz', 'voladora'], attack:'Picada desde el aire'},
  golemcuarzo:   {exp:15, name:'Gólem de Cuarzo', rarity:'magic', look:'Gólem de cuarzo rosa', beh:'charge', dmg:[15, 20], cd:2.8, knock:true, shock:true, affixes:['corazaviva', 'escudera'], attack:'Embate con onda de choque que aturde'},
  lagartomagma:  {exp:15, name:'Lagarto de Magma', rarity:'magic', look:'Lagarto de lava', beh:'cone', dmg:[14, 19], cd:2.4, fire:'#ff6a2a', affixes:['ignea', 'rastrobrasas'], attack:'Aliento corto de lava en cono'},
  quimera:       {exp:15, name:'Quimera', rarity:'rare', look:'León con cuernos y cola de serpiente', beh:'pounce', dmg:[26, 34], cd:1.7, bites:2, bleed:1, affixes:['furiacomp', 'feroz', 'cazadora', 'savia'], attack:'Zarpazos con sangrado'},
  basilisco:     {exp:15, name:'Basilisco', rarity:'rare', look:'Serpiente con cresta', beh:'pounce', dmg:[26, 34], cd:1.8, affixes:['pulmon', 'venenosa', 'dura', 'agilc'], attack:'Mordisco venenoso'},
  onix:          {exp:15, name:'Ónix', rarity:'legendary', look:'Cría del dragón de obsidiana', beh:'cone', dmg:[34, 44], cd:2, fire:'#c8b0ff', legendary:true, scales:true, skillName:'¡Escamas de obsidiana!', affixes:['segundoaliento', 'corazaviva', 'furiacomp', 'presa'],
                  attack:'Aliento de obsidiana en cono. Escamas de obsidiana cada 24 s: escudo de 70 al héroe y cura el 20 % a las mascotas'},
}, PET_SHAPES);

// ---------- efectos: escamas de Ónix, escudo de la Capa de Escamas Negras y reflejo del escudo espejo ----------
function updateDragonCave(dt){
  if(P.dead) return;
  for(const p of G.pets) if(p.def.scales && p.hp > 0){
    p.scaleCd = (p.scaleCd ?? 8) - dt;
    if(p.scaleCd <= 0 && G.mons.some(m => !m.dying && m.aggro && Math.hypot(m.x - p.x, m.y - p.y) < 300)){
      p.scaleCd = 24; P.petShield = Math.max(P.petShield || 0, 70);
      for(const q of G.pets) if(q.hp > 0) q.hp = Math.min(q.maxHp, q.hp + q.maxHp*.2);
      for(const r2 of [30, 60, 90]) ring(P.x, P.y - 8, r2, '#a898e0', .5); burst(P.x, P.y - 16, 20, ['#a898e0', '#2a2438', '#ffffff'], [40, 140], [.4, .8], -20);
      addText(p.x, p.y - 42, p.def.skillName, '#c8b8f0', 9); sfx('alba');
    }
  }
  if(legendOn('blackscale')){
    P.scaleT = (P.scaleT ?? 10) - dt;
    if(P.scaleT <= 0){ P.scaleT = 25; P.petShield = Math.max(P.petShield || 0, 80); addText(P.x, P.y - 56, 'Escamas negras', '#c8b8f0', 8); ring(P.x, P.y - 10, 36, '#a898e0', .5); }
  } else P.scaleT = undefined;
}
{ const _uw = updateWorld12; updateWorld12 = function(dt){ _uw(dt); updateDragonCave(dt); }; }

Object.assign(LANG_EN, {
  'La cueva de los dragones':'The Dragon Cave', 'Una cueva enorme de obsidiana y lava donde los dragones anidan sobre montañas de oro. En el fondo duerme el dragón de obsidiana, que guarda el tesoro del pueblo del norte.':'A huge cave of obsidian and lava where dragons nest on mountains of gold. Deep inside sleeps the obsidian dragon, who guards the treasure of the northern village.',
  'Huevos de dragón (al romperse dan botín o sueltan de 1 a 3 dragones de tierra, aire, rayo o luz). Jefe: el dragón de obsidiana':'Dragon eggs (when broken they give loot or release 1 to 3 earth, air, lightning or light dragons). Boss: the obsidian dragon',
  'Encuentra el tesoro del pueblo del norte':'Find the treasure of the northern village',
  'Has cruzado el puente... ahora te pido algo más grande. En la cueva de los dragones vive el dragón de obsidiana, y es él quien guarda el tesoro de mi pueblo.':'You crossed the bridge... now I ask something bigger of you. The obsidian dragon lives in the dragon cave, and it guards the treasure of my village.',
  'Dentro de su cofre encontrarás la corona del rey del norte (objeto de misión verde fluorescente). Devuélvemela: es un recuerdo de mi gente y me gustaría tenerla conmigo.':"Inside its chest you will find the crown of the king of the north (fluorescent green quest item). Bring it back to me: it is a keepsake of my people and I would like to have it with me.",
  'Si mueres con ella la perderás. A cambio te daré 50.000 de oro y una tirada gratis.':'If you die with it you will lose it. In return I will give you 50,000 gold and a free spin.',
  'Derrota al dragón de obsidiana':'Defeat the obsidian dragon', 'en la cueva de los dragones':'in the dragon cave', 'y abre su cofre: la corona del rey del norte':'and open its chest: the crown of the king of the north',
  '✔ La tienes: llévasela a Alexandra':'✔ You have it: take it to Alexandra', '✘ Aún no la has conseguido':'✘ You have not got it yet',
  '¡La corona del rey del norte! Mi gente la llevó durante siglos...':'The crown of the king of the north! My people wore it for centuries...', 'Gracias de corazón. Aquí tienes tus 50.000 de oro y una tirada gratis.':'Thank you from the heart. Here are your 50,000 gold and a free spin.',
  '+50.000 de oro (guardados en la guarida)':'+50,000 gold (stored in the den)',
  'Corona del rey del norte':'Crown of the King of the North', 'Objeto de misión. La corona del rey del norte, tesoro del pueblo de Alexandra: llévasela. Si mueres con ella la perderás.':'Quest item. The crown of the king of the north, treasure of Alexandra’s people: take it to her. If you die with it you will lose it.',
  'Cuarzo rosa':'Rose quartz', 'Cuarzo blanco':'White quartz', 'Fósil de mosquito':'Mosquito fossil',
  'Tus mascotas regeneran 2 de vida por segundo y hacen un 8 % más de daño. Luz rosa.':'Your pets regenerate 2 health per second and deal 8% more damage. Pink light.',
  '+60 de capacidad de aceite, +50 % de área de luz y +15 % de regeneración de estamina. Luz blanca.':'+60 oil capacity, +50% light area and +15% stamina regeneration. White light.',
  '+150 de capacidad de aceite y 4 % de robo de vida. Un mosquito atrapado en ámbar. Luz ámbar.':'+150 oil capacity and 4% life steal. A mosquito trapped in amber. Amber light.',
  ' Solo cae en la cueva de los dragones. Aish la engarza en el farolillo.':' It only drops in the dragon cave. Aish sets it in the lantern.',
  'Hoja de obsidiana':'Obsidian Blade', 'Objeto legendario del dragón de obsidiana. El 40 % de los golpes quema y el 30 % causa sangrado.':'Legendary item of the obsidian dragon. 40% of hits burn and 30% cause bleeding.',
  'Escudo espejo de obsidiana':'Obsidian Mirror Shield', 'Objeto legendario del dragón de obsidiana. Bloquea el 90 % del daño frontal y refleja el 50 % del golpe al atacante.':'Legendary item of the obsidian dragon. Blocks 90% of frontal damage and reflects 50% of the hit back at the attacker.',
  'Yelmo del dragón negro':'Black Dragon Helm', 'Objeto legendario del dragón de obsidiana. Un yelmo de cristal negro con cuernos.':'Legendary item of the obsidian dragon. A horned helm of black crystal.',
  'Botas de obsidiana':'Obsidian Boots', 'Objeto legendario del dragón de obsidiana. Ligeras como el humo, duras como el cristal.':'Legendary item of the obsidian dragon. Light as smoke, hard as crystal.',
  'Capa de Escamas Negras':'Black Scale Cloak', 'Objeto legendario. Escamas de obsidiana: cada 25 s te rodea un escudo de 80 de daño.':'Legendary item. Obsidian scales: every 25 s a shield absorbing 80 damage surrounds you.',
  'Arco de Hueso de Wyvern':'Wyvern Bone Bow', 'Objeto legendario de la cueva de los dragones. Cada disparo lanza 3 flechas que atraviesan a 2 enemigos (la 2.ª y la 3.ª sin gastar flecha). Usa flechas.':'Legendary item of the dragon cave. Each shot fires 3 arrows that pierce 2 enemies (the 2nd and 3rd cost no arrow). Uses arrows.',
  'Anillo del Avaro':"Miser's Ring", 'Objeto legendario de la cueva de los dragones. +50 % de oro y el 35 % de los monstruos sueltan monedas extra.':'Legendary item of the dragon cave. +50% gold and 35% of monsters drop extra coins.',
  'Huevo de dragón':'Dragon Egg', 'Dragón de obsidiana':'Obsidian Dragon', 'Dorado':'Golden', 'Ardiente':'Burning', 'Antiguo':'Ancient', 'Primigenio':'Primal', 'Obsidiana':'Obsidian',
  '¡El dragón de obsidiana despierta!':'The obsidian dragon awakens!', '¡El dragón de obsidiana ruge con furia!':'The obsidian dragon roars with fury!',
  'Zarpazo de obsidiana':'Obsidian Claw', 'Esquirlas de obsidiana':'Obsidian Shards', 'Lluvia de obsidiana':'Obsidian Rain', '¡Aliento de obsidiana!':'Obsidian Breath!', 'Muro de cristal':'Crystal Wall', 'Esquirlas en damero':'Checkered Shards', '¡Vórtice de obsidiana!':'Obsidian Vortex!', 'Corona de esquirlas':'Crown of Shards',
  '¡El huevo se rompe!':'The egg breaks!', '¡Tesoro!':'Treasure!', '¡Un dragón!':'A dragon!', '¡El dragón guardaba el cofre con el tesoro del pueblo del norte!':'The dragon was guarding the chest with the treasure of the northern village!',
  '¡La corona del rey del norte! Llévasela a Alexandra':'The crown of the king of the north! Take it to Alexandra', 'Escamas negras':'Black scales', '¡Escamas de obsidiana!':'Obsidian Scales!',
  'Salamandrita':'Little Salamander', 'Lagarto de fuego':'Fire lizard', 'Brasitas que queman':'Embers that burn', 'Mosquito Ámbar':'Amber Mosquito', 'Mosquito dorado':'Golden mosquito',
  'Gecko de Cristal':'Crystal Gecko', 'Lagartija translúcida':'Translucent lizard', 'Doble zarpazo':'Double claw swipe', 'Murci Obsidiana':'Obsidian Bat', 'Murciélago negro':'Black bat',
  'Escarabajo Magma':'Magma Beetle', 'Escarabajo rojo de lava':'Red lava beetle', 'Cría de Wyvern':'Wyvern Hatchling', 'Wyvern pequeño':'Small wyvern', 'Picada desde el aire':'Dive from the air',
  'Gólem de Cuarzo':'Quartz Golem', 'Gólem de cuarzo rosa':'Rose quartz golem', 'Lagarto de Magma':'Magma Lizard', 'Lagarto de lava':'Lava lizard', 'Aliento corto de lava en cono':'Short cone of lava breath',
  'Quimera':'Chimera', 'León con cuernos y cola de serpiente':'Horned lion with a snake tail', 'Zarpazos con sangrado':'Claws that cause bleeding', 'Basilisco':'Basilisk', 'Serpiente con cresta':'Crested serpent', 'Mordisco venenoso':'Venomous bite',
  'Ónix':'Onyx', 'Cría del dragón de obsidiana':'Hatchling of the obsidian dragon', 'Aliento de obsidiana en cono. Escamas de obsidiana cada 24 s: escudo de 70 al héroe y cura el 20 % a las mascotas':'Cone of obsidian breath. Obsidian Scales every 24 s: a 70 shield for the hero and heals pets by 20%',
});
LANG.load(LANG_EN);
