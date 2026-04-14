// src/components/react/sections/DynamicBlogIndex.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import FadeIn from "@/components/react/FadeIn";
import { cloudinaryPresets } from "@/lib/cloudinary";
import { Skeleton } from "@/components/ui/Skeleton";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  tags: string[];
  hero_image: string | null;
  pub_date: string;
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(new Date(d));
}

export default function DynamicBlogIndex() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id, title, slug, description, tags, hero_image, pub_date")
      .eq("published", true)
      .order("pub_date", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setPosts(data);
        setLoading(false);
      });
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 md:py-24 pt-24 md:pt-32">
      <FadeIn>
        <div className="mb-10 md:mb-16">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-brand-500">Blog</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-900 dark:text-zinc-50">Latest Articles</h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Thoughts on web development, design, and technology.</p>
        </div>
      </FadeIn>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-28" />)}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post, idx) => (
            <FadeIn key={post.id} delay={idx * 0.08}>
              <a
                href={`/blog/${post.slug}`}
                className="group flex gap-6 rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:border-brand-500/30 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                {post.hero_image && (
                  <div className="hidden sm:block w-32 h-24 shrink-0 overflow-hidden rounded-xl">
                    <img
                      src={post.hero_image.includes("cloudinary") ? cloudinaryPresets.blogHero(post.hero_image) : post.hero_image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-full px-2 py-0.5">{tag}</span>
                    ))}
                  </div>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-brand-500 transition-colors">{post.title}</h2>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">{post.description}</p>
                  <time className="mt-3 block text-xs text-zinc-500">{formatDate(post.pub_date)}</time>
                </div>
              </a>
            </FadeIn>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-16 text-center dark:border-zinc-700">
          <p className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">No posts yet 📝</p>
          <p className="text-zinc-500">Blog posts coming soon!</p>
        </div>
      )}
    </section>
  );
}