// src/components/react/TextReveal.tsx
"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  text: string;
  className?: string;
  delay?: number;
}

export default function TextReveal({ text, className = "", delay = 0 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const words = text.split(" ");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay * 1000);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block mr-[0.25em]"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
            filter: isVisible ? "blur(0px)" : "blur(4px)",
            transition: `opacity 0.4s ease ${delay + i * 0.06}s, transform 0.4s ease ${delay + i * 0.06}s, filter 0.4s ease ${delay + i * 0.06}s`,
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}