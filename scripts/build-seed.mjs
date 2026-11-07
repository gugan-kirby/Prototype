// Generates data/db.json. Run with: node scripts/build-seed.mjs
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const PASSWORD = 'Demo@123';

const users = [
  { id: 'u-gugan', role: 'customer', name: 'Gugan Tennyson', email: 'gugan@jobwork.com', mobile: '9876543210', password: PASSWORD, status: 'active', wallet: 0,
    avatar: 'assets/img/avatar-gugan.jpg',
    company: { name: 'Tennyson Engineering', gstin: '33ABCDE1234F1Z5', address: 'Plot 12, Ambattur Industrial Estate, Chennai' },
    paymentMethods: [{ id: 'pm-1', label: 'UPI', detail: 'gugan@upi' }],
    prefs: { quotes: true, orders: true, payments: true },
    documents: [] },
  { id: 'u-precision', role: 'vendor', name: 'Precision Metals', email: 'vendor@jobwork.com', mobile: '9840012345', password: PASSWORD, status: 'active' },
  { id: 'u-nila', role: 'customer', name: 'Nila Engineering', email: 'nila@jobwork.com', mobile: '9840077777', password: PASSWORD, status: 'active', wallet: 0 },
  { id: 'u-kovai', role: 'vendor', name: 'Kovai Laser Cutting', email: 'kovai@jobwork.com', mobile: '9840012348', password: PASSWORD, status: 'active' },
  { id: 'u-admin', role: 'admin', name: 'Asha Raman', email: 'admin@jobwork.com', mobile: '9840098400', password: PASSWORD, status: 'active' },
  { id: 'u-staff', role: 'staff', name: 'Karthik Selvam', email: 'staff@jobwork.com', mobile: '9840098401', password: PASSWORD, status: 'active' },
];

const vendors = [
  { id: 'v-precision', userId: 'u-precision', name: 'Precision Metals', city: 'Chennai', state: 'Tamil Nadu', stateCode: 'TN', rating: 4.8, reviews: 128, verified: true, tint: 'green', phone: '9840012345', growth: 12.4, trend: [4, 9, 25, 22, 28, 46, 41, 39, 55, 86, 82, 74, 100] },
  { id: 'v-tamil', userId: null, name: 'Tamil CNC Works', city: 'Coimbatore', state: 'Tamil Nadu', stateCode: 'TN', rating: 4.6, reviews: 96, verified: true, tint: 'violet', phone: '9840012346' },
  { id: 'v-star', userId: null, name: 'Star Fabrication', city: 'Hosur', state: 'Tamil Nadu', stateCode: 'TN', rating: 4.5, reviews: 64, verified: true, tint: 'orange', phone: '9840012347' },
  { id: 'v-kovai', userId: 'u-kovai', name: 'Kovai Laser Cutting', city: 'Coimbatore', state: 'Tamil Nadu', stateCode: 'TN', rating: 0, reviews: 0, verified: false, tint: 'blue', phone: '9840012348' },
];

const categories = [
  { id: 'cnc', name: 'CNC Machining', image: 'cat-cnc', top: true, subcategories: ['CNC Milling', 'CNC Turning', 'CNC Drilling', '5-Axis Machining'] },
  { id: 'vmc', name: 'VMC', image: 'cat-vmc', top: true, subcategories: ['3-Axis VMC', '4-Axis VMC', 'Mould Machining'] },
  { id: 'turning', name: 'Turning', image: 'cat-turning', top: true, subcategories: ['Lathe Turning', 'Taper Turning', 'Thread Turning'] },
  { id: 'welding', name: 'Welding', image: 'cat-welding', top: true, subcategories: ['MIG Welding', 'TIG Welding', 'Arc Welding', 'Spot Welding'] },
  { id: 'laser', name: 'Laser Cutting', image: null, top: false, subcategories: ['Fibre Laser', 'CO2 Laser', 'Tube Laser'] },
];

