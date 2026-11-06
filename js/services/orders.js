import { ApiError, request, store } from '../core/api.js';
import { session } from './auth.js';

// The brief's six production stages. The reference tracker groups them into four steps.
export const STAGES = ['Order Confirmed', 'Material Received', 'In Production', 'Quality Check', 'Dispatched', 'Delivered'];
export const STAGE_PROGRESS = [10, 30, 60, 75, 90, 100];

// Reference tracker steps: each covers one or more of the six stages.
export const TRACKER = [
  { label: 'Order Confirmed', short: ['Order', 'Confirmed'], glyph: 'check', from: 0, note: 'Your order has been received.' },
  { label: 'In Production', short: ['In', 'Production'], glyph: 'gear', from: 1, note: 'Manufacturing is in progress.' },
  { label: 'Out for Delivery', short: ['Out for', 'Delivery'], glyph: 'truck', from: 4, note: 'Your order will be dispatched soon.' },
  { label: 'Delivered', short: ['', 'Delivered'], glyph: 'box', from: 5, note: 'Order will be delivered to your location.' },
];

export const STAGE_NOTES = [
  'Your order is confirmed.', 'Your material has been received.', 'Your order is in production.',
  'Your order is in quality check.', 'Your order has been dispatched.', 'Your order has been delivered.',
];

export const trackerIndex = (stage) => TRACKER.reduce((found, step, index) => (stage >= step.from ? index : found), 0);

export const orderProgress = (order) => STAGE_PROGRESS[order.stage];

const decorate = (order) => ({
  ...order,
  vendor: store.find('vendors', order.vendorId),
  categoryName: store.find('categories', order.category)?.name,
});

export const myOrders = () => request(() => {
  const userId = session()?.userId;
  return store.where('orders', (order) => order.customerId === userId).map(decorate);
});

export const orderById = (id) => request(() => {
  const order = store.find('orders', id);
  if (!order || order.customerId !== session()?.userId) throw new ApiError('This order could not be found.');
  return decorate(order);
});
