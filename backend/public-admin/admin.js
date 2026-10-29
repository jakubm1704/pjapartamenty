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
          <a class="btn btn-outline btn-sm" href="/api/admin/backup" download title="Pobiera plik z danymi (apartamenty, opisy, atrakcje). Zdjęcia zachowaj osobno.">Kopia zapasowa</a>
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
      <button type="button" class="btn btn-primary" id="aptNewBtn">+ Nowy apartament</button>
      <input type="search" id="aptSearch" placeholder="Szukaj po nazwie…" class="search-input">
      <div class="list" id="aptList"></div>
    </div>
    <div class="edit-panel" id="aptEdit"><p class="hint">Wybierz apartament z listy po lewej.</p></div>`;

  renderApartmentList(apartmentsCache);
  document.getElementById("aptNewBtn").addEventListener("click", openNewApartmentForm);
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
      <span>${escapeHtml(categoryLabelAdmin(a.category))} · ID ${escapeHtml(String(a.id))}${a.hidden ? " · UKRYTY" : ""}${a.custom ? " · własny" : ""}</span>
    </button>`).join("");
  list.querySelectorAll(".list-item").forEach((btn) => {
    btn.addEventListener("click", () => openApartmentEditor(btn.dataset.id));
  });
}

function categoryLabelAdmin(id){
  return { studio: "Studio", "1-sypialnia": "1 sypialnia", "2-sypialnie": "2 sypialnie", "3-plus": "3+ sypialnie" }[id] || id;
}

/* Formularz „+ Nowy apartament”. Po zapisaniu od razu otwiera edytor, w którym dodasz zdjęcia. */
function openNewApartmentForm(){
  const edit = document.getElementById("aptEdit");
  edit.innerHTML = `
    <form id="aptNewForm">
      <h2>Nowy apartament</h2>
      <p class="hint">Najważniejsze jest <strong>ID z PREVIO</strong> — dzięki niemu przycisk „Zarezerwuj” otwiera właściwy apartament w systemie rezerwacji. Zdjęcia dodasz w następnym kroku.</p>
      <div class="field-row">
        <label>ID z PREVIO (liczba) <input type="number" name="id" min="1" required placeholder="np. 921439"></label>
        <label>Nazwa <input name="name" required placeholder="np. Floriańska Deluxe 9"></label>
      </div>
      <div class="field-row">
        <label>Sypialnie (0 = studio) <input type="number" name="bedrooms" value="1" min="0"></label>
        <label>Piętro (0 = parter) <input type="number" name="floor" placeholder="np. 2"></label>
        <label>Metraż (m²) <input type="number" name="area" min="1" placeholder="opcjonalnie"></label>
      </div>
      <div class="field-row">
        <label>Optymalna liczba osób <input type="number" name="guests" value="2" min="1"></label>
      </div>
      <div class="field-row">
        <label>Łóżka podwójne <input type="number" name="bedDouble" value="1" min="0"></label>
        <label>Łóżka pojedyncze <input type="number" name="bedSingle" value="0" min="0"></label>
        <label>Sofy rozkładane <input type="number" name="bedSofaBed" value="0" min="0"></label>
        <label>Sofy nierozkładane <input type="number" name="bedSofa" value="0" min="0"></label>
      </div>
      <div class="check-row">
        <label class="check"><input type="checkbox" name="ac"> Klimatyzacja</label>
        <label class="check"><input type="checkbox" name="bath"> Wanna</label>
        <label class="check"><input type="checkbox" name="balcony"> Balkon</label>
        <label class="check"><input type="checkbox" name="washer"> Pralka</label>
      </div>
      <label>Adres (opcjonalnie — domyślny zostanie wpisany automatycznie) <input name="address"></label>
      <label>Opis PL (opcjonalnie — inaczej powstanie automatyczny) <textarea name="description"></textarea></label>
      <label>Opis EN (opcjonalnie) <textarea name="description_en"></textarea></label>
      <button type="submit" class="btn btn-primary">Utwórz apartament</button>
      <p class="save-msg error" id="aptNewMsg"></p>
    </form>`;
  document.getElementById("aptNewForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = {};
    for (const [k, v] of fd.entries()) body[k] = v;
    for (const k of ["ac", "bath", "balcony", "washer"]) body[k] = fd.get(k) === "on";
    const msg = document.getElementById("aptNewMsg");
    msg.textContent = "";
    try {
      const created = await api("/api/admin/apartments", { method: "POST", body });
      apartmentsCache.push(created);
      renderApartmentList(apartmentsCache);
      openApartmentEditor(created.id);
    } catch (err){
      msg.textContent = err.message;
    }
  });
}

