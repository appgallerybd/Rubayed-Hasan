(function () {
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* সাধারণ লেখা বসানো */
  document.querySelectorAll("[data-t]").forEach((n) => {
    const v = PROFILE[n.dataset.t];
    if (v) n.textContent = v;
  });
  document.title = PROFILE.name + " | " + PROFILE.title;
  $("#year").textContent = new Date().getFullYear().toLocaleString("bn-BD", { useGrouping: false });

  /* হোয়াটসঅ্যাপ লিংক */
  const waLink = (text) =>
    "https://wa.me/" + PROFILE.whatsapp + (text ? "?text=" + encodeURIComponent(text) : "");
  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = waLink("আসসালামু আলাইকুম, আমি আপনার সাথে কাজ নিয়ে কথা বলতে চাই।");
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* পরিসংখ্যান, পরিচিতি, দক্ষতা */
  PROFILE.stats.forEach((s) => $("#stats").append(el("li", "", `<b>${esc(s.n)}</b><span>${esc(s.l)}</span>`)));
  PROFILE.about.forEach((p) => $("#aboutText").append(el("p", "", esc(p))));
  PROFILE.skills.forEach((s) => $("#skills").append(el("li", "", esc(s))));

  /* সেবা */
  SERVICES.forEach((s) => {
    const c = el("article", "card service");
    c.innerHTML = `<div class="card-body"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>`;
    $("#serviceGrid").append(c);
    $("#serviceSelect").append(new Option(s.title, s.title));
  });
  $("#serviceSelect").append(new Option("অন্যান্য", "অন্যান্য"));

  /* প্রজেক্ট + ফিল্টার */
  const cats = ["সব", ...new Set(PROJECTS.map((p) => p.category))];
  let active = "সব";
  function renderProjects() {
    const grid = $("#projectGrid");
    grid.innerHTML = "";
    const list = PROJECTS.filter((p) => active === "সব" || p.category === active);
    $("#projectEmpty").hidden = list.length > 0;
    list.forEach((p) => {
      const c = el("article", "card");
      const img = p.image
        ? `<img class="thumb" src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" onerror="this.removeAttribute('src')">`
        : `<div class="thumb"></div>`;
      c.innerHTML = `${img}<div class="card-body"><span class="meta">${esc(p.category)} · ${esc(p.date)}</span>
        <h3>${esc(p.title)}</h3><p>${esc(p.text)}</p>
        <a class="more" href="${esc(p.url)}" target="_blank" rel="noopener">লাইভ দেখুন</a></div>`;
      grid.append(c);
    });
  }
  function renderFilters() {
    const box = $("#filters");
    box.innerHTML = "";
    cats.forEach((c) => {
      const b = el("button", "", esc(c));
      b.type = "button";
      b.setAttribute("aria-pressed", c === active);
      b.onclick = () => { active = c; renderFilters(); renderProjects(); };
      box.append(b);
    });
  }
  renderFilters();
  renderProjects();

  /* ব্লগ */
  POSTS.forEach((p) => {
    const c = el("article", "card");
    c.innerHTML = `<div class="card-body"><span class="meta">${esc(p.date)}</span><h3>${esc(p.title)}</h3>
      <p>${esc(p.text)}</p><a class="more" href="${esc(p.url)}">পড়ুন</a></div>`;
    $("#postGrid").append(c);
  });

  /* যোগাযোগ তথ্য */
  const info = [
    ["ইমেইল", PROFILE.email, "mailto:" + PROFILE.email],
    ["ফোন", PROFILE.phone, "tel:" + PROFILE.phone.replace(/\s|-/g, "")],
    ["ঠিকানা", PROFILE.location, ""]
  ];
  info.forEach(([k, v, href]) => {
    $("#contactList").append(el("li", "", `<small>${k}</small>` + (href ? `<a href="${esc(href)}">${esc(v)}</a>` : esc(v))));
  });
  PROFILE.social.forEach((s) =>
    $("#social").append(el("li", "", `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`))
  );

  /* ফর্ম → হোয়াটসঅ্যাপ */
  $("#contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target, note = $("#formNote");
    if (!f.name.value.trim() || !f.contact.value.trim() || !f.message.value.trim()) {
      note.style.color = "#c0392b";
      note.textContent = "নাম, যোগাযোগের মাধ্যম ও বার্তা পূরণ করুন।";
      return;
    }
    const msg = `আসসালামু আলাইকুম।\nনাম: ${f.name.value.trim()}\nযোগাযোগ: ${f.contact.value.trim()}\nসেবা: ${f.service.value}\nবার্তা: ${f.message.value.trim()}`;
    note.style.color = "";
    note.textContent = "হোয়াটসঅ্যাপ খুলছে…";
    window.open(waLink(msg), "_blank", "noopener");
  });

  /* মোবাইল মেনু */
  const btn = $("#menuBtn"), nav = $("#nav");
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") { nav.classList.remove("open"); btn.setAttribute("aria-expanded", false); }
  });
})();
