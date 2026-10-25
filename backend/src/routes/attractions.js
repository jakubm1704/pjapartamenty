const express = require("express");
const store = require("../store");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(store.getAttractions());
});

router.get("/:id", (req, res) => {
  const item = store.getAttraction(req.params.id);
  if (!item) return res.status(404).json({ error: "Nie znaleziono atrakcji." });
  res.json(item);
});

module.exports = router;
