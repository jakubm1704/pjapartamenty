// Logowanie do panelu administracyjnego.
//
// Jest tylko JEDNO konto administratora, którego dane logowania
// ustawiasz w pliku .env (patrz .env.example):
//   ADMIN_USERNAME=...
//   ADMIN_PASSWORD_HASH=... (hash bcrypt, NIE wpisuj tu hasła jawnym tekstem)
//
// Hash hasła wygenerujesz poleceniem:
//   node scripts/hash-password.js "TwojeNoweHaslo123"

const bcrypt = require("bcryptjs");

// Hasło można podać na dwa sposoby (wystarczy jeden):
//  1) ADMIN_PASSWORD_HASH — gotowy hash bcrypt (najbezpieczniej, wymaga Terminala do wygenerowania),
//  2) ADMIN_PASSWORD — zwykłe hasło wpisane w ustawieniach hostingu (Variables). Serwer sam zamienia je
//     na hash w pamięci; nie jest nigdzie zapisywane ani wyświetlane. Minimum 10 znaków.
let cachedHash = null;
function expectedHash(){
  if (process.env.ADMIN_PASSWORD_HASH) return process.env.ADMIN_PASSWORD_HASH;
  const plain = process.env.ADMIN_PASSWORD;
  if (plain && plain.length >= 10){
    if (!cachedHash) cachedHash = bcrypt.hashSync(plain, 12);
    return cachedHash;
  }
  return null;
}

function checkCredentials(username, password){
  const expectedUser = process.env.ADMIN_USERNAME;
  const hash = expectedHash();
  if (!expectedUser || !hash) return false;
  // zawsze porównujemy hasło (stały czas), żeby nie zdradzać, czy login był poprawny
  const passOk = bcrypt.compareSync(String(password), hash);
  return passOk && String(username) === expectedUser;
}

// Middleware chroniący endpointy administracyjne — wymaga zalogowanej sesji.
function requireAuth(req, res, next){
  if (req.session && req.session.isAdmin){
    return next();
  }
  return res.status(401).json({ error: "Wymagane zalogowanie." });
}

module.exports = { checkCredentials, requireAuth };
