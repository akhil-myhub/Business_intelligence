'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Activity, ArrowRight, Barcode, ChartColumnIncreasing, Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole, Mail, MapPinned, ShieldCheck, Sparkles } from 'lucide-react';
import { AavtorLogo } from '@/components/AavtorLogo';
import { logger } from '@/lib/logger';

const Orb = dynamic(() => import('@/three/Orb'), { ssr: false });

const MESSAGES = {
  INVALID_CREDENTIALS: 'Incorrect email or password.',
  RATE_LIMITED: 'Too many attempts. Please wait a minute and try again.',
  AUTH_NOT_CONFIGURED: 'Sign-in is not configured on this server. Contact your administrator.',
  INVALID_EMAIL: 'Enter a valid email address.',
  INVALID_PASSWORD: 'Enter your password.'
};

const FEATURES = [
  [MapPinned, 'Nationwide sales visibility', 'Drill from India to state, city and store — live.'],
  [Barcode, 'Batch-level traceability', 'Follow any batch from plant to shelf in seconds.'],
  [ChartColumnIncreasing, 'Demand-led planning', 'Forecast demand and plan capacity with confidence.']
];
const SCENES = [
  { q: 'Show sales performance in South India last quarter', tiles: [['₹892 Cr', 'Total revenue', '▲ 14.2%'], ['8.4 M', 'Units sold', '▲ 11.6%'], ['12.8%', 'Market share', '▲ 2.4%'], ['3.6%', 'Conversion', '▲ 1.9%']] },
  { q: 'Which cities had the strongest sales growth?', tiles: [['+42%', 'Chennai', '▲ #1'], ['+34%', 'Pune', '▲ #2'], ['+28%', 'Bengaluru', '▲ #3'], ['+18%', 'Hyderabad', '▲ #4']] },
  { q: 'Where has Batch B-2291 been dispatched?', tiles: [['1', 'Plant', '● Traced'], ['2', 'Depots', '● Traced'], ['4', 'Distributors', '● Traced'], ['38', 'Outlets', '● Traced']] }
];
const TRUST = [[ShieldCheck, 'Encrypted sessions'], [LockKeyhole, 'Brute-force protection'], [Activity, 'Audit-ready logs']];

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.4-.2-2H12v3.9h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-7.9z" /><path fill="#34A853" d="M12 23c3 0 5.4-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1-3.7 1-2.8 0-5.2-1.9-6-4.5H2.4v2.8A11 11 0 0 0 12 23z" /><path fill="#FBBC05" d="M6 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.4a11 11 0 0 0 0 9.8z" /><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.1 1.6l3.1-3.1A11 11 0 0 0 2.4 7.1L6 9.9c.8-2.6 3.2-4.5 6-4.5z" /></svg>
);
const MicrosoftIcon = () => (
  <svg viewBox="0 0 22 22" width="16" height="16" aria-hidden><rect width="10" height="10" fill="#f25022" /><rect x="12" width="10" height="10" fill="#7fba00" /><rect y="12" width="10" height="10" fill="#00a4ef" /><rect x="12" y="12" width="10" height="10" fill="#ffb900" /></svg>
);

