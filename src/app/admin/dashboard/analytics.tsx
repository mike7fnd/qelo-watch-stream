'use client';

import { useMemo } from 'react';
import { TrendingUp, MousePointerClick, BellRing, Bell, Megaphone, Eye, BarChart3 } from 'lucide-react';
import type { AdminPopup, AdminNotification } from '@/lib/admin-store';

interface Props {
  popups: AdminPopup[];
  notifications: AdminNotification[];
}

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className={`inline-flex p-2 rounded-xl mb-3 ${color}`}>
        <Icon size={16} />
      </div>
      <p className="text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-sm text-zinc-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
    </div>
  );
}

function HBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400 truncate max-w-[200px]">{label}</span>
        <span className="text-zinc-300 font-medium ml-2">{value.toLocaleString()}</span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-800">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function AnalyticsSection({ popups, notifications }: Props) {
  const realPopups = useMemo(() => popups.filter(p => !p.isTemplate), [popups]);

  const totalImpressions = realPopups.reduce((s, p) => s + p.impressions, 0);
  const totalClicks = realPopups.reduce((s, p) => s + p.clicks, 0);
  const totalDeliveries = notifications.reduce((s, n) => s + n.deliveries, 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0';
  const activePopups = realPopups.filter(p => p.status === 'active').length;
  const activeNotifs = notifications.filter(n => n.status === 'active').length;

  const topPopups = [...realPopups]
    .filter(p => p.impressions > 0)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 8);

  const maxImpressions = topPopups[0]?.impressions ?? 1;

  const topByClicks = [...realPopups]
    .filter(p => p.clicks > 0)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);

  const maxClicks = topByClicks[0]?.clicks ?? 1;

  const styleBreakdown = realPopups.reduce<Record<string, number>>((acc, p) => {
    acc[p.style] = (acc[p.style] ?? 0) + 1;
    return acc;
  }, {});

  const STYLE_COLORS: Record<string, string> = {
    dark: 'bg-zinc-400', info: 'bg-blue-500', warning: 'bg-amber-500', success: 'bg-green-500', error: 'bg-red-500',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">Analytics</h2>
        <p className="text-zinc-500 text-xs mt-0.5">Performance tracking for all active campaigns.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard label="Total Impressions" value={totalImpressions} icon={Eye} color="bg-blue-950/50 text-blue-400" />
        <StatCard label="Total Clicks" value={totalClicks} sub={`${ctr}% avg CTR`} icon={MousePointerClick} color="bg-green-950/50 text-green-400" />
        <StatCard label="Notification Deliveries" value={totalDeliveries} icon={Bell} color="bg-purple-950/50 text-purple-400" />
        <StatCard label="Active Popups" value={activePopups} sub={`${realPopups.length} total`} icon={BellRing} color="bg-amber-950/50 text-amber-400" />
        <StatCard label="Active Notifications" value={activeNotifs} sub={`${notifications.length} total`} icon={Megaphone} color="bg-cyan-950/50 text-cyan-400" />
        <StatCard label="Avg CTR" value={`${ctr}%`} sub="Click-through rate" icon={TrendingUp} color="bg-red-950/50 text-red-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top popups by impressions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={15} className="text-zinc-400" />
            <h3 className="text-sm font-semibold text-white">Top Popups by Impressions</h3>
          </div>
          {topPopups.length === 0 ? (
            <p className="text-zinc-600 text-sm py-6 text-center">No impression data yet</p>
          ) : (
            <div className="space-y-3">
              {topPopups.map(p => (
                <HBar
                  key={p.id}
                  label={p.title || p.message.slice(0, 40)}
                  value={p.impressions}
                  max={maxImpressions}
                  color="bg-blue-500"
                />
              ))}
            </div>
          )}
        </div>

        {/* Top popups by clicks */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <MousePointerClick size={15} className="text-zinc-400" />
            <h3 className="text-sm font-semibold text-white">Top Popups by Clicks</h3>
          </div>
          {topByClicks.length === 0 ? (
            <p className="text-zinc-600 text-sm py-6 text-center">No click data yet</p>
          ) : (
            <div className="space-y-3">
              {topByClicks.map(p => (
                <HBar
                  key={p.id}
                  label={p.title || p.message.slice(0, 40)}
                  value={p.clicks}
                  max={maxClicks}
                  color="bg-green-500"
                />
              ))}
            </div>
          )}
        </div>

        {/* Popup breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Popup Style Distribution</h3>
          {Object.keys(styleBreakdown).length === 0 ? (
            <p className="text-zinc-600 text-sm py-6 text-center">No popups created yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(styleBreakdown).sort((a, b) => b[1] - a[1]).map(([style, count]) => (
                <div key={style} className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STYLE_COLORS[style] ?? 'bg-zinc-500'}`} />
                  <span className="text-sm text-zinc-400 capitalize flex-1">{style}</span>
                  <span className="text-sm text-white font-medium">{count}</span>
                  <div className="w-24 h-1.5 rounded-full bg-zinc-800">
                    <div className={`h-full rounded-full ${STYLE_COLORS[style] ?? 'bg-zinc-500'}`}
                      style={{ width: `${(count / realPopups.length) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Per-popup detailed table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">All Popup Stats</h3>
          {realPopups.length === 0 ? (
            <p className="text-zinc-600 text-sm py-6 text-center">No popups yet</p>
          ) : (
            <div className="space-y-2">
              {[...realPopups].sort((a, b) => b.impressions - a.impressions).map(p => {
                const pCtr = p.impressions > 0 ? ((p.clicks / p.impressions) * 100).toFixed(1) : '0';
                return (
                  <div key={p.id} className="flex items-center gap-3 py-2 border-b border-zinc-800 last:border-0">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STYLE_COLORS[p.style] ?? 'bg-zinc-500'}`} />
                    <p className="text-xs text-zinc-400 flex-1 truncate">{p.title || p.message}</p>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-500 flex-shrink-0">
                      <span>{p.impressions.toLocaleString()}</span>
                      <span>{p.clicks.toLocaleString()}</span>
                      <span>{pCtr}%</span>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-3 py-1.5 text-[10px] text-zinc-600 font-medium">
                <div className="w-1.5 flex-shrink-0" />
                <p className="flex-1">TOTAL</p>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span>{totalImpressions.toLocaleString()}</span>
                  <span>{totalClicks.toLocaleString()}</span>
                  <span>{ctr}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

