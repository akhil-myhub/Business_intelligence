'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { PERIODS, REGIONS } from '@/lib/filters';
import { logger } from '@/lib/logger';
import { hardNavigate } from '@/lib/navigation';
import { usePrefs } from '@/providers/PrefsProvider';
import { useToast } from '@/providers/ToastProvider';
import { Panel, Select } from '@/components/ui';

function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="toggle-row">
      <span><b>{label}</b><small>{hint}</small></span>
      <input type="checkbox" role="switch" checked={checked} onChange={e => onChange(e.target.checked)} />
      <i aria-hidden />
    </label>
  );
}

export default function SettingsScreen({ user }) {
  const { prefs, update } = usePrefs();
  const { toast } = useToast();
  const signOut = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (err) { logger.warn('logout_failed', { err }); }
    hardNavigate('/login');
  };
  return (
    <div className="page settings">
      <h2 className="page-title">Settings</h2>
      <div className="grid-2">
        <Panel title="Display & data">
          <Toggle label="3D effects" hint="Interactive 3D maps and the animated orb. Turn off for a lighter 2D experience on older devices." checked={prefs.effects3d} onChange={v => update({ effects3d: v })} />
          <Toggle label="Live data feed" hint="Stream live sales, alerts and refresh numbers automatically." checked={prefs.liveFeed} onChange={v => { update({ liveFeed: v }); toast(v ? 'Live feed on.' : 'Live feed off.'); }} />
          <div className="setting-row"><span><b>Default region</b><small>Used when a screen has no region selected</small></span><Select label="Default region" value={prefs.defaultRegion} options={REGIONS} onChange={v => update({ defaultRegion: v })} /></div>
          <div className="setting-row"><span><b>Default period</b><small>Used when a screen has no period selected</small></span><Select label="Default period" value={prefs.defaultPeriod} options={PERIODS} onChange={v => update({ defaultPeriod: v })} /></div>
        </Panel>
        <Panel title="Account">
          <dl className="account">
            <dt>Name</dt><dd>{user.name}</dd>
            <dt>Email</dt><dd>{user.email}</dd>
            <dt>Role</dt><dd>{user.role}</dd>
          </dl>
          <button className="btn ghost" onClick={signOut}><LogOut size={16} /> Sign out</button>
        </Panel>
      </div>
    </div>
  );
}
