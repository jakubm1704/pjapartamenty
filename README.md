# P&J Apartamenty — strona internetowa

Strona (HTML/CSS/JS, bez frameworków) działa w pełni sama, jako zwykłe
pliki statyczne — ale w folderze `backend/` czeka też opcjonalny,
gotowy do uruchomienia **backend z panelem administracyjnym**
(logowanie + edycja apartamentów/atrakcji/Parkingu/Śniadania + upload
zdjęć), który po uruchomieniu automatycznie zasila tę stronę realnymi
danymi. Szczegóły w `backend/README.md` — to najważniejsza lektura,
jeśli chcecie samodzielnie zarządzać treścią i zdjęciami.

## ✅ Lista rzeczy do zrobienia przed wrzuceniem strony na hosting

Zaznaczaj kolejne punkty po kolei. Nie wszystko jest konieczne od razu —
punkty oznaczone **(wymagane)** muszą być zrobione przed publikacją.

### A. Treści i dane
- [ ] **(wymagane)** Prawdziwe zdjęcia apartamentów — wgraj je w panelu `/admin`
      (po uruchomieniu backendu). Do czasu wgrania widać grafiki zastępcze.
      Zdjęcia zmniejsz do ok. 1600 px szerokości i zapisz jako JPG/WebP (lżejsza,
      szybsza strona = lepsze pozycjonowanie).
- [ ] **(wymagane)** Dane firmy w `js/config-data.js` (`CONFIG`): adres, telefon,
      e-mail. Sprawdź, czy e-mail `info@apartmentcracow.com` jest właściwy.
- [ ] Linki do social mediów w `CONFIG` (`facebookUrl`, `instagramUrl`) —
      wpisane: facebook.com/PJapartments i instagram.com/pj_apartments.
- [ ] Opinie Google: dopisz kolejne w `CONFIG.reviews` (`js/config-data.js`),
      w formie `{ name, rating, text }`. Link do wizytówki: `CONFIG.googleReviewsUrl`.
- [ ] Zdjęcie w tle bloku opinii — podmień `assets/images/hero-rynek-glowny.jpg`
      w `index.html` (sekcja `#reviews`) na własne.
- [ ] Opisy najważniejszych apartamentów — dopisz własne teksty w `/admin`
      (unikalne opisy lepiej się pozycjonują niż generowane z szablonu).
- [ ] Apartament **Floriańska House**: sprawdź dane (osoby, metraż, łóżka) w `/admin` —
      zostały wyliczone z trzech studiów Yellow/Black/Blue.

### B. Formularz kontaktowy
- [ ] **(wymagane)** Podłącz wysyłkę wiadomości (obecnie formularz tylko udaje wysyłkę) —
      patrz punkt 7 niżej. Usuń wtedy zdanie „Formularz jest wersją demonstracyjną”
      z `kontakt.html`.

### C. Prawo i RODO
- [ ] **(wymagane)** Daj `polityka-prywatnosci.html` i `regulamin.html` do przeczytania
      osobie znającej RODO (prawnik / IOD). Teksty przygotowano jako wzór, nie jako
      poradę prawną.
- [ ] **(wymagane)** Potwierdź dane administratora w polityce: adres siedziby
      (ul. Lubicz 17e lok. 8, Kraków), NIP 6772261034, adres e-mail do spraw danych.
- [ ] Regulamin: zapisy §4 i §7 o „bezzwrotnej” opłacie warto skonsultować z prawnikiem
      (ochrona konsumentów).
- [ ] Gdy zmienisz wersję regulaminu, podmień też PDF `assets/docs/regulamin-pj-apartamenty.pdf`.

### D. Google Analytics i reklamy Meta (opcjonalne)
- [ ] Załóż konto Google Analytics 4 i skopiuj identyfikator pomiaru (`G-XXXXXXXXXX`).
- [ ] Załóż piksel w Meta Business Suite / Menedżerze zdarzeń i skopiuj jego numer.
- [ ] Wpisz oba w `js/config-data.js` → `CONFIG.tracking` (`gaMeasurementId`, `metaPixelId`).
      Dopóki są puste — nic się nie ładuje i baner zgód się nie pokazuje.
      Po wpisaniu baner pojawi się sam. Podgląd baneru bez ID: dodaj do adresu `?cookie-banner=1`.
- [ ] W Meta ustaw zgodę dla użytkowników z UE; w Google Analytics wyłącz zbieranie danych
      reklamowych, jeśli ich nie używasz.