const options = {
  materials: ['Aluminium', 'Aluminium (6061)', 'Mild Steel', 'SS304', 'SS316', 'Brass', 'Copper', 'Cast Iron'],
  units: ['Nos', 'Kg', 'Sets', 'Meters'],
  finishes: ['As Machined', 'Anodized', 'Powder Coated', 'Zinc Plated', 'Polished'],
  tolerances: ['±0.5mm', '±0.2mm', '±0.1mm', '±0.05mm', '±0.01mm'],
};

const addresses = [
  { id: 'a-1', userId: 'u-gugan', label: 'Factory', line: 'Plot 12, Ambattur Industrial Estate', city: 'Chennai', state: 'Tamil Nadu', isDefault: true },
  { id: 'a-2', userId: 'u-gugan', label: 'Warehouse', line: 'SIDCO Industrial Park', city: 'Coimbatore', state: 'Tamil Nadu', isDefault: false },
  { id: 'a-3', userId: 'u-gugan', label: 'Plant 2', line: 'SIPCOT Phase 1', city: 'Hosur', state: 'Tamil Nadu', isDefault: false },
];

const enquiry = (id, partName, category, subcategory, material, date, status, extra = {}) => ({
  id, customerId: 'u-gugan', partName, category, subcategory, material, quantity: 100, unit: 'Nos',
  location: 'Chennai, Tamil Nadu', drawing: null, specifications: '', finish: 'As Machined', tolerance: '±0.1mm', date, status, ...extra,
});

const bracketDrawing = { id: 'seed-bracket', name: 'Bracket Drawing.pdf', size: 2516582 };

const enquiries = [
  enquiry('ENQ-1012', 'Bracket Support', 'cnc', 'CNC Milling', 'Aluminium', '2025-03-12', 'Quoted', {
    drawing: bracketDrawing, specifications: 'No sharp edges', finish: 'Anodized', materialGrade: 'Aluminium (6061)',
  }),
  enquiry('ENQ-1011', 'Base Plate', 'vmc', '3-Axis VMC', 'Mild Steel', '2025-03-10', 'In Progress', { quantity: 50 }),
  enquiry('ENQ-1010', 'Shaft Collar', 'turning', 'Lathe Turning', 'SS304', '2025-03-08', 'Closed', { quantity: 200 }),
  enquiry('ENQ-1009', 'L Bracket', 'cnc', 'CNC Milling', 'Aluminium', '2025-03-06', 'Quoted', { art: 'lbracket' }),
  enquiry('ENQ-1008', 'Flange Ring', 'cnc', 'CNC Turning', 'SS316', '2025-03-04', 'In Progress', { quantity: 40 }),
  enquiry('ENQ-1007', 'Gear Housing', 'vmc', '4-Axis VMC', 'Cast Iron', '2025-03-03', 'In Progress', { quantity: 25 }),
  enquiry('ENQ-1006', 'Mounting Frame', 'welding', 'MIG Welding', 'Mild Steel', '2025-03-01', 'In Progress', { quantity: 10 }),
  enquiry('ENQ-1005', 'Spacer Bush', 'turning', 'Lathe Turning', 'Brass', '2025-02-27', 'Quoted', { quantity: 500 }),
  enquiry('ENQ-1004', 'Bracket Support', 'cnc', 'CNC Milling', 'Aluminium', '2025-02-24', 'Closed'),
  enquiry('ENQ-1003', 'Base Plate', 'vmc', '3-Axis VMC', 'Mild Steel', '2025-02-20', 'Closed', { quantity: 50 }),
  enquiry('ENQ-1002', 'L Bracket', 'cnc', 'CNC Milling', 'Aluminium', '2025-02-16', 'Closed', { art: 'lbracket' }),
  enquiry('ENQ-1001', 'Drive Coupling', 'turning', 'Lathe Turning', 'SS304', '2025-02-10', 'Closed', { quantity: 30 }),
];

const quote = (id, enquiryId, vendorId, amount, leadDays, extra = {}) => ({
  id, enquiryId, vendorId, amount, leadDays, minQty: 50, gstPercent: 18, paymentTerms: '50% advance, 50% on delivery',
  validUntil: '2025-03-29', notes: 'Price includes material and finishing.', date: '2025-03-13', status: 'Submitted', ...extra,
});

