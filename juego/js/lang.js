'use strict';
// =====================================================================
//  Idioma: capa de traducción en tiempo de ejecución (español → inglés).
//  El juego está escrito en español; cuando el idioma es «en» se traduce todo lo que se dibuja (canvas) o se muestra (DOM)
//  con el diccionario de lang-en.js. Las claves con {} son plantillas (el texto variable se traduce aparte).
// =====================================================================
const LANG = {
  cur: 'es', exact: new Map(), lower: new Map(), pats: [], words: new Map(), cache: new Map(), missing: new Set(), loaded: false,
  list: [['es', 'Español'], ['en', 'English']],
  init(){
    let l = null; try { l = localStorage.getItem('heroes-pets-lang'); } catch(e){}
    if(!l){ const nl = (navigator.language || 'es').toLowerCase(); l = nl.startsWith('es') ? 'es' : 'en'; }
    this.cur = l === 'en' ? 'en' : 'es';
  },
  load(dict){
    this.enVals = new Set(); this.exact.clear(); this.lower.clear(); this.pats = []; this.words.clear(); this.cache.clear();
    const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    for(const k in dict){
      const v = dict[k]; if(v == null || v === '-') continue;
      this.enVals.add(v.toLowerCase());
      if(k.includes('{}')){
        const parts = k.split('{}'), re = new RegExp('^' + parts.map(esc).join('([\\s\\S]*?)') + '$');
        this.pats.push({re, en:v, lit:k.replace(/\{\}/g, '').length});
      } else {
        this.exact.set(k, v); const lk = k.toLowerCase(); if(!this.lower.has(lk)) this.lower.set(lk, {k, v});
        if(k.length >= 3){ const w = (k.toLowerCase().match(/^[a-záéíóúñü]+/) || [])[0]; if(w){ if(!this.words.has(w)) this.words.set(w, []); this.words.get(w).push({p:k.toLowerCase(), k, v}); } }
      }
    }
    this.pats.sort((a, b) => b.lit - a.lit);
    for(const a of this.words.values()) a.sort((x, y) => y.p.length - x.p.length);
    this.loaded = true;
  },
  set(l){
    this.cur = l === 'en' ? 'en' : 'es'; this.cache.clear();
    try { localStorage.setItem('heroes-pets-lang', this.cur); } catch(e){}
    if(typeof document !== 'undefined') domRefresh();
    if(typeof document !== 'undefined') document.documentElement.lang = this.cur;
  },
  // aplica el estilo de mayúsculas del original al texto traducido
  fit(src, key, en){
    if(src === key) return en;
    if(src.length > 1 && src === src.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(src)) return en.toUpperCase();
    if(/^[a-záéíóúñ]/.test(src) && /^[A-ZÁÉÍÓÚÑ]/.test(key)) return en[0].toLowerCase() + en.slice(1);
    return en;
  },
  tr1(core){
    let v = this.exact.get(core); if(v != null) return v;
    const lc = this.lower.get(core.toLowerCase()); if(lc) return this.fit(core, lc.k, lc.v);
    for(const p of this.pats){
      const m = core.match(p.re); if(!m) continue;
      if(p.lit < 8 && m.slice(1).some(c => /[A-Za-zÁ-ú]/.test(c))) continue;   // plantillas muy cortas: solo con números
      const caps = m.slice(1).map(c => this.tr(c));
      let seq = 0;
      return p.en.replace(/\{(\d*)\}/g, (x, n) => caps[n ? n - 1 : seq++] ?? '');
    }
    const pm = core.match(/^([◆★☠⚠✔·•✦▶►]+\s*)([\s\S]+)$/);   // símbolos delante del texto
    if(pm){ const rest = this.tr1(pm[2]); if(rest !== pm[2]) return pm[1] + rest; }
    for(const d of [': ', ' · ', '. ', ' — ', ', ']){   // «Título: descripción», «a · b», frases seguidas
      if(!core.includes(d)) continue;
      const parts = core.split(d).map(p => this.tr(p)); const out = parts.join(d);
      if(out !== core) return out;
    }
    return this.fallback(core);
  },
  fallback(s){   // sustituye las frases conocidas que aparezcan dentro del texto (cadenas formadas por trozos)
    const low = s.toLowerCase(); let out = '', i = 0, hit = false;
    const wre = /[a-záéíóúñü]+/g; let m, last = 0;
    while((m = wre.exec(low))){
      const pos = m.index; if(pos < last) continue;
      const cands = this.words.get(m[0]); if(!cands) continue;
      for(const c of cands){
        if(!low.startsWith(c.p, pos)) continue;
        const end = pos + c.p.length, nx = low[end]; if(nx && /[a-záéíóúñü]/.test(nx) && /[a-záéíóúñü]$/.test(c.p)) continue;
        out += s.slice(last, pos) + this.fit(s.substr(pos, c.p.length), c.k, c.v); last = end; wre.lastIndex = end; hit = true; break;
      }
    }
    return hit ? out + s.slice(last) : s;
  },
  tr(s){
    if(this.cur === 'es' || typeof s !== 'string' || !s) return s;
    if(!/[A-Za-zÁ-ú]/.test(s)) return s;
    let r = this.cache.get(s); if(r !== undefined) return r;
    const lead = s.match(/^\s*/)[0], trail = s.match(/\s*$/)[0], core = s.trim();
    if(s.includes('\n')) r = s.split('\n').map(l => this.tr(l)).join('\n');
    else r = lead + this.num(core, this.tr1(core)) + trail;
    if(this.cache.size > 12000) this.cache.clear();
    this.cache.set(s, r);
    if(r === s && !this.enVals.has(core.toLowerCase()) && this.missing.size < 3000) this.missing.add(s);
    return r;
  },
  num(src, out){   // números a la inglesa: 1,5 → 1.5 y 10.000 → 10,000
    if(!/\d/.test(out)) return out;
    const th = src.match(/\b\d{1,3}(?:\.\d{3})+\b/g);
    out = out.replace(/(\d),(\d)/g, '$1.$2');
    if(th) for(const t of th) out = out.split(t).join(t.replace(/\./g, ','));
    return out;
  },
};
const SPANISH_RE = /[áéíóúñ¿¡]|\b(de|la|el|los|las|que|tu|tus|con|para|por|una|un|del|al|no|se|es|en|te|su|sus|más|ya|si)\b/i;
const tr = s => LANG.tr(s);
LANG.init();

