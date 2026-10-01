// Shared dataset. Used by the UI and by the /api/query route, so swapping this
// for a real warehouse/BI backend only means changing getInsights().

export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

export const states = [
  { name: 'Tamil Nadu', revenue: 420, bar: 420, growth: 22.4, lon: 78.4, lat: 11.1 },
  { name: 'Karnataka', revenue: 320, bar: 320, growth: 16.6, lon: 76.4, lat: 14.6 },
  { name: 'Andhra Pradesh', revenue: 240, bar: 280, growth: 13.6, lon: 79.6, lat: 15.6 },
  { name: 'Telangana', revenue: 210, bar: 210, growth: 12.1, lon: 79.0, lat: 17.9 },
  { name: 'Kerala', revenue: 180, bar: 180, growth: 10.4, lon: 76.6, lat: 10.2 }
];

// 25 points (weekly) across Jan..Jun, so the line wiggles like the design
export const trend = [120, 125, 180, 215, 190, 230, 290, 310, 420, 395, 370, 350, 340, 380, 420, 400, 410, 480, 540, 520, 510, 500, 540, 570, 600];
export const productTrend = [48, 62, 55, 72, 88, 80, 98, 100, 122, 140, 120, 125, 105, 118, 130, 128, 140, 150, 146, 135, 150, 160, 155, 168, 176];

export const cities = [
  ['Chennai', 78, 22], ['Coimbatore', 64, 18], ['Madurai', 52, 16],
  ['Tiruchirappalli', 44, 14], ['Salem', 36, 12]
];

export const stores = [
  ['Retail Store', '₹ 4.2 Cr', '1.2 L', 20], ['Supermarket', '₹ 3.8 Cr', '1.1 L', 24],
  ['Wholesale', '₹ 3.1 Cr', '0.9 L', 20], ['E-commerce', '₹ 2.6 Cr', '0.8 L', 18],
  ['Others', '₹ 2.4 Cr', '0.7 L', 16]
];

export const channels = [
  { name: 'Retail', share: 38, revenue: 420 },
  { name: 'Wholesale', share: 24, revenue: 320 },
  { name: 'Modern Trade', share: 22, revenue: 180 },
  { name: 'E-commerce', share: 10, revenue: 100 },
  { name: 'Others', share: 6, revenue: 60 }
];
export const productChannels = [38, 26, 22, 10, 4];
export const marketChannels = [34, 26, 22, 12, 6];
export const marketBars = [['Retail', 420], ['Wholesale', 320], ['Modern Trade', 180], ['Others', 100]];

// order: Retail, Wholesale, Modern Trade, E-commerce, Others
export const channelTrend = [
  [8, 12, 12, 14, 14, 16], [4, 4, 3, 3, 4, 6], [20, 19, 18, 17, 18, 19], [14, 16, 24, 18, 24, 22], [12, 13, 16, 14, 15, 18]
];

export const campaigns = [
  ['Campaign A', 'Retail', '₹ 12 Cr', 28, '3.4 M', '3.2x'],
  ['Campaign B', 'Modern Trade', '₹ 10 Cr', 24, '2.8 M', '2.3x'],
  ['Campaign C', 'Wholesale', '₹ 8 Cr', 20, '2.1 M', '2.6x'],
  ['Campaign D', 'E-commerce', '₹ 6 Cr', 16, '1.6 M', '2.1x'],
  ['Campaign E', 'Others', '₹ 4 Cr', 12, '1.2 M', '1.8x']
];

export const suggestions = ['Show sales trend', 'Top performing products', 'Why did sales drop?', 'Market analysis'];

export const reportTypes = [
  'Sales Performance', 'Product Analysis', 'Market Analysis',
  'Store Performance', 'Campaign Impact', 'Custom Report'
];

export const baseKpis = { revenue: 892, units: 8.4, share: 12.8, conversion: 3.6 };
export const baseGrowth = { revenue: 14.2, units: 11.6, share: 2.4, conversion: 1.9 };

// Steps of the AI pipeline — streamed one by one from /api/query.
export const pipeline = [
  { id: 'understand', title: 'Understanding Your Query', detail: 'Analyzing intent and extracting filters' },
  { id: 'retrieve', title: 'Retrieving Data', detail: 'From sales, stores, products and market data' },
  { id: 'analyze', title: 'Analyzing', detail: 'With AI models' },
  { id: 'generate', title: 'Generating Insights', detail: 'Creating visualizations and business insights' }
];

export function getInsights(query = '') {
  const q = query.toLowerCase();
  const region = /karnataka/.test(q) ? 'Karnataka' : /tamil/.test(q) ? 'Tamil Nadu' : 'South India';
  return {
    query, region, period: 'Last Quarter',
    kpis: baseKpis, growth: baseGrowth, states, trend,
    insight: 'Sales in South India grew 14.2% compared to the previous quarter, driven by higher demand across retail and modern trade channels.'
  };
}
