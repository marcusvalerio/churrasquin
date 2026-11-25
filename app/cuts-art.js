/* churrasquin — ilustrações SVG dos cortes crus (viewBox 0 0 320 220).
   Cada peça é desenhada à mão com primitivas: carne, gordura, osso, marmoreio. */
(function () {
  'use strict';
  var A = {};
  // gerador pseudoaleatório determinístico (marmoreio estável por corte)
  function rng(seed) { var s = 0; for (var i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  function defs(p, kind) {
    var meat = {
      boi: ['#c8414a', '#9e2633', '#6f1622'],
      porco: ['#eaa199', '#d77f78', '#b55c58'],
      cordeiro: ['#c4505a', '#9b3240', '#6e1d2a'],
      frango: ['#f2c2a8', '#e3a184', '#c27a5e'],
      embutido: ['#b4523d', '#8a3527', '#5c1f17'],
      morcilla: ['#4a1c1f', '#2f1013', '#1a0708'],
      miudo: ['#9b2a35', '#6e1622', '#430b13']
    }[kind];
    return '<defs>' +
      '<radialGradient id="' + p + 'm" cx="45%" cy="38%" r="70%"><stop offset="0" stop-color="' + meat[0] + '"/><stop offset=".6" stop-color="' + meat[1] + '"/><stop offset="1" stop-color="' + meat[2] + '"/></radialGradient>' +
      '<linearGradient id="' + p + 'f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf1dc"/><stop offset="1" stop-color="#e6cfa3"/></linearGradient>' +
      '<linearGradient id="' + p + 'b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf6ec"/><stop offset=".55" stop-color="#e9dcc4"/><stop offset="1" stop-color="#c9b48f"/></linearGradient>' +
      '<radialGradient id="' + p + 'g" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '</defs>';
  }
  function svg(id, kind, label, body) {
    var p = 'ca-' + id + '-';
    body = body.replace(/\$/g, p);
    return '<svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustração do corte cru: ' + label + '">' + defs(p, kind) +
      '<ellipse cx="160" cy="196" rx="128" ry="12" fill="#000" opacity=".18"/>' + body + '</svg>';
  }
  var M = 'fill="url(#$m)"', F = 'fill="url(#$f)"', B = 'fill="url(#$b)"', G = 'fill="url(#$g)"';
  var EDGE = ' stroke="#3d0c12" stroke-opacity=".35" stroke-width="1.5"';
  // marmoreio: riscos brancos finos dentro de uma caixa
  function marble(seed, x, y, w, h, n, op) {
    var r = rng(seed), out = '<g stroke="#fbeedd" stroke-linecap="round" fill="none" opacity="' + (op || .7) + '">';
    for (var i = 0; i < n; i++) {
      var sx = x + r() * w, sy = y + r() * h, l = 6 + r() * 16, a = r() * Math.PI;
      var ex = sx + Math.cos(a) * l, ey = sy + Math.sin(a) * l * .6;
      out += '<path d="M' + sx.toFixed(1) + ' ' + sy.toFixed(1) + 'q' + ((ex - sx) / 2 + 3).toFixed(1) + ' ' + ((ey - sy) / 2 - 3).toFixed(1) + ' ' + (ex - sx).toFixed(1) + ' ' + (ey - sy).toFixed(1) + '" stroke-width="' + (0.8 + r() * 1.6).toFixed(1) + '"/>';
    }
    return out + '</g>';
  }
  // fibras (linhas paralelas) para cortes de fibra longa
  function fibers(x1, y1, x2, y2, n, dx, dy, op) {
    var o = '<g stroke="#3d0c12" stroke-opacity="' + (op || .22) + '" stroke-width="1.2" fill="none">';
    for (var i = 0; i < n; i++) o += '<path d="M' + (x1 + dx * i) + ' ' + (y1 + dy * i) + ' Q' + ((x1 + x2) / 2 + dx * i) + ' ' + ((y1 + y2) / 2 + dy * i - 6) + ' ' + (x2 + dx * i) + ' ' + (y2 + dy * i) + '"/>';
    return o + '</g>';
  }
  function shine(cx, cy, rx, ry) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" ' + G + '/>'; }

  // ---------- BOI BR ----------
  A.picanha = svg('picanha', 'boi', 'picanha', // triângulo com capa de gordura grossa no topo
    '<path d="M40 70 Q160 40 284 62 Q250 120 168 182 Q120 150 40 70Z" ' + M + EDGE + '/>' +
    '<path d="M36 70 Q160 36 288 60 L282 80 Q160 58 46 88Z" ' + F + '/>' +
    '<path d="M46 88 Q160 58 282 80" stroke="#d8b98a" stroke-width="2" fill="none"/>' +
    fibers(80, 100, 230, 98, 6, -4, 12) + marble('picanha', 90, 100, 130, 50, 8, .5) + shine(140, 110, 50, 18));

  A.maminha = svg('maminha', 'boi', 'maminha', // gota alongada, ponta afinando
    '<path d="M30 120 Q60 60 160 66 Q250 70 296 112 Q250 150 160 156 Q70 160 30 120Z" ' + M + EDGE + '/>' +
    '<path d="M30 120 Q60 60 160 66 Q120 78 70 108Z" ' + F + ' opacity=".85"/>' +
    fibers(70, 110, 280, 112, 5, 0, 8) + marble('maminha', 80, 90, 180, 50, 10, .45) + shine(150, 100, 60, 16));

  A.fraldinha = svg('fraldinha', 'boi', 'fraldinha', // leque achatado, fibras grossas em leque
    '<path d="M30 150 Q40 70 140 56 Q240 46 292 96 Q270 160 170 172 Q80 182 30 150Z" ' + M + EDGE + '/>' +
    '<g stroke="#3d0c12" stroke-opacity=".28" stroke-width="2" fill="none">' +
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (i) { return '<path d="M60 168 Q' + (110 + i * 18) + ' ' + (110 - i * 4) + ' ' + (110 + i * 22) + ' ' + (62 - (i > 5 ? -(i - 5) * 8 : 0)) + '"/>'; }).join('') +
    '</g>' + '<path d="M30 150 Q60 172 120 176" stroke="url(#$f)" stroke-width="8" fill="none" stroke-linecap="round"/>' + shine(170, 100, 60, 18));

  A.contrafile = svg('contrafile', 'boi', 'contrafilé', // bloco retangular com faixa de gordura lateral
    '<path d="M40 70 Q40 52 60 52 L270 52 Q286 52 286 70 L286 160 Q286 176 268 176 L60 176 Q40 176 40 158Z" ' + M + EDGE + '/>' +
    '<path d="M40 70 Q40 52 60 52 L270 52 Q286 52 286 70 L286 80 L40 80Z" ' + F + '/>' +
    '<path d="M40 80 Q160 86 286 80" stroke="#d8b98a" stroke-width="2" fill="none"/>' +
    marble('contrafile', 56, 92, 216, 76, 16, .55) + shine(150, 115, 80, 20));

  A.ancho = svg('ancho', 'boi', 'ancho (bife ancho)', // bife redondo com olho de gordura central
    '<path d="M60 110 Q56 46 160 40 Q268 44 266 112 Q262 184 160 184 Q62 182 60 110Z" ' + F + '/>' +
    '<path d="M72 112 Q70 58 160 54 Q252 58 252 112 Q250 172 160 172 Q74 170 72 112Z" ' + M + EDGE + '/>' +
    '<path d="M150 84 Q174 80 180 104 Q186 128 162 132 Q138 132 136 110 Q136 90 150 84Z" ' + F + '/>' +
    '<path d="M100 96 Q130 70 150 84 M180 104 Q220 110 236 140 M140 130 Q120 150 96 150" stroke="url(#$f)" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    marble('ancho', 84, 66, 160, 100, 22, .65) + shine(130, 80, 40, 12));

  A['file-mignon'] = svg('file-mignon', 'boi', 'filé mignon', // peça cilíndrica inteira com cabeça, corpo e ponta
    '<path d="M22 120 Q26 70 92 68 Q160 66 222 82 Q280 96 300 120 Q284 140 230 148 Q160 160 92 166 Q24 168 22 120Z" ' + M + EDGE + '/>' +
    '<path d="M60 76 Q120 64 200 78" stroke="#ece0cc" stroke-width="4" fill="none" opacity=".7" stroke-linecap="round"/>' +
    '<path d="M92 68 Q100 116 92 166" stroke="#3d0c12" stroke-opacity=".2" stroke-width="2" fill="none"/>' +
    marble('mignon', 40, 90, 220, 50, 6, .35) + shine(120, 100, 70, 18));

  A.alcatra = svg('alcatra', 'boi', 'alcatra', // peça grande irregular com fibras cruzadas e película
    '<path d="M36 98 Q50 52 130 50 Q210 44 274 70 Q298 110 270 150 Q220 184 140 178 Q56 172 40 140Z" ' + M + EDGE + '/>' +
    '<path d="M150 50 Q170 110 140 178" stroke="#efe4d1" stroke-width="3" fill="none" opacity=".75"/>' +
    fibers(50, 90, 140, 100, 6, 0, 13) + fibers(170, 70, 270, 80, 6, -2, 14) + shine(110, 90, 50, 14) + shine(220, 90, 40, 14));

  A.cupim = svg('cupim', 'boi', 'cupim', // corcova arredondada, muito marmorizada
    '<path d="M40 170 Q30 90 110 52 Q170 26 230 60 Q296 100 284 170 Z" ' + M + EDGE + '/>' +
    '<path d="M40 170 Q160 184 284 170 L284 178 Q160 194 40 178Z" ' + F + '/>' +
    marble('cupim', 60, 60, 210, 106, 46, .8) + shine(150, 80, 50, 16));

  function ribs(seed, n, x0, gap, y1, y2, extra) { // ossos de costela (barras com ponta arredondada)
    var o = '';
    for (var i = 0; i < n; i++) { var x = x0 + i * gap; o += '<rect x="' + x + '" y="' + y1 + '" width="' + (gap * .38) + '" height="' + (y2 - y1) + '" rx="' + (gap * .19) + '" ' + B + ' stroke="#b29d76" stroke-width="1"/>'; }
    return o;
  }
  A.costela = svg('costela', 'boi', 'costela bovina', // placa grossa com ossos aparentes
    '<path d="M24 60 L296 52 L300 170 L20 178Z" ' + M + EDGE + '/>' +
    '<path d="M24 60 L296 52 L297 72 L24 82Z" ' + F + '/>' +
    ribs('c', 6, 36, 46, 84, 172) + marble('costela', 30, 86, 260, 84, 16, .5) +
    '<g fill="url(#$m)" opacity=".9">' + [0, 1, 2, 3, 4].map(function (i) { return '<rect x="' + (54 + i * 46) + '" y="84" width="24" height="88"/>'; }).join('') + '</g>' + marble('costela2', 54, 90, 230, 80, 10, .45));

  A['costela-janela'] = svg('costela-janela', 'boi', 'costela janela', // costela fina com ossos curvos e "janelas" de carne entre eles
    '<path d="M20 70 Q160 50 300 70 L300 160 Q160 140 20 160Z" ' + M + EDGE + '/>' +
    [0, 1, 2, 3, 4].map(function (i) { var x = 46 + i * 56; return '<path d="M' + x + ' 64 Q' + (x + 8) + ' 110 ' + x + ' 156" stroke="url(#$b)" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M' + x + ' 64 Q' + (x + 8) + ' 110 ' + x + ' 156" stroke="#b29d76" stroke-width="1" fill="none" transform="translate(6 0)"/>'; }).join('') +
    marble('janela', 30, 76, 260, 70, 12, .45));

  A.acem = svg('acem', 'boi', 'acém', // bloco irregular com nervos e veios
    '<path d="M34 90 Q40 50 110 54 Q170 40 240 56 Q296 70 288 128 Q280 176 200 176 Q120 184 60 166 Q26 140 34 90Z" ' + M + EDGE + '/>' +
    '<path d="M70 70 Q140 120 110 176 M190 56 Q170 120 230 176" stroke="#efe4d1" stroke-width="4" fill="none" opacity=".7"/>' +
    marble('acem', 50, 66, 230, 100, 18, .5) + shine(150, 95, 50, 14));

  A.peito = svg('peito', 'boi', 'peito (brisket)', // placa longa e plana com gordura espessa embaixo
    '<path d="M20 86 Q30 60 80 60 L250 56 Q300 60 300 96 L296 150 Q160 160 24 150Z" ' + M + EDGE + '/>' +
    '<path d="M24 130 Q160 140 296 130 L296 156 Q160 170 22 156Z" ' + F + '/>' +
    fibers(40, 80, 280, 76, 5, 0, 10) + shine(150, 86, 90, 14));

  // ---------- AR/UY ----------
  A.vazio = svg('vazio', 'boi', 'vacío', // membrana fina, larga, com membrana branca e borda de gordura
    '<path d="M20 110 Q40 50 150 52 Q270 50 302 100 Q290 160 180 170 Q60 176 20 110Z" ' + M + EDGE + '/>' +
    '<path d="M24 108 Q40 56 150 58 Q220 58 270 76" stroke="#f1e7d6" stroke-width="10" fill="none" opacity=".55" stroke-linecap="round"/>' +
    '<path d="M30 130 Q90 172 180 168" stroke="url(#$f)" stroke-width="9" fill="none" stroke-linecap="round"/>' +
    fibers(60, 96, 280, 100, 5, 0, 12) + shine(170, 110, 70, 14));

  A.entrana = svg('entrana', 'boi', 'entraña (diafragma)', // tira comprida e fina com película
    '<path d="M14 118 Q60 84 160 96 Q260 104 306 86 L308 118 Q260 140 160 130 Q60 124 14 148Z" ' + M + EDGE + '/>' +
    '<path d="M14 118 Q60 84 160 96 Q260 104 306 86" stroke="#f3ecdf" stroke-width="5" fill="none" opacity=".8"/>' +
    '<g stroke="#3d0c12" stroke-opacity=".3" stroke-width="1.4">' + Array.from({ length: 24 }, function (_, i) { var x = 26 + i * 11.5; return '<path d="M' + x + ' ' + (106 - Math.sin(i / 4) * 6) + ' l4 24"/>'; }).join('') + '</g>');

  A['tira-de-asado'] = svg('tira-de-asado', 'boi', 'tira de asado', // tira longa com cortes transversais de osso (3-4 discos)
    '<path d="M14 80 L306 74 L306 148 L14 154Z" ' + M + EDGE + '/>' +
    '<path d="M14 80 L306 74 L306 88 L14 94Z" ' + F + '/>' +
    [0, 1, 2, 3].map(function (i) { var x = 52 + i * 72; return '<ellipse cx="' + x + '" cy="120" rx="16" ry="22" ' + B + ' stroke="#b29d76"/><ellipse cx="' + x + '" cy="120" rx="7" ry="11" fill="#c9a57a" opacity=".7"/>'; }).join('') +
    marble('tira', 20, 96, 280, 50, 16, .55));

  A.matambre = svg('matambre', 'boi', 'matambre', // manta fina e larga, quase translúcida
    '<path d="M16 70 Q80 50 160 60 Q250 48 304 72 Q296 120 306 160 Q230 176 160 164 Q70 178 14 160 Q26 116 16 70Z" ' + M + EDGE + ' opacity=".92"/>' +
    '<path d="M16 70 Q80 50 160 60 Q250 48 304 72" stroke="url(#$f)" stroke-width="7" fill="none"/>' +
    fibers(30, 80, 290, 84, 7, 0, 11, .16) + shine(160, 110, 110, 30));

  A['ojo-de-bife'] = svg('ojo-de-bife', 'boi', 'ojo de bife', // bife grosso oval, sem tampa, bem marmorizado
    '<path d="M60 116 Q62 52 160 50 Q262 52 264 116 Q262 176 160 178 Q58 176 60 116Z" ' + M + EDGE + '/>' +
    '<path d="M60 116 Q62 52 160 50 Q262 52 264 116" stroke="url(#$f)" stroke-width="6" fill="none"/>' +
    marble('ojo', 76, 66, 172, 100, 26, .6) + shine(130, 84, 40, 12));

  A['bife-de-chorizo'] = svg('bife-de-chorizo', 'boi', 'bife de chorizo', // bife alto retangular com tira de gordura em um lado
    '<path d="M70 52 Q70 40 84 40 L246 40 Q260 40 260 54 L262 174 Q262 186 248 186 L84 186 Q68 186 68 172Z" ' + M + EDGE + '/>' +
    '<path d="M228 40 L246 40 Q260 40 260 54 L262 174 Q262 186 248 186 L230 186 Q240 112 228 40Z" ' + F + '/>' +
    marble('chorizo-b', 84, 54, 140, 120, 18, .55) + shine(140, 80, 40, 14));

  A['colita-de-cuadril'] = svg('colita-de-cuadril', 'boi', 'colita de cuadril', // triângulo curvo tipo bumerangue
    '<path d="M24 150 Q60 64 160 70 Q236 74 298 46 Q284 120 210 150 Q130 178 24 150Z" ' + M + EDGE + '/>' +
    '<path d="M24 150 Q130 178 210 150 Q130 164 30 142Z" ' + F + '/>' +
    fibers(60, 140, 270, 70, 5, 4, -8) + shine(150, 110, 60, 14));

  A.entrecot = svg('entrecot', 'boi', 'entrecot', // bife com vértice de gordura e cordão de "tapa"
    '<path d="M50 120 Q46 54 150 48 Q250 46 272 104 Q282 170 180 182 Q60 188 50 120Z" ' + M + EDGE + '/>' +
    '<path d="M150 48 Q250 46 272 104 Q262 92 238 88 Q206 64 150 60Z" ' + F + '/>' +
    '<path d="M110 70 Q150 120 220 128" stroke="url(#$f)" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    marble('entrecot', 64, 70, 190, 100, 22, .55));

  // ---------- STEAKS US ----------
  A['t-bone'] = svg('t-bone', 'boi', 't-bone', // osso em T separando contrafilé (maior) e filé (menor)
    '<path d="M40 110 Q40 46 140 44 L250 44 Q290 50 290 110 Q290 176 200 182 L120 182 Q40 180 40 110Z" ' + F + '/>' +
    '<path d="M52 112 Q54 58 140 56 L172 56 L172 172 L120 172 Q52 170 52 112Z" ' + M + EDGE + '/>' +
    '<path d="M188 92 L250 92 Q278 100 278 132 Q276 168 220 170 L188 170Z" ' + M + EDGE + '/>' +
    '<path d="M170 50 L190 50 L190 82 L282 82 L282 94 L190 94 L190 178 L170 178Z" ' + B + ' stroke="#b29d76"/>' +
    marble('tbone', 64, 66, 100, 100, 16, .55) + marble('tbone2', 196, 100, 76, 64, 5, .35));

  A.porterhouse = svg('porterhouse', 'boi', 'porterhouse', // como t-bone, filé bem maior
    '<path d="M30 110 Q30 40 130 40 L250 40 Q300 50 300 112 Q298 184 200 186 L120 186 Q30 184 30 110Z" ' + F + '/>' +
    '<path d="M42 112 Q44 52 130 52 L160 52 L160 176 L120 176 Q42 174 42 112Z" ' + M + EDGE + '/>' +
    '<path d="M178 80 L248 80 Q290 92 290 130 Q288 176 220 176 L178 176Z" ' + M + EDGE + '/>' +
    '<path d="M158 46 L178 46 L178 70 L294 70 L294 82 L178 82 L178 182 L158 182Z" ' + B + ' stroke="#b29d76"/>' +
    marble('porter', 54, 64, 100, 104, 16, .55) + marble('porter2', 186, 92, 96, 78, 6, .35));

  A.tomahawk = svg('tomahawk', 'boi', 'tomahawk', // bife alto com osso longo exposto
    '<path d="M22 120 Q22 52 100 50 Q170 50 176 120 Q176 186 100 188 Q22 186 22 120Z" ' + F + '/>' +
    '<path d="M34 120 Q36 64 100 62 Q162 64 164 120 Q162 174 100 176 Q36 174 34 120Z" ' + M + EDGE + '/>' +
    '<path d="M100 88 Q120 90 122 110 Q118 126 100 124 Q86 120 88 104Z" ' + F + ' opacity=".9"/>' +
    '<path d="M150 104 L292 70 Q306 66 308 80 Q310 94 296 98 L156 134Z" ' + B + ' stroke="#b29d76"/>' +
    '<ellipse cx="300" cy="84" rx="12" ry="16" ' + B + ' stroke="#b29d76"/>' +
    marble('toma', 44, 72, 116, 96, 20, .6));

  A.ribeye = svg('ribeye', 'boi', 'ribeye', // bife com olho central + tampa (spinalis) em crescente
    '<path d="M50 116 Q48 50 160 46 Q272 50 270 116 Q268 182 160 184 Q52 182 50 116Z" ' + F + '/>' +
    '<path d="M62 118 Q64 62 160 60 Q256 62 258 118 Q256 132 240 120 Q226 82 160 84 Q96 84 82 124 Q66 134 62 118Z" ' + M + EDGE + ' opacity=".95"/>' +
    '<path d="M86 128 Q94 92 160 92 Q224 92 232 128 Q228 170 160 172 Q92 170 86 128Z" ' + M + EDGE + '/>' +
    '<ellipse cx="160" cy="124" rx="12" ry="9" ' + F + '/>' +
    marble('ribeye', 92, 98, 136, 70, 18, .6) + marble('ribeye2', 70, 64, 180, 30, 10, .5));

  A['ny-strip'] = svg('ny-strip', 'boi', 'NY strip', // bife em formato de "bota" com tira de gordura
    '<path d="M40 70 Q40 52 60 52 L240 52 Q286 56 288 100 Q290 150 248 176 L60 180 Q40 180 40 160Z" ' + M + EDGE + '/>' +
    '<path d="M40 70 Q40 52 60 52 L240 52 Q286 56 288 100 L272 104 Q268 70 236 68 L40 68Z" ' + F + '/>' +
    marble('ny', 54, 78, 220, 90, 16, .5) + shine(130, 104, 60, 14));

  A['flat-iron'] = svg('flat-iron', 'boi', 'flat iron', // retângulo achatado com nervo central visível
    '<path d="M24 86 Q24 66 50 66 L276 62 Q298 64 298 88 L298 140 Q296 160 272 160 L48 164 Q24 164 24 140Z" ' + M + EDGE + '/>' +
    '<path d="M30 113 L292 111" stroke="#f1e6d2" stroke-width="5" fill="none" opacity=".85"/>' +
    marble('flat', 34, 72, 256, 84, 22, .55));

  A.denver = svg('denver', 'boi', 'denver steak', // bife retangular com fibras diagonais e veios
    '<path d="M50 66 L270 58 Q286 60 284 80 L276 162 Q274 176 258 176 L60 180 Q44 180 44 164Z" ' + M + EDGE + '/>' +
    fibers(60, 70, 160, 170, 10, 22, 0, .2) + marble('denver', 56, 70, 220, 100, 14, .5));

  A['tri-tip'] = svg('tri-tip', 'boi', 'tri-tip', // bumerangue triangular sem tampa
    '<path d="M18 160 Q60 80 150 64 Q240 50 302 66 Q262 108 212 140 Q130 186 18 160Z" ' + M + EDGE + '/>' +
    '<path d="M150 64 Q240 50 302 66 Q240 66 180 80Z" ' + F + '/>' +
    fibers(50, 150, 180, 80, 6, 18, 6) + fibers(200, 80, 290, 70, 4, -4, 12) + shine(150, 110, 50, 14));

  A['short-rib'] = svg('short-rib', 'boi', 'short rib', // blocos de carne alta sobre osso curto
    [0, 1, 2].map(function (i) { var x = 30 + i * 92; return '<rect x="' + x + '" y="60" width="80" height="102" rx="12" ' + M + EDGE + '/>' + '<rect x="' + x + '" y="60" width="80" height="18" rx="9" ' + F + '/>' + '<rect x="' + (x + 4) + '" y="156" width="72" height="22" rx="10" ' + B + ' stroke="#b29d76"/>' + marble('sr' + i, x + 6, 80, 68, 72, 9, .6); }).join(''));

  // ---------- PORCO ----------
  A['pancetta-suina'] = svg('pancetta-suina', 'porco', 'pancetta (barriga suína)', // camadas alternadas carne/gordura + couro
    '<path d="M20 64 L300 58 L302 172 L18 176Z" ' + F + EDGE + '/>' +
    '<path d="M20 64 L300 58 L300 70 L20 76Z" fill="#e7c49a"/>' +
    '<path d="M20 92 Q160 84 302 92 L302 112 Q160 104 20 116Z" ' + M + '/>' +
    '<path d="M18 136 Q160 128 302 138 L302 160 Q160 150 18 162Z" ' + M + '/>');

  A['costelinha-suina'] = svg('costelinha-suina', 'porco', 'costelinha suína', // ripa com muitos ossos finos
    '<path d="M18 74 Q160 60 302 80 L296 158 Q160 146 22 162Z" ' + M + EDGE + '/>' +
    Array.from({ length: 8 }, function (_, i) { var x = 34 + i * 35; return '<path d="M' + x + ' 72 L' + (x + 4) + ' 158" stroke="url(#$b)" stroke-width="10" stroke-linecap="round"/>'; }).join('') +
    '<path d="M18 74 Q160 60 302 80" stroke="url(#$f)" stroke-width="8" fill="none"/>');

  A['lombo-suino'] = svg('lombo-suino', 'porco', 'lombo suíno', // peça cilíndrica longa com capa fina de gordura
    '<path d="M20 90 Q20 62 56 62 L270 62 Q304 64 302 112 Q300 162 268 162 L56 162 Q20 162 20 134Z" ' + M + EDGE + '/>' +
    '<path d="M20 90 Q20 62 56 62 L270 62 Q304 64 302 100 L20 82Z" ' + F + ' opacity=".9"/>' +
    shine(150, 116, 110, 18) + '<ellipse cx="290" cy="112" rx="12" ry="46" fill="#c4675f" opacity=".5"/>');

  A['copa-lombo'] = svg('copa-lombo', 'porco', 'copa-lombo (sobrepaleta)', // seção redonda bem marmorizada
    '<path d="M50 116 Q50 48 160 46 Q270 48 270 116 Q270 184 160 184 Q50 184 50 116Z" ' + M + EDGE + '/>' +
    '<path d="M90 80 Q150 120 120 176 M200 60 Q180 120 240 150" stroke="url(#$f)" stroke-width="7" fill="none" stroke-linecap="round"/>' +
    marble('copa', 66, 62, 190, 116, 28, .75));

  A.panceta = svg('panceta', 'porco', 'panceta (corte em tiras)', // tiras grossas com couro, empilhadas
    [0, 1, 2].map(function (i) { var y = 56 + i * 44; return '<g transform="rotate(' + (i - 1) * 4 + ' 160 ' + (y + 18) + ')"><rect x="30" y="' + y + '" width="260" height="38" rx="8" ' + F + EDGE + '/><rect x="30" y="' + (y + 10) + '" width="260" height="10" ' + M + '/><rect x="30" y="' + (y + 26) + '" width="260" height="7" ' + M + '/><rect x="30" y="' + y + '" width="260" height="5" rx="3" fill="#d9a873"/></g>'; }).join(''));

  A['linguica-toscana'] = svg('linguica-toscana', 'embutido', 'linguiça toscana', // gomos em espiral/corrente
    [0, 1, 2, 3].map(function (i) { var x = 30 + i * 66; return '<rect x="' + x + '" y="' + (90 + (i % 2) * 14) + '" width="64" height="40" rx="20" ' + M + EDGE + '/><ellipse cx="' + (x + 26) + '" cy="' + (100 + (i % 2) * 14) + '" rx="18" ry="5" fill="#fff" opacity=".3"/>' + '<g fill="#f2d8c0" opacity=".7">' + [10, 24, 38, 50].map(function (d, k) { return '<circle cx="' + (x + d) + '" cy="' + (110 + (i % 2) * 14 + (k % 2 ? 6 : -4)) + '" r="2.4"/>'; }).join('') + '</g>'; }).join('') +
    [0, 1, 2].map(function (i) { var x = 92 + i * 66; return '<path d="M' + x + ' ' + (104 + (i % 2) * 6) + ' l4 6 l-4 6" stroke="#e4d2b4" stroke-width="3" fill="none"/>'; }).join(''));

  // ---------- CORDEIRO ----------
  A['carre-cordeiro'] = svg('carre-cordeiro', 'cordeiro', 'carré de cordeiro', // costeletas com ossos limpos (frenched) apontando pra cima
    '<path d="M30 130 Q30 116 46 114 L276 110 Q292 112 292 130 L290 180 L32 182Z" ' + M + EDGE + '/>' +
    '<path d="M30 130 Q30 116 46 114 L276 110 Q292 112 292 130 L292 140 L30 142Z" ' + F + '/>' +
    Array.from({ length: 7 }, function (_, i) { var x = 48 + i * 36; return '<path d="M' + x + ' 116 L' + (x + 10) + ' 34" stroke="url(#$b)" stroke-width="12" stroke-linecap="round"/><circle cx="' + (x + 10) + '" cy="34" r="7" ' + B + '/>'; }).join('') +
    marble('carre', 40, 146, 240, 30, 10, .5));

  A['pernil-cordeiro'] = svg('pernil-cordeiro', 'cordeiro', 'pernil de cordeiro', // pernil em gota com osso saindo pela ponta
    '<path d="M24 120 Q30 52 120 50 Q210 52 238 110 Q240 160 180 180 Q90 196 40 166 Q20 150 24 120Z" ' + M + EDGE + '/>' +
    '<path d="M28 110 Q40 56 120 54 Q190 56 220 90" stroke="url(#$f)" stroke-width="12" fill="none" opacity=".9" stroke-linecap="round"/>' +
    '<path d="M222 126 L292 106" stroke="url(#$b)" stroke-width="16" stroke-linecap="round"/><circle cx="296" cy="104" r="11" ' + B + ' stroke="#b29d76"/>' +
    shine(110, 110, 60, 20));

  // ---------- FRANGO ----------
  A['coracao-frango'] = svg('coracao-frango', 'miudo', 'coração de frango', // vários coraçõezinhos em cone, com gordura no topo
    [[70, 100], [130, 88], [190, 104], [250, 92], [100, 148], [160, 146], [220, 150]].map(function (c) {
      return '<g transform="translate(' + c[0] + ' ' + c[1] + ')"><path d="M-18 -8 Q-20 -22 0 -22 Q20 -22 18 -8 Q14 16 0 26 Q-14 16 -18 -8Z" ' + M + EDGE + '/><path d="M-17 -12 Q0 -26 17 -12 Q0 -6 -17 -12Z" ' + F + '/><ellipse cx="-6" cy="0" rx="4" ry="8" fill="#fff" opacity=".22"/></g>';
    }).join(''));

  A['coxa-sobrecoxa'] = svg('coxa-sobrecoxa', 'frango', 'coxa e sobrecoxa', // perna inteira com pele e osso na ponta
    '<path d="M30 110 Q34 52 110 52 Q180 54 196 100 Q214 126 248 132 L250 150 Q210 160 180 160 Q120 190 60 170 Q26 150 30 110Z" ' + M + EDGE + '/>' +
    '<path d="M40 90 Q70 60 120 62" stroke="#fff" stroke-width="10" opacity=".25" fill="none" stroke-linecap="round"/>' +
    '<path d="M244 140 L292 132" stroke="url(#$b)" stroke-width="13" stroke-linecap="round"/><circle cx="296" cy="128" r="9" ' + B + '/><circle cx="294" cy="141" r="8" ' + B + '/>' +
    '<g fill="#d79474" opacity=".5">' + Array.from({ length: 14 }, function (_, i) { return '<circle cx="' + (60 + (i * 37) % 130) + '" cy="' + (80 + (i * 23) % 80) + '" r="1.8"/>'; }).join('') + '</g>');

  A['asa-frango'] = svg('asa-frango', 'frango', 'asa de frango', // três falanges: tulipa, meio-da-asa, ponta
    '<path d="M24 150 Q20 120 52 116 Q96 112 118 128 Q130 150 106 162 Q60 176 24 150Z" ' + M + EDGE + '/>' +
    '<path d="M112 130 Q150 88 210 80 Q236 80 238 98 Q236 116 206 122 Q160 134 128 154Z" ' + M + EDGE + '/>' +
    '<path d="M228 86 Q262 56 300 50 Q306 60 296 70 Q264 96 238 104Z" ' + M + EDGE + '/>' +
    '<circle cx="118" cy="140" r="8" fill="#e8c0a6"/><circle cx="232" cy="96" r="7" fill="#e8c0a6"/>' +
    '<g fill="#d79474" opacity=".5">' + Array.from({ length: 12 }, function (_, i) { return '<circle cx="' + (40 + i * 20) + '" cy="' + (150 - i * 6) + '" r="1.6"/>'; }).join('') + '</g>');

  // ---------- EMBUTIDOS ----------
  A.chorizo = svg('chorizo', 'embutido', 'chorizo parrillero', // gomos curtos e gordos amarrados
    [0, 1, 2].map(function (i) { var x = 34 + i * 88; return '<path d="M' + x + ' 110 Q' + x + ' 76 ' + (x + 40) + ' 76 Q' + (x + 82) + ' 76 ' + (x + 82) + ' 110 Q' + (x + 82) + ' 148 ' + (x + 40) + ' 148 Q' + x + ' 148 ' + x + ' 110Z" ' + M + EDGE + '/><ellipse cx="' + (x + 32) + '" cy="90" rx="22" ry="6" fill="#fff" opacity=".28"/>' + '<g fill="#f5dcc0" opacity=".75">' + [[16, 100], [40, 120], [62, 104], [30, 134], [56, 132], [24, 116]].map(function (p) { return '<circle cx="' + (x + p[0]) + '" cy="' + p[1] + '" r="3"/>'; }).join('') + '</g>'; }).join('') +
    [0, 1].map(function (i) { var x = 117 + i * 88; return '<path d="M' + x + ' 104 l4 6 l-4 6" stroke="#e4d2b4" stroke-width="3" fill="none"/>'; }).join(''));

  A.morcilla = svg('morcilla', 'morcilla', 'morcilla', // embutido escuro em ferradura
    '<path d="M60 160 Q24 110 70 70 Q160 20 250 70 Q296 110 260 160" stroke="url(#$m)" stroke-width="44" fill="none" stroke-linecap="round"/>' +
    '<path d="M64 140 Q40 104 80 76 Q160 36 240 76" stroke="#fff" stroke-width="5" opacity=".18" fill="none" stroke-linecap="round"/>' +
    '<path d="M50 168 l20 -6 M250 168 l20 -6" stroke="#e4d2b4" stroke-width="4" stroke-linecap="round"/>' +
    '<g fill="#7a3a34" opacity=".7">' + Array.from({ length: 16 }, function (_, i) { var t = i / 15 * Math.PI; return '<circle cx="' + (160 - Math.cos(t) * 100).toFixed(0) + '" cy="' + (140 - Math.sin(t) * 76).toFixed(0) + '" r="2.4"/>'; }).join('') + '</g>');

  window.CUT_ART = A;
})();
