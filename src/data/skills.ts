// src/data/skills.ts
export interface SkillCategory {
    title: string;
    skills: string[];
  }
  
  export const skillCategories: SkillCategory[] = [
    {
      title: "Frontend",
      skills: ["React", "Next.js", "Astro", "TypeScript", "Tailwind CSS", "Framer Motion"],
    },
    {
      title: "Backend",
      skills: ["Node.js", "Python", "PostgreSQL", "Redis", "GraphQL", "REST APIs"],
    },
    {
      title: "DevOps & Tools",
      skills: ["Docker", "AWS", "Vercel", "GitHub Actions", "Figma", "Linux"],
    },
  ];