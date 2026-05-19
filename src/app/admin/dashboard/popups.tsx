'use client';

import { useState, useMemo } from 'react';
import {
  Plus, Search, Filter, Eye, Pencil, Trash2, Copy,
  CheckCircle, Clock, PauseCircle, FileText, X, BellRing,
  ChevronDown, ChevronUp, Zap, Calendar, Target,
} from 'lucide-react';
import type { AdminPopup, AdminButton, PopupStatus, PopupStyle } from '@/lib/admin-store';
import { uid } from '@/lib/admin-store';

interface Props {
  popups: AdminPopup[];
  onUpdate: (p: AdminPopup[], msg?: string) => void;
  onLog: (action: string, target: string, details?: string) => void;
}

const STYLES: { value: PopupStyle; label: string; dot: string }[] = [
  { value: 'dark',    label: 'Dark',    dot: 'bg-zinc-400' },
  { value: 'info',    label: 'Info',    dot: 'bg-blue-400' },
  { value: 'warning', label: 'Warning', dot: 'bg-amber-400' },
  { value: 'success', label: 'Success', dot: 'bg-green-400' },
  { value: 'error',   label: 'Error',   dot: 'bg-red-400' },
];

const STYLE_PREVIEW: Record<PopupStyle, string> = {
  dark:    'bg-zinc-900 border-zinc-700 text-white',
  info:    'bg-blue-950 border-blue-700 text-blue-50',
  warning: 'bg-amber-950 border-amber-700 text-amber-50',
  success: 'bg-green-950 border-green-700 text-green-50',
  error:   'bg-red-950 border-red-700 text-red-50',
};

const STATUS_META: Record<PopupStatus, { label: string; color: string; icon: React.ElementType }> = {
  active:    { label: 'Active',    color: 'bg-green-900/50 text-green-400',  icon: CheckCircle },
  paused:    { label: 'Paused',    color: 'bg-zinc-800 text-zinc-400',        icon: PauseCircle },
  draft:     { label: 'Draft',     color: 'bg-zinc-800 text-zinc-500',        icon: FileText },
  scheduled: { label: 'Scheduled', color: 'bg-blue-900/50 text-blue-400',    icon: Clock },
};

const PAGES = ['/ (Home)', '/movies', '/series', '/search', '/my-list'];

type FormState = {
  title: string; message: string; style: PopupStyle;
  buttons: AdminButton[];
  delay: number; autoDismiss: boolean; autoDismissSecs: number;
  showOnce: boolean; priority: number; status: PopupStatus;
  isTemplate: boolean;
  targetPages: string[]; customPage: string;
  scheduledAt: string; expiresAt: string;
};

