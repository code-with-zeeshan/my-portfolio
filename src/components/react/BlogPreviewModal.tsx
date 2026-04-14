// src/components/react/BlogPreviewModal.tsx
// Full-screen preview modal — shows exactly how the blog post
// will look on the website before publishing
"use client";

import { useEffect, useCallback } from "react";
import ReactIcon from "@/components/react/ReactIcon";
import { parseMarkdown } from "@/lib/markdown";
import { PreviewModal } from "@/components/ui/preview-modal";

interface BlogPost {
  title: string;
  description: string;
  content: string;
  tags: string[];
  hero_image: string | null;
  pub_date: string;
  meta_title: string | null;
  meta_description: string | null;
}

interface Props {
  post: BlogPost;
  onClose: () => void;
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(d));
}

export default function BlogPreviewModal({ post, onClose }: Props) {
  // ─── Close on Escape key ───
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll while modal is open
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <PreviewModal open={true} onClose={onClose} fullScreen={true}>
      <div className="flex flex-col h-full">

        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              Preview Mode
            </span>
            <span className="text-sm text-zinc-500">
              This is exactly how your post will appear on the website
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

        {/* ── SEO Preview Bar ── */}
        {(post.meta_title || post.meta_description) && (
          <div className="border-b border-zinc-200 bg-zinc-100 px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900/50 shrink-0">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
              SEO Preview (Google)
            </p>
            <p className="text-base font-medium text-blue-600 dark:text-blue-400">
              {post.meta_title || post.title}
            </p>
            <p className="text-sm text-zinc-500 truncate">
              {post.meta_description || post.description}
            </p>
          </div>
        )}

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto">
          <article className="mx-auto max-w-3xl px-6 py-16">

          {/* Back link (non-functional in preview) */}
          <div className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 cursor-not-allowed">
            <ReactIcon name="arrow-left" size={14} />
            Back to Blog
          </div>

          {/* Header */}
          <header className="mb-10">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-500"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-zinc-900 dark:text-zinc-50">
              {post.title || "Untitled Post"}
            </h1>

            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              {post.description}
            </p>

            <time className="mt-4 block text-sm text-zinc-500">
              {formatDate(post.pub_date || new Date().toISOString())}
            </time>
          </header>

          {/* Hero Image */}
          {post.hero_image && (
            <img
              src={post.hero_image}
              alt={post.title}
              className="mb-10 w-full rounded-2xl object-cover shadow-lg"
            />
          )}

          {/* Content */}
          {post.content ? (
            <div
              className="prose-content"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(post.content) }}
            />
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
              <p className="text-zinc-400">No content yet — start writing in the editor.</p>
            </div>
          )}
          </article>
        </div>
      </div>
    </PreviewModal>
  );
}