export default function LoginScreen({ next = '/ask', hint }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [scene, setScene] = useState(0);

  // the sample insight cycles through a few questions so the panel is never static
  useEffect(() => {
    const id = setInterval(() => setScene(n => (n + 1) % SCENES.length), 7500);
    return () => clearInterval(id);
  }, []);

  const submit = async e => {
    e.preventDefault();
    if (busy) return;
    setError(''); setInfo('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError(MESSAGES.INVALID_EMAIL);
    if (!password) return setError(MESSAGES.INVALID_PASSWORD);
    setBusy(true);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password, remember }) });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(MESSAGES[body?.error?.code] ?? 'Could not sign you in. Please try again.');
        setBusy(false);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch (err) {
      logger.warn('login_network_error', { err });
      setError('Could not reach the server. Check your connection and try again.');
      setBusy(false);
    }
  };

  const notAvailable = what => { setError(''); setInfo(`${what} isn't enabled for this workspace yet — ask your administrator.`); };

  return (
    <div className="login">
      <aside className="login-aside" aria-label="About BusinessAI">
        <div className="la-brand"><AavtorLogo size={40} /><span>BusinessAI</span><small>by Aavtor</small></div>

        <div className="la-body">
          <span className="la-pill"><i />AI BUSINESS INTELLIGENCE FOR FMCG</span>
          <h2>Ask your business.<br /><span>Get the answer.</span></h2>
          <p>One workspace for sales visibility, batch traceability and demand planning — from state to store, in real time.</p>

          <ul className="la-feats">
            {FEATURES.map(([Icon, title, desc]) => (
              <li key={title}><span><Icon size={20} /></span><div><b>{title}</b><small>{desc}</small></div></li>
            ))}
          </ul>

          <div className="la-insight" aria-hidden>
            <div className="la-scene" key={scene}>
              <div className="la-q"><Sparkles size={15} /><span className="la-type">{SCENES[scene].q}</span><i className="la-caret" /></div>
              <div className="la-kpis">
                {SCENES[scene].tiles.map(([v, l, d]) => <div key={l}><b>{v}</b><small>{l}</small><em>{d}</em></div>)}
              </div>
              <svg className="la-spark" viewBox="0 0 300 46" preserveAspectRatio="none"><path d="M0 38 C30 34 45 24 75 26 S125 36 150 22 S205 6 235 14 S280 4 300 2" /></svg>
            </div>
            <span className="la-tag">Sample insight</span>
          </div>
        </div>

        <ul className="la-trust">
          {TRUST.map(([Icon, label]) => <li key={label}><Icon size={15} />{label}</li>)}
        </ul>
        <div className="login-orb" aria-hidden><Orb /></div>
      </aside>

      <div className="login-main">
      <main className="login-card" aria-labelledby="login-title">
        <header className="lc-head">
          <AavtorLogo size={64} className="lc-logo" />
          <h1 id="login-title">Welcome back</h1>
          <p>Sign in to your BusinessAI workspace</p>
        </header>

        <form onSubmit={submit} noValidate className="lc-form">
          <div className="lf">
            <label htmlFor="email">Email address</label>
            <div className="lf-box">
              <Mail size={17} aria-hidden />
              <input id="email" type="email" name="email" autoComplete="username" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} autoFocus aria-invalid={error === MESSAGES.INVALID_EMAIL} />
            </div>
          </div>
          <div className="lf">
            <div className="lf-row">
              <label htmlFor="password">Password</label>
              <button type="button" className="link sm" onClick={() => notAvailable('Password reset')}>Forgot password?</button>
            </div>
            <div className="lf-box">
              <LockKeyhole size={17} aria-hidden />
              <input id="password" type={show ? 'text' : 'password'} name="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} aria-invalid={error === MESSAGES.INVALID_PASSWORD} />
              <button type="button" className="lf-eye" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
          </div>

          <label className="lc-check"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /><span>Keep me signed in for 7 days</span></label>

          {error && <p className="form-error" role="alert">{error}</p>}
          {info && <p className="form-info" role="status">{info}</p>}

          <button className="lc-submit" type="submit" disabled={busy}>
            {busy ? <><LoaderCircle size={18} className="spin" /> Signing in…</> : <>Sign in <ArrowRight size={17} /></>}
          </button>
        </form>

        <div className="lc-or"><span>or continue with</span></div>
        <div className="lc-sso">
          <button type="button" onClick={() => notAvailable('Google sign-in')}><GoogleIcon /> Google</button>
          <button type="button" onClick={() => notAvailable('Microsoft sign-in')}><MicrosoftIcon /> Microsoft</button>
          <button type="button" onClick={() => notAvailable('Single sign-on')}><KeyRound size={16} /> SSO</button>
        </div>

        <footer className="lc-foot">
          <span>New to BusinessAI? <button type="button" className="link" onClick={() => notAvailable('Self sign-up')}>Request access</button></span>
          {hint && (
            <span className="lc-demo">Demo: {hint.email} · {hint.password} <button type="button" className="link" onClick={() => { setEmail(hint.email); setPassword(hint.password); setError(''); }}>Use</button></span>
          )}
        </footer>
      </main>
      <p className="login-legal">© {new Date().getFullYear()} Aavtor · Secure sign-in protected by encrypted sessions</p>
      </div>
    </div>
  );
}
