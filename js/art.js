'use strict';
// =====================================================================
//  Arte: héroe, armas, iconos, slimes, props, NPCs, cofres, jaulas
// =====================================================================

// ---------- Héroe (mirando a la derecha; se voltea en tiempo real) ----------
const PAL = {
  k:OUT,
  H:'#1b1b20', h:'#2b2b32', j:'#3f3f48',                 // capucha
  f:'#0a090c', s:'#d4ab80', S:'#a97d55', D:'#6e4a30',     // cara
  a:'#3a2618', w:'#ece4d4', e:'#2a1c14',                 // pelo y ojos
  c:'#1d1e25', C:'#2d2e38',                              // bufanda
  t:'#2c303c', T:'#3c4253', u:'#1e2129', U:'#2a2d37',    // túnica y capa
  b:'#5a3d26', B:'#7a5636', d:'#38261a',                 // cuero
  g:'#b8903e', G:'#e6c76e',                              // hebillas
  p:'#1b1c23', P:'#2a2b35',                              // pantalón
  o:'#4a3324', O:'#6b4a32',                              // botas
  y:'#ffb347', Y:'#fff1b8',                              // llama del farol
};
const PAL_HIT = Object.assign({}, PAL, {b:'#8a6040', B:'#b08458', d:'#5a3d26'});
const PAL_OFF = Object.assign({}, PAL, {y:'#3a2a1a', Y:'#4a3a28'});  // farol apagado

const SPR = {
  hood: {ox:-9, oy:-40, rows:[
    "........kkkkkk........",
    "......kkhhhhhhkk......",
    "....kkhhjjjjhhhhk.....",
    "..kkhhhjjhhhhhhhhk....",
    "kkhhhhhhhhhhhhhhhhhk..",
    ".kHHhhhhhhhhhhhhhhhhk.",
    "..kkHHhhhhhhkkkkkkkhhk",
    "....kHHhhhkaaaaaaaakhk",
    "....kHHhhkaDSDDSSDDSk.",
    "....kHHhhkaDSweSSweSk.",
    "....kHHhhkaDSssSssSsk.",
    "....kHHhhkDDSsssDDsk..",
    ".....kHHhhkDSSsssSk...",
    ".....kHHHhhhkDSSSkck..",
    "......kkHHhhhhcCCCCk..",
    "........kkkkkkkkkkk...",
  ]},
  torso: {ox:-10, oy:-26, rows:[
    "......kccCCCCk......",
    ".....kcccCCCCCk.....",
    "....kTtccccccctk....",
    "...kTTttBtttttTTk...",
    "...kuTttbBtttttTk...",
    "...kuTtttbBttttTk...",
    "...kuttttttbBtttk...",
    "...kutttttttbBttk...",
    "...kdbbbbbbbgGbbk...",
    "...kdbbbbbbbggbbk...",
    "...kutdbbdtttttuk...",
    "...kutdBbdtttttuk...",
    "...kutddddttttuk....",
    "...kuttttuttuttk....",
    "....kutk.kutk.kk....",
    "....kk....kk........",
  ]},
  leg: {ox:0, oy:-11, rows:[
    ".kpPk..", ".kpPk..", ".kppk..", ".kppk..", ".kppk..", ".kppk..",
    "kOOOk..", "kOoook.", "kOooook", "kddddk.", ".kkkkk.",
  ]},
  pack: {ox:-13, oy:-25, rows:[
    "..kkkkk..", ".kBBBBBk.", "kBbbbbbdk", "kbkkkkkdk", "kbkgGkbdk", "kbbkkkbdk", "kbbbbbbdk",
    "kBbbbbbdk", "kbbbbbbdk", "kbbbbbddk", "kdbbbbddk", ".kdddddk.", "..kkkkk..",
  ]},
  cloak: {ox:-14, oy:-24, rows:[
    "......kk..", ".....kuuk.", "....kuuuk.", "...kuuuuk.", "...kuUuuk.", "..kuuUuuk.", "..kuuuUuk.",
    ".kuuuuuuk.", ".kuuUuuuk.", "kuuuuUuuk.", "kuuukuuuk.", "kuuk.kuuk.", "kuk..kuk..", "kk...kk...", "k.........",
  ]},
  glove: {ox:-3, oy:-3, rows:[".kkkk.", "kBBbbk", "kBbbbk", "kbbbdk", "kddddk", ".kkkk."]},
  bigGlove: {ox:-4, oy:-4, rows:["..kkkk..", ".kBBBbk.", "kBBbbbbk", "kBbbbbbk", "kbbbbbdk", "kbbbbddk", ".kddddk.", "..kkkk.."]},
  lantern: {ox:-2, oy:-5, rows:["..k..", ".kdk.", "kkkkk", "kbyBk", "kyYyk", "kyYyk", "kbybk", "kkkkk", ".kdk."]},
};
for(const k in SPR){
  SPR[k].img = bakeRows(SPR[k].rows, PAL);
  SPR[k].hit = bakeRows(SPR[k].rows, PAL_HIT);
  SPR[k].off = bakeRows(SPR[k].rows, PAL_OFF);
}
function spr(name, x, y, variant){
  const s = SPR[name];
  b.drawImage(variant==='hit' ? s.hit : variant==='off' ? s.off : variant==='silver' ? s.silver : variant==='silveroff' ? s.silveroff : s.img, Math.round(x + s.ox), Math.round(y + s.oy));
}

// ---------- Armas y escudo (vistos en el personaje) ----------
const WOOD = ['#3a2618','#5a3d26','#7a5636','#96704a'];
const IRON = ['#2e3036','#4a4d55','#6c7079','#9aa0aa'];
const STONE = ['#3e3c38','#57544e','#76726a','#9a958b'];
const ART = {};
ART.buckler = SP(paintSprite(11,11,[
  {e:[5.5,5.5,5.5,5.5], c:IRON.slice(1)},
  {e:[5.5,5.5,4.3,4.3], c:WOOD, tex:31},
  {l:[5.5,1.5,5.5,9.5,1], c:WOOD[0]},
  {e:[5.5,5.5,1.6,1.6], c:IRON.slice(1)},
]), 5, 5);
ART.bucklerFront = ART.buckler;
ART.stoneHand = SP(paintSprite(4,4,[{e:[2,2,2,2], c:STONE}]), 2, 2);

// ---------- Iconos de objetos (12×12, para inventario y suelo) ----------
const ICON_ROWS = {
  stone:{pal:{j:'#a8a49c', h:'#7e7a72', H:'#57534d'}, rows:[
    "............", "............", "....kkkk....", "...kjjhhk...", "..kjhhhhhk..", "..khhhhhHk..",
    "..khhhhHHk..", "...kHHHHk...", "....kkkk....", "............"]},
  stick:{pal:{B:'#96704a', b:'#6a4a2e', d:'#3a2618'}, rows:[
    "..........kk", ".........kBk", "........kBbk", ".......kBbk.", "......kBbk..", ".....kBbkk..",
    "....kBbkBk..", "...kBbk.k...", "..kBbk......", ".kBbk.......", "kbdk........", "kkk........."]},
  coin:{pal:{G:'#ffe08a', g:'#d4a83a', d:'#9a7420'}, rows:[
    "............", "....kkkk....", "...kGGggk...", "..kGGgggdk..", "..kGgGgggk..", "..kGgGggdk..",
    "..kggggddk..", "...kgdddk...", "....kkkk....", "............"]},
  buckler:{pal:{m:'#6c7079', M:'#9aa0aa', B:'#96704a', b:'#6a4a2e', d:'#3a2618', G:'#c8ccd4', g:'#8a8e98'}, rows:[
    "...kkkkkk...", "..kmMMMMmk..", ".kmBBbbbbmk.", "kmBbbbbbbdmk", "kmBbbkkbbdmk", "kmbbkGgkbdmk",
    "kmbbkggkbdmk", "kmbbbkkbddmk", ".kmbbbbbddk.", "..kmdddddmk.", "...kkkkkk..."]},
  potion:{pal:{w:'#d8e4ea', d:'#7a5636', R:'#ff6a6a', r:'#d02a3a', q:'#8a1424'}, rows:[
    "....kkkk....", "....kddk....", "....kwwk....", "...kkwwkk...", "..kwRrrrrk..", ".kwRRrrrrrk.",
    ".kRRrrrrrrk.", ".kRrrrrrrqk.", ".krrrrrrqqk.", "..krrrqqqk..", "...kkkkkk..."]},
  oilflask:{pal:{w:'#e8e0c8', Y:'#fff4a0', y:'#f0c030', o:'#b07a10', d:'#7a5636'}, rows:[
    "....kkkk....", "....kddk....", "...kkwwkk...", "...kwYwwk...", "..kwYyyyyk..", ".kwYyyyyyyk.",
    ".kYyyyyyyok.", ".kyyyyyyook.", ".kyyyyyoook.", "..kyyyoook..", "...kkkkkk..."]},
  mushroom:{pal:{R:'#ff6060', r:'#c82a2a', q:'#7a1414', w:'#f5f0e0', c:'#e8dcc0', C:'#b8a888'}, rows:[
    "...kkkkkk...", "..kRRwRrrk..", ".kRwRRrrwrk.", "kRRRrrwrrrqk", "kRwrrrrrwqqk", ".kkkkkkkkkk.",
    "....kccck...", "....kcCck...", "....kcCck...", "...kccCCck..", "...kkkkkkk.."]},
  chalice:{pal:{W:'#ffffff', w:'#c8ccd4', s:'#8a8e98'}, rows:[
    "..kkkkkkkk..", "..kWwwwwsk..", "..kWwwwssk..", "..kwwwwssk..", "...kwwssk...", "....kwsk....",
    ".....kk.....", "....kwsk....", "...kWwssk...", "..kkkkkkkk.."]},
  ring:{pal:{B:'#7ab8ff', b:'#3a6ad0', G:'#ffe08a', g:'#c8962e'}, rows:[
    "....kkkk....", "...kbBBbk...", "....kbbk....", "...kkGGkk...", "..kGgkkgGk..", "..kGk..kgk..",
    "..kGk..kgk..", "..kgGkkGgk..", "...kkggkk...", "....kkkk...."]},
  watch:{pal:{G:'#ffe08a', g:'#c8962e', d:'#8a6420', w:'#f0ece0'}, rows:[
    ".....kk.....", "....kGGk....", "...kkkkkk...", "..kGgggggk..", ".kGkwwwwkgk.", ".kGwwkwwwgk.",
    ".kgwwkkwwgk.", ".kgwwwwwwgk.", ".kgkwwwwkdk.", "..kgddddddk.", "...kkkkkk..."]},
  necklace:{pal:{w:'#f5f0ea', R:'#d03a5a', r:'#8a1a32'}, rows:[
    "k..........k", "kw........wk", ".kw......wk.", ".kw......wk.", "..kw....wk..", "...kww.wwk..",
    "....kwRwk...", ".....kRk....", ".....krk....", "......k....."]},
};
const ICONS = {};
for(const k in ICON_ROWS){ const d = ICON_ROWS[k]; ICONS[k] = bakeRows(d.rows, Object.assign({k:OUT}, d.pal)); }

// ---------- Slimes ----------
const SLIME_PAL = {
  small:['#2b4220','#3f5e2c','#57793a','#719449','#d4e6a6'],
  big:  ['#2a2038','#3e3254','#574a72','#726490','#d6caf0'],
};
const SLIME_FR = [[1.25,.72],[1.12,.86],[1,1],[.9,1.14],[.8,1.28]];
const slimeCache = {};
function slimeFrame(kind, fi, flash){
  const key = kind+fi+(flash?'f':'');
  if(slimeCache[key]) return slimeCache[key];
  const tones = SLIME_PAL[kind], [sx,sy] = SLIME_FR[fi], big = kind==='big';
  const w = Math.round((big?30:22)*sx), h = Math.round((big?23:17)*sy), seed = big?3:4;
  return slimeCache[key] = pixBake(w,h,(x,y)=>{
    const t=(y+.5)/h, u=(x+.5-w/2)/(w/2);
    const hw = t<.7 ? Math.sqrt(Math.max(0,1-((.7-t)/.7)**2)) : (t>.88 ? 1-(t-.88)*2.2 : 1);
    if(Math.abs(u)>hw) return null;
    if(flash) return '#ffffff';
    if(((u+.38)/.2)**2 + ((t-.3)/.1)**2 < 1) return tones[4];
    let L = .62 - u*.28 - (t-.55)*.7 - (t>.84?.25:0);
    if(t>.35 && t<.8 && hash(x,y,seed)>.965) L += .3;
    return tones[tq(L,x,y,4)];
  });
}

