// src/components/react/AnalyticsDisplay.tsx
"use client";

import { useState } from "react";
import { getProvider, type AnalyticsProvider } from "@/components/react/AnalyticsProvider";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AnalyticsDisplay() {
  const [provider] = useState<AnalyticsProvider>(getProvider());

  if (provider === "none") {
    return (
      <Card variant="bordered" className="bg-white dark:bg-zinc-900 p-8">
        <EmptyState
          title="Analytics Disabled"
          description="Analytics are currently disabled. Select a provider above to view real-time data."
        />
      </Card>
    );
  }

  if (provider === "vercel") {
    return (
      <Card variant="bordered" className="bg-white dark:bg-zinc-900 p-8">
        <EmptyState
          title="Vercel Analytics"
          description="Real-time analytics data is available in your Vercel dashboard. Visit your project analytics page to view detailed metrics."
        />
        <div className="mt-4">
          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Open Vercel Dashboard
          </a>
        </div>
      </Card>
    );
  }

  if (provider === "plausible") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Configure your Plausible API key and domain in environment variables to view real-time analytics data.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Visitors
            </p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              --
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Pageviews
            </p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              --
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (provider === "posthog") {
    return (
      <Card variant="bordered" className="bg-white dark:bg-zinc-900 p-8">
        <EmptyState
          title="PostHog Analytics"
          description="Real-time analytics data is available in your PostHog dashboard. Visit your project dashboard to view detailed metrics and insights."
        />
        <div className="mt-4">
          <a
            href="https://us.posthog.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Open PostHog Dashboard
          </a>
        </div>
      </Card>
    );
  }

  if (provider === "umami") {
    return (
      <Card variant="bordered" className="bg-white dark:bg-zinc-900 p-8">
        <EmptyState
          title="Umami Analytics"
          description="Real-time analytics data is available in your Umami dashboard. Visit your Umami instance to view detailed metrics."
        />
        <div className="mt-4">
          <a
            href="https://umami.is"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Open Umami Dashboard
          </a>
        </div>
      </Card>
    );
  }

  return null;
}