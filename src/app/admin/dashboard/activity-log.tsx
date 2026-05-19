'use client';

import { useState, useMemo } from 'react';
import { Search, ScrollText, Clock, Trash2 } from 'lucide-react';
import type { ActivityEntry } from '@/lib/admin-store';

interface Props {
  activity: ActivityEntry[];
}

const ACTION_COLORS: Record<string, string> = {
  Created:    'text-green-400 bg-green-950/50',
  Updated:    'text-blue-400 bg-blue-950/50',
  Deleted:    'text-red-400 bg-red-950/50',
  Activated:  'text-green-400 bg-green-950/50',
  Deactivated:'text-zinc-400 bg-zinc-800',
  Paused:     'text-amber-400 bg-amber-950/50',
  Published:  'text-cyan-400 bg-cyan-950/50',
  Duplicated: 'text-purple-400 bg-purple-950/50',
  Enabled:    'text-green-400 bg-green-950/50',
  Disabled:   'text-zinc-400 bg-zinc-800',
  Login:      'text-blue-400 bg-blue-950/50',
  Logout:     'text-zinc-400 bg-zinc-800',
  Exported:   'text-cyan-400 bg-cyan-950/50',
  Imported:   'text-purple-400 bg-purple-950/50',
  Cleared:    'text-red-400 bg-red-950/50',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function ActivityLogSection({ activity }: Props) {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const uniqueActions = useMemo(() => {
    const actions = new Set(activity.map(e => e.action));
    return Array.from(actions).sort();
  }, [activity]);

  const filtered = useMemo(() => {
    let list = activity;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.action.toLowerCase().includes(q) ||
        e.target.toLowerCase().includes(q) ||
        (e.details ?? '').toLowerCase().includes(q)
      );
    }
    if (filterAction !== 'all') list = list.filter(e => e.action === filterAction);
    return list;
  }, [activity, search, filterAction]);

  const handleClearLog = () => {
    localStorage.removeItem('qelo-admin-activity');
    window.location.reload();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-white">Activity Log</h2>
          <p className="text-zinc-500 text-xs mt-0.5">{activity.length} recorded actions</p>
        </div>
        {activity.length > 0 && (
          <button onClick={handleClearLog}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-500 hover:text-red-400 transition-all">
            <Trash2 size={12} /> Clear log
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search activity…"
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
          className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none appearance-none cursor-pointer">
          <option value="all">All actions</option>
          {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Log */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl">
          <ScrollText size={28} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-500 text-sm">{activity.length === 0 ? 'No activity recorded yet' : 'No results for this filter'}</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="divide-y divide-zinc-800">
            {filtered.map((entry, i) => {
              const colorClass = ACTION_COLORS[entry.action] ?? 'text-zinc-400 bg-zinc-800';
              return (
                <div key={entry.id} className={`flex items-start gap-3 px-4 py-3 ${i === 0 ? '' : ''} hover:bg-zinc-800/30 transition-colors`}>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${colorClass}`}>
                    {entry.action}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300 leading-snug">{entry.target}</p>
                    {entry.details && (
                      <p className="text-xs text-zinc-600 mt-0.5">{entry.details}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-600 flex-shrink-0">
                    <Clock size={9} />
                    <span title={new Date(entry.timestamp).toLocaleString()}>
                      {timeAgo(entry.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length >= 50 && (
            <div className="px-4 py-3 border-t border-zinc-800 text-center">
              <p className="text-xs text-zinc-600">Showing {filtered.length} of {activity.length} entries</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
