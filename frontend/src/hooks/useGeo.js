import { useCallback, useEffect, useState } from 'react';
import { clientConfig } from '@/config/client';
import { fetchJson } from '@/lib/http';
import { logger } from '@/lib/logger';

const cache = new Map(); // successes only — a failed load must stay retryable

// Loads /geo/<name>.json with timeout + bounded retries. Returns { status, data, retry }.
// `status` is derived (cache hit => ready; no result for this attempt yet => loading) so the effect
// only ever sets state from async callbacks, never synchronously.
export function useGeo(name) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ key: '', status: 'loading', data: null });
  const key = `${name}:${attempt}`;

  useEffect(() => {
    if (cache.has(name)) return undefined;
    let live = true;
    fetchJson(`/geo/${name}.json`, clientConfig.geo)
      .then(data => { cache.set(name, data); if (live) setResult({ key, status: 'ready', data }); })
      .catch(err => { logger.error('geo_load_failed', { name, err }); if (live) setResult({ key, status: 'error', data: null }); });
    return () => { live = false; };
  }, [name, key]);

  const retry = useCallback(() => { setResult({ key: '', status: 'loading', data: null }); setAttempt(a => a + 1); }, []);

  if (cache.has(name)) return { status: 'ready', data: cache.get(name), retry };
  return result.key === key ? { ...result, retry } : { status: 'loading', data: null, retry };
}
