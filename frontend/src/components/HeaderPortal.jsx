'use client';

import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

const noop = () => () => {};

// Renders children into one of the top bar's slots (`header-slot` for filters, `crumb-slot` for the
// breadcrumb), so a page can place its controls in the header as in the design.
// Safe during SSR: nothing renders until the slot exists in the browser.
export function HeaderPortal({ children, slot = 'header-slot' }) {
  const target = useSyncExternalStore(noop, () => document.getElementById(slot), () => null);
  return target ? createPortal(children, target) : null;
}
