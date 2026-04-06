// src/pages/api/sync.ts
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { syncFallbackToSupabase } from "@/lib/syncFallbackData";

export const prerender = false;

export const POST: APIRoute = async () => {
  try {
    // 1. Fetch blog posts in the Astro server environment
    const blogPosts = await getCollection("blog");

    // 2. Pass the fetched data to the sync function
    const result = await syncFallbackToSupabase(blogPosts);

    if (!result.success) {
      return new Response(JSON.stringify(result), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred on the server.";
    return new Response(
      JSON.stringify({ success: false, errors: [errorMessage], synced: [] }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
