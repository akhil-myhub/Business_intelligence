'use client';

import React from 'react';

/**
 * Full-page photo backdrop. The photo is kept invisible until it has fully decoded and then fades in over the
 * gradient that `.bg` paints, so a slow connection never shows a half-drawn image or a hard edge.
 */
export default function Backdrop() {
  const reveal = el => el.classList.add('in');
  return (
    <div className="bg" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative full-bleed backdrop, sized by CSS */}
      <img
        src="/assets/bi-background.webp"
        alt=""
        decoding="async"
        fetchPriority="high"
        ref={el => { if (el?.complete && el.naturalWidth > 0) reveal(el); }}
        onLoad={e => reveal(e.currentTarget)}
      />
    </div>
  );
}
