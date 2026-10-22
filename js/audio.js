'use strict';
// =====================================================================
//  Audio generado por código (Web Audio): efectos retro y dos músicas
//  - Guarida: tema cálido con arpegio, bajo y campanas + crepitar de hoguera
//  - Expedición: tema oscuro con dron, latido y campanas lejanas + viento
// =====================================================================
const AUDIO = {ctx:null, master:null, sfx:null, music:null, amb:null, muted:false, track:null, step:0, nextT:0,
               last:{}, noiseBuf:null, wind:null, combat:0};
const midi = n => 440*Math.pow(2, (n-69)/12);
// volúmenes del jugador (0..1, 1 = nivel original); se guardan en localStorage
const BASE_VOL = {master:.8, music:.55, sfx:.9, amb:.5};
const VOL = {master:1, music:1, sfx:1};
try { const v = JSON.parse(localStorage.getItem('heroes-pets-vol')); for(const k in VOL) if(v && typeof v[k]==='number') VOL[k] = Math.max(0, Math.min(1, v[k])); } catch(e){}
const musicLevel = () => BASE_VOL.music*VOL.music;
function applyVolumes(){
  if(!AUDIO.ctx) return;
  const t = AUDIO.ctx.currentTime;
  AUDIO.master.gain.setTargetAtTime(AUDIO.muted ? 0 : BASE_VOL.master*VOL.master, t, .05);
  AUDIO.sfx.gain.setTargetAtTime(BASE_VOL.sfx*VOL.sfx, t, .05);
  AUDIO.amb.gain.setTargetAtTime(BASE_VOL.amb*VOL.sfx, t, .05);
  AUDIO.music.gain.setTargetAtTime(musicLevel(), t, .05);
}
function setVolume(k, v){
  VOL[k] = Math.max(0, Math.min(1, v));
  try { localStorage.setItem('heroes-pets-vol', JSON.stringify(VOL)); } catch(e){}
  applyVolumes();
}
function setMuted(m){
  AUDIO.muted = m;
  try { localStorage.setItem('heroes-pets-muted', m ? '1' : '0'); } catch(e){}
  applyVolumes();
}

