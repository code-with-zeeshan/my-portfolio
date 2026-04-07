// src/data/projects.ts
export interface Project {
    gallery_images: any;
    title: string;
    description: string;
    longDescription: string;
    image: string;
    tags: string[];
    liveUrl?: string;
    githubUrl?: string;
    featured: boolean;
    year: string;
    outcome?: string;
  }
  
  export const projects: Project[] = [
    {
      title: "E-Commerce Platform",
      description: "A full-stack e-commerce platform with real-time inventory management.",
      longDescription: "Built a complete e-commerce solution that handles 10K+ daily transactions...",
      image: "/images/projects/project-1.webp",
      tags: ["Next.js", "TypeScript", "Stripe", "PostgreSQL"],
      liveUrl: "https://project1.com",
      githubUrl: "https://github.com/you/project1",
      featured: true,
      year: "2025",
      outcome: "Increased conversion by 34%",
    },
    {
      title: "AI Dashboard",
      description: "Real-time analytics dashboard powered by machine learning.",
      longDescription: "Designed and built an analytics platform processing 1M+ data points...",
      image: "/images/projects/project-2.webp",
      tags: ["React", "Python", "TensorFlow", "D3.js"],
      liveUrl: "https://project2.com",
      featured: true,
      year: "2025",
      outcome: "Reduced analysis time by 60%",
    },
    {
      title: "Developer Toolkit",
      description: "Open-source CLI tool for automating development workflows.",
      longDescription: "Created a CLI tool adopted by 2K+ developers...",
      image: "/images/projects/project-3.webp",
      tags: ["Node.js", "TypeScript", "CLI", "Open Source"],
      githubUrl: "https://github.com/you/project3",
      featured: true,
      year: "2024",
      outcome: "2K+ GitHub stars",
    },
  ];