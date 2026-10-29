const express = require("express");
const { checkCredentials } = require("../../auth");

const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password){
    return res.status(400).json({ error: "Podaj login i hasło." });
  }
  if (!checkCredentials(username, password)){
    return res.status(401).json({ error: "Nieprawidłowy login lub hasło." });
  }
  // Nowy identyfikator sesji po zalogowaniu (ochrona przed „session fixation”).
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: "Nie udało się zalogować. Spróbuj ponownie." });
    req.session.isAdmin = true;
    req.session.username = username;
    res.json({ ok: true, username });
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get("/me", (req, res) => {
  if (req.session && req.session.isAdmin){
    return res.json({ loggedIn: true, username: req.session.username });
  }
  res.json({ loggedIn: false });
});

module.exports = router;
