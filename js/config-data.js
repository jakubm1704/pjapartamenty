/* =========================================================
   KONFIGURACJA STRONY + DANE APARTAMENTÓW
   =========================================================
   Lista apartamentów (APARTMENTS_RAW niżej) pochodzi z pliku Excel.
   Zdjęcia apartamentów są na razie placeholderami — prawdziwe wgrasz
   przez panel /admin (backend). Gdy backend działa, dane z panelu
   zastępują te lokalne.
   ========================================================= */

const CONFIG = {
  companyName: "P&J Apartamenty",
  address: "ul. Floriańska 39, 31-019 Kraków",
  addressForMap: "Floriańska 39, Kraków",
  phone: "+48 798 242 424",
  phoneHref: "+48798242424",
  email: "info@apartmentcracow.com",

  // Mapa Google — wersja embed bez klucza API (działa "z pudełka").
  // Mapa OpenStreetMap — wyświetla się od razu, bez plików cookies śledzących (nie wymaga zgody).
  // Mapa Google zapisuje cookies, więc przy jej użyciu mapa ładuje się dopiero po kliknięciu.
  mapEmbedUrl: "https://www.openstreetmap.org/export/embed.html?bbox=19.9368%2C50.0618%2C19.9448%2C50.0658&layer=mapnik&marker=50.0637976%2C19.9408668",
  mapLinkUrl: "https://www.google.com/maps/search/?api=1&query=Flori%C5%84ska+39%2C+Krak%C3%B3w",

  // --- Rezerwacje (silnik PREVIO osadzony na stronie rezerwacja.html) ---
  // Wszystkie przyciski "Zarezerwuj" / "Szukaj dostępności" prowadzą tutaj.
  bookingPage: "rezerwacja.html",

  // Silnik rezerwacji PREVIO — parametr wybierający konkretny apartament.
  // Nazwy parametrów wg dokumentacji PREVIO (help.previo.app): showRoomType,
  // arrival / departure (DD.MM.RRRR), numberOfAdults. Używa ich rezerwacja.html.
  previoRoomParam: "showRoomType",

  // --- Social media i język -----------------------------------------
  // PODMIEŃ na właściwe adresy profili (dziś: strony główne serwisów).
  facebookUrl: "https://www.facebook.com/PJapartments/",
  instagramUrl: "https://www.instagram.com/pj_apartments",
  // Narzędzia analityczne i reklamowe. Wpisz identyfikatory — dopóki są puste, nic się nie ładuje i baner zgody się nie pokazuje.
  tracking: {
    gaMeasurementId: "",   // np. "G-XXXXXXXXXX" (Google Analytics 4)
    metaPixelId: ""        // np. "1234567890123456" (Meta Pixel)
  },
  googleReviewsUrl: "https://maps.app.goo.gl/SQtUV1TEZ6nnmDgn6",
  // Opinie z wizytówki Google. Dodawaj kolejne w tej samej formie: { name, rating (1-5), text }.
  reviews: [
    { name: "Małgorzata Skroban", rating: 5, text: "Apartament przestronny z dużą łazienką, aneksem i antresolą. jedyny minus to czwartek piętro. Obsługa pomocna, po zgłoszeniu awarii klimatyzacji, została on…",
      text_en: "Spacious apartment with a large bathroom, a kitchenette and a mezzanine. The only downside is the fourth floor. Helpful staff — after an air-conditioning fault was reported, it was…" },
    { name: "Tomasz Kulis", rating: 5, text: "Super.", text_en: "Great." },
    { name: "Dominik Gomuła", rating: 5, text: "P&J zapewniło nam mieszkanie „z duszą”, dzięki któremu mogliśmy poczuć się jak rodowici krakowianie. Doświadczyliśmy niezwykłej podróży w…",
      text_en: "P&J gave us an apartment “with soul”, which let us feel like true locals of Kraków. We experienced an extraordinary journey in…" }
  ],
};

/* Język strony: <html lang="en"> w podstronach /en/…, w pozostałych polski. */
const LANG = (typeof document !== "undefined" && document.documentElement && document.documentElement.lang === "en") ? "en" : "pl";

/* Pole w wybranym języku: obj.<pole>_en (jeśli jest) albo polskie obj.<pole>. */
function tr(obj, field, lang){
  lang = lang || LANG;
  if (lang === "en"){
    const v = obj && obj[field + "_en"];
    if (v) return v;
  }
  return obj ? obj[field] : "";
}

// Kategorie apartamentów używane w wyszukiwarce, module kategorii i filtrach.
const CATEGORIES = [
  { id: "studio",  label: "Studio",         label_en: "Studio",        bedrooms: 0, desc: "Otwarta przestrzeń do spania i wypoczynku — idealna dla 1–2 osób.", desc_en: "Open-plan space to sleep and relax — ideal for 1–2 guests." },
  { id: "1-sypialnia", label: "1 sypialnia", label_en: "1 bedroom",    bedrooms: 1, desc: "Osobna sypialnia i salon — komfort dla pary lub małej rodziny.", desc_en: "A separate bedroom and living room — comfort for a couple or a small family." },
  { id: "2-sypialnie",  label: "2 sypialnie", label_en: "2 bedrooms",  bedrooms: 2, desc: "Dwie sypialnie i salon — dobry wybór dla grupy znajomych lub rodziny.", desc_en: "Two bedrooms and a living room — a good choice for a group of friends or a family." },
  { id: "3-plus",       label: "3+ sypialnie", label_en: "3+ bedrooms", bedrooms: 3, desc: "Przestronne apartamenty dla większych grup i dłuższych pobytów.", desc_en: "Spacious apartments for larger groups and longer stays." },
];

function categoryLabel(id, lang){
  const c = CATEGORIES.find(c => c.id === id);
  return c ? tr(c, "label", lang) : id;
}

/* ---------------------------------------------------------
   Generator zdjęć zastępczych (SVG data-URI).
   Brak prawdziwych fotografii apartamentów — każdy placeholder
   dostaje spójny, markowy wygląd (gradient + nazwa apartamentu),
   żeby siatka wyglądała docelowo, ale nic nie udaje realnego zdjęcia.
   Podmień pole `images` w danym apartamencie na prawdziwe adresy
   zdjęć, gdy będą dostępne.
--------------------------------------------------------- */
function hashString(str){
  let h = 0;
  for (let i = 0; i < str.length; i++){ h = (h * 31 + str.charCodeAt(i)) >>> 0; }
  return h;
}

