import { formatDate, rupees } from '../core/format.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { vendorQuotes } from '../services/vendors.js';
import { vendorArea } from './guards.js';
import { dateLine, listView, mountList, statusBadge, tile } from './list-page.js';

const config = {
  title: 'Quotes',
  subtitle: 'Track the quotes you have sent',
  placeholder: 'Search quotes...',
  empty: 'No quotes here yet.',
  tabs: [
    { label: 'All', test: () => true },
    { label: 'Submitted', test: (quote) => quote.status === 'Submitted' },
    { label: 'Accepted', test: (quote) => quote.status === 'Accepted' },
    { label: 'Declined', test: (quote) => quote.status === 'Declined' },
  ],
  card: (quote) => html`<a class="card" href="#/v/enquiries/${quote.enquiryId}">
    ${tile('fileText', 'violet')}
    <div class="card-body">
      <strong class="card-title">${quote.enquiry?.partName}</strong>
      <span class="card-meta">${rupees(quote.amount)} • ${quote.leadDays} Days</span>
      ${dateLine(formatDate(quote.date))}
    </div>
    ${statusBadge(quote.status)}
    <span class="card-go">${icon('chevron')}</span>
  </a>`,
  date: (quote) => quote.date,
  haystack: (quote) => `${quote.enquiry?.partName} ${quote.enquiryId} ${quote.status}`,
};

export default {
  name: 'vendor-quotes',
  vendorTabs: 'quotes',
  guard: vendorArea,
  load: () => vendorQuotes(),
  view: (quotes) => listView(config, quotes),
  mount: (root, quotes) => mountList(root, config, quotes),
};
