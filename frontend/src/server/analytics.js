// View builders: one function per screen. Each takes validated filters and returns plain JSON.
// This file (with ./engine) is the stand-in for the analytics backend — when the real backend exists,
// replace the body of `getView` with calls to it; routes, validation, auth and the UI stay unchanged.
import {
  STATES, STATE_BY_SLUG, PRODUCT_DEFS, CHANNEL_DEFS, COMPETITORS, CAMPAIGN_DEFS
} from './engine/geography';
import { aggregate, channelRevenue, indexes, periodRange, shortMonth, monthLabel, weekLabel } from './engine/model';
import { seeded } from './engine/rng';

const AS_OF = 'Jun 2024';
const REGION_LIST = ['South India', 'North India', 'West India', 'East India'];
const round = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;
const pct = (cur, prev) => (prev > 0 ? round((cur / prev - 1) * 100) : 0);
const noun = { 'Last Quarter': 'quarter', 'Last 6 Months': 'six months', 'Last Year': 'year' };
const lc = s => s.toLowerCase();

function context(filters) {
  const range = periodRange(filters.period);
  const { stateIdx, prodIdx } = indexes(filters);
  const cur = aggregate(stateIdx, prodIdx, range.w0, range.w1);
  const prev = aggregate(stateIdx, prodIdx, range.pw0, range.pw1);
  return { range, stateIdx, prodIdx, cur, prev };
}

const kpiSet = (cur, prev) => ({
  revenue: { value: round(cur.rev), growth: pct(cur.rev, prev.rev) },
  units: { value: round(cur.units), growth: pct(cur.units, prev.units) },
  share: { value: round(cur.share), growth: pct(cur.share, prev.share) },
  conversion: { value: round(cur.conv), growth: pct(cur.conv, prev.conv) }
});

const periodLabel = ({ w0, w1 }) => `${shortMonth(Math.floor(w0 / 4))} – ${monthLabel(Math.floor((w1 - 1) / 4))}`;
const monthLabels = ({ firstMonth, months }) => Array.from({ length: months }, (_, i) => shortMonth(firstMonth + i));

function weeklyTrend(stateIdx, prodIdx, { w0, w1 }) {
  const points = [];
  for (let w = w0; w < w1; w++) points.push({ value: round(aggregate(stateIdx, prodIdx, w, w + 1).rev, 2), label: weekLabel(w) });
  return points;
}

// Revenue/growth for every state under the current period + product (map colouring, rankings).
function stateTable(filters, range) {
  const { prodIdx } = indexes({ ...filters, region: 'All Regions' });
  return STATES.map((s, i) => {
    const cur = aggregate([i], prodIdx, range.w0, range.w1), prev = aggregate([i], prodIdx, range.pw0, range.pw1);
    return {
      name: s.name, slug: s.slug, region: s.region, lon: s.lon, lat: s.lat,
      inRegion: filters.region === 'All Regions' || s.region === filters.region,
      revenue: round(cur.rev), growth: pct(cur.rev, prev.rev)
    };
  });
}

/* ── overview ─────────────────────────────────────────────────────────────────────────── */
function channelDeltas(c) {
  const { stateIdx, prodIdx, range } = c;
  const cur = channelRevenue(stateIdx, prodIdx, range.w0, range.w1), prev = channelRevenue(stateIdx, prodIdx, range.pw0, range.pw1);
  return CHANNEL_DEFS.map((d, i) => ({ name: d.name, revenue: cur[i], delta: cur[i] - prev[i], growth: pct(cur[i], prev[i]) }));
}

