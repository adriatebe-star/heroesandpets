'use strict';
// =====================================================================
//  Expedición 8 · La mina de los enanos, gemas y Aish, el elfo de luz (engarce en el farolillo)
// =====================================================================

// ---------- gemas: botín exclusivo de la mina; Aish las engarza en el farolillo ----------
const GEMS = {
  ruby:      {name:'Rubí',       col:'#ff4a5a', pal:{L:'#6a0a1a', l:'#d02a40', w:'#ff7a8a', W:'#ffe0e4'}, value:150, regen:2.5, tint:'255,40,50',
              desc:'Regenera 2,5 de vida por segundo. Luz roja.'},
  emerald:   {name:'Esmeralda',  col:'#3adc78', pal:{L:'#0a4a24', l:'#22b058', w:'#7af0a0', W:'#e0ffe8'}, value:140, regen:1.5, petRegen:1.5, tint:'50,255,110',
              desc:'Regenera 1,5 de vida por segundo a ti y a tus mascotas. Luz verde.'},
  amethyst:  {name:'Amatista',   col:'#b070ff', pal:{L:'#3a1a6a', l:'#8a48d8', w:'#c898ff', W:'#f0e4ff'}, value:120, oil:50, light:1.25, tint:'170,80,255',
              desc:'+50 de capacidad de aceite y mayor área de luz. Luz violeta.'},
  topaz:     {name:'Topacio',    col:'#ffa030', pal:{L:'#7a3a08', l:'#e08a20', w:'#ffc060', W:'#fff0d0'}, value:130, oil:125, dr:.08, tint:'255,150,30',
              desc:'+125 de capacidad de aceite y −8 % de daño recibido. Luz naranja.'},
  sapphire:  {name:'Zafiro',     col:'#4a7aff', pal:{L:'#0a1a6a', l:'#2a58d8', w:'#7aa0ff', W:'#e0e8ff'}, value:140, light:1.25, move:15, tint:'50,110,255',
              desc:'Mayor área de luz y +15 % de velocidad de movimiento. Luz azul.'},
  aquamarine:{name:'Aguamarina', col:'#7ae8ff', pal:{L:'#0a4a5a', l:'#38b8d0', w:'#9af0ff', W:'#eafcff'}, value:130, light:1.15, freeze:true, tint:'120,230,255',
              desc:'Un poco más de área de luz; los enemigos dentro del área pueden congelarse (con poca frecuencia). Luz azul clara.'},
  opal:      {name:'Ópalo',      col:'#ffb8f0', pal:{L:'#5a4a8a', l:'#a8c8e8', w:'#f8d0f0', W:'#ffffff'}, value:220, oil:100, oilRegen:.6, tint:'rainbow',
              desc:'+100 de capacidad de aceite y regenera 0,6 de aceite por segundo. Luz arcoíris.'},
  obsidian:  {name:'Obsidiana',  col:'#8a7ab0', pal:{L:'#0a0814', l:'#2a2438', w:'#5a4e7a', W:'#a89ad0'}, value:100, light:.02, hpDrain:3, dmg:8, sreg:35, tint:null,
              desc:'Te quita 3 de vida por segundo en las expediciones (sin llegar a matarte) y el farolillo casi no da luz, pero ganas +8 de daño y +35 % de regeneración de estamina.'},
  diamond:   {name:'Diamante',   col:'#e8f4ff', pal:{L:'#6a7a98', l:'#c8dcf0', w:'#f4fbff', W:'#ffffff'}, value:400, oil:50, light:2, oilRegen:.9, tint:'255,255,255',
              desc:'+50 de capacidad de aceite, duplica el área de luz y regenera 0,9 de aceite por segundo. Luz blanca intensa.'},
};
const GEM_IDS = Object.keys(GEMS);
const GEM_ROWS = ["....kkkk....", "..kkLLLLkk..", ".kLLllllLLk.", "kLllWWllllLk", "kLlWwwllllLk", ".kLlllllLLk.", "..kLLllLLk..", "...kLLLLk...", "....kLLk....", ".....kk....."];
for(const id of GEM_IDS){
  ICON_ROWS['gem_'+id] = {pal:GEMS[id].pal, rows:GEM_ROWS};
  ICONS['gem_'+id] = bakeRows(GEM_ROWS, Object.assign({k:OUT}, GEMS[id].pal));
  ITEMS[id] = {name:GEMS[id].name, icon:'gem_'+id, stack:20, gem:true, value:GEMS[id].value, desc:GEMS[id].desc + (GEMS[id].noSocket ? '' : ' Aish la engarza en el farolillo.')};
}
const NOGEM = {};
const lanternGem = () => { const l = G.inv.equip.lantern; return l && l.gem && GEMS[l.gem] ? GEMS[l.gem] : NOGEM; };
function gemTint(gm){
  if(!gm.tint) return null;
  if(gm.tint === 'rainbow') return `hsla(${Math.floor(G.t*70)%360},95%,62%,.26)`;
  return `rgba(${gm.tint},${gm.light === 2 ? .34 : .24})`;
}
// efectos del farolillo engarzado (se llama cada frame desde el bucle del héroe)
function updateLanternGem(dt){
  const gm = lanternGem(); if(gm === NOGEM || P.dead) return;
  const inRaid = G.sc.kind === 'raid', lit = P.lantern && (P.oil > 0 || !inRaid);
  if(gm.hpDrain && inRaid && P.hp > 1) P.hp = Math.max(1, P.hp - gm.hpDrain*dt);   // obsidiana: te debilita poco a poco, pero nunca te mata
  if(lit && gm.regen && P.hp < P.maxHp) P.hp = Math.min(P.maxHp, P.hp + gm.regen*dt);
  if(lit && gm.petRegen) for(const p of G.pets) if(p.hp > 0 && p.hp < p.maxHp) p.hp = Math.min(p.maxHp, p.hp + gm.petRegen*dt);
  if(gm.oilRegen && inRaid && P.oil < oilMax()) P.oil = Math.min(oilMax(), P.oil + gm.oilRegen*dt);
  if(lit && (gm.burn || gm.freeze)){
    G.gemT = (G.gemT || 0) - dt;
    if(G.gemT <= 0){
      G.gemT = .5; const R2 = 175*(gm.light || 1)*.7;
      for(const m of G.mons){
        if(m.dying || m.spawnIn < 1 || Math.hypot(m.x-P.x, m.y-P.y) > R2) continue;
        if(gm.burn) m.burnT = Math.max(m.burnT || 0, 1.5);
        if(gm.freeze && Math.random() < .07 && !MONSTERS[m.type].boss && !(m.freezeT > 0) && !(m.freezeImmT > 0)){ m.freezeT = 1.2; m.freezeImmT = 1.2 + 10; burst(m.x, m.y-m.r, 12, ['#c8f0ff','#7ac8f0','#ffffff'], [30,100], [.3,.6], 0); ring(m.x, m.y-4, 20, '#c8f0ff', .3); }
      }
    }
  }
}

