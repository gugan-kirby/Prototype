import { fileSize, getFile, saveBlob } from '../core/files.js';
import { formatDate, rupees } from '../core/format.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { textPdf } from '../core/pdf.js';
import { toast } from '../core/ui.js';
import { specificationSummary } from '../services/enquiries.js';
import { quoteDetails } from '../services/quotes.js';
import { memberArea } from './guards.js';
import { confirmAccept } from './quote-parts.js';

function quotePdf(quote, enquiry) {
  const gst = Math.round(quote.amount * quote.gstPercent / 100);
  return textPdf(`Quote from ${quote.vendor.name}`, [
    `Quote date: ${formatDate(quote.date)}`, `Valid until: ${formatDate(quote.validUntil)}`, '',
    `Part: ${enquiry.partName}`, `Category: ${enquiry.categoryName}`, `Material: ${enquiry.materialGrade ?? enquiry.material}`,
    `Quantity: ${enquiry.quantity} ${enquiry.unit}`, `Delivery location: ${enquiry.location}`, '',
    `Unit price: ${rupees(quote.amount / enquiry.quantity)}`, `Amount: ${rupees(quote.amount)}`, `GST (${quote.gstPercent}%): ${rupees(gst)}`,
    `Total: ${rupees(quote.amount + gst)}`, '', `Lead time: ${quote.leadDays} days`, `Minimum quantity: ${quote.minQty} Nos`,
    `Payment terms: ${quote.paymentTerms}`, `Notes: ${quote.notes}`,
  ]);
}

export async function downloadAttachment(drawing) {
  const stored = drawing.id.startsWith('seed-') ? textPdf(drawing.name, ['Sample drawing for this demo.']) : await getFile(drawing.id);
  if (!stored) throw new Error('This file is no longer available.');
  saveBlob(stored, drawing.name);
}

export default {
  name: 'quote-details',
  guard: memberArea,
  load: ({ params }) => quoteDetails(params.id),
  view({ quote, enquiry }) {
    const { vendor } = quote;
    const gst = Math.round(quote.amount * quote.gstPercent / 100);
    const rows = [['Part / Job Name', enquiry.partName], ['Category', enquiry.categoryName], ['Material', enquiry.materialGrade ?? enquiry.material], ['Quantity', `${enquiry.quantity} ${enquiry.unit}`], ['Delivery Location', enquiry.location]];
    const terms = [
      ['Unit Price', rupees(quote.amount / enquiry.quantity)], ['GST', `${rupees(gst)} (${quote.gstPercent}%)`], ['Total Amount', rupees(quote.amount + gst)],
      ['Payment Terms', quote.paymentTerms], ['Validity', `Until ${formatDate(quote.validUntil)}`], ['Notes', quote.notes],
    ];
    return html`
      <header class="center-head"><button class="icon-btn" data-go="/enquiries/${enquiry.id}" aria-label="Back">${icon('back')}</button><h1>Quote Details</h1></header>
      <section class="qd">
        <div class="qd-vendor">
          <span class="qd-tile">${icon('factory')}</span>
          <div class="qd-who">
            <h2>${vendor.name}</h2>
            ${vendor.verified && html`<p class="qd-verified">${icon('verifiedSolid')}Verified Vendor</p>`}
            <p>${icon('pin')}${vendor.city}, ${vendor.state}</p>
            <p class="qd-rate">${icon('star')}${vendor.rating} (${vendor.reviews} Reviews)</p>
          </div>
          <div class="qd-contact">
            <a href="tel:+91${vendor.phone}" aria-label="Call ${vendor.name}">${icon('phone')}</a>
            <a href="#/chat/${vendor.id}" aria-label="Chat with ${vendor.name}">${icon('chat')}</a>
          </div>
        </div>
        <h3 class="qd-title">Quote Summary</h3>
        <div class="qd-summary">
          <div class="qd-figures">
            <div class="qd-amount"><span>Quote Amount</span><strong>${rupees(quote.amount)}</strong></div>
            <div class="qd-facts">
              <p>${icon('calendar')}<span>Lead Time: <b>${quote.leadDays} Days</b></span></p>
              <p>${icon('stack')}<span>Min. Quantity: <b>${quote.minQty} Nos</b></span></p>
            </div>
          </div>
          <div class="qd-actions">
            <button class="btn btn-outline" id="download">${icon('download')}Download Quote</button>
            ${quote.status === 'Submitted'
              ? html`<button class="btn btn-primary" id="accept">${icon('checkCircle')}Accept Quote</button>`
              : html`<span class="quote-result quote-${quote.status.toLowerCase()}">${quote.status === 'Accepted' ? 'Accepted' : 'Not Selected'}</span>`}
          </div>
        </div>
        <h3 class="qd-title">Enquiry Details</h3>
        <dl class="qd-table">${rows.map(([label, value]) => html`<div><dt>${label}</dt><dd>${value}</dd></div>`)}</dl>
        <h3 class="qd-title">Specifications</h3>
        <div class="qd-spec">${icon('document')}<p>${specificationSummary(enquiry)}</p></div>
        ${enquiry.drawing && html`
          <h3 class="qd-title">Attachments</h3>
          <div class="qd-file">
            <img src="assets/img/pdf.svg" alt="">
            <div><strong>${enquiry.drawing.name}</strong><span>${fileSize(enquiry.drawing.size)}</span></div>
            <button id="attachment" aria-label="Download ${enquiry.drawing.name}">${icon('download')}</button>
          </div>`}
        <h3 class="qd-title qd-terms-title">Quote Terms</h3>
        <dl class="qd-table">${terms.map(([label, value]) => html`<div><dt>${label}</dt><dd>${value}</dd></div>`)}</dl>
      </section>`;
  },
  mount(root, { quote, enquiry }) {
    root.querySelector('#download').onclick = () => saveBlob(quotePdf(quote, enquiry), `Quote-${quote.vendor.name.replace(/\s+/g, '-')}-${enquiry.id}.pdf`);
    root.querySelector('#accept')?.addEventListener('click', () => confirmAccept(quote, enquiry));
    root.querySelector('#attachment')?.addEventListener('click', async () => {
      try {
        await downloadAttachment(enquiry.drawing);
      } catch (error) {
        toast(error.message, 'bad');
      }
    });
  },
};
