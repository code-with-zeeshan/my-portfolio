"use client";

import React from "react";
import AnalyticsDisplay from "@/components/react/AnalyticsDisplay";
import { setAnalyticsProvider, type AnalyticsProvider } from "@/components/react/AnalyticsProvider";

export default function AnalyticsTab({
  notify,
}: {
  notify: (type: "success" | "error", message: string) => void;
}) {
  const handleProviderChange = (value: string) => {
    setAnalyticsProvider(value as AnalyticsProvider);
    setAnalyticsProviderState(value as AnalyticsProvider);
    notify("success", `Analytics provider set to ${value}. Refreshing page...`);
    setTimeout(() => window.location.reload(), 1000);
  };

  const [, setAnalyticsProviderState] = React.useState<AnalyticsProvider>("vercel");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
          Analytics Provider
        </h2>
        <p className="text-xs text-zinc-500 mb-4">
          Current: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
            {(import.meta as any).env?.PUBLIC_ANALYTICS_PROVIDER ?? "vercel"}
          </code>
          {" "}— change by setting <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">PUBLIC_ANALYTICS_PROVIDER</code> in your environment
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "vercel", label: "Vercel Analytics", desc: "Auto-injected, zero config" },
            { value: "plausible", label: "Plausible", desc: "Privacy-focused analytics" },
            { value: "posthog", label: "PostHog", desc: "Product analytics, heatmaps" },
            { value: "umami", label: "Umami", desc: "Simple analytics" },
            { value: "none", label: "None", desc: "Disable analytics" },
          ].map((opt) => {
            const current = (localStorage.getItem("analytics_provider") as AnalyticsProvider)
              || (import.meta as any).env?.PUBLIC_ANALYTICS_PROVIDER
              || "vercel";
            const isActive = current === opt.value;
            return (
              <div
                key={opt.value}
                className={`rounded-xl border p-4 flex-1 min-w-[160px] ${
                  isActive
                    ? "border-brand-500 bg-brand-500/5"
                    : "border-zinc-200 dark:border-zinc-700"
                }`}
              >
                <p className={`text-sm font-medium ${isActive ? "text-brand-500" : "text-zinc-900 dark:text-zinc-50"}`}>
                  {isActive ? "✅ " : ""}{opt.label}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{opt.desc}</p>
                <button
                  type="button"
                  onClick={() => handleProviderChange(opt.value)}
                  className={`mt-3 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400 cursor-default"
                      : "bg-brand-500 text-white hover:bg-brand-600"
                  }`}
                  disabled={isActive}
                >
                  {isActive ? "Active" : "Select"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <AnalyticsDisplay />
    </div>
  );
}