// ---------- objetos élficos nuevos y la llave de la mina ----------
Object.assign(ICON_ROWS, {
  elflantern: {pal:{b:'#7ad8a0', y:'#e8d070', Y:'#fffbd0'}, rows:LANT_ROWS},
  minekey: {pal:{Y:'#d8dce4', y:'#8a8e98'}, rows:["...kkkk.....", "..kYYYYk....", ".kYyyyyYk...", ".kYy..yYk...", ".kYyyyyYk...", "..kYYYYk....", "...kYYk.....", "...kYyk.....", "...kYYkkk...", "...kYyYYYk..", "...kYYkkkk..", "....kk......"]},
});
for(const k of ['elflantern', 'minekey']){ const d = ICON_ROWS[k]; ICONS[k] = bakeRows(d.rows, Object.assign({k:OUT}, d.pal)); }
const PAL_ELF = Object.assign({}, PAL, {b:'#5ab088', B:'#a8e8c8', d:'#3a7a5a'}), PAL_ELF_OFF = Object.assign({}, PAL_ELF, {y:'#2a3a34', Y:'#3a4a44'});
SPR.lantern.elf = bakeRows(SPR.lantern.rows, PAL_ELF); SPR.lantern.elfoff = bakeRows(SPR.lantern.rows, PAL_ELF_OFF);
Object.assign(ITEMS, {
  elflantern:{name:'Farolillo élfico', icon:'elflantern', slot:'lantern', oilMax:150, value:140,
              desc:'Guarda hasta 150 de aceite. Solo lo llevan los elfos oscuros. Aish puede engarzarle una gema. Se enciende y apaga con E.'},
  minekey:   {name:'Llave de la mina', icon:'minekey', stack:100, value:40,
              desc:'Una llave de hierro de la mina de los enanos. Se consume al entrar en la Expedición 8 (basta con tenerla en la mochila: si llevas 2, se gasta 1). Solo la llevan los elfos oscuros.'},
});
// botín: solo de los elfos oscuros y de cofres con poca probabilidad (Trapis no los vende)
for(const T of [LOOT.chestNormal, LOOT.chestRare]) T.table.push({w:T === LOOT.chestRare ? .8 : .3, id:'elflantern', lvl:7}, {w:T === LOOT.chestRare ? 6 : 2.7, id:'minekey', n:[1,1], lvl:7});
// gemas: solo en la mina (monstruos y cofres)
const GEM_W = {ruby:12, emerald:12, amethyst:12, topaz:10, sapphire:10, aquamarine:9, opal:6, obsidian:8, diamond:3};
for(const T of [LOOT.chestNormal, LOOT.chestRare]) for(const id of GEM_IDS) T.table.push({w:GEM_W[id]*(T === LOOT.chestRare ? .22 : .1), id, lvl:8, only:'mine'});
function gemDrop(m){
  const ch = {normal:.09, magic:.2, rare:.45}[m.rarity] || .09;
  if(Math.random() >= ch) return;
  const id = wpick(GEM_IDS.map(k => ({w:GEM_W[k], id:k}))).id;
  dropItem(m.x, m.y, mkItem(id, 1));
  addText(m.x, m.y-m.r*2-22, '¡Gema!', '#ffe0a0', 7, -20);
}

// ---------- Aish, el elfo de luz ----------
ORC_CFG.aish = {elf:true, skin:['#f4dcb4','#dcb888','#b08c5c'], hair:['#fff4c0'], hood:['#f4f0e0','#fffdf4','#c8c0a8'], tunic:['#f0e8d0','#fffaf0','#c8c0a8'], leg:['#c8b890','#e0d4b0'],
  weapon:'lantern', armor:'vest', cloak:true, cloak2:['#d8d0b8','#f4f0e0','#fffaf0'], armW:3};
ART.aish = [0, 2].map(f => SP(oCrisp(orcCanvas(f, ORC_CFG.aish)), 24, 54));

