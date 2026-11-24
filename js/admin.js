const supabase = window.supabase.createClient('https://qynaqzukiwtnxjsciazk.supabase.co', 'sb_publishable_dTX5xkv4svMJA9-M5QMHKA_YctCIi19');

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
  await supabase.auth.signOut(); location.reload();
});

function switchTab(e, tabId) {
  e.preventDefault();
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  e.target.classList.add('active');
  document.getElementById(tabId).classList.add('active');
  if(window.innerWidth < 768) document.getElementById('sidebar').classList.remove('active');
}

async function loadAdminData() {
  const { data: sets } = await supabase.from('site_settings').select('*');
  if(sets) sets.forEach(s => { const el = document.getElementById(s.key); if(el) el.value = s.value; });
  loadAdminProjects(); loadAdminBlogs();
}

async function saveSettings() {
  const keys = ['hero_title_en', 'hero_tagline_en', 'about_en', 'blog_desc_en', 'footer_about_en', 'contact_phone', 'contact_email', 'contact_loc'];
  for(let k of keys) await supabase.from('site_settings').upsert({ key: k, value: document.getElementById(k).value });
  alert('Settings Saved!');
}

async function uploadImage(file) {
  const fileName = `${Date.now()}_${file.name}`;
  await supabase.storage.from('site-assets').upload(fileName, file);
  return supabase.storage.from('site-assets').getPublicUrl(fileName).data.publicUrl;
}

async function loadAdminProjects() {
  const { data } = await supabase.from('projects').select('*');
  if(data) document.getElementById('adminProjectsList').innerHTML = data.map(p => `
    <div class="list-item"><div><b>${p.title}</b></div><button class="btn btn-danger" onclick="del('projects', ${p.id})">Delete</button></div>
  `).join('');
}
async function addProject() {
  let img = ''; const file = document.getElementById('projImg').files[0];
  if(file) img = await uploadImage(file);
  await supabase.from('projects').insert([{ title: document.getElementById('projTitle').value, category_en: document.getElementById('projCat').value, category_bn: document.getElementById('projCat').value, desc_en: document.getElementById('projDesc').value, desc_bn: document.getElementById('projDesc').value, image_url: img, is_featured: document.getElementById('projFeatured').checked }]);
  location.reload();
}

async function loadAdminBlogs() {
  const { data } = await supabase.from('blog_posts').select('*');
  if(data) document.getElementById('adminBlogsList').innerHTML = data.map(b => `
    <div class="list-item"><div><b>${b.title_en}</b></div><button class="btn btn-danger" onclick="del('blog_posts', ${b.id})">Delete</button></div>
  `).join('');
}
async function addBlog() {
  let img = ''; const file = document.getElementById('blogImg').files[0];
  if(file) img = await uploadImage(file);
  await supabase.from('blog_posts').insert([{ title_en: document.getElementById('blogTitle').value, title_bn: document.getElementById('blogTitle').value, read_time: document.getElementById('blogReadTime').value, content_en: document.getElementById('blogContent').value, content_bn: document.getElementById('blogContent').value, image_url: img }]);
  location.reload();
}

window.del = async (table, id) => { if(confirm('Delete?')) { await supabase.from(table).delete().eq('id', id); location.reload(); } };

supabase.auth.getSession().then(({data}) => {
  if(data.session) { document.getElementById('loginScreen').style.display = 'none'; document.getElementById('adminPanel').style.display = 'flex'; loadAdminData(); }
});
