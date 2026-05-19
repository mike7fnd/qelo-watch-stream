'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2, Copy, X, Bell, CheckCircle, PauseCircle, FileText } from 'lucide-react';
import type { AdminNotification, NotifType, NotifPosition } from '@/lib/admin-store';
import { uid } from '@/lib/admin-store';

interface Props {
  notifications: AdminNotification[];
  onUpdate: (n: AdminNotification[], msg?: string) => void;
  onLog: (action: string, target: string) => void;
}

const TYPES: { value: NotifType; label: string; color: string; bg: string }[] = [
  { value: 'info',    label: 'Info',    color: 'text-blue-400',   bg: 'bg-blue-950/40 border-blue-800/60' },
  { value: 'success', label: 'Success', color: 'text-green-400',  bg: 'bg-green-950/40 border-green-800/60' },
  { value: 'warning', label: 'Warning', color: 'text-amber-400',  bg: 'bg-amber-950/40 border-amber-800/60' },
  { value: 'error',   label: 'Error',   color: 'text-red-400',    bg: 'bg-red-950/40 border-red-800/60' },
];

const POSITIONS: { value: NotifPosition; label: string; grid: string }[] = [
  { value: 'top-left',      label: 'Top Left',      grid: 'col-start-1 row-start-1' },
  { value: 'top-center',    label: 'Top Center',    grid: 'col-start-2 row-start-1' },
  { value: 'top-right',     label: 'Top Right',     grid: 'col-start-3 row-start-1' },
  { value: 'bottom-left',   label: 'Bottom Left',   grid: 'col-start-1 row-start-2' },
  { value: 'bottom-center', label: 'Bottom Center', grid: 'col-start-2 row-start-2' },
  { value: 'bottom-right',  label: 'Bottom Right',  grid: 'col-start-3 row-start-2' },
];

type FormState = {
  title: string; message: string; type: NotifType;
  duration: number; position: NotifPosition;
  actionLabel: string; actionUrl: string; showOnce: boolean;
  status: 'active' | 'paused' | 'draft';
};

