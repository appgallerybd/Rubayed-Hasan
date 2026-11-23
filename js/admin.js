(function() {
  'use strict';

  // আপনার দেওয়া Supabase তথ্য
  const SUPABASE_URL = 'https://qynaqzukiwtnxjsciazk.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_dTX5xkv4svMJA9-M5QMHKA_YctCIi19';

  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // DOM Elements
  const loginScreen = document.getElementById('loginScreen');
  const adminPanel = document.getElementById('adminPanel');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const loginError = document.getElementById('login-error');
  const statusMsg = document.getElementById('status-msg');

  // Mobile Sidebar Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  // Status Notification
  function showStatus(msg, isError = false) {
    statusMsg.textContent = msg;
    statusMsg.className = `status-msg ${isError ? 'error' : 'success'}`;
    setTimeout(() => { statusMsg.className = 'status-msg'; }, 4000);
  }

  // ============================================================
  // 1. AUTHENTICATION
  // ============================================================
  async function checkSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) showAdminPanel();
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
      e.preventDefault(); 
      const email = document.getElementById('adminEmail').value.trim();
      const password = document.getElementById('adminPass').value;

      if (!email || !password) {
        loginError.textContent = 'Please enter email and password.';
        loginError.style.display = 'block';
        return;
      }

      loginBtn.textContent = 'Logging in...';
      loginBtn.disabled = true;

      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

      if (error) {
        loginError.textContent = error.message;
        loginError.style.display = 'block';
        loginBtn.textContent = 'Log In';
        loginBtn.disabled = false;
      } else {
        showAdminPanel();
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

  // Tab Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
      item.classList.add('active');
      document.getElementById(item.dataset.target).classList.add('active');
      if(window.innerWidth <= 768) sidebar.classList.remove('active'); // Close menu on mobile
    });
  });

  // ============================================================
  // 2. DASHBOARD
  // ============================================================
  async function loadDashboardData() {
    const { count: projCount } = await supabaseClient.from('projects').select('*', { count: 'exact', head: true });
    const { count: revCount } = await supabaseClient.from('reviews').select('*', { count: 'exact', head: true });
    document.getElementById('statProjects').textContent = projCount || 0;
    document.getElementById('statReviews').textContent = revCount || 0;
    
    loadProjects();
    loadReviews();
    loadSettings();
  }

  // ============================================================
  // 3. PROJECTS CRUD
  // ============================================================
  async function loadProjects() {
    const { data: projects } = await supabaseClient.from('projects').select('*').order('created_at', { ascending: false });
    const list = document.getElementById('projectsList');
    if (!projects || projects.length === 0) {
      list.innerHTML = '<p>No projects found. Add one!</p>';
      return;
    }
    list.innerHTML = projects.map(p => `
      <div class="list-item">
        <img src="${p.image_url || 'images/profile.png'}" alt="img">
        <div class="list-info">
          <h4>${p.name}</h4>
          <p>${p.category_en}</p>
        </div>
        <div class="list-actions">
          <button class="btn btn-danger" onclick="deleteProject(${p.id})">Delete</button>
        </div>
      </div>
    `).join('');
  }

  document.getElementById('addProjectBtn').addEventListener('click', () => {
    document.getElementById('projectForm').reset();
    document.getElementById('projectFormContainer').style.display = 'block';
  });

  document.getElementById('cancelProjectBtn').addEventListener('click', () => {
    document.getElementById('projectFormContainer').style.display = 'none';
  });

  document.getElementById('projectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('projName').value;
    const catEn = document.getElementById('projCatEn').value;
    const catBn = document.getElementById('projCatBn').value;
    const file = document.getElementById('projImage').files[0];

    if (!file) return alert('Please select an image!');

    try {
      // 1. Upload Image
      const fileName = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabaseClient.storage.from('site-assets').upload(fileName, file);
      if (uploadError) throw uploadError;

      // 2. Get URL
      const { data: urlData } = supabaseClient.storage.from('site-assets').getPublicUrl(fileName);

      // 3. Save to DB
      const { error: dbError } = await supabaseClient.from('projects').insert([{ 
        name, category_en: catEn, category_bn: catBn, image_url: urlData.publicUrl 
      }]);
      if (dbError) throw dbError;

      showStatus('Project added successfully!');
      document.getElementById('projectFormContainer').style.display = 'none';
      loadDashboardData();
    } catch (err) {
      showStatus('Error: ' + err.message, true);
    }
  });

  window.deleteProject = async (id) => {
    if (!confirm('Are you sure?')) return;
    await supabaseClient.from('projects').delete().eq('id', id);
    showStatus('Project deleted.');
    loadDashboardData();
  };

  // ============================================================
  // 4. REVIEWS CRUD
  // ============================================================
  async function loadReviews() {
    const { data: reviews } = await supabaseClient.from('reviews').select('*').order('created_at', { ascending: false });
    const list = document.getElementById('reviewsList');
    if (!reviews || reviews.length === 0) {
      list.innerHTML = '<p>No reviews found. Add one!</p>';
      return;
    }
    list.innerHTML = reviews.map(r => `
      <div class="list-item">
        <div class="list-info">
          <h4>${r.client_name}</h4>
          <p>${r.client_role}</p>
          <p style="margin-top:8px; font-style:italic; color:#ccc;">"${r.review_text_en}"</p>
        </div>
        <div class="list-actions">
          <button class="btn btn-danger" onclick="deleteReview(${r.id})">Delete</button>
        </div>
      </div>
    `).join('');
  }

  document.getElementById('addReviewBtn').addEventListener('click', () => {
    document.getElementById('reviewForm').reset();
    document.getElementById('reviewFormContainer').style.display = 'block';
  });

  document.getElementById('cancelReviewBtn').addEventListener('click', () => {
    document.getElementById('reviewFormContainer').style.display = 'none';
  });

  document.getElementById('reviewForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('revName').value;
    const role = document.getElementById('revRole').value;
    const textEn = document.getElementById('revTextEn').value;
    const textBn = document.getElementById('revTextBn').value;

    const { error } = await supabaseClient.from('reviews').insert([{ 
      client_name: name, client_role: role, review_text_en: textEn, review_text_bn: textBn 
    }]);

    if (error) return showStatus('Error: ' + error.message, true);

    showStatus('Review added successfully!');
    document.getElementById('reviewFormContainer').style.display = 'none';
    loadDashboardData();
  });

  window.deleteReview = async (id) => {
    if (!confirm('Are you sure?')) return;
    await supabaseClient.from('reviews').delete().eq('id', id);
    showStatus('Review deleted.');
    loadDashboardData();
  };

  // ============================================================
  // 5. SETTINGS CRUD
  // ============================================================
  async function loadSettings() {
    const { data, error } = await supabaseClient.from('site_settings').select('*');
    if (error || !data) return;

    const dict = {};
    data.forEach(item => dict[item.key] = item.value);

    document.getElementById('set_hero_title_en').value = dict.hero_title_en || '';
    document.getElementById('set_hero_title_bn').value = dict.hero_title_bn || '';
    document.getElementById('set_hero_tagline_en').value = dict.hero_tagline_en || '';
    document.getElementById('set_hero_tagline_bn').value = dict.hero_tagline_bn || '';
    document.getElementById('set_about_text_en').value = dict.about_text_en || '';
    document.getElementById('set_about_text_bn').value = dict.about_text_bn || '';
    document.getElementById('set_stat_experience').value = dict.stat_experience || '3';
    document.getElementById('set_stat_projects').value = dict.stat_projects || '15';
    document.getElementById('set_stat_clients').value = dict.stat_clients || '99';
  }

  document.getElementById('settingsForm').addEventListener('submit', async (e) => {
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
      showStatus('Settings saved successfully!');
    } catch (err) {
      showStatus('Error saving settings: ' + err.message, true);
    }
  });

  checkSession();
})();
