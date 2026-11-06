import { formatDate } from '../core/format.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { toast } from '../core/ui.js';
import { sendMessage, threadFor } from '../services/messages.js';
import { memberArea } from './guards.js';

export const bubble = (message, mine) => html`<div class="bubble ${mine ? 'mine' : ''}"><p>${message.text}</p><small>${formatDate(message.date)}</small></div>`;

export default {
  name: 'chat',
  guard: memberArea,
  load: ({ params }) => threadFor(params.id),
  view: ({ vendor, messages }) => html`
    <header class="center-head"><button class="icon-btn" data-back="/home" aria-label="Back">${icon('back')}</button><h1>${vendor.name}</h1></header>
    <section class="chat">
      <div class="chat-log" id="log">
        ${messages.length ? messages.map((message) => bubble(message, message.from === 'customer')) : html`<div class="state"><p>Send a message to start the conversation.</p></div>`}
      </div>
      <form class="chat-bar" id="composer">
        <input id="text" placeholder="Type a message..." aria-label="Message" maxlength="500" autocomplete="off">
        <button class="chat-send" aria-label="Send">${icon('send')}</button>
      </form>
    </section>`,
  mount(root, { vendor }, ctx) {
    const log = root.querySelector('#log');
    log.scrollTop = log.scrollHeight;
    root.querySelector('#composer').onsubmit = async (event) => {
      event.preventDefault();
      const input = root.querySelector('#text');
      const text = input.value.trim();
      if (!text) return;
      try {
        await sendMessage(vendor.id, text);
        ctx.refresh();
      } catch (error) {
        toast(error.message, 'bad');
      }
    };
  },
};