// ---------- Vegetación y rocas (noche eterna) ----------
const NPAL = {
  leaf:['#121711','#192018','#212a1f','#2b3528','#38452f'], trunk:['#17110c','#221a12','#2e231a'],
  rock:['#1e1e21','#28282c','#333338','#414147'], moss:['#24301f','#2e3b27'], berry:'#5a2a2a',
};
function bakeBlob(w,h,circles,tones,o={}){
  return pixBake(w,h,(x,y)=>{
    let best=-1, bc=null;
    for(const c of circles){ const d=Math.hypot(x+.5-c[0],y+.5-c[1])/c[2]; if(d<1 && 1-d>best){ best=1-d; bc=c; } }
    if(!bc) return null;
    const nx=(x+.5-bc[0])/bc[2], ny=(y+.5-bc[1])/bc[2];
    let L = .5 - nx*.25 - ny*.4 + best*.2 + (hash(x>>1,y>>1,o.seed||0)-.5)*(o.tex||0);
    L -= Math.max(0, y/h-.55)*(o.ao||0);
    if(o.berry && L>.35 && hash(x,y,(o.seed||0)+9)>.965) return o.berry;
    return tones[tq(L,x,y,tones.length)];
  });
}
function bakeTree(seed, forceDead=false){
  const R2 = rng(seed*97+13);
  const w = 54+Math.floor(R2()*14), h = 46+Math.floor(R2()*10), circ = [[w/2, h*.58, w*.36]];
  for(let i=0;i<6;i++){ const a=R2()*Math.PI*2, d=R2()*.32; circ.push([w/2+Math.cos(a)*w*d, h*.5+Math.sin(a)*h*d*.9, w*(.16+R2()*.12)]); }
  const dead = forceDead || R2() < .25;   // algunos árboles secos (todos en el cementerio)
  return {
    canopy: dead ? null : bakeBlob(w,h,circ,NPAL.leaf,{tex:.35,ao:.5,seed}),
    trunk: pixBake(10,24,(x,y)=>{
      if(y<20 && (x<1||x>8)) return null;
      let t = x<=3?2:x<=6?1:0; if(hash(x,y>>1,seed+11)>.8) t=Math.max(0,t-1);
      return NPAL.trunk[t];
    }),
    branches: dead ? paintSprite(36,30,[
      {l:[18,30,18,10,4], c:NPAL.trunk}, {l:[18,16,7,4,2.5], c:NPAL.trunk}, {l:[18,13,30,2,2.5], c:NPAL.trunk},
      {l:[10,7,4,6,1.5], c:NPAL.trunk}, {l:[26,6,33,8,1.5], c:NPAL.trunk},
    ]) : null,
  };
}
function bakeRock(seed, r, pts){
  const R2 = rng(seed*31+7), w=Math.round(r*2.2), h=Math.round(r*1.6), poly=pts.map(([px,py])=>[w/2+px, h*.55+py*1.1]);
  const inPoly=(x,y)=>{ let c=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ const [xi,yi]=poly[i],[xj,yj]=poly[j];
    if((yi>y)!==(yj>y) && x<(xj-xi)*(y-yi)/(yj-yi)+xi) c=!c; } return c; };
  const crack = new Set(); let cx=w*(.35+R2()*.3), cy=h*.3;
  for(let i=0;i<r;i++){ crack.add(Math.round(cx)+','+Math.round(cy)); cx+=R2()*2-1; cy+=R2()<.7?1:0; }
  return pixBake(w,h,(x,y)=>{
    if(!inPoly(x+.5,y+.5)) return null;
    const nx=(x-w/2)/(w/2), ny=(y-h/2)/(h/2);
    const L = .58 - nx*.22 - ny*.42 + (vnoise(x/4,y/4,seed)-.5)*.4 - (y>h*.8?.15:0);
    if(crack.has(x+','+y)) return NPAL.rock[0];
    if(ny<-.3 && vnoise(x/3,y/3,seed+1)>.55) return NPAL.moss[L>.55?1:0];
    return NPAL.rock[tq(L,x,y,4,.6)];
  });
}
function bakeBush(seed){ return bakeBlob(26,18,[[8,11,7],[18,11,7],[13,7,7.5]],NPAL.leaf.slice(0,4),{tex:.4,ao:.4,seed,berry:NPAL.berry}); }

// ---------- Props del pueblo ----------
ART.barrel = SP(paintSprite(12,15,[
  {e:[6,8.5,6,6.5], c:WOOD, tex:5},
  {r:[0,4,12,1], c:IRON[1]}, {r:[0,12,12,1], c:IRON[1]},
  {e:[6,2.5,5.5,2.2], c:['#4a3220','#6b4a32','#8a6444']},
  {e:[6,2.5,3.5,1.2], c:'#2a1c12'},
]), 6, 14);
ART.crate = SP(paintSprite(15,14,[
  {r:[0,0,15,4], c:['#5a3d26','#7a5636','#96704a'], tex:6},
  {r:[0,4,15,10], c:WOOD.slice(0,3), tex:7},
  {l:[1.5,5,13.5,13,1.4], c:WOOD[0]}, {l:[13.5,5,1.5,13,1.4], c:WOOD[0]},
  {r:[0,4,15,1], c:WOOD[0]},
]), 7, 13);
ART.fenceH = [0,1,2].map(v => SP(paintSprite(18,12,[
  {r:[0,0,3,12], c:WOOD.slice(0,3)}, {r:[15,v===2?3:0,3,v===2?9:12], c:WOOD.slice(0,3)},
  v!==1 ? {r:[0,3,18,2], c:WOOD.slice(1)} : {l:[0,3,12,6,2], c:WOOD.slice(1)},
  {r:[0,7,18,2], c:WOOD.slice(0,3)},
]), 9, 11));
ART.fenceV = SP(paintSprite(4,14,[{r:[0,0,4,14], c:WOOD.slice(0,3)}]), 2, 13);
ART.well = SP(paintSprite(28,28,[
  {r:[2,3,3,18], c:WOOD.slice(0,3)}, {r:[23,3,3,18], c:WOOD.slice(0,3)},
  {e:[14,21,13,6.5], c:STONE, tex:12},
  {e:[14,20,9.5,4], c:['#070b0d','#0c1418','#14222a']},
  {r:[1,1,26,3], c:WOOD.slice(1)},
  {l:[14,4,14,13,1], c:'#8a7a5a'},
  {r:[12,12,5,4], c:WOOD.slice(0,3)},
]), 14, 26);
ART.grave = [0,1].map(v => SP(paintSprite(11,14,v ? [
  {e:[5.5,4.5,5.5,4.5], c:STONE, tex:21}, {r:[0,4,11,10], c:STONE, tex:22},
  {p:[[5,3,'#2a2826'],[5,4,'#2a2826'],[5,5,'#2a2826'],[5,6,'#2a2826'],[4,4,'#2a2826'],[6,4,'#2a2826']]},
] : [
  {r:[4,0,3,14], c:STONE}, {r:[1,3,9,3], c:STONE},
]), 5, 13));
ART.hay = SP(paintSprite(20,14,[
  {e:[10,8,10,6], c:['#5a4a22','#7a6430','#9a8040','#b89c58'], tex:9},
  {r:[2,6,16,1], c:'#4a3a1a'},
]), 10, 13);
ART.campfire = SP(paintSprite(20,10,[
  {e:[3,6,2.5,2], c:STONE}, {e:[17,6,2.5,2], c:STONE}, {e:[10,8.5,3,1.8], c:STONE}, {e:[6,8,2,1.6], c:STONE}, {e:[14,8,2,1.6], c:STONE},
  {l:[3,7,17,3,3], c:WOOD.slice(0,3)}, {l:[3,3,17,7,3], c:WOOD.slice(0,3)},
]), 10, 9);
ART.torch = SP(paintSprite(5,12,[{r:[1,3,3,9], c:WOOD.slice(0,3)}, {r:[0,2,5,2], c:IRON.slice(0,2)}]), 2, 11);
ART.bed = SP(paintSprite(24,14,[
  {r:[0,2,24,12], c:['#3a2e1e','#54452c','#6e5c3a'], tex:3},
  {e:[5,7,4,3.5], c:['#6a6050','#8a8068','#a89e84']},
  {r:[10,3,13,10], c:['#4a2020','#6a2e2e','#8a3c3c'], tex:4},
]), 12, 13);

// ---------- Cofres ----------
function bakeChest(rare, open){
  const wd = rare ? ['#1e1a34','#2e2856','#423a7a'] : WOOD.slice(0,3);
  const bd = rare ? ['#8a6420','#c8962e','#ffe08a'] : IRON.slice(0,3);
  const sh = open ? [
    {r:[0,0,18,5], c:wd.map(c=>c), L:-.25},
    {r:[0,5,18,9], c:wd, tex:8},
    {r:[1,4,16,3], c:'#0a0806'},
    {r:[3,0,2,14], c:bd}, {r:[13,0,2,14], c:bd},
  ] : [
    {r:[0,5,18,9], c:wd, tex:8},
    {r:[0,0,18,6], c:wd.slice(1).concat(rare?['#5a50a0']:['#96704a']), tex:9},
    {r:[0,5,18,1], c:wd[0]},
    {r:[3,0,2,14], c:bd}, {r:[13,0,2,14], c:bd},
    {r:[8,4,3,4], c:['#8a6420','#c8962e','#ffe08a']},
  ];
  return SP(paintSprite(18,14,sh), 9, 13);
}
ART.chest = {normal:[bakeChest(false,false), bakeChest(false,true)], rare:[bakeChest(true,false), bakeChest(true,true)]};

// ---------- Jaula (fondo + barrotes delante de la mascota) ----------
ART.cageBack = SP(paintSprite(26,26,[
  {r:[0,20,26,6], c:WOOD.slice(0,3), tex:14},
  {r:[1,2,24,18], c:'#0c0a0c'},
]), 13, 25);
function bakeCageFront(open){
  const sh = [{r:[0,0,26,3], c:WOOD.slice(0,3)}, {r:[0,20,26,2], c:WOOD.slice(1,3)}];
  for(let x=1; x<26; x+=4){
    if(open && x>6 && x<20) continue;
    sh.push({r:[x,3,2,17], c:IRON.slice(1)});
  }
  if(open) sh.push({l:[7,3,1,14,2], c:IRON.slice(1)}, {l:[19,3,25,14,2], c:IRON.slice(1)});
  return SP(paintSprite(26,22,sh), 13, 21);
}
ART.cageFront = [bakeCageFront(false), bakeCageFront(true)];
ART.lock = SP(paintSprite(5,6,[{r:[0,2,5,4], c:['#8a6420','#c8962e','#ffe08a']}, {r:[1,0,3,2], c:IRON.slice(1)}]), 2, 5);

// ---------- Juan (anciano de la guarida, mirando a la derecha) ----------
function bakeJuan(f){
  const robe = ['#2a2030','#3e3248','#544660','#6a5a78'], skin = ['#8a5a40','#b07a58','#d09a74','#e8b890'];
  const beard = ['#8a8a88','#b8b8b4','#dcdcd8','#f4f4f0'], by = f ? 1 : 0;
  return SP(paintSprite(26,44,[
    {l:[22,6,23,43,2.2], c:WOOD.slice(0,3)},                     // bastón
    {e:[22,5,2,2], c:['#2a4a5a','#3a7a8a','#6ac0d0']},          // gema del bastón
    {r:[6,30,13,13], c:robe.slice(0,3)},                         // bajo de la túnica
    {e:[12,27+by*.5,8,10], c:robe, tex:41},                       // cuerpo
    {r:[5,23,15,2], c:['#5a3d26','#7a5636']},                    // cinturón de cuerda
    {e:[20,23,2.5,2.5], c:skin.slice(0,3)},                      // mano en el bastón
    {l:[14,17,19,23,3.5], c:robe.slice(0,3)},                    // brazo
    {e:[12,12+by,6.2,6.2], c:skin},                              // cabeza
    {e:[8,11+by,3,4.5], c:beard.slice(0,3)},                     // pelo lateral
    {e:[11,6+by,4,1.6], c:beard.slice(1)},                       // pelo de arriba
    {poly:[[10,15+by],[19,14+by],[17,22+by],[14,25+by],[11,21+by]], c:beard},  // barba
    {e:[16,16+by,2.5,1.2], c:beard.slice(2)},                    // bigote
    {p:[[15,11+by,'#1a1210'],[16,11+by,'#1a1210'],[14,9+by,beard[2]],[15,9+by,beard[2]],[16,9+by,beard[2]],[18,13+by,skin[1]]]},
    {r:[7,42,5,2], c:'#2a1c12'}, {r:[13,42,5,2], c:'#2a1c12'},  // pies
  ]), 12, 43);
}
ART.juan = [bakeJuan(0), bakeJuan(1)];

// ---------- Caballo de Juan (mirando a la derecha) ----------
function bakeHorse(f){
  const coat = ['#2e1a10','#4a2c1a','#6a4028','#8a5636'], mane = ['#0e0b09','#1c1612','#2c241e'];
  const hd = f ? 2 : 0, tl = f ? 1 : -1;
  return SP(paintSprite(46,36,[
    {l:[9,22,8,33,3], c:coat.slice(0,2)}, {l:[29,22,30,33,3], c:coat.slice(0,2)},   // patas lejanas
    {l:[8,12,3+tl,27,3.5], c:mane},                                                // cola
    {e:[20,17,13,7.5], c:coat, tex:51},                                            // cuerpo
    {l:[29,15,36,6+hd,7], c:coat},                                                 // cuello
    {e:[39,7+hd,5.5,3.8], c:coat},                                                 // cabeza
    {e:[43,9+hd,3,2.6], c:['#3a2014','#5a3422','#704430']},                        // hocico
    {l:[36,3+hd,37,0+hd,2], c:coat.slice(1)},                                      // oreja
    {l:[30,11,35,2+hd,3], c:mane},                                                 // crin
    {e:[21,11,6,3], c:['#20120c','#3a2216','#5a3422']},                            // silla
    {r:[16,12,10,5], c:['#4a1616','#6e2222','#8e3030']},                           // manta
    {l:[13,22,12,33,3], c:coat.slice(1)}, {l:[26,22,26,33,3], c:coat.slice(1)},    // patas cercanas
    {r:[11,33,3,2], c:'#16100c'}, {r:[25,33,3,2], c:'#16100c'}, {r:[7,33,3,2], c:'#16100c'}, {r:[29,33,3,2], c:'#16100c'},
    {p:[[40,6+hd,'#0a0606'],[44,9+hd,'#1a0e0a']]},
  ]), 22, 35);
}
ART.horse = [bakeHorse(0), bakeHorse(1)];

// ---------- Trapis, el mercader (mirando a la derecha) ----------
const SKIN = ['#8a5a40','#b07a58','#d09a74','#e8b890'];
function bakeTrapis(f){
  const coat = ['#1e3a24','#2e5a34','#3e7a44','#5a9a5a'], hat = ['#3a2418','#5a3a24','#7a5232'], by = f ? 1 : 0;
  return SP(paintSprite(28,44,[
    {r:[0,15,8,17], c:WOOD.slice(0,3), tex:44}, {r:[1,14,6,2], c:WOOD.slice(1)},          // mochila de mercancías
    {e:[2,13,2,2], c:['#6a1e1e','#a83232']}, {e:[5,12,1.5,2.5], c:['#2a4a6a','#4a7aa8']},  // cacharros asomando
    {r:[9,34,4,8], c:['#1e1a16','#2e2820']}, {r:[15,34,4,8], c:['#1e1a16','#2e2820']},
    {r:[8,41,6,2], c:'#2a1c12'}, {r:[14,41,6,2], c:'#2a1c12'},
    {e:[14,27+by*.5,9,10], c:coat, tex:45},                                                // abrigo
    {e:[16,29+by*.5,5,6.5], c:['#8a7a5a','#b8a47a','#d8c89a']},                            // camisa y barriga
    {r:[5,29,19,2], c:['#3a2418','#5a3a24']}, {r:[13,29,3,2], c:['#c8962e','#ffe08a']},  // cinturón
    {e:[21,32,2.6,3], c:['#5a3a20','#8a6030','#b08040']}, {p:[[21,32,'#ffe08a']]},         // bolsa de monedas
    {l:[10,20,8,30,4], c:coat.slice(0,3)}, {e:[8,31,2.5,2.5], c:SKIN},                     // brazo
    {e:[15,13+by,5.6,5.6], c:SKIN},                                                         // cabeza
    {e:[20,13+by,1.8,1.6], c:SKIN.slice(0,3)},                                             // nariz
    {l:[15,16+by,21,16+by,1.8], c:['#3a2414','#5a3a20']},                                   // bigote
    {p:[[18,12+by,'#1a1210'],[17,10+by,'#5a3a20'],[18,10+by,'#5a3a20']]},
    {e:[15,8+by,11,2.4], c:hat}, {r:[10,2+by,10,6], c:hat}, {r:[10,6+by,10,1], c:['#6a1e1e','#a83232']},
    {l:[18,3+by,24,0+by,1.4], c:['#a89030','#e8d060']},                                    // pluma
  ]), 14, 43);
}
ART.trapis = [bakeTrapis(0), bakeTrapis(1)];
ART.stall = SP(paintSprite(44,26,[
  {r:[3,12,3,14], c:WOOD.slice(0,3)}, {r:[38,12,3,14], c:WOOD.slice(0,3)},
  {r:[0,8,44,5], c:WOOD.slice(1), tex:46},
  {r:[0,13,44,7], c:['#4a1414','#6a1e1e','#8a2a2a'], tex:47},
  {p:[...Array(11)].map((_,i)=>[i*4+2, 20, '#4a1414'])},
  {r:[3,2,4,6], c:['#6a1e1e','#c83232','#ff6a6a']}, {r:[4,0,2,2], c:WOOD[1]},             // poción
  {r:[10,3,5,5], c:['#8a6010','#e8b020','#fff09a']}, {r:[11,1,3,2], c:WOOD[1]},            // aceite
  {e:[20,5,3.5,2.2], c:['#7a1414','#c82a2a','#ff6060']}, {r:[19,6,2,2], c:'#e8dcc0'},      // seta
  {e:[29,6,4,2.5], c:['#8a6420','#c8962e','#ffe08a']}, {e:[30,4,2.5,1.5], c:['#c8962e','#ffe08a']}, // monedas
  {r:[35,1,7,7], c:WOOD.slice(0,3), tex:48},                                                // caja
]), 22, 25);

