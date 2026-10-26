'use strict';
// =====================================================================
//  Afijos de monstruo nuevos: nivel 5 en adelante (7) y nivel 10 en adelante (8).
//  `minLvl`: solo salen en expediciones de ese nivel o superior (rollAffixes en actors.js).
//  Los ganchos están en actors.js: monAffixHit / monAffixTick / monDmgMul / monSpdMul / monAffixBeforeDeath / monAffixDeath.
// =====================================================================
Object.assign(MON_AFFIX, {
  sangrante:        {name:'Sangrante',         minLvl:5,  desc:'Sus golpes provocan sangrado'},
  ponzonoso:        {name:'Ponzoñoso',         minLvl:5,  desc:'Sus golpes envenenan'},
  incendiario:      {name:'Incendiario',       minLvl:5,  desc:'Sus golpes te prenden fuego y deja una llama al morir'},
  aturdidor:        {name:'Aturdidor',         minLvl:5,  desc:'El 20 % de sus golpes te aturde 0,8 s'},
  acorazado:        {name:'Acorazado',         minLvl:5,  desc:'Recibe un 25 % menos de daño'},
  maldito:          {name:'Maldito',           minLvl:5,  desc:'Sus golpes te debilitan (−40 % de daño, 3 s)'},
  manada:           {name:'Manada',            minLvl:5,  desc:'+10 % de daño por cada monstruo igual cercano (máx. +40 %)'},
  congelante:       {name:'Congelante',        minLvl:10, desc:'El 25 % de sus golpes te congela 0,9 s'},
  tormentoso:       {name:'Tormentoso',        minLvl:10, desc:'Cada 7 s lanza una descarga eléctrica sobre ti'},
  imparable:        {name:'Imparable',         minLvl:10, desc:'Inmune a aturdir, ralentizar, congelar, asustar y empujar'},
  lider:            {name:'Líder',             minLvl:10, desc:'Los monstruos cercanos hacen +20 % de daño y se mueven más rápido'},
  ejecutor:         {name:'Ejecutor',          minLvl:10, desc:'Con tu vida por debajo del 50 %: +40 % de daño'},
  fenix:            {name:'Fénix',             minLvl:10, desc:'Revive una vez con el 30 % de vida'},
  teletransportador:{name:'Teletransportador', minLvl:10, desc:'Cada 8 s aparece a tu lado'},
  martir:           {name:'Mártir',            minLvl:10, desc:'Al morir cura un 40 % a los monstruos cercanos'},
});

