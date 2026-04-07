// src/components/react/PlausibleAnalytics.tsx
// Plausible Stats API integration for admin analytics tab
"use client";

import { useState, useEffect } from "react";
import ReactIcon from "@/components/react/ReactIcon";

interface StatsData {
  visitors: number;
  pageviews: number;
  bounceRate: number;
  visitDuration: number;
}

interface TopPage {
  page: string;
  visitors: number;
}

interface TopReferrer {
  source: string;
  visitors: number;
}

type Period = "day" | "7d" | "30d" | "month";

const PERIOD_LABELS: Record<Period, string> = {
  day:   "Today",
  "7d":  "Last 7 days",
  "30d": "Last 30 days",
  month: "This month",
};

// ─── Stat Card ───
function StatCard({
  label,
  value,
  icon,
  sub,
}: {
  label: string;
  value: string | number;
  icon: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {label}
        </p>
        <div className="text-brand-500">
          <ReactIcon name={icon} size={16} />
        </div>
      </div>
      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {sub && <p className="text-xs text-zinc-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function PlausibleAnalytics() {
  const [period,   setPeriod]   = useState<Period>("7d");
  const [stats,    setStats]    = useState<StatsData | null>(null);
  const [pages,    setPages]    = useState<TopPage[]>([]);
  const [refs,     setRefs]     = useState<TopReferrer[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // ─── Env vars (Plausible API key + site domain) ───
  // These are PUBLIC_ because they run client-side in the React island
  // The API key only has read access — safe to expose for personal admin use
  const apiKey = (import.meta as any).env?.PUBLIC_PLAUSIBLE_API_KEY ?? "";
  const domain = (import.meta as any).env?.PUBLIC_PLAUSIBLE_DOMAIN ?? "";

  const hasCredentials = Boolean(apiKey && domain);

  useEffect(() => {
    if (!hasCredentials) return;
    fetchStats();
  }, [period]);

  async function fetchStats() {
    setLoading(true);
    setError(null);

    try {
      const headers = { Authorization: `Bearer ${apiKey}` };
      const base = "https://plausible.io/api/v1";
      const params = `site_id=${domain}&period=${period}`;

      // Fetch aggregate stats + top pages + top referrers in parallel
      const [aggRes, pagesRes, refsRes] = await Promise.all([
        fetch(`${base}/stats/aggregate?${params}&metrics=visitors,pageviews,bounce_rate,visit_duration`, { headers }),
        fetch(`${base}/stats/breakdown?${params}&property=event:page&limit=8`, { headers }),
        fetch(`${base}/stats/breakdown?${params}&property=visit:source&limit=8`, { headers }),
      ]);

      if (!aggRes.ok) {
        throw new Error(`Plausible API error: ${aggRes.status} ${aggRes.statusText}`);
      }

      const [aggData, pagesData, refsData] = await Promise.all([
        aggRes.json(),
        pagesRes.json(),
        refsRes.json(),
      ]);

      setStats({
        visitors:      aggData.results.visitors?.value      ?? 0,
        pageviews:     aggData.results.pageviews?.value     ?? 0,
        bounceRate:    aggData.results.bounce_rate?.value   ?? 0,
        visitDuration: aggData.results.visit_duration?.value ?? 0,
      });

      setPages(
        (pagesData.results ?? []).map((r: any) => ({
          page:     r.page,
          visitors: r.visitors,
        }))
      );

      setRefs(
        (refsData.results ?? []).map((r: any) => ({
          source:   r.source,
          visitors: r.visitors,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  // ─── No credentials configured ───
  if (!hasCredentials) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700 space-y-4">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-brand-500/10">
          <ReactIcon name="star" size={24} className="text-brand-500" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Connect Plausible Analytics
        </h2>
        <p className="text-sm text-zinc-500 max-w-sm mx-auto">
          Add your Plausible API credentials to see visitor stats directly in your admin panel.
        </p>
        <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-4 text-left max-w-sm mx-auto">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
            Add to .env and Vercel:
          </p>
          <code className="text-xs text-brand-500 block">
            PUBLIC_PLAUSIBLE_API_KEY=your_api_key
          </code>
          <code className="text-xs text-brand-500 block mt-1">
            PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
          </code>
        </div>
        <p className="text-xs text-zinc-400">
          Get your API key at{" "}
          <a
            href="https://plausible.io/settings"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-500 hover:underline"
          >
            plausible.io/settings
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header + Period Selector ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Analytics</h1>
        <div className="flex gap-1 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error State ── */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          ❌ {error}
        </div>
      )}

      {/* ── Stats Grid ── */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Unique Visitors"
            value={stats.visitors}
            icon="user"
            sub={PERIOD_LABELS[period]}
          />
          <StatCard
            label="Page Views"
            value={stats.pageviews}
            icon="external-link"
            sub={PERIOD_LABELS[period]}
          />
          <StatCard
            label="Bounce Rate"
            value={`${stats.bounceRate}%`}
            icon="arrow-right"
            sub="Lower is better"
          />
          <StatCard
            label="Avg. Visit Duration"
            value={
              stats.visitDuration >= 60
                ? `${Math.floor(stats.visitDuration / 60)}m ${stats.visitDuration % 60}s`
                : `${stats.visitDuration}s`
            }
            icon="calendar"
            sub="Per session"
          />
        </div>
      ) : null}

      {/* ── Top Pages + Referrers ── */}
      {!loading && stats && (
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Top Pages */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Top Pages
            </h3>
            {pages.length > 0 ? (
              <div className="space-y-3">
                {pages.map((page) => {
                  const max = pages[0]?.visitors ?? 1;
                  const pct = Math.round((page.visitors / max) * 100);
                  return (
                    <div key={page.page}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400 font-mono truncate max-w-[200px]">
                          {page.page}
                        </span>
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 ml-2 shrink-0">
                          {page.visitors.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">No page data available</p>
            )}
          </div>

          {/* Top Referrers */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Top Referrers
            </h3>
            {refs.length > 0 ? (
              <div className="space-y-3">
                {refs.map((ref) => {
                  const max = refs[0]?.visitors ?? 1;
                  const pct = Math.round((ref.visitors / max) * 100);
                  return (
                    <div key={ref.source}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400 truncate max-w-[200px]">
                          {ref.source || "Direct / None"}
                        </span>
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 ml-2 shrink-0">
                          {ref.visitors.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-500/70 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">No referrer data available</p>
            )}
          </div>
        </div>
      )}

      {/* ── Plausible Dashboard Link ── */}
      <div className="text-center">
        <a
          href={`https://plausible.io/${domain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-brand-500 hover:underline"
        >
          Open full Plausible dashboard →
        </a>
      </div>
    </div>
  );
}