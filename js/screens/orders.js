import { formatDate } from '../core/format.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { myOrders, orderProgress } from '../services/orders.js';
import { memberArea } from './guards.js';
import { dateLine, listView, mountList, tile } from './list-page.js';

const ART = { cnc: ['factory', 'blue'], vmc: ['layers', 'violet'], turning: ['hex', 'orange'], welding: ['lbracket', 'blue'], laser: ['factory', 'violet'] };

export const orderTile = (order) => {
  const [glyph, tint] = ART[order.category] ?? ART.cnc;
  return tile(order.art ?? glyph, order.tint ?? tint);
};

const STATUS_ICON = { Completed: 'okFilled', Cancelled: null, 'In Progress': null };

export const orderStatus = (order) => html`<span class="badge badge-${order.status.toLowerCase().replace(/\s+/g, '-')}">${STATUS_ICON[order.status] && icon(STATUS_ICON[order.status])}${order.status}</span>`;

const card = (order) => html`
  <a class="card order-card" href="#/orders/${order.id}">
    ${orderTile(order)}
    <div class="card-body">
      <strong class="card-title">${order.partName}</strong>
      <span class="card-meta">Order #${order.id}</span>
      ${dateLine(formatDate(order.date))}
      ${order.status === 'In Progress' && html`<span class="progress-row"><span class="progress"><i style="width:${orderProgress(order)}%"></i></span><b>${orderProgress(order)}%</b></span>`}
    </div>
    ${orderStatus(order)}
    <span class="card-go">${icon('chevron')}</span>
  </a>`;

const config = {
  title: 'My Orders',
  subtitle: 'Track your confirmed jobs and order progress',
  placeholder: 'Search orders...',
  empty: 'No orders here yet.',
  tabs: [
    { label: 'All', test: () => true },
    { label: 'In Progress', test: (order) => order.status === 'In Progress' },
    { label: 'Completed', test: (order) => order.status === 'Completed' },
    { label: 'Cancelled', test: (order) => order.status === 'Cancelled' },
  ],
  card,
  date: (order) => order.date,
  haystack: (order) => `${order.partName} ${order.id} ${order.vendor?.name} ${order.categoryName}`,
};

export default {
  name: 'orders',
  tabs: 'orders',
  guard: memberArea,
  load: () => myOrders(),
  view: (orders) => listView(config, orders),
  mount(root, orders) {
    const vendors = [...new Map(orders.map((order) => [order.vendorId, order.vendor?.name])).entries()];
    mountList(root, {
      ...config,
      filters: { label: 'Vendor', options: vendors.map(([value, label]) => ({ value, label })), test: (order, value) => order.vendorId === value },
    }, orders);
  },
};
