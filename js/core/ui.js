import { html } from './html.js';

const phone = () => document.getElementById('phone');

export function toast(message, tone = 'info') {
  phone().querySelector('.toast')?.remove();
  const node = document.createElement('div');
  node.className = `toast toast-${tone}`;
  node.setAttribute('role', 'status');
  node.textContent = message;
  phone().append(node);
  setTimeout(() => node.remove(), 2600);
}

export function sheet({ title, body, mount }) {
  const node = document.createElement('div');
  node.className = 'sheet-backdrop';
  node.innerHTML = html`<div class="sheet" role="dialog" aria-modal="true" aria-label="${title}">
    <div class="sheet-grip"></div>
    <h2 class="sheet-title">${title}</h2>
    <div class="sheet-body">${body}</div>
  </div>`;
  const close = () => node.remove();
  node.addEventListener('click', (event) => { if (event.target === node) close(); });
  phone().append(node);
  mount?.(node, close);
  return close;
}

export function setFieldError(field, message) {
  field.classList.toggle('invalid', Boolean(message));
  let note = field.parentElement.querySelector(`.error[data-for="${field.dataset.name}"]`);
  if (!message) { note?.remove(); return; }
  if (!note) {
    note = document.createElement('p');
    note.className = 'error';
    note.dataset.for = field.dataset.name;
    field.after(note);
  }
  note.textContent = message;
}

export async function busy(button, work) {
  const label = button.innerHTML;
  button.disabled = true;
  button.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span>';
  try {
    return await work();
  } finally {
    button.disabled = false;
    button.innerHTML = label;
  }
}
