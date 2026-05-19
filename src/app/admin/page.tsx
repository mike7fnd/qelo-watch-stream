'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, AlertCircle, Lock, Mail, ArrowRight, RefreshCw } from 'lucide-react';
import {
  checkLockout,
  recordFailedAttempt,
  clearLoginAttempts,
  getLoginAttempts,
} from '@/lib/admin-store';

const ADMIN_EMAIL = 'mikefernandex227@gmail.com';
const ADMIN_PASSWORD = 'mikesheil';
const MAX_ATTEMPTS = 5;

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lockout, setLockout] = useState<{ locked: boolean; remainingSecs?: number }>({ locked: false });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem('qelo-admin-auth') === 'true') {
      router.replace('/admin/dashboard');
      return;
    }
    const status = checkLockout();
    setLockout(status);
    if (status.locked) startCountdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const status = checkLockout();
      setLockout(status);
      if (!status.locked) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
      }
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const status = checkLockout();
    if (status.locked) return;

    setLoading(true);
    setError('');

    setTimeout(() => {
      if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        clearLoginAttempts();
        sessionStorage.setItem('qelo-admin-auth', 'true');
        router.push('/admin/dashboard');
      } else {
        const result = recordFailedAttempt();
        if (result.lockedUntil) {
          setLockout({ locked: true, remainingSecs: Math.ceil((result.lockedUntil - Date.now()) / 1000) });
          startCountdown();
          setError('');
        } else {
          const remaining = MAX_ATTEMPTS - result.count;
          setError(
            remaining > 0
              ? `Invalid credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
              : 'Too many failed attempts.'
          );
        }
        setLoading(false);
      }
    }, 700);
  };

  const { count } = getLoginAttempts();
  const minutesSecs = lockout.remainingSecs
    ? `${Math.floor((lockout.remainingSecs) / 60)}:${String((lockout.remainingSecs) % 60).padStart(2, '0')}`
    : '';

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-[380px] space-y-6">
        {/* Brand */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600 shadow-xl shadow-red-900/40">
            <Shield size={26} className="text-white" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Access</h1>
            <p className="text-zinc-500 text-sm mt-1">QeloMovie Control Panel</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
          {lockout.locked ? (
            /* Lockout state */
            <div className="space-y-5">
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800/50 flex items-center justify-center">
                  <Lock size={20} className="text-red-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">Account Temporarily Locked</p>
                  <p className="text-zinc-400 text-sm mt-1">
                    Too many failed attempts. Try again in
                  </p>
                  <p className="text-3xl font-bold text-red-400 mt-3 tabular-nums">{minutesSecs}</p>
                  <p className="text-zinc-600 text-xs mt-1">minutes : seconds</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50 text-xs text-zinc-400 text-center">
                After the lockout period, you may try again with the correct credentials.
              </div>
            </div>
          ) : (
            /* Login form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Attempt warning */}
              {count > 0 && count < MAX_ATTEMPTS && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-800/50">
                  <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
                  <p className="text-amber-300 text-xs">
                    {MAX_ATTEMPTS - count} attempt{MAX_ATTEMPTS - count !== 1 ? 's' : ''} remaining before lockout
                  </p>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    autoComplete="email"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-950/50 border border-red-900/60">
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-lg shadow-red-900/30 mt-1"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-zinc-700 text-xs">
          Protected area — unauthorized access is prohibited
        </p>
      </div>
    </div>
  );
}
