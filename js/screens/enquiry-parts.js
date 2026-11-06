import { html } from '../core/html.js';
import { icon } from '../core/icons.js';

const STEPS = ['Details', 'Requirements', 'Review'];

export function stepper(current) {
  return html`<ol class="stepper" data-step="${current}" aria-label="Step ${current} of 3">
    ${STEPS.map((label, index) => {
      const number = index + 1;
      const state = number === current ? 'now' : number < current ? 'done' : '';
      return html`<li class="step ${state}" ${number === current ? 'aria-current="step"' : ''}><b>${number}</b><span>${label}</span></li>`;
    })}
  </ol>`;
}

export function selectField({ name, label, placeholder, options, value }) {
  return html`<div class="form-row">
    <label class="form-label" for="${name}">${label}</label>
    <div class="select" data-name="${name}">
      <select id="${name}" name="${name}" class="${value ? '' : 'empty'}">
        ${placeholder && html`<option value="">${placeholder}</option>`}
        ${options.map((option) => html`<option value="${option.value ?? option}" ${(option.value ?? option) === value ? 'selected' : ''}>${option.label ?? option}</option>`)}
      </select>${icon('chevronDown')}
    </div>
  </div>`;
}
