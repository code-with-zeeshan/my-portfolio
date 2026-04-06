// src/components/react/sections/DynamicBlogPreview.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import FadeIn from "@/components/react/FadeIn";
import { cloudinaryPresets } from "@/lib/cloudinary";
//import { getCollection } from "astro:content";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  tags: string[];
  hero_image: string | null;
  published: boolean;
  pub_date: string;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateStr));
}

export default function DynamicBlogPreview() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("published", true)
          .order("pub_date", { ascending: false })
          .limit(3);

        if (!error && data && data.length > 0) {
          setPosts(data);
        }
      } catch {
        // No fallback for blog posts — just show empty state
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <section id="blog" className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <div className="mb-16 flex items-end justify-between">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-widest text-brand-500">Blog</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-900 dark:text-zinc-50">Latest Articles</h2>
              <p className="mt-4 max-w-xl text-zinc-600 dark:text-zinc-400">Thoughts on web development, design, and technology.</p>
            </div>
            <a href="/blog" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:underline">
              View All →
            </a>
          </div>
        </FadeIn>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />)}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, idx) => (
              <FadeIn key={post.id} delay={idx * 0.1}>
                <a
                  href={`/blog/${post.slug}`}
                  className="group block rounded-2xl border border-zinc-200 bg-white overflow-hidden transition-all hover:border-brand-500/30 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {post.hero_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.hero_image.includes("cloudinary")
                          ? cloudinaryPresets.blogHero(post.hero_image)
                          : post.hero_image
                        }
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-medium text-brand-500">{tag}</span>
                      ))}
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-brand-500 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">{post.description}</p>
                    <time className="mt-4 block text-xs text-zinc-500 dark:text-zinc-400">
                      {formatDate(post.pub_date)}
                    </time>
                  </div>
                </a>
              </FadeIn>
            ))}
          </div>
        ) : (
          <FadeIn>
            <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
              <p className="text-zinc-500">Blog posts coming soon! 🚀</p>
            </div>
          </FadeIn>
        )}

        <a href="/blog" className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:underline sm:hidden">
          View All Posts →
        </a>
      </div>
    </section>
  );
}