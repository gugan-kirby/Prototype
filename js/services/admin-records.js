import { ApiError, request, store } from '../core/api.js';
import { rupees, formatDate } from '../core/format.js';
import { staffOnly } from './admin.js';
import { invoiceStatus, isPayable, settleInvoice } from './invoices.js';
import { notify } from './notifications.js';
import { STAGES } from './orders.js';

const TYPES = ['enquiries', 'orders', 'invoices', 'payments'];
const CUSTOMER_PAGES = { enquiries: '/enquiries', orders: '/orders', invoices: '/invoices' };

function findRecord(type, id) {
  const item = TYPES.includes(type) ? store.find(type, id) : null;
  if (!item) throw new ApiError('This record could not be found.');
  return item;
}

function linkedRecords(type, item) {
  const invoice = type === 'invoices' ? item : item.invoiceId ? store.find('invoices', item.invoiceId) : null;
  const order = type === 'orders' ? item : store.find('orders', invoice?.orderId)
    ?? (type === 'enquiries' ? store.where('orders', (row) => row.enquiryId === item.id)[0] : null);
  return {
    enquiry: type === 'enquiries' ? item : order?.enquiryId ? store.find('enquiries', order.enquiryId) : null,
    order: order ?? null,
    invoice: invoice ?? store.where('invoices', (row) => row.orderId === order?.id)[0] ?? null,
  };
}

function recipientsFor(type, item, order) {
  const customer = store.find('users', item.customerId);
  const vendor = order && store.find('vendors', order.vendorId);
  const page = CUSTOMER_PAGES[type];
  return [
    customer && { userId: customer.id, label: `${customer.name} (Customer)`, link: page ? `${page}/${item.id}` : '/payments' },
    vendor?.userId && { userId: vendor.userId, label: `${vendor.name} (Vendor)`, link: `/v/orders/${order.id}` },
  ].filter(Boolean);
}

function actionsFor(type, item, invoice) {
  if (type === 'enquiries') return item.status === 'Closed' ? [] : ['close-enquiry'];
  if (type === 'invoices') return isPayable(item) ? ['mark-paid'] : [];
  if (type === 'orders' && item.status === 'In Progress' && invoice?.status !== 'Paid') return ['cancel-order'];
  return [];
}

export const recordDetail = (type, id) => request(() => {
  staffOnly();
  const item = findRecord(type, id);
  const { enquiry, order, invoice } = linkedRecords(type, item);
  const live = type === 'invoices' ? { ...item, status: invoiceStatus(item) } : item;
  return {
    type,
    item: live,
    customerName: store.find('users', item.customerId)?.name ?? item.customerId,
    vendorName: order && store.find('vendors', order.vendorId)?.name,
    enquiryId: enquiry?.id,
    orderId: order?.id,
    invoiceId: invoice?.id,
    stage: order && STAGES[order.stage],
    quotes: type === 'enquiries'
      ? store.where('quotes', (quote) => quote.enquiryId === id).map((quote) => ({ ...quote, vendorName: store.find('vendors', quote.vendorId)?.name }))
      : [],
    actions: actionsFor(type, live, invoice),
    paidOrder: type === 'orders' && item.status === 'In Progress' && invoice?.status === 'Paid',
    recipients: recipientsFor(type, item, order).map(({ userId, label }) => ({ userId, label })),
    reminder: type === 'invoices' && isPayable(item) ? `Payment reminder: ${item.id} for ${rupees(item.amount)} is due on ${formatDate(item.dueDate)}.` : '',
  };
});

export const sendNotice = (type, id, userId, text) => request(() => {
  staffOnly();
  const item = findRecord(type, id);
  const recipient = recipientsFor(type, item, linkedRecords(type, item).order).find((entry) => entry.userId === userId);
  if (!recipient) throw new ApiError('This person cannot be notified about this record.');
  notify(recipient.userId, 'Message from JobWork', text, recipient.link);
});

export const closeEnquiry = (id) => request(() => {
  staffOnly();
  const enquiry = findRecord('enquiries', id);
  if (enquiry.status === 'Closed') throw new ApiError('This enquiry is already closed.');
  store.update('enquiries', id, { status: 'Closed' });
  store.where('quotes', (quote) => quote.enquiryId === id && quote.status === 'Submitted').forEach((quote) => {
    store.update('quotes', quote.id, { status: 'Declined' });
    const vendor = store.find('vendors', quote.vendorId);
    if (vendor?.userId) notify(vendor.userId, 'Enquiry closed', `${enquiry.partName} was closed by JobWork.`, '/v/quotes');
  });
  notify(enquiry.customerId, 'Enquiry closed', `${enquiry.partName} was closed by JobWork.`, `/enquiries/${id}`);
});

export const cancelOrder = (id) => request(() => {
  staffOnly();
  const order = findRecord('orders', id);
  if (order.status !== 'In Progress') throw new ApiError('Only orders in progress can be cancelled.');
  const invoice = store.where('invoices', (row) => row.orderId === id)[0];
  if (invoice?.status === 'Paid') throw new ApiError('This order is paid, so it cannot be cancelled.');
  store.update('orders', id, { status: 'Cancelled' });
  if (invoice) store.update('invoices', invoice.id, { status: 'Cancelled' });
  const vendor = store.find('vendors', order.vendorId);
  notify(order.customerId, 'Order cancelled', `${order.id} ${order.partName} was cancelled by JobWork.`, `/orders/${id}`);
  if (vendor?.userId) notify(vendor.userId, 'Order cancelled', `${order.id} ${order.partName} was cancelled by JobWork.`, `/v/orders/${id}`);
});

export const markInvoicePaid = (id) => request(() => {
  staffOnly();
  const invoice = findRecord('invoices', id);
  if (!isPayable(invoice)) throw new ApiError('This invoice can no longer be paid.');
  settleInvoice(invoice, 'Recorded by JobWork');
  notify(invoice.customerId, 'Payment recorded', `${invoice.id} has been marked as paid.`, `/invoices/${id}`);
});
