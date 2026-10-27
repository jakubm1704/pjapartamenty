/* =========================================================
   KRAKÓW APARTAMENTY — wspólna logika strony
   ========================================================= */

const ICONS = {
  guests: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M16 14c2.7 0 5 1.6 5 4v1H3v-1c0-2.4 2.3-4 5-4"/><circle cx="8.5" cy="7.5" r="3"/><path d="M14.5 14.2c.5-1.6 2-2.6 3.7-2.6 2.2 0 4 1.7 4 3.8v.8h-3.4"/><circle cx="16" cy="6.8" r="2.3"/></svg>`,
  bed: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7"/><path d="M3 18v2M21 18v2"/><path d="M3 13h18"/><path d="M6 11V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2"/></svg>`,
  area: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 9h3M4 15h3M17 9h3M17 15h3M9 4v3M15 4v3M9 17v3M15 17v3"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21s-7-6.3-7-11.5A7 7 0 0 1 19 9.5C19 14.7 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.4"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.8 21 3 13.2 3 3.7c0-.6.4-1 1-1H8c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12.5l5 5L20 7"/></svg>`,
  studio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 15h18"/><path d="M8 15v5"/></svg>`,
  cat1: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="16" rx="1"/><path d="M12 4v16"/></svg>`,
  cat2: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="16" rx="1"/><path d="M9 4v16M15 4v16"/></svg>`,
  cat3: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="16" rx="1"/><path d="M8 4v16M12 4v16M16 4v16"/></svg>`,
  chevronL: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 5l-7 7 7 7"/></svg>`,
  chevronR: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg>`,
};

const CATEGORY_ICON = { studio: ICONS.studio, "1-sypialnia": ICONS.cat1, "2-sypialnie": ICONS.cat2, "3-plus": ICONS.cat3 };

document.addEventListener("DOMContentLoaded", async () => {
  if (typeof refreshFromBackend === "function"){
    await refreshFromBackend();
  }
  initNavToggle();
  initHeaderScroll();
  wireBookingButtons();
  renderContactInfo();
  renderMapEmbeds();
  initSearchForm();
  initReviews();
  initCategoryGrid();
  initApartmentsPage();
  initApartmentDetailPage();
  initContactForm();
  initTopicGalleries();
  initCarousels();
  initOkolicaPage();
  initAttractionDetailPage();
  initBookingPage();
});

/* ---------- Nawigacja mobilna ---------- */
function initNavToggle(){
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

/* ---------- Nagłówek: zmiana wyglądu po przewinięciu strony ---------- */
function initHeaderScroll(){
  const header = document.querySelector(".site-header");
  if (!header) return;
  const threshold = 48;
  const update = () => {
    header.classList.toggle("scrolled", window.scrollY > threshold);
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
}

/* ---------- Social media i przełącznik języka ---------- */
function wireBookingButtons(){
  document.querySelectorAll("[data-social]").forEach(el => {
    const url = el.dataset.social === "facebook" ? CONFIG.facebookUrl : CONFIG.instagramUrl;
    if (url) el.href = url; else el.hidden = true;
  });
  document.querySelectorAll("[data-lang-en]").forEach(el => {
    if (CONFIG.englishSiteUrl){
      el.href = CONFIG.englishSiteUrl;
    } else {
      el.removeAttribute("href");
      el.setAttribute("aria-disabled", "true");
      el.title = "Wersja angielska — wkrótce";
      el.classList.add("is-disabled");
    }
  });
}

/* ---------- Dane kontaktowe / adres — wstrzykiwane z CONFIG ---------- */
function renderContactInfo(){
  document.querySelectorAll("[data-config='address']").forEach(el => el.textContent = CONFIG.address);
  document.querySelectorAll("[data-config='phone']").forEach(el => {
    el.textContent = CONFIG.phone;
    if (el.tagName === "A") el.href = "tel:" + CONFIG.phoneHref;
  });
  document.querySelectorAll("[data-config='email']").forEach(el => {
    el.textContent = CONFIG.email;
    if (el.tagName === "A") el.href = "mailto:" + CONFIG.email;
  });
  document.querySelectorAll("[data-config='companyName']").forEach(el => el.textContent = CONFIG.companyName);
}

function renderMapEmbeds(){
  // Mapa OpenStreetMap ładuje się od razu. Mapa Google (jeśli ją ustawisz w CONFIG.mapEmbedUrl)
  // zapisuje cookies, więc ładuje się dopiero po kliknięciu „Pokaż mapę”.
  document.querySelectorAll("[data-map-embed]").forEach(iframe => {
    if (!/google\./.test(CONFIG.mapEmbedUrl)){ iframe.src = CONFIG.mapEmbedUrl; return; }
    const frame = iframe.parentElement;
    iframe.style.display = "none";
    const ph = document.createElement("div");
    ph.className = "map-consent";
    ph.innerHTML = '<p>Mapa Google zapisuje na Twoim urządzeniu pliki cookies. Kliknij, aby ją wyświetlić. <a href="polityka-prywatnosci.html#cookies">Więcej informacji</a></p><button type="button" class="btn btn-outline">Pokaż mapę</button>';
    frame.appendChild(ph);
    ph.querySelector("button").addEventListener("click", () => {
      iframe.src = CONFIG.mapEmbedUrl;
      iframe.style.display = "";
      ph.remove();
    });
  });
  document.querySelectorAll("[data-map-link]").forEach(a => {
    a.href = CONFIG.mapLinkUrl;
  });
}

/* ---------- Moduł wyszukiwania (strona główna) ---------- */
function initSearchForm(){
  const form = document.getElementById("searchForm");
  if (!form) return;

  // Sensowne wartości domyślne dla dat (jutro / za 3 dni).
  const checkin = form.querySelector("#checkin");
  const checkout = form.querySelector("#checkout");
  if (checkin && checkout){
    const today = new Date();
    const t1 = new Date(today); t1.setDate(t1.getDate() + 1);
    const t2 = new Date(today); t2.setDate(t2.getDate() + 3);
    checkin.min = toISODate(today);
    checkin.value = toISODate(t1);
    checkout.min = toISODate(t1);
    checkout.value = toISODate(t2);
    checkin.addEventListener("change", () => {
      checkout.min = checkin.value;
      if (checkout.value && checkout.value <= checkin.value){
        const d = new Date(checkin.value); d.setDate(d.getDate() + 1);
        checkout.value = toISODate(d);
      }
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (checkin?.value) params.set("checkin", checkin.value);
    if (checkout?.value) params.set("checkout", checkout.value);
    const guests = form.querySelector("#guests");
    if (guests?.value) params.set("guests", guests.value);
    if (window.pjTrack) pjTrack({ ga: "search", meta: "Search" }, { search_term: "dostepnosc" });
    window.location.href = CONFIG.bookingPage + "?" + params.toString();
  });
}

function toISODate(d){ return d.toISOString().slice(0, 10); }

/* ---------- Moduł kategorii (strona główna) ---------- */
function initCategoryGrid(){
  const grid = document.getElementById("categoryGrid");
  if (!grid) return;
  grid.innerHTML = CATEGORIES.map(c => `
    <a class="category-card" href="apartamenty.html?category=${c.id}">
      <div class="cat-photo">
        <img src="${placeholderImage(c.label, "category-" + c.id)}" alt="Apartament typu ${c.label} w Krakowie" loading="lazy">
      </div>
      <div class="cat-body">
        <span class="cat-icon">${CATEGORY_ICON[c.id]}</span>
        <h3>${c.label}</h3>
        <p class="cat-count">${countByCategory(c.id)} apartamentów</p>
        <p>${c.desc}</p>
        <span class="cat-link">Zobacz apartamenty →</span>
      </div>
    </a>
  `).join("");
}

/* ---------- Strona: Apartamenty (siatka + filtr + paginacja) ---------- */
const PAGE_SIZE = 12;

function initApartmentsPage(){
  const grid = document.getElementById("apartmentsGrid");
  if (!grid) return;

  const filterBar = document.getElementById("filterBar");
  const pagination = document.getElementById("pagination");
  const resultCount = document.getElementById("resultCount");

  const urlParams = new URLSearchParams(window.location.search);
  let activeCategory = urlParams.get("category") || "";
  let currentPage = 1;

  function buildFilterBar(){
    const pills = [{ id: "", label: "Wszystkie" }, ...CATEGORIES];
    filterBar.innerHTML = pills.map(c => `
      <button type="button" class="filter-pill ${activeCategory === c.id ? "active" : ""}" data-cat="${c.id}">
        ${c.label}${c.id ? ` (${countByCategory(c.id)})` : ` (${APARTMENTS.length})`}
      </button>
    `).join("");

    filterBar.querySelectorAll(".filter-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        activeCategory = btn.dataset.cat;
        currentPage = 1;
        const p = new URLSearchParams(window.location.search);
        if (activeCategory) p.set("category", activeCategory); else p.delete("category");
        history.replaceState(null, "", "apartamenty.html" + (p.toString() ? "?" + p.toString() : ""));
        render();
      });
    });
  }

  function getFiltered(){
    return activeCategory ? APARTMENTS.filter(a => a.category === activeCategory) : APARTMENTS;
  }

  function render(){
    buildFilterBar();
    const filtered = getFiltered();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    if (resultCount) resultCount.textContent = `${filtered.length} ${pluralApartments(filtered.length)}`;

    if (pageItems.length === 0){
      grid.innerHTML = `<p class="empty-state">Brak apartamentów w tej kategorii.</p>`;
    } else {
      grid.innerHTML = pageItems.map(apartmentCardHTML).join("");
    }

    renderPagination(totalPages);
  }

  function renderPagination(totalPages){
    if (totalPages <= 1){ pagination.innerHTML = ""; return; }
    let html = `<button class="page-btn" data-page="prev" ${currentPage === 1 ? "disabled" : ""} aria-label="Poprzednia strona">${ICONS.chevronL}</button>`;
    for (let i = 1; i <= totalPages; i++){
      html += `<button class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
    }
    html += `<button class="page-btn" data-page="next" ${currentPage === totalPages ? "disabled" : ""} aria-label="Następna strona">${ICONS.chevronR}</button>`;
    pagination.innerHTML = html;

    pagination.querySelectorAll(".page-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const p = btn.dataset.page;
        if (p === "prev") currentPage -= 1;
        else if (p === "next") currentPage += 1;
        else currentPage = Number(p);
        render();
        grid.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  render();
}

