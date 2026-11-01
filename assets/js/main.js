/* Familia Giordana Olivares — JS mínimo */
(function () {
  // Número de WhatsApp en formato internacional sin "+" ni espacios. Si se deja vacío, los botones llevan a Contacto.
  // Cada botón puede definir su propio mensaje con data-wa-msg.
  var WHATSAPP_NUMBER = '5493825524949'; // +54 9 3825 52-4949
  var WHATSAPP_MSG = 'Hola Familia Giordana, quiero hacer una consulta sobre sus productos.';

  // ---- Idiomas (es / en / zh). Textos en assets/js/i18n.js ----
  var I18N = window.I18N || { es: {} };
  if (!window.I18N) { var lgBox = document.querySelector('.lang'); if (lgBox) lgBox.style.display = 'none'; }
  var LANGS = { es: 'es-AR', en: 'en', zh: 'zh-Hans' };
  var lang = 'es';
  var t = function (k) { return (I18N[lang] && I18N[lang][k] != null) ? I18N[lang][k] : (I18N.es[k] || ''); };

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