// ---------- El druida (mirando a la derecha) ----------
function bakeDruid(f){
  const robe = ['#1a2418','#283a22','#384e2e','#4a6638'], by = f ? 1 : 0;
  const beard = ['#9a9a90','#c8c8c0','#ececE4'.toLowerCase(),'#ffffff'];
  return SP(paintSprite(30,46,[
    {l:[24,8,25,45,2.2], c:WOOD.slice(0,3)},                                  // bastón
    {l:[24,8,20,2,1.4], c:WOOD.slice(1)}, {l:[24,8,28,2,1.4], c:WOOD.slice(1)}, {l:[21,4,19,1,1.2], c:WOOD.slice(1)},
    {e:[24,8,2,2], c:['#2a7a3a','#7ae09a','#d8ffd8']},                       // brote luminoso
    {r:[7,30,14,14], c:robe.slice(0,3), tex:49},
    {e:[13,28+by*.5,9,10.5], c:robe, tex:50},
    {p:[[6,21,'#5a8a3a'],[7,20,'#7aae4a'],[19,21,'#5a8a3a'],[20,20,'#7aae4a'],[9,34,'#5a8a3a'],[16,38,'#5a8a3a']]},
    {e:[22,25,2.5,2.5], c:SKIN}, {l:[16,19,21,25,3.5], c:robe.slice(0,3)},    // mano y brazo
    {e:[13,13+by,7.2,7.2], c:robe.slice(1), tex:51},                          // capucha
    {e:[15.5,14+by,4.2,4.6], c:SKIN},                                         // cara
    {poly:[[12,16+by],[19,16+by],[18,24+by],[15,29+by],[12,23+by]], c:beard}, // barba larga
    {p:[[16,13+by,'#9ae8a0'],[18,13+by,'#9ae8a0'],[17,15+by,SKIN[1]]]},       // ojos verdes
    {p:[[9,6+by,'#7aae4a'],[11,5+by,'#5a8a3a'],[13,5+by,'#7aae4a'],[15,5+by,'#5a8a3a'],[17,6+by,'#7aae4a']]}, // corona de hojas
    {r:[8,44,5,2], c:'#1a140e'}, {r:[14,44,5,2], c:'#1a140e'},
  ]), 13, 45);
}
ART.druid = [bakeDruid(0), bakeDruid(1)];
ART.cauldron = SP(paintSprite(28,20,[
  {e:[4,16,3,2], c:STONE}, {e:[24,16,3,2], c:STONE}, {e:[14,18,4,1.6], c:STONE},
  {e:[14,11,10,7], c:IRON.slice(0,3)},
  {e:[14,6,8,2.2], c:['#1a5a2a','#3aa04a','#8ae89a']},
  {r:[3,5,22,2], c:IRON.slice(1)},
]), 14, 19);

// =====================================================================
//  Expedición 2: equipo de cuero, armas nuevas, no-muertos y cementerio
// =====================================================================
const LEATHER = {L:'#6a4a2e', l:'#8a6440', d:'#3e2a1a'};
const STUD = {normal:'#9aa0aa', magic:'#7ab0ff', rare:'#ffd040'};
Object.assign(ICON_ROWS, {
  sword:{pal:{w:'#c8ccd4', s:'#7a7e88', r:'#8a5a3a', g:'#a8803a', b:'#5a3d26'}, rows:[
    "..........kk", ".........kwk", "........kwsk", ".......kwrk.", "......kwsk..", ".....krsk...",
    "..k.kwsk....", "..kgkssk....", "...kgkk.....", "..kbkgk.....", ".kbk.kk.....", "kkk........."]},
  bow:{pal:{B:'#96704a', b:'#6a4a2e', w:'#e8e0c8'}, rows:[
    "....kkk.....", "...kBBk.....", "..kBk.kw....", "..kBk..w....", ".kBk...w....", ".kbk...w....",
    ".kBk...w....", ".kBk...w....", "..kBk..w....", "..kBk.kw....", "...kBBk.....", "....kkk....."]},
  helmet:{pal:{L:'#7a5636', l:'#96704a', d:'#3a2618', s:'#9aa0aa'}, rows:[
    "............", "............", "...kkkkkk...", "..kLlllLLk..", ".kLlLLLLLLk.", ".kLLLLLLLLk.",
    ".kddsddsddk.", ".kL......Lk.", ".kk......kk."]},
  chestarmor:{pal:{L:'#7a5636', l:'#96704a', d:'#3a2618', s:'#9aa0aa'}, rows:[
    "..kk....kk..", ".kLLk..kLLk.", "kLLLLkkLLLLk", "kLlLLLLLLLLk", "kLlLsLLsLLLk", ".kLLLLLLLLk.",
    ".kLLsLLsLLk.", ".kLLLLLLLLk.", ".kddddddddk.", ".kLLLLLLLLk.", "..kkkkkkkk.."]},
  gloves:{pal:{L:'#7a5636', d:'#3a2618', s:'#9aa0aa'}, rows:[
    "....kk.kk...", "...kLLkLLk..", "..kkLLkLLk..", ".kLkLLLLLk..", ".kLLLLLLLk..", "..kLLLLLLk..",
    "..kLLLLLk...", "...kddddk...", "...kssssk...", "...kkkkkk..."]},
  boots:{pal:{L:'#7a5636', l:'#96704a', d:'#2a1c12', s:'#9aa0aa'}, rows:[
    "..kkk.......", "..kLLk......", "..kLsk......", "..kLLk......", "..kLLLk.....", "..kLlLLkk...",
    "..kLllLLLk..", "..kddddddk..", "...kkkkkk..."]},
});
for(const k of ['sword','bow','helmet','chestarmor','gloves','boots']){ const d = ICON_ROWS[k]; ICONS[k] = bakeRows(d.rows, Object.assign({k:OUT}, d.pal)); }

// ---------- capas de armadura sobre el sprite del héroe (por rareza) ----------
const ARMOR_OV = {
  helmet: {ox:-9, oy:-40, rows:[
    "........kkkkkk........",
    "......kkLLLLLLkk......",
    "....kkLLllllLLLLk.....",
    "..kkLLllLLLLLLLLLk....",
    "kkLLLLLLLLLLLLLLLLLk..",
    ".kddddddsddddddsdddk..",
  ]},
  chest: {ox:-10, oy:-26, rows:[
    "....................",
    "....................",
    "....kLlLLLLLLLlk....",
    "...kLLlLLsLLLLLLk...",
    "...kdLLLLLLsLLLLk...",
    "...kdLLsLLLLLLLLk...",
    "...kdLLLLLLLsLLLk...",
    "...kdLLLLLLLLLLdk...",
  ]},
  boot: {ox:0, oy:-11, rows:[
    ".......", ".......", ".......", ".......",
    ".kLLk..", ".kLsk..", "kLLLk..", "kLlllk.", "kLllllk", "kddddk.", ".kkkkk.",
  ]},
  glove: {ox:-3, oy:-3, rows:[".kkkk.", "kllLLk", "klLsLk", "kLLLdk", "kddddk", ".kkkk."]},
  bigGlove: {ox:-4, oy:-4, rows:["..kkkk..", ".klllLk.", "kllLLLLk", "klLsLsLk", "kLLLLLdk", "kLLLLddk", ".kddddk.", "..kkkk.."]},
};
for(const k in ARMOR_OV){
  const o = ARMOR_OV[k]; o.img = {};
  for(const r in STUD) o.img[r] = bakeRows(o.rows, Object.assign({k:OUT, s:STUD[r]}, LEATHER, r==='rare' ? {d:'#5a3a1a'} : {}));
}
function armorOv(name, rarity, x, y){ const o = ARMOR_OV[name]; b.drawImage(o.img[rarity||'normal'] || o.img.unique || o.img.normal, Math.round(x + o.ox), Math.round(y + o.oy)); }

// ---------- no-muertos (mirando a la derecha; 0/1 = andar, 2 = preparando el golpe) ----------
const BONE = ['#7a7468','#aaa496','#d6d0c0','#f2eee2'], RUST = ['#4a2e20','#7a4a30','#9a9690'];
const MON_SHAPES = {
  skeleton: {w:28, h:34, ax:11, ay:33, shapes(f){
    const s = f===1 ? 2 : -2;
    return [
      {l:[8,13,5,21,1.8], c:BONE.slice(0,3)},                                   // brazo trasero
      {l:[10,22,10+s,32,2], c:BONE.slice(0,3)}, {l:[12,22,12-s,32,2], c:BONE.slice(1)},  // piernas
      {e:[11,22,4,1.8], c:BONE},                                                // pelvis
      {l:[11,13,11,22,2], c:BONE.slice(0,3)},                                   // columna
      {r:[7,13,9,6], c:BONE}, {p:[[8,14,'#2a2426'],[8,16,'#2a2426'],[14,14,'#2a2426'],[14,16,'#2a2426'],[11,15,'#2a2426']]},
      {e:[12,7,5,5], c:BONE}, {r:[10,10,6,2], c:BONE.slice(1)},                 // cráneo y mandíbula
      {p:[[13,6,'#120e10'],[14,6,'#120e10'],[16,6,'#120e10'],[13,7,'#ff4030'],[16,7,'#ff4030'],[11,11,'#120e10'],[13,11,'#120e10'],[15,11,'#120e10']]},
      f===2 ? {l:[14,14,17,7,1.8], c:BONE.slice(1)} : {l:[14,14,18,19,1.8], c:BONE.slice(1)},   // brazo con espada
      f===2 ? {l:[17,7,22,0,2.2], c:RUST} : {l:[18,19,26,13,2.2], c:RUST},                       // espada oxidada
      f===2 ? {r:[15,7,4,1], c:'#5a3a20'} : {r:[17,17,2,4], c:'#5a3a20'},
    ];
  }},
  zombie: {w:26, h:34, ax:11, ay:33, shapes(f){
    const sk = ['#2e3a28','#4a5e3e','#6a8058','#86a070'], cl = ['#201c26','#342e3e','#4a4258'], s = f===1 ? 2 : -2;
    return [
      f===2 ? {l:[10,14,17,6,3], c:sk.slice(0,3)} : {l:[10,15,19,16,3], c:sk.slice(0,3)},        // brazo trasero
      {l:[9,23,9+s,32,2.6], c:['#1e1a16','#2e2820']}, {l:[13,23,13-s,32,2.6], c:['#2a241e','#3a3228']},
      {poly:[[6,13],[17,13],[18,24],[15,22],[13,25],[10,22],[7,25]], c:cl, tex:61},           // ropa rota
      {p:[[9,17,sk[2]],[10,17,sk[2]],[14,20,sk[1]]]},                                          // piel asomando
      {e:[12,8,5,5.2], c:sk},                                                                   // cabeza
      {p:[[13,7,'#e8e070'],[15,7,'#e8e070'],[14,10,'#1a0e0a'],[15,10,'#1a0e0a'],[16,10,'#1a0e0a'],[10,4,'#2a2018'],[12,3,'#2a2018']]},
      f===2 ? {l:[13,14,21,7,3], c:sk.slice(1)} : {l:[13,15,22,15,3], c:sk.slice(1)},          // brazo delantero
    ];
  }},
  ghost: {w:24, h:30, ax:12, ay:29, shapes(f){
    const g = ['#5a6a8a','#8a9aba','#bccae4','#eef4ff'], w = f===1 ? 1 : f===2 ? 0 : -1;
    return [
      {poly:[[3,12],[21,12],[19+w,24],[16,21],[13-w,28],[10,21],[6+w,25]], c:g, tex:62},
      {e:[12,11,8.5,9], c:g},
      f===2 ? {l:[4,13,0,6,2.5], c:g.slice(1)} : {l:[4,14,1,18,2.5], c:g.slice(1)},
      f===2 ? {l:[20,13,24,6,2.5], c:g.slice(1)} : {l:[20,14,23,18,2.5], c:g.slice(1)},
      {p:[[9,9,'#10142a'],[10,9,'#10142a'],[9,10,'#10142a'],[10,10,'#10142a'],[14,9,'#10142a'],[15,9,'#10142a'],[14,10,'#10142a'],[15,10,'#10142a'],
          [11,14,'#10142a'],[12,14,'#10142a'], ...(f===2 ? [[11,15,'#10142a'],[12,15,'#10142a'],[11,16,'#10142a'],[12,16,'#10142a']] : [])]},
    ];
  }},
};
const MON_ART = {};
for(const id in MON_SHAPES){
  const d = MON_SHAPES[id];
  MON_ART[id] = {fr:[0,1,2].map(f => SP(paintSprite(d.w, d.h, d.shapes(f)), d.ax, d.ay))};
  MON_ART[id].flash = MON_ART[id].fr.map(s => {
    const c = document.createElement('canvas'); c.width = s.c.width; c.height = s.c.height;
    const g = c.getContext('2d'); g.drawImage(s.c,0,0); g.globalCompositeOperation='source-in'; g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height);
    return {c, ax:s.ax, ay:s.ay};
  });
}
const MON_COLORS = {skeleton:['#d6d0c0','#aaa496','#f2eee2'], zombie:['#4a5e3e','#6a8058','#342e3e'], ghost:['#bccae4','#eef4ff','#8a9aba']};