- [ ] Zajrzyj do polityki prywatności (sekcja „Cookies”) — jeśli dodasz kolejne narzędzia,
      dopisz je do tabeli i zwiększ `VERSION` w `js/consent.js`, żeby baner zapytał o zgodę ponownie.

### E. Silnik rezerwacji Previo
- [ ] **(wymagane)** Po wdrożeniu przetestuj na prawdziwej domenie: strona główna →
      „Szukaj dostępności” oraz „Zarezerwuj” na wybranych apartamentach (powinien
      otwierać się właściwy apartament z datami). Identyfikator apartamentu na stronie
      = ID pokoju w Previo.
- [ ] Jeśli dojdzie nowy apartament: dopisz go w `js/config-data.js` (`APARTMENTS_RAW`) z ID z Previo
      i zwiększ `APARTMENTS_DATA_VERSION`.

### F. Domena, SEO
- [ ] **(wymagane)** Adres `https://www.apartmentcracow.com/` jest wpisany w `index.html` (JSON-LD),
      `robots.txt`, `sitemap.xml` i w backendzie (zmienna `SITE_URL`). Zmień wszędzie,
      jeśli domena będzie inna.
- [ ] Po publikacji: dodaj stronę w **Google Search Console** i zgłoś `sitemap.xml`.
- [ ] Załóż / uzupełnij wizytówkę **Google Business Profile** (Floriańska 39).
- [ ] Sprawdź stronę w PageSpeed Insights i na securityheaders.com.
- [ ] Wersja angielska — na razie przełącznik EN jest tylko przygotowany
      (`CONFIG.englishSiteUrl` jest puste). Wersję EN zrobimy osobno (podstrony `/en/` z `hreflang`).

## 🚀 Jak wrzucić stronę na hosting (backend + panel `/admin`)

Strona działa z backendem Node.js, który serwuje też same pliki strony, panel
`/admin`, zdjęcia i ładne adresy apartamentów (np. `/florianska-12`). Dlatego
potrzebny jest hosting, który uruchamia programy Node.js i ma **trwały dysk**
(na hostingu bez trwałego dysku wgrane zdjęcia znikną!).
**Nie nadają się:** GitHub Pages, Netlify, Vercel (pliki wgrane przez admina by znikały).

### Wariant 1 — Railway lub Render (wszystko w przeglądarce, bez Terminala)
Pełna instrukcja krok po kroku (z porównaniem cen) jest w dokumencie „Wdrożenie strony P&J Apartamenty — krok po kroku”. W skrócie:
1. Wgraj zawartość projektu do **prywatnego** repozytorium na GitHubie (Add file → Upload files). Nie wgrywaj `.env`.
2. Railway: New Project → Deploy from GitHub repo (albo Render: New → Web Service). Pól Build/Start **nie zmieniaj** —
   `package.json` w głównym folderze instaluje backend (`npm install`) i startuje go (`npm start`).
   Na Renderze wpisz Build `npm install`, Start `npm start` i wybierz płatny plan (Free nie ma dysku).
3. Dodaj trwały dysk (Railway: Volume, Render: Disk) zamontowany w `/data`.
4. W Variables / Environment ustaw: `NODE_ENV=production`, `DATA_DIR=/data`, `ADMIN_USERNAME`,
   `ADMIN_PASSWORD` (min. 10 znaków; wpisz TYLKO tu), `SITE_URL=https://www.apartmentcracow.com`.
   Na czas testu dodaj `NOINDEX=true` (Google nie zaindeksuje testowego adresu) — przy publikacji usuń.
   `SESSION_SECRET` jest opcjonalny (bez niego serwer losuje klucz, a po restarcie trzeba zalogować się ponownie).
5. Wygeneruj adres testowy (Railway: Settings → Networking → Generate Domain), sprawdź stronę i `/admin`,
   zrób Redeploy i upewnij się, że wgrane zdjęcie nadal jest (dysk działa).
6. Dopiero potem: plan płatny, własna domena (wpisy DNS wg instrukcji hostingu), usunięcie `NOINDEX`,
   zgłoszenie `sitemap.xml` w Google Search Console.

Hasła i klucze wpisuj **tylko** w panelu hostingu (Variables), nigdy w czacie ani w repozytorium.
(Opcja dla zaawansowanych: zamiast `ADMIN_PASSWORD` można podać gotowy hash w `ADMIN_PASSWORD_HASH`,
wygenerowany poleceniem `node scripts/hash-password.js "Hasło"` w folderze `backend`.)

