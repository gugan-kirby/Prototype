import { rupees } from '../core/format.js';
import { html } from '../core/html.js';
import { listRecords } from '../services/admin.js';

const TABLES = {
  enquiries: { label: 'Enquiries', head: ['Enquiry', 'Part', 'Customer', 'Quantity', 'Date', 'Status'] },
  orders: { label: 'Orders', head: ['Order', 'Part', 'Customer', 'Vendor', 'Amount', 'Status'], money: 4 },
  invoices: { label: 'Invoices', head: ['Invoice', 'Order', 'Customer', 'Amount', 'Due', 'Status'], money: 3 },
  payments: { label: 'Payments', head: ['Payment', 'Reference', 'Customer', 'Amount', 'Method', 'Date'], money: 3 },
};

const table = (key, rows) => {
  const { head, money } = TABLES[key];
  return html`<table class="admin-table"><thead><tr>${head.map((label) => html`<th>${label}</th>`)}</tr></thead>
    <tbody>${rows.length
      ? rows.map((row) => html`<tr>${row.map((cell, index) => html`<td>${index === money ? rupees(cell) : cell}</td>`)}</tr>`)
      : html`<tr><td colspan="${head.length}">No matching records.</td></tr>`}</tbody></table>`;
};

export default {
  name: 'admin-records',
  load: () => listRecords(),
  view: () => html`
    <h1 class="admin-title">Records</h1>
    <div class="admin-tools">
      ${Object.entries(TABLES).map(([key, { label }], index) => html`<button data-table="${key}" class="${index === 0 ? 'on' : ''}">${label}</button>`)}
      <input id="record-search" type="search" placeholder="Search records..." aria-label="Search records">
    </div>
    <div id="record-table"></div>`,
  mount(root, data) {
    let current = 'enquiries';
    const search = root.querySelector('#record-search');
    const draw = () => {
      const needle = search.value.trim().toLowerCase();
      const rows = data[current].filter((row) => row.join(' ').toLowerCase().includes(needle));
      root.querySelector('#record-table').innerHTML = table(current, rows);
    };
    search.addEventListener('input', draw);
    root.querySelectorAll('[data-table]').forEach((button) => {
      button.onclick = () => {
        current = button.dataset.table;
        root.querySelectorAll('[data-table]').forEach((item) => item.classList.toggle('on', item === button));
        draw();
      };
    });
    draw();
  },
};
