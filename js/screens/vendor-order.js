import { formatDate, rupees } from '../core/format.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { busy, sheet, toast } from '../core/ui.js';
import { STAGES } from '../services/orders.js';
import { advanceOrder, vendorOrder } from '../services/vendors.js';
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
        ${order.status === 'In Progress' && html`<div class="invoice-actions"><button class="btn btn-primary" id="advance">Mark as ${STAGES[order.stage + 1]}</button></div>`}
      </section>`;
  },
  mount(root, order, ctx) {
    root.querySelector('#advance')?.addEventListener('click', () => {
      const next = STAGES[order.stage + 1];
      sheet({
        title: 'Update Status',
        body: html`<p class="sheet-note">Mark ${order.id} as ${next}? The customer will be notified, and this cannot be undone.</p>
          <button class="btn btn-primary" id="advance-confirm">Mark as ${next}</button>
          <button class="btn btn-outline" id="advance-cancel">Cancel</button>`,
        mount(node, close) {
          node.querySelector('#advance-cancel').onclick = close;
          node.querySelector('#advance-confirm').onclick = (event) => busy(event.currentTarget, async () => {
            try {
              await advanceOrder(order.id);
              close();
              toast(`Marked as ${next}.`, 'ok');
              ctx.refresh();
            } catch (error) {
              close();
              toast(error.message, 'bad');
            }
          });
        },
      });
    });
  },
};
