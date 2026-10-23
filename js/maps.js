'use strict';
// =====================================================================
//  Mapas: guarida (cueva) y Expedición 1 – El pueblo abandonado
// =====================================================================
const CH = 128;          // tamaño de chunk de suelo
const WALL_H = 16;       // altura visual de los muros
const GRID = 64;         // celda de la rejilla de colisiones

function baseScene(id, name, x0, y0, x1, y1){
  return {id, name, x0, y0, x1, y1, chunks:new Map(), grid:new Map(),
          props:[], walls:[], decos:[], chests:[], cages:[], npcs:[], portals:[], lights:[], monsterSpawns:[],
          horse:null, stash:null, spawn:{x:0,y:0}};
}
// ---------- colisiones ----------
function addCollider(sc, c){
  const x0 = c.t==='c' ? c.x-c.r : c.x, y0 = c.t==='c' ? c.y-c.r : c.y;
  const x1 = c.t==='c' ? c.x+c.r : c.x+c.w, y1 = c.t==='c' ? c.y+c.r : c.y+c.h;
  for(let gx=Math.floor(x0/GRID); gx<=Math.floor(x1/GRID); gx++)
    for(let gy=Math.floor(y0/GRID); gy<=Math.floor(y1/GRID); gy++){
      const k = gx+','+gy; let a = sc.grid.get(k); if(!a) sc.grid.set(k, a=[]); a.push(c);
    }
  return c;
}
function removeCollider(sc, c){ for(const a of sc.grid.values()){ const i=a.indexOf(c); if(i>=0) a.splice(i,1); } }
let JUMP_IGNORE = false;      // mientras el héroe salta ignora los obstáculos bajos
function blocked(sc, x, y, r){
  if(x-r < sc.x0 || x+r > sc.x1 || y-r < sc.y0 || y+r > sc.y1) return true;
  if(sc.solidAt){
    if(sc.solidAt(x,y)) return true;
    for(let i=0;i<8;i++){ const a=i*Math.PI/4; if(sc.solidAt(x+Math.cos(a)*r, y+Math.sin(a)*r)) return true; }
  }
  if(sc.waterAt){   // agua: bloquea el paso pero no la vista (a diferencia de solidAt)
    if(sc.waterAt(x,y)) return true;
    for(let i=0;i<8;i++){ const a=i*Math.PI/4; if(sc.waterAt(x+Math.cos(a)*r, y+Math.sin(a)*r)) return true; }
  }
  const seen = new Set();
  for(let gx=Math.floor((x-r)/GRID); gx<=Math.floor((x+r)/GRID); gx++)
    for(let gy=Math.floor((y-r)/GRID); gy<=Math.floor((y+r)/GRID); gy++){
      const a = sc.grid.get(gx+','+gy); if(!a) continue;
      for(const c of a){
        if(seen.has(c)) continue; seen.add(c);
        if(c.low && JUMP_IGNORE) continue;
        if(c.t==='c'){ if(Math.hypot(x-c.x, y-c.y) < r + c.r) return true; }
        else { const px = clamp(x, c.x, c.x+c.w), py = clamp(y, c.y, c.y+c.h); if(Math.hypot(x-px, y-py) < r) return true; }
      }
    }
  return false;
}
// ¿hay un muro en este punto? (muros de casas, criptas y roca de la cueva)
function wallAt(sc, x, y){
  if(sc.solidAt && sc.solidAt(x,y)) return true;
  const a = sc.grid.get(Math.floor(x/GRID)+','+Math.floor(y/GRID)); if(!a) return false;
  for(const c of a) if(c.wall && x >= c.x && x <= c.x+c.w && y >= c.y && y <= c.y+c.h) return true;
  return false;
}
// línea de visión entre dos puntos: los ataques no atraviesan muros
function los(sc, x0, y0, x1, y1){
  const n = Math.ceil(Math.hypot(x1-x0, y1-y0)/3);
  for(let i=1;i<n;i++) if(wallAt(sc, x0+(x1-x0)*i/n, y0+(y1-y0)*i/n)) return false;
  return true;
}
// mueve un círculo deslizándose por las paredes, en pasos cortos para no atravesarlas
function moveCircle(sc, a, dx, dy){
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy))/4));
  let hit = false;
  // si ya empieza solapado con algo, se le deja moverse libremente para que pueda salir
  if(blocked(sc, a.x, a.y, a.r) && !blocked(sc, a.x, a.y, 1)){ a.x += dx; a.y += dy; return false; }
  for(let i=0;i<n;i++){
    const sx = dx/n, sy = dy/n;
    if(!blocked(sc, a.x+sx, a.y, a.r)) a.x += sx; else hit = true;
    if(!blocked(sc, a.x, a.y+sy, a.r)) a.y += sy; else hit = true;
  }
  return hit;
}

// ---------- suelo por chunks ----------
function groundChunk(sc, cx, cy){
  const key = cx+','+cy; let c = sc.chunks.get(key); if(c) return c;
  c = document.createElement('canvas'); c.width = c.height = CH;
  const g = c.getContext('2d'), id = g.createImageData(CH,CH), a = id.data;
  for(let j=0;j<CH;j++) for(let i=0;i<CH;i++){
    const col = sc.ground(cx*CH+i, cy*CH+j), o = (j*CH+i)*4;
    a[o]=col[0]; a[o+1]=col[1]; a[o+2]=col[2]; a[o+3]=255;
  }
  g.putImageData(id,0,0); sc.chunks.set(key,c); return c;
}
const GRASS = ['#1f221a','#25291f','#2c3025','#33382b'].map(hex);
const DIRT = ['#2f2821','#372f27','#40372d'].map(hex), DIRT_EDGE = hex('#221c17'), PEB = ['#5a5046','#16120e'].map(hex);
const PLANK = ['#22180f','#2c2015','#36281b','#403022'].map(hex), SEAM = hex('#120c08');
const COBBLE = ['#262628','#2e2e31','#37373a','#404044'].map(hex), MORTAR = hex('#141416');
function grassPx(x,y){
  let t = tq((vnoise(x/16,y/16,3)*.55 + vnoise(x/5,y/5,4)*.3 + hash(x,y,8)*.15 - .2)/.6, x, y, 4);
  if(hash(x,y,9)>.985) t=3; else if(hash(x,y-1,9)>.985) t=0;
  return GRASS[t];
}
function dirtPx(x,y){
  if(hash(x,y,7)>.993) return PEB[0];
  if(hash(x,y-1,7)>.993) return PEB[1];
  return DIRT[tq((vnoise(x/6,y/6,5)*.6+hash(x,y,6)*.4-.2)/.6, x, y, 3)];
}

// ---------- props ----------
// cada prop: {x, y (clave de orden), draw()} y opcionalmente un collider
function addProp(sc, p, col){ sc.props.push(p); if(col) p.col = addCollider(sc, col); return p; }
const LOW_SPRITES = new Set();   // sprites de props pequeños que se pueden saltar (se rellena al cargar)
for(const s of [ART.barrel, ART.crate, ART.fenceV, ART.hay, ART.dirtPile, ART.candles, ART.skullpile, ART.fenceIron, ART.bones, ART.coffin, ART.campfire, ART.pew, ART.brazier, ...ART.fenceH, ...ART.grave, ...ART.tombs.slice(0,4)]) if(s) LOW_SPRITES.add(s);
function propTree(sc, x, y, seed, dead=false){
  const s = bakeTree(seed, dead);
  return addProp(sc, {x, y, draw(){
    pshadow(x+4, y, 20, 5);
    if(s.canopy){
      b.drawImage(s.trunk, x-6, y-25);
      const sway = Math.round(Math.sin(G.t*1.2 + x*.01)*1.2);
      b.drawImage(s.canopy, x-(s.canopy.width>>1)+sway, y-18-s.canopy.height);
    } else b.drawImage(s.branches, x-19, y-31);
  }}, {t:'c', x, y, r:9});
}
function propRock(sc, x, y, seed){
  const R2 = rng(seed), r = 9+R2()*9, pts = [];
  for(let j=0;j<7;j++){ const a=j/7*Math.PI*2; pts.push([Math.cos(a)*r*(.8+R2()*.25), Math.sin(a)*r*.6*(.8+R2()*.25)]); }
  const img = bakeRock(seed, r, pts);
  return addProp(sc, {x, y, draw(){ pshadow(x+2, y, Math.round(r*1.1), Math.round(r*.35)); b.drawImage(img, x-(img.width>>1), y-img.height+3); }},
                 {t:'c', x, y, r:r*.8, low: r < 13});
}
function propBush(sc, x, y, seed){
  const img = bakeBush(seed);
  return addProp(sc, {x, y, draw(){ pshadow(x+1, y, 12, 3); b.drawImage(img, x-(img.width>>1), y-img.height+2); }}, {t:'c', x, y, r:8, low:true});
}
function propSprite(sc, s, x, y, col, shadow){
  if(col && LOW_SPRITES.has(s)) col.low = true;
  return addProp(sc, {x, y, draw(){ if(shadow) pshadow(x, y, shadow[0], shadow[1]); drawSP(s, x, y); }}, col);
}
function propGlowshroom(sc, x, y){
  sc.lights.push({x, y:y-3, r:34, a:.55, warm:false, flick:.15});
  return addProp(sc, {x, y, draw(){
    const p = [[0,0],[3,1],[-3,1]];
    for(const [dx,dy] of p){
      b.fillStyle='#8ad8d0'; b.fillRect(x+dx, y+dy-3, 1, 3);
      b.fillStyle='#4ac0d0'; b.fillRect(x+dx-1, y+dy-4, 3, 1);
      b.fillStyle='#b8fff4'; b.fillRect(x+dx, y+dy-5, 1, 1);
    }
  }});
}
// muros en 3/4: cara superior + cara frontal con ladrillo o tablas
function bakeWall(w, h, mat, seed){
  const top = mat==='wood' ? ['#3a2a1c','#46331f','#523c26'] : mat==='crypt' ? ['#2e302e','#383a37','#42443f'] : ['#3a3734','#45413d','#504b46'];
  const front = mat==='wood' ? ['#1e150d','#281c12','#322318'] : mat==='crypt' ? ['#171918','#202321','#292c29'] : ['#1f1c1a','#2a2522','#35302b'];
  return pixBake(w, h+WALL_H, (x,y)=>{
    const wx = x, wy = y;
    if(y < h){ // cara superior
      const n = vnoise(x/3,y/3,seed)*.6 + hash(x,y,seed)*.4;
      return top[tq(n,x,y,3)];
    }
    const fy = y-h, shadeDown = fy/WALL_H*.35;
    if(mat==='wood'){
      const plank = Math.floor((wx + hash(Math.floor(wx/7),0,seed)*3)/7);
      if((wx + (plank&1)) % 7 === 0) return '#0e0a06';
      const n = .6 - shadeDown + (hash(plank,Math.floor(fy/3),seed)-.5)*.3;
      return front[tq(n,x,y,3)];
    }
    const row = Math.floor(fy/4), off = (row&1)*4;
    if(fy%4===0 || (wx+off)%8===0) return '#121010';
    if(mat==='crypt' && hash(wx, fy, seed+5) > (fy > WALL_H-6 ? .8 : .95)) return hash(wx,fy,seed+6) > .5 ? '#2e3e26' : '#22301e';  // musgo
    const n = .62 - shadeDown + (hash(Math.floor((wx+off)/8),row,seed)-.5)*.4;
    return front[tq(n,x,y,3)];
  });
}
function addWall(sc, x, y, w, h, mat, seed){
  const img = bakeWall(w, h, mat, seed);
  sc.walls.push({x, y, w, h});
  addCollider(sc, {t:'r', x, y, w, h, wall:true});
  sc.props.push({x, y:y+h, w, h, draw(){ b.drawImage(img, x-1, y-WALL_H-1); }});
}