### Wariant 2 — własny serwer VPS (stała cena, wymaga Terminala)
Np. Hetzner/OVH, Ubuntu: zainstaluj Node 20, wgraj projekt, w `backend/` uruchom
`npm install --omit=dev`, skopiuj `.env.example` do `.env` i uzupełnij zmienne jak wyżej,
uruchom przez PM2 (`pm2 start server.js`), postaw Nginx jako reverse proxy na port 3001
i włącz HTTPS (`certbot --nginx`). Włącz firewall (porty 22, 80, 443).

### Po wdrożeniu — dbaj o kopię zapasową
Cała baza to plik `content.json` oraz folder `uploads/` (przy `DATA_DIR` — oba w tym folderze).
Raz w tygodniu pobieraj kopię tego folderu (na VPS np. przez `scp`/SFTP; na Railway sposób
pobrania zawartości Volume opisuje dokumentacja Railway — warto go sprawdzić zanim dodasz zdjęcia).
Zdjęcia trzymaj też u siebie na komputerze, w oryginale.

### Ważne po aktualizacji plików
Gdy podmieniasz pliki strony, zrób twarde odświeżenie w przeglądarce (Mac: Cmd+Shift+R).
Po zmianie danych apartamentów w kodzie zwiększ `APARTMENTS_DATA_VERSION` w `js/config-data.js` —
backend sam zaktualizuje listę przy starcie i zachowa wgrane zdjęcia.

Struktura:

```
index.html          — strona główna (wyszukiwarka, kategorie, mapa, mini-kontakt)
apartamenty.html     — siatka 80 apartamentów, filtr kategorii, paginacja
apartament.html      — szablon strony pojedynczego apartamentu (czyta ?id=), z karuzelą zdjęć
en/                  — angielska wersja całej strony (index, apartments, apartment, attractions, attraction, booking, breakfast, contact, parking, tours, transfers, privacy-policy, terms)
rezerwacja.html      — silnik rezerwacji Previo (przyjmuje ?apartment=&checkin=&checkout=&guests=)
transfery.html       — transfery lotniskowe (cennik wg liczby osób)
parking.html         — parking podziemny dla gości, z karuzelą zdjęć
sniadania.html       — śniadania z dostawą do apartamentu, z karuzelą zdjęć
wycieczki.html       — wycieczki + link do Kraków Direct
okolica.html         — atrakcje w okolicy: Stare Miasto, Kazimierz, Podgórze, każda ze zdjęciem i linkiem do szczegółów
atrakcja.html        — szablon strony pojedynczej atrakcji (czyta ?id=)
kontakt.html         — mapa (ładowana po kliknięciu), dane kontaktowe, formularz
polityka-prywatnosci.html — polityka prywatności, RODO, cookies
regulamin.html       — regulamin najmu (pełny tekst + PDF w assets/docs/)
css/style.css        — cały wygląd strony (kolory dopasowane do logo P&J)
js/config-data.js    — KONFIGURACJA + dane apartamentów/atrakcji + opcjonalne pobieranie z backendu
js/main.js           — logika: nawigacja, filtrowanie, paginacja, karuzele, opinie, formularze
js/consent.js        — baner zgód na cookies, Google Analytics 4 i Meta Pixel (po zgodzie)
assets/images/       — logo P&J (złote i czarno-białe) oraz zdjęcie hero strony głównej
robots.txt, sitemap.xml — podstawy SEO dla wyszukiwarek (sitemap.xml zapasowy; backend generuje własny, dwujęzyczny)
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
  `images`, `amenities`) jest już zgodna z tym, czego oczekuje
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
podaną stawką (Kraków-Balice / Katowice-Pyrzowice: 1–4 osoby 150 / 600 zł, 5–6 osób 200 / 800 zł, 7–8 osób 300 / 1200 zł, 9+ osób cena do ustalenia) — edytuj bezpośrednio
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
  podstawie `?id=`. **Gdy działa backend** (Railway/VPS), każdy apartament ma
  własny, ładny adres (`/florianska-12`, a po angielsku `/en/florianska-12`),
  a serwer wpisuje w kod HTML tytuł, opis, adres kanoniczny, `hreflang` i
  dane strukturalne (JSON-LD) tego apartamentu — Google widzi je bez
  uruchamiania JavaScriptu. Sam hosting statyczny (bez backendu) też działa,
  ale wtedy apartamenty mają adresy `apartament.html?id=…` i słabsze SEO.
- `sitemap.xml` generuje backend na bieżąco (wszystkie widoczne apartamenty,
  obie wersje językowe, z powiązaniami `hreflang`). Plik `sitemap.xml` w
  repozytorium to wersja zapasowa na wypadek hostingu bez backendu.
  Po uruchomieniu strony dodaj `https://www.apartmentcracow.com/sitemap.xml`
  w Google Search Console.