UI.aishOpen = false; UI.aishLantern = null; UI.aishGem = null;
const _blockingA = UI.blocking.bind(UI);
UI.blocking = function(){ return _blockingA() || this.aishOpen; };
function aishLanterns(){
  const out = [], E = G.inv.equip;
  if(E.lantern) out.push({it:E.lantern, where:'equipado', set:v => { E.lantern = v; }});
  G.inv.bag.forEach((it, i) => { if(it && ITEMS[it.id] && ITEMS[it.id].slot === 'lantern') out.push({it, where:'mochila', set:v => { G.inv.bag[i] = v; }}); });
  G.save.stash.forEach((it, i) => { if(it && ITEMS[it.id] && ITEMS[it.id].slot === 'lantern') out.push({it, where:'alijo', set:v => { G.save.stash[i] = v; }}); });
  return out;
}
function aishGems(){
  const out = [];
  G.inv.bag.forEach((it, i) => { if(it && ITEMS[it.id] && ITEMS[it.id].gem) out.push({it, arr:G.inv.bag, key:i}); });
  G.save.stash.forEach((it, i) => { if(it && ITEMS[it.id] && ITEMS[it.id].gem) out.push({it, arr:G.save.stash, key:i}); });
  return out;
}
UI.openAish = function(){
  this.aishOpen = true; this.aishLantern = null; this.aishGem = null; G.bigMap = false;
  $('aish').classList.remove('hidden'); sfx('ui');
  $('aiClose').onclick = () => this.closeAish();
  this.renderAish();
};
UI.closeAish = function(){ this.aishOpen = false; $('aish').classList.add('hidden'); $('tip').classList.add('hidden'); sfx('ui'); };
UI.renderAish = function(){
  const lans = aishLanterns(), gems = aishGems();
  if(!this.aishLantern || !lans.some(l => l.it === this.aishLantern)) this.aishLantern = lans.length ? lans[0].it : null;
  if(this.aishGem && !gems.some(g => g.it === this.aishGem)) this.aishGem = null;
  $('aiGold').textContent = 'Las gemas de la mina se engarzan gratis: solo trae las piedras.';
  const lan = lans.find(l => l.it === this.aishLantern), gem = gems.find(g => g.it === this.aishGem);
  const sl = (it, sel, extra='') => `<div class="smslot${sel ? ' sel' : ''}" data-k="${extra}"><img src="${itemIconURL(it)}" draggable="false">${it.n > 1 ? `<span class="tag">${it.n}</span>` : ''}</div>`;
  let h = `<div class="aicols"><div><div class="smodds">1 · Elige el farolillo:</div><div class="smgrid" id="aiLans">${lans.map((l, i) => sl(l.it, l.it === this.aishLantern, i)).join('') || '<div class="smempty">No tienes ningún farolillo.</div>'}</div>`;
  h += `<div class="smodds" style="margin-top:14px">2 · Elige la gema (mochila y alijo):</div><div class="smgrid" id="aiGems">${gems.map((g, i) => sl(g.it, g.it === this.aishGem, i)).join('') || '<div class="smempty">No tienes gemas. Búscalas en la mina de los enanos.</div>'}</div></div>`;
  h += `<div class="aiinfo"><div class="smitem ${lan ? 'has' : ''}" id="aiLanBox">`;
  if(lan){ const g0 = lan.it.gem && GEMS[lan.it.gem]; h += `<img src="${itemIconURL(lan.it)}" style="width:44px;height:44px;image-rendering:pixelated;vertical-align:middle"> <b style="font-weight:normal">${itemName(lan.it)}</b> <small>(${lan.where})</small><div class="smodds">${g0 ? `Gema engarzada: <b style="color:${g0.col}">${g0.name}</b><br>${g0.desc}` : 'Sin gema engarzada.'}</div>`; } else h += 'Elige un farolillo';
  h += `</div><div class="smitem ${gem ? 'has' : ''}" id="aiGemBox">`;
  if(gem){ const gd = GEMS[gem.it.id]; h += `<img src="${itemIconURL(gem.it)}" style="width:44px;height:44px;image-rendering:pixelated;vertical-align:middle"> <b style="color:${gd.col};font-weight:normal">${gd.name}</b><div class="smodds">${gd.desc}</div>`; } else h += 'Elige una gema';
  const can = lan && gem && !GEMS[gem.it.id].noSocket;
  h += `</div><div class="smmsg ${this.aishMsg ? this.aishMsg.t : ''}">${this.aishMsg ? this.aishMsg.text : ''}</div><button id="aiSocket" ${can ? '' : 'disabled'}>Engarzar${lan && lan.it.gem && can ? ' (sustituye la gema actual)' : ''}</button></div></div>`;
  $('aiBody').innerHTML = h;
  $('aiLans').querySelectorAll('.smslot').forEach(el => { const l = lans[+el.dataset.k]; el.onclick = () => { this.aishLantern = l.it; this.aishMsg = null; sfx('ui'); this.renderAish(); }; el.onmouseenter = e => this.showTip(l.it, e); el.onmousemove = e => this.moveTip(e); el.onmouseleave = () => $('tip').classList.add('hidden'); });
  const ge = $('aiGems'); if(ge) ge.querySelectorAll('.smslot').forEach(el => { const g = gems[+el.dataset.k]; el.onclick = () => { this.aishGem = g.it; this.aishMsg = null; sfx('ui'); this.renderAish(); }; el.onmouseenter = e => this.showTip(g.it, e); el.onmousemove = e => this.moveTip(e); el.onmouseleave = () => $('tip').classList.add('hidden'); });
  $('aiSocket').onclick = () => {
    if(!can) return;
    if(lan.it.gem && !confirm('Este farolillo ya tiene una gema engarzada. Si la sustituyes, la anterior se pierde. ¿Continuar?')) return;
    lan.it.gem = gem.it.id; if(--gem.it.n <= 0) gem.arr[gem.key] = null;
    this.aishMsg = {t:'good', text:`¡${GEMS[lan.it.gem].name} engarzado en el farolillo!`}; sfx('levelup'); burst(P.x, P.y-20, 14, ['#fff0a0','#ffffff', GEMS[lan.it.gem].col], [30,100], [.4,.8], -60);
    saveGame(); refreshStats(); UI.refresh(); this.renderAish();
  };
};

