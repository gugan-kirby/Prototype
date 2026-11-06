import { html } from '../core/html.js';
import { toast } from '../core/ui.js';
import { canManage, listVendors, setVendorVerified } from '../services/admin.js';

export default {
  name: 'admin-vendors',
  load: () => listVendors(),
  view: (vendors) => html`
    <h1 class="admin-title">Vendors</h1>
    ${!canManage() && html`<p class="admin-note">Staff can view vendors. Only admins can change verification.</p>`}
    <table class="admin-table">
      <thead><tr><th>Vendor</th><th>Location</th><th>Rating</th><th>Status</th>${canManage() && html`<th>Action</th>`}</tr></thead>
      <tbody>${vendors.map((vendor) => html`<tr>
        <td>${vendor.name}</td>
        <td>${vendor.city ? `${vendor.city}, ${vendor.state}` : 'Not provided'}</td>
        <td>${vendor.reviews ? `${vendor.rating} (${vendor.reviews})` : 'New'}</td>
        <td><span class="admin-pill ${vendor.verified ? 'good' : 'warn'}">${vendor.verified ? 'Verified' : 'Awaiting'}</span></td>
        ${canManage() && html`<td><button class="admin-act ${vendor.verified ? 'quiet' : ''}" data-id="${vendor.id}" data-verify="${!vendor.verified}">${vendor.verified ? 'Remove Verification' : 'Verify'}</button></td>`}
      </tr>`)}</tbody>
    </table>`,
  mount(root, _, ctx) {
    root.querySelectorAll('[data-verify]').forEach((button) => {
      button.onclick = async () => {
        try {
          await setVendorVerified(button.dataset.id, button.dataset.verify === 'true');
          ctx.refresh();
        } catch (error) {
          toast(error.message, 'bad');
        }
      };
    });
  },
};
