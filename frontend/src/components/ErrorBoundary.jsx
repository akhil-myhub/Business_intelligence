'use client';

import { useEffect } from 'react';
import { catchError } from 'next/error';
import { logger } from '@/lib/logger';
import { AavtorLogo } from './AavtorLogo';

// Component-level boundary (Next's catchError): a crash in one screen shows a recoverable
// message instead of blanking the whole app, and retry() re-renders without losing outer state.
function Fallback({ name = 'section' }, { error, retry }) {
  useEffect(() => { logger.error('ui_boundary', { boundary: name, err: error }); }, [error, name]);
  return (
    <div role="alert" className="boundary panel">
      <AavtorLogo size={40} />
      <h2>This view hit a problem</h2>
      <p>We logged the error and nothing else is affected. You can try again or switch to another section.</p>
      {error?.digest && <small>Reference: {error.digest}</small>}
      <button className="btn primary" onClick={() => retry()}>Try again</button>
    </div>
  );
}

export const ErrorBoundary = catchError(Fallback);
