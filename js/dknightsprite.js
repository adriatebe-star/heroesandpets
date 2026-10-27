'use strict';
// Caballeros del dragón dibujados a mano, pixel a pixel, inspirados en el boceto del usuario:
// hombre-lagarto verde con cuernos, armadura plateada, capa y cola. Cuatro variantes (caballero, arquero,
// mago de chispas y paladín) con su paleta y su arma. Sustituyen al arte por capas de dragonbridge.js.
const DK_VAR = {
  dknight:   {skin:['#2f7a52', '#43a06c', '#1a4a32'], arm:['#eef2fa', '#aab4c6', '#5a6478'], cape:['#8a2a30', '#c8484a', '#4a1018'], cloth:['#27607a', '#4a92b0'], weapon:'sword', scale:1.1},
  dkarcher:  {skin:['#5a8a34', '#7ab048', '#34561c'], arm:['#c8a070', '#8a6a42', '#4a3220'], cape:['#4a5a2a', '#7a8c44', '#222c10'], cloth:['#7a4a22', '#b07a3a'], weapon:'bow', scale:1},
  dkmage:    {skin:['#2f7a8a', '#48a4b4', '#1a4a56'], arm:['#9a7ad8', '#6a4aa8', '#34205a'], cape:['#b8561a', '#f08a2a', '#6a2a08'], cloth:['#e8c030', '#fff0a0'], weapon:'staff', scale:1},
  dkpaladin: {skin:['#4a9a68', '#6ac488', '#256040'], arm:['#fff4c0', '#e0b840', '#8a6a18'], cape:['#d8d4c0', '#ffffff', '#8a8670'], cloth:['#f0e8c8', '#ffffff'], weapon:'hammer', scale:1.1},
};
function dknightCanvas(V, st){   // st: {step:0|1, atk:bool}
  const W = 48, H = 66, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d', {willReadFrequently:true});
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y) + 6, w, h); };
  const Pt = (x, y, col) => R(x, y, 1, 1, col);
  const poly = (pts, col) => {   // relleno por líneas, sin suavizado
    g.fillStyle = col; let y0 = 1e9, y1 = -1e9; for(const p of pts){ y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    for(let y = Math.floor(y0); y <= Math.ceil(y1); y++){
      const xs = []; for(let i = 0; i < pts.length; i++){ const a = pts[i], b = pts[(i + 1) % pts.length]; const ya = a[1], yb = b[1], yy = y + .5; if((ya <= yy && yb > yy) || (yb <= yy && ya > yy)) xs.push(a[0] + (yy - ya)/(yb - ya)*(b[0] - a[0])); }
      xs.sort((p, q) => p - q); for(let i = 0; i + 1 < xs.length; i += 2){ const xa = Math.round(xs[i]), xb = Math.round(xs[i + 1]); if(xb > xa) g.fillRect(xa, y + 6, xb - xa, 1); }
    }
  };
  const [S1, S2, S3] = V.skin, [A1, A2, A3] = V.arm, [C1, C2, C3] = V.cape;
  const sw = st.step ? 1 : 0;
  // cola
  poly([[16, 42], [9, 44], [4, 49], [3, 54], [7, 55], [11, 51], [18, 48]], S2);
  poly([[16, 44], [10, 46], [6, 50], [7, 53], [11, 49], [17, 47]], S1);
  for(const [x, y] of [[9, 44], [6, 47], [4, 51]]) Pt(x, y, S3);
  Pt(3, 55, S3); Pt(4, 55, S3);
  // capa (detrás del cuerpo)
  poly([[17, 20], [13, 24], [10, 38], [7, 54], [19, 55], [24, 46], [25, 26]], C1);
  poly([[17, 21], [14, 26], [11, 40], [9, 53], [14, 53], [17, 40], [19, 26]], C2);
  poly([[22, 30], [24, 46], [19, 55], [15, 55], [20, 44]], C3);
  for(const [x, y] of [[8, 54], [10, 55], [13, 55], [16, 55]]) Pt(x, y, C3);
  // pierna de atrás
  const bl = sw ? 19 : 16, bu = sw ? 2 : 0;
  R(bl, 39, 7, 8 - bu, A2); R(bl, 39, 2, 8 - bu, A1); R(bl + 5, 39, 2, 8 - bu, A3);
  R(bl - 1, 46 - bu, 9, 3, A1); R(bl - 1, 48 - bu, 9, 1, A3);
  R(bl, 49 - bu, 6, 6 - bu, A3); R(bl, 49 - bu, 2, 6 - bu, A2);
  R(bl - 1, 55 - bu * 2, 9, 3, '#34343e'); Pt(bl + 8, 56 - bu * 2, '#e8e0c8'); Pt(bl + 8, 57 - bu * 2, '#e8e0c8'); Pt(bl + 6, 57 - bu * 2, '#e8e0c8');
  // brazo de atrás
  R(10, 23, 4, 7, A3); R(10, 23, 1, 7, A2); R(9, 28, 6, 5, A2); R(9, 28, 2, 5, A1); R(10, 33, 4, 3, S1); Pt(9, 35, '#e8e0c8');
  // torso
  poly([[16, 18], [31, 18], [33, 25], [31, 38], [16, 38], [14, 25]], A2);
  poly([[16, 19], [24, 19], [24, 36], [17, 36], [15, 26]], A1);
  poly([[28, 20], [31, 20], [33, 25], [31, 38], [28, 38]], A3);
  R(23, 20, 1, 15, A3); R(17, 22, 5, 1, A3); R(25, 22, 4, 1, A3); Pt(19, 27, A3); Pt(27, 27, A3);
  // cinturón y falda de escamas
  R(15, 35, 17, 3, '#5a3a22'); R(15, 35, 17, 1, '#8a5a34'); R(22, 35, 4, 3, '#d8b040'); R(23, 36, 2, 1, '#8a6a18');
  poly([[19, 38], [29, 38], [28, 49], [24, 53], [20, 49]], V.cloth[0]);
  poly([[20, 38], [24, 38], [24, 50], [21, 48]], V.cloth[1]);
  for(const [x, y] of [[22, 41], [26, 41], [24, 44], [21, 46], [27, 46], [24, 49]]) Pt(x, y, S3);
  R(19, 38, 1, 11, C1); R(28, 38, 1, 10, C1);
  // pierna de delante
  const fl = sw ? 25 : 26, fu = sw ? 0 : 2;
  R(fl, 39, 7, 8 - fu, A2); R(fl, 39, 2, 8 - fu, A1); R(fl + 5, 39, 2, 8 - fu, A3);
  R(fl - 1, 46 - fu, 9, 3, A1); R(fl - 1, 48 - fu, 9, 1, A3);
  R(fl, 49 - fu, 6, 6 - fu, A2); R(fl, 49 - fu, 2, 6 - fu, A1); R(fl + 4, 49 - fu, 2, 6 - fu, A3);
  R(fl - 1, 55 - fu * 2, 9, 3, '#34343e'); Pt(fl + 8, 56 - fu * 2, '#e8e0c8'); Pt(fl + 8, 57 - fu * 2, '#e8e0c8'); Pt(fl + 6, 57 - fu * 2, '#e8e0c8');
  // hombrera de atrás y cuello
  poly([[9, 19], [14, 16], [17, 17], [17, 24], [11, 25]], A2); R(10, 19, 3, 2, A1); Pt(8, 17, A1); Pt(9, 17, A2);
  R(17, 16, 11, 3, '#8a2a30'); R(17, 16, 11, 1, '#c8484a');
  // cabeza de lagarto (hocico a la derecha)
  poly([[18, 6], [26, 4], [29, 8], [37, 11], [38, 14], [30, 17], [20, 17], [17, 12]], S2);
  poly([[19, 7], [26, 5], [28, 9], [24, 10], [18, 11]], S1);
  poly([[26, 14], [38, 14], [35, 17], [26, 17]], S3);
  R(30, 14, 7, 1, '#1a1010'); Pt(31, 15, '#f4f0e0'); Pt(33, 15, '#f4f0e0'); Pt(35, 15, '#f4f0e0'); Pt(32, 13, '#f4f0e0'); Pt(35, 13, '#f4f0e0');
  R(25, 8, 3, 2, '#f0d040'); Pt(26, 9, '#201008'); Pt(25, 7, S3); Pt(26, 7, S3);
  Pt(36, 11, '#1a1010'); Pt(37, 12, S3);
  for(const [x, y] of [[19, 13], [21, 15], [23, 12], [20, 10]]) Pt(x, y, S3);
  // cuernos curvados hacia atrás
  poly([[19, 6], [17, 2], [14, -2], [12, -3], [15, 0], [17, 5], [21, 8]], '#c8a468');
  poly([[24, 5], [23, 1], [21, -2], [20, -2], [21, 1], [22, 5]], '#c8a468');
  Pt(14, -1, '#f0dca0'); Pt(17, 3, '#f0dca0'); Pt(22, 0, '#f0dca0'); Pt(19, 6, '#7a5a30'); Pt(24, 5, '#7a5a30');
  // hombrera de delante
  poly([[25, 17], [31, 15], [35, 18], [35, 24], [29, 25], [26, 22]], A2); R(27, 17, 5, 2, A1); R(33, 20, 2, 4, A3); Pt(33, 14, A1); Pt(34, 14, A2); Pt(35, 16, A1);
  // brazo de delante y arma
  const atk = st.atk, hx = atk ? 37 : 34, hy = atk ? 22 : 32;
  if(atk){ R(31, 23, 4, 5, S2); R(33, 17, 5, 7, A2); R(33, 17, 2, 7, A1); R(35, 14, 4, 4, S1); }
  else { R(31, 24, 4, 5, S2); R(31, 24, 1, 5, S3); R(30, 28, 6, 5, A2); R(30, 28, 2, 5, A1); R(34, 28, 2, 5, A3); R(31, 33, 5, 3, S1); Pt(36, 35, '#e8e0c8'); }
  g.save(); g.translate(hx + .5, hy + 6); g.rotate(atk ? 1.0 : -.12);
  const Rw = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
  if(V.weapon === 'sword'){ Rw(-1, -26, 3, 26, '#eef2fa'); Rw(1, -26, 1, 26, '#8a94a8'); Rw(0, -28, 1, 2, '#eef2fa'); Rw(-4, 0, 9, 2, '#d8b040'); Rw(-1, 2, 3, 5, '#5a3a22'); Rw(-1, 7, 3, 2, '#d8b040'); }
  else if(V.weapon === 'hammer'){ Rw(-1, -22, 3, 32, '#5a3a22'); Rw(0, -22, 1, 32, '#8a5a34'); Rw(-6, -30, 13, 10, '#c8ccd8'); Rw(-6, -30, 13, 2, '#ffffff'); Rw(-6, -21, 13, 1, '#5a6070'); Rw(5, -29, 2, 8, '#8a94a8'); Rw(-1, -33, 3, 3, '#e0b840'); }
  else if(V.weapon === 'staff'){ Rw(-1, -28, 3, 40, '#4a2a14'); Rw(-1, -28, 1, 40, '#8a5a2a'); Rw(-4, -35, 9, 9, '#ffe84a'); Rw(-3, -34, 7, 7, '#fff8c0'); Rw(-1, -32, 3, 3, '#ffffff'); Rw(-6, -31, 2, 1, '#ffb347'); Rw(5, -31, 2, 1, '#ffb347'); Rw(-1, -38, 3, 2, '#ffb347'); }
  else if(V.weapon === 'bow'){ for(let t = -16; t <= 16; t++){ const x = Math.round(6*Math.cos(t/16*Math.PI/2)); Rw(x + 2, t, 2, 1, '#6a3a18'); Rw(x + 2, t, 1, 1, '#b8783a'); } Rw(2, -16, 1, 33, '#f0ead0'); if(atk) Rw(-10, -1, 12, 1, '#c8a468'); }
  g.restore();
  // contorno oscuro
  const id = g.getImageData(0, 0, W, H), a = id.data, op = new Uint8Array(W*H); for(let i = 0; i < W*H; i++) op[i] = a[i*4+3] > 0 ? 1 : 0;
  for(let y = 0; y < H; y++) for(let x = 0; x < W; x++){ const j = y*W + x; if(op[j]) continue; if((x > 0 && op[j-1]) || (x < W-1 && op[j+1]) || (y > 0 && op[j-W]) || (y < H-1 && op[j+W])){ a[j*4] = 14; a[j*4+1] = 10; a[j*4+2] = 12; a[j*4+3] = 255; } }
  g.putImageData(id, 0, 0);
  return c;
}
for(const id in DK_VAR){
  const V = DK_VAR[id], k = V.scale;
  const mkf = st => SP(oScaled(dknightCanvas(V, st), k), Math.round(21*k), Math.round(62*k));
  const fr = [mkf({step:0}), mkf({step:1}), mkf({step:0, atk:true})];
  MON_ART[id] = {fr, flash:fr.map(s => { const cv = document.createElement('canvas'); cv.width = s.c.width; cv.height = s.c.height; const g = cv.getContext('2d'); g.drawImage(s.c, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); return {c:cv, ax:s.ax, ay:s.ay}; })};
}
