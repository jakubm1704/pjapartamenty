// Bardzo prosta „baza danych” backendu — jeden plik JSON na dysku.
// Wystarczająca dla jednego obiektu i pojedynczego administratora;
// przy większej skali warto zastąpić prawdziwą bazą (np. SQLite/Postgres),
// ale do zarządzania 90 apartamentami i kilkoma podstronami to
// rozwiązanie jest proste, przenośne i nie wymaga instalowania
// żadnego serwera bazodanowego.

const fs = require("fs");
const path = require("path");
const { buildSeedContent, generateApartments, apartmentsDataVersion } = require("./seed");

// DATA_DIR (zmienna środowiskowa) pozwala trzymać dane i zdjęcia na jednym, trwałym dysku hostingu.
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "content.json");

let migrationChecked = false;

// Gdy zmieni się lista apartamentów w js/config-data.js (nowa wersja danych),
// odświeżamy ją w bazie. Przy tym ZACHOWUJEMY:
//  - zdjęcia wgrane przez panel /admin,
//  - apartamenty edytowane w panelu (flaga edited) — razem z ich zmianami,
//  - apartamenty dodane w panelu (flaga custom).
// Brakujące angielskie teksty (atrakcje, Parking, Śniadania) są uzupełniane
// domyślnymi. Wykonywane raz na start serwera.
function migrateApartmentsIfNeeded(){
  migrationChecked = true;
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  const version = apartmentsDataVersion();
  if (data.apartmentsVersion === version) return;

  const existing = data.apartments || [];
  const byId = new Map(existing.map((a) => [String(a.id), a]));
  const realImages = (apt) => (apt && apt.images ? apt.images.filter((u) => !/^data:/i.test(u)) : []);

  const merged = [];
  for (const fresh of generateApartments()){
    const old = byId.get(String(fresh.id));
    byId.delete(String(fresh.id));
    if (old && old.edited){
      merged.push({ ...fresh, ...old });                       // zmiany z panelu wygrywają
    } else {
      merged.push({ ...fresh, images: realImages(old), ...(old && old.hidden ? { hidden: true } : {}) });
    }
  }
  for (const old of byId.values()){
    if (old.custom) merged.push(old);                          // apartamenty dodane w panelu
  }
  data.apartments = merged;

  // Angielskie teksty atrakcji i podstron — tylko tam, gdzie ich jeszcze nie ma.
  const seed = buildSeedContent();
  data.attractions = (data.attractions || []).map((a) => {
    const def = seed.attractions.find((x) => x.id === a.id) || {};
    return { ...a, name_en: a.name_en || def.name_en, shortDesc_en: a.shortDesc_en || def.shortDesc_en, longDesc_en: a.longDesc_en || def.longDesc_en };
  });
  for (const slug of Object.keys(data.pages || {})){
    const def = (seed.pages && seed.pages[slug]) || {};
    data.pages[slug] = { ...data.pages[slug], price_en: data.pages[slug].price_en || def.price_en, description_en: data.pages[slug].description_en || def.description_en };
  }
  // Poprawka domyślnego początku opisu Parkingu (jeśli nie był zmieniany ręcznie w panelu).
  const parking = data.pages && data.pages.parking;
  if (parking){
    const swap = (txt, from, to) => (typeof txt === "string" && txt.startsWith(from)) ? to + txt.slice(from.length) : txt;
    parking.description = swap(parking.description, "Dla gości naszych apartamentów przy Starym Mieście oferujemy", "Dla gości mieszkających w naszych apartamentach na Starym Mieście oferujemy");
    parking.description_en = swap(parking.description_en, "For guests of our apartments in the Old Town we offer", "For guests staying in our Old Town apartments we offer");
  }

  data.apartmentsVersion = version;
  writeAll(data);
  console.log(`[store] Zaktualizowano listę apartamentów do wersji ${version} (${data.apartments.length} apartamentów).`);
}

function ensureSeed(){
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)){
    fs.writeFileSync(DATA_FILE, JSON.stringify(buildSeedContent(), null, 2), "utf-8");
    migrationChecked = true;
  } else if (!migrationChecked){
    migrateApartmentsIfNeeded();
  }
}

