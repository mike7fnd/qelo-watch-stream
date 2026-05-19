'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, BellRing, Bell, Megaphone,
  Settings2, BarChart3, ScrollText, LogOut,
  ExternalLink, Menu, X, ChevronRight, Shield,
} from 'lucide-react';
import {
  getPopups, savePopups, getNotifications, saveNotifications,
  getBanners, saveBanners, getSettings, saveSettings,
  getActivity, addActivity,
  AdminPopup, AdminNotification, AdminBanner, AdminSettings,
  ActivityEntry, DEFAULT_SETTINGS,
} from '@/lib/admin-store';
import { OverviewSection } from './overview';
import { PopupsSection } from './popups';
import { NotificationsSection } from './notifications';
import { AnnouncementsSection } from './announcements';
import { SiteControlsSection } from './site-controls';
import { AnalyticsSection } from './analytics';
import { ActivityLogSection } from './activity-log';

export type Section =
  | 'overview' | 'popups' | 'notifications'
  | 'announcements' | 'controls' | 'analytics' | 'logs';

interface NavItem { id: Section; label: string; icon: React.ElementType; group: string; }

const NAV: NavItem[] = [
  { id: 'overview',       label: 'Overview',       icon: LayoutDashboard, group: 'Main' },
  { id: 'popups',         label: 'Popup Alerts',   icon: BellRing,        group: 'Content' },
  { id: 'notifications',  label: 'Notifications',  icon: Bell,            group: 'Content' },
  { id: 'announcements',  label: 'Banners',         icon: Megaphone,       group: 'Content' },
  { id: 'controls',       label: 'Site Controls',  icon: Settings2,       group: 'System' },
  { id: 'analytics',      label: 'Analytics',      icon: BarChart3,       group: 'System' },
  { id: 'logs',           label: 'Activity Log',   icon: ScrollText,      group: 'System' },
];

const GROUPS = ['Main', 'Content', 'System'];

export default function AdminDashboard() {
  const router = useRouter();
  const [section, setSection] = useState<Section>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Data state
  const [popups, setPopups]                 = useState<AdminPopup[]>([]);
  const [notifications, setNotifications]   = useState<AdminNotification[]>([]);
  const [banners, setBanners]               = useState<AdminBanner[]>([]);
  const [settings, setSettings]             = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [activity, setActivity]             = useState<ActivityEntry[]>([]);

  useEffect(() => {
    if (sessionStorage.getItem('qelo-admin-auth') !== 'true') {
      router.replace('/admin'); return;
    }
    setPopups(getPopups());
    setNotifications(getNotifications());
    setBanners(getBanners());
    setSettings(getSettings());
    setActivity(getActivity());
  }, [router]);

  // Keyboard shortcut: Escape closes sidebar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const log = useCallback((action: string, target: string, details?: string) => {
    const entry = addActivity(action, target, details);
    setActivity(prev => [entry, ...prev.slice(0, 199)]);
  }, []);

  const handlePopups = useCallback((updated: AdminPopup[], msg?: string) => {
    setPopups(updated); savePopups(updated);
    if (msg) showToast(msg);
  }, [showToast]);

  const handleNotifications = useCallback((updated: AdminNotification[], msg?: string) => {
    setNotifications(updated); saveNotifications(updated);
    if (msg) showToast(msg);
  }, [showToast]);

  const handleBanners = useCallback((updated: AdminBanner[], msg?: string) => {
    setBanners(updated); saveBanners(updated);
    if (msg) showToast(msg);
  }, [showToast]);

  const handleSettings = useCallback((updated: AdminSettings, msg?: string) => {
    setSettings(updated); saveSettings(updated);
    if (msg) showToast(msg);
  }, [showToast]);

  const handleLogout = () => {
    log('Logout', 'Admin session');
    sessionStorage.removeItem('qelo-admin-auth');
    router.push('/admin');
  };

  // Badge counts
  const badges: Partial<Record<Section, number>> = {
    popups: popups.filter(p => p.status === 'active' && !p.isTemplate).length,
    notifications: notifications.filter(n => n.status === 'active').length,
    announcements: banners.filter(b => b.active).length,
  };

  const currentLabel = NAV.find(n => n.id === section)?.label ?? '';

  const navigate = (id: Section) => { setSection(id); setSidebarOpen(false); };

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────── */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-60 flex-shrink-0 flex flex-col
        bg-zinc-900 border-r border-zinc-800/80
        transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-zinc-800/80 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
            <Shield size={14} className="text-white" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-white leading-none truncate">QeloMovie</p>
            <p className="text-[10px] text-zinc-500 mt-0.5 leading-none">Admin Panel</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-zinc-500 hover:text-white transition-colors p-1"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {GROUPS.map(group => {
            const items = NAV.filter(n => n.group === group);
            return (
              <div key={group} className="mb-4">
                <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-2 mb-1">
                  {group}
                </p>
                {items.map(item => {
                  const Icon = item.icon;
                  const badge = badges[item.id];
                  const active = section === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.id)}
                      className={`
                        w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm
                        transition-all text-left mb-0.5
                        ${active
                          ? 'bg-zinc-800 text-white font-medium shadow-sm'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        }
                      `}
                    >
                      <Icon size={15} className="flex-shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {badge !== undefined && badge > 0 && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-600/20 text-red-400 flex-shrink-0">
                          {badge}
                        </span>
                      )}
                      {active && <ChevronRight size={12} className="text-zinc-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-zinc-800/80 p-2 space-y-0.5">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all"
          >
            <ExternalLink size={14} />
            <span>View Site</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition-all"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 h-14 border-b border-zinc-800/80 bg-zinc-950 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Menu size={18} />
          </button>
          <h2 className="text-sm font-semibold text-white flex-1">{currentLabel}</h2>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-xs text-zinc-500 hidden sm:block">Live</span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            {section === 'overview' && (
              <OverviewSection
                popups={popups} notifications={notifications}
                banners={banners} activity={activity}
                onSection={setSection}
              />
            )}
            {section === 'popups' && (
              <PopupsSection
                popups={popups} onUpdate={handlePopups} onLog={log}
              />
            )}
            {section === 'notifications' && (
              <NotificationsSection
                notifications={notifications} onUpdate={handleNotifications} onLog={log}
              />
            )}
            {section === 'announcements' && (
              <AnnouncementsSection
                banners={banners} onUpdate={handleBanners} onLog={log}
              />
            )}
            {section === 'controls' && (
              <SiteControlsSection
                settings={settings} onUpdate={handleSettings} onLog={log}
              />
            )}
            {section === 'analytics' && (
              <AnalyticsSection popups={popups} notifications={notifications} />
            )}
            {section === 'logs' && (
              <ActivityLogSection activity={activity} />
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`
          fixed bottom-5 right-5 z-[99999] flex items-center gap-2.5 px-4 py-3
          rounded-xl border shadow-2xl text-sm font-medium
          transition-all duration-200
          ${toast.ok
            ? 'bg-zinc-900 border-zinc-700 text-white'
            : 'bg-red-950 border-red-800 text-red-200'
          }
        `}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${toast.ok ? 'bg-green-400' : 'bg-red-400'}`} />
          {toast.msg}
        </div>
      )}
    </div>
  );
}
