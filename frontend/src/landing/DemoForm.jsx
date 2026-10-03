'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Building, Building2, Check, CheckCircle2, ChevronDown, LoaderCircle, Mail, MessageSquareMore, Phone, ShieldCheck, UserRound } from 'lucide-react';

const INDUSTRIES = ['FMCG — Food & Beverages', 'FMCG — Personal Care', 'FMCG — Home Care', 'Consumer Durables', 'Pharma & Healthcare', 'Other'];

const EMPTY = { name: '', company: '', email: '', phone: '', industry: '', message: '' };

// Styled dropdown in place of the native <select>, whose OS popup ignored the card's width, font and padding.
function IndustrySelect({ value, onChange, invalid }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const pick = o => { onChange(o); setOpen(false); };
  const openList = () => { setActive(Math.max(0, INDUSTRIES.indexOf(value))); setOpen(true); };
  const onKey = e => {
    if (e.key === 'Escape') return setOpen(false);
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); openList(); }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => (i + 1) % INDUSTRIES.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => (i - 1 + INDUSTRIES.length) % INDUSTRIES.length); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(INDUSTRIES[active]); }
    else if (e.key === 'Tab') setOpen(false);
  };

  return (
    <div className={`lp-field lp-select${open ? ' open' : ''}${value ? ' filled' : ''}${invalid ? ' invalid' : ''}`} ref={ref}>
      <Building size={16} strokeWidth={1.4} />
      <button type="button" className={`lp-select-btn${value ? '' : ' placeholder'}`} aria-haspopup="listbox" aria-expanded={open} aria-label="Industry"
        onClick={() => (open ? setOpen(false) : openList())} onKeyDown={onKey}>
        {value || 'Industry *'}
      </button>
      <ChevronDown size={14} strokeWidth={1.6} className="lp-select-caret" />
      {open && (
        <ul className="lp-select-list" role="listbox" aria-label="Industry">
          {INDUSTRIES.map((o, i) => (
            <li key={o} role="option" aria-selected={o === value} className={`${i === active ? 'active' : ''}${o === value ? ' selected' : ''}`}
              onMouseEnter={() => setActive(i)} onMouseDown={e => e.preventDefault()} onClick={() => pick(o)}>
              <span>{o}</span>{o === value && <Check size={14} strokeWidth={2} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DemoForm() {
  const [v, setV] = useState(EMPTY);
  const [state, setState] = useState('idle'); // idle | sending | done | error
  const [error, setError] = useState('');
  const [bad, setBad] = useState({}); // fields that failed validation, outlined red until edited
  const setVal = (k, val) => { setV(p => ({ ...p, [k]: val })); setBad(p => (p[k] ? { ...p, [k]: false } : p)); };
  const set = k => e => setVal(k, e.target.value);

  const submit = async e => {
    e.preventDefault();
    if (state === 'sending') return;
    const missing = { name: !v.name.trim(), company: !v.company.trim(), email: !v.email.trim(), phone: !v.phone.trim(), industry: !v.industry };
    if (Object.values(missing).some(Boolean)) { setBad(missing); return setError('Please fill in all required fields.'); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) { setBad({ email: true }); return setError('Enter a valid business email.'); }
    if (!/^[+\d][\d\s()-]{6,19}$/.test(v.phone.trim())) { setBad({ phone: true }); return setError('Enter a valid phone number.'); }
    setError(''); setBad({}); setState('sending');
    try {
      const res = await fetch('/api/demo-request', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(v) });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message || 'Could not send your request.');
      }
      setState('done');
    } catch (err) {
      setError(err.message || 'Could not send your request. Please try again.');
      setState('idle');
    }
  };

  return (
    <div className="lp-form-card">
      <div className="lp-form-head">
        <p className="lp-form-eyebrow">BOOK A LIVE DEMO</p>
        <h3>See the platform<br /><span>in action.</span></h3>
      </div>
      <p className="lp-form-sub">Tell us a few details and our team will show you how it can work for your business.</p>

      {state === 'done' ? (
        <div className="lp-form-done" role="status">
          <CheckCircle2 size={36} />
          <b>Thank you, {v.name.split(' ')[0]}!</b>
          <span>Our team will contact you at {v.email} within one business day to schedule your demo.</span>
          <button type="button" className="lp-form-again" onClick={() => { setV(EMPTY); setBad({}); setState('idle'); }}>Send another request</button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="lp-form">
          <div className="lp-fields">
            <label className={`lp-field${v.name ? ' filled' : ''}${bad.name ? ' invalid' : ''}`}><UserRound size={16} strokeWidth={1.4} /><input placeholder="Full Name *" autoComplete="name" value={v.name} onChange={set('name')} maxLength={80} /></label>
            <label className={`lp-field${v.company ? ' filled' : ''}${bad.company ? ' invalid' : ''}`}><Building2 size={16} strokeWidth={1.4} /><input placeholder="Company Name *" autoComplete="organization" value={v.company} onChange={set('company')} maxLength={120} /></label>
            <label className={`lp-field${v.email ? ' filled' : ''}${bad.email ? ' invalid' : ''}`}><Mail size={16} strokeWidth={1.4} /><input type="email" placeholder="Business Email *" autoComplete="email" value={v.email} onChange={set('email')} maxLength={254} /></label>
            <label className={`lp-field${v.phone ? ' filled' : ''}${bad.phone ? ' invalid' : ''}`}><Phone size={16} strokeWidth={1.4} /><input type="tel" placeholder="Phone Number *" autoComplete="tel" value={v.phone} onChange={set('phone')} maxLength={20} /></label>
            <IndustrySelect value={v.industry} onChange={o => setVal('industry', o)} invalid={bad.industry} />
            <label className={`lp-field lp-area${v.message ? ' filled' : ''}`}><MessageSquareMore size={16} strokeWidth={1.4} /><textarea placeholder="Tell us about your requirement" value={v.message} onChange={set('message')} maxLength={1000} /></label>
          </div>
          {error && <p className="lp-form-error" role="alert">{error}</p>}
          <button type="submit" className="lp-form-btn" disabled={state === 'sending'}>
            {state === 'sending' ? <><LoaderCircle size={16} className="spin" /> Sending…</> : <>Book a Live Demo <ArrowRight size={16} strokeWidth={1.6} /></>}
          </button>
        </form>
      )}

      <div className="lp-privacy"><ShieldCheck size={18} strokeWidth={1} /><span>Your information is safe and will only be used to schedule the demo.</span></div>
    </div>
  );
}
