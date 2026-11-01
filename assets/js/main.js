/* Familia Giordana Olivares — JS mínimo */

/* =====================================================================
 * CONFIGURACIÓN DE LA TIENDA (editar acá)
 * ---------------------------------------------------------------------
 * WHATSAPP_NUMBER  Número que recibe consultas y pedidos, formato
 *                  internacional sin "+" ni espacios (54 9 + área + número).
 * MP_PAYMENT_LINK  Link de pago de Mercado Pago (p. ej. https://mpago.la/xxxx
 *                  o https://link.mercadopago.com.ar/tu-tienda). Si queda
 *                  vacío no se muestra nada; si se completa, después de
 *                  confirmar el pedido aparece el botón "Pagar con Mercado Pago".
 * SHIPPING_NOTE    Texto sobre el costo de envío por correo. Vacío = se usa el
 *                  texto traducido "Costo de envío a cotizar" (i18n: co.shipNote).
 * PICKUPS          Direcciones de retiro que se muestran en el carrito y se
 *                  copian al mensaje de WhatsApp. El horario de Vichigasta sale
 *                  de i18n (contact.hours).
 * Precios y productos: se leen de los bloques .buy de index.html
 * (data-sku, data-name, data-price en pesos). Si cambia un precio, actualizar
 * data-price Y el precio visible de la tarjeta.
 * El carrito se guarda en el navegador del cliente (localStorage "fgo-cart").
 * ===================================================================== */
