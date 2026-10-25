const express = require("express");
const store = require("../../store");
const { requireAuth } = require("../../auth");
const { makeUploader, toPublicUrl } = require("../../upload");

const router = express.Router();
const upload = makeUploader(req => `pages/${req.params.slug}`);

router.use(requireAuth);

router.get("/:slug", (req, res) => {
  const page = store.getPage(req.params.slug);
  if (!page) return res.status(404).json({ error: "Nie znaleziono strony." });
  res.json(page);
});

router.put("/:slug", (req, res) => {
  const allowed = ["title", "location", "price", "hours", "description"];
  const patch = {};
  for (const key of allowed){
    if (key in req.body) patch[key] = req.body[key];
  }
  const updated = store.updatePage(req.params.slug, patch);
  if (!updated) return res.status(404).json({ error: "Nie znaleziono strony." });
  res.json(updated);
});

router.post("/:slug/photos", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Brak pliku." });
  const url = toPublicUrl(req.file.path);
  const updated = store.addPagePhoto(req.params.slug, url);
  if (!updated) return res.status(404).json({ error: "Nie znaleziono strony." });
  res.json(updated);
});

router.delete("/:slug/photos", (req, res) => {
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: "Brak pola url." });
  const updated = store.removePagePhoto(req.params.slug, url);
  if (!updated) return res.status(404).json({ error: "Nie znaleziono strony." });
  res.json(updated);
});

module.exports = router;
