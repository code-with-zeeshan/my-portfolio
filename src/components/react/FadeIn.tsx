// src/data/experience.ts
export interface Experience {
    company: string;
    role: string;
    period: string;
    description: string;
    achievements: string[];
  }
  
  export const experiences: Experience[] = [
    {
      company: "Tech Corp",
      role: "Senior Full-Stack Developer",
      period: "2023 — Present",
      description: "Leading frontend architecture for the main product.",
      achievements: [
        "Reduced page load time by 45% through performance optimization",
        "Led migration from CRA to Next.js, improving SEO scores by 30%",
        "Mentored 4 junior developers",
      ],
    },
    {
      company: "StartupXYZ",
      role: "Frontend Developer",
      period: "2021 — 2023",
      description: "Built and maintained the core product UI.",
      achievements: [
        "Shipped 15+ features from ideation to production",
        "Implemented design system used across 3 products",
        "Improved test coverage from 20% to 85%",
      ],
    },
  ];