var FGO_CONFIG = {
  WHATSAPP_NUMBER: '5493825524949', // +54 9 3825 52-4949
  MP_PAYMENT_LINK: '',
  SHIPPING_NOTE: '',
  PICKUPS: {
    sinsacate: 'San Cayetano 1653, Sinsacate, Córdoba (CP 5221)',
    vichigasta: 'Ruta Nacional km 74 1166, F5374 Vichigasta, La Rioja'
  }
};
(function () {
  // Número de WhatsApp en formato internacional sin "+" ni espacios. Si se deja vacío, los botones llevan a Contacto.
  // Cada botón puede definir su propio mensaje con data-wa-msg.
  var WHATSAPP_NUMBER = FGO_CONFIG.WHATSAPP_NUMBER;
  var WHATSAPP_MSG = 'Hola Familia Giordana, quiero hacer una consulta sobre sus productos.';

  // ---- Idiomas (es / en / zh). Textos en assets/js/i18n.js ----
  var I18N = window.I18N || { es: {} };
  if (!window.I18N) { var lgBox = document.querySelector('.lang'); if (lgBox) lgBox.style.display = 'none'; }
  var LANGS = { es: 'es-AR', en: 'en', zh: 'zh-Hans' };
  var lang = 'es';
  var t = function (k) { return (I18N[lang] && I18N[lang][k] != null) ? I18N[lang][k] : (I18N.es[k] || ''); };
  window.FGO = { t: function (k) { return t(k); }, lang: function () { return lang; } };

  function setWaLinks() {
    if (!WHATSAPP_NUMBER) return;
    document.querySelectorAll('.js-wa').forEach(function (a) {
      var k = a.getAttribute('data-i18n-data-wa-msg');
      var msg = k ? t(k) : (a.getAttribute('data-wa-msg') || t('wa.default') || WHATSAPP_MSG);
      if (k) a.setAttribute('data-wa-msg', msg);
      a.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
      a.target = '_blank'; a.rel = 'noopener';
    });
  }

  function applyLang(l, save) {
    if (!LANGS[l] || !I18N[l]) l = 'es';
    var prev = lang; lang = l;
    document.documentElement.lang = LANGS[l];
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i18n')); });
    ['alt', 'aria-label', 'title', 'placeholder'].forEach(function (a) {
      document.querySelectorAll('[data-i18n-' + a + ']').forEach(function (el) { el.setAttribute(a, t(el.getAttribute('data-i18n-' + a))); });
    });
    document.title = t('meta.title');
    var md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute('content', t('meta.desc'));
    var pais = document.querySelector('#form-contacto [name="pais"]');
    if (pais && (pais.value === '' || pais.value === (I18N[prev] || {})['form.countryDefault'])) pais.value = t('form.countryDefault');
    var tg = document.querySelector('.nav-toggle');
    if (tg) tg.setAttribute('aria-label', tg.getAttribute('aria-expanded') === 'true' ? t('aria.menuClose') : t('aria.menuOpen'));
    var lg = document.querySelector('.lang'); if (lg) lg.setAttribute('aria-label', t('aria.lang'));
    document.querySelectorAll('.lang [data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lang') === l ? 'true' : 'false'); });
    var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
    setWaLinks();
    if (save) { try { localStorage.setItem('fgo-lang', l); } catch (e) {} }
    try { document.dispatchEvent(new CustomEvent('fgo:lang')); } catch (e) {}
  }

  var qp = (new URLSearchParams(location.search).get('lang') || '').toLowerCase().slice(0, 2);
  var stored = null; try { stored = localStorage.getItem('fgo-lang'); } catch (e) {}
  if (LANGS[qp]) applyLang(qp, true);
  else if (stored && LANGS[stored]) applyLang(stored, false);
  else setWaLinks();

  document.querySelectorAll('.lang [data-lang]').forEach(function (b) {
    b.addEventListener('click', function () {
      var l = b.getAttribute('data-lang');
      applyLang(l, true);
      if (history.replaceState) {
        var u = new URL(location.href);
        if (l === 'es') u.searchParams.delete('lang'); else u.searchParams.set('lang', l);
        history.replaceState(null, '', u.pathname + u.search + u.hash);
      }
    });
  });

  // Header al hacer scroll
  var header = document.querySelector('.site-header');
  var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 40); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  // Menú móvil
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('menu');
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? t('aria.menuClose') : t('aria.menuOpen'));
    header.classList.toggle('menu-open', open);
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { nav.classList.remove('open'); header.classList.remove('menu-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', t('aria.menuOpen')); });
  });

  // Animaciones de entrada
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('in'); }); }

  // Videos: reproducir solo cuando están visibles
  var vids = document.querySelectorAll('video');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var vo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.preload = 'auto'; e.target.play().catch(function () {}); }
        else { e.target.pause(); }
      });
    }, { threshold: 0.3 });
    vids.forEach(function (v) { vo.observe(v); });
  }

  // "data-interes" preselecciona el interés en el formulario
  var interes = document.getElementById('interes');
  document.querySelectorAll('[data-interes]').forEach(function (a) {
    a.addEventListener('click', function () {
      var val = a.getAttribute('data-interes');
      for (var i = 0; i < interes.options.length; i++) {
        if (interes.options[i].text === val) { interes.selectedIndex = i; break; }
      }
    });
  });

  // Formulario: arma el mensaje y abre WhatsApp (sitio estático, sin servidor)
  var form = document.getElementById('form-contacto');
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var ok = true;
    form.querySelectorAll('[required]').forEach(function (f) {
      var bad = !f.value.trim();
      f.classList.toggle('invalid', bad); f.setAttribute('aria-invalid', bad); if (bad) ok = false;
    });
    var note = form.querySelector('.form-note');
    if (!ok) { note.textContent = t('form.err'); return; }
    var d = new FormData(form);
    var sel = form.querySelector('[name="interes"]');
    var txt = t('wa.hi').replace('{nombre}', d.get('nombre').trim());
    if (d.get('empresa').trim()) txt += ' (' + d.get('empresa').trim() + ')';
    if (d.get('pais').trim()) txt += t('wa.from').replace('{pais}', d.get('pais').trim());
    txt += (lang === 'zh' ? '。' : '.') + '\n' + t('wa.interest') + sel.options[sel.selectedIndex].text + '\n\n' + d.get('mensaje').trim();
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(txt), '_blank', 'noopener');
    note.textContent = t('form.thanks');
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();

/* Perfil y maridajes: despliegue animado */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('details.notes-wrap').forEach(function (d) {
    var body = d.querySelector('.notes-body');
    if (!body) return;
    d.classList.add('js-anim');
    if (d.open) d.classList.add('is-open');
    var timer;
    d.querySelector('summary').addEventListener('click', function (e) {
      e.preventDefault();
      clearTimeout(timer);
      if (reduce.matches) {
        d.open = !d.open;
        d.classList.toggle('is-open', d.open);
        return;
      }
      if (!d.classList.contains('is-open')) {
        d.open = true;
        void body.offsetHeight;
        requestAnimationFrame(function () { d.classList.add('is-open'); });
      } else {
        d.classList.remove('is-open');
        timer = setTimeout(function () { if (!d.classList.contains('is-open')) d.open = false; }, 420);
      }
    });
  });
})();

