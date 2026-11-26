/* churrasquin — catálogo, filtros, integração com Animal e Calc */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var ICO = 'brand/v3/icons/';
  var PAISES = [['', 'Todos'], ['BR', 'Brasil'], ['AR', 'Argentina'], ['UY', 'Uruguai'], ['US', 'EUA']];
  var PAIS_NOME = { BR: 'Brasil', AR: 'Argentina', UY: 'Uruguai', US: 'EUA' };
  var ANIMAIS = [['', 'Todos'], ['boi', 'Boi'], ['porco', 'Porco'], ['cordeiro', 'Cordeiro'], ['frango', 'Frango']];
  var CAT = { nobre: 'Nobre', tradicional: 'Tradicional', steak: 'Steak', popular: 'Popular', miudo: 'Miúdo' };
  var LBL = { ar: 'AR', uy: 'UY', us: 'US' };
  function ico(name, cls) { return '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="' + ICO + name + '.svg" alt="" width="20" height="20">'; }
  var state = { q: '', pais: '', animal: '', cat: '', sort: '' };
  var added = 0;

  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function meter(k, label, n) {
    return '<div class="meter meter--' + k + '">' + ico(k) + '<dt>' + label + '</dt><dd>' + dots(n) + '<span class="sr">' + n + ' de 5</span></dd></div>';
  }
  function dots(n) { var o = ''; for (var i = 1; i <= 5; i++) o += '<i class="' + (i <= n ? 'on' : '') + '"></i>'; return '<span class="dots" aria-hidden="true">' + o + '</span>'; }

  function cards(list) {
    return list.map(function (c) {
      var alt = Object.keys(c.nomes || {}).filter(function (k) { return c.nomes[k]; })
        .map(function (k) { return '<b>' + LBL[k] + '</b>' + esc(c.nomes[k]); }).join(' · ');
      var art = (window.CUT_ART && window.CUT_ART[c.id]) || '<div class="card__ph">ilustração em breve</div>';
      return '<li class="card" data-id="' + esc(c.id) + '">' +
        '<div class="card__art" aria-hidden="true">' + art + '</div>' +
        '<ul class="card__flags" aria-label="Servido em">' + (c.paises || []).map(function (p) { return '<li title="' + PAIS_NOME[p] + '"><img src="' + ICO + 'pais-' + p.toLowerCase() + '.svg" alt="' + PAIS_NOME[p] + '" width="20" height="20"></li>'; }).join('') + '</ul>' +
        '<button type="button" class="card__info" data-act="info" aria-label="Saiba de onde vem a ' + esc(c.nome) + '">' + ico('info') + '</button>' +
        '<div class="card__body"><p class="card__tag">' + ico(c.animal) + esc((ANIMAIS.filter(function (a) { return a[0] === c.animal; })[0] || ['', ''])[1]) + (CAT[c.categoria] ? ' · ' + CAT[c.categoria] : '') + '</p><h3>' + esc(c.nome) + '</h3>' +
        (alt ? '<p class="card__alt">' + alt + '</p>' : '') +
        '<dl class="meters">' + meter('maciez', 'Maciez', c.maciez) + meter('gordura', 'Gordura', c.gordura) + meter('sabor', 'Sabor', c.sabor) + '</dl>' +
        '<button type="button" class="btn btn--primary card__add" data-act="add" aria-label="Levar ' + esc(c.nome) + '"><span class="btn__ico">' + ico('adicionar') + '</span><span class="btn__t">levar</span></button>' +
        '</div></li>';
    }).join('');
  }

  function filtered() {
    var q = norm(state.q).trim();
    var list = (window.CORTES || []).filter(function (c) {
      if (state.pais && (c.paises || []).indexOf(state.pais) < 0) return false;
      if (state.animal && c.animal !== state.animal) return false;
      if (state.cat && c.categoria !== state.cat) return false;
      if (q) {
        var hay = norm([c.nome, c.id].concat(Object.values(c.nomes || {})).join(' '));
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    if (state.sort === 'maciez-desc') list.sort(function (a, b) { return b.maciez - a.maciez || a.nome.localeCompare(b.nome); });
    if (state.sort === 'maciez-asc') list.sort(function (a, b) { return a.maciez - b.maciez || a.nome.localeCompare(b.nome); });
    if (state.sort === 'nome') list.sort(function (a, b) { return a.nome.localeCompare(b.nome, 'pt'); });
    return list;
  }

  function render() {
    var grid = $('#grid'), list = filtered(), total = (window.CORTES || []).length;
    grid.innerHTML = cards(list);
    $('#empty').hidden = list.length > 0;
    grid.hidden = list.length === 0;
    $('#count').textContent = list.length === total ? total + ' cortes' : list.length + ' de ' + total + ' cortes';
  }

  var toastT;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 1800);
  }

  function updateDock() {
    var n = 0;
    try {
      var st = JSON.parse(localStorage.getItem('churrasquin.calc.v1') || 'null');
      if (st && Array.isArray(st.itens)) n = st.itens.length;
    } catch (e) { n = added; }
    document.querySelectorAll('.tab__n').forEach(function (b) { b.textContent = n; b.setAttribute('data-n', n); });
    var sr = $('#tab-n-sr'); if (sr) sr.textContent = n ? ', ' + n + (n > 1 ? ' cortes na lista' : ' corte na lista') : ', lista vazia';
  }

  /* abas: no celular alternam a vista; no desktop (duas colunas) só rolam e marcam a seção */
  var mqDesk = window.matchMedia('(min-width:1024px)');
  function setView(v, scroll) {
    document.body.setAttribute('data-view', v);
    document.querySelectorAll('.tab[data-view]').forEach(function (t) { if (t.dataset.view === v) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
    if (scroll === false) return;
    if (!mqDesk.matches) window.scrollTo(0, 0);
    var target = v === 'calc' ? $('#calculadora') : $('#catalogo');
    if (mqDesk.matches) target.scrollIntoView({ block: 'start' });
    target.focus({ preventScroll: true });
  }

  function onAdd(btn, id, c) {
    if (window.Calc && typeof window.Calc.add === 'function') window.Calc.add(id);
    added++;
    var t = btn.querySelector('.btn__t');
    btn.classList.add('is-added'); t.textContent = 'na lista ✓';
    clearTimeout(btn._t); btn._t = setTimeout(function () { btn.classList.remove('is-added'); t.textContent = 'levar'; }, 1400);
    toast((c ? c.nome : id) + ' foi para a lista');
    var d = $('#tabbar'); d.classList.remove('bump'); void d.offsetWidth; d.classList.add('bump');
    setTimeout(updateDock, 0);
  }

  function init() {
    var seg = $('#f-pais');
    seg.innerHTML += PAISES.map(function (p) { return '<button type="button" class="' + (p[0] ? '' : 'noicon') + '" data-v="' + p[0] + '" aria-pressed="' + (p[0] === '') + '">' + (p[0] ? ico('pais-' + p[0].toLowerCase()) : '') + p[1] + '</button>'; }).join('');
    var segA = $('#f-animal');
    segA.innerHTML += ANIMAIS.map(function (p) { return '<button type="button" class="' + (p[0] ? '' : 'noicon') + '" data-v="' + p[0] + '" aria-pressed="' + (p[0] === '') + '">' + (p[0] ? ico(p[0]) : '') + p[1] + '</button>'; }).join('');
    segA.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      state.animal = b.dataset.v;
      segA.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      render();
    });
    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      state.pais = b.dataset.v;
      seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      render();
    });
    var qT; $('#q').addEventListener('input', function (e) { clearTimeout(qT); qT = setTimeout(function () { state.q = e.target.value; render(); }, 120); });
    $('#f-cat').addEventListener('change', function (e) { state.cat = e.target.value; render(); });
    $('#f-sort').addEventListener('change', function (e) { state.sort = e.target.value; render(); });
    $('#clear').addEventListener('click', function () {
      state = { q: '', pais: '', animal: '', cat: '', sort: '' };
      $('#filters').reset(); [seg, segA].forEach(function (g) { g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.v === ''); }); });
      render(); $('#q').focus();
    });

    $('#grid').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-act]'); if (!b) return;
      var id = b.closest('.card').dataset.id;
      var c = (window.CORTES || []).find(function (x) { return x.id === id; });
      if (b.dataset.act === 'info') {
        if (window.Animal && typeof window.Animal.open === 'function') window.Animal.open(id);
        else toast('Mapa do animal indisponível no momento');
      } else onAdd(b, id, c);
    });

    document.querySelectorAll('.tab[data-view]').forEach(function (t) {
      t.addEventListener('click', function (e) { e.preventDefault(); setView(t.dataset.view); history.replaceState(null, '', t.getAttribute('href')); });
    });
    setView(location.hash === '#calculadora' ? 'calc' : 'cortes', false);

    if (!Array.isArray(window.CORTES)) {
      $('#grid').innerHTML = '<li class="error" style="grid-column:1/-1">Não conseguimos carregar os cortes. Recarregue a página.</li>';
      $('#count').textContent = '';
    } else render();

    var mount = $('#calc-mount');
    if (window.Calc && typeof window.Calc.mount === 'function') { mount.innerHTML = ''; window.Calc.mount(mount); }
    else mount.innerHTML = '<p class="muted">A calculadora não carregou. Os cortes continuam disponíveis no catálogo.</p>';

    // mantém a barra inferior em dia mesmo com mudanças feitas dentro da calculadora
    ['click', 'input', 'change'].forEach(function (ev) { mount.addEventListener(ev, function () { setTimeout(updateDock, 0); }); });
    document.addEventListener('calc:change', updateDock);
    updateDock();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
