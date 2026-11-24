(function () {
  'use strict';
  const SUPABASE_URL = 'https://qynaqzukiwtnxjsciazk.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_dTX5xkv4svMJA9-M5QMHKA_YctCIi19';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 1. Custom Formatter
  function formatText(text, color) {
    if (!text) return '';
    return text
      .replace(/B([^B]+)B/g, '<strong style="color:#fff;">$1</strong>')
      .replace(/I([^I]+)I/g, '<em style="font-style:italic;">$1</em>')
      .replace(/U([^U]+)U/g, '<u style="text-decoration:underline;">$1</u>')
      .replace(/H([^H]+)H/g, `<mark style="background-color:${color || '#d4af37'}; color:#000; padding: 2px 4px; border-radius: 3px;">$1</mark>`);
  }

  // 2. Language & UI (Chatbot, Menu) - kept same as previous
  document.querySelectorAll('[data-set-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.documentElement.lang = btn.dataset.setLang;
      localStorage.setItem('rh-lang', btn.dataset.setLang);
    });
  });
  document.documentElement.lang = localStorage.getItem('rh-lang') || 'en';

  // 3. Load Data from Supabase
  async function loadSiteData() {
    // Settings
    const { data: sets } = await supabase.from('site_settings').select('*');
    if (sets) {
      const dict = {}; sets.forEach(s => dict[s.key] = s.value);
      
      // Apply Text
      if (dict.hero_title_en) document.querySelector('.hero-title [lang="en"]').textContent = dict.hero_title_en;
      if (dict.hero_title_bn) document.querySelector('.hero-title [lang="bn"]').textContent = dict.hero_title_bn;
      
      // Apply Highlight Color globally
      document.documentElement.style.setProperty('--highlight-color', dict.highlight_color || '#d4af37');
    }

    // Socials
    const { data: socs } = await supabase.from('social_links').select('*').eq('is_active', true);
    if (socs && document.getElementById('heroSocials')) {
      document.getElementById('heroSocials').innerHTML = socs.filter(s => s.section === 'hero' || s.section === 'both').map(s => `
        <a href="${s.url}" target="_blank" class="social-icon" style="width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--surface); border: 1px solid var(--border); color: var(--accent);">
          ${s.icon_svg}
        </a>
      `).join('');
    }

    // Projects (Featured)
    const { data: projects } = await supabase.from('projects').select('*').eq('is_featured', true);
    // Render Projects to DOM

    // Blogs
    const { data: blogs } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    // Render Blogs to DOM
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadSiteData();
    
    // Scroll Reveal, Menu, Chatbot logics (Same as your previous working code)
    // ... (Add your menu/chatbot initializations here)
  });
})();
