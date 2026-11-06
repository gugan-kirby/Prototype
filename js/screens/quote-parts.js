import { rupees } from '../core/format.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { go } from '../core/router.js';
import { busy, sheet, toast } from '../core/ui.js';
import { acceptQuote } from '../services/quotes.js';

export function confirmAccept(quote, enquiry) {
  sheet({
    title: 'Accept Quote',
    body: html`<p class="sheet-note">Accept ${quote.vendor.name}'s quote of ${rupees(quote.amount)} for ${enquiry.partName}? This places the order, closes the enquiry and declines the other quotes.</p>
      <button class="btn btn-primary" id="confirm-accept">Accept Quote</button>
      <button class="btn btn-outline" id="cancel-accept">Cancel</button>`,
    mount(node, close) {
      node.querySelector('#cancel-accept').onclick = close;
      node.querySelector('#confirm-accept').onclick = (event) => busy(event.currentTarget, async () => {
        try {
          const { order } = await acceptQuote(quote.id);
          close();
          toast(`Order ${order.id} placed.`, 'ok');
          go(`/orders/${order.id}`);
        } catch (error) {
          close();
          toast(error.message, 'bad');
        }
      });
    },
  });
}

export const verifiedPill = () => html`<span class="verified">${icon('badgeCheck')}Verified</span>`;
