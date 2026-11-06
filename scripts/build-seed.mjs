// Generates data/db.json. Run with: node scripts/build-seed.mjs
import { writeFileSync } from 'node:fs';

const PASSWORD = 'Demo@123';

const users = [
  { id: 'u-gugan', role: 'customer', name: 'Gugan Tennyson', email: 'gugan@jobwork.com', mobile: '9876543210', password: PASSWORD, status: 'active' },
  { id: 'u-precision', role: 'vendor', name: 'Precision Metals', email: 'vendor@jobwork.com', mobile: '9840012345', password: PASSWORD, status: 'active' },
  { id: 'u-admin', role: 'admin', name: 'Asha Raman', email: 'admin@jobwork.com', mobile: '9840098400', password: PASSWORD, status: 'active' },
  { id: 'u-staff', role: 'staff', name: 'Karthik Selvam', email: 'staff@jobwork.com', mobile: '9840098401', password: PASSWORD, status: 'active' },
];

const vendors = [
  { id: 'v-precision', userId: 'u-precision', name: 'Precision Metals', city: 'Chennai', state: 'Tamil Nadu', stateCode: 'TN', rating: 4.8, reviews: 128, verified: true, tint: 'green' },
  { id: 'v-tamil', userId: null, name: 'Tamil CNC Works', city: 'Coimbatore', state: 'Tamil Nadu', stateCode: 'TN', rating: 4.6, reviews: 96, verified: true, tint: 'violet' },
  { id: 'v-star', userId: null, name: 'Star Fabrication', city: 'Hosur', state: 'Tamil Nadu', stateCode: 'TN', rating: 4.5, reviews: 64, verified: true, tint: 'orange' },
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

const notifications = [
  { id: 'n-1', userId: 'u-gugan', title: 'New quote received', body: 'Precision Metals quoted for Bracket Support.', date: '2025-03-14', read: true, link: '/enquiries/ENQ-1012' },
  { id: 'n-2', userId: 'u-gugan', title: 'Order in production', body: 'ORD-1008 Bracket Support is now in production.', date: '2025-03-13', read: true, link: '/orders/ORD-1008' },
];

const db = {
  meta: { today: '2025-03-15', counters: { user: 100, notification: 100, address: 10, enquiry: 1012 }, options },
  users,
  vendors,
  categories,
  addresses,
  enquiries: [],
  notifications,
};

writeFileSync(new URL('../data/db.json', import.meta.url), `${JSON.stringify(db, null, 2)}\n`);
