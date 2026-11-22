/* ============================================================
   ADMIN PANEL LOGIC
   ============================================================ */

// --- Login Logic ---
const loginScreen = document.getElementById('loginScreen');
const adminPanel = document.getElementById('adminPanel');
const loginBtn = document.getElementById('loginBtn');
const adminPass = document.getElementById('adminPass');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

// Set default password (Can be changed in code)
const CORRECT_PASSWORD = "admin123";

// Check if already logged in (session)
if (sessionStorage.getItem('adminLoggedIn') === 'true') {
  loginScreen.style.display = 'none';
  adminPanel.style.display = 'flex';
}

loginBtn.addEventListener('click', () => {
  if (adminPass.value === CORRECT_PASSWORD) {
    sessionStorage.setItem('adminLoggedIn', 'true');
    loginScreen.style.display = 'none';
    adminPanel.style.display = 'flex';
    loadDashboardData();
  } else {
    loginError.style.display = 'block';
    adminPass.value = '';
  }
});

adminPass.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') loginBtn.click();
});

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('adminLoggedIn');
  location.reload();
});

// --- Tab Switching Logic ---
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    navItems.forEach(nav => nav.classList.remove('active'));
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    item.classList.add('active');
    const target = item.getAttribute('data-target');
    document.getElementById(target).classList.add('active');
  });
});

// --- Database Simulation (LocalStorage) ---
// Default Data
const defaultProjects = [
  { id: 1, name: "Shikder Enterprise", catEn: "Automotive Brand Identity", catBn: "অটোমোটিভ ব্র্যান্ড আইডেন্টিটি", img: "images/project-1.png" },
  { id: 2, name: "Al Wafa Shop", catEn: "Retail Brand Identity", catBn: "রিটেইল ব্র্যান্ড আইডেন্টিটি", img: "images/project-2.png" },
  { id: 3, name: "HL Fashion House", catEn: "Luxury Fashion Branding", catBn: "লাক্সারি ফ্যাশন ব্র্যান্ডিং", img: "images/project-3.png" },
];

const defaultReviews = [
  { id: 1, name: "Mufti Shihabuddin", role: "Muhtamim, Raghunathpur Hasania Madrasha", textEn: "Rubayed designed our visiting card with great professionalism...", textBn: "রুবায়েদ ভাইয়ের ডিজাইন করা ভিজিটিং কার্ডটি দেখতে অত্যন্ত প্রিমিয়াম..." },
  { id: 2, name: "Mawlana Tafazzul Hossain", role: "Muhtamim, Kaldanga Madrasha", textEn: "The Arabic certificate designed by him is extremely precise...", textBn: "তার ডিজাইন করা আরবি সার্টিফিকেটটি অত্যন্ত নিখুঁত ও সুন্দর..." },
];

// Initialize DB
function initDB() {
  if (!localStorage.getItem('rh_projects')) {
    localStorage.setItem('rh_projects', JSON.stringify(defaultProjects));
  }
  if (!localStorage.getItem('rh_reviews')) {
    localStorage.setItem('rh_reviews', JSON.stringify(defaultReviews));
  }
}
initDB();

function getProjects() { return JSON.parse(localStorage.getItem('rh_projects')) || []; }
function saveProjects(data) { localStorage.setItem('rh_projects', JSON.stringify(data)); }
function getReviews() { return JSON.parse(localStorage.getItem('rh_reviews')) || []; }
function saveReviews(data) { localStorage.setItem('rh_reviews', JSON.stringify(data)); }

// --- Dashboard Stats ---
function loadDashboardData() {
  document.getElementById('statProjects').textContent = getProjects().length;
  document.getElementById('statReviews').textContent = getReviews().length;
}

// ============================================================
// PROJECTS MANAGER
// ============================================================
const projectsTableBody = document.getElementById('projectsTableBody');
const projectFormContainer = document.getElementById('projectFormContainer');
const projectForm = document.getElementById('projectForm');
const addProjectBtn = document.getElementById('addProjectBtn');
const cancelProjectBtn = document.getElementById('cancelProjectBtn');