function newForm(): FormState {
  return {
    title: '', message: '', type: 'info',
    duration: 5000, position: 'bottom-right',
    actionLabel: '', actionUrl: '', showOnce: true,
    status: 'active',
  };
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${on ? 'bg-red-600' : 'bg-zinc-700'}`}>
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform ${on ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
    </button>
  );
}

export function NotificationsSection({ notifications, onUpdate, onLog }: Props) {
  const [form, setForm] = useState<FormState>(newForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() =>
    notifications.filter(n =>
      !search ||
      n.message.toLowerCase().includes(search.toLowerCase()) ||
      (n.title ?? '').toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notifications, search]
  );

  const resetForm = () => { setForm(newForm()); setEditingId(null); };

  const handleSave = () => {
    if (!form.message.trim()) return;
    const notif: AdminNotification = {
      id: editingId ?? uid(), status: form.status,
      title: form.title.trim() || undefined, message: form.message.trim(),
      type: form.type, duration: form.duration, position: form.position,
      actionLabel: form.actionLabel.trim() || undefined,
      actionUrl: form.actionUrl.trim() || undefined,
      showOnce: form.showOnce, targetPages: [], priority: 5,
      deliveries: editingId ? (notifications.find(n => n.id === editingId)?.deliveries ?? 0) : 0,
      createdAt: editingId ? (notifications.find(n => n.id === editingId)?.createdAt ?? new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (editingId) {
      onUpdate(notifications.map(n => n.id === editingId ? notif : n), 'Notification updated');
      onLog('Updated', `Notification: ${notif.title || notif.message}`);
    } else {
      onUpdate([...notifications, notif], 'Notification saved');
      onLog('Created', `Notification: ${notif.title || notif.message}`);
    }
    resetForm(); setShowForm(false);
  };

  const startEdit = (n: AdminNotification) => {
    setForm({
      title: n.title ?? '', message: n.message, type: n.type,
      duration: n.duration, position: n.position,
      actionLabel: n.actionLabel ?? '', actionUrl: n.actionUrl ?? '',
      showOnce: n.showOnce, status: n.status,
    });
    setEditingId(n.id); setShowForm(true);
  };

  const remove = (id: string) => {
    const n = notifications.find(x => x.id === id);
    onUpdate(notifications.filter(x => x.id !== id), 'Notification deleted');
    onLog('Deleted', `Notification: ${(n?.title || n?.message) ?? id}`);
    if (editingId === id) { resetForm(); setShowForm(false); }
  };

  const duplicate = (n: AdminNotification) => {
    const copy: AdminNotification = { ...n, id: uid(), status: 'draft', deliveries: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    onUpdate([...notifications, copy], 'Notification duplicated');
    onLog('Duplicated', `Notification: ${n.title || n.message}`);
  };

  const toggleStatus = (id: string) => {
    const n = notifications.find(x => x.id === id);
    if (!n) return;
    const next = n.status === 'active' ? 'paused' : 'active';
    onUpdate(notifications.map(x => x.id === id ? { ...x, status: next } : x));
    onLog(next === 'active' ? 'Activated' : 'Paused', `Notification: ${n.title || n.message}`);
  };

  const inp = 'w-full px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent';
  const lbl = 'block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5';

  const typeInfo = TYPES.find(t => t.value === form.type)!;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-white">Toast Notifications</h2>
          <p className="text-zinc-500 text-xs mt-0.5">{notifications.length} total · {notifications.filter(n => n.status === 'active').length} active</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(v => !v); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors">
          {showForm && !editingId ? <X size={14} /> : <Plus size={14} />}
          {showForm && !editingId ? 'Cancel' : 'New Notification'}
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-white">{editingId ? 'Edit Notification' : 'Create Notification'}</h3>
          </div>
          <div className="p-5 space-y-5">
            {/* Title + Message */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={lbl}>Title <span className="text-zinc-600 normal-case font-normal">(optional)</span></label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Notification title…" className={inp} />
              </div>
              <div>
                <label className={lbl}>Message <span className="text-red-500">*</span></label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={2} placeholder="Enter notification message…" className={`${inp} resize-none`} />
              </div>
            </div>

            {/* Type */}
            <div>
              <label className={lbl}>Type</label>
              <div className="flex flex-wrap gap-2">
                {TYPES.map(t => (
                  <button key={t.value} type="button" onClick={() => setForm(p => ({ ...p, type: t.value }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.type === t.value ? `${t.bg} ${t.color} border-current/30 scale-105` : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Position picker */}
            <div>
              <label className={lbl}>Position</label>
              <div className="relative p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
                {/* Visual grid */}
                <div className="relative h-24 border border-zinc-700 rounded-lg bg-zinc-900/50 overflow-hidden">
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1 p-2">
                    {POSITIONS.map(pos => (
                      <button key={pos.value} type="button" onClick={() => setForm(p => ({ ...p, position: pos.value }))}
                        className={`rounded-md flex items-center justify-center transition-all text-[9px] font-medium ${form.position === pos.value ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700 hover:text-zinc-400'}`}>
                        {pos.value === form.position ? '●' : '○'}
                      </button>
                    ))}
                  </div>
                  {/* Screen edges indicator */}
                  <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-zinc-700/30 rounded-lg" />
                </div>
                <p className="text-xs text-zinc-400 text-center mt-2">
                  Selected: <span className="text-white font-medium">{POSITIONS.find(p => p.value === form.position)?.label}</span>
                </p>
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className={lbl}>Live Preview</label>
              <div className={`p-4 rounded-xl border ${typeInfo.bg} max-w-xs`}>
                {form.title && <p className={`text-xs font-semibold mb-1 ${typeInfo.color}`}>{form.title}</p>}
                <p className="text-sm text-white/90">{form.message || 'Your notification message…'}</p>
                {form.actionLabel && (
                  <button className={`mt-2 text-xs font-semibold ${typeInfo.color} hover:underline`}>{form.actionLabel}</button>
                )}
              </div>
            </div>

            {/* Duration + Action */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Duration (ms)</label>
                <div className="flex gap-2 flex-wrap">
                  {[3000, 5000, 8000, 0].map(d => (
                    <button key={d} type="button" onClick={() => setForm(p => ({ ...p, duration: d }))}
                      className={`px-2.5 py-1.5 rounded-lg text-xs border transition-all ${form.duration === d ? 'bg-zinc-700 border-zinc-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-white'}`}>
                      {d === 0 ? 'Persistent' : `${d / 1000}s`}
                    </button>
                  ))}
                  <input type="number" min={1000} step={500} value={form.duration} onChange={e => setForm(p => ({ ...p, duration: +e.target.value }))}
                    className="w-24 px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
                <div>
                  <p className="text-sm text-zinc-200 font-medium">Show once</p>
                  <p className="text-[10px] text-zinc-500">Per browser session</p>
                </div>
                <Toggle on={form.showOnce} onToggle={() => setForm(p => ({ ...p, showOnce: !p.showOnce }))} />
              </div>
            </div>

            {/* CTA button */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Action Label <span className="text-zinc-600 normal-case font-normal">(optional)</span></label>
                <input value={form.actionLabel} onChange={e => setForm(p => ({ ...p, actionLabel: e.target.value }))} placeholder="Learn more" className={inp} />
              </div>
              {form.actionLabel && (
                <div>
                  <label className={lbl}>Action URL</label>
                  <input value={form.actionUrl} onChange={e => setForm(p => ({ ...p, actionUrl: e.target.value }))} placeholder="https://…" className={inp} />
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className={lbl}>Status</label>
              <div className="flex gap-2">
                {[
                  { v: 'active' as const,  label: 'Active',  icon: CheckCircle },
                  { v: 'paused' as const,  label: 'Paused',  icon: PauseCircle },
                  { v: 'draft'  as const,  label: 'Draft',   icon: FileText },
                ].map(s => (
                  <button key={s.v} type="button" onClick={() => setForm(p => ({ ...p, status: s.v }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${form.status === s.v ? 'bg-zinc-700 border-zinc-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}>
                    <s.icon size={11} /> {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-zinc-800">
              <button onClick={handleSave} disabled={!form.message.trim()}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-sm font-semibold text-white transition-colors">
                {editingId ? 'Update' : 'Save Notification'}
              </button>
              {editingId && (
                <button onClick={() => { resetForm(); setShowForm(false); }}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors border border-zinc-700">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div>
        <div className="relative mb-3">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notifications…"
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl">
            <Bell size={28} className="mx-auto text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-sm">No notifications found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(n => {
              const typeInfo = TYPES.find(t => t.value === n.type)!;
              return (
                <div key={n.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors">
                  <div className={`px-4 py-3 ${typeInfo.bg} border-b border-current/10`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {n.title && <p className={`text-xs font-semibold ${typeInfo.color} mb-0.5`}>{n.title}</p>}
                        <p className="text-sm text-white/90 leading-snug truncate">{n.message}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${n.status === 'active' ? 'bg-green-900/60 text-green-400' : n.status === 'paused' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-800 text-zinc-500'}`}>
                        {n.status}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-2 flex items-center gap-3 text-[10px] text-zinc-600">
                    <span className="capitalize">{n.type}</span>
                    <span>{n.duration === 0 ? 'Persistent' : `${n.duration / 1000}s`}</span>
                    <span>{POSITIONS.find(p => p.value === n.position)?.label}</span>
                    <span>{n.deliveries} deliveries</span>
                  </div>
                  <div className="flex items-center gap-1 px-3 pb-2 border-t border-zinc-800 pt-2">
                    <button onClick={() => toggleStatus(n.id)}
                      className={`flex-1 py-1.5 rounded-lg text-xs transition-colors hover:bg-zinc-800 ${n.status === 'active' ? 'text-amber-400' : 'text-green-400'}`}>
                      {n.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                    <button onClick={() => startEdit(n)} className="flex-1 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1">
                      <Pencil size={11} /> Edit
                    </button>
                    <button onClick={() => duplicate(n)} className="flex-1 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1">
                      <Copy size={11} /> Copy
                    </button>
                    <button onClick={() => remove(n.id)} className="flex-1 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1">
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
