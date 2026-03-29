// src/components/react/SkillBar.tsx
"use client";

import { useEffect, useRef, useState } from "react";

interface Skill {
  name: string;
  level: number;
  color?: string;
}

interface Props {
  skills: Skill[];
  showPercentage?: boolean;
}

export default function SkillBar({ skills, showPercentage = true }: Props) {
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
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="space-y-5">
      {skills.map((skill, idx) => (
        <div
          key={skill.name}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateX(0)" : "translateX(-20px)",
            transition: `opacity 0.4s ease ${idx * 0.08}s, transform 0.4s ease ${idx * 0.08}s`,
          }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{skill.name}</span>
            {showPercentage && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {skill.level}%
              </span>
            )}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full rounded-full"
              style={{
                width: isVisible ? `${skill.level}%` : "0%",
                backgroundColor: skill.color || "var(--color-brand-500)",
                transition: `width 0.8s cubic-bezier(0.21, 0.47, 0.32, 0.98) ${0.2 + idx * 0.08}s`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}