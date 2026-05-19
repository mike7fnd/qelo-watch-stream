'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Megaphone, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import type { AdminBanner } from '@/lib/admin-store';
import { uid } from '@/lib/admin-store';

interface Props {
  banners: AdminBanner[];
  onUpdate: (b: AdminBanner[], msg?: string) => void;
  onLog: (action: string, target: string) => void;
}

const BG_PALETTE = [
  { color: '#dc2626', name: 'Red' },
  { color: '#2563eb', name: 'Blue' },
  { color: '#16a34a', name: 'Green' },
  { color: '#d97706', name: 'Amber' },
  { color: '#7c3aed', name: 'Purple' },
  { color: '#0891b2', name: 'Cyan' },
  { color: '#18181b', name: 'Black' },
  { color: '#f4f4f5', name: 'Light' },
];

const ICON_OPTIONS = [
  { value: 'none' as const,    label: 'None' },
  { value: 'info' as const,    label: 'Info',    icon: Info },
  { value: 'warning' as const, label: 'Warning', icon: AlertTriangle },
  { value: 'check' as const,   label: 'Success', icon: CheckCircle },
];

type FormState = {
  message: string; bgColor: string; textColor: string;
  position: 'top' | 'bottom'; dismissible: boolean;
  active: boolean; iconType: AdminBanner['iconType'];
  link: string; linkText: string;
};

function newForm(): FormState {
  return {
    message: '', bgColor: '#dc2626', textColor: '#ffffff',
    position: 'top', dismissible: true, active: true,
    iconType: 'none', link: '', linkText: '',
  };
}

