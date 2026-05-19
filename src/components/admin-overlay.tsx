'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { X, Info, AlertTriangle, CheckCircle, AlertCircle, Radio } from 'lucide-react';
import {
  getActivePopups, getActiveNotifications, getBanners, getSettings,
  isPopupDismissed, markPopupDismissed,
  isNotifDismissed, markNotifDismissed,
  isBannerDismissed, markBannerDismissed,
  trackPopupImpression, trackPopupClick, trackNotifDelivery,
} from '@/lib/admin-store';
import type { AdminPopup, AdminNotification, AdminBanner, AdminSettings } from '@/lib/admin-store';

const STYLE_MAP: Record<AdminPopup['style'], string> = {
  dark:    'bg-zinc-900 border-zinc-700 text-white',
  info:    'bg-blue-950 border-blue-700 text-blue-50',
  warning: 'bg-amber-950 border-amber-700 text-amber-50',
  success: 'bg-green-950 border-green-700 text-green-50',
  error:   'bg-red-950 border-red-700 text-red-50',
};

const NOTIF_STYLE: Record<AdminNotification['type'], { bg: string; icon: React.ElementType; color: string }> = {
  info:    { bg: 'bg-zinc-900 border-zinc-700', icon: Info,         color: 'text-blue-400' },
  success: { bg: 'bg-zinc-900 border-zinc-700', icon: CheckCircle,  color: 'text-green-400' },
  warning: { bg: 'bg-zinc-900 border-zinc-700', icon: AlertTriangle, color: 'text-amber-400' },
  error:   { bg: 'bg-zinc-900 border-zinc-700', icon: AlertCircle,  color: 'text-red-400' },
};

const POSITION_CLS: Record<AdminNotification['position'], string> = {
  'top-left':      'top-4 left-4',
  'top-center':    'top-4 left-1/2 -translate-x-1/2',
  'top-right':     'top-4 right-4',
  'bottom-left':   'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  'bottom-right':  'bottom-4 right-4',
};

interface ActiveToast { notif: AdminNotification; id: string; }

