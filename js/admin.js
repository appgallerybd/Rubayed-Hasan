(function() {
  const SUPABASE_URL = 'https://qynaqzukiwtnxjsciazk.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_dTX5xkv4svMJA9-M5QMHKA_YctCIi19';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const loginScreen = document.getElementById('loginScreen');
  const adminPanel = document.getElementById('adminPanel');

  // Auth
  document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('adminEmail').value;
    const pass = document.getElementById('adminPass').value;
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) document.getElementById('login-error').textContent = error.message;
    else { loginScreen.style.display = 'none'; adminPanel.style.display = 'flex'; loadData(); }
  });

  document.getElementById('logoutBtn').addEventListener('click', async () => { await supabase.auth.signOut(); location.reload(); });

  // Sidebar Toggle
  document.getElementById('mobileMenuBtn').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('active'));
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      item.classList.add('active');
      document.getElementById(item.dataset.target).classList.add('active');
      if(window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('active');
    });
  });

  // Universal Upload
  async function uploadImage(file) {
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const { error } = await supabase.storage.from('site-assets').upload(fileName, file);
    if (error) throw error;
    return supabase.storage.from('site-assets').getPublicUrl(fileName).data.publicUrl;
  }

  // Load Data
  async function loadData() {
    // Settings
    const { data: sets } = await supabase.from('site_settings').select('*');
    if(sets) sets.forEach(s => { const el = document.getElementById(s.key); if(el) el.value = s.value; });

    // Socials
    const { data: socs } = await supabase.from('social_links').select('*');
    if(socs) document.getElementById('socialsList').innerHTML = socs.map(s => `
      <div class="list-item"><div class="list-info"><h4>${s.platform}</h4><p>${s.url}</p></div>
      <button class="btn btn-danger" onclick="del('social_links', ${s.id})">Delete</button></div>`).join('');

    // Projects
    const { data: projs } = await supabase.from('projects').select('*');
    if(projs) document.getElementById('projectsList').innerHTML = projs.map(p => `
      <div class="list-item"><div class="list-info"><h4>${p.title}</h4><p>${p.category_en}</p></div>
      <button class="btn btn-danger" onclick="del('projects', ${p.id})">Delete</button></div>`).join('');

    // Blogs
    const { data: blogs } = await supabase.from('blog_posts').select('*');
    if(blogs) document.getElementById('blogsList').innerHTML = blogs.map(b => `
      <div class="list-item"><div class="list-info"><h4>${b.title_en}</h4><p>${b.read_time}</p></div>
      <button class="btn btn-danger" onclick="del('blog_posts', ${b.id})">Delete</button></div>`).join('');
  }

  // Form Submit Handlers
  document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputs = e.target.querySelectorAll('input, textarea');
    for (let i of inputs) { if(i.id) await supabase.from('site_settings').upsert({ key: i.id, value: i.value }); }
    alert('Settings Saved!');
  });

  document.getElementById('socialForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await supabase.from('social_links').insert([{
      platform: document.getElementById('socPlatform').value, url: document.getElementById('socUrl').value,
      icon_svg: document.getElementById('socIcon').value, section: document.getElementById('socSection').value
    }]);
    location.reload();
  });

  document.getElementById('projectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('projImage').files[0];
    let img = ''; if(file) img = await uploadImage(file);
    await supabase.from('projects').insert([{
      title: document.getElementById('projTitle').value, category_en: document.getElementById('projCatEn').value,
      category_bn: document.getElementById('projCatBn').value, desc_en: document.getElementById('projDescEn').value,
      desc_bn: document.getElementById('projDescBn').value, is_featured: document.getElementById('projFeatured').value === 'true', image_url: img
    }]);
    location.reload();
  });

  document.getElementById('blogForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('blogImage').files[0];
    let img = ''; if(file) img = await uploadImage(file);
    await supabase.from('blog_posts').insert([{
      title_en: document.getElementById('blogTitleEn').value, title_bn: document.getElementById('blogTitleBn').value,
      image_url: img, content_en: document.getElementById('blogContentEn').value,
      content_bn: document.getElementById('blogContentBn').value, read_time: document.getElementById('blogReadTime').value,
      is_featured: document.getElementById('blogFeatured').value === 'true'
    }]);
    location.reload();
  });

  window.showForm = (id) => document.getElementById(id).style.display = 'block';
  window.del = async (table, id) => { if(confirm('Delete?')) { await supabase.from(table).delete().eq('id', id); location.reload(); } };

  // Check session on load
  supabase.auth.getSession().then(({data}) => { if(data.session) { loginScreen.style.display='none'; adminPanel.style.display='flex'; loadData(); } });
})();
