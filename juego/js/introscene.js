'use strict';
// =====================================================================
//  Escena de introducción: un bosque soleado con gente paseando con sus mascotas (todo dibujado por código)
//  drawIntroForest(g, bw, bh, t) pinta un fotograma en un lienzo de bw×bh píxeles (sin estado: solo depende de t)
// =====================================================================
const IF_LOOP = 30;                                   // segundos que tarda en repetirse el paseo
const IF = {};                                        // cachés (sprites y fondo)

function ifInit(){
  if(IF.ready) return; IF.ready = true;
  const leaf = ['#2a5a2e','#3a7a38','#4a9a42','#62b850','#8edc6a'], trunk = ['#4a3020','#6a4a2c','#8a6438'];
  IF.trees = [1,2,3,4,5,6].map(seed => {
    const R2 = rng(seed*57+3), w = 52 + Math.floor(R2()*16), h = 46 + Math.floor(R2()*10), circ = [[w/2, h*.58, w*.36]];
    for(let i=0;i<6;i++){ const a = R2()*Math.PI*2, d = R2()*.32; circ.push([w/2+Math.cos(a)*w*d, h*.5+Math.sin(a)*h*d*.9, w*(.16+R2()*.12)]); }
    return {canopy:bakeBlob(w, h, circ, leaf, {tex:.35, ao:.45, seed}), trunk:pixBake(10, 26, (x,y) => { if(y < 22 && (x < 1 || x > 8)) return null; let t = x <= 3 ? 2 : x <= 6 ? 1 : 0; if(hash(x, y>>1, seed+11) > .8) t = Math.max(0, t-1); return trunk[t]; })};
  });
  IF.clouds = [1,2,3,4].map(seed => { const R2 = rng(seed*31), w = 70 + Math.floor(R2()*40), h = 26, circ = []; for(let i=0;i<7;i++) circ.push([w*(.15+i*.11), h*(.55 + (R2()-.5)*.3), 8 + R2()*7]); return bakeBlob(w, h, circ, ['#c6d8ea','#e0ecf6','#f4f9fd','#ffffff'], {tex:.1, ao:.2, seed}); });
  // personas: mismas capas que el héroe, con capas de colores y distintos tonos de piel
  const skins = [['#f4d0a8','#d8aa78','#a87848'], ['#e0b088','#c08c5c','#8a5a34'], ['#9a6a44','#7a4c2c','#523018'], ['#f0c8a0','#d8a070','#b07848']];
  const cloaks = [['#3a6a3a','#58944a','#244a28'], ['#3a5a9a','#5a82c8','#24386a'], ['#9a3a3a','#c85a4a','#6a2222'], ['#b08a2a','#d8b04a','#7a5e14'], ['#6a4a8a','#8a68b0','#3e2a58'], ['#2a7a7a','#48a8a0','#1a4e50'], ['#8a5a2a','#b08040','#5a3a18']];
  IF.humans = cloaks.map((cl, i) => { const cfg = {human:true, skin:skins[i % skins.length], hair:['#3a2a1a'], hood:cl, tunic:[cl[0], cl[1], cl[2]], leg:['#4a3624','#6a4a30'], armor:'vest'}; return [0, 1].map(f => SP(oCrisp(orcCanvas(f, cfg)), 24, 54)); });
  IF.pets = ['bigotes','trufa','canela','brasa','humo','bellota','pio','ceniza','roca','alba','nube','tizne'].filter(id => PET_ART[id]);
}

