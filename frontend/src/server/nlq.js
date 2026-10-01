// Rule-based question understanding. Deterministic and fast: it extracts the filters a question
// mentions (region, period, product, state) and picks the screen that answers it best.
// It is intentionally not an LLM — swap `interpret` for a model call later without touching callers
// (contract: question in → { intent, path, summary, filters } out).
import { STATES } from './engine/geography';

const STATE_NAMES = [...STATES].sort((a, b) => b.name.length - a.name.length);

function detectRegion(q) {
  if (/(all|pan)[\s-]*(india|regions)|nationwide|national|across india|whole country/i.test(q)) return 'All Regions';
  for (const [re, name] of [[/south/i, 'South India'], [/north/i, 'North India'], [/west/i, 'West India'], [/east/i, 'East India']]) if (re.test(q)) return name;
  return null;
}

function detectPeriod(q) {
  if (/last\s+(year|12 months)|annual|yearly|this year|past year/i.test(q)) return 'Last Year';
  if (/(last|past)\s+(6|six)\s+months|half[\s-]?year|six months/i.test(q)) return 'Last 6 Months';
  if (/last\s+(quarter|3 months|three months)|this quarter|quarterly|past quarter/i.test(q)) return 'Last Quarter';
  return null;
}

function detectProduct(q) {
  const m = /product\s*([a-f])\b/i.exec(q);
  return m ? `Product ${m[1].toUpperCase()}` : null;
}

export function interpret(question) {
  const q = question.trim();
  const region = detectRegion(q), period = detectPeriod(q), product = detectProduct(q);
  const state = STATE_NAMES.find(s => new RegExp(`\\b${s.name}\\b`, 'i').test(q));

  const params = new URLSearchParams();
  const filters = {};
  if (region) { params.set('region', region); filters.region = region; }
  if (period) { params.set('period', period); filters.period = period; }
  if (product && !/products?\s*[a-f]\b.*(top|rank)/i.test(q)) { params.set('product', product); filters.product = product; }

  let intent = 'overview', path = '/overview', summary = 'Here is the performance overview for your question.';
  const asksWhy = /\b(why|reason|cause|drop|declin|fall|fell|decreas|down)\b/i.test(q);

  if (/report|export|download|\bpdf\b|excel|spreadsheet|powerpoint|\bppt\b/i.test(q)) {
    intent = 'reports'; path = '/reports'; summary = 'Opening the report builder.';
  } else if (/campaign|\broi\b|promotion|promo|advertis/i.test(q)) {
    intent = 'campaigns'; path = '/campaigns'; summary = 'Showing campaign impact and ROI.';
  } else if (asksWhy) {
    intent = 'diagnosis'; path = '/overview'; params.set('q', q); summary = 'Analysing what moved sales and where.';
  } else if (product && !/top|best|rank/i.test(q)) {
    intent = 'product'; path = `/products/${product.slice(-1).toLowerCase()}`; params.delete('product'); summary = `Showing ${product} performance.`;
  } else if (/top|best|leading|ranking|which products?|products?\s+(performance|ranking)|performing products?/i.test(q) && /product/i.test(q)) {
    intent = 'products'; path = '/products'; summary = 'Ranking products by revenue.';
  } else if (state) {
    intent = 'state'; path = `/stores/${state.slug}`; summary = `Drilling into ${state.name}.`;
  } else if (/market|channel|competit|market share|regional|mix/i.test(q)) {
    intent = 'market'; path = '/market'; summary = 'Showing market and channel analysis.';
  } else if (/trend|over time|monthly|weekly|by state|state[\s-]?wise|map|dashboard/i.test(q)) {
    intent = 'dashboard'; path = '/dashboard'; summary = 'Building the sales dashboard.';
  } else if (/\bq\b|sales|revenue|performance|units|conversion|summary|overview|kpi/i.test(q)) {
    params.set('q', q);
  } else {
    params.set('q', q);
  }

  const qs = params.toString();
  return { intent, path: qs ? `${path}?${qs}` : path, summary, filters };
}
