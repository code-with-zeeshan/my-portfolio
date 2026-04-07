// src/components/react/sections/DynamicProjectPage.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import FadeIn from "@/components/react/FadeIn";
import { cloudinaryPresets } from "@/lib/cloudinary";
import { projects as staticProjects } from "@/data/projects";

interface Project {
  id: string;
  title: string;
  description: string;
  long_description: string | null;
  image_url: string | null;
  tags: string[];
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
  year: string | null;
  outcome: string | null;
}

interface Props {
  projectId: string;
}

export default function DynamicProjectPage({ projectId }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    // Check if it's a static fallback ID
    if (projectId.startsWith("static-")) {
      const idx = parseInt(projectId.replace("static-", ""));
      const p = staticProjects[idx];
      if (p) {
        setProject({
          id: projectId,
          title: p.title,
          description: p.description,
          long_description: p.longDescription || null,
          image_url: p.image,
          tags: p.tags,
          live_url: p.liveUrl || null,
          github_url: p.githubUrl || null,
          featured: p.featured,
          year: p.year,
          outcome: p.outcome || null,
        });
        setLoading(false);
        return;
      }
    }

    // Fetch from Supabase
    supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setProject(data);
        setLoading(false);
      });
  }, [projectId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 pt-32 animate-pulse space-y-4">
        <div className="h-8 w-3/4 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-64 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-4 rounded bg-zinc-200 dark:bg-zinc-800" />)}
        </div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-32 pt-32 text-center">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">Project Not Found</h1>
        <p className="mt-4 text-zinc-500">This project doesn't exist or has been removed.</p>
        <a href="/projects" className="mt-8 inline-flex items-center gap-2 text-brand-500 hover:underline">
          ← Back to Projects
        </a>
      </div>
    );
  }

  const imgSrc = project.image_url?.includes("cloudinary")
    ? cloudinaryPresets.blogHero(project.image_url)
    : project.image_url || "/images/projects/project-1.webp";

  return (
    <article className="mx-auto max-w-4xl px-6 py-24 pt-32">
      <FadeIn>
        <a href="/projects" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-brand-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          Back to Projects
        </a>

        <header className="mb-10">
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-500">{tag}</span>
            ))}
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-900 dark:text-zinc-50">{project.title}</h1>
              {project.year && <p className="mt-2 text-sm text-zinc-500">{project.year}</p>}
            </div>
            {project.outcome && (
              <div className="rounded-xl bg-brand-500/10 px-4 py-3 text-center">
                <p className="text-brand-500 font-semibold">📈 {project.outcome}</p>
              </div>
            )}
          </div>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">{project.description}</p>
        </header>

        {/* Hero Image */}
        <img
          src={imgSrc}
          alt={project.title}
          className="mb-10 w-full rounded-2xl object-cover shadow-lg aspect-video"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            // Guard: only fire once — prevents infinite loop if fallback also missing
            if (img.dataset.errored) return;
            img.dataset.errored = "true";
            img.src = "/images/projects/project-1.webp";
          }}
        />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-10">
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-brand-600 transition-colors dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-brand-500 dark:hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
              Live Demo
            </a>
          )}
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              Source Code
            </a>
          )}
        </div>

        {/* Long Description / Case Study */}
        {project.long_description && (
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html: project.long_description
                  .split("\n\n")
                  .map((p) => `<p>${p.replace(/\n/g, "<br />")}</p>`)
                  .join(""),
              }}
            />
          </div>
        )}
      </FadeIn>
    </article>
  );
}