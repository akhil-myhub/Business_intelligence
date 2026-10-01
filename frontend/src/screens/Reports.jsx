'use client';

import React, { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';
import { BarChart3, Copy, Download, FileSpreadsheet, FileText, LoaderCircle, Megaphone, Package, PencilRuler, PieChart, Presentation, Store, Trash2 } from 'lucide-react';
import { EXPORTERS } from '@/lib/exporters';
import { DATA_LEVELS, FORMATS, REPORT_TYPES, buildSections, reportMeta } from '@/lib/reportBuilder';
import { PERIODS, REGIONS } from '@/lib/filters';
import { fetchJson } from '@/lib/http';
import { logger } from '@/lib/logger';
import { useToast } from '@/providers/ToastProvider';
import { Panel, Select, Tabs } from '@/components/ui';

const TABS = ['Create Report', 'Scheduled Reports', 'Shared Reports'];
const TYPE_ICONS = [BarChart3, Package, PieChart, Store, Megaphone, PencilRuler];
const FORMAT_ICONS = { PDF: [FileText, '#ff3b4e'], Excel: [FileSpreadsheet, '#1f9d5c'], PPT: [Presentation, '#2f6bff'], CSV: [FileText, '#5d6f96'] };
const FREQUENCIES = ['Daily', 'Weekly', 'Monthly'];

/* localStorage-backed lists (scheduled reports + history) exposed as an external store */
function useStoredList(key) {
  const subscribe = useCallback(cb => { window.addEventListener('storage', cb); window.addEventListener(`businessai:${key}`, cb); return () => { window.removeEventListener('storage', cb); window.removeEventListener(`businessai:${key}`, cb); }; }, [key]);
  const raw = useSyncExternalStore(subscribe, () => localStorage.getItem(key) ?? '[]', () => '[]');
  const list = (() => { try { return JSON.parse(raw); } catch { return []; } })();
  const save = useCallback(next => { try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* storage full/unavailable */ } window.dispatchEvent(new Event(`businessai:${key}`)); }, [key]);
  return [list, save];
}

