'use strict';
// =====================================================================
//  Mapa de incursiones: mundo grande con cámara (arrastrar para mover, rueda para acercar/alejar),
//  terreno detallado y nombres legibles sobre placas
// =====================================================================
const MAP_W = 3800, MAP_H = 2700, MAP_K = 5.5;   // mapa amplio: las expediciones están muy separadas y sus nombres no se solapan
const mapU = (u, v) => [760 + u*2900, 700 + v*1800];            // coordenadas de las expediciones (0..1) → mundo del mapa
const MAP_DEN = {mapX:.08, mapY:.84};
UI.mapCam = null; UI._mapBase = null; UI._mapHits = []; UI._mapHover = null; UI._mapInit = false;

// ---------- terreno (se dibuja una vez en un lienzo grande) ----------
function buildMapBase(){
  const c = document.createElement('canvas'); c.width = MAP_W; c.height = MAP_H; const g = c.getContext('2d');
  const H = (i, j, s) => hash(i, j, 900 + s);
  g.fillStyle = '#cdb98e'; g.fillRect(0, 0, MAP_W, MAP_H);
  for(let i=0;i<14000*MAP_K;i++){ const x = H(i,1,1)*MAP_W, y = H(i,2,1)*MAP_H; g.fillStyle = H(i,3,1) > .5 ? 'rgba(120,90,50,.07)' : 'rgba(255,244,210,.08)'; g.fillRect(x|0, y|0, 2, 2); }
  for(let i=0;i<260*MAP_K;i++){ const x = H(i,4,1)*MAP_W, y = H(i,5,1)*MAP_H, l = 8 + H(i,6,1)*22; g.strokeStyle = 'rgba(110,80,40,.06)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y + (H(i,7,1)-.5)*8); g.stroke(); }   // fibras
  for(let i=0;i<18*MAP_K;i++){ const x = H(i,1,2)*MAP_W, y = H(i,2,2)*MAP_H, r = 60 + H(i,3,2)*140, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(110,80,40,.10)'); gr.addColorStop(1, 'rgba(110,80,40,0)'); g.fillStyle = gr; g.fillRect(x-r, y-r, r*2, r*2); }   // manchas
  // praderas, bosques y zonas áridas (grandes manchas suaves)
  const patch = (u, v, rx, ry, col) => { const [x, y] = mapU(u, v), gr = g.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry)); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.save(); g.translate(x, y); g.scale(1, ry/rx); g.translate(-x, -y); g.fillStyle = gr; g.fillRect(x-rx, y-rx, rx*2, rx*2); g.restore(); };
  const BIOME = {gardenmaze:'rgba(80,170,80,.55)', village:'rgba(120,180,70,.55)', cemetery:'rgba(60,72,72,.55)', crypt:'rgba(70,56,78,.55)', plains:'rgba(222,184,70,.55)', orccamp:'rgba(160,72,40,.55)', castle:'rgba(110,110,122,.5)', river:'rgba(80,150,115,.42)', forest:'rgba(28,92,46,.6)', mine:'rgba(120,86,52,.55)', temple:'rgba(230,220,150,.6)', icepeak:'rgba(238,248,255,.8)', floatcity:'rgba(100,170,205,.45)', timehall:'rgba(140,110,215,.5)', northvillage:'rgba(225,238,250,.85)', jurassic:'rgba(60,170,90,.55)', camelot:'rgba(130,140,180,.5)', space:'rgba(40,30,90,.6)', dragonbridge:'rgba(110,50,56,.6)', dragoncave:'rgba(60,20,70,.62)'};
  for(const e of ALL_EXPS()) if(BIOME[e.id]){ patch(e.mapX, e.mapY, 620, 430, BIOME[e.id]); patch(e.mapX, e.mapY, 380, 270, BIOME[e.id]); }
  patch(.9, .05, 900, 520, 'rgba(90,80,70,.28)');
  // río (de oeste a sur, pasando por El río travieso) con afluente y orillas
  const riv = [[-.28,.37],[.0,.37],[.16,.37],[.26,.42],[.31,.52],[.32,.62],[.33,.76],[.31,.9],[.34,1.1],[.36,1.3]].map(p => mapU(p[0], p[1]));
  const curve = (pts, w, col, dash) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.setLineDash(dash || []); g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for(let i=1;i<pts.length-1;i++){ const mx = (pts[i][0] + pts[i+1][0])/2, my = (pts[i][1] + pts[i+1][1])/2; g.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); } g.lineTo(pts[pts.length-1][0], pts[pts.length-1][1]); g.stroke(); g.setLineDash([]); };
  curve(riv, 24, 'rgba(60,40,20,.32)'); curve(riv, 18, '#5f8ea8'); curve(riv, 10, '#86b4cc'); curve(riv, 2, 'rgba(255,255,255,.55)', [12, 14]);
  const trib = [[.16,.37],[.1,.3],[.06,.26],[.0,.22],[-.1,.2]].map(p => mapU(p[0], p[1])); curve(trib, 14, '#5f8ea8'); curve(trib, 6, '#86b4cc');
  const [lx, ly] = mapU(.52, .06); g.fillStyle = 'rgba(60,40,20,.3)'; g.beginPath(); g.ellipse(lx, ly, 250, 130, .1, 0, Math.PI*2); g.fill(); g.fillStyle = '#6a9ab4'; g.beginPath(); g.ellipse(lx, ly, 236, 118, .1, 0, Math.PI*2); g.fill(); g.fillStyle = '#92bdd2'; g.beginPath(); g.ellipse(lx-10, ly-8, 52, 22, .1, 0, Math.PI*2); g.fill();   // lago
  const riverDist = (x, y) => { let best = 1e9; for(let i=0;i<riv.length-1;i++){ const dx = riv[i+1][0]-riv[i][0], dy = riv[i+1][1]-riv[i][1], t = clamp(((x-riv[i][0])*dx + (y-riv[i][1])*dy)/(dx*dx + dy*dy), 0, 1); best = Math.min(best, Math.hypot(x - riv[i][0] - dx*t, y - riv[i][1] - dy*t)); } return best; };
  const nodePts = ALL_EXPS().map(e => mapU(e.mapX, e.mapY)).concat([mapU(MAP_DEN.mapX, MAP_DEN.mapY)]);
  const nearNode = (x, y, r) => nodePts.some(p => Math.hypot(x-p[0], y-p[1]) < r) || (x - 300 > 0 && false);
  const okSpot = (x, y, rn) => !nearNode(x, y, rn) && riverDist(x, y) > 16 && Math.hypot(x-lx, (y-ly)*1.9) > 250;
  // montañas con sombra y cumbre nevada
  const mount = (x, y, s) => {
    g.fillStyle = 'rgba(60,40,20,.25)'; g.beginPath(); g.ellipse(x+s*.2, y+2, s*1.1, s*.18, 0, 0, Math.PI*2); g.fill();
    g.fillStyle = '#8a7658'; g.beginPath(); g.moveTo(x-s, y); g.lineTo(x, y-s*1.25); g.lineTo(x+s, y); g.fill();
    g.fillStyle = '#6a5840'; g.beginPath(); g.moveTo(x, y-s*1.25); g.lineTo(x+s, y); g.lineTo(x+s*.15, y); g.fill();
    g.fillStyle = '#f3ecdc'; g.beginPath(); g.moveTo(x-s*.34, y-s*.85); g.lineTo(x, y-s*1.25); g.lineTo(x+s*.34, y-s*.85); g.lineTo(x+s*.1, y-s*.7); g.lineTo(x-s*.05, y-s*.85); g.lineTo(x-s*.2, y-s*.68); g.fill();
    g.strokeStyle = 'rgba(40,28,14,.55)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x-s, y); g.lineTo(x, y-s*1.25); g.lineTo(x+s, y); g.stroke();
  };
  const ranges = [[.78, 1.2, -.2, .5, 70], [-.25, .08, -.2, .06, 28], [.6, 1.1, .92, 1.2, 26], [.25, .6, -.2, -.02, 24]];
  for(const [u0, u1, v0, v1, n] of ranges) for(let i=0;i<n*MAP_K*.7;i++){ const [x, y] = mapU(u0 + H(i,1,3+u0*10)*(u1-u0), v0 + H(i,2,3+u0*10)*(v1-v0)); if(okSpot(x, y, 95)) mount(x, y + 8, 20 + H(i,3,4)*30); }
  // colinas
  for(let i=0;i<110*MAP_K;i++){ const x = H(i,1,5)*MAP_W, y = H(i,2,5)*MAP_H; if(!okSpot(x, y, 70)) continue; g.strokeStyle = 'rgba(80,60,30,.45)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 9 + H(i,3,5)*6, Math.PI, 0); g.stroke(); g.beginPath(); g.arc(x+14, y+3, 7, Math.PI, 0); g.stroke(); }
  // bosques: pinos y árboles de copa redonda (más densos en el oeste y el norte)
  const pine = (x, y, s) => { g.fillStyle = 'rgba(40,24,10,.25)'; g.fillRect(x-s*.5, y+s*.55, s, 2); g.fillStyle = '#3a5a32'; g.beginPath(); g.moveTo(x, y-s*1.2); g.lineTo(x-s*.62, y+s*.15); g.lineTo(x+s*.62, y+s*.15); g.fill(); g.fillStyle = '#4a7240'; g.beginPath(); g.moveTo(x, y-s*.7); g.lineTo(x-s*.78, y+s*.6); g.lineTo(x+s*.78, y+s*.6); g.fill(); g.fillStyle = '#5a3a1e'; g.fillRect(x-1, y+s*.6, 2, s*.4); };
  const oak = (x, y, s) => { g.fillStyle = 'rgba(40,24,10,.25)'; g.fillRect(x-s*.7, y+s*.6, s*1.4, 2); g.fillStyle = '#5a3a1e'; g.fillRect(x-1, y+s*.1, 2, s*.55); g.fillStyle = '#4a6a2a'; g.beginPath(); g.arc(x, y-s*.2, s*.65, 0, Math.PI*2); g.fill(); g.fillStyle = '#62882e'; g.beginPath(); g.arc(x-s*.2, y-s*.35, s*.35, 0, Math.PI*2); g.fill(); };
  const forest = (u0, u1, v0, v1, n, pines) => { n = n*MAP_K*.7|0; for(let i=0;i<n;i++){ const [x, y] = mapU(u0 + H(i,1,6+n)*(u1-u0), v0 + H(i,2,6+n)*(v1-v0)); if(!okSpot(x, y, 60)) continue; (pines || H(i,3,6) > .4 ? pine : oak)(x, y, 9 + H(i,4,6)*7); } };
  const E = id => ALL_EXPS().find(e => e.id === id);
  const around = (id, rx, ry, n, fn, seed) => { const e = E(id); if(!e) return; const [px, py] = mapU(e.mapX, e.mapY); for(let i=0;i<n;i++){ const a = H(i,1,40+seed)*6.283, r = Math.sqrt(H(i,2,40+seed)), x = px + Math.cos(a)*rx*r, y = py + Math.sin(a)*ry*r; if(Math.hypot(x-px, (y-py)*1.2) < 80 || !okSpot(x, y, 60)) continue; fn(x, y, 8 + H(i,3,40+seed)*8, i); } };
  const dead = (x, y, s) => { g.strokeStyle = '#3a2e26'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y + s*.6); g.lineTo(x, y - s); g.moveTo(x, y - s*.2); g.lineTo(x - s*.6, y - s*.8); g.moveTo(x, y - s*.5); g.lineTo(x + s*.55, y - s*1.05); g.stroke(); };
  const grave = (x, y, s) => { g.fillStyle = 'rgba(40,24,10,.25)'; g.fillRect(x - s*.5, y + s*.5, s, 2); g.fillStyle = '#8a8a86'; g.fillRect(x - s*.35, y - s*.5, s*.7, s*.95); g.beginPath(); g.arc(x, y - s*.5, s*.35, Math.PI, 0); g.fill(); g.fillStyle = '#5a5a58'; g.fillRect(x - 1, y - s*.4, 2, s*.5); };
  const acacia = (x, y, s) => { g.fillStyle = '#5a3a1e'; g.fillRect(x - 1, y - s*.3, 2, s*.9); g.fillStyle = '#7a8a32'; g.beginPath(); g.ellipse(x, y - s*.5, s*.95, s*.3, 0, 0, Math.PI*2); g.fill(); g.fillStyle = '#9aa83a'; g.beginPath(); g.ellipse(x - s*.2, y - s*.6, s*.5, s*.16, 0, 0, Math.PI*2); g.fill(); };
  const tuft = (x, y, s) => { g.strokeStyle = 'rgba(150,120,40,.8)'; g.lineWidth = 1.4; g.beginPath(); for(const d of [-3, 0, 3]){ g.moveTo(x, y); g.lineTo(x + d, y - s*.6); } g.stroke(); };
  const spike = (x, y, s) => { g.fillStyle = 'rgba(40,24,10,.3)'; g.fillRect(x - s*.4, y + s*.6, s*.8, 2); g.fillStyle = '#4a2a20'; g.beginPath(); g.moveTo(x - s*.35, y + s*.6); g.lineTo(x - s*.1, y - s*1.1); g.lineTo(x + s*.35, y + s*.6); g.fill(); g.fillStyle = '#7a3a28'; g.beginPath(); g.moveTo(x, y + s*.6); g.lineTo(x - s*.1, y - s*1.1); g.lineTo(x + s*.35, y + s*.6); g.fill(); };
  const mound = (x, y, s) => { g.fillStyle = 'rgba(40,24,10,.25)'; g.fillRect(x - s*.8, y + s*.3, s*1.6, 2); g.fillStyle = '#7a7a84'; g.beginPath(); g.ellipse(x, y + s*.3, s*.9, s*.6, 0, Math.PI, 0); g.fill(); g.fillStyle = '#9a9aa4'; g.beginPath(); g.ellipse(x - s*.2, y + s*.2, s*.4, s*.3, 0, Math.PI, 0); g.fill(); };
  const snowPine = (x, y, s) => { pine(x, y, s); g.fillStyle = '#f4f8ff'; g.beginPath(); g.moveTo(x, y - s*1.2); g.lineTo(x - s*.34, y - s*.55); g.lineTo(x + s*.34, y - s*.55); g.fill(); };
  const snowMount = (x, y, s) => { mount(x, y, s); g.fillStyle = 'rgba(245,250,255,.85)'; g.beginPath(); g.moveTo(x - s*.55, y - s*.5); g.lineTo(x, y - s*1.25); g.lineTo(x + s*.55, y - s*.5); g.lineTo(x + s*.2, y - s*.35); g.lineTo(x - s*.1, y - s*.55); g.fill(); };
  const pillar = (x, y, s) => { g.fillStyle = 'rgba(40,24,10,.2)'; g.fillRect(x - s*.4, y + s*.5, s*.8, 2); g.fillStyle = '#f2ecd8'; g.fillRect(x - s*.22, y - s*.6, s*.44, s*1.1); g.fillStyle = '#d8d0b4'; g.fillRect(x - s*.34, y - s*.7, s*.68, s*.18); g.fillRect(x - s*.34, y + s*.4, s*.68, s*.16); };
  const crystal = (x, y, s) => { g.fillStyle = '#7a5ad8'; g.beginPath(); g.moveTo(x - s*.25, y + s*.4); g.lineTo(x, y - s*1.1); g.lineTo(x + s*.25, y + s*.4); g.fill(); g.fillStyle = '#c8b0ff'; g.beginPath(); g.moveTo(x, y + s*.4); g.lineTo(x, y - s*1.1); g.lineTo(x + s*.25, y + s*.4); g.fill(); };
  const hut = (x, y, s) => { g.fillStyle = 'rgba(40,24,10,.25)'; g.fillRect(x - s*.8, y + s*.5, s*1.6, 2); g.fillStyle = '#8a6a44'; g.fillRect(x - s*.6, y - s*.1, s*1.2, s*.7); g.fillStyle = '#a04a30'; g.beginPath(); g.moveTo(x - s*.8, y - s*.1); g.lineTo(x, y - s*.9); g.lineTo(x + s*.8, y - s*.1); g.fill(); };
  const reed = (x, y, s) => { g.strokeStyle = 'rgba(70,100,60,.8)'; g.lineWidth = 1.3; g.beginPath(); for(const d of [-2, 0, 2]){ g.moveTo(x + d, y); g.lineTo(x + d*1.5, y - s*.9); } g.stroke(); };
  around('village', 520, 360, 70, (x, y, s, i) => i % 4 === 0 ? hut(x, y, s*.9) : oak(x, y, s), 1);
  around('cemetery', 540, 380, 110, (x, y, s, i) => i % 3 ? grave(x, y, s*.9) : dead(x, y, s), 2);
  around('crypt', 540, 380, 80, (x, y, s, i) => i % 3 ? mound(x, y, s) : grave(x, y, s*.9), 3);
  around('plains', 600, 420, 110, (x, y, s, i) => i % 3 ? tuft(x, y, s) : acacia(x, y, s), 4);
  around('orccamp', 560, 400, 100, (x, y, s, i) => i % 5 ? spike(x, y, s) : mound(x, y, s*.9), 5);
  around('castle', 560, 400, 80, (x, y, s, i) => i % 4 ? mound(x, y, s) : pine(x, y, s), 6);
  around('river', 520, 380, 80, (x, y, s, i) => i % 3 ? reed(x, y, s) : oak(x, y, s), 7);
  around('forest', 640, 460, 340, (x, y, s, i) => i % 5 ? pine(x, y, s) : oak(x, y, s), 8);
  around('mine', 560, 400, 50, (x, y, s) => mount(x, y + 8, s*1.5), 9);
  around('temple', 560, 400, 70, (x, y, s, i) => i % 3 ? pillar(x, y, s) : oak(x, y, s), 10);
  around('icepeak', 620, 440, 90, (x, y, s, i) => i % 3 ? snowPine(x, y, s) : snowMount(x, y + 8, s*1.5), 11);
  around('floatcity', 700, 470, 50, (x, y, s) => snowPine(x, y, s), 12);
  around('timehall', 520, 380, 36, (x, y, s) => crystal(x, y, s*1.1), 13);
  around('northvillage', 560, 400, 90, (x, y, s, i) => i % 3 ? snowPine(x, y, s) : hut(x, y, s*.9), 17);
  around('gardenmaze', 520, 380, 80, (x, y, s, i) => i % 3 ? oak(x, y, s*.8) : tuft(x, y, s), 22);
  around('dragoncave', 560, 400, 80, (x, y, s, i) => mount(x, y + 8, s*1.5), 19);
  around('dragonbridge', 560, 400, 70, (x, y, s, i) => i % 3 ? mount(x, y + 8, s*1.4) : snowPine(x, y, s), 18);
  around('jurassic', 520, 380, 60, (x, y, s, i) => i % 3 ? oak(x, y, s) : tuft(x, y, s), 14);
  around('camelot', 520, 380, 50, (x, y, s, i) => i % 3 ? mound(x, y, s) : pillar(x, y, s), 15);
  around('space', 520, 380, 40, (x, y, s) => crystal(x, y, s), 16);
  // pantano junto al cementerio, matas de hierba y rocas
  const [cx, cy] = mapU(.4, .6); for(let i=0;i<26;i++){ const x = cx - 130 + H(i,1,7)*260, y = cy + 30 + H(i,2,7)*90; if(!okSpot(x, y, 50)) continue; g.strokeStyle = 'rgba(70,90,50,.7)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x-3, y-7); g.moveTo(x, y); g.lineTo(x, y-9); g.moveTo(x, y); g.lineTo(x+3, y-7); g.stroke(); }
  for(let i=0;i<500*MAP_K;i++){ const x = H(i,1,8)*MAP_W, y = H(i,2,8)*MAP_H; if(!okSpot(x, y, 40)) continue; g.strokeStyle = 'rgba(80,100,50,.45)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x-2, y-4); g.moveTo(x, y); g.lineTo(x+2, y-4); g.stroke(); }
  for(let i=0;i<70*MAP_K;i++){ const x = H(i,1,9)*MAP_W, y = H(i,2,9)*MAP_H; if(!okSpot(x, y, 50)) continue; g.fillStyle = 'rgba(90,76,58,.7)'; g.beginPath(); g.ellipse(x, y, 5, 3, 0, 0, Math.PI*2); g.fill(); g.fillStyle = 'rgba(230,220,200,.5)'; g.fillRect(x-2, y-2, 2, 1); }
  // tierras desconocidas: oscurecimiento en los bordes + rótulos
  const ed = g.createRadialGradient(MAP_W/2, MAP_H/2, MAP_H*.38, MAP_W/2, MAP_H/2, MAP_W*.68); ed.addColorStop(0, 'rgba(70,40,15,0)'); ed.addColorStop(1, 'rgba(70,40,15,.6)'); g.fillStyle = ed; g.fillRect(0, 0, MAP_W, MAP_H);
  g.fillStyle = 'rgba(70,45,20,.38)'; g.font = `italic 22px ${FONT}`; g.textAlign = 'center';
  g.fillText('MONTAÑAS DEL NORTE', MAP_W*.5, 70); g.fillText('TIERRAS DESCONOCIDAS', MAP_W*.5, MAP_H - 50);
  g.save(); g.translate(46, MAP_H*.5); g.rotate(-Math.PI/2); g.fillText('COSTA OLVIDADA', 0, 0); g.restore(); g.save(); g.translate(MAP_W - 46, MAP_H*.5); g.rotate(Math.PI/2); g.fillText('PÁRAMOS DE CENIZA', 0, 0); g.restore();
  // marco doble con esquinas
  g.strokeStyle = 'rgba(60,36,14,.85)'; g.lineWidth = 6; g.strokeRect(8, 8, MAP_W-16, MAP_H-16); g.lineWidth = 2; g.strokeRect(20, 20, MAP_W-40, MAP_H-40);
  for(const [x, y] of [[20,20],[MAP_W-20,20],[20,MAP_H-20],[MAP_W-20,MAP_H-20]]){ g.fillStyle = '#5a3a1a'; g.beginPath(); g.arc(x, y, 9, 0, Math.PI*2); g.fill(); g.fillStyle = '#d8b878'; g.beginPath(); g.arc(x, y, 4, 0, Math.PI*2); g.fill(); }
  // rosa de los vientos y escala
  const rx = MAP_W - 150, ry = MAP_H - 150; g.save(); g.translate(rx, ry);
  g.strokeStyle = 'rgba(60,36,14,.8)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 52, 0, Math.PI*2); g.stroke(); g.beginPath(); g.arc(0, 0, 40, 0, Math.PI*2); g.stroke();
  for(const [a, l, col] of [[-Math.PI/2, 62, '#8a2a1a'], [0, 46, '#4a2e16'], [Math.PI/2, 46, '#4a2e16'], [Math.PI, 46, '#4a2e16']]){ g.fillStyle = col; g.beginPath(); g.moveTo(Math.cos(a)*l, Math.sin(a)*l); g.lineTo(Math.cos(a+1.9)*12, Math.sin(a+1.9)*12); g.lineTo(0, 0); g.lineTo(Math.cos(a-1.9)*12, Math.sin(a-1.9)*12); g.fill(); }
  g.fillStyle = '#3a2410'; g.font = `bold 16px ${FONT}`; g.textAlign = 'center'; g.fillText('N', 0, -70); g.restore();
  g.fillStyle = 'rgba(60,36,14,.8)'; g.fillRect(MAP_W-360, MAP_H-62, 120, 4); g.fillRect(MAP_W-360, MAP_H-68, 2, 14); g.fillRect(MAP_W-240, MAP_H-68, 2, 14); g.fillRect(MAP_W-300, MAP_H-66, 2, 10);
  g.font = `12px ${FONT}`; g.textAlign = 'center'; g.fillText('UN DÍA DE VIAJE', MAP_W-300, MAP_H-76);
  return c;
}

// ---------- iconos de las expediciones (centrados en 0,0) ----------
function mapIcon(g, e, lk){
  const f = lk ? 'rgba(80,70,60,.6)' : '#4a2e16', dk = lk ? 'rgba(40,34,28,.6)' : '#140a04', red = lk ? 'rgba(80,70,60,.6)' : '#a02a1a';
  g.fillStyle = f;
  if(e.locked){ g.font = `30px ${FONT}`; g.textAlign = 'center'; g.fillText('?', 0, 10); return; }
  if(e.id==='village'){ for(const [dx,dy] of [[-14,4],[4,-3],[16,8]]){ g.fillStyle = f; g.fillRect(dx-7, dy-4, 14, 10); g.beginPath(); g.moveTo(dx-9, dy-4); g.lineTo(dx, dy-13); g.lineTo(dx+9, dy-4); g.fill(); g.fillStyle = dk; g.fillRect(dx-2, dy+1, 4, 5); } }
  else if(e.id==='cemetery'){ for(const [dx,dy] of [[-16,6],[0,-4],[16,6]]){ g.fillRect(dx-1.5, dy-12, 3, 18); g.fillRect(dx-7, dy-7, 14, 3); } g.fillStyle = dk; g.fillRect(-20, 14, 40, 2); }
  else if(e.id==='crypt'){ g.fillRect(-16, -6, 32, 16); g.beginPath(); g.moveTo(-20, -6); g.lineTo(0, -20); g.lineTo(20, -6); g.fill(); g.fillStyle = dk; g.fillRect(-4, 0, 8, 10); }
  else if(e.id==='plains'){ for(const [dx,dy] of [[-16,6],[-5,0],[8,5],[18,-2]]){ g.fillRect(dx, dy-4, 1.5, 8); g.fillRect(dx-3, dy-1, 1.5, 6); g.fillRect(dx+3, dy-1, 1.5, 6); } g.beginPath(); g.ellipse(0, 13, 24, 5, 0, 0, Math.PI*2); g.fill(); }
  else if(e.id==='orccamp'){ for(const dx of [-18,-9,0,9,18]){ g.fillRect(dx-1.5, -2, 3, 14); g.beginPath(); g.moveTo(dx-3, -2); g.lineTo(dx, -9); g.lineTo(dx+3, -2); g.fill(); } g.beginPath(); g.moveTo(-10, 2); g.lineTo(0, -14); g.lineTo(10, 2); g.fill(); g.fillStyle = red; g.fillRect(-1, -24, 2, 11); g.fillRect(1, -24, 8, 5); }
  else if(e.id==='castle'){ g.fillRect(-20, -2, 40, 15); for(const dx of [-20,-5,10]){ g.fillRect(dx, -15, 10, 15); for(let k=0;k<3;k++) g.fillRect(dx+k*4, -19, 2, 4); } g.fillStyle = dk; g.fillRect(-4, 4, 8, 9); g.fillStyle = red; g.fillRect(14, -30, 2, 12); g.fillRect(16, -30, 8, 5); }
  else if(e.id==='temple'){ g.fillStyle = lk ? 'rgba(200,196,180,.6)' : '#e8e4d0'; g.beginPath(); g.moveTo(-24, -4); g.lineTo(0, -20); g.lineTo(24, -4); g.fill(); g.fillRect(-22, -4, 44, 3); for(const dx of [-17,-6,5,16]) g.fillRect(dx, -1, 5, 14); g.fillRect(-24, 13, 48, 3); g.fillStyle = lk ? 'rgba(160,140,60,.6)' : '#ffd23a'; g.fillRect(-2, -14, 4, 4); }
  else if(e.id==='floatcity'){ g.fillStyle = lk ? 'rgba(80,100,120,.6)' : '#3a7a9a'; g.fillRect(-26, 8, 52, 7); g.fillStyle = lk ? 'rgba(90,70,50,.6)' : '#7a5232'; g.fillRect(-22, 0, 14, 10); g.fillRect(2, -4, 20, 14); g.fillStyle = lk ? 'rgba(60,90,100,.6)' : '#3a8a9a'; g.beginPath(); g.moveTo(-25, 0); g.lineTo(-15, -9); g.lineTo(-5, 0); g.fill(); g.beginPath(); g.moveTo(0, -4); g.lineTo(12, -16); g.lineTo(24, -4); g.fill(); g.fillStyle = f; g.fillRect(-4, 6, 8, 3); }
  else if(e.id==='timehall'){ g.strokeStyle = lk ? 'rgba(120,110,160,.6)' : '#8a7ad8'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 16, 0, Math.PI*2); g.stroke(); g.fillStyle = lk ? 'rgba(60,50,90,.6)' : '#2a1a6a'; g.beginPath(); g.arc(0, 0, 13, 0, Math.PI*2); g.fill(); g.strokeStyle = lk ? 'rgba(160,150,200,.6)' : '#e8e0ff'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -10); g.moveTo(0, 0); g.lineTo(7, 3); g.stroke(); }
  else if(e.id==='icepeak'){ g.fillStyle = lk ? 'rgba(180,196,214,.6)' : '#dce8f4'; g.beginPath(); g.moveTo(-26, 14); g.lineTo(-8, -14); g.lineTo(2, -2); g.lineTo(12, -22); g.lineTo(28, 14); g.fill(); g.fillStyle = lk ? 'rgba(120,140,170,.6)' : '#7a9ac0'; g.beginPath(); g.moveTo(12, -22); g.lineTo(21, -2); g.lineTo(9, -5); g.fill(); g.beginPath(); g.moveTo(-8, -14); g.lineTo(-2, -3); g.lineTo(-14, -5); g.fill(); g.fillStyle = lk ? 'rgba(160,190,230,.6)' : '#8ad8ff'; for(const dx of [-12, 0, 8]){ g.fillRect(dx, 4, 1.5, 9); g.fillRect(dx + 4, 6, 1.5, 7); } }
  else if(e.id==='dragonbridge'){ g.fillStyle = lk ? 'rgba(40,30,40,.6)' : '#1a1020'; g.fillRect(-28, 4, 56, 10); g.fillStyle = lk ? 'rgba(120,110,120,.6)' : '#6a6070'; g.fillRect(-28, 0, 56, 6); g.fillStyle = dk; g.beginPath(); g.arc(0, 14, 14, Math.PI, 0); g.fill(); g.fillStyle = lk ? 'rgba(200,80,40,.6)' : '#e8501a'; g.beginPath(); g.moveTo(-18, -2); g.lineTo(-10, -18); g.lineTo(-4, -6); g.lineTo(0, -22); g.lineTo(4, -6); g.lineTo(10, -18); g.lineTo(18, -2); g.fill(); }
  else if(e.id==='northvillage'){ g.fillStyle = lk ? 'rgba(60,50,40,.6)' : '#5a3a22'; g.fillRect(-22, -2, 44, 15); g.fillStyle = lk ? 'rgba(180,196,214,.6)' : '#e8f0f8'; g.beginPath(); g.moveTo(-26, -2); g.lineTo(-14, -16); g.lineTo(14, -16); g.lineTo(26, -2); g.fill(); g.fillStyle = dk; g.fillRect(-4, 4, 8, 9); g.strokeStyle = lk ? 'rgba(120,120,120,.6)' : '#c8ccd4'; g.lineWidth = 3; g.beginPath(); g.moveTo(-16, -16); g.lineTo(-22, -24); g.moveTo(16, -16); g.lineTo(22, -24); g.stroke(); }
  else if(e.id==='jurassic'){ g.fillStyle = lk ? 'rgba(80,70,60,.6)' : '#5a3a22'; g.beginPath(); g.moveTo(-24, 14); g.lineTo(-4, -16); g.lineTo(16, 14); g.fill(); g.fillStyle = lk ? 'rgba(160,80,50,.6)' : '#e8501a'; g.beginPath(); g.moveTo(-9, -10); g.lineTo(-4, -16); g.lineTo(1, -10); g.lineTo(-4, -6); g.fill();
    g.strokeStyle = '#4a2e16'; g.lineWidth = 3; g.beginPath(); g.moveTo(20, 14); g.lineTo(22, -6); g.stroke(); g.fillStyle = lk ? 'rgba(70,90,60,.6)' : '#2f8a3a'; for(const [dx, dy] of [[-8, -4], [8, -6], [-5, 4], [10, 3]]){ g.beginPath(); g.ellipse(22 + dx, -8 + dy, 8, 3, dx*.05, 0, Math.PI*2); g.fill(); } }
  else if(e.id==='camelot'){ g.fillRect(-22, -2, 44, 15); for(const dx of [-22, -6, 10]){ g.fillRect(dx, -16, 12, 16); for(let k = 0; k < 3; k++) g.fillRect(dx + k*5, -20, 3, 4); } g.fillStyle = dk; g.fillRect(-4, 4, 8, 9); g.fillStyle = lk ? 'rgba(70,90,150,.6)' : '#2a5ac8'; g.fillRect(-1, -30, 2, 12); g.fillRect(1, -30, 11, 7); g.fillStyle = lk ? 'rgba(160,140,60,.6)' : '#ffd84a'; g.fillRect(4, -28, 4, 3); }
  else if(e.id==='space'){ g.fillStyle = lk ? 'rgba(80,80,100,.6)' : '#8a90a8'; g.beginPath(); g.ellipse(0, 2, 24, 8, 0, 0, Math.PI*2); g.fill(); g.fillStyle = lk ? 'rgba(50,50,70,.6)' : '#2a2e3a'; g.beginPath(); g.ellipse(0, 2, 18, 4.5, 0, 0, Math.PI*2); g.fill(); g.fillStyle = lk ? 'rgba(90,90,110,.6)' : '#c8cee0'; g.beginPath(); g.arc(0, -4, 9, 0, Math.PI*2); g.fill(); g.fillStyle = lk ? 'rgba(120,40,40,.6)' : '#ff3a2a'; g.beginPath(); g.arc(0, -4, 3.5, 0, Math.PI*2); g.fill(); g.fillStyle = '#05050a'; g.fillRect(14, -22, 5, 16); }
  else if(e.id==='river'){ g.strokeStyle = lk ? 'rgba(80,90,100,.6)' : '#3a6a88'; g.lineWidth = 4; for(const dy of [-8, 0, 8]){ g.beginPath(); g.moveTo(-22, dy); g.bezierCurveTo(-12, dy-6, -6, dy+6, 2, dy); g.bezierCurveTo(10, dy-6, 16, dy+6, 22, dy); g.stroke(); } g.fillStyle = f; g.fillRect(-18, -14, 4, 28); g.fillRect(14, -14, 4, 28); g.fillRect(-18, -14, 36, 3); }
  else if(e.id==='forest'){ for(const [dx,dy,s] of [[-14,4,.8],[0,-2,1.1],[14,5,.8]]){ g.fillStyle = lk ? 'rgba(70,80,60,.6)' : '#2e5a30'; g.beginPath(); g.moveTo(dx, dy-20*s); g.lineTo(dx-9*s, dy+2); g.lineTo(dx+9*s, dy+2); g.fill(); g.beginPath(); g.moveTo(dx, dy-12*s); g.lineTo(dx-12*s, dy+10*s); g.lineTo(dx+12*s, dy+10*s); g.fill(); g.fillStyle = f; g.fillRect(dx-1, dy+9*s, 2, 5); } g.fillStyle = lk ? 'rgba(150,140,110,.6)' : '#e8d070'; g.beginPath(); g.moveTo(0, -30); g.lineTo(2, -25); g.lineTo(7, -24); g.lineTo(3, -21); g.lineTo(4, -16); g.lineTo(0, -19); g.lineTo(-4, -16); g.lineTo(-3, -21); g.lineTo(-7, -24); g.lineTo(-2, -25); g.fill(); }
  else if(e.id==='mine'){ g.fillStyle = lk ? 'rgba(80,76,70,.6)' : '#6a5a48'; g.beginPath(); g.moveTo(-24, 14); g.lineTo(-10, -12); g.lineTo(0, -4); g.lineTo(12, -16); g.lineTo(26, 14); g.fill(); g.fillStyle = dk; g.fillRect(-9, 0, 18, 14); g.fillStyle = f; g.fillRect(-11, -2, 3, 16); g.fillRect(8, -2, 3, 16); g.fillRect(-11, -4, 22, 3);
    g.strokeStyle = lk ? 'rgba(120,120,120,.6)' : '#c8ccd4'; g.lineWidth = 3; g.beginPath(); g.moveTo(14, -24); g.lineTo(24, -10); g.stroke(); g.beginPath(); g.arc(14, -22, 8, Math.PI*1.1, Math.PI*1.9); g.stroke(); }
  else { g.font = `26px ${FONT}`; g.textAlign = 'center'; g.fillText('?', 0, 9); }
}
function mapDenIcon(g){ g.fillStyle = '#3a2a1a'; g.beginPath(); g.ellipse(0, 0, 20, 13, 0, Math.PI, 0); g.fill(); g.fillRect(-20, 0, 40, 3); g.fillStyle = '#0c0a08'; g.beginPath(); g.ellipse(0, 0, 9, 8, 0, Math.PI, 0); g.fill(); }

