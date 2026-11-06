import { deleteFile, fileSize, putFile } from '../core/files.js';
import { html } from '../core/html.js';
import { icon } from '../core/icons.js';
import { go } from '../core/router.js';
import { setFieldError, toast } from '../core/ui.js';
import { drawingProblem, enquiryOptions, readDraft, saveDraft } from '../services/enquiries.js';
import { memberArea } from './guards.js';
import { selectField, stepper } from './enquiry-parts.js';

function dropContent(file) {
  if (!file) {
    return html`${icon('cloudUp')}<strong>Upload File</strong><span>PDF, DWG, STEP, JPG (Max 10MB)</span>`;
  }
  return html`<div class="drop-file"><img src="assets/img/pdf.svg" alt=""><div><strong>${file.name}</strong><span>${fileSize(file.size)}</span></div></div>
    <span class="link drop-change">Tap to replace</span>`;
}

export default {
  name: 'enquiry-requirements',
  guard: () => memberArea() ?? (readDraft().partName ? null : '/enquiry/new'),
  load: () => enquiryOptions(),
  view(options) {
    const draft = readDraft();
    return html`
      <header class="center-head">
        <button class="icon-btn" data-go="/enquiry/new" aria-label="Back">${icon('back')}</button><h1>New Enquiry</h1>
      </header>
      <section class="enquiry-form requirements">
        ${stepper(2)}
        <form id="form" novalidate>
          <div class="form-row">
            <span class="form-label">Upload Drawing</span>
            <label class="drop ${draft.drawing ? 'has-file' : ''}" data-name="drawing" id="drop">
              <input type="file" id="file" accept=".pdf,.dwg,.step,.stp,.jpg,.jpeg" aria-label="Upload drawing">
              <div id="drop-content">${dropContent(draft.drawing)}</div>
            </label>
            ${draft.drawing && html`<button type="button" class="link drop-remove" id="remove">Remove file</button>`}
          </div>
          <div class="form-row">
            <label class="form-label" for="specifications">Specifications / Comments</label>
            <div class="area" data-name="specifications"><textarea id="specifications" name="specifications" maxlength="500" placeholder="Enter specifications or any special requirements...">${draft.specifications ?? ''}</textarea></div>
          </div>
          ${selectField({ name: 'finish', label: 'Surface Finish', placeholder: 'Select finish', options: options.finishes, value: draft.finish })}
          ${selectField({ name: 'tolerance', label: 'Tolerance', placeholder: 'Select tolerance', options: options.tolerances, value: draft.tolerance })}
          <div class="btn-pair">
            <button type="button" class="btn btn-outline" data-go="/enquiry/new">Back</button>
            <button class="btn btn-primary" id="next">Next</button>
          </div>
        </form>
      </section>`;
  },
  mount(root, _, ctx) {
    const form = root.querySelector('#form');
    const drop = root.querySelector('#drop');
    const saveText = () => saveDraft(Object.fromEntries(new FormData(form)));

    form.querySelectorAll('select').forEach((select) => {
      select.addEventListener('change', () => select.classList.toggle('empty', !select.value));
    });

    root.querySelector('#file').addEventListener('change', async (event) => {
      const [file] = event.target.files;
      event.target.value = '';
      if (!file) return;
      const problem = drawingProblem(file);
      setFieldError(drop, problem);
      if (problem) return;
      root.querySelector('#drop-content').innerHTML = '<div class="spinner" role="status" aria-label="Uploading"></div>';
      try {
        const previous = readDraft().drawing;
        const stored = await putFile(file);
        if (previous) await deleteFile(previous.id);
        saveText();
        saveDraft({ drawing: stored });
        ctx.refresh();
      } catch (error) {
        root.querySelector('#drop-content').innerHTML = dropContent(readDraft().drawing);
        toast(error.message, 'bad');
      }
    });

    root.querySelector('#remove')?.addEventListener('click', async () => {
      await deleteFile(readDraft().drawing.id);
      saveText();
      saveDraft({ drawing: null });
      ctx.refresh();
    });

    form.onsubmit = (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form));
      const hasBrief = readDraft().drawing || values.specifications.trim();
      setFieldError(drop, hasBrief ? '' : 'Upload a drawing or enter specifications.');
      setFieldError(root.querySelector('[data-name="finish"]'), values.finish ? '' : 'Select a surface finish.');
      setFieldError(root.querySelector('[data-name="tolerance"]'), values.tolerance ? '' : 'Select a tolerance.');
      if (!hasBrief || !values.finish || !values.tolerance) return;
      saveDraft({ ...values, specifications: values.specifications.trim() });
      go('/enquiry/new/review');
    };
  },
};
