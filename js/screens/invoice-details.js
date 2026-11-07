import { saveBlob } from '../core/files.js';
import { formatDate, rupees } from '../core/format.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { invoiceById, isPayable } from '../services/invoices.js';
import { memberArea } from './guards.js';
import { invoicePdf, openPayment } from './invoice-parts.js';

export default {
  name: 'invoice-details',
  guard: memberArea,
  load: ({ params }) => invoiceById(params.id),
  view(invoice) {
    const rows = [
      ['Invoice No.', invoice.id], ['Status', invoice.status], ['Invoice Date', formatDate(invoice.date)], ['Due Date', formatDate(invoice.dueDate)],
      ['Order', `#${invoice.orderId}`], ['Part Name', invoice.order?.partName], ['Vendor', invoice.vendor?.name], ['Amount', rupees(invoice.amount)],
    ];
    return html`
      <header class="center-head"><button class="icon-btn" data-go="/invoices" aria-label="Back">${icon('back')}</button><h1>Invoice Details</h1></header>
      <section class="qd">
        <h3 class="qd-title">Summary</h3>
        <dl class="qd-table">${rows.map(([label, value]) => html`<div><dt>${label}</dt><dd>${value}</dd></div>`)}</dl>
        <div class="invoice-actions">
          <button class="btn btn-outline" id="pdf">${icon('download')}Download PDF</button>
          ${isPayable(invoice) && html`<button class="btn btn-primary" id="pay">Pay Now</button>`}
        </div>
      </section>`;
  },
  mount(root, invoice, ctx) {
    root.querySelector('#pdf').onclick = () => saveBlob(invoicePdf(invoice), `${invoice.id}.pdf`);
    root.querySelector('#pay')?.addEventListener('click', () => openPayment(invoice, ctx.refresh));
  },
};
