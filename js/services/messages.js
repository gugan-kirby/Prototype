import { ApiError, request, store } from '../core/api.js';
import { session } from './auth.js';
import { notify } from './notifications.js';

export const threadFor = (vendorId) => request(() => {
  const vendor = store.find('vendors', vendorId);
  if (!vendor) throw new ApiError('This vendor could not be found.');
  const customerId = session()?.userId;
  return { vendor, messages: store.where('messages', (item) => item.vendorId === vendorId && item.customerId === customerId) };
});

export const sendMessage = (vendorId, text) => request(() => {
  const vendor = store.find('vendors', vendorId);
  if (!vendor) throw new ApiError('This vendor could not be found.');
  const customerId = session().userId;
  const message = store.insert('messages', {
    id: `m-${store.nextNumber('message')}`, customerId, vendorId, from: 'customer', text, date: store.meta().today,
  });
  if (vendor.userId) notify(vendor.userId, 'New message', text.slice(0, 80), `/v/chat/${customerId}`);
  return message;
});
