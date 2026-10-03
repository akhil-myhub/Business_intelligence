import React from 'react';

/**
 * Full-page photo backdrop. Pure CSS (.bg in styles.css): the photo is a background layer over a tiny inline preview of
 * itself, so the right picture shows instantly and the sharp one replaces it as soon as it arrives — no JavaScript needed.
 */
export default function Backdrop() {
  return <div className="bg" aria-hidden="true" />;
}
