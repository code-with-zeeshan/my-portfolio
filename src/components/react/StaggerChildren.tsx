// src/components/react/StaggerChildren.tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.08,
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "-50px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        // Pass stagger info via CSS custom property
        // @ts-ignore
        "--stagger-delay": `${staggerDelay}s`,
        "--stagger-visible": isVisible ? "1" : "0",
      } as React.CSSProperties}
      data-stagger-visible={isVisible ? "true" : "false"}
    >
      {children}
    </div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  index?: number;
  staggerDelay?: number;
}

export function StaggerItem({
  children,
  className = "",
  index = 0,
  staggerDelay = 0.08,
}: StaggerItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [parentVisible, setParentVisible] = useState(false);

  useEffect(() => {
    // Watch parent for visibility
    const checkParent = () => {
      const parent = ref.current?.closest("[data-stagger-visible]");
      if (parent?.getAttribute("data-stagger-visible") === "true") {
        setParentVisible(true);
      }
    };

    // Use MutationObserver to watch for parent attribute changes
    const parent = ref.current?.closest("[data-stagger-visible]");
    if (parent) {
      const observer = new MutationObserver(checkParent);
      observer.observe(parent, { attributes: true });
      checkParent(); // Initial check
      return () => observer.disconnect();
    }
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: parentVisible ? 1 : 0,
        transform: parentVisible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.4s ease ${index * staggerDelay}s, transform 0.4s ease ${index * staggerDelay}s`,
      }}
    >
      {children}
    </div>
  );
}