function readAll(){
  ensureSeed();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

// Zapis „atomowy”: najpierw plik tymczasowy, potem podmiana — awaria w trakcie zapisu nie uszkodzi bazy.
function writeAll(data){
  const tmp = DATA_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmp, DATA_FILE);
}

// --- Apartamenty ---
function getApartments(){ return readAll().apartments; }
function getApartment(id){ return getApartments().find(a => String(a.id) === String(id)); }
function updateApartment(id, patch){
  const data = readAll();
  const idx = data.apartments.findIndex(a => String(a.id) === String(id));
  if (idx === -1) return null;
  data.apartments[idx] = { ...data.apartments[idx], ...patch, id: data.apartments[idx].id };
  writeAll(data);
  return data.apartments[idx];
}
function createApartment(apt){
  const data = readAll();
  data.apartments.push(apt);
  writeAll(data);
  return apt;
}
function deleteApartment(id){
  const data = readAll();
  const idx = data.apartments.findIndex(a => String(a.id) === String(id));
  if (idx === -1) return null;
  const [removed] = data.apartments.splice(idx, 1);
  writeAll(data);
  return removed;
}
function addApartmentPhoto(id, url){
  const data = readAll();
  const idx = data.apartments.findIndex(a => String(a.id) === String(id));
  if (idx === -1) return null;
  data.apartments[idx].images = [...(data.apartments[idx].images || []), url];
  writeAll(data);
  return data.apartments[idx];
}
function removeApartmentPhoto(id, url){
  const data = readAll();
  const idx = data.apartments.findIndex(a => String(a.id) === String(id));
  if (idx === -1) return null;
  data.apartments[idx].images = (data.apartments[idx].images || []).filter(u => u !== url);
  writeAll(data);
  return data.apartments[idx];
}

// --- Atrakcje ---
function getAttractions(){ return readAll().attractions; }
function getAttraction(id){ return getAttractions().find(a => String(a.id) === String(id)); }
function updateAttraction(id, patch){
  const data = readAll();
  const idx = data.attractions.findIndex(a => String(a.id) === String(id));
  if (idx === -1) return null;
  data.attractions[idx] = { ...data.attractions[idx], ...patch, id: data.attractions[idx].id };
  writeAll(data);
  return data.attractions[idx];
}
function addAttractionPhoto(id, url){
  const data = readAll();
  const idx = data.attractions.findIndex(a => String(a.id) === String(id));
  if (idx === -1) return null;
  data.attractions[idx].images = [...(data.attractions[idx].images || []), url];
  if (!data.attractions[idx].image) data.attractions[idx].image = url;
  writeAll(data);
  return data.attractions[idx];
}
function removeAttractionPhoto(id, url){
  const data = readAll();
  const idx = data.attractions.findIndex(a => String(a.id) === String(id));
  if (idx === -1) return null;
  data.attractions[idx].images = (data.attractions[idx].images || []).filter(u => u !== url);
  if (data.attractions[idx].image === url){
    data.attractions[idx].image = data.attractions[idx].images[0] || "";
  }
  writeAll(data);
  return data.attractions[idx];
}

// --- Strony (Parking, Śniadania) ---
function getPage(slug){ return readAll().pages[slug] || null; }
function updatePage(slug, patch){
  const data = readAll();
  if (!data.pages[slug]) return null;
  data.pages[slug] = { ...data.pages[slug], ...patch };
  writeAll(data);
  return data.pages[slug];
}
function addPagePhoto(slug, url){
  const data = readAll();
  if (!data.pages[slug]) return null;
  data.pages[slug].images = [...(data.pages[slug].images || []), url];
  writeAll(data);
  return data.pages[slug];
}
function removePagePhoto(slug, url){
  const data = readAll();
  if (!data.pages[slug]) return null;
  data.pages[slug].images = (data.pages[slug].images || []).filter(u => u !== url);
  writeAll(data);
  return data.pages[slug];
}

module.exports = {
  DATA_FILE, readAll, writeAll,
  getApartments, getApartment, updateApartment, createApartment, deleteApartment, addApartmentPhoto, removeApartmentPhoto,
  getAttractions, getAttraction, updateAttraction, addAttractionPhoto, removeAttractionPhoto,
  getPage, updatePage, addPagePhoto, removePagePhoto,
};