function audioInit(){
  if(AUDIO.ctx){ if(AUDIO.ctx.state === 'suspended') AUDIO.ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return;
  const c = AUDIO.ctx = new AC();
  AUDIO.master = c.createGain(); AUDIO.master.gain.value = AUDIO.muted ? 0 : BASE_VOL.master*VOL.master;
  const comp = c.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4;
  AUDIO.master.connect(comp).connect(c.destination);
  AUDIO.sfx = c.createGain(); AUDIO.sfx.gain.value = BASE_VOL.sfx*VOL.sfx; AUDIO.sfx.connect(AUDIO.master);
  AUDIO.music = c.createGain(); AUDIO.music.gain.value = musicLevel(); AUDIO.music.connect(AUDIO.master);
  AUDIO.amb = c.createGain(); AUDIO.amb.gain.value = BASE_VOL.amb*VOL.sfx; AUDIO.amb.connect(AUDIO.master);
  // eco para la música (campanas y arpegios)
  const delay = c.createDelay(1); delay.delayTime.value = .38;
  const fb = c.createGain(); fb.gain.value = .32; const wet = c.createGain(); wet.gain.value = .35;
  delay.connect(fb).connect(delay); delay.connect(wet).connect(AUDIO.music);
  AUDIO.echo = delay;
  // ruido blanco reutilizable
  const len = c.sampleRate*2, nb = c.createBuffer(1, len, c.sampleRate), d = nb.getChannelData(0);
  for(let i=0;i<len;i++) d[i] = Math.random()*2-1;
  AUDIO.noiseBuf = nb;
  setInterval(musicTick, 25);
  if(AUDIO.pending){ playMusic(AUDIO.pending); AUDIO.pending = null; }
}
addEventListener('pointerdown', audioInit);
addEventListener('keydown', audioInit);

function toggleMute(){
  setMuted(!AUDIO.muted);
  toast(AUDIO.muted ? 'Sonido desactivado [M]' : 'Sonido activado [M]', 1.4);
}
try { AUDIO.muted = localStorage.getItem('heroes-pets-muted') === '1'; } catch(e){}

// ---------- primitivas ----------
function tone(o){
  const c = AUDIO.ctx; if(!c) return;
  const t = (o.t ?? c.currentTime) + (o.delay||0), dur = o.dur ?? .1, vol = o.vol ?? .2;
  const osc = c.createOscillator(), g = c.createGain();
  osc.type = o.type || 'square';
  osc.frequency.setValueAtTime(o.f, t);
  if(o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t + (o.slide ?? dur));
  if(o.vib){ const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = o.vib; lg.gain.value = o.vibAmt || 6; l.connect(lg).connect(osc.frequency); l.start(t); l.stop(t+dur+.1); }
  const a = o.attack ?? .004;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t+a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node = osc;
  if(o.lp){ const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; f.Q.value = o.q || .7; node.connect(f); node = f; }
  node.connect(g).connect(o.dest || AUDIO.sfx);
  if(o.echo && AUDIO.echo) g.connect(AUDIO.echo);
  osc.start(t); osc.stop(t + dur + .05);
}
function noise(o){
  const c = AUDIO.ctx; if(!c) return;
  const t = (o.t ?? c.currentTime) + (o.delay||0), dur = o.dur ?? .1;
  const src = c.createBufferSource(); src.buffer = AUDIO.noiseBuf; src.loop = true;
  const f = c.createBiquadFilter(); f.type = o.filter || 'lowpass'; f.Q.value = o.q || .8;
  f.frequency.setValueAtTime(o.f || 1200, t);
  if(o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(o.vol ?? .2, t + (o.attack ?? .003));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(o.dest || AUDIO.sfx);
  src.start(t, Math.random()); src.stop(t + dur + .05);
}

// ---------- efectos ----------
const SFX = {
  swing(){ noise({filter:'bandpass', f:500, f2:1800, dur:.11, vol:.12, q:1.2}); },
  swingBig(){ noise({filter:'bandpass', f:300, f2:1400, dur:.18, vol:.18, q:1}); },
  throw(){ noise({filter:'bandpass', f:900, f2:2400, dur:.1, vol:.1, q:2}); },
  punch(){ noise({f:900, f2:200, dur:.08, vol:.35}); tone({type:'square', f:140, f2:60, dur:.08, vol:.14, lp:600}); },
  punchBig(){ noise({f:1100, f2:150, dur:.16, vol:.5}); tone({type:'square', f:110, f2:40, dur:.16, vol:.2, lp:500}); },
  stickHit(){ noise({filter:'bandpass', f:1400, dur:.06, vol:.3, q:3}); tone({type:'triangle', f:320, f2:180, dur:.09, vol:.18}); },
  stoneHit(){ noise({filter:'highpass', f:2500, dur:.04, vol:.25}); tone({type:'triangle', f:700, f2:400, dur:.05, vol:.1}); },
  slime(){ tone({type:'sine', f:320+Math.random()*80, f2:110, dur:.12, vol:.2}); noise({f:600, f2:200, dur:.08, vol:.12}); },
  slimeDie(){ tone({type:'sine', f:520, f2:70, dur:.28, vol:.25}); noise({f:900, f2:120, dur:.2, vol:.18}); tone({type:'triangle', f:180, f2:60, dur:.2, vol:.1, delay:.05}); },
  hurt(){ tone({type:'square', f:220, f2:90, dur:.16, vol:.16, lp:1200}); noise({f:1500, f2:300, dur:.1, vol:.2}); },
  block(){ tone({type:'triangle', f:880, dur:.12, vol:.14}); tone({type:'triangle', f:1320, dur:.09, vol:.08}); noise({filter:'highpass', f:3000, dur:.05, vol:.2}); },
  dash(){ noise({filter:'bandpass', f:300, f2:1200, dur:.16, vol:.16, q:.8}); },
  coin(){ tone({type:'square', f:1320, dur:.06, vol:.07}); tone({type:'square', f:1760, dur:.12, vol:.07, delay:.06}); },
  pickup(){ tone({type:'triangle', f:520, f2:880, dur:.1, vol:.14}); },
  equip(){ tone({type:'triangle', f:330, dur:.05, vol:.12}); tone({type:'triangle', f:495, dur:.08, vol:.12, delay:.05}); noise({filter:'highpass', f:2500, dur:.04, vol:.08}); },
  ui(){ tone({type:'square', f:660, dur:.04, vol:.05}); },
  type(){ tone({type:'square', f:420+Math.random()*120, dur:.025, vol:.025}); },
  chest(){ tone({type:'sawtooth', f:110, f2:170, dur:.35, vol:.07, lp:900, vib:18, vibAmt:8}); noise({f:400, dur:.12, vol:.2, delay:.32}); tone({type:'triangle', f:660, dur:.15, vol:.08, delay:.42}); tone({type:'triangle', f:990, dur:.25, vol:.08, delay:.5}); },
  cage(){ noise({filter:'bandpass', f:2200, dur:.12, vol:.3, q:4}); tone({type:'triangle', f:1500, dur:.25, vol:.08});
          [60,64,67,72,76].forEach((n,i) => tone({type:'triangle', f:midi(n+12), dur:.3, vol:.1, delay:.15+i*.08, echo:true})); },
  levelup(){ [60,64,67,72,67,72,79].forEach((n,i) => tone({type:'square', f:midi(n+12), dur:.14, vol:.07, delay:i*.07, lp:3000})); },
  potion(){ for(let i=0;i<5;i++) tone({type:'sine', f:300+i*90+Math.random()*40, dur:.07, vol:.12, delay:i*.06}); },
  eat(){ for(let i=0;i<3;i++) noise({filter:'bandpass', f:800+Math.random()*600, dur:.05, vol:.2, delay:i*.09, q:2}); },
  wearWarn(){ [880,660,880,660].forEach((f,i) => tone({type:'square', f, dur:.11, vol:.09, delay:i*.13, lp:2500})); },
  breakItem(){ noise({f:2000, f2:200, dur:.25, vol:.35}); tone({type:'square', f:300, f2:80, dur:.2, vol:.1, lp:900}); },
  click(){ noise({filter:'highpass', f:3000, dur:.03, vol:.15}); tone({type:'square', f:900, dur:.02, vol:.05}); },
  lanternOut(){ tone({type:'sine', f:600, f2:120, dur:.5, vol:.12}); noise({f:1200, f2:100, dur:.4, vol:.1}); },
  boom(){ noise({f:1400, f2:60, dur:.7, vol:.6}); tone({type:'sine', f:90, f2:30, dur:.6, vol:.35}); },
  fuse(){ tone({type:'square', f:900, dur:.05, vol:.04}); },
  thud(){ tone({type:'sine', f:120, f2:40, dur:.22, vol:.3}); noise({f:500, f2:80, dur:.18, vol:.25}); },
  summon(){ tone({type:'sine', f:200, f2:600, dur:.4, vol:.08, vib:9}); tone({type:'sine', f:300, f2:900, dur:.4, vol:.05, delay:.1}); },
  petHit(){ noise({filter:'bandpass', f:1800, dur:.05, vol:.15, q:2}); tone({type:'triangle', f:500, f2:300, dur:.06, vol:.08}); },
  bark(){ tone({type:'square', f:520, f2:300, dur:.09, vol:.12, lp:2000}); tone({type:'square', f:560, f2:320, dur:.1, vol:.12, lp:2000, delay:.13}); },
  alba(){ [72,76,79,84,88].forEach((n,i) => tone({type:'sine', f:midi(n), dur:.9, vol:.08, delay:i*.04, echo:true})); noise({filter:'highpass', f:4000, f2:8000, dur:.6, vol:.08}); },
  howl(){ tone({type:'sawtooth', f:300, f2:620, dur:.35, vol:.06, lp:1400, slide:.3}); tone({type:'sawtooth', f:620, f2:420, dur:.9, vol:.06, lp:1400, delay:.3, vib:6, vibAmt:14}); },
  petDown(){ tone({type:'triangle', f:500, f2:200, dur:.35, vol:.1}); },
  portal(){ tone({type:'sine', f:220, f2:880, dur:1.2, vol:.06, vib:6, vibAmt:20, echo:true}); },
  extract(){ [67,71,74,79].forEach((n,i) => tone({type:'triangle', f:midi(n), dur:.6, vol:.1, delay:i*.12, echo:true})); },
  death(){ [55,51,48,43].forEach((n,i) => tone({type:'square', f:midi(n), dur:.4, vol:.1, delay:i*.22, lp:1200})); noise({f:600, f2:60, dur:1.2, vol:.2}); },
  step(){ noise({f:500+Math.random()*200, dur:.04, vol:.035}); },
  horse(){ noise({filter:'bandpass', f:700, f2:300, dur:.5, vol:.12, q:2}); tone({type:'sawtooth', f:180, f2:120, dur:.4, vol:.04, lp:700, vib:12}); },
};
function sfx(name, minGap=.04){
  const c = AUDIO.ctx; if(!c || AUDIO.muted || !SFX[name]) return;
  const now = c.currentTime; if(now - (AUDIO.last[name]||0) < minGap) return;
  AUDIO.last[name] = now;
  SFX[name]();
}

// ---------- música ----------
const MUSIC = {
  den: {bpm:74, bars:[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]},     // La m – Fa – Do – Sol
  raid:{bpm:56, bars:[[50,53,57],[46,50,53],[43,46,50],[45,49,52]]},     // Re m – Si♭ – Sol m – La
};
function playMusic(name){
  if(!AUDIO.ctx){ AUDIO.pending = name; return; }
  if(AUDIO.track === name) return;
  const c = AUDIO.ctx, g = AUDIO.music.gain;
  g.cancelScheduledValues(c.currentTime); g.setTargetAtTime(0, c.currentTime, .3);
  setTimeout(() => {
    AUDIO.track = name; AUDIO.step = 0; AUDIO.nextT = c.currentTime + .1;
    g.cancelScheduledValues(c.currentTime); g.setTargetAtTime(musicLevel(), c.currentTime, .8);
  }, 700);
  setAmbience(name);
}
function musicTick(){
  const c = AUDIO.ctx; if(!c || !AUDIO.track) return;
  const M = MUSIC[AUDIO.track], st = 60/M.bpm/4;
  while(AUDIO.nextT < c.currentTime + .2){
    (AUDIO.track==='den' ? denStep : raidStep)(AUDIO.step, AUDIO.nextT, M, st);
    AUDIO.nextT += st; AUDIO.step++;
  }
  // crepitar de la hoguera en la guarida
  if(AUDIO.track==='den' && Math.random() < .12)
    noise({filter:'highpass', f:1500+Math.random()*3000, dur:.02+Math.random()*.03, vol:.02+Math.random()*.05, dest:AUDIO.amb});
}
function denStep(s, t, M, st){
  const bar = Math.floor(s/16) % 4, ch = M.bars[bar], i = s % 16, dst = AUDIO.music;
  if(i === 0){
    for(const n of ch) tone({t, type:'sine', f:midi(n), dur:st*16, attack:.4, vol:.035, dest:dst, lp:1200});
    tone({t, type:'triangle', f:midi(ch[0]-12), dur:st*7, vol:.09, dest:dst});
  }
  if(i === 8) tone({t, type:'triangle', f:midi(ch[0]-12+(bar%2?7:0)), dur:st*7, vol:.07, dest:dst});
  if(i % 2 === 0){
    const pat = [0,1,2,1,0,2,1,2], n = ch[pat[(i/2)%8]] + 12;
    tone({t, type:'triangle', f:midi(n), dur:st*3, vol:.05, dest:dst, echo:true, lp:2600});
  }
  if(i === 12 && Math.random() < .5) tone({t, type:'sine', f:midi(pick(ch)+24), dur:1.6, attack:.01, vol:.035, dest:dst, echo:true});
}
function raidStep(s, t, M, st){
  const bar = Math.floor(s/16) % 4, ch = M.bars[bar], i = s % 16, dst = AUDIO.music;
  if(i === 0){
    tone({t, type:'sawtooth', f:midi(ch[0]-24), dur:st*16, attack:1.2, vol:.05, dest:dst, lp:320});
    tone({t, type:'sine', f:midi(ch[0]-12), dur:st*16, attack:1, vol:.05, dest:dst});
  }
  // latido
  if(i === 0 || i === 3){ tone({t, type:'sine', f:72, f2:38, dur:.22, vol: i===0 ? .14 : .09, dest:dst}); }
  // campanas lejanas e inquietantes
  if(i % 8 === 4 && Math.random() < .4){
    const scale = [0,1,3,5,7,8,10], n = 62 + scale[Math.floor(Math.random()*7)] + (Math.random()<.3?12:0);
    tone({t, type:'sine', f:midi(n), dur:2.2, attack:.01, vol:.035, dest:dst, echo:true});
    tone({t, type:'sine', f:midi(n)*2.01, dur:1.2, attack:.01, vol:.01, dest:dst});
  }
  // capa de combate: pulso más rápido cuando hay monstruos alerta cerca
  if(AUDIO.combat > .5 && i % 2 === 0){
    tone({t, type:'triangle', f:midi(ch[0]-12+(i%4?0:12)), dur:st*1.5, vol:.05*AUDIO.combat, dest:dst, lp:700});
    if(i % 4 === 0) noise({t, filter:'bandpass', f:180, dur:.12, vol:.08*AUDIO.combat, dest:dst});
  }
}
// viento nocturno en la expedición
function setAmbience(name){
  const c = AUDIO.ctx; if(!c) return;
  if(AUDIO.wind){ const w = AUDIO.wind; w.g.gain.setTargetAtTime(0, c.currentTime, .5); setTimeout(() => { try{ w.src.stop(); }catch(e){} }, 2000); AUDIO.wind = null; }
  if(name !== 'raid') return;
  const src = c.createBufferSource(); src.buffer = AUDIO.noiseBuf; src.loop = true;
  const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 400; f.Q.value = .6;
  const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = .08; lg.gain.value = 250; lfo.connect(lg).connect(f.frequency);
  const g = c.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(.07, c.currentTime, 2);
  src.connect(f).connect(g).connect(AUDIO.amb); src.start(); lfo.start();
  AUDIO.wind = {src, g};
}
