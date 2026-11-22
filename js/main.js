/* ============================================================
   RUBayed HASAN — PORTFOLIO
   Language · Menu · Reveal · WhatsApp · Counters · Favicon · Carousel · Chatbot
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
     7. CLIENT REVIEWS CAROUSEL (Smooth Slide + Blur)
     ============================================================ */
  const reviews = $$('.review-card');
  if (reviews.length > 0) {
    let currentIndex = 0;
    
    // Initialize first card
    reviews[0].classList.add('active');

    setInterval(() => {
      // Current card goes to prev (slides left, blurs out)
      reviews[currentIndex].classList.remove('active');
      reviews[currentIndex].classList.add('prev');
      
      // Move index
      const prevIndex = currentIndex;
      currentIndex = (currentIndex + 1) % reviews.length;
      
      // Next card becomes active (slides in from right, unblurs)
      reviews[currentIndex].classList.remove('prev');
      reviews[currentIndex].classList.add('active');

      // Clean up the prev class after transition completes
      setTimeout(() => {
        reviews[prevIndex].classList.remove('prev');
      }, 600); // Matches CSS transition duration

    }, 5000);
  }

  /* ============================================================
     8. CHATBOT WIDGET LOGIC
     ============================================================ */
  const waBtn = $('.floating-wa');
  const chatWidget = $('#chatWidget');
  const chatBody = $('#chatBody');
  const quickReplies = $('#chatQuickReplies');

  // Chat Data (Questions & Answers based on site content)
  const chatData = [
    {
      id: 'services',
      q_en: 'What services do you offer?',
      q_bn: 'আপনি কী কী সেবা দেন?',
      a_en: 'I offer Logo Design, Brand Identity, Arabic Calligraphy, Print Design, and Social Media Design.',
      a_bn: 'আমি লোগো ডিজাইন, ব্র্যান্ড আইডেন্টিটি, আরবি ক্যালিগ্রাফি, প্রিন্ট ডিজাইন এবং সোশ্যাল মিডিয়া ডিজাইন করি।'
    },
    {
      id: 'experience',
      q_en: 'How many years of experience do you have?',
      q_bn: 'আপনার অভিজ্ঞতা কত বছরের?',
      a_en: 'I have 3+ years of professional experience and completed 15+ projects for 15+ happy clients.',
      a_bn: 'আমার ৩+ বছরের পেশাদার অভিজ্ঞতা আছে এবং আমি ১৫+ সন্তুষ্ট ক্লায়েন্টের জন্য ১৫+ প্রজেক্ট সম্পন্ন করেছি।'
    },
    {
      id: 'contact',
      q_en: 'How can I contact you?',
      q_bn: 'আমি আপনাকে কিভাবে যোগাযোগ করব?',
      a_en: 'You can contact me via WhatsApp (+880 1776-561371) or Email (mdrubayedhassan@gmail.com).',
      a_bn: 'আপনি হোয়াটসঅ্যাপ (+৮৮০ ১৭৭৬-৫৬১৩৭১) বা ইমেইল (mdrubayedhassan@gmail.com) এর মাধ্যমে যোগাযোগ করতে পারেন।'
    },
    {
      id: 'location',
      q_en: 'Where are you located?',
      q_bn: 'আপনার অবস্থান কোথায়?',
      a_en: 'I am based in Paikgacha, Khulna, Bangladesh.',
      a_bn: 'আমি পাইকগাছা, খুলনা, বাংলাদেশে অবস্থিত।'
    }
  ];

  let isChatInitialized = false;

  function initChat() {
    if (isChatInitialized || !chatBody) return;
    
    // 1. Welcome Message
    appendMessage('bot', 
      "Hi, I am Rubayed Hasan's Virtual Assistant. How can I help you?", 
      "হাই, আমি রুবায়েদ হাসান এর ভার্চুয়াল অ্যাসিস্ট্যান্ট। আমি আপনাকে কিভাবে সহযোগিতা করতে পারি?"
    );

    // 2. Quick Replies
    chatData.forEach(data => {
      const btn = document.createElement('button');
      btn.className = 'quick-reply-btn';
      btn.innerHTML = `<span lang="en">${data.q_en}</span><span lang="bn">${data.q_bn}</span>`;
      btn.onclick = () => handleQuickReply(data);
      if (quickReplies) quickReplies.appendChild(btn);
    });

    isChatInitialized = true;
  }

  function appendMessage(sender, textEn, textBn) {
    if (!chatBody) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender}`;
    
    const avatarHTML = sender === 'bot' 
      ? `<img src="images/profile.png" alt="Rubayed Hasan" class="msg-avatar">` 
      : '';
      
    msgDiv.innerHTML = `
      ${avatarHTML}
      <div class="msg-bubble">
        <span lang="en">${textEn}</span>
        <span lang="bn">${textBn}</span>
      </div>
    `;
    
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function handleQuickReply(data) {
    // Append User Question
    appendMessage('user', data.q_en, data.q_bn);
    
    // Hide quick replies temporarily
    if (quickReplies) quickReplies.style.opacity = '0.5';
    
    // Simulate typing delay then append Bot Answer
    setTimeout(() => {
      appendMessage('bot', data.a_en, data.a_bn);
      if (quickReplies) quickReplies.style.opacity = '1';
    }, 600);
  }

  if (waBtn && chatWidget) {
    waBtn.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent default WA redirect
      const isActive = chatWidget.classList.toggle('active');
      if (isActive) {
        initChat();
      }
    });
  }

})();

const SUPABASE_URL = 'https://qynaqzukiwtnxjsciazk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dTX5xkv4svMJA9-M5QMHKA_YctCIi19';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadDynamicData() {
  // সেটিংস লোড
  const { data: settings } = await supabaseClient.from('site_settings').select('*');
  if (settings) {
    const dict = {};
    settings.forEach(s => dict[s.key] = s.value);
    // এখানে আগের মতোই DOM এ বসিয়ে দিন (hero_title_en, hero_tagline_en ইত্যাদি)
  }

  // প্রজেক্ট লোড
  const { data: projects } = await supabaseClient.from('projects').select('*').order('created_at', { ascending: false });
  if (projects && document.getElementById('workTrack')) {
    // আগের মতোই মার্কি HTML জেনারেট করুন
  }

  // রিভিউ লোড
  const { data: reviews } = await supabaseClient.from('reviews').select('*').order('created_at', { ascending: false });
  if (reviews && document.querySelector('.review-carousel')) {
    // আগের মতোই রিভিউ কার্ড জেনারেট করুন
  }
}
document.addEventListener('DOMContentLoaded', loadDynamicData);
