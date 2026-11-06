import { ApiError, request, store } from '../core/api.js';
import { session } from './auth.js';

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
