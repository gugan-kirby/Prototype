import { raw } from './html.js';

const stroke = (body, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${body}</svg>`;

const ICONS = {
  back: stroke('<path d="M15 5l-7 7 7 7"/>'),
  user: stroke('<circle cx="12" cy="7.500" r="4"/><path d="M4.500 17.500c0-2 1.600-3.500 3.600-3.500h7.800c2 0 3.600 1.500 3.600 3.500V19a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2z"/>'),
  phone: stroke('<path d="M5 3.500h3l1.700 4.300-2.200 1.700a13 13 0 0 0 7 7l1.700-2.200 4.300 1.700v3a2 2 0 0 1-2.200 2C10.600 20.300 3.700 13.400 3 5.700a2 2 0 0 1 2-2.200z"/>'),
  mail: stroke('<rect x="3" y="5" width="18" height="14" rx="2.500"/><path d="M3.500 6.500L12 13l8.500-6.500"/>'),
  lock: stroke('<rect x="5" y="10.500" width="14" height="10.500" rx="2.500"/><path d="M8 10.500V7.500a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.500" r=".6" fill="currentColor"/>'),
  eye: stroke('<path d="M2.500 12S6 5.500 12 5.500 21.500 12 21.500 12 18 18.500 12 18.500 2.500 12 2.500 12z"/><circle cx="12" cy="12" r="3"/>'),
  eyeOff: stroke('<path d="M4 4l16 16"/><path d="M10 5.700A9 9 0 0 1 12 5.500c6 0 9.500 6.500 9.500 6.500a17 17 0 0 1-3 3.700M6.300 7.300A16 16 0 0 0 2.500 12S6 18.500 12 18.500a9 9 0 0 0 4-.9"/>'),
  shieldLock: stroke('<path d="M12 2.500l8 3v6.500c0 4.700-3.300 8-8 9.500-4.700-1.500-8-4.800-8-9.500V5.500z"/><path d="M9.800 11.500V9.500a2.200 2.200 0 0 1 4.400 0v2"/><rect x="9" y="11.500" width="6" height="4.500" rx=".8" fill="currentColor" stroke-width="1"/>'),
  shieldCheck: stroke('<path d="M12 2.500l8 3v6.500c0 4.700-3.300 8-8 9.500-4.700-1.500-8-4.800-8-9.500V5.500z"/><path d="M8.300 12l2.700 2.700 4.700-5"/>'),
  shieldBolt: stroke('<path d="M12 2.500l8 3v6.500c0 4.700-3.300 8-8 9.500-4.700-1.500-8-4.800-8-9.500V5.500z"/><path d="M12.800 7L9 12.800h2.700L11 17l4-6h-2.800z" fill="currentColor" stroke-width="1"/>'),
};

export const icon = (name) => raw(ICONS[name] ?? '');
