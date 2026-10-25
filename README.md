# P&J Apartamenty — strona internetowa

Strona (HTML/CSS/JS, bez frameworków) działa w pełni sama, jako zwykłe
pliki statyczne — ale w folderze `backend/` czeka też opcjonalny,
gotowy do uruchomienia **backend z panelem administracyjnym**
(logowanie + edycja apartamentów/atrakcji/Parkingu/Śniadania + upload
zdjęć), który po uruchomieniu automatycznie zasila tę stronę realnymi
danymi. Szczegóły w `backend/README.md` — to najważniejsza lektura,
jeśli chcecie samodzielnie zarządzać treścią i zdjęciami.

Struktura:

```
index.html          — strona główna (wyszukiwarka, kategorie, mapa, mini-kontakt)
apartamenty.html     — siatka 90 apartamentów, filtr kategorii, paginacja
apartament.html      — szablon strony pojedynczego apartamentu (czyta ?id=), z karuzelą zdjęć
transfery.html       — transfery lotniskowe (cennik wg liczby osób)
parking.html         — parking podziemny dla gości, z karuzelą zdjęć
sniadania.html       — śniadania z dostawą do apartamentu, z karuzelą zdjęć
wycieczki.html       — wycieczki + link do Kraków Direct
okolica.html         — atrakcje w okolicy: Stare Miasto, Kazimierz, Podgórze, każda ze zdjęciem i linkiem do szczegółów
atrakcja.html        — szablon strony pojedynczej atrakcji (czyta ?id=)
kontakt.html         — mapa, dane kontaktowe, formularz
css/style.css        — cały wygląd strony (kolory dopasowane do logo P&J)
js/config-data.js    — KONFIGURACJA + dane apartamentów/atrakcji + opcjonalne pobieranie z backendu
js/main.js           — logika: nawigacja, filtrowanie, paginacja, karuzele, formularze
assets/images/       — logo P&J (złote i czarno-białe) oraz zdjęcie hero strony głównej
robots.txt, sitemap.xml — podstawy SEO dla wyszukiwarek
backend/             — opcjonalny backend + panel administracyjny (patrz backend/README.md)
```



### 1. Dane firmy (`js/config-data.js`, obiekt `CONFIG`)
Ustawione są już dane z Waszej ulotki: nazwa „P&J Apartamenty”, adres
ul. Floriańska 39, 31-019 Kraków, telefon +48 798 242 424 i e-mail
info@apartmentcracow.com. Wszystkie miejsca na stronie (nagłówek, stopka,
sekcja kontaktowa) pobierają te dane automatycznie z jednego miejsca —
wystarczy zmienić je tu, żeby zaktualizować całą witrynę.

### 2. Silnik rezerwacji PREVIO
Silnik jest osadzony (skrypt od PREVIO) na osobnej podstronie `rezerwacja.html`,
która ma to samo menu i stopkę co reszta strony. Prowadzą do niej: przycisk
„Zarezerwuj” w menu, „Szukaj dostępności” w wyszukiwarce na stronie głównej
(przekazuje daty i liczbę gości w adresie) oraz „Zarezerwuj” w każdym apartamencie
(przekazuje też numer apartamentu). Strona rezerwacji pokazuje gościowi
podsumowanie wyszukiwania nad silnikiem. Wstępne wypełnienie pól samego silnika
wymaga parametrów od PREVIO — patrz `TODO` w `initBookingPage()` (`js/main.js`).

W `CONFIG` ustawisz też linki do Facebooka i Instagrama (`facebookUrl`,
`instagramUrl`) oraz adres wersji angielskiej (`englishSiteUrl`).

Jeśli PREVIO oferuje osadzany **widget** (skrypt/iframe) zamiast linku, możesz
zamiast przekierowania wkleić ten kod bezpośrednio w `apartament.html` (przycisk
„Zarezerwuj”) oraz w nawigacji — struktura strony na to pozwala, zmienia się
tylko sposób podłączenia przycisku w `js/main.js` (funkcje `wireBookingButtons`
i `initApartmentDetailPage`).

### 3. Podłączenie danych z PREVIO (90 apartamentów)
Obecnie `APARTMENTS` w `js/config-data.js` to **dane przykładowe**, wygenerowane
automatycznie (funkcja `generateApartments`), żeby pokazać działanie siatki,
filtrów i strony apartamentu przy pełnej liczbie 90 pozycji.

- Osiem pierwszych pozycji nosi podane przy zamówieniu, realne nazwy
  (Floriańska 11/12/22/23/24/31, Jana 8, Jana 20).
- Pozostałe pozycje korzystają z nazw ulic, na których faktycznie znajdują
  się Wasze apartamenty (Szpitalna, Stolarska, Grodzka, Gertrudy, Lubicz) —
  ale same numery są przykładowe.
- Liczba osób, sypialnie i metraż są dla wszystkich 90 pozycji tylko
  ilustracyjne.

Docelowo, gdy PREVIO zacznie przesyłać dane o mieszkaniach i dostępności, najlepiej:
- zastąpić `generateApartments()` pobieraniem danych z API PREVIO (fetch przy
  starcie strony) **albo**
- wygenerować statyczny plik JSON/JS z danymi z PREVIO i wczytać go zamiast
  obecnej tablicy — struktura pojedynczego obiektu apartamentu (pola: `id`,
  `name`, `category`, `capacity`, `bedrooms`, `area`, `address`, `description`,
  `images`, `amenities`, `previoRoomId`) jest już zgodna z tym, czego oczekuje
  reszta strony, więc wystarczy podmienić źródło danych.

