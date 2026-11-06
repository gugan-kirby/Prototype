import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { go } from '../core/router.js';
import { setFieldError } from '../core/ui.js';
import { enquiryOptions, readDraft, saveDraft } from '../services/enquiries.js';
import { memberArea } from './guards.js';
import { selectField, stepper } from './enquiry-parts.js';

const REQUIRED = {
  partName: 'Enter the part or job name.',
  category: 'Select a category.',
  subcategory: 'Select a sub category.',
  material: 'Select a material.',
  location: 'Select a delivery location.',
};

export default {
  name: 'enquiry-details',
  guard: memberArea,
  load: () => enquiryOptions(),
  view(options, ctx) {
    const draft = readDraft();
    const category = draft.category ?? ctx.query.category ?? '';
    const subcategories = options.categories.find((item) => item.id === category)?.subcategories ?? [];
    return html`
      <header class="center-head">
        <button class="icon-btn" data-back="/home" aria-label="Back">${icon('back')}</button><h1>New Enquiry</h1>
      </header>
      <section class="enquiry-form">
        ${stepper(1)}
        <form id="form" novalidate>
          <div class="form-row">
            <label class="form-label" for="partName">Part / Job Name</label>
            <div class="box" data-name="partName"><input id="partName" name="partName" placeholder="Enter part or job name" maxlength="80" value="${draft.partName ?? ''}"></div>
          </div>
          ${selectField({ name: 'category', label: 'Category', placeholder: 'Select category', options: options.categories.map((item) => ({ value: item.id, label: item.name })), value: category })}
          ${selectField({ name: 'subcategory', label: 'Sub Category', placeholder: 'Select sub category', options: subcategories, value: draft.subcategory })}
          ${selectField({ name: 'material', label: 'Material', placeholder: 'Select material', options: options.materials, value: draft.material })}
          <div class="form-row">
            <label class="form-label" for="quantity">Quantity</label>
            <div class="qty">
              <div class="box" data-name="quantity"><input id="quantity" name="quantity" inputmode="numeric" placeholder="Enter quantity" value="${draft.quantity ?? ''}"></div>
              <div class="select"><select name="unit" aria-label="Unit">${options.units.map((unit) => html`<option ${unit === draft.unit ? 'selected' : ''}>${unit}</option>`)}</select>${icon('chevronDown')}</div>
            </div>
          </div>
          ${selectField({ name: 'location', label: 'Delivery Location', placeholder: 'Select location', options: options.locations, value: draft.location })}
          <button class="btn btn-primary enquiry-next" id="next">Next</button>
        </form>
      </section>`;
  },
  mount(root, options) {
    const form = root.querySelector('#form');

    form.querySelectorAll('select').forEach((select) => {
      select.addEventListener('change', () => select.classList.toggle('empty', !select.value));
    });

    form.elements.category.addEventListener('change', () => {
      const list = options.categories.find((item) => item.id === form.elements.category.value)?.subcategories ?? [];
      const sub = form.elements.subcategory;
      sub.innerHTML = html`<option value="">Select sub category</option>${list.map((item) => html`<option>${item}</option>`)}`;
      sub.classList.add('empty');
    });

    form.onsubmit = (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form));
      let valid = true;
      Object.entries(REQUIRED).forEach(([name, message]) => {
        const problem = values[name].trim() ? '' : message;
        setFieldError(root.querySelector(`[data-name="${name}"]`), problem);
        if (problem) valid = false;
      });
      const quantityOk = /^[1-9]\d{0,6}$/.test(values.quantity.trim());
      setFieldError(root.querySelector('[data-name="quantity"]'), quantityOk ? '' : 'Enter a whole number above zero.');
      if (!valid || !quantityOk) return;
      saveDraft({ ...values, partName: values.partName.trim(), quantity: Number(values.quantity) });
      go('/enquiry/new/requirements');
    };
  },
};
