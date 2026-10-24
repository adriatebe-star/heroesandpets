'use strict';
// =====================================================================
//  Núcleo: canvas, utilidades, ruido, generador de pixel art, input
// =====================================================================
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const buf = document.createElement('canvas'), b = buf.getContext('2d');    // mundo a resolución de píxel
const darkC = document.createElement('canvas'), dk = darkC.getContext('2d'); // capa de oscuridad
let W = 0, H = 0;
function resize(){ W = cv.width = innerWidth; H = cv.height = innerHeight; }
addEventListener('resize', resize); resize();
// Ctrl + rueda / Ctrl + «+» «−» harían zoom del navegador y mostrarían más mapa: se bloquea
addEventListener('wheel', e => { if(e.ctrlKey) e.preventDefault(); }, {passive:false});
addEventListener('keydown', e => { if((e.ctrlKey || e.metaKey) && ['Equal', 'Minus', 'NumpadAdd', 'NumpadSubtract', 'Digit0', 'Numpad0'].includes(e.code)) e.preventDefault(); });

const PX = 2;                       // cada píxel del mundo ocupa PX×PX píxeles de pantalla
const OUT = '#121015';              // color de contorno
const FONT = '"Silkscreen","Courier New",monospace';

// ---------- utilidades ----------
const clamp = (v,a,c) => Math.max(a, Math.min(c, v));
const rand = (a,c) => a + Math.random()*(c-a);
const randi = (a,c) => Math.floor(rand(a, c+1));
const pick = a => a[Math.floor(Math.random()*a.length)];
const lerp = (a,c,t) => a + (c-a)*t;
const dist = (a,c) => Math.hypot(a.x-c.x, a.y-c.y);
function rng(s){ s = (Math.abs(s|0) % 2147483646) + 1; return () => (s = (s*16807) % 2147483647, (s-1)/2147483646); }
function angDiff(a,c){ let d=a-c; while(d>Math.PI) d-=2*Math.PI; while(d<-Math.PI) d+=2*Math.PI; return d; }
function shuffle(a, r=Math.random){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function wpick(list, r=Math.random){ // [{w, ...}]
  let t = list.reduce((s,o)=>s+o.w,0)*r();
  for(const o of list){ if((t-=o.w) <= 0) return o; }
  return list[list.length-1];
}

// ---------- ruido y dithering ----------
const BAYER = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const dith = (x,y) => BAYER[(y&3)*4+(x&3)]/16 - .5;
function hash(x,y,s){
  let h = (Math.imul(x|0,374761393) + Math.imul(y|0,668265263) + Math.imul(s|0,1442695041))|0;
  h = Math.imul(h^(h>>>13),1274126177);
  return ((h^(h>>>16))>>>0)/4294967296;
}
function vnoise(x,y,s){
  const xi=Math.floor(x), yi=Math.floor(y), xf=x-xi, yf=y-yi;
  const u=xf*xf*(3-2*xf), v=yf*yf*(3-2*yf);
  const a=hash(xi,yi,s), c=hash(xi+1,yi,s), d=hash(xi,yi+1,s), e=hash(xi+1,yi+1,s);
  return a+(c-a)*u+(d-a)*v+(a-c-d+e)*u*v;
}
// cuantiza 0..1 a n tonos con dithering ordenado
const tq = (L,x,y,n,amt=.8) => clamp(Math.floor(L*n + dith(x,y)*amt), 0, n-1);
const hexCache = new Map();
function hex(c){
  let v = hexCache.get(c);
  if(!v){ v = [parseInt(c.slice(1,3),16), parseInt(c.slice(3,5),16), parseInt(c.slice(5,7),16)]; hexCache.set(c,v); }
  return v;
}

// ---------- generadores de sprites ----------
// canvas w×h (+1px de margen) desde fn(x,y)->color|null, con contorno automático
function pixBake(w,h,fn,outline=OUT){
  const W2=w+2, H2=h+2, c=document.createElement('canvas'); c.width=W2; c.height=H2;
  const g=c.getContext('2d'), id=g.createImageData(W2,H2), a=id.data, on=new Uint8Array(W2*H2);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    const col = fn(x,y); if(!col) continue;
    const [r,gg,bb] = hex(col), o = (y+1)*W2+x+1;
    on[o]=1; a[o*4]=r; a[o*4+1]=gg; a[o*4+2]=bb; a[o*4+3]=255;
  }
  if(outline){
    const [r,gg,bb] = hex(outline);
    for(let y=0;y<H2;y++) for(let x=0;x<W2;x++){
      const o=y*W2+x; if(on[o]) continue;
      if((x>0&&on[o-1])||(x<W2-1&&on[o+1])||(y>0&&on[o-W2])||(y<H2-1&&on[o+W2])){ a[o*4]=r; a[o*4+1]=gg; a[o*4+2]=bb; a[o*4+3]=255; }
    }
  }
  g.putImageData(id,0,0); return c;
}
// sprite dibujado a mano: filas de caracteres + paleta (sin margen ni contorno automático)
function bakeRows(rows, pal){
  const w = Math.max(...rows.map(r=>r.length)), c = document.createElement('canvas');
  c.width = w; c.height = rows.length;
  const g = c.getContext('2d');
  rows.forEach((r,y) => [...r].forEach((ch,x) => { if(pal[ch]){ g.fillStyle = pal[ch]; g.fillRect(x,y,1,1); } }));
  return c;
}
// pintor por capas: elipses (e), rectángulos (r), trazos (l), polígonos (poly) y píxeles sueltos (p).
// Cada forma recibe 1..4 tonos (oscuro→claro) y se sombrea con luz desde arriba-izquierda.
function paintSprite(w,h,shapes,outline=OUT){
  const g = new Array(w*h).fill(null);
  const put = (x,y,c) => { if(c && x>=0 && y>=0 && x<w && y<h) g[y*w+x] = c; };
  for(const s of shapes){
    if(!s) continue;
    const T = typeof s.c === 'string' ? [s.c] : s.c;
    const shade = (L,x,y) => T.length===1 ? T[0] : T[tq(L + (s.tex ? (hash(x>>1,y>>1,s.tex)-.5)*.35 : 0), x, y, T.length, s.d ?? .7)];
    if(s.e){
      const [cx,cy,rx,ry] = s.e;
      for(let y=Math.floor(cy-ry-1); y<=cy+ry+1; y++) for(let x=Math.floor(cx-rx-1); x<=cx+rx+1; x++){
        const nx=(x+.5-cx)/rx, ny=(y+.5-cy)/ry; if(nx*nx+ny*ny > 1) continue;
        put(x,y, shade(.55 - nx*.28 - ny*.42 + (s.L||0), x, y));
      }
    } else if(s.r){
      const [rx,ry,rw,rh] = s.r;
      for(let y=ry; y<ry+rh; y++) for(let x=rx; x<rx+rw; x++){
        const nx=((x+.5-rx)/rw-.5)*2, ny=((y+.5-ry)/rh-.5)*2;
        put(x,y, shade(.55 - nx*.22 - ny*.3 + (s.L||0), x, y));
      }
    } else if(s.l){
      const [x0,y0,x1,y1,lw] = s.l, dx=x1-x0, dy=y1-y0, L2=dx*dx+dy*dy || 1, len=Math.sqrt(L2);
      for(let y=Math.floor(Math.min(y0,y1)-lw); y<=Math.max(y0,y1)+lw; y++)
        for(let x=Math.floor(Math.min(x0,x1)-lw); x<=Math.max(x0,x1)+lw; x++){
          const t=clamp(((x+.5-x0)*dx+(y+.5-y0)*dy)/L2,0,1), px=x0+dx*t, py=y0+dy*t;
          const d=Math.hypot(x+.5-px, y+.5-py); if(d > lw/2) continue;
          const side = ((x+.5-px)*-dy + (y+.5-py)*dx)/len;
          put(x,y, shade(.55 + (side<0 ? .22 : -.22) + (s.L||0), x, y));
        }
    } else if(s.poly){
      const P = s.poly; let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
      for(const [x,y] of P){ x0=Math.min(x0,x); y0=Math.min(y0,y); x1=Math.max(x1,x); y1=Math.max(y1,y); }
      for(let y=Math.floor(y0); y<=y1; y++) for(let x=Math.floor(x0); x<=x1; x++){
        let inside=false;
        for(let i=0,j=P.length-1;i<P.length;j=i++){ const [xi,yi]=P[i],[xj,yj]=P[j];
          if((yi>y+.5)!==(yj>y+.5) && x+.5 < (xj-xi)*(y+.5-yi)/(yj-yi)+xi) inside=!inside; }
        if(!inside) continue;
        const nx=((x-x0)/(x1-x0||1)-.5)*2, ny=((y-y0)/(y1-y0||1)-.5)*2;
        put(x,y, shade(.55 - nx*.25 - ny*.35 + (s.L||0), x, y));
      }
    } else if(s.p){
      for(const [x,y,c] of s.p) put(x,y,c||T[0]);
    }
  }
  return pixBake(w,h,(x,y)=>g[y*w+x], outline);
}
// sprite con punto de anclaje (normalmente los pies); ax/ay en coordenadas del sprite sin margen
function SP(c, ax, ay){ return {c, ax:ax+1, ay:ay+1}; }
function drawSP(s, x, y, flip=false){
  x = Math.round(x); y = Math.round(y);
  if(flip){ b.save(); b.translate(x,y); b.scale(-1,1); b.drawImage(s.c, -s.ax, -s.ay); b.restore(); }
  else b.drawImage(s.c, x-s.ax, y-s.ay);
}

