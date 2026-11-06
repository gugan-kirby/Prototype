import { ApiError, request, store } from '../core/api.js';
import { session } from './auth.js';
import { notify } from './notifications.js';

const DRAFT_KEY = 'jobwork.enquiryDraft';

export function readDraft() {
  try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY)) ?? {}; } catch { return {}; }
}

export function saveDraft(changes) {
  const draft = { ...readDraft(), ...changes };
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  return draft;
}

export const clearDraft = () => sessionStorage.removeItem(DRAFT_KEY);

const locationName = (address) => `${address.city}, ${address.state}`;

export const enquiryOptions = () => request(() => {
  const userId = session()?.userId;
  return {
    ...store.meta().options,
    categories: store.all('categories'),
    locations: [...new Set(store.where('addresses', (item) => item.userId === userId).map(locationName))],
  };
});

export const MAX_DRAWING_BYTES = 10 * 1024 * 1024;
const DRAWING_TYPES = ['pdf', 'dwg', 'step', 'stp', 'jpg', 'jpeg'];

export function drawingProblem(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  if (!DRAWING_TYPES.includes(extension)) return 'Upload a PDF, DWG, STEP or JPG file.';
  if (file.size > MAX_DRAWING_BYTES) return 'File is larger than 10MB.';
  if (file.size === 0) return 'This file is empty.';
  return '';
}

export const specificationSummary = ({ finish, specifications, tolerance }) => [
  finish && `${finish} finish`,
  specifications,
  tolerance && `Tolerance ${tolerance}`,
].filter(Boolean).join(', ');

export const submitEnquiry = (draft) => request(() => {
  const required = ['partName', 'category', 'subcategory', 'material', 'quantity', 'unit', 'location'];
  if (required.some((field) => !draft[field])) throw new ApiError('Some enquiry details are missing. Please go back and check.');
  const number = store.nextNumber('enquiry');
  const enquiry = store.insert('enquiries', {
    id: `ENQ-${number}`,
    customerId: session().userId,
    partName: draft.partName,
    category: draft.category,
    subcategory: draft.subcategory,
    material: draft.material,
    quantity: draft.quantity,
    unit: draft.unit,
    location: draft.location,
    drawing: draft.drawing ?? null,
    specifications: draft.specifications ?? '',
    finish: draft.finish,
    tolerance: draft.tolerance,
    date: store.meta().today,
    status: 'In Progress',
  });
  store.where('vendors', (vendor) => vendor.verified && vendor.userId).forEach((vendor) => {
    notify(vendor.userId, 'New enquiry', `${enquiry.partName}, ${enquiry.quantity} ${enquiry.unit}`, `/v/enquiries/${enquiry.id}`);
  });
  sessionStorage.removeItem(DRAFT_KEY);
  return enquiry;
});

export const myEnquiries = () => request(() => {
  const userId = session()?.userId;
  const categories = store.all('categories');
  return {
    categories,
    enquiries: store.where('enquiries', (item) => item.customerId === userId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((item) => ({ ...item, categoryName: categories.find((category) => category.id === item.category)?.name ?? item.category })),
  };
});
