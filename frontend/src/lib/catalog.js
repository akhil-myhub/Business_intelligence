// Static lookup lists the browser needs (search, selectors) without importing the analytics engine.
// tests/catalog.test.js keeps this in sync with src/server/engine/geography.js.
import { slugify, PRODUCT_NAMES } from './filters';

const STATE_NAMES = [
  'Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Uttar Pradesh', 'Delhi', 'Rajasthan', 'Punjab', 'Haryana',
  'Uttarakhand', 'Jammu and Kashmir', 'Himachal Pradesh', 'Maharashtra', 'Gujarat', 'Madhya Pradesh', 'Chhattisgarh', 'Goa',
  'West Bengal', 'Bihar', 'Odisha', 'Assam', 'Jharkhand', 'Tripura', 'Meghalaya', 'Manipur', 'Nagaland', 'Arunachal Pradesh', 'Mizoram', 'Sikkim'
];

export const STATE_OPTIONS = STATE_NAMES.map(name => ({ name, slug: slugify(name) }));
export const PRODUCT_OPTIONS = PRODUCT_NAMES.map(name => ({ name, id: name.slice(-1).toLowerCase() }));

export const NAV = [
  { id: 'ask', label: 'Ask', href: '/ask', match: p => p.startsWith('/ask') || p.startsWith('/overview') || p.startsWith('/dashboard') },
  { id: 'products', label: 'Products', href: '/products', match: p => p.startsWith('/products') },
  { id: 'market', label: 'Market', href: '/market', match: p => p.startsWith('/market') },
  { id: 'stores', label: 'Stores', href: '/stores/tamil-nadu', match: p => p.startsWith('/stores') },
  { id: 'campaigns', label: 'Campaigns', href: '/campaigns', match: p => p.startsWith('/campaigns') },
  { id: 'reports', label: 'Reports', href: '/reports', match: p => p.startsWith('/reports') }
];

export const PAGES = [
  { label: 'Ask AI', path: '/ask', hint: 'Ask a question about your data' },
  { label: 'Overview', path: '/overview', hint: 'KPIs and key insight' },
  { label: 'Dashboard', path: '/dashboard', hint: 'Map, trend and states' },
  { label: 'Products', path: '/products', hint: 'Product ranking' },
  { label: 'Market analysis', path: '/market', hint: 'Channels, regions, competitors' },
  { label: 'Stores', path: '/stores/tamil-nadu', hint: 'State drill-down' },
  { label: 'Campaigns', path: '/campaigns', hint: 'Campaign impact and ROI' },
  { label: 'Reports', path: '/reports', hint: 'Create and export reports' },
  { label: 'Settings', path: '/settings', hint: 'Preferences and account' }
];
