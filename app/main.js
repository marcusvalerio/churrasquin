/* churrasquin — catálogo, filtros, integração com Animal e Calc */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var PAISES = [['', 'Todos'], ['BR', 'Brasil'], ['AR', 'Argentina'], ['UY', 'Uruguai'], ['US', 'EUA']];
  var LBL = { ar: 'AR', uy: 'UY', us: 'US' };
  var state = { q: '', pais: '', animal: '', cat: '', sort: '' };
  var added = 0;

  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function dots(n) { var o = ''; for (var i = 1; i <= 5; i++) o += '<i class="' + (i <= n ? 'on' : '') + '"></i>'; return '<span class="dots" aria-hidden="true">' + o + '</span>'; }

  function cards(list) {
    return list.map(function (c) {
      var alt = Object.keys(c.nomes || {}).filter(function (k) { return c.nomes[k]; })
        .map(function (k) { return '<b>' + LBL[k] + '</b>' + esc(c.nomes[k]); }).join(' · ');
      var art = (window.CUT_ART && window.CUT_ART[c.id]) || '<div class="card__ph">ilustração em breve</div>';
      return '<li class="card" data-id="' + esc(c.id) + '">' +
        '<div class="card__art">' + art + '</div>' +
        '<div class="card__flags">' + (c.paises || []).map(function (p) { return '<span>' + p + '</span>'; }).join('') + '</div>' +
        '<button type="button" class="card__info" data-act="info" aria-label="Saiba de onde vem a ' + esc(c.nome) + '">i</button>' +
        '<div class="card__body"><h3>' + esc(c.nome) + '</h3>' +
        (alt ? '<p class="card__alt">' + alt + '</p>' : '') +
        '<div class="meters">' +
        '<span class="chip chip--maciez" title="Maciez ' + c.maciez + ' de 5"><span class="lbl">Maciez</span>' + dots(c.maciez) + '<span class="sr">' + c.maciez + ' de 5</span></span>' +
        '<span class="chip chip--gordura" title="Gordura ' + c.gordura + ' de 5"><span class="lbl">Gordura</span>' + dots(c.gordura) + '<span class="sr">' + c.gordura + ' de 5</span></span>' +
        '</div>' +
        '<button type="button" class="btn btn--primary card__add" data-act="add" aria-label="Levar ' + esc(c.nome) + '">+ levar</button>' +
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
    var v = $('#dock-v'), C = window.Calc, s = null;
    try {
      var st = JSON.parse(localStorage.getItem('churrasquin.calc.v1') || 'null');
      if (C && typeof C.compute === 'function' && st && Array.isArray(st.itens) && st.itens.length) s = C.compute(st.itens, st.apetite || 'confortavel', st.convidados);
    } catch (e) { s = null; }
    if (s && s.totalG != null) v.textContent = (s.totalG / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' kg · ' + (s.pessoas || 0) + (s.pessoas === 1 ? ' pessoa' : ' pessoas');
    else v.textContent = added ? added + (added > 1 ? ' cortes' : ' corte') : 'vazia';
  }

  function onAdd(btn, id, c) {
    if (window.Calc && typeof window.Calc.add === 'function') window.Calc.add(id);
    added++;
    btn.classList.add('is-added'); btn.textContent = '✓ na lista';
    setTimeout(function () { btn.classList.remove('is-added'); btn.textContent = '+ levar'; }, 1400);
    toast((c ? c.nome : id) + ' adicionada à lista');
    var d = $('#dock'); d.classList.remove('bump'); void d.offsetWidth; d.classList.add('bump');
    setTimeout(updateDock, 0);
  }

  function init() {
    var seg = $('#f-pais');
    seg.innerHTML += PAISES.map(function (p) { return '<button type="button" data-v="' + p[0] + '" aria-pressed="' + (p[0] === '' ) + '">' + p[1] + '</button>'; }).join('');
    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      state.pais = b.dataset.v;
      seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      render();
    });
    var qT; $('#q').addEventListener('input', function (e) { clearTimeout(qT); qT = setTimeout(function () { state.q = e.target.value; render(); }, 120); });
    $('#f-animal').addEventListener('change', function (e) { state.animal = e.target.value; render(); });
    $('#f-cat').addEventListener('change', function (e) { state.cat = e.target.value; render(); });
    $('#f-sort').addEventListener('change', function (e) { state.sort = e.target.value; render(); });
    $('#clear').addEventListener('click', function () {
      state = { q: '', pais: '', animal: '', cat: '', sort: '' };
      $('#filters').reset(); seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.v === ''); });
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

    $('#dock').addEventListener('click', function () { setTimeout(function () { $('#calculadora').focus({ preventScroll: true }); }, 400); });

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
