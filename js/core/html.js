// Auto-escaping template tag. Interpolated values are escaped unless they came
// from html`` or raw(), so user input can never inject markup.
class Safe {
  constructor(value) { this.value = value; }
  toString() { return this.value; }
}

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const esc = (value) => String(value).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
export const raw = (value) => new Safe(String(value));

function part(value) {
  if (value === null || value === undefined || value === false || value === true) return '';
  if (Array.isArray(value)) return value.map(part).join('');
  return value instanceof Safe ? value.value : esc(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  values.forEach((value, i) => { out += part(value) + strings[i + 1]; });
  return new Safe(out);
}
