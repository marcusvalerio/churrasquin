/* churrasquin — app/animal.js (dono: motion designer)
 * window.Animal.open(corteId) / window.Animal.close()
 * Modal "de onde vem": animal inteiro -> região acende -> câmera aproxima -> painel explica.
 * Só transform e opacity animam. Sem animação (prefers-reduced-motion, também lido via matchMedia)
 * o estado final aparece direto e tudo continua legível.
 */
(function () {
  'use strict';

  /* ---------- Silhuetas (viewBox 0 0 600 360, perfil, cabeça à esquerda) ----------
   * Regiões compartilham vértices: as bordas internas são retas comuns às duas peças,
   * só o contorno externo é curvo. Assim encaixam sem buracos. [id, d, rótuloX, rótuloY] */
  var ANIMAIS = {
    boi: {
      nome: 'boi',
      deco: [
        // cabeça, chifre, orelha
        'M112,96 Q95,82 78,90 Q60,100 42,140 Q34,160 46,172 Q62,182 90,178 Q108,184 122,190 Q112,140 110,95 Z',
        'M98,88 Q98,64 120,56 Q108,72 108,90 Z',
        'M92,94 Q68,80 64,98 Q80,104 96,102 Z'
      ],
      dark: [
        'M222,335 L250,335 L251,346 L220,346 Z', 'M530,335 L556,335 L557,346 L528,346 Z',
        'M575,100 Q598,130 592,214 L600,236 L584,236 L588,214 Q592,140 572,108 Z'
      ],
      eye: [80, 118],
      regioes: [
        ['musculo', 'M192,248 L262,262 L250,335 L222,335 L208,290 Z M500,245 L540,250 L560,270 L556,335 L530,335 L514,282 Z', 234, 305],
        ['pescoco', 'M110,95 L165,85 L167,105 L171,150 L176,205 Q150,200 120,190 Q112,140 110,95 Z', 142, 148],
        ['cupim', 'M165,85 Q200,40 245,78 L240,102 L167,105 Z', 205, 88],
        ['acem', 'M245,78 Q268,84 290,82 L292,125 L292,150 L171,150 L167,105 L240,102 Z', 232, 130],
        ['paleta', 'M171,150 L292,150 L290,205 L176,205 Z', 232, 181],
        ['peito', 'M176,205 L290,205 L290,262 Q230,264 185,252 Q172,232 176,205 Z', 234, 238],
        ['costela', 'M292,125 L420,125 L420,150 L420,200 L290,205 L292,150 Z', 356, 168],
        ['ponta-de-agulha', 'M290,205 L420,200 L420,268 Q350,268 290,262 Z', 355, 238],
        ['contrafile', 'M290,82 Q355,88 420,86 L420,125 L292,125 Z', 356, 109],
        ['alcatra', 'M420,86 Q465,84 510,80 L505,122 L420,125 Z', 462, 107],
        ['picanha', 'M510,80 Q550,80 575,100 Q572,118 565,135 L505,122 Z', 539, 108],
        ['file-mignon', 'M420,125 L505,122 L505,150 L420,150 Z', 462, 140],
        ['maminha', 'M420,150 L505,150 L500,190 L420,200 Z', 460, 177],
        ['fraldinha', 'M420,200 L500,190 L500,245 Q465,262 420,268 Z', 458, 230],
        ['patinho', 'M505,150 L545,160 L540,250 L500,245 L500,190 Z', 522, 205],
        ['coxao', 'M505,122 L565,135 Q588,165 585,200 Q578,240 560,270 L540,250 L545,160 L505,150 Z', 565, 182]
      ]
    },
    porco: {
      nome: 'porco',
      deco: [
        'M140,112 Q110,104 90,124 Q70,144 52,158 Q44,176 58,184 Q92,192 145,165 Q138,140 140,112 Z',
        'M108,114 Q116,84 136,92 Q134,108 128,120 Z'
      ],
      dark: ['M44,160 Q36,170 44,182 Q54,184 56,170 Q54,158 44,160 Z',
        'M190,320 L215,320 L216,332 L188,332 Z', 'M508,320 L535,320 L536,332 L506,332 Z',
        'M558,128 Q584,118 580,140 Q574,152 566,140 Q576,134 570,130 Q562,132 560,136 Z'],
      eye: [98, 140],
      regioes: [
        ['paleta-suina', 'M145,165 L225,150 L228,205 L232,250 Q200,252 165,240 Q145,210 145,165 Z M170,236 L226,248 L215,320 L190,320 Z', 186, 205],
        ['pernil', 'M480,100 Q540,105 560,160 Q565,210 540,252 L470,252 L470,150 Z M484,244 L540,248 L535,320 L508,320 Z', 515, 182],
        ['copa', 'M140,112 Q180,96 220,95 L225,150 L145,165 Q138,140 140,112 Z', 182, 133],
        ['lombo', 'M220,95 Q350,88 480,100 L470,150 L360,150 L225,150 Z', 350, 125],
        ['costela-suina', 'M225,150 L360,150 L360,208 L228,205 Z', 294, 182],
        ['barriga', 'M228,205 L360,208 L360,150 L470,150 L470,252 Q350,268 232,250 Z', 412, 205]
      ]
    },
    cordeiro: {
      nome: 'cordeiro',
      deco: [
        'M150,112 Q130,90 110,95 Q80,104 62,140 Q56,156 68,160 Q100,164 130,152 L155,150 Z',
        'M118,100 Q98,88 90,104 Q104,110 120,108 Z',
        'M528,118 Q550,122 548,152 Q536,148 530,136 Z'
      ],
      dark: ['M205,325 L228,325 L229,336 L203,336 Z', 'M475,325 L500,325 L501,336 L473,336 Z'],
      eye: [100, 118],
      regioes: [
        ['paleta-cordeiro', 'M150,112 Q200,96 250,105 L250,170 L255,245 Q205,245 172,228 Q150,190 155,150 Z M178,224 L236,240 L228,325 L205,325 Z', 205, 168],
        ['pernil-cordeiro', 'M440,100 Q505,100 528,150 Q535,210 505,252 L430,252 L430,165 Z M450,244 L505,248 L500,325 L475,325 Z', 482, 182],
        ['carre', 'M250,105 Q345,96 440,100 L430,165 L250,170 Z', 345, 137],
        ['costela-cordeiro', 'M250,170 L430,165 L430,252 Q340,262 255,245 Z', 342, 212]
      ]
    },
    frango: {
      nome: 'frango',
      deco: [
        // corpo/carcaça (costas, sobre-asa, cauda) e pescoço/cabeça
        'M190,130 Q230,110 300,120 L440,95 Q480,80 485,120 Q480,190 430,230 Q360,270 270,262 Q190,250 175,195 Q168,160 190,130 Z',
        'M192,142 Q170,110 168,80 Q170,55 195,55 Q215,60 212,85 Q210,110 228,132 Z',
        'M440,95 Q470,50 500,62 Q492,90 485,120 Z'
      ],
      dark: ['M172,70 L150,78 L172,84 Z', 'M178,56 Q182,40 192,48 Q198,36 206,48 Q214,44 210,60 Z',
        'M360,298 L372,298 L380,318 L392,322 L366,322 L352,324 L360,310 Z'],
      eye: [188, 70],
      regioes: [
        ['coxa', 'M320,215 Q390,195 432,228 Q400,262 340,264 Q315,245 320,215 Z M340,256 L382,250 L372,300 L360,300 Z', 378, 238],
        ['peito-frango', 'M190,132 L262,140 L270,262 Q190,250 175,195 Q168,160 190,132 Z', 218, 238],
        ['asa', 'M250,150 Q320,128 402,150 Q382,196 300,205 Q255,200 250,150 Z', 326, 172],
        ['coracao', 'M225,184 C219,174 205,180 211,192 L225,206 L239,192 C245,180 231,174 225,184 Z', 225, 168]
      ]
    }
  };

  var NOMES_REGIAO = {
    cupim: 'Cupim', pescoco: 'Pescoço', acem: 'Acém', peito: 'Peito', paleta: 'Paleta', costela: 'Costela',
    'ponta-de-agulha': 'Ponta de agulha', contrafile: 'Contrafilé', 'file-mignon': 'Filé mignon', alcatra: 'Alcatra',
    picanha: 'Picanha', maminha: 'Maminha', fraldinha: 'Fraldinha', patinho: 'Patinho', coxao: 'Coxão', musculo: 'Músculo',
    lombo: 'Lombo', copa: 'Copa', barriga: 'Barriga', 'costela-suina': 'Costela', pernil: 'Pernil', 'paleta-suina': 'Paleta',
    carre: 'Carré', 'pernil-cordeiro': 'Pernil', 'paleta-cordeiro': 'Paleta', 'costela-cordeiro': 'Costela',
    coxa: 'Coxa e sobrecoxa', asa: 'Asa', 'peito-frango': 'Peito', coracao: 'Coração'
  };
  var PAIS = { ar: 'Argentina', uy: 'Uruguai', us: 'EUA' };
  var SVGNS = 'http://www.w3.org/2000/svg';

  /* ---------- Estilos (prefixo .anm-, só tokens do contrato) ---------- */
  var CSS = [
    '.anm-root{position:fixed;inset:0;z-index:1000;display:none;font-family:var(--font-body,system-ui,sans-serif);color:var(--c-osso,#F7F0E6)}',
    '.anm-root.anm-show{display:block}',
    '.anm-backdrop{position:absolute;inset:0;background:var(--c-carvao,#1C1512);opacity:0;transition:opacity var(--dur-2,260ms) ease}',
    '.anm-in .anm-backdrop{opacity:.86}',
    '.anm-dialog{position:absolute;inset:0;display:grid;grid-template-rows:auto 1fr;background:var(--c-carvao-2,#2B211C);overflow:hidden;',
    ' opacity:0;transform:translateY(24px) scale(.98);transition:opacity var(--dur-2,260ms) ease,transform var(--dur-3,520ms) var(--ease-brasa,cubic-bezier(.2,.8,.2,1.15))}',
    '.anm-in .anm-dialog{opacity:1;transform:none}',
    '.anm-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 8px 8px 20px}',
    '.anm-kicker{margin:0;font-size:.85rem;color:var(--c-sal,#B9ACA0);letter-spacing:.04em;text-transform:uppercase}',
    '.anm-btn{min-width:44px;min-height:44px;border-radius:var(--r-sm,6px);border:1px solid var(--c-sal,#B9ACA0);background:transparent;color:var(--c-osso,#F7F0E6);font:inherit;font-size:.95rem;padding:0 14px;cursor:pointer}',
    '.anm-btn:hover{border-color:var(--c-osso,#F7F0E6)}',
    '.anm-btn-pri{background:var(--c-brasa,#E85D24);border-color:var(--c-brasa,#E85D24);color:var(--c-carvao,#1C1512);font-weight:600}',
    '.anm-btn-pri:hover{background:var(--c-brasa-2,#FF7A3D)}',
    '.anm-x{font-size:1.4rem;line-height:1;padding:0}',
    '.anm-root :focus-visible{outline:3px solid var(--c-gordura,#F2E2C4);outline-offset:2px}',
    '.anm-body{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(320px,1fr);min-height:0}',
    '.anm-stage{position:relative;min-height:0;display:flex;flex-direction:column;padding:0 12px 12px 20px}',
    '.anm-svgwrap{flex:1;min-height:0;border-radius:var(--r-md,12px);background:var(--c-carvao,#1C1512);overflow:hidden;position:relative}',
    '.anm-svg{width:100%;height:100%;display:block}',
    '.anm-cam{transform-box:view-box;transform-origin:0 0;transition:transform var(--dur-3,520ms) var(--ease-brasa,cubic-bezier(.2,.8,.2,1.15));will-change:transform}',
    '.anm-reg{fill:var(--c-gordura,#F2E2C4);fill-opacity:.22;stroke:var(--c-carvao,#1C1512);stroke-width:2;stroke-linejoin:round;cursor:pointer}',
    '.anm-reg:hover{fill-opacity:.34}',
    '.anm-reg:focus{outline:none}',
    '.anm-reg:focus-visible{stroke:var(--c-gordura,#F2E2C4);stroke-width:3}',
    '.anm-deco{fill:var(--c-sal,#B9ACA0);fill-opacity:.16;stroke:var(--c-carvao,#1C1512);stroke-width:2}',
    '.anm-dark{fill:var(--c-sal,#B9ACA0);fill-opacity:.45}',
    '.anm-eye{fill:var(--c-carvao,#1C1512)}',
    '.anm-lit,.anm-peek{pointer-events:none;stroke:var(--c-carvao,#1C1512);stroke-width:2;opacity:0;transition:opacity var(--dur-2,260ms) ease}',
    '.anm-lit{fill:var(--c-brasa,#E85D24)}',
    '.anm-peek{fill:var(--c-ervas,#8BA35A)}',
    '.anm-litup .anm-lit,.anm-peek.anm-on{opacity:1}',
    '.anm-lbl{font:600 10px var(--font-body,system-ui,sans-serif);fill:var(--c-osso,#F7F0E6);text-anchor:middle;dominant-baseline:middle;pointer-events:none;',
    ' paint-order:stroke;stroke:var(--c-carvao,#1C1512);stroke-width:3px;stroke-linejoin:round;transition:opacity var(--dur-2,260ms) ease}',
    '.anm-lbl.anm-act{fill:var(--c-carvao,#1C1512);stroke:var(--c-brasa,#E85D24)}',
    '.anm-zoomed .anm-lbl{opacity:.35}',
    '.anm-zoomed .anm-lbl.anm-act{opacity:1}',
    '.anm-tools{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding-top:10px}',
    '.anm-info{margin:0;flex:1 1 220px;min-height:44px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;color:var(--c-sal,#B9ACA0);font-size:.95rem}',
    '.anm-info strong{color:var(--c-osso,#F7F0E6)}',
    '.anm-panel{overflow:auto;padding:4px 24px 28px 12px;opacity:0;transform:translateX(32px);',
    ' transition:opacity var(--dur-2,260ms) ease,transform var(--dur-3,520ms) var(--ease-brasa,cubic-bezier(.2,.8,.2,1.15))}',
    '.anm-panel-in .anm-panel{opacity:1;transform:none}',
    '.anm-panel>*{opacity:0;transform:translateY(10px);transition:opacity var(--dur-2,260ms) ease,transform var(--dur-2,260ms) var(--ease-brasa,ease);transition-delay:calc(var(--i,0) * 50ms)}',
    '.anm-panel-in .anm-panel>*{opacity:1;transform:none}',
    '.anm-title{font-family:var(--font-display,Georgia,serif);font-size:clamp(1.8rem,4vw,2.6rem);line-height:1.05;margin:4px 0 4px}',
    '.anm-sub{margin:0 0 14px;color:var(--c-sal,#B9ACA0)}',
    '.anm-nomes{list-style:none;margin:0 0 16px;padding:0;display:flex;flex-wrap:wrap;gap:6px}',
    '.anm-nomes li{border:1px solid var(--c-sal,#B9ACA0);border-radius:var(--r-sm,6px);padding:4px 8px;font-size:.88rem}',
    '.anm-nomes abbr{text-decoration:none;color:var(--c-sal,#B9ACA0);margin-right:6px;font-weight:600}',
    '.anm-h3{font-size:.8rem;text-transform:uppercase;letter-spacing:.06em;color:var(--c-sal,#B9ACA0);margin:18px 0 6px}',
    '.anm-porque{margin:0;line-height:1.55;font-size:1.02rem}',
    '.anm-bars{display:grid;gap:8px;margin:0}',
    '.anm-bar{display:grid;grid-template-columns:5.5em 1fr 2.6em;align-items:center;gap:10px}',
    '.anm-bar dt{font-size:.92rem}',
    '.anm-bar dd{margin:0;display:contents}',
    '.anm-track{height:10px;border-radius:5px;background:var(--c-carvao,#1C1512);overflow:hidden}',
    '.anm-fill{height:100%;background:var(--c-brasa,#E85D24);transform-origin:0 50%;transform:scaleX(var(--v,0));transition:transform var(--dur-3,520ms) var(--ease-brasa,ease);transition-delay:calc(var(--d,0) * 70ms + 200ms)}',
    '.anm-num{font-variant-numeric:tabular-nums;text-align:right;font-weight:600}',
    '.anm-ficha{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;margin:0}',
    '.anm-ficha dt{color:var(--c-sal,#B9ACA0)}',
    '.anm-ficha dd{margin:0}',
    '.anm-chips{display:flex;flex-wrap:wrap;gap:6px}',
    '.anm-chip{min-height:44px}',
    '.anm-chip[aria-pressed="true"]{border-color:var(--c-brasa,#E85D24);color:var(--c-brasa-2,#FF7A3D)}',
    '.anm-grab{display:none}',
    /* celular: animal em cima, painel em bottom sheet */
    '@media (max-width:820px){',
    ' .anm-body{grid-template-columns:1fr;grid-template-rows:minmax(220px,44vh) 1fr}',
    ' .anm-stage{padding:0 12px}',
    ' .anm-panel{position:relative;margin-top:10px;border-radius:var(--r-lg,22px) var(--r-lg,22px) 0 0;background:var(--c-carvao,#1C1512);padding:6px 18px 32px;transform:translateY(40%)}',
    ' .anm-grab{display:block;width:44px;height:5px;border-radius:3px;background:var(--c-sal,#B9ACA0);margin:6px auto 4px;opacity:.6}',
    '}',
    /* movimento reduzido: tudo no estado final, sem transição */
    '.anm-still *,.anm-still{transition:none!important}',
    '@media (prefers-reduced-motion:reduce){.anm-root *,.anm-root{transition:none!important}}'
  ].join('\n');

  /* ---------- utilidades ---------- */
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reduced() { return !!(mq && mq.matches); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function sv(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
    return e;
  }
  function ms(name, fb) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (!v) return fb;
    var n = parseFloat(v);
    if (isNaN(n)) return fb;
    return /ms$/.test(v) ? n : n * 1000;
  }
  function cortes() { return Array.isArray(window.CORTES) ? window.CORTES : []; }
  function achar(id) { var l = cortes(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  function cortesDaRegiao(animal, reg) {
    return cortes().filter(function (c) { return c.animal === animal && c.regiao === reg; });
  }

  /* ---------- estado ---------- */
  var root, dialog, svgwrap, panel, info, zoomBtn, kicker, titleId = 'anm-title';
  var cam, litLayer, peekLayer, svg;
  var st = { open: false, corte: null, animal: null, zoom: false, timers: [], ret: null, peek: null };

  function clearTimers() { st.timers.forEach(clearTimeout); st.timers = []; }
  function later(fn, t) { st.timers.push(setTimeout(fn, t)); }

  function injectCSS() {
    if (document.getElementById('anm-style')) return;
    var s = document.createElement('style');
    s.id = 'anm-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function build() {
    if (root) return;
    injectCSS();
    root = el('div', 'anm-root');
    root.appendChild(el('div', 'anm-backdrop'));
    dialog = el('div', 'anm-dialog');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', titleId);
    var head = el('div', 'anm-head');
    kicker = el('p', 'anm-kicker', 'De onde vem');
    var x = el('button', 'anm-btn anm-x', '×');
    x.type = 'button';
    x.setAttribute('aria-label', 'Fechar');
    x.addEventListener('click', close);
    head.appendChild(kicker); head.appendChild(x);
    var body = el('div', 'anm-body');
    var stage = el('div', 'anm-stage');
    svgwrap = el('div', 'anm-svgwrap');
    var tools = el('div', 'anm-tools');
    zoomBtn = el('button', 'anm-btn', 'Ver animal inteiro');
    zoomBtn.type = 'button';
    zoomBtn.addEventListener('click', function () { setZoom(!st.zoom, true); });
    info = el('p', 'anm-info');
    info.setAttribute('aria-live', 'polite');
    tools.appendChild(zoomBtn); tools.appendChild(info);
    stage.appendChild(svgwrap); stage.appendChild(tools);
    panel = el('div', 'anm-panel');
    body.appendChild(stage); body.appendChild(panel);
    dialog.appendChild(head); dialog.appendChild(body);
    root.appendChild(dialog);
    root.addEventListener('click', function (e) { if (e.target.classList.contains('anm-backdrop')) close(); });
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(root);
    if (mq) {
      var onMq = function () { if (st.open) finalState(); };
      if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);
    }
  }

  /* ---------- SVG do animal ---------- */
  function drawAnimal(key, ativa) {
    var a = ANIMAIS[key];
    svgwrap.textContent = '';
    svg = sv('svg', { viewBox: '0 0 600 360', class: 'anm-svg', role: 'group', 'aria-label': 'Mapa de cortes do ' + a.nome + '. Região destacada: ' + (NOMES_REGIAO[ativa] || ativa) });
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    cam = sv('g', { class: 'anm-cam' });
    var decoG = sv('g', { 'aria-hidden': 'true' }), darkG = sv('g', { 'aria-hidden': 'true' });
    a.deco.forEach(function (d) { decoG.appendChild(sv('path', { d: d, class: 'anm-deco' })); });
    a.dark.forEach(function (d) { darkG.appendChild(sv('path', { d: d, class: 'anm-dark' })); });
    darkG.appendChild(sv('circle', { cx: a.eye[0], cy: a.eye[1], r: 3.5, class: 'anm-eye' }));
    var regs = sv('g', {});
    litLayer = sv('g', { 'aria-hidden': 'true' });
    peekLayer = sv('g', { 'aria-hidden': 'true' });
    var lbls = sv('g', { 'aria-hidden': 'true' });
    a.regioes.forEach(function (r) {
      var nome = NOMES_REGIAO[r[0]] || r[0];
      var p = sv('path', { d: r[1], class: 'anm-reg', 'data-regiao': r[0], tabindex: '0', role: 'button', 'aria-label': nome });
      p.addEventListener('click', function () { peek(r[0]); });
      p.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); peek(r[0]); } });
      regs.appendChild(p);
      if (r[0] === ativa) litLayer.appendChild(sv('path', { d: r[1], class: 'anm-lit' }));
      var t = sv('text', { x: r[2], y: r[3], class: 'anm-lbl' + (r[0] === ativa ? ' anm-act' : '') });
      t.textContent = nome;
      lbls.appendChild(t);
    });
    // ordem: carcaça, regiões, cascos/olho, destaque, vizinha, rótulos
    [decoG, regs, darkG, litLayer, peekLayer, lbls].forEach(function (n) { cam.appendChild(n); });
    svg.appendChild(cam);
    svgwrap.appendChild(svg);
  }

  function camFor(reg) {
    var p = svg.querySelector('.anm-reg[data-regiao="' + reg + '"]');
    if (!p) return 'none';
    var b = p.getBBox();
    // fora do zoom, considera o recorte real do palco (meet) para enquadrar bem no celular
    var r = svgwrap.getBoundingClientRect();
    var vw = 600, vh = 360;
    if (r.width && r.height) {
      var k = Math.min(r.width / 600, r.height / 360);
      vw = r.width / k; vh = r.height / k;
    }
    var pad = 56;
    var s = Math.min(vw / (b.width + pad * 2), vh / (b.height + pad * 2), 2.2);
    s = Math.max(s, 1);
    var tx = 300 - s * (b.x + b.width / 2), ty = 180 - s * (b.y + b.height / 2);
    return 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
  }

  function setZoom(on, user) {
    st.zoom = on;
    cam.style.transform = on ? camFor(st.corte.regiao) : 'none';
    svg.classList.toggle('anm-zoomed', on);
    zoomBtn.textContent = on ? 'Ver animal inteiro' : 'Aproximar na ' + (NOMES_REGIAO[st.corte.regiao] || 'peça');
    zoomBtn.setAttribute('aria-pressed', on ? 'false' : 'true');
    if (user && on) peek(null);
  }

  function peek(reg) {
    peekLayer.textContent = '';
    st.peek = reg;
    var chips = panel.querySelectorAll('.anm-chip');
    for (var i = 0; i < chips.length; i++) chips[i].setAttribute('aria-pressed', chips[i].getAttribute('data-r') === reg ? 'true' : 'false');
    info.textContent = '';
    if (!reg) return;
    if (st.zoom) setZoom(false);
    var nome = NOMES_REGIAO[reg] || reg;
    if (reg !== st.corte.regiao) {
      var src = svg.querySelector('.anm-reg[data-regiao="' + reg + '"]');
      var pk = sv('path', { d: src.getAttribute('d'), class: 'anm-peek' });
      peekLayer.appendChild(pk);
      if (reduced()) pk.classList.add('anm-on');
      else requestAnimationFrame(function () { requestAnimationFrame(function () { pk.classList.add('anm-on'); }); });
    }
    var s = el('span'); s.appendChild(document.createTextNode('Região: ')); s.appendChild(el('strong', '', nome));
    info.appendChild(s);
    var lista = cortesDaRegiao(st.animal, reg).filter(function (c) { return c.id !== st.corte.id; });
    if (reg === st.corte.regiao) info.appendChild(el('span', '', '(é daqui que vem a ' + st.corte.nome + ')'));
    lista.forEach(function (c) {
      var b = el('button', 'anm-btn anm-btn-pri', 'Abrir ' + c.nome);
      b.type = 'button';
      b.addEventListener('click', function () { open(c.id); });
      info.appendChild(b);
    });
    if (!lista.length && reg !== st.corte.regiao) info.appendChild(el('span', '', '— nenhum corte do catálogo vem daqui.'));
  }

  /* ---------- painel ---------- */
  function fillPanel(c) {
    panel.textContent = '';
    var i = 0;
    function add(n) { n.style.setProperty('--i', i++); panel.appendChild(n); return n; }
    add(el('div', 'anm-grab')).setAttribute('aria-hidden', 'true');
    var h = add(el('h2', 'anm-title', c.nome)); h.id = titleId;
    add(el('p', 'anm-sub', 'Do ' + ANIMAIS[c.animal].nome + ' · região: ' + (NOMES_REGIAO[c.regiao] || c.regiao)));
    var nomes = c.nomes || {};
    var ul = el('ul', 'anm-nomes'); ul.setAttribute('aria-label', 'Nomes em outros países');
    ['ar', 'uy', 'us'].forEach(function (k) {
      if (!nomes[k]) return;
      var li = el('li'); var ab = el('abbr', '', k.toUpperCase()); ab.title = PAIS[k];
      li.appendChild(ab); li.appendChild(document.createTextNode(nomes[k])); ul.appendChild(li);
    });
    if (ul.children.length) add(ul);
    add(el('h3', 'anm-h3', 'Por que essa peça é assim'));
    add(el('p', 'anm-porque', c.porque || ''));
    add(el('h3', 'anm-h3', 'Perfil'));
    var bars = el('dl', 'anm-bars');
    [['Maciez', c.maciez], ['Gordura', c.gordura], ['Sabor', c.sabor]].forEach(function (b, j) {
      var v = Math.max(0, Math.min(5, +b[1] || 0));
      var row = el('div', 'anm-bar');
      row.appendChild(el('dt', '', b[0]));
      var dd = el('dd');
      var tr = el('span', 'anm-track'); tr.setAttribute('aria-hidden', 'true');
      var f = el('span', 'anm-fill'); f.style.display = 'block'; f.style.setProperty('--d', j); f.setAttribute('data-v', v / 5);
      tr.appendChild(f);
      var num = el('span', 'anm-num', v + '/5'); num.setAttribute('aria-label', v + ' de 5');
      dd.appendChild(tr); dd.appendChild(num); row.appendChild(dd); bars.appendChild(row);
    });
    add(bars);
    add(el('h3', 'anm-h3', 'Na brasa'));
    var fi = el('dl', 'anm-ficha');
    [['Preparo', c.preparo], ['Ponto', c.ponto], ['Tempo', c.tempo]].forEach(function (p) {
      if (!p[1]) return; fi.appendChild(el('dt', '', p[0])); fi.appendChild(el('dd', '', p[1]));
    });
    add(fi);
    add(el('h3', 'anm-h3', 'Regiões do ' + ANIMAIS[c.animal].nome));
    var chips = el('div', 'anm-chips');
    ANIMAIS[c.animal].regioes.forEach(function (r) {
      var b = el('button', 'anm-btn anm-chip', NOMES_REGIAO[r[0]] || r[0]);
      b.type = 'button'; b.setAttribute('data-r', r[0]); b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { peek(r[0]); });
      chips.appendChild(b);
    });
    add(chips);
  }
  function bars(on) {
    var f = panel.querySelectorAll('.anm-fill');
    for (var i = 0; i < f.length; i++) f[i].style.setProperty('--v', on ? f[i].getAttribute('data-v') : 0);
  }

  /* ---------- coreografia ---------- */
  function finalState() {
    clearTimers();
    root.classList.add('anm-still', 'anm-in', 'anm-panel-in');
    svg.classList.add('anm-litup');
    bars(true);
    setZoom(true);
    var pk = peekLayer.querySelector('.anm-peek'); if (pk) pk.classList.add('anm-on');
    // reativa transições de hover/focus no próximo quadro, mas só se houver movimento
    if (!reduced()) requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.remove('anm-still'); }); });
  }

  function play(primeira) {
    clearTimers();
    var d2 = ms('--dur-2', 260), d3 = ms('--dur-3', 520);
    svg.classList.remove('anm-litup');
    cam.style.transform = 'none';
    root.classList.remove('anm-panel-in');
    bars(false);
    st.zoom = false;
    var t = primeira ? d2 + 80 : 60;
    // 1. animal inteiro, neutro (já visível). 2. região acende
    later(function () { svg.classList.add('anm-litup'); }, t);
    // 3. câmera aproxima  4. painel entra junto com o fim do zoom
    later(function () { setZoom(true); }, t + d2 + 220);
    later(function () { root.classList.add('anm-panel-in'); bars(true); }, t + d2 + 220 + d3 * 0.45);
  }

  function open(corteId) {
    build();
    var c = achar(corteId);
    var wasOpen = st.open;
    if (!wasOpen) st.ret = document.activeElement;
    if (!c || !ANIMAIS[c.animal]) {
      // sem dados: mensagem legível em vez de modal vazio
      c = { id: corteId, nome: 'Corte não encontrado', nomes: {}, animal: 'boi', regiao: '', porque: 'Não temos dados de "' + corteId + '" ainda.' };
    }
    st.corte = c; st.animal = c.animal; st.peek = null;
    kicker.textContent = 'De onde vem · ' + ANIMAIS[c.animal].nome;
    drawAnimal(c.animal, c.regiao);
    fillPanel(c);
    info.textContent = '';
    zoomBtn.textContent = 'Ver animal inteiro';
    zoomBtn.hidden = !c.regiao;
    st.open = true;
    root.classList.add('anm-show');
    document.documentElement.style.overflow = 'hidden';
    if (!wasOpen) root.classList.remove('anm-in', 'anm-panel-in');
    void root.offsetWidth;
    if (reduced()) { finalState(); }
    else {
      root.classList.remove('anm-still');
      requestAnimationFrame(function () { root.classList.add('anm-in'); play(!wasOpen); });
    }
    var x = dialog.querySelector('.anm-x');
    x.focus({ preventScroll: true });
  }

  function close() {
    if (!st.open) return;
    st.open = false;
    clearTimers();
    var done = function () {
      root.classList.remove('anm-show', 'anm-in', 'anm-panel-in');
      document.documentElement.style.overflow = '';
    };
    if (reduced()) done();
    else {
      root.classList.remove('anm-panel-in', 'anm-in');
      setTimeout(done, ms('--dur-2', 260));
    }
    var r = st.ret; st.ret = null;
    if (r && r.focus && document.contains(r)) r.focus({ preventScroll: true });
  }

  function focusables() {
    return Array.prototype.filter.call(
      dialog.querySelectorAll('button:not([hidden]),[href],[tabindex="0"]'),
      function (n) { return !n.hidden && n.getClientRects().length; });
  }
  function onKey(e) {
    if (!st.open) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
    if (e.key !== 'Tab') return;
    var f = focusables(); if (!f.length) return;
    var first = f[0], last = f[f.length - 1], a = document.activeElement;
    if (!dialog.contains(a)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && a === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
  }

  window.Animal = { open: open, close: close };
})();
