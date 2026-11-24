const supabase = window.supabase.createClient('https://qynaqzukiwtnxjsciazk.supabase.co', 'sb_publishable_dTX5xkv4svMJA9-M5QMHKA_YctCIi19');

// 1. Login
document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('adminEmail').value;
  const password = document.getElementById('adminPass').value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    document.getElementById('login-error').textContent = error.message;
    document.getElementById('login-error').style.display = 'block';
  } else {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'flex';
    loadAdminData();
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabase.auth.signOut();
  location.reload();
});

// 2. Tabs
function switchTab(e, tabId) {
  e.preventDefault();
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  e.target.classList.add('active');
  document.getElementById(tabId).classList.add('active');
  if(window.innerWidth < 768) document.getElementById('sidebar').classList.remove('active');
}

// 3. Load Data
async function loadAdminData() {
  const { data: sets } = await supabase.from('site_settings').select('*');
  if(sets) sets.forEach(s => { const el = document.getElementById(s.key); if(el) el.value = s.value; });
  
  loadAdminProjects();
  loadAdminBlogs();
}

// 4. Settings
async function saveSettings() {
  const keys = ['hero_title_en', 'hero_tagline_en', 'about_en', 'blog_desc_en', 'footer_about_en', 'contact_phone', 'contact_email', 'contact_loc'];
  for(let k of keys) {
    await supabase.from('site_settings').upsert({ key: k, value: document.getElementById(k).value });
  }
  alert('Settings Saved!');
}

// 5. Image Upload Helper
async function uploadImage(file) {
  const fileName = `${Date.now()}_${file.name}`;
  await supabase.storage.from('site-assets').upload(fileName, file);
  return supabase.storage.from('site-assets').getPublicUrl(fileName).data.publicUrl;
}

// 6. Projects CRUD
async function loadAdminProjects() {
  const { data } = await supabase.from('projects').select('*');
  if(data) document.getElementById('adminProjectsList').innerHTML = data.map(p => `
    <div class="list-item"><div><b>${p.title}</b> (${p.category_en})</div>
    <button class="btn btn-danger" onclick="delProj(${p.id})">Delete</button></div>
  `).join('');
}

async function addProject() {
  const title = document.getElementById('projTitle').value;
  const cat = document.getElementById('projCat').value;
  const desc = document.getElementById('projDesc').value;
  const featured = document.getElementById('projFeatured').checked;
  const file = document.getElementById('projImg').files[0];
  
  let img = ''; if(file) img = await uploadImage(file);
  
  await supabase.from('projects').insert([{ title, category_en: cat, category_bn: cat, desc_en: desc, desc_bn: desc, image_url: img, is_featured: featured }]);
  location.reload();
}

async function delProj(id) { if(confirm('Delete?')) { await supabase.from('projects').delete().eq('id', id); location.reload(); } }

// 7. Blogs CRUD
async function loadAdminBlogs() {
  const { data } = await supabase.from('blog_posts').select('*');
  if(data) document.getElementById('adminBlogsList').innerHTML = data.map(b => `
    <div class="list-item"><div><b>${b.title_en}</b></div>
    <button class="btn btn-danger" onclick="delBlog(${b.id})">Delete</button></div>
  `).join('');
}

async function addBlog() {
  const title = document.getElementById('blogTitle').value;
  const read = document.getElementById('blogReadTime').value;
  const content = document.getElementById('blogContent').value;
  const file = document.getElementById('blogImg').files[0];
  
  let img = ''; if(file) img = await uploadImage(file);
  
  await supabase.from('blog_posts').insert([{ title_en: title, title_bn: title, read_time: read, content_en: content, content_bn: content, image_url: img }]);
  location.reload();
}

async function delBlog(id) { if(confirm('Delete?')) { await supabase.from('blog_posts').delete().eq('id', id); location.reload(); } }

// Check session
supabase.auth.getSession().then(({data}) => {
  if(data.session) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'flex';
    loadAdminData();
  }
});
