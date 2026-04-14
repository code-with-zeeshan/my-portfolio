// src/components/react/sections/DynamicProjectPage.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import FadeIn from "@/components/react/FadeIn";
import { cloudinaryPresets } from "@/lib/cloudinary";
import { projects as staticProjects } from "@/data/projects";
import type { Project } from "@/lib/types";

interface Props {
  projectId: string;
}

// ─────────────────────────────────────────────
// Gallery Carousel — shown only when 1+ images
// ─────────────────────────────────────────────
function GalleryCarousel({ images, title }: { images: string[]; title: string }) {
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const total = images.length;

  const prev = useCallback(() => {
    setCurrent((c) => (c === 0 ? total - 1 : c - 1));
  }, [total]);

  const next = useCallback(() => {
    setCurrent((c) => (c === total - 1 ? 0 : c + 1));
  }, [total]);

  // ── Keyboard navigation ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next]);

  if (total === 0) return null;

  return (
    <>
      <section className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Screenshots
          </h2>
          <span className="text-sm text-zinc-400">
            {current + 1} / {total}
          </span>
        </div>

        {/* ── Main carousel track ── */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
          {/* Image */}
          <div className="relative aspect-video">
            <img
              key={current}
              src={images[current]}
              alt={`${title} screenshot ${current + 1}`}
              className="h-full w-full object-contain"
              style={{
                animation: "fadeSlideIn 0.25s ease-out",
              }}
              loading="lazy"
              onClick={() => setIsFullscreen(true)}
            />

            {/* Click to expand hint */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-black/40 px-2.5 py-1.5 text-xs text-white opacity-0 hover:opacity-100 transition-opacity backdrop-blur-sm group-hover:opacity-100"
              title="View fullscreen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6"/><path d="M9 21H3v-6"/>
                <path d="M21 3 14 10"/><path d="M3 21l7-7"/>
              </svg>
              Expand
            </button>

            {/* Prev / Next arrows — only show if > 1 image */}
            {total > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-lg hover:scale-110 transition-transform dark:bg-zinc-900/90"
                  aria-label="Previous screenshot"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-lg hover:scale-110 transition-transform dark:bg-zinc-900/90"
                  aria-label="Next screenshot"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Dot indicators */}
          {total > 1 && (
            <div className="flex justify-center gap-1.5 py-3">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to screenshot ${i + 1}`}
                  className={`rounded-full transition-all duration-200 ${
                    i === current
                      ? "w-5 h-2 bg-brand-500"
                      : "w-2 h-2 bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-700 dark:hover:bg-zinc-500"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Thumbnail strip (only if > 1 image) ── */}
        {total > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {images.map((url, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`shrink-0 h-16 w-24 overflow-hidden rounded-lg border-2 transition-all ${
                  i === current
                    ? "border-brand-500 opacity-100"
                    : "border-transparent opacity-60 hover:opacity-90"
                }`}
              >
                <img
                  src={url}
                  alt={`Thumbnail ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ── Fullscreen lightbox ── */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Close */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>

          {/* Image */}
          <img
            src={images[current]}
            alt={`${title} screenshot ${current + 1}`}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Prev / Next in fullscreen */}
          {total > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
            {current + 1} / {total}
          </div>
        </div>
      )}

      {/* Carousel animation */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(8px); }
          to   { opacity: 1; transform: translateX(0);  }
        }
      `}</style>
    </>
  );
}

// ─────────────────────────────────────────────
// Main page component
// ─────────────────────────────────────────────
export default function DynamicProjectPage({ projectId }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    // ── Static fallback path ──
    if (projectId.startsWith("static-")) {
      const idx = parseInt(projectId.replace("static-", ""), 10);
      const p = staticProjects[idx];
      if (p) {
        setProject({
          id:               projectId,
          title:            p.title,
          description:      p.description,
          long_description: p.longDescription || null,
          image_url:        p.image,
          // ✅ B6: always produce a real array, never null
          gallery_images:   Array.isArray(p.gallery_images) ? p.gallery_images : [],
          tags:             p.tags,
          live_url:         p.liveUrl  || null,
          github_url:       p.githubUrl || null,
          featured:         p.featured,
          year:             p.year,
          outcome:          p.outcome  || null,
          sort_order:       p.sortOrder,
          created_at:       new Date().toISOString(),
          updated_at:       new Date().toISOString(),
        });
        setLoading(false);
        return;
      }
    }

    // ── Supabase path ──
    supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
        } else {
          setProject({
            ...data,
            // ✅ B6: normalise null → [] so carousel check is always safe
            gallery_images: Array.isArray(data.gallery_images)
              ? data.gallery_images
              : [],
          });
        }
        setLoading(false);
      });
  }, [projectId]);

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 md:py-24 pt-24 md:pt-32 animate-pulse space-y-4">
        <div className="h-8 w-3/4 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-64 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (notFound || !project) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-32 pt-24 md:pt-32 text-center">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
          Project Not Found
        </h1>
        <p className="mt-4 text-zinc-500">
          This project doesn't exist or has been removed.
        </p>
        <a
          href="/projects"
          className="mt-8 inline-flex items-center gap-2 text-brand-500 hover:underline"
        >
          ← Back to Projects
        </a>
      </div>
    );
  }

  const imgSrc =
    project.image_url?.includes("cloudinary")
      ? cloudinaryPresets.blogHero(project.image_url)
      : project.image_url || "/images/projects/sample_project.webp";

  return (
    <article className="mx-auto max-w-4xl px-6 py-16 md:py-24 pt-24 md:pt-32">
      <FadeIn>
        {/* ── Back link ── */}
        <a
          href="/projects"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-brand-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
          </svg>
          Back to Projects
        </a>

        {/* ── Header ── */}
        <header className="mb-10">
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-500"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-900 dark:text-zinc-50">
                {project.title}
              </h1>
              {project.year && (
                <p className="mt-2 text-sm text-zinc-500">{project.year}</p>
              )}
            </div>
            {project.outcome && (
              <div className="rounded-xl bg-brand-500/10 px-4 py-3 text-center">
                <p className="text-brand-500 font-semibold">
                  📈 {project.outcome}
                </p>
              </div>
            )}
          </div>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            {project.description}
          </p>
        </header>

        {/* ── Hero image ── */}
        <img
          src={imgSrc}
          alt={project.title}
          className="mb-10 w-full rounded-2xl shadow-lg aspect-video object-contain bg-zinc-100 dark:bg-zinc-900"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            if (img.dataset.errored) return;
            img.dataset.errored = "true";
            img.src = "/images/projects/sample_project.webp";
          }}
        />

        {/* ── Action buttons ── */}
        <div className="flex flex-wrap gap-4 mb-10">
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-brand-600 transition-colors dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-brand-500 dark:hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6"/><path d="M10 14 21 3"/>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              </svg>
              Live Demo
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                <path d="M9 18c-4.51 2-5-2-7-2"/>
              </svg>
              Source Code
            </a>
          )}
        </div>

        {/* ── B11: Gallery carousel — only renders when images exist ── */}
        {project.gallery_images.length > 0 && (
          <GalleryCarousel
            images={project.gallery_images}
            title={project.title}
          />
        )}

        {/* ── Long description / case study ── */}
        {project.long_description && (
          <div className="mt-12 prose prose-zinc dark:prose-invert max-w-none">
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