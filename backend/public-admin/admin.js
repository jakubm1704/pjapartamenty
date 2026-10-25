/* Panel administracyjny P&J Apartamenty — czysty JS, bez frameworków. */

let apartmentsCache = [];
let attractionsCache = [];

async function api(path, opts = {}){
  const isForm = opts.body instanceof FormData;
  const res = await fetch(path, {
    credentials: "include",
    method: opts.method || "GET",
    headers: isForm ? undefined : (opts.body ? { "Content-Type": "application/json" } : undefined),
    body: isForm ? opts.body : (opts.body ? JSON.stringify(opts.body) : undefined),
  });
  if (!res.ok){
    const err = await res.json().catch(() => ({ error: "Błąd żądania." }));
    throw new Error(err.error || "Błąd żądania.");
  }
  return res.json();
}

async function init(){
  const me = await api("/api/admin/me");
  if (me.loggedIn){
    renderApp(me.username);
  } else {
    renderLogin();
  }
}

function renderLogin(){
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="login-screen">
      <div class="login-card">
        <img src="/assets/images/logo-gold.png" alt="P&J Apartamenty" class="login-logo">
        <h1>Panel administracyjny</h1>
        <form id="loginForm">
          <label>Login <input type="text" name="username" required autocomplete="username"></label>
          <label>Hasło <input type="password" name="password" required autocomplete="current-password"></label>
          <button type="submit" class="btn btn-primary">Zaloguj się</button>
          <p class="error" id="loginError"></p>
        </form>
      </div>
    </div>`;

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api("/api/admin/login", { method: "POST", body: { username: fd.get("username"), password: fd.get("password") } });
      init();
    } catch (err){
      document.getElementById("loginError").textContent = err.message;
    }
  });
}

function renderApp(username){
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="admin-shell">
      <header class="admin-header">
        <img src="/assets/images/logo-gold.png" alt="P&J Apartamenty" class="admin-logo">
        <nav class="admin-tabs">
          <button data-tab="apartments" class="active">Apartamenty</button>
          <button data-tab="attractions">Atrakcje</button>
          <button data-tab="parking">Parking</button>
          <button data-tab="sniadania">Śniadania</button>
        </nav>
        <div class="admin-user">
          <span>${escapeHtml(username)}</span>
          <button id="logoutBtn" class="btn btn-outline btn-sm">Wyloguj</button>
        </div>
      </header>
      <main id="adminContent" class="admin-content"></main>
    </div>`;

  app.querySelectorAll(".admin-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      app.querySelectorAll(".admin-tabs button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      showTab(btn.dataset.tab);
    });
  });

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await api("/api/admin/logout", { method: "POST" });
    init();
  });

  showTab("apartments");
}

function showTab(tab){
  const content = document.getElementById("adminContent");
  content.innerHTML = `<p class="loading">Wczytywanie…</p>`;
  if (tab === "apartments") return renderApartmentsTab(content);
  if (tab === "attractions") return renderAttractionsTab(content);
  if (tab === "parking") return renderPageTab(content, "parking", "Parking");
  if (tab === "sniadania") return renderPageTab(content, "sniadania", "Śniadania");
}

/* ---------------- Apartamenty ---------------- */
async function renderApartmentsTab(content){
  apartmentsCache = await api("/api/admin/apartments");
  content.innerHTML = `
    <div class="list-panel">
      <input type="search" id="aptSearch" placeholder="Szukaj po nazwie…" class="search-input">
      <div class="list" id="aptList"></div>
    </div>
    <div class="edit-panel" id="aptEdit"><p class="hint">Wybierz apartament z listy po lewej.</p></div>`;

  renderApartmentList(apartmentsCache);
  document.getElementById("aptSearch").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    renderApartmentList(apartmentsCache.filter((a) => a.name.toLowerCase().includes(q)));
  });
}

function renderApartmentList(items){
  const list = document.getElementById("aptList");
  list.innerHTML = items.map((a) => `
    <button class="list-item" data-id="${a.id}">
      <strong>${escapeHtml(a.name)}</strong>
      <span>${escapeHtml(categoryLabelAdmin(a.category))} · ID ${escapeHtml(String(a.id))}</span>
    </button>`).join("");
  list.querySelectorAll(".list-item").forEach((btn) => {
    btn.addEventListener("click", () => openApartmentEditor(btn.dataset.id));
  });
}

function categoryLabelAdmin(id){
  return { studio: "Studio", "1-sypialnia": "1 sypialnia", "2-sypialnie": "2 sypialnie", "3-plus": "3+ sypialnie" }[id] || id;
}

