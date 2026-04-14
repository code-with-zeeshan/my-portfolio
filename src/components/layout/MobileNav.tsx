// src/components/layout/MobileNav.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import ResumeButton from "@/components/react/ResumeButton.tsx";
import useDarkMode from "@/hooks/useDarkMode";

interface NavLink {
  href: string;
  label: string;
}

interface Props {
  navLinks: NavLink[];
}

export default function MobileNav({ navLinks }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Use shared dark mode hook
  const { isDark } = useDarkMode();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger button - theme-aware colors */}
      <button
        ref={btnRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative flex h-9 w-9 items-center justify-center rounded-lg 
          transition-all
          ${isDark 
            ? "text-zinc-400 hover:bg-zinc-800" 
            : "text-zinc-600 hover:bg-zinc-100"
          }
          dark:text-zinc-400 dark:hover:bg-zinc-800
        `}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
      >
        <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 $
          ${isOpen ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"}
        `}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="6"  y2="6" />
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </span>
        <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 $
          ${isOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"}
        `}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </span>
      </button>

      {/* Glassmorphism backdrop - blurs page content with dark overlay */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-40 transition-colors backdrop-blur-lg ${
            isDark ? "bg-zinc-950/90" : "bg-zinc-900/80"
          }`}
          onClick={close}
          aria-hidden="true"
          style={{ animation: "drawerFadeIn 0.15s ease-out" }}
        />
      )}

      {/* Full screen drawer - slides in from right - SOLID opaque backgrounds */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`
          fixed inset-0 z-50
          w-screen h-screen
          flex flex-col
          shadow-2xl
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}

          /* Solid drawer background */
          bg-white dark:bg-zinc-950
        `}
      >
        {/* Header with brand and close button */}
        <div className={`
          flex h-16 items-center justify-between px-6 shrink-0 bg-white dark:bg-zinc-950
          ${isDark ? "border-zinc-800" : "border-zinc-200"}
          dark:border-zinc-800 border-b
        `}>
          <span className={`text-base font-semibold ${isDark ? "text-zinc-50" : "text-zinc-900"} dark:text-zinc-50`}>
            M7Z6<span className="text-brand-500">.</span>
          </span>
          <button
            onClick={close}
            className={`
              flex h-9 w-9 items-center justify-center rounded-lg transition-colors
              ${isDark 
                ? "text-zinc-400 hover:bg-zinc-800" 
                : "text-zinc-500 hover:bg-zinc-100"
              }
              dark:text-zinc-400 dark:hover:bg-zinc-800
            `}
            aria-label="Close navigation menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        {/* Nav links - solid background */}
        <nav className="flex-1 px-4 py-6 bg-white dark:bg-zinc-950">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={close}
                  className={`
                    flex items-center rounded-xl px-4 py-3 text-base font-medium transition-colors
                    ${isDark
                      ? "text-zinc-300 hover:bg-zinc-900 hover:text-brand-500"
                      : "text-zinc-700 hover:bg-zinc-100 hover:text-brand-500"
                    }
                    dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-brand-500
                  `}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Resume button - inside the nav */}
          <div className={`
            border-t mt-4 px-1 py-5
            ${isDark ? "border-zinc-800" : "border-zinc-200"}
            dark:border-zinc-800
          `}>
            <ResumeButton
              label="Resume"
              onClick={close}
              className={`
                inline-flex w-fit rounded-full px-6 py-2.5 text-sm font-medium transition-colors
                ${isDark
                  ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                  : "bg-zinc-900 text-white hover:bg-zinc-800"
                }
                dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200
              `}
            />
          </div>
        </nav>
      </div>

      <style>{`
        @keyframes drawerFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}
