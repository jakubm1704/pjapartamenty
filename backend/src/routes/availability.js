const express = require("express");
const { fetchAvailability } = require("../previoClient");

const router = express.Router();

// GET /api/availability?checkin=YYYY-MM-DD&checkout=YYYY-MM-DD&guests=2
router.get("/", async (req, res) => {
  const { checkin, checkout, guests } = req.query;
  if (!checkin || !checkout){
    return res.status(400).json({ error: "Parametry checkin i checkout są wymagane." });
  }
  try {
    // Dostępność zmienia się często, więc celowo NIE cache'ujemy tego
    // zapytania tak długo jak listy apartamentów.
    const availability = await fetchAvailability({ checkin, checkout, guests });
    res.json(availability);
  } catch (err) {
    console.error("[/api/availability] błąd:", err.message);
    res.status(502).json({ error: "Nie udało się pobrać dostępności z PREVIO." });
  }
});

module.exports = router;
