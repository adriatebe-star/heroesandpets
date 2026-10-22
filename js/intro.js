'use strict';
// =====================================================================
//  Introducción de la historia, tutorial de la guarida y misión inicial
// =====================================================================

// ---------- animación de introducción (al crear una partida nueva) ----------
const INTRO_SLIDES = [
  {t:'Hubo un tiempo en que el mundo estaba lleno de luz.', light:true},
  {t:'Las mascotas corrían por los campos y la gente reía bajo un cielo de estrellas.', light:true},
  {t:'Pero llegó él: el Señor de la Noche.', img:true, sfx:'howl'},
  {t:'Con su magia oscura encerró a todas las mascotas del mundo en jaulas, una a una...', img:true},
  {t:'...y sin ellas, la luz se apagó. Desde entonces vivimos en una noche eterna.', img:true, red:true},
  {t:'Un viajero encapuchado fue hallado a la entrada de una cueva, medio muerto. Su viaje empieza ahora.'},
];
// animación del bosque soleado (js/introscene.js): se dibuja a media resolución y se escala sin suavizado
const INTRO_SCENE = {raf:0, t0:0, off:null, timer:0};
function introSceneSet(on){
  const c = $('introScene'); c.classList.toggle('on', on);
  clearTimeout(INTRO_SCENE.timer);
  if(on){ if(!INTRO_SCENE.raf){ INTRO_SCENE.t0 = performance.now(); INTRO_SCENE.off = document.createElement('canvas'); INTRO_SCENE.raf = requestAnimationFrame(introSceneFrame); } }
  else INTRO_SCENE.timer = setTimeout(introSceneStop, 1800);   // deja que termine el fundido antes de parar
}
function introSceneStop(){ cancelAnimationFrame(INTRO_SCENE.raf); INTRO_SCENE.raf = 0; $('introScene').classList.remove('on'); }
function introSceneFrame(now){
  const c = $('introScene'), o = INTRO_SCENE.off, bw = Math.ceil(innerWidth/2), bh = Math.ceil(innerHeight/2);
  if(c.width !== innerWidth || c.height !== innerHeight){ c.width = innerWidth; c.height = innerHeight; }
  if(o.width !== bw || o.height !== bh){ o.width = bw; o.height = bh; }
  drawIntroForest(o.getContext('2d'), bw, bh, (now - INTRO_SCENE.t0)/1000);
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(o, 0, 0, bw*2, bh*2);
  INTRO_SCENE.raf = requestAnimationFrame(introSceneFrame);
}
UI.introOpen = false;
const _blockingI = UI.blocking.bind(UI);
UI.blocking = function(){ return _blockingI() || this.introOpen; };
UI.showIntro = function(done){
  const box = $('intro'), txt = $('introText'), img = $('introImg'); let i = -1, full = '', pos = 0, timer = null;
  this.introOpen = true; box.classList.remove('hidden'); playMusic && playMusic('den');
  const finish = () => {
    clearInterval(timer); removeEventListener('keydown', onKey, true); box.onclick = null;
    box.classList.add('out'); setTimeout(() => { box.classList.add('hidden'); box.classList.remove('out'); UI.introOpen = false; img.classList.remove('on', 'red'); introSceneStop(); done && done(); }, 700);
  };
  const type = () => { pos = Math.min(full.length, pos + 1); txt.textContent = full.slice(0, pos); if(pos >= full.length) clearInterval(timer); };
  const next = () => {
    if(pos < full.length && i >= 0){ pos = full.length; txt.textContent = full; clearInterval(timer); return; }
    if(++i >= INTRO_SLIDES.length) return finish();
    const sl = INTRO_SLIDES[i]; full = tr(sl.t); pos = 0; txt.textContent = ''; img.classList.toggle('on', !!sl.img); introSceneSet(!!sl.light); img.classList.toggle('red', !!sl.red);
    if(sl.sfx) try { sfx(sl.sfx); } catch(e){}
    $('introHint').textContent = i === INTRO_SLIDES.length-1 ? 'Clic o [Espacio] para empezar' : 'Clic o [Espacio] para continuar';
    clearInterval(timer); timer = setInterval(type, 32);
  };
  const onKey = e => {
    if(['Space', 'Enter', 'KeyF'].includes(e.code)){ e.preventDefault(); e.stopPropagation(); next(); }
    else if(e.code === 'Escape'){ e.preventDefault(); e.stopPropagation(); finish(); }
  };
  addEventListener('keydown', onKey, true); box.onclick = next; $('introSkip').onclick = e => { e.stopPropagation(); finish(); };
  next();
};

