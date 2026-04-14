// src/components/react/ProjectPreviewModal.tsx
// Full-screen preview modal — shows exactly how the project page
// will look on the website before saving
"use client";

import { useEffect, useCallback, useState } from "react";
import ReactIcon from "@/components/react/ReactIcon";
import { PreviewModal } from "@/components/ui/preview-modal";

interface Project {
  title: string;
  description: string;
  long_description: string | null;
  image_url: string | null;
  tags: string[];
  live_url: string | null;
  github_url: string | null;
  year: string | null;
  outcome: string | null;
  gallery_images?: string[];
}

interface Props {
  project: Project;
  onClose: () => void;
}

// ── Mini gallery for preview ──
function PreviewGallery({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  if (images.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
        Screenshots
      </h2>
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
        <img
          src={images[current]}
          alt={`Screenshot ${current + 1}`}
          className="h-full w-full object-contain"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow dark:bg-zinc-900/90"
            >
              <ReactIcon name="chevron-left" size={18} />
            </button>
            <button
              onClick={() => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow dark:bg-zinc-900/90"
            >
              <ReactIcon name="chevron-right" size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all ${
                    i === current
                      ? "w-5 h-2 bg-brand-500"
                      : "w-2 h-2 bg-zinc-400"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`shrink-0 h-16 w-24 overflow-hidden rounded-lg border-2 transition-all ${
                i === current
                  ? "border-brand-500 opacity-100"
                  : "border-transparent opacity-50 hover:opacity-80"
              }`}
            >
              <img
                src={url}
                alt={`Thumb ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectPreviewModal({ project, onClose }: Props) {
  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const imgSrc = project.image_url || "/images/projects/sample_project.webp";
  const gallery = Array.isArray(project.gallery_images)
    ? project.gallery_images
    : [];

  return (
    <PreviewModal open={true} onClose={onClose} fullScreen={true}>
      <div className="flex flex-col h-full">

        {/* ── Header bar ── */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              Preview Mode
            </span>
            <span className="text-sm text-zinc-500">
              This is how your project page will appear on the website
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
          >
            <ReactIcon name="x-close" size={14} />
            Close Preview (Esc)
          </button>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto">
          <article className="mx-auto max-w-4xl px-6 py-16">

          {/* Back link — non-functional in preview */}
          <div className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 cursor-not-allowed select-none">
            <ReactIcon name="arrow-left" size={14} />
            Back to Projects
          </div>

          {/* Tags */}
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

          {/* Title + outcome */}
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-900 dark:text-zinc-50">
                {project.title || "Untitled Project"}
              </h1>
              {project.year && (
                <p className="mt-2 text-sm text-zinc-500">{project.year}</p>
              )}
            </div>
            {project.outcome && (
              <div className="rounded-xl bg-brand-500/10 px-4 py-3">
                <p className="text-brand-500 font-semibold">📈 {project.outcome}</p>
              </div>
            )}
          </div>

          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
            {project.description || "No description yet."}
          </p>

          {/* Hero image */}
          {imgSrc && (
            <img
              src={imgSrc}
              alt={project.title}
              className="mb-8 w-full rounded-2xl shadow-lg aspect-video object-contain bg-zinc-100 dark:bg-zinc-900"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (img.dataset.errored) return;
                img.dataset.errored = "true";
                img.src = "/images/projects/sample_project.webp";
              }}
            />
          )}

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            {project.live_url ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900 opacity-80 cursor-not-allowed">
                <ReactIcon name="external-link" size={16} />
                Live Demo
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-zinc-200 px-6 py-3 text-sm font-medium text-zinc-400 dark:bg-zinc-800 cursor-not-allowed">
                No Live URL set
              </span>
            )}
            {project.github_url ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-400 dark:border-zinc-700 cursor-not-allowed">
                <ReactIcon name="github" size={16} />
                Source Code
              </span>
            ) : null}
          </div>

          {/* Gallery carousel */}
          {gallery.length > 0 && (
            <PreviewGallery images={gallery} />
          )}

          {/* Long description */}
          {project.long_description && (
            <div className="mt-10 prose prose-zinc dark:prose-invert max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: project.long_description
                    .split("\n\n")
                    .map((p) => `<p class="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">${p.replace(/\n/g, "<br />")}</p>`)
                    .join(""),
                }}
              />
            </div>
          )}

          {/* Empty long description hint */}
          {!project.long_description && (
            <div className="mt-10 rounded-2xl border-2 border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
              <p className="text-zinc-400 text-sm">
                No case study / long description yet — add one in the admin panel.
              </p>
            </div>
          )}

          </article>
        </div>
      </div>
    </PreviewModal>
  );
}