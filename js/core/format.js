const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso) {
  const [year, month, day] = iso.split('-');
  return `${day} ${MONTHS[Number(month) - 1]} ${year}`;
}

export function shortDate(iso) {
  const [, month, day] = iso.split('-');
  return `${day} ${MONTHS[Number(month) - 1]}`;
}

export const rupees = (amount) => `₹ ${Math.round(amount).toLocaleString('en-IN')}`;

export function daysBetween(from, to) {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86400000);
}
