# Backend — panel administracyjny i (docelowo) integracja z PREVIO

Ten backend (Node.js/Express) daje Wam:

1. **Panel administracyjny pod `/admin`** — logowanie i zarządzanie
   treścią: 90 apartamentów, 12 atrakcji oraz stron Parking i
   Śniadania, razem ze zdjęciami (upload/usuwanie).
2. **Publiczne API** (`/api/apartments`, `/api/attractions`,
   `/api/pages/:slug`), z którego strona automatycznie korzysta, jeśli
   backend jest uruchomiony — patrz „Jak to się łączy z resztą strony”
   niżej.
3. **Szkielet pod przyszłą integrację z PREVIO** (`src/previoClient.js`)
   — na razie nieukończony, bo wymaga płatnego dostępu API, którego
   jeszcze nie macie. Szczegóły w sekcji „PREVIO” niżej.

## Szybki start

```
cd backend
npm install
cp .env.example .env
```

W `.env` koniecznie ustaw:
```
ADMIN_USERNAME=twoj_login
SESSION_SECRET=<losowy, długi ciąg znaków>
```

Hasło administratora generujesz osobnym poleceniem (nigdy nie wpisujcie
hasła jawnym tekstem do `.env`):
```
node scripts/hash-password.js "TwojeNoweHaslo123"
```
i wklejcie wypisany hash jako `ADMIN_PASSWORD_HASH` w `.env`.

Losowy `SESSION_SECRET` wygenerujecie np. tak:
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Uruchomienie:
```
npm start
```

Backend wystartuje na porcie 3001 (zmienna `PORT`) i będzie serwował
**jednocześnie**: całą stronę, panel `/admin` i API — patrz niżej,
dlaczego to wygodne i bezpieczne domyślne ustawienie.

Otwórz `http://localhost:3001/admin`, zaloguj się danymi z `.env`.

## Jak to się łączy z resztą strony

Front-end (`js/config-data.js`) **działa w pełni również bez
backendu** — wtedy pokazuje te same przykładowe dane, co wcześniej.
Ale przy starcie każdej strony po cichu próbuje też odpytać
`/api/apartments`, `/api/attractions`, `/api/pages/parking` i
`/api/pages/sniadania` (relatywny adres, z krótkim, ~2,5-sekundowym
limitem czasu). Jeśli te zapytania się powiodą — a powiodą się
dokładnie wtedy, gdy strona jest otwarta przez ten backend (bo
backend serwuje też pliki strony pod tym samym adresem) — dane i
zdjęcia z panelu `/admin` **automatycznie zastępują** dane
przykładowe. Jeśli backend nie działa (albo strona jest otwarta jako
zwykłe pliki, bez serwera), zapytania po prostu nie powiodą się i
strona po cichu zostaje przy danych lokalnych — nic się nie psuje.

**Praktyczny wniosek:** żeby zdjęcia i treści wgrywane w `/admin`
faktycznie były widoczne na żywej stronie, backend musi być
uruchomiony i to on musi serwować stronę (czyli wdrażacie `backend/`
razem z resztą plików, jednym poleceniem `npm start` na serwerze — nie
osobno). Front-end może też stać osobno (np. na zwykłym hostingu
statycznym) — wtedy trzeba doprecyzować adres API; napiszcie, jeśli
taki wariant będzie Wam potrzebny, dograsuję obsługę zmiennej z
adresem backendu.

## Bezpieczeństwo logowania — co jest zrobione i dlaczego

- **Hasło nigdy nie jest zapisane jawnym tekstem** — tylko jego hash
  (bcrypt) w `.env`, poza kodem i poza gitem (`.gitignore`).
- **Sesja logowania** to podpisane, `httpOnly` ciasteczko (niedostępne
  dla JavaScriptu w przeglądarce — chroni przed kradzieżą sesji przez
  XSS), z `SameSite=Lax` (chroni przed najprostszymi atakami CSRF) i
  `secure` (wymaga HTTPS) automatycznie włączanym w trybie produkcyjnym
  (`NODE_ENV=production`).
- **Limit prób logowania**: maksymalnie 10 prób na adres IP w ciągu 15
  minut na `/api/admin/login`, żeby utrudnić zgadywanie hasła
  (brute-force).
- **CORS jest domyślnie zamknięty** dla panelu administracyjnego — bez
  jawnego ustawienia `ALLOWED_ORIGIN` żadna inna domena nie może
  wykonywać żądań do `/api/admin/*` z ciasteczkiem sesji. (Publiczne,
  tylko-do-odczytu endpointy `/api/apartments` itp. są celowo
  otwarte — to jawne dane, bez ryzyka.)
- **Upload zdjęć jest zawężony**: tylko JPG/PNG/WEBP/GIF, maks. 8 MB,
  a nazwa i rozszerzenie zapisywanego pliku są generowane przez
  serwer (nigdy nie ufamy nazwie pliku od użytkownika) — zabezpieczenie
  przed przemycaniem złośliwych plików czy „path traversal”.
