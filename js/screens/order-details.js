import { formatDate, rupees } from '../core/format.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { orderById, STAGES } from '../services/orders.js';
import { memberArea } from './guards.js';

export default {
  name: 'order-details',
  guard: memberArea,
  load: ({ params }) => orderById(params.id),
  view(order) {
    const rows = [
      ['Order No.', order.id], ['Part Name', order.partName], ['Category', order.categoryName], ['Material', order.material],
      ['Quantity', `${order.quantity} ${order.unit}`], ['Order Value', rupees(order.amount)], ['Order Date', formatDate(order.date)],
      ['Vendor', order.vendor.name], ['Vendor Location', `${order.vendor.city}, ${order.vendor.state}`],
    ];
    return html`
      <header class="center-head"><button class="icon-btn" data-go="/orders/${order.id}" aria-label="Back">${icon('back')}</button><h1>Order Details</h1></header>
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