// ---------- monstruos de la mina ----------
Object.assign(MONSTERS, {
  goblin:       {name:'Goblin con daga', art:'goblin', ai:'walk', hp:150, dmg:38, spd:150, r:7, xp:55, reach:10, prep:.25, mine:true},
  goblinarcher: {name:'Goblin arquero', art:'goblinarcher', ai:'archer', hp:130, dmg:42, spd:125, r:7, xp:60, reach:0, prep:.45, range:[140,230], mine:true},
  fireimp:      {name:'Diablillo de fuego', art:'fireimp', ai:'archer', hp:210, dmg:52, spd:78, r:8, xp:75, reach:0, prep:.55, range:[90,170], flame:true, mine:true},
  ratman:       {name:'Hombre rata', art:'ratman', ai:'walk', hp:430, dmg:64, spd:105, r:11, xp:90, reach:14, prep:.4, poisonHit:true, mine:true},
});
Object.assign(RARE_PREFIX, {
  goblin:['Cuchillo','Rapiña','Sombra Veloz','Chispa'], goblinarcher:['Ojo de Lince','Flechilla','Acechador','Aguijón'],
  fireimp:['Ceniza','Brasa','Infernillo','Chamusco'], ratman:['Plaga','Alcantarilla','Rabo Sucio','Diente Podrido'],
});
Object.assign(MON_COLORS, {goblin:['#84a438','#b4d060','#ffe8a0'], goblinarcher:['#84a438','#b4d060','#ffe8a0'], fireimp:['#b8301c','#ff6a3a','#ffe070'], ratman:['#463a2c','#8a7a62','#e0909a']});
ORC_CFG.goblin = {skin:['#b4d060','#84a438','#506a24'], hair:['#2a2010'], hood:['#5a3c20','#7a5430','#3a2410'], tunic:['#7a5430','#9a6c3c','#4a3018'], leg:['#3a2a1c','#4a3624'], weapon:'dagger', armor:'vest', noPaint:true};
ORC_CFG.goblinarcher = {skin:['#b4d060','#84a438','#506a24'], hair:['#2a2010'], hood:['#3a5a2a','#56803a','#24381a'], tunic:['#4a6a30','#6a9040','#2e4620'], leg:['#3a2a1c','#4a3624'], weapon:'bow', armor:'vest', noPaint:true};
for(const id of ['goblin', 'goblinarcher']){
  const k = .66, c = ORC_CFG[id];
  MON_SHAPES[id] = {w:Math.round(64*k), h:Math.round(56*k), ax:Math.round(24*k), ay:Math.round(54*k), canvas:f => oScaled(orcCanvas(f, c), k)};
}
Object.assign(MON_SHAPES, {
  fireimp: {w:28, h:26, ax:13, ay:25, shapes(f){
    const rd=['#3a0a0a','#7a1810','#b8301c','#f05a30'], dk='#140404', sw = [0,1,-1][f];
    const wing = f===1 ? {poly:[[9,12],[1,3],[4,9],[0,13],[9,17]], c:rd.slice(0,3)} : {poly:[[9,13],[1,13],[3,17],[0,20],[9,19]], c:rd.slice(0,3)};
    return [ wing, {l:[8,20,3,22,1.2], c:'#7a1810'}, {poly:[[0,21],[4,20],[2,25]], c:rd.slice(1)},
      {l:[11,20,10+sw,25,2.4], c:rd.slice(0,3)}, {l:[16,20,17-sw,25,2.4], c:rd.slice(0,3)}, {e:[14,17,5.4,5.6], c:rd, tex:401}, {e:[15,18,3,3.2], c:['#ff9a5a','#ffc08a']},
      {l:[18,15,22,18-(f===2?3:0),1.6], c:rd.slice(0,3)}, {e:[14,8,5.6,5], c:rd, tex:402},
      {poly:[[10,4],[9,0],[12,3]], c:['#d8d0b0','#fff8e0']}, {poly:[[17,3],[19,0],[20,5]], c:['#d8d0b0','#fff8e0']},
      ...(f===2 ? [{r:[18,9,5,3], c:'#ff8a1a'}, {p:[[23,9,'#ffe070'],[24,8,'#ffb030'],[24,10,'#ffb030']]}] : [{l:[18,11,21,11,1], c:dk}]),
      {p:[[16,7,'#ffe040'],[17,7,'#ffe040'],[13,7,'#ffe040'],[22,22,rd[3]]]} ];
  }},
  ratman: {w:32, h:34, ax:15, ay:33, shapes(f){
    const fu=['#2a2018','#463a2c','#6a5a46','#8a7a62'], cl=['#3a2a1a','#5a4228','#7a5c38'], dk='#0a0806', sw = [0,2,-2][f], up = f===2 ? 4 : 0;
    return [ {l:[8,25,2,29,1.6], c:['#c0909a','#d8a8b0']}, {l:[2,29,0,23,1.4], c:'#d8a8b0'},
      {l:[12,24,11+sw,32,3.2], c:fu.slice(0,3)}, {r:[9+sw,32,5,1], c:dk}, {l:[18,24,19-sw,32,3.2], c:fu.slice(0,3)}, {r:[17-sw,32,5,1], c:dk},
      {l:[11,16,6,22,3], c:fu.slice(0,3)}, {e:[15,19,7.4,8.4], c:cl, tex:403}, {l:[20,15,26,20-up,3], c:fu.slice(0,3)}, {l:[26,20-up,28,17-up,1.2], c:'#e8e0c8'},
      {e:[18,9,5.6,5], c:fu, tex:404}, {e:[25,11,4,2.6], c:fu.slice(1)}, {e:[15,4,2.4,2.6], c:fu}, {p:[[15,4,'#e0909a'],[29,11,'#e0909a'],[22,8,'#ff3a2a'],[23,8,'#ff3a2a'],[26,13,'#f4ecd8'],[27,13,'#f4ecd8']]} ];
  }},
});
for(const id of ['goblin', 'goblinarcher', 'fireimp', 'ratman']){
  const dd = MON_SHAPES[id];
  MON_ART[id] = {fr:[0,1,2].map(f => SP(dd.canvas ? dd.canvas(f) : paintSprite(dd.w, dd.h, dd.shapes(f)), dd.ax, dd.ay))};
  MON_ART[id].flash = MON_ART[id].fr.map(s => {
    const c = document.createElement('canvas'); c.width = s.c.width; c.height = s.c.height;
    const g = c.getContext('2d'); g.drawImage(s.c,0,0); g.globalCompositeOperation='source-in'; g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height);
    return {c, ax:s.ax, ay:s.ay};
  });
}