// ---------- tutorial de la guarida ----------
const TUT_STEPS = [
  {k:'move',  title:'Muévete',            txt:'Usa W A S D para caminar por la guarida.'},
  {k:'run',   title:'Corre',              txt:'Mantén SHIFT mientras caminas para correr. Gasta estamina (la barra naranja).'},
  {k:'jump',  title:'Salta',              txt:'Pulsa ESPACIO para saltar: esquiva golpes y pasa por encima de obstáculos.'},
  {k:'atk',   title:'Ataca',              txt:'Haz CLIC IZQUIERDO para atacar. También recoge los objetos del suelo.'},
  {k:'heal',  title:'Cúrate',             txt:'Estás herido. Pulsa 1 para beber una poción de vida (enfriamiento de 10 s). Con 2 usas vendas.'},
  {k:'lamp',  title:'Farolillo',          txt:'Pulsa E para encender o apagar el farolillo. Gasta aceite: en las expediciones es tu única luz.'},
  {k:'inv',   title:'Inventario',         txt:'Pulsa I para abrir el inventario: aquí equipas armas, armadura y mascotas. Ciérralo con I o Esc.'},
];
const TUT = {t:0, flash:0, lx:null, ly:null, dist:0, runT:0, gave:false, invSeen:false};
const tutActive = () => G.save && G.save.tut !== undefined && G.save.tut < TUT_STEPS.length && G.sc && G.sc.kind !== 'raid';
function tutAdvance(){
  G.save.tut++; TUT.flash = 1.1; TUT.gave = false; TUT.invSeen = false; sfx('levelup');
  if(G.save.tut >= TUT_STEPS.length) tutFinish(true);
  saveGame();
}
function tutFinish(real){
  G.save.tut = TUT_STEPS.length;
  G.save.quest = G.save.talked ? 'horse' : 'juan';
  toast(real ? '¡Tutorial completado!' : 'Tutorial omitido', 2.4);
  toast(G.save.quest === 'juan' ? 'Nueva misión: habla con Juan, el sabio' : 'Nueva misión: viaja a la primera expedición con el caballo', 3.4);
  saveGame();
}
function updateTutorial(dt){
  if(TUT.flash > 0) TUT.flash -= dt;
  if(!tutActive() || G.paused || UI.introOpen || P.dead) return;
  if(pressed.KeyN && !UI.dlg && !UI.invOpen){ tutFinish(false); return; }
  const k = TUT_STEPS[G.save.tut].k, busy = UI.screen || UI.dlg;
  if(busy) return;
  if(TUT.flash > 0) return;
  if(k === 'inv'){ if(UI.invOpen) TUT.invSeen = true; else if(TUT.invSeen) tutAdvance(); return; }
  if(UI.blocking()) return;
  if(k === 'move'){ if(TUT.lx !== null) TUT.dist += Math.hypot(P.x-TUT.lx, P.y-TUT.ly); TUT.lx = P.x; TUT.ly = P.y; if(TUT.dist > 150){ TUT.dist = 0; TUT.lx = null; tutAdvance(); } }
  else if(k === 'run'){ if(P.running) TUT.runT += dt; if(TUT.runT > .7){ TUT.runT = 0; tutAdvance(); } }
  else if(k === 'jump'){ if(P.jump) tutAdvance(); }
  else if(k === 'atk'){ if(P.punchT > 0) tutAdvance(); }
  else if(k === 'heal'){
    if(!TUT.gave){ TUT.gave = true; if(!G.inv.bag.some(x => x && x.id === 'potion') && !G.inv.equip.potion) addToBagOrStash(mkItem('potion', 2)); P.hp = Math.min(P.hp, Math.round(P.maxHp*.5)); P.potionCd = 0; UI.refresh(); }
    if((P.potionCd||0) > 0 || P.hp >= P.maxHp*.8) tutAdvance();
  }
  else if(k === 'lamp'){ if(actionPressed('lantern')) tutAdvance(); }
}
// panel del tutorial (arriba al centro)
function drawTutorial(){
  if(!tutActive() || UI.introOpen) return;
  const st = TUT_STEPS[G.save.tut], w = Math.min(560, W - 40), x = (W - w)/2, y = 150, h = 112, ok = TUT.flash > 0;
  ctx.globalAlpha = .93; ctx.fillStyle = '#120d10'; ctx.fillRect(x-4, y-4, w+8, h+8); ctx.fillStyle = ok ? '#2a3a22' : '#1e171a'; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1;
  ctx.strokeStyle = ok ? '#7ae09a' : '#d8a850'; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = `${7*S}px ${FONT}`;
  textO(`TUTORIAL ${G.save.tut + 1}/${TUT_STEPS.length}`, x + 16, y + 20, '#a89a80');
  ctx.font = `${9*S}px ${FONT}`; textO((ok ? '✔ ' : '') + st.title, x + 16, y + 46, ok ? '#9affb0' : '#ffd166');
  ctx.font = `${6.5*S}px ${FONT}`;
  // texto en dos líneas como mucho
  const words = tr(st.txt).split(' '), lines = ['']; for(const wd of words){ const t = lines[lines.length-1] + wd + ' '; if(ctx.measureText(t).width > w - 32 && lines[lines.length-1]) lines.push(wd + ' '); else lines[lines.length-1] = t; }
  lines.slice(0, 3).forEach((l, i) => textO(l.trim(), x + 16, y + 72 + i*16, '#e8d8b0'));
  ctx.textAlign = 'right'; ctx.font = `${5.5*S}px ${FONT}`; textO('[N] Saltar tutorial', x + w - 12, y + 18, '#7a6a58'); ctx.textAlign = 'left';
}

