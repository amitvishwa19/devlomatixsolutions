'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Smartphone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

/**
 * SessionSupersededModal
 * 
 * Displayed on Web when user logs into the Mobile App.
 * Follows an authentic Apple/macOS modal alert style with blurred backdrop,
 * ambient glow, device context, and forced sign-out action.
 */
export default function SessionSupersededModal({
  isOpen = false,
  device = 'Mobile App',
  loggedAt = null,
}) {
  if (!isOpen) return null;

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  const formattedTime = loggedAt
    ? new Date(loggedAt).toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' IST'
    : 'Just now';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Blurred Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl shadow-black/80"
        >
          {/* Ambient Security Glow */}
          <div className="pointer-events-none absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-amber-500/15 blur-3xl" />

          <div className="flex flex-col items-center text-center">
            {/* Security Icon Badge */}
            <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 shadow-inner">
              <ShieldAlert className="h-8 w-8 text-amber-400" />
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-[#0f172a] bg-sky-500 text-white shadow-sm">
                <Smartphone className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold tracking-tight text-white">
              Web Session Ended
            </h2>

            {/* Device Info Badge */}
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active on: {device}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{formattedTime}</span>
            </div>

            {/* Description */}
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Devlomatix enforces strict single-device security. Because your account was just signed in on a mobile device, this web session has been closed.
            </p>

            {/* Action Button */}
            <div className="mt-6 w-full">
              <Button
                onClick={handleSignOut}
                className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:brightness-110"
              >
                <span>Log In Again</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