// ---------- mapa: túneles lineales con una bifurcación (se rodea por la izquierda o por la derecha) ----------
const MINE_ROCK = ['#100e0e','#171414','#1e1a19','#262120'].map(hex), MINE_RIM = hex('#3a322d'), MINE_FLOOR = ['#2a2622','#322d28','#3a352f','#443d36'].map(hex);
function buildMine(seed){
  const R = rng(seed), rr = (a,c) => a + R()*(c-a);
  const X0 = -760, X1 = 760, Y0 = -1700, Y1 = 1450;
  const sc = baseScene('mine', 'La mina de los enanos', X0, Y0, X1, Y1);
  sc.kind = 'raid'; sc.darkness = .965; sc.seed = seed; sc.lvl = 8;
  sc.spawn = {x:30, y:1340};
  sc.horse = {x:-30, y:1360, dir:1};
  addCollider(sc, {t:'r', x:-54, y:1353, w:46, h:12});
  const paths = [
    {w:150, pts:[[0,1300],[0,900],[30,400]]},
    {w:130, pts:[[30,400],[-250,250],[-380,-100],[-300,-450],[-60,-650]]},      // rama izquierda
    {w:130, pts:[[30,400],[280,200],[400,-150],[330,-480],[60,-650]]},          // rama derecha
    {w:150, pts:[[0,-650],[0,-1000],[0,-1400]]},
    {w:90,  pts:[[-380,-100],[-540,10]]}, {w:90, pts:[[400,-150],[560,-340]]},   // galerías sin salida
    {w:90,  pts:[[0,900],[-180,860],[-300,880]]}, {w:90, pts:[[30,400],[200,420],[330,470]]},
  ];
  const rooms = [{x:0,y:1280,r:170},{x:30,y:400,r:160},{x:-380,y:-100,r:150},{x:400,y:-150,r:150},{x:0,y:-650,r:200},{x:0,y:-1400,r:290},{x:-540,y:10,r:95},{x:560,y:-340,r:95},{x:-300,y:880,r:100},{x:330,y:470,r:100}];
  const segs = []; for(const p of paths) for(let i=0;i<p.pts.length-1;i++) segs.push({x0:p.pts[i][0], y0:p.pts[i][1], x1:p.pts[i+1][0], y1:p.pts[i+1][1], hw:p.w/2});
  const caveD = (x,y) => {
    let d = 1e9;
    for(const s of segs){ const dx = s.x1-s.x0, dy = s.y1-s.y0, t = clamp(((x-s.x0)*dx + (y-s.y0)*dy)/(dx*dx + dy*dy), 0, 1); d = Math.min(d, Math.hypot(x-s.x0-dx*t, y-s.y0-dy*t) - s.hw); }
    for(const r of rooms) d = Math.min(d, Math.hypot(x-r.x, y-r.y) - r.r);
    return d + (vnoise(x/38, y/38, 801) - .5)*40;
  };
  sc.solidAt = (x,y) => caveD(x,y) > 0;
  sc.ground = (x,y) => {
    const d = caveD(x,y);
    if(d > 0){ if(d < 5) return MINE_RIM; return MINE_ROCK[tq((vnoise(x/7,y/7,802)*.6 + hash(x,y,803)*.4 - .15)/.7, x, y, 4)]; }
    if(hash(x,y,804) > .9965) return [hex('#4aa8d8'), hex('#d8504a'), hex('#58c878'), hex('#c8a0e8')][hash(x,y,805)*4|0];   // vetas de gemas
    if(hash(x,y,806) > .993) return PEB[0];
    let t = tq((vnoise(x/10,y/10,807)*.6 + hash(x,y,808)*.4 - .2)/.6, x, y, 4);
    if(d > -22) t = Math.max(0, t-1);
    return MINE_FLOOR[t];
  };
  // zonas alcanzables desde la entrada (relleno por celdas): nada se coloca en huecos aislados
  const CS = 14, NX = Math.ceil((X1-X0)/CS), NY = Math.ceil((Y1-Y0)/CS), ok = new Uint8Array(NX*NY), stack = [[Math.round((sc.spawn.x-X0)/CS), Math.round((sc.spawn.y-Y0)/CS)]];
  ok[stack[0][1]*NX + stack[0][0]] = 1;
  while(stack.length){ const [i,j] = stack.pop(); for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const a = i+di, c = j+dj; if(a<0||c<0||a>=NX||c>=NY||ok[c*NX+a]) continue; if(blocked(sc, X0+a*CS, Y0+c*CS, 9)) continue; ok[c*NX+a] = 1; stack.push([a,c]); } }
  const reach = (x,y) => { const i = Math.round((x-X0)/CS), j = Math.round((y-Y0)/CS); return i>=0 && j>=0 && i<NX && j<NY && ok[j*NX+i] === 1; };
  const free = (x,y,r) => !blocked(sc, x, y, r+6) && Math.hypot(x-sc.spawn.x, y-sc.spawn.y) > 120 && reach(x,y);
  const pick2 = (list) => list[Math.floor(R()*list.length)];
  // punto aleatorio dentro de los túneles y salas
  const point = (r, minSpawn=0, ymin=Y0, ymax=Y1) => {
    for(let i=0;i<300;i++){
      let x, y;
      if(R() < .55){ const s = pick2(segs), t = R(), hw = s.hw*.8; x = s.x0 + (s.x1-s.x0)*t + rr(-hw, hw); y = s.y0 + (s.y1-s.y0)*t + rr(-hw, hw); }
      else { const ro = pick2(rooms), a = R()*Math.PI*2, rad = Math.sqrt(R())*ro.r*.85; x = ro.x + Math.cos(a)*rad; y = ro.y + Math.sin(a)*rad; }
      x = Math.round(x); y = Math.round(y);
      if(y < ymin || y > ymax) continue;
      if(Math.hypot(x-sc.spawn.x, y-sc.spawn.y) < minSpawn) continue;
      if(free(x,y,r)) return {x, y};
    }
    return null;
  };
  let sd = seed*13;
  // antorchas y faroles a lo largo de los túneles
  for(const s of segs){
    const len = Math.hypot(s.x1-s.x0, s.y1-s.y0), n = Math.max(1, Math.floor(len/230));
    for(let i=0;i<=n;i++){ const t = (i+.5)/(n+1), x = Math.round(s.x0 + (s.x1-s.x0)*t + rr(-30,30)), y = Math.round(s.y0 + (s.y1-s.y0)*t + rr(-20,20));
      if(!free(x,y,6)) continue; sc.lights.push({x, y:y-14, r:130, a:.7, warm:true, flick:.12}); propSprite(sc, ART.torch, x, y, {t:'c', x, y:y-2, r:3, low:true}); }
  }
  for(let i=0;i<80;i++){ const p = point(12, 100); if(p) propRock(sc, p.x, p.y, ++sd); }
  for(let i=0;i<26;i++){ const p = point(9, 100); if(p) propSprite(sc, i%2 ? ART.crate : ART.barrel, p.x, p.y, i%2 ? {t:'r', x:p.x-7, y:p.y-9, w:15, h:10, low:true} : {t:'c', x:p.x, y:p.y-2, r:6, low:true}, [7,2]); }
  for(let i=0;i<8;i++){ const p = point(18, 200); if(p) propSprite(sc, ART.wagon, p.x, p.y, {t:'r', x:p.x-20, y:p.y-8, w:40, h:10}, [22,4]); }   // vagonetas mineras
  for(let i=0;i<20;i++){ const p = point(4, 150); if(p) propSprite(sc, i%3 ? ART.bones : ART.skullpile, p.x, p.y, {t:'c', x:p.x, y:p.y-2, r:5, low:true}); }
  sc.houses = []; sc.wisps = []; sc.decos = [];
  // jaulas (cuando existan las mascotas de esta expedición)
  const pets = shuffle(petsOfExp(8).filter(id => R() < CAGE_CHANCE[PETS[id].rarity]), R), cagePts = [];
  for(const id of pets){
    let p = null;
    for(let i=0; !p && i<80; i++){ const q = point(14, 250); if(q && cagePts.every(c => Math.hypot(c.x-q.x, c.y-q.y) > 220)) p = q; }
    if(!p) continue;
    cagePts.push(p);
    const cage = {x:p.x, y:p.y, pet:null, open:false};
    cage.col = addCollider(sc, {t:'r', x:cage.x-12, y:cage.y-8, w:24, h:8});
    sc.cages.push(cage);
  }
  const addChest = (p, rare) => { if(!p) return; const ch = {x:p.x, y:p.y, rare, open:false}; ch.col = addCollider(sc, {t:'r', x:p.x-9, y:p.y-8, w:18, h:8}); sc.chests.push(ch); };
  for(const ro of [{x:-540,y:10},{x:560,y:-340}]){ const p = point2(ro, 40); addChest(p, true); }
  function point2(ro, rad){ for(let i=0;i<60;i++){ const x = Math.round(ro.x + rr(-rad,rad)), y = Math.round(ro.y + rr(-rad,rad)); if(free(x,y,10)) return {x, y}; } return null; }
  for(let i=0;i<10;i++) addChest(point(10, 250), false);
  for(let i=0;i<3;i++) addChest(point(10, 600, -1600, -1100), true);          // cámara del tesoro, al fondo
  for(let i=0;i<3;i++) addChest(point(10, 400, -700, 300), R() < .4);
  for(const sx of [-1, 1]){
    let p = null; for(let i=0;i<300 && !p;i++){ const x = Math.round(sx*rr(40, 200)), y = Math.round(rr(-1560, -1300)); if(free(x,y,22)) p = {x, y}; }
    if(p){ sc.portals.push({x:p.x, y:p.y, t:0}); sc.lights.push({x:p.x, y:p.y-8, r:120, a:.9, warm:false, flick:.1, col:'portal'}); }
  }
  // fauna: goblins muy rápidos, diablillos de fuego y hombres rata
  const rar = far => { const roll = R(); return roll < .035 + far*.07 ? 'rare' : roll < .2 + far*.18 ? 'magic' : 'normal'; };
  const mkPack = (types, n, p) => {
    const far = clamp((Y1 - p.y)/(Y1 - Y0), 0, 1), pack = []; let hasRare = false;
    for(let k=0;k<n;k++){ let r = rar(far); if(r==='rare' && hasRare) r = 'magic'; if(r==='rare') hasRare = true; pack.push({type:pick2(types), rarity:r}); }
    sc.monsterSpawns.push({x:p.x, y:p.y, pack});
  };
  for(let i=0;i<14;i++){ const p = point(14, 320); if(p) mkPack(['goblin','goblin','goblinarcher'], 3 + Math.floor(R()*3), p); }
  for(let i=0;i<10;i++){ const p = point(14, 320); if(p) mkPack(['fireimp'], 2 + Math.floor(R()*2), p); }
  for(let i=0;i<11;i++){ const p = point(16, 320); if(p) mkPack(['ratman','ratman','goblin'], 2 + Math.floor(R()*3), p); }
  for(let i=0;i<7;i++){ const p = point(16, 600, -1500, -600); if(p) mkPack(['ratman','fireimp','goblinarcher','goblin'], 3 + Math.floor(R()*2), p); }
  return sc;
}

