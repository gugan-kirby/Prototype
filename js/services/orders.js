import { ApiError, request, store } from '../core/api.js';
import { session } from './auth.js';

// The brief's six production stages. The reference tracker groups them into four steps.
export const STAGES = ['Order Confirmed', 'Material Received', 'In Production', 'Quality Check', 'Dispatched', 'Delivered'];
export const STAGE_PROGRESS = [10, 30, 60, 75, 90, 100];

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