// ---------- cámara y dibujo ----------
UI.mapEnsureCam = function(c){
  if(!this.mapCam){ const e0 = EXPEDITIONS.find(q => q.id === this.mapSel) || EXPEDITIONS[0], [x, y] = mapU(e0.mapX, e0.mapY); this.mapCam = {x, y, z:clamp(Math.min(c.width/1500, c.height/900), .55, .85)}; }
  const cam = this.mapCam; cam.z = clamp(cam.z, .4, 1.5);
  const vw = c.width/cam.z, vh = c.height/cam.z;
  cam.x = vw >= MAP_W ? MAP_W/2 : clamp(cam.x, vw/2, MAP_W - vw/2); cam.y = vh >= MAP_H ? MAP_H/2 : clamp(cam.y, vh/2, MAP_H - vh/2);
};
UI.renderRaidMap = function(){
  const c = $('mapCanvas'), wrap = c.parentElement;
  const cw = Math.max(320, Math.round(wrap.clientWidth)), ch = Math.max(220, Math.round(wrap.clientHeight));
  if(c.width !== cw || c.height !== ch){ c.width = cw; c.height = ch; }
  this.mapEnsureCam(c);
  const mk = (G.save && G.save.qs && G.save.qs.garden ? 1 : 0) + (G.save && G.save.gardenFound ? 2 : 0); if(!this._mapBase || this._mapKey !== mk){ this._mapKey = mk; this._mapBase = buildMapBase(); }
  const g = c.getContext('2d'), cam = this.mapCam, Wm = c.width, Hm = c.height, sx = x => (x - cam.x)*cam.z + Wm/2, sy = y => (y - cam.y)*cam.z + Hm/2;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#2a1c10'; g.fillRect(0, 0, Wm, Hm);
  g.imageSmoothingEnabled = true; g.drawImage(this._mapBase, sx(0), sy(0), MAP_W*cam.z, MAP_H*cam.z);
  // caminos punteados
  g.strokeStyle = 'rgba(90,45,20,.9)'; g.lineWidth = Math.max(2, 3.5*cam.z); g.setLineDash([8*cam.z + 3, 7*cam.z + 3]); g.lineCap = 'butt'; g.beginPath();
  ALL_EXPS().forEach((e, i) => {
    const o = e.from ? ALL_EXPS().find(q => q.id === e.from) : i === 0 ? MAP_DEN : EXPEDITIONS[i-1], [ax, ay] = mapU(o.mapX, o.mapY), [bx, by] = mapU(e.mapX, e.mapY);
    g.moveTo(sx(ax), sy(ay)); g.quadraticCurveTo(sx((ax+bx)/2), sy(Math.min(ay, by) - 40 + (Math.abs(ax-bx) < 50 ? 40 : 0)), sx(bx), sy(by));
  });
  g.stroke(); g.setLineDash([]);
  // guarida y expediciones
  const ik = clamp(1/cam.z*.8, .85, 1.5), hits = [];
  const [dx0, dy0] = mapU(MAP_DEN.mapX, MAP_DEN.mapY);
  g.save(); g.translate(sx(dx0), sy(dy0)); g.scale(ik, ik); mapDenIcon(g); g.restore();
  const plate = (txt, x, y, opt={}) => {
    g.font = `${opt.sz || 13}px ${FONT}`; const w = g.measureText(txt).width + 18, h = (opt.sz || 13) + 12, bx = Math.round(x - w/2), by = Math.round(y);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(bx+2, by+3, w, h);
    g.fillStyle = opt.bg || 'rgba(36,22,12,.93)'; g.fillRect(bx, by, w, h); g.strokeStyle = opt.border || '#c8a060'; g.lineWidth = 2; g.strokeRect(bx + 1, by + 1, w - 2, h - 2);
    g.fillStyle = opt.col || '#f8ecc8'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, x, by + h/2 + 1); g.textBaseline = 'alphabetic';
  };
  plate('Guarida', sx(dx0), sy(dy0) + 24*ik, {sz:12, border:'#8a6a3a'});
  const taken = [];
  for(const e of ALL_EXPS()){
    const [wx, wy] = mapU(e.mapX, e.mapY), x = sx(wx), y = sy(wy), sel = this.mapSel === e.id, hov = this._mapHover === e.id, lk = expLocked(e);
    if(x < -80 || y < -80 || x > Wm + 80 || y > Hm + 80) { hits.push({id:e.id, x, y, r:0}); continue; }
    if(sel || hov){ const gr = g.createRadialGradient(x, y, 6, x, y, 52*ik); gr.addColorStop(0, sel ? 'rgba(255,220,120,.55)' : 'rgba(255,240,200,.35)'); gr.addColorStop(1, 'rgba(255,220,120,0)'); g.fillStyle = gr; g.fillRect(x-60*ik, y-60*ik, 120*ik, 120*ik);
      g.strokeStyle = sel ? '#b0401a' : '#8a6a3a'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 34*ik, 0, Math.PI*2); g.stroke(); }
    g.save(); g.translate(x, y); g.scale(ik, ik); mapIcon(g, e, lk); g.restore();
    if(e.boss && !e.locked){ const bx = x + 30*ik, by = y - 26*ik; g.fillStyle = '#5a1010'; g.beginPath(); g.arc(bx, by, 12*ik, 0, Math.PI*2); g.fill(); g.strokeStyle = '#2a0808'; g.lineWidth = 2; g.stroke();
      g.fillStyle = '#f0e6d0'; g.beginPath(); g.arc(bx, by - 2*ik, 7*ik, 0, Math.PI*2); g.fill(); g.fillRect(bx - 4*ik, by + 2*ik, 8*ik, 6*ik); g.fillStyle = '#5a1010'; g.fillRect(bx - 4*ik, by - 3*ik, 3*ik, 3*ik); g.fillRect(bx + 1*ik, by - 3*ik, 3*ik, 3*ik); g.fillRect(bx - 1*ik, by + 3*ik, 2*ik, 4*ik); }
    const label = e.locked ? '???' : e.hall ? e.name : `${e.lvl}. ${e.name}`, ex = 30; let ly = y + 24*ik; { g.font = `13px ${FONT}`; const w1 = g.measureText(label).width + 18; for(let k = 0; k < 3 && taken.some(r => Math.abs(r.x - x) < (r.w + w1)/2 + 6 && Math.abs(r.y - ly) < 32); k++) ly += 30; taken.push({x, y:ly, w:w1}); if(!e.locked && lk || e.needKey) taken.push({x, y:ly + 30, w:110}); }
    plate(label, x, ly, {sz:13, col: lk ? '#b0a690' : '#fff4d0', bg: lk ? 'rgba(46,38,30,.9)' : 'rgba(36,22,12,.95)', border: sel ? '#ffd870' : lk ? '#6a5a44' : '#c8a060'});
    if(e.needKey && !lk) plate('requiere llave', x, ly + ex, {sz:10, col:'#ffd8a0', border:'#8a6a3a'});
    else if(e.hidden) plate('solo por el portal', x, ly + ex, {sz:10, col:'#d0c0ff', border:'#6a5aa8'});
    else if(!e.locked && lk) plate('bloqueada', x, ly + ex, {sz:10, col:'#b0a690', border:'#6a5a44'});
    hits.push({id:e.id, x, y, r:Math.max(40, 42*ik)});
  }
  this._mapHits = hits;
  // ayuda de controles
  g.font = `11px ${FONT}`; g.textAlign = 'left'; g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(8, Hm - 26, 460, 20); g.fillStyle = '#e8d8b0'; g.fillText('Arrastra para mover el mapa · Rueda: acercar / alejar · Flechas: mover', 14, Hm - 12);
  $('mapNodes').innerHTML = '';
  this.renderMapInfo(this._mapHover || this.mapSel);
};
UI.mapRedraw = function(){ if(!this.mapOpen) return; if(this._mapRaf) return; this._mapRaf = requestAnimationFrame(() => { this._mapRaf = 0; this.renderRaidMapView(); }); };
UI.renderRaidMapView = function(){   // solo vuelve a dibujar el lienzo (sin tocar el panel de información, que no cambia al mover)
  const keep = this.renderMapInfo; this.renderMapInfo = () => {}; try { this.renderRaidMap(); } finally { this.renderMapInfo = keep; }
};
UI.openRaidMap = function(){
  this.mapOpen = true; this.mapSel = this.mapSel || 'village';
  $('raidMap').classList.remove('hidden'); sfx('ui');
  $('mapClose').onclick = () => this.closeRaidMap();
  if(!this._mapInit){
    this._mapInit = true; const c = $('mapCanvas');
    const toCanvas = e => { const r = c.getBoundingClientRect(); return {x:(e.clientX - r.left)*c.width/r.width, y:(e.clientY - r.top)*c.height/r.height}; };
    const hitAt = p => { let best = null, bd = 1e9; for(const h of UI._mapHits){ const d = Math.hypot(p.x - h.x, p.y - h.y); if(h.r && d < h.r && d < bd){ bd = d; best = h.id; } } return best; };
    let drag = null;
    c.addEventListener('mousedown', e => { if(e.button !== 0) return; drag = {p:toCanvas(e), cx:UI.mapCam.x, cy:UI.mapCam.y, moved:false}; c.style.cursor = 'grabbing'; });
    addEventListener('mouseup', e => {
      if(!drag) return; c.style.cursor = 'grab';
      if(!drag.moved){ const id = hitAt(toCanvas(e)); if(id){ UI.mapSel = id; sfx('ui'); UI.renderRaidMap(); } }
      drag = null;
    });
    c.addEventListener('mousemove', e => {
      const p = toCanvas(e);
      if(drag){ const dx = p.x - drag.p.x, dy = p.y - drag.p.y; if(Math.hypot(dx, dy) > 4) drag.moved = true; if(drag.moved){ UI.mapCam.x = drag.cx - dx/UI.mapCam.z; UI.mapCam.y = drag.cy - dy/UI.mapCam.z; UI.mapEnsureCam(c); UI.mapRedraw(); } return; }
      const id = hitAt(p); if(id !== UI._mapHover){ UI._mapHover = id; c.style.cursor = id ? 'pointer' : 'grab'; UI.renderRaidMap(); }
    });
    c.addEventListener('mouseleave', () => { if(UI._mapHover){ UI._mapHover = null; UI.renderRaidMap(); } });
    c.addEventListener('wheel', e => { e.preventDefault(); const p = toCanvas(e), cam = UI.mapCam, z0 = cam.z, z1 = clamp(z0*(e.deltaY < 0 ? 1.15 : 1/1.15), .4, 1.5);
      cam.x += (p.x - c.width/2)/z0 - (p.x - c.width/2)/z1; cam.y += (p.y - c.height/2)/z0 - (p.y - c.height/2)/z1; cam.z = z1; UI.mapEnsureCam(c); UI.mapRedraw(); }, {passive:false});
    addEventListener('keydown', e => {
      if(!UI.mapOpen) return; const cam = UI.mapCam, st = 80/cam.z, k = e.code;
      if(k==='ArrowLeft'){ cam.x -= st; } else if(k==='ArrowRight'){ cam.x += st; } else if(k==='ArrowUp'){ cam.y -= st; } else if(k==='ArrowDown'){ cam.y += st; } else if(k==='Equal' || k==='NumpadAdd'){ cam.z *= 1.15; } else if(k==='Minus' || k==='NumpadSubtract'){ cam.z /= 1.15; } else return;
      e.preventDefault(); UI.mapEnsureCam($('mapCanvas')); UI.mapRedraw();
    });
    c.style.cursor = 'grab';
  }
  this.fitRaidMap(); this._mapHover = null;
  this.renderRaidMap();
};
