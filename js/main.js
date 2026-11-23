(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ============================================================
     1. UI FUNCTIONALITY (Menu, Language, Chatbot)
     ============================================================ */
  // --- Round Favicon ---
  function generateRoundFavicon() {
    const img = new Image();
    img.src = 'images/profile.png'; 
    img.onload = function() {
      const S = 64; const canvas = document.createElement('canvas');
      canvas.width = S; canvas.height = S; const ctx = canvas.getContext('2d');
      ctx.beginPath(); ctx.arc(S/2, S/2, S/2, 0, Math.PI*2); ctx.clip();
      const aspect = img.width / img.height; let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (aspect > 1) { sw = img.height; sx = (img.width - sw) / 2; }
      else if (aspect < 1) { sh = img.width; sy = (img.height - sh) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, S, S);
      let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/png'; link.rel = 'icon'; link.href = canvas.toDataURL('image/png');
      document.head.appendChild(link);
    };
  }
  generateRoundFavicon();

  // --- Language Toggle ---
  const langButtons = $$('[data-set-lang]');
  function applyLanguage(lang) {
    document.documentElement.lang = lang;
    localStorage.setItem('rh-lang', lang);
    langButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.setLang === lang));
  }
  langButtons.forEach(btn => btn.addEventListener('click', () => applyLanguage(btn.dataset.setLang)));
  applyLanguage(document.documentElement.lang === 'bn' ? 'bn' : 'en');

  // --- Mobile Menu ---
  const menuToggle = $('#menuToggle'), mobileMenu = $('#mobileMenu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    document.addEventListener('click', (e) => {
      if (!mobileMenu.classList.contains('open')) return;
      if (mobileMenu.contains(e.target) || menuToggle.contains(e.target)) return;
      mobileMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  }

  // --- Header Scroll & Reveal ---
  const header = $('#header');
  window.addEventListener('scroll', () => { if (header) header.classList.toggle('scrolled', window.scrollY > 12); }, { passive: true });
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => revealObserver.observe(el));
  } else { revealEls.forEach(el => el.classList.add('visible')); }

  // --- Stats Counter ---
  const statNumbers = $$('.stat-number');
  if (statNumbers.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target'), 10);
          const duration = 2000; const startTime = performance.now();
          function updateCount(currentTime) {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easeOut = progress * (2 - progress);
            el.textContent = Math.floor(easeOut * target);
            if (progress < 1) requestAnimationFrame(updateCount);
            else el.textContent = target;
          }
          requestAnimationFrame(updateCount); observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    statNumbers.forEach(num => counterObserver.observe(num));
  }

  // --- Marquee ---
  const track = $('#workTrack');
  if (track) {
    let scrollPos = 0, speed = 2.0, isPaused = false, hoverTimeout = null;
    let trackWidth = track.scrollWidth / 2;
    window.addEventListener('resize', () => { trackWidth = track.scrollWidth / 2; });
    function animateMarquee() {
      if (!isPaused) {
        scrollPos -= speed;
        if (Math.abs(scrollPos) >= trackWidth) scrollPos = 0;
        track.style.transform = `translateX(${scrollPos}px)`;
      }
      requestAnimationFrame(animateMarquee);
    }
    requestAnimationFrame(animateMarquee);
    const pauseMarquee = () => { isPaused = true; clearTimeout(hoverTimeout); hoverTimeout = setTimeout(() => { isPaused = false; }, 5000); };
    const resumeMarquee = () => { clearTimeout(hoverTimeout); isPaused = false; };
    track.addEventListener('mouseenter', pauseMarquee, { passive: true });
    track.addEventListener('touchstart', pauseMarquee, { passive: true });
    track.addEventListener('mouseleave', resumeMarquee, { passive: true });
    track.addEventListener('touchend', resumeMarquee, { passive: true });
  }

  // --- Reviews Carousel ---
  const reviews = $$('.review-card');
  if (reviews.length > 0) {
    let currentIndex = 0; reviews[0].classList.add('active');
    setInterval(() => {
      reviews[currentIndex].classList.remove('active'); reviews[currentIndex].classList.add('prev');
      const prevIndex = currentIndex; currentIndex = (currentIndex + 1) % reviews.length;
      reviews[currentIndex].classList.remove('prev'); reviews[currentIndex].classList.add('active');
      setTimeout(() => { reviews[prevIndex].classList.remove('prev'); }, 600);
    }, 5000);
  }

  // --- Chatbot ---
  const waBtn = $('.floating-wa'), chatWidget = $('#chatWidget'), chatBody = $('#chatBody'), quickReplies = $('#chatQuickReplies');
  const chatData = [
    { q_en: 'What services do you offer?', q_bn: 'আপনি কী কী সেবা দেন?', a_en: 'I offer Logo Design, Brand Identity, Arabic Calligraphy, Print Design, and Social Media Design.', a_bn: 'আমি লোগো ডিজাইন, ব্র্যান্ড আইডেন্টিটি, আরবি ক্যালিগ্রাফি, প্রিন্ট ডিজাইন এবং সোশ্যাল মিডিয়া ডিজাইন করি।' },
    { q_en: 'How many years of experience?', q_bn: 'আপনার অভিজ্ঞতা কত বছরের?', a_en: 'I have 3+ years of professional experience.', a_bn: 'আমার ৩+ বছরের পেশাদার অভিজ্ঞতা আছে।' },
    { q_en: 'How can I contact you?', q_bn: 'আমি আপনাকে কিভাবে যোগাযোগ করব?', a_en: 'You can contact me via WhatsApp or Email.', a_bn: 'আপনি হোয়াটসঅ্যাপ বা ইমেইল এর মাধ্যমে যোগাযোগ করতে পারেন।' }
  ];
  let isChatInitialized = false;
  function initChat() {
    if (isChatInitialized || !chatBody) return;
    appendMessage('bot', "Hi, I am Rubayed Hasan's Virtual Assistant. How can I help you?", "হাই, আমি রুবায়েদ হাসান এর ভার্চুয়াল অ্যাসিস্ট্যান্ট। আমি আপনাকে কিভাবে সহযোগিতা করতে পারি?");
    chatData.forEach(data => {
      const btn = document.createElement('button'); btn.className = 'quick-reply-btn';
      btn.innerHTML = `<span lang="en">${data.q_en}</span><span lang="bn">${data.q_bn}</span>`;
      btn.onclick = () => handleQuickReply(data);
      if (quickReplies) quickReplies.appendChild(btn);
    });
    isChatInitialized = true;
  }
  function appendMessage(sender, textEn, textBn) {
    if (!chatBody) return;
    const msgDiv = document.createElement('div'); msgDiv.className = `chat-msg ${sender}`;
    const avatarHTML = sender === 'bot' ? `<img src="images/profile.png" alt="Bot" class="msg-avatar">` : '';
    msgDiv.innerHTML = `${avatarHTML}<div class="msg-bubble"><span lang="en">${textEn}</span><span lang="bn">${textBn}</span></div>`;
    chatBody.appendChild(msgDiv); chatBody.scrollTop = chatBody.scrollHeight;
  }
  function handleQuickReply(data) {
    appendMessage('user', data.q_en, data.q_bn);
    if (quickReplies) quickReplies.style.opacity = '0.5';
    setTimeout(() => { appendMessage('bot', data.a_en, data.a_bn); if (quickReplies) quickReplies.style.opacity = '1'; }, 600);
  }
  if (waBtn && chatWidget) {
    waBtn.addEventListener('click', (e) => {
      e.preventDefault(); 
      const isActive = chatWidget.classList.toggle('active');
      if (isActive) initChat();
    });
  }

  /* ============================================================
     2. SUPABASE DYNAMIC DATA LOADER
     ============================================================ */
  const SUPABASE_URL = 'https://qynaqzukiwtnxjsciazk.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_dTX5xkv4svMJA9-M5QMHKA_YctCIi19';

  async function loadDynamicData() {
    if (typeof window.supabase === 'undefined') return;
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    try {
      // 1. Load Settings
      const { data: settings } = await supabaseClient.from('site_settings').select('*');
      if (settings && settings.length > 0) {
        const dict = {};
        settings.forEach(s => dict[s.key] = s.value);
        
        const setText = (selector, text) => { const el = document.querySelector(selector); if (el) el.innerHTML = text; };
        const setAttr = (selector, attr, val) => { const el = document.querySelector(selector); if (el) el.setAttribute(attr, val); };

        if (dict.hero_title_en) setText('.hero-title [lang="en"]', dict.hero_title_en.replace('Rubayed Hasan', '<em>Rubayed Hasan</em>'));
        if (dict.hero_title_bn) setText('.hero-title [lang="bn"]', dict.hero_title_bn.replace('রুবায়েদ হাসান', '<em>রুবায়েদ হাসান</em>'));
        if (dict.hero_tagline_en) setText('.hero-tagline [lang="en"]', dict.hero_tagline_en);
        if (dict.hero_tagline_bn) setText('.hero-tagline [lang="bn"]', dict.hero_tagline_bn);
        if (dict.about_text_en) setText('.about-text p [lang="en"]', dict.about_text_en);
        if (dict.about_text_bn) setText('.about-text p [lang="bn"]', dict.about_text_bn);

        if (dict.stat_experience) setAttr('.stat-number[data-target="3"]', 'data-target', dict.stat_experience);
        if (dict.stat_projects) setAttr('.stat-number[data-target="15"]', 'data-target', dict.stat_projects);
        if (dict.stat_clients) setAttr('.stat-number[data-target="99"]', 'data-target', dict.stat_clients);
      }

      // 2. Load Projects
      const { data: projects } = await supabaseClient.from('projects').select('*').order('created_at', { ascending: false });
      if (projects && projects.length > 0 && document.getElementById('workTrack')) {
        const track = document.getElementById('workTrack');
        const projectHTML = projects.map(p => `
          <article class="project">
            <div class="project-visual"><img src="${p.image_url}" alt="${p.name}" loading="lazy" /></div>
            <div class="project-info">
              <h3>${p.name}</h3>
              <p class="project-cat"><span lang="en">${p.category_en}</span><span lang="bn">${p.category_bn}</span></p>
            </div>
          </article>
        `).join('');
        track.innerHTML = projectHTML + projectHTML; // Duplicate for infinite scroll
      }

      // 3. Load Reviews
      const { data: reviews } = await supabaseClient.from('reviews').select('*').order('created_at', { ascending: false });
      const reviewCarousel = document.querySelector('.review-carousel');
      if (reviews && reviews.length > 0 && reviewCarousel) {
        reviewCarousel.innerHTML = reviews.map((r, index) => `
          <div class="review-card ${index === 0 ? 'active' : ''}">
            <div class="review-stars">
              <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            </div>
            <p class="review-text"><span lang="en">"${r.review_text_en}"</span><span lang="bn">"${r.review_text_bn}"</span></p>
            <div class="review-author">
              <div class="review-avatar">${r.client_name.charAt(0)}</div>
              <div class="review-author-info">
                <strong><span lang="en">${r.client_name}</span><span lang="bn">${r.client_name}</span></strong>
                <span><span lang="en">${r.client_role}</span><span lang="bn">${r.client_role}</span></span>
              </div>
            </div>
          </div>
        `).join('');
      }

    } catch (err) {
      console.error('Supabase Data Error: ', err);
    }
  }
  document.addEventListener('DOMContentLoaded', loadDynamicData);

})();