function pluralApartments(n){
  if (n === 1) return "apartament";
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return "apartamenty";
  return "apartamentów";
}

function apartmentCardHTML(a){
  const lastFact = a.area
    ? `<span>${ICONS.area} ${a.area} m²</span>`
    : (floorLabel(a.floor) ? `<span>${ICONS.pin} ${floorLabel(a.floor)}</span>` : "");
  return `
    <a class="apt-card" href="${apartmentUrl(a)}">
      <div class="apt-photo">
        <img src="${apartmentImages(a)[0]}" alt="Apartament ${a.name} w Krakowie na wynajem — ${typeLabel(a.bedrooms)}" loading="lazy">
      </div>
      <div class="apt-body">
        <span class="apt-cat">${typeLabel(a.bedrooms)}</span>
        <h3>${a.name}</h3>
        <p class="apt-addr">${a.address}</p>
        <div class="apt-facts">
          <span>${ICONS.guests} ${a.guests} os.</span>
          <span>${ICONS.bed} ${a.bedrooms === 0 ? "studio" : a.bedrooms + (a.bedrooms === 1 ? " sypialnia" : " sypialnie")}</span>
          ${lastFact}
        </div>
      </div>
    </a>`;
}

/* ---------- Strona: pojedynczy Apartament ---------- */
function initApartmentDetailPage(){
  const root = document.getElementById("apartmentDetail");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  // Adres docelowy to /nazwa-apartamentu (backend serwuje tę stronę pod slugiem);
  // stary adres apartament.html?id=… nadal działa.
  const pathSlug = decodeURIComponent(window.location.pathname).replace(/^\/+|\/+$/g, "");
  const apt = (pathSlug && getApartmentBySlug(pathSlug)) || getApartmentById(params.get("id"));

  if (!apt){
    root.innerHTML = `
      <div class="empty-state">
        <h2>Nie znaleziono apartamentu</h2>
        <p>Ten apartament mógł zostać usunięty lub link jest nieprawidłowy.</p>
        <a class="btn btn-primary" href="apartamenty.html">Wróć do listy apartamentów</a>
      </div>`;
    document.title = "Nie znaleziono apartamentu — P&J Apartamenty";
    return;
  }

  document.title = `${apt.name} — apartament w Krakowie | P&J Apartamenty`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = apt.description;
  document.getElementById("breadcrumbName").textContent = apt.name;

  document.querySelector("#apartmentGallery .carousel-track").innerHTML = apartmentImages(apt).map((src, i) =>
    `<div class="carousel-slide"><img src="${src}" alt="${apt.name} — apartament w Krakowie, zdjęcie ${i + 1}" loading="${i === 0 ? "eager" : "lazy"}"></div>`
  ).join("");

  root.querySelector("[data-field='category']").textContent = typeLabel(apt.bedrooms);
  root.querySelector("[data-field='name']").textContent = apt.name;
  root.querySelector("[data-field='address']").textContent = apt.address;
  root.querySelector("[data-field='description']").textContent = apt.description;

  const quick = document.getElementById("apartmentQuickfacts");
  quick.innerHTML = `
    <span>${ICONS.guests} ${apt.guests} ${apt.guests === 1 ? "osoba" : (apt.guests % 10 >= 2 && apt.guests % 10 <= 4 && !(apt.guests % 100 >= 12 && apt.guests % 100 <= 14) ? "osoby" : "osób")}</span>
    <span>${ICONS.bed} ${apt.bedrooms === 0 ? "Studio" : apt.bedrooms + (apt.bedrooms === 1 ? " sypialnia" : " sypialnie")}</span>
    ${apt.area ? `<span>${ICONS.area} ${apt.area} m²</span>` : ""}
    ${floorLabel(apt.floor) ? `<span>${ICONS.pin} ${floorLabel(apt.floor)}</span>` : ""}`;
  const beds = bedsLabel(apt.beds);
  if (beds) quick.insertAdjacentHTML("afterend", `<p class="apt-beds"><strong>Spanie:</strong> ${beds}</p>`);

  document.getElementById("apartmentAmenities").innerHTML = apt.amenities
    .map(a => `<li>${ICONS.check} ${a}</li>`).join("");

  // Karta rezerwacji — przenosi daty z ewentualnych parametrów URL.
  const checkin = params.get("checkin") || "";
  const checkout = params.get("checkout") || "";
  const factsList = document.getElementById("bookingFacts");
  factsList.innerHTML = `
    <div><dt>Typ</dt><dd>${typeLabel(apt.bedrooms)}</dd></div>
    <div><dt>Liczba osób</dt><dd>${apt.guests}</dd></div>
    ${apt.area ? `<div><dt>Metraż</dt><dd>${apt.area} m²</dd></div>` : ""}
    ${floorLabel(apt.floor) ? `<div><dt>Piętro</dt><dd>${floorLabel(apt.floor)}</dd></div>` : ""}
    ${checkin ? `<div><dt>Przyjazd</dt><dd>${checkin}</dd></div>` : ""}
    ${checkout ? `<div><dt>Wyjazd</dt><dd>${checkout}</dd></div>` : ""}
  `;

  // „Zarezerwuj” → podstrona z silnikiem PREVIO. Parametr apartment = ID apartamentu
  // w PREVIO; rezerwacja.html zamienia go na parametr silnika (showRoomType).
  const bookParams = new URLSearchParams({ apartment: apt.id });
  if (checkin) bookParams.set("checkin", checkin);
  if (checkout) bookParams.set("checkout", checkout);
  const guestsParam = params.get("guests");
  if (guestsParam) bookParams.set("guests", guestsParam);
  document.getElementById("apartmentBookBtn").href = CONFIG.bookingPage + "?" + bookParams.toString();
}