// =====================================================================
//  Guarida
// =====================================================================
function buildDen(){
  const sc = baseScene('den', 'La guarida', -340, -235, 340, 235);
  sc.kind = 'den'; sc.darkness = .8;
  const caveF = (x,y) => (x/305)**2 + (y/200)**2 + (vnoise(x/45,y/45,77)-.5)*.45;
  sc.solidAt = (x,y) => caveF(x,y) > 1;
  const ROCK = ['#141212','#1b1817','#221f1d','#2a2624'].map(hex), RIM = hex('#3c3631');
  const FLOOR = ['#28241f','#2f2a25','#36302a','#3d3630'].map(hex);
  sc.ground = (x,y) => {
    const f = caveF(x,y);
    if(f > 1){
      if(f < 1.035) return RIM;
      return ROCK[tq((vnoise(x/7,y/7,81)*.6+hash(x,y,82)*.4-.15)/.7, x, y, 4)];
    }
    if(hash(x,y,83)>.992) return PEB[0];
    let t = tq((vnoise(x/10,y/10,84)*.6+hash(x,y,85)*.4-.2)/.6, x, y, 4);
    if(f > .9) t = Math.max(0, t-1);
    return FLOOR[t];
  };
  sc.spawn = {x:0, y:95};
  // hoguera central
  const fire = propSprite(sc, ART.campfire, 0, 15, {t:'c', x:0, y:12, r:12});
  fire.draw = function(){ drawSP(ART.campfire, 0, 15); drawFlames(0, 8, 1); };
  sc.lights.push({x:0, y:5, r:260, a:1, warm:true, flick:.08});
  // Juan y su caballo
  sc.npcs.push({id:'juan', name:'Juan, el sabio', x:-95, y:-45, dir:1});
  addCollider(sc, {t:'c', x:-95, y:-47, r:9});
  sc.horse = {x:110, y:-55, dir:-1};
  addCollider(sc, {t:'r', x:86, y:-62, w:46, h:12});
  propSprite(sc, ART.hay, 160, -35, {t:'c', x:160, y:-38, r:9}, [10,3]);
  // Trapis, el mercader (tras volver con vida de la primera expedición)
  if(G.save.trapis){
    sc.npcs.push({id:'trapis', name:'Trapis', x:-135, y:120, dir:1});
    addCollider(sc, {t:'c', x:-135, y:118, r:9});
    propSprite(sc, ART.stall, -84, 124, {t:'r', x:-106, y:114, w:44, h:10}, [22,3]);
    sc.lights.push({x:-100, y:105, r:120, a:.6, warm:true, flick:.05});
  }
  // el druida (tras rescatar la primera mascota)
  if(G.save.druid){
    sc.npcs.push({id:'druid', name:'Chemma', x:150, y:122, dir:-1});
    addCollider(sc, {t:'c', x:150, y:120, r:9});
    const cd = propSprite(sc, ART.cauldron, 108, 128, {t:'c', x:108, y:124, r:11}, [13,3]);
    cd.draw = function(){
      pshadow(108, 128, 13, 3); drawSP(ART.cauldron, 108, 128);
      if(Math.random() < .25) G.parts.push({x:108+rand(-6,6), y:120, vx:rand(-4,4), vy:-18, life:.7, max:.7, size:rand(1,2), col:pick(['#8ae89a','#3aa04a','#d8ffd8'])});
    };
    sc.lights.push({x:108, y:118, r:110, a:.65, warm:false, flick:.12});
  }
  // Gonzalo el profesor (tras subir de nivel por primera vez)
  if(G.save.gonzalo){
    sc.npcs.push({id:'gonzalo', name:'Gonzalo', x:30, y:-125, dir:1});
    addCollider(sc, {t:'c', x:30, y:-127, r:9});
    propSprite(sc, ART.lectern, 62, -118, {t:'r', x:55, y:-124, w:14, h:6}, [9,3]);
    propSprite(sc, ART.bookshelf, -10, -150, {t:'r', x:-25, y:-158, w:30, h:8});
    sc.lights.push({x:45, y:-130, r:100, a:.6, warm:true, flick:.06});
  }
  // Uakala, el herrero orco (cuando lo acepta en la guarida): fragua y yunque
  if(G.save.uakalaHome){
    sc.npcs.push({id:'uakala', name:'Uakala', x:-178, y:-12, dir:1});
    addCollider(sc, {t:'c', x:-178, y:-14, r:9});
    propSprite(sc, ART.anvil, -148, -6, {t:'c', x:-148, y:-8, r:8}, [14,3]);
    const fg = propSprite(sc, ART.campfire, -208, -14, {t:'c', x:-208, y:-17, r:9});
    fg.draw = function(){ drawSP(ART.campfire, -208, -14); drawFlames(-208, -21, .7); };
    sc.lights.push({x:-208, y:-24, r:125, a:.7, warm:true, flick:.1});
  }
  // Aish, el elfo de luz (cuando lo acepta en la guarida): su farol ilumina un rincón con luz blanca
  if(G.save.aishHome){
    sc.npcs.push({id:'aish', name:'Aish', x:215, y:-35, dir:-1});
    addCollider(sc, {t:'c', x:215, y:-37, r:9});
    sc.lights.push({x:215, y:-52, r:150, a:.9, warm:true, flick:.05});
  }
  // Alexandra, la nórdica jugona (cuando la invitas a la guarida): su mesa de ruleta
  if(G.save.alexandraHome){
    sc.npcs.push({id:'alexandra', name:'Alexandra', x:0, y:135, dir:1});
    addCollider(sc, {t:'c', x:0, y:133, r:9});
    propSprite(sc, ART.rltable, 38, 140, {t:'r', x:20, y:130, w:36, h:10}, [22,4]);
    sc.lights.push({x:20, y:112, r:130, a:.7, warm:true, flick:.08});
  }
  // alijo (cofre de la guarida)
  sc.stash = {x:-200, y:35};
  if(G.save.petCage){   // jaula grande (comprada a Chemma): junto al alijo, se abre con F
    sc.bigCage = {x:-242, y:40};
    propSprite(sc, ART.bigcage, -242, 40, {t:'r', x:-256, y:33, w:28, h:8}, [16,3]);
    sc.lights.push({x:-242, y:20, r:70, a:.5, warm:true, flick:.08});
  }
  addCollider(sc, {t:'c', x:-200, y:32, r:10});
  // cama y decoración
  propSprite(sc, ART.bed, 205, 75, {t:'r', x:193, y:63, w:24, h:12});
  propSprite(sc, ART.barrel, -240, -40, {t:'c', x:-240, y:-42, r:6}, [6,2]);
  propSprite(sc, ART.barrel, -228, -55, {t:'c', x:-228, y:-57, r:6}, [6,2]);
  propSprite(sc, ART.crate, -190, -95, {t:'r', x:-197, y:-104, w:15, h:10}, [8,2]);
  propSprite(sc, ART.crate, 230, -10, {t:'r', x:223, y:-19, w:15, h:10}, [8,2]);
  for(const [x,y] of [[-150,-150],[150,-150],[-260,90],[262,40]]){
    const t = propSprite(sc, ART.torch, x, y, {t:'c', x, y:y-2, r:4});
    t.draw = function(){ drawSP(ART.torch, x, y); drawFlames(x, y-11, .4); };
    sc.lights.push({x, y:y-12, r:110, a:.8, warm:true, flick:.12});
  }
  for(let i=0;i<10;i++){
    const a = i/10*Math.PI*2, x = Math.cos(a)*250, y = Math.sin(a)*160;
    if(!sc.solidAt(x,y) && Math.hypot(x,y) > 120) propGlowshroom(sc, Math.round(x), Math.round(y));
  }
  return sc;
}
// llamas animadas (hoguera y antorchas)
function drawFlames(x, y, s){
  const n = Math.round(10*s)+3, cols = ['#ff5a1a','#ff8a2a','#ffc04a','#fff0a0'];
  for(let i=0;i<n;i++){
    const t = (G.t*2.2 + i*.37) % 1, ox = Math.sin(i*12.9 + G.t*3)*5*s*(1-t);
    const px = Math.round(x + ox), py = Math.round(y - t*14*s);
    b.fillStyle = cols[Math.min(3, Math.floor((1-t)*3.2 + (i%2)))];
    const sz = t < .4 ? 2 : 1; b.fillRect(px, py, sz, sz);
  }
}

