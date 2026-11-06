import { getFile, saveBlob } from '../core/files.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { go } from '../core/router.js';
import { busy, sheet, toast } from '../core/ui.js';
import { enquiryOptions, readDraft, specificationSummary, submitEnquiry } from '../services/enquiries.js';
import { memberArea } from './guards.js';
import { stepper } from './enquiry-parts.js';

export default {
  name: 'enquiry-review',
  guard: () => memberArea() ?? (readDraft().partName ? null : '/enquiry/new'),
  load: () => enquiryOptions(),
  view(options) {
    const draft = readDraft();
    const category = options.categories.find((item) => item.id === draft.category)?.name;
    const rows = [
      ['Part Name', draft.partName],
      ['Category', category],
      ['Material', draft.material],
      ['Quantity', `${draft.quantity} ${draft.unit}`],
      ['Delivery Location', draft.location],
    ];
    return html`
      <header class="center-head">
        <button class="icon-btn" data-go="/enquiry/new/requirements" aria-label="Back">${icon('back')}</button><h1>Review Enquiry</h1>
      </header>
      <section class="enquiry-form review">
        ${stepper(3)}
        <h2 class="review-title">Enquiry Details</h2>
        <dl class="review-rows">
          ${rows.map(([label, value]) => html`<div><dt>${label}</dt><dd>${value}</dd></div>`)}
          <div class="review-file"><dt>File</dt><dd>
            ${draft.drawing
              ? html`<span class="review-glyph">${icon('fileSearch')}</span><button id="open-file"><img src="assets/img/pdf.svg" alt=""><span>${draft.drawing.name}</span></button>`
              : html`<span class="review-none">No file attached</span>`}
          </dd></div>
        </dl>
        <h2 class="review-title review-spec">Specifications</h2>
        <p class="review-text">${specificationSummary(draft)}</p>
        <div class="review-actions">
          <button class="btn btn-outline" data-go="/enquiry/new/requirements">Back</button>
          <button class="btn btn-primary" id="submit">Submit Enquiry</button>
        </div>
      </section>`;
  },
  mount(root) {
    root.querySelector('#open-file')?.addEventListener('click', async () => {
      const { drawing } = readDraft();
      try {
        const file = await getFile(drawing.id);
        if (!file) throw new Error('This file is no longer available.');
        saveBlob(file, drawing.name);
      } catch (error) {
        toast(error.message, 'bad');
      }
    });

    root.querySelector('#submit').onclick = (event) => busy(event.currentTarget, async () => {
      try {
        const enquiry = await submitEnquiry(readDraft());
        sheet({
          title: 'Enquiry Submitted',
          body: html`<p class="sheet-note">${enquiry.id} has been sent to verified vendors. You will be notified when quotes arrive.</p>
            <button class="btn btn-primary" id="view-enquiries">View My Enquiries</button>`,
          mount(node, close) {
            node.querySelector('#view-enquiries').onclick = () => { close(); go('/enquiries'); };
          },
        });
      } catch (error) {
        toast(error.message, 'bad');
      }
    });
  },
};
