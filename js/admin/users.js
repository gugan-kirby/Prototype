import { html } from '../core/html.js';
import { toast } from '../core/ui.js';
import { canManage, listUsers, setUserStatus } from '../services/admin.js';
import { session } from '../services/auth.js';

const ROLE = { customer: 'Customer', vendor: 'Vendor', admin: 'Admin', staff: 'Staff' };

export default {
  name: 'admin-users',
  load: () => listUsers(),
  view: (users) => html`
    <h1 class="admin-title">Users</h1>
    ${!canManage() && html`<p class="admin-note">Staff can view users. Only admins can suspend accounts.</p>`}
    <table class="admin-table">
      <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Role</th><th>Status</th>${canManage() && html`<th>Action</th>`}</tr></thead>
      <tbody>${users.map((user) => {
        const suspended = user.status === 'suspended';
        return html`<tr>
          <td>${user.name}</td><td>${user.email}</td><td>${user.mobile}</td><td>${ROLE[user.role]}</td>
          <td><span class="admin-pill ${suspended ? 'bad' : 'good'}">${suspended ? 'Suspended' : 'Active'}</span></td>
          ${canManage() && html`<td>${user.id !== session().userId && html`<button class="admin-act ${suspended ? '' : 'quiet'}" data-id="${user.id}" data-status="${suspended ? 'active' : 'suspended'}">${suspended ? 'Reactivate' : 'Suspend'}</button>`}</td>`}
        </tr>`;
      })}</tbody>
    </table>`,
  mount(root, _, ctx) {
    root.querySelectorAll('[data-status]').forEach((button) => {
      button.onclick = async () => {
        try {
          await setUserStatus(button.dataset.id, button.dataset.status);
          ctx.refresh();
        } catch (error) {
          toast(error.message, 'bad');
        }
      };
    });
  },
};
