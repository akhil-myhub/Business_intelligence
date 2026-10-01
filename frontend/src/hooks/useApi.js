import { useCallback, useEffect, useRef, useState } from 'react';
import { HttpError, fetchWithTimeout, isUnloading } from '@/lib/http';
import { logger } from '@/lib/logger';
import { hardNavigate, loginUrl } from '@/lib/navigation';
import { useLive } from '@/providers/LiveProvider';

// Data fetching for screens.
//  - status: 'loading' (nothing to show yet) | 'refreshing' (showing previous data while new data loads)
//            | 'ready' | 'error'
//  - Keeps the previous data on screen while filters change (no flash of skeleton).
//  - With `live: true`, re-fetches when the server's live version moves, at most once per `minIntervalMs`,
//    so KPIs and charts follow the real-time feed without hammering the API.
//  - Cancels in-flight requests on change/unmount; a 401 sends the user to sign in.
export function useApi(url, { live = false, minIntervalMs = 6000 } = {}) {
  const { version } = useLive();
  const [state, setState] = useState({ key: null, data: null, error: null });
  const ctrl = useRef(null);
  const lastStart = useRef(0);

  const run = useCallback(async () => {
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    lastStart.current = Date.now();
    try {
      const res = await fetchWithTimeout(url, { timeoutMs: 15_000, signal: c.signal, credentials: 'same-origin', cache: 'no-store' });
      if (res.status === 401) { hardNavigate(loginUrl()); return; }
      if (!res.ok) throw new HttpError(res.status);
      const data = await res.json();
      if (!c.signal.aborted) setState({ key: url, data, error: null });
    } catch (err) {
      if (c.signal.aborted || isUnloading()) return;
      logger.warn('api_failed', { url: url.split('?')[0], status: err.status, err });
      setState(s => ({ ...s, key: url, error: err }));
    }
  }, [url]);

  useEffect(() => {
    run();
    return () => ctrl.current?.abort();
  }, [run]);

  useEffect(() => {
    if (live && version && Date.now() - lastStart.current >= minIntervalMs) run();
  }, [live, version, minIntervalMs, run]);

  const current = state.key === url;
  const status = current ? (state.error ? 'error' : 'ready') : state.data ? 'refreshing' : 'loading';
  const retry = useCallback(() => { setState(s => ({ ...s, key: null, error: null })); run(); }, [run]);
  return { data: state.data, error: state.error, status, retry, stale: status === 'refreshing' };
}
