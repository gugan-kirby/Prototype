import { ApiError, request, store } from '../core/api.js';

const SESSION_KEY = 'jobwork.session';

export const homeFor = (role) => ({ customer: '/home', vendor: '/v/home' }[role] ?? '/');

export function session() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}

function startSession(data) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  return data;
}

export function endSession() { localStorage.removeItem(SESSION_KEY); }

export const continueAsGuest = () => startSession({ guest: true, role: 'customer' });

const digits = (value) => value.replace(/\D/g, '').slice(-10);

export function findAccount(identifier) {
  const needle = identifier.trim().toLowerCase();
  return store.where('users', (user) => user.email === needle || user.mobile === digits(needle))[0] ?? null;
}

export const login = (identifier, password) => request(() => {
  const user = findAccount(identifier);
  if (!user || user.password !== password) throw new ApiError('Incorrect email, mobile number or password.');
  if (user.status === 'suspended') throw new ApiError('This account is suspended. Contact JobWork support.');
  return startSession({ userId: user.id, role: user.role });
});

export const requestPasswordReset = (identifier) => request(() => {
  if (!findAccount(identifier)) throw new ApiError('No account uses that email or mobile number.');
});
