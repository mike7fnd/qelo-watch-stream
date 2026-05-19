'use client';

import { useState } from 'react';
import { Wrench, AlertTriangle, Radio, ToggleRight, Download, Upload, Trash2 } from 'lucide-react';
import type { AdminSettings } from '@/lib/admin-store';
import { exportData, importData } from '@/lib/admin-store';

interface Props {
  settings: AdminSettings;
  onUpdate: (s: AdminSettings, msg?: string) => void;
  onLog: (action: string, target: string) => void;
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${on ? 'bg-red-600' : 'bg-zinc-700'}`}>
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform ${on ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
    </button>
  );
}

function SectionCard({ title, icon: Icon, description, children }: { title: string; icon: React.ElementType; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800 flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-zinc-800 mt-0.5">
          <Icon size={15} className="text-zinc-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function SiteControlsSection({ settings, onUpdate, onLog }: Props) {
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [clearConfirm, setClearConfirm] = useState(false);

  const inp = 'w-full px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500';
  const lbl = 'block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5';

  const update = (patch: Partial<AdminSettings>) => {
    onUpdate({ ...settings, ...patch });
  };

  const handleExport = () => {
    exportData();
    onLog('Exported', 'Admin data');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(''); setImportSuccess('');
    try {
      const msg = await importData(file);
      setImportSuccess(msg);
      onLog('Imported', 'Admin data');
      setTimeout(() => setImportSuccess(''), 3000);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed');
    }
    e.target.value = '';
  };

  const clearAll = () => {
    ['qelo-admin-popups', 'qelo-admin-notifications', 'qelo-admin-banners', 'qelo-admin-settings', 'qelo-admin-activity'].forEach(k => localStorage.removeItem(k));
    window.dispatchEvent(new CustomEvent('qelo-admin-update'));
    onLog('Cleared', 'All admin data');
    setClearConfirm(false);
    window.location.reload();
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-white">Site Controls</h2>
        <p className="text-zinc-500 text-xs mt-0.5">Manage global site behavior and system settings.</p>
      </div>

      {/* Maintenance */}
      <SectionCard title="Maintenance Mode" icon={Wrench} description="Show a maintenance page to all visitors">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-200 font-medium">Enable Maintenance Mode</p>
              <p className="text-xs text-zinc-500 mt-0.5">All visitors will see the maintenance page</p>
            </div>
            <Toggle
              on={settings.maintenance.enabled}
              onToggle={() => {
                update({ maintenance: { ...settings.maintenance, enabled: !settings.maintenance.enabled } });
                onLog(settings.maintenance.enabled ? 'Disabled' : 'Enabled', 'Maintenance mode');
              }}
            />
          </div>
          {settings.maintenance.enabled && (
            <div className="space-y-3 pt-3 border-t border-zinc-800">
              <div>
                <label className={lbl}>Page Title</label>
                <input value={settings.maintenance.title}
                  onChange={e => update({ maintenance: { ...settings.maintenance, title: e.target.value } })}
                  placeholder="Under Maintenance" className={inp} />
              </div>
              <div>
                <label className={lbl}>Message</label>
                <textarea value={settings.maintenance.message} rows={2}
                  onChange={e => update({ maintenance: { ...settings.maintenance, message: e.target.value } })}
                  placeholder="We'll be back soon…" className={`${inp} resize-none`} />
              </div>
              <div>
                <label className={lbl}>Estimated Return <span className="text-zinc-600 normal-case font-normal">(optional)</span></label>
                <input value={settings.maintenance.estimatedReturn}
                  onChange={e => update({ maintenance: { ...settings.maintenance, estimatedReturn: e.target.value } })}
                  placeholder="e.g. December 25, 2025 at 3:00 PM" className={inp} />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-950/30 border border-amber-800/50">
                <Wrench size={13} className="text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-300">Maintenance mode is active — visitors cannot access the site.</p>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Emergency Broadcast */}
      <SectionCard title="Emergency Broadcast" icon={Radio} description="Show an urgent site-wide message to all visitors">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-200 font-medium">Enable Broadcast</p>
              <p className="text-xs text-zinc-500 mt-0.5">Shown as a persistent top banner</p>
            </div>
            <Toggle
              on={settings.emergency.enabled}
              onToggle={() => {
                update({ emergency: { ...settings.emergency, enabled: !settings.emergency.enabled } });
                onLog(settings.emergency.enabled ? 'Disabled' : 'Enabled', 'Emergency broadcast');
              }}
            />
          </div>
          <div>
            <label className={lbl}>Message</label>
            <input value={settings.emergency.message}
              onChange={e => update({ emergency: { ...settings.emergency, message: e.target.value } })}
              placeholder="Emergency announcement…" className={inp} />
          </div>
          <div>
            <label className={lbl}>Severity</label>
            <div className="flex gap-2">
              {([
                { v: 'warning' as const, label: 'Warning', cls: 'text-amber-400 border-amber-700/50 bg-amber-950/30' },
                { v: 'error' as const,   label: 'Critical', cls: 'text-red-400 border-red-700/50 bg-red-950/30' },
              ]).map(opt => (
                <button key={opt.v} type="button"
                  onClick={() => update({ emergency: { ...settings.emergency, style: opt.v } })}
                  className={`flex-1 py-2 rounded-xl text-sm border transition-all font-medium ${settings.emergency.style === opt.v ? opt.cls : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {settings.emergency.enabled && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/30 border border-red-800/50">
              <AlertTriangle size={13} className="text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-300">Emergency broadcast is live — all visitors will see this message.</p>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Feature Flags */}
      <SectionCard title="Feature Flags" icon={ToggleRight} description="Enable or disable individual site features">
        <div className="space-y-3">
          {([
            { key: 'search' as const, label: 'Search', desc: 'Site-wide search functionality' },
            { key: 'myList' as const, label: 'My List', desc: 'User watchlist / saved movies' },
            { key: 'trailers' as const, label: 'Trailers', desc: 'Trailer modal player' },
            { key: 'recommendations' as const, label: 'Recommendations', desc: 'Movie & show recommendations' },
          ]).map((f, i, arr) => (
            <div key={f.key}>
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm text-zinc-200">{f.label}</p>
                  <p className="text-xs text-zinc-500">{f.desc}</p>
                </div>
                <Toggle
                  on={settings.features[f.key]}
                  onToggle={() => {
                    const next = !settings.features[f.key];
                    update({ features: { ...settings.features, [f.key]: next } });
                    onLog(next ? 'Enabled' : 'Disabled', `Feature: ${f.label}`);
                  }}
                />
              </div>
              {i < arr.length - 1 && <div className="border-t border-zinc-800 mt-2" />}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Data Management */}
      <SectionCard title="Data Management" icon={Download} description="Export, import, or reset all admin data">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleExport}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm text-white transition-colors">
              <Download size={14} /> Export Data
            </button>
            <label className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm text-white transition-colors cursor-pointer">
              <Upload size={14} /> Import Data
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
          {importSuccess && (
            <p className="text-xs text-green-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> {importSuccess}
            </p>
          )}
          {importError && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> {importError}
            </p>
          )}

          <div className="border-t border-zinc-800 pt-3">
            {!clearConfirm ? (
              <button onClick={() => setClearConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900 hover:bg-red-950/30 border border-zinc-800 hover:border-red-800/50 text-sm text-zinc-500 hover:text-red-400 transition-all">
                <Trash2 size={14} /> Reset All Admin Data
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-red-400 text-center">This will permanently delete all popups, notifications, banners, and settings.</p>
                <div className="flex gap-2">
                  <button onClick={clearAll} className="flex-1 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-sm font-semibold text-white transition-colors">Confirm Reset</button>
                  <button onClick={() => setClearConfirm(false)} className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm text-white transition-colors">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
