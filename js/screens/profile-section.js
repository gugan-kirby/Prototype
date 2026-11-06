import { deleteFile, fileSize, getFile, putFile, saveBlob } from '../core/files.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { busy, setFieldError, toast } from '../core/ui.js';
import { isEmail, isMobile, passwordProblem } from '../core/validate.js';
import { addAddress, addPaymentMethod, changePassword, myProfile, raiseSupportRequest, removeAddress, removePaymentMethod, updateProfile, updateUser } from '../services/profile.js';
import { memberArea } from './guards.js';

const input = (name, label, value = '', type = 'text') => html`<div class="form-row"><label class="form-label" for="${name}">${label}</label>
  <div class="box" data-name="${name}"><input id="${name}" name="${name}" type="${type}" value="${value}"></div></div>`;

const area = (name, label) => html`<div class="form-row"><label class="form-label" for="${name}">${label}</label>
  <div class="area" data-name="${name}"><textarea id="${name}" name="${name}" maxlength="500"></textarea></div></div>`;

const toggle = (name, label, on) => html`<label class="pf-toggle"><span>${label}</span><input type="checkbox" name="${name}" ${on ? 'checked' : ''}><i></i></label>`;

// Runs a form submit: shows field errors, then saves and reports the result.
function bindForm(root, { validate = () => ({}), save, done, ctx }) {
  const form = root.querySelector('#section-form');
  form.onsubmit = (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    const problems = validate(values);
    form.querySelectorAll('[data-name]').forEach((field) => setFieldError(field, problems[field.dataset.name] ?? ''));
    if (Object.values(problems).some(Boolean)) return;
    busy(form.querySelector('[type=submit]'), async () => {
      try {
        await save(values);
        toast(done, 'ok');
        ctx.refresh();
      } catch (error) {
        toast(error.message, 'bad');
      }
    });
  };
}

const required = (values, labels) => Object.fromEntries(Object.entries(labels).map(([name, message]) => [name, values[name].trim() ? '' : message]));

