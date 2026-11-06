import { connect } from '../core/api.js';
import { html } from '../core/html.js';
import { currentPath, route, startRouter } from '../core/router.js';
import { currentUser, endSession, session } from '../services/auth.js';
import dashboard from './dashboard.js';
import records from './records.js';
import users from './users.js';
import vendors from './vendors.js';

const NAV = [['Dashboard', '/'], ['Vendors', '/vendors'], ['Users', '/users'], ['Records', '/records']];

const role = session()?.role;
if (role !== 'admin' && role !== 'staff') {
  location.replace('index.html#/login');
} else {
  await connect();
  route('/', dashboard);
  route('/vendors', vendors);
  route('/users', users);
  route('/records', records);

  const user = currentUser();
  document.getElementById('admin-user').textContent = `${user?.name} (${role === 'admin' ? 'Admin' : 'Staff'})`;
  document.getElementById('admin-out').onclick = () => {
    endSession();
    location.href = 'index.html#/welcome';
  };

  const nav = document.getElementById('admin-nav');
  const drawNav = () => {
    const path = currentPath();
    nav.innerHTML = html`${NAV.map(([label, target]) => html`<a href="#${target}" class="${path === target ? 'on' : ''}">${label}</a>`)}`;
  };
  addEventListener('hashchange', drawNav);
  drawNav();
  startRouter();
}