// ---------- props del cementerio ----------
const MOSS = ['#22301e','#2e3e26'];
ART.tombs = [
  SP(paintSprite(12,16,[{e:[6,5,6,5], c:STONE, tex:71}, {r:[0,5,12,11], c:STONE, tex:72}, {p:[[3,12,MOSS[1]],[4,13,MOSS[0]],[8,14,MOSS[1]]]},
                        {r:[3,5,6,1], c:'#2a2826'}, {r:[3,8,6,1], c:'#2a2826'}]), 6, 15),
  SP(paintSprite(10,18,[{r:[3,0,4,18], c:STONE}, {r:[0,4,10,3], c:STONE}, {p:[[4,10,MOSS[1]],[5,15,MOSS[0]]]}]), 5, 17),
  SP(paintSprite(14,10,[{poly:[[0,10],[0,3],[5,0],[9,4],[14,2],[14,10]], c:STONE, tex:73}, {p:[[6,7,MOSS[1]],[10,8,MOSS[0]]]}]), 7, 9),
  SP(paintSprite(10,16,[{r:[4,0,2,16], c:WOOD.slice(0,3)}, {r:[0,4,10,2], c:WOOD.slice(0,3)}]), 5, 15),
  SP(paintSprite(10,26,[{poly:[[3,26],[3,6],[5,0],[7,6],[7,26]], c:STONE, tex:74}, {r:[1,22,8,4], c:STONE}, {p:[[4,18,MOSS[1]],[5,12,MOSS[0]]]}]), 5, 25),
];
ART.openGrave = SP(paintSprite(14,22,[
  {r:[0,0,14,22], c:['#120e0a','#1a140e']}, {r:[1,1,12,20], c:'#060404'},
  {e:[17,6,4,3], c:['#2a2018','#3a2c20','#4a3a2a']},
]), 7, 21);
ART.dirtPile = SP(paintSprite(14,8,[{e:[7,5,7,3.5], c:['#2a2018','#3a2c20','#4a3a2a'], tex:75}]), 7, 7);
ART.fenceIron = SP(paintSprite(18,16,[
  {r:[0,4,2,12], c:IRON.slice(0,3)}, {r:[16,4,2,12], c:IRON.slice(0,3)},
  ...[4,8,12].map(x => ({r:[x,3,1,13], c:IRON.slice(0,2)})),
  ...[0,4,8,12,16].map(x => ({p:[[x+ (x===0||x===16?0:0),2,IRON[2]],[x+1,2,IRON[2]],[x, 1, IRON[3]]]})),
  {r:[0,6,18,1], c:IRON.slice(1,3)}, {r:[0,12,18,1], c:IRON.slice(1,3)},
]), 9, 15);
ART.statue = SP(paintSprite(22,38,[
  {r:[3,30,16,8], c:STONE, tex:76},
  {poly:[[8,30],[7,16],[11,12],[15,16],[14,30]], c:STONE, tex:77},
  {e:[11,9,3.5,3.5], c:STONE},
  {poly:[[7,15],[0,10],[2,20],[7,22]], c:STONE.slice(0,3), tex:78}, {poly:[[15,15],[22,10],[20,20],[15,22]], c:STONE.slice(0,3), tex:79},
  {p:[[10,24,MOSS[1]],[12,27,MOSS[0]],[5,32,MOSS[1]]]},
]), 11, 37);
ART.sarcophagus = SP(paintSprite(26,16,[
  {r:[0,5,26,11], c:STONE, tex:80}, {r:[0,0,26,6], c:STONE.slice(1), tex:81},
  {r:[11,1,4,4], c:'#2a2826'}, {r:[12,0,2,6], c:'#2a2826'},
]), 13, 15);
ART.altar = SP(paintSprite(30,16,[
  {r:[2,6,26,10], c:STONE, tex:82}, {r:[0,3,30,4], c:STONE.slice(1)},
  {r:[4,0,2,3], c:'#e8e0c8'}, {r:[24,0,2,3], c:'#e8e0c8'}, {r:[13,0,4,3], c:['#6a1e1e','#a83232']},
]), 15, 15);
ART.pew = SP(paintSprite(30,10,[{r:[0,0,30,4], c:WOOD.slice(0,3), tex:83}, {r:[0,4,30,3], c:WOOD.slice(0,2)}, {r:[1,7,3,3], c:WOOD[0]}, {r:[26,7,3,3], c:WOOD[0]}]), 15, 9);
ART.candles = SP(paintSprite(10,8,[{r:[1,3,2,5], c:'#d8d0b8'}, {r:[5,1,2,7], c:'#e8e0c8'}, {r:[8,4,2,4], c:'#d8d0b8'}]), 5, 7);

// ---------- flechas, esqueleto arquero y Gonzalo el profesor ----------
ICON_ROWS.arrows = {pal:{w:'#c8a878', s:'#d8dce4', f:'#e8e0c8', b:'#6a4a2e'}, rows:[
  ".s....s....s", "sss..sss..ss", ".w....w...w.", ".w....w..w..", ".w...w...w..", ".w...w..w...",
  "..w.w...w...", "..wbbbbbw...", "..bbbbbbb...", "..wbbbbbw...", ".ff..f..ff..", "f.f.fff.f.f."]};
ICONS.arrows = bakeRows(ICON_ROWS.arrows.rows, Object.assign({k:OUT}, ICON_ROWS.arrows.pal));

MON_SHAPES.skelarcher = {w:28, h:34, ax:11, ay:33, shapes(f){
  const s = f===1 ? 2 : -2, wd = ['#3a2618','#5a3d26','#7a5636'];
  const bow = f===2
    ? [{l:[21,9,23,14,1.6], c:wd}, {l:[23,14,23,20,1.6], c:wd}, {l:[23,20,21,25,1.6], c:wd},
       {l:[21,9,16,17,1], c:'#e8e0c8'}, {l:[16,17,21,25,1], c:'#e8e0c8'}, {l:[16,17,27,17,1], c:'#c8a878'}, {p:[[27,17,'#d8dce4']]}]
    : [{l:[17,10,19,14,1.6], c:wd}, {l:[19,14,19,20,1.6], c:wd}, {l:[19,20,17,25,1.6], c:wd}, {l:[17,10,17,25,1], c:'#e8e0c8'}];
  return [
    {r:[4,11,3,9], c:['#3a2618','#5a3d26']}, {p:[[4,10,'#c8a878'],[5,9,'#c8a878'],[6,10,'#c8a878']]},   // carcaj
    {l:[8,13,5,21,1.8], c:BONE.slice(0,3)},
    {l:[10,22,10+s,32,2], c:BONE.slice(0,3)}, {l:[12,22,12-s,32,2], c:BONE.slice(1)},
    {e:[11,22,4,1.8], c:BONE}, {l:[11,13,11,22,2], c:BONE.slice(0,3)},
    {r:[7,13,9,6], c:BONE}, {p:[[8,14,'#2a2426'],[8,16,'#2a2426'],[14,14,'#2a2426'],[14,16,'#2a2426'],[11,15,'#2a2426']]},
    {e:[12,7,5,5], c:BONE}, {r:[10,10,6,2], c:BONE.slice(1)},
    {p:[[13,6,'#120e10'],[14,6,'#120e10'],[16,6,'#120e10'],[13,7,'#ffb030'],[16,7,'#ffb030'],[11,11,'#120e10'],[13,11,'#120e10'],[15,11,'#120e10']]},
    {r:[8,3,9,2], c:['#2a2018','#3e3024']},                                                    // capucha rota
    f===2 ? {l:[14,14,21,17,1.8], c:BONE.slice(1)} : {l:[14,14,17,19,1.8], c:BONE.slice(1)},
    ...bow,
  ];
}};
MON_ART.skelarcher = {fr:[0,1,2].map(f => SP(paintSprite(28, 34, MON_SHAPES.skelarcher.shapes(f)), 11, 33))};
MON_ART.skelarcher.flash = MON_ART.skelarcher.fr.map(s => {
  const c = document.createElement('canvas'); c.width = s.c.width; c.height = s.c.height;
  const g = c.getContext('2d'); g.drawImage(s.c,0,0); g.globalCompositeOperation='source-in'; g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height);
  return {c, ax:s.ax, ay:s.ay};
});
MON_COLORS.skelarcher = MON_COLORS.skeleton;

function bakeGonzalo(f){
  const robe = ['#161a2e','#242a48','#343e66','#485684'], by = f ? 1 : 0, hair = ['#7a7a78','#a8a8a4','#d0d0cc'];
  return SP(paintSprite(26,44,[
    {r:[6,30,13,13], c:robe.slice(0,3)},
    {e:[12,27+by*.5,8,10], c:robe, tex:91},
    {r:[11,18,2,22], c:['#8a6420','#c8962e']},                                       // banda dorada
    {r:[15,22,9,7], c:['#3a1e14','#5a2e1e','#7a4028']}, {r:[16,23,7,5], c:['#d8d0b8','#f0e8d0']},  // libro abierto
    {l:[14,18,18,24,3.5], c:robe.slice(0,3)}, {e:[19,25,2.2,2.2], c:SKIN},
    {e:[12,12+by,6,6], c:SKIN},
    {e:[9,9+by,3.5,4], c:hair}, {e:[12,6+by,5,2], c:hair.slice(1)},                   // pelo canoso
    {e:[13,17+by,4,2.6], c:hair},                                                     // barba corta
    {p:[[14,11+by,'#c8ccd4'],[15,11+by,'#1a1210'],[16,11+by,'#c8ccd4'],[17,11+by,'#c8ccd4'],[18,11+by,'#1a1210'],[19,11+by,'#c8ccd4'],
        [14,12+by,'#c8ccd4'],[16,12+by,'#c8ccd4'],[17,12+by,'#c8ccd4'],[19,12+by,'#c8ccd4'],[18,14+by,SKIN[1]]]},   // gafas redondas
    {r:[7,42,5,2], c:'#1a140e'}, {r:[13,42,5,2], c:'#1a140e'},
  ]), 12, 43);
}
ART.gonzalo = [bakeGonzalo(0), bakeGonzalo(1)];
ART.lectern = SP(paintSprite(18,24,[
  {r:[7,10,4,14], c:WOOD.slice(0,3)}, {r:[3,22,12,2], c:WOOD.slice(0,2)},
  {poly:[[0,4],[18,2],[18,10],[0,12]], c:WOOD.slice(1), tex:92},
  {poly:[[2,4],[9,3],[9,9],[2,10]], c:['#c8c0a8','#e8e0c8']}, {poly:[[9,3],[16,2],[16,8],[9,9]], c:['#d8d0b8','#f0e8d0']},
]), 9, 23);
ART.bookshelf = SP(paintSprite(30,34,[
  {r:[0,0,30,34], c:WOOD.slice(0,3), tex:93},
  {r:[2,2,26,8], c:'#120c08'}, {r:[2,13,26,8], c:'#120c08'}, {r:[2,24,26,8], c:'#120c08'},
  ...[0,1,2].flatMap(row => [...Array(7)].map((_,i) => ({r:[3+i*3.6, 3+row*11, 3, 7 - (i%3===1 ? 1 : 0)], c:[['#6a1e1e','#a83232'],['#1e3a6a','#3a5aa8'],['#2e5a2a','#4a8a3e'],['#6a5a1e','#a88e32']][(i+row)%4]}))),
]), 15, 33);

