import { formatDate, rupees } from '../core/format.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { isPayable, myInvoices } from '../services/invoices.js';
import { memberArea } from './guards.js';
import { dateLine, listView, mountList, tile } from './list-page.js';
import { dueNote, INVOICES_TAB, openPayment } from './invoice-parts.js';

export const invoiceStatus = (status, label = status) => html`<span class="badge badge-${label.toLowerCase()}">${label === 'Paid' ? icon('okFilled') : label === 'Pending' ? icon('clock') : ''}${label}</span>`;

export const invoiceCard = (invoice, label) => {
  const paid = invoice.status === 'Paid';
  return html`<article class="inv-card">
    <a class="inv-main" href="#/invoices/${invoice.id}">
      ${paid ? tile('invoicePaid', 'green') : tile('invoice', 'blue')}
      <div class="card-body">
        <strong class="card-title">${invoice.id}</strong>
        <span class="card-meta">Order #${invoice.orderId}</span>
        ${dateLine(formatDate(invoice.date))}
      </div>
      <div class="inv-right">${invoiceStatus(invoice.status, label?.(invoice) ?? invoice.status)}<strong>${rupees(invoice.amount)}</strong></div>
      <span class="card-go">${icon('chevron')}</span>
    </a>
    ${isPayable(invoice) && html`<div class="inv-due">${icon('clock')}<span>${dueNote(invoice)}</span><button data-pay="${invoice.id}">Pay Now</button></div>`}
  </article>`;
};

const config = {
  title: 'Invoices',
  subtitle: 'View and manage your invoices and payments',
  placeholder: 'Search invoices...',
  empty: 'No invoices here yet.',
  tabs: [
    { label: 'All', test: () => true },
    { label: 'Unpaid', test: (invoice) => invoice.status === 'Unpaid' },
    { label: 'Paid', test: (invoice) => invoice.status === 'Paid' },
    { label: 'Overdue', test: (invoice) => invoice.status === 'Overdue' },
  ],
  card: (invoice) => invoiceCard(invoice),
  date: (invoice) => invoice.date,
  haystack: (invoice) => `${invoice.id} ${invoice.orderId} ${invoice.order?.partName} ${invoice.vendor?.name}`,
};

export function bindPay(root, invoices, ctx) {
  root.querySelector('#cards').addEventListener('click', (event) => {
    const button = event.target.closest('[data-pay]');
    if (button) openPayment(invoices.find((invoice) => invoice.id === button.dataset.pay), ctx.refresh);
  });
}

export default {
  name: 'invoices',
  tabs: 'invoices',
  lastTab: INVOICES_TAB,
  guard: memberArea,
  load: () => myInvoices(),
  view: (invoices) => listView(config, invoices),
  mount(root, invoices, ctx) {
    mountList(root, config, invoices);
    bindPay(root, invoices, ctx);
  },
};