// ---------- fondo estático: cielo, sol, montañas y suelo con camino ----------
function ifBase(bw, bh){
  if(IF.base && IF.base.width === bw && IF.base.height === bh) return IF.base;
  const c = document.createElement('canvas'); c.width = bw; c.height = bh; const g = c.getContext('2d'), hz = Math.round(bh*.44);
  for(let y=0;y<hz+10;y++){ const f = y/(hz+10), r = Math.round(lerp(120, 255, f*f)), gg = Math.round(lerp(196, 240, f)), bb = Math.round(lerp(240, 190, f)); g.fillStyle = `rgb(${r},${gg},${bb})`; g.fillRect(0, y, bw, 1); }
  const sx = bw*.2, sy = bh*.16, gr = g.createRadialGradient(sx, sy, 4, sx, sy, bh*.55); gr.addColorStop(0, 'rgba(255,248,200,.95)'); gr.addColorStop(.25, 'rgba(255,240,170,.45)'); gr.addColorStop(1, 'rgba(255,240,170,0)'); g.fillStyle = gr; g.fillRect(0, 0, bw, hz+10);
  g.fillStyle = '#fffbe0'; g.beginPath(); g.arc(sx, sy, 11, 0, Math.PI*2); g.fill();
  // montañas lejanas con nieve
  for(const [base, col, snow, amp, sd] of [[hz-8, '#a9c4d6', '#f0f6fa', 44, 11], [hz+2, '#8fb0c4', '#e2ecf2', 30, 23]]){
    for(let x=0;x<bw;x++){ const n = vnoise(x/70, 0, sd)*.75 + vnoise(x/22, 0, sd+3)*.25, top = Math.round(base - amp*n - 6); g.fillStyle = col; g.fillRect(x, top, 1, hz+10-top); if(n > .62){ g.fillStyle = snow; g.fillRect(x, top, 1, Math.round((n-.62)*34)); } }
  }
  // suelo: hierba con degradado y moteado
  for(let y=hz;y<bh;y++){ const f = (y-hz)/(bh-hz); g.fillStyle = `rgb(${Math.round(lerp(120,70,f))},${Math.round(lerp(190,140,f))},${Math.round(lerp(80,52,f))})`; g.fillRect(0, y, bw, 1); }
  for(let i=0;i<bw*bh/18;i++){ const x = hash(i,1,41)*bw|0, y = hz + hash(i,2,41)*(bh-hz)|0, f = (y-hz)/(bh-hz); g.fillStyle = hash(i,3,41) > .5 ? `rgba(40,100,40,${.25+f*.2})` : 'rgba(200,240,150,.28)'; g.fillRect(x, y, 2, 1); }
  // camino de tierra que serpentea de izquierda a derecha
  IF.pathY = x => bh*.78 - bh*.09*Math.sin(x/bw*Math.PI*.9 + .4);
  for(let x=-2;x<bw+2;x++){ const cy = IF.pathY(x), wd = 15 + 5*Math.sin(x*.03);
    for(let y=Math.floor(cy-wd); y<=Math.ceil(cy+wd); y++){ const d = Math.abs(y-cy)/wd; g.fillStyle = d > .86 ? '#9a7a48' : d > .7 ? '#b89460' : hash(x,y,43) > .93 ? '#e0c898' : '#d0ae7a'; g.fillRect(x, y, 1, 1); } }
  for(let i=0;i<60;i++){ const x = hash(i,1,44)*bw|0, cy = IF.pathY(x) + (hash(i,2,44)-.5)*20; g.fillStyle = hash(i,3,44) > .5 ? '#8a7650' : '#efe0b8'; g.fillRect(x, Math.round(cy), 2, 1); }
  // flores y matas por la pradera
  const fc = ['#ff6a8a','#ffd84a','#ffffff','#8ab8ff','#ff9a4a'];
  for(let i=0;i<bw*bh/300;i++){ const x = hash(i,1,45)*bw|0, y = hz+6 + hash(i,2,45)*(bh-hz-6)|0; if(Math.abs(y - IF.pathY(x)) < 22) continue; g.fillStyle = '#2f7a34'; g.fillRect(x, y, 1, 3); g.fillStyle = fc[(hash(i,3,45)*5)|0]; g.fillRect(x-1, y-1, 3, 2); g.fillStyle = '#fff6b0'; g.fillRect(x, y-1, 1, 1); }
  IF.base = c; IF.hz = hz; return c;
}

const ifPathY = (x, bw, bh) => bh*.78 - bh*.09*Math.sin(x/bw*Math.PI*.9 + .4);

