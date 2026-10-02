'use client'; // error boundaries must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';
import { logger } from '@/lib/logger';
import { StatusPage } from '@/components/StatusPage';

// Catches unexpected errors in any route segment below the root layout.
// In this Next.js version the recovery callback is `retry` (re-fetch + re-render), not `reset`.
export default function RouteError({ error, retry }) {
  useEffect(() => { logger.error('route_error', { err: error, digest: error.digest }); }, [error]);
  return (
    <StatusPage role="alert" title="Something went wrong" message={`The error has been logged${error.digest ? ` (reference ${error.digest})` : ''}. You can try again.`}>
      <button className="btn primary" onClick={() => retry()}>Try again</button>
      <Link href="/ask" className="btn ghost">Go to workspace</Link>
    </StatusPage>
  );
}
