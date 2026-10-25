// Zamienia surowe dane z PREVIO na obiekt „apartamentu” w kształcie,
// jakiego oczekuje front-end (patrz js/config-data.js w głównym
// folderze strony — pola: id, name, category, capacity, bedrooms,
// area, address, description, images, amenities).
//
// UWAGA: nazwy pól po stronie `raw` (np. `objId`, `roomName`) są
// PRZYKŁADOWE — podmień je na rzeczywiste nazwy pól, jakie zwraca
// Wasze konto PREVIO (zobacz odpowiedź z /rooms i /roomkinds w
// narzędziu typu Postman/curl, gdy już będziecie mieć dostęp API).

const CATEGORY_BY_BEDROOMS = {
  0: "studio",
  1: "1-sypialnia",
  2: "2-sypialnie",
};
function categoryFromBedrooms(bedrooms){
  return CATEGORY_BY_BEDROOMS[bedrooms] || "3-plus";
}

function mapPrevioRoomToApartment(raw, roomKindsById){
  const roomKind = roomKindsById.get(raw.obkId) || {}; // TODO: dopasuj klucz do realnej odpowiedzi PREVIO

  const bedrooms = roomKind.bedroomCount ?? 1; // TODO: dopasuj pole
  const capacity = roomKind.capacity ?? raw.capacity ?? 2; // TODO: dopasuj pole
  const area = roomKind.area ?? raw.area ?? null; // TODO: dopasuj pole

  return {
    id: raw.objId, // TODO: dopasuj pole (identyfikator pokoju/apartamentu)
    name: raw.roomName || roomKind.name || `Apartament ${raw.objId}`, // TODO
    category: categoryFromBedrooms(bedrooms),
    capacity,
    bedrooms,
    area,
    address: "Kraków", // TODO: PREVIO raczej nie przechowuje adresu per-pokój — można ustawić statycznie albo z własnej mapy adresów wg roomId
    description: roomKind.description || "", // TODO
    images: Array.isArray(roomKind.images) ? roomKind.images : [], // TODO
    amenities: Array.isArray(roomKind.amenities) ? roomKind.amenities : [], // TODO
  };
}

module.exports = { mapPrevioRoomToApartment };
