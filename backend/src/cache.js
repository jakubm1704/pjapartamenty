// Bardzo prosty cache w pamięci procesu — wystarczający dla małego
// backendu jednego obiektu. Przy większym ruchu / kilku instancjach
// serwera warto zastąpić go np. Redisem.

const store = new Map();

function get(key){
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt){
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

function set(key, value, ttlSeconds){
  store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

function clear(){
  store.clear();
}

module.exports = { get, set, clear };
