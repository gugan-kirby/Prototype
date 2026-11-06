import { request, store } from '../core/api.js';
import { session } from './auth.js';

const mine = () => {
  const userId = session()?.userId;
  return store.where('notifications', (item) => item.userId === userId);
};

export const unreadCount = () => mine().filter((item) => !item.read).length;

export const listNotifications = () => request(() => mine().sort((a, b) => b.date.localeCompare(a.date)));

export const markRead = (id) => request(() => { store.update('notifications', id, { read: true }); });

export const markAllRead = () => request(() => {
  mine().filter((item) => !item.read).forEach((item) => store.update('notifications', item.id, { read: true }));
});

export function notify(userId, title, body, link) {
  store.insert('notifications', {
    id: `n-${store.nextNumber('notification')}`, userId, title, body, link, date: store.meta().today, read: false,
  });
}
