import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../../js/core/store.js';
import { html, raw } from '../../js/core/html.js';

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
}

const seed = () => ({ meta: { counters: { order: 1 } }, items: [{ id: 'a', qty: 1 }] });

test('seeds on first use and persists changes', () => {
  const storage = memoryStorage();
  createStore({ storage, seed: seed() }).update('items', 'a', { qty: 2 });
  assert.equal(createStore({ storage, seed: seed() }).find('items', 'a').qty, 2);
});

test('returned rows are copies, so callers cannot mutate the database', () => {
  const store = createStore({ storage: memoryStorage(), seed: seed() });
  store.find('items', 'a').qty = 99;
  assert.equal(store.find('items', 'a').qty, 1);
});

test('reset restores the seed', () => {
  const store = createStore({ storage: memoryStorage(), seed: seed() });
  store.insert('items', { id: 'b' });
  store.reset();
  assert.equal(store.all('items').length, 1);
});

test('falls back to the seed when saved data is corrupt', () => {
  const storage = memoryStorage();
  storage.setItem('jobwork.db.v1', '{broken');
  assert.equal(createStore({ storage, seed: seed() }).all('items').length, 1);
});

test('counters increment and persist', () => {
  const store = createStore({ storage: memoryStorage(), seed: seed() });
  assert.equal(store.nextNumber('order'), 2);
  assert.equal(store.nextNumber('order'), 3);
});

test('unknown collections are rejected', () => {
  const store = createStore({ storage: memoryStorage(), seed: seed() });
  assert.throws(() => store.all('nope'), /Unknown collection/);
});

test('html escapes values unless marked raw', () => {
  assert.equal(String(html`<p>${'<b>'}</p>`), '<p>&lt;b&gt;</p>');
  assert.equal(String(html`<p>${raw('<b>')}</p>`), '<p><b></p>');
  assert.equal(String(html`${[1, html`<i></i>`, null]}`), '1<i></i>');
});
