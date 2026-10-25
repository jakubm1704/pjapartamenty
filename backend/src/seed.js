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
        description: "Dla gości naszych apartamentów przy Starym Mieście oferujemy miejsce na bezpiecznym, strzeżonym parkingu podziemnym przy ulicy Lubicz 17a — kilka minut spacerem od Floriańskiej i Rynku Głównego. Liczba miejsc jest ograniczona, dlatego parking wymaga wcześniejszej rezerwacji.",
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
