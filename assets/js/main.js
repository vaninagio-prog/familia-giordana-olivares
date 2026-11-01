/* Familia Giordana Olivares — JS mínimo */
(function () {
  // Número de WhatsApp en formato internacional sin "+" ni espacios. Si se deja vacío, los botones llevan a Contacto.
  // Cada botón puede definir su propio mensaje con data-wa-msg.
  var WHATSAPP_NUMBER = '5493825524949'; // +54 9 3825 52-4949
  var WHATSAPP_MSG = 'Hola Familia Giordana, quiero hacer una consulta sobre sus productos.';

  if (WHATSAPP_NUMBER) {
    document.querySelectorAll('.js-wa').forEach(function (a) {
      a.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(a.getAttribute('data-wa-msg') || WHATSAPP_MSG);
      a.target = '_blank'; a.rel = 'noopener';
    });
  }

  // Header: siempre sólido; solo agrega sombra al hacer scroll
  var header = document.querySelector('.site-header');
  var onScroll = function () { header.classList.toggle('shadow', window.scrollY > 10); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  // Menú móvil
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('menu');
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); });
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
    if (!ok) { note.textContent = 'Completá tu nombre y el mensaje.'; return; }
    var d = new FormData(form);
    var txt = 'Hola Familia Giordana, soy ' + d.get('nombre').trim();
    if (d.get('empresa').trim()) txt += ' (' + d.get('empresa').trim() + ')';
    if (d.get('pais').trim()) txt += ', de ' + d.get('pais').trim();
    txt += '.\nInterés: ' + d.get('interes') + '\n\n' + d.get('mensaje').trim();
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(txt), '_blank', 'noopener');
    note.textContent = '¡Gracias! Se abrió WhatsApp con tu consulta.';
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
