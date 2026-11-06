import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { go } from '../core/router.js';
import { toast } from '../core/ui.js';
import { endSession, session } from '../services/auth.js';
import { myProfile, updateUser } from '../services/profile.js';
import { memberArea } from './guards.js';
import { tile } from './list-page.js';
import { appHeader } from './shell.js';

const MENU = [
  ['company', 'building', 'blue', 'Company Details', 'Update your company information'],
  ['account', 'person', 'violet', 'Account Settings', 'Manage your login, email and security'],
  ['payment-methods', 'card', 'green', 'Payment Methods', 'Add or manage payment options'],
  ['notifications', 'bell', 'yellow', 'Notifications', 'Control your alerts and updates'],
  ['privacy', 'shieldCheck', 'violet', 'Privacy & Security', 'Manage data, password and access'],
  ['help', 'help', 'blue', 'Help & Support', 'Get help or raise a request'],
];

const MORE = [
  ['addresses', 'pin', 'blue', 'My Addresses', 'Manage delivery locations'],
  ['documents', 'document', 'green', 'My Documents', 'Store your business documents'],
  ['about', 'info', 'violet', 'About Us', 'Learn more about JobWork'],
  ['terms', 'fileText', 'blue', 'Terms & Conditions', 'Read the terms of use'],
];

const formatMobile = (mobile) => `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`;
const rows = (items) => items.map(([path, glyph, tint, title, note]) => html`<a class="pf-row" href="#/profile/${path}">
  ${tile(glyph, tint)}<div><strong>${title}</strong><span>${note}</span></div>${icon('chevron')}</a>`);

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const side = Math.min(image.width, image.height);
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 160;
      canvas.getContext('2d').drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, 160, 160);
      URL.revokeObjectURL(image.src);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    image.onerror = () => reject(new Error('This image could not be read.'));
    image.src = URL.createObjectURL(file);
  });
}

export default {
  name: 'profile',
  get tabs() { return session()?.role === 'vendor' ? null : 'profile'; },
  get vendorTabs() { return session()?.role === 'vendor' ? 'profile' : null; },
  guard: memberArea,
  load: () => myProfile(),
  view: (user) => html`
    ${appHeader()}
    <section class="pf">
      <h1 class="list-title">Profile</h1>
      <p class="list-sub">Manage your account, company and preferences</p>
      <div class="pf-card">
        <div class="pf-photo">
          ${user.avatar ? html`<img src="${user.avatar}" alt="">` : html`<span class="pf-initial">${user.name[0]}</span>`}
          <label class="pf-camera" aria-label="Change photo">${icon('camera')}<input type="file" id="photo" accept="image/*"></label>
        </div>
        <a class="pf-info" href="#/profile/edit">
          <p class="pf-name"><strong>${user.name}</strong><span>${user.role === 'vendor' ? 'Vendor' : 'Buyer'}</span></p>
          <p>${icon('mail')}${user.email}</p>
          <p>${icon('phone')}${formatMobile(user.mobile)}</p>
          ${icon('chevron')}
        </a>
      </div>
      <nav class="pf-menu">${rows(MENU)}</nav>
      <button class="pf-logout" id="logout">${icon('logout')}Log Out</button>
      <p class="pf-version">App Version 1.0.0</p>
      <nav class="pf-menu pf-more">${rows(MORE)}</nav>
    </section>`,
  mount(root, _, ctx) {
    root.querySelector('#logout').onclick = () => {
      endSession();
      go('/welcome');
    };
    root.querySelector('#photo').addEventListener('change', async (event) => {
      const [file] = event.target.files;
      event.target.value = '';
      if (!file) return;
      try {
        await updateUser({ avatar: await resizeImage(file) });
        toast('Photo updated.', 'ok');
        ctx.refresh();
      } catch (error) {
        toast(error.message, 'bad');
      }
    });
  },
};