function renderProjects() {
  const projects = getProjects();
  projectsTableBody.innerHTML = '';
  
  if (projects.length === 0) {
    projectsTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color: #8f857d;">No projects found. Add one!</td></tr>';
    return;
  }

  projects.forEach(proj => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${proj.img}" alt="${proj.name}" onerror="this.src='images/profile.png'"></td>
      <td style="font-weight:600; color:#fff;">${proj.name}</td>
      <td>${proj.catEn}</td>
      <td>
        <div class="actions">
          <button class="btn-edit" onclick="editProject(${proj.id})">Edit</button>
          <button class="btn-danger" onclick="deleteProject(${proj.id})">Delete</button>
        </div>
      </td>
    `;
    projectsTableBody.appendChild(tr);
  });
  loadDashboardData();
}

addProjectBtn.addEventListener('click', () => {
  projectForm.reset();
  document.getElementById('projId').value = '';
  document.getElementById('projectFormTitle').textContent = 'Add New Project';
  projectFormContainer.style.display = 'block';
});

cancelProjectBtn.addEventListener('click', () => {
  projectFormContainer.style.display = 'none';
});

projectForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('projId').value;
  const name = document.getElementById('projName').value;
  const catEn = document.getElementById('projCatEn').value;
  const catBn = document.getElementById('projCatBn').value;
  const img = document.getElementById('projImg').value;

  let projects = getProjects();

  if (id) {
    // Edit existing
    const index = projects.findIndex(p => p.id == id);
    if (index > -1) {
      projects[index] = { id: Number(id), name, catEn, catBn, img };
    }
  } else {
    // Add new
    const newId = Date.now(); // Unique ID
    projects.push({ id: newId, name, catEn, catBn, img });
  }

  saveProjects(projects);
  projectFormContainer.style.display = 'none';
  renderProjects();
});

window.editProject = function(id) {
  const projects = getProjects();
  const proj = projects.find(p => p.id == id);
  if (!proj) return;

  document.getElementById('projId').value = proj.id;
  document.getElementById('projName').value = proj.name;
  document.getElementById('projCatEn').value = proj.catEn;
  document.getElementById('projCatBn').value = proj.catBn;
  document.getElementById('projImg').value = proj.img;

  document.getElementById('projectFormTitle').textContent = 'Edit Project';
  projectFormContainer.style.display = 'block';
};

window.deleteProject = function(id) {
  if (!confirm('Are you sure you want to delete this project?')) return;
  let projects = getProjects();
  projects = projects.filter(p => p.id != id);
  saveProjects(projects);
  renderProjects();
};

// ============================================================
// REVIEWS MANAGER
// ============================================================
const reviewsTableBody = document.getElementById('reviewsTableBody');
const reviewFormContainer = document.getElementById('reviewFormContainer');
const reviewForm = document.getElementById('reviewForm');
const addReviewBtn = document.getElementById('addReviewBtn');
const cancelReviewBtn = document.getElementById('cancelReviewBtn');

function renderReviews() {
  const reviews = getReviews();
  reviewsTableBody.innerHTML = '';
  
  if (reviews.length === 0) {
    reviewsTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color: #8f857d;">No reviews found. Add one!</td></tr>';
    return;
  }

  reviews.forEach(rev => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:600; color:#fff;">${rev.name}</td>
      <td>${rev.role}</td>
      <td style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${rev.textEn}</td>
      <td>
        <div class="actions">
          <button class="btn-edit" onclick="editReview(${rev.id})">Edit</button>
          <button class="btn-danger" onclick="deleteReview(${rev.id})">Delete</button>
        </div>
      </td>
    `;
    reviewsTableBody.appendChild(tr);
  });
  loadDashboardData();
}

addReviewBtn.addEventListener('click', () => {
  reviewForm.reset();
  document.getElementById('revId').value = '';
  document.getElementById('reviewFormTitle').textContent = 'Add New Review';
  reviewFormContainer.style.display = 'block';
});

cancelReviewBtn.addEventListener('click', () => {
  reviewFormContainer.style.display = 'none';
});

reviewForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('revId').value;
  const name = document.getElementById('revName').value;
  const role = document.getElementById('revRole').value;
  const textEn = document.getElementById('revTextEn').value;
  const textBn = document.getElementById('revTextBn').value;

  let reviews = getReviews();

  if (id) {
    const index = reviews.findIndex(r => r.id == id);
    if (index > -1) {
      reviews[index] = { id: Number(id), name, role, textEn, textBn };
    }
  } else {
    const newId = Date.now();
    reviews.push({ id: newId, name, role, textEn, textBn });
  }

  saveReviews(reviews);
  reviewFormContainer.style.display = 'none';
  renderReviews();
});

window.editReview = function(id) {
  const reviews = getReviews();
  const rev = reviews.find(r => r.id == id);
  if (!rev) return;

  document.getElementById('revId').value = rev.id;
  document.getElementById('revName').value = rev.name;
  document.getElementById('revRole').value = rev.role;
  document.getElementById('revTextEn').value = rev.textEn;
  document.getElementById('revTextBn').value = rev.textBn;

  document.getElementById('reviewFormTitle').textContent = 'Edit Review';
  reviewFormContainer.style.display = 'block';
};

window.deleteReview = function(id) {
  if (!confirm('Are you sure you want to delete this review?')) return;
  let reviews = getReviews();
  reviews = reviews.filter(r => r.id != id);
  saveReviews(reviews);
  renderReviews();
};

// Initial Render
renderProjects();
renderReviews();
