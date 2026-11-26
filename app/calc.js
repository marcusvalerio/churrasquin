/* churrasquin — app/calc.js (dono: UX)
 *
 * API PÚBLICA (window.Calc)
 *   Calc.mount(el)            renderiza a calculadora dentro de el
 *   Calc.add(corteId)         adiciona corte; entra com a porção sugerida (se já existe, só re-renderiza)
 *   Calc.compute(itens, apetiteKey, opts)   PURA. opts = número (convidados, legado) ou
 *                             { adultos, criancas, precos:{id:R$/kg}, extras:{id:bool} }
 *                             -> { totalG, equivG, pessoas, por, faltaG?, porcoes, metaG, diffG,
 *                                  custo, itens:[{id,g,preco,custo}], extras:[{id,label,qtd,un,custo,on}], totalR }
 *   Calc.distribute(itens, porcoes, apetiteKey)  PURA: reparte a meta entre itens automáticos (m:false)
 *   Calc.summary()            { cortes, porcoes, adultos, criancas, pessoas, totalKg, totalR, diffG, texto }
 *                             (texto curto para a barra inferior, ex. "10 pessoas · 4,5 kg · ~R$ 300")
 *   Calc.shareText()          texto formatado da lista (WhatsApp / copiar)
 *   Calc.MIXES                perfis de sugestão { classico, economico, parrilla, gaucho }
 * EVENTO: document dispara 'calc:change' (CustomEvent, detail = Calc.summary()) a cada alteração salva.
 * localStorage 'churrasquin.calc.v1': { itens:[{id,g,u,m,w}], apetite, adultos, criancas, precos, extras }
 *   (itens[] continua sendo o array que main.js conta; m = kg ajustado à mão; w = peso no mix)
 *
 * FÓRMULAS
 *   REF = 0,72 (rendimento de um corte "médio"). APETITE.gramas = carne crua/pessoa num corte REF.
 *   porções = adultos + 0,5 × crianças            (criança come meia porção)
 *   meta (equivalente) = porções × gramas
 *   equivalente_i = g_i × rendimento_i / REF      (osso e gordura pesam menos, linguiça pesa mais)
 *   distribuição: resto = meta − Σ equiv(manuais); cada item automático recebe resto × w_i/Σw,
 *     convertido para cru: g_i = parte × REF / rendimento_i, arredondado para cima a 50 g (mín. 100 g)
 *   pessoas = floor(Σ equiv / gramas); diff = Σ equiv − meta (>0 sobra, <0 falta), em kg "médios"
 *   preço_i = preço editado pelo usuário ?? média de precoKg {min,max}; custo = Σ kg_i × preço_i
 *   Acompanhamentos por porção (só os marcados entram no total): carvão 1 kg por kg de carne crua;
 *   sal grosso 100 g; pão de alho 1 un por pessoa; farofa 60 g; vinagrete 100 g; gelo 0,7 kg; bebida 1 L.
 */
