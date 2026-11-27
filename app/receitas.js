/* churrasquin — app/receitas.js (UI das receitas)
 * Lê window.RECEITAS (data/receitas.js) e window.escalarReceita(r, porcoes).
 * Se o arquivo de dados ainda não existir, usa um mock mínimo só para o protótipo funcionar.
 * Expõe window.ReceitasUI = { CATS, list(), get(id), escalar(r, n), base(r), card(r, i), ficha(r, n, ctx) }. */
(function () {
  'use strict';
  var CATS = [
    ['', 'Todas'], ['farofa', 'Farofas'], ['molho', 'Molhos'], ['maionese', 'Maioneses'],
    ['acompanhamento', 'Acompanhamentos'], ['tempero', 'Temperos']
  ];
  var CAT1 = { farofa: 'Farofa', molho: 'Molho', maionese: 'Maionese', acompanhamento: 'Acompanhamento', tempero: 'Tempero' };

  var MOCK = [
    { id: 'farofa-de-bacon', nome: 'Farofa de bacon', categoria: 'farofa', resumo: 'Crocante, com cebola dourada e cheiro-verde.', rende: 8, tempo: '20 min', dificuldade: 'fácil',
      combinaCom: ['picanha', 'costela', 'fraldinha'], ingredientes: [{ q: 500, un: 'g', item: 'farinha de mandioca' }, { q: 200, un: 'g', item: 'bacon' }, { q: 1, un: 'un', item: 'cebola' }, { q: 3, un: 'colher', item: 'manteiga' }],
      passos: ['Frite o bacon até soltar a gordura.', 'Doure a cebola na mesma gordura com a manteiga.', 'Junte a farinha aos poucos, mexendo até tostar.', 'Finalize com cheiro-verde.'], dica: 'Fogo médio: farinha queima rápido.', tags: ['clássico'] },
    { id: 'vinagrete', nome: 'Vinagrete', categoria: 'molho', resumo: 'Tomate, cebola e pimentão no vinagre.', rende: 10, tempo: '15 min', dificuldade: 'fácil',
      combinaCom: ['picanha', 'linguica-toscana'], ingredientes: [{ q: 4, un: 'un', item: 'tomate' }, { q: 1, un: 'un', item: 'cebola' }, { q: 0.5, un: 'un', item: 'pimentão' }, { q: 4, un: 'colher', item: 'vinagre' }],
      passos: ['Pique tudo em cubos pequenos.', 'Tempere com sal, vinagre e azeite.', 'Descanse 15 min na geladeira.'], dica: 'Tire as sementes do tomate.', tags: [] },
    { id: 'chimichurri', nome: 'Chimichurri', categoria: 'molho', resumo: 'Salsinha, orégano e alho no azeite.', rende: 12, tempo: '10 min', dificuldade: 'fácil',
      combinaCom: ['vazio', 'entrana', 'fraldinha'], ingredientes: [{ q: 1, un: 'maço', item: 'salsinha' }, { q: 2, un: 'colher', item: 'orégano' }, { q: 3, un: 'dente', item: 'alho' }, { q: 150, un: 'ml', item: 'azeite' }],
      passos: ['Pique fino salsinha e alho.', 'Misture com orégano, pimenta e vinagre.', 'Cubra com azeite.'], dica: 'Melhor de um dia pro outro.', tags: [] },
    { id: 'maionese-batata', nome: 'Maionese de batata', categoria: 'maionese', resumo: 'Batata, cenoura e maionese caseira.', rende: 8, tempo: '40 min', dificuldade: 'média',
      combinaCom: ['coxa-sobrecoxa'], ingredientes: [{ q: 1, un: 'kg', item: 'batata' }, { q: 2, un: 'un', item: 'cenoura' }, { q: 300, un: 'g', item: 'maionese' }],
      passos: ['Cozinhe batata e cenoura em cubos.', 'Esfrie bem.', 'Misture com a maionese e tempere.'], dica: 'Batata fria não desmancha.', tags: [] },
    { id: 'pao-de-alho', nome: 'Pão de alho', categoria: 'acompanhamento', resumo: 'Pasta de alho e queijo no pão.', rende: 10, tempo: '15 min', dificuldade: 'fácil',
      combinaCom: ['picanha'], ingredientes: [{ q: 10, un: 'un', item: 'pão francês' }, { q: 100, un: 'g', item: 'manteiga' }, { q: 4, un: 'dente', item: 'alho' }],
      passos: ['Misture manteiga, alho e queijo.', 'Recheie os pães.', 'Asse na brasa média, virando.'], dica: 'Embrulhe em papel-alumínio.', tags: [] },
    { id: 'sal-de-parrilla', nome: 'Sal de parrilla', categoria: 'tempero', resumo: 'Sal grosso, pimenta e ervas.', rende: 20, tempo: '5 min', dificuldade: 'fácil',
      combinaCom: ['ancho', 'contrafile'], ingredientes: [{ q: 200, un: 'g', item: 'sal grosso' }, { q: 1, un: 'colher', item: 'pimenta-do-reino' }],
      passos: ['Misture tudo.', 'Guarde em pote fechado.'], dica: 'Salgue só na hora de ir pra grelha.', tags: [] }
  ];

  function list() { return Array.isArray(window.RECEITAS) && window.RECEITAS.length ? window.RECEITAS : MOCK; }
  function get(id) { var l = list(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  function base(r) {
    if (typeof r.rende === 'number') return r.rende;
    if (r.rende && typeof r.rende === 'object') return +(r.rende.porcoes || r.rende.q || r.rende.n) || 8;
    var m = String(r.rende || '').match(/\d+/); return m ? +m[0] : 8;
  }
  /* devolve a lista de ingredientes escalada para n porções */
  function escalar(r, n) {
    if (typeof window.escalarReceita === 'function') {
      try {
        var o = window.escalarReceita(r, n);
        if (Array.isArray(o)) return o;
        if (o && Array.isArray(o.ingredientes)) return o.ingredientes;
      } catch (e) { /* cai no cálculo local */ }
    }
    var f = n / base(r);
    return (r.ingredientes || []).map(function (g) { return { q: typeof g.q === 'number' ? g.q * f : g.q, un: g.un, item: g.item, txt: g.txt }; });
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmtQ(q, un) {
    if (q == null || q === '') return un && !/^(g|ml|un|unid\.)$/.test(un) ? String(un) : 'a gosto';
    if (typeof q !== 'number') return String(q);
    var u = String(un || '').replace('colher (sopa)', 'c. sopa').replace('colher (chá)', 'c. chá');
    if (u === 'g' && q >= 1000) return (q / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' kg';
    if (u === 'ml' && q >= 1000) return (q / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' L';
    var v;
    if (/^(g|ml)$/.test(u)) v = String(Math.round(q / 5) * 5 || Math.round(q));
    else if (q < 10) {
      var w = Math.round(q * 2) / 2; if (w === 0) w = 0.5;
      v = w % 1 ? (w < 1 ? '½' : Math.floor(w) + '½') : String(w);
    } else v = String(Math.round(q));
    return v + (u && u !== 'un' && u !== 'unid.' ? ' ' + u : '');
  }
  var DIF = ['', 'fácil', 'média', 'difícil'];
  function tempo(r) { return typeof r.tempo === 'number' ? (r.tempo >= 60 ? Math.floor(r.tempo / 60) + ' h' + (r.tempo % 60 ? ' ' + r.tempo % 60 : '') : r.tempo + ' min') : (r.tempo || ''); }
  function dif(r) { return typeof r.dificuldade === 'number' ? DIF[r.dificuldade] || '' : (r.dificuldade || ''); }
  function cat1(c) { return CAT1[c] || c || ''; }
  var CAT_ICO = { farofa: 1, molho: 1, maionese: 1, acompanhamento: 1, tempero: 1 };
  function icon(c) { return '<svg class="rc-ico" viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-' + (CAT_ICO[c] ? c : 'acompanhamento') + '"/></svg>'; }

  function card(r, i, on) {
    return '<li class="rcard' + (on ? ' is-on' : '') + '" style="--i:' + i + '" data-cat="' + esc(r.categoria) + '">' +
      '<button type="button" class="rcard__b" data-receita="' + esc(r.id) + '">' +
      '<span class="rcard__ico">' + icon(r.categoria) + '</span>' +
      '<span class="rcard__txt"><span class="rcard__k">' + esc(cat1(r.categoria)) + (tempo(r) ? ' · ' + esc(tempo(r)) : '') + '</span>' +
      '<b class="rcard__n">' + esc(r.nome) + '</b><span class="rcard__d">' + esc(r.resumo || '') + '</span></span>' +
      '<span class="rcard__ok" aria-hidden="true">na lista</span></button></li>';
  }

  /* ctx: { corteNome(id) -> nome|null, naLista: bool, feitos: {idx:true} } */
  function ficha(r, n, ctx) {
    var ings = escalar(r, n), feitos = ctx.feitos || {};
    var comb = (r.combinaCom || []).map(function (id) { var nm = ctx.corteNome(id); return nm ? '<button type="button" class="chip chip--cut" data-corte="' + esc(id) + '">' + esc(nm) + '</button>' : ''; }).join('');
    return '<article class="ficha ficha--receita" data-id="' + esc(r.id) + '">' +
      '<p class="ficha__k">' + icon(r.categoria) + esc(cat1(r.categoria)) + (dif(r) ? ' · ' + esc(dif(r)) : '') + (tempo(r) ? ' · ' + esc(tempo(r)) : '') + '</p>' +
      '<h2 class="ficha__t" id="sheet-t">' + esc(r.nome) + '</h2>' +
      (r.resumo ? '<p class="ficha__d">' + esc(r.resumo) + '</p>' : '') +
      '<div class="porcoes"><span class="porcoes__l">Para <b class="odo-host" data-odo="porcoes">' + n + '</b> pessoas<small>receita original: ' + base(r) + '</small></span>' +
      '<span class="stepper stepper--sm"><button type="button" class="stepper__b" data-porc="-1" aria-label="Menos uma pessoa">−</button><button type="button" class="stepper__b" data-porc="1" aria-label="Mais uma pessoa">+</button></span></div>' +
      '<h3 class="ficha__h">Ingredientes</h3><ul class="ings" aria-live="polite">' + ings.map(function (g, i) {
        return '<li style="--i:' + i + '"><span class="ings__q">' + esc(g.txt || fmtQ(g.q, g.un)) + '</span><span class="ings__i">' + esc(g.item) + '</span></li>';
      }).join('') + '</ul>' +
      '<button type="button" class="btn btn--brasa btn--full" data-act="rc-lista" aria-pressed="' + !!ctx.naLista + '">' + (ctx.naLista ? '✓ Ingredientes na lista' : '+ Adicionar ingredientes à lista') + '</button>' +
      '<h3 class="ficha__h">Modo de fazer</h3><ol class="passos">' + (r.passos || []).map(function (p, i) {
        var t = typeof p === 'string' ? p : (p.txt || p.texto || '');
        return '<li><label class="check"><input type="checkbox" data-passo="' + i + '"' + (feitos[i] ? ' checked' : '') + '><span class="check__box" aria-hidden="true"></span><span class="check__n"><b>' + (i + 1) + '.</b> ' + esc(t) + '</span></label></li>';
      }).join('') + '</ol>' +
      (r.dica ? '<p class="dica"><span class="dica__k">Dica</span>' + esc(r.dica) + '</p>' : '') +
      (comb ? '<h3 class="ficha__h">Combina com</h3><div class="chips">' + comb + '</div>' : '') +
      '</article>';
  }

  window.ReceitasUI = { CATS: CATS, list: list, get: get, escalar: escalar, base: base, card: card, ficha: ficha, fmtQ: fmtQ, cat1: cat1, icon: icon };
})();
