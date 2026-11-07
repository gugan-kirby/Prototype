import { html } from '../core/html.js';
import { overview } from '../services/admin.js';

export default {
  name: 'admin-dashboard',
  load: () => overview(),
  view: (data) => html`
    <h1 class="admin-title">Dashboard</h1>
    <div class="admin-stats">
      ${[['Customers', data.customers, '/users'], ['Vendors', data.vendors, '/vendors'], ['Awaiting Verification', data.awaiting, '/vendors'],
        ['Open Enquiries', data.enquiries, '/records?table=enquiries'], ['Orders in Progress', data.orders, '/records?table=orders'], ['Unpaid Invoices', data.unpaid, '/records?table=invoices']]
        .map(([label, value, target]) => html`<a class="admin-stat" href="#${target}"><strong>${value}</strong><span>${label}</span></a>`)}
    </div>`,
};
