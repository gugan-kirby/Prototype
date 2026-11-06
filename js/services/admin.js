import { ApiError, request, store } from '../core/api.js';
import { session } from './auth.js';
import { notify } from './notifications.js';

const staffOnly = () => {
  const role = session()?.role;
  if (role !== 'admin' && role !== 'staff') throw new ApiError('You do not have access to this page.');
};

export const canManage = () => session()?.role === 'admin';

export const overview = () => request(() => {
  staffOnly();
  const vendors = store.all('vendors');
  return {
    customers: store.where('users', (user) => user.role === 'customer').length,
    vendors: vendors.length,
    awaiting: vendors.filter((vendor) => !vendor.verified).length,
    enquiries: store.where('enquiries', (item) => item.status !== 'Closed').length,
    orders: store.where('orders', (order) => order.status === 'In Progress').length,
    unpaid: store.where('invoices', (invoice) => invoice.status !== 'Paid').length,
  };
});

const adminOnly = () => {
  if (!canManage()) throw new ApiError('Only admins can make this change.');
};

export const listVendors = () => request(() => {
  staffOnly();
  return store.all('vendors').map((vendor) => ({ ...vendor, account: vendor.userId ? store.find('users', vendor.userId) : null }));
});

export const setVendorVerified = (id, verified) => request(() => {
  adminOnly();
  const vendor = store.update('vendors', id, { verified });
  if (vendor.userId) {
    notify(vendor.userId, verified ? 'Account verified' : 'Verification removed', verified ? 'You can now quote for enquiries.' : 'Contact JobWork to restore your verification.', '/v/home');
  }
});
