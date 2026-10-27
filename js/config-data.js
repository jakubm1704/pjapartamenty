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
  // Adres angielskiej wersji strony (np. "en/index.html"). Dopóki puste,
  // przełącznik EN jest widoczny, ale nieaktywny ("wkrótce").
  englishSiteUrl: "",
  // Narzędzia analityczne i reklamowe. Wpisz identyfikatory — dopóki są puste, nic się nie ładuje i baner zgody się nie pokazuje.
  tracking: {
    gaMeasurementId: "",   // np. "G-XXXXXXXXXX" (Google Analytics 4)
    metaPixelId: ""        // np. "1234567890123456" (Meta Pixel)
  },
  googleReviewsUrl: "https://maps.app.goo.gl/SQtUV1TEZ6nnmDgn6",
  // Opinie z wizytówki Google. Dodawaj kolejne w tej samej formie: { name, rating (1-5), text }.
  reviews: [
    { name: "Małgorzata Skroban", rating: 5, text: "Apartament przestronny z dużą łazienką, aneksem i antresolą. jedyny minus to czwartek piętro. Obsługa pomocna, po zgłoszeniu awarii klimatyzacji, została on…" },
    { name: "Tomasz Kulis", rating: 5, text: "Super." },
    { name: "Dominik Gomuła", rating: 5, text: "P&J zapewniło nam mieszkanie „z duszą”, dzięki któremu mogliśmy poczuć się jak rodowici krakowianie. Doświadczyliśmy niezwykłej podróży w…" }
  ],
};

// Kategorie apartamentów używane w wyszukiwarce, module kategorii i filtrach.
const CATEGORIES = [
  { id: "studio",  label: "Studio",         bedrooms: 0, desc: "Otwarta przestrzeń do spania i wypoczynku — idealna dla 1–2 osób." },
  { id: "1-sypialnia", label: "1 sypialnia", bedrooms: 1, desc: "Osobna sypialnia i salon — komfort dla pary lub małej rodziny." },
  { id: "2-sypialnie",  label: "2 sypialnie", bedrooms: 2, desc: "Dwie sypialnie i salon — dobry wybór dla grupy znajomych lub rodziny." },
  { id: "3-plus",       label: "3+ sypialnie", bedrooms: 3, desc: "Przestronne apartamenty dla większych grup i dłuższych pobytów." },
];

function categoryLabel(id){
  const c = CATEGORIES.find(c => c.id === id);
  return c ? c.label : id;
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
            fill="#FFFDF8" fill-opacity="0.75" text-anchor="middle">zdjęcie przykładowe</text>
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

function typeLabel(bedrooms){
  if (bedrooms === 0) return "Studio";
  return bedrooms === 1 ? "1 sypialnia" : bedrooms + " sypialnie";
}

function floorLabel(floor){
  if (floor === null || floor === undefined || floor === "") return "";
  return Number(floor) === 0 ? "Parter" : Number(floor) + ". piętro";
}

function bedsLabel(beds){
  if (!beds) return "";
  const parts = [];
  if (beds.double)  parts.push(beds.double  + "× łóżko podwójne");
  if (beds.single)  parts.push(beds.single  + "× łóżko pojedyncze");
  if (beds.sofaBed) parts.push(beds.sofaBed + "× sofa rozkładana");
  if (beds.sofa)    parts.push(beds.sofa    + "× sofa (nierozkładana)");
  return parts.join(", ");
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

  return {
    id, slug: slugify(name), name, category, bedrooms, floor, area,
    guests, capacity: guests,
    beds: { double: dbl, single, sofaBed, sofa },
    address, description, images: [], amenities,
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
function apartmentUrl(a){
  return (BACKEND_ONLINE && a.slug) ? "/" + a.slug : "apartament.html?id=" + a.id;
}

/* Zdjęcia apartamentu — jeśli nie wgrano jeszcze żadnych, pokazujemy placeholdery. */
function apartmentImages(a){
  if (a.images && a.images.length) return a.images;
  return [
    placeholderImage(a.name, a.id + "-a"),
    placeholderImage(a.name + " — salon", a.id + "-b"),
    placeholderImage(a.name + " — sypialnia", a.id + "-c"),
    placeholderImage(a.name + " — łazienka", a.id + "-d"),
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
    description: "Dla gości naszych apartamentów przy Starym Mieście oferujemy miejsce na bezpiecznym, strzeżonym parkingu podziemnym przy ulicy Lubicz 17a — kilka minut spacerem od Floriańskiej i Rynku Głównego.",
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
const APARTMENTS_DATA_VERSION = 4;

if (typeof module !== "undefined" && module.exports){
  module.exports = { APARTMENTS_RAW, APARTMENTS_DATA_VERSION, buildApartment, slugify, CATEGORIES };
}