// efectos al golpear al héroe (se llama desde damagePlayer)
function monAffixHit(m){
  const A = m.affixes;
  if(A.includes('sangrante')) P.bleedT = Math.max(P.bleedT || 0, 7);
  if(A.includes('ponzonoso')) P.poisonT = Math.max(P.poisonT || 0, 6);
  if(A.includes('incendiario')) P.burnT = Math.max(P.burnT || 0, 3);
  if(A.includes('aturdidor') && Math.random() < .2 && !legendOn('yetiheart')){ P.stunT = Math.max(P.stunT || 0, .8); addText(P.x, P.y-62, '¡Aturdido!', '#ffe08a', 8); burst(P.x, P.y-34, 8, ['#ffe08a', '#ffffff'], [20, 60], [.3, .6], -40); }
  if(A.includes('maldito')){ P.weakT = Math.max(P.weakT || 0, 3); addText(P.x, P.y-62, '¡Debilitado!', '#c8b8ff', 7); }
  if(A.includes('congelante') && Math.random() < .25) freezeHero(.9);
}
// multiplicadores de daño y velocidad (manada, líder, ejecutor)
function monDmgMul(m){
  const A = m.affixes; let k = 1;
  if(A.includes('manada')) k *= 1 + .1*Math.min(4, m.packN || 0);
  if(A.includes('ejecutor') && !P.dead && P.hp < P.maxHp*.5) k *= 1.4;
  if(m.leadT > 0) k *= 1.2;
  return k;
}
const monSpdMul = m => m.leadT > 0 ? 1.2 : 1;
// cada fotograma: manada, líder, tormentoso, teletransportador y el despertar del fénix. Devuelve true si el monstruo no hace nada este fotograma.
function monAffixTick(m, dt){
  const A = m.affixes;
  if(m.leadT > 0) m.leadT -= dt;
  if(m.downT > 0){   // fénix caído: inmóvil hasta que revive
    m.downT -= dt; m.hp = Math.max(m.hp, 1); m.stunT = Math.max(m.stunT, .2); m.flash = .1; m.poisonT = m.burnT = m.bleedT = 0;
    if(m.downT <= 0){ m.hp = m.maxHp*.3; m.stunT = 0; burst(m.x, m.y-m.r, 30, ['#ffd070', '#ff8a2a', '#ffffff'], [60, 200], [.3, .8], -60); ring(m.x, m.y-4, 40, '#ffb040', .5); sfx('alba'); addText(m.x, m.y-m.r*2-20, '¡Renace!', '#ffd070', 8, -20); }
    return true;
  }
  if(A.includes('manada')){ m.packT = (m.packT || 0) - dt; if(m.packT <= 0){ m.packT = .5; let n = 0; for(const o of G.mons) if(o !== m && !o.dying && o.type === m.type && Math.hypot(o.x - m.x, o.y - m.y) < 150) n++; m.packN = n; } }
  if(A.includes('lider') && m.aggro){
    for(const o of G.mons) if(o !== m && !o.dying && Math.hypot(o.x - m.x, o.y - m.y) < 150) o.leadT = .3;
    m.ringT = (m.ringT || 0) - dt; if(m.ringT <= 0){ m.ringT = 1; ring(m.x, m.y - 4, 150, '#ffd040', .5); }
  }
  if(m.aggro && !P.dead && !(m.stunT > 0)){
    const d = Math.hypot(P.x - m.x, P.y - m.y);
    if(A.includes('tormentoso') && d < 420){
      m.zapT = (m.zapT ?? rand(3, 7)) - dt;
      if(m.zapT <= 0){ m.zapT = 7; G.hazards.push({type:'zap', x:P.x + (P.vx || 0)*.15, y:P.y, r:40, delay:.5, life:.55, max:.55, dmg:(m.curDmg || m.dmg)*1.1, mon:m, weak:0}); }
    }
    if(A.includes('teletransportador') && d > 80 && d < 500){
      m.tpT = (m.tpT ?? rand(4, 8)) - dt;
      if(m.tpT <= 0){ m.tpT = 8; bossBlink(m, 55); m.atkCd = Math.min(m.atkCd, .3); }
    }
  }
  return false;
}
// antes de morir: el fénix cae al suelo y revive (una vez). Devuelve true si no debe morir todavía.
function monAffixBeforeDeath(m){
  if(m.downT > 0) return true;
  if(m.affixes.includes('fenix') && !m.reborn && !MONSTERS[m.type].boss){
    m.reborn = true; m.downT = 3; m.hp = 1; m.stunT = 3; m.dot = 0; burst(m.x, m.y-m.r, 16, ['#ffd070', '#ff8a2a'], [40, 140], [.3, .6], -40); addText(m.x, m.y-m.r*2-20, 'Cae...', '#ffd070', 7, -20);
    return true;
  }
  return false;
}
// al morir de verdad: mártir (cura a los cercanos) e incendiario (llama en el suelo)
function monAffixDeath(m){
  const A = m.affixes;
  if(A.includes('martir')){ ring(m.x, m.y-4, 150, '#7aff9a', .5); for(const o of G.mons) if(o !== m && !o.dying && Math.hypot(o.x - m.x, o.y - m.y) < 150){ o.hp = Math.min(o.maxHp, o.hp + o.maxHp*.4); addText(o.x, o.y-o.r*2-8, '+', '#7aff9a', 8, -20); } }
  if(A.includes('incendiario')){ G.hazards.push({type:'fire', x:m.x, y:m.y, r:30, life:3, max:3}); burst(m.x, m.y-6, 12, ['#ff5a1a', '#ff8a2a', '#ffc04a'], [40, 140], [.3, .6], -40); }
}

Object.assign(LANG_EN, {
  'Sangrante':'Bleeding', 'Ponzoñoso':'Venomous', 'Incendiario':'Incendiary', 'Aturdidor':'Stunning', 'Acorazado':'Armored', 'Maldito':'Cursed', 'Manada':'Pack', 'Congelante':'Freezing', 'Tormentoso':'Stormy', 'Imparable':'Unstoppable', 'Líder':'Leader', 'Ejecutor':'Executioner', 'Fénix':'Phoenix', 'Teletransportador':'Teleporter', 'Mártir':'Martyr',
  'Sus golpes provocan sangrado':'Its hits cause bleeding', 'Sus golpes envenenan':'Its hits poison you', 'Sus golpes te prenden fuego y deja una llama al morir':'Its hits set you on fire and it leaves a flame when it dies', 'El 20 % de sus golpes te aturde 0,8 s':'20% of its hits stun you for 0.8 s', 'Recibe un 25 % menos de daño':'Takes 25% less damage', 'Sus golpes te debilitan (−40 % de daño, 3 s)':'Its hits weaken you (−40% damage, 3 s)', '+10 % de daño por cada monstruo igual cercano (máx. +40 %)':'+10% damage for each nearby monster of the same kind (max +40%)',
  'El 25 % de sus golpes te congela 0,9 s':'25% of its hits freeze you for 0.9 s', 'Cada 7 s lanza una descarga eléctrica sobre ti':'Every 7 s it casts an electric discharge on you', 'Inmune a aturdir, ralentizar, congelar, asustar y empujar':'Immune to stun, slow, freeze, fear and knockback', 'Los monstruos cercanos hacen +20 % de daño y se mueven más rápido':'Nearby monsters deal +20% damage and move faster', 'Con tu vida por debajo del 50 %: +40 % de daño':'When your health is below 50%: +40% damage', 'Revive una vez con el 30 % de vida':'Revives once with 30% health', 'Cada 8 s aparece a tu lado':'Every 8 s it appears next to you', 'Al morir cura un 40 % a los monstruos cercanos':'On death it heals nearby monsters by 40%',
  'Cae...':'It falls...', '¡Renace!':'Reborn!',
});
LANG.load(LANG_EN);
