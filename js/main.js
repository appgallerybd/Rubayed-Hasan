/* ============================================================
   RUBayed HASAN — PORTFOLIO
   Language · Menu · Reveal · WhatsApp Form · Premium Favicon
   ============================================================ */

(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ============================================================
     0. PREMIUM PNG FAVICON GENERATOR
     ============================================================ */
  function generatePremiumFavicon() {
    const S = 128;
    const canvas = document.createElement('canvas');
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const radius = 28;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(S - radius, 0);
    ctx.quadraticCurveTo(S, 0, S, radius);
    ctx.lineTo(S, S - radius);
    ctx.quadraticCurveTo(S, S, S - radius, S);
    ctx.lineTo(radius, S);
    ctx.quadraticCurveTo(0, S, 0, S - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();

    // Rich Gold Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, S, S);
    bgGrad.addColorStop(0.00, '#f3e5ab');
    bgGrad.addColorStop(0.50, '#d4af37');
    bgGrad.addColorStop(1.00, '#b8862d');
    ctx.fillStyle = bgGrad;
    ctx.fill();

    const hl = ctx.createRadialGradient(S * 0.28, S * 0.22, 0, S * 0.3, S * 0.25, S * 0.75);
    hl.addColorStop(0.0, 'rgba(255, 255, 255, 0.45)');
    hl.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = hl;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    const sh = ctx.createLinearGradient(0, S * 0.55, 0, S);
    sh.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
    sh.addColorStop(1.0, 'rgba(0, 0, 0, 0.2)');
    ctx.fillStyle = sh;
    ctx.fill();

    ctx.fillStyle = '#14100a';
    ctx.font = 'bold 56px Georgia, "Instrument Serif", "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RH', S / 2, S / 2 + 3);

    return canvas.toDataURL('image/png');
  }

  function applyFavicon() {
    const dataUrl = generatePremiumFavicon();
    if (!dataUrl) return;

    const existing = document.getElementById('siteFavicon');
    if (existing) {
      existing.type = 'image/png';
      existing.href = dataUrl;
    } else {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = dataUrl;
      document.head.appendChild(link);
    }

    $$("link[rel='shortcut icon'], link[rel='apple-touch-icon']").forEach((el) => el.remove());

    const apple = document.createElement('link');
    apple.rel = 'apple-touch-icon';
    apple.href = dataUrl;
    document.head.appendChild(apple);

    const preview = document.getElementById('footerFavicon');
    if (preview) preview.src = dataUrl;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFavicon, { once: true });
  } else {
    applyFavicon();
  }

  /* ============================================================
     1. LANGUAGE TOGGLE
     ============================================================ */
  const LANG_KEY = 'rh-lang';
  const langButtons = $$('[data-set-lang]');

  function applyLanguage(lang) {
    document.documentElement.lang = lang;
    localStorage.setItem(LANG_KEY, lang);

    langButtons.forEach((btn) => {
      const isActive = btn.dataset.setLang === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    $$('[data-ph-en]').forEach((el) => {
      const text = lang === 'bn' ? el.dataset.phBn : el.dataset.phEn;
      if (text) el.setAttribute('placeholder', text);
    });

    document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
  }

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => applyLanguage(btn.dataset.setLang));
  });

  const initialLang = document.documentElement.lang === 'bn' ? 'bn' : 'en';
  applyLanguage(initialLang);

  /* ============================================================
     2. MOBILE MENU
     ============================================================ */
  const menuToggle = $('#menuToggle');
  const mobileMenu = $('#mobileMenu');

  function closeMenu() {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    $$('a', mobileMenu).forEach((link) => link.addEventListener('click', closeMenu));

    document.addEventListener('click', (e) => {
      if (!mobileMenu.classList.contains('open')) return;
      if (mobileMenu.contains(e.target) || menuToggle.contains(e.target)) return;
      closeMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ============================================================
     3. HEADER SCROLL STATE
     ============================================================ */
  const header = $('#header');
  function updateHeader() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  /* ============================================================
     4. SCROLL REVEAL
     ============================================================ */
  const revealEls = $$('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  /* ============================================================
     5. ACTIVE NAV LINK ON SCROLL
     ============================================================ */
  const sections = $$('section[id]');
  const navLinks = $$('.nav-desktop a');

  if ('IntersectionObserver' in window && sections.length && navLinks.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((section) => navObserver.observe(section));
  }

  /* ============================================================
     6. CONTACT FORM -> WHATSAPP REDIRECT
     ============================================================ */
  const form = $('#contactForm');
  const submitBtn = $('#submitBtn');
  const formMessage = $('#formMessage');
  const WA_NUMBER = '8801776561371'; // Your WhatsApp number

  if (form) {
    const nameEl = $('#name');
    const emailEl = $('#email');
    const messageEl = $('#message');
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function setMessage(text, isOk) {
      if (!formMessage) return;
      formMessage.textContent = text;
      formMessage.classList.toggle('ok', !!isOk);
    }

    [nameEl, emailEl, messageEl].forEach((el) => {
      if (!el) return;
      el.addEventListener('input', () => {
        if (formMessage) {
          formMessage.textContent = '';
          formMessage.classList.remove('ok');
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (submitBtn && submitBtn.classList.contains('loading')) return;

      const name = nameEl ? nameEl.value.trim() : '';
      const email = emailEl ? emailEl.value.trim() : '';
      const message = messageEl ? messageEl.value.trim() : '';
      const lang = document.documentElement.lang;

      const t = {
        en: {
          name: 'Please enter your name.',
          email: 'Please enter a valid email address.',
          message: 'Please write a slightly longer message.',
          success: 'Opening WhatsApp...'
        },
        bn: {
          name: 'অনুগ্রহ করে আপনার নাম লিখুন।',
          email: 'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা লিখুন।',
          message: 'অনুগ্রহ করে একটু বিস্তারিত বার্তা লিখুন।',
          success: 'হোয়াটসঅ্যাপ খোলা হচ্ছে...'
        }
      }[lang] || {};

      if (!name) {
        setMessage(t.name, false);
        nameEl && nameEl.focus();
        return;
      }
      if (!EMAIL_RE.test(email)) {
        setMessage(t.email, false);
        emailEl && emailEl.focus();
        return;
      }
      if (message.length < 10) {
        setMessage(t.message, false);
        messageEl && messageEl.focus();
        return;
      }

      if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
      }
      setMessage(t.success, true);

      // Construct WhatsApp Message
      const waText = `Hello Rubayed,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
      const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`;

      setTimeout(() => {
        window.open(waUrl, '_blank');
        
        if (submitBtn) {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
        }
        form.reset();
        setMessage(lang === 'bn' ? 'বার্তা পাঠানো হয়েছে।' : 'Message sent.', true);
      }, 1000);
    });
  }

  /* ============================================================
     7. FOOTER YEAR
     ============================================================ */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

})();