const quotes = [
  quote('Q-1', 'ENQ-1012', 'v-precision', 12500, 5),
  quote('Q-2', 'ENQ-1012', 'v-tamil', 13200, 6),
  quote('Q-3', 'ENQ-1012', 'v-star', 14000, 7),
  quote('Q-4', 'ENQ-1009', 'v-precision', 9800, 6, { date: '2025-03-08' }),
  quote('Q-5', 'ENQ-1009', 'v-star', 10400, 8, { date: '2025-03-09' }),
  quote('Q-6', 'ENQ-1005', 'v-tamil', 22500, 9, { date: '2025-03-01', minQty: 100 }),
];

const order = (id, enquiryId, vendorId, partName, category, material, date, amount, status, stage, extra = {}) => ({
  id, enquiryId, quoteId: null, customerId: 'u-gugan', vendorId, partName, category, material, quantity: 100, unit: 'Nos', amount, date, status, stage,
  history: Array.from({ length: stage + 1 }, (_, index) => ({ stage: index, date })), ...extra,
});

const orders = [
  order('ORD-1008', 'ENQ-1004', 'v-precision', 'Bracket Support', 'cnc', 'Aluminium', '2025-03-15', 12500, 'In Progress', 2, {
    art: 'factory',
    delivery: { dispatch: '2025-03-18', arrive: '2025-03-19' },
    history: [
      { stage: 0, date: '2025-03-15', time: '10:24 AM' },
      { stage: 1, date: '2025-03-15', time: '05:40 PM' },
      { stage: 2, date: '2025-03-16', time: '02:15 PM' },
    ],
  }),
  order('ORD-1007', 'ENQ-1003', 'v-tamil', 'Base Plate', 'vmc', 'Mild Steel', '2025-03-12', 8400, 'Completed', 5, { quantity: 50 }),
  order('ORD-1006', 'ENQ-1010', 'v-star', 'Shaft Collar', 'turning', 'SS304', '2025-03-10', 14000, 'In Progress', 1, { quantity: 200 }),
  order('ORD-1005', 'ENQ-1002', 'v-precision', 'L Bracket', 'cnc', 'Aluminium', '2025-03-06', 9200, 'Completed', 5, { art: 'lbracket', tint: 'green' }),
  order('ORD-1004', 'ENQ-1001', 'v-tamil', 'Drive Coupling', 'turning', 'SS304', '2025-02-20', 6300, 'Completed', 5, { quantity: 30 }),
  order('ORD-1003', null, 'v-star', 'Guide Rail', 'cnc', 'Mild Steel', '2025-02-18', 15800, 'In Progress', 3),
  order('ORD-1002', null, 'v-tamil', 'Pump Cover', 'cnc', 'Aluminium', '2025-02-12', 4100, 'Completed', 5),
  order('ORD-1001', null, 'v-star', 'Weld Bracket', 'welding', 'Mild Steel', '2025-02-05', 2900, 'Cancelled', 0),
];

const invoice = (id, orderId, amount, date, dueDate, status) => ({ id, orderId, customerId: 'u-gugan', amount, date, dueDate, status });

const invoices = [
  invoice('INV-2025-006', 'ORD-1008', 12500, '2025-03-15', '2025-03-18', 'Unpaid'),
  invoice('INV-2025-005', 'ORD-1007', 8400, '2025-03-12', '2025-03-15', 'Paid'),
  invoice('INV-2025-004', 'ORD-1006', 14000, '2025-03-10', '2025-03-20', 'Unpaid'),
  invoice('INV-2025-003', 'ORD-1005', 9200, '2025-03-06', '2025-03-09', 'Paid'),
  invoice('INV-2025-002', 'ORD-1004', 6300, '2025-02-20', '2025-02-23', 'Paid'),
  invoice('INV-2025-001', 'ORD-1002', 4100, '2025-02-12', '2025-02-15', 'Paid'),
];

const payments = invoices.filter((item) => item.status === 'Paid').map((item, index) => ({
  id: `P-${index + 1}`, invoiceId: item.id, customerId: item.customerId, amount: item.amount, method: 'UPI', type: 'Payment', status: 'Success', date: item.date,
}));

