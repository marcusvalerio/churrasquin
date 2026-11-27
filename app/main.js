/* churrasquin — app/main.js (fase 2)
 * Abertura curta → app com 5 abas (Início, Planejar, Cortes, Na brasa, Receitas) + Lista no topo.
 * Início é uma home leve (banner de estado, Em alta, Curiosidades, Receitas da semana, Novos cortes,
 * Seus churrascos). Planejar concentra o fluxo em 4 passos. Fim do churrasco vira lembrança com foto
 * (ver app/memorias.js: as fotos ficam só no aparelho).
 * Lógica herdada: plano adultos/crianças/apetite, divisão por rendimento, mixes, linha do tempo
 * de trás pra frente, timers, ponto pelo termômetro, zonas, lista e WhatsApp.
 * Expõe window.Plan = { has, add, remove, toggle } (usado pela ficha do animal). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var KEY = 'churrasquin.proto.v2';
  var REF = 0.72;
  var RM = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  function reduced() { return !!RM.matches; }
  var ANIMAL_NOME = { boi: 'Boi', porco: 'Porco', cordeiro: 'Cordeiro', frango: 'Frango' };
  var CAT = { nobre: 'Nobre', tradicional: 'Tradicional', steak: 'Steak', popular: 'Popular', miudo: 'Miúdo' };
  var AP_FALLBACK = { pouco: { label: 'Comem pouco', gramas: 300 }, confortavel: { label: 'Confortável', gramas: 400 }, bem: { label: 'Comem bem', gramas: 500 } };
  var MIXES = {
    classico: { label: 'Clássico', desc: 'Picanha, fraldinha, linguiça e frango', w: { picanha: 3, fraldinha: 2, 'linguica-toscana': 2, 'coxa-sobrecoxa': 1.5, 'coracao-frango': 1 } },
    economico: { label: 'Econômico', desc: 'Frango, linguiça, acém e costelinha', w: { 'coxa-sobrecoxa': 3, 'linguica-toscana': 2, acem: 2, 'costelinha-suina': 2, 'coracao-frango': 1 } },
    parrilla: { label: 'Parrilla', desc: 'Vacío, tira de asado, entraña e chorizo', w: { vazio: 3, 'tira-de-asado': 2, entrana: 1.5, chorizo: 1.5, morcilla: 0.5 } },
    gaucho: { label: 'Gaúcho', desc: 'Costela, ponta de peito, salsichão e picanha', w: { costela: 3, 'ponta-de-peito': 2, salsichao: 2, picanha: 2, 'coracao-frango': 1 } }
  };
  var SUGESTOES = ['picanha', 'fraldinha', 'maminha', 'costela', 'linguica-toscana', 'coxa-sobrecoxa', 'ancho', 'cupim', 'coracao-frango', 'vazio', 'pancetta-suina', 'entrana'];
  var EM_ALTA = ['picanha', 'ancho', 'fraldinha', 'vazio', 'costela', 'cupim', 'tomahawk'];
  var NOVOS = ['ponta-de-peito', 'salsichao', 'costela-minga'];
  var VIEWS = ['inicio', 'planejar', 'cortes', 'brasa', 'receitas'];
  var DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var PASSOS = [['turma', 'Turma'], ['cortes', 'Cortes'], ['compra', 'Compra'], ['hora', 'Quando']];
  var ABOUT = {
    splash: 'Abertura: a brasa acende no carvão, as chamas sobem, faíscas voam e o nome aparece no verde da marca. Pouco mais de 2 segundos.',
    inicio: 'Início: banner do próximo churrasco, cortes em alta, curiosidades, receitas da semana e as lembranças com foto.',
    planejar: 'Planejar: quatro passos. Turma, cortes, quanto comprar e quando servir. A conta divide a carne pelo rendimento de cada peça.',
    cortes: 'Cortes: guia com busca por nome de qualquer país. A ficha mostra o mapa do animal e a região da peça.',
    brasa: 'Na brasa: ordem de entrada de trás pra frente, timers com aviso de virar, termômetro e zonas de fogo.',
    receitas: 'Receitas: ingredientes escalados pelo número de pessoas do plano.',
    lista: 'Lista: carne, carvão e ingredientes numa lista só, pronta para mandar no WhatsApp.',
    fim: 'Fim do churrasco: uma foto, uma nota e estrelas. Vira lembrança no Início e o plano recomeça.'
  };

  /* ---------- ícones ---------- */
  var I = { plus: 'adicionar', check: 'check', x: 'remover', clock: 'relogio', fire: 'fogo-forte', people: 'turma', share: 'compartilhar',
    copy: 'copiar', book: 'receitas', bag: 'lista-sacola', arrow: 'avancar', search: 'busca', info: 'info', play: 'play', stop: 'pause', thermo: 'termometro', back: 'voltar' };
  function ic(n, cls) { var id = n.indexOf('x-') === 0 ? n : 'ic-' + (I[n] || n); return '<svg class="i' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function listaBtn(light) { return '<button type="button" class="iconbtn' + (light ? ' iconbtn--glass' : '') + '" data-open="lista" aria-label="Lista de compras, ' + listaCount() + ' itens">' + ic('bag') + '<span class="badge tnum" data-badge aria-hidden="true">' + listaCount() + '</span></button>'; }

  /* ---------- util ---------- */
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function kgN(g) { return (g / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
  function kgTxt(g) { return kgN(g) + ' kg'; }
  function brl(n) { return Math.round(n).toLocaleString('pt-BR'); }
  function curto(n) { return String(n || '').replace(/\s*\([^)]*\)/g, '').trim(); }
  function cortes() { return Array.isArray(window.CORTES) ? window.CORTES : []; }
  var byId = null;
  function corte(id) { if (!byId) { byId = {}; cortes().forEach(function (c) { byId[c.id] = c; }); } return byId[id]; }
  function apetites() { return window.APETITE && typeof window.APETITE === 'object' ? window.APETITE : AP_FALLBACK; }
  function R() { return window.ReceitasUI; }
  function M() { return window.Memorias; }
  function isoDia(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function diaDate(s) { var p = String(s || '').split('-'); return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : new Date(); }
  function proxSabado() { var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7)); return d; }
  function hoje0() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function diaNome(d, cap) {
    var dif = Math.round((new Date(d).setHours(0, 0, 0, 0) - hoje0()) / 864e5);
    var s = dif === 0 ? 'hoje' : dif === 1 ? 'amanhã' : DIAS[d.getDay()].toLowerCase();
    return cap ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }
  function relTempo(ts) {
    var d = Math.round((hoje0() - new Date(ts).setHours(0, 0, 0, 0)) / 864e5);
    if (d <= 0) return 'hoje'; if (d === 1) return 'ontem'; if (d < 7) return 'há ' + d + ' dias';
    if (d < 30) { var w = Math.round(d / 7); return 'há ' + w + (w === 1 ? ' semana' : ' semanas'); }
    if (d < 365) { var m = Math.round(d / 30); return 'há ' + m + (m === 1 ? ' mês' : ' meses'); }
    var y = Math.round(d / 365); return 'há ' + y + (y === 1 ? ' ano' : ' anos');
  }
  function dataCurta(ts) { var d = new Date(ts); return DIAS[d.getDay()] + ', ' + d.getDate() + ' ' + MESES[d.getMonth()].slice(0, 3); }

  /* ---------- estado ---------- */
  function novoPlano() { return { adultos: 10, criancas: 2, apetite: 'confortavel', itens: [], servir: '13:00', dia: isoDia(proxSabado()), ativo: false, receitas: [], ok: {}, feitos: {}, passo: 0 }; }
  var plan = novoPlano();
  function load() {
    plan = novoPlano();
    try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && Array.isArray(s.itens)) plan = Object.assign(plan, s); } catch (e) {}
    plan.itens = plan.itens.filter(function (it) { return corte(it.id); });
    if (!apetites()[plan.apetite]) plan.apetite = Object.keys(apetites())[1] || Object.keys(apetites())[0];
    if (!plan.ativo && diaDate(plan.dia) < hoje0()) plan.dia = isoDia(proxSabado());
    if (!plan.itens.length && !plan.vazio) applyMix('classico', true);
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(plan)); } catch (e) {} }
  function has(id) { return plan.itens.some(function (it) { return it.id === id; }); }
  function add(id) { if (!corte(id) || has(id)) return false; plan.itens.push({ id: id }); plan.vazio = false; commit(); return true; }
  function remove(id) { plan.itens = plan.itens.filter(function (it) { return it.id !== id; }); plan.vazio = !plan.itens.length; commit(); }
  function toggle(id) { if (has(id)) { remove(id); toast(curto(corte(id).nome) + ' saiu do plano'); return false; } add(id); toast(curto(corte(id).nome) + ' entrou no plano'); return true; }
  function applyMix(k, quiet) {
    var w = MIXES[k].w; plan.mix = k; plan.vazio = false;
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
    var pMin = 0, pMax = 0, semPreco = 0;
    linhas.forEach(function (l) { if (l.c.precoKg) { pMin += l.g / 1000 * l.c.precoKg.min; pMax += l.g / 1000 * l.c.precoKg.max; } else semPreco++; });
    var extras = linhas.length ? [
      { id: 'carvao', nome: 'Carvão', qtd: carvao + ' kg', obs: 'cerca de 1 kg por kg de carne' },
      { id: 'sal', nome: 'Sal grosso', qtd: totalG > 8000 ? '2 kg' : '1 kg' },
      { id: 'gelo', nome: 'Gelo', qtd: Math.max(1, Math.ceil(pessoas / 6)) + ' × 5 kg' },
      { id: 'acendedor', nome: 'Acendedor ou álcool gel', qtd: '1 un.' }
    ] : [];
    return { linhas: linhas, totalG: totalG, pessoas: pessoas, porcoes: porcoes, alvo: alvo, extras: extras, carvao: carvao, g: g,
      preco: pMax ? { min: Math.round(pMin / 10) * 10, max: Math.round(pMax / 10) * 10, parcial: semPreco > 0 } : null };
  }
  function pessoasTxt() {
    return plan.adultos + (plan.adultos === 1 ? ' adulto' : ' adultos') + (plan.criancas ? ' e ' + plan.criancas + (plan.criancas === 1 ? ' criança' : ' crianças') : '');
  }

  /* ---------- tempos, zonas, ponto ---------- */
  var ZONAS = {
    forte: { nome: 'Brasa forte', palmos: '1 palmo, ~20 cm', mao: '2–3 s', uso: 'Selar, cortes finos, coração, espetinho', n: 4 },
    media: { nome: 'Brasa média', palmos: '1,5 palmo, ~30 cm', mao: '4–5 s', uso: 'Peças médias, linguiça, frango com osso', n: 3 },
    branda: { nome: 'Fogo brando', palmos: '2–3 palmos, 40–60 cm', mao: '7–8 s', uso: 'Costela, cupim, peças inteiras', n: 2 },
    indireto: { nome: 'Indireto', palmos: 'lado sem brasa', mao: '10 s ou mais', uso: 'Terminar sem queimar, segurar quente', n: 1 }
  };
  var PONTOS = [
    { nome: 'Selado', sub: 'só a casca', min: 45, max: 49 },
    { nome: 'Mal passado', sub: 'centro vermelho', min: 50, max: 54 },
    { nome: 'Ao ponto', sub: 'centro rosado', min: 57, max: 60 },
    { nome: 'Ao ponto para bem', sub: 'rosado leve', min: 63, max: 65 },
    { nome: 'Bem passado', sub: 'sem rosado', min: 70, max: 74 }
  ];
  var SEGUROS = [['Frango', '74 °C na coxa, perto do osso'], ['Porco (lombo, copa)', '63 °C e 3 min de descanso'], ['Linguiça e moída', '71 °C no centro'], ['Costela de boi', '90–95 °C para desmanchar']];
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
    var v = plan.servir || '13:00', o = [], hasV = false;
    for (var m = 0; m < 1440; m += 15) { var h = String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); if (h === v) hasV = true; o.push(h); }
    if (!hasV) { o.push(v); o.sort(); }
    return '<span class="select"><select id="' + id + '" class="tnum" aria-label="Horário de servir">' + o.map(function (h) { return '<option value="' + h + '"' + (h === v ? ' selected' : '') + '>' + h + '</option>'; }).join('') + '</select>' + ic('x-chev', 'select__i') + '</span>';
  }
  function servirDate() { var sv = (plan.servir || '13:00').split(':'), T = plan.ativo ? diaDate(plan.dia) : new Date(); T.setHours(+sv[0] || 13, +sv[1] || 0, 0, 0); return T; }
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
    var ev = [{ t: s.acender, txt: 'Acender ' + r.carvao + ' kg de carvão', k: 'fogo' }].concat(s.seq.map(function (x) { return { t: x.entra, txt: curto(x.l.c.nome) + ' na ' + x.z.nome.toLowerCase(), k: x.z.k, id: x.l.id, min: x.t }; }), [{ t: s.T, txt: 'Servir', k: 'servir' }]);
    for (var i = 0; i < ev.length; i++) if (ev[i].t.getTime() > now) return ev[i];
    return { t: s.T, txt: 'Hora de servir', k: 'servir', passou: true };
  }
  function faltaTxt(d) {
    var m = Math.round((d - Date.now()) / 60000); if (m <= 0) return 'agora';
    if (m < 60) return 'em ' + m + ' min'; var h = Math.floor(m / 60), r = m % 60;
    if (h >= 24) { var dd = Math.round(h / 24); return 'em ' + dd + (dd === 1 ? ' dia' : ' dias'); }
    return 'em ' + h + ' h' + (r ? ' ' + r + ' min' : '');
  }
  function passouServir() { return plan.ativo && Date.now() >= servirDate().getTime(); }

  /* ---------- contador que gira (só transform) ---------- */
  function odo(el, text) {
    if (!el) return; text = String(text);
    if (el.dataset.v === text) return;
    var old = el.dataset.v; el.dataset.v = text;
    el.setAttribute('aria-label', text);
    if (reduced() || old == null || old.length !== text.length) {
      el.innerHTML = text.split('').map(function (ch) {
        return /\d/.test(ch) ? '<span class="odo" aria-hidden="true"><span class="odo__s" style="transform:translateY(-' + (+ch * 10) + '%)">' + digits() + '</span></span>' : '<span class="odo__c" aria-hidden="true">' + esc(ch) + '</span>';
      }).join('');
      return;
    }
    var spans = el.querySelectorAll('.odo__s'), k = 0;
    text.split('').forEach(function (ch) { if (!/\d/.test(ch)) return; var s = spans[k++]; if (s) s.style.transform = 'translateY(-' + (+ch * 10) + '%)'; });
  }
  function digits() { var s = ''; for (var i = 0; i < 10; i++) s += '<span>' + i + '</span>'; return s; }

  /* ---------- toast ---------- */
  var toastT;
  function toast(msg, act) {
    var t = $('#toast'); t.innerHTML = '<b>' + esc(msg) + '</b>' + (act ? '<button type="button" class="toast__a">' + esc(act.label) + '</button>' : '');
    if (act) t.querySelector('button').onclick = function () { act.fn(); t.classList.remove('on'); };
    t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 3000);
  }
  function bump(el) { if (!el) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }

  /* ============ ABERTURA ============ */
  function splash(done) {
    var s = $('#splash'); setAbout('splash');
    var h = location.hash.slice(1);
    if (!window.MOTION || reduced() || (h && h !== 'inicio')) { if (s) s.remove(); done(); return; }
    // Onda de fogo: a onda cobre a tela, revela o logo, e aos 3 s vira o fundo do topo da Início
    $('#app').classList.add('intro'); done();
    MOTION.intro({ app: $('#app'), view: $('#v-inicio'), onEnd: function () { if (s) s.remove(); setAbout(cur || 'inicio'); } });
  }

  /* ============ NAVEGAÇÃO ============ */
  var cur = null;
  function setView(v, push) {
    if (VIEWS.indexOf(v) < 0) v = 'inicio';
    if (v === cur) { var sc = $('#v-' + v); if (push && sc) sc.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); render(v); return; }
    var from = cur ? $('#v-' + cur) : null, to = $('#v-' + v), oldI = VIEWS.indexOf(cur);
    cur = v; render(v);
    $$('.tab').forEach(function (t) { var on = t.dataset.tab === v; t.classList.toggle('on', on); if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
    $('.tabbar').style.setProperty('--x', VIEWS.indexOf(v));
    if (window.MOTION && from) MOTION.ink($('.tabbar__ink'), oldI, VIEWS.indexOf(v));
    var flow = v === 'planejar'; $('#app').classList.toggle('flow', flow); $('.tabbar').classList.toggle('away', flow); $('.tabbar').inert = flow; $('#planbar').hidden = !flow;
    if (from) from.hidden = true;
    to.hidden = false; to.scrollTop = 0;
    to.classList.remove('enter'); void to.offsetWidth; if (from && !reduced()) to.classList.add('enter');
    if (push && location.hash !== '#' + v) history.replaceState(null, '', '#' + v);
    if (v === 'brasa' && window.MOTION && $('#t-in')) MOTION.climb(40, 57, function (x) { var i = $('#t-in'); if (i) i.value = x; termo(x); });
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
  function top(title, kicker) {
    return '<header class="top"><div class="top__t">' + (kicker ? '<p class="eyebrow">' + esc(kicker) + '</p>' : '') + '<h1 class="h2">' + esc(title) + '</h1></div>' + listaBtn() + '</header>';
  }
  function secHead(t, link) { return '<div class="sec__h"><h2 class="h3">' + esc(t) + '</h2>' + (link || '') + '</div>'; }

  /* ============ INÍCIO ============ */
  var thumbN = 0;
  function art(c, cls) {
    var a = window.CUT_ART && window.CUT_ART[c.id];
    if (a) { var sfx = '-t' + (++thumbN); a = a.replace(/id="([^"]+)"/g, 'id="$1' + sfx + '"').replace(/url\(#([^)]+)\)/g, 'url(#$1' + sfx + ')').replace(/href="#([^"]+)"/g, 'href="#$1' + sfx + '"').replace(/role="img" aria-label="[^"]*"/, 'aria-hidden="true"'); }
    return '<span class="photo ' + (cls || '') + '" aria-hidden="true">' + (a || ic('cortes')) + '</span>';
  }
  function banner() {
    var r = last, d = new Date().getDay();
    if (plan.ativo && passouServir()) return '<button type="button" class="banner banner--fim" data-fim="1"><span class="banner__dot" aria-hidden="true">' + ic('x-camera') + '</span><span class="grow"><span class="banner__k">Churrasco servido</span><span class="banner__t">Como foi? Adicione uma foto</span></span>' + ic('x-chev', 'chev') + '</button>';
    if (plan.ativo) {
      var T = servirDate();
      return '<button type="button" class="banner" data-go="planejar"><span class="banner__dot banner__dot--on" aria-hidden="true">' + ic('planejar') + '</span><span class="grow"><span class="banner__k">Seu churrasco · ' + esc(faltaTxt(T)) + '</span>' +
        '<span class="banner__t tnum">' + esc(diaNome(T, true)) + ' ' + plan.servir + ' · ' + r.pessoas + ' pessoas · ' + kgTxt(r.totalG) + '</span></span>' + ic('x-chev', 'chev') + '</button>';
    }
    var t = d >= 1 && d <= 3 ? 'Bora marcar o próximo? Planeje o churrasco' : d === 4 || d === 5 ? 'Tá chegando o fim de semana. Planeje o churrasco' : 'Hoje é dia de churrasco. Planeje o seu';
    return '<button type="button" class="banner" data-go="planejar"><span class="banner__dot" aria-hidden="true">' + ic('planejar') + '</span><span class="grow"><span class="banner__t">' + esc(t) + '</span></span>' + ic('x-chev', 'chev') + '</button>';
  }
  /* Curiosidades: frases tiradas de data/cortes.js (campos nota, mercado, pesoPeca, nomes). Nada de estatística inventada. */
  function curiosidades() {
    var out = [], c;
    if ((c = corte('entrana'))) out.push({ id: c.id, t: 'Entraña é o diafragma do boi: uma peça interna, fina e comprida, rara em mercado comum.' });
    if ((c = corte('ancho'))) out.push({ id: c.id, t: 'Ancho, ojo de bife e ribeye são o mesmo corte: o nome muda conforme o país.' });
    if ((c = corte('picanha'))) out.push({ id: c.id, t: 'Picanha boa não passa de cerca de 1,5 kg. E a capa de gordura fica: ela protege e perfuma a carne.' });
    if ((c = corte('chorizo'))) out.push({ id: c.id, t: 'O chorizo argentino vai cru para a brasa. O espanhol é curado e não serve para churrasco.' });
    if ((c = corte('linguica-toscana'))) out.push({ id: c.id, t: 'Toscana de verdade é só carne suína, sem frango. Vale ler o rótulo.' });
    if ((c = corte('vazio'))) out.push({ id: c.id, t: 'Vacío é a manta inteira que inclui a fraldinha, com membrana e gordura de um lado.' });
    if ((c = corte('morcilla'))) out.push({ id: c.id, t: 'A morcilla já vem cozida: na grelha, é só esquentar.' });
    var wk = Math.floor(Date.now() / (7 * 864e5)); // gira a ordem a cada semana
    return out.slice(wk % out.length).concat(out.slice(0, wk % out.length));
  }
  function receitasSemana() {
    var l = R().list().slice(), wk = Math.floor(Date.now() / (7 * 864e5)), cats = {}, out = [];
    for (var k = 0; k < l.length && out.length < 3; k++) { var r = l[(wk * 5 + k * 7) % l.length]; if (!cats[r.categoria] && out.indexOf(r) < 0) { cats[r.categoria] = 1; out.push(r); } }
    return out;
  }
  function renderInicio() {
    var el = $('#v-inicio'), h = new Date(), hr = h.getHours();
    var oi = hr < 5 ? 'Boa noite' : hr < 12 ? 'Bom dia' : hr < 18 ? 'Boa tarde' : 'Boa noite';
    var cards = EM_ALTA.map(corte).filter(Boolean);
    var novos = NOVOS.map(corte).filter(Boolean);
    el.innerHTML =
      '<header class="hero"><canvas class="hero__fire" aria-hidden="true"></canvas>' +
        '<div class="hero__in"><div class="top top--hero"><span class="wordmark">churrasquin</span>' + listaBtn(true) + '</div>' +
        '<p class="eyebrow eyebrow--ink">' + DIAS[h.getDay()] + ', ' + h.getDate() + ' de ' + MESES[h.getMonth()] + '</p>' +
        '<p class="hero__t">' + oi + ',<br>assador.</p></div></header>' +
      '<div class="pad home cascade">' +
        '<div style="--i:0" class="banner-wrap">' + banner() + '</div>' +
        '<section class="sec" style="--i:1" aria-label="Em alta">' + secHead('Em alta', '<button type="button" class="link" data-go="cortes">Ver cortes</button>') +
          '<ul class="rail">' + cards.map(function (c) {
            return '<li><button type="button" class="ccard" data-ficha="' + esc(c.id) + '">' + art(c, 'ccard__art') + '<span class="ccard__k">' + esc(ANIMAL_NOME[c.animal]) + (CAT[c.categoria] ? ' · ' + CAT[c.categoria] : '') + '</span><b class="ccard__n">' + esc(curto(c.nome)) + '</b><span class="ccard__m tnum">' + (tempoMin(c) ? durTxt(tempoMin(c)) : '') + '</span></button></li>';
          }).join('') + '</ul></section>' +
        '<section class="sec" style="--i:2" aria-label="Curiosidades">' + secHead('Curiosidades') +
          '<ul class="rail rail--facts">' + curiosidades().map(function (f, i) {
            var c = corte(f.id);
            return '<li><article class="fact"><p class="fact__k">' + ic('info') + 'Você sabia</p><p class="fact__t">' + esc(f.t) + '</p><button type="button" class="link link--sm" data-ficha="' + esc(f.id) + '">Ver ' + esc(curto(c.nome).toLowerCase()) + '</button></article></li>';
          }).join('') + '</ul></section>' +
        '<section class="sec" style="--i:3" aria-label="Receitas da semana">' + secHead('Receitas da semana', '<button type="button" class="link" data-go="receitas">Ver todas</button>') +
          '<ul class="list">' + receitasSemana().map(function (r, i) { return R().card(r, i, plan.receitas.indexOf(r.id) >= 0); }).join('') + '</ul></section>' +
        '<section class="sec" style="--i:4" aria-label="Novos cortes">' + secHead('Novos no guia') +
          '<ul class="list">' + novos.map(function (c) {
            return '<li class="row row--btn"><button type="button" class="row__b" data-ficha="' + esc(c.id) + '">' + art(c, 'thumb') + '<span class="grow"><b class="t">' + esc(curto(c.nome)) + '</b><span class="s s--1">' + esc((c.mercado && c.mercado.escolha) || c.porque || '') + '</span></span><span class="chip brand chip--sm">Novo</span></button></li>';
          }).join('') + '</ul></section>' +
        '<section class="sec" style="--i:5" aria-label="Seus churrascos" id="memo-sec">' + secHead('Seus churrascos') + '<div id="memo"></div></section>' +
      '</div>';
    renderMemorias();
    if (window.MOTION) {
      MOTION.hero(el.querySelector('.hero'));
      MOTION.ptr(el, function () { var bw = $('.banner-wrap'); if (bw) bw.innerHTML = banner(); renderMemorias(); toast('Início atualizado'); });
    }
  }
  function renderMemorias() {
    var box = $('#memo'); if (!box) return;
    var l = M() ? M().list() : [];
    if (!l.length) {
      box.innerHTML = '<div class="card memo-empty"><span class="photo memo-empty__ph"><img src="brand/v6/foto/quintal.jpg" alt="" loading="lazy" decoding="async" onerror="this.remove()"></span>' +
        '<div class="memo-empty__b"><p class="h3">Seu primeiro churrasco vai aparecer aqui</p><p class="s">Depois de servir, guarde uma foto da brasa ou da mesa. Fica só neste aparelho.</p>' +
        '<button type="button" class="btn btn-s btn-sm" data-go="planejar">Planejar o primeiro</button></div></div>';
      return;
    }
    box.innerHTML = '<ul class="rail rail--memo">' + l.map(function (m) {
      var st = m.estrelas ? '<span class="stars" aria-label="' + m.estrelas + ' de 5 estrelas">' + [1, 2, 3, 4, 5].map(function (k) { return '<svg class="star' + (k <= m.estrelas ? ' on' : '') + '" viewBox="0 0 24 24" aria-hidden="true"><use href="#x-star"/></svg>'; }).join('') + '</span>' : '';
      return '<li><article class="memo" data-memo="' + esc(m.id) + '"><span class="photo memo__ph is-loading">' + (m.foto ? '' : ic('x-camera')) + '</span>' +
        '<div class="memo__b"><p class="memo__k">' + esc(relTempo(m.data)) + '</p><p class="memo__t">' + esc(dataCurta(m.data)) + '</p>' +
        '<p class="memo__m tnum">' + m.pessoas + ' pessoas · ' + kgTxt(m.g || 0) + '</p>' + (m.nota ? '<p class="memo__n">“' + esc(m.nota) + '”</p>' : '') + st + '</div></article></li>';
    }).join('') + '</ul>';
    l.forEach(function (m, i) {
      var ph = box.querySelector('[data-memo="' + m.id + '"] .memo__ph');
      if (!m.foto) { ph.classList.remove('is-loading'); return; }
      M().foto(m.id).then(function (u) {
        if (!u) { ph.classList.remove('is-loading'); ph.innerHTML = ic('x-camera'); return; }
        var img = new Image(); img.alt = 'Foto do churrasco de ' + dataCurta(m.data); img.decoding = 'async';
        img.onload = function () { ph.classList.remove('is-loading'); ph.appendChild(img); if (window.MOTION) MOTION.lit(img, i); };
        img.onerror = function () { ph.classList.remove('is-loading'); ph.innerHTML = ic('x-camera'); };
        img.src = u;
      });
    });
  }

  /* ============ PLANEJAR ============ */
  function renderPlanejar() {
    var el = $('#v-planejar'), p = plan.passo || 0, r = last;
    var head = top('Planejar', plan.ativo ? 'Churrasco marcado' : 'Passo ' + (p + 1) + ' de 4').replace('<button type="button" class="iconbtn"', '<span class="top__a"><button type="button" class="iconbtn" data-go="inicio" aria-label="Sair do planejamento">' + ic('fechar') + '</button><button type="button" class="iconbtn"').replace(/<\/header>$/, '</span></header>') +
      (plan.ativo ? '<div class="card marcado"><span class="grow"><span class="label">' + esc(diaNome(servirDate(), true)) + ' · ' + plan.servir + '</span><b class="tnum">' + r.pessoas + ' pessoas · ' + kgTxt(r.totalG) + '</b></span><button type="button" class="btn btn-s btn-sm" data-fim="1">Encerrar</button></div>' : '') +
      '<nav class="steps" aria-label="Passos do planejamento">' + PASSOS.map(function (s, i) { return '<button type="button" class="steps__b' + (i === p ? ' on' : '') + (i < p ? ' done' : '') + '" data-passo-go="' + i + '"' + (i === p ? ' aria-current="step"' : '') + '><i aria-hidden="true"></i><span>' + s[1] + '</span></button>'; }).join('') + '</nav>' +
      '<div class="card kv kv--plan" aria-live="polite"><div><span class="label">Pessoas</span><b class="tnum" data-odo="p-pes"></b></div><div><span class="label">Carne</span><b class="tnum"><span data-odo="p-kg"></span> kg</b></div><div><span class="label">Carvão</span><b class="tnum"><span data-odo="p-cv"></span> kg</b></div></div>';
    var body = '';
    if (p === 0) {
      var A = apetites();
      body = '<h2 class="h3 step__t">Quantos vêm?</h2><p class="s step__d">Criança conta meia porção.</p>' +
        '<div class="list">' + stepperRow('adultos', 'Adultos', 'a partir de 13 anos') + stepperRow('criancas', 'Crianças', 'meia porção') + '</div>' +
        '<h2 class="h3 step__t">Como a turma come?</h2>' +
        '<fieldset class="opts" role="radiogroup"><legend class="sr">Apetite</legend>' + Object.keys(A).map(function (k) {
          return '<label class="opt"><input type="radio" class="sr" name="ap" value="' + k + '"' + (plan.apetite === k ? ' checked' : '') + '><span class="opt__b"><b>' + esc(A[k].label) + '</b><span class="s">' + esc(A[k].desc || '') + '</span></span><span class="opt__v tnum">' + A[k].gramas + ' g</span></label>';
        }).join('') + '</fieldset>';
    } else if (p === 1) {
      body = '<h2 class="h3 step__t">Estilo do churrasco</h2><p class="s step__d">Um ponto de partida. Dá para tirar e pôr cortes.</p>' +
        '<div class="chips chips--scroll" role="radiogroup" aria-label="Estilo">' + Object.keys(MIXES).map(function (k) { return '<button type="button" class="chip' + (plan.mix === k ? ' on' : '') + '" role="radio" aria-checked="' + (plan.mix === k) + '" data-mix="' + k + '">' + MIXES[k].label + '</button>'; }).join('') + '</div>' +
        (plan.mix && MIXES[plan.mix] ? '<p class="s mix-d">' + esc(MIXES[plan.mix].desc) + '</p>' : '') +
        '<h2 class="h3 step__t">No plano <span class="label tnum">' + r.linhas.length + '</span></h2><ul class="list" id="picks"></ul>' +
        '<h2 class="h3 step__t">Adicionar</h2><div class="chips" id="sug"></div><button type="button" class="link" data-go="cortes">Ver todos os cortes</button>';
    } else if (p === 2) {
      body = '<h2 class="h3 step__t">Quanto comprar</h2>' +
        '<div class="card total"><span class="label">Carne crua</span><b class="display tnum">' + kgN(r.totalG) + '<small> kg</small></b><span class="s">' + r.g + ' g por porção · ' + r.porcoes.toLocaleString('pt-BR') + ' porções</span>' +
        (r.preco ? '<span class="preco tnum">Estimativa: R$ ' + brl(r.preco.min) + '–' + brl(r.preco.max) + (r.preco.parcial ? ' (sem alguns itens)' : '') + '. Preços médios, variam por região.</span>' : '') + '</div>' +
        '<ul class="list">' + r.linhas.map(function (l) { return '<li class="row">' + art(l.c, 'thumb') + '<span class="grow"><b class="t">' + esc(curto(l.c.nome)) + '</b><span class="s">' + esc(ANIMAL_NOME[l.c.animal]) + (l.manual ? ' · ajustado' : '') + '</span></span><span class="val tnum">' + kgTxt(l.g) + '</span></li>'; }).join('') + '</ul>' +
        '<h2 class="h3 step__t">Para a brasa</h2><ul class="list">' + r.extras.map(function (x) { return '<li class="row"><span class="grow"><b class="t">' + esc(x.nome) + '</b>' + (x.obs ? '<span class="s">' + esc(x.obs) + '</span>' : '') + '</span><span class="val tnum">' + esc(x.qtd) + '</span></li>'; }).join('') + '</ul>' +
        '<button type="button" class="btn btn-s btn--full" data-open="lista">' + ic('bag') + 'Abrir lista de compras</button>';
    } else {
      var dias = [], b = hoje0();
      for (var i = 0; i < 8; i++) { var d = new Date(b); d.setDate(b.getDate() + i); dias.push(d); }
      var s = sequence(r), sel = plan.dia;
      body = '<h2 class="h3 step__t">Que dia?</h2><div class="chips chips--scroll days" role="radiogroup" aria-label="Dia">' + dias.map(function (d) {
          var k = isoDia(d), on = k === sel;
          return '<button type="button" class="day' + (on ? ' on' : '') + '" role="radio" aria-checked="' + on + '" data-dia="' + k + '"><span>' + (i = Math.round((d - b) / 864e5), i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : DIAS[d.getDay()].slice(0, 3)) + '</span><b class="tnum">' + d.getDate() + '</b></button>';
        }).join('') + '</div>' +
        '<h2 class="h3 step__t">Que horas sai?</h2><label class="field"><span class="label">Servir às</span>' + horaSel('p-hora') + '</label>' +
        (s.acender ? '<div class="list"><div class="row"><span class="ico ico--heat">' + ic('fire') + '</span><span class="grow"><b class="t">Acender às <span class="tnum">' + hhmm(s.acender) + '</span></b><span class="s">' + r.carvao + ' kg de carvão, 30–40 min até a brasa ficar branca</span></span></div>' +
          '<div class="row"><span class="ico">' + ic('clock') + '</span><span class="grow"><b class="t">' + esc(curto(s.seq[0].l.c.nome)) + ' entra às <span class="tnum">' + hhmm(s.seq[0].entra) + '</span></b><span class="s">o corte mais demorado vai primeiro</span></span></div></div>' : '');
    }
    var nav = '<div class="step__nav">' + (p > 0 ? '<button type="button" class="btn btn-s btn--sq" data-passo-go="' + (p - 1) + '" aria-label="Passo anterior">' + ic('back') + '</button>' : '') +
      (p < 3 ? '<button type="button" class="btn btn-p grow" data-passo-go="' + (p + 1) + '"' + (p === 1 && !r.linhas.length ? ' disabled' : '') + '>Continuar</button>'
        : '<button type="button" class="btn btn-p grow" data-marcar="1"' + (!r.linhas.length ? ' disabled' : '') + '>' + (plan.ativo ? 'Salvar alterações' : 'Marcar churrasco') + '</button>') + '</div>';
    el.innerHTML = '<div class="pad">' + head + '<div class="step cascade" data-step="' + p + '">' + body + '</div></div>';
    $('#planbar').innerHTML = nav;
    if (p === 1) fillPicks();
    syncCounts();
  }
  function stepperRow(k, label, sub) {
    return '<div class="row count" data-k="' + k + '"><span class="grow"><b class="t">' + label + '</b><span class="s">' + sub + '</span></span><span class="stepper"><button type="button" data-d="-1" aria-label="Menos ' + label.toLowerCase() + '">−</button>' +
      '<output class="tnum" data-odo="' + k + '" aria-live="polite"></output><button type="button" data-d="1" aria-label="Mais ' + label.toLowerCase() + '">+</button></span></div>';
  }
  function fillPicks() {
    var picks = $('#picks'); if (!picks) return; var r = last;
    picks.innerHTML = r.linhas.length ? r.linhas.map(function (l) {
      return '<li class="row pick" data-id="' + esc(l.id) + '">' + art(l.c, 'thumb') +
        '<span class="pick__n"><b class="t">' + esc(curto(l.c.nome)) + '</b><span class="s s--1">' + esc(ANIMAL_NOME[l.c.animal] || '') + (tempoMin(l.c) ? ' · ' + durTxt(tempoMin(l.c)) : '') + (l.manual ? ' · ajustado' : '') + '</span></span>' +
        '<span class="qty"><span class="sr">Quantidade em quilos</span><button type="button" data-act="dec" aria-label="Menos 250 g de ' + esc(curto(l.c.nome)) + '">−</button><output class="tnum">' + kgTxt(l.g) + '</output><button type="button" data-act="inc" aria-label="Mais 250 g de ' + esc(curto(l.c.nome)) + '">+</button></span>' +
        '<button type="button" class="iconbtn iconbtn--flat" data-act="rm" aria-label="Tirar ' + esc(curto(l.c.nome)) + '">' + ic('x') + '</button></li>';
    }).join('') : '<li class="empty-row"><p class="s">Nenhum corte ainda. Escolha um estilo ou adicione abaixo.</p></li>';
    var sug = $('#sug'); if (sug) sug.innerHTML = SUGESTOES.filter(function (id) { return corte(id) && !has(id); }).slice(0, 8).map(function (id) {
      return '<button type="button" class="chip" data-add="' + id + '">' + ic('plus') + esc(curto(corte(id).nome)) + '</button>';
    }).join('');
  }
  function syncCounts() {
    var r = last;
    $$('[data-odo="adultos"]').forEach(function (e) { odo(e, plan.adultos); });
    $$('[data-odo="criancas"]').forEach(function (e) { odo(e, plan.criancas); });
    $$('.count').forEach(function (c) { var m = c.querySelector('[data-d="-1"]'); if (m) m.disabled = plan[c.dataset.k] <= (c.dataset.k === 'adultos' ? 1 : 0); });
    odo($('[data-odo="p-pes"]'), r.pessoas); odo($('[data-odo="p-kg"]'), kgN(r.totalG)); odo($('[data-odo="p-cv"]'), r.carvao);
    $$('[data-badge]').forEach(function (b) { b.textContent = listaCount(); });
  }
  function stepTap(b) {
    var k = b.closest('[data-k]').dataset.k;
    plan[k] = Math.max(k === 'adultos' ? 1 : 0, Math.min(200, plan[k] + +b.dataset.d)); commit();
    if (window.MOTION) { MOTION.pop($('[data-odo="' + k + '"]')); MOTION.pop($('[data-odo="p-pes"]')); }
  }

  /* ============ CORTES ============ */
  var cst = { q: '', animal: '' };
  function renderCortes() {
    var el = $('#v-cortes');
    if (!el.dataset.built) {
      el.dataset.built = '1';
      el.innerHTML = '<div class="pad">' + top('Cortes', 'Guia de carnes') +
        '<label class="search">' + ic('search') + '<span class="sr">Buscar corte</span><input type="search" id="c-q" placeholder="Picanha, vacío, ribeye…" autocomplete="off" enterkeyhint="search"></label>' +
        '<div class="chips chips--scroll" id="c-an" role="group" aria-label="Animal">' + [['', 'Todos'], ['boi', 'Boi'], ['porco', 'Porco'], ['cordeiro', 'Cordeiro'], ['frango', 'Frango']].map(function (a) { return '<button type="button" class="chip' + (a[0] === cst.animal ? ' on' : '') + '" data-an="' + a[0] + '" aria-pressed="' + (a[0] === cst.animal) + '">' + a[1] + '</button>'; }).join('') + '</div>' +
        '<p class="label count-line tnum" id="c-n" aria-live="polite"></p><ul class="grid2" id="c-grid"></ul></div>';
      var qT; $('#c-q').addEventListener('input', function (e) { clearTimeout(qT); qT = setTimeout(function () { cst.q = e.target.value; gridCortes(); }, 120); });
    }
    $$('[data-badge]', el).forEach(function (b) { b.textContent = listaCount(); });
    gridCortes();
  }
  function gridCortes() {
    var q = norm(cst.q);
    var list = cortes().filter(function (c) {
      if (cst.animal && c.animal !== cst.animal) return false;
      if (!q) return true;
      return [c.nome, c.id].concat(Object.keys(c.nomes || {}).map(function (k) { return c.nomes[k]; }), (c.mercado && c.mercado.rotulos) || []).some(function (n) { return norm(n).indexOf(q) >= 0; });
    });
    $('#c-n').textContent = list.length + (list.length === 1 ? ' corte' : ' cortes');
    $('#c-grid').innerHTML = list.length ? list.map(function (c, i) {
      var tb = tambem(c);
      return '<li style="--i:' + Math.min(i, 8) + '"><button type="button" class="ccard ccard--grid" data-ficha="' + esc(c.id) + '" aria-label="' + esc(curto(c.nome)) + ': ficha do corte">' + art(c, 'ccard__art') +
        '<span class="ccard__k">' + esc(ANIMAL_NOME[c.animal] || '') + (CAT[c.categoria] ? ' · ' + CAT[c.categoria] : '') + '</span><b class="ccard__n">' + esc(curto(c.nome)) + '</b>' +
        '<span class="ccard__t">' + (tb ? 'também ' + esc(tb) : '&nbsp;') + '</span>' +
        '<span class="ccard__m tnum">' + (tempoMin(c) ? durTxt(tempoMin(c)) : '') + (has(c.id) ? '<span class="dot-on" aria-label="no plano"></span>' : '') + '</span></button></li>';
    }).join('') : '<li class="empty"><span class="empty__ic">' + ic('search') + '</span><p class="h3">Nenhum corte com esse nome</p><p class="s">Tente o nome de outro país: vacío, ojo de bife, ribeye.</p></li>';
  }
  function tambem(c) {
    var seen = {}, out = [], base = norm(curto(c.nome));
    seen[base] = 1;
    ((c.mercado && c.mercado.rotulos) || []).concat(['ar', 'uy', 'us'].map(function (k) { return (c.nomes || {})[k]; })).forEach(function (n) {
      if (!n || out.length >= 2) return;
      n = String(n).replace(/\s*\([^)]*\)/g, '').trim();
      var k = norm(n);
      if (seen[k] || k.indexOf(base) >= 0) return;
      seen[k] = 1; out.push(n);
    });
    return out.join(', ');
  }

  /* ============ NA BRASA ============ */
  var timers = {}; // id -> { end, total, virou, pausa }
  function timerAtivo() {
    var ids = Object.keys(timers); if (!ids.length) return null;
    ids.sort(function (a, b) { return left(a) - left(b); }); return ids[0];
  }
  function left(id) { var t = timers[id]; return t.pausa != null ? t.pausa : Math.max(0, Math.round((t.end - Date.now()) / 1000)); }
  function mmss(s) { var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = String(s % 60).padStart(2, '0'); return h ? h + ':' + String(m).padStart(2, '0') + ':' + x : String(m).padStart(2, '0') + ':' + x; }
  function renderBrasa() {
    var el = $('#v-brasa'), r = last, s = sequence(r), seq = s.seq, T = s.T, acender = s.acender;
    var live = Object.keys(timers).length > 0;
    var html = '<div class="pad"><header class="top"><div class="top__t"><p class="eyebrow tnum">Na brasa · ' + seq.length + (seq.length === 1 ? ' peça' : ' peças') + '</p><h1 class="h2">Linha do tempo</h1></div>' +
      '<div class="top__a">' + (live ? '<span class="chip heat chip--live"><i aria-hidden="true"></i>Ao vivo</span>' : '') + listaBtn() + '</div></header>';
    if (!seq.length) {
      html += '<div class="card empty"><span class="empty__ic">' + ic('grelha') + '</span><p class="h3">Nada na grelha ainda</p><p class="s">Escolha os cortes no Planejar. Aqui sai a ordem de entrada, com timers.</p><button type="button" class="btn btn-p btn-sm" data-go="planejar">Planejar</button></div>';
    } else {
      var a = timerAtivo();
      html += '<div class="cascade">';
      if (a) {
        var tm = timers[a], c = corte(a), lf = left(a), half = lf > tm.total / 2 && !tm.virou, x = seq.filter(function (q) { return q.l.id === a; })[0];
        var C = 540.4, off = C * (1 - lf / tm.total);
        html += '<section class="card hot" style="--i:0" aria-label="Timer ativo"><div class="ring"><svg width="192" height="192" viewBox="0 0 192 192" aria-hidden="true"><circle cx="96" cy="96" r="86" class="ring__bg"/><circle cx="96" cy="96" r="86" class="ring__fg" id="ring-fg" style="stroke-dasharray:' + C + ';stroke-dashoffset:' + off.toFixed(1) + '"/></svg>' +
          '<div class="ring__in"><p class="eyebrow" id="ring-k">' + (half ? 'Virar em' : 'Tirar em') + '</p><p class="display tnum' + (tm.total >= 3600 ? ' display--long' : '') + '" id="ring-v" role="timer" aria-live="off">' + mmss(half ? Math.max(0, lf - Math.round(tm.total / 2)) : lf) + '</p><p class="label">' + esc(curto(c.nome)) + (tm.virou ? ' · lado 2' : ' · lado 1') + '</p></div></div>' +
          '<div class="cells"><div class="cell"><span class="label">Zona</span><b>' + esc(x ? x.z.nome : '') + '</b></div><div class="cell"><span class="label">Tempo total</span><b class="tnum">' + durTxt(Math.round(tm.total / 60)) + '</b></div></div>' +
          '<div class="hot__act"><button type="button" class="btn btn-s btn--sq" data-pausa="' + esc(a) + '" aria-label="' + (tm.pausa != null ? 'Retomar' : 'Pausar') + ' timer">' + ic(tm.pausa != null ? 'play' : 'stop') + '</button>' +
          '<button type="button" class="btn btn-p grow" data-virei="' + esc(a) + '"' + (tm.virou ? ' data-tirar="1"' : '') + '>' + (tm.virou ? 'Tirei da grelha' : 'Virei') + '</button></div></section>';
      } else {
        var p = proximo(r);
        html += '<section class="card next" style="--i:0"><p class="eyebrow">' + (p.passou ? 'Churrasco' : 'Próximo passo · ' + esc(faltaTxt(p.t))) + '</p><p class="display tnum">' + hhmm(p.t) + '</p><p class="h3">' + esc(p.txt) + '</p>' +
          (p.passou ? '<button type="button" class="btn btn-p btn--full" data-fim="1">' + ic('x-camera') + 'Encerrar e guardar foto</button>' :
            p.id ? '<button type="button" class="btn btn-p btn--full" data-timer="' + esc(p.id) + '" data-min="' + p.min + '">' + ic('play') + 'Iniciar timer · ' + durTxt(p.min) + '</button>' :
            '<button type="button" class="btn btn-s btn--full" data-timer="' + esc(seq[0].l.id) + '" data-min="' + seq[0].t + '">' + ic('play') + 'Iniciar ' + esc(curto(seq[0].l.c.nome).toLowerCase()) + '</button>') + '</section>';
      }
      var span = T - acender, pos = function (d) { return Math.max(0, Math.min(100, (d - acender) / span * 100)); };
      html += '<label class="field field--row" style="--i:1"><span class="label">' + ic('clock') + 'Servir às</span>' + horaSel('b-hora') + '</label>' +
        '<section class="card crono" style="--i:2" aria-label="Linha do tempo"><div class="crono__axis label tnum"><span>' + hhmm(acender) + '</span><span>' + hhmm(T) + '</span></div>' +
        '<div class="crono__row"><span class="crono__n">Acender</span><span class="crono__track"><span class="crono__bar crono__bar--fogo" style="--l:0;--w:' + (pos(seq[0].entra) / 100) + '"></span></span></div>' +
        seq.map(function (x) { return '<div class="crono__row"><span class="crono__n">' + esc(curto(x.l.c.nome)) + '</span><span class="crono__track"><span class="crono__bar crono__bar--' + x.z.k + (timers[x.l.id] ? ' is-hot' : '') + '" style="--l:' + (pos(x.entra) / 100) + ';--w:' + (Math.max(2, pos(x.sai) - pos(x.entra)) / 100) + '"></span></span></div>'; }).join('') +
        (Date.now() > acender && Date.now() < T ? '<span class="crono__now" style="--p:' + (pos(new Date()) / 100) + '" aria-hidden="true"></span>' : '') + '</section>' +
        '<h2 class="h3 sec__t" style="--i:3">Ordem da grelha</h2><ol class="list ordem" style="--i:3">' +
        '<li class="row"><time class="ordem__h tnum">' + hhmm(acender) + '</time><span class="grow"><b class="t">Acender o carvão</b><span class="s">' + r.carvao + ' kg. Pronta quando cobrir de cinza branca.</span></span></li>' +
        seq.map(function (x) {
          var on = !!timers[x.l.id];
          return '<li class="row' + (on ? ' is-on' : '') + '" data-id="' + esc(x.l.id) + '"><time class="ordem__h tnum">' + hhmm(x.entra) + '</time><span class="grow"><b class="t">' + esc(curto(x.l.c.nome)) + '</b>' +
            '<span class="s tnum">' + esc(x.z.nome) + ' · ' + kgTxt(x.l.g) + ' · ' + durTxt(x.t) + (x.d ? ' · descansa ' + x.d + ' min' : '') + '</span></span>' +
            '<button type="button" class="tbtn' + (on ? ' on' : '') + '" data-timer="' + esc(x.l.id) + '" data-min="' + x.t + '" aria-label="' + (on ? 'Parar timer de ' : 'Iniciar timer de ') + esc(curto(x.l.c.nome)) + '" style="--p:' + (on ? (left(x.l.id) / timers[x.l.id].total).toFixed(3) : 1) + '">' +
            '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" class="tbtn__bg"/><circle cx="24" cy="24" r="21" class="tbtn__fg" pathLength="100"/></svg>' + ic(on ? 'stop' : 'play') + '</button></li>';
        }).join('') +
        '<li class="row"><time class="ordem__h tnum">' + hhmm(T) + '</time><span class="grow"><b class="t">Servir</b><span class="s">Fatie contra a fibra, com a faca bem afiada.</span></span></li></ol></div>';
    }
    html += '<h2 class="h3 sec__t">Ponto pelo termômetro</h2>' +
      '<section class="card termo"><div class="termo__top"><p class="display tnum"><span id="t-v">57</span><small> °C</small></p><div><p class="h3 termo__st"><span class="termo__dot" id="t-dot" aria-hidden="true"></span><span id="t-p">Ao ponto</span></p><p class="s" id="t-s">centro rosado</p></div></div>' +
      '<label class="range"><span class="termo__bar" aria-hidden="true"><i id="t-fill"></i></span><span class="sr">Temperatura no centro da peça</span><input type="range" id="t-in" min="40" max="80" value="57" step="1"></label>' +
      '<ul class="termo__list">' + PONTOS.map(function (p) { return '<li><b>' + p.nome + '</b><span class="tnum">' + p.min + '–' + p.max + ' °C</span></li>'; }).join('') + '</ul>' +
      '<p class="s nota">Tire 2–3 °C antes do alvo: a carne continua subindo no descanso.</p></section>' +
      '<ul class="list seguro">' + SEGUROS.map(function (x) { return '<li class="row"><span class="grow"><b class="t">' + x[0] + '</b><span class="s tnum">' + x[1] + '</span></span></li>'; }).join('') + '</ul>' +
      '<h2 class="h3 sec__t">Zonas de fogo</h2>' +
      '<ul class="list zonas">' + Object.keys(ZONAS).map(function (k) { var z = ZONAS[k]; return '<li class="row row--top"><span class="heat-m" aria-label="intensidade ' + z.n + ' de 4">' + [1, 2, 3, 4].map(function (j) { return '<i class="' + (j <= z.n ? 'on' : '') + '"></i>'; }).join('') + '</span><span class="grow"><b class="t">' + z.nome + '</b><span class="s tnum">' + z.palmos + ' · a mão aguenta ' + z.mao + '</span><span class="s s--3">' + z.uso + '</span></span></li>'; }).join('') + '</ul>' +
      '<p class="s nota">Monte a brasa em degrau: um lado alto e forte, outro baixo, e uma área sem brasa para o indireto.</p>' +
      (plan.ativo || seq.length ? '<button type="button" class="btn btn-s btn--full fim-btn" data-fim="1">' + ic('x-camera') + 'Encerrar churrasco</button>' : '') + '</div>';
    el.innerHTML = html;
    termo(57);
    if (window.MOTION) MOTION.ring($('.ring', el));
    tickTimers();
  }
  function termo(v) {
    var p = PONTOS.reduce(function (a, b) { return v >= b.min - 2 ? b : a; }, PONTOS[0]);
    var f = $('#t-fill'); if (!f) return;
    f.style.transform = 'scaleX(' + ((v - 40) / 40).toFixed(3) + ')';
    $('#t-v').textContent = v; $('#t-p').textContent = v < 45 ? 'Ainda cru' : p.nome; $('#t-s').textContent = v < 45 ? 'continue na brasa' : p.sub;
    $$('.termo__list li').forEach(function (li, i) { li.classList.toggle('on', PONTOS[i] === p && v >= 45); });
    // o ponto muda de cor a cada estágio e pulsa quando cruza a fronteira
    var k = v < 45 ? -1 : PONTOS.indexOf(p), dot = $('#t-dot');
    if (dot) { dot.style.background = TCOR[k + 1] || TCOR[TCOR.length - 1]; if (dot.dataset.k !== String(k)) { dot.dataset.k = k; if (window.MOTION) MOTION.pulse(dot); } }
  }
  var TCOR = ['#8A8A85', '#C2304A', '#E0567A', '#D9775B', '#9A6345', '#5C3A26', '#3E2718'];
  var tickT;
  function tickTimers() {
    var any = false;
    Object.keys(timers).forEach(function (id) {
      var tm = timers[id], lf = left(id), c = corte(id);
      any = true;
      if (!tm.virou && !tm.avisou && lf <= tm.total / 2) { tm.avisou = true; alerta('Hora de virar: ' + curto(c.nome)); if (cur === 'brasa') renderBrasa(); }
      if (lf <= 0) { delete timers[id]; alerta('Tirar da grelha: ' + curto(c.nome)); if (cur === 'brasa') renderBrasa(); return; }
      var b = document.querySelector('.tbtn[data-timer="' + id + '"]'); if (b) b.style.setProperty('--p', (lf / tm.total).toFixed(4));
    });
    var a = timerAtivo(), v = $('#ring-v');
    if (a && v) {
      var tm = timers[a], lf = left(a), half = lf > tm.total / 2 && !tm.virou;
      v.textContent = mmss(half ? Math.max(0, lf - Math.round(tm.total / 2)) : lf);
      var fg = $('#ring-fg'); if (fg) fg.style.strokeDashoffset = (540.4 * (1 - lf / tm.total)).toFixed(1);
    }
    clearTimeout(tickT); if (any) tickT = setTimeout(tickTimers, 1000);
  }
  function alerta(msg) { toast(msg); try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) {} }

  /* ============ RECEITAS ============ */
  var rst = { cat: '' };
  function renderReceitas() {
    var el = $('#v-receitas');
    if (!el.dataset.built) {
      el.dataset.built = '1';
      el.innerHTML = '<div class="pad">' + top('Receitas', 'O que vai junto') +
        '<p class="s lede">Quantidades para <b class="tnum" id="r-n"></b>, do seu plano.</p>' +
        '<div class="chips chips--scroll" id="r-cat" role="group" aria-label="Categoria">' + R().CATS.map(function (c) { return '<button type="button" class="chip' + (c[0] === rst.cat ? ' on' : '') + '" data-cat="' + c[0] + '" aria-pressed="' + (c[0] === rst.cat) + '">' + c[1] + '</button>'; }).join('') + '</div>' +
        '<ul class="list cascade" id="r-list"></ul></div>';
    }
    $$('[data-badge]', el).forEach(function (b) { b.textContent = listaCount(); });
    $('#r-n').textContent = last.pessoas + ' pessoas';
    listReceitas();
  }
  function listReceitas() {
    var l = R().list().filter(function (r) { return !rst.cat || r.categoria === rst.cat; });
    $('#r-list').innerHTML = l.length ? l.map(function (r, i) { return R().card(r, Math.min(i, 8), plan.receitas.indexOf(r.id) >= 0); }).join('') :
      '<li class="empty-row"><p class="s">Nada nessa categoria.</p></li>';
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
    return R().ficha(r, sheetR.n, { corteNome: function (id) { var c = corte(id); return c ? curto(c.nome) : null; }, naLista: plan.receitas.indexOf(r.id) >= 0, feitos: plan.feitos[r.id] || {} });
  }
  function refreshReceita() {
    var r = R().get(sheetR.id), body = $('#sheet-body');
    var ings = R().escalar(r, sheetR.n);
    $$('.ings li', body).forEach(function (li, i) { var g = ings[i]; if (!g) return; var q = li.querySelector('.ings__q'); q.textContent = g.txt || R().fmtQ(g.q, g.un); bump(q); });
    odo($('[data-odo="porcoes"]', body), sheetR.n);
    var m = $('[data-porc="-1"]', body); if (m) m.disabled = sheetR.n <= 1;
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
  function listaCount() { return last ? last.linhas.length + last.extras.length + receitaIngs().length : 0; }
  function shareText() {
    var r = last, L = [];
    L.push('Churrasco para ' + pessoasTxt() + ' · ' + (plan.ativo ? diaNome(servirDate()) + ', ' : '') + 'servir às ' + plan.servir);
    L.push(''); L.push('*Carne (' + kgTxt(r.totalG) + ')*');
    r.linhas.forEach(function (l) { L.push('• ' + curto(l.c.nome) + ' — ' + kgTxt(l.g)); });
    if (r.extras.length) { L.push(''); L.push('*Brasa*'); r.extras.forEach(function (x) { L.push('• ' + x.nome + ' — ' + x.qtd); }); }
    var ri = receitaIngs();
    if (ri.length) { L.push(''); L.push('*Receitas (' + plan.receitas.map(function (id) { var x = R().get(id); return x ? x.nome : ''; }).filter(Boolean).join(', ') + ')*'); ri.forEach(function (x) { L.push('• ' + x.item + ' — ' + x.qtd); }); }
    L.push(''); L.push('Feito no churrasquin');
    return L.join('\n');
  }
  function listaHTML() {
    var r = last, ri = receitaIngs(), feitos = 0, tot = 0;
    var row = function (id, nome, q, sub) { var ok = !!plan.ok[id]; tot++; if (ok) feitos++; return '<li><label class="row"><input type="checkbox" class="sr" data-ok="' + esc(id) + '"' + (ok ? ' checked' : '') + '><span class="check" aria-hidden="true"></span><span class="grow"><b class="t">' + esc(nome) + '</b>' + (sub ? '<span class="s">' + esc(sub) + '</span>' : '') + '</span><span class="val tnum">' + esc(q) + '</span></label></li>'; };
    if (!r.linhas.length && !ri.length) return '<div class="empty"><span class="empty__ic">' + ic('bag') + '</span><h2 class="h3" id="sheet-t">Sua lista está vazia</h2><p class="s">Monte o plano e escolha receitas: a lista sai pronta.</p><button type="button" class="btn btn-p btn-sm" data-go="planejar">Planejar</button></div>';
    var carne = r.linhas.map(function (l) { return row('c:' + l.id, curto(l.c.nome), kgTxt(l.g), ANIMAL_NOME[l.c.animal]); }).join('');
    var brasa = r.extras.map(function (x) { return row('x:' + x.id, x.nome, x.qtd, x.obs); }).join('');
    var rec = ri.map(function (x) { return row(x.id, x.item, x.qtd, x.de.join(', ')); }).join('');
    return '<article class="ficha"><p class="eyebrow">Lista de compras</p><h2 class="h1" id="sheet-t">Para ' + esc(pessoasTxt()) + '</h2>' +
      '<div class="prog"><span class="label">Comprado</span><span class="label tnum">' + feitos + ' de ' + tot + '</span></div><div class="bar"><i style="transform:scaleX(' + (tot ? feitos / tot : 0).toFixed(3) + ')"></i></div>' +
      '<div class="share"><a class="btn btn-p grow" id="share-zap" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(shareText()) + '">' + ic('share') + 'Mandar no WhatsApp</a>' +
      '<button type="button" class="btn btn-s btn--sq" id="share-copy" aria-label="Copiar lista">' + ic('copy') + '</button>' + (navigator.share ? '<button type="button" class="btn btn-s btn--sq" id="share-native" aria-label="Compartilhar">' + ic('share') + '</button>' : '') + '</div>' +
      (r.linhas.length ? '<div class="sec__h sec__h--sheet"><h3 class="eyebrow">Carne</h3><span class="label tnum">' + kgTxt(r.totalG) + '</span></div><ul class="list">' + carne + '</ul>' +
        (r.preco ? '<p class="preco tnum">Estimativa: R$ ' + brl(r.preco.min) + '–' + brl(r.preco.max) + '. Preços médios de mercado.</p>' : '') : '') +
      (brasa ? '<div class="sec__h sec__h--sheet"><h3 class="eyebrow">Brasa</h3></div><ul class="list">' + brasa + '</ul>' : '') +
      (rec ? '<div class="sec__h sec__h--sheet"><h3 class="eyebrow">Receitas</h3></div><ul class="list">' + rec + '</ul>' : '<button type="button" class="link" data-go="receitas">Escolher farofa, molho, maionese</button>') +
      '</article>';
  }
  function openLista() { openSheet(listaHTML(), 'lista'); setAbout('lista'); }

  /* ============ FIM DO CHURRASCO ============ */
  var fim = null;
  function fimHTML() {
    var r = last, T = plan.ativo ? servirDate() : new Date();
    return '<article class="ficha fim"><p class="eyebrow">Fim do churrasco</p><h2 class="h1" id="sheet-t">Como foi?</h2>' +
      '<p class="s tnum">' + esc(dataCurta(T)) + ' · ' + r.pessoas + ' pessoas · ' + kgTxt(r.totalG) + '</p>' +
      '<label class="drop' + (fim.url ? ' has' : '') + '" id="fim-drop"><input type="file" class="sr" id="fim-file" accept="image/*" capture="environment">' +
        (fim.url ? '<img src="' + fim.url + '" alt="Prévia da foto escolhida"><span class="drop__chg">' + ic('x-camera') + 'Trocar foto</span>' :
          '<span class="drop__ic">' + ic('x-camera') + '</span><b class="t">Adicione uma foto</b><span class="s">da brasa, da mesa ou da turma</span>') + '</label>' +
      (fim.err ? '<p class="hint hint--e" role="alert">' + esc(fim.err) + '</p>' : '<p class="hint">A foto fica só neste aparelho. Nada é enviado.</p>') +
      '<fieldset class="rate"><legend class="label">Nota do churrasco</legend><div class="rate__s">' + [1, 2, 3, 4, 5].map(function (k) {
        return '<label class="rate__b"><input type="radio" class="sr" name="fim-st" value="' + k + '"' + (fim.estrelas === k ? ' checked' : '') + '><svg class="star' + (k <= fim.estrelas ? ' on' : '') + '" viewBox="0 0 24 24" aria-hidden="true"><use href="#x-star"/></svg><span class="sr">' + k + (k === 1 ? ' estrela' : ' estrelas') + '</span></label>';
      }).join('') + '</div></fieldset>' +
      '<label class="field"><span class="label">Uma linha sobre o dia <span class="s--3">(opcional)</span></span><input type="text" id="fim-nota" maxlength="80" placeholder="A costela desmanchou" value="' + esc(fim.nota || '') + '" autocomplete="off"></label>' +
      '<button type="button" class="btn btn-p btn--full" id="fim-ok"' + (fim.busy ? ' disabled' : '') + '>' + (fim.busy ? 'Guardando…' : fim.file ? 'Guardar lembrança' : 'Guardar sem foto') + '</button>' +
      '<p class="s s--3 fim__d">O plano recomeça do zero depois de guardar. A turma e os cortes ficam como ponto de partida.</p></article>';
  }
  function openFim() {
    if (fim && fim.url) URL.revokeObjectURL(fim.url);
    fim = { file: null, url: null, estrelas: 0, nota: '', busy: false, err: '' };
    openSheet(fimHTML(), 'fim'); setAbout('fim');
  }
  function redrawFim() { var n = $('#fim-nota'); if (n) fim.nota = n.value; $('#sheet-body').innerHTML = fimHTML(); }
  function salvarFim() {
    if (!fim || fim.busy) return;
    var n = $('#fim-nota'); if (n) fim.nota = n.value.trim();
    fim.busy = true; redrawFim();
    var r = last, T = plan.ativo ? servirDate() : new Date();
    var meta = { data: T.getTime(), pessoas: r.pessoas, g: r.totalG, cortes: r.linhas.map(function (l) { return l.id; }), nota: fim.nota || '', estrelas: fim.estrelas || 0 };
    var go = function (res) {
      Object.keys(timers).forEach(function (k) { delete timers[k]; });
      plan.ativo = false; plan.ok = {}; plan.feitos = {}; plan.receitas = []; plan.passo = 0; plan.dia = isoDia(proxSabado());
      if (fim.url) URL.revokeObjectURL(fim.url);
      var semFoto = fim.file && res && !res.fotoOk;
      fim = null; closeSheet(); commit(); setView('inicio', true); renderInicio();
      toast(semFoto ? 'Lembrança guardada, mas sem foto: o aparelho não deixou salvar' : 'Lembrança guardada');
      var first = $('#memo .memo'); if (first && window.MOTION) MOTION.polaroid(first); else if (first && !reduced()) first.classList.add('memo--new');
    };
    if (!M()) return go(null);
    M().add(meta, fim.file).then(go, function () { fim.busy = false; fim.err = 'Não deu para guardar agora. Tente de novo.'; redrawFim(); });
  }

  /* ============ SHEET ============ */
  var sheetKind = null, sheetRet = null;
  function openSheet(html, kind) {
    var sh = $('#sheet'), sc = $('#scrim');
    if (!sheetKind) sheetRet = document.activeElement;
    sheetKind = kind; $('#sheet-body').innerHTML = html; $('#sheet-body').scrollTop = 0;
    sh.hidden = false; sc.hidden = false; sh.dataset.kind = kind;
    void sh.offsetWidth; sh.classList.add('on'); sc.classList.add('on');
    setTimeout(function () { $('#sheet-x').focus({ preventScroll: true }); }, 30);
  }
  function closeSheet() {
    if (!sheetKind) return; sheetKind = null; sheetR = null;
    var sh = $('#sheet'), sc = $('#scrim');
    sh.classList.remove('on'); sc.classList.remove('on');
    setTimeout(function () { if (!sheetKind) { sh.hidden = true; sc.hidden = true; } }, reduced() ? 0 : 260);
    if (sheetRet && sheetRet.focus && document.contains(sheetRet)) sheetRet.focus({ preventScroll: true });
    setAbout(cur);
  }

  /* ============ COMMIT ============ */
  var last = null;
  function commit() {
    save(); last = compute();
    syncCounts();
    if (cur === 'planejar') { if (plan.passo === 1 && $('#picks')) { fillPicks(); var h = $('#v-planejar .step__t .label'); if (h) h.textContent = last.linhas.length; var nx = $('#planbar [data-passo-go="2"].btn'); if (nx) nx.disabled = !last.linhas.length; } else if (plan.passo !== 0) renderPlanejar(); }
    if (cur === 'inicio' && !$('#app').hidden) renderInicio();
    if (sheetKind === 'lista') { var y = $('#sheet-body').scrollTop; $('#sheet-body').innerHTML = listaHTML(); $('#sheet-body').scrollTop = y; }
  }

  /* ============ INIT ============ */
  function startApp() {
    $('#app').hidden = false;
    setView(location.hash.slice(1) || 'inicio');
  }
  function init() {
    var params = new URLSearchParams(location.search);
    if (params.has('reset')) { try { localStorage.removeItem(KEY); localStorage.removeItem('churrasquin.proto.v1'); } catch (e) {} if (M()) M().reset(); }
    load(); last = compute();
    var steps = $('#about-steps');
    if (steps) steps.innerHTML = [['splash', 'Abertura'], ['inicio', 'Início'], ['planejar', 'Planejar'], ['cortes', 'Cortes'], ['brasa', 'Na brasa'], ['receitas', 'Receitas'], ['lista', 'Lista'], ['fim', 'Fim do churrasco']].map(function (s) { return '<li data-k="' + s[0] + '">' + s[1] + '</li>'; }).join('');

    var app = $('#app');
    app.addEventListener('click', function (e) {
      var t = e.target.closest('.tab[data-tab]'); if (t) { e.preventDefault(); if (sheetKind) closeSheet(); setView(t.dataset.tab, true); return; }
      var g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); if (sheetKind) closeSheet(); setView(g.dataset.go, true); return; }
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.open === 'lista') { openLista(); return; }
      if (b.id === 'sheet-x') { closeSheet(); return; }
      if (b.dataset.fim) { openFim(); return; }
      if (b.id === 'fim-ok') { if (window.MOTION && fim && !fim.busy) MOTION.burst(b); salvarFim(); return; }
      if (b.dataset.d) { stepTap(b); return; }
      if (b.dataset.passoGo != null) { plan.passo = +b.dataset.passoGo; save(); renderPlanejar(); $('#v-planejar').scrollTop = 0; var st = $('#v-planejar .step'); if (st && !reduced()) { st.classList.remove('enter'); void st.offsetWidth; st.classList.add('enter'); } return; }
      if (b.dataset.marcar) {
        var era = plan.ativo; plan.ativo = true; plan.passo = 0; commit();
        toast(era ? 'Plano atualizado' : 'Churrasco marcado: ' + diaNome(servirDate()) + ', ' + plan.servir);
        setView('inicio', true); return;
      }
      if (b.dataset.dia) { plan.dia = b.dataset.dia; save(); renderPlanejar(); var nd = $('[data-dia="' + plan.dia + '"]'); if (nd) nd.focus({ preventScroll: true }); return; }
      if (b.dataset.mix) { var prev = plan.itens.slice(), pm = plan.mix; applyMix(b.dataset.mix); renderPlanejar(); toast('Estilo ' + MIXES[b.dataset.mix].label, { label: 'Desfazer', fn: function () { plan.itens = prev; plan.mix = pm; commit(); renderPlanejar(); } }); return; }
      if (b.dataset.add) { if (window.MOTION) MOTION.fly(b); add(b.dataset.add); return; }
      if (b.dataset.act && b.closest('.pick')) {
        var id = b.closest('.pick').dataset.id, it = plan.itens.filter(function (x) { return x.id === id; })[0], cl = last.linhas.filter(function (l) { return l.id === id; })[0];
        if (b.dataset.act === 'inc') it.g = cl.g + 250; else if (b.dataset.act === 'dec') it.g = Math.max(250, cl.g - 250);
        else if (b.dataset.act === 'rm') { var c = corte(id); remove(id); toast(curto(c.nome) + ' saiu do plano', { label: 'Desfazer', fn: function () { add(id); } }); return; }
        commit(); var again = $('.pick[data-id="' + id + '"] [data-act="' + b.dataset.act + '"]'); if (again) again.focus(); return;
      }
      if (b.dataset.an != null) { cst.animal = b.dataset.an; $$('#c-an .chip').forEach(function (x) { x.setAttribute('aria-pressed', x === b); x.classList.toggle('on', x === b); }); gridCortes(); return; }
      if (b.dataset.ficha || b.dataset.corte) { var cid = b.dataset.ficha || b.dataset.corte; if (window.Animal) window.Animal.open(cid); return; }
      if (b.dataset.timer) {
        var tid = b.dataset.timer, tc = corte(tid);
        if (timers[tid]) { delete timers[tid]; toast('Timer de ' + curto(tc.nome) + ' parado'); }
        else { var secs = +b.dataset.min * 60; timers[tid] = { end: Date.now() + secs * 1000, total: secs, virou: false }; toast(curto(tc.nome) + ' na grelha. Aviso para virar na metade.'); }
        if (cur !== 'brasa') setView('brasa', true); else renderBrasa(); return;
      }
      if (b.dataset.virei) {
        var vid = b.dataset.virei, tv = timers[vid]; if (!tv) return;
        if (b.dataset.tirar) { delete timers[vid]; toast(curto(corte(vid).nome) + ' fora da grelha'); }
        else { tv.virou = true; toast('Lado 2: ' + curto(corte(vid).nome)); }
        renderBrasa(); return;
      }
      if (b.dataset.pausa) {
        var pt = timers[b.dataset.pausa]; if (!pt) return;
        if (pt.pausa != null) { pt.end = Date.now() + pt.pausa * 1000; pt.pausa = null; } else pt.pausa = left(b.dataset.pausa);
        renderBrasa(); return;
      }
      if (b.dataset.cat != null && b.closest('#r-cat')) { rst.cat = b.dataset.cat; $$('#r-cat .chip').forEach(function (x) { x.setAttribute('aria-pressed', x === b); x.classList.toggle('on', x === b); }); listReceitas(); return; }
      if (b.dataset.receita) { openReceita(b.dataset.receita); return; }
      if (b.dataset.porc && sheetR) { sheetR.n = Math.max(1, Math.min(200, sheetR.n + +b.dataset.porc)); refreshReceita(); if (window.MOTION) MOTION.pop($('#sheet [data-odo="porcoes"]')); return; }
      if (b.dataset.act === 'rc-lista' && sheetR) {
        var rid = sheetR.id, i = plan.receitas.indexOf(rid);
        if (i >= 0) { plan.receitas.splice(i, 1); toast('Ingredientes saíram da lista'); }
        else { plan.receitas.push(rid); toast('Ingredientes na lista'); }
        commit(); var onL = plan.receitas.indexOf(rid) >= 0;
        b.setAttribute('aria-pressed', onL); b.textContent = onL ? 'Ingredientes na lista' : 'Adicionar ingredientes à lista';
        b.classList.toggle('btn-b', onL); b.classList.toggle('btn-p', !onL);
        if (cur === 'receitas') listReceitas(); return;
      }
      if (b.id === 'share-copy') { var tx = shareText(), ok = function () { toast('Lista copiada'); }; if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(tx).then(ok, function () { fallbackCopy(tx); ok(); }); else { fallbackCopy(tx); ok(); } return; }
      if (b.id === 'share-native') { navigator.share({ title: 'Churrasco', text: shareText() }).catch(function () {}); return; }
    });
    app.addEventListener('change', function (e) {
      var t = e.target;
      if (t.name === 'ap') { plan.apetite = t.value; commit(); }
      else if ((t.id === 'p-hora' || t.id === 'b-hora') && /^\d\d:\d\d$/.test(t.value)) { plan.servir = t.value; commit(); if (t.id === 'b-hora') renderBrasa(); else renderPlanejarDia(); }
      else if (t.dataset.ok) { plan.ok[t.dataset.ok] = t.checked; save(); var y = $('#sheet-body').scrollTop; $('#sheet-body').innerHTML = listaHTML(); $('#sheet-body').scrollTop = y; var nb = $('[data-ok="' + t.dataset.ok + '"]'); if (nb) nb.focus({ preventScroll: true }); }
      else if (t.dataset.passo != null && sheetR) { var f = plan.feitos[sheetR.id] = plan.feitos[sheetR.id] || {}; f[t.dataset.passo] = t.checked; save(); }
      else if (t.id === 'fim-file' && fim) {
        var file = t.files && t.files[0]; if (!file) return;
        if (!/^image\//.test(file.type)) { fim.err = 'Esse arquivo não é uma imagem.'; redrawFim(); return; }
        if (fim.url) URL.revokeObjectURL(fim.url);
        fim.file = file; fim.url = URL.createObjectURL(file); fim.err = ''; redrawFim();
      }
      else if (t.name === 'fim-st' && fim) { fim.estrelas = +t.value; $$('.rate .star').forEach(function (s, k) { s.classList.toggle('on', k < fim.estrelas); }); }
    });
    app.addEventListener('input', function (e) { if (e.target.id === 't-in') termo(+e.target.value); });
    $('#scrim').addEventListener('click', closeSheet);
    document.addEventListener('keydown', function (e) {
      if (!sheetKind) return;
      if (e.key === 'Escape' && !document.querySelector('.anm-root.anm-show')) { e.preventDefault(); closeSheet(); }
      if (e.key === 'Tab') {
        var f = $$('#sheet button, #sheet a[href], #sheet input, #sheet select').filter(function (n) { return n.getClientRects().length || n.type === 'radio' || n.type === 'checkbox'; });
        if (!f.length) return; var a = document.activeElement;
        if (e.shiftKey && a === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && a === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    // arrastar o sheet para baixo fecha (com velocidade); solto antes, volta com mola
    if (window.MOTION) MOTION.drag($('#sheet'), function () { return $('#sheet-body'); }, closeSheet);
    window.Plan = { has: has, add: function (id) { return add(id); }, remove: remove, toggle: function (id) { var had = has(id); var r = toggle(id); if (!had && has(id) && window.MOTION) MOTION.fly(document.querySelector('.anm-levar') || document.activeElement); return r; } };
    document.addEventListener('corte:levar', function (e) { var id = e.detail && e.detail.id; if (corte(id) && !has(id)) add(id); });
    window.addEventListener('hashchange', function () { if (!$('#app').hidden) setView(location.hash.slice(1)); });
    // passou a hora de servir com o app aberto: o Início troca o banner sozinho
    setInterval(function () { if (cur === 'inicio' && !sheetKind && plan.ativo) { var bw = $('.banner-wrap'); if (bw) bw.innerHTML = banner(); } }, 60000);

    if (params.has('direto')) { $('#splash').hidden = true; startApp(); return; }
    splash(startApp);
  }
  /* o passo 4 redesenha só o dia/horário (sem perder o foco do select) */
  function renderPlanejarDia() { var a = document.activeElement && document.activeElement.id; renderPlanejar(); if (a) { var n = document.getElementById(a); if (n) n.focus({ preventScroll: true }); } }
  function fallbackCopy(t) {
    var ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
