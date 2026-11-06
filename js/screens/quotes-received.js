import { fileSize } from '../core/files.js';
import { formatDate, rupees } from '../core/format.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { specificationSummary } from '../services/enquiries.js';
import { enquiryWithQuotes } from '../services/quotes.js';
import { memberArea } from './guards.js';
import { enquiryTile } from './enquiries.js';
import { dateLine, tile } from './list-page.js';
import { confirmAccept, verifiedPill } from './quote-parts.js';

const TINTS = { green: 'green', violet: 'violet', orange: 'orange', blue: 'blue' };

function quoteCard(quote) {
  const { vendor } = quote;
  const open = quote.status === 'Submitted';
  return html`<article class="quote-card" data-quote="${quote.id}">
    <div class="quote-top">
      ${tile('factory', TINTS[vendor.tint] ?? 'blue')}
      <div class="quote-who">
        <h3>${vendor.name}</h3>
        <p><span class="quote-place">${icon('pin')}${vendor.city}, ${vendor.stateCode}</span><i></i><span class="quote-rate">${icon('star')}${vendor.rating} (${vendor.reviews})</span></p>
      </div>
      ${vendor.verified && verifiedPill()}
    </div>
    <dl class="quote-figures">
      <div><dt>Quote Amount</dt><dd class="quote-amount">${rupees(quote.amount)}</dd></div>
      <div><dt>Lead Time</dt><dd>${icon('calendar')}${quote.leadDays} Days</dd></div>
      <div><dt>Min. Qty</dt><dd>${icon('stack')}${quote.minQty} Nos</dd></div>
    </dl>
    <div class="quote-actions">
      <a class="btn btn-outline" href="#/quotes/${quote.id}">View Details</a>
      ${open
        ? html`<button class="btn btn-primary" data-accept="${quote.id}">Accept Quote</button>`
        : html`<span class="quote-result quote-${quote.status.toLowerCase()}">${quote.status === 'Accepted' ? 'Accepted' : 'Not Selected'}</span>`}
    </div>
  </article>`;
}

function detailsPanel(enquiry) {
  const rows = [
    ['Enquiry No.', enquiry.id], ['Part / Job Name', enquiry.partName], ['Category', enquiry.categoryName], ['Sub Category', enquiry.subcategory],
    ['Material', enquiry.materialGrade ?? enquiry.material], ['Quantity', `${enquiry.quantity} ${enquiry.unit}`], ['Delivery Location', enquiry.location],
    ['Specifications', specificationSummary(enquiry)],
  ];
  return html`<dl class="detail-rows">
    ${rows.map(([label, value]) => html`<div><dt>${label}</dt><dd>${value}</dd></div>`)}
    ${enquiry.drawing && html`<div><dt>Attachment</dt><dd>${enquiry.drawing.name} (${fileSize(enquiry.drawing.size)})</dd></div>`}
  </dl>`;
}

export default {
  name: 'quotes-received',
  guard: memberArea,
  load: ({ params }) => enquiryWithQuotes(params.id),
  view: ({ enquiry, quotes }, ctx) => html`
    <header class="center-head">
      <button class="icon-btn" data-go="/enquiries" aria-label="Back">${icon('back')}</button><h1>Quotes Received</h1>
    </header>
    <section class="quotes-page">
      <div class="quote-summary">
        ${enquiryTile(enquiry)}
        <div>
          <h2>${enquiry.partName}</h2>
          <p>${enquiry.categoryName} • ${enquiry.material}</p>
          ${dateLine(formatDate(enquiry.date))}
        </div>
        <span class="quote-count">${quotes.length} ${quotes.length === 1 ? 'Quote' : 'Quotes'}</span>
      </div>
      <div class="underline-tabs" role="tablist">
        <button role="tab" class="on" aria-selected="true" data-pane="quotes">Quotes (${quotes.length})</button>
        <button role="tab" aria-selected="false" data-pane="details">Enquiry Details</button>
      </div>
      <div id="pane-quotes" class="quote-list">
        ${quotes.length ? quotes.map(quoteCard) : html`<div class="state"><p>No quotes yet. You will be notified when vendors respond.</p></div>`}
      </div>
      <div id="pane-details" hidden>${detailsPanel(enquiry)}</div>
    </section>`,
  mount(root, { enquiry, quotes }) {
    root.querySelectorAll('[data-pane]').forEach((tab) => {
      tab.onclick = () => {
        root.querySelectorAll('[data-pane]').forEach((item) => {
          item.classList.toggle('on', item === tab);
          item.setAttribute('aria-selected', String(item === tab));
        });
        root.querySelector('#pane-quotes').hidden = tab.dataset.pane !== 'quotes';
        root.querySelector('#pane-details').hidden = tab.dataset.pane !== 'details';
      };
    });
    root.querySelectorAll('[data-accept]').forEach((button) => {
      button.onclick = () => confirmAccept(quotes.find((quote) => quote.id === button.dataset.accept), enquiry);
    });
  },
};
