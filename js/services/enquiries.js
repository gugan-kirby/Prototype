import { request, store } from '../core/api.js';
import { session } from './auth.js';

const DRAFT_KEY = 'jobwork.enquiryDraft';

export function readDraft() {
  try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY)) ?? {}; } catch { return {}; }
}

export function saveDraft(changes) {
  const draft = { ...readDraft(), ...changes };
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  return draft;
}

export const clearDraft = () => sessionStorage.removeItem(DRAFT_KEY);

const locationName = (address) => `${address.city}, ${address.state}`;

export const enquiryOptions = () => request(() => {
  const userId = session()?.userId;
  return {
    ...store.meta().options,
    categories: store.all('categories'),
    locations: [...new Set(store.where('addresses', (item) => item.userId === userId).map(locationName))],
  };
});
