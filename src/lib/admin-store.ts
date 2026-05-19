// ─── Types ────────────────────────────────────────────────────────────────────

export type PopupStatus = 'draft' | 'active' | 'scheduled' | 'paused';
export type PopupStyle = 'dark' | 'info' | 'warning' | 'success' | 'error';
export type NotifType = 'info' | 'success' | 'warning' | 'error';
export type NotifPosition =
  | 'top-left' | 'top-right' | 'top-center'
  | 'bottom-left' | 'bottom-right' | 'bottom-center';

export interface AdminButton {
  id: string;
  label: string;
  action: 'close' | 'link';
  url?: string;
  variant: 'primary' | 'secondary' | 'ghost';
}

export interface AdminPopup {
  id: string;
  status: PopupStatus;
  title?: string;
  message: string;
  buttons: AdminButton[];
  style: PopupStyle;
  delay: number;        // seconds before showing
  autoDismiss: number;  // seconds, 0 = manual
  targetPages: string[]; // empty = all pages
  showOnce: boolean;
  priority: number;     // 1–10, higher shows first
  scheduledAt?: string;
  expiresAt?: string;
  isTemplate: boolean;
  impressions: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminNotification {
  id: string;
  status: 'active' | 'paused' | 'draft';
  title?: string;
  message: string;
  type: NotifType;
  duration: number;     // ms, 0 = persistent
  position: NotifPosition;
  actionLabel?: string;
  actionUrl?: string;
  showOnce: boolean;
  targetPages: string[];
  priority: number;
  deliveries: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBanner {
  id: string;
  message: string;
  bgColor: string;
  textColor: string;
  position: 'top' | 'bottom';
  dismissible: boolean;
  active: boolean;
  iconType: 'info' | 'warning' | 'check' | 'none';
  link?: string;
  linkText?: string;
  createdAt: string;
}

export interface AdminSettings {
  maintenance: {
    enabled: boolean;
    title: string;
    message: string;
    estimatedReturn: string;
  };
  emergency: {
    enabled: boolean;
    message: string;
    style: 'warning' | 'error';
  };
  features: {
    search: boolean;
    myList: boolean;
    trailers: boolean;
    recommendations: boolean;
  };
}

export interface ActivityEntry {
  id: string;
  action: string;
  target: string;
  details?: string;
  timestamp: string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: AdminSettings = {
  maintenance: {
    enabled: false,
    title: 'Under Maintenance',
    message: 'We are performing scheduled maintenance. Please check back soon.',
    estimatedReturn: '',
  },
  emergency: { enabled: false, message: 'Important update in progress.', style: 'warning' },
  features: { search: true, myList: true, trailers: true, recommendations: true },
};

// ─── Storage helpers ──────────────────────────────────────────────────────────

const K = {
  popups:   'qelo-admin-popups',
  notifs:   'qelo-admin-notifications',
  banners:  'qelo-admin-banners',
  settings: 'qelo-admin-settings',
  activity: 'qelo-admin-activity',
  dp: 'qelo-dismissed-popups',
  dn: 'qelo-dismissed-notifs',
  db: 'qelo-dismissed-banners',
  attempts: 'qelo-admin-attempts',
};

function ls<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { return (JSON.parse(localStorage.getItem(key) ?? 'null') as T) ?? fallback; }
  catch { return fallback; }
}
function ss<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { return (JSON.parse(sessionStorage.getItem(key) ?? 'null') as T) ?? fallback; }
  catch { return fallback; }
}
function set(key: string, val: unknown): void {
  localStorage.setItem(key, JSON.stringify(val));
  if (typeof window !== 'undefined')
    window.dispatchEvent(new CustomEvent('qelo-admin-update', { detail: { key } }));
}

// ─── Popups ───────────────────────────────────────────────────────────────────

export const getPopups = (): AdminPopup[] => {
  const raw = ls<Record<string, unknown>[]>(K.popups, []);
  const validStyles: AdminPopup['style'][] = ['dark','info','warning','success','error'];
  const validStatuses: AdminPopup['status'][] = ['active','paused','draft','scheduled'];
  return raw.map(p => ({
    id: String(p.id ?? uid()),
    status: validStatuses.includes(p.status as AdminPopup['status'])
      ? (p.status as AdminPopup['status'])
      : (p.active === false ? 'paused' : 'active'),
    title: p.title as string | undefined,
    message: String(p.message ?? ''),
    buttons: (p.buttons as AdminButton[]) ?? [],
    style: validStyles.includes(p.style as AdminPopup['style']) ? (p.style as AdminPopup['style']) : 'dark',
    delay: Number(p.delay ?? 0),
    autoDismiss: Number(p.autoDismiss ?? 0),
    targetPages: (p.targetPages as string[]) ?? [],
    showOnce: Boolean(p.showOnce ?? false),
    priority: Number(p.priority ?? 5),
    scheduledAt: p.scheduledAt as string | undefined,
    expiresAt: p.expiresAt as string | undefined,
    isTemplate: Boolean(p.isTemplate ?? false),
    impressions: Number(p.impressions ?? 0),
    clicks: Number(p.clicks ?? 0),
    createdAt: String(p.createdAt ?? new Date().toISOString()),
    updatedAt: String(p.updatedAt ?? p.createdAt ?? new Date().toISOString()),
  }));
};
export const savePopups = (p: AdminPopup[]): void => set(K.popups, p);

export const getActivePopups = (): AdminPopup[] => {
  const now = new Date();
  return getPopups()
    .filter(p => {
      if (p.isTemplate || p.status === 'draft' || p.status === 'paused') return false;
      if (p.expiresAt && new Date(p.expiresAt) <= now) return false;
      if (p.status === 'scheduled') {
        if (!p.scheduledAt || new Date(p.scheduledAt) > now) return false;
      }
      return true;
    })
    .sort((a, b) => b.priority - a.priority);
};

export const trackPopupImpression = (id: string): void => {
  const list = getPopups().map(p => p.id === id ? { ...p, impressions: p.impressions + 1 } : p);
  localStorage.setItem(K.popups, JSON.stringify(list));
};
export const trackPopupClick = (id: string): void => {
  const list = getPopups().map(p => p.id === id ? { ...p, clicks: p.clicks + 1 } : p);
  localStorage.setItem(K.popups, JSON.stringify(list));
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const getNotifications = (): AdminNotification[] => ls<AdminNotification[]>(K.notifs, []);
export const saveNotifications = (n: AdminNotification[]): void => set(K.notifs, n);
export const getActiveNotifications = (): AdminNotification[] =>
  getNotifications().filter(n => n.status === 'active');

export const trackNotifDelivery = (id: string): void => {
  const list = getNotifications().map(n => n.id === id ? { ...n, deliveries: n.deliveries + 1 } : n);
  localStorage.setItem(K.notifs, JSON.stringify(list));
};

// ─── Banners ──────────────────────────────────────────────────────────────────

export const getBanners = (): AdminBanner[] => ls<AdminBanner[]>(K.banners, []);
export const saveBanners = (b: AdminBanner[]): void => set(K.banners, b);

// ─── Settings ─────────────────────────────────────────────────────────────────

export const getSettings = (): AdminSettings => {
  const stored = ls<Partial<AdminSettings>>(K.settings, {});
  return {
    maintenance: { ...DEFAULT_SETTINGS.maintenance, ...(stored.maintenance ?? {}) },
    emergency:   { ...DEFAULT_SETTINGS.emergency,   ...(stored.emergency   ?? {}) },
    features:    { ...DEFAULT_SETTINGS.features,    ...(stored.features    ?? {}) },
  };
};
export const saveSettings = (s: AdminSettings): void => set(K.settings, s);

// ─── Activity log ─────────────────────────────────────────────────────────────

export const getActivity = (): ActivityEntry[] => ls<ActivityEntry[]>(K.activity, []);

export const addActivity = (action: string, target: string, details?: string): ActivityEntry => {
  const entry: ActivityEntry = { id: uid(), action, target, details, timestamp: new Date().toISOString() };
  const list = [entry, ...getActivity().slice(0, 199)];
  localStorage.setItem(K.activity, JSON.stringify(list));
  return entry;
};

// ─── Dismissed tracking (session) ────────────────────────────────────────────

export const isPopupDismissed = (id: string) => ss<string[]>(K.dp, []).includes(id);
export const markPopupDismissed = (id: string): void => {
  sessionStorage.setItem(K.dp, JSON.stringify([...ss<string[]>(K.dp, []), id]));
};

export const isNotifDismissed = (id: string) => ss<string[]>(K.dn, []).includes(id);
export const markNotifDismissed = (id: string): void => {
  sessionStorage.setItem(K.dn, JSON.stringify([...ss<string[]>(K.dn, []), id]));
};

export const isBannerDismissed = (id: string) => ss<string[]>(K.db, []).includes(id);
export const markBannerDismissed = (id: string): void => {
  sessionStorage.setItem(K.db, JSON.stringify([...ss<string[]>(K.db, []), id]));
};

// ─── Brute-force protection ───────────────────────────────────────────────────

interface LoginAttempts { count: number; lockedUntil?: number; }

export const getLoginAttempts = (): LoginAttempts => ls<LoginAttempts>(K.attempts, { count: 0 });

export const recordFailedAttempt = (): LoginAttempts => {
  const { count: prev } = getLoginAttempts();
  const count = prev + 1;
  const lockedUntil = count >= 5 ? Date.now() + 5 * 60 * 1000 : undefined;
  const updated: LoginAttempts = { count, lockedUntil };
  localStorage.setItem(K.attempts, JSON.stringify(updated));
  return updated;
};

export const clearLoginAttempts = (): void => localStorage.removeItem(K.attempts);

export const checkLockout = (): { locked: boolean; remainingSecs?: number } => {
  const { lockedUntil } = getLoginAttempts();
  if (!lockedUntil) return { locked: false };
  const ms = lockedUntil - Date.now();
  if (ms <= 0) { localStorage.removeItem(K.attempts); return { locked: false }; }
  return { locked: true, remainingSecs: Math.ceil(ms / 1000) };
};

// ─── Export / Import ──────────────────────────────────────────────────────────

export const exportData = (): void => {
  const data = {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    popups: getPopups(),
    notifications: getNotifications(),
    banners: getBanners(),
    settings: getSettings(),
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  a.download = `qelomovie-admin-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
};

export const importData = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = e => {
      try {
        const d = JSON.parse(e.target?.result as string);
        if (d.popups) savePopups(d.popups);
        if (d.notifications) saveNotifications(d.notifications);
        if (d.banners) saveBanners(d.banners);
        if (d.settings) saveSettings({ ...DEFAULT_SETTINGS, ...d.settings });
        const total = (d.popups?.length ?? 0) + (d.notifications?.length ?? 0) + (d.banners?.length ?? 0);
        resolve(`Successfully imported ${total} items`);
      } catch { reject(new Error('Invalid or corrupted file')); }
    };
    r.readAsText(file);
  });

// ─── Utility ──────────────────────────────────────────────────────────────────

export const uid = (): string => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
