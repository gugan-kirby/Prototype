import { formatDate } from '../core/format.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { myEnquiries } from '../services/enquiries.js';
import { memberArea } from './guards.js';
import { dateLine, listView, mountList, statusBadge, tile } from './list-page.js';

const ART = {
  cnc: ['gear', 'blue'], vmc: ['layers', 'violet'], turning: ['hex', 'orange'], welding: ['lbracket', 'blue'], laser: ['gear', 'violet'],
};

export const enquiryTile = (item) => {
  const [glyph, tint] = ART[item.category] ?? ART.cnc;
  return tile(item.art ?? glyph, tint);
};

const card = (item) => html`
  <a class="card" href="#/enquiries/${item.id}">
    ${enquiryTile(item)}
    <div class="card-body">
      <strong class="card-title">${item.partName}</strong>
      <span class="card-meta">${item.categoryName} • ${item.material}</span>
      ${dateLine(formatDate(item.date))}
    </div>
    ${statusBadge(item.status)}
    <span class="card-go">${icon('chevron')}</span>
  </a>`;

const config = {
  title: 'My Enquiries',
  subtitle: 'Track and manage all your enquiries',
  placeholder: 'Search enquiries...',
  empty: 'No enquiries here yet.',
  tabs: [
    { label: 'All', test: () => true },
    { label: 'In Progress', test: (item) => item.status === 'In Progress' },
    { label: 'Quoted', test: (item) => item.status === 'Quoted' },
    { label: 'Closed', test: (item) => item.status === 'Closed' },
  ],
  card,
  date: (item) => item.date,
  haystack: (item) => `${item.partName} ${item.id} ${item.categoryName} ${item.material}`,
};

export default {
  name: 'enquiries',
  tabs: 'enquiries',
  guard: memberArea,
  load: () => myEnquiries(),
  view: ({ enquiries }) => listView(config, enquiries),
  mount(root, { categories, enquiries }) {
    mountList(root, {
      ...config,
      filters: {
        label: 'Category',
        options: categories.map((item) => ({ value: item.id, label: item.name })),
        test: (item, value) => item.category === value,
      },
    }, enquiries);
  },
};
