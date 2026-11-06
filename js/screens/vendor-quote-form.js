import { store } from '../core/api.js';
import { formatDate } from '../core/format.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { go } from '../core/router.js';
import { busy, setFieldError, toast } from '../core/ui.js';
import { submitQuote, vendorEnquiry } from '../services/vendors.js';
import { vendorArea } from './guards.js';

const TERMS = ['50% advance, 50% on delivery', '100% advance', '100% on delivery', '30 days credit'];

const field = (name, label, type = 'text', placeholder = '', value = '') => html`<div class="form-row"><label class="form-label" for="${name}">${label}</label>
  <div class="box" data-name="${name}"><input id="${name}" name="${name}" type="${type}" placeholder="${placeholder}" value="${value}"></div></div>`;

const wholeNumber = (value) => /^[1-9]\d{0,7}$/.test(value.trim());

export default {
  name: 'vendor-quote-form',
  guard: vendorArea,
  load: ({ params }) => vendorEnquiry(params.id),
  view: ({ enquiry }) => html`
    <header class="center-head"><button class="icon-btn" data-go="/v/enquiries/${enquiry.id}" aria-label="Back">${icon('back')}</button><h1>Submit Quote</h1></header>
    <section class="pf-section">
      <p class="pf-note">${enquiry.partName}, ${enquiry.quantity} ${enquiry.unit}</p>
      <form id="section-form" novalidate>
        ${field('amount', 'Quote Amount (₹)', 'text', 'Enter total amount')}
        ${field('leadDays', 'Lead Time (Days)', 'text', 'Enter days')}
        ${field('minQty', 'Min. Quantity', 'text', 'Enter minimum quantity', String(enquiry.quantity))}
        <div class="form-row"><label class="form-label" for="paymentTerms">Payment Terms</label>
          <div class="select"><select id="paymentTerms" name="paymentTerms">${TERMS.map((term) => html`<option>${term}</option>`)}</select>${icon('chevronDown')}</div></div>
        ${field('validUntil', 'Valid Until', 'date')}
        <div class="form-row"><label class="form-label" for="notes">Notes</label>
          <div class="area"><textarea id="notes" name="notes" maxlength="300" placeholder="Anything the customer should know"></textarea></div></div>
        <button class="btn btn-primary" type="submit">Submit Quote</button>
      </form>
    </section>`,
  mount(root, { enquiry }) {
    const form = root.querySelector('#section-form');
    const { today } = store.meta();
    form.onsubmit = (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form));
      const problems = {
        amount: wholeNumber(values.amount) ? '' : 'Enter a whole amount above zero.',
        leadDays: wholeNumber(values.leadDays) ? '' : 'Enter the lead time in days.',
        minQty: wholeNumber(values.minQty) ? '' : 'Enter a minimum quantity.',
        validUntil: values.validUntil >= today ? '' : `Enter a date from ${formatDate(today)} onwards.`,
      };
      Object.entries(problems).forEach(([name, problem]) => setFieldError(root.querySelector(`[data-name="${name}"]`), problem));
      if (Object.values(problems).some(Boolean)) return;
      busy(form.querySelector('[type=submit]'), async () => {
        try {
          await submitQuote(enquiry.id, {
            amount: Number(values.amount), leadDays: Number(values.leadDays), minQty: Number(values.minQty),
            gstPercent: 18, paymentTerms: values.paymentTerms, validUntil: values.validUntil, notes: values.notes.trim(),
          });
          toast('Quote submitted.', 'ok');
          go(`/v/enquiries/${enquiry.id}`);
        } catch (error) {
          toast(error.message, 'bad');
        }
      });
    };
  },
};
