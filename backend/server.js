require("dotenv").config();
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const apartmentsRouter = require("./src/routes/apartments");
const attractionsRouter = require("./src/routes/attractions");
const pagesRouter = require("./src/routes/pages");
const availabilityRouter = require("./src/routes/availability");

const adminAuthRouter = require("./src/routes/admin/auth");
const adminApartmentsRouter = require("./src/routes/admin/apartments");
const adminAttractionsRouter = require("./src/routes/admin/attractions");
const adminPagesRouter = require("./src/routes/admin/pages");

const { UPLOADS_ROOT } = require("./src/upload");
const { attachApartmentPages } = require("./src/apartmentPages");
const { isBlockedPath } = require("./src/security");
const { requireAuth } = require("./src/auth");
const store = require("./src/store");

// Kompresja odpowiedzi (szybsza strona = lepsze SEO). Pakiet opcjonalny — brak nie przeszkadza.
let compression = null;
try { compression = require("compression"); } catch (e) { /* brak pakietu — pomijamy */ }

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === "production";

// Gdy backend stoi za reverse proxy (nginx, load balancer z HTTPS) —
// potrzebne, żeby bezpieczne (secure) ciasteczka sesji działały poprawnie.
app.set("trust proxy", 1);

// Bez SESSION_SECRET generujemy losowy klucz przy każdym starcie (bezpieczne, ale po restarcie
// serwera trzeba zalogować się do /admin ponownie). Własny, stały klucz ustaw w zmiennych hostingu.
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
if (!process.env.SESSION_SECRET){
  console.warn("[server] Brak SESSION_SECRET — użyto losowego klucza (po każdym restarcie trzeba zalogować się ponownie).");
}
if (!process.env.ADMIN_PASSWORD_HASH && !(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 10)){
  console.warn("[server] UWAGA: nie ustawiono ADMIN_PASSWORD (min. 10 znaków) ani ADMIN_PASSWORD_HASH — logowanie do /admin jest wyłączone.");
}
if (IS_PROD && !process.env.DATA_DIR){
  console.warn("[server] UWAGA: NODE_ENV=production bez DATA_DIR — zdjęcia i zmiany z /admin mogą zniknąć przy każdym wdrożeniu. Podłącz trwały dysk i ustaw DATA_DIR.");
}

// W produkcji wymuszamy HTTPS (hosting kończy TLS i przekazuje nagłówek x-forwarded-proto).
if (IS_PROD){
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] === "http" && req.path !== "/api/health"){
      return res.redirect(301, "https://" + req.headers.host + req.originalUrl);
    }
    next();
  });
}
if (compression) app.use(compression());

// Panel i API nie mają trafiać do Google.
app.use(["/admin", "/api"], (req, res, next) => { res.setHeader("X-Robots-Tag", "noindex, nofollow"); next(); });
// Wersja testowa: NOINDEX=true wyłącza indeksowanie CAŁEJ strony (żeby testowy adres nie trafił do Google).
// Przy publikacji pod właściwą domeną usuń tę zmienną.
if (process.env.NOINDEX === "true"){
  app.use((req, res, next) => { res.setHeader("X-Robots-Tag", "noindex, nofollow"); next(); });
}

app.use(helmet({
  // Własny, prosty CSP nie jest tu włączony domyślnie, bo strona i panel
  // ładują m.in. Google Fonts i mapy Google — żeby uniknąć zablokowania
  // czegoś przez pomyłkę, CSP zostaw wyłączone i skonfiguruj świadomie
  // przy wdrożeniu, jeśli chcesz go używać.
  contentSecurityPolicy: false,
}));

// --- CORS ---
// Endpointy publiczne (/api/apartments, /api/attractions, /api/pages) są
// bezpieczne do udostępnienia szeroko — to tylko odczyt jawnych danych.
app.use(["/api/apartments", "/api/attractions", "/api/pages", "/api/availability"], cors({ origin: "*" }));

// Endpointy administracyjne używają ciasteczka sesji, więc NIGDY nie mogą
// być dostępne z dowolnej domeny (to pozwoliłoby innej stronie odpytywać
// panel w imieniu zalogowanego admina). CORS dla /api/admin włączamy
// TYLKO, gdy jawnie ustawisz ALLOWED_ORIGIN na dokładną domenę front-endu
// (np. gdy front-end stoi na innej domenie niż ten backend). Jeśli
// ALLOWED_ORIGIN nie jest ustawione, zakładamy najbezpieczniejszy wariant:
// front-end i panel /admin są serwowane przez ten sam proces (patrz niżej),
// więc żaden dodatkowy CORS nie jest potrzebny.
if (process.env.ALLOWED_ORIGIN){
  app.use("/api/admin", cors({ origin: process.env.ALLOWED_ORIGIN, credentials: true }));
}

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(session({
  name: "pj_admin_sid",
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: IS_PROD,          // wymaga działającego HTTPS
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 12, // 12 godzin
  },
}));

