'use strict';
// =====================================================================
//  Chat con la tecla Enter y comandos de consola (/comando). La lista se ve también en la pestaña «Comandos» del editor.
// =====================================================================
// run(): ejecuta el comando y devuelve el texto de respuesta; once: solo se puede usar una vez por partida (G.save.cmdUsed)
const CHAT_CMDS = {
  only100000: {desc:'Te da 100.000 de oro (se guardan en la guarida).', once:true, effect:'+100.000 de oro en la guarida (G.save.wallet)', run(){ G.save.wallet += 100000; sfx('coin'); return '+100.000 de oro (guardados en la guarida).'; }},
  only200000: {desc:'Te da 200.000 de oro (se guardan en la guarida).', once:true, effect:'+200.000 de oro en la guarida (G.save.wallet)', run(){ G.save.wallet += 200000; sfx('coin'); return '+200.000 de oro (guardados en la guarida).'; }},
  ayuda:      {desc:'Muestra la lista de comandos.', once:false, effect:'Lista los comandos en el chat', run(){ return 'Comandos: ' + Object.keys(CHAT_CMDS).map(k => '/' + k).join(' · '); }},
};
const CHAT = {open:false, lines:[]};
function chatSay(text, col){ CHAT.lines.push({text, col:col || '#e8e0c8', t:G.t || 0, at:Date.now()}); if(CHAT.lines.length > 60) CHAT.lines.shift(); renderChat(); }
function chatRun(raw){
  const m = raw.trim().match(/^\/(\S+)/), name = m && m[1].toLowerCase(), c = name && CHAT_CMDS[name];
  chatSay('> ' + raw.trim(), '#9ab8d8');
  if(!c){ chatSay(tr('Comando desconocido. Escribe /ayuda'), '#ff9a8a'); return; }
  G.save.cmdUsed = G.save.cmdUsed || {};
  if(c.once && G.save.cmdUsed[name]){ chatSay(tr('Ese comando ya se ha usado en esta partida.'), '#ff9a8a'); return; }
  const out = c.run(); if(c.once){ G.save.cmdUsed[name] = true; saveGame(); }
  if(typeof UI !== 'undefined' && UI.refresh) UI.refresh();
  chatSay(tr(out), '#9affb0');
}
const chatBox = document.createElement('div'); chatBox.id = 'chat'; chatBox.className = 'hidden';
chatBox.innerHTML = '<div id="chatLog"></div><input id="chatInput" type="text" maxlength="200" autocomplete="off" placeholder="Escribe un mensaje o un /comando… (Enter envía, Esc cierra)">';
document.body.append(chatBox);
const chatLog = chatBox.querySelector('#chatLog'), chatIn = chatBox.querySelector('#chatInput');
function renderChat(){
  const now = Date.now(), shown = CHAT.lines.filter(l => CHAT.open || now - l.at < 9000).slice(-8);
  chatLog.innerHTML = ''; for(const l of shown){ const d = document.createElement('div'); d.textContent = l.text; d.style.color = l.col; chatLog.append(d); }
  chatBox.classList.toggle('hidden', !CHAT.open && !shown.length); chatBox.classList.toggle('open', CHAT.open);
}
setInterval(() => { if(!CHAT.open && CHAT.lines.length) renderChat(); }, 1000);
function chatOpen(){ CHAT.open = true; renderChat(); chatIn.value = ''; chatIn.focus(); }
function chatClose(){ CHAT.open = false; chatIn.blur(); renderChat(); }
chatIn.placeholder = tr(chatIn.placeholder);
chatIn.addEventListener('keydown', e => {
  e.stopPropagation();
  if(e.key === 'Escape'){ e.preventDefault(); chatClose(); }
  else if(e.key === 'Enter'){ e.preventDefault(); const v = chatIn.value.trim(); if(v){ if(v[0] === '/') chatRun(v); else chatSay((G.save.name || tr('Tú')) + ': ' + v); } chatClose(); }
});
addEventListener('keydown', e => {
  if(e.code !== 'Enter' && e.code !== 'NumpadEnter') return;
  if(CHAT.open || typing() || !G.sc || G.menu || G.paused || UI.blocking() || G.channel) return;
  e.preventDefault(); e.stopImmediatePropagation(); chatOpen();
}, true);

Object.assign(LANG_EN, {
  'Comando desconocido. Escribe /ayuda':'Unknown command. Type /ayuda', 'Ese comando ya se ha usado en esta partida.':'That command has already been used in this save.',
  '+100.000 de oro (guardados en la guarida).':'+100,000 gold (kept in the den).', '+200.000 de oro (guardados en la guarida).':'+200,000 gold (kept in the den).',
  'Escribe un mensaje o un /comando… (Enter envía, Esc cierra)':'Type a message or a /command… (Enter sends, Esc closes)', 'Tú':'You',
});
LANG.load(LANG_EN);
