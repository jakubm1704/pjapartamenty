// Pomocnicze funkcje bezpieczeństwa serwera.
const path = require("path");

// Czy ścieżka z żądania prowadzi do plików, które NIE mogą być publiczne
// (kod backendu, pliki README, package.json). Ścieżkę najpierw dekodujemy
// i normalizujemy, żeby nie dało się jej obejść zapisem typu /%62ackend/…, //backend/… czy /./backend/….
function isBlockedPath(rawPath){
  let p = String(rawPath || "");
  for (let i = 0; i < 3; i++){            // dekodowanie (także podwójne kodowanie)
    try { const d = decodeURIComponent(p); if (d === p) break; p = d; } catch (e) { return true; }
  }
  if (p.includes("\0") || p.includes("\\")) return true;
  p = path.posix.normalize("/" + p).toLowerCase().replace(/\/{2,}/g, "/");
  if (p === "/backend" || p.startsWith("/backend/")) return true;
  if (/\.(md|py|log|env|map)$/.test(p)) return true;
  if (/\/package(-lock)?\.json$/.test(p)) return true;
  if (/\/(render\.yaml|nixpacks\.toml|dockerfile|procfile)$/.test(p)) return true;
  if (p.split("/").some((seg) => seg.startsWith(".") && seg !== "." && seg !== "..")) return true;
  return false;
}

module.exports = { isBlockedPath };