// ---------- primitivas pixeladas ----------
function pshadow(x,y,rx,ry,a=.3){
  x=Math.round(x); y=Math.round(y); b.fillStyle=`rgba(0,0,0,${a})`;
  for(let dy=-ry; dy<=ry; dy++){
    const hw = Math.round(rx*Math.sqrt(Math.max(0,1-(dy/(ry+.5))**2)));
    if(hw>0) b.fillRect(x-hw, y+dy, hw*2, 1);
  }
}
function pixLine(x0,y0,x1,y1,w,col){
  const n = Math.max(1, Math.ceil(Math.hypot(x1-x0,y1-y0)));
  b.fillStyle = col;
  for(let i=0;i<=n;i++) b.fillRect(Math.round(x0+(x1-x0)*i/n - w/2), Math.round(y0+(y1-y0)*i/n - w/2), w, w);
}
function pixRing(x,y,rx,ry,col,n=24,s=1){
  b.fillStyle = col;
  for(let i=0;i<n;i++){ const a=i/n*Math.PI*2; b.fillRect(Math.round(x+Math.cos(a)*rx), Math.round(y+Math.sin(a)*ry), s, s); }
}
function ell(x,y,rx,ry){ b.beginPath(); b.ellipse(x,y,rx,ry,0,0,Math.PI*2); }

