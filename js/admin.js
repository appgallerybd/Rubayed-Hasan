/* Admin dashboard — Supabase Auth + database-backed authorization.
   Admin access requires app_metadata.role === "admin" (set only by a trusted project admin). */
(() => {
  'use strict';

  const SUPABASE_URL = 'https://qynaqzukiwtnxjsciazk.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_dTX5xkv4svMJA9-M5QMHKA_YctCIi19';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  const $ = (id) => document.getElementById(id);
  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);

  function showMessage(message, type = 'error') {
    const el = $('adminNotice');
    if (!el) return;
    el.textContent = message;
    el.dataset.type = type;
    el.hidden = false;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function clearMessage() {
    const el = $('adminNotice');
    if (el) { el.hidden = true; el.textContent = ''; }
  }
  function setBusy(button, busy, label = 'Please wait…') {
    if (!button) return;
    if (busy) {
      button.dataset.originalText = button.textContent;
      button.textContent = label;
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
    } else {
      button.textContent = button.dataset.originalText || button.textContent;
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
  }
  function showLogin(message = '') {
    $('loginScreen').style.display = 'flex';
    $('adminPanel').style.display = 'none';
    if (message) {
      $('login-error').textContent = message;
      $('login-error').style.display = 'block';
    }
  }
  function showPanel() {
    $('loginScreen').style.display = 'none';
    $('adminPanel').style.display = 'flex';
    $('login-error').style.display = 'none';
  }
  function isAdmin(user) {
    const meta = user && user.app_metadata ? user.app_metadata : {};
    return meta.role === 'admin' || meta.is_admin === true;
  }

  async function verifyAndOpen(session) {
    if (!session || !session.user) { showLogin(); return; }
    if (!isAdmin(session.user)) {
      await supabase.auth.signOut();
      showLogin('এই অ্যাকাউন্টে Admin অনুমতি নেই। প্রজেক্ট অ্যাডমিনের সঙ্গে যোগাযোগ করুন।');
      return;
    }
    showPanel();
    await loadAdminData();
  }

  $('loginBtn').addEventListener('click', async () => {
    clearMessage();
    const email = $('adminEmail').value.trim().toLowerCase();
    const password = $('adminPass').value;
    const button = $('loginBtn');
    $('login-error').style.display = 'none';

    if (!email || !password) {
      $('login-error').textContent = 'ইমেইল ও পাসওয়ার্ড দুটোই দিন।';
      $('login-error').style.display = 'block';
      return;
    }
    setBusy(button, true, 'Signing in…');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.session || !isAdmin(data.user)) {
        await supabase.auth.signOut();
        throw new Error('লগইন হয়েছে, কিন্তু এই অ্যাকাউন্টে Admin অনুমতি নেই।');
      }
      await verifyAndOpen(data.session);
    } catch (error) {
      console.error('Admin login failed:', error);
      $('login-error').textContent = error.message || 'লগইন করা যায়নি। আবার চেষ্টা করুন।';
      $('login-error').style.display = 'block';
    } finally {
      setBusy(button, false);
    }
  });

  $('adminPass').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') $('loginBtn').click();
  });
  $('adminEmail').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') $('loginBtn').click();
  });

  $('logoutBtn').addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) showMessage(error.message);
    else showLogin('আপনি সফলভাবে লগআউট করেছেন।');
  });

  // Auth state is rechecked on refresh, token refresh, and sign-out.
  supabase.auth.onAuthStateChange((event, session) => {
    // SIGNED_IN is handled by the login flow; avoid loading the dashboard twice.
    // Re-check permissions after token refresh and always react to sign-out.
    if (event === 'SIGNED_OUT') {
      showLogin();
    } else if (event === 'TOKEN_REFRESHED' && session) {
      window.setTimeout(() => verifyAndOpen(session).catch(error => {
        console.error('Refreshed session verification failed:', error);
        showLogin('Admin অনুমতি যাচাই করা যায়নি। আবার লগইন করুন।');
      }), 0);
    }
  });

  window.switchTab = function (event, tabId) {
    event.preventDefault();
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    event.currentTarget.classList.add('active');
    const tab = $(tabId);
    if (tab) tab.classList.add('active');
    if (window.innerWidth < 768) $('sidebar').classList.remove('active');
    clearMessage();
  };

  async function loadAdminData() {
    clearMessage();
    const { data: sets, error } = await supabase.from('site_settings').select('*');
    if (error) { showMessage('Settings লোড হয়নি: ' + error.message); return; }
    (sets || []).forEach(setting => {
      const field = $(setting.key);
      if (field) field.value = setting.value ?? '';
    });
    await Promise.all([loadAdminProjects(), loadAdminBlogs(), loadAdminChatbot()]);
  }

  window.saveSettings = async function () {
    const keys = ['hero_title_en', 'hero_tagline_en', 'about_en', 'blog_desc_en', 'footer_about_en', 'contact_phone', 'contact_email', 'contact_loc', 'highlight_color'];
    const rows = keys.map(key => ({ key, value: $(key).value.trim() }));
    try {
      const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
      if (error) throw error;
      showMessage('Settings সফলভাবে সংরক্ষণ হয়েছে।', 'success');
    } catch (error) { showMessage('Settings সংরক্ষণ হয়নি: ' + error.message); }
  };

  async function uploadImage(file) {
    if (!file) return '';
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      throw new Error('শুধু JPG, PNG, WEBP বা GIF ছবি আপলোড করা যাবে।');
    }
    if (file.size > 5 * 1024 * 1024) throw new Error('ছবির সাইজ সর্বোচ্চ 5 MB হতে পারবে।');
    const ext = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' })[file.type];
    const fileName = 'admin/' + crypto.randomUUID() + '.' + ext;
    const { error } = await supabase.storage.from('site-assets').upload(fileName, file, {
      cacheControl: '3600', upsert: false, contentType: file.type
    });
    if (error) throw error;
    const { data } = supabase.storage.from('site-assets').getPublicUrl(fileName);
    return data.publicUrl;
  }

  window.loadAdminProjects = async function () {
    const { data, error } = await supabase.from('projects').select('*').order('id', { ascending: false });
    if (error) { showMessage('Projects লোড হয়নি: ' + error.message); return; }
    $('adminProjectsList').innerHTML = (data || []).map(project => `
      <div class="list-item">
        <div><b>${escapeHTML(project.title)}</b><br><small>${escapeHTML(project.category_en || '')}</small></div>
        <button class="btn btn-danger" type="button" onclick="del('projects', '${escapeHTML(project.id)}')">Delete</button>
      </div>`).join('') || '<p class="empty-state">এখনো কোনো Project যোগ করা হয়নি।</p>';
  };

  window.addProject = async function () {
    const title = $('projTitle').value.trim();
    if (!title) { showMessage('Project-এর Title লিখুন।'); return; }
    const button = $('projForm').querySelector('button.btn-primary');
    setBusy(button, true, 'Saving…');
    try {
      const image = await uploadImage($('projImg').files[0]);
      const { error } = await supabase.from('projects').insert([{
        title, category_en: $('projCat').value.trim(), category_bn: $('projCat').value.trim(),
        desc_en: $('projDesc').value.trim(), desc_bn: $('projDesc').value.trim(),
        image_url: image, is_featured: $('projFeatured').checked
      }]);
      if (error) throw error;
      $('projForm').style.display = 'none';
      $('projTitle').value = $('projCat').value = $('projDesc').value = '';
      $('projImg').value = ''; $('projFeatured').checked = false;
      await loadAdminProjects();
      showMessage('Project যোগ হয়েছে।', 'success');
    } catch (error) { showMessage('Project যোগ করা যায়নি: ' + error.message); }
    finally { setBusy(button, false); }
  };

  window.loadAdminBlogs = async function () {
    const { data, error } = await supabase.from('blog_posts').select('*').order('id', { ascending: false });
    if (error) { showMessage('Blogs লোড হয়নি: ' + error.message); return; }
    $('adminBlogsList').innerHTML = (data || []).map(blog => `
      <div class="list-item">
        <div><b>${escapeHTML(blog.title_en)}</b></div>
        <button class="btn btn-danger" type="button" onclick="del('blog_posts', '${escapeHTML(blog.id)}')">Delete</button>
      </div>`).join('') || '<p class="empty-state">এখনো কোনো Blog যোগ করা হয়নি।</p>';
  };

  window.addBlog = async function () {
    const title = $('blogTitle').value.trim();
    const content = $('blogContent').value.trim();
    if (!title || !content) { showMessage('Blog-এর Title ও Content লিখুন।'); return; }
    const button = $('blogForm').querySelector('button.btn-primary');
    setBusy(button, true, 'Saving…');
    try {
      const image = await uploadImage($('blogImg').files[0]);
      const { error } = await supabase.from('blog_posts').insert([{
        title_en: title, title_bn: title, read_time: $('blogReadTime').value.trim(),
        content_en: content, content_bn: content, image_url: image
      }]);
      if (error) throw error;
      $('blogForm').style.display = 'none';
      $('blogTitle').value = $('blogReadTime').value = $('blogContent').value = '';
      $('blogImg').value = '';
      await loadAdminBlogs();
      showMessage('Blog প্রকাশের জন্য সংরক্ষণ হয়েছে।', 'success');
    } catch (error) { showMessage('Blog যোগ করা যায়নি: ' + error.message); }
    finally { setBusy(button, false); }
  };

  window.loadAdminChatbot = async function () {
    const { data, error } = await supabase.from('chatbot_qa').select('*').order('id', { ascending: false });
    if (error) { showMessage('Chatbot Q&A লোড হয়নি: ' + error.message); return; }
    $('adminChatbotList').innerHTML = (data || []).map(item => `
      <div class="list-item">
        <div><b>Q: ${escapeHTML(item.question_en)}</b><br><small>A: ${escapeHTML(item.answer_en)}</small></div>
        <button class="btn btn-danger" type="button" onclick="del('chatbot_qa', '${escapeHTML(item.id)}')">Delete</button>
      </div>`).join('') || '<p class="empty-state">এখনো কোনো Q&A যোগ করা হয়নি।</p>';
  };

  window.addChatbot = async function () {
    const question = $('chatQ').value.trim();
    const answer = $('chatA').value.trim();
    if (!question || !answer) { showMessage('Question ও Answer দুটোই লিখুন।'); return; }
    const button = $('chatForm').querySelector('button.btn-primary');
    setBusy(button, true, 'Saving…');
    try {
      const { error } = await supabase.from('chatbot_qa').insert([{
        question_en: question, question_bn: question, answer_en: answer, answer_bn: answer
      }]);
      if (error) throw error;
      $('chatForm').style.display = 'none';
      $('chatQ').value = $('chatA').value = '';
      await loadAdminChatbot();
      showMessage('Q&A যোগ হয়েছে।', 'success');
    } catch (error) { showMessage('Q&A যোগ করা যায়নি: ' + error.message); }
    finally { setBusy(button, false); }
  };

  window.del = async function (table, id) {
    const allowed = ['projects', 'blog_posts', 'chatbot_qa'];
    if (!allowed.includes(table)) return;
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এটি Delete করতে চান?')) return;
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      if (table === 'projects') await loadAdminProjects();
      if (table === 'blog_posts') await loadAdminBlogs();
      if (table === 'chatbot_qa') await loadAdminChatbot();
      showMessage('আইটেমটি Delete হয়েছে।', 'success');
    } catch (error) { showMessage('Delete করা যায়নি: ' + error.message); }
  };

  // Initial session check. Auth listener handles subsequent changes.
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) { showLogin('সেশন যাচাই করা যায়নি। আবার লগইন করুন।'); return; }
    verifyAndOpen(data.session).catch(err => {
      console.error('Session verification failed:', err);
      showLogin('Admin অনুমতি যাচাই করা যায়নি।');
    });
  });
})();