/* ---------- Formularz kontaktowy ---------- */
function initContactForm(){
  const form = document.getElementById("contactForm");
  if (!form) return;
  const success = document.getElementById("contactFormSuccess");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    // UWAGA: to jest zachowanie WYŁĄCZNIE demonstracyjne — formularz nie
    // wysyła jeszcze żadnej wiadomości. Podłącz własny backend / usługę
    // (np. Formspree) w atrybucie action formularza — patrz README.md.
    success.classList.add("show");
    form.reset();
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

/* ---------- Zdjęcie/treść stron Parking / Śniadania ---------- */
function initTopicGalleries(){
  renderPageDetail("parking", "parkingDetail", "parkingPhoto");
  renderPageDetail("sniadania", "sniadaniaDetail", null);
}

function renderPageDetail(slug, rootId, photoId){
  const root = document.getElementById(rootId);
  if (!root) return; // nie jesteśmy na tej stronie — nic do zrobienia

  const page = (typeof PAGES !== "undefined" && PAGES[slug]) || null;

  if (page){
    const setField = (field, value) => {
      const el = root.querySelector(`[data-field="${field}"]`);
      if (el && value) el.textContent = value;
    };
    setField("description", page.description);
    setField("location", page.location);
    setField("price", page.price);
    setField("hours", page.hours);
  }

  if (!photoId) return; // ta strona nie pokazuje już zdjęcia (np. Śniadania)
  const photoEl = document.getElementById(photoId);
  if (!photoEl) return;

  const fallbackLabel = slug === "parking" ? "Parking P&J Apartamenty" : "Śniadanie P&J Apartamenty";
  // Na stronie pokazujemy jedno, główne zdjęcie — pierwsze z listy
  // (kolejne, jeśli są, można wgrać/uporządkować przez panel /admin).
  const mainImage = (page && page.images && page.images.length)
    ? page.images[0]
    : placeholderImage(fallbackLabel, photoId);

  photoEl.src = mainImage;
  photoEl.alt = `${fallbackLabel} — zdjęcie`;
}

function initCarousels(){
  document.querySelectorAll("[data-carousel]").forEach(root => {
    const track = root.querySelector(".carousel-track");
    if (!track) return;
    const slides = Array.from(track.children);
    const prevBtn = root.querySelector(".carousel-prev");
    const nextBtn = root.querySelector(".carousel-next");
    const dotsWrap = root.querySelector(".carousel-dots");

    if (slides.length <= 1){
      if (prevBtn) prevBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";
      if (dotsWrap) dotsWrap.style.display = "none";
      return;
    }

    let index = 0;
    if (dotsWrap){
      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Przejdź do zdjęcia ${i + 1}`);
        if (i === 0) dot.classList.add("active");
        dot.addEventListener("click", () => go(i));
        dotsWrap.appendChild(dot);
      });
    }

    function update(){
      track.style.transform = `translateX(-${index * 100}%)`;
      if (dotsWrap){
        dotsWrap.querySelectorAll("button").forEach((d, i) => d.classList.toggle("active", i === index));
      }
    }
    function go(i){ index = (i + slides.length) % slides.length; update(); }

    if (prevBtn) prevBtn.addEventListener("click", () => go(index - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => go(index + 1));
    update();
  });
}

/* ---------- Strona: Okolica (lista atrakcji, grupowane wg dzielnicy) ---------- */
function initOkolicaPage(){
  const root = document.getElementById("attractionsRoot");
  if (!root || typeof ATTRACTIONS === "undefined") return;

  const areas = ["Stare Miasto", "Kazimierz", "Podgórze"];
  root.innerHTML = areas.map((area, i) => {
    const items = ATTRACTIONS.filter(a => a.area === area);
    if (items.length === 0) return "";
    return `
      <section class="block ${i % 2 === 1 ? "alt" : ""}">
        <div class="container">
          <h2>${area}</h2>
          <p class="lead">${AREA_INTRO[area] || ""}</p>
          <div class="card-grid">
            ${items.map(attractionCardHTML).join("")}
          </div>
        </div>
      </section>`;
  }).join("");
}

function attractionCardHTML(a){
  return `
    <a class="info-card attraction-card" href="atrakcja.html?id=${a.id}">
      <div class="attraction-photo">
        <img src="${a.image}" alt="${a.name} — atrakcja w Krakowie, ${a.area}" loading="lazy">
      </div>
      <h3>${a.name}</h3>
      <p>${a.shortDesc}</p>
      <span class="cat-link">Czytaj więcej →</span>
    </a>`;
}

/* ---------- Strona: pojedyncza Atrakcja ---------- */
function initAttractionDetailPage(){
  const root = document.getElementById("attractionDetail");
  if (!root || typeof ATTRACTIONS === "undefined") return;

  const id = new URLSearchParams(window.location.search).get("id");
  const item = getAttractionById(id);

  if (!item){
    root.innerHTML = `
      <div class="empty-state">
        <h2>Nie znaleziono atrakcji</h2>
        <p>Ten wpis mógł zostać usunięty lub link jest nieprawidłowy.</p>
        <a class="btn btn-primary" href="okolica.html">Wróć do listy atrakcji</a>
      </div>`;
    document.title = "Atrakcja nie znaleziona | P&J Apartamenty";
    return;
  }

  document.title = `${item.name} — co zobaczyć w Krakowie | P&J Apartamenty`;
  document.getElementById("breadcrumbAttractionName").textContent = item.name;

  document.getElementById("attractionGallery").innerHTML = item.images.map((src, i) =>
    `<div><img src="${src}" alt="${item.name} — zdjęcie ${i + 1}" loading="${i === 0 ? "eager" : "lazy"}"></div>`
  ).join("");

  root.querySelector("[data-field='area']").textContent = item.area;
  root.querySelector("[data-field='name']").textContent = item.name;
  root.querySelector("[data-field='longDesc']").textContent = item.longDesc;
}

/* ---------- Strona: Rezerwacja (silnik PREVIO + podsumowanie wyszukiwania) ---------- */
function initBookingPage(){
  if (window.pjTrack && document.getElementById("previo-booking-engine-019e737d-de43-73f9-bd82-cfe2ff8e8e6c")) pjTrack({ ga: "begin_checkout", meta: "InitiateCheckout" }, {});
  const box = document.getElementById("bookingSummary");
  if (!box) return;

  const params = new URLSearchParams(window.location.search);
  const checkin = params.get("checkin");
  const checkout = params.get("checkout");
  const guests = params.get("guests");
  const apt = params.get("apartment") ? getApartmentById(params.get("apartment")) : null;

  // Dane z adresu przekazuje do silnika skrypt w rezerwacja.html (parametry PREVIO).
  // Poniższe podsumowanie to tylko czytelna informacja dla gościa.
  const esc = (v) => String(v).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  const ok = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || "");
  const items = [];
  if (apt) items.push(`<span><b>Apartament:</b> ${esc(apt.name)}</span>`);
  if (ok(checkin)) items.push(`<span><b>Przyjazd:</b> ${esc(checkin)}</span>`);
  if (ok(checkout)) items.push(`<span><b>Wyjazd:</b> ${esc(checkout)}</span>`);
  if (/^\d{1,2}$/.test(guests || "")) items.push(`<span><b>Goście:</b> ${esc(guests)}</span>`);
  if (!items.length) return;

  box.innerHTML = `<p class="booking-summary-title">Twoje wyszukiwanie</p><div>${items.join("")}</div>
    <p class="booking-summary-hint">Jeśli okno rezerwacji poniżej nie uzupełniło ich samo, wpisz te same dane.</p>`;
  box.hidden = false;
}


/* ---------- Opinie Google (strona główna) ---------- */
function initReviews(){
  const section = document.getElementById("reviews");
  const track = document.getElementById("reviewsTrack");
  const list = (typeof CONFIG !== "undefined" && CONFIG.reviews) || [];
  if (!section || !track || !list.length) return;

  const colors = ["#5b4036", "#3b82d1", "#2f7d5b", "#8a4f9e", "#c0652b"];
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
  track.innerHTML = list.map((r, i) => `
    <article class="review-card">
      <div class="review-avatar" style="background:${colors[i % colors.length]}" aria-hidden="true">${esc(r.name.trim().charAt(0).toUpperCase())}</div>
      <p class="review-name">${esc(r.name)}</p>
      <div class="review-stars" role="img" aria-label="Ocena ${r.rating} na 5">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
      <p class="review-text">${esc(r.text)}</p>
      <span class="review-source">Opinia z Google</span>
    </article>`).join("");
  section.hidden = false;

  section.querySelectorAll("[data-reviews-link]").forEach((a) => { a.href = CONFIG.googleReviewsUrl || "#"; });

  const prev = section.querySelector(".reviews-nav.prev");
  const next = section.querySelector(".reviews-nav.next");
  let index = 0;
  const perView = () => (window.innerWidth <= 600 ? 1 : window.innerWidth <= 900 ? 2 : 3);
  function update(){
    const max = Math.max(0, list.length - perView());
    index = Math.min(index, max);
    const card = track.children[0];
    const step = card ? card.getBoundingClientRect().width + 22 : 0;
    track.style.transform = `translateX(${-index * step}px)`;
    prev.disabled = index <= 0; next.disabled = index >= max;
    const hide = max === 0;
    prev.style.display = next.style.display = hide ? "none" : "flex";
  }
  prev.addEventListener("click", () => { index = Math.max(0, index - 1); update(); });
  next.addEventListener("click", () => { index += 1; update(); });
  window.addEventListener("resize", update);
  update();
}