// =====================================================================
//  Expedición 1 – El pueblo abandonado (generado en cada expedición)
// =====================================================================
function buildVillage(seed){
  const R = rng(seed), rr = (a,c) => a + R()*(c-a);
  const S = 1250, sc = baseScene('village', 'El pueblo abandonado', -S, -S, S, S);
  sc.kind = 'raid'; sc.darkness = .95; sc.seed = seed;
  sc.spawn = {x:0, y:S-170};
  sc.horse = {x:-34, y:S-150, dir:1};
  addCollider(sc, {t:'r', x:-58, y:S-157, w:46, h:12});

  // caminos: avenida principal, calle transversal y calles secundarias
  const roads = [];
  const road = (x0,y0,x1,y1,w) => roads.push({x0,y0,x1,y1,w});
  road(0, S, 0, -S+120, 44); road(-S+80, 0, S-80, 0, 40);
  road(-S+200, -520, S-200, -560, 32); road(-S+160, 560, S-180, 520, 32);
  road(-620, -S+200, -580, S-200, 30); road(600, -S+160, 640, S-220, 30);
  const roadDist = (x,y) => {
    let best = 1e9;
    for(const r of roads){
      const dx=r.x1-r.x0, dy=r.y1-r.y0, t=clamp(((x-r.x0)*dx+(y-r.y0)*dy)/(dx*dx+dy*dy),0,1);
      best = Math.min(best, Math.hypot(x-r.x0-dx*t, y-r.y0-dy*t) - r.w/2);
    }
    return best;
  };
  const floors = [];
  const plaza = {x:0, y:0, r:110};
  sc.ground = (x,y) => {
    if(Math.abs(x)>S || Math.abs(y)>S) return GRASS[0];
    for(const f of floors) if(x>=f.x && x<f.x+f.w && y>=f.y && y<f.y+f.h){
      const fy = y-f.y, row = Math.floor(fy/6);
      if(fy%6===0) return SEAM;
      const off = Math.floor(hash(row,f.id,91)*30);
      if((x-f.x+off)%30===0) return SEAM;
      if(hash(x,y,92)>.995) return PLANK[0];
      return PLANK[tq(.25 + hash(row, Math.floor((x-f.x+off)/30), 93)*.45 + vnoise(x/8,y/2,94)*.25, x, y, 4)];
    }
    const pd = Math.hypot(x-plaza.x, y-plaza.y) + (vnoise(x/20,y/20,95)-.5)*30;
    if(pd < plaza.r){
      const cx = Math.floor((x + (Math.floor(y/6)&1)*3)/6), cy = Math.floor(y/6);
      const lx = (x + (Math.floor(y/6)&1)*3) % 6, ly = y % 6;
      if(lx===0 || ly===0) return MORTAR;
      return COBBLE[tq(hash(cx,cy,96)*.7 + (ly<2?.25:0), x, y, 4)];
    }
    const rd = roadDist(x,y) + (vnoise(x/25,y/25,97)-.5)*14 + dith(x,y)*2;
    if(rd < 0) return rd > -2 ? DIRT_EDGE : dirtPx(x,y);
    return grassPx(x,y);
  };

  // ---- casas en ruinas ----
  const houses = [];
  const overlapsHouse = (x,y,w,h,m) => houses.some(o => x < o.x+o.w+m && x+w+m > o.x && y < o.y+o.h+m && y+h+m > o.y);
  const nearRoad = (x,y,w,h) => {
    for(let i=0;i<=4;i++) for(let j=0;j<=4;j++) if(roadDist(x+w*i/4, y+h*j/4) < 14) return true;
    return false;
  };
  for(let tries=0; tries<500 && houses.length<15; tries++){
    const w = Math.round(rr(130,200)/2)*2, h = Math.round(rr(100,150)/2)*2;
    const x = Math.round(rr(-S+70, S-70-w)), y = Math.round(rr(-S+70, S-70-h));
    if(Math.hypot(x+w/2-sc.spawn.x, y+h/2-sc.spawn.y) < 330) continue;
    if(Math.hypot(x+w/2, y+h/2) < plaza.r+110) continue;
    if(overlapsHouse(x,y,w,h,60) || nearRoad(x,y,w,h)) continue;
    houses.push({x, y, w, h, id:houses.length, mat: R()<.5 ? 'stone' : 'wood'});
  }
  const T = 10;
  for(const hs of houses){
    floors.push({x:hs.x+T, y:hs.y+T, w:hs.w-2*T, h:hs.h-2*T, id:hs.id});
    // puerta hacia el camino más cercano + boquetes aleatorios
    const sides = ['top','bottom','left','right'];
    const doorSide = sides.reduce((best,s) => {
      const p = s==='top' ? [hs.x+hs.w/2, hs.y-30] : s==='bottom' ? [hs.x+hs.w/2, hs.y+hs.h+30] : s==='left' ? [hs.x-30, hs.y+hs.h/2] : [hs.x+hs.w+30, hs.y+hs.h/2];
      const d = roadDist(p[0], p[1]); return d < best.d ? {s, d} : best;
    }, {s:'bottom', d:1e9}).s;
    const gaps = {top:[], bottom:[], left:[], right:[]};
    const len = s => (s==='top'||s==='bottom') ? hs.w : hs.h;
    gaps[doorSide].push([len(doorSide)/2-17, 34]);
    const holes = Math.floor(R()*3);
    for(let i=0;i<holes;i++){ const s = sides[Math.floor(R()*4)]; const L = len(s); const gw = rr(20,40); gaps[s].push([rr(T+6, L-T-gw-6), gw]); }
    for(const s of sides){
      const L = len(s), gs = gaps[s].sort((a,c)=>a[0]-c[0]);
      let pos = 0; const segs = [];
      for(const [g0,gw] of gs){ if(g0 > pos) segs.push([pos, g0]); pos = Math.max(pos, g0+gw); }
      if(pos < L) segs.push([pos, L]);
      for(const [a0,a1] of segs){
        const l = Math.round(a1-a0); if(l < 6) continue;
        const a = Math.round(a0), sd = hs.id*13+a;
        if(s==='top') addWall(sc, hs.x+a, hs.y, l, T, hs.mat, sd);
        if(s==='bottom') addWall(sc, hs.x+a, hs.y+hs.h-T, l, T, hs.mat, sd);
        if(s==='left') addWall(sc, hs.x, hs.y+a, T, l, hs.mat, sd);
        if(s==='right') addWall(sc, hs.x+hs.w-T, hs.y+a, T, l, hs.mat, sd);
      }
    }
    // muebles abandonados en las esquinas
    const corners = [[hs.x+T+10, hs.y+T+14], [hs.x+hs.w-T-10, hs.y+T+14], [hs.x+T+10, hs.y+hs.h-T-8], [hs.x+hs.w-T-10, hs.y+hs.h-T-8]];
    for(const [cx,cy] of corners){
      const k = R();
      if(k < .3) propSprite(sc, ART.barrel, cx, cy, {t:'c', x:cx, y:cy-2, r:6}, [6,2]);
      else if(k < .55) propSprite(sc, ART.crate, cx, cy, {t:'r', x:cx-7, y:cy-9, w:15, h:10}, [8,2]);
      else if(k < .65) propSprite(sc, ART.hay, cx, cy, {t:'c', x:cx, y:cy-3, r:9}, [10,3]);
    }
  }
  sc.houses = houses;
  const inHouse = (x,y,m=0) => houses.find(h => x > h.x-m && x < h.x+h.w+m && y > h.y-m && y < h.y+h.h+m);
  const free = (x,y,r,allowHouse=false) => {
    if(Math.abs(x) > S-60 || Math.abs(y) > S-60) return false;
    if(!allowHouse && inHouse(x,y,r+12)) return false;
    if(Math.hypot(x-sc.spawn.x, y-sc.spawn.y) < 110) return false;
    if(Math.hypot(x-sc.horse.x, y-sc.horse.y) < 50) return false;
    return !blocked(sc, x, y, r+6);
  };
  const interiorPoint = (hs, r) => {
    for(let i=0;i<30;i++){
      const x = Math.round(rr(hs.x+T+r+8, hs.x+hs.w-T-r-8)), y = Math.round(rr(hs.y+T+r+14, hs.y+hs.h-T-r-6));
      if(!blocked(sc, x, y, r+4)) return {x, y};
    }
    return null;
  };
  const outdoorPoint = (r, minSpawn=0, roadOk=false) => {
    for(let i=0;i<200;i++){
      const x = Math.round(rr(-S+80, S-80)), y = Math.round(rr(-S+80, S-80));
      if(Math.hypot(x-sc.spawn.x, y-sc.spawn.y) < minSpawn) continue;
      if(!roadOk && roadDist(x,y) < 16) continue;
      if(Math.hypot(x, y) < plaza.r+20) continue;
      if(free(x,y,r)) return {x, y};
    }
    return null;
  };

  // ---- plaza: pozo y bancos de piedra ----
  propSprite(sc, ART.well, 0, 12, {t:'c', x:0, y:6, r:15}, [15,4]);
  // ---- cementerio ----
  const gy = outdoorPoint(60, 500);
  if(gy) for(let i=0;i<9;i++){
    const x = gy.x + (i%3-1)*26 + Math.round(rr(-3,3)), y = gy.y + (Math.floor(i/3)-1)*24;
    if(free(x,y,6)) propSprite(sc, ART.grave[i%2], x, y, {t:'c', x, y:y-2, r:5}, [6,2]);
  }
  // ---- vallas junto a algunos caminos ----
  for(let i=0;i<10;i++){
    const r0 = roads[Math.floor(R()*roads.length)], t0 = rr(.1,.8), horiz = Math.abs(r0.x1-r0.x0) > Math.abs(r0.y1-r0.y0);
    const side = R()<.5 ? -1 : 1, n = Math.floor(rr(5,11));
    for(let k=0;k<n;k++){
      const t = t0 + k*(horiz ? 18 : 14)/Math.hypot(r0.x1-r0.x0, r0.y1-r0.y0);
      if(t > 1 || R() < .15) continue;
      let x = Math.round(r0.x0+(r0.x1-r0.x0)*t), y = Math.round(r0.y0+(r0.y1-r0.y0)*t);
      if(horiz) y += side*(r0.w/2+12); else x += side*(r0.w/2+12);
      if(!free(x,y,4) || inHouse(x,y,16)) continue;
      if(horiz) propSprite(sc, ART.fenceH[Math.floor(R()*3)], x, y, {t:'r', x:x-9, y:y-3, w:18, h:4});
      else propSprite(sc, ART.fenceV, x, y, {t:'r', x:x-2, y:y-3, w:4, h:4});
    }
  }
  // ---- vegetación ----
  let sd = seed*7;
  for(let i=0;i<70;i++){ const p = outdoorPoint(12, 140); if(p) propTree(sc, p.x, p.y, ++sd); }
  for(let i=0;i<34;i++){ const p = outdoorPoint(12, 140); if(p) propRock(sc, p.x, p.y, ++sd); }
  for(let i=0;i<40;i++){ const p = outdoorPoint(9, 120); if(p) propBush(sc, p.x, p.y, ++sd); }
  for(let i=0;i<24;i++){ const p = outdoorPoint(5, 300); if(p) propGlowshroom(sc, p.x, p.y); }
  for(let i=0;i<14;i++){
    const p = outdoorPoint(8, 200); if(!p) continue;
    if(R()<.5) propSprite(sc, ART.barrel, p.x, p.y, {t:'c', x:p.x, y:p.y-2, r:6}, [6,2]);
    else propSprite(sc, ART.crate, p.x, p.y, {t:'r', x:p.x-7, y:p.y-9, w:15, h:10}, [8,2]);
  }
  // decoración del suelo
  for(let i=0;i<1600;i++){
    const x = Math.round(rr(-S, S)), y = Math.round(rr(-S, S));
    if(roadDist(x,y) < 4 || inHouse(x,y,2) || Math.hypot(x,y) < plaza.r) continue;
    sc.decos.push({x, y, k: R()<.85 ? 'tuft' : 'flower', v: Math.floor(R()*3)});
  }

  // ---- jaulas con las 11 mascotas ----
  const petOrder = shuffle(petsOfExp(1).filter(id => R() < CAGE_CHANCE[PETS[id].rarity]), R);
  const housePool = shuffle(houses.slice(), R);
  const cagePts = [];
  const farFromCages = p => cagePts.every(c => Math.hypot(c.x-p.x, c.y-p.y) > 220);
  for(const id of petOrder){
    let p = null;
    if(cagePts.length < 5 && housePool.length){
      const hs = housePool.shift(); p = interiorPoint(hs, 13);
    }
    for(let i=0; !p || (i<40 && !farFromCages(p)); i++){ p = outdoorPoint(14, 380); if(!p) break; if(farFromCages(p)) break; }
    if(!p) continue;
    cagePts.push(p);
    const cage = {x:p.x, y:p.y, pet:null, open:false};
    cage.col = addCollider(sc, {t:'r', x:p.x-12, y:p.y-8, w:24, h:8});
    sc.cages.push(cage);
  }
  // ---- cofres ----
  const addChest = (p, rare) => {
    if(!p) return;
    const ch = {x:p.x, y:p.y, rare, open:false};
    ch.col = addCollider(sc, {t:'r', x:p.x-9, y:p.y-8, w:18, h:8});
    sc.chests.push(ch);
  };
  for(const hs of houses){ const n = R()<.6 ? 1 : 2; for(let i=0;i<n;i++) addChest(interiorPoint(hs, 10), false); }
  for(let i=0;i<4;i++) addChest(outdoorPoint(10, 300), false);
  const rareHouses = shuffle(houses.slice(), R).slice(0,2);
  for(const hs of rareHouses) addChest(interiorPoint(hs, 10), true);
  for(let i=0;i<2;i++) addChest(outdoorPoint(10, 900), true);

  // ---- dos portales de vuelta a casa, lejos de la salida ----
  for(const sx of [-1, 1]){
    let p = null;
    for(let i=0;i<300 && !p;i++){
      const x = Math.round(sx*rr(500, S-120)), y = Math.round(rr(-S+120, -300));
      if(free(x,y,22)) p = {x, y};
    }
    if(p){ sc.portals.push({x:p.x, y:p.y, t:0}); sc.lights.push({x:p.x, y:p.y-8, r:120, a:.9, warm:false, flick:.1, col:'portal'}); }
  }

  // ---- grupos de monstruos ----
  for(let i=0;i<30;i++){
    const p = outdoorPoint(16, 420, true); if(!p) continue;
    const far = clamp(Math.hypot(p.x-sc.spawn.x, p.y-sc.spawn.y)/2200, 0, 1);
    const n = 2 + Math.floor(R()*2.3), pack = [];
    let hasRare = false;
    for(let k=0;k<n;k++){
      const roll = R();
      let rar = roll < .015 + far*.04 ? 'rare' : roll < .14 + far*.12 ? 'magic' : 'normal';
      if(rar==='rare' && hasRare) rar = 'magic';
      if(rar==='rare') hasRare = true;
      pack.push({type: R() < .3 ? 'bigslime' : 'slime', rarity: rar});
    }
    sc.monsterSpawns.push({x:p.x, y:p.y, pack});
  }
  // un par de grupos dentro de casas
  for(const hs of shuffle(houses.slice(), R).slice(0,5)){
    const p = interiorPoint(hs, 12);
    if(p) sc.monsterSpawns.push({x:p.x, y:p.y, pack:[{type:'slime', rarity: R()<.3 ? 'magic' : 'normal'}, {type:'slime', rarity:'normal'}]});
  }
  return sc;
}

