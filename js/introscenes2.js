'use strict';
// =====================================================================
//  Nueva introducción (vista previa): 10 diapositivas con escenas animadas dibujadas por código.
//  Sustituye INTRO_SLIDES, el dibujo del lienzo y UI.showIntro de intro.js al cargarse después de él.
//  Escenas: bosque (introscene.js) → atardecer → Señor de la Noche (imagen) → jaulas → farolillo → cueva → camino
// =====================================================================
const IS2 = {ready:false, sil:{}};

const INTRO2 = [
  {t:'Hubo un tiempo en que el mundo estaba lleno de luz.', scene:'forest'},
  {t:'Las mascotas corrían por los campos y la gente reía bajo el sol.', scene:'forest'},
  {t:'Pero un día el cielo se apagó, y dos ojos rojos se abrieron entre las nubes.', scene:'dusk'},
  {t:'Era él: el Señor de la Noche.', scene:'dusk', sfx:'howl'},
  {t:'Con su magia oscura encerró a todas las mascotas del mundo en jaulas, una a una...', scene:'cages'},
  {t:'...y sin ellas, la luz se apagó. Desde entonces vivimos en una noche eterna.', scene:'cages', red:true},
  {t:'Sus sombras poseyeron a los animales, a los orcos, a los elfos y hasta a los dragones, y esparcieron las jaulas por los rincones del mundo.', scene:'cages', red:true},
  {t:'Pero dicen que quien lleve una luz y un corazón valiente podrá abrirlas... y volver vivo para contarlo.', scene:'lantern'},
  {t:'Una noche, Juan, el sabio, encontró a un viajero encapuchado, medio muerto, a la entrada de una cueva.', scene:'cave'},
  {t:'Nadie sabe su nombre. Solo que lleva un farolillo... y que las mascotas lo esperan. Su viaje empieza ahora.', scene:'walk'},
];

