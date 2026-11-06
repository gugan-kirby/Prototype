import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { toast } from '../core/ui.js';
import { replyToCustomer, vendorThread } from '../services/vendors.js';
import { bubble } from './chat.js';
import { vendorArea } from './guards.js';

export default {
  name: 'chat',
  guard: vendorArea,
  load: ({ params }) => vendorThread(params.id),
  view: ({ name, messages }) => html`
    <header class="center-head"><button class="icon-btn" data-go="/v/messages" aria-label="Back">${icon('back')}</button><h1>${name}</h1></header>
    <section class="chat">
      <div class="chat-log" id="log">
        ${messages.length ? messages.map((message) => bubble(message, message.from === 'vendor')) : html`<div class="state"><p>Send a message to start the conversation.</p></div>`}
      </div>
      <form class="chat-bar" id="composer">
        <input id="text" placeholder="Type a message..." aria-label="Message" maxlength="500" autocomplete="off">
        <button class="chat-send" aria-label="Send">${icon('send')}</button>
      </form>
    </section>`,
  mount(root, { customerId }, ctx) {
    const log = root.querySelector('#log');
    log.scrollTop = log.scrollHeight;
    root.querySelector('#composer').onsubmit = async (event) => {
      event.preventDefault();
      const text = root.querySelector('#text').value.trim();
      if (!text) return;
      try {
        await replyToCustomer(customerId, text);
        ctx.refresh();
      } catch (error) {
        toast(error.message, 'bad');
      }
    };
  },
};
