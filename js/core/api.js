// Every service call passes through here, which gives screens the same loading
// and failure states a real backend would.
import { createStore } from './store.js';

const LATENCY_MS = 180;
const FAIL_KEY = 'jobwork.failNext';

export let store = null;

export async function connect() {
  const response = await fetch('data/db.json');
  if (!response.ok) throw new Error('Could not load data/db.json');
  store = createStore({ storage: localStorage, seed: await response.json() });
  addEventListener('storage', (event) => {
    if (event.key === 'jobwork.db.v1') store.reload();
  });
  return store;
}

export function useStore(instance) { store = instance; }

export class ApiError extends Error {}

export async function request(work) {
  await new Promise((resolve) => setTimeout(resolve, globalThis.localStorage ? LATENCY_MS : 0));
  if (globalThis.localStorage?.getItem(FAIL_KEY)) {
    localStorage.removeItem(FAIL_KEY);
    throw new ApiError('Could not reach JobWork. Please try again.');
  }
  return work();
}