function Toggle({ on, onToggle, label, sub }: { on: boolean; onToggle: () => void; label: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm text-zinc-200">{label}</p>
        {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
      </div>
      <button type="button" onClick={onToggle}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${on ? 'bg-red-600' : 'bg-zinc-700'}`}>
        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform ${on ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
      </button>
    </div>
  );
}

function BannerPreview({ b, onDismiss }: { b: FormState | AdminBanner; onDismiss?: () => void }) {
  const iconType = b.iconType;
  const IconComp = ICON_OPTIONS.find(i => i.value === iconType)?.icon;
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium"
      style={{ backgroundColor: b.bgColor, color: b.textColor }}>
      {IconComp && <IconComp size={15} className="flex-shrink-0 opacity-80" />}
      <span className="flex-1">{(b as FormState).message || 'Banner preview…'}</span>
      {'link' in b && b.link && (
        <span className="underline text-xs opacity-75 flex-shrink-0">
          {(b as FormState).linkText || 'Learn more'}
        </span>
      )}
      {b.dismissible && onDismiss && (
        <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100 text-lg leading-none">×</button>
      )}
    </div>
  );
}

export function AnnouncementsSection({ banners, onUpdate, onLog }: Props) {
  const [form, setForm] = useState<FormState>(newForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const resetForm = () => { setForm(newForm()); setEditingId(null); };

  const handleSave = () => {
    if (!form.message.trim()) return;
    const banner: AdminBanner = {
      id: editingId ?? uid(),
      message: form.message.trim(), bgColor: form.bgColor, textColor: form.textColor,
      position: form.position, dismissible: form.dismissible, active: form.active,
      iconType: form.iconType,
      link: form.link.trim() || undefined, linkText: form.linkText.trim() || undefined,
      createdAt: editingId ? (banners.find(b => b.id === editingId)?.createdAt ?? new Date().toISOString()) : new Date().toISOString(),
    };
    if (editingId) {
      onUpdate(banners.map(b => b.id === editingId ? banner : b), 'Banner updated');
      onLog('Updated', `Banner: ${banner.message}`);
    } else {
      onUpdate([...banners, banner], 'Banner published');
      onLog('Created', `Banner: ${banner.message}`);
    }
    resetForm(); setShowForm(false);
  };

  const startEdit = (b: AdminBanner) => {
    setForm({
      message: b.message, bgColor: b.bgColor, textColor: b.textColor,
      position: b.position, dismissible: b.dismissible, active: b.active,
      iconType: b.iconType, link: b.link ?? '', linkText: b.linkText ?? '',
    });
    setEditingId(b.id); setShowForm(true);
  };

  const remove = (id: string) => {
    const b = banners.find(x => x.id === id);
    onUpdate(banners.filter(x => x.id !== id), 'Banner deleted');
    onLog('Deleted', `Banner: ${b?.message ?? id}`);
    if (editingId === id) { resetForm(); setShowForm(false); }
  };

  const toggleActive = (id: string) => {
    const b = banners.find(x => x.id === id);
    if (!b) return;
    onUpdate(banners.map(x => x.id === id ? { ...x, active: !x.active } : x));
    onLog(b.active ? 'Deactivated' : 'Activated', `Banner: ${b.message}`);
  };

  const inp = 'w-full px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500';
  const lbl = 'block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-white">Announcement Banners</h2>
          <p className="text-zinc-500 text-xs mt-0.5">
            {banners.length} banners · {banners.filter(b => b.active).length} active
          </p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(v => !v); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors">
          {showForm && !editingId ? <X size={14} /> : <Plus size={14} />}
          {showForm && !editingId ? 'Cancel' : 'New Banner'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-white">{editingId ? 'Edit Banner' : 'Create Banner'}</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
            {/* Left: form */}
            <div className="p-5 space-y-5">
              {/* Message */}
              <div>
                <label className={lbl}>Message <span className="text-red-500">*</span></label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  rows={2} placeholder="Announcement message…" className={`${inp} resize-none`} />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={lbl}>Background</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {BG_PALETTE.map(p => (
                      <button key={p.color} type="button" title={p.name}
                        onClick={() => setForm(prev => ({ ...prev, bgColor: p.color }))}
                        className={`w-7 h-7 rounded-lg border-2 transition-all ${form.bgColor === p.color ? 'border-white scale-110 shadow-md' : 'border-transparent hover:border-zinc-500'}`}
                        style={{ backgroundColor: p.color }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.bgColor} onChange={e => setForm(p => ({ ...p, bgColor: e.target.value }))}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-700 bg-transparent p-0.5" />
                    <span className="text-xs font-mono text-zinc-500">{form.bgColor}</span>
                  </div>
                </div>

                <div>
                  <label className={lbl}>Text Color</label>
                  <div className="flex gap-2 mb-2">
                    {['#ffffff', '#000000'].map(c => (
                      <button key={c} type="button"
                        onClick={() => setForm(p => ({ ...p, textColor: c }))}
                        className={`px-3 py-1.5 rounded-lg text-xs border transition-all font-medium ${form.textColor === c ? 'border-white/40 scale-105' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
                        style={{ backgroundColor: form.bgColor, color: c }}>
                        {c === '#ffffff' ? 'White' : 'Black'}
                      </button>
                    ))}
                    <div className="flex items-center gap-1.5">
                      <input type="color" value={form.textColor} onChange={e => setForm(p => ({ ...p, textColor: e.target.value }))}
                        className="w-7 h-7 rounded cursor-pointer border border-zinc-700 bg-transparent p-0.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Icon */}
              <div>
                <label className={lbl}>Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map(opt => {
                    const Ic = opt.icon;
                    return (
                      <button key={opt.value} type="button"
                        onClick={() => setForm(p => ({ ...p, iconType: opt.value }))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${form.iconType === opt.value ? 'bg-zinc-700 border-zinc-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}>
                        {Ic && <Ic size={12} />}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Position */}
              <div>
                <label className={lbl}>Position</label>
                <div className="flex gap-2">
                  {(['top', 'bottom'] as const).map(pos => (
                    <button key={pos} type="button" onClick={() => setForm(p => ({ ...p, position: pos }))}
                      className={`flex-1 py-2 rounded-xl text-sm capitalize transition-colors border font-medium ${form.position === pos ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}>
                      {pos === 'top' ? '↑ Top of page' : '↓ Bottom of page'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link */}
              <div className="space-y-2">
                <label className={lbl}>Link <span className="text-zinc-600 normal-case font-normal">(optional)</span></label>
                <input value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} placeholder="https://…" className={inp} />
                {form.link && (
                  <input value={form.linkText} onChange={e => setForm(p => ({ ...p, linkText: e.target.value }))} placeholder="Link label (e.g. Learn more)" className={inp} />
                )}
              </div>

              {/* Toggles */}
              <div className="space-y-3 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                <Toggle on={form.dismissible} onToggle={() => setForm(p => ({ ...p, dismissible: !p.dismissible }))} label="Dismissible" sub="Show × close button" />
                <div className="border-t border-zinc-700/50" />
                <Toggle on={form.active} onToggle={() => setForm(p => ({ ...p, active: !p.active }))} label="Publish immediately" sub="Visible to all visitors" />
              </div>

              <div className="flex gap-2">
                <button onClick={handleSave} disabled={!form.message.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-sm font-semibold text-white transition-colors">
                  {editingId ? 'Update Banner' : 'Save & Publish'}
                </button>
                {editingId && (
                  <button onClick={() => { resetForm(); setShowForm(false); }}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors border border-zinc-700">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Right: preview */}
            <div className="p-5 space-y-4">
              <div>
                <label className={lbl}>Live Preview</label>
                <BannerPreview b={form} />
              </div>

              <div>
                <p className="text-xs text-zinc-500 mb-2">How it looks on page</p>
                <div className="relative border border-zinc-700 rounded-xl bg-zinc-950 h-40 overflow-hidden">
                  {form.position === 'top' ? (
                    <div className="absolute top-0 left-0 right-0">
                      <BannerPreview b={form} />
                    </div>
                  ) : (
                    <div className="absolute bottom-0 left-0 right-0">
                      <BannerPreview b={form} />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-zinc-700 text-xs text-center space-y-1">
                      <div className="w-20 h-1.5 bg-zinc-800 rounded mx-auto" />
                      <div className="w-16 h-1.5 bg-zinc-800 rounded mx-auto" />
                      <div className="w-24 h-1.5 bg-zinc-800 rounded mx-auto" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div>
        {banners.length === 0 ? (
          <div className="py-16 text-center bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl">
            <Megaphone size={28} className="mx-auto text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-sm">No banners yet</p>
            <button onClick={() => { resetForm(); setShowForm(true); }}
              className="mt-3 text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mx-auto">
              <Plus size={12} /> Create your first banner
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {[...banners].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(b => {
              const IconComp = ICON_OPTIONS.find(i => i.value === b.iconType)?.icon;
              return (
                <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors">
                  {/* Actual banner preview */}
                  <div className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium"
                    style={{ backgroundColor: b.bgColor, color: b.textColor }}>
                    {IconComp && <IconComp size={14} className="flex-shrink-0 opacity-80" />}
                    <span className="flex-1 truncate">{b.message}</span>
                    {b.link && <span className="underline text-xs opacity-70 flex-shrink-0">{b.linkText || 'Link'}</span>}
                    {b.dismissible && <span className="opacity-50 text-base leading-none flex-shrink-0">×</span>}
                  </div>
                  {/* Meta row */}
                  <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${b.active ? 'bg-green-900/50 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                        {b.active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-[10px] text-zinc-600 capitalize">{b.position}</span>
                      {!b.dismissible && <span className="text-[10px] text-zinc-600">Persistent</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleActive(b.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors hover:bg-zinc-800 ${b.active ? 'text-amber-400' : 'text-green-400'}`}>
                        {b.active ? 'Pause' : 'Activate'}
                      </button>
                      <button onClick={() => startEdit(b)} className="px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-1">
                        <Pencil size={11} /> Edit
                      </button>
                      <button onClick={() => remove(b.id)} className="px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors flex items-center gap-1">
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
    </div>
  );
}
