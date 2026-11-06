import { formatDate } from '../core/format.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { vendorEnquiries } from '../services/vendors.js';
import { vendorArea } from './guards.js';
import { enquiryTile } from './enquiries.js';
import { dateLine, listView, mountList } from './list-page.js';

const config = {
  title: 'Enquiries',
  subtitle: 'Review requirements and send your quotes',
  placeholder: 'Search enquiries...',
  empty: 'No enquiries here yet.',
  tabs: [
    { label: 'All', test: () => true },
    { label: 'New', test: (item) => !item.quoted },
    { label: 'Quoted', test: (item) => item.quoted },
  ],
  card: (item) => html`<a class="card" href="#/v/enquiries/${item.id}">
    ${enquiryTile(item)}
    <div class="card-body">
      <strong class="card-title">${item.partName}</strong>
      <span class="card-meta">${item.processName} • ${item.quantity} ${item.unit}</span>
      ${dateLine(formatDate(item.date))}
    </div>
    <span class="badge ${item.quoted ? 'badge-quoted' : 'badge-in-progress'}">${item.quoted ? 'Quoted' : 'New'}</span>
    <span class="card-go">${icon('chevron')}</span>
  </a>`,
  date: (item) => item.date,
  haystack: (item) => `${item.partName} ${item.id} ${item.processName} ${item.material}`,
};

export default {
  name: 'vendor-enquiries',
  vendorTabs: 'enquiries',
  guard: vendorArea,
  load: () => vendorEnquiries(),
  view: (items) => listView(config, items),
  mount: (root, items) => mountList(root, config, items),
};
