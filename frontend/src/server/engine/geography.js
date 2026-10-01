// Reference data for the analytics engine. `base6m` is last-6-months revenue (₹ Cr) and `g` the
// quarter-on-quarter growth (%) used to shape each state's series. South India is calibrated so the
// default view (South India · Last Quarter) lands on the headline KPIs; see model.js.
import { slugify } from '@/lib/filters';

const S = (name, region, base6m, g, lon, lat, cities) => ({ name, slug: slugify(name), region, base6m, g, lon, lat, cities });

export const STATES = [
  // South
  S('Tamil Nadu', 'South India', 498, 22.4, 78.4, 11.0, ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem']),
  S('Karnataka', 'South India', 380, 16.6, 76.2, 14.7, ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi']),
  S('Andhra Pradesh', 'South India', 332, 13.6, 77.6, 14.5, ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Nellore']),
  S('Telangana', 'South India', 249, 12.1, 78.1, 16.5, ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam']),
  S('Kerala', 'South India', 214, 10.4, 76.4, 10.5, ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam']),
  // North
  S('Uttar Pradesh', 'North India', 612, 9.8, 80.6, 26.9, ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Noida']),
  S('Delhi', 'North India', 540, 11.2, 77.1, 28.7, ['New Delhi', 'Dwarka', 'Rohini', 'Saket', 'Karol Bagh']),
  S('Rajasthan', 'North India', 355, 8.7, 73.9, 26.6, ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer']),
  S('Punjab', 'North India', 318, 7.4, 75.4, 30.8, ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda']),
  S('Haryana', 'North India', 296, 10.1, 76.3, 29.2, ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal']),
  S('Uttarakhand', 'North India', 118, 6.2, 79.2, 30.2, ['Dehradun', 'Haridwar', 'Haldwani', 'Roorkee', 'Rishikesh']),
  S('Jammu and Kashmir', 'North India', 104, -2.1, 76.6, 33.8, ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur']),
  S('Himachal Pradesh', 'North India', 96, 5.3, 77.2, 31.9, ['Shimla', 'Solan', 'Mandi', 'Dharamshala', 'Kullu']),
  // West
  S('Maharashtra', 'West India', 780, 12.4, 76.1, 19.5, ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane']),
  S('Gujarat', 'West India', 520, 9.1, 71.6, 22.7, ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar']),
  S('Madhya Pradesh', 'West India', 292, 6.8, 78.3, 23.5, ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain']),
  S('Chhattisgarh', 'West India', 138, 4.9, 82.0, 21.3, ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg']),
  S('Goa', 'West India', 76, 8.2, 74.0, 15.4, ['Panaji', 'Margao', 'Vasco', 'Mapusa', 'Ponda']),
  // East
  S('West Bengal', 'East India', 410, 7.9, 87.9, 23.9, ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol']),
  S('Bihar', 'East India', 232, 6.4, 85.6, 25.7, ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga']),
  S('Odisha', 'East India', 205, 8.8, 84.4, 20.5, ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri', 'Sambalpur']),
  S('Assam', 'East India', 160, 5.6, 92.8, 26.4, ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Tezpur']),
  S('Jharkhand', 'East India', 148, 3.9, 85.6, 23.7, ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh']),
  S('Tripura', 'East India', 38, 4.1, 91.7, 23.8, ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar', 'Belonia']),
  S('Meghalaya', 'East India', 30, 3.2, 91.3, 25.5, ['Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Baghmara']),
  S('Manipur', 'East India', 28, -1.4, 93.9, 24.7, ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Ukhrul']),
  S('Nagaland', 'East India', 24, 2.6, 94.5, 26.1, ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha']),
  S('Arunachal Pradesh', 'East India', 26, 2.9, 94.7, 28.0, ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro']),
  S('Mizoram', 'East India', 22, 3.7, 92.8, 23.3, ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib']),
  S('Sikkim', 'East India', 18, 4.4, 88.5, 27.6, ['Gangtok', 'Namchi', 'Mangan', 'Gyalshing', 'Singtam'])
];

export const STATE_BY_SLUG = Object.fromEntries(STATES.map(s => [s.slug, s]));

export const PRODUCT_DEFS = [
  { id: 'a', name: 'Product A', category: 'Premium Care', w: 0.251, trend: 0.1, aspMult: 1.15, shareMult: 1.1 },
  { id: 'b', name: 'Product B', category: 'Daily Care', w: 0.21, trend: -0.02, aspMult: 0.95, shareMult: 1.0 },
  { id: 'c', name: 'Product C', category: 'Daily Care', w: 0.19, trend: 0.04, aspMult: 1.0, shareMult: 0.95 },
  { id: 'd', name: 'Product D', category: 'Value Pack', w: 0.15, trend: -0.05, aspMult: 0.8, shareMult: 0.9 },
  { id: 'e', name: 'Product E', category: 'Premium Care', w: 0.12, trend: 0.0, aspMult: 1.2, shareMult: 0.85 },
  { id: 'f', name: 'Product F', category: 'Value Pack', w: 0.079, trend: -0.07, aspMult: 0.75, shareMult: 0.8 }
];

export const CHANNEL_DEFS = [
  { name: 'Retail', base: 0.38, tilt: 0.02, storeType: 'Retail Store' },
  { name: 'Wholesale', base: 0.24, tilt: -0.05, storeType: 'Wholesale' },
  { name: 'Modern Trade', base: 0.22, tilt: 0.06, storeType: 'Supermarket' },
  { name: 'E-commerce', base: 0.1, tilt: 0.12, storeType: 'E-commerce' },
  { name: 'Others', base: 0.06, tilt: -0.1, storeType: 'Others' }
];

export const COMPETITORS = ['Brand X', 'Brand Y', 'Brand Z'];

// Campaign base values for South India over 12 weeks (₹ Cr, uplift %, reach M).
export const CAMPAIGN_DEFS = [
  { name: 'Campaign A', channel: 'Retail', revenue: 12, uplift: 28, reach: 3.4, roi: 3.2 },
  { name: 'Campaign B', channel: 'Modern Trade', revenue: 10, uplift: 24, reach: 2.8, roi: 2.3 },
  { name: 'Campaign C', channel: 'Wholesale', revenue: 8, uplift: 20, reach: 2.1, roi: 2.6 },
  { name: 'Campaign D', channel: 'E-commerce', revenue: 6, uplift: 16, reach: 1.6, roi: 2.1 },
  { name: 'Campaign E', channel: 'Others', revenue: 4, uplift: 12, reach: 1.2, roi: 1.8 }
];
