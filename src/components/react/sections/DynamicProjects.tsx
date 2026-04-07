// src/components/react/sections/DynamicProjects.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import FadeIn from "@/components/react/FadeIn";
import { cloudinaryPresets } from "@/lib/cloudinary";
import { projects as staticProjects } from "@/data/projects";

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  tags: string[];
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
  year: string | null;
  outcome: string | null;
  sort_order: number;
}

// ─── Project Card ───
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), index * 100);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  const imgSrc = project.image_url?.includes("cloudinary")
    ? cloudinaryPresets.projectThumbnail(project.image_url)
    : project.image_url || "/images/projects/project-1.webp";

  return (
    <article
      ref={(el) => { ref.current = el; }}
      className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease",
      }}
    >
      {/* Clicking card opens dedicated project page */}
      <a href={`/projects/${project.id}`} className="block">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={imgSrc}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              // Guard: only fire once — prevents infinite loop if fallback also missing
              if (img.dataset.errored) return;
              img.dataset.errored = "true";
              img.src = "/images/projects/project-1.webp";
            }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
            {project.live_url && (
              <span
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(project.live_url!, "_blank"); }}
                className="rounded-full bg-white p-2.5 text-zinc-900 shadow-lg transition-transform hover:scale-110 cursor-pointer"
                title="Live Demo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
              </span>
            )}
            {project.github_url && (
              <span
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(project.github_url!, "_blank"); }}
                className="rounded-full bg-white p-2.5 text-zinc-900 shadow-lg transition-transform hover:scale-110 cursor-pointer"
                title="Source Code"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              </span>
            )}
          </div>
        </div>
        <div className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-brand-500 transition-colors">{project.title}</h3>
            {project.year && <span className="text-xs text-zinc-500 dark:text-zinc-400">{project.year}</span>}
          </div>
          <p className="mb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-2">{project.description}</p>
          {project.outcome && <p className="mb-4 text-sm font-medium text-brand-500">📈 {project.outcome}</p>}
          <div className="flex flex-wrap gap-2">
            {(project.tags || []).map((tag) => (
              <span key={tag} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{tag}</span>
            ))}
          </div>
        </div>
      </a>
    </article>
  );
}

// ─── Project Carousel ───
function ProjectCarousel({ projects }: { projects: Project[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fading, setFading] = useState(false);

  const navigate = (direction: number) => {
    if (fading) return;
    setFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => {
        const next = prev + direction;
        if (next < 0) return projects.length - 1;
        if (next >= projects.length) return 0;
        return next;
      });
      setFading(false);
    }, 250);
  };

  const project = projects[currentIndex];
  const imgSrc = project.image_url?.includes("cloudinary")
    ? cloudinaryPresets.projectThumbnail(project.image_url)
    : project.image_url || "/images/projects/project-1.webp";

  return (
    <div className="mb-12 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="grid lg:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-video lg:aspect-auto overflow-hidden">
          <img
            src={imgSrc}
            alt={project.title}
            className="h-full w-full object-cover"
            style={{ opacity: fading ? 0 : 1, transition: "opacity 0.25s ease" }}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              // Guard: only fire once — prevents infinite loop if fallback also missing
              if (img.dataset.errored) return;
              img.dataset.errored = "true";
              img.src = "/images/projects/project-1.webp";
            }}
          />
          {/* Arrows */}
          <button onClick={() => navigate(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:scale-110 transition-transform dark:bg-zinc-900/90 dark:text-zinc-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button onClick={() => navigate(1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:scale-110 transition-transform dark:bg-zinc-900/90 dark:text-zinc-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {projects.map((_, i) => (
              <button key={i} onClick={() => { setFading(true); setTimeout(() => { setCurrentIndex(i); setFading(false); }, 250); }} className={`rounded-full transition-all ${i === currentIndex ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/50"}`} />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center p-8" style={{ opacity: fading ? 0 : 1, transition: "opacity 0.25s ease" }}>
          <div className="flex flex-wrap gap-2 mb-4">
            {(project.tags || []).slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-500">{tag}</span>
            ))}
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">{project.title}</h3>
          {project.year && <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">{project.year}</p>}
          <p className="text-zinc-600 dark:text-zinc-300 mb-4 leading-relaxed">{project.description}</p>
          {project.outcome && <p className="text-sm font-semibold text-brand-500 mb-6">📈 {project.outcome}</p>}
          <div className="flex gap-3">
            <a href={`/projects/${project.id}`} className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-brand-500 dark:hover:text-white">
              View Details
            </a>
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Live Demo →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DynamicProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  //const [usingFallback, setUsingFallback] = useState(false);
  const [supabaseDown,  setSupabaseDown]  = useState(false); 

  useEffect(() => {
  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) {
        // ✅ Supabase returned an error (likely down or misconfigured)
        console.warn("Supabase error — using static fallback:", error.message);
        setSupabaseDown(true);
      } else {
        // ✅ Supabase is reachable — use whatever it returned (even empty array)
        setProjects(data ?? []);
        setSupabaseDown(false);
      }
    } catch {
      // ✅ Network error — Supabase unreachable
      setSupabaseDown(true);
    } finally {
      setLoading(false);
    }
  }
  fetchProjects();
}, []);

// ✅ Only fall back to static data when Supabase is unreachable
const displayProjects = supabaseDown
  ? staticProjects.map((p, i) => ({
    id: `static-${i}`,
    title: p.title,
    description: p.description,
    image_url: p.image,
    tags: p.tags,
    live_url: p.liveUrl || null,
    github_url: p.githubUrl || null,
    featured: p.featured,
    year: p.year,
    outcome: p.outcome || null,
    sort_order: i,
  }))
  : projects;

  const featuredProjects = displayProjects.filter((p) => p.featured);
  const carouselProjects = featuredProjects.length > 0 ? featuredProjects : displayProjects;
  const cardProjects = featuredProjects.length > 0 ? featuredProjects : displayProjects;

  return (
    <section id="projects" className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <div className="mb-12">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-brand-500">Portfolio</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-900 dark:text-zinc-50">Selected Work</h2>
            <p className="mt-4 max-w-xl text-zinc-600 dark:text-zinc-400">A curated collection of projects showcasing my skills.</p>
          </div>
        </FadeIn>

        {loading ? (
          <div className="space-y-8">
            <div className="h-64 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />)}
            </div>
          </div>
        ) : displayProjects.length > 0 ? (
          <>
            {/* Carousel — Desktop only, needs 2+ projects */}
            {carouselProjects.length >= 2 && (
              <FadeIn>
                <div className="hidden lg:block">
                  <ProjectCarousel projects={carouselProjects} />
                </div>
              </FadeIn>
            )}

            {/* Cards Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {cardProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-16 text-center dark:border-zinc-700">
            <p className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">Projects coming soon! 🚧</p>
          </div>
        )}

        <FadeIn delay={0.3}>
          <div className="mt-12 text-center">
            <a href="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-brand-500 hover:underline">
              View All Projects →
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}