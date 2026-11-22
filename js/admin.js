/* ============================================================
   ADMIN PANEL LOGIC - SUPABASE INTEGRATION
   ============================================================ */

(function() {
  'use strict';

  // ⚠️⚠️ এখানে আপনার Supabase URL এবং Anon Key বসান ⚠️⚠️
  const SUPABASE_URL = 'https://qynaqzukiwtnxjsciazk.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_dTX5xkv4svMJA9-M5QMHKA_YctCIi19';

  // Check if Supabase CDN loaded
  if (typeof window.supabase === 'undefined') {
    alert('Supabase CDN failed to load. Please check your internet connection and refresh the page.');
    console.error('window.supabase is undefined');
    return;
  }

  // Initialize Supabase Client (using a different variable name to avoid conflict)
  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // DOM Elements
  const loginScreen = document.getElementById('loginScreen');
  const adminPanel = document.getElementById('adminPanel');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const loginError = document.getElementById('login-error');

  // ============================================================
  // 1. AUTHENTICATION FLOW
  // ============================================================

  async function checkSession() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error) {
      console.error('Session Check Error:', error);
      return;
    }
    if (session) {
      showAdminPanel();
    } else {
      loginScreen.style.display = 'block';
      adminPanel.style.display = 'none';
    }
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
      e.preventDefault(); 
      
      const emailInput = document.getElementById('adminEmail');
      const passwordInput = document.getElementById('adminPass');

      if (!emailInput || !passwordInput) {
        alert('Email or Password input field missing in HTML!');
        return;
      }

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        loginError.textContent = 'Please enter both email and password.';
        loginError.style.display = 'block';
        return;
      }

      if (SUPABASE_URL.includes('এখানে_বসান') || SUPABASE_ANON_KEY.includes('এখানে_বসান')) {
        loginError.textContent = '⚠️ Error: Please add your Supabase URL and Key inside js/admin.js.';
        loginError.style.display = 'block';
        return;
      }

      loginBtn.textContent = 'Logging in...';
      loginBtn.disabled = true;
      loginError.style.display = 'none';

      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

        if (error) {
          loginError.textContent = error.message;
          loginError.style.display = 'block';
        } else if (data.user) {
          loginScreen.style.display = 'none';
          adminPanel.style.display = 'flex';
          loadDashboardData();
        }
      } catch (err) {
        loginError.textContent = 'Network Error: ' + err.message;
        loginError.style.display = 'block';
      } finally {
        loginBtn.textContent = 'Log In';
        loginBtn.disabled = false;
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabaseClient.auth.signOut();
      window.location.reload();
    });
  }

  function showAdminPanel() {
    loginScreen.style.display = 'none';
    adminPanel.style.display = 'flex';
    loadDashboardData();
  }

  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') showAdminPanel();
    if (event === 'SIGNED_OUT') window.location.reload();
  });

  // ============================================================
  // 2. TAB NAVIGATION & DASHBOARD
  // ============================================================
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
      item.classList.add('active');
      const targetId = item.dataset.target;
      const targetTab = document.getElementById(targetId);
      if (targetTab) targetTab.classList.add('active');
    });
  });

  async function loadDashboardData() {
    try {
      const { count: projectCount } = await supabaseClient.from('projects').select('*', { count: 'exact', head: true });
      const { count: reviewCount } = await supabaseClient.from('reviews').select('*', { count: 'exact', head: true });
      
      const statProj = document.getElementById('statProjects');
      const statRev = document.getElementById('statReviews');
      if (statProj) statProj.textContent = projectCount || 0;
      if (statRev) statRev.textContent = reviewCount || 0;
      
      loadProjects();
      loadReviews();
      loadSettings();
    } catch (err) {
      console.error('Dashboard Load Error:', err);
    }
  }

  // ============================================================
  // 3. PROJECTS CRUD
  // ============================================================
  async function loadProjects() {
    try {
      const { data: projects, error } = await supabaseClient.from('projects').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      const table = document.getElementById('projectsTable');
      if (!table) return;
      
      if (!projects || projects.length === 0) {
        table.innerHTML = '<p>No projects found.</p>';
        return;
      }

      table.innerHTML = projects.map(p => `
        <div style="background:#17110d; padding:15px; margin-bottom:10px; border-radius:10px; display:flex; align-items:center; justify-content:space-between; border:1px solid rgba(212,175,55,0.2);">
          <div style="display:flex; align-items:center; gap:15px;">
            <img src="${p.image_url || 'images/profile.png'}" style="width:50px; height:50px; object-fit:cover; border-radius:8px;">
            <div>
              <h4 style="margin-bottom:4px;">${p.name}</h4>
              <p style="font-size:12px; color:#8f857d;">${p.category_en}</p>
            </div>
          </div>
          <button onclick="deleteProject(${p.id})" style="background:rgba(239,68,68,0.1); color:#ef4444; border:1px solid rgba(239,68,68,0.2); padding:6px 12px; border-radius:6px; cursor:pointer;">Delete</button>
        </div>
      `).join('');
    } catch (err) {
      console.error('Load Projects Error:', err);
    }
  }

  const addProjectBtn = document.getElementById('addProjectBtn');
  if (addProjectBtn) {
    addProjectBtn.addEventListener('click', () => {
      document.getElementById('projectFormContainer').style.display = 'block';
    });
  }

  const projectForm = document.getElementById('projectForm');
  if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('projName').value;
      const catEn = document.getElementById('projCatEn').value;
      const catBn = document.getElementById('projCatBn').value;
      const file = document.getElementById('projImage').files[0];

      if (!file) return alert('Please select an image!');

      try {
        const fileName = `${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabaseClient.storage.from('site-assets').upload(fileName, file);
        if (uploadError) throw new Error('Upload failed: ' + uploadError.message);

        const { data: urlData } = supabaseClient.storage.from('site-assets').getPublicUrl(fileName);

        const { error } = await supabaseClient.from('projects').insert([{ 
          name, category_en: catEn, category_bn: catBn, image_url: urlData.publicUrl 
        }]);

        if (error) throw error;

        document.getElementById('projectFormContainer').style.display = 'none';
        document.getElementById('projectForm').reset();
        loadProjects();
        loadDashboardData();
      } catch (err) {
        console.error('Add Project Error:', err);
        alert('Error: ' + err.message);
      }
    });
  }

  window.deleteProject = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await supabaseClient.from('projects').delete().eq('id', id);
      loadProjects();
      loadDashboardData();
    } catch (err) {
      console.error('Delete Project Error:', err);
    }
  };

  // ============================================================
  // 4. REVIEWS CRUD
  // ============================================================
  async function loadReviews() {
    try {
      const { data: reviews, error } = await supabaseClient.from('reviews').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      const table = document.getElementById('reviewsTable');
      if (!table) return;
      
      if (!reviews || reviews.length === 0) {
        table.innerHTML = '<p>No reviews found.</p>';
        return;
      }

      table.innerHTML = reviews.map(r => `
        <div style="background:#17110d; padding:15px; margin-bottom:10px; border-radius:10px; display:flex; align-items:center; justify-content:space-between; border:1px solid rgba(212,175,55,0.2);">
          <div>
            <h4 style="margin-bottom:4px;">${r.client_name}</h4>
            <p style="font-size:12px; color:#8f857d;">${r.client_role}</p>
            <p style="font-size:13px; margin-top:8px; color:#c4c4cf;">"${r.review_text_en}"</p>
          </div>
          <button onclick="deleteReview(${r.id})" style="background:rgba(239,68,68,0.1); color:#ef4444; border:1px solid rgba(239,68,68,0.2); padding:6px 12px; border-radius:6px; cursor:pointer;">Delete</button>
        </div>
      `).join('');
    } catch (err) {
      console.error('Load Reviews Error:', err);
    }
  }

  const addReviewBtn = document.getElementById('addReviewBtn');
  if (addReviewBtn) {
    addReviewBtn.addEventListener('click', () => {
      document.getElementById('reviewFormContainer').style.display = 'block';
    });
  }

  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('revName').value;
      const role = document.getElementById('revRole').value;
      const textEn = document.getElementById('revTextEn').value;
      const textBn = document.getElementById('revTextBn').value;

      try {
        const { error } = await supabaseClient.from('reviews').insert([{ 
          client_name: name, client_role: role, review_text_en: textEn, review_text_bn: textBn 
        }]);

        if (error) throw error;

        document.getElementById('reviewFormContainer').style.display = 'none';
        document.getElementById('reviewForm').reset();
        loadReviews();
        loadDashboardData();
      } catch (err) {
        console.error('Add Review Error:', err);
        alert('Error: ' + err.message);
      }
    });
  }

  window.deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await supabaseClient.from('reviews').delete().eq('id', id);
      loadReviews();
      loadDashboardData();
    } catch (err) {
      console.error('Delete Review Error:', err);
    }
  };

  // ============================================================
  // 5. SETTINGS CRUD
  // ============================================================
  async function loadSettings() {
    try {
      const { data, error } = await supabaseClient.from('site_settings').select('*');
      if (error) throw error;
      if (!data) return;

      const dict = {};
      data.forEach(item => dict[item.key] = item.value);

      const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };

      setVal('set_hero_title_en', dict.hero_title_en || '');
      setVal('set_hero_title_bn', dict.hero_title_bn || '');
      setVal('set_hero_tagline_en', dict.hero_tagline_en || '');
      setVal('set_hero_tagline_bn', dict.hero_tagline_bn || '');
      setVal('set_about_text_en', dict.about_text_en || '');
      setVal('set_about_text_bn', dict.about_text_bn || '');
      setVal('set_stat_experience', dict.stat_experience || '3');
      setVal('set_stat_projects', dict.stat_projects || '15');
      setVal('set_stat_clients', dict.stat_clients || '99');
    } catch (err) {
      console.error('Load Settings Error:', err);
    }
  }

  const settingsForm = document.getElementById('settingsForm');
  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const updates = [
        { key: 'hero_title_en', value: document.getElementById('set_hero_title_en').value },
        { key: 'hero_title_bn', value: document.getElementById('set_hero_title_bn').value },
        { key: 'hero_tagline_en', value: document.getElementById('set_hero_tagline_en').value },
        { key: 'hero_tagline_bn', value: document.getElementById('set_hero_tagline_bn').value },
        { key: 'about_text_en', value: document.getElementById('set_about_text_en').value },
        { key: 'about_text_bn', value: document.getElementById('set_about_text_bn').value },
        { key: 'stat_experience', value: document.getElementById('set_stat_experience').value },
        { key: 'stat_projects', value: document.getElementById('set_stat_projects').value },
        { key: 'stat_clients', value: document.getElementById('set_stat_clients').value },
      ];

      try {
        for (const item of updates) {
          await supabaseClient.from('site_settings').update({ value: item.value }).eq('key', item.key);
        }
        alert('Settings saved successfully!');
      } catch (err) {
        console.error('Save Settings Error:', err);
        alert('Failed to save settings: ' + err.message);
      }
    });
  }

  // Initialize on page load
  checkSession();

})();
