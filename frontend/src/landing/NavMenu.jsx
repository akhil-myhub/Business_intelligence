'use client';

import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

// Mobile/tablet navigation: a hamburger that opens a full-width panel. Hidden on desktop (see responsive.css).
export default function NavMenu({ groups }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="lp-burger">
      <button type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="lp-mobile-menu" onClick={() => setOpen(o => !o)}>
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      {open && (
        <nav id="lp-mobile-menu" className="lp-mpanel" aria-label="Mobile">
          {groups.map(g => (
            <div key={g.label}>
              {g.links.length > 1 || g.heading ? <p>{g.label}</p> : null}
              {g.links.map(([label, href]) => <a key={href + label} href={href} onClick={() => setOpen(false)}>{label}</a>)}
            </div>
          ))}
          <a href="#demo" className="lp-btn lp-mcta" onClick={() => setOpen(false)}>Book a Live Demo</a>
        </nav>
      )}
    </div>
  );
}
