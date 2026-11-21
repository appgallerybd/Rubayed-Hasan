/* ============================================================
   RUBayed HASAN — PORTFOLIO
   Language · Menu · Reveal · WhatsApp · Counters · Favicon · Carousel
   ============================================================ */

(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ============================================================
     0. ROUND FAVICON GENERATOR
     ============================================================ */
  function generateRoundFavicon() {
    const img = new Image();
    img.src = 'images/profile.png'; 
    img.crossOrigin = 'Anonymous';
    
    img.onload = function() {
      const S = 64; 
      const canvas = document.createElement('canvas');
      canvas.width = S;
      canvas.height = S;
      const ctx = canvas.getContext('2d');
      
      ctx.beginPath();
      ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      
      const aspect = img.width / img.height;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (aspect > 1) {
        sw = img.height;
        sx = (img.width - sw) / 2;
      } else if (aspect < 1) {
        sh = img.width;
        sy = (img.height - sh) / 2;
      }
      
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, S, S);

      const dataUrl = canvas.toDataURL('image/png');
      let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/png';
      link.rel = 'icon';
      link.href = dataUrl;
      document.head.appendChild(link);
    };
  }
  generateRoundFavicon();

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
    });

    $$('[data-ph-en]').forEach((el) => {
      const text = lang === 'bn' ? el.dataset.phBn : el.dataset.phEn;
      if (text) el.setAttribute('placeholder', text);
    });
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
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

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
     5. STATS COUNTER ANIMATION
     ============================================================ */
  const statNumbers = $$('.stat-number');
  if (statNumbers.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target'), 10);
          const duration = 2000; 
          const startTime = performance.now();

          function updateCount(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Easing function (easeOutQuad)
            const easeOut = progress * (2 - progress);
            const currentVal = Math.floor(easeOut * target);
            
            el.textContent = currentVal;
            
            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              el.textContent = target;
            }
          }
          requestAnimationFrame(updateCount);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(num => counterObserver.observe(num));
  }

  /* ============================================================
     6. MARQUEE SCROLLING LOGIC (Home page)
     ============================================================ */
  const track = $('#workTrack');
  if (track) {
    let scrollPos = 0;
    let speed = 2.0; 
    let isPaused = false;
    let hoverTimeout = null;
    let trackWidth = track.scrollWidth / 2;

    window.addEventListener('resize', () => {
      trackWidth = track.scrollWidth / 2;
    });

    function animateMarquee() {
      if (!isPaused) {
        scrollPos -= speed;
        if (Math.abs(scrollPos) >= trackWidth) {
          scrollPos = 0;
        }
        track.style.transform = `translateX(${scrollPos}px)`;
      }
      requestAnimationFrame(animateMarquee);
    }
    requestAnimationFrame(animateMarquee);

    const pauseMarquee = () => {
      isPaused = true;
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => { isPaused = false; }, 5000);
    };
    const resumeMarquee = () => {
      clearTimeout(hoverTimeout);
      isPaused = false;
    };

    track.addEventListener('mouseenter', pauseMarquee, { passive: true });
    track.addEventListener('touchstart', pauseMarquee, { passive: true });
    track.addEventListener('mouseleave', resumeMarquee, { passive: true });
    track.addEventListener('touchend', resumeMarquee, { passive: true });
  }

  /* ============================================================
     7. CLIENT REVIEWS CAROUSEL (5s Auto-slide)
     ============================================================ */
  const reviews = $$('.review-card');
  if (reviews.length > 0) {
    let currentReview = 0;
    
    // Set first as active
    reviews[0].classList.add('active');

    setInterval(() => {
      reviews[currentReview].classList.remove('active');
      currentReview = (currentReview + 1) % reviews.length;
      reviews[currentReview].classList.add('active');
    }, 5000);
  }

})();
