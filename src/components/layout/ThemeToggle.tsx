// src/components/layout/ThemeToggle.tsx
"use client";

import { useState, useEffect, useRef } from "react";

export default function ThemeToggle() {
  const [theme,   setTheme]   = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    const stored     = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial    = stored || (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");

    return () => {
      const overlays = document.querySelectorAll('[data-theme-overlay="true"]');
      overlays.forEach((el) => {
        if (document.body.contains(el)) {
          el.remove();
        }
      });
    };
  }, []);

  const toggleTheme = async (e: React.MouseEvent) => {
    const next = theme === "light" ? "dark" : "light";

    if (!btnRef.current || !document.startViewTransition) {
      setTheme(next);
      localStorage.setItem("theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return;
    }

    // Get moon icon center for the spread origin
    const rect = btnRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Calculate distance to farthest corner to ensure full coverage
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setTheme(next);
      localStorage.setItem("theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 800, // Slow spread for "water" feel
          easing: "cubic-bezier(0.4, 0, 0.2, 1)", // Organic ease
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden="true" />;
  }

  return (
    <button
      ref={btnRef}
      onClick={toggleTheme}
      className={`
        relative rounded-full p-2 text-zinc-500 transition-colors
        hover:bg-zinc-100 hover:text-zinc-900
        dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100
      `}
      style={{ zIndex: 2 }}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
        {theme === "light" ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2"/><path d="M12 20v2"/>
            <path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>
            <path d="M2 12h2"/><path d="M20 12h2"/>
            <path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
          </svg>
        )}
      </button>
    );
}
