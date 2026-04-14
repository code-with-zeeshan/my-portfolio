// src/components/react/sections/DynamicProjectsIndex.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import FadeIn from "@/components/react/FadeIn";
import { cloudinaryPresets } from "@/lib/cloudinary";
import { projects as staticProjects } from "@/data/projects";
import { Skeleton } from "@/components/ui/Skeleton";

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

export default function DynamicProjectsIndex() {
  const [projects, setProjects]         = useState<Project[]>([]);
  const [loading, setLoading]           = useState(true);
  const [supabaseDown, setSupabaseDown] = useState(false);
  const [filter, setFilter]             = useState<"all" | "featured">("all");

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("sort_order", { ascending: true });

        if (error) {
          // ✅ B7: Supabase reachable but returned error (RLS, missing table, etc.)
          console.warn("Supabase error — using static fallback:", error.message);
          setSupabaseDown(true);
        } else {
          // ✅ B7: Supabase reachable — use WHATEVER it returned, even []
          // An empty array means the user deleted all projects — show empty state, NOT fallback
          setProjects(data ?? []);
          setSupabaseDown(false);
        }
      } catch {
        // ✅ B7: Network error — Supabase truly unreachable
        setSupabaseDown(true);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  // ✅ B7: Only use static data when Supabase is truly unreachable
  const displayProjects = supabaseDown
    ? staticProjects.map((p, i) => ({
        id:          `static-${i}`,
        title:       p.title,
        description: p.description,
        image_url:   p.image,
        tags:        p.tags,
        live_url:    p.liveUrl  || null,
        github_url:  p.githubUrl || null,
        featured:    p.featured,
        year:        p.year,
        outcome:     p.outcome || null,
        sort_order:  i,
      }))
    : projects;

  const filtered =
    filter === "featured"
      ? displayProjects.filter((p) => p.featured)
      : displayProjects;

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 md:py-24 pt-24 md:pt-32">
      <FadeIn>
        <div className="mb-10 md:mb-16">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-brand-500">
            Portfolio
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-900 dark:text-zinc-50">
            All Projects
          </h1>
          <p className="mt-4 max-w-xl text-zinc-600 dark:text-zinc-400">
            A comprehensive collection of my work.
          </p>

          {/* Filter buttons */}
          <div className="mt-6 flex gap-2">
            {(["all", "featured"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors capitalize ${
                  filter === f
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "border border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {loading ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              variant="card"
              className="h-72"
            />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, index) => (
            <FadeIn key={project.id} delay={index * 0.05}>
              <a
                href={`/projects/${project.id}`}
                className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:border-brand-500/30 hover:shadow-lg hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={
                      project.image_url?.includes("cloudinary")
                        ? cloudinaryPresets.projectThumbnail(project.image_url)
                        : project.image_url || "/images/projects/sample_project.webp"
                    }
                    alt={project.title}
                    // ✅ B8: object-contain so image is never cropped
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (img.dataset.errored) return;
                      img.dataset.errored = "true";
                      img.src = "/images/projects/sample_project.webp";
                    }}
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-brand-500 transition-colors">
                      {project.title}
                    </h3>
                    {project.year && (
                      <span className="text-xs text-zinc-500 ml-2 shrink-0">
                        {project.year}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3">
                    {project.description}
                  </p>
                  {project.outcome && (
                    <p className="text-xs font-medium text-brand-500 mb-3">
                      📈 {project.outcome}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">
                        +{project.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            </FadeIn>
          ))}
        </div>
      ) : (
        // ✅ B7: Proper empty state when all projects deleted from admin
        <FadeIn>
          <div className="rounded-2xl border border-dashed border-zinc-300 p-16 text-center dark:border-zinc-700">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                <rect width="20" height="14" x="2" y="6" rx="2"/>
                <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <p className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
              No projects yet
            </p>
            <p className="text-sm text-zinc-500 max-w-xs mx-auto">
              Projects will appear here once added from the admin dashboard.
            </p>
          </div>
        </FadeIn>
      )}
    </section>
  );
}