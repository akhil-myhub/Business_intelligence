import { useEffect, useState } from 'react';
import { clientConfig } from '@/config/client';
import { baseKpis, baseGrowth, states, trend } from '@/data/mock';

const jitter = (v, pct) => v * (1 + (Math.random() - 0.5) * pct);

// Live metrics feed. Today: a tiny random walk standing in for a push channel.
// To go real, replace the interval body with a WebSocket/SSE subscription that calls setLive(...);
// the visibility pause, cleanup and status contract stay the same.
// The feed pauses while the tab is hidden so background tabs burn no CPU/battery/network.
export function useLive() {
  const [live, setLive] = useState({ kpis: baseKpis, growth: baseGrowth, states, trend, tick: 0, paused: false });

  useEffect(() => {
    let id = null;
    const tick = () => setLive(p => ({
      ...p,
      tick: p.tick + 1,
      kpis: {
        revenue: jitter(baseKpis.revenue, 0.0004),
        units: jitter(baseKpis.units, 0.0004),
        share: jitter(baseKpis.share, 0.0004),
        conversion: jitter(baseKpis.conversion, 0.0008)
      },
      states: states.map(s => ({ ...s, revenue: jitter(s.revenue, 0.002), bar: jitter(s.bar, 0.002) }))
    }));
    const start = () => {
      if (id == null) id = setInterval(tick, clientConfig.live.intervalMs);
      setLive(p => (p.paused ? { ...p, paused: false } : p));
    };
    const stop = () => {
      if (id != null) { clearInterval(id); id = null; }
      setLive(p => (p.paused ? p : { ...p, paused: true }));
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (id != null) clearInterval(id);
    };
  }, []);

  return live;
}
