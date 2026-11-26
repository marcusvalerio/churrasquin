/* churrasquin — app/animal.js (dono: motion designer)
 * window.Animal.open(corteId) / window.Animal.close()
 * Modal "de onde vem": animal inteiro -> região acende -> câmera aproxima -> painel explica.
 * Só transform e opacity animam. Sem animação (prefers-reduced-motion, também lido via matchMedia)
 * o estado final aparece direto e tudo continua legível.
 */
(function () {
  'use strict';

  /* lã: sequência de "cachos" (quadráticas que estufam para fora do contorno, sentido horário) */
  function wool(pts, amp) {
    var s = '';
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1;
      var k = amp * (i % 2 ? 1 : 0.8);
      s += ' Q' + ((a[0] + b[0]) / 2 + dy / l * k).toFixed(1) + ',' + ((a[1] + b[1]) / 2 - dx / l * k).toFixed(1) + ' ' + b[0] + ',' + b[1];
    }
    return s;
  }
  function line(a, b, n) { // n pontos entre a e b (inclusive)
    var r = [];
    for (var i = 0; i < n; i++) r.push([Math.round(a[0] + (b[0] - a[0]) * i / (n - 1)), Math.round(a[1] + (b[1] - a[1]) * i / (n - 1))]);
    return r;
  }

  /* ---------- Pranchas anatômicas (viewBox 0 0 600 360, perfil, cabeça à esquerda, chão em y=342) ----------
   * body: contorno contínuo do animal com os membros do lado de cá (vira clipPath).
   * far: membros do lado oposto (atrás). head: caixa da cabeça [x0,y0,x1,y1] (a câmera evita cortá-la ao meio).
   * regioes: polígonos que particionam o plano com vértices compartilhados; o clipPath do corpo
   * recorta cada um, então dentro da silhueta não sobra buraco nem sobreposição.
   * [id, polígonos ('|' separa partes) ou path 'M…', rótuloX, rótuloY] */
  var ASA_FRANGO = 'M238,152 C262,136 314,134 362,142 C404,149 436,162 456,180 C444,198 412,208 380,212 C338,216 294,210 266,198 C248,190 238,172 238,152 Z';
  var CORACAO = 'M226,232 C220,222 206,228 212,240 L226,254 L240,240 C246,228 232,222 226,232 Z';
  function poly(p) { return 'M' + p.trim().replace(/ +/g, ' L') + ' Z'; }

  var ANIMAIS = {
    boi: {
      nome: 'boi',
      head: [24, 60, 124, 212],
      body: 'M30,186 C30,176 34,166 40,156 C50,138 64,118 80,104 C88,98 98,94 108,95 ' +
        'C124,98 142,95 156,84 C168,70 190,60 212,62 C232,64 245,80 252,98 ' +
        'C266,108 302,111 342,111 C390,111 432,108 468,104 C488,102 504,106 520,112 ' +
        'C534,116 546,118 557,124 C570,134 577,160 575,190 C573,214 567,232 559,246 ' +
        'C552,256 546,266 550,276 C556,282 556,290 550,298 C547,306 546,314 547,320 C548,329 552,335 555,342 L528,342 ' +
        'C528,334 530,327 529,318 C527,305 528,293 530,282 C528,268 518,254 504,247 ' +
        'C494,242 482,244 472,247 C440,257 400,266 360,268 C320,270 288,267 263,262 ' +
        'C253,268 249,280 247,292 C245,304 243,314 243,322 C243,330 245,336 247,342 L220,342 ' +
        'C220,334 222,328 221,320 C219,308 217,298 215,292 C213,280 207,268 200,259 ' +
        'C193,262 184,266 174,265 C150,262 126,246 114,226 C106,212 108,184 118,160 ' +
        'C112,170 108,182 102,190 C92,200 70,207 50,208 C40,208 33,203 31,197 C29,193 29,189 30,186 Z',
      far: [
        'M262,252 C276,270 280,290 276,304 C274,314 272,322 272,328 C272,334 274,338 276,342 L250,342 C250,334 252,326 251,318 C249,300 246,280 244,262 Z',
        'M478,240 C492,252 504,266 506,282 C506,296 502,308 502,320 C503,329 505,336 508,342 L482,342 C482,332 484,324 483,316 C481,300 484,288 482,276 C476,264 468,254 460,248 Z'
      ],
      details: [
        // barbela pendente (dobra), orelha, chifre curto, cauda com vassoura, cascos fendidos
        ['ear', 'M108,104 C122,100 142,106 156,120 C152,129 132,128 116,120 C110,116 106,110 108,104 Z'],
        ['horn', 'M95,101 C91,89 93,77 101,69 C104,70 105,72 104,75 C100,83 101,92 105,99 Z'],
        ['tail', 'M556,126 C570,134 584,156 585,196 C586,232 584,262 582,282 L577,282 C578,262 579,232 578,196 C577,160 567,142 553,132 Z'],
        ['switch', 'M580,270 C592,282 594,310 584,332 C578,335 573,333 571,328 C566,308 569,286 580,270 Z'],
        ['hoof', 'M221,326 L243,326 C244,333 245,338 247,342 L220,342 C220,336 221,331 221,326 Z'],
        ['hoof', 'M529,326 L548,326 C550,333 552,338 555,342 L528,342 C528,336 529,331 529,326 Z'],
        ['hoofd', 'M251,326 L272,326 C273,333 274,338 276,342 L250,342 C250,336 251,331 251,326 Z'],
        ['hoofd', 'M483,326 L503,326 C504,333 506,338 508,342 L482,342 C482,336 483,331 483,326 Z'],
        ['cleft', 'M233,330 L234,342 M538,330 L541,342 M262,330 L263,342 M493,330 L495,342'],
        ['nostril', 'M33,184 C36,180 42,181 42,185 C40,188 35,188 33,184 Z'],
        ['sheath', 'M392,266 C396,276 404,280 412,276 C414,272 413,268 411,266']
      ],
      eye: [80, 126, 4],
      lines: [
        'M64,140 C72,160 82,176 96,188', 'M31,197 C38,199 46,199 52,197', 'M38,158 C44,166 46,174 44,182', // bochecha, boca, chanfro
        'M74,120 C78,116 86,116 89,121', // pálpebra
        'M124,176 C126,196 134,214 148,230', 'M114,206 C124,226 138,244 158,256', 'M134,252 C146,258 158,262 170,264', // dobras da barbela
        'M86,150 C94,160 98,172 100,186', // masseter
        'M198,108 C216,146 232,184 238,222', 'M238,222 C228,238 214,248 206,258', // escápula e braço
        'M168,96 C186,90 210,88 236,96', // base da giba
        'M300,126 C306,166 306,206 300,248', 'M330,124 C336,166 336,210 330,256', 'M360,124 C366,166 366,212 360,260',
        'M390,124 C396,166 396,212 392,258', // costelas
        'M470,112 C494,124 508,150 510,180', 'M510,180 C506,206 504,228 508,246', // ílio e soldra
        'M548,132 C562,160 566,196 556,236', 'M466,200 C482,214 494,232 500,246', // nádega, flanco
        'M538,290 C540,302 541,312 542,324', 'M232,294 C234,306 235,316 235,326', // tendões
        'M210,288 C214,290 218,290 222,288', 'M536,278 C541,280 546,280 550,278' // joelho, jarrete
      ],
      regioes: [
        ['pescoco', '108,0 154,0 160,104 190,170 100,214', 128, 156],
        ['cupim', '154,0 252,0 252,104 160,104', 206, 84],
        ['acem', '252,0 312,0 312,118 292,160 190,170 160,104 252,104', 248, 132],
        ['paleta', '190,170 292,160 300,230 262,280 196,290 200,262', 242, 214],
        ['peito', '100,214 190,170 200,262 196,290 120,300 50,250', 160, 236],
        ['musculo', '120,300 196,290 262,280 280,360 100,360|500,264 548,282 600,282 600,360 500,360', 232, 310],
        ['contrafile', '312,0 440,0 440,128 400,130 312,118', 372, 126],
        ['costela', '292,160 312,118 400,130 400,176 400,202 300,230', 350, 176],
        ['ponta-de-agulha', '300,230 400,202 430,360 280,360 262,280', 344, 250],
        ['file-mignon', '400,130 440,128 440,144 468,160 468,176 400,176', 434, 154],
        ['alcatra', '440,0 484,0 488,140 522,152 512,168 468,160 440,144', 470, 130],
        ['picanha', '484,0 600,0 600,60 562,140 522,152 488,140', 534, 128],
        ['maminha', '400,176 468,176 484,220 410,214 400,202', 442, 196],
        ['fraldinha', '400,202 410,214 484,220 500,264 500,360 430,360', 446, 240],
        ['patinho', '468,160 512,168 522,152 532,210 548,282 500,264 484,220 468,176', 506, 206],
        ['coxao', '522,152 562,140 600,60 600,282 548,282 532,210', 560, 196]
      ]
    },
    porco: {
      nome: 'porco',
      head: [32, 100, 150, 222],
      body: 'M44,174 C56,170 70,166 84,158 C96,150 104,140 114,130 C126,120 140,116 156,113 ' +
        'C200,100 260,93 330,93 C410,93 480,99 520,117 C552,131 571,161 569,198 ' +
        'C567,232 553,257 534,271 C529,284 528,299 530,311 C531,322 533,332 537,342 L512,342 ' +
        'C510,332 508,322 506,313 C503,298 497,288 488,281 C468,284 438,286 400,288 ' +
        'C340,291 272,290 232,283 C225,293 223,306 223,318 C223,328 225,336 227,342 L202,342 ' +
        'C200,332 198,322 196,312 C194,298 188,286 178,277 C160,269 144,257 130,242 ' +
        'C116,229 100,220 82,215 C70,212 60,210 52,206 C44,203 39,198 38,192 ' +
        'C37,186 39,179 44,174 Z',
      far: [
        'M236,274 C248,288 252,304 252,318 C252,328 253,336 255,342 L231,342 C230,332 229,322 228,312 C226,298 226,288 230,280 Z',
        'M470,270 C482,282 488,296 490,310 C491,322 493,332 496,342 L472,342 C470,332 468,322 466,312 C464,298 462,288 460,280 Z'
      ],
      details: [
        ['disc', 'M44,174 C48,180 49,192 45,203 C40,205 36,198 36,189 C36,181 39,175 44,174 Z'],
        ['ear', 'M132,114 C150,102 176,104 184,120 C172,136 138,158 88,170 C86,158 104,130 132,114 Z'],
        ['tailc', 'M552,130 C566,118 582,124 578,138 C574,148 562,142 566,132 C570,124 584,130 582,140'],
        ['hoof', 'M201,330 L223,330 C224,335 225,339 227,342 L202,342 Z'],
        ['hoof', 'M509,330 L531,330 C533,335 535,339 537,342 L512,342 Z'],
        ['hoofd', 'M230,330 L252,330 C253,335 254,339 255,342 L231,342 Z'],
        ['hoofd', 'M469,330 L490,330 C492,335 494,339 496,342 L472,342 Z'],
        ['cleft', 'M213,332 L214,342 M523,332 L524,342 M241,332 L242,342 M481,332 L483,342'],
        ['nostril', 'M40,182 C42,179 45,180 45,183 C44,186 41,186 40,182 Z'],
        ['nostril', 'M40,193 C42,190 45,191 45,194 C44,197 41,197 40,193 Z']
      ],
      eye: [116, 168, 3.2],
      lines: [
        'M54,206 C66,204 78,198 88,190', // boca
        'M110,164 C114,161 120,161 123,165', 'M120,196 C132,214 150,232 168,248', 'M110,212 C124,226 140,240 156,252', // pálpebra, papada
        'M196,116 C212,156 220,200 214,250', 'M214,250 C206,262 196,270 186,276', // escápula e braço
        'M290,118 C296,162 296,208 290,254', 'M330,116 C336,162 336,210 330,258', 'M370,116 C376,162 376,210 370,262', // costelas
        'M470,112 C504,136 520,176 514,222', 'M514,222 C506,244 498,262 490,278', 'M534,140 C550,170 554,208 544,246', // pernil
        'M450,250 C470,260 482,270 488,280' // virilha
      ],
      regioes: [
        ['copa', '140,0 232,0 232,150 150,160 120,110', 182, 132],
        ['paleta-suina', '150,160 232,150 238,215 250,360 120,360 120,250', 196, 226],
        ['lombo', '232,0 480,0 476,148 360,150 232,150', 350, 124],
        ['costela-suina', '232,150 360,150 362,208 238,215', 298, 182],
        ['barriga', '238,215 362,208 360,150 476,148 452,262 444,360 250,360', 390, 238],
        ['pernil', '480,0 600,0 600,360 444,360 452,262 476,148', 520, 196]
      ]
    },
    cordeiro: {
      nome: 'cordeiro',
      head: [38, 104, 150, 182],
      body: 'M46,170 C48,154 58,136 74,124 C88,114 104,110 118,112 C130,112 140,116 150,122' +
        wool([[150, 122], [164, 110], [182, 104]].concat(line([200, 100], [470, 100], 12), [[490, 105], [507, 115], [521, 130], [530, 150], [532, 172], [528, 196], [520, 218], [510, 238], [500, 256]]), 6) +
        ' C498,268 500,280 506,292 C504,306 500,320 500,334 C500,338 502,340 504,342 L488,342' +
        ' C488,332 488,316 490,302 C490,292 486,282 478,272' +
        wool(line([478, 272], [230, 268], 11), 6) +
        ' C230,284 231,300 229,312 C228,324 228,334 230,342 L214,342 C214,332 214,322 213,312 C212,298 210,284 206,272' +
        wool([[206, 272], [194, 262], [182, 250], [170, 236], [160, 222], [150, 208], [138, 196]], 5) +
        ' C126,184 108,170 90,168 C76,168 64,174 56,176 C49,177 45,175 46,170 Z',
      far: [
        'M240,268 C246,282 248,298 246,312 C245,324 245,334 247,342 L232,342 C231,332 232,322 232,312 C232,298 232,284 230,272 Z',
        'M470,268 C474,282 474,296 470,306 C468,318 468,330 470,342 L455,342 C454,330 455,318 456,306 C458,294 460,282 458,272 Z'
      ],
      details: [
        ['ear', 'M114,120 C128,118 150,124 162,136 C154,142 132,138 117,129 C112,126 111,122 114,120 Z'],
        ['tail', 'M524,150 C536,158 538,180 533,204 C526,208 520,200 519,186 Z'],
        ['hoof', 'M214,334 L230,334 L230,342 L214,342 Z'], ['hoof', 'M488,334 L501,334 C502,338 503,340 504,342 L488,342 Z'],
        ['hoofd', 'M232,334 L246,334 L247,342 L232,342 Z'], ['hoofd', 'M455,334 L469,334 L470,342 L455,342 Z'],
        ['cleft', 'M222,336 L222,342 M496,336 L496,342'],
        ['nostril', 'M49,164 C51,162 54,163 54,166 C52,168 50,167 49,164 Z']
      ],
      eye: [92, 132, 3.4],
      lines: [
        'M47,172 C52,174 58,174 63,172', 'M86,128 C90,125 96,126 98,130', 'M70,142 C82,152 96,160 112,166', // boca, pálpebra, face
        'M186,120 C202,152 214,190 216,232', 'M270,124 C276,162 276,202 270,242', 'M310,124 C316,164 316,208 310,250',
        'M350,124 C356,164 356,208 350,252', 'M450,118 C478,142 494,178 492,222', // escápula, costelas, coxa
        'M213,312 C218,314 224,314 229,312', 'M490,300 C495,302 500,302 505,298', // joelho, jarrete
        'M492,262 C494,276 498,286 504,292' // tendão
      ],
      regioes: [
        ['paleta-cordeiro', '130,0 252,0 252,170 240,260 250,360 150,360 150,210 120,110', 196, 176],
        ['carre', '252,0 440,0 440,165 252,170', 346, 140],
        ['costela-cordeiro', '252,170 440,165 452,262 456,360 250,360 240,260', 346, 222],
        ['pernil-cordeiro', '440,0 600,0 600,360 456,360 452,262 440,165', 488, 186]
      ]
    },
    frango: {
      nome: 'frango',
      head: [128, 30, 214, 116],
      body: 'M160,78 C160,62 172,52 186,52 C202,52 212,64 212,80 C214,96 220,110 232,122 ' +
        'C250,138 280,142 310,138 C350,132 390,120 420,100 C436,84 446,64 462,48 ' +
        'C476,40 492,42 500,54 C508,68 506,86 498,100 C512,104 522,114 520,128 ' +
        'C514,146 498,160 484,170 C478,200 462,228 438,246 C428,262 416,282 398,288 ' +
        'C382,293 364,290 354,280 C326,276 284,266 246,246 C214,228 192,202 186,172 C182,150 184,130 190,116 ' +
        'C182,106 172,98 166,92 C162,88 160,84 160,78 Z',
      far: [],
      legs: [
        // canela (tarso) e dedos: perna de trás mais escura
        ['legd', 'M408,282 C409,296 410,308 412,322 M412,322 L436,332 M412,322 L418,340 M412,322 L396,334 M412,322 L406,316'],
        ['leg', 'M378,288 C377,300 375,312 372,324 M372,324 L346,334 M372,324 L378,341 M372,324 L394,333 M372,324 L380,316']
      ],
      details: [
        ['comb', 'M166,60 C160,46 168,36 175,47 C176,32 189,30 191,44 C195,32 208,34 205,48 C212,44 217,52 206,60 C200,54 194,52 186,52 C178,52 171,55 166,60 Z'],
        ['beak', 'M160,70 C152,70 142,74 135,80 C143,82 152,82 160,82 Z'],
        ['wattle', 'M162,86 C158,98 162,110 170,106 C175,98 171,90 166,84 Z'],
        ['earlobe', 'M193,80 C197,77 202,81 200,87 C196,89 192,86 193,80 Z'],
        ['wing', ASA_FRANGO],
        ['scale', 'M374,296 L381,298 M373,305 L380,307 M372,314 L379,316']
      ],
      eye: [180, 70, 3.4],
      lines: [
        // penas da asa (coberteiras e rêmiges)
        'M266,160 C296,152 336,152 370,160', 'M262,176 C300,170 344,172 392,182', 'M300,196 C340,198 384,198 432,186',
        'M380,170 L452,182', 'M392,160 L440,170',
        'M448,74 C462,64 478,58 494,60', 'M440,96 C460,86 482,84 504,92', 'M468,118 C484,112 500,112 514,118', // cauda
        'M206,90 C212,104 218,116 228,126', 'M196,186 C212,214 236,236 262,248', // pescoço, peito
        'M332,226 C356,220 384,224 412,238', 'M350,246 C368,244 386,248 400,256' // coxa (penas)
      ],
      regioes: [
        ['peito-frango', 'M190,96 L330,96 L430,104 L456,180 C444,198 412,208 380,212 L334,216 L338,360 L100,360 L100,140 Z ' + ASA_FRANGO + ' ' + CORACAO, 222, 186],
        ['asa', ASA_FRANGO, 340, 182],
        ['coxa', 'M456,180 L486,166 L540,220 L600,360 L338,360 L334,216 L380,212 C412,208 444,198 456,180 Z', 404, 250],
        ['coracao', CORACAO, 226, 222]
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
    '.anm-reg{fill:var(--c-gordura,#F2E2C4);fill-opacity:.07;stroke:var(--c-osso,#F7F0E6);stroke-opacity:.55;stroke-width:1;stroke-dasharray:4 2.5;stroke-linejoin:round;cursor:pointer}',
    '.anm-reg:hover{fill-opacity:.2}',
    '.anm-reg:focus{outline:none}',
    '.anm-reg:focus-visible{stroke:var(--c-gordura,#F2E2C4);stroke-opacity:1;stroke-width:3;stroke-dasharray:none}',
    '.anm-none{pointer-events:none}',
    '.anm-ground{opacity:.6}',
    '.anm-reg,.anm-lit,.anm-peek{fill-rule:evenodd}',
    '.anm-disc{fill:var(--c-sal,#B9ACA0);fill-opacity:.75;stroke:var(--c-osso,#F7F0E6);stroke-width:1}',
    '.anm-cleft{fill:none;stroke:var(--c-osso,#F7F0E6);stroke-opacity:.7;stroke-width:.8}',
    '.anm-wing{fill:none;stroke:var(--c-osso,#F7F0E6);stroke-width:1.1;stroke-opacity:.85}',
    '.anm-scale{fill:none;stroke:var(--c-carvao,#1C1512);stroke-width:.9;stroke-opacity:.6}',
    '.anm-skin{fill:var(--c-sal,#B9ACA0);fill-opacity:.2}',
    '.anm-far{fill:var(--c-sal,#B9ACA0);fill-opacity:.1;stroke:var(--c-osso,#F7F0E6);stroke-opacity:.35;stroke-width:1}',
    '.anm-weight{fill:var(--c-osso,#F7F0E6);fill-opacity:.6}',
    '.anm-line{fill:none;stroke:var(--c-osso,#F7F0E6);stroke-width:1.3;stroke-linejoin:round}',
    '.anm-mus{fill:none;stroke:var(--c-osso,#F7F0E6);stroke-opacity:.28;stroke-width:.9;stroke-linecap:round}',
    '.anm-ear,.anm-wattle,.anm-earlobe{fill:var(--c-sal,#B9ACA0);fill-opacity:.55;stroke:var(--c-osso,#F7F0E6);stroke-width:1}',
    '.anm-horn,.anm-beak{fill:var(--c-gordura,#F2E2C4);fill-opacity:.85;stroke:var(--c-carvao,#1C1512);stroke-width:.8}',
    '.anm-tail,.anm-switch{fill:var(--c-sal,#B9ACA0);fill-opacity:.5;stroke:var(--c-osso,#F7F0E6);stroke-width:1}',
    '.anm-switch{fill-opacity:.8}',
    '.anm-tailc,.anm-sheath{fill:none;stroke:var(--c-osso,#F7F0E6);stroke-width:1.6;stroke-linecap:round}',
    '.anm-sheath{stroke-width:1;stroke-opacity:.6}',
    '.anm-hoof{fill:var(--c-carvao,#1C1512);stroke:var(--c-osso,#F7F0E6);stroke-width:1}',
    '.anm-hoofd{fill:var(--c-carvao,#1C1512);stroke:var(--c-sal,#B9ACA0);stroke-width:.8}',
    '.anm-nostril{fill:var(--c-carvao,#1C1512)}',
    '.anm-comb{fill:var(--c-brasa,#E85D24);fill-opacity:.75;stroke:var(--c-osso,#F7F0E6);stroke-width:1}',
    '.anm-wattle{fill:var(--c-brasa,#E85D24);fill-opacity:.6}',
    '.anm-leg{fill:none;stroke:var(--c-gordura,#F2E2C4);stroke-width:6;stroke-linecap:round;stroke-linejoin:round;stroke-opacity:.8}',
    '.anm-legd{fill:none;stroke:var(--c-sal,#B9ACA0);stroke-width:4.5;stroke-linecap:round;stroke-linejoin:round;stroke-opacity:.45}',
    '.anm-eye{fill:var(--c-carvao,#1C1512);stroke:var(--c-osso,#F7F0E6);stroke-width:.8}',
    '.anm-glint{fill:var(--c-osso,#F7F0E6)}',
    '.anm-lit,.anm-peek{pointer-events:none;stroke:var(--c-gordura,#F2E2C4);stroke-width:1.5;opacity:0;transition:opacity var(--dur-2,260ms) ease}',
    '.anm-lit{fill:var(--c-brasa,#E85D24);fill-opacity:.88}',
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
    '@media all{',
    ' .anm-body{grid-template-columns:1fr;grid-template-rows:minmax(220px,44vh) 1fr}',
    ' .anm-stage{padding:0 12px}',
    ' .anm-panel{position:relative;margin-top:10px;border-radius:var(--r-lg,22px) var(--r-lg,22px) 0 0;background:var(--c-carvao,#1C1512);padding:6px 18px 32px;transform:translateY(40%)}',
    ' .anm-lbl{font-size:12.5px}',
    ' .anm-grab{display:block;width:44px;height:5px;border-radius:3px;background:var(--c-sal,#B9ACA0);margin:6px auto 4px;opacity:.6}',
    '}',
    /* v3 "riso de brasa": modal em papel creme; o palco do animal segue impresso em tinta carvão */
    '.anm-root{--c-osso:#17120F;--c-carvao:#FBF1DE;--c-carvao-2:#FBF1DE;--c-sal:#5A4E44;color:#17120F}',
    '.anm-backdrop{background:#17120F}',
    '.anm-in .anm-backdrop{opacity:.6}',
    '.anm-head{border-bottom:2px solid #17120F}',
    '.anm-kicker{font-weight:700;color:#5A4E44}',
    '.anm-btn{border:1.5px solid color-mix(in srgb,#17120F 30%,transparent);background:color-mix(in srgb,#FBF1DE 45%,#fff);color:#17120F;border-radius:999px;font-weight:600}',
    '.anm-btn:hover{border-color:#17120F}',
    '.anm-btn-pri{background:var(--c-brasa,#FF5F1F);border-color:#17120F;color:#17120F;box-shadow:0 2px 0 #17120F}',
    '.anm-root :focus-visible{outline:3px solid #17120F;outline-offset:2px}',
    '.anm-svgwrap{--c-osso:#FBF1DE;--c-carvao:#17120F;--c-sal:#BCAE9E;--c-gordura:#F7DCC0;background:#17120F;isolation:isolate}',
    '.anm-svgwrap::after{content:"";position:absolute;inset:-50%;pointer-events:none;background-image:radial-gradient(circle,rgba(243,234,219,.5) 0 .7px,transparent 1.1px);background-size:4px 4px;transform:rotate(45deg);mix-blend-mode:soft-light;opacity:.5}',
    '.anm-svg{filter:drop-shadow(1.2px -.8px 0 rgba(63,162,149,.35))}',
    '.anm-svgwrap :focus-visible,.anm-reg:focus-visible{stroke:#F7DCC0}',
    '.anm-info strong{color:#17120F}',
    '.anm-title{font-weight:800}',
    '.anm-nomes li{display:inline-flex;align-items:center;gap:6px;border:1.5px solid color-mix(in srgb,#17120F 22%,transparent);background:color-mix(in srgb,#FBF1DE 45%,#fff);border-radius:999px;padding:4px 10px 4px 5px}',
    '.anm-nomes img{width:20px;height:20px}',
    '.anm-nomes abbr{color:#5A4E44}',
    '.anm-h3{font-weight:700;color:#5A4E44}',
    '.anm-bar{grid-template-columns:7.2em 1fr 2.6em}',
    '.anm-bar dt{display:flex;align-items:center;gap:7px;font-weight:600}',
    '.anm-bar dt img{width:22px;height:22px}',
    '.anm-track{background:color-mix(in srgb,#17120F 12%,transparent)}',
    '.anm-fill{background:#17120F}',
    '.anm-bar:nth-child(1) .anm-fill{background:color-mix(in srgb,var(--c-ervas,#1D2A9E) 62%,#17120F)}',
    '.anm-bar:nth-child(2) .anm-fill{background:#C79A6A}',
    '.anm-bar:nth-child(3) .anm-fill{background:var(--c-brasa,#FF5F1F)}',
    '.anm-chip[aria-pressed="true"]{border-color:#17120F;background:#17120F;color:#FBF1DE}',
    '@media all{ .anm-panel{background:color-mix(in srgb,#FBF1DE 45%,#fff);border-top:2px solid #17120F} .anm-grab{background:#17120F;opacity:.35} }',
    /* ficha: resumo sempre visível, sem esperar a coreografia */
    '.anm-panel,.anm-panel>*{opacity:1!important;transform:none!important}',
    '.anm-panel{display:flex;flex-direction:column;gap:10px;padding-top:12px}',
    '.anm-panel>*{flex-shrink:0}',
    '.anm-panel>.anm-h3{margin:10px 0 -4px}',
    '.anm-title{margin:0}.anm-sub{margin:-6px 0 0;font-size:.9rem}',
    '.anm-nota{margin:0;align-self:flex-start;background:#F7DCC0;border:1.5px solid #17120F;border-radius:999px;padding:3px 12px;font-size:.85rem;font-weight:700}',
    '.anm-porque{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:1rem;line-height:1.45}',
    '.anm-porque.anm-open{display:block}',
    '.anm-more{align-self:flex-start;margin:-8px 0 0;background:none;border:0;padding:0 2px;min-height:32px;font:inherit;font-size:.875rem;font-weight:700;color:#17120F;text-decoration:underline;text-decoration-color:#FF5F1F;text-underline-offset:.2em;cursor:pointer}',
    '.anm-bars{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}',
    '.anm-bar{display:grid;grid-template-columns:1fr;gap:6px;padding:8px 10px;border-radius:12px;background:color-mix(in srgb,#FBF1DE 45%,#fff);border:1px solid color-mix(in srgb,#17120F 13%,transparent)}',
    '.anm-bar dt{font-size:.8rem}.anm-bar dt img{width:18px!important;height:18px!important}',
    '.anm-bar dd{display:flex;align-items:center;gap:8px}',
    '.anm-track{flex:1;height:6px}',
    '.anm-num{font-size:.85rem;color:#5A4E44}.anm-num b{font:800 1.25rem/1 var(--font-display,sans-serif);color:#17120F}',
    '.anm-levar{min-height:48px;font-weight:800;font-size:1rem;width:100%}',
    '.anm-levar.anm-on{background:#FBF1DE;box-shadow:none;border-color:color-mix(in srgb,#1D2A9E 58%,#17120F);color:color-mix(in srgb,#1D2A9E 58%,#17120F)}',
    '.anm-ficha{font-size:.95rem}',
    '@media all{',
    ' .anm-body{grid-template-rows:minmax(150px,30vh) 1fr;min-height:0}',
    ' .anm-stage{padding:0 12px}.anm-tools{padding-top:6px}',
    ' .anm-tools .anm-btn{min-height:40px}',
    ' .anm-panel{margin-top:8px;padding:4px 16px 28px;gap:8px}',
    ' .anm-title{font-size:1.75rem}',
    ' .anm-head{padding:4px 6px 4px 16px}',
    ' .anm-dialog{transition:opacity 120ms ease,transform 200ms ease;transform:none}',
    '}',
    '@media (max-height:700px){.anm-body{grid-template-rows:minmax(130px,26vh) 1fr}}',
    /* v7: ficha sobe como sheet dentro da tela do app; título em Rubik pesado; ação em brasa */
    '.anm-root{position:absolute}',
    '.anm-root .anm-dialog{top:2.5rem;border-radius:1.5rem 1.5rem 0 0;transform:translateY(100%);opacity:1;transition:transform 520ms cubic-bezier(.22,1.2,.36,1);box-shadow:0 -10px 40px rgba(23,18,15,.25)}',
    '.anm-root.anm-in .anm-dialog{transform:none}',
    '.anm-root .anm-head{border-bottom:0;padding-top:10px}',
    '.anm-root .anm-title{font-family:Rubik,system-ui,sans-serif;font-weight:900;letter-spacing:-.01em;color:#17120F}',
    '.anm-root .anm-kicker{letter-spacing:.12em;font-size:.75rem}',
    '.anm-root .anm-btn-pri{box-shadow:none;border-color:#FF5F1F}',
    '.anm-root .anm-svgwrap{border-radius:1rem}',
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
    (document.getElementById('screen') || document.body).appendChild(root);
    if (mq) {
      var onMq = function () { if (st.open) finalState(); };
      if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);
    }
  }

  /* ---------- SVG do animal ---------- */
  function regD(spec) {
    if (/^M/.test(spec)) return spec;
    return spec.split('|').map(poly).join(' ');
  }
  function stop(o, c, a) { return sv('stop', { offset: o, style: 'stop-color:' + c + ';stop-opacity:' + a }); }
  function drawAnimal(key, ativa) {
    var a = ANIMAIS[key];
    var OS = 'var(--c-osso,#F7F0E6)', SAL = 'var(--c-sal,#B9ACA0)', CV = 'var(--c-carvao,#1C1512)';
    svgwrap.textContent = '';
    svg = sv('svg', { viewBox: '0 0 600 360', class: 'anm-svg', role: 'group', 'aria-label': 'Mapa de cortes do ' + a.nome + '. Região destacada: ' + (NOMES_REGIAO[ativa] || ativa) });
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    var id = 'anm-' + key, defs = sv('defs', {});
    var cp = sv('clipPath', { id: id + '-clip' }); cp.appendChild(sv('path', { d: a.body })); defs.appendChild(cp);
    // volume: luz de cima/esquerda, ventre e membros na sombra
    var g1 = sv('linearGradient', { id: id + '-vol', x1: 0, y1: 0, x2: 0, y2: 1 });
    [stop(0, OS, .30), stop(.45, SAL, .16), stop(.8, CV, .30), stop(1, CV, .55)].forEach(function (s) { g1.appendChild(s); });
    var g2 = sv('radialGradient', { id: id + '-hl', cx: .38, cy: .3, r: .55 });
    [stop(0, OS, .16), stop(1, OS, 0)].forEach(function (s) { g2.appendChild(s); });
    var hat = sv('pattern', { id: id + '-hatch', width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(35)' });
    hat.appendChild(sv('line', { x1: 0, y1: 0, x2: 0, y2: 5, style: 'stroke:' + CV + ';stroke-width:1;stroke-opacity:.5' }));
    var gm = sv('linearGradient', { id: id + '-hm', x1: 0, y1: 0, x2: 0, y2: 1 });
    [stop(.5, '#fff', 0), stop(.85, '#fff', 1)].forEach(function (s) { gm.appendChild(s); });
    var mk = sv('mask', { id: id + '-mask', maskContentUnits: 'objectBoundingBox' });
    mk.appendChild(sv('rect', { x: 0, y: 0, width: 1, height: 1, fill: 'url(#' + id + '-hm)' }));
    var gg = sv('radialGradient', { id: id + '-gnd' });
    [stop(0, '#000', .75), stop(1, '#000', 0)].forEach(function (s) { gg.appendChild(s); });
    var rim = sv('linearGradient', { id: id + '-rim', x1: 0, y1: 0, x2: 0, y2: 1 });
    [stop(0, OS, 1), stop(.55, OS, .55), stop(1, SAL, .35)].forEach(function (s) { rim.appendChild(s); });
    [g1, g2, hat, gm, mk, gg, rim].forEach(function (n) { defs.appendChild(n); });
    svg.appendChild(defs);
    var clip = 'url(#' + id + '-clip)';
    cam = sv('g', { class: 'anm-cam' });
    var back = sv('g', { 'aria-hidden': 'true' });
    (a.far || []).forEach(function (d) { back.appendChild(sv('path', { d: d, class: 'anm-far' })); });
    (a.legs || []).forEach(function (l) { back.appendChild(sv('path', { d: l[1], class: 'anm-' + l[0] })); });
    (a.details || []).forEach(function (x) { if (x[2]) back.appendChild(sv('path', { d: x[1], class: 'anm-' + x[0] })); });
    // traço de espessura variável: cópia deslocada embaixo vira o "peso" do contorno no lado da sombra
    back.appendChild(sv('path', { d: a.body, class: 'anm-weight', transform: 'translate(1.2 2)' }));
    back.appendChild(sv('path', { d: a.body, class: 'anm-skin' }));
    var regs = sv('g', { 'clip-path': clip });
    litLayer = sv('g', { 'aria-hidden': 'true', 'clip-path': clip });
    peekLayer = sv('g', { 'aria-hidden': 'true', 'clip-path': clip });
    var lbls = sv('g', { 'aria-hidden': 'true' });
    a.regioes.forEach(function (r) {
      var nome = NOMES_REGIAO[r[0]] || r[0], d = regD(r[1]);
      var p = sv('path', { d: d, class: 'anm-reg', 'data-regiao': r[0], tabindex: '0', role: 'button', 'aria-label': nome });
      p.addEventListener('click', function () { peek(r[0]); });
      p.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); peek(r[0]); } });
      regs.appendChild(p);
      if (r[0] === ativa) litLayer.appendChild(sv('path', { d: d, class: 'anm-lit' }));
      var t = sv('text', { x: r[2], y: r[3], class: 'anm-lbl' + (r[0] === ativa ? ' anm-act' : '') });
      t.textContent = nome;
      lbls.appendChild(t);
    });
    var shade = sv('g', { 'aria-hidden': 'true', 'clip-path': clip, class: 'anm-none' });
    shade.appendChild(sv('path', { d: a.body, fill: 'url(#' + id + '-vol)' }));
    shade.appendChild(sv('path', { d: a.body, fill: 'url(#' + id + '-hl)' }));
    shade.appendChild(sv('path', { d: a.body, fill: 'url(#' + id + '-hatch)', mask: 'url(#' + id + '-mask)', opacity: .55 }));
    (a.lines || []).forEach(function (d) { shade.appendChild(sv('path', { d: d, class: 'anm-mus' })); });
    var front = sv('g', { 'aria-hidden': 'true', class: 'anm-none' });
    front.appendChild(sv('path', { d: a.body, class: 'anm-line', stroke: 'url(#' + id + '-rim)' }));
    (a.details || []).forEach(function (x) { if (!x[2]) front.appendChild(sv('path', { d: x[1], class: 'anm-' + x[0] })); });
    front.appendChild(sv('circle', { cx: a.eye[0], cy: a.eye[1], r: a.eye[2], class: 'anm-eye' }));
    front.appendChild(sv('circle', { cx: a.eye[0] - 1, cy: a.eye[1] - 1.2, r: 1, class: 'anm-glint' }));
    // ordem: fundo, regiões, destaque, vizinha, volume/musculatura, contorno e detalhes, rótulos
    [back, regs, litLayer, peekLayer, shade, front, lbls].forEach(function (n) { cam.appendChild(n); });
    svg.appendChild(cam);
    svgwrap.appendChild(svg);
    // sombra no chão proporcional ao corpo (precisa do SVG no DOM para medir)
    var bb = svg.querySelector('.anm-skin').getBBox();
    var gnd = sv('ellipse', { cx: bb.x + bb.width * .52, cy: 343, rx: bb.width * .5, ry: 7, class: 'anm-ground', fill: 'url(#' + id + '-gnd)' });
    back.insertBefore(gnd, back.firstChild);
  }

  function camFor(reg) {
    var p = svg.querySelector('.anm-reg[data-regiao="' + reg + '"]');
    if (!p) return 'none';
    // bbox da região recortada pela silhueta
    var b = p.getBBox(), c = svg.querySelector('.anm-skin').getBBox();
    var x0 = Math.max(b.x, c.x), y0 = Math.max(b.y, c.y), x1 = Math.min(b.x + b.width, c.x + c.width), y1 = Math.min(b.y + b.height, c.y + c.height);
    b = { x: x0, y: y0, width: Math.max(1, x1 - x0), height: Math.max(1, y1 - y0) };
    var r = svgwrap.getBoundingClientRect();
    var vw = 600, vh = 360;
    if (r.width && r.height) {
      var k = Math.min(r.width / 600, r.height / 360);
      vw = r.width / k; vh = r.height / k;
    }
    // zoom moderado: a peça ocupa ~40% do palco na dimensão que manda, com a vizinhança à vista
    var s = Math.min(0.4 * vw / b.width, 0.4 * Math.min(vh, 360) / b.height);
    s = Math.max(1.2, Math.min(s, 1.9));
    var w = vw / s, h = vh / s; // janela visível em unidades do desenho
    function clamp(v, lo, hi) { return lo > hi ? (lo + hi) / 2 : Math.max(lo, Math.min(hi, v)); }
    // centro na peça, preso à silhueta (nunca mostra mais vazio que animal)
    var cx = clamp(b.x + b.width / 2, c.x + w / 2 - 16, c.x + c.width - w / 2 + 16);
    var cy = clamp(b.y + b.height / 2, c.y + h / 2 - 16, c.y + c.height - h / 2 + 16);
    // cabeça: ou entra inteira, ou sai inteira; nunca cortada ao meio
    var hd = ANIMAIS[st.animal].head;
    function fit(cv, half, h0, h1, r0, r1) {
      var v0 = cv - half, v1 = cv + half, m = 6;
      if (v0 > h0 && v0 < h1) {            // borda esquerda/topo atravessa a cabeça
        if (h0 - m + 2 * half >= r1 + m) return h0 - m + half;  // dá para incluir
        return Math.min(h1 + half, r0 - m + half);              // senão, exclui
      }
      if (v1 > h0 && v1 < h1) {
        if (h1 + m - 2 * half <= r0 - m) return h1 + m - half;
        return Math.max(h0 - half, r1 + m - half);
      }
      return cv;
    }
    if (hd) {
      var overY = cy - h / 2 < hd[3] && cy + h / 2 > hd[1], overX = cx - w / 2 < hd[2] && cx + w / 2 > hd[0];
      if (overY) cx = fit(cx, w / 2, hd[0], hd[2], b.x, b.x + b.width);
      if (overX && cx - w / 2 < hd[2] && cx + w / 2 > hd[0]) cy = fit(cy, h / 2, hd[1], hd[3], b.y, b.y + b.height);
    }
    var tx = vw / 2 - s * cx - (vw - 600) / 2, ty = vh / 2 - s * cy - (vh - 360) / 2;
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
    if (c.nota) add(el('p', 'anm-nota', c.nota));
    var pq = add(el('p', 'anm-porque', c.porque || ''));
    var more = el('button', 'anm-more', 'ler mais'); more.type = 'button'; more.setAttribute('aria-expanded', 'false');
    more.addEventListener('click', function () { var o = pq.classList.toggle('anm-open'); more.setAttribute('aria-expanded', o); more.textContent = o ? 'ler menos' : 'ler mais'; });
    add(more);
    var bars = el('dl', 'anm-bars');
    bars.setAttribute('aria-label', 'Perfil');
    [['Maciez', c.maciez], ['Gordura', c.gordura], ['Sabor', c.sabor]].forEach(function (b, j) {
      var v = Math.max(0, Math.min(5, +b[1] || 0));
      var row = el('div', 'anm-bar');
      var dt = el('dt'); var bi = document.createElement('img'); bi.src = 'brand/v3/icons/' + b[0].toLowerCase() + '.svg'; bi.alt = ''; bi.width = 22; bi.height = 22;
      dt.appendChild(bi); dt.appendChild(document.createTextNode(b[0])); row.appendChild(dt);
      var dd = el('dd');
      var tr = el('span', 'anm-track'); tr.setAttribute('aria-hidden', 'true');
      var f = el('span', 'anm-fill'); f.style.display = 'block'; f.style.setProperty('--d', j); f.setAttribute('data-v', v / 5);
      tr.appendChild(f);
      var num = el('span', 'anm-num'); num.innerHTML = '<b>' + v + '</b>/5'; num.setAttribute('aria-label', v + ' de 5');
      dd.appendChild(tr); dd.appendChild(num); row.appendChild(dd); bars.appendChild(row);
    });
    add(bars);
    if (c.id && achar(c.id)) {
      var lev = add(el('button', 'anm-btn anm-btn-pri anm-levar'));
      lev.type = 'button';
      var setLev = function () { var on = window.Plan && window.Plan.has(c.id); lev.textContent = on ? '✓ Na lista' : '+ Levar ' + c.nome; lev.classList.toggle('anm-on', !!on); lev.setAttribute('aria-pressed', on ? 'true' : 'false'); };
      setLev();
      lev.addEventListener('click', function () {
        if (window.Plan) window.Plan.toggle(c.id);
        else { try { document.dispatchEvent(new CustomEvent('corte:levar', { detail: { id: c.id } })); } catch (e) {} }
        setLev();
      });
    }
    var nomes = c.nomes || {};
    var ul = el('ul', 'anm-nomes'); ul.setAttribute('aria-label', 'Nomes em outros países');
    ['ar', 'uy', 'us'].forEach(function (k) {
      if (!nomes[k]) return;
      var li = el('li'); var ab = el('abbr', '', k.toUpperCase()); ab.title = PAIS[k];
      var fl = document.createElement('img'); fl.src = 'brand/v3/icons/pais-' + k + '.svg'; fl.alt = ''; fl.width = 20; fl.height = 20;
      li.appendChild(fl); li.appendChild(ab); li.appendChild(document.createTextNode(nomes[k])); ul.appendChild(li);
    });
    if (ul.children.length) { add(el('h3', 'anm-h3', 'Em outros países')); add(ul); }
    add(el('h3', 'anm-h3', 'Na brasa'));
    var fi = el('dl', 'anm-ficha');
    [['Preparo', c.preparo], ['Ponto', c.ponto], ['Tempo', c.tempo], ['Brasa', c.brasa]].forEach(function (p) {
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
