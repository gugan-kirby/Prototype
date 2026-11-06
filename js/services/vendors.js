import { ApiError, request, store } from '../core/api.js';
import { session } from './auth.js';
import { notify } from './notifications.js';

export function currentVendor() {
  const userId = session()?.userId;
  const vendor = store.where('vendors', (item) => item.userId === userId)[0];
  if (!vendor) throw new ApiError('This vendor account could not be found.');
  return vendor;
}

export const openEnquiriesFor = (vendorId) => {
  const quoted = new Set(store.where('quotes', (quote) => quote.vendorId === vendorId).map((quote) => quote.enquiryId));
  const categories = store.all('categories');
  return store.where('enquiries', (item) => item.status !== 'Closed' && !quoted.has(item.id))
    .map((item) => ({ ...item, processName: item.process ?? categories.find((category) => category.id === item.category)?.name }))
    .sort((a, b) => (a.minutesAgo ?? Infinity) - (b.minutesAgo ?? Infinity) || b.date.localeCompare(a.date));
};

export const vendorDashboard = () => request(() => {
  const vendor = currentVendor();
  const month = store.meta().today.slice(0, 7);
  const orders = store.where('orders', (order) => order.vendorId === vendor.id && order.status !== 'Cancelled');
  const open = openEnquiriesFor(vendor.id);
  const revenue = orders.filter((order) => order.date.startsWith(month)).reduce((sum, order) => sum + order.amount, 0);
  return {
    vendor,
    newEnquiries: open.length,
    requests: open.slice(0, 3),
    quotesSent: store.where('quotes', (quote) => quote.vendorId === vendor.id).length,
    ordersReceived: orders.length,
    inProduction: orders.filter((order) => order.status === 'In Progress' && order.stage < 4).length,
    outForDelivery: orders.filter((order) => order.status === 'In Progress' && order.stage >= 4).length,
    completed: orders.filter((order) => order.status === 'Completed').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.amount, 0),
    revenue,
  };
});

export const vendorEnquiries = () => request(() => {
  const vendor = currentVendor();
  const quotes = store.where('quotes', (quote) => quote.vendorId === vendor.id);
  const categories = store.all('categories');
  const seen = store.where('enquiries', (item) => quotes.some((quote) => quote.enquiryId === item.id))
    .map((item) => ({ ...item, processName: item.process ?? categories.find((category) => category.id === item.category)?.name, quoted: true }));
  return [...openEnquiriesFor(vendor.id), ...seen];
});

export const vendorEnquiry = (id) => request(() => {
  const vendor = currentVendor();
  const enquiry = store.find('enquiries', id);
  if (!enquiry) throw new ApiError('This enquiry could not be found.');
  const customer = store.find('users', enquiry.customerId);
  return {
    vendor,
    enquiry: { ...enquiry, categoryName: store.find('categories', enquiry.category)?.name },
    customerName: customer?.company?.name ?? customer?.name,
    quote: store.where('quotes', (quote) => quote.enquiryId === id && quote.vendorId === vendor.id)[0] ?? null,
  };
});

export const submitQuote = (enquiryId, values) => request(() => {
  const vendor = currentVendor();
  if (!vendor.verified) throw new ApiError('You can quote once your account is verified.');
  const enquiry = store.find('enquiries', enquiryId);
  if (!enquiry || enquiry.status === 'Closed') throw new ApiError('This enquiry is no longer open.');
  if (store.where('quotes', (quote) => quote.enquiryId === enquiryId && quote.vendorId === vendor.id).length) throw new ApiError('You have already quoted for this enquiry.');
  const quote = store.insert('quotes', {
    id: `Q-${store.nextNumber('quote') + 100}`, enquiryId, vendorId: vendor.id, date: store.meta().today, status: 'Submitted', ...values,
  });
  store.update('enquiries', enquiryId, { status: 'Quoted' });
  notify(enquiry.customerId, 'New quote received', `${vendor.name} quoted for ${enquiry.partName}.`, `/enquiries/${enquiryId}`);
  return quote;
});
