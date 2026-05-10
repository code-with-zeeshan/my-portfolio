"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CronSecretGenerator, CSRFSecretGenerator } from "@/components/react/SecretGenerator";

export default function SettingsTab() {
  return (
    <div className="space-y-6">
      {/* ── CRON_SECRET generator ── */}
      <CronSecretGenerator />

      {/* ── CSRF_SECRET generator ── */}
      <CSRFSecretGenerator />

      {/* ── Environment Variables Info ── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
          Environment Variables Guide
        </h3>
        <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
            <p className="font-medium text-zinc-900 dark:text-zinc-50 mb-1">.env file (local development)</p>
            <pre className="block whitespace-pre bg-zinc-100 dark:bg-zinc-900 p-2 rounded text-xs text-zinc-900 dark:text-zinc-50">CRON_SECRET=your_cron_secret_here CSRF_SECRET=your_csrf_secret_here</pre>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
            <p className="font-medium text-zinc-900 dark:text-zinc-50 mb-1">Vercel (Production)</p>
            <p>Go to Project → Settings → Environment Variables and add both secrets.</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">⚠️ Important</p>
            <p className="text-amber-700 dark:text-amber-300">
              After updating environment variables on Vercel, you must redeploy your project for changes to take effect.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}