function overview(filters, q) {
  const c = context(filters);
  const kpis = kpiSet(c.cur, c.prev);
  const g = kpis.revenue.growth;
  const channels = channelDeltas(c).sort((a, b) => b.delta - a.delta);
  const states = stateTable(filters, c.range).filter(s => s.inRegion).sort((a, b) => b.growth - a.growth);
  const where = filters.region === 'All Regions' ? 'India' : filters.region;
  const what = filters.product === 'All Products' ? 'Sales' : `${filters.product} sales`;
  const drivers = [];
  let headline = 'Key Insight';
  let text = `${what} in ${where} ${g >= 0 ? 'grew' : 'fell'} by ${Math.abs(g)}% compared to the previous ${noun[filters.period]}, `
    + `${g >= 0 ? 'driven by higher demand across' : 'held back by weaker demand in'} ${lc(channels[g >= 0 ? 0 : channels.length - 1].name)} and `
    + `${lc(channels[g >= 0 ? 1 : channels.length - 2].name)} channels.`;

  const diagnose = q && /(why|reason|cause|drop|declin|fall|decreas|down)/i.test(q);
  if (diagnose) {
    const weak = [...states].slice(-3).reverse();
    const weakCh = [...channels].reverse().slice(0, 2);
    headline = g < 0 ? 'Why sales dropped' : 'Why sales did not drop';
    text = g < 0
      ? `${what} in ${where} fell ${Math.abs(g)}% versus the previous ${noun[filters.period]}. The weakest states were ${weak.map(s => `${s.name} (${s.growth}%)`).join(', ')}.`
      : `${what} in ${where} did not drop — it grew ${g}% versus the previous ${noun[filters.period]}. The softest areas to watch are ${weak.map(s => `${s.name} (${s.growth >= 0 ? '+' : ''}${s.growth}%)`).join(', ')}.`;
    weak.forEach(s => drivers.push({ label: s.name, detail: `${s.growth >= 0 ? '+' : ''}${s.growth}% revenue`, tone: s.growth < 0 ? 'down' : 'flat' }));
    weakCh.forEach(ch => drivers.push({ label: `${ch.name} channel`, detail: `${ch.growth >= 0 ? '+' : ''}${ch.growth}% revenue`, tone: ch.growth < 0 ? 'down' : 'flat' }));
  } else {
    states.slice(0, 3).forEach(s => drivers.push({ label: s.name, detail: `${s.growth >= 0 ? '+' : ''}${s.growth}% revenue`, tone: s.growth >= 0 ? 'up' : 'down' }));
    channels.slice(0, 2).forEach(ch => drivers.push({ label: `${ch.name} channel`, detail: `${ch.growth >= 0 ? '+' : ''}${ch.growth}% revenue`, tone: ch.growth >= 0 ? 'up' : 'down' }));
  }
  return { filters, asOf: AS_OF, range: periodLabel(c.range), kpis, insight: { headline, text, drivers }, question: q || null };
}

/* ── dashboard ────────────────────────────────────────────────────────────────────────── */
function dashboard(filters) {
  const c = context(filters);
  const states = stateTable(filters, c.range);
  const ranked = states.filter(s => s.inRegion).sort((a, b) => b.revenue - a.revenue);
  return {
    filters, asOf: AS_OF, range: periodLabel(c.range),
    kpis: kpiSet(c.cur, c.prev),
    trend: { points: weeklyTrend(c.stateIdx, c.prodIdx, c.range), months: monthLabels(c.range) },
    states, top: ranked.slice(0, 5)
  };
}

/* ── state drill-down ─────────────────────────────────────────────────────────────────── */
function drill(filters, slug) {
  const st = STATE_BY_SLUG[slug];
  const c = context({ ...filters, state: slug });
  const r = seeded('city:' + slug + filters.product);
  const weights = [0.3, 0.21, 0.16, 0.12, 0.09].map(w => w * (0.88 + 0.24 * r()));
  const sg = pct(c.cur.rev, c.prev.rev);
  const cities = st.cities.map((name, i) => ({ name, revenue: round(c.cur.rev * weights[i]), growth: round(sg - i * 1.2 * (0.7 + 0.6 * r()) + (r() - 0.4) * 2.5) }))
    .sort((a, b) => b.revenue - a.revenue);
  const ch = channelRevenue(c.stateIdx, c.prodIdx, c.range.w0, c.range.w1);
  const chPrev = channelRevenue(c.stateIdx, c.prodIdx, c.range.pw0, c.range.pw1);
  const total = ch.reduce((a, b) => a + b, 0);
  const stores = CHANNEL_DEFS.map((d, i) => ({ type: d.storeType, revenue: round(ch[i], 2), unitsLakh: round(c.cur.units * 10 * (ch[i] / total)), growth: pct(ch[i], chPrev[i]) }));
  const channels = CHANNEL_DEFS.map((d, i) => ({ name: d.name, value: round((ch[i] / total) * 100) }));
  const rank = stateTable(filters, c.range).sort((a, b) => b.revenue - a.revenue).findIndex(s => s.slug === slug) + 1;
  return {
    filters, asOf: AS_OF, range: periodLabel(c.range),
    state: { name: st.name, slug, region: st.region, rank, of: STATES.length },
    kpis: kpiSet(c.cur, c.prev), cities, stores, channels, total: round(c.cur.rev),
    states: STATES.map(s => ({ name: s.name, slug: s.slug }))
  };
}

