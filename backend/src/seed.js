// Generuje początkową zawartość bazy (data/content.json) przy pierwszym
// uruchomieniu backendu — te same „przykładowe” dane, które wcześniej
// były zaszyte w js/config-data.js po stronie front-endu, tyle że teraz
// żyją w backendzie i można je edytować (w tym zdjęcia) przez panel
// administracyjny pod /admin.

const CATEGORIES = [
  { id: "studio", label: "Studio", bedrooms: 0 },
  { id: "1-sypialnia", label: "1 sypialnia", bedrooms: 1 },
  { id: "2-sypialnie", label: "2 sypialnie", bedrooms: 2 },
  { id: "3-plus", label: "3+ sypialnie", bedrooms: 3 },
];

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

// Realna lista apartamentów (z Excela) żyje w js/config-data.js — ten sam plik
// zasila front-end, więc dane startowe backendu i strony są zawsze identyczne.
function generateApartments(){
  let source;
  try {
    source = require("../../js/config-data.js");
  } catch (err){
    throw new Error(
      "Nie można wczytać js/config-data.js (lista apartamentów). Backend musi " +
      "stać w folderze strony, obok katalogu js/. Szczegóły: " + err.message
    );
  }
  return source.APARTMENTS_RAW.map(source.buildApartment);
}

function apartmentsDataVersion(){
  return require("../../js/config-data.js").APARTMENTS_DATA_VERSION;
}

// Atrakcje i opisy dzielnic (PL + EN) żyją w js/config-data.js — jedno źródło dla strony i backendu.
const SHARED = require("../../js/config-data.js");
const ATTRACTIONS_RAW = SHARED.ATTRACTIONS_RAW;
const AREA_INTRO = SHARED.AREA_INTRO;

function buildAttractions(){
  return ATTRACTIONS_RAW.map((a, i) => {
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
}

function buildSeedContent(){
  return {
    apartmentsVersion: apartmentsDataVersion(),
    apartments: generateApartments(),
    attractions: buildAttractions(),
    areaIntro: AREA_INTRO,
    pages: {
      parking: {
        title: "Parking dla naszych gości",
        location: "ul. Lubicz 17a",
        price: "80 zł / doba",
        description: "Dla gości mieszkających w naszych apartamentach na Starym Mieście oferujemy miejsce na bezpiecznym, strzeżonym parkingu podziemnym przy ulicy Lubicz 17a — kilka minut spacerem od Floriańskiej i Rynku Głównego. Liczba miejsc jest ograniczona, dlatego parking wymaga wcześniejszej rezerwacji.",
        price_en: "80 PLN / day",
        description_en: "For guests staying in our Old Town apartments we offer a space in a safe, guarded underground car park at Lubicz 17a — a few minutes' walk from Floriańska Street and the Main Market Square. The number of spaces is limited, so parking must be booked in advance.",
        images: [
          "/assets/images/parking-wjazd.jpg",
          "/assets/images/parking-wnetrze.jpg",
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
    },
  };
}

module.exports = { generateApartments, apartmentsDataVersion, buildSeedContent, placeholderImage, CATEGORIES };
