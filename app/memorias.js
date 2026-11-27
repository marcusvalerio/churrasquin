/* churrasquin — app/memorias.js
 * Lembranças dos churrascos realizados.
 *
 * PRIVACIDADE: as fotos ficam SÓ NESTE APARELHO. Nada é enviado para servidor nenhum.
 * - metadados (data, pessoas, kg, nota, estrelas) em localStorage;
 * - a foto, redimensionada para no máximo 1080 px (JPEG ~0.8), em IndexedDB;
 * - se o IndexedDB falhar (modo privado, cota, navegador antigo), cai para uma miniatura
 *   menor (480 px) em localStorage; se nem isso couber, a lembrança é salva sem foto.
 * Expõe window.Memorias = { list(), add(meta, file) -> Promise<{meta, fotoOk}>, foto(id) -> Promise<url|null>, remove(id), resize(file, max, q) }. */
(function () {
  'use strict';
  var KEY = 'churrasquin.memorias.v1', FB = 'churrasquin.memorias.foto.';
  var DB = 'churrasquin', STORE = 'fotos';
  var urls = {};

  function list() {
    try { var l = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(l) ? l.sort(function (a, b) { return b.data - a.data; }) : []; } catch (e) { return []; }
  }
  function saveList(l) { try { localStorage.setItem(KEY, JSON.stringify(l)); return true; } catch (e) { return false; } }

  var dbP = null;
  function db() {
    if (dbP) return dbP;
    dbP = new Promise(function (res, rej) {
      try {
        if (!window.indexedDB) return rej(new Error('sem IndexedDB'));
        var rq = indexedDB.open(DB, 1);
        rq.onupgradeneeded = function () { rq.result.createObjectStore(STORE); };
        rq.onsuccess = function () { res(rq.result); };
        rq.onerror = function () { rej(rq.error); };
        rq.onblocked = function () { rej(new Error('bloqueado')); };
      } catch (e) { rej(e); }
    });
    dbP.catch(function () { dbP = null; });
    return dbP;
  }
  function tx(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var t = d.transaction(STORE, mode), st = t.objectStore(STORE), out = fn(st);
        t.oncomplete = function () { res(out && 'result' in out ? out.result : undefined); };
        t.onerror = t.onabort = function () { rej(t.error); };
      });
    });
  }

  /* lê a imagem e redesenha num canvas: tira EXIF/GPS de quebra e reduz o peso */
  function resize(file, max, q) {
    max = max || 1080; q = q || 0.8;
    return new Promise(function (res, rej) {
      if (!file || !/^image\//.test(file.type || 'image/')) return rej(new Error('não é imagem'));
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        try {
          var s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
          var w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s);
          var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
          cv.getContext('2d').drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(url);
          if (cv.toBlob) cv.toBlob(function (b) { b ? res(b) : rej(new Error('falhou')); }, 'image/jpeg', q);
          else rej(new Error('sem toBlob'));
        } catch (e) { URL.revokeObjectURL(url); rej(e); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error('imagem ilegível')); };
      img.src = url;
    });
  }
  function blobToDataURL(b) {
    return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = rej; r.readAsDataURL(b); });
  }

  function add(meta, file) {
    meta = Object.assign({ id: 'm' + Date.now().toString(36), data: Date.now(), foto: null }, meta);
    var guardar = function (onde) { meta.foto = onde; var l = list(); l.unshift(meta); saveList(l); return { meta: meta, fotoOk: !!onde || !file }; };
    if (!file) return Promise.resolve(guardar(null));
    return resize(file, 1080, 0.8)
      .then(function (blob) { return tx('readwrite', function (st) { return st.put(blob, meta.id); }).then(function () { return 'idb'; }); })
      .catch(function () {
        // fallback: miniatura em localStorage
        return resize(file, 480, 0.7).then(blobToDataURL).then(function (d) {
          try { localStorage.setItem(FB + meta.id, d); return 'ls'; } catch (e) { return null; }
        }).catch(function () { return null; });
      })
      .then(guardar);
  }

  function foto(id) {
    if (urls[id]) return Promise.resolve(urls[id]);
    var m = list().filter(function (x) { return x.id === id; })[0];
    if (!m || !m.foto) return Promise.resolve(null);
    if (m.foto === 'ls') { try { return Promise.resolve(urls[id] = localStorage.getItem(FB + id)); } catch (e) { return Promise.resolve(null); } }
    return tx('readonly', function (st) { return st.get(id); })
      .then(function (b) { return b ? (urls[id] = URL.createObjectURL(b)) : null; })
      .catch(function () { return null; });
  }

  function remove(id) {
    saveList(list().filter(function (x) { return x.id !== id; }));
    try { localStorage.removeItem(FB + id); } catch (e) {}
    if (urls[id] && urls[id].indexOf('blob:') === 0) URL.revokeObjectURL(urls[id]);
    delete urls[id];
    return tx('readwrite', function (st) { return st.delete(id); }).catch(function () {});
  }

  function reset() {
    list().forEach(function (m) { try { localStorage.removeItem(FB + m.id); } catch (e) {} });
    try { localStorage.removeItem(KEY); } catch (e) {}
    return tx('readwrite', function (st) { return st.clear(); }).catch(function () {});
  }

  window.Memorias = { list: list, add: add, foto: foto, remove: remove, reset: reset, resize: resize };
})();
