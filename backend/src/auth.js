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

function checkCredentials(username, password){
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedUser || !expectedHash) return false;
  if (username !== expectedUser) return false;
  return bcrypt.compareSync(password, expectedHash);
}

// Middleware chroniący endpointy administracyjne — wymaga zalogowanej sesji.
function requireAuth(req, res, next){
  if (req.session && req.session.isAdmin){
    return next();
  }
  return res.status(401).json({ error: "Wymagane zalogowanie." });
}

module.exports = { checkCredentials, requireAuth };