// =====================================================================
//  Expedición 2 – El cementerio (generado en cada expedición)
// =====================================================================
const C_GRASS = ['#1a1d19','#1f221d','#242822','#2a2e27'].map(hex);
const GRAVEL = ['#2a2a2a','#323231','#3a3a38','#444441'].map(hex);
function buildCemetery(seed){
  const R = rng(seed), rr = (a,c) => a + R()*(c-a);
  const S = 1200, sc = baseScene('cemetery', 'El cementerio', -S, -S, S, S);
  sc.kind = 'raid'; sc.darkness = .96; sc.seed = seed; sc.lvl = 2;
  sc.spawn = {x:0, y:S-170};
  sc.horse = {x:-34, y:S-150, dir:1};
  addCollider(sc, {t:'r', x:-58, y:S-157, w:46, h:12});

  // senderos de grava
  const paths = [];
  const path = (x0,y0,x1,y1,w) => paths.push({x0,y0,x1,y1,w});
  path(0, S, 0, -S+330, 40);
  path(-S+120, 280, S-120, 260, 30); path(-S+160, -330, S-160, -300, 30);
  path(-560, -S+200, -600, S-220, 24); path(560, -S+200, 600, S-220, 24);
  const pathDist = (x,y) => {
    let best = 1e9;
    for(const r of paths){
      const dx=r.x1-r.x0, dy=r.y1-r.y0, t=clamp(((x-r.x0)*dx+(y-r.y0)*dy)/(dx*dx+dy*dy),0,1);
      best = Math.min(best, Math.hypot(x-r.x0-dx*t, y-r.y0-dy*t) - r.w/2);
    }
    return best;
  };
  const floors = [];
  sc.ground = (x,y) => {
    if(Math.abs(x)>S || Math.abs(y)>S) return C_GRASS[0];
    for(const f of floors) if(x>=f.x && x<f.x+f.w && y>=f.y && y<f.y+f.h){
      const cx = Math.floor((x + (Math.floor(y/8)&1)*4)/8), cy = Math.floor(y/8);
      const lx = (x + (Math.floor(y/8)&1)*4) % 8, ly = y % 8;
      if(lx===0 || ly===0) return MORTAR;
      return COBBLE[tq(hash(cx,cy,f.id+300)*.6 + .15, x, y, 4)];
    }
    const pd = pathDist(x,y) + (vnoise(x/22,y/22,301)-.5)*10;
    if(pd < 0){
      if(hash(x,y,302) > .97) return GRAVEL[3];
      return pd > -2 ? DIRT_EDGE : GRAVEL[tq(hash(x>>1,y>>1,303)*.7+vnoise(x/6,y/6,304)*.3, x, y, 4)];
    }
    let t = tq((vnoise(x/14,y/14,305)*.55 + vnoise(x/5,y/5,306)*.3 + hash(x,y,307)*.15 - .2)/.6, x, y, 4);
    if(hash(x,y,308) > .988) t = 3; else if(hash(x,y-1,308) > .988) t = 0;
    return C_GRASS[t];
  };

  const blds = [];
  const overlaps = (x,y,w,h,m) => blds.some(o => x < o.x+o.w+m && x+w+m > o.x && y < o.y+o.h+m && y+h+m > o.y);
  const nearPath = (x,y,w,h) => { for(let i=0;i<=4;i++) for(let j=0;j<=4;j++) if(pathDist(x+w*i/4, y+h*j/4) < 12) return true; return false; };
  const T = 12;
  // edificio de cripta con puerta hacia el sendero más cercano
  const building = (x, y, w, h, holes, id) => {
    const b0 = {x, y, w, h, id}; blds.push(b0);
    floors.push({x:x+T, y:y+T, w:w-2*T, h:h-2*T, id});
    const sides = ['top','bottom','left','right'];
    const door = sides.reduce((best,s) => {
      const p = s==='top' ? [x+w/2, y-30] : s==='bottom' ? [x+w/2, y+h+30] : s==='left' ? [x-30, y+h/2] : [x+w+30, y+h/2];
      const d = pathDist(p[0], p[1]); return d < best.d ? {s, d} : best;
    }, {s:'bottom', d:1e9}).s;
    const len = s => (s==='top'||s==='bottom') ? w : h;
    const gaps = {top:[], bottom:[], left:[], right:[]};
    gaps[door].push([len(door)/2-19, 38]);
    for(let i=0;i<holes;i++){ const s = sides[Math.floor(R()*4)], L = len(s), gw = rr(20,34); gaps[s].push([rr(T+6, L-T-gw-6), gw]); }
    for(const s of sides){
      const L = len(s), gs = gaps[s].sort((a,c)=>a[0]-c[0]);
      let pos = 0; const segs = [];
      for(const [g0,gw] of gs){ if(g0 > pos) segs.push([pos, g0]); pos = Math.max(pos, g0+gw); }
      if(pos < L) segs.push([pos, L]);
      for(const [a0,a1] of segs){
        const l = Math.round(a1-a0); if(l < 6) continue;
        const a = Math.round(a0), sd = id*17+a;
        if(s==='top') addWall(sc, x+a, y, l, T, 'crypt', sd);
        if(s==='bottom') addWall(sc, x+a, y+h-T, l, T, 'crypt', sd);
        if(s==='left') addWall(sc, x, y+a, T, l, 'crypt', sd);
        if(s==='right') addWall(sc, x+w-T, y+a, T, l, 'crypt', sd);
      }
    }
    return b0;
  };
  // capilla en ruinas al fondo del sendero principal
  const chapel = building(-140, -S+110, 280, 200, 2, 0);
  propSprite(sc, ART.altar, 0, chapel.y+T+30, {t:'r', x:-15, y:chapel.y+T+18, w:30, h:12}, [15,3]);
  sc.lights.push({x:0, y:chapel.y+T+18, r:120, a:.75, warm:true, flick:.1});
  for(let row=0; row<3; row++) for(const sx of [-1,1])
    propSprite(sc, ART.pew, sx*58, chapel.y+T+80+row*30, {t:'r', x:sx*58-15, y:chapel.y+T+74+row*30, w:30, h:6});
  propSprite(sc, ART.statue, -100, chapel.y+chapel.h+40, {t:'c', x:-100, y:chapel.y+chapel.h+36, r:9}, [10,3]);
  propSprite(sc, ART.statue, 100, chapel.y+chapel.h+40, {t:'c', x:100, y:chapel.y+chapel.h+36, r:9}, [10,3]);
  // mausoleos
  const mausoleums = [];
  for(let tries=0; tries<400 && mausoleums.length<9; tries++){
    const w = Math.round(rr(96,130)/2)*2, h = Math.round(rr(80,104)/2)*2;
    const x = Math.round(rr(-S+70, S-70-w)), y = Math.round(rr(-S+70, S-70-h));
    if(Math.hypot(x+w/2-sc.spawn.x, y+h/2-sc.spawn.y) < 340) continue;
    if(overlaps(x,y,w,h,70) || nearPath(x,y,w,h)) continue;
    const m = building(x, y, w, h, Math.floor(R()*2), mausoleums.length+1);
    mausoleums.push(m);
    propSprite(sc, ART.sarcophagus, x+w/2, y+h/2+8, {t:'r', x:x+w/2-13, y:y+h/2-2, w:26, h:10}, [13,3]);
    sc.lights.push({x:x+w/2, y:y+h/2-6, r:70, a:.5, warm:true, flick:.15});
    propSprite(sc, ART.candles, x+T+10, y+T+12);
  }
  sc.houses = blds;
  const inBld = (x,y,m=0) => blds.find(h => x > h.x-m && x < h.x+h.w+m && y > h.y-m && y < h.y+h.h+m);
  const free = (x,y,r) => {
    if(Math.abs(x) > S-60 || Math.abs(y) > S-60) return false;
    if(inBld(x,y,r+12)) return false;
    if(Math.hypot(x-sc.spawn.x, y-sc.spawn.y) < 110 || Math.hypot(x-sc.horse.x, y-sc.horse.y) < 50) return false;
    return !blocked(sc, x, y, r+6);
  };
  const interiorPoint = (hs, r) => {
    for(let i=0;i<30;i++){
      const x = Math.round(rr(hs.x+T+r+8, hs.x+hs.w-T-r-8)), y = Math.round(rr(hs.y+T+r+14, hs.y+hs.h-T-r-6));
      if(!blocked(sc, x, y, r+4)) return {x, y};
    }
    return null;
  };
  const outdoorPoint = (r, minSpawn=0, pathOk=false) => {
    for(let i=0;i<200;i++){
      const x = Math.round(rr(-S+80, S-80)), y = Math.round(rr(-S+80, S-80));
      if(Math.hypot(x-sc.spawn.x, y-sc.spawn.y) < minSpawn) continue;
      if(!pathOk && pathDist(x,y) < 14) continue;
      if(free(x,y,r)) return {x, y};
    }
    return null;
  };
  // campos de tumbas en hileras
  let sd = seed*11;
  for(let f=0; f<16; f++){
    const c = outdoorPoint(40, 260); if(!c) continue;
    const cols = 3 + Math.floor(R()*4), rows = 2 + Math.floor(R()*3), dx = 30, dy = 36;
    const fenced = R() < .45;
    for(let i=0;i<cols;i++) for(let j=0;j<rows;j++){
      if(R() < .2) continue;
      const x = Math.round(c.x + (i-(cols-1)/2)*dx + rr(-3,3)), y = Math.round(c.y + (j-(rows-1)/2)*dy);
      if(!free(x, y, 6) || pathDist(x,y) < 10) continue;
      if(R() < .1){ addProp(sc, {x, y:y-30, draw(){ drawSP(ART.openGrave, x, y); }}); propSprite(sc, ART.dirtPile, x+12, y-6); continue; }
      const v = Math.floor(R()*ART.tombs.length);
      propSprite(sc, ART.tombs[v], x, y, {t:'c', x, y:y-2, r:5}, [6,2]);
    }
    if(fenced){
      const w = cols*dx + 30, h = rows*dy + 20, x0 = c.x - w/2, y0 = c.y - h/2 - 10;
      for(let x=x0; x<x0+w; x+=18){
        if(Math.abs(x+9-c.x) < 20) continue;  // entrada
        for(const y of [y0, y0+h]) if(free(x+9, y, 4) && pathDist(x+9,y) > 8) propSprite(sc, ART.fenceIron, x+9, y, {t:'r', x:x, y:y-3, w:18, h:4});
      }
    }
  }
  for(let i=0;i<45;i++){ const p = outdoorPoint(12, 140); if(p) propTree(sc, p.x, p.y, ++sd, true); }
  for(let i=0;i<16;i++){ const p = outdoorPoint(12, 140); if(p) propRock(sc, p.x, p.y, ++sd); }
  for(let i=0;i<6;i++){ const p = outdoorPoint(12, 300); if(p) propSprite(sc, ART.statue, p.x, p.y, {t:'c', x:p.x, y:p.y-4, r:9}, [10,3]); }
  for(let i=0;i<14;i++){
    const p = outdoorPoint(6, 250); if(!p) continue;
    propSprite(sc, ART.candles, p.x, p.y);
    sc.lights.push({x:p.x, y:p.y-6, r:60, a:.6, warm:true, flick:.25});
  }
  for(let i=0;i<16;i++){ const p = outdoorPoint(5, 300); if(p) propGlowshroom(sc, p.x, p.y); }
  // fuegos fatuos: luces verdes que flotan despacio
  sc.wisps = [];
  for(let i=0;i<12;i++){ const p = outdoorPoint(5, 300); if(p) sc.wisps.push({x:p.x, y:p.y, hx:p.x, hy:p.y, ph:R()*6}); }
  for(let i=0;i<1300;i++){
    const x = Math.round(rr(-S, S)), y = Math.round(rr(-S, S));
    if(pathDist(x,y) < 4 || inBld(x,y,2)) continue;
    sc.decos.push({x, y, k: R()<.92 ? 'tuft' : 'flower', v: Math.floor(R()*3)});
  }
  // jaulas: las mascotas de esta expedición (si ya están aprobadas)
  const pets = shuffle(petsOfExp(2).filter(id => R() < CAGE_CHANCE[PETS[id].rarity]), R), pool = shuffle(mausoleums.slice(), R), cagePts = [];
  for(const id of pets){
    let p = cagePts.length < 5 && pool.length ? interiorPoint(pool.shift(), 13) : null;
    for(let i=0; !p && i<40; i++){ const q = outdoorPoint(14, 380); if(q && cagePts.every(c => Math.hypot(c.x-q.x, c.y-q.y) > 220)) p = q; }
    if(!p) continue;
    cagePts.push(p);
    const cage = {x:p.x, y:p.y, pet:null, open:false};
    cage.col = addCollider(sc, {t:'r', x:p.x-12, y:p.y-8, w:24, h:8});
    sc.cages.push(cage);
  }
  // cofres
  const addChest = (p, rare) => {
    if(!p) return;
    const ch = {x:p.x, y:p.y, rare, open:false};
    ch.col = addCollider(sc, {t:'r', x:p.x-9, y:p.y-8, w:18, h:8});
    sc.chests.push(ch);
  };
  for(const m of mausoleums) addChest(interiorPoint(m, 10), R() < .3);
  addChest(interiorPoint(chapel, 10), true);
  for(let i=0;i<8;i++) addChest(outdoorPoint(10, 300), false);
  for(let i=0;i<2;i++) addChest(outdoorPoint(10, 900), true);
  // portales
  for(const sx of [-1, 1]){
    let p = null;
    for(let i=0;i<300 && !p;i++){ const x = Math.round(sx*rr(520, S-120)), y = Math.round(rr(-S+140, -260)); if(free(x,y,22)) p = {x, y}; }
    if(p){ sc.portals.push({x:p.x, y:p.y, t:0}); sc.lights.push({x:p.x, y:p.y-8, r:120, a:.9, warm:false, flick:.1, col:'portal'}); }
  }
  // grupos de no-muertos
  const pickType = () => { const r = R(); return r < .32 ? 'skeleton' : r < .5 ? 'skelarcher' : r < .68 ? 'zombie' : r < .86 ? 'ghost' : (R()<.5 ? 'slime' : 'bigslime'); };
  for(let i=0;i<30;i++){
    const p = outdoorPoint(16, 420, true); if(!p) continue;
    const far = clamp(Math.hypot(p.x-sc.spawn.x, p.y-sc.spawn.y)/2200, 0, 1);
    const n = 2 + Math.floor(R()*2.3), pack = [], type = pickType();
    let hasRare = false;
    for(let k=0;k<n;k++){
      const roll = R();
      let rar = roll < .03 + far*.05 ? 'rare' : roll < .2 + far*.14 ? 'magic' : 'normal';
      if(rar==='rare' && hasRare) rar = 'magic';
      if(rar==='rare') hasRare = true;
      pack.push({type: R() < .75 ? type : pickType(), rarity: rar});
    }
    sc.monsterSpawns.push({x:p.x, y:p.y, pack});
  }
  for(const m of mausoleums){
    const p = interiorPoint(m, 12);
    if(p) sc.monsterSpawns.push({x:p.x, y:p.y, pack:[{type: R()<.4 ? 'skeleton' : R()<.5 ? 'skelarcher' : 'ghost', rarity: R()<.35 ? 'magic' : 'normal'}]});
  }
  return sc;
}

