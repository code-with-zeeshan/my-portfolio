// src/components/react/sections/DynamicBlogPost.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import FadeIn from "@/components/react/FadeIn";
import { cloudinaryPresets } from "@/lib/cloudinary";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  tags: string[];
  hero_image: string | null;
  pub_date: string;
  updated_at: string;
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(new Date(d));
}

// Simple Markdown renderer — handles headers, bold, italic, code, lists
function renderMarkdown(text: string): string {
  return text
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="rounded-xl bg-zinc-900 p-4 overflow-x-auto text-sm"><code class="text-zinc-100">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm font-mono text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">$1</code>')
    // H1
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-8 mb-4">$1</h1>')
    // H2
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-8 mb-3">$1</h2>')
    // H3
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mt-6 mb-2">$1</h3>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-zinc-900 dark:text-zinc-50">$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
    // Unordered list items
    .replace(/^[-*] (.+)$/gm, '<li class="ml-4 text-zinc-600 dark:text-zinc-300">• $1</li>')
    // Numbered list items
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-zinc-600 dark:text-zinc-300">$1</li>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="border-zinc-200 dark:border-zinc-800 my-8" />')
    // Paragraphs (double newline)
    .replace(/\n\n(?!<[h|p|u|o|l|p|c|h|b|i])/g, '</p><p class="text-zinc-600 dark:text-zinc-300 leading-relaxed">')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-brand-500 hover:underline">$1</a>')
    // Wrap in opening p if doesn't start with HTML tag
    .replace(/^(?!<)/, '<p class="text-zinc-600 dark:text-zinc-300 leading-relaxed">')
    + '</p>';
}

interface Props {
  slug: string;
}

export default function DynamicBlogPost({ slug }: Props) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setPost(data);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 pt-32">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-3/4 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-1/2 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-64 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-4 rounded bg-zinc-200 dark:bg-zinc-800" />)}
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 pt-32 text-center">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">404</h1>
        <p className="mt-4 text-zinc-500">Blog post not found.</p>
        <a href="/blog" className="mt-8 inline-flex items-center gap-2 text-brand-500 hover:underline">
          ← Back to Blog
        </a>
      </div>
    );
  }

  const heroSrc = post.hero_image?.includes("cloudinary")
    ? cloudinaryPresets.blogHero(post.hero_image)
    : post.hero_image;

  return (
    <article className="mx-auto max-w-3xl px-6 py-24 pt-32">
      <FadeIn>
        <a href="/blog" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-brand-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          Back to Blog
        </a>

        <header className="mb-10">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-500">{tag}</span>
            ))}
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-zinc-900 dark:text-zinc-50">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">{post.description}</p>
          <time className="mt-4 block text-sm text-zinc-500">{formatDate(post.pub_date)}</time>
        </header>

        {heroSrc && (
          <img
            src={heroSrc}
            alt={post.title}
            className="mb-10 w-full rounded-2xl object-cover shadow-lg"
          />
        )}

        <div
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />
      </FadeIn>
    </article>
  );
}