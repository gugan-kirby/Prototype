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
  staffOnly();
  const vendor = store.update('vendors', id, { verified });
  if (vendor.userId) {
    notify(vendor.userId, verified ? 'Account verified' : 'Verification removed', verified ? 'You can now quote for enquiries.' : 'Contact JobWork to restore your verification.', '/v/home');
  }
});

export const listUsers = () => request(() => {
  staffOnly();
  return store.all('users').map(({ password, ...user }) => user);
});

export const setUserStatus = (id, status) => request(() => {
  adminOnly();
  if (id === session().userId) throw new ApiError('You cannot suspend your own account.');
  store.update('users', id, { status });
});

export const listRecords = () => request(() => {
  staffOnly();
  const userName = (id) => store.find('users', id)?.name ?? id;
  const vendorName = (id) => store.find('vendors', id)?.name ?? id;
  return {
    enquiries: store.all('enquiries').map((item) => [item.id, item.partName, userName(item.customerId), `${item.quantity} ${item.unit}`, item.date, item.status]),
    orders: store.all('orders').map((item) => [item.id, item.partName, userName(item.customerId), vendorName(item.vendorId), item.amount, item.status]),
    invoices: store.all('invoices').map((item) => [item.id, item.orderId, userName(item.customerId), item.amount, item.dueDate, item.status]),
    payments: store.all('payments').map((item) => [item.id, item.invoiceId ?? item.type, userName(item.customerId), item.amount, item.method, item.date]),
  };
});
