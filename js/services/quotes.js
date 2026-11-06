import { ApiError, request, store } from '../core/api.js';
import { session } from './auth.js';
import { notify } from './notifications.js';

const withVendor = (quote) => ({ ...quote, vendor: store.find('vendors', quote.vendorId) });

function ownEnquiry(id) {
  const enquiry = store.find('enquiries', id);
  if (!enquiry || enquiry.customerId !== session()?.userId) throw new ApiError('This enquiry could not be found.');
  return enquiry;
}

export const enquiryWithQuotes = (id) => request(() => {
  const enquiry = ownEnquiry(id);
  return {
    enquiry: { ...enquiry, categoryName: store.find('categories', enquiry.category)?.name },
    quotes: store.where('quotes', (quote) => quote.enquiryId === id).sort((a, b) => a.amount - b.amount).map(withVendor),
  };
});

export const quoteDetails = (id) => request(() => {
  const quote = store.find('quotes', id);
  if (!quote) throw new ApiError('This quote could not be found.');
  const enquiry = ownEnquiry(quote.enquiryId);
  return {
    quote: withVendor(quote),
    enquiry: { ...enquiry, categoryName: store.find('categories', enquiry.category)?.name },
  };
});

export const enquiriesWithQuotes = () => request(() => {
  const userId = session()?.userId;
  const quotes = store.all('quotes');
  return store.where('enquiries', (item) => item.customerId === userId)
    .map((item) => ({
      ...item,
      categoryName: store.find('categories', item.category)?.name,
      quoteCount: quotes.filter((quote) => quote.enquiryId === item.id).length,
    }))
    .filter((item) => item.quoteCount > 0);
});

export const acceptQuote = (quoteId) => request(() => {
  const quote = store.find('quotes', quoteId);
  if (!quote) throw new ApiError('This quote could not be found.');
  const enquiry = ownEnquiry(quote.enquiryId);
  if (quote.status !== 'Submitted' || enquiry.status !== 'Quoted') throw new ApiError('This quote can no longer be accepted.');
  const today = store.meta().today;
  if (quote.validUntil < today) throw new ApiError('This quote has expired.');

  const vendor = store.find('vendors', quote.vendorId);
  const number = store.nextNumber('order');
  const order = store.insert('orders', {
    id: `ORD-${number}`,
    enquiryId: enquiry.id,
    quoteId: quote.id,
    customerId: enquiry.customerId,
    vendorId: quote.vendorId,
    partName: enquiry.partName,
    category: enquiry.category,
    material: enquiry.material,
    quantity: enquiry.quantity,
    unit: enquiry.unit,
    amount: quote.amount,
    date: today,
    status: 'In Progress',
    stage: 0,
    history: [{ stage: 0, date: today }],
  });
  const invoiceNumber = store.nextNumber('invoice');
  const invoice = store.insert('invoices', {
    id: `INV-2025-${String(invoiceNumber).padStart(3, '0')}`,
    orderId: order.id,
    customerId: enquiry.customerId,
    amount: quote.amount,
    date: today,
    dueDate: new Date(Date.parse(today) + 3 * 86400000).toISOString().slice(0, 10),
    status: 'Unpaid',
  });

  store.update('quotes', quote.id, { status: 'Accepted' });
  store.update('enquiries', enquiry.id, { status: 'Closed', orderId: order.id });
  store.where('quotes', (item) => item.enquiryId === enquiry.id && item.id !== quote.id).forEach((other) => {
    store.update('quotes', other.id, { status: 'Declined' });
    const loser = store.find('vendors', other.vendorId);
    if (loser?.userId) notify(loser.userId, 'Quote not selected', `${enquiry.partName}: the customer chose another quote.`, '/v/quotes');
  });
  if (vendor?.userId) notify(vendor.userId, 'New order received', `${order.id}: ${order.partName}, ${order.quantity} ${order.unit}`, `/v/orders/${order.id}`);
  notify(enquiry.customerId, 'Order confirmed', `${order.id} placed with ${vendor?.name}.`, `/orders/${order.id}`);
  return { order, invoice };
});