export default function ReportsScreen() {
  const sp = useSearchParams();
  const { toast } = useToast();
  const [tab, setTab] = useState(TABS[0]);
  const [type, setType] = useState(REPORT_TYPES.includes(sp.get('type')) ? sp.get('type') : REPORT_TYPES[0]);
  const [s, setS] = useState({
    region: REGIONS.includes(sp.get('region')) ? sp.get('region') : 'All Regions',
    period: PERIODS.includes(sp.get('period')) ? sp.get('period') : 'Last Quarter',
    level: 'State', format: 'PDF', product: 'All Products'
  });
  const [busy, setBusy] = useState(false);
  const [schedules, saveSchedules] = useStoredList('businessai.schedules.v1');
  const [history, saveHistory] = useStoredList('businessai.history.v1');
  const [freq, setFreq] = useState(FREQUENCIES[1]);
  const set = k => v => setS(p => ({ ...p, [k]: v }));
  const levelApplies = type === 'Sales Performance';

  const generate = useCallback(async (cfg, reportType) => {
    setBusy(true);
    try {
      const q = new URLSearchParams({ region: cfg.region, period: cfg.period, product: cfg.product ?? 'All Products' });
      const data = await fetchJson(`/api/data/report?${q}`, { retries: 1, timeoutMs: 15_000 });
      const sections = buildSections(reportType, cfg.level, data);
      await EXPORTERS[cfg.format](reportType, reportMeta(reportType, data), sections);
      toast(cfg.format === 'PDF' ? 'Report ready — choose “Save as PDF” in the print dialog.' : `${reportType} report downloaded (${cfg.format}).`, { tone: 'success' });
      return true;
    } catch (err) {
      logger.error('report_failed', { err, format: cfg.format });
      toast('Could not generate the report. Please try again.', { tone: 'error' });
      return false;
    } finally {
      setBusy(false);
    }
  }, [toast]);

  const onGenerate = async () => {
    if (busy) return;
    if (await generate(s, type)) saveHistory([{ id: Date.now(), type, ...s, at: new Date().toISOString() }, ...history].slice(0, 20));
  };

  const link = h => `${location.origin}/reports?${new URLSearchParams({ type: h.type, region: h.region, period: h.period })}`;
  const copy = async h => { try { await navigator.clipboard.writeText(link(h)); toast('Link copied.', { tone: 'success' }); } catch { toast(link(h), { ms: 12000 }); } };

  useEffect(() => { document.title = 'Reports | BusinessAI'; }, []);

  return (
    <div className="page">
      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'Create Report' && (
        <div className="grid-2 reports">
          <Panel title="Report Type">
            <ul className="types">{REPORT_TYPES.map((t, i) => { const I = TYPE_ICONS[i]; return <li key={t}><button className={type === t ? 'on' : ''} onClick={() => setType(t)} aria-pressed={type === t}><span className="ti"><I size={18} /></span>{t}</button></li>; })}</ul>
          </Panel>
          <div className="col">
            <Panel title="Report Settings">
              <div className="form">
                <label><span>Region</span><Select label="Region" value={s.region} onChange={set('region')} options={REGIONS} /></label>
                <label><span>Time Period</span><Select label="Time period" value={s.period} onChange={set('period')} options={PERIODS} /></label>
                <label title={levelApplies ? '' : 'Only applies to the Sales Performance report'}><span>Data Level</span><Select label="Data level" value={levelApplies ? s.level : 'State'} onChange={set('level')} options={levelApplies ? DATA_LEVELS : ['Fixed by report type']} /></label>
                <label><span>Format</span><Select label="Format" value={s.format} onChange={set('format')} options={FORMATS} /></label>
                <button className="btn primary wide lg gen" onClick={onGenerate} disabled={busy}>{busy ? <><LoaderCircle size={20} className="spin" /> Generating…</> : 'Generate Report'}</button>
              </div>
            </Panel>
            <div className="exports">
              {['PDF', 'Excel', 'PPT'].map(f => { const [I, c] = FORMAT_ICONS[f]; return <button key={f} onClick={() => set('format')(f)} className={s.format === f ? 'on' : ''} aria-pressed={s.format === f}><I size={22} color={c} />{f}</button>; })}
            </div>
          </div>
        </div>
      )}

      {tab === 'Scheduled Reports' && (
        <Panel title="Scheduled Reports">
          <p className="note-box">Schedules are saved in this browser. Automatic delivery by email starts once the reporting backend is connected.</p>
          <div className="schedule-form">
            <Select label="Report type" value={type} onChange={setType} options={REPORT_TYPES} />
            <Select label="Frequency" value={freq} onChange={setFreq} options={FREQUENCIES} />
            <Select label="Format" value={s.format} onChange={set('format')} options={FORMATS} />
            <button className="btn primary" onClick={() => { saveSchedules([{ id: Date.now(), type, frequency: freq, ...s }, ...schedules]); toast('Schedule added.', { tone: 'success' }); }}>Add schedule</button>
          </div>
          {schedules.length === 0 ? <p className="empty">No scheduled reports yet.</p> : (
            <ul className="report-list">
              {schedules.map(x => (
                <li key={x.id}><b>{x.type}</b><span>{x.frequency} · {x.region} · {x.period} · {x.format}</span>
                  <button className="icon-btn dark" aria-label="Run now" onClick={() => generate(x, x.type)} disabled={busy}><Download size={16} /></button>
                  <button className="icon-btn dark" aria-label="Delete schedule" onClick={() => saveSchedules(schedules.filter(y => y.id !== x.id))}><Trash2 size={16} /></button></li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      {tab === 'Shared Reports' && (
        <Panel title="Shared Reports" action={history.length ? <button className="btn ghost sm" onClick={() => saveHistory([])}>Clear history</button> : null}>
          <p className="note-box">Reports you generate appear here. Share a link and anyone signed in opens the builder with the same settings.</p>
          {history.length === 0 ? <p className="empty">Nothing generated yet.</p> : (
            <ul className="report-list">
              {history.map(h => (
                <li key={h.id}><b>{h.type}</b><span>{h.region} · {h.period} · {h.format} · {new Date(h.at).toLocaleString('en-IN')}</span>
                  <button className="icon-btn dark" aria-label="Download again" onClick={() => generate(h, h.type)} disabled={busy}><Download size={16} /></button>
                  <button className="icon-btn dark" aria-label="Copy link" onClick={() => copy(h)}><Copy size={16} /></button></li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </div>
  );
}