export function AdminOverlay() {
  const pathname = usePathname();

  const [popup, setPopup]         = useState<AdminPopup | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [toasts, setToasts]       = useState<ActiveToast[]>([]);
  const [topBanners, setTopBanners]       = useState<AdminBanner[]>([]);
  const [bottomBanners, setBottomBanners] = useState<AdminBanner[]>([]);
  const [settings, setSettings]   = useState<AdminSettings | null>(null);

  const popupRef = useRef<AdminPopup | null>(null);
  popupRef.current = popup;

  const isAdmin = pathname.startsWith('/admin');

  const loadAll = useCallback(() => {
    if (isAdmin) return;

    // Settings
    const s = getSettings();
    setSettings(s);

    // Banners
    const allBanners = getBanners().filter(b => b.active && !isBannerDismissed(b.id));
    setTopBanners(allBanners.filter(b => b.position === 'top'));
    setBottomBanners(allBanners.filter(b => b.position === 'bottom'));

    // Popups — find best candidate
    const active = getActivePopups();
    const candidate = active.find(p => {
      if (p.showOnce && isPopupDismissed(p.id)) return false;
      if (p.targetPages.length > 0 && !p.targetPages.includes(pathname)) return false;
      return true;
    });
    setPopup(candidate ?? null);

    // Notifications
    const activeNotifs = getActiveNotifications().filter(n => {
      if (n.showOnce && isNotifDismissed(n.id)) return false;
      if (n.targetPages.length > 0 && !n.targetPages.includes(pathname)) return false;
      return true;
    });
    setToasts(prev => {
      const existing = new Set(prev.map(t => t.notif.id));
      const newOnes = activeNotifs
        .filter(n => !existing.has(n.id))
        .map(n => ({ notif: n, id: `${n.id}-${Date.now()}` }));
      return [...prev, ...newOnes].slice(0, 5);
    });
  }, [isAdmin, pathname]);

  useEffect(() => {
    loadAll();
    const handler = () => loadAll();
    window.addEventListener('qelo-admin-update', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('qelo-admin-update', handler);
      window.removeEventListener('storage', handler);
    };
  }, [loadAll]);

  // Popup delay + impression tracking
  useEffect(() => {
    if (!popup) return;
    const delayMs = (popup.delay ?? 0) * 1000;
    const timer = setTimeout(() => {
      trackPopupImpression(popup.id);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [popup?.id]);

  // Popup auto-dismiss countdown
  useEffect(() => {
    if (!popup || popup.autoDismiss <= 0) { setCountdown(0); return; }
    setCountdown(popup.autoDismiss);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          const p = popupRef.current;
          if (p?.showOnce) markPopupDismissed(p.id);
          setPopup(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [popup?.id]);

  // Toast auto-dismiss
  useEffect(() => {
    toasts.forEach(t => {
      if (t.notif.duration === 0) return;
      const timer = setTimeout(() => {
        setToasts(prev => prev.filter(x => x.id !== t.id));
        if (t.notif.showOnce) markNotifDismissed(t.notif.id);
      }, t.notif.duration);
      trackNotifDelivery(t.notif.id);
      return () => clearTimeout(timer);
    });
  }, [toasts.length]);

  const dismissPopup = () => {
    if (popup?.showOnce) markPopupDismissed(popup.id);
    setPopup(null);
  };

  const dismissBanner = (id: string, pos: 'top' | 'bottom') => {
    markBannerDismissed(id);
    if (pos === 'top') setTopBanners(prev => prev.filter(b => b.id !== id));
    else setBottomBanners(prev => prev.filter(b => b.id !== id));
  };

  const dismissToast = (id: string, notifId: string, showOnce: boolean) => {
    if (showOnce) markNotifDismissed(notifId);
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (isAdmin) return null;

  const emergencyBg = settings?.emergency.style === 'error' ? '#7f1d1d' : '#78350f';
  const emergencyText = '#fff';

  const btnCls = (variant: AdminPopup['buttons'][0]['variant']) => {
    if (variant === 'primary') return 'bg-white text-zinc-900 hover:bg-zinc-100 font-semibold';
    if (variant === 'secondary') return 'bg-zinc-700 text-white hover:bg-zinc-600';
    return 'border border-current/30 text-current hover:bg-white/10';
  };

  // Group toasts by position
  const toastsByPos = toasts.reduce<Record<string, ActiveToast[]>>((acc, t) => {
    const pos = t.notif.position;
    acc[pos] = acc[pos] ? [...acc[pos], t] : [t];
    return acc;
  }, {});

  return (
    <>
      {/* Emergency broadcast — highest priority */}
      {settings?.emergency.enabled && settings.emergency.message && (
        <div
          className="fixed top-0 left-0 right-0 z-[9010] flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold"
          style={{ backgroundColor: emergencyBg, color: emergencyText }}
        >
          <Radio size={14} className="flex-shrink-0 animate-pulse" />
          <span>{settings.emergency.message}</span>
        </div>
      )}

      {/* Top banners */}
      {topBanners.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-[9005] flex flex-col">
          {topBanners.map(b => (
            <BannerBar key={b.id} banner={b} onDismiss={() => dismissBanner(b.id, 'top')} />
          ))}
        </div>
      )}

      {/* Bottom banners */}
      {bottomBanners.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-[9005] flex flex-col">
          {bottomBanners.map(b => (
            <BannerBar key={b.id} banner={b} onDismiss={() => dismissBanner(b.id, 'bottom')} />
          ))}
        </div>
      )}

      {/* Maintenance overlay */}
      {settings?.maintenance.enabled && (
        <div className="fixed inset-0 z-[9008] flex items-center justify-center p-4 bg-zinc-950">
          <div className="text-center space-y-4 max-w-sm">
            <div className="inline-flex w-16 h-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 mb-2">
              <AlertTriangle size={28} className="text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">{settings.maintenance.title}</h2>
            <p className="text-zinc-400 leading-relaxed text-sm">{settings.maintenance.message}</p>
            {settings.maintenance.estimatedReturn && (
              <p className="text-xs text-zinc-600">Expected back: {settings.maintenance.estimatedReturn}</p>
            )}
          </div>
        </div>
      )}

      {/* Popup modal */}
      {popup && !settings?.maintenance.enabled && (
        <div
          className="fixed inset-0 z-[9006] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
          onClick={dismissPopup}
        >
          <div
            className={`w-full max-w-sm rounded-2xl border shadow-2xl p-6 ${STYLE_MAP[popup.style]}`}
            style={{ animationDelay: `${popup.delay}s` }}
            onClick={e => e.stopPropagation()}
          >
            {popup.title && (
              <h3 className="font-bold text-base mb-2 leading-snug">{popup.title}</h3>
            )}
            <p className="text-sm opacity-90 leading-relaxed mb-5">{popup.message}</p>
            <div className="flex flex-wrap gap-2">
              {popup.buttons.map(btn => (
                <button
                  key={btn.id}
                  onClick={() => {
                    if (btn.action === 'link' && btn.url) window.open(btn.url, '_blank');
                    trackPopupClick(popup.id);
                    dismissPopup();
                  }}
                  className={`px-4 py-2 rounded-xl text-sm transition-colors ${btnCls(btn.variant)}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            {popup.autoDismiss > 0 && countdown > 0 && (
              <p className="text-xs opacity-30 mt-4">Closes in {countdown}s</p>
            )}
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {Object.entries(toastsByPos).map(([position, group]) => (
        <div
          key={position}
          className={`fixed z-[9007] flex flex-col gap-2 ${POSITION_CLS[position as AdminNotification['position']] ?? ''}`}
          style={{ maxWidth: 'calc(100vw - 32px)', width: 320 }}
        >
          {group.map(({ notif, id }) => {
            const ns = NOTIF_STYLE[notif.type];
            const NSIcon = ns.icon;
            return (
              <div
                key={id}
                className={`flex items-start gap-3 p-4 rounded-2xl border shadow-2xl ${ns.bg}`}
              >
                <NSIcon size={16} className={`flex-shrink-0 mt-0.5 ${ns.color}`} />
                <div className="flex-1 min-w-0">
                  {notif.title && <p className="text-xs font-semibold text-white mb-0.5">{notif.title}</p>}
                  <p className="text-sm text-zinc-300 leading-snug">{notif.message}</p>
                  {notif.actionLabel && (
                    <button
                      onClick={() => { if (notif.actionUrl) window.open(notif.actionUrl, '_blank'); dismissToast(id, notif.id, notif.showOnce); }}
                      className={`mt-2 text-xs font-semibold ${ns.color} hover:underline`}
                    >
                      {notif.actionLabel}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => dismissToast(id, notif.id, notif.showOnce)}
                  className="text-zinc-600 hover:text-zinc-300 transition-colors flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}

function BannerBar({ banner, onDismiss }: { banner: AdminBanner; onDismiss: () => void }) {
  const iconMap: Record<string, React.ElementType> = {
    info: Info, warning: AlertTriangle, check: CheckCircle,
  };
  const BannerIcon = banner.iconType && banner.iconType !== 'none' ? iconMap[banner.iconType] : null;

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium"
      style={{ backgroundColor: banner.bgColor, color: banner.textColor }}
    >
      {BannerIcon && <BannerIcon size={14} className="flex-shrink-0 opacity-80" />}
      <div className="flex-1 flex items-center justify-center gap-3 text-center">
        <span>{banner.message}</span>
        {banner.link && (
          <a href={banner.link} target="_blank" rel="noopener noreferrer"
            className="underline text-xs opacity-80 hover:opacity-100 transition-opacity flex-shrink-0">
            {banner.linkText || 'Learn more'}
          </a>
        )}
      </div>
      {banner.dismissible && (
        <button onClick={onDismiss} aria-label="Dismiss"
          className="ml-2 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
