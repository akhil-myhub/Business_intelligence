// Real-time sales feed. One simulator per server process, shared by every connected browser.
// It starts with the first subscriber and stops shortly after the last one leaves, so an idle
// server does no work. Each sale is added to the analytics model (engine `live`), which means the
// KPIs, charts and map computed by the data API move with the feed — it is one source of truth.
//
// This is the stand-in for the real event stream (Kafka/Pub-Sub/WebSocket from the backend):
// replace `step()` with a consumer that calls `publish(...)` and nothing else changes.
import { STATES, PRODUCT_DEFS, CHANNEL_DEFS } from './engine/geography';
import { live as store, productWeights, channelWeights, stateWeeklyAvg } from './engine/model';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'live' });
const IDLE_STOP_MS = 15_000;

function weightedPick(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r <= 0) return i; }
  return weights.length - 1;
}

function create() {
  const weekly = STATES.map((_, i) => stateWeeklyAvg(i));
  const dailyAll = weekly.reduce((a, b) => a + b, 0) / 7;
  const now = new Date();
  const dayFraction = (now.getHours() * 60 + now.getMinutes()) / 1440;
  const sim = {
    subscribers: new Set(), timer: null, stopTimer: null, version: 0, seq: 0,
    momentum: STATES.map(() => 1), cooldown: new Map(), recent: [], recentOrders: [], milestone: 0,
    todayBase: dailyAll * dayFraction, weekly
  };
  // average sale value so the whole country books `dailyAll` Cr a day at `ordersPerTick` sales per tick
  const ordersPerTick = 2;
  const ticksPerDay = 86_400_000 / env.liveTickMs;
  const avgSale = (dailyAll / (ticksPerDay * ordersPerTick)) * env.liveSpeedup;

  const publish = (event, data) => { for (const fn of sim.subscribers) { try { fn(event, data); } catch { /* subscriber gone */ } } };

  const snapshot = () => ({
    version: sim.version,
    todayCr: Math.round((sim.todayBase + store.total()) * 100) / 100,
    ordersPerMin: sim.recentOrders.length,
    serverTime: Date.now()
  });

  function alertFor(s, kind) {
    const key = `${s}:${kind}`;
    if (Date.now() - (sim.cooldown.get(key) ?? 0) < 90_000) return;
    sim.cooldown.set(key, Date.now());
    const st = STATES[s], m = sim.momentum[s];
    const change = Math.round(Math.abs(m - 1) * 100);
    publish('alert', {
      id: `a${++sim.seq}`, ts: Date.now(), severity: kind === 'surge' ? 'positive' : 'warning', state: st.name, slug: st.slug,
      title: kind === 'surge' ? `Order surge in ${st.name}` : `Orders slowing in ${st.name}`,
      message: kind === 'surge' ? `Sales pace is ${change}% above the usual run-rate.` : `Sales pace is ${change}% below the usual run-rate.`,
      path: `/stores/${st.slug}`
    });
  }

  function step() {
    const t = Date.now();
    sim.recentOrders = sim.recentOrders.filter(x => t - x < 60_000);
    // momentum drifts back toward 1 with noise: surges and dips emerge and fade like real demand
    sim.momentum = sim.momentum.map(m => Math.min(2, Math.max(0.4, m + (1 - m) * 0.04 + (Math.random() - 0.5) * 0.1)));
    sim.momentum.forEach((m, i) => { if (m > 1.5) alertFor(i, 'surge'); else if (m < 0.62) alertFor(i, 'dip'); });

    for (let n = 0; n < ordersPerTick; n++) {
      const s = weightedPick(sim.weekly.map((w, i) => w * sim.momentum[i]));
      const p = weightedPick(productWeights(s)), c = weightedPick(channelWeights(s));
      const amountCr = avgSale * (0.3 + Math.random() * 1.4);
      store.add(s, p, amountCr);
      sim.recentOrders.push(t);
      const sale = { id: `s${++sim.seq}`, ts: t, state: STATES[s].name, slug: STATES[s].slug, product: PRODUCT_DEFS[p].name, channel: CHANNEL_DEFS[c].name, amountCr: Math.round(amountCr * 1000) / 1000 };
      sim.recent = [sale, ...sim.recent].slice(0, 25);
      publish('sale', sale);
    }
    sim.version++;
    const snap = snapshot();
    const mile = Math.floor(snap.todayCr / 25);
    if (sim.milestone && mile > sim.milestone) {
      publish('alert', { id: `a${++sim.seq}`, ts: t, severity: 'info', title: 'Daily milestone', message: `Today's revenue crossed ₹ ${mile * 25} Cr.`, path: '/dashboard' });
    }
    sim.milestone = mile;
    publish('tick', snap);
  }

  return {
    snapshot, recent: () => sim.recent,
    subscribe(fn) {
      sim.subscribers.add(fn);
      clearTimeout(sim.stopTimer);
      if (!sim.timer) { sim.timer = setInterval(step, env.liveTickMs); log.info('live_feed_started', { tickMs: env.liveTickMs, speedup: env.liveSpeedup }); }
      log.debug('live_subscriber_added', { subscribers: sim.subscribers.size });
      return () => {
        sim.subscribers.delete(fn);
        log.debug('live_subscriber_removed', { subscribers: sim.subscribers.size });
        if (!sim.subscribers.size) {
          sim.stopTimer = setTimeout(() => { clearInterval(sim.timer); sim.timer = null; log.info('live_feed_stopped'); }, IDLE_STOP_MS);
        }
      };
    },
    subscriberCount: () => sim.subscribers.size
  };
}

// One instance per process, even across dev hot reloads.
export const liveFeed = (globalThis.__businessaiLive ??= create());
