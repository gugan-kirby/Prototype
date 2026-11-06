export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export const isMobile = (value) => /^(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/.test(value.trim());

export function passwordProblem(value) {
  if (value.length < 8) return 'Use at least 8 characters.';
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'Use both letters and numbers.';
  return '';
}
