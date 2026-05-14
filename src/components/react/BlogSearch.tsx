// src/components/react/BlogSearch.tsx
"use client";

import { useState, useEffect } from "react";
import type { BlogPost } from "@/lib/types";

interface BlogSearchProps {
  posts: BlogPost[];
  onFilteredPosts?: (filtered: BlogPost[]) => void;
}

export function BlogSearch({ posts, onFilteredPosts }: BlogSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPosts(posts);
      if (onFilteredPosts) onFilteredPosts(posts);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = posts.filter(post => {
      const titleMatch = post.title.toLowerCase().includes(term);
      const descMatch = post.description.toLowerCase().includes(term);
      const tagsMatch = post.tags.some(tag => tag.toLowerCase().includes(term));
      return titleMatch || descMatch || tagsMatch;
    });

    setFilteredPosts(filtered);
    if (onFilteredPosts) onFilteredPosts(filtered);
  }, [posts, searchTerm, onFilteredPosts]);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search posts..."
          className="flex-1 min-w-[200px] rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 outline-none focus:border-brand-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="rounded-lg px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      {searchTerm && filteredPosts.length === 0 && (
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          No posts found for "{searchTerm}"
        </p>
      )}
    </div>
  );
}
