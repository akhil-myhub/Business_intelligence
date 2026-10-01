'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

// Replaces the root layout when it crashes, so it must render its own <html>/<body> and inline styles.
export default function GlobalError({ error, retry }) {
  useEffect(() => { logger.error('global_error', { err: error, digest: error.digest }); }, [error]);
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#1b2350', color: '#fff', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
        <div role="alert">
          <h2>The application hit an unexpected error</h2>
          <p>It has been logged. Please try again.</p>
          {error.digest && <small>Reference: {error.digest}</small>}
          <p><button onClick={() => retry()} style={{ padding: '10px 20px', borderRadius: 12, border: 0, background: '#2f6bff', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Try again</button></p>
        </div>
      </body>
    </html>
  );
}