// =====================================================================
//  Expedición 3: la cripta de la condesa
// =====================================================================
Object.assign(ICON_ROWS, {
  ironshield:{pal:{m:'#4a4d55', M:'#9aa0aa', i:'#6c7079', I:'#848a94', g:'#c8962e'}, rows:[
    ".kkkkkkkkkk.", "kMMMMMMMMMmk", "kMIIIIiiiimk", "kMIIIgIiiimk", "kMIIgggiiimk", "kMIIIgIiiimk",
    ".kMIIIiiimk.", ".kMIIiiiimk.", "..kMIiiimk..", "...kMiimk...", "....kmmk....", ".....kk....."]},
  firearrows:{pal:{w:'#c8a878', y:'#ffd040', r:'#ff6a1a', b:'#6a4a2e', f:'#e8e0c8'}, rows:[
    ".y....y....y", "yry..yry..yr", ".w....w...w.", ".w....w..w..", ".w...w...w..", ".w...w..w...",
    "..w.w...w...", "..wbbbbbw...", "..bbbbbbb...", "..wbbbbbw...", ".ff..f..ff..", "f.f.fff.f.f."]},
  mace:{pal:{M:'#9aa0aa', m:'#5a5d64', s:'#c8ccd4', b:'#5a3d26', B:'#7a5636'}, rows:[
    ".......kkk..", "......ksMsk.", ".....kMsMmMk", ".....kMMmmMk", "......kmMmk.", ".....kBkkk..",
    "....kBk.....", "...kBk......", "..kBk.......", ".kbk........", "kbk.........", "kk.........."]},
  axe:{pal:{s:'#d8dce4', M:'#9aa0aa', m:'#5a5d64', b:'#5a3d26', B:'#7a5636'}, rows:[
    "......kkk...", ".....ksMMk..", "....ksMMmmk.", "....kMMkmmk.", ".....kkBkmk.", ".....kBk.kk.",
    "....kBk.....", "...kBk......", "..kBk.......", ".kbk........", "kbk.........", "kk.........."]},
  dagger:{pal:{w:'#d8dce4', s:'#8a8e98', g:'#c8962e', b:'#3a2618'}, rows:[
    "..........kk", ".........kwk", "........kwsk", ".......kwsk.", "......kwsk..", "...k.kwsk...",
    "...kgkssk...", "....kgkk....", "...kbkgk....", "..kbk.kk....", "..kk........"]},
  veil:{pal:{L:'#b8aed8', l:'#e8e0ff', d:'#6a5a8a', s:'#ff8a3a'}, rows:[
    "............", "....kkkk....", "...kllllk...", "..klLLLLlk..", ".klLsLLsLlk.", ".kLLLLLLLLk.",
    "kLLlLLLLlLLk", "kLlLLLLLLlLk", "kLkLLLLLLkLk", ".k.kLLLLk.k.", "....kkkk...."]},
  claw:{pal:{L:'#5a4a7a', d:'#2a2040', s:'#ff8a3a', w:'#e8e0ff'}, rows:[
    "..w.w.w.....", "..kwkwkw....", "...kLkLkk...", "..kkLLkLLk..", ".kLkLLLLLk..", ".kLLLLLLLk..",
    "..kLLLLLLk..", "..kLLLLLk...", "...kddddk...", "...kssssk...", "...kkkkkk..."]},
  aegis:{pal:{m:'#2a2040', M:'#ffd040', i:'#3e2e5a', I:'#5a4a7a', g:'#ff8a3a'}, rows:[
    ".kkkkkkkkkk.", "kMMMMMMMMMMk", "kMIIIIiiiiMk", "kMIIIgIiiiMk", "kMIIgggiiiMk", "kMIgggggiiMk",
    ".kMIIgIiiMk.", ".kMIIIiiiMk.", "..kMIiiiMk..", "...kMiiMk...", "....kMMk....", ".....kk....."]},
  lament:{pal:{w:'#e8e0ff', s:'#9a8ac8', g:'#ff8a3a', b:'#2a2040', v:'#c8a0ff'}, rows:[
    "..........kk", ".........kwk", "........kwvk", ".......kwsk.", "......kwvk..", "...k.kwsk...",
    "...kgkssk...", "....kgkk....", "...kbkgk....", "..kbk.kk....", "..kk........"]},
});
Object.assign(ICON_ROWS, {
  flamethrower:{pal:{t:'#8a2a1a', T:'#c8483a', M:'#b8bcc6', m:'#6c7079', r:'#ff6a1a', y:'#ffd040', b:'#5a3d26'}, rows:[
    "............", "..kkkk......", ".kttTTk.....", ".ktTTTkkkk..", ".ktTTTkMMMkr", ".kttTTkmmmky", "..kttk..kkr.", "..kTtk...kb.", "...kk....kb.", "............"]},
  explosivearrows:{pal:{w:'#c8a878', y:'#ff5a3a', r:'#7a1010', b:'#6a4a2e', f:'#e8e0c8'}, rows:ICON_ROWS.firearrows.rows},
  bandage:{pal:{w:'#f0ece0', s:'#c8c0a8', r:'#c82a2a'}, rows:[
    "............", "...kkkkkk...", "..kwwwwwwk..", ".kwwwwrrwwsk", ".kwwrrrrrrsk", ".kwwwwrrwwsk", ".kwwwwrrwwsk", ".ksssswwsssk", "..kssssssk..", "...kkkkkk..."]},
  cookie:{pal:{c:'#d8a860', C:'#b07a38', d:'#5a3418'}, rows:[
    "............", "....kkkk....", "..kkccccckk.", ".kccdccccCck", ".kcccccdccCk", "kccdccccccCk", "kcccccdcccCk", ".kcccccccCCk", ".kcdccccCCk.", "..kkcCCCkk..", "....kkkk...."]},
  superpotion:{pal:{w:'#d8e4ea', d:'#7a5636', R:'#ffb0ff', r:'#c030e0', q:'#6a1090'}, rows:ICON_ROWS.potion.rows},
  greataxe:{pal:{s:'#d8dce4', M:'#9aa0aa', m:'#5a5d64', b:'#5a3d26', B:'#7a5636'}, rows:[
    "..kkk.kkk...", ".ksMMkMMmk..", "ksMMMkMMmmk.", "kMMMmkkmmmk.", ".kkmkBkmkk..", "...kkBkk....", "....kBk.....", "...kBk......", "..kBk.......", ".kbk........", "kbk.........", "kk.........."]},
  firesword:{pal:{w:'#ffe08a', s:'#ff7a20', r:'#ff4a10', g:'#c8962e', b:'#5a3d26'}, rows:ICON_ROWS.sword.rows},
  icesword:{pal:{w:'#f0fcff', s:'#6ab8e8', r:'#a8e8ff', g:'#9aa8c8', b:'#3a4a6a'}, rows:ICON_ROWS.sword.rows},
  lightningsword:{pal:{w:'#fffbd0', s:'#e8c020', r:'#fff070', g:'#8a6420', b:'#3a2a18'}, rows:ICON_ROWS.sword.rows},
});
Object.assign(ICON_ROWS, {
  anvil:{pal:{M:'#9aa0aa', m:'#c8ccd4', w:'#5a3d26'}, rows:[
    "............", ".kkkkkkkkkkk", "kMMMMMMMMMMk", "kmMMMMMMMmk.", ".kkkMMMMkkk.", "....kMMk....", "....kMMk....", "...kMMMMk...", "..kMMMMMMk..", "..kkkkkkkk.."]},
  urrhelm:{pal:{L:'#6c7079', l:'#c8ccd4', d:'#3a3d44', s:'#c02828'}, rows:ICON_ROWS.helmet.rows},
  urraxe:{pal:{s:'#ffe08a', M:'#c8962e', m:'#7a1c1c', b:'#3a0e0e', B:'#7a1c1c'}, rows:ICON_ROWS.axe.rows},
  urrwall:{pal:{m:'#3a0e0e', M:'#ffd040', i:'#7a1c1c', I:'#a02828', g:'#ffd040'}, rows:ICON_ROWS.aegis.rows},
  urrboots:{pal:{L:'#5a1414', l:'#a02828', d:'#2a0808', s:'#ffd040'}, rows:ICON_ROWS.boots.rows},
});
for(const k of ['ironshield','firearrows','mace','axe','dagger','veil','claw','aegis','lament','bandage','cookie','superpotion','greataxe','firesword','icesword','lightningsword','flamethrower','explosivearrows','urrhelm','urraxe','urrwall','urrboots','anvil']){ const d = ICON_ROWS[k]; ICONS[k] = bakeRows(d.rows, Object.assign({k:OUT}, d.pal)); }

// yunque sobre un tocón (guarida)
ART.anvil = SP(paintSprite(30,22,[
  {r:[8,13,14,8], c:WOOD, tex:271}, {e:[15,21,9,2], c:WOOD.slice(0,2)},
  {poly:[[3,6],[22,6],[21,10],[18,11],[18,14],[11,14],[11,11],[6,10]], c:IRON, tex:272}, {poly:[[22,6],[29,7],[22,9]], c:IRON.slice(1)}, {r:[3,6,19,1], c:['#c8ccd4']},
]), 15, 21);
// escudos en el brazo
ART.ironshield = SP(paintSprite(12,13,[
  {poly:[[0,0],[12,0],[12,6],[6,13],[0,6]], c:IRON.slice(1)}, {poly:[[2,2],[10,2],[10,6],[6,10],[2,6]], c:IRON.slice(0,3), tex:95},
  {e:[6,5,1.6,1.6], c:['#8a6420','#c8962e','#ffe08a']},
]), 6, 6);
ART.nightaegis = SP(paintSprite(12,13,[
  {poly:[[0,0],[12,0],[12,6],[6,13],[0,6]], c:['#8a6420','#c8962e','#ffd040']}, {poly:[[2,2],[10,2],[10,6],[6,10],[2,6]], c:['#2a2040','#3e2e5a','#5a4a7a'], tex:96},
  {e:[6,5,1.6,1.6], c:['#a84a1a','#ff8a3a','#ffd0a0']},
]), 6, 6);
ART.urrwall = SP(paintSprite(12,13,[
  {poly:[[0,0],[12,0],[12,6],[6,13],[0,6]], c:['#8a6420','#c8962e','#ffd040']}, {poly:[[2,2],[10,2],[10,6],[6,10],[2,6]], c:['#3a0e0e','#7a1c1c','#a02828'], tex:97},
  {e:[6,5,1.6,1.6], c:['#c8962e','#ffd040','#fff0a0']},
]), 6, 6);
// capas del velo y la garra (únicos): telas y colores espectrales
STUD.unique = '#ff8a3a';
// el velo copia la silueta exacta de la capucha (22×16) y deja libre la cara; así la tapa por completo y se ajusta al personaje
ARMOR_OV.veil = {ox:-9, oy:-40, rows:(() => {
  const map = {k:'k', h:'L', j:'l', H:'d'};
  const rows = SPR.hood.rows.map(r => [...r].map(ch => map[ch] || '.').join(''));
  const put = (y, x, c) => { rows[y] = rows[y].slice(0, x) + c + rows[y].slice(x+1); };
  put(5, 9, 's'); put(5, 14, 's'); put(3, 7, 's');             // gemas anaranjadas
  rows.push("....kLLlLk..........", "....kLLdk...........", ".....kdk............");   // caída de tela por la espalda
  return rows;
})()};
// casco cornudo de Urr: el casco con dos cuernos
ARMOR_OV.urrhelm = {ox:-9, oy:-44, rows:(() => {
  const w = 22, rows = Array.from({length:4}, () => '.'.repeat(w)).concat(ARMOR_OV.helmet.rows.map(r => r.padEnd(w, '.')));
  const set = (x, y, c) => { rows[y] = rows[y].slice(0, x) + c + rows[y].slice(x+1); };
  for(const [x, y] of [[5,5],[4,4],[3,3],[3,2],[2,1],[16,5],[17,4],[18,3],[18,2],[19,1]]){ set(x, y, 'l'); for(const dx of [-1, 1]) if(rows[y][x+dx] === '.') set(x+dx, y, 'k'); }
  return rows;
})()};
ARMOR_OV.urrboot = {ox:ARMOR_OV.boot.ox, oy:ARMOR_OV.boot.oy, rows:ARMOR_OV.boot.rows};
for(const k in ARMOR_OV){
  const o = ARMOR_OV[k]; o.img = o.img || {};
  o.img.unique = bakeRows(o.rows, Object.assign({k:OUT, s:STUD.unique}, k==='veil' ? {L:'#b8aed8', l:'#e8e0ff', d:'#6a5a8a'} : (k==='urrhelm' || k==='urrboot') ? {L:'#7a2a24', l:'#d8d0c0', d:'#2a0e0c'} : {L:'#5a4a7a', l:'#7a6aa8', d:'#2a2040'}));
}

// ---------- monstruos de la cripta ----------
const ROBE_M = ['#1e1430','#30204a','#46306a','#5e4488'], ROBE_N = ['#101410','#1c241a','#2a3626','#3a4a34'];
Object.assign(MON_SHAPES, {
  skelmage: {w:28, h:36, ax:11, ay:35, shapes(f){
    const s = f===1 ? 2 : -2;
    return [
      {l:[10,24,10+s,34,2], c:BONE.slice(0,3)}, {l:[12,24,12-s,34,2], c:BONE.slice(1)},
      {poly:[[6,13],[16,13],[18,29],[13,27],[10,30],[7,27],[4,29]], c:ROBE_M, tex:97},
      {e:[12,8,5,5], c:BONE}, {e:[12,6,6,4.5], c:ROBE_M.slice(0,3)},
      {p:[[13,8,'#120e10'],[15,8,'#120e10'],[13,9,'#c070ff'],[15,9,'#c070ff'],[11,12,'#120e10'],[13,12,'#120e10']]},
      f===2 ? {l:[16,15,20,3,1.6], c:WOOD.slice(0,3)} : {l:[16,16,20,30,1.6], c:WOOD.slice(0,3)},
      f===2 ? {e:[20,3,2.6,2.6], c:['#6a2aa8','#a860ff','#e8c8ff']} : {e:[20,16,2.4,2.4], c:['#6a2aa8','#a860ff','#e8c8ff']},
      f===2 ? {l:[14,15,19,8,1.8], c:BONE.slice(1)} : {l:[14,15,18,20,1.8], c:BONE.slice(1)},
    ];
  }},
  wraith: {w:26, h:32, ax:13, ay:31, shapes(f){
    const g = ['#0c0a14','#1a1428','#2a2040','#3e3260'], w = f===1 ? 1 : f===2 ? 0 : -1;
    return [
      {poly:[[3,10],[23,10],[21+w,24],[18,20],[15-w,30],[12,22],[9+w,29],[6,21],[4,25]], c:g, tex:98},
      {e:[13,9,8,8.5], c:g}, {e:[13,8,5.5,5.5], c:'#05040a'},
      f===2 ? {l:[4,12,0,4,2.2], c:g.slice(1)} : {l:[4,13,1,19,2.2], c:g.slice(1)},
      f===2 ? {l:[22,12,26,4,2.2], c:g.slice(1)} : {l:[22,13,25,19,2.2], c:g.slice(1)},
      {p:[[11,8,'#7af0ff'],[15,8,'#7af0ff'],[11,7,'#c8ffff'],[15,7,'#c8ffff'], ...(f===2 ? [[0,4,'#c8ccd4'],[25,4,'#c8ccd4']] : [])]},
    ];
  }},
  necro: {w:28, h:38, ax:12, ay:37, shapes(f){
    const s = f===1 ? 1 : -1;
    return [
      {poly:[[5,14],[18,14],[21,36],[15,33],[12,37],[8,33],[3,36]], c:ROBE_N, tex:99},
      {e:[12,10,6.2,6.5], c:ROBE_N.slice(0,3)},
      {e:[13,11,3.6,4], c:BONE}, {p:[[12,10,'#120e10'],[14,10,'#120e10'],[12,11,'#7af07a'],[14,11,'#7af07a'],[13,14,'#120e10']]},
      {r:[9,20,8,2], c:['#5a1a1a','#8a2a2a']},
      f===2 ? {l:[6,16,2,6,2], c:BONE.slice(1)} : {l:[6,17,4+s,26,2], c:BONE.slice(1)},
      f===2 ? {l:[18,16,22,3,1.6], c:WOOD.slice(0,3)} : {l:[18,16,22,34,1.6], c:WOOD.slice(0,3)},
      f===2 ? {e:[22,3,2.6,2.8], c:['#1a6a1a','#4ae04a','#c8ffc8']} : {e:[22,14,2.4,2.6], c:['#1a6a1a','#4ae04a','#c8ffc8']},
      f===2 ? {e:[2,5,2,2], c:['#1a6a1a','#4ae04a','#c8ffc8']} : null,
    ];
  }},
  skelknight: {w:32, h:38, ax:13, ay:37, shapes(f){
    const s = f===1 ? 2 : -2, ar = ['#2e3036','#4a4d55','#6c7079','#8a8e98'];
    return [
      {l:[11,25,11+s,36,2.6], c:BONE.slice(0,3)}, {l:[15,25,15-s,36,2.6], c:BONE.slice(1)},
      {r:[9,34+0,5,3], c:ar.slice(0,2)}, {r:[14,34,5,3], c:ar.slice(0,2)},
      {r:[7,13,13,13], c:ar, tex:100}, {r:[7,24,13,3], c:['#4a1414','#6a1e1e']},
      {e:[13,8,5.5,5.5], c:BONE}, {r:[8,3,11,6], c:ar.slice(1)}, {r:[13,5,6,2], c:'#120e10'}, {p:[[14,6,'#ff4030'],[17,6,'#ff4030']]},
      {poly:[[2,12],[9,12],[9,22],[5.5,26],[2,22]], c:['#4a1414','#6a1e1e','#8a2a2a']}, {p:[[5,17,'#c8962e'],[5,18,'#c8962e'],[4,17,'#c8962e'],[6,17,'#c8962e']]},
      f===2 ? {l:[19,15,23,4,2.6], c:RUST} : {l:[19,16,30,10,2.6], c:RUST},
      f===2 ? {r:[18,13,5,2], c:'#8a6420'} : {r:[18,15,2,4], c:'#8a6420'},
    ];
  }},
  countess: {w:46, h:62, ax:23, ay:61, shapes(f){
    const g = ['#5a4a7a','#8a7aaa','#bcb0dc','#eae4ff'], hair = ['#2a2040','#3e3260','#5a4a88'], sw = f===1 ? 2 : f===2 ? 0 : -2;
    return [
      {poly:[[8,22],[38,22],[44+sw,52],[38,47],[33,60],[27,50],[23,61],[19,50],[13,60],[8,47],[2-sw,52]], c:g, tex:101},   // vestido
      {poly:[[14,4],[32,4],[36,30],[30,24],[23,32],[16,24],[10,30]], c:hair, tex:102},                                       // melena
      {e:[23,22,8,9], c:g},                                                                                                    // torso
      {r:[15,28,16,3], c:['#4a2a6a','#7a4aa8']},                                                                               // fajín
      {e:[23,12,6,7], c:['#9a90b8','#c8c0e0','#ece8ff']},                                                                     // cara
      {p:[[21,11,'#0a0614'],[22,11,'#0a0614'],[25,11,'#0a0614'],[26,11,'#0a0614'],[21,12,'#0a0614'],[26,12,'#0a0614'],
          [22,12,'#ff60c0'],[25,12,'#ff60c0'], ...(f===2 ? [[23,16,'#0a0614'],[24,16,'#0a0614'],[23,17,'#0a0614'],[24,17,'#0a0614']] : [[23,16,'#5a4a7a'],[24,16,'#5a4a7a']])]},
      {poly:[[17,4],[20,0],[23,3],[26,0],[29,4]], c:['#8a6420','#c8962e','#ffd040']},                                        // tiara
      {p:[[23,2,'#ff60c0']]},
      f===2 ? {l:[15,22,4,8,3], c:g.slice(1)} : {l:[15,23,9,36,3], c:g.slice(1)},
      f===2 ? {l:[31,22,42,8,3], c:g.slice(1)} : {l:[31,23,37,36,3], c:g.slice(1)},
    ];
  }},
});
for(const id of ['skelmage','wraith','necro','skelknight','countess']){
  const d = MON_SHAPES[id];
  MON_ART[id] = {fr:[0,1,2].map(f => SP(paintSprite(d.w, d.h, d.shapes(f)), d.ax, d.ay))};
  MON_ART[id].flash = MON_ART[id].fr.map(s => {
    const c = document.createElement('canvas'); c.width = s.c.width; c.height = s.c.height;
    const g = c.getContext('2d'); g.drawImage(s.c,0,0); g.globalCompositeOperation='source-in'; g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height);
    return {c, ax:s.ax, ay:s.ay};
  });
}
Object.assign(MON_COLORS, {skelmage:['#d6d0c0','#a860ff','#46306a'], wraith:['#2a2040','#7af0ff','#3e3260'], necro:['#4ae04a','#2a3626','#d6d0c0'],
  skelknight:['#6c7079','#d6d0c0','#4a1414'], countess:['#bcb0dc','#eae4ff','#ff60c0']});