/* ── products ─────────────────────────────────────────────────────────────────────────── */
function productRows(filters, c) {
  const all = PRODUCT_DEFS.map((p, i) => {
    const cur = aggregate(c.stateIdx, [i], c.range.w0, c.range.w1), prev = aggregate(c.stateIdx, [i], c.range.pw0, c.range.pw1);
    return { id: p.id, name: p.name, category: p.category, revenue: round(cur.rev), growth: pct(cur.rev, prev.rev), units: round(cur.units, 2), share: round(cur.share), shareGrowth: pct(cur.share, prev.share), cur };
  });
  const total = all.reduce((a, p) => a + p.revenue, 0);
  return all.map(({ cur, ...p }) => ({ ...p, mix: round((p.revenue / total) * 100) })).sort((a, b) => b.revenue - a.revenue);
}

function products(filters) {
  const c = context({ ...filters, product: 'All Products' });
  const rows = productRows(filters, c);
  return { filters, asOf: AS_OF, range: periodLabel(c.range), rows, total: round(c.cur.rev), top: rows[0].id };
}

function product(filters, id) {
  const def = PRODUCT_DEFS.find(p => p.id === id);
  const f = { ...filters, product: def.name };
  const c = context(f);
  const channelsNow = channelRevenue(c.stateIdx, c.prodIdx, c.range.w0, c.range.w1);
  const total = channelsNow.reduce((a, b) => a + b, 0);
  const chPrev = channelRevenue(c.stateIdx, c.prodIdx, c.range.pw0, c.range.pw1);
  const shareSeries = Array.from({ length: c.range.months }, (_, i) => {
    const m = c.range.firstMonth + i;
    return { label: shortMonth(m), ours: round(aggregate(c.stateIdx, c.prodIdx, m * 4, m * 4 + 4).share, 2), category: round(aggregate(c.stateIdx, indexes({ ...f, product: 'All Products' }).prodIdx, m * 4, m * 4 + 4).share, 2) };
  });
  const states = stateTable(f, c.range).filter(s => s.inRegion).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  return {
    filters: f, asOf: AS_OF, range: periodLabel(c.range),
    product: { id: def.id, name: def.name, category: def.category },
    kpis: kpiSet(c.cur, c.prev),
    trend: { points: weeklyTrend(c.stateIdx, c.prodIdx, c.range), months: monthLabels(c.range) },
    channels: CHANNEL_DEFS.map((d, i) => ({ name: d.name, value: round((channelsNow[i] / total) * 100), revenue: round(channelsNow[i]), growth: pct(channelsNow[i], chPrev[i]) })),
    share: shareSeries,
    stores: CHANNEL_DEFS.map((d, i) => ({ type: d.storeType, revenue: round(channelsNow[i], 2), unitsLakh: round(c.cur.units * 10 * (channelsNow[i] / total)), growth: pct(channelsNow[i], chPrev[i]) })),
    states,
    campaigns: campaignList(c.cur.rev, c.prev.rev, c.range).rows
  };
}

