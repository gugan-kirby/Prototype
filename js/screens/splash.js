import { html } from '../core/html.js';

export default {
  name: 'splash',
  dark: true,
  view: () => html`
    <section class="splash">
      <img class="splash-logo" src="assets/img/logo.svg" alt="">
      <h1 class="splash-word">JobWork</h1>
      <p class="splash-tag">Find Trusted Machines.<br>Get Quality Work Done.</p>
      <button class="splash-start" data-go="/welcome">Get Started</button>
      <button class="splash-link" data-go="/login">Login / Register</button>
    </section>`,
};
