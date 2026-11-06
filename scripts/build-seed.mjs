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

const db = {
  meta: { today: '2025-03-15', counters: { user: 100 } },
  users,
  vendors,
};

writeFileSync(new URL('../data/db.json', import.meta.url), `${JSON.stringify(db, null, 2)}\n`);
