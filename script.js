/* ============================================
   DSH Solutions — JavaScript
   ============================================ */

(function () {
  'use strict';

  // --- Theme Toggle ---
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('dsh-theme');

  if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
  } else {
    // Default to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }

  themeToggle.addEventListener('click', function () {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('dsh-theme', next);
  });

  // --- Mobile Navigation ---
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');

  burger.addEventListener('click', function () {
    burger.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close nav on link click
  navLinks.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', function () {
      burger.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // --- Scroll Reveal ---
  var reveals = document.querySelectorAll('.reveal');

  function checkReveal() {
    var windowHeight = window.innerHeight;
    reveals.forEach(function (el) {
      var top = el.getBoundingClientRect().top;
      if (top < windowHeight - 80) {
        el.classList.add('visible');
      }
    });
  }

  // Use IntersectionObserver if available (better performance)
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    window.addEventListener('scroll', checkReveal, { passive: true });
    checkReveal();
  }

  // --- Nav background on scroll ---
  var nav = document.getElementById('nav');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update URL without scroll jump
        history.pushState(null, '', href);
      }
    });
  });

  // --- Contact Form (basic client-side validation + UX) ---
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      var email = form.querySelector('#email');
      var consent = form.querySelector('[name="gdpr_consent"]');

      // Basic email check
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        e.preventDefault();
        email.focus();
        email.style.borderColor = '#ff4444';
        return;
      }

      // GDPR consent check
      if (consent && !consent.checked) {
        e.preventDefault();
        consent.parentElement.style.color = '#ff4444';
        return;
      }
    });

    // Reset validation styles on input
    form.querySelectorAll('.form__input').forEach(function (input) {
      input.addEventListener('input', function () {
        this.style.borderColor = '';
      });
    });
  }
  // --- Project Gallery Lightbox ---
  var lightbox = document.getElementById('lightbox');
  if (lightbox) {
    var lbImg = lightbox.querySelector('.lightbox__img');
    var lbCaption = lightbox.querySelector('.lightbox__caption');
    var lbTitle = lightbox.querySelector('.lightbox__title');
    var lbThumbs = lightbox.querySelector('.lightbox__thumbs');
    var lbItems = [];
    var lbIndex = 0;
    var lbOpener = null;

    function lbRender() {
      var item = lbItems[lbIndex];
      lbImg.src = item.src;
      lbImg.alt = item.caption;
      lbCaption.innerHTML = '<b>' + (lbIndex + 1) + '/' + lbItems.length + '</b>' + item.caption;
      lbThumbs.querySelectorAll('.lightbox__thumb').forEach(function (t, i) {
        t.classList.toggle('lightbox__thumb--active', i === lbIndex);
      });
    }

    function lbOpen(card) {
      var data = card.querySelectorAll('.project__gallery li');
      if (!data.length) return;
      lbItems = Array.prototype.map.call(data, function (li) {
        return { src: li.getAttribute('data-src'), caption: li.textContent.trim() };
      });
      lbIndex = 0;
      lbOpener = card.querySelector('.project__cover');
      var name = card.querySelector('h3').textContent;
      var tagline = card.querySelector('.project__tagline');
      lbTitle.innerHTML = name + (tagline ? '<small>' + tagline.textContent + '</small>' : '');
      lbThumbs.innerHTML = lbItems.map(function (it, i) {
        return '<button class="lightbox__thumb" type="button" data-i="' + i + '" aria-label="Snímek ' + (i + 1) + '"><img src="' + it.src + '" alt=""></button>';
      }).join('');
      lightbox.classList.add('open');
      document.body.classList.add('lightbox-open');
      lbRender();
      lightbox.querySelector('.lightbox__close').focus();
    }

    function lbClose() {
      lightbox.classList.remove('open');
      document.body.classList.remove('lightbox-open');
      if (lbOpener) lbOpener.focus();
    }

    function lbStep(delta) {
      lbIndex = (lbIndex + delta + lbItems.length) % lbItems.length;
      lbRender();
    }

    document.querySelectorAll('.project__cover').forEach(function (btn) {
      btn.addEventListener('click', function () { lbOpen(btn.closest('.project')); });
    });
    lightbox.querySelector('.lightbox__close').addEventListener('click', lbClose);
    lightbox.querySelector('.lightbox__nav--prev').addEventListener('click', function () { lbStep(-1); });
    lightbox.querySelector('.lightbox__nav--next').addEventListener('click', function () { lbStep(1); });
    lbThumbs.addEventListener('click', function (e) {
      var t = e.target.closest('.lightbox__thumb');
      if (t) { lbIndex = parseInt(t.getAttribute('data-i'), 10); lbRender(); }
    });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.classList.contains('lightbox__stage')) lbClose();
    });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') lbClose();
      if (e.key === 'ArrowRight') lbStep(1);
      if (e.key === 'ArrowLeft') lbStep(-1);
    });

    // Swipe on touch devices
    var touchX = null;
    lightbox.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) lbStep(dx < 0 ? 1 : -1);
      touchX = null;
    }, { passive: true });
  }
})();
