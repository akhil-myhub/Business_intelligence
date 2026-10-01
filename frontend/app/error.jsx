'use client'; // error boundaries must be Client Components

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

// Catches unexpected errors in any route segment below the root layout.
// In this Next.js version the recovery callback is `retry` (re-fetch + re-render), not `reset`.
export default function RouteError({ error, retry }) {
  useEffect(() => { logger.error('route_error', { err: error, digest: error.digest }); }, [error]);
  return (
    <main className="boundary" role="alert" style={{ minHeight: '100vh', color: '#fff' }}>
      <h2>Something went wrong</h2>
      <p style={{ color: '#d6defa' }}>The error has been logged. You can try again.</p>
      {error.digest && <small style={{ color: '#aab6e0' }}>Reference: {error.digest}</small>}
      <button className="btn primary" onClick={() => retry()}>Try again</button>
    </main>
  );
}
