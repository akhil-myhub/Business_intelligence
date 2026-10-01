// Weekly sales model: 96 weeks (Jul 2022 – Jun 2024) × state × product × channel.
//
// Everything the UI shows is computed from these arrays through `aggregate()` / `channelRevenue()`, so
// every filter, tab and drill-down is consistent with every other view (totals always add up).
// The model is calibrated at load so South India · Last Quarter reproduces the headline KPIs.
import { STATES, PRODUCT_DEFS, CHANNEL_DEFS } from './geography';
import { seeded } from './rng';

const WEEKS = 96;
const NOW = WEEKS - 1; // current week (live sales land here)
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const shortMonth = m => MONTHS[(6 + m) % 12]; // m = 0 → Jul 2022
export const monthLabel = m => `${shortMonth(m)} ${2022 + Math.floor((6 + m) / 12)}`;
export const weekLabel = w => `Wk ${(w % 4) + 1} · ${monthLabel(Math.floor(w / 4))}`;

const TARGET = { revenue: 892, units: 8.4, share: 12.8, conv: 3.6, unitsG: 0.116, shareG: 0.024, convG: 0.019 };

const P = STATES.length;
const NP = PRODUCT_DEFS.length;
const NC = CHANNEL_DEFS.length;
const TWO_PI = Math.PI * 2;

/* ── 1. state revenue, calibrated so South India Q2 = ₹892 Cr ─────────────────────────── */
const SOUTH = STATES.map((s, i) => (s.region === 'South India' ? i : -1)).filter(i => i >= 0);

function southQ2(k) {
  return SOUTH.reduce((sum, i) => {
    const g = (k * STATES[i].g) / 100;
    return sum + (STATES[i].base6m * (1 + g)) / (2 + g);
  }, 0);
}

