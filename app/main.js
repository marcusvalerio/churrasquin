/* churrasquin — app/main.js
 * Protótipo de ponta a ponta: abertura → onboarding (3 telas) → app com 5 abas
 * (Início, Planejar, Cortes, Na brasa, Receitas) + Lista (botão no topo).
 * Lógica reaproveitada da versão anterior: plano adultos/crianças/apetite, divisão por rendimento,
 * mixes, linha do tempo de trás pra frente, timers, ponto pelo termômetro, zonas, lista e WhatsApp.
 * Expõe window.Plan = { has, add, remove, toggle } (usado pela ficha do animal). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var KEY = 'churrasquin.proto.v1';
  var REF = 0.72;
  var RM = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  function reduced() { return !!RM.matches; }
  var ANIMAL_NOME = { boi: 'Boi', porco: 'Porco', cordeiro: 'Cordeiro', frango: 'Frango' };
  var CAT = { nobre: 'Nobre', tradicional: 'Tradicional', steak: 'Steak', popular: 'Popular', miudo: 'Miúdo' };
  var AP_FALLBACK = { pouco: { label: 'Comem pouco', gramas: 300 }, confortavel: { label: 'Normal', gramas: 400 }, bem: { label: 'Comem bem', gramas: 500 } };
  var MIXES = {
    classico: { label: 'Clássico', desc: 'picanha, fraldinha, linguiça e frango', w: { picanha: 3, fraldinha: 2, 'linguica-toscana': 2, 'coxa-sobrecoxa': 1.5, 'coracao-frango': 1 } },
    economico: { label: 'Econômico', desc: 'frango, linguiça, acém e costelinha', w: { 'coxa-sobrecoxa': 3, 'linguica-toscana': 2, acem: 2, 'costelinha-suina': 2, 'coracao-frango': 1 } },
    parrilla: { label: 'Parrilla', desc: 'vacío, tira de asado, entraña e chorizo', w: { vazio: 3, 'tira-de-asado': 2, entrana: 1.5, chorizo: 1.5, morcilla: 0.5 } },
    gaucho: { label: 'Gaúcho', desc: 'costela, picanha, salsichão e coração', w: { costela: 3, 'ponta-de-peito': 2, salsichao: 2, picanha: 2, 'coracao-frango': 1 } }
  };
  var SUGESTOES = ['picanha', 'fraldinha', 'maminha', 'costela', 'linguica-toscana', 'coxa-sobrecoxa', 'ancho', 'cupim', 'coracao-frango', 'vazio', 'pancetta-suina', 'entrana'];
  var VIEWS = ['inicio', 'planejar', 'cortes', 'brasa', 'receitas'];
  var ABOUT = {
    splash: 'Abertura: o selo carimba e a assinatura escreve churrasquin, com o espeto correndo no sublinhado.',
    onb: 'Onboarding em 3 perguntas. As respostas já montam o plano: pessoas, cortes e hora de servir.',
    inicio: 'Início: o churrasco de hoje num relance. Pessoas, kg, hora de servir e o próximo passo da brasa.',
    planejar: 'Planejar: turma, apetite e cortes. A conta divide a carne pelo rendimento de cada peça.',
    cortes: 'Cortes: guia impresso. Toque numa peça para abrir a ficha com o mapa do animal e o zoom na região.',
    brasa: 'Na brasa: ordem de entrada de trás pra frente, timers reais com aviso de virar, termômetro e zonas de fogo.',
    receitas: 'Receitas: farofas, molhos, maioneses. Ingredientes escalados pelo número de pessoas do plano.',
    lista: 'Lista: carne, carvão e ingredientes das receitas numa lista só, pronta para mandar no WhatsApp.'
  };

  /* ---------- ícones: biblioteca icons/ (sprite injetado no index.html, ids ic-*) ---------- */
  var I = { plus: 'adicionar', check: 'check', x: 'remover', clock: 'relogio', fire: 'fogo-forte', people: 'turma', share: 'compartilhar',
    copy: 'copiar', book: 'receitas', bag: 'lista-sacola', arrow: 'avancar', search: 'busca', info: 'info', play: 'play', stop: 'pause', thermo: 'termometro' };
  function ic(n, cls) { return '<svg class="i' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-' + (I[n] || n) + '"/></svg>'; }
  function dog(cls) { return '<svg class="dog ' + (cls || '') + '" viewBox="0 0 490 290" aria-hidden="true"><use href="#dog"/></svg>'; }

  /* ---------- util ---------- */
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function kgN(g) { return (g / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
  function kgTxt(g) { return kgN(g) + ' kg'; }
  function cortes() { return Array.isArray(window.CORTES) ? window.CORTES : []; }
  var byId = null;
  function corte(id) { if (!byId) { byId = {}; cortes().forEach(function (c) { byId[c.id] = c; }); } return byId[id]; }
  function apetites() { return window.APETITE && typeof window.APETITE === 'object' ? window.APETITE : AP_FALLBACK; }
  function R() { return window.ReceitasUI; }

  /* ---------- estado ---------- */
  var plan = { adultos: 10, criancas: 2, apetite: 'confortavel', itens: [], servir: '13:00', receitas: [], ok: {}, feitos: {}, onboarded: false };
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && Array.isArray(s.itens)) plan = Object.assign(plan, s); } catch (e) {}
    plan.itens = plan.itens.filter(function (it) { return corte(it.id); });
    if (!apetites()[plan.apetite]) plan.apetite = Object.keys(apetites())[1] || Object.keys(apetites())[0];
    if (!plan.itens.length) applyMix('classico', true);
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(plan)); } catch (e) {} }
  function has(id) { return plan.itens.some(function (it) { return it.id === id; }); }
  function add(id) { if (!corte(id) || has(id)) return false; plan.itens.push({ id: id }); commit(); return true; }
  function remove(id) { plan.itens = plan.itens.filter(function (it) { return it.id !== id; }); commit(); }
  function toggle(id) { if (has(id)) { remove(id); return false; } add(id); stamp('Na lista'); return true; }
  function applyMix(k, quiet) {
    var w = MIXES[k].w; plan.mix = k;
    plan.itens = Object.keys(w).filter(corte).map(function (id) { return { id: id, w: w[id] }; });
    if (!quiet) commit();
  }

  /* Divide a carne da turma entre os cortes: cada corte recebe a mesma porção "servida";
   * corte com mais perda (osso, capa) ganha mais peso cru. Ajustes manuais são respeitados. */
  function compute() {
    var A = apetites(), g = (A[plan.apetite] || A.confortavel || { gramas: 400 }).gramas;
    var porcoes = plan.adultos + plan.criancas * 0.5;
    var alvo = porcoes * g, manualEq = 0, auto = [], wSum = 0;
    plan.itens.forEach(function (it) {
      var c = corte(it.id), r = (c && c.rendimento) || REF;
      if (it.g > 0) manualEq += it.g * r / REF; else { auto.push(it); wSum += it.w > 0 ? it.w : 1; }
    });
    var resto = Math.max(0, alvo - manualEq);
    var linhas = plan.itens.map(function (it) {
      var c = corte(it.id), r = (c && c.rendimento) || REF, grams;
      if (it.g > 0) grams = it.g;
      else grams = auto.length ? Math.max(200, Math.round((resto * (it.w > 0 ? it.w : 1) / wSum) * REF / r / 100) * 100) : 0;
      return { id: it.id, c: c, g: grams, manual: it.g > 0 };
    });
    var totalG = linhas.reduce(function (s, l) { return s + l.g; }, 0);
    var pessoas = plan.adultos + plan.criancas;
    var carvao = linhas.length ? Math.max(3, Math.ceil(totalG / 1000)) : 0;
    var extras = linhas.length ? [
      { id: 'carvao', nome: 'Carvão', qtd: carvao + ' kg', obs: '~1 kg por kg de carne' },
      { id: 'sal', nome: 'Sal grosso', qtd: totalG > 8000 ? '2 kg' : '1 kg' },
      { id: 'gelo', nome: 'Gelo', qtd: Math.max(1, Math.ceil(pessoas / 6)) + ' saco(s) de 5 kg' },
      { id: 'acendedor', nome: 'Acendedor ou álcool gel', qtd: '1 un.' }
    ] : [];
    return { linhas: linhas, totalG: totalG, pessoas: pessoas, porcoes: porcoes, alvo: alvo, extras: extras, carvao: carvao };
  }
  function pessoasTxt() {
    return plan.adultos + (plan.adultos === 1 ? ' adulto' : ' adultos') + (plan.criancas ? ' e ' + plan.criancas + (plan.criancas === 1 ? ' criança' : ' crianças') : '');
  }

  /* ---------- tempos, zonas, ponto (ofício do assador) ---------- */
  var ZONAS = {
    forte: { nome: 'Brasa forte', palmos: '1 palmo · ~20 cm', mao: '2–3 s', uso: 'Selar, cortes finos, coração, espetinho' },
    media: { nome: 'Brasa média', palmos: '1,5 palmo · ~30 cm', mao: '4–5 s', uso: 'Peças médias, linguiça, frango com osso' },
    branda: { nome: 'Fogo brando', palmos: '2–3 palmos · 40–60 cm', mao: '7–8 s', uso: 'Costela, cupim, peças inteiras' },
    indireto: { nome: 'Indireto', palmos: 'lado sem brasa', mao: '10 s+', uso: 'Terminar sem queimar, segurar quente' }
  };
  var PONTOS = [
    { nome: 'Selado', sub: 'azul, só a casca', min: 45, max: 49, cor: '#7a1a12' },
    { nome: 'Mal passado', sub: 'centro vermelho', min: 50, max: 54, cor: '#b3261a' },
    { nome: 'Ao ponto', sub: 'centro rosado', min: 57, max: 60, cor: '#d9573a' },
    { nome: 'Ao ponto p/ bem', sub: 'rosado leve', min: 63, max: 65, cor: '#b87a52' },
    { nome: 'Bem passado', sub: 'sem rosado', min: 70, max: 74, cor: '#6b5040' }
  ];
  var SEGUROS = [['Frango', '74 °C na coxa, perto do osso'], ['Porco (lombo, copa)', '63 °C + 3 min de descanso'], ['Linguiça / moída', '71 °C no centro'], ['Costela de boi', '90–95 °C para desmanchar']];
  function tempoMin(c) {
    var m = String((c && c.tempo) || '').match(/(\d+)(?:\s*[-–a]\s*(\d+))?\s*(min|h)/);
    if (!m) return 0; var v = +(m[2] || m[1]); return m[3] === 'h' ? v * 60 : v;
  }
  function durTxt(min) { if (min < 60) return min + ' min'; var h = Math.floor(min / 60), r = min % 60; return h + ' h' + (r ? ' ' + r : ''); }
  function zona(c) {
    var b = norm(c.brasa || ''), t = tempoMin(c);
    if (/2 a 3 palmos|longe|fogo de chao/.test(b) || t >= 120) return Object.assign({ k: 'branda' }, ZONAS.branda);
    if (/1,5 palmo|media/.test(b) || t >= 30) return Object.assign({ k: 'media' }, ZONAS.media);
    return Object.assign({ k: 'forte' }, ZONAS.forte);
  }
  function descanso(c) { return c.animal === 'boi' || c.animal === 'cordeiro' ? (tempoMin(c) >= 120 ? 15 : 5) : 0; }
  function hhmm(d) { return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function horaSel(id) {
    var v = plan.servir || '13:00', o = [], has = false;
    for (var m = 0; m < 1440; m += 15) { var h = String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); if (h === v) has = true; o.push(h); }
    if (!has) { o.push(v); o.sort(); }
    return '<select id="' + id + '" class="hsel" aria-label="Horário de servir (24 h)">' + o.map(function (h) { return '<option value="' + h + '"' + (h === v ? ' selected' : '') + '>' + h + '</option>'; }).join('') + '</select>';
  }
  function servirDate() { var sv = (plan.servir || '13:00').split(':'), T = new Date(); T.setHours(+sv[0] || 13, +sv[1] || 0, 0, 0); return T; }
  function sequence(r) {
    var T = servirDate();
    var seq = r.linhas.map(function (l) {
      var t = tempoMin(l.c) || 20, d = descanso(l.c), z = zona(l.c);
      var sai = new Date(T - d * 60000), entra = new Date(sai - t * 60000);
      return { l: l, t: t, d: d, z: z, entra: entra, sai: sai };
    }).sort(function (a, b) { return a.entra - b.entra; });
    var acender = seq.length ? new Date(seq[0].entra - 40 * 60000) : null;
    return { T: T, seq: seq, acender: acender };
  }
  function proximo(r) {
    var s = sequence(r), now = Date.now();
    if (!s.seq.length) return null;
    var ev = [{ t: s.acender, txt: 'Acender ' + r.carvao + ' kg de carvão', k: 'fogo' }].concat(s.seq.map(function (x) { return { t: x.entra, txt: x.l.c.nome + ' na ' + x.z.nome.toLowerCase(), k: x.z.k }; }), [{ t: s.T, txt: 'Servir', k: 'servir' }]);
    for (var i = 0; i < ev.length; i++) if (ev[i].t.getTime() > now) return ev[i];
    return { t: s.T, txt: 'Planejar o próximo churrasco', k: 'servir', passou: true };
  }
  function faltaTxt(d) {
    var m = Math.round((d - Date.now()) / 60000); if (m <= 0) return 'agora';
    if (m < 60) return 'em ' + m + ' min'; var h = Math.floor(m / 60), r = m % 60; return 'em ' + h + ' h' + (r ? ' ' + r : '');
  }

  /* ---------- movimento: contador que gira (odômetro, só transform) ---------- */
  function odo(el, text) {
    if (!el) return; text = String(text);
    if (el.dataset.v === text) return;
    var old = el.dataset.v; el.dataset.v = text;
    el.setAttribute('aria-label', text);
    if (reduced() || old == null || old.length !== text.length) {
      el.innerHTML = text.split('').map(function (ch) {
        return /\d/.test(ch) ? '<span class="odo" aria-hidden="true"><span class="odo__s" style="transform:translateY(-' + (+ch * 10) + '%)">' + digits() + '</span></span>' : '<span class="odo__c" aria-hidden="true">' + esc(ch) + '</span>';
      }).join('');
      if (!reduced() && old == null) roll(el, text, true);
      return;
    }
    roll(el, text, false);
  }
  function digits() { var s = ''; for (var i = 0; i < 10; i++) s += '<span>' + i + '</span>'; return s; }
  function roll(el, text, fromZero) {
    var spans = el.querySelectorAll('.odo__s'), k = 0;
    text.split('').forEach(function (ch) {
      if (!/\d/.test(ch)) return; var s = spans[k++]; if (!s) return;
      if (fromZero) { s.style.transition = 'none'; s.style.transform = 'translateY(0)'; void s.offsetWidth; s.style.transition = ''; }
      s.style.transform = 'translateY(-' + (+ch * 10) + '%)';
    });
  }

  /* ---------- carimbo e toast ---------- */
  function stamp(txt) {
    var fx = $('#stampfx'); fx.innerHTML = '<span class="stampfx__s">' + esc(txt) + '</span>';
    fx.classList.remove('go'); void fx.offsetWidth; fx.classList.add('go');
    try { if (navigator.vibrate) navigator.vibrate(18); } catch (e) {}
  }
  var toastT;
  function toast(msg, act) {
    var t = $('#toast'); t.innerHTML = '<span>' + esc(msg) + '</span>' + (act ? '<button type="button" class="toast__a">' + esc(act.label) + '</button>' : '');
    if (act) t.querySelector('button').onclick = function () { act.fn(); t.classList.remove('on'); };
    t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, act ? 4200 : 2600);
  }
  function bump(el) { if (!el) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }

  /* ============ ABERTURA ============ */
  function splash(done) {
    var s = $('#splash'); setAbout('splash');
    var finish = function () { if (s.dataset.done) return; s.dataset.done = '1'; s.classList.add('out'); setTimeout(function () { s.hidden = true; done(); }, reduced() ? 0 : 420); };
    $('#splash-skip').addEventListener('click', finish);
    s.addEventListener('click', finish);
    var start = function () { requestAnimationFrame(function () { s.classList.add('play'); }); setTimeout(finish, reduced() ? 600 : 2900); };
    // a assinatura vem inline para o espeto do sublinhado poder deslizar sozinho
    var img = $('.splash__sig', s), started = false, go = function () { if (!started) { started = true; start(); } };
    setTimeout(go, 700);
    if (img && window.fetch && location.protocol !== 'file:') {
      fetch('brand/final/assinatura-script.svg').then(function (r) { return r.ok ? r.text() : Promise.reject(); }).then(function (t) {
        if (started) return;
        var d = document.createElement('div'); d.innerHTML = t; var svg = d.querySelector('svg'); if (!svg) return;
        svg.setAttribute('class', 'splash__sig'); svg.setAttribute('aria-hidden', 'true'); svg.removeAttribute('role');
        var gs = svg.querySelectorAll('g'), e = gs[gs.length - 1];
        if (e && e.querySelector('rect')) { var w = document.createElementNS('http://www.w3.org/2000/svg', 'g'); e.parentNode.insertBefore(w, e); w.appendChild(e); w.setAttribute('class', 'sig-espeto'); }
        img.parentNode.replaceChild(svg, img);
      }).catch(function () {}).then(go);
    } else go();
  }

  /* ============ ONBOARDING ============ */
  var onbI = 0;
  function onbHTML() {
    var A = apetites();
    return '' +
      '<div class="onb__p" data-i="0"><p class="eyebrow onb__s">bora?</p><h1 class="onb__t">Quantos vêm?</h1><p class="onb__d">Criança conta meia porção. Dá pra mudar depois.</p>' +
      stepperHTML('adultos', 'Adultos') + stepperHTML('criancas', 'Crianças') +
      '<fieldset class="seg"><legend class="sr">Apetite da turma</legend>' + Object.keys(A).map(function (k) { return '<label><input type="radio" name="onb-ap" value="' + k + '"' + (plan.apetite === k ? ' checked' : '') + '><span>' + esc(A[k].label) + '<small>' + A[k].gramas + ' g</small></span></label>'; }).join('') + '</fieldset>' + dog('dog--onb') + '</div>' +
      '<div class="onb__p" data-i="1"><p class="eyebrow onb__s">a turma</p><h1 class="onb__t">Do que a turma gosta?</h1><p class="onb__d">Escolha um estilo. A gente divide os quilos entre os cortes.</p>' +
      '<div class="mixes mixes--grid" role="radiogroup" aria-label="Estilo do churrasco">' + Object.keys(MIXES).map(function (k, i) { return mixBtn(k, i); }).join('') + '</div></div>' +
      '<div class="onb__p" data-i="2"><p class="eyebrow onb__s">relógio</p><h1 class="onb__t">Que horas sai?</h1><p class="onb__d">A gente calcula de trás pra frente quando acender e quando cada corte entra.</p>' +
      '<div class="horas" role="radiogroup" aria-label="Horário de servir">' + ['12:00', '13:00', '14:00', '19:00', '20:00'].map(function (h) { return '<button type="button" class="hora" role="radio" data-hora="' + h + '" aria-checked="' + (plan.servir === h) + '">' + h + '</button>'; }).join('') + '</div>' +
      '<label class="field"><span>Outro horário</span>' + horaSel('onb-hora') + '</label>' +
      '<p class="onb__prev" id="onb-prev"></p></div>';
  }
  function mixBtn(k, i) {
    var m = MIXES[k];
    return '<button type="button" class="mix" role="radio" style="--i:' + i + '" data-mix="' + k + '" aria-checked="' + (plan.mix === k) + '"><b>' + esc(m.label) + '</b><small>' + esc(m.desc) + '</small><span class="mix__ok" aria-hidden="true">' + ic('check') + '</span></button>';
  }
  function stepperHTML(k, label) {
    return '<div class="count" data-k="' + k + '"><span class="count__l">' + label + '</span><span class="stepper"><button type="button" class="stepper__b" data-d="-1" aria-label="Menos ' + label.toLowerCase() + '">−</button>' +
      '<output class="count__v odo-host" data-odo="' + k + '" aria-live="polite"></output><button type="button" class="stepper__b" data-d="1" aria-label="Mais ' + label.toLowerCase() + '">+</button></span></div>';
  }
  function onboarding(done) {
    var o = $('#onb'); o.hidden = false; setAbout('onb');
    var tr = $('#onb-track'); tr.innerHTML = onbHTML();
    var go = function (i) {
      onbI = Math.max(0, Math.min(2, i));
      tr.style.transform = 'translateX(' + (-onbI * 100) + '%)';
      $$('.onb__p', tr).forEach(function (p, j) { p.classList.toggle('is-on', j === onbI); p.setAttribute('aria-hidden', j !== onbI); p.inert = j !== onbI; });
      $$('.onb__dots i', o).forEach(function (d, j) { d.classList.toggle('on', j <= onbI); });
      $('#onb-back').style.visibility = onbI ? 'visible' : 'hidden';
      $('#onb-next').textContent = onbI === 2 ? 'Montar meu churrasco' : 'Continuar';
      prevOnb();
      var h = $('.onb__p.is-on .onb__t', tr); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
    };
    var end = function () {
      plan.onboarded = true; commit(); o.classList.add('out');
      setTimeout(function () { o.hidden = true; done(); stamp('Plano pronto'); }, reduced() ? 0 : 380);
    };
    o.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.d) stepTap(b);
      else if (b.dataset.mix) { applyMix(b.dataset.mix); $$('.mix', o).forEach(function (x) { x.setAttribute('aria-checked', x === b); }); bump(b); }
      else if (b.dataset.hora) { plan.servir = b.dataset.hora; $('#onb-hora').value = plan.servir; $$('.hora', o).forEach(function (x) { x.setAttribute('aria-checked', x === b); }); commit(); prevOnb(); }
      else if (b.id === 'onb-next') { if (onbI < 2) go(onbI + 1); else end(); }
      else if (b.id === 'onb-back') go(onbI - 1);
      else if (b.id === 'onb-skip') end();
    });
    o.addEventListener('change', function (e) {
      if (e.target.name === 'onb-ap') { plan.apetite = e.target.value; commit(); }
      if (e.target.id === 'onb-hora' && /^\d\d:\d\d$/.test(e.target.value)) { plan.servir = e.target.value; $$('.hora', o).forEach(function (x) { x.setAttribute('aria-checked', x.dataset.hora === plan.servir); }); commit(); prevOnb(); }
    });
    syncCounts(); go(0);
  }
  function prevOnb() {
    var p = $('#onb-prev'); if (!p) return; var r = last, s = sequence(r);
    p.innerHTML = s.acender ? ic('fire') + '<span>Acender às <b>' + hhmm(s.acender) + '</b> · ' + kgTxt(r.totalG) + ' de carne para ' + pessoasTxt() + '</span>' : '';
  }
  function stepTap(b) {
    var k = b.closest('[data-k]').dataset.k;
    plan[k] = Math.max(k === 'adultos' ? 1 : 0, Math.min(200, plan[k] + +b.dataset.d)); commit();
  }
  function syncCounts() {
    $$('[data-odo="adultos"]').forEach(function (e) { odo(e, plan.adultos); });
    $$('[data-odo="criancas"]').forEach(function (e) { odo(e, plan.criancas); });
    $$('.count').forEach(function (c) { var m = c.querySelector('[data-d="-1"]'); if (m) m.disabled = plan[c.dataset.k] <= (c.dataset.k === 'adultos' ? 1 : 0); });
  }

  /* ============ NAVEGAÇÃO ============ */
  var cur = null;
  function setView(v, push) {
    if (VIEWS.indexOf(v) < 0) v = 'inicio';
    if (v === cur) { var sc = $('#v-' + v); if (push && sc) sc.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); return; }
    var from = cur ? $('#v-' + cur) : null, to = $('#v-' + v), dir = cur ? (VIEWS.indexOf(v) > VIEWS.indexOf(cur) ? 1 : -1) : 0;
    cur = v; render(v);
    $$('.tab').forEach(function (t) { var on = t.dataset.tab === v; t.classList.toggle('is-on', on); if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
    var idx = VIEWS.indexOf(v); $('.tabbar').style.setProperty('--x', idx);
    to.hidden = false; to.style.setProperty('--dir', dir); to.scrollTop = 0;
    to.classList.remove('enter'); void to.offsetWidth; if (dir && !reduced()) to.classList.add('enter');
    if (from) {
      from.style.setProperty('--dir', dir); from.classList.add('leave');
      setTimeout(function () { from.classList.remove('leave'); if (cur !== from.dataset.view) from.hidden = true; }, reduced() ? 0 : 320);
    }
    if (push && location.hash !== '#' + v) history.replaceState(null, '', '#' + v);
    setAbout(v);
  }
  function setAbout(k) {
    var d = $('#about-d'); if (d) d.textContent = ABOUT[k] || '';
    $$('#about-steps li').forEach(function (li) { li.classList.toggle('on', li.dataset.k === k); });
  }
  function render(v) {
    if (v === 'inicio') renderInicio();
    if (v === 'planejar') renderPlanejar();
    if (v === 'cortes') renderCortes();
    if (v === 'brasa') renderBrasa();
    if (v === 'receitas') renderReceitas();
  }

  /* ============ INÍCIO ============ */
  function renderInicio() {
    var r = last, el = $('#v-inicio'), p = proximo(r), s = sequence(r);
    var recs = plan.receitas.map(function (id) { return R().get(id); }).filter(Boolean);
    var hora = new Date().getHours(), oi = hora < 12 ? 'bom dia' : hora < 18 ? 'boa tarde' : 'boa noite';
    el.innerHTML = '<div class="pad cascade">' +
      '<header class="hello" style="--i:0"><p class="hello__s">' + oi + ', assador</p><h1 class="h1">O churrasco de hoje</h1></header>' +
      (r.linhas.length ? '<section class="hero" style="--i:1" aria-label="Resumo">' +
        '<div class="hero__row"><div class="kpi"><span class="kpi__v odo-host" data-odo="h-pes"></span><span class="kpi__l">pessoas</span></div>' +
        '<div class="kpi"><span class="kpi__v odo-host" data-odo="h-kg"></span><span class="kpi__l">kg de carne</span></div>' +
        '<div class="kpi"><span class="kpi__v odo-host" data-odo="h-hr"></span><span class="kpi__l">servir</span></div></div>' +
        '' +
        '<p class="hero__s">' + esc(pessoasTxt()) + ' · ' + r.linhas.length + ' cortes · ' + r.carvao + ' kg de carvão</p></section>' +
        (p ? '<button type="button" class="next" style="--i:2" data-go="' + (p.passou ? 'planejar' : 'brasa') + '"><span class="next__k">' + ic('clock') + (p.passou ? 'Churrasco servido às ' + hhmm(p.t) : 'Próximo passo · ' + faltaTxt(p.t)) + '</span><b class="next__t">' + esc(p.txt) + '</b>' + (p.passou ? '' : '<span class="next__h">' + hhmm(p.t) + '</span>') + ic('arrow', 'next__a') + '</button>' : '')
        : '<section class="empty" style="--i:1">' + dog() + '<p class="empty__t">Nada planejado ainda</p><p class="empty__d">Diga quantos vêm e escolha os cortes. O resto a gente conta.</p><button type="button" class="btn btn--brasa" data-go="planejar">Planejar churrasco</button></section>') +
      '<h2 class="h2" style="--i:3">Atalhos</h2><div class="atalhos" style="--i:4">' +
      atalho('planejar', 'people', 'Ajustar turma', pessoasTxt()) + atalho('brasa', 'fire', 'Na brasa', s.acender ? 'acender às ' + hhmm(s.acender) : 'linha do tempo') +
      atalho('receitas', 'book', 'Receitas', recs.length ? recs.length + ' escolhida' + (recs.length > 1 ? 's' : '') : 'farofa, molho, maionese') +
      '<button type="button" class="atalho" data-open="lista">' + ic('bag') + '<b>Lista</b><small>' + listaCount() + ' itens · compartilhar</small></button></div>' +
      (recs.length ? '<h2 class="h2" style="--i:5">Na mesa</h2><ul class="mini-list" style="--i:6">' + recs.map(function (x) { return '<li><button type="button" data-receita="' + esc(x.id) + '">' + R().icon(x.categoria) + '<span>' + esc(x.nome) + '</span>' + ic('arrow') + '</button></li>'; }).join('') + '</ul>' : '') +
      '<p class="sig" style="--i:7"><span class="script">bom churrasco</span></p>' +
      '</div>';
    odo($('[data-odo="h-pes"]', el), r.pessoas); odo($('[data-odo="h-kg"]', el), kgN(r.totalG)); odo($('[data-odo="h-hr"]', el), plan.servir);
  }
  function atalho(v, i, t, s) { return '<button type="button" class="atalho" data-go="' + v + '">' + ic(i) + '<b>' + t + '</b><small>' + esc(s) + '</small></button>'; }

  /* ============ PLANEJAR ============ */
  function renderPlanejar() {
    var el = $('#v-planejar'), A = apetites();
    if (!el.dataset.built) {
      el.dataset.built = '1';
      el.innerHTML = '<div class="pad cascade">' +
        '<header style="--i:0"><p class="eyebrow">Passo 1 · turma</p><h1 class="h1">Quantos vêm?</h1></header>' +
        '<div class="card" style="--i:1">' + stepperHTML('adultos', 'Adultos') + stepperHTML('criancas', 'Crianças') +
        '<fieldset class="seg"><legend class="sr">Apetite</legend>' + Object.keys(A).map(function (k) { return '<label><input type="radio" name="ap" value="' + k + '"><span>' + esc(A[k].label) + '<small>' + A[k].gramas + ' g</small></span></label>'; }).join('') + '</fieldset></div>' +
        '<div class="total" style="--i:2" aria-live="polite"><span class="total__v"><span class="odo-host" data-odo="p-kg"></span><small>kg</small></span><span class="total__l" id="p-sub"></span></div>' +
        '<header style="--i:3"><p class="eyebrow">Passo 2 · cortes</p><h2 class="h2 h2--flush">Estilo pronto</h2></header>' +
        '<div class="mixes mixes--row" style="--i:4" role="radiogroup" aria-label="Estilo">' + Object.keys(MIXES).map(function (k, i) { return mixBtn(k, i); }).join('') + '</div>' +
        '<h2 class="h2" style="--i:5">No plano</h2><ul class="picks" id="picks" style="--i:6"></ul>' +
        '<p class="eyebrow" style="--i:7">Sugestões</p><div class="chips" id="sug" style="--i:8"></div>' +
        '<header style="--i:9"><p class="eyebrow">Passo 3 · horário</p><h2 class="h2 h2--flush">Que horas sai?</h2></header>' +
        '<label class="field" style="--i:10"><span>Servir às</span>' + horaSel('p-hora') + '</label>' +
        '<button type="button" class="btn btn--brasa btn--full" style="--i:11" data-go="brasa">Ver a ordem na brasa ' + ic('arrow') + '</button>' +
        '</div>';
    }
    fillPlanejar();
  }
  function fillPlanejar() {
    var el = $('#v-planejar'); if (!el.dataset.built) return;
    var r = last;
    $$('input[name="ap"]', el).forEach(function (i) { i.checked = i.value === plan.apetite; });
    $$('.mix', el).forEach(function (m) { m.setAttribute('aria-checked', plan.mix === m.dataset.mix); });
    $('#p-hora').value = plan.servir;
    odo($('[data-odo="p-kg"]', el), kgN(r.totalG));
    var gp = r.porcoes ? Math.round(r.totalG / r.porcoes / 10) * 10 : 0;
    $('#p-sub').textContent = 'de carne crua · ' + gp + ' g por porção · ' + r.carvao + ' kg de carvão';
    var picks = $('#picks'), prev = {};
    $$('.pick', picks).forEach(function (li) { prev[li.dataset.id] = 1; });
    picks.innerHTML = r.linhas.length ? r.linhas.map(function (l) {
      return '<li class="pick' + (prev[l.id] ? '' : ' is-new') + '" data-id="' + esc(l.id) + '">' + thumb(l.c) +
        '<span class="pick__n"><b>' + esc(l.c.nome) + '</b><small>' + esc(ANIMAL_NOME[l.c.animal] || '') + (tempoMin(l.c) ? ' · ' + durTxt(tempoMin(l.c)) : '') + (l.manual ? ' · ajustado' : '') + '</small></span>' +
        '<span class="qty"><button type="button" class="qty__b" data-act="dec" aria-label="Menos 250 g de ' + esc(l.c.nome) + '">−</button><output>' + kgTxt(l.g) + '</output><button type="button" class="qty__b" data-act="inc" aria-label="Mais 250 g de ' + esc(l.c.nome) + '">+</button></span>' +
        '<button type="button" class="icon-btn" data-act="rm" aria-label="Tirar ' + esc(l.c.nome) + '">' + ic('x') + '</button></li>';
    }).join('') : '<li class="empty empty--sm">' + dog() + '<p class="empty__d">Escolha um estilo ou toque nas sugestões.</p></li>';
    $('#sug').innerHTML = SUGESTOES.filter(function (id) { return corte(id) && !has(id); }).slice(0, 8).map(function (id) {
      return '<button type="button" class="chip" data-add="' + id + '">' + ic('plus') + esc(corte(id).nome) + '</button>';
    }).join('');
    syncCounts();
  }
  var thumbN = 0;
  function thumb(c) {
    var art = window.CUT_ART && window.CUT_ART[c.id];
    if (art) { var sfx = '-t' + (++thumbN); art = art.replace(/id="([^"]+)"/g, 'id="$1' + sfx + '"').replace(/url\(#([^)]+)\)/g, 'url(#$1' + sfx + ')').replace(/href="#([^"]+)"/g, 'href="#$1' + sfx + '"'); }
    return '<span class="thumb" aria-hidden="true">' + (art || ic('fire')) + '</span>';
  }

  /* ============ CORTES ============ */
  var cst = { q: '', animal: '' };
  function renderCortes() {
    var el = $('#v-cortes');
    if (!el.dataset.built) {
      el.dataset.built = '1';
      el.innerHTML = '<div class="pad">' +
        '<header class="cascade"><p class="eyebrow" style="--i:0">Guia de cortes</p><h1 class="h1" style="--i:1">De onde vem cada peça</h1></header>' +
        '<label class="search">' + ic('search') + '<span class="sr">Buscar corte</span><input type="search" id="c-q" placeholder="picanha, vacío, ribeye…" autocomplete="off"></label>' +
        '<div class="chips chips--scroll" id="c-an" role="group" aria-label="Animal">' + [['', 'Todos'], ['boi', 'Boi'], ['porco', 'Porco'], ['cordeiro', 'Cordeiro'], ['frango', 'Frango']].map(function (a) { return '<button type="button" class="chip" data-an="' + a[0] + '" aria-pressed="' + (a[0] === cst.animal) + '">' + a[1] + '</button>'; }).join('') + '</div>' +
        '<p class="count-line" id="c-n" aria-live="polite"></p><ul class="guia" id="c-grid"></ul></div>';
      var qT; $('#c-q').addEventListener('input', function (e) { clearTimeout(qT); qT = setTimeout(function () { cst.q = e.target.value; gridCortes(); }, 120); });
    }
    gridCortes();
  }
  function gridCortes() {
    var q = norm(cst.q);
    var list = cortes().filter(function (c) {
      if (cst.animal && c.animal !== cst.animal) return false;
      if (!q) return true;
      return [c.nome, c.id].concat(Object.keys(c.nomes || {}).map(function (k) { return c.nomes[k]; })).some(function (n) { return norm(n).indexOf(q) >= 0; });
    });
    $('#c-n').textContent = list.length + (list.length === 1 ? ' corte' : ' cortes');
    $('#c-grid').innerHTML = list.length ? list.map(function (c, i) {
      var on = has(c.id), art = (window.CUT_ART && window.CUT_ART[c.id]) || '';
      return '<li class="gcard' + (on ? ' is-on' : '') + '" style="--i:' + Math.min(i, 10) + '" data-id="' + esc(c.id) + '">' +
        '<button type="button" class="gcard__b" data-ficha="' + esc(c.id) + '" aria-label="Ficha: ' + esc(c.nome) + ', de onde vem"><span class="gcard__art" aria-hidden="true">' + art + '</span>' +
        '<span class="gcard__k">' + esc(ANIMAL_NOME[c.animal] || '') + (CAT[c.categoria] ? ' · ' + CAT[c.categoria] : '') + '</span><b class="gcard__n">' + esc(c.nome) + '</b>' +
        '<span class="gcard__m">' + (tempoMin(c) ? ic('clock') + durTxt(tempoMin(c)) : '') + '</span></button>' +
        '<button type="button" class="gcard__add" data-levar="' + esc(c.id) + '" aria-pressed="' + on + '" aria-label="' + (on ? 'Tirar ' : 'Levar ') + esc(c.nome) + '">' + ic(on ? 'check' : 'plus') + '</button>' +
        '<span class="gcard__stamp" aria-hidden="true">levar</span></li>';
    }).join('') : '<li class="empty">' + dog() + '<p class="empty__t">Nenhum corte com esse nome</p><p class="empty__d">Tente o nome de outro país: vacío, ojo de bife, ribeye.</p></li>';
  }
  function syncCortes() {
    $$('#c-grid .gcard').forEach(function (li) {
      var on = has(li.dataset.id), b = li.querySelector('.gcard__add'), c = corte(li.dataset.id);
      if (li.classList.contains('is-on') === on) return;
      li.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); b.innerHTML = ic(on ? 'check' : 'plus');
      b.setAttribute('aria-label', (on ? 'Tirar ' : 'Levar ') + c.nome);
      if (on) bump(li);
    });
  }

  /* ============ NA BRASA ============ */
  var timers = {}; // id -> { end, total, virou }
  function renderBrasa() {
    var el = $('#v-brasa'), r = last, s = sequence(r), seq = s.seq, T = s.T, acender = s.acender;
    var html = '<div class="pad cascade"><header style="--i:0"><p class="eyebrow">Na brasa</p><h1 class="h1">Ordem da grelha</h1></header>' +
      '<label class="field field--row" style="--i:1"><span>' + ic('clock') + 'Servir às</span>' + horaSel('b-hora') + '</label>';
    if (!seq.length) {
      html += '<div class="empty" style="--i:2">' + dog() + '<p class="empty__t">Nada na grelha ainda</p><p class="empty__d">Escolha os cortes no Planejar. Aqui sai a ordem de entrada, com timers.</p><button type="button" class="btn btn--brasa" data-go="planejar">Planejar</button></div>';
    } else {
      var span = T - acender, pos = function (d) { return Math.max(0, Math.min(100, (d - acender) / span * 100)); };
      html += '<section class="crono" style="--i:2" aria-label="Linha do tempo"><div class="crono__axis"><span>' + hhmm(acender) + '</span><span>' + hhmm(T) + '</span></div>' +
        '<div class="crono__row"><span class="crono__n">Acender</span><span class="crono__track"><span class="crono__bar crono__bar--fogo" style="--l:0;--w:' + (pos(seq[0].entra) / 100) + '"></span></span></div>' +
        seq.map(function (x, i) { return '<div class="crono__row" style="--j:' + (i + 1) + '"><span class="crono__n">' + esc(x.l.c.nome) + '</span><span class="crono__track"><span class="crono__bar crono__bar--' + x.z.k + '" style="--l:' + (pos(x.entra) / 100) + ';--w:' + (Math.max(2, pos(x.sai) - pos(x.entra)) / 100) + '"></span></span></div>'; }).join('') +
        '<span class="crono__now" style="--p:' + (pos(new Date()) / 100) + '" aria-hidden="true"></span></section>' +
        '<ol class="ordem" style="--i:3">' +
        '<li class="ordem__i ordem__i--fogo"><time>' + hhmm(acender) + '</time><div class="ordem__b"><b>Acender o carvão</b><small>' + r.carvao + ' kg. Brasa pronta quando cobrir de cinza branca (30–40 min).</small></div></li>' +
        seq.map(function (x) {
          var on = !!timers[x.l.id];
          return '<li class="ordem__i" data-id="' + esc(x.l.id) + '"><time>' + hhmm(x.entra) + '</time><div class="ordem__b"><b>' + esc(x.l.c.nome) + '</b>' +
            '<span class="ztag ztag--' + x.z.k + '">' + esc(x.z.nome) + '</span><small>' + kgTxt(x.l.g) + ' · ' + durTxt(x.t) + (x.d ? ' · descansa ' + x.d + ' min' : '') + '</small></div>' +
            '<button type="button" class="timer' + (on ? ' is-on' : '') + '" data-timer="' + esc(x.l.id) + '" data-min="' + x.t + '" aria-label="' + (on ? 'Parar timer de ' : 'Iniciar timer de ') + esc(x.l.c.nome) + '">' +
            '<svg class="timer__ring" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" class="timer__bg"/><circle cx="24" cy="24" r="21" class="timer__fg" pathLength="100"/></svg>' +
            '<span class="timer__v">' + (on ? '' : durTxt(x.t)) + '</span><span class="timer__i">' + ic(on ? 'stop' : 'play') + '</span></button></li>';
        }).join('') +
        '<li class="ordem__i ordem__i--servir"><time>' + hhmm(T) + '</time><div class="ordem__b"><b>Servir</b><small>Fatie contra a fibra, com a faca bem afiada.</small></div></li></ol>';
    }
    html += '<h2 class="h2" style="--i:4">Ponto pelo termômetro</h2>' +
      '<section class="termo card" style="--i:5"><div class="termo__g" aria-hidden="true"><span class="termo__tube"><span class="termo__fill" id="t-fill"></span></span><span class="termo__bulb"></span></div>' +
      '<div class="termo__r"><p class="termo__v"><span id="t-v">57</span> °C</p><p class="termo__p" id="t-p">Ao ponto</p><p class="termo__s" id="t-s">centro rosado</p>' +
      '<label class="range"><span class="sr">Temperatura no centro da peça</span><input type="range" id="t-in" min="40" max="80" value="57" step="1"></label></div>' +
      '<ul class="termo__list">' + PONTOS.map(function (p) { return '<li style="--c:' + p.cor + '"><i aria-hidden="true"></i><b>' + p.nome + '</b><span>' + p.min + '–' + p.max + ' °C</span></li>'; }).join('') + '</ul>' +
      '<p class="nota">Tire 2–3 °C antes do alvo: a carne continua subindo no descanso.</p>' +
      '<dl class="seguro">' + SEGUROS.map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + x[1] + '</dd></div>'; }).join('') + '</dl></section>' +
      '<h2 class="h2" style="--i:6">Zonas de fogo</h2>' +
      '<section class="card zonas-c" style="--i:7"><div class="grelha" aria-hidden="true"><span class="grelha__z z-forte"></span><span class="grelha__z z-media"></span><span class="grelha__z z-branda"></span><span class="grelha__z z-indireto"></span></div>' +
      '<ul class="zonas">' + Object.keys(ZONAS).map(function (k) { var z = ZONAS[k]; return '<li class="zona zona--' + k + '"><b>' + z.nome + '</b><span>' + z.palmos + ' · mão aguenta ' + z.mao + '</span><small>' + z.uso + '</small></li>'; }).join('') + '</ul>' +
      '<p class="nota">Monte a brasa em degrau: um lado alto e forte, outro baixo, e uma área sem brasa para o indireto.</p></section></div>';
    el.innerHTML = html;
    termo(57);
    tickTimers();
  }
  function termo(v) {
    var p = PONTOS.reduce(function (a, b) { return v >= b.min - 2 ? b : a; }, PONTOS[0]);
    var f = $('#t-fill'); if (!f) return;
    f.style.transform = 'scaleY(' + ((v - 40) / 40).toFixed(3) + ')'; f.style.background = p.cor;
    $('#t-v').textContent = v; $('#t-p').textContent = v < 45 ? 'Ainda cru' : p.nome; $('#t-s').textContent = v < 45 ? 'continue na brasa' : p.sub;
    $$('.termo__list li').forEach(function (li, i) { li.classList.toggle('on', PONTOS[i] === p && v >= 45); });
  }
  var tickT;
  function tickTimers() {
    var now = Date.now(), any = false;
    Object.keys(timers).forEach(function (id) {
      var tm = timers[id], left = Math.max(0, Math.round((tm.end - now) / 1000)), c = corte(id);
      any = true;
      if (!tm.virou && left <= tm.total / 2) { tm.virou = true; alerta('Hora de virar: ' + c.nome); }
      if (left <= 0) { delete timers[id]; alerta('Tirar da grelha: ' + c.nome); if (cur === 'brasa') renderBrasa(); return; }
      var b = document.querySelector('.timer[data-timer="' + id + '"]');
      if (b) {
        b.querySelector('.timer__v').textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
        b.style.setProperty('--p', (left / tm.total).toFixed(4));
      }
    });
    clearTimeout(tickT); if (any) tickT = setTimeout(tickTimers, 1000);
  }
  function alerta(msg) { toast(msg); try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) {} }

  /* ============ RECEITAS ============ */
  var rst = { cat: '' };
  function renderReceitas() {
    var el = $('#v-receitas');
    if (!el.dataset.built) {
      el.dataset.built = '1';
      el.innerHTML = '<div class="pad"><header class="cascade"><p class="eyebrow" style="--i:0">Receitas da mesa</p><h1 class="h1" style="--i:1">O que vai junto</h1>' +
        '<p class="lead" style="--i:2">Quantidades para <b id="r-n"></b>, do seu plano.</p></header>' +
        '<div class="chips chips--scroll" id="r-cat" role="group" aria-label="Categoria">' + R().CATS.map(function (c) { return '<button type="button" class="chip" data-cat="' + c[0] + '" aria-pressed="' + (c[0] === rst.cat) + '">' + c[1] + '</button>'; }).join('') + '</div>' +
        '<ul class="rlist" id="r-list"></ul></div>';
    }
    $('#r-n').textContent = last.pessoas + ' pessoas';
    listReceitas();
  }
  function listReceitas() {
    var l = R().list().filter(function (r) { return !rst.cat || r.categoria === rst.cat; });
    $('#r-list').innerHTML = l.length ? l.map(function (r, i) { return R().card(r, Math.min(i, 10), plan.receitas.indexOf(r.id) >= 0); }).join('') :
      '<li class="empty">' + dog() + '<p class="empty__t">Nada nessa categoria</p></li>';
  }
  var sheetR = null;
  function openReceita(id, n) {
    var r = R().get(id); if (!r) return;
    sheetR = { id: id, n: n || last.pessoas || R().base(r) };
    openSheet(fichaReceita(), 'receita');
    odo($('#sheet [data-odo="porcoes"]'), sheetR.n);
  }
  function fichaReceita() {
    var r = R().get(sheetR.id);
    return R().ficha(r, sheetR.n, { corteNome: function (id) { var c = corte(id); return c ? c.nome : null; }, naLista: plan.receitas.indexOf(r.id) >= 0, feitos: plan.feitos[r.id] || {} });
  }
  function refreshReceita() {
    var r = R().get(sheetR.id), body = $('#sheet-body');
    var ings = R().escalar(r, sheetR.n);
    $$('.ings li', body).forEach(function (li, i) { var g = ings[i]; if (!g) return; var q = li.querySelector('.ings__q'); q.textContent = g.txt || R().fmtQ(g.q, g.un); bump(q); });
    odo($('[data-odo="porcoes"]', body), sheetR.n);
  }

  /* ============ LISTA ============ */
  function receitaIngs() {
    var agg = {}, order = [];
    plan.receitas.forEach(function (id) {
      var r = R().get(id); if (!r) return;
      R().escalar(r, last.pessoas || R().base(r)).forEach(function (g) {
        var k = norm(g.item) + '|' + (g.un || '');
        if (!agg[k]) { agg[k] = { id: 'r:' + k, item: g.item, un: g.un, q: 0, txt: null, de: [] }; order.push(k); }
        if (typeof g.q === 'number') agg[k].q += g.q; else agg[k].txt = g.txt || g.q;
        if (agg[k].de.indexOf(r.nome) < 0) agg[k].de.push(r.nome);
      });
    });
    return order.map(function (k) { var a = agg[k]; a.qtd = a.q ? R().fmtQ(a.q, a.un) : (a.txt || 'a gosto'); return a; });
  }
  function listaCount() { return last.linhas.length + last.extras.length + receitaIngs().length; }
  function shareText() {
    var r = last, L = [];
    L.push('🔥 Churrasco para ' + pessoasTxt() + ' · servir às ' + plan.servir);
    L.push(''); L.push('*Carne (' + kgTxt(r.totalG) + ')*');
    r.linhas.forEach(function (l) { L.push('• ' + l.c.nome + ' — ' + kgTxt(l.g)); });
    if (r.extras.length) { L.push(''); L.push('*Brasa*'); r.extras.forEach(function (x) { L.push('• ' + x.nome + ' — ' + x.qtd); }); }
    var ri = receitaIngs();
    if (ri.length) { L.push(''); L.push('*Receitas (' + plan.receitas.map(function (id) { var x = R().get(id); return x ? x.nome : ''; }).filter(Boolean).join(', ') + ')*'); ri.forEach(function (x) { L.push('• ' + x.item + ' — ' + x.qtd); }); }
    L.push(''); L.push('Feito no churrasquin');
    return L.join('\n');
  }
  function listaHTML() {
    var r = last, ri = receitaIngs();
    var row = function (id, nome, q, sub) { var ok = !!plan.ok[id]; return '<li><label class="check"><input type="checkbox" data-ok="' + esc(id) + '"' + (ok ? ' checked' : '') + '><span class="check__box" aria-hidden="true"></span><span class="check__n">' + esc(nome) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span><span class="check__q">' + esc(q) + '</span></label></li>'; };
    if (!r.linhas.length && !ri.length) return '<div class="empty">' + dog() + '<h2 class="empty__t" id="sheet-t">Sua lista está vazia</h2><p class="empty__d">Monte o plano e escolha receitas: a lista sai pronta.</p><button type="button" class="btn btn--brasa" data-go="planejar">Planejar</button></div>';
    return '<article class="ficha ficha--lista"><p class="ficha__k">' + ic('bag') + 'Lista de compras</p><h2 class="ficha__t" id="sheet-t">Pro churrasco de ' + esc(pessoasTxt()) + '</h2>' +
      '<div class="share"><a class="btn btn--zap" id="share-zap" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(shareText()) + '">' + ic('share') + 'Mandar no WhatsApp</a>' +
      '<button type="button" class="btn btn--line" id="share-copy">' + ic('copy') + 'Copiar</button>' + (navigator.share ? '<button type="button" class="btn btn--line" id="share-native">' + ic('share') + 'Compartilhar</button>' : '') + '</div>' +
      (r.linhas.length ? '<h3 class="ficha__h">Carne <span>' + kgTxt(r.totalG) + '</span></h3><ul class="checks">' + r.linhas.map(function (l) { return row('c:' + l.id, l.c.nome, kgTxt(l.g), ANIMAL_NOME[l.c.animal]); }).join('') + '</ul>' : '') +
      (r.extras.length ? '<h3 class="ficha__h">Brasa</h3><ul class="checks">' + r.extras.map(function (x) { return row('x:' + x.id, x.nome, x.qtd, x.obs); }).join('') + '</ul>' : '') +
      (ri.length ? '<h3 class="ficha__h">Receitas</h3><ul class="checks">' + ri.map(function (x) { return row(x.id, x.item, x.qtd, x.de.join(', ')); }).join('') + '</ul>' : '<button type="button" class="link" data-go="receitas">+ Escolher farofa, molho, maionese</button>') +
      '</article>';
  }
  function openLista() { openSheet(listaHTML(), 'lista'); setAbout('lista'); }

  /* ============ SHEET ============ */
  var sheetKind = null, sheetRet = null;
  function openSheet(html, kind) {
    var sh = $('#sheet'), sc = $('#scrim');
    if (!sheetKind) sheetRet = document.activeElement;
    sheetKind = kind; $('#sheet-body').innerHTML = html; $('#sheet-body').scrollTop = 0;
    sh.hidden = false; sc.hidden = false; sh.dataset.kind = kind;
    void sh.offsetWidth; sh.classList.add('on'); sc.classList.add('on');
    $('.app').classList.add('has-sheet');
    setTimeout(function () { $('#sheet-x').focus({ preventScroll: true }); }, 30);
  }
  function closeSheet() {
    if (!sheetKind) return; sheetKind = null; sheetR = null;
    var sh = $('#sheet'), sc = $('#scrim');
    sh.classList.remove('on'); sc.classList.remove('on'); $('.app').classList.remove('has-sheet');
    setTimeout(function () { if (!sheetKind) { sh.hidden = true; sc.hidden = true; } }, reduced() ? 0 : 380);
    if (sheetRet && sheetRet.focus && document.contains(sheetRet)) sheetRet.focus({ preventScroll: true });
    setAbout(cur);
  }

  /* ============ COMMIT ============ */
  var last = null;
  function commit() {
    save(); last = compute();
    var n = $('#lista-n'), c = listaCount(); if (n) { n.textContent = c; n.dataset.n = c; }
    syncCounts();
    if (cur === 'planejar') fillPlanejar();
    if (cur === 'cortes') syncCortes();
    if (cur === 'inicio' && $('#app') && !$('#app').hidden) renderInicio();
    if (sheetKind === 'lista') { var y = $('#sheet-body').scrollTop; $('#sheet-body').innerHTML = listaHTML(); $('#sheet-body').scrollTop = y; }
  }

  /* ============ INIT ============ */
  function startApp() {
    $('#app').hidden = false;
    setView(location.hash.slice(1) || 'inicio');
  }
  function init() {
    load(); last = compute();
    var steps = $('#about-steps');
    if (steps) steps.innerHTML = [['splash', 'Abertura'], ['onb', 'Onboarding'], ['inicio', 'Início'], ['planejar', 'Planejar'], ['cortes', 'Cortes'], ['brasa', 'Na brasa'], ['receitas', 'Receitas'], ['lista', 'Lista']].map(function (s) { return '<li data-k="' + s[0] + '">' + s[1] + '</li>'; }).join('');

    var app = $('#app');
    app.addEventListener('click', function (e) {
      var t = e.target.closest('.tab[data-tab]'); if (t) { e.preventDefault(); setView(t.dataset.tab, true); return; }
      var g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); if (sheetKind) closeSheet(); setView(g.dataset.go, true); return; }
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.open === 'lista' || b.id === 'open-lista') { openLista(); return; }
      if (b.id === 'sheet-x') { closeSheet(); return; }
      if (b.dataset.d) { stepTap(b); return; }
      if (b.dataset.mix) { var prev = plan.itens.slice(), pm = plan.mix; applyMix(b.dataset.mix); bump(b); toast('Estilo ' + MIXES[b.dataset.mix].label + ' aplicado', { label: 'Desfazer', fn: function () { plan.itens = prev; plan.mix = pm; commit(); } }); return; }
      if (b.dataset.add) { add(b.dataset.add); stamp('No plano'); return; }
      if (b.dataset.act && b.closest('.pick')) {
        var id = b.closest('.pick').dataset.id, it = plan.itens.filter(function (x) { return x.id === id; })[0], cl = last.linhas.filter(function (l) { return l.id === id; })[0];
        if (b.dataset.act === 'inc') it.g = cl.g + 250; else if (b.dataset.act === 'dec') it.g = Math.max(250, cl.g - 250);
        else if (b.dataset.act === 'rm') { var c = corte(id); remove(id); toast(c.nome + ' saiu do plano', { label: 'Desfazer', fn: function () { add(id); } }); return; }
        commit(); var again = $('.pick[data-id="' + id + '"] [data-act="' + b.dataset.act + '"]'); if (again) again.focus(); return;
      }
      if (b.dataset.an != null) { cst.animal = b.dataset.an; $$('#c-an .chip').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); gridCortes(); return; }
      if (b.dataset.ficha || b.dataset.corte) { var cid = b.dataset.ficha || b.dataset.corte; if (window.Animal) window.Animal.open(cid); return; }
      if (b.dataset.levar) { var lid = b.dataset.levar, on = toggle(lid); if (!on) toast(corte(lid).nome + ' saiu da lista', { label: 'Desfazer', fn: function () { add(lid); } }); bump($('#lista-n')); return; }
      if (b.dataset.timer) {
        var tid = b.dataset.timer, tc = corte(tid);
        if (timers[tid]) { delete timers[tid]; toast('Timer de ' + tc.nome + ' parado'); }
        else { var secs = +b.dataset.min * 60; timers[tid] = { end: Date.now() + secs * 1000, total: secs, virou: false }; toast('Timer de ' + tc.nome + ' rodando: aviso para virar na metade'); }
        renderBrasa(); var tb = $('.timer[data-timer="' + tid + '"]'); if (tb) tb.focus(); return;
      }
      if (b.dataset.cat != null && b.closest('#r-cat')) { rst.cat = b.dataset.cat; $$('#r-cat .chip').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); listReceitas(); return; }
      if (b.dataset.receita) { openReceita(b.dataset.receita); return; }
      if (b.dataset.porc && sheetR) { sheetR.n = Math.max(1, Math.min(200, sheetR.n + +b.dataset.porc)); refreshReceita(); return; }
      if (b.dataset.act === 'rc-lista' && sheetR) {
        var rid = sheetR.id, i = plan.receitas.indexOf(rid);
        if (i >= 0) { plan.receitas.splice(i, 1); toast('Ingredientes saíram da lista'); }
        else { plan.receitas.push(rid); stamp('Na lista'); }
        commit(); var onL = plan.receitas.indexOf(rid) >= 0;
        b.setAttribute('aria-pressed', onL); b.textContent = onL ? '✓ Ingredientes na lista' : '+ Adicionar ingredientes à lista';
        bump($('#lista-n')); if (cur === 'receitas') listReceitas(); return;
      }
      if (b.id === 'share-copy') { var tx = shareText(), ok = function () { toast('Lista copiada'); }; if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(tx).then(ok, function () { fallbackCopy(tx); ok(); }); else { fallbackCopy(tx); ok(); } return; }
      if (b.id === 'share-native') { navigator.share({ title: 'Churrasco', text: shareText() }).catch(function () {}); return; }
    });
    app.addEventListener('change', function (e) {
      var t = e.target;
      if (t.name === 'ap') { plan.apetite = t.value; commit(); }
      else if ((t.id === 'p-hora' || t.id === 'b-hora') && /^\d\d:\d\d$/.test(t.value)) { plan.servir = t.value; commit(); if (t.id === 'b-hora') renderBrasa(); }
      else if (t.dataset.ok) { plan.ok[t.dataset.ok] = t.checked; save(); }
      else if (t.dataset.passo != null && sheetR) { var f = plan.feitos[sheetR.id] = plan.feitos[sheetR.id] || {}; f[t.dataset.passo] = t.checked; save(); }
    });
    app.addEventListener('input', function (e) { if (e.target.id === 't-in') termo(+e.target.value); });
    $('#scrim').addEventListener('click', closeSheet);
    document.addEventListener('keydown', function (e) {
      if (!sheetKind) return;
      if (e.key === 'Escape' && !(window.Animal && document.querySelector('.anm-root.anm-show'))) { e.preventDefault(); closeSheet(); }
      if (e.key === 'Tab') {
        var f = $$('#sheet button, #sheet a[href], #sheet input').filter(function (n) { return n.getClientRects().length; });
        if (!f.length) return; var a = document.activeElement;
        if (e.shiftKey && a === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && a === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    // arrastar o sheet para baixo fecha
    (function () {
      var sh = $('#sheet'), y0 = null, dy = 0;
      sh.addEventListener('touchstart', function (e) { if ($('#sheet-body').scrollTop > 0) return; y0 = e.touches[0].clientY; dy = 0; }, { passive: true });
      sh.addEventListener('touchmove', function (e) { if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); sh.style.transform = 'translateY(' + dy + 'px)'; }, { passive: true });
      sh.addEventListener('touchend', function () { if (y0 == null) return; sh.style.transform = ''; if (dy > 110) closeSheet(); y0 = null; });
    })();

    window.Plan = { has: has, add: function (id) { var r = add(id); if (r) stamp('Na lista'); return r; }, remove: remove, toggle: toggle };
    document.addEventListener('corte:levar', function (e) { var id = e.detail && e.detail.id; if (corte(id) && !has(id)) { add(id); stamp('Na lista'); } });
    window.addEventListener('hashchange', function () { if (!$('#app').hidden) setView(location.hash.slice(1)); });

    var params = new URLSearchParams(location.search);
    if (params.has('reset')) { try { localStorage.removeItem(KEY); } catch (e) {} load(); last = compute(); }
    var skipIntro = params.has('direto');
    if (skipIntro) { $('#splash').hidden = true; plan.onboarded = true; startApp(); return; }
    splash(function () { if (plan.onboarded && !params.has('onb')) startApp(); else onboarding(startApp); });
  }
  function fallbackCopy(t) {
    var ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