## 🇬🇧 Wersja angielska (`/en/`)

Cała strona ma angielską wersję w folderze `en/` (13 plików: strona główna,
apartamenty, szablon apartamentu, okolica, szablon atrakcji, rezerwacja,
śniadania, kontakt, parking, wycieczki, transfery, polityka prywatności,
regulamin). To osobne strony pod osobnymi adresami — to najlepszy wariant pod SEO
(Google indeksuje każdy język osobno, a znaczniki `hreflang` mówią mu, która
wersja jest dla kogo). Przełącznik **PL | EN** jest w nagłówku każdej strony
i prowadzi do odpowiednika danej podstrony (także dla apartamentów i atrakcji).

- **Teksty stałe** (nagłówki, opisy sekcji) edytujesz bezpośrednio w plikach
  `en/*.html`. Jeśli zmieniasz polski tekst na stronie, pamiętaj o zmianie
  też w odpowiedniku w `en/` (lub poproś mnie — zrobię to za Ciebie).
- **Teksty dynamiczne** (przyciski, etykiety, filtry) są w słowniku `I18N`
  w `js/main.js`; dane apartamentów, atrakcji i opinii mają pola z
  końcówką `_en` w `js/config-data.js` (np. `description_en`).
- **Treści z panelu /admin**: przy apartamentach, atrakcjach, Parkingu i
  Śniadaniach jest sekcja „Wersja angielska (EN)”. Jeśli jej nie wypełnisz,
  strona pokaże automatyczne tłumaczenie standardowych elementów (typ
  apartamentu, piętro, łóżka, udogodnienia, adres) albo tekst polski.
- **Teksty prawne (`en/privacy-policy.html`, `en/terms.html`)** to tłumaczenia
  poglądowe z adnotacją, że wiążąca jest wersja polska. Wymagają
  sprawdzenia przez prawnika, tak samo jak polskie.
- Banner cookies i mapa także przełączają się na angielski automatycznie.

## ➕ Dodawanie i zarządzanie apartamentami z panelu /admin

(działa po wdrożeniu backendu na hostingu z trwałym dyskiem — patrz wyżej)

- **+ Nowy apartament** (lewy górny róg zakładki „Apartamenty”): podajesz
  **ID z PREVIO**, nazwę, liczbę sypialni, piętro, metraż, liczbę osób, łóżka
  i udogodnienia (klimatyzacja, wanna, balkon, pralka). Strona sama wygeneruje
  adres (`/nazwa`, `/en/nazwa`), opis PL/EN i dane do Google. Potem wgrywasz
  zdjęcia w edytorze apartamentu.
- **ID z PREVIO jest obowiązkowe** — według niego przycisk „Zarezerwuj”
  otwiera właściwy apartament w silniku rezerwacji.
- Zdjęcia, opisy (PL i EN), udogodnienia, adres — edytujesz w tym samym miejscu.
- **Ukryj na stronie** — apartament znika z listy, wyszukiwarki i sitemapy,
  ale nie jest usuwany (można go przywrócić).
- **Usuń** — możliwe tylko dla apartamentów dodanych w panelu. Apartamenty z
  listy startowej tylko się ukrywa (inaczej wróciłyby po aktualizacji danych).
- Aktualizacja listy startowej (`APARTMENTS_DATA_VERSION`) **nie nadpisuje**
  apartamentów edytowanych w panelu ani dodanych ręcznie, ani wgranych zdjęć.

## Uruchomienie lokalnie
To zwykłe pliki statyczne — wystarczy otworzyć `index.html` w przeglądarce,
albo (żeby uniknąć ograniczeń przeglądarki przy plikach lokalnych) odpalić
prosty serwer, np.:

```
python3 -m http.server 8000
```

i wejść na `http://localhost:8000`.

## Hosting docelowy
Strona wymaga hostingu z Node.js i trwałym dyskiem (backend z panelem `/admin`
serwuje też pliki strony i ładne adresy apartamentów). Instrukcja krok po kroku
jest na górze tego pliku: „Jak wrzucić stronę na hosting”. Samo przeglądanie strony
bez backendu (pliki lokalne) też działa, ale bez panelu, uploadu zdjęć i adresów `/slug`.
