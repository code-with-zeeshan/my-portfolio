"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { CronSecretGenerator, CSRFSecretGenerator } from "@/components/react/SecretGenerator";

interface SectionVisibility {
  projects: boolean;
  skills: boolean;
  experience: boolean;
  testimonials: boolean;
  blog: boolean;
}

const DEFAULT_VISIBILITY: SectionVisibility = {
  projects: true,
  skills: true,
  experience: true,
  testimonials: true,
  blog: true,
};

const SETTINGS_KEY = "section_visibility";
const STATIC_DATA_KEY = "section_use_static";

interface ToggleProps {
  label: string;
  description: string;
  checked: boolean;
  useStaticData?: boolean;
  onChange: (checked: boolean) => void;
  onStaticDataChange?: (checked: boolean) => void;
}

function Toggle({ label, description, checked, useStaticData, onChange, onStaticDataChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{label}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
        {onStaticDataChange && (
          <button
            type="button"
            onClick={() => onStaticDataChange(!useStaticData)}
            className={`mt-2 inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border transition-colors ${
              useStaticData
                ? "bg-brand-500/10 border-brand-500 text-brand-500"
                : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Use Static Data
          </button>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
          checked ? "bg-brand-500" : "bg-zinc-300 dark:bg-zinc-600"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsTab() {
  const [visibility, setVisibility] = useState<SectionVisibility>(DEFAULT_VISIBILITY);
  const [useStatic, setUseStatic] = useState<SectionVisibility>({
    projects: false,
    skills: false,
    experience: false,
    testimonials: false,
    blog: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadVisibility() {
      // First check localStorage for instant load
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
          try {
            setVisibility({ ...DEFAULT_VISIBILITY, ...JSON.parse(stored) });
          } catch {}
        }

        const staticStored = localStorage.getItem(STATIC_DATA_KEY);
        if (staticStored) {
          try {
            setUseStatic({ ...useStatic, ...JSON.parse(staticStored) });
          } catch {}
        }
      }

      // Then sync with Supabase
      try {
        const { data, error } = await supabase
          .from("app_settings")
          .select("value")
          .eq("key", SETTINGS_KEY)
          .single();

        if (!error && data) {
          const dbVisibility = { ...DEFAULT_VISIBILITY, ...(data.value as Partial<SectionVisibility>) };
          setVisibility(dbVisibility);
          // Sync to localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(dbVisibility));
          }
        }
      } catch (err) {
        console.error("[Settings] Failed to load visibility:", err);
      } finally {
        setLoading(false);
      }
    }
    loadVisibility();
  }, []);

  const updateVisibility = useCallback(async (key: keyof SectionVisibility, value: boolean) => {
    setSaving(true);
    const updated = { ...visibility, [key]: value };
    setVisibility(updated);

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    }

    try {
      await supabase
        .from("app_settings")
        .upsert(
          {
            key: SETTINGS_KEY,
            value: updated,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );
    } catch (err) {
      setVisibility(visibility);
    } finally {
      setSaving(false);
    }
  }, [visibility]);

  const updateStaticData = useCallback((key: keyof SectionVisibility, value: boolean) => {
    const updated = { ...useStatic, [key]: value };
    setUseStatic(updated);

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STATIC_DATA_KEY, JSON.stringify(updated));
    }
  }, [useStatic]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Main grid: Left column (Section Visibility + Env Guide) + Right column (Secret Generators) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Section Visibility ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Section Visibility
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Toggle sections to show or hide on your portfolio
                </p>
              </div>
              {saving && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Saving...</span>
              )}
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <Toggle
                label="Projects"
                description="Show projects section on homepage"
                checked={visibility.projects}
                useStaticData={useStatic.projects}
                onChange={(v) => updateVisibility("projects", v)}
                onStaticDataChange={(v) => updateStaticData("projects", v)}
              />
              <Toggle
                label="Skills"
                description="Show skills section on homepage"
                checked={visibility.skills}
                useStaticData={useStatic.skills}
                onChange={(v) => updateVisibility("skills", v)}
                onStaticDataChange={(v) => updateStaticData("skills", v)}
              />
              <Toggle
                label="Experience"
                description="Show experience section on homepage"
                checked={visibility.experience}
                useStaticData={useStatic.experience}
                onChange={(v) => updateVisibility("experience", v)}
                onStaticDataChange={(v) => updateStaticData("experience", v)}
              />
              <Toggle
                label="Testimonials"
                description="Show testimonials section on homepage"
                checked={visibility.testimonials}
                useStaticData={useStatic.testimonials}
                onChange={(v) => updateVisibility("testimonials", v)}
                onStaticDataChange={(v) => updateStaticData("testimonials", v)}
              />
              <Toggle
                label="Blog"
                description="Show blog section on homepage"
                checked={visibility.blog}
                useStaticData={useStatic.blog}
                onChange={(v) => updateVisibility("blog", v)}
                onStaticDataChange={(v) => updateStaticData("blog", v)}
              />
            </div>
          </div>

          {/* ── Environment Variables Guide (aligned with Section Visibility) ── */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              Environment Variables Guide
            </h3>
            <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
                <p className="font-medium text-zinc-900 dark:text-zinc-50 mb-1">.env file (local development)</p>
                <pre className="block whitespace-pre bg-zinc-100 dark:bg-zinc-900 p-2 rounded text-xs text-zinc-900 dark:text-zinc-50">{"CRON_SECRET=your_cron_secret_here\nCSRF_SECRET=your_csrf_secret_here"}</pre>
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

        {/* ── Right: Secret Generators (stacked, will expand vertically) ── */}
        <div className="space-y-6">
          <CronSecretGenerator />
          <CSRFSecretGenerator />
        </div>
      </div>
    </div>
  );
}