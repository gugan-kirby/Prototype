import { formatDate } from '../core/format.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { orderProgress } from '../services/orders.js';
import { vendorOrders } from '../services/vendors.js';
import { vendorArea } from './guards.js';
import { dateLine, listView, mountList } from './list-page.js';
import { orderStatus, orderTile } from './orders.js';

const config = {
  title: 'Orders',
  subtitle: 'Manage production and delivery',
  placeholder: 'Search orders...',
  empty: 'No orders here yet.',
  tabs: [
    { label: 'All', test: () => true },
    { label: 'In Progress', test: (order) => order.status === 'In Progress' },
    { label: 'Completed', test: (order) => order.status === 'Completed' },
  ],
  card: (order) => html`<a class="card order-card" href="#/v/orders/${order.id}">
    ${orderTile(order)}
    <div class="card-body">
      <strong class="card-title">${order.partName}</strong>
      <span class="card-meta">Order #${order.id}</span>
      ${dateLine(formatDate(order.date))}
      ${order.status === 'In Progress' && html`<span class="progress-row"><span class="progress"><i style="width:${orderProgress(order)}%"></i></span><b>${orderProgress(order)}%</b></span>`}
    </div>
    ${orderStatus(order)}
    <span class="card-go">${icon('chevron')}</span>
  </a>`,
  date: (order) => order.date,
  haystack: (order) => `${order.partName} ${order.id} ${order.customerName}`,
};

export default {
  name: 'vendor-orders',
  vendorTabs: 'orders',
  guard: vendorArea,
  load: () => vendorOrders(),
  view: (orders) => listView(config, orders),
  mount: (root, orders) => mountList(root, config, orders),
};
