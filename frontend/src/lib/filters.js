// Filter vocabulary shared by the browser (URL state, dropdowns) and the server (validation).
// Keeping one source of truth means a value that renders in a dropdown is always accepted by the API.

export const REGIONS = ['All Regions', 'South India', 'North India', 'West India', 'East India'];
export const PERIODS = ['Last Quarter', 'Last 6 Months', 'Last Year'];
export const PRODUCT_NAMES = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E', 'Product F'];
export const PRODUCTS = ['All Products', ...PRODUCT_NAMES];

export const DEFAULT_FILTERS = Object.freeze({ region: 'South India', period: 'Last Quarter', product: 'All Products' });

export const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);

// Never trust the URL: unknown values fall back to defaults instead of reaching the engine.
export function parseFilters(get, defaults = DEFAULT_FILTERS) {
  return {
    region: pick(get('region'), REGIONS, defaults.region),
    period: pick(get('period'), PERIODS, defaults.period),
    product: pick(get('product'), PRODUCTS, defaults.product)
  };
}
