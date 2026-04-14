// src/components/layout/ThemeToggle.tsx
"use client";

import { useState, useEffect, useRef } from "react";

export default function ThemeToggle() {
  const [theme,   setTheme]   = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
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

  const toggleTheme = (e: React.MouseEvent) => {
    if (isAnimating) return;
    
    const next = theme === "light" ? "dark" : "light";
    const rect = btnRef.current?.getBoundingClientRect();

    if (rect) {
      setIsAnimating(true);

      // Calculate center of button
      const originX = Math.round(rect.left + rect.width / 2);
      const originY = Math.round(rect.top + rect.height / 2);

      // Colors: going TO dark = #09090b, going TO light = #fafafa
      const targetBg = next === "dark" ? "#09090b" : "#fafafa";
      const targetText = next === "dark" ? "#f4f4f5" : "#18181b";

      // Create overlay element
      const overlay = document.createElement("div");
      overlay.setAttribute("data-theme-overlay", "true");
      overlay.setAttribute("aria-hidden", "true");

      Object.assign(overlay.style, {
        position:        "fixed",
        top:             "0",
        left:            "0",
        width:          "100vw",
        height:         "100vh",
        zIndex:         "9999",
        pointerEvents:  "none",
        background:    targetBg,
        // Start from button center as circle
        transform:      "translate(-50%, -50%) scale(0)",
        transformOrigin: `${originX}px ${originY}px`,
        borderRadius:    "50%",
        // Slower, more natural water spread animation
        animation:      "water-spread 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
      });

      // Store position info for animation
      (overlay as any)._originX = originX;
      (overlay as any)._originY = originY;

      document.body.appendChild(overlay);

      // Start CSS transitions on content BEFORE animation reaches them
      // This makes text colors change as dark "water" touches them
      document.body.style.transition = "background-color 0.3s ease, color 0.3s ease";
      document.body.style.backgroundColor = targetBg;
      document.body.style.color = targetText;

      // Also transition all text elements
      const allElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, span, li, button, div');
      allElements.forEach((el) => {
        (el as HTMLElement).style.transition = "color 0.25s ease, background-color 0.25s ease, border-color 0.25s ease";
      });

      // AFTER animation covers screen, apply theme class
      // This ensures colors have already started transitioning
      setTimeout(() => {
        document.documentElement.classList.toggle("dark", next === "dark");
      }, 1400);
      
      // Remove overlay after animation
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          overlay.style.transition = "opacity 0.15s ease";
          overlay.style.opacity = "0";
          setTimeout(() => {
            if (document.body.contains(overlay)) {
              overlay.remove();
            }
          }, 150);
        }
        
        // Reset transitions
        document.body.style.transition = "";
        const allEls = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, span, li, button, div');
        allEls.forEach((el) => {
          (el as HTMLElement).style.transition = "";
        });
        
        setIsAnimating(false);
      }, 600);
      
      setTheme(next);
      localStorage.setItem("theme", next);
    } else {
      // Fallback if button ref not available
      document.documentElement.classList.toggle("dark", next === "dark");
      setTheme(next);
      localStorage.setItem("theme", next);
    }
  };

  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden="true" />;
  }

  return (
    <button
      ref={btnRef}
      onClick={toggleTheme}
      disabled={isAnimating}
      className={`
        relative rounded-full p-2 text-zinc-500 transition-colors
        hover:bg-zinc-100 hover:text-zinc-900
        dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100
        ${isAnimating ? "pointer-events-none opacity-50" : ""}
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