const messages = [
  { id: 'm-1', customerId: 'u-gugan', vendorId: 'v-precision', from: 'vendor', text: 'Thanks for the enquiry. We can start as soon as the order is confirmed.', date: '2025-03-13' },
];

// Work from a second customer, so the vendor dashboard totals are real data.
const nila = (id, partName, category, subcategory, material, quantity, date, status, extra = {}) => ({
  ...enquiry(id, partName, category, subcategory, material, date, status, extra), customerId: 'u-nila', quantity,
});

enquiries.push(
  nila('ENQ-2003', 'Bracket Support', 'cnc', 'CNC Milling', 'Aluminium', 100, '2025-03-15', 'In Progress', { minutesAgo: 2 }),
  nila('ENQ-2002', 'Base Plate', 'laser', 'Fibre Laser', 'Mild Steel', 50, '2025-03-15', 'In Progress', { minutesAgo: 14 }),
  nila('ENQ-2001', 'Shaft Collar', 'cnc', 'CNC Turning', 'SS304', 200, '2025-03-15', 'In Progress', { minutesAgo: 28, process: 'CNC Turning' }),
);

const SPARE_PARTS = [['Hinge Plate', 'Mild Steel'], ['Valve Body', 'Brass'], ['Motor Mount', 'Aluminium'], ['Roller Pin', 'SS304']];
const spare = (index) => SPARE_PARTS[index % SPARE_PARTS.length];

for (let index = 0; index < 16; index += 1) {
  const [part, material] = spare(index);
  enquiries.push(nila(`ENQ-21${String(index).padStart(2, '0')}`, part, 'cnc', 'CNC Milling', material, 40 + index * 5, '2025-03-11', 'In Progress'));
  const quoted = nila(`ENQ-22${String(index).padStart(2, '0')}`, part, 'cnc', 'CNC Milling', material, 60 + index * 5, '2025-03-09', 'Quoted');
  enquiries.push(quoted);
  quotes.push(quote(`Q-${10 + index}`, quoted.id, 'v-precision', 7000 + index * 450, 6, { date: '2025-03-10' }));
}

const VENDOR_ORDERS = [[8000, 2], [9500, 3], [11000, 1], [12500, 2], [7800, 4], [9000, 4], [10500, 4], [12000, 5], [11000, 5], [11500, 5]];

VENDOR_ORDERS.forEach(([amount, stage], index) => {
  const [part, material] = spare(index);
  const id = `ORD-09${String(index).padStart(2, '0')}`;
  const finished = stage === 5;
  orders.push(order(id, null, 'v-precision', part, 'cnc', material, `2025-03-${String(index + 1).padStart(2, '0')}`, amount, finished ? 'Completed' : 'In Progress', stage, { customerId: 'u-nila' }));
});

const notifications = [
  { id: 'n-1', userId: 'u-gugan', title: 'New quote received', body: 'Precision Metals quoted for Bracket Support.', date: '2025-03-14', read: true, link: '/enquiries/ENQ-1012' },
  { id: 'n-3', userId: 'u-precision', title: 'New enquiry', body: 'Bracket Support, 100 Nos', date: '2025-03-15', read: false, link: '/v/enquiries/ENQ-2003' },
  { id: 'n-2', userId: 'u-gugan', title: 'Order in production', body: 'ORD-1008 Bracket Support is now in production.', date: '2025-03-13', read: true, link: '/orders/ORD-1008' },
];

const db = {
  meta: { today: '2025-03-15', counters: { user: 100, notification: 100, address: 10, support: 0, method: 1, enquiry: 1012, quote: 6, order: 1008, invoice: 6, message: 1, payment: 4 }, options },
  users,
  vendors,
  categories,
  addresses,
  supportRequests: [],
  enquiries,
  quotes,
  orders,
  invoices,
  payments,
  messages,
  notifications,
};

// A browser's saved copy is replaced whenever the seed content changes.
db.meta.seedVersion = createHash('sha256').update(JSON.stringify(db)).digest('hex').slice(0, 12);

writeFileSync(new URL('../data/db.json', import.meta.url), `${JSON.stringify(db, null, 2)}\n`);
