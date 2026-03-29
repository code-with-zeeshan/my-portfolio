// src/components/react/PageTransition.tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = "" }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to ensure DOM is ready, then trigger animation
    const timer = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
      }}
    >
      {children}
    </div>
  );
}