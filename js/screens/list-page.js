import { html, raw } from '../core/html.js';
import { icon } from '../core/icons.js';
import { sheet } from '../core/ui.js';
import { appHeader } from './shell.js';

const RADIO_NEWEST = 'newest';
const PAGE_SIZE = 4;

export function statusBadge(status, extraClass = '') {
  return html`<span class="badge badge-${status.toLowerCase().replace(/\s+/g, '-')} ${extraClass}">${status}</span>`;
}

export function dateLine(text) {
  return html`<span class="date-line">${icon('calendar')}${text}</span>`;
}

export function tile(glyph, tint) {
  return html`<span class="tile tile-${tint}">${icon(glyph)}</span>`;
}

// Page with a search box, status tabs and a card list. `config` supplies:
// title, subtitle, placeholder, tabs [{ label, test }], card(item), haystack(item),
// date(item) for sorting, and optional filters { label, options, test }.
export function listView(config, items, before = '') {
  return html`
    ${appHeader()}
    <section class="list-page">
      <h1 class="list-title">${config.title}</h1>
      <p class="list-sub">${config.subtitle}</p>
      ${raw(before)}
      ${config.placeholder && html`<div class="list-tools">
        <label class="search">${icon('search')}<input id="search" type="search" placeholder="${config.placeholder}" aria-label="${config.placeholder}"></label>
        <button class="filter-btn" id="filter" aria-label="Filter and sort">${icon('sliders')}</button>
      </div>`}
      <div class="tabs" role="tablist">
        ${config.tabs.map((tab, index) => html`<button role="tab" class="${index === 0 ? 'on' : ''}" aria-selected="${index === 0}" data-tab="${index}">${tab.label} (${items.filter(tab.test).length})</button>`)}
      </div>
      <div class="cards" id="cards"></div>
    </section>`;
}

export function mountList(root, config, items) {
  const state = { tab: 0, query: '', sort: RADIO_NEWEST, filter: '', limit: PAGE_SIZE };
  const list = root.querySelector('#cards');
  let total = 0;

  function draw({ keepLimit = false } = {}) {
    if (!keepLimit) state.limit = PAGE_SIZE;
    const needle = state.query.trim().toLowerCase();
    const shown = items
      .filter(config.tabs[state.tab].test)
      .filter((item) => !state.filter || config.filters.test(item, state.filter))
      .filter((item) => !needle || config.haystack(item).toLowerCase().includes(needle))
      .sort((a, b) => (state.sort === RADIO_NEWEST ? 1 : -1) * config.date(b).localeCompare(config.date(a)));
    total = shown.length;
    list.classList.toggle('has-more', total > state.limit);
    list.innerHTML = shown.length
      ? html`${shown.slice(0, state.limit).map(config.card)}`
      : html`<div class="state list-empty"><p>${needle || state.filter ? 'No results match your search.' : config.empty}</p></div>`;
  }

  root.onscroll = () => {
    const nearEnd = root.scrollTop + root.clientHeight >= root.scrollHeight - 80;
    if (!nearEnd || state.limit >= total) return;
    state.limit += PAGE_SIZE;
    draw({ keepLimit: true });
  };

  root.querySelector('#search')?.addEventListener('input', (event) => {
    state.query = event.target.value;
    draw();
  });

  root.querySelectorAll('[data-tab]').forEach((tab) => {
    tab.onclick = () => {
      state.tab = Number(tab.dataset.tab);
      root.querySelectorAll('[data-tab]').forEach((item) => {
        item.classList.toggle('on', item === tab);
        item.setAttribute('aria-selected', String(item === tab));
      });
      draw();
    };
  });

  const filterButton = root.querySelector('#filter');
  if (filterButton) filterButton.onclick = () => sheet({
    title: 'Filter & Sort',
    body: html`
      <div class="form-row"><label class="form-label" for="sort">Sort by</label>
        <div class="select"><select id="sort">
          <option value="newest" ${state.sort === 'newest' ? 'selected' : ''}>Newest first</option>
          <option value="oldest" ${state.sort === 'oldest' ? 'selected' : ''}>Oldest first</option>
        </select>${icon('chevronDown')}</div></div>
      ${config.filters && html`<div class="form-row"><label class="form-label" for="filter-by">${config.filters.label}</label>
        <div class="select"><select id="filter-by"><option value="">All</option>
          ${config.filters.options.map((option) => html`<option value="${option.value}" ${state.filter === option.value ? 'selected' : ''}>${option.label}</option>`)}
        </select>${icon('chevronDown')}</div></div>`}
      <button class="btn btn-primary" id="apply">Apply</button>
      <button class="btn btn-outline" id="clear">Clear</button>`,
    mount(node, close) {
      node.querySelector('#apply').onclick = () => {
        state.sort = node.querySelector('#sort').value;
        state.filter = node.querySelector('#filter-by')?.value ?? '';
        close();
        draw();
      };
      node.querySelector('#clear').onclick = () => {
        state.sort = RADIO_NEWEST;
        state.filter = '';
        close();
        draw();
      };
    },
  });

  draw();
}
