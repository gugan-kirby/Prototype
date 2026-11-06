import { formatDate } from '../core/format.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { vendorThreads } from '../services/vendors.js';
import { vendorArea } from './guards.js';

export default {
  name: 'vendor-messages',
  guard: vendorArea,
  load: () => vendorThreads(),
  view: (threads) => html`
    <header class="center-head"><button class="icon-btn" data-go="/v/home" aria-label="Back">${icon('back')}</button><h1>Messages</h1></header>
    <section class="note-list">
      ${threads.length === 0 && html`<div class="state"><p>No messages yet.</p></div>`}
      ${threads.map((thread) => html`<a class="note" href="#/v/chat/${thread.customerId}"><strong>${thread.name}</strong><span>${thread.last.text}</span><small>${formatDate(thread.last.date)}</small></a>`)}
    </section>`,
};
