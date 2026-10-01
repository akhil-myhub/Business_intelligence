import React from 'react';
import { AavtorLogo } from './AavtorLogo';

// Branded loading indicator: the Aavtor mark breathing inside a rotating arc.
// `overlay` centres it over its (relative) parent; `label` is announced to screen readers and shown below.
export function BrandLoader({ size = 44, label = 'Loading', overlay = false, showLabel = false, tone = 'dark' }) {
  return (
    <div className={'brand-loader' + (overlay ? ' overlay' : '')} role="status" aria-live="polite">
      <span className="bl-ring" style={{ width: size * 1.7, height: size * 1.7 }}>
        <AavtorLogo size={size} tone={tone} className="bl-mark" />
      </span>
      <span className={showLabel ? 'bl-label' : 'sr-only'}>{label}</span>
    </div>
  );
}
