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
// odświeżamy ją w bazie — zachowując zdjęcia wgrane przez panel /admin
// (dopasowanie po adresie URL apartamentu). Wykonywane raz na start serwera.
function migrateApartmentsIfNeeded(){
  migrationChecked = true;
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  const version = apartmentsDataVersion();
  if (data.apartmentsVersion === version) return;

  const uploaded = new Map();
  for (const apt of data.apartments || []){
    const real = (apt.images || []).filter((u) => !/^data:/i.test(u));
    if (apt.slug && real.length) uploaded.set(apt.slug, real);
  }
  data.apartments = generateApartments().map((apt) => ({ ...apt, images: uploaded.get(apt.slug) || [] }));
  data.apartmentsVersion = version;
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
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

function writeAll(data){
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
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
  readAll, writeAll,
  getApartments, getApartment, updateApartment, addApartmentPhoto, removeApartmentPhoto,
  getAttractions, getAttraction, updateAttraction, addAttractionPhoto, removeAttractionPhoto,
  getPage, updatePage, addPagePhoto, removePagePhoto,
};
