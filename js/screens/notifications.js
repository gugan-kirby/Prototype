import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { formatDate } from '../core/format.js';
import { go } from '../core/router.js';
import { toast } from '../core/ui.js';
import { listNotifications, markAllRead, markRead } from '../services/notifications.js';
import { session } from '../services/auth.js';

export default {
  name: 'notifications',
  guard: () => (session() ? null : '/welcome'),
  load: () => listNotifications(),
  view: (items) => html`
    <header class="center-head">
      <button class="icon-btn" data-back="/home" aria-label="Back">${icon('back')}</button><h1>Notifications</h1>
    </header>
    <section class="note-list">
      ${items.length === 0 && html`<div class="state"><p>No notifications yet.</p></div>`}
      ${items.some((item) => !item.read) && html`<button class="link note-all" id="read-all">Mark all as read</button>`}
      ${items.map((item) => html`<button class="note ${item.read ? '' : 'unread'}" data-id="${item.id}" data-link="${item.link}">
        <strong>${item.title}</strong><span>${item.body}</span><small>${formatDate(item.date)}</small></button>`)}
    </section>`,
  mount(root, _, ctx) {
    root.querySelector('#read-all')?.addEventListener('click', async () => {
      try {
        await markAllRead();
        ctx.refresh();
      } catch (error) {
        toast(error.message, 'bad');
      }
    });
    root.querySelectorAll('.note').forEach((note) => {
      note.onclick = async () => {
        try {
          await markRead(note.dataset.id);
          go(note.dataset.link);
        } catch (error) {
          toast(error.message, 'bad');
        }
      };
    });
  },
};