// ---------- recursos (sprites y cachés) ----------
function is2Init(){
  if(IS2.ready) return; IS2.ready = true; ifInit();
  // viajero encapuchado: mismas capas que el héroe y los paseantes, capa gris oscura
  const cl = ['#2c2a38', '#4a4660', '#1a1824'];
  IS2.trav = [0, 1].map(f => SP(oCrisp(orcCanvas(f, {human:true, skin:['#e0b890', '#c09468', '#8a6040'], hair:['#3a2a1a'], hood:cl, tunic:cl, leg:['#3a2c20', '#54402c'], armor:'vest', cloak:true, cloak2:cl})), 24, 54));
  IS2.juan = ART.juan || null;
  IS2.pets = ['bigotes', 'trufa', 'canela', 'brasa', 'humo', 'bellota', 'pio', 'ceniza', 'roca', 'alba', 'nube', 'tizne', 'pico', 'migas', 'selene'].filter(id => PET_ART[id]);
  IS2.eyes = ['#ffe040', '#ff5a3a', '#7affb0', '#7ac8ff', '#ff9ae0'];
  // jaula de hierro: 36×44, con barras, aro de colgar y candado
  const c = document.createElement('canvas'); c.width = 36; c.height = 44; const g = c.getContext('2d');
  g.fillStyle = '#16141c'; g.fillRect(2, 38, 32, 5); g.fillStyle = '#34323e'; g.fillRect(2, 38, 32, 1);
  g.fillStyle = '#16141c'; g.fillRect(3, 6, 30, 3); g.fillStyle = '#3e3c4a'; g.fillRect(3, 6, 30, 1);
  for(let x = 5; x <= 31; x += 5){ g.fillStyle = '#1c1a24'; g.fillRect(x, 8, 2, 31); g.fillStyle = '#4a4858'; g.fillRect(x, 8, 1, 31); }
  g.fillStyle = '#1c1a24'; g.beginPath(); g.moveTo(5, 6); g.lineTo(13, 1); g.lineTo(23, 1); g.lineTo(31, 6); g.closePath(); g.fill();
  g.fillStyle = '#3e3c4a'; g.fillRect(13, 1, 10, 1); g.fillStyle = '#16141c'; g.fillRect(16, 0, 4, 2);
  g.fillStyle = '#b08a24'; g.fillRect(15, 33, 6, 5); g.fillStyle = '#e8c850'; g.fillRect(15, 33, 6, 1); g.fillStyle = '#16141c'; g.fillRect(17, 35, 2, 2);
  IS2.cage = c;
  IS2.logo = new Image(); IS2.logo.src = 'img/logo.webp';
}
// silueta oscura de una mascota (para las jaulas): el sprite con una capa casi negra encima
function is2Sil(id, fr){
  const k = id + fr; if(IS2.sil[k]) return IS2.sil[k];
  const a = PET_ART[id], s = a.fr[fr % a.fr.length], c = document.createElement('canvas'); c.width = s.c.width; c.height = s.c.height;
  const g = c.getContext('2d'); g.drawImage(s.c, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(24,18,40,.72)'; g.fillRect(0, 0, c.width, c.height);
  return IS2.sil[k] = {c, ax:s.ax, ay:s.ay};
}
const is2Sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a)/(b - a))); return t*t*(3 - 2*t); };
function is2Stars(g, bw, bh, t, maxY, n, a0 = 1){
  for(let i = 0; i < n; i++){ const x = hash(i, 1, 71)*bw|0, y = hash(i, 2, 71)*maxY|0, tw = .45 + .55*Math.sin(t*(1 + hash(i, 3, 71)*2) + i*3);
    g.fillStyle = `rgba(255,250,225,${(.25 + .6*tw)*a0})`; g.fillRect(x, y, 1, 1); if(hash(i, 4, 71) > .93){ g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); } }
}
function is2Vignette(g, bw, bh, a){
  const vg = g.createRadialGradient(bw/2, bh/2, bh*.35, bw/2, bh/2, bw*.66); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = vg; g.fillRect(0, 0, bw, bh);
}
function is2Glow(g, x, y, r, rgb, a){
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(.4, `rgba(${rgb},${a*.4})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(x - r, y - r, r*2, r*2);
}
function is2Mist(g, bw, y0, y1, t, a, sp, seed){
  for(let i = 0; i < 12; i++){ const w = 90 + hash(i, 1, seed)*120, x = ((hash(i, 2, seed)*bw*1.4 + t*sp*(.6 + hash(i, 3, seed))) % (bw + w*2)) - w, y = y0 + hash(i, 4, seed)*(y1 - y0);
    g.fillStyle = `rgba(120,108,150,${a*(.5 + hash(i, 5, seed)*.5)})`; g.beginPath(); g.ellipse(x, y, w, 7 + hash(i, 6, seed)*6, 0, 0, Math.PI*2); g.fill(); }
}
// una luz cálida que parpadea
const is2Flick = (t, s = 0) => 1 + Math.sin(t*13 + s)*.04 + Math.sin(t*31 + s*2)*.03 + Math.sin(t*5.3 + s)*.05;
function is2Fireflies(g, bw, bh, t, n, y0, y1, col = '255,240,150'){
  for(let i = 0; i < n; i++){ const x = (hash(i, 1, 81)*bw + 20*Math.sin(t*.5 + i*2)) % bw, y = y0 + hash(i, 2, 81)*(y1 - y0) + 8*Math.sin(t*.7 + i*3), a = .35 + .65*Math.max(0, Math.sin(t*1.3 + i*5));
    g.fillStyle = `rgba(${col},${a*.25})`; g.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3); g.fillStyle = `rgba(${col},${a})`; g.fillRect(Math.round(x), Math.round(y), 1, 1); }
}
// pájaros negros que cruzan el cielo
function is2Crows(g, bw, bh, t, n, y0){
  g.fillStyle = '#0a080e';
  for(let i = 0; i < n; i++){ const x = ((t*(22 + i*5) + i*130) % (bw + 80)) - 40, y = y0 + i*9 + Math.sin(t*1.5 + i)*5, fl = Math.floor(t*5 + i)%2;
    g.fillRect(Math.round(x), Math.round(y), 3, 1); g.fillRect(Math.round(x) - 2, Math.round(y) - (fl ? 1 : 0), 2, 1); g.fillRect(Math.round(x) + 3, Math.round(y) - (fl ? 1 : 0), 2, 1); }
}

// ---------- ESCENA 3: el atardecer se apaga y se abren dos ojos rojos ----------
function is2Dusk(g, bw, bh, t){
  drawIntroForest(g, bw, bh, 26 + t);
  const k = is2Sm(0, 8, t);
  g.fillStyle = `rgba(255,110,40,${.28*Math.sin(Math.min(1, t/6)*Math.PI)})`; g.fillRect(0, 0, bw, bh);        // un último resplandor anaranjado
  g.fillStyle = `rgba(12,10,40,${k*.82})`; g.fillRect(0, 0, bw, bh);                                           // cae la noche
  is2Stars(g, bw, bh, t, IF.hz, 90, k);
  // nubes negras que avanzan desde arriba
  for(let i = 0; i < 9; i++){ const w = 120 + hash(i, 1, 90)*100, x = hash(i, 2, 90)*bw + Math.sin(t*.2 + i)*30, y = -20 + k*(30 + hash(i, 3, 90)*60) * (1 + i%3*.3);
    g.fillStyle = `rgba(8,6,14,${.5*k})`; g.beginPath(); g.ellipse(x, y, w, 22 + hash(i, 4, 90)*14, 0, 0, Math.PI*2); g.fill(); }
  // los ojos: aparecen a los 4 s, parpadean y se agrandan
  const e = is2Sm(4, 9, t), cx = bw/2, cy = bh*.2, sc = .6 + e*1.1, bl = Math.sin(t*.9) > .96 ? .15 : 1;
  if(e > 0){
    is2Glow(g, cx, cy, 160*sc, '255,20,20', .45*e);
    for(const sd of [-1, 1]){ const ex = cx + sd*34*sc, ey = cy + sd*(-2)*sc;
      g.save(); g.translate(ex, ey); g.scale(1, bl); g.fillStyle = `rgba(255,50,30,${e})`; g.beginPath(); g.moveTo(-17*sc, 4*sc*sd); g.quadraticCurveTo(0, -12*sc, 17*sc, -4*sc*sd); g.quadraticCurveTo(0, 12*sc, -17*sc, 4*sc*sd); g.fill();
      g.fillStyle = `rgba(255,230,150,${e})`; g.fillRect(-3, -3*sc, 6, 6*sc); g.restore(); }
  }
  g.fillStyle = `rgba(150,0,0,${.2*e*(.6 + .4*Math.sin(t*3))})`; g.fillRect(0, 0, bw, bh);
  is2Vignette(g, bw, bh, .3 + k*.4);
}

// ---------- ESCENA 5-7: el campo de las jaulas bajo la luna de sangre ----------
function is2Cages(g, bw, bh, t, red){
  const hz = Math.round(bh*.56);
  const sky = g.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, '#05030a'); sky.addColorStop(.7, '#1c0a1c'); sky.addColorStop(1, red ? '#4a1020' : '#2e1226'); g.fillStyle = sky; g.fillRect(0, 0, bw, hz + 2);
  is2Stars(g, bw, bh, t, hz*.8, 70);
  const mx = bw*.74, my = bh*.24, mr = bh*.13;
  is2Glow(g, mx, my, mr*4.2, '255,40,40', .28 + (red ? .12*Math.sin(t*1.6) : 0));
  g.fillStyle = '#9a1c1c'; g.beginPath(); g.arc(mx, my, mr, 0, Math.PI*2); g.fill(); g.fillStyle = '#c83030'; g.beginPath(); g.arc(mx - 3, my - 3, mr*.84, 0, Math.PI*2); g.fill();
  g.fillStyle = 'rgba(80,10,10,.55)'; for(const [dx, dy, r] of [[-.3, -.2, .2], [.25, .1, .26], [-.1, .35, .14]]){ g.beginPath(); g.arc(mx + dx*mr, my + dy*mr, r*mr, 0, Math.PI*2); g.fill(); }
  is2Crows(g, bw, bh, t, 4, bh*.1);
  // montañas y colinas lejanas
  for(const [base, col, amp, sd, sp] of [[hz - 6, '#1a1024', 46, 31, 1.5], [hz + 4, '#120a1a', 30, 47, 3]]){
    for(let x = 0; x < bw; x++){ const n = vnoise((x + t*sp)/80, 0, sd)*.7 + vnoise((x + t*sp)/24, 0, sd + 5)*.3; const top = Math.round(base - amp*n); g.fillStyle = col; g.fillRect(x, top, 1, hz + 6 - top); }
  }
  // un castillo negro con ventanas rojas en la lejanía
  { const cx0 = Math.round(bw*.3 - t*.8), by = hz - 10; g.fillStyle = '#0c0712'; g.fillRect(cx0, by - 26, 18, 30); g.fillRect(cx0 + 22, by - 40, 12, 44); g.fillRect(cx0 + 38, by - 20, 16, 24); g.fillRect(cx0 + 2, by - 32, 4, 6); g.fillRect(cx0 + 24, by - 48, 3, 8); g.fillRect(cx0 + 30, by - 48, 3, 8);
    g.fillStyle = `rgba(255,${60 + 30*Math.sin(t*2)|0},40,.9)`; for(const [dx, dy] of [[6, -18], [10, -10], [26, -30], [28, -20], [44, -12]]) g.fillRect(cx0 + dx, by + dy, 2, 3); }
  // suelo oscuro con brotes secos
  const gr = g.createLinearGradient(0, hz, 0, bh); gr.addColorStop(0, '#171020'); gr.addColorStop(1, '#07050b'); g.fillStyle = gr; g.fillRect(0, hz, bw, bh - hz);
  for(let i = 0; i < bw*bh/260; i++){ const x = hash(i, 1, 72)*bw|0, y = hz + hash(i, 2, 72)*(bh - hz)|0; g.fillStyle = hash(i, 3, 72) > .5 ? 'rgba(60,40,70,.5)' : 'rgba(20,14,28,.7)'; g.fillRect(x, y, 1, 2 + hash(i, 4, 72)*3|0); }
  is2Mist(g, bw, hz - 2, hz + 40, t, .07, 5, 73);
  // tres filas de jaulas con parallax (lejos → cerca)
  const rows = [{y:hz + 22, s:1, sp:5, gap:74, n:0, a:.8}, {y:hz + (bh - hz)*.5, s:1.5, sp:12, gap:120, n:5, a:.95}, {y:bh*1.02, s:2.2, sp:24, gap:230, n:11, a:1}];
  rows.forEach((rw, ri) => {
    const span = Math.ceil((bw + 400)/rw.gap)*rw.gap, cnt = span/rw.gap;
    for(let i = 0; i < cnt; i++){
      const x = ((i*rw.gap - t*rw.sp + rw.n*17) % span + span) % span - 200 + hash(i, ri, 74)*30, id = IS2.pets[(i*3 + ri*5 + rw.n) % IS2.pets.length], ph = hash(i, ri, 75)*6.28;
      const y = rw.y + hash(i, ri, 76)*6 - (ri === 2 ? 10 : 0), W2 = 36*rw.s, H2 = 44*rw.s;
      if(x < -W2 || x > bw + W2) continue;
      g.globalAlpha = rw.a;
      g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.ellipse(x, y, W2*.5, 3*rw.s, 0, 0, Math.PI*2); g.fill();
      // la mascota, en silueta, dentro de la jaula
      const s = is2Sil(id, Math.floor(t*1.4 + ph) % 3), sw = Math.round(s.c.width*rw.s*.78), sh = Math.round(s.c.height*rw.s*.78), pxx = Math.round(x - s.ax*rw.s*.78), pyy = Math.round(y - 4*rw.s - (s.c.height - s.ay)*rw.s*.78 - 2*rw.s + (PET_ART[id].fly ? -10*rw.s : 0));
      const sway = Math.round(Math.sin(t*1.1 + ph)*1.5*rw.s*.3);
      g.drawImage(s.c, pxx + sway, pyy, sw, sh);
      // ojos que brillan y parpadean
      const eo = Math.sin(t*.8 + ph*3) > .93 ? 0 : 1, ec = IS2.eyes[(i + ri) % IS2.eyes.length], ey = pyy + sh*.34, ex = pxx + sw*.56 + sway;
      if(eo){ g.fillStyle = ec; g.fillRect(Math.round(ex - 3*rw.s*.5), Math.round(ey), Math.max(1, rw.s), Math.max(1, rw.s)); g.fillRect(Math.round(ex + 2*rw.s*.5), Math.round(ey), Math.max(1, rw.s), Math.max(1, rw.s));
        g.globalAlpha = rw.a*.25; g.fillRect(Math.round(ex - 5*rw.s*.5), Math.round(ey) - 1, rw.s*4, rw.s*3); g.globalAlpha = rw.a; }
      g.drawImage(IS2.cage, Math.round(x - W2/2), Math.round(y - H2 + 2*rw.s), W2, H2);
    }
    g.globalAlpha = 1;
    if(ri === 0) is2Mist(g, bw, rows[1].y - 16, rows[1].y + 10, t, .06, 8, 77);
  });
  is2Mist(g, bw, bh*.84, bh, t, .08, 12, 78);
  // brasas rojas que suben
  for(let i = 0; i < 26; i++){ const x = (hash(i, 1, 79)*bw + 10*Math.sin(t + i)) % bw, y = bh - ((hash(i, 2, 79)*bh + t*(10 + i%5*4)) % bh); g.fillStyle = `rgba(255,${80 + i*5%80},40,${.3 + .4*Math.sin(t*2 + i)**2})`; g.fillRect(Math.round(x), Math.round(y), 1, 1); }
  if(red){ g.fillStyle = `rgba(160,0,0,${.12 + .08*Math.sin(t*2.2)})`; g.fillRect(0, 0, bw, bh); }
  is2Vignette(g, bw, bh, .62);
}

// ---------- ESCENA 8: un farolillo en la oscuridad ----------
function is2Lantern(g, bw, bh, t){
  g.fillStyle = '#030206'; g.fillRect(0, 0, bw, bh);
  const lx = bw/2 + Math.sin(t*.7)*3, ly = bh*.4 + Math.sin(t*.9)*2, fl = is2Flick(t);
  // ojos que acechan en la oscuridad y se retiran con la luz
  for(let i = 0; i < 14; i++){
    const ang = hash(i, 1, 85)*6.28, base = 150 + hash(i, 2, 85)*140, dist = base - 28*Math.sin(t*.5 + i*2) + (fl - 1)*40, ex = lx + Math.cos(ang)*dist*1.5, ey = ly + 40 + Math.sin(ang)*dist*.7;
    const bl = Math.sin(t*.9 + i*4) > .92 ? 0 : 1, a = bl*(.25 + .55*is2Sm(260, 120, dist)), col = i % 3 ? '255,50,40' : '255,220,80';
    g.fillStyle = `rgba(${col},${a})`; g.fillRect(Math.round(ex), Math.round(ey), 3, 2); g.fillRect(Math.round(ex) + 7, Math.round(ey), 3, 2);
    g.fillStyle = `rgba(${col},${a*.2})`; g.fillRect(Math.round(ex) - 2, Math.round(ey) - 2, 14, 6);
  }
  // una jaula entre las sombras, apenas iluminada
  { const cx = lx + 120, cy = ly + 110; g.globalAlpha = .55; g.drawImage(IS2.cage, Math.round(cx - 36), Math.round(cy - 88), 72, 88); g.globalAlpha = 1;
    const s = is2Sil('bigotes', 0); g.drawImage(s.c, Math.round(cx - s.ax*1.2), Math.round(cy - 52 - s.c.height*.5), Math.round(s.c.width*1.2), Math.round(s.c.height*1.2));
    g.drawImage(IS2.cage, Math.round(cx - 36), Math.round(cy - 88), 72, 88); g.fillStyle = '#ffe040'; g.fillRect(Math.round(cx) - 4, Math.round(cy) - 56, 2, 2); g.fillRect(Math.round(cx) + 3, Math.round(cy) - 56, 2, 2); }
  // luz cálida
  is2Glow(g, lx, ly, 230*fl, '255,170,60', .5);
  is2Glow(g, lx, ly, 90*fl, '255,220,140', .6);
  g.save(); g.globalCompositeOperation = 'lighter'; for(let i = 0; i < 7; i++){ const a = i/7*6.28 + t*.15, r = 120 + 30*Math.sin(t + i); g.fillStyle = 'rgba(255,200,100,.03)'; g.beginPath(); g.moveTo(lx, ly); g.lineTo(lx + Math.cos(a - .08)*r*2, ly + Math.sin(a - .08)*r*2); g.lineTo(lx + Math.cos(a + .08)*r*2, ly + Math.sin(a + .08)*r*2); g.closePath(); g.fill(); } g.restore();
  // el farolillo: asa, marco, cristal y llama
  g.save(); g.translate(Math.round(lx), Math.round(ly)); g.rotate(Math.sin(t*.7)*.03);
  g.fillStyle = '#2a2018'; g.fillRect(-1, -52, 2, 22);                                        // cadena
  g.fillStyle = '#5a4630'; g.fillRect(-8, -30, 16, 3); g.fillRect(-6, -34, 12, 4); g.fillRect(-2, -37, 4, 3);   // tapa
  g.fillStyle = `rgba(255,${200 + 30*Math.sin(t*9)|0},110,.9)`; g.fillRect(-6, -27, 12, 22);   // cristal encendido
  g.fillStyle = '#fff6c8'; g.fillRect(-2, -20, 4, 11); g.fillStyle = '#ffd860'; g.fillRect(-1, -24 - (Math.sin(t*14) > .3 ? 1 : 0), 2, 6);
  g.fillStyle = '#3a2c1c'; g.fillRect(-7, -27, 1, 22); g.fillRect(6, -27, 1, 22); g.fillRect(-1, -27, 2, 22);
  g.fillStyle = '#5a4630'; g.fillRect(-8, -5, 16, 3); g.restore();
  is2Fireflies(g, bw, bh, t, 22, bh*.15, bh*.75, '255,220,130');
  is2Vignette(g, bw, bh, .7);
}

// ---------- ESCENA 9: Juan encuentra al viajero a la entrada de una cueva ----------
function is2Cave(g, bw, bh, t){
  const hz = Math.round(bh*.6);
  const sky = g.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, '#04030c'); sky.addColorStop(1, '#14143a'); g.fillStyle = sky; g.fillRect(0, 0, bw, hz);
  is2Stars(g, bw, bh, t, hz*.9, 110);
  // luna pálida
  is2Glow(g, bw*.8, bh*.17, bh*.3, '170,190,255', .22); g.fillStyle = '#e8eeff'; g.beginPath(); g.arc(bw*.8, bh*.17, bh*.06, 0, Math.PI*2); g.fill(); g.fillStyle = '#c0c8e8'; g.beginPath(); g.arc(bw*.8 - 3, bh*.17 - 2, bh*.04, 0, Math.PI*2); g.fill();
  // la montaña con la boca de la cueva
  const mx = bw*.34;
  for(let x = 0; x < bw; x++){ const d = Math.abs(x - mx)/(bw*.5), top = Math.round(hz - 14 - (1 - Math.min(1, d))*(bh*.5) - vnoise(x/16, 0, 91)*16); g.fillStyle = d < .12 ? '#1a1822' : vnoise(x/6, 1, 92) > .55 ? '#2a2834' : '#221f2c'; g.fillRect(x, top, 1, hz + 20 - top);
    if(top < hz - bh*.38) { g.fillStyle = 'rgba(210,225,255,.55)'; g.fillRect(x, top, 1, 3); } }
  // suelo de roca y nieve
  const gr = g.createLinearGradient(0, hz, 0, bh); gr.addColorStop(0, '#2a2836'); gr.addColorStop(1, '#14121c'); g.fillStyle = gr; g.fillRect(0, hz, bw, bh - hz);
  for(let i = 0; i < bw*bh/240; i++){ const x = hash(i, 1, 93)*bw|0, y = hz + hash(i, 2, 93)*(bh - hz)|0; g.fillStyle = hash(i, 3, 93) > .6 ? 'rgba(200,215,255,.25)' : 'rgba(10,8,16,.5)'; g.fillRect(x, y, 2, 1); }
  // boca de la cueva (oscuridad profunda con borde de roca)
  const cx = mx, cy = hz + 10;
  g.fillStyle = '#0a0810'; g.beginPath(); g.moveTo(cx - 46, cy + 6); g.quadraticCurveTo(cx - 46, cy - 62, cx, cy - 70); g.quadraticCurveTo(cx + 46, cy - 62, cx + 46, cy + 6); g.closePath(); g.fill();
  g.strokeStyle = '#3a3846'; g.lineWidth = 3; g.stroke();
  for(let i = 0; i < 5; i++){ g.fillStyle = '#1c1a26'; g.fillRect(cx - 50 + i*24, cy + 4 + (i%2)*3, 14, 6); }
  // dos ojos amarillos en lo más oscuro de la cueva
  if(Math.sin(t*.6) > -.6){ g.fillStyle = '#ffe040'; g.fillRect(cx - 12, cy - 30, 3, 2); g.fillRect(cx - 4, cy - 30, 3, 2); }
  // luz de Juan (se acerca desde la derecha con un farolillo)
  const jx0 = bw + 30, jx1 = cx + 78, jt = is2Sm(0, 9, t), jx = lerp(jx0, jx1, jt), jy = cy + 26, walking = jt < 1, fl = is2Flick(t, 3);
  const vx = cx - 6, vy = cy + 28;                       // el viajero tumbado
  is2Glow(g, jx - 8, jy - 22, 200*fl, '255,170,70', .42);
  is2Glow(g, vx, vy - 6, 70, '255,170,70', .16*is2Sm(5, 9, t));
  // sombras bajo los personajes
  g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(vx + 4, vy + 2, 22, 4, 0, 0, Math.PI*2); g.fill(); g.beginPath(); g.ellipse(jx, jy + 1, 11, 3, 0, 0, Math.PI*2); g.fill();
  // el viajero, tumbado de lado (respira); se mueve un poco cuando Juan llega
  { const s = IS2.trav[0], br = Math.sin(t*1.6)*.6 + (t > 9 ? Math.sin(t*3)*.4 : 0); g.save(); g.translate(Math.round(vx), Math.round(vy + br*.3)); g.rotate(-Math.PI/2); g.drawImage(s.c, -s.ax, -s.ay + 4); g.restore(); }
  // Juan con su báculo
  { const j = IS2.juan; if(j){ const s = j[Math.floor(t*(walking ? 3.2 : 0))%2] || j[0], bob = walking ? Math.abs(Math.sin(t*6.4))*1.4 : Math.sin(t*1.4)*.5; g.save(); g.translate(Math.round(jx), Math.round(jy - bob)); g.scale(-1, 1); g.drawImage(s.c || s, -(s.ax||0), -(s.ay||0)); g.restore(); }
    // farolillo en la mano
    g.fillStyle = '#5a4630'; g.fillRect(Math.round(jx - 18), Math.round(jy - 26), 5, 1); g.fillStyle = '#ffd070'; g.fillRect(Math.round(jx - 18), Math.round(jy - 25), 5, 6); g.fillStyle = '#fff6c8'; g.fillRect(Math.round(jx - 17), Math.round(jy - 23), 3, 3); }
  // exclamación sobre Juan al verlo
  if(t > 9.2 && t < 12){ const a = is2Sm(9.2, 9.6, t); g.fillStyle = `rgba(255,230,90,${a})`; g.fillRect(Math.round(jx) - 1, Math.round(jy - 62 - Math.sin(t*8)*1.5), 3, 8); g.fillRect(Math.round(jx) - 1, Math.round(jy - 51 - Math.sin(t*8)*1.5), 3, 3); }
  is2Mist(g, bw, hz + 6, hz + 50, t, .06, 4, 94);
  // nieve fina
  for(let i = 0; i < 50; i++){ const x = (hash(i, 1, 95)*bw + t*(6 + i%5) + 10*Math.sin(t + i)) % bw, y = (hash(i, 2, 95)*bh + t*(14 + i%4*5)) % bh; g.fillStyle = `rgba(230,240,255,${.3 + .4*hash(i, 3, 95)})`; g.fillRect(Math.round(x), Math.round(y), 1, 1); }
  is2Fireflies(g, bw, bh, t, 8, hz - 30, hz + 40, '255,220,130');
  is2Vignette(g, bw, bh, .6);
}

// ---------- ESCENA 10: el viajero echa a andar hacia la noche; sale el título ----------
function is2Walk(g, bw, bh, t){
  const hz = Math.round(bh*.5);
  const sky = g.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, '#05040e'); sky.addColorStop(.75, '#1a1030'); sky.addColorStop(1, '#4a1428'); g.fillStyle = sky; g.fillRect(0, 0, bw, hz + 2);
  is2Stars(g, bw, bh, t, hz*.8, 100);
  // el castillo del Señor de la Noche, lejos, con el cielo enrojecido detrás
  is2Glow(g, bw*.7, hz - 30, bw*.45, '220,30,40', .22 + .05*Math.sin(t*.8));
  { const cx0 = Math.round(bw*.64), by = hz - 4; g.fillStyle = '#0a0610'; g.fillRect(cx0, by - 40, 22, 44); g.fillRect(cx0 + 26, by - 66, 14, 70); g.fillRect(cx0 + 44, by - 30, 20, 34); g.fillRect(cx0 + 68, by - 50, 12, 54);
    for(const [dx, w, h] of [[2, 4, 10], [28, 3, 14], [34, 3, 14], [48, 4, 8], [70, 3, 12]]){ g.fillRect(cx0 + dx, by - 40 - h, w, h); }
    g.fillStyle = 'rgba(255,70,40,.9)'; for(const [dx, dy] of [[6, -28], [14, -20], [31, -50], [33, -34], [52, -18], [74, -36]]) if(Math.sin(t*2 + dx) > -.7) g.fillRect(cx0 + dx, by + dy, 2, 3); }
  // colinas en capas que se desplazan despacio
  [['#160c20', 26, 101, 2.4, 8], ['#0e0816', 40, 102, 5, 22], ['#080510', 56, 103, 10, 40]].forEach(([col, amp, sd, sp, off]) => {
    for(let x = 0; x < bw; x++){ const n = vnoise((x + t*sp)/90, 0, sd), top = Math.round(hz + off - amp*n + 6); g.fillStyle = col; g.fillRect(x, top, 1, bh - top); }
  });
  // camino de tierra entre las colinas, hacia el horizonte
  const pcx = bw*.5;
  g.fillStyle = '#2c2030'; g.beginPath(); g.moveTo(pcx - 4, hz + 12); g.lineTo(pcx + 4, hz + 12); g.lineTo(pcx + bw*.28, bh); g.lineTo(pcx - bw*.28, bh); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,200,140,.07)'; for(let i = 0; i < 24; i++){ const f = ((i/24 + t*.08) % 1), y = hz + 12 + f*f*(bh - hz - 12), w = 8 + f*f*bw*.28; g.fillRect(Math.round(pcx - w*.7), Math.round(y), 2 + f*6|0, 1 + f*2|0); g.fillRect(Math.round(pcx + w*.4), Math.round(y), 2 + f*6|0, 1 + f*2|0); }
  // parpadeos de ojos de mascotas enjauladas en la lejanía (a los lados del camino)
  for(let i = 0; i < 16; i++){ const side = i%2 ? 1 : -1, f = .25 + hash(i, 1, 105)*.65, x = pcx + side*(30 + f*f*bw*.4 + hash(i, 2, 105)*50), y = hz + 14 + f*f*(bh - hz)*.8; if(Math.sin(t*.9 + i*3) > -.2){ g.fillStyle = IS2.eyes[i % IS2.eyes.length]; const sz = f > .6 ? 2 : 1; g.fillRect(Math.round(x), Math.round(y), sz, sz); g.fillRect(Math.round(x) + 3*sz, Math.round(y), sz, sz); } }
  // el viajero, de espaldas-perfil, caminando por el camino con el farolillo (cámara lenta)
  const fl = is2Flick(t, 5), tx = pcx - 2 + Math.sin(t*.4)*2, ty = hz + (bh - hz)*.62, sc = 1.9, step = Math.floor(t*2.4)%2, bob = Math.abs(Math.sin(t*4.8))*1.2;
  is2Glow(g, tx + 12, ty - 30, 190*fl, '255,170,70', .46);
  is2Glow(g, tx + 12, ty - 30, 70*fl, '255,220,140', .5);
  g.fillStyle = 'rgba(0,0,0,.5)'; g.beginPath(); g.ellipse(tx, ty + 1, 20, 5, 0, 0, Math.PI*2); g.fill();
  { const s = IS2.trav[step]; g.save(); g.translate(Math.round(tx), Math.round(ty - bob*sc)); g.scale(sc, sc); g.drawImage(s.c, -s.ax, -s.ay); g.restore();
    g.fillStyle = '#5a4630'; g.fillRect(Math.round(tx + 14), Math.round(ty - 42 - bob*sc), 2, 8); g.fillStyle = '#ffd070'; g.fillRect(Math.round(tx + 11), Math.round(ty - 34 - bob*sc), 8, 11); g.fillStyle = '#fff6c8'; g.fillRect(Math.round(tx + 13), Math.round(ty - 31 - bob*sc), 4, 5); }
  is2Fireflies(g, bw, bh, t, 18, hz, bh*.9, '255,220,130');
  // niebla baja
  is2Mist(g, bw, hz + 20, bh, t, .05, 6, 106);
  // el título
  const la = is2Sm(7, 11, t);
  if(la > 0 && IS2.logo.complete && IS2.logo.naturalWidth){ const lw = Math.min(bw*.36, 150), lh = lw*IS2.logo.naturalHeight/IS2.logo.naturalWidth; g.globalAlpha = la; g.drawImage(IS2.logo, Math.round(bw/2 - lw/2), Math.round(bh*.04), Math.round(lw), Math.round(lh)); g.globalAlpha = 1; }
  is2Vignette(g, bw, bh, .55);
}

// ---------- distribuidor de escenas ----------
function drawIntroScene(name, g, bw, bh, t, opts){
  is2Init(); g.imageSmoothingEnabled = false;
  if(name === 'forest') drawIntroForest(g, bw, bh, t);
  else if(name === 'dusk') is2Dusk(g, bw, bh, t);
  else if(name === 'cages') is2Cages(g, bw, bh, t, opts && opts.red);
  else if(name === 'lantern') is2Lantern(g, bw, bh, t);
  else if(name === 'cave') is2Cave(g, bw, bh, t);
  else if(name === 'walk') is2Walk(g, bw, bh, t);
}
// al cambiar de escena se entra desde negro
introSceneFrame = function(now){
  const c = $('introScene'), o = INTRO_SCENE.off, bw = Math.ceil(innerWidth/2), bh = Math.ceil(innerHeight/2), ts = (now - INTRO_SCENE.t0)/1000;
  if(c.width !== innerWidth || c.height !== innerHeight){ c.width = innerWidth; c.height = innerHeight; }
  if(o.width !== bw || o.height !== bh){ o.width = bw; o.height = bh; }
  const og = o.getContext('2d'), st = (now - (INTRO_SCENE.st || INTRO_SCENE.t0))/1000;
  drawIntroScene(INTRO_SCENE.scene || 'forest', og, bw, bh, st + (INTRO_SCENE.scene === 'forest' ? 0 : 0), INTRO_SCENE);
  const fade = 1 - is2Sm(0, 1.4, st); if(fade > 0){ og.fillStyle = `rgba(0,0,0,${fade})`; og.fillRect(0, 0, bw, bh); }
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(o, 0, 0, bw*2, bh*2);
  INTRO_SCENE.raf = requestAnimationFrame(introSceneFrame);
};

// ---------- reproductor ----------
INTRO_SLIDES.length = 0; INTRO2.forEach(s => INTRO_SLIDES.push(s));
UI.showIntro = function(done){
  const box = $('intro'), txt = $('introText'), img = $('introImg'); let i = -1, full = '', pos = 0, timer = null;
  this.introOpen = true; box.classList.remove('hidden'); playMusic && playMusic('den');
  const finish = () => {
    clearInterval(timer); removeEventListener('keydown', onKey, true); box.onclick = null;
    box.classList.add('out'); setTimeout(() => { box.classList.add('hidden'); box.classList.remove('out'); UI.introOpen = false; img.classList.remove('on', 'red'); introSceneStop(); INTRO_SCENE.scene = null; done && done(); }, 700);
  };
  const type = () => { pos = Math.min(full.length, pos + 1); txt.textContent = full.slice(0, pos); if(pos >= full.length) clearInterval(timer); };
  const next = () => {
    if(pos < full.length && i >= 0){ pos = full.length; txt.textContent = full; clearInterval(timer); return; }
    if(++i >= INTRO_SLIDES.length) return finish();
    const sl = INTRO_SLIDES[i]; full = tr(sl.t); pos = 0; txt.textContent = '';
    img.classList.toggle('on', !!sl.img); img.classList.toggle('red', false);
    if(sl.scene){
      if(INTRO_SCENE.scene !== sl.scene){ INTRO_SCENE.scene = sl.scene; INTRO_SCENE.st = performance.now(); }
      INTRO_SCENE.red = !!sl.red;
    }
    introSceneSet(!!sl.scene);
    if(sl.sfx) try { sfx(sl.sfx); } catch(e){}
    $('introHint').textContent = i === INTRO_SLIDES.length - 1 ? 'Clic o [Espacio] para empezar' : 'Clic o [Espacio] para continuar';
    clearInterval(timer); timer = setInterval(type, 32);
  };
  const onKey = e => {
    if(['Space', 'Enter', 'KeyF'].includes(e.code)){ e.preventDefault(); e.stopPropagation(); next(); }
    else if(e.code === 'Escape'){ e.preventDefault(); e.stopPropagation(); finish(); }
  };
  addEventListener('keydown', onKey, true); box.onclick = next; $('introSkip').onclick = e => { e.stopPropagation(); finish(); };
  next();
};
