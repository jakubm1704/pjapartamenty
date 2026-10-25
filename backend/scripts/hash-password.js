// Użycie:  node scripts/hash-password.js "TwojeNoweHaslo123"
// Wypisuje hash, który wklejasz jako ADMIN_PASSWORD_HASH w pliku .env.

const bcrypt = require("bcryptjs");

const password = process.argv[2];
if (!password){
  console.error("Użycie: node scripts/hash-password.js \"TwojeHaslo\"");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log("\nWklej poniższą linię do backend/.env:\n");
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
