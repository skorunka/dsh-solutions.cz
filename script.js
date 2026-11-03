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

  // --- Contact Form ---
  // Odesílá se na pozadí (fetch na Formspree), návštěvník zůstává na webu
  // a vidí vlastní potvrzení. Když odeslání na pozadí selže na straně
  // serveru, formulář se odešle klasicky, aby se žádná poptávka neztratila.
  var form = document.getElementById('contactForm');
  if (form) {
    var success = document.getElementById('formSuccess');
    var submitBtn = form.querySelector('.form__submit');
    var submitLabel = form.querySelector('.form__submit-label');
    var alertBox = form.querySelector('.form__alert');
    var fields = {
      name: form.querySelector('#name'),
      email: form.querySelector('#email'),
      message: form.querySelector('#message'),
      consent: form.querySelector('[name="gdpr_consent"]')
    };
    var errors = {
      name: form.querySelector('#name-error'),
      email: form.querySelector('#email-error'),
      message: form.querySelector('#message-error'),
      consent: form.querySelector('#consent-error')
    };
    var attempted = false;

    // Odkud návštěvník přišel. Značku nese QR kód na tištěných materiálech
    // (?utm_source=ples), hodnota se připojí k e-mailu z formuláře.
    // Čte se jen z adresy aktuální stránky, nic se neukládá do prohlížeče.
    var origin = form.querySelector('[name="zdroj"]');
    if (origin && window.URLSearchParams) {
      var q = new URLSearchParams(window.location.search);
      var tags = ['utm_source', 'utm_medium', 'utm_campaign'].map(function (key) {
        return q.get(key);
      }).filter(Boolean);
      if (tags.length) {
        origin.value = tags.join(' / ');
      } else if (document.referrer) {
        try { origin.value = new URL(document.referrer).hostname; } catch (err) { /* ignore */ }
      } else {
        origin.value = 'přímo';
      }
    }

    // Překlepy v nejčastějších doménách: "gmial.com" → nabídne "gmail.com".
    var DOMAINS = ['gmail.com', 'seznam.cz', 'email.cz', 'centrum.cz', 'outlook.com', 'hotmail.com',
      'icloud.com', 'post.cz', 'volny.cz', 'atlas.cz', 'yahoo.com', 'tiscali.cz', 'outlook.cz'];
    function distance(a, b) {
      var d = [];
      for (var i = 0; i <= a.length; i++) { d[i] = [i]; }
      for (var j = 1; j <= b.length; j++) { d[0][j] = j; }
      for (i = 1; i <= a.length; i++) {
        for (j = 1; j <= b.length; j++) {
          d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        }
      }
      return d[a.length][b.length];
    }
    function suggestEmail(value) {
      var at = value.lastIndexOf('@');
      if (at < 1) return null;
      var domain = value.slice(at + 1).toLowerCase();
      if (!domain || DOMAINS.indexOf(domain) !== -1) return null;
      var best = null, bestD = 3;
      DOMAINS.forEach(function (candidate) {
        var dist = distance(domain, candidate);
        if (dist < bestD) { bestD = dist; best = candidate; }
      });
      return best ? value.slice(0, at + 1) + best : null;
    }

    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    function check(key) {
      var el = fields[key];
      var msg = '';
      if (key === 'name' && !el.value.trim()) msg = 'Napište, jak vám máme říkat.';
      if (key === 'email') {
        var v = el.value.trim();
        if (!v) msg = 'Bez e-mailu se vám nemáme jak ozvat.';
        else if (!EMAIL_RE.test(v)) msg = 'Tohle nevypadá jako e-mail. Zkontrolujte ho prosím.';
      }
      if (key === 'message') {
        var len = el.value.trim().length;
        if (!len) msg = 'Napište aspoň pár slov, o co jde.';
        else if (len < 10) msg = 'Ještě pár slov, ať víme, o co jde.';
      }
      if (key === 'consent' && !el.checked) msg = 'Bez souhlasu vám nemůžeme odpovědět.';

      errors[key].classList.remove('form__error--hint');
      errors[key].textContent = msg;
      if (key !== 'consent') el.setAttribute('aria-invalid', msg ? 'true' : 'false');

      // Návrh opravy překlepu v e-mailu (jen když je adresa jinak platná).
      if (key === 'email' && !msg) {
        var fix = suggestEmail(el.value.trim());
        if (fix) {
          errors.email.classList.add('form__error--hint');
          errors.email.textContent = 'Nemysleli jste ';
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.textContent = fix;
          btn.addEventListener('click', function () {
            el.value = fix;
            check('email');
            el.focus();
          });
          errors.email.appendChild(btn);
          errors.email.appendChild(document.createTextNode('?'));
        }
      }
      return !msg;
    }

    Object.keys(fields).forEach(function (key) {
      var el = fields[key];
      el.addEventListener(key === 'consent' ? 'change' : 'input', function () {
        if (attempted || el.getAttribute('aria-invalid') === 'true') check(key);
      });
      if (key !== 'consent') {
        el.addEventListener('blur', function () {
          if (attempted || el.value.trim()) check(key);
        });
      }
    });

    // Textové pole roste s textem, Ctrl/Cmd+Enter odešle.
    fields.message.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight + 2, 480) + 'px';
    });
    fields.message.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        form.requestSubmit ? form.requestSubmit() : submitBtn.click();
      }
    });

    function setLoading(on) {
      submitBtn.classList.toggle('is-loading', on);
      submitBtn.disabled = on;
      submitLabel.textContent = on ? 'Odesílám…' : 'Odeslat a domluvit konzultaci';
    }

    function showAlert(html) {
      alertBox.innerHTML = html;
      alertBox.hidden = false;
    }

    function showSuccess() {
      success.querySelector('[data-success-email]').textContent = fields.email.value.trim();
      form.classList.add('is-leaving');
      setTimeout(function () {
        form.hidden = true;
        success.hidden = false;
        var rect = success.getBoundingClientRect();
        if (rect.top < 80 || rect.top > window.innerHeight - 120) {
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        success.querySelector('.form-success__title').focus({ preventScroll: true });
      }, 250);
    }

    function mailtoFallback() {
      var body = fields.message.value.trim() + '\n\n' + fields.name.value.trim();
      return 'mailto:info@dsh-solutions.cz?subject=' + encodeURIComponent('Poptávka z webu') +
        '&body=' + encodeURIComponent(body);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      attempted = true;
      alertBox.hidden = true;

      var ok = ['name', 'email', 'message', 'consent'].map(check);
      var firstBad = ['name', 'email', 'message', 'consent'].filter(function (k, i) { return !ok[i]; })[0];
      if (firstBad) {
        fields[firstBad].focus();
        return;
      }

      // Bot vyplnil past: tvářit se jako úspěch, nic neposílat.
      if (form.querySelector('[name="_gotcha"]').value) {
        showSuccess();
        return;
      }

      var topics = Array.prototype.slice.call(form.querySelectorAll('[data-topic]:checked'))
        .map(function (c) { return c.value; });
      form.querySelector('[name="tema"]').value = topics.join(', ');
      var fromBall = /ples/.test(origin ? origin.value : '');
      form.querySelector('[name="_subject"]').value =
        (fromBall ? '[ples] ' : '') + 'Poptávka z webu: ' + fields.name.value.trim();

      if (!window.fetch || !window.FormData) {
        form.submit();
        return;
      }

      setLoading(true);
      var controller = window.AbortController ? new AbortController() : null;
      var timer = controller ? setTimeout(function () { controller.abort(); }, 15000) : null;

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
        signal: controller ? controller.signal : undefined
      }).then(function (res) {
        clearTimeout(timer);
        if (res.ok) {
          showSuccess();
          return;
        }
        // Server odmítl odeslání na pozadí (např. vyžaduje reCAPTCHA):
        // pošleme formulář klasicky, poptávka se tak neztratí.
        form.submit();
      }).catch(function () {
        clearTimeout(timer);
        setLoading(false);
        showAlert('Zprávu se nepodařilo odeslat, nejspíš vypadlo připojení. Zkuste to prosím znovu, ' +
          'nebo nám napište přímo na <a href="' + mailtoFallback() + '">info@dsh-solutions.cz</a>.');
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
