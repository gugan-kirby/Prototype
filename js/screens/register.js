import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { busy, setFieldError, sheet } from '../core/ui.js';
import { isEmail, isMobile, passwordProblem } from '../core/validate.js';
import { register } from '../services/auth.js';
import { afterLogin } from './login.js';

const FIELDS = [
  { name: 'name', glyph: 'user', label: 'Full Name', autocomplete: 'name' },
  { name: 'mobile', glyph: 'phone', label: 'Mobile Number', type: 'tel', autocomplete: 'tel' },
  { name: 'email', glyph: 'mail', label: 'Email Address', type: 'email', autocomplete: 'email' },
  { name: 'password', glyph: 'lock', label: 'Password', type: 'password', autocomplete: 'new-password' },
  { name: 'confirm', glyph: 'lock', label: 'Confirm Password', type: 'password', autocomplete: 'new-password' },
];

const TERMS = [
  'JobWork connects customers with independent vendors. Each order is a contract between the customer and the vendor.',
  'Customers must give accurate drawings and specifications. Vendors must quote only for work they can deliver.',
  'Payments, delivery dates and quality are agreed in the accepted quote.',
];

export const showTerms = () => sheet({
  title: 'Terms & Conditions',
  body: html`${TERMS.map((line) => html`<p class="sheet-note">${line}</p>`)}<button class="btn btn-primary" id="terms-close">Close</button>`,
  mount: (node, close) => { node.querySelector('#terms-close').onclick = close; },
});

function validate(values) {
  return {
    name: values.name.trim().length >= 2 ? '' : 'Enter your full name.',
    mobile: isMobile(values.mobile) ? '' : 'Enter a valid 10-digit mobile number.',
    email: isEmail(values.email) ? '' : 'Enter a valid email address.',
    password: passwordProblem(values.password),
    confirm: values.confirm === values.password && values.confirm ? '' : 'Passwords do not match.',
    terms: values.terms ? '' : 'Please accept the Terms & Conditions.',
  };
}

export default {
  name: 'register',
  view: () => html`
    <section class="form-page register">
      <header class="page-head"><button class="icon-btn" data-back="/welcome" aria-label="Back">${icon('back')}</button><h1>Register</h1></header>
      <div class="role-switch" role="tablist" aria-label="Account type">
        <button class="on" role="tab" aria-selected="true" data-role="customer">Customer</button>
        <button role="tab" aria-selected="false" data-role="vendor">Vendor</button>
      </div>
      <form id="form" novalidate>
        ${FIELDS.map((field) => html`
          <label class="field" data-name="${field.name}">${icon(field.glyph)}
            <input name="${field.name}" type="${field.type ?? 'text'}" placeholder="${field.label}" aria-label="${field.label}" autocomplete="${field.autocomplete}">
          </label>`)}
        <div class="terms">
          <label class="check" data-name="terms"><input type="checkbox" name="terms"><span class="check-box" aria-hidden="true"></span>I agree to</label>
          <button type="button" class="link" id="terms-link">Terms &amp; Conditions</button>
        </div>
        <p class="error form-error" id="form-error" role="alert" hidden></p>
        <button class="btn btn-primary" id="submit">Register</button>
      </form>
      <p class="form-foot">Already have an account? <button class="link" data-go="/login">Login</button></p>
    </section>`,
  mount(root) {
    const form = root.querySelector('#form');
    const formError = root.querySelector('#form-error');
    let role = 'customer';

    root.querySelectorAll('[data-role]').forEach((tab) => {
      tab.onclick = () => {
        role = tab.dataset.role;
        root.querySelectorAll('[data-role]').forEach((item) => {
          item.classList.toggle('on', item === tab);
          item.setAttribute('aria-selected', String(item === tab));
        });
      };
    });

    root.querySelector('#terms-link').onclick = showTerms;

    form.onsubmit = (event) => {
      event.preventDefault();
      const values = Object.fromEntries(FIELDS.map(({ name }) => [name, form.elements[name].value]));
      values.terms = form.elements.terms.checked;
      const problems = validate(values);
      Object.entries(problems).forEach(([name, problem]) => {
        setFieldError(root.querySelector(`[data-name="${name}"]`), problem);
      });
      formError.hidden = true;
      if (Object.values(problems).some(Boolean)) return;
      busy(root.querySelector('#submit'), async () => {
        try {
          afterLogin(await register({ ...values, role }));
        } catch (error) {
          formError.textContent = error.message;
          formError.hidden = false;
        }
      });
    };
  },
};
