'use strict';
// =====================================================================
//  Afijos de mascota del nivel 14 en adelante: bufos pasivos al héroe (se suman si varias mascotas los llevan, con tope)
// =====================================================================
Object.assign(PET_AFFIX, {
  vientoveloz:  {name:'Veloz de Viento',  desc:'+8 % de velocidad de movimiento del héroe (máx. +24 %)'},
  furiacomp:    {name:'Furia compartida', desc:'+8 % de velocidad de ataque del héroe (máx. +24 %)'},
  savia:        {name:'Savia vital',      desc:'+1,5 de vida por segundo al héroe (máx. +4,5)'},
  pulmon:       {name:'Pulmón profundo',  desc:'+25 % de regeneración de estamina y −8 % de gasto de estamina (máx. −24 %)'},
  fuenteaceite: {name:'Fuente de aceite', desc:'+0,4 de aceite por segundo con el farolillo encendido (máx. +1,2)'},
  rapaz:        {name:'Rapaz',            desc:'+4 % de probabilidad de crítico y +10 % de daño crítico del héroe (máx. +12 %)'},
  corazaviva:   {name:'Coraza viva',      desc:'−6 % de daño recibido por el héroe (máx. −18 %)'},
  rastrobrasas: {name:'Rastro de brasas', desc:'Tras matar a un enemigo, +10 % de daño del héroe durante 4 s'},
  segundoaliento:{name:'Segundo aliento', desc:'Una vez por expedición, si vas a morir te deja con el 25 % de vida y 2 s de invulnerabilidad'},
});
Object.assign(HERO_AFFIX_FX, {
  vientoveloz:{ic:'wing', col:'#9ae8ff'}, furiacomp:{ic:'bolt', col:'#ff9a4a'}, savia:{ic:'heart', col:'#6ae890'}, pulmon:{ic:'wing', col:'#ffe08a'},
  fuenteaceite:{ic:'drop', col:'#ffd84a'}, rapaz:{ic:'star', col:'#ff6a5a'}, corazaviva:{ic:'shield', col:'#c8a8ff'}, rastrobrasas:{ic:'flame', col:'#ff8a3a'}, segundoaliento:{ic:'heart', col:'#ffffff'},
});
// cuántas mascotas llevan el afijo
const petAffN = a => G.pets ? G.pets.filter(p => p.def.affixes.includes(a)).length : 0;
const petAffCap = (a, per, cap) => Math.min(cap, per*petAffN(a));
function petHeroBonus(s){   // se suma a las estadísticas de equipo (gearStats)
  s.move += petAffCap('vientoveloz', 8, 24); s.aspd += petAffCap('furiacomp', 8, 24); s.hpreg = (s.hpreg || 0) + petAffCap('savia', 1.5, 4.5);
  s.sreg += petAffCap('pulmon', 25, 75); s.crit += petAffCap('rapaz', 4, 12);
}
const petStamMul = () => 1 - petAffCap('pulmon', 8, 24)/100;
const petDrMul = () => 1 - petAffCap('corazaviva', 6, 18)/100;
const critMulP = () => 2 + petAffCap('rapaz', .1, .3);
function petSecondWind(){
  if(!hasPetAffix('segundoaliento') || !G.sc || G.sc.windUsed) return false;
  G.sc.windUsed = true; P.hp = Math.max(1, Math.round(P.maxHp*.25)); P.inv = 2; P.dead = false;
  addText(P.x, P.y-60, '¡Segundo aliento!', '#ffffff', 8); ring(P.x, P.y-10, 44, '#ffffff', .5); burst(P.x, P.y-18, 22, ['#ffffff', '#ffe8a0', '#9affb0'], [60, 180], [.4, .8], -20); sfx('alba');
  return true;
}
// cada frame: refresca las estadísticas si cambian las mascotas, aceite y temporizador del rastro
let _petSig = '';
{ const _ul = updateLegends;
  updateLegends = function(dt){
    _ul(dt);
    const sig = ['vientoveloz', 'furiacomp', 'savia', 'pulmon', 'rapaz'].map(petAffN).join(',');
    if(sig !== _petSig){ _petSig = sig; refreshStats(); }
    const n = petAffN('fuenteaceite');
    if(n && P.lantern && G.sc && G.sc.kind === 'raid' && !P.dead) P.oil = Math.min(oilMax(), P.oil + petAffCap('fuenteaceite', .4, 1.2)*dt);
    if(P.rastroT > 0) P.rastroT -= dt;
  };
  const _km = killMonster;
  killMonster = function(m){ const r = _km.apply(this, arguments); if(m && !m.summoner && hasPetAffix('rastrobrasas')) P.rastroT = 4; return r; };
}
Object.assign(LANG_EN, {
  'Veloz de Viento':'Windswift', '+8 % de velocidad de movimiento del héroe (máx. +24 %)':'+8% hero movement speed (max +24%)',
  'Furia compartida':'Shared fury', '+8 % de velocidad de ataque del héroe (máx. +24 %)':'+8% hero attack speed (max +24%)',
  'Savia vital':'Vital sap', '+1,5 de vida por segundo al héroe (máx. +4,5)':'+1.5 health per second for the hero (max +4.5)',
  'Pulmón profundo':'Deep lungs', '+25 % de regeneración de estamina y −8 % de gasto de estamina (máx. −24 %)':'+25% stamina regeneration and −8% stamina cost (max −24%)',
  'Fuente de aceite':'Oil spring', '+0,4 de aceite por segundo con el farolillo encendido (máx. +1,2)':'+0.4 oil per second with the lantern lit (max +1.2)',
  'Rapaz':'Raptor', '+4 % de probabilidad de crítico y +10 % de daño crítico del héroe (máx. +12 %)':'+4% hero critical chance and +10% critical damage (max +12%)',
  'Coraza viva':'Living shell', '−6 % de daño recibido por el héroe (máx. −18 %)':'−6% damage taken by the hero (max −18%)',
  'Rastro de brasas':'Ember trail', 'Tras matar a un enemigo, +10 % de daño del héroe durante 4 s':'After killing an enemy, +10% hero damage for 4 s',
  'Segundo aliento':'Second wind', 'Una vez por expedición, si vas a morir te deja con el 25 % de vida y 2 s de invulnerabilidad':'Once per expedition, if you are about to die it leaves you with 25% health and 2 s of invulnerability',
  '¡Segundo aliento!':'Second wind!',
});
LANG.load(LANG_EN);
