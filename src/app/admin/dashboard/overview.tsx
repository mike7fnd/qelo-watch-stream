'use client';

import { BellRing, Bell, Megaphone, TrendingUp, MousePointerClick, Plus, ArrowRight, Activity, Clock } from 'lucide-react';
import type { AdminPopup, AdminNotification, AdminBanner, ActivityEntry } from '@/lib/admin-store';
import type { Section } from './page';

interface Props {
  popups: AdminPopup[];
  notifications: AdminNotification[];
  banners: AdminBanner[];
  activity: ActivityEntry[];
  onSection: (s: Section) => void;
}

export function OverviewSection({ popups, notifications, banners, activity, onSection }: Props) {
  const activePopups = popups.filter(p => p.status === 'active' && !p.isTemplate).length;
  const activeNotifs = notifications.filter(n => n.status === 'active').length;
  const activeBanners = banners.filter(b => b.active).length;
  const totalImpressions = popups.reduce((s, p) => s + p.impressions, 0);
  const totalClicks = popups.reduce((s, p) => s + p.clicks, 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0';

  const stats = [
    {
      label: 'Popup Alerts',
      value: activePopups,
      total: popups.filter(p => !p.isTemplate).length,
      icon: BellRing,
      color: 'text-blue-400',
      bg: 'bg-blue-950/30 border-blue-900/40',
      section: 'popups' as Section,
    },
    {
      label: 'Notifications',
      value: activeNotifs,
      total: notifications.length,
      icon: Bell,
      color: 'text-purple-400',
      bg: 'bg-purple-950/30 border-purple-900/40',
      section: 'notifications' as Section,
    },
    {
      label: 'Banners',
      value: activeBanners,
      total: banners.length,
      icon: Megaphone,
      color: 'text-amber-400',
      bg: 'bg-amber-950/30 border-amber-900/40',
      section: 'announcements' as Section,
    },
    {
      label: 'Total Impressions',
      value: totalImpressions,
      total: null,
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-950/30 border-green-900/40',
      section: 'analytics' as Section,
    },
    {
      label: 'Total Clicks',
      value: totalClicks,
      sub: `${ctr}% CTR`,
      total: null,
      icon: MousePointerClick,
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/30 border-cyan-900/40',
      section: 'analytics' as Section,
    },
  ];

  const recentActivity = activity.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-white">Dashboard Overview</h2>
        <p className="text-zinc-500 text-sm mt-1">
          Monitor and manage all site notifications and settings.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.label}
              onClick={() => onSection(s.section)}
              className={`
                group text-left p-4 rounded-2xl border transition-all
                hover:scale-[1.02] active:scale-[0.99] ${s.bg}
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-1.5 rounded-lg bg-zinc-900/60 ${s.color}`}>
                  <Icon size={15} />
                </div>
                <ArrowRight size={12} className="text-zinc-600 group-hover:text-zinc-400 transition-colors mt-0.5" />
              </div>
              <p className="text-2xl font-bold text-white leading-none">{s.value.toLocaleString()}</p>
              <p className="text-xs text-zinc-400 mt-1">{s.label}</p>
              {s.total !== null && s.total !== undefined && (
                <p className="text-[10px] text-zinc-600 mt-0.5">{s.total} total</p>
              )}
              {s.sub && <p className="text-[10px] text-zinc-500 mt-0.5">{s.sub}</p>}
            </button>
          );
        })}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'New Popup', section: 'popups' as Section },
            { label: 'New Notification', section: 'notifications' as Section },
            { label: 'New Banner', section: 'announcements' as Section },
            { label: 'Site Controls', section: 'controls' as Section },
          ].map(a => (
            <button
              key={a.label}
              onClick={() => onSection(a.section)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-300 hover:text-white transition-all"
            >
              <Plus size={13} />
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Activity */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} className="text-zinc-400" />
            <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-zinc-600 text-sm py-4 text-center">No activity yet</p>
          ) : (
            <div className="space-y-2.5">
              {recentActivity.map(entry => (
                <div key={entry.id} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 flex-shrink-0 mt-1.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-zinc-300 leading-snug">
                      <span className="font-medium">{entry.action}</span>
                      {' — '}
                      <span className="text-zinc-500 truncate">{entry.target}</span>
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-0.5 flex items-center gap-1">
                      <Clock size={9} />
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activity.length > 8 && (
            <button
              onClick={() => onSection('logs')}
              className="mt-3 text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
            >
              View all {activity.length} entries <ArrowRight size={11} />
            </button>
          )}
        </div>

        {/* Active items */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-zinc-400" />
            <h3 className="text-sm font-semibold text-white">Active Campaigns</h3>
          </div>
          <div className="space-y-2.5">
            {popups.filter(p => p.status === 'active' && !p.isTemplate).slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{p.title || p.message}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{p.impressions} impressions · {p.clicks} clicks</p>
                </div>
                <span className="text-[10px] text-zinc-500 capitalize bg-zinc-800 px-1.5 py-0.5 rounded-full">
                  {p.style}
                </span>
              </div>
            ))}
            {banners.filter(b => b.active).slice(0, 2).map(b => (
              <div key={b.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{b.message}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Banner · {b.position}</p>
                </div>
              </div>
            ))}
            {activePopups === 0 && activeBanners === 0 && (
              <p className="text-zinc-600 text-sm py-4 text-center">No active campaigns</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