async function openApartmentEditor(id){
  const apt = await api("/api/admin/apartments/" + id);
  const edit = document.getElementById("aptEdit");
  edit.innerHTML = `
    <form id="aptForm">
      <h2>${escapeHtml(apt.name)}</h2>
      <label>Nazwa <input name="name" value="${escapeAttr(apt.name)}"></label>
      <p class="hint">Adres strony: <a href="/${escapeAttr(apt.slug || "")}" target="_blank" rel="noopener">/${escapeHtml(apt.slug || "")}</a> (nie zmienia się po zmianie nazwy). ID apartamentu (= ID w PREVIO): ${escapeHtml(String(apt.id))}</p>
      <div class="field-row">
        <label>Sypialnie (0 = studio) <input type="number" name="bedrooms" value="${apt.bedrooms}" min="0"></label>
        <label>Piętro (0 = parter) <input type="number" name="floor" value="${apt.floor ?? ""}"></label>
        <label>Metraż (m²) <input type="number" name="area" value="${apt.area ?? ""}" min="1" placeholder="brak danych"></label>
      </div>
      <div class="field-row">
        <label>Optymalna liczba osób <input type="number" name="guests" value="${apt.guests ?? 0}" min="0"></label>
      </div>
      <div class="field-row">
        <label>Łóżka podwójne <input type="number" name="bedDouble" value="${apt.beds?.double ?? 0}" min="0"></label>
        <label>Łóżka pojedyncze <input type="number" name="bedSingle" value="${apt.beds?.single ?? 0}" min="0"></label>
        <label>Sofy rozkładane <input type="number" name="bedSofaBed" value="${apt.beds?.sofaBed ?? 0}" min="0"></label>
        <label>Sofy nierozkładane <input type="number" name="bedSofa" value="${apt.beds?.sofa ?? 0}" min="0"></label>
      </div>
      <label>Adres <input name="address" value="${escapeAttr(apt.address)}"></label>
      <label>Opis <textarea name="description">${escapeHtml(apt.description)}</textarea></label>
      <label>Udogodnienia (oddziel przecinkami) <input name="amenities" value="${escapeAttr((apt.amenities || []).join(", "))}"></label>
      <button type="submit" class="btn btn-primary">Zapisz zmiany</button>
      <p class="save-msg" id="aptSaveMsg"></p>
    </form>
    <div class="photos-panel">
      <h3>Zdjęcia</h3>
      <div class="photo-grid" id="aptPhotoGrid"></div>
      <label class="upload-btn">
        + Dodaj zdjęcie
        <input type="file" id="aptPhotoInput" accept="image/*" hidden>
      </label>
    </div>`;

  renderPhotoGrid("aptPhotoGrid", apt.images, async (url) => {
    await api(`/api/admin/apartments/${apt.id}/photos`, { method: "DELETE", body: { url } });
    openApartmentEditor(apt.id);
  });

  document.getElementById("aptPhotoInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("photo", file);
    await api(`/api/admin/apartments/${apt.id}/photos`, { method: "POST", body: fd });
    openApartmentEditor(apt.id);
  });

  document.getElementById("aptForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const patch = {
      name: fd.get("name"),
      bedrooms: Number(fd.get("bedrooms")),
      floor: fd.get("floor"),
      area: fd.get("area"),
      guests: Number(fd.get("guests")),
      beds: {
        double: Number(fd.get("bedDouble")), single: Number(fd.get("bedSingle")),
        sofaBed: Number(fd.get("bedSofaBed")), sofa: Number(fd.get("bedSofa")),
      },
      address: fd.get("address"),
      description: fd.get("description"),
      amenities: String(fd.get("amenities") || "").split(",").map((s) => s.trim()).filter(Boolean),
    };
    const updated = await api(`/api/admin/apartments/${apt.id}`, { method: "PUT", body: patch });
    document.getElementById("aptSaveMsg").textContent = "Zapisano.";
    const idx = apartmentsCache.findIndex((a) => a.id === updated.id);
    if (idx !== -1) apartmentsCache[idx] = updated;
    renderApartmentList(apartmentsCache);
  });
}

/* ---------------- Atrakcje ---------------- */
async function renderAttractionsTab(content){
  attractionsCache = await api("/api/admin/attractions");
  content.innerHTML = `
    <div class="list-panel">
      <div class="list" id="attrList"></div>
    </div>
    <div class="edit-panel" id="attrEdit"><p class="hint">Wybierz atrakcję z listy po lewej.</p></div>`;
  renderAttractionList(attractionsCache);
}

function renderAttractionList(items){
  const list = document.getElementById("attrList");
  list.innerHTML = items.map((a) => `
    <button class="list-item" data-id="${a.id}">
      <strong>${escapeHtml(a.name)}</strong>
      <span>${escapeHtml(a.area)}</span>
    </button>`).join("");
  list.querySelectorAll(".list-item").forEach((btn) => {
    btn.addEventListener("click", () => openAttractionEditor(btn.dataset.id));
  });
}

