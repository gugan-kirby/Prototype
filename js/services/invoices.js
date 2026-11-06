import { ApiError, request, store } from '../core/api.js';
import { session } from './auth.js';
import { notify } from './notifications.js';

const decorate = (invoice) => {
  const order = store.find('orders', invoice.orderId);
  const overdue = invoice.status === 'Unpaid' && invoice.dueDate < store.meta().today;
  return { ...invoice, status: overdue ? 'Overdue' : invoice.status, order, vendor: order && store.find('vendors', order.vendorId), today: store.meta().today };
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