// ---------- misión inicial: Juan, el sabio, te guía hasta la primera expedición ----------
function questTarget(){
  const q = G.save.quest, sc = G.sc;
  if(!sc || sc.kind === 'raid') return null;
  if(q === 'juan'){ const n = sc.npcs.find(n => n.id === 'juan'); return n ? {x:n.x, y:n.y-30, name:'Juan, el sabio'} : null; }
  if(q === 'horse' && sc.horse) return {x:sc.horse.x, y:sc.horse.y-40, name:'El caballo'};
  return null;
}
function questLines(){
  const q = G.save.quest;
  if(q === 'tutorial') return ['MISIÓN', 'Completa el tutorial'];
  if(q === 'juan') return ['MISIÓN', 'Habla con Juan, el sabio', '(el «!» sobre su cabeza)'];
  if(q === 'horse') return ['MISIÓN', 'Monta el caballo [F] y viaja', 'a la expedición 1: El pueblo', 'abandonado'];
  return null;
}
// flecha guía: sobre el objetivo si está a la vista; en el borde de la pantalla apuntando hacia él si no
function drawQuestArrow(){
  const tg = questTarget(); if(!tg || UI.introOpen) return;
  const [sx, sy] = toScreen(tg.x, tg.y), m = 54, bob = Math.sin(G.t*5)*5;
  const inside = sx > m && sx < W - m && sy > m && sy < H - m;
  if(inside){
    if(G.save.quest === 'juan') return;      // Juan ya lleva su «!»
    ctx.fillStyle = '#7ae09a'; ctx.strokeStyle = '#0c0a0e'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(sx, sy+bob-6); ctx.lineTo(sx-12, sy+bob-24); ctx.lineTo(sx+12, sy+bob-24); ctx.closePath(); ctx.stroke(); ctx.fill();
    return;
  }
  const cx = W/2, cy = H/2, ang = Math.atan2(sy-cy, sx-cx), k = Math.min((W/2 - m)/Math.abs(Math.cos(ang) || 1e-6), (H/2 - m)/Math.abs(Math.sin(ang) || 1e-6));
  const ax = cx + Math.cos(ang)*k, ay = cy + Math.sin(ang)*k, d = Math.round(Math.hypot(tg.x-P.x, tg.y-P.y)/16);
  ctx.save(); ctx.translate(ax, ay); ctx.rotate(ang);
  ctx.fillStyle = G.save.quest === 'juan' ? '#ffd040' : '#7ae09a'; ctx.strokeStyle = '#0c0a0e'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(16 + bob*.4, 0); ctx.lineTo(-10, -13); ctx.lineTo(-4, 0); ctx.lineTo(-10, 13); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore();
  ctx.textAlign = 'center'; ctx.font = `${6*S}px ${FONT}`; textO(`${tg.name} · ${d} m`, ax - Math.cos(ang)*38, ay - Math.sin(ang)*38 - 4, '#ffe9a8');
}

// contador grande de mascotas rescatadas (solo en la guarida; las brillantes no suman: cuenta cada especie una vez)
function drawPetCounter(){
  if(UI.introOpen) return;
  const ids = Object.keys(PETS), got = ids.filter(id => G.save.collection[id]).length, txt = `${got} de ${ids.length}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `${14*S}px ${FONT}`; const w = ctx.measureText(txt).width + 70, x = W/2 - w/2, y = 14, h = 62;
  ctx.globalAlpha = .88; ctx.fillStyle = '#120d10'; ctx.fillRect(x-4, y-4, w+8, h+8); ctx.fillStyle = '#1e171a'; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1;
  ctx.strokeStyle = got >= ids.length ? '#ffd84a' : '#d8a850'; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
  textO(txt, W/2, y + 26, got >= ids.length ? '#ffd84a' : '#ffe9a8');
  ctx.font = `${5.5*S}px ${FONT}`; textO('MASCOTAS RESCATADAS', W/2, y + 51, '#a89a80');
}