// =====================================================================
//  Expedición 3 – La cripta de la condesa (mazmorra de salas y pasillos)
// =====================================================================
const CR_FLOOR = ['#1c1a1e','#222024','#28262b','#2f2c31'].map(hex), CR_MORTAR = hex('#0e0d10');
const CR_BRICK = ['#1a181c','#222026','#2a272e'].map(hex), CR_TOP = ['#08070a','#0c0b0f','#100e13'].map(hex), CR_RIM = hex('#36323a');
function buildCrypt(seed){
  const R = rng(seed), rr = (a,c) => a + R()*(c-a), ri = (a,c) => Math.floor(rr(a,c+1));
  const S = 1200, T = 16, N = (2*S)/T, sc = baseScene('crypt', 'La cripta de la condesa', -S, -S, S, S);
  sc.kind = 'raid'; sc.darkness = .97; sc.seed = seed; sc.lvl = 3;
  const grid = new Uint8Array(N*N);           // 1 = suelo
  const rooms = [];
  const carve = (x0,y0,w,h) => { for(let y=y0;y<y0+h;y++) for(let x=x0;x<x0+w;x++) if(x>1&&y>1&&x<N-2&&y<N-2) grid[y*N+x] = 1; };
  const overlap = (a,c,m) => a.x < c.x+c.w+m && a.x+a.w+m > c.x && a.y < c.y+c.h+m && a.y+a.h+m > c.y;
  // entrada abajo y sala del trono arriba
  const start = {x:Math.floor(N/2)-7, y:N-14, w:14, h:10, kind:'start'};
  const boss = {x:Math.floor(N/2)-16, y:4, w:32, h:22, kind:'boss'};
  rooms.push(start, boss);
  for(let tries=0; tries<600 && rooms.length<26; tries++){
    const w = ri(8,15), h = ri(7,12), r = {x:ri(3, N-w-3), y:ri(30, N-h-18), w, h};
    if(rooms.some(o => overlap(r, o, 3))) continue;
    rooms.push(r);
  }
  for(const r of rooms) carve(r.x, r.y, r.w, r.h);
  // pasillos: árbol de expansión mínima + algunos bucles
  const ctr = r => ({x:Math.floor(r.x+r.w/2), y:Math.floor(r.y+r.h/2)});
  const corridor = (a,c) => {
    const A = ctr(a), B = ctr(c), hFirst = R() < .5;
    const hx = (y, x0, x1) => carve(Math.min(x0,x1)-1, y-1, Math.abs(x1-x0)+3, 3);
    const vy = (x, y0, y1) => carve(x-1, Math.min(y0,y1)-1, 3, Math.abs(y1-y0)+3);
    if(hFirst){ hx(A.y, A.x, B.x); vy(B.x, A.y, B.y); } else { vy(A.x, A.y, B.y); hx(B.y, A.x, B.x); }
  };
  const inTree = [rooms[0]], rest = rooms.slice(1), edges = [];
  while(rest.length){
    let best = null;
    for(const a of inTree) for(const c of rest){ const d = Math.hypot(ctr(a).x-ctr(c).x, ctr(a).y-ctr(c).y); if(!best || d < best.d) best = {a, c, d}; }
    edges.push(best); inTree.push(best.c); rest.splice(rest.indexOf(best.c), 1);
  }
  for(const e of edges) corridor(e.a, e.c);
  for(let i=0;i<4;i++){ const a = rooms[Math.floor(R()*rooms.length)], c = rooms[Math.floor(R()*rooms.length)]; if(a!==c && a!==boss && c!==boss) corridor(a, c); }
  const tile = (tx,ty) => (tx<0||ty<0||tx>=N||ty>=N) ? 0 : grid[ty*N+tx];
  const tAt = (x,y) => tile(Math.floor((x+S)/T), Math.floor((y+S)/T));
  sc.solidAt = (x,y) => !tAt(x,y);
  sc.ground = (x,y) => {
    const tx = Math.floor((x+S)/T), ty = Math.floor((y+S)/T), lx = (x+S) - tx*T, ly = (y+S) - ty*T;
    if(tile(tx,ty)){
      if(lx===0 || ly===0) return CR_MORTAR;
      let t = tq(hash(tx,ty,401)*.5 + vnoise(x/5,y/5,402)*.3 + .1, x, y, 4);
      if(!tile(tx,ty-1) && ly < 5) t = Math.max(0, t-2);            // sombra al pie del muro
      if(hash(x,y,403) > .996) return CR_FLOOR[3];
      return CR_FLOOR[t];
    }
    // muro con cara de ladrillo visible si hay suelo debajo
    if(tile(tx,ty+1)){
      if(ly < 2) return CR_RIM;
      const row = Math.floor(ly/4), off = (row&1)*4;
      if(ly%4===0 || (lx+off)%8===0) return CR_MORTAR;
      return CR_BRICK[tq(hash(Math.floor((lx+off)/8)+tx*3, row+ty*5, 404)*.7 + .15 - ly/T*.3, x, y, 3)];
    }
    const nearFloor = tile(tx-1,ty)||tile(tx+1,ty)||tile(tx,ty-1);
    if(nearFloor && ((tile(tx-1,ty) && lx < 2) || (tile(tx+1,ty) && lx > T-3) || (tile(tx,ty-1) && ly < 2))) return CR_RIM;
    return CR_TOP[tq(vnoise(x/6,y/6,405)*.7 + hash(x,y,406)*.3, x, y, 3)];
  };
  const toW = (tx,ty) => ({x:-S + tx*T + T/2, y:-S + ty*T + T/2});
  const roomPoint = (r, pad=1) => { const p = toW(ri(r.x+pad, r.x+r.w-1-pad), ri(r.y+pad+1, r.y+r.h-1-pad)); return p; };
  const freeAt = (x,y,rad) => !blocked(sc, x, y, rad+4);
  const placeIn = (r, rad, pad=1) => { for(let i=0;i<30;i++){ const p = roomPoint(r, pad); if(freeAt(p.x,p.y,rad)) return p; } return null; };
  // entrada: caballo y punto de inicio
  const sp = toW(start.x + Math.floor(start.w/2), start.y + start.h - 3);
  sc.spawn = {x:sp.x, y:sp.y};
  sc.horse = {x:sp.x - 40, y:sp.y + 12, dir:1};
  addCollider(sc, {t:'r', x:sc.horse.x-24, y:sc.horse.y-7, w:46, h:12});
  sc.lights.push({x:sp.x, y:sp.y-20, r:140, a:.7, warm:true, flick:.08});
  sc.decals = [];
  sc.wisps = [];
  // sala del trono
  const bc = toW(boss.x + Math.floor(boss.w/2), boss.y + 4);
  propSprite(sc, ART.throne, bc.x, bc.y + 40, {t:'r', x:bc.x-20, y:bc.y+26, w:40, h:14}, [20,4]);
  for(const sx of [-1,1]){
    for(let i=0;i<3;i++){ const p = toW(boss.x + (sx<0 ? 4 : boss.w-5), boss.y + 5 + i*6); propSprite(sc, ART.pillar, p.x, p.y, {t:'c', x:p.x, y:p.y-4, r:8}, [9,3]); }
    const c = {x:bc.x + sx*60, y:bc.y + 46};
    const cd = propSprite(sc, ART.candelabra, c.x, c.y, {t:'c', x:c.x, y:c.y-2, r:5});
    cd.draw = function(){ drawSP(ART.candelabra, c.x, c.y); for(const dx of [-5,0,5]) drawFlames(c.x+dx, c.y-26 + (dx ? 2 : 0), .2); };
    sc.lights.push({x:c.x, y:c.y-24, r:120, a:.75, warm:true, flick:.15});
  }
  sc.bossSpawn = {x:bc.x, y:bc.y + 110};
  sc.bossRoom = {x:-S + boss.x*T, y:-S + boss.y*T, w:boss.w*T, h:boss.h*T};
  // decoración de las salas
  const others = rooms.filter(r => r!==start && r!==boss);
  for(const r of others){
    const n = Math.floor(R()*3);
    for(let i=0;i<n;i++){ const p = placeIn(r, 8, 2); if(p) propSprite(sc, ART.pillar, p.x, p.y, {t:'c', x:p.x, y:p.y-4, r:8}, [9,3]); }
    if(R() < .5){ const p = placeIn(r, 10); if(p) propSprite(sc, ART.sarcophagus, p.x, p.y, {t:'r', x:p.x-13, y:p.y-10, w:26, h:10}, [13,3]); }
    if(R() < .45){ const p = placeIn(r, 8); if(p) propSprite(sc, ART.coffin, p.x, p.y, {t:'r', x:p.x-7, y:p.y-12, w:14, h:12}); }
    if(R() < .6){ const p = placeIn(r, 8); if(p) propSprite(sc, ART.skullpile, p.x, p.y, {t:'c', x:p.x, y:p.y-3, r:7}); }
    if(R() < .55){
      const p = placeIn(r, 7);
      if(p){ const b2 = propSprite(sc, ART.brazier, p.x, p.y, {t:'c', x:p.x, y:p.y-3, r:6}); b2.draw = function(){ drawSP(ART.brazier, p.x, p.y); drawFlames(p.x, p.y-11, .5); }; sc.lights.push({x:p.x, y:p.y-14, r:110, a:.75, warm:true, flick:.15}); }
    }
    for(let i=0;i<3;i++){ const p = roomPoint(r, 1); sc.decals.push({img:ART.bones.c, x:p.x-7, y:p.y-4}); }
    // telarañas en las esquinas superiores
    const c0 = toW(r.x, r.y), c1 = toW(r.x+r.w-1, r.y);
    sc.decals.push({img:ART.cobweb, x:c0.x-8, y:c0.y-8}, {img:ART.cobweb, x:c1.x-8, y:c1.y-8, flip:true});
    if(R() < .3){ const p = roomPoint(r, 1); sc.wisps.push({x:p.x, y:p.y, hx:p.x, hy:p.y, ph:R()*6}); }
  }
  sc.houses = [];
  // cofres: más en salas sin salida (un solo pasillo)
  const addChest = (p, rare) => { if(!p) return; const ch = {x:p.x, y:p.y, rare, open:false}; ch.col = addCollider(sc, {t:'r', x:p.x-9, y:p.y-8, w:18, h:8}); sc.chests.push(ch); };
  const deg = new Map(rooms.map(r => [r, 0])); for(const e of edges){ deg.set(e.a, deg.get(e.a)+1); deg.set(e.c, deg.get(e.c)+1); }
  for(const r of others) if(R() < .7) addChest(placeIn(r, 10), deg.get(r) <= 1 && R() < .6);
  addChest(placeIn(boss, 10, 3), true); addChest(placeIn(boss, 10, 3), true);
  // portales en dos salas alejadas de la entrada
  const far = others.slice().sort((a,c) => Math.hypot(ctr(c).x-ctr(start).x, ctr(c).y-ctr(start).y) - Math.hypot(ctr(a).x-ctr(start).x, ctr(a).y-ctr(start).y));
  for(const r of far){
    if(sc.portals.length >= 2) break;
    const p = placeIn(r, 22, 2);
    if(p && sc.portals.every(o => Math.hypot(o.x-p.x, o.y-p.y) > 500)){ sc.portals.push({x:p.x, y:p.y, t:0}); sc.lights.push({x:p.x, y:p.y-8, r:120, a:.9, warm:false, flick:.1, col:'portal'}); }
  }
  // jaulas: mascotas de esta expedición (cuando estén aprobadas)
  const pets = shuffle(petsOfExp(3).filter(id => R() < CAGE_CHANCE[PETS[id].rarity]), R), pool = shuffle(others.slice(), R);
  for(const id of pets){
    const r = pool.shift(); if(!r) break;
    const p = placeIn(r, 13, 2); if(!p) continue;
    const cage = {x:p.x, y:p.y, pet:null, open:false};
    cage.col = addCollider(sc, {t:'r', x:p.x-12, y:p.y-8, w:24, h:8});
    sc.cages.push(cage);
  }
  // séquito de la Condesa
  const types = [['skeleton',.14],['skelarcher',.12],['skelmage',.16],['wraith',.15],['necro',.1],['skelknight',.13],['zombie',.08],['ghost',.12]];
  const pickType = () => { let t = R(); for(const [k,w] of types){ if((t -= w) <= 0) return k; } return 'skeleton'; };
  for(const r of others){
    const packs = r.w*r.h > 110 ? 2 : 1;
    for(let k=0;k<packs;k++){
      const p = roomPoint(r, 2), n = 2 + Math.floor(R()*2.2), type = pickType(), pack = [];
      let hasRare = false;
      for(let i=0;i<n;i++){
        const roll = R(); let rar = roll < .06 ? 'rare' : roll < .32 ? 'magic' : 'normal';
        if(rar==='rare' && hasRare) rar = 'magic'; if(rar==='rare') hasRare = true;
        pack.push({type: R() < .7 ? type : pickType(), rarity: rar});
      }
      sc.monsterSpawns.push({x:p.x, y:p.y, pack});
    }
  }
  for(let i=0;i<4;i++){ const p = placeIn(boss, 12, 4); if(p) sc.monsterSpawns.push({x:p.x, y:p.y, pack:[{type: i%2 ? 'wraith' : 'skelknight', rarity:'magic'}]}); }
  return sc;
}