function newForm(): FormState {
  return {
    title: '', message: '', style: 'dark',
    buttons: [{ id: uid(), label: 'Got it', action: 'close', variant: 'primary' }],
    delay: 0, autoDismiss: false, autoDismissSecs: 5,
    showOnce: true, priority: 5, status: 'active',
    isTemplate: false,
    targetPages: [], customPage: '',
    scheduledAt: '', expiresAt: '',
  };
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${on ? 'bg-red-600' : 'bg-zinc-700'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform ${on ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
    </button>
  );
}

export function PopupsSection({ popups, onUpdate, onLog }: Props) {
  const [form, setForm] = useState<FormState>(newForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<AdminPopup | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | PopupStatus | 'template'>('all');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    let list = popups;
    if (search) list = list.filter(p =>
      p.message.toLowerCase().includes(search.toLowerCase()) ||
      (p.title ?? '').toLowerCase().includes(search.toLowerCase())
    );
    if (filterStatus === 'template') list = list.filter(p => p.isTemplate);
    else if (filterStatus !== 'all') list = list.filter(p => p.status === filterStatus && !p.isTemplate);
    else list = list.filter(p => !p.isTemplate);
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [popups, search, filterStatus]);

  const templates = popups.filter(p => p.isTemplate);

  const resetForm = () => { setForm(newForm()); setEditingId(null); setAdvancedOpen(false); };

  const toPopup = (f: FormState, id = uid()): AdminPopup => ({
    id, status: f.status, title: f.title.trim() || undefined,
    message: f.message.trim(), buttons: f.buttons, style: f.style,
    delay: f.delay, autoDismiss: f.autoDismiss ? f.autoDismissSecs : 0,
    targetPages: f.targetPages, showOnce: f.showOnce, priority: f.priority,
    isTemplate: f.isTemplate,
    scheduledAt: f.scheduledAt || undefined, expiresAt: f.expiresAt || undefined,
    impressions: 0, clicks: 0,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  });

  const handleSave = () => {
    if (!form.message.trim()) return;
    const popup = toPopup(form, editingId ?? uid());
    if (editingId) {
      const existing = popups.find(p => p.id === editingId);
      popup.impressions = existing?.impressions ?? 0;
      popup.clicks = existing?.clicks ?? 0;
      popup.createdAt = existing?.createdAt ?? popup.createdAt;
      onUpdate(popups.map(p => p.id === editingId ? popup : p), 'Popup updated');
      onLog('Updated', form.isTemplate ? `Template: ${popup.title || popup.message}` : `Popup: ${popup.title || popup.message}`);
    } else {
      onUpdate([...popups, popup], form.isTemplate ? 'Template saved' : 'Popup published');
      onLog('Created', form.isTemplate ? `Template: ${popup.title || popup.message}` : `Popup: ${popup.title || popup.message}`);
    }
    resetForm(); setShowForm(false);
  };

  const startEdit = (p: AdminPopup) => {
    setForm({
      title: p.title ?? '', message: p.message, style: p.style,
      buttons: p.buttons, delay: p.delay,
      autoDismiss: p.autoDismiss > 0, autoDismissSecs: p.autoDismiss > 0 ? p.autoDismiss : 5,
      showOnce: p.showOnce, priority: p.priority, status: p.status,
      isTemplate: p.isTemplate, targetPages: p.targetPages,
      customPage: '', scheduledAt: p.scheduledAt ?? '', expiresAt: p.expiresAt ?? '',
    });
    setEditingId(p.id); setShowForm(true); setAdvancedOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const duplicate = (p: AdminPopup) => {
    const copy: AdminPopup = { ...p, id: uid(), status: 'draft', title: `${p.title ?? 'Copy'} (copy)`, impressions: 0, clicks: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    onUpdate([...popups, copy], 'Popup duplicated');
    onLog('Duplicated', `Popup: ${p.title || p.message}`);
  };

  const remove = (id: string) => {
    const p = popups.find(x => x.id === id);
    onUpdate(popups.filter(x => x.id !== id), 'Popup deleted');
    onLog('Deleted', `Popup: ${(p?.title || p?.message) ?? id}`);
    if (editingId === id) { resetForm(); setShowForm(false); }
  };

  const toggleStatus = (id: string) => {
    const p = popups.find(x => x.id === id);
    if (!p) return;
    const next = p.status === 'active' ? 'paused' : 'active';
    onUpdate(popups.map(x => x.id === id ? { ...x, status: next, updatedAt: new Date().toISOString() } : x));
    onLog(next === 'active' ? 'Activated' : 'Paused', `Popup: ${p.title || p.message}`);
  };

  const useTemplate = (p: AdminPopup) => {
    setForm({
      title: p.title ?? '', message: p.message, style: p.style,
      buttons: p.buttons.map(b => ({ ...b, id: uid() })),
      delay: p.delay, autoDismiss: p.autoDismiss > 0, autoDismissSecs: p.autoDismiss > 0 ? p.autoDismiss : 5,
      showOnce: p.showOnce, priority: p.priority, status: 'draft',
      isTemplate: false, targetPages: p.targetPages,
      customPage: '', scheduledAt: '', expiresAt: '',
    });
    setEditingId(null); setShowForm(true);
  };

  const updateBtn = (id: string, patch: Partial<AdminButton>) =>
    setForm(prev => ({ ...prev, buttons: prev.buttons.map(b => b.id === id ? { ...b, ...patch } : b) }));
  const addBtn = () => {
    if (form.buttons.length >= 3) return;
    setForm(prev => ({ ...prev, buttons: [...prev.buttons, { id: uid(), label: 'Button', action: 'close', variant: 'secondary' }] }));
  };
  const removeBtn = (id: string) => setForm(prev => ({ ...prev, buttons: prev.buttons.filter(b => b.id !== id) }));

  const togglePage = (page: string) => {
    setForm(prev => ({
      ...prev,
      targetPages: prev.targetPages.includes(page)
        ? prev.targetPages.filter(p => p !== page)
        : [...prev.targetPages, page],
    }));
  };

  const inp = 'w-full px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent';
  const lbl = 'block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-white">Popup Alerts</h2>
          <p className="text-zinc-500 text-xs mt-0.5">
            {popups.filter(p => !p.isTemplate).length} popups · {templates.length} templates
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(v => !v); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors"
        >
          {showForm && !editingId ? <X size={14} /> : <Plus size={14} />}
          {showForm && !editingId ? 'Cancel' : 'New Popup'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-white">
              {editingId ? 'Edit Popup' : 'Create Popup'}
            </h3>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Toggle on={form.isTemplate} onToggle={() => setForm(p => ({ ...p, isTemplate: !p.isTemplate }))} />
                <span className="text-xs text-zinc-400">Save as template</span>
              </label>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Title + Message */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={lbl}>Title <span className="text-zinc-600 normal-case font-normal">(optional)</span></label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Alert title…" className={inp} />
              </div>
              <div>
                <label className={lbl}>Message <span className="text-red-500">*</span></label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={3} placeholder="Enter your popup message…" className={`${inp} resize-none`} />
              </div>
            </div>

            {/* Style */}
            <div>
              <label className={lbl}>Style</label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map(s => (
                  <button key={s.value} type="button" onClick={() => setForm(p => ({ ...p, style: s.value }))}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.style === s.value ? 'border-white/30 bg-zinc-700 text-white scale-105' : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white'}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div>
              <label className={lbl}>Buttons</label>
              <div className="space-y-2">
                {form.buttons.map((btn, i) => (
                  <div key={btn.id} className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-zinc-800/70 border border-zinc-700/50">
                    <input value={btn.label} onChange={e => updateBtn(btn.id, { label: e.target.value })} placeholder={`Button ${i + 1} label`}
                      className="col-span-2 sm:col-span-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500 placeholder:text-zinc-600" />
                    <select value={btn.action} onChange={e => updateBtn(btn.id, { action: e.target.value as 'close' | 'link' })}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none">
                      <option value="close">Close popup</option>
                      <option value="link">Open link</option>
                    </select>
                    <select value={btn.variant} onChange={e => updateBtn(btn.id, { variant: e.target.value as AdminButton['variant'] })}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none">
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                      <option value="ghost">Ghost</option>
                    </select>
                    <div className="flex items-center gap-2">
                      {btn.action === 'link' && (
                        <input value={btn.url ?? ''} onChange={e => updateBtn(btn.id, { url: e.target.value })} placeholder="https://…"
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500 placeholder:text-zinc-600" />
                      )}
                      {form.buttons.length > 1 && (
                        <button onClick={() => removeBtn(btn.id)} className="ml-auto p-1 text-zinc-500 hover:text-red-400 transition-colors"><X size={13} /></button>
                      )}
                    </div>
                  </div>
                ))}
                {form.buttons.length < 3 && (
                  <button onClick={addBtn} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors py-1">
                    <Plus size={12} /> Add button ({3 - form.buttons.length} remaining)
                  </button>
                )}
              </div>
            </div>

            {/* Behavior row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
                <div>
                  <p className="text-sm text-zinc-200 font-medium">Show once</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Per browser session</p>
                </div>
                <Toggle on={form.showOnce} onToggle={() => setForm(p => ({ ...p, showOnce: !p.showOnce }))} />
              </div>
              <div className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
                <p className="text-xs font-medium text-zinc-300 mb-2">Delay before showing</p>
                <div className="flex items-center gap-2">
                  <input type="number" min={0} max={60} value={form.delay} onChange={e => setForm(p => ({ ...p, delay: +e.target.value }))}
                    className="w-16 px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm text-center focus:outline-none focus:ring-1 focus:ring-red-500" />
                  <span className="text-xs text-zinc-500">seconds</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-zinc-300">Auto-dismiss</p>
                  <Toggle on={form.autoDismiss} onToggle={() => setForm(p => ({ ...p, autoDismiss: !p.autoDismiss }))} />
                </div>
                {form.autoDismiss && (
                  <div className="flex items-center gap-2">
                    <input type="number" min={1} max={120} value={form.autoDismissSecs} onChange={e => setForm(p => ({ ...p, autoDismissSecs: Math.max(1, +e.target.value) }))}
                      className="w-16 px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm text-center focus:outline-none focus:ring-1 focus:ring-red-500" />
                    <span className="text-xs text-zinc-500">seconds</span>
                  </div>
                )}
              </div>
            </div>

            {/* Advanced toggle */}
            <button type="button" onClick={() => setAdvancedOpen(v => !v)}
              className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors">
              {advancedOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              Advanced options (targeting, scheduling, priority)
            </button>

            {advancedOpen && (
              <div className="space-y-4 pt-1 border-t border-zinc-800">
                {/* Status */}
                <div>
                  <label className={lbl}>Status</label>
                  <div className="flex flex-wrap gap-2">
                    {(['active', 'paused', 'draft', 'scheduled'] as PopupStatus[]).map(s => {
                      const m = STATUS_META[s];
                      const Icon = m.icon;
                      return (
                        <button key={s} type="button" onClick={() => setForm(p => ({ ...p, status: s }))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${form.status === s ? 'border-white/20 bg-zinc-700 text-white' : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white'}`}>
                          <Icon size={11} /> {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className={lbl}>Priority (1–10) <span className="text-zinc-600 normal-case font-normal">— higher shows first</span></label>
                  <input type="range" min={1} max={10} value={form.priority} onChange={e => setForm(p => ({ ...p, priority: +e.target.value }))}
                    className="w-full accent-red-600" />
                  <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                    <span>Low (1)</span><span className="font-medium text-zinc-400">Current: {form.priority}</span><span>High (10)</span>
                  </div>
                </div>

                {/* Target pages */}
                <div>
                  <label className={lbl}><Target size={10} className="inline mr-1.5" />Target Pages <span className="text-zinc-600 normal-case font-normal">(empty = all pages)</span></label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {PAGES.map(p => (
                      <button key={p} type="button" onClick={() => togglePage(p)}
                        className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${form.targetPages.includes(p) ? 'bg-zinc-700 border-zinc-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-white'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={form.customPage} onChange={e => setForm(p => ({ ...p, customPage: e.target.value }))} placeholder="Custom path, e.g. /movie/123"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500" />
                    <button type="button" onClick={() => { if (form.customPage) { togglePage(form.customPage); setForm(p => ({ ...p, customPage: '' })); } }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white text-xs transition-colors">
                      Add
                    </button>
                  </div>
                  {form.targetPages.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {form.targetPages.map(p => (
                        <span key={p} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-700 text-xs text-white">
                          {p} <button onClick={() => togglePage(p)} className="text-zinc-400 hover:text-white"><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Schedule */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}><Calendar size={10} className="inline mr-1.5" />Schedule (publish at)</label>
                    <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value, status: e.target.value ? 'scheduled' : p.status }))}
                      className={`${inp} [color-scheme:dark]`} />
                  </div>
                  <div>
                    <label className={lbl}>Expires at</label>
                    <input type="datetime-local" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                      className={`${inp} [color-scheme:dark]`} />
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-zinc-800">
              <button onClick={handleSave} disabled={!form.message.trim()}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-sm font-semibold text-white transition-colors">
                {editingId ? 'Update' : form.isTemplate ? 'Save Template' : 'Publish Popup'}
              </button>
              <button onClick={() => setPreview({
                id: 'preview', status: 'active',
                title: form.title.trim() || undefined, message: form.message,
                buttons: form.buttons, style: form.style,
                delay: 0, autoDismiss: form.autoDismiss ? form.autoDismissSecs : 0,
                targetPages: [], showOnce: false, priority: 5, isTemplate: false,
                impressions: 0, clicks: 0, createdAt: '', updatedAt: '',
              })} disabled={!form.message.trim()}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-sm text-white transition-colors border border-zinc-700">
                <Eye size={14} />
              </button>
              {editingId && (
                <button onClick={() => { resetForm(); setShowForm(false); }}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-400 hover:text-white transition-colors border border-zinc-700">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Templates */}
      {templates.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={14} className="text-zinc-400" />
            <h3 className="text-sm font-semibold text-white">Templates ({templates.length})</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {templates.map(t => (
              <button key={t.id} onClick={() => useTemplate(t)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-xs text-zinc-300 hover:text-white transition-all">
                <Zap size={11} className="text-amber-400" />
                {t.title || t.message.slice(0, 30)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      <div>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search popups…"
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <div className="relative">
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
              className="pl-8 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none appearance-none cursor-pointer">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="template">Templates</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl">
            <BellRing size={28} className="mx-auto text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-sm">No popups found</p>
            <button onClick={() => { resetForm(); setShowForm(true); }}
              className="mt-3 text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mx-auto">
              <Plus size={12} /> Create your first popup
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(p => {
              const sm = STATUS_META[p.status] ?? STATUS_META['draft'];
              const StatusIcon = sm.icon;
              return (
                <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors">
                  {/* Color strip */}
                  <div className={`h-0.5 ${(STYLE_PREVIEW[p.style] ?? STYLE_PREVIEW['dark']).split(' ')[0]}`} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${sm.color}`}>
                            <StatusIcon size={9} /> {sm.label}
                          </span>
                          {p.isTemplate && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-400 font-semibold">Template</span>
                          )}
                          <span className="text-[10px] text-zinc-600 capitalize">{p.style}</span>
                          {p.delay > 0 && <span className="text-[10px] text-zinc-600">{p.delay}s delay</span>}
                          {p.priority > 7 && <span className="text-[10px] text-zinc-600">P{p.priority}</span>}
                        </div>
                        {p.title && <p className="text-sm font-semibold text-white leading-snug">{p.title}</p>}
                        <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed mt-0.5">{p.message}</p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-600">
                          <span>{p.impressions.toLocaleString()} impressions</span>
                          <span>{p.clicks.toLocaleString()} clicks</span>
                          {p.impressions > 0 && <span>{((p.clicks / p.impressions) * 100).toFixed(1)}% CTR</span>}
                          <span>{p.buttons.length} btn{p.buttons.length !== 1 ? 's' : ''}</span>
                          {p.targetPages.length > 0 && <span>{p.targetPages.length} target page{p.targetPages.length !== 1 ? 's' : ''}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-zinc-800">
                      {!p.isTemplate && (
                        <button onClick={() => toggleStatus(p.id)}
                          className={`flex-1 py-1.5 rounded-lg text-xs transition-colors ${p.status === 'active' ? 'text-amber-400 hover:bg-amber-950/30' : 'text-green-400 hover:bg-green-950/30'} hover:bg-zinc-800`}>
                          {p.status === 'active' ? 'Pause' : 'Activate'}
                        </button>
                      )}
                      <button onClick={() => startEdit(p)} className="flex-1 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1">
                        <Pencil size={11} /> Edit
                      </button>
                      <button onClick={() => setPreview(p)} className="flex-1 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1">
                        <Eye size={11} /> Preview
                      </button>
                      <button onClick={() => duplicate(p)} className="flex-1 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1">
                        <Copy size={11} /> Copy
                      </button>
                      <button onClick={() => remove(p.id)} className="flex-1 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1">
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setPreview(null)}>
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl p-6 ${STYLE_PREVIEW[preview.style]}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              {preview.title && <h3 className="font-bold text-base">{preview.title}</h3>}
              <span className="text-[10px] opacity-30 ml-auto">PREVIEW</span>
            </div>
            <p className="text-sm opacity-90 leading-relaxed mb-5">{preview.message}</p>
            <div className="flex flex-wrap gap-2">
              {preview.buttons.map(btn => (
                <button key={btn.id} onClick={() => setPreview(null)}
                  className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                    btn.variant === 'primary' ? 'bg-white text-zinc-900 font-semibold hover:bg-zinc-100' :
                    btn.variant === 'secondary' ? 'bg-zinc-700 text-white hover:bg-zinc-600' :
                    'border border-zinc-600 text-current hover:bg-white/10'
                  }`}>
                  {btn.label}
                </button>
              ))}
            </div>
            {preview.autoDismiss > 0 && <p className="text-xs opacity-30 mt-4">Auto-closes in {preview.autoDismiss}s</p>}
            {preview.delay > 0 && <p className="text-xs opacity-30 mt-1">Appears after {preview.delay}s delay</p>}
          </div>
        </div>
      )}
    </div>
  );
}
