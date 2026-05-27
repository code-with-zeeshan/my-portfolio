"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getCachedQuery, setCachedQuery } from "@/lib/queryCache";

const CACHE_KEY = "section_visibility";

interface SectionWrapperProps {
  sectionId: string;
  storageKey?: string;
  children: React.ReactNode;
}

interface VisibilitySettings {
  projects?: boolean;
  skills?: boolean;
  experience?: boolean;
  testimonials?: boolean;
  blog?: boolean;
}

export default function SectionWrapper({
  sectionId,
  storageKey = CACHE_KEY,
  children,
}: SectionWrapperProps) {
  const [isVisible, setIsVisible] = useState<boolean | null>(null);

  useEffect(() => {
    const applySettings = (settings: VisibilitySettings | null) => {
      if (!settings) return;
      const visible = settings[sectionId as keyof VisibilitySettings] ?? true;
      setIsVisible(visible);
    };

    // 1. Read from localStorage instantly
    const localRead = (): VisibilitySettings | null => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (!stored) return null;
        return JSON.parse(stored) as VisibilitySettings;
      } catch {
        return null;
      }
    };

    const local = localRead();
    if (local) applySettings(local);

    // 2. Fetch from Supabase (authoritative source) in parallel
    const cached = getCachedQuery<VisibilitySettings>(CACHE_KEY);
    if (cached) {
      applySettings(cached);
      localStorage.setItem(storageKey, JSON.stringify(cached));
      return;
    }

    supabase
      .from("app_settings")
      .select("value")
      .eq("key", CACHE_KEY)
      .single()
      .then(({ data, error }) => {
        if (error || !data) return;
        const settings = data.value as VisibilitySettings;
        setCachedQuery(CACHE_KEY, settings);
        localStorage.setItem(storageKey, JSON.stringify(settings));
        applySettings(settings);
      });

    // 3. Listen for cross-tab changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey) {
        const fresh = localRead();
        if (fresh) applySettings(fresh);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [sectionId, storageKey]);

  if (isVisible === null) {
    return <>{children}</>;
  }

  return isVisible ? <>{children}</> : null;
}