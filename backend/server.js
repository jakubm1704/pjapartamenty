require("dotenv").config();
const path = require("path");
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

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === "production";

// Gdy backend stoi za reverse proxy (nginx, load balancer z HTTPS) —
// potrzebne, żeby bezpieczne (secure) ciasteczka sesji działały poprawnie.
app.set("trust proxy", 1);

if (!process.env.SESSION_SECRET){
  console.warn(
    "[server] Brak SESSION_SECRET w .env — używam wartości domyślnej, " +
    "NIEBEZPIECZNEJ dla produkcji. Ustaw SESSION_SECRET przed wdrożeniem."
  );
}
if (IS_PROD && (!process.env.SESSION_SECRET || !process.env.ADMIN_PASSWORD_HASH)){
  console.warn(
    "[server] UWAGA: NODE_ENV=production, ale SESSION_SECRET lub " +
    "ADMIN_PASSWORD_HASH nie są ustawione w .env. Panel /admin nie będzie bezpieczny."
  );
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
  secret: process.env.SESSION_SECRET || "dev-only-insecure-secret-zmien-mnie",
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

// --- Zdjęcia wgrane przez panel admina ---
app.use("/uploads", express.static(UPLOADS_ROOT));

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

// --- Blokada dostępu do kodu/danych backendu przez statyczny serwer niżej ---
app.use((req, res, next) => {
  if (req.path.startsWith("/backend")) return res.status(404).end();
  next();
});

// --- Statyczne pliki właściwej strony (folder nadrzędny) ---
// Dzięki temu jeden proces Node potrafi serwować całą stronę + API +
// panel /admin z jednego, tego samego origin (upraszcza to i CORS,
// i ciasteczka sesji). W produkcji front-end może też stać na osobnym,
// zwykłym hostingu statycznym — wtedy ta linijka jest zbędna, front-end
// łączy się z tym backendem po jego publicznym adresie, a dla panelu
// /admin trzeba ustawić ALLOWED_ORIGIN (patrz wyżej).
app.use(express.static(path.join(__dirname, ".."), { dotfiles: "deny" }));

app.listen(PORT, () => {
  console.log(`Backend P&J Apartamenty działa na http://localhost:${PORT}`);
  console.log(`Panel administracyjny: http://localhost:${PORT}/admin`);
});
