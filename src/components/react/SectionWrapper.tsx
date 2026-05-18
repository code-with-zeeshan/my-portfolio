"use client";

import { useState, useEffect } from "react";

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
  storageKey = "section_visibility",
  children,
}: SectionWrapperProps) {
  const [isVisible, setIsVisible] = useState<boolean | null>(null);

  useEffect(() => {
    const checkVisibility = () => {
      if (typeof window === "undefined") return true;
      
      try {
        const stored = localStorage.getItem(storageKey);
        if (!stored) return true;
        
        const settings: VisibilitySettings = JSON.parse(stored);
        const visible = settings[sectionId as keyof VisibilitySettings] ?? true;
        setIsVisible(visible);
      } catch {
        setIsVisible(true);
      }
    };

    checkVisibility();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey) {
        checkVisibility();
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