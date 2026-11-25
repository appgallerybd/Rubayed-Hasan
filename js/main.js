(function () {
  const SUPABASE_URL = 'https://qynaqzukiwtnxjsciazk.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_dTX5xkv4svMJA9-M5QMHKA_YctCIi19';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const path = window.location.pathname;

  // ==========================================
  // 1. INJECT HEADER & FOOTER DYNAMICALLY
  // ==========================================
  const headerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <a href="index.html" class="logo"><img src="images/profile.png" class="logo-img">Rubayed Hasan</a>
        <nav class="nav-desktop">
          <a href="index.html" class="${path.includes('index') ? 'active' : ''}">Home</a>
          <a href="about.html" class="${path.includes('about') ? 'active' : ''}">About</a>
          <a href="portfolio.html" class="${path.includes('portfolio') ? 'active' : ''}">Portfolio</a>
          <a href="services.html" class="${path.includes('services') ? 'active' : ''}">Services</a>
          <a href="blogs.html" class="${path.includes('blogs') || path.includes('blog-detail') ? 'active' : ''}">Blogs</a>
          <a href="contact.html" class="${path.includes('contact') ? 'active' : ''}">Contact</a>
        </nav>
        <div class="header-actions">
          <button class="lang-btn" onclick="document.documentElement.lang = document.documentElement.lang === 'en' ? 'bn' : 'en';">বাংলা / EN</button>
          <button class="mobile-menu-btn" id="mobileMenuBtn">☰</button>
        </div>
      </div>
      <div class="mobile-nav" id="mobileNav">
        <a href="index.html">Home</a>
        <a href="about.html">About</a>
        <a href="portfolio.html">Portfolio</a>
        <a href="services.html">Services</a>
        <a href="blogs.html">Blogs</a>
        <a href="contact.html">Contact</a>
      </div>
    </header>
  `;

  const footerHTML = `
    <footer>
      <div class="container footer-content">
        <a href="index.html" class="logo"><img src="images/profile.png" class="logo-img">Rubayed Hasan</a>
        <p id="footerAbout" style="color:var(--muted); max-width:400px;">Graphic Designer from Khulna, Bangladesh.</p>
        <div class="footer-links">
          <a href="about.html">About</a><a href="portfolio.html">Portfolio</a><a href="services.html">Services</a><a href="blogs.html">Blogs</a><a href="contact.html">Contact</a>
        </div>
        <div class="socials-wrapper" id="footerSocials"></div>
      </div>
      <div class="container copyright">
        <p>© 2026 <a href="index.html" style="color:var(--accent);">Rubayed Hasan</a>. All Rights Reserved.</p>
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
  }

  // ==========================================
  // 2. TEXT FORMATTER (B, I, U, H)
  // ==========================================
  window.formatText = function(text, color) {
    if (!text) return '';
    return text
      .replace(/B([^B]+)B/g, '<strong style="color:#fff;">$1</strong>')
      .replace(/I([^I]+)I/g, '<em style="font-style:italic;">$1</em>')
      .replace(/U([^U]+)U/g, '<u style="text-decoration:underline;">$1</u>')
      .replace(/H([^H]+)H/g, `<mark style="background-color:${color || '#d4af37'}; color:#000; padding:2px 6px; border-radius:4px;">$1</mark>`);
  };

  // ==========================================
  // 3. LOAD GLOBAL DATA (Header/Footer/Contact)
  // ==========================================
  async function loadGlobal() {
    const { data: sets } = await supabase.from('site_settings').select('*');
    if(sets) {
      const dict = {}; sets.forEach(s => dict[s.key] = s.value);
      if(document.getElementById('footerAbout')) document.getElementById('footerAbout').textContent = dict.footer_about_en;
      
      if(document.getElementById('heroTitle')) {
        document.getElementById('heroTitle').innerHTML = dict.hero_title_en;
        document.getElementById('heroTagline').textContent = dict.hero_tagline_en;
        document.getElementById('aboutTeaser').textContent = dict.about_en;
        document.getElementById('blogSubtitle').textContent = dict.blog_desc_en;
      }
      if(document.getElementById('cPhone')) document.getElementById('cPhone').textContent = dict.contact_phone;
      if(document.getElementById('cEmail')) document.getElementById('cEmail').textContent = dict.contact_email;
      if(document.getElementById('cLoc')) document.getElementById('cLoc').textContent = dict.contact_loc;
      if(document.getElementById('cWeb')) document.getElementById('cWeb').textContent = dict.contact_web;
      
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
    // --- HOME PAGE ---
    if(path.includes('index') || path === '/') {
      const { data: stats } = await supabase.from('stats').select('*');
      if(stats && document.getElementById('statsGrid')) {
        const icons = [
          '<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>',
          '<svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>',
          '<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>'
        ];
        document.getElementById('statsGrid').innerHTML = stats.map((s, i) => `
          <div class="stat-item">
            <div class="stat-icon">${icons[i % 3]}</div>
            <div class="stat-number">${s.value}${s.suffix}</div>
            <div class="stat-label">${s.label_en}</div>
          </div>
        `).join('');
      }

      const { data: projs } = await supabase.from('projects').select('*').eq('is_featured', true);
      allProjects = projs || [];
      renderFeaturedProjects(6);

      const { data: blogs } = await supabase.from('blog_posts').select('*').order('created_at', {ascending:false}).limit(3);
      if(blogs && document.getElementById('latestBlogs')) {
        document.getElementById('latestBlogs').innerHTML = blogs.map((b, i) => `
          <a href="blog-detail.html?id=${b.id}" class="card" style="${i===0 ? 'grid-column: 1 / -1; flex-direction:row; gap:20px; align-items:center;' : ''}">
            <img src="${b.image_url}" style="${i===0 ? 'width:50%; height:300px; margin-bottom:0;' : ''}">
            <div>
               <h3>${b.title_en}</h3>
               <p style="margin-top:10px; font-size:12px; color:var(--accent);">${b.read_time}</p>
            </div>
          </a>
        `).join('');
      }
    }

    // --- PORTFOLIO PAGE ---
    if(path.includes('portfolio.html') && document.getElementById('portfolioGrid')) {
      const { data: projs } = await supabase.from('projects').select('*');
      document.getElementById('portfolioGrid').innerHTML = projs.map(p => `
        <div class="portfolio-card" onclick="this.classList.toggle('active')">
          <img src="${p.image_url}" alt="${p.title}">
          <div class="portfolio-info">
            <h3>${p.title}</h3>
            <p style="color:var(--accent); font-size:12px;">${p.category_en}</p>
            <div class="portfolio-desc">${p.desc_en}</div>
          </div>
        </div>
      `).join('');
    }

    // --- SERVICES PAGE ---
    if(path.includes('services.html') && document.getElementById('servicesList')) {
      const { data: servs } = await supabase.from('services').select('*');
      document.getElementById('servicesList').innerHTML = servs.map(s => `
        <div class="card text-center">
           <div style="width:60px; height:60px; margin:0 auto 15px; background:rgba(212,175,55,0.1); border-radius:50%; display:flex; justify-content:center; align-items:center; color:var(--accent);">${s.icon_svg || '★'}</div>
           <h3>${s.title_en}</h3><p>${s.desc_en}</p>
        </div>
      `).join('');

      const { data: faqs } = await supabase.from('faqs').select('*');
      document.getElementById('faqList').innerHTML = faqs.map(f => `
        <div class="faq-item">
          <div class="faq-question" onclick="this.parentElement.classList.toggle('active')">${f.question_en} <span>+</span></div>
          <div class="faq-answer">${f.answer_en}</div>
        </div>
      `).join('');
    }

    // --- BLOGS PAGE ---
    if(path.includes('blogs.html') && document.getElementById('allBlogsList')) {
      const { data: blogs } = await supabase.from('blog_posts').select('*').order('created_at', {ascending:false});
      document.getElementById('allBlogsList').innerHTML = blogs.map(b => `
        <a href="blog-detail.html?id=${b.id}" class="card">
          <img src="${b.image_url}">
          <h3>${b.title_en}</h3>
          <p style="margin-top:10px; font-size:12px; color:var(--accent);">${b.read_time}</p>
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
        <h3>${p.title}</h3><p>${p.category_en}</p>
      </div>
    `).join('');
    
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if(loadMoreBtn) {
      if(limit >= allProjects.length) loadMoreBtn.style.display = 'none';
      else loadMoreBtn.style.display = 'inline-flex';
    }
  };

  // ==========================================
  // 5. CHATBOT LOGIC
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
    
    // Initial message
    body.innerHTML = `<div class="chat-msg bot">Hi, I am Rubayed's Virtual Assistant. How can I help you?</div>`;
    
    if(qas && qas.length > 0) {
      const quickReplies = document.createElement('div');
      quickReplies.style.cssText = 'display:flex; flex-direction:column; gap:5px; margin-top:10px;';
      qas.forEach(qa => {
        const qBtn = document.createElement('button');
        qBtn.textContent = qa.question_en;
        qBtn.style.cssText = 'background:var(--surface-2); border:1px solid var(--border); color:#fff; padding:8px; border-radius:5px; text-align:left; font-size:12px; cursor:pointer;';
        qBtn.onclick = () => {
          body.innerHTML += `<div class="chat-msg user">${qa.question_en}</div>`;
          setTimeout(() => {
            body.innerHTML += `<div class="chat-msg bot">${qa.answer_en}</div>`;
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
        body.innerHTML += `<div class="chat-msg bot">I am a simple assistant. Please use the quick reply buttons above or contact directly.</div>`;
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

    // Blog Scroll Progress
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
})();