// =====================================================================
//  Expedición 4 – Las planicies salvajes (generado en cada expedición)
// =====================================================================
const PL_GRASS = ['#24251a','#2b2c1e','#333524','#3d3f2a'].map(hex), PL_TALL = ['#161d12','#1e2817','#28341e','#344428'].map(hex);
const PL_DIRT = ['#342a1c','#3e3120','#4a3b27'].map(hex);
function buildPlains(seed){
  const R = rng(seed), rr = (a,c) => a + R()*(c-a);
  const S = 1300, sc = baseScene('plains', 'Las planicies salvajes', -S, -S, S, S);
  sc.kind = 'raid'; sc.darkness = .94; sc.seed = seed; sc.lvl = 4;
  sc.spawn = {x:0, y:S-170};
  sc.horse = {x:-34, y:S-150, dir:1};
  addCollider(sc, {t:'r', x:-58, y:S-157, w:46, h:12});
  // senderos de tierra que serpentean por la llanura
  const trails = [];
  const trail = (x0,y0,x1,y1,w) => trails.push({x0,y0,x1,y1,w});
  trail(0, S, 40, -S+100, 30); trail(-S+100, 380, S-100, 300, 24); trail(-S+120, -380, S-120, -300, 24); trail(-600, -S+150, -540, S-200, 20); trail(620, -S+150, 560, S-200, 20);
  const trailDist = (x,y) => {
    let best = 1e9;
    for(const r of trails){
      const dx=r.x1-r.x0, dy=r.y1-r.y0, t=clamp(((x-r.x0)*dx+(y-r.y0)*dy)/(dx*dx+dy*dy),0,1);
      best = Math.min(best, Math.hypot(x-r.x0-dx*t, y-r.y0-dy*t) - r.w/2);
    }
    return best;
  };
  sc.ground = (x,y) => {
    if(Math.abs(x)>S || Math.abs(y)>S) return PL_GRASS[0];
    const td = trailDist(x,y) + (vnoise(x/25,y/25,501)-.5)*14;
    if(td < 0){
      if(td > -2) return DIRT_EDGE;
      if(hash(x,y,507) > .995) return PEB[0];
      return PL_DIRT[tq(vnoise(x/6,y/6,508)*.6+hash(x,y,509)*.4-.1, x, y, 3)];
    }
    // manchas de hierba alta con briznas verticales
    const tall = vnoise(x/70,y/70,502)*.7 + vnoise(x/20,y/20,503)*.3;
    if(tall > .56){
      let t = tq(vnoise(x/6,y/6,504)*.6 + hash(x,y,505)*.4, x, y, 4);
      if(hash(x>>1,y>>3,506) > .86 && (y&7) < 4) t = Math.min(3, t+1);
      if(hash(x,y,510) > .985) t = 0;
      return PL_TALL[t];
    }
    let t = tq((vnoise(x/18,y/18,511)*.55 + vnoise(x/5,y/5,512)*.3 + hash(x,y,513)*.15 - .2)/.6, x, y, 4);
    if(hash(x,y,514) > .987) t = 3; else if(hash(x,y-1,514) > .987) t = 0;
    return PL_GRASS[t];
  };
  const camps = [];
  const free = (x,y,r) => {
    if(Math.abs(x) > S-60 || Math.abs(y) > S-60) return false;
    if(Math.hypot(x-sc.spawn.x, y-sc.spawn.y) < 110 || Math.hypot(x-sc.horse.x, y-sc.horse.y) < 50) return false;
    return !blocked(sc, x, y, r+6);
  };
  const outdoorPoint = (r, minSpawn=0, trailOk=false) => {
    for(let i=0;i<200;i++){
      const x = Math.round(rr(-S+80, S-80)), y = Math.round(rr(-S+80, S-80));
      if(Math.hypot(x-sc.spawn.x, y-sc.spawn.y) < minSpawn) continue;
      if(!trailOk && trailDist(x,y) < 14) continue;
      if(free(x,y,r)) return {x, y};
    }
    return null;
  };
  // campamentos abandonados: hoguera, tiendas, cajas y carro
  for(let i=0;i<6;i++){
    const c = outdoorPoint(40, 400); if(!c) continue;
    camps.push(c);
    const cf = propSprite(sc, ART.campfire, c.x, c.y, {t:'c', x:c.x, y:c.y-3, r:9, low:true});
    cf.draw = function(){ drawSP(ART.campfire, c.x, c.y); drawFlames(c.x, c.y-6, .8); };
    sc.lights.push({x:c.x, y:c.y-8, r:150, a:.85, warm:true, flick:.12});
    for(const [dx,dy] of [[-34,-18],[30,-22],[4,-40]]) if(R() < .75) propSprite(sc, ART.tent, c.x+dx, c.y+dy, {t:'c', x:c.x+dx, y:c.y+dy-4, r:12}, [17,4]);
    if(R() < .6) propSprite(sc, ART.wagon, c.x+rr(-50,50), c.y+rr(28,44), {t:'r', x:c.x-20, y:c.y+22, w:40, h:10}, [22,4]);
    for(let k=0;k<3;k++){ const x = c.x + rr(-44,44), y = c.y + rr(10,34); if(free(x,y,8)) propSprite(sc, R()<.5 ? ART.crate : ART.barrel, Math.round(x), Math.round(y), R()<.5 ? {t:'r', x:x-7, y:y-9, w:15, h:10, low:true} : {t:'c', x, y:y-2, r:6, low:true}, [7,2]); }
  }
  let sd = seed*13;
  for(let i=0;i<50;i++){ const p = outdoorPoint(12, 140); if(p) propTree(sc, p.x, p.y, ++sd, true); }
  for(let i=0;i<34;i++){ const p = outdoorPoint(12, 140); if(p) propRock(sc, p.x, p.y, ++sd); }
  for(let i=0;i<70;i++){ const p = outdoorPoint(9, 120); if(p) propBush(sc, p.x, p.y, ++sd); }
  // círculos de piedras en pie
  for(let i=0;i<4;i++){
    const c = outdoorPoint(40, 500); if(!c) continue;
    for(let k=0;k<7;k++){ const a = k/7*Math.PI*2, x = Math.round(c.x + Math.cos(a)*34), y = Math.round(c.y + Math.sin(a)*22); if(free(x,y,6)) propSprite(sc, ART.tombs[4], x, y, {t:'c', x, y:y-3, r:5}, [6,2]); }
    sc.lights.push({x:c.x, y:c.y-4, r:90, a:.5, warm:false, flick:.2});
  }
  // huesos de animales esparcidos
  for(let i=0;i<40;i++){ const p = outdoorPoint(4, 200, true); if(p) propSprite(sc, i%3 ? ART.bones : ART.skullpile, p.x, p.y, {t:'c', x:p.x, y:p.y-2, r:5, low:true}); }
  for(let i=0;i<1700;i++){
    const x = Math.round(rr(-S, S)), y = Math.round(rr(-S, S));
    if(trailDist(x,y) < 4) continue;
    sc.decos.push({x, y, k: R()<.93 ? 'tuft' : 'flower', v: Math.floor(R()*3)});
  }
  sc.houses = []; sc.wisps = [];
  // jaulas: mascotas de esta expedición (cuando estén aprobadas)
  const pets = shuffle(petsOfExp(4).filter(id => R() < CAGE_CHANCE[PETS[id].rarity]), R), cagePts = [];
  for(const id of pets){
    let p = null;
    for(let i=0; !p && i<60; i++){ const q = camps.length && i%2 ? {x:camps[i%camps.length].x + rr(-40,40), y:camps[i%camps.length].y + rr(30,60)} : outdoorPoint(14, 380); if(q && free(q.x, q.y, 14) && cagePts.every(c => Math.hypot(c.x-q.x, c.y-q.y) > 220)) p = q; }
    if(!p) continue;
    cagePts.push(p);
    const cage = {x:Math.round(p.x), y:Math.round(p.y), pet:null, open:false};
    cage.col = addCollider(sc, {t:'r', x:cage.x-12, y:cage.y-8, w:24, h:8});
    sc.cages.push(cage);
  }
  const addChest = (p, rare) => { if(!p) return; const ch = {x:p.x, y:p.y, rare, open:false}; ch.col = addCollider(sc, {t:'r', x:p.x-9, y:p.y-8, w:18, h:8}); sc.chests.push(ch); };
  for(const c of camps) addChest({x:Math.round(c.x + rr(-20,20)), y:Math.round(c.y + rr(20,34))}, R() < .25);
  for(let i=0;i<10;i++) addChest(outdoorPoint(10, 300), false);
  for(let i=0;i<3;i++) addChest(outdoorPoint(10, 900), true);
  for(const sx of [-1, 1]){
    let p = null;
    for(let i=0;i<300 && !p;i++){ const x = Math.round(sx*rr(500, S-120)), y = Math.round(rr(-S+120, -300)); if(free(x,y,22)) p = {x, y}; }
    if(p){ sc.portals.push({x:p.x, y:p.y, t:0}); sc.lights.push({x:p.x, y:p.y-8, r:120, a:.9, warm:false, flick:.1, col:'portal'}); }
  }
  // manadas de animales poseídos
  const types = [['wolfp',.24],['boarp',.18],['bisonp',.10],['vulturep',.14],['snakep',.12],['venomwolf',.10],['spitp',.12]];
  const pickType = () => { let t = R(); for(const [k,w] of types){ if((t -= w) <= 0) return k; } return 'wolfp'; };
  for(let i=0;i<36;i++){
    const p = outdoorPoint(16, 420, true); if(!p) continue;
    const far = clamp(Math.hypot(p.x-sc.spawn.x, p.y-sc.spawn.y)/2300, 0, 1);
    const type = pickType(), n = type==='bisonp' ? 1 + Math.floor(R()*2) : 2 + Math.floor(R()*2.4), pack = [];
    let hasRare = false;
    for(let k=0;k<n;k++){
      const roll = R(); let rar = roll < .03 + far*.05 ? 'rare' : roll < .2 + far*.14 ? 'magic' : 'normal';
      if(rar==='rare' && hasRare) rar = 'magic'; if(rar==='rare') hasRare = true;
      pack.push({type: R() < .8 ? type : pickType(), rarity: rar});
    }
    sc.monsterSpawns.push({x:p.x, y:p.y, pack});
  }
  for(const c of camps) sc.monsterSpawns.push({x:Math.round(c.x), y:Math.round(c.y + 70), pack:[{type: R()<.5 ? 'wolfp' : 'snakep', rarity: R()<.3 ? 'magic' : 'normal'}, {type:'snakep', rarity:'normal'}]});
  return sc;
}

