/* ============================================================
   ADMIN PANEL LOGIC - SUPABASE INTEGRATION
   ============================================================ */

// ⚠️ এখানে আপনার Supabase URL এবং Anon Key বসান ⚠️
const SUPABASE_URL = 'https://qynaqzukiwtnxjsciazk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dTX5xkv4svMJA9-M5QMHKA_YctCIi19';

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const adminPanel = document.getElementById('adminPanel');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginError = document.getElementById('login-error');

// ============================================================
// 1. AUTHENTICATION FLOW
// ============================================================

// Check if user is already logged in
async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    showAdminPanel();
  } else {
    loginScreen.style.display = 'block';
    adminPanel.style.display = 'none';
  }
}

// Login Handler
loginBtn.addEventListener('click', async () => {
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPass').value;

  if (!email || !password) {
    loginError.textContent = 'Please enter both email and password.';
    loginError.style.display = 'block';
    return;
  }

  loginBtn.textContent = 'Logging in...';
  loginBtn.disabled = true;
  loginError.style.display = 'none';

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    loginError.textContent = error.message;
    loginError.style.display = 'block';
    loginBtn.textContent = 'Log In';
    loginBtn.disabled = false;
  } else {
    showAdminPanel();
  }
});

// Logout Handler
logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.reload();
});

function showAdminPanel() {
  loginScreen.style.display = 'none';
  adminPanel.style.display = 'flex';
  loadDashboardData();
}

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
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
    document.getElementById(item.dataset.target).classList.add('active');
  });
});

async function loadDashboardData() {
  const { count: projectCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
  const { count: reviewCount } = await supabase.from('reviews').select('*', { count: 'exact', head: true });
  
  document.getElementById('statProjects').textContent = projectCount || 0;
  document.getElementById('statReviews').textContent = reviewCount || 0;
  
  loadProjects();
  loadReviews();
  loadSettings();
}

// ============================================================
// 3. PROJECTS CRUD
// ============================================================
async function loadProjects() {
  const { data: projects } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
  const table = document.getElementById('projectsTable');
  
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
}

document.getElementById('addProjectBtn').addEventListener('click', () => {
  document.getElementById('projectFormContainer').style.display = 'block';
});

document.getElementById('projectForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('projName').value;
  const catEn = document.getElementById('projCatEn').value;
  const catBn = document.getElementById('projCatBn').value;
  const file = document.getElementById('projImage').files[0];

  if (!file) return alert('Please select an image!');

  // Upload Image to Supabase Storage
  const fileName = `${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage.from('site-assets').upload(fileName, file);
  if (uploadError) return alert('Upload failed: ' + uploadError.message);

  const { data: urlData } = supabase.storage.from('site-assets').getPublicUrl(fileName);

  // Insert into Database
  const { error } = await supabase.from('projects').insert([{ 
    name, category_en: catEn, category_bn: catBn, image_url: urlData.publicUrl 
  }]);

  if (error) return alert('Error: ' + error.message);

  document.getElementById('projectFormContainer').style.display = 'none';
  document.getElementById('projectForm').reset();
  loadProjects();
  loadDashboardData();
});

window.deleteProject = async (id) => {
  if (!confirm('Delete this project?')) return;
  await supabase.from('projects').delete().eq('id', id);
  loadProjects();
  loadDashboardData();
};

// ============================================================
// 4. REVIEWS CRUD
// ============================================================
async function loadReviews() {
  const { data: reviews } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
  const table = document.getElementById('reviewsTable');
  
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
}

document.getElementById('addReviewBtn').addEventListener('click', () => {
  document.getElementById('reviewFormContainer').style.display = 'block';
});

document.getElementById('reviewForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('revName').value;
  const role = document.getElementById('revRole').value;
  const textEn = document.getElementById('revTextEn').value;
  const textBn = document.getElementById('revTextBn').value;

  const { error } = await supabase.from('reviews').insert([{ 
    client_name: name, client_role: role, review_text_en: textEn, review_text_bn: textBn 
  }]);

  if (error) return alert('Error: ' + error.message);

  document.getElementById('reviewFormContainer').style.display = 'none';
  document.getElementById('reviewForm').reset();
  loadReviews();
  loadDashboardData();
});

window.deleteReview = async (id) => {
  if (!confirm('Delete this review?')) return;
  await supabase.from('reviews').delete().eq('id', id);
  loadReviews();
  loadDashboardData();
};

// ============================================================
// 5. SETTINGS CRUD
// ============================================================
async function loadSettings() {
  const { data } = await supabase.from('site_settings').select('*');
  if (!data) return;

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

  for (const item of updates) {
    await supabase.from('site_settings').update({ value: item.value }).eq('key', item.key);
  }

  alert('Settings saved successfully!');
});

// Initialize
checkSession();
