'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

/**
 * The hero product render, presented with depth: a soft glow behind it, a tablet bezel,
 * a light sweep, and a perspective tilt that follows the pointer (mouse only — touch and reduced-motion users
 * get the resting pose). Pure presentation: the render itself is the only content.
 */
export default function HeroArt() {
  const stage = useRef(null);
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const aim = e => {
    if (e.pointerType !== 'mouse') return;
    const el = stage.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty('--rx', `${(2 + (0.5 - y) * 8).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(-5 + (x - 0.5) * 11).toFixed(2)}deg`);
    });
  };

  const rest = () => {
    cancelAnimationFrame(frame.current);
    const el = stage.current;
    ['--rx', '--ry'].forEach(p => el.style.removeProperty(p));
  };

  return (
    <div className="lp-hero-art" ref={stage} onPointerMove={aim} onPointerLeave={rest}>
      <div className="lp-halo" aria-hidden="true" />
      <div className="lp-float">
        <div className="lp-tilt">
          <div className="lp-rim">
            <div className="lp-shot">
              <Image src="/landing/hero-wireframe.webp" alt="The ten screens of the BusinessAI workspace" fill sizes="920px" quality={95} priority />
              <i className="lp-sweep" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
      <span className="lp-ground" aria-hidden="true" />
    </div>
  );
}
