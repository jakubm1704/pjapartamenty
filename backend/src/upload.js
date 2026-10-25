// Konfiguracja przyjmowania plików (zdjęć) przez multer.
// Pliki trafiają na dysk do backend/uploads/<typ>/<id>/, a backend
// udostępnia ten folder pod adresem /uploads (patrz server.js).

const fs = require("fs");
const path = require("path");
const multer = require("multer");

const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MIME_EXT = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

/**
 * Tworzy middleware multera zapisujący pliki do
 * backend/uploads/<subdir>/, gdzie <subdir> liczy funkcja subdirFn(req).
 */
function makeUploader(subdirFn){
  const storage = multer.diskStorage({
    destination(req, file, cb){
      const requested = path.join(UPLOADS_ROOT, subdirFn(req));
      const dir = path.resolve(requested);
      // Zabezpieczenie przed path traversal (np. id/slug zawierające "..").
      if (!dir.startsWith(path.resolve(UPLOADS_ROOT) + path.sep)){
        return cb(new Error("Nieprawidłowa ścieżka docelowa."));
      }
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename(req, file, cb){
      // UWAGA BEZPIECZEŃSTWA: rozszerzenie pliku bierzemy WYŁĄCZNIE
      // z rozpoznanego typu MIME (whitelist), nigdy z nazwy pliku
      // podanej przez użytkownika — inaczej ktoś mógłby przemycić
      // złośliwą nazwę pliku (np. z HTML/JS w "rozszerzeniu").
      const ext = MIME_EXT[file.mimetype] || ".jpg";
      const stamp = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, stamp + ext);
    },
  });

  return multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter(req, file, cb){
      if (!ALLOWED_MIME.has(file.mimetype)){
        return cb(new Error("Dozwolone są tylko pliki JPG, PNG, WEBP lub GIF."));
      }
      cb(null, true);
    },
  });
}

/** Zamienia ścieżkę pliku na dysku na publiczny adres URL pod /uploads/... */
function toPublicUrl(absPath){
  const rel = path.relative(UPLOADS_ROOT, absPath).split(path.sep).join("/");
  return "/uploads/" + rel;
}

module.exports = { makeUploader, toPublicUrl, UPLOADS_ROOT };
