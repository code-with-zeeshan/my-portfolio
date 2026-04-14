// src/components/react/ScrollProgress.tsx
"use client";

import { useState, useEffect } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = docHeight > 0 ? scrollTop / docHeight : 0;
      setProgress(scrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-100 h-[3px] origin-left"
        style={{
          background: "var(--color-brand-500)",
          transform: `scaleX(${progress})`,
          transition: "transform 0.1s linear",
        }}
      />
      {/* Slide-in SVG icon positioned at same vertical level as header brand */}
      <div
        className="fixed top-4 right-4 z-90 transition-all duration-300"
        style={{
          opacity: progress > 0.1 ? 1 : 0,
          transform: `translateY(${progress > 0.1 ? 0 : -10}px)`,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-brand-500"
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      </div>
    </>
  );
}