import { shortDate } from '../core/format.js';
import { formatDate } from '../core/format.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { orderById, orderProgress, STAGE_NOTES, TRACKER, trackerIndex } from '../services/orders.js';
import { memberArea } from './guards.js';

const plusDays = (iso, days) => new Date(Date.parse(iso) + days * 86400000).toISOString().slice(0, 10);

// Expected dates fall back to the order date when the vendor has not set them.
function expected(order) {
  return { 2: order.delivery?.dispatch ?? plusDays(order.date, 3), 3: order.delivery?.arrive ?? plusDays(order.date, 4) };
}

function stepEvent(order, step) {
  return order.history.find((entry) => entry.stage >= step.from);
}

export default {
  name: 'order-tracking',
  guard: memberArea,
  load: ({ params }) => orderById(params.id),
  view(order) {
    const current = trackerIndex(order.stage);
    const dates = expected(order);
    const steps = TRACKER.map((step, index) => {
      const event = index <= current ? order.history.find((entry) => entry.stage >= (index === 1 ? 2 : step.from)) ?? stepEvent(order, step) : null;
      return { ...step, index, event, state: index < current ? 'done' : index === current ? 'now' : 'next', planned: dates[index] };
    });
    const when = (step) => (step.event ? shortDate(step.event.date) : step.planned ? `${shortDate(step.planned)} (Est.)` : '');
    const whenFull = (step) => (step.event ? `${shortDate(step.event.date)}${step.event.time ? `, ${step.event.time}` : ''}` : step.planned ? `${shortDate(step.planned)} (Est.)` : '');
    return html`
      <header class="center-head"><button class="icon-btn" data-go="/orders" aria-label="Back">${icon('back')}</button><h1>Order Tracking</h1></header>
      <section class="track">
        <div class="track-head">
          <span class="track-tile">${icon('factory')}</span>
          <div>
            <h2>${order.partName}</h2>
            <p class="track-no">Order #${order.id}</p>
            <p class="track-meta"><span>${icon('pin')}${order.categoryName}</span><i></i><span>${order.material}</span></p>
            <p class="track-meta"><span>${icon('calendar')}${formatDate(order.date)}</span><i></i><span>${icon('stack')}${order.quantity} ${order.unit}</span></p>
          </div>
          <span class="track-state">${icon('badgeOk')}${order.status}</span>
        </div>
        <h3 class="track-title">Order Progress</h3>
        <ol class="tracker">
          ${steps.map((step) => html`<li class="${step.state}">
            <b>${icon(step.state === 'done' ? 'check' : step.glyph)}</b>
            <strong>${step.short[0]}${step.short[0] && html`<br>`}${step.short[1]}</strong>
            <small>${when(step)}</small>
          </li>`)}
        </ol>
        <div class="track-status">
          <div class="track-status-top">
            <span class="track-status-tile">${icon('factory')}</span>
            <div><strong>Current Status</strong><p>${STAGE_NOTES[order.stage]}</p></div>
            <em>${orderProgress(order)}%</em>
          </div>
          <span class="progress"><i style="width:${orderProgress(order)}%"></i></span>
        </div>
        <h3 class="track-title">Production Timeline</h3>
        <ol class="timeline">
          ${steps.map((step) => html`<li class="${step.state}">
            <span class="timeline-dot">${icon(step.state === 'done' ? 'check' : step.glyph)}</span>
            <div><strong>${step.label}</strong><p>${step.note}</p></div>
            <time>${whenFull(step)}</time>
          </li>`)}
        </ol>
        <div class="track-actions">
          <a class="btn btn-outline" href="#/chat/${order.vendorId}">${icon('chat')}Contact Vendor</a>
          <a class="btn btn-primary" href="#/orders/${order.id}/details">${icon('docLines')}Order Details</a>
        </div>
      </section>`;
  },
};
