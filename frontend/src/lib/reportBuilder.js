// Turns the report bundle (/api/data/report) into export-ready sections. Pure and format-agnostic,
// so CSV, Excel, PDF and PowerPoint all show exactly the same numbers.

export const REPORT_TYPES = ['Sales Performance', 'Product Analysis', 'Market Analysis', 'Store Performance', 'Campaign Impact', 'Custom Report'];
export const DATA_LEVELS = ['State', 'Product', 'Channel'];
export const FORMATS = ['PDF', 'Excel', 'PPT', 'CSV'];

const pct = v => `${v >= 0 ? '+' : ''}${v}%`;

const kpiSection = d => ({
  title: 'Key metrics',
  columns: ['Metric', 'Value', 'Change vs previous period'],
  rows: [
    ['Revenue (₹ Cr)', d.kpis.revenue.value, pct(d.kpis.revenue.growth)],
    ['Units sold (M)', d.kpis.units.value, pct(d.kpis.units.growth)],
    ['Market share (%)', d.kpis.share.value, pct(d.kpis.share.growth)],
    ['Conversion rate (%)', d.kpis.conversion.value, pct(d.kpis.conversion.growth)]
  ]
});

const stateSection = d => ({ title: 'Revenue by state', columns: ['State', 'Region', 'Revenue (₹ Cr)', 'Growth'], rows: d.states.map(s => [s.name, s.region, s.revenue, pct(s.growth)]) });
const productSection = d => ({ title: 'Products', columns: ['Product', 'Category', 'Revenue (₹ Cr)', 'Growth', 'Units (M)', 'Market share (%)', 'Portfolio mix (%)'], rows: d.products.map(p => [p.name, p.category, p.revenue, pct(p.growth), p.units, p.share, p.mix]) });
const channelSection = d => ({ title: 'Channels', columns: ['Channel', 'Revenue (₹ Cr)', 'Share (%)', 'Growth'], rows: d.channels.map(c => [c.name, c.revenue, c.share, pct(c.growth)]) });
const campaignSection = d => ({ title: 'Campaigns', columns: ['Campaign', 'Channel', 'Revenue (₹ Cr)', 'Uplift (%)', 'Reach (M)', 'ROI (x)'], rows: d.campaigns.map(c => [c.name, c.channel, c.revenue, c.uplift, c.reach, c.roi]) });

export function buildSections(type, level, d) {
  const main = { State: stateSection, Product: productSection, Channel: channelSection }[level] ?? stateSection;
  switch (type) {
    case 'Product Analysis': return [kpiSection(d), productSection(d)];
    case 'Market Analysis': return [kpiSection(d), channelSection(d)];
    case 'Store Performance': return [kpiSection(d), channelSection(d), stateSection(d)];
    case 'Campaign Impact': return [kpiSection(d), campaignSection(d)];
    case 'Custom Report': return [kpiSection(d), stateSection(d), productSection(d), channelSection(d), campaignSection(d)];
    default: return [kpiSection(d), main(d)];
  }
}

export const reportMeta = (type, d) => ({
  title: `${type} report`,
  subtitle: `${d.filters.region} · ${d.filters.period} (${d.range}) · ${d.filters.product}`,
  generatedAt: d.generatedAt
});

export const fileName = (type, ext) => `${type.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${new Date().toISOString().slice(0, 10)}.${ext}`;
