// src/components/react/AnalyticsProvider.tsx
// Plug-and-play analytics provider switcher
// Supports: Vercel Analytics, Plausible (cloud + self-hosted)
// Priority: localStorage > env variable
"use client";

import { useEffect, useState } from "react";

// ── Provider type ──
export type AnalyticsProvider = "vercel" | "plausible" | "posthog" | "umami" | "none";

// ── Storage key ──
const STORAGE_KEY = "analytics_provider";

// ── Get provider from localStorage or env ──
export function getProvider(): AnalyticsProvider {
  // Check localStorage first (user selection from admin)
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && ["vercel", "plausible", "posthog", "umami", "none"].includes(stored)) {
    return stored as AnalyticsProvider;
  }

  // Fall back to env variable
  const val = (import.meta as any).env?.PUBLIC_ANALYTICS_PROVIDER ?? "vercel";
  const validProviders: AnalyticsProvider[] = ["vercel", "plausible", "posthog", "umami", "none"];
  if (validProviders.includes(val as AnalyticsProvider)) {
    return val as AnalyticsProvider;
  }
  console.warn(`Invalid PUBLIC_ANALYTICS_PROVIDER: ${val}, using default`);
  return "vercel";
}

// ── Save provider to localStorage (called from AdminDashboard) ──
export function setAnalyticsProvider(provider: AnalyticsProvider): void {
  localStorage.setItem(STORAGE_KEY, provider);
}

// ── Clear provider (use env variable) ──
export function clearAnalyticsProvider(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Plausible config ──
function getPlausibleConfig() {
  const env = import.meta.env;
  return {
    // For cloud: https://plausible.io/js/script.js
    // For self-hosted: https://your-domain.com/js/script.js
    scriptSrc:  (env.PUBLIC_PLAUSIBLE_SCRIPT_URL as string | undefined)
                  ?? "https://plausible.io/js/script.js",
    domain:     (env.PUBLIC_PLAUSIBLE_DOMAIN as string | undefined) ?? "",
    // Self-hosted API endpoint override
    apiHost:    (env.PUBLIC_PLAUSIBLE_API_HOST as string | undefined) ?? "",
  };
}

// ── Inject Plausible script dynamically ──
function injectPlausible() {
  const { scriptSrc, domain, apiHost } = getPlausibleConfig();
  if (!domain) return;

  // Avoid duplicate injection
  if (document.querySelector(`script[data-domain="${domain}"]`)) return;

  const script = document.createElement("script");
  script.src             = scriptSrc;
  script.defer           = true;
  script.dataset.domain = domain;

  // Self-hosted API endpoint
  if (apiHost) {
    script.dataset.api = `${apiHost}/api/event`;
  }

  document.head.appendChild(script);
}

// ── Track a page view manually (for SPAs) ──
export function trackPageView(url?: string) {
  const provider = getProvider();

  if (provider === "plausible") {
    const w = window as any;
    if (w.plausible) {
      w.plausible("pageview", url ? { props: { url } } : undefined);
    }
  }
}

// ── Track custom events ──
export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
) {
  const provider = getProvider();

  if (provider === "plausible") {
    const w = window as any;
    if (w.plausible) w.plausible(eventName, props ? { props } : undefined);
  }

  if (provider === "vercel") {
    const w = window as any;
    if (w.va) w.va("event", { name: eventName, data: props });
  }

  if (provider === "posthog") {
    const w = window as any;
    if (w.posthog) w.posthog.capture(eventName, props);
  }

  // Umami doesn't have custom event tracking in the same way
}

// ── React component — mounts provider on client ──
export default function AnalyticsProvider() {
  const [provider, setProvider] = useState<AnalyticsProvider>("vercel");

  useEffect(() => {
    // Get provider (from localStorage or env)
    const p = getProvider();
    setProvider(p);

    if (p === "plausible") {
      injectPlausible();
    }
    // Vercel Analytics is injected via BaseLayout
  }, []);

  // This component renders nothing — side-effects only
  return null;
}