(function () {
  var REF = 0.72, KEY = 'churrasquin.calc.v1', PKEY = 'churrasquin.precos.v1';
  var DEF = { itens: [], apetite: 'confortavel', adultos: 10, criancas: 0, precos: {}, extras: null };
  var state = clone(DEF);
  var root = null;

  var MIXES = {
    classico: { label: 'Clássico', desc: 'picanha, fraldinha, linguiça, frango', w: { picanha: 3, fraldinha: 2, 'linguica-toscana': 2, 'coxa-sobrecoxa': 1.5, 'coracao-frango': 1 } },
    economico: { label: 'Econômico', desc: 'frango, linguiça, acém, costelinha', w: { 'coxa-sobrecoxa': 3, 'linguica-toscana': 2, acem: 2, 'costelinha-suina': 2, 'coracao-frango': 1 } },
    parrilla: { label: 'Parrilla', desc: 'vacío, tira de asado, entraña, chorizo', w: { vazio: 3, 'tira-de-asado': 2, entrana: 1.5, chorizo: 1.5, morcilla: 0.5 } },
    gaucho: { label: 'Gaúcho', desc: 'costela, ponta de peito, salsichão', w: { costela: 3, 'ponta-de-peito': 2, salsichao: 2, picanha: 2, 'coracao-frango': 1 } }
  };
  /* acompanhamentos: qtd por porção; preço estimado por unidade */
  var EXTRAS = [
    { id: 'carvao', label: 'Carvão', un: 'kg', porKgCarne: 1, preco: 8, on: true },
    { id: 'sal', label: 'Sal grosso', un: 'kg', por: 0.1, min: 0.5, preco: 5, on: true },
    { id: 'pao', label: 'Pão de alho', un: 'un', porPessoa: 1, preco: 4, on: true },
    { id: 'farofa', label: 'Farofa pronta', un: 'kg', por: 0.06, min: 0.25, preco: 24, on: true },
    { id: 'vinagrete', label: 'Vinagrete (tomate, cebola, pimentão)', un: 'kg', por: 0.1, min: 0.5, preco: 10, on: true },
    { id: 'gelo', label: 'Gelo', un: 'kg', por: 0.7, min: 5, preco: 3, on: false },
    { id: 'bebida', label: 'Bebida (cerveja/refri)', un: 'L', por: 1, preco: 8, on: false }
  ];

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function cortes() { return window.CORTES || []; }
  function corte(id) { return cortes().filter(function (c) { return c.id === id; })[0]; }
  function ap() { return window.APETITE || { pouco: { label: 'Comem pouco', gramas: 300 }, confortavel: { label: 'Confortável', gramas: 400 }, bem: { label: 'Bem confortável', gramas: 500 } }; }
  function rend(id) { var c = corte(id); return c && typeof c.rendimento === 'number' ? c.rendimento : REF; }
  function precoBase(id) { var c = corte(id); return c && c.precoKg ? Math.round((c.precoKg.min + c.precoKg.max) / 2) : 0; }
  function precoDe(id, precos) { var p = precos && precos[id]; return p > 0 ? p : precoBase(id); }
  function porcoesDe(a, c) { return Math.max(0, +a || 0) + 0.5 * Math.max(0, +c || 0); }
  function r50(g) { return Math.max(100, Math.ceil(g / 50 - 1e-9) * 50); }
  function roundUp(x, s) { return Math.ceil(x / s - 1e-9) * s; }

  function distribute(itens, porcoes, apKey) {
    var A = ap(), gr = (A[apKey] || A.confortavel).gramas, meta = porcoes * gr, fixo = 0, wsum = 0;
    itens.forEach(function (it) { if (it.m) fixo += it.g * rend(it.id) / REF; else wsum += it.w || 1; });
    var resto = Math.max(0, meta - fixo);
    return itens.map(function (it) {
      if (it.m || !wsum) return it;
      var o = clone(it); o.g = r50(resto * (it.w || 1) / wsum * REF / rend(it.id)); return o;
    });
  }

  function compute(itens, apKey, opts) {
    var A = ap(), crus = 0, equiv = 0, custo = 0;
    if (typeof opts !== 'object' || opts === null) opts = { convidados: opts };
    var precos = opts.precos || {};
    var linhas = itens.map(function (it) {
      var r = rend(it.id), p = precoDe(it.id, precos), cs = it.g / 1000 * p;
      crus += it.g; equiv += it.g * r / REF; custo += cs;
      return { id: it.id, g: it.g, preco: p, custo: cs };
    });
    var por = {};
    Object.keys(A).forEach(function (k) { por[k] = Math.floor(equiv / A[k].gramas + 1e-9); });
    var out = { totalG: crus, equivG: equiv, pessoas: por[apKey] || 0, por: por, itens: linhas, custo: custo };
    var n = parseInt(opts.convidados, 10);
    if (n > 0 && A[apKey]) out.faltaG = Math.max(0, Math.ceil((n * A[apKey].gramas - equiv) / 50) * 50);
    if (opts.adultos !== undefined || opts.criancas !== undefined) {
      var pc = porcoesDe(opts.adultos, opts.criancas), pessoasCab = (+opts.adultos || 0) + (+opts.criancas || 0);
      out.porcoes = pc; out.metaG = pc * (A[apKey] || A.confortavel).gramas; out.diffG = Math.round((equiv - out.metaG) / 50) * 50 || 0;
      var ex = opts.extras || {};
      out.extras = EXTRAS.map(function (e) {
        var q = e.porKgCarne ? roundUp(crus / 1000 * e.porKgCarne, 1) : e.porPessoa ? Math.ceil(pessoasCab * e.porPessoa) : roundUp(Math.max(e.min || 0, pc * e.por), e.un === 'L' ? 1 : 0.25);
        var on = ex[e.id] !== undefined ? !!ex[e.id] : e.on;
        return { id: e.id, label: e.label, qtd: q, un: e.un, custo: q * e.preco, on: on };
      });
      out.totalR = custo + out.extras.reduce(function (s, e) { return s + (e.on && out.totalG ? e.custo : 0); }, 0);
    }
    return out;
  }

  function opts() { return { adultos: state.adultos, criancas: state.criancas, precos: state.precos, extras: state.extras || {} }; }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && Array.isArray(s.itens)) {
        state = Object.assign(clone(DEF), s);
        if (s.adultos === undefined) { var n = parseInt(s.convidados, 10); state.adultos = n > 0 ? n : DEF.adultos; state.itens.forEach(function (it) { it.m = true; }); }
      }
      var pr = JSON.parse(localStorage.getItem(PKEY)); if (pr) state.precos = pr;
    } catch (e) {}
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); localStorage.setItem(PKEY, JSON.stringify(state.precos || {})); } catch (e) {}
    try { document.dispatchEvent(new CustomEvent('calc:change', { detail: summary() })); } catch (e) {}
  }
  function rebalance() { state.itens = distribute(state.itens, porcoesDe(state.adultos, state.criancas), state.apetite); }

  function num(x, d) { return x.toLocaleString('pt-BR', { minimumFractionDigits: d === undefined ? 1 : 0, maximumFractionDigits: d === undefined ? 2 : d }); }
  function kg(g) { return num(g / 1000) + ' kg'; }
  function brl(v) { return 'R$ ' + Math.round(v).toLocaleString('pt-BR'); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
  function qtdTxt(e) { return (e.un === 'un' || e.un === 'L' ? num(e.qtd, 0) : num(e.qtd)) + ' ' + e.un; }
  function pessoasTxt() {
    var a = +state.adultos || 0, c = +state.criancas || 0;
    return a + (a === 1 ? ' adulto' : ' adultos') + (c ? ' e ' + c + (c === 1 ? ' criança' : ' crianças') : '');
  }

  function summary() {
    var r = compute(state.itens, state.apetite, opts());
    var s = { cortes: state.itens.length, adultos: +state.adultos || 0, criancas: +state.criancas || 0, porcoes: r.porcoes, pessoas: r.pessoas,
      totalKg: r.totalG / 1000, totalR: Math.round(r.totalR), diffG: r.diffG };
    s.texto = state.itens.length ? (s.adultos + s.criancas) + ' pessoas · ' + kg(r.totalG) + ' · ~' + brl(r.totalR) : 'Lista vazia';
    return s;
  }

  function shareText() {
    var r = compute(state.itens, state.apetite, opts()), L = [];
    L.push('*Churrasco para ' + pessoasTxt() + '*');
    L.push('');
    L.push('*Carnes*');
    r.itens.forEach(function (x) { var c = corte(x.id); L.push('- ' + (c ? c.nome : x.id) + ': ' + kg(x.g) + (x.preco ? ' (~' + brl(x.custo) + ')' : '')); });
    L.push('Total de carne: ' + kg(r.totalG));
    var ex = r.extras.filter(function (e) { return e.on; });
    if (ex.length) { L.push(''); L.push('*Acompanhamentos*'); ex.forEach(function (e) { L.push('- ' + e.label + ': ' + qtdTxt(e)); }); }
    L.push('');
    L.push('*Total estimado: ~' + brl(r.totalR) + '* (preços de referência, confira no açougue)');
    L.push('Feito no churrasquin');
    return L.join('\n');
  }

  function injectCSS() {
    if (document.getElementById('calc-css')) return;
    var st = document.createElement('style'); st.id = 'calc-css';
    var mut = 'color-mix(in srgb,var(--c-carvao) 76%,var(--c-osso))', line = 'color-mix(in srgb,var(--c-carvao) 30%,transparent)';
    st.textContent = [
      '.calc-root{font-family:var(--font-body);font-size:1rem;line-height:1.45;color:var(--c-carvao);background:color-mix(in srgb,var(--c-osso) 45%,#fff);border:1.5px solid var(--c-carvao);border-radius:var(--r-lg);padding:1.1rem;display:grid;gap:1.1rem;box-shadow:4px 6px 0 -1px var(--c-carvao)}',
      '.calc-root *{box-sizing:border-box;min-width:0}',
      '.calc-root h3,.calc-root h4{font-family:var(--font-display);margin:0}',
      '.calc-h{display:flex;align-items:baseline;justify-content:space-between;gap:.5rem;font-size:1.25rem;font-weight:800;flex-wrap:wrap}',
      '.calc-h small,.calc-hint,.calc-item small{font:500 .875rem/1.4 var(--font-body);color:' + mut + '}',
      '.calc-hint{margin:0}',
      '.calc-root button,.calc-root input,.calc-root select,.calc-root .calc-btn{font:inherit;color:inherit;min-height:44px;min-width:44px;border-radius:var(--r-sm)}',
      '.calc-root input[type=text],.calc-root input:not([type]),.calc-root input[inputmode]{background:var(--c-osso);color:var(--c-carvao);border:1.5px solid ' + line + ';padding:0 .6rem}',
      '.calc-root :focus-visible{outline:3px solid var(--c-carvao);outline-offset:2px}',
      '.calc-sec{display:grid;gap:.6rem}',
      '.calc-ppl{display:grid;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));gap:.6rem}',
      '.calc-ppl>div{display:flex;align-items:center;justify-content:space-between;gap:.5rem;background:var(--c-osso);border:1px solid ' + line + ';border-radius:var(--r-md);padding:.4rem .4rem .4rem .8rem;font-weight:700}',
      '.calc-step{display:flex;align-items:center;gap:.25rem}',
      '.calc-num{width:3.4rem;text-align:center;font-variant-numeric:tabular-nums;font-weight:700}',
      '.calc-qty{width:4.6rem;text-align:right;font-variant-numeric:tabular-nums}',
      '.calc-btn{display:inline-flex;align-items:center;justify-content:center;gap:.4rem;background:var(--c-brasa);color:var(--c-carvao);border:1.5px solid var(--c-carvao)!important;border-radius:999px!important;padding:0 1rem;font-weight:700;cursor:pointer;text-decoration:none;box-shadow:0 2px 0 var(--c-carvao)}',
      '.calc-btn:hover{background:var(--c-brasa-2)}',
      '.calc-ghost{background:var(--c-osso);color:var(--c-carvao);border:1.5px solid ' + line + ';cursor:pointer;font-weight:600;padding:0 .7rem}',
      '.calc-ghost:hover{border-color:var(--c-carvao)}',
      '.calc-add{display:flex;gap:.5rem;flex-wrap:wrap}.calc-add input{flex:1 1 12rem;border-radius:999px!important;padding:0 1rem!important}',
      '.calc-mix{display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,1fr));gap:.5rem}',
      '.calc-mix button{text-align:left;padding:.55rem .8rem;display:grid;gap:.1rem}.calc-mix small{font-weight:500;color:' + mut + '}',
      '.calc-list{list-style:none;margin:0;padding:0;display:grid;gap:.5rem}',
      '.calc-item{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.5rem .75rem;align-items:center;background:var(--c-osso);padding:.6rem;border-radius:var(--r-md);border:1px solid color-mix(in srgb,var(--c-carvao) 12%,transparent)}',
      '.calc-item>.calc-name{grid-column:1/-1}',
      '.calc-item small{display:block}',
      '.calc-price{display:flex;align-items:center;gap:.35rem;font-size:.875rem;flex-wrap:wrap}.calc-price input{width:4.6rem;text-align:right}',
      '.calc-cost{font-weight:700;font-variant-numeric:tabular-nums}',
      '.calc-badge{display:inline-block;font-size:.8rem;font-weight:700;border:1px solid currentColor;border-radius:999px;padding:0 .5rem;margin-left:.3rem}',
      '.calc-apetite{border:0;padding:0;margin:0;display:grid;gap:.5rem}',
      '.calc-apetite legend{margin-bottom:.4rem;font-weight:700}',
      '.calc-apetite label{position:relative;display:grid;grid-template-columns:auto 1fr;align-items:baseline;gap:0 .6rem;border:1.5px solid ' + line + ';background:var(--c-osso);border-radius:var(--r-md);padding:.6rem .8rem;cursor:pointer;min-height:44px}',
      '.calc-apetite small{text-align:right;color:' + mut + ';font-size:.875rem}',
      '.calc-apetite input{position:absolute;opacity:0;width:1px;height:1px}',
      '.calc-apetite input:checked+span{font-weight:700}.calc-apetite input:checked+span::before{content:"\\2713  "}',
      '.calc-apetite label:has(input:checked){border-color:var(--c-carvao);background:var(--c-gordura);box-shadow:inset 0 0 0 1px var(--c-carvao)}',
      '.calc-apetite label:has(input:focus-visible){outline:3px solid var(--c-carvao);outline-offset:2px}',
      '.calc-result{background:var(--c-carvao);color:var(--c-osso);border-radius:var(--r-md);padding:1.1rem}',
      '.calc-result p{margin:.3rem 0}.calc-result strong{color:var(--c-gordura)}',
      '.calc-kick{font-size:.8rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--c-sal)}',
      '.calc-big{font-family:var(--font-display);font-weight:800;font-size:clamp(1.6rem,1.1rem + 2vw,2.4rem);margin:.2rem 0!important;line-height:1.1}',
      '.calc-big em{font-style:normal;color:var(--c-brasa)}',
      '.calc-note{color:var(--c-sal);font-size:.875rem}',
      '.calc-extras{list-style:none;margin:0;padding:0;display:grid;gap:.35rem}',
      '.calc-extras label{display:flex;align-items:center;gap:.6rem;min-height:44px;padding:0 .6rem;background:var(--c-osso);border-radius:var(--r-sm);cursor:pointer}',
      '.calc-extras input{width:1.25rem;height:1.25rem;min-height:0!important;min-width:0!important;accent-color:var(--c-carvao)}',
      '.calc-extras .calc-q{margin-left:auto;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}',
      '.calc-share{display:flex;gap:.5rem;flex-wrap:wrap}.calc-share>*{flex:1 1 12rem}',
      '.calc-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}',
      '@media (max-width:420px){.calc-root{padding:.75rem;gap:.9rem}}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function stepper(act, val, label) {
    return '<div class="calc-step"><button type="button" class="calc-ghost" data-act="' + act + '-dec" aria-label="Menos ' + label + '">−</button>' +
      '<input class="calc-num" inputmode="numeric" data-act="' + act + '" value="' + val + '" aria-label="' + label + '">' +
      '<button type="button" class="calc-ghost" data-act="' + act + '-inc" aria-label="Mais ' + label + '">+</button></div>';
  }

  function render() {
    if (!root) return;
    var A = ap(), r = compute(state.itens, state.apetite, opts()), vazio = !state.itens.length;
    var opts_ = cortes().map(function (c) { return '<option value="' + esc(c.nome) + '">'; }).join('');
    var lista = r.itens.map(function (x, i) {
      var it = state.itens[i], c = corte(x.id) || { nome: x.id }, base = precoBase(x.id), editado = state.precos[x.id] > 0;
      return '<li class="calc-item"><div class="calc-name"><strong>' + esc(c.nome) + '</strong>' + (it.m ? '<span class="calc-badge">ajustado</span>' : '') +
        '<small>rende ~' + Math.round(rend(x.id) * 100) + '%' + (c.pesoPeca ? ' · peça ' + esc(c.pesoPeca) : '') + '</small></div>' +
        '<div class="calc-step"><button type="button" class="calc-ghost" data-act="dec" data-i="' + i + '" aria-label="Diminuir ' + esc(c.nome) + '">−</button>' +
        '<input class="calc-qty" inputmode="decimal" data-act="qty" data-i="' + i + '" value="' + num(x.g / 1000) + '" aria-label="Quilos de ' + esc(c.nome) + '"><span aria-hidden="true">kg</span>' +
        '<button type="button" class="calc-ghost" data-act="inc" data-i="' + i + '" aria-label="Aumentar ' + esc(c.nome) + '">+</button></div>' +
        '<button type="button" class="calc-ghost" data-act="rm" data-i="' + i + '" aria-label="Remover ' + esc(c.nome) + '">Remover</button>' +
        '<div class="calc-price"><label for="calc-p' + i + '">R$/kg</label><input id="calc-p' + i + '" inputmode="decimal" data-act="preco" data-i="' + i + '" value="' + (x.preco || '') + '">' +
        '<span>' + (editado ? 'seu preço' : 'estimado') + '</span><span class="calc-cost">= ' + brl(x.custo) + '</span></div></li>';
    }).join('');
    var mixes = Object.keys(MIXES).map(function (k) { return '<button type="button" class="calc-ghost" data-act="mix" data-mix="' + k + '"><span>' + MIXES[k].label + '</span><small>' + MIXES[k].desc + '</small></button>'; }).join('');
    var radios = Object.keys(A).map(function (k) {
      return '<label><input type="radio" name="calc-ap" value="' + k + '"' + (state.apetite === k ? ' checked' : '') + '><span>' + esc(A[k].label) + '</span><small>' + A[k].gramas + ' g/pessoa</small></label>';
    }).join('');
    var d = r.diffG, dTxt = !vazio ? (Math.abs(d) < 100 ? 'Quantidade certa para a turma.' : d < 0 ? 'Falta cerca de <strong>' + kg(-d) + '</strong> de carne.' : 'Sobra cerca de <strong>' + kg(d) + '</strong> (marmita garantida).') : '';
    var extras = r.extras.map(function (e) {
      return '<li><label><input type="checkbox" data-act="extra" data-x="' + e.id + '"' + (e.on ? ' checked' : '') + '><span>' + esc(e.label) + '</span><span class="calc-q">' + qtdTxt(e) + '</span></label></li>';
    }).join('');
    var wa = 'https://wa.me/?text=' + encodeURIComponent(shareText());
    root.innerHTML =
      '<section class="calc-sec" aria-labelledby="calc-ppl-h"><h3 id="calc-ppl-h" class="calc-h">Quantas pessoas?</h3>' +
      '<div class="calc-ppl"><div><span>Adultos</span>' + stepper('ad', state.adultos, 'adultos') + '</div><div><span>Crianças</span>' + stepper('cr', state.criancas, 'crianças') + '</div></div>' +
      '<p class="calc-hint">Criança conta como meia porção de adulto.</p>' +
      '<fieldset class="calc-apetite"><legend>Quanto a turma come?</legend>' + radios + '</fieldset></section>' +
      '<section class="calc-sec" aria-labelledby="calc-l-h"><h3 id="calc-l-h" class="calc-h">Carnes <small>meta: ' + kg(r.metaG) + ' para ' + pessoasTxt() + '</small></h3>' +
      '<form class="calc-add" data-act="add"><label for="calc-busca" class="calc-sr">Adicionar corte</label><input id="calc-busca" list="calc-dl" placeholder="Busque: picanha, costela, vacío…" autocomplete="off"><datalist id="calc-dl">' + opts_ + '</datalist><button class="calc-btn" type="submit">Adicionar</button></form>' +
      (vazio ? '<p class="calc-hint">Escolha cortes no catálogo ou comece por um mix pronto. O app reparte os kg entre eles:</p><div class="calc-mix">' + mixes + '</div>'
        : '<p class="calc-hint">Os kg são repartidos sozinhos entre os cortes. Se você mudar um à mão, ele fica fixo e o resto se ajusta.</p><ul class="calc-list">' + lista + '</ul>' +
          (state.itens.some(function (it) { return it.m; }) ? '<button type="button" class="calc-ghost" data-act="auto">Repartir tudo de novo automaticamente</button>' : '')) +
      '</section>' +
      '<section class="calc-result" aria-labelledby="calc-res-h"><h3 id="calc-res-h" class="calc-kick">Resultado</h3>' +
      '<div aria-live="polite" aria-atomic="true"><p class="calc-big">' + (vazio ? 'Escolha as carnes' : 'Dá para <em>' + r.pessoas + (r.pessoas === 1 ? ' pessoa' : ' pessoas') + '</em>') + '</p>' +
      (vazio ? '' : '<p>' + dTxt + '</p><p>Carne crua: <strong>' + kg(r.totalG) + '</strong> · carne ~' + brl(r.custo) + '</p><p>Total estimado: <strong>~' + brl(r.totalR) + '</strong></p>') + '</div>' +
      '<p class="calc-note">"Pessoas" em porções de adulto. Considera o rendimento de cada corte. Preços são referências aproximadas: edite com o do seu açougue.</p></section>' +
      '<section class="calc-sec" aria-labelledby="calc-x-h"><h3 id="calc-x-h" class="calc-h">Lista de compras <small>marque o que vai levar</small></h3><ul class="calc-extras">' + extras + '</ul></section>' +
      (vazio ? '' : '<div class="calc-share"><a class="calc-btn" data-act="wa" href="' + wa + '" target="_blank" rel="noopener">Enviar no WhatsApp</a><button type="button" class="calc-ghost" data-act="copy">Copiar lista</button></div><p class="calc-sr" role="status" id="calc-st"></p>');
  }

  function parseNum(v) { var n = parseFloat(String(v).replace(/\./g, '').replace(',', '.')); return isFinite(n) ? n : NaN; }
  function parseKg(v) { var n = parseFloat(String(v).replace(',', '.')); return n > 0 ? Math.round(n * 1000) : 0; }
  function refocus(sel) { var f = root.querySelector(sel); if (f) f.focus(); }
  function commit(sel, re) { if (re) rebalance(); save(); render(); if (sel) refocus(sel); }

  function copy(txt) {
    var st = root.querySelector('#calc-st');
    function ok() { if (st) st.textContent = 'Lista copiada.'; var b = root.querySelector('[data-act="copy"]'); if (b) { b.textContent = 'Copiado ✓'; setTimeout(function () { b.textContent = 'Copiar lista'; }, 1600); } }
    function fb() { var t = document.createElement('textarea'); t.value = txt; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); ok(); } catch (e) {} document.body.removeChild(t); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, fb); else fb();
  }

  function onEvent(e) {
    var t = e.target.closest ? e.target.closest('[data-act],[name="calc-ap"]') || e.target : e.target;
    var act = t.getAttribute && t.getAttribute('data-act'), i = +t.getAttribute('data-i'), it = state.itens[i];
    if (e.type === 'submit') {
      e.preventDefault();
      var q = root.querySelector('#calc-busca').value.trim().toLowerCase();
      var c = cortes().filter(function (c) { return c.nome.toLowerCase() === q; })[0] || (q && cortes().filter(function (c) { return (c.nome + ' ' + JSON.stringify(c.nomes || {})).toLowerCase().indexOf(q) >= 0; })[0]);
      if (c) { Calc.add(c.id); refocus('#calc-busca'); }
      return;
    }
    if (e.type === 'click') {
      if (act === 'ad-inc' || act === 'ad-dec') { state.adultos = Math.max(0, (+state.adultos || 0) + (act === 'ad-inc' ? 1 : -1)); return commit('[data-act="' + act + '"]', true); }
      if (act === 'cr-inc' || act === 'cr-dec') { state.criancas = Math.max(0, (+state.criancas || 0) + (act === 'cr-inc' ? 1 : -1)); return commit('[data-act="' + act + '"]', true); }
      if (act === 'inc' || act === 'dec') { it.g = act === 'inc' ? it.g + 250 : Math.max(250, it.g - 250); it.m = true; return commit('[data-act="' + act + '"][data-i="' + i + '"]', true); }
      if (act === 'rm') { state.itens.splice(i, 1); return commit('#calc-busca', true); }
      if (act === 'auto') { state.itens.forEach(function (x) { x.m = false; }); return commit('#calc-l-h', true); }
      if (act === 'mix') { var w = MIXES[t.getAttribute('data-mix')].w; state.itens = Object.keys(w).filter(corte).map(function (id) { return { id: id, g: 0, u: 'kg', m: false, w: w[id] }; }); return commit('.calc-qty', true); }
      if (act === 'copy') { copy(shareText()); return; }
      return;
    }
    if (e.type === 'change') {
      if (t.name === 'calc-ap') { state.apetite = t.value; return commit('input[name="calc-ap"][value="' + t.value + '"]', true); }
      if (act === 'ad' || act === 'cr') { var n = Math.max(0, Math.min(500, Math.round(parseNum(t.value)) || 0)); if (act === 'ad') state.adultos = n; else state.criancas = n; return commit('[data-act="' + act + '"]', true); }
      if (act === 'qty') { var g = parseKg(t.value); if (g) { it.g = g; it.m = true; } return commit('[data-act="qty"][data-i="' + i + '"]', true); }
      if (act === 'preco') { var p = parseFloat(String(t.value).replace(',', '.')); if (p > 0) state.precos[it.id] = Math.round(p * 100) / 100; else delete state.precos[it.id]; return commit('#' + t.id, false); }
      if (act === 'extra') { state.extras = state.extras || {}; state.extras[t.getAttribute('data-x')] = t.checked; return commit('[data-x="' + t.getAttribute('data-x') + '"]', false); }
    }
  }

  var Calc = {
    compute: compute, distribute: distribute, summary: summary, shareText: shareText, MIXES: MIXES, EXTRAS: EXTRAS,
    mount: function (el) {
      root = el; root.classList.add('calc-root'); injectCSS(); load();
      ['click', 'change', 'submit'].forEach(function (ev) { root.addEventListener(ev, onEvent); });
      render();
    },
    add: function (id) {
      if (!corte(id)) return;
      if (!root) load();
      if (!state.itens.some(function (it) { return it.id === id; })) { state.itens.push({ id: id, g: 0, u: 'kg', m: false, w: 1 }); rebalance(); }
      save(); render();
    }
  };
  window.Calc = Calc;
})();
