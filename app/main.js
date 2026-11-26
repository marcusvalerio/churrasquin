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
    if (!plan.pedido) plan.pedido = 100 + Math.floor(Math.random() * 900);
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
  function thumb(c) {
    var art = window.CUT_ART && window.CUT_ART[c.id];
    return '<span class="thumb" aria-hidden="true">' + (art || ico(c.animal, 'thumb__ph', 28)) + '</span>';
  }
  function renderPlan(r) {
    $('#in-ad').value = plan.adultos; $('#in-cr').value = plan.criancas;
    $$('.stepper').forEach(function (s) { var k = s.dataset.k; s.querySelector('[data-d="-1"]').disabled = plan[k] <= 0; });
    $$('#apetite input').forEach(function (i) { i.checked = i.value === plan.apetite; });

    var picks = $('#picks');
    picks.innerHTML = r.linhas.map(function (l) {
      return '<li class="pick" data-id="' + esc(l.id) + '">' + thumb(l.c) +
        '<span class="pick__n"><b>' + esc(l.c.nome) + '</b><small>' + (l.preco ? brl(l.preco) + '/kg' : ANIMAL_NOME[l.c.animal] || '') + (l.manual ? ' · ajustado' : '') + '</small></span>' +
        '<span class="pick__lead" aria-hidden="true"></span><span class="pick__kg">' + kgTxt(l.g) + '</span>' +
        '<button type="button" class="icon-btn" data-act="rm" aria-label="Tirar ' + esc(l.c.nome) + ' do plano"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></li>';
    }).join('');
    picks.hidden = !r.linhas.length;
    $('#picks-empty').hidden = !!r.linhas.length;

    $('#sug').innerHTML = SUGESTOES.filter(function (id) { return corte(id) && !has(id); }).slice(0, 6).map(function (id) {
      var c = corte(id);
      return '<button type="button" class="chip chip--add" data-id="' + id + '"><span class="chip__plus" aria-hidden="true">+</span>' + esc(c.nome) + (preco(c) ? ' <small>' + brl(preco(c)) + '/kg</small>' : '') + '</button>';
    }).join('');

    var live = $('#result-live');
    var kgN = r.linhas.length ? r.totalG / 1000 : (r.porcoes ? Math.round(r.alvo / 100) / 10 : 0);
    var rkg = r.temPreco && r.totalG ? r.valor / (r.totalG / 1000) : null;
    var num = function (v, d) { return v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }); };
    var visor = '<div class="visor" role="group" aria-label="Visor da balança">' +
      '<div class="visor__c visor__c--kg"><span class="visor__k">Peso kg</span><span class="visor__v">' + num(kgN, 1) + '</span></div>' +
      '<div class="visor__c"><span class="visor__k">R$/kg méd.</span><span class="visor__v">' + (rkg ? num(rkg, 2) : '--,--') + '</span></div>' +
      '<div class="visor__c visor__c--tot"><span class="visor__k">Total R$</span><span class="visor__v">' + (r.linhas.length && r.temPreco ? num(r.valor, 2) : '--,--') + '</span></div></div>';
    if (!r.porcoes) live.innerHTML = visor + '<p class="result__sub">Comece pelo passo 01: quantos vêm?</p>';
    else if (!r.linhas.length) live.innerHTML = visor + '<p class="result__sub"><b>' + kgTxt(Math.round(r.alvo / 100) * 100) + '</b> de carne para ' + pessoasTxt() + '. Agora escolha os cortes.</p>';
    else live.innerHTML = visor +
      '<p class="result__sub"><b>' + kgTxt(r.totalG) + '</b> para ' + pessoasTxt() + ', em ' + r.linhas.length + (r.linhas.length > 1 ? ' cortes' : ' corte') + (r.temPreco ? ' · ~' + brl(r.porPessoa) + '/pessoa' : '') + '</p>' +
      (r.precoParcial ? '<p class="result__note">Alguns cortes ainda sem preço.</p>' : '') +
      '<div class="etiqueta"><p class="etiqueta__h"><span>Etiqueta</span><span>' + r.linhas.length + ' itens</span></p><ul class="result__lines">' + r.linhas.map(function (l) { return '<li><span>' + esc(l.c.nome) + '</span><i aria-hidden="true"></i><b>' + kgTxt(l.g) + '</b></li>'; }).join('') + '</ul><span class="etiqueta__bar" aria-hidden="true"></span></div>';
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
        '<dl class="meters">' + meter('maciez', 'Maciez', c.maciez) + meter('gordura', 'Gordura', c.gordura) + meter('sabor', 'Sabor', c.sabor) + '</dl>' +
        (p ? '<span class="pricetag' + (isEco(c) ? ' pricetag--eco' : '') + '"><span class="pricetag__k">' + (isEco(c) ? 'Oferta' : 'Kg') + '</span><b>' + brl(p) + '</b></span>' : '<span class="pricetag pricetag--na"><span class="pricetag__k">Kg</span><b>consulte</b></span>') +
        '<span class="card__stamp" aria-hidden="true">Na lista</span>' +
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
      return '<li class="vitrine" data-animal="' + a + '"><h2 class="letreiro"><span class="letreiro__ico">' + ico(a, '', 28) + '</span><span class="letreiro__t">' + esc(ANIMAL_NOME[a] || a) + '</span><span class="letreiro__n">' + groups[a].length + (groups[a].length > 1 ? ' peças' : ' peça') + '</span></h2>' +
        '<ul class="grid-row" aria-label="' + esc(ANIMAL_NOME[a] || a) + '">' + cards(groups[a]) + '</ul></li>';
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

  /* ---------- lista ---------- */
  function renderLista(r) {
    var body = $('#lista-body');
    $('#lista-meta').textContent = r.linhas.length ? pessoasTxt() : '';
    if (!r.linhas.length) {
      body.innerHTML = '<div class="empty">' + ico('brasa', '', 48) + '<p class="empty__t">Sua lista está vazia</p><p class="empty__d">Diga quantas pessoas vêm e escolha os cortes. A lista de compras sai pronta, com quilos e preço.</p><button type="button" class="btn btn--primary btn--auto" data-go="planejar">Planejar churrasco</button></div>';
      return;
    }
    var txt = shareText(r);
    var d = new Date(), dt = d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    var num = function (v) { return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
    body.innerHTML =
      '<div class="lista__grid"><div class="lista__main"><article class="cupom" aria-labelledby="l-carne">' +
      '<header class="cupom__head"><img src="brand/v4/wordmark-final.svg" alt="" class="cupom__logo" onerror="this.remove()"><p>Açougue da turma · balcão 01</p><p>Cupom de balança · não fiscal</p>' +
      '<p class="cupom__row"><span>Pedido Nº ' + String(plan.pedido || 0).padStart(4, '0') + '</span><span>' + dt + '</span></p></header>' +
      '<h2 class="cupom__sec" id="l-carne"><span>Carne</span><span>' + kgTxt(r.totalG) + '</span></h2>' +
      '<p class="cupom__cols" aria-hidden="true"><span>Item</span><span>Kg × R$/kg</span><span>R$</span></p><ul class="lines">' +
      r.linhas.map(function (l, i) {
        return '<li class="line" data-id="' + esc(l.id) + '">' +
          '<span class="line__i" aria-hidden="true">' + String(i + 1).padStart(3, '0') + '</span>' +
          '<span class="line__n"><b>' + esc(l.c.nome) + '</b><small>' + kgTxt(l.g).replace(' kg', '') + ' kg × ' + (l.preco ? num(l.preco) : 's/ preço') + '</small>' +
          (l.manual ? '<button type="button" class="mini" data-act="auto">ajustado · voltar ao automático</button>' : '') + '</span>' +
          '<span class="line__lead" aria-hidden="true"></span><span class="line__v">' + (l.valor != null ? num(l.valor) : '—') + '</span>' +
          '<span class="line__ctl"><span class="qty"><button type="button" class="qty__b" data-act="dec" aria-label="Menos 250 g de ' + esc(l.c.nome) + '">−</button><output aria-live="polite">' + kgTxt(l.g) + '</output><button type="button" class="qty__b" data-act="inc" aria-label="Mais 250 g de ' + esc(l.c.nome) + '">+</button></span>' +
          '<button type="button" class="icon-btn" data-act="rm" aria-label="Remover ' + esc(l.c.nome) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></span></li>';
      }).join('') + '</ul>' +
      '<button type="button" class="link-btn" data-go="cortes">+ Adicionar corte</button>' +
      '<div class="cupom__tot"><p><span>Total da carne</span><b>' + (r.temPreco ? 'R$ ' + num(r.valor) : '—') + '</b></p>' +
      '<p class="cupom__sub"><span>' + pessoasTxt() + '</span><span>' + (r.temPreco ? '~' + brl(r.porPessoa) + '/pessoa' : '') + '</span></p>' +
      '<span class="stamp stamp--brasa" aria-hidden="true">Pronto<br>pra brasa</span></div>' +
      (r.precoParcial ? '<p class="cupom__note">* Alguns cortes sem preço não entram no total.</p>' : '') +
      '<p class="cupom__note">' + (!r.temPreco ? '* Preços estimados ainda não disponíveis.' : '* Preço médio de açougue; confira no seu.') + '</p>' +
      '<section aria-labelledby="l-extra"><h2 class="cupom__sec" id="l-extra"><span>Acompanhamentos</span><span>' + r.extras.length + ' itens</span></h2><ul class="checks">' +
      r.extras.map(function (x) {
        var ok = !!plan.extrasOk[x.id];
        return '<li><label class="check"><input type="checkbox" data-x="' + x.id + '"' + (ok ? ' checked' : '') + '><span class="check__box" aria-hidden="true"></span><span class="check__n">' + esc(x.nome) + '</span><span class="check__q">' + esc(x.qtd) + '</span></label></li>';
      }).join('') + '</ul></section>' +
      '<p class="cupom__bye" aria-hidden="true">*** obrigado, bom churrasco ***</p><span class="cupom__barcode" aria-hidden="true"></span>' +
      '</article></div>' +
      '<aside class="lista__side"><div class="total">' +
      '<p class="total__k">Mandar pra turma</p>' +
      '<p class="total__v">' + (r.temPreco ? '~' + brl(r.valor) : kgTxt(r.totalG)) + '</p>' +
      '<p class="total__s">' + kgTxt(r.totalG) + ' · ' + r.pessoas + ' pessoas</p>' +
      '<a class="btn btn--wa selo" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(txt) + '" id="share-wa">' + waIco() + '<span>Enviar no WhatsApp</span></a>' +
      '<button type="button" class="btn btn--ghost" id="share-copy">Copiar lista</button>' +
      (navigator.share ? '<button type="button" class="btn btn--ghost" id="share-native">Compartilhar…</button>' : '') +
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
    d.innerHTML = '<span class="dock__t"><b>' + kgTxt(r.totalG) + '</b><i aria-hidden="true">·</i>' + r.pessoas + ' pessoas' + (r.temPreco ? '<i aria-hidden="true">·</i><b>~' + brl(r.valor) + '</b>' : '') + '</span><span class="dock__go">Ver lista<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></span>';
    d.setAttribute('aria-label', 'Ver lista: ' + kgTxt(r.totalG) + ' para ' + r.pessoas + ' pessoas' + (r.temPreco ? ', cerca de ' + brl(r.valor) : ''));
  }

  var last;
  function commit() {
    save();
    var prevG = last ? last.totalG + '|' + last.alvo : null;
    last = compute();
    renderPlan(last);
    if (prevG !== null && prevG !== last.totalG + '|' + last.alvo) { var vz = $('#result .visor'); if (vz) vz.classList.add('roll'); } renderLista(last); renderDock(last); syncCardButtons();
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
  var VIEWS = ['planejar', 'cortes', 'lista'];
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

    var pn = $('#pedido-n'); if (pn) pn.textContent = 'Nº ' + String(plan.pedido).padStart(4, '0');
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