// ---------- canvas ----------
(function(){
  const P = CanvasRenderingContext2D.prototype, f = P.fillText, k = P.strokeText, m = P.measureText;
  P.fillText = function(t, ...a){ return f.call(this, LANG.cur === 'es' ? t : LANG.tr(String(t)), ...a); };
  P.strokeText = function(t, ...a){ return k.call(this, LANG.cur === 'es' ? t : LANG.tr(String(t)), ...a); };
  P.measureText = function(t){ return m.call(this, LANG.cur === 'es' ? t : LANG.tr(String(t))); };
  const al = window.alert, cf = window.confirm;
  window.alert = t => al.call(window, tr(String(t)));
  window.confirm = t => cf.call(window, tr(String(t)));
})();

// ---------- DOM ----------
const LANG_ATTRS = ['title', 'placeholder', 'alt'];
function trTextNode(n){
  const v = n.nodeValue;
  if(n.__en !== undefined && v === n.__en) return;   // lo ha puesto este módulo
  n.__es = v; n.__en = undefined;
  if(LANG.cur === 'es' || !v.trim()) return;
  const t = LANG.tr(v); if(t !== v){ n.__en = t; n.nodeValue = t; }
}
function trAttrs(el){
  for(const a of LANG_ATTRS){
    if(!el.hasAttribute || !el.hasAttribute(a)) continue;
    const v = el.getAttribute(a), st = el.__attr || (el.__attr = {});
    if(st[a] && st[a].en === v) continue;
    st[a] = {es:v, en:undefined};
    if(LANG.cur === 'es') continue;
    const t = LANG.tr(v); if(t !== v){ st[a].en = t; el.setAttribute(a, t); }
  }
}
function trTree(root){
  if(root.nodeType === 3){ trTextNode(root); return; }
  if(root.nodeType !== 1) return;
  const tag = root.tagName; if(tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA') return;
  trAttrs(root);
  for(let c = root.firstChild; c; c = c.nextSibling) trTree(c);
}
function domRefresh(){   // al cambiar de idioma: restaura el original y vuelve a traducir todo el documento
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_ALL); let n;
  while((n = w.nextNode())){
    if(n.nodeType === 3){ if(n.__en !== undefined && n.nodeValue === n.__en) n.nodeValue = n.__es; n.__en = undefined; trTextNode(n); }
    else if(n.nodeType === 1){ if(n.__attr) for(const a in n.__attr){ const s = n.__attr[a]; if(s.en !== undefined && n.getAttribute(a) === s.en) n.setAttribute(a, s.es); delete n.__attr[a]; } trAttrs(n); }
  }
}
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.lang = LANG.cur;
  trTree(document.body);
  new MutationObserver(recs => {
    for(const r of recs){
      if(r.type === 'childList') r.addedNodes.forEach(trTree);
      else if(r.type === 'characterData') trTextNode(r.target);
      else if(r.type === 'attributes') trAttrs(r.target);
    }
  }).observe(document.body, {childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:LANG_ATTRS});
});