// ---------- orcos (campamento orco y castillo de Urr) ----------
// Hechos con las mismas capas del héroe (cabeza, torso, piernas): piel verde, orejas puntiagudas, colmillos y el equipo de cada tipo.
function oRecolor(extra){ return Object.assign({}, PAL, extra); }
function oDupCols(rows, cols){ return rows.map(r => { let out = ''; for(let i=0;i<r.length;i++){ out += r[i]; if(cols.includes(i)) out += r[i]; } return out; }); }
function oBake(rows, pal){ return bakeRows(rows, pal); }
// línea gruesa de píxeles sobre un contexto cualquiera
function oCl(g, x0, y0, x1, y1, w, col){
  const n = Math.max(Math.abs(x1-x0), Math.abs(y1-y0), 1); g.fillStyle = col;
  for(let i=0;i<=n;i++){ const x = Math.round(x0 + (x1-x0)*i/n), y = Math.round(y0 + (y1-y0)*i/n); g.fillRect(x - (w>>1), y - (w>>1), w, w); }
}
function oPx(g, list){ for(const [x, y, c] of list){ g.fillStyle = c; g.fillRect(x, y, 1, 1); } }
function oPoly(g, pts, col){ g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); }

const ORC_LEG = [".kppPPk...", ".kppPPk...", ".kppPPk...", ".kppPPk...", ".kppPPk...", ".kppPPk...", "kOOOOOk...", "kOoooook..", "kOooooook.", "kddddddk..", ".kkkkkk..."];
const ORC_TORSO = oDupCols(SPR.torso.rows, [8, 9, 10, 11]);                                   // torso más ancho que el del héroe
const ORC_HEAD = SPR.hood.rows;

