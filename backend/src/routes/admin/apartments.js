const express = require("express");
const store = require("../../store");
const { requireAuth } = require("../../auth");
const { makeUploader, toPublicUrl } = require("../../upload");
const shared = require("../../../../js/config-data.js");   // buildApartment, slugify — ta sama logika co na stronie

const router = express.Router();
const upload = makeUploader(req => `apartments/${req.params.id}`);

router.use(requireAuth);

router.get("/", (req, res) => {
  res.json(store.getApartments());
});

router.get("/:id", (req, res) => {
  const apt = store.getApartment(req.params.id);
  if (!apt) return res.status(404).json({ error: "Nie znaleziono apartamentu." });
  res.json(apt);
});

function categoryFromBedrooms(bedrooms){
  return bedrooms === 0 ? "studio" : bedrooms === 1 ? "1-sypialnia" : bedrooms === 2 ? "2-sypialnie" : "3-plus";
}
const toIntOrNull = (v) => (v === "" || v === null || v === undefined || Number.isNaN(Number(v))) ? null : Math.round(Number(v));
const toCount = (v) => Math.max(0, toIntOrNull(v) || 0);

// Edycja pól tekstowych/liczbowych apartamentu (nie zdjęć — te mają
// osobne endpointy niżej). Adres URL (slug) celowo NIE jest edytowalny —
// zmiana nazwy nie zmienia linku, więc nie psuje pozycji w Google.
router.put("/:id", (req, res) => {
  const b = req.body || {};
  const patch = {};
  if ("name" in b){
    const name = String(b.name).trim();
    if (!name) return res.status(400).json({ error: "Nazwa nie może być pusta." });
    patch.name = name;
  }
  if ("address" in b) patch.address = String(b.address);
  if ("description" in b) patch.description = String(b.description);
  if ("address_en" in b) patch.address_en = String(b.address_en);
  if ("description_en" in b) patch.description_en = String(b.description_en);
  if ("amenities" in b && Array.isArray(b.amenities)) patch.amenities = b.amenities.map(String);
  if ("amenities_en" in b && Array.isArray(b.amenities_en)) patch.amenities_en = b.amenities_en.map(String);
  if ("hidden" in b) patch.hidden = !!b.hidden;
  if ("floor" in b) patch.floor = toIntOrNull(b.floor);
  if ("area" in b) { const a = toIntOrNull(b.area); patch.area = a && a > 0 ? a : null; }

  const current = store.getApartment(req.params.id);
  if (!current) return res.status(404).json({ error: "Nie znaleziono apartamentu." });

  // Pola zależne liczymy po stronie serwera, żeby dane były spójne.
  if ("bedrooms" in b){
    patch.bedrooms = toCount(b.bedrooms);
    patch.category = categoryFromBedrooms(patch.bedrooms);
  }
  if ("guests" in b){
    patch.guests = toCount(b.guests);
    patch.capacity = patch.guests;   // optymalna liczba osób = pojemność
  }
  if (b.beds && typeof b.beds === "object"){
    patch.beds = {
      double: toCount(b.beds.double), single: toCount(b.beds.single),
      sofaBed: toCount(b.beds.sofaBed), sofa: toCount(b.beds.sofa),
    };
  }

  patch.edited = true;   // zmiana z panelu — migracja danych jej nie nadpisze
  const updated = store.updateApartment(req.params.id, patch);
  res.json(updated);
});

// Nazwy, które nie mogą zostać adresem apartamentu (kolidują ze stronami/folderami).
const RESERVED_SLUGS = new Set(["admin", "api", "en", "css", "js", "assets", "uploads", "backend", "index", "sitemap",
  "robots", "apartamenty", "apartament", "rezerwacja", "kontakt", "okolica", "atrakcja", "parking", "sniadania",
  "transfery", "wycieczki", "regulamin", "polityka-prywatnosci"]);

// Dodanie nowego apartamentu. ID = ID pokoju w PREVIO (liczba, unikalna) — wg niego
// przycisk „Zarezerwuj” otwiera właściwy apartament w silniku rezerwacji.
router.post("/", (req, res) => {
  const b = req.body || {};
  const id = Number(b.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "ID z PREVIO musi być liczbą całkowitą (np. 921439)." });
  if (store.getApartment(id)) return res.status(409).json({ error: "Apartament o takim ID już istnieje." });
  const name = String(b.name || "").trim();
  if (!name) return res.status(400).json({ error: "Podaj nazwę apartamentu." });

  let slug = shared.slugify(name);
  if (!slug || RESERVED_SLUGS.has(slug)) return res.status(400).json({ error: "Ta nazwa nie może być użyta jako adres strony — wybierz inną." });
  const slugs = new Set(store.getApartments().map((a) => a.slug));
  const base = slug;
  for (let n = 2; slugs.has(slug); n++) slug = `${base}-${n}`;

  const flag = (v) => (v ? 1 : 0);
  const base_apt = shared.buildApartment([
    id, name, toCount(b.bedrooms), toIntOrNull(b.floor),
    flag(b.ac), flag(b.washer), flag(b.bath), flag(b.balcony),
    toCount(b.bedDouble), toCount(b.bedSingle), toCount(b.bedSofaBed), toCount(b.bedSofa),
    (toIntOrNull(b.area) > 0 ? toIntOrNull(b.area) : null), toCount(b.guests),
  ]);
  const apt = { ...base_apt, slug, custom: true, edited: true, images: [] };
  if (b.address && String(b.address).trim()) apt.address = String(b.address).trim();
  if (b.description && String(b.description).trim()) apt.description = String(b.description).trim();
  if (b.description_en && String(b.description_en).trim()) apt.description_en = String(b.description_en).trim();
  res.status(201).json(store.createApartment(apt));
});

// Usunięcie — tylko apartamentów dodanych w panelu. Apartamenty z listy startowej
// można ukryć (pole hidden), bo wróciłyby przy następnej aktualizacji danych.
router.delete("/:id", (req, res) => {
  const apt = store.getApartment(req.params.id);
  if (!apt) return res.status(404).json({ error: "Nie znaleziono apartamentu." });
  if (!apt.custom) return res.status(400).json({ error: "Ten apartament pochodzi z listy startowej — zamiast usuwać, zaznacz „Ukryj na stronie”." });
  store.deleteApartment(req.params.id);
  res.json({ ok: true });
});

// Dodanie zdjęcia: multipart/form-data, pole pliku nazwane "photo".
router.post("/:id/photos", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Brak pliku." });
  const url = toPublicUrl(req.file.path);
  const updated = store.addApartmentPhoto(req.params.id, url);
  if (!updated) return res.status(404).json({ error: "Nie znaleziono apartamentu." });
  res.json(updated);
});

// Usunięcie zdjęcia: body { "url": "/uploads/apartments/12/xxxx.jpg" }
router.delete("/:id/photos", (req, res) => {
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: "Brak pola url." });
  const updated = store.removeApartmentPhoto(req.params.id, url);
  if (!updated) return res.status(404).json({ error: "Nie znaleziono apartamentu." });
  res.json(updated);
});

module.exports = router;
