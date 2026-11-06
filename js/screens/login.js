import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { go } from '../core/router.js';
import { busy, setFieldError, sheet, toast } from '../core/ui.js';
import { homeFor, login, requestPasswordReset } from '../services/auth.js';

const DEMO = [['Customer', 'gugan@jobwork.com'], ['Vendor', 'vendor@jobwork.com'], ['Admin', 'admin@jobwork.com'], ['Staff', 'staff@jobwork.com']];
const DEMO_PASSWORD = 'Demo@123';

export function afterLogin(session) {
  if (session.role === 'admin' || session.role === 'staff') location.href = 'admin.html';
  else go(homeFor(session.role));
}

export default {
  name: 'login',
  view: () => html`
    <section class="form-page">
      <header class="page-head"><button class="icon-btn" data-back="/welcome" aria-label="Back">${icon('back')}</button><h1>Login</h1></header>
      <form id="form" novalidate>
        <label class="field" data-name="identifier">${icon('mail')}<input name="identifier" placeholder="Email or Mobile Number" autocomplete="username" aria-label="Email or Mobile Number"></label>
        <label class="field" data-name="password">${icon('lock')}<input name="password" type="password" placeholder="Password" autocomplete="current-password" aria-label="Password">
          <button type="button" class="field-eye" aria-label="Show password">${icon('eye')}</button></label>
        <button type="button" class="link form-forgot" id="forgot">Forgot Password?</button>
        <p class="error form-error" id="form-error" role="alert" hidden></p>
        <button class="btn btn-primary" id="submit">Login</button>
      </form>
      <p class="form-foot">Don't have an account? <button class="link" data-go="/register">Register</button></p>
      <div class="demo-box">
        <p>Demo accounts (password ${DEMO_PASSWORD})</p>
        <div>${DEMO.map(([label, email]) => html`<button class="demo-chip" data-email="${email}">${label}</button>`)}</div>
      </div>
    </section>`,
  mount(root) {
    const form = root.querySelector('#form');
    const field = (name) => root.querySelector(`.field[data-name="${name}"]`);
    const formError = root.querySelector('#form-error');

    root.querySelector('.field-eye').onclick = (event) => {
      const input = form.elements.password;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      event.currentTarget.innerHTML = String(icon(show ? 'eyeOff' : 'eye'));
      event.currentTarget.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    };

    root.querySelectorAll('.demo-chip').forEach((chip) => {
      chip.onclick = () => {
        form.elements.identifier.value = chip.dataset.email;
        form.elements.password.value = DEMO_PASSWORD;
      };
    });

    root.querySelector('#forgot').onclick = () => sheet({
      title: 'Reset Password',
      body: html`<p class="sheet-note">Enter your email or mobile number and we will send a reset link.</p>
        <label class="field" data-name="reset">${icon('mail')}<input id="reset-id" placeholder="Email or Mobile Number" aria-label="Email or Mobile Number"></label>
        <button class="btn btn-primary" id="reset-send">Send Reset Link</button>`,
      mount(node, close) {
        const wrap = node.querySelector('.field');
        const input = node.querySelector('#reset-id');
        input.value = form.elements.identifier.value;
        node.querySelector('#reset-send').onclick = (event) => busy(event.currentTarget, async () => {
          setFieldError(wrap, input.value.trim() ? '' : 'Enter your email or mobile number.');
          if (!input.value.trim()) return;
          try {
            await requestPasswordReset(input.value);
            close();
            toast('Reset link sent.', 'ok');
          } catch (error) {
            setFieldError(wrap, error.message);
          }
        });
      },
    });

    form.onsubmit = (event) => {
      event.preventDefault();
      const identifier = form.elements.identifier.value;
      const password = form.elements.password.value;
      setFieldError(field('identifier'), identifier.trim() ? '' : 'Enter your email or mobile number.');
      setFieldError(field('password'), password ? '' : 'Enter your password.');
      formError.hidden = true;
      if (!identifier.trim() || !password) return;
      busy(root.querySelector('#submit'), async () => {
        try {
          afterLogin(await login(identifier, password));
        } catch (error) {
          formError.textContent = error.message;
          formError.hidden = false;
        }
      });
    };
  },
};
