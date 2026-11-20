/* ============================================================
   RUBayed HASAN — PORTFOLIO
   Language · Menu · Reveal · Form · Premium PNG Favicon
   ============================================================ */

(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ============================================================
     0. PREMIUM PNG FAVICON GENERATOR
     ============================================================ */

  /**
   * Draws a premium gold rounded-square mark with dark serif "RH" monogram.
   * Exported as PNG (128×128) and set as favicon + shown in footer preview.
   */
  function generatePremiumFavicon() {
    const S = 128;
    const canvas = document.createElement('canvas');
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const radius = 28;

    // Rounded-rect path
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

    // Gold gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, S, S);
    bgGrad.addColorStop(0.00, '#e8b87c');
    bgGrad.addColorStop(0.50, '#d9a86c');
    bgGrad.addColorStop(1.00, '#b87a4a');
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // Top-left highlight for premium depth
    const hl = ctx.createRadialGradient(S * 0.28, S * 0.22, 0, S * 0.3, S * 0.25, S * 0.75);
    hl.addColorStop(0.0, 'rgba(255, 255, 255, 0.35)');
    hl.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = hl;
    ctx.fill();

    // Inner border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Slight inner shadow at bottom
    const sh = ctx.createLinearGradient(0, S * 0.55, 0, S);
    sh.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
    sh.addColorStop(1.0, 'rgba(0, 0, 0, 0.12)');
    ctx.fillStyle = sh;
    ctx.fill();

    // "RH" monogram in dark serif
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

    // 1) Set as the site favicon (replaces the placeholder)
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

    // 2) Remove any leftover shortcut / apple-touch icons that might conflict
    $$("link[rel='shortcut icon'], link[rel='apple-touch-icon']").forEach((el) => el.remove());

    // 3) Add a clean apple-touch-icon with the same premium PNG
    const apple = document.createElement('link');
    apple.rel = 'apple-touch-icon';
    apple.href = dataUrl;
    document.head.appendChild(apple);

    // 4) Show the actual PNG in the footer as a live preview
    const preview = document.getElementById('footerFavicon');
    if (preview) preview.src = dataUrl;
  }

  // Run as early as possible
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
     6. CONTACT FORM
     ============================================================ */
  const form = $('#contactForm');
  const submitBtn = $('#submitBtn');
  const formMessage = $('#formMessage');

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
          success: 'Thanks! Your message has been sent — I\'ll reply within 24 hours.'
        },
        bn: {
          name: 'অনুগ্রহ করে আপনার নাম লিখুন।',
          email: 'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা লিখুন।',
          message: 'অনুগ্রহ করে একটু বিস্তারিত বার্তা লিখুন।',
          success: 'ধন্যবাদ! আপনার বার্তা পাঠানো হয়েছে — আমি ২৪ ঘণ্টার মধ্যে উত্তর দেব।'
        }
      }[lang] || {};

      if (!name) {
        setMessage(t.name || 'Please enter your name.', false);
        nameEl && nameEl.focus();
        return;
      }
      if (!EMAIL_RE.test(email)) {
        setMessage(t.email || 'Please enter a valid email address.', false);
        emailEl && emailEl.focus();
        return;
      }
      if (message.length < 10) {
        setMessage(t.message || 'Please write a slightly longer message.', false);
        messageEl && messageEl.focus();
        return;
      }

      if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
        }
        form.reset();
        setMessage(t.success || 'Message sent!', true);
      }, 1300);
    });
  }

  /* ============================================================
     7. FOOTER YEAR
     ============================================================ */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

})();