### 4. Zdjęcia — apartamentów, atrakcji, Parkingu i Śniadania
Wszystkie zdjęcia na stronie to na razie wygenerowane, kolorowe placeholdery
(SVG) z podpisem — nie prawdziwe fotografie. Są dwa sposoby, żeby je
podmienić na prawdziwe:

- **Najwygodniej: przez panel administracyjny** (`backend/`, adres
  `/admin`) — logujesz się, wybierasz apartament/atrakcję/Parking/
  Śniadania i wgrywasz zdjęcia przyciskiem, bez dotykania kodu. To
  jedyny sposób, który nie wymaga edytowania plików ręcznie. Patrz
  `backend/README.md`.
- **Ręcznie w kodzie** (jeśli nie używasz backendu): pole `images` w
  `js/config-data.js` (apartamenty, atrakcje) i sekcja `PAGES` tam
  samo (Parking, Śniadania) — wystarczy podmienić adres URL na
  zwykły link do zdjęcia (plik wgrany do `assets/images/` na
  hostingu albo link do zdjęcia hostowanego gdzie indziej).

### 5. Logo
W `assets/images/` znajdują się dwie wersje logo P&J — złota (`logo-gold.png`,
używana w nagłówku, stopce, ikonie karty i danych strukturalnych) i
czarno-biała (`logo-black.png`, na razie nieużywana — możesz np. użyć jej na
jasnym tle w materiałach do druku). Kolory całej strony (`css/style.css`,
sekcja `:root`) zostały dopasowane do koloru złota z logo. Jest tam też
`hero-rynek-glowny.jpg` — zdjęcie Rynku Głównego użyte w tle strony głównej.

### 6. Mapa Google
Mapa działa od razu, bez klucza API (użyty jest darmowy tryb `output=embed`).
Adres ustawiasz w `CONFIG.addressForMap` / `CONFIG.mapEmbedUrl` /
`CONFIG.mapLinkUrl`. Jeśli w przyszłości zechcesz interaktywną mapę z własnym
stylem czy wieloma pinezkami (np. po jednej na apartament), potrzebny będzie
już klucz Google Maps JavaScript API.

### 7. Formularz kontaktowy (`kontakt.html`)
Formularz na razie tylko pokazuje komunikat potwierdzenia w przeglądarce —
**nic nie wysyła**. Żeby wiadomości faktycznie do Was docierały, podepnij:
- usługę typu Formspree / Getform (dodanie `action` w formularzu), **lub**
- własny skrypt po stronie serwera / integrację z PREVIO (jeśli oferuje
  odbieranie zapytań gości).

### 8. Transfery, parking, śniadania — cenniki
Cena transferu (`transfery.html`) jest wpisana na sztywno w HTML, zgodnie z
podaną stawką (150/200/250 zł wg liczby pasażerów) — edytuj bezpośrednio
tabelę w pliku, jeśli się zmieni. Ceny i opisy Parkingu i Śniadania da się
za to edytować także przez panel administracyjny (`/admin`), razem ze
zdjęciami — patrz punkt 4.

## SEO

Strona ma podstawy pod pozycjonowanie na frazy typu „apartamenty Kraków
Stare Miasto”, „wynajem apartamentów Kraków centrum” itp.:

- każda podstrona ma osobny, unikalny `<title>` i `<meta name="description">`
  z lokalnymi frazami kluczowymi (Stare Miasto, Floriańska, Rynek Główny),
- każda podstrona ma też tagi Open Graph (`og:title`, `og:description`,
  `og:image`) pod udostępnianie w social media,
- strona główna ma dane strukturalne (JSON-LD, typ `LodgingBusiness`) z
  adresem i telefonem — pomaga to Google zrozumieć, że to obiekt noclegowy
  w Krakowie,
- zdjęcia apartamentów mają opisowy atrybut `alt` (nazwa apartamentu +
  kategoria), zamiast być tylko tłem CSS,
- jest `robots.txt` i `sitemap.xml` z listą głównych podstron.

**Ważne — do zrobienia przy wdrożeniu:**
- W `index.html` (JSON-LD), `robots.txt` i `sitemap.xml` wpisany jest adres
  `https://www.apartmentcracow.com/` — podmień go, jeśli strona ma działać
  pod innym adresem/domeną.
- Strona apartamentu (`apartament.html`) renderuje treść przez JavaScript na
  podstawie `?id=`, więc wszystkie 90 apartamentów dzieli jeden plik i jeden
  adres URL-wzorzec — dobre dla utrzymania, ale nie tak mocne pod SEO, jak
  osobna, w pełni statyczna podstrona na każdy apartament. Jeśli zależy Wam
  na tym, by pojedyncze apartamenty same w sobie pojawiały się wysoko w
  Google, warto docelowo wygenerować dla każdego apartamentu osobny,
  statyczny plik HTML (np. automatycznie, na bazie danych z PREVIO) zamiast
  jednego wspólnego szablonu.

## Uruchomienie lokalnie
To zwykłe pliki statyczne — wystarczy otworzyć `index.html` w przeglądarce,
albo (żeby uniknąć ograniczeń przeglądarki przy plikach lokalnych) odpalić
prosty serwer, np.:

```
python3 -m http.server 8000
```

i wejść na `http://localhost:8000`.

## Hosting docelowy
Strona jest w pełni statyczna — działa na dowolnym hostingu (własny serwer,
GitHub Pages, Netlify, Vercel, itd.), bez potrzeby backendu poza formularzem
kontaktowym (patrz punkt 7).