- **Podstawowe nagłówki bezpieczeństwa** (`helmet`) na każdej
  odpowiedzi.
- Dostęp do kodu i danych backendu (`/backend/...`, w tym `.env`) jest
  jawnie zablokowany w serwerze statycznym, mimo że backend serwuje
  też resztę strony z folderu nadrzędnego.

**Czego świadomie NIE zrobiono** (uczciwie o granicach tego
rozwiązania):
- Jest tylko **jedno konto** administratora — to rozwiązanie dla
  jednej osoby/zespołu z jednym wspólnym dostępem, nie system
  wielu kont z różnymi uprawnieniami.
- Sesje trzymane są w pamięci procesu (`MemoryStore`) — w pełni
  wystarczające dla jednego serwera i niewielkiego ruchu w panelu
  administracyjnym, ale restart serwera wyloguje wszystkich, a przy
  wielu instancjach backendu (load balancing) trzeba by przejść na
  współdzielony magazyn sesji (np. Redis).
- Nie ma osobnego tokenu CSRF na formularzach panelu — w tej
  konfiguracji (ciasteczko `SameSite=Lax` + domyślnie zamknięty CORS)
  ryzyko jest niskie, ale przy dalszej rozbudowie panelu warto to
  dodać.

## Bardzo ważne — trwały dysk na serwerze

Wgrane zdjęcia (`backend/uploads/`) i baza treści
(`backend/data/content.json`) to zwykłe pliki na dysku. **Część
hostingów (np. darmowe/tanie plany PaaS) kasuje pliki zapisane w
runtime przy każdym restarcie czy nowym wdrożeniu.** Wybierając
hosting pod ten backend, upewnij się, że ma **trwały dysk** (zwykły
VPS, albo PaaS z „persistent volume/disk”) — inaczej wgrane zdjęcia
znikną przy pierwszym restarcie serwera.

## Struktura

```
backend/
  server.js               — punkt wejścia (Express, sesje, CORS, limity)
  .env.example              — do skopiowania jako .env
  scripts/
    hash-password.js          — generator hasha hasła administratora
  data/
    content.json               — „baza danych” (apartamenty, atrakcje, strony)
  uploads/                     — wgrane zdjęcia (serwowane pod /uploads)
  public-admin/                 — panel administracyjny (statyczny front-end pod /admin)
  src/
    store.js                     — odczyt/zapis content.json
    auth.js                       — logowanie, middleware wymagający sesji
    upload.js                      — bezpieczna konfiguracja uploadu zdjęć
    seed.js                         — generuje content.json przy pierwszym uruchomieniu
    apartmentPages.js                — adresy /slug i /en/slug, sitemap.xml (PL+EN), hreflang, JSON-LD
    previoClient.js                  — połączenie z PREVIO (patrz niżej)
    mapApartment.js                   — mapowanie danych PREVIO → format strony (do dokończenia)
    routes/
      apartments.js, attractions.js, pages.js, availability.js  — publiczne API
      admin/
        auth.js, apartments.js, attractions.js, pages.js          — API panelu (chronione)
```

## PREVIO — stan na teraz

Backend ma przygotowany, ale **nieukończony** szkielet integracji z
PREVIO (`src/previoClient.js`), bo:

1. **Dostęp do API PREVIO to płatna, dodatkowa usługa** — trzeba go
   wykupić (lub poprosić o bezpłatny, ograniczony czasowo dostęp
   testowy) u opiekuna handlowego w PREVIO albo pod adresem
   **info@previo.cz**. Więcej: https://help.previo.app/en/doc/api-access/
2. Bez tego dostępu nie widzę dokładnych nazw endpointów i pól,
   jakie zwraca REST API PREVIO dla Waszego konta (pełny podręcznik,
   https://rest.apidocs.previo.app/, wymaga zalogowania). Wiem tylko
   tyle, że adresem bazowym jest `https://api.previo.app`, a
   autoryzacja odbywa się nagłówkiem `Authorization: ApiKey {klucz}`
   — to już jest wpisane w `src/previoClient.js`, reszta (dokładne
   ścieżki, nazwy pól) jest oznaczona komentarzami `TODO`.

**Docelowy plan**, gdy już będziecie mieć dostęp API: dopisać
endpoint administracyjny (np. „Synchronizuj z PREVIO” w panelu),
który pobiera z PREVIO nazwy, liczbę osób, sypialnie i metraż (dane,
które faktycznie tam są), ale **zostawia w spokoju zdjęcia i opisy
wgrane ręcznie przez Was w panelu** — więc jedno nie wyklucza
drugiego. Chętnie to dograsuję, gdy będziecie mieć działający dostęp
API i realne dane z PREVIO do przetestowania na żywo.
