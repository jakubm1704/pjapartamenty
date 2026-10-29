const express = require("express");
const store = require("../../store");
const { requireAuth } = require("../../auth");
const { makeUploader, toPublicUrl } = require("../../upload");

const router = express.Router();
const upload = makeUploader(req => `attractions/${req.params.id}`);

router.use(requireAuth);

router.get("/", (req, res) => {
  res.json(store.getAttractions());
});

router.get("/:id", (req, res) => {
  const item = store.getAttraction(req.params.id);
  if (!item) return res.status(404).json({ error: "Nie znaleziono atrakcji." });
  res.json(item);
});

router.put("/:id", (req, res) => {
  const allowed = ["name", "area", "shortDesc", "longDesc", "name_en", "shortDesc_en", "longDesc_en"];
  const patch = {};
  for (const key of allowed){
    if (key in req.body) patch[key] = req.body[key];
  }
  const updated = store.updateAttraction(req.params.id, patch);
  if (!updated) return res.status(404).json({ error: "Nie znaleziono atrakcji." });
  res.json(updated);
});

router.post("/:id/photos", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Brak pliku." });
  const url = toPublicUrl(req.file.path);
  const updated = store.addAttractionPhoto(req.params.id, url);
  if (!updated) return res.status(404).json({ error: "Nie znaleziono atrakcji." });
  res.json(updated);
});

router.delete("/:id/photos", (req, res) => {
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: "Brak pola url." });
  const updated = store.removeAttractionPhoto(req.params.id, url);
  if (!updated) return res.status(404).json({ error: "Nie znaleziono atrakcji." });
  res.json(updated);
});

module.exports = router;
