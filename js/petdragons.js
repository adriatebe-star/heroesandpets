'use strict';
// Mascotas dragón dibujadas pixel a pixel (aprobadas por el usuario): una misma figura de 32×26 px con cuernos, alas, punta de cola,
// lomo, ojos y aura distintos y su propia paleta por mascota. Sustituyen al arte por formas (petDragonX/petFrostDragon) de las 13.
// La demo con las 13 está en demo-pet-dragon-pixel.html. Va después de todos los archivos que registran mascotas.
{
// leyenda: k contorno · 1 oscuro · 2 medio · 3 claro · 4 panza · 5 panza clara · h cuerno · e ojo · y brillo · t diente · n nariz · m membrana oscura · M membrana clara · a hueso del ala
const BASE = [
"................................",
".....................kk....kk...",
"....................khhk..khhk..",
"....................khhkkkkhhk..",
"...................k222222222k..",
"..................k2333333333k..",
".................k233333333332k.",
".................k2333eey333332k.",
".................k2333eee333332kk",
".................k23333333333332k",
".................k2333333tkk222k.",
"..................k222222222k....",
"...........kkkkkk.k22222222kk....",
".........kk222222kk222222222k....",
"........k22333222222222222222k...",
"...kk...k2222222222224444422k....",
"..k22k..k22222222222445555542k...",
"..k222kkk22222222222445555542k...",
"...k22222222222222224455554k.....",
"....kkk2222222222222444444k......",
"......kk22222222222222222k.......",
".......kkk2kkkk2kkk22kkkk2kk.....",
"........k22kk22kk.k222k.k22k.....",
"........kkkk.kkk..kkkkk.kkkk.....",
"................................"];
// alas: se dibujan detrás del cuerpo (fotograma 0 arriba, 1 media, 2 abajo)
const WING = [[
".....k.........",
"....kMk........",
"...kMMk....kk..",
"..kMMMk..kMMk..",
".kMMmMkkkMMMk..",
"kMMmmMMMMMMk...",
"kMmmmMMMMMk....",
".kmmmMMMMk.....",
"..kkmmMMk......",
"....kkmk.......",
".....kkk......."],[
"...............",
".kkkk..........",
"kMMMMkkkk......",
"kmMMMMMMMkk....",
".kmmMMMMMMMk...",
"..kkmmmMMMk....",
"....kkkmmk.....",
"......kkk......"],[
"..............",
"......kk......",
".....kMMk.....",
"....kMMMk.....",
"...kMMMk......",
"..kmMMk.......",
".kmmMk........",
"kmmkk.........",
"kkk..........."]];
function pal(c){ // c = [oscuro, medio, claro, panza, panzaClara, membranaOsc, membranaClara, cuerno]
  return {k:'#140a10','1':c[0],'2':c[1],'3':c[2],'4':c[3],'5':c[4],m:c[5],M:c[6],a:c[7],h:c[7],e:'#140a10',y:'#ffffff',t:'#ffffff',n:'#140a10'};
}
const HORNS = {
 short:null,
 long:["....................kk....kk...","...................khhk..khhk..","...................khhk..khhk..","....................khhkkkkhhk.."],
 single:["...........................k....","..........................khk...","..........................khk...","....................kkkkkkkhk.kk.."],
 ears:["................................","................................",".....................kk..kk.....","....................kkkkkkkkkk.."],
 crown:["................................",".....................k..k..k....","....................khkkhkkhk...","....................khhkkhhkhk.."],
 curl:["........................kk......",".....................kk.khk.....","....................khhkhhk.....","....................khhkkkkkhk.."],
};
const WING_F = [[
".......k.......","......kMk......",".....kMMk..kk..","....kMmMk.kMk..","...kMmMMkkMMk..","..kMmMMMMMMk...",".kMmMMMMMMk....",".kMMmMMMMk.....","..kMMmMMk......","...kkMMk.......","....kkk........"],[
"...............","kkk............","kMMkkkkk.......","kMmMMMMMkk.....","kMMmMMMMMMk....","kMmMkMmMkMk....",".kkk.kkk.kk....","..............."],[
"..............",".....kk.......","....kMMk......","...kMmMk......","..kMMmMk......",".kMmMMk.......",".kMkMk........","kMk.kk........","kk............"]];
const WING_S = [[
"..............","....kk........","...kMMk.......","..kmMMk.......","...kkkk......."],[
"..............","..............","...kkk........","..kMMMk.......","...kkkk......."],[
"..............","..............","..............","...kkk........","..kMMmk.......","...kkk........"]];
const WINGS = {bat:WING, feather:WING_F, stub:WING_S};
function pal2(c, eye){ const P = pal(c); P.e = eye || '#140a10'; return P; }
function sprite(frame, wingFrame, P, o){
  const rows = BASE.slice(); const hs = HORNS[o.horn || 'short'];
  if(hs) for(let r = 0; r < 4; r++) rows[r] = hs[r];
  const cv = document.createElement('canvas'); cv.width = 44; cv.height = 38; const g = cv.getContext('2d');
  const px = (x, y, col) => { g.fillStyle = col; g.fillRect(x, y, 1, 1); };
  const put = (rr, ox, oy) => rr.forEach((r, y) => { for(let x = 0; x < r.length; x++){ const ch = r[x]; if(ch === '.') continue; px(ox + x, oy + y, P[ch] || '#f0f'); } });
  const bob = frame === 2 ? 1 : 0, B = 4 + bob, X = 3;
  const W = WINGS[o.wing || 'bat'][wingFrame];
  const anchor = o.wing === 'stub' ? 13 : 14;
  put(W, o.wing === 'stub' ? 11 : 9, B + anchor - (W.length - 1));
  put(rows, X, B);
  if(o.back === 'spikes') for(const x of [12, 14, 16, 18]){ px(X + x, B + 11, P.k); px(X + x, B + 10, P.h); px(X + x, B + 9, P.k); }
  if(o.back === 'fin') for(let k = 0; k < 6; k++){ const x = 11 + k*2, hgt = 2 + (k%2); for(let y = 0; y < hgt; y++) px(X + x, B + 11 - y, P.M); px(X + x, B + 11 - hgt, P.k); }
  if(o.back === 'plates') for(const x of [12, 15, 18]){ px(X + x, B + 11, P.m); px(X + x + 1, B + 11, P.m); px(X + x, B + 10, P.k); px(X + x + 1, B + 10, P.k); }
  const tx = X + 2, ty = B + 15, tf = frame;
  if(o.tail === 'flame'){ const fl = ['#ffd84a', '#ff8a2a', '#ff4a1a']; px(tx, ty - 1, fl[0]); px(tx + 1, ty - 2 - (tf === 1 ? 1 : 0), fl[1]); px(tx - 1, ty - 2, fl[2]); px(tx, ty - 3 - (tf === 2 ? 1 : 0), fl[1]); px(tx + 1, ty - 1, fl[1]); }
  if(o.tail === 'club'){ for(let y = 0; y < 3; y++) for(let x = 0; x < 3; x++) px(tx - 3 + x, ty + y - 1, y === 1 && x === 1 ? P['3'] : P['2']); for(let x = -1; x < 4; x++){ px(tx - 3 + x, ty - 2, P.k); px(tx - 3 + x, ty + 2, P.k); } px(tx - 4, ty - 1, P.k); px(tx - 4, ty, P.k); px(tx - 4, ty + 1, P.k); }
  if(o.tail === 'crystal'){ for(const [x, y] of [[0, -1], [0, -2], [1, -2], [-1, -2], [0, -3]]) px(tx + x, ty + y, y === -3 ? P.k : P.M); px(tx, ty - 4, P.k); }
  if(o.tail === 'bolt'){ for(const [x, y] of [[0, -1], [1, -2], [0, -3], [1, -4]]) px(tx + x, ty + y, '#ffe84a'); px(tx + 1, ty - 1, '#fff6b8'); }
  if(o.tail === 'spade'){ for(const [x, y] of [[-1, 1], [-2, 1], [-2, 0], [-2, 2], [-3, 1]]) px(tx + x, ty + y, P.h); }
  if(o.aura){ const A = AURA[o.aura]; for(let k = 0; k < A.n; k++){ const ph = (k*13 + frame*7*A.sp) % 24, x = 8 + (k*17)%26, yy = A.dir === -1 ? 4 + ph : 30 - ph; if(yy > 1 && yy < 36) px(x, yy, A.col[k % A.col.length]); } }
  return cv;
}
const AURA = {
 ember:{n:6, sp:1, col:['#ffb83a', '#ff6a2a', '#ffe27a']}, snow:{n:7, sp:.6, dir:-1, col:['#ffffff', '#c8f4ff']}, spark:{n:6, sp:2, col:['#ffe84a', '#ffffff']},
 leaf:{n:5, sp:.7, dir:-1, col:['#80e090', '#3a9a52']}, dust:{n:6, sp:.8, dir:-1, col:['#c89a60', '#8a5e30']}, wisp:{n:6, sp:.9, col:['#c8b8f0', '#6a5aa0']},
 glow:{n:7, sp:.5, col:['#fff6b8', '#ffffff']}, wind:{n:6, sp:1.2, dir:-1, col:['#ffffff', '#c8d8e8']}, gold:{n:7, sp:.7, col:['#ffd84a', '#fff0a0']},
};
const DR = [
 ['Brasita Dragón','', ['#5a1008','#b82a14','#ff6a3a','#ffd84a','#fff0a0','#7a1c1c','#ff7a5a','#e8d8b0'], {horn:'short', wing:'bat', tail:'flame', aura:'ember', eye:'#ffe84a'}, 1],
 ['Alita','', ['#1c4a2a','#3a9a52','#80e090','#f4e8a0','#fffbd0','#2a5a3a','#8ad89a','#e8e0b0'], {horn:'ears', wing:'feather', aura:'leaf'}, .9],
 ['Chispín','', ['#14307a','#2a6ae0','#80c0ff','#fff0a0','#ffffff','#1c3a9a','#8ad0ff','#ffe84a'], {horn:'long', wing:'bat', tail:'bolt', aura:'spark'}, .9],
 ['Glacín','mag', ['#16506a','#3aa8c8','#a0ecff','#e8faff','#ffffff','#2a7a9a','#c0f4ff','#ffffff'], {horn:'crown', wing:'bat', tail:'crystal', back:'fin', aura:'snow'}, 1],
 ['Nimbo','mag', ['#5a7088','#a0b8d0','#e8f4ff','#ffffff','#ffffff','#7a98b8','#e8f8ff','#d8e8f8'], {horn:'single', wing:'feather', aura:'wind'}, 1],
 ['Roquín','mag', ['#4a2e14','#8a5e30','#c89a60','#e8d098','#f8ecc0','#5a3a1c','#b88a4a','#e8d8b0'], {horn:'ears', wing:'stub', tail:'club', back:'plates', aura:'dust'}, 1.05],
 ['Lumina','rare', ['#8a6a10','#e0b020','#fff070','#ffffff','#ffffff','#a88418','#fff6b8','#ffffff'], {horn:'curl', wing:'feather', aura:'glow', eye:'#ffffff'}, 1.1],
 ['Tormenta Azul','rare', ['#3a1a7a','#7a4ad8','#c098ff','#e0c8ff','#ffffff','#4a2a9a','#d0b0ff','#ffe84a'], {horn:'long', wing:'bat', tail:'bolt', back:'spikes', aura:'spark', eye:'#ffe84a'}, 1.1],
 ['Cría de Wyvern','mag', ['#4a3a20','#8a7040','#c8a868','#e8dcc0','#ffffff','#5a4828','#e8d098','#f0e0b8'], {horn:'short', wing:'bat', tail:'spade'}, 1],
 ['Pendragón','leg', ['#6a0c0c','#c8281c','#ff7a4a','#ffd84a','#fff0a0','#8a1c1c','#ff9a6a','#ffe08a'], {horn:'crown', wing:'bat', tail:'spade', back:'spikes', aura:'gold', eye:'#ffe84a'}, 1.2],
 ['Ónix','leg', ['#0a0814','#2e2650','#6a5aa0','#8a7ab0','#c8b8f0','#1c1830','#5a4e8a','#c8b8f0'], {horn:'curl', wing:'bat', tail:'crystal', back:'plates', aura:'wisp', eye:'#d8a0ff'}, 1.2],
 ['Boreal','leg', ['#14507a','#3a9ad0','#b0ecff','#e8faff','#ffffff','#2a78b0','#c8f4ff','#ffffff'], {horn:'long', wing:'feather', tail:'crystal', back:'fin', aura:'snow', eye:'#ffffff'}, 1.2],
 ['Drakonar','leg', ['#4a0a08','#a82014','#ff5a2a','#ffc04a','#fff0a0','#7a1810','#ff8a4a','#ffd84a'], {horn:'curl', wing:'bat', tail:'flame', back:'spikes', aura:'ember', eye:'#ffe84a'}, 1.3],
];

const IDS = {'Brasita Dragón':'brasadrago', 'Alita':'alita', 'Chispín':'chispin', 'Glacín':'glacin', 'Nimbo':'nimbo', 'Roquín':'roquin', 'Lumina':'lumina', 'Tormenta Azul':'tormentaazul',
  'Cría de Wyvern':'criawyvern', 'Pendragón':'pendragon', 'Ónix':'onix', 'Boreal':'boreal', 'Drakonar':'drakonar'};
for(const [name, r, c, o] of DR){
  const id = IDS[name], old = PET_ART[id]; if(!old) continue;
  const fr = [0, 1, 2].map(i => SP(sprite(i, i, pal2(c, o.eye), o), 19, 28));
  PET_ART[id] = {fly:old.fly, glow:old.glow, fr, flash:fr.map(s => { const cv = document.createElement('canvas'); cv.width = s.c.width; cv.height = s.c.height; const g = cv.getContext('2d'); g.drawImage(s.c, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); return {c:cv, ax:s.ax, ay:s.ay}; })};
}
}