// --- Ochrona logowania przed brute-force ---
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 10,                   // maks. 10 prób na adres IP w tym oknie
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Zbyt wiele prób logowania. Spróbuj ponownie za kilkanaście minut." },
});
app.use("/api/admin/login", loginLimiter);
// Ogólny limit zapytań do API (ochrona przed zalewaniem serwera).
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 1500, standardHeaders: true, legacyHeaders: false }));

// --- Zdjęcia wgrane przez panel admina ---
app.use("/uploads", express.static(UPLOADS_ROOT, { maxAge: "30d", immutable: true }));

// --- Panel administracyjny (statyczny front-end pod /admin) ---
app.use("/admin", express.static(path.join(__dirname, "public-admin")));

// --- Publiczne API (czyta z lokalnej bazy data/content.json) ---
app.use("/api/apartments", apartmentsRouter);
app.use("/api/attractions", attractionsRouter);
app.use("/api/pages", pagesRouter);
app.use("/api/availability", availabilityRouter); // PREVIO — patrz backend/README.md

// --- API administracyjne (wymaga zalogowania) ---
app.use("/api/admin", adminAuthRouter);
app.use("/api/admin/apartments", adminApartmentsRouter);
app.use("/api/admin/attractions", adminAttractionsRouter);
app.use("/api/admin/pages", adminPagesRouter);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Kopia zapasowa bazy (apartamenty, atrakcje, strony) — pobierana z panelu /admin.
app.get("/api/admin/backup", requireAuth, (req, res) => {
  const stamp = new Date().toISOString().slice(0, 10);
  res.download(store.DATA_FILE, `kopia-zapasowa-content-${stamp}.json`);
});

// --- Blokada dostępu do kodu/danych backendu przez statyczny serwer niżej ---
app.use((req, res, next) => {
  if (isBlockedPath(req.path)) return res.status(404).end();
  next();
});

// Strona główna ma jeden adres: / (PL) i /en/ (EN) — stare /index.html przekierowujemy.
app.get("/index.html", (req, res) => res.redirect(301, "/"));
app.get("/en/index.html", (req, res) => res.redirect(301, "/en/"));

// --- Adresy apartamentów (/florianska-12), sitemap.xml, przekierowanie starych linków ---
// Muszą być PRZED serwowaniem plików statycznych (apartament.html i sitemap.xml
// istnieją też jako zwykłe pliki).
const apartmentPages = attachApartmentPages(app, path.join(__dirname, ".."));

// --- Statyczne pliki właściwej strony (folder nadrzędny) ---
// Dzięki temu jeden proces Node potrafi serwować całą stronę + API +
// panel /admin z jednego, tego samego origin (upraszcza to i CORS,
// i ciasteczka sesji). W produkcji front-end może też stać na osobnym,
// zwykłym hostingu statycznym — wtedy ta linijka jest zbędna, front-end
// łączy się z tym backendem po jego publicznym adresie, a dla panelu
// /admin trzeba ustawić ALLOWED_ORIGIN (patrz wyżej).
app.use(express.static(path.join(__dirname, ".."), {
  dotfiles: "deny",
  setHeaders(res, filePath){
    if (/\.html$/.test(filePath)) res.setHeader("Cache-Control", "no-cache");              // HTML zawsze świeży
    else if (/\.(css|js)$/.test(filePath)) res.setHeader("Cache-Control", "public, max-age=86400");   // ?v=… odświeża po zmianie
    else res.setHeader("Cache-Control", "public, max-age=604800");                          // zdjęcia, logo: 7 dni
  },
}));

// Strona apartamentu pod adresem /<slug> (po plikach statycznych, żeby ich nie przesłaniać).
apartmentPages.mountSlugRoute();

// --- 404 (także dla /en/…) i obsługa błędów ---
app.use((req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "Nie znaleziono." });
  res.status(404);
  const file = path.join(__dirname, "..", "404.html");
  if (fs.existsSync(file)) return res.sendFile(file);
  res.type("text").send("404 — nie znaleziono strony");
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const isApi = req.path.startsWith("/api/");
  let status = err.status || err.statusCode || 500;
  let msg = "Wystąpił błąd serwera.";
  if (err.code === "LIMIT_FILE_SIZE"){ status = 400; msg = "Plik jest za duży (maks. 8 MB)."; }
  else if (err.name === "MulterError" || /Dozwolone są tylko/.test(err.message || "")){ status = 400; msg = err.message; }
  else if (status < 500 && err.message) msg = err.message;
  else console.error("[server] błąd:", err);
  if (isApi) return res.status(status).json({ error: msg });
  res.status(status).type("text").send(msg);
});

app.listen(PORT, () => {
  console.log(`Backend P&J Apartamenty działa na http://localhost:${PORT}`);
  console.log(`Panel administracyjny: http://localhost:${PORT}/admin`);
});