function solveGrowthScale() {
  let lo = 0, hi = 2;
  for (let n = 0; n < 60; n++) {
    const mid = (lo + hi) / 2;
    if (southQ2(mid) < TARGET.revenue) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

const K = solveGrowthScale();

const stateRev = STATES.map(s => {
  const r = seeded('rev:' + s.name);
  const g = ((s.region === 'South India' ? K : 1) * s.g) / 100;
  const q1 = s.base6m / (2 + g), q2 = (s.base6m * (1 + g)) / (2 + g);
  const phase = r() * TWO_PI;
  const arr = new Float64Array(WEEKS);
  for (let t = 0; t < 72; t++) {
    arr[t] = (q1 / 12) * Math.pow(1.12, (t - 72) / 48) * (1 + 0.08 * Math.sin((TWO_PI * t) / 48 + phase)) * (0.96 + 0.08 * r());
  }
  const fill = (a, b, total) => {
    const w = [];
    for (let t = a; t < b; t++) w.push(1 + 0.1 * Math.sin((TWO_PI * t) / 12 + phase) + 0.05 * ((t - a) / (b - a) - 0.5) + (r() - 0.5) * 0.1);
    const sum = w.reduce((x, y) => x + y, 0);
    w.forEach((x, n) => { arr[a + n] = (x / sum) * total; });
  };
  fill(72, 84, q1);
  fill(84, 96, q2);
  return arr;
});

/* ── 2. product and channel mix per state and week ─────────────────────────────────────── */
function mix(defs, key, trendKey, baseKey, variance) {
  return STATES.map(s => {
    const r = seeded(`${key}:${s.name}`);
    const stateVar = defs.map(() => 1 - variance + 2 * variance * r());
    const out = defs.map(() => new Float32Array(WEEKS));
    for (let t = 0; t < WEEKS; t++) {
      const raw = defs.map((d, i) => d[baseKey] * (1 + d[trendKey] * ((t - 48) / 48)) * stateVar[i] * (1 + (r() - 0.5) * 0.05));
      const sum = raw.reduce((x, y) => x + y, 0);
      raw.forEach((v, i) => { out[i][t] = v / sum; });
    }
    return out;
  });
}

const prodShare = mix(PRODUCT_DEFS, 'prod', 'trend', 'w', 0.15);
const chanShare = mix(CHANNEL_DEFS, 'chan', 'tilt', 'base', 0.12);

/* ── 3. price, market share and conversion (level + slope calibrated below) ───────────── */
const cal = { asp0: 1062, aspSlope: 0.0233, sh0: 0.128, shSlope: 0.024, cv0: 0.036, cvSlope: 0.019 };
const stateShareMult = STATES.map(s => 0.8 + 0.4 * seeded('sh:' + s.name)());
const stateConvMult = STATES.map(s => 0.85 + 0.3 * seeded('cv:' + s.name)());
const PROD_CONV = [1.1, 1.0, 1.0, 0.95, 1.05, 0.9];
const drift = (slope, t) => 1 + (slope * (t - 83.5)) / 12;

const aspAt = (p, t) => cal.asp0 * PRODUCT_DEFS[p].aspMult * drift(cal.aspSlope, t);
const shareAt = (s, p, t) => cal.sh0 * stateShareMult[s] * PRODUCT_DEFS[p].shareMult * drift(cal.shSlope, t);
const convAt = (s, p, t) => cal.cv0 * stateConvMult[s] * PROD_CONV[p] * drift(cal.cvSlope, t);

/* ── 4. live sales (added to the current week by the real-time feed) ──────────────────── */
const liveAdd = new Float64Array(P * NP);
export const live = {
  add(s, p, cr) { liveAdd[s * NP + p] += cr; },
  reset() { liveAdd.fill(0); },
  total() { return liveAdd.reduce((a, b) => a + b, 0); }
};

/* ── 5. aggregation ───────────────────────────────────────────────────────────────────── */
export function aggregate(stateIdx, prodIdx, w0, w1) {
  let rev = 0, units = 0, market = 0, convNum = 0;
  for (const s of stateIdx) {
    for (let t = w0; t < w1; t++) {
      const base = stateRev[s][t];
      for (const p of prodIdx) {
        const r = base * prodShare[s][p][t] + (t === NOW ? liveAdd[s * NP + p] : 0);
        rev += r;
        units += (r * 10) / aspAt(p, t); // ₹ Cr → million units
        market += r / shareAt(s, p, t);
        convNum += r * convAt(s, p, t);
      }
    }
  }
  return { rev, units, share: rev ? (rev / market) * 100 : 0, conv: rev ? (convNum / rev) * 100 : 0 };
}

// Revenue per channel (same order as CHANNEL_DEFS) over [w0, w1).
export function channelRevenue(stateIdx, prodIdx, w0, w1) {
  const out = new Array(NC).fill(0);
  for (const s of stateIdx) {
    for (let t = w0; t < w1; t++) {
      const base = stateRev[s][t];
      let r = 0;
      for (const p of prodIdx) r += base * prodShare[s][p][t] + (t === NOW ? liveAdd[s * NP + p] : 0);
      for (let c = 0; c < NC; c++) out[c] += r * chanShare[s][c][t];
    }
  }
  return out;
}

// Share of each product in a state/week set — used to pick products for live sales.
export const productWeights = s => PRODUCT_DEFS.map((_, p) => prodShare[s][p][NOW]);
export const channelWeights = s => CHANNEL_DEFS.map((_, c) => chanShare[s][c][NOW]);
export const stateWeeklyAvg = s => (stateRev[s][NOW - 1] + stateRev[s][NOW]) / 2;

/* ── 6. calibration ───────────────────────────────────────────────────────────────────── */
(function calibrate() {
  const allP = PRODUCT_DEFS.map((_, i) => i);
  for (let it = 0; it < 14; it++) {
    const a = aggregate(SOUTH, allP, 72, 84), b = aggregate(SOUTH, allP, 84, 96);
    cal.asp0 *= b.units / TARGET.units;
    cal.sh0 *= TARGET.share / b.share;
    cal.cv0 *= (TARGET.conv / 100) / (b.conv / 100);
    cal.aspSlope += b.units / a.units - 1 - TARGET.unitsG;
    cal.shSlope += TARGET.shareG - (b.share / a.share - 1);
    cal.cvSlope += TARGET.convG - (b.conv / a.conv - 1);
  }
})();

/* ── 7. period helpers ────────────────────────────────────────────────────────────────── */
const PERIOD_WEEKS = { 'Last Quarter': 12, 'Last 6 Months': 24, 'Last Year': 48 };

export function periodRange(period) {
  const len = PERIOD_WEEKS[period] ?? 12;
  const w1 = WEEKS, w0 = w1 - len;
  return { len, w0, w1, pw0: w0 - len, pw1: w0, months: len / 4, firstMonth: w0 / 4 };
}

export function indexes({ region, state, product }) {
  const stateIdx = state
    ? [STATES.findIndex(s => s.slug === state)]
    : STATES.map((s, i) => (region === 'All Regions' || s.region === region ? i : -1)).filter(i => i >= 0);
  const prodIdx = product && product !== 'All Products' ? [PRODUCT_DEFS.findIndex(p => p.name === product)] : PRODUCT_DEFS.map((_, i) => i);
  return { stateIdx, prodIdx };
}

