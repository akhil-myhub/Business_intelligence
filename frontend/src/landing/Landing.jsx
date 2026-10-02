import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronDown, UsersRound } from 'lucide-react';
import DemoForm from './DemoForm';
import { Platform, Ask, Visibility } from './sections/Part1';
import { Traceability, Insights, Forecast } from './sections/Part2';
import { Foundation, Overview, Implementation } from './sections/Part3';
import './landing.css';
import './sections.css';

// Pixel-faithful build of the "BI landing page" Figma frame (1440 px wide). Text, buttons, cards and the form
// are live HTML using the Figma values; illustrations and the full-width product sections are the frame's own
// raster artwork (public/landing). The canvas is scaled to the viewport so every screen sees the Figma layout.

// Sets --lp-zoom before first paint (and on resize) so the 1440 px canvas fits the window width.
const FIT = `(function(){function f(){var w=document.documentElement.clientWidth;document.documentElement.style.setProperty('--lp-zoom',Math.min(1,w/1440))}f();addEventListener('resize',f)})();`;

const NAV = [
  { label: 'Product', menu: [['Platform overview', '#platform'], ['Ask your business', '#ask'], ['Sales visibility', '#visibility']] },
  { label: 'Solutions', menu: [['Batch traceability', '#traceability'], ['Business insights', '#insights'], ['Demand & capacity planning', '#forecast']] },
  { label: 'Customers', href: '#trust' },
  { label: 'Resources', menu: [['How the platform works', '#foundation'], ['Implementation', '#implementation']] },
  { label: 'Pricing', href: '#demo' }
];

const BENEFITS = [
  ['Every market visible', 'See sales from state to city to distributor to store.'],
  ['Every batch traceable', 'Track batch movement from plant to outlet with confidence.'],
  ['Every decision informed', 'Turn connected data into insights leaders can act on.'],
  ['Ask in natural language', 'Get answers from the business without digging through reports.']
];

const TRUST = [
  ['FMCG focused', 'Built for real-world scale', 46, 40],
  ['Enterprise grade', 'Secure and reliable', 40, 43],
  ['Fast to deploy', 'From weeks to value', 36, 37],
  ['Proven impact', 'Trusted by market leaders', 44, 43]
];

const GAPS = [
  ['Delayed visibility', 'By the time reports reach decision-makers, the business may have already moved.'],
  ['Fragmented data', 'Critical information lives across systems, spreadsheets, teams and applications.'],
  ['Broad recalls', 'Teams spend time collecting and reconciling data instead of acting on it.'],
  ['Demand guesswork', 'Forecasting and resource decisions become harder without a connected view of performance.']
];

const PROMISE = ['Unified\nData View', 'AI-Powered\nInsights', 'Faster\nDecisions', 'Real\nBusiness Impact'];

function Nav() {
  return (
    <header className="lp-nav">
      <div className="lp-nav-row">
        <Link href="/" aria-label="Aavtor.ai home" className="lp-logo">
          <Image src="/landing/aavtor-wordmark.png" alt="Aavtor.ai" width={124} height={28} priority />
        </Link>
        <nav className="lp-links" aria-label="Main">
          {NAV.map(item => item.menu ? (
            <div key={item.label} className="lp-drop">
              <button type="button" aria-haspopup="true">{item.label}<ChevronDown size={16} strokeWidth={1.8} /></button>
              <div className="lp-menu" role="menu">
                {item.menu.map(([label, href]) => <a key={href} role="menuitem" href={href}>{label}</a>)}
              </div>
            </div>
          ) : <a key={item.label} href={item.href}>{item.label}</a>)}
        </nav>
        <a href="#demo" className="lp-btn lp-btn-nav">Book a Live Demo</a>
      </div>
    </header>
  );
}

