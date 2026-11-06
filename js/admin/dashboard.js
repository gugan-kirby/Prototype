import { html } from '../core/html.js';
import { overview } from '../services/admin.js';

export default {
  name: 'admin-dashboard',
  load: () => overview(),
  view: (data) => html`
    <h1 class="admin-title">Dashboard</h1>
    <div class="admin-stats">
      ${[['Customers', data.customers], ['Vendors', data.vendors], ['Awaiting Verification', data.awaiting], ['Open Enquiries', data.enquiries], ['Orders in Progress', data.orders], ['Unpaid Invoices', data.unpaid]]
        .map(([label, value]) => html`<div class="admin-stat"><strong>${value}</strong><span>${label}</span></div>`)}
    </div>`,
};