const SECTIONS = {
  edit: {
    title: 'Edit Profile',
    body: (user) => html`<form id="section-form" novalidate>${input('name', 'Full Name', user.name)}${input('email', 'Email Address', user.email, 'email')}${input('mobile', 'Mobile Number', user.mobile, 'tel')}<button class="btn btn-primary" type="submit">Save Changes</button></form>`,
    mount: (root, _, ctx) => bindForm(root, {
      ctx,
      done: 'Profile updated.',
      save: updateProfile,
      validate: (values) => ({ name: values.name.trim().length >= 2 ? '' : 'Enter your full name.', email: isEmail(values.email) ? '' : 'Enter a valid email address.', mobile: isMobile(values.mobile) ? '' : 'Enter a valid 10-digit mobile number.' }),
    }),
  },
  company: {
    title: 'Company Details',
    body: (user) => html`<form id="section-form" novalidate>${input('name', 'Company Name', user.company?.name)}${input('gstin', 'GSTIN', user.company?.gstin)}${input('address', 'Registered Address', user.company?.address)}<button class="btn btn-primary" type="submit">Save Changes</button></form>`,
    mount: (root, _, ctx) => bindForm(root, {
      ctx,
      done: 'Company details saved.',
      save: (values) => updateUser({ company: values }),
      validate: (values) => ({
        ...required(values, { name: 'Enter your company name.', address: 'Enter your registered address.' }),
        gstin: !values.gstin || /^[0-9A-Z]{15}$/i.test(values.gstin.trim()) ? '' : 'A GSTIN has 15 letters and numbers.',
      }),
    }),
  },
  account: {
    title: 'Account Settings',
    body: (user) => html`<p class="pf-note">Logged in as ${user.email}</p>
      <form id="section-form" novalidate>${input('current', 'Current Password', '', 'password')}${input('next', 'New Password', '', 'password')}${input('confirm', 'Confirm New Password', '', 'password')}<button class="btn btn-primary" type="submit">Change Password</button></form>`,
    mount: (root, _, ctx) => bindForm(root, {
      ctx,
      done: 'Password changed.',
      save: (values) => changePassword(values.current, values.next),
      validate: (values) => ({ current: values.current ? '' : 'Enter your current password.', next: passwordProblem(values.next), confirm: values.confirm === values.next ? '' : 'Passwords do not match.' }),
    }),
  },
  'payment-methods': {
    title: 'Payment Methods',
    body: (user) => html`<ul class="pf-list">${(user.paymentMethods ?? []).map((item) => html`<li><div><strong>${item.label}</strong><span>${item.detail}</span></div><button class="link pf-remove" data-remove="${item.id}">Remove</button></li>`)}</ul>
      ${!user.paymentMethods?.length && html`<p class="pf-note">No payment methods saved.</p>`}
      <form id="section-form" novalidate><div class="form-row"><label class="form-label" for="label">Type</label><div class="select"><select id="label" name="label"><option>UPI</option><option>Card</option><option>Bank Account</option></select>${icon('chevronDown')}</div></div>
      ${input('detail', 'UPI ID or Account Reference')}<button class="btn btn-primary" type="submit">Add Payment Method</button></form>`,
    mount(root, _, ctx) {
      bindForm(root, { ctx, done: 'Payment method added.', save: (values) => addPaymentMethod(values.label, values.detail.trim()), validate: (values) => required(values, { detail: 'Enter the UPI ID or account reference.' }) });
      root.querySelectorAll('[data-remove]').forEach((button) => { button.onclick = () => removePaymentMethod(button.dataset.remove).then(ctx.refresh); });
    },
  },
  notifications: {
    title: 'Notifications',
    body: (user) => html`<form id="section-form" novalidate class="pf-toggles">
      ${toggle('quotes', 'Quote updates', user.prefs?.quotes ?? true)}${toggle('orders', 'Order updates', user.prefs?.orders ?? true)}${toggle('payments', 'Payment reminders', user.prefs?.payments ?? true)}
      <button class="btn btn-primary" type="submit">Save Preferences</button></form>`,
    mount: (root, _, ctx) => bindForm(root, {
      ctx,
      done: 'Preferences saved.',
      save: (values) => updateUser({ prefs: { quotes: 'quotes' in values, orders: 'orders' in values, payments: 'payments' in values } }),
    }),
  },
  privacy: {
    title: 'Privacy & Security',
    body: () => html`<p class="pf-note">Download a copy of your profile data, or change your password in Account Settings.</p>
      <button class="btn btn-primary" id="export">Download My Data</button>
      <a class="btn btn-outline" href="#/profile/account">Change Password</a>`,
    mount(root, user) {
      root.querySelector('#export').onclick = () => {
        const { password, ...data } = user;
        saveBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'jobwork-profile.json');
      };
    },
  },
  help: {
    title: 'Help & Support',
    body: () => html`<p class="pf-note">Tell us what you need help with.</p><form id="section-form" novalidate>${input('subject', 'Subject')}${area('message', 'Message')}<button class="btn btn-primary" type="submit">Raise Request</button></form>`,
    mount: (root, _, ctx) => bindForm(root, {
      ctx,
      done: 'Request raised.',
      save: (values) => raiseSupportRequest(values.subject.trim(), values.message.trim()),
      validate: (values) => required(values, { subject: 'Enter a subject.', message: 'Enter your message.' }),
    }),
  },
  addresses: {
    title: 'My Addresses',
    body: (user) => html`<ul class="pf-list">${user.addresses.map((item) => html`<li><div><strong>${item.label}</strong><span>${item.line}, ${item.city}, ${item.state}</span></div><button class="link pf-remove" data-remove="${item.id}">Remove</button></li>`)}</ul>
      <form id="section-form" novalidate>${input('label', 'Label')}${input('line', 'Address')}${input('city', 'City')}${input('state', 'State')}<button class="btn btn-primary" type="submit">Add Address</button></form>`,
    mount(root, _, ctx) {
      bindForm(root, {
        ctx,
        done: 'Address added.',
        save: (values) => addAddress(Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]))),
        validate: (values) => required(values, { label: 'Enter a label.', line: 'Enter the address.', city: 'Enter the city.', state: 'Enter the state.' }),
      });
      root.querySelectorAll('[data-remove]').forEach((button) => { button.onclick = () => removeAddress(button.dataset.remove).then(ctx.refresh); });
    },
  },
  documents: {
    title: 'My Documents',
    body: (user) => html`<ul class="pf-list">${(user.documents ?? []).map((item) => html`<li><div><strong>${item.name}</strong><span>${fileSize(item.size)}</span></div><span><button class="link" data-open="${item.id}">Download</button> <button class="link pf-remove" data-remove="${item.id}">Remove</button></span></li>`)}</ul>
      ${!user.documents?.length && html`<p class="pf-note">No documents uploaded.</p>`}
      <label class="btn btn-primary">Upload Document<input type="file" id="document" hidden></label>`,
    mount(root, user, ctx) {
      const list = user.documents ?? [];
      root.querySelector('#document').addEventListener('change', async (event) => {
        const [file] = event.target.files;
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { toast('File is larger than 10MB.', 'bad'); return; }
        await updateUser({ documents: [...list, await putFile(file)] });
        ctx.refresh();
      });
      root.querySelectorAll('[data-open]').forEach((button) => {
        button.onclick = async () => {
          const item = list.find((entry) => entry.id === button.dataset.open);
          const file = await getFile(item.id);
          if (file) saveBlob(file, item.name);
          else toast('This file is no longer available.', 'bad');
        };
      });
      root.querySelectorAll('[data-remove]').forEach((button) => {
        button.onclick = async () => {
          await deleteFile(button.dataset.remove);
          await updateUser({ documents: list.filter((entry) => entry.id !== button.dataset.remove) });
          ctx.refresh();
        };
      });
    },
  },
  about: {
    title: 'About Us',
    body: () => html`<p class="pf-note">JobWork is one platform for all your job work needs. Customers raise enquiries, compare quotes from verified vendors, and track orders through to delivery.</p>`,
  },
  terms: {
    title: 'Terms & Conditions',
    body: () => html`<p class="pf-note">JobWork connects customers with independent vendors. Each order is a contract between the customer and the vendor.</p>
      <p class="pf-note">Customers must give accurate drawings and specifications. Vendors must quote only for work they can deliver.</p>
      <p class="pf-note">Payments, delivery dates and quality are agreed in the accepted quote.</p>`,
  },
};

export default {
  name: 'profile-section',
  guard: memberArea,
  load: async ({ params }) => {
    if (!SECTIONS[params.section]) throw new Error('This page does not exist.');
    return myProfile();
  },
  view: (user, { params }) => html`
    <header class="center-head"><button class="icon-btn" data-go="/profile" aria-label="Back">${icon('back')}</button><h1>${SECTIONS[params.section].title}</h1></header>
    <section class="pf-section">${SECTIONS[params.section].body(user)}</section>`,
  mount: (root, user, ctx) => SECTIONS[ctx.params.section].mount?.(root, user, ctx),
};
