(function () {
  const SUPABASE_URL = 'https://qynaqzukiwtnxjsciazk.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_dTX5xkv4svMJA9-M5QMHKA_YctCIi19';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const path = window.location.pathname;

  // ==========================================
  // 1. LANGUAGE TOGGLE SYSTEM
  // ==========================================
  function setLanguage(lang) {
    document.documentElement.lang = lang;
    localStorage.setItem('site_lang', lang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }
  const savedLang = localStorage.getItem('site_lang') || 'en';
  setLanguage(savedLang);

  // ==========================================
  // 2. INJECT PREMIUM HEADER & FOOTER
  // ==========================================
  const headerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <a href="index.html" class="logo">
          <img src="images/profile.png" class="logo-img" alt="Logo">
          <div>
            <span class="lang-en">Rubayed Hasan</span>
            <span class="lang-bn">রুবায়েদ হাসান</span>
          </div>
        </a>
        <nav class="nav-desktop">
          <a href="index.html" class="${path.includes('index') ? 'active' : ''}">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            <span class="lang-en">Home</span><span class="lang-bn">হোম</span>
          </a>
          <a href="about.html" class="${path.includes('about') ? 'active' : ''}">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span class="lang-en">About</span><span class="lang-bn">সম্পর্কে</span>
          </a>
          <a href="portfolio.html" class="${path.includes('portfolio') ? 'active' : ''}">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            <span class="lang-en">Portfolio</span><span class="lang-bn">পোর্টফোলিও</span>
          </a>
          <a href="services.html" class="${path.includes('services') ? 'active' : ''}">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span class="lang-en">Services</span><span class="lang-bn">সেবা</span>
          </a>
          <a href="blogs.html" class="${path.includes('blogs') || path.includes('blog-detail') ? 'active' : ''}">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <span class="lang-en">Blogs</span><span class="lang-bn">ব্লগস</span>
          </a>
          <a href="contact.html" class="${path.includes('contact') ? 'active' : ''}">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span class="lang-en">Contact</span><span class="lang-bn">যোগাযোগ</span>
          </a>
        </nav>
        <div class="header-actions">
          <div class="lang-toggle">
            <button class="lang-btn" data-lang="en" onclick="setLanguage('en')">EN</button>
            <button class="lang-btn" data-lang="bn" onclick="setLanguage('bn')">বাংলা</button>
          </div>
          <button class="mobile-menu-btn" id="mobileMenuBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>
      <div class="mobile-nav" id="mobileNav">
        <a href="index.html"><span class="lang-en">Home</span><span class="lang-bn">হোম</span></a>
        <a href="about.html"><span class="lang-en">About</span><span class="lang-bn">সম্পর্কে</span></a>
        <a href="portfolio.html"><span class="lang-en">Portfolio</span><span class="lang-bn">পোর্টফোলিও</span></a>
        <a href="services.html"><span class="lang-en">Services</span><span class="lang-bn">সেবা</span></a>
        <a href="blogs.html"><span class="lang-en">Blogs</span><span class="lang-bn">ব্লগস</span></a>
        <a href="contact.html"><span class="lang-en">Contact</span><span class="lang-bn">যোগাযোগ</span></a>
      </div>
    </header>
  `;

  const footerHTML = `
    <footer>
      <div class="container footer-content">
        <a href="index.html" class="logo">
          <img src="images/profile.png" class="logo-img">
          <div><span class="lang-en">Rubayed Hasan</span><span class="lang-bn">রুবায়েদ হাসান</span></div>
        </a>
        <p id="footerAbout" style="color:var(--muted); max-width:400px; text-align:center;"></p>
        <div class="footer-links">
          <a href="about.html"><span class="lang-en">About</span><span class="lang-bn">সম্পর্কে</span></a>
          <a href="portfolio.html"><span class="lang-en">Portfolio</span><span class="lang-bn">পোর্টফোলিও</span></a>
          <a href="services.html"><span class="lang-en">Services</span><span class="lang-bn">সেবা</span></a>
          <a href="blogs.html"><span class="lang-en">Blogs</span><span class="lang-bn">ব্লগস</span></a>
          <a href="contact.html"><span class="lang-en">Contact</span><span class="lang-bn">যোগাযোগ</span></a>
        </div>
        <div class="socials-wrapper" id="footerSocials"></div>
      </div>
      <div class="container copyright">
        <p>© 2026 <a href="index.html" style="color:var(--accent);">Rubayed Hasan</a>. <span class="lang-en">All Rights Reserved.</span><span class="lang-bn">সর্বস্বত্ব সংরক্ষিত।</span></p>
        <a href="#" class="palestine-btn">🇵🇸 #StandWithPalestine</a>
      </div>
    </footer>
  `;

  if (!path.includes('admin.html')) {
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    document.body.insertAdjacentHTML('beforeend', footerHTML);
    document.getElementById('mobileMenuBtn').addEventListener('click', () => {
      document.getElementById('mobileNav').classList.toggle('active');
    });
    // Ensure buttons reflect saved language
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === savedLang);
    });
  }

  // ==========================================
  // 3. GLOBAL DATA LOADER
  // ==========================================
  async function loadGlobal() {
    const { data: sets } = await supabase.from('site_settings').select('*');
    if(sets) {
      const dict = {}; sets.forEach(s => dict[s.key] = s.value);
      
      if(document.getElementById('footerAbout')) {
        document.getElementById('footerAbout').innerHTML = `
          <span class="lang-en">${dict.footer_about_en || ''}</span>
          <span class="lang-bn">${dict.footer_about_bn || dict.footer_about_en || ''}</span>
        `;
      }
      
      if(document.getElementById('heroTitle')) {
        document.getElementById('heroTitle').innerHTML = `
          <span class="lang-en">${dict.hero_title_en}</span>
          <span class="lang-bn">${dict.hero_title_bn}</span>
        `;
        document.getElementById('heroTagline').innerHTML = `
          <span class="lang-en">${dict.hero_tagline_en}</span>
          <span class="lang-bn">${dict.hero_tagline_bn}</span>
        `;
        document.getElementById('aboutTeaser').innerHTML = `
          <span class="lang-en">${dict.about_en}</span>
          <span class="lang-bn">${dict.about_bn || dict.about_en}</span>
        `;
      }
      
      if(document.getElementById('cPhone')) {
        document.getElementById('cPhone').textContent = dict.contact_phone;
        document.getElementById('cEmail').textContent = dict.contact_email;
        document.getElementById('cLoc').textContent = dict.contact_loc;
        document.getElementById('cWeb').textContent = dict.contact_web;
      }
      
      if(dict.highlight_color) document.documentElement.style.setProperty('--highlight', dict.highlight_color);
    }

    const { data: socs } = await supabase.from('social_links').select('*').eq('is_active', true);
    if(socs) {
      const renderSoc = (section) => socs.filter(s => s.section === section || s.section === 'both').map(s => 
        `<a href="${s.url}" target="_blank" class="social-icon">${s.icon_svg}</a>`
      ).join('');
      if(document.getElementById('heroSocials')) document.getElementById('heroSocials').innerHTML = renderSoc('hero');
      if(document.getElementById('footerSocials')) document.getElementById('footerSocials').innerHTML = renderSoc('footer');
    }
  }

  // ==========================================
  // 4. PAGE SPECIFIC LOADERS
  // ==========================================
  let allProjects = [];
  async function loadPageData() {
    if(path.includes('index') || path === '/') {
      const { data: stats } = await supabase.from('stats').select('*');
      if(stats && document.getElementById('statsGrid')) {
        const icons = [
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
        ];
        document.getElementById('statsGrid').innerHTML = stats.map((s, i) => `
          <div class="stat-item">
            <div class="stat-icon">${icons[i % 3]}</div>
            <div class="stat-number">${s.value}${s.suffix}</div>
            <div class="stat-label">
              <span class="lang-en">${s.label_en}</span>
              <span class="lang-bn">${s.label_bn || s.label_en}</span>
            </div>
          </div>
        `).join('');
      }

      const { data: projs } = await supabase.from('projects').select('*').eq('is_featured', true);
      allProjects = projs || [];
      renderFeaturedProjects(6);

      const { data: blogs } = await supabase.from('blog_posts').select('*').order('created_at', {ascending:false}).limit(3);
      if(blogs && document.getElementById('latestBlogs')) {
        document.getElementById('latestBlogs').innerHTML = blogs.map((b, i) => `
          <a href="blog-detail.html?id=${b.id}" class="card" style="${i===0 ? 'grid-column: 1 / -1; flex-direction:row; gap:24px; align-items:center;' : ''}">
            <img src="${b.image_url}" style="${i===0 ? 'width:50%; height:300px; margin-bottom:0;' : ''}">
            <div>
               <h3 class="lang-en">${b.title_en}</h3>
               <h3 class="lang-bn">${b.title_bn || b.title_en}</h3>
               <p style="margin-top:12px; font-size:13px; color:var(--accent); font-weight:600;">${b.read_time}</p>
            </div>
          </a>
        `).join('');
      }
    }

    if(path.includes('portfolio.html') && document.getElementById('portfolioGrid')) {
      const { data: projs } = await supabase.from('projects').select('*');
      document.getElementById('portfolioGrid').innerHTML = projs.map(p => `
        <div class="portfolio-card" onclick="this.classList.toggle('active')">
          <img src="${p.image_url}" alt="${p.title}">
          <div class="portfolio-info">
            <h3>${p.title}</h3>
            <p style="color:var(--accent); font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:1px;">${p.category_en}</p>
            <div class="portfolio-desc">${p.desc_en}</div>
          </div>
        </div>
      `).join('');
    }

    if(path.includes('services.html') && document.getElementById('servicesList')) {
      const { data: servs } = await supabase.from('services').select('*');
      document.getElementById('servicesList').innerHTML = servs.map(s => `
        <div class="card text-center">
           <div style="width:70px; height:70px; margin:0 auto 20px; background:rgba(212,175,55,0.1); border-radius:20px; display:flex; justify-content:center; align-items:center; color:var(--accent); font-size:28px;">${s.icon_svg || '★'}</div>
           <h3 class="lang-en">${s.title_en}</h3>
           <h3 class="lang-bn">${s.title_bn || s.title_en}</h3>
           <p class="lang-en" style="margin-top:10px;">${s.desc_en}</p>
           <p class="lang-bn" style="margin-top:10px;">${s.desc_bn || s.desc_en}</p>
        </div>
      `).join('');

      const { data: faqs } = await supabase.from('faqs').select('*');
      document.getElementById('faqList').innerHTML = faqs.map(f => `
        <div class="faq-item">
          <div class="faq-question" onclick="this.parentElement.classList.toggle('active')">
            <span class="lang-en">${f.question_en}</span>
            <span class="lang-bn">${f.question_bn || f.question_en}</span>
            <span>+</span>
          </div>
          <div class="faq-answer">
            <span class="lang-en">${f.answer_en}</span>
            <span class="lang-bn">${f.answer_bn || f.answer_en}</span>
          </div>
        </div>
      `).join('');
    }

    if(path.includes('blogs.html') && document.getElementById('allBlogsList')) {
      const { data: blogs } = await supabase.from('blog_posts').select('*').order('created_at', {ascending:false});
      document.getElementById('allBlogsList').innerHTML = blogs.map(b => `
        <a href="blog-detail.html?id=${b.id}" class="card">
          <img src="${b.image_url}">
          <h3 class="lang-en">${b.title_en}</h3>
          <h3 class="lang-bn">${b.title_bn || b.title_en}</h3>
          <p style="margin-top:12px; font-size:13px; color:var(--accent); font-weight:600;">${b.read_time}</p>
        </a>
      `).join('');
    }
  }

  window.renderFeaturedProjects = function(limit) {
    const grid = document.getElementById('featuredProjects');
    if(!grid) return;
    const toRender = allProjects.slice(0, limit);
    grid.innerHTML = toRender.map(p => `
      <div class="card">
        <img src="${p.image_url}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p style="color:var(--accent); font-size:12px; font-weight:600; text-transform:uppercase; margin-bottom:8px;">${p.category_en}</p>
      </div>
    `).join('');
    
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if(loadMoreBtn) {
      if(limit >= allProjects.length) loadMoreBtn.style.display = 'none';
      else loadMoreBtn.style.display = 'inline-flex';
    }
  };

  // ==========================================
  // 5. CHATBOT
  // ==========================================
  async function initChatbot() {
    const widget = document.getElementById('chatWidget');
    const btn = document.getElementById('floatingChatBtn');
    const body = document.getElementById('chatBody');
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');
    if(!widget || !btn) return;

    btn.addEventListener('click', () => { widget.classList.toggle('active'); });

    const { data: qas } = await supabase.from('chatbot_qa').select('*');
    body.innerHTML = `<div class="chat-msg bot"><span class="lang-en">Hi, I am Rubayed's Assistant. How can I help you?</span><span class="lang-bn">হ্যালো, আমি রুবায়েদের অ্যাসিস্ট্যান্ট। আপনাকে কিভাবে সাহায্য করতে পারি?</span></div>`;
    
    if(qas && qas.length > 0) {
      const quickReplies = document.createElement('div');
      quickReplies.style.cssText = 'display:flex; flex-direction:column; gap:8px; margin-top:12px;';
      qas.forEach(qa => {
        const qBtn = document.createElement('button');
        qBtn.innerHTML = `<span class="lang-en">${qa.question_en}</span><span class="lang-bn">${qa.question_bn || qa.question_en}</span>`;
        qBtn.style.cssText = 'background:rgba(255,255,255,0.05); border:1px solid var(--border); color:#fff; padding:10px; border-radius:8px; text-align:left; font-size:13px; cursor:pointer; transition:0.2s;';
        qBtn.onclick = () => {
          body.innerHTML += `<div class="chat-msg user"><span class="lang-en">${qa.question_en}</span><span class="lang-bn">${qa.question_bn || qa.question_en}</span></div>`;
          setTimeout(() => {
            body.innerHTML += `<div class="chat-msg bot"><span class="lang-en">${qa.answer_en}</span><span class="lang-bn">${qa.answer_bn || qa.answer_en}</span></div>`;
            body.scrollTop = body.scrollHeight;
          }, 500);
          body.scrollTop = body.scrollHeight;
        };
        quickReplies.appendChild(qBtn);
      });
      body.appendChild(quickReplies);
    }

    sendBtn.addEventListener('click', () => {
      if(!input.value.trim()) return;
      body.innerHTML += `<div class="chat-msg user">${input.value}</div>`;
      input.value = '';
      setTimeout(() => {
        body.innerHTML += `<div class="chat-msg bot">Please use the quick buttons or contact directly.</div>`;
        body.scrollTop = body.scrollHeight;
      }, 500);
    });
  }

  // ==========================================
  // 6. INIT
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    loadGlobal();
    loadPageData();
    initChatbot();

    if (document.getElementById('progressBar')) {
      window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        document.getElementById('progressBar').style.background = `conic-gradient(var(--accent) ${progress}%, #333 ${progress}%)`;
        const upBtn = document.getElementById('scrollUpBtn');
        if (scrollTop > 300) upBtn.style.display = 'flex'; else upBtn.style.display = 'none';
      });
    }
  });

  // Expose setLanguage globally so inline onclick works
  window.setLanguage = setLanguage;
})();
