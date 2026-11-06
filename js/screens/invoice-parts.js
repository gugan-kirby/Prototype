import { rupees, formatDate, daysBetween } from '../core/format.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { textPdf } from '../core/pdf.js';
import { busy, sheet, toast } from '../core/ui.js';
import { payInvoice } from '../services/invoices.js';

const METHODS = ['UPI', 'Credit / Debit Card', 'Net Banking'];

export const INVOICES_TAB = { id: 'invoices', label: 'Invoices', path: '/invoices', glyph: 'invoice', solid: 'invoiceFill' };

export function dueNote(invoice) {
  const days = daysBetween(invoice.today, invoice.dueDate);
  if (days < 0) return `Overdue by ${-days} ${days === -1 ? 'Day' : 'Days'} (${formatDate(invoice.dueDate)})`;
  if (days === 0) return `Due Today (${formatDate(invoice.dueDate)})`;
  return `Due in ${days} ${days === 1 ? 'Day' : 'Days'} (${formatDate(invoice.dueDate)})`;
}

export function openPayment(invoice, onPaid) {
  sheet({
    title: 'Pay Invoice',
    body: html`<p class="sheet-note">${invoice.id} for ${invoice.order?.partName}: <strong>${rupees(invoice.amount)}</strong></p>
      <div class="pay-methods" role="radiogroup" aria-label="Payment method">
        ${METHODS.map((method, index) => html`<label class="pay-method"><input type="radio" name="method" value="${method}" ${index === 0 ? 'checked' : ''}><span>${method}</span></label>`)}
      </div>
      <p class="sheet-note">This is a demo, so no real payment is taken.</p>
      <button class="btn btn-primary" id="pay-confirm">Pay ${rupees(invoice.amount)}</button>
      <button class="btn btn-outline" id="pay-cancel">Cancel</button>`,
    mount(node, close) {
      node.querySelector('#pay-cancel').onclick = close;
      node.querySelector('#pay-confirm').onclick = (event) => busy(event.currentTarget, async () => {
        try {
          await payInvoice(invoice.id, node.querySelector('[name=method]:checked').value);
          close();
          toast('Payment successful.', 'ok');
          onPaid();
        } catch (error) {
          close();
          toast(error.message, 'bad');
        }
      });
    },
  });
}

export const invoicePdf = (invoice) => textPdf(`Invoice ${invoice.id}`, [
  `Invoice date: ${formatDate(invoice.date)}`, `Due date: ${formatDate(invoice.dueDate)}`, `Status: ${invoice.status}`, '',
  `Order: ${invoice.orderId}`, `Part: ${invoice.order?.partName}`, `Vendor: ${invoice.vendor?.name}`,
  `Quantity: ${invoice.order?.quantity} ${invoice.order?.unit}`, '', `Amount: ${rupees(invoice.amount)}`,
]);
