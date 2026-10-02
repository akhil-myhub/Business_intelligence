'use client';

import React, { useState } from 'react';
import { ArrowRight, Building, Building2, CheckCircle2, ChevronDown, LoaderCircle, Mail, MessageSquareMore, Phone, ShieldCheck, UserRound } from 'lucide-react';

const INDUSTRIES = ['FMCG — Food & Beverages', 'FMCG — Personal Care', 'FMCG — Home Care', 'Consumer Durables', 'Pharma & Healthcare', 'Other'];

const EMPTY = { name: '', company: '', email: '', phone: '', industry: '', message: '' };

export default function DemoForm() {
  const [v, setV] = useState(EMPTY);
  const [state, setState] = useState('idle'); // idle | sending | done | error
  const [error, setError] = useState('');
  const set = k => e => setV(p => ({ ...p, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (state === 'sending') return;
    if (!v.name.trim() || !v.company.trim() || !v.email.trim() || !v.phone.trim() || !v.industry) return setError('Please fill in all required fields.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) return setError('Enter a valid business email.');
    if (!/^[+\d][\d\s()-]{6,19}$/.test(v.phone.trim())) return setError('Enter a valid phone number.');
    setError(''); setState('sending');
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
          <button type="button" className="lp-form-again" onClick={() => { setV(EMPTY); setState('idle'); }}>Send another request</button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="lp-form">
          <div className="lp-fields">
            <label className="lp-field"><UserRound size={16} strokeWidth={1} /><input placeholder="Full Name *" autoComplete="name" value={v.name} onChange={set('name')} maxLength={80} /></label>
            <label className="lp-field"><Building2 size={16} strokeWidth={1} /><input placeholder="Company Name *" autoComplete="organization" value={v.company} onChange={set('company')} maxLength={120} /></label>
            <label className="lp-field"><Mail size={16} strokeWidth={1} /><input type="email" placeholder="Business Email *" autoComplete="email" value={v.email} onChange={set('email')} maxLength={254} /></label>
            <label className="lp-field"><Phone size={16} strokeWidth={1} /><input type="tel" placeholder="Phone Number *" autoComplete="tel" value={v.phone} onChange={set('phone')} maxLength={20} /></label>
            <label className="lp-field lp-select"><Building size={16} strokeWidth={1} />
              <select value={v.industry} onChange={set('industry')} className={v.industry ? '' : 'placeholder'} aria-label="Industry">
                <option value="" disabled>Industry *</option>
                {INDUSTRIES.map(o => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown size={14} strokeWidth={1} />
            </label>
            <label className="lp-field lp-area"><MessageSquareMore size={16} strokeWidth={1} /><textarea placeholder="Tell us about your requirement" value={v.message} onChange={set('message')} maxLength={1000} /></label>
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
