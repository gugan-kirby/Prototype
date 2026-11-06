import { formatDate } from '../core/format.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { enquiriesWithQuotes } from '../services/quotes.js';
import { memberArea } from './guards.js';
import { enquiryTile } from './enquiries.js';
import { dateLine, listView, mountList } from './list-page.js';

const config = {
  title: 'RFQ / Quotes',
  subtitle: 'Compare the quotes you have received',
  placeholder: 'Search quotes...',
  empty: 'No quotes received yet.',
  tabs: [
    { label: 'All', test: () => true },
    { label: 'Open', test: (item) => item.status === 'Quoted' },
    { label: 'Closed', test: (item) => item.status === 'Closed' },
  ],
  card: (item) => html`<a class="card" href="#/enquiries/${item.id}">
    ${enquiryTile(item)}
    <div class="card-body">
      <strong class="card-title">${item.partName}</strong>
      <span class="card-meta">${item.categoryName} • ${item.material}</span>
      ${dateLine(formatDate(item.date))}
    </div>
    <span class="badge badge-in-progress">${item.quoteCount} ${item.quoteCount === 1 ? 'Quote' : 'Quotes'}</span>
    <span class="card-go">${icon('chevron')}</span>
  </a>`,
  date: (item) => item.date,
  haystack: (item) => `${item.partName} ${item.id} ${item.categoryName} ${item.material}`,
};

export default {
  name: 'rfq',
  tabs: 'enquiries',
  guard: memberArea,
  load: () => enquiriesWithQuotes(),
  view: (items) => listView(config, items),
  mount: (root, items) => mountList(root, config, items),
};