const OC_GRASS = ['#2b211b','#33271f','#3c2e24','#473629'].map(hex), OC_TALL = ['#1c1611','#251d15','#30261b','#3d3022'].map(hex), OC_DIRT = ['#3d2a1e','#4a3322','#5a3f29'].map(hex);
function buildOrcCamp(seed){
  const R = rng(seed), rr = (a,c) => a + R()*(c-a);
  const S = 1300, sc = baseScene('orccamp', 'El campamento orco', -S, -S, S, S);
  sc.kind = 'raid'; sc.darkness = .94; sc.seed = seed; sc.lvl = 5;
  sc.spawn = {x:0, y:S-170};
  sc.horse = {x:-34, y:S-150, dir:1};
  addCollider(sc, {t:'r', x:-58, y:S-157, w:46, h:12});
  if(!G.save.uakalaHome){ const un = {id:'uakala', name:'Uakala', x:38, y:S-152, dir:-1}; sc.npcs.push(un); un.col = addCollider(sc, {t:'c', x:38, y:S-154, r:9}); }   // el herrero desterrado espera junto al caballo
  // senderos de tierra que serpentean por la llanura
  // fortaleza orca: empalizada ovalada con una puerta al sur
  const FC = {x:0, y:-760}, FRX = 250, FRY = 170;
  const inFortZone = (x, y, k=1) => ((x-FC.x)/((FRX+24)*k))**2 + ((y-FC.y)/((FRY+24)*k))**2 < 1;
  for(let ang = 0; ang < Math.PI*2; ang += 16/((FRX+FRY)/2)){
    if(Math.sin(ang) > .985) continue;
    const x = Math.round(FC.x + Math.cos(ang)*FRX), y = Math.round(FC.y + Math.sin(ang)*FRY);
    propSprite(sc, ART.fenceH[Math.floor(R()*3)], x, y, {t:'r', x:x-9, y:y-8, w:18, h:8}, [9,2]);
  }
  sc.lights.push({x:FC.x, y:FC.y + FRY - 10, r:120, a:.8, warm:true, flick:.15});
  const trails = [];
  const trail = (x0,y0,x1,y1,w) => trails.push({x0,y0,x1,y1,w});
  trail(0, S, 40, -S+100, 30); trail(-S+100, 380, S-100, 300, 24); trail(-S+120, -380, S-120, -300, 24); trail(-600, -S+150, -540, S-200, 20); trail(620, -S+150, 560, S-200, 20);
  const trailDist = (x,y) => {
    let best = 1e9;
    for(const r of trails){
      const dx=r.x1-r.x0, dy=r.y1-r.y0, t=clamp(((x-r.x0)*dx+(y-r.y0)*dy)/(dx*dx+dy*dy),0,1);
      best = Math.min(best, Math.hypot(x-r.x0-dx*t, y-r.y0-dy*t) - r.w/2);
    }
    return best;
  };
  sc.ground = (x,y) => {
    if(Math.abs(x)>S || Math.abs(y)>S) return OC_GRASS[0];
    const td = trailDist(x,y) + (vnoise(x/25,y/25,501)-.5)*14;
    if(td < 0){
      if(td > -2) return DIRT_EDGE;
      if(hash(x,y,507) > .995) return PEB[0];
      return OC_DIRT[tq(vnoise(x/6,y/6,508)*.6+hash(x,y,509)*.4-.1, x, y, 3)];
    }
    // manchas de hierba alta con briznas verticales
    const tall = vnoise(x/70,y/70,502)*.7 + vnoise(x/20,y/20,503)*.3;
    if(tall > .56){
      let t = tq(vnoise(x/6,y/6,504)*.6 + hash(x,y,505)*.4, x, y, 4);
      if(hash(x>>1,y>>3,506) > .86 && (y&7) < 4) t = Math.min(3, t+1);
      if(hash(x,y,510) > .985) t = 0;
      return OC_TALL[t];
    }
    let t = tq((vnoise(x/18,y/18,511)*.55 + vnoise(x/5,y/5,512)*.3 + hash(x,y,513)*.15 - .2)/.6, x, y, 4);
    if(hash(x,y,514) > .987) t = 3; else if(hash(x,y-1,514) > .987) t = 0;
    return OC_GRASS[t];
  };
  const camps = [];
  let forting = false;
  const fortPoint = (k=.62) => {
    forting = true;
    try {
      for(let i=0;i<120;i++){ const a = R()*Math.PI*2, rad = Math.sqrt(R())*k, x = Math.round(FC.x + Math.cos(a)*FRX*rad), y = Math.round(FC.y + Math.sin(a)*FRY*rad); if(free(x, y, 14)) return {x, y}; }
    } finally { forting = false; }
    return null;
  };
  const free = (x,y,r) => {
    if(Math.abs(x) > S-60 || Math.abs(y) > S-60) return false;
    if(!forting && inFortZone(x, y)) return false;
    if(Math.hypot(x-sc.spawn.x, y-sc.spawn.y) < 110 || Math.hypot(x-sc.horse.x, y-sc.horse.y) < 50) return false;
    return !blocked(sc, x, y, r+6);
  };
  const outdoorPoint = (r, minSpawn=0, trailOk=false) => {
    for(let i=0;i<200;i++){
      const x = Math.round(rr(-S+80, S-80)), y = Math.round(rr(-S+80, S-80));
      if(Math.hypot(x-sc.spawn.x, y-sc.spawn.y) < minSpawn) continue;
      if(!trailOk && trailDist(x,y) < 14) continue;
      if(free(x,y,r)) return {x, y};
    }
    return null;
  };
  // campamentos abandonados: hoguera, tiendas, cajas y carro
  for(let i=0;i<8;i++){
    const c = i < 3 ? fortPoint(.5) : outdoorPoint(40, 400); if(!c) continue;
    camps.push(c);
    const cf = propSprite(sc, ART.campfire, c.x, c.y, {t:'c', x:c.x, y:c.y-3, r:9, low:true});
    cf.draw = function(){ drawSP(ART.campfire, c.x, c.y); drawFlames(c.x, c.y-6, .8); };
    sc.lights.push({x:c.x, y:c.y-8, r:150, a:.85, warm:true, flick:.12});
    for(const [dx,dy] of [[-34,-18],[30,-22],[4,-40]]) if(R() < .75) propSprite(sc, ART.tent, c.x+dx, c.y+dy, {t:'c', x:c.x+dx, y:c.y+dy-4, r:12}, [17,4]);
    if(R() < .6) propSprite(sc, ART.wagon, c.x+rr(-50,50), c.y+rr(28,44), {t:'r', x:c.x-20, y:c.y+22, w:40, h:10}, [22,4]);
    for(let k=0;k<3;k++){ const x = c.x + rr(-44,44), y = c.y + rr(10,34); if(free(x,y,8)) propSprite(sc, R()<.5 ? ART.crate : ART.barrel, Math.round(x), Math.round(y), R()<.5 ? {t:'r', x:x-7, y:y-9, w:15, h:10, low:true} : {t:'c', x, y:y-2, r:6, low:true}, [7,2]); }
  }
  let sd = seed*13;
  for(let i=0;i<50;i++){ const p = outdoorPoint(12, 140); if(p) propTree(sc, p.x, p.y, ++sd, true); }
  for(let i=0;i<34;i++){ const p = outdoorPoint(12, 140); if(p) propRock(sc, p.x, p.y, ++sd); }
  for(let i=0;i<70;i++){ const p = outdoorPoint(9, 120); if(p) propBush(sc, p.x, p.y, ++sd); }
  // círculos de piedras en pie
  for(let i=0;i<4;i++){
    const c = outdoorPoint(40, 500); if(!c) continue;
    for(let k=0;k<7;k++){ const a = k/7*Math.PI*2, x = Math.round(c.x + Math.cos(a)*34), y = Math.round(c.y + Math.sin(a)*22); if(free(x,y,6)) propSprite(sc, ART.tombs[4], x, y, {t:'c', x, y:y-3, r:5}, [6,2]); }
    sc.lights.push({x:c.x, y:c.y-4, r:90, a:.5, warm:false, flick:.2});
  }
  // huesos de animales esparcidos
  for(let i=0;i<40;i++){ const p = outdoorPoint(4, 200, true); if(p) propSprite(sc, i%3 ? ART.bones : ART.skullpile, p.x, p.y, {t:'c', x:p.x, y:p.y-2, r:5, low:true}); }
  for(let i=0;i<1700;i++){
    const x = Math.round(rr(-S, S)), y = Math.round(rr(-S, S));
    if(trailDist(x,y) < 4) continue;
    sc.decos.push({x, y, k: R()<.93 ? 'tuft' : 'flower', v: Math.floor(R()*3)});
  }
  sc.houses = []; sc.wisps = [];
  // jaulas: mascotas de esta expedición (cuando estén aprobadas)
  const pets = shuffle(petsOfExp(5).filter(id => R() < CAGE_CHANCE[PETS[id].rarity]), R), cagePts = [];
  for(const id of pets){
    let p = null;
    for(let i=0; !p && i<60; i++){ const q = camps.length && i%2 ? {x:camps[i%camps.length].x + rr(-40,40), y:camps[i%camps.length].y + rr(30,60)} : outdoorPoint(14, 380); if(q && free(q.x, q.y, 14) && cagePts.every(c => Math.hypot(c.x-q.x, c.y-q.y) > 220)) p = q; }
    if(!p) continue;
    cagePts.push(p);
    const cage = {x:Math.round(p.x), y:Math.round(p.y), pet:null, open:false};
    cage.col = addCollider(sc, {t:'r', x:cage.x-12, y:cage.y-8, w:24, h:8});
    sc.cages.push(cage);
  }
  const addChest = (p, rare) => { if(!p) return; const ch = {x:p.x, y:p.y, rare, open:false}; ch.col = addCollider(sc, {t:'r', x:p.x-9, y:p.y-8, w:18, h:8}); sc.chests.push(ch); };
  for(const c of camps) addChest({x:Math.round(c.x + rr(-20,20)), y:Math.round(c.y + rr(20,34))}, R() < .25);
  for(let i=0;i<10;i++) addChest(outdoorPoint(10, 300), false);
  for(let i=0;i<3;i++) addChest(outdoorPoint(10, 900), true);
  for(let i=0;i<3;i++) addChest(fortPoint(.6), true);
  for(const sx of [-1, 1]){
    let p = null;
    for(let i=0;i<300 && !p;i++){ const x = Math.round(sx*rr(500, S-120)), y = Math.round(rr(-S+120, -300)); if(free(x,y,22)) p = {x, y}; }
    if(p){ sc.portals.push({x:p.x, y:p.y, t:0}); sc.lights.push({x:p.x, y:p.y-8, r:120, a:.9, warm:false, flick:.1, col:'portal'}); }
  }
  // manadas de animales poseídos
  const types = [['orc',.46],['orcarcher',.26],['orcshaman',.16],['orcbrute',.12]];
  const pickType = () => { let t = R(); for(const [k,w] of types){ if((t -= w) <= 0) return k; } return 'orc'; };
  for(let i=0;i<26;i++){
    const p = outdoorPoint(16, 420, true); if(!p) continue;
    const far = clamp(Math.hypot(p.x-sc.spawn.x, p.y-sc.spawn.y)/2300, 0, 1);
    const type = pickType(), n = type==='orcbrute' ? 1 + Math.floor(R()*2) : 2 + Math.floor(R()*3), pack = [];
    let hasRare = false;
    for(let k=0;k<n;k++){
      const roll = R(); let rar = roll < .03 + far*.05 ? 'rare' : roll < .2 + far*.14 ? 'magic' : 'normal';
      if(rar==='rare' && hasRare) rar = 'magic'; if(rar==='rare') hasRare = true;
      pack.push({type: R() < .8 ? type : pickType(), rarity: rar});
    }
    sc.monsterSpawns.push({x:p.x, y:p.y, pack});
  }
  for(const c of camps) sc.monsterSpawns.push({x:Math.round(c.x), y:Math.round(c.y + 70), pack:[{type:'orc', rarity: R()<.4 ? 'magic' : 'normal'}, {type:'orc', rarity:'normal'}, {type:'orcarcher', rarity:'normal'}]});
  // la guardia de la fortaleza: bruto, orcos mágicos, chamán y arquero juntos
  for(let i=0;i<5;i++){
    const p = fortPoint(.6); if(!p) continue;
    sc.monsterSpawns.push({x:p.x, y:p.y, pack:[{type:'orcbrute', rarity: R()<.35 ? 'rare' : 'magic'}, {type:'orc', rarity:'magic'}, {type:'orcshaman', rarity:'normal'}, {type:'orcarcher', rarity:'normal'}]});
  }
  return sc;
}

