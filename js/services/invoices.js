import { ApiError, request, store } from '../core/api.js';
import { session } from './auth.js';
import { notify } from './notifications.js';

const decorate = (invoice) => {
  const order = store.find('orders', invoice.orderId);
  const overdue = invoice.status === 'Unpaid' && invoice.dueDate < store.meta().today;
  return {
    ...invoice,
    status: overdue ? 'Overdue' : invoice.status,
    order,
    vendor: order && store.find('vendors', order.vendorId),
    today: store.meta().today,
    wallet: store.find('users', invoice.customerId)?.wallet ?? 0,
  };
};

export const myInvoices = () => request(() => {
  const userId = session()?.userId;
  return store.where('invoices', (invoice) => invoice.customerId === userId).map(decorate);
});

export const invoiceById = (id) => request(() => {
  const invoice = store.find('invoices', id);
  if (!invoice || invoice.customerId !== session()?.userId) throw new ApiError('This invoice could not be found.');
  return decorate(invoice);
});

export const payInvoice = (id, method) => request(() => {
  const invoice = store.find('invoices', id);
  if (!invoice || invoice.customerId !== session()?.userId) throw new ApiError('This invoice could not be found.');
  if (invoice.status === 'Paid') throw new ApiError('This invoice is already paid.');
  if (method === 'Wallet') {
    const user = store.find('users', invoice.customerId);
    if ((user.wallet ?? 0) < invoice.amount) throw new ApiError('Your wallet balance is too low.');
    store.update('users', user.id, { wallet: user.wallet - invoice.amount });
  }
  const today = store.meta().today;
  store.update('invoices', id, { status: 'Paid', paidOn: today });
  const payment = store.insert('payments', {
    id: `P-${store.nextNumber('payment')}`, invoiceId: id, customerId: invoice.customerId, amount: invoice.amount, method, type: 'Payment', status: 'Success', date: today,
  });
  const order = store.find('orders', invoice.orderId);
  const vendor = order && store.find('vendors', order.vendorId);
  if (vendor?.userId) notify(vendor.userId, 'Payment received', `${invoice.id} for ${order.partName} has been paid.`, `/v/orders/${order.id}`);
  return payment;
});

export const paymentsOverview = () => request(() => {
  const userId = session()?.userId;
  const month = store.meta().today.slice(0, 7);
  const invoices = store.where('invoices', (invoice) => invoice.customerId === userId).map(decorate);
  const transactions = store.where('payments', (payment) => payment.customerId === userId).sort((a, b) => b.date.localeCompare(a.date));
  return {
    invoices,
    transactions,
    wallet: store.find('users', userId)?.wallet ?? 0,
    paidThisMonth: transactions.filter((item) => item.type === 'Payment' && item.date.startsWith(month)).reduce((sum, item) => sum + item.amount, 0),
    pending: invoices.filter((invoice) => invoice.status !== 'Paid').reduce((sum, invoice) => sum + invoice.amount, 0),
  };
});

export const addMoney = (amount) => request(() => {
  const user = store.find('users', session()?.userId);
  if (!user) throw new ApiError('Please log in again.');
  store.update('users', user.id, { wallet: (user.wallet ?? 0) + amount });
  return store.insert('payments', {
    id: `P-${store.nextNumber('payment')}`, invoiceId: null, customerId: user.id, amount, method: 'UPI', type: 'Wallet Top-up', status: 'Success', date: store.meta().today,
  });
});
