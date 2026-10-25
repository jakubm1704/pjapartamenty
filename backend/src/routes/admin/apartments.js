const express = require("express");
const store = require("../../store");
const { requireAuth } = require("../../auth");
const { makeUploader, toPublicUrl } = require("../../upload");

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
  if ("amenities" in b && Array.isArray(b.amenities)) patch.amenities = b.amenities.map(String);
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

  const updated = store.updateApartment(req.params.id, patch);
  res.json(updated);
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
