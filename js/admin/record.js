import { formatDate, rupees } from '../core/format.js';
import { html } from '../core/html.js';
import { busy, setFieldError, sheet, toast } from '../core/ui.js';
import { cancelOrder, closeEnquiry, markInvoicePaid, recordDetail, sendNotice } from '../services/admin-records.js';

const LABELS = { enquiries: 'Enquiry', orders: 'Order', invoices: 'Invoice', payments: 'Payment' };
const TONES = { Paid: 'good', Completed: 'good', Success: 'good', Quoted: 'good', Cancelled: 'bad', Overdue: 'bad' };
const MAX_NOTICE = 200;

const ACTIONS = {
  'close-enquiry': { label: 'Close Enquiry', run: closeEnquiry, done: 'Enquiry closed.', note: 'Close this enquiry? Open quotes will be declined, and this cannot be undone.' },
  'cancel-order': { label: 'Cancel Order', run: cancelOrder, done: 'Order cancelled.', note: 'Cancel this order? Its unpaid invoice will also be cancelled, and this cannot be undone.' },
  'mark-paid': { label: 'Mark as Paid', run: markInvoicePaid, done: 'Invoice marked as paid.', note: 'Record this invoice as paid? No money is collected, and this cannot be undone.' },
};

const link = (type, id) => (id ? html`<a class="admin-link" href="#/records/${type}/${id}">${id}</a>` : 'None');

const FIELDS = {
  enquiries: ({ item, customerName, orderId }) => [
    ['Customer', customerName], ['Part', item.partName], ['Sub Category', item.subcategory], ['Material', item.materialGrade ?? item.material],
    ['Quantity', `${item.quantity} ${item.unit}`], ['Delivery Location', item.location], ['Specifications', item.specifications || 'None'],
    ['Drawing', item.drawing?.name ?? 'None'], ['Date', formatDate(item.date)], ['Order', link('orders', orderId)],
  ],
  orders: ({ item, customerName, vendorName, stage, enquiryId, invoiceId }) => [
    ['Customer', customerName], ['Vendor', vendorName], ['Part', item.partName], ['Material', item.material], ['Quantity', `${item.quantity} ${item.unit}`],
    ['Amount', rupees(item.amount)], ['Date', formatDate(item.date)], ['Production Stage', stage], ['Enquiry', link('enquiries', enquiryId)], ['Invoice', link('invoices', invoiceId)],
  ],
  invoices: ({ item, customerName, vendorName, orderId }) => [
    ['Customer', customerName], ['Vendor', vendorName], ['Order', link('orders', orderId)], ['Amount', rupees(item.amount)], ['Invoice Date', formatDate(item.date)],
    ['Due Date', formatDate(item.dueDate)], ['Paid On', item.paidOn ? formatDate(item.paidOn) : 'Not paid'],
  ],
  payments: ({ item, customerName, invoiceId }) => [
    ['Customer', customerName], ['Invoice', link('invoices', invoiceId)], ['Type', item.type], ['Method', item.method], ['Amount', rupees(item.amount)], ['Date', formatDate(item.date)],
  ],
};

const quoteTable = (quotes) => html`<h2 class="admin-subtitle">Quotes</h2>
  <table class="admin-table"><thead><tr><th>Quote</th><th>Vendor</th><th>Amount</th><th>Status</th></tr></thead>
    <tbody>${quotes.map((quote) => html`<tr><td>${quote.id}</td><td>${quote.vendorName}</td><td>${rupees(quote.amount)}</td><td>${quote.status}</td></tr>`)}</tbody></table>`;

function confirmAction(action, { item }, ctx) {
  const { label, note, run, done } = ACTIONS[action];
  sheet({
    title: label,
    body: html`<p class="sheet-note">${item.id}: ${note}</p>
      <button class="btn btn-primary" id="action-confirm">${label}</button>
      <button class="btn btn-outline" id="action-back">Go Back</button>`,
    mount(node, close) {
      node.querySelector('#action-back').onclick = close;
      node.querySelector('#action-confirm').onclick = (event) => busy(event.currentTarget, async () => {
        try {
          await run(item.id);
          close();
          toast(done, 'ok');
          ctx.refresh();
        } catch (error) {
          close();
          toast(error.message, 'bad');
        }
      });
    },
  });
}

export default {
  name: 'admin-record',
  load: ({ params }) => recordDetail(params.type, params.id),
  view(data) {
    const { type, item, actions, paidOrder, recipients, reminder, quotes } = data;
    return html`
      <a class="admin-link admin-back" href="#/records?table=${type}">Back to Records</a>
      <h1 class="admin-title">${LABELS[type]} ${item.id} <span class="admin-pill ${TONES[item.status] ?? 'warn'}">${item.status}</span></h1>
      <div class="admin-detail">
        <div>
          <dl class="admin-fields">${FIELDS[type](data).map(([label, value]) => html`<div><dt>${label}</dt><dd>${value}</dd></div>`)}</dl>
          ${quotes.length > 0 && quoteTable(quotes)}
        </div>
        <aside class="admin-panel">
          ${actions.length > 0 && html`<h2 class="admin-subtitle">Actions</h2>
            ${actions.map((action) => html`<button class="admin-act" data-action="${action}">${ACTIONS[action].label}</button>`)}`}
          ${paidOrder && html`<p class="admin-note">This order is paid, so it cannot be cancelled.</p>`}
          <h2 class="admin-subtitle">Send a Notification</h2>
          <form id="notice" novalidate>
            <select id="notice-to" aria-label="Send to">${recipients.map((person) => html`<option value="${person.userId}">${person.label}</option>`)}</select>
            <textarea id="notice-text" data-name="notice" rows="4" maxlength="${MAX_NOTICE}" placeholder="Write a message..." aria-label="Message">${reminder}</textarea>
            <button class="admin-act" id="notice-send">Send</button>
          </form>
        </aside>
      </div>`;
  },
  mount(root, data, ctx) {
    root.querySelectorAll('[data-action]').forEach((button) => {
      button.onclick = () => confirmAction(button.dataset.action, data, ctx);
    });
    const text = root.querySelector('#notice-text');
    const send = root.querySelector('#notice-send');
    root.querySelector('#notice').addEventListener('submit', (event) => {
      event.preventDefault();
      const message = text.value.trim();
      setFieldError(text, message ? '' : 'Write a message first.');
      if (!message) return;
      busy(send, async () => {
        try {
          await sendNotice(data.type, data.item.id, root.querySelector('#notice-to').value, message);
          text.value = '';
          toast('Notification sent.', 'ok');
        } catch (error) {
          toast(error.message, 'bad');
        }
      });
    });
  },
};
