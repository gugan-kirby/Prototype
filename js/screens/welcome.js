import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { go } from '../core/router.js';
import { continueAsGuest } from '../services/auth.js';

const BADGES = [['shieldLock', 'Secure'], ['shieldCheck', 'Reliable'], ['shieldBolt', 'Fast']];

export default {
  name: 'welcome',
  view: () => html`
    <section class="welcome">
      <p class="welcome-to">Welcome to</p>
      <h1 class="welcome-word">JobWork</h1>
      <p class="welcome-sub">One Platform for All Your<br>Job Work Needs</p>
      <img class="welcome-art" src="assets/img/welcome-art.png" alt="Engineers working with CNC machines">
      <button class="btn btn-primary welcome-login" data-go="/login">Login</button>
      <button class="btn btn-outline welcome-register" data-go="/register">Register</button>
      <button class="welcome-guest" id="guest">Continue as Guest</button>
      <ul class="welcome-badges">
        ${BADGES.map(([name, label]) => html`<li>${icon(name)}<span>${label}</span></li>`)}
      </ul>
    </section>`,
  mount(root) {
    root.querySelector('#guest').onclick = () => {
      continueAsGuest();
      go('/home');
    };
  },
};