// cfg: {skin, hair, tunic:[t,T,u], leg:[p,P], eye, weapon, armor, hat, cloak, scale}
function orcCanvas(f, cfg){
  const W = 64, H = 56, AX = 24, AY = 54, la = f===1 ? 2 : f===2 ? 0 : -1, swing = f===2;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  const pal = oRecolor({s:cfg.skin[0], S:cfg.skin[1], D:cfg.skin[2], w:'#ffd23a', e:'#3a1008', a:cfg.hair[0],
    h:cfg.hood[0], j:cfg.hood[1], H:cfg.hood[2], c:cfg.skin[2], C:cfg.skin[1],
    t:cfg.tunic[0], T:cfg.tunic[1], u:cfg.tunic[2], p:cfg.leg[0], P:cfg.leg[1]});
  if(cfg.cloak){ const cc = cfg.cloak2 || ['#5a1414', '#7a1c1c', '#a02828']; oPoly(g, [[AX-11,AY-29],[AX+9,AY-29],[AX+13,AY-5],[AX-14,AY-3]], cc[0]); oPoly(g, [[AX-11,AY-29],[AX-2,AY-29],[AX-4,AY-4],[AX-14,AY-3]], cc[1]); oCl(g, AX-6, AY-28, AX-8, AY-5, 1, cc[2]); }
  // piernas
  const leg = oBake(ORC_LEG, pal);
  g.drawImage(leg, AX - 8 - la, AY - 11); g.drawImage(leg, AX - 1 + la, AY - 11);
  // torso ancho
  if(cfg.elf || cfg.human) g.drawImage(oBake(SPR.torso.rows, pal), AX - 10, AY - 26); else g.drawImage(oBake(ORC_TORSO, pal), AX - 12, AY - 26);
  // correa / armadura
  if(cfg.armor==='strap'){ oCl(g, AX-6, AY-25, AX+6, AY-14, 2, '#5c3c24'); oPx(g, [[AX, AY-20, '#c8962e'], [AX+1, AY-20, '#c8962e']]); oPoly(g, [[AX+4,AY-27],[AX+11,AY-26],[AX+11,AY-21],[AX+5,AY-21]], '#3a2416'); oPx(g, [[AX+7, AY-25, '#c8ccd4'], [AX+9, AY-23, '#c8ccd4']]); }
  if(cfg.armor==='vest'){ oPoly(g, [[AX-7,AY-25],[AX+7,AY-25],[AX+6,AY-12],[AX-6,AY-12]], '#4a2e1c'); for(let y=AY-24;y<AY-12;y+=3) oPx(g, [[AX, y, '#c8b890']]); }
  if(cfg.armor==='plate'){ oPoly(g, [[AX-8,AY-26],[AX+8,AY-26],[AX+7,AY-12],[AX-7,AY-12]], '#8a8e98'); oPoly(g, [[AX-8,AY-26],[AX,AY-26],[AX,AY-12],[AX-7,AY-12]], '#6c7079'); oCl(g, AX, AY-26, AX, AY-12, 1, '#c8ccd4'); oPx(g, [[AX-5,AY-23,'#e8ecf2'],[AX+5,AY-23,'#e8ecf2'],[AX-5,AY-16,'#e8ecf2'],[AX+5,AY-16,'#e8ecf2']]);
    oPoly(g, [[AX-12,AY-27],[AX-6,AY-28],[AX-6,AY-21],[AX-12,AY-22]], '#9aa0aa'); oPoly(g, [[AX+6,AY-28],[AX+12,AY-27],[AX+12,AY-22],[AX+6,AY-21]], '#9aa0aa');
    oPoly(g, [[AX-11,AY-27],[AX-10,AY-32],[AX-8,AY-27]], '#d8dce4'); oPoly(g, [[AX+8,AY-27],[AX+10,AY-32],[AX+11,AY-27]], '#d8dce4'); }
  if(cfg.armor==='apron'){ oPoly(g, [[AX-7,AY-25],[AX+7,AY-25],[AX+8,AY-5],[AX-8,AY-5]], '#4a2e1c'); oPoly(g, [[AX-7,AY-25],[AX-1,AY-25],[AX-2,AY-5],[AX-8,AY-5]], '#3a2416'); oCl(g, AX-6, AY-26, AX-2, AY-33, 1, '#3a2416'); oCl(g, AX+6, AY-26, AX+3, AY-33, 1, '#3a2416'); oPx(g, [[AX-4,AY-17,'#1a1210'],[AX+1,AY-12,'#1a1210'],[AX+3,AY-20,'#1a1210'],[AX-5,AY-9,'#1a1210']]); }
  if(cfg.armor==='robe'){ oPoly(g, [[AX-8,AY-26],[AX+8,AY-26],[AX+10,AY-3],[AX-10,AY-3]], '#4a1a52'); oPoly(g, [[AX-8,AY-26],[AX,AY-26],[AX-1,AY-3],[AX-10,AY-3]], '#2a0e2e'); oCl(g, AX-6, AY-14, AX+6, AY-14, 2, '#c8b890'); oPx(g, [[AX-4,AY-25,'#e8e0c8'],[AX-2,AY-24,'#e8e0c8'],[AX,AY-24,'#e8e0c8'],[AX+2,AY-24,'#e8e0c8'],[AX+4,AY-25,'#e8e0c8']]); }
  // cinturón / taparrabos (salvo túnica)
  if(cfg.armor!=='robe'){ g.fillStyle = cfg.gold ? '#c8962e' : '#3a2416'; g.fillRect(AX-8, AY-14, 17, 3); oPx(g, [[AX, AY-14, '#ffd040'], [AX+1, AY-14, '#ffd040']]);
    oPoly(g, [[AX-6,AY-11],[AX+6,AY-11],[AX+7,AY-6],[AX+4,AY-8],[AX+2,AY-5],[AX-1,AY-8],[AX-4,AY-5],[AX-7,AY-7]], '#5a2018'); }
  if(cfg.tabard){ oPoly(g, [[AX-2,AY-12],[AX+3,AY-12],[AX+3,AY-3],[AX+2,AY-5],[AX,AY-2],[AX-2,AY-4]], '#7a1c1c'); oCl(g, AX-2, AY-12, AX-2, AY-4, 1, '#a02828'); oCl(g, AX-5, AY-12, AX-5, AY-6, 1, '#9aa0aa'); oCl(g, AX+6, AY-12, AX+6, AY-6, 1, '#9aa0aa'); }
  if(cfg.skull){ g.fillStyle = '#121015'; g.fillRect(AX-3, AY-16, 7, 7); g.fillStyle = '#c8962e'; g.fillRect(AX-2, AY-15, 5, 5); g.fillStyle = '#e8e0c8'; g.fillRect(AX-1, AY-14, 3, 3); oPx(g, [[AX-1,AY-13,'#121015'],[AX+1,AY-13,'#121015']]); }
  // brazos gruesos con brazalete
  const arm = cfg.armor==='robe' ? '#4a1a52' : cfg.skin[1], armLight = cfg.armor==='robe' ? '#6a2878' : cfg.skin[0];
  const aw = cfg.armW || 4; oCl(g, AX-9, AY-24, AX-10, AY-13, aw+2, '#121015'); oCl(g, AX-9, AY-24, AX-10, AY-13, aw, arm); oCl(g, AX-10, AY-24, AX-10, AY-17, 1, armLight);
  g.fillStyle = '#3a2416'; g.fillRect(AX-12, AY-17, 5, 3); g.fillStyle = cfg.skin[1]; g.fillRect(AX-12, AY-12, 5, 4); g.fillStyle = cfg.skin[0]; g.fillRect(AX-11, AY-12, 2, 2);
  const hx = swing ? AX+16 : AX+11, hy = swing ? AY-9 : AY-13;
  oCl(g, AX+8, AY-24, hx, hy, aw+2, '#121015'); oCl(g, AX+8, AY-24, hx, hy, aw, arm); oCl(g, AX+9, AY-24, hx+1, hy-5, 1, armLight);
  g.fillStyle = '#3a2416'; g.fillRect(hx-3, hy-5, 5, 3); g.fillStyle = cfg.skin[1]; g.fillRect(hx-2, hy-2, 5, 4); g.fillStyle = cfg.skin[0]; g.fillRect(hx-1, hy-2, 2, 2);
  if(cfg.pauldron){   // hombrera enorme con pinchos en el hombro lejano y pieles en el cercano
    oPoly(g, [[AX-16,AY-30],[AX-7,AY-31],[AX-6,AY-22],[AX-15,AY-21]], '#121015'); oPoly(g, [[AX-15,AY-29],[AX-8,AY-30],[AX-7,AY-23],[AX-14,AY-22]], '#6c7079'); oPoly(g, [[AX-15,AY-29],[AX-8,AY-30],[AX-8,AY-27],[AX-15,AY-26]], '#9aa0aa');
    oPoly(g, [[AX-14,AY-30],[AX-13,AY-37],[AX-11,AY-30]], '#d8dce4'); oPoly(g, [[AX-10,AY-31],[AX-8,AY-36],[AX-7,AY-31]], '#d8dce4'); oPx(g, [[AX-12,AY-25,'#e8ecf2'],[AX-9,AY-24,'#e8ecf2']]);
    oPoly(g, [[AX+5,AY-28],[AX+13,AY-27],[AX+16,AY-22],[AX+11,AY-24],[AX+8,AY-21],[AX+5,AY-23]], '#5a4a32'); oPx(g, [[AX+14,AY-24,'#7a6444'],[AX+10,AY-26,'#7a6444']]);
  }
  // arma
  const wp = cfg.weapon;
  if(wp==='axe' || wp==='bigaxe'){
    const k = wp==='bigaxe' ? 1.35 : 1;
    if(swing){ oCl(g, hx, hy, hx+7, hy+10, 3, '#121015'); oCl(g, hx, hy, hx+7, hy+10, 2, '#85592e'); oPoly(g, [[hx+4,hy+8],[hx+11,hy+6],[hx+12,hy+14],[hx+5,hy+14]], '#9aa0aa'); oPoly(g, [[hx+9,hy+7],[hx+12,hy+7],[hx+12,hy+14],[hx+9,hy+13]], '#d8dce4'); }
    else { oCl(g, hx, hy, hx+1, hy-18*k, 3, '#121015'); oCl(g, hx, hy, hx+1, hy-18*k, 2, '#85592e'); oPoly(g, [[hx,hy-20*k],[hx+7,hy-22*k],[hx+8,hy-10*k],[hx+1,hy-12*k]], '#9aa0aa'); oPoly(g, [[hx+5,hy-21*k],[hx+8,hy-21*k],[hx+8,hy-10*k],[hx+5,hy-11*k]], '#d8dce4'); }
  }
  if(wp==='club'){
    if(swing){ oCl(g, hx, hy, hx+8, hy+9, 4, '#121015'); oCl(g, hx, hy, hx+8, hy+9, 3, '#85592e'); g.fillStyle = '#5e3c20'; g.fillRect(hx+6, hy+8, 7, 6); oPx(g, [[hx+7,hy+9,'#c8ccd4'],[hx+11,hy+10,'#c8ccd4'],[hx+9,hy+13,'#c8ccd4']]); }
    else { oCl(g, hx, hy, hx+1, hy-14, 4, '#121015'); oCl(g, hx, hy, hx+1, hy-14, 3, '#85592e'); g.fillStyle = '#121015'; g.fillRect(hx-3, hy-24, 9, 11); g.fillStyle = '#5e3c20'; g.fillRect(hx-2, hy-23, 7, 9); oPx(g, [[hx-1,hy-22,'#c8ccd4'],[hx+3,hy-21,'#c8ccd4'],[hx+1,hy-17,'#c8ccd4']]); }
  }
  if(wp==='hammer'){
    if(swing){ oCl(g, hx, hy, hx+8, hy+9, 4, '#121015'); oCl(g, hx, hy, hx+8, hy+9, 3, '#85592e'); oPoly(g, [[hx+5,hy+7],[hx+19,hy+9],[hx+18,hy+19],[hx+4,hy+17]], '#121015'); oPoly(g, [[hx+6,hy+8],[hx+18,hy+10],[hx+17,hy+17],[hx+5,hy+16]], '#4a4d55'); oPoly(g, [[hx+6,hy+8],[hx+18,hy+10],[hx+18,hy+12],[hx+6,hy+10]], '#7a7e88'); oPx(g, [[hx+10,hy+13,'#2a2c32'],[hx+13,hy+12,'#2a2c32'],[hx+15,hy+15,'#2a2c32']]); }
    else { oCl(g, hx+1, hy+4, hx+6, hy-16, 4, '#121015'); oCl(g, hx+1, hy+4, hx+6, hy-16, 3, '#85592e'); oPx(g, [[hx+2,hy-4,'#c8962e'],[hx+3,hy-4,'#c8962e'],[hx+4,hy-9,'#c8962e'],[hx+5,hy-9,'#c8962e']]);
      oPoly(g, [[hx+1,hy-30],[hx+19,hy-33],[hx+20,hy-18],[hx+2,hy-15]], '#121015'); oPoly(g, [[hx+2,hy-29],[hx+18,hy-32],[hx+19,hy-19],[hx+3,hy-16]], '#4a4d55'); oPoly(g, [[hx+2,hy-29],[hx+18,hy-32],[hx+18,hy-28],[hx+2,hy-25]], '#7a7e88'); oPx(g, [[hx+8,hy-22,'#2a2c32'],[hx+9,hy-23,'#2a2c32'],[hx+13,hy-26,'#2a2c32'],[hx+14,hy-20,'#2a2c32']]); oCl(g, hx+10, hy-31, hx+11, hy-16, 1, '#2a2c32'); }
  }
  if(wp==='smith'){   // martillo de herrero: arriba en reposo, golpeando el yunque al "atacar"
    if(swing){ oCl(g, hx, hy, hx+6, hy+7, 3, '#121015'); oCl(g, hx, hy, hx+6, hy+7, 2, '#85592e'); g.fillStyle = '#121015'; g.fillRect(hx+3, hy+6, 10, 7); g.fillStyle = '#6c7079'; g.fillRect(hx+4, hy+7, 8, 5); g.fillStyle = '#9aa0aa'; g.fillRect(hx+4, hy+7, 8, 2); }
    else { oCl(g, hx, hy, hx+1, hy-11, 3, '#121015'); oCl(g, hx, hy, hx+1, hy-11, 2, '#85592e'); g.fillStyle = '#121015'; g.fillRect(hx-4, hy-17, 10, 7); g.fillStyle = '#6c7079'; g.fillRect(hx-3, hy-16, 8, 5); g.fillStyle = '#9aa0aa'; g.fillRect(hx-3, hy-16, 8, 2); }
  }
  if(wp==='spear'){   // lanza larga: vertical en reposo y estocada al atacar
    if(swing){ oCl(g, hx-4, hy+1, hx+14, hy-1, 2, '#121015'); oCl(g, hx-4, hy+1, hx+14, hy-1, 1, '#85592e'); oPoly(g, [[hx+14,hy-3],[hx+20,hy],[hx+14,hy+3]], '#121015'); oPoly(g, [[hx+14,hy-2],[hx+19,hy],[hx+14,hy+2]], '#d8dce4'); }
    else { oCl(g, hx+1, hy+10, hx+2, hy-26, 2, '#121015'); oCl(g, hx+1, hy+10, hx+2, hy-26, 1, '#85592e'); oPoly(g, [[hx,hy-26],[hx+2,hy-34],[hx+4,hy-26]], '#d8dce4'); oPx(g, [[hx+2,hy-28,'#ffffff']]); }
  }
  if(wp==='greatsword'){   // espadón a dos manos: vertical en reposo y tajo horizontal al atacar
    if(swing){ oCl(g, hx-3, hy+2, hx+20, hy+6, 4, '#121015'); oCl(g, hx-3, hy+2, hx+20, hy+6, 2, '#d8dce4'); oPoly(g, [[hx+19,hy+3],[hx+26,hy+7],[hx+19,hy+9]], '#e8ecf2'); oCl(g, hx+1, hy-2, hx+1, hy+6, 3, '#c8962e'); }
    else { oCl(g, hx+1, hy+8, hx+3, hy-26, 4, '#121015'); oCl(g, hx+1, hy+8, hx+3, hy-26, 2, '#d8dce4'); oPoly(g, [[hx,hy-26],[hx+3,hy-35],[hx+6,hy-26]], '#e8ecf2'); oCl(g, hx-4, hy-1, hx+8, hy-1, 3, '#c8962e'); oPx(g, [[hx+2,hy-18,'#ffffff'],[hx+2,hy-8,'#ffffff']]); }
  }
  if(wp==='lantern'){   // farol mágico en alto, colgado de una cadena
    const lx = hx+4, ly = hy-12; oCl(g, hx, hy, lx, ly+2, 2, '#c8b890');
    g.fillStyle = '#121015'; g.fillRect(lx-4, ly-2, 9, 12); g.fillStyle = '#ffe8a0'; g.fillRect(lx-3, ly-1, 7, 10); g.fillStyle = '#ffffff'; g.fillRect(lx-1, ly+1, 3, 5);
    g.fillStyle = '#c8b890'; g.fillRect(lx-4, ly-3, 9, 2); g.fillRect(lx-4, ly+9, 9, 2); oPx(g, [[lx-5,ly+3,'#fff4c0'],[lx+5,ly+3,'#fff4c0'],[lx,ly-5,'#fff4c0']]);
  }
  if(wp==='dagger'){   // daga corta: en la mano y, al atacar, lanzada hacia delante
    if(swing) oPoly(g, [[hx+2,hy-1],[hx+12,hy-2],[hx+13,hy+1],[hx+3,hy+2]], '#c8c0e8'); else oPoly(g, [[hx+1,hy-3],[hx+3,hy-12],[hx+5,hy-3]], '#c8c0e8');
    oPx(g, swing ? [[hx+4,hy-1,'#ffffff']] : [[hx+3,hy-9,'#ffffff']]); oCl(g, hx, hy, hx+1, hy-3, 2, '#3a2a5a');
  }
  if(wp==='rock'){   // peñasco: en la mano en reposo y lanzado al atacar
    if(!swing){ oPoly(g, [[hx-3,hy-18],[hx+5,hy-20],[hx+10,hy-14],[hx+8,hy-8],[hx-2,hy-8],[hx-5,hy-13]], '#121015'); oPoly(g, [[hx-2,hy-17],[hx+5,hy-19],[hx+9,hy-14],[hx+7,hy-9],[hx-1,hy-9],[hx-4,hy-13]], '#6c7079'); oPoly(g, [[hx-2,hy-17],[hx+5,hy-19],[hx+6,hy-16],[hx-3,hy-14]], '#9aa0aa'); oPx(g, [[hx+4,hy-12,'#3e4148'],[hx+1,hy-10,'#3e4148']]); }
  }
  if(wp==='bow'){
    oCl(g, hx+3, hy-14, hx+6, hy-2, 2, '#85592e'); oCl(g, hx+6, hy-2, hx+3, hy+10, 2, '#85592e'); oCl(g, hx+3, hy-14, hx+3, hy+10, 1, '#e8e0c8');
    if(swing) oCl(g, hx-6, hy-2, hx+8, hy-2, 1, '#c8a878');
    oPoly(g, [[AX-10,AY-28],[AX-6,AY-27],[AX-5,AY-17],[AX-9,AY-18]], '#4a2e1c'); oPx(g, [[AX-9,AY-30,'#e8e0c8'],[AX-7,AY-29,'#e8e0c8']]);
  }
  if(wp==='staff'){
    oCl(g, hx+2, hy+14, hx+2, hy-22, 2, '#85592e'); g.fillStyle = '#121015'; g.fillRect(hx, hy-30, 5, 6); g.fillStyle = (cfg.staffCol || ['#ff9a30'])[0]; g.fillRect(hx+1, hy-29, 3, 4); oPx(g, [[hx+2, hy-29, (cfg.staffCol || [0, '#ffe090'])[1]]]);
    oPoly(g, [[hx-1,hy-23],[hx+2,hy-19],[hx+5,hy-23]], '#d8ccb0');
  }
  // cabeza del héroe con piel verde
  g.drawImage(oBake(ORC_HEAD, pal), AX + SPR.hood.ox, AY + SPR.hood.oy);
  // tocados: se ajustan a la silueta exacta de la cabeza del héroe (cúpula en x = AX-8..AX+11, y = AY-40..AY-35)
  if(cfg.hat==='band' || cfg.hat==='helm' && cfg.gold){   // cinta o banda siguiendo la curva de la cúpula
    const c1 = cfg.hat==='band' ? '#a02828' : '#ffd040', c0 = cfg.hat==='band' ? '#7a1c1c' : '#c8962e';
    g.fillStyle = c1; g.fillRect(AX-7, AY-36, 17, 1); g.fillRect(AX-6, AY-35, 17, 1);
    g.fillStyle = c0; g.fillRect(AX-7, AY-37, 15, 1);
  }
  if(cfg.hat==='feathers'){   // plumas que salen de la parte alta de la capucha
    oPoly(g, [[AX-2,AY-39],[AX-6,AY-42],[AX-7,AY-47],[AX-1,AY-42]], '#e0602a'); oPoly(g, [[AX,AY-40],[AX-2,AY-46],[AX-1,AY-50],[AX+3,AY-42]], '#ffb040');
    oPoly(g, [[AX+2,AY-40],[AX+3,AY-47],[AX+7,AY-48],[AX+6,AY-40]], '#e0602a'); oPoly(g, [[AX+5,AY-39],[AX+9,AY-44],[AX+12,AY-44],[AX+8,AY-38]], '#a8301a');
  }
  if(cfg.hat==='helm'){   // el casco es la propia capucha teñida de acero; encima, tres pinchos cortos
    for(const x of [-4, 0, 4]) oPoly(g, [[AX+x-1,AY-40],[AX+x+1,AY-45],[AX+x+3,AY-40]], '#c8ccd4');
    oPx(g, [[AX-3,AY-42,'#ffffff'],[AX+1,AY-43,'#ffffff'],[AX+5,AY-42,'#ffffff']]);
  }
  if(cfg.crown){   // corona de hierro con tres pinchos y dos cuernos pequeños
    g.fillStyle = '#121015'; g.fillRect(AX-8, AY-38, 18, 4); g.fillStyle = '#4a4d55'; g.fillRect(AX-7, AY-37, 16, 2); g.fillStyle = '#7a7e88'; g.fillRect(AX-7, AY-37, 16, 1);
    for(const x of [-4, 1, 6]) oPoly(g, [[AX+x-1,AY-38],[AX+x,AY-43],[AX+x+2,AY-38]], '#9aa0aa');
    oPoly(g, [[AX-8,AY-37],[AX-10,AY-41],[AX-8,AY-43],[AX-6,AY-38]], '#e8e0c8'); oPoly(g, [[AX+9,AY-37],[AX+11,AY-41],[AX+9,AY-43],[AX+7,AY-38]], '#e8e0c8');
    oPx(g, [[AX-3,AY-36,'#ffd040'],[AX+2,AY-36,'#ffd040'],[AX+7,AY-36,'#ffd040']]);
  }
  if(cfg.braids){   // una trenza negra con anillos dorados por la espalda y una barba corta
    g.fillStyle = '#0e0a08'; g.fillRect(AX-6, AY-31, 2, 12); g.fillStyle = '#2a2018'; g.fillRect(AX-5, AY-30, 1, 10); oPx(g, [[AX-6,AY-26,'#c8962e'],[AX-5,AY-26,'#ffd040'],[AX-6,AY-21,'#c8962e'],[AX-5,AY-21,'#c8962e']]);
    oPoly(g, [[AX+4,AY-28],[AX+9,AY-28],[AX+8,AY-24],[AX+6,AY-23]], '#121015'); oPx(g, [[AX+6,AY-27,'#241812'],[AX+7,AY-26,'#241812']]);
  }
  if(cfg.dragon){   // caballeros del dragón: casco de caballero con cuernos y cara de dragón (hocico, colmillos y ojo rasgado) sobre la cabeza del héroe
    const D = cfg.dragon;
    oPoly(g, [[AX-3,AY-40],[AX-9,AY-44],[AX-13,AY-43],[AX-14,AY-39],[AX-9,AY-40],[AX-6,AY-37]], '#121015'); oPoly(g, [[AX-3,AY-40],[AX-9,AY-43],[AX-12,AY-42],[AX-9,AY-40]], D.horn[0]); oPx(g, [[AX-10,AY-42,D.horn[1]],[AX-12,AY-42,D.horn[1]]]);
    oPoly(g, [[AX-10,AY-34],[AX-10,AY-40],[AX-5,AY-44],[AX+5,AY-44],[AX+11,AY-40],[AX+11,AY-33]], '#121015');
    oPoly(g, [[AX-9,AY-34],[AX-9,AY-39],[AX-5,AY-43],[AX+5,AY-43],[AX+10,AY-39],[AX+10,AY-34]], D.helm[0]);
    oPoly(g, [[AX-9,AY-34],[AX-9,AY-39],[AX-5,AY-43],[AX-1,AY-43],[AX-1,AY-34]], D.helm[2]);
    oCl(g, AX-3, AY-42, AX+5, AY-42, 1, D.helm[1]); oCl(g, AX+7, AY-40, AX+9, AY-38, 1, D.helm[1]);
    oCl(g, AX+1, AY-43, AX+1, AY-37, 2, D.helm[1]);   // cresta central
    oPoly(g, [[AX-1,AY-44],[AX+1,AY-49],[AX+3,AY-44]], D.crest); oPx(g, [[AX+1,AY-47,'#ffffff']]);
    oPoly(g, [[AX-9,AY-34],[AX+10,AY-34],[AX+10,AY-33],[AX-9,AY-33]], '#121015');   // borde inferior del casco
    // hocico de dragón saliendo por debajo del casco, mirando al frente
    oPoly(g, [[AX+5,AY-34],[AX+18,AY-33],[AX+19,AY-28],[AX+16,AY-26],[AX+6,AY-27]], '#121015');
    oPoly(g, [[AX+6,AY-33],[AX+17,AY-32],[AX+18,AY-29],[AX+7,AY-28]], D.scale[0]);
    oPoly(g, [[AX+6,AY-33],[AX+17,AY-32],[AX+17,AY-31],[AX+6,AY-31]], D.scale[1]);
    oPoly(g, [[AX+7,AY-28],[AX+18,AY-29],[AX+16,AY-27],[AX+8,AY-27]], D.scale[2]);
    oPx(g, [[AX+16,AY-31,'#121015'],[AX+17,AY-31,'#121015'],[AX+9,AY-30,D.scale[2]],[AX+12,AY-30,D.scale[2]],[AX+14,AY-29,D.scale[2]]]);   // fosa nasal y escamas
    oPx(g, [[AX+10,AY-27,'#ffffff'],[AX+14,AY-27,'#ffffff'],[AX+17,AY-28,'#ffffff']]);   // colmillos
    oPx(g, [[AX+6,AY-32,D.eye],[AX+7,AY-32,D.eye],[AX+6,AY-31,'#121015'],[AX+5,AY-33,'#121015'],[AX+7,AY-33,'#121015']]);   // ojo de reptil con párpado
  }
  // orejas puntiagudas, colmillos y pintura de guerra: siempre por encima de cintas y cascos
  if(cfg.human){ /* personas: sin orejas puntiagudas ni colmillos */ }
  else if(cfg.elf){   // orejas largas y finas hacia atrás; ojos violeta brillantes
    oPoly(g, [[AX-3,AY-32],[AX-13,AY-36],[AX-2,AY-35]], cfg.skin[1]); oPoly(g, [[AX-3,AY-33],[AX-11,AY-36],[AX-3,AY-34]], cfg.skin[0]);
    oPx(g, [[AX+6,AY-33,'#e0a0ff'],[AX+7,AY-33,'#e0a0ff'],[AX+2,AY-33,'#e0a0ff']]);
  } else {
  oPoly(g, [[AX-3,AY-32],[AX-8,AY-39],[AX-1,AY-35]], cfg.skin[1]); oPoly(g, [[AX-3,AY-32],[AX-6,AY-37],[AX-2,AY-34]], cfg.skin[0]);       // oreja trasera
  oPx(g, [[AX+8,AY-28,'#f0e6d0'],[AX+8,AY-29,'#f0e6d0'],[AX+4,AY-28,'#f0e6d0'],[AX+4,AY-29,'#f0e6d0']]);                                    // colmillos
  if(!cfg.noPaint) oPx(g, [[AX+3,AY-33,'#a02828'],[AX+7,AY-32,'#a02828']]);
  }                                                                                     // pintura de guerra

  return oCrisp(cv);
}
// elimina el antialiasing de los polígonos: cada píxel queda opaco o transparente
function oCrisp(cv){ const g = cv.getContext('2d'), d = g.getImageData(0, 0, cv.width, cv.height), p = d.data; for(let i=3;i<p.length;i+=4) p[i] = p[i] > 110 ? 255 : 0; g.putImageData(d, 0, 0); return cv; }
const ORC_CFG = {
  hero:    null,
  smith:   {skin:['#7ea852','#56803a','#33481f'], hair:['#241812'], hood:['#3a281c','#5c3c24','#241812'], tunic:['#56803a','#7ea852','#33481f'], leg:['#3a2a1c','#4a3624'], weapon:'smith', armor:'apron', hat:'band'},
  orc:     {skin:['#7ea852','#56803a','#33481f'], hair:['#241812'], hood:['#241812','#3a281c','#120c0a'], tunic:['#56803a','#7ea852','#33481f'], leg:['#3a2a1c','#4a3624'], weapon:'axe', armor:'strap'},
  archer:  {skin:['#7ea852','#56803a','#33481f'], hair:['#241812'], hood:['#3a281c','#5c3c24','#241812'], tunic:['#56803a','#7ea852','#33481f'], leg:['#3a2a1c','#4a3624'], weapon:'bow', armor:'vest', hat:'band'},
  shaman:  {skin:['#7ea852','#56803a','#33481f'], hair:['#241812'], hood:['#4a1a52','#6a2878','#2a0e2e'], tunic:['#4a1a52','#6a2878','#2a0e2e'], leg:['#2a0e2e','#4a1a52'], weapon:'staff', armor:'robe', hat:'feathers'},
  brute:   {skin:['#7ea852','#56803a','#33481f'], hair:['#241812'], hood:['#6c7079','#9aa0aa','#3e4148'], tunic:['#6c7079','#9aa0aa','#4a4d55'], leg:['#3a2a1c','#4a3624'], weapon:'club', armor:'plate', hat:'helm', scale:1.25},
  urr:     {skin:['#6e9a46','#4e7234','#33481f'], hair:['#120c0a'], hood:['#1a1410','#2a2018','#0e0a08'], tunic:['#4e7234','#6e9a46','#33481f'], leg:['#3a2a1c','#4a3624'], weapon:'hammer', armor:'strap', gold:true, crown:true, braids:true, skull:true, tabard:true, pauldron:true, armW:6, scale:1.5},
};
function oScaled(cv, k){ if(!k || k===1) return cv; const c = document.createElement('canvas'); c.width = Math.round(cv.width*k); c.height = Math.round(cv.height*k); const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(cv, 0, 0, c.width, c.height); return c; }