// =====================================================================
//  Expedición 6 – El castillo de Urr (laberinto de pasillos con trampas)
// =====================================================================
const CS_FLOOR = ['#26211d','#2d2722','#352e28','#3e362f'].map(hex), CS_MORTAR = hex('#12100e');
const CS_BRICK = ['#2a1d1a','#34241f','#3e2c25'].map(hex), CS_TOP = ['#0a0706','#0e0a09','#130e0c'].map(hex), CS_RIM = hex('#4a3a34');
function buildCastle(seed){
  const R = rng(seed), rr = (a,c) => a + R()*(c-a), ri = (a,c) => Math.floor(rr(a,c+1));
  const T = 16, MW = 18, MH = 18, PITCH = 6, N = MW*PITCH + 4, S = N*T/2;
  const sc = baseScene('castle', 'El castillo de Urr', -S, -S, S, S);
  sc.kind = 'raid'; sc.darkness = .97; sc.seed = seed; sc.lvl = 6;
  const grid = new Uint8Array(N*N);
  const origin = (cx, cy) => ({x: 2 + cx*PITCH, y: 2 + cy*PITCH});          // el suelo de la celda ocupa +1..+4 (4×4 casillas)
  const carveRect = (x0,y0,w,h) => { for(let y=y0;y<y0+h;y++) for(let x=x0;x<x0+w;x++) if(x>=1 && y>=1 && x<N-1 && y<N-1) grid[y*N+x] = 1; };
  const toW = (tx,ty) => ({x:-S + tx*T + T/2, y:-S + ty*T + T/2});
  const cellC = (cx, cy) => { const o = origin(cx, cy); return {x:-S + (o.x+3)*T, y:-S + (o.y+3)*T}; };
  // --- laberinto (recorrido en profundidad) ---
  const BX0 = 5, BX1 = 12, BY1 = 2, START = {cx0:7, cx1:10, cy:MH-1};
  const isBoss = (cx, cy) => cx >= BX0 && cx <= BX1 && cy <= BY1;
  const vis = Array.from({length:MH}, () => new Uint8Array(MW)), E = Array.from({length:MH}, () => new Uint8Array(MW)), Sx = Array.from({length:MH}, () => new Uint8Array(MW));
  for(let cy=0; cy<=BY1; cy++) for(let cx=BX0; cx<=BX1; cx++) vis[cy][cx] = 1;
  const link = (cx,cy,nx,ny) => { if(nx > cx) E[cy][cx] = 1; else if(nx < cx) E[ny][nx] = 1; else if(ny > cy) Sx[cy][cx] = 1; else Sx[ny][nx] = 1; };
  const linked = (cx,cy,nx,ny) => nx > cx ? E[cy][cx] : nx < cx ? E[ny][nx] : ny > cy ? Sx[cy][cx] : Sx[ny][nx];
  const dirs = [[1,0],[0,1],[-1,0],[0,-1]];
  const stack = [[8, MH-1]]; vis[MH-1][8] = 1;
  while(stack.length){
    const [cx, cy] = stack[stack.length-1];
    const nb = dirs.map(([dx,dy]) => [cx+dx, cy+dy]).filter(([x,y]) => x>=0 && y>=0 && x<MW && y<MH && !vis[y][x]);
    if(!nb.length){ stack.pop(); continue; }
    const [nx, ny] = nb[Math.floor(R()*nb.length)];
    link(cx, cy, nx, ny); vis[ny][nx] = 1; stack.push([nx, ny]);
  }
  link(8, BY1, 8, BY1+1);                                               // entrada de la sala del trono
  for(let cx=START.cx0; cx<START.cx1; cx++) link(cx, START.cy, cx+1, START.cy);     // salón de entrada
  const openCount = (cx,cy) => (E[cy][cx]||0) + (cx>0 ? E[cy][cx-1] : 0) + (Sx[cy][cx]||0) + (cy>0 ? Sx[cy-1][cx] : 0);
  // cámaras de 2×2 celdas
  const chambers = [];
  for(let tries=0; tries<200 && chambers.length<9; tries++){
    const cx = ri(0, MW-2), cy = ri(BY1+2, MH-3);
    if(isBoss(cx,cy) || isBoss(cx+1,cy) || isBoss(cx,cy+1) || isBoss(cx+1,cy+1)) continue;
    if(chambers.some(c => Math.abs(c.cx-cx) < 3 && Math.abs(c.cy-cy) < 3)) continue;
    if(cy >= MH-3 && cx+1 >= START.cx0-1 && cx <= START.cx1+1) continue;
    chambers.push({cx, cy});
    link(cx,cy,cx+1,cy); link(cx,cy+1,cx+1,cy+1); link(cx,cy,cx,cy+1); link(cx+1,cy,cx+1,cy+1);
  }
  // bucles: se abren muros en callejones sin salida y al azar
  for(let cy=BY1+1; cy<MH; cy++) for(let cx=0; cx<MW; cx++) if(openCount(cx,cy) === 1 && R() < .3){
    const nb = dirs.map(([dx,dy]) => [cx+dx, cy+dy]).filter(([x,y]) => x>=0 && y>BY1 && x<MW && y<MH && !linked(cx,cy,x,y));
    if(nb.length){ const [nx,ny] = nb[Math.floor(R()*nb.length)]; link(cx,cy,nx,ny); }
  }
  for(let i=0;i<28;i++){ const cx = ri(0,MW-2), cy = ri(BY1+1,MH-2), [dx,dy] = R()<.5 ? [1,0] : [0,1]; if(!isBoss(cx+dx,cy+dy)) link(cx,cy,cx+dx,cy+dy); }
  // --- excavar ---
  for(let cy=0; cy<MH; cy++) for(let cx=0; cx<MW; cx++){
    if(isBoss(cx,cy)) continue;
    const o = origin(cx,cy); carveRect(o.x+1, o.y+1, 4, 4);
    if(E[cy][cx]) carveRect(o.x+5, o.y+1, 2, 4);
    if(Sx[cy][cx]) carveRect(o.x+1, o.y+5, 4, 2);
  }
  const bo = origin(BX0, 0), bw = (BX1-BX0+1)*PITCH - 2, bh = (BY1+1)*PITCH - 2;
  carveRect(bo.x+1, bo.y+1, bw, bh);                                       // sala del trono
  { const o = origin(8, BY1); carveRect(o.x+1, o.y+5, 4, 2); }
  // --- suelo y muros ---
  const tile = (tx,ty) => (tx<0||ty<0||tx>=N||ty>=N) ? 0 : grid[ty*N+tx];
  const tAt = (x,y) => tile(Math.floor((x+S)/T), Math.floor((y+S)/T));
  sc.solidAt = (x,y) => !tAt(x,y);
  sc.ground = (x,y) => {
    const tx = Math.floor((x+S)/T), ty = Math.floor((y+S)/T), lx = (x+S) - tx*T, ly = (y+S) - ty*T;
    if(tile(tx,ty)){
      if(lx===0 || ly===0) return CS_MORTAR;
      let t = tq(hash(tx,ty,601)*.5 + vnoise(x/5,y/5,602)*.3 + .1, x, y, 4);
      if(!tile(tx,ty-1) && ly < 5) t = Math.max(0, t-2);
      if(hash(x,y,603) > .996) return CS_FLOOR[3];
      return CS_FLOOR[t];
    }
    if(tile(tx,ty+1)){
      if(ly < 2) return CS_RIM;
      const row = Math.floor(ly/4), off = (row&1)*4;
      if(ly%4===0 || (lx+off)%8===0) return CS_MORTAR;
      return CS_BRICK[tq(hash(Math.floor((lx+off)/8)+tx*3, row+ty*5, 604)*.7 + .15 - ly/T*.3, x, y, 3)];
    }
    const nearFloor = tile(tx-1,ty)||tile(tx+1,ty)||tile(tx,ty-1);
    if(nearFloor && ((tile(tx-1,ty) && lx < 2) || (tile(tx+1,ty) && lx > T-3) || (tile(tx,ty-1) && ly < 2))) return CS_RIM;
    return CS_TOP[tq(vnoise(x/6,y/6,605)*.7 + hash(x,y,606)*.3, x, y, 3)];
  };
  const freeAt = (x,y,rad) => !blocked(sc, x, y, rad+4);
  // --- entrada ---
  const sp = cellC(8, MH-1);
  sc.spawn = {x:sp.x, y:sp.y};
  sc.horse = {x:sp.x - 62, y:sp.y + 6, dir:1};
  addCollider(sc, {t:'r', x:sc.horse.x-24, y:sc.horse.y-7, w:46, h:12});
  sc.lights.push({x:sp.x, y:sp.y-20, r:150, a:.7, warm:true, flick:.08});
  sc.decals = []; sc.wisps = []; sc.houses = [];
  // --- sala del trono de Urr ---
  const rx = -S + (bo.x+1)*T, ry = -S + (bo.y+1)*T, rw = bw*T, rh = bh*T;
  sc.bossRoom = {x:rx, y:ry, w:rw, h:rh};
  propSprite(sc, ART.throne, rx + rw/2, ry + 56, {t:'r', x:rx + rw/2 - 20, y:ry + 42, w:40, h:14}, [20,4]);
  for(const sx of [-1,1]){
    const c = {x:rx + rw/2 + sx*70, y:ry + 62};
    const cd = propSprite(sc, ART.candelabra, c.x, c.y, {t:'c', x:c.x, y:c.y-2, r:5});
    cd.draw = function(){ drawSP(ART.candelabra, c.x, c.y); for(const dx of [-5,0,5]) drawFlames(c.x+dx, c.y-26 + (dx ? 2 : 0), .2); };
    sc.lights.push({x:c.x, y:c.y-24, r:130, a:.8, warm:true, flick:.15});
  }
  sc.lights.push({x:rx + 60, y:ry + rh - 40, r:120, a:.6, warm:true, flick:.15}, {x:rx + rw - 60, y:ry + rh - 40, r:120, a:.6, warm:true, flick:.15});
  sc.bossSpawn = {x:rx + rw/2, y:ry + 150};
  // --- celdas: decoración, trampas, cofres y monstruos ---
  const cells = [];
  for(let cy=BY1+1; cy<MH; cy++) for(let cx=0; cx<MW; cx++){
    const inStart = cy===START.cy && cx >= START.cx0-1 && cx <= START.cx1+1;
    cells.push({cx, cy, c:cellC(cx,cy), n:openCount(cx,cy), inStart, dist:Math.hypot(cx-8, cy-(MH-1))/MH});
  }
  const addChest = (p, rare) => { if(!p) return; const ch = {x:p.x, y:p.y, rare, open:false}; ch.col = addCollider(sc, {t:'r', x:p.x-9, y:p.y-8, w:18, h:8}); sc.chests.push(ch); };
  const deadEnds = cells.filter(q => q.n===1 && !q.inStart);
  sc.traps = [];
  for(const q of cells){
    if(q.inStart || (q.cy >= MH-2 && q.cx >= START.cx0-2 && q.cx <= START.cx1+2)) continue;
    const {x, y} = q.c;
    // decoración
    if(R() < .22){ const sx = R()<.5 ? -1 : 1, sy = R()<.5 ? -1 : 1, bx = x + sx*24, by = y + sy*22;
      if(freeAt(bx, by, 7)){ const b2 = propSprite(sc, ART.brazier, bx, by, {t:'c', x:bx, y:by-3, r:6}); b2.draw = function(){ drawSP(ART.brazier, bx, by); drawFlames(bx, by-11, .5); }; sc.lights.push({x:bx, y:by-14, r:115, a:.75, warm:true, flick:.15}); } }
    else if(R() < .25){ const bx = x + (R()<.5 ? -24 : 24), by = y + (R()<.5 ? -22 : 22); if(freeAt(bx, by, 7)) propSprite(sc, R()<.5 ? ART.crate : ART.barrel, bx, by, R()<.5 ? {t:'r', x:bx-7, y:by-9, w:15, h:10, low:true} : {t:'c', x:bx, y:by-2, r:6, low:true}, [7,2]); }
    if(R() < .5) sc.decals.push({img:ART.bones.c, x:x + rr(-20,20) - 7, y:y + rr(-18,18) - 4});
    // trampas
    if(R() < .16 + q.dist*.2){
      const kind = R();
      const closed = [];
      if(!(E[q.cy][q.cx])) closed.push([1,0]); if(!(q.cx>0 && E[q.cy][q.cx-1])) closed.push([-1,0]);
      if(!(Sx[q.cy][q.cx])) closed.push([0,1]); if(!(q.cy>0 && Sx[q.cy-1][q.cx])) closed.push([0,-1]);
      if(kind < .42) sc.traps.push({kind:'spikes', x, y, off:R()*4});
      else if(kind < .7) sc.traps.push({kind:'vent', x:x + (R()<.5 ? -18 : 18), y:y + (R()<.5 ? -14 : 14), off:R()*4});
      else if(closed.length){ const [dx,dy] = closed[Math.floor(R()*closed.length)]; sc.traps.push({kind:'turret', x:x + dx*28, y:y + dy*26, dx:-dx, dy:-dy, cd:R()*2}); }
      else sc.traps.push({kind:'spikes', x, y, off:R()*4});
    }
  }
  // cámaras: pilares en el centro (la unión de las 4 celdas) y cofres
  for(const ch of chambers){
    const a = cellC(ch.cx, ch.cy), z = cellC(ch.cx+1, ch.cy+1), mx = (a.x+z.x)/2, my = (a.y+z.y)/2;
    if(R() < .7) addChest({x:mx + rr(-22,22), y:my + rr(-18,18)}, R() < .45);
    sc.lights.push({x:mx, y:my-6, r:130, a:.55, warm:true, flick:.12});
  }
  // cofres en los callejones sin salida
  for(const q of deadEnds) if(R() < .7) addChest({x:q.c.x + rr(-10,10), y:q.c.y + 4}, R() < .35);
  addChest({x:rx + 90, y:ry + rh - 40}, true); addChest({x:rx + rw - 90, y:ry + rh - 40}, true);
  // portales en celdas lejanas
  const far = cells.filter(q => !q.inStart).sort((p,q2) => q2.dist - p.dist);
  for(const q of far){
    if(sc.portals.length >= 2) break;
    if(sc.portals.every(o => Math.hypot(o.x-q.c.x, o.y-q.c.y) > 600) && freeAt(q.c.x, q.c.y, 22)){ sc.portals.push({x:q.c.x, y:q.c.y, t:0}); sc.lights.push({x:q.c.x, y:q.c.y-8, r:120, a:.9, warm:false, flick:.1, col:'portal'}); }
  }
  // jaulas (cuando las mascotas de esta expedición estén aprobadas)
  const pets = shuffle(petsOfExp(6).filter(id => R() < CAGE_CHANCE[PETS[id].rarity]), R), cagePool = shuffle(deadEnds.concat(chambers.map(ch => ({c:cellC(ch.cx, ch.cy)}))), R);
  for(const id of pets){
    const q = cagePool.shift(); if(!q) break;
    const p = {x:q.c.x, y:q.c.y - 4};
    const cage = {x:Math.round(p.x), y:Math.round(p.y), pet:null, open:false};
    cage.col = addCollider(sc, {t:'r', x:cage.x-12, y:cage.y-8, w:24, h:8});
    sc.cages.push(cage);
  }
  // guardia de Urr
  const types = [['orc',.36],['orcarcher',.22],['orcshaman',.18],['orcbrute',.16],['orc',.08]];
  const pickType = () => { let t = R(); for(const [k,w] of types){ if((t -= w) <= 0) return k; } return 'orc'; };
  const mkPack = (n, hot) => {
    const type = pickType(), pack = []; let hasRare = false;
    for(let i=0;i<n;i++){
      const roll = R(); let rar = roll < (hot ? .1 : .06) ? 'rare' : roll < (hot ? .42 : .32) ? 'magic' : 'normal';
      if(rar==='rare' && hasRare) rar = 'magic'; if(rar==='rare') hasRare = true;
      pack.push({type: R() < .7 ? type : pickType(), rarity: rar});
    }
    return pack;
  };
  for(const q of cells){
    if(q.inStart || Math.hypot(q.c.x-sp.x, q.c.y-sp.y) < 260) continue;
    if(R() < .1) sc.monsterSpawns.push({x:q.c.x, y:q.c.y, pack:mkPack(2 + Math.floor(R()*2), false)});
  }
  for(const ch of chambers){ const a = cellC(ch.cx, ch.cy), z = cellC(ch.cx+1, ch.cy+1); sc.monsterSpawns.push({x:(a.x+z.x)/2, y:(a.y+z.y)/2, pack:mkPack(3 + Math.floor(R()*2), true)}); }
  for(let i=0;i<4;i++){ const px = rx + rw*(.15 + .7*R()), py = ry + rh*(.55 + .35*R()); if(freeAt(px, py, 12)) sc.monsterSpawns.push({x:px, y:py, pack:[{type: i%2 ? 'orcbrute' : 'orc', rarity:'magic'}]}); }
  return sc;
}

// decoración de suelo (matojos y flores)
const DECO = {
  tuft:  [["a...a",".a.a.","b.a.b",".bab."], ["..a..","a.a.a",".bab.","..b.."]],
  flower:[".c.","cyc",".c.",".b."],
};
const decoCache = {};
function decoSprite(kind, v){
  const key = kind+v; if(decoCache[key]) return decoCache[key];
  const map = {a:'#3d4434', b:'#181b13', c:['#5a5470','#55606a','#6a5048'][v%3], y:'#8a8060'};
  const rows = kind==='tuft' ? DECO.tuft[v%2] : DECO.flower;
  return decoCache[key] = pixBake(rows[0].length, rows.length, (x,y)=>map[rows[y][x]]||null, null);
}
