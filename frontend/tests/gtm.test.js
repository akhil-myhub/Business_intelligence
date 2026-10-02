import { describe, expect, it } from 'vitest';
import { gtmHeadScript, gtmNoscriptSrc } from '@/config/gtm';

describe('Google Tag Manager snippets', () => {
  it('head script is the official loader for the given container', () => {
    const s = gtmHeadScript('GTM-T7GVH8SR');
    expect(s).toContain("'gtm.start'");
    expect(s).toContain("https://www.googletagmanager.com/gtm.js?id='+i+dl");
    expect(s).toContain("'script','dataLayer','GTM-T7GVH8SR')");
  });
  it('noscript iframe points at the same container', () => {
    expect(gtmNoscriptSrc('GTM-T7GVH8SR')).toBe('https://www.googletagmanager.com/ns.html?id=GTM-T7GVH8SR');
  });
});
