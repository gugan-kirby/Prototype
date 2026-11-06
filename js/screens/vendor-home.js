import { formatDate, rupees } from '../core/format.js';
import { html, raw } from '../core/html.js';
import { icon } from '../core/icons.js';
import { vendorDashboard } from '../services/vendors.js';
import { vendorArea } from './guards.js';
import { tile } from './list-page.js';
import { appHeader } from './shell.js';

const ART = { cnc: ['factory', 'blue'], vmc: ['layers', 'violet'], turning: ['hex', 'orange'], laser: ['layers', 'violet'], welding: ['lbracket', 'blue'] };
const REQUEST_ART = [['factory', 'blue'], ['layers', 'violet'], ['hex', 'orange']];

function donut({ inProduction, outForDelivery, completed, ordersReceived }) {
  const radius = 42;
  const length = 2 * Math.PI * radius;
  const gap = ordersReceived ? 1.5 : 0;
  let start = 0;
  const arcs = [[inProduction, '#056bfd'], [outForDelivery, '#62d15f'], [completed, '#c0bbfd']].map(([count, colour]) => {
    const size = ordersReceived ? (count / ordersReceived) * length : 0;
    const arc = `<circle cx="52" cy="52" r="${radius}" fill="none" stroke="${colour}" stroke-width="15" stroke-dasharray="${Math.max(size - gap, 0)} ${length}" stroke-dashoffset="${-start}" transform="rotate(-90 52 52)"/>`;
    start += size;
    return arc;
  });
  return raw(`<svg viewBox="0 0 104 104" aria-hidden="true">${arcs.join('')}</svg>`);
}

function sparkline(points) {
  const width = 158;
  const height = 52;
  const coords = points.map((value, index) => [index * (width / (points.length - 1)), height - 2 - (value / 100) * (height - 6)]);
  const line = coords.reduce((path, [x, y], index) => {
    if (index === 0) return `M${x} ${y}`;
    const [px, py] = coords[index - 1];
    const middle = (px + x) / 2;
    return `${path} C${middle} ${py} ${middle} ${y} ${x} ${y}`;
  }, '');
  const [endX, endY] = coords.at(-1);
  return raw(`<svg viewBox="0 0 ${width + 6} ${height}" aria-hidden="true">
    <defs><linearGradient id="spark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#056bfd" stop-opacity=".16"/><stop offset="1" stop-color="#056bfd" stop-opacity=".02"/></linearGradient></defs>
    <path d="${line} L${width} ${height} L0 ${height}Z" fill="url(#spark)"/>
    <path d="${line}" fill="none" stroke="#056bfd" stroke-width="1.600"/>
    <circle cx="${endX}" cy="${endY}" r="3" fill="#fff" stroke="#056bfd" stroke-width="1.600"/></svg>`);
}

const received = (item) => (item.minutesAgo ? `${item.minutesAgo} min ago` : formatDate(item.date));

export default {
  name: 'vendor-home',
  vendorTabs: 'dashboard',
  guard: vendorArea,
  load: () => vendorDashboard(),
  view(data) {
    const { vendor } = data;
    const stats = [
      ['mail', 'blue', data.newEnquiries, 'New Enquiries', '/v/enquiries'],
      ['fileText', 'violet', data.quotesSent, 'Quotes Sent', '/v/quotes'],
      ['box', 'green', data.ordersReceived, 'Orders Received', '/v/orders'],
      ['rupee', 'orange', rupees(data.totalRevenue), 'Total Revenue', '/v/orders'],
    ];
    const legend = [['#056bfd', 'In Production', data.inProduction], ['#62d15f', 'Out for Delivery', data.outForDelivery], ['#c0bbfd', 'Completed', data.completed]];
    return html`
      ${appHeader({ extra: html`<button class="head-store" data-go="/profile" aria-label="Business profile">${icon('store')}</button>` })}
      <section class="vd">
        <div class="vd-banner">
          <p class="vd-kicker">Vendor Dashboard</p>
          <h1>Welcome, ${vendor.name} <img src="assets/img/wave.png" alt=""></h1>
          <p class="vd-sub">Manage enquiries, quotes and orders from buyers</p>
        </div>
        ${!vendor.verified && html`<p class="vd-pending" role="status">Your account is awaiting verification. You can quote once JobWork has verified it.</p>`}
        <div class="vd-stats">
          ${stats.map(([glyph, tint, value, label, path]) => html`<button class="vd-stat vd-stat-${tint}" data-go="${path}">
            <span class="vd-stat-tile">${icon(glyph)}</span><strong>${value}</strong><span>${label}</span></button>`)}
        </div>
        <div class="vd-card">
          <header><h2>${icon('inbox')}Enquiry Requests</h2><button data-go="/v/enquiries">View All ${icon('arrowRight')}</button></header>
          ${data.requests.length === 0 && html`<p class="vd-empty">No new enquiries right now.</p>`}
          ${data.requests.map((item, index) => {
            const [glyph, tint] = REQUEST_ART[index] ?? ART[item.category] ?? ART.cnc;
            return html`<div class="vd-row">
              ${tile(glyph, tint)}
              <div class="vd-row-text"><strong>${item.partName}</strong><span>${item.processName}<i>•</i>${item.quantity} ${item.unit}</span></div>
              <time>${received(item)}</time>
              <button class="vd-quote ${index === 0 ? 'on' : ''}" data-go="/v/enquiries/${item.id}">Quote Now</button>
            </div>`;
          })}
        </div>
        <div class="vd-card">
          <header><h2>${icon('box')}Orders Overview</h2><button data-go="/v/orders">View All ${icon('arrowRight')}</button></header>
          <div class="vd-orders">
            <div class="vd-donut">${donut(data)}<p><strong>${data.ordersReceived}</strong>Orders</p></div>
            <ul>${legend.map(([colour, label, count]) => html`<li><i style="background:${colour}"></i>${label}<b>${count}</b></li>`)}</ul>
          </div>
        </div>
        <div class="vd-revenue">
          <h2>${icon('trend')}Revenue <small>(This Month)</small></h2>
          <div class="vd-revenue-row">
            <strong>${rupees(data.revenue)}</strong>
            ${vendor.growth && html`<span class="vd-growth">${icon('trend')}+${vendor.growth}%</span>`}
          </div>
          ${vendor.trend && html`<div class="vd-spark">${sparkline(vendor.trend)}</div>`}
        </div>
      </section>`;
  },
};
