import { formatDate, rupees } from '../core/format.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { STAGES } from '../services/orders.js';
import { vendorOrder } from '../services/vendors.js';
import { vendorArea } from './guards.js';

export default {
  name: 'vendor-order',
  guard: vendorArea,
  load: ({ params }) => vendorOrder(params.id),
  view(order) {
    const rows = [
      ['Order No.', order.id], ['Customer', order.customerName], ['Part Name', order.partName], ['Material', order.material],
      ['Quantity', `${order.quantity} ${order.unit}`], ['Order Value', rupees(order.amount)], ['Order Date', formatDate(order.date)],
    ];
    return html`
      <header class="center-head"><button class="icon-btn" data-go="/v/orders" aria-label="Back">${icon('back')}</button><h1>Order Details</h1></header>
      <section class="qd">
        <h3 class="qd-title">Summary</h3>
        <dl class="qd-table">${rows.map(([label, value]) => html`<div><dt>${label}</dt><dd>${value}</dd></div>`)}</dl>
        <h3 class="qd-title">Production Stages</h3>
        <ol class="stages">
          ${STAGES.map((stage, index) => {
            const entry = order.history.find((item) => item.stage === index);
            const done = order.status !== 'Cancelled' && index <= order.stage;
            return html`<li class="${done ? 'done' : ''}"><span>${done ? icon('check') : ''}</span><strong>${stage}</strong><time>${entry && done ? formatDate(entry.date) : 'Pending'}</time></li>`;
          })}
        </ol>
      </section>`;
  },
};