/* Carrito y pedido por WhatsApp (sin servidor) */
(function () {
  var C = FGO_CONFIG, KEY = 'fgo-cart';
  var drawer = document.getElementById('cart');
  if (!drawer || !window.FGO) return;
  var t = window.FGO.t, L = window.FGO.lang;
  var overlay = document.querySelector('.cart-overlay');
  var btn = document.querySelector('.cart-btn');
  var countEl = btn.querySelector('.cart-count');
  var list = drawer.querySelector('.cart__items');
  var form = drawer.querySelector('.checkout');
  var err = drawer.querySelector('.co-err');
  var views = drawer.querySelectorAll('.cart__view');
  var lastFocus = null, closeTimer;

  // Catálogo: bloques .buy del HTML
  var catalog = {};
  document.querySelectorAll('.buy[data-sku]').forEach(function (b) {
    catalog[b.getAttribute('data-sku')] = {
      name: b.getAttribute('data-name'), key: b.getAttribute('data-name-key'),
      cents: Math.round(parseFloat(b.getAttribute('data-price')) * 100)
    };
  });
  var nameOf = function (sku) { var p = catalog[sku]; return (p.key && t(p.key)) || p.name; };
  var money = function (c) {
    var n = (c / 100).toFixed(2).split('.');
    return '$' + n[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + n[1];
  };
  var clampQty = function (v) { v = parseInt(v, 10); return isNaN(v) || v < 1 ? 1 : (v > 99 ? 99 : v); };

  var cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { cart = []; }
  cart = cart.filter(function (i) { return i && catalog[i.sku]; }).map(function (i) { return { sku: i.sku, qty: clampQty(i.qty) }; });
  var save = function () { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };
  var find = function (sku) { for (var i = 0; i < cart.length; i++) if (cart[i].sku === sku) return cart[i]; return null; };
  var subtotal = function () { return cart.reduce(function (s, i) { return s + catalog[i.sku].cents * i.qty; }, 0); };

  function add(sku, qty) {
    var it = find(sku);
    if (it) it.qty = clampQty(it.qty + qty); else cart.push({ sku: sku, qty: clampQty(qty) });
    save(); render();
    btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump');
  }
  function setQty(sku, qty) {
    var it = find(sku); if (!it) return;
    if (qty < 1) cart = cart.filter(function (i) { return i.sku !== sku; }); else it.qty = clampQty(qty);
    save(); render();
  }

  function render() {
    var n = cart.reduce(function (s, i) { return s + i.qty; }, 0);
    countEl.textContent = n; countEl.hidden = n === 0;
    list.innerHTML = '';
    cart.forEach(function (i) {
      var p = catalog[i.sku];
      var li = document.createElement('li'); li.className = 'cart-item';
      li.innerHTML = '<div class="cart-item__info"><p class="cart-item__name"></p><p class="cart-item__unit"></p></div>' +
        '<div class="qty qty--sm"><button type="button" class="qty__btn" data-act="dec">−</button><span class="qty__val"></span><button type="button" class="qty__btn" data-act="inc">+</button></div>' +
        '<p class="cart-item__total"></p><button type="button" class="cart-item__rm" data-act="rm"></button>';
      li.querySelector('.cart-item__name').textContent = nameOf(i.sku);
      li.querySelector('.cart-item__unit').textContent = money(p.cents) + ' ' + t('cart.each');
      li.querySelector('.qty__val').textContent = i.qty;
      li.querySelector('.cart-item__total').textContent = money(p.cents * i.qty);
      li.querySelector('[data-act="dec"]').setAttribute('aria-label', t('cart.less') + ': ' + nameOf(i.sku));
      li.querySelector('[data-act="inc"]').setAttribute('aria-label', t('cart.more') + ': ' + nameOf(i.sku));
      var rm = li.querySelector('[data-act="rm"]'); rm.textContent = t('cart.remove'); rm.setAttribute('aria-label', t('cart.remove') + ': ' + nameOf(i.sku));
      li.addEventListener('click', function (e) {
        var a = e.target.closest('[data-act]'); if (!a) return;
        var act = a.getAttribute('data-act');
        setQty(i.sku, act === 'rm' ? 0 : i.qty + (act === 'inc' ? 1 : -1));
        var again = list.querySelector('.cart-item:nth-child(' + (Array.prototype.indexOf.call(list.children, li) + 1) + ') [data-act="' + act + '"]');
        if (again) again.focus();
      });
      li.setAttribute('data-sku', i.sku);
      list.appendChild(li);
    });
    drawer.querySelector('.cart__subtotal').textContent = money(subtotal());
    drawer.classList.toggle('is-empty', cart.length === 0);
    drawer.querySelector('.js-ship-note').textContent = C.SHIPPING_NOTE || t('co.shipNote');
    drawer.querySelectorAll('.js-pick-addr').forEach(function (el) { el.textContent = C.PICKUPS[el.getAttribute('data-pick')] || ''; });
  }

  function showView(v) { views.forEach(function (x) { x.hidden = x.getAttribute('data-view') !== v; }); }
  function open() {
    clearTimeout(closeTimer);
    lastFocus = document.activeElement;
    if (!drawer.querySelector('[data-view="done"]').hidden && cart.length) showView('cart');
    drawer.hidden = false; overlay.hidden = false;
    void drawer.offsetWidth;
    drawer.classList.add('open'); overlay.classList.add('open');
    document.documentElement.classList.add('cart-lock');
    btn.setAttribute('aria-expanded', 'true');
    drawer.querySelector('.cart__close').focus();
  }
  function close() {
    drawer.classList.remove('open'); overlay.classList.remove('open');
    document.documentElement.classList.remove('cart-lock');
    btn.setAttribute('aria-expanded', 'false');
    closeTimer = setTimeout(function () { drawer.hidden = true; overlay.hidden = true; }, 350);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  btn.addEventListener('click', function () { drawer.classList.contains('open') ? close() : open(); });
  drawer.querySelector('.cart__close').addEventListener('click', close);
  overlay.addEventListener('click', close);
  drawer.querySelector('.js-done-close').addEventListener('click', function () { showView('cart'); close(); });
  document.addEventListener('keydown', function (e) {
    if (!drawer.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { // foco dentro del panel
      var f = Array.prototype.filter.call(drawer.querySelectorAll('button, a[href], input, textarea, select'), function (el) { return el.offsetParent !== null && !el.disabled; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  // Botones "Agregar al carrito" y selectores de cantidad en las tarjetas
  document.querySelectorAll('.buy[data-sku]').forEach(function (b) {
    var input = b.querySelector('.qty__in'), addBtn = b.querySelector('.add-cart'), timer;
    b.querySelectorAll('.qty__btn').forEach(function (q) {
      q.addEventListener('click', function () { input.value = clampQty(clampQty(input.value) + parseInt(q.getAttribute('data-step'), 10)); });
    });
    input.addEventListener('change', function () { input.value = clampQty(input.value); });
    addBtn.addEventListener('click', function () {
      add(b.getAttribute('data-sku'), clampQty(input.value));
      input.value = 1;
      addBtn.textContent = t('cart.added'); addBtn.classList.add('is-added');
      clearTimeout(timer);
      timer = setTimeout(function () { addBtn.textContent = t('cart.add'); addBtn.classList.remove('is-added'); }, 1600);
    });
  });

  // Entrega: muestra los campos de la opción elegida
  function syncDelivery() {
    var v = (form.querySelector('[name="entrega"]:checked') || {}).value;
    form.querySelectorAll('.co-extra').forEach(function (x) {
      var on = x.getAttribute('data-for') === v; x.hidden = !on;
      x.querySelectorAll('[data-req]').forEach(function (i) { i.required = on; });
    });
  }
  form.querySelectorAll('[name="entrega"]').forEach(function (r) { r.addEventListener('change', syncDelivery); });
  syncDelivery();
  form.addEventListener('input', function (e) { if (e.target.classList) { e.target.classList.remove('invalid'); e.target.removeAttribute('aria-invalid'); } });
  form.addEventListener('change', function (e) {
    if (e.target.type === 'radio') { var g = e.target.closest('.co-group'); if (g) g.classList.remove('invalid'); }
  });

  function buildMessage(d) {
    var lines = [t('wa.o.title'), '', t('wa.o.items')];
    cart.forEach(function (i) {
      var p = catalog[i.sku];
      lines.push('• ' + i.qty + ' × ' + nameOf(i.sku) + ' — ' + money(p.cents) + ' ' + t('cart.each') + ' = ' + money(p.cents * i.qty));
    });
    lines.push('', '*' + t('cart.subtotal') + ': ' + money(subtotal()) + '* ' + t('wa.o.subNote'), '', t('wa.o.delivery'));
    if (d.entrega === 'envio') {
      lines.push(t('co.ship'));
      lines.push(t('co.address') + ': ' + d.direccion);
      lines.push(t('co.city') + ': ' + d.localidad + ' · ' + t('co.province') + ': ' + d.provincia + ' · ' + t('co.zip') + ': ' + d.cp);
      lines.push(C.SHIPPING_NOTE || t('co.shipNote'));
    } else if (d.entrega === 'sinsacate') {
      lines.push(t('co.pickSin'), C.PICKUPS.sinsacate);
    } else {
      lines.push(t('co.pickVic'), C.PICKUPS.vichigasta);
    }
    var pay = { card: 'co.payCard', qr: 'co.payQr', account: 'co.payAcc' }[d.pago];
    lines.push('', t('wa.o.payment'), t(pay) + (/Mercado Pago/.test(t(pay)) ? '' : ' (' + t('wa.o.via') + ')'), '', t('wa.o.customer'));
    lines.push(t('co.name') + ': ' + d.nombre, t('co.phone') + ': ' + d.telefono);
    if (d.email) lines.push(t('co.email') + ': ' + d.email);
    if (d.notas) lines.push(t('co.notes') + ': ' + d.notas);
    lines.push('', t('wa.o.closing'));
    return lines.join('\n');
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    err.textContent = '';
    if (!cart.length) { err.textContent = t('co.errEmpty'); return; }
    var ok = true, first = null;
    form.querySelectorAll('input[required]:not([type="radio"])').forEach(function (f) {
      var bad = !f.value.trim();
      f.classList.toggle('invalid', bad); if (bad) { f.setAttribute('aria-invalid', 'true'); ok = false; first = first || f; } else f.removeAttribute('aria-invalid');
    });
    var em = form.querySelector('[name="email"]');
    if (em.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim())) { em.classList.add('invalid'); em.setAttribute('aria-invalid', 'true'); ok = false; first = first || em; }
    ['entrega', 'pago'].forEach(function (n) {
      var picked = form.querySelector('[name="' + n + '"]:checked');
      var g = form.querySelector('[name="' + n + '"]').closest('.co-group');
      g.classList.toggle('invalid', !picked); if (!picked) { ok = false; first = first || form.querySelector('[name="' + n + '"]'); }
    });
    if (!ok) { err.textContent = t('co.err'); if (first) first.focus(); return; }
    var d = {};
    new FormData(form).forEach(function (v, k) { d[k] = String(v).trim(); });
    var url = 'https://wa.me/' + C.WHATSAPP_NUMBER + '?text=' + encodeURIComponent(buildMessage(d));
    window.open(url, '_blank', 'noopener');
    drawer.querySelector('.js-done-wa').href = url;
    var mp = drawer.querySelector('.js-mp');
    if (C.MP_PAYMENT_LINK) { mp.href = C.MP_PAYMENT_LINK; mp.hidden = false; } else mp.hidden = true;
    cart = []; save(); render();
    form.querySelector('[name="notas"]').value = '';
    showView('done');
    drawer.querySelector('.cart__scroll').scrollTop = 0;
    drawer.querySelector('.cart__done h3').setAttribute('tabindex', '-1');
    drawer.querySelector('.cart__done h3').focus();
  });

  document.addEventListener('fgo:lang', function () {
    render();
    document.querySelectorAll('.add-cart.is-added').forEach(function (a) { a.textContent = t('cart.added'); });
  });
  render();
})();
