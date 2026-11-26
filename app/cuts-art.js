/* churrasquin — ilustrações SVG dos cortes (viewBox 0 0 320 220).
   Cada corte aparece como UMA porção crua, isolada, em close: vista 3/4 de
   cima, face do corte com fibras, marmoreio e gordura; lateral/topo extrudados.
   Sistema comum: face (contorno suave) + extrusão + gordura + fibras + osso. */
(function () {
  'use strict';
  var A = {};
  function rng(seed) { var s = 7; for (var i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function f(n) { return Math.round(n * 10) / 10; }

  /* ---------- paletas (carne clara, média, escura, lateral, gordura, sombra da gordura) ---------- */
  var PAL = {
    boi: ['#dc4352', '#bd2c3d', '#8e1d2c', '#9c2a37', '#f7e9e0', '#e7c7bd'],
    wagyu: ['#e0505c', '#c43645', '#94202f', '#a3303c', '#f8ece4', '#e9cdc3'],
    porco: ['#f3b3a8', '#e7958c', '#c9746d', '#dc8f86', '#fcf5ec', '#ecd9cc'],
    cordeiro: ['#b93140', '#972434', '#681724', '#7d1f2c', '#f4e8da', '#e2cdb9'],
    frango: ['#f4c0ae', '#e9a594', '#c98474', '#e3a996', '#f6e2b8', '#e2c18a'],
    miudo: ['#a42a36', '#86202c', '#5c1520', '#6e1a26', '#f7ece2', '#e6cfc2']
  };

  /* ---------- geometria ---------- */
  // contorno fechado suave (Catmull-Rom) a partir de pontos
  function sm(pts) {
    var n = pts.length, d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
    for (var i = 0; i < n; i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += 'C' + f(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f(p2[0]) + ' ' + f(p2[1]);
    }
    return d + 'Z';
  }
  // elipse orgânica
  function ell(cx, cy, rx, ry, r, j, n, sq) {
    var pts = [], k = n || 14;
    for (var i = 0; i < k; i++) {
      var a = i / k * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), q = 1 + (r() - .5) * (j || .08);
      if (sq) { c = Math.sign(c) * Math.pow(Math.abs(c), sq); s = Math.sign(s) * Math.pow(Math.abs(s), sq); }
      pts.push([cx + c * rx * q, cy + s * ry * q]);
    }
    return pts;
  }
  // retângulo arredondado orgânico
  function blk(x0, y0, x1, y1, r, j) {
    var pts = [], w = x1 - x0, h = y1 - y0, J = function () { return (r() - .5) * (j || 4); };
    [[0, .06], [.25, 0], [.5, .01], [.75, 0], [1, .05], [1, .35], [1, .65], [.99, .95], [.75, 1], [.5, .99], [.25, 1], [0, .96], [.01, .65], [0, .35]].forEach(function (q) { pts.push([x0 + q[0] * w + J(), y0 + q[1] * h + J()]); });
    return pts;
  }
  function bbox(pts) { var b = [1e9, 1e9, -1e9, -1e9]; pts.forEach(function (q) { b[0] = Math.min(b[0], q[0]); b[1] = Math.min(b[1], q[1]); b[2] = Math.max(b[2], q[0]); b[3] = Math.max(b[3], q[1]); }); return b; }
  function mv(pts, dx, dy) { return pts.map(function (q) { return [q[0] + dx, q[1] + dy]; }); }

  /* ---------- texturas ---------- */
  // fibras paralelas (ângulo em graus)
  function fibers(b, r, ang, gap, col, op) {
    var g = '', cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2, L = Math.max(b[2] - b[0], b[3] - b[1]);
    for (var y = -L; y < L; y += gap * (0.7 + r() * .6)) {
      var d = 'M' + f(-L) + ' ' + f(y);
      for (var x = -L + 20; x <= L; x += 20) d += 'L' + f(x) + ' ' + f(y + (r() - .5) * gap * .5);
      g += '<path d="' + d + '" stroke="' + col + '" stroke-width="' + f(.5 + r() * .7) + '" opacity="' + f((op || .35) * (.5 + r())) + '"/>';
    }
    return '<g fill="none" transform="translate(' + f(cx) + ' ' + f(cy) + ') rotate(' + ang + ')">' + g + '</g>';
  }
  // marmoreio procedural: veios finos ramificados e pontinhos
  function marble(b, r, n, col, ang) {
    var g = '', w = b[2] - b[0], h = b[3] - b[1], a0 = (ang || 0) * Math.PI / 180;
    for (var i = 0; i < n; i++) {
      var x = b[0] + r() * w, y = b[1] + r() * h, d = 'M' + f(x) + ' ' + f(y), a = a0 + (r() - .5) * 2.2, len = 2.5 + r() * 3.5, sw = .7 + r() * 1.8;
      for (var k = 0; k < 1 + r() * 3; k++) { a += (r() - .5) * 1.2; x += Math.cos(a) * len; y += Math.sin(a) * len; d += 'L' + f(x) + ' ' + f(y); }
      g += '<path d="' + d + '" stroke-width="' + f(sw) + '"/>';
      if (r() < .8) g += '<ellipse cx="' + f(b[0] + r() * w) + '" cy="' + f(b[1] + r() * h) + '" rx="' + f(.8 + r() * 2.4) + '" ry="' + f(.6 + r() * 1.3) + '" fill="' + col + '" stroke="none"/>';
    }
    return '<g stroke="' + col + '" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".82">' + g + '</g>';
  }
  // faixa ondulada de gordura entre dois pontos (camadas de costela, panceta)
  function band(x0, y0, x1, y1, w, r, col, sh) {
    var n = 7, d1 = '', d2 = '', dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    for (var i = 0; i <= n; i++) {
      var t = i / n, x = x0 + dx * t, y = y0 + dy * t, o = (r() - .5) * w * .7, ww = w * (.55 + r() * .7) / 2;
      d1 += (i ? 'L' : 'M') + f(x + nx * (o - ww)) + ' ' + f(y + ny * (o - ww));
      d2 = 'L' + f(x + nx * (o + ww)) + ' ' + f(y + ny * (o + ww)) + d2;
    }
    return '<path d="' + d1 + d2 + 'Z" fill="' + col + '" stroke="' + sh + '" stroke-width=".8" stroke-linejoin="round"/>';
  }
  // osso em corte transversal (disco esponjoso)
  function boneX(x, y, rx, ry, r) {
    var g = '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#efe2c8" stroke="#cdb48f" stroke-width="1"/><ellipse cx="' + x + '" cy="' + y + '" rx="' + f(rx * .7) + '" ry="' + f(ry * .68) + '" fill="#d8a58e"/>';
    for (var i = 0; i < 8; i++) g += '<circle cx="' + f(x + (r() - .5) * rx * 1.1) + '" cy="' + f(y + (r() - .5) * ry * 1.1) + '" r="' + f(.6 + r() * 1.2) + '" fill="#b8695e" opacity=".7"/>';
    return g;
  }
  // osso longo (cilindro limpo)
  function boneL(p, x0, y0, x1, y1, w, knob) {
    return '<path d="M' + x0 + ' ' + y0 + 'L' + x1 + ' ' + y1 + '" stroke="#c9b08a" stroke-width="' + (w + 2) + '" stroke-linecap="round"/><path d="M' + x0 + ' ' + y0 + 'L' + x1 + ' ' + y1 + '" stroke="url(#' + p + 'bn)" stroke-width="' + w + '" stroke-linecap="round"/>' +
      (knob ? '<circle cx="' + x1 + '" cy="' + y1 + '" r="' + f(w * .72) + '" fill="#f4ead6" stroke="#c9b08a"/>' : '') +
      '<path d="M' + f(x0 + (x1 - x0) * .1) + ' ' + f(y0 + (y1 - y0) * .1 - w * .22) + 'L' + f(x0 + (x1 - x0) * .85) + ' ' + f(y0 + (y1 - y0) * .85 - w * .22) + '" stroke="#fff" stroke-width="' + f(w * .18) + '" stroke-linecap="round" opacity=".55"/>';
  }
  // brilho úmido
  function wet(b, r, n) {
    var g = '';
    for (var i = 0; i < (n || 5); i++) {
      var x = b[0] + (b[2] - b[0]) * (.12 + r() * .5), y = b[1] + (b[3] - b[1]) * (.1 + r() * .35), l = 6 + r() * 16;
      g += '<path d="M' + f(x) + ' ' + f(y) + 'q' + f(l / 2) + ' ' + f(-2 - r() * 2) + ' ' + f(l) + ' 0" stroke="#fff" stroke-width="' + f(.8 + r() * 1.4) + '" stroke-linecap="round" fill="none" opacity="' + f(.25 + r() * .3) + '"/>';
    }
    return g;
  }

  /* ---------- peça genérica: face + extrusão ---------- */
  // o: { pal, face:[pts], d:[dx,dy], top:'fat'|'meat'|cor, rim:[t, lado], marb, mang, fib:[ang,gap,op], pre(p,r,b), post(p,r,b), under(p,r,b) }
  function piece(p, r, o) {
    var P = PAL[o.pal || 'boi'], fd = sm(o.face), b = bbox(o.face), d = o.d || [0, 14], N = 10, g = '';
    var topCol = o.top === 'fat' ? '#efd3c2' : o.top === 'skin' ? '#f1d6b4' : (o.top || P[3]);
    g += '<defs><clipPath id="' + p + 'c"><path d="' + fd + '"/></clipPath>' +
      '<linearGradient id="' + p + 'f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + P[0] + '"/><stop offset=".55" stop-color="' + P[1] + '"/><stop offset="1" stop-color="' + P[2] + '"/></linearGradient>' +
      '<linearGradient id="' + p + 's" x1="0" y1="0" x2="' + (d[1] > 0 ? 0 : 1) + '" y2="1"><stop offset="0" stop-color="' + topCol + '"/><stop offset="1" stop-color="' + (o.top === 'fat' ? '#bf8a79' : o.top === 'skin' ? '#c99a76' : P[2]) + '"/></linearGradient>' +
      '<radialGradient id="' + p + 'h" cx=".32" cy=".25" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + p + 'bn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf4e6"/><stop offset="1" stop-color="#dcc6a0"/></linearGradient></defs>';
    // sombra no chão
    var sx = (b[0] + b[2]) / 2 + d[0] / 2, sy = Math.max(b[3], b[3] + d[1]) + 4;
    g += '<ellipse cx="' + f(sx) + '" cy="' + f(sy) + '" rx="' + f((b[2] - b[0]) * .56 + Math.abs(d[0]) / 2) + '" ry="12" fill="#1F1A17" opacity=".13"/><ellipse cx="' + f(sx) + '" cy="' + f(sy - 2) + '" rx="' + f((b[2] - b[0]) * .46) + '" ry="6" fill="#1F1A17" opacity=".16"/>';
    if (o.under) g += o.under(p, r, b);
    // extrusão (lateral/topo da peça)
    g += '<g fill="url(#' + p + 's)" stroke="url(#' + p + 's)" stroke-width="1.5">';
    for (var i = N; i >= 1; i--) g += '<path d="' + sm(mv(o.face, d[0] * i / N, d[1] * i / N)) + '"/>';
    g += '</g><path d="' + sm(mv(o.face, d[0], d[1])) + '" fill="none" stroke="' + (o.top === 'fat' ? '#e6c8ba' : P[2]) + '" stroke-width=".8" opacity=".5"/>';
    if (o.side) g += o.side(p, r, b, d);
    // face do corte
    g += '<path d="' + fd + '" fill="url(#' + p + 'f)"/><g clip-path="url(#' + p + 'c)">';
    if (o.fib !== 0) { var fb = o.fib || [0, 4, .3]; g += fibers(b, r, fb[0], fb[1], P[2], fb[2]); }
    if (o.pre) g += o.pre(p, r, b, P);
    if (o.marb) g += marble(b, r, o.marb, P[4], o.mang);
    if (o.rim) {
      var t = o.rim[0], s = o.rim[1], cw = b[2] - b[0], ch = b[3] - b[1], R = [b[0] - 9, b[1] - 9, cw + 18, ch + 18];
      if (s === 'top') R[3] = ch * (o.rim[2] || .5); if (s === 'bot') { R[1] = b[1] + ch * .5; R[3] = ch; }
      if (s === 'left') R[2] = cw * (o.rim[2] || .45); if (s === 'right') { R[0] = b[0] + cw * (1 - (o.rim[2] || .45)); R[2] = cw; }
      g += '<clipPath id="' + p + 'r"><rect x="' + f(R[0]) + '" y="' + f(R[1]) + '" width="' + f(R[2]) + '" height="' + f(R[3]) + '"/></clipPath><g clip-path="url(#' + p + 'r)"><path d="' + fd + '" fill="none" stroke="' + P[5] + '" stroke-width="' + (t * 2 + 3) + '"/><path d="' + fd + '" fill="none" stroke="' + P[4] + '" stroke-width="' + t * 2 + '"/></g>';
    }
    if (o.post) g += o.post(p, r, b, P);
    g += '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + (b[2] - b[0]) + '" height="' + (b[3] - b[1]) + '" fill="url(#' + p + 'h)"/>' + wet(b, r, o.wet) + '</g>';
    g += '<path d="' + fd + '" fill="none" stroke="' + P[2] + '" stroke-width=".8" opacity=".5"/>';
    if (o.over) g += o.over(p, r, b, P);
    return g;
  }

  var C = {};
  window.CORTES && [].concat(window.CORTES).forEach(function (x) { C[x.id] = x; });
  function make(id, fb, build) {
    var p = 'ca-' + id + '-', r = rng(id), label = C[id] ? C[id].nome : fb;
    return '<svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustração do corte cru: ' + label + '">' + build(p, r) + '</svg>';
  }
  function cut(id, fb, o) { A[id] = make(id, fb, function (p, r) { return piece(p, r, typeof o === 'function' ? o(r) : o); }); }

  /* ---------- modelos de peça ---------- */
  // bife deitado (face = topo, espessura para baixo)
  function steak(o) {
    return function (r) {
      var q = { pal: o.pal, face: o.face ? o.face(r) : ell(160, 100, o.rx || 108, o.ry || 56, r, .1, 16, o.sq), d: [0, o.th || 16], marb: o.marb, mang: o.mang, rim: o.rim, fib: o.fib || [o.fa || 8, 5, .25], pre: o.pre, post: o.post, over: o.over, wet: o.wet };
      return q;
    };
  }
  // bloco em pé (face da frente, topo/lateral para trás)
  function block(o) {
    return function (r) {
      return { pal: o.pal, face: o.face(r), d: o.d || [30, -26], top: o.top, marb: o.marb, mang: o.mang, rim: o.rim, fib: o.fib || [80, 4.5, .3], pre: o.pre, post: o.post, over: o.over, under: o.under, wet: o.wet };
    };
  }
  // camadas alternadas (costela, panceta) dentro da face
  function layers(list) {
    return function (p, r, b, P) {
      return list.map(function (L) {
        var w = b[2] - b[0], h = b[3] - b[1];
        return band(b[0] + L[0] * w, b[1] + L[1] * h, b[0] + L[2] * w, b[1] + L[3] * h, L[4], r, L[5] || P[4], P[5]);
      }).join('');
    };
  }
  // "olho" de gordura do ancho/ribeye
  function eye(cx, cy, s) {
    return function (p, r, b, P) {
      var c = '<path d="M' + (cx - 46 * s) + ' ' + (cy + 18 * s) + 'C' + (cx - 30 * s) + ' ' + (cy - 30 * s) + ' ' + (cx + 34 * s) + ' ' + (cy - 34 * s) + ' ' + (cx + 52 * s) + ' ' + (cy + 4 * s) + '" stroke="' + P[4] + '" stroke-width="' + f(7 * s) + '" fill="none" stroke-linecap="round"/>';
      return c + '<path d="' + sm(ell(cx, cy, 16 * s, 11 * s, r, .4, 9)) + '" fill="' + P[4] + '" stroke="' + P[5] + '" stroke-width=".8"/>' + marble([cx - 30 * s, cy - 24 * s, cx + 30 * s, cy + 20 * s], r, 10, P[4]);
    };
  }
  // osso em T (t-bone / porterhouse) no topo do bife
  function tbone(x, y, h) {
    return function (p, r, b) {
      return '<path d="M' + (x - 10) + ' ' + (b[1] + 8) + 'C' + (x - 4) + ' ' + (y - 10) + ' ' + (x - 8) + ' ' + (y + 20) + ' ' + (x - 6) + ' ' + (b[3] - 6) + 'L' + (x + 6) + ' ' + (b[3] - 6) + 'C' + (x + 4) + ' ' + (y + 20) + ' ' + (x + 8) + ' ' + y + ' ' + (x + 2) + ' ' + (b[1] + 8) + 'Z" fill="url(#' + p + 'bn)" stroke="#c9b08a"/>' +
        '<path d="M' + (x - 8) + ' ' + (y - h) + 'L' + (b[2] - 10) + ' ' + (y - h - 6) + 'L' + (b[2] - 10) + ' ' + (y - h + 6) + 'L' + (x + 4) + ' ' + (y - h + 12) + 'Z" fill="url(#' + p + 'bn)" stroke="#c9b08a"/>';
    };
  }

  /* ---------- bovinos ---------- */
  // picanha: fatia grossa em meia-lua com capa de gordura grossa em cima
  cut('picanha', 'Picanha', block({
    face: function (r) { return [[62, 172], [110, 176], [170, 177], [228, 174], [250, 150], [246, 118], [226, 92], [190, 78], [150, 74], [110, 80], [80, 98], [64, 126]]; },
    d: [36, -30], top: 'fat', rim: [17, 'top', .52], fib: [78, 5, .3], marb: 22
  }));
  cut('maminha', 'Maminha', block({
    face: function (r) { return [[60, 174], [140, 176], [234, 172], [246, 152], [220, 118], [170, 86], [120, 72], [86, 82], [64, 120]]; },
    d: [30, -22], rim: [6, 'left', .5], fib: [70, 4, .35], marb: 18
  }));
  cut('fraldinha', 'Fraldinha', steak({ face: function (r) { return [[30, 112], [70, 86], [140, 76], [220, 78], [290, 90], [296, 112], [262, 132], [180, 140], [100, 140], [42, 132]]; }, th: 9, fib: [4, 3.2, .55], marb: 26, mang: 4 }));
  cut('vazio', 'Vacío', steak({ face: function (r) { return [[34, 116], [62, 82], [140, 70], [230, 74], [286, 92], [290, 124], [252, 144], [160, 150], [80, 148], [40, 138]]; }, th: 11, fib: [8, 3.4, .5], marb: 30, rim: [6, 'top', .3] }));
  cut('entrana', 'Entraña', steak({ face: function (r) { return [[20, 116], [60, 96], [140, 90], [230, 92], [298, 102], [302, 118], [240, 132], [150, 134], [70, 134], [24, 128]]; }, th: 8, fib: [94, 4, .55], marb: 10,
    post: function (p, r, b) { return '<path d="M20 104 Q160 86 300 104" stroke="#f2e6e8" stroke-width="5" fill="none" opacity=".55"/>'; } }));
  cut('flat-iron', 'Flat iron', steak({ face: function (r) { return blk(46, 64, 274, 140, r, 5); }, th: 13, fib: [2, 4, .4], marb: 40,
    post: function (p, r, b, P) { return band(46, 103, 274, 100, 5, r, '#f1dfe0', P[5]); } }));
  cut('contrafile', 'Contrafilé', steak({ face: function (r) { return [[40, 96], [80, 64], [160, 56], [240, 62], [282, 84], [282, 122], [250, 144], [170, 148], [90, 142], [46, 126]]; }, th: 18, marb: 34, rim: [11, 'top', .42] }));
  cut('bife-de-chorizo', 'Bife de chorizo', steak({ face: function (r) { return [[56, 92], [90, 60], [160, 52], [230, 58], [270, 84], [268, 126], [236, 150], [160, 154], [96, 148], [58, 126]]; }, th: 26, marb: 30, rim: [12, 'top', .4] }));
  cut('ny-strip', 'NY strip', steak({ face: function (r) { return [[40, 98], [70, 64], [150, 58], [230, 60], [284, 78], [288, 124], [254, 148], [160, 150], [80, 144], [44, 128]]; }, th: 20, marb: 50, rim: [10, 'top', .4], pal: 'wagyu' }));
  cut('entrecot', 'Entrecot', steak({ face: function (r) { return ell(160, 102, 112, 52, r, .14, 16); }, th: 15, marb: 46, rim: [9, 'left', .35], pre: eye(196, 102, .8) }));
  cut('ancho', 'Ancho', steak({ face: function (r) { return ell(160, 100, 104, 62, r, .12, 16); }, th: 20, marb: 70, rim: [9, 'top', .3], pre: eye(160, 100, 1), pal: 'wagyu' }));
  cut('ribeye', 'Ribeye', steak({ face: function (r) { return ell(160, 98, 100, 64, r, .16, 16); }, th: 22, marb: 80, rim: [10, 'right', .3], pre: eye(150, 100, 1.05), pal: 'wagyu' }));
  cut('ojo-de-bife', 'Ojo de bife', steak({ face: function (r) { return ell(160, 98, 92, 64, r, .1, 16); }, th: 26, marb: 64, rim: [8, 'left', .3], pre: eye(166, 98, .95) }));
  cut('file-mignon', 'Filé mignon', steak({ face: function (r) { return ell(160, 76, 74, 44, r, .05, 14); }, th: 66, marb: 6, fib: [30, 5, .2],
    post: function (p, r, b) { return '<path d="M120 80 q40 -14 80 0" stroke="#e9cfd2" stroke-width="2" fill="none" opacity=".6"/>'; } }));
  cut('alcatra', 'Alcatra', steak({ face: function (r) { return [[46, 104], [76, 66], [150, 58], [236, 66], [278, 96], [266, 132], [210, 150], [130, 150], [66, 138]]; }, th: 22, marb: 22, rim: [5, 'bot'], fib: [-20, 5, .3] }));
  cut('denver', 'Denver', steak({ face: function (r) { return ell(160, 100, 100, 50, r, .2, 14); }, th: 18, marb: 60, fib: [30, 4, .35],
    post: function (p, r, b, P) { return band(80, 90, 240, 112, 4, r, P[4], P[5]); } }));
  cut('tri-tip', 'Tri-tip', steak({ face: function (r) { return [[30, 132], [90, 98], [170, 66], [250, 58], [292, 74], [272, 110], [200, 140], [110, 150], [44, 150]]; }, th: 16, marb: 26, fib: [-26, 4, .38], rim: [6, 'top', .3] }));
  cut('colita-de-cuadril', 'Colita de cuadril', steak({ face: function (r) { return [[34, 126], [100, 92], [180, 70], [262, 64], [294, 84], [268, 118], [190, 142], [100, 150], [44, 148]]; }, th: 18, marb: 20, fib: [-22, 4, .38], rim: [8, 'top', .32] }));
  cut('acem', 'Acém', steak({ face: function (r) { return blk(52, 60, 272, 146, r, 10); }, th: 26, marb: 40, fib: [40, 5, .3],
    post: function (p, r, b, P) { return band(60, 120, 200, 70, 4, r, '#efdcdc', P[5]) + band(150, 140, 260, 90, 5, r, P[4], P[5]); } }));
  cut('t-bone', 'T-bone', steak({ face: function (r) { return ell(160, 100, 112, 62, r, .1, 16, .8); }, th: 20, marb: 38, rim: [9, 'left', .25],
    over: tbone(196, 112, 0) }));
  cut('porterhouse', 'Porterhouse', steak({ face: function (r) { return ell(160, 100, 120, 66, r, .1, 16, .8); }, th: 22, marb: 44, rim: [9, 'left', .25],
    over: tbone(176, 114, 0), post: function (p, r, b) { return '<rect x="180" y="40" width="120" height="130" fill="#e45664" opacity=".25"/>'; } }));
  cut('tomahawk', 'Tomahawk', steak({ face: function (r) { return ell(110, 108, 84, 58, r, .12, 16); }, th: 34, marb: 64, rim: [10, 'right', .3], pre: eye(104, 110, .85), pal: 'wagyu',
    over: function (p, r, b) { return boneL(p, 186, 104, 302, 70, 17, 1) + '<path d="M180 92 q12 10 8 26" stroke="#efe2c8" stroke-width="5" fill="none"/>'; } }));
  cut('cupim', 'Cupim', block({
    face: function (r) { return [[62, 176], [150, 180], [236, 176], [252, 146], [240, 104], [206, 72], [160, 60], [112, 68], [76, 98], [60, 140]]; },
    d: [30, -24], marb: 140, fib: [60, 4, .25], top: '#b8414b',
    pre: function (p, r, b, P) { var g = ''; for (var i = 0; i < 7; i++) g += band(60 + r() * 80, 60 + r() * 110, 140 + r() * 110, 60 + r() * 110, 4 + r() * 5, r, P[4], P[5]); return g; }
  }));
  function ribBlock(o) {
    return block({
      face: function (r) { return blk(o.x0 || 70, 68, o.x1 || 238, 182, r, 6); }, d: o.d || [34, -30], marb: 30, fib: [88, 4, .35], top: '#c95a64',
      pre: layers(o.layers), post: o.post
    });
  }
  // costela: igual à referência — camadas verticais de carne e gordura branca-rosada
  cut('costela', 'Costela', ribBlock({ layers: [[.3, 0, .27, 1, 12], [.5, 0, .53, 1, 7], [.72, 0, .7, 1, 16], [.9, 0, .93, 1, 6]] }));
  cut('costela-janela', 'Costela janela', ribBlock({ x0: 48, x1: 256, layers: [[.2, 0, .22, 1, 10], [.5, 0, .48, 1, 14], [.78, 0, .8, 1, 10], [0, .85, 1, .86, 10]],
    post: function (p, r) { return boneX(96, 168, 16, 11, r) + boneX(204, 168, 16, 11, r); } }));
  cut('short-rib', 'Short rib', ribBlock({ x0: 80, x1: 236, layers: [[0, .3, 1, .32, 9], [0, .58, 1, .55, 7], [.6, 0, .62, .7, 6]],
    post: function (p, r) { return '<rect x="70" y="160" width="180" height="26" rx="10" fill="url(#' + p + 'bn)" stroke="#c9b08a"/>' + boneX(96, 173, 14, 10, r); } }));
  cut('peito', 'Peito', block({
    face: function (r) { return blk(46, 96, 262, 176, r, 6); }, d: [30, -34], top: 'fat', marb: 20, fib: [2, 4, .45],
    pre: layers([[0, .5, 1, .55, 5]]), rim: [16, 'top', .5]
  }));
  cut('tira-de-asado', 'Tira de asado', steak({ face: function (r) { return [[22, 104], [80, 92], [160, 90], [240, 92], [298, 102], [300, 128], [240, 138], [160, 138], [80, 136], [22, 128]]; }, th: 12, marb: 40, fib: [90, 4, .3],
    pre: function (p, r, b, P) { return band(20, 98, 300, 100, 7, r, P[4], P[5]) + band(20, 134, 300, 132, 5, r, P[4], P[5]); },
    post: function (p, r) { return boneX(70, 116, 13, 9, r) + boneX(130, 115, 14, 9, r) + boneX(192, 115, 13, 9, r) + boneX(252, 116, 13, 9, r); } }));
  cut('matambre', 'Matambre', steak({ face: function (r) { return [[24, 80], [100, 58], [200, 54], [292, 70], [296, 140], [220, 160], [120, 162], [30, 150]]; }, th: 5, marb: 50, fib: [10, 3.5, .45],
    over: function (p, r) { return '<path d="M290 70 C312 90 312 128 296 142 C284 128 286 92 290 70Z" fill="#c7a0a0"/><path d="M292 76 C304 96 304 124 296 136" stroke="#f3e5e0" stroke-width="3" fill="none"/>'; },
    post: function (p, r, b, P) { return band(24, 70, 296, 60, 10, r, '#f1e2df', P[5]) + band(30, 152, 296, 146, 8, r, P[4], P[5]); } }));

  /* ---------- suínos ---------- */
  cut('panceta', 'Panceta', block({
    face: function (r) { return blk(40, 90, 260, 176, r, 4); }, pal: 'porco', d: [28, -30], top: 'skin', fib: [0, 5, .3],
    pre: layers([[0, .15, 1, .18, 10], [0, .42, 1, .4, 12], [0, .7, 1, .72, 9]]), rim: [8, 'top', .3],
    post: function () { return '<rect x="30" y="80" width="250" height="8" fill="#e9c49c"/>'; }
  }));
  cut('pancetta-suina', 'Pancetta suína', block({
    face: function (r) { return blk(82, 70, 230, 182, r, 4); }, pal: 'porco', d: [36, -30], top: 'skin', fib: [0, 5, .3],
    pre: layers([[0, .2, 1, .22, 11], [0, .45, 1, .46, 9], [0, .68, 1, .66, 13], [0, .88, 1, .9, 7]]),
    post: function () { return '<rect x="70" y="60" width="180" height="11" fill="#ecc59a"/><rect x="70" y="69" width="180" height="5" fill="#fbf2e6"/>'; }
  }));
  cut('costelinha-suina', 'Costelinha suína', steak({ pal: 'porco', face: function (r) { return blk(36, 70, 284, 140, r, 6); }, th: 16, marb: 24, fib: [90, 4, .3],
    over: function (p) { var g = ''; [70, 120, 170, 220, 266].forEach(function (x, i) { g += boneL(p, x - 4, 150, x + 4, 62, 11, 0); }); return g; } }));
  cut('lombo-suino', 'Lombo suíno', block({
    face: function (r) { return ell(150, 128, 84, 56, r, .05, 14); }, pal: 'porco', d: [34, -26], top: 'fat', fib: [20, 5, .2], marb: 6, rim: [9, 'top', .4]
  }));
  cut('copa-lombo', 'Copa lombo', steak({ pal: 'porco', face: function (r) { return ell(160, 100, 102, 62, r, .18, 14); }, th: 20, marb: 70,
    pre: function (p, r, b, P) { return band(80, 70, 230, 140, 6, r, P[4], P[5]) + band(120, 150, 250, 80, 4, r, P[4], P[5]); }, rim: [7, 'bot', .5] }));

  /* ---------- cordeiro ---------- */
  cut('carre-cordeiro', 'Carré de cordeiro', block({
    face: function (r) { return ell(130, 140, 70, 42, r, .06, 14); }, pal: 'cordeiro', d: [30, -26], top: 'fat', marb: 10, fib: [10, 5, .2], rim: [9, 'top', .45],
    over: function (p) { return boneL(p, 176, 122, 262, 50, 11, 1) + boneL(p, 196, 132, 284, 64, 11, 1) + boneL(p, 210, 148, 300, 84, 11, 1); }
  }));
  cut('pernil-cordeiro', 'Pernil de cordeiro', steak({ pal: 'cordeiro', face: function (r) { return ell(160, 100, 100, 60, r, .2, 14); }, th: 20, marb: 18, fib: [50, 4, .3], rim: [7, 'right', .4],
    pre: function (p, r, b, P) { return band(70, 80, 250, 130, 3, r, '#e9d6d6', P[5]); },
    post: function (p, r) { return boneX(150, 104, 15, 12, r); } }));

  /* ---------- embutidos ---------- */
  function sausage(o) {
    return function (p, r) {
      var c = o.c, g = '<defs><linearGradient id="' + p + 'k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c[0] + '"/><stop offset=".5" stop-color="' + c[1] + '"/><stop offset="1" stop-color="' + c[2] + '"/></linearGradient></defs>';
      g += '<ellipse cx="160" cy="176" rx="132" ry="12" fill="#1F1A17" opacity=".15"/>';
      var path = 'M52 112 C100 90 200 88 268 106';
      g += '<path d="' + path + '" stroke="' + c[2] + '" stroke-width="' + (o.w + 3) + '" fill="none" stroke-linecap="round"/><path d="' + path + '" stroke="url(#' + p + 'k)" stroke-width="' + o.w + '" fill="none" stroke-linecap="round"/>';
      for (var i = 0; i < 26; i++) g += '<circle cx="' + f(50 + r() * 190) + '" cy="' + f(100 + (r() - .5) * 24) + '" r="' + f(1 + r() * 2.2) + '" fill="' + o.fill[2] + '" opacity=".5"/>';
      g += '<path d="M30 112 l-10 -6 M30 112 l-10 6 M290 106 l10 -7 M290 106 l10 5" stroke="#d9c7a8" stroke-width="2"/><path d="M70 100 C110 84 180 82 230 90" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".45"/>';
      // rodela cortada
      g += '<ellipse cx="236" cy="160" rx="' + (o.w / 2 + 6) + '" ry="' + (o.w / 2) + '" fill="' + c[2] + '"/><ellipse cx="236" cy="156" rx="' + (o.w / 2 + 6) + '" ry="' + (o.w / 2) + '" fill="' + c[1] + '"/><ellipse cx="236" cy="155" rx="' + (o.w / 2 + 3) + '" ry="' + (o.w / 2 - 3) + '" fill="' + o.fill[0] + '"/>';
      for (i = 0; i < 34; i++) { var a = r() * 6.28, d = Math.sqrt(r()); g += '<ellipse cx="' + f(236 + Math.cos(a) * d * (o.w / 2)) + '" cy="' + f(155 + Math.sin(a) * d * (o.w / 2 - 5)) + '" rx="' + f(1.2 + r() * 2.8) + '" ry="' + f(1 + r() * 1.8) + '" fill="' + o.fill[1 + (i % 2)] + '"/>'; }
      return g + '<path d="M222 148 q12 -5 26 0" stroke="#fff" stroke-width="1.5" fill="none" opacity=".5"/>';
    };
  }
  A['linguica-toscana'] = make('linguica-toscana', 'Linguiça toscana', sausage({ w: 42, c: ['#f2b8ac', '#de8e84', '#b5655f'], fill: ['#e7958c', '#fbf0e6', '#c46a63'] }));
  A.chorizo = make('chorizo', 'Chorizo', sausage({ w: 44, c: ['#e5806a', '#c6523f', '#8f3328'], fill: ['#c9503c', '#f7e8da', '#8e2a20'] }));
  A.morcilla = make('morcilla', 'Morcilla', sausage({ w: 46, c: ['#5a2224', '#3b1517', '#200a0b'], fill: ['#3a1416', '#efe1cf', '#6d2a2a'] }));

  /* ---------- frango ---------- */
  function skin(p, r, d, col) {
    var g = '<path d="' + d + '" fill="' + col[2] + '" transform="translate(0 5)"/><path d="' + d + '" fill="url(#' + p + 'sk)" stroke="' + col[2] + '" stroke-width="1"/>';
    return g;
  }
  function chick(paths, extra) {
    return function (p, r) {
      var col = ['#fbe8c4', '#efcf96', '#d9ab6e'];
      var g = '<defs><radialGradient id="' + p + 'sk" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="' + col[0] + '"/><stop offset=".6" stop-color="' + col[1] + '"/><stop offset="1" stop-color="' + col[2] + '"/></radialGradient><linearGradient id="' + p + 'bn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf4e6"/><stop offset="1" stop-color="#dcc6a0"/></linearGradient></defs><ellipse cx="160" cy="180" rx="128" ry="12" fill="#1F1A17" opacity=".15"/>';
      g += (extra ? extra(p, r) : '');
      paths.forEach(function (d) { g += skin(p, r, d, col); });
      return g + '<path d="M70 84 q30 -14 60 -8 M200 92 q14 -6 26 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".45"/>';
    };
  }
  A['coxa-sobrecoxa'] = make('coxa-sobrecoxa', 'Coxa e sobrecoxa', chick(['M40 120 C34 76 90 54 140 62 C180 68 196 100 186 130 C176 156 130 168 92 162 C62 158 44 144 40 120Z', 'M168 118 C170 82 214 70 234 96 C246 112 258 130 272 140 C282 148 278 160 266 160 C248 158 232 150 214 150 C188 150 168 140 168 118Z'],
    function (p, r) { return boneL(p, 262, 152, 294, 170, 11, 1) + '<path d="M50 140 C80 166 150 170 186 140 L188 152 C150 182 80 176 50 152Z" fill="#e79d8c"/>'; }));
  A['asa-frango'] = make('asa-frango', 'Asa de frango', chick(['M34 118 C30 94 64 84 92 94 C110 100 124 108 136 116 C130 134 110 142 86 142 C60 142 38 136 34 118Z', 'M130 112 C150 96 196 92 214 104 C220 120 212 136 196 140 C170 146 146 140 132 132Z', 'M206 104 C226 86 268 70 290 80 C298 96 280 116 252 128 C236 134 220 136 210 132Z'],
    function (p) { return boneL(p, 34, 118, 20, 114, 9, 1); }));
  A['coracao-frango'] = make('coracao-frango', 'Coração de frango', function (p, r) {
    var P = PAL.miudo, g = '<defs><radialGradient id="' + p + 'g" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#c2404a"/><stop offset=".6" stop-color="' + P[1] + '"/><stop offset="1" stop-color="' + P[2] + '"/></radialGradient></defs><ellipse cx="160" cy="176" rx="120" ry="12" fill="#1F1A17" opacity=".15"/>';
    [[90, 120, -20, 1], [160, 106, 8, 1.1], [230, 122, 24, 1], [126, 152, -6, .95], [200, 156, 14, .95]].forEach(function (h) {
      g += '<g transform="translate(' + h[0] + ' ' + h[1] + ') rotate(' + h[2] + ') scale(' + h[3] + ')"><path d="M0 34 C-26 14 -26 -16 -14 -24 L14 -24 C26 -16 26 14 0 34Z" fill="url(#' + p + 'g)"/>' +
        '<path d="M-16 -22 C-10 -34 10 -34 16 -22 C10 -16 -10 -16 -16 -22Z" fill="' + P[4] + '" stroke="' + P[5] + '"/><path d="M-6 -30 l-2 -8 M5 -30 l2 -9" stroke="#e7b7b0" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M-12 -8 C-8 6 -2 18 0 28" stroke="#f0d6c8" stroke-width="1.4" fill="none" opacity=".7"/><path d="M-12 -12 q4 -4 10 -3" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".5"/></g>';
    });
    return g;
  });

  window.CUT_ART = A;
})();
