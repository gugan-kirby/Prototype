import { request, store } from '../core/api.js';
import { html } from '../core/html.js';
import { appHeader } from './shell.js';
import { customerArea } from './guards.js';

const ACTIONS = [
  { label: 'New Enquiry', art: 'qa-new', path: '/enquiry/new' },
  { label: 'My Enquiries', art: 'qa-enquiries', path: '/enquiries' },
  { label: 'RFQ / Quotes', art: 'qa-quotes', path: '/quotes' },
  { label: 'Orders', art: 'qa-orders', path: '/orders' },
  { label: 'Invoices', art: 'qa-invoices', path: '/invoices' },
  { label: 'Payments', art: 'qa-payments', path: '/payments' },
];

export default {
  name: 'home',
  tabs: 'home',
  guard: customerArea,
  load: () => request(() => ({ categories: store.where('categories', (item) => item.top) })),
  view: ({ categories }) => html`
    ${appHeader()}
    <section class="home">
      <button class="banner" data-gate="/enquiry/new" aria-label="Start a new enquiry">
        <strong>Precision Work.</strong><span>On Time, Every Time.</span>
      </button>
      <h2 class="home-title">Quick Actions</h2>
      <div class="actions">
        ${ACTIONS.map((action) => html`<button class="action" data-gate="${action.path}">
          <img src="assets/img/${action.art}.png" alt=""><span>${action.label}</span></button>`)}
      </div>
      <h2 class="home-title home-title-cats">Top Categories</h2>
      <div class="cats">
        ${categories.map((item) => html`<button class="cat cat-${item.id}" data-gate="/enquiry/new?category=${item.id}">
          <img src="assets/img/${item.image}.png" alt=""><span>${item.name}</span></button>`)}
      </div>
    </section>`,
};