const PLACEHOLDER_PALETTES = [
  ["#C79A16", "#8F700F"],
  ["#7A3B2A", "#54281D"],
  ["#574C39", "#332B1F"],
  ["#241C12", "#3A2F1E"],
];

/* Zdjęcia zapisane jako ścieżka względna (np. „assets/images/x.jpg”) na stronach /en/ trzeba
   cofnąć o folder wyżej. Adresy „/uploads/…”, „http…” i „data:…” zostają bez zmian. */
function assetUrl(u){
  if (LANG !== "en" || !u || /^(\/|[a-z][a-z0-9+.-]*:|\.\.\/)/i.test(u)) return u;
  return "../" + u;
}

function placeholderImage(label, seed){
  const h = hashString(String(seed) + label);
  const [c1, c2] = PLACEHOLDER_PALETTES[h % PLACEHOLDER_PALETTES.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${c1}"/>
          <stop offset="1" stop-color="${c2}"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#g)"/>
      <g opacity="0.16" fill="#FFFDF8">
        <circle cx="120" cy="480" r="180"/>
        <circle cx="700" cy="90" r="140"/>
      </g>
      <text x="50%" y="52%" font-family="Georgia, serif" font-size="34" fill="#FFFDF8"
            text-anchor="middle" dominant-baseline="middle">${label}</text>
      <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="15" letter-spacing="1"
            fill="#FFFDF8" fill-opacity="0.75" text-anchor="middle">${LANG === "en" ? "sample photo" : "zdjęcie przykładowe"}</text>
    </svg>`.trim();
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

/* ---------------------------------------------------------
   APARTAMENTY — realna baza (z pliku Excel „apartamenty.xlsx”).
   Kolejność poniżej = kolejność na stronie. Z listy pominięto
   wszystkie „Grodzka” oraz „Pałac1–Pałac3”.

   Kolumny każdego wiersza:
   [id PREVIO, nazwa, sypialnie (0 = studio), piętro, klimatyzacja, pralka,
    wanna, balkon, łóżka podwójne, łóżka pojedyncze, sofy rozkładane,
    sofy nierozkładane, metraż m² (null = brak danych),
    optymalna liczba osób, (opcjonalnie) własny opis]

   id          — ID apartamentu w PREVIO. To jedno, wspólne ID: jest też ID typu pokoju
                 w silniku rezerwacji (parametr showRoomType) — nie ma osobnego „roomId”.
   Adres URL   — generowany z nazwy: „Floriańska 12” → /florianska-12
--------------------------------------------------------- */
const APARTMENTS_RAW = [
  [947379, "Floriańska Classic 6", 2, 3, 1, 0, 0, 0, 1, 2, 0, 0, 31, 4],
  [947383, "Floriańska Classic 8", 0, 4, 1, 0, 0, 0, 1, 0, 0, 0, null, 2],
  [962099, "Floriańska Top 6", 2, 3, 0, 1, 0, 0, 0, 0, 0, 0, 60, 5],
  [962101, "Floriańska Top 7", 3, 3, 0, 1, 0, 0, 0, 0, 0, 0, 60, 5],
  [906907, "Florianska ZP (Suite I)", 2, 1, 0, 0, 0, 0, 1, 3, 1, 0, 70, 5],
  [906903, "Floriańska Classic 5", 3, 2, 0, 0, 0, 0, 2, 4, 1, 0, 85, 8],
  [906915, "Floriańska 11", 2, 1, 0, 0, 0, 0, 3, 2, 1, 0, 70, 8],
  [911131, "Floriańska 12", 3, 1, 0, 0, 0, 0, 3, 1, 3, 0, 80, 8],
  [921163, "Floriańska 21", 2, 2, 0, 0, 0, 0, 2, 0, 3, 0, 60, 4],
  [921167, "Floriańska 22", 0, 2, 0, 0, 0, 0, 1, 1, 1, 0, 35, 3],
  [921171, "Floriańska 23", 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 30, 2],
  [921175, "Floriańska 24", 2, 2, 0, 0, 0, 0, 2, 2, 1, 0, 65, 8],
  [921179, "Floriańska 31", 2, 3, 0, 0, 0, 0, 2, 0, 2, 0, 60, 5],
  [921183, "Floriańska 32", 0, 3, 0, 0, 0, 0, 1, 1, 0, 0, 35, 3],
  [921191, "Floriańska 33", 0, 3, 0, 0, 0, 0, 1, 0, 1, 0, 35, 2],
  [921199, "Floriańska 34", 2, 3, 0, 0, 0, 0, 2, 1, 1, 0, 60, 5],
  [921211, "Floriańska 41", 2, 4, 1, 0, 0, 0, 0, 2, 2, 0, 60, 4],
  [921215, "Floriańska 42", 0, 4, 1, 0, 0, 0, 1, 1, 1, 0, 35, 3],
  [921223, "Floriańska 43", 0, 4, 1, 0, 1, 0, 1, 1, 1, 0, 38, 3],
  [921231, "Rose Deluxe Apartment", 1, 1, 1, 0, 0, 0, 1, 0, 2, 0, 60, 4],
  [921235, "Green Deluxe Apartment", 1, 2, 1, 0, 0, 0, 1, 0, 1, 0, 40, 4],
  [921267, "Grey Deluxe Studio", 0, 2, 1, 1, 0, 0, 1, 1, 0, 1, 34, 3],
  [921287, "Yellow Deluxe Studio", 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 30, 3],
  [921291, "Black Deluxe Studio", 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 35, 3],
  [921295, "Blue Standard Studio", 0, 2, 1, 0, 0, 0, 1, 1, 0, 0, 30, 2],
  [921303, "Floriańska House", 3, null, 1, 0, 0, 0, 3, 1, 2, 0, 95, 8, "Floriańska House — cały dom łączący trzy sąsiednie apartamenty (Yellow, Black i Blue Studio) w jedną przestrzeń, w centrum Krakowa, w odległości spaceru od Rynku Głównego. Optymalnie dla 8 osób. Powierzchnia 95 m²."],
  [921311, "Krzyza 1", 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 25, 2],
  [921315, "Krzyza 2", 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 30, 2],
  [921319, "Krzyza 4", 2, 0, 0, 1, 0, 0, 2, 0, 1, 0, 70, 6],
  [921323, "Krzyza 8", 0, 2, 0, 0, 0, 0, 1, 0, 1, 0, 30, 2],
  [921331, "Krzyza 9", 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 27, 2],
  [921307, "Krzyża 12", 0, 3, 0, 0, 0, 0, 1, 0, 1, 0, 30, 2],
  [921335, "Tomasza", 2, 1, 1, 0, 0, 0, 1, 0, 2, 0, 48, 4],
  [956855, "Stolarska 3", 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, null, 4],
  [921395, "Stolarska 4", 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 40, 2],
  [921399, "Stolarska 5", 0, 1, 0, 0, 0, 0, 2, 0, 1, 0, 45, 4],
  [921403, "Stolarska 6", 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 50, 5],
  [921407, "Stolarska 7", 1, 1, 0, 0, 0, 0, 2, 0, 1, 0, 42, 5],
  [921411, "Stolarska 8", 0, 2, 0, 0, 0, 0, 1, 1, 1, 0, 37, 3],
  [921415, "Stolarska 9", 1, 2, 0, 0, 0, 0, 1, 1, 1, 0, 47, 3],
  [921419, "Stolarska 10", 0, 2, 0, 0, 0, 0, 1, 1, 1, 0, 42, 2],
  [921423, "Stolarska 14", 1, 2, 0, 0, 0, 0, 2, 1, 0, 0, 60, 5],
  [921427, "Stolarska 15", 0, 3, 1, 0, 0, 0, 1, 0, 1, 0, 45, 3],
  [921431, "Stolarska 16", 1, 3, 1, 0, 1, 0, 1, 1, 1, 0, 50, 3],
  [921435, "Stolarska 17", 2, 1, 0, 0, 0, 0, 1, 3, 1, 0, 60, 5],
  [921439, "Stolarska 19", 1, 2, 0, 0, 0, 0, 1, 1, 1, 0, 55, 3],
  [947375, "Stolarska 20", 2, 2, 1, 0, 0, 0, 2, 1, 0, 0, 60, 5],
  [921443, "Stolarska 21", 2, 1, 0, 0, 0, 0, 2, 2, 1, 0, 60, 5],
  [921447, "Stolarska 22", 2, 2, 0, 0, 0, 0, 2, 1, 1, 0, 60, 5],
  [921451, "Lubicz 8", 2, 1, 1, 1, 1, 1, 1, 2, 1, 0, 70, 5],
  [921455, "Lubicz 9", 2, 1, 1, 1, 0, 1, 2, 0, 1, 0, 70, 5],
  [921459, "Lubicz 31", 1, 4, 1, 1, 1, 1, 2, 0, 1, 0, 50, 2],
  [956845, "Jana 4", 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, null, 2],
  [921467, "Jana 8", 2, 1, 0, 0, 0, 0, 3, 1, 1, 0, 80, 6],
  [921471, "Jana 10", 1, 1, 0, 0, 0, 0, 2, 0, 1, 0, 50, 4],
  [921475, "Jana 19", 2, 2, 0, 0, 0, 0, 1, 3, 1, 0, 75, 5],
  [921479, "Jana 20", 0, 2, 0, 0, 0, 0, 1, 0, 1, 0, 35, 2],
  [921483, "Szpitalna A1", 1, 0, 0, 0, 0, 0, 2, 1, 0, 0, null, 5],
  [921487, "Szpitalna A2", 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, null, 5],
  [921491, "Szpitalna A3", 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, null, 5],
  [921495, "Szpitalna A4", 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, null, 5],
  [921499, "Szpitalna A5", 2, 4, 1, 0, 0, 0, 0, 0, 0, 0, null, 7],
  [921503, "Szpitalna 3", 2, 1, 0, 0, 0, 0, 2, 2, 1, 0, 70, 7],
  [921507, "Szpitalna 5", 2, 2, 0, 0, 1, 0, 2, 2, 1, 0, 70, 5],
  [921511, "Szpitalna 12", 2, 4, 0, 0, 0, 0, 3, 0, 1, 0, 70, 7],
  [921515, "Szpitalna 12a", 2, 4, 0, 0, 0, 0, 3, 1, 1, 0, 80, 6],
  [921519, "Szpitalna 14", 1, 4, 0, 0, 0, 1, 1, 1, 1, 0, 50, 4],
  [921523, "Sławkowska 5", 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 35, 3],
  [921527, "Sławkowska 11", 0, 3, 1, 0, 0, 0, 1, 0, 1, 0, 35, 2],
  [921531, "Gertrudy", 4, 1, 1, 0, 1, 0, 4, 0, 2, 3, 180, 8],
  [921535, "Bosacka", 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 45, 2],
  [954669, "Koletek", 0, 2, 0, 0, 0, 0, 1, 0, 1, 0, 35, 2],
  [921539, "Barbakan 1", 0, 1, 1, 0, 0, 0, 1, 2, 0, 0, 37, 4],
  [921547, "Barbakan 2", 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 35, 3],
  [921551, "Barbakan 3", 0, 2, 1, 0, 0, 0, 1, 2, 0, 0, 37, 4],
  [921555, "Barbakan 4", 0, 2, 1, 0, 0, 0, 1, 1, 1, 0, 35, 3],
  [921559, "Barbakan 5", 0, 3, 1, 0, 0, 0, 1, 2, 0, 0, 37, 4],
  [921563, "Barbakan 6", 0, 3, 1, 0, 0, 0, 1, 1, 1, 0, 35, 3],
  [921571, "Barbakan 7", 0, 4, 1, 0, 0, 0, 1, 0, 1, 0, 30, 2],
  [921575, "Barbakan 8", 0, 4, 1, 0, 0, 0, 1, 1, 0, 0, 30, 2]
];

/* Ulice rozpoznawane w nazwach — do zbudowania adresu „ul. …, Kraków”. */
const STREETS = {
  "floriańska": "Floriańska", "florianska": "Floriańska", "krzyza": "Krzyża", "krzyża": "Krzyża",
  "jana": "Jana", "szpitalna": "Szpitalna", "stolarska": "Stolarska", "lubicz": "Lubicz",
  "sławkowska": "Sławkowska", "gertrudy": "Gertrudy", "bosacka": "Bosacka",
  "koletek": "Koletek", "tomasza": "Tomasza",
  "barbakan": "Floriańska",
};

function slugify(text){
  return String(text).toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* „dla 1 osoby”, „dla 4 osób” */
function plPersonsGen(n){ return n === 1 ? "osoby" : "osób"; }

function enOrdinal(n){
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function typeLabel(bedrooms, lang){
  lang = lang || LANG;
  if (lang === "en"){
    if (bedrooms === 0) return "Studio";
    return bedrooms === 1 ? "1 bedroom" : bedrooms + " bedrooms";
  }
  if (bedrooms === 0) return "Studio";
  return bedrooms === 1 ? "1 sypialnia" : bedrooms + " sypialnie";
}

function floorLabel(floor, lang){
  lang = lang || LANG;
  if (floor === null || floor === undefined || floor === "") return "";
  if (lang === "en") return Number(floor) === 0 ? "Ground floor" : enOrdinal(Number(floor)) + " floor";
  return Number(floor) === 0 ? "Parter" : Number(floor) + ". piętro";
}

function bedsLabel(beds, lang){
  lang = lang || LANG;
  if (!beds) return "";
  const parts = [];
  if (lang === "en"){
    if (beds.double)  parts.push(beds.double  + "× double bed");
    if (beds.single)  parts.push(beds.single  + "× single bed");
    if (beds.sofaBed) parts.push(beds.sofaBed + "× sofa bed");
    if (beds.sofa)    parts.push(beds.sofa    + "× sofa (non-folding)");
    return parts.join(", ");
  }
  if (beds.double)  parts.push(beds.double  + "× łóżko podwójne");
  if (beds.single)  parts.push(beds.single  + "× łóżko pojedyncze");
  if (beds.sofaBed) parts.push(beds.sofaBed + "× sofa rozkładana");
  if (beds.sofa)    parts.push(beds.sofa    + "× sofa (nierozkładana)");
  return parts.join(", ");
}

/* Standardowe udogodnienia po angielsku. Własne wpisy z panelu /admin, których tu nie ma,
   wyświetlają się bez tłumaczenia — albo wpisz ich angielską wersję w polu „Udogodnienia (EN)”. */
const AMENITY_EN = {
  "Klimatyzacja": "Air conditioning", "Wanna": "Bathtub", "Balkon": "Balcony", "Pralka": "Washing machine",
  "Wi-Fi": "Wi-Fi", "Telewizor": "TV",
  "Aneks kuchenny lub kuchnia z wyposażeniem": "Kitchenette or kitchen with equipment",
  "Łazienka": "Bathroom", "Suszarka do włosów": "Hair dryer", "Pościel": "Bed linen",
};
function amenityLabel(name, lang){
  lang = lang || LANG;
  return lang === "en" ? (AMENITY_EN[name] || name) : name;
}
function amenitiesFor(apt, lang){
  lang = lang || LANG;
  if (lang === "en" && Array.isArray(apt.amenities_en) && apt.amenities_en.length) return apt.amenities_en;
  return (apt.amenities || []).map(n => amenityLabel(n, lang));
}

/* Adres po angielsku: „ul. Floriańska, Kraków” → „Floriańska St., Kraków”. */
function addressLabel(apt, lang){
  lang = lang || LANG;
  if (lang === "en"){
    if (apt.address_en) return apt.address_en;
    return String(apt.address || "").replace(/^ul\.\s+(.+?),/, "$1 St.,");
  }
  return apt.address;
}

function buildApartment(r){
  const [id, name, bedrooms, floor, ac, washer, bath, balcony, dbl, single, sofaBed, sofa, area, guests, customDescription] = r;
  const category = bedrooms === 0 ? "studio" : bedrooms === 1 ? "1-sypialnia" : bedrooms === 2 ? "2-sypialnie" : "3-plus";

  // Adres: nazwa zaczyna się od ulicy (bez numeru domu); Barbakan = ul. Floriańska.
  // Apartamenty o innych nazwach (np. „Rose Deluxe Studio”) dostają samo „Kraków”.
  const street = STREETS[name.split(" ")[0].toLowerCase()];
  const address = street ? `ul. ${street}, Kraków` : "Kraków";

  // Udogodnienia: wyróżniki z Excela + standard wspólny dla wszystkich apartamentów.
  const amenities = [];
  if (ac) amenities.push("Klimatyzacja");
  if (bath) amenities.push("Wanna");
  if (balcony) amenities.push("Balkon");
  if (washer) amenities.push("Pralka");
  amenities.push("Wi-Fi", "Telewizor", "Aneks kuchenny lub kuchnia z wyposażeniem", "Łazienka", "Suszarka do włosów", "Pościel");

  const kind = bedrooms === 0 ? "studio" : bedrooms === 1 ? "apartament z jedną sypialnią"
    : bedrooms === 2 ? "apartament z dwiema sypialniami" : bedrooms === 3 ? "apartament z trzema sypialniami"
    : "apartament z czterema sypialniami";
  const floorTxt = floor === null ? "" : (floor === 0 ? " na parterze" : ` na ${floor}. piętrze`);
  const description = customDescription ||
    `${name} — ${kind}${floorTxt} w centrum Krakowa, w odległości spaceru od Rynku Głównego. ` +
    `Optymalnie dla ${guests} ${plPersonsGen(guests)}.` +
    (area ? ` Powierzchnia ${area} m².` : "");

  const kindEn = bedrooms === 0 ? "a studio" : bedrooms === 1 ? "a one-bedroom apartment"
    : bedrooms === 2 ? "a two-bedroom apartment" : bedrooms === 3 ? "a three-bedroom apartment"
    : "a four-bedroom apartment";
  const floorTxtEn = floor === null ? "" : (floor === 0 ? " on the ground floor" : ` on the ${enOrdinal(floor)} floor`);
  const description_en =
    `${name} — ${kindEn}${floorTxtEn} in the centre of Kraków, within walking distance of the Main Market Square. ` +
    `Ideal for ${guests} ${guests === 1 ? "guest" : "guests"}.` +
    (area ? ` Floor area: ${area} m².` : "");

  return {
    id, slug: slugify(name), name, category, bedrooms, floor, area,
    guests, capacity: guests,
    beds: { double: dbl, single, sofaBed, sofa },
    address, description, description_en, images: [], amenities,
  };
}

let APARTMENTS = APARTMENTS_RAW.map(buildApartment);

function getApartmentById(id){
  const numId = Number(id);
  return APARTMENTS.find(a => a.id === numId);
}

function getApartmentBySlug(slug){
  return APARTMENTS.find(a => a.slug === slug);
}

/* Link do strony apartamentu.
   Ładny adres /florianska-12 obsługuje WYŁĄCZNIE backend (Node). Gdy strona jest
   otwarta bez backendu (jako pliki na dysku albo na zwykłym hostingu statycznym),
   używamy adresu apartament.html?id=…, który działa wszędzie. */
let BACKEND_ONLINE = false;
function apartmentUrl(a, lang){
  lang = lang || LANG;
  if (lang === "en") return (BACKEND_ONLINE && a.slug) ? "/en/" + a.slug : "apartment.html?id=" + a.id;
  return (BACKEND_ONLINE && a.slug) ? "/" + a.slug : "apartament.html?id=" + a.id;
}

/* Zdjęcia apartamentu — jeśli nie wgrano jeszcze żadnych, pokazujemy placeholdery. */
function apartmentImages(a){
  if (a.images && a.images.length) return a.images.map(assetUrl);
  return [
    placeholderImage(a.name, a.id + "-a"),
    placeholderImage(a.name + (LANG === "en" ? " — living room" : " — salon"), a.id + "-b"),
    placeholderImage(a.name + (LANG === "en" ? " — bedroom" : " — sypialnia"), a.id + "-c"),
    placeholderImage(a.name + (LANG === "en" ? " — bathroom" : " — łazienka"), a.id + "-d"),
  ];
}

function countByCategory(catId){
  return APARTMENTS.filter(a => a.category === catId).length;
}

/* ---------------------------------------------------------
   Atrakcje w okolicy (zakładka „Okolica”) — treści opisowe,
   zdjęcia na razie jako wygenerowane placeholdery do podmiany
   na prawdziwe fotografie (patrz README.md).
--------------------------------------------------------- */
const AREA_INTRO = {
  "Stare Miasto": "Serce Krakowa, wpisane na listę UNESCO — i najbliższa okolica naszych apartamentów.",
  "Kazimierz": "Dawna żydowska dzielnica Krakowa, dziś jedna z najbardziej klimatycznych części miasta — kilkanaście minut spacerem od Floriańskiej.",
  "Podgórze": "Po drugiej stronie Wisły, naprzeciw Kazimierza — dzielnica naznaczona historią II wojny światowej i dziś tętniąca nowym życiem.",
};

const AREA_LABEL_EN = { "Stare Miasto": "Old Town", "Kazimierz": "Kazimierz", "Podgórze": "Podgórze" };
const AREA_INTRO_EN = {
  "Stare Miasto": "The heart of Kraków, a UNESCO World Heritage Site — and the immediate neighbourhood of our apartments.",
  "Kazimierz": "The former Jewish quarter of Kraków, today one of the most atmospheric parts of the city — a dozen or so minutes' walk from Floriańska Street.",
  "Podgórze": "Across the Vistula from Kazimierz — a district marked by the history of the Second World War and today full of new life.",
};
function areaLabel(area, lang){
  lang = lang || LANG;
  return lang === "en" ? (AREA_LABEL_EN[area] || area) : area;
}

const ATTRACTIONS_RAW = [
  { name: "Rynek Główny i Sukiennice", area: "Stare Miasto",
    shortDesc: "Największy średniowieczny rynek w Europie, kilka minut spacerem od Floriańskiej. W jego sercu stoją renesansowe Sukiennice z kramami rzemieślniczymi.",
    longDesc: "Rynek Główny to serce Krakowa i jeden z największych średniowiecznych placów miejskich w Europie — od naszych apartamentów przy Floriańskiej dzieli go zaledwie kilka minut spaceru. Pośrodku placu stoją renesansowe Sukiennice, dawna hala targowa, dziś pełna kramów z pamiątkami i rękodziełem, a pod nimi kryje się podziemne muzeum opowiadające o średniowiecznym Krakowie. Wokół rynku tętnią kawiarnie, restauracje i uliczni artyści — to naturalny punkt startowy każdego zwiedzania miasta." },
  { name: "Bazylika Mariacka", area: "Stare Miasto",
    shortDesc: "Gotycki kościół z ołtarzem Wita Stwosza — co godzinę z wyższej wieży rozbrzmiewa hejnał mariacki, słyszalny w całym centrum.",
    longDesc: "Bazylika Mariacka to gotycki kościół przy Rynku Głównym, znany z asymetrycznych wież i monumentalnego, drewnianego ołtarza Wita Stwosza we wnętrzu. Co godzinę z wyższej wieży rozbrzmiewa hejnał mariacki — melodia urywająca się w tym samym, charakterystycznym miejscu, nawiązująca do legendy o strażniku przerwanym przez najazd. Warto wejść na wieżę widokową, skąd rozpościera się widok na całe Stare Miasto." },
  { name: "Brama Floriańska i Barbakan", area: "Stare Miasto",
    shortDesc: "Fragment dawnych murów obronnych Krakowa — dosłownie u wylotu ulicy Floriańskiej, przy której mieszkasz.",
    longDesc: "Brama Floriańska i stojący nieopodal Barbakan to najlepiej zachowany fragment średniowiecznych murów obronnych Krakowa — i dosłownie punkt, w którym zaczyna się ulica Floriańska, przy której znajdują się nasze apartamenty. Barbakan, okrągła forteca z basztami, należy do nielicznych tak dobrze zachowanych budowli obronnych tego typu w Europie. To naturalna brama do Starego Miasta — stąd zaczynają się spacery w stronę Rynku." },
  { name: "Wawel — zamek i katedra", area: "Stare Miasto",
    shortDesc: "Wzgórze królewskie z zamkiem, katedrą koronacyjną polskich władców i legendarną Smoczą Jamą nad Wisłą.",
    longDesc: "Wzgórze wawelskie to symbol polskiej państwowości — mieści się na nim Zamek Królewski oraz katedra, w której przez wieki koronowano i chowano polskich władców. Zwiedzić można komnaty reprezentacyjne, prywatne apartamenty królewskie, skarbiec i zbrojownię, a pod wzgórzem, nad samą Wisłą, znajduje się legendarna Smocza Jama. To jedno z najczęściej odwiedzanych miejsc w Polsce — warto zarezerwować bilety na konkretne godziny z wyprzedzeniem." },
  { name: "Ulica Floriańska", area: "Stare Miasto",
    shortDesc: "Jedna z najstarszych i najbardziej reprezentacyjnych ulic Krakowa, łącząca Rynek Główny z Bramą Floriańską — pełna kawiarni, restauracji i sklepów.",
    longDesc: "Ulica Floriańska, przy której znajdują się nasze apartamenty, to jeden z najstarszych i najbardziej reprezentacyjnych traktów Krakowa, łączący Rynek Główny z Bramą Floriańską. Wzdłuż niej stoją kamienice z bogatą historią, a w ich parterach — kawiarnie, restauracje i sklepy, dzięki którym większość codziennych potrzeb załatwisz, nie oddalając się od apartamentu. To też część Drogi Królewskiej, którą przechodziły dawne orszaki koronacyjne." },
  { name: "Planty", area: "Stare Miasto",
    shortDesc: "Pierścień parkowy otaczający Stare Miasto w miejscu dawnych murów obronnych — świetny na spokojny spacer między zwiedzaniem.",
    longDesc: "Planty to pas zieleni okalający całe Stare Miasto w miejscu dawnych, średniowiecznych murów obronnych, rozebranych na początku XIX wieku. To ulubione miejsce spacerów mieszkańców i gości — z alejkami, ławkami i pomnikami, doskonałe na chwilę odpoczynku między kolejnymi punktami zwiedzania. Okrążenie całych Plant pieszo zajmuje około pół godziny." },

  { name: "Plac Nowy", area: "Kazimierz",
    shortDesc: "Serce nocnego życia Kazimierza — targowisko za dnia, skupisko barów i kultowych zapiekanek po zmroku.",
    longDesc: "Plac Nowy to nieformalne centrum Kazimierza — za dnia działa tu lokalny targ, a po zmroku plac i okoliczne uliczki zapełniają się gośćmi kawiarni i barów. To też miejsce narodzin kultowych krakowskich zapiekanek, sprzedawanych w okrągłym pawilonie na środku placu, czynnym właściwie całą dobę. Stąd blisko już do większości klimatycznych zakątków dzielnicy." },
  { name: "Synagogi i dziedzictwo żydowskie", area: "Kazimierz",
    shortDesc: "Stara Synagoga, Synagoga Remuh z cmentarzem czy Synagoga Tempel przypominają o wielowiekowej historii dzielnicy.",
    longDesc: "Kazimierz był przez wieki centrum życia żydowskiego w Krakowie, a ślady tej historii widać do dziś — Stara Synagoga (dziś oddział Muzeum Krakowa), Synagoga Remuh z zabytkowym cmentarzem czy secesyjna Synagoga Tempel to tylko część zachowanych obiektów. Wiele z nich można zwiedzić od środka, poznając historię społeczności, która współtworzyła dzielnicę przez ponad pięćset lat." },
  { name: "Kameralne uliczki Kazimierza", area: "Kazimierz",
    shortDesc: "Kazimierz to też kawiarnie, galerie i lokalne knajpki w klimatycznych, niewielkich kamienicach — idealne do zwiedzania bez planu.",
    longDesc: "Poza znanymi punktami na mapie, Kazimierz najlepiej poznaje się bez konkretnego planu — wystarczy skręcić w boczną uliczkę, by trafić na kameralną kawiarnię, galerię sztuki albo lokalną knajpkę w niewielkiej, secesyjnej kamienicy. To dzielnica, w której warto po prostu zwolnić i dać się prowadzić przypadkowi." },

  { name: "Fabryka Emalia Oskara Schindlera", area: "Podgórze",
    shortDesc: "Muzeum w dawnej fabryce Schindlera opowiada historię okupowanego Krakowa — jedna z najważniejszych tras historycznych w mieście.",
    longDesc: "W dawnej Fabryce Emalia Oskara Schindlera działa dziś oddział Muzeum Krakowa poświęcony okupacji niemieckiej w latach 1939–1945. Wystawa w przystępny, multimedialny sposób opowiada historię miasta i jego mieszkańców w tym okresie, w tym losy robotników zatrudnionych przez Schindlera. To jedna z najważniejszych i najczęściej odwiedzanych tras historycznych w Krakowie — warto zarezerwować bilet wcześniej." },
  { name: "Plac Bohaterów Getta", area: "Podgórze",
    shortDesc: "Miejsce pamięci po dawnym krakowskim getcie, z instalacją pustych krzeseł upamiętniającą jego mieszkańców.",
    longDesc: "Plac Bohaterów Getta był w czasie wojny centralnym punktem krakowskiego getta. Dziś upamiętnia go instalacja kilkudziesięciu metalowych, pustych krzeseł — symbol mieszkańców wysiedlonych i zamordowanych w czasie okupacji. Przy placu stoi też dawna Apteka pod Orłem, kolejny oddział Muzeum Krakowa, prowadzony przez polskiego farmaceutę, który pomagał mieszkańcom getta." },
  { name: "Bulwary Wiślane", area: "Podgórze",
    shortDesc: "Spacerowe i rowerowe bulwary nad Wisłą, z widokiem na Wawel — świetne miejsce na wieczorny spacer.",
    longDesc: "Bulwary nad Wisłą to ulubione miejsce mieszkańców Krakowa na spacer, przejażdżkę rowerem czy wieczorny odpoczynek z widokiem na podświetlony Wawel. Po stronie podgórskiej bulwary są nieco spokojniejsze niż te bliżej centrum, co czyni je dobrym miejscem na chwilę wytchnienia od zwiedzania. W sezonie kursują też stąd rejsy statkiem po Wiśle." },
];

/* Angielskie wersje atrakcji — w tej samej kolejności co ATTRACTIONS_RAW. */
const ATTRACTIONS_EN = [
  { name_en: "Main Market Square and the Cloth Hall",
    shortDesc_en: "Europe's largest medieval market square, just minutes from Floriańska Street. At its heart stands the Renaissance Cloth Hall with its craft stalls.",
    longDesc_en: "The Main Market Square is the heart of Kraków and one of the largest medieval town squares in Europe — only a few minutes' walk from our apartments on Floriańska Street. In the middle of the square stands the Renaissance Cloth Hall, a former trading hall that is now full of souvenir and handicraft stalls, with an underground museum beneath it telling the story of medieval Kraków. Around the square you will find cafés, restaurants and street performers — the natural starting point for any visit to the city." },
  { name_en: "St. Mary's Basilica",
    shortDesc_en: "A Gothic church with the Veit Stoss altarpiece — every hour a bugle call (the hejnał) sounds from the taller tower, audible across the centre.",
    longDesc_en: "St. Mary's Basilica is a Gothic church on the Main Market Square, known for its asymmetrical towers and the monumental wooden altarpiece by Veit Stoss (Wit Stwosz) inside. Every hour the hejnał mariacki, a bugle call, rings out from the taller tower — a melody that breaks off at the same characteristic point, recalling the legend of a watchman interrupted by an invasion. It is worth climbing the viewing tower, from which you can see the whole Old Town." },
  { name_en: "St. Florian's Gate and the Barbican",
    shortDesc_en: "A surviving fragment of Kraków's old defensive walls — right at the end of Floriańska Street, where you are staying.",
    longDesc_en: "St. Florian's Gate and the nearby Barbican are the best-preserved fragment of Kraków's medieval defensive walls — and literally the point where Floriańska Street begins, the street on which our apartments are located. The Barbican, a round fortress with turrets, is one of the few such well-preserved defensive structures of its kind in Europe. It is the natural gateway to the Old Town — this is where walks towards the Main Market Square begin." },
  { name_en: "Wawel — Castle and Cathedral",
    shortDesc_en: "The royal hill with the castle, the coronation cathedral of Polish monarchs and the legendary Dragon's Den by the Vistula.",
    longDesc_en: "Wawel Hill is a symbol of Polish statehood — it is home to the Royal Castle and the cathedral where Polish monarchs were crowned and buried for centuries. You can visit the state rooms, the private royal apartments, the treasury and the armoury, and at the foot of the hill, right by the Vistula, lies the legendary Dragon's Den. It is one of the most visited places in Poland — it is worth booking tickets for specific times in advance." },
  { name_en: "Floriańska Street",
    shortDesc_en: "One of Kraków's oldest and most prestigious streets, linking the Main Market Square with St. Florian's Gate — full of cafés, restaurants and shops.",
    longDesc_en: "Floriańska Street, where our apartments are located, is one of the oldest and most prestigious routes in Kraków, connecting the Main Market Square with St. Florian's Gate. It is lined with townhouses rich in history, and their ground floors house cafés, restaurants and shops, so you can take care of most everyday needs without going far from your apartment. It is also part of the Royal Route, along which coronation processions once passed." },
  { name_en: "Planty Park",
    shortDesc_en: "A ring of parkland around the Old Town on the site of the former defensive walls — perfect for a relaxed walk between sights.",
    longDesc_en: "Planty is a green belt encircling the whole Old Town on the site of the former medieval walls, which were demolished in the early 19th century. It is a favourite place for walks for locals and visitors alike — with paths, benches and monuments, ideal for a moment of rest between sights. Walking all the way around Planty takes about half an hour." },
  { name_en: "Plac Nowy",
    shortDesc_en: "The heart of Kazimierz nightlife — a market by day, a cluster of bars and cult zapiekanki (open-faced baguettes) after dark.",
    longDesc_en: "Plac Nowy is the informal centre of Kazimierz — a local market runs here by day, and after dark the square and surrounding lanes fill with guests of cafés and bars. It is also the birthplace of Kraków's cult zapiekanki, sold from the round pavilion in the middle of the square, open practically around the clock. From here it is only a short walk to most of the atmospheric corners of the district." },
  { name_en: "Synagogues and Jewish heritage",
    shortDesc_en: "The Old Synagogue, the Remuh Synagogue with its cemetery and the Tempel Synagogue recall the district's centuries-long history.",
    longDesc_en: "For centuries Kazimierz was the centre of Jewish life in Kraków, and traces of that history are visible to this day — the Old Synagogue (now a branch of the Museum of Kraków), the Remuh Synagogue with its historic cemetery and the Art Nouveau Tempel Synagogue are only some of the surviving sites. Many of them can be visited inside, learning about the community that helped shape the district for more than five hundred years." },
  { name_en: "The quiet streets of Kazimierz",
    shortDesc_en: "Kazimierz is also cafés, galleries and local eateries in atmospheric small townhouses — ideal for exploring without a plan.",
    longDesc_en: "Beyond the well-known points on the map, Kazimierz is best discovered without a specific plan — just turn into a side street to find an intimate café, an art gallery or a local eatery in a small Art Nouveau townhouse. It is a district where it is worth simply slowing down and letting chance guide you." },
  { name_en: "Oskar Schindler's Enamel Factory",
    shortDesc_en: "The museum in Schindler's former factory tells the story of occupied Kraków — one of the most important historical routes in the city.",
    longDesc_en: "The former Oskar Schindler's Enamel Factory now houses a branch of the Museum of Kraków devoted to the German occupation of 1939–1945. The exhibition tells the story of the city and its inhabitants in that period in an accessible, multimedia way, including the fate of the workers employed by Schindler. It is one of the most important and most visited historical routes in Kraków — it is worth booking a ticket in advance." },
  { name_en: "Ghetto Heroes Square",
    shortDesc_en: "A memorial site of the former Kraków ghetto, with an installation of empty chairs commemorating its inhabitants.",
    longDesc_en: "Ghetto Heroes Square was the central point of the Kraków ghetto during the war. Today it is commemorated by an installation of several dozen empty metal chairs — a symbol of the residents who were displaced and murdered during the occupation. Next to the square stands the former Eagle Pharmacy (Apteka pod Orłem), another branch of the Museum of Kraków, run by a Polish pharmacist who helped the ghetto's inhabitants." },
  { name_en: "Vistula Boulevards",
    shortDesc_en: "Walking and cycling boulevards along the Vistula with a view of Wawel — a great place for an evening stroll.",
    longDesc_en: "The boulevards along the Vistula are a favourite place for Kraków residents to walk, cycle or relax in the evening with a view of the illuminated Wawel. On the Podgórze side the boulevards are slightly quieter than those closer to the centre, which makes them a good place for a break from sightseeing. In season, boat cruises on the Vistula depart from here too." },
];
ATTRACTIONS_RAW.forEach((a, i) => Object.assign(a, ATTRACTIONS_EN[i] || {}));

let ATTRACTIONS = ATTRACTIONS_RAW.map((a, i) => {
  const id = i + 1;
  return {
    id,
    ...a,
    image: placeholderImage(a.name, "attraction-" + id),
    images: [
      placeholderImage(a.name, "attraction-" + id + "-a"),
      placeholderImage(a.name + " — widok 2", "attraction-" + id + "-b"),
      placeholderImage(a.name + " — widok 3", "attraction-" + id + "-c"),
    ],
  };
});

function getAttractionById(id){
  const numId = Number(id);
  return ATTRACTIONS.find(a => a.id === numId);
}

/* ---------------------------------------------------------
   Treści stron „Parking” i „Śniadania” — te same wartości, co w
   przykładowej bazie backendu (backend/src/seed.js), żeby strona
   wyglądała spójnie niezależnie od tego, czy backend jest podłączony.
--------------------------------------------------------- */
let PAGES = {
  parking: {
    title: "Parking dla naszych gości",
    location: "ul. Lubicz 17a",
    price: "80 zł / doba",
    description: "Dla gości mieszkających w naszych apartamentach na Starym Mieście oferujemy miejsce na bezpiecznym, strzeżonym parkingu podziemnym przy ulicy Lubicz 17a — kilka minut spacerem od Floriańskiej i Rynku Głównego.",
    price_en: "80 PLN / day",
    description_en: "For guests staying in our Old Town apartments we offer a space in a safe, guarded underground car park at Lubicz 17a — a few minutes' walk from Floriańska Street and the Main Market Square.",
    images: [
      "assets/images/parking-wjazd.jpg",
      "assets/images/parking-wnetrze.jpg",
    ],
  },
  sniadania: {
    title: "Śniadania w apartamencie",
    hours: "8:30–9:30",
    price: "40 zł / osoba",
    description: "Każdego ranka dostarczamy do apartamentu świeże śniadanie kontynentalne — pieczywo, wędliny i sery, dżemy, nabiał oraz dodatki, w zależności od dostępności sezonowej.",
    price_en: "40 PLN / person",
    description_en: "Every morning we deliver a fresh continental breakfast to your apartment — bread, cold cuts and cheeses, jams, dairy and extras, depending on seasonal availability.",
    images: [
      placeholderImage("Śniadanie P&J Apartamenty", "sniadania-1"),
      placeholderImage("Śniadanie P&J Apartamenty", "sniadania-2"),
      placeholderImage("Śniadanie P&J Apartamenty", "sniadania-3"),
      placeholderImage("Śniadanie P&J Apartamenty", "sniadania-4"),
    ],
  },
};

/* ---------------------------------------------------------
   Opcjonalne podłączenie do backendu (patrz /backend).
   Strona działa w pełni również BEZ backendu — powyższe dane lokalne
   są wtedy używane jako są. Jeśli backend jest uruchomiony i serwuje
   tę samą stronę (patrz backend/server.js), poniższa funkcja po cichu
   podmienia dane na te z panelu administracyjnego /admin, wraz ze
   zdjęciami wgranymi przez administratora. Brak backendu = brak błędu,
   po prostu zostają dane lokalne.
--------------------------------------------------------- */
async function refreshFromBackend(){
  const withTimeout = (promise, ms = 2500) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    return promise(controller.signal).finally(() => clearTimeout(timer));
  };

  try {
    const [aptRes, attrRes, parkingRes, sniadaniaRes] = await Promise.all([
      withTimeout((signal) => fetch("/api/apartments", { signal })),
      withTimeout((signal) => fetch("/api/attractions", { signal })),
      withTimeout((signal) => fetch("/api/pages/parking", { signal })),
      withTimeout((signal) => fetch("/api/pages/sniadania", { signal })),
    ]);

    if (aptRes.ok){
      const data = await aptRes.json();
      if (Array.isArray(data) && data.length){ APARTMENTS = data; BACKEND_ONLINE = true; }
    }
    if (attrRes.ok){
      const data = await attrRes.json();
      if (Array.isArray(data) && data.length) ATTRACTIONS = data;
    }
    if (parkingRes.ok) PAGES.parking = await parkingRes.json();
    if (sniadaniaRes.ok) PAGES.sniadania = await sniadaniaRes.json();
  } catch (err){
    // Backend niedostępny (albo strona otwarta jako zwykły plik statyczny
    // bez serwera) — to oczekiwana sytuacja w trybie demo, zostajemy
    // przy lokalnych danych zdefiniowanych wyżej.
  }
}

/* Eksport dla backendu (Node) — seed.js korzysta z tej samej listy apartamentów. */
/* Wersja danych apartamentów — zwiększ po każdej zmianie listy w APARTMENTS_RAW.
   Backend porównuje ją z zapisaną w bazie i odświeża listę (zachowując wgrane zdjęcia). */
const APARTMENTS_DATA_VERSION = 6;

if (typeof module !== "undefined" && module.exports){
  module.exports = {
    APARTMENTS_RAW, APARTMENTS_DATA_VERSION, buildApartment, slugify, CATEGORIES,
    ATTRACTIONS_RAW, AREA_INTRO, AREA_INTRO_EN, AREA_LABEL_EN, AMENITY_EN,
    typeLabel, floorLabel, bedsLabel, amenityLabel, amenitiesFor, addressLabel, enOrdinal,
  };
}
