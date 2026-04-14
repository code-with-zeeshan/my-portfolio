// src/hooks/useDarkMode.ts
"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect and toggle dark mode
 * Replaces duplicate dark mode detection logic across multiple components:
 * - ThemeToggle.tsx
 * - MobileNav.tsx
 * - MarkdownEditor.tsx
 * 
 * Usage:
 *   const { isDark, toggleDark } = useDarkMode();
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial dark mode state
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();

    // Listen for theme changes
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ["class"] 
    });
    
    return () => observer.disconnect();
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  return {
    isDark,
    setIsDark,
    toggleDark,
  };
}

export default useDarkMode;