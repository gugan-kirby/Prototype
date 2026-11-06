import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { go } from '../core/router.js';
import { sheet } from '../core/ui.js';
import { currentUser, endSession, session } from '../services/auth.js';
import { unreadCount } from '../services/notifications.js';

export function appHeader() {
  return html`<header class="app-head">
    <button class="head-btn" data-menu aria-label="Open menu">${icon('menu')}</button>
    <span class="app-word">JobWork</span>
    <button class="head-btn head-bell" data-go="/notifications" aria-label="Notifications">
      ${icon('bell')}${unreadCount() > 0 && html`<i class="bell-dot"></i>`}
    </button>
  </header>`;
}

const CUSTOMER_TABS = [
  { id: 'home', label: 'Home', path: '/home', glyph: 'home', solid: 'homeFill' },
  { id: 'enquiries', label: 'Enquiries', path: '/enquiries', glyph: 'enquiry', solid: 'enquiryFill' },
  null,
  { id: 'orders', label: 'Orders', path: '/orders', glyph: 'orders', solid: 'ordersFill' },
  { id: 'profile', label: 'Profile', path: '/profile', glyph: 'profile', solid: 'profileFill' },
];

export function renderTabs(screen) {
  if (!screen.tabs) return '';
  return String(html`<nav class="tabbar" aria-label="Main">
    ${CUSTOMER_TABS.map((tab) => (tab
      ? html`<button class="tab ${screen.tabs === tab.id ? 'on' : ''}" data-go="${tab.path}" ${screen.tabs === tab.id ? 'aria-current="page"' : ''}>
          ${icon(screen.tabs === tab.id ? tab.solid : tab.glyph)}<span>${tab.label}</span></button>`
      : html`<button class="fab" data-gate="/enquiry/new" aria-label="New Enquiry">${icon('plus')}</button>`))}
  </nav>`);
}

export function requireMember(path) {
  if (!session()?.guest) { go(path); return; }
  sheet({
    title: 'Login Required',
    body: html`<p class="sheet-note">Create a free account or log in to continue.</p>
      <button class="btn btn-primary" id="gate-login">Login</button>
      <button class="btn btn-outline" id="gate-register">Register</button>`,
    mount(node, close) {
      node.querySelector('#gate-login').onclick = () => { close(); go('/login'); };
      node.querySelector('#gate-register').onclick = () => { close(); go('/register'); };
    },
  });
}

const CUSTOMER_MENU = [
  ['Home', '/home'], ['New Enquiry', '/enquiry/new'], ['My Enquiries', '/enquiries'], ['RFQ / Quotes', '/quotes'],
  ['Orders', '/orders'], ['Invoices', '/invoices'], ['Payments', '/payments'], ['Profile', '/profile'],
];

function openMenu() {
  const user = currentUser();
  const node = document.createElement('div');
  node.className = 'drawer-backdrop';
  node.innerHTML = html`<aside class="drawer" aria-label="Menu">
    <div class="drawer-head"><strong>${user?.name ?? 'Guest'}</strong><span>${user?.email ?? 'Browsing as guest'}</span></div>
    <nav>${CUSTOMER_MENU.map(([label, path]) => html`<button data-path="${path}">${label}</button>`)}</nav>
    <button class="drawer-out" id="drawer-out">${icon('logout')}${user ? 'Log Out' : 'Login'}</button>
  </aside>`;
  const close = () => node.remove();
  node.addEventListener('click', (event) => {
    if (event.target === node) { close(); return; }
    const item = event.target.closest('[data-path]');
    if (item) { close(); requireMember(item.dataset.path); }
  });
  node.querySelector('#drawer-out').onclick = () => {
    close();
    endSession();
    go(user ? '/welcome' : '/login');
  };
  document.getElementById('phone').append(node);
}

export function startShell() {
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-menu]')) openMenu();
    const gated = event.target.closest('[data-gate]');
    if (gated) requireMember(gated.dataset.gate);
  });
}
