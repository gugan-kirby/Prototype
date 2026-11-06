import { html } from './html.js';

const routes = [];
const history = [];
let current = null;
let token = 0;
let chrome = () => '';

export function route(pattern, screen) {
  const names = [];
  const source = pattern.replace(/:([a-zA-Z]+)/g, (_, name) => {
    names.push(name);
    return '([^/]+)';
  });
  routes.push({ regex: new RegExp(`^${source}$`), names, screen });
}

function match(path) {
  for (const { regex, names, screen } of routes) {
    const found = path.match(regex);
    if (found) {
      const params = Object.fromEntries(names.map((name, i) => [name, decodeURIComponent(found[i + 1])]));
      return { screen, params };
    }
  }
  return null;
}

export function setChrome(render) { chrome = render; }

export const currentPath = () => location.hash.slice(1) || '/';

export function go(path, { replace = false } = {}) {
  if (replace) location.replace(`#${path}`);
  else location.hash = path;
}

export function back(fallback = '/') {
  history.pop();
  go(history.pop() ?? fallback);
}

export async function render({ keepScroll = false } = {}) {
  const root = document.getElementById('screen');
  const [path, search = ''] = currentPath().split('?');
  const found = match(path);
  const run = ++token;
  const scroll = root.scrollTop;

  if (!found) {
    document.getElementById('chrome').innerHTML = '';
    root.innerHTML = html`<div class="state"><p>That page does not exist.</p>
      <button class="link" data-go="/">Go to start</button></div>`;
    return;
  }

  const { screen, params } = found;
  const ctx = { params, query: Object.fromEntries(new URLSearchParams(search)), refresh: () => render({ keepScroll: true }) };
  if (screen.guard) {
    const redirect = screen.guard(ctx);
    if (redirect) { go(redirect, { replace: true }); return; }
  }

  document.getElementById('phone').dataset.screen = screen.name;
  document.getElementById('statusbar').classList.toggle('on-dark', Boolean(screen.dark));

  document.getElementById('chrome').innerHTML = chrome(screen);

  if (screen.load && !keepScroll) root.innerHTML = '<div class="state"><div class="spinner" role="status" aria-label="Loading"></div></div>';

  try {
    const data = screen.load ? await screen.load(ctx) : {};
    if (run !== token) return;
    root.innerHTML = screen.view(data, ctx);
    root.scrollTop = keepScroll ? scroll : 0;
    screen.mount?.(root, data, ctx);
  } catch (error) {
    if (run !== token) return;
    root.innerHTML = html`<div class="state"><p>${error.message}</p>
      <button class="link" id="retry">Try again</button></div>`;
    root.querySelector('#retry').onclick = () => render();
  }
}

export function startRouter() {
  addEventListener('hashchange', () => {
    const path = currentPath();
    if (history.at(-1) !== path) history.push(path);
    render();
  });
  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-go], [data-back]');
    if (!target) return;
    if (target.dataset.go) go(target.dataset.go);
    else back(target.dataset.back || '/');
  });
  history.push(currentPath());
  render();
}
