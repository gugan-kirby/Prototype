import { ApiError, request, store } from '../core/api.js';
import { session } from './auth.js';

const me = () => {
  const user = store.find('users', session()?.userId);
  if (!user) throw new ApiError('Please log in again.');
  return user;
};

const digits = (value) => value.replace(/\D/g, '').slice(-10);

export const myProfile = () => request(() => {
  const user = me();
  return { ...user, addresses: store.where('addresses', (item) => item.userId === user.id) };
});

export const updateProfile = ({ name, email, mobile }) => request(() => {
  const user = me();
  const nextEmail = email.trim().toLowerCase();
  const nextMobile = digits(mobile);
  if (store.where('users', (item) => item.id !== user.id && item.email === nextEmail).length) throw new ApiError('Another account uses this email.');
  if (store.where('users', (item) => item.id !== user.id && item.mobile === nextMobile).length) throw new ApiError('Another account uses this mobile number.');
  return store.update('users', user.id, { name: name.trim(), email: nextEmail, mobile: nextMobile });
});

export const updateUser = (changes) => request(() => store.update('users', me().id, changes));

export const changePassword = (current, next) => request(() => {
  const user = me();
  if (user.password !== current) throw new ApiError('Your current password is incorrect.');
  store.update('users', user.id, { password: next });
});

export const addAddress = (address) => request(() => {
  const user = me();
  return store.insert('addresses', { id: `a-${store.nextNumber('address')}`, userId: user.id, isDefault: false, ...address });
});

export const removeAddress = (id) => request(() => {
  const address = store.find('addresses', id);
  if (!address || address.userId !== me().id) throw new ApiError('This address could not be found.');
  store.remove('addresses', id);
});

export const addPaymentMethod = (label, detail) => request(() => {
  const user = me();
  const method = { id: `pm-${store.nextNumber('method')}`, label, detail };
  store.update('users', user.id, { paymentMethods: [...(user.paymentMethods ?? []), method] });
});

export const removePaymentMethod = (id) => request(() => {
  const user = me();
  store.update('users', user.id, { paymentMethods: (user.paymentMethods ?? []).filter((item) => item.id !== id) });
});

export const raiseSupportRequest = (subject, message) => request(() => store.insert('supportRequests', {
  id: `S-${store.nextNumber('support')}`, userId: me().id, subject, message, date: store.meta().today, status: 'Open',
}));
