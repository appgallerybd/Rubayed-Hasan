/* ============================================================
   RUBayed HASAN — PORTFOLIO
   Language toggle · Mobile menu · Scroll reveal · Form handling
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Utilities ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ============================================================
     1. LANGUAGE TOGGLE
     ============================================================ */
  const LANG_KEY = 'rh-lang';
  const langButtons = $$('[data-set-lang]');

  function applyLanguage(lang) {
    // Set the html lang attribute — CSS handles visibility of
    // [lang="en"] / [lang="bn"] child elements automatically.
    document.documentElement.lang = lang;
    localStorage.setItem(LANG_KEY, lang);

    // Update active state on toggle buttons
    langButtons.forEach((btn) => {
      const isActive = btn.dataset.setLang === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Update form placeholders
    $$('[data-ph-en]').forEach((el) => {
      const text = lang === 'bn' ? el.dataset.phBn : el.dataset.phEn;
      if (text) el.setAttribute('placeholder', text);
    });

    // Notify any listeners (optional)
    document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
  }

  // Bind language buttons
  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      applyLanguage(btn.dataset.setLang);
    });
  });

  // Initialise on load (HTML <head> script already set html lang)
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

    // Close menu when a link is tapped
    $$('a', mobileMenu).forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!mobileMenu.classList.contains('open')) return;
      if (mobileMenu.contains(e.target) || menuToggle.contains(e.target)) return;
      closeMenu();
    });

    // Close on Escape
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
    // Fallback: reveal everything
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

    // Clear error state while typing
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

      // Validation messages (bilingual)
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

      // Simulate async send
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

        // NOTE: To send real emails, integrate Formspree / EmailJS here.
        // Example (Formspree):
        //   fetch('https://formspree.io/f/XXXXXXX', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ name, email, message })
        //   });
      }, 1300);
    });
  }

  /* ============================================================
     7. FOOTER YEAR
     ============================================================ */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ============================================================
     8. SMOOTH ANCHOR SCROLL (with sticky header offset)
     ============================================================ */
  // Native CSS scroll-behavior + scroll-margin-top handles this,
  // but we also close the mobile menu on anchor clicks (done above).

  /* ============================================================
     9. KEYBOARD: return focus to toggle when menu closes
     ============================================================ */
  // (Handled implicitly — Escape closes menu.)

})();