async function openAttractionEditor(id){
  const item = await api("/api/admin/attractions/" + id);
  const edit = document.getElementById("attrEdit");
  edit.innerHTML = `
    <form id="attrForm">
      <h2>${escapeHtml(item.name)}</h2>
      <label>Nazwa <input name="name" value="${escapeAttr(item.name)}"></label>
      <label>Dzielnica
        <select name="area">
          <option ${item.area === "Stare Miasto" ? "selected" : ""}>Stare Miasto</option>
          <option ${item.area === "Kazimierz" ? "selected" : ""}>Kazimierz</option>
          <option ${item.area === "Podgórze" ? "selected" : ""}>Podgórze</option>
        </select>
      </label>
      <label>Krótki opis (na liście) <textarea name="shortDesc">${escapeHtml(item.shortDesc)}</textarea></label>
      <label>Pełny opis (podstrona atrakcji) <textarea name="longDesc" rows="6">${escapeHtml(item.longDesc)}</textarea></label>
      <button type="submit" class="btn btn-primary">Zapisz zmiany</button>
      <p class="save-msg" id="attrSaveMsg"></p>
    </form>
    <div class="photos-panel">
      <h3>Zdjęcia</h3>
      <div class="photo-grid" id="attrPhotoGrid"></div>
      <label class="upload-btn">
        + Dodaj zdjęcie
        <input type="file" id="attrPhotoInput" accept="image/*" hidden>
      </label>
    </div>`;

  renderPhotoGrid("attrPhotoGrid", item.images, async (url) => {
    await api(`/api/admin/attractions/${item.id}/photos`, { method: "DELETE", body: { url } });
    openAttractionEditor(item.id);
  });

  document.getElementById("attrPhotoInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("photo", file);
    await api(`/api/admin/attractions/${item.id}/photos`, { method: "POST", body: fd });
    openAttractionEditor(item.id);
  });

  document.getElementById("attrForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const patch = {
      name: fd.get("name"),
      area: fd.get("area"),
      shortDesc: fd.get("shortDesc"),
      longDesc: fd.get("longDesc"),
    };
    const updated = await api(`/api/admin/attractions/${item.id}`, { method: "PUT", body: patch });
    document.getElementById("attrSaveMsg").textContent = "Zapisano.";
    const idx = attractionsCache.findIndex((a) => a.id === updated.id);
    if (idx !== -1) attractionsCache[idx] = updated;
    renderAttractionList(attractionsCache);
  });
}

/* ---------------- Parking / Śniadania ---------------- */
async function renderPageTab(content, slug, label){
  const page = await api(`/api/admin/pages/${slug}`);
  const showPhotos = slug === "parking"; // Śniadania nie pokazuje już zdjęcia na stronie
  content.innerHTML = `
    <div class="edit-panel wide">
      <form id="pageForm">
        <h2>${label}</h2>
        ${slug === "parking" ? `<label>Lokalizacja <input name="location" value="${escapeAttr(page.location || "")}"></label>` : ""}
        ${slug === "sniadania" ? `<label>Godziny dostawy <input name="hours" value="${escapeAttr(page.hours || "")}"></label>` : ""}
        <label>Cena <input name="price" value="${escapeAttr(page.price || "")}"></label>
        <label>Opis <textarea name="description" rows="5">${escapeHtml(page.description || "")}</textarea></label>
        <button type="submit" class="btn btn-primary">Zapisz zmiany</button>
        <p class="save-msg" id="pageSaveMsg"></p>
      </form>
      ${showPhotos ? `
      <div class="photos-panel">
        <h3>Zdjęcia</h3>
        <p class="hint" style="margin-bottom:10px;">Na stronie pokazuje się tylko <strong>pierwsze</strong> zdjęcie z listy — usuń zdjęcia przed nim, żeby zmienić, które jest widoczne.</p>
        <div class="photo-grid" id="pagePhotoGrid"></div>
        <label class="upload-btn">
          + Dodaj zdjęcie
          <input type="file" id="pagePhotoInput" accept="image/*" hidden>
        </label>
      </div>` : ""}
    </div>`;

  if (showPhotos){
    renderPhotoGrid("pagePhotoGrid", page.images, async (url) => {
      await api(`/api/admin/pages/${slug}/photos`, { method: "DELETE", body: { url } });
      renderPageTab(content, slug, label);
    });

    document.getElementById("pagePhotoInput").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const fd = new FormData();
      fd.append("photo", file);
      await api(`/api/admin/pages/${slug}/photos`, { method: "POST", body: fd });
      renderPageTab(content, slug, label);
    });
  }

  document.getElementById("pageForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const patch = {};
    for (const [k, v] of fd.entries()) patch[k] = v;
    await api(`/api/admin/pages/${slug}`, { method: "PUT", body: patch });
    document.getElementById("pageSaveMsg").textContent = "Zapisano.";
  });
}

/* ---------------- Wspólne ---------------- */
function renderPhotoGrid(containerId, images, onDelete){
  const grid = document.getElementById(containerId);
  grid.innerHTML = (images && images.length
    ? images.map((url) => `
        <div class="photo-thumb">
          <img src="${escapeAttr(url)}" alt="">
          <button type="button" class="photo-delete" data-url="${escapeAttr(url)}" title="Usuń zdjęcie">×</button>
        </div>`).join("")
    : `<p class="hint">Brak zdjęć.</p>`);
  grid.querySelectorAll(".photo-delete").forEach((btn) => {
    btn.addEventListener("click", () => onDelete(btn.dataset.url));
  });
}

function escapeHtml(str){
  return String(str ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}
function escapeAttr(str){
  return escapeHtml(str).replace(/"/g, "&quot;");
}

init();
