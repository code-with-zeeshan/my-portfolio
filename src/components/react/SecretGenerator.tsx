"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

export function CronSecretGenerator() {
  const [secret, setSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setSecret(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await fetch("/api/generate-secret", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setSecret(json.secret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!secret) return;
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
        Generate CRON_SECRET
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
        Use this to protect your scheduled publish endpoint.
        Copy the generated value into your <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">.env</code> file
        and Vercel / GitHub Actions secrets.
      </p>

      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 transition-colors"
      >
        {loading ? "Generating..." : "Generate New Secret"}
      </button>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {secret && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-800">
            <code className="flex-1 text-xs font-mono text-zinc-900 dark:text-zinc-50 break-all select-all">
              {secret}
            </code>
            <button
              type="button"
              onClick={copy}
              className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors"
            >
              {copied ? "✅ Copied!" : "Copy"}
            </button>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/30">
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium mb-1">
              ⚠️ Add this to:
            </p>
            <ol className="text-xs text-amber-600 dark:text-amber-400 space-y-0.5 list-decimal list-inside">
              <li>Your <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">.env</code> file: <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">CRON_SECRET={"<secret>"}</code></li>
              <li>Vercel → Project → Settings → Environment Variables</li>
              <li>GitHub → Repo → Settings → Secrets → Actions</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

export function CSRFSecretGenerator() {
  const [secret, setSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setSecret(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await fetch("/api/generate-secret", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setSecret(json.secret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!secret) return;
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
        Generate CSRF_SECRET
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
        Use this to protect your forms from CSRF attacks.
        Copy the generated value into your <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">.env</code> file
        and Vercel environment variables.
      </p>

      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 transition-colors"
      >
        {loading ? "Generating..." : "Generate New Secret"}
      </button>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {secret && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-800">
            <code className="flex-1 text-xs font-mono text-zinc-900 dark:text-zinc-50 break-all select-all">
              {secret}
            </code>
            <button
              type="button"
              onClick={copy}
              className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors"
            >
              {copied ? "✅ Copied!" : "Copy"}
            </button>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/30">
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium mb-1">
              ⚠️ Add this to:
            </p>
            <ol className="text-xs text-amber-600 dark:text-amber-400 space-y-0.5 list-decimal list-inside">
              <li>Your <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">.env</code> file: <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">CSRF_SECRET={"<secret>"}</code></li>
              <li>Vercel → Project → Settings → Environment Variables</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}