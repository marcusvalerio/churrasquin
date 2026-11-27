/* churrasquin — app/motion.js
 * Movimento da marca, do laboratório design/movimento:
 * abertura "Onda de fogo", topo da Início vivo (a mesma onda, lenta) e as microinterações.
 * Regras: um só loop rAF (dorme quando nada precisa de quadro), DPR com teto 2, pausa fora da tela
 * e com a aba oculta, no DOM só transform/opacity, e versão estática com reduzir movimento. */
(function () {
  'use strict';
  var MQ = matchMedia('(prefers-reduced-motion: reduce)');
  function rm() { return !!MQ.matches; }
  var clamp = function (x, a, b) { a = a == null ? 0 : a; b = b == null ? 1 : b; return Math.min(b, Math.max(a, x)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  function bez(x1, y1, x2, y2) {
    var cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    var sx = function (t) { return ((ax * t + bx) * t + cx) * t; }, sy = function (t) { return ((ay * t + by) * t + cy) * t; }, dx = function (t) { return (3 * ax * t + 2 * bx) * t + cx; };
    return function (x) { x = clamp(x); var t = x; for (var i = 0; i < 6; i++) { var d = dx(t); if (Math.abs(d) < 1e-6) break; t -= (sx(t) - x) / d; } return sy(clamp(t)); };
  }
  var brasa = bez(.2, .8, .2, 1), fole = bez(.65, 0, .35, 1);
  // as 3 curvas e 3 durações vêm dos tokens (design/sistema/tokens.css)
  var css = getComputedStyle(document.documentElement);
  function tok(n, fb) { var v = css.getPropertyValue(n).trim(); return v || fb; }
  function tms(n, fb) { var v = parseFloat(tok(n, '')); return isNaN(v) ? fb : v; }
  var E = { brasa: tok('--brasa', 'cubic-bezier(.2,.8,.2,1)'), fole: tok('--fole', 'cubic-bezier(.65,0,.35,1)'), mola: tok('--mola', 'cubic-bezier(.34,1.4,.5,1)') };
  var D = { toque: tms('--d-toque', 120), estado: tms('--d-estado', 220), cena: tms('--d-cena', 400), mola: tms('--d-mola', 690) };
  function anim(el, kf, o) {
    if (!el || !el.animate) return null;
    var opt = {}; for (var k in o) opt[k] = o[k];
    if (rm()) { opt.duration = 1; opt.delay = 0; }
    if (!opt.fill) opt.fill = 'none';
    return el.animate(kf, opt);
  }
  function dpr() { return Math.min(window.devicePixelRatio || 1, 2); }
  function fit(cv, w, h, sc) {
    var d = sc || dpr(), W = Math.round(w * d), H = Math.round(h * d);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    var c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); return c;
  }
  var hex = function (h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; };
  function ramp(stops, t) {
    t = clamp(t) * (stops.length - 1); var i = Math.min(stops.length - 2, Math.floor(t)), f = t - i, a = hex(stops[i]), b = hex(stops[i + 1]);
    return 'rgb(' + (a[0] + (b[0] - a[0]) * f | 0) + ',' + (a[1] + (b[1] - a[1]) * f | 0) + ',' + (a[2] + (b[2] - a[2]) * f | 0) + ')';
  }
  var FIRE = ['#0A0A09', '#3A0E06', '#8A1E0A', '#FF5A1F', '#FFB547', '#FFF1C9'];
  function screen() { return document.getElementById('screen'); }
  function rel(el) { var s = screen().getBoundingClientRect(), r = el.getBoundingClientRect(); return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2, r: r }; }

  /* ============ motor: um rAF para tudo ============ */
  var runners = [], raf = 0, last = 0, vis = new WeakMap();
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { vis.set(e.target, e.isIntersecting); }); kick(); });
  function run(r) { if (r.el) { vis.set(r.el, true); io.observe(r.el); } runners.push(r); kick(); return r; }
  function kick() { if (!raf && !document.hidden && runners.length) { last = performance.now(); raf = requestAnimationFrame(tick); } }
  function tick(now) {
    raf = 0; var dt = Math.min(.05, (now - last) / 1000); last = now; var any = false;
    for (var i = runners.length - 1; i >= 0; i--) {
      var r = runners[i];
      if (r.dead || (r.alive && !r.alive())) { if (r.el) io.unobserve(r.el); runners.splice(i, 1); continue; }
      if (r.el && !vis.get(r.el)) continue;
      any = true; r.frame(dt, now);
    }
    if (any) raf = requestAnimationFrame(tick);
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else kick(); });

  /* ============ a onda de fogo (A1 do laboratório) ============ */
  function wave(c, W, H, A, B, amp, t) {
    c.clearRect(0, 0, W, H);
    c.fillStyle = '#0A0A09'; c.fillRect(0, 0, W, H);
    var layers = [[0, 0, .55], [26, 2.3, .6], [58, 4.1, .85]];
    for (var l = 0; l < 3; l++) {
      var off = layers[l][0], ph = layers[l][1], al = layers[l][2], x;
      var sy = function (x) { return A + off + amp * (.6 * Math.sin(x * .016 + t * 2.2 + ph) + .35 * Math.sin(x * .033 - t * 1.5 + ph * 2) + .45 * Math.sin(x * .006 + t * .7 + ph)); };
      var by = function (x) { return B + 10 * Math.sin(x * .02 - t * 1.8 + ph) + 6 * Math.sin(x * .045 + t * 1.1); };
      var g = c.createLinearGradient(0, A + off - amp, 0, Math.max(A + off + 420, B));
      g.addColorStop(0, '#FFE3A3'); g.addColorStop(.05, '#FFB547'); g.addColorStop(.16, '#FF5A1F'); g.addColorStop(.42, '#8A1E0A'); g.addColorStop(.75, '#2A0C06'); g.addColorStop(1, '#140806');
      c.globalAlpha = al; c.fillStyle = g; c.beginPath(); c.moveTo(0, sy(0));
      for (x = 0; x <= W + 10; x += 10) c.lineTo(x, sy(x));
      for (x = W + 10; x >= 0; x -= 10) c.lineTo(x, by(x));
      c.closePath(); c.fill();
      if (B < H) { c.globalAlpha = al * .9; c.strokeStyle = '#FF5A1F'; c.lineWidth = 2; c.beginPath(); for (x = 0; x <= W + 10; x += 10) c.lineTo(x, by(x)); c.stroke(); }
    }
    c.globalAlpha = 1;
    var cy = A + amp * .2, gl = c.createRadialGradient(W / 2, cy, 0, W / 2, cy, 260);
    gl.addColorStop(0, 'rgba(255,181,71,.35)'); gl.addColorStop(1, 'rgba(255,181,71,0)');
    c.globalCompositeOperation = 'lighter'; c.fillStyle = gl; c.fillRect(0, cy - 260, W, 520); c.globalCompositeOperation = 'source-over';
  }
  function logo(c, L, alpha) {
    if (alpha <= 0) return;
    c.save(); c.globalAlpha = alpha; c.font = '600 ' + L.s + 'px Geist, system-ui, sans-serif';
    try { c.letterSpacing = (-.02 * L.s) + 'px'; } catch (e) {}
    c.fillStyle = '#F4F4F2'; c.textBaseline = 'middle'; c.fillText('churrasquin', L.x, L.y); c.restore();
  }

  /* estado do fogo: uma só fase que atravessa a abertura e continua no topo */
  var F = { ph: 3.8, spd: .35, intro: null, hero: null, cv: null, c: null };
  var SLOW = .35; // topo vivo: a mesma onda, a ~1/3 da velocidade

  // perf: medidas do topo em cache (ler offsetTop a cada quadro força layout); renova no resize
  var dimsC = null;
  window.addEventListener('resize', function () { dimsC = null; }, { passive: true });
  function heroDims(hero) {
    if (dimsC && dimsC.el === hero) return dimsC;
    var home = hero.parentNode.querySelector('.home');
    var top = home ? home.offsetTop - hero.offsetTop : hero.offsetHeight - 36;
    return (dimsC = { el: hero, W: hero.clientWidth, h: hero.offsetHeight, B: top + 10 });
  }
  function drawHero(dt) {
    var hero = F.hero, cv = F.cv; if (!hero || !cv) return;
    var d = heroDims(hero), I = F.intro;
    if (I) {
      var H = I.H, t = I.t, A, B = H + 80, amp;
      if (t < 1.1) { A = lerp(H + 90, -120, fole(t / 1.1)); amp = lerp(30, 54, t / 1.1); }
      else if (t < 1.45) { A = -120; amp = 54; }
      else if (t < 3) { var u = fole((t - 1.45) / 1.4); A = lerp(-120, H * .75, u); amp = lerp(54, 16, u); }
      else { var v = fole(clamp((t - 3) / .8)); A = lerp(H * .75, -130, v); B = lerp(H + 80, d.B, v); amp = lerp(16, 12, v); }
      if (cv.style.height !== H + 'px') cv.style.height = H + 'px';
      var c = fit(cv, d.W, H, .75);
      wave(c, d.W, H, A, B, amp, F.ph);
      var k = fole(clamp((t - 3) / .7)), L0 = I.L0, L1 = I.L1;
      var L = { x: lerp(L0.x, L1.x, k), y: lerp(L0.y, L1.y, k), s: lerp(L0.s, L1.s, k) };
      if (!I.handed) logo(c, L, t < 3 ? clamp((t - 1.9) / .6) : 1);
    } else {
      // topo ocioso: meia resolução (o CSS amplia; a onda é macia, não perde nada)
      wave(fit(cv, d.W, d.h, .5), d.W, d.h, -130, d.B, 12, F.ph);
    }
  }
  function heroRunner() {
    if (F.r && runners.indexOf(F.r) >= 0) {
      if (F.r.el !== F.cv) { io.unobserve(F.r.el); F.r.el = F.cv; vis.set(F.cv, true); io.observe(F.cv); }
      kick(); return F.r;
    }
    return (F.r = run({ el: F.cv, alive: function () { return F.cv && F.cv.isConnected; }, frame: function (dt) {
      var I = F.intro;
      if (I) { I.t += dt * (I.skip && I.t < 3 ? 4 : 1); F.ph = I.t; step(I); drawHero(dt); return; }
      F.spd = lerp(F.spd, SLOW, clamp(dt * 1.6)); F.ph += dt * F.spd;
      // ocioso: 30 fps bastam para uma onda lenta; rolado para baixo, não desenha
      F.acc = (F.acc || 0) + dt; if (F.acc < 1 / 31) return; F.acc = 0;
      var sc = F.hero && F.hero.parentNode; if (sc && sc.scrollTop > F.hero.offsetHeight * .6) return;
      drawHero(dt);
    } }));
  }
  function hero(el) {
    if (!el) return;
    var cv = el.querySelector('.hero__fire'); if (!cv) return;
    F.hero = el; F.cv = cv;
    if (rm() && !F.intro) { drawHero(0); window.addEventListener('resize', function () { if (F.cv === cv) drawHero(0); }, { once: true }); return; }
    heroRunner();
  }

  /* ============ abertura: Onda de fogo → Início ============ */
  function intro(o) {
    var app = o.app, view = o.view, h = view.querySelector('.hero'), wm = h && h.querySelector('.wordmark');
    if (!h || !wm || rm()) { app.classList.remove('intro'); o.onEnd && o.onEnd(); return; }
    var sc = screen(), H = sc.clientHeight, s0 = sc.getBoundingClientRect();
    var go = function () {
      var r = wm.getBoundingClientRect(), fs = parseFloat(getComputedStyle(wm).fontSize) || 20;
      F.intro = { t: 0, H: H, o: o, L0: { x: 28, y: H * 432 / 844, s: 58 }, L1: { x: r.left - s0.left, y: r.top - s0.top + r.height / 2, s: fs } };
      F.spd = 1;
      sc.addEventListener('pointerdown', function sk() { if (F.intro) F.intro.skip = true; sc.removeEventListener('pointerdown', sk); });
      heroRunner();
    };
    var started = false, start = function () { if (!started) { started = true; go(); } };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); setTimeout(start, 700);
  }
  function step(I) {
    var o = I.o, app = o.app, view = o.view, t = I.t;
    if (t >= 3 && !I.s3) {
      I.s3 = true; app.classList.add('intro-b'); app.classList.remove('intro');
      var home = view.querySelector('.home'), H = I.H;
      // a folha clara sobe com mola (≈900 ms); os cartões entram em sequência de 60 ms (brasa, cena)
      anim(home, [{ transform: 'translateY(' + H + 'px)' }, { transform: 'none' }], { duration: 900, easing: E.mola, fill: 'backwards' });
      Array.prototype.forEach.call(home.children, function (ch, i) {
        anim(ch, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: D.cena, delay: 180 + i * 60, easing: E.brasa, fill: 'backwards' });
      });
      var hin = view.querySelectorAll('.hero__in>:not(.top), .top--hero .iconbtn');
      Array.prototype.forEach.call(hin, function (n, i) { anim(n, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: D.cena, delay: 300 + i * 60, easing: E.brasa, fill: 'backwards' }); });
      anim(document.querySelector('.tabbar'), [{ transform: 'translateY(calc(100% + 40px))' }, { transform: 'none' }], { duration: D.cena, delay: 240, easing: E.brasa, fill: 'backwards' });
    }
    if (t >= 3.7 && !I.handed) { I.handed = true; app.classList.remove('intro-b'); }
    if (t >= 3.8) {
      F.intro = null; if (F.cv) F.cv.style.height = '';
      o.onEnd && o.onEnd();
    }
  }

  /* ============ C1 · indicador líquido da tab bar ============ */
  function ink(el, a, b) {
    if (!el || a < 0 || b < 0 || a === b || rm()) return;
    var d = Math.abs(b - a), dir = b > a ? 1 : -1;
    // a borda da frente sai primeiro e a de trás chega depois: a gota estica na direção do movimento
    el.style.transformOrigin = dir > 0 ? '0 50%' : '100% 50%';
    anim(el, [
      { transform: 'translateX(' + a * 100 + '%) scaleX(1)' },
      { transform: 'translateX(' + (a + (b - a) * .35) * 100 + '%) scaleX(' + (1 + Math.min(1.4, d * .55)) + ')', offset: .45 },
      { transform: 'translateX(' + b * 100 + '%) scaleX(1)' }
    ], { duration: D.cena, easing: E.fole });
  }

  /* ============ C2 · contador que pula ============ */
  function pop(el) { anim(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.14)', offset: .3 }, { transform: 'scale(1)' }], { duration: D.cena, easing: E.brasa }); }

  /* ============ C3 · corte voando para a sacola ============ */
  function bagTarget() {
    var s = screen().getBoundingClientRect();
    var l = Array.prototype.filter.call(document.querySelectorAll('.view:not([hidden]) [data-open="lista"]'), function (b) { var r = b.getBoundingClientRect(); return r.width && r.bottom > s.top && r.top < s.bottom; });
    return l[0] || document.querySelector('.tab[data-tab="planejar"]');
  }
  function fly(src) {
    var tg = bagTarget(); if (!src || !tg) return;
    var a = rel(src), done = function () {
      var t2 = bagTarget() || tg;
      anim(t2, [{ transform: 'scale(1)' }, { transform: 'scale(1.18)', offset: .25 }, { transform: 'scale(1)' }], { duration: D.mola, easing: E.brasa });
      var bd = t2.querySelector('.badge'); if (bd) anim(bd, [{ transform: 'scale(.4)' }, { transform: 'scale(1)' }], { duration: D.mola, easing: E.mola });
    };
    anim(src, [{ transform: 'scale(.9)' }, { transform: 'scale(1)' }], { duration: D.estado, easing: E.brasa });
    if (rm()) { done(); return; }
    var b = rel(tg), f = document.createElement('div'); f.className = 'm-fly'; f.setAttribute('aria-hidden', 'true'); screen().appendChild(f);
    var cx = (a.x + b.x) / 2, cy = Math.min(a.y, b.y) - 160, kf = [];
    for (var i = 0; i <= 24; i++) { var p = fole(i / 24), q = 1 - p, x = q * q * a.x + 2 * q * p * cx + p * p * b.x, y = q * q * a.y + 2 * q * p * cy + p * p * b.y; kf.push({ transform: 'translate(' + (x - 22) + 'px,' + (y - 22) + 'px) scale(' + lerp(1, .45, p) + ')' }); }
    var an = anim(f, kf, { duration: 600, easing: 'linear' });
    an.onfinish = function () { f.remove(); done(); };
  }

  /* ============ C4 · anel do timer queimando ============ */
  function ring(el) {
    if (!el || el.querySelector('.ring__cv')) return;
    var fg = el.querySelector('.ring__fg'); if (!fg) return;
    var S = 232, R = 86, cx = S / 2, cy = S / 2, C = 540.4;
    var cv = document.createElement('canvas'); cv.className = 'ring__cv'; cv.setAttribute('aria-hidden', 'true'); el.appendChild(cv); el.classList.add('burn');
    var c = fit(cv, S, S), sparks = [], pv = null, t = 0;
    var prog = function () { var o = parseFloat(fg.style.strokeDashoffset); return isNaN(o) ? 0 : clamp(o / C); };
    var draw = function (dt, still) {
      var p = prog(); pv = pv == null || still ? p : pv + (p - pv) * clamp(dt * 3); t += dt;
      c.clearRect(0, 0, S, S); c.lineCap = 'round'; c.lineWidth = 10;
      var a0 = -Math.PI / 2 + pv * Math.PI * 2; if (pv >= 1) return;
      var g = c.createConicGradient ? c.createConicGradient(a0, cx, cy) : null;
      if (g) { g.addColorStop(0, '#FFF1C9'); g.addColorStop(.04, '#FFB547'); g.addColorStop(.3, '#FF5A1F'); g.addColorStop(1, '#8A1E0A'); c.strokeStyle = g; } else c.strokeStyle = '#FF5A1F';
      c.beginPath(); c.arc(cx, cy, R, a0, Math.PI * 1.5); c.stroke();
      var tx = cx + R * Math.cos(a0), ty = cy + R * Math.sin(a0), fl = still ? 1 : (1 + .25 * Math.sin(t * 23) + .15 * Math.sin(t * 37));
      var gl = c.createRadialGradient(tx, ty, 0, tx, ty, 22 * fl);
      gl.addColorStop(0, 'rgba(255,241,201,.95)'); gl.addColorStop(.3, 'rgba(255,181,71,.6)'); gl.addColorStop(1, 'rgba(255,90,31,0)');
      c.fillStyle = gl; c.beginPath(); c.arc(tx, ty, 22 * fl, 0, 6.283); c.fill();
      if (still) return;
      if (Math.random() < .5) sparks.push({ x: tx, y: ty, vx: (Math.random() - .5) * 60 + Math.cos(a0 + 1.6) * 30, vy: -40 - Math.random() * 60, l: 1 });
      for (var i = 0; i < sparks.length; i++) { var s = sparks[i]; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 40 * dt; s.l -= dt * 1.6; c.fillStyle = ramp(FIRE, .5 + s.l * .5); c.globalAlpha = Math.max(0, s.l); c.fillRect(s.x, s.y, 2, 2); }
      sparks = sparks.filter(function (s) { return s.l > 0; }); c.globalAlpha = 1;
    };
    if (rm()) { draw(0, true); new MutationObserver(function () { draw(0, true); }).observe(fg, { attributes: true }); return; }
    run({ el: cv, alive: function () { return cv.isConnected; }, frame: function (dt) { draw(dt, false); } });
  }

  /* ============ C5 · termômetro: sobe com fole ============ */
  function climb(from, to, set) {
    if (rm()) { set(to); return; }
    var t = 0, T = 1.2; set(from);
    var r = run({ frame: function (dt) { t += dt; var p = clamp(t / T); set(Math.round(lerp(from, to, fole(p)))); if (p >= 1) r.dead = true; } });
  }
  function pulse(el) { if (!el) return; el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse'); }

  /* ============ C6 · puxar para atualizar no Início ============ */
  var FLAME = '<svg class="ptr__f" viewBox="0 0 60 80" aria-hidden="true"><defs><linearGradient id="m-fg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FF5A1F"/><stop offset=".6" stop-color="#FFB547"/><stop offset="1" stop-color="#FFF1C9"/></linearGradient></defs><path d="M30 2C38 20 54 30 54 52a24 24 0 0 1-48 0C6 38 16 32 20 20c4 10 10 12 10 12S24 18 30 2z" fill="url(#m-fg)"/><path d="M30 40c6 8 10 12 10 20a10 10 0 0 1-20 0c0-6 4-10 10-20z" fill="#FFF1C9"/></svg>';
  function ptr(view, onRefresh) {
    if (!view.querySelector('.ptr')) { var p = document.createElement('div'); p.className = 'ptr'; p.setAttribute('aria-hidden', 'true'); p.innerHTML = FLAME; view.insertBefore(p, view.firstChild); }
    if (view._ptr) return; view._ptr = true;
    var y0 = null, cur = 0, busy = false, moved = false;
    var rub = function (x) { return x < 0 ? 0 : 140 * (1 - Math.exp(-x / 160)); };
    var parts = function () { return Array.prototype.filter.call(view.children, function (n) { return !n.classList.contains('ptr'); }); };
    var fl = function () { return view.querySelector('.ptr__f'); };
    function set(v) {
      cur = v; parts().forEach(function (n) { n.style.transform = v ? 'translateY(' + v + 'px)' : ''; });
      var f = fl(), k = clamp(v / 90); if (f) { f.style.opacity = k; f.style.transform = 'scale(' + (.3 + .7 * k) + ')'; }
    }
    function back(from, then) {
      parts().forEach(function (n) { anim(n, [{ transform: 'translateY(' + from + 'px)' }, { transform: 'none' }], { duration: D.mola, easing: E.mola }); });
      set(0); setTimeout(function () { then && then(); }, rm() ? 0 : D.mola);
    }
    function release() {
      if (busy) return;
      if (cur < 80) { var c0 = cur; back(c0); return; }
      busy = true; var from = cur;
      parts().forEach(function (n) { n.style.transform = 'translateY(96px)'; anim(n, [{ transform: 'translateY(' + from + 'px)' }, { transform: 'translateY(96px)' }], { duration: D.estado, easing: E.brasa }); });
      var f = fl(); if (f) { f.style.opacity = 1; f.style.transform = ''; f.classList.add('flick'); }
      setTimeout(function () {
        onRefresh && onRefresh();
        var f2 = fl(); if (f2) { f2.classList.remove('flick'); anim(f2, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.2)' }], { duration: D.estado, easing: E.fole }); }
        back(96, function () { busy = false; });
      }, rm() ? 300 : 1200);
    }
    var startY = function (y, target) {
      if (busy || view.scrollTop > 0 || document.querySelector('.app.intro,.app.intro-b')) return;
      if (target.closest && target.closest('.rail,input,select,label')) return;
      y0 = y; moved = false;
    };
    var moveY = function (y) {
      if (y0 == null) return; var dy = y - y0;
      if (dy < 0 && !moved) { y0 = null; return; }
      if (dy > 6) moved = true; if (moved) set(rub(dy));
    };
    var endY = function () { if (y0 == null) return; y0 = null; if (moved) release(); };
    view.addEventListener('mousedown', function (e) { if (e.button === 0) startY(e.clientY, e.target); });
    window.addEventListener('mousemove', function (e) { if (y0 != null) { moveY(e.clientY); if (moved) e.preventDefault(); } });
    window.addEventListener('mouseup', endY);
    view.addEventListener('touchstart', function (e) { startY(e.touches[0].clientY, e.target); }, { passive: true });
    view.addEventListener('touchmove', function (e) { moveY(e.touches[0].clientY); }, { passive: true });
    view.addEventListener('touchend', endY); view.addEventListener('touchcancel', endY);
    view.addEventListener('click', function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  }

  /* ============ C7 · sheet com mola: CSS (tokens --mola/--d-mola) + arrasto com velocidade ============ */
  function drag(sheet, scroller, close, handle, cls) {
    var y0 = null, dy = 0, ly = 0, lt = 0, v = 0, h = handle || sheet; cls = cls || 'drag';
    h.addEventListener('touchstart', function (e) { if (scroller && scroller() && scroller().scrollTop > 0) return; y0 = ly = e.touches[0].clientY; lt = performance.now(); dy = 0; v = 0; sheet.classList.add(cls); }, { passive: true });
    h.addEventListener('touchmove', function (e) {
      if (y0 == null) return; var y = e.touches[0].clientY, n = performance.now(); v = (y - ly) / Math.max(1, n - lt); ly = y; lt = n;
      dy = y - y0; dy = dy < 0 ? -12 * (1 - Math.exp(dy / 40)) : dy; sheet.style.transform = 'translateY(' + dy + 'px)';
    }, { passive: true });
    var end = function () { if (y0 == null) return; y0 = null; sheet.classList.remove(cls); sheet.style.transform = ''; if (dy > 110 || v > .6) close(); dy = 0; };
    h.addEventListener('touchend', end); h.addEventListener('touchcancel', end);
  }

  /* ============ C8 · faíscas ao encerrar ============ */
  var fx = null, P = [];
  function burst(el) {
    if (!el) return;
    anim(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.06)', offset: .3 }, { transform: 'scale(1)' }], { duration: D.mola, easing: E.brasa });
    if (rm()) return;
    var sc = screen(), W = sc.clientWidth, H = sc.clientHeight, o = rel(el);
    if (!fx || !fx.isConnected) { fx = document.createElement('canvas'); fx.className = 'm-fx'; fx.setAttribute('aria-hidden', 'true'); sc.appendChild(fx); }
    var c = fit(fx, W, H), wasEmpty = !P.length;
    for (var i = 0; i < 110; i++) { var a = -Math.PI / 2 + (Math.random() - .5) * 2.4, s = 300 + Math.random() * 700; P.push({ x: o.x, y: o.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 1 + Math.random() * 2.4, l: .8 + Math.random() * .6 }); }
    if (!wasEmpty) return;
    var r = run({ frame: function (dt) {
      c.clearRect(0, 0, W, H); c.globalCompositeOperation = 'lighter';
      for (var i = 0; i < P.length; i++) { var p = P[i]; p.vy += 900 * dt; p.vx *= .985; p.x += p.vx * dt; p.y += p.vy * dt; p.l -= dt * .8; c.globalAlpha = Math.max(0, p.l); c.fillStyle = ramp(FIRE, .45 + p.l * .55); c.beginPath(); c.arc(p.x, p.y, p.r * (.5 + p.l * .5), 0, 6.283); c.fill(); }
      P = P.filter(function (p) { return p.l > 0 && p.y < H + 20; }); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
      if (!P.length) { c.clearRect(0, 0, W, H); r.dead = true; }
    } });
  }

  /* ============ C9 · lembrança revelando como polaroid ============ */
  function polaroid(memo) {
    if (!memo) return;
    var ph = memo.querySelector('.memo__ph');
    try { memo.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' }); } catch (e) { }
    if (rm()) return;
    anim(memo, [{ transform: 'translateY(-240px) rotate(-12deg)', opacity: 0 }, { opacity: 1, offset: .2 }, { transform: 'none', opacity: 1 }], { duration: Math.round(D.mola * 1.3), easing: E.mola });
    if (!ph) return;
    var w = document.createElement('i'), g = document.createElement('i'); w.className = 'pola pola--w'; g.className = 'pola pola--g'; ph.appendChild(g); ph.appendChild(w);
    // do branco estourado e sem cor à imagem nítida: só opacidade de duas camadas
    anim(w, [{ opacity: .95 }, { opacity: .45, offset: .4 }, { opacity: 0 }], { duration: 2600, delay: 300, easing: E.fole, fill: 'both' }).onfinish = function () { w.remove(); };
    anim(g, [{ opacity: 1 }, { opacity: .7, offset: .4 }, { opacity: 0 }], { duration: 2600, delay: 300, easing: E.fole, fill: 'both' }).onfinish = function () { g.remove(); };
  }

  /* ============ C10 · skeleton com brilho de brasa: CSS (.is-loading) + acender em sequência ============ */
  function lit(el, i) { anim(el, [{ opacity: 0, transform: 'scale(1.02)' }, { opacity: 1, transform: 'none' }], { duration: D.cena, delay: (i || 0) * 60, easing: E.brasa, fill: 'backwards' }); }

  window.MOTION = { rm: rm, E: E, D: D, anim: anim, run: run, hero: hero, intro: intro, ink: ink, pop: pop, fly: fly, ring: ring, climb: climb, pulse: pulse, ptr: ptr, drag: drag, burst: burst, polaroid: polaroid, lit: lit };
})();