// Uakala, el herrero orco desterrado (dos fotogramas: de pie y martilleando)
ART.uakala = [0, 2].map(f => SP(oCrisp(orcCanvas(f, ORC_CFG.smith)), 24, 54));
const ORC_KIND = {orc:'orc', orcarcher:'archer', orcshaman:'shaman', orcbrute:'brute', urr:'urr'};
for(const id in ORC_KIND){
  const c = ORC_CFG[ORC_KIND[id]], k = (c.scale || 1) * .85;   // todos los orcos un poco más pequeños
  MON_SHAPES[id] = {w:Math.round(64*k), h:Math.round(56*k), ax:Math.round(24*k), ay:Math.round(54*k), canvas:f => oScaled(orcCanvas(f, c), k)};
}
for(const id of ['orc','orcarcher','orcshaman','orcbrute','urr']){
  const dd = MON_SHAPES[id];
  MON_ART[id] = {fr:[0,1,2].map(f => SP(dd.canvas ? dd.canvas(f) : paintSprite(dd.w, dd.h, dd.shapes(f)), dd.ax, dd.ay))};
  MON_ART[id].flash = MON_ART[id].fr.map(s => {
    const c = document.createElement('canvas'); c.width = s.c.width; c.height = s.c.height;
    const g = c.getContext('2d'); g.drawImage(s.c,0,0); g.globalCompositeOperation='source-in'; g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height);
    return {c, ax:s.ax, ay:s.ay};
  });
}
Object.assign(MON_COLORS, {orc:['#56803a','#24351a','#6a4a2e'], orcarcher:['#56803a','#6a4a2e','#8a2a2a'], orcshaman:['#56803a','#ff7a20','#4a1a3e'], orcbrute:['#56803a','#6c7079','#24351a'], urr:['#56803a','#a02828','#ffd040']});

// ---------- props de la cripta ----------
ART.pillar = SP(paintSprite(16,44,[
  {r:[0,38,16,6], c:STONE, tex:103}, {r:[2,4,12,35], c:STONE, tex:104}, {r:[0,0,16,5], c:STONE.slice(1)},
  {l:[6,12,8,22,1], c:STONE[0]}, {l:[8,22,7,30,1], c:STONE[0]}, {p:[[4,34,MOSS[1]],[11,36,MOSS[0]]]},
]), 8, 43);
ART.coffin = SP(paintSprite(14,26,[
  {poly:[[3,0],[11,0],[14,7],[11,26],[3,26],[0,7]], c:WOOD.slice(0,3), tex:105},
  {l:[7,4,7,14,1], c:'#c8962e'}, {l:[4,8,10,8,1], c:'#c8962e'},
]), 7, 25);
ART.bones = SP(paintSprite(14,7,[{l:[1,5,12,2,1.6], c:BONE.slice(1)}, {l:[3,1,11,6,1.6], c:BONE.slice(0,3)}, {e:[2,3,2.2,2], c:BONE}, {p:[[2,3,'#120e10']]}], null), 7, 6);
ART.skullpile = SP(paintSprite(18,11,[
  {e:[4,7,3.5,3.2], c:BONE}, {e:[12,7,3.5,3.2], c:BONE}, {e:[8,4,3.5,3.2], c:BONE},
  {p:[[3,7,'#120e10'],[5,7,'#120e10'],[11,7,'#120e10'],[13,7,'#120e10'],[7,4,'#120e10'],[9,4,'#120e10']]},
]), 9, 10);
ART.brazier = SP(paintSprite(14,16,[
  {l:[3,8,1,16,1.6], c:IRON.slice(0,2)}, {l:[11,8,13,16,1.6], c:IRON.slice(0,2)}, {l:[7,8,7,16,1.6], c:IRON.slice(0,2)},
  {e:[7,6,7,3.5], c:IRON.slice(0,3)}, {e:[7,5,5.5,1.8], c:['#3a1a0a','#6a2a0a']},
]), 7, 15);
ART.candelabra = SP(paintSprite(14,28,[
  {r:[6,8,2,18], c:IRON.slice(0,3)}, {r:[3,25,8,3], c:IRON.slice(0,3)}, {l:[1,10,13,10,1.4], c:IRON.slice(1,3)},
  {r:[1,4,2,6], c:'#e8e0c8'}, {r:[6,2,2,6], c:'#e8e0c8'}, {r:[11,4,2,6], c:'#e8e0c8'},
]), 7, 27);
ART.throne = SP(paintSprite(40,48,[
  {r:[4,0,32,30], c:STONE, tex:106}, {poly:[[4,0],[20,-0],[36,0],[32,6],[8,6]], c:STONE.slice(1)},
  {r:[10,6,20,24], c:['#2a1040','#4a1e6a','#6a2e8a'], tex:107},
  {r:[0,26,40,10], c:STONE, tex:108}, {r:[2,36,8,12], c:STONE}, {r:[30,36,8,12], c:STONE}, {r:[6,30,28,6], c:['#2a1040','#4a1e6a','#6a2e8a']},
  {e:[20,3,3,3], c:['#8a6420','#c8962e','#ffd040']}, {p:[[20,3,'#ff60c0']]},
]), 20, 47);
ART.cobweb = pixBake(16,16,(x,y)=>{ const d = Math.hypot(x,y); return ((x===y) || (x===0) || (y===0) || (Math.abs(d-6)<.5) || (Math.abs(d-11)<.5)) && d < 15 ? '#8a8a90' : null; }, null);

// ---------- farolillos (objeto de equipo), ballesta y lanza ----------
const PAL_SILVER = Object.assign({}, PAL, {b:'#c8ccd4', B:'#e8ecf2', d:'#8a8e98'});
const PAL_SILVER_OFF = Object.assign({}, PAL_SILVER, {y:'#3a3a40', Y:'#4a4a52'});
SPR.lantern.silver = bakeRows(SPR.lantern.rows, PAL_SILVER);
SPR.lantern.silveroff = bakeRows(SPR.lantern.rows, PAL_SILVER_OFF);
const LANT_ROWS = ["....kkkk....", "...kbbbbk...", "..kbbyybbk..", ".kkkkkkkkkk.", ".kbyYYYYybk.", ".kbyYYYYybk.", ".kbyYYYYybk.", ".kbyyYYyybk.", ".kkkkkkkkkk.", "..kbbbbbbk..", "...kkkkkk..."];
ICON_ROWS.lantern = {pal:{b:'#b87333', y:'#ffb347', Y:'#fff1b8'}, rows:LANT_ROWS};
ICON_ROWS.silverlantern = {pal:{b:'#c8ccd4', y:'#ffd88a', Y:'#fff8d8'}, rows:LANT_ROWS};
ICON_ROWS.crossbow = {pal:{b:'#7a5636', B:'#96704a', w:'#e8e0c8', s:'#9aa0aa'}, rows:[
  "............", "ss........ss", "sbss....ssbs", ".sbbssssbbs.", "..sbbwwbbs..", "....kwwk....", "....kBBk....", "....kBBk....", "....kBBk....", "....kbbk....", ".....kk....."]};
ICON_ROWS.spear = {pal:{b:'#7a5636', B:'#96704a', w:'#e8ecf2', s:'#9aa0aa'}, rows:[
  "........kkk.", ".......kwwsk", "......kwwsk.", ".......kwk..", "......kBk...", ".....kBk....", "....kBk.....", "...kBk......", "..kbk.......", ".kbk........", "kbk.........", "kk.........."]};
for(const k of ['lantern','silverlantern','crossbow','spear']){ const d = ICON_ROWS[k]; ICONS[k] = bakeRows(d.rows, Object.assign({k:OUT}, d.pal)); }