/* ── market ───────────────────────────────────────────────────────────────────────────── */
function market(filters) {
  const c = context(filters);
  const now = channelRevenue(c.stateIdx, c.prodIdx, c.range.w0, c.range.w1);
  const prev = channelRevenue(c.stateIdx, c.prodIdx, c.range.pw0, c.range.pw1);
  const total = now.reduce((a, b) => a + b, 0);
  const channels = CHANNEL_DEFS.map((d, i) => ({ name: d.name, revenue: round(now[i]), share: round((now[i] / total) * 100), growth: pct(now[i], prev[i]) }));

  const last = Array.from({ length: 6 }, (_, i) => 18 + i); // last six months, compared with the same month a year earlier
  const growthTrend = {
    labels: last.map(shortMonth),
    series: CHANNEL_DEFS.map((d, ci) => last.map(m => {
      const a = channelRevenue(c.stateIdx, c.prodIdx, m * 4, m * 4 + 4)[ci], b = channelRevenue(c.stateIdx, c.prodIdx, (m - 12) * 4, (m - 12) * 4 + 4)[ci];
      return pct(a, b);
    }))
  };

  const months = Math.max(6, c.range.months);
  const first = 24 - months;
  const regional = {
    labels: Array.from({ length: months }, (_, i) => shortMonth(first + i)),
    series: REGION_LIST.map(name => ({
      name,
      values: Array.from({ length: months }, (_, i) => round(aggregate(indexes({ region: name, product: filters.product }).stateIdx, c.prodIdx, (first + i) * 4, (first + i) * 4 + 4).rev))
    }))
  };

  const mix = productRows(filters, c);
  const ours = round(c.cur.share), oursPrev = round(c.prev.share);
  const r = seeded('comp:' + filters.region);
  const split = [0.34, 0.26, 0.18].map(x => x * (0.9 + 0.2 * r()));
  const ss = split.reduce((a, b) => a + b, 0);
  const rest = 100 - ours;
  const competitive = [
    { name: 'Our brand', share: ours, change: round(ours - oursPrev, 2) },
    ...COMPETITORS.map((name, i) => ({ name, share: round((split[i] / (ss + 0.22)) * rest), change: round((r() - 0.55) * 1.2, 2) })),
  ];
  competitive.push({ name: 'Others', share: round(100 - competitive.reduce((a, b) => a + b.share, 0)), change: 0 });

  return { filters, asOf: AS_OF, range: periodLabel(c.range), total: round(total), channels, growthTrend, regional, productMix: mix, competitive };
}

/* ── campaigns ────────────────────────────────────────────────────────────────────────── */
const INCREMENTAL_FACTOR = 5.08; // orders generated per exposed million at 100% uplift (calibrated)
const ADDRESSABLE_M = 308; // addressable audience (millions) for reach %

function campaignList(revCur, revPrev, range) {
  const scale = revCur / 892; // South India · Last Quarter is the base the campaign table was calibrated on
  const rows = CAMPAIGN_DEFS.map(d => ({
    name: d.name, channel: d.channel, revenue: round(d.revenue * scale), uplift: Math.max(1, round(d.uplift * (0.92 + 0.16 * Math.min(scale, 1.4)), 0)),
    reach: round(d.reach * scale), roi: round(d.roi * (0.95 + 0.1 * Math.min(scale, 1.2)))
  }));
  const incr = rows.reduce((a, r) => a + r.reach * (r.uplift / 100), 0) * INCREMENTAL_FACTOR;
  const reach = rows.reduce((a, r) => a + r.reach, 0);
  const g = pct(revCur, revPrev);
  return { rows, incrementalSales: round(incr), incrementalSalesGrowth: round(24 + (g - 14.2)), incrementalReach: round((reach / ADDRESSABLE_M) * 100), incrementalReachGrowth: round(32 + (g - 14.2) * 1.3), range: range && periodLabel(range) };
}

function campaigns(filters) {
  const c = context(filters);
  return { filters, asOf: AS_OF, range: periodLabel(c.range), ...campaignList(c.cur.rev, c.prev.rev, c.range) };
}

/* ── report bundle (exports) ──────────────────────────────────────────────────────────── */
function report(filters) {
  const c = context(filters);
  return {
    filters, asOf: AS_OF, range: periodLabel(c.range), generatedAt: new Date().toISOString(),
    kpis: kpiSet(c.cur, c.prev),
    states: stateTable(filters, c.range).filter(s => s.inRegion).sort((a, b) => b.revenue - a.revenue),
    channels: market(filters).channels,
    products: productRows(filters, c),
    campaigns: campaignList(c.cur.rev, c.prev.rev).rows
  };
}

/* ── dispatcher ───────────────────────────────────────────────────────────────────────── */
export function getView(view, filters, { state, id, q } = {}) {
  switch (view) {
    case 'overview': return overview(filters, q);
    case 'dashboard': return dashboard(filters);
    case 'drill': return STATE_BY_SLUG[state] ? drill(filters, state) : null;
    case 'products': return products(filters);
    case 'product': return PRODUCT_DEFS.some(p => p.id === id) ? product(filters, id) : null;
    case 'market': return market(filters);
    case 'campaigns': return campaigns(filters);
    case 'report': return report(filters);
    default: return null;
  }
}

