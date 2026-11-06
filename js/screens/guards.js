import { session } from '../services/auth.js';

export function customerArea() {
  const active = session();
  if (!active) return '/welcome';
  return active.role === 'customer' ? null : '/v/home';
}

export function memberArea() {
  const active = session();
  if (!active) return '/welcome';
  return active.guest ? '/home' : null;
}

export function vendorArea() {
  const active = session();
  if (!active) return '/welcome';
  return active.role === 'vendor' ? null : '/home';
}
