(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ── Barra de progreso de scroll ───────────────────────── */
  var scrollProgress = document.getElementById('scrollProgress');
  function updateScrollProgress() {
    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop;
    var height = doc.scrollHeight - doc.clientHeight;
    var pct = height > 0 ? (scrollTop / height) * 100 : 0;
    if (scrollProgress) scrollProgress.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  /* ── Cursor personalizado (solo con mouse real) ────────── */
  if (hasHover && !prefersReducedMotion) {
    var cursorEl = document.querySelector('.cursor');
    var cursorRing = document.querySelector('.cursor-ring');
    var cursorDot = document.querySelector('.cursor-dot');
    if (cursorRing && cursorDot) {
      document.addEventListener('mousemove', function (e) {
        if (cursorEl && !cursorEl.classList.contains('active')) cursorEl.classList.add('active');
        cursorRing.style.left = e.clientX + 'px';
        cursorRing.style.top = e.clientY + 'px';
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
      });
    }
    document.querySelectorAll('a, button, .clickable-card').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        if (cursorRing) { cursorRing.style.width = '56px'; cursorRing.style.height = '56px'; }
      });
      el.addEventListener('mouseleave', function () {
        if (cursorRing) { cursorRing.style.width = '36px'; cursorRing.style.height = '36px'; }
      });
    });
  }

  /* ── Navbar: fondo al hacer scroll ──────────────────────── */
  var navbar = document.getElementById('navbar');
  function updateNavbarBg() {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', updateNavbarBg, { passive: true });
  updateNavbarBg();

  /* ── Menú móvil (hamburguesa) ───────────────────────────── */
  var navBurger = document.getElementById('navBurger');
  var navMobilePanel = document.getElementById('navMobilePanel');
  function closeMobileMenu() {
    if (navbar) navbar.classList.remove('menu-open');
    if (navMobilePanel) navMobilePanel.classList.remove('open');
    if (navBurger) navBurger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function toggleMobileMenu() {
    if (!navMobilePanel) return;
    var isOpen = navMobilePanel.classList.toggle('open');
    if (navbar) navbar.classList.toggle('menu-open', isOpen);
    if (navBurger) navBurger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
  if (navBurger) navBurger.addEventListener('click', toggleMobileMenu);
  if (navMobilePanel) {
    navMobilePanel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMobileMenu);
    });
  }
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMobileMenu();
  });

  /* ── Revelado al hacer scroll ───────────────────────────── */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ── Parallax suave del hero ────────────────────────────── */
  var heroContent = document.querySelector('.hero-content');
  if (heroContent && !prefersReducedMotion) {
    window.addEventListener('scroll', function () {
      var scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroContent.style.transform = 'translateY(' + (scrolled * 0.25) + 'px)';
        heroContent.style.opacity = 1 - scrolled / (window.innerHeight * 0.8);
      }
    }, { passive: true });
  }

  /* ── Contadores animados (cifras del consultorio) ──────── */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var animateCount = function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = prefersReducedMotion ? 0 : 1400;
      if (duration === 0) { el.textContent = target + suffix; return; }
      var startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { countObserver.observe(el); });
    } else {
      counters.forEach(animateCount);
    }
  }

  /* ── Lightbox accesible (servicios + galería) ──────────── */
  var modal = document.getElementById('imageModal');
  var modalImg = document.getElementById('imgFull');
  var captionText = document.getElementById('caption');
  var closeModalBtn = document.getElementById('closeModal');
  var lastFocusedEl = null;

  function openModal(card) {
    if (!modal || !modalImg) return;
    lastFocusedEl = document.activeElement;
    modal.classList.add('open');
    modalImg.src = card.getAttribute('data-full') || '';
    var nameEl = card.querySelector('.service-name');
    var capEl = card.querySelector('.gallery-overlay span');
    var caption = nameEl ? nameEl.textContent : (capEl ? capEl.textContent : '');
    modalImg.alt = caption;
    if (captionText) captionText.textContent = caption;
    document.body.style.overflow = 'hidden';
    if (closeModalBtn) closeModalBtn.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
    if (modalImg) modalImg.src = '';
    if (lastFocusedEl && lastFocusedEl.focus) lastFocusedEl.focus();
  }

  document.querySelectorAll('.clickable-card').forEach(function (card) {
    card.addEventListener('click', function () { openModal(card); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card);
      }
    });
  });
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
  }
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) closeModal();
  });

  /* ── Formulario de contacto → WhatsApp ──────────────────── */
  var waForm = document.getElementById('waForm');
  if (waForm) {
    waForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('waName').value.trim();
      var service = document.getElementById('waService').value;
      var when = document.getElementById('waWhen').value.trim();

      var msg = 'Hola, soy ' + (name || '(sin nombre)') + '. Me interesa: ' + service + '.';
      if (when) msg += ' Día que me acomoda: ' + when + '.';

      var url = 'https://wa.me/527771303538?text=' + encodeURIComponent(msg);
      window.open(url, '_blank', 'noopener');
    });
  }

  /* ── Botón volver arriba ─────────────────────────────────── */
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('visible', window.scrollY > 700);
    }, { passive: true });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }
})();
