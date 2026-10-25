// Cienki klient HTTP do REST API PREVIO.
//
// Dokumentacja PREVIO (wymaga konta / dostępu API, który jest płatną,
// dodatkową usługą — patrz README.md w tym folderze):
//   - Ogólne informacje o dostępie do API: https://help.previo.app/en/doc/api-access/
//   - Podręcznik REST API:                https://rest.apidocs.previo.app/
//   - Podręcznik XML API (pełniejsze):     https://xml.apidocs.previo.app/
//
// PREVIO REST API:
//   - adres bazowy: https://api.previo.app
//   - autoryzacja nagłówkiem: `Authorization: ApiKey {apikey}`
//
// UWAGA: dokładne ścieżki endpointów (np. lista pokoi/apartamentów,
// dostępność w danym terminie) trzeba zweryfikować w panelu
// developerskim PREVIO po otrzymaniu dostępu API — pełna, przeglądalna
// lista endpointów jest w interaktywnym podręczniku REST (link wyżej)
// i wymaga zalogowania / konta. Miejsca poniżej oznaczone `TODO`
// wskazują dokładnie, co należy tam wstawić.

const axios = require("axios");

const baseURL = process.env.PREVIO_API_BASE_URL || "https://api.previo.app";
const apiKey = process.env.PREVIO_API_KEY;

const client = axios.create({
  baseURL,
  timeout: 10000,
  headers: apiKey ? { Authorization: `ApiKey ${apiKey}` } : {},
});

if (!apiKey){
  console.warn(
    "[previoClient] Brak PREVIO_API_KEY w zmiennych środowiskowych — " +
    "wywołania do PREVIO będą kończyć się błędem 401, dopóki nie uzupełnisz .env"
  );
}

/**
 * Pobiera listę kategorii/typów pokoi (roomKind) z PREVIO.
 * TODO: podmień ścieżkę `/roomkinds` na właściwą z podręcznika REST API
 * PREVIO, jeśli różni się w Waszej wersji API.
 */
async function fetchRoomKinds(){
  const { data } = await client.get("/roomkinds"); // TODO: zweryfikuj ścieżkę
  return data;
}

/**
 * Pobiera listę pokoi/apartamentów (room) z PREVIO.
 * TODO: podmień ścieżkę `/rooms` na właściwą z podręcznika REST API PREVIO.
 */
async function fetchRooms(){
  const { data } = await client.get("/rooms"); // TODO: zweryfikuj ścieżkę
  return data;
}

/**
 * Pobiera dostępność pokoi w zadanym terminie.
 * TODO: podmień ścieżkę i parametry na właściwe z podręcznika REST API
 * PREVIO — PREVIO może też wymagać osobnego wywołania dla cen (EQC API).
 */
async function fetchAvailability({ checkin, checkout, guests }){
  const { data } = await client.get("/availability", { // TODO: zweryfikuj ścieżkę
    params: { checkin, checkout, guests },
  });
  return data;
}

module.exports = { client, fetchRoomKinds, fetchRooms, fetchAvailability };
