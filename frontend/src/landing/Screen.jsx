'use client';

import React, { useEffect, useRef, useState } from 'react';

const DESIGN_W = 1440;
const NAV = 88;        // design px reserved for the sticky header (it scales with the window width)
const MAX_ZOOM = 1.6;  // never blow the design up beyond this on very large monitors
const MAX_WIDE = 1800; // widest layout a "wide" section will re-flow to

/**
 * One landing section = one screen. On desktop the section sits in a full-height panel and is scaled so the
 * whole thing fits the window. `wide` sections also re-flow into the extra width of wide, short windows
 * (their grids stretch), so text stays larger than a plain shrink would leave it. Below 1100px nothing is
 * scaled — responsive.css takes over with a fluid layout.
 *
 * Scaling uses CSS `zoom`, so layout, text and hit-testing all stay correct (no transforms).
 */
export default function Screen({ id, children, tone, nav = true, fill = true, wide = false, floor = 0.4 }) {
  const inner = useRef(null);
  const natural = useRef(0);
  const [box, setBox] = useState(null); // { s, w } — null until measured → CSS falls back to the width-based --lp-zoom

  useEffect(() => {
    const el = inner.current;
    const layoutWidth = () => {
      if (!wide) return DESIGN_W;
      const aspect = window.innerWidth / window.innerHeight;
      return Math.round(Math.min(MAX_WIDE, Math.max(DESIGN_W, DESIGN_W * (aspect / 1.6))));
    };

    const apply = () => {
      const vw = window.innerWidth;
      if (vw < 1100) { setBox({ s: 1, w: null }); return; }
      const w = layoutWidth();
      const z0 = Math.min(vw / DESIGN_W, MAX_ZOOM);
      const avail = window.innerHeight - (nav ? NAV * z0 : 0);
      const byHeight = natural.current ? avail / natural.current : MAX_ZOOM;
      setBox({ s: Math.max(floor, Math.min(vw / w, byHeight, MAX_ZOOM)), w });
    };
    // offsetHeight is the layout height in unscaled px, so it is unaffected by the zoom we apply (no feedback loop)
    const measure = grow => {
      const h = el.offsetHeight;
      natural.current = grow ? Math.max(natural.current, h) : h;
      apply();
    };

    const ro = new ResizeObserver(() => measure(true)); // content changes (tabs, answers) may grow the section
    ro.observe(el);
    const onResize = () => measure(false);
    window.addEventListener('resize', onResize);
    document.fonts?.ready.then(onResize);
    return () => { ro.disconnect(); window.removeEventListener('resize', onResize); };
  }, [nav, wide, floor]);

  const style = box ? { zoom: box.s, '--fit': box.s, ...(box.w ? { width: box.w } : null) } : undefined;
  const cls = ['lp-screen', tone && `tone-${tone}`, nav && 'has-nav', fill && 'fill'].filter(Boolean).join(' ');
  return (
    <div id={id} className={cls}>
      <div ref={inner} className="lp-fit" style={style}>{children}</div>
    </div>
  );
}
