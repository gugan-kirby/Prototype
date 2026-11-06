// JSON document store. data/db.json seeds it; every later change lives in
// localStorage, so all tabs of a browser share one database.
const KEY = 'jobwork.db.v1';

export function createStore({ storage, seed }) {
  let db = load();

  function load() {
    const saved = storage.getItem(KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.meta?.seedVersion === seed.meta?.seedVersion) return parsed;
      } catch { /* Corrupt data falls through to the seed. */ }
      storage.removeItem(KEY);
    }
    return structuredClone(seed);
  }

  function persist() { storage.setItem(KEY, JSON.stringify(db)); }

  const rows = (name) => {
    if (!Array.isArray(db[name])) throw new Error(`Unknown collection: ${name}`);
    return db[name];
  };

  return {
    meta: () => db.meta,
    all: (name) => structuredClone(rows(name)),
    find: (name, id) => structuredClone(rows(name).find((row) => row.id === id) ?? null),
    where: (name, test) => structuredClone(rows(name).filter(test)),

    insert(name, row) {
      rows(name).push(structuredClone(row));
      persist();
      return structuredClone(row);
    },

    update(name, id, changes) {
      const row = rows(name).find((item) => item.id === id);
      if (!row) throw new Error(`${name} ${id} not found`);
      Object.assign(row, structuredClone(changes));
      persist();
      return structuredClone(row);
    },

    remove(name, id) {
      db[name] = rows(name).filter((row) => row.id !== id);
      persist();
    },

    setMeta(changes) {
      Object.assign(db.meta, changes);
      persist();
    },

    nextNumber(counter) {
      db.meta.counters[counter] += 1;
      persist();
      return db.meta.counters[counter];
    },

    reload() { db = load(); },

    reset() {
      storage.removeItem(KEY);
      db = structuredClone(seed);
    },
  };
}
