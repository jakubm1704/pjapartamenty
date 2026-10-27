// Publiczny, tylko-do-odczytu endpoint z listą apartamentów.
// Dane pochodzą z lokalnej bazy (data/content.json), czyli z tego,
// co ustawiono przez panel administracyjny (/admin) — w tym zdjęcia.
//
// (Integracja z PREVIO to osobna, opcjonalna funkcja — patrz
// src/previoClient.js i src/routes/admin/previoSync.js).

const express = require("express");
const store = require("../store");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(store.getApartments());
});

router.get("/:id", (req, res) => {
  const apt = store.getApartment(req.params.id);
  if (!apt) return res.status(404).json({ error: "Nie znaleziono apartamentu." });
  res.json(apt);
});

module.exports = router;
