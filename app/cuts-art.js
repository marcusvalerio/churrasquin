/* churrasquin — ilustrações SVG dos cortes servidos (viewBox 0 0 320 220).
   Cada corte aparece assado no ponto ideal, deitado numa tábua, com fatias
   tombadas mostrando o interior: crosta tostada, anel cinza, centro no ponto.
   Sistema comum (tábua, luz, sal, ervas, fatias) + peça própria de cada corte. */
(function () {
  'use strict';
  var A = {};
  function rng(seed) { var s = 7; for (var i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function f(n) { return Math.round(n * 10) / 10; }

  /* ---------- paletas ---------- */
  // pontos: [centro, meio, anel cinza, crosta]
  var DONE = {
    r1: ['#b3172c', '#c42e3e', '#8e5a52', '#3a1a0d'],   // mal passado
    r2: ['#c8384a', '#d25a63', '#94665a', '#3d1c0e'],   // mal a ao ponto / jugoso
    r3: ['#d9807a', '#cf8f84', '#9a7366', '#40200f'],   // ao ponto
    r4: ['#b08066', '#a2735a', '#8a6048', '#2f150a'],   // bem passado
    p3: ['#f0c2b4', '#e8c4b2', '#d6b39c', '#6b3412'],   // suíno ao ponto
    p4: ['#eccfb8', '#e6c7ad', '#d8b394', '#6b3412'],   // suíno bem
    l2: ['#d0546a', '#d8727c', '#a07a6c', '#3f1e10'],   // cordeiro rosado
    l3: ['#cf8b84', '#c79484', '#a0806c', '#40200f'],
    c4: ['#f6e6cf', '#f0dcc0', '#e3c6a2', '#9a5a1c'],   // frango
    sa: ['#c7735a', '#b8644c', '#a45a44', '#4a1f10'],   // linguiça
    mo: ['#2a0e0e', '#321211', '#3a1614', '#140606']    // morcilla
  };
  function level(ponto) {
    var t = (ponto || '').toLowerCase();
    if (/mal passado$/.test(t)) return 'r1';
    if (/bem/.test(t)) return 'r4';
    if (/mal|jugoso|para menos/.test(t)) return 'r2';
    return 'r3';
  }

  /* ---------- forma paramétrica ---------- */
  function shapePts(rx, ry, form, n) {
    n = n || 56; var pts = [];
    for (var i = 0; i < n; i++) {
      var t = i / n * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
      var x = Math.sign(c) * Math.pow(Math.abs(c), .8), y = Math.sign(s) * Math.pow(Math.abs(s), .8);
      if (form === 'oval') { x = c; y = s; }
      if (form === 'wedge') { x *= 1 - .32 * (y + 1) / 2; if (y < 0) y *= .8; }
      if (form === 'dome') { if (y > 0) y *= .45; x *= 1 - .15 * (y + 1) / 2; }
      if (form === 'tri') { var r = 1 + .16 * Math.cos(3 * t + 1.57); x = c * r; y = s * r; }
      if (form === 'bean') { y += .28 * x * x - .14; }
      if (form === 'long') { x = Math.sign(c) * Math.pow(Math.abs(c), .4); y = Math.sign(s) * Math.pow(Math.abs(s), .4); }
      if (form === 'tear') { x *= 1 - .45 * (x + 1) / 2 * (x > 0 ? 1 : 0); y *= 1 - .4 * Math.max(0, x); }
      pts.push([x * rx, y * ry]);
    }
    return pts;
  }
  function path(pts, dx, dy) {
    dx = dx || 0; dy = dy || 0; var n = pts.length, d = '';
    for (var i = 0; i < n; i++) {
      var p0 = pts[i], p1 = pts[(i + 1) % n], m0 = [(pts[(i - 1 + n) % n][0] + p0[0]) / 2, (pts[(i - 1 + n) % n][1] + p0[1]) / 2], m1 = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
      if (!i) d += 'M' + f(m0[0] + dx) + ' ' + f(m0[1] + dy);
      d += 'Q' + f(p0[0] + dx) + ' ' + f(p0[1] + dy) + ' ' + f(m1[0] + dx) + ' ' + f(m1[1] + dy);
    }
    return d + 'Z';
  }

  /* ---------- defs ---------- */
  function defs(p, o) {
    var d = DONE[o.done], cr = o.crust;
    return '<defs>' +
      '<linearGradient id="' + p + 'wd" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="' + o.wood[0] + '"/><stop offset="1" stop-color="' + o.wood[1] + '"/></linearGradient>' +
      '<linearGradient id="' + p + 'we" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + o.wood[2] + '"/><stop offset="1" stop-color="#3a1f10"/></linearGradient>' +
      '<radialGradient id="' + p + 'lt" cx="35%" cy="20%" r="75%"><stop offset="0" stop-color="#fff3d6" stop-opacity=".35"/><stop offset="1" stop-color="#fff3d6" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + p + 'd" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="' + d[0] + '"/><stop offset=".55" stop-color="' + d[1] + '"/><stop offset=".78" stop-color="' + d[2] + '"/><stop offset=".9" stop-color="' + d[2] + '"/><stop offset="1" stop-color="' + d[3] + '"/></radialGradient>' +
      '<linearGradient id="' + p + 's" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + d[3] + '"/><stop offset=".09" stop-color="' + d[2] + '"/><stop offset=".22" stop-color="' + d[1] + '"/><stop offset=".5" stop-color="' + d[0] + '"/><stop offset=".78" stop-color="' + d[1] + '"/><stop offset=".91" stop-color="' + d[2] + '"/><stop offset="1" stop-color="' + d[3] + '"/></linearGradient>' +
      '<linearGradient id="' + p + 'cr" x1="0" y1="0" x2=".2" y2="1"><stop offset="0" stop-color="' + cr[0] + '"/><stop offset=".45" stop-color="' + cr[1] + '"/><stop offset="1" stop-color="' + cr[2] + '"/></linearGradient>' +
      '<linearGradient id="' + p + 'ft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b0661f"/><stop offset=".3" stop-color="#e3a650"/><stop offset=".7" stop-color="#f4dca6"/><stop offset="1" stop-color="#fbeed0"/></linearGradient>' +
      '<linearGradient id="' + p + 'fs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a85e1c"/><stop offset=".35" stop-color="#e2a24c"/><stop offset="1" stop-color="#f8e6bb"/></linearGradient>' +
      '<linearGradient id="' + p + 'bn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf3e2"/><stop offset=".6" stop-color="#e6d3b0"/><stop offset="1" stop-color="#b8996c"/></linearGradient>' +
      '<linearGradient id="' + p + 'hl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '</defs>';
  }

  /* ---------- cenário ---------- */
  function board(p, r, round) {
    var g = '';
    if (round) {
      g += '<ellipse cx="160" cy="160" rx="150" ry="52" fill="#000" opacity=".35"/>' +
        '<ellipse cx="160" cy="150" rx="148" ry="58" fill="url(#' + p + 'we)"/>' +
        '<ellipse cx="160" cy="143" rx="148" ry="58" fill="url(#' + p + 'wd)"/>';
      for (var i = 1; i < 6; i++) g += '<ellipse cx="160" cy="143" rx="' + (148 - i * 24) + '" ry="' + (58 - i * 9.4) + '" fill="none" stroke="#5c3418" stroke-opacity=".16" stroke-width="1"/>';
      g += '<ellipse cx="160" cy="143" rx="148" ry="58" fill="url(#' + p + 'lt)"/>';
      return g;
    }
    g += '<path d="M22 200 Q160 212 300 200 L300 192 L22 192Z" fill="#000" opacity=".35"/>' +
      '<path d="M30 84 Q26 84 24 90 L12 186 Q11 194 20 194 L300 194 Q309 194 308 186 L296 90 Q294 84 290 84Z" fill="url(#' + p + 'wd)"/>' +
      '<path d="M12 186 Q11 194 20 194 L300 194 Q309 194 308 186 L308 196 Q308 204 299 204 L21 204 Q12 204 12 196Z" fill="url(#' + p + 'we)"/>';
    var gr = '<g fill="none" stroke="#4a2810" stroke-linecap="round">';
    for (var j = 0; j < 9; j++) {
      var y = 92 + j * 11 + r() * 4, w = .4 + r() * .7;
      gr += '<path d="M' + f(20 + r() * 30) + ' ' + f(y) + ' C' + f(100 + r() * 30) + ' ' + f(y + r() * 6 - 3) + ' ' + f(200) + ' ' + f(y + r() * 6 - 3) + ' ' + f(280 + r() * 20) + ' ' + f(y + r() * 3) + '" stroke-width="' + f(w) + '" opacity="' + f(.15 + r() * .15) + '"/>';
    }
    gr += '<ellipse cx="' + f(60 + r() * 180) + '" cy="' + f(150 + r() * 25) + '" rx="7" ry="2.4" stroke-width=".8" opacity=".25"/></g>';
    // canaleta de suco
    g += gr + '<path d="M36 96 L284 96 Q290 96 291 102 L300 180 Q300 186 294 186 L26 186 Q20 186 21 180 L30 102 Q31 96 36 96Z" fill="none" stroke="#3a1d0b" stroke-opacity=".28" stroke-width="2"/>' +
      '<path d="M30 85 L290 85" stroke="#fff2d0" stroke-opacity=".35" stroke-width="1.2"/>' +
      '<path d="M30 84 Q26 84 24 90 L12 186 Q11 194 20 194 L300 194 Q309 194 308 186 L296 90 Q294 84 290 84Z" fill="url(#' + p + 'lt)"/>';
    return g;
  }
  function salt(r, n, x0, y0, w, h) {
    var g = '<g>';
    for (var i = 0; i < n; i++) {
      var x = x0 + r() * w, y = y0 + r() * h, s = 1 + r() * 1.8, a = r() * 90;
      g += '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(s) + '" height="' + f(s) + '" transform="rotate(' + f(a) + ' ' + f(x) + ' ' + f(y) + ')" fill="#fffdf5" opacity="' + f(.7 + r() * .3) + '"/>';
    }
    return g + '</g>';
  }
  function leaf(x, y, a, s, col) {
    col = col || '#3f7a2e';
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ') scale(' + s + ')">' +
      '<path d="M0 0 C6 -9 18 -10 26 -2 C18 6 6 7 0 0Z" fill="' + col + '"/><path d="M0 0 C6 -9 18 -10 26 -2 C18 -4 8 -4 0 0Z" fill="#fff" opacity=".18"/>' +
      '<path d="M-6 3 L22 -2" stroke="#1f4a16" stroke-width="1" stroke-linecap="round" opacity=".7"/></g>';
  }
  function chimi(x, y) { // colherada de chimichurri
    var r = rng('ch' + x + y), g = '<g><ellipse cx="' + x + '" cy="' + y + '" rx="18" ry="7" fill="#5c4a12" opacity=".55"/><ellipse cx="' + x + '" cy="' + (y - 1) + '" rx="16" ry="5.5" fill="#6d7a22" opacity=".9"/>';
    for (var i = 0; i < 16; i++) g += '<circle cx="' + f(x - 13 + r() * 26) + '" cy="' + f(y - 4 + r() * 7) + '" r="' + f(.8 + r() * 1.3) + '" fill="' + (r() > .7 ? '#b8331d' : '#2f5e1a') + '"/>';
    return g + '<ellipse cx="' + (x - 5) + '" cy="' + (y - 3) + '" rx="6" ry="1.5" fill="#fff" opacity=".35"/></g>';
  }
  function rosemary(x, y, a) {
    var g = '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ')"><path d="M0 0 L46 0" stroke="#5a4a22" stroke-width="1.6"/>';
    for (var i = 0; i < 9; i++) { var xx = 4 + i * 4.6; g += '<path d="M' + xx + ' 0 l5 -6 M' + xx + ' 0 l5 6" stroke="#4a6e3a" stroke-width="2.2" stroke-linecap="round"/>'; }
    return g + '</g>';
  }
  function juice(x, y, rx) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + f(rx * .28) + '" fill="#6e1a14" opacity=".35"/>'; }

  /* ---------- interior ---------- */
  var CID = 0;
  function marble(r, rx, ry, n, op, col) {
    var g = '<g stroke="' + (col || '#f7e7cf') + '" stroke-linecap="round" fill="none" opacity="' + (op || .75) + '">';
    for (var i = 0; i < n; i++) {
      var a = r() * Math.PI * 2, d = Math.sqrt(r()) * .78, x = Math.cos(a) * rx * d, y = Math.sin(a) * ry * d, l = 3 + r() * 9, an = r() * Math.PI;
      g += '<path d="M' + f(x) + ' ' + f(y) + ' q' + f(Math.cos(an) * l / 2 + r() * 3 - 1.5) + ' ' + f(Math.sin(an) * l / 2 + r() * 3 - 1.5) + ' ' + f(Math.cos(an) * l) + ' ' + f(Math.sin(an) * l) + '" stroke-width="' + f(.5 + r() * 1.3) + '"/>';
    }
    return g + '</g>';
  }
  function grainLines(rx, ry, n, col) {
    var g = '<g stroke="' + (col || '#5a1a18') + '" stroke-opacity=".22" stroke-width=".7" fill="none">';
    for (var i = 1; i < n; i++) { var y = -ry + i * 2 * ry / n; g += '<path d="M' + f(-rx) + ' ' + f(y) + ' Q0 ' + f(y + 2) + ' ' + f(rx) + ' ' + f(y) + '"/>'; }
    return g + '</g>';
  }
  function speckle(r, rx, ry, n, cols) {
    var g = '<g>';
    for (var i = 0; i < n; i++) { var a = r() * 6.283, d = Math.sqrt(r()) * .85; g += '<circle cx="' + f(Math.cos(a) * rx * d) + '" cy="' + f(Math.sin(a) * ry * d) + '" r="' + f(.6 + r() * 1.5) + '" fill="' + cols[Math.floor(r() * cols.length)] + '"/>'; }
    return g + '</g>';
  }

  // fatia redonda tombada (medalhão). o: {x,y,rx,ry,a,form,th,fat,marb,bone,sausage}
  function slice(p, r, s, c) {
    var pts = shapePts(s.rx, s.ry, s.form || c.form), id = p + 'k' + (CID++), th = s.th || c.th || 6;
    var g = '<g transform="translate(' + s.x + ' ' + s.y + ') rotate(' + (s.a || 0) + ')">' +
      '<path d="' + path(pts, 1, th + 3) + '" fill="#1a0a04" opacity=".35"/>' +
      '<path d="' + path(pts, 0, th) + '" fill="url(#' + p + 'cr)"/>' +
      '<path d="' + path(pts, 0, th / 2) + '" fill="url(#' + p + 'cr)"/>' +
      '<clipPath id="' + id + '"><path d="' + path(pts) + '"/></clipPath>' +
      '<g clip-path="url(#' + id + ')"><path d="' + path(pts) + '" fill="url(#' + p + 'd)"/>';
    if (c.layers) { // barriga: camadas de gordura e carne
      for (var L = 0; L < c.layers; L++) { var yy = -s.ry + (L + .5) * 2 * s.ry / c.layers; if (L % 2) g += '<path d="M' + (-s.rx - 4) + ' ' + f(yy - 2.5) + ' Q0 ' + f(yy + 1.5) + ' ' + (s.rx + 4) + ' ' + f(yy - 2) + ' L' + (s.rx + 4) + ' ' + f(yy + 3) + ' Q0 ' + f(yy + 6) + ' ' + (-s.rx - 4) + ' ' + f(yy + 2.5) + 'Z" fill="#f8ead2" opacity=".92"/>'; }
    }
    if (c.marb) g += marble(r, s.rx, s.ry, c.marb, c.marbOp);
    if (c.grain) g += grainLines(s.rx, s.ry, c.grain);
    if (c.speck) g += speckle(r, s.rx, s.ry, c.speck, c.speckCols);
    if (c.eye) g += '<path d="M' + f(-s.rx * .9) + ' ' + f(-s.ry * .1) + ' Q' + f(-s.rx * .2) + ' ' + f(-s.ry * .9) + ' ' + f(s.rx * .5) + ' ' + f(-s.ry * .55) + '" stroke="#f6e3c3" stroke-width="2.4" fill="none" opacity=".85"/>';
    if (c.fat) { var fy = -s.ry + c.fat * s.ry / 7; g += '<path d="M' + (-s.rx - 6) + ' ' + (-s.ry - 6) + ' H' + (s.rx + 6) + ' V' + f(fy - 3) + ' Q0 ' + f(fy + 4) + ' ' + (-s.rx - 6) + ' ' + f(fy - 3) + 'Z" fill="url(#' + p + 'ft)"/><path d="M' + (-s.rx - 6) + ' ' + f(fy - 3) + ' Q0 ' + f(fy + 4) + ' ' + (s.rx + 6) + ' ' + f(fy - 3) + '" stroke="#9a6a50" stroke-width="1.2" fill="none" opacity=".6"/>'; }
    if (c.ring) g += '<path d="' + path(pts) + '" fill="none" stroke="#d1505a" stroke-width="3" opacity=".55"/>'; // anel de fumaça
    if (c.skin) g += '<path d="M' + (-s.rx - 6) + ' ' + (-s.ry - 6) + ' H' + (s.rx + 6) + ' V' + f(-s.ry + 4) + ' Q0 ' + f(-s.ry + 7) + ' ' + (-s.rx - 6) + ' ' + f(-s.ry + 4) + 'Z" fill="#c8761f"/>';
    g += '<path d="' + path(pts) + '" fill="none" stroke="' + DONE[c.done][3] + '" stroke-width="' + (c.casing ? 3.2 : 2) + '" opacity=".9"/></g>';
    if (s.bone) g += '<ellipse cx="' + f(s.bone[0]) + '" cy="' + f(s.bone[1]) + '" rx="' + s.bone[2] + '" ry="' + f(s.bone[2] * .62) + '" fill="url(#' + p + 'bn)" stroke="#9c7f56" stroke-width="1"/><ellipse cx="' + f(s.bone[0]) + '" cy="' + f(s.bone[1]) + '" rx="' + f(s.bone[2] * .45) + '" ry="' + f(s.bone[2] * .26) + '" fill="#c9875e" opacity=".55"/>';
    g += '<path d="M' + f(-s.rx * .55) + ' ' + f(-s.ry * .55) + ' Q' + f(-s.rx * .1) + ' ' + f(-s.ry * .85) + ' ' + f(s.rx * .35) + ' ' + f(-s.ry * .6) + '" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".35"/>';
    return g + '</g>';
  }
  // tira de bife tombada (fatia longa). s: {x,y,w,l,a}
  function strip(p, r, s, c) {
    var w = s.w, l = s.l, id = p + 'k' + (CID++);
    var d = 'M' + (-w / 2) + ' ' + (-l / 2 + 4) + ' Q' + (-w / 2) + ' ' + (-l / 2) + ' 0 ' + (-l / 2 - 1) + ' Q' + (w / 2) + ' ' + (-l / 2) + ' ' + (w / 2) + ' ' + (-l / 2 + 4) + ' L' + f(w / 2 + 1) + ' ' + (l / 2 - 4) + ' Q' + (w / 2) + ' ' + (l / 2 + 1) + ' 0 ' + (l / 2 + 1) + ' Q' + (-w / 2) + ' ' + (l / 2 + 1) + ' ' + f(-w / 2 - 1) + ' ' + (l / 2 - 4) + 'Z';
    var g = '<g transform="translate(' + s.x + ' ' + s.y + ') rotate(' + s.a + ')">' +
      '<path d="' + d + '" transform="translate(3 4)" fill="#1a0a04" opacity=".35"/>' +
      '<path d="' + d + '" transform="translate(2.5 1)" fill="url(#' + p + 'cr)"/>' +
      '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath><g clip-path="url(#' + id + ')">' +
      '<path d="' + d + '" fill="url(#' + p + 's)"/>';
    if (c.marb) g += marble(r, w / 2, l / 2, Math.round(c.marb / 2), c.marbOp);
    if (c.grain) { g += '<g stroke="#5a1a18" stroke-opacity=".25" stroke-width=".7">'; for (var i = 0; i < 4; i++) g += '<path d="M' + f(-w / 2 + (i + 1) * w / 5) + ' ' + (-l / 2) + ' V' + (l / 2) + '"/>'; g += '</g>'; }
    if (s.fatEnd || c.fat) g += '<rect x="' + (-w / 2 - 2) + '" y="' + (-l / 2 - 2) + '" width="' + (w + 4) + '" height="' + (c.fat ? 3 + c.fat * .9 : 7) + '" fill="url(#' + p + 'ft)"/>';
    if (s.fatSide) g += '<rect x="' + f(w / 2 - s.fatSide) + '" y="' + (-l / 2) + '" width="' + (s.fatSide + 2) + '" height="' + l + '" fill="url(#' + p + 'fs)"/>';
    g += '</g><path d="' + d + '" fill="none" stroke="' + DONE[c.done][3] + '" stroke-width="1.4"/>' +
      '<path d="M' + f(-w / 4) + ' ' + f(-l / 2 + 6) + ' V' + f(l / 2 - 8) + '" stroke="#fff" stroke-opacity=".22" stroke-width="1.4" stroke-linecap="round"/></g>';
    return g;
  }
  function grill(n, x0, y0, len, a, sp) {
    var g = '<g stroke="#1e0a03" stroke-width="3.2" stroke-linecap="round" opacity=".55">';
    for (var i = 0; i < n; i++) g += '<path d="M' + (x0 + i * sp) + ' ' + y0 + ' l' + f(Math.cos(a) * len) + ' ' + f(Math.sin(a) * len) + '"/>';
    return g + '</g>';
  }
  function crustTex(r, x0, y0, w, h, n) { // granulado da crosta
    var g = '<g>';
    for (var i = 0; i < n; i++) g += '<circle cx="' + f(x0 + r() * w) + '" cy="' + f(y0 + r() * h) + '" r="' + f(.5 + r() * 1.2) + '" fill="' + (r() > .5 ? '#1c0a03' : '#c9813f') + '" opacity="' + f(.3 + r() * .4) + '"/>';
    return g + '</g>';
  }

  // peça assada inteira deitada, com face cortada à direita
  // o: {x0,x1,yb,h,frx,form,top: fn extra}
  function roast(p, r, o, c) {
    var x0 = o.x0, x1 = o.x1, yb = o.yb, h = o.h, ry = h / 2, cy = yb - ry, id = p + 'k' + (CID++), L = x1 - x0;
    var top = o.topY || (yb - h - (o.hump || 6));
    var body = 'M' + x1 + ' ' + f(yb - h) + ' C' + f(x1 - L * .35) + ' ' + f(top) + ' ' + f(x0 + L * .15) + ' ' + f(top + 2) + ' ' + f(x0 + 6) + ' ' + f(cy - ry * .3) + ' C' + f(x0 - 4) + ' ' + f(cy + ry * .5) + ' ' + f(x0 + 6) + ' ' + yb + ' ' + f(x0 + 26) + ' ' + yb + ' L' + x1 + ' ' + yb + 'Z';
    var g = '<ellipse cx="' + f((x0 + x1) / 2 + 4) + '" cy="' + (yb + 3) + '" rx="' + f(L / 2 + 10) + '" ry="7" fill="#1a0a04" opacity=".4"/>' +
      '<clipPath id="' + id + '"><path d="' + body + '"/></clipPath><path d="' + body + '" fill="url(#' + p + 'cr)"/><g clip-path="url(#' + id + ')">';
    if (c.fat && !o.noFatTop) {
      g += '<path d="M' + (x0 - 10) + ' ' + (top - 10) + ' H' + (x1 + 10) + ' V' + f(yb - h + c.fat * 1.4) + ' C' + f(x1 - L * .4) + ' ' + f(top + c.fat * 2) + ' ' + f(x0 + 20) + ' ' + f(top + c.fat * 2.4) + ' ' + (x0 - 10) + ' ' + f(cy) + 'Z" fill="#c98a3a"/>' +
        '<g stroke="#7a3d12" stroke-width="1.2" opacity=".55">';
      for (var i = 0; i < 10; i++) g += '<path d="M' + f(x0 + 10 + i * L / 9) + ' ' + f(top - 4) + ' l14 ' + f(c.fat * 2) + ' M' + f(x0 + 24 + i * L / 9) + ' ' + f(top - 4) + ' l-14 ' + f(c.fat * 2) + '"/>';
      g += '</g>';
    }
    if (o.skin) g += '<path d="M' + (x0 - 10) + ' ' + (top - 10) + ' H' + (x1 + 10) + ' V' + f(yb - h + 9) + ' C' + f(x1 - L * .4) + ' ' + f(top + 9) + ' ' + (x0 + 20) + ' ' + f(top + 11) + ' ' + (x0 - 10) + ' ' + f(cy - 6) + 'Z" fill="#d8923a"/>' + speckle(r, 1, 1, 0, []) + crustTex(r, x0, top - 4, L, 14, 40).replace(/#c9813f/g, '#f3c470');
    if (o.grill !== false) g += grill(o.gn || 5, x0 + 8, yb - h - 10, h * 1.4, 1.15, L / (o.gn || 5));
    g += crustTex(r, x0, top, L, h + 10, 50) +
      '<path d="M' + f(x0 + 14) + ' ' + f(top + 7) + ' C' + f(x0 + L * .35) + ' ' + f(top + 2) + ' ' + f(x1 - L * .3) + ' ' + f(top + 3) + ' ' + f(x1 - 8) + ' ' + f(yb - h + 3) + '" stroke="url(#' + p + 'hl)" stroke-width="5" stroke-linecap="round" fill="none" opacity=".8"/></g>';
    if (o.extra) g += o.extra;
    // face cortada
    var fpts = shapePts(o.frx || h * .3, ry, c.form), fid = p + 'k' + (CID++);
    g += '<g transform="translate(' + x1 + ' ' + f(cy) + ')"><clipPath id="' + fid + '"><path d="' + path(fpts) + '"/></clipPath><g clip-path="url(#' + fid + ')"><path d="' + path(fpts) + '" fill="url(#' + p + 'd)"/>';
    if (c.layers) for (var Lr = 1; Lr < c.layers; Lr += 2) g += '<rect x="-40" y="' + f(-ry + Lr * h / c.layers) + '" width="80" height="' + f(h / c.layers * .8) + '" fill="#f8ead2" opacity=".9"/>';
    if (c.marb) g += marble(r, o.frx || h * .3, ry, Math.round(c.marb * .6), c.marbOp);
    if (c.speck) g += speckle(r, o.frx || h * .3, ry, Math.round(c.speck * .6), c.speckCols);
    if (c.fat) g += '<rect x="-40" y="' + f(-ry - 4) + '" width="80" height="' + f(4 + c.fat * ry / 7) + '" fill="url(#' + p + 'ft)"/>';
    if (c.skin) g += '<rect x="-40" y="' + f(-ry - 4) + '" width="80" height="8" fill="#c8761f"/>';
    g += '</g><path d="' + path(fpts) + '" fill="none" stroke="' + DONE[c.done][3] + '" stroke-width="2"/></g>';
    return g;
  }

  /* ---------- montagem ---------- */
  var KIND = {
    boi: { crust: ['#8f4d22', '#5e2a10', '#2e1206'] },
    porco: { crust: ['#c07a34', '#8c4a1c', '#4e230b'] },
    cordeiro: { crust: ['#93522a', '#62301a', '#2f1408'] },
    frango: { crust: ['#e6ad4e', '#c27a26', '#7a3f10'] },
    emb: { crust: ['#9a3d22', '#6e2414', '#3a0e06'] },
    mor: { crust: ['#3a1412', '#220a0a', '#0e0404'] }
  };
  var WOODS = [['#c98f58', '#a2683a', '#7a4826'], ['#b77a47', '#8c5530', '#6a3a1c'], ['#d4a26b', '#b07a46', '#865227']];

  function make(id, label, c, draw) {
    var p = 'ca-' + id + '-', r = rng(id), k = KIND[c.kind || 'boi'];
    CID = 0;
    var o = { done: c.done, crust: c.crustCol || k.crust, wood: WOODS[c.wood != null ? c.wood : Math.floor(r() * 3)] };
    var body = board(p, r, c.round) + draw(p, r, c);
    body += salt(r, c.salt != null ? c.salt : 26, 30, 100, 260, 85);
    return '<svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustração do corte servido: ' + label + ', assado e fatiado na tábua">' + defs(p, o) + body + '</svg>';
  }

  // composição padrão: peça à esquerda + medalhões tombados à direita
  function roastPlate(o) {
    return function (p, r, c) {
      var g = juice(o.jx || 210, o.jy || 172, 60) + roast(p, r, o, c), sl = o.slices;
      for (var i = 0; i < sl.length; i++) g += slice(p, r, sl[i], c);
      if (o.post) g += o.post(p, r, c);
      return g;
    };
  }
  function fan(n, x, y, dx, dy, rx, ry, a0, da, extra) {
    var out = [];
    for (var i = 0; i < n; i++) { var s = { x: x + i * dx, y: y + i * dy, rx: rx, ry: ry, a: a0 + i * da }; for (var k in extra) s[k] = extra[k]; out.push(s); }
    return out;
  }
  // bife inteiro visto de cima com tiras fatiadas
  function steakPlate(o) {
    return function (p, r, c) {
      var pts = shapePts(o.rx, o.ry, o.form || 'oval'), id = p + 'k' + (CID++);
      var g = juice(200, 175, 70) + '<g transform="translate(' + o.x + ' ' + o.y + ') rotate(' + (o.a || 0) + ')">' +
        '<path d="' + path(pts, 2, 12) + '" fill="#1a0a04" opacity=".4"/><path d="' + path(pts, 0, 8) + '" fill="url(#' + p + 'cr)"/><path d="' + path(pts, 0, 4) + '" fill="' + KIND[c.kind || 'boi'].crust[2] + '"/>' +
        '<clipPath id="' + id + '"><path d="' + path(pts) + '"/></clipPath><path d="' + path(pts) + '" fill="url(#' + p + 'cr)"/><g clip-path="url(#' + id + ')">';
      if (o.fatEdge) g += '<path d="' + path(pts) + '" fill="none" stroke="#d29444" stroke-width="' + o.fatEdge + '" transform="translate(' + (o.fatDx || 0) + ' ' + (o.fatDy || -4) + ')"/>';
      g += grill(6, -o.rx, -o.ry - 10, o.ry * 2.6, 1.0, o.rx * .38) + crustTex(r, -o.rx, -o.ry, o.rx * 2, o.ry * 2, 60) +
        '<ellipse cx="' + f(-o.rx * .25) + '" cy="' + f(-o.ry * .45) + '" rx="' + f(o.rx * .5) + '" ry="' + f(o.ry * .25) + '" fill="#fff" opacity=".12"/>';
      if (o.inner) g += o.inner(p, r, c);
      g += '</g>' + (o.over ? o.over(p, r, c) : '') + '</g>';
      for (var i = 0; i < o.strips.length; i++) g += strip(p, r, o.strips[i], c);
      if (o.post) g += o.post(p, r, c);
      return g;
    };
  }
  function strips(n, x, y, dx, dy, w, l, a0, da, extra) {
    var out = [];
    for (var i = 0; i < n; i++) { var s = { x: x + i * dx, y: y + i * dy, w: w, l: l, a: a0 + i * da }; for (var k in extra) s[k] = extra[k]; out.push(s); }
    return out;
  }
  function boneT(p) { return '<path d="M-58 -30 Q0 -40 58 -32 L58 -22 Q12 -26 6 -22 Q2 10 8 44 L-4 46 Q-8 10 -6 -22 Q-12 -26 -58 -20Z" fill="url(#' + p + 'bn)" stroke="#8c6c44" stroke-width="1.2"/><path d="M-50 -28 Q0 -36 50 -29" stroke="#fff" stroke-width="1.5" opacity=".6" fill="none"/>'; }

  var C = {};
  window.CORTES && [].concat(window.CORTES).forEach(function (x) { C[x.id] = x; });
  function D(id, fb) { return level(C[id] ? C[id].ponto : '') || fb; }
  function nm(id, fb) { return C[id] ? C[id].nome : fb; }

  /* ---------- cortes bovinos: peças assadas ---------- */
  A.picanha = make('picanha', nm('picanha', 'Picanha'), { done: 'r2', form: 'wedge', fat: 5, marb: 6, th: 7 }, roastPlate({
    x0: 34, x1: 150, yb: 168, h: 58, frx: 18, hump: 12,
    slices: fan(3, 192, 128, 32, 9, 30, 22, -14, 10, { form: 'wedge' }),
    post: function () { return leaf(56, 182, -20, .8) + chimi(272, 112); }
  }));
  A.maminha = make('maminha', nm('maminha', 'Maminha'), { done: 'r2', form: 'tri', fat: 2, marb: 10, grain: 7 }, roastPlate({
    x0: 30, x1: 146, yb: 168, h: 50, frx: 16, hump: 4,
    slices: fan(4, 182, 132, 28, 7, 24, 19, -20, 9, {})
  }));
  A.fraldinha = make('fraldinha', nm('fraldinha', 'Fraldinha'), { done: 'r3', grain: 6, marb: 6 }, steakPlate({
    x: 92, y: 140, rx: 70, ry: 26, form: 'long', a: -8,
    strips: strips(5, 196, 138, 18, 4, 14, 74, 58, 4, {}),
    post: function () { return chimi(270, 104); }
  }));
  A.contrafile = make('contrafile', nm('contrafile', 'Contrafilé'), { done: 'r2', form: 'dome', fat: 3, marb: 8, th: 7 }, roastPlate({
    x0: 28, x1: 152, yb: 166, h: 52, frx: 20, hump: 2,
    slices: fan(4, 188, 132, 28, 7, 28, 18, -16, 8, { form: 'dome' })
  }));
  A.ancho = make('ancho', nm('ancho', 'Ancho'), { done: 'r2', form: 'oval', fat: 3, marb: 26, marbOp: .85, eye: 1, th: 8, wood: 1 }, roastPlate({
    x0: 32, x1: 146, yb: 168, h: 60, frx: 22, hump: 6,
    slices: fan(3, 190, 130, 34, 10, 32, 23, -12, 10, {}),
    post: function () { return leaf(60, 186, -10, .9); }
  }));
  A['file-mignon'] = make('file-mignon', nm('file-mignon', 'Filé-mignon'), { done: 'r1', form: 'oval', th: 10, salt: 34, round: true }, roastPlate({
    x0: 40, x1: 140, yb: 166, h: 46, frx: 16, hump: 2, gn: 4,
    slices: [{ x: 186, y: 134, rx: 24, ry: 20, a: -6 }, { x: 236, y: 140, rx: 24, ry: 20, a: 8 }, { x: 212, y: 170, rx: 24, ry: 20, a: -4 }],
    post: function () { return rosemary(150, 108, -12); }
  }));
  A.alcatra = make('alcatra', nm('alcatra', 'Alcatra'), { done: 'r2', form: 'oval', marb: 8, grain: 5, th: 7 }, roastPlate({
    x0: 30, x1: 148, yb: 168, h: 54, frx: 20, hump: 8,
    slices: fan(4, 188, 130, 28, 8, 28, 20, -18, 9, {})
  }));
  A.cupim = make('cupim', nm('cupim', 'Cupim'), { done: 'r4', form: 'dome', marb: 30, marbOp: .6, grain: 9, th: 9, crustCol: ['#7a3a16', '#4a1e0a', '#200a03'] }, roastPlate({
    x0: 30, x1: 150, yb: 172, h: 70, frx: 24, hump: 22, grill: false,
    slices: fan(3, 196, 136, 34, 8, 30, 22, -10, 9, { form: 'dome' })
  }));
  A.acem = make('acem', nm('acem', 'Acém'), { done: 'r3', form: 'oval', marb: 22, marbOp: .7, th: 7 }, roastPlate({
    x0: 30, x1: 148, yb: 168, h: 50, frx: 18, hump: 6,
    slices: fan(4, 186, 132, 28, 8, 27, 19, -14, 9, {})
  }));
  A.peito = make('peito', nm('peito', 'Peito'), { done: 'r4', form: 'long', ring: 1, grain: 7, fat: 2, th: 9, crustCol: ['#3a1a0c', '#1e0c05', '#0c0402'] }, roastPlate({
    x0: 24, x1: 156, yb: 166, h: 40, frx: 14, hump: 4, grill: false,
    slices: fan(5, 186, 130, 22, 8, 22, 14, -24, 7, { th: 8 }),
    post: function () { return chimi(276, 176).replace(/#6d7a22/, '#a8521a'); }
  }));
  A.vazio = make('vazio', nm('vazio', 'Vazio'), { done: 'r3', grain: 7, marb: 8, fat: 2 }, steakPlate({
    x: 92, y: 138, rx: 68, ry: 32, form: 'bean', a: 6,
    strips: strips(5, 192, 136, 19, 5, 15, 70, 62, 3, {}),
    post: function () { return leaf(272, 104, 20, .9); }
  }));
  A.entrana = make('entrana', nm('entrana', 'Entraña'), { done: 'r2', grain: 9, wood: 2 }, steakPlate({
    x: 96, y: 136, rx: 80, ry: 14, form: 'long', a: -14,
    inner: function () { return '<g stroke="#2a0d05" stroke-opacity=".35" stroke-width="1">' + [-60, -40, -20, 0, 20, 40, 60].map(function (x) { return '<path d="M' + x + ' -14 l-6 28"/>'; }).join('') + '</g>'; },
    strips: strips(5, 190, 150, 20, -2, 12, 60, 70, -6, {}),
    post: function () { return chimi(80, 174) + leaf(270, 182, -30, .8); }
  }));
  A.matambre = make('matambre', nm('matambre', 'Matambre'), { done: 'r4', form: 'oval', th: 10, crustCol: ['#a35a26', '#6e3412', '#341606'], round: true }, roastPlate({
    x0: 36, x1: 140, yb: 168, h: 52, frx: 22, hump: 2,
    slices: fan(3, 186, 132, 34, 10, 26, 22, -8, 8, {}),
    post: function (p) { // espiral do rocambole nas fatias e na face
      var sp = function (x, y, s) { return '<path d="M' + x + ' ' + y + ' m0 0 a3 2.4 0 1 1 6 0 a6 5 0 1 1 -12 0 a9 7.5 0 1 1 18 0 a12 10 0 1 1 -24 0 a15 12 0 1 1 30 0" transform="translate(' + x + ' ' + y + ') scale(' + s + ') translate(' + (-x) + ' ' + (-y) + ')" fill="none" stroke="#f3d7a8" stroke-width="2.2" opacity=".85"/><path d="M' + x + ' ' + y + ' m-2 1 l3 -2 m6 4 l3 1 m-14 -3 l-2 3" stroke="#3f8a2e" stroke-width="2" stroke-linecap="round"/>'; };
      return sp(140, 142, .7) + sp(184, 132, .8) + sp(218, 142, .8) + sp(252, 152, .8);
    }
  }));
  A['colita-de-cuadril'] = make('colita-de-cuadril', nm('colita-de-cuadril', 'Colita de cuadril'), { done: 'r2', form: 'tri', marb: 8, fat: 1, wood: 2 }, roastPlate({
    x0: 40, x1: 140, yb: 168, h: 46, frx: 16, hump: 2,
    slices: fan(4, 176, 130, 30, 9, 22, 18, -10, 10, { form: 'tri' }),
    post: function () { return chimi(266, 104) + leaf(52, 186, 0, .8); }
  }));
  A['tri-tip'] = make('tri-tip', nm('tri-tip', 'Tri-tip'), { done: 'r2', form: 'tear', marb: 10, grain: 5, crustCol: ['#5a2a12', '#33150a', '#140603'] }, roastPlate({
    x0: 30, x1: 150, yb: 168, h: 50, frx: 18, hump: 14,
    slices: fan(4, 186, 128, 30, 10, 28, 17, -30, 14, { form: 'tear' }),
    post: function () { return rosemary(36, 110, 8); }
  }));
  A.denver = make('denver', nm('denver', 'Denver steak'), { done: 'r2', marb: 22, marbOp: .8 }, steakPlate({
    x: 92, y: 140, rx: 58, ry: 34, form: 'oval', a: -4,
    strips: strips(4, 196, 136, 22, 6, 18, 64, 52, 6, {}),
    post: function () { return leaf(272, 100, 10, .8); }
  }));
  A['flat-iron'] = make('flat-iron', nm('flat-iron', 'Flat iron'), { done: 'r2', marb: 18, marbOp: .8 }, steakPlate({
    x: 96, y: 138, rx: 70, ry: 28, form: 'long', a: 2,
    inner: function () { return '<path d="M-66 2 Q0 -2 66 2" stroke="#2a0d05" stroke-width="1.6" opacity=".5" fill="none"/>'; },
    strips: strips(5, 196, 140, 18, 3, 15, 54, 30, 5, {})
  }));

  /* ---------- bifes (tiras fatiadas) ---------- */
  function bife(id, fb, conf, sh) { A[id] = make(id, nm(id, fb), conf, steakPlate(sh)); }
  bife('ojo-de-bife', 'Ojo de bife', { done: 'r2', marb: 20, marbOp: .8, wood: 0 }, {
    x: 90, y: 140, rx: 56, ry: 40, form: 'oval',
    inner: function () { return '<ellipse cx="-24" cy="-10" rx="20" ry="14" fill="none" stroke="#c9873e" stroke-width="3" opacity=".6"/>'; },
    strips: strips(4, 196, 136, 22, 6, 19, 66, 46, 7, {}),
    post: function () { return chimi(270, 100); }
  });
  bife('bife-de-chorizo', 'Bife de chorizo', { done: 'r2', marb: 12, fat: 3, wood: 2 }, {
    x: 88, y: 140, rx: 60, ry: 36, form: 'dome', fatEdge: 10, fatDy: -2,
    strips: strips(4, 196, 138, 22, 6, 19, 64, 40, 8, { fatEnd: 1 }),
    post: function () { return leaf(56, 186, -14, .9) + leaf(270, 100, 30, .7); }
  });
  bife('entrecot', 'Entrecot', { done: 'r2', marb: 24, marbOp: .85, wood: 1 }, {
    x: 90, y: 140, rx: 58, ry: 38, form: 'bean', fatEdge: 6,
    strips: strips(4, 198, 136, 22, 7, 18, 64, 50, 8, { fatSide: 3 }),
    post: function () { return rosemary(220, 104, 8); }
  });
  bife('ribeye', 'Ribeye', { done: 'r2', marb: 30, marbOp: .9, wood: 0 }, {
    x: 90, y: 140, rx: 58, ry: 40, form: 'oval', fatEdge: 7,
    inner: function () { return '<path d="M-50 -6 Q-20 -36 30 -28" stroke="#d6964a" stroke-width="4" fill="none" opacity=".7"/>'; },
    strips: strips(4, 198, 136, 22, 6, 20, 64, 44, 7, { fatSide: 4 }),
    post: function () { return chimi(276, 102); }
  });
  bife('ny-strip', 'NY strip', { done: 'r2', marb: 12, fat: 4, wood: 2 }, {
    x: 88, y: 140, rx: 62, ry: 32, form: 'long', fatEdge: 12, fatDy: -3,
    strips: strips(5, 192, 140, 19, 5, 16, 60, 36, 6, { fatEnd: 1 })
  });

  /* ---------- com osso ---------- */
  A['t-bone'] = make('t-bone', nm('t-bone', 'T-bone'), { done: 'r2', marb: 12, fat: 3, wood: 0 }, steakPlate({
    x: 96, y: 138, rx: 70, ry: 46, form: 'oval', fatEdge: 8,
    inner: function (p) { return '<g transform="translate(-8 0)">' + boneT(p) + '</g>'; },
    strips: strips(4, 206, 138, 21, 6, 17, 56, 44, 8, { fatEnd: 1 }),
    post: function () { return leaf(272, 186, -20, .8); }
  }));
  A.porterhouse = make('porterhouse', nm('porterhouse', 'Porterhouse'), { done: 'r2', marb: 12, fat: 3, wood: 1 }, steakPlate({
    x: 96, y: 138, rx: 74, ry: 48, form: 'bean', fatEdge: 8,
    inner: function (p) { return '<g transform="translate(-20 0) scale(1.05)">' + boneT(p) + '</g><ellipse cx="22" cy="20" rx="26" ry="16" fill="#5a2710" opacity=".35"/>'; },
    strips: strips(3, 210, 132, 24, 8, 20, 50, 40, 10, {}).concat(strips(2, 214, 176, 26, 0, 16, 40, 84, 4, {})),
    post: function () { return rosemary(222, 102, 6); }
  }));
  A.tomahawk = make('tomahawk', nm('tomahawk', 'Tomahawk'), { done: 'r2', marb: 26, marbOp: .85, fat: 2, wood: 1 }, steakPlate({
    x: 86, y: 150, rx: 52, ry: 38, form: 'oval', a: 0, fatEdge: 7,
    over: function (p) { return '<path d="M36 -26 Q90 -60 150 -92 Q160 -98 166 -90 Q170 -82 160 -76 Q100 -44 46 -8Z" fill="#1a0a04" opacity=".3" transform="translate(4 6)"/><path d="M36 -26 Q90 -60 150 -92 Q160 -98 166 -90 Q170 -82 160 -76 Q100 -44 46 -8Z" fill="url(#' + p + 'bn)" stroke="#8c6c44" stroke-width="1.2"/><path d="M40 -24 Q60 -36 74 -40 L80 -26 Q62 -18 46 -10Z" fill="#7a3c18" opacity=".8"/><path d="M60 -38 Q110 -64 150 -86" stroke="#fff" stroke-width="2" opacity=".55" fill="none"/>'; },
    strips: strips(4, 200, 158, 22, 4, 18, 56, 60, 6, { fatSide: 3 })
  }));

  // costelas: ripa com ossos + pedaços cortados entre ossos
  function ribs(id, fb, c, o) {
    A[id] = make(id, nm(id, fb), c, function (p, r, cc) {
      var g = juice(200, 176, 80), n = o.n, x0 = o.x0, w = o.w, y = o.y, h = o.h, id2 = p + 'k' + (CID++);
      var seg = (w - 20) / (n - 1), top = 'M' + x0 + ' ' + (y + 10) + ' Q' + x0 + ' ' + y + ' ' + (x0 + 10) + ' ' + y;
      for (var q = 0; q < n - 1; q++) { var qx = x0 + 10 + q * seg; top += ' Q' + f(qx + seg / 2) + ' ' + f(y - 12 - r() * 4) + ' ' + f(qx + seg) + ' ' + f(y + 1); }
      var body = top + ' Q' + (x0 + w) + ' ' + y + ' ' + (x0 + w) + ' ' + (y + 8) + ' L' + (x0 + w + 6) + ' ' + (y + h) + ' Q' + (x0 + w / 2) + ' ' + (y + h + 8) + ' ' + (x0 - 4) + ' ' + (y + h) + 'Z';
      // ossos saindo por baixo
      for (var i = 0; i < n; i++) { var bx = x0 + 10 + i * (w - 20) / (n - 1); g += '<path d="M' + f(bx - o.bw / 2) + ' ' + (y + h - 6) + ' l' + f(o.tilt) + ' ' + o.bl + ' q' + f(o.bw / 2) + ' 6 ' + o.bw + ' 0 l' + f(-o.tilt) + ' ' + (-o.bl) + 'Z" fill="url(#' + p + 'bn)" stroke="#8c6c44" stroke-width="1"/>'; }
      g += '<path d="' + body + '" transform="translate(3 6)" fill="#1a0a04" opacity=".4"/><clipPath id="' + id2 + '"><path d="' + body + '"/></clipPath><path d="' + body + '" fill="url(#' + p + 'cr)"/><g clip-path="url(#' + id2 + ')">';
      for (var j = 1; j < n; j++) { var sx = x0 + 10 + (j - .5) * (w - 20) / (n - 1); g += '<path d="M' + f(sx) + ' ' + (y - 10) + ' q4 ' + (h / 2) + ' 0 ' + (h + 20) + '" stroke="#1a0802" stroke-width="3" opacity=".55" fill="none"/>'; }
      if (cc.glaze) g += '<path d="' + body + '" fill="#a8320e" opacity=".35"/><path d="M' + (x0 + 6) + ' ' + (y + 10) + ' Q' + (x0 + w / 2) + ' ' + (y + 2) + ' ' + (x0 + w - 6) + ' ' + (y + 8) + '" stroke="#ffd9a0" stroke-width="2" opacity=".5" fill="none"/>';
      g += crustTex(r, x0, y - 8, w, h + 10, 70) + '<path d="' + top + '" transform="translate(0 4)" stroke="#ffe2b0" stroke-width="2" opacity=".3" fill="none"/></g>';
      for (var tb = 0; tb < n; tb++) { var tx = x0 + 10 + tb * seg; g += '<ellipse cx="' + f(tx) + '" cy="' + (y + 3) + '" rx="' + f(o.bw * .45) + '" ry="' + f(o.bw * .3) + '" fill="url(#' + p + 'bn)" stroke="#8c6c44" stroke-width=".8"/>'; }
      // pedaços cortados
      for (var k = 0; k < o.cut.length; k++) {
        var s = o.cut[k];
        g += slice(p, r, { x: s[0], y: s[1], rx: o.srx, ry: o.sry, a: s[2], form: o.sform || 'long', bone: [o.srx * .55, o.sry * .45, o.bone] }, cc);
      }
      if (o.post) g += o.post(p, r, cc);
      return g;
    });
  }
  ribs('costela', 'Costela', { done: 'r4', form: 'long', marb: 22, marbOp: .55, grain: 6, th: 10, fat: 3, crustCol: ['#7a3612', '#4a1c08', '#1e0803'] },
    { n: 4, x0: 30, w: 140, y: 100, h: 56, bw: 12, bl: 22, tilt: -2, srx: 30, sry: 20, bone: 9, cut: [[212, 128, -10], [246, 162, 8]] });
  ribs('costela-janela', 'Costela janela', { done: 'r4', form: 'long', marb: 18, marbOp: .55, th: 12, fat: 2, crustCol: ['#7a3612', '#4a1c08', '#1e0803'], wood: 2 },
    { n: 3, x0: 34, w: 130, y: 92, h: 70, bw: 16, bl: 18, tilt: 0, srx: 30, sry: 26, bone: 11, cut: [[214, 130, -6], [250, 166, 6]],
      post: function () { return chimi(276, 106); } });
  ribs('short-rib', 'Short rib', { done: 'r4', form: 'dome', marb: 20, marbOp: .5, th: 14, glaze: 1, crustCol: ['#5a200c', '#3a1206', '#160502'], wood: 1 },
    { n: 3, x0: 40, w: 110, y: 98, h: 60, bw: 14, bl: 16, tilt: 2, srx: 28, sry: 24, sform: 'dome', bone: 10, cut: [[200, 132, -8], [244, 150, 6], [214, 176, 0]] });
  ribs('costelinha-suina', 'Costelinha suína', { kind: 'porco', done: 'p4', form: 'long', th: 7, glaze: 1, crustCol: ['#c0601e', '#8a3410', '#4a1606'] },
    { n: 6, x0: 26, w: 160, y: 104, h: 44, bw: 8, bl: 20, tilt: -3, srx: 22, sry: 13, bone: 6, cut: [[214, 132, -24], [240, 152, -14], [266, 174, -4]],
      post: function () { return leaf(64, 186, -6, .8); } });

  A['tira-de-asado'] = make('tira-de-asado', nm('tira-de-asado', 'Tira de asado'), { done: 'r3', marb: 10, fat: 1, th: 6, crustCol: ['#8f4a1e', '#5e2a10', '#2a1005'], wood: 0 }, function (p, r, c) {
    var g = juice(160, 176, 120);
    // tiras longas cortadas transversalmente: ossos ovais em linha
    [[52, 118, -6], [46, 148, -3], [180, 178, 4]].forEach(function (t, ti) {
      var id = p + 'k' + (CID++), d = 'M0 0 Q60 -6 120 -2 Q130 4 126 16 Q60 22 2 20 Q-8 12 0 0Z';
      if (ti === 2) d = 'M0 0 Q50 -5 96 -2 Q106 4 102 16 Q50 21 2 20 Q-8 12 0 0Z';
      g += '<g transform="translate(' + t[0] + ' ' + t[1] + ') rotate(' + t[2] + ')"><path d="' + d + '" transform="translate(2 7)" fill="#1a0a04" opacity=".4"/><path d="' + d + '" transform="translate(0 4)" fill="url(#' + p + 'cr)"/><clipPath id="' + id + '"><path d="' + d + '"/></clipPath><path d="' + d + '" fill="url(#' + p + 'cr)"/><g clip-path="url(#' + id + ')">' + crustTex(r, 0, -4, 130, 26, 30) + grill(6, 6, -6, 30, 1.2, 20) + '</g>';
      for (var b = 0; b < (ti === 2 ? 3 : 4); b++) g += '<ellipse cx="' + (16 + b * 32) + '" cy="9" rx="7" ry="8.5" fill="url(#' + p + 'bn)" stroke="#8c6c44" stroke-width="1"/><ellipse cx="' + (16 + b * 32) + '" cy="9" rx="3" ry="4" fill="#b8704a" opacity=".6"/>';
      g += '</g>';
    });
    g += slice(p, r, { x: 220, y: 120, rx: 18, ry: 13, a: -10, form: 'long', bone: [10, 0, 6] }, c) + slice(p, r, { x: 262, y: 136, rx: 18, ry: 13, a: 8, form: 'long', bone: [10, 0, 6] }, c);
    return g + chimi(70, 182);
  });

  /* ---------- suínos ---------- */
  function belly(id, fb, wood) {
    A[id] = make(id, nm(id, fb), { kind: 'porco', done: 'p4', form: 'long', layers: 5, skin: 1, th: 8, wood: wood }, roastPlate({
      x0: 28, x1: 150, yb: 170, h: 54, frx: 14, hump: 0, topY: 112, skin: 1, grill: false,
      extra: (function () { var r = rng(id + 'x'), g = '<g fill="#fbe1a6">'; for (var i = 0; i < 40; i++) g += '<circle cx="' + f(40 + r() * 104) + '" cy="' + f(112 + r() * 10) + '" r="' + f(1 + r() * 2.2) + '" opacity=".75"/>'; return g + '</g>'; })(),
      slices: fan(3, 192, 132, 32, 10, 28, 22, -10, 8, { form: 'long' }),
      post: function () { return leaf(274, 104, 30, .8); }
    }));
  }
  belly('pancetta-suina', 'Pancetta suína', 0);
  belly('panceta', 'Panceta', 2);
  A['lombo-suino'] = make('lombo-suino', nm('lombo-suino', 'Lombo suíno'), { kind: 'porco', done: 'p3', form: 'oval', fat: 2, th: 8, marb: 4 }, roastPlate({
    x0: 30, x1: 150, yb: 168, h: 50, frx: 18, hump: 4,
    slices: fan(4, 186, 130, 28, 8, 26, 20, -12, 8, {}),
    post: function () { return rosemary(40, 108, 4) + rosemary(214, 186, -6); }
  }));
  A['copa-lombo'] = make('copa-lombo', nm('copa-lombo', 'Copa-lombo'), { kind: 'porco', done: 'p4', form: 'oval', marb: 20, marbOp: .55, th: 8, wood: 1 }, roastPlate({
    x0: 32, x1: 148, yb: 168, h: 54, frx: 20, hump: 6,
    slices: fan(3, 190, 130, 32, 10, 30, 23, -10, 9, {}),
    post: function () { return leaf(60, 186, -6, .8); }
  }));

  /* ---------- embutidos ---------- */
  function sausage(id, fb, c, o) {
    A[id] = make(id, nm(id, fb), c, function (p, r, cc) {
      var g = juice(180, 178, 90);
      // gomos inteiros
      o.links.forEach(function (l) {
        var d = 'M' + l[0] + ' ' + l[1] + ' C' + l[2] + ' ' + l[3] + ' ' + l[4] + ' ' + l[5] + ' ' + l[6] + ' ' + l[7];
        g += '<path d="' + d + '" transform="translate(2 7)" stroke="#1a0a04" stroke-opacity=".4" stroke-width="' + (o.thick + 2) + '" fill="none" stroke-linecap="round"/>' +
          '<path d="' + d + '" stroke="url(#' + p + 'cr)" stroke-width="' + o.thick + '" fill="none" stroke-linecap="round"/>' +
          '<path d="' + d + '" transform="translate(-1 ' + (-o.thick * .25) + ')" stroke="#fff" stroke-opacity=".3" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="30 14"/>' +
          (o.grill ? '<path d="' + d + '" stroke="#1a0802" stroke-opacity=".55" stroke-width="' + (o.thick - 4) + '" fill="none" stroke-dasharray="3 16"/>' : '');
      });
      o.rounds.forEach(function (s) { g += slice(p, r, { x: s[0], y: s[1], rx: o.rr, ry: o.rr * .78, a: s[2], th: 7, form: 'oval' }, cc); });
      // barbante nas pontas
      o.ties.forEach(function (t) { g += '<path d="M' + t[0] + ' ' + t[1] + ' q6 -4 10 2 m-5 -1 l4 8" stroke="#e8d6b0" stroke-width="2" fill="none" stroke-linecap="round"/>'; });
      return g + (o.post ? o.post() : '');
    });
  }
  sausage('linguica-toscana', 'Linguiça toscana', { kind: 'emb', done: 'sa', speck: 38, speckCols: ['#f3dcc0', '#f6e6d0', '#8a2a1a', '#e9c49a'], casing: 1, crustCol: ['#b86a34', '#8a4220', '#4a1e0c'] },
    { thick: 24, grill: 1, rr: 19, links: [[40, 110, 80, 96, 120, 100, 160, 112], [34, 150, 74, 136, 118, 140, 150, 156]], rounds: [[192, 124, -8], [232, 134, 6], [270, 150, -4], [212, 166, 4], [252, 178, -6]], ties: [[158, 108], [148, 152]], post: function () { return leaf(74, 184, -8, .8); } });
  sausage('chorizo', 'Chorizo', { kind: 'emb', done: 'sa', speck: 44, speckCols: ['#f5e2c6', '#a61f10', '#7a1408', '#e8b78c'], casing: 1, crustCol: ['#a8401c', '#701e0c', '#3a0a04'], wood: 2 },
    { thick: 26, grill: 1, rr: 20, links: [[36, 118, 70, 100, 120, 104, 156, 118]], rounds: [[64, 162, -6], [108, 168, 8], [190, 130, -4], [232, 142, 6], [212, 178, 0], [262, 172, -10]], ties: [[154, 114]], post: function () { return chimi(276, 108); } });
  sausage('morcilla', 'Morcilla', { kind: 'mor', done: 'mo', speck: 60, speckCols: ['#f1e2c8', '#d9c29a', '#6e2a22', '#5a1a16'], casing: 1, wood: 0 },
    { thick: 26, grill: 0, rr: 20, links: [[40, 120, 60, 92, 140, 92, 158, 122]], rounds: [[70, 166, -4], [192, 132, 6], [236, 140, -6], [214, 176, 4], [262, 178, 8]], ties: [[36, 122], [156, 124]], post: function () { return leaf(120, 160, -20, .8) + leaf(278, 108, 30, .7); } });

  /* ---------- cordeiro ---------- */
  A['carre-cordeiro'] = make('carre-cordeiro', nm('carre-cordeiro', 'Carré de cordeiro'), { kind: 'cordeiro', done: 'l2', form: 'oval', fat: 3, eye: 0, th: 8, wood: 1 }, function (p, r, c) {
    var g = juice(190, 176, 80);
    // rack com ossos limpos (frenched) apontando para cima
    var id = p + 'k' + (CID++), body = 'M30 168 Q28 128 54 124 L156 120 Q172 126 172 166 Q100 176 30 168Z';
    for (var i = 0; i < 5; i++) { var bx = 52 + i * 24; g += '<path d="M' + bx + ' 128 L' + (bx + 14) + ' 84 Q' + (bx + 18) + ' 76 ' + (bx + 24) + ' 82 L' + (bx + 12) + ' 128Z" fill="url(#' + p + 'bn)" stroke="#8c6c44" stroke-width="1"/>'; }
    g += '<path d="' + body + '" transform="translate(3 6)" fill="#1a0a04" opacity=".4"/><clipPath id="' + id + '"><path d="' + body + '"/></clipPath><path d="' + body + '" fill="url(#' + p + 'cr)"/><g clip-path="url(#' + id + ')"><path d="M20 112 H180 V134 Q100 140 20 138Z" fill="#c78a3c" opacity=".75"/>' + crustTex(r, 28, 118, 146, 54, 60) + '</g>';
    g += '<path d="M40 130 Q100 122 160 126" stroke="#3f7a2e" stroke-width="3" stroke-dasharray="2 4" fill="none" opacity=".8"/>';
    // costeletas tombadas (pirulitos)
    [[210, 132, -20], [238, 160, 10], [190, 172, -4]].forEach(function (t) {
      g += '<g transform="translate(' + t[0] + ' ' + t[1] + ') rotate(' + t[2] + ')"><path d="M14 -4 L64 -10 Q72 -10 72 -4 Q72 2 64 2 L14 4Z" fill="url(#' + p + 'bn)" stroke="#8c6c44" stroke-width="1"/></g>';
      g += slice(p, r, { x: t[0], y: t[1], rx: 20, ry: 15, a: t[2] }, c);
    });
    return g + rosemary(40, 186, -4) + chimi(282, 112);
  });
  A['pernil-cordeiro'] = make('pernil-cordeiro', nm('pernil-cordeiro', 'Pernil de cordeiro'), { kind: 'cordeiro', done: 'l3', form: 'oval', fat: 1, th: 8, marb: 6 }, roastPlate({
    x0: 46, x1: 156, yb: 170, h: 62, frx: 22, hump: 14,
    extra: '', jx: 210,
    slices: fan(3, 196, 130, 32, 10, 28, 21, -10, 9, {}),
    post: function (p) { return '<path d="M48 140 Q30 134 18 126 Q10 120 14 114 Q20 108 28 114 Q40 124 54 128Z" fill="url(#' + p + 'bn)" stroke="#8c6c44" stroke-width="1"/>' + rosemary(70, 104, -4) + rosemary(214, 186, -8); }
  }));

  /* ---------- frango ---------- */
  A['coracao-frango'] = make('coracao-frango', nm('coracao-frango', 'Coraçãozinho de frango'), { kind: 'emb', done: 'r4', form: 'tear', th: 5, crustCol: ['#a0522a', '#6a2a12', '#2e0e05'], wood: 2 }, function (p, r, c) {
    var g = '';
    // dois espetos
    [[24, 120, 296, 108], [30, 162, 290, 154]].forEach(function (sk, si) {
      g += '<path d="M' + sk[0] + ' ' + (sk[1] + 8) + ' L' + sk[2] + ' ' + (sk[3] + 8) + '" stroke="#1a0a04" stroke-opacity=".35" stroke-width="5"/><path d="M' + sk[0] + ' ' + sk[1] + ' L' + sk[2] + ' ' + sk[3] + '" stroke="#c9ccd0" stroke-width="3.4" stroke-linecap="round"/><path d="M' + sk[0] + ' ' + (sk[1] - 1) + ' L' + sk[2] + ' ' + (sk[3] - 1) + '" stroke="#fff" stroke-width="1" opacity=".7"/>';
      g += '<rect x="' + (sk[0] - 14) + '" y="' + (sk[1] - 6) + '" width="20" height="12" rx="4" fill="#6a3d1e"/>';
      for (var i = 0; i < 9; i++) {
        var t = .12 + i * .085, x = sk[0] + (sk[2] - sk[0]) * t, y = sk[1] + (sk[3] - sk[1]) * t;
        if (si === 1 && i > 5) continue;
        var a = r() * 30 - 15;
        g += '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(90 + a) + ')"><path d="M-12 -4 Q-12 -14 0 -14 Q12 -14 12 -4 Q11 8 0 15 Q-11 8 -12 -4Z" fill="url(#' + p + 'cr)"/><path d="M-11 -7 Q0 -15 11 -7 L11 -5 Q0 -10 -11 -5Z" fill="#d9a058"/><circle cx="-4" cy="-3" r="3" fill="#fff" opacity=".18"/><path d="M-4 -2 Q-2 6 2 10" stroke="#fff" stroke-width="1.4" opacity=".3" fill="none"/></g>';
      }
    });
    // corações abertos ao meio mostrando interior
    g += slice(p, r, { x: 236, y: 170, rx: 11, ry: 14, a: 80 }, c) + slice(p, r, { x: 266, y: 178, rx: 11, ry: 14, a: 100 }, c) + slice(p, r, { x: 250, y: 150, rx: 11, ry: 14, a: 90 }, c);
    return g + leaf(60, 190, -10, .8);
  });
  function chickenSkin(p, r, d) {
    return '<path d="' + d + '" transform="translate(3 7)" fill="#1a0a04" opacity=".4"/><path d="' + d + '" fill="url(#' + p + 'cr)"/>' +
      '<path d="' + d + '" fill="none" stroke="#7a3a0c" stroke-width="1.4" opacity=".6"/>';
  }
  A['coxa-sobrecoxa'] = make('coxa-sobrecoxa', nm('coxa-sobrecoxa', 'Coxa e sobrecoxa'), { kind: 'frango', done: 'c4', form: 'oval', skin: 1, th: 6, wood: 0 }, function (p, r, c) {
    var g = juice(170, 178, 90);
    var leg = 'M0 0 C-6 -30 30 -48 62 -40 C88 -34 96 -10 86 10 C76 30 40 34 22 22 L-20 30 Q-34 34 -36 26 Q-40 20 -32 16Z';
    [[66, 134, -4], [86, 172, 6]].forEach(function (t, i) {
      g += '<g transform="translate(' + t[0] + ' ' + t[1] + ') rotate(' + t[2] + ') scale(.82)">' + chickenSkin(p, r, leg) +
        '<path d="M-36 26 Q-48 30 -52 24 Q-56 16 -48 14 Q-40 12 -32 16" fill="url(#' + p + 'bn)" stroke="#8c6c44" stroke-width="1"/>' +
        crustTex(r, 0, -40, 90, 60, 30) +
        '<path d="M20 -34 C46 -42 76 -34 84 -14" stroke="#fff6d8" stroke-width="4" stroke-linecap="round" fill="none" opacity=".45"/></g>';
    });
    // sobrecoxa fatiada: carne clara com osso
    g += slice(p, r, { x: 220, y: 128, rx: 30, ry: 20, a: -10, bone: [8, 4, 6] }, c) + slice(p, r, { x: 254, y: 162, rx: 28, ry: 19, a: 10 }, c);
    return g + leaf(276, 102, 20, .8) + rosemary(150, 190, -10);
  });
  A['asa-frango'] = make('asa-frango', nm('asa-frango', 'Asa de frango'), { kind: 'frango', done: 'c4', form: 'oval', skin: 1, th: 5, wood: 2, crustCol: ['#eab04a', '#c4741e', '#7a3a0a'] }, function (p, r, c) {
    var g = juice(160, 176, 110);
    // tulipas (drumettes) e meio da asa
    var tul = 'M0 0 C0 -20 34 -26 46 -12 C54 -2 48 14 30 16 L-14 8 Q-24 8 -24 2 Q-24 -4 -14 -4Z';
    var mid = 'M0 0 C10 -16 60 -16 70 -2 C74 8 64 18 50 16 L10 16 C-2 16 -4 8 0 0Z';
    [[50, 116, 10, tul], [56, 156, -8, tul], [140, 120, 6, mid], [150, 168, -4, mid], [224, 110, 16, tul]].forEach(function (t) {
      g += '<g transform="translate(' + t[0] + ' ' + t[1] + ') rotate(' + t[2] + ')">' + chickenSkin(p, r, t[3]) +
        (t[3] === tul ? '<path d="M-24 2 Q-30 -4 -26 -8 Q-20 -10 -14 -4" fill="url(#' + p + 'bn)"/>' : '') +
        crustTex(r, 0, -16, 60, 30, 18) + '<path d="M8 -10 C24 -16 40 -14 50 -6" stroke="#fff4d0" stroke-width="3" stroke-linecap="round" fill="none" opacity=".5"/></g>';
    });
    g += slice(p, r, { x: 244, y: 160, rx: 20, ry: 14, a: -8, bone: [0, 0, 4] }, c);
    return g + chimi(272, 108).replace(/#6d7a22/, '#c0411a') + leaf(230, 190, -12, .8);
  });

  window.CUT_ART = A;
})();
