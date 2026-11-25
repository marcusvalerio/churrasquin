/* churrasquin — app/animal.js (dono: motion designer)
 * window.Animal.open(corteId) / window.Animal.close()
 * Modal "de onde vem": animal inteiro -> região acende -> câmera aproxima -> painel explica.
 * Só transform e opacity animam. Sem animação (prefers-reduced-motion, também lido via matchMedia)
 * o estado final aparece direto e tudo continua legível.
 */
(function () {
  'use strict';

  /* ---------- Pranchas anatômicas (viewBox 0 0 600 360, perfil, cabeça à esquerda) ----------
   * body: contorno contínuo do animal (vira clipPath). far: membros do lado oposto (atrás).
   * regioes: polígonos que particionam o plano com vértices compartilhados; o clipPath do corpo
   * recorta cada um, então dentro da silhueta não sobra buraco nem sobreposição.
   * [id, polígonos ('|' separa partes), rótuloX, rótuloY] */
  var ANIMAIS = {
    boi: {
      nome: 'boi',
      body: 'M42,150 C50,132 60,112 72,100 C82,91 92,86 102,85 C120,82 140,84 158,78 ' +
        'C170,62 190,49 212,51 C232,54 244,74 254,88 C290,96 360,93 420,92 C450,92 470,86 490,88 ' +
        'C515,90 540,92 556,96 C572,104 581,122 583,150 C585,182 577,212 567,236 C563,250 567,266 566,282 ' +
        'C560,294 556,306 555,322 C555,330 559,336 562,342 L535,342 C535,334 537,328 537,320 ' +
        'C537,304 538,292 536,282 C530,266 522,250 512,238 C498,234 486,240 470,240 ' +
        'C420,246 330,250 280,244 C266,242 257,250 255,264 C253,290 251,316 251,326 C251,332 254,336 256,342 ' +
        'L229,342 C229,334 231,328 231,320 C230,300 226,284 221,270 C217,256 212,246 205,240 ' +
        'C194,256 178,258 165,248 C148,240 134,216 124,197 C110,193 92,192 76,190 C64,188 54,186 46,184 ' +
        'C38,182 32,170 34,160 C36,154 39,151 42,150 Z',
      far: [
        'M262,236 C270,270 272,300 272,322 C272,332 275,337 277,342 L252,342 C252,320 250,298 246,270 Z',
        'M494,228 C506,252 512,270 512,290 C510,304 511,316 511,324 C511,332 514,337 516,342 L491,342 C492,322 492,300 488,282 C484,262 478,246 470,236 Z'
      ],
      details: [
        // orelha (atrás do chifre), chifre curto, vassoura da cauda, cascos
        ['ear', 'M100,98 C114,90 134,90 148,100 C140,108 122,110 104,106 C100,104 99,101 100,98 Z'],
        ['horn', 'M96,88 C93,76 97,64 110,57 C112,59 112,61 110,63 C104,70 104,80 106,88 Z'],
        ['tail', 'M556,98 C574,116 588,150 590,196 C591,226 591,248 590,262 L585,262 C585,244 585,222 584,196 C582,156 572,124 554,104 Z'],
        ['switch', 'M587,252 C599,266 600,292 590,314 C586,316 583,316 580,312 C574,292 576,268 587,252 Z'],
        ['hoof', 'M231,328 L251,328 C252,334 254,338 256,342 L229,342 C229,336 230,332 231,328 Z'],
        ['hoof', 'M537,328 L556,328 C557,334 559,338 562,342 L535,342 C535,336 536,332 537,328 Z'],
        ['hoofd', 'M252,328 L273,328 C274,334 275,338 277,342 L252,342 Z'],
        ['hoofd', 'M492,328 L512,328 C513,334 514,338 516,342 L491,342 Z'],
        ['nostril', 'M38,160 C41,157 46,158 46,162 C44,164 40,164 38,160 Z'],
        ['sheath', 'M390,246 C394,256 402,260 410,256 C412,252 411,248 409,246']
      ],
      eye: [86, 112, 4],
      lines: [
        'M70,116 C74,132 82,144 98,150', 'M38,176 C44,178 52,178 58,176', // bochecha, boca
        'M82,106 C86,103 92,104 94,108', // pálpebra
        'M128,110 C140,130 152,150 160,176', 'M136,152 C146,160 150,172 152,186', // dobras do pescoço (zebu)
        'M196,104 C214,140 230,176 240,214', 'M240,214 C232,232 224,244 218,256', // escápula e braço
        'M300,120 C306,160 306,200 300,240', 'M330,118 C336,160 336,204 330,248', 'M360,118 C366,160 366,206 360,252',
        'M390,118 C396,160 396,206 392,254', // costelas
        'M480,100 C500,120 512,150 512,180', 'M512,180 C508,208 506,230 510,250', // ílio e soldra
        'M540,120 C556,150 562,190 556,232', 'M466,198 C482,212 494,230 500,246', // nádega, flanco
        'M542,286 C544,300 545,312 546,324', 'M238,292 C240,306 241,316 241,326' // tendões
      ],
      regioes: [
        ['pescoco', '108,0 165,0 170,100 184,160 128,212 116,95', 148, 140],
        ['cupim', '165,0 250,0 248,104 170,100', 210, 80],
        ['acem', '250,0 305,0 305,122 290,150 184,160 170,100 248,104', 248, 128],
        ['paleta', '184,160 290,150 300,215 262,270 210,275', 248, 205],
        ['peito', '128,212 184,160 210,275 150,300 100,240', 180, 224],
        ['musculo', '150,300 210,275 262,270 270,360 140,360|500,250 545,270 600,270 600,360 500,360', 241, 300],
        ['contrafile', '305,0 440,0 440,124 400,124 305,122', 372, 108],
        ['costela', '290,150 305,122 400,124 400,175 400,205 300,215', 350, 168],
        ['ponta-de-agulha', '300,215 400,205 440,360 270,360 262,270', 350, 228],
        ['file-mignon', '400,124 440,124 440,140 470,152 470,175 400,175', 434, 152],
        ['alcatra', '440,0 480,0 482,108 545,128 530,150 470,152 440,140', 494, 134],
        ['picanha', '480,0 565,0 566,98 545,128 482,108', 526, 104],
        ['maminha', '400,175 470,175 485,215 410,210 400,205', 442, 196],
        ['fraldinha', '400,205 410,210 485,215 500,250 500,360 440,360', 452, 226],
        ['patinho', '470,152 530,150 545,128 535,200 545,270 500,250 485,215 470,175', 512, 196],
        ['coxao', '565,0 600,0 600,270 545,270 535,200 545,128 566,98', 560, 176]
      ]
    },
    porco: {
      nome: 'porco',
      body: 'M58,158 C52,159 48,165 48,173 C48,181 51,187 57,189 C70,193 86,196 100,200 ' +
        'C114,206 128,214 140,222 C148,232 156,240 168,247 C172,264 173,284 172,302 C172,314 170,324 168,334 ' +
        'L193,334 C193,322 195,310 197,298 C199,280 203,266 211,257 C260,269 360,273 440,263 ' +
        'C452,272 456,290 456,304 C456,316 456,326 454,334 L479,334 C481,322 484,310 488,296 ' +
        'C496,276 512,262 525,250 C549,230 563,200 565,170 C567,140 557,116 537,104 ' +
        'C480,86 380,79 300,81 C240,83 190,91 160,103 C140,110 124,116 110,124 C92,134 74,147 58,158 Z',
      far: [
        'M206,252 C214,272 216,296 216,318 C216,326 217,330 218,334 L195,334 C196,316 196,296 194,274 Z',
        'M474,252 C486,274 490,296 490,316 C490,324 491,330 492,334 L469,334 C470,316 468,296 462,276 Z'
      ],
      details: [
        ['ear', 'M138,98 C150,90 164,92 168,100 C158,114 140,128 116,140 C110,134 118,114 138,98 Z'],
        ['tailc', 'M562,124 C576,114 588,122 582,134 C576,142 566,134 572,126 C578,120 586,128 582,136'],
        ['hoof', 'M170,324 L194,324 L193,334 L168,334 Z'], ['hoof', 'M456,324 L481,324 L479,334 L454,334 Z'],
        ['hoofd', 'M195,324 L217,324 L218,334 L195,334 Z'], ['hoofd', 'M469,324 L491,324 L492,334 L469,334 Z'],
        ['nostril', 'M51,168 C53,165 56,166 56,169 C55,171 52,171 51,168 Z'],
        ['nostril', 'M51,178 C53,175 56,176 56,179 C55,181 52,181 51,178 Z']
      ],
      eye: [108, 140, 3.2],
      lines: [
        'M60,158 C62,170 62,180 58,189', 'M62,192 C76,190 88,186 98,180', // disco do focinho, boca
        'M102,134 C106,131 112,132 114,136', 'M126,170 C134,186 144,200 150,214', // pálpebra, papada
        'M190,110 C206,150 214,190 212,232', 'M300,92 C330,90 380,90 430,96', // escápula, linha do lombo
        'M260,120 C266,160 266,200 260,240', 'M300,118 C306,160 306,204 300,248', 'M340,118 C346,162 346,206 340,252',
        'M470,120 C500,150 512,190 506,236', 'M520,150 C530,180 532,210 524,240' // pernil
      ],
      regioes: [
        ['copa', '140,0 230,0 232,140 150,150 146,110', 186, 118],
        ['paleta-suina', '150,150 232,140 236,205 240,360 120,360 148,230', 190, 200],
        ['lombo', '230,0 470,0 468,140 360,142 232,140', 350, 112],
        ['costela-suina', '232,140 360,142 362,200 236,205', 298, 172],
        ['barriga', '236,205 362,200 360,142 468,140 440,250 430,360 240,360', 380, 220],
        ['pernil', '470,0 600,0 600,360 430,360 440,250 468,140', 516, 180]
      ]
    },
    cordeiro: {
      nome: 'cordeiro',
      body: 'M62,146 C56,152 56,162 64,166 C78,169 94,167 110,163 C124,171 140,190 156,206 ' +
        'C166,220 174,232 184,241 C188,264 194,290 196,314 C196,324 195,331 195,338 L212,338 ' +
        'C213,326 215,310 218,292 C222,274 228,260 240,253 C246,256 252,256 258,258 C266,262 276,258 286,262 ' +
        'C296,264 306,260 316,263 C328,266 338,261 350,263 C362,265 372,260 384,262 C398,264 410,258 424,258 ' +
        'C432,256 438,254 442,252 C448,270 454,296 458,312 C460,322 460,330 460,338 L477,338 ' +
        'C477,326 477,312 475,298 C475,284 483,270 497,256 C511,240 521,212 523,186 C525,156 517,130 502,114 ' +
        'C494,108 486,104 476,104 C464,98 452,102 440,100 C426,96 414,101 400,98 C386,95 372,100 358,97 ' +
        'C344,94 330,99 316,97 C302,95 288,100 274,99 C260,98 250,104 238,104 C214,108 184,113 166,106 ' +
        'C152,98 142,90 128,88 C110,88 92,100 80,116 C72,126 66,136 62,146 Z',
      far: [
        'M232,256 C238,276 240,300 240,320 C240,328 240,333 240,338 L224,338 C224,320 224,298 222,278 Z',
        'M488,262 C482,280 482,300 484,318 C484,326 485,332 485,338 L468,338 C468,320 468,300 470,282 Z'
      ],
      details: [
        ['ear', 'M120,98 C138,94 156,98 166,108 C154,114 136,112 122,106 C118,104 118,100 120,98 Z'],
        ['tail', 'M500,114 C514,118 522,132 520,150 C514,152 508,146 504,136 Z'],
        ['hoof', 'M195,330 L212,330 L212,338 L195,338 Z'], ['hoof', 'M460,330 L477,330 L477,338 L460,338 Z'],
        ['hoofd', 'M224,330 L240,330 L240,338 L224,338 Z'], ['hoofd', 'M468,330 L485,330 L485,338 L468,338 Z'],
        ['nostril', 'M60,152 C62,150 65,151 65,154 C63,156 61,155 60,152 Z']
      ],
      eye: [96, 116, 3.4],
      lines: [
        'M60,160 C66,162 72,162 78,160', 'M90,112 C94,109 100,110 102,114', 'M78,126 C88,140 100,150 112,158',
        'M184,116 C200,150 212,190 216,232', 'M270,120 C276,160 276,200 270,240', 'M310,120 C316,162 316,206 310,248',
        'M350,120 C356,162 356,206 350,250', 'M450,116 C478,140 494,176 492,222', 'M478,268 C474,290 474,310 476,330'
      ],
      regioes: [
        ['paleta-cordeiro', '130,0 250,0 252,165 238,250 240,360 150,360 150,200 132,100', 196, 168],
        ['carre', '250,0 430,0 432,160 252,165', 340, 132],
        ['costela-cordeiro', '252,165 432,160 438,250 440,360 240,360 238,250', 340, 214],
        ['pernil-cordeiro', '430,0 600,0 600,360 440,360 438,250 432,160', 480, 186]
      ]
    },
    frango: {
      nome: 'frango',
      body: 'M154,74 C156,60 168,52 182,54 C196,56 204,66 204,80 C204,98 210,114 224,126 ' +
        'C246,140 276,138 306,132 C350,124 396,112 432,92 C448,76 462,60 480,50 C494,58 496,76 492,92 ' +
        'C506,88 518,94 522,108 C514,130 500,146 486,160 C480,200 462,236 432,256 C410,270 386,276 360,276 ' +
        'C320,278 276,268 244,248 C206,226 186,200 180,168 C176,146 176,128 180,112 C172,104 162,96 158,90 ' +
        'C154,86 152,80 154,74 Z',
      far: [],
      legs: [
        // canela (tarso) e dedos: perna de trás mais escura
        ['legd', 'M396,264 L402,318 M402,318 L424,332 M402,318 L408,336 M402,318 L388,332'],
        ['leg', 'M366,268 L358,318 M358,318 L332,332 M358,318 L364,338 M358,318 L378,328']
      ],
      details: [
        ['comb', 'M160,58 C158,44 168,38 172,50 C175,34 187,34 187,47 C192,36 204,40 199,56 C190,59 176,57 164,60 Z'],
        ['beak', 'M156,68 C148,70 140,74 134,79 C142,81 150,82 157,82 Z'],
        ['wattle', 'M158,86 C155,98 160,108 167,103 C171,96 167,89 162,84 Z'],
        ['earlobe', 'M190,80 C194,78 198,82 196,87 C192,88 189,85 190,80 Z']
      ],
      eye: [176, 68, 3.2],
      lines: [
        'M262,190 C310,200 380,204 440,190', 'M280,172 C330,180 390,180 450,166', 'M300,152 C350,156 400,150 456,136', // penas da asa
        'M440,110 C458,96 474,84 484,62', 'M452,124 C474,112 494,104 512,104', // cauda
        'M204,96 C210,110 214,120 222,128', 'M196,190 C212,220 236,240 262,250', 'M330,220 C360,210 392,214 420,228'
      ],
      regioes: [
        ['peito-frango', '178,118 232,132 262,190 300,212 320,360 100,360 100,118', 222, 224],
        ['asa', '232,132 250,100 440,100 470,150 440,190 380,214 300,212 262,190', 350, 160],
        ['coxa', '300,212 380,214 440,190 470,150 600,150 600,360 320,360', 400, 242],
        ['coracao', 'M232,186 C226,176 212,182 218,194 L232,208 L246,194 C252,182 238,176 232,186 Z', 232, 172]
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
    '.anm-ground{fill:#000;opacity:.35}',
    '.anm-skin{fill:var(--c-sal,#B9ACA0);fill-opacity:.2}',
    '.anm-far{fill:var(--c-sal,#B9ACA0);fill-opacity:.1;stroke:var(--c-osso,#F7F0E6);stroke-opacity:.35;stroke-width:1}',
    '.anm-weight{fill:var(--c-osso,#F7F0E6);fill-opacity:.75}',
    '.anm-line{fill:none;stroke:var(--c-osso,#F7F0E6);stroke-width:1.1;stroke-linejoin:round}',
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
    '.anm-leg{fill:none;stroke:var(--c-gordura,#F2E2C4);stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-opacity:.8}',
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
  function regD(spec) {
    if (/^M/.test(spec)) return spec;
    return spec.split('|').map(function (p) { return 'M' + p.trim().replace(/ +/g, ' L') + ' Z'; }).join(' ');
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
    [g1, g2, hat, gm, mk].forEach(function (n) { defs.appendChild(n); });
    svg.appendChild(defs);
    var clip = 'url(#' + id + '-clip)';
    cam = sv('g', { class: 'anm-cam' });
    var back = sv('g', { 'aria-hidden': 'true' });
    back.appendChild(sv('ellipse', { cx: 330, cy: 344, rx: 250, ry: 7, class: 'anm-ground' }));
    (a.far || []).forEach(function (d) { back.appendChild(sv('path', { d: d, class: 'anm-far' })); });
    (a.legs || []).forEach(function (l) { back.appendChild(sv('path', { d: l[1], class: 'anm-' + l[0] })); });
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
    front.appendChild(sv('path', { d: a.body, class: 'anm-line' }));
    (a.details || []).forEach(function (x) { front.appendChild(sv('path', { d: x[1], class: 'anm-' + x[0] })); });
    front.appendChild(sv('circle', { cx: a.eye[0], cy: a.eye[1], r: a.eye[2], class: 'anm-eye' }));
    front.appendChild(sv('circle', { cx: a.eye[0] - 1, cy: a.eye[1] - 1.2, r: 1, class: 'anm-glint' }));
    // ordem: fundo, regiões, destaque, vizinha, volume/musculatura, contorno e detalhes, rótulos
    [back, regs, litLayer, peekLayer, shade, front, lbls].forEach(function (n) { cam.appendChild(n); });
    svg.appendChild(cam);
    svgwrap.appendChild(svg);
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
    // zoom contido: a peça ganha destaque, mas o animal continua reconhecível em volta
    var pad = 150;
    var s = Math.min(vw / (b.width + pad * 2), vh / (b.height + pad * 2), 1.15);
    s = Math.max(s, 1);
    // centro na peça, mas preso à silhueta: nunca mostra mais vazio que animal
    function clamp(v, lo, hi) { return lo > hi ? (lo + hi) / 2 : Math.max(lo, Math.min(hi, v)); }
    var cx = clamp(b.x + b.width / 2, c.x + vw / (2 * s) - 20, c.x + c.width - vw / (2 * s) + 20);
    var cy = clamp(b.y + b.height / 2, c.y + vh / (2 * s) - 20, c.y + c.height - vh / (2 * s) + 20);
    var tx = 300 - s * cx, ty = 180 - s * cy;
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
