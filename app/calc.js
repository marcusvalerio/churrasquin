/* churrasquin — app/calc.js (dono: UX)
 * API: window.Calc.mount(el), window.Calc.add(corteId), window.Calc.compute(itens, apetiteKey) (pura, testável)
 * Classes (todas com prefixo .calc-, estilos injetados abaixo, só tokens do contrato):
 *   .calc-root .calc-add .calc-list .calc-item .calc-step .calc-qty .calc-unit .calc-remove
 *   .calc-apetite .calc-result .calc-big .calc-trio .calc-inverse .calc-empty
 *
 * FÓRMULA: APETITE.gramas é carne crua por pessoa assumindo um corte "médio" (rendimento REF=0,72).
 *   equivalente_i = gramas_crus_i * rendimento_i / REF   (osso/gordura pesam menos; linguiça pesa mais)
 *   pessoas = floor( Σ equivalente_i / APETITE[ap].gramas )
 *   inverso: falta_crua = max(0, N * gramas - Σ equivalente_i), em corte de rendimento médio.
 */
(function () {
  var REF = 0.72, KEY = 'churrasquin.calc.v1';
  var state = { itens: [], apetite: 'confortavel', convidados: '' };
  var root = null;

  function cortes() { return window.CORTES || []; }
  function corte(id) { return cortes().filter(function (c) { return c.id === id; })[0]; }
  function ap() { return window.APETITE || { pouco: { label: 'Comem pouco', gramas: 300 }, confortavel: { label: 'Confortável', gramas: 400 }, bem: { label: 'Bem confortável', gramas: 500 } }; }

  function compute(itens, apKey, convidados) {
    var A = ap(), crus = 0, equiv = 0;
    itens.forEach(function (it) {
      var c = corte(it.id), r = c && typeof c.rendimento === 'number' ? c.rendimento : REF;
      crus += it.g; equiv += it.g * r / REF;
    });
    var por = {};
    Object.keys(A).forEach(function (k) { por[k] = Math.floor(equiv / A[k].gramas + 1e-9); });
    var out = { totalG: crus, equivG: equiv, pessoas: por[apKey] || 0, por: por };
    var n = parseInt(convidados, 10);
    if (n > 0 && A[apKey]) out.faltaG = Math.max(0, Math.ceil((n * A[apKey].gramas - equiv) / 50) * 50);
    return out;
  }

  function load() { try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && Array.isArray(s.itens)) state = s; } catch (e) {} }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function kg(g) { return (g / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + ' kg'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }

  function injectCSS() {
    if (document.getElementById('calc-css')) return;
    var st = document.createElement('style'); st.id = 'calc-css';
    st.textContent = [
      '.calc-root{font-family:var(--font-body);color:var(--c-osso);background:var(--c-carvao-2);border-radius:var(--r-lg);padding:1rem;display:grid;gap:1rem}',
      '.calc-root h2,.calc-root h3{font-family:var(--font-display);margin:0}',
      '.calc-root button,.calc-root input,.calc-root select{font:inherit;min-height:44px;min-width:44px;border-radius:var(--r-sm)}',
      '.calc-root input,.calc-root select{background:var(--c-carvao);color:var(--c-osso);border:1px solid var(--c-sal);padding:0 .6rem}',
      '.calc-root :focus-visible{outline:3px solid var(--c-gordura);outline-offset:2px}',
      '.calc-add{display:flex;gap:.5rem;flex-wrap:wrap}.calc-add input{flex:1 1 12rem}',
      '.calc-btn{background:var(--c-brasa);color:var(--c-osso);border:0;padding:0 1rem;font-weight:700;cursor:pointer;transition:background var(--dur-1) var(--ease-brasa)}',
      '.calc-btn:hover{background:var(--c-brasa-2)}',
      '.calc-ghost{background:transparent;color:var(--c-osso);border:1px solid var(--c-sal);cursor:pointer}',
      '.calc-list{list-style:none;margin:0;padding:0;display:grid;gap:.5rem}',
      '.calc-item{display:grid;grid-template-columns:1fr auto;gap:.5rem;align-items:center;background:var(--c-carvao);padding:.5rem;border-radius:var(--r-md)}',
      '.calc-item>div:first-child{grid-column:1/-1;min-width:0}',
      '.calc-item small{display:block;color:var(--c-sal)}',
      '.calc-step{display:flex;align-items:center;gap:.25rem}.calc-qty{width:5.5rem;text-align:right}',
      '.calc-unit{min-width:4.5rem}',
      '.calc-apetite{border:0;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(8rem,1fr));gap:.5rem}',
      '.calc-apetite legend{margin-bottom:.5rem;font-weight:700}',
      '.calc-apetite label{display:block;border:2px solid var(--c-sal);border-radius:var(--r-md);padding:.6rem;cursor:pointer;min-height:44px}',
      '.calc-apetite input{position:absolute;opacity:0;width:1px;height:1px}',
      '.calc-apetite input:checked+span{font-weight:700}',
      '.calc-apetite input:checked+span::before{content:"\\2713  "}',
      '.calc-apetite label:has(input:checked){border-color:var(--c-brasa)}',
      '.calc-apetite label:has(input:focus-visible){outline:3px solid var(--c-gordura)}',
      '.calc-result{background:var(--c-carvao);border-radius:var(--r-md);padding:1rem}',
      '.calc-big{font-family:var(--font-display);font-size:clamp(1.8rem,6vw,2.6rem);margin:0;line-height:1.1}',
      '.calc-trio{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin:.75rem 0 0;padding:0;list-style:none;text-align:center}',
      '.calc-trio li{border:1px solid var(--c-sal);border-radius:var(--r-sm);padding:.4rem}',
      '.calc-trio li[aria-current]{border:2px solid var(--c-brasa);font-weight:700}',
      '.calc-trio b{display:block;font-size:1.4rem}',
      '.calc-empty{color:var(--c-sal);margin:0}',
      '.calc-inverse{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}',
      '.calc-note{color:var(--c-sal);font-size:.9rem;margin:.5rem 0 0}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function render() {
    if (!root) return;
    var A = ap(), r = compute(state.itens, state.apetite, state.convidados), vazio = !state.itens.length;
    var opts = cortes().map(function (c) { return '<option value="' + esc(c.nome) + '">'; }).join('');
    var lista = state.itens.map(function (it, i) {
      var c = corte(it.id) || { nome: it.id }, unit = it.u || 'kg', val = unit === 'kg' ? it.g / 1000 : it.g;
      return '<li class="calc-item"><div><strong>' + esc(c.nome) + '</strong><small>' + (c.pesoPeca ? 'Peça: ' + esc(c.pesoPeca) + ' · ' : '') + 'rende ~' + Math.round((c.rendimento || REF) * 100) + '%</small></div>' +
        '<div class="calc-step"><button type="button" class="calc-ghost" data-act="dec" data-i="' + i + '" aria-label="Diminuir ' + esc(c.nome) + '">−</button>' +
        '<input class="calc-qty" inputmode="decimal" data-act="qty" data-i="' + i + '" value="' + String(val).replace('.', ',') + '" aria-label="Quantidade de ' + esc(c.nome) + '">' +
        '<select class="calc-unit" data-act="unit" data-i="' + i + '" aria-label="Unidade"><option value="kg"' + (unit === 'kg' ? ' selected' : '') + '>kg</option><option value="g"' + (unit === 'g' ? ' selected' : '') + '>g</option></select>' +
        '<button type="button" class="calc-ghost" data-act="inc" data-i="' + i + '" aria-label="Aumentar ' + esc(c.nome) + '">+</button></div>' +
        '<button type="button" class="calc-ghost calc-remove" data-act="rm" data-i="' + i + '" aria-label="Remover ' + esc(c.nome) + '">Remover</button></li>';
    }).join('');
    var radios = Object.keys(A).map(function (k) {
      return '<label><input type="radio" name="calc-ap" value="' + k + '"' + (state.apetite === k ? ' checked' : '') + '><span>' + esc(A[k].label) + '</span><br><small>' + A[k].gramas + ' g crus/pessoa' + (A[k].desc ? ' · ' + esc(A[k].desc) : '') + '</small></label>';
    }).join('');
    var trio = Object.keys(A).map(function (k) {
      return '<li' + (k === state.apetite ? ' aria-current="true"' : '') + '><b>' + r.por[k] + '</b>' + esc(A[k].label) + '</li>';
    }).join('');
    var inv = '';
    if (r.faltaG !== undefined) inv = r.faltaG > 0 ? 'Para ' + parseInt(state.convidados, 10) + ' pessoas falta cerca de <strong>' + kg(r.faltaG) + '</strong> de carne crua (corte de rendimento médio, ex. alcatra ou fraldinha).' : 'Para ' + parseInt(state.convidados, 10) + ' pessoas já está coberto. ✓';
    root.innerHTML = '<h2>Calculadora</h2>' +
      '<form class="calc-add" data-act="add"><label for="calc-busca" class="calc-sr">Adicionar corte</label><input id="calc-busca" list="calc-dl" placeholder="Busque: picanha, costela, vazio…" autocomplete="off"><datalist id="calc-dl">' + opts + '</datalist><button class="calc-btn" type="submit">+ Adicionar</button></form>' +
      (vazio ? '<p class="calc-empty">Lista vazia. Comece pelo clássico: 1 picanha (~1,2 kg) rende umas 3 pessoas. Busque acima ou toque em "+ levar" num corte do catálogo.</p> <button type="button" class="calc-ghost" data-act="sugestao">Montar sugestão para 10 pessoas</button>' : '<ul class="calc-list">' + lista + '</ul>') +
      '<fieldset class="calc-apetite"><legend>Quanto a turma come?</legend>' + radios + '</fieldset>' +
      '<section class="calc-result" aria-labelledby="calc-res-h"><h3 id="calc-res-h" class="calc-sr">Resultado</h3>' +
      '<div aria-live="polite" aria-atomic="true"><p class="calc-big">' + (vazio ? 'Adicione carne para calcular' : 'Dá para ' + r.pessoas + (r.pessoas === 1 ? ' pessoa' : ' pessoas')) + '</p>' +
      '<p>Total cru: <strong>' + kg(r.totalG) + '</strong></p><p class="calc-inv">' + inv + '</p></div>' +
      '<ul class="calc-trio" aria-label="Pessoas por apetite">' + trio + '</ul>' +
      '<p class="calc-note">Considera o rendimento de cada corte (osso, capa de gordura e perda na brasa). É estimativa de bolso.</p></section>' +
      '<div class="calc-inverse"><label for="calc-n">Vou receber</label><input id="calc-n" type="number" min="1" inputmode="numeric" style="width:6rem" data-act="conv" value="' + esc(state.convidados) + '"><span>pessoas</span></div>';
    if (!document.getElementById('calc-sr-css')) { var s = document.createElement('style'); s.id = 'calc-sr-css'; s.textContent = '.calc-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}'; document.head.appendChild(s); }
  }

  function parseQty(v, unit) { var n = parseFloat(String(v).replace(',', '.')); if (!(n > 0)) return 0; return Math.round(unit === 'kg' ? n * 1000 : n); }
  function step(it) { return it.u === 'g' ? 100 : 250; }

  function onEvent(e) {
    var t = e.target, act = t.getAttribute && t.getAttribute('data-act'), i = +t.getAttribute('data-i'), it = state.itens[i];
    if (e.type === 'submit') {
      e.preventDefault();
      var q = root.querySelector('#calc-busca').value.trim().toLowerCase();
      var c = cortes().filter(function (c) { return c.nome.toLowerCase() === q; })[0] || cortes().filter(function (c) { return (c.nome + ' ' + JSON.stringify(c.nomes || {})).toLowerCase().indexOf(q) >= 0 && q; })[0];
      if (c) { Calc.add(c.id); root.querySelector('#calc-busca').focus(); }
      return;
    }
    if (e.type === 'click') {
      if (act === 'inc') it.g += step(it);
      else if (act === 'dec') it.g = Math.max(step(it), it.g - step(it));
      else if (act === 'rm') { state.itens.splice(i, 1); save(); render(); var b = root.querySelector('#calc-busca'); if (b) b.focus(); return; }
      else if (act === 'sugestao') { state.itens = [{ id: 'picanha', g: 1500, u: 'kg' }, { id: 'fraldinha', g: 1000, u: 'kg' }, { id: 'linguica-toscana', g: 1000, u: 'kg' }, { id: 'coxa-sobrecoxa', g: 1000, u: 'kg' }]; state.convidados = '10'; }
      else return;
      save(); render(); var f = root.querySelector('[data-act="' + act + '"][data-i="' + i + '"]'); if (f) f.focus(); return;
    }
    if (e.type === 'change') {
      if (t.name === 'calc-ap') state.apetite = t.value;
      else if (act === 'unit') it.u = t.value;
      else if (act === 'qty') { var g = parseQty(t.value, it.u || 'kg'); if (g) it.g = g; }
      else if (act === 'conv') state.convidados = t.value;
      else return;
      save(); render(); var f2 = t.name === 'calc-ap' ? root.querySelector('input[value="' + t.value + '"]') : root.querySelector(act === 'conv' ? '#calc-n' : '[data-act="' + act + '"][data-i="' + i + '"]'); if (f2) f2.focus();
    }
  }

  var Calc = {
    compute: compute,
    mount: function (el) {
      root = el; root.classList.add('calc-root'); injectCSS(); load();
      ['click', 'change', 'submit'].forEach(function (ev) { root.addEventListener(ev, onEvent); });
      render();
    },
    add: function (id) {
      var c = corte(id); if (!c) return;
      if (!root) load();
      var ex = state.itens.filter(function (it) { return it.id === id; })[0];
      if (ex) ex.g += 500; else state.itens.push({ id: id, g: 1000, u: 'kg' });
      save(); render();
    }
  };
  window.Calc = Calc;
})();