async function openApartmentEditor(id){
  const apt = await api("/api/admin/apartments/" + id);
  const edit = document.getElementById("aptEdit");
  edit.innerHTML = `
    <form id="aptForm">
      <h2>${escapeHtml(apt.name)}</h2>
      <label>Nazwa <input name="name" value="${escapeAttr(apt.name)}"></label>
      <p class="hint">Adres strony: <a href="/${escapeAttr(apt.slug || "")}" target="_blank" rel="noopener">/${escapeHtml(apt.slug || "")}</a> · wersja angielska: <a href="/en/${escapeAttr(apt.slug || "")}" target="_blank" rel="noopener">/en/${escapeHtml(apt.slug || "")}</a> (adres nie zmienia się po zmianie nazwy). ID apartamentu (= ID w PREVIO): ${escapeHtml(String(apt.id))}</p>
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
      <label>Opis (PL) <textarea name="description">${escapeHtml(apt.description)}</textarea></label>
      <label>Udogodnienia PL (oddziel przecinkami) <input name="amenities" value="${escapeAttr((apt.amenities || []).join(", "))}"></label>
      <h3 class="subhead">Wersja angielska (EN)</h3>
      <label>Opis (EN) <textarea name="description_en">${escapeHtml(apt.description_en || "")}</textarea></label>
      <label>Udogodnienia EN (oddziel przecinkami; puste = tłumaczone automatycznie) <input name="amenities_en" value="${escapeAttr((apt.amenities_en || []).join(", "))}"></label>
      <label>Adres (EN; puste = tłumaczony automatycznie) <input name="address_en" value="${escapeAttr(apt.address_en || "")}"></label>
      <label class="check"><input type="checkbox" name="hidden" ${apt.hidden ? "checked" : ""}> Ukryj na stronie (apartament znika z listy i wyszukiwarki, ale nie jest usuwany)</label>
      <button type="submit" class="btn btn-primary">Zapisz zmiany</button>
      <p class="save-msg" id="aptSaveMsg"></p>
      ${apt.custom ? `<button type="button" class="btn btn-danger" id="aptDeleteBtn">Usuń ten apartament</button>` : ""}
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
    const prepared = await prepareImage(file);
    fd.append("photo", prepared, prepared.name);
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
      amenities: splitList(fd.get("amenities")),
      description_en: fd.get("description_en"),
      amenities_en: splitList(fd.get("amenities_en")),
      address_en: fd.get("address_en"),
      hidden: fd.get("hidden") === "on",
    };
    const msg = document.getElementById("aptSaveMsg");
    try {
      const updated = await api(`/api/admin/apartments/${apt.id}`, { method: "PUT", body: patch });
      msg.classList.remove("error");
      msg.textContent = "Zapisano.";
      const idx = apartmentsCache.findIndex((a) => a.id === updated.id);
      if (idx !== -1) apartmentsCache[idx] = updated;
      renderApartmentList(apartmentsCache);
    } catch (err){
      msg.classList.add("error");
      msg.textContent = err.message;
    }
  });

  const delBtn = document.getElementById("aptDeleteBtn");
  if (delBtn) delBtn.addEventListener("click", async () => {
    if (!confirm(`Na pewno usunąć apartament „${apt.name}” wraz ze zdjęciami? Tego nie da się cofnąć.`)) return;
    try {
      await api(`/api/admin/apartments/${apt.id}`, { method: "DELETE" });
      apartmentsCache = apartmentsCache.filter((a) => String(a.id) !== String(apt.id));
      renderApartmentList(apartmentsCache);
      document.getElementById("aptEdit").innerHTML = `<p class="hint">Apartament usunięty.</p>`;
    } catch (err){
      document.getElementById("aptSaveMsg").textContent = err.message;
    }
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
      <h3 class="subhead">Wersja angielska (EN)</h3>
      <label>Nazwa (EN) <input name="name_en" value="${escapeAttr(item.name_en || "")}"></label>
      <label>Krótki opis (EN) <textarea name="shortDesc_en">${escapeHtml(item.shortDesc_en || "")}</textarea></label>
      <label>Pełny opis (EN) <textarea name="longDesc_en" rows="6">${escapeHtml(item.longDesc_en || "")}</textarea></label>
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
    const prepared = await prepareImage(file);
    fd.append("photo", prepared, prepared.name);
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
      name_en: fd.get("name_en"),
      shortDesc_en: fd.get("shortDesc_en"),
      longDesc_en: fd.get("longDesc_en"),
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
        <h3 class="subhead">Wersja angielska (EN)</h3>
        ${slug === "sniadania" ? `<label>Godziny dostawy (EN) <input name="hours_en" value="${escapeAttr(page.hours_en || "")}"></label>` : ""}
        <label>Cena (EN) <input name="price_en" value="${escapeAttr(page.price_en || "")}"></label>
        <label>Opis (EN) <textarea name="description_en" rows="5">${escapeHtml(page.description_en || "")}</textarea></label>
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
      const prepared = await prepareImage(file);
    fd.append("photo", prepared, prepared.name);
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
/* Zmniejsza zdjęcie przed wysłaniem (maks. 2000 px dłuższego boku, JPEG) — strona ładuje się szybciej,
   a dysk na hostingu nie zapełnia się wielkimi plikami z telefonu. GIF i błędy → wysyłamy oryginał. */
async function prepareImage(file){
  try {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
    const bmp = await createImageBitmap(file);
    const MAX = 2000;
    const scale = Math.min(1, MAX / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.type === "image/jpeg" && file.size < 1.5 * 1024 * 1024) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.85));
    if (!blob || blob.size >= file.size && scale === 1) return file;
    return new File([blob], (file.name || "zdjecie").replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch (e) {
    return file;
  }
}

function splitList(v){
  return String(v || "").split(",").map((s) => s.trim()).filter(Boolean);
}

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
