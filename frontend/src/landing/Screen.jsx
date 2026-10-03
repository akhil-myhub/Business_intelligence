'use client';

import React, { useEffect, useRef, useState } from 'react';

const DESIGN_W = 1440;
const NAV = 88;         // design px reserved for the sticky header (it scales with the window width)
const MAX_ZOOM = 1.6;   // never blow the design up beyond this on very large monitors
const MAX_WIDE = 2700;  // widest layout a "wide" section will re-flow to
const MAX_PASSES = 7;   // layout-solving passes per resize

/**
 * One landing section = one screen. On desktop the section sits in a full-height panel and is scaled
 * (CSS `zoom`) so the whole thing fits the window.
 *
 * `wide` sections additionally solve for their own layout width: the content is re-flowed wider until, once
 * scaled to fit the window height, it also fills the window width. Every section therefore uses the whole
 * screen, whatever its natural proportions. Below 1100px nothing is scaled — responsive.css takes over.
 */
export default function Screen({ id, children, tone, nav = true, fill = true, wide = false, floor = 0.4, budget = 1 }) {
  const maxWide = typeof wide === 'number' ? wide : MAX_WIDE; // `wide={1700}` caps how far a section may re-flow
  const inner = useRef(null);
  const root = useRef(null);
  const [box, setBox] = useState(null); // { s, w } — null until measured → CSS falls back to the width-based --lp-zoom

  // animations only run while the screen is (nearly) in view — see motion.css [data-live]
  useEffect(() => {
    const el = root.current;
    const io = new IntersectionObserver(([e]) => { el.dataset.live = e.isIntersecting ? 'true' : 'false'; }, { rootMargin: '120px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = inner.current;
    let layoutW = DESIGN_W;   // the width the section is currently laid out at
    let passes = 0;           // solver iterations since the last resize
    let tallest = 0;          // tallest natural height seen at the locked width (content changes may grow it)

    const fit = natural => {
      const vw = window.innerWidth;
      const z0 = Math.min(vw / DESIGN_W, MAX_ZOOM);
      const avail = window.innerHeight * budget - (nav ? NAV * z0 : 0); // `budget` < 1 leaves breathing room below the section
      return { vw, avail, byHeight: natural ? avail / natural : MAX_ZOOM };
    };

    const apply = natural => {
      const { vw, byHeight } = fit(natural);
      if (vw < 1100) { setBox({ s: 1, w: null }); return; }

      if (wide && passes < MAX_PASSES) {
        // width at which the height-fitted scale exactly fills the window width; move halfway there each pass
        const target = Math.min(maxWide, Math.max(DESIGN_W, vw / Math.min(byHeight, MAX_ZOOM)));
        const next = Math.round(layoutW + (target - layoutW) / 2);
        passes += 1;
        if (Math.abs(next - layoutW) > 12) layoutW = next; else passes = MAX_PASSES; // converged → lock
      }
      const w = wide ? layoutW : DESIGN_W;
      setBox({ s: Math.max(floor, Math.min(vw / w, byHeight, MAX_ZOOM)), w });
    };

    // offsetHeight is the layout height in unscaled px, so it is unaffected by the zoom we apply (no feedback loop)
    const onSize = () => {
      const h = el.offsetHeight;
      if (!wide || passes < MAX_PASSES) { tallest = h; apply(h); return; }
      tallest = Math.max(tallest, h); // locked: only let the scale shrink if content (tabs, answers) grows
      apply(tallest);
    };
    const onResize = () => { passes = 0; layoutW = wide ? layoutW : DESIGN_W; onSize(); };

    const ro = new ResizeObserver(onSize);
    ro.observe(el);
    window.addEventListener('resize', onResize);
    document.fonts?.ready.then(onResize);
    return () => { ro.disconnect(); window.removeEventListener('resize', onResize); };
  }, [nav, wide, floor, maxWide, budget]);

  const style = box ? { zoom: box.s, '--fit': box.s, ...(box.w ? { width: box.w } : null) } : undefined;
  const cls = ['lp-screen', tone && `tone-${tone}`, nav && 'has-nav', fill && 'fill'].filter(Boolean).join(' ');
  return (
    <div id={id} ref={root} className={cls}>
      <div ref={inner} className="lp-fit" style={style}>{children}</div>
    </div>
  );
}
