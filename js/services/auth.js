import { ApiError, request, store } from '../core/api.js';

const SESSION_KEY = 'jobwork.session';

export const homeFor = (role) => ({ customer: '/home', vendor: '/v/home' }[role] ?? '/');

function savedSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}

// Suspending an account also ends any session it already has open.
export function session() {
  const active = savedSession();
  if (active?.userId && store?.find('users', active.userId)?.status === 'suspended') {
    endSession();
    return null;
  }
  return active;
}

function startSession(data) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  return data;
}

export function currentUser() {
  const active = session();
  return active?.userId ? store.find('users', active.userId) : null;
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

export const register = ({ role, name, mobile, email, password }) => request(() => {
  const normalisedEmail = email.trim().toLowerCase();
  const normalisedMobile = digits(mobile);
  if (store.where('users', (user) => user.email === normalisedEmail).length) throw new ApiError('An account with this email already exists.');
  if (store.where('users', (user) => user.mobile === normalisedMobile).length) throw new ApiError('An account with this mobile number already exists.');
  const user = store.insert('users', {
    id: `u-${store.nextNumber('user')}`,
    role,
    name: name.trim(),
    email: normalisedEmail,
    mobile: normalisedMobile,
    password,
    status: 'active',
  });
  if (role === 'vendor') {
    store.insert('vendors', {
      id: `v-${user.id}`, userId: user.id, name: user.name, city: '', state: '', stateCode: '', rating: 0, reviews: 0, verified: false, tint: 'blue',
    });
  }
  return startSession({ userId: user.id, role });
});

export const requestPasswordReset = (identifier) => request(() => {
  if (!findAccount(identifier)) throw new ApiError('No account uses that email or mobile number.');
});
