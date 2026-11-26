/* churrasquin — app: Planejar (pessoas → cortes → compra), Cortes (catálogo) e Minha lista.
 * Integra com window.Calc quando existir (add/summary/shareText); funciona sem ele.
 * Expõe window.Plan = { has(id), add(id), remove(id), toggle(id) } (usado pela ficha do "i"). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var ICO = 'brand/v3/icons/';
  var KEY = 'churrasquin.plan.v1';
  var REF = 0.72;
  var PAISES = [['', 'Todos os países'], ['BR', 'Brasil'], ['AR', 'Argentina'], ['UY', 'Uruguai'], ['US', 'EUA']];
  var PAIS_NOME = { BR: 'Brasil', AR: 'Argentina', UY: 'Uruguai', US: 'EUA' };
  var ANIMAIS = [['', 'Todos'], ['boi', 'Boi'], ['porco', 'Porco'], ['cordeiro', 'Cordeiro'], ['frango', 'Frango']];
  var ANIMAL_NOME = { boi: 'Boi', porco: 'Porco', cordeiro: 'Cordeiro', frango: 'Frango' };
  var CAT = { nobre: 'Nobre', tradicional: 'Tradicional', steak: 'Steak', popular: 'Popular', miudo: 'Miúdo' };
  var LBL = { ar: 'AR', uy: 'UY', us: 'US' };
  var SUGESTOES = ['picanha', 'fraldinha', 'maminha', 'costela', 'linguica-toscana', 'coxa-sobrecoxa', 'ancho', 'cupim', 'coracao-frango', 'vazio'];
  var PRESET = ['picanha', 'fraldinha', 'linguica-toscana', 'coxa-sobrecoxa'];
  var AP_FALLBACK = { pouco: { label: 'Comem pouco', gramas: 300 }, confortavel: { label: 'Normal', gramas: 400 }, bem: { label: 'Comem bem', gramas: 500 } };

  /* ---------- util ---------- */
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim(); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ico(name, cls, size) { size = size || 20; return '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="' + ICO + name + '.svg" alt="" width="' + size + '" height="' + size + '">'; }
  function kgTxt(g) { return (g / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' kg'; }
  function brl(v, cents) { return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 }); }
  function cortes() { return Array.isArray(window.CORTES) ? window.CORTES : []; }
  var byId = {};
  function corte(id) { if (!byId[id]) cortes().forEach(function (c) { byId[c.id] = c; }); return byId[id]; }
  function preco(c) {
    if (!c || !c.precoKg) return null;
    if (typeof c.precoKg === 'number') return c.precoKg > 0 ? c.precoKg : null;
    var a = +c.precoKg.min, b = +c.precoKg.max;
    return a > 0 && b > 0 ? Math.round((a + b) / 2) : (a || b || null);
  }
  function hasPrices() { return cortes().some(preco); }
  function apetites() { return window.APETITE && typeof window.APETITE === 'object' ? window.APETITE : AP_FALLBACK; }
  function calcOK(fn) { return window.Calc && typeof window.Calc[fn] === 'function'; }

  /* ---------- estado do plano ---------- */
  var plan = { adultos: 10, criancas: 0, apetite: 'confortavel', itens: [], extrasOk: {} };
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (s && Array.isArray(s.itens)) plan = Object.assign(plan, s);
    } catch (e) { /* sem storage: segue em memória */ }
    plan.itens = plan.itens.filter(function (it) { return corte(it.id); });
    if (!apetites()[plan.apetite]) plan.apetite = Object.keys(apetites())[1] || Object.keys(apetites())[0];
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(plan)); } catch (e) {} }
  function has(id) { return plan.itens.some(function (it) { return it.id === id; }); }
  function add(id) {
    if (!corte(id) || has(id)) return false;
    plan.itens.push({ id: id });
    if (false && calcOK('add')) { try { window.Calc.add(id); } catch (e) {} }
    commit(); return true;
  }
  function remove(id) { plan.itens = plan.itens.filter(function (it) { return it.id !== id; }); commit(); }
  function toggle(id) { if (has(id)) { remove(id); return false; } add(id); return true; }

  /* Divide a carne da turma entre os cortes: cada corte recebe a mesma porção "servida";
   * corte com mais perda (osso, capa) ganha mais peso cru. Ajustes manuais são respeitados. */
  function compute() {
    var A = apetites(), g = (A[plan.apetite] || A.confortavel || { gramas: 400 }).gramas;
    var porcoes = plan.adultos + plan.criancas * 0.5;
    var alvo = porcoes * g; // equivalente cru em corte de rendimento médio
    var manualEq = 0, auto = [], wSum = 0;
    plan.itens.forEach(function (it) {
      var c = corte(it.id), r = (c && c.rendimento) || REF;
      if (it.g > 0) manualEq += it.g * r / REF; else { auto.push(it); wSum += it.w > 0 ? it.w : 1; }
    });
    var resto = Math.max(0, alvo - manualEq);
    var linhas = plan.itens.map(function (it) {
      var c = corte(it.id), r = (c && c.rendimento) || REF, grams;
      if (it.g > 0) grams = it.g;
      else grams = auto.length ? Math.max(200, Math.round((resto * (it.w > 0 ? it.w : 1) / wSum) * REF / r / 100) * 100) : 0;
      var p = preco(c);
      return { id: it.id, c: c, g: grams, manual: it.g > 0, preco: p, valor: p ? p * grams / 1000 : null };
    });
    var totalG = linhas.reduce(function (s, l) { return s + l.g; }, 0);
    var comPreco = linhas.filter(function (l) { return l.valor != null; });
    var valor = comPreco.reduce(function (s, l) { return s + l.valor; }, 0);
    var pessoas = plan.adultos + plan.criancas;
    var extras = [];
    if (linhas.length) {
      extras = [
        { id: 'carvao', nome: 'Carvão', qtd: Math.max(3, Math.ceil(totalG / 1000)) + ' kg', obs: '~1 kg por kg de carne' },
        { id: 'sal', nome: 'Sal grosso', qtd: totalG > 8000 ? '2 kg' : '1 kg' },
        { id: 'pao', nome: 'Pão de alho', qtd: Math.max(1, Math.ceil(pessoas)) + ' un.' },
        { id: 'farofa', nome: 'Farofa pronta', qtd: Math.max(1, Math.ceil(pessoas / 8)) + ' pct de 500 g' },
        { id: 'vinagrete', nome: 'Vinagrete', qtd: Math.max(1, Math.ceil(pessoas / 5)) + ' tomates + 1 cebola a cada 5' },
        { id: 'gelo', nome: 'Gelo', qtd: Math.max(1, Math.ceil(pessoas / 6)) + ' saco(s) de 5 kg' }
      ];
    }
    return { linhas: linhas, totalG: totalG, valor: valor, temPreco: comPreco.length > 0, precoParcial: comPreco.length > 0 && comPreco.length < linhas.length,
      pessoas: pessoas, porcoes: porcoes, alvo: alvo, extras: extras, porPessoa: porcoes ? valor / porcoes : 0 };
  }

  function shareText(r) {
    var L = [];
    L.push('🔥 Churrasco para ' + plan.adultos + (plan.adultos === 1 ? ' adulto' : ' adultos') + (plan.criancas ? ' + ' + plan.criancas + (plan.criancas === 1 ? ' criança' : ' crianças') : ''));
    L.push('');
    L.push('*Carne (' + kgTxt(r.totalG) + ')*');
    r.linhas.forEach(function (l) { L.push('• ' + l.c.nome + ' — ' + kgTxt(l.g) + (l.valor != null ? ' (~' + brl(l.valor) + ')' : '')); });
    if (r.extras.length) { L.push(''); L.push('*Acompanhamentos*'); r.extras.forEach(function (x) { L.push('• ' + x.nome + ' — ' + x.qtd); }); }
    if (r.temPreco) { L.push(''); L.push('Estimativa da carne: ~' + brl(r.valor) + (r.precoParcial ? ' (sem alguns cortes)' : '')); }
    L.push(''); L.push('Feito no churrasquin');
    return L.join('\n');
  }

  /* ---------- planejar ---------- */
  var thumbN = 0;
  function thumb(c) {
    var art = window.CUT_ART && window.CUT_ART[c.id];
    if (art) { var sfx = '-t' + (++thumbN); art = art.replace(/id="([^"]+)"/g, 'id="$1' + sfx + '"').replace(/url\(#([^)]+)\)/g, 'url(#$1' + sfx + ')').replace(/href="#([^"]+)"/g, 'href="#$1' + sfx + '"'); }
    return '<span class="thumb" aria-hidden="true">' + (art || ico(c.animal, 'thumb__ph', 28)) + '</span>';
  }
  function renderPlan(r) {
    $('#in-ad').value = plan.adultos; $('#in-cr').value = plan.criancas;
    $$('.stepper').forEach(function (s) { var k = s.dataset.k; s.querySelector('[data-d="-1"]').disabled = plan[k] <= 0; });
    $$('#apetite input').forEach(function (i) { i.checked = i.value === plan.apetite; });

    var picks = $('#picks');
    picks.innerHTML = r.linhas.map(function (l) {
      return '<li class="pick" data-id="' + esc(l.id) + '">' + thumb(l.c) +
        '<span class="pick__n"><b>' + esc(l.c.nome) + '</b><small>' + esc(ANIMAL_NOME[l.c.animal] || '') + (tempoMin(l.c) ? ' · ' + durTxt(tempoMin(l.c)) + ' na brasa' : '') + (l.manual ? ' · ajustado' : '') + '</small></span>' +
        '<span class="pick__lead" aria-hidden="true"></span><span class="pick__kg">' + kgTxt(l.g) + '</span>' +
        '<button type="button" class="icon-btn" data-act="rm" aria-label="Tirar ' + esc(l.c.nome) + ' do plano"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></li>';
    }).join('');
    picks.hidden = !r.linhas.length;
    $('#picks-empty').hidden = !!r.linhas.length;

    $('#sug').innerHTML = SUGESTOES.filter(function (id) { return corte(id) && !has(id); }).slice(0, 6).map(function (id) {
      var c = corte(id);
      return '<button type="button" class="chip chip--add" data-id="' + id + '"><span class="chip__plus" aria-hidden="true">+</span>' + esc(c.nome) + '</button>';
    }).join('');

    var live = $('#result-live');
    var carvao = r.linhas.length ? Math.max(3, Math.ceil(r.totalG / 1000)) : 0;
    var gp = r.porcoes ? Math.round((r.linhas.length ? r.totalG : r.alvo) / r.porcoes / 10) * 10 : 0;
    var big = '<p class="conta"><span class="conta__v">' + (r.porcoes ? kgTxt(r.linhas.length ? r.totalG : Math.round(r.alvo / 100) * 100).replace(' kg', '') : '0') + '</span><span class="conta__u">kg de carne crua</span></p>';
    var stats = r.porcoes ? '<dl class="conta__stats"><div><dt>Por pessoa</dt><dd>' + gp + ' g</dd></div><div><dt>Porções</dt><dd>' + String(r.porcoes).replace('.', ',') + '</dd></div><div><dt>Carvão</dt><dd>' + (carvao ? carvao + ' kg' : '—') + '</dd></div></dl>' : '';
    if (!r.porcoes) live.innerHTML = big + '<p class="result__sub">Comece pelo passo 01: quantos vêm?</p>';
    else if (!r.linhas.length) live.innerHTML = big + stats + '<p class="result__sub">para ' + pessoasTxt() + '. Agora escolha os cortes.</p>';
    else live.innerHTML = big + stats +
      '<p class="result__sub">para ' + pessoasTxt() + ', em ' + r.linhas.length + (r.linhas.length > 1 ? ' cortes' : ' corte') + '</p>' +
      '<ul class="result__lines">' + r.linhas.map(function (l) { return '<li><span>' + esc(l.c.nome) + '</span><i aria-hidden="true"></i><b>' + kgTxt(l.g) + '</b></li>'; }).join('') + '</ul>' +
      (r.temPreco ? '<p class="result__money">Estimativa de gasto: ~' + brl(r.valor) + (r.precoParcial ? ' (parcial)' : '') + '</p>' : '');
    $('#result .btn').hidden = !r.linhas.length;
  }
  function pessoasTxt() {
    return plan.adultos + (plan.adultos === 1 ? ' adulto' : ' adultos') + (plan.criancas ? ' e ' + plan.criancas + (plan.criancas === 1 ? ' criança' : ' crianças') : '');
  }

  /* ---------- catálogo ---------- */
  var state = { q: '', pais: '', animal: '', sort: '', eco: false };
  var ecoMax = Infinity, ecoSet = null;
  function isEco(c) { return ecoSet ? ecoSet.indexOf(c.id) >= 0 : !!(preco(c) && preco(c) <= ecoMax); }
  function meter(k, label, n) {
    var o = ''; for (var i = 1; i <= 5; i++) o += '<i' + (i <= n ? ' class="on"' : '') + '></i>';
    return '<div class="meter meter--' + k + '"><dt>' + label + '</dt><dd><span class="dots" aria-hidden="true">' + o + '</span><span class="meter__n" aria-label="' + n + ' de 5">' + n + '</span></dd></div>';
  }
  function cards(list) {
    return list.map(function (c) {
      var alt = Object.keys(c.nomes || {}).filter(function (k) { return c.nomes[k]; })
        .map(function (k) { return '<b>' + LBL[k] + '</b> ' + esc(c.nomes[k]); }).join(' · ');
      var art = (window.CUT_ART && window.CUT_ART[c.id]) || '<div class="card__ph">' + ico(c.animal, '', 40) + '<span>ilustração em breve</span></div>';
      var p = preco(c), on = has(c.id);
      return '<li class="card' + (on ? ' is-on' : '') + '" data-id="' + esc(c.id) + '">' +
        '<div class="card__art" aria-hidden="true">' + art + '</div>' +
        '<ul class="card__flags" aria-label="Servido em">' + (c.paises || []).map(function (x) { return '<li><img src="' + ICO + 'pais-' + x.toLowerCase() + '.svg" alt="' + PAIS_NOME[x] + '" title="' + PAIS_NOME[x] + '" width="18" height="18"></li>'; }).join('') + '</ul>' +
        '<button type="button" class="card__info" data-act="info" aria-label="Saiba de onde vem: ' + esc(c.nome) + '">' + ico('info', '', 24) + '</button>' +
        '<div class="card__body">' +
        '<p class="card__tag">' + esc(ANIMAL_NOME[c.animal] || '') + (CAT[c.categoria] ? ' · ' + CAT[c.categoria] : '') + '</p>' +
        '<h3>' + esc(c.nome) + '</h3>' +
        (alt ? '<p class="card__alt">' + alt + '</p>' : '') +
        '<p class="card__fire">' + (tempoMin(c) ? '<span>' + ico('brasa', '', 16) + durTxt(tempoMin(c)) + '</span>' : '') + '<span>' + esc(zona(c).nome) + '</span></p>' +
        '<dl class="meters">' + meter('maciez', 'Maciez', c.maciez) + meter('gordura', 'Gordura', c.gordura) + meter('sabor', 'Sabor', c.sabor) + '</dl>' +
        
        '<span class="card__stamp" aria-hidden="true">Anotado</span>' +
        '<div class="card__foot">' +
        '<button type="button" class="add' + (on ? ' is-on' : '') + '" data-act="add" aria-pressed="' + on + '" aria-label="' + (on ? 'Tirar ' : 'Levar ') + esc(c.nome) + (on ? ' da lista' : '') + '">' +
        (on ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg><span>Na lista</span>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><span>Levar</span>') +
        '</button></div></div></li>';
    }).join('');
  }
  function matchScore(c, q) {
    var names = [c.nome, c.id.replace(/-/g, ' ')].concat(Object.keys(c.nomes || {}).map(function (k) { return c.nomes[k]; })).map(norm);
    var best = 9;
    names.forEach(function (n, i) {
      var base = n.replace(/\s*\(.*\)\s*/g, ' ').trim();
      var s = 9;
      if (n === q) s = 0; else if (base === q) s = 0.75;
      else if (n.indexOf(q) === 0) s = 1;
      else if ((' ' + n).indexOf(' ' + q) >= 0) s = 2;
      else if (n.indexOf(q) >= 0) s = 3;
      if (s < 9 && i === 0) s -= 0.5; // nome em português pesa um pouco mais
      if (s < best) best = s;
    });
    return best;
  }
  function filtered() {
    var q = norm(state.q);
    var list = cortes().filter(function (c) {
      if (state.pais && (c.paises || []).indexOf(state.pais) < 0) return false;
      if (state.animal && c.animal !== state.animal) return false;
      if (state.eco && !isEco(c)) return false;
      return true;
    }).map(function (c, i) { return { c: c, i: i, s: q ? matchScore(c, q) : 0 }; })
      .filter(function (x) { return x.s < 9; });
    var cmp = {
      'preco-asc': function (a, b) { return (preco(a.c) || 1e9) - (preco(b.c) || 1e9); },
      'preco-desc': function (a, b) { return (preco(b.c) || -1) - (preco(a.c) || -1); },
      'maciez-desc': function (a, b) { return b.c.maciez - a.c.maciez; },
      'sabor-desc': function (a, b) { return b.c.sabor - a.c.sabor; },
      'nome': function (a, b) { return a.c.nome.localeCompare(b.c.nome, 'pt'); }
    }[state.sort];
    list.sort(function (a, b) { return (q ? a.s - b.s : 0) || (cmp ? cmp(a, b) : 0) || a.i - b.i; });
    return list.map(function (x) { return x.c; });
  }
  function renderGrid() {
    var grid = $('#grid'), list = filtered(), total = cortes().length;
    if (!total) { grid.innerHTML = ''; $('#empty').hidden = false; $('#empty .empty__t').textContent = 'Não conseguimos carregar os cortes'; $('#empty .empty__d').textContent = 'Recarregue a página. Se continuar, tente mais tarde.'; return; }
    var groups = {}, order = [];
    list.forEach(function (c) { if (!groups[c.animal]) { groups[c.animal] = []; order.push(c.animal); } groups[c.animal].push(c); });
    grid.innerHTML = order.map(function (a) {
      return '<li class="vitrine" data-animal="' + a + '"><h2 class="prancha"><span class="prancha__n">Prancha ' + ['I', 'II', 'III', 'IV', 'V'][Math.max(0, ['boi', 'porco', 'cordeiro', 'frango'].indexOf(a))] + '</span><span class="prancha__ico">' + ico(a, '', 32) + '</span><span class="prancha__t lettering">' + esc(ANIMAL_NOME[a] || a) + '</span><span class="prancha__c">' + groups[a].length + (groups[a].length > 1 ? ' cortes' : ' corte') + '</span></h2>' +
        '<ul class="grid-row guia" aria-label="' + esc(ANIMAL_NOME[a] || a) + '">' + cards(groups[a]) + '</ul></li>';
    }).join('');
    $('#empty').hidden = list.length > 0; grid.hidden = !list.length;
    $('#count').textContent = list.length === total ? total + ' cortes' : list.length + ' de ' + total;
  }
  function syncCardButtons() {
    $$('#grid .card').forEach(function (li) {
      var b = li.querySelector('.add'), on = has(li.dataset.id), c = corte(li.dataset.id);
      if (b.classList.contains('is-on') === on) return;
      b.classList.toggle('is-on', on); li.classList.toggle('is-on', on);
      if (on) { li.classList.remove('stamp-in'); void li.offsetWidth; li.classList.add('stamp-in'); } b.setAttribute('aria-pressed', on);
      b.setAttribute('aria-label', (on ? 'Tirar ' : 'Levar ') + c.nome + (on ? ' da lista' : ''));
      b.innerHTML = on ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg><span>Na lista</span>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><span>Levar</span>';
    });
  }

  /* ---------- ofício: tempos, zonas de fogo e ponto ----------
   * Dados de apoio do assador (não são do catálogo; ficam aqui para não mexer em data/).
   * ZONAS: altura da grelha em palmos (~20 cm) e o teste da mão (segundos que a mão aguenta a ~grelha).
   * PONTOS: temperatura interna no centro da peça, medida com termômetro de espeto.
   *   Retire 2–3 °C antes do alvo: a carne continua subindo no descanso (carry-over).
   * SEGUROS: mínimos recomendados por segurança alimentar para aves, suínos e carne moída. */
  var ZONAS = {
    forte: { nome: 'Brasa forte', palmos: '1 palmo · ~20 cm', mao: '2–3 s', uso: 'Selar, cortes finos, coração, espetinho' },
    media: { nome: 'Brasa média', palmos: '1,5 palmo · ~30 cm', mao: '4–5 s', uso: 'Peças médias, linguiça, frango com osso' },
    branda: { nome: 'Fogo brando', palmos: '2–3 palmos · 40–60 cm', mao: '7–8 s', uso: 'Costela, cupim, peças inteiras' },
    indireto: { nome: 'Indireto', palmos: 'lado sem brasa', mao: '10 s+', uso: 'Terminar sem queimar, segurar quente' }
  };
  var PONTOS = [
    { id: 'selado', nome: 'Selado', sub: 'azul, só a casca', min: 45, max: 49, cor: '#7a1a12' },
    { id: 'mal', nome: 'Mal passado', sub: 'centro vermelho', min: 50, max: 54, cor: '#b3261a' },
    { id: 'ponto', nome: 'Ao ponto', sub: 'centro rosado', min: 57, max: 60, cor: '#d9573a' },
    { id: 'ponto-bem', nome: 'Ao ponto p/ bem', sub: 'rosado leve', min: 63, max: 65, cor: '#b87a52' },
    { id: 'bem', nome: 'Bem passado', sub: 'sem rosado', min: 70, max: 74, cor: '#6b5040' }
  ];
  var SEGUROS = [['Frango', '74 °C na coxa, perto do osso'], ['Porco (lombo, copa)', '63 °C + 3 min de descanso'], ['Linguiça / moída', '71 °C no centro'], ['Costela de boi (desmanchar)', '90–95 °C, colágeno derretido']];
  function tempoMin(c) {
    var m = String((c && c.tempo) || '').match(/(\d+)(?:\s*[-–a]\s*(\d+))?\s*(min|h)/);
    if (!m) return 0;
    var v = +(m[2] || m[1]); return m[3] === 'h' ? v * 60 : v;
  }
  function durTxt(min) { if (min < 60) return min + ' min'; var h = Math.floor(min / 60), r = min % 60; return h + ' h' + (r ? ' ' + r : ''); }
  function zona(c) {
    var b = norm(c.brasa || '');
    var t = tempoMin(c);
    if (/2 a 3 palmos|longe|fogo de chao/.test(b) || t >= 120) return Object.assign({ k: 'branda' }, ZONAS.branda);
    if (/1,5 palmo|media/.test(b) || t >= 30) return Object.assign({ k: 'media' }, ZONAS.media);
    return Object.assign({ k: 'forte' }, ZONAS.forte);
  }
  function descanso(c) { return c.animal === 'boi' || c.animal === 'cordeiro' ? (tempoMin(c) >= 120 ? 15 : 5) : 0; }
  function hhmm(d) { return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }

  /* ---------- na brasa ---------- */
  var timers = {}; // id -> { end, total, virou }
  function renderBrasa(r) {
    var body = $('#brasa-body'); if (!body) return;
    var sv = (plan.servir || '13:00').split(':'), T = new Date(); T.setHours(+sv[0] || 13, +sv[1] || 0, 0, 0);
    $('#servir').value = plan.servir || '13:00';
    var seq = r.linhas.map(function (l) {
      var t = tempoMin(l.c) || 20, d = descanso(l.c), z = zona(l.c);
      var sai = new Date(T - d * 60000), entra = new Date(sai - t * 60000);
      return { l: l, t: t, d: d, z: z, entra: entra, sai: sai };
    }).sort(function (a, b) { return a.entra - b.entra; });
    var acender = seq.length ? new Date(seq[0].entra - 40 * 60000) : null;
    var span = acender ? (T - acender) : 1;
    var pos = function (d) { return Math.max(0, Math.min(100, (d - acender) / span * 100)); };
    var carvao = r.linhas.length ? Math.max(3, Math.ceil(r.totalG / 1000)) : 0;
    var longo = seq.filter(function (x) { return x.t >= 120; }).reduce(function (m, x) { return Math.max(m, x.t); }, 0);
    var html = '';
    if (!seq.length) {
      html += '<div class="empty">' + ico('brasa', '', 48) + '<p class="empty__t">Nada na grelha ainda</p><p class="empty__d">Escolha os cortes no Planejar. Aqui sai a ordem de entrada na brasa, com timers e o ponto de cada um.</p><button type="button" class="btn btn--primary btn--auto" data-go="planejar">Planejar churrasco</button></div>';
    } else {
      html += '<section class="folha folha--linha" aria-labelledby="b-linha"><h2 class="folha__t" id="b-linha"><span class="step__n">01</span><span class="lettering">Linha do tempo</span></h2>' +
        '<p class="folha__lead">De trás pra frente a partir das <b>' + hhmm(T) + '</b>. Cada corte entra na hora certa e sai junto com os outros.</p>' +
        '<div class="crono" aria-hidden="true"><div class="crono__axis"><span style="left:0">' + hhmm(acender) + '</span><span style="left:100%">' + hhmm(T) + '</span></div>' +
        seq.map(function (x) { return '<div class="crono__row"><span class="crono__n">' + esc(x.l.c.nome) + '</span><span class="crono__track"><span class="crono__bar crono__bar--' + x.z.k + '" style="left:' + pos(x.entra) + '%;width:' + Math.max(2, pos(x.sai) - pos(x.entra)) + '%"></span>' + (x.d ? '<span class="crono__rest" style="left:' + pos(x.sai) + '%;width:' + (100 - pos(x.sai)) + '%"></span>' : '') + '</span></div>'; }).join('') +
        '<div class="crono__row crono__row--fire"><span class="crono__n">Acender</span><span class="crono__track"><span class="crono__fire" style="width:' + pos(seq[0].entra) + '%"></span></span></div></div>' +
        '<ol class="ordem">' +
        '<li class="ordem__i ordem__i--fogo"><time>' + hhmm(acender) + '</time><div><b>Acender o carvão</b><small>' + carvao + ' kg' + (longo ? ' + ~1 kg por hora extra de fogo' : '') + '. Brasa pronta quando cobrir de cinza branca (30–40 min).</small></div></li>' +
        seq.map(function (x) {
          var tm = timers[x.l.id];
          return '<li class="ordem__i" data-id="' + esc(x.l.id) + '"><time>' + hhmm(x.entra) + '</time><div><b>' + esc(x.l.c.nome) + ' <span class="zona-tag zona-tag--' + x.z.k + '">' + esc(x.z.nome) + '</span></b>' +
            '<small>' + kgTxt(x.l.g) + ' · ' + durTxt(x.t) + ' na grelha' + (x.d ? ' · descansa ' + x.d + ' min' : '') + ' · ' + esc(x.l.c.ponto || '') + '</small>' +
            (x.l.c.brasa ? '<small class="ordem__dica">' + esc(x.l.c.brasa) + '</small>' : '') + '</div>' +
            '<button type="button" class="timer' + (tm ? ' is-on' : '') + '" data-act="timer" data-min="' + x.t + '" aria-label="' + (tm ? 'Parar timer de ' : 'Iniciar timer de ') + esc(x.l.c.nome) + '"><span class="timer__dial" aria-hidden="true"></span><span class="timer__v" data-timer="' + esc(x.l.id) + '">' + (tm ? '' : durTxt(x.t)) + '</span></button></li>';
        }).join('') +
        '<li class="ordem__i ordem__i--servir"><time>' + hhmm(T) + '</time><div><b>Servir</b><small>Fatie contra a fibra, na tábua, com a faca bem afiada.</small></div></li></ol></section>';
    }
    html += '<section class="folha" aria-labelledby="b-ponto"><h2 class="folha__t" id="b-ponto"><span class="step__n">02</span><span class="lettering">Ponto pelo termômetro</span></h2>' +
      '<div class="termo" role="list">' + PONTOS.map(function (p) { return '<div class="termo__p" role="listitem" style="--c:' + p.cor + '"><span class="termo__sw" aria-hidden="true"></span><b>' + p.nome + '</b><span class="termo__t">' + p.min + '–' + p.max + ' °C</span><small>' + p.sub + '</small></div>'; }).join('') + '</div>' +
      '<p class="folha__nota">Tire a carne 2–3 °C antes do alvo: ela continua subindo no descanso.</p>' +
      '<dl class="seguro">' + SEGUROS.map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + x[1] + '</dd></div>'; }).join('') + '</dl></section>';
    html += '<section class="folha" aria-labelledby="b-fogo"><h2 class="folha__t" id="b-fogo"><span class="step__n">03</span><span class="lettering">Zonas de fogo</span></h2>' +
      '<div class="grelha" aria-hidden="true"><span class="grelha__z grelha__z--forte"></span><span class="grelha__z grelha__z--media"></span><span class="grelha__z grelha__z--indireto"></span></div>' +
      '<ul class="zonas">' + Object.keys(ZONAS).map(function (k) { var z = ZONAS[k]; return '<li class="zona zona--' + k + '"><b>' + z.nome + '</b><span class="zona__h">' + z.palmos + '</span><span>Mão aguenta <b>' + z.mao + '</b></span><small>' + z.uso + '</small></li>'; }).join('') + '</ul>' +
      '<p class="folha__nota">Monte a brasa em degrau: um lado alto e forte, outro baixo, e uma área sem brasa para o indireto.</p></section>';
    body.innerHTML = html;
    tickTimers();
  }
  var tickT;
  function tickTimers() {
    var now = Date.now(), any = false;
    Object.keys(timers).forEach(function (id) {
      var tm = timers[id], left = Math.max(0, Math.round((tm.end - now) / 1000)), c = corte(id);
      any = true;
      if (!tm.virou && left <= tm.total / 2) { tm.virou = true; alerta('Hora de virar: ' + c.nome); }
      if (left <= 0) { delete timers[id]; alerta('Tirar da grelha: ' + c.nome); renderBrasa(last); return; }
      var el = document.querySelector('[data-timer="' + id + '"]');
      if (el) {
        el.textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
        var b = el.closest('.timer'); if (b) b.style.setProperty('--p', (1 - left / tm.total).toFixed(3));
      }
    });
    clearTimeout(tickT); if (any) tickT = setTimeout(tickTimers, 1000);
  }
  function alerta(msg) { toast(msg); try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) {} }

  /* ---------- lista ---------- */
  var UTENSILIOS = [
    { id: 'u-faca', nome: 'Faca afiada + chaira' }, { id: 'u-tabua', nome: 'Tábua grande' }, { id: 'u-espetos', nome: 'Espetos / grelha limpa' },
    { id: 'u-pegador', nome: 'Pegador longo' }, { id: 'u-termo', nome: 'Termômetro de espeto' }, { id: 'u-acender', nome: 'Acendedor ou álcool gel' },
    { id: 'u-luva', nome: 'Luva e pano' }
  ];
  function renderLista(r) {
    var body = $('#lista-body');
    $('#lista-meta').textContent = r.linhas.length ? pessoasTxt() : '';
    if (!r.linhas.length) {
      body.innerHTML = '<div class="empty">' + ico('brasa', '', 48) + '<p class="empty__t">Sua lista está vazia</p><p class="empty__d">Diga quantas pessoas vêm e escolha os cortes. A lista de compras e o checklist do dia saem prontos.</p><button type="button" class="btn btn--primary btn--auto" data-go="planejar">Planejar churrasco</button></div>';
      return;
    }
    var txt = shareText(r);
    var chk = function (x, q) { var ok = !!plan.extrasOk[x.id]; return '<li><label class="check"><input type="checkbox" data-x="' + x.id + '"' + (ok ? ' checked' : '') + '><span class="check__box" aria-hidden="true"></span><span class="check__n">' + esc(x.nome) + '</span><span class="check__q">' + esc(q || '') + '</span></label></li>'; };
    body.innerHTML =
      '<div class="lista__grid"><div class="lista__main"><article class="folha folha--lista">' +
      '<h2 class="folha__t" id="l-carne"><span class="step__n">01</span><span class="lettering">Carne</span><span class="folha__k">' + kgTxt(r.totalG) + '</span></h2><ul class="lines" aria-labelledby="l-carne">' +
      r.linhas.map(function (l) {
        return '<li class="line" data-id="' + esc(l.id) + '">' + thumb(l.c) +
          '<span class="line__n"><b>' + esc(l.c.nome) + '</b><small>' + esc(ANIMAL_NOME[l.c.animal] || '') + (l.c.pesoPeca ? ' · peça ' + esc(l.c.pesoPeca) : '') + '</small>' +
          (l.manual ? '<button type="button" class="mini" data-act="auto">ajustado · voltar ao automático</button>' : '') + '</span>' +
          '<span class="line__ctl"><span class="qty"><button type="button" class="qty__b" data-act="dec" aria-label="Menos 250 g de ' + esc(l.c.nome) + '">−</button><output aria-live="polite">' + kgTxt(l.g) + '</output><button type="button" class="qty__b" data-act="inc" aria-label="Mais 250 g de ' + esc(l.c.nome) + '">+</button></span>' +
          '<button type="button" class="icon-btn" data-act="rm" aria-label="Remover ' + esc(l.c.nome) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></span></li>';
      }).join('') + '</ul>' +
      '<button type="button" class="link-btn" data-go="cortes">+ Adicionar corte</button>' +
      '<h2 class="folha__t" id="l-extra"><span class="step__n">02</span><span class="lettering">Brasa e mesa</span></h2><ul class="checks" aria-labelledby="l-extra">' +
      r.extras.map(function (x) { return chk(x, x.qtd); }).join('') + '</ul>' +
      '<h2 class="folha__t" id="l-ut"><span class="step__n">03</span><span class="lettering">Bancada do assador</span></h2><ul class="checks checks--2" aria-labelledby="l-ut">' +
      UTENSILIOS.map(function (x) { return chk(x); }).join('') + '</ul>' +
      '</article></div>' +
      '<aside class="lista__side"><div class="total">' +
      '<p class="total__k">Pra levar</p>' +
      '<p class="total__v">' + kgTxt(r.totalG) + '</p>' +
      '<p class="total__s">' + pessoasTxt() + ' · ' + r.linhas.length + (r.linhas.length > 1 ? ' cortes' : ' corte') + '</p>' +
      (r.temPreco ? '<p class="total__note">Estimativa de gasto com carne: ~' + brl(r.valor) + (r.precoParcial ? ' (alguns cortes sem preço)' : '') + '. Preço médio, varia por região.</p>' : '') +
      '<a class="btn btn--wa" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(txt) + '" id="share-wa">' + waIco() + '<span>Enviar no WhatsApp</span></a>' +
      '<button type="button" class="btn btn--ghost" id="share-copy">Copiar lista</button>' +
      (navigator.share ? '<button type="button" class="btn btn--ghost" id="share-native">Compartilhar…</button>' : '') +
      '<button type="button" class="btn btn--ghost" data-go="brasa">Ver ordem na brasa</button>' +
      '<button type="button" class="link-btn link-btn--danger" id="clear-list">Limpar lista</button>' +
      '</div></aside></div>';
  }
  function waIco() { return '<svg viewBox="0 0 24 24" aria-hidden="true" class="wa"><path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5Z"/><path d="M9 8.6c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .5.4l.7 1.6c.1.2 0 .4-.1.6l-.5.6c.6 1.2 1.6 2.1 2.8 2.7l.6-.6c.2-.2.4-.2.6-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3 0 .5-.4.7-.5.3-1.2.5-1.9.4-2.7-.6-4.8-2.7-5.4-5.4-.1-.7 0-1.4.4-1.9Z" class="wa__p"/></svg>'; }

  /* ---------- dock / badges ---------- */
  function renderDock(r) {
    var n = r.linhas.length;
    $$('.tab__n').forEach(function (b) { b.textContent = n; b.setAttribute('data-n', n); });
    $$('.tab-n-sr').forEach(function (s) { s.textContent = n ? ', ' + n + (n > 1 ? ' cortes' : ' corte') : ', vazia'; });
    var d = $('#dock-sum');
    if (!n) { d.innerHTML = '<span class="dock__t">' + plan.adultos + ' + ' + plan.criancas + ' pessoas · escolha os cortes</span>'; d.classList.add('is-empty'); d.setAttribute('aria-label', 'Nenhum corte na lista ainda'); return; }
    d.classList.remove('is-empty');
    d.innerHTML = '<span class="dock__t"><b>' + kgTxt(r.totalG) + '</b><i aria-hidden="true">·</i>' + r.pessoas + ' pessoas' + '<i aria-hidden="true">·</i>' + r.linhas.length + (r.linhas.length > 1 ? ' cortes' : ' corte') + '</span><span class="dock__go">Ver lista<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></span>';
    d.setAttribute('aria-label', 'Ver lista: ' + kgTxt(r.totalG) + ' para ' + r.pessoas + ' pessoas' + '');
  }

  var last;
  function commit() {
    save();
    var prevG = last ? last.totalG + '|' + last.alvo : null;
    last = compute();
    renderPlan(last);
    if (prevG !== null && prevG !== last.totalG + '|' + last.alvo) { var vz = $('#result .conta'); if (vz) { vz.classList.remove('roll'); void vz.offsetWidth; vz.classList.add('roll'); } } renderLista(last); renderBrasa(last); renderDock(last); syncCardButtons();
    document.dispatchEvent(new CustomEvent('plan:change', { detail: { itens: plan.itens.slice() } }));
  }

  /* ---------- toast ---------- */
  var toastT;
  function toast(msg, action) {
    var t = $('#toast');
    t.innerHTML = '<span>' + esc(msg) + '</span>' + (action ? '<button type="button">' + esc(action.label) + '</button>' : '');
    if (action) t.querySelector('button').onclick = function () { action.fn(); t.classList.remove('show'); };
    t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, action ? 4000 : 2200);
  }

  /* ---------- navegação ---------- */
  var VIEWS = ['planejar', 'cortes', 'brasa', 'lista'];
  function setView(v, focus) {
    if (VIEWS.indexOf(v) < 0) v = 'planejar';
    document.body.setAttribute('data-view', v);
    $$('.view').forEach(function (s) { s.hidden = s.dataset.view !== v; });
    $$('.tab[data-view]').forEach(function (t) { if (t.dataset.view === v) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
    if (location.hash.slice(1) !== v) history.replaceState(null, '', '#' + v);
    window.scrollTo(0, 0); requestAnimationFrame(function () { window.scrollTo(0, 0); });
    if (focus) { var h = $('#' + v + ' h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
  }

  /* ---------- init ---------- */
  function init() {
    load();
    // limiar "econômico": terço mais barato dos cortes com preço
    var ps = cortes().map(preco).filter(Boolean).sort(function (a, b) { return a - b; });
    if (ps.length) { ecoMax = ps[Math.floor((ps.length - 1) / 3)]; $('#f-eco').hidden = false; }
    if (Array.isArray(window.CORTES_ECONOMICOS) && window.CORTES_ECONOMICOS.length) ecoSet = window.CORTES_ECONOMICOS;
    else $$('#f-sort option[data-preco]').forEach(function (o) { o.remove(); });

    // passo 1
    $$('.stepper').forEach(function (s) {
      var k = s.dataset.k, inp = s.querySelector('input');
      s.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-d]'); if (!b) return;
        plan[k] = Math.max(0, Math.min(200, plan[k] + +b.dataset.d)); commit();
        s.classList.remove('tick'); void s.offsetWidth; s.classList.add('tick');
      });
      inp.addEventListener('change', function () { var v = parseInt(inp.value, 10); plan[k] = v >= 0 ? Math.min(200, v) : 0; commit(); });
    });
    var A = apetites();
    $('#apetite').insertAdjacentHTML('beforeend', Object.keys(A).map(function (k) {
      return '<label class="ap"><input type="radio" name="ap" value="' + k + '"><span><b>' + esc(A[k].label) + '</b><small>' + A[k].gramas + ' g/pessoa</small></span></label>';
    }).join(''));
    $('#apetite').addEventListener('change', function (e) { if (e.target.name === 'ap') { plan.apetite = e.target.value; commit(); } });

    // passo 2
    $('#sug').addEventListener('click', function (e) { var b = e.target.closest('[data-id]'); if (b) { add(b.dataset.id); var n = $('#sug button'); if (n) n.focus(); } });
    $('#picks').addEventListener('click', function (e) {
      var b = e.target.closest('[data-act="rm"]'); if (!b) return;
      var id = b.closest('[data-id]').dataset.id, c = corte(id); remove(id);
      toast(c.nome + ' saiu do plano', { label: 'Desfazer', fn: function () { add(id); } });
    });
    $('#preset').addEventListener('click', function () { PRESET.forEach(function (id) { if (corte(id) && !has(id)) plan.itens.push({ id: id }); }); commit(); });
    var M = window.Calc && window.Calc.MIXES;
    if (M) {
      $('#mixes').innerHTML = Object.keys(M).map(function (k) { return '<button type="button" class="mix" data-mix="' + k + '"><b>' + esc(M[k].label) + '</b><small>' + esc(M[k].desc || '') + '</small></button>'; }).join('');
      $('#mixes-wrap').hidden = false;
      $('#mixes').addEventListener('click', function (e) {
        var b = e.target.closest('[data-mix]'); if (!b) return;
        var w = M[b.dataset.mix].w || {}, prev = plan.itens.slice();
        plan.itens = Object.keys(w).filter(corte).map(function (id) { return { id: id, w: w[id] }; });
        commit(); toast('Mix ' + M[b.dataset.mix].label + ' aplicado', { label: 'Desfazer', fn: function () { plan.itens = prev; commit(); } });
      });
    }

    // catálogo
    $('#f-pais').innerHTML = PAISES.map(function (p) { return '<option value="' + p[0] + '">' + p[1] + '</option>'; }).join('');
    var segA = $('#f-animal');
    segA.insertAdjacentHTML('beforeend', ANIMAIS.map(function (p) { return '<button type="button" class="chip" data-v="' + p[0] + '" aria-pressed="' + (p[0] === '') + '">' + (p[0] ? ico(p[0], '', 20) : '') + p[1] + '</button>'; }).join(''));
    segA.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      state.animal = b.dataset.v; segA.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); renderGrid();
    });
    $('#f-eco').addEventListener('click', function () { state.eco = !state.eco; this.setAttribute('aria-pressed', state.eco); renderGrid(); });
    $('#f-pais').addEventListener('change', function (e) { state.pais = e.target.value; renderGrid(); });
    $('#f-sort').addEventListener('change', function (e) { state.sort = e.target.value; renderGrid(); });
    var qT; $('#q').addEventListener('input', function (e) { clearTimeout(qT); qT = setTimeout(function () { state.q = e.target.value; renderGrid(); }, 100); });
    $('#clear').addEventListener('click', function () {
      state = { q: '', pais: '', animal: '', sort: '', eco: false };
      $('#filters').reset(); $('#f-eco').setAttribute('aria-pressed', 'false');
      segA.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.v === ''); });
      renderGrid(); $('#q').focus();
    });
    $('#grid').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-act]'); if (!b) return;
      var id = b.closest('.card').dataset.id, c = corte(id);
      if (b.dataset.act === 'info') {
        if (window.Animal && typeof window.Animal.open === 'function') window.Animal.open(id);
        else toast('Mapa do animal indisponível no momento');
        return;
      }
      var on = toggle(id);
      toast(on ? c.nome + ' entrou na lista' : c.nome + ' saiu da lista', on ? null : { label: 'Desfazer', fn: function () { add(id); } });
      var dk = $('#dock'); dk.classList.remove('bump'); void dk.offsetWidth; dk.classList.add('bump');
    });

    // lista
    $('#lista-body').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.id === 'share-copy') {
        var t = shareText(last);
        var done = function () { toast('Lista copiada'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, function () { fallbackCopy(t); done(); });
        else { fallbackCopy(t); done(); }
        return;
      }
      if (b.id === 'share-native') { navigator.share({ title: 'Churrasco', text: shareText(last) }).catch(function () {}); return; }
      if (b.id === 'clear-list') {
        var prev = plan.itens.slice(); plan.itens = []; commit();
        toast('Lista limpa', { label: 'Desfazer', fn: function () { plan.itens = prev; commit(); } }); return;
      }
      var li = b.closest('.line'); if (!li) return;
      var id = li.dataset.id, it = plan.itens.filter(function (x) { return x.id === id; })[0];
      var cur = last.linhas.filter(function (l) { return l.id === id; })[0];
      if (b.dataset.act === 'inc') it.g = cur.g + 250;
      else if (b.dataset.act === 'dec') it.g = Math.max(250, cur.g - 250);
      else if (b.dataset.act === 'auto') delete it.g;
      else if (b.dataset.act === 'rm') { var c = corte(id); remove(id); toast(c.nome + ' removido', { label: 'Desfazer', fn: function () { add(id); } }); return; }
      commit();
      var again = $('#lista-body .line[data-id="' + id + '"] [data-act="' + b.dataset.act + '"]') || $('#lista-body .line[data-id="' + id + '"] .qty__b');
      if (again) again.focus();
    });
    $('#lista-body').addEventListener('change', function (e) { var x = e.target.dataset.x; if (x) { plan.extrasOk[x] = e.target.checked; save(); } });

    // na brasa
    $('#servir').addEventListener('change', function (e) { if (/^\d\d:\d\d$/.test(e.target.value)) { plan.servir = e.target.value; commit(); } });
    $('#brasa-body').addEventListener('click', function (e) {
      var b = e.target.closest('[data-act="timer"]'); if (!b) return;
      var id = b.closest('[data-id]').dataset.id, c = corte(id);
      if (timers[id]) { delete timers[id]; toast('Timer de ' + c.nome + ' parado'); }
      else { var t = +b.dataset.min * 60; timers[id] = { end: Date.now() + t * 1000, total: t, virou: false }; toast('Timer de ' + c.nome + ': aviso para virar na metade'); }
      renderBrasa(last);
      var again = $('#brasa-body [data-id="' + id + '"] .timer'); if (again) again.focus();
    });

    // navegação
    document.addEventListener('click', function (e) {
      var g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); setView(g.dataset.go, true); return; }
      var t = e.target.closest('.tab[data-view]'); if (t) { e.preventDefault(); setView(t.dataset.view, true); }
    });
    window.addEventListener('hashchange', function () { setView(location.hash.slice(1)); });

    // ficha do "i"
    window.Plan = { has: has, add: add, remove: remove, toggle: toggle };
    document.addEventListener('corte:levar', function (e) {
      var id = e.detail && e.detail.id, c = corte(id); if (!c) return;
      if (has(id)) return; add(id); toast(c.nome + ' entrou na lista');
    });

    var pd = $('#pedido-d'); if (pd) pd.textContent = new Date().toLocaleDateString('pt-BR');
    renderGrid();
    commit();
    setView(location.hash.slice(1) || 'planejar');
  }
  function fallbackCopy(t) {
    var ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