// ---------- una pasada de fotograma ----------
function drawIntroForest(g, bw, bh, t){
  ifInit(); g.imageSmoothingEnabled = false;
  const base = ifBase(bw, bh), hz = IF.hz;
  g.drawImage(base, 0, 0);
  // nubes y pájaros lejanos
  IF.clouds.forEach((cl, i) => { const sp = 3 + i*1.4, x = ((i*bw*.31 + t*sp) % (bw + 180)) - 120; g.globalAlpha = .92; g.drawImage(cl, Math.round(x), Math.round(bh*(.06 + (i%3)*.07) + Math.sin(t*.2+i)*2)); });
  g.globalAlpha = 1; g.fillStyle = '#3a4a5a';
  for(let i=0;i<5;i++){ const x = ((t*(14+i*3) + i*140) % (bw + 60)) - 30, y = bh*.12 + i*9 + Math.sin(t*2+i)*3, fl = Math.floor(t*6+i)%2; g.fillRect(Math.round(x), Math.round(y), 2, 1); g.fillRect(Math.round(x)+2, Math.round(y) + (fl ? -1 : 1), 2, 1); g.fillRect(Math.round(x)-2, Math.round(y) + (fl ? -1 : 1), 2, 1); }
  // bosque del fondo (dos filas de árboles que se mecen) con sombra bajo ellos
  const row = (y, scale, speed, alpha, n, off) => {
    g.globalAlpha = alpha;
    for(let i=0;i<n;i++){ const tr = IF.trees[(i*7+off) % IF.trees.length], span = n*(tr.canopy.width*scale*.72), x = ((i*tr.canopy.width*scale*.72 - t*speed) % span + span) % span - tr.canopy.width*scale, sway = Math.round(Math.sin(t*1.1 + i*1.7)*1.2*scale);
      const cw = Math.round(tr.canopy.width*scale), ch = Math.round(tr.canopy.height*scale);
      g.drawImage(tr.trunk, Math.round(x + cw/2 - 5*scale), Math.round(y - 10*scale), Math.round(10*scale), Math.round(26*scale)); g.drawImage(tr.canopy, Math.round(x + sway), Math.round(y - ch + 4*scale), cw, ch); }
    g.globalAlpha = 1;
  };
  row(hz + 8, .55, 1.6, .75, 14, 0); row(hz + 22, .8, 3, .92, 11, 3);
  // rayos de sol entre los árboles
  g.save(); g.globalCompositeOperation = 'lighter';
  for(let i=0;i<6;i++){ const x0 = bw*(.05 + i*.17) + Math.sin(t*.25 + i)*10, a = .05 + .03*Math.sin(t*.6 + i*1.3), w = 16 + i*4; g.fillStyle = `rgba(255,240,170,${a})`; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + w, 0); g.lineTo(x0 + w + bh*.5, bh*.85); g.lineTo(x0 + bh*.5 - w*.2, bh*.85); g.fill(); }
  g.restore();
  // paseantes: cada uno con su mascota (o dos); cruzan el camino a distintas velocidades
  const W = [
    {h:0, sp:15, dir:1, ph:0,   pets:['bigotes']},
    {h:1, sp:20, dir:1, ph:.31, pets:['canela','pio']},
    {h:2, sp:12, dir:-1, ph:.62, pets:['trufa']},
    {h:3, sp:23, dir:1, ph:.12, pets:['brasa']},
    {h:4, sp:17, dir:-1, ph:.8, pets:['humo','ceniza']},
    {h:5, sp:14, dir:1, ph:.5,  pets:['bellota']},
    {h:6, sp:11, dir:1, ph:.93, pets:['roca','nube']},
  ];
  const actors = [], span = bw + 200;
  W.forEach((w, wi) => {
    const lane = (wi%4 - 1.5)*7, run = (t*w.sp + w.ph*span*3) % span, x = w.dir > 0 ? run - 100 : bw + 100 - run, y = ifPathY(x, bw, bh) + lane + 6;
    actors.push({kind:'h', x, y, dir:w.dir, hum:IF.humans[w.h % IF.humans.length], ph:wi*1.7, sp:w.sp});
    w.pets.forEach((pid, k) => { if(!PET_ART[pid]) return; const lag = 20 + k*15 + 9*Math.sin(t*1.3 + wi + k*2.1), px = x - w.dir*lag, py = y + (k ? -9 : 7) + 5*Math.sin(t*.9 + wi*2 + k);
      actors.push({kind:'p', x:px, y:py, dir:w.dir, id:pid, ph:wi*2.3 + k, sp:w.sp}); });
  });
  actors.sort((a, b2) => a.y - b2.y);
  for(const a of actors){
    if(a.x < -90 || a.x > bw + 90) continue;
    const bob = Math.abs(Math.sin(t*(a.sp*.34) + a.ph))*1.4;
    g.fillStyle = 'rgba(30,60,30,.28)'; g.beginPath(); g.ellipse(Math.round(a.x), Math.round(a.y)+1, a.kind==='h' ? 11 : 8, 3, 0, 0, Math.PI*2); g.fill();
    let s, yy = a.y;
    if(a.kind === 'h'){ s = a.hum[Math.floor(t*a.sp*.3 + a.ph) % 2]; yy -= bob; }
    else { const art = PET_ART[a.id], seq = [0,1,0,2]; s = art.fr[seq[Math.floor(t*(2 + a.sp*.2) + a.ph) % 4]]; if(art.fly) yy -= 16 + 4*Math.sin(t*4 + a.ph); else yy -= bob*.5; }
    g.save(); g.translate(Math.round(a.x), Math.round(yy)); if(a.dir < 0) g.scale(-1, 1); g.drawImage(s.c, -s.ax, -s.ay); g.restore();
  }
  // una pelota que va y viene entre la primera persona y su gato
  { const w = W[0], run = (t*w.sp + w.ph*span*3) % span, hx = run - 100 + 10, u = (t*.9) % 1, back = Math.sin(u*Math.PI), bx = hx - 8 - (u < .5 ? u*2 : 2 - u*2)*20, by = ifPathY(hx, bw, bh) + 6 - 22 - back*14;
    if(hx > -40 && hx < bw + 40){ g.fillStyle = '#e8483a'; g.fillRect(Math.round(bx), Math.round(by), 3, 3); g.fillStyle = '#ffb0a0'; g.fillRect(Math.round(bx), Math.round(by), 1, 1); } }
  // árboles grandes en primer plano (enmarcan la escena) y matas
  const big = (side, i) => { const tr = IF.trees[i], k = 3.1, cw = Math.round(tr.canopy.width*k), ch = Math.round(tr.canopy.height*k), x = side < 0 ? -cw*.38 : bw - cw*.62, sway = Math.round(Math.sin(t*.8 + i*2)*2);
    g.drawImage(tr.trunk, Math.round(x + cw/2 - 15), Math.round(bh*.98 - 78), 30, 90); g.drawImage(tr.canopy, Math.round(x + sway), Math.round(bh*.98 - 78 - ch + 36), cw, ch); };
  big(-1, 1); big(1, 4);
  // mariposas, hojas que caen y polen
  const bc = ['#ffb040','#ff7090','#80c8ff','#fff070','#d8a0ff'];
  for(let i=0;i<9;i++){ const x = (hash(i,1,60)*bw + 36*Math.sin(t*.35 + i) + t*(3 + i%3)) % bw, y = bh*(.55 + hash(i,2,60)*.4) + 14*Math.sin(t*.9 + i*2), fl = Math.floor(t*9 + i)%2; g.fillStyle = bc[i%5]; g.fillRect(Math.round(x) - 1, Math.round(y) - (fl ? 1 : 0), 1, 2); g.fillRect(Math.round(x) + 1, Math.round(y) - (fl ? 1 : 0), 1, 2); g.fillStyle = '#3a2a1a'; g.fillRect(Math.round(x), Math.round(y), 1, 2); }
  for(let i=0;i<16;i++){ const x = (hash(i,3,61)*bw + t*(8 + i%4*3) + 14*Math.sin(t + i)) % bw, y = ((hash(i,4,61)*bh + t*(12 + i%3*5)) % bh); g.fillStyle = i%2 ? '#d8d048' : '#78b840'; g.fillRect(Math.round(x), Math.round(y), 2, 1); g.fillRect(Math.round(x) + 1, Math.round(y) + 1, 1, 1); }
  g.fillStyle = 'rgba(255,250,200,.8)'; for(let i=0;i<30;i++){ const x = (hash(i,5,62)*bw + t*5) % bw, y = bh*(.2 + hash(i,6,62)*.7) + 6*Math.sin(t*1.4 + i*3); if(Math.sin(t*2 + i*5) > .2) g.fillRect(Math.round(x), Math.round(y), 1, 1); }
  // hierba del borde inferior meciéndose
  for(let x=0;x<bw;x+=3){ const h2 = 5 + hash(x,1,63)*5, sw = Math.sin(t*2 + x*.07)*1.5; g.fillStyle = hash(x,2,63) > .5 ? '#3a8a3c' : '#2a6a30'; g.fillRect(x, Math.round(bh - h2), 1, Math.round(h2)); g.fillRect(x + Math.round(sw), Math.round(bh - h2 - 1), 1, 2); }
  // viñeta suave
  const vg = g.createRadialGradient(bw/2, bh/2, bh*.45, bw/2, bh/2, bw*.62); vg.addColorStop(0, 'rgba(20,40,20,0)'); vg.addColorStop(1, 'rgba(20,40,20,.35)'); g.fillStyle = vg; g.fillRect(0, 0, bw, bh);
}