export default function Landing() {
  return (
    <div className="lp-root">
      <script dangerouslySetInnerHTML={{ __html: FIT }} />
      <div className="lp-canvas">
        <Nav />

        {/* 01 — hero */}
        <section className="lp-hero">
          <div className="lp-hero-fade" />
          <div className="lp-hero-content">
            <h1>See your entire business.<br /><span>From data to decisions.</span></h1>
            <p>Connect your sales, operations, products, customers, supply and business data in one AI-powered intelligence platform. Ask your business anything, understand what&apos;s changing, and turn complex data into clear, actionable decisions.</p>
            <div className="lp-hero-ctas">
              <a href="#demo" className="lp-btn lp-btn-hero">Book a Live Demo <ArrowRight size={18} strokeWidth={1.6} /></a>
              <Link href="/login" className="lp-link">See the Platform <ArrowRight size={18} strokeWidth={1.6} /></Link>
            </div>
            <div className="lp-audience">
              <span className="lp-audience-ico"><UsersRound size={25} strokeWidth={1.6} /></span>
              <span>Built for FMCG owners, CXOs, sales, supply chain and quality teams.</span>
            </div>
          </div>
          <Image className="lp-hero-art" src="/landing/hero-wireframe.webp" alt="The ten screens of the BusinessAI workspace" width={675} height={453} priority />
        </section>

        {/* 02 — benefits + trust */}
        <section className="lp-benefits">
          <div className="lp-head">
            <p className="lp-eyebrow">WHY LEADING FMCG TEAMS CHOOSE Aavtor ERP</p>
            <h2>From complete visibility to confident decisions<span>.</span></h2>
            <p className="lp-sub">One AI-powered platform. Real business impact across your FMCG value chain.</p>
          </div>
          <div className="lp-cards">
            {BENEFITS.map(([title, desc], i) => (
              <article key={title} className="lp-card">
                <Image src={`/landing/benefit-${i}.webp`} alt="" width={265} height={199} />
                <div className="lp-card-copy"><h3>{title}</h3><p>{desc}</p></div>
              </article>
            ))}
          </div>
          <div className="lp-trust" id="trust">
            <p className="lp-trust-eyebrow">TRUSTED BY LEADING FMCG TEAMS</p>
            <ul>
              {TRUST.map(([title, desc, w, h], i) => (
                <li key={title}>
                  <span className="lp-trust-ico"><Image src={`/landing/trust-${i}.png`} alt="" width={w} height={h} /></span>
                  <span><b>{title}</b><small>{desc}</small></span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 03 — the business intelligence gap */}
        <section className="lp-gap">
          <div className="lp-gap-head">
            <p>THE BUSINESS INTELLIGENCE GAP</p>
            <h2>Your business generates data everywhere.<br />Your decisions shouldn&apos;t depend on disconnected information.</h2>
            <span>Business data lives across sales, operations, finance, products, customers and multiple systems. But leadership often still depends on delayed reports, spreadsheets and fragmented views to understand what is happening.</span>
          </div>
          <div className="lp-strip lp-bleed" style={{ '--edges': 'url(/landing/supply-chain-edges.png)', '--bleed-top': '-18px' }}><Image src="/landing/supply-chain.webp" alt="Plant, depot, distributor and store — visibility fades along the chain" width={1440} height={183} /></div>
          <div className="lp-gap-cards">
            {GAPS.map(([title, desc], i) => (
              <article key={title} className="lp-gap-card">
                <Image className="lp-gap-art" src={`/landing/gap-${i}.webp`} alt="" width={290} height={166} />
                <div><h3>{title}</h3><p>{desc}</p></div>
              </article>
            ))}
          </div>
        </section>

        {/* 04–12 — product showcase: live, interactive sections */}
        <Platform />
        <Ask />
        <Visibility />
        <Traceability />
        <Insights />
        <Forecast />
        <Foundation />
        <Overview />
        <Implementation />

        {/* 13 — book a live demo */}
        <section className="lp-cta lp-bleed" id="demo" style={{ '--edges': 'url(/landing/cta-backdrop-edges.png)' }}>
          <Image className="lp-cta-bg" src="/landing/cta-backdrop.webp" alt="" width={1440} height={1108} />
          <div className="lp-cta-eyebrow"><span>AI-POWERED FMCG INTELLIGENCE</span><i /></div>
          <h2 className="lp-cta-title">See your <span>business live</span><em>.</em></h2>
          <p className="lp-cta-desc">Experience how AI turns your FMCG data into real decisions,{" "}<br />faster growth and measurable impact.</p>
          {PROMISE.map((label, i) => <span key={label} className="lp-promise" style={{ left: 131 + 189 * i }}>{label}</span>)}
          <DemoForm />
        </section>
      </div>
    </div>
  );
}
