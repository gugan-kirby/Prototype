// Uploaded files are too large for localStorage, so their bytes live in
// IndexedDB and records keep only the metadata.
const DB_NAME = 'jobwork.files';
const STORE = 'files';

function open() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new Error('Could not open file storage.'));
  });
}

async function run(mode, work) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = work(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(new Error('Could not save the file.'));
  });
}

export async function putFile(file) {
  const id = `f-${crypto.randomUUID()}`;
  await run('readwrite', (store) => store.put(file, id));
  return { id, name: file.name, size: file.size };
}

export const getFile = (id) => run('readonly', (store) => store.get(id));
export const deleteFile = (id) => run('readwrite', (store) => store.delete(id));

export function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function fileSize(bytes) {
  return bytes < 1048576 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
}
