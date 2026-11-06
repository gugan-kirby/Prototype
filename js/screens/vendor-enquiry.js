import { fileSize } from '../core/files.js';
import { formatDate, rupees } from '../core/format.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { toast } from '../core/ui.js';
import { specificationSummary } from '../services/enquiries.js';
import { vendorEnquiry } from '../services/vendors.js';
import { vendorArea } from './guards.js';
import { downloadAttachment } from './quote-details.js';

export default {
  name: 'vendor-enquiry',
  guard: vendorArea,
  load: ({ params }) => vendorEnquiry(params.id),
  view({ vendor, enquiry, customerName, quote }) {
    const rows = [
      ['Enquiry No.', enquiry.id], ['Customer', customerName], ['Part / Job Name', enquiry.partName], ['Category', enquiry.categoryName],
      ['Sub Category', enquiry.subcategory], ['Material', enquiry.materialGrade ?? enquiry.material], ['Quantity', `${enquiry.quantity} ${enquiry.unit}`],
      ['Delivery Location', enquiry.location], ['Received', formatDate(enquiry.date)],
    ];
    return html`
      <header class="center-head"><button class="icon-btn" data-go="/v/enquiries" aria-label="Back">${icon('back')}</button><h1>Enquiry Details</h1></header>
      <section class="qd">
        <h3 class="qd-title">Requirements</h3>
        <dl class="qd-table">${rows.map(([label, value]) => html`<div><dt>${label}</dt><dd>${value}</dd></div>`)}</dl>
        <h3 class="qd-title">Specifications</h3>
        <div class="qd-spec">${icon('document')}<p>${specificationSummary(enquiry)}</p></div>
        ${enquiry.drawing && html`<h3 class="qd-title">Attachments</h3>
          <div class="qd-file"><img src="assets/img/pdf.svg" alt="">
            <div><strong>${enquiry.drawing.name}</strong><span>${fileSize(enquiry.drawing.size)}</span></div>
            <button id="attachment" aria-label="Download ${enquiry.drawing.name}">${icon('download')}</button></div>`}
        <div class="invoice-actions">
          ${quote && html`<p class="pf-note">You quoted ${rupees(quote.amount)}. Status: ${quote.status}.</p>`}
          ${!quote && vendor.verified && enquiry.status !== 'Closed' && html`<a class="btn btn-primary" href="#/v/enquiries/${enquiry.id}/quote">Submit Quote</a>`}
          ${!quote && !vendor.verified && html`<p class="vd-pending">You can quote once JobWork has verified your account.</p>`}
          ${!quote && enquiry.status === 'Closed' && html`<p class="pf-note">This enquiry has closed.</p>`}
        </div>
      </section>`;
  },
  mount(root, { enquiry }) {
    root.querySelector('#attachment')?.addEventListener('click', async () => {
      try {
        await downloadAttachment(enquiry.drawing);
      } catch (error) {
        toast(error.message, 'bad');
      }
    });
  },
};
