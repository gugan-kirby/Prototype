import { formatDate, rupees } from '../core/format.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { busy, setFieldError, sheet, toast } from '../core/ui.js';
import { addMoney, isPayable, paymentsOverview } from '../services/invoices.js';
import { memberArea } from './guards.js';
import { bindPay, invoiceCard } from './invoices.js';
import { listView, mountList } from './list-page.js';

const PAYMENTS_TAB = { id: 'payments', label: 'Payments', path: '/payments', glyph: 'card', solid: 'card' };

const statusLabel = (invoice) => (isPayable(invoice) ? 'Pending' : invoice.status);

const config = {
  title: 'Payments',
  subtitle: 'Track your transactions, payments and refunds',
  empty: 'Nothing here yet.',
  tabs: [
    { label: 'All', test: () => true },
    { label: 'Paid', test: (invoice) => invoice.status === 'Paid' },
    { label: 'Pending', test: isPayable },
    { label: 'Refunds', test: (invoice) => invoice.status === 'Refunded' },
  ],
  card: (invoice) => invoiceCard(invoice, statusLabel),
  date: (invoice) => invoice.date,
  haystack: (invoice) => invoice.id,
};

const summary = ({ paidThisMonth, pending }) => html`<div class="pay-summary">
  <div><span class="pay-tile pay-tile-blue">${icon('wallet')}</span><p>Total Paid<strong>${rupees(paidThisMonth)}</strong></p></div>
  <div><span class="pay-tile pay-tile-violet">${icon('clock')}</span><p>Pending Payment<strong>${rupees(pending)}</strong></p></div>
</div>`;

const walletPanel = ({ wallet, transactions }) => html`<section class="pay-extra">
  <h3 class="qd-title">Wallet</h3>
  <div class="wallet-card">
    <p>Wallet Balance<strong>${rupees(wallet)}</strong></p>
    <button class="btn btn-primary" id="add-money">Add Money</button>
  </div>
  <h3 class="qd-title">Recent Transactions</h3>
  <ul class="tx-list">
    ${transactions.map((item) => html`<li><div><strong>${item.invoiceId ?? item.type}</strong><span>${item.method} • ${formatDate(item.date)}</span></div>
      <div class="tx-right"><strong>${rupees(item.amount)}</strong><span>${item.status}</span></div></li>`)}
  </ul>
</section>`;

export default {
  name: 'payments',
  tabs: 'payments',
  lastTab: PAYMENTS_TAB,
  guard: memberArea,
  load: () => paymentsOverview(),
  view: (data) => html`${listView(config, data.invoices, String(summary(data)))}${walletPanel(data)}`,
  mount(root, data, ctx) {
    mountList(root, config, data.invoices);
    bindPay(root, data.invoices, ctx);
    root.querySelector('#add-money').onclick = () => sheet({
      title: 'Add Money',
      body: html`<p class="sheet-note">Add money to your JobWork wallet. This is a demo, so no real payment is taken.</p>
        <div class="box" data-name="amount"><input id="amount" inputmode="numeric" placeholder="Enter amount" aria-label="Amount"></div>
        <button class="btn btn-primary" id="add-confirm">Add Money</button>`,
      mount(node, close) {
        node.querySelector('#add-confirm').onclick = (event) => busy(event.currentTarget, async () => {
          const box = node.querySelector('.box');
          const value = node.querySelector('#amount').value.trim();
          const valid = /^[1-9]\d{0,6}$/.test(value);
          setFieldError(box, valid ? '' : 'Enter a whole amount above zero.');
          if (!valid) return;
          try {
            await addMoney(Number(value));
            close();
            toast('Money added to your wallet.', 'ok');
            ctx.refresh();
          } catch (error) {
            setFieldError(box, error.message);
          }
        });
      },
    });
  },
};
