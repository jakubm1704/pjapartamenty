const express = require("express");
const store = require("../store");

const router = express.Router();

// GET /api/pages/parking, GET /api/pages/sniadania
router.get("/:slug", (req, res) => {
  const page = store.getPage(req.params.slug);
  if (!page) return res.status(404).json({ error: "Nie znaleziono strony." });
  res.json(page);
});

module.exports = router;