// ---------- mascotas de la mina (arte) ----------
Object.assign(PET_SHAPES, {
  zapa: {w:26, h:16, ax:13, ay:15, shapes(f){
    const fu=['#1e1a1c','#38303a','#564a56','#76687a'], L = legs(f,[8,15,10,17],11,16,fu.slice(0,3),'#d8c8b8',2.6);
    return [ {l:[4,10,1,12,2], c:fu.slice(0,3)}, ...L.far, {e:[12,10,9,5.4], c:fu, tex:501}, ...L.near, {e:[21,9,4.6,4], c:fu}, {e:[25,10,2.6,2], c:['#d09aa0','#f0b8c0']},
      {poly:[[22,12],[28,13],[24,15]], c:['#e8dcc8','#fff4e0']}, {p:[[22,8,'#101010'],[26,9,'#c07080'],[11,6,fu[3]],[15,6,fu[3]]]} ];
  }},
  murci: {w:26, h:18, ax:13, ay:17, fly:true, shapes(f){
    const fu=['#1a1624','#2e2640','#463a5e','#665a84'];
    const wing = f===1 ? {poly:[[12,9],[3,1],[5,7],[0,10],[11,13]], c:fu.slice(0,3)} : f===2 ? {poly:[[12,10],[3,17],[5,12],[0,10],[11,13]], c:fu.slice(0,3)} : {poly:[[12,9],[2,8],[4,12],[0,14],[11,13]], c:fu.slice(0,3)};
    return [ wing, {e:[13,11,5.6,4], c:fu, tex:502}, {e:[19,8,4,3.6], c:fu}, {poly:[[16,5],[17,0],[19,5]], c:fu.slice(1)}, {poly:[[20,5],[22,1],[23,6]], c:fu.slice(1)},
      {p:[[19,8,'#ff5a5a'],[21,8,'#ff5a5a'],[22,10,'#f4ecd8'],[20,11,'#f4ecd8'],[10,13,fu[3]]]} ];
  }},
  cuarzo: {w:24, h:16, ax:12, ay:15, shapes(f){
    const cr=['#1a3a5a','#2a6a9a','#58a8d8','#a8e0ff'], lg = [0,1,-1][f];
    const legsL = []; for(let i=0;i<3;i++){ const x = 7 + i*5; legsL.push({l:[x,10,x-2+(i%2?lg:-lg),15,1.2], c:'#1a2a3a'}, {l:[x+3,10,x+5+(i%2?-lg:lg),15,1.2], c:'#1a2a3a'}); }
    return [ ...legsL, {e:[12,9,9,5.6], c:cr, tex:503}, {poly:[[7,6],[10,1],[13,6]], c:cr.slice(1)}, {poly:[[12,6],[16,2],[18,7]], c:cr.slice(1)}, {e:[20,9,3.6,3.2], c:cr},
      {l:[22,6,24,2,1], c:'#a8e0ff'}, {l:[22,12,23,8,1.4], c:'#e8fcff'}, {p:[[21,8,'#fff8d0'],[22,8,'#101010'],[9,6,cr[3]],[14,8,cr[3]]]} ];
  }},
  brasita: {w:28, h:12, ax:14, ay:11, shapes(f){
    const lv=['#2a1008','#5a2410','#8a3a18','#c85a20'], L = legs(f,[8,12,18,22],7,12,lv.slice(0,3),'#1a0804',1.8);
    return [ {l:[6,7,0,9,3], c:lv.slice(0,3)}, ...L.far, {e:[14,7,10,3.6], c:lv, tex:504}, ...L.near, {e:[24,6,3.8,3], c:lv}, {l:[26,7,27+(f===2?2:0),8,1], c:'#ffd040'},
      {p:[[24,4,'#ffe040'],[25,4,'#101010'],[9,5,'#ff9a30'],[14,4,'#ff9a30'],[18,5,'#ff9a30'],[12,8,'#ffd040'],[4,8,'#ff9a30']]} ];
  }},
  engranaje: {w:20, h:22, ax:10, ay:21, shapes(f){
    const mt=['#4a4e58','#7a7e88','#a8acb8','#d0d4de'], sw = [0,2,-2][f];
    return [ {e:[7,10,4.6,4.6], c:['#8a5a2a','#c8843a','#e8a860']}, {p:[[7,4,'#c8843a'],[7,16,'#c8843a'],[1,10,'#c8843a'],[13,10,'#c8843a']]},
      {l:[8,15,7+sw,21,2.6], c:mt.slice(0,3)}, {l:[13,15,14-sw,21,2.6], c:mt.slice(0,3)}, {e:[11,11,5.4,5.6], c:mt, tex:505}, {l:[15,10,19,12-(f===2?4:0),2], c:mt.slice(0,3)}, {r:[17,6-(f===2?4:0),4,4], c:['#6a4a2a','#9a6a3a']},
      {e:[11,5,4,3.6], c:mt}, {r:[7,2,8,2], c:['#c8843a','#e8a860']}, {p:[[13,5,'#ffd040'],[14,5,'#ffd040'],[9,5,'#ffd040'],[11,10,'#c8843a'],[11,12,'#c8843a']]} ];
  }},
  canario: {w:18, h:16, ax:9, ay:15, fly:true, shapes(f){
    const yl=['#a08010','#d8b020','#f4d848','#fff090'];
    const wing = f===1 ? {poly:[[8,8],[2,1],[1,6],[7,11]], c:yl.slice(0,3)} : f===2 ? {poly:[[8,10],[2,15],[1,10],[7,12]], c:yl.slice(0,3)} : {poly:[[8,9],[1,8],[1,12],[7,12]], c:yl.slice(0,3)};
    return [ {poly:[[4,11],[0,13],[1,15],[5,13]], c:yl.slice(0,3)}, {e:[9,10,5.4,4], c:yl, tex:506}, {e:[13,6,3.6,3.4], c:yl}, {poly:[[15,6],[18,7],[15,8]], c:['#c85a10','#ff8a2a']}, wing,
      {e:[13,3,3.2,1.6], c:['#6c7079','#9aa0aa']}, {p:[[13,1,'#fffbd0'],[14,6,EYE],[11,13,'#e87820'],[9,14,'#e87820']]} ];
  }},
  geoda: {w:28, h:18, ax:14, ay:17, shapes(f){
    const pu=['#2a1a4a','#5a3a9a','#8a60d8','#c8a0ff'], gr=['#2a2a30','#4a4a54','#6a6a78'], L = legs(f,[8,19,10,21],12,18,gr,'#101014',3);
    return [ ...L.far, {e:[13,10,11,6], c:gr, tex:507}, ...L.near, {e:[13,8,10,6.4], c:pu, tex:508},
      {poly:[[7,5],[8,0],[11,4]], c:pu.slice(1)}, {poly:[[11,4],[14,-1+1],[16,4]], c:['#8a60d8','#c8a0ff','#f0e0ff']}, {poly:[[16,4],[19,0],[21,5]], c:pu.slice(1)},
      {e:[24,10,3.6,3.2], c:gr}, {p:[[25,9,'#ffe0a0'],[26,9,'#101010'],[10,7,pu[3]],[16,9,pu[3]]]} ];
  }},
  taladro: {w:36, h:14, ax:12, ay:13, shapes(f){
    const wm=['#4a3a38','#7a6258','#a88878','#d0b0a0'], pts = [];
    for(let i=0;i<10;i++){ const x = 4 + i*2.8, y = 8 + Math.sin(i*.8 + f*1.4)*2.2; pts.push({e:[x, y, 2.9 - i*.04, 2.8 - i*.04], c:wm, tex:509+i}); }
    const hy = 8 + Math.sin(9*.8 + f*1.4)*2.2;
    return [ ...pts, {e:[31,hy,3.4,3.2], c:wm}, {poly:[[33,hy-3],[39,hy],[33,hy+3]], c:['#6c7079','#9aa0aa','#d8dce4']}, {l:[34,hy-1,37,hy-1,1], c:'#e8ecf2'}, {l:[34,hy+1,37,hy+1,1], c:'#4a4d55'},
      {p:[[30,hy-1,'#ff5a3a'],[31,hy-1,'#ff5a3a'],[6,7,wm[3]],[12,8,wm[3]],[18,7,wm[3]]]} ];
  }},
  yunque: {w:38, h:24, ax:18, ay:23, shapes(f){
    const fu=['#0e0e12','#1e2026','#363840','#585c68'], ir=['#2a2e38','#4a4e58','#7a7e88'], lg = f===2 ? 2 : 0;
    const L = legs(f,[9,23,11,25],15,24,fu.slice(0,3),'#d8d8d0',3);
    return [ {l:[5,13,1,15,3], c:fu.slice(0,3)}, ...L.far, {e:[17,14,13,7.4], c:fu, tex:520}, {l:[8,10,28,10,5], c:ir}, {p:[[10,8,'#c8ccd4'],[16,7,'#c8ccd4'],[22,8,'#c8ccd4'],[27,9,'#c8ccd4']]}, ...L.near,
      {e:[30+lg,11,5.6,4.8], c:fu}, {r:[26+lg,6,8,2], c:['#e8e8e0','#ffffff']}, {e:[35+lg,13,2.6,2.2], c:['#2a2a30','#4a4a54']}, {poly:[[27+lg,5],[29+lg,1],[31+lg,5]], c:ir},
      {p:[[31+lg,10,'#ffd040'],[32+lg,10,'#101010'],[36+lg,13,'#d09090']]} ];
  }},
  eco: {w:38, h:28, ax:19, ay:27, fly:true, shapes(f){
    const fu=['#14182a','#242c4a','#3a4a7a','#5a78b0'], cy='#7affff';
    const wing = f===1 ? {poly:[[16,13],[5,1],[8,10],[1,14],[0,19],[15,20]], c:fu.slice(0,3)} : f===2 ? {poly:[[16,15],[5,27],[8,19],[1,17],[0,15],[15,20]], c:fu.slice(0,3)} : {poly:[[16,14],[3,12],[6,18],[0,20],[15,21]], c:fu.slice(0,3)};
    return [ wing, {e:[17,17,7.4,5.4], c:fu, tex:530}, {e:[25,12,5.4,4.8], c:fu}, {poly:[[20,7],[21,0],[24,7]], c:['#2a98b8','#7affff','#e0ffff']}, {poly:[[25,7],[28,1],[30,8]], c:['#2a98b8','#7affff','#e0ffff']},
      {poly:[[29,13],[35,14],[30,16]], c:fu.slice(1)}, {p:[[26,11,'#ff5a5a'],[28,11,'#ff5a5a'],[30,16,'#f4ecd8'],[32,15,'#f4ecd8'],[14,18,cy],[10,16,cy],[4,13,cy]]} ];
  }},
  fragua: {w:42, h:32, ax:20, ay:31, shapes(f){
    const ob=['#0a0810','#1c1a2a','#2e2c44','#4a4868'], lv='#ff7a1a', lg = f===2 ? 2 : 0;
    const L = legs(f,[12,25,14,27],21,32,ob.slice(0,3),'#ff9a30',3.4), op = f===2 ? 3 : 0;
    const wing = f===1 ? {poly:[[16,15],[8,3],[12,11],[5,14],[16,19]], c:ob.slice(0,3)} : {poly:[[16,16],[8,9],[12,15],[5,18],[16,21]], c:ob.slice(0,3)};
    return [ {l:[8,22,1,25,4], c:ob.slice(0,3)}, {l:[1,25,0,20,2.4], c:ob.slice(1)}, wing, ...L.far, {e:[18,21,12,7.4], c:ob, tex:540}, {e:[18,23,8,2.4], c:['#5a2a10','#c85a20','#ff9a30']}, ...L.near,
      {l:[26,16,30,9,4.6], c:ob}, {e:[32+lg,8,5.8,4.4], c:ob, tex:541}, {r:[34+lg,10+op,7,2], c:ob.slice(0,3)},
      {poly:[[28+lg,4],[27+lg,-1+1],[31+lg,3]], c:['#c85a20','#ff9a30']}, {poly:[[33+lg,3],[35+lg,0],[36+lg,5]], c:['#c85a20','#ff9a30']},
      ...(f===2 ? [{p:[[41,11,'#ffe070'],[40,12,'#ff9a30'],[41,13,'#ff5a1a'],[39,10,'#ffe070']]}] : []),
      {p:[[33+lg,7,'#ffe040'],[34+lg,7,'#ffe040'],[14,19,lv],[20,18,lv],[24,22,lv],[10,22,lv],[17,25,lv],[28,14,lv]]} ];
  }},
});
for(const id of ['zapa','murci','cuarzo','brasita','engranaje','canario','geoda','taladro','yunque','eco','fragua']){
  const dd = PET_SHAPES[id];
  PET_ART[id] = {fly:!!dd.fly, glow:dd.glow, fr:[0,1,2].map(f => SP(paintSprite(dd.w, dd.h, dd.shapes(f)), dd.ax, dd.ay))};
  PET_ART[id].flash = PET_ART[id].fr.map(s => {
    const c = document.createElement('canvas'); c.width = s.c.width; c.height = s.c.height;
    const g = c.getContext('2d'); g.drawImage(s.c,0,0); g.globalCompositeOperation='source-in'; g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height);
    return {c, ax:s.ax, ay:s.ay};
  });
}
PET_ART.fragua.glow = '#ff9a30'; PET_ART.eco.glow = '#7affff';