// ---------- input ----------
const keys = {}, pressed = {}, released = {};
const mouse = {x:0, y:0, l:false, r:false, lp:false, rp:false};
const typing = () => document.activeElement && ['INPUT','TEXTAREA'].includes(document.activeElement.tagName);
addEventListener('keydown', e => {
  if(typing()) return;
  if(['Space','Tab','ShiftLeft','ShiftRight','KeyQ'].includes(e.code)) e.preventDefault();
  if(!keys[e.code]) pressed[e.code] = true;
  keys[e.code] = true;
});
addEventListener('keyup', e => { keys[e.code] = false; released[e.code] = true; });
cv.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
cv.addEventListener('mousedown', e => {
  if(typeof hudSlotAt === 'function'){ const hs = hudSlotAt(e.clientX, e.clientY); if(hs){ e.preventDefault(); hudSlotMouse(hs, e); return; } }   // clic sobre la barra de acciones
  if(e.button===0){ mouse.l = true; mouse.lp = true; }
  if(e.button===2){ mouse.r = true; mouse.rp = true; }
  if(e.button===1 || e.button>=3){ e.preventDefault(); const c = 'Mouse' + e.button; if(!keys[c]) pressed[c] = true; keys[c] = true; }   // rueda y botones laterales: se pueden asignar a la barra de acciones
});
addEventListener('mouseup', e => { if(e.button===0) mouse.l=false; if(e.button===2) mouse.r=false; if(e.button===1 || e.button>=3){ keys['Mouse' + e.button] = false; released['Mouse' + e.button] = true; } });
cv.addEventListener('auxclick', e => e.preventDefault());
cv.addEventListener('contextmenu', e => e.preventDefault());
addEventListener('blur', () => { for(const k in keys) keys[k]=false; mouse.l = mouse.r = false; });
function endInput(){
  for(const k in pressed) pressed[k] = false;
  for(const k in released) released[k] = false;
  mouse.lp = mouse.rp = false;
}
