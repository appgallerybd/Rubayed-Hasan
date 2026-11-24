(function () {
  const SUPABASE_URL = 'https://qynaqzukiwtnxjsciazk.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_dTX5xkv4svMJA9-M5QMHKA_YctCIi19';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 1. Custom Text Formatter (B, I, U, H)
  window.formatText = function(text, color) {
    if (!text) return '';
    return text
      .replace(/B([^B]+)B/g, '<strong style="color:#fff;">$1</strong>')
      .replace(/I([^I]+)I/g, '<em style="font-style:italic;">$1</em>')
      .replace(/U([^U]+)U/g, '<u style="text-decoration:underline;">$1</u>')
      .replace(/H([^H]+)H/g, `<mark style="background-color:${color || '#d4af37'}; color:#000; padding:2px 6px; border-radius:4px;">$1</mark>`);
  };

  // 2. FAQ Accordion
  document.addEventListener('click', (e) => {
    if (e.target.closest('.faq-question')) {
      const item = e.target.closest('.faq-item');
      item.classList.toggle('active');
    }
  });

  // 3. Mobile Menu
  const menuBtn = document.getElementById('mobileMenuBtn');
  if (menuBtn) menuBtn.addEventListener('click', () => document.getElementById('mobileNav').classList.toggle('active'));

  // 4. Load Global Data (Settings, Socials, Footer)
  async function loadGlobalData() {
    const { data: settings } = await supabase.from('site_settings').select('*');
    if(settings) {
      const dict = {}; settings.forEach(s => dict[s.key] = s.value);
      document.querySelectorAll('.dynamic-text').forEach(el => {
        const key = el.getAttribute('data-key');
        const lang = el.getAttribute('data-lang') || 'en';
        if(dict[`${key}_${lang}`]) el.innerHTML = dict[`${key}_${lang}`];
      });

      // Set Footer & Contact details
      if(document.getElementById('footerAbout')) document.getElementById('footerAbout').textContent = dict.footer_about_en;
      if(document.getElementById('contactPhone')) document.getElementById('contactPhone').textContent = dict.contact_phone;
      if(document.getElementById('contactEmail')) document.getElementById('contactEmail').textContent = dict.contact_email;
      if(document.getElementById('contactLoc')) document.getElementById('contactLoc').textContent = dict.contact_loc;
    }

    // Load Socials
    const { data: socs } = await supabase.from('social_links').select('*').eq('is_active', true);
    if(socs) {
      const renderSoc = (section) => socs.filter(s => s.section === section || s.section === 'both').map(s => 
        `<a href="${s.url}" target="_blank" class="social-icon" title="${s.platform}">${s.icon_svg}</a>`
      ).join('');
      if(document.getElementById('heroSocials')) document.getElementById('heroSocials').innerHTML = renderSoc('hero');
      if(document.getElementById('footerSocials')) document.getElementById('footerSocials').innerHTML = renderSoc('footer');
    }
  }

  // 5. Load Page-Specific Data
  async function loadPageData() {
    const path = window.location.pathname;

    // Homepage Data
    if(path.includes('index.html') || path === '/') {
      // Stats
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

      // Featured Projects
      const { data: projs } = await supabase.from('projects').select('*').eq('is_featured', true).limit(6);
      if(projs && document.getElementById('featuredProjects')) {
        document.getElementById('featuredProjects').innerHTML = projs.map(p => `
          <div class="card">
            <img src="${p.image_url || 'images/placeholder.png'}" alt="${p.title}">
            <h3>${p.title}</h3>
            <p>${p.category_en}</p>
          </div>
        `).join('');
      }

      // Featured Blogs
      const { data: blogs } = await supabase.from('blog_posts').select('*').order('created_at', {ascending:false}).limit(3);
      if(blogs && document.getElementById('latestBlogs')) {
        document.getElementById('latestBlogs').innerHTML = blogs.map((b, i) => `
          <a href="blog-detail.html?id=${b.id}" class="card" style="${i===0 ? 'grid-column: 1 / -1; display:flex; gap:20px; align-items:center;' : ''}">
            <img src="${b.image_url}" style="${i===0 ? 'width:50%; height:300px; margin-bottom:0;' : ''}">
            <div>
               <h3>${b.title_en}</h3>
               <p style="margin-top:10px; font-size:12px; color:var(--accent);">${b.read_time}</p>
            </div>
          </a>
        `).join('');
      }
    }

    // Portfolio Page
    if(path.includes('portfolio.html') && document.getElementById('portfolioGrid')) {
      const { data: projs } = await supabase.from('projects').select('*');
      document.getElementById('portfolioGrid').innerHTML = projs.map(p => `
        <div class="card">
          <img src="${p.image_url}" alt="${p.title}">
          <h3>${p.title}</h3>
          <p style="color:var(--accent); font-size:12px; margin-bottom:10px;">${p.category_en}</p>
          <p>${p.desc_en}</p>
        </div>
      `).join('');
    }

    // Services Page
    if(path.includes('services.html') && document.getElementById('servicesList')) {
      const { data: servs } = await supabase.from('services').select('*');
      document.getElementById('servicesList').innerHTML = servs.map(s => `
        <div class="card text-center">
           <div style="width:60px; height:60px; margin:0 auto 15px; background:rgba(212,175,55,0.1); border-radius:50%; display:flex; justify-content:center; align-items:center; color:var(--accent);">${s.icon_svg || '★'}</div>
           <h3>${s.title_en}</h3>
           <p>${s.desc_en}</p>
        </div>
      `).join('');

      const { data: faqs } = await supabase.from('faqs').select('*');
      document.getElementById('faqList').innerHTML = faqs.map(f => `
        <div class="faq-item">
          <div class="faq-question">${f.question_en} <span>+</span></div>
          <div class="faq-answer">${f.answer_en}</div>
        </div>
      `).join('');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadGlobalData();
    loadPageData();
  